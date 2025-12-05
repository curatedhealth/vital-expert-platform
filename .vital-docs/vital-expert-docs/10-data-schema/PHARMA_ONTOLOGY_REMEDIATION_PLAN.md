# Pharmaceutical Industry Ontology Remediation Plan
**Created:** 2025-12-02
**Target Completion:** 2025-12-16 (2 weeks)
**Owner:** Data Architecture Team
**Status:** 🟡 In Progress

---

## Executive Summary

### Current State: 87% Complete ✅

The pharmaceutical industry ontology for Medical Affairs, Market Access, and Commercial Organization is substantially complete. This plan addresses the remaining 13% gap to achieve gold-standard completeness.

### Target State: 98%+ Complete

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Overall Completeness | 87% | 98%+ | 11% |
| Commercial JTBD-Role Mapping | 74.7% | 100% | 25.3% |
| Department Cleanup | Duplicates exist | Zero duplicates | 2-3 items |
| MECE Persona Coverage | 99.8% | 100% | 1 persona |
| Workflow Verification | Unknown | Verified | TBD |

---

## Phase 1: Commercial JTBD-Role Gap Closure
**Duration:** Week 1 (Dec 2-8, 2025)
**Priority:** 🟡 Medium
**Status:** ⬜ Not Started

### Objective
Map all 49 unmapped Commercial Organization roles to appropriate JTBDs.

### Tasks

#### 1.1 Analyze Unmapped Roles
- [ ] **Task:** Extract complete list of 49 unmapped Commercial roles
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours
- [ ] **Verification:** Query returns 49 roles with department context

```sql
-- Verification Query
SELECT COUNT(*) FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization' AND jr.role_id IS NULL;
-- Expected: 49
```

#### 1.2 Categorize Roles by Type
- [ ] **Task:** Group unmapped roles into categories
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours
- [ ] **Categories:**
  - Leadership/Executive (Chief Officers, VPs, Directors)
  - Analytics/Insights (Analysts, Data Scientists)
  - Marketing (Brand, Product, Digital Marketing)
  - Business Development (Acquisitions, Licensing)
  - Operations (Forecasting, Intelligence)

**Expected Distribution:**
| Category | Count | Example Roles |
|----------|-------|---------------|
| Leadership | ~15 | CCO, VP Commercial, Directors |
| Analytics | ~12 | Forecasting Analyst, Business Insights Lead |
| Marketing | ~10 | Brand Lead, Product Marketing Director |
| Biz Dev | ~7 | Acquisitions Analyst, Competitive Intel |
| Operations | ~5 | Various operational roles |

#### 1.3 Identify Existing JTBDs for Mapping
- [ ] **Task:** Find suitable existing JTBDs for each role category
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 3 hours
- [ ] **Approach:**
  - Query JTBDs by keyword (strategy, analytics, marketing, etc.)
  - Match to role categories
  - Document mapping rationale

#### 1.4 Create New JTBDs (If Needed)
- [ ] **Task:** Create 15-25 new Commercial JTBDs for gaps
- [ ] **Owner:** Data Architect + Domain Expert
- [ ] **Effort:** 8 hours
- [ ] **JTBD Format:**
  ```
  When [situation], I want to [action], so I can [outcome].
  ```
- [ ] **Required Fields:**
  - name, code, job_statement
  - when_situation, circumstance, desired_outcome
  - job_type, complexity, frequency
  - importance_score, satisfaction_score, opportunity_score

**New JTBDs to Create:**

| Code | Name | Category | Priority |
|------|------|----------|----------|
| COM-JTBD-069 | Commercial Strategy Development | Leadership | High |
| COM-JTBD-070 | Revenue Forecasting & Planning | Analytics | High |
| COM-JTBD-071 | Brand Portfolio Management | Marketing | High |
| COM-JTBD-072 | Competitive Intelligence Gathering | Biz Dev | Medium |
| COM-JTBD-073 | Business Development Opportunity Assessment | Biz Dev | Medium |
| COM-JTBD-074 | Commercial Performance Optimization | Operations | Medium |
| COM-JTBD-075 | Market Intelligence Analysis | Analytics | Medium |
| COM-JTBD-076 | Product Launch Planning | Marketing | High |
| COM-JTBD-077 | Sales Forecasting Accuracy | Analytics | Medium |
| COM-JTBD-078 | Commercial Governance & Compliance | Leadership | Medium |
| COM-JTBD-079 | Acquisition Target Evaluation | Biz Dev | Low |
| COM-JTBD-080 | Brand Positioning Strategy | Marketing | Medium |
| COM-JTBD-081 | Commercial Analytics Platform Management | Analytics | Low |
| COM-JTBD-082 | Cross-Functional Commercial Alignment | Leadership | Medium |
| COM-JTBD-083 | Digital Marketing ROI Optimization | Marketing | Medium |

