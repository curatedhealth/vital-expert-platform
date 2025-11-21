#!/usr/bin/env python3
"""
Smart Persona Data Transformation Script v5.0
Automatically transforms JSON persona data into SQL based on actual database schema
"""

import json
import sys
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Set
import re

# Constants
TENANT_ID = "f7aa6fd4-0af9-4706-8b31-034f1f7accda"
SCHEMA_FILE = "actual_schema.json"
JSON_DATA_FILE = "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json"
OUTPUT_SQL_FILE = "DEPLOY_MA_V5_COMPLETE.sql"

# Value mapping for enum mismatches
# Auto-generated from discover_enum_mismatches.py
VALUE_MAPPINGS = {
    'persona_annual_conferences': {
        'conference_type': {
            'clinical': 'technical',
            'professional_development': 'leadership',
        },
        'networking_importance': {
            'very_high': 'critical',
        },
        'role': {
            'panelist': 'speaker',  # Panelists are speakers
        },
    },
    'persona_customer_relationships': {
        'customer_segment': {
            'Healthcare Providers': 'healthcare',
        },
        'interaction_type': {
            'education': 'strategic',  # Educational interactions are strategic
        },
        'satisfaction_metric': {
            'HCP satisfaction score': 'Custom',
        },
    },
    'persona_expert_opinions': {
        'opinion_type': {
            'clinical_practice': 'expert_testimony',
        },
    },
    'persona_external_stakeholders': {
        'interaction_mode': {
            'quarterly in-person + monthly virtual': 'mixed',
            'quarterly meetings': 'face_to_face',
            'quarterly negotiations': 'face_to_face',
            'quarterly site visits': 'face_to_face',
        },
        'stakeholder_type': {
            'institution': 'academic',
            'kol': 'advisor',  # KOLs are advisors
            'payer': 'client',
            'regulatory': 'regulator',
        },
    },
    'persona_industry_relationships': {
        'involvement_type': {
            'active_participation': 'contributor',
            'conference_attendance': 'attendee',
        },
        'membership_level': {
            'executive_member': 'board_member',
            'fellow': 'active_member',
        },
        'organization_type': {
            'clinical_society': 'professional_association',
        },
    },
    'persona_industry_reports': {
        'report_type': {
            'industry_trends': 'trend_report',
        },
    },
    'persona_internal_networks': {
        'role_in_network': {
            'contributor': 'active_member',
            'member': 'active_member',
        },
    },
    'persona_internal_stakeholders': {
        'political_alignment': {
            'aligned': 'allied',
            'mostly_aligned': 'allied',
        },
    },
    'persona_monthly_stakeholders': {
        'importance': {
            'medium-high': 'high',
        },
    },
    'persona_public_research': {
        'methodology': {
            'Randomized, double-blind, placebo-controlled': 'experiment',
            'Retrospective cohort analysis': 'longitudinal',
        },
        'research_type': {
            'clinical_trial_phase_3': 'academic',
            'observational_study': 'academic',
        },
    },
    'persona_regulatory_stakeholders': {
        'audit_frequency': {
            'biannual': 'bi_annual',  # Just different spelling
        },
        'compliance_area': {
            'clinical_trials': 'clinical',
            'marketing_authorization': 'industry_specific',
        },
        'interaction_type': {
            'submissions': 'submission',  # Singular form
            'submissions_meetings': 'submission',
        },
    },
    'persona_stakeholder_journey': {
        'journey_stage': {
            'advocate': 'advocacy',  # Noun form
        },
    },
    'persona_stakeholder_value_exchange': {
        'sustainability': {
            'high': 'sustainable',
        },
    },
}

