/**
 * Extraction Quality Evaluator Tests
 * Comprehensive test suite for entity extraction quality metrics
 */

import { describe, it, expect } from '@jest/globals';
import {
  ExtractionQualityEvaluator,
  StructuredExtraction,
  GroundTruth,
  ExtractedEntity
} from '../extraction-quality-evaluator';

describe('ExtractionQualityEvaluator', () => {
  const evaluator = new ExtractionQualityEvaluator();

  describe('Perfect Extraction (100% Precision, 100% Recall)', () => {
    it('should score 1.0 for perfect extraction', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: { dosage: '325mg', route: 'oral' },
            confidence: 0.95,
            source: {
              document_id: 'doc1',
              char_start: 11,
              char_end: 18,
              context_before: 'Administer ',
              context_after: ' 325mg',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            attributes: { dosage: '325mg', route: 'oral' },
            char_start: 11,
            char_end: 18,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'Administer aspirin 325mg orally once daily.'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.precision).toBe(1.0);
      expect(result.recall).toBe(1.0);
      expect(result.f1_score).toBe(1.0);
      expect(result.grounding_accuracy).toBe(1.0);
      expect(result.overall_score).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('Precision and Recall', () => {
    it('should calculate precision correctly (false positives)', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 7,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'medication',
            text: 'fake drug', // False positive
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 20,
              char_end: 29,
              context_before: '',
              context_after: '',
              original_text: 'fake drug'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 2
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            char_start: 0,
            char_end: 7,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'aspirin is a medication'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.precision).toBe(0.5); // 1 correct out of 2 extracted
      expect(result.recall).toBe(1.0); // 1 out of 1 ground truth found
      expect(result.false_positives.length).toBe(1);
      expect(result.false_positives[0].text).toBe('fake drug');
    });

    it('should calculate recall correctly (false negatives)', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 7,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            char_start: 0,
            char_end: 7,
            document_id: 'doc1'
          },
          {
            type: 'medication',
            text: 'ibuprofen', // Missed entity (false negative)
            char_start: 20,
            char_end: 29,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'aspirin and ibuprofen'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.precision).toBe(1.0); // All extracted are correct
      expect(result.recall).toBe(0.5); // Only 1 out of 2 ground truth found
      expect(result.false_negatives.length).toBe(1);
      expect(result.false_negatives[0].text).toBe('ibuprofen');
    });
  });

  describe('Grounding Accuracy', () => {
    it('should detect incorrect char offsets', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 50, // Wrong offset
              char_end: 57,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            char_start: 11,
            char_end: 18,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'Administer aspirin 325mg orally.'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.grounding_accuracy).toBeLessThan(1.0);
      expect(result.misattributions.length).toBeGreaterThan(0);
    });

    it('should validate correct char offsets', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 11,
              char_end: 18,
              context_before: 'Administer ',
              context_after: ' 325mg',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            char_start: 11,
            char_end: 18,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'Administer aspirin 325mg orally.'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.grounding_accuracy).toBe(1.0);
      expect(result.misattributions.length).toBe(0);
    });
  });

  describe('Entity Type Breakdown', () => {
    it('should break down metrics by entity type', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 7,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'diagnosis',
            text: 'hypertension',
            attributes: {},
            confidence: 0.95,
            source: {
              document_id: 'doc1',
              char_start: 20,
              char_end: 32,
              context_before: '',
              context_after: '',
              original_text: 'hypertension'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 2
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            char_start: 0,
            char_end: 7,
            document_id: 'doc1'
          },
          {
            type: 'diagnosis',
            text: 'hypertension',
            char_start: 20,
            char_end: 32,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'aspirin for treating hypertension'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.by_entity_type['medication']).toBeDefined();
      expect(result.by_entity_type['diagnosis']).toBeDefined();
      expect(result.by_entity_type['medication'].precision).toBe(1.0);
      expect(result.by_entity_type['medication'].recall).toBe(1.0);
      expect(result.by_entity_type['diagnosis'].precision).toBe(1.0);
      expect(result.by_entity_type['diagnosis'].recall).toBe(1.0);
    });
  });

  describe('Confidence Level Breakdown', () => {
    it('should break down by confidence levels', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'high confidence',
            attributes: {},
            confidence: 0.95,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 15,
              context_before: '',
              context_after: '',
              original_text: 'high confidence'
            },
            extracted_at: new Date().toISOString()
          },
          {
            id: '2',
            type: 'medication',
            text: 'medium confidence',
            attributes: {},
            confidence: 0.65,
            source: {
              document_id: 'doc1',
              char_start: 20,
              char_end: 37,
              context_before: '',
              context_after: '',
              original_text: 'medium confidence'
            },
            extracted_at: new Date().toISOString()
          },
          {
            id: '3',
            type: 'medication',
            text: 'low confidence',
            attributes: {},
            confidence: 0.35,
            source: {
              document_id: 'doc1',
              char_start: 40,
              char_end: 54,
              context_before: '',
              context_after: '',
              original_text: 'low confidence'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 3
        }
      };

      const groundTruth: GroundTruth = {
        entities: [],
        documents: [{ id: 'doc1', content: 'test' }]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.by_confidence_level.high.count).toBe(1);
      expect(result.by_confidence_level.medium.count).toBe(1);
      expect(result.by_confidence_level.low.count).toBe(1);
      expect(result.by_confidence_level.high.accuracy).toBe(0.95);
      expect(result.by_confidence_level.medium.accuracy).toBe(0.65);
      expect(result.by_confidence_level.low.accuracy).toBe(0.35);
    });
  });

  describe('Attribute Completeness', () => {
    it('should evaluate attribute completeness', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {
              dosage: '325mg',
              route: 'oral'
              // Missing: frequency
            },
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 7,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [
          {
            type: 'medication',
            text: 'aspirin',
            attributes: {
              dosage: '325mg',
              route: 'oral',
              frequency: 'once daily'
            },
            char_start: 0,
            char_end: 7,
            document_id: 'doc1'
          }
        ],
        documents: [
          {
            id: 'doc1',
            content: 'aspirin 325mg orally once daily'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.attribute_completeness).toBeCloseTo(0.67, 1); // 2 out of 3 attributes
    });
  });

  describe('Regulatory Compliance', () => {
    it('should validate regulatory compliance requirements', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 11,
              char_end: 18,
              context_before: 'Administer ',
              context_after: ' 325mg',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [],
        documents: [
          {
            id: 'doc1',
            content: 'Administer aspirin 325mg'
          }
        ]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      // All required fields present (type, text, source, char_start, char_end)
      expect(result.regulatory_compliance).toBe(1.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty extraction', async () => {
      const extraction: StructuredExtraction = {
        entities: [],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 0
        }
      };

      const groundTruth: GroundTruth = {
        entities: [],
        documents: [{ id: 'doc1', content: 'test' }]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.precision).toBe(0);
      expect(result.recall).toBe(1.0); // No entities to miss
    });

    it('should handle empty ground truth', async () => {
      const extraction: StructuredExtraction = {
        entities: [
          {
            id: '1',
            type: 'medication',
            text: 'aspirin',
            attributes: {},
            confidence: 0.9,
            source: {
              document_id: 'doc1',
              char_start: 0,
              char_end: 7,
              context_before: '',
              context_after: '',
              original_text: 'aspirin'
            },
            extracted_at: new Date().toISOString()
          }
        ],
        metadata: {
          extraction_timestamp: new Date().toISOString(),
          documents_processed: 1,
          entities_extracted: 1
        }
      };

      const groundTruth: GroundTruth = {
        entities: [],
        documents: [{ id: 'doc1', content: 'test' }]
      };

      const result = await evaluator.evaluate(extraction, groundTruth);

      expect(result.precision).toBe(0); // All are false positives
      expect(result.recall).toBe(1.0); // No entities to miss
      expect(result.false_positives.length).toBe(1);
    });
  });
});
