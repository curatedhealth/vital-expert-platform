/**
 * Domain-based LLM Model Selection Service
 *
 * Automatically selects the best embedding and chat models based on:
 * - Knowledge domain
 * - Domain tier (1=Core, 2=Specialized, 3=Emerging)
 * - Agent capabilities
 * - Use case requirements
 */

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface ModelRecommendation {
  primary: string;
  alternatives: string[];
  specialized: string | null;
  rationale?: string;
}

export interface DomainModelConfig {
  embedding: ModelRecommendation;
  chat: ModelRecommendation;
}

export interface KnowledgeDomain {
  id: string;
  code: string;
  name: string;
  slug: string;
  tier: number;
  priority: number;
  recommended_models: DomainModelConfig;
  keywords: string[];
  sub_domains: string[];
}

export interface ModelSelectionOptions {
  knowledgeDomains?: string[]; // Array of domain slugs
  tier?: number; // Domain tier override
  useSpecialized?: boolean; // Prefer specialized models if available
  fallbackModel?: string; // Fallback if domain not found
}

// ============================================================================
// Available Models
// ============================================================================

export const AVAILABLE_EMBEDDING_MODELS = {
  // OpenAI - General Purpose
  'text-embedding-3-large': {
    name: 'OpenAI Embedding 3 Large',
    provider: 'OpenAI',
    dimensions: 3072,
    contextWindow: 8191,
    costPer1k: 0.00013,
    description: 'Best general-purpose embeddings, supports Matryoshka',
    suitable_for: ['general', 'business', 'technical'],
  },
  'text-embedding-ada-002': {
    name: 'OpenAI Ada 002',
    provider: 'OpenAI',
    dimensions: 1536,
    contextWindow: 8191,
    costPer1k: 0.0001,
    description: 'Cost-effective general embeddings',
    suitable_for: ['general', 'business'],
  },
  'code-embedding-ada-002': {
    name: 'OpenAI Code Embedding',
    provider: 'OpenAI',
    dimensions: 1536,
    contextWindow: 8191,
    costPer1k: 0.0001,
    description: 'Optimized for code and technical documentation',
    suitable_for: ['technical', 'software'],
  },

  // Medical/Scientific - Specialized
  'biobert-pubmed': {
    name: 'BioBERT PubMed',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Specialized for biomedical literature',
    suitable_for: ['medical', 'clinical', 'research'],
  },
  'pubmedbert-abstract': {
    name: 'PubMedBERT Abstract',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Trained on PubMed abstracts',
    suitable_for: ['medical', 'research', 'publications'],
  },
  'pubmedbert-abstract-fulltext': {
    name: 'PubMedBERT Full Text',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Trained on full PubMed articles',
    suitable_for: ['medical', 'research', 'clinical'],
  },
  'scibert': {
    name: 'SciBERT',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Scientific publications across disciplines',
    suitable_for: ['research', 'scientific', 'publications'],
  },
  'clinicalbert': {
    name: 'ClinicalBERT',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Clinical notes and EHR data',
    suitable_for: ['clinical', 'medical_records'],
  },
  'chembert': {
    name: 'ChemBERT',
    provider: 'HuggingFace',
    dimensions: 768,
    contextWindow: 512,
    costPer1k: 0,
    description: 'Chemical literature and drug discovery',
    suitable_for: ['chemistry', 'drug_development'],
  },
} as const;

export const AVAILABLE_CHAT_MODELS = {
  // OpenAI
  'gpt-4-turbo-preview': {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextWindow: 128000,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    description: 'Most capable general-purpose model',
    suitable_for: ['all'],
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    contextWindow: 8192,
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
    description: 'High-quality reasoning and analysis',
    suitable_for: ['all'],
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    contextWindow: 16385,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    description: 'Fast and cost-effective',
    suitable_for: ['general', 'business'],
  },

  // Anthropic
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextWindow: 200000,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    description: 'Highest accuracy and capability',
    suitable_for: ['all', 'complex_reasoning'],
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    description: 'Balanced performance and cost',
    suitable_for: ['all'],
  },

  // Specialized Medical Models
  'meditron-70b': {
    name: 'Meditron 70B',
    provider: 'HuggingFace',
    contextWindow: 4096,
    costPer1kInput: 0,
    description: 'Medical reasoning and clinical knowledge',
    suitable_for: ['medical', 'clinical'],
  },
} as const;

// ============================================================================
// Model Selection Service
// ============================================================================

export class ModelSelector {

