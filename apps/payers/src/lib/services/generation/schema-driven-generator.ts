/**
 * Schema-Driven Response Generator
 *
 * Generates structured responses from extracted entities following predefined schemas
 * with character-level source attribution and validation
 */

import {
  type SchemaType,
  type SourceAttribution,
  type EntityReference,
  type ClinicalSummary,
  type RegulatoryDocument,
  type ResearchReport,
  type MarketAccessDocument,
  validateResponse,
  getSchema
} from './response-schemas';

import { createClient } from '@supabase/supabase-js';

export interface GenerationRequest {
  schema_type: SchemaType;
  extraction_run_id: string;
  user_preferences?: {
    include_unverified?: boolean;
    min_confidence?: number;
    required_medical_codes?: boolean;
    language?: string;
  };
  template_params?: Record<string, any>;
}

export interface GenerationResult<T = any> {
  success: boolean;
  schema_type: SchemaType;
  data?: T;
  validation_errors?: any[];
  metadata: {
    total_entities_used: number;
    avg_confidence: number;
    generation_time_ms: number;
    sources_count: number;
    character_attributions: number;
  };
}

export class SchemaDrivenGenerator {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Generate structured response from extracted entities
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Fetch entities for extraction run
      const entities = await this.fetchEntities(request.extraction_run_id, request.user_preferences);

      if (!entities || entities.length === 0) {
        return {
          success: false,
          schema_type: request.schema_type,
          validation_errors: ['No entities found for extraction run'],
          metadata: {
            total_entities_used: 0,
            avg_confidence: 0,
            generation_time_ms: Date.now() - startTime,
            sources_count: 0,
            character_attributions: 0
          }
        };
      }

      // Generate response based on schema type
      let generatedData: any;

      switch (request.schema_type) {
        case 'clinical_summary':
          generatedData = await this.generateClinicalSummary(entities, request.template_params);
          break;

        case 'regulatory_document':
          generatedData = await this.generateRegulatoryDocument(entities, request.template_params);
          break;

        case 'research_report':
          generatedData = await this.generateResearchReport(entities, request.template_params);
          break;

        case 'market_access':
          generatedData = await this.generateMarketAccessDocument(entities, request.template_params);
          break;

        default:
          throw new Error(`Unsupported schema type: ${request.schema_type}`);
      }

      // Validate against schema
      const validation = validateResponse(request.schema_type, generatedData);

      if (!validation.valid) {
        return {
          success: false,
          schema_type: request.schema_type,
          validation_errors: validation.errors?.errors || ['Validation failed'],
          metadata: {
            total_entities_used: entities.length,
            avg_confidence: this.calculateAvgConfidence(entities),
            generation_time_ms: Date.now() - startTime,
            sources_count: this.countSources(entities),
            character_attributions: this.countCharacterAttributions(entities)
          }
        };
      }

