/**
 * LangExtract Structured Extraction Pipeline
 * Implements Google's LangExtract for regulatory-grade entity extraction
 * with precise source grounding and clinical coding
 */

import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractionEntity {
  id: string;
  type: EntityType;
  text: string;
  attributes: Record<string, any>;
  confidence: number;
  source: {
    document_id: string;
    char_start: number;
    char_end: number;
    context_before: string;
    context_after: string;
    original_text: string;
  };
  verification_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  extracted_at: string;
}

export type EntityType =
  | 'medication'
  | 'diagnosis'
  | 'procedure'
  | 'protocol_step'
  | 'patient_population'
  | 'monitoring_requirement'
  | 'adverse_event'
  | 'contraindication'
  | 'regulatory_requirement'
  | 'validation_criteria';

export interface StructuredExtraction {
  entities: ExtractionEntity[];
  relationships?: EntityRelationship[];
  metadata: {
    extraction_timestamp: string;
    documents_processed: number;
    entities_extracted: number;
    confidence_stats: ConfidenceStats;
  };
  visualization_url?: string;
  audit_trail: AuditTrail;
}

export interface EntityRelationship {
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  confidence: number;
}

export interface ConfidenceStats {
  mean: number;
  median: number;
  std_dev: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
}

export interface AuditTrail {
  extraction_id: string;
  model_used: string;
  prompt_version: string;
  extraction_duration_ms: number;
  source_documents: string[];
  created_at: string;
  created_by: string;
}

export interface ExtractionSchema {
  prompt: string;
  requiresHighRecall: boolean;
  preferredModel?: string;
  examples: ExtractionExample[];
}

export interface ExtractionExample {
  text: string;
  extractions: {
    extraction_class: string;
    extraction_text: string;
    attributes: Record<string, any>;
    span: [number, number];
  }[];
}

export class LangExtractPipeline {
  private genAI: GoogleGenerativeAI;
  private cache: Map<string, StructuredExtraction>;
  private extractionSchemas: Map<string, ExtractionSchema>;

