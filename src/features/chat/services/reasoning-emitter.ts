/**
 * Reasoning Emitter Service
 * Manages real-time reasoning visualization for LangGraph workflows
 */

export interface ReasoningStep {
  id: string;
  type: 'planning' | 'agent_selection' | 'rag_retrieval' | 'tool_use' | 'synthesis' | 'validation';
  title: string;
  description: string;
  status: 'running' | 'completed' | 'error';
  duration?: number;
  tokens?: number;
  cost?: number;
  confidence?: number;
  details?: any;
  timestamp: number;
}

class ReasoningEmitter {
  private steps: ReasoningStep[] = [];
  private isActive = false;
  private listeners: ((steps: ReasoningStep[]) => void)[] = [];

  startReasoning() {
    this.isActive = true;
    this.steps = [];
    this.notifyListeners();
  }

  addStep(step: Omit<ReasoningStep, 'id' | 'timestamp'>): string {
    const id = `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStep: ReasoningStep = {
      ...step,
      id,
      timestamp: Date.now()
    };
    
    this.steps.push(newStep);
    this.notifyListeners();
    
    return id;
  }

  updateStep(stepId: string, updates: Partial<Omit<ReasoningStep, 'id' | 'timestamp'>>) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      this.steps[stepIndex] = {
        ...this.steps[stepIndex],
        ...updates
      };
      this.notifyListeners();
    }
  }

  completeReasoning() {
    this.isActive = false;
    this.notifyListeners();
  }

  getSteps(): ReasoningStep[] {
    return [...this.steps];
  }

  isReasoningActive(): boolean {
    return this.isActive;
  }

  subscribe(listener: (steps: ReasoningStep[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.steps]));
  }
}

export const reasoningEmitter = new ReasoningEmitter();
