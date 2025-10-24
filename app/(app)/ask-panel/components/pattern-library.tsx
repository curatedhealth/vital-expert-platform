'use client';

import { Plus, Save, Trash2, Download } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { OrchestrationPattern, PatternNode, PatternEdge } from '@/lib/services/langgraph-orchestrator';

// Built-in patterns (these come from the orchestrator)
const BUILT_IN_PATTERNS: OrchestrationPattern[] = [
  {
    id: 'parallel',
    name: 'Parallel Polling',
    description: 'All experts respond simultaneously',
    icon: '⚡',
    nodes: [
      { id: 'consult', type: 'consult_parallel', label: 'Consult All Experts' },
      { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
    ],
    edges: [
      { from: 'consult', to: 'synthesize' },
      { from: 'synthesize', to: 'END' }
    ],
    config: { maxRounds: 1 }
  },
  {
    id: 'sequential',
    name: 'Sequential Roundtable',
    description: 'Experts respond in sequence, building on each other',
    icon: '🔄',
    nodes: [
      { id: 'consult', type: 'consult_sequential', label: 'Consult Experts Sequentially' },
      { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
    ],
    edges: [
      { from: 'consult', to: 'synthesize' },
      { from: 'synthesize', to: 'END' }
    ],
    config: { maxRounds: 1 }
  },
  {
    id: 'debate',
    name: 'Free Debate',
    description: 'Multi-round discussion with convergence detection',
    icon: '💬',
    nodes: [
      { id: 'consult', type: 'consult_parallel', label: 'Debate Round' },
      { id: 'check_consensus', type: 'check_consensus', label: 'Check Consensus' },
      { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
    ],
    edges: [
      { from: 'consult', to: 'check_consensus' },
      { from: 'check_consensus', to: 'synthesize', condition: 'converged' },
      { from: 'check_consensus', to: 'consult', condition: '!converged' },
      { from: 'synthesize', to: 'END' }
    ],
    config: { maxRounds: 3 }
  },
  {
    id: 'funnel',
    name: 'Funnel & Filter',
    description: 'Breadth → cluster → depth analysis',
    icon: '🔽',
    nodes: [
      { id: 'breadth', type: 'consult_parallel', label: 'Breadth Consultation' },
      { id: 'cluster', type: 'cluster_themes', label: 'Cluster Themes' },
      { id: 'depth', type: 'consult_sequential', label: 'Deep Dive on Themes' },
      { id: 'synthesize', type: 'synthesize', label: 'Synthesize Recommendation' }
    ],
    edges: [
      { from: 'breadth', to: 'cluster' },
      { from: 'cluster', to: 'depth' },
      { from: 'depth', to: 'synthesize' },
      { from: 'synthesize', to: 'END' }
    ],
    config: { maxRounds: 2 }
  }
];

const NODE_TYPES = [
  { value: 'consult_parallel', label: 'Parallel Consultation', icon: '⚡', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'consult_sequential', label: 'Sequential Consultation', icon: '🔄', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'check_consensus', label: 'Check Consensus', icon: '✓', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'cluster_themes', label: 'Cluster Themes', icon: '🎯', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'synthesize', label: 'Synthesize', icon: '📊', color: 'bg-pink-100 text-pink-700 border-pink-300' },
];

export default function PatternLibrary() {
  const { toast } = useToast();
  const [customPatterns, setCustomPatterns] = useState<OrchestrationPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<OrchestrationPattern | null>(null);
  const [_isBuilding, setIsBuilding] = useState(false);

  // Pattern builder state
  const [newPattern, setNewPattern] = useState<Partial<OrchestrationPattern>>({
    id: '',
    name: '',
    description: '',
    icon: '🎯',
    nodes: [],
    edges: [],
    config: { maxRounds: 3 }
  });

  const handleSelectPattern = (pattern: OrchestrationPattern) => {
    setSelectedPattern(pattern);
    setIsBuilding(false);
  };

  const handleCreateNew = () => {
    setIsBuilding(true);
    setSelectedPattern(null);
    setNewPattern({
      id: `custom_${Date.now()}`,
      name: '',
      description: '',
      icon: '🎯',
      nodes: [],
      edges: [],
      config: { maxRounds: 3 }
    });
  };

  const handleAddNode = (type: string) => {
    const nodeId = `node_${(newPattern.nodes?.length || 0) + 1}`;
    const nodeType = NODE_TYPES.find(nt => nt.value === type);

    const newNode: PatternNode = {
      id: nodeId,
      type: type as any,
      label: nodeType?.label || 'New Node'
    };

    setNewPattern(prev => ({
      ...prev,
      nodes: [...(prev.nodes || []), newNode]
    }));
  };

  // TODO: Re-enable when node connection UI is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConnectNodes = (fromId: string, toId: string, condition?: string) => {
    const newEdge: PatternEdge = {
      from: fromId,
      to: toId,
      condition
    };

    setNewPattern(prev => ({
      ...prev,
      edges: [...(prev.edges || []), newEdge]
    }));
  };

  const handleSavePattern = () => {
    if (!newPattern.name || !newPattern.id || !newPattern.nodes || newPattern.nodes.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and add at least one node',
        variant: 'destructive'
      });
      return;
    }

    const completePattern: OrchestrationPattern = {
      id: newPattern.id,
      name: newPattern.name,
      description: newPattern.description || '',
      icon: newPattern.icon || '🎯',
      nodes: newPattern.nodes,
      edges: newPattern.edges || [],
      config: newPattern.config || { maxRounds: 3 }
    };

    setCustomPatterns(prev => [...prev, completePattern]);
    setIsBuilding(false);
    setSelectedPattern(completePattern);
    toast({
      title: 'Pattern Saved',
      description: `Pattern "${completePattern.name}" saved successfully!`,
      variant: 'success'
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNewPattern(prev => ({
      ...prev,
      nodes: prev.nodes?.filter(n => n.id !== nodeId),
      edges: prev.edges?.filter(e => e.from !== nodeId && e.to !== nodeId)
    }));
  };

  const handleExportPattern = (pattern: OrchestrationPattern) => {
    const dataStr = JSON.stringify(pattern, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${pattern.id}_pattern.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orchestration Pattern Library</h1>
          <p className="text-muted-foreground">Create and manage custom advisory board workflows</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Pattern
        </Button>
      </div>

      <Tabs defaultValue="patterns" className="w-full">
        <TabsList>
          <TabsTrigger value="patterns">Pattern Gallery</TabsTrigger>
          <TabsTrigger value="builder">Pattern Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          {/* Built-in Patterns */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Built-In Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUILT_IN_PATTERNS.map((pattern) => (
                <Card
                  key={pattern.id}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    selectedPattern?.id === pattern.id ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => handleSelectPattern(pattern)}
                >
                  <CardHeader>
                    <div className="text-4xl mb-2">{pattern.icon}</div>
                    <CardTitle className="text-sm">{pattern.name}</CardTitle>
                    <CardDescription className="text-xs">{pattern.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {pattern.nodes.length} nodes, {pattern.edges.length} edges
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPattern(pattern);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Patterns */}
          {customPatterns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Custom Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customPatterns.map((pattern) => (
                  <Card
                    key={pattern.id}
                    className={`cursor-pointer hover:shadow-lg transition-all ${
                      selectedPattern?.id === pattern.id ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => handleSelectPattern(pattern)}
                  >
                    <CardHeader>
                      <div className="text-4xl mb-2">{pattern.icon}</div>
                      <CardTitle className="text-sm">{pattern.name}</CardTitle>
                      <CardDescription className="text-xs">{pattern.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                        <div className="text-xs text-muted-foreground">
                          {pattern.nodes.length} nodes, {pattern.edges.length} edges
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPattern(pattern);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Details */}
          {selectedPattern && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPattern.icon}</span>
                  {selectedPattern.name}
                </CardTitle>
                <CardDescription>{selectedPattern.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Workflow Graph</h3>
                  <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-20 h-8 bg-green-100 border border-green-300 rounded flex items-center justify-center text-xs">
                          START
                        </div>
                      </div>

                      {selectedPattern.nodes.map((node) => {
                        const nodeType = NODE_TYPES.find(nt => nt.value === node.type);
                        const outgoingEdges = selectedPattern.edges.filter(e => e.from === node.id);

                        return (
                          <div key={node.id}>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="text-lg">↓</div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <div className={`min-w-32 px-3 py-2 rounded border ${nodeType?.color}`}>
                                <div className="text-xs font-semibold">{nodeType?.icon} {node.label}</div>
                              </div>
                              {outgoingEdges.length > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  {outgoingEdges.map(e => (
                                    <div key={e.to}>{e.condition ? `if ${e.condition} →` : '→'} {e.to}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-lg">↓</div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="w-20 h-8 bg-red-100 border border-red-300 rounded flex items-center justify-center text-xs">
                          END
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Configuration</h3>
                  <div className="text-sm text-muted-foreground">
                    Max Rounds: {selectedPattern.config?.maxRounds || 3}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Custom Pattern</CardTitle>
              <CardDescription>Create your own orchestration workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pattern Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pattern-name" className="text-sm font-medium mb-2 block">Pattern Name</label>
                  <Input
                    id="pattern-name"
                    placeholder="e.g., Expert Jury"
                    value={newPattern.name}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="pattern-icon" className="text-sm font-medium mb-2 block">Icon</label>
                  <Input
                    id="pattern-icon"
                    placeholder="🎯"
                    value={newPattern.icon}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, icon: e.target.value }))}
                    maxLength={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="pattern-description" className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    id="pattern-description"
                    placeholder="Describe how this pattern works..."
                    value={newPattern.description}
                    onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Add Nodes */}
              <div>
                <h3 className="font-semibold mb-3">Add Nodes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {NODE_TYPES.map((nodeType) => (
                    <Button
                      key={nodeType.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNode(nodeType.value)}
                      className="flex items-center gap-2"
                    >
                      <span>{nodeType.icon}</span>
                      <span className="text-xs">{nodeType.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Node List */}
              {newPattern.nodes && newPattern.nodes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Workflow Nodes ({newPattern.nodes.length})</h3>
                  <div className="space-y-2">
                    {newPattern.nodes.map((node) => {
                      const nodeType = NODE_TYPES.find(nt => nt.value === node.type);
                      return (
                        <div key={node.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                          <div className="text-xl">{nodeType?.icon}</div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{node.label}</div>
                            <div className="text-xs text-muted-foreground">ID: {node.id}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex gap-2">
                <Button onClick={handleSavePattern} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Pattern
                </Button>
                <Button variant="outline" onClick={() => setIsBuilding(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
