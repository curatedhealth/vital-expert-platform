#!/usr/bin/env python3
"""
Run Prompt Library Migration
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 80)
print("RUNNING PROMPT LIBRARY MIGRATION")
print("=" * 80)

# Read the migration SQL
migration_file = 'supabase/migrations/009_create_prompt_library_structure.sql'
print(f"\nReading migration from: {migration_file}")

with open(migration_file, 'r') as f:
    sql = f.read()

print("✅ Migration SQL loaded")
print(f"   Length: {len(sql)} characters")

print("\nExecuting migration...")

try:
    import psycopg2

    # Get database connection details
    db_password = os.getenv('SUPABASE_DB_PASSWORD')

    if not db_password:
        print("❌ Database password not found in environment")
        print("   Set SUPABASE_DB_PASSWORD in .env file")
        exit(1)

    # Direct connection to Supabase database
    connection_string = f"postgresql://postgres:{db_password}@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

    print("Connecting to database...")
    conn = psycopg2.connect(connection_string)
    conn.autocommit = True

    cur = conn.cursor()

    print("Executing migration SQL...")
    cur.execute(sql)

    print("\n" + "=" * 80)
    print("✅ PROMPT LIBRARY MIGRATION COMPLETE")
    print("=" * 80)
    print("\nTables created:")
    print("  ✅ prompt_suites")
    print("  ✅ prompt_sub_suites")
    print("  ✅ prompts")
    print("  ✅ suite_prompts")
    print("  ✅ prompt_examples")
    print("  ✅ prompt_variables")
    print("  ✅ prompt_performance")
    print("  ✅ prompt_validations")
    print("\nNext step:")
    print("  python3 scripts/populate_prompt_library.py")

    cur.close()
    conn.close()

except ImportError:
    print("\n❌ psycopg2 not installed")
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.run(["pip3", "install", "psycopg2-binary"])
    print("\n✅ Installed. Please run this script again:")
    print("   python3 scripts/run_prompt_library_migration.py")

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nAlternative: Run this SQL manually in Supabase SQL Editor:")
    print("https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new")
    print(f"\nCopy/paste from: {migration_file}")
