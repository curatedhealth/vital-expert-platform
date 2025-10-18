/**
 * Enhanced Reasoning Types for Autonomous Agent Transparency
 * Provides comprehensive typing for reasoning steps and agent state
 */

export interface ReasoningStep {
  /** Unique identifier for the reasoning step */
  id: string;
  /** Timestamp when the step was created */
  timestamp: Date;
  /** Current iteration number in the reasoning loop */
  iteration: number;
  /** Current phase of reasoning */
  phase: 'think' | 'plan' | 'act' | 'observe' | 'reflect' | 'synthesize' | 'goal_extraction' | 'task_generation' | 'task_execution' | 'completion';
  /** Main content of the reasoning step */
  content: {
    /** Human-readable description of what the agent is doing */
    description: string;
    /** Detailed reasoning or thought process */
    reasoning?: string;
    /** Key insights or findings */
    insights?: string[];
    /** Questions the agent is considering */
    questions?: string[];
    /** Decisions made in this step */
    decisions?: string[];
    /** Evidence or data used */
    evidence?: any[];
  };
  /** Additional metadata about the step */
  metadata: {
    /** Confidence level (0-1) */
    confidence?: number;
    /** Estimated time to complete this step */
    estimatedDuration?: number;
    /** Tools or resources used */
    toolsUsed?: string[];
    /** Cost associated with this step */
    cost?: number;
    /** Tokens used in this step */
    tokensUsed?: number;
    /** Priority level */
    priority?: 'low' | 'medium' | 'high' | 'critical';
    /** Dependencies on other steps */
    dependencies?: string[];
    /** Success criteria for this step */
    successCriteria?: string[];
  };
  /** Status of the step */
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  /** Parent step ID if this is a sub-step */
  parentStepId?: string;
  /** Child step IDs */
  childStepIds?: string[];
}

export interface AutonomousAgentState {
  /** Identity & Context */
  session_id: string;
  user_id: string;
  expert_type: string;
  original_query: string;
  business_context: Record<string, any>;
  
  /** Conversation History */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  
  /** Reasoning State */
  current_phase: string;
  current_iteration: number;
  max_iterations: number;
  reasoning_steps: ReasoningStep[];
  
  /** Goals & Progress */
  original_goal: {
    description: string;
    success_criteria: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: Date;
  };
  decomposed_goals: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    priority: number;
    dependencies: string[];
  }>;
  completed_goals: string[];
  current_goal?: string;
  goal_progress: number; // 0-1
  
  /** Working Memory */
  working_memory: Record<string, any>;
  strategic_insights: Array<{
    id: string;
    insight: string;
    confidence: number;
    source: string;
    timestamp: Date;
  }>;
  evidence_chain: Array<{
    id: string;
    evidence: any;
    source: string;
    reliability: number;
    timestamp: Date;
  }>;
  
  /** Tool State */
  available_tools: string[];
  tool_results: Array<{
    tool: string;
    input: any;
    output: any;
    success: boolean;
    timestamp: Date;
  }>;
  tool_calls: Array<{
    id: string;
    tool: string;
    parameters: any;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    timestamp: Date;
  }>;
  
  /** Cost & Resource Tracking */
  cost_accumulated: number;
  cost_budget: number;
  tokens_used: number;
  
  /** Control Flags */
  should_continue: boolean;
  pause_requested: boolean;
  user_intervention_needed: boolean;
  intervention_type?: string;
  
  /** Output */
  final_synthesis?: {
    summary: string;
    key_findings: string[];
    recommendations: string[];
    next_steps: string[];
    confidence: number;
  };
  execution_complete: boolean;
}

export interface ReasoningStreamEvent {
  /** Type of event */
  type: 'reasoning_step' | 'phase_change' | 'goal_update' | 'tool_call' | 'execution_complete' | 'error';
  /** Event data */
  data: any;
  /** Timestamp of the event */
  timestamp: Date;
  /** Session ID */
  session_id: string;
}

export interface PhaseIndicatorProps {
  /** Current phase */
  phase: string;
  /** Whether the agent is actively processing */
  isActive: boolean;
  /** Progress within the current phase (0-1) */
  progress?: number;
  /** Estimated time remaining */
  estimatedTimeRemaining?: number;
}

export interface ReasoningStepCardProps {
  /** The reasoning step to display */
  step: ReasoningStep;
  /** Step number in the sequence */
  stepNumber: number;
  /** Whether this is the latest step */
  isLatest: boolean;
  /** Whether to show detailed metadata */
  showDetails?: boolean;
  /** Callback when step is clicked */
  onStepClick?: (step: ReasoningStep) => void;
}

export interface LiveReasoningViewProps {
  /** Session ID for the reasoning stream */
  sessionId: string;
  /** Whether to show the reasoning view */
  isVisible?: boolean;
  /** Callback when reasoning completes */
  onComplete?: (finalState: AutonomousAgentState) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}