# Default values for required fields that might be missing
DEFAULT_VALUES = {
    'persona_case_studies': {
        'industry': 'Healthcare/Pharmaceutical',
        'case_type': 'success_story',
        'relevance_to_persona': 'Highly relevant to medical affairs role',
        'relevance_score': 8,
    },
    'persona_evidence_summary': {
        'evidence_recency_score': 7,  # Recent evidence
        'overall_confidence_level': 'high',  # High confidence
    },
    'persona_expert_opinions': {
        'relevance_score': 8,
        'topic_area': 'Medical Affairs',
    },
    'persona_industry_reports': {
        'industry_focus': 'Healthcare',
        'publication_year': 2025,
        'relevance_score': 7,
    },
    'persona_month_in_life': {
        'month_phase': 'mid',  # Mid-month
    },
    'persona_stakeholder_influence_map': {
        'stakeholder_role': 'Key Stakeholder',
        'stakeholder_type': 'partner',
    },
    'persona_stakeholder_journey': {
        'stage_entry_date': '2025-01-01',  # Current year
        'stakeholder_type': 'partner',
    },
    'persona_stakeholder_value_exchange': {
        'stakeholder_type': 'partner',
    },
}

class SchemaValidator:
    """Validates and transforms data based on actual database schema"""

    def __init__(self, schema_data: Dict):
        self.schema = schema_data
        self.tables = schema_data['tables']
        self.check_constraints = {
            c['table_name']: c for c in schema_data['check_constraints']
        }
        self.enum_types = schema_data['enum_types']
        self.errors = []
        self.warnings = []

    def get_column_info(self, table_name: str, column_name: str) -> Optional[Dict]:
        """Get column information from schema"""
        if table_name not in self.tables:
            return None

        for col in self.tables[table_name]:
            if col['column_name'] == column_name:
                return col
        return None

    def get_table_columns(self, table_name: str) -> List[str]:
        """Get list of column names for a table"""
        if table_name not in self.tables:
            return []
        return [col['column_name'] for col in self.tables[table_name]]

    def validate_enum_value(self, table_name: str, column_name: str, value: str) -> bool:
        """Check if value matches CHECK constraint enum values"""
        constraints = [c for c in self.schema['check_constraints']
                      if c['table_name'] == table_name]

        for constraint in constraints:
            if column_name in constraint['constraint_name']:
                # Extract allowed values from CHECK constraint
                constraint_def = constraint['constraint_def']
                # Pattern: (column_name = ANY (ARRAY['value1'::text, 'value2'::text]))
                pattern = r"ARRAY\[(.*?)\]"
                match = re.search(pattern, constraint_def)
                if match:
                    values_str = match.group(1)
                    # Extract individual values
                    allowed_values = re.findall(r"'([^']+)'", values_str)
                    if value not in allowed_values:
                        self.warnings.append(
                            f"{table_name}.{column_name}: '{value}' not in {allowed_values}"
                        )
                        return False
        return True

    def format_sql_value(self, value: Any, column_info: Dict, table_name: str,
                        column_name: str) -> str:
        """Format a Python value as SQL"""
        if value is None:
            return 'NULL'

        data_type = column_info['udt_name']

        # Handle arrays
        if data_type == '_text':  # TEXT[]
            if not isinstance(value, list):
                value = [value]
            items = [self.escape_string(str(item)) for item in value]
            return f"ARRAY[{', '.join(items)}]::TEXT[]"

        # Handle UUID
        elif data_type == 'uuid':
            return f"'{str(value)}'"

        # Handle boolean
        elif data_type == 'bool':
            return 'TRUE' if value else 'FALSE'

        # Handle numeric types
        elif data_type in ['int4', 'int8', 'numeric']:
            if isinstance(value, str):
                value = value.replace(',', '')  # Remove commas from numbers
            try:
                return str(float(value)) if '.' in str(value) else str(int(value))
            except:
                self.warnings.append(f"Invalid numeric value: {value}")
                return 'NULL'

        # Handle timestamps
        elif data_type in ['timestamptz', 'timestamp']:
            if isinstance(value, str):
                return f"'{value}'"
            return 'CURRENT_TIMESTAMP'

        # Handle JSONB
        elif data_type == 'jsonb':
            json_str = json.dumps(value).replace("'", "''")
            return f"'{json_str}'::JSONB"

        # Handle text and other string types
        else:
            return self.escape_string(str(value))

    def escape_string(self, value: str) -> str:
        """Escape a string for SQL"""
        if value is None:
            return 'NULL'
        # Replace single quotes with two single quotes
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"


