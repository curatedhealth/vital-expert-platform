/**
 * Domain-Based Embedding Model Selector
 * 
 * Intelligently selects the best HuggingFace embedding model based on knowledge domain
 * 
 * Strategy:
 * - Biomedical/Scientific domains → Use specialized models (sapbert, biobert)
 * - General/Regulatory domains → Use top general models (mxbai, e5-large-v2)
 * - Multilingual domains → Use multilingual models
 * - Long documents → Use long-context models
 */

import type { HFEmbeddingModel } from './huggingface-embedding-service';

export interface DomainModelMapping {
  domain: string | string[];
  model: HFEmbeddingModel;
  reason: string;
}

/**
 * Domain-to-Model Mapping (2025 Optimized)
 * Maps knowledge domains to optimal embedding models
 */
const DOMAIN_MODEL_MAPPINGS: DomainModelMapping[] = [
  // 🏥 BIOMEDICAL / SCIENTIFIC DOMAINS
  {
    domain: ['clinical_development', 'clinical_trials', 'clinical_data_analytics', 'nonclinical_sciences'],
    model: 'sapbert-pubmed',
    reason: 'Biomedical domain expert - optimized for PubMed/clinical literature',
  },
  {
    domain: ['pharmacovigilance', 'drug_safety', 'adverse_events'],
    model: 'sapbert-pubmed',
    reason: 'Biomedical domain - safety documents and medical literature',
  },
  {
    domain: ['scientific_publications', 'medical_research', 'biomedical_research'],
    model: 'biobert-mnli',
    reason: 'Fine-tuned for biomedical NLI and similarity tasks',
  },
  {
    domain: ['medical_affairs', 'medical_writing', 'medical_communications'],
    model: 'sapbert-pubmed',
    reason: 'Medical domain - PubMedBERT trained on medical literature',
  },
  {
    domain: ['companion_diagnostics', 'diagnostics', 'laboratory'],
    model: 'biobert-base',
    reason: 'Biomedical/clinical diagnostics domain',
  },

  // 🔬 RESEARCH / SCIENTIFIC
  {
    domain: ['research', 'scientific_research', 'r_d'],
    model: 'biobert-mnli',
    reason: 'Research documents benefit from biomedical fine-tuning',
  },

  // 📋 GENERAL / REGULATORY / COMMERCIAL (Use Top Performers)
  {
    domain: ['regulatory_affairs', 'regulatory', 'compliance', 'legal_compliance'],
    model: 'e5-large-v2',
    reason: 'Best for RAG - instruction-tuned for query/document pairs',
  },
  {
    domain: ['commercial_strategy', 'market_access', 'health_economics', 'reimbursement'],
    model: 'mxbai-embed-large-v1',
    reason: 'Top MTEB performer - best for general business documents',
  },
  {
    domain: ['business_strategy', 'corporate_strategy'],
    model: 'mxbai-embed-large-v1',
    reason: 'Top performer for general business text',
  },
  {
    domain: ['quality_assurance', 'quality_management', 'manufacturing_operations'],
    model: 'e5-large-v2',
    reason: 'Instruction-tuned model works well for structured documents',
  },

  // 💻 DIGITAL / TECHNOLOGY
  {
    domain: ['digital_health', 'healthcare_technology', 'health_it'],
    model: 'codebert-base',
    reason: 'Tech domain - optimized for code + technical documentation',
  },
  {
    domain: ['software', 'technology', 'it', 'informatics'],
    model: 'codebert-base',
    reason: 'Technical content - code + documentation',
  },

  // 📄 LONG DOCUMENTS
  {
    domain: ['regulatory_submissions', 'dossiers', 'long_documents'],
    model: 'gte-large',
    reason: 'Optimized for multi-paragraph and long-context documents',
  },

  // 🌍 MULTILINGUAL
  {
    domain: ['global', 'international', 'multilingual'],
    model: 'multilingual-e5-large',
    reason: '100+ languages support',
  },

  // ⚡ DEFAULT (Top General Performer)
  {
    domain: ['*'], // Wildcard for unmatched domains
    model: 'mxbai-embed-large-v1',
    reason: 'Default: Top MTEB 2025 performer - best general-purpose model',
  },
];

/**
 * Get optimal embedding model for a knowledge domain
 */
