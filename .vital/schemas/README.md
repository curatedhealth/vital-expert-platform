# VITAL Schema Registry

**Version**: 1.0.0
**Last Updated**: 2025-11-22
**Status**: Schema Mapping Complete - Ready for Migration Generation

---

## Overview

This directory contains the complete schema registry and mapping documentation for the VITAL platform's pharmaceutical/biotech role enrichment initiative. The schema mapper has analyzed the existing database structure and created a comprehensive plan for extending the `org_roles` table and related entities with industry-specific metadata.

---

## Directory Structure

```
.vital/schemas/
├── README.md                                          # This file
├── registry.json                                      # Central schema registry
├── PHARMA_ROLE_ENRICHMENT_SCHEMA_MAPPING.md          # Complete mapping document
├── SCHEMA_DIAGRAM.md                                  # Visual schema diagram
├── QUICK_REFERENCE.md                                 # Quick reference card
├── database/
│   └── tables/
│       └── org_roles.json                            # Detailed org_roles schema
├── mappings/                                          # (Future) Schema mappings
├── types/                                             # (Future) Generated types
└── changelog/                                         # (Future) Schema changes

```

---

## Key Documents

### 1. PHARMA_ROLE_ENRICHMENT_SCHEMA_MAPPING.md
**The authoritative schema mapping document.**

Contains:
- Complete analysis of existing schema (26 tables, 13 junction tables)
- Detailed specification for 11 new reference tables
- Specification for 11 new junction tables
- 15 new columns for org_roles table
- Conflict resolution (array fields → junction tables)
- Migration strategy (5 phases)
- TypeScript type generation examples
- Zod validation schema examples
- Performance estimates and optimization strategies
- Query examples and patterns
- Risk assessment and mitigation
- Validation checklists

**Use this for**: Complete technical specification and implementation planning

### 2. SCHEMA_DIAGRAM.md
**Visual representation of the schema architecture.**

Contains:
- ASCII entity-relationship diagrams
- Complete table structure visualization
- Junction table relationship mapping
- Migration dependency tree
- Query pattern examples
- Performance optimization strategies

**Use this for**: Understanding schema relationships and architecture

### 3. QUICK_REFERENCE.md
**Developer quick reference card.**

Contains:
- At-a-glance statistics
- Table and column summaries
- Common query patterns
- Naming conventions
- Migration checklist
- Troubleshooting tips
- Example role creation script

**Use this for**: Day-to-day development reference

### 4. registry.json
**Machine-readable schema registry.**

Contains:
- Metadata for all existing and proposed tables
- Migration strategy details
- Performance estimates
- Naming conventions
- Validation checklist
- Integration points

**Use this for**: Tooling, automation, and programmatic access

### 5. database/tables/org_roles.json
**Complete org_roles table specification.**

Contains:
- All columns (existing + proposed)
- Indexes and constraints
- Foreign key relationships
- Junction table mappings
- Data quality rules
- Migration details
- Usage notes and best practices

**Use this for**: Understanding the org_roles table in depth

---

## Schema Extension Summary

### What's Being Added

**New Reference Tables (11)**:
1. `skills` - Master skills registry with proficiency levels
2. `certifications` - Professional certifications and licenses
3. `competencies` - Core competencies framework
4. `kpis` - Key Performance Indicators
5. `training_programs` - Required/recommended training
6. `regulatory_requirements` - Compliance requirements
7. `systems` - Software/tools registry
8. `deliverables` - Work products catalog
9. `therapeutic_areas` - Disease states/indications
10. `stakeholder_types` - Stakeholder interaction types
11. `career_paths` - Career progression pathways

**New Junction Tables (11)**:
1. `role_skills` - Skills required per role
2. `role_certifications` - Certifications per role
3. `role_competencies` - Competencies per role
4. `role_kpis` - KPIs per role
5. `role_training_programs` - Training per role
6. `role_regulatory_requirements` - Regulatory requirements per role
7. `role_systems` - Systems used per role
8. `role_deliverables` - Deliverables per role
9. `role_therapeutic_areas` - Therapeutic expertise per role
10. `role_stakeholder_interactions` - Stakeholder relationships per role
11. `role_career_paths` - Career progression paths

