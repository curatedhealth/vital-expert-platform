/**
 * Agent Types
 * Shared type definitions for AI agents across the VITAL Platform
 */

// Enum types
export enum AgentStatus {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated'
}

export enum ValidationStatus {
  VALIDATED = 'validated',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  EXPIRED = 'expired',
  NOT_REQUIRED = 'not_required'
}

export enum DomainExpertise {
  MEDICAL = 'medical',
  REGULATORY = 'regulatory',
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial',
  ACCESS = 'access',
  GENERAL = 'general'
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Healthcare-specific enums
export enum ClinicalValidationStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  VALIDATED = 'validated',
  REJECTED = 'rejected'
}

export enum FDASaMDClass {
  NONE = 'none',
  CLASS_I = 'class_i',
  CLASS_II = 'class_ii',
  CLASS_III = 'class_iii',
  CLASS_IV = 'class_iv'
}

// Agent configuration types
export type AgentType =
  | 'clinical_trial_designer'
  | 'regulatory_strategist'
  | 'market_access_strategist'
  | 'virtual_advisory_board'
  | 'conversational_ai';

export type Priority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface AgentConfig {
  maxConcurrentTasks: number;
  timeout: number;
  priority: Priority;
}

export interface AgentMetrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  currentLoad: number;
  uptime: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  version: string;
  description: string;
  capabilities: string[];
  metrics: AgentMetrics;
  config: AgentConfig;
  lastActivity: Date;
  created: Date;
}

export interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  confidence: number;
  status: 'thinking' | 'responding' | 'completed' | 'error';
  responseTime?: number;
}

// Utility types
export type AgentCreateInput = Omit<Agent, 'id' | 'created'>;
export type AgentUpdateInput = Partial<Omit<Agent, 'id' | 'name' | 'created'>>;
