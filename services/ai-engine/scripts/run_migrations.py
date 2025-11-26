#!/usr/bin/env python3
"""
Execute SQL migrations via Supabase PostgREST
"""
import os
import sys
from supabase import create_client

# Load environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://bomltkhixeatxuoxmolq.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_KEY:
    print("❌ SUPABASE_SERVICE_KEY not set")
    sys.exit(1)

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🚀 Executing migrations...")

# Migration 1: Create agent_knowledge_domains table
print("\n📋 Migration 1: Creating agent_knowledge_domains table...")
migration1_sql = """
CREATE TABLE IF NOT EXISTS public.agent_knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_primary_domain BOOLEAN DEFAULT false,
  expertise_level INTEGER DEFAULT 3 CHECK (expertise_level >= 1 AND expertise_level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, domain_name)
);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_agent_id ON public.agent_knowledge_domains(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_domain_name ON public.agent_knowledge_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_domains_proficiency ON public.agent_knowledge_domains(proficiency_level);
"""

try:
    # Check if table exists
    result = supabase.table("agent_knowledge_domains").select("id").limit(1).execute()
    print("✅ Table already exists, skipping creation")
except Exception as e:
    if "Could not find" in str(e) or "does not exist" in str(e):
        print("⚠️ Table doesn't exist via PostgREST API")
        print("ℹ️  Please run the migration manually via Supabase Dashboard SQL Editor")
        print(f"    File: supabase/migrations/20251123_create_agent_knowledge_domains.sql")
    else:
        print(f"❌ Error: {e}")

# Migration 2: Check agent_tools count
print("\n📋 Checking agent_tools table...")
try:
    result = supabase.table("agent_tools").select("id", count="exact").execute()
    count = result.count if hasattr(result, 'count') else len(result.data)
    print(f"ℹ️  Current agent_tools count: {count}")
    
    if count == 0:
        print("⚠️ agent_tools table is empty")
        print("ℹ️  Please run the migration manually via Supabase Dashboard SQL Editor")
        print(f"    File: supabase/migrations/20251123_populate_agent_tools.sql")
except Exception as e:
    print(f"❌ Error checking agent_tools: {e}")

print("\n" + "="*60)
print("📝 Manual Execution Required")
print("="*60)
print("\n🔗 Go to: https://supabase.com/dashboard")
print("\n📂 Navigate to: SQL Editor")
print("\n📄 Run these files in order:")
print("   1. supabase/migrations/20251123_create_agent_knowledge_domains.sql")
print("   2. supabase/migrations/20251123_populate_agent_tools.sql")
print("\n✅ After completion, re-run:")
print("   - Neo4j loading: ./services/ai-engine/scripts/load_neo4j.sh --clear-existing")
print("   - Pinecone loading: ./services/ai-engine/scripts/load_pinecone.sh")