#### 1.5 Execute JTBD-Role Mappings
- [ ] **Task:** Insert all mappings into jtbd_roles table
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 4 hours
- [ ] **Script:** `remediate_commercial_jtbd_gaps.sql`

#### 1.6 Verify Phase 1 Completion
- [ ] **Task:** Run verification queries
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 1 hour
- [ ] **Success Criteria:**
  - Commercial JTBD-Role coverage = 100%
  - All 49 roles mapped
  - New JTBDs have ODI scores

```sql
-- Phase 1 Verification
SELECT
    'Phase 1 Complete' as milestone,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT jr.role_id) as mapped_roles,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / COUNT(DISTINCT r.id) * 100, 1) as coverage
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name = 'Commercial Organization';
-- Expected: 194 total, 194 mapped, 100.0% coverage
```

### Phase 1 Deliverables
- [ ] 49 roles mapped to JTBDs
- [ ] 15-25 new JTBDs created (if needed)
- [ ] All new JTBDs have ODI scores
- [ ] Verification queries pass

### Phase 1 Milestone
**Target Date:** December 8, 2025
**Success Metric:** Commercial JTBD-Role coverage = 100%

---

## Phase 2: Data Quality Cleanup
**Duration:** Week 1 (Dec 2-8, 2025) - Parallel with Phase 1
**Priority:** 🟢 Low
**Status:** ⬜ Not Started

### Objective
Eliminate duplicate departments and fix incomplete persona.

### Tasks

#### 2.1 Identify Duplicate Departments
- [ ] **Task:** Query for departments with same name
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 1 hour

```sql
-- Find duplicates
SELECT name, COUNT(*), array_agg(id::text)
FROM org_departments
GROUP BY name HAVING COUNT(*) > 1;
```

**Known Duplicates:**
| Department Name | Count | Action |
|-----------------|-------|--------|
| Leadership & Strategy (Market Access) | 2 | Merge |
| Commercial Operations / Commercial Ops | 2 | Merge |

#### 2.2 Merge Duplicate Departments
- [ ] **Task:** Consolidate duplicates
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours
- [ ] **Steps:**
  1. Identify canonical department (keep one)
  2. Reassign all roles to canonical department
  3. Update any foreign key references
  4. Delete duplicate department record

```sql
-- Merge template (adjust IDs)
BEGIN;
-- Reassign roles
UPDATE org_roles
SET department_id = 'canonical-uuid'
WHERE department_id = 'duplicate-uuid';

-- Delete duplicate
DELETE FROM org_departments WHERE id = 'duplicate-uuid';
COMMIT;
```

#### 2.3 Remove Empty Departments
- [ ] **Task:** Delete departments with 0 roles
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 1 hour

```sql
-- Find empty departments
SELECT d.name, d.id, f.name as function_name
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY d.id, d.name, f.name
HAVING COUNT(r.id) = 0;
```

**Known Empty Department:**
- "Sales" in Commercial Organization (0 roles)

#### 2.4 Fix Incomplete MECE Persona
- [ ] **Task:** Identify and create missing persona archetype
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

```sql
-- Find incomplete MECE
SELECT r.name, d.name as dept,
       array_agg(DISTINCT p.derived_archetype) as archetypes
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Commercial Organization'
GROUP BY r.id, r.name, d.name
HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3;
```

- [ ] **Create missing persona with:**
  - Correct archetype (AUTOMATOR/ORCHESTRATOR/LEARNER/SKEPTIC)
  - Appropriate ai_readiness_score
  - Appropriate work_complexity_score
  - All required fields populated

#### 2.5 Verify Phase 2 Completion
- [ ] **Task:** Run data quality checks
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 1 hour

