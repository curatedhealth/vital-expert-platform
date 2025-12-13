/**
 * Healthcare Domain Constants
 *
 * Reusable constants for therapeutic areas, disease areas, knowledge domains,
 * and lifecycle management across the VITAL platform.
 */

// =============================================================================
// Therapeutic Areas
// =============================================================================

export const THERAPEUTIC_AREAS = [
  { value: 'oncology', label: 'Oncology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'rare-diseases', label: 'Rare Diseases' },
  { value: 'gene-therapy', label: 'Gene Therapy' },
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'womens-health', label: "Women's Health" },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'geriatrics', label: 'Geriatrics' },
] as const;

export type TherapeuticAreaValue = typeof THERAPEUTIC_AREAS[number]['value'];

// =============================================================================
// Disease Areas (Common indications)
// =============================================================================

export const DISEASE_AREAS = [
  // Oncology
  { value: 'nsclc', label: 'Non-Small Cell Lung Cancer (NSCLC)', therapeutic_area: 'oncology' },
  { value: 'breast-cancer', label: 'Breast Cancer', therapeutic_area: 'oncology' },
  { value: 'colorectal-cancer', label: 'Colorectal Cancer', therapeutic_area: 'oncology' },
  { value: 'melanoma', label: 'Melanoma', therapeutic_area: 'oncology' },
  { value: 'prostate-cancer', label: 'Prostate Cancer', therapeutic_area: 'oncology' },
  { value: 'leukemia', label: 'Leukemia', therapeutic_area: 'oncology' },
  { value: 'lymphoma', label: 'Lymphoma', therapeutic_area: 'oncology' },

  // Cardiology
  { value: 'heart-failure', label: 'Heart Failure', therapeutic_area: 'cardiology' },
  { value: 'atrial-fibrillation', label: 'Atrial Fibrillation', therapeutic_area: 'cardiology' },
  { value: 'coronary-artery-disease', label: 'Coronary Artery Disease', therapeutic_area: 'cardiology' },
  { value: 'hypertension', label: 'Hypertension', therapeutic_area: 'cardiology' },

  // Neurology
  { value: 'alzheimers', label: "Alzheimer's Disease", therapeutic_area: 'neurology' },
  { value: 'parkinsons', label: "Parkinson's Disease", therapeutic_area: 'neurology' },
  { value: 'multiple-sclerosis', label: 'Multiple Sclerosis', therapeutic_area: 'neurology' },
  { value: 'epilepsy', label: 'Epilepsy', therapeutic_area: 'neurology' },
  { value: 'migraine', label: 'Migraine', therapeutic_area: 'neurology' },

  // Immunology
  { value: 'rheumatoid-arthritis', label: 'Rheumatoid Arthritis', therapeutic_area: 'immunology' },
  { value: 'psoriasis', label: 'Psoriasis', therapeutic_area: 'immunology' },
  { value: 'lupus', label: 'Systemic Lupus Erythematosus', therapeutic_area: 'immunology' },
  { value: 'crohns-disease', label: "Crohn's Disease", therapeutic_area: 'immunology' },

  // Endocrinology
  { value: 'type-2-diabetes', label: 'Type 2 Diabetes', therapeutic_area: 'endocrinology' },
  { value: 'type-1-diabetes', label: 'Type 1 Diabetes', therapeutic_area: 'endocrinology' },
  { value: 'obesity', label: 'Obesity', therapeutic_area: 'endocrinology' },
  { value: 'hypothyroidism', label: 'Hypothyroidism', therapeutic_area: 'endocrinology' },

  // Respiratory
  { value: 'asthma', label: 'Asthma', therapeutic_area: 'respiratory' },
  { value: 'copd', label: 'COPD', therapeutic_area: 'respiratory' },
  { value: 'idiopathic-pulmonary-fibrosis', label: 'Idiopathic Pulmonary Fibrosis', therapeutic_area: 'respiratory' },

  // Infectious Disease
  { value: 'hiv', label: 'HIV/AIDS', therapeutic_area: 'infectious-disease' },
  { value: 'hepatitis-c', label: 'Hepatitis C', therapeutic_area: 'infectious-disease' },
  { value: 'covid-19', label: 'COVID-19', therapeutic_area: 'infectious-disease' },

  // Psychiatry
  { value: 'depression', label: 'Major Depressive Disorder', therapeutic_area: 'psychiatry' },
  { value: 'anxiety', label: 'Generalized Anxiety Disorder', therapeutic_area: 'psychiatry' },
  { value: 'schizophrenia', label: 'Schizophrenia', therapeutic_area: 'psychiatry' },
  { value: 'bipolar', label: 'Bipolar Disorder', therapeutic_area: 'psychiatry' },
] as const;

