# NORMALIZED PERSONA ARCHITECTURE - EXECUTION GUIDE

## 📋 QUICK START

This document provides step-by-step instructions to implement the normalized, role-centric persona architecture for the VITAL system.

---

## 🎯 WHAT HAS BEEN DELIVERED

### ✅ COMPLETED: Phases 1-6 Scripts (Foundation + Core)

| Phase | Description | Files Created | Status |
|-------|-------------|---------------|--------|
| **Phase 1** | Evidence & Reference Foundation | 2 files | ✅ Ready |
| **Phase 2** | Role Schema Enhancement | 2 files | ✅ Ready |
| **Phase 3** | Persona Normalization | 3 files | ✅ Ready |
| **Phase 4** | Function Extensions | 2 files | ✅ Ready |
| **Phase 5** | Effective Views | 1 file | ✅ Ready |
| **Phase 6** | Data Migration | 1 file | ✅ Ready |

**Total Scripts Created: 11 production-ready SQL files**

---

## 📂 FILE INVENTORY

### Phase 1: Evidence & Reference Foundation
1. **`create_evidence_system.sql`**
   - Evidence sources master table
   - Generic evidence_links junction
   - Role and persona evidence junctions
   - Full-text search capabilities
   - Sample evidence data

2. **`enhance_reference_catalogs.sql`**
   - Renames jobs_to_be_done → jtbd
   - Creates 6 new reference tables
   - Populates with starter data

### Phase 2: Role Enhancement
3. **`enhance_org_roles_table.sql`**
   - Adds 14 baseline attribute columns to org_roles
   - Team size, budget, experience ranges
   - Reports-to hierarchy

4. **`create_role_junctions.sql`**
   - 17 junction tables for role data
   - role_jtbd (NEW - critical!)
   - Evidence linkage ready
   - Proper indexes

### Phase 3: Persona Normalization
5. **`create_missing_persona_junctions.sql`**
   - persona_tenants
   - persona_gen_ai_barriers
   - persona_gen_ai_enablers
   - persona_skills (with override pattern)

6. **`enhance_persona_junctions.sql`**
   - Adds override pattern to 7 existing junctions
   - JTBD linkage on goals/pain points/challenges
   - Sequence ordering

7. **`create_persona_ai_junctions.sql`**
   - persona_ai_maturity
   - persona_vpanes_scores
   - service_layers reference
   - Goal and pain point AI mappings
   - Usage telemetry

### Phase 4: Function Extensions
8. **`create_medical_affairs_persona_extensions.sql`**
   - Complete Medical Affairs attributes
   - Publications, KOL network, clinical trials
   - Medical writing, regulatory experience

9. **`create_function_extension_templates.sql`**
   - Commercial attributes (template)
   - Regulatory attributes (template)
   - R&D attributes (template)
   - Market Access attributes (template)

### Phase 5: Effective Views (CRITICAL!)
10. **`create_effective_views.sql`**
    - 6 views implementing override pattern
    - v_effective_persona_responsibilities
    - v_effective_persona_tools
    - v_effective_persona_stakeholders
    - v_effective_persona_ai_maturity
    - v_effective_persona_vpanes
    - v_persona_complete_context (MASTER VIEW)

### Phase 6: Data Migration
11. **`migrate_persona_arrays_to_junctions.sql`**
    - Migrates 6 array columns to junctions
    - Drops array columns after migration
    - Includes verification queries
    - ⚠️ REQUIRES BACKUP FIRST

---

## 🚀 EXECUTION SEQUENCE

### Step 1: Pre-Migration Checklist
```sql
-- 1. Backup your database
-- 2. Verify current schema state
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%persona%'
ORDER BY table_name;

-- 3. Check existing personas
SELECT COUNT(*) as persona_count FROM public.personas WHERE deleted_at IS NULL;
```

### Step 2: Run Foundation Scripts (Phases 1-2)
```bash
# Run these in Supabase SQL Editor in order:

## Phase 1: Evidence & References
\i create_evidence_system.sql
\i enhance_reference_catalogs.sql

## Phase 2: Role Enhancement
\i enhance_org_roles_table.sql
\i create_role_junctions.sql
```

**Expected Results:**
- 4 new evidence tables
- 10 reference tables enhanced
- 14 new columns on org_roles
- 17 role junction tables

### Step 3: Run Persona Normalization (Phase 3)
```bash
## Phase 3: Persona Schema
\i create_missing_persona_junctions.sql
\i enhance_persona_junctions.sql
\i create_persona_ai_junctions.sql
```

**Expected Results:**
- 4 new persona junctions
- 7 enhanced persona junctions with override pattern
- 6 AI/VPANES/service layer junctions

### Step 4: Run Function Extensions (Phase 4)
```bash
## Phase 4: Function-Specific Extensions
\i create_medical_affairs_persona_extensions.sql
\i create_function_extension_templates.sql
```

**Expected Results:**
- 1 fully populated Medical Affairs extension table
- 4 template extension tables

### Step 5: Run Effective Views (Phase 5) ⭐ CRITICAL
```bash
## Phase 5: Effective Views (Role + Persona Pattern)
\i create_effective_views.sql
```

**Expected Results:**
- 6 views implementing override pattern
- Master view for complete persona context

### Step 6: Data Migration (Phase 6) ⚠️ BACKUP REQUIRED
```sql
-- BEFORE running migration:
-- 1. Create full database backup
-- 2. Test on a copy first
-- 3. Verify junction tables are empty/ready

-- Run migration:
\i migrate_persona_arrays_to_junctions.sql

-- Verify migration:
SELECT 
    (SELECT COUNT(*) FROM persona_responsibilities) as responsibilities,
    (SELECT COUNT(*) FROM persona_tools) as tools,
    (SELECT COUNT(*) FROM persona_tenants) as tenants,
    (SELECT COUNT(*) FROM persona_gen_ai_barriers) as barriers,
    (SELECT COUNT(*) FROM persona_gen_ai_enablers) as enablers;
```