```sql
-- No duplicates
SELECT name, COUNT(*) FROM org_departments
GROUP BY name HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- No empty departments
SELECT COUNT(*) FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY d.id HAVING COUNT(r.id) = 0;
-- Expected: 0

-- All roles have 4 personas
SELECT COUNT(*) FROM (
    SELECT r.id, COUNT(DISTINCT p.derived_archetype) as cnt
    FROM org_roles r
    LEFT JOIN personas p ON p.source_role_id = r.id
    GROUP BY r.id
    HAVING COUNT(DISTINCT p.derived_archetype) < 4
) incomplete;
-- Expected: 0
```

### Phase 2 Deliverables
- [ ] Zero duplicate departments
- [ ] Zero empty departments
- [ ] 100% MECE persona coverage (all roles have 4 archetypes)

### Phase 2 Milestone
**Target Date:** December 8, 2025
**Success Metric:** All data quality checks pass

---

## Phase 3: Workflow Layer Verification
**Duration:** Week 2 (Dec 9-13, 2025)
**Priority:** 🟢 Low
**Status:** ⬜ Not Started

### Objective
Verify workflow layer schema and JTBD linkages.

### Tasks

#### 3.1 Audit Workflow Schema
- [ ] **Task:** Check workflow table structure
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

```sql
-- Check workflow tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'workflow%';

-- Check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workflow_templates'
ORDER BY ordinal_position;
```

#### 3.2 Verify Workflow-JTBD Linkages
- [ ] **Task:** Check workflows linked to JTBDs
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

```sql
-- Count workflows per function
SELECT
    jf.function_name,
    COUNT(DISTINCT wt.id) as workflow_count
FROM workflow_templates wt
JOIN jtbd j ON wt.jtbd_id = j.id
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
WHERE jf.function_name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY jf.function_name;
```

#### 3.3 Document Workflow Coverage
- [ ] **Task:** Create workflow coverage report
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 3 hours
- [ ] **Report includes:**
  - Workflows per function
  - Stages per workflow
  - Tasks per stage
  - HITL checkpoints identified

#### 3.4 Identify Workflow Gaps (If Any)
- [ ] **Task:** List JTBDs without workflows
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

```sql
-- JTBDs without workflows
SELECT j.code, j.name, jf.function_name
FROM jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
LEFT JOIN workflow_templates wt ON wt.jtbd_id = j.id
WHERE jf.function_name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
AND wt.id IS NULL
ORDER BY jf.function_name, j.code;
```

### Phase 3 Deliverables
- [ ] Workflow schema documented
- [ ] Workflow coverage by function documented
- [ ] Gap list (JTBDs without workflows) created
- [ ] Recommendations for workflow creation

### Phase 3 Milestone
**Target Date:** December 13, 2025
**Success Metric:** Workflow layer fully documented

---

## Phase 4: Strategic Role Enhancement (Optional)
**Duration:** Week 2 (Dec 9-16, 2025)
**Priority:** 🟢 Low (Enhancement)
**Status:** ⬜ Not Started

### Objective
Add emerging strategic roles identified in the strategic audit.

### Tasks

#### 4.1 Review Strategic Role Recommendations
- [ ] **Task:** Assess recommendations from Strategy Vision Architect
- [ ] **Owner:** Product Team
- [ ] **Effort:** 2 hours
- [ ] **Roles to Consider:**

| Role | Function | Rationale | Priority |
|------|----------|-----------|----------|
| Digital MSL (Virtual Engagement) | Medical Affairs | Modern MSL evolution | Medium |
| RWE Study Design Specialist | Market Access | Value-based healthcare trend | High |
| Outcomes-Based Contract Specialist | Market Access | VBC trend | High |
| Omnichannel Journey Architect | Commercial | CX leadership | Medium |
| Inside Sales Representative | Commercial | Hybrid selling model | Medium |
| Customer Success Manager | Commercial | Post-sale engagement | Low |

#### 4.2 Create New Strategic Roles (If Approved)
- [ ] **Task:** Define role records
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 4 hours per role (including personas)

**Per Role Requirements:**
- Role definition (name, description, department)
- 4 MECE personas
- 3-5 JTBD mappings
- AI agent mappings

#### 4.3 Generate Personas for New Roles
- [ ] **Task:** Create 4 personas per new role
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours per role

