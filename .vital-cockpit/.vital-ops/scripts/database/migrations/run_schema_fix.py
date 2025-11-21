#!/usr/bin/env python3
"""
Run schema fix migration
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 80)
print("RUNNING SCHEMA FIX MIGRATION")
print("=" * 80)

# Read the migration SQL
with open('supabase/migrations/008_fix_prompt_constraints.sql', 'r') as f:
    sql = f.read()

print("\nExecuting migration...")

try:
    import psycopg2

    # Get database URL
    supabase_url = os.getenv('SUPABASE_URL')
    project_id = supabase_url.split('//')[1].split('.')[0]
    db_password = os.getenv('SUPABASE_DB_PASSWORD') or os.getenv('POSTGRES_PASSWORD')

    if not db_password:
        print("❌ Database password not found in environment")
        print("   Set SUPABASE_DB_PASSWORD in .env file")
        exit(1)

    connection_string = f"postgresql://postgres.{project_id}:{db_password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

    print("Connecting to database...")
    conn = psycopg2.connect(connection_string)
    conn.autocommit = True

    cur = conn.cursor()

    print("Executing SQL...")
    cur.execute(sql)

    # Fetch any results
    try:
        results = cur.fetchall()
        if results:
            print("\n" + "=" * 80)
            print("RESULTS:")
            print("=" * 80)
            for row in results:
                print(row)
    except:
        pass  # No results to fetch

    cur.close()
    conn.close()

    print("\n" + "=" * 80)
    print("✅ SCHEMA FIX MIGRATION COMPLETE")
    print("=" * 80)
    print("\nConstraints have been added successfully!")
    print("\nNext step:")
    print("  python3 scripts/update_database_simple.py")

except ImportError:
    print("\n❌ psycopg2 not installed")
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.run(["pip3", "install", "psycopg2-binary"])
    print("\n✅ Installed. Please run this script again:")
    print("   python3 scripts/run_schema_fix.py")

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nAlternative: Run this SQL manually in Supabase SQL Editor:")
    print("https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new")
    print("\nCopy/paste from: supabase/migrations/008_fix_prompt_constraints.sql")
