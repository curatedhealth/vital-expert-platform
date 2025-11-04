// Sprint 3 Component Types

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider?: string;
  maxTokens?: number;
}

export interface ModelFitnessScore {
  overall: number;
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor' | 'not_recommended';
  reasoning: string;
  breakdown: {
    roleMatch: number;
    capabilityMatch: number;
    performanceMatch: number;
    costEfficiency: number;
    contextSizeMatch: number;
    complianceMatch: number;
  };
  strengths: string[];
  weaknesses: string[];
  alternativeSuggestions?: string[];
}

export interface RecommendedModels {
  chat?: string;
  embedding?: string;
}

export interface AgentFormData {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  [key: string]: any; // For other fields
}

