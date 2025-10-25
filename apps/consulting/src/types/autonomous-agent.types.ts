/**
 * Autonomous Agent Types
 * Type definitions for the autonomous expert agent system
 */

// ============================================================================
// Structured Output Types (matching backend parsers)
// ============================================================================

export interface RegulatoryAnalysis {
  recommendedPathway: '510k' | 'pma' | 'de_novo' | 'exempt';
  deviceClass: 'I' | 'II' | 'III';
  timeline: {
    preparation: number;
    submission: number;
    review: number;
    total: number;
  };
  requirements: string[];
  predicateDevices?: Array<{
    name: string;
    k_number?: string;
    manufacturer: string;
    similarity_score: number;
  }>;
  estimatedCost: {
    preparation: number;
    testing: number;
    submission_fees: number;
    total: number;
  };
  risks: Array<{
    category: 'technical' | 'regulatory' | 'clinical' | 'commercial';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }>;
  recommendations: string[];
  confidence: number;
}

export interface ClinicalStudy {
  studyType: 'rct' | 'observational' | 'single_arm' | 'feasibility' | 'pilot';
  phase?: 'pilot' | 'feasibility' | 'pivotal' | 'post_market';
  primaryEndpoint: {
    name: string;
    description: string;
    measurement_timepoint: string;
    success_criteria: string;
  };
  secondaryEndpoints: Array<{
    name: string;
    description: string;
    measurement_timepoint: string;
  }>;
  sampleSize: {
    total: number;
    per_arm?: number;
    justification: string;
    power: number;
    alpha: number;
  };
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  duration: {
    enrollment_period: number;
    follow_up_period: number;
    total: number;
  };
  statisticalAnalysis: {
    primary_analysis: string;
    secondary_analyses: string[];
    interim_analyses: boolean;
  };
  estimatedCost: {
    per_patient: number;
    total: number;
    breakdown?: Record<string, number>;
  };
  feasibility: {
    recruitment_rate: string;
    site_requirements: number;
    key_challenges: string[];
  };
  recommendations: string[];
}