class PersonaDataMapper:
    """Maps JSON persona data to database tables"""

    # Mapping of JSON keys to database tables
    JSON_TO_TABLE_MAP = {
        'annual_conferences': 'persona_annual_conferences',
        'career_trajectory': 'persona_career_trajectory',
        'case_studies': 'persona_case_studies',
        'case_study_investments': 'persona_case_study_investments',
        'case_study_metrics': 'persona_case_study_metrics',
        'case_study_results': 'persona_case_study_results',
        'customer_relationships': 'persona_customer_relationships',
        'evidence_summary': 'persona_evidence_summary',
        'expert_opinions': 'persona_expert_opinions',
        'external_stakeholders': 'persona_external_stakeholders',
        'industry_relationships': 'persona_industry_relationships',
        'industry_reports': 'persona_industry_reports',
        'internal_networks': 'persona_internal_networks',
        'internal_stakeholders': 'persona_internal_stakeholders',
        'month_in_life': 'persona_month_in_life',
        'monthly_objectives': 'persona_monthly_objectives',
        'monthly_stakeholders': 'persona_monthly_stakeholders',
        'public_research': 'persona_public_research',
        'regulatory_stakeholders': 'persona_regulatory_stakeholders',
        'research_quantitative_results': 'persona_research_quantitative_results',
        'stakeholder_influence_map': 'persona_stakeholder_influence_map',
        'stakeholder_journey': 'persona_stakeholder_journey',
        'stakeholder_value_exchange': 'persona_stakeholder_value_exchange',
        'statistic_history': 'persona_statistic_history',
        'supporting_statistics': 'persona_supporting_statistics',
    }

    def __init__(self, validator: SchemaValidator):
        self.validator = validator
        self.persona_id_map = {}  # slug -> persona_id

    def load_existing_personas(self):
        """Load existing persona IDs from database"""
        # For now, we'll query them during SQL generation
        # This is a placeholder for the mapping
        pass

    def map_json_key_to_table(self, json_key: str) -> Optional[str]:
        """Map a JSON key to a database table name"""
        return self.JSON_TO_TABLE_MAP.get(json_key)

    def generate_insert_statement(self, table_name: str, data: Dict,
                                  persona_id: str) -> Optional[str]:
        """Generate an INSERT statement for a table"""
        # Get table columns
        columns = self.validator.get_table_columns(table_name)
        if not columns:
            self.validator.errors.append(f"Table {table_name} not found in schema")
            return None

        # Build column-value pairs
        col_values = {}

        # Always include these standard columns
        col_values['id'] = str(uuid.uuid4())
        col_values['persona_id'] = persona_id
        col_values['tenant_id'] = TENANT_ID
        col_values['created_at'] = 'CURRENT_TIMESTAMP'
        col_values['updated_at'] = 'CURRENT_TIMESTAMP'

        # Map data fields to columns
        for key, value in data.items():
            if key in columns:
                col_values[key] = value

        # Filter to only columns that exist in schema
        valid_columns = [col for col in col_values.keys() if col in columns]

        # Build INSERT statement
        columns_sql = ', '.join(valid_columns)
        values_list = []

        for col in valid_columns:
            col_info = self.validator.get_column_info(table_name, col)
            value = col_values[col]

            # Special handling for timestamps
            if col in ['created_at', 'updated_at'] and value == 'CURRENT_TIMESTAMP':
                values_list.append('CURRENT_TIMESTAMP')
            else:
                formatted_value = self.validator.format_sql_value(
                    value, col_info, table_name, col
                )
                values_list.append(formatted_value)

        values_sql = ', '.join(values_list)

        return f"INSERT INTO {table_name} ({columns_sql}) VALUES ({values_sql});"


