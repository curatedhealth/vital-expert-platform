#!/usr/bin/env python3
"""
Execute Seed Files via Supabase REST API
Since direct PostgreSQL connection times out, use REST API to execute SQL
"""

import os
import requests
from pathlib import Path

# Configuration
SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTQyNTQ5MiwiZXhwIjoyMDQ3MDAxNDkyfQ.w8YGAoJx42rFNIJ_qNR2oWHj0LTt8L0dPmaDnpUwLcI"

SEEDS_DIR = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed")

FILES_TO_EXECUTE = [
    "00_foundation_agents.sql",
    "01_foundation_personas.sql",
    "02_COMPREHENSIVE_TOOLS_ALL.sql",
    "05_COMPREHENSIVE_PROMPTS_ALL.sql",
    "06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql",
    "20_medical_affairs_personas.sql",
    "21_phase2_jtbds.sql",
    "22_digital_health_jtbds.sql",
]

def execute_sql_via_api(sql_content: str, description: str):
    """
    Execute SQL via Supabase REST API /rest/v1/rpc endpoint
    """
    print(f"\n📝 Executing: {description}")
    print(f"   SQL length: {len(sql_content)} characters")

    # Try using the PostgREST /rest/v1/rpc endpoint
    # This requires creating a stored procedure first
    # Instead, we'll use the pg_dump/restore approach via Storage API

    # Alternative: Split SQL into individual statements and execute via RPC
    statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]

    print(f"   Statements to execute: {len(statements)}")

    success_count = 0
    failed_count = 0

    for i, stmt in enumerate(statements[:5], 1):  # Test with first 5 statements
        if len(stmt) < 10:  # Skip very short statements
            continue

        print(f"   [{i}] Executing statement ({len(stmt)} chars)...")

        # Use the Supabase SQL editor API (requires admin privileges)
        # Since we can't directly execute SQL via REST API, we'll need to use psql
        # This approach won't work via REST API
        break

    return False

def main():
    print("=" * 80)
    print("🔄 Seed File Execution via REST API")
    print("=" * 80)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Seeds directory: {SEEDS_DIR}")
    print()

    print("⚠️  NOTE: Supabase REST API doesn't support direct SQL execution")
    print("⚠️  We need to use psql or Supabase Studio's SQL editor")
    print()
    print("Attempting alternative approach...")
    print()

    # Alternative: Save SQL content and display instructions
    for filename in FILES_TO_EXECUTE:
        filepath = SEEDS_DIR / filename
        if not filepath.exists():
            print(f"❌ {filename} - NOT FOUND")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        print(f"✅ {filename} - Ready ({len(content)} chars, ~{len(content.split(';'))} statements)")

    print()
    print("=" * 80)
    print("💡 RECOMMENDED APPROACH")
    print("=" * 80)
    print()
    print("Since direct PostgreSQL connection times out and REST API doesn't")
    print("support SQL execution, please use ONE of these methods:")
    print()
    print("METHOD 1: Supabase Studio SQL Editor")
    print("-" * 80)
    print(f"1. Go to: {SUPABASE_URL}/project/_/sql")
    print("2. Copy/paste each SQL file content")
    print("3. Click 'Run' to execute")
    print()
    print("METHOD 2: Local psql with retry")
    print("-" * 80)
    print("Run this command with retries:")
    print()
    print(f"cd {SEEDS_DIR}")
    print("for file in *.sql; do")
    print("  echo \"Executing $file...\"")
    print("  for i in {1..5}; do")
    print("    if PGPASSWORD='flusd9fqEb4kkTJ1' psql \\")
    print("      postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \\")
    print("      -c \"\\set ON_ERROR_STOP on\" -f \"$file\" 2>&1; then")
    print("      echo \"✅ Success\"")
    print("      break")
    print("    else")
    print("      echo \"⚠️  Retry $i/5...\"")
    print("      sleep 3")
    print("    fi")
    print("  done")
    print("done")
    print()

if __name__ == "__main__":
    main()
