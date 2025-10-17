import { Annotation } from '@langchain/langgraph';

// Enhanced Autonomous State with LangGraph Best Practices
export const AutonomousState = Annotation.Root({
  // Goal and progress tracking
  goal: Annotation<Goal>({
    reducer: (current, update) => update || current,
    default: () => null
  }),
  
  // Task management
  taskQueue: Annotation<Task[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  completedTasks: Annotation<CompletedTask[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Multi-tiered memory system (UNIQUE DIFFERENTIATOR)
  workingMemory: Annotation<WorkingMemory>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({ facts: [], insights: [], hypotheses: [] })
  }),
  episodicMemory: Annotation<EpisodicMemory[]>({
    reducer: (current, update) => [...current, ...update].slice(-100), // Keep last 100
    default: () => []
  }),
  semanticMemory: Annotation<Map<string, Concept>>({
    reducer: (current, update) => new Map([...current, ...update]),
    default: () => new Map()
  }),
  toolMemory: Annotation<ToolCombination[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Execution tracking
  iteration: Annotation<number>({
    reducer: (current, update) => update,
    default: () => 0
  }),
  totalCost: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0
  }),
  confidenceScore: Annotation<number>({
    reducer: (current, update) => update,
    default: () => 0
  }),
  
  // Evidence and verification (UNIQUE DIFFERENTIATOR)
  evidenceChain: Annotation<Evidence[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  verificationProofs: Annotation<Proof[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Multi-agent collaboration (UNIQUE DIFFERENTIATOR)
  activeAgents: Annotation<Agent[]>({
    reducer: (current, update) => update || current,
    default: () => []
  }),
  agentMessages: Annotation<AgentMessage[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  
  // Control flags
  shouldStop: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),
  requiresIntervention: Annotation<boolean>({
    reducer: (_, update) => update,
    default: () => false
  }),
  
  // Progress tracking
  progress: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0
  }),
  currentTask: Annotation<Task | null>({
    reducer: (_, update) => update,
    default: () => null
  }),
  
  // Error handling
  errors: Annotation<Error[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  })
});

// Enhanced interfaces with unique features
export interface Goal {
  id: string;
  description: string;
  successCriteria: SuccessCriterion[];
  medicalContext?: MedicalContext; // UNIQUE: Domain-specific context
  regulatoryRequirements?: RegulatoryRequirement[]; // UNIQUE: Compliance tracking
  evidenceRequirements?: EvidenceRequirement[]; // UNIQUE: Evidence standards
  maxCost?: number;
  deadline?: Date;
  createdAt: Date;
  status: 'active' | 'paused' | 'completed' | 'failed';
}

export interface Task {
  id: string;
  description: string;
  type: 'research' | 'analysis' | 'validation' | 'synthesis' | 'compliance_check' | 'web_search' | 'rag_query';
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  assignedAgent?: string; // UNIQUE: Multi-agent assignment
  requiredTools: string[];
  requiredEvidence?: string[]; // UNIQUE: Evidence requirements
  estimatedCost: number;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface CompletedTask extends Task {
  result: any;
  duration: number;
  cost: number;
  toolsUsed: string[];
  executedBy: string;
  success: boolean;
  confidence: number;
}

export interface Evidence {
  id: string;
  taskId: string;
  type: 'primary' | 'secondary' | 'expert_opinion' | 'clinical_data' | 'regulatory' | 'literature';
  source: string;
  content: any;
  confidence: number;
  verificationStatus: 'unverified' | 'verified' | 'disputed';
  timestamp: Date;
  hash: string; // UNIQUE: Blockchain-style verification
  citations: string[];
}

export interface ToolCombination {
  tools: string[];
  taskType: string;
  successRate: number;
  avgDuration: number;
  cost: number;
  lastUsed: Date;
  usageCount: number;
}

export interface AgentMessage {
  fromAgent: string;
  toAgent: string;
  type: 'request' | 'response' | 'delegation' | 'escalation' | 'collaboration';
  content: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkingMemory {
  facts: string[];
  insights: string[];
  hypotheses: string[];
  currentFocus: string;
  lastUpdated: Date;
}

export interface EpisodicMemory {
  id: string;
  timestamp: Date;
  query: string;
  response: string;
  agent: string;
  importance: number;
  tags: string[];
  context: any;
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  relationships: string[];
  confidence: number;
  lastUpdated: Date;
}

export interface Proof {
  goalId: string;
  completedTasks: any[];
  evidenceChain: any[];
  finalConfidence: number;
  timestamp: Date;
  signature: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface SuccessCriterion {
  id: string;
  description: string;
  measurable: boolean;
  target: string;
  achieved: boolean;
  evidence: string[];
}

export interface MedicalContext {
  domain: 'oncology' | 'cardiology' | 'neurology' | 'endocrinology' | 'general';
  patientPopulation?: string;
  interventionType?: string;
  comparators?: string[];
  studyPhase?: 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'post_market';
}

export interface RegulatoryRequirement {
  region: 'FDA' | 'EMA' | 'MHRA' | 'PMDA' | 'Health_Canada';
  complianceType: string;
  guidelines: string[];
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface EvidenceRequirement {
  level: '1a' | '1b' | '2a' | '2b' | '3' | '4' | '5';
  sources: string[];
  minimumStudies: number;
  qualityThreshold: number;
}

export interface Agent {
  id: string;
  name: string;
  type: 'specialist' | 'coordinator' | 'validator';
  domain: string;
  capabilities: string[];
  tools: string[];
  maxConcurrentTasks: number;
  currentTasks: string[];
  performance: {
    successRate: number;
    avgDuration: number;
    avgCost: number;
  };
}

// Utility functions for state management
export class AutonomousStateManager {
  static createInitialState(goal: Goal): Partial<typeof AutonomousState.State> {
    return {
      goal,
      taskQueue: [],
      completedTasks: [],
      workingMemory: { facts: [], insights: [], hypotheses: [], currentFocus: goal.description, lastUpdated: new Date() },
      episodicMemory: [],
      semanticMemory: new Map(),
      toolMemory: [],
      iteration: 0,
      totalCost: 0,
      confidenceScore: 0,
      evidenceChain: [],
      verificationProofs: [],
      activeAgents: [],
      agentMessages: [],
      shouldStop: false,
      requiresIntervention: false,
      progress: 0,
      currentTask: null,
      errors: []
    };
  }

  static updateProgress(state: typeof AutonomousState.State): number {
    const totalTasks = state.taskQueue.length + state.completedTasks.length;
    const completedCount = state.completedTasks.length;
    return totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  }

  static calculateConfidence(state: typeof AutonomousState.State): number {
    if (state.completedTasks.length === 0) return 0;
    
    const avgConfidence = state.completedTasks.reduce((sum, task) => sum + task.confidence, 0) / state.completedTasks.length;
    const evidenceScore = state.evidenceChain.filter(e => e.verificationStatus === 'verified').length / Math.max(state.evidenceChain.length, 1);
    
    return (avgConfidence + evidenceScore) / 2;
  }

  static shouldStopExecution(state: typeof AutonomousState.State): boolean {
    return state.shouldStop || 
           state.iteration >= (state.goal?.maxCost || 50) ||
           state.totalCost >= (state.goal?.maxCost || 100) ||
           state.requiresIntervention;
  }
}
