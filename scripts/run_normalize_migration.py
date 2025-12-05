#!/usr/bin/env python3
"""
Run the normalize agent metadata migration via Supabase SQL execution.
This script connects via the REST API and executes SQL statements.
"""

import os
from supabase import create_client
from pathlib import Path

# Supabase credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://bomltkhixeatxuoxmolq.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q")

def run_migration():
    """Run the normalization migration step by step using RPC."""
    print("=" * 60)
    print("Normalize Agent Metadata Migration")
    print("=" * 60)

    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Step 1: Check current state
    print("\n1. Checking current agent metadata...")
    result = client.table("agents").select("id,name,metadata").limit(3).execute()
    for agent in result.data:
        print(f"   - {agent['name']}: {agent.get('metadata', {})}")

    # Step 2: Create the function via RPC if it exists, or use raw SQL
    print("\n2. Adding columns via RPC (if execute_sql function exists)...")

    # Try to call a custom RPC function or check if columns already exist
    try:
        # Check if columns already exist by querying them
        test_result = client.table("agents").select("rag_enabled").limit(1).execute()
        print("   - Columns already exist!")
        return True
    except Exception as e:
        if "does not exist" in str(e):
            print("   - Columns need to be added")
        else:
            print(f"   - Error: {e}")

    # The migration SQL needs to be run through Supabase Studio SQL Editor
    # since REST API doesn't support DDL operations directly
    print("\n" + "=" * 60)
    print("MANUAL STEP REQUIRED")
    print("=" * 60)
    print("""
The REST API cannot execute DDL (ALTER TABLE) statements directly.
Please run the migration SQL in Supabase Studio:

1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql
2. Open file: supabase/migrations/20251205_normalize_agent_metadata.sql
3. Copy and paste the SQL into the editor
4. Click 'Run' to execute

After running the migration, the following columns will be added to agents:
- rag_enabled (boolean)
- websearch_enabled (boolean)
- tools_enabled (text[])
- knowledge_namespaces (text[])
- confidence_threshold (numeric)
- max_goal_iterations (integer)
- hitl_enabled (boolean)
- hitl_safety_level (text)
""")

    return False

if __name__ == "__main__":
    run_migration()
