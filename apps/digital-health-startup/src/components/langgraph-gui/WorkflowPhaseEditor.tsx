import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Trash2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface WorkflowPhaseNode {
  id: string;
  type: string;
  config: Record<string, any>;
}

export interface WorkflowPhaseEdge {
  source: string;
  target: string;
  condition?: string;
}

interface WorkflowPhaseEditorProps {
  panelType: 'structured' | 'open';
  workflowNodes?: WorkflowPhaseNode[];
  workflowEdges?: WorkflowPhaseEdge[];
  onUpdate: (nodes: WorkflowPhaseNode[], edges: WorkflowPhaseEdge[]) => void;
  onClose?: () => void;
}

// Available node types for panel workflows
const AVAILABLE_NODE_TYPES = {
  structured: [
    { id: 'initialize', name: 'Initialize', description: 'Initialize panel and extract tasks' },
    { id: 'opening_statements', name: 'Opening Statements', description: 'Experts provide initial statements' },
    { id: 'discussion_round', name: 'Discussion Round', description: 'Moderated discussion with experts' },
    { id: 'consensus_assessment', name: 'Consensus Assessment', description: 'Assess consensus level and decide next steps' },
    { id: 'qna', name: 'Q&A Session', description: 'Question and answer session with experts' },
    { id: 'consensus_building', name: 'Consensus Building', description: 'Calculate and build consensus' },
    { id: 'documentation', name: 'Documentation', description: 'Generate final report' },
  ],
  open: [
    { id: 'initialize', name: 'Initialize', description: 'Initialize panel and extract tasks' },
    { id: 'opening_round', name: 'Opening Round', description: 'Initial perspectives from experts' },
    { id: 'free_dialogue', name: 'Free Dialogue', description: 'Free-form collaborative discussion' },
    { id: 'theme_clustering', name: 'Theme Clustering', description: 'Identify themes and innovation clusters' },
    { id: 'final_perspectives', name: 'Final Perspectives', description: 'Final perspectives from experts' },
    { id: 'synthesis', name: 'Synthesis', description: 'Final synthesis and report' },
  ],
};

export const WorkflowPhaseEditor: React.FC<WorkflowPhaseEditorProps> = ({
  panelType,
  workflowNodes = [],
  workflowEdges = [],
  onUpdate,
}) => {
  const [nodes, setNodes] = useState<WorkflowPhaseNode[]>(workflowNodes);
  const [edges, setEdges] = useState<WorkflowPhaseEdge[]>(workflowEdges);

  // Initialize with default structure if empty
  useEffect(() => {
    if (workflowNodes.length === 0 && nodes.length === 0) {
      const defaultNodes = AVAILABLE_NODE_TYPES[panelType].map((nt) => ({
        id: nt.id,
        type: nt.id,
        config: {},
      }));
      setNodes(defaultNodes);

      const defaultEdges: WorkflowPhaseEdge[] = [];
      for (let i = 0; i < defaultNodes.length - 1; i++) {
        defaultEdges.push({
          source: defaultNodes[i].id,
          target: defaultNodes[i + 1].id,
        });
      }
      defaultEdges.push({
        source: defaultNodes[defaultNodes.length - 1].id,
        target: 'END',
      });
      setEdges(defaultEdges);
    } else if (workflowNodes.length > 0) {
      setNodes(workflowNodes);
      setEdges(workflowEdges);
    }
  }, [panelType, workflowNodes, workflowEdges]);

  // Sync with parent when nodes/edges change (but not on initial mount)
  useEffect(() => {
    if (nodes.length > 0) {
      onUpdate(nodes, edges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const availableTypes = AVAILABLE_NODE_TYPES[panelType];

  const handleAddNode = () => {
    const newNodeId = `node_${Date.now()}`;
    const newNode: WorkflowPhaseNode = {
      id: newNodeId,
      type: availableTypes[0].id,
      config: {},
    };
    setNodes([...nodes, newNode]);
  };

  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowPhaseNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const handleAddEdge = (source: string, target: string) => {
    if (!edges.find(e => e.source === source && e.target === target)) {
      setEdges([...edges, { source, target }]);
    }
  };

  const handleRemoveEdge = (source: string, target: string) => {
    setEdges(edges.filter(e => !(e.source === source && e.target === target)));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase Nodes Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Phase Nodes</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddNode}
                  className="h-8"
                >
                  <Plus size={14} className="mr-1" />
                  Add Phase
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {nodes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No phases configured. Click "Add Phase" to get started.
                </p>
              ) : (
                nodes.map((node, index) => {
                  const nodeTypeInfo = availableTypes.find(nt => nt.id === node.type);
                  return (
                    <Card key={node.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <GripVertical className="text-muted-foreground cursor-move" size={16} />
                            <Badge variant="secondary" className="min-w-[2rem] justify-center">
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Select
                                value={node.type}
                                onValueChange={(value) => handleUpdateNode(node.id, { type: value })}
                              >
                                <SelectTrigger className="h-8 flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTypes.map(nt => (
                                    <SelectItem key={nt.id} value={nt.id}>
                                      {nt.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {nodeTypeInfo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {nodeTypeInfo.description}
                              </p>
                            )}
                            <Badge variant="outline" className="mt-2 text-xs">
                              {node.id}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveNode(node.id)}
                            title="Remove phase"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Phase Flow Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Phase Flow</CardTitle>
            </CardHeader>
            <CardContent>
              {nodes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Add phase nodes to configure the flow
                </p>
              ) : (
                <div className="space-y-3">
                  {nodes.map((node, index) => {
                    const nextNode = nodes[index + 1];
                    const hasEdge = nextNode && edges.some(e => e.source === node.id && e.target === nextNode.id);
                    const nodeTypeInfo = availableTypes.find(nt => nt.id === node.type);
                    
                    return (
                      <React.Fragment key={node.id}>
                        <div className="flex items-center justify-center">
                          <Card className={cn(
                            "border-2 w-full",
                            hasEdge ? "border-primary" : "border-muted"
                          )}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{index + 1}</Badge>
                                  <span className="font-medium text-sm">
                                    {nodeTypeInfo?.name || node.type}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {node.id}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        {nextNode && (
                          <div className="flex items-center justify-center gap-2">
                            <div className={cn(
                              "flex-1 h-px",
                              hasEdge ? "bg-primary" : "bg-muted"
                            )} />
                            <div className="flex flex-col items-center gap-1">
                              <ArrowDown 
                                size={16} 
                                className={cn(
                                  hasEdge ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                              {hasEdge ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleRemoveEdge(node.id, nextNode.id)}
                                  title="Remove connection"
                                >
                                  <X size={12} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleAddEdge(node.id, nextNode.id)}
                                  title="Add connection"
                                >
                                  <Plus size={12} />
                                </Button>
                              )}
                            </div>
                            <div className={cn(
                              "flex-1 h-px",
                              hasEdge ? "bg-primary" : "bg-muted"
                            )} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {nodes.length > 0 && (
                    <div className="flex items-center justify-center mt-3">
                      <Card className="border-2 border-destructive w-full">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">
                              END
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