class SQLGenerator:
    """Generates SQL from persona JSON data"""

    def __init__(self, schema_file: str, json_file: str):
        # Load schema
        with open(schema_file, 'r') as f:
            schema_data = json.load(f)

        # Load JSON data
        with open(json_file, 'r') as f:
            json_data = json.load(f)

        self.validator = SchemaValidator(schema_data)
        self.mapper = PersonaDataMapper(self.validator)
        self.personas = json_data['personas']
        self.metadata = json_data['metadata']
        self.sql_statements = []

    def get_persona_id_from_db(self, slug: str) -> Optional[str]:
        """Get persona ID from database by slug"""
        # This would need to query the database
        # For now, we'll generate a query that looks it up
        return None  # Will be handled differently

    def generate_sql(self) -> str:
        """Generate complete SQL deployment script"""
        sql_parts = []

        # Header
        sql_parts.append("""
-- =====================================================
-- Medical Affairs Personas v5.0 Extension Deployment
-- =====================================================
-- Generated: {timestamp}
-- Source: {source_file}
-- Personas: {persona_count}
-- Tenant: {tenant_id}
-- =====================================================

BEGIN;

-- Set tenant context
SET app.current_tenant_id = '{tenant_id}';

""".format(
            timestamp=datetime.now().isoformat(),
            source_file=JSON_DATA_FILE,
            persona_count=len(self.personas),
            tenant_id=TENANT_ID
        ))

        # Process each persona
        for persona in self.personas:
            persona_name = persona.get('name', 'Unknown')
            persona_slug = persona.get('slug', '')

            sql_parts.append(f"\n-- ==================== {persona_name} ====================\n")

            # Get persona_id from database (we'll use slug to look it up)
            # Try multiple slug variants: original, pharma-prefix, without pharma-prefix
            sql_parts.append(f"""
-- Get persona_id for {persona_name}
DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Try original slug first
    SELECT id INTO v_persona_id
    FROM personas
    WHERE slug = '{persona_slug}' AND tenant_id = '{TENANT_ID}';

    -- If not found, try with pharma- prefix
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE slug = 'pharma-{persona_slug}' AND tenant_id = '{TENANT_ID}';
    END IF;

    -- If still not found, try by name match
    IF v_persona_id IS NULL THEN
        SELECT id INTO v_persona_id
        FROM personas
        WHERE name = '{persona_name}' AND tenant_id = '{TENANT_ID}'
        LIMIT 1;
    END IF;

    IF v_persona_id IS NULL THEN
        RAISE EXCEPTION 'Persona not found: {persona_slug} (name: {persona_name})';
    END IF;

    -- Store in temporary table for this transaction
    CREATE TEMP TABLE IF NOT EXISTS temp_persona_ids (
        slug TEXT PRIMARY KEY,
        persona_id UUID NOT NULL
    );

    INSERT INTO temp_persona_ids (slug, persona_id)
    VALUES ('{persona_slug}', v_persona_id)
    ON CONFLICT (slug) DO UPDATE SET persona_id = EXCLUDED.persona_id;
END $$;
""")

            # Process each data section
            for json_key, table_name in self.mapper.JSON_TO_TABLE_MAP.items():
                if json_key not in persona:
                    continue

                data = persona[json_key]
                if not data:
                    continue

                sql_parts.append(f"\n-- {json_key} -> {table_name}\n")

                # Handle different data structures
                if isinstance(data, list):
                    # List of items (most common)
                    for item in data:
                        if isinstance(item, dict):
                            stmt = self.generate_insert_for_item(
                                table_name, item, persona_slug
                            )
                            if stmt:
                                sql_parts.append(stmt + "\n")

                elif isinstance(data, dict):
                    # Single item as dict
                    stmt = self.generate_insert_for_item(
                        table_name, data, persona_slug
                    )
                    if stmt:
                        sql_parts.append(stmt + "\n")

        # Footer
        sql_parts.append("""

-- Clean up temporary tables
DROP TABLE IF EXISTS temp_persona_ids;

-- Commit transaction
COMMIT;

-- =====================================================
-- Deployment Complete
-- =====================================================
""")

        return ''.join(sql_parts)

    def generate_insert_for_item(self, table_name: str, item: Dict,
                                 persona_slug: str) -> Optional[str]:
        """Generate INSERT statement for a single item"""
        # Get table columns
        columns = self.validator.get_table_columns(table_name)
        if not columns:
            return None

        # Build column-value mapping
        col_values = {
            'id': str(uuid.uuid4()),
            'tenant_id': TENANT_ID,
            'created_at': 'CURRENT_TIMESTAMP',
            'updated_at': 'CURRENT_TIMESTAMP',
        }

        # Add persona_id lookup
        persona_id_lookup = f"(SELECT persona_id FROM temp_persona_ids WHERE slug = '{persona_slug}')"

        # Map item fields to columns
        for key, value in item.items():
            # Convert snake_case if needed
            column_name = key
            if column_name in columns:
                # Apply value mappings if configured
                if table_name in VALUE_MAPPINGS:
                    if column_name in VALUE_MAPPINGS[table_name]:
                        mapping = VALUE_MAPPINGS[table_name][column_name]
                        if value in mapping:
                            value = mapping[value]
                col_values[column_name] = value

        # Apply default values for missing required fields
        if table_name in DEFAULT_VALUES:
            for field, default_value in DEFAULT_VALUES[table_name].items():
                if field in columns and field not in col_values:
                    col_values[field] = default_value

        # Filter to valid columns
        insert_columns = []
        insert_values = []

        for col in columns:
            if col == 'persona_id':
                insert_columns.append('persona_id')
                insert_values.append(persona_id_lookup)
            elif col in col_values:
                col_info = self.validator.get_column_info(table_name, col)
                value = col_values[col]

                # Skip if NULL and column is NOT NULL (except for defaults)
                if value is None and col_info['is_nullable'] == 'NO':
                    if col_info['column_default'] is None:
                        if col not in ['id', 'tenant_id', 'persona_id', 'created_at', 'updated_at']:
                            continue

                insert_columns.append(col)

                if col in ['created_at', 'updated_at'] and value == 'CURRENT_TIMESTAMP':
                    insert_values.append('CURRENT_TIMESTAMP')
                else:
                    formatted = self.validator.format_sql_value(
                        value, col_info, table_name, col
                    )
                    insert_values.append(formatted)

        if not insert_columns:
            return None

        columns_sql = ', '.join(insert_columns)
        values_sql = ', '.join(insert_values)

        return f"INSERT INTO {table_name} ({columns_sql})\nVALUES ({values_sql});"

    def print_summary(self):
        """Print validation summary"""
        print("\n=== Validation Summary ===")
        print(f"Errors: {len(self.validator.errors)}")
        if self.validator.errors:
            for error in self.validator.errors[:10]:
                print(f"  ERROR: {error}")
            if len(self.validator.errors) > 10:
                print(f"  ... and {len(self.validator.errors) - 10} more")

        print(f"\nWarnings: {len(self.validator.warnings)}")
        if self.validator.warnings:
            for warning in self.validator.warnings[:10]:
                print(f"  WARN: {warning}")
            if len(self.validator.warnings) > 10:
                print(f"  ... and {len(self.validator.warnings) - 10} more")


