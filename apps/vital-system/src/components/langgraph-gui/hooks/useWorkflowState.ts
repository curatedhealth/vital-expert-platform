import { useState, useEffect, useRef } from 'react';
import { Node, Edge } from 'reactflow';

/**
 * API Keys configuration interface
 */
export interface ApiKeys {
  openai: string;
  pinecone: string;
  provider: 'openai' | 'ollama';
  ollama_base_url: string;
  ollama_model: string;
}

/**
 * Message interface for workflow chat
 */
export interface WorkflowMessage {
  id: string;
  type: 'user' | 'assistant' | 'log' | 'expert' | 'moderator';
  content: string;
  timestamp: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  name?: string;
  sources?: Array<{ title: string; url: string }>;
  isPhaseStatus?: boolean;
  reasoning?: string;
  isStreaming?: boolean;
  agentId?: string;
  expertId?: string;
  expertType?: string;
  taskTitle?: string;
  taskItems?: Array<{ text: string; completed?: boolean; file?: string }>;
  isTaskActive?: boolean;
}

/**
 * Task flow modal state
 */
export interface TaskFlowModalState {
  isOpen: boolean;
  taskNodeId: string | null;
  taskName: string;
}

/**
 * Agent config modal state
 */
export interface AgentConfigModalState {
  isOpen: boolean;
  nodeId: string | null;
  currentAgent: any | null;
}

const DEFAULT_API_KEYS: ApiKeys = {
  openai: '',
  pinecone: '',
  provider: 'openai',
  ollama_base_url: 'http://localhost:11434',
  ollama_model: 'qwen3:4b',
};

/**
 * Load API keys from localStorage
 */
function loadApiKeys(): ApiKeys {
  try {
    const saved = localStorage.getItem('pharma_api_keys');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        openai: parsed.openai || '',
        pinecone: parsed.pinecone || '',
        provider: parsed.provider || 'openai',
        ollama_base_url: parsed.ollama_base_url || DEFAULT_API_KEYS.ollama_base_url,
        ollama_model: parsed.ollama_model || DEFAULT_API_KEYS.ollama_model,
      };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_API_KEYS;
}

/**
 * Hook for managing workflow builder state
 * Extracts state management from WorkflowBuilder.tsx
 */
export function useWorkflowState(initialApiKeys?: Partial<ApiKeys>) {
  // Core state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<WorkflowMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // API keys with localStorage persistence
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const loaded = loadApiKeys();
    return initialApiKeys ? { ...loaded, ...initialApiKeys } : loaded;
  });

  // UI visibility state
  const [showControls, setShowControls] = useState(true);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  const [showTaskBuilder, setShowTaskBuilder] = useState(false);
  const [showTaskCombiner, setShowTaskCombiner] = useState(false);
  const [showWorkflowPhaseEditor, setShowWorkflowPhaseEditor] = useState(false);

  // Documentation modals
  const [showMode1Docs, setShowMode1Docs] = useState(false);
  const [showMode2Docs, setShowMode2Docs] = useState(false);
  const [showMode3Docs, setShowMode3Docs] = useState(false);
  const [showMode4Docs, setShowMode4Docs] = useState(false);

  // Workflow state
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [taskFlowModal, setTaskFlowModal] = useState<TaskFlowModalState>({
    isOpen: false,
    taskNodeId: null,
    taskName: '',
  });

  const [agentConfigModal, setAgentConfigModal] = useState<AgentConfigModalState>({
    isOpen: false,
    nodeId: null,
    currentAgent: null,
  });

  // Workflow phase state
  const [workflowPhaseNodes, setWorkflowPhaseNodes] = useState<Node[]>([]);
  const [workflowPhaseEdges, setWorkflowPhaseEdges] = useState<Edge[]>([]);

  // Refs for stable callbacks
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expert response queue refs
  const expertResponseQueueRef = useRef<Array<() => void>>([]);
  const isProcessingExpertQueueRef = useRef(false);

  // Callback refs for node types
  const selectedNodeIdRef = useRef<string | null>(null);
  const handleNodeUpdateRef = useRef<((nodeId: string, newData: any) => void) | null>(null);
  const handleOpenSubflowRef = useRef<((nodeId: string) => void) | null>(null);
  const handleOpenTaskEditorRef = useRef<((nodeId: string) => void) | null>(null);
  const handleDeleteNodeRef = useRef<((nodeId: string) => void) | null>(null);
  const handleOpenAgentConfigRef = useRef<((nodeId: string) => void) | null>(null);
  const handleCreateWorkflowRef = useRef<((useCaseType: string) => void) | null>(null);

  // Save API keys to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pharma_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Keep selectedNodeIdRef in sync
  useEffect(() => {
    selectedNodeIdRef.current = selectedNode?.id || null;
  }, [selectedNode]);

  return {
    // Core state
    selectedNode,
    setSelectedNode,
    showChat,
    setShowChat,
    showSettings,
    setShowSettings,
    messages,
    setMessages,
    userQuery,
    setUserQuery,
    isExecuting,
    setIsExecuting,
    apiKeys,
    setApiKeys,

    // UI visibility
    showControls,
    setShowControls,
    showNodePalette,
    setShowNodePalette,
    showNodeConfig,
    setShowNodeConfig,
    showCodeView,
    setShowCodeView,
    showTaskBuilder,
    setShowTaskBuilder,
    showTaskCombiner,
    setShowTaskCombiner,
    showWorkflowPhaseEditor,
    setShowWorkflowPhaseEditor,

    // Documentation modals
    showMode1Docs,
    setShowMode1Docs,
    showMode2Docs,
    setShowMode2Docs,
    showMode3Docs,
    setShowMode3Docs,
    showMode4Docs,
    setShowMode4Docs,

    // Workflow state
    currentWorkflowId,
    setCurrentWorkflowId,
    currentWorkflowName,
    setCurrentWorkflowName,
    isSaving,
    setIsSaving,

    // Modal states
    taskFlowModal,
    setTaskFlowModal,
    agentConfigModal,
    setAgentConfigModal,

    // Workflow phases
    workflowPhaseNodes,
    setWorkflowPhaseNodes,
    workflowPhaseEdges,
    setWorkflowPhaseEdges,

    // Refs
    reactFlowWrapper,
    reactFlowInstance,
    setReactFlowInstance,
    fileInputRef,
    expertResponseQueueRef,
    isProcessingExpertQueueRef,
    selectedNodeIdRef,
    handleNodeUpdateRef,
    handleOpenSubflowRef,
    handleOpenTaskEditorRef,
    handleDeleteNodeRef,
    handleOpenAgentConfigRef,
    handleCreateWorkflowRef,
  };
}

export default useWorkflowState;
