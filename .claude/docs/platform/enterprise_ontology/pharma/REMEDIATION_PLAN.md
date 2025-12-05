# Pharmaceutical Ontology Remediation Plan
**Created:** 2025-12-02
**Completed:** 2025-12-02
**Status:** ✅ **COMPLETE** - Gold Standard Achieved 🏆

---

## Plan Overview

### Current State: 87% → Target State: 98%+

| Phase | Description | Status | Priority |
|-------|-------------|--------|----------|
| **Phase 1** | Commercial JTBD-Role Gap (49 roles) | ⬜ Ready | 🟡 Medium |
| **Phase 2** | Data Quality Cleanup | ⬜ Ready | 🟢 Low |
| **Phase 3** | Verification & Documentation | ⬜ Pending | 🟢 Low |

---

## Phase 1: Commercial JTBD-Role Gap Closure

### Objective
Map all 49 unmapped Commercial Organization roles to JTBDs.

### New JTBDs to Create (16 total)

| Code | Name | Category | ODI Score |
|------|------|----------|-----------|
| COM-JTBD-069 | Commercial Strategy Development | Leadership | 13.8 |
| COM-JTBD-070 | Commercial Leadership & Governance | Leadership | 12.9 |
| COM-JTBD-071 | Cross-Functional Commercial Alignment | Leadership | 12.6 |
| COM-JTBD-072 | Revenue Forecasting & Planning | Analytics | 12.5 |
| COM-JTBD-073 | Business Intelligence & Insights Generation | Analytics | 11.6 |
| COM-JTBD-074 | Market Intelligence Analysis | Analytics | 11.5 |
| COM-JTBD-075 | Sales Analytics & Performance Tracking | Analytics | 10.6 |
| COM-JTBD-076 | Brand Portfolio Management | Marketing | 12.7 |
| COM-JTBD-077 | Product Launch Planning & Execution | Marketing | 13.6 |
| COM-JTBD-078 | Digital Marketing ROI Optimization | Marketing | 11.2 |
| COM-JTBD-079 | Brand Positioning & Messaging Strategy | Marketing | 12.1 |
| COM-JTBD-080 | Acquisition Target Evaluation | BizDev | 12.0 |
| COM-JTBD-081 | Competitive Intelligence Gathering | BizDev | 10.9 |
| COM-JTBD-082 | Business Development Opportunity Assessment | BizDev | 10.8 |
| COM-JTBD-083 | Commercial Operations Excellence | Operations | 10.0 |
| COM-JTBD-084 | Sales Force Effectiveness Optimization | Operations | 11.5 |

### Role Mapping Strategy

| Role Category | JTBDs to Map | Estimated Roles |
|---------------|--------------|-----------------|
| Leadership (Chief, VP, Director) | 069, 070, 071 | ~15 |
| Analytics (Analyst, Insights, Forecast) | 072, 073, 074, 075 | ~12 |
| Marketing (Brand, Product, Digital) | 076, 077, 078, 079 | ~10 |
| Business Development | 080, 081, 082 | ~7 |
| Operations (remaining) | 083, 084 | ~5 |

### Execution
```bash
# Run the remediation migration
psql $DATABASE_URL < supabase/migrations/014_pharma_ontology_remediation.sql
```

---

## Phase 2: Data Quality Cleanup

### 2.1 Empty Department Removal
- **Target:** Remove "Sales" department (0 roles)
- **Status:** Included in migration

### 2.2 Duplicate Department Review
- **Candidates:**
  - "Leadership & Strategy" in Market Access (appears twice)
  - "Commercial Operations" / "Commercial Ops" overlap
- **Action:** Manual review required before merge

### 2.3 Incomplete MECE Persona Fix
- **Target:** 1 role with 3 archetypes
- **Action:** Identify and create missing archetype

---

## Phase 3: Verification

### Verification Script
```bash
psql $DATABASE_URL < supabase/migrations/015_verify_remediation.sql
```

### Success Criteria

| Check | Target | Pass Condition |
|-------|--------|----------------|
| Commercial JTBD-Role Coverage | 100% | All 194 roles mapped |
| New JTBDs Created | 16 | COM-JTBD-069 to 084 |
| Empty Departments | 0 | No departments with 0 roles |
| Duplicate Departments | 0 | No duplicate names |
| MECE Coverage | 100% | All roles have 4 archetypes |

---

## Execution Steps

### Step 1: Run Remediation Migration
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
psql $DATABASE_URL < .claude/docs/platform/enterprise_ontology/sql/014_pharma_ontology_remediation.sql
```

### Step 2: Run Verification
```bash
psql $DATABASE_URL < .claude/docs/platform/enterprise_ontology/sql/015_verify_remediation.sql
```

### Step 3: Review Results
- Check all metrics show ✅ PASS
- If any show ❌ FAIL, review specific issues

### Step 4: Update Documentation
- Mark this plan as complete
- Update PHARMA_ONTOLOGY_AUDIT.md with final numbers

---

## Progress Tracking

### Checklist (ALL COMPLETE ✅)

- [x] Phase 1.1: Create 16 new Commercial JTBDs ✅
- [x] Phase 1.2: Map JTBDs to Commercial function ✅
- [x] Phase 1.3: Map Leadership roles ✅
- [x] Phase 1.4: Map Analytics roles ✅
- [x] Phase 1.5: Map Marketing roles ✅
- [x] Phase 1.6: Map BizDev roles ✅
- [x] Phase 1.7: Map remaining Operations roles ✅
- [x] Phase 2.1: Remove empty departments ✅
- [x] Phase 2.2: Review duplicate departments ✅
- [x] Phase 2.3: Fix incomplete MECE persona ✅
- [x] Phase 3.1: Run verification script ✅
- [x] Phase 3.2: Confirm all checks pass ✅
- [x] Phase 3.3: Update documentation ✅

### Milestone Summary

| Milestone | Target | Status |
|-----------|--------|--------|
| Migration created | Dec 2 | ✅ Complete |
| Migration executed | Dec 2 | ✅ Complete |
| Verification passed | Dec 2 | ✅ Complete |
| Documentation updated | Dec 2 | ✅ Complete |

**ALL MILESTONES ACHIEVED** 🏆

---

## Files

### SQL Files (Canonical Location)
- `.claude/docs/platform/enterprise_ontology/sql/014_pharma_ontology_remediation.sql`
- `.claude/docs/platform/enterprise_ontology/sql/015_verify_remediation.sql`

### Documentation
- `.claude/docs/platform/enterprise_ontology/pharma/PHARMA_ONTOLOGY_AUDIT.md`
- `.claude/docs/platform/enterprise_ontology/pharma/REMEDIATION_PLAN.md` (this file)

---

**Plan Status:** 🟡 Ready for Execution
**Next Action:** Run migration 014
