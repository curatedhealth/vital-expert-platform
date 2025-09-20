// VITALpath Platform Types

export type Phase = 'vision' | 'integrate' | 'test' | 'activate' | 'learn';

export type ProjectType =
  | 'digital_therapeutic'
  | 'ai_diagnostic'
  | 'clinical_decision_support'
  | 'remote_monitoring'
  | 'telemedicine_platform'
  | 'health_analytics';

export type QueryType = 'regulatory' | 'clinical' | 'market' | 'general';

export type ModelType =
  | 'regulatory-expert'
  | 'clinical-specialist'
  | 'market-analyst'
  | 'general-assistant'
  | 'citation-validator'
  | 'summary-generator';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial';
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'clinician' | 'researcher' | 'member';
  avatar_url?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  current_phase: Phase;
  phase_progress: Record<Phase, number>;
  milestones: Milestone[];
  regulatory_pathway?: string;
  target_markets?: string[];
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  phase: Phase;
  completed: boolean;
  due_date?: string;
  completed_at?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Query {
  id: string;
  organization_id: string;
  project_id?: string;
  user_id: string;
  phase: Phase;
  query_text: string;
  query_type: QueryType;
  response: {
    content: string;
    model: string;
    confidence: number;
  };
  citations: Citation[];
  confidence_score: number;
  models_used: string[];
  processing_time_ms: number;
  feedback_rating?: number;
  feedback_text?: string;
  created_at: string;
}

export interface Citation {
  id: string;
  source: string;
  title: string;
  url?: string;
  pageNumber?: number;
  section?: string;
  quote: string;
  confidenceScore: number;
}

export interface Document {
  id: string;
  organization_id: string;
  project_id?: string;
  name: string;
  type: 'regulatory_guidance' | 'clinical_protocol' | 'market_research' | 'internal';
  source: string;
  url?: string;
  content: string;
  metadata: Record<string, any>;
  vector_id?: string;
  indexed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  workflow_type: string;
  n8n_workflow_id?: string;
  configuration: Record<string, any>;
  is_active: boolean;
  last_run_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  confidence: number;
  citations: Citation[];
  processingTime: number;
  tokensUsed: number;
  consensus?: {
    agreementScore: number;
    conflictingPoints: string[];
    allResponses: number;
    finalConfidence: number;
  };
}

export interface SearchResult {
  text: string;
  score: number;
  metadata: any;
  citation: Citation;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  fullName: string;
}

// Dashboard Analytics
export interface DashboardMetrics {
  activeProjects: number;
  timeSaved: number;
  complianceScore: number;
  aiQueries: number;
  queryTrend: Array<{
    date: string;
    queries: number;
    citations: number;
  }>;
  phaseDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}