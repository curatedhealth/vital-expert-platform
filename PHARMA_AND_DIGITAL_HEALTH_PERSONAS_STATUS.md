# Pharma and Digital Health Tenant Personas - Current State Report

**Date**: November 27, 2025  
**Purpose**: Status check and update plan for personas across Pharma and Digital Health tenants

---

## 📊 Executive Summary

Based on the documentation in `/.claude/docs`, here's the current state of personas for both tenants:

| Tenant | Tenant ID | Status | Personas | Org Structure |
|--------|-----------|--------|----------|---------------|
| **Pharmaceuticals** | `c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b` | ⚠️ Partially Mapped | 666 | Missing role/function/dept mapping |
| **VITAL Expert Platform** | `c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244` | ⚠️ Partially Mapped | 331 | 1.5% mapped to functions |
| **Digital Health Startup** | `684f6c2c-b50d-4726-ad92-c76c3b785a89` | ⚠️ Needs Setup | TBD | Structure defined but needs loading |

---

## 🏢 Pharmaceutical Tenant Status

### Current State
- **666 personas** exist in the database
- **0% mapped** to `function_id`, `department_id`, or `role_id`
- Personas were loaded but NOT linked to organizational structure

### What Exists (Defined in Seed Files)
From `PERSONA_STRATEGY_GOLD_STANDARD.md`:
- ✅ **MECE Framework**: 4 personas per role (Automator, Orchestrator, Learner, Skeptic)
- ✅ **400+ personas target** (100+ roles × 4 archetypes)
- ✅ **24 persona attributes** defined
- ✅ **VPANES scoring** framework defined
- ✅ **Service layer preferences** mapped

### What's Missing
1. ❌ `role_id` mapping (personas not linked to roles)
2. ❌ `function_id` mapping (personas not linked to business functions)
3. ❌ `department_id` mapping (personas not linked to departments)
4. ❌ MECE archetype distribution verification

---

## 🏥 Digital Health Startup Tenant Status

### Current State
- **Tenant exists** with ID `684f6c2c-b50d-4726-ad92-c76c3b785a89`
- **Organizational structure DEFINED** in archived SQL files
- **NOT LOADED** into current database (needs verification)

### What Exists (Defined in Archived Files)
From `02_digital_health_organization.sql`:

#### 8 Business Functions
1. **Product & Engineering** (`FN-DTX-PROD`)
2. **Clinical & Medical** (`FN-DTX-CLIN`)
3. **Regulatory & Quality** (`FN-DTX-REG`)
4. **Data Science & AI/ML** (`FN-DTX-DATA`)
5. **Commercial & Growth** (`FN-DTX-COM`)
6. **Patient Experience & Engagement** (`FN-DTX-PAT`)
7. **Security & Privacy** (`FN-DTX-SEC`)
8. **Strategy & Operations** (`FN-DTX-STRAT`)

#### 30+ Departments
- Software Engineering, Product Management, UX/UI Design, DevOps
- Clinical Development, Clinical Operations, Medical Affairs
- Regulatory Affairs, Quality Management System
- Data Science, AI/ML Engineering, Digital Biomarkers
- Sales & BD, Marketing & Growth, Market Access
- Patient Engagement, Behavioral Science
- Information Security, Privacy & Compliance

#### 150+ Roles (DTx-Specific)
**Executive Level:**
- CEO, CPO, CMO, CTO, CISO, CDAO

**VP Level:**
- VP Product, VP Engineering, VP Clinical Development
- VP Regulatory Affairs, VP Commercial, VP Data Science

**Director/Manager Level:**
- Senior Product Manager, Engineering Manager
- Clinical Development Director, Regulatory Affairs Director
- Data Science Director, UX Design Director

**Specialist Level:**
- Software Engineer, Data Scientist, Clinical Research Scientist
- Regulatory Affairs Manager, Quality Assurance Manager
- Medical Science Liaison, Behavioral Scientist

### What's Missing
1. ❌ Need to run `diagnose_and_setup_digital_health.sql` to check database state
2. ❌ If not loaded, need to execute org structure seed files
3. ❌ Need to create 4 MECE personas per role (150+ roles × 4 = 600+ personas)

---

## 📋 MECE Persona Framework (Both Tenants)

The system uses a **2×2 MECE Matrix** for persona creation:

```
                    AI MATURITY
                  HIGH         LOW
              ┌─────────────┬─────────────┐
    ROUTINE   │ AUTOMATOR   │ LEARNER     │
    WORK      │ "Power User"│ "Beginner"  │
              ├─────────────┼─────────────┤
    STRATEGIC │ ORCHESTRATOR│ SKEPTIC     │
    WORK      │ "Visionary" │ "Validator" │
              └─────────────┴─────────────┘
```

### Persona Attributes (24 Dimensions)
1. **Demographics**: seniority, experience, education, certifications, geographic scope, org size
2. **Work Characteristics**: work pattern, complexity score, arrangement, reports, travel, projects, authority
3. **Technology & AI**: AI maturity score, adoption, digital literacy, preferred service, tool preferences
4. **Behavioral**: risk tolerance, change readiness, collaboration style, learning style
5. **VPANES**: Visibility, Pain, Actions, Needs, Emotions, Scenarios scoring

