#!/usr/bin/env python3
"""
Run database migrations against Supabase PostgreSQL
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def run_migration(migration_file: str):
    """Execute a SQL migration file"""

    # Read migration file
    migration_path = f"supabase/migrations/{migration_file}"

    if not os.path.exists(migration_path):
        print(f"❌ Migration file not found: {migration_path}")
        return False

    print(f"\n{'='*80}")
    print(f"Running migration: {migration_file}")
    print(f"{'='*80}")

    with open(migration_path, 'r') as f:
        sql = f.read()

    # Get database URL
    supabase_url = os.getenv('SUPABASE_URL')
    # Extract project ID from URL (format: https://PROJECT_ID.supabase.co)
    project_id = supabase_url.split('//')[1].split('.')[0]

    # Construct PostgreSQL connection string
    # Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
    db_password = os.getenv('SUPABASE_DB_PASSWORD') or os.getenv('POSTGRES_PASSWORD')

    if not db_password:
        print("❌ Database password not found in environment")
        print("   Please set SUPABASE_DB_PASSWORD or POSTGRES_PASSWORD in .env")
        return False

    connection_string = f"postgresql://postgres.{project_id}:{db_password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

    try:
        import psycopg2

        print(f"Connecting to database...")
        conn = psycopg2.connect(connection_string)
        conn.autocommit = False

        cur = conn.cursor()

        print(f"Executing SQL ({len(sql)} characters)...")
        cur.execute(sql)

        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ Migration {migration_file} completed successfully!")
        return True

    except ImportError:
        print(f"❌ psycopg2 not installed. Installing...")
        os.system("pip3 install psycopg2-binary")
        print("Please run the migration again.")
        return False

    except Exception as e:
        print(f"❌ Migration {migration_file} failed:")
        print(f"   Error: {str(e)}")

        if 'conn' in locals():
            conn.rollback()
            conn.close()

        return False

def main():
    """Main execution"""

    # Check for migration argument
    if len(sys.argv) < 2:
        print("Usage: python3 run_migration.py <migration_number>")
        print("Example: python3 run_migration.py 002")
        sys.exit(1)

    migration_num = sys.argv[1]

    # Find migration file
    migration_files = [
        f for f in os.listdir('supabase/migrations')
        if f.startswith(f"{migration_num}_") and f.endswith('.sql')
    ]

    if not migration_files:
        print(f"❌ No migration file found starting with {migration_num}_")
        sys.exit(1)

    migration_file = migration_files[0]

    # Run migration
    success = run_migration(migration_file)

    if success:
        print(f"\n{'='*80}")
        print(f"✅ SUCCESS: Migration {migration_file} completed")
        print(f"{'='*80}")
        sys.exit(0)
    else:
        print(f"\n{'='*80}")
        print(f"❌ FAILED: Migration {migration_file} did not complete")
        print(f"{'='*80}")
        sys.exit(1)

if __name__ == '__main__':
    main()
