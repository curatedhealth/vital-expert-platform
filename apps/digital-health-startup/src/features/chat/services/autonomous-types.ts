/**
 * Shared Types for Autonomous Modes (Mode 3 & Mode 4)
 * 
 * This file defines the core types and interfaces used by both
 * Mode 3 (Autonomous-Automatic) and Mode 4 (Autonomous-Manual)
 * for ReAct + Chain-of-Thought reasoning.
 */

import { BaseMessage } from '@langchain/core/messages';

// ============================================================================
// CORE AUTONOMOUS TYPES
// ============================================================================

/**
 * Chain-of-Thought Sub-Question
 * Represents a decomposed question from the main goal
 */
export interface CoTSubQuestion {
  id: string;
  question: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  status: 'pending' | 'in-progress' | 'answered';
  answer?: string;
  confidence?: number;
  reasoning?: string; // Why this question is important
  dependencies?: string[]; // IDs of other questions this depends on
}

/**
 * ReAct Iteration
 * Represents one cycle of the ReAct loop: Think → Act → Observe → Reflect
 */
export interface ReActIteration {
  iteration: number;
  thought: string;      // Reasoning about current state
  action: string;       // What to do next
  observation: string;  // Result of action
  reflection: string;   // What was learned
  confidence: number;   // Current confidence level (0-1)
  toolsUsed?: string[]; // Tools that were used in this iteration
  ragContext?: string;  // RAG context retrieved
}

/**
 * Goal Understanding
 * The result of translating a user query into a structured goal
 */
export interface GoalUnderstanding {
  originalQuery: string;
  translatedGoal: string;
  goalType: 'research' | 'analysis' | 'planning' | 'problem-solving' | 'creative';
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  estimatedSteps: number;
  requiredTools: string[];
  requiredDomains: string[];
  successCriteria: string[];
  constraints?: string[];
}

/**
 * Execution Plan
 * The structured plan created from goal understanding
 */
export interface ExecutionPlan {
  goalId: string;
  phases: ExecutionPhase[];
  estimatedDuration: number; // in seconds
  maxIterations: number;
  checkpointStrategy: 'none' | 'phase' | 'iteration';
}

export interface ExecutionPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  subQuestions: CoTSubQuestion[];
  requiredTools: string[];
  successCriteria: string[];
  estimatedIterations: number;
}

// ============================================================================
// AUTONOMOUS MODE CONFIGURATION
// ============================================================================

/**
 * Base configuration for autonomous modes
 */
export interface BaseAutonomousConfig {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  maxIterations?: number;
  confidenceThreshold?: number;
}

/**
 * Mode 3 Configuration (Autonomous-Automatic)
 */
export interface Mode3Config extends BaseAutonomousConfig {
  // No additional fields - orchestrator selects agent
}

/**
 * Mode 4 Configuration (Autonomous-Manual)
 */
export interface Mode4Config extends BaseAutonomousConfig {
  agentId: string; // User-selected agent
}

// ============================================================================
// AUTONOMOUS STATE MANAGEMENT
// ============================================================================

/**
 * Base state for autonomous execution
 */
export interface BaseAutonomousState {
  // Input
  query: string;
  conversationHistory: BaseMessage[];
  config: BaseAutonomousConfig;
  
  // Goal Understanding
  goalUnderstanding: GoalUnderstanding;
  executionPlan: ExecutionPlan;
  
  // ReAct + CoT Execution
  subQuestions: CoTSubQuestion[];
  iterations: ReActIteration[];
  currentPhase: string;
  currentIteration: number;
  
  // Results
  finalAnswer: string;
  confidence: number;
  toolsUsed: string[];
  ragContexts: string[];
  
  // Metadata
  executionTime: number;
  timestamp: string;
  error?: string;
}

/**
 * Mode 3 State (Autonomous-Automatic)
 */
export interface Mode3State extends BaseAutonomousState {
  config: Mode3Config;
  
  // Agent Selection
  candidateAgents: Agent[];
  selectedAgent: Agent;
  agentSelectionReason: string;
  selectionConfidence: number;
}

/**
 * Mode 4 State (Autonomous-Manual)
 */
export interface Mode4State extends BaseAutonomousState {
  config: Mode4Config;
  
  // Fixed Agent
  selectedAgent: Agent;
  agentExpertise: string[];
  
  // Real-time streaming steps
  streamingSteps?: Array<{ type: string; content: string; metadata?: any }>;
}

// ============================================================================
// STREAMING RESPONSE TYPES
// ============================================================================

/**
 * Stream chunk types for autonomous modes
 */
export type AutonomousStreamChunkType = 
  | 'goal_understanding'
  | 'execution_plan'
  | 'agent_selection'
  | 'phase_start'
  | 'iteration_start'
  | 'thinking_start'
  | 'thought'
  | 'action_decision_start'
  | 'action_decided'
  | 'action_execution_start'
  | 'action_executed'
  | 'action'
  | 'observation_start'
  | 'observation'
  | 'reflection_start'
  | 'reflection'
  | 'phase_complete'
  | 'final_answer'
  | 'error'
  | 'done';

export interface AutonomousStreamChunk {
  type: AutonomousStreamChunkType;
  content?: string;
  metadata?: {
    iteration?: number;
    phase?: string;
    confidence?: number;
    agent?: Agent;
    toolsUsed?: string[];
    ragContext?: string;
  };
  timestamp: string;
}

// ============================================================================
// AGENT INTERFACE (for autonomous modes)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  display_name?: string;
  system_prompt: string;
  model?: string;
  capabilities?: string[];
  tools?: string[];
  knowledge_domain?: string;
  tier?: number;
  specialties?: string[];
  metadata?: any;
}

// ============================================================================
// TOOL EXECUTION TYPES
// ============================================================================

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  toolName: string;
  input: any;
  output: any;
  success: boolean;
  error?: string;
  executionTime: number;
}

/**
 * Available tools for autonomous execution
 */
export interface AutonomousTool {
  name: string;
  description: string;
  parameters: any;
  execute: (input: any) => Promise<ToolExecutionResult>;
}

// ============================================================================
// CONFIDENCE ASSESSMENT TYPES
// ============================================================================

/**
 * Confidence assessment result
 */
export interface ConfidenceAssessment {
  overall: number; // 0-1
  breakdown: {
    goalClarity: number;
    informationCompleteness: number;
    reasoningQuality: number;
    toolEffectiveness: number;
    ragRelevance: number;
  };
  reasoning: string;
  recommendations?: string[];
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Autonomous execution error
 */
export interface AutonomousError {
  type: 'goal_understanding' | 'planning' | 'execution' | 'tool' | 'rag' | 'synthesis';
  message: string;
  iteration?: number;
  phase?: string;
  recoverable: boolean;
  suggestedAction?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Progress tracking for autonomous execution
 */
export interface ExecutionProgress {
  phase: string;
  phaseProgress: number; // 0-1
  overallProgress: number; // 0-1
  iterationsCompleted: number;
  iterationsRemaining: number;
  estimatedTimeRemaining: number; // in seconds
  currentActivity: string;
}

/**
 * Performance metrics for autonomous execution
 */
export interface AutonomousMetrics {
  totalExecutionTime: number;
  iterationsUsed: number;
  toolsUsed: string[];
  ragQueries: number;
  confidenceAchieved: number;
  successRate: number;
  errorCount: number;
}