export function getEmbeddingModelForDomain(domain: string | null | undefined): HFEmbeddingModel {
  // Normalize domain name
  if (!domain) {
    return 'mxbai-embed-large-v1'; // Default top performer
  }

  const domainLower = domain.toLowerCase().replace(/[_-]/g, '_').trim();

  // Check for exact matches first
  for (const mapping of DOMAIN_MODEL_MAPPINGS) {
    if (mapping.domain === '*') continue; // Skip wildcard

    const domains = Array.isArray(mapping.domain) ? mapping.domain : [mapping.domain];
    
    for (const mapDomain of domains) {
      const mapDomainLower = mapDomain.toLowerCase().replace(/[_-]/g, '_');
      
      // Exact match
      if (domainLower === mapDomainLower) {
        console.log(`🎯 Domain "${domain}" → Model "${mapping.model}" (${mapping.reason})`);
        return mapping.model;
      }

      // Partial match (domain contains mapping domain or vice versa)
      if (domainLower.includes(mapDomainLower) || mapDomainLower.includes(domainLower)) {
        console.log(`🎯 Domain "${domain}" → Model "${mapping.model}" (${mapping.reason} - partial match)`);
        return mapping.model;
      }
    }
  }

  // Check keyword-based matching
  const biomedicalKeywords = ['clinical', 'medical', 'biomedical', 'scientific', 'research', 'pharma', 'drug', 'therapeutic', 'disease', 'diagnosis', 'treatment', 'patient', 'physician', 'hospital'];
  const regulatoryKeywords = ['regulatory', 'fda', 'ema', 'compliance', 'submission', 'approval', 'guidance', 'regulation'];
  const techKeywords = ['digital', 'software', 'technology', 'tech', 'it', 'code', 'programming', 'informatics'];

  if (biomedicalKeywords.some(keyword => domainLower.includes(keyword))) {
    const model = 'sapbert-pubmed';
    console.log(`🎯 Domain "${domain}" → Model "${model}" (biomedical keyword match)`);
    return model;
  }

  if (regulatoryKeywords.some(keyword => domainLower.includes(keyword))) {
    const model = 'e5-large-v2';
    console.log(`🎯 Domain "${domain}" → Model "${model}" (regulatory keyword match - best for RAG)`);
    return model;
  }

  if (techKeywords.some(keyword => domainLower.includes(keyword))) {
    const model = 'codebert-base';
    console.log(`🎯 Domain "${domain}" → Model "${model}" (tech keyword match)`);
    return model;
  }

  // Default fallback
  const defaultModel = 'mxbai-embed-large-v1';
  console.log(`🎯 Domain "${domain}" → Model "${defaultModel}" (default - top MTEB performer)`);
  return defaultModel;
}

/**
 * Get model recommendation with reasoning
 */
export function getEmbeddingModelRecommendation(domain: string | null | undefined): {
  model: HFEmbeddingModel;
  reason: string;
  isSpecialized: boolean;
} {
  if (!domain) {
    return {
      model: 'mxbai-embed-large-v1',
      reason: 'Default: Top MTEB 2025 performer',
      isSpecialized: false,
    };
  }

  const domainLower = domain.toLowerCase().replace(/[_-]/g, '_').trim();

  // Find matching mapping
  for (const mapping of DOMAIN_MODEL_MAPPINGS) {
    if (mapping.domain === '*') continue;

    const domains = Array.isArray(mapping.domain) ? mapping.domain : [mapping.domain];
    
    for (const mapDomain of domains) {
      const mapDomainLower = mapDomain.toLowerCase().replace(/[_-]/g, '_');
      
      if (domainLower === mapDomainLower || domainLower.includes(mapDomainLower) || mapDomainLower.includes(domainLower)) {
        return {
          model: mapping.model,
          reason: mapping.reason,
          isSpecialized: ['sapbert', 'biobert'].some(m => mapping.model.includes(m)),
        };
      }
    }
  }

  // Default
  return {
    model: 'mxbai-embed-large-v1',
    reason: 'Default: Top MTEB 2025 performer - best general-purpose model',
    isSpecialized: false,
  };
}

/**
 * Get all domain-to-model mappings (for documentation/UI)
 */
export function getAllDomainMappings(): Array<{
  domains: string[];
  model: HFEmbeddingModel;
  reason: string;
  category: string;
}> {
  return DOMAIN_MODEL_MAPPINGS
    .filter(m => m.domain !== '*')
    .map(m => ({
      domains: Array.isArray(m.domain) ? m.domain : [m.domain],
      model: m.model,
      reason: m.reason,
      category: m.model.includes('pubmed') || m.model.includes('biobert') ? 'Biomedical' :
               m.model.includes('codebert') ? 'Technical' :
               m.model.includes('multilingual') ? 'Multilingual' :
               m.model === 'gte-large' ? 'Long Context' :
               m.model === 'e5-large-v2' ? 'RAG Optimized' :
               'General',
    }));
}

/**
 * Update domain model mappings programmatically
 */
export function addDomainMapping(mapping: DomainModelMapping): void {
  // Remove existing mappings for this domain
  const domains = Array.isArray(mapping.domain) ? mapping.domain : [mapping.domain];
  const filteredMappings = DOMAIN_MODEL_MAPPINGS.filter(m => {
    if (m.domain === '*') return true;
    const mDomains = Array.isArray(m.domain) ? m.domain : [m.domain];
    return !mDomains.some(d => domains.includes(d));
  });
  
  // Add new mapping before wildcard
  const wildcardIndex = filteredMappings.findIndex(m => m.domain === '*');
  if (wildcardIndex >= 0) {
    filteredMappings.splice(wildcardIndex, 0, mapping);
  } else {
    filteredMappings.push(mapping);
  }
  
  // Note: In production, you'd want to persist this to database
  console.log('📝 Domain mapping updated (runtime only - restart to persist)');
}

