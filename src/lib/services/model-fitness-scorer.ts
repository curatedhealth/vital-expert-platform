/**
 * LLM Model Fitness Scorer
 *
 * Evaluates how well an LLM model matches an agent's role, capabilities,
 * and requirements. Provides scores and recommendations to help users
 * select the optimal model for their specific use case.
 */

export interface BenchmarkResult {
  benchmark_name: string;           // e.g., "MedQA", "HumanEval", "MMLU"
  score: number;                    // 0-1 or percentage
  metric: string;                   // "accuracy", "F1", "BLEU", etc.
  dataset: string;                  // Dataset used
  year: number;                     // Year of benchmark
  citation?: string;                // Academic citation or URL
  doi?: string;                     // DOI if available
  source_url?: string;              // Link to results
}

export interface ModelCapabilities {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  capabilities?: {
    streaming?: boolean;
    function_calling?: boolean;
    context_window?: number;
    medical_knowledge?: boolean;
    code_generation?: boolean;
    image_understanding?: boolean;
    supports_phi?: boolean;
  };
  cost_per_1k_input_tokens?: number;
  cost_per_1k_output_tokens?: number;

  // Evidence-based performance data
  benchmarks?: BenchmarkResult[];
  research_citations?: {
    model_card?: string;            // Official model card URL
    technical_report?: string;      // Technical report URL
    papers?: string[];              // Research papers
  };
}

export interface AgentProfile {
  role?: string;
  businessFunction?: string;
  capabilities?: string[];
  description?: string;
  medicalSpecialty?: string;
  requiresHighAccuracy?: boolean;
  expectedOutputLength?: 'short' | 'medium' | 'long' | 'very_long';
  requiresCodeGeneration?: boolean;
  requiresMedicalKnowledge?: boolean;
  hipaaCompliant?: boolean;

  // Dynamic agent configuration from Supabase
  temperature?: number;           // 0-1, creativity level
  max_tokens?: number;            // Response length limit
  rag_enabled?: boolean;          // RAG integration enabled
  context_window?: number;        // Required context window size
  response_format?: string;       // markdown, json, text, etc.
  tools?: string[];               // Required tools
  knowledge_domains?: string[];   // Knowledge domains
}

export interface AlternativeModel {
  name: string;
  reason: string;
  benchmarks?: BenchmarkResult[];
  citations?: string[];
}

export interface FitnessScore {
  overall: number; // 0-100
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
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor' | 'not_recommended';
  reasoning: string;
  alternativeSuggestions?: string[];

  // Evidence-based recommendations
  evidenceBasedAlternatives?: AlternativeModel[];
  benchmarkComparison?: {
    current_model: BenchmarkResult[];
    relevant_benchmarks: string[];  // Which benchmarks matter for this agent
  };
}

export class ModelFitnessScorer {
  /**
   * Calculate comprehensive fitness score for a model given an agent profile
   */
  static calculateFitness(model: ModelCapabilities, agent: AgentProfile): FitnessScore {
    const scores = {
      roleMatch: this.scoreRoleMatch(model, agent),
      capabilityMatch: this.scoreCapabilityMatch(model, agent),
      performanceMatch: this.scorePerformanceMatch(model, agent),
      costEfficiency: this.scoreCostEfficiency(model, agent),
      contextSizeMatch: this.scoreContextSize(model, agent),
      complianceMatch: this.scoreCompliance(model, agent),
    };

    // Weighted overall score
    const weights = {
      roleMatch: 0.25,
      capabilityMatch: 0.25,
      performanceMatch: 0.15,
      costEfficiency: 0.10,
      contextSizeMatch: 0.15,
      complianceMatch: 0.10,
    };

    const overall = Math.round(
      scores.roleMatch * weights.roleMatch +
      scores.capabilityMatch * weights.capabilityMatch +
      scores.performanceMatch * weights.performanceMatch +
      scores.costEfficiency * weights.costEfficiency +
      scores.contextSizeMatch * weights.contextSizeMatch +
      scores.complianceMatch * weights.complianceMatch
    );

    const { strengths, weaknesses } = this.analyzeStrengthsWeaknesses(model, agent, scores);
    const recommendation = this.getRecommendation(overall, scores);
    const reasoning = this.generateReasoning(model, agent, scores, overall);
    const alternativeSuggestions = this.suggestAlternatives(model, agent, overall);

    // Generate evidence-based alternatives with benchmarks and citations
    const evidenceBasedAlternatives = this.suggestEvidenceBasedAlternatives(model, agent, overall);

    // Get relevant benchmarks for this agent
    const { getRelevantBenchmarks } = require('../data/model-benchmarks');
    const relevantBenchmarks = getRelevantBenchmarks(agent);

    return {
      overall,
      breakdown: scores,
      strengths,
      weaknesses,
      recommendation,
      reasoning,
      alternativeSuggestions,
      evidenceBasedAlternatives,
      benchmarkComparison: {
        current_model: model.benchmarks || [],
        relevant_benchmarks: relevantBenchmarks
      }
    };
  }