---

## 🔧 Action Plan to Update Personas

### Phase 1: Diagnose Current State (Run Now)

```sql
-- Step 1: Check Pharma tenant personas
SELECT 
    'Pharma Tenant' as tenant,
    COUNT(*) as total_personas,
    COUNT(role_id) as with_role,
    COUNT(function_id) as with_function,
    COUNT(department_id) as with_department
FROM personas
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Step 2: Check Digital Health tenant
SELECT 
    id, name, slug, created_at
FROM tenants
WHERE slug ILIKE '%digital%health%';

-- Step 3: Check Digital Health org structure
SELECT 
    'Functions' as entity, COUNT(*) as count
FROM org_functions
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 'Departments', COUNT(*)
FROM org_departments
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 'Roles', COUNT(*)
FROM org_roles
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';
```

### Phase 2: Fix Pharma Personas

**Option A: Automatic Mapping** (Recommended)
Run `fix_personas_org_structure_final.sql` from `/.claude/docs/architecture/data-schema/`

**Option B: Manual Mapping**
1. Match `personas.role_slug` → `org_roles.slug`
2. Populate `role_id`, `function_id`, `department_id` from matched roles

### Phase 3: Setup Digital Health Org Structure

1. Run `diagnose_and_setup_digital_health.sql` to check current state
2. If empty, load from `02_digital_health_organization.sql`
3. Verify with:
```sql
SELECT f.name, COUNT(d.id) as depts, COUNT(r.id) as roles
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.function_id = f.id
WHERE f.tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
GROUP BY f.id, f.name
ORDER BY f.name;
```

### Phase 4: Create MECE Personas for Both Tenants

Use `create_4_mece_personas_per_role.sql` template:

1. For each role, create 4 personas:
   - **AUTOMATOR**: High AI + Routine (ai_maturity: 70-80, work_complexity: 30-40)
   - **ORCHESTRATOR**: High AI + Strategic (ai_maturity: 70-85, work_complexity: 60-80)
   - **LEARNER**: Low AI + Routine (ai_maturity: 30-45, work_complexity: 20-40)
   - **SKEPTIC**: Low AI + Strategic (ai_maturity: 25-45, work_complexity: 60-80)

2. Expected output:
   - Pharma: 100+ roles × 4 = **400+ personas**
   - Digital Health: 150+ roles × 4 = **600+ personas**

---

## 📁 Key Documentation Files

| File | Purpose |
|------|---------|
| `/.claude/docs/platform/personas/PERSONA_STRATEGY_GOLD_STANDARD.md` | Complete persona framework (2800+ lines) |
| `/.claude/docs/platform/personas/PERSONAS_COMPLETE_GUIDE.md` | Asset guide and MECE framework |
| `/.claude/docs/platform/personas/PERSONA_ORG_STRUCTURE_FIX_PLAN.md` | Fix plan for unmapped personas |
| `/.claude/docs/platform/personas/PERSONA_SEEDING_COMPLETE_GUIDE.md` | Seeding pipeline documentation |
| `/.claude/docs/platform/personas/seeds/create_4_mece_personas_per_role.sql` | SQL template for MECE personas |
| `/.claude/docs/architecture/data-schema/diagnose_and_setup_digital_health.sql` | Diagnostic script |
| `/.claude/docs/architecture/data-schema/fix_personas_org_structure_final.sql` | Persona mapping fix |

---

## 🎯 Recommended Next Steps

### Immediate (Today)
1. ✅ Run diagnostic queries to verify current database state
2. ✅ Identify which tenant needs priority attention

### Short-term (This Week)
1. Fix Pharma persona mappings (997 personas need role/function/dept)
2. Load Digital Health org structure if not present
3. Create MECE personas for Digital Health

### Medium-term (Next 2 Weeks)
1. Validate MECE distribution for both tenants
2. Populate v5.0 extension tables (pain points, goals, challenges, etc.)
3. Add VPANES scoring to all personas

---

## 📊 Target State

| Metric | Pharma Target | Digital Health Target |
|--------|--------------|----------------------|
| **Business Functions** | 12 | 8 |
| **Departments** | 40+ | 30+ |
| **Roles** | 100+ | 150+ |
| **Personas (4 per role)** | 400+ | 600+ |
| **Mapping Rate** | 100% | 100% |
| **MECE Coverage** | 4 archetypes per role | 4 archetypes per role |

---

## 🚀 Quick Start Command

To begin the update process:

```bash
# Navigate to project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Run diagnostic first
psql $DATABASE_URL -f .claude/docs/architecture/data-schema/diagnose_and_setup_digital_health.sql

# Then fix Pharma personas
psql $DATABASE_URL -f .claude/docs/architecture/data-schema/fix_personas_org_structure_final.sql
```

---

**Status**: Ready for execution  
**Priority**: High (both tenants have incomplete persona data)  
**Estimated Effort**: 2-4 hours for complete setup

---

*This report is based on documentation analysis. Run the diagnostic queries to confirm current database state.*

