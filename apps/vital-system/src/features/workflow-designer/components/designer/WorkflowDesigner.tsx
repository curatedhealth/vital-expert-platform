/**
 * Workflow Designer Component
 * 
 * Main visual workflow designer with drag-and-drop, properties, and validation
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionLineType,
  Panel,
  NodeMouseHandler,
  OnConnect,
  OnNodesDelete,
  OnEdgesDelete,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Play, 
  Undo, 
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  AlertCircle,
} from 'lucide-react';
import { NodePalette } from '../palette/NodePalette';
import { PropertyPanel } from '../properties/PropertyPanel';
import { WorkflowNode as CustomWorkflowNode } from '../nodes/WorkflowNode';
import { getNodeTypeDefinition } from '../../constants/node-types';
import { validateWorkflow } from '../../utils/validation';
import type { 
  WorkflowDefinition,
  WorkflowNode,
  NodeConfig,
  NodeType,
  ValidationResult,
} from '../../types/workflow';

// Custom node types for React Flow - using Object.freeze to prevent recreation
const nodeTypes = Object.freeze({
  workflowNode: CustomWorkflowNode,
});

interface WorkflowDesignerProps {
  initialWorkflow?: WorkflowDefinition;
  mode?: 'editor' | 'viewer';
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflow: WorkflowDefinition) => void;
  className?: string;
}

export function WorkflowDesigner({
  initialWorkflow,
  mode = 'editor',
  onSave,
  onExecute,
  className,
}: WorkflowDesignerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Convert workflow definition to React Flow nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow?.nodes.map(node => ({
      id: node.id,
      type: 'workflowNode',
      position: node.position,
      data: {
        ...node,
        type: node.type,
        label: node.label,
        config: node.config,
      },
    })) || []
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow?.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === 'conditional' ? 'step' : 'default',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      label: edge.label,
    })) || []
  );

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Save current state to undo stack
  const saveToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev, { nodes, edges }]);
    setRedoStack([]); // Clear redo stack on new action
  }, [nodes, edges]);

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { nodes, edges }]);
    setNodes(prevState.nodes);
    setEdges(prevState.edges);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { nodes, edges }]);
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      });

      const nodeDef = getNodeTypeDefinition(type);
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'workflowNode',
        position,
        data: {
          id: `${type}-${Date.now()}`,
          type,
          label: nodeDef.label,
          config: nodeDef.defaultConfig,
          position,
        },
      };

      saveToUndoStack();
      setNodes((nds) => nds.concat(newNode));
      setIsDirty(true);
    },
    [reactFlowInstance, setNodes, saveToUndoStack]
  );

  // Handle connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      saveToUndoStack();
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'default',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      );
      setIsDirty(true);
    },
    [setEdges, saveToUndoStack]
  );

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node.data as WorkflowNode);
  }, []);

  // Handle node updates
  const handleNodeUpdate = useCallback(
    (nodeId: string, config: Partial<NodeConfig>) => {
      saveToUndoStack();
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  ...config,
                },
              },
            };
          }
          return node;
        })
      );
      setIsDirty(true);
    },
    [setNodes, saveToUndoStack]
  );

  // Handle node deletion
  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      saveToUndoStack();
      setIsDirty(true);
    },
    [saveToUndoStack]
  );

  // Handle edge deletion
  const onEdgesDelete: OnEdgesDelete = useCallback(
    (deleted) => {
      saveToUndoStack();
      setIsDirty(true);
    },
    [saveToUndoStack]
  );

  // Convert React Flow state to Workflow Definition
  const toWorkflowDefinition = useCallback((): WorkflowDefinition => {
    return {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      name: initialWorkflow?.name || 'Untitled Workflow',
      description: initialWorkflow?.description,
      framework: initialWorkflow?.framework || 'langgraph',
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        position: node.position,
        config: node.data.config,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        label: edge.label,
      })),
      config: initialWorkflow?.config || {},
      metadata: initialWorkflow?.metadata,
    };
  }, [nodes, edges, initialWorkflow]);

  // Validate workflow
  const handleValidate = useCallback(() => {
    const workflow = toWorkflowDefinition();
    const result = validateWorkflow(workflow);
    setValidation(result);
    return result;
  }, [toWorkflowDefinition]);

  // Save workflow
  const handleSave = useCallback(() => {
    const validation = handleValidate();
    if (validation.valid) {
      const workflow = toWorkflowDefinition();
      onSave?.(workflow);
      setIsDirty(false);
    }
  }, [handleValidate, toWorkflowDefinition, onSave]);

  // Execute workflow
  const handleExecute = useCallback(() => {
    const validation = handleValidate();
    if (validation.valid) {
      const workflow = toWorkflowDefinition();
      onExecute?.(workflow);
    }
  }, [handleValidate, toWorkflowDefinition, onExecute]);

  // Export workflow
  const handleExport = useCallback(() => {
    const workflow = toWorkflowDefinition();
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    if (typeof document === 'undefined') {
      console.warn('Workflow export is only available in the browser environment.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toWorkflowDefinition]);

  const isViewer = mode === 'viewer';

  return (
    <div className={`flex h-full gap-4 ${className}`}>
      {/* Left Sidebar - Node Palette */}
      {!isViewer && (
        <div className="w-64 flex-shrink-0">
          <NodePalette disabled={isViewer} />
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Toolbar */}
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isViewer ? 'secondary' : 'default'}>
                {isViewer ? 'Viewer' : 'Editor'}
              </Badge>
              {isDirty && <Badge variant="outline">Unsaved Changes</Badge>}
              {validation && !validation.valid && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validation.errors.length} Errors
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isViewer && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <Button variant="ghost" size="sm" onClick={handleValidate}>
                    Validate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </>
              )}
              {onExecute && (
                <Button size="sm" onClick={handleExecute}>
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Canvas */}
        <Card className="flex-1 p-0 overflow-hidden">
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
              minZoom={0.1}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              deleteKeyCode={isViewer ? null : ['Backspace', 'Delete']}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e5e7eb" gap={20} size={1} />
              <Controls showInteractive={!isViewer} />
              <MiniMap
                nodeColor={(node) => {
                  const nodeDef = getNodeTypeDefinition(node.data.type);
                  return nodeDef.color;
                }}
                maskColor="rgba(255, 255, 255, 0.85)"
              />
            </ReactFlow>
          </div>
        </Card>
      </div>

      {/* Right Sidebar - Properties Panel */}
      {!isViewer && (
        <div className="w-80 flex-shrink-0">
          <PropertyPanel
            selectedNode={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
