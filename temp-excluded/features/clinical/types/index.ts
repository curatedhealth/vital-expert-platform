// Clinical Dashboard Types
export interface TimelineEvent {
  id: string;
  type: 'diagnosis' | 'treatment' | 'lab' | 'procedure' | 'medication' | 'outcome';
  date: Date;
  title: string;
  description: string;
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  category: string;
  medicalCoding?: {
    system: 'ICD-10' | 'CPT' | 'SNOMED' | 'LOINC';
    code: string;
    display: string;
  };
  outcomes?: {
    primary: string;
    secondary?: string[];
    measurements?: { value: number; unit: string; reference?: string }[];
  };
  provider?: {
    name: string;
    specialty: string;
    facility: string;
  };
  attachments?: {
    type: 'document' | 'image' | 'report';
    url: string;
    name: string;
  }[];
  relatedEvents?: string[];
}

export interface PatientTimelineData {
  patientId: string;
  events: TimelineEvent[];
  milestones: {
    id: string;
    date: Date;
    title: string;
    type: 'admission' | 'discharge' | 'diagnosis' | 'recovery' | 'followup';
    significance: 'major' | 'minor';
  }[];
  treatmentPeriods: {
    id: string;
    startDate: Date;
    endDate?: Date;
    treatment: string;
    status: 'active' | 'completed' | 'discontinued';
    reason?: string;
  }[];
}

export interface ClinicalTrialCriteria {
  id: string;
  type: 'inclusion' | 'exclusion';
  category: 'demographic' | 'medical' | 'laboratory' | 'medication' | 'other';
  description: string;
  medicalCoding?: {
    system: string;
    code: string;
    display: string;
  };
  valueRange?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  required: boolean;
}

export interface ClinicalTrial {
  nctNumber: string;
  title: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV';
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  condition: string;
  intervention: string;
  sponsor: string;
  locations: {
    facility: string;
    city: string;
    state: string;
    country: string;
    distance?: number;
  }[];
  inclusionCriteria: ClinicalTrialCriteria[];
  exclusionCriteria: ClinicalTrialCriteria[];
  primaryEndpoints: string[];
  secondaryEndpoints: string[];
  estimatedCompletion: Date;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface TrialMatch {
  trial: ClinicalTrial;
  matchScore: number;
  eligibilityStatus: 'eligible' | 'potentially_eligible' | 'not_eligible';
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  requiredAssessments: string[];
  confidence: number;
}

export interface Evidence {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publishedDate: Date;
  pmid?: string;
  doi?: string;
  studyType: 'rct' | 'cohort' | 'case_control' | 'systematic_review' | 'meta_analysis' | 'case_series';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  gradeScore: {
    overall: 'high' | 'moderate' | 'low' | 'very_low';
    domains: {
      riskOfBias: number;
      inconsistency: number;
      indirectness: number;
      imprecision: number;
      publicationBias: number;
    };
  };
  population: string;
  intervention: string;
  comparator: string;
  outcomes: {
    primary: string;
    effect: string;
    confidence: string;
  }[];
  keyFindings: string[];
  limitations: string[];
  clinicalSignificance: 'high' | 'moderate' | 'low';
  contradictions?: string[];
}

export interface RegulatorySubmission {
  id: string;
  type: '510k' | 'PMA' | 'IDE' | 'IND' | 'NDA' | 'BLA' | 'ANDA';
  productName: string;
  indication: string;
  sponsor: string;
  submissionDate: Date;
  targetDate?: Date;
  actualDate?: Date;
  status: 'draft' | 'submitted' | 'under_review' | 'additional_info_requested' | 'approved' | 'denied';
  reviewClock: {
    standardDays: number;
    usedDays: number;
    holdDays: number;
    remainingDays: number;
  };
  milestones: {
    id: string;
    name: string;
    date: Date;
    status: 'completed' | 'pending' | 'overdue';
    documents?: string[];
  }[];
  interactions: {
    date: Date;
    type: 'meeting' | 'correspondence' | 'submission' | 'response';
    summary: string;
    participants: string[];
    outcomes: string[];
  }[];
}

export interface SafetyEvent {
  id: string;
  reportId: string;
  patientId?: string;
  eventDate: Date;
  reportDate: Date;
  eventType: 'adverse_event' | 'serious_adverse_event' | 'unanticipated_problem' | 'device_malfunction';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';
  causality: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
  description: string;
  medicalCoding: {
    meddra: {
      pt: string; // Preferred Term
      llt: string; // Lowest Level Term
      hlgt: string; // High Level Group Term
      hlt: string; // High Level Term
      soc: string; // System Organ Class
    };
  };
  relatedProducts: string[];
  outcome: 'recovered' | 'recovering' | 'not_recovered' | 'recovered_with_sequelae' | 'fatal' | 'unknown';
  actions: string[];
  reporter: {
    type: 'physician' | 'pharmacist' | 'nurse' | 'patient' | 'other';
    name?: string;
    qualification?: string;
  };
  regulatoryReporting: {
    required: boolean;
    submitted: boolean;
    submissionDate?: Date;
    agencies: string[];
  };
}

export interface DrugInteraction {
  drugA: {
    name: string;
    genericName: string;
    dosage: string;
    route: string;
  };
  drugB: {
    name: string;
    genericName: string;
    dosage: string;
    route: string;
  };
  interactionType: 'major' | 'moderate' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  alternatives: {
    drug: string;
    rationale: string;
  }[];
  evidence: {
    level: 'established' | 'probable' | 'theoretical';
    references: string[];
  };
  patientRiskFactors?: string[];
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'activity' | 'gateway' | 'event';
  label: string;
  description?: string;
  position: { x: number; y: number };
  data: {
    medicalCoding?: {
      system: 'ICD-10' | 'CPT' | 'SNOMED';
      code: string;
    };
    validationRules?: ValidationRule[];
    evidenceLinks?: string[];
    durationEstimate?: number;
    requiredRole?: string;
    prerequisites?: string[];
  };
}

export interface ValidationRule {
  id: string;
  type: 'required' | 'conditional' | 'range' | 'format' | 'medical';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  probability?: number;
}

export interface ClinicalWorkflow {
  id: string;
  name: string;
  version: string;
  type: 'clinical_trial' | 'treatment_pathway' | 'diagnostic' | 'regulatory' | 'reimbursement';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    author: string;
    created: Date;
    modified: Date;
    reviewStatus: 'draft' | 'review' | 'approved' | 'deprecated';
    medicalSpecialty: string;
    evidenceLevel: string;
    guidelines: string[];
  };
}