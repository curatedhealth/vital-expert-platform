#!/usr/bin/env python3

"""
Apply Unified Prompts Migration via Supabase REST API
"""

import os
import requests
import json

def main():
    print("🚀 Applying Unified Prompts Migration via Supabase REST API\n")

    # Load environment variables
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        with open('.env.local', 'r') as f:
            for line in f:
                if 'NEXT_PUBLIC_SUPABASE_URL' in line:
                    supabase_url = line.split('=')[1].strip()
                elif 'SUPABASE_SERVICE_ROLE_KEY' in line:
                    supabase_key = line.split('=')[1].strip()
                elif 'NEXT_PUBLIC_SUPABASE_ANON_KEY' in line and not supabase_key:
                    supabase_key = line.split('=')[1].strip()

    if not supabase_url:
        print("❌ Error: NEXT_PUBLIC_SUPABASE_URL not found")
        return

    if not supabase_key:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found")
        return

    print(f"📡 Supabase URL: {supabase_url}")
    print(f"🔑 Using API key: {supabase_key[:20]}...\n")

    # Read migration SQL
    migration_path = 'supabase/migrations/20251110120000_unified_prompts_schema.sql'
    print(f"📄 Reading migration: {migration_path}")

    with open(migration_path, 'r') as f:
        sql = f.read()

    print(f"📊 Migration size: {len(sql)} bytes\n")

    # Check current state
    print("🔍 Checking current database state...")

    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }

    # Check prompts table
    response = requests.get(
        f'{supabase_url}/rest/v1/prompts',
        headers={**headers, 'Prefer': 'count=exact'},
        params={'select': 'id', 'limit': 0}
    )

    if response.status_code == 200:
        prompts_count = int(response.headers.get('Content-Range', '0-0/0').split('/')[1])
        print(f"  - prompts table: {prompts_count} records")
    else:
        print(f"  - prompts table: Not found or error (will be created)")

    # Check prompt_suites table
    response = requests.get(
        f'{supabase_url}/rest/v1/prompt_suites',
        headers={**headers, 'Prefer': 'count=exact'},
        params={'select': 'id', 'limit': 0}
    )

    if response.status_code == 200:
        suites_count = int(response.headers.get('Content-Range', '0-0/0').split('/')[1])
        print(f"  - prompt_suites table: {suites_count} records\n")
    else:
        print(f"  - prompt_suites table: Not found or error (will be created)\n")

    # Instructions for manual migration
    print("=" * 70)
    print("⚠️  MANUAL MIGRATION REQUIRED")
    print("=" * 70)
    print("\nSupabase REST API doesn't support raw SQL execution.")
    print("Please apply the migration using the Supabase Dashboard:\n")

    print("📋 STEPS:")
    print("  1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk")
    print("  2. Click on 'SQL Editor' in the left sidebar")
    print("  3. Click 'New Query'")
    print("  4. Copy the entire SQL from:")
    print(f"     {os.path.abspath(migration_path)}")
    print("  5. Paste it into the SQL editor")
    print("  6. Click 'Run' (or press Cmd+Enter)")
    print("  7. Wait for completion (should see success messages)\n")

    print("💡 TIP: You can also copy the file contents now:")
    print(f"   cat '{migration_path}' | pbcopy")
    print("   (This copies the SQL to your clipboard)\n")

    print("✅ After running the migration, refresh your browser at:")
    print("   http://localhost:3000/prism")
    print("\nYou should see:")
    print("  - Total Prompts: ~3,922")
    print("  - Prompt Suites: 10")
    print("  - Sub-Suites: Various\n")

if __name__ == '__main__':
    main()
