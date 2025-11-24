# VITAL PLATFORM - SQL EXECUTION SEQUENCE
# Complete setup guide for pharmaceutical organizational structure

## ═══════════════════════════════════════════════════════════════════
## PHASE 1: ORGANIZATIONAL STRUCTURE (CORE FOUNDATION)
## ═══════════════════════════════════════════════════════════════════

### Step 1: Clean Slate & Foundation
```sql
-- If starting fresh or need to rebuild org structure:
\i rebuild_org_structure_only.sql
-- ✓ Drops and recreates org tables (functions, departments, roles)
-- ✓ Creates all enum types and base schema
```

### Step 2: Populate Functions (14 pharmaceutical functions)
```sql
\i populate_pharma_functions.sql
-- ✓ Creates 15 functions with mission statements, priorities
-- ✓ Medical Affairs, Market Access, Commercial, Regulatory, etc.
```

### Step 3: Populate Departments (100+ departments)
```sql
\i populate_pharma_departments.sql
-- ✓ Creates 100+ departments mapped to functions
-- ✓ Includes operating model, field/office mix
```

### Step 4: Populate ALL Roles (690+ roles)
```sql
-- Option A: Run master script (all at once)
\i populate_all_roles_master.sql
-- ✓ Runs all 15 role population scripts in sequence

-- Option B: Run individual scripts (one function at a time)
\i populate_roles_01_medical_affairs.sql
\i populate_roles_02_market_access.sql
\i populate_roles_03_commercial_organization.sql
-- ... (continue for all 15 functions)
```

### Step 5: Verify Org Structure
```sql
\i verify_complete_org_structure.sql
-- ✓ Shows complete stats, quality checks, sample data
```

## ═══════════════════════════════════════════════════════════════════
## PHASE 2: TENANT MAPPING
## ═══════════════════════════════════════════════════════════════════

### Step 6: Map Everything to Pharmaceuticals Tenant
```sql
\i map_org_to_pharma_tenant.sql
-- ✓ Maps all functions, departments, roles to pharma tenant
-- ✓ Uses junction tables for multi-tenant support
```

## ═══════════════════════════════════════════════════════════════════
## PHASE 3: REFERENCE DATA (SKILLS, TOOLS, STAKEHOLDERS, ETC.)
## ═══════════════════════════════════════════════════════════════════

### Step 7: Populate ALL Reference Tables
```sql
\i populate_all_reference_tables_master.sql
-- ✓ Therapeutic areas, disease areas, company sizes
-- ✓ AI maturity levels, VPANES dimensions
-- ✓ Stakeholders, responsibilities, KPIs
-- ✓ Skills (65), Tools (55)
-- ✓ Total: ~300+ reference records
```

## ═══════════════════════════════════════════════════════════════════
## PHASE 4: APPLICATION SCHEMA (AGENTS, PROMPTS, KNOWLEDGE, ETC.)
## ═══════════════════════════════════════════════════════════════════

### Step 8: Create Application Tables & Junctions
```sql
\i create_all_application_tables_final.sql
-- ✓ agents, agent_tools_catalog, knowledge, prompts
-- ✓ capabilities, workflows, strategic_priorities, use_cases
-- ✓ 15+ junction tables for relationships
-- ✓ Distinguishes human tools vs agent tools
```

### Step 9: Add Organizational Mapping to Application Tables
```sql
\i add_org_mapping_to_all_tables.sql
-- ✓ Adds function_id, function_name, department_id, department_name, role_id, role_name
-- ✓ Updates: agents, prompts, knowledge_base, capabilities, jtbds, workflows
-- ✓ Creates auto-sync triggers
-- ✓ Creates comprehensive views
```

## ═══════════════════════════════════════════════════════════════════
## COMPLETE EXECUTION SEQUENCE (COPY & PASTE)
## ═══════════════════════════════════════════════════════════════════

```sql
-- 1. Foundation
\i rebuild_org_structure_only.sql

-- 2. Organizational Structure
\i populate_pharma_functions.sql
\i populate_pharma_departments.sql
\i populate_all_roles_master.sql

-- 3. Verify
\i verify_complete_org_structure.sql

-- 4. Tenant Mapping
\i map_org_to_pharma_tenant.sql

-- 5. Reference Data
\i populate_all_reference_tables_master.sql

-- 6. Application Schema
\i create_all_application_tables_final.sql

-- 7. Organizational Mapping
\i add_org_mapping_to_all_tables.sql
```