def main():
    """Main execution"""
    print("Smart Persona Data Transformation v5.0")
    print("=" * 60)

    # Check files exist
    import os
    if not os.path.exists(SCHEMA_FILE):
        print(f"ERROR: Schema file not found: {SCHEMA_FILE}")
        print("Please run schema_reader.py first")
        return 1

    if not os.path.exists(JSON_DATA_FILE):
        print(f"ERROR: JSON data file not found: {JSON_DATA_FILE}")
        return 1

    print(f"Schema file: {SCHEMA_FILE}")
    print(f"JSON data file: {JSON_DATA_FILE}")
    print(f"Output SQL file: {OUTPUT_SQL_FILE}")
    print()

    # Generate SQL
    print("Loading data and generating SQL...")
    generator = SQLGenerator(SCHEMA_FILE, JSON_DATA_FILE)

    sql_output = generator.generate_sql()

    # Write to file
    with open(OUTPUT_SQL_FILE, 'w') as f:
        f.write(sql_output)

    print(f"\nSQL generated successfully!")
    print(f"Output file: {OUTPUT_SQL_FILE}")

    # Print summary
    generator.print_summary()

    print("\n" + "=" * 60)
    print("Next steps:")
    print("1. Review the generated SQL file")
    print("2. Test with dry-run: psql ... -f DEPLOY_MA_V5_COMPLETE.sql")
    print("3. If test passes, deploy to production")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    sys.exit(main())
