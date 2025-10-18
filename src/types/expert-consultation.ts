export interface ConsultationRequest {
  query: string;
  expert_type: 'regulatory-strategy' | 'market-access' | 'clinical-trial-design';
  business_context: Record<string, any>;
  user_id: string;
  reasoning_mode: 'react' | 'cot' | 'auto';
  budget?: number;
  max_iterations?: number;
}

export interface ConsultationResponse {
  session_id: string;
  stream_url: string;
  status: string;
  estimated_cost?: number;
}

export interface ReasoningStep {
  id: string;
  timestamp: string;
  iteration: number;
  phase: 'think' | 'plan' | 'act' | 'observe' | 'reflect' | 'synthesize';
  content: Record<string, any>;
  metadata: {
    cost: number;
    tokens: number;
    confidence?: number;
  };
}

export interface ExecutionStatus {
  session_id: string;
  status: 'running' | 'paused' | 'waiting_for_input' | 'completed' | 'failed';
  progress: number;
  iteration: number;
  total_cost: number;
  completed_tasks: number;
}

export interface CostData {
  session_id: string;
  accumulated_cost: number;
  budget: number;
  budget_remaining: number;
  budget_used_percent: number;
  cost_by_phase: Record<string, number>;
  token_usage: {
    input: number;
    output: number;
  };
  last_update: {
    phase: string;
    cost: number;
    input_tokens: number;
    output_tokens: number;
  };
}

export interface SessionResponse {
  session_id: string;
  user_id: string;
  expert_type: string;
  original_query: string;
  status: string;
  created_at: string;
  updated_at: string;
  cost_accumulated: number;
  iterations_completed: number;
}

export interface SessionListResponse {
  sessions: SessionResponse[];
  total_count: number;
  page: number;
  limit: number;
}

export interface ControlRequest {
  action: 'pause' | 'resume' | 'stop';
  guidance?: Record<string, any>;
}

export interface ControlResponse {
  session_id: string;
  action: string;
  status: string;
  message: string;
}

export interface AnalyticsResponse {
  session_id: string;
  metrics: {
    cost_efficiency: number;
    iteration_efficiency: number;
    evidence_quality: number;
    goal_achievement: number;
    reasoning_quality: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  total_sessions: number;
  average_cost: number;
  average_iterations: number;
  success_rate: number;
  average_duration: number;
}

export interface StreamEvent {
  type: 'reasoning_step' | 'phase_change' | 'cost_update' | 'execution_status' | 'intervention_request' | 'execution_complete';
  data?: any;
  phase?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
