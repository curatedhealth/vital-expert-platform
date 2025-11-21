#!/usr/bin/env node
/**
 * Create knowledge_domains table in Supabase
 * Run: node scripts/create-knowledge-domains-table-supabase.js
 */

const CREATE_TABLE_SQL = `
-- Create knowledge_domains table
CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 1,
  keywords TEXT[] DEFAULT '{}',
  sub_domains TEXT[] DEFAULT '{}',
  agent_count_estimate INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'book',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  recommended_models JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);

-- Enable RLS
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Allow service role all" ON public.knowledge_domains;

-- Create policies
CREATE POLICY "Allow public read"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role all"
  ON public.knowledge_domains
  FOR ALL
  USING (auth.role() = 'service_role');
`;

console.log('═══════════════════════════════════════════════════════════════');
console.log('CREATE knowledge_domains TABLE SQL');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('Copy the SQL below and run it in your Supabase SQL Editor:');
console.log('https://app.supabase.com/project/_/sql/new\n');
console.log('OR run it locally via:');
console.log('docker exec -i $(docker ps -q -f name=supabase-db) psql -U postgres -d postgres\n');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(CREATE_TABLE_SQL);
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('After creating the table, run:');
console.log('  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \\');
console.log('  SUPABASE_SERVICE_ROLE_KEY=<your-key> \\');
console.log('  node scripts/seed-knowledge-domains.js');
console.log('═══════════════════════════════════════════════════════════════\n');
