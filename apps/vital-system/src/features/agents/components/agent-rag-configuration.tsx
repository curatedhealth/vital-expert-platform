'use client';

/**
 * Agent RAG Configuration Component
 * Allows users to configure and manage RAG systems for individual agents
 */

import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RAGSystemConfig {
  systemId: string;
  systemType: 'medical' | 'enhanced' | 'hybrid' | 'langchain';
  weight: number;
  filters?: any;
}

interface AgentRAGConfig {
  agentId: string;
  agentName: string;
  ragSystems: RAGSystemConfig[];
  defaultRAG: string;
  knowledgeDomains: string[];
  filterPreferences: unknown;
  priority: number;
  isConfigured?: boolean;
}

interface AgentRAGConfigurationProps {
  agentId?: string;
  onConfigurationUpdate?: (config: AgentRAGConfig) => void;
  className?: string;
}

export const AgentRAGConfiguration: React.FC<AgentRAGConfigurationProps> = ({
  agentId,
  onConfigurationUpdate,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '');
  const [configurations, setConfigurations] = useState<AgentRAGConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<AgentRAGConfig | null>(null);
  const [availableRAGSystems, setAvailableRAGSystems] = useState<RAGSystemConfig[]>([]);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<{
    ragResponse?: {
      sources?: unknown[];
      text?: string;
      confidence?: number;
      sourcesFound?: number;
      ragSystemsUsed?: string[];
      answer?: string;
    };
    processingTime?: number;
  }>({});
  const [testing, setTesting] = useState(false);

  // Computed values for validation
  const totalWeight = currentConfig?.ragSystems.reduce((sum, s) => sum + s.weight, 0) || 0;
  const isValidConfiguration = totalWeight >= 0.99 && totalWeight <= 1.01; // Allow small tolerance

  // Helper functions for RAG system management
  const updateRAGSystemWeight = (systemId: string, weight: number) => {
    handleWeightChange(systemId, weight);
  };
  const addRAGSystem = (systemId: string, systemType: string) => {
    handleAddRAGSystem(systemId, systemType);
  };
  const removeRAGSystem = (systemId: string) => {
    handleRemoveRAGSystem(systemId);
  };

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Load specific agent config when agent changes
  useEffect(() => {
    if (selectedAgent) {
      loadAgentConfiguration(selectedAgent);
    }
  }, [selectedAgent]);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rag/configurations');
      if (response.ok) {
        const data = await response.json();
        setConfigurations(data.configurations || []);
        setAvailableRAGSystems(data.availableRAGSystems || []);
      }
    } catch (error) {
      // console.error('Failed to load configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentConfiguration = async (agentId: string) => {
    try {
      const response = await fetch(`/api/rag/configurations/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConfig(data.configuration);
      }
    } catch (error) {
      // console.error('Failed to load agent configuration:', error);
    }
  };

  const updateConfiguration = async (config: Partial<AgentRAGConfig>) => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await fetch('/api/rag/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          ...config
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConfig(data.configuration);
        onConfigurationUpdate?.(data.configuration);
        await loadConfigurations(); // Refresh the list
      }
    } catch (error) {
      // console.error('Failed to update configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const testRAGSystem = async () => {
    if (!selectedAgent || !testQuery.trim()) return;

    setTesting(true);
    try {
      const response = await fetch('/api/rag/test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          testQuery: testQuery.trim(),
          useMultiRAG: (currentConfig?.ragSystems?.length || 0) > 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data.testResults);
      }
    } catch (error) {
      // console.error('Failed to test RAG system:', error);
    } finally {
      setTesting(false);
    }
  };

  const resetConfiguration = async () => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/rag/configurations/${selectedAgent}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadAgentConfiguration(selectedAgent);
        await loadConfigurations();
      }
    } catch (error) {
      // console.error('Failed to reset configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (systemId: string, weight: number) => {
    if (!currentConfig) return;
    const updatedConfig = {
      ...currentConfig,
      ragSystems: currentConfig.ragSystems.map(system =>
        system.systemId === systemId ? { ...system, weight } : system
      )
    };
    setCurrentConfig(updatedConfig);
  };

  const handleAddRAGSystem = (systemId: string, systemType: string) => {
    if (!currentConfig) return;

    const newSystem: RAGSystemConfig = {
      systemId,
      systemType: systemType as RAGSystemConfig['systemType'],
      weight: 0.1,
      filters: {}
    };

    const updatedConfig = {
      ...currentConfig,
      ragSystems: [...currentConfig.ragSystems, newSystem]
    };

    setCurrentConfig(updatedConfig);
  };

  const handleRemoveRAGSystem = (systemId: string) => {
    if (!currentConfig) return;

    const updatedSystems = currentConfig.ragSystems.filter(s => s.systemId !== systemId);
    const updatedConfig = {
      ...currentConfig,
      ragSystems: updatedSystems
    };

    // Update default if it was the removed system
    if (currentConfig.defaultRAG === systemId && updatedSystems.length > 0) {
      updatedConfig.defaultRAG = updatedSystems[0].systemId;
    }

    setCurrentConfig(updatedConfig);
  };

  const getSystemTypeColor = (systemType: string): string => {
    const colors = {
      'medical': 'bg-blue-100 text-blue-800',
      'enhanced': 'bg-green-100 text-green-800',
      'hybrid': 'bg-purple-100 text-purple-800',
      'langchain': 'bg-orange-100 text-orange-800'
    };
    return colors[systemType as keyof typeof colors] || 'bg-neutral-100 text-neutral-800';
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent RAG Configuration</h2>
          <p className="text-muted-foreground">Configure and manage RAG systems for AI agents</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select agent to configure" />
            </SelectTrigger>
            <SelectContent>
              {configurations.map((config) => (
                <SelectItem key={config.agentId} value={config.agentId}>
                  <div className="flex items-center gap-2">
                    <span>{config.agentName}</span>
                    {config.isConfigured && (
                      <Badge variant="secondary" className="text-xs">Configured</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuration Overview */}
      {selectedAgent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">RAG Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentConfig?.ragSystems.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active systems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Knowledge Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentConfig?.knowledgeDomains.length || 0}</div>
              <p className="text-xs text-muted-foreground">Covered domains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configuration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                isValidConfiguration ? "text-green-600" : "text-red-600"
              )}>
                {isValidConfiguration ? "Valid" : "Invalid"}
              </div>
              <p className="text-xs text-muted-foreground">
                Weight total: {totalWeight.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Configuration Interface */}
      {selectedAgent && currentConfig && (
        <Tabs defaultValue="systems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="systems">RAG Systems</TabsTrigger>
            <TabsTrigger value="domains">Knowledge Domains</TabsTrigger>
            <TabsTrigger value="test">Test & Validate</TabsTrigger>
          </TabsList>

          {/* RAG Systems Configuration */}
          <TabsContent value="systems" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RAG System Configuration</CardTitle>
                <CardDescription>
                  Configure multiple RAG systems and their weights for this agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Systems */}
                <div className="space-y-4">
                  {currentConfig.ragSystems.map((system, index) => (
                    <div key={system.systemId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{system.systemId}</h4>
                          <Badge className={getSystemTypeColor(system.systemType)}>
                            {system.systemType}
                          </Badge>
                          {currentConfig.defaultRAG === system.systemId && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="w-16">Weight:</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={system.weight}
                              onChange={(e) => updateRAGSystemWeight(system.systemId, parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                            <div className="flex-1">
                              <Progress value={system.weight * 100} className="h-2" />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {(system.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newConfig = {
                              ...currentConfig,
                              defaultRAG: system.systemId
                            };
                            setCurrentConfig(newConfig);
                          }}
                          disabled={currentConfig.defaultRAG === system.systemId}
                        >
                          Set Default
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRAGSystem(system.systemId)}
                          disabled={currentConfig.ragSystems.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New System */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add RAG System</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {availableRAGSystems
                      .filter(system => !currentConfig.ragSystems.some((s: any) => s.systemId === system.systemId))
                      .map((system) => (
                        <Button
                          key={system.systemId}
                          variant="outline"
                          onClick={() => addRAGSystem(system.systemId, system.systemType)}
                          className="justify-start"
                        >
                          <Badge className={cn("mr-2", getSystemTypeColor(system.systemType))}>
                            {system.systemType}
                          </Badge>
                          {system.systemId}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Weight Validation */}
                {!isValidConfiguration && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-600">
                      ⚠️ Total weight must equal 1.0. Current total: {totalWeight.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={resetConfiguration}>
                    Reset to Default
                  </Button>
                  <Button
                    onClick={() => updateConfiguration(currentConfig)}
                    disabled={!isValidConfiguration || loading}
                  >
                    {loading ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Domains */}
          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Domains</CardTitle>
                <CardDescription>
                  Configure the knowledge domains this agent specializes in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentConfig.knowledgeDomains.map((domainItem, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {domainItem}
                      <button
                        onClick={() => {
                          const updatedDomains = currentConfig.knowledgeDomains.filter((_, i) => i !== index);
                          setCurrentConfig({ ...currentConfig, knowledgeDomains: updatedDomains });
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Add Knowledge Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter domain (e.g., regulatory_compliance)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newDomain = (e.target as HTMLInputElement).value.trim();
                          if (newDomain && !currentConfig.knowledgeDomains.includes(newDomain)) {
                            setCurrentConfig({
                              ...currentConfig,
                              knowledgeDomains: [...currentConfig.knowledgeDomains, newDomain]
                            });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => updateConfiguration(currentConfig)}
                    disabled={loading}
                  >
                    Save Domains
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test & Validation */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test RAG System</CardTitle>
                <CardDescription>
                  Test the configured RAG systems with a sample query
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Query</Label>
                  <Textarea
                    placeholder="Enter a test query to validate the RAG system..."
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={testRAGSystem}
                  disabled={!testQuery.trim() || testing}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test RAG System'}
                </Button>

                {/* Test Results */}
                {testResults?.ragResponse && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Test Results</h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{testResults.ragResponse.sourcesFound ?? 0}</div>
                        <div className="text-xs text-muted-foreground">Sources Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {((testResults.ragResponse.confidence ?? 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{testResults.processingTime ?? 0}ms</div>
                        <div className="text-xs text-muted-foreground">Processing Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {testResults.ragResponse.ragSystemsUsed?.length ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Systems Used</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm">RAG Systems Used:</h5>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(testResults.ragResponse.ragSystemsUsed ?? []).map((system: string, index: number) => (
                            <Badge key={index} variant="outline">{system}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm">Sample Answer:</h5>
                        <div className="p-3 bg-neutral-50 rounded text-sm">
                          {testResults.ragResponse.answer ?? 'No answer generated'}
                        </div>
                      </div>

                      {(testResults.ragResponse.sources?.length ?? 0) > 0 && (
                        <div>
                          <h5 className="font-medium text-sm">Top Sources:</h5>
                          <div className="space-y-2 mt-1">
                            {(testResults.ragResponse.sources ?? []).map((source: unknown, index: number) => {
                              const src = source as { title?: string; snippet?: string; relevance?: number };
                              return (
                                <div key={index} className="p-2 border rounded text-sm">
                                  <div className="font-medium">{src.title ?? 'Unknown'}</div>
                                  <div className="text-muted-foreground text-xs mt-1">{src.snippet ?? ''}</div>
                                  <div className="text-right text-xs text-blue-600 mt-1">
                                    {((src.relevance ?? 0) * 100).toFixed(0)}% relevance
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No Agent Selected */}
      {!selectedAgent && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
              <p className="text-muted-foreground">Choose an agent from the dropdown above to configure its RAG systems</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentRAGConfiguration;