export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  tier: number;
  capabilities: string[];
  rag_enabled: boolean;
}

export interface WorkflowState {
  metadata: {
    error?: string;
    recoveryUsed?: boolean;
    [key: string]: any;
  };
  answer?: string;
  workflowStep?: string;
  [key: string]: any;
}

export class ErrorRecoveryService {
  private static readonly FALLBACK_AGENT: Agent = {
    id: 'fallback-general',
    name: 'General AI Assistant',
    display_name: 'General AI Assistant',
    description: 'A helpful AI assistant for general questions',
    system_prompt: 'You are a helpful, professional AI assistant.',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000,
    tier: 1,
    capabilities: ['general_assistance', 'question_answering'],
    rag_enabled: false
  };
  
  static async recoverFromAgentError(error: Error): Promise<Agent> {
    console.error('Agent error, using fallback:', error);
    return this.FALLBACK_AGENT;
  }
  
  static async recoverFromWorkflowError(
    error: Error, 
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.error('Workflow error:', error);
    
    return {
      answer: 'I apologize for the technical issue. Please try again.',
      workflowStep: 'error_recovery',
      metadata: {
        ...state.metadata,
        error: error.message,
        recoveryUsed: true
      }
    };
  }
}
