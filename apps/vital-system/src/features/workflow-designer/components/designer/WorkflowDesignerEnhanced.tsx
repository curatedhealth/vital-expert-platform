/**
 * Enhanced Workflow Designer Component
 * 
 * Modern workflow designer with integrated AI Chatbot and advanced features
 * Migrated from WorkflowBuilder (legacy) to provide a unified experience
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  MessageCircle,
  X,
  Settings,
  Layout as LayoutIcon,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { NodePalette } from '../palette/NodePalette';
import { PropertyPanel } from '../properties/PropertyPanel';
import { WorkflowNode as CustomWorkflowNode } from '../nodes/WorkflowNode';
import { EnhancedWorkflowToolbar } from './EnhancedWorkflowToolbar';
import { getNodeTypeDefinition } from '../../constants/node-types';
import { validateWorkflow } from '../../utils/validation';
import { autoLayoutWorkflow } from '../../utils/layout';
import { AIChatbot, ChatMessage } from '@/components/langgraph-gui/AIChatbot';
import { apiEndpoints, setApiBaseUrl } from '@/lib/langgraph-gui/config/api';
import { expertIdentityManager } from '@/lib/langgraph-gui/expertIdentity';
import { createDefaultPanelWorkflow, getAvailablePanelTypes } from '@/components/langgraph-gui/panel-workflows';

import type { 
  WorkflowDefinition,
  WorkflowNode,
  NodeConfig,
  NodeType,
  ValidationResult,
} from '../../types/workflow';

// Custom node types for React Flow - defined outside component to prevent recreation
// Using Object.freeze to ensure the object reference never changes
const nodeTypes = Object.freeze({
  workflowNode: CustomWorkflowNode,
});

interface ApiKeys {
  openai: string;
  pinecone: string;
  provider: 'openai' | 'ollama';
  ollama_base_url: string;
  ollama_model: string;
}

interface WorkflowDesignerEnhancedProps {
  initialWorkflow?: WorkflowDefinition;
  mode?: 'editor' | 'viewer';
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflow: WorkflowDefinition) => void;
  className?: string;
  apiBaseUrl?: string;
  embedded?: boolean;
  initialApiKeys?: Partial<ApiKeys>;
}

export function WorkflowDesignerEnhanced({
  initialWorkflow,
  mode = 'editor',
  onSave,
  onExecute,
  className,
  apiBaseUrl,
  embedded = false,
  initialApiKeys,
}: WorkflowDesignerEnhancedProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Set API base URL if provided
  useEffect(() => {
    if (apiBaseUrl) {
      setApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);
  
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

  // AI Chatbot state
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('workflow_api_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          openai: parsed.openai || '',
          pinecone: parsed.pinecone || '',
          provider: parsed.provider || 'openai',
          ollama_base_url: parsed.ollama_base_url || 'http://localhost:11434',
          ollama_model: parsed.ollama_model || 'qwen3:4b',
        };
      } catch (e) {
        return { 
          openai: '', 
          pinecone: '',
          provider: 'openai',
          ollama_base_url: 'http://localhost:11434',
          ollama_model: 'qwen3:4b',
        };
      }
    }
    return { 
      openai: initialApiKeys?.openai || '', 
      pinecone: initialApiKeys?.pinecone || '',
      provider: (initialApiKeys?.provider as 'openai' | 'ollama') || 'openai',
      ollama_base_url: initialApiKeys?.ollama_base_url || 'http://localhost:11434',
      ollama_model: initialApiKeys?.ollama_model || 'qwen3:4b',
    };
  });

  // Panel workflow state
  const [showPanelDialog, setShowPanelDialog] = useState(false);
  const [selectedPanelType, setSelectedPanelType] = useState<string>('');

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

  // Handle node deletion
  const onNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      saveToUndoStack();
      if (selectedNode && deleted.some(n => n.id === selectedNode.id)) {
        setSelectedNode(null);
      }
      setIsDirty(true);
    },
    [selectedNode, saveToUndoStack]
  );

  // Handle edge deletion
  const onEdgesDelete: OnEdgesDelete = useCallback(
    () => {
      saveToUndoStack();
      setIsDirty(true);
    },
    [saveToUndoStack]
  );

  // Handle property changes - accepts partial config updates
  const handlePropertyChange = useCallback((nodeId: string, configUpdate: Partial<NodeConfig> | { label?: string }) => {
    saveToUndoStack();
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data };
          
          // Handle label update separately (it's not in config)
          if ('label' in configUpdate && configUpdate.label !== undefined) {
            updatedData.label = configUpdate.label;
          }
          
          // Merge config updates
          if (Object.keys(configUpdate).some(key => key !== 'label')) {
            updatedData.config = {
              ...updatedData.config,
              ...configUpdate,
            };
            // Remove label from config if it was mistakenly included
            delete (updatedData.config as any).label;
          }
          
          // Update selectedNode state if this is the selected node
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedData as WorkflowNode);
          }
          
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
    setIsDirty(true);
  }, [setNodes, saveToUndoStack, selectedNode]);

  // Auto-layout
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    saveToUndoStack();
    
    // Convert to workflow format
    const workflowNodes = nodes.map(n => n.data as WorkflowNode);
    const workflowEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
      label: e.label as string | undefined,
    }));
    
    const layoutedNodes = autoLayoutWorkflow(workflowNodes, workflowEdges);
    
    // Update nodes with new positions
    setNodes((nds) =>
      nds.map((node) => {
        const layoutedNode = layoutedNodes.find(n => n.id === node.id);
        if (layoutedNode) {
          return { ...node, position: layoutedNode.position };
        }
        return node;
      })
    );
  }, [nodes, edges, setNodes, saveToUndoStack]);

  // Save workflow
  const handleSaveWorkflow = useCallback(async () => {
    const workflowNodes = nodes.map(n => n.data as WorkflowNode);
    const workflowEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
      label: e.label as string | undefined,
    }));

    const workflow: WorkflowDefinition = {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      name: initialWorkflow?.name || 'Untitled Workflow',
      description: initialWorkflow?.description || '',
      version: (initialWorkflow?.version || 0) + 1,
      nodes: workflowNodes,
      edges: workflowEdges,
      createdAt: initialWorkflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSave) {
      onSave(workflow);
    }

    setIsDirty(false);
    
    // Add success message
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: `Workflow saved successfully! Version ${workflow.version}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
    });
  }, [nodes, edges, initialWorkflow, onSave]);

  // Execute workflow
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    
    const workflowNodes = nodes.map(n => n.data as WorkflowNode);
    const workflowEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
      label: e.label as string | undefined,
    }));

    const workflow: WorkflowDefinition = {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      name: initialWorkflow?.name || 'Untitled Workflow',
      description: initialWorkflow?.description || '',
      version: initialWorkflow?.version || 1,
      nodes: workflowNodes,
      edges: workflowEdges,
      createdAt: initialWorkflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add execution start message
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: `Starting workflow execution...`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
    });

    if (onExecute) {
      onExecute(workflow);
    }

    // Simulate execution (replace with actual API call)
    setTimeout(() => {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `Workflow execution completed successfully!`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'success',
      });
      setIsExecuting(false);
    }, 2000);
  }, [nodes, edges, initialWorkflow, onExecute, isExecuting]);

  // Load panel workflow
  const handleLoadPanelWorkflow = useCallback(async (panelType: string) => {
    try {
      const panelWorkflow = await createDefaultPanelWorkflow(panelType);
      
      if (panelWorkflow) {
        saveToUndoStack();
        
        // Convert workflow to React Flow format
        const newNodes = panelWorkflow.nodes.map(node => ({
          id: node.id,
          type: 'workflowNode',
          position: node.position,
          data: node,
        }));
        
        const newEdges = panelWorkflow.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type === 'conditional' ? 'step' : 'default',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          label: edge.label,
        }));
        
        setNodes(newNodes);
        setEdges(newEdges);
        setIsDirty(true);
        
        addMessage({
          id: `msg-${Date.now()}`,
          role: 'log',
          content: `Loaded ${panelType} panel workflow successfully!`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
        });
      }
    } catch (error) {
      console.error('Error loading panel workflow:', error);
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `Failed to load panel workflow: ${error}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      });
    }
    
    setShowPanelDialog(false);
  }, [setNodes, setEdges, saveToUndoStack]);

  // Chat handlers
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim() || isExecuting) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    addMessage(userMessage);
    setChatInput('');
    setIsExecuting(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I understand you want to: "${chatInput}". Let me help you with that workflow design.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      addMessage(aiMessage);
      setIsExecuting(false);
    }, 1000);
  }, [chatInput, isExecuting, addMessage]);

  const handleResetChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Save API keys
  const handleSaveSettings = useCallback(() => {
    localStorage.setItem('workflow_api_keys', JSON.stringify(apiKeys));
    setShowSettings(false);
    
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: 'API keys saved successfully!',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
    });
  }, [apiKeys, addMessage]);

  return (
    <div className={`flex h-full w-full gap-2 ${className}`}>
      {/* Main Workflow Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Toolbar with integrated features */}
          <EnhancedWorkflowToolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAutoLayout={handleAutoLayout}
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
            onSettings={() => setShowSettings(true)}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            isDirty={isDirty}
            isExecuting={isExecuting}
            hasNodes={nodes.length > 0}
            onLoadPanelWorkflow={handleLoadPanelWorkflow}
            availablePanelTypes={getAvailablePanelTypes()}
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />

          {/* React Flow Canvas */}
          <div ref={reactFlowWrapper} className="flex-1 relative">
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
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </Card>
      </div>

      {/* Right Sidebar - Node Palette & Properties */}
      <div className="w-80 flex flex-col gap-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Node Palette</h3>
          <NodePalette />
        </Card>
        
        {selectedNode && (
          <Card className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Properties</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PropertyPanel
              selectedNode={selectedNode}
              onUpdate={handlePropertyChange}
              onClose={() => setSelectedNode(null)}
            />
          </Card>
        )}
      </div>

      {/* AI Chatbot Panel - Collapsible */}
      {showChat && (
        <div className="w-96 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b p-3 bg-muted/50">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <h3 className="font-semibold text-sm">AI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChatbot
                messages={messages}
                input={chatInput}
                isLoading={isExecuting}
                onInputChange={setChatInput}
                onSubmit={handleChatSubmit}
                onReset={handleResetChat}
                placeholder="Ask me about workflow design..."
                emptyState={
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="font-semibold mb-2">AI Workflow Assistant</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask me to help design, optimize, or execute your workflows.
                    </p>
                  </div>
                }
              />
            </div>
          </Card>
        </div>
      )}

      {/* Floating Chat Toggle (when hidden) */}
      {!showChat && (
        <Button
          variant="default"
          size="sm"
          className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure API keys and AI provider settings for workflow execution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={apiKeys.provider}
                onValueChange={(value) =>
                  setApiKeys({ ...apiKeys, provider: value as 'openai' | 'ollama' })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {apiKeys.provider === 'openai' && (
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
            )}

            {apiKeys.provider === 'ollama' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ollama-url">Ollama Base URL</Label>
                  <Input
                    id="ollama-url"
                    value={apiKeys.ollama_base_url}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, ollama_base_url: e.target.value })
                    }
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ollama-model">Ollama Model</Label>
                  <Input
                    id="ollama-model"
                    value={apiKeys.ollama_model}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, ollama_model: e.target.value })
                    }
                    placeholder="qwen3:4b"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="pinecone-key">Pinecone API Key (Optional)</Label>
              <Input
                id="pinecone-key"
                type="password"
                value={apiKeys.pinecone}
                onChange={(e) => setApiKeys({ ...apiKeys, pinecone: e.target.value })}
                placeholder="pc-..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

