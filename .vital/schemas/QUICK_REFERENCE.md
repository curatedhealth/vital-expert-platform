# Pharma Role Enrichment - Quick Reference Card

## At a Glance

| Category | Count | Description |
|----------|-------|-------------|
| New Reference Tables | 11 | Normalized domain data (skills, certs, KPIs, etc.) |
| New Junction Tables | 11 | M:M relationships between roles and metadata |
| New org_roles Columns | 15 | Pharma-specific role attributes |
| Deprecated Columns | 2 | Arrays migrated to junction tables |
| Total New Indexes | 37 | Performance optimization |
| Migration Files | 5 | Phased deployment approach |
| Estimated Storage | 100MB | Initial with seed data |

---

## New Reference Tables

| Table | Purpose | Est. Rows | Pharma-Specific |
|-------|---------|-----------|-----------------|
| `skills` | Master skills registry with proficiency levels | 500 | Yes |
| `certifications` | Professional certifications and licenses | 50 | Yes |
| `competencies` | Core competencies framework | 30 | No |
| `kpis` | Key Performance Indicators | 50 | Yes |
| `training_programs` | Required/recommended training | 100 | Yes |
| `regulatory_requirements` | Compliance requirements | 75 | Yes |
| `systems` | Software/tools used | 50 | Yes |
| `deliverables` | Work products produced | 100 | Yes |
| `therapeutic_areas` | Disease states/indications | 30 | Yes |
| `stakeholder_types` | Internal/external stakeholders | 40 | No |
| `career_paths` | Career progression pathways | 20 | No |

---

## New org_roles Columns

### Pharma-Specific Flags
```sql
role_type VARCHAR(50)              -- Clinical, Research, Regulatory, etc.
regulatory_oversight BOOLEAN       -- Has regulatory duties
gxp_critical BOOLEAN              -- Involves GxP compliance
patient_facing BOOLEAN            -- Direct patient interaction
safety_critical BOOLEAN           -- Pharmacovigilance responsibilities
```

### Work Environment
```sql
travel_requirement_pct INTEGER    -- 0-100% travel
remote_eligible BOOLEAN           -- Can work remotely
oncall_required BOOLEAN           -- On-call rotation
```

### Compensation & Career
```sql
salary_band_min INTEGER           -- Min salary for planning
salary_band_max INTEGER           -- Max salary for planning
salary_currency VARCHAR(3)        -- ISO currency code (default: USD)
job_family VARCHAR(100)           -- HR job family
career_level VARCHAR(50)          -- Career progression level
succession_planning_priority INT  -- 0-100 priority score
```

### Extensibility
```sql
metadata JSONB                    -- Flexible JSON metadata
```

---

## New Junction Tables

### Skills & Competencies
- `role_skills` - Skills required with proficiency levels
- `role_certifications` - Required/preferred certifications
- `role_competencies` - Core competencies with weights

### Performance & Development
- `role_kpis` - Performance measurement metrics
- `role_training_programs` - Training requirements
- `role_career_paths` - Career progression options

### Compliance & Operations
- `role_regulatory_requirements` - Regulatory compliance
- `role_systems` - Software/tools access
- `role_deliverables` - Work products ownership

### Expertise & Interactions
- `role_therapeutic_areas` - Therapeutic expertise
- `role_stakeholder_interactions` - Stakeholder relationships

---

## Junction Table Patterns

All junction tables follow this structure:

```sql
CREATE TABLE role_{reference_table} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    {reference}_id UUID NOT NULL REFERENCES {reference_table}(id) ON DELETE CASCADE,

    -- Relationship-specific columns
    {additional_columns},

    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, {reference}_id)
);

CREATE INDEX idx_role_{reference}_role ON role_{reference}(role_id);
CREATE INDEX idx_role_{reference}_{reference} ON role_{reference}({reference}_id);
```

---

## Common Query Patterns

### 1. Get Complete Role Profile
```sql
SELECT r.*,
  json_agg(DISTINCT s.*) as skills,
  json_agg(DISTINCT c.*) as certifications,
  json_agg(DISTINCT k.*) as kpis
FROM org_roles r
LEFT JOIN role_skills rs ON r.id = rs.role_id
LEFT JOIN skills s ON rs.skill_id = s.id
-- ... other joins
WHERE r.id = $1
GROUP BY r.id;
```

### 2. Find Roles by Skill
```sql
SELECT r.role_name, rs.required_proficiency
FROM org_roles r
JOIN role_skills rs ON r.id = rs.role_id
JOIN skills s ON rs.skill_id = s.id
WHERE s.name = 'Clinical Trial Management'
  AND rs.is_required = true;
```

### 3. Regulatory Roles
```sql
SELECT r.role_name, COUNT(rrr.id) as req_count
FROM org_roles r
JOIN role_regulatory_requirements rrr ON r.id = rrr.role_id
WHERE r.gxp_critical = true
GROUP BY r.id;
```

### 4. Career Paths
```sql
WITH RECURSIVE career_tree AS (
  SELECT id, role_name, 0 as level
  FROM org_roles WHERE id = $1
  UNION ALL
  SELECT r.id, r.role_name, ct.level + 1
  FROM career_tree ct
  JOIN role_career_paths rcp ON ct.id = rcp.from_role_id
  JOIN org_roles r ON rcp.to_role_id = r.id
  WHERE ct.level < 5
)
SELECT * FROM career_tree;
```

---

## Migration Sequence

