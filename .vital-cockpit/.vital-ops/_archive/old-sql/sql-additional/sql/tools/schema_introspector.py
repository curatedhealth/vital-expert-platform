#!/usr/bin/env python3
"""
Schema Introspection Tool for VITAL Platform
============================================
Automatically introspects deployed database schema and generates
mapping configurations for data transformation pipelines.

Author: VITAL Platform Orchestrator
Date: 2025-11-17
Version: 1.0.0
"""

import json
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import os
import sys

@dataclass
class ColumnInfo:
    """Represents database column metadata"""
    column_name: str
    data_type: str
    is_nullable: bool
    column_default: Optional[str]
    character_maximum_length: Optional[int]
    numeric_precision: Optional[int]
    numeric_scale: Optional[int]
    is_primary_key: bool = False
    is_foreign_key: bool = False
    foreign_table: Optional[str] = None
    foreign_column: Optional[str] = None
    check_constraints: List[str] = None
    enum_values: List[str] = None

@dataclass
class TableInfo:
    """Represents database table metadata"""
    table_name: str
    columns: List[ColumnInfo]
    primary_keys: List[str]
    foreign_keys: Dict[str, Tuple[str, str]]  # column -> (ref_table, ref_column)
    unique_constraints: List[List[str]]
    check_constraints: Dict[str, str]  # constraint_name -> check_clause
    indexes: List[str]
    has_rls: bool = False

