#!/usr/bin/env python3
"""
Run the superadmin role migration via Supabase Management API
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('apps/digital-health-startup/.env.local')

def run_migration():
    print("=" * 70)
    print("🔐 RUNNING SUPERADMIN ROLE MIGRATION VIA API")
    print("=" * 70)

    # Read SQL file
    sql_file = "database/sql/migrations/2025/20251027000002_create_superadmin_role.sql"

    if not os.path.exists(sql_file):
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)

    print(f"📄 Reading SQL from: {sql_file}")
    with open(sql_file, 'r') as f:
        sql = f.read()

    print(f"📊 SQL file size: {len(sql)} characters")

    # Get connection details
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not service_role_key:
        print("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    print(f"🌐 Supabase URL: {supabase_url}")

    # Use PostgREST's /rpc endpoint to execute SQL
    # Note: We'll use the service role key to execute this
    print("🔄 Executing SQL via Supabase REST API...")

    # Split SQL into individual statements
    statements = []
    current_statement = []
    in_do_block = False

    for line in sql.split('\n'):
        line_strip = line.strip()

        # Track DO $$ blocks
        if line_strip.startswith('DO $$'):
            in_do_block = True

        current_statement.append(line)

        # End of DO block
        if in_do_block and line_strip.endswith('$$;'):
            statements.append('\n'.join(current_statement))
            current_statement = []
            in_do_block = False
        # Regular statement end
        elif not in_do_block and line_strip.endswith(';') and not line_strip.startswith('--'):
            statements.append('\n'.join(current_statement))
            current_statement = []

    if current_statement:
        statements.append('\n'.join(current_statement))

    print(f"📊 Split into {len(statements)} SQL statement(s)")

    # Use the /rest/v1/rpc endpoint if available, or execute raw SQL via a function
    # Actually, let's just use the service role to execute this via PostgREST

    # Create a temporary SQL file for manual execution
    temp_sql_path = "/tmp/superadmin_migration.sql"
    with open(temp_sql_path, 'w') as f:
        f.write(sql)

    print("\n" + "=" * 70)
    print("⚠️  MANUAL MIGRATION REQUIRED")
    print("=" * 70)
    print("\nThe SQL migration needs to be run manually in the Supabase Dashboard:")
    print("\n1. Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new")
    print(f"\n2. Copy the SQL from: {temp_sql_path}")
    print("\n3. Or copy from: database/sql/migrations/2025/20251027000002_create_superadmin_role.sql")
    print("\n4. Paste it into the SQL editor and click 'Run'")
    print("\n5. After the migration completes, run the setup_hicham_superadmin.py script")
    print("\nAlternatively, you can add SUPABASE_DB_PASSWORD to apps/digital-health-startup/.env.local")
    print("and run scripts/database/migrations/run_superadmin_migration.py again")
    print("=" * 70)

    print(f"\n✅ SQL file ready at: {temp_sql_path}")
    print(f"📋 Now opening the SQL in the terminal for easy copying...\n")

    print("=" * 70)
    print("SQL MIGRATION CONTENT (copy everything below):")
    print("=" * 70)
    print(sql)
    print("=" * 70)

if __name__ == '__main__':
    run_migration()