### Phase 4 Deliverables
- [ ] Strategic role assessment complete
- [ ] Approved roles created
- [ ] Personas generated
- [ ] JTBD mappings created

### Phase 4 Milestone
**Target Date:** December 16, 2025
**Success Metric:** All approved strategic roles implemented

---

## Phase 5: Final Verification & Documentation
**Duration:** Week 2 (Dec 15-16, 2025)
**Priority:** 🟡 Medium
**Status:** ⬜ Not Started

### Objective
Comprehensive verification and documentation update.

### Tasks

#### 5.1 Run Complete Ontology Audit
- [ ] **Task:** Execute full audit queries
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

```sql
-- Final verification summary
SELECT
    'FINAL AUDIT' as audit_type,
    (SELECT COUNT(*) FROM org_departments d
     JOIN org_functions f ON d.function_id = f.id
     WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')) as total_depts,
    (SELECT COUNT(*) FROM org_roles r
     JOIN org_departments d ON r.department_id = d.id
     JOIN org_functions f ON d.function_id = f.id
     WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')) as total_roles,
    (SELECT COUNT(*) FROM personas p
     JOIN org_roles r ON p.source_role_id = r.id
     JOIN org_departments d ON r.department_id = d.id
     JOIN org_functions f ON d.function_id = f.id
     WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')) as total_personas,
    (SELECT COUNT(*) FROM jtbd j
     JOIN jtbd_functions jf ON jf.jtbd_id = j.id
     WHERE jf.function_name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')) as total_jtbd;
```

#### 5.2 Update Documentation
- [ ] **Task:** Update all audit documents
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 3 hours
- [ ] **Files to Update:**
  - `CORRECTED_PHARMA_ONTOLOGY_AUDIT.md`
  - `GOLD_STANDARD_SCHEMA.md`
  - This plan (mark complete)

#### 5.3 Create Success Report
- [ ] **Task:** Generate final status report
- [ ] **Owner:** Data Architect
- [ ] **Effort:** 2 hours

### Phase 5 Deliverables
- [ ] All verification queries pass
- [ ] Documentation updated
- [ ] Success report created
- [ ] Plan marked complete

### Phase 5 Milestone
**Target Date:** December 16, 2025
**Success Metric:** 98%+ overall completeness verified

---

## Progress Tracking

### Weekly Status

| Week | Phase | Status | Completion % | Notes |
|------|-------|--------|--------------|-------|
| Dec 2-8 | Phase 1: JTBD Mapping | ⬜ Not Started | 0% | |
| Dec 2-8 | Phase 2: Data Quality | ⬜ Not Started | 0% | |
| Dec 9-13 | Phase 3: Workflow | ⬜ Not Started | 0% | |
| Dec 9-16 | Phase 4: Strategic Roles | ⬜ Not Started | 0% | |
| Dec 15-16 | Phase 5: Verification | ⬜ Not Started | 0% | |

### Task Completion Summary

| Phase | Total Tasks | Completed | Remaining |
|-------|-------------|-----------|-----------|
| Phase 1 | 6 | 0 | 6 |
| Phase 2 | 5 | 0 | 5 |
| Phase 3 | 4 | 0 | 4 |
| Phase 4 | 3 | 0 | 3 |
| Phase 5 | 3 | 0 | 3 |
| **TOTAL** | **21** | **0** | **21** |

### Key Milestones

| Milestone | Target Date | Status | Verified |
|-----------|-------------|--------|----------|
| Commercial JTBD-Role 100% | Dec 8, 2025 | ⬜ | ⬜ |
| Zero Data Quality Issues | Dec 8, 2025 | ⬜ | ⬜ |
| Workflow Layer Documented | Dec 13, 2025 | ⬜ | ⬜ |
| Strategic Roles (if approved) | Dec 16, 2025 | ⬜ | ⬜ |
| 98%+ Completeness | Dec 16, 2025 | ⬜ | ⬜ |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Keyword matching insufficient for JTBD mapping | Medium | Medium | Manual review and mapping |
| More than 15-25 new JTBDs needed | Low | Medium | Prioritize high-impact roles |
| Workflow schema incompatible | Low | Low | Update queries, schema is flexible |
| Strategic roles require domain expertise | Medium | Low | Consult with product team |
| Time constraints | Low | Medium | Phases 3-4 are optional enhancements |

---

## Success Criteria

