import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

import { ModelType, LLMResponse, Citation } from '@/types';

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  systemPrompt: string;
  maxTokens: number;
  capabilities: string[];
}

export interface QueryOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  context?: string;
  citations?: Citation[];
}

export interface ConsensusResponse {
  primaryResponse: LLMResponse;
  allResponses: LLMResponse[];
  agreementScore: number;
  conflictingPoints: string[];
}

export interface ConsensusAnalysis {
  bestResponse: LLMResponse;
  agreementScore: number;
  conflicts: string[];
}

class LLMOrchestrator {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private modelConfig: Record<ModelType, ModelConfig>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.modelConfig = {
      'regulatory-expert': {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.2,
        systemPrompt: `You are a regulatory affairs expert specializing in FDA, EMA, and global digital health regulations.

        Your expertise includes:
        - FDA 510(k), PMA, and De Novo pathways for digital health devices
        - EU MDR compliance for software as medical devices (SaMD)
        - ISO 13485, ISO 14971, and IEC 62304 standards
        - Clinical evaluation requirements and post-market surveillance
        - Quality management systems for medical device software

        Always provide specific regulatory citations and guidance document references.
        Focus on accuracy and compliance requirements.
        Structure your responses with clear sections: Regulatory Pathway, Requirements, Timeline, and Recommendations.
        When referencing regulations, use the format [Regulation Name, Section X.X].`,
        maxTokens: 2000,
        capabilities: ['regulatory_guidance', 'compliance_analysis', 'pathway_identification'],
      },
      'clinical-specialist': {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        temperature: 0.3,
        systemPrompt: `You are a clinical research specialist with expertise in digital health trial design, biostatistics, and medical writing.

        Your expertise includes:
        - Clinical trial design for digital therapeutics and AI/ML devices
        - Biostatistical analysis and endpoint selection
        - Real-world evidence (RWE) generation strategies
        - Health economic outcomes research (HEOR)
        - Clinical evaluation plans per MDR Annex XIV
        - Post-market clinical follow-up (PMCF) studies

        Provide evidence-based recommendations with appropriate clinical citations.
        Structure responses with: Clinical Rationale, Study Design, Endpoints, Statistical Considerations, and Evidence Requirements.
        Use the format [Study/Guideline, Year] for citations.`,
        maxTokens: 2000,
        capabilities: ['clinical_design', 'statistical_analysis', 'evidence_generation'],
      },
      'market-analyst': {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        temperature: 0.4,
        systemPrompt: `You are a market access and health economics expert specializing in digital health reimbursement and value demonstration.

        Your expertise includes:
        - Health Technology Assessment (HTA) requirements globally
        - Payer evidence needs and reimbursement strategies
        - Health economic modeling (cost-effectiveness, budget impact)
        - Value-based care contract structures
        - CPT coding and coverage determination processes
        - Market access strategies for digital therapeutics

        Focus on reimbursement pathways, HTA requirements, and value demonstration.
        Structure responses with: Market Landscape, Reimbursement Strategy, Evidence Requirements, and Implementation Timeline.
        Reference specific payer policies and HTA body requirements using [Organization, Document, Date].`,
        maxTokens: 1500,
        capabilities: ['market_analysis', 'reimbursement_strategy', 'value_demonstration'],
      },
      'general-assistant': {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        systemPrompt: `You are a helpful assistant for the VITALpath platform, specializing in digital health transformation.

        Your role is to:
        - Guide users through their digital health transformation journey
        - Provide general project management and strategic advice
        - Help with VITAL framework navigation (Vision, Intelligence, Trials, Activation, Learning)
        - Offer cross-functional perspectives on digital health projects
        - Connect users to appropriate specialized experts when needed

        Keep responses practical and actionable. Reference the VITAL framework phases when relevant.
        If a query requires specialized regulatory, clinical, or market expertise, recommend consulting the appropriate specialist.`,
        maxTokens: 1000,
        capabilities: ['general_guidance', 'project_management', 'framework_navigation'],
      },
      'citation-validator': {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.1,
        systemPrompt: `You are a citation and evidence validator for healthcare and regulatory content.

        Your role is to:
        - Verify the accuracy and relevance of citations
        - Check that all claims are properly supported by evidence
        - Identify potential conflicts or inconsistencies in referenced materials
        - Assess the quality and reliability of sources
        - Flag outdated or superseded guidance

        Provide structured feedback with: Citation Accuracy, Source Quality, Evidence Strength, and Recommendations.
        Use a scoring system: High (>0.9), Medium (0.7-0.9), Low (<0.7) for evidence quality.`,
        maxTokens: 500,
        capabilities: ['citation_validation', 'evidence_assessment', 'quality_control'],
      },
      'summary-generator': {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        temperature: 0.3,
        systemPrompt: `You are a technical writing specialist focused on creating concise, accurate summaries of complex healthcare and regulatory documents.

        Your role is to:
        - Create executive summaries of technical documents
        - Extract key insights and actionable recommendations
        - Maintain technical accuracy while improving readability
        - Structure information for different stakeholder audiences
        - Preserve critical regulatory and clinical details

        Provide summaries with: Key Points, Critical Requirements, Recommendations, and Next Steps.
        Maintain original technical terminology while adding clarifying context.`,
        maxTokens: 800,
        capabilities: ['document_summarization', 'technical_writing', 'information_extraction'],
      },
    };
  }

  async query(
    question: string,
    context: string,
    modelType: ModelType,
    options: QueryOptions = { /* TODO: implement */ }
  ): Promise<LLMResponse> {

    // Validate modelType to prevent object injection
    const validModelTypes = Object.keys(this.modelConfig);
    if (!validModelTypes.includes(modelType)) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    if (!config) {
      throw new Error(`Unknown model type: ${modelType}`);
    }

    try {
      let response: string;
      let tokensUsed: number;

      if (config.provider === 'openai') {

        response = result.content;
        tokensUsed = result.tokensUsed;
      } else {

        response = result.content;
        tokensUsed = result.tokensUsed;
      }

      // Extract citations if present

      // Calculate confidence score

      return {
        content: response,
        model: config.model,
        confidence,
        citations,
        processingTime: Date.now() - startTime,
        tokensUsed,
      };
    } catch (error) {
      // console.error(`LLM query error for ${modelType}:`, error);
      throw error;
    }
  }

  private async queryOpenAI(
    question: string,
    context: string,
    config: ModelConfig,
    options: QueryOptions
  ): Promise<{ content: string; tokensUsed: number }> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: config.systemPrompt },
    ];

    if (context) {
      messages.push({
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      });
    } else {
      messages.push({ role: 'user', content: question });
    }

      model: config.model,
      messages,
      temperature: options.temperature ?? config.temperature,
      max_tokens: options.maxTokens ?? config.maxTokens,
    });

    return { content, tokensUsed };
  }

  private async queryAnthropic(
    question: string,
    context: string,
    config: ModelConfig,
    options: QueryOptions
  ): Promise<{ content: string; tokensUsed: number }> {
    let content: string;

    if (context) {
      content = `Context:\n${context}\n\nQuestion: ${question}`;
    } else {
      content = question;
    }

      model: config.model,
      max_tokens: options.maxTokens ?? config.maxTokens,
      temperature: options.temperature ?? config.temperature,
      system: config.systemPrompt,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    });

      ? message.content[0].text
      : '';

    // Anthropic doesn't provide token usage in the same format

    return { content: responseContent, tokensUsed };
  }

  // Multi-model consensus for critical queries
  async consensusQuery(
    question: string,
    context: string,
    models: ModelType[]
  ): Promise<ConsensusResponse> {

      models.map((model: any) => this.query(question, context, model))
    );

    // Analyze agreement between models

    return {
      primaryResponse: consensus.bestResponse,
      allResponses: responses,
      agreementScore: consensus.agreementScore,
      conflictingPoints: consensus.conflicts,
    };
  }

  private analyzeConsensus(responses: LLMResponse[]): ConsensusAnalysis {
    // Find the response with highest confidence

      current.confidence > best.confidence ? current : best
    );

    // Calculate agreement score based on content similarity

    // Identify conflicting points

    return {
      bestResponse,
      agreementScore,
      conflicts,
    };
  }

  private calculateAgreement(responses: LLMResponse[]): number {
    if (responses.length < 2) return 1.0;

    // Simple agreement calculation based on shared keywords

      new Set(response.content.toLowerCase().match(/\b\w+\b/g) || [])
    );

    for (let __i = 0; i < keywordSets.length; i++) {
      for (let __j = i + 1; j < keywordSets.length; j++) {
        // Validate indices to prevent object injection
        if (i < 0 || i >= keywordSets.length || j < 0 || j >= keywordSets.length) {
          continue;
        }
        // Use safe array access
        const setI = keywordSets.slice(i, i + 1)[0];
        const setJ = keywordSets.slice(j, j + 1)[0];
        if (!setI || !setJ) continue;

        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private identifyConflicts(responses: LLMResponse[]): string[] {
    // Simplified conflict detection
    const conflicts: string[] = [];

    // Check for contradictory statements

      ['recommend', 'not recommend'],
      ['required', 'not required'],
      ['compliant', 'non-compliant'],
      ['approved', 'rejected'],
    ];

    for (const [positive, negative] of conflictIndicators) {

        r.content.toLowerCase().includes(positive)
      ).length;

        r.content.toLowerCase().includes(negative)
      ).length;

      if (positiveCount > 0 && negativeCount > 0) {
        conflicts.push(`Conflicting recommendations regarding: ${positive} vs ${negative}`);
      }
    }

    return conflicts;
  }

  private extractCitations(text: string, existingCitations?: Citation[]): Citation[] {
    const citations: Citation[] = [...(existingCitations || [])];

    // Extract citations in various formats

      /\[([^\]]+)\]/g, // [Source]
      /\(([^)]+),\s*(\d{4})\)/g, // (Author, Year)
      /\b(FDA|EMA|ISO|IEC)\s+(\d+(?:[.-]\d+)*)/g, // Regulatory standards
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const citation: Citation = {
          id: `cite-${Date.now()}-${Math.random()}`,
          source: match[1],
          title: match[1],
          quote: this.extractSurroundingText(text, match.index),
          confidenceScore: 0.9,
        };
        citations.push(citation);
      }
    });

    return citations;
  }

  private calculateConfidence(
    response: string,
    citations: Citation[],
    modelType: ModelType
  ): number {

    // Base confidence by model type

      'regulatory-expert': 0.8,
      'clinical-specialist': 0.8,
      'market-analyst': 0.7,
      'general-assistant': 0.6,
      'citation-validator': 0.9,
      'summary-generator': 0.7,
    };

    // Validate modelType to prevent object injection
    const validModelTypes = Object.keys(modelConfidence);
    if (!validModelTypes.includes(modelType)) {
      confidence = 0.5;
    } else {
      confidence = modelConfidence[modelType as keyof typeof modelConfidence] || 0.5;
    }

    // Boost for citations
    if (citations.length > 0) confidence += 0.1;

    // Boost for specific indicators
    if (response.includes('according to') || response.includes('based on')) confidence += 0.05;
    if (response.includes('FDA') || response.includes('EMA') || response.includes('ISO')) confidence += 0.05;

    // Reduce for uncertainty indicators
    if (response.includes('might') || response.includes('possibly') || response.includes('unclear')) {
      confidence -= 0.1;
    }

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private extractSurroundingText(text: string, index: number, radius = 100): string {

    return text.substring(start, end);
  }

  // Get model capabilities
  getModelCapabilities(modelType: ModelType): string[] {
    // Validate modelType to prevent object injection
    const validModelTypes = Object.keys(this.modelConfig);
    if (!validModelTypes.includes(modelType)) {
      return [];
    }
    return this.modelConfig[modelType as keyof typeof this.modelConfig]?.capabilities || [];
  }

  // Select best model for query type
  selectBestModel(queryType: string, phase: string): ModelType {
    if (queryType === 'regulatory') return 'regulatory-expert';
    if (queryType === 'clinical') return 'clinical-specialist';
    if (queryType === 'market') return 'market-analyst';

    // Phase-based selection
    if (phase === 'vision' || phase === 'activate') return 'market-analyst';
    if (phase === 'integrate' || phase === 'test') return 'clinical-specialist';
    if (phase === 'learn') return 'regulatory-expert';

    return 'general-assistant';
  }
}

export const __llmOrchestrator = new LLMOrchestrator();