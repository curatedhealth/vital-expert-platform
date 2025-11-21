-- ============================================================================
-- ADD LLM RECOMMENDATIONS TO KNOWLEDGE DOMAINS
-- ============================================================================
-- This migration adds recommended LLM models for each knowledge domain
-- Supports both embedding models and chat models based on domain tier
-- ============================================================================

-- Step 1: Add recommended_models column
-- ============================================================================

ALTER TABLE public.knowledge_domains
ADD COLUMN IF NOT EXISTS recommended_models JSONB DEFAULT '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["gpt-3.5-turbo"],
    "specialized": null
  }
}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.knowledge_domains.recommended_models IS 'Recommended LLM models for this domain (embedding + chat models)';

-- Step 2: Update Tier 1 domains with specialized medical models
-- ============================================================================

-- Regulatory Affairs - High accuracy required
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002", "biobert-pubmed"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Regulatory text requires high accuracy for compliance"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": null,
    "rationale": "Complex regulatory reasoning requires most capable models"
  }
}'::jsonb
WHERE slug = 'regulatory_affairs';

-- Clinical Development
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large", "pubmedbert-abstract"],
    "specialized": "clinicalbert",
    "rationale": "Clinical trial protocols benefit from medical-specific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": "meditron-70b",
    "rationale": "Clinical reasoning requires medical knowledge"
  }
}'::jsonb
WHERE slug = 'clinical_development';

-- Pharmacovigilance
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Safety data requires medical terminology understanding"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Safety analysis requires high accuracy and medical knowledge"
  }
}'::jsonb
WHERE slug = 'pharmacovigilance';

-- Quality Management
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Quality documents use standard regulatory language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet", "gpt-4"],
    "specialized": null,
    "rationale": "Quality processes require detailed reasoning"
  }
}'::jsonb
WHERE slug = 'quality_management';

-- Medical Affairs
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large", "scibert"],
    "specialized": "pubmedbert-abstract",
    "rationale": "Medical publications require scientific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Medical writing requires scientific accuracy"
  }
}'::jsonb
WHERE slug = 'medical_affairs';

-- Commercial Strategy
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Commercial content uses general business language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": null,
    "rationale": "Strategic planning requires advanced reasoning"
  }
}'::jsonb
WHERE slug = 'commercial_strategy';

-- Drug Development
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "scibert",
    "alternatives": ["biobert-pubmed", "text-embedding-3-large"],
    "specialized": "chembert",
    "rationale": "Drug discovery requires scientific and chemical embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "R&D requires deep scientific reasoning"
  }
}'::jsonb
WHERE slug = 'drug_development';

-- Clinical Data Analytics
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": "code-embedding-ada-002",
    "rationale": "Statistical code and documentation mixed with clinical text"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": null,
    "rationale": "Complex statistical analysis requires advanced reasoning"
  }
}'::jsonb
WHERE slug = 'clinical_data_analytics';

-- Manufacturing Operations
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Manufacturing SOPs use technical but standard language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet", "gpt-4"],
    "specialized": null,
    "rationale": "Process optimization requires detailed analysis"
  }
}'::jsonb
WHERE slug = 'manufacturing_operations';

-- Medical Devices
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["biobert-pubmed"],
    "specialized": null,
    "rationale": "Device regulations mix medical and engineering terminology"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": null,
    "rationale": "Device regulations require comprehensive understanding"
  }
}'::jsonb
WHERE slug = 'medical_devices';

-- Digital Health
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": "code-embedding-ada-002",
    "rationale": "SaMD guidance mixes regulatory and technical content"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": null,
    "rationale": "Digital health requires both technical and regulatory knowledge"
  }
}'::jsonb
WHERE slug = 'digital_health';

-- Supply Chain
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Logistics documentation uses standard business language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet", "gpt-3.5-turbo"],
    "specialized": null,
    "rationale": "Supply chain optimization requires analytical reasoning"
  }
}'::jsonb
WHERE slug = 'supply_chain';

-- Legal & Compliance
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Legal documents require precise semantic understanding"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": null,
    "rationale": "Legal analysis requires highest accuracy"
  }
}'::jsonb
WHERE slug = 'legal_compliance';

-- Health Economics
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["scibert"],
    "specialized": null,
    "rationale": "HEOR combines medical and economic terminology"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": null,
    "rationale": "Economic modeling requires advanced analytical capabilities"
  }
}'::jsonb
WHERE slug = 'health_economics';

-- Business Strategy
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Strategic documents use general business language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": null,
    "rationale": "Strategic planning requires sophisticated reasoning"
  }
}'::jsonb
WHERE slug = 'business_strategy';

-- Step 3: Update Tier 2 domains (Specialized)
-- ============================================================================

UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet", "gpt-4"],
    "specialized": null
  }
}'::jsonb
WHERE tier = 2 AND recommended_models IS NULL;

-- Special case: Scientific Publications (Tier 2) - needs scientific embeddings
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "scibert",
    "alternatives": ["biobert-pubmed", "text-embedding-3-large"],
    "specialized": "pubmedbert-abstract",
    "rationale": "Scientific publications require specialized embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": null,
    "rationale": "Publication writing requires high quality output"
  }
}'::jsonb
WHERE slug = 'scientific_publications';

-- Special case: Nonclinical Sciences (Tier 2)
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "scibert",
    "alternatives": ["biobert-pubmed", "text-embedding-3-large"],
    "specialized": "chembert",
    "rationale": "Toxicology and pharmacology require scientific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Safety assessment requires medical expertise"
  }
}'::jsonb
WHERE slug = 'nonclinical_sciences';

-- Step 4: Update Tier 3 domains (Emerging)
-- ============================================================================

UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet", "gpt-3.5-turbo"],
    "specialized": null
  }
}'::jsonb
WHERE tier = 3 AND recommended_models IS NULL;

-- Special case: Precision Medicine (Tier 3) - genomics focus
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Genomics and biomarkers require medical embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Precision medicine requires deep medical knowledge"
  }
}'::jsonb
WHERE slug = 'precision_medicine';

-- Step 5: Create index for JSONB queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_recommended_models
ON public.knowledge_domains USING GIN(recommended_models);

-- Step 6: Verification query
-- ============================================================================

-- Show all domains with their recommended models
SELECT
  tier,
  priority,
  name,
  slug,
  recommended_models->'embedding'->>'primary' as primary_embedding,
  recommended_models->'embedding'->>'specialized' as specialized_embedding,
  recommended_models->'chat'->>'primary' as primary_chat,
  recommended_models->'chat'->>'specialized' as specialized_chat
FROM public.knowledge_domains
ORDER BY tier, priority;