### Minimum Success (Phase 1-2 Complete)
- ✅ Commercial JTBD-Role mapping = 100%
- ✅ Zero duplicate departments
- ✅ 100% MECE persona coverage
- ✅ Overall completeness ≥ 95%

### Full Success (All Phases Complete)
- ✅ All minimum criteria met
- ✅ Workflow layer documented
- ✅ Strategic roles assessed
- ✅ Documentation updated
- ✅ Overall completeness ≥ 98%

---

## Appendix A: Verification Queries

### A.1 Overall Completeness Check
```sql
SELECT
    'Departments' as entity,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 38 THEN '✅' ELSE '❌' END as status
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT
    'Roles' as entity,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 450 THEN '✅' ELSE '❌' END as status
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT
    'Personas' as entity,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 1797 THEN '✅' ELSE '❌' END as status
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT
    'JTBDs' as entity,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 300 THEN '✅' ELSE '❌' END as status
FROM jtbd j
JOIN jtbd_functions jf ON jf.jtbd_id = j.id
WHERE jf.function_name IN ('Medical Affairs', 'Market Access', 'Commercial Organization');
```

### A.2 JTBD-Role Coverage Check
```sql
SELECT
    f.name,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT jr.role_id) as mapped_roles,
    ROUND(COUNT(DISTINCT jr.role_id)::numeric / COUNT(DISTINCT r.id) * 100, 1) as pct,
    CASE WHEN COUNT(DISTINCT jr.role_id) = COUNT(DISTINCT r.id) THEN '✅' ELSE '❌' END as status
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN jtbd_roles jr ON jr.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name
ORDER BY f.name;
```

### A.3 Data Quality Check
```sql
SELECT
    'Duplicate Departments' as check_type,
    COUNT(*) as issues,
    CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END as status
FROM (
    SELECT name FROM org_departments GROUP BY name HAVING COUNT(*) > 1
) dups

UNION ALL

SELECT
    'Empty Departments' as check_type,
    COUNT(*) as issues,
    CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END as status
FROM (
    SELECT d.id FROM org_departments d
    LEFT JOIN org_roles r ON r.department_id = d.id
    GROUP BY d.id HAVING COUNT(r.id) = 0
) empty

UNION ALL

SELECT
    'Incomplete MECE' as check_type,
    COUNT(*) as issues,
    CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END as status
FROM (
    SELECT r.id FROM org_roles r
    LEFT JOIN personas p ON p.source_role_id = r.id
    GROUP BY r.id HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
) incomplete;
```

---

## Appendix B: New JTBD Templates

### B.1 Commercial Leadership JTBD Template
```sql
INSERT INTO jtbd (
    id, name, code, job_statement,
    when_situation, circumstance, desired_outcome,
    job_type, complexity, frequency,
    importance_score, satisfaction_score, opportunity_score
) VALUES (
    gen_random_uuid(),
    'Commercial Strategy Development',
    'COM-JTBD-069',
    'When developing annual commercial strategy, I want to analyze market dynamics, competitive positioning, and portfolio performance, so I can maximize revenue growth and market share.',
    'developing annual commercial strategy',
    'market dynamics require strategic response',
    'maximize revenue growth and market share',
    'core',
    'high',
    'annual',
    9.5,  -- High importance
    5.2,  -- Low satisfaction (manual, time-consuming)
    13.8  -- High opportunity = 9.5 + (9.5 - 5.2)
);
```

### B.2 Commercial Analytics JTBD Template
```sql
INSERT INTO jtbd (
    id, name, code, job_statement,
    when_situation, circumstance, desired_outcome,
    job_type, complexity, frequency,
    importance_score, satisfaction_score, opportunity_score
) VALUES (
    gen_random_uuid(),
    'Revenue Forecasting & Planning',
    'COM-JTBD-070',
    'When preparing revenue forecasts, I want to integrate sales data, market trends, and pipeline analysis, so I can provide accurate predictions for financial planning.',
    'preparing revenue forecasts',
    'quarterly planning cycle requires accuracy',
    'provide accurate predictions for financial planning',
    'core',
    'high',
    'quarterly',
    9.0,
    5.5,
    12.5
);
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | Claude | Initial plan creation |

---

**Plan Status:** 🟡 Active
**Next Review:** December 8, 2025 (End of Week 1)