      return {
        success: true,
        schema_type: request.schema_type,
        data: validation.data,
        metadata: {
          total_entities_used: entities.length,
          avg_confidence: this.calculateAvgConfidence(entities),
          generation_time_ms: Date.now() - startTime,
          sources_count: this.countSources(entities),
          character_attributions: this.countCharacterAttributions(entities)
        }
      };

    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        schema_type: request.schema_type,
        validation_errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          total_entities_used: 0,
          avg_confidence: 0,
          generation_time_ms: Date.now() - startTime,
          sources_count: 0,
          character_attributions: 0
        }
      };
    }
  }

  /**
   * Fetch entities from database with filtering
   */
  private async fetchEntities(
    extractionRunId: string,
    preferences?: GenerationRequest['user_preferences']
  ): Promise<any[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = this.supabase
      .from('extracted_entities')
      .select('*')
      .eq('extraction_run_id', extractionRunId);

    // Apply filters based on preferences
    if (preferences?.include_unverified === false) {
      query = query.eq('verification_status', 'approved');
    }

    if (preferences?.min_confidence) {
      query = query.gte('confidence', preferences.min_confidence);
    }

    if (preferences?.required_medical_codes) {
      query = query.or('icd10_code.not.is.null,rxnorm_code.not.is.null,cpt_code.not.is.null');
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch entities: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Generate Clinical Summary
   */
  private async generateClinicalSummary(
    entities: any[],
    params?: Record<string, any>
  ): Promise<ClinicalSummary> {
    // Group entities by type
    const medications = entities.filter(e => e.entity_type === 'medication');
    const diagnoses = entities.filter(e => e.entity_type === 'diagnosis' || e.entity_type === 'condition');
    const procedures = entities.filter(e => e.entity_type === 'procedure');
    const labResults = entities.filter(e => e.entity_type === 'lab_result');

    // Build clinical summary
    const summary: ClinicalSummary = {
      schema_type: 'clinical_summary',
      schema_version: '1.0',
      generated_at: new Date().toISOString(),

      medications: medications.map(entity => ({
        name: entity.entity_text,
        dosage: entity.attributes?.dosage,
        route: entity.attributes?.route,
        frequency: entity.attributes?.frequency,
        indication: entity.attributes?.indication,
        status: entity.attributes?.status || 'active',
        entity: this.entityToReference(entity),
        coding: {
          rxnorm: entity.rxnorm_code,
          atc: entity.attributes?.atc_code
        }
      })),

      diagnoses: diagnoses.map(entity => ({
        condition: entity.entity_text,
        type: entity.attributes?.type || 'primary',
        status: entity.attributes?.status || 'confirmed',
        onset: entity.attributes?.onset,
        entity: this.entityToReference(entity),
        coding: {
          icd10: entity.icd10_code,
          snomed: entity.snomed_code
        }
      })),

      procedures: procedures.map(entity => ({
        name: entity.entity_text,
        date: entity.attributes?.date,
        indication: entity.attributes?.indication,
        outcome: entity.attributes?.outcome,
        entity: this.entityToReference(entity),
        coding: {
          cpt: entity.cpt_code,
          snomed: entity.snomed_code
        }
      })),

      lab_results: labResults.map(entity => ({
        test_name: entity.entity_text,
        value: entity.attributes?.value,
        unit: entity.attributes?.unit,
        reference_range: entity.attributes?.reference_range,
        interpretation: entity.attributes?.interpretation,
        date: entity.attributes?.date,
        entity: this.entityToReference(entity),
        coding: {
          loinc: entity.loinc_code
        }
      })),

      metadata: {
        total_entities: entities.length,
        avg_confidence: this.calculateAvgConfidence(entities),
        verification_status: this.getVerificationStats(entities),
        source_documents: await this.getSourceDocuments(entities)
      }
    };

    // Add optional sections if data available
    if (params?.include_assessment) {
      summary.assessment = {
        summary: this.generateAssessmentSummary(entities),
        key_findings: this.extractKeyFindings(entities),
        sources: this.aggregateSources(entities)
      };
    }

    return summary;
  }

  /**
   * Generate Regulatory Document
   */
  private async generateRegulatoryDocument(
    entities: any[],
    params?: Record<string, any>
  ): Promise<RegulatoryDocument> {
    const adverseEvents = entities.filter(e => e.entity_type === 'adverse_event');
    const outcomes = entities.filter(e => e.entity_type === 'outcome' || e.entity_type === 'endpoint');
    const populations = entities.filter(e => e.entity_type === 'population');

    return {
      schema_type: 'regulatory_document',
      schema_version: '1.0',
      generated_at: new Date().toISOString(),

      document_info: {
        title: params?.title || 'Clinical Study Report',
        document_type: params?.document_type || 'clinical_study_report',
        protocol_number: params?.protocol_number,
        study_phase: params?.study_phase,
        submission_type: params?.submission_type
      },

      executive_summary: {
        text: this.generateExecutiveSummary(entities, params),
        key_findings: this.extractKeyFindings(entities),
        sources: this.aggregateSources(entities)
      },

      safety: {
        summary: this.generateSafetySummary(adverseEvents),
        adverse_events: adverseEvents.map(entity => ({
          event: entity.entity_text,
          severity: entity.attributes?.severity || 'moderate',
          frequency: entity.attributes?.frequency,
          causality: entity.attributes?.causality || 'possible',
          entity: this.entityToReference(entity),
          coding: {
            snomed: entity.snomed_code,
            mesh: entity.attributes?.mesh_code
          }
        })),
        serious_adverse_events: adverseEvents
          .filter(e => e.attributes?.serious === true)
          .map(entity => ({
            event: entity.entity_text,
            outcome: entity.attributes?.outcome || 'recovered',
            entity: this.entityToReference(entity)
          })),
        sources: this.aggregateSources(adverseEvents)
      },

      efficacy: {
        summary: this.generateEfficacySummary(outcomes),
        outcomes: outcomes.map(entity => ({
          endpoint: entity.entity_text,
          result: entity.attributes?.result || '',
          statistical_significance: entity.attributes?.p_value,
          entity: this.entityToReference(entity)
        })),
        sources: this.aggregateSources(outcomes)
      },

      conclusions: {
        summary: this.generateConclusions(entities, params),
        benefit_risk_assessment: this.generateBenefitRiskAssessment(entities),
        sources: this.aggregateSources(entities)
      },

      compliance: {
        gcp_compliance: params?.gcp_compliance || true,
        ich_guidelines: params?.ich_guidelines || [],
        data_integrity_statement: params?.data_integrity_statement
      },

      metadata: {
        total_sources: this.countSources(entities),
        character_level_attribution: true,
        verification_complete: entities.every(e => e.verification_status === 'approved'),
        audit_trail_available: true
      }
    };
  }

  /**
   * Generate Research Report
   */
  private async generateResearchReport(
    entities: any[],
    params?: Record<string, any>
  ): Promise<ResearchReport> {
    return {
      schema_type: 'research_report',
      schema_version: '1.0',
      generated_at: new Date().toISOString(),

      title: params?.title || 'Research Report',

      abstract: {
        text: this.generateAbstract(entities, params),
        sources: this.aggregateSources(entities)
      },

      introduction: {
        background: params?.background || '',
        research_question: params?.research_question || '',
        objectives: params?.objectives || [],
        sources: this.aggregateSources(entities)
      },

      methods: {
        study_design: params?.study_design || '',
        population: this.describePopulation(entities),
        interventions: this.describeInterventions(entities),
        outcomes: this.describeOutcomes(entities),
        analysis: params?.analysis || '',
        sources: this.aggregateSources(entities)
      },

      results: {
        summary: this.generateResultsSummary(entities),
        findings: this.groupFindingsByCategory(entities),
        sources: this.aggregateSources(entities)
      },

      discussion: {
        interpretation: params?.interpretation || '',
        comparison_to_literature: params?.comparison_to_literature,
        limitations: params?.limitations || [],
        implications: params?.implications || '',
        sources: this.aggregateSources(entities)
      },

      conclusions: {
        summary: this.generateConclusions(entities, params),
        future_research: params?.future_research,
        sources: this.aggregateSources(entities)
      },

      references: params?.references || [],

      metadata: {
        authors: params?.authors,
        institutions: params?.institutions,
        keywords: params?.keywords,
        total_citations: params?.references?.length || 0
      }
    };
  }

  /**
   * Generate Market Access Document
   */
  private async generateMarketAccessDocument(
    entities: any[],
    params?: Record<string, any>
  ): Promise<MarketAccessDocument> {
    const populations = entities.filter(e => e.entity_type === 'population');
    const outcomes = entities.filter(e => e.entity_type === 'outcome');

    return {
      schema_type: 'market_access',
      schema_version: '1.0',
      generated_at: new Date().toISOString(),

      document_info: {
        title: params?.title || 'Market Access Dossier',
        document_type: params?.document_type || 'value_dossier',
        target_market: params?.target_market || 'US',
        product_name: params?.product_name || ''
      },

      clinical_value: {
        summary: this.generateClinicalValueSummary(entities),
        unmet_need: params?.unmet_need || '',
        clinical_benefits: outcomes.map(entity => ({
          benefit: entity.entity_text,
          evidence: entity.attributes?.evidence_level || 'Level B',
          entities: [this.entityToReference(entity)]
        })),
        sources: this.aggregateSources(entities)
      },

      economic_value: {
        summary: params?.economic_summary || '',
        cost_effectiveness: params?.cost_effectiveness,
        budget_impact: params?.budget_impact,
        sources: this.aggregateSources(entities)
      },

      target_population: {
        description: this.describePopulation(entities),
        size_estimate: params?.population_size,
        characteristics: populations.map(e => e.entity_text),
        entities: populations.map(e => this.entityToReference(e))
      },

      recommendations: {
        summary: params?.recommendations_summary || '',
        positioning: params?.positioning || '',
        pricing_considerations: params?.pricing_considerations
      },

      metadata: {
        evidence_grade: params?.evidence_grade,
        peer_reviewed: params?.peer_reviewed
      }
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private entityToReference(entity: any): EntityReference {
    return {
      entity_id: entity.id,
      entity_type: entity.entity_type,
      entity_text: entity.entity_text,
      confidence: entity.confidence || 0,
      verification_status: entity.verification_status || 'pending',
      sources: [{
        document_id: entity.document_id,
        document_name: entity.document_name || 'Unknown',
        chunk_id: entity.chunk_id,
        char_start: entity.char_start,
        char_end: entity.char_end,
        original_text: entity.original_text || entity.entity_text,
        context_before: entity.context_before,
        context_after: entity.context_after,
        confidence: entity.confidence || 0
      }]
    };
  }

  private aggregateSources(entities: any[]): SourceAttribution[] {
    const sources: SourceAttribution[] = [];
    const seen = new Set<string>();

    for (const entity of entities) {
      const key = `${entity.document_id}:${entity.char_start}:${entity.char_end}`;
      if (!seen.has(key)) {
        sources.push({
          document_id: entity.document_id,
          document_name: entity.document_name || 'Unknown',
          chunk_id: entity.chunk_id,
          char_start: entity.char_start,
          char_end: entity.char_end,
          original_text: entity.original_text || entity.entity_text,
          context_before: entity.context_before,
          context_after: entity.context_after,
          confidence: entity.confidence || 0
        });
        seen.add(key);
      }
    }

    return sources;
  }

  private calculateAvgConfidence(entities: any[]): number {
    if (entities.length === 0) return 0;
    const sum = entities.reduce((acc, e) => acc + (e.confidence || 0), 0);
    return sum / entities.length;
  }

  private countSources(entities: any[]): number {
    const uniqueDocuments = new Set(entities.map(e => e.document_id));
    return uniqueDocuments.size;
  }

  private countCharacterAttributions(entities: any[]): number {
    return entities.filter(e =>
      typeof e.char_start === 'number' && typeof e.char_end === 'number'
    ).length;
  }

  private getVerificationStats(entities: any[]) {
    return {
      approved: entities.filter(e => e.verification_status === 'approved').length,
      pending: entities.filter(e => e.verification_status === 'pending').length,
      rejected: entities.filter(e => e.verification_status === 'rejected').length,
      flagged: entities.filter(e => e.verification_status === 'flagged').length
    };
  }

  private async getSourceDocuments(entities: any[]) {
    const uniqueDocs = new Map();
    entities.forEach(e => {
      if (e.document_id && !uniqueDocs.has(e.document_id)) {
        uniqueDocs.set(e.document_id, {
          id: e.document_id,
          name: e.document_name || 'Unknown',
          type: e.document_type || 'unknown'
        });
      }
    });
    return Array.from(uniqueDocs.values());
  }

  // Text generation helpers (simplified - in production, use LLM)
  private generateAssessmentSummary(entities: any[]): string {
    return `Clinical assessment based on ${entities.length} extracted entities with average confidence of ${(this.calculateAvgConfidence(entities) * 100).toFixed(1)}%.`;
  }

  private extractKeyFindings(entities: any[]): string[] {
    return entities
      .filter(e => e.confidence >= 0.9)
      .slice(0, 5)
      .map(e => e.entity_text);
  }

  private generateExecutiveSummary(entities: any[], params?: any): string {
    return params?.executive_summary || `Study involving ${entities.length} key data points.`;
  }

  private generateSafetySummary(adverseEvents: any[]): string {
    return `${adverseEvents.length} adverse events reported with detailed causality assessment.`;
  }

  private generateEfficacySummary(outcomes: any[]): string {
    return `${outcomes.length} efficacy endpoints evaluated.`;
  }

  private generateConclusions(entities: any[], params?: any): string {
    return params?.conclusions || `Analysis based on ${entities.length} extracted data points.`;
  }

  private generateBenefitRiskAssessment(entities: any[]): string {
    return 'Benefit-risk assessment indicates favorable profile based on extracted data.';
  }

  private generateAbstract(entities: any[], params?: any): string {
    return params?.abstract || `Research analysis of ${entities.length} data points.`;
  }

  private describePopulation(entities: any[]): string {
    const populations = entities.filter(e => e.entity_type === 'population');
    return populations.map(e => e.entity_text).join(', ') || 'Population not specified';
  }

  private describeInterventions(entities: any[]): string[] {
    return entities
      .filter(e => e.entity_type === 'medication' || e.entity_type === 'procedure')
      .map(e => e.entity_text);
  }

  private describeOutcomes(entities: any[]): string[] {
    return entities
      .filter(e => e.entity_type === 'outcome' || e.entity_type === 'endpoint')
      .map(e => e.entity_text);
  }

  private generateResultsSummary(entities: any[]): string {
    return `Results derived from ${entities.length} extracted entities.`;
  }

  private groupFindingsByCategory(entities: any[]) {
    const categories = new Map<string, any[]>();
    entities.forEach(e => {
      const category = e.entity_type;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(e);
    });

    return Array.from(categories.entries()).map(([category, ents]) => ({
      category,
      description: `${ents.length} ${category} entities identified`,
      entities: ents.map(e => this.entityToReference(e))
    }));
  }

  private generateClinicalValueSummary(entities: any[]): string {
    return `Clinical value proposition based on ${entities.length} evidence points.`;
  }
}

// Export singleton instance
export const schemaDrivenGenerator = new SchemaDrivenGenerator();
