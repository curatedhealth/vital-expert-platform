/**
 * VITAL AI - Enhanced Sidebar Type Definitions
 * Implementation of "Invisible Intelligence" philosophy
 */

export interface ConversationContext {
  regulatory: {
    type: 'FDA' | 'EMA' | 'PMDA' | 'TGA' | 'Health Canada';
    submissionType?: '510k' | 'PMA' | 'IND' | 'NDA' | 'BLA';
    stage?: 'pre-submission' | 'review' | 'response' | 'approval';
    deadline?: Date;
    complianceStatus: ComplianceStatus[];
  };
  clinical?: {
    trialPhase?: 'I' | 'II' | 'III' | 'IV';
    indication?: string;
    enrollment?: number;
    sites?: number;
  };
  agents: {
    primary: Agent;
    supporting: Agent[];
    recommended: Agent[];
  };
  intelligence: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    actionRequired: boolean;
    suggestions: SmartSuggestion[];
    relatedDocs: Document[];
  };
}

export interface SmartSuggestion {
  id: string;
  text: string;
  confidence: number; // 0-1
  type: 'action' | 'query' | 'document' | 'expert';
  icon: string;
  metadata?: any;
}

export interface ComplianceStatus {
  regulation: string;
  status: 'compliant' | 'pending' | 'non-compliant' | 'not-applicable';
  lastChecked: Date;
  autoMonitored: boolean;
}

export interface AdaptiveDensity {
  mode: 'comfortable' | 'compact' | 'spacious';
  triggers: {
    userExpertise: 'novice' | 'intermediate' | 'expert';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    complexity: number; // 0-1
    device: 'mobile' | 'tablet' | 'desktop' | 'large';
  };
  metrics: {
    cognitiveLoad: number; // 0-1
    efficiency: number; // 0-1
    errorRate: number; // 0-1
    satisfaction: number; // 0-1
  };
}

export interface ZeroClickAction {
  id: string;
  type: 'action' | 'navigation' | 'suggestion' | 'alert';
  priority: 'critical' | 'high' | 'medium' | 'low';

  trigger: {
    context: string[];
    time?: TimeBasedTrigger;
    event?: EventBasedTrigger;
    pattern?: PatternBasedTrigger;
  };

  presentation: {
    text: string;
    icon: string;
    color: string;
    position: 'inline' | 'floating' | 'modal';
    animation?: 'pulse' | 'glow' | 'shake';
  };

  action: {
    type: 'execute' | 'suggest' | 'prepare';
    handler: () => Promise<void>;
    preload?: () => Promise<void>;
    undo?: () => Promise<void>;
  };
}

export interface TimeBasedTrigger {
  hour?: number;
  dayOfWeek?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface EventBasedTrigger {
  event: string;
  conditions?: Record<string, unknown>;
}

export interface PatternBasedTrigger {
  userAction: string;
  frequency: number;
  recency: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  context?: ConversationContext;
}

export interface Agent {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  specialty: string[];
  satisfactionScore: number; // 0-5
  currentLoad: number; // 0-1
}

export interface ConversationGroupProps {
  title: string;
  icon?: React.ReactNode;
  conversations: Conversation[];
  isExpanded: boolean;
  defaultOpen?: boolean;
  highlight?: 'urgent' | 'regulatory' | 'clinical';
}

export interface ConversationItemProps {
  conversation: Conversation;
  highlight?: 'urgent' | 'regulatory' | 'clinical';
}

export interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onSelect: (suggestion: SmartSuggestion) => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Intelligence types
export interface IntelligentContext {
  predictions: {
    nextAction: PredictedAction;
    confidence: number;
    alternatives: PredictedAction[];
    reasoning: string;
  };

  suggestions: {
    zeroClick: ZeroClickAction[];
    contextual: ContextualSuggestion[];
    proactive: ProactiveAlert[];
  };

  medical: {
    terminology: MedicalTerm[];
    interactions: DrugInteraction[];
    contraindications: Contraindication[];
    guidelines: ClinicalGuideline[];
  };

  regulatory: {
    framework: 'FDA' | 'EMA' | 'PMDA' | 'TGA';
    requirements: ComplianceRequirement[];
    deadlines: Deadline[];
    risks: RegulatoryRisk[];
  };

  workflow: {
    stage: WorkflowStage;
    completeness: number;
    blockers: WorkflowBlocker[];
    recommendations: WorkflowRecommendation[];
  };
}

export interface PredictedAction {
  id: string;
  type: string;
  confidence: number;
  endpoint?: string;
  data?: any;
}

export interface ContextualSuggestion {
  id: string;
  text: string;
  type: string;
  confidence: number;
}

export interface ProactiveAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  actions?: string[];
}

export interface MedicalTerm {
  term: string;
  definition: string;
  category: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface Contraindication {
  condition: string;
  treatment: string;
  reason: string;
}

export interface ClinicalGuideline {
  title: string;
  organization: string;
  url: string;
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  regulation: string;
  requirement: string;
  deadline?: Date;
  status: 'met' | 'pending' | 'overdue';
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface RegulatoryRisk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkflowStage {
  id: string;
  name: string;
  progress: number; // 0-1
}

export interface WorkflowBlocker {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolution?: string;
}

export interface WorkflowRecommendation {
  id: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  action?: string;
}