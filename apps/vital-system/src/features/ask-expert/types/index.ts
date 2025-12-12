/**
 * Ask Expert - Service-Specific Types
 * 
 * Type definitions specific to the Ask Expert service.
 */

import type { AskExpertMode } from '../hooks';

// ============================================================================
// Mode Types
// ============================================================================

export type { AskExpertMode };

export type ModeComplexity = 'simple' | 'moderate' | 'complex' | 'advanced';

export interface ModeFeatures {
  hitl: boolean;
  multiAgent: boolean;
  artifacts: boolean;
  streaming: boolean;
  checkpoints: boolean;
}

// ============================================================================
// Session Types
// ============================================================================

export interface AskExpertSession {
  id: string;
  mode: AskExpertMode;
  tenantId: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed' | 'cancelled' | 'error';
  messageCount: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
}

// ============================================================================
// HITL Types
// ============================================================================

export type HITLCheckpointType = 
  | 'plan_approval'
  | 'agent_selection'
  | 'tool_execution'
  | 'output_review'
  | 'cost_approval';

export interface HITLCheckpoint {
  id: string;
  type: HITLCheckpointType;
  sessionId: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'timeout';
  agent: {
    id: string;
    name: string;
    level: string;
  };
  context: {
    task: string;
    reason: string;
    estimatedCost?: number;
    estimatedTime?: number;
  };
  response?: {
    action: string;
    comment?: string;
    respondedAt: Date;
  };
}

// ============================================================================
// Agent Types (Ask Expert specific)
// ============================================================================

export interface AskExpertAgent {
  id: string;
  name: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  domain: string;
  specialty: string;
  status: 'idle' | 'thinking' | 'responding' | 'delegating' | 'waiting';
  avatar?: string;
  color?: string;
}

export interface AgentDelegation {
  fromAgent: AskExpertAgent;
  toAgent: AskExpertAgent;
  task: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  agent?: AskExpertAgent;
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
}

export interface WorkflowPlan {
  id: string;
  sessionId: string;
  steps: WorkflowStep[];
  createdAt: Date;
  approvedAt?: Date;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'completed';
}

// ============================================================================
// Artifact Types
// ============================================================================

/**
 * Supported artifact types for rich content rendering
 *
 * Aligned with v5 World-Class UI Implementation Guide (9 types):
 * - document, code, react, chart, table, diagram, html, json, csv
 * Plus: image, file for generic handling
 */
export type ArtifactType =
  | 'document'  // Markdown/text documents
  | 'code'      // Source code with syntax highlighting
  | 'react'     // Interactive React components (sandboxed iframe)
  | 'chart'     // Data visualizations (line, bar, pie, etc.)
  | 'table'     // Tabular data with sorting/search
  | 'diagram'   // Mermaid diagrams (flowcharts, sequence, class, etc.)
  | 'html'      // Sanitized HTML content
  | 'json'      // JSON tree viewer with syntax highlighting
  | 'csv'       // CSV data parsing and display
  | 'image'     // Images and photos
  | 'file';     // Generic file attachments

/**
 * Artifact metadata for tracking versions and provenance
 */
export interface ArtifactMetadata {
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  language?: string;  // For code artifacts
  chartType?: string; // For chart artifacts
  mimeType?: string;  // For file artifacts
  size?: number;      // File size in bytes
}

/**
 * Full artifact definition
 */
export interface Artifact {
  id: string;
  type: ArtifactType;
  name: string;
  content: string;
  metadata?: ArtifactMetadata;
}

// ============================================================================
// Message Types (Ask Expert specific extensions)
// ============================================================================

export interface AskExpertMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: AskExpertAgent;
  mode: AskExpertMode;
  timestamp: Date;
  reasoning?: string[];
  citations?: Array<{
    id: string;
    source: string;
    title: string;
    excerpt: string;
    url?: string;
  }>;
  artifacts?: Artifact[];
  metadata?: {
    tokensUsed?: number;
    latencyMs?: number;
    toolsCalled?: string[];
  };
}
