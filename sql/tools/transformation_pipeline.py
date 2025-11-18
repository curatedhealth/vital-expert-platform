#!/usr/bin/env python3
"""
Robust Transformation Pipeline for VITAL Platform
=================================================
Transforms persona data from any format to SQL with automatic
schema mapping, validation, and error handling.

Author: VITAL Platform Orchestrator
Date: 2025-11-17
Version: 1.0.0
"""

import json
import os
import sys
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
import re
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class TransformationConfig:
    """Configuration for transformation pipeline"""
    tenant_id: str
    schema_mapping_file: str
    input_format: str = "json"  # json, yaml, csv
    output_dir: str = "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds"
    validate_foreign_keys: bool = True
    generate_metadata: bool = True
    strict_mode: bool = False  # If True, fail on any validation error
    batch_size: int = 100
    use_transactions: bool = True


class SchemaMapper:
    """Maps source data fields to database schema"""

    def __init__(self, schema_mapping_file: str):
        """Load schema mappings from introspection output"""
        with open(schema_mapping_file, 'r') as f:
            self.schema = json.load(f)

        self.tables = self.schema.get('tables', {})
        logger.info(f"Loaded schema for {len(self.tables)} tables")

    def get_table_columns(self, table_name: str) -> Dict[str, Any]:
        """Get column information for a table"""
        if table_name not in self.tables:
            raise ValueError(f"Table '{table_name}' not found in schema")

        return self.tables[table_name].get('columns', {})

    def get_required_columns(self, table_name: str) -> List[str]:
        """Get required (NOT NULL) columns for a table"""
        columns = self.get_table_columns(table_name)
        required = []

        for col_name, col_info in columns.items():
            if not col_info.get('is_nullable') and not col_info.get('default'):
                required.append(col_name)

        return required

    def get_foreign_keys(self, table_name: str) -> Dict[str, Tuple[str, str]]:
        """Get foreign key relationships for a table"""
        if table_name not in self.tables:
            return {}

        return self.tables[table_name].get('foreign_keys', {})

    def validate_value_for_column(self, table_name: str, column_name: str,
                                 value: Any) -> Tuple[bool, Optional[str]]:
        """Validate a value against column constraints"""
        columns = self.get_table_columns(table_name)

        if column_name not in columns:
            return False, f"Column '{column_name}' does not exist in table '{table_name}'"

        col_info = columns[column_name]

        # Check enum values
        if col_info.get('enum_values') and value not in col_info['enum_values']:
            return False, f"Value '{value}' not in allowed values: {col_info['enum_values']}"

        # Check string length
        max_length = col_info.get('max_length')
        if max_length and isinstance(value, str) and len(value) > max_length:
            return False, f"Value exceeds maximum length of {max_length}"

        # Check numeric precision
        if col_info.get('numeric_precision'):
            # TODO: Implement numeric precision validation
            pass

        return True, None


