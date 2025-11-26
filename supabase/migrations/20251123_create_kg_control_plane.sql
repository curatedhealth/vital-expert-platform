-- ============================================================================
-- Migration: Create Knowledge Graph Control-Plane Tables
-- Date: 2025-11-23
-- Purpose: Enable agent-specific graph views and KG type registry
-- Priority: HIGH
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing tables if they exist (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.agent_kg_views CASCADE;
DROP TABLE IF EXISTS public.kg_edge_types CASCADE;
DROP TABLE IF EXISTS public.kg_node_types CASCADE;

-- ============================================================================
-- 2. KG Node Types Registry
-- ============================================================================

CREATE TABLE public.kg_node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type metadata
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'medical', 'regulatory', 'commercial'
  
  -- Schema definition
  properties JSONB DEFAULT '{}'::jsonb,
  required_properties TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. KG Edge Types Registry
-- ============================================================================

CREATE TABLE public.kg_edge_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Type metadata
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  inverse_name TEXT, -- e.g., TREATS <-> TREATED_BY
  category TEXT,
  
  -- Constraints
  allowed_source_types UUID[] DEFAULT '{}', -- references kg_node_types
  allowed_target_types UUID[] DEFAULT '{}', -- references kg_node_types
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Agent KG Views (Agent-Specific Graph Filtering)
-- ============================================================================

CREATE TABLE public.agent_kg_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent relationship
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- RAG profile relationship (optional)
  rag_profile_id UUID REFERENCES public.rag_profiles(id) ON DELETE SET NULL,
  
  -- Allowed nodes/edges
  include_node_types UUID[] DEFAULT '{}', -- references kg_node_types
  include_edge_types UUID[] DEFAULT '{}', -- references kg_edge_types
  exclude_node_types UUID[] DEFAULT '{}',
  exclude_edge_types UUID[] DEFAULT '{}',
  
  -- Traversal configuration
  max_hops INTEGER DEFAULT 3 CHECK (max_hops >= 1 AND max_hops <= 10),
  depth_strategy TEXT DEFAULT 'breadth' CHECK (depth_strategy IN ('breadth', 'depth', 'entity-centric')),
  graph_limit INTEGER DEFAULT 100 CHECK (graph_limit >= 1 AND graph_limit <= 1000),
  
  -- Advanced filters
  property_filters JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- for resolving conflicts
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_agent_rag_profile UNIQUE(agent_id, rag_profile_id)
);

