#!/usr/bin/env python3
"""
Run Gold Standard Agent Fields Migration

Applies migration 002_add_gold_standard_agent_fields.sql to add:
- tier (1-5 hierarchy)
- capabilities (text array)
- domain_expertise (text array)
- specialization (text)
- tools (text array)
- model (text)
- embedding (vector 3072 dimensions)

Plus indexes, constraints, views, and validation triggers.
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Read migration SQL
migration_file = "supabase/migrations/002_add_gold_standard_agent_fields.sql"

if not os.path.exists(migration_file):
    print(f"❌ Migration file not found: {migration_file}")
    sys.exit(1)

with open(migration_file, 'r') as f:
    migration_sql = f.read()

print("="*80)
print("Gold Standard Agent Fields Migration")
print("="*80)
print(f"\nDatabase: {SUPABASE_URL}")
print(f"Migration: {migration_file}")
print(f"Size: {len(migration_sql)} characters")

# Confirm execution
print("\n⚠️  This will modify the agents table schema.")
print("   - Add columns: tier, capabilities, domain_expertise, specialization, tools, model, embedding")
print("   - Create indexes for performance")
print("   - Add constraints for data quality")
print("   - Create validation triggers")
print("   - Create helper views")

response = input("\nProceed with migration? (yes/no): ")

if response.lower() not in ['yes', 'y']:
    print("❌ Migration cancelled")
    sys.exit(0)

print("\n" + "="*80)
print("Executing Migration...")
print("="*80)

try:
    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Execute migration using raw SQL
    # Note: Supabase Python client doesn't have direct SQL execution,
    # so we'll use the PostgREST API to execute via a function
    # or use psycopg2 for direct connection

    # Alternative: Use psycopg2 for direct SQL execution
    import psycopg2
    from urllib.parse import urlparse

    # Parse DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        sys.exit(1)

    # Connect directly to PostgreSQL
    print("\n1. Connecting to PostgreSQL...")
    conn = psycopg2.connect(database_url)
    conn.autocommit = False  # Use transaction
    cursor = conn.cursor()

    print("✅ Connected")

    # Execute migration
    print("\n2. Executing migration SQL...")
    cursor.execute(migration_sql)

    print("✅ Migration SQL executed")

    # Verify columns were added
    print("\n3. Verifying new columns...")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'agents'
        AND column_name IN ('tier', 'capabilities', 'domain_expertise', 'specialization', 'tools', 'model', 'embedding')
        ORDER BY column_name;
    """)

    columns = cursor.fetchall()

    if columns:
        print(f"✅ Found {len(columns)} new columns:")
        for col_name, data_type, nullable in columns:
            print(f"   - {col_name} ({data_type}, nullable={nullable})")
    else:
        print("⚠️  Warning: Could not verify columns (may be a permissions issue)")

    # Verify indexes
    print("\n4. Verifying indexes...")
    cursor.execute("""
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'agents'
        AND indexname LIKE '%tier%' OR indexname LIKE '%capabilities%' OR indexname LIKE '%domain%' OR indexname LIKE '%embedding%'
        ORDER BY indexname;
    """)

    indexes = cursor.fetchall()

    if indexes:
        print(f"✅ Found {len(indexes)} new indexes:")
        for idx in indexes:
            print(f"   - {idx[0]}")
    else:
        print("⚠️  Warning: Could not verify indexes")

    # Verify views
    print("\n5. Verifying views...")
    cursor.execute("""
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name IN ('gold_standard_agents', 'agent_tier_distribution')
        ORDER BY table_name;
    """)

    views = cursor.fetchall()

    if views:
        print(f"✅ Found {len(views)} new views:")
        for view in views:
            print(f"   - {view[0]}")

    # Commit transaction
    print("\n6. Committing transaction...")
    conn.commit()
    print("✅ Transaction committed")

    # Close connection
    cursor.close()
    conn.close()

    print("\n" + "="*80)
    print("✅ MIGRATION SUCCESSFUL!")
    print("="*80)

    print("\nNew capabilities:")
    print("  - Agents table now supports 5-level tier hierarchy")
    print("  - Capabilities and domain_expertise arrays for better search")
    print("  - Vector embeddings (3072 dimensions) for GraphRAG")
    print("  - Gold standard validation constraints")
    print("  - Performance indexes on all new fields")
    print("  - Helper views for monitoring agent quality")

    print("\nNext steps:")
    print("  1. Run enhancement tool to upgrade agents:")
    print("     python3 scripts/enhance_agent_library.py --dry-run")
    print("  2. Execute enhancement (creates 5 Master Agents + enhances 319 Expert Agents):")
    print("     python3 scripts/enhance_agent_library.py")
    print("  3. Verify results:")
    print("     python3 scripts/enhance_agent_library.py --validate-only")

except psycopg2.Error as e:
    print(f"\n❌ Database error: {e}")
    if 'conn' in locals():
        conn.rollback()
        print("⚠️  Transaction rolled back")
    sys.exit(1)

except ImportError:
    print("\n❌ psycopg2 not installed")
    print("Install with: pip3 install psycopg2-binary")
    sys.exit(1)

except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    if 'conn' in locals():
        conn.rollback()
        print("⚠️  Transaction rolled back")
    sys.exit(1)
