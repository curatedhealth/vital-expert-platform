-- Create knowledge_domains table for RAG system
-- This table stores the 30 knowledge domain categories that organize RAG knowledge bases

CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1, -- 1=Core, 2=Specialized, 3=Emerging
  priority INTEGER NOT NULL DEFAULT 1, -- Display/sorting priority (1-30)
  keywords TEXT[] DEFAULT '{}', -- Search keywords for matching
  sub_domains TEXT[] DEFAULT '{}', -- Sub-domain categories
  agent_count_estimate INTEGER DEFAULT 0, -- Estimated number of agents using this domain
  color TEXT DEFAULT '#3B82F6', -- UI color code
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_code ON public.knowledge_domains(code);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_keywords ON public.knowledge_domains USING GIN(keywords);

-- Enable RLS (Row Level Security)
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

-- Create policy for service role to insert/update
CREATE POLICY "Allow service role to manage knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment to table
COMMENT ON TABLE public.knowledge_domains IS 'Knowledge domain categories for organizing RAG knowledge bases and agent capabilities';

-- Add comments to columns
COMMENT ON COLUMN public.knowledge_domains.code IS 'Unique code identifier (e.g., REG_AFFAIRS, CLIN_DEV)';
COMMENT ON COLUMN public.knowledge_domains.name IS 'Human-readable domain name (e.g., Regulatory Affairs)';
COMMENT ON COLUMN public.knowledge_domains.slug IS 'URL-friendly slug (e.g., regulatory_affairs)';
COMMENT ON COLUMN public.knowledge_domains.tier IS 'Domain tier: 1=Core (must have), 2=Specialized (high value), 3=Emerging (future)';
COMMENT ON COLUMN public.knowledge_domains.priority IS 'Display priority from 1-30 for sorting';
COMMENT ON COLUMN public.knowledge_domains.keywords IS 'Search keywords for domain matching';
COMMENT ON COLUMN public.knowledge_domains.sub_domains IS 'Sub-domain categories within this domain';
COMMENT ON COLUMN public.knowledge_domains.agent_count_estimate IS 'Estimated number of agents using this domain';
COMMENT ON COLUMN public.knowledge_domains.color IS 'UI color code for visual representation';
