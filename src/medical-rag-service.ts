/**
 * VITAL Path Medical RAG Service
 * Specialized RAG implementation for medical and healthcare domains
 * Implements PRISM framework with enhanced medical context awareness
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Enhanced medical context types
export interface MedicalContext {
  therapeuticAreas: string[];
  medicalSpecialties: string[];
  drugNames: string[];
  indicationMentions: string[];
  studyTypes: string[];
  evidenceLevel: string;
  regulatoryMentions: string[];
}

export interface MedicalSearchFilters {
  domain?: 'medical_affairs' | 'regulatory_compliance' | 'clinical_research' | 'digital_health';
  domain_filter?: 'regulatory' | 'clinical' | 'medical_affairs' | 'digital_health' | 'commercial';
  evidence_level_filter?: string[];
  prismSuite?: 'RULES' | 'TRIALS' | 'GUARD' | 'VALUE' | 'BRIDGE' | 'PROOF' | 'CRAFT' | 'SCOUT';
  therapeuticAreas?: string[];
  medicalSpecialties?: string[];
  evidenceLevels?: string[];
  studyTypes?: string[];
  contentTypes?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  qualityThreshold?: number;
}

export interface MedicalRAGResult {
  chunkId: string;
  knowledgeSourceId: string;
  content: string;
  similarity: number;
  medicalContext: MedicalContext;
  sourceMetadata: {
    title: string;
    authors: string[];
    publicationDate: string;
    journal?: string;
    doi?: string;
    evidenceLevel: string;
  };
  qualityScore: number;
  relevanceScore: number;
  citations: string[];
}

export interface MedicalRAGResponse {
  results: MedicalRAGResult[];
  totalCount: number;
  searchMetadata: {
    queryProcessingTime: number;
    embeddingTime: number;
    searchTime: number;
    filters: MedicalSearchFilters;
    medicalEntitiesDetected: string[];
  };
  recommendedFollowUps: string[];
  qualityInsights: {
    averageQualityScore: number;
    evidenceLevelDistribution: Record<string, number>;
    sourceTypeDistribution: Record<string, number>;
  };
}

export class MedicalRAGService {
  private supabase: SupabaseClient;
  private embeddings: OpenAIEmbeddings;
  private defaultTenantId: string;

  // Medical entity extraction patterns
  private medicalPatterns = {
    therapeuticAreas: [
      'oncology', 'cardiology', 'neurology', 'psychiatry', 'endocrinology',
      'infectious disease', 'rheumatology', 'gastroenterology', 'pulmonology',
      'dermatology', 'ophthalmology', 'orthopedics', 'urology', 'gynecology'
    ],
    studyTypes: [
      'randomized controlled trial', 'rct', 'systematic review', 'meta-analysis',
      'cohort study', 'case-control', 'cross-sectional', 'case series',
      'observational study', 'clinical trial', 'phase i', 'phase ii', 'phase iii'
    ],
    evidenceLevels: [
      'systematic review', 'meta-analysis', 'rct', 'cohort', 'case-control',
      'case series', 'expert opinion', 'level 1', 'level 2', 'level 3', 'level 4'
    ],
    regulatoryTerms: [
      'fda', 'ema', 'ich', 'gcp', 'glp', 'gmp', '510k', 'pma', 'de novo',
      'investigational new drug', 'ind', 'nda', 'bla', 'premarket approval'
    ]
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'text-embedding-ada-002',
    });

    this.defaultTenantId = '00000000-0000-0000-0000-000000000000';
  }

  /**
   * Enhanced medical search with context awareness
   */
  async searchMedicalKnowledge(
    query: string,
    filters: MedicalSearchFilters = { /* TODO: implement */ },
    options: {
      maxResults?: number;
      similarityThreshold?: number;
      tenantId?: string;
      includeMetadata?: boolean;
    } = { /* TODO: implement */ }
  ): Promise<MedicalRAGResponse> {

    try {
      // Extract medical entities from query
      const medicalEntities = await this.extractMedicalEntities(query);

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build search parameters
      const searchParams = {
        p_tenant_id: options.tenantId || this.defaultTenantId,
        p_query_embedding: `[${queryEmbedding.join(',')}]`,
        p_domain: filters.domain || null,
        p_prism_suite: filters.prismSuite || null,
        p_therapeutic_areas: filters.therapeuticAreas || null,
        p_medical_specialties: filters.medicalSpecialties || null,
        p_evidence_levels: filters.evidenceLevels || null,
        p_match_threshold: options.similarityThreshold || 0.7,
        p_match_count: options.maxResults || 10
      };

      // Execute enhanced medical search

      const { data: searchResults, error } = await this.supabase
        .rpc('match_medical_documents', searchParams);

      if (error) {
        // console.error('Medical RAG search error:', error);
        throw new Error(`Medical search failed: ${error.message}`);
      }

      // Process and enhance results
      const results: MedicalRAGResult[] = (searchResults || []).map((result: unknown) => ({
        chunkId: result.chunk_id,
        knowledgeSourceId: result.knowledge_source_id,
        content: result.content,
        similarity: result.similarity,
        medicalContext: {
          therapeuticAreas: result.therapeutic_areas || [],
          medicalSpecialties: result.medical_specialties || [],
          drugNames: this.extractDrugNames(result.content),
          indicationMentions: this.extractIndications(result.content),
          studyTypes: this.extractStudyTypes(result.content),
          evidenceLevel: result.evidence_level || 'unknown',
          regulatoryMentions: this.extractRegulatoryMentions(result.content)
        },
        sourceMetadata: {
          title: result.source_title || 'Unknown Title',
          authors: result.source_authors || [],
          publicationDate: result.publication_date || '',
          journal: result.journal,
          doi: result.doi,
          evidenceLevel: result.evidence_level || 'unknown'
        },
        qualityScore: result.chunk_quality_score || 0,
        relevanceScore: this.calculateRelevanceScore(result, medicalEntities),
        citations: this.generateCitations(result)
      }));

      // Calculate quality insights

      // Generate follow-up recommendations
      const recommendedFollowUps = await this.generateFollowUpRecommendations(
        query,
        results,
        medicalEntities
      );

      return {
        results,
        totalCount: results.length,
        searchMetadata: {
          queryProcessingTime: totalTime,
          embeddingTime,
          searchTime,
          filters,
          medicalEntitiesDetected: medicalEntities
        },
        recommendedFollowUps,
        qualityInsights
      };

    } catch (error) {
      // console.error('Medical RAG service error:', error);
      throw error;
    }
  }

  /**
   * PRISM-specific search for specialized healthcare domains
   */
  async searchWithPRISMContext(
    query: string,
    prismSuite: 'RULES' | 'TRIALS' | 'GUARD' | 'VALUE' | 'BRIDGE' | 'PROOF' | 'CRAFT' | 'SCOUT',
    additionalFilters: Partial<MedicalSearchFilters> = { /* TODO: implement */ }
  ): Promise<MedicalRAGResponse> {
    const prismDomainMapping = {
      'RULES': 'regulatory_compliance',
      'TRIALS': 'clinical_research',
      'GUARD': 'regulatory_compliance',
      'VALUE': 'market_access',
      'BRIDGE': 'medical_affairs',
      'PROOF': 'medical_affairs',
      'CRAFT': 'medical_affairs',
      'SCOUT': 'commercial_strategy'
    };

    const enhancedFilters: MedicalSearchFilters = {
      ...additionalFilters,
      prismSuite,
      domain: domainMapping[prismSuite] as unknown
    };

    return this.searchMedicalKnowledge(query, enhancedFilters);
  }

  /**
   * Extract medical entities from text using pattern matching
   */
  private extractMedicalEntities(text: string): string[] {
    const entities: string[] = [];

    // Extract therapeutic areas
    this.medicalPatterns.therapeuticAreas.forEach(area => {
      if (lowerText.includes(area)) {
        entities.push(area);
      }
    });

    // Extract study types
    this.medicalPatterns.studyTypes.forEach(type => {
      if (lowerText.includes(type)) {
        entities.push(type);
      }
    });

    // Extract regulatory terms
    this.medicalPatterns.regulatoryTerms.forEach(term => {
      if (lowerText.includes(term)) {
        entities.push(term);
      }
    });

    return [...new Set(entities)]; // Remove duplicates
  }

  /**
   * Extract drug names using common pharmaceutical patterns
   */
  private extractDrugNames(text: string): string[] {
    const drugPatterns = [
      /\b[A-Z][a-z]+mab\b/g, // Monoclonal antibodies
      /\b[A-Z][a-z]+nib\b/g, // Kinase inhibitors
      /\b[A-Z][a-z]+stat\b/g, // HMG-CoA reductase inhibitors
      /\b[A-Z][a-z]+pril\b/g, // ACE inhibitors
      /\b[A-Z][a-z]+sartan\b/g, // ARBs
    ];

    const drugs: string[] = [];
    drugPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        drugs.push(...matches);
      }
    });

    return [...new Set(drugs)];
  }

  /**
   * Extract medical indications from text
   */
  private extractIndications(text: string): string[] {
    const indicationPatterns = [
      /\b(?:treatment|therapy|indication|indicated|prescribed) (?:for|of) ([^.]+)/gi,
      /\b(?:patients with|diagnosis of|suffering from) ([^.]+)/gi
    ];

    const indications: string[] = [];
    indicationPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          indications.push(match[1].trim());
        }
      }
    });

    return [...new Set(indications)];
  }

  /**
   * Extract study types from content
   */
  private extractStudyTypes(text: string): string[] {
    const types: string[] = [];

    this.medicalPatterns.studyTypes.forEach(type => {
      if (lowerText.includes(type)) {
        types.push(type);
      }
    });

    return [...new Set(types)];
  }

  /**
   * Extract regulatory mentions from text
   */
  private extractRegulatoryMentions(text: string): string[] {
    const mentions: string[] = [];

    this.medicalPatterns.regulatoryTerms.forEach(term => {
      if (lowerText.includes(term)) {
        mentions.push(term);
      }
    });

    return [...new Set(mentions)];
  }

  /**
   * Calculate relevance score based on medical context
   */
  private calculateRelevanceScore(result: unknown, queryEntities: string[]): number {

    // Boost score for matching medical entities

    queryEntities.forEach(entity => {
      if (resultText.includes(entity.toLowerCase())) {
        score += 0.1;
      }
    });

    // Boost for high evidence levels
    const evidenceBoosts: Record<string, number> = {
      'systematic review': 0.2,
      'meta-analysis': 0.2,
      'rct': 0.15,
      'randomized controlled trial': 0.15,
      'cohort': 0.1,
      'case-control': 0.05
    };

    for (const [level, boost] of Object.entries(evidenceBoosts)) {
      if (evidenceLevel.includes(level)) {
        score += boost;
        break;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate citations for results
   */
  private generateCitations(result: unknown): string[] {
    const citations: string[] = [];

    if (result.source_title) {

      if (result.source_authors && result.source_authors.length > 0) {

        citation = `${authors}. ${citation}`;
      }

      if (result.journal) {
        citation += `. ${result.journal}`;
      }

      if (result.publication_date) {
        citation += `. ${result.publication_date}`;
      }

      if (result.doi) {
        citation += `. DOI: ${result.doi}`;
      }

      citations.push(citation);
    }

    return citations;
  }

  /**
   * Calculate quality insights from results
   */
  private calculateQualityInsights(results: MedicalRAGResult[]): {
    averageQualityScore: number;
    evidenceLevelDistribution: Record<string, number>;
    sourceTypeDistribution: Record<string, number>;
  } {
    const qualityScores = results.map(r => r.qualityScore || 0.5);
    const averageQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : 0;

    const evidenceLevelDistribution: Record<string, number> = { /* TODO: implement */ };
    const sourceTypeDistribution: Record<string, number> = { /* TODO: implement */ };

    results.forEach(result => {

      evidenceLevelDistribution[evidenceLevel] = (evidenceLevelDistribution[evidenceLevel] || 0) + 1;

      sourceTypeDistribution[sourceType] = (sourceTypeDistribution[sourceType] || 0) + 1;
    });

    return {
      averageQualityScore,
      evidenceLevelDistribution,
      sourceTypeDistribution
    };
  }

  /**
   * Generate follow-up recommendations
   */
  private generateFollowUpRecommendations(
    query: string,
    results: MedicalRAGResult[],
    medicalEntities: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommend related therapeutic areas

    results.forEach(result => {
      result.medicalContext.therapeuticAreas.forEach(area => therapeuticAreas.add(area));
    });

    if (therapeuticAreas.size > 1) {
      recommendations.push(`Explore related therapeutic areas: ${Array.from(therapeuticAreas).slice(0, 3).join(', ')}`);
    }

    // Recommend evidence gaps

    if (!evidenceLevels.includes('systematic review') && !evidenceLevels.includes('meta-analysis')) {
      recommendations.push('Consider searching for systematic reviews or meta-analyses for higher-level evidence');
    }

    // Recommend regulatory perspectives

    if (!hasRegulatory) {
      recommendations.push('Search for regulatory guidance or approval information');
    }

    return recommendations;
  }

  /**
   * Get medical context suggestions for query enhancement
   */
  async getMedicalContextSuggestions(partialQuery: string): Promise<{
    therapeuticAreas: string[];
    studyTypes: string[];
    regulatoryTerms: string[];
  }> {

    return {
      therapeuticAreas: this.medicalPatterns.therapeuticAreas
        .filter(area => area.includes(lowerQuery) || lowerQuery.includes(area))
        .slice(0, 5),
      studyTypes: this.medicalPatterns.studyTypes
        .filter(type => type.includes(lowerQuery) || lowerQuery.includes(type))
        .slice(0, 5),
      regulatoryTerms: this.medicalPatterns.regulatoryTerms
        .filter(term => term.includes(lowerQuery) || lowerQuery.includes(term))
        .slice(0, 5)
    };
  }
}

// Export singleton instance
export const __medicalRAGService = new MedicalRAGService();

// Export the service instance with the expected name
export const medicalRAGService = __medicalRAGService;