export type DiseaseAreaValue = typeof DISEASE_AREAS[number]['value'];

// =============================================================================
// Knowledge Domains (RAG/Document Categories)
// =============================================================================

export const KNOWLEDGE_DOMAINS = [
  // Regulatory
  { value: 'regulatory', label: 'Regulatory Affairs', category: 'regulatory' },
  { value: 'fda-guidance', label: 'FDA Guidance', category: 'regulatory' },
  { value: 'ema-guidance', label: 'EMA Guidance', category: 'regulatory' },
  { value: 'ich-guidelines', label: 'ICH Guidelines', category: 'regulatory' },
  { value: 'compliance', label: 'Compliance', category: 'regulatory' },

  // Clinical
  { value: 'clinical-trials', label: 'Clinical Trials', category: 'clinical' },
  { value: 'protocols', label: 'Protocols', category: 'clinical' },
  { value: 'clinical-data', label: 'Clinical Data', category: 'clinical' },
  { value: 'biostatistics', label: 'Biostatistics', category: 'clinical' },
  { value: 'endpoints', label: 'Clinical Endpoints', category: 'clinical' },

  // Safety
  { value: 'pharmacovigilance', label: 'Pharmacovigilance', category: 'safety' },
  { value: 'adverse-events', label: 'Adverse Events', category: 'safety' },
  { value: 'safety-reporting', label: 'Safety Reporting', category: 'safety' },
  { value: 'risk-management', label: 'Risk Management', category: 'safety' },

  // Scientific
  { value: 'drug-development', label: 'Drug Development', category: 'scientific' },
  { value: 'pharmacology', label: 'Pharmacology', category: 'scientific' },
  { value: 'toxicology', label: 'Toxicology', category: 'scientific' },
  { value: 'biomarkers', label: 'Biomarkers', category: 'scientific' },
  { value: 'genomics', label: 'Genomics', category: 'scientific' },

  // Commercial
  { value: 'market-access', label: 'Market Access', category: 'commercial' },
  { value: 'health-economics', label: 'Health Economics', category: 'commercial' },
  { value: 'pricing-reimbursement', label: 'Pricing & Reimbursement', category: 'commercial' },
  { value: 'competitive-intelligence', label: 'Competitive Intelligence', category: 'commercial' },

  // Quality
  { value: 'quality-assurance', label: 'Quality Assurance', category: 'quality' },
  { value: 'manufacturing', label: 'Manufacturing', category: 'quality' },
  { value: 'gmp', label: 'GMP', category: 'quality' },
  { value: 'labeling', label: 'Labeling', category: 'quality' },

  // Medical Devices
  { value: 'medical-devices', label: 'Medical Devices', category: 'devices' },
  { value: '510k', label: '510(k)', category: 'devices' },
  { value: 'pma', label: 'PMA', category: 'devices' },
  { value: 'companion-diagnostics', label: 'Companion Diagnostics', category: 'devices' },

  // Digital Health
  { value: 'digital-therapeutics', label: 'Digital Therapeutics', category: 'digital' },
  { value: 'real-world-evidence', label: 'Real-World Evidence', category: 'digital' },
  { value: 'ai-ml', label: 'AI/ML', category: 'digital' },
] as const;

export type KnowledgeDomainValue = typeof KNOWLEDGE_DOMAINS[number]['value'];
export type KnowledgeDomainCategory = typeof KNOWLEDGE_DOMAINS[number]['category'];

// Group knowledge domains by category for UI display
export const KNOWLEDGE_DOMAINS_BY_CATEGORY = KNOWLEDGE_DOMAINS.reduce((acc, domain) => {
  if (!acc[domain.category]) {
    acc[domain.category] = [];
  }
  acc[domain.category].push(domain);
  return acc;
}, {} as Record<string, typeof KNOWLEDGE_DOMAINS[number][]>);

// =============================================================================
// RAG Types
// =============================================================================

