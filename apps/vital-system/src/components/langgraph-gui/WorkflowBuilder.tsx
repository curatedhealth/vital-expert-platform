import React, { useState, useCallback, useRef, useEffect } from 'react';
import { expertIdentityManager } from '@/lib/langgraph-gui/expertIdentity';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './vital-styles.css';
// App.css removed - using VITAL styles
import { Settings, MessageCircle, X, Maximize2, Sparkles, Layers, Save, Layout, Download, Upload, FileText, FileDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import { TaskDefinition, TASK_DEFINITIONS } from './TaskLibrary';
import { NodePalette } from './NodePalette';
import { TaskNode } from './TaskNode';
import { AgentNode } from './AgentNode';
import { AgentConfigModal } from './AgentConfigModal';
import { TaskFlowModal } from './TaskFlowModal';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { WorkflowCodeView } from './WorkflowCodeView';
import { TaskBuilder } from './TaskBuilder';
import { TaskCombiner } from './TaskCombiner';
import { WorkflowPhaseEditor } from './WorkflowPhaseEditor';
import { autoLayoutWorkflow } from '@/lib/langgraph-gui/workflowLayout';
import { AIChatbot, ChatMessage } from './AIChatbot';
import { apiEndpoints, setApiBaseUrl } from '@/lib/langgraph-gui/config/api';
import { createDefaultPanelWorkflow, getAvailablePanelTypes } from './panel-workflows';
import { Mode1Documentation } from './Mode1Documentation';
import { Mode2Documentation } from './Mode2Documentation';
import { Mode3Documentation } from './Mode3Documentation';
import { Mode4Documentation } from './Mode4Documentation';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';

export interface WorkflowBuilderProps {
  apiBaseUrl?: string;
  initialWorkflowId?: string;
  onWorkflowSave?: (workflowId: string, workflow: any) => void;
  onWorkflowExecute?: (query: string) => void;
  onWorkflowComplete?: (result: any) => void;
  className?: string;
  embedded?: boolean;
  initialApiKeys?: {
    openai?: string;
    pinecone?: string;
    provider?: 'openai' | 'ollama';
    ollama_base_url?: string;
    ollama_model?: string;
  };
}


// Custom Node Components
const OrchestratorNode = ({ data }: { data?: any }) => {
  // Use node's label if available, otherwise default text
  const label = data?.label || '🎯 Orchestrator';
  const description = data?.description || 'Conditional decision node';
  const icon = data?.icon || '🎯';
  
  // Check if this is a conditional decision node (from Mode 1 workflows)
  const isConditionalDecision = data?.phase === 'decision' || data?.condition;
  
  return (
    <div className="orchestrator-node">
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <div className="node-header">{label}</div>
      <div className="node-body">
        {isConditionalDecision ? (
          <>
            <p>{description}</p>
            {data?.condition && (
              <p className="node-status">Condition: {data.condition}</p>
            )}
          </>
        ) : (
          <>
            <p>Core AI brain</p>
            <p className="node-status">Always Active</p>
          </>
        )}
      </div>
    </div>
  );
};

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'log' | 'expert' | 'moderator';
  content: string;
  timestamp: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  name?: string;
  sources?: Array<{ title: string; url: string }>;
  isPhaseStatus?: boolean; // Mark phase/status messages
  reasoning?: string; // Reasoning/thinking process
  isStreaming?: boolean; // Whether content is currently streaming
  expertId?: string; // Unique expert identifier
  expertType?: string; // Expert type (regulatory_expert, clinical_expert, etc.)
  taskTitle?: string; // Task title for Task component
  taskItems?: Array<{ text: string; completed?: boolean; file?: string }>; // Task items
  isTaskActive?: boolean; // Whether task is currently active
}

// Helper to convert Message to ChatMessage
const messageToChatMessage = (msg: Message): ChatMessage => ({
  id: msg.id,
  role: msg.type === 'user' 
    ? 'user' 
    : msg.type === 'expert' 
    ? 'expert'
    : msg.type === 'moderator'
    ? 'moderator'
    : msg.type === 'assistant'
    ? 'assistant'
    : 'log',
  content: msg.content,
  timestamp: msg.timestamp,
  level: msg.level,
  name: msg.name,
  sources: msg.sources,
  isPhaseStatus: msg.isPhaseStatus,
  reasoning: msg.reasoning,
  isStreaming: msg.isStreaming,
  expertId: (msg as any).expertId,
  expertType: (msg as any).expertType,
  taskTitle: (msg as any).taskTitle,
  taskItems: (msg as any).taskItems,
  isTaskActive: (msg as any).isTaskActive,
});