-- ============================================================================
-- 5. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_kg_node_types_name ON public.kg_node_types(name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kg_node_types_category ON public.kg_node_types(category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_kg_edge_types_name ON public.kg_edge_types(name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kg_edge_types_category ON public.kg_edge_types(category) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_agent_kg_views_agent ON public.agent_kg_views(agent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_kg_views_rag_profile ON public.agent_kg_views(rag_profile_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_kg_views_priority ON public.agent_kg_views(priority DESC) WHERE is_active = true;

-- ============================================================================
-- 6. Seed Common KG Node Types
-- ============================================================================

INSERT INTO public.kg_node_types (name, description, category, properties) VALUES
  -- Medical/Clinical
  ('Drug', 'Pharmaceutical drug or medication', 'medical', '{"properties": ["name", "molecule", "class", "mechanism"]}'),
  ('Disease', 'Medical condition or disease', 'medical', '{"properties": ["name", "icd10_code", "category", "severity"]}'),
  ('Indication', 'Approved medical indication', 'medical', '{"properties": ["name", "condition", "population"]}'),
  ('Contraindication', 'Medical contraindication', 'medical', '{"properties": ["condition", "severity", "population"]}'),
  ('Guideline', 'Clinical guideline or protocol', 'medical', '{"properties": ["title", "organization", "version", "year"]}'),
  ('Publication', 'Scientific publication', 'medical', '{"properties": ["title", "authors", "journal", "year", "pmid"]}'),
  
  -- Regulatory
  ('Regulation', 'Regulatory requirement or rule', 'regulatory', '{"properties": ["title", "jurisdiction", "effective_date"]}'),
  ('Trial', 'Clinical trial', 'regulatory', '{"properties": ["nct_id", "phase", "status", "sponsor"]}'),
  ('Approval', 'Regulatory approval', 'regulatory', '{"properties": ["country", "date", "indication"]}'),
  
  -- Commercial
  ('Payer', 'Insurance payer or health plan', 'commercial', '{"properties": ["name", "type", "covered_lives", "region"]}'),
  ('Market', 'Market segment', 'commercial', '{"properties": ["name", "size", "growth_rate"]}'),
  ('Competitor', 'Competing product or company', 'commercial', '{"properties": ["name", "product", "market_share"]}'),
  
  -- Knowledge
  ('KOL', 'Key Opinion Leader', 'knowledge', '{"properties": ["name", "specialty", "institution", "h_index"]}'),
  ('Institution', 'Research or medical institution', 'knowledge', '{"properties": ["name", "type", "location", "ranking"]}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 7. Seed Common KG Edge Types
-- ============================================================================

INSERT INTO public.kg_edge_types (name, description, inverse_name, category) VALUES
  -- Medical relationships
  ('TREATS', 'Drug treats disease', 'TREATED_BY', 'medical'),
  ('INDICATED_FOR', 'Drug indicated for condition', 'HAS_INDICATION', 'medical'),
  ('CONTRAINDICATED_WITH', 'Drug contraindicated with condition', 'CONTRAINDICATES', 'medical'),
  ('INTERACTS_WITH', 'Drug interacts with drug', 'INTERACTS_WITH', 'medical'),
  ('RECOMMENDS', 'Guideline recommends treatment', 'RECOMMENDED_BY', 'medical'),
  ('SUPPORTED_BY', 'Claim supported by publication', 'SUPPORTS', 'medical'),
  
  -- Regulatory relationships
  ('REGULATES', 'Regulation regulates drug/device', 'REGULATED_BY', 'regulatory'),
  ('STUDIED_IN', 'Drug studied in trial', 'STUDIES', 'regulatory'),
  ('APPROVED_IN', 'Drug approved in jurisdiction', 'APPROVES', 'regulatory'),
  ('CITES', 'Document cites publication', 'CITED_BY', 'regulatory'),
  
  -- Commercial relationships
  ('COVERS', 'Payer covers drug', 'COVERED_BY', 'commercial'),
  ('COMPETES_WITH', 'Product competes with product', 'COMPETES_WITH', 'commercial'),
  
  -- Knowledge relationships
  ('AUTHORED_BY', 'Publication authored by KOL', 'AUTHORS', 'knowledge'),
  ('AFFILIATED_WITH', 'KOL affiliated with institution', 'EMPLOYS', 'knowledge'),
  ('RESEARCHES', 'KOL researches disease', 'RESEARCHED_BY', 'knowledge')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE public.kg_node_types IS 'Registry of allowed knowledge graph node types';
COMMENT ON TABLE public.kg_edge_types IS 'Registry of allowed knowledge graph edge types';
COMMENT ON TABLE public.agent_kg_views IS 'Agent-specific graph views for security and precision';

COMMENT ON COLUMN public.agent_kg_views.include_node_types IS 'Array of kg_node_types UUIDs that agent can access';
COMMENT ON COLUMN public.agent_kg_views.include_edge_types IS 'Array of kg_edge_types UUIDs that agent can traverse';
COMMENT ON COLUMN public.agent_kg_views.max_hops IS 'Maximum traversal depth (1-10)';
COMMENT ON COLUMN public.agent_kg_views.depth_strategy IS 'Graph traversal strategy: breadth-first, depth-first, or entity-centric';

COMMIT;

-- Verification
SELECT 'kg_node_types' AS table_name, COUNT(*) AS row_count FROM public.kg_node_types
UNION ALL
SELECT 'kg_edge_types', COUNT(*) FROM public.kg_edge_types
UNION ALL
SELECT 'agent_kg_views', COUNT(*) FROM public.agent_kg_views;

