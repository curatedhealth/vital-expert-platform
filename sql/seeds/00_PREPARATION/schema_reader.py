#!/usr/bin/env python3
"""
Schema Introspection Script
Captures the actual database schema for all persona-related tables
"""

import psycopg2
import json
import sys
from typing import Dict, List, Any

# Database connection string
DB_URL = "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

def get_table_schemas(cursor) -> Dict[str, List[Dict]]:
    """Get all persona table schemas with column information"""
    cursor.execute("""
        SELECT
            t.table_name,
            json_agg(
                json_build_object(
                    'column_name', c.column_name,
                    'ordinal_position', c.ordinal_position,
                    'data_type', c.data_type,
                    'udt_name', c.udt_name,
                    'character_maximum_length', c.character_maximum_length,
                    'numeric_precision', c.numeric_precision,
                    'numeric_scale', c.numeric_scale,
                    'is_nullable', c.is_nullable,
                    'column_default', c.column_default
                ) ORDER BY c.ordinal_position
            ) as columns
        FROM information_schema.tables t
        JOIN information_schema.columns c
            ON c.table_name = t.table_name
            AND c.table_schema = t.table_schema
        WHERE t.table_schema = 'public'
          AND t.table_name LIKE 'persona%'
        GROUP BY t.table_name
        ORDER BY t.table_name
    """)

    results = cursor.fetchall()
    return {row[0]: row[1] for row in results}

def get_check_constraints(cursor) -> List[Dict]:
    """Get all CHECK constraints for persona tables"""
    cursor.execute("""
        SELECT
            con.conname as constraint_name,
            pg_get_constraintdef(con.oid) as constraint_def,
            rel.relname as table_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE con.contype = 'c'
          AND nsp.nspname = 'public'
          AND rel.relname LIKE 'persona%'
        ORDER BY rel.relname, con.conname
    """)

    results = cursor.fetchall()
    return [
        {
            'constraint_name': row[0],
            'constraint_def': row[1],
            'table_name': row[2]
        }
        for row in results
    ]

def get_unique_constraints(cursor) -> List[Dict]:
    """Get all UNIQUE constraints for persona tables"""
    cursor.execute("""
        SELECT
            con.conname as constraint_name,
            pg_get_constraintdef(con.oid) as constraint_def,
            rel.relname as table_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE con.contype = 'u'
          AND nsp.nspname = 'public'
          AND rel.relname LIKE 'persona%'
        ORDER BY rel.relname, con.conname
    """)

    results = cursor.fetchall()
    return [
        {
            'constraint_name': row[0],
            'constraint_def': row[1],
            'table_name': row[2]
        }
        for row in results
    ]

def get_foreign_keys(cursor) -> List[Dict]:
    """Get all foreign key relationships for persona tables"""
    cursor.execute("""
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.update_rule,
            rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name LIKE 'persona%'
        ORDER BY tc.table_name, tc.constraint_name
    """)

    results = cursor.fetchall()
    return [
        {
            'constraint_name': row[0],
            'table_name': row[1],
            'column_name': row[2],
            'foreign_table_name': row[3],
            'foreign_column_name': row[4],
            'update_rule': row[5],
            'delete_rule': row[6]
        }
        for row in results
    ]

def get_enum_types(cursor) -> Dict[str, List[str]]:
    """Get all enum types and their values"""
    cursor.execute("""
        SELECT
            t.typname as enum_name,
            array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
        ORDER BY t.typname
    """)

    results = cursor.fetchall()
    return {row[0]: row[1] for row in results}

def get_table_row_counts(cursor) -> Dict[str, int]:
    """Get row counts for all persona tables"""
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name LIKE 'persona%'
        ORDER BY table_name
    """)

    tables = [row[0] for row in cursor.fetchall()]
    counts = {}

    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        counts[table] = cursor.fetchone()[0]

    return counts

def main():
    """Main execution function"""
    print("Connecting to database...")

    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()

        print("Fetching table schemas...")
        schemas = get_table_schemas(cursor)
        print(f"Found {len(schemas)} persona tables")

        print("Fetching CHECK constraints...")
        check_constraints = get_check_constraints(cursor)
        print(f"Found {len(check_constraints)} CHECK constraints")

        print("Fetching UNIQUE constraints...")
        unique_constraints = get_unique_constraints(cursor)
        print(f"Found {len(unique_constraints)} UNIQUE constraints")

        print("Fetching foreign keys...")
        foreign_keys = get_foreign_keys(cursor)
        print(f"Found {len(foreign_keys)} foreign keys")

        print("Fetching enum types...")
        enum_types = get_enum_types(cursor)
        print(f"Found {len(enum_types)} enum types")

        print("Fetching table row counts...")
        row_counts = get_table_row_counts(cursor)

        # Compile all schema information
        schema_data = {
            'tables': schemas,
            'check_constraints': check_constraints,
            'unique_constraints': unique_constraints,
            'foreign_keys': foreign_keys,
            'enum_types': enum_types,
            'row_counts': row_counts,
            'table_list': sorted(schemas.keys())
        }

        # Save to JSON file
        output_file = 'actual_schema.json'
        with open(output_file, 'w') as f:
            json.dump(schema_data, f, indent=2, default=str)

        print(f"\nSchema introspection complete!")
        print(f"Output saved to: {output_file}")
        print(f"\nSummary:")
        print(f"  Tables: {len(schemas)}")
        print(f"  CHECK constraints: {len(check_constraints)}")
        print(f"  UNIQUE constraints: {len(unique_constraints)}")
        print(f"  Foreign keys: {len(foreign_keys)}")
        print(f"  Enum types: {len(enum_types)}")
        print(f"\nTable row counts:")
        for table, count in sorted(row_counts.items()):
            print(f"  {table}: {count} rows")

        cursor.close()
        conn.close()

        return 0

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
