/**
 * Enhanced Workflow Designer Component
 * 
 * Modern workflow designer with integrated AI Chatbot and advanced features
 * Migrated from WorkflowBuilder (legacy) to provide a unified experience
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Box,
  Users,
  Workflow,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import { PropertyPanel } from '../properties/PropertyPanel';
import { WorkflowNode as CustomWorkflowNode } from '../nodes/WorkflowNode';
import { EnhancedWorkflowToolbar } from './EnhancedWorkflowToolbar';
import { WorkflowTestModal } from '../modals/WorkflowTestModal';
import { getNodeTypeDefinition, getNodeTypesByCategory, NODE_PALETTE_CATEGORIES } from '../../constants/node-types';
import { validateWorkflow } from '../../utils/validation';
import { autoLayoutWorkflow } from '../../utils/layout';
import { AIChatbot, ChatMessage } from '@/components/langgraph-gui/AIChatbot';
import { apiEndpoints, setApiBaseUrl } from '@/lib/langgraph-gui/config/api';
import { expertIdentityManager } from '@/lib/langgraph-gui/expertIdentity';
import { createDefaultPanelWorkflow, getAvailablePanelTypes, PANEL_CONFIGS } from '@/components/langgraph-gui/panel-workflows';
import { V0NodeGeneratorModal } from '../modals/V0NodeGeneratorModal';

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
}) as const;

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
  const router = useRouter();
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

  // AI Chatbot state - collapsed by default
  const [showChat, setShowChat] = useState(false);
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
  const [currentPanelType, setCurrentPanelType] = useState<string | null>(null);
  const [showCodeView, setShowCodeView] = useState(false);
  const [workflowCode, setWorkflowCode] = useState<string>('');
  const [showTestModal, setShowTestModal] = useState(false);
  
  // Save panel dialog state
  const [showSavePanelDialog, setShowSavePanelDialog] = useState(false);
  const [panelName, setPanelName] = useState('');
  const [panelDescription, setPanelDescription] = useState('');
  const [isSavingPanel, setIsSavingPanel] = useState(false);
  
  // v0 AI Generator state
  const [showV0Generator, setShowV0Generator] = useState(false);

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
    
    // autoLayoutWorkflow expects React Flow Node[] and Edge[], not WorkflowNode[]
    const layoutedNodes = autoLayoutWorkflow(nodes, edges);
    
    // Update nodes with new positions
    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes, saveToUndoStack]);

  // Chat handlers - defined early so other functions can use them
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Extract agent IDs from workflow nodes
  const extractAgentIds = useCallback(() => {
    const agentIds: string[] = [];
    nodes.forEach((node) => {
      // Check both node.data.type and node.type for agent nodes
      const nodeType = node.data?.type || node.type;
      if (nodeType === 'agent' || nodeType === 'expertAgent') {
        // Try multiple paths to find agentId from node.data (React Flow stores everything in data)
        // Use type assertion for dynamic properties not in the type definition
        const nodeData = node.data as any;
        const agentId = nodeData?.config?.agentId || 
                        nodeData?.expertConfig?.id ||
                        nodeData?.agentId;
        if (agentId && typeof agentId === 'string' && agentId.trim() && !agentIds.includes(agentId)) {
          agentIds.push(agentId);
        }
      }
    });
    console.log('[WorkflowDesigner] Extracted agent IDs:', agentIds, 'from', nodes.length, 'nodes');
    return agentIds;
  }, [nodes]);

  // Save workflow (opens dialog to save as panel)
  const handleSaveWorkflow = useCallback(() => {
    // Check if workflow has agent nodes
    const agentIds = extractAgentIds();
    
    if (agentIds.length === 0) {
      // If no agents, just save as regular workflow
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
        framework: initialWorkflow?.framework || 'langgraph',
        nodes: workflowNodes,
        edges: workflowEdges,
        config: initialWorkflow?.config || {},
        metadata: {
          ...initialWorkflow?.metadata,
        },
      };

      if (onSave) {
        onSave(workflow);
      }

      setIsDirty(false);
      
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `Workflow saved successfully!`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'success',
      });
    } else {
      // If has agents, open dialog to save as panel
      setPanelName(initialWorkflow?.name || 'My Custom Panel');
      setPanelDescription(initialWorkflow?.description || '');
      setShowSavePanelDialog(true);
    }
  }, [nodes, edges, initialWorkflow, onSave, extractAgentIds, addMessage]);

  // Save panel to Supabase
  const handleSavePanel = useCallback(async () => {
    if (!panelName.trim()) {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: 'Please enter a panel name',
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      });
      return;
    }

    setIsSavingPanel(true);

    try {
      // Build workflow definition
      const workflowNodes = nodes.map(n => n.data as WorkflowNode);
      const workflowEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
        label: e.label as string | undefined,
      }));

      const workflowDefinition: WorkflowDefinition = {
        id: initialWorkflow?.id || `workflow-${Date.now()}`,
        name: panelName.trim(),
        description: panelDescription.trim() || '',
        nodes: workflowNodes,
        edges: workflowEdges,
        framework: 'langgraph',
        config: {},
        metadata: {
          created_via: 'workflow_designer',
          panel_type: currentPanelType || 'custom',
        },
      };

      // Extract agent IDs
      const agentIds = extractAgentIds();

      // Validate that we have at least one agent
      if (agentIds.length === 0) {
        addMessage({
          id: `msg-${Date.now()}`,
          role: 'log',
          content: 'Please add at least one agent node to your workflow before saving as a panel. Select agent nodes and choose an agent from the dropdown.',
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
        });
        setIsSavingPanel(false);
        return;
      }

      // Determine mode based on workflow structure
      let mode: 'sequential' | 'collaborative' | 'hybrid' = 'sequential';
      if (edges.length > nodes.length) {
        mode = 'collaborative';
      } else if (nodes.some(n => n.data?.type === 'parallel')) {
        mode = 'hybrid';
      }

      // Build request payload
      const requestPayload = {
        name: panelName.trim(),
        description: panelDescription.trim() || null,
        category: 'panel',
        base_panel_slug: currentPanelType || null,
        mode,
        framework: 'langgraph',
        selected_agents: agentIds,
        custom_settings: {},
        metadata: {
          created_via: 'workflow_designer',
          node_count: nodes.length,
          edge_count: edges.length,
        },
        workflow_definition: workflowDefinition,
      };

      console.log('[WorkflowDesigner] Saving panel with payload:', {
        ...requestPayload,
        workflow_definition: { ...requestPayload.workflow_definition, nodes: requestPayload.workflow_definition.nodes.length, edges: requestPayload.workflow_definition.edges.length },
      });

      // Save to Supabase
      const response = await fetch('/api/user-panels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        // Get response text first to see what we're dealing with
        const responseText = await response.text();
        let errorData: any = {};
        
        try {
          // Try to parse as JSON
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (e) {
          // Not JSON, use the text as the error message
          console.error('[WorkflowDesigner] Save panel error (non-JSON response):', {
            status: response.status,
            statusText: response.statusText,
            responseText: responseText.substring(0, 500), // Limit length
          });
          throw new Error(`Failed to save panel (${response.status}): ${responseText || response.statusText}`);
        }
        
        console.error('[WorkflowDesigner] Save panel error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          responseText: responseText.substring(0, 500),
        });
        
        // Build a more detailed error message
        let errorMessage = 'Failed to save panel';
        
        // Check for migration required error first
        if (errorData.migration_required || 
            errorData.message?.includes('does not exist') ||
            errorData.message?.includes('Could not find the table')) {
          errorMessage = `Database setup required: ${errorData.message || errorData.details || 'Please run the migration script at scripts/create-user-panels-table.sql in your Supabase SQL Editor to create the user_panels table.'}`;
        } else if (errorData.details) {
          errorMessage = `Failed to save panel: ${errorData.details}`;
        } else if (errorData.message) {
          errorMessage = `Failed to save panel: ${errorData.message}`;
        } else if (errorData.error) {
          errorMessage = `Failed to save panel: ${errorData.error}`;
        } else if (responseText) {
          // Fallback to response text if no structured error
          errorMessage = `Failed to save panel (${response.status}): ${responseText.substring(0, 200)}`;
        } else {
          errorMessage = `Failed to save panel (${response.status}): ${response.statusText}`;
        }
        
        // Add validation errors if present
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += `\nValidation errors: ${errorData.errors.join(', ')}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const savedPanelId = result.panel?.id;

      setIsDirty(false);
      setShowSavePanelDialog(false);
      const savedName = panelName;
      setPanelName('');
      setPanelDescription('');

      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `Panel "${savedName}" saved successfully! You can now use it in Ask Panel.`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'success',
      });

      // Call onSave callback if provided
      if (onSave) {
        onSave(workflowDefinition);
      }

      // Optionally navigate to Ask Panel page to test the saved panel
      // Uncomment the line below if you want automatic navigation
      // if (savedPanelId) {
      //   router.push(`/ask-panel?panelId=${savedPanelId}`);
      // }
    } catch (error: any) {
      console.error('Failed to save panel:', error);
      
      let errorMessage = error.message || 'Failed to save panel';
      
      // If it's a migration required error, provide detailed instructions
      if (error.message?.includes('Database schema not initialized') || 
          error.message?.includes('does not exist')) {
        errorMessage = `❌ Database Setup Required\n\n` +
          `The user_panels table doesn't exist. To fix this:\n\n` +
          `1. Go to: https://supabase.com/dashboard\n` +
          `2. Select your project → SQL Editor → New Query\n` +
          `3. Open: scripts/create-user-panels-table.sql\n` +
          `4. Copy ALL the SQL and paste it into Supabase SQL Editor\n` +
          `5. Click "Run"\n\n` +
          `Or visit: /api/user-panels/migration to get the SQL script.`;
      }
      
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      });
    } finally {
      setIsSavingPanel(false);
    }
  }, [panelName, panelDescription, nodes, edges, currentPanelType, extractAgentIds, onSave, addMessage, router]);

  // Execute workflow
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecuting) return;

    // Validate API keys
    if (!apiKeys.openai && apiKeys.provider === 'openai') {
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `⚠️ Please configure your OpenAI API key in Settings before executing workflows.`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      });
      return;
    }

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
        framework: initialWorkflow?.framework || 'langgraph',
        nodes: workflowNodes,
        edges: workflowEdges,
        config: initialWorkflow?.config || {},
        metadata: initialWorkflow?.metadata,
      };

    // Add execution start message
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: `🚀 Starting workflow execution with ${nodes.length} nodes...`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
    });

    if (onExecute) {
      onExecute(workflow);
    }

    try {
      // Determine if this is a panel workflow
      const isPanelWorkflow = currentPanelType !== null;
      
      let response: Response;
      
      if (isPanelWorkflow) {
        // Execute as panel workflow via LangGraph backend
        const panelWorkflowDefinition = {
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.data.type || 'task',
            taskId: n.data.config?.taskId,
            label: n.data.label,
            position: n.position,
            data: n.data.config,
            expertConfig: n.data.config?.expertConfig,
            parameters: n.data.config?.parameters,
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || 'default',
            label: e.label,
          })),
          metadata: {
            source: 'workflow-designer-enhanced',
            panel_type: currentPanelType,
          },
        };
        
        response = await fetch(`${apiBaseUrl || '/api/langgraph-gui'}/panels/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'Execute workflow', // This would come from user input
            openai_api_key: apiKeys.openai,
            pinecone_api_key: apiKeys.pinecone || '',
            provider: apiKeys.provider || 'openai',
            ollama_base_url: apiKeys.ollama_base_url || 'http://localhost:11434',
            ollama_model: apiKeys.ollama_model || 'qwen3:4b',
            workflow: panelWorkflowDefinition,
            panel_type: currentPanelType,
            user_id: 'user',
          }),
        });
      } else {
        // Execute as regular workflow via database-backed execution
        response = await fetch(`/api/workflows/${workflow.id}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: {},
            streaming: false,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Execution failed: ${errorText}`);
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                  const parsed = JSON.parse(data);
                  
                  // Add streaming message
                  if (parsed.type === 'node_start') {
                    addMessage({
                      id: `msg-${Date.now()}`,
                      role: 'log',
                      content: `▶️ Executing node: ${parsed.node_id}`,
                      timestamp: new Date().toLocaleTimeString(),
                      level: 'info',
                    });
                  } else if (parsed.type === 'node_complete') {
                    addMessage({
                      id: `msg-${Date.now()}`,
                      role: 'log',
                      content: `✅ Completed node: ${parsed.node_id}`,
                      timestamp: new Date().toLocaleTimeString(),
                      level: 'success',
                    });
                  } else if (parsed.type === 'output') {
                    addMessage({
                      id: `msg-${Date.now()}`,
                      role: 'assistant',
                      content: parsed.content,
                      timestamp: new Date().toLocaleTimeString(),
                    });
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const result = await response.json();
        
        if (result.success) {
          addMessage({
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: result.response || result.output || 'Workflow execution completed!',
            timestamp: new Date().toLocaleTimeString(),
          });
          
          addMessage({
            id: `msg-${Date.now()}`,
            role: 'log',
            content: `✅ Workflow execution completed successfully in ${result.processing_time_ms || 0}ms`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
          });
        } else {
          throw new Error(result.error || 'Execution failed');
        }
      }
      
      setIsExecuting(false);
      
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      
      addMessage({
        id: `msg-${Date.now()}`,
        role: 'log',
        content: `❌ Execution failed: ${error.message || error}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
      });
      
      setIsExecuting(false);
    }
  }, [nodes, edges, initialWorkflow, onExecute, isExecuting, apiKeys, currentPanelType, apiBaseUrl]);

  // Load panel workflow
  const handleLoadPanelWorkflow = useCallback(async (panelType: string) => {
    try {
      const panelWorkflow = await createDefaultPanelWorkflow(panelType);
      
      if (panelWorkflow) {
        saveToUndoStack();
        
        // Extract workflow metadata for mode detection
        const workflowMetadata = panelWorkflow.metadata || {};
        
        // Convert legacy workflow nodes to modern React Flow format
        const newNodes = panelWorkflow.nodes.map((node, index) => {
          // Extract task info if it exists
          const taskInfo = node.data?.task;
          const nodeLabel = node.data?.label || taskInfo?.name || node.id;
          
          // Map legacy node types to modern types
          let modernType: NodeType = 'agent';
          if (node.type === 'input') modernType = 'input';
          else if (node.type === 'output') modernType = 'output';
          else if (node.type === 'task') modernType = 'agent';
          else if (node.type === 'orchestrator') modernType = 'orchestrator';
          else if (node.type === 'agent') modernType = 'agent';
          else if (node.type === 'tool') modernType = 'tool';
          else if (node.type === 'condition') modernType = 'condition';
          else if (node.type === 'parallel') modernType = 'parallel';
          
          return {
            id: node.id,
            type: 'workflowNode',
            position: node.position,
            data: {
              id: node.id,
              type: modernType,
              label: nodeLabel,
              position: node.position,
              // Include workflow metadata in the first node for inspection API
              ...(index === 0 ? { workflowMetadata } : {}),
              config: {
                ...node.data,
                ...(taskInfo ? {
                  taskId: taskInfo.id,
                  taskName: taskInfo.name,
                  model: taskInfo.config?.model,
                  temperature: taskInfo.config?.temperature,
                  tools: taskInfo.config?.tools,
                  systemPrompt: taskInfo.config?.systemPrompt,
                } : {}),
              },
              status: 'idle' as const,
            },
          };
        });
        
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
        
        // Set the current panel type so Test Workflow modal knows which mode
        setCurrentPanelType(panelType);
        
        addMessage({
          id: `msg-${Date.now()}`,
          role: 'log',
          content: `Loaded ${panelType} panel workflow with ${newNodes.length} nodes successfully!`,
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

  // addMessage is already defined above

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

  // Export workflow as JSON
  const handleExportWorkflow = useCallback(() => {
    const workflow: WorkflowDefinition = {
      nodes: nodes.map(n => n.data as WorkflowNode),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
        label: e.label as string | undefined,
      })),
      name: initialWorkflow?.name || 'Untitled Workflow',
      description: initialWorkflow?.description || '',
    };

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: 'Workflow exported successfully!',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
    });
  }, [nodes, edges, initialWorkflow, addMessage]);

  // Import workflow from JSON
  const handleImportWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workflow = JSON.parse(e.target?.result as string) as WorkflowDefinition;
            
            saveToUndoStack();
            
            // Convert to React Flow format
            const newNodes = workflow.nodes.map(node => ({
              id: node.id,
              type: 'workflowNode',
              position: node.position,
              data: node,
            }));
            
            const newEdges = workflow.edges.map(edge => ({
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
              content: `Workflow "${workflow.name}" imported successfully!`,
              timestamp: new Date().toLocaleTimeString(),
              level: 'success',
            });
          } catch (error) {
            addMessage({
              id: `msg-${Date.now()}`,
              role: 'log',
              content: `Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
              timestamp: new Date().toLocaleTimeString(),
              level: 'error',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges, saveToUndoStack, addMessage]);

  // Handle v0-generated node addition
  const handleV0NodeGenerated = useCallback((
    nodeDefinition: any,
    previewUrl: string,
    chatId: string
  ) => {
    // Add a message about the successful generation
    addMessage({
      id: `msg-${Date.now()}`,
      role: 'log',
      content: `✨ Custom node generated with v0! Preview: ${previewUrl}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
    });
    
    // In a full implementation, this would add the node to the palette
    // or directly to the canvas. For POC, we just log it.
    console.log('[v0] Node generated:', { nodeDefinition, previewUrl, chatId });
  }, [addMessage]);

  // View workflow code (Python LangGraph)
  const handleViewCode = useCallback(() => {
    const workflow: WorkflowDefinition = {
      nodes: nodes.map(n => n.data as WorkflowNode),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type === 'step' ? ('conditional' as const) : ('default' as const),
        label: e.label as string | undefined,
      })),
      name: initialWorkflow?.name || 'Untitled Workflow',
      description: initialWorkflow?.description || '',
    };

    // Generate Python code
    let code = `"""
${workflow.name}
${workflow.description}

Generated: ${new Date().toLocaleString()}
"""

from langgraph.graph import Graph, StateGraph
from typing import TypedDict, Annotated
import operator

# State definition
class WorkflowState(TypedDict):
    messages: Annotated[list, operator.add]
    context: dict
    result: str

# Initialize graph
workflow = StateGraph(WorkflowState)

`;

    // Add nodes
    workflow.nodes.forEach(node => {
      code += `# Node: ${node.label} (${node.type})\n`;
      code += `def ${node.id}_node(state: WorkflowState) -> WorkflowState:\n`;
      code += `    # ${node.config?.description || 'No description'}\n`;
      code += `    # TODO: Implement node logic\n`;
      code += `    return state\n\n`;
      code += `workflow.add_node("${node.id}", ${node.id}_node)\n\n`;
    });

    // Add edges
    code += `# Define edges\n`;
    workflow.edges.forEach(edge => {
      if (edge.type === 'conditional') {
        code += `workflow.add_conditional_edges(\n`;
        code += `    "${edge.source}",\n`;
        code += `    # TODO: Implement condition function\n`;
        code += `    {"${edge.target}": lambda x: True}\n`;
        code += `)\n`;
      } else {
        code += `workflow.add_edge("${edge.source}", "${edge.target}")\n`;
      }
    });

    code += `\n# Compile and run\napp = workflow.compile()\n`;

    setWorkflowCode(code);
    setShowCodeView(true);
  }, [nodes, edges, initialWorkflow]);

  const detectPanelType = useCallback(() => {
    // Detect if this is a panel workflow
    const hasInput = nodes.some(n => n.data?.type === 'input' || n.id === 'start');
    const hasTaskNodes = nodes.some(n => n.data?.type === 'task' || n.data?.taskId);
    
    if (hasInput && hasTaskNodes) {
      // Try to determine which panel type based on node configuration
      const panelTypes = getAvailablePanelTypes();
      for (const type of panelTypes) {
        const config = PANEL_CONFIGS[type];
        if (config && nodes.length === config.nodes.length) {
          return type;
        }
      }
      return 'custom_panel';
    }
    return null;
  }, [nodes]);

  // Detect and update current panel type whenever nodes change
  useEffect(() => {
    setCurrentPanelType(detectPanelType());
  }, [nodes, detectPanelType]);

  return (
    <div className={`flex h-full w-full gap-2 ${className}`}>
      {/* Left Sidebar - Component Palette, Agent Store, Panel Workflows */}
      <div className="w-64 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="components" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="components" className="text-xs">
                <Box className="h-3 w-3 mr-1" />
                Nodes
              </TabsTrigger>
              <TabsTrigger value="agents" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="panels" className="text-xs">
                <Workflow className="h-3 w-3 mr-1" />
                Panels
              </TabsTrigger>
            </TabsList>

            {/* Components Tab - Node Palette */}
            <TabsContent value="components" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
                  {NODE_PALETTE_CATEGORIES.map((category) => {
                    const categoryNodeTypes = getNodeTypesByCategory(category.id as any);
                    return (
                      <div key={category.id}>
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                          {category.label}
                        </h3>
                        <div className="space-y-1">
                          {categoryNodeTypes.map((nodeType) => {
                            const Icon = nodeType.icon;
                            return (
                              <div
                                key={nodeType.type}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/reactflow', nodeType.type);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                className="flex items-center gap-2 p-2 rounded border cursor-move hover:bg-accent transition-colors"
                                style={{
                                  borderColor: nodeType.borderColor,
                                  backgroundColor: nodeType.bgColor,
                                }}
                              >
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${nodeType.color}20` }}
                                >
                                  <Icon className="w-3 h-3" style={{ color: nodeType.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">
                                    {nodeType.label}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Agent Store Tab */}
            <TabsContent value="agents" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Browse and select AI agents for your workflow
                  </p>
                  {/* Placeholder for agent store integration */}
                  <div className="text-xs text-center text-muted-foreground py-8">
                    Agent store coming soon
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Panel Workflows Tab */}
            <TabsContent value="panels" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Load pre-configured panel workflows
                  </p>
                  <div className="space-y-2">
                    {getAvailablePanelTypes().map((type) => {
                      const config = PANEL_CONFIGS[type];
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleLoadPanelWorkflow(type)}
                        >
                          <div className="flex-1">
                            <div className="text-xs font-medium">
                              {config?.name || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            {config?.description && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                {config.description}
                              </div>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

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
            onTestWorkflow={() => setShowTestModal(true)}
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
            onExportWorkflow={handleExportWorkflow}
            onImportWorkflow={handleImportWorkflow}
            onViewCode={handleViewCode}
            panelType={currentPanelType}
            onOpenV0Generator={() => setShowV0Generator(true)}
            v0Enabled={true}
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
              
              {/* Floating AI Assistant Button */}
              {!showChat && (
                <Panel position="bottom-right" className="mb-4 mr-4">
                  <Button
                    size="lg"
                    onClick={() => setShowChat(true)}
                    className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
                    title="Open AI Assistant"
                  >
                    <Sparkles className="h-6 w-6" />
                  </Button>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </Card>
      </div>

      {/* Right Sidebar - Properties Only */}
      {selectedNode && (
        <div className="w-80 flex flex-col gap-2">
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
        </div>
      )}

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

      {/* Code View Dialog */}
      <Dialog open={showCodeView} onOpenChange={setShowCodeView}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Workflow Code (Python LangGraph)</DialogTitle>
            <DialogDescription>
              Generated Python code for this workflow. Copy this code to implement your workflow in LangGraph.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
              <code>{workflowCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                navigator.clipboard.writeText(workflowCode);
                addMessage({
                  id: `msg-${Date.now()}`,
                  role: 'log',
                  content: 'Code copied to clipboard!',
                  timestamp: new Date().toLocaleTimeString(),
                  level: 'success',
                });
              }}
            >
              Copy Code
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeView(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Test Modal (Legacy-style popup) */}
      <WorkflowTestModal
        open={showTestModal}
        onClose={() => setShowTestModal(false)}
        nodes={nodes}
        edges={edges}
        apiKeys={apiKeys}
        apiBaseUrl={apiBaseUrl}
        panelType={currentPanelType}
      />

      {/* Save Panel Dialog */}
      <Dialog open={showSavePanelDialog} onOpenChange={setShowSavePanelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save as Panel</DialogTitle>
            <DialogDescription>
              Save this workflow as a custom panel that you can use in Ask Panel. The panel will be saved to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="panel-name">Panel Name *</Label>
              <Input
                id="panel-name"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder="e.g., My Custom Expert Panel"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panel-description">Description (Optional)</Label>
              <Textarea
                id="panel-description"
                value={panelDescription}
                onChange={(e) => setPanelDescription(e.target.value)}
                placeholder="Describe what this panel does..."
                rows={3}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">This panel will include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</li>
                <li>{edges.length} connection{edges.length !== 1 ? 's' : ''}</li>
                <li>{extractAgentIds().length} expert agent{extractAgentIds().length !== 1 ? 's' : ''}</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSavePanelDialog(false);
                setPanelName('');
                setPanelDescription('');
              }}
              disabled={isSavingPanel}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSavePanel();
                // Navigate to Ask Panel after saving
                setTimeout(() => {
                  router.push('/ask-panel');
                }, 500);
              }}
              disabled={isSavingPanel || !panelName.trim()}
              variant="outline"
            >
              {isSavingPanel ? 'Saving...' : 'Save & Test'}
            </Button>
            <Button
              onClick={handleSavePanel}
              disabled={isSavingPanel || !panelName.trim()}
            >
              {isSavingPanel ? 'Saving...' : 'Save Panel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* v0 AI Node Generator Modal */}
      <V0NodeGeneratorModal
        open={showV0Generator}
        onOpenChange={setShowV0Generator}
        workflowContext={{
          name: initialWorkflow?.name || 'Untitled Workflow',
          domain: currentPanelType ? 'Panel Workflow' : 'Custom Workflow',
          existingNodes: nodes.map(n => n.data?.type || n.type || 'unknown'),
          currentTask: selectedNode?.label,
        }}
        onNodeGenerated={handleV0NodeGenerated}
        onLog={(message, level) => {
          addMessage({
            id: `msg-${Date.now()}`,
            role: 'log',
            content: message,
            timestamp: new Date().toLocaleTimeString(),
            level,
          });
        }}
      />
    </div>
  );
}

