-- ============================================================================
-- Migration: Create agent_knowledge_domains Table
-- Date: 2025-11-23
-- Purpose: Create missing agent_knowledge_domains table for Neo4j/GraphRAG integration
-- ============================================================================

BEGIN;

-- ============================================================================
-- Create agent_knowledge_domains Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- Domain Information (using TEXT for domain_name for simplicity)
  domain_name TEXT NOT NULL,
  
  -- Proficiency and Status
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_primary_domain BOOLEAN DEFAULT false,
  expertise_level INTEGER DEFAULT 3 CHECK (expertise_level >= 1 AND expertise_level <= 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(agent_id, domain_name)
);

-- ============================================================================
-- Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_agent_id 
  ON public.agent_knowledge_domains(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_domain_name 
  ON public.agent_knowledge_domains(domain_name);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_proficiency 
  ON public.agent_knowledge_domains(proficiency_level);

-- ============================================================================
-- Add Comments
-- ============================================================================

COMMENT ON TABLE public.agent_knowledge_domains IS 'Maps agents to their knowledge domains with proficiency levels';
COMMENT ON COLUMN public.agent_knowledge_domains.domain_name IS 'Name of the knowledge domain (e.g., "Medical Affairs", "Regulatory", "Clinical Trials")';
COMMENT ON COLUMN public.agent_knowledge_domains.proficiency_level IS 'Agent proficiency in this domain: basic, intermediate, advanced, expert';
COMMENT ON COLUMN public.agent_knowledge_domains.is_primary_domain IS 'Whether this is the primary domain for this agent';
COMMENT ON COLUMN public.agent_knowledge_domains.expertise_level IS 'Numeric expertise level 1-5 (1=novice, 5=expert)';

-- ============================================================================
-- Seed Initial Knowledge Domain Mappings
-- ============================================================================

-- Map agents to knowledge domains based on their department and role
INSERT INTO public.agent_knowledge_domains (
  agent_id,
  domain_name,
  proficiency_level,
  is_primary_domain,
  expertise_level
)
SELECT
  a.id AS agent_id,
  
  -- Determine primary domain from department
  CASE 
    WHEN a.department_name ILIKE '%Medical Affairs%' THEN 'Medical Affairs'
    WHEN a.department_name ILIKE '%Regulatory%' THEN 'Regulatory Affairs'
    WHEN a.department_name ILIKE '%Clinical%' THEN 'Clinical Development'
    WHEN a.department_name ILIKE '%Pharmacovigilance%' THEN 'Pharmacovigilance'
    WHEN a.department_name ILIKE '%Quality%' THEN 'Quality Assurance'
    WHEN a.department_name ILIKE '%Manufacturing%' THEN 'Manufacturing'
    WHEN a.department_name ILIKE '%Supply Chain%' THEN 'Supply Chain'
    WHEN a.department_name ILIKE '%Commercial%' THEN 'Commercial Operations'
    WHEN a.department_name ILIKE '%Market Access%' THEN 'Market Access'
    WHEN a.department_name ILIKE '%Drug Safety%' THEN 'Drug Safety'
    WHEN a.department_name ILIKE '%Research%' THEN 'Research & Development'
    WHEN a.department_name ILIKE '%Preclinical%' THEN 'Preclinical Research'
    ELSE 'General Pharmaceutical'
  END AS domain_name,
  
  -- Determine proficiency based on agent level
  CASE 
    WHEN al.level_number <= 2 THEN 'expert'::TEXT
    WHEN al.level_number = 3 THEN 'advanced'::TEXT
    WHEN al.level_number = 4 THEN 'intermediate'::TEXT
    ELSE 'basic'::TEXT
  END AS proficiency_level,
  
  true AS is_primary_domain,
  
  -- Map expertise level (inverse of agent level)
  CASE 
    WHEN al.level_number = 1 THEN 5
    WHEN al.level_number = 2 THEN 4
    WHEN al.level_number = 3 THEN 3
    WHEN al.level_number = 4 THEN 2
    ELSE 1
  END AS expertise_level

FROM agents a
LEFT JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.status = 'active'
  AND a.department_name IS NOT NULL
ON CONFLICT (agent_id, domain_name) DO UPDATE SET
  proficiency_level = EXCLUDED.proficiency_level,
  is_primary_domain = EXCLUDED.is_primary_domain,
  expertise_level = EXCLUDED.expertise_level,
  updated_at = NOW();

-- Add secondary domains for cross-functional expertise
INSERT INTO public.agent_knowledge_domains (
  agent_id,
  domain_name,
  proficiency_level,
  is_primary_domain,
  expertise_level
)
SELECT
  a.id AS agent_id,
  'Evidence-Based Medicine' AS domain_name,
  'advanced' AS proficiency_level,
  false AS is_primary_domain,
  4 AS expertise_level
FROM agents a
WHERE a.status = 'active'
  AND (
    a.department_name ILIKE '%Medical Affairs%'
    OR a.department_name ILIKE '%Clinical%'
    OR a.role_name ILIKE '%Medical%'
  )
ON CONFLICT (agent_id, domain_name) DO NOTHING;

-- Add regulatory compliance for relevant roles
INSERT INTO public.agent_knowledge_domains (
  agent_id,
  domain_name,
  proficiency_level,
  is_primary_domain,
  expertise_level
)
SELECT
  a.id AS agent_id,
  'Regulatory Compliance' AS domain_name,
  'advanced' AS proficiency_level,
  false AS is_primary_domain,
  4 AS expertise_level
FROM agents a
WHERE a.status = 'active'
  AND (
    a.department_name ILIKE '%Regulatory%'
    OR a.department_name ILIKE '%Quality%'
    OR a.department_name ILIKE '%Pharmacovigilance%'
  )
ON CONFLICT (agent_id, domain_name) DO NOTHING;

-- Add pharmaceutical science for R&D roles
INSERT INTO public.agent_knowledge_domains (
  agent_id,
  domain_name,
  proficiency_level,
  is_primary_domain,
  expertise_level
)
SELECT
  a.id AS agent_id,
  'Pharmaceutical Sciences' AS domain_name,
  'expert' AS proficiency_level,
  false AS is_primary_domain,
  5 AS expertise_level
FROM agents a
WHERE a.status = 'active'
  AND (
    a.department_name ILIKE '%Research%'
    OR a.department_name ILIKE '%Preclinical%'
    OR a.department_name ILIKE '%Drug Discovery%'
  )
ON CONFLICT (agent_id, domain_name) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check table exists
SELECT 
  table_name,
  (SELECT COUNT(*) FROM public.agent_knowledge_domains) AS total_mappings
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'agent_knowledge_domains';

-- Show distribution of knowledge domains
SELECT 
  domain_name,
  proficiency_level,
  COUNT(*) AS agent_count,
  COUNT(*) FILTER (WHERE is_primary_domain) AS primary_count
FROM public.agent_knowledge_domains
GROUP BY domain_name, proficiency_level
ORDER BY domain_name, proficiency_level;

-- Show agents with most domains
SELECT 
  a.name,
  a.role_name,
  a.department_name,
  COUNT(akd.id) AS domain_count,
  STRING_AGG(akd.domain_name, ', ') AS domains
FROM agents a
JOIN agent_knowledge_domains akd ON a.id = akd.agent_id
GROUP BY a.id, a.name, a.role_name, a.department_name
ORDER BY domain_count DESC
LIMIT 10;

