/**
 * Extraction Quality Evaluation Framework
 * Evaluates the quality of LangExtract entity extractions
 * Provides precision, recall, F1, grounding accuracy, and clinical validity metrics
 */

import { Document } from '@langchain/core/documents';

export interface ExtractedEntity {
  id: string;
  type: string;
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
  verification_status?: string;
  extracted_at: string;
}

export interface StructuredExtraction {
  entities: ExtractedEntity[];
  relationships?: Array<{
    source_entity_id: string;
    target_entity_id: string;
    relationship_type: string;
  }>;
  metadata: {
    extraction_timestamp: string;
    documents_processed: number;
    entities_extracted: number;
    confidence_stats?: {
      avg: number;
      min: number;
      max: number;
      std_dev: number;
    };
  };
  visualization_url?: string;
  audit_trail?: any;
}

export interface GroundTruthEntity {
  type: string;
  text: string;
  attributes?: Record<string, any>;
  char_start: number;
  char_end: number;
  document_id: string;
}

export interface GroundTruth {
  entities: GroundTruthEntity[];
  documents: Array<{
    id: string;
    content: string;
  }>;
}

export interface ExtractionEvaluation {
  precision: number;
  recall: number;
  f1_score: number;
  grounding_accuracy: number;
  attribute_completeness: number;
  consistency_score: number;
  clinical_validity: number;
  regulatory_compliance: number;
  overall_score: number;

  by_entity_type: Record<string, {
    precision: number;
    recall: number;
    f1_score: number;
    count: number;
  }>;

  by_confidence_level: {
    high: { count: number; accuracy: number };
    medium: { count: number; accuracy: number };
    low: { count: number; accuracy: number };
  };

  false_positives: ExtractedEntity[];
  false_negatives: GroundTruthEntity[];
  misattributions: Array<{
    entity: ExtractedEntity;
    reason: string;
  }>;
}

