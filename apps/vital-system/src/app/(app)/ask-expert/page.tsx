'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Bot,
  User,
  Play,
  GitBranch,
  Database,
  ShieldCheck,
  UserCircle,
  History,
  Brain,
  FileSearch,
  Search,
  Sparkles,
  Radio,
  CheckCircle,
  Wrench,
  SkipForward,
  MessageSquare,
  Save,
  Settings,
  Layout,
  RefreshCw,
  Eye,
  Circle,
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Users,
  Target,
  Grid,
  type LucideIcon,
} from 'lucide-react';

// Context for shared agent selection
import { useAskExpert } from '@/contexts/ask-expert-context';

// HITL Components
import {
  ModeSelectionModal,
  UserPromptModal,
  ProgressTracker,
  PlanApprovalModal,
  ToolExecutionCard,
  SubAgentApprovalCard,
  FinalReviewPanel,
} from '@/features/ask-expert/components';

import { Button } from '@/components/ui/button';
import { PromptInput } from '@/components/prompt-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// AI Elements - Reasoning component
import {
  Reasoning,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';

// Collapsible for custom reasoning content
import {
  CollapsibleContent,
} from '@/components/ui/collapsible';

// AI Elements - Loader
import { Loader } from '@/components/ai-elements/loader';

// Streamdown for chat completion markdown streaming
import { Streamdown } from 'streamdown';

// Inline Citations
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation';

// Sources section (bottom)
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';

// Types - Agent type comes from context

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface ReasoningStep {
  key: string;
  label: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  reasoningSteps?: ReasoningStep[];
  sources?: Source[];
  confidence?: number;
  timestamp: Date;
  isStreaming?: boolean;
  reasoningComplete?: boolean;
  hitlCheckpoint?: HITLCheckpoint;
  spawnedAgents?: SpawnedAgent[];
}

// Mode 3: HITL Checkpoint types
interface HITLCheckpoint {
  id: string;
  type: 'plan' | 'tool' | 'subagent' | 'decision' | 'final';
  title: string;
  description: string;
  options?: HITLOption[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface HITLOption {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

interface SpawnedAgent {
  id: string;
  name: string;
  role: string;
  status: 'spawning' | 'running' | 'completed' | 'failed';
}

// Mode definitions - 2x2 matrix: Selection (Manual/Automatic) × Execution (Interactive/Autonomous)
type Mode = '1' | '2' | '3' | '4';

interface ModeConfig {
  id: Mode;
  name: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

const MODES: ModeConfig[] = [
  {
    id: '1',
    name: 'Ask Expert',
    description: 'Manual selection, interactive chat',
    icon: MessageSquare,
    features: ['Select your expert', 'Turn-by-turn conversation', 'Full control'],
  },
  {
    id: '2',
    name: 'Smart Routing',
    description: 'Auto-routed, interactive chat',
    icon: Sparkles,
    features: ['AI selects best expert', 'Turn-by-turn conversation', 'Efficient routing'],
  },
  {
    id: '3',
    name: 'Expert Mission',
    description: 'Manual selection, goal-driven execution',
    icon: Target,
    features: ['Select your expert', 'Autonomous execution', 'HITL checkpoints'],
  },
  {
    id: '4',
    name: 'Full Auto',
    description: 'AI-driven, goal-driven execution',
    icon: Zap,
    features: ['AI orchestration', 'Multi-agent collaboration', 'HITL checkpoints'],
  },
];

// HITL Safety levels for autonomous modes
type HITLSafetyLevel = 'strict' | 'balanced' | 'permissive';

// Use Next.js API proxy to avoid CORS issues
const STREAM_API_URL = '/api/ask-expert/stream';

// Ordered workflow steps with icons - covers all backend step keys
const WORKFLOW_STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  // Initialization
  { key: 'initializing', label: 'Starting up', icon: Play },
  { key: 'LangGraph', label: 'Processing workflow', icon: GitBranch },
  // Session & Validation
  { key: 'load_session', label: 'Loading session', icon: Database },
  { key: 'validate_tenant', label: 'Validating access', icon: ShieldCheck },
  { key: 'load_agent_profile', label: 'Loading expert profile', icon: UserCircle },
  { key: 'load_conversation_history', label: 'Retrieving context', icon: History },
  // Analysis
  { key: 'analyze_query_complexity', label: 'Analyzing question', icon: Brain },
  // RAG
  { key: 'should_use_rag', label: 'Checking knowledge base', icon: FileSearch },
  { key: 'rag_retrieval', label: 'Searching documents', icon: Search },
  // Tools
  { key: 'should_use_tools', label: 'Evaluating tools', icon: Wrench },
  { key: 'skip_tools', label: 'Skipping tools', icon: SkipForward },
  { key: 'execute_tools', label: 'Running tools', icon: Wrench },
  // Generation
  { key: 'execute_expert_agent', label: 'Consulting expert', icon: Sparkles },
  { key: 'generate_response', label: 'Generating response', icon: Sparkles },
  { key: 'generate_streaming_response', label: 'Streaming response', icon: Radio },
  { key: 'stream_response', label: 'Streaming answer', icon: Radio },
  // Validation & Finalization
  { key: 'validate_human_review', label: 'Reviewing response', icon: Eye },
  { key: 'save_message', label: 'Saving message', icon: Save },
  { key: 'update_session_metadata', label: 'Updating session', icon: Settings },
  { key: 'format_output', label: 'Formatting output', icon: Layout },
  { key: 'should_continue_conversation', label: 'Checking continuation', icon: RefreshCw },
  { key: 'finalize', label: 'Finalizing', icon: CheckCircle },
];

// Map step key to label
const STEP_LABELS: Record<string, string> = Object.fromEntries(
  WORKFLOW_STEPS.map(s => [s.key, s.label])
);

// Map step key to icon
const STEP_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  WORKFLOW_STEPS.map(s => [s.key, s.icon])
);

// Get step icon component - returns Circle as fallback for unknown steps
function getStepIcon(stepKey: string): LucideIcon {
  return STEP_ICONS[stepKey] || Circle;
}

// Format step name to user-friendly label
function formatStepName(step: string): string {
  if (STEP_LABELS[step]) {
    return STEP_LABELS[step];
  }
  // Convert snake_case to Title Case
  return step
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Parse extended thinking XML tags from LLM response
 * Extracts <thinking> content for reasoning panel and <answer> content for chat
 * Handles streaming where tags may be incomplete
 */
function parseExtendedThinking(content: string): {
  thinking: string;
  answer: string;
  hasThinkingTag: boolean;
  isComplete: boolean;
} {
  // Check for complete thinking tags
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
  const answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);

  // Check for incomplete tags (streaming in progress)
  const hasOpenThinking = content.includes('<thinking>') && !content.includes('</thinking>');
  const hasOpenAnswer = content.includes('<answer>') && !content.includes('</answer>');

  let thinking = '';
  let answer = content;

  if (thinkingMatch) {
    thinking = thinkingMatch[1].trim();
  } else if (hasOpenThinking) {
    // Extract partial thinking content
    const startIdx = content.indexOf('<thinking>') + '<thinking>'.length;
    thinking = content.slice(startIdx).trim();
  }

  if (answerMatch) {
    answer = answerMatch[1].trim();
  } else if (hasOpenAnswer) {
    // Extract partial answer content
    const startIdx = content.indexOf('<answer>') + '<answer>'.length;
    answer = content.slice(startIdx).trim();
  } else if (thinkingMatch || hasOpenThinking) {
    // If we have thinking but no answer tags, strip thinking from content
    answer = content
      .replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
      .replace(/<thinking>[\s\S]*/g, '')
      .replace(/<\/?answer>/g, '')
      .trim();
  }

  // Also clean any remaining XML tags from the answer
  answer = answer
    .replace(/<\/?thinking>/g, '')
    .replace(/<\/?answer>/g, '')
    .trim();

  return {
    thinking,
    answer,
    hasThinkingTag: !!thinkingMatch || hasOpenThinking,
    isComplete: !!thinkingMatch && !!answerMatch,
  };
}

// Get risk level styling for HITL checkpoints
function getRiskLevelStyles(riskLevel: HITLCheckpoint['risk_level']): {
  border: string;
  bg: string;
  badge: string;
  text: string;
} {
  switch (riskLevel) {
    case 'critical':
      return {
        border: 'border-red-500',
        bg: 'bg-red-500/10',
        badge: 'bg-red-500 text-white',
        text: 'text-red-600 dark:text-red-400',
      };
    case 'high':
      return {
        border: 'border-orange-500',
        bg: 'bg-orange-500/10',
        badge: 'bg-orange-500 text-white',
        text: 'text-orange-600 dark:text-orange-400',
      };
    case 'medium':
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500/10',
        badge: 'bg-yellow-500 text-black',
        text: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'low':
    default:
      return {
        border: 'border-green-500',
        bg: 'bg-green-500/10',
        badge: 'bg-green-500 text-white',
        text: 'text-green-600 dark:text-green-400',
      };
  }
}

// Get HITL checkpoint type icon and label
function getCheckpointTypeInfo(type: HITLCheckpoint['type']): { icon: LucideIcon; label: string } {
  switch (type) {
    case 'plan':
      return { icon: Target, label: 'Execution Plan' };
    case 'tool':
      return { icon: Wrench, label: 'Tool Execution' };
    case 'subagent':
      return { icon: Users, label: 'Agent Spawn' };
    case 'decision':
      return { icon: GitBranch, label: 'Decision Point' };
    case 'final':
      return { icon: CheckCircle, label: 'Final Review' };
    default:
      return { icon: AlertTriangle, label: 'Checkpoint' };
  }
}

export default function AskExpertV2Page() {
  // Use shared context for agent selection (sidebar can now select agents)
  const { agents, selectedAgents, setSelectedAgents, agentsLoading } = useAskExpert();

  // Derive the currently selected agent from context (first selected agent)
  const selectedAgent = useMemo(() => {
    if (selectedAgents.length === 0) return null;
    return agents.find(a => a.id === selectedAgents[0]) || null;
  }, [agents, selectedAgents]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [mode, setMode] = useState<Mode>('1');
  const [pendingHITL, setPendingHITL] = useState<HITLCheckpoint | null>(null);

  // Model selection for PromptInput
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [enableRAG, setEnableRAG] = useState(false);
  const [enableTools, setEnableTools] = useState(true);

  // Modal states
  const [showModeModal, setShowModeModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [hitlSafetyLevel, setHitlSafetyLevel] = useState<HITLSafetyLevel>('balanced');
  const [executionGoal, setExecutionGoal] = useState('');
  const [executionContext, setExecutionContext] = useState('');

  // Track whether autonomous mode has been configured this session
  // Once configured, subsequent sends skip the modal and use saved settings
  const [autonomousConfigured, setAutonomousConfigured] = useState(false);

  // Mode 3/4 execution tracking
  const [executionSteps, setExecutionSteps] = useState<Array<{
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
  }>>([]);
  const [pendingPlan, setPendingPlan] = useState<{
    id: string;
    title: string;
    description: string;
    steps: Array<{
      id: string;
      title: string;
      description: string;
      agentName?: string;
      toolsRequired?: string[];
      estimatedDuration?: string;
    }>;
    estimatedDuration: string;
    totalSteps: number;
    riskAssessment: { level: 'low' | 'medium' | 'high' | 'critical'; reason: string };
  } | null>(null);
  const [pendingToolExecution, setPendingToolExecution] = useState<{
    id: string;
    toolName: string;
    description: string;
    category: string;
    parameters: Array<{ name: string; value: unknown; type: string; sensitive?: boolean }>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskReason?: string;
    estimatedDuration?: string;
  } | null>(null);
  const [pendingSubAgentSpawn, setPendingSubAgentSpawn] = useState<{
    id: string;
    agentName: string;
    agentRole: string;
    level: 'L2' | 'L3' | 'L4' | 'L5';
    justification: string;
    capabilities: Array<{ name: string; description: string }>;
    expectedOutput: string;
    riskLevel: 'low' | 'medium' | 'high';
    estimatedTokens?: number;
  } | null>(null);
  const [pendingFinalReview, setPendingFinalReview] = useState<{
    id: string;
    response: string;
    sources: Array<{ title: string; url: string; snippet?: string; relevance?: number }>;
    confidence: number;
    executionSummary: {
      totalSteps: number;
      completedSteps: number;
      agentsUsed: number;
      toolsExecuted: number;
      totalDuration: string;
      tokensUsed: number;
    };
    createdAt: Date;
  } | null>(null);
  const [isAutonomousExecution, setIsAutonomousExecution] = useState(false);
  // Pending goal for autonomous mode - stores the goal from chat input when config modal is shown
  const [pendingAutonomousGoal, setPendingAutonomousGoal] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Ref to hold sendMessage function for use in handleSendOrConfigure (avoids circular dependency)
  // Updated to accept optional message override parameter
  const sendMessageRef = useRef<((messageOverride?: string) => Promise<void>) | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Agent fetching is handled by the AskExpertContext provider

  // Handle HITL checkpoint approval/rejection (Mode 3)
  const handleHITLResponse = useCallback(async (
    checkpointId: string,
    decision: 'approved' | 'rejected',
    messageId: string
  ) => {
    // Update the checkpoint status in the message
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.hitlCheckpoint?.id === checkpointId
          ? {
              ...msg,
              hitlCheckpoint: {
                ...msg.hitlCheckpoint,
                status: decision,
              },
            }
          : msg
      )
    );

    // Clear pending HITL state
    setPendingHITL(null);

    // Send approval/rejection to backend
    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: checkpointId,
          decision,
          session_id: sessionId,
        }),
      });
    } catch (error) {
      console.error('[AskExpertV2] Failed to send HITL response:', error);
    }
  }, [sessionId]);

  // Handle mode selection from modal
  const handleModeSelect = useCallback((selectedMode: '1' | '2' | '3' | '4') => {
    setMode(selectedMode);
    setShowModeModal(false);

    // Reset autonomous config when changing modes
    if (selectedMode !== '3' && selectedMode !== '4') {
      setAutonomousConfigured(false);
    }

    // For autonomous modes (3, 4), show the user prompt modal to collect goal
    if (selectedMode === '3' || selectedMode === '4') {
      setShowPromptModal(true);
    }
  }, []);

  // Intercept send action for autonomous modes - show config modal on first send, then skip
  const handleSendOrConfigure = useCallback(() => {
    const isAutonomousMode = mode === '3' || mode === '4';
    const currentMessage = inputValue.trim();

    console.log('[AskExpertV2] handleSendOrConfigure called:', {
      mode,
      isAutonomousMode,
      currentMessage,
      autonomousConfigured,
    });

    if (isAutonomousMode && currentMessage) {
      // If already configured this session, send directly with saved settings
      if (autonomousConfigured) {
        console.log('[AskExpertV2] Already configured - sending directly');
        setIsAutonomousExecution(true);
        // Pass message directly to avoid stale closure
        sendMessageRef.current?.(currentMessage);
      } else {
        // First time in autonomous mode - show config modal
        console.log('[AskExpertV2] Not configured - showing modal');
        setPendingAutonomousGoal(currentMessage);
        setShowPromptModal(true);
      }
    } else {
      // For interactive modes (1, 2), send directly via ref
      console.log('[AskExpertV2] Interactive mode - sending directly');
      sendMessageRef.current?.();
    }
  }, [mode, inputValue, autonomousConfigured]);

  // Mode 3 specific parameters (set via UserPromptModal)
  const [hitlEnabled, setHitlEnabled] = useState(true);
  const [maxIterations, setMaxIterations] = useState(5);

  // Handle user prompt submission (for autonomous modes)
  const handlePromptSubmit = useCallback((data: {
    goal: string;
    context: string;
    hitlEnabled: boolean;
    hitlLevel: 'strict' | 'balanced' | 'permissive';
    maxIterations: number;
    deliverables: string[];
  }) => {
    // Determine the message to send: use pendingAutonomousGoal if set (from chat input),
    // otherwise use the goal from the modal form
    const messageToSend = pendingAutonomousGoal || data.goal;

    console.log('[AskExpertV2] handlePromptSubmit called:', {
      goal: data.goal,
      pendingAutonomousGoal,
      messageToSend,
      currentInputValue: inputValue,
      hasSelectedAgent: !!selectedAgent,
      selectedAgentId: selectedAgent?.id,
    });

    // Set execution context and config
    setExecutionGoal(data.goal);
    setExecutionContext(data.context);
    setHitlEnabled(data.hitlEnabled);
    setHitlSafetyLevel(data.hitlLevel);
    setMaxIterations(data.maxIterations);
    setShowPromptModal(false);

    // Mark as configured - subsequent sends will skip the modal
    setAutonomousConfigured(true);

    // Clear the pending goal state
    setPendingAutonomousGoal(null);
    setIsAutonomousExecution(true);

    // Send the message directly by passing it as a parameter
    // This avoids stale closure issues with inputValue state
    console.log('[AskExpertV2] Calling sendMessage directly with message:', messageToSend);
    if (sendMessageRef.current) {
      sendMessageRef.current(messageToSend);
    } else {
      console.error('[AskExpertV2] sendMessageRef.current is null!');
    }
  }, [pendingAutonomousGoal, inputValue, selectedAgent]);

  // Handle plan approval (Mode 3/4)
  const handlePlanApprove = useCallback(async () => {
    if (!pendingPlan) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingPlan.id,
          checkpoint_type: 'plan',
          decision: 'approved',
          session_id: sessionId,
        }),
      });

      // Initialize execution steps from the plan
      setExecutionSteps(pendingPlan.steps.map((step, idx) => ({
        id: step.id,
        label: step.title,
        status: idx === 0 ? 'running' : 'pending',
        ...(idx === 0 && { startedAt: new Date() }),
      })));

      setShowPlanModal(false);
      setPendingPlan(null);
    } catch (error) {
      console.error('[AskExpertV2] Failed to approve plan:', error);
    }
  }, [pendingPlan, sessionId]);

  // Handle plan rejection (Mode 3/4)
  const handlePlanReject = useCallback(async (feedback: string) => {
    if (!pendingPlan) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingPlan.id,
          checkpoint_type: 'plan',
          decision: 'rejected',
          feedback,
          session_id: sessionId,
        }),
      });

      setShowPlanModal(false);
      setPendingPlan(null);
      setIsAutonomousExecution(false);
    } catch (error) {
      console.error('[AskExpertV2] Failed to reject plan:', error);
    }
  }, [pendingPlan, sessionId]);

  // Handle tool execution approval
  const handleToolApprove = useCallback(async () => {
    if (!pendingToolExecution) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingToolExecution.id,
          checkpoint_type: 'tool',
          decision: 'approved',
          session_id: sessionId,
        }),
      });
      setPendingToolExecution(null);
    } catch (error) {
      console.error('[AskExpertV2] Failed to approve tool execution:', error);
    }
  }, [pendingToolExecution, sessionId]);

  // Handle tool execution rejection
  const handleToolReject = useCallback(async (reason: string) => {
    if (!pendingToolExecution) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingToolExecution.id,
          checkpoint_type: 'tool',
          decision: 'rejected',
          feedback: reason,
          session_id: sessionId,
        }),
      });
      setPendingToolExecution(null);
    } catch (error) {
      console.error('[AskExpertV2] Failed to reject tool execution:', error);
    }
  }, [pendingToolExecution, sessionId]);

  // Handle sub-agent spawn approval
  const handleSubAgentApprove = useCallback(async () => {
    if (!pendingSubAgentSpawn) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingSubAgentSpawn.id,
          checkpoint_type: 'subagent',
          decision: 'approved',
          session_id: sessionId,
        }),
      });
      setPendingSubAgentSpawn(null);
    } catch (error) {
      console.error('[AskExpertV2] Failed to approve sub-agent spawn:', error);
    }
  }, [pendingSubAgentSpawn, sessionId]);

  // Handle sub-agent spawn rejection
  const handleSubAgentReject = useCallback(async (reason: string) => {
    if (!pendingSubAgentSpawn) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingSubAgentSpawn.id,
          checkpoint_type: 'subagent',
          decision: 'rejected',
          feedback: reason,
          session_id: sessionId,
        }),
      });
      setPendingSubAgentSpawn(null);
    } catch (error) {
      console.error('[AskExpertV2] Failed to reject sub-agent spawn:', error);
    }
  }, [pendingSubAgentSpawn, sessionId]);

  // Handle final review approval
  const handleFinalApprove = useCallback(async () => {
    if (!pendingFinalReview) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingFinalReview.id,
          checkpoint_type: 'final',
          decision: 'approved',
          session_id: sessionId,
        }),
      });
      setPendingFinalReview(null);
      setIsAutonomousExecution(false);
      setExecutionSteps([]);
    } catch (error) {
      console.error('[AskExpertV2] Failed to approve final review:', error);
    }
  }, [pendingFinalReview, sessionId]);

  // Handle final review rejection
  const handleFinalReject = useCallback(async (reason: string) => {
    if (!pendingFinalReview) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingFinalReview.id,
          checkpoint_type: 'final',
          decision: 'rejected',
          feedback: reason,
          session_id: sessionId,
        }),
      });
      setPendingFinalReview(null);
      // Keep execution state for retry
    } catch (error) {
      console.error('[AskExpertV2] Failed to reject final review:', error);
    }
  }, [pendingFinalReview, sessionId]);

  // Handle final review request changes
  const handleFinalRequestChanges = useCallback(async (feedback: string) => {
    if (!pendingFinalReview) return;

    try {
      await fetch('/api/ask-expert/hitl-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: pendingFinalReview.id,
          checkpoint_type: 'final',
          decision: 'request_changes',
          feedback,
          session_id: sessionId,
        }),
      });
      setPendingFinalReview(null);
      // Keep execution state for iteration
    } catch (error) {
      console.error('[AskExpertV2] Failed to request changes:', error);
    }
  }, [pendingFinalReview, sessionId]);

  // Send message with SSE streaming
  // Optional messageOverride allows passing message directly (avoids stale closure issues)
  const sendMessage = useCallback(async (messageOverride?: string) => {
    // Use override if provided, otherwise use inputValue
    const messageToSend = messageOverride?.trim() || inputValue.trim();

    // Debug logging for send failures
    console.log('[AskExpertV2] sendMessage called:', {
      messageOverride,
      inputValue: inputValue.trim(),
      messageToSend,
      hasSelectedAgent: !!selectedAgent,
      selectedAgentId: selectedAgent?.id,
      isLoading,
    });

    // Validate before sending
    if (!messageToSend) {
      console.warn('[AskExpertV2] Cannot send: message is empty');
      return;
    }
    // Mode 2 auto-selects agent on backend via L1 Orchestrator - allow without pre-selection
    if (!selectedAgent && mode !== '2') {
      console.warn('[AskExpertV2] Cannot send: no agent selected (required for mode ' + mode + ')');
      return;
    }
    if (isLoading) {
      console.warn('[AskExpertV2] Cannot send: already loading');
      return;
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        reasoning: '',
        reasoningSteps: [],
        timestamp: new Date(),
        isStreaming: true,
        reasoningComplete: false,
      },
    ]);

    abortControllerRef.current = new AbortController();

    // Local accumulators for streaming
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let accumulatedSteps: ReasoningStep[] = [];

    try {
      // For Mode 2, selectedAgent may be undefined - use default tenant
      const tenantId = selectedAgent?.tenant_id || '00000000-0000-0000-0000-000000000001';

      const response = await fetch(STREAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          // Mode 2 auto-selects expert on backend - expert_id may be undefined
          expert_id: selectedAgent?.id,
          message: userMessage.content,
          session_id: sessionId,
          mode,
          // Mode 3 specific parameters - use values from UserPromptModal
          ...(mode === '3' && {
            hitl_enabled: hitlEnabled,
            hitl_safety_level: hitlSafetyLevel,
            max_iterations: maxIterations,
            enable_rag: enableRAG,
            enable_tools: enableTools,
          }),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      // Track current SSE event type OUTSIDE the while loop to persist across chunks
      // (standard SSE format uses separate event: and data: lines that may arrive in different chunks)
      let currentEventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Parse event: line (standard SSE format)
          if (line.startsWith('event:')) {
            currentEventType = line.slice(6).trim();
            continue;
          }

          // Parse data: line
          if (!line.startsWith('data:')) continue;

          const jsonStr = line.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);

            // Use currentEventType from event: line, fallback to data.event for legacy format
            const eventType = currentEventType || data.event;

            switch (eventType) {
              case 'token':
                // Token event - stream to content using Streamdown
                if (data.content) {
                  accumulatedContent += data.content;

                  // Parse extended thinking tags from LLM response
                  const parsed = parseExtendedThinking(accumulatedContent);

                  // If we found thinking content, add it to reasoning steps
                  if (parsed.thinking && parsed.hasThinkingTag) {
                    // Add a reasoning step for the thinking content
                    if (!accumulatedSteps.some(s => s.key === 'llm_thinking')) {
                      accumulatedSteps = [...accumulatedSteps, { key: 'llm_thinking', label: 'Analyzing response' }];
                    }
                    // Store the full thinking content
                    accumulatedReasoning = parsed.thinking;
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            // Display cleaned answer without XML tags
                            content: parsed.answer,
                            // Include thinking in reasoning if present
                            reasoning: parsed.thinking || msg.reasoning || accumulatedReasoning,
                            reasoningSteps: accumulatedSteps.length > 0 ? accumulatedSteps : msg.reasoningSteps,
                            reasoningComplete: true,
                          }
                        : msg
                    )
                  );
                }
                break;

              case 'thinking':
                // Reasoning event - show steps with icons and capture AI reasoning content
                const step = data.step || 'Processing';
                const status = data.status || 'running';
                const friendlyStep = formatStepName(step);

                // Capture AI reasoning content from message/content field
                // Also capture the DETAIL field which contains the real runtime data
                const reasoningMessage = data.message || data.content || '';
                const reasoningDetail = data.detail || '';

                // Use detail if available (more specific), otherwise use message
                const reasoningContent = reasoningDetail || reasoningMessage;

                // Special case: ai_thinking step contains the full LLM reasoning
                if (step === 'ai_thinking' && reasoningContent) {
                  accumulatedReasoning = reasoningContent;
                  if (!accumulatedSteps.some(s => s.key === 'ai_thinking')) {
                    accumulatedSteps = [...accumulatedSteps, { key: 'ai_thinking', label: 'AI Analysis' }];
                  }
                }

                // Process all thinking events (both running and completed)
                // Check if step already exists
                if (!accumulatedSteps.some(s => s.key === step)) {
                  // Build label: Use detail for specifics, message for generic description
                  // Format: "Friendly Step Name: Detail" or just "Friendly Step Name: Message"
                  let stepLabel = friendlyStep;
                  if (reasoningDetail) {
                    // Detail contains the real runtime info (e.g., "Expert: XLSX Formula Calculator")
                    stepLabel = `${friendlyStep}: ${reasoningDetail}`;
                  } else if (reasoningMessage && reasoningMessage !== friendlyStep) {
                    // Fallback to message if no detail
                    stepLabel = `${friendlyStep}: ${reasoningMessage.substring(0, 100)}${reasoningMessage.length > 100 ? '...' : ''}`;
                  }
                  accumulatedSteps = [...accumulatedSteps, { key: step, label: stepLabel }];

                  // Build reasoning text from step descriptions
                  if (reasoningContent && step !== 'ai_thinking') {
                    accumulatedReasoning = accumulatedReasoning
                      ? `${accumulatedReasoning}\n\n**${friendlyStep}:** ${reasoningContent}`
                      : `**${friendlyStep}:** ${reasoningContent}`;
                  }
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, reasoning: accumulatedReasoning, reasoningSteps: accumulatedSteps }
                      : msg
                  )
                );
                break;

              case 'done':
                // Final response - parse and clean XML tags
                const rawFinalContent = (data.response && data.response.trim())
                  || (data.content && data.content.trim())
                  || accumulatedContent;

                // Parse extended thinking tags from final content
                const parsedFinal = parseExtendedThinking(rawFinalContent);

                const sources: Source[] = data.sources || [];
                const confidence = data.confidence;

                // Extract reasoning from done event
                // Backend sends reasoning at top-level (data.reasoning) NOT in metadata
                let finalReasoning = parsedFinal.thinking || accumulatedReasoning;

                // Check TOP-LEVEL reasoning array from backend (contains ai_thinking step)
                // Backend structure: { event: 'done', reasoning: [{step: 'ai_thinking', content: '...'}], ... }
                const topLevelReasoning = data.reasoning;
                if (Array.isArray(topLevelReasoning) && topLevelReasoning.length > 0) {
                  const aiThinkingStep = topLevelReasoning.find((r: { step?: string }) => r.step === 'ai_thinking');
                  if (aiThinkingStep?.content) {
                    finalReasoning = aiThinkingStep.content;
                  }
                }

                // Fallback: Check metadata.reasoning array (for older backend versions)
                if (!finalReasoning) {
                  const metadataReasoning = data.metadata?.reasoning;
                  if (Array.isArray(metadataReasoning) && metadataReasoning.length > 0) {
                    const aiThinkingStep = metadataReasoning.find((r: { step?: string }) => r.step === 'ai_thinking');
                    if (aiThinkingStep?.content) {
                      finalReasoning = aiThinkingStep.content;
                    }
                  }
                }

                // Also check metadata.thinking_steps for workflow reasoning (fallback)
                if (!finalReasoning) {
                  const thinkingSteps = data.metadata?.thinking_steps;
                  if (Array.isArray(thinkingSteps) && thinkingSteps.length > 0) {
                    finalReasoning = thinkingSteps
                      .map((s: { description?: string; message?: string }) => s.description || s.message || '')
                      .filter(Boolean)
                      .join('\n');
                  }
                }

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          // Display cleaned answer without XML tags
                          content: parsedFinal.answer,
                          // Preserve thinking content in reasoning
                          reasoning: finalReasoning || msg.reasoning,
                          sources,
                          confidence,
                          isStreaming: false,
                          reasoningComplete: true,
                        }
                      : msg
                  )
                );
                break;

              case 'error':
                console.error('[AskExpertV2] SSE Error:', data.message);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: `Error: ${data.message || 'Unknown error'}`,
                          isStreaming: false,
                          reasoningComplete: true,
                        }
                      : msg
                  )
                );
                break;

              // Mode 3 specific events
              case 'hitl_request':
                // HITL checkpoint requiring user approval
                const checkpoint: HITLCheckpoint = {
                  id: data.checkpoint_id || uuidv4(),
                  type: data.checkpoint_type || 'decision',
                  title: data.title || 'Checkpoint',
                  description: data.description || 'Approval required',
                  options: data.options || [],
                  status: 'pending',
                  risk_level: data.risk_level || 'medium',
                };
                setPendingHITL(checkpoint);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, hitlCheckpoint: checkpoint }
                      : msg
                  )
                );
                break;

              case 'agent_spawn':
                // Sub-agent being spawned (Mode 3)
                const spawnedAgent: SpawnedAgent = {
                  id: data.agent_id || uuidv4(),
                  name: data.agent_name || 'Sub-agent',
                  role: data.role || 'Specialist',
                  status: data.status || 'spawning',
                };
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantMessageId) return msg;
                    const currentAgents = msg.spawnedAgents || [];
                    const existingIdx = currentAgents.findIndex((a) => a.id === spawnedAgent.id);
                    if (existingIdx >= 0) {
                      currentAgents[existingIdx] = spawnedAgent;
                      return { ...msg, spawnedAgents: [...currentAgents] };
                    }
                    return { ...msg, spawnedAgents: [...currentAgents, spawnedAgent] };
                  })
                );
                // Also add to reasoning steps
                if (!accumulatedSteps.some((s) => s.key === `spawn_${spawnedAgent.id}`)) {
                  accumulatedSteps = [
                    ...accumulatedSteps,
                    { key: `spawn_${spawnedAgent.id}`, label: `Spawning ${spawnedAgent.name}` },
                  ];
                  accumulatedReasoning = accumulatedSteps.map((s) => s.label).join('\n');
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, reasoning: accumulatedReasoning, reasoningSteps: accumulatedSteps }
                        : msg
                    )
                  );
                }
                break;

              case 'step_progress':
                // Autonomous execution progress (Mode 3)
                const progressStep = data.step || 'Processing';
                const progressLabel = formatStepName(progressStep);
                if (!accumulatedSteps.some((s) => s.key === progressStep)) {
                  accumulatedSteps = [...accumulatedSteps, { key: progressStep, label: progressLabel }];
                  accumulatedReasoning = accumulatedSteps.map((s) => s.label).join('\n');
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, reasoning: accumulatedReasoning, reasoningSteps: accumulatedSteps }
                        : msg
                    )
                  );
                }
                // Update execution steps tracking
                setExecutionSteps((prev) => {
                  const idx = prev.findIndex((s) => s.label === progressLabel);
                  if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], status: 'completed', completedAt: new Date() };
                    // Start next step if available
                    if (idx + 1 < updated.length) {
                      updated[idx + 1] = { ...updated[idx + 1], status: 'running', startedAt: new Date() };
                    }
                    return updated;
                  }
                  return prev;
                });
                break;

              case 'plan_request':
                // Execution plan requiring approval (Mode 3/4)
                setPendingPlan({
                  id: data.plan_id || uuidv4(),
                  title: data.title || 'Execution Plan',
                  description: data.description || 'Review the proposed execution plan',
                  steps: data.steps || [],
                  estimatedDuration: data.estimated_duration || 'Unknown',
                  totalSteps: data.total_steps || data.steps?.length || 0,
                  riskAssessment: {
                    level: data.risk_level || 'medium',
                    reason: data.risk_reason || 'Standard execution',
                  },
                });
                setShowPlanModal(true);
                break;

              case 'tool_request':
                // Tool execution requiring approval
                setPendingToolExecution({
                  id: data.tool_id || uuidv4(),
                  toolName: data.tool_name || 'Unknown Tool',
                  description: data.description || 'Tool execution requested',
                  category: data.category || 'general',
                  parameters: data.parameters || [],
                  riskLevel: data.risk_level || 'low',
                  riskReason: data.risk_reason,
                  estimatedDuration: data.estimated_duration,
                });
                break;

              case 'subagent_request':
                // Sub-agent spawn requiring approval
                setPendingSubAgentSpawn({
                  id: data.subagent_id || uuidv4(),
                  agentName: data.agent_name || 'Sub-agent',
                  agentRole: data.role || 'Specialist',
                  level: data.level || 'L3',
                  justification: data.justification || 'Required for task completion',
                  capabilities: data.capabilities || [],
                  expectedOutput: data.expected_output || 'Task-specific output',
                  riskLevel: data.risk_level || 'low',
                  estimatedTokens: data.estimated_tokens,
                });
                break;

              case 'final_review':
                // Final response review (Mode 3/4)
                setPendingFinalReview({
                  id: data.review_id || uuidv4(),
                  response: data.response || accumulatedContent,
                  sources: data.sources || [],
                  confidence: data.confidence || 0.8,
                  executionSummary: {
                    totalSteps: data.total_steps || executionSteps.length,
                    completedSteps: data.completed_steps || executionSteps.filter((s) => s.status === 'completed').length,
                    agentsUsed: data.agents_used || 1,
                    toolsExecuted: data.tools_executed || 0,
                    totalDuration: data.total_duration || 'Unknown',
                    tokensUsed: data.tokens_used || 0,
                  },
                  createdAt: new Date(),
                });
                break;
            }
          } catch (parseError) {
            console.warn('[AskExpertV2] Failed to parse SSE data:', jsonStr);
          }
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        console.log('[AskExpertV2] Request aborted');
      } else {
        console.error('[AskExpertV2] Error:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error: ${err.message || 'Failed to get response'}`,
                  isStreaming: false,
                  reasoningComplete: true,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, selectedAgent, isLoading, sessionId, mode, hitlEnabled, hitlSafetyLevel, maxIterations, enableRAG, enableTools]);

  // Assign sendMessage to ref for use in earlier callbacks
  sendMessageRef.current = sendMessage;

  // Handle Enter key - uses intercept for autonomous modes
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendOrConfigure();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header with Mode and Agent Selectors */}
      <div className="border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Ask Expert V2</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Selector - Opens 2x2 Modal */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowModeModal(true)}
            >
              {(() => {
                const currentMode = MODES.find((m) => m.id === mode);
                const ModeIcon = currentMode?.icon || MessageSquare;
                return (
                  <>
                    <ModeIcon className="h-4 w-4" />
                    <span>Mode {mode}: {currentMode?.name}</span>
                  </>
                );
              })()}
              <Grid className="h-4 w-4 opacity-50" />
            </Button>

            {/* Selected Agent Indicator (agents selected via sidebar) */}
            {selectedAgent ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/30">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedAgent.avatar} />
                  <AvatarFallback>{selectedAgent.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium max-w-[200px] truncate">{selectedAgent.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed text-muted-foreground">
                <Bot className="h-5 w-5" />
                <span className="text-sm">{agentsLoading ? 'Loading...' : 'Select agent from sidebar'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium">Start a conversation</h2>
              <p className="text-muted-foreground">Select an agent and ask your question below</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={selectedAgent?.avatar} />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] space-y-3`}>
                  {/* User message bubble */}
                  {message.role === 'user' && (
                    <div className="rounded-lg p-4 bg-primary text-primary-foreground">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}

                  {/* Assistant: Component 1 - AI Reasoning with Icons (Progressive Disclosure) */}
                  {message.role === 'assistant' && message.reasoningSteps && message.reasoningSteps.length > 0 && (
                    <Reasoning
                      isStreaming={message.isStreaming && !message.reasoningComplete}
                      defaultOpen={true}
                      className="w-full"
                    >
                      <ReasoningTrigger />
                      <CollapsibleContent
                        className="mt-4 text-sm data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in"
                      >
                        <div className="space-y-2">
                          {message.reasoningSteps.map((step, idx) => {
                            const StepIcon = getStepIcon(step.key);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
                              >
                                <StepIcon className="h-4 w-4 text-primary shrink-0" />
                                <span className="animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100 + 50}ms` }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Reasoning>
                  )}

                  {/* Assistant: HITL Checkpoint UI (Mode 3 only) */}
                  {message.role === 'assistant' && message.hitlCheckpoint && message.hitlCheckpoint.status === 'pending' && (
                    (() => {
                      const checkpoint = message.hitlCheckpoint;
                      const riskStyles = getRiskLevelStyles(checkpoint.risk_level);
                      const typeInfo = getCheckpointTypeInfo(checkpoint.type);
                      const TypeIcon = typeInfo.icon;
                      return (
                        <div className={`rounded-lg border-2 ${riskStyles.border} ${riskStyles.bg} p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300`}>
                          {/* Header with type badge and risk indicator */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`h-5 w-5 ${riskStyles.text}`} />
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${riskStyles.badge}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <span className={`text-xs font-medium ${riskStyles.text} capitalize`}>
                              {checkpoint.risk_level} Risk
                            </span>
                          </div>

                          {/* Title and description */}
                          <div className="space-y-1">
                            <h4 className="font-medium text-foreground">{checkpoint.title}</h4>
                            <p className="text-sm text-muted-foreground">{checkpoint.description}</p>
                          </div>

                          {/* Options if available */}
                          {checkpoint.options && checkpoint.options.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Available options:</p>
                              <div className="space-y-1">
                                {checkpoint.options.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                                      option.recommended ? 'bg-primary/10 border border-primary/20' : 'bg-background/50'
                                    }`}
                                  >
                                    {option.recommended && (
                                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                    <div>
                                      <span className="font-medium">{option.label}</span>
                                      {option.description && (
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center gap-3 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleHITLResponse(checkpoint.id, 'approved', message.id)}
                              className="flex items-center gap-1.5"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleHITLResponse(checkpoint.id, 'rejected', message.id)}
                              className="flex items-center gap-1.5"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Assistant: Approved/Rejected HITL status indicator */}
                  {message.role === 'assistant' && message.hitlCheckpoint && message.hitlCheckpoint.status !== 'pending' && (
                    <div className={`flex items-center gap-2 text-sm ${
                      message.hitlCheckpoint.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {message.hitlCheckpoint.status === 'approved' ? (
                        <>
                          <ThumbsUp className="h-4 w-4" />
                          <span>Checkpoint approved</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="h-4 w-4" />
                          <span>Checkpoint rejected</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Assistant: Spawned agents indicator (Mode 3) */}
                  {message.role === 'assistant' && message.spawnedAgents && message.spawnedAgents.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {message.spawnedAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-secondary/50 border border-border"
                        >
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{agent.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                            agent.status === 'completed' ? 'bg-green-500' :
                            agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assistant: Component 2 - Chat Completion (using Streamdown) */}
                  {message.role === 'assistant' && (
                    <div className="py-2">
                      {/* Show loader when waiting for content */}
                      {message.isStreaming && !message.content ? (
                        <Loader />
                      ) : (
                        /* Streamdown for markdown streaming */
                        <Streamdown
                          isAnimating={message.isStreaming}
                          className="prose prose-sm dark:prose-invert max-w-none"
                        >
                          {message.content}
                        </Streamdown>
                      )}

                      {/* Sources Section - Inline Citation Badges + Collapsible Sources List */}
                      {!message.isStreaming && message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/30 space-y-4">
                          {/* Inline Citation Badges with Hover Cards */}
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, i) => (
                              <InlineCitation key={i}>
                                <InlineCitationCard>
                                  <InlineCitationCardTrigger sources={[source.url]} />
                                  <InlineCitationCardBody>
                                    <InlineCitationCarousel>
                                      <InlineCitationCarouselHeader>
                                        <InlineCitationCarouselPrev />
                                        <InlineCitationCarouselNext />
                                        <InlineCitationCarouselIndex />
                                      </InlineCitationCarouselHeader>
                                      <InlineCitationCarouselContent>
                                        <InlineCitationCarouselItem>
                                          <InlineCitationSource
                                            title={source.title}
                                            url={source.url}
                                            description={source.snippet}
                                          />
                                        </InlineCitationCarouselItem>
                                      </InlineCitationCarouselContent>
                                    </InlineCitationCarousel>
                                  </InlineCitationCardBody>
                                </InlineCitationCard>
                              </InlineCitation>
                            ))}
                          </div>

                          {/* Collapsible Sources List */}
                          <Sources>
                            <SourcesTrigger count={message.sources.length} />
                            <SourcesContent>
                              {message.sources.map((source, i) => (
                                <Source
                                  key={i}
                                  href={source.url}
                                  title={source.title}
                                />
                              ))}
                            </SourcesContent>
                          </Sources>
                        </div>
                      )}

                      {/* Confidence */}
                      {!message.isStreaming && message.confidence !== undefined && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area - Enhanced PromptInput with mode toggles */}
      <div className="border-t bg-background/95 px-4 py-4 backdrop-blur">
        <PromptInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSendOrConfigure}
          isLoading={isLoading}
          placeholder={
            selectedAgent
              ? `Ask ${selectedAgent.name}...`
              : 'Select an agent to start...'
          }
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isAutomatic={mode === '2' || mode === '4'}
          onAutomaticChange={(isAuto) => {
            // Toggle between manual and automatic while preserving autonomous
            const isAutonomous = mode === '3' || mode === '4';
            if (isAuto) {
              setMode(isAutonomous ? '4' : '2');
            } else {
              setMode(isAutonomous ? '3' : '1');
            }
          }}
          isAutonomous={mode === '3' || mode === '4'}
          onAutonomousChange={(isAuto) => {
            // Toggle between interactive and autonomous while preserving automatic
            const isAutomatic = mode === '2' || mode === '4';
            if (isAuto) {
              // Scenario 1: When toggling autonomous ON, show the UserPromptModal
              setMode(isAutomatic ? '4' : '3');
              setShowPromptModal(true);
            } else {
              // Switching to interactive mode - reset autonomous config
              setMode(isAutomatic ? '2' : '1');
              setAutonomousConfigured(false);
            }
          }}
          // Scenario 3: "Define Goal" button click in PromptInput when autonomous is active
          onDefineGoalClick={() => setShowPromptModal(true)}
          enableRAG={enableRAG}
          onEnableRAGChange={setEnableRAG}
          enableTools={enableTools}
          onEnableToolsChange={setEnableTools}
        />
      </div>

      {/* Mode Selection Modal (2x2 Grid) */}
      <ModeSelectionModal
        isOpen={showModeModal}
        currentMode={mode}
        onSelectMode={handleModeSelect}
        onClose={() => setShowModeModal(false)}
      />

      {/* User Prompt Modal (for autonomous modes 3 & 4) */}
      <UserPromptModal
        isOpen={showPromptModal}
        agentName={selectedAgent?.name}
        goal={pendingAutonomousGoal || undefined}
        agentDefaults={selectedAgent ? {
          hitl_enabled: selectedAgent.hitl_enabled ?? true,
          hitl_safety_level: (selectedAgent.hitl_safety_level as 'strict' | 'balanced' | 'permissive') ?? 'balanced',
          max_goal_iterations: selectedAgent.max_goal_iterations ?? 5,
          confidence_threshold: selectedAgent.confidence_threshold ?? 0.85,
        } : undefined}
        onSubmit={handlePromptSubmit}
        onClose={() => {
          setShowPromptModal(false);
          setPendingAutonomousGoal(null);
        }}
      />

      {/* Plan Approval Modal (Mode 3/4 - Autonomous execution plan) */}
      {pendingPlan && (
        <PlanApprovalModal
          isOpen={showPlanModal}
          plan={{
            id: pendingPlan.id,
            title: pendingPlan.title,
            description: pendingPlan.description,
            steps: pendingPlan.steps,
            estimatedDuration: pendingPlan.estimatedDuration,
            totalSteps: pendingPlan.totalSteps,
            riskAssessment: pendingPlan.riskAssessment,
          }}
          onApprove={handlePlanApprove}
          onReject={handlePlanReject}
          onClose={() => {
            setShowPlanModal(false);
            setPendingPlan(null);
          }}
        />
      )}

      {/* Progress Tracker - Shows during autonomous execution (Mode 3/4) */}
      {isAutonomousExecution && executionSteps.length > 0 && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm">
          <ProgressTracker
            steps={executionSteps}
            currentStepIndex={executionSteps.findIndex((s) => s.status === 'running')}
            isComplete={executionSteps.every((s) => s.status === 'completed')}
          />
        </div>
      )}

      {/* Tool Execution Card - Inline approval for tool use (Mode 3/4) */}
      {pendingToolExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-lg w-full mx-4">
            <ToolExecutionCard
              request={pendingToolExecution}
              onApprove={handleToolApprove}
              onReject={handleToolReject}
            />
          </div>
        </div>
      )}

      {/* Sub-Agent Approval Card - Inline approval for agent spawning (Mode 3/4) */}
      {pendingSubAgentSpawn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-lg w-full mx-4">
            <SubAgentApprovalCard
              request={pendingSubAgentSpawn}
              onApprove={handleSubAgentApprove}
              onReject={handleSubAgentReject}
            />
          </div>
        </div>
      )}

      {/* Final Review Panel - Shows at end of autonomous execution (Mode 3/4) */}
      {pendingFinalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto py-8">
          <div className="max-w-2xl w-full mx-4">
            <FinalReviewPanel
              review={pendingFinalReview}
              onApprove={handleFinalApprove}
              onReject={handleFinalReject}
              onRequestChanges={handleFinalRequestChanges}
            />
          </div>
        </div>
      )}
    </div>
  );
}