## ═══════════════════════════════════════════════════════════════════
## WHAT YOU'LL HAVE AFTER COMPLETION
## ═══════════════════════════════════════════════════════════════════

### Organizational Structure
- ✅ 15 pharmaceutical functions
- ✅ 100+ departments
- ✅ 690+ roles (global, regional, local)
- ✅ All mapped to Pharmaceuticals tenant

### Reference Data
- ✅ 16 therapeutic areas
- ✅ 10 disease areas
- ✅ 5 company sizes
- ✅ 5 AI maturity levels
- ✅ 6 VPANES dimensions
- ✅ 27 stakeholder types
- ✅ 40 responsibility types
- ✅ 24 KPI definitions
- ✅ 65 skills
- ✅ 55 human tools

### Application Schema
- ✅ agents (with org mapping)
- ✅ agent_tools_catalog (AI agent APIs)
- ✅ prompts (with org mapping)
- ✅ knowledge_base (with org mapping)
- ✅ capabilities (with org mapping)
- ✅ workflows (with org mapping)
- ✅ strategic_priorities
- ✅ use_cases
- ✅ 15+ junction tables

### Total Records Created
- ✅ 15 functions
- ✅ 100+ departments  
- ✅ 690+ roles
- ✅ 300+ reference records
- ✅ 8+ application tables
- ✅ 20+ junction tables

## ═══════════════════════════════════════════════════════════════════
## OPTIONAL: IF YOU ALREADY RAN SOME SCRIPTS
## ═══════════════════════════════════════════════════════════════════

### If you already have org structure:
```sql
-- Skip Steps 1-4, start from:
\i verify_complete_org_structure.sql
\i map_org_to_pharma_tenant.sql
\i populate_all_reference_tables_master.sql
\i create_all_application_tables_final.sql
\i add_org_mapping_to_all_tables.sql
```

### If you already have reference data:
```sql
-- Skip Step 5, just run:
\i create_all_application_tables_final.sql
\i add_org_mapping_to_all_tables.sql
```

### If you already have agents table:
```sql
-- Just run the org mapping:
\i add_org_mapping_to_all_tables.sql
```

## ═══════════════════════════════════════════════════════════════════
## EXECUTION TIME ESTIMATES
## ═══════════════════════════════════════════════════════════════════

- rebuild_org_structure_only.sql: ~5 seconds
- populate_pharma_functions.sql: ~1 second
- populate_pharma_departments.sql: ~2 seconds
- populate_all_roles_master.sql: ~30 seconds (all 690+ roles)
- verify_complete_org_structure.sql: ~2 seconds
- map_org_to_pharma_tenant.sql: ~3 seconds
- populate_all_reference_tables_master.sql: ~5 seconds
- create_all_application_tables_final.sql: ~3 seconds
- add_org_mapping_to_all_tables.sql: ~5 seconds

**Total Time: ~1 minute**

## ═══════════════════════════════════════════════════════════════════
## VERIFICATION QUERIES (RUN AFTER COMPLETION)
## ═══════════════════════════════════════════════════════════════════

```sql
-- Check org structure
SELECT 
    'Functions' as entity, COUNT(*) as count FROM org_functions WHERE deleted_at IS NULL
UNION ALL
SELECT 'Departments', COUNT(*) FROM org_departments WHERE deleted_at IS NULL
UNION ALL
SELECT 'Roles', COUNT(*) FROM org_roles WHERE deleted_at IS NULL
UNION ALL
SELECT 'Tenant Mappings', COUNT(*) FROM role_tenants
UNION ALL
SELECT 'Skills', COUNT(*) FROM skills
UNION ALL
SELECT 'Tools', COUNT(*) FROM tools
UNION ALL
SELECT 'Agents', COUNT(*) FROM agents WHERE deleted_at IS NULL
UNION ALL
SELECT 'Prompts', COUNT(*) FROM prompts;

-- Check org mapping on application tables
SELECT 
    COUNT(*) as agents_with_function,
    COUNT(DISTINCT function_id) as unique_functions,
    COUNT(DISTINCT department_id) as unique_departments,
    COUNT(DISTINCT role_id) as unique_roles
FROM agents
WHERE deleted_at IS NULL;

-- View sample agent with full org context
SELECT * FROM v_agents_full_org LIMIT 5;
```

## ═══════════════════════════════════════════════════════════════════
## READY TO GO! 🚀
## ═══════════════════════════════════════════════════════════════════