  /**
   * Score how well the model matches the agent's role
   */
  private static scoreRoleMatch(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50; // Base score

    const role = agent.role?.toLowerCase() || '';
    const businessFunction = agent.businessFunction?.toLowerCase() || '';
    const modelName = model.name.toLowerCase();
    const provider = model.provider.toLowerCase();

    // Medical/Healthcare roles
    if (role.includes('medical') || role.includes('clinical') || role.includes('health') ||
        businessFunction.includes('clinical') || businessFunction.includes('medical')) {

      // Medical-specific models get bonus
      if (modelName.includes('biogpt') || modelName.includes('meditron') ||
          modelName.includes('pubmed') || modelName.includes('clinical') ||
          modelName.includes('med-palm')) {
        score += 50;
      } else if (provider === 'anthropic' || modelName.includes('gpt-4')) {
        score += 30; // GPT-4 and Claude are good for medical
      } else if (modelName.includes('gpt-3.5')) {
        score += 10; // GPT-3.5 is okay but not ideal
      }
    }

    // Regulatory/Compliance roles
    else if (role.includes('regulatory') || role.includes('compliance') ||
             businessFunction.includes('regulatory')) {
      if (provider === 'anthropic' || modelName.includes('gpt-4')) {
        score += 40; // Need high accuracy
      } else if (modelName.includes('claude')) {
        score += 45; // Claude is excellent for compliance
      }
    }

    // Technical/Development roles
    else if (role.includes('developer') || role.includes('engineer') ||
             role.includes('technical') || role.includes('architect')) {
      if (modelName.includes('code') || model.capabilities?.code_generation) {
        score += 50;
      } else if (modelName.includes('gpt-4')) {
        score += 35;
      }
    }

    // Business/Strategy roles
    else if (role.includes('strategy') || role.includes('business') ||
             role.includes('commercial') || role.includes('market')) {
      if (provider === 'openai' || provider === 'anthropic') {
        score += 40;
      } else {
        score += 20;
      }
    }

    // Research/Analysis roles
    else if (role.includes('research') || role.includes('analyst') ||
             role.includes('scientist')) {
      if (modelName.includes('gpt-4') || provider === 'anthropic') {
        score += 45;
      } else if (modelName.includes('llama') || modelName.includes('mixtral')) {
        score += 30;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Score capability match
   */
  private static scoreCapabilityMatch(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50;
    const capabilities = agent.capabilities || [];

    // Medical knowledge requirement
    if (agent.requiresMedicalKnowledge && model.capabilities?.medical_knowledge) {
      score += 30;
    } else if (agent.requiresMedicalKnowledge && !model.capabilities?.medical_knowledge) {
      score -= 20;
    }

    // Code generation requirement
    if (agent.requiresCodeGeneration && model.capabilities?.code_generation) {
      score += 20;
    } else if (agent.requiresCodeGeneration && !model.capabilities?.code_generation) {
      score -= 15;
    }

    // Function calling for complex capabilities
    if (capabilities.length > 5 && model.capabilities?.function_calling) {
      score += 15;
    }

    // Streaming for interactive agents
    if (model.capabilities?.streaming) {
      score += 10;
    }

    // Check specific capability keywords
    const capabilityText = capabilities.join(' ').toLowerCase();
    if (capabilityText.includes('analysis') || capabilityText.includes('research')) {
      if (model.maxTokens >= 8000) score += 10;
    }

    // Temperature-based scoring: Higher temperature models better for creative tasks
    if (agent.temperature !== undefined) {
      if (agent.temperature >= 0.8) {
        // Creative tasks - prefer GPT-4, Claude for better quality at high temperature
        if (model.name.includes('GPT-4') || model.name.includes('Claude')) {
          score += 10;
        }
      } else if (agent.temperature <= 0.3) {
        // Deterministic tasks - any model works well
        score += 5;
      }
    }

    // Tools requirement: Function calling is essential for agents with many tools
    if (agent.tools && agent.tools.length > 0) {
      if (model.capabilities?.function_calling) {
        score += 15;
      } else {
        score -= 20; // Major penalty if tools required but no function calling
      }
    }

    // Knowledge domains: RAG-enabled agents benefit from large context windows
    if (agent.knowledge_domains && agent.knowledge_domains.length > 0) {
      if (model.maxTokens >= 32000) {
        score += 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score performance match
   */
  private static scorePerformanceMatch(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50;

    // High accuracy requirements
    if (agent.requiresHighAccuracy) {
      if (model.name.includes('GPT-4') || model.name.includes('Claude 3 Opus')) {
        score += 50;
      } else if (model.name.includes('Claude 3 Sonnet')) {
        score += 40;
      } else if (model.provider === 'anthropic') {
        score += 30;
      } else if (model.name.includes('gpt-3.5')) {
        score += 10;
      }
    } else {
      // For non-critical tasks, faster models are fine
      if (model.name.includes('3.5') || model.name.includes('Haiku') ||
          model.name.includes('7B')) {
        score += 30;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Score cost efficiency
   */
  private static scoreCostEfficiency(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50;

    const avgCost = (model.cost_per_1k_input_tokens || 0 + model.cost_per_1k_output_tokens || 0) / 2;

    // For simple tasks, cheaper is better
    const capabilities = agent.capabilities?.length || 0;
    if (capabilities < 3) {
      if (avgCost < 0.001) score += 50; // Free or very cheap (HuggingFace)
      else if (avgCost < 0.01) score += 30; // GPT-3.5 range
      else score += 10; // GPT-4 range
    } else {
      // For complex tasks, balance cost with capability
      if (avgCost < 0.05 && model.maxTokens > 8000) score += 40;
      else if (avgCost < 0.1) score += 30;
      else score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Score context size match
   */
  private static scoreContextSize(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50;

    // Use agent's actual max_tokens if provided (from Supabase)
    const requiredTokens = agent.max_tokens || this.getTokensFromOutputLength(agent.expectedOutputLength);
    const contextWindow = model.maxTokens;

    // Use agent's context_window requirement if specified
    const requiredContextWindow = agent.context_window || requiredTokens;

    // Score based on how well model's context window matches requirements
    if (contextWindow >= requiredContextWindow * 2) {
      score += 50; // Plenty of headroom
    } else if (contextWindow >= requiredContextWindow * 1.5) {
      score += 40; // Good margin
    } else if (contextWindow >= requiredContextWindow) {
      score += 30; // Meets minimum
    } else if (contextWindow >= requiredContextWindow * 0.8) {
      score += 10; // Slightly under, risky
    } else {
      score -= 40; // Insufficient, will cause truncation
    }

    // Bonus for models with very large context windows (RAG use cases)
    if (agent.rag_enabled && contextWindow >= 100000) {
      score += 20;
    } else if (agent.rag_enabled && contextWindow >= 32000) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Helper to convert output length to token estimate
   */
  private static getTokensFromOutputLength(outputLength?: 'short' | 'medium' | 'long' | 'very_long'): number {
    switch (outputLength) {
      case 'short': return 500;
      case 'medium': return 2000;
      case 'long': return 4000;
      case 'very_long': return 8000;
      default: return 2000;
    }
  }

  /**
   * Score compliance match
   */
  private static scoreCompliance(model: ModelCapabilities, agent: AgentProfile): number {
    let score = 50;

    if (agent.hipaaCompliant) {
      // Check if model supports PHI
      if (model.capabilities?.supports_phi) {
        score += 50;
      } else if (model.provider === 'openai' || model.provider === 'anthropic') {
        score += 20; // Can be configured with BAA
      } else {
        score -= 30; // Open source models need self-hosting
      }
    } else {
      score += 30; // No special compliance requirements
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Analyze strengths and weaknesses
   */
  private static analyzeStrengthsWeaknesses(
    model: ModelCapabilities,
    agent: AgentProfile,
    scores: FitnessScore['breakdown']
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze each score component
    if (scores.roleMatch >= 80) {
      strengths.push('Excellent match for this role');
    } else if (scores.roleMatch < 50) {
      weaknesses.push('Not optimized for this role type');
    }

    if (scores.capabilityMatch >= 80) {
      strengths.push('Supports all required capabilities');
    } else if (scores.capabilityMatch < 50) {
      weaknesses.push('Missing some key capabilities');
    }

    if (scores.performanceMatch >= 80) {
      strengths.push('High performance and accuracy');
    } else if (scores.performanceMatch < 50) {
      weaknesses.push('May not meet performance requirements');
    }

    if (scores.costEfficiency >= 80) {
      strengths.push('Very cost-effective');
    } else if (scores.costEfficiency < 40) {
      weaknesses.push('Higher cost compared to alternatives');
    }

    if (scores.contextSizeMatch >= 80) {
      strengths.push('Adequate context window');
    } else if (scores.contextSizeMatch < 50) {
      weaknesses.push('Limited context window for long outputs');
    }

    if (scores.complianceMatch >= 80) {
      strengths.push('Meets compliance requirements');
    } else if (scores.complianceMatch < 50) {
      weaknesses.push('Compliance concerns');
    }

    // Model-specific strengths
    if (model.capabilities?.medical_knowledge) {
      strengths.push('Specialized medical knowledge');
    }
    if (model.capabilities?.code_generation) {
      strengths.push('Code generation support');
    }
    if (model.maxTokens >= 100000) {
      strengths.push('Very large context window');
    }

    // Dynamic agent configuration insights
    if (agent.rag_enabled && model.maxTokens >= 32000) {
      strengths.push('Excellent for RAG applications');
    }
    if (agent.tools && agent.tools.length > 0 && model.capabilities?.function_calling) {
      strengths.push('Supports required tool integrations');
    }
    if (agent.tools && agent.tools.length > 0 && !model.capabilities?.function_calling) {
      weaknesses.push('No function calling for tool integrations');
    }
    if (agent.temperature && agent.temperature >= 0.8 &&
        (model.name.includes('GPT-4') || model.name.includes('Claude'))) {
      strengths.push('Good for creative tasks with high temperature');
    }

    return { strengths, weaknesses };
  }

  /**
   * Get overall recommendation category
   */
  private static getRecommendation(overall: number, scores: FitnessScore['breakdown']): FitnessScore['recommendation'] {
    if (overall >= 85) return 'excellent';
    if (overall >= 70) return 'good';
    if (overall >= 55) return 'acceptable';
    if (overall >= 40) return 'poor';
    return 'not_recommended';
  }

  /**
   * Generate human-readable reasoning
   */
  private static generateReasoning(
    model: ModelCapabilities,
    agent: AgentProfile,
    scores: FitnessScore['breakdown'],
    overall: number
  ): string {
    const role = agent.role || 'this role';
    const modelName = model.name;

    if (overall >= 85) {
      return `${modelName} is an excellent choice for ${role}. It excels in the required capabilities with high performance and good value.`;
    } else if (overall >= 70) {
      return `${modelName} is a good fit for ${role}. It meets most requirements effectively, though there may be slightly better alternatives.`;
    } else if (overall >= 55) {
      return `${modelName} is acceptable for ${role} but may not be optimal. Consider alternatives for better performance or cost efficiency.`;
    } else if (overall >= 40) {
      return `${modelName} has limited suitability for ${role}. Significant trade-offs in capability, performance, or cost may impact effectiveness.`;
    } else {
      return `${modelName} is not recommended for ${role}. Consider alternative models that better match the requirements.`;
    }
  }

  /**
   * Suggest alternative models (legacy - simple string format)
   */
  private static suggestAlternatives(
    model: ModelCapabilities,
    agent: AgentProfile,
    currentScore: number
  ): string[] {
    const suggestions: string[] = [];
    const role = agent.role?.toLowerCase() || '';

    // Medical roles
    if (role.includes('medical') || role.includes('clinical')) {
      if (!model.name.includes('BioGPT') && currentScore < 80) {
        suggestions.push('BioGPT - Specialized for biomedical text (F1: 0.849 on BC5CDR)');
      }
      if (!model.name.includes('GPT-4') && currentScore < 90) {
        suggestions.push('GPT-4 - High accuracy for medical tasks (86.7% on MedQA)');
      }
      if (!model.name.includes('Claude 3')) {
        suggestions.push('Claude 3 Opus - Excellent medical reasoning (86.8% on MMLU)');
      }
    }

    // High accuracy needs
    if (agent.requiresHighAccuracy && !model.name.includes('GPT-4')) {
      suggestions.push('GPT-4 Turbo - Best overall accuracy (86% on MMLU)');
      suggestions.push('Claude 3 Opus - Superior reasoning (95.1% on GSM8K)');
    }

    // Cost-sensitive
    if (currentScore < 70 && model.cost_per_1k_input_tokens && model.cost_per_1k_input_tokens > 0.01) {
      suggestions.push('GPT-3.5 Turbo - Cost-effective alternative (70% on MMLU)');
      suggestions.push('Mixtral 8x7B - Free open-source option');
    }

    // Long context needs
    if (agent.expectedOutputLength === 'very_long' && model.maxTokens < 100000) {
      suggestions.push('Claude 3 Sonnet - 200K context window');
      suggestions.push('GPT-4 Turbo - 128K context window');
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }

  /**
   * Generate evidence-based alternative model suggestions with citations
   */
  private static suggestEvidenceBasedAlternatives(
    model: ModelCapabilities,
    agent: AgentProfile,
    currentScore: number
  ): AlternativeModel[] {
    const alternatives: AlternativeModel[] = [];

    // Import benchmark data dynamically
    const { getModelBenchmarks, getModelCitations } = require('../data/model-benchmarks');

    // Medical/Clinical roles - suggest specialized medical models
    if (agent.requiresMedicalKnowledge || agent.medicalSpecialty) {
      // BioGPT
      if (!model.id.includes('biogpt')) {
        const benchmarks = getModelBenchmarks('microsoft/biogpt');
        const citations = getModelCitations('microsoft/biogpt');
        alternatives.push({
          name: 'BioGPT',
          reason: 'Specialized biomedical language model pre-trained on PubMed abstracts. Achieves state-of-the-art performance on biomedical NER and relation extraction tasks.',
          benchmarks: benchmarks,
          citations: citations.papers
        });
      }

      // GPT-4 for medical
      if (!model.name.includes('GPT-4')) {
        const benchmarks = getModelBenchmarks('gpt-4').filter((b: any) =>
          b.benchmark_name.includes('MedQA') || b.benchmark_name === 'MMLU'
        );
        const citations = getModelCitations('gpt-4');
        alternatives.push({
          name: 'GPT-4',
          reason: 'Achieves 86.7% accuracy on MedQA (USMLE), exceeding the passing threshold for US Medical Licensing Exam. Excellent for medical reasoning and diagnosis.',
          benchmarks: benchmarks,
          citations: [citations.technical_report || '']
        });
      }

      // PubMedBERT
      if (!model.id.includes('PubMedBERT')) {
        const benchmarks = getModelBenchmarks('microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext');
        const citations = getModelCitations('microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext');
        alternatives.push({
          name: 'PubMedBERT',
          reason: 'Domain-specific BERT model trained on PubMed abstracts and full-text articles. Optimized for biomedical text understanding and entity recognition.',
          benchmarks: benchmarks,
          citations: citations.papers
        });
      }
    }

    // Code generation roles
    if (agent.requiresCodeGeneration) {
      // Claude 3 Opus for code
      if (!model.name.includes('Claude 3 Opus')) {
        const benchmarks = getModelBenchmarks('claude-3-opus').filter((b: any) =>
          b.benchmark_name === 'HumanEval'
        );
        const citations = getModelCitations('claude-3-opus');
        alternatives.push({
          name: 'Claude 3 Opus',
          reason: 'Achieves 84.5% pass@1 on HumanEval, outperforming most models on Python code generation. Excellent for complex coding tasks.',
          benchmarks: benchmarks,
          citations: [citations.technical_report || '']
        });
      }

      // CodeLlama
      if (!model.id.includes('CodeLlama')) {
        const benchmarks = getModelBenchmarks('codellama/CodeLlama-34b-Instruct-hf');
        const citations = getModelCitations('codellama/CodeLlama-34b-Instruct-hf');
        alternatives.push({
          name: 'CodeLlama 34B',
          reason: 'Specialized code generation model fine-tuned from Llama 2. Optimized for programming tasks across multiple languages.',
          benchmarks: benchmarks,
          citations: citations.papers
        });
      }
    }

    // High accuracy requirements
    if (agent.requiresHighAccuracy && currentScore < 85) {
      // Claude 3 Opus
      if (!model.name.includes('Claude 3 Opus')) {
        const benchmarks = getModelBenchmarks('claude-3-opus');
        const citations = getModelCitations('claude-3-opus');
        alternatives.push({
          name: 'Claude 3 Opus',
          reason: 'Achieves 86.8% on MMLU and 95.1% on GSM8K. Industry-leading performance on reasoning tasks and mathematical problem-solving.',
          benchmarks: benchmarks,
          citations: [citations.technical_report || '']
        });
      }

      // GPT-4
      if (!model.name.includes('GPT-4')) {
        const benchmarks = getModelBenchmarks('gpt-4');
        const citations = getModelCitations('gpt-4');
        alternatives.push({
          name: 'GPT-4',
          reason: 'Comprehensive high-performance model with 86.4% on MMLU. Excels across diverse domains including science, history, and professional exams.',
          benchmarks: benchmarks,
          citations: [citations.technical_report || '']
        });
      }
    }

    // Return top 3 alternatives
    return alternatives.slice(0, 3);
  }
}