class SchemaIntrospector:
    """
    Introspects PostgreSQL/Supabase schema and generates mapping configurations
    """

    def __init__(self, connection_string: str):
        """Initialize with database connection string"""
        self.connection_string = connection_string
        self.conn = None
        self.cursor = None

    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(self.connection_string)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("✅ Connected to database")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            raise

    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✅ Disconnected from database")

    def get_table_columns(self, table_name: str, schema: str = 'public') -> List[ColumnInfo]:
        """Get all columns for a specific table"""
        query = """
        SELECT
            c.column_name,
            c.data_type,
            c.is_nullable::boolean,
            c.column_default,
            c.character_maximum_length,
            c.numeric_precision,
            c.numeric_scale,
            c.udt_name,
            -- Check if column is part of primary key
            EXISTS(
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = c.table_schema
                    AND tc.table_name = c.table_name
                    AND kcu.column_name = c.column_name
                    AND tc.constraint_type = 'PRIMARY KEY'
            ) as is_primary_key,
            -- Get foreign key info if exists
            fk.foreign_table_name,
            fk.foreign_column_name
        FROM information_schema.columns c
        LEFT JOIN (
            SELECT
                kcu.table_schema,
                kcu.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
        ) fk ON fk.table_schema = c.table_schema
            AND fk.table_name = c.table_name
            AND fk.column_name = c.column_name
        WHERE c.table_schema = %s AND c.table_name = %s
        ORDER BY c.ordinal_position;
        """

        self.cursor.execute(query, (schema, table_name))
        rows = self.cursor.fetchall()

        columns = []
        for row in rows:
            col = ColumnInfo(
                column_name=row['column_name'],
                data_type=row['data_type'].upper(),
                is_nullable=(row['is_nullable'] == 'YES'),
                column_default=row['column_default'],
                character_maximum_length=row['character_maximum_length'],
                numeric_precision=row['numeric_precision'],
                numeric_scale=row['numeric_scale'],
                is_primary_key=row['is_primary_key'],
                is_foreign_key=bool(row['foreign_table_name']),
                foreign_table=row['foreign_table_name'],
                foreign_column=row['foreign_column_name']
            )

            # Get CHECK constraints for this column
            col.check_constraints = self.get_column_check_constraints(
                table_name, col.column_name, schema
            )

            # Extract enum values from CHECK constraints if present
            col.enum_values = self.extract_enum_values(col.check_constraints)

            columns.append(col)

        return columns

    def get_column_check_constraints(self, table_name: str, column_name: str,
                                    schema: str = 'public') -> List[str]:
        """Get CHECK constraints for a specific column"""
        query = """
        SELECT pg_get_constraintdef(c.oid) as check_clause
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = %s
            AND t.relname = %s
            AND c.contype = 'c'
            AND pg_get_constraintdef(c.oid) LIKE %s;
        """

        like_pattern = f'%{column_name}%'
        self.cursor.execute(query, (schema, table_name, like_pattern))

        constraints = []
        for row in self.cursor.fetchall():
            constraints.append(row['check_clause'])

        return constraints

    def extract_enum_values(self, check_constraints: List[str]) -> Optional[List[str]]:
        """Extract enum values from CHECK constraints"""
        if not check_constraints:
            return None

        for constraint in check_constraints:
            # Look for pattern: column_name = ANY (ARRAY['value1', 'value2'])
            # or: column_name IN ('value1', 'value2')
            import re

            # Pattern for IN clause
            in_pattern = r"IN\s*\((.*?)\)"
            in_match = re.search(in_pattern, constraint, re.IGNORECASE)

            if in_match:
                values_str = in_match.group(1)
                # Extract values between quotes
                values = re.findall(r"'([^']*)'", values_str)
                if values:
                    return values

            # Pattern for ANY(ARRAY[...])
            array_pattern = r"ANY\s*\(ARRAY\[(.*?)\]"
            array_match = re.search(array_pattern, constraint, re.IGNORECASE)

            if array_match:
                values_str = array_match.group(1)
                values = re.findall(r"'([^']*)'", values_str)
                if values:
                    return values

        return None

    def get_table_info(self, table_name: str, schema: str = 'public') -> TableInfo:
        """Get complete information about a table"""
        columns = self.get_table_columns(table_name, schema)

        # Get primary keys
        primary_keys = [col.column_name for col in columns if col.is_primary_key]

        # Get foreign keys
        foreign_keys = {}
        for col in columns:
            if col.is_foreign_key:
                foreign_keys[col.column_name] = (col.foreign_table, col.foreign_column)

        # Get unique constraints
        unique_constraints = self.get_unique_constraints(table_name, schema)

        # Get all check constraints
        check_constraints = self.get_table_check_constraints(table_name, schema)

        # Get indexes
        indexes = self.get_table_indexes(table_name, schema)

        # Check for RLS
        has_rls = self.check_rls_enabled(table_name, schema)

        return TableInfo(
            table_name=table_name,
            columns=columns,
            primary_keys=primary_keys,
            foreign_keys=foreign_keys,
            unique_constraints=unique_constraints,
            check_constraints=check_constraints,
            indexes=indexes,
            has_rls=has_rls
        )

    def get_unique_constraints(self, table_name: str, schema: str = 'public') -> List[List[str]]:
        """Get unique constraints for a table"""
        query = """
        SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = %s
            AND tc.table_name = %s
            AND tc.constraint_type = 'UNIQUE'
        GROUP BY tc.constraint_name;
        """

        self.cursor.execute(query, (schema, table_name))
        return [row['columns'] for row in self.cursor.fetchall()]

    def get_table_check_constraints(self, table_name: str, schema: str = 'public') -> Dict[str, str]:
        """Get all CHECK constraints for a table"""
        query = """
        SELECT
            c.conname as constraint_name,
            pg_get_constraintdef(c.oid) as check_clause
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = %s
            AND t.relname = %s
            AND c.contype = 'c';
        """

        self.cursor.execute(query, (schema, table_name))
        return {row['constraint_name']: row['check_clause'] for row in self.cursor.fetchall()}

    def get_table_indexes(self, table_name: str, schema: str = 'public') -> List[str]:
        """Get indexes for a table"""
        query = """
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = %s AND tablename = %s;
        """

        self.cursor.execute(query, (schema, table_name))
        return [row['indexname'] for row in self.cursor.fetchall()]

    def check_rls_enabled(self, table_name: str, schema: str = 'public') -> bool:
        """Check if Row Level Security is enabled on a table"""
        query = """
        SELECT relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = %s AND c.relname = %s;
        """

        self.cursor.execute(query, (schema, table_name))
        result = self.cursor.fetchone()
        return result['relrowsecurity'] if result else False

    def get_all_persona_tables(self, schema: str = 'public') -> List[str]:
        """Get all persona-related tables"""
        query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = %s
            AND table_name LIKE 'persona%'
        ORDER BY table_name;
        """

        self.cursor.execute(query, (schema,))
        return [row['table_name'] for row in self.cursor.fetchall()]

    def generate_schema_mapping(self, table_name: str, schema: str = 'public') -> Dict[str, Any]:
        """Generate a complete schema mapping for a table"""
        table_info = self.get_table_info(table_name, schema)

        mapping = {
            'table_name': table_name,
            'columns': {},
            'primary_keys': table_info.primary_keys,
            'foreign_keys': table_info.foreign_keys,
            'unique_constraints': table_info.unique_constraints,
            'check_constraints': table_info.check_constraints,
            'has_rls': table_info.has_rls,
            'generated_at': datetime.now().isoformat()
        }

        for col in table_info.columns:
            mapping['columns'][col.column_name] = {
                'data_type': col.data_type,
                'is_nullable': col.is_nullable,
                'is_primary_key': col.is_primary_key,
                'is_foreign_key': col.is_foreign_key,
                'foreign_reference': f"{col.foreign_table}.{col.foreign_column}" if col.is_foreign_key else None,
                'enum_values': col.enum_values,
                'max_length': col.character_maximum_length,
                'numeric_precision': col.numeric_precision,
                'numeric_scale': col.numeric_scale,
                'default': col.column_default
            }

        return mapping

    def generate_all_persona_mappings(self, output_file: str = None) -> Dict[str, Any]:
        """Generate mappings for all persona tables"""
        tables = self.get_all_persona_tables()

        all_mappings = {
            'generated_at': datetime.now().isoformat(),
            'total_tables': len(tables),
            'tables': {}
        }

        print(f"\n📊 Introspecting {len(tables)} persona tables...")

        for table_name in tables:
            print(f"  → Analyzing {table_name}...")
            mapping = self.generate_schema_mapping(table_name)
            all_mappings['tables'][table_name] = mapping

        if output_file:
            with open(output_file, 'w') as f:
                json.dump(all_mappings, f, indent=2, default=str)
            print(f"\n✅ Schema mappings saved to: {output_file}")

        return all_mappings

    def validate_json_against_schema(self, json_data: Dict[str, Any],
                                    table_name: str) -> Dict[str, List[str]]:
        """Validate JSON data against actual table schema"""
        table_info = self.get_table_info(table_name)

        validation_result = {
            'errors': [],
            'warnings': [],
            'missing_required_columns': [],
            'extra_fields': [],
            'type_mismatches': []
        }

        # Get column names from table
        table_columns = {col.column_name for col in table_info.columns}
        json_keys = set(json_data.keys())

        # Find required columns (NOT NULL without default)
        required_columns = {
            col.column_name for col in table_info.columns
            if not col.is_nullable and not col.column_default
        }

        # Check for missing required columns
        missing_required = required_columns - json_keys
        if missing_required:
            validation_result['missing_required_columns'] = list(missing_required)
            for col in missing_required:
                validation_result['errors'].append(f"Missing required column: {col}")

        # Check for extra fields not in schema
        extra_fields = json_keys - table_columns
        if extra_fields:
            validation_result['extra_fields'] = list(extra_fields)
            for field in extra_fields:
                validation_result['warnings'].append(
                    f"Field '{field}' not in table schema - will be stored in metadata"
                )

        # Validate data types and constraints
        for col in table_info.columns:
            if col.column_name in json_data:
                value = json_data[col.column_name]

                # Check enum values
                if col.enum_values and value not in col.enum_values:
                    validation_result['errors'].append(
                        f"Column '{col.column_name}' value '{value}' not in allowed values: {col.enum_values}"
                    )

                # Check string length
                if col.character_maximum_length and isinstance(value, str):
                    if len(value) > col.character_maximum_length:
                        validation_result['errors'].append(
                            f"Column '{col.column_name}' value exceeds max length {col.character_maximum_length}"
                        )

        return validation_result

    def generate_transformation_config(self) -> Dict[str, Any]:
        """Generate a configuration file for data transformation"""
        config = {
            'version': '1.0.0',
            'generated_at': datetime.now().isoformat(),
            'persona_tables': {},
            'data_type_mappings': {
                'TEXT': 'str',
                'CHARACTER VARYING': 'str',
                'UUID': 'str',
                'INTEGER': 'int',
                'BIGINT': 'int',
                'NUMERIC': 'float',
                'DECIMAL': 'float',
                'BOOLEAN': 'bool',
                'TIMESTAMP WITH TIME ZONE': 'datetime',
                'TIMESTAMP WITHOUT TIME ZONE': 'datetime',
                'DATE': 'date',
                'TIME': 'time',
                'JSONB': 'dict',
                'JSON': 'dict',
                'ARRAY': 'list'
            }
        }

        # Get all persona tables
        tables = self.get_all_persona_tables()

        for table_name in tables:
            table_info = self.get_table_info(table_name)

            config['persona_tables'][table_name] = {
                'columns': {},
                'required_fields': [],
                'foreign_keys': table_info.foreign_keys,
                'unique_constraints': table_info.unique_constraints
            }

            for col in table_info.columns:
                col_config = {
                    'db_type': col.data_type,
                    'nullable': col.is_nullable,
                    'is_pk': col.is_primary_key,
                    'is_fk': col.is_foreign_key
                }

                if col.enum_values:
                    col_config['enum_values'] = col.enum_values

                if col.character_maximum_length:
                    col_config['max_length'] = col.character_maximum_length

                if not col.is_nullable and not col.column_default:
                    config['persona_tables'][table_name]['required_fields'].append(
                        col.column_name
                    )

                config['persona_tables'][table_name]['columns'][col.column_name] = col_config

        return config


def main():
    """Main execution function"""
    # Check for connection string
    connection_string = os.environ.get('DATABASE_URL')

    if not connection_string:
        print("❌ Please set DATABASE_URL environment variable")
        print("Example: export DATABASE_URL='postgresql://user:pass@host:port/dbname'")
        sys.exit(1)

    introspector = SchemaIntrospector(connection_string)

    try:
        introspector.connect()

        # Generate all persona mappings
        output_dir = "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/schema_mappings"
        os.makedirs(output_dir, exist_ok=True)

        # Generate comprehensive schema mappings
        mappings_file = os.path.join(output_dir, "persona_schema_mappings.json")
        all_mappings = introspector.generate_all_persona_mappings(mappings_file)

        # Generate transformation configuration
        config_file = os.path.join(output_dir, "transformation_config.json")
        transform_config = introspector.generate_transformation_config()

        with open(config_file, 'w') as f:
            json.dump(transform_config, f, indent=2)

        print(f"✅ Transformation config saved to: {config_file}")

        # Print summary
        print(f"\n📊 INTROSPECTION SUMMARY")
        print(f"{'='*50}")
        print(f"Total tables analyzed: {all_mappings['total_tables']}")

        # Show sample of main personas table
        if 'personas' in all_mappings['tables']:
            personas_info = all_mappings['tables']['personas']
            print(f"\n📋 Main 'personas' table:")
            print(f"  • Total columns: {len(personas_info['columns'])}")
            print(f"  • Primary keys: {', '.join(personas_info['primary_keys'])}")
            print(f"  • Foreign keys: {len(personas_info['foreign_keys'])}")
            print(f"  • Has RLS: {personas_info['has_rls']}")

            # Show columns with enums
            enum_cols = [
                name for name, info in personas_info['columns'].items()
                if info.get('enum_values')
            ]
            if enum_cols:
                print(f"  • Columns with enums: {', '.join(enum_cols)}")

        print(f"\n✅ Introspection complete!")
        print(f"📁 Output files:")
        print(f"  • {mappings_file}")
        print(f"  • {config_file}")

    except Exception as e:
        print(f"❌ Error during introspection: {e}")
        raise
    finally:
        introspector.disconnect()


if __name__ == "__main__":
    main()