**New org_roles Columns (15)**:
- `role_type` - Clinical, Research, Regulatory, Commercial, etc.
- `regulatory_oversight` - Has regulatory duties
- `gxp_critical` - Involves GxP compliance
- `patient_facing` - Direct patient interaction
- `safety_critical` - Pharmacovigilance responsibilities
- `travel_requirement_pct` - Travel percentage (0-100)
- `remote_eligible` - Can work remotely
- `oncall_required` - On-call rotation
- `salary_band_min/max` - Salary range for planning
- `salary_currency` - ISO currency code
- `job_family` - HR job family
- `career_level` - Career progression level
- `succession_planning_priority` - Priority score (0-100)
- `metadata` - Flexible JSONB for custom attributes

### What's Being Deprecated

- `required_skills TEXT[]` → Migrated to `role_skills` junction table
- `required_certifications TEXT[]` → Migrated to `role_certifications` junction table

**Deprecation Strategy**: Migrate data → Rename to `*_deprecated` → Keep for 6 months → Remove

---

## Migration Strategy

### Phase 1: Core Reference Tables
**File**: `20251122000001_pharma_roles_reference_tables.sql`
- Create all 11 reference tables
- Add indexes and full-text search
- Set up triggers and RLS policies

### Phase 2: Junction Tables
**File**: `20251122000002_pharma_roles_junction_tables.sql`
- Create all 11 junction tables
- Add foreign key constraints
- Create indexes on FK columns

### Phase 3: Extend org_roles
**File**: `20251122000003_pharma_roles_extend_org_roles.sql`
- Add 15 new columns to org_roles
- Add check constraints
- Update search_vector generation

### Phase 4: Data Migration
**File**: `20251122000004_pharma_roles_migrate_array_data.sql`
- Migrate required_skills to role_skills
- Migrate required_certifications to role_certifications
- Validate data integrity
- Rename array columns to *_deprecated

### Phase 5: Seed Data
**File**: `20251122000005_pharma_roles_seed_core_data.sql`
- Load pharma-specific skills (~200)
- Load certifications (~50)
- Load competencies (~30)
- Load KPIs (~50)
- Load therapeutic areas (~30)
- Load other reference data

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Existing Tables Analyzed | 26 |
| Existing Junction Tables | 13 |
| New Reference Tables | 11 |
| New Junction Tables | 11 |
| New Columns (org_roles) | 15 |
| Deprecated Columns | 2 |
| Total New Indexes | 37 |
| Estimated Storage Impact | ~100MB |
| Migration Files | 5 |
| Pharma-Specific Tables | 8 of 11 |

---

## Schema Patterns Identified

### Naming Conventions
- **Tables**: `lowercase_with_underscores`
- **Org Tables**: `org_{entity}` (e.g., `org_roles`)
- **Junction Tables**: `{table1}_{table2}` (e.g., `role_skills`)
- **Columns**: `lowercase_with_underscores`
- **Primary Keys**: `id UUID DEFAULT uuid_generate_v4()`
- **Foreign Keys**: `{table}_id UUID REFERENCES {table}(id)`
- **Booleans**: `is_{adjective}` or `{verb}_ready`
- **Indexes**: `idx_{table}_{column(s)}`

### Standard Columns
Every reference table includes:
- `id` - UUID primary key
- `name` - Main identifier
- `description` - Detailed description
- `tenant_id` - Multi-tenancy isolation
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp (auto-updated via trigger)
- `search_vector` - Full-text search (auto-generated)

### Junction Table Pattern
```sql
CREATE TABLE role_{reference} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    {reference}_id UUID NOT NULL REFERENCES {reference}(id) ON DELETE CASCADE,
    -- Relationship-specific columns
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, {reference}_id)
);
```

---

## Next Steps

### 1. Review & Approval
- [ ] Review schema mapping with stakeholders
- [ ] Validate pharma-specific requirements
- [ ] Approve migration strategy
- [ ] Sign off on naming conventions

### 2. Seed Data Collection
- [ ] Work with SMEs to gather pharma-specific skills
- [ ] Document certification requirements
- [ ] Define competency framework
- [ ] Identify standard KPIs
- [ ] Map therapeutic areas
- [ ] Catalog systems and tools

### 3. Migration File Generation
- [ ] Generate SQL migration files from specs
- [ ] Create rollback scripts
- [ ] Add data validation queries
- [ ] Test on development database
- [ ] Document migration procedure

### 4. Type Generation
- [ ] Run type generation scripts
- [ ] Generate Zod validation schemas
- [ ] Create API type definitions
- [ ] Update GraphQL schema (if applicable)

### 5. Application Updates
- [ ] Update API endpoints for new fields
- [ ] Create UI components for junction tables
- [ ] Implement role profile views
- [ ] Add search/filter capabilities
- [ ] Update documentation