export interface MarketAccess {
  targetMarkets: Array<{
    country: string;
    market_size: number;
    growth_rate: number;
    competitive_landscape: string;
  }>;
  pricingStrategy: {
    recommended_price: number;
    pricing_model: 'value_based' | 'cost_plus' | 'competitive' | 'bundled';
    justification: string;
    price_range: {
      min: number;
      max: number;
    };
  };
  reimbursement: {
    pathways: Array<{
      payer_type: 'medicare' | 'medicaid' | 'private' | 'international';
      coverage_likelihood: 'high' | 'medium' | 'low';
      reimbursement_rate?: number;
      requirements: string[];
    }>;
    coding_recommendations: Array<{
      code_type: 'cpt' | 'hcpcs' | 'icd10' | 'drg';
      code: string;
      description: string;
    }>;
  };
  valueProposition: {
    clinical_benefits: string[];
    economic_benefits: string[];
    patient_benefits: string[];
    differentiation: string;
  };
  evidenceRequirements: Array<{
    evidence_type: 'clinical' | 'economic' | 'real_world' | 'comparative';
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  barriers: Array<{
    category: 'regulatory' | 'reimbursement' | 'competitive' | 'adoption';
    description: string;
    mitigation: string;
  }>;
  goToMarketStrategy: {
    timeline: string;
    key_milestones: string[];
    initial_targets: string[];
  };
}

export interface LiteratureReview {
  searchQuery: string;
  totalArticles: number;
  articlesReviewed: number;
  keyFindings: Array<{
    finding: string;
    supporting_studies: string[];
    evidence_level: 'high' | 'moderate' | 'low';
  }>;
  clinicalEvidence: {
    efficacy: {
      summary: string;
      key_metrics: Array<{
        metric: string;
        value: string;
        studies: number;
      }>;
    };
    safety: {
      summary: string;
      adverse_events: Array<{
        event: string;
        frequency: string;
        severity: string;
      }>;
    };
  };
  gaps: Array<{
    area: string;
    description: string;
    recommendation: string;
  }>;
  topCitations: Array<{
    title: string;
    authors: string;
    journal: string;
    year: number;
    doi?: string;
    relevance_score: number;
  }>;
  recommendations: string[];
}

export interface RiskAssessment {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskCategories: Array<{
    category: 'clinical' | 'regulatory' | 'technical' | 'commercial' | 'operational' | 'financial';
    risks: Array<{
      id: string;
      description: string;
      probability: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
      impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
      risk_score: number;
      current_controls: string[];
      residual_risk: 'low' | 'moderate' | 'high' | 'critical';
      mitigation_actions: Array<{
        action: string;
        owner?: string;
        timeline: string;
        expected_impact: string;
      }>;
    }>;
  }>;
  riskMatrix: {
    critical_risks: number;
    high_risks: number;
    moderate_risks: number;
    low_risks: number;
  };
  recommendations: string[];
  nextReviewDate: string;
}

export interface CompetitiveAnalysis {
  marketOverview: {
    market_size: number;
    growth_rate: number;
    key_trends: string[];
  };
  competitors: Array<{
    name: string;
    product: string;
    market_share?: number;
    strengths: string[];
    weaknesses: string[];
    pricing: string;
    regulatory_status: string;
    clinical_evidence: string;
  }>;
  competitiveAdvantages: Array<{
    advantage: string;
    description: string;
    sustainability: 'low' | 'medium' | 'high';
  }>;
  threats: Array<{
    threat: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string;
    mitigation: string;
  }>;
  marketPositioning: {
    recommended_position: string;
    target_segments: string[];
    differentiation_strategy: string;
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export type StructuredOutput =
  | RegulatoryAnalysis
  | ClinicalStudy
  | MarketAccess
  | LiteratureReview
  | RiskAssessment
  | CompetitiveAnalysis;

export type OutputFormat =
  | 'regulatory'
  | 'clinical'
  | 'market_access'
  | 'literature'
  | 'risk'
  | 'competitive'
  | 'text';

// ============================================================================
// Agent Configuration Types
// ============================================================================

export type RetrievalStrategy =
  | 'multi_query'
  | 'compression'
  | 'hybrid'
  | 'self_query'
  | 'rag_fusion';

export type MemoryStrategy = 'short' | 'long' | 'technical' | 'research';

export interface AutonomousAgentOptions {
  stream?: boolean;
  enableRAG?: boolean;
  enableLearning?: boolean;
  retrievalStrategy?: RetrievalStrategy;
  memoryStrategy?: MemoryStrategy;
  outputFormat?: OutputFormat;
  maxIterations?: number;
  temperature?: number;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface AutonomousAgentRequest {
  message: string;
  agent: {
    id: string;
    [key: string]: any;
  };
  userId: string;
  sessionId: string;
  options?: AutonomousAgentOptions;
}

export interface AutonomousAgentResponse {
  success: boolean;
  response: string;
  parsedOutput?: StructuredOutput;
  sources?: any[];
  intermediateSteps?: Array<{
    tool: string;
    input: any;
    output: string;
  }>;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  personalizedContext?: {
    factsUsed: number;
    activeProjects: number;
    activeGoals: number;
  };
}

// ============================================================================
// Streaming Event Types
// ============================================================================

export type StreamEventType =
  | 'start'
  | 'context'
  | 'retrieval'
  | 'retrieval_complete'
  | 'tool_execution'
  | 'output'
  | 'parsed_output'
  | 'complete'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  message?: string;
  data?: any;
  count?: number;
  sources?: any[];
  tool?: string;
  input?: any;
  output?: any;
  content?: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  error?: string;
}

// ============================================================================
// Long-Term Memory Types
// ============================================================================

export type FactCategory = 'preference' | 'context' | 'history' | 'goal' | 'constraint';
export type FactSource = 'explicit' | 'inferred';

export interface UserFact {
  id: string;
  fact: string;
  category: FactCategory;
  source: FactSource;
  confidence: number;
  created_at: string;
  last_accessed: string;
  access_count: number;
}

export interface UserProject {
  id: string;
  name: string;
  type: 'device' | 'trial' | 'submission' | 'research';
  description: string;
  status: string;
  metadata?: any;
  created_at: string;
  last_accessed: string;
}

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  target_date?: string;
  milestones?: string[];
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  created_at: string;
}

export interface UserPreference {
  preference_key: string;
  preference_value: any;
  description?: string;
}

export interface UserProfile {
  summary: string;
  categories: Record<FactCategory, UserFact[]>;
  totalFacts: number;
  lastUpdated: string;
}

export interface PersonalizedContext {
  relevantFacts: string[];
  activeProjects: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  activeGoals: Array<{
    title: string;
    description: string;
    progress: number;
  }>;
  preferences: Record<string, any>;
  contextSummary: string;
}

// ============================================================================
// Tool Execution Types
// ============================================================================

export interface ToolExecution {
  tool: string;
  input: any;
  output: string;
  timestamp: string;
  success: boolean;
  duration?: number;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface AutonomousAgentSettingsProps {
  options: AutonomousAgentOptions;
  onChange: (options: AutonomousAgentOptions) => void;
  onReset: () => void;
}

export interface UserProfileViewerProps {
  userId: string;
  onClose: () => void;
}

export interface ToolExecutionDisplayProps {
  executions: ToolExecution[];
  showDetails?: boolean;
}

export interface StructuredOutputViewerProps {
  output: StructuredOutput;
  format: OutputFormat;
}