class DataTransformer:
    """Transforms persona data to SQL format"""

    def __init__(self, config: TransformationConfig, schema_mapper: SchemaMapper):
        """Initialize transformer with config and schema"""
        self.config = config
        self.schema = schema_mapper
        self.errors = []
        self.warnings = []

    def transform_persona(self, persona_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform a single persona to database format"""
        transformed = {
            'personas': {},
            'related_tables': {}
        }

        # Extract core persona fields
        core_profile = persona_data.get('core_profile', {})
        professional_context = persona_data.get('professional_context', {})

        # Map to personas table columns
        personas_columns = self.schema.get_table_columns('personas')

        # Direct mappings
        direct_mappings = {
            'name': core_profile.get('name'),
            'slug': core_profile.get('slug'),
            'title': professional_context.get('title', core_profile.get('title')),
            'tagline': core_profile.get('tagline'),
            'seniority_level': professional_context.get('seniority_level'),
            'years_of_experience': professional_context.get('years_of_experience'),
            'typical_organization_size': professional_context.get('typical_organization_size'),
            'decision_making_style': professional_context.get('decision_making_style'),
            'validation_status': persona_data.get('validation_status', 'draft'),
            'is_active': True
        }

        # Apply direct mappings
        for col_name, value in direct_mappings.items():
            if col_name in personas_columns and value is not None:
                transformed['personas'][col_name] = value

        # Handle foreign keys
        fks = self.schema.get_foreign_keys('personas')

        # Role lookup
        if 'role_id' in fks:
            role_slug = persona_data.get('role_slug', f"{persona_data.get('business_function', 'general')}-leader")
            transformed['personas']['role_id'] = {
                'lookup': 'org_roles',
                'field': 'slug',
                'value': role_slug
            }

        # Function lookup
        if 'function_id' in fks:
            function_slug = persona_data.get('business_function', 'general')
            transformed['personas']['function_id'] = {
                'lookup': 'org_functions',
                'field': 'slug',
                'value': function_slug
            }

        # Department lookup
        if 'department_id' in fks:
            department_slug = persona_data.get('department', persona_data.get('business_function', 'general'))
            transformed['personas']['department_id'] = {
                'lookup': 'org_departments',
                'field': 'slug',
                'value': department_slug
            }

        # Handle arrays based on actual column types
        if 'key_responsibilities' in personas_columns:
            col_info = personas_columns['key_responsibilities']
            responsibilities = persona_data.get('responsibilities', [])

            if col_info['data_type'] == 'ARRAY':
                # TEXT[] format
                if responsibilities:
                    transformed['personas']['key_responsibilities'] = [
                        r.get('responsibility') if isinstance(r, dict) else str(r)
                        for r in responsibilities
                    ]
            elif col_info['data_type'] == 'JSONB':
                # JSONB format (if schema uses it)
                transformed['personas']['key_responsibilities'] = responsibilities

        # Handle structured data that goes to related tables
        self._transform_related_tables(persona_data, transformed)

        # Collect remaining fields for metadata
        if self.config.generate_metadata:
            metadata = self._generate_metadata(persona_data, transformed['personas'])
            if metadata:
                transformed['personas']['metadata'] = metadata

        return transformed

    def _transform_related_tables(self, persona_data: Dict[str, Any],
                                 transformed: Dict[str, Any]):
        """Transform data for related persona tables"""

        # Pain points
        pain_points = persona_data.get('pain_points', [])
        if pain_points and 'persona_pain_points' in self.schema.tables:
            transformed['related_tables']['persona_pain_points'] = []
            for pp in pain_points:
                if isinstance(pp, dict):
                    transformed['related_tables']['persona_pain_points'].append({
                        'pain_point': pp.get('pain_point'),
                        'severity': pp.get('severity', 'medium'),
                        'frequency': pp.get('frequency', 'weekly'),
                        'impact_description': pp.get('impact_description'),
                        'root_cause': pp.get('root_cause')
                    })

        # Goals
        goals = persona_data.get('goals', [])
        if goals and 'persona_goals' in self.schema.tables:
            transformed['related_tables']['persona_goals'] = []
            for goal in goals:
                if isinstance(goal, dict):
                    transformed['related_tables']['persona_goals'].append({
                        'goal': goal.get('goal'),
                        'priority': goal.get('priority', 'medium'),
                        'timeframe': goal.get('timeframe', 'ongoing'),
                        'success_criteria': goal.get('success_criteria'),
                        'progress_status': goal.get('progress_status', 'not_started')
                    })

        # Challenges
        challenges = persona_data.get('challenges', [])
        if challenges and 'persona_challenges' in self.schema.tables:
            transformed['related_tables']['persona_challenges'] = []
            for challenge in challenges:
                if isinstance(challenge, dict):
                    transformed['related_tables']['persona_challenges'].append({
                        'challenge': challenge.get('challenge'),
                        'impact_level': challenge.get('impact_level', 'medium'),
                        'category': challenge.get('category', 'other'),
                        'mitigation_strategy': challenge.get('mitigation_strategy'),
                        'is_addressed': challenge.get('is_addressed', False)
                    })

        # Week in life (v5.0)
        week_in_life = persona_data.get('week_in_life', [])
        if week_in_life and 'persona_week_in_life' in self.schema.tables:
            transformed['related_tables']['persona_week_in_life'] = []
            for day in week_in_life:
                if isinstance(day, dict):
                    transformed['related_tables']['persona_week_in_life'].append({
                        'day_of_week': day.get('day_of_week'),
                        'typical_start_time': day.get('typical_start_time'),
                        'typical_end_time': day.get('typical_end_time'),
                        'meeting_load': day.get('meeting_load', 'moderate'),
                        'focus_time_hours': day.get('focus_time_hours', 2),
                        'typical_activities': day.get('typical_activities', []),
                        'key_priorities': day.get('key_priorities', []),
                        'collaboration_needs': day.get('collaboration_needs', [])
                    })

        # Internal stakeholders (v5.0)
        stakeholders = persona_data.get('internal_stakeholders', [])
        if stakeholders and 'persona_internal_stakeholders' in self.schema.tables:
            transformed['related_tables']['persona_internal_stakeholders'] = []
            for stakeholder in stakeholders:
                if isinstance(stakeholder, dict):
                    transformed['related_tables']['persona_internal_stakeholders'].append({
                        'stakeholder_name': stakeholder.get('stakeholder_name'),
                        'stakeholder_role': stakeholder.get('stakeholder_role'),
                        'relationship_type': stakeholder.get('relationship_type', 'peer'),
                        'interaction_frequency': stakeholder.get('interaction_frequency', 'weekly'),
                        'collaboration_importance': stakeholder.get('collaboration_importance', 'medium'),
                        'typical_interactions': stakeholder.get('typical_interactions', [])
                    })

    def _generate_metadata(self, source_data: Dict[str, Any],
                          mapped_fields: Dict[str, Any]) -> Dict[str, Any]:
        """Generate metadata for unmapped fields"""
        metadata = {}

        # Fields to exclude from metadata (already mapped)
        exclude_fields = set(mapped_fields.keys())
        exclude_fields.update(['core_profile', 'professional_context', 'pain_points',
                              'goals', 'challenges', 'responsibilities', 'week_in_life',
                              'internal_stakeholders', 'preferred_tools'])

        # Collect unmapped fields
        for key, value in source_data.items():
            if key not in exclude_fields and value is not None:
                metadata[key] = value

        # Add fields from core_profile and professional_context that weren't mapped
        core = source_data.get('core_profile', {})
        for key in ['age', 'location', 'education_level']:
            if key in core and core[key]:
                metadata[key] = core[key]

        prof = source_data.get('professional_context', {})
        for key in ['years_in_current_role', 'years_in_function', 'years_in_industry',
                   'reporting_to', 'team_size', 'budget_authority']:
            if key in prof and prof[key]:
                metadata[key] = prof[key]

        return metadata if metadata else None

    def validate_transformed_data(self, transformed: Dict[str, Any]) -> bool:
        """Validate transformed data against schema"""
        is_valid = True

        # Validate main persona table
        personas_data = transformed.get('personas', {})
        required_columns = self.schema.get_required_columns('personas')

        for col in required_columns:
            if col not in personas_data or personas_data[col] is None:
                if col not in ['id', 'tenant_id', 'created_at', 'updated_at']:  # System fields
                    self.errors.append(f"Missing required field: {col}")
                    is_valid = False

        # Validate column values
        for col_name, value in personas_data.items():
            if isinstance(value, dict) and 'lookup' in value:
                continue  # Foreign key lookup, skip validation

            valid, error = self.schema.validate_value_for_column('personas', col_name, value)
            if not valid:
                self.errors.append(error)
                is_valid = False

        # Validate related tables
        for table_name, records in transformed.get('related_tables', {}).items():
            for i, record in enumerate(records):
                for col_name, value in record.items():
                    valid, error = self.schema.validate_value_for_column(table_name, col_name, value)
                    if not valid:
                        self.warnings.append(f"{table_name}[{i}].{col_name}: {error}")

        return is_valid


class SQLGenerator:
    """Generates SQL from transformed data"""

    def __init__(self, config: TransformationConfig):
        """Initialize SQL generator"""
        self.config = config
        self.tenant_id = config.tenant_id

    def escape_sql_string(self, value: Any) -> str:
        """Escape a value for SQL"""
        if value is None:
            return "NULL"

        if isinstance(value, bool):
            return "TRUE" if value else "FALSE"

        if isinstance(value, (int, float)):
            return str(value)

        if isinstance(value, list):
            if not value:
                return "ARRAY[]::TEXT[]"

            if all(isinstance(v, str) for v in value):
                # TEXT[] array
                escaped = [f"'{str(v).replace(chr(39), chr(39)+chr(39))}'" for v in value]
                return f"ARRAY[{', '.join(escaped)}]"
            else:
                # JSONB array
                json_str = json.dumps(value).replace("'", "''")
                return f"'{json_str}'::jsonb"

        if isinstance(value, dict):
            if 'lookup' in value:
                # Foreign key lookup
                return f"(SELECT id FROM {value['lookup']} WHERE {value['field']} = '{value['value']}' LIMIT 1)"
            else:
                # JSONB object
                json_str = json.dumps(value).replace("'", "''")
                return f"'{json_str}'::jsonb"

        # String value
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"

    def generate_persona_insert(self, transformed: Dict[str, Any], persona_id: str = None) -> str:
        """Generate INSERT statement for main persona"""
        if not persona_id:
            persona_id = "gen_random_uuid()"
        else:
            persona_id = f"'{persona_id}'::uuid"

        personas_data = transformed.get('personas', {})

        # Build column list and values
        columns = ['id', 'tenant_id']
        values = [persona_id, f"'{self.tenant_id}'::uuid"]

        for col_name, value in personas_data.items():
            columns.append(col_name)
            values.append(self.escape_sql_string(value))

        # Add system fields
        if 'is_active' not in columns:
            columns.append('is_active')
            values.append('TRUE')

        if 'validation_status' not in columns:
            columns.append('validation_status')
            values.append("'approved'")

        if 'created_at' not in columns:
            columns.append('created_at')
            values.append('NOW()')

        if 'updated_at' not in columns:
            columns.append('updated_at')
            values.append('NOW()')

        sql = f"""
INSERT INTO personas ({', '.join(columns)})
VALUES ({', '.join(values)})
RETURNING id;"""

        return sql

    def generate_related_inserts(self, transformed: Dict[str, Any], persona_id_var: str) -> List[str]:
        """Generate INSERT statements for related tables"""
        sql_statements = []

        for table_name, records in transformed.get('related_tables', {}).items():
            for record in records:
                columns = ['id', 'persona_id', 'tenant_id']
                values = ['gen_random_uuid()', persona_id_var, f"'{self.tenant_id}'::uuid"]

                for col_name, value in record.items():
                    columns.append(col_name)
                    values.append(self.escape_sql_string(value))

                # Add created_at if table has it
                columns.append('created_at')
                values.append('NOW()')

                sql = f"""
INSERT INTO {table_name} ({', '.join(columns)})
VALUES ({', '.join(values)});"""

                sql_statements.append(sql)

        return sql_statements

    def generate_complete_sql(self, personas: List[Dict[str, Any]]) -> str:
        """Generate complete SQL script for all personas"""
        sql_parts = []

        # Header
        sql_parts.append(f"""-- ============================================================
-- VITAL Platform - Persona Deployment Script
-- Generated: {datetime.now().isoformat()}
-- Personas: {len(personas)}
-- Tenant ID: {self.tenant_id}
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

""")

        # Begin transaction if configured
        if self.config.use_transactions:
            sql_parts.append("BEGIN;\n\n")

        # Generate persona inserts
        for i, transformed in enumerate(personas, 1):
            name = transformed.get('personas', {}).get('name', f'Persona {i}')

            sql_parts.append(f"-- Persona {i}: {name}")
            sql_parts.append("-" * 60)

            # Use DO block for each persona
            sql_parts.append("""DO $$
DECLARE
    v_persona_id UUID;
BEGIN""")

            # Insert main persona
            persona_insert = self.generate_persona_insert(transformed)
            persona_insert = persona_insert.replace('RETURNING id;', 'RETURNING id INTO v_persona_id;')
            sql_parts.append(f"    {persona_insert}")

            # Insert related records
            related_inserts = self.generate_related_inserts(transformed, 'v_persona_id')
            for insert in related_inserts:
                sql_parts.append(f"    {insert}")

            sql_parts.append("""
    RAISE NOTICE 'Inserted persona: %', v_persona_id;
END $$;
""")

        # Add validation queries
        sql_parts.append(self._generate_validation_queries())

        # Commit transaction if configured
        if self.config.use_transactions:
            sql_parts.append("\nCOMMIT;")

        return "\n".join(sql_parts)

    def _generate_validation_queries(self) -> str:
        """Generate validation queries"""
        return f"""
-- ============================================================
-- VALIDATION QUERIES
-- ============================================================

-- Count personas
SELECT 'Total Personas' as metric, COUNT(*) as count
FROM personas
WHERE tenant_id = '{self.tenant_id}';

-- Count related records
SELECT
    'Pain Points' as table_name,
    COUNT(*) as count
FROM persona_pain_points
WHERE tenant_id = '{self.tenant_id}'
UNION ALL
SELECT
    'Goals',
    COUNT(*)
FROM persona_goals
WHERE tenant_id = '{self.tenant_id}'
UNION ALL
SELECT
    'Challenges',
    COUNT(*)
FROM persona_challenges
WHERE tenant_id = '{self.tenant_id}';

-- Verify foreign key integrity
SELECT
    'Missing Roles' as check_type,
    COUNT(*) as count
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
WHERE p.tenant_id = '{self.tenant_id}'
    AND p.role_id IS NOT NULL
    AND r.id IS NULL;
"""


class TransformationPipeline:
    """Main transformation pipeline orchestrator"""

    def __init__(self, config: TransformationConfig):
        """Initialize pipeline"""
        self.config = config
        self.schema_mapper = SchemaMapper(config.schema_mapping_file)
        self.transformer = DataTransformer(config, self.schema_mapper)
        self.sql_generator = SQLGenerator(config)

    def process_json_file(self, input_file: str) -> str:
        """Process JSON file containing personas"""
        logger.info(f"Processing JSON file: {input_file}")

        with open(input_file, 'r') as f:
            data = json.load(f)

        # Handle different JSON structures
        if 'personas' in data:
            personas = data['personas']
        elif isinstance(data, list):
            personas = data
        else:
            personas = [data]

        logger.info(f"Found {len(personas)} personas to process")

        # Transform all personas
        transformed_personas = []
        for i, persona in enumerate(personas):
            try:
                transformed = self.transformer.transform_persona(persona)

                # Validate if strict mode
                if self.config.strict_mode:
                    if not self.transformer.validate_transformed_data(transformed):
                        logger.error(f"Validation failed for persona {i+1}")
                        logger.error(f"Errors: {self.transformer.errors}")
                        raise ValueError("Validation failed in strict mode")

                transformed_personas.append(transformed)

            except Exception as e:
                logger.error(f"Failed to transform persona {i+1}: {e}")
                if self.config.strict_mode:
                    raise

        logger.info(f"Successfully transformed {len(transformed_personas)} personas")

        # Generate SQL
        sql = self.sql_generator.generate_complete_sql(transformed_personas)

        # Save SQL file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(
            self.config.output_dir,
            f"personas_deployment_{timestamp}.sql"
        )

        with open(output_file, 'w') as f:
            f.write(sql)

        logger.info(f"✅ SQL generated: {output_file}")

        # Report warnings and errors
        if self.transformer.warnings:
            logger.warning(f"Warnings: {len(self.transformer.warnings)}")
            for warning in self.transformer.warnings[:5]:  # Show first 5
                logger.warning(f"  • {warning}")

        if self.transformer.errors:
            logger.error(f"Errors: {len(self.transformer.errors)}")
            for error in self.transformer.errors[:5]:  # Show first 5
                logger.error(f"  • {error}")

        return output_file

    def process_directory(self, input_dir: str) -> List[str]:
        """Process all JSON files in a directory"""
        output_files = []
        json_files = Path(input_dir).glob("*.json")

        for json_file in json_files:
            try:
                output = self.process_json_file(str(json_file))
                output_files.append(output)
            except Exception as e:
                logger.error(f"Failed to process {json_file}: {e}")

        return output_files


def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(description="Transform persona data to SQL")
    parser.add_argument("input", help="Input JSON file or directory")
    parser.add_argument("--tenant-id", required=True, help="Tenant UUID")
    parser.add_argument("--schema-mapping", required=True, help="Schema mapping JSON file")
    parser.add_argument("--output-dir", default="/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds",
                       help="Output directory for SQL files")
    parser.add_argument("--strict", action="store_true", help="Fail on any validation error")
    parser.add_argument("--no-transactions", action="store_true", help="Don't use transactions")

    args = parser.parse_args()

    # Create configuration
    config = TransformationConfig(
        tenant_id=args.tenant_id,
        schema_mapping_file=args.schema_mapping,
        output_dir=args.output_dir,
        strict_mode=args.strict,
        use_transactions=not args.no_transactions
    )

    # Create pipeline
    pipeline = TransformationPipeline(config)

    # Process input
    if os.path.isfile(args.input):
        output = pipeline.process_json_file(args.input)
        print(f"\n✅ Success! SQL file generated: {output}")
    elif os.path.isdir(args.input):
        outputs = pipeline.process_directory(args.input)
        print(f"\n✅ Success! Generated {len(outputs)} SQL files")
    else:
        print(f"❌ Error: {args.input} is not a valid file or directory")
        sys.exit(1)


if __name__ == "__main__":
    main()