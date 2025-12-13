'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Settings, Users, Bot, Zap, Save, Loader2, GitBranch, Settings as SettingsIcon, FileText, Calendar, Tag, Code, Workflow, Database, Clock, CheckCircle2, ArrowRight, PlayCircle, MessageSquare, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelExecutionView } from '@/features/ask-panel/components/PanelExecutionView';
import { PanelWorkflowDiagram } from '@/components/panel-workflow-diagram';
import { PanelDesignerLoader } from '@/components/panel-designer-loader';
import type { SavedPanel } from '@/contexts/ask-panel-context';

interface Panel {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  mode: string;
  framework: string;
  suggested_agents: string[];
  default_settings: Record<string, any>;
  metadata: Record<string, any>;
  agents: Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
    category: string;
    specializations: string[];
    avatar?: string;
    tier?: number;
  }>;
  created_at: string;
  updated_at: string;
}

// Metadata Display Component - Clean, UI-friendly metadata display with panel steps
function MetadataDisplay({ metadata }: { metadata: Record<string, any> }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">null</span>;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic">Empty array</span>;
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="ml-4 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="font-medium text-muted-foreground">{k}:</span>{' '}
              {renderValue(k, v)}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('modified')) {
      return <span className="text-sm">{formatDate(String(value))}</span>;
    }
    
    return <span className="text-sm">{String(value)}</span>;
  };

  const getIcon = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('tag')) return <Tag className="w-4 h-4" />;
    if (keyLower.includes('workflow')) return <Workflow className="w-4 h-4" />;
    if (keyLower.includes('date') || keyLower.includes('time') || keyLower.includes('modified')) return <Clock className="w-4 h-4" />;
    if (keyLower.includes('agent')) return <Users className="w-4 h-4" />;
    if (keyLower.includes('icon')) return <Code className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const isImportantKey = (key: string) => {
    const importantKeys = ['selected_agents', 'workflow_definition', 'panel_type', 'last_modified', 'icon', 'tags', 'popularity'];
    return importantKeys.includes(key);
  };

  // Extract workflow phases and steps
  const workflowDef = metadata.workflow_definition || {};
  const phases = metadata.phases || workflowDef.metadata?.phases || {};
  const nodes = workflowDef.nodes || [];
  const edges = workflowDef.edges || [];
  const phaseNodes = phases.nodes || [];
  const phaseEdges = phases.edges || [];

  // Get node type descriptions
  const getNodeTypeDescription = (type: string, taskId?: string) => {
    const typeMap: Record<string, string> = {
      'start': 'Panel query input',
      'input': 'Panel query input',
      'end': 'Final report output',
      'output': 'Final report output',
      'agent': 'Expert agent response',
      'task': getTaskDescription(taskId || ''),
      'moderator': 'Moderator facilitation',
      'opening_statements': 'Opening statements from experts',
      'discussion_round': 'Moderated discussion round',
      'consensus_calculator': 'Consensus calculation',
      'qna': 'Question & answer session',
      'documentation_generator': 'Documentation generation',
    };
    return typeMap[type] || typeMap[taskId || ''] || `${type} node`;
  };

  const getTaskDescription = (taskId: string) => {
    const taskMap: Record<string, string> = {
      'moderator': 'Moderator facilitates discussion',
      'expert_agent': 'Expert provides analysis',
      'opening_statements': 'Experts give opening statements',
      'discussion_round': 'Moderated debate round',
      'consensus_calculator': 'Calculate consensus level',
      'qna': 'Field questions from participants',
      'documentation_generator': 'Generate final documentation',
    };
    return taskMap[taskId] || 'Task execution';
  };

  // Build execution flow from phases
  const buildExecutionFlow = () => {
    if (phaseNodes.length > 0 && phaseEdges.length > 0) {
      // Build flow from phases
      const flow: Array<{ id: string; name: string; description: string; type: string; config?: any }> = [];
      const nodeMap = new Map(phaseNodes.map((n: any) => [n.id, n]));
      const edgeMap = new Map<string, string[]>();
      
      phaseEdges.forEach((e: any) => {
        if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
        edgeMap.get(e.source)!.push(e.target);
      });

      // Find start node (no incoming edges)
      const allTargets = new Set(phaseEdges.map((e: any) => e.target));
      const startNode = phaseNodes.find((n: any) => !allTargets.has(n.id));
      
      if (startNode) {
        const visited = new Set<string>();
        const traverse = (nodeId: string) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          
          const node = nodeMap.get(nodeId) as { id: string; type: string; config?: { taskId?: string } } | undefined;
          if (node) {
            const typeName = node.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            flow.push({
              id: node.id,
              name: typeName,
              description: getNodeTypeDescription(node.type, node.config?.taskId),
              type: node.type,
              config: node.config,
            });
          }

          const targets = edgeMap.get(nodeId) || [];
          targets.forEach(traverse);
        };
        
        traverse(startNode.id);
      }
      
      return flow;
    }
    
    // Fallback: build from nodes and edges
    const flow: Array<{ id: string; name: string; description: string; type: string; config?: any }> = [];
    const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));
    const edgeMap = new Map<string, string[]>();
    
    edges.forEach((e: any) => {
      if (!edgeMap.has(e.source)) edgeMap.set(e.source, []);
      edgeMap.get(e.source)!.push(e.target);
    });

    const allTargets = new Set(edges.map((e: any) => e.target));
    const startNodes = nodes.filter((n: any) => !allTargets.has(n.id) && (n.type === 'start' || n.type === 'input'));
    
    startNodes.forEach((startNode: any) => {
      const visited = new Set<string>();
      const traverse = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = nodeMap.get(nodeId) as any;
        if (node) {
          const taskId = node.config?.task?.id || node.data?.task?.id;
          flow.push({
            id: node.id,
            name: node.label || node.id,
            description: getNodeTypeDescription(node.type, taskId),
            type: node.type,
          });
        }

        const targets = edgeMap.get(nodeId) || [];
        targets.forEach(traverse);
      };
      
      traverse(startNode.id);
    });
    
    return flow;
  };

  const executionFlow = buildExecutionFlow();
  const importantEntries = Object.entries(metadata).filter(([key]) => isImportantKey(key));
  const otherEntries = Object.entries(metadata).filter(([key]) => !isImportantKey(key));

  return (
    <div className="space-y-6">
      {/* Panel Execution Flow - Most Important Section */}
      {executionFlow.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Panel Execution Flow</h3>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border">
            <div className="space-y-4">
              {executionFlow.map((step, idx) => {
                const isLast = idx === executionFlow.length - 1;
                const stepNumber = idx + 1;
                
                return (
                  <div key={step.id} className="flex gap-4">
                    {/* Step Number & Connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                        {stepNumber}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full bg-primary/30 my-2 min-h-[60px]" />
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-background rounded-lg border p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-base">{step.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {step.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {step.description}
                            </p>
                            {step.config && Object.keys(step.config).length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.config.round && (
                                  <Badge variant="secondary" className="text-xs">
                                    Round {step.config.round}
                                  </Badge>
                                )}
                                {step.config.num_questions && (
                                  <Badge variant="secondary" className="text-xs">
                                    {step.config.num_questions} Questions
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {!isLast && (
                            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Key Information Section */}
      {importantEntries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {importantEntries.map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {getIcon(key)}
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
                <div className="pl-6">
                  {key === 'selected_agents' && Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.length > 0 ? (
                        value.map((agentId: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="font-mono text-xs">
                            {agentId.substring(0, 8)}...
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm italic">No agents selected</span>
                      )}
                    </div>
                  ) : key === 'workflow_definition' && typeof value === 'object' ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Nodes: </span>
                        <Badge variant="secondary">{value.nodes?.length || 0}</Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Edges: </span>
                        <Badge variant="secondary">{value.edges?.length || 0}</Badge>
                      </div>
                      {value.name && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Name: </span>
                          <span>{value.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    renderValue(key, value)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Metadata Section */}
      {otherEntries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Additional Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {otherEntries.map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {getIcon(key)}
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
                <div className="pl-6">{renderValue(key, value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON Toggle (for debugging) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          View Raw JSON
        </summary>
        <pre className="mt-2 text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function PanelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowDesignerRef, setWorkflowDesignerRef] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Fetching panel data...');
        const startTime = performance.now();
        
        const response = await fetch(`/api/panels/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ API Error Response:', errorData);
          throw new Error(`Failed to fetch panel data: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setPanel(data.data.panel);
          
          // Note: We'll load the workflow when Designer tab is opened
          // This allows WorkflowDesignerEnhanced to handle the conversion properly
          
          const endTime = performance.now();
          console.log(`✅ Loaded panel in ${(endTime - startTime).toFixed(0)}ms with ${data.data.panel.agents?.length || 0} agents`);
        } else {
          setError(data.error || 'Failed to fetch panel');
        }
      } catch (err) {
        console.error('❌ Error fetching panel:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  const handleSave = async (updatedPanel: any) => {
    if (!panel) return;

    setSaving(true);
    try {
      // If workflow_definition is provided, merge it into metadata
      const metadata = updatedPanel.workflow_definition 
        ? { ...panel.metadata, workflow_definition: updatedPanel.workflow_definition }
        : panel.metadata;

      // Only send real data - no fallbacks or defaults
      const requestBody: any = {
        name: updatedPanel.name || panel.name,
        mode: updatedPanel.mode || panel.mode,
        framework: updatedPanel.framework || panel.framework,
        selected_agents: updatedPanel.selected_agents || [],
        workflow_definition: updatedPanel.workflow_definition || {},
      };

      // Only include optional fields if they have values
      if (updatedPanel.description || panel.description) {
        requestBody.description = updatedPanel.description || panel.description;
      }
      if (updatedPanel.category || panel.category) {
        requestBody.category = updatedPanel.category || panel.category;
      }
      if (Object.keys(metadata).length > 0) {
        requestBody.metadata = metadata;
      }
      if (updatedPanel.custom_settings && Object.keys(updatedPanel.custom_settings).length > 0) {
        requestBody.custom_settings = updatedPanel.custom_settings;
      }

      const response = await fetch(`/api/panels/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let data: any;
      let responseText: string = '';
      try {
        responseText = await response.text();
        console.log('[Frontend] API Response Raw:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          bodyLength: responseText.length,
          bodyPreview: responseText.substring(0, 1000),
          bodyFull: responseText, // Log full body for debugging
        });
        
        if (!responseText || responseText.trim() === '') {
          throw new Error(`Empty response from server (${response.status})`);
        }
        
        if (responseText.trim() === '{}') {
          console.warn('[Frontend] ⚠️ Received empty object {} - this might indicate a serialization issue');
        }
        
        data = JSON.parse(responseText);
        console.log('[Frontend] Parsed data:', data);
      } catch (parseError: any) {
        console.error('❌ Failed to parse API response:', parseError);
        console.error('❌ Response text that failed to parse:', responseText?.substring(0, 500));
        throw new Error(`Invalid server response (${response.status}): ${parseError.message}`);
      }
      
      if (!response.ok) {
        // Extract error message from various possible fields
        const errorMessage = 
          (typeof data?.error === 'string' ? data.error : null) ||
          (typeof data?.details === 'string' ? data.details : null) ||
          (typeof data?.message === 'string' ? data.message : null) ||
          (data?.error && typeof data.error === 'object' ? JSON.stringify(data.error) : null) ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: data?.error,
          details: data?.details,
          message: data?.message,
          debugInfo: data?.debugInfo,
          fullResponse: JSON.stringify(data, null, 2),
        });
        
        throw new Error(errorMessage || `Failed to save panel (${response.status})`);
      }
      
      if (data.success) {
        console.log('✅ Panel saved successfully');
        // Reload panel data to get updated agents
        const reloadResponse = await fetch(`/api/panels/${slug}`);
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          if (reloadData.success) {
            setPanel(reloadData.data.panel);
            console.log(`✅ Reloaded panel with ${reloadData.data.panel.agents?.length || 0} agents`);
          }
        }
        alert('Panel saved successfully!');
      } else {
        const errorMessage = data.error || data.details || 'Failed to save panel';
        console.error('❌ Save failed:', {
          error: data.error,
          details: data.details,
          debugInfo: data.debugInfo,
        });
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('❌ Error saving panel:', err);
      const errorMessage = err?.message || 'Failed to save panel. Please try again.';
      alert(`Failed to save panel: ${errorMessage}`);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Panel</h2>
            <p className="text-red-700 mb-4">{error || 'Panel not found'}</p>
            <Button variant="outline" onClick={() => router.push('/ask-panel')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ask Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const modeColors: Record<string, string> = {
    sequential: 'text-blue-700 bg-blue-100',
    collaborative: 'text-purple-700 bg-purple-100',
    hybrid: 'text-green-700 bg-green-100',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/ask-panel')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ask Panel
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="font-mono">{panel.slug}</Badge>
            <Badge className={modeColors[panel.mode] || 'text-stone-700 bg-stone-100'}>
              {panel.mode}
            </Badge>
            <Badge variant="outline">
              <Bot className="w-3 h-3 mr-1" />
              {panel.agents.length} experts
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-3">
            {panel.name}
          </h1>
          <p className="text-lg text-stone-600">
            {panel.description}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setActiveTab('execution')}
          >
            <Play className="mr-2 h-5 w-5" />
            Run Panel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Agents</p>
                <p className="text-2xl font-bold text-blue-900">{panel.agents.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Mode</p>
                <p className="text-2xl font-bold text-green-900 capitalize">{panel.mode}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Framework</p>
                <p className="text-2xl font-bold text-purple-900">{panel.framework}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Rounds</p>
                <p className="text-2xl font-bold text-orange-900">
                  {panel.default_settings?.maxRounds || 3}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflow" className="data-[state=active]:bg-white">
            <GitBranch className="w-4 h-4 mr-2" />
            Workflow Diagram
          </TabsTrigger>
          <TabsTrigger value="designer" className="data-[state=active]:bg-white">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Designer
          </TabsTrigger>
          <TabsTrigger value="execution" className="data-[state=active]:bg-white">
            <Play className="w-4 h-4 mr-2" />
            Execution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Panel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize">{panel.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Framework</p>
                  <p className="font-medium">{panel.framework}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mode</p>
                  <p className="font-medium capitalize">{panel.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expert Count</p>
                  <p className="font-medium">{panel.agents.length} experts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Agents ({panel.agents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {panel.agents.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {agent.avatar ? (
                          <img 
                            src={agent.avatar} 
                            alt={agent.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-base">{agent.display_name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {agent.description || 'Expert agent'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {panel.metadata && Object.keys(panel.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Panel Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetadataDisplay metadata={panel.metadata} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <div className="flex flex-col h-[800px] border rounded-lg overflow-hidden bg-white">
            <PanelDesignerLoader
              panel={panel}
              onSave={handleSave}
              onExecute={(workflow: any) => {
                handleSave({
                  name: panel.name,
                  description: panel.description,
                  category: panel.category,
                  mode: panel.mode,
                  framework: panel.framework,
                  selected_agents: panel.agents.map(a => a.id),
                  default_settings: panel.default_settings,
                  workflow_definition: workflow,
                }).then(() => {
                  setActiveTab('execution');
                });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="designer" className="space-y-4">
          <PanelDesignerLoader
            panel={panel}
            onSave={handleSave}
            onExecute={(workflow: any) => {
              handleSave({
                name: panel.name,
                description: panel.description,
                category: panel.category,
                mode: panel.mode,
                framework: panel.framework,
                selected_agents: panel.agents.map(a => a.id),
                default_settings: panel.default_settings,
                workflow_definition: workflow,
              }).then(() => {
                setActiveTab('execution');
              });
            }}
          />
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          {(() => {
            const savedPanel: SavedPanel = {
              id: panel.id,
              name: panel.name,
              description: panel.description || '',
              category: panel.category,
              mode: panel.mode as any,
              suggestedAgents: panel.agents.map(a => a.name),
              IconComponent: Users,
              purpose: panel.description,
            };
            return (
              <PanelExecutionView
                panel={savedPanel}
                onBack={() => setActiveTab('overview')}
              />
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