interface ApiKeys {
  openai: string;
  pinecone: string;
  provider: 'openai' | 'ollama';
  ollama_base_url: string;
  ollama_model: string;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ apiBaseUrl, initialWorkflowId, onWorkflowSave, onWorkflowExecute, onWorkflowComplete, className = "", embedded = false, initialApiKeys }) => {
  // Set API base URL if provided
  useEffect(() => {
    if (apiBaseUrl) {
      setApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const saved = localStorage.getItem('pharma_api_keys');
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
      openai: '', 
      pinecone: '',
      provider: 'openai',
      ollama_base_url: 'http://localhost:11434',
      ollama_model: 'qwen3:4b',
    };
  });
  const [showControls, setShowControls] = useState(true);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [taskFlowModal, setTaskFlowModal] = useState<{
    isOpen: boolean;
    taskNodeId: string | null;
    taskName: string;
  }>({
    isOpen: false,
    taskNodeId: null,
    taskName: '',
  });

  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  
  // Track expert response queue for delays
  const expertResponseQueueRef = React.useRef<Array<() => void>>([]);
  const isProcessingExpertQueueRef = React.useRef(false);
  const [showTaskBuilder, setShowTaskBuilder] = useState(false);
  const [showTaskCombiner, setShowTaskCombiner] = useState(false);
  const [showWorkflowPhaseEditor, setShowWorkflowPhaseEditor] = useState(false);
  const [showMode1Docs, setShowMode1Docs] = useState(false);
  const [showMode2Docs, setShowMode2Docs] = useState(false);
  const [showMode3Docs, setShowMode3Docs] = useState(false);
  const [showMode4Docs, setShowMode4Docs] = useState(false);
  const [workflowPhaseNodes, setWorkflowPhaseNodes] = useState<any[]>([]);
  const [workflowPhaseEdges, setWorkflowPhaseEdges] = useState<any[]>([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agent configuration modal state
  const [agentConfigModal, setAgentConfigModal] = useState<{
    isOpen: boolean;
    nodeId: string | null;
    currentAgent: Agent | null;
  }>({
    isOpen: false,
    nodeId: null,
    currentAgent: null,
  });
  const handleOpenAgentConfigRef = useRef<((nodeId: string) => void) | null>(null);
  
  // Ref to store handleCreateWorkflow function for event listener
  const handleCreateWorkflowRef = useRef<((useCaseType: string) => void) | null>(null);
  
  // Detect panel type helper function
  const detectPanelType = (): 'structured' | 'open' | null => {
    // Check for panel-specific task IDs (moderator, expert_agent)
    const taskIds = nodes
      .map(n => (n.data as any)?.task?.id)
      .filter(Boolean);
    
    if (taskIds.includes('moderator') && taskIds.includes('expert_agent')) {
      // Check for structured panel tasks
      if (taskIds.includes('opening_statements') || taskIds.includes('discussion_round')) {
        return 'structured';
      }
      // Default to open panel if moderator + expert but no structured tasks
      return 'open';
    }
    
    return null;
  };
  
  const isPanelWorkflow = detectPanelType() !== null;
  const [customTasks, setCustomTasks] = useState<TaskDefinition[]>(() => {
    try {
      const stored = localStorage.getItem('custom_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  
  // Refs for stable callbacks in nodeTypes
  const selectedNodeIdRef = useRef<string | null>(null);
  const handleNodeUpdateRef = useRef<((nodeId: string, newData: any) => void) | null>(null);
  const handleOpenSubflowRef = useRef<((nodeId: string) => void) | null>(null);
  const handleOpenTaskEditorRef = useRef<((nodeId: string) => void) | null>(null);
  const handleDeleteNodeRef = useRef<((nodeId: string) => void) | null>(null);


  // Sync selectedNode with nodes array when nodes change
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find(n => n.id === selectedNode.id);
      if (updatedNode && updatedNode !== selectedNode) {
        // Only update if the node data actually changed
        const nodeDataChanged = JSON.stringify(updatedNode.data) !== JSON.stringify(selectedNode.data);
        if (nodeDataChanged) {
          setSelectedNode(updatedNode);
        }
      }
    }
  }, [nodes, selectedNode]);


  // Initialize default workflow on mount
  const initializeDefaultWorkflow = useCallback(() => {
    // Get task definitions
    const medicalTask = TASK_DEFINITIONS.find(t => t.id === 'search_pubmed');
    const clinicalTrialsTask = TASK_DEFINITIONS.find(t => t.id === 'search_clinical_trials');
    const fdaTask = TASK_DEFINITIONS.find(t => t.id === 'fda_search');
    const webSearchTask = TASK_DEFINITIONS.find(t => t.id === 'web_search');

    if (!medicalTask || !clinicalTrialsTask || !fdaTask || !webSearchTask) {
      console.error('Required tasks not found for default workflow');
      return;
    }

    // Create default workflow nodes
    const defaultNodes: Node[] = [
    // Orchestrator (center)
    {
      id: 'orchestrator',
      type: 'orchestrator',
      position: { x: 400, y: 300 },
      data: { label: 'Orchestrator' },
    },
      // Medical Research Task (left of orchestrator)
      {
        id: 'medical-research',
        type: 'task',
        position: { x: 150, y: 200 },
      data: {
          task: {
            ...medicalTask,
            config: {
              ...medicalTask.config,
              agents: ['medical'],
              tools: ['pubmed', 'clinical_trials'],
            },
          },
          enabled: true,
          assignedAgents: ['medical'],
        label: 'Medical Research',
        },
      },
      // Clinical Trials Task (left of orchestrator, below medical)
      {
        id: 'clinical-trials',
        type: 'task',
        position: { x: 150, y: 350 },
      data: {
          task: {
            ...clinicalTrialsTask,
            config: {
              ...clinicalTrialsTask.config,
              agents: ['medical'],
              tools: ['clinical_trials'],
            },
          },
          enabled: true,
          assignedAgents: ['medical'],
          label: 'Clinical Trials Search',
        },
      },
      // FDA Regulatory Task (right of orchestrator)
      {
        id: 'fda-regulatory',
        type: 'task',
        position: { x: 700, y: 200 },
      data: {
          task: {
            ...fdaTask,
            config: {
              ...fdaTask.config,
              agents: ['regulatory'],
              tools: ['fda', 'web_search'],
            },
          },
          enabled: true,
          assignedAgents: ['regulatory'],
          label: 'FDA Regulatory Search',
        },
      },
      // Web Search Task (right of orchestrator, below FDA)
      {
        id: 'web-search',
        type: 'task',
        position: { x: 700, y: 350 },
        data: {
          task: {
            ...webSearchTask,
            config: {
              ...webSearchTask.config,
              agents: ['digital_health'],
              tools: ['web_search'],
            },
          },
          enabled: true,
          assignedAgents: ['digital_health'],
          label: 'Web Search',
        },
      },
    ];

    // Create edges connecting tasks to orchestrator
    const defaultEdges: Edge[] = [
      {
        id: 'orchestrator-medical',
        source: 'orchestrator',
        target: 'medical-research',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'orchestrator-clinical',
        source: 'orchestrator',
        target: 'clinical-trials',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'orchestrator-fda',
        source: 'orchestrator',
        target: 'fda-regulatory',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'orchestrator-web',
        source: 'orchestrator',
        target: 'web-search',
        type: 'smoothstep',
        animated: true,
      },
    ];

    setNodes(defaultNodes);
    setEdges(defaultEdges);
  }, [setNodes, setEdges]);

  // Don't auto-initialize - let user choose from workflow library

  // Fit view when nodes change significantly (e.g., template loaded)
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 1) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);

  // Handle task drag from library
  const onTaskDragStart = useCallback((task: TaskDefinition, event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(task));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Helper function to generate AI name for combined tasks
  const generateCombinedTaskName = async (taskNames: string[]): Promise<string> => {
    if (!apiKeys.openai || apiKeys.openai.length < 20) {
      // Fallback to simple concatenation if no API key
      return taskNames.join(' + ');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.openai}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, descriptive names for combined workflow tasks. Generate a single, clear name (2-4 words) that captures the essence of the combined tasks.',
            },
            {
              role: 'user',
              content: `Generate a concise name for a combined task that includes these tasks: ${taskNames.join(', ')}. Return only the name, no explanation.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate name');
      }

      const data = await response.json();
      const generatedName = data.choices[0]?.message?.content?.trim();
      
      if (generatedName && generatedName.length > 0 && generatedName.length < 50) {
        return generatedName;
      }
    } catch (error) {
      console.warn('Failed to generate AI name, using fallback:', error);
    }

    // Fallback to simple concatenation
    return taskNames.join(' + ');
  };

  // Helper function to combine tasks
  const combineTasks = useCallback(async (task1: TaskDefinition, task2: TaskDefinition, node1?: Node, node2?: Node): Promise<TaskDefinition> => {
    // Extract base tasks - check if nodes have combinedTasks array
    const getBaseTasks = (task: TaskDefinition, node?: Node): TaskDefinition[] => {
      // Check if node has combinedTasks array (for already-combined tasks)
      if (node?.data?.combinedTasks && Array.isArray(node.data.combinedTasks)) {
        return node.data.combinedTasks;
      }
      // Otherwise, it's a single task
      return [task];
    };

    const baseTasks1 = getBaseTasks(task1, node1);
    const baseTasks2 = getBaseTasks(task2, node2);
    const allTasks = [...baseTasks1, ...baseTasks2];

    // Generate AI name for combined task
    const taskNames = allTasks.map(t => t.name);
    const combinedName = await generateCombinedTaskName(taskNames);

    // Create combined task
    const combined: TaskDefinition = {
      id: `combined_${Date.now()}`,
      name: combinedName,
      description: `Combined task: ${allTasks.map(t => t.name).join(', ')}`,
      icon: task1.icon || task2.icon || '🔗',
      category: 'Custom',
      config: {
        model: task1.config?.model || task2.config?.model || 'gpt-4o-mini',
        temperature: allTasks.reduce((sum, t) => sum + (t.config?.temperature ?? 0.7), 0) / allTasks.length,
        systemPrompt: allTasks.map(t => t.config?.systemPrompt || '').filter(Boolean).join('\n\n'),
        tools: [...new Set(allTasks.flatMap(t => t.config?.tools || []))],
        agents: [...new Set(allTasks.flatMap(t => t.config?.agents || []))],
        rags: [...new Set(allTasks.flatMap(t => t.config?.rags || []))],
      },
    };

    return combined;
  }, [apiKeys.openai]);

  // Handle task drop on canvas or on another node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const taskData = event.dataTransfer.getData('application/reactflow');
      const nodeIdData = event.dataTransfer.getData('application/reactflow-node');
      
      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check if dropping a node on another node
      if (nodeIdData) {
        const draggedNodeId = nodeIdData;
        const targetNode = reactFlowInstance.getNodes().find((node: Node) => {
          const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
          if (!nodeElement) return false;
          const rect = nodeElement.getBoundingClientRect();
  return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          );
        });

        if (targetNode && targetNode.id !== draggedNodeId && targetNode.type === 'task') {
          const draggedNode = nodes.find(n => n.id === draggedNodeId);
          if (draggedNode && draggedNode.type === 'task') {
            const task1 = draggedNode.data?.task as TaskDefinition;
            const task2 = targetNode.data?.task as TaskDefinition;
            
            if (task1 && task2) {
              // Combine tasks - combineTasks is async, so we need to handle it
              combineTasks(task1, task2, draggedNode, targetNode).then((combinedTask) => {
                // Replace target node with combined task
                setNodes((nds) =>
                  nds.map((node: Node) => {
                    if (node.id === targetNode.id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          task: combinedTask,
                        },
                      };
                    }
                    return node;
                  }).filter((node: Node) => node.id !== draggedNodeId) // Remove dragged node
                );

                // Update edges to point to the combined node
                setEdges((eds) =>
                  eds.map((edge: Edge) => {
                    if (edge.source === draggedNodeId) {
                      return { ...edge, source: targetNode.id };
                    }
                    if (edge.target === draggedNodeId) {
                      return { ...edge, target: targetNode.id };
                    }
                    return edge;
                  }).filter((edge: Edge) => edge.source !== draggedNodeId && edge.target !== draggedNodeId)
                );

                // Save combined task to localStorage
                const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
                if (!customTasks.find((t: TaskDefinition) => t.id === combinedTask.id)) {
                  customTasks.push(combinedTask);
                  localStorage.setItem('custom_tasks', JSON.stringify(customTasks));
                  window.dispatchEvent(new Event('customTasksUpdated'));
                }
              });

              return;
            }
          }
        }
      }

      // Regular drop from task library
      if (taskData) {
        const task: TaskDefinition = JSON.parse(taskData);

        // Check if this is an agent node
        if (task.id === 'agent_node') {
          const newNode: Node = {
            id: `agent-${Date.now()}`,
            type: 'agent',
            position,
            data: {
              agentId: null,
              agentName: null,
              label: 'AI Agent',
              configured: false,
              enabled: true,
              _original_type: 'agent',
            },
          };
          setNodes((nds) => nds.concat(newNode));
        } else {
          // Regular task node
          const newNode: Node = {
            id: `task-${task.id}-${Date.now()}`,
            type: 'task',
            position,
            data: {
              task,
              enabled: false,
            },
          };
          setNodes((nds) => nds.concat(newNode));
        }
      }
    },
    [reactFlowInstance, setNodes, setEdges, nodes, combineTasks]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drag start - enable dragging nodes onto other nodes
  const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    // Only allow dragging task nodes
    if (node.type === 'task') {
      // Store node ID in a data attribute that we can access
      (event.target as HTMLElement).setAttribute('data-dragging-node-id', node.id);
    }
  }, []);

  // Handle node drag - update visual feedback
  const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    // Find node under cursor for visual feedback
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    const targetElement = elements.find(el => {
      const nodeId = el.getAttribute('data-id');
      return nodeId && nodeId !== node.id && nodeId !== 'orchestrator';
    });
    
    // Add visual feedback class
    document.querySelectorAll('.react-flow__node').forEach(n => {
      n.classList.remove('drop-target-highlight');
    });
    
    if (targetElement) {
      targetElement.classList.add('drop-target-highlight');
    }
  }, []);

  // Handle node drag end - clean up
  const onNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
    // Remove visual feedback
    document.querySelectorAll('.react-flow__node').forEach(n => {
      n.classList.remove('drop-target-highlight');
    });

    // Safety check: ensure node exists
    if (!node) {
      return;
    }

    // Check if dropped on another node
    if (node.type === 'task') {
      const elements = document.elementsFromPoint(event.clientX, event.clientY);
      const targetElement = elements.find(el => {
        const nodeId = el.getAttribute('data-id');
        return nodeId && nodeId !== node.id && nodeId !== 'orchestrator';
      });

      if (targetElement) {
        const targetNodeId = targetElement.getAttribute('data-id');
        if (targetNodeId) {
          const targetNode = nodes.find(n => n.id === targetNodeId);
          if (targetNode && targetNode.type === 'task' && targetNode.id !== node.id) {
            const task1 = node.data?.task as TaskDefinition;
            const task2 = targetNode.data?.task as TaskDefinition;
            
            if (task1 && task2) {
              // Show loading indicator
              const loadingNode = nodes.find(n => n.id === targetNodeId);
              if (loadingNode) {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === targetNodeId
                      ? { ...n, data: { ...n.data, _combining: true } }
                      : n
                  )
                );
              }

              try {
                // Combine tasks - pass nodes to track combined tasks
                const combinedTask = await combineTasks(task1, task2, node, targetNode);
              
              // Get all combined tasks from both nodes
              const combinedTasks1 = node.data?.combinedTasks || [task1];
              const combinedTasks2 = targetNode.data?.combinedTasks || [task2];
              const allCombinedTasks = [...combinedTasks1, ...combinedTasks2];
              
              // Always create/update subflow from all combined tasks
              // This ensures all tasks are visible, even when adding a 3rd, 4th, etc.
              const timestamp = Date.now();
              
              // Get existing subflows for reference
              const subflow1 = node.data?.subflow || node.data?.subworkflow;
              const subflow2 = targetNode.data?.subflow || targetNode.data?.subworkflow;
              
              // Create a map of tasks that are already in subflows (by task ID)
              const tasksInSubflows = new Set<string>();
              if (subflow1?.nodes) {
                subflow1.nodes.forEach((n: Node) => {
                  const task = n.data?.task;
                  if (task?.id) tasksInSubflows.add(task.id);
                });
              }
              if (subflow2?.nodes) {
                subflow2.nodes.forEach((n: Node) => {
                  const task = n.data?.task;
                  if (task?.id) tasksInSubflows.add(task.id);
                });
              }
              
              // Collect all nodes from existing subflows
              const existingNodes: Node[] = [];
              if (subflow1?.nodes) {
                existingNodes.push(...subflow1.nodes);
              }
              if (subflow2?.nodes) {
                // Offset second subflow to avoid overlap
                const maxX1 = existingNodes.length > 0 ? Math.max(...existingNodes.map((n: Node) => n.position.x)) : 0;
                const offsetX = maxX1 + 200;
                
                // Create node ID mapping for second subflow
                const nodeIdMap = new Map<string, string>();
                subflow2.nodes.forEach((n: Node) => {
                  const newId = `${n.id}-merged-${timestamp}-${Math.random()}`;
                  nodeIdMap.set(n.id, newId);
                });
                
                existingNodes.push(...subflow2.nodes.map((n: Node) => ({
                  ...n,
                  id: nodeIdMap.get(n.id) || `${n.id}-merged-${timestamp}-${Math.random()}`,
                  position: { x: n.position.x + offsetX, y: n.position.y }
                })));
              }
              
              // Add nodes for tasks that aren't in any subflow yet
              const tasksToAdd = allCombinedTasks.filter(task => !tasksInSubflows.has(task.id));
              const maxX = existingNodes.length > 0 ? Math.max(...existingNodes.map((n: Node) => n.position.x)) : 0;
              const startX = maxX > 0 ? maxX + 200 : 100;
              
              const newNodes: Node[] = tasksToAdd.map((task, index) => ({
                id: `subflow-task-${task.id}-${timestamp}-${index}`,
                type: 'task',
                position: { x: startX + (index * 300), y: 200 },
                data: {
                  task,
                  enabled: true,
                },
              }));
              
              // Combine all nodes
              const allSubflowNodes = [...existingNodes, ...newNodes];
              
              // Collect all edges from existing subflows
              const existingEdges: Edge[] = [];
              if (subflow1?.edges) {
                existingEdges.push(...subflow1.edges);
              }
              if (subflow2?.edges) {
                // Update edge source/target IDs for merged nodes
                const nodeIdMap = new Map<string, string>();
                subflow2.nodes.forEach((n: Node) => {
                  const newId = `${n.id}-merged-${timestamp}-${Math.random()}`;
                  nodeIdMap.set(n.id, newId);
                });
                
                existingEdges.push(...subflow2.edges.map((e: Edge) => ({
                  ...e,
                  id: `${e.id}-merged-${timestamp}-${Math.random()}`,
                  source: nodeIdMap.get(e.source) || e.source,
                  target: nodeIdMap.get(e.target) || e.target
                })));
              }
              
              // Create sequential edges for new tasks
              const newEdges: Edge[] = [];
              if (newNodes.length > 1) {
                for (let i = 0; i < newNodes.length - 1; i++) {
                  newEdges.push({
                    id: `subflow-edge-${timestamp}-${i}`,
                    source: newNodes[i].id,
                    target: newNodes[i + 1].id,
                    animated: true,
                    style: { stroke: '#667eea', strokeWidth: 2 },
                  });
                }
              }
              
              // Connect last existing node to first new node if both exist
              if (existingNodes.length > 0 && newNodes.length > 0) {
                const lastExistingNode = existingNodes[existingNodes.length - 1];
                const firstNewNode = newNodes[0];
                newEdges.push({
                  id: `subflow-edge-connect-${timestamp}`,
                  source: lastExistingNode.id,
                  target: firstNewNode.id,
                  animated: true,
                  style: { stroke: '#667eea', strokeWidth: 2 },
                });
              }
              
              const mergedSubflow = { 
                nodes: allSubflowNodes, 
                edges: [...existingEdges, ...newEdges] 
              };
              
              // Replace target node with combined task
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id === targetNodeId) {
                    return {
                      ...n,
                      data: {
                        ...n.data,
                        task: combinedTask,
                        combinedTasks: allCombinedTasks, // Track all original tasks
                        subflow: mergedSubflow, // Preserve merged subflow
                        subworkflow: mergedSubflow, // Also set subworkflow for compatibility
                      },
                    };
                  }
                  return n;
                }).filter((n) => n.id !== node.id) // Remove dragged node
              );

              // Update edges to point to the combined node
              setEdges((eds) =>
                eds.map((edge) => {
                  if (edge.source === node.id) {
                    return { ...edge, source: targetNodeId };
                  }
                  if (edge.target === node.id) {
                    return { ...edge, target: targetNodeId };
                  }
                  return edge;
                }).filter((edge) => edge.source !== node.id && edge.target !== node.id)
              );

                // Save combined task to localStorage
                const customTasks = JSON.parse(localStorage.getItem('custom_tasks') || '[]');
                if (!customTasks.find((t: TaskDefinition) => t.id === combinedTask.id)) {
                  customTasks.push(combinedTask);
                  localStorage.setItem('custom_tasks', JSON.stringify(customTasks));
                  window.dispatchEvent(new Event('customTasksUpdated'));
                }
              } catch (error) {
                console.error('Error combining tasks:', error);
                // Remove loading indicator on error
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === targetNodeId
                      ? { ...n, data: { ...n.data, _combining: false } }
                      : n
                  )
                );
              }
            }
          }
        }
      }
    }
  }, [nodes, setNodes, setEdges, combineTasks]);

  // Update node enabled status based on connections
  const updateNodeStatus = useCallback((edges: Edge[]) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'orchestrator') return node;

        const isConnected = edges.some(
          (edge) =>
            (edge.source === 'orchestrator' && edge.target === node.id) ||
            (edge.target === 'orchestrator' && edge.source === node.id)
        );

        return {
          ...node,
          data: { ...node.data, enabled: isConnected },
        };
      }) as Node[]
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(
        { ...connection, animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
        edges
      );
      setEdges(newEdges);
      updateNodeStatus(newEdges);
    },
    [edges, setEdges, updateNodeStatus]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const remainingEdges = edges.filter(
        (edge) => !deletedEdges.some((de) => de.id === edge.id)
      );
      updateNodeStatus(remainingEdges);
    },
    [edges, updateNodeStatus]
  );

  // Define handleNodeUpdate first
  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        
        // Deep merge the data, especially for task and config
        const updatedData = { ...node.data };
        
        if (newData.task) {
          updatedData.task = { ...updatedData.task, ...newData.task };
        }
        
        if (newData.config) {
          updatedData.config = { ...updatedData.config, ...newData.config };
        }
        
        // Merge other properties
        Object.keys(newData).forEach(key => {
          if (key !== 'task' && key !== 'config') {
            updatedData[key] = newData[key];
          }
        });
        
        return { ...node, data: updatedData };
      }) as Node[]
    );
  }, [setNodes]);
  
  // Immediately set the ref after defining the callback
  handleNodeUpdateRef.current = handleNodeUpdate;

  const handleOpenSubflow = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.type === 'task') {
      const taskData = node.data as any;
      setTaskFlowModal({
        isOpen: true,
        taskNodeId: nodeId,
        taskName: taskData?.task?.name || 'Task',
      });
    }
  }, [nodes]);
  
  const handleOpenTaskEditor = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.type === 'task') {
      const taskData = node.data as any;
      setTaskFlowModal({
        isOpen: true,
        taskNodeId: nodeId,
        taskName: taskData?.task?.name || 'Task',
      });
    }
  }, [nodes]);
  
  // Immediately set the refs after defining the callbacks
  handleOpenSubflowRef.current = handleOpenSubflow;
  handleOpenTaskEditorRef.current = handleOpenTaskEditor;

  const handleSaveSubflow = useCallback((nodeId: string, subflow: { nodes: Node[]; edges: Edge[] }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, subflow } }
          : node
      ) as Node[]
    );
  }, [setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Don't open modal if clicking on delete button, menu button, or other interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('.task-node-delete') || 
        target.closest('.task-node-menu') || 
        target.closest('.task-node-actions') ||
        target.closest('.nodrag')) {
      return;
    }
    
    // Single click: open node configuration modal for task nodes
    if (node.type === 'task') {
      setSelectedNode(node);
      setShowNodeConfig(true);
    } else {
      // For other nodes, just select them
      setSelectedNode(node);
    }
  }, []);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Double click: Open subflow for task nodes
    if (node.type === 'task') {
      handleOpenSubflow(node.id);
    }
  }, [handleOpenSubflow]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Map task IDs to backend agent IDs
  const mapTaskToAgent = (taskId: string): string | null => {
    const taskIdLower = taskId.toLowerCase();
    
    // Medical research tasks
    if (taskIdLower.includes('pubmed') || taskIdLower.includes('clinical') || taskIdLower === 'search_pubmed' || taskIdLower === 'search_clinical_trials') {
      return 'medical';
    }
    
    // Regulatory tasks
    if (taskIdLower.includes('fda') || taskIdLower === 'fda_search') {
      return 'regulatory';
    }
    
    // Digital health tasks
    if (taskIdLower.includes('digital') || taskIdLower.includes('health') || taskIdLower.includes('arxiv')) {
      return 'digital_health';
    }
    
    // Web search defaults to medical
    if (taskIdLower.includes('web') || taskIdLower === 'web_search') {
      return 'medical';
    }
    
    return null;
  };

  const getEnabledTasks = () => {
    const isPanel = detectPanelType() !== null;
    
    // Check if this is Mode 1 workflow (has input/start node and task nodes with edges)
    const hasStartNode = nodes.some(n => n.type === 'input' || n.id === 'start');
    const hasTaskNodes = nodes.some(n => n.type === 'task');
    const hasEdges = edges.length > 0;
    const isMode1Workflow = hasStartNode && hasTaskNodes && hasEdges;
    
    if (isPanel || isMode1Workflow) {
      // For panel workflows and Mode 1 workflows, get all task nodes that are part of the workflow
      const taskNodes = nodes.filter((node) => {
        if (node.type !== 'task') return false;
        const taskData = node.data as any;
        // Only include nodes that have a task definition
        return taskData?.task?.id || taskData?.task?.name;
      });
      
      // Return task names/labels
      const taskNames: string[] = [];
      taskNodes.forEach((node) => {
        const taskData = node.data as any;
        // Prefer label, then task name, then task id
        const taskName = node.data?.label || taskData?.task?.name || taskData?.task?.id || node.id;
        if (taskName && !taskNames.includes(taskName)) {
          taskNames.push(taskName);
        }
      });
      
      return taskNames;
    }
    
    // For regular workflows, get all task nodes that are connected to the orchestrator
    const orchestratorId = 'orchestrator';
    const connectedTaskNodes = nodes.filter((node) => {
      if (node.type !== 'task') return false;
      // Check if node is connected to orchestrator via edges
      const isConnected = edges.some(edge => 
        (edge.source === orchestratorId && edge.target === node.id) ||
        (edge.source === node.id && edge.target === orchestratorId)
      );
      return isConnected;
    });
    
    const agentIds: string[] = [];
    connectedTaskNodes.forEach((node) => {
      const taskData = node.data as any;
      let agentId: string | null = null;
      
      // Try to get agent ID from task ID
      if (taskData?.task?.id) {
        agentId = mapTaskToAgent(taskData.task.id);
      }
      
      // If no mapping found, try task name
      if (!agentId && taskData?.task?.name) {
        agentId = mapTaskToAgent(taskData.task.name);
      }
      
      // If still no mapping, check assigned agents
      if (!agentId && taskData?.assignedAgents && taskData.assignedAgents.length > 0) {
        agentIds.push(...taskData.assignedAgents);
        return;
      }
      
      // Add mapped agent ID if found
      if (agentId && !agentIds.includes(agentId)) {
        agentIds.push(agentId);
      }
    });
    
    return agentIds;
  };

  const getAssignedAgents = () => {
    // Collect all assigned agents from enabled task nodes
    const enabledNodes = nodes.filter((node) => {
      if (node.type !== 'task') return false;
      const taskData = node.data as any;
      return taskData?.enabled && taskData?.assignedAgents && taskData.assignedAgents.length > 0;
    });
    
    const allAgents: string[] = [];
    enabledNodes.forEach((node) => {
      const taskData = node.data as any;
      if (taskData.assignedAgents) {
        allAgents.push(...taskData.assignedAgents);
      }
    });
    
    // Return unique agents
    return [...new Set(allAgents)];
  };

  const handleSaveCustomTask = useCallback((task: TaskDefinition) => {
    // Save to localStorage
    const updated = [...customTasks, task];
    setCustomTasks(updated);
    localStorage.setItem('custom_tasks', JSON.stringify(updated));
    
    // Trigger custom event for immediate refresh in other components
    window.dispatchEvent(new Event('customTasksUpdated'));
    
  }, [customTasks]);

  const handleAddConfiguredTask = useCallback((task: TaskDefinition, options?: { userPrompt?: string; agents?: string[] }) => {
    // Determine a reasonable position (center of viewport if available)
    let position = { x: 400, y: 300 };
    try {
      if (reactFlowInstance && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const center = { x: rect.width / 2, y: rect.height / 2 };
        position = reactFlowInstance.screenToFlowPosition({ x: rect.left + center.x, y: rect.top + center.y });
      }
    } catch {}

    const newNode: Node = {
      id: `task-${task.id}-${Date.now()}`,
      type: 'task',
      position,
      data: { 
        task, 
        enabled: true, 
        userPrompt: options?.userPrompt || '',
        assignedAgents: options?.agents || [],
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setShowNodeConfig(false);
    }
  }, [setNodes, setEdges, selectedNode]);

  // Immediately set the ref after defining the callback
  handleDeleteNodeRef.current = handleDeleteNode;

  // Handle opening agent configuration modal
  const handleOpenAgentConfig = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.type === 'agent') {
      setAgentConfigModal({
        isOpen: true,
        nodeId,
        currentAgent: (node.data as any)?.agent || null,
      });
    }
  }, [nodes]);

  // Handle agent selection from modal
  const handleSelectAgent = useCallback((agent: Agent) => {
    if (agentConfigModal.nodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === agentConfigModal.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                agent,
                agentId: agent.id,
                agentName: agent.name,
                label: agent.display_name,
                configured: true,
              },
            };
          }
          return node;
        })
      );
    }
    setAgentConfigModal({ isOpen: false, nodeId: null, currentAgent: null });
  }, [agentConfigModal.nodeId, setNodes]);

  // Set refs
  handleOpenAgentConfigRef.current = handleOpenAgentConfig;

  // Update selectedNodeId ref
  selectedNodeIdRef.current = selectedNode?.id || null;

  // Simple Input Node Component
  const InputNode = React.useCallback((props: any) => {
    return (
      <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm min-w-[120px]">
        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500" />
        <div className="font-semibold text-blue-900 text-sm">📥 {props.data?.label || 'Input'}</div>
        {props.data?.parameters?.default_value && (
          <div className="text-xs text-blue-700 mt-1 truncate max-w-[200px]">
            {props.data.parameters.default_value}
      </div>
        )}
    </div>
  );
  }, []);

  // Simple Output Node Component
  const OutputNode = React.useCallback((props: any) => {
    return (
      <div className="px-4 py-2 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm min-w-[120px]">
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-green-500" />
        <div className="font-semibold text-green-900 text-sm">📤 {props.data?.label || 'Output'}</div>
        {props.data?.parameters?.format && (
          <div className="text-xs text-green-700 mt-1">
            Format: {props.data.parameters.format}
          </div>
        )}
      </div>
    );
  }, []);

  // Use stable nodeTypes with refs to prevent recreation
  // Define nodeTypes outside useMemo dependencies to make it truly stable
  const nodeTypes = React.useMemo(() => ({
    orchestrator: OrchestratorNode,
    input: InputNode,
    output: OutputNode,
    task: (props: any) => {
      const nodeId = props.id;
      // Use refs to access current values without causing re-renders
      const isSelected = nodeId === selectedNodeIdRef.current;
      return (
        <TaskNode
          {...props}
          selected={isSelected}
          updateNodeData={(data: any) => {
            if (handleNodeUpdateRef.current) {
              handleNodeUpdateRef.current(nodeId, data);
            }
          }}
          onOpenSubflow={() => {
            if (handleOpenSubflowRef.current) {
              handleOpenSubflowRef.current(nodeId);
            }
          }}
          onOpenTaskEditor={() => {
            if (handleOpenTaskEditorRef.current) {
              handleOpenTaskEditorRef.current(nodeId);
            }
          }}
          onDelete={(id: string) => {
            if (handleDeleteNodeRef.current) {
              handleDeleteNodeRef.current(id);
            }
          }}
        />
      );
    },
    agent: (props: any) => {
      const nodeId = props.id;
      const isSelected = nodeId === selectedNodeIdRef.current;
      return (
        <AgentNode
          {...props}
          selected={isSelected}
          onOpenConfig={() => {
            if (handleOpenAgentConfigRef.current) {
              handleOpenAgentConfigRef.current(nodeId);
            }
          }}
          onDelete={(id: string) => {
            if (handleDeleteNodeRef.current) {
              handleDeleteNodeRef.current(id);
            }
          }}
        />
      );
    },
  }), []); // Empty dependency array - refs are updated via useEffect

  const [orchestratorPrompt, setOrchestratorPrompt] = useState<string>(() => {
    return localStorage.getItem('pharma_global_system_prompt') || '';
  });

  const saveApiKeys = () => {
    localStorage.setItem('pharma_api_keys', JSON.stringify(apiKeys));
    localStorage.setItem('pharma_global_system_prompt', orchestratorPrompt);
    setShowSettings(false);
  };

  const handleSaveWorkflow = async () => {
    if (nodes.length === 0) {
      alert('No workflow to save. Please create or load a workflow first.');
      return;
    }

    setIsSaving(true);
    try {
      const panelType = detectPanelType();
      const workflowDefinition = {
        name: currentWorkflowName,
        description: panelType ? `${panelType} panel workflow` : 'Workflow',
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          label: (n.data as any)?.label || n.id,
          position: n.position,
          parameters: {},
          data: n.data || {}
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle
        })),
        metadata: {
          ...(panelType ? { panel_type: panelType } : {}),
          system_prompt: userQuery || '',
          rounds: nodes.filter(n => {
            const taskData = n.data as any;
            return taskData?.task?.id === 'discussion_round';
          }).length || 3,
          consensus_threshold: 0.75,
          time_budget: 600,
          workflow_nodes: workflowPhaseNodes.length > 0 ? workflowPhaseNodes : [],
          workflow_edges: workflowPhaseEdges.length > 0 ? workflowPhaseEdges : [],
        }
      };

      const url = currentWorkflowId && currentWorkflowId.startsWith('template-')
        ? apiEndpoints.updateWorkflow(currentWorkflowId) // Update existing template
        : apiEndpoints.createWorkflow(); // Create new workflow

      const method = currentWorkflowId && currentWorkflowId.startsWith('template-') ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowDefinition),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to save workflow: ${response.statusText}`);
      }

      const result = await response.json();
      setCurrentWorkflowId(result.id || currentWorkflowId);
      if (result.id && !currentWorkflowId?.startsWith('template-')) {
        setCurrentWorkflowName(result.name || currentWorkflowName);
      }

      alert('Workflow saved successfully!');
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportWorkflow = async () => {
    if (nodes.length === 0) {
      alert('No workflow to export. Please create or load a workflow first.');
      return;
    }

    try {
      const panelType = detectPanelType();
      const workflowDefinition = {
        id: currentWorkflowId || `workflow-${Date.now()}`,
        name: currentWorkflowName,
        description: panelType ? `${panelType} panel workflow` : 'Workflow',
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          label: (n.data as any)?.label || n.id,
          position: n.position,
          parameters: {},
          data: n.data || {}
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle
        })),
        metadata: {
          ...(panelType ? { panel_type: panelType } : {}),
          system_prompt: userQuery || '',
          rounds: nodes.filter(n => {
            const taskData = n.data as any;
            return taskData?.task?.id === 'discussion_round';
          }).length || 3,
          consensus_threshold: 0.75,
          time_budget: 600,
          workflow_nodes: workflowPhaseNodes.length > 0 ? workflowPhaseNodes : [],
          workflow_edges: workflowPhaseEdges.length > 0 ? workflowPhaseEdges : [],
        }
      };

      // Export directly as JSON file (no backend needed)
      const jsonString = JSON.stringify(workflowDefinition, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `${currentWorkflowName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Workflow exported successfully!');
    } catch (error: any) {
      console.error('Error exporting workflow:', error);
      alert(`Failed to export workflow: ${error.message}`);
    }
  };

  const handleImportWorkflow = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('No file selected for import');
      return;
    }

    try {
      console.log('Importing workflow file:', file.name);
      const text = await file.text();
      console.log('File content length:', text.length);
      
      let workflowData;
      try {
        workflowData = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON file: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
      }

      console.log('Parsed workflow data:', workflowData);

      // Validate workflow data
      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('Invalid workflow file: missing nodes array');
      }
      if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
        throw new Error('Invalid workflow file: missing edges array');
      }
      
      console.log(`Importing ${workflowData.nodes.length} nodes and ${workflowData.edges.length} edges`);

      // Import workflow directly from JSON (no backend needed)
      // Convert workflow format to React Flow format
      const flowNodes: Node[] = workflowData.nodes.map((node: any) => {
        const isTask = node.type === 'task' || 
                      node.data?._original_type === 'task' || 
                      node.data?.task;
        
        // If task data exists but is incomplete, try to find it in TASK_DEFINITIONS
        let taskData = node.data?.task;
        if (taskData && taskData.id && !taskData.config) {
          const taskDef = TASK_DEFINITIONS.find(t => t.id === taskData.id);
          if (taskDef) {
            taskData = taskDef;
          }
        }
        
        return {
          id: node.id,
          type: isTask ? 'task' : node.type,
          position: node.position || { x: 0, y: 0 },
          data: {
            ...node.data,
            task: taskData || node.data?.task,
            label: node.label || node.data?.label || node.id,
          },
        };
      });

      const flowEdges: Edge[] = workflowData.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'smoothstep',
        animated: true,
      }));

      // Apply auto-layout
      const laidOutNodes = autoLayoutWorkflow(flowNodes, flowEdges);
      
      console.log('Setting imported nodes and edges:', { 
        nodesCount: laidOutNodes.length, 
        edgesCount: flowEdges.length 
      });

      setNodes(laidOutNodes);
      setEdges(flowEdges);
      setSelectedNode(null);
      setCurrentWorkflowId(workflowData.id || `imported-${Date.now()}`);
      setCurrentWorkflowName(workflowData.name || 'Imported Workflow');
      
      console.log('Workflow imported successfully');

      // Restore metadata if present
      if (workflowData.metadata) {
        if (workflowData.metadata.workflow_nodes) {
          setWorkflowPhaseNodes(workflowData.metadata.workflow_nodes);
        }
        if (workflowData.metadata.workflow_edges) {
          setWorkflowPhaseEdges(workflowData.metadata.workflow_edges);
        }
      }

      alert('Workflow imported successfully!');
      
      // Fit view to show all nodes
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }
      }, 100);
    } catch (error: any) {
      console.error('Error importing workflow:', error);
      alert(`Failed to import workflow: ${error.message}`);
    } finally {
      // Reset file input to allow re-importing the same file
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleExportReport = async (format: 'pdf' | 'markdown') => {
    if (messages.length === 0) {
      alert('No messages to export. Please run a workflow first.');
      return;
    }

    try {
      const response = await fetch(`${apiEndpoints.export()}/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp,
            name: msg.name,
            sources: msg.sources,
            level: msg.level,
          })),
          query: userQuery || 'Panel Discussion',
          title: `Panel Discussion Report - ${currentWorkflowName || 'Workflow'}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to export ${format}: ${response.statusText}`);
      }

      // Get the file blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'md'}`;

      // Download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(`${format.toUpperCase()} report exported successfully!`);
    } catch (error: any) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Failed to export ${format}: ${error.message}`);
    }
  };

  const handleCreateWorkflow = useCallback((useCaseType: string) => {
    console.log('[WorkflowBuilder] handleCreateWorkflow called with:', useCaseType);
    // Clear existing workflow
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setCurrentWorkflowId(null);
    
    // Set default workflow name (will be updated when workflow is created)
    const panelTypes = getAvailablePanelTypes();
    if (panelTypes.includes(useCaseType)) {
      // Will be set from workflow config below
      setCurrentWorkflowName(`${useCaseType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Workflow`);
    } else {
      setCurrentWorkflowName(useCaseType === 'structured_panel' ? 'Structured Panel Workflow' : useCaseType === 'open_panel' ? 'Open Panel Workflow' : 'Untitled Workflow');
    }

    if (useCaseType === 'medical_research') {
      // Medical Research Workflow - Real API calls
      const medicalTask = TASK_DEFINITIONS.find(t => t.id === 'search_pubmed');
      const clinicalTrialsTask = TASK_DEFINITIONS.find(t => t.id === 'search_clinical_trials');

      if (!medicalTask || !clinicalTrialsTask) {
        console.error('Required tasks not found');
        return;
      }

      const templateNodes: Node[] = [
        {
          id: 'orchestrator',
          type: 'orchestrator',
          position: { x: 400, y: 300 },
          data: { label: 'Orchestrator' },
        },
        {
          id: 'medical-research',
          type: 'task',
          position: { x: 150, y: 200 },
          data: {
            task: {
              ...medicalTask,
              config: {
                ...medicalTask.config,
                agents: ['medical'],
                tools: ['pubmed', 'clinical_trials'],
              },
            },
            enabled: true,
            assignedAgents: ['medical'],
            label: 'Medical Research',
          },
        },
        {
          id: 'clinical-trials',
          type: 'task',
          position: { x: 150, y: 400 },
          data: {
            task: {
              ...clinicalTrialsTask,
              config: {
                ...clinicalTrialsTask.config,
                agents: ['medical'],
                tools: ['clinical_trials'],
              },
            },
            enabled: true,
            assignedAgents: ['medical'],
            label: 'Clinical Trials',
          },
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: 'orchestrator-medical',
          source: 'orchestrator',
          target: 'medical-research',
          type: 'smoothstep',
          animated: true,
        },
        {
          id: 'orchestrator-clinical',
          source: 'orchestrator',
          target: 'clinical-trials',
          type: 'smoothstep',
          animated: true,
        },
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    } else if (useCaseType === 'regulatory_compliance') {
      // Regulatory Compliance Workflow - Real API calls
      const fdaTask = TASK_DEFINITIONS.find(t => t.id === 'fda_search');
      const webSearchTask = TASK_DEFINITIONS.find(t => t.id === 'web_search');

      if (!fdaTask || !webSearchTask) {
        console.error('Required tasks not found');
        return;
      }

      const templateNodes: Node[] = [
        {
          id: 'orchestrator',
          type: 'orchestrator',
          position: { x: 400, y: 300 },
          data: { label: 'Orchestrator' },
        },
        {
          id: 'fda-regulatory',
          type: 'task',
          position: { x: 700, y: 200 },
          data: {
            task: {
              ...fdaTask,
              config: {
                ...fdaTask.config,
                agents: ['regulatory'],
                tools: ['fda', 'web_search'],
              },
            },
            enabled: true,
            assignedAgents: ['regulatory'],
            label: 'FDA Regulatory',
          },
        },
        {
          id: 'web-search',
          type: 'task',
          position: { x: 700, y: 400 },
          data: {
            task: {
              ...webSearchTask,
              config: {
                ...webSearchTask.config,
                agents: ['regulatory'],
                tools: ['web_search'],
              },
            },
            enabled: true,
            assignedAgents: ['regulatory'],
            label: 'Web Search',
          },
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: 'orchestrator-fda',
          source: 'orchestrator',
          target: 'fda-regulatory',
          type: 'smoothstep',
          animated: true,
        },
        {
          id: 'orchestrator-web',
          source: 'orchestrator',
          target: 'web-search',
          type: 'smoothstep',
          animated: true,
        },
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    } else if (useCaseType === 'comprehensive_analysis') {
      // Comprehensive Analysis - All agents - Real API calls
      initializeDefaultWorkflow();
    } else if (useCaseType === 'quick_research') {
      // Quick Research - Minimal setup
      const medicalTask = TASK_DEFINITIONS.find(t => t.id === 'search_pubmed');

      if (!medicalTask) {
        console.error('Required tasks not found');
        return;
      }

      const templateNodes: Node[] = [
        {
          id: 'orchestrator',
          type: 'orchestrator',
          position: { x: 400, y: 300 },
          data: { label: 'Orchestrator' },
        },
        {
          id: 'medical-research',
          type: 'task',
          position: { x: 150, y: 300 },
          data: {
            task: {
              ...medicalTask,
              config: {
                ...medicalTask.config,
                agents: ['medical'],
                tools: ['pubmed'],
              },
            },
            enabled: true,
            assignedAgents: ['medical'],
            label: 'Medical Research',
          },
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: 'orchestrator-medical',
          source: 'orchestrator',
          target: 'medical-research',
          type: 'smoothstep',
          animated: true,
        },
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    } else if (useCaseType === 'digital_health') {
      // Digital Health Workflow - Real API calls
      const webSearchTask = TASK_DEFINITIONS.find(t => t.id === 'web_search');
      const arxivTask = TASK_DEFINITIONS.find(t => t.id === 'arxiv_search');

      if (!webSearchTask || !arxivTask) {
        console.error('Required tasks not found');
        return;
      }

      const templateNodes: Node[] = [
        {
          id: 'orchestrator',
          type: 'orchestrator',
          position: { x: 400, y: 300 },
          data: { label: 'Orchestrator' },
        },
        {
          id: 'web-search',
          type: 'task',
          position: { x: 700, y: 200 },
          data: {
            task: {
              ...webSearchTask,
              config: {
                ...webSearchTask.config,
                agents: ['digital_health'],
                tools: ['web_search'],
              },
            },
            enabled: true,
            assignedAgents: ['digital_health'],
            label: 'Web Search',
          },
        },
        {
          id: 'arxiv-search',
          type: 'task',
          position: { x: 700, y: 400 },
          data: {
            task: {
              ...arxivTask,
              config: {
                ...arxivTask.config,
                agents: ['digital_health'],
                tools: ['arxiv'],
              },
            },
            enabled: true,
            assignedAgents: ['digital_health'],
            label: 'ArXiv Search',
          },
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: 'orchestrator-web',
          source: 'orchestrator',
          target: 'web-search',
          type: 'smoothstep',
          animated: true,
        },
        {
          id: 'orchestrator-arxiv',
          source: 'orchestrator',
          target: 'arxiv-search',
          type: 'smoothstep',
          animated: true,
        },
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    } else if (getAvailablePanelTypes().includes(useCaseType)) {
      // Note: Mode 1 documentation is now opened separately via sidebar click
      // Don't auto-open docs when creating workflow - let user open it manually if needed
      
      // Panel workflow - try to load from backend first, fallback to default
      const workflowId = useCaseType === 'structured_panel'
        ? 'template-structured-panel'
        : useCaseType === 'open_panel'
        ? 'template-open-panel'
        : useCaseType === 'mode1_ask_expert'
        ? 'template-mode1-ask-expert'
        : useCaseType === 'mode2_ask_expert'
        ? 'template-mode2-ask-expert'
        : useCaseType === 'mode3_ask_expert'
        ? 'template-mode3-ask-expert'
        : useCaseType === 'mode4_ask_expert'
        ? 'template-mode4-ask-expert'
        : `template-${useCaseType}`;
      
      fetch(apiEndpoints.workflow(workflowId))
        .then(res => {
          if (!res.ok) {
            // 404 is expected for workflows that don't exist yet - fallback to default
            // 500 errors also trigger fallback (backend might be unavailable or endpoint missing)
            if (res.status === 404 || res.status === 500) {
              const errorType = res.status === 404 ? 'WORKFLOW_NOT_FOUND' : 'BACKEND_ERROR';
              console.warn(`[WorkflowBuilder] Backend returned ${res.status} for workflow ${workflowId}, falling back to default`);
              throw new Error(errorType); // Special error to trigger fallback
            }
            // For other errors, try to get more details
            return res.text().then(text => {
              try {
                const errorData = JSON.parse(text);
                throw new Error(`Failed to load workflow: ${errorData.error || res.statusText}`);
              } catch {
                throw new Error(`Failed to load workflow: ${res.status} ${res.statusText}`);
              }
            });
          }
          return res.json();
        })
        .catch(err => {
          // Handle network errors and other fetch failures
          if (err.name === 'TypeError' && err.message.includes('fetch')) {
            console.warn('[WorkflowBuilder] Network error fetching workflow, falling back to default:', err.message);
            throw new Error('NETWORK_ERROR');
          }
          // Re-throw other errors
          throw err;
        })
        .then(workflow => {
          // Check if workflow is empty
          if (!workflow.nodes || workflow.nodes.length === 0) {
            console.warn('Backend returned empty workflow, creating default instead');
            throw new Error('Empty workflow returned from backend');
          }
          
          // Convert backend workflow format to React Flow format
          const flowNodes: Node[] = workflow.nodes.map((node: any) => {
            // Check if this is a task node (either type is task, or has _original_type or task data)
            const isTask = node.type === 'task' || 
                          node.data?._original_type === 'task' || 
                          node.data?.task;
            
            return {
              id: node.id,
              type: isTask ? 'task' : node.type,
              position: node.position || { x: 0, y: 0 },
              data: {
                ...node.data,
                label: node.label || node.id,
              },
            };
          });

          const flowEdges: Edge[] = workflow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: 'smoothstep',
            animated: true,
          }));

          // Apply auto-layout to improve readability
          const laidOutNodes = autoLayoutWorkflow(flowNodes, flowEdges);

          setNodes(laidOutNodes);
          setEdges(flowEdges);
          setSelectedNode(null);
          setCurrentWorkflowId(workflow.id);
          setCurrentWorkflowName(workflow.name || 'Panel Workflow');
          
          // Store workflow metadata for execution
          if (workflow.metadata) {
            // Metadata is available in the workflow object
            // Extract workflow phase nodes/edges if present
            if (workflow.metadata.workflow_nodes) {
              setWorkflowPhaseNodes(workflow.metadata.workflow_nodes);
            }
            if (workflow.metadata.workflow_edges) {
              setWorkflowPhaseEdges(workflow.metadata.workflow_edges);
            }
          }
        })
        .catch(err => {
          // Handle different error types - all should fallback to default workflow
          if (err.message === 'WORKFLOW_NOT_FOUND' || err.message === 'BACKEND_ERROR' || err.message === 'NETWORK_ERROR') {
            const reason = err.message === 'WORKFLOW_NOT_FOUND' 
              ? 'not found in backend' 
              : err.message === 'BACKEND_ERROR'
              ? 'backend error (500)'
              : 'network error';
            console.log(`[WorkflowBuilder] Workflow ${reason}, creating default panel workflow for type: ${useCaseType}`);
          } else {
            console.warn('[WorkflowBuilder] Error loading workflow from backend, falling back to default:', err.message);
          }
          
          // Use factory function to create default panel workflow
          try {
            console.log(`[WorkflowBuilder] Creating default panel workflow for: ${useCaseType}`);
            const workflow = createDefaultPanelWorkflow(useCaseType);
            console.log(`[WorkflowBuilder] Created workflow with ${workflow.nodes.length} nodes and ${workflow.edges.length} edges`);
            console.log('[WorkflowBuilder] Workflow nodes:', workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.data?.label })));
            
            if (workflow.nodes.length === 0) {
              console.error('[WorkflowBuilder] Warning: Created workflow has no nodes!');
              alert(`Created workflow for ${useCaseType} but it has no nodes. Please check the panel configuration.`);
              return;
            }
            
            console.log('[WorkflowBuilder] Setting nodes and edges in state...');
            console.log('[WorkflowBuilder] Edges to set:', workflow.edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
            
            // Filter out any default orchestrator nodes that shouldn't be in panel/Mode workflows
            // Mode 1 uses 'orchestrator' type for conditional decision nodes (check_specialist_need, etc.)
            // But we don't want the default 'orchestrator' node from initializeDefaultWorkflow
            const filteredNodes = workflow.nodes.filter(node => {
              // Only filter out the default orchestrator node (id === 'orchestrator')
              // Keep conditional orchestrator nodes (check_specialist_need, check_tools_need, etc.)
              if (node.type === 'orchestrator' && node.id === 'orchestrator') {
                // Check if this is a Mode 1 workflow - if so, don't include the default orchestrator
                const isMode1Workflow = workflow.nodes.some(n => n.id === 'start' || n.type === 'input');
                if (isMode1Workflow) {
                  return false; // Remove default orchestrator from Mode 1
                }
              }
              return true;
            });
            
            // Filter edges that reference non-existent nodes
            const filteredEdges = workflow.edges.filter(edge => {
              const sourceExists = filteredNodes.some(n => n.id === edge.source);
              const targetExists = filteredNodes.some(n => n.id === edge.target);
              return sourceExists && targetExists;
            });
            
            console.log('[WorkflowBuilder] Filtered nodes:', filteredNodes.length, 'Filtered edges:', filteredEdges.length);
            setNodes(filteredNodes);
            setEdges(filteredEdges);
            setCurrentWorkflowName(workflow.workflowName);
            setCurrentWorkflowId(null);
            
            // Set workflow phase metadata
            setWorkflowPhaseNodes(workflow.phases.nodes);
            setWorkflowPhaseEdges(workflow.phases.edges);
            
            // Fit view after a short delay to ensure nodes are rendered
            setTimeout(() => {
              if (reactFlowInstance) {
                reactFlowInstance.fitView({ padding: 0.3, duration: 600, minZoom: 0.3, maxZoom: 1.5 });
              }
            }, 200);
            
            console.log('[WorkflowBuilder] Workflow created successfully, nodes and edges set in state');
          } catch (error: any) {
            console.error('[WorkflowBuilder] Error creating default workflow:', error);
            console.error('[WorkflowBuilder] Error stack:', error.stack);
            alert(`Failed to create ${useCaseType} workflow: ${error.message}`);
          }
        });
    } else {
      // Reset canvas for other workflow types
      setNodes([
        {
          id: 'orchestrator',
          type: 'orchestrator',
          position: { x: 400, y: 300 },
          data: { label: 'Orchestrator' },
        },
      ]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, setSelectedNode, setCurrentWorkflowId, setCurrentWorkflowName, setWorkflowPhaseNodes, setWorkflowPhaseEdges]);
  
  // Store handleCreateWorkflow in ref for event listener
  useEffect(() => {
    handleCreateWorkflowRef.current = handleCreateWorkflow;
  }, [handleCreateWorkflow]);
  
  // Listen for workflow creation events from sidebar
  useEffect(() => {
    const handleWorkflowCreate = (event: CustomEvent) => {
      const { workflowId } = event.detail;
      console.log('[WorkflowBuilder] Received workflow create event:', workflowId);
      if (workflowId && handleCreateWorkflowRef.current) {
        console.log('[WorkflowBuilder] Calling handleCreateWorkflow with:', workflowId);
        handleCreateWorkflowRef.current(workflowId);
      } else {
        console.warn('[WorkflowBuilder] Missing workflowId or handleCreateWorkflowRef not set', { workflowId, hasRef: !!handleCreateWorkflowRef.current });
      }
    };

    window.addEventListener('designer:create-workflow', handleWorkflowCreate as EventListener);
    
    // Listen for mode documentation open events
    const handleOpenModeDocs = (event: CustomEvent) => {
      const { mode } = event.detail;
      console.log('[WorkflowBuilder] Received open mode docs event:', mode);
      if (mode === 'mode1') {
        console.log('[WorkflowBuilder] Opening Mode 1 docs');
        setShowMode1Docs(true);
      } else if (mode === 'mode2') {
        console.log('[WorkflowBuilder] Opening Mode 2 docs');
        setShowMode2Docs(true);
      } else if (mode === 'mode3') {
        console.log('[WorkflowBuilder] Opening Mode 3 docs');
        setShowMode3Docs(true);
      } else if (mode === 'mode4') {
        console.log('[WorkflowBuilder] Opening Mode 4 docs');
        setShowMode4Docs(true);
      } else {
        console.warn('[WorkflowBuilder] Unknown mode for docs:', mode);
      }
    };
    
    window.addEventListener('designer:open-mode-docs', handleOpenModeDocs as EventListener);
    
    return () => {
      window.removeEventListener('designer:create-workflow', handleWorkflowCreate as EventListener);
      window.removeEventListener('designer:open-mode-docs', handleOpenModeDocs as EventListener);
    };
  }, []);

  // Helper function to generate reasoning text based on expert response
  const generateReasoning = (expertName: string, content: string, question?: string): string => {
    const reasoningSteps = [
      `Let me think about this question step by step.`,
      `\n\nFirst, I need to understand what's being asked.`,
      question ? `\n\nThe question is: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"` : '',
      `\n\nAs ${expertName}, I need to consider my expertise and provide a thoughtful response.`,
      `\n\nLet me analyze the key points and formulate my answer.`,
      `\n\nI should consider the context and provide a clear, well-reasoned response.`,
    ].filter(Boolean).join('');
    return reasoningSteps;
  };

  // Helper function to chunk text into tokens for streaming
  const chunkIntoTokens = useCallback((text: string): string[] => {
    const tokens: string[] = [];
    let i = 0;
    while (i < text.length) {
      const chunkSize = Math.floor(Math.random() * 2) + 3; // Random size between 3-4
      tokens.push(text.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return tokens;
  }, []);

  // Function to stream reasoning text with animation
  const streamReasoning = useCallback((
    messageId: string,
    reasoningText: string,
    onUpdate: (content: string) => void
  ) => {
    const tokens = chunkIntoTokens(reasoningText);
    let currentIndex = 0;

    const stream = () => {
      if (currentIndex >= tokens.length) {
        // Streaming complete
        setMessages((prev) => prev.map((msg) => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        return;
      }

      const currentContent = tokens.slice(0, currentIndex + 1).join('');
      onUpdate(currentContent);
      currentIndex++;

      setTimeout(stream, 25); // 25ms delay between tokens
    };

    stream();
  }, [chunkIntoTokens]);

  // Process expert response queue with delays
  const processExpertQueue = useCallback(async () => {
    if (isProcessingExpertQueueRef.current || expertResponseQueueRef.current.length === 0) {
      return;
    }

    isProcessingExpertQueueRef.current = true;

    while (expertResponseQueueRef.current.length > 0) {
      const processFn = expertResponseQueueRef.current.shift();
      if (processFn) {
        await processFn();
        // Add delay between expert responses (1.5 seconds)
        if (expertResponseQueueRef.current.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    isProcessingExpertQueueRef.current = false;
  }, []);

  const handleExecute = async () => {
    console.log('[WorkflowBuilder] handleExecute called');
    console.log('[WorkflowBuilder] Current nodes:', nodes.length);
    console.log('[WorkflowBuilder] Current edges:', edges.length);
    console.log('[WorkflowBuilder] Edges:', edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    
    if (!userQuery.trim()) {
      console.warn('[WorkflowBuilder] No user query provided');
      return;
    }
    
    if (edges.length === 0) {
      console.warn('[WorkflowBuilder] No edges found in workflow. Workflow may not be properly connected.');
      alert('Warning: No edges found in workflow. Please ensure nodes are connected.');
    }
    if (apiKeys.provider === 'openai' && !apiKeys.openai) {
      alert('Please configure your OpenAI API key in Settings');
      setShowSettings(true);
      return;
    }

    const query = userQuery;
    const currentQuery = query; // Store query for use in event handlers
    setUserQuery('');
    setIsExecuting(true);
    
    // Clear expert identities for new execution
    expertIdentityManager.clear();
    
    // Pre-register experts from workflow nodes
    nodes.forEach((node: Node) => {
      const taskData = node.data as any;
      if (taskData?.task?.id === 'expert_agent') {
        const expertName = taskData.label || taskData.task?.name || `Expert ${node.id}`;
        const expertType = taskData.expertType || taskData.context?.expertise?.[0];
        expertIdentityManager.getOrCreateExpert(expertName, expertType, node.id);
      }
    });

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add loading message
    const loadingMsg: Message = {
      id: `msg-loading-${Date.now()}`,
      type: 'assistant',
      content: '⏳ Processing your request...',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, loadingMsg]);

    // Detect panel workflow using multiple methods:
    // Note: Mode 1 is NOT a panel workflow - it uses a different execution system
    // 1. Check for panel-specific task IDs (moderator, expert_agent in panel format)
    // 2. Check metadata for panel_type
    const detectPanelType = (): 'structured' | 'open' | null => {
      // Method 1: Check task IDs for panel-specific tasks
      const taskIds: string[] = [];
      nodes.forEach(n => {
        const taskData = n.data as any;
        if (taskData?.task?.id) {
          taskIds.push(taskData.task.id);
        }
      });
      
      // Check for panel-specific tasks (moderator + expert_agent in panel context)
      // Mode 1 has different task structure, so it won't match this
      if (taskIds.includes('moderator') && taskIds.includes('expert_agent')) {
        // Check for structured panel tasks
        if (taskIds.includes('opening_statements') || taskIds.includes('discussion_round')) {
          return 'structured';
        }
        // Default to open panel if moderator + expert but no structured tasks
        return 'open';
      }
      
      return null;
    };

    const panelType = detectPanelType();
    const isPanelWorkflow = panelType !== null;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 10 * 60 * 1000); // 10 minutes for panel workflows

    try {
      let response: Response | null = null;
      
      if (isPanelWorkflow) {
        // Build workflow definition for panel execution
        const workflowDefinition = {
          id: currentWorkflowId || 'current-workflow',
          name: currentWorkflowName || 'Panel Workflow',
          description: 'Panel workflow execution',
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            label: (n.data as any)?.label || n.id,
            position: n.position,
            parameters: {},
            data: n.data || {}
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle
          })),
          metadata: {
            panel_type: panelType === 'mode1' ? 'mode1' : panelType,
            system_prompt: orchestratorPrompt,  // Workflow-level system prompt
            rounds: nodes.filter(n => {
              const taskData = n.data as any;
              return taskData?.task?.id === 'discussion_round';
            }).length || 3,
            consensus_threshold: 0.75,
            time_budget: 600,
            // Workflow phase nodes/edges (if configured)
            workflow_nodes: workflowPhaseNodes.length > 0 ? workflowPhaseNodes : [],
            workflow_edges: workflowPhaseEdges.length > 0 ? workflowPhaseEdges : [],
          }
        };

        // Use the API base URL (which goes through Next.js API proxy)
        // All panel workflows (including Mode 1) use panels/execute endpoint
        const panelExecuteUrl = `${apiBaseUrl || '/api/langgraph-gui'}/panels/execute`;
        console.log('[WorkflowBuilder] Executing panel workflow:', {
          url: panelExecuteUrl,
          panelType: panelType === 'mode1' ? 'mode1' : panelType,
          workflowId: currentWorkflowId,
          nodeCount: nodes.length,
          edgeCount: edges.length
        });
        response = await fetch(panelExecuteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            openai_api_key: apiKeys.openai,
            pinecone_api_key: apiKeys.pinecone || '',
            provider: apiKeys.provider || 'openai',
            ollama_base_url: apiKeys.ollama_base_url || 'http://localhost:11434',
            ollama_model: apiKeys.ollama_model || 'qwen3:4b',
            workflow: workflowDefinition,
            panel_type: panelType === 'mode1' ? 'mode1' : panelType,  // Explicit panel type (mode1, structured, or open)
            user_id: 'user'
          }),
          signal: abortController.signal,
        });
        console.log('[WorkflowBuilder] Panel workflow response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });
      } else {
        // Regular workflow execution
        const enabledTasks = getEnabledTasks();
        
        if (enabledTasks.length === 0) {
          setIsExecuting(false);
          setMessages((prev) => {
            const filtered = prev.filter(msg => !msg.id.startsWith('msg-loading-'));
            return [...filtered, {
              id: `msg-error-${Date.now()}`,
              type: 'assistant',
              content: '⚠️ No tasks connected! Please connect task nodes to the Orchestrator node to enable them.',
              timestamp: new Date().toLocaleTimeString(),
            }];
          });
          return;
        }

        // Get assigned agents from task nodes, or use enabled tasks as fallback
        const assignedAgents = getAssignedAgents();
        const agentsToUse = assignedAgents.length > 0 ? assignedAgents : enabledTasks;

        try {
          // Use the Next.js API proxy route instead of hardcoded localhost
          const executeUrl = `${apiBaseUrl || '/api/langgraph-gui'}/execute`;
          console.log('[WorkflowBuilder] Executing regular workflow:', {
            url: executeUrl,
            enabledTasks: agentsToUse,
            taskCount: agentsToUse.length
          });
          response = await fetch(executeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              openai_api_key: apiKeys.openai,
              pinecone_api_key: apiKeys.pinecone || '',
              provider: apiKeys.provider || 'openai',
              ollama_base_url: apiKeys.ollama_base_url || 'http://localhost:11434',
              ollama_model: apiKeys.ollama_model || 'qwen3:4b',
              orchestrator_system_prompt: orchestratorPrompt,
              enabled_agents: agentsToUse,
            }),
            signal: abortController.signal,
          });
          console.log('[WorkflowBuilder] Regular workflow response:', {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          });
        } catch (error: any) {
          console.error('Fetch error:', error);
          setIsExecuting(false);
          setMessages((prev) => {
            const filtered = prev.filter(msg => !msg.id.startsWith('msg-loading-'));
            return [...filtered, {
              id: `msg-error-${Date.now()}`,
              type: 'assistant',
              content: `❌ Error: Failed to connect to backend API. Please check your API configuration and ensure the backend service is running. Error: ${error.message}`,
              timestamp: new Date().toLocaleTimeString(),
            }];
          });
          return;
        }
      }

      clearTimeout(timeoutId);

      if (!response) {
        throw new Error('No response received from the backend. Check the console for errors.');
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Backend error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            try {
              const errorJson = JSON.parse(errorData);
              errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorData.length > 200 ? errorData.substring(0, 200) + '...' : errorData;
            }
          }
        } catch (e) {
          // If we can't read the error, use the status
          console.error('Failed to read error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Check if response is streaming (SSE) or regular JSON
      const contentType = response.headers.get('content-type') || '';
      const isStreaming = contentType.includes('text/event-stream') || contentType.includes('text/plain');
      
      if (!isStreaming) {
        // Handle non-streaming error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `Backend error: ${response.status} ${response.statusText}`);
        } catch (e: any) {
          if (e.message && !e.message.includes('Backend error')) {
            throw e;
          }
          // If JSON parsing fails, try text
          const errorText = await response.text();
          throw new Error(errorText || `Backend error: ${response.status} ${response.statusText}`);
        }
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('No response body - backend may not be responding correctly');
      }

      const decoder = new TextDecoder();
      let finalReport = '';
      let buffer = '';
      let eventCount = 0;
      let hasReceivedEvents = false;
      
      // Remove loading message
      setMessages((prev) => prev.filter(msg => !msg.id.startsWith('msg-loading-')));

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Stream ended - check if we got any events
          if (!hasReceivedEvents && eventCount === 0) {
            throw new Error('Backend stream ended without sending any events. The backend may have crashed or encountered an error. Check backend logs.');
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Handle SSE format: "data: {json}\n\n"
          if (!line.startsWith('data: ')) {
            // Skip non-data lines (like "event: ..." or empty lines)
            continue;
          }

          const data = line.slice(6).trim();
          if (data === '[DONE]' || data === '') continue;

          try {
            const event = JSON.parse(data);
            eventCount++;
            hasReceivedEvents = true;
            
            // Debug: Log all events to console
            console.log('[WorkflowBuilder] Received event:', {
              type: event.type,
              hasData: !!event.data,
              isPanelWorkflow,
              eventCount,
              event
            });

            // Handle panel events (both structured and open)
            if (isPanelWorkflow) {
              if (event.type === 'panel_initialized') {
                const expertCount = event.data?.experts || event.data?.data?.experts || 0;
                const statusMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Panel initialized (${panelType}): ${expertCount} experts`,
                  timestamp: new Date().toLocaleTimeString(),
                  taskTitle: 'Initializing Panel',
                  isTaskActive: false,
                  taskItems: [
                    { text: 'Detecting panel type', completed: true },
                    { text: `Found ${expertCount} expert${expertCount !== 1 ? 's' : ''}`, completed: true },
                    { text: 'Setting up workflow structure', completed: true },
                    { text: 'Panel ready for execution', completed: true },
                  ],
                };
                setMessages((prev) => [...prev, statusMsg]);
              } else if (event.type === 'phase_start') {
                const phaseName = event.data?.phase || event.data?.data?.phase || 'unknown';
                const phaseMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Starting phase: ${phaseName}`,
                  timestamp: new Date().toLocaleTimeString(),
                  isPhaseStatus: true,
                  taskTitle: `Executing ${phaseName}`,
                  isTaskActive: true,
                  taskItems: [
                    { text: 'Preparing phase execution', completed: true },
                    { text: 'Loading expert configurations', completed: true },
                    { text: 'Initializing phase workflow', completed: false },
                  ],
                };
                setMessages((prev) => [...prev, phaseMsg]);
              } else if (event.type === 'expert_speaking' || event.type === 'moderator_speaking') {
                const eventData = event.data?.data || event.data || {};
                const isExpert = event.type === 'expert_speaking';
                const speaker = isExpert ? eventData.expert_name || 'Expert' : 'Moderator';
                const content = eventData.content || '';
                
                // Extract expert type from workflow nodes if available
                let expertType: string | undefined;
                let expertNodeId: string | undefined;
                if (isExpert) {
                  // Try to find expert node by name
                  const expertNode = nodes.find((n: Node) => {
                    const taskData = n.data as any;
                    const nodeLabel = taskData?.label || '';
                    const taskName = taskData?.task?.name || '';
                    return nodeLabel.includes(speaker) || taskName.includes(speaker) || 
                           (taskData?.task?.id === 'expert_agent' && nodeLabel.toLowerCase().includes('expert'));
                  });
                  
                  if (expertNode) {
                    expertNodeId = expertNode.id;
                    const taskData = expertNode.data as any;
                    expertType = taskData?.expertType || taskData?.context?.expertise?.[0] || undefined;
                  }
                }
                
                // Get or create expert identity
                let expertIdentity = null;
                if (isExpert) {
                  expertIdentity = expertIdentityManager.getOrCreateExpert(
                    speaker,
                    expertType,
                    expertNodeId || speaker
                  );
                }
                
                // Extract sources from content if available
                const sources: Array<{ title: string; url: string }> = [];
                if (eventData.sources) {
                  sources.push(...eventData.sources);
                } else {
                  // Try to extract URLs from content
                  const urlRegex = /(https?:\/\/[^\s]+)/g;
                  const urls = content.match(urlRegex);
                  if (urls) {
                    urls.forEach((url: string, idx: number) => {
                      sources.push({ title: `Source ${idx + 1}`, url });
                    });
                  }
                }
                
                // Generate reasoning for expert responses
                const reasoningText = isExpert ? generateReasoning(speaker, content, currentQuery) : undefined;
                
                // Create message with reasoning
                const messageId = `msg-${Date.now()}-${Math.random()}`;
                const contentMsg: Message = {
                  id: messageId,
                  type: isExpert ? 'expert' : 'moderator',
                  content: content,
                  timestamp: new Date().toLocaleTimeString(),
                  name: speaker,
                  sources: sources.length > 0 ? sources : undefined,
                  reasoning: reasoningText,
                  isStreaming: isExpert && reasoningText ? true : false,
                  expertId: expertIdentity?.id,
                  expertType: expertType,
                };
                
                // For expert responses, add to queue with delay
                if (isExpert) {
                  expertResponseQueueRef.current.push(async () => {
                    // Add message first
                    setMessages((prev) => [...prev, contentMsg]);
                    
                    // Stream reasoning if available
                    if (reasoningText) {
                      streamReasoning(messageId, reasoningText, (reasoningContent) => {
                        setMessages((prev) => prev.map((msg) => 
                          msg.id === messageId 
                            ? { ...msg, reasoning: reasoningContent, isStreaming: true }
                            : msg
                        ));
                      });
                    }
                  });
                  
                  // Process queue
                  processExpertQueue();
                } else {
                  // Moderator responses are immediate (no delay)
                  setMessages((prev) => [...prev, contentMsg]);
                }
              } else if (event.type === 'consensus_update') {
                const consensusData = event.data?.data || event.data || {};
                const consensusMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Consensus update: ${(consensusData.consensus_level || 0) * 100}% (Round ${consensusData.round || '?'})`,
                  timestamp: new Date().toLocaleTimeString(),
                };
                setMessages((prev) => [...prev, consensusMsg]);
              } else if (event.type === 'consensus_reached') {
                const consensusData = event.data?.data || event.data || {};
                const consensusMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `✅ Consensus reached: ${(consensusData.consensus_level || 0) * 100}%\n\n**Recommendation:**\n${consensusData.recommendation || ''}`,
                  timestamp: new Date().toLocaleTimeString(),
                };
                setMessages((prev) => [...prev, consensusMsg]);
              } else if (event.type === 'theme_analysis' || event.type === 'synthesis_complete') {
                const themeData = event.data?.data || event.data || {};
                const themeMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Theme analysis complete. Clusters identified: ${themeData.clusters?.length || 0}`,
                  timestamp: new Date().toLocaleTimeString(),
                };
                setMessages((prev) => [...prev, themeMsg]);
              } else if (event.type === 'panel_complete') {
                const panelData = event.data?.data || event.data || {};
                const completeMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Panel complete! Consensus: ${(panelData.consensus_level || 0) * 100}%`,
                  timestamp: new Date().toLocaleTimeString(),
                  isPhaseStatus: true,
                };
                setMessages((prev) => [...prev, completeMsg]);
              } else if (event.type === 'phase_complete') {
                const phaseData = event.data?.data || event.data || {};
                const phaseMsg: Message = {
                  id: `msg-${Date.now()}`,
                  type: 'assistant',
                  content: `Phase complete: ${phaseData.phase || 'unknown'}`,
                  timestamp: new Date().toLocaleTimeString(),
                  isPhaseStatus: true,
                };
                setMessages((prev) => [...prev, phaseMsg]);
              } else if (event.type === 'complete') {
                // Final completion event
                const completeData = event.data?.data || event.data || {};
                finalReport = completeData.final_report || event.result || finalReport;
              } else if (event.type === 'error') {
                throw new Error(event.message || event.data?.message || 'Unknown error');
              } else if (event.type === 'log') {
                // Log events - display in chat with proper formatting
                const logLevel = event.level || event.data?.level || 'info';
                const logMessage = event.message || event.data?.message || '';
                
                // Check if this is a task-related log that should show as Task component
                let taskTitle: string | undefined;
                let taskItems: Array<{ text: string; completed?: boolean; file?: string }> | undefined;
                let isTaskActive = false;
                
                // Detect initialization logs
                if (logMessage.includes('Initializing') || logMessage.includes('Building workflow')) {
                  taskTitle = 'Setting Up Workflow';
                  isTaskActive = true;
                  taskItems = [
                    { text: 'Parsing workflow definition', completed: logMessage.includes('Building') },
                    { text: 'Extracting task nodes', completed: false },
                    { text: 'Configuring expert agents', completed: false },
                  ];
                } else if (logMessage.includes('Extracted') && logMessage.includes('tasks')) {
                  // Extract number of tasks
                  const taskMatch = logMessage.match(/(\d+)\s+tasks?/);
                  if (taskMatch) {
                    taskTitle = 'Setting Up Workflow';
                    isTaskActive = true;
                    taskItems = [
                      { text: 'Parsing workflow definition', completed: true },
                      { text: `Extracted ${taskMatch[1]} task${taskMatch[1] !== '1' ? 's' : ''}`, completed: true },
                      { text: 'Configuring expert agents', completed: false },
                    ];
                  }
                } else if (logMessage.includes('Found') && logMessage.includes('expert')) {
                  const expertMatch = logMessage.match(/(\d+)\s+expert/);
                  if (expertMatch) {
                    taskTitle = 'Setting Up Workflow';
                    isTaskActive = true;
                    taskItems = [
                      { text: 'Parsing workflow definition', completed: true },
                      { text: 'Extracting task nodes', completed: true },
                      { text: `Found ${expertMatch[1]} expert${expertMatch[1] !== '1' ? 's' : ''}`, completed: true },
                    ];
                  }
                } else if (logMessage.includes('Using') && logMessage.includes('model')) {
                  // Model selection log
                  const modelMatch = logMessage.match(/Using\s+(\w+)\s+model:\s+([^\s]+)/);
                  if (modelMatch) {
                    taskTitle = 'Configuring AI Models';
                    isTaskActive = false;
                    taskItems = [
                      { text: `Selected ${modelMatch[1]} provider`, completed: true },
                      { text: `Using model: `, completed: true, file: modelMatch[2] },
                    ];
                  }
                }
                
                const logMsg: Message = {
                  id: `msg-log-${Date.now()}-${Math.random()}`,
                  type: 'log',
                  content: logMessage,
                  timestamp: new Date().toLocaleTimeString(),
                  level: logLevel as 'info' | 'success' | 'warning' | 'error',
                  taskTitle,
                  taskItems,
                  isTaskActive,
                };
                setMessages((prev) => [...prev, logMsg]);
              }
            } else {
              // Regular workflow events (including Mode 1)
              // ALWAYS display events - even if we don't recognize the type
              let shouldDisplay = true;
              let displayContent = '';
              
              if (event.type === 'complete') {
                finalReport = event.result || event.data?.result || event.data?.final_report || '';
                displayContent = finalReport || 'Workflow completed successfully.';
              } else if (event.type === 'error') {
                throw new Error(event.message || event.data?.message || 'Unknown error');
              } else if (event.type === 'log') {
                // Handle log events for regular workflows
                const logLevel = event.level || event.data?.level || 'info';
                const logMessage = event.message || event.data?.message || JSON.stringify(event);
                displayContent = logMessage;
              } else if (event.type === 'node_output' || event.type === 'task_output') {
                // Handle node/task output events
                const nodeName = event.node_name || event.node_id || event.data?.node_name || 'Task';
                const output = event.output || event.result || event.data?.output || event.data?.result || '';
                displayContent = `**${nodeName}**: ${output}`;
              } else {
                // Handle ANY other event type - always display something
                console.log('[WorkflowBuilder] Event received (regular workflow):', event.type, event);
                
                // Try to extract meaningful content from various event structures
                if (event.message) {
                  displayContent = event.message;
                } else if (event.data) {
                  if (typeof event.data === 'string') {
                    displayContent = event.data;
                  } else if (event.data.content) {
                    displayContent = event.data.content;
                  } else if (event.data.message) {
                    displayContent = event.data.message;
                  } else if (event.data.result) {
                    displayContent = typeof event.data.result === 'string' ? event.data.result : JSON.stringify(event.data.result, null, 2);
                  } else {
                    displayContent = JSON.stringify(event.data, null, 2);
                  }
                } else if (event.result) {
                  displayContent = typeof event.result === 'string' ? event.result : JSON.stringify(event.result, null, 2);
                } else if (event.content) {
                  displayContent = event.content;
                } else if (event.type) {
                  // Even if we don't know the structure, show the event type and data
                  displayContent = `[${event.type}] ${JSON.stringify(event, null, 2).substring(0, 500)}`;
                } else {
                  // Last resort: show the entire event
                  displayContent = JSON.stringify(event, null, 2).substring(0, 500);
                }
              }
              
              // Always display the content if we have something to show
              if (shouldDisplay && displayContent) {
                setMessages((prev) => [...prev, {
                  id: `msg-${event.type || 'event'}-${Date.now()}-${Math.random()}`,
                  type: 'assistant',
                  content: displayContent,
                  timestamp: new Date().toLocaleTimeString(),
                }]);
              }
            }
          } catch (e) {
            console.error('Parse error:', e, 'Line:', line);
            // If it's not valid JSON, it might be a plain error message
            if (data && !data.startsWith('{')) {
              // Treat as plain text error message
              setMessages((prev) => [...prev, {
                id: `msg-parse-error-${Date.now()}`,
                type: 'assistant',
                content: `⚠️ Backend message: ${data}`,
                timestamp: new Date().toLocaleTimeString(),
              }]);
            }
          }
        }
      }

      // Debug: Log final state
      console.log('[WorkflowBuilder] Stream completed:', {
        eventCount,
        hasReceivedEvents,
        finalReport: !!finalReport,
        finalReportLength: finalReport?.length || 0,
        currentMessagesCount: messages.length
      });

      // Add assistant response
      if (finalReport) {
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          type: 'assistant',
          content: finalReport,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Check if we received any messages - if yes, workflow completed but no final report
        const hasMessages = messages.some(msg => 
          msg.type === 'expert' || msg.type === 'moderator' || msg.type === 'assistant' || msg.type === 'log'
        );
        if (hasMessages) {
          // Workflow completed but no final report - this is okay for some workflows
          const assistantMsg: Message = {
            id: `msg-complete-${Date.now()}`,
            type: 'assistant',
            content: '✅ Workflow execution completed. Review the discussion above.',
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // No messages at all - likely an error
          const errorDetails = eventCount === 0 
            ? `The backend stream ended without sending any events (received ${eventCount} events). This usually means:\n• The backend encountered an error during execution\n• The backend service is not running\n• There was a network connectivity issue\n• The workflow executor didn't produce any events\n\nCheck the browser console (look for "[WorkflowBuilder] Received event:" logs) and backend logs for more details.`
            : `Workflow completed but no messages were displayed. Received ${eventCount} events but none were displayed. Check the console for "[WorkflowBuilder] Received event:" logs to see what events were received.`;
          
          setMessages((prev) => [...prev, {
            id: `msg-no-response-${Date.now()}`,
            type: 'assistant',
            content: `⚠️ ${errorDetails}`,
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      setIsExecuting(false);
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.id.startsWith('msg-loading-'));
        const errorMsg: Message = {
          id: `msg-error-${Date.now()}`,
          type: 'assistant',
          content: error.name === 'AbortError' 
            ? '⏱️ Request timed out after 3 minutes. Try a more specific query.'
            : `❌ Error: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={`flex flex-col ${embedded ? 'h-full' : 'h-screen'} overflow-hidden min-h-0 ${className}`}>
      {/* Hidden file input - always available for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportWorkflow}
        onClick={(e) => {
          // Reset value to allow selecting the same file again
          (e.target as HTMLInputElement).value = '';
        }}
      />
      
      {/* Header - Show actions bar in embedded mode */}
      {embedded ? (
        <div className="border-b bg-background px-4 py-2 flex items-center justify-end gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings size={16} className="mr-2" />
                Actions
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowChat(true)} disabled={isExecuting}>
                <MessageCircle size={16} className="mr-2" />
                Test Workflow
              </DropdownMenuItem>
              {isPanelWorkflow && (
                <DropdownMenuItem onClick={() => setShowWorkflowPhaseEditor(true)}>
                  <Layers size={16} className="mr-2" />
                  Configure Phases
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowCodeView(!showCodeView)}>
                <Layers size={16} className="mr-2" />
                {showCodeView ? 'Canvas View' : 'Code View'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {currentWorkflowId && (
                <DropdownMenuItem onClick={handleSaveWorkflow} disabled={isSaving}>
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Workflow'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => {
                const laidOutNodes = autoLayoutWorkflow(nodes, edges);
                setNodes(laidOutNodes);
                setTimeout(() => {
                  if (reactFlowInstance) {
                    reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
                  }
                }, 100);
              }}>
                <Layout size={16} className="mr-2" />
                Auto Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWorkflow} disabled={nodes.length === 0}>
                <Download size={16} className="mr-2" />
                Export Workflow
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  console.log('Import selected, fileInputRef:', fileInputRef.current);
                  // Use setTimeout to ensure dropdown closes first
                  setTimeout(() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    } else {
                      console.error('File input ref is null');
                      alert('File input not found. Please refresh the page.');
                    }
                  }, 100);
                }}
              >
                <Upload size={16} className="mr-2" />
                Import Workflow
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      ) : (
      <header className="bg-gradient-to-r from-primary to-gray-900 text-white px-8 py-6 flex justify-between items-center shadow-md z-50">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-4xl">🔬</span>
            {embedded ? 'Workflow Builder' : 'Pharma Intelligence'}
          </h1>
          {!embedded && <p className="text-sm opacity-90">Visual Workflow Builder</p>}
      </div>
        <div className="flex gap-3">
          <Button
            variant={showCodeView ? "secondary" : "outline"}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => {
              setShowCodeView(!showCodeView);
            }}
            title={showCodeView ? 'Switch to Canvas View' : 'Switch to Code View'}
          >
            <Layers size={18} className="mr-2" />
            {showCodeView ? 'Canvas View' : 'Code View'}
          </Button>
          {isPanelWorkflow && (
            <Button
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => setShowWorkflowPhaseEditor(true)}
              title="Configure Workflow Phases"
            >
              <Layers size={18} className="mr-2" />
              Configure Phases
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => setShowChat(true)}
            disabled={isExecuting}
          >
            <MessageCircle size={18} className="mr-2" />
            Test Workflow
          </Button>
          {currentWorkflowId && (
            <Button
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={handleSaveWorkflow}
              disabled={isSaving}
              title="Save Workflow"
            >
              <Save size={18} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => {
              const laidOutNodes = autoLayoutWorkflow(nodes, edges);
              setNodes(laidOutNodes);
              setTimeout(() => {
                if (reactFlowInstance) {
                  reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
                }
              }, 100);
            }}
            title="Auto-layout workflow for better readability"
          >
            <Layout size={18} className="mr-2" />
            Auto Layout
          </Button>
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={handleExportWorkflow}
            disabled={nodes.length === 0}
            title="Export workflow as JSON file"
          >
            <Download size={18} className="mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Import button clicked, fileInputRef:', fileInputRef.current);
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                console.error('File input ref is null');
              }
            }}
            title="Import workflow from JSON file"
          >
            <Upload size={18} className="mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
        </div>
      </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-0 overflow-hidden relative min-h-0" style={{ height: '100%', maxHeight: '100%' }}>
        {/* Left Sidebar - Node Palette */}
        {showNodePalette && (
          <div className="h-full flex-shrink-0 flex flex-col" style={{ maxHeight: '100%', overflow: 'hidden' }}>
            <NodePalette 
              onTaskDragStart={onTaskDragStart} 
              onConfigureTask={handleAddConfiguredTask}
              onCreateTask={() => setShowTaskBuilder(true)}
              onCombineTasks={() => setShowTaskCombiner(true)}
              onClose={() => setShowNodePalette(false)}
            />
          </div>
        )}
        
        {/* Toggle button when palette is hidden */}
        {!showNodePalette && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-1/2 left-0 -translate-y-1/2 bg-white border-l-0 rounded-l-none rounded-r-lg shadow-lg hover:bg-gray-50 text-primary z-40"
            onClick={() => setShowNodePalette(true)}
            title="Show Node Palette"
          >
            <Sparkles size={20} />
          </Button>
        )}

        {/* React Flow Canvas or Code View */}
        <div className="flex-1 bg-gray-50 relative min-h-0 h-full" ref={reactFlowWrapper}>
          {showCodeView ? (
            <div className="h-full overflow-auto">
              <WorkflowCodeView
                nodes={nodes}
                edges={edges}
                workflowName={currentWorkflowName}
                workflowPhaseNodes={workflowPhaseNodes}
                workflowPhaseEdges={workflowPhaseEdges}
              />
            </div>
          ) : (
            <div className="h-full w-full">
                     <ReactFlow
                       nodes={nodes}
                       edges={edges}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       onConnect={onConnect}
                       onEdgesDelete={onEdgesDelete}
                       onNodeClick={onNodeClick}
                       onNodeDoubleClick={onNodeDoubleClick}
                       onNodeDragStart={onNodeDragStart}
                       onNodeDrag={onNodeDrag}
                       onNodeDragStop={onNodeDragStop}
                       onPaneClick={onPaneClick}
                       onDrop={onDrop}
                       onDragOver={onDragOver}
                       onInit={setReactFlowInstance}
                       nodeTypes={nodeTypes}
                       nodesDraggable={true}
                       nodesConnectable={true}
                       elementsSelectable={true}
                       selectNodesOnDrag={false}
                       fitView
                       attributionPosition="bottom-left"
                       className="h-full w-full"
                     >
                <Background gap={16} size={1} />
                {showControls && <Controls position="top-right" />}
                <MiniMap />
              </ReactFlow>
              
              {/* Custom Controls Toggle */}
              <div className="absolute top-4 right-4 z-40">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white border-2 border-gray-300 hover:border-primary shadow-md"
                  onClick={() => setShowControls(!showControls)}
                  title={showControls ? 'Hide Controls' : 'Show Controls'}
                >
                  {showControls ? <X size={18} /> : <Maximize2 size={18} />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties Panel Only (Workflow Creator moved to left sidebar) */}
        {selectedNode && !showNodeConfig && (
          <div className="h-full overflow-hidden">
            <NodePropertiesPanel
              key={selectedNode?.id + JSON.stringify(selectedNode?.data)}
              node={selectedNode}
              onUpdate={handleNodeUpdate}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>

      {/* Chat Popup */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Test Your Workflow</DialogTitle>
                <DialogDescription>
                  Ask a research question to test your workflow
                </DialogDescription>
              </div>
              {messages.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileDown size={16} className="mr-2" />
                      Export
                      <ChevronDown size={16} className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportReport('markdown')}>
                      <FileText size={16} className="mr-2" />
                      Export as Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                      <FileDown size={16} className="mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <AIChatbot
              messages={messages.map(messageToChatMessage)}
              input={userQuery}
              isLoading={isExecuting}
              onInputChange={setUserQuery}
              onSubmit={(e) => {
                e.preventDefault();
                handleExecute();
              }}
              placeholder="Ask a research question..."
              showHeader={true}
              emptyState={
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2 font-medium">Ask a research question to test your workflow</p>
                  <p className="text-sm">
                    Connected tasks: {getEnabledTasks().length > 0 ? getEnabledTasks().join(', ') : 'None'}
                  </p>
                </div>
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Settings</DialogTitle>
            <DialogDescription>
              Configure your API keys and global system prompt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">LLM Provider</Label>
              <Select
                value={apiKeys.provider || 'openai'}
                onValueChange={(value: 'openai' | 'ollama') => setApiKeys((prev) => ({ ...prev, provider: value }))}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose between OpenAI or local Ollama</p>
            </div>

            {apiKeys.provider === 'openai' ? (
              <div className="space-y-2">
                <Label htmlFor="openai-key">
                  OpenAI API Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys((prev) => ({ ...prev, openai: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">Required for OpenAI API</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ollama-url">Ollama Base URL</Label>
                  <Input
                    id="ollama-url"
                    type="text"
                    placeholder="http://localhost:11434"
                    value={apiKeys.ollama_base_url}
                    onChange={(e) => setApiKeys((prev) => ({ ...prev, ollama_base_url: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">Ollama server URL (default: http://localhost:11434)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ollama-model">Ollama Model Name</Label>
                  <Input
                    id="ollama-model"
                    type="text"
                    placeholder="qwen3:4b"
                    value={apiKeys.ollama_model}
                    onChange={(e) => setApiKeys((prev) => ({ ...prev, ollama_model: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">Model name (e.g., qwen2.5:4b, llama3, mistral)</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="pinecone-key">
                Pinecone API Key <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
              </Label>
              <Input
                id="pinecone-key"
                type="password"
                placeholder="pcsk_..."
                value={apiKeys.pinecone}
                onChange={(e) => setApiKeys((prev) => ({ ...prev, pinecone: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">Optional - enables knowledge base archiving</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-prompt">
                Global System Prompt <span className="text-muted-foreground text-sm font-normal">(Used by Orchestrator)</span>
              </Label>
              <Textarea
                id="system-prompt"
                placeholder="Set the system prompt that will guide all tasks. Users can still provide a user prompt per task."
                rows={4}
                value={orchestratorPrompt}
                onChange={(e) => setOrchestratorPrompt(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">This prompt is applied globally. Per-task System Prompts are disabled.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={saveApiKeys}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Flow Modal */}
      {taskFlowModal.isOpen && taskFlowModal.taskNodeId && (() => {
        return <TaskFlowModal
          isOpen={taskFlowModal.isOpen}
          onClose={() => setTaskFlowModal({ isOpen: false, taskNodeId: null, taskName: '' })}
          taskNodeId={taskFlowModal.taskNodeId}
          taskName={taskFlowModal.taskName}
          subflow={(nodes.find((n) => n.id === taskFlowModal.taskNodeId)?.data as any)?.subflow || null}
          onSave={(subflow) => {
            if (taskFlowModal.taskNodeId) {
              handleSaveSubflow(taskFlowModal.taskNodeId, subflow);
            }
          }}
          onTaskDragStart={onTaskDragStart}
          onCreateTask={() => setShowTaskBuilder(true)}
          onCombineTasks={() => setShowTaskCombiner(true)}
        />;
      })()}

      {/* Node Config Modal */}
      <Dialog open={showNodeConfig && !!selectedNode} onOpenChange={(open) => {
        if (!open) {
          setShowNodeConfig(false);
          setSelectedNode(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Edit Task Configuration</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1 px-6 py-4">
            {selectedNode && (
              <NodePropertiesPanel
                key={selectedNode?.id + JSON.stringify(selectedNode?.data)}
                node={selectedNode}
                onUpdate={(nodeId, updates) => { 
                  handleNodeUpdate(nodeId, updates);
                  // Don't close the panel - let user see the updated values
                }}
                onClose={() => { 
                  setShowNodeConfig(false); 
                  setSelectedNode(null); 
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Builder Modal */}
      <TaskBuilder
        isOpen={showTaskBuilder}
        onClose={() => setShowTaskBuilder(false)}
        onSave={handleSaveCustomTask}
      />

      {/* Task Combiner Modal */}
      <TaskCombiner
        isOpen={showTaskCombiner}
        onClose={() => setShowTaskCombiner(false)}
        onSave={handleSaveCustomTask}
        availableTasks={[...TASK_DEFINITIONS, ...customTasks]}
        openaiApiKey={apiKeys.openai}
      />

      {/* Agent Configuration Modal */}
      <AgentConfigModal
        open={agentConfigModal.isOpen}
        onClose={() => setAgentConfigModal({ isOpen: false, nodeId: null, currentAgent: null })}
        onSelectAgent={handleSelectAgent}
        currentAgent={agentConfigModal.currentAgent}
        nodeId={agentConfigModal.nodeId || undefined}
      />

      {/* Workflow Phase Editor Modal */}
      <Dialog open={showWorkflowPhaseEditor && isPanelWorkflow} onOpenChange={setShowWorkflowPhaseEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Configure Workflow Phases</DialogTitle>
            <DialogDescription>
              Customize the workflow phases for your panel workflow
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <WorkflowPhaseEditor
              panelType={detectPanelType() === 'structured' ? 'structured' : 'open'}
              workflowNodes={workflowPhaseNodes}
              workflowEdges={workflowPhaseEdges}
              onUpdate={(nodes, edges) => {
                setWorkflowPhaseNodes(nodes);
                setWorkflowPhaseEdges(edges);
              }}
              onClose={() => setShowWorkflowPhaseEditor(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Mode Documentation Modals */}
      <Mode1Documentation
        isOpen={showMode1Docs}
        onClose={() => setShowMode1Docs(false)}
      />
      <Mode2Documentation
        isOpen={showMode2Docs}
        onClose={() => setShowMode2Docs(false)}
      />
      <Mode3Documentation
        isOpen={showMode3Docs}
        onClose={() => setShowMode3Docs(false)}
      />
      <Mode4Documentation
        isOpen={showMode4Docs}
        onClose={() => setShowMode4Docs(false)}
      />
    </div>
  );
}

export default WorkflowBuilder;
