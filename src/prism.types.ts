// ===================================================================
// PRISM Framework Types - Clinical Prompt Engineering
// Precision, Relevance, Integration, Safety, Measurement
// ===================================================================

export interface PRISMPrompt {
  id: string;
  category: 'clinical_assessment' | 'treatment_optimization' | 'behavioral_therapy' | 'safety_evaluation';

  // PRISM Framework Components
  precision: string;    // Precise clinical requirements and parameters
  relevance: string;    // Relevant filtering and prioritization criteria
  integration: string;  // Integration with multiple data sources
  safety: string;       // Safety protocols and monitoring requirements
  measurement: string;  // Measurable outcomes and tracking methods

  // Validation Framework
  validation: {
    pharma: {
      purpose: string;
      hypothesis: string;
      audience: string;
      requirements: string;
      metrics: string;
      actionable: string;
    };
    verify: {
      sources: string[];
      evidence: string;
      confidence: number;
      gaps: string[];
      factChecked: boolean;
      expertReview: boolean;
    };
  };

  // Metadata
  clinicalValidation?: {
    requiresCitation: boolean;
    evidenceLevel: 'Level-1' | 'Level-2' | 'Level-3' | 'Level-4';
    guidelineAlignment: string[];
  };

  urgencyTriage?: {
    emergency: string;
    urgent: string;
    routine: string;
  };
}

export interface ClinicalContext {
  patientId: string;
  timestamp: string;
  clinicalData: Record<string, unknown>;
  demographicData: Record<string, unknown>;
  medicalHistory: string[];
  currentMedications: string[];
  allergyInformation: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PRISMValidationResult {
  pharmaScore: number;
  verifyStatus: 'passed' | 'review_required' | 'expert_needed';
  confidence: number;
  safetyFlags: string[];
  clinicalAccuracy: number;
  evidenceLevel: string;
  recommendationQuality: number;
}

export interface PRISMGenerationConfig {
  enableRealTimeValidation: boolean;
  requireClinicalReview: boolean;
  safetyThreshold: number;
  confidenceThreshold: number;
  includeMetricsTracking: boolean;
  customValidationRules?: string[];
}

export type PRISMPromptTemplate =
  | 'sleep_assessment'
  | 'medication_optimization'
  | 'behavioral_interventions'
  | 'safety_evaluation'
  | 'clinical_validation'
  | 'treatment_planning'
  | 'outcome_measurement';