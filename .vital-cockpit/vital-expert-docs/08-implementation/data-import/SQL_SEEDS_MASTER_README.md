# 🎯 PRODUCTION SEED TEMPLATES - MASTER GUIDE

## ✅ Complete Seed File Template Library

**Status**: Production Ready
**Schema**: NEW DB (Vital-expert) Compatible
**Last Updated**: 2025-11-14

---

## 📁 Directory Structure

```
PRODUCTION_TEMPLATES/
├── 00_MASTER_README.md                    ← You are here
├── 01_foundation/                         ← Execute FIRST
│   ├── 01_tenants.sql
│   └── 02_industries.sql
├── 02_organization/                       ← Execute SECOND
│   ├── 01_org_functions.sql
│   ├── 02_org_departments.sql
│   └── 03_org_roles.sql
├── 03_content/                            ← Execute THIRD
│   ├── 01_personas.sql
│   ├── 02_strategic_priorities.sql
│   └── 03_jobs_to_be_done.sql
├── 04_operational/                        ← Execute FOURTH
│   ├── 01_agents.sql
│   ├── 02_tools.sql
│   ├── 03_prompts.sql
│   └── 04_knowledge_domains.sql
└── README.md                              ← Quick reference
```

---

## 🚀 Quick Start

### Step 1: Set Your Tenant ID

**IMPORTANT**: Replace `11111111-1111-1111-1111-111111111111` with your actual tenant ID in all files.

```bash
# Find and replace in all files
cd PRODUCTION_TEMPLATES
find . -name "*.sql" -exec sed -i '' "s/11111111-1111-1111-1111-111111111111/YOUR-TENANT-ID/g" {} +
```

### Step 2: Execute in Order

Execute files in this exact order:

```sql
-- Phase 1: Foundation (Required)
01_foundation/01_tenants.sql
01_foundation/02_industries.sql

-- Phase 2: Organization (Required for personas)
02_organization/01_org_functions.sql
02_organization/02_org_departments.sql
02_organization/03_org_roles.sql

-- Phase 3: Content (Core business data)
03_content/01_personas.sql
03_content/02_strategic_priorities.sql
03_content/03_jobs_to_be_done.sql

-- Phase 4: Operational (AI resources)
04_operational/01_agents.sql
04_operational/02_tools.sql
04_operational/03_prompts.sql
04_operational/04_knowledge_domains.sql
```

### Step 3: Verify

After each phase, run verification queries (see below).

---

## 📋 Execution Order & Dependencies

### Phase 1: Foundation

**Purpose**: Create tenants and industries

**Dependencies**: None (start here)

**Files**:
1. `01_tenants.sql` - Create tenant hierarchy
2. `02_industries.sql` - Create industry classifications

**Verification**:
```sql
SELECT id, name, slug, tenant_level, tier FROM tenants;
SELECT code, name FROM industries;
```

---

### Phase 2: Organization

**Purpose**: Create organizational structure

**Dependencies**: Phase 1 (tenants must exist)

**Files**:
1. `01_org_functions.sql` - Functional areas (Clinical Development, Regulatory Affairs, etc.)
2. `02_org_departments.sql` - Departments within functions
3. `03_org_roles.sql` - Roles within departments

**Verification**:
```sql
SELECT code, name FROM org_functions;
SELECT code, name, function_id FROM org_departments;
SELECT code, name, seniority_level FROM org_roles LIMIT 10;
```

**Key Relationships**:
- Functions ← Departments ← Roles
- Each department belongs to a function
- Each role belongs to a department

---

### Phase 3: Content

**Purpose**: Create personas, strategic priorities, and JTBDs

**Dependencies**:
- Phase 1 (tenants)
- Phase 2 (org_roles for personas, industries for strategic priorities)

**Files**:
1. `01_personas.sql` - User personas with org mapping
2. `02_strategic_priorities.sql` - Strategic priorities by industry
3. `03_jobs_to_be_done.sql` - Jobs to be done linked to priorities

**Verification**:
```sql
SELECT slug, name, title, seniority_level FROM personas;
SELECT code, name, priority_level FROM strategic_priorities;
SELECT code, name, functional_area FROM jobs_to_be_done LIMIT 10;
```

**Key Relationships**:
- Personas → org_roles → org_departments → org_functions
- Strategic Priorities → industries
- Jobs to be Done → strategic_priorities

---

### Phase 4: Operational

**Purpose**: Create AI operational resources

**Dependencies**: Phase 1 (tenants)

**Files**:
1. `01_agents.sql` - AI agents
2. `02_tools.sql` - Tool registry
3. `03_prompts.sql` - Prompt library
4. `04_knowledge_domains.sql` - RAG knowledge domains

**Verification**:
```sql
SELECT slug, name, status, validation_status FROM agents;
SELECT code, name, tool_type FROM tools;
SELECT code, name, prompt_type FROM prompts;
SELECT code, name, domain_type FROM knowledge_domains;
```

---

## 🎯 Schema Key Points

### Critical Column Differences

| Table | Key Column | Type | Notes |
|-------|------------|------|-------|
| **agents** | `slug` | TEXT | NOT `code`, UNIQUE per tenant |
| **personas** | `slug` | TEXT | NOT `code`, UNIQUE per tenant |
| **jobs_to_be_done** | `code` | TEXT | NOT `slug`! Different from agents/personas |
| **tenants** | `tenant_path` | ltree | Hierarchical path |
| **tools** | `code` | TEXT | Unique identifier |
| **prompts** | `code` | TEXT | Unique identifier |

### Enum Values to Remember

