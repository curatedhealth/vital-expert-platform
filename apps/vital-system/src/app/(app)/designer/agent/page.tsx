'use client';

/**
 * Agent Builder Page
 *
 * Full-featured agent creation, configuration, and lifecycle management.
 * Follows the same layout structure as other views with:
 * - Global top nav bar (inherited from layout)
 * - Contextual sidebar for view-specific controls
 * - Main content area with tabbed capabilities
 *
 * Brand Guidelines V6 compliant
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Upload,
  FileJson,
  FileText,
  Plus,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  PauseCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  Activity,
  RefreshCw,
} from 'lucide-react';

// Import from @vital/ui package (base components)
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Skeleton,
  ScrollArea,
  cn
} from '@vital/ui';

// App-specific components
import { PageHeader } from '@/components/page-header';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';

// Shared agent components (from @vital/ui)
import {
  AgentStatsCard,
  AgentQuickFilters,
  AgentLifecycleCard,
  type QuickStatusFilter as StatusFilter,
  type QuickTierFilter as TierFilter,
  type QuickLevelFilter as LevelFilter,
  type ViewMode,
} from '@vital/ui';

interface ImportResult {
  success: boolean;
  agentName: string;
  error?: string;
}

interface AgentMetrics {
  totalConversations: number;
  avgResponseTime: number;
  successRate: number;
  lastActive: Date | null;
}

export default function AgentBuilderPage() {
  const router = useRouter();
  const { agents, createCustomAgent, updateAgent, deleteAgent, loadAgents, isLoading } = useAgentsStore();

  // State for file upload/import
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // State for sidebar filters (using shared types)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // State for monitoring
  const [selectedAgentForMonitoring, setSelectedAgentForMonitoring] = useState<Agent | null>(null);

  // Load agents on mount
  useEffect(() => {
    if (agents.length === 0) {
      loadAgents(false);
    }
  }, []);

  // Filter agents for monitoring view
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = !searchQuery ||
        (agent.display_name || agent.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

      const matchesTier = tierFilter === 'all' || String(agent.tier) === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [agents, searchQuery, statusFilter, tierFilter]);

  // Custom agents only (for lifecycle management)
  const customAgents = useMemo(() => {
    return filteredAgents.filter(a => a.is_custom);
  }, [filteredAgents]);

  // Agent statistics
  const agentStats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    inactive: agents.filter(a => a.status !== 'active').length, // development, testing, deprecated
    custom: agents.filter(a => a.is_custom).length,
  }), [agents]);

  // Handle file drop for batch import
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  // Handle file selection via input
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await processFiles(files);
    e.target.value = '';
  }, []);

  // Process uploaded files
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsImporting(true);
    setImportResults([]);
    const results: ImportResult[] = [];

    for (const file of files) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!['json', 'yaml', 'yml'].includes(fileExtension || '')) {
        results.push({
          success: false,
          agentName: file.name,
          error: 'Unsupported file format. Use JSON or YAML.'
        });
        continue;
      }

      try {
        const content = await file.text();
        let agentData: any;

        if (fileExtension === 'json') {
          agentData = JSON.parse(content);
        } else {
          agentData = parseYamlLike(content);
        }

        const agentsArray = Array.isArray(agentData) ? agentData : [agentData];

        for (const agent of agentsArray) {
          if (!agent.name && !agent.display_name) {
            results.push({
              success: false,
              agentName: 'Unknown',
              error: 'Agent must have a name or display_name field.'
            });
            continue;
          }

          const newAgent: Agent = {
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: agent.name || agent.display_name,
            display_name: agent.display_name || agent.name,
            description: agent.description || 'Imported agent',
            system_prompt: agent.system_prompt || agent.systemPrompt || 'You are a helpful AI assistant.',
            model: agent.model || 'gpt-4',
            avatar: agent.avatar || '/icons/png/avatars/avatar_0001.png',
            color: agent.color || 'text-purple-600',
            capabilities: agent.capabilities || [],
            rag_enabled: agent.rag_enabled ?? true,
            temperature: agent.temperature ?? 0.7,
            max_tokens: agent.max_tokens || agent.maxTokens || 2000,
            is_custom: true,
            status: 'active' as const,
            tier: agent.tier || 1,
            priority: agent.priority || 1,
            implementation_phase: agent.implementation_phase || 1,
            knowledge_domains: agent.knowledge_domains || agent.knowledgeDomains || [],
          };

          try {
            createCustomAgent(newAgent);
            results.push({
              success: true,
              agentName: newAgent.display_name || newAgent.name,
            });
          } catch (err: any) {
            results.push({
              success: false,
              agentName: newAgent.display_name || newAgent.name,
              error: err.message || 'Failed to create agent'
            });
          }
        }
      } catch (err: any) {
        results.push({
          success: false,
          agentName: file.name,
          error: err.message || 'Failed to parse file'
        });
      }
    }

    setImportResults(results);
    setShowResults(true);
    setIsImporting(false);
    loadAgents(false);
  };

  // Simple YAML parser
  const parseYamlLike = (content: string): any => {
    const lines = content.split('\n');
    const result: Record<string, any> = {};
    let currentKey = '';
    let currentArray: string[] = [];
    let inArray = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('- ')) {
        if (inArray) {
          currentArray.push(trimmed.substring(2).trim());
        }
        continue;
      }

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        if (inArray && currentKey) {
          result[currentKey] = currentArray;
          currentArray = [];
          inArray = false;
        }

        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (value) {
          result[key] = value.replace(/^["']|["']$/g, '');
        } else {
          currentKey = key;
          inArray = true;
        }
      }
    }

    if (inArray && currentKey) {
      result[currentKey] = currentArray;
    }

    return result;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAgentCreated = () => {
    loadAgents(false);
  };

  // Lifecycle management actions (accept minimal agent data for compatibility with AgentLifecycleCard)
  const handleActivateAgent = async (agent: { id: string }) => {
    try {
      await updateAgent(agent.id, { status: 'active' });
      loadAgents(false);
    } catch (error) {
      console.error('Failed to activate agent:', error);
    }
  };

  const handleDeactivateAgent = async (agent: { id: string }) => {
    try {
      await updateAgent(agent.id, { status: 'deprecated' });
      loadAgents(false);
    } catch (error) {
      console.error('Failed to deactivate agent:', error);
    }
  };

  const handleDeleteAgentPermanently = async (agent: { id: string; display_name?: string; name: string }) => {
    if (confirm(`Are you sure you want to permanently delete "${agent.display_name || agent.name}"? This action cannot be undone.`)) {
      try {
        deleteAgent(agent.id);
        loadAgents(false);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const successCount = importResults.filter(r => r.success).length;
  const failCount = importResults.filter(r => !r.success).length;

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <PauseCircle className="h-4 w-4 text-stone-400" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
      {/* Page Header */}
      <PageHeader
        icon={Bot}
        title="Agent Builder"
        description="Create, import, configure, and manage AI agent lifecycle"
      />

        {/* Main Content with Tabs */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-stone-100">
              <TabsTrigger value="create" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </TabsTrigger>
              <TabsTrigger value="configure" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            {/* Create Agent Tab */}
            <TabsContent value="create" className="mt-6">
              <div className="max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-stone-800">Create New Agent</CardTitle>
                    <CardDescription>
                      Define a new AI agent with custom personality, capabilities, and behavior.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AgentCreator
                      onSubmit={(data) => {
                        const newAgent: Agent = {
                          id: `custom-${Date.now()}`,
                          name: data.name,
                          display_name: data.name,
                          description: data.description,
                          system_prompt: data.systemPrompt,
                          model: data.model || 'gpt-4',
                          avatar: '/icons/png/avatars/avatar_0001.png',
                          color: 'text-purple-600',
                          capabilities: [],
                          rag_enabled: true,
                          temperature: data.temperature ?? 0.7,
                          max_tokens: 2000,
                          is_custom: true,
                          status: 'active' as const,
                          tier: 1,
                          priority: 1,
                          implementation_phase: 1,
                          knowledge_domains: [],
                        };
                        createCustomAgent(newAgent);
                        handleAgentCreated();
                      }}
                      onCancel={() => router.push('/agents')}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import" className="mt-6">
              <div className="max-w-3xl space-y-6">
                {/* Import Results */}
                {showResults && importResults.length > 0 && (
                  <Alert className={cn(
                    "border-l-4",
                    failCount === 0 ? "border-l-green-500 bg-green-50" :
                    successCount === 0 ? "border-l-red-500 bg-red-50" :
                    "border-l-yellow-500 bg-yellow-50"
                  )}>
                    <AlertTitle className="flex items-center gap-2">
                      {failCount === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      Import Complete
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        {successCount} agent{successCount !== 1 ? 's' : ''} imported successfully
                        {failCount > 0 && `, ${failCount} failed`}
                      </p>
                      {failCount > 0 && (
                        <ul className="text-sm space-y-1">
                          {importResults.filter(r => !r.success).map((r, i) => (
                            <li key={i} className="text-red-600">
                              {r.agentName}: {r.error}
                            </li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Drop Zone */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-stone-800">Batch Import Agents</CardTitle>
                    <CardDescription>
                      Upload JSON or YAML files containing agent definitions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                        isDragging
                          ? "border-purple-500 bg-purple-50"
                          : "border-stone-300 hover:border-purple-400 hover:bg-stone-50"
                      )}
                    >
                      {isImporting ? (
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                          <p className="text-stone-600">Importing agents...</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center gap-4 mb-4">
                            <FileJson className="h-12 w-12 text-stone-400" />
                            <FileText className="h-12 w-12 text-stone-400" />
                          </div>
                          <p className="text-lg font-medium text-stone-700 mb-2">
                            Drag and drop files here
                          </p>
                          <p className="text-stone-500 mb-4">or click to select files</p>
                          <input
                            type="file"
                            multiple
                            accept=".json,.yaml,.yml"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Files
                          </Button>
                          <p className="text-sm text-stone-400 mt-4">
                            Supported formats: JSON, YAML
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Example Format */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-stone-800">File Format Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-stone-700 mb-2">JSON</h4>
                      <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "Medical Research Analyst",
  "description": "Expert in medical literature analysis",
  "system_prompt": "You are an expert medical researcher...",
  "model": "gpt-4",
  "temperature": 0.7,
  "tier": 2
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Configure Tab */}
            <TabsContent value="configure" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-stone-800">Agent Configuration</CardTitle>
                    <CardDescription>
                      Advanced configuration options for your agents.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-stone-500">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                      <p>Select an agent from the monitoring tab to configure advanced settings.</p>
                      <p className="text-sm mt-2">Including model parameters, RAG settings, and more.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="mt-6">
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <AgentStatsCard stats={agentStats} variant="full" />
                </div>

                {/* Lifecycle Management Header with Filters */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-800">Agent Lifecycle Management</h2>
                    <p className="text-sm text-stone-500">
                      Monitor and manage agent status, performance, and lifecycle.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <AgentQuickFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      statusFilter={statusFilter}
                      onStatusChange={setStatusFilter}
                      tierFilter={tierFilter}
                      onTierChange={setTierFilter}
                      levelFilter={levelFilter}
                      onLevelChange={setLevelFilter}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      showViewToggle
                    />
                    <Button
                      variant="outline"
                      onClick={() => loadAgents(false)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Agent List for Lifecycle Management - Using shared component */}
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                      <p className="text-stone-500">No agents match your filters.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className={cn(
                      viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-3"
                    )}>
                      {filteredAgents.map((agent) => {
                        // Map status to lifecycle card expected format
                        const lifecycleStatus = agent.status === 'active' ? 'active'
                          : agent.status === 'deprecated' ? 'inactive'
                          : 'draft'; // development, testing → draft
                        return (
                          <AgentLifecycleCard
                            key={agent.id}
                            agent={{ ...agent, status: lifecycleStatus }}
                            onActivate={handleActivateAgent}
                            onDeactivate={handleDeactivateAgent}
                            onDelete={handleDeleteAgentPermanently}
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