  private getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = createClient();
    }
    return this.supabase;
  }
  private static instance: ModelSelector;
  private supabase: ReturnType<typeof createClient> | null = null;
  private domainCache: Map<string, KnowledgeDomain> = new Map();

  private constructor() {}

  static getInstance(): ModelSelector {
    if (!ModelSelector.instance) {
      ModelSelector.instance = new ModelSelector();
    }
    return ModelSelector.instance;
  }

  /**
   * Get recommended embedding model for given knowledge domains
   */
  async getEmbeddingModel(options: ModelSelectionOptions = {}): Promise<string> {
    const {
      knowledgeDomains = [],
      useSpecialized = false,
      fallbackModel = 'text-embedding-3-large',
    } = options;

    // No domains specified - return default
    if (knowledgeDomains.length === 0) {
      return fallbackModel;
    }

    // Get domain configurations
    const domains = await this.getDomainConfigs(knowledgeDomains);
    if (domains.length === 0) {
      return fallbackModel;
    }

    // Prioritize by tier (Tier 1 > Tier 2 > Tier 3)
    const sortedDomains = domains.sort((a, b) => a.tier - b.tier);
    const primaryDomain = sortedDomains[0];

    // Use specialized model if requested and available
    if (useSpecialized && primaryDomain.recommended_models.embedding.specialized) {
      return primaryDomain.recommended_models.embedding.specialized;
    }

    // Return primary recommendation
    return primaryDomain.recommended_models.embedding.primary;
  }

  /**
   * Get recommended chat model for given knowledge domains
   */
  async getChatModel(options: ModelSelectionOptions = {}): Promise<string> {
    const {
      knowledgeDomains = [],
      useSpecialized = false,
      fallbackModel = 'gpt-4-turbo-preview',
    } = options;

    // No domains specified - return default
    if (knowledgeDomains.length === 0) {
      return fallbackModel;
    }

    // Get domain configurations
    const domains = await this.getDomainConfigs(knowledgeDomains);
    if (domains.length === 0) {
      return fallbackModel;
    }

    // Prioritize by tier (Tier 1 > Tier 2 > Tier 3)
    const sortedDomains = domains.sort((a, b) => a.tier - b.tier);
    const primaryDomain = sortedDomains[0];

    // Use specialized model if requested and available
    if (useSpecialized && primaryDomain.recommended_models.chat.specialized) {
      return primaryDomain.recommended_models.chat.specialized;
    }

    // Return primary recommendation
    return primaryDomain.recommended_models.chat.primary;
  }

  /**
   * Get all model recommendations for a domain
   */
  async getDomainModelRecommendations(
    domainSlug: string
  ): Promise<DomainModelConfig | null> {
    const domain = await this.getDomainConfig(domainSlug);
    return domain?.recommended_models || null;
  }

  /**
   * Get available embedding models for dropdown
   */
  getAvailableEmbeddingModels() {
    return Object.entries(AVAILABLE_EMBEDDING_MODELS).map(([key, value]) => ({
      value: key,
      label: value.name,
      provider: value.provider,
      description: value.description,
      dimensions: value.dimensions,
      suitable_for: value.suitable_for,
    }));
  }

  /**
   * Get available chat models for dropdown
   */
  getAvailableChatModels() {
    return Object.entries(AVAILABLE_CHAT_MODELS).map(([key, value]) => ({
      value: key,
      label: value.name,
      provider: value.provider,
      description: value.description,
      contextWindow: value.contextWindow,
      suitable_for: value.suitable_for,
    }));
  }

  /**
   * Get recommended models for dropdown based on domain
   */
  async getRecommendedModelsForDomain(
    domainSlug: string,
    modelType: 'embedding' | 'chat'
  ): Promise<Array<{ value: string; label: string; isRecommended: boolean; isSpecialized: boolean }>> {
    const domain = await this.getDomainConfig(domainSlug);
    if (!domain) {
      return [];
    }

    const recommendations = domain.recommended_models[modelType];
    const allModels = modelType === 'embedding'
      ? this.getAvailableEmbeddingModels()
      : this.getAvailableChatModels();

    return allModels.map((model) => ({
      value: model.value,
      label: model.label,
      isRecommended:
        model.value === recommendations.primary ||
        recommendations.alternatives.includes(model.value),
      isSpecialized: model.value === recommendations.specialized,
    }));
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async getDomainConfig(slug: string): Promise<KnowledgeDomain | null> {
    // Check cache first
    if (this.domainCache.has(slug)) {
      return this.domainCache.get(slug)!;
    }

    // Fetch from database
    const { data, error } = await this.getSupabaseClient()
      .from('knowledge_domains')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error(`Failed to fetch domain config for ${slug}:`, error);
      return null;
    }

    // Cache and return
    this.domainCache.set(slug, data);
    return data;
  }

  private async getDomainConfigs(slugs: string[]): Promise<KnowledgeDomain[]> {
    const configs = await Promise.all(
      slugs.map((slug) => this.getDomainConfig(slug))
    );
    return configs.filter((config): config is KnowledgeDomain => config !== null);
  }

  /**
   * Clear domain cache (useful after domain updates)
   */
  clearCache(): void {
    this.domainCache.clear();
  }
}

// Export singleton instance
export const modelSelector = ModelSelector.getInstance();
