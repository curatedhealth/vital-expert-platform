#!/usr/bin/env python3
"""
Persona Seeding Orchestrator for VITAL Platform
===============================================
Complete end-to-end orchestration for persona data capture,
transformation, validation, and deployment.

Author: VITAL Platform Orchestrator
Date: 2025-11-17
Version: 1.0.0
"""

import json
import os
import sys
import subprocess
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import logging
import psycopg2
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class OrchestratorConfig:
    """Configuration for the orchestrator"""
    database_url: str
    tenant_id: str
    business_function: str
    working_dir: str = "/Users/hichamnaim/Downloads/Cursor/VITAL path"
    dry_run: bool = False
    skip_introspection: bool = False
    skip_validation: bool = False
    auto_deploy: bool = False


class PersonaSeedingOrchestrator:
    """
    Main orchestrator for the complete persona seeding process
    """

    def __init__(self, config: OrchestratorConfig):
        """Initialize orchestrator"""
        self.config = config
        self.working_dir = Path(config.working_dir)
        self.tools_dir = self.working_dir / "sql" / "tools"
        self.seeds_dir = self.working_dir / "sql" / "seeds"
        self.templates_dir = self.working_dir / "data_capture_templates"
        self.schema_dir = self.working_dir / "sql" / "schema_mappings"

        # Create necessary directories
        for directory in [self.tools_dir, self.seeds_dir, self.templates_dir, self.schema_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        self.schema_mapping_file = self.schema_dir / "persona_schema_mappings.json"
        self.transformation_config = self.schema_dir / "transformation_config.json"

        logger.info(f"Orchestrator initialized for {config.business_function}")

    def run_complete_pipeline(self):
        """Run the complete persona seeding pipeline"""
        logger.info("="*60)
        logger.info("VITAL PLATFORM - PERSONA SEEDING ORCHESTRATOR")
        logger.info("="*60)

        try:
            # Step 1: Schema Introspection
            if not self.config.skip_introspection:
                self.step_1_introspect_schema()

            # Step 2: Generate Data Capture Templates
            self.step_2_generate_templates()

            # Step 3: Validate Captured Data (if exists)
            captured_data = self.step_3_find_captured_data()

            if captured_data:
                # Step 4: Transform Data to SQL
                sql_file = self.step_4_transform_data(captured_data)

                # Step 5: Validate SQL
                if not self.config.skip_validation:
                    self.step_5_validate_sql(sql_file)

                # Step 6: Deploy to Database
                if self.config.auto_deploy and not self.config.dry_run:
                    self.step_6_deploy_sql(sql_file)
                else:
                    logger.info(f"\n✅ SQL file ready for deployment: {sql_file}")
                    logger.info("Run with --auto-deploy to automatically deploy to database")
            else:
                logger.info("\n⚠️  No captured data found. Please fill out the templates in:")
                logger.info(f"   {self.templates_dir}")

            # Step 7: Generate Documentation
            self.step_7_generate_documentation()

            logger.info("\n" + "="*60)
            logger.info("✅ ORCHESTRATION COMPLETE")
            logger.info("="*60)

        except Exception as e:
            logger.error(f"\n❌ Orchestration failed: {e}")
            raise

    def step_1_introspect_schema(self):
        """Step 1: Introspect database schema"""
        logger.info("\n📋 STEP 1: Schema Introspection")
        logger.info("-"*40)

        # Set environment variable for database connection
        os.environ['DATABASE_URL'] = self.config.database_url

        # Run schema introspector
        introspector_script = self.tools_dir / "schema_introspector.py"

        if introspector_script.exists():
            logger.info("Running schema introspection...")

            result = subprocess.run(
                [sys.executable, str(introspector_script)],
                capture_output=True,
                text=True,
                env=os.environ.copy()
            )

            if result.returncode == 0:
                logger.info("✅ Schema introspection complete")

                # Verify output files exist
                if self.schema_mapping_file.exists():
                    with open(self.schema_mapping_file, 'r') as f:
                        schema = json.load(f)
                    logger.info(f"  • Found {len(schema.get('tables', {}))} tables")
                else:
                    logger.warning("Schema mapping file not found after introspection")
            else:
                logger.error(f"Schema introspection failed: {result.stderr}")
                raise RuntimeError("Schema introspection failed")
        else:
            logger.warning(f"Schema introspector not found at {introspector_script}")

    def step_2_generate_templates(self):
        """Step 2: Generate data capture templates"""
        logger.info("\n📋 STEP 2: Generate Data Capture Templates")
        logger.info("-"*40)

        # Run template generator
        template_script = self.tools_dir / "data_capture_templates.py"

        if template_script.exists():
            logger.info(f"Generating templates for {self.config.business_function}...")

            # Import and use the template generator
            import sys
            sys.path.insert(0, str(self.tools_dir))
            from data_capture_templates import DataCaptureTemplateGenerator, BusinessFunction

            # Find matching business function
            try:
                bf = BusinessFunction(self.config.business_function)
            except ValueError:
                logger.warning(f"Unknown business function: {self.config.business_function}")
                bf = BusinessFunction.MEDICAL_AFFAIRS

            generator = DataCaptureTemplateGenerator(bf)
            generator.generate_business_function_templates()

            logger.info("✅ Templates generated successfully")
        else:
            logger.warning(f"Template generator not found at {template_script}")

    def step_3_find_captured_data(self) -> Optional[str]:
        """Step 3: Find captured persona data"""
        logger.info("\n📋 STEP 3: Find Captured Data")
        logger.info("-"*40)

        # Look for filled templates
        json_pattern = f"{self.config.business_function}*.json"
        yaml_pattern = f"{self.config.business_function}*.yaml"

        json_files = list(self.templates_dir.glob(json_pattern))
        yaml_files = list(self.templates_dir.glob(yaml_pattern))

        # Also check for Medical Affairs data
        if self.config.business_function == "medical-affairs":
            ma_file = Path("/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json")
            if ma_file.exists():
                logger.info(f"✅ Found Medical Affairs data: {ma_file.name}")
                return str(ma_file)

        if json_files:
            # Prefer non-template files
            for f in json_files:
                if 'template' not in f.name.lower():
                    logger.info(f"✅ Found captured data: {f.name}")
                    return str(f)
            # Fall back to first JSON file
            logger.info(f"✅ Found captured data: {json_files[0].name}")
            return str(json_files[0])

        if yaml_files:
            for f in yaml_files:
                if 'template' not in f.name.lower():
                    logger.info(f"✅ Found captured data: {f.name}")
                    # Convert YAML to JSON first
                    return self._convert_yaml_to_json(str(f))

        logger.warning("No captured data found")
        return None

    def step_4_transform_data(self, data_file: str) -> str:
        """Step 4: Transform data to SQL"""
        logger.info("\n📋 STEP 4: Transform Data to SQL")
        logger.info("-"*40)

        # Import transformation pipeline
        sys.path.insert(0, str(self.tools_dir))
        from transformation_pipeline import TransformationPipeline, TransformationConfig

        # Create transformation config
        transform_config = TransformationConfig(
            tenant_id=self.config.tenant_id,
            schema_mapping_file=str(self.schema_mapping_file),
            output_dir=str(self.seeds_dir),
            validate_foreign_keys=True,
            generate_metadata=True,
            strict_mode=False,
            use_transactions=True
        )

        # Run transformation
        pipeline = TransformationPipeline(transform_config)
        sql_file = pipeline.process_json_file(data_file)

        logger.info(f"✅ SQL generated: {Path(sql_file).name}")
        return sql_file

    def step_5_validate_sql(self, sql_file: str):
        """Step 5: Validate generated SQL"""
        logger.info("\n📋 STEP 5: Validate SQL")
        logger.info("-"*40)

        # Basic SQL syntax validation
        with open(sql_file, 'r') as f:
            sql_content = f.read()

        # Check for common issues
        validations = {
            "Has BEGIN statement": "BEGIN" in sql_content,
            "Has COMMIT statement": "COMMIT" in sql_content,
            "Has INSERT statements": "INSERT INTO" in sql_content,
            "Has persona inserts": "INSERT INTO personas" in sql_content,
            "Has validation queries": "VALIDATION QUERIES" in sql_content,
            "Uses transactions": "BEGIN;" in sql_content
        }

        all_valid = True
        for check, result in validations.items():
            status = "✅" if result else "❌"
            logger.info(f"  {status} {check}")
            if not result:
                all_valid = False

        if all_valid:
            logger.info("✅ SQL validation passed")
        else:
            logger.warning("⚠️  Some SQL validations failed - review the file before deploying")

    def step_6_deploy_sql(self, sql_file: str):
        """Step 6: Deploy SQL to database"""
        logger.info("\n📋 STEP 6: Deploy to Database")
        logger.info("-"*40)

        if self.config.dry_run:
            logger.info("DRY RUN - Skipping actual deployment")
            return

        try:
            # Connect to database
            conn = psycopg2.connect(self.config.database_url)
            cursor = conn.cursor()

            # Read SQL file
            with open(sql_file, 'r') as f:
                sql_content = f.read()

            # Execute SQL
            logger.info("Executing SQL...")
            cursor.execute(sql_content)
            conn.commit()

            # Get row counts
            cursor.execute(f"""
                SELECT COUNT(*) FROM personas
                WHERE tenant_id = '{self.config.tenant_id}'
            """)
            persona_count = cursor.fetchone()[0]

            logger.info(f"✅ Deployment successful!")
            logger.info(f"  • Personas deployed: {persona_count}")

            cursor.close()
            conn.close()

        except Exception as e:
            logger.error(f"Deployment failed: {e}")
            raise

    def step_7_generate_documentation(self):
        """Step 7: Generate comprehensive documentation"""
        logger.info("\n📋 STEP 7: Generate Documentation")
        logger.info("-"*40)

        doc_file = self.working_dir / "PERSONA_SEEDING_PROCESS.md"

        documentation = f"""# VITAL Platform - Persona Seeding Process

Generated: {datetime.now().isoformat()}
Business Function: {self.config.business_function}

## Overview

This document describes the complete persona seeding process for the VITAL platform.

## Process Steps

### 1. Schema Introspection
- Automatically reads deployed database schema
- Generates mapping configuration
- Output: `{self.schema_mapping_file.name}`

### 2. Data Capture
- Use templates in: `{self.templates_dir}`
- Supported formats: JSON, YAML, CSV
- Template files include validation rules

### 3. Data Transformation
- Converts captured data to SQL
- Validates against schema constraints
- Handles foreign key lookups
- Normalizes data per golden rules

### 4. SQL Generation
- Creates transactional SQL scripts
- Includes validation queries
- Handles all v5.0 extension tables

### 5. Deployment
- Execute SQL against database
- Verify data integrity
- Check foreign key constraints

## File Locations

- **Tools**: `{self.tools_dir}`
- **Templates**: `{self.templates_dir}`
- **Seeds**: `{self.seeds_dir}`
- **Schema Mappings**: `{self.schema_dir}`

## Quick Start

1. Set environment variables:
```bash
export DATABASE_URL="your_connection_string"
export TENANT_ID="your_tenant_uuid"
```

2. Run orchestrator:
```bash
python {self.tools_dir}/persona_seeding_orchestrator.py \\
    --business-function {self.config.business_function} \\
    --auto-deploy
```

## Data Capture Format

### JSON Format
```json
{{
  "core_profile": {{
    "name": "Full Name",
    "slug": "url-friendly-slug",
    "title": "Job Title",
    "tagline": "One line description"
  }},
  "professional_context": {{
    "seniority_level": "senior",
    "years_of_experience": 10
  }},
  "pain_points": [
    {{
      "pain_point": "Description",
      "severity": "high",
      "frequency": "daily"
    }}
  ]
}}
```

## Validation Rules

- Required fields: name, slug, title
- Enum validations enforced
- Foreign key references verified
- CHECK constraints validated

## Troubleshooting

### Schema Mismatch Errors
- Re-run schema introspection
- Check column names match exactly
- Verify enum values are valid

### Foreign Key Errors
- Ensure org tables are populated
- Check slug values match exactly
- Verify case sensitivity

## Contact

For issues or questions, contact the VITAL Platform team.
"""

        with open(doc_file, 'w') as f:
            f.write(documentation)

        logger.info(f"✅ Documentation generated: {doc_file.name}")

    def _convert_yaml_to_json(self, yaml_file: str) -> str:
        """Convert YAML file to JSON"""
        import yaml

        with open(yaml_file, 'r') as f:
            data = yaml.safe_load(f)

        json_file = yaml_file.replace('.yaml', '.json').replace('.yml', '.json')

        with open(json_file, 'w') as f:
            json.dump(data, f, indent=2)

        logger.info(f"Converted YAML to JSON: {Path(json_file).name}")
        return json_file

    def fix_medical_affairs_v5_extensions(self):
        """Special method to fix Medical Affairs v5.0 extension tables"""
        logger.info("\n🔧 FIXING MEDICAL AFFAIRS V5.0 EXTENSIONS")
        logger.info("="*60)

        # Path to Medical Affairs data
        ma_file = Path("/Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json")

        if not ma_file.exists():
            logger.error(f"Medical Affairs data not found: {ma_file}")
            return

        # Load and analyze the data
        with open(ma_file, 'r') as f:
            data = json.load(f)

        personas = data.get('personas', [])
        logger.info(f"Found {len(personas)} Medical Affairs personas")

        # Create a specialized transformation for v5.0 tables
        sql_parts = []

        sql_parts.append(f"""-- ============================================================
-- Medical Affairs V5.0 Extension Tables Fix
-- Generated: {datetime.now().isoformat()}
-- ============================================================

BEGIN;

-- First, get all Medical Affairs persona IDs
WITH medical_affairs_personas AS (
    SELECT id, name, slug
    FROM personas
    WHERE tenant_id = '{self.config.tenant_id}'
    AND function_id = (SELECT id FROM org_functions WHERE slug = 'medical-affairs')
)
""")

        # Generate extension table inserts
        for i, persona in enumerate(personas, 1):
            name = persona.get('core_profile', {}).get('name', f'Persona {i}')
            slug = persona.get('core_profile', {}).get('slug', '')

            # Week in life data
            week_in_life = persona.get('week_in_life', [])
            if week_in_life:
                for day in week_in_life:
                    sql_parts.append(f"""
-- Week in Life for {name}
INSERT INTO persona_week_in_life (
    id, persona_id, tenant_id, day_of_week,
    typical_start_time, typical_end_time,
    meeting_load, focus_time_hours,
    typical_activities, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    '{self.config.tenant_id}'::uuid,
    '{day.get('day_of_week', 'Monday')}',
    '{day.get('typical_start_time', '09:00')}'::time,
    '{day.get('typical_end_time', '18:00')}'::time,
    '{day.get('meeting_load', 'moderate')}',
    {day.get('focus_time_hours', 2)},
    ARRAY{day.get('typical_activities', [])}::TEXT[],
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = '{slug}'
ON CONFLICT DO NOTHING;
""")

            # Internal stakeholders
            stakeholders = persona.get('internal_stakeholders', [])
            if stakeholders:
                for stakeholder in stakeholders:
                    sql_parts.append(f"""
-- Internal Stakeholder for {name}
INSERT INTO persona_internal_stakeholders (
    id, persona_id, tenant_id,
    stakeholder_name, stakeholder_role,
    relationship_type, interaction_frequency,
    collaboration_importance, created_at
)
SELECT
    gen_random_uuid(),
    p.id,
    '{self.config.tenant_id}'::uuid,
    '{stakeholder.get('stakeholder_name', 'Stakeholder')}',
    '{stakeholder.get('stakeholder_role', 'Role')}',
    '{stakeholder.get('relationship_type', 'peer')}',
    '{stakeholder.get('interaction_frequency', 'weekly')}',
    '{stakeholder.get('collaboration_importance', 'medium')}',
    NOW()
FROM medical_affairs_personas p
WHERE p.slug = '{slug}'
ON CONFLICT DO NOTHING;
""")

        # Add validation
        sql_parts.append("""
-- Validate extension data
SELECT
    'Week in Life' as table_name,
    COUNT(*) as records
FROM persona_week_in_life
WHERE tenant_id = '{self.config.tenant_id}'
UNION ALL
SELECT
    'Internal Stakeholders',
    COUNT(*)
FROM persona_internal_stakeholders
WHERE tenant_id = '{self.config.tenant_id}';

COMMIT;
""")

        # Save SQL file
        sql_file = self.seeds_dir / f"fix_medical_affairs_v5_extensions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"

        with open(sql_file, 'w') as f:
            f.write('\n'.join(sql_parts))

        logger.info(f"✅ Generated fix SQL: {sql_file.name}")

        return sql_file


def main():
    """Main execution"""
    import argparse

    parser = argparse.ArgumentParser(
        description="VITAL Platform - Persona Seeding Orchestrator"
    )
    parser.add_argument(
        "--database-url",
        required=True,
        help="PostgreSQL connection string"
    )
    parser.add_argument(
        "--tenant-id",
        required=True,
        help="Tenant UUID"
    )
    parser.add_argument(
        "--business-function",
        default="medical-affairs",
        help="Business function (e.g., medical-affairs, sales, marketing)"
    )
    parser.add_argument(
        "--working-dir",
        default="/Users/hichamnaim/Downloads/Cursor/VITAL path",
        help="Working directory"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without making actual changes"
    )
    parser.add_argument(
        "--skip-introspection",
        action="store_true",
        help="Skip schema introspection (use existing)"
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip SQL validation"
    )
    parser.add_argument(
        "--auto-deploy",
        action="store_true",
        help="Automatically deploy SQL to database"
    )
    parser.add_argument(
        "--fix-medical-affairs",
        action="store_true",
        help="Fix Medical Affairs v5.0 extension tables"
    )

    args = parser.parse_args()

    # Create config
    config = OrchestratorConfig(
        database_url=args.database_url,
        tenant_id=args.tenant_id,
        business_function=args.business_function,
        working_dir=args.working_dir,
        dry_run=args.dry_run,
        skip_introspection=args.skip_introspection,
        skip_validation=args.skip_validation,
        auto_deploy=args.auto_deploy
    )

    # Create orchestrator
    orchestrator = PersonaSeedingOrchestrator(config)

    # Run appropriate action
    if args.fix_medical_affairs:
        orchestrator.fix_medical_affairs_v5_extensions()
    else:
        orchestrator.run_complete_pipeline()


if __name__ == "__main__":
    main()