export class ExtractionQualityEvaluator {
  /**
   * Evaluate extraction quality using multiple metrics
   * Extends RAGAs metrics with extraction-specific measures
   */
  async evaluate(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Promise<ExtractionEvaluation> {
    // Calculate core metrics
    const precision = await this.calculatePrecision(extraction, groundTruth);
    const recall = await this.calculateRecall(extraction, groundTruth);
    const f1_score = this.calculateF1(precision, recall);

    // Calculate additional metrics
    const grounding_accuracy = await this.evaluateGrounding(extraction, groundTruth);
    const attribute_completeness = this.evaluateAttributes(extraction, groundTruth);
    const consistency_score = await this.evaluateConsistency(extraction);
    const clinical_validity = await this.evaluateClinicalValidity(extraction);
    const regulatory_compliance = this.evaluateRegulatoryCompliance(extraction);

    // Breakdown by entity type
    const by_entity_type = this.breakdownByType(extraction, groundTruth);

    // Breakdown by confidence level
    const by_confidence_level = this.breakdownByConfidence(extraction);

    // Failure analysis
    const false_positives = this.identifyFalsePositives(extraction, groundTruth);
    const false_negatives = this.identifyFalseNegatives(extraction, groundTruth);
    const misattributions = this.identifyMisattributions(extraction, groundTruth);

    // Calculate overall score (weighted average)
    const overall_score = this.calculateOverallScore({
      precision,
      recall,
      f1_score,
      grounding_accuracy,
      attribute_completeness,
      consistency_score,
      clinical_validity,
      regulatory_compliance
    });

    return {
      precision,
      recall,
      f1_score,
      grounding_accuracy,
      attribute_completeness,
      consistency_score,
      clinical_validity,
      regulatory_compliance,
      overall_score,
      by_entity_type,
      by_confidence_level,
      false_positives,
      false_negatives,
      misattributions
    };
  }

  /**
   * Calculate precision: What % of extracted entities are correct?
   */
  private async calculatePrecision(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Promise<number> {
    if (extraction.entities.length === 0) return 0;

    let truePositives = 0;

    for (const extractedEntity of extraction.entities) {
      // Check if this entity matches any ground truth entity
      const matchesGroundTruth = groundTruth.entities.some(gtEntity =>
        this.entitiesMatch(extractedEntity, gtEntity)
      );

      if (matchesGroundTruth) {
        truePositives++;
      }
    }

    return truePositives / extraction.entities.length;
  }

  /**
   * Calculate recall: What % of true entities were extracted?
   */
  private async calculateRecall(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Promise<number> {
    if (groundTruth.entities.length === 0) return 1.0;

    let truePositives = 0;

    for (const gtEntity of groundTruth.entities) {
      // Check if this ground truth entity was extracted
      const wasExtracted = extraction.entities.some(extractedEntity =>
        this.entitiesMatch(extractedEntity, gtEntity)
      );

      if (wasExtracted) {
        truePositives++;
      }
    }

    return truePositives / groundTruth.entities.length;
  }

  /**
   * Calculate F1 Score: Harmonic mean of precision and recall
   */
  private calculateF1(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return (2 * precision * recall) / (precision + recall);
  }

  /**
   * Evaluate grounding accuracy: Are char offsets correct?
   */
  private async evaluateGrounding(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Promise<number> {
    if (extraction.entities.length === 0) return 0;

    let correctOffsets = 0;
    let totalEntities = 0;

    for (const entity of extraction.entities) {
      totalEntities++;

      const sourceDoc = groundTruth.documents.find(
        d => d.id === entity.source.document_id
      );

      if (!sourceDoc) continue;

      // Extract text at the specified offset
      const extractedText = sourceDoc.content.substring(
        entity.source.char_start,
        entity.source.char_end
      );

      // Normalize and compare
      const normalized = this.normalizeText(extractedText);
      const expected = this.normalizeText(entity.text);

      if (normalized === expected || normalized.includes(expected) || expected.includes(normalized)) {
        correctOffsets++;
      }
    }

    return totalEntities > 0 ? correctOffsets / totalEntities : 0;
  }

  /**
   * Evaluate attribute completeness: Are all attributes extracted?
   */
  private evaluateAttributes(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): number {
    let totalAttributes = 0;
    let correctAttributes = 0;

    for (const gtEntity of groundTruth.entities) {
      if (!gtEntity.attributes) continue;

      const extractedEntity = extraction.entities.find((e: any) =>
        this.entitiesMatch(e, gtEntity)
      );

      if (!extractedEntity) continue;

      // Compare attributes
      for (const [key, value] of Object.entries(gtEntity.attributes)) {
        totalAttributes++;

        if (extractedEntity.attributes && extractedEntity.attributes[key] === value) {
          correctAttributes++;
        }
      }
    }

    return totalAttributes > 0 ? correctAttributes / totalAttributes : 1.0;
  }

  /**
   * Evaluate consistency: Do multiple extractions produce same results?
   */
  private async evaluateConsistency(
    extraction: StructuredExtraction
  ): Promise<number> {
    // For now, use confidence variance as a proxy for consistency
    if (extraction.entities.length === 0) return 1.0;

    const confidences = extraction.entities.map((e: any) => e.confidence);
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Normalize to 0-1 scale (assuming stdDev typically 0-0.3)
    return Math.max(0, 1 - (stdDev / 0.3));
  }

  /**
   * Evaluate clinical validity: Are medical terms correctly extracted?
   */
  private async evaluateClinicalValidity(
    extraction: StructuredExtraction
  ): Promise<number> {
    // For now, use confidence as a proxy
    // In production, would validate against medical knowledge bases
    const medicalEntities = extraction.entities.filter((e: any) =>
      ['medication', 'diagnosis', 'procedure', 'condition'].includes(e.type)
    );

    if (medicalEntities.length === 0) return 1.0;

    const avgConfidence = medicalEntities.reduce((sum, e) => sum + e.confidence, 0) / medicalEntities.length;
    return avgConfidence;
  }

  /**
   * Evaluate regulatory compliance: Are all required fields present?
   */
  private evaluateRegulatoryCompliance(
    extraction: StructuredExtraction
  ): number {
    let totalRequiredFields = 0;
    let presentFields = 0;

    for (const entity of extraction.entities) {
      // Required fields for regulatory compliance
      totalRequiredFields += 5; // type, text, source, char_start, char_end

      if (entity.type) presentFields++;
      if (entity.text) presentFields++;
      if (entity.source) presentFields++;
      if (entity.source && typeof entity.source.char_start === 'number') presentFields++;
      if (entity.source && typeof entity.source.char_end === 'number') presentFields++;
    }

    return totalRequiredFields > 0 ? presentFields / totalRequiredFields : 1.0;
  }

  /**
   * Calculate overall score (weighted average)
   */
  private calculateOverallScore(metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    grounding_accuracy: number;
    attribute_completeness: number;
    consistency_score: number;
    clinical_validity: number;
    regulatory_compliance: number;
  }): number {
    const weights = {
      precision: 0.15,
      recall: 0.15,
      f1_score: 0.20,
      grounding_accuracy: 0.20,
      attribute_completeness: 0.10,
      consistency_score: 0.05,
      clinical_validity: 0.10,
      regulatory_compliance: 0.05
    };

    return Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (metrics[key as keyof typeof metrics] * weight);
    }, 0);
  }

  /**
   * Breakdown metrics by entity type
   */
  private breakdownByType(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Record<string, { precision: number; recall: number; f1_score: number; count: number }> {
    const types = new Set([
      ...extraction.entities.map((e: any) => e.type),
      ...groundTruth.entities.map((e: any) => e.type)
    ]);

    const breakdown: Record<string, any> = {};

    for (const type of types) {
      const extractedOfType = extraction.entities.filter((e: any) => e.type === type);
      const groundTruthOfType = groundTruth.entities.filter((e: any) => e.type === type);

      const truePositives = extractedOfType.filter((e: any) =>
        groundTruthOfType.some(gt => this.entitiesMatch(e, gt))
      ).length;

      const precision = extractedOfType.length > 0 ? truePositives / extractedOfType.length : 0;
      const recall = groundTruthOfType.length > 0 ? truePositives / groundTruthOfType.length : 0;
      const f1_score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      breakdown[type] = {
        precision,
        recall,
        f1_score,
        count: extractedOfType.length
      };
    }

    return breakdown;
  }

  /**
   * Breakdown metrics by confidence level
   */
  private breakdownByConfidence(
    extraction: StructuredExtraction
  ): {
    high: { count: number; accuracy: number };
    medium: { count: number; accuracy: number };
    low: { count: number; accuracy: number };
  } {
    const high = extraction.entities.filter((e: any) => e.confidence >= 0.8);
    const medium = extraction.entities.filter((e: any) => e.confidence >= 0.5 && e.confidence < 0.8);
    const low = extraction.entities.filter((e: any) => e.confidence < 0.5);

    return {
      high: {
        count: high.length,
        accuracy: high.reduce((sum, e) => sum + e.confidence, 0) / (high.length || 1)
      },
      medium: {
        count: medium.length,
        accuracy: medium.reduce((sum, e) => sum + e.confidence, 0) / (medium.length || 1)
      },
      low: {
        count: low.length,
        accuracy: low.reduce((sum, e) => sum + e.confidence, 0) / (low.length || 1)
      }
    };
  }

  /**
   * Identify false positives (extracted but not in ground truth)
   */
  private identifyFalsePositives(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): ExtractedEntity[] {
    return extraction.entities.filter(extractedEntity =>
      !groundTruth.entities.some(gtEntity =>
        this.entitiesMatch(extractedEntity, gtEntity)
      )
    );
  }

  /**
   * Identify false negatives (in ground truth but not extracted)
   */
  private identifyFalseNegatives(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): GroundTruthEntity[] {
    return groundTruth.entities.filter(gtEntity =>
      !extraction.entities.some(extractedEntity =>
        this.entitiesMatch(extractedEntity, gtEntity)
      )
    );
  }

  /**
   * Identify misattributions (wrong source location)
   */
  private identifyMisattributions(
    extraction: StructuredExtraction,
    groundTruth: GroundTruth
  ): Array<{ entity: ExtractedEntity; reason: string }> {
    const misattributions: Array<{ entity: ExtractedEntity; reason: string }> = [];

    for (const entity of extraction.entities) {
      const sourceDoc = groundTruth.documents.find(
        d => d.id === entity.source.document_id
      );

      if (!sourceDoc) {
        misattributions.push({
          entity,
          reason: 'Source document not found'
        });
        continue;
      }

      const extractedText = sourceDoc.content.substring(
        entity.source.char_start,
        entity.source.char_end
      );

      const normalized = this.normalizeText(extractedText);
      const expected = this.normalizeText(entity.text);

      if (!normalized.includes(expected) && !expected.includes(normalized)) {
        misattributions.push({
          entity,
          reason: `Char offsets don't match entity text. Expected: "${expected}", Found: "${normalized}"`
        });
      }
    }

    return misattributions;
  }

  /**
   * Check if two entities match
   */
  private entitiesMatch(
    extractedEntity: ExtractedEntity,
    groundTruthEntity: GroundTruthEntity
  ): boolean {
    // Type must match
    if (extractedEntity.type !== groundTruthEntity.type) return false;

    // Text must match (normalized)
    const extractedText = this.normalizeText(extractedEntity.text);
    const groundTruthText = this.normalizeText(groundTruthEntity.text);

    if (extractedText !== groundTruthText) {
      // Allow partial matches for longer entities
      if (extractedText.length > 10 && groundTruthText.length > 10) {
        return extractedText.includes(groundTruthText) || groundTruthText.includes(extractedText);
      }
      return false;
    }

    return true;
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }
}

// Export singleton instance
export const extractionQualityEvaluator = new ExtractionQualityEvaluator();
