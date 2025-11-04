export interface AgentFormData {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  avatar: string;
  capabilities: string[];
  ragEnabled: boolean;
  temperature: number;
  maxTokens: number;
  knowledgeUrls: string[];
  knowledgeFiles: File[];
  tools: string[];
  knowledgeDomains: string[];
  businessFunction: string;
  role: string;
  department: string;
  promptStarters: PromptStarter[];
  tier: 1 | 2 | 3;
  status: 'active' | 'inactive' | 'testing' | 'development' | 'deprecated';
  priority: number;
  medicalSpecialty: string;
  clinicalValidationStatus: 'pending' | 'validated' | 'expired' | 'under_review';
  hipaaCompliant: boolean;
  pharmaEnabled: boolean;
  verifyEnabled: boolean;
  fdaSamdClass: string;
  accuracyThreshold: number;
  citationRequired: boolean;
  selectedMedicalCapabilities: string[];
  competencySelection: Record<string, string[]>;
  architecturePattern: 'REACTIVE' | 'HYBRID' | 'DELIBERATIVE' | 'MULTI_AGENT';
  reasoningMethod: 'DIRECT' | 'COT' | 'REACT' | 'HYBRID' | 'MULTI_PATH';
  communicationTone: string;
  communicationStyle: string;
  complexityLevel: string;
  primaryMission: string;
  valueProposition: string;
  metadata: any;
}

export interface PromptStarter {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  iconUrl: string;
}

export interface Icon {
  id: string;
  name: string;
  file_url: string;
  category?: string;
}