export const RAG_TYPES = [
  { value: 'global', label: 'Global', description: 'Available to all agents' },
  { value: 'agent-specific', label: 'Agent-Specific', description: 'Assigned to specific agents' },
  { value: 'tenant', label: 'Tenant', description: 'Scoped to a specific tenant' },
] as const;

export type RagTypeValue = typeof RAG_TYPES[number]['value'];

// =============================================================================
// Embedding Models
// =============================================================================

export const EMBEDDING_MODELS = [
  { value: 'text-embedding-ada-002', label: 'OpenAI Ada-002', description: 'Recommended for most use cases' },
  { value: 'text-embedding-3-small', label: 'OpenAI v3 Small', description: 'Cost-effective, good quality' },
  { value: 'text-embedding-3-large', label: 'OpenAI v3 Large', description: 'Highest quality embeddings' },
  { value: 'voyage-large-2', label: 'Voyage Large 2', description: 'Best for legal/medical domains' },
  { value: 'voyage-code-2', label: 'Voyage Code 2', description: 'Optimized for code' },
] as const;

export type EmbeddingModelValue = typeof EMBEDDING_MODELS[number]['value'];

// =============================================================================
// Access Levels
// =============================================================================

export const ACCESS_LEVELS = [
  { value: 'public', label: 'Public', description: 'Available to all users' },
  { value: 'organization', label: 'Organization', description: 'Available to organization members' },
  { value: 'private', label: 'Private', description: 'Restricted access' },
  { value: 'confidential', label: 'Confidential', description: 'Highly restricted, audit logged' },
] as const;

export type AccessLevelValue = typeof ACCESS_LEVELS[number]['value'];

// =============================================================================
// Lifecycle Status
// =============================================================================

export const LIFECYCLE_STATUS = [
  { value: 'draft', label: 'Draft', color: 'gray', description: 'Not yet active' },
  { value: 'active', label: 'Active', color: 'green', description: 'In production use' },
  { value: 'review', label: 'Under Review', color: 'yellow', description: 'Being reviewed' },
  { value: 'deprecated', label: 'Deprecated', color: 'orange', description: 'Being phased out' },
  { value: 'archived', label: 'Archived', color: 'red', description: 'No longer in use' },
] as const;

export type LifecycleStatusValue = typeof LIFECYCLE_STATUS[number]['value'];

// =============================================================================
// Drug Lifecycle Phases
// =============================================================================

export const DRUG_LIFECYCLE_PHASES = [
  { value: 'discovery', label: 'Discovery', order: 1 },
  { value: 'preclinical', label: 'Preclinical', order: 2 },
  { value: 'phase-1', label: 'Phase 1', order: 3 },
  { value: 'phase-2', label: 'Phase 2', order: 4 },
  { value: 'phase-3', label: 'Phase 3', order: 5 },
  { value: 'nda-bla', label: 'NDA/BLA', order: 6 },
  { value: 'approved', label: 'Approved', order: 7 },
  { value: 'post-marketing', label: 'Post-Marketing', order: 8 },
  { value: 'lifecycle-management', label: 'Lifecycle Management', order: 9 },
] as const;

export type DrugLifecyclePhaseValue = typeof DRUG_LIFECYCLE_PHASES[number]['value'];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get therapeutic areas as options for Select components
 */
export function getTherapeuticAreaOptions() {
  return THERAPEUTIC_AREAS.map(ta => ({ value: ta.value, label: ta.label }));
}

/**
 * Get disease areas filtered by therapeutic area
 */
export function getDiseaseAreasByTherapeuticArea(therapeuticArea: string) {
  return DISEASE_AREAS.filter(da => da.therapeutic_area === therapeuticArea);
}

/**
 * Get knowledge domains as options, optionally filtered by category
 */
export function getKnowledgeDomainOptions(category?: string) {
  const domains = category
    ? KNOWLEDGE_DOMAINS.filter(d => d.category === category)
    : KNOWLEDGE_DOMAINS;
  return domains.map(d => ({ value: d.value, label: d.label }));
}

/**
 * Get unique knowledge domain categories
 */
export function getKnowledgeDomainCategories() {
  const categories = [...new Set(KNOWLEDGE_DOMAINS.map(d => d.category))];
  return categories.map(c => ({
    value: c,
    label: c.charAt(0).toUpperCase() + c.slice(1),
  }));
}