  constructor(config: { apiKey: string }) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.cache = new Map();
    this.extractionSchemas = this.initializeExtractionSchemas();
  }

  /**
   * Extract structured entities from retrieved documents
   * This is called AFTER RAG retrieval but BEFORE generation
   */
  async extract(
    documents: Document[],
    extractionType: string,
    options: { skipCache?: boolean } = {}
  ): Promise<StructuredExtraction> {
    const startTime = Date.now();

    // Check cache
    const cacheKey = this.generateCacheKey(documents, extractionType);
    if (!options.skipCache && this.cache.has(cacheKey)) {
      console.log('📦 Returning cached extraction');
      return this.cache.get(cacheKey)!;
    }

    console.log(`🔄 Extracting ${extractionType} entities from ${documents.length} documents...`);

    // Get extraction schema
    const schema = this.getExtractionSchema(extractionType);

    // Parallel extraction across documents
    const documentExtractions = await Promise.all(
      documents.map(doc => this.extractFromDocument(doc, schema))
    );

    // Aggregate and deduplicate entities
    const allEntities = documentExtractions.flatMap(de => de.entities);
    const deduplicatedEntities = this.deduplicateEntities(allEntities);

    // Extract relationships between entities
    const relationships = this.extractRelationships(deduplicatedEntities);

    // Calculate confidence statistics
    const confidenceStats = this.calculateConfidenceStats(deduplicatedEntities);

    const extraction: StructuredExtraction = {
      entities: deduplicatedEntities,
      relationships,
      metadata: {
        extraction_timestamp: new Date().toISOString(),
        documents_processed: documents.length,
        entities_extracted: deduplicatedEntities.length,
        confidence_stats: confidenceStats,
      },
      audit_trail: {
        extraction_id: this.generateExtractionId(),
        model_used: schema.preferredModel || 'gemini-2.5-flash',
        prompt_version: '1.0',
        extraction_duration_ms: Date.now() - startTime,
        source_documents: documents.map(d => d.metadata.id || 'unknown'),
        created_at: new Date().toISOString(),
        created_by: 'langextract-pipeline',
      },
    };

    // Cache the result
    this.cache.set(cacheKey, extraction);

    console.log(`✅ Extracted ${deduplicatedEntities.length} entities in ${Date.now() - startTime}ms`);

    return extraction;
  }

  /**
   * Extract entities from a single document using Gemini
   */
  private async extractFromDocument(
    doc: Document,
    schema: ExtractionSchema
  ): Promise<{ entities: ExtractionEntity[] }> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: schema.preferredModel || 'gemini-2.0-flash-exp'
      });

      // Build prompt with examples
      const prompt = this.buildExtractionPrompt(doc.pageContent, schema);

      // Call Gemini for extraction
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse the structured response
      const entities = this.parseExtractionResponse(response, doc);

      return { entities };

    } catch (error) {
      console.error(`❌ Extraction failed for document:`, error);
      return { entities: [] };
    }
  }

  /**
   * Build extraction prompt with few-shot examples
   */
  private buildExtractionPrompt(text: string, schema: ExtractionSchema): string {
    const examplesText = schema.examples
      .map(ex => {
        const extractionsJSON = JSON.stringify(ex.extractions, null, 2);
        return `Example Text:\n${ex.text}\n\nExpected Extractions:\n${extractionsJSON}`;
      })
      .join('\n\n---\n\n');

    return `
${schema.prompt}

Here are examples of the expected extraction format:

${examplesText}

Now extract entities from the following text. Return ONLY a JSON array of extractions following the same format as the examples.

Text to analyze:
${text}

Extraction JSON (array of objects):
`;
  }

  /**
   * Parse Gemini's response into structured entities
   */
  private parseExtractionResponse(
    response: string,
    doc: Document
  ): ExtractionEntity[] {
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                        response.match(/\[([\s\S]*?)\]/);

      if (!jsonMatch) {
        console.warn('No JSON found in extraction response');
        return [];
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const extractions = JSON.parse(jsonText);

      // Convert to our entity format
      return extractions.map((ext: any, index: number) => ({
        id: this.generateEntityId(),
        type: ext.extraction_class as EntityType,
        text: ext.extraction_text,
        attributes: ext.attributes || {},
        confidence: ext.confidence || 0.85,
        source: {
          document_id: doc.metadata.id || 'unknown',
          char_start: ext.span ? ext.span[0] : 0,
          char_end: ext.span ? ext.span[1] : ext.extraction_text.length,
          context_before: '',
          context_after: '',
          original_text: ext.extraction_text,
        },
        verification_status: 'pending',
        extracted_at: new Date().toISOString(),
      }));

    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      return [];
    }
  }

  /**
   * Initialize extraction schemas for different use cases
   */
  private initializeExtractionSchemas(): Map<string, ExtractionSchema> {
    const schemas = new Map<string, ExtractionSchema>();

    // Clinical Protocol Schema (for Ask Expert)
    schemas.set('clinical_protocol', {
      prompt: `Extract clinical protocol components with exact source locations:

1. MEDICATIONS:
   - Drug name (generic or brand)
   - Dosage (amount + unit)
   - Route of administration
   - Frequency/timing
   - Duration
   - Contraindications

2. PROCEDURES:
   - Procedure name
   - Timing/sequence
   - Prerequisites
   - Expected outcomes
   - Complications to monitor

3. DIAGNOSTIC_CRITERIA:
   - Condition/diagnosis
   - ICD-10 code (if present)
   - Diagnostic criteria
   - Differential diagnoses

4. PATIENT_POPULATIONS:
   - Inclusion criteria
   - Exclusion criteria
   - Age ranges
   - Comorbidities

5. MONITORING_REQUIREMENTS:
   - Parameters to monitor
   - Frequency
   - Normal ranges
   - Action thresholds

Extract ONLY information explicitly stated in the text.
Preserve exact medical terminology.
Do NOT infer or add information not present.`,
      requiresHighRecall: true,
      preferredModel: 'gemini-2.0-flash-exp',
      examples: this.getClinicalProtocolExamples(),
    });

    // Regulatory Requirements Schema
    schemas.set('regulatory_requirements', {
      prompt: `Extract regulatory and compliance information:

1. REGULATIONS:
   - Regulation name/number
   - Jurisdiction (FDA/EMA/etc)
   - Specific requirement
   - Compliance deadline

2. APPROVAL_CRITERIA:
   - Criterion description
   - Evidence required
   - Documentation needed

3. ADVERSE_EVENT_REPORTING:
   - Event type
   - Severity classification
   - Reporting timeline
   - Documentation requirements`,
      requiresHighRecall: true,
      examples: this.getRegulatoryExamples(),
    });

    return schemas;
  }

  /**
   * Get few-shot examples for clinical protocols
   */
  private getClinicalProtocolExamples(): ExtractionExample[] {
    return [
      {
        text: 'Administer aspirin 325mg orally once daily in the morning for cardiovascular protection. Contraindicated in patients with active bleeding or aspirin allergy. Monitor for signs of gastrointestinal bleeding.',
        extractions: [
          {
            extraction_class: 'medication',
            extraction_text: 'aspirin',
            attributes: {
              dosage: '325mg',
              route: 'oral',
              frequency: 'once daily',
              timing: 'morning',
              indication: 'cardiovascular protection',
              contraindications: 'active bleeding, aspirin allergy',
            },
            span: [11, 18],
          },
          {
            extraction_class: 'monitoring_requirement',
            extraction_text: 'signs of gastrointestinal bleeding',
            attributes: {
              parameter: 'gastrointestinal bleeding',
              frequency: 'ongoing',
            },
            span: [162, 197],
          },
        ],
      },
      {
        text: 'Patients with Type 2 diabetes mellitus (ICD-10: E11.9) and HbA1c > 9% should initiate insulin therapy. Exclude patients with severe renal impairment (eGFR < 30 mL/min/1.73m²).',
        extractions: [
          {
            extraction_class: 'diagnosis',
            extraction_text: 'Type 2 diabetes mellitus',
            attributes: {
              icd10_code: 'E11.9',
            },
            span: [14, 38],
          },
          {
            extraction_class: 'patient_population',
            extraction_text: 'HbA1c > 9%',
            attributes: {
              type: 'inclusion_criteria',
              parameter: 'HbA1c',
              threshold: '> 9%',
            },
            span: [63, 73],
          },
          {
            extraction_class: 'patient_population',
            extraction_text: 'severe renal impairment (eGFR < 30 mL/min/1.73m²)',
            attributes: {
              type: 'exclusion_criteria',
              condition: 'severe renal impairment',
              parameter: 'eGFR',
              threshold: '< 30 mL/min/1.73m²',
            },
            span: [131, 180],
          },
        ],
      },
    ];
  }

  /**
   * Get few-shot examples for regulatory requirements
   */
  private getRegulatoryExamples(): ExtractionExample[] {
    return [
      {
        text: 'FDA 21 CFR Part 11 requires electronic signatures with dual authentication. Compliance deadline: January 1, 2026.',
        extractions: [
          {
            extraction_class: 'regulatory_requirement',
            extraction_text: 'FDA 21 CFR Part 11',
            attributes: {
              regulation: 'FDA 21 CFR Part 11',
              jurisdiction: 'FDA',
              requirement: 'electronic signatures with dual authentication',
              deadline: 'January 1, 2026',
            },
            span: [0, 18],
          },
        ],
      },
    ];
  }

  /**
   * Get extraction schema by type
   */
  private getExtractionSchema(type: string): ExtractionSchema {
    return this.extractionSchemas.get(type) || this.extractionSchemas.get('clinical_protocol')!;
  }

  /**
   * Deduplicate entities based on text and source location
   */
  private deduplicateEntities(entities: ExtractionEntity[]): ExtractionEntity[] {
    const seen = new Map<string, ExtractionEntity>();

    for (const entity of entities) {
      const key = `${entity.type}:${entity.text.toLowerCase()}:${entity.source.document_id}`;

      if (!seen.has(key) || entity.confidence > (seen.get(key)?.confidence || 0)) {
        seen.set(key, entity);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Extract relationships between entities
   */
  private extractRelationships(entities: ExtractionEntity[]): EntityRelationship[] {
    const relationships: EntityRelationship[] = [];

    // Find medication-diagnosis relationships
    const medications = entities.filter(e => e.type === 'medication');
    const diagnoses = entities.filter(e => e.type === 'diagnosis');

    medications.forEach(med => {
      const indication = med.attributes.indication;
      if (indication) {
        const relatedDiagnosis = diagnoses.find(d =>
          indication.toLowerCase().includes(d.text.toLowerCase()) ||
          d.text.toLowerCase().includes(indication.toLowerCase())
        );

        if (relatedDiagnosis) {
          relationships.push({
            source_entity_id: med.id,
            target_entity_id: relatedDiagnosis.id,
            relationship_type: 'treats',
            confidence: 0.8,
          });
        }
      }
    });

    return relationships;
  }

  /**
   * Calculate confidence statistics
   */
  private calculateConfidenceStats(entities: ExtractionEntity[]): ConfidenceStats {
    if (entities.length === 0) {
      return {
        mean: 0,
        median: 0,
        std_dev: 0,
        high_confidence_count: 0,
        medium_confidence_count: 0,
        low_confidence_count: 0,
      };
    }

    const confidences = entities.map(e => e.confidence);
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    const sorted = [...confidences].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    const std_dev = Math.sqrt(variance);

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      std_dev: Math.round(std_dev * 100) / 100,
      high_confidence_count: confidences.filter(c => c >= 0.85).length,
      medium_confidence_count: confidences.filter(c => c >= 0.7 && c < 0.85).length,
      low_confidence_count: confidences.filter(c => c < 0.7).length,
    };
  }

  // Helper methods

  private generateCacheKey(documents: Document[], extractionType: string): string {
    const docIds = documents.map(d => d.metadata.id || '').join('-');
    return `${extractionType}:${docIds}`;
  }

  private generateEntityId(): string {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExtractionId(): string {
    return `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear extraction cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Extraction cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()).slice(0, 10),
    };
  }
}

// Singleton instance
let langExtractPipelineInstance: LangExtractPipeline | null = null;

export function getLangExtractPipeline(): LangExtractPipeline {
  if (!langExtractPipelineInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required');
    }
    langExtractPipelineInstance = new LangExtractPipeline({ apiKey });
  }
  return langExtractPipelineInstance;
}

export const langExtractPipeline = getLangExtractPipeline;
