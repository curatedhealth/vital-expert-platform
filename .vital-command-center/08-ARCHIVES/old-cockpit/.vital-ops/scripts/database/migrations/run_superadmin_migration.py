#!/usr/bin/env python3
"""
Run the superadmin role migration
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

def run_migration():
    print("=" * 70)
    print("🔐 RUNNING SUPERADMIN ROLE MIGRATION")
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
    supabase_url = os.getenv('NEW_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')

    if not supabase_url:
        print("❌ Missing SUPABASE_URL")
        sys.exit(1)

    # Extract project ID from URL
    project_id = supabase_url.split('//')[1].split('.')[0]
    print(f"🌐 Project ID: {project_id}")

    # Get database password
    db_password = os.getenv('NEW_SUPABASE_DB_PASSWORD') or os.getenv('SUPABASE_DB_PASSWORD') or os.getenv('POSTGRES_PASSWORD')

    if not db_password:
        print("❌ Database password not found")
        print("   Please set NEW_SUPABASE_DB_PASSWORD, SUPABASE_DB_PASSWORD or POSTGRES_PASSWORD in .env")
        sys.exit(1)

    print(f"🔑 Database password found: {db_password[:4]}***")

    # Construct connection string for direct connection
    connection_string = f"postgresql://postgres:{db_password}@db.{project_id}.supabase.co:5432/postgres"

    print("🔄 Connecting to database...")

    try:
        import psycopg2
    except ImportError:
        print("📦 Installing psycopg2-binary...")
        os.system("pip3 install psycopg2-binary")
        import psycopg2

    try:
        conn = psycopg2.connect(connection_string)
        conn.autocommit = True  # Set to True for DO blocks and administrative commands

        cur = conn.cursor()

        print(f"✅ Connected to database")
        print(f"🔄 Executing migration SQL...")

        # Execute SQL
        cur.execute(sql)

        # Fetch any results
        try:
            results = cur.fetchall()
            if results:
                print("\n📊 Migration Results:")
                for row in results:
                    print(f"   {row}")
        except:
            pass

        cur.close()
        conn.close()

        print("\n" + "=" * 70)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\n🔄 Now run the setup_hicham_superadmin.py script")
        print("   to assign superadmin role to hicham.naim@curated.health")
        print("=" * 70)

        return True

    except Exception as e:
        print(f"\n❌ Migration failed:")
        print(f"   Error: {str(e)}")

        if 'conn' in locals():
            try:
                conn.close()
            except:
                pass

        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    run_migration()