### 6. Testing & Deployment
- [ ] Test migrations on staging
- [ ] Performance test with sample data
- [ ] Validate tenant isolation
- [ ] Test rollback procedures
- [ ] Deploy to production
- [ ] Monitor performance

---

## Tools & Scripts

### Schema Introspection
```bash
npm run schema:introspect
```
Extracts current database schema to JSON files.

### Type Generation
```bash
npm run schema:generate-types
```
Generates TypeScript types and Zod schemas from JSON specs.

### Drift Detection
```bash
npm run schema:detect-drift
```
Compares documented schema with actual database schema.

### Schema Validation
```bash
npm run schema:validate -- --table org_roles --file data/roles.json
```
Validates data against schema specifications.

---

## Conflicts Resolved

### Conflict 1: Array Fields in org_roles
**Issue**: `required_skills` and `required_certifications` stored as TEXT[] arrays.

**Resolution**: Migrate to normalized junction tables (`role_skills`, `role_certifications`) for better querying, relationships, and data integrity.

**Migration Path**:
1. Create junction tables
2. Migrate array data to junction tables
3. Rename array columns to `*_deprecated`
4. Keep deprecated columns for 6 months as rollback safety
5. Remove deprecated columns in future migration

### Conflict 2: Tenant Column Reference
**Issue**: Schema references `tenants` table added via ALTER statement.

**Resolution**: Ensure `tenant_id` is included in all new tables from the start. No conflict - just consistency check.

---

## Performance Considerations

### Storage Impact
- **Reference Tables**: ~50MB with seed data
- **Junction Tables**: ~10KB initial, scales with usage
- **Indexes**: ~30% overhead on junction tables
- **Total Initial**: ~100MB

### Query Performance
- **Simple Role Lookup**: <10ms (with proper indexes)
- **Full Role Profile**: <50ms (with all junctions)
- **Complex Analytics**: <200ms (career paths, etc.)
- **Full-Text Search**: <100ms (GIN indexes)

### Scalability
- **Roles per Tenant**: 500-2,000 expected
- **Global Skills**: ~500 expected
- **Junction Records**: 50K-500K per tenant
- **Performance Goal**: Maintain sub-200ms queries up to 10M junction records

### Optimization Strategies
1. Index all foreign key columns in junction tables
2. Use materialized views for complex role reports
3. Implement Redis caching for role profiles
4. Consider partitioning if junction tables exceed 1M rows
5. Pre-compute aggregations for dashboards

---

## Integration Points

### With Existing Schema
- `personas.role_id` → `org_roles.id` (existing)
- `agents` can leverage role expertise data (enhancement)
- `jtbd_core` can be linked to roles (future)

### With External Systems
- **HRIS**: Workday, SuccessFactors (role data sync)
- **LMS**: Learning management systems (training tracking)
- **Performance Management**: Goal and KPI tracking
- **Talent Acquisition**: Skills and competency matching

---

## Support

### Documentation
- **Full Mapping**: `PHARMA_ROLE_ENRICHMENT_SCHEMA_MAPPING.md`
- **Diagrams**: `SCHEMA_DIAGRAM.md`
- **Quick Ref**: `QUICK_REFERENCE.md`
- **Table Detail**: `database/tables/org_roles.json`

### Contacts
- **Schema Questions**: VITAL Schema Mapper Agent
- **Data Quality**: Data team
- **Performance Issues**: Database team
- **Business Requirements**: Product team

### Issues & Feedback
Report schema issues via:
1. Create issue in project tracker
2. Tag with `schema`, `database`, `org-roles`
3. Include affected table(s) and migration phase

---

## Version History

### Version 1.0.0 (2025-11-22)
- Initial schema mapping complete
- 11 reference tables specified
- 11 junction tables specified
- 15 new org_roles columns specified
- Migration strategy defined
- Documentation created

### Future Versions
- 2.0.0: Add workflow and approval tables
- 2.1.0: Add collaboration and team tables
- 3.0.0: Add analytics and benchmark tables

---

## License & Usage

This schema documentation is part of the VITAL platform and follows the same license and usage terms. The schema design patterns and approaches can be adapted for similar pharmaceutical/biotech applications with proper attribution.

---

**Status**: ✅ Schema Mapping Complete - Ready for Migration File Generation
**Next Action**: Review with stakeholders and begin seed data collection
**Owner**: VITAL Schema Mapper Agent
**Generated**: 2025-11-22