```
1. 20251122000001_pharma_roles_reference_tables.sql
   └─> Creates all 11 reference tables

2. 20251122000002_pharma_roles_junction_tables.sql
   └─> Creates all 11 junction tables

3. 20251122000003_pharma_roles_extend_org_roles.sql
   └─> Adds 15 new columns to org_roles

4. 20251122000004_pharma_roles_migrate_array_data.sql
   └─> Migrates required_skills and required_certifications

5. 20251122000005_pharma_roles_seed_core_data.sql
   └─> Loads pharma-specific reference data
```

---

## Naming Conventions

### Tables
- Reference: `{noun}` or `{noun}s` (e.g., `skills`, `kpis`)
- Org: `org_{entity}` (e.g., `org_roles`)
- Junction: `{table1}_{table2}` (e.g., `role_skills`)

### Columns
- PK: `id UUID`
- FK: `{table}_id UUID`
- Boolean: `is_{adjective}` or `{verb}_ready`
- Timestamps: `created_at`, `updated_at`
- Audit: `created_by`, `updated_by`

### Indexes
- Pattern: `idx_{table}_{column(s)}`
- Examples: `idx_role_skills_role`, `idx_skills_search`

### Constraints
- Unique: `UNIQUE(col1, col2)`
- Check: `CHECK (col IN (...))`
- FK: `ON DELETE CASCADE` or `ON DELETE SET NULL`

---

## Key Features

### Full-Text Search
All reference tables include:
```sql
search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
) STORED
```

### Tenant Isolation
All tables include:
```sql
tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
```

### Audit Trail
All reference tables include:
```sql
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

With trigger:
```sql
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users"
ON {table} FOR SELECT TO authenticated USING (true);
```

---

## Deprecated Fields

| Column | Replacement | Migration Phase |
|--------|-------------|-----------------|
| `required_skills TEXT[]` | `role_skills` junction table | Phase 4 |
| `required_certifications TEXT[]` | `role_certifications` junction table | Phase 4 |

Deprecation strategy:
1. Migrate data to junction tables
2. Rename columns to `*_deprecated`
3. Keep for 6 months as rollback safety
4. Remove in future migration

---

## Performance Tips

### Indexes
- All FK columns are indexed
- Category/type columns are indexed
- Boolean flags are indexed
- Full-text search uses GIN indexes

### Queries
- Use JOINs for related data
- Aggregate with `json_agg()` for one query
- Filter at junction table level when possible
- Use prepared statements with parameters

### Caching
- Cache complete role profiles (Redis)
- Invalidate on role/junction updates
- Pre-compute dashboard aggregations
- Consider materialized views for analytics

---

## Validation Checklist

### Pre-Migration
- [ ] Backup production database
- [ ] Test migrations on dev/staging
- [ ] Verify foreign key references
- [ ] Check constraint values
- [ ] Generate TypeScript types
- [ ] Update API documentation

### Post-Migration
- [ ] Verify tables created
- [ ] Check indexes exist
- [ ] Test triggers
- [ ] Validate RLS policies
- [ ] Run sample queries
- [ ] Load seed data
- [ ] Performance test
- [ ] Check tenant isolation

---

## Common Issues & Solutions

### Issue: Junction table query slow
**Solution**: Ensure FK columns are indexed
```sql
CREATE INDEX IF NOT EXISTS idx_role_skills_role ON role_skills(role_id);
```

### Issue: Array migration lost data
**Solution**: Rollback and verify data mapping
```sql
-- Check array data before migration
SELECT id, required_skills FROM org_roles WHERE required_skills IS NOT NULL;
```

### Issue: Full-text search not working
**Solution**: Rebuild search vector
```sql
-- Reindex search vector
REINDEX INDEX idx_{table}_search;
```

---

## Getting Help

### Documentation
- Full mapping: `PHARMA_ROLE_ENRICHMENT_SCHEMA_MAPPING.md`
- Schema diagram: `SCHEMA_DIAGRAM.md`
- Registry: `registry.json`

### Tools
- Type generation: `npm run schema:generate-types`
- Introspection: `npm run schema:introspect`
- Drift detection: `npm run schema:detect-drift`

### Contacts
- Schema issues: VITAL Schema Mapper Agent
- Data quality: Data team
- Performance: Database team

---

## Example: Adding a New Role

```sql
-- 1. Insert role
INSERT INTO org_roles (
    unique_id, role_name, role_type,
    gxp_critical, regulatory_oversight
) VALUES (
    'MSL-001', 'Medical Science Liaison',
    'Clinical', true, true
);

-- 2. Add skills
INSERT INTO role_skills (role_id, skill_id, required_proficiency, is_required)
SELECT r.id, s.id, 'Expert', true
FROM org_roles r, skills s
WHERE r.unique_id = 'MSL-001'
  AND s.name = 'Clinical Trial Design';

-- 3. Add certifications
INSERT INTO role_certifications (role_id, certification_id, is_required)
SELECT r.id, c.id, true
FROM org_roles r, certifications c
WHERE r.unique_id = 'MSL-001'
  AND c.abbreviation = 'PharmD';

-- 4. Add KPIs
INSERT INTO role_kpis (role_id, kpi_id, weight, is_primary)
SELECT r.id, k.id, 0.3, true
FROM org_roles r, kpis k
WHERE r.unique_id = 'MSL-001'
  AND k.name = 'HCP Engagement Rate';
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Ready for Use