```sql
-- validation_status
'draft', 'pending', 'approved', 'rejected', 'needs_revision'

-- agent_status
'development', 'active', 'inactive', 'deprecated'

-- tenant_tier
'enterprise', 'professional'

-- job_category
'strategic', 'operational', 'tactical'

-- complexity_type
'low', 'medium', 'high', 'very_high'
```

---

## 🔧 Customization Guide

### Adding Your Own Data

1. **Copy a template file**:
   ```bash
   cp 01_foundation/01_tenants.sql my_tenants.sql
   ```

2. **Update tenant ID**:
   Replace `11111111-1111-1111-1111-111111111111` with your tenant UUID

3. **Add your data**:
   - Keep the column structure
   - Add/modify VALUES section
   - Maintain proper data types

4. **Test**:
   - Execute in a test environment first
   - Verify with SELECT queries
   - Check for constraint violations

### Example: Add New Persona

```sql
INSERT INTO personas (
  tenant_id,
  name,
  slug,
  title,
  seniority_level,
  years_of_experience,
  is_active,
  validation_status
)
VALUES (
  'YOUR-TENANT-ID'::uuid,
  'New Persona Name',
  'new-persona-slug',
  'Job Title',
  'senior',
  10,
  true,
  'approved'
)
ON CONFLICT (tenant_id, slug) DO NOTHING;
```

---

## 📊 Data Relationships Map

```
tenants
  ├─> industries
  │     └─> strategic_priorities
  │           └─> jobs_to_be_done
  │
  ├─> org_functions
  │     └─> org_departments
  │           └─> org_roles
  │                 └─> personas
  │
  ├─> agents
  ├─> tools
  ├─> prompts
  └─> knowledge_domains
```

---

## ✅ Verification Checklist

After executing all templates:

- [ ] **Tenants created**
  ```sql
  SELECT COUNT(*) FROM tenants;
  -- Expected: 1-10 depending on your setup
  ```

- [ ] **Industries created**
  ```sql
  SELECT COUNT(*) FROM industries;
  -- Expected: 4+ (Pharma, Biotech, MedTech, Digital Health)
  ```

- [ ] **Org structure complete**
  ```sql
  SELECT
    (SELECT COUNT(*) FROM org_functions) as functions,
    (SELECT COUNT(*) FROM org_departments) as departments,
    (SELECT COUNT(*) FROM org_roles) as roles;
  -- Expected: 4+ functions, 10+ departments, 10+ roles
  ```

- [ ] **Content loaded**
  ```sql
  SELECT
    (SELECT COUNT(*) FROM personas) as personas,
    (SELECT COUNT(*) FROM strategic_priorities) as priorities,
    (SELECT COUNT(*) FROM jobs_to_be_done) as jtbds;
  -- Expected: 8+ personas, 1+ priorities, 10+ JTBDs
  ```

- [ ] **Operational resources**
  ```sql
  SELECT
    (SELECT COUNT(*) FROM agents) as agents,
    (SELECT COUNT(*) FROM tools) as tools,
    (SELECT COUNT(*) FROM prompts) as prompts,
    (SELECT COUNT(*) FROM knowledge_domains) as domains;
  -- Expected: 8+ agents, 1+ tools, 1+ prompts, 1+ domains
  ```

---

## 🚨 Common Issues & Solutions

### Issue: "column 'code' does not exist"
**Table**: agents, personas
**Solution**: These tables use `slug`, not `code`. Check your template.

### Issue: "column 'slug' does not exist"
**Table**: jobs_to_be_done
**Solution**: This table uses `code`, not `slug`. Different from agents/personas!

### Issue: "invalid enum value"
**Solution**: Check the enum values listed in this guide. Common mistake: using `'published'` instead of `'approved'`.

### Issue: "foreign key violation"
**Solution**: Execute files in the correct order. Parent tables must be loaded before child tables.

### Issue: "duplicate key violation"
**Solution**: The record already exists. This is safe to ignore if using `ON CONFLICT DO NOTHING`.

---

## 📖 Additional Resources

### Template Files

- **Working Examples**:
  - `04_operational/01_agents.sql` - Tested working agents template
  - `03_content/01_personas.sql` - Tested working personas template

### Documentation

- **Schema Reference**: `/supabase/migrations/20251113100002_complete_schema_part3_core.sql`
- **Original Data**: See `/data/` directory for JSON source files
- **Migration History**: See `ORGANIZATIONAL_DATA_GAP_ANALYSIS.md`

### Data Sources

- **Agents**: `/database/seeds/data/agents-comprehensive.json`
- **Personas**: `/data/persona_master_catalogue_20251108_204641.json`
- **JTBDs**: `/data/phase2_all_jtbds_20251108_211301.json`

---

## 🎉 Success Criteria

Your seed data is successfully loaded when:

✅ All verification queries return expected counts
✅ No foreign key constraint violations
✅ All enum values are valid
✅ Data visible in your application
✅ API endpoints return data correctly
✅ Relationships between tables are intact

---

## 📞 Next Steps

1. **Execute Phase 1** (Foundation)
2. **Execute Phase 2** (Organization)
3. **Execute Phase 3** (Content)
4. **Execute Phase 4** (Operational)
5. **Run verification queries**
6. **Test in your application**
7. **Load additional custom data as needed**

---

## 🔄 Maintenance

### Adding New Data

- Copy appropriate template
- Update tenant ID
- Add your data in VALUES section
- Execute via Supabase Studio

### Updating Existing Data

Most templates use `ON CONFLICT DO UPDATE` or `DO NOTHING`, so re-executing is safe.

### Archiving Old Data

Use `deleted_at` column instead of DELETE:
```sql
UPDATE table_name
SET deleted_at = NOW()
WHERE id = 'record-id';
```

---

*Status: Production Ready*
*Templates: 12 files across 4 phases*
*Coverage: All core tables*
*Last Verified: 2025-11-14*
