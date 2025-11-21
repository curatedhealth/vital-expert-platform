# 10-Data-Schema Directory

## Overview
This directory contains all database schema files, seed data templates, and utilities for the VITAL platform's gold standard role-centric architecture.

## Structure

### 📂 01-core-schema/
Core database schema including evidence system, reference catalogs, and role table enhancements.

**Key Files:**
- `create_evidence_system.sql` - Evidence sources and linkage tables
- `enhance_reference_catalogs.sql` - Tools, skills, responsibilities, AI maturity levels
- `enhance_org_roles_table.sql` - Role baseline attributes
- `add_org_mapping_to_all_tables.sql` - Org structure mapping to application tables
- `create_all_application_tables.sql` - Agents, prompts, knowledge, capabilities

### 📂 02-role-junctions/
Role-level junction tables (structural baseline).

**Key Files:**
- `comprehensive_fix_all.sql` - All-in-one role junctions creation
- `create_role_junctions.sql` - Individual junction tables
- Junction tables: role_tools, role_responsibilities, role_skills, role_stakeholders, role_ai_maturity, role_vpanes_scores, role_jtbd

### 📂 03-persona-junctions/
Persona-level junction tables (behavioral deltas with override pattern).

**Key Files:**
- `create_persona_junctions.sql` - Persona junctions with override flags
- `enhance_persona_junctions.sql` - Add override pattern to existing tables
- `create_persona_ai_junctions.sql` - AI-specific persona mappings
- `create_medical_affairs_persona_extensions.sql` - Function-specific extensions

**Override Pattern:**
- `is_additional = TRUE` → Persona adds to role baseline
- `overrides_role = TRUE` → Persona replaces role baseline
- Default → Persona inherits from role

### 📂 04-views/
Effective views combining role baseline + persona deltas.

**Key Files:**
- `create_effective_views.sql` - All 7 effective views
- `create_architecture_views.sql` - Architecture-level views

**Effective Views:**
1. `v_effective_persona_responsibilities`
2. `v_effective_persona_tools`
3. `v_effective_persona_skills`
4. `v_effective_persona_stakeholders`
5. `v_effective_persona_ai_maturity`
6. `v_effective_persona_vpanes`
7. `v_persona_complete_context` (master view)

### 📂 05-seeds/
Seed data templates and population scripts.

#### 📁 tenants/
- `tenant_seed_template.md` - Tenant creation template with examples

#### 📁 functions/
- `function_seed_template.md` - Function creation template
- `populate_pharma_functions.sql` - 15 pharmaceutical functions

#### 📁 departments/
- `populate_pharma_departments.sql` - Department population

#### 📁 roles/
- `populate_roles_01_medical_affairs.sql`
- `populate_roles_02_market_access.sql`
- ... (15 function-specific role population scripts)
- `populate_all_roles_master.sql` - Master role population

#### 📁 personas/
- `create_4_mece_personas_per_role.sql` - MECE persona generator
- `create_missing_personas_per_role.sql`
- `create_msl_personas.sql` - Medical Affairs example

**MECE Framework:**
```
                 Low Complexity    High Complexity
High AI Maturity    AUTOMATOR        ORCHESTRATOR
Low AI Maturity     LEARNER          SKEPTIC
```

### 📂 06-migrations/
Version-controlled schema migrations.

**Key Files:**
- `rebuild_org_structure_only.sql` - Clean slate org structure rebuild
- `rebuild_gold_standard_org_complete.sql` - Complete rebuild
- `create_multitenant_architecture.sql` - Multi-tenant junction tables
- `create_gold_standard_org_schema.sql` - Gold standard schema

### 📂 07-utilities/

#### 📁 verification/
Data quality checks and verification queries.
- `verify_complete_org_structure.sql`
- Various `check_*.sql` files

#### 📁 cleanup/
Maintenance and cleanup scripts.
- `backup_org_structure_before_deletion.sql`
- `clean_slate_delete_all.sql`
- `cleanup_duplicate_department_slugs.sql`
- Various `fix_*.sql` files

#### 📁 diagnostics/
Troubleshooting and diagnostic queries.
- `analyze_persona_archetype_distribution.sql`
- Various diagnostic queries

### 📂 _archive/
Obsolete files and old implementations.

#### 📁 old-implementations/
- Previous implementation status files
- Phase completion docs
- Superseded schema versions

#### 📁 to-be-categorized/
- 112 SQL files pending review and categorization

## Key Documentation

- **GOLD_STANDARD_SCHEMA.md** - Master schema documentation
- **NAMING_CONVENTIONS.md** - Database naming standards
- **ROLE_PERSONA_INHERITANCE_PATTERN.md** - Override pattern explained
- **IMPLEMENTATION_COMPLETE_SUMMARY.md** - Implementation status

## Usage Guidelines

### Creating New Schema
1. Core tables → `01-core-schema/`
2. Role junctions → `02-role-junctions/`
3. Persona junctions → `03-persona-junctions/`
4. Views → `04-views/`

### Adding Seed Data
1. Use templates in `05-seeds/`
2. Never create one-off seed files
3. Follow industry standards (Pharma, Biotech, MedTech)

### Running Migrations
1. Place in `06-migrations/`
2. Use YYYYMMDD_descriptive_name.sql format
3. Make idempotent (IF NOT EXISTS)
4. Include rollback procedure

### Debugging Issues
1. Verification → `07-utilities/verification/`
2. Cleanup → `07-utilities/cleanup/`
3. Diagnostics → `07-utilities/diagnostics/`

## Schema Principles

### 1. Role-Centric
- Roles = structural truth
- Personas = behavioral deltas
- No data duplication

### 2. Normalized
- No JSONB for queryable data
- Junction tables for multi-valued attributes
- No arrays

### 3. Evidence-Based
- All attributes traceable to evidence_sources
- Confidence levels tracked
- Methodology documented

### 4. Multi-Tenant
- Junction tables for tenant mapping
- No hardcoded tenant_id in main tables
- One entity serves multiple tenants

### 5. MECE Personas
- Exactly 4 personas per role
- 2x2 matrix: AI Maturity × Work Complexity
- Mutually Exclusive, Collectively Exhaustive

## Query Patterns

### ✅ CORRECT: Use Effective Views
```sql
SELECT * FROM v_effective_persona_responsibilities
WHERE persona_id = '<uuid>';
```

### ❌ WRONG: Query Role + Persona Directly
```sql
SELECT * FROM role_responsibilities WHERE role_id = '...';
SELECT * FROM persona_responsibilities WHERE persona_id = '...';
```

## File Naming Conventions

- Schema: `create_*.sql`, `enhance_*.sql`
- Seeds: `populate_*.sql`, `seed_*.sql`
- Migrations: `YYYYMMDD_*.sql`
- Utilities: `verify_*.sql`, `fix_*.sql`, `diagnose_*.sql`

## Next Steps

1. Complete remaining seed templates (departments, roles, personas)
2. Categorize archived SQL files
3. Create materialized views for analytics
4. Add quality validation constraints

## References

- See `.claude.md` for database schema golden rules
- See `AGENT_COORDINATION_GUIDE.md` for file organization rules
- See `GOLD_STANDARD_SCHEMA.md` for complete schema documentation

