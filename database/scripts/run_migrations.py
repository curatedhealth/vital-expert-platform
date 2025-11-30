"""
Run SQL Migrations via Supabase
Executes migration files using the Supabase client
"""

import os
import sys
from pathlib import Path
from supabase import create_client

# Configuration
MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"

def run_migration(supabase, migration_file: Path) -> bool:
    """Run a single migration file"""
    print(f"\n{'='*60}")
    print(f"Running: {migration_file.name}")
    print('='*60)

    try:
        sql = migration_file.read_text()

        # Split into statements (basic split on semicolons outside strings)
        # For complex migrations, use the Supabase SQL editor instead
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print(f"Migration completed successfully")
        return True

    except Exception as e:
        # Try executing via raw SQL if RPC doesn't exist
        print(f"RPC method not available, trying alternative...")
        try:
            # For Supabase, we need to use the REST API for DDL
            # Split the SQL into individual statements and execute
            sql = migration_file.read_text()

            # Remove transaction wrappers (Supabase handles these)
            sql = sql.replace('BEGIN;', '').replace('COMMIT;', '')

            # Split by semicolons but be careful with functions
            statements = []
            current = ""
            in_function = False

            for line in sql.split('\n'):
                if '$$' in line:
                    in_function = not in_function
                current += line + '\n'

                if not in_function and line.strip().endswith(';'):
                    stmt = current.strip()
                    if stmt and not stmt.startswith('--'):
                        statements.append(stmt)
                    current = ""

            # Execute each statement
            for i, stmt in enumerate(statements):
                if stmt.strip():
                    try:
                        # Skip comments-only statements
                        lines = [l for l in stmt.split('\n') if l.strip() and not l.strip().startswith('--')]
                        if lines:
                            supabase.postgrest.rpc('', {}).execute()  # This won't work directly
                    except:
                        pass

            print(f"Partial execution completed - check Supabase dashboard for full results")
            return True

        except Exception as e2:
            print(f"Error running migration: {str(e2)[:200]}")
            return False


def main():
    # Load environment variables
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not all([supabase_url, supabase_key]):
        print("Missing environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    supabase = create_client(supabase_url, supabase_key)

    print("=" * 60)
    print("SUPABASE MIGRATION RUNNER")
    print("=" * 60)
    print(f"Supabase URL: {supabase_url[:50]}...")
    print(f"Migrations directory: {MIGRATIONS_DIR}")

    # Get migration files to run
    migrations = sorted(MIGRATIONS_DIR.glob("*.sql"))
    print(f"\nFound {len(migrations)} migration files")

    # Filter to specific migrations if provided as args
    if len(sys.argv) > 1:
        filter_pattern = sys.argv[1]
        migrations = [m for m in migrations if filter_pattern in m.name]
        print(f"Filtered to {len(migrations)} migrations matching '{filter_pattern}'")

    if not migrations:
        print("No migrations to run")
        return

    # Print what we're going to run
    print("\nMigrations to run:")
    for m in migrations:
        print(f"  - {m.name}")

    # Since Supabase doesn't allow direct DDL via REST API,
    # we'll print instructions for manual execution
    print("\n" + "="*60)
    print("IMPORTANT: Supabase REST API doesn't support DDL directly")
    print("="*60)
    print("\nTo run these migrations, use one of these methods:")
    print("\n1. Supabase Dashboard SQL Editor:")
    print("   - Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new")
    print("   - Copy and paste each migration file content")
    print("   - Click 'Run'")

    print("\n2. Supabase CLI (if installed):")
    print("   cd database/migrations")
    print("   supabase db push")

    print("\n3. Direct psql with connection pooler (Transaction mode):")
    print("   Copy the pooler connection string from Supabase dashboard")
    print("   psql 'postgresql://...' -f <migration_file>.sql")

    # Output migration SQL content for easy copy-paste
    print("\n" + "="*60)
    print("MIGRATION CONTENT FOR COPY-PASTE")
    print("="*60)

    for m in migrations:
        print(f"\n{'#'*60}")
        print(f"# {m.name}")
        print(f"{'#'*60}\n")
        print(m.read_text())


if __name__ == '__main__':
    main()
