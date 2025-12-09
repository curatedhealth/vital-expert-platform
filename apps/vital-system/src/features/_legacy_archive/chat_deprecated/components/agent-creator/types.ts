export interface AgentFormData {
  name: string;
  avatar: string;
  tier: string;
  status: string;
  priority: string;
  description: string;
  systemPrompt: string;
  businessFunction: string;
  department: string;
  role: string;
  capabilities: string[];
  ragEnabled: boolean;
  knowledgeUrls: string[];
  knowledgeFiles: File[];
  knowledgeDomains: string[];
  tools: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  promptStarters: PromptStarter[];
}

export interface PromptStarter {
  id: string;
  text: string;
}

export interface Icon {
  id: string;
  name: string;
  svg_data: string;
  category?: string;
}

export interface Tool {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  authentication_required?: boolean;
}