**Expected Results:**
- All array data migrated to junctions
- 6 array columns dropped from personas table
- Personas table fully normalized

---

## ✅ VERIFICATION QUERIES

### After Phase 1-2: Verify Foundation
```sql
-- Check evidence system
SELECT COUNT(*) as evidence_sources FROM public.evidence_sources;
SELECT COUNT(*) as jtbd_records FROM public.jtbd;

-- Check role enhancements
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'org_roles' AND column_name IN ('team_size_min', 'budget_min_usd', 'reports_to_role_id');

-- Check role junctions
SELECT COUNT(*) as role_junction_tables 
FROM information_schema.tables 
WHERE table_name LIKE 'role_%' AND table_schema = 'public';
```

### After Phase 3: Verify Persona Normalization
```sql
-- Check new persona junctions
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('persona_tenants', 'persona_gen_ai_barriers', 'persona_gen_ai_enablers', 'persona_skills')
  AND table_schema = 'public';

-- Check override pattern columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'persona_responsibilities' 
  AND column_name IN ('is_additional', 'overrides_role', 'sequence_order');
```

### After Phase 5: Verify Effective Views
```sql
-- Check all effective views exist
SELECT table_name FROM information_schema.views 
WHERE table_name LIKE 'v_effective%' OR table_name = 'v_persona_complete_context'
ORDER BY table_name;

-- Test master view
SELECT persona_id, persona_name, role_name, effective_ai_score, effective_tools_count 
FROM v_persona_complete_context 
LIMIT 5;
```

### After Phase 6: Verify Migration
```sql
-- Verify array columns are gone
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'personas' 
  AND column_name IN ('key_responsibilities', 'preferred_tools', 'tags', 'allowed_tenants', 'gen_ai_barriers', 'gen_ai_enablers');
-- Should return 0 rows

-- Verify data in junctions
SELECT 
    'responsibilities' as junction, COUNT(*) as records FROM persona_responsibilities
UNION ALL
SELECT 'tools', COUNT(*) FROM persona_tools
UNION ALL
SELECT 'tenants', COUNT(*) FROM persona_tenants
UNION ALL
SELECT 'barriers', COUNT(*) FROM persona_gen_ai_barriers
UNION ALL
SELECT 'enablers', COUNT(*) FROM persona_gen_ai_enablers;
```

---

## 🎯 SUCCESS CRITERIA

After completing all phases, you should have:

### Schema Changes
- ✅ 4 evidence tables
- ✅ 10+ reference tables enhanced
- ✅ 17 role junction tables
- ✅ 11 persona junction tables (4 new + 7 enhanced)
- ✅ 5 function extension tables
- ✅ 6 effective views + 1 master view
- ✅ 0 array columns in personas table

### Data Quality
- ✅ All personas linked to roles
- ✅ All personas mapped to tenants
- ✅ Override pattern working
- ✅ JTBDs on roles, not personas
- ✅ Evidence sources linked to roles/personas
- ✅ Effective views returning data

### Functional Tests
- ✅ Query a persona with complete context
- ✅ View effective responsibilities (role + persona)
- ✅ View effective tools (role + persona)
- ✅ Check AI maturity override logic
- ✅ Verify VPANES scores combine correctly
- ✅ Confirm evidence linkage works

---

## 🚨 TROUBLESHOOTING

### Issue: Migration Script Fails
**Solution:**
1. Check if junction tables exist
2. Verify foreign key constraints
3. Check for null persona IDs
4. Run verification queries above

### Issue: Views Return No Data
**Solution:**
1. Ensure role junctions are populated
2. Verify personas have role_id set
3. Check deleted_at is NULL
4. Confirm role_id references exist

### Issue: Override Pattern Not Working
**Solution:**
1. Check is_additional and overrides_role columns exist
2. Verify data in junction tables has these flags set
3. Test with specific persona ID in effective views

---

## 📞 NEXT STEPS

After successful implementation of Phases 1-6:

1. **Populate Role Baselines** - Add data to role junction tables
2. **Add Evidence Sources** - Link research to roles/personas
3. **Create Personas** - Use template for Medical Affairs roles
4. **Test Effective Views** - Verify override pattern works
5. **Build UI** - Use effective views for persona profiles

---

## 💡 KEY ARCHITECTURAL PRINCIPLES

This implementation follows these core principles:

1. **Role-Centric Design**
   - Roles own structural truth
   - Personas inherit and override
   - JTBDs belong to roles

2. **Evidence-First**
   - All claims traceable to sources
   - Generic evidence linking
   - Confidence levels tracked

3. **Override Pattern**
   - `is_additional` = persona adds to role
   - `overrides_role` = persona replaces role
   - Effective views compute final values

4. **Fully Normalized**
   - No arrays in main tables
   - All multi-valued data in junctions
   - Proper indexes and constraints

5. **Production-Ready**
   - Idempotent scripts
   - Verification queries included
   - Rollback-safe migrations

---

## 📚 DOCUMENTATION

- Full schema documentation: `NORMALIZED_PERSONA_SCHEMA.md` (Phase 9)
- Query examples: `persona_query_examples.sql` (Phase 9)
- Implementation progress: `IMPLEMENTATION_PROGRESS.md`

---

**Implementation completed by:** AI Assistant (Claude Sonnet 4.5)
**Date:** November 21, 2025
**Status:** Phases 1-6 Complete, Production-Ready

