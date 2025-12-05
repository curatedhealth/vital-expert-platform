# Pharmaceutical Ontology Phase 4 Enhancement Plan
**Created:** 2025-12-02
**Status:** Ready for Execution
**Prerequisite:** Phase 3 Remediation Complete (98%+ Gold Standard)

---

## Plan Overview

### Current State: 98%+ Gold Standard
### Target State: 100% Complete + Value Layer Activation

| Phase | Description | Priority | Effort |
|-------|-------------|----------|--------|
| **4.1** | Complete MECE Persona Gap | High | Low |
| **4.2** | ODI-Driven Workflow Prioritization | High | Medium |
| **4.3** | AI Agent Coverage Audit | Medium | Medium |
| **4.4** | Documentation Reconciliation | Low | Low |
| **4.5** | Value Layer Activation | High | High |

---

## Phase 4.1: Complete MECE Persona Gap

### Objective
Fix the 1 role in Commercial Organization with only 3 archetypes (needs 4th).

### Discovery Query
```sql
-- Find the incomplete MECE role
SELECT r.id, r.name as role_name, d.name as department_name,
       COUNT(DISTINCT p.derived_archetype) as archetype_count,
       ARRAY_AGG(DISTINCT p.derived_archetype) as existing_archetypes
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN personas p ON p.source_role_id = r.id
WHERE f.name = 'Commercial Organization'
GROUP BY r.id, r.name, d.name
HAVING COUNT(DISTINCT p.derived_archetype) BETWEEN 1 AND 3
ORDER BY archetype_count;
```

### Fix Strategy
1. Identify which archetype is missing (AUTOMATOR, ORCHESTRATOR, LEARNER, or SKEPTIC)
2. Create the missing persona with appropriate attributes:
   - **AUTOMATOR:** High AI maturity (70-100), Low complexity (0-50)
   - **ORCHESTRATOR:** High AI maturity (70-100), High complexity (50-100)
   - **LEARNER:** Low AI maturity (0-50), Low complexity (0-50)
   - **SKEPTIC:** Low AI maturity (0-50), High complexity (50-100)

### Success Criteria
- 194/194 Commercial roles with 4 archetypes = **100% MECE**
- 450/450 total roles with 4 archetypes = **100% Overall MECE**

---

## Phase 4.2: ODI-Driven Workflow Prioritization

### Objective
Identify and prioritize the highest-value JTBDs for AI workflow development.

### ODI Tier Strategy

| Tier | Score Range | Count | Action |
|------|-------------|-------|--------|
| **Extreme** | 15+ | 41 | Immediate workflow development |
| **High** | 12-14.9 | 177 | Next wave of workflows |
| **Moderate** | 10-11.9 | ~140 | Consider AI augmentation |
| **Table Stakes** | <10 | ~87 | Maintain current approach |

### Discovery Query: Top 50 Opportunities
```sql
-- Get top 50 ODI opportunities with role context
SELECT
    j.code,
    j.name as jtbd_name,
    j.opportunity_score,
    j.importance_score,
    j.satisfaction_score,
    CASE
        WHEN j.opportunity_score >= 15 THEN 'EXTREME'
        WHEN j.opportunity_score >= 12 THEN 'HIGH'
        WHEN j.opportunity_score >= 10 THEN 'MODERATE'
        ELSE 'TABLE_STAKES'
    END as odi_tier,
    j.recommended_service_layer,
    j.functional_area,
    COUNT(DISTINCT jr.role_id) as mapped_roles
FROM jtbd j
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.opportunity_score IS NOT NULL
GROUP BY j.id, j.code, j.name, j.opportunity_score,
         j.importance_score, j.satisfaction_score,
         j.recommended_service_layer, j.functional_area
ORDER BY j.opportunity_score DESC
LIMIT 50;
```

### Workflow Development Priority Matrix

| Priority | Criteria | Action |
|----------|----------|--------|
| **P0** | Extreme ODI (15+) + Multiple Roles | Build L3 workflow immediately |
| **P1** | Extreme ODI (15+) + Single Role | Build L2 expert panel |
| **P2** | High ODI (12-15) + Multiple Roles | Queue for next sprint |
| **P3** | High ODI (12-15) + Single Role | Add to backlog |

### Deliverable
Create `PHASE4_ODI_PRIORITY_LIST.md` with:
- Top 50 JTBDs ranked by opportunity score
- Recommended service layer for each
- Mapped roles count
- Workflow complexity estimate

---

## Phase 4.3: AI Agent Coverage Audit

### Objective
Verify AI agent distribution across roles is appropriate and identify gaps.

### Current State
- **873 AI agents** mapped to **450 roles**
- Average: **1.94 agents per role**

### Discovery Queries

```sql
-- Roles with NO AI agents (potential gap)
SELECT r.name as role_name, d.name as department_name, f.name as function_name
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN agent_roles ar ON ar.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
AND ar.role_id IS NULL
ORDER BY f.name, d.name, r.name;

-- Roles with EXCESSIVE agents (potential duplication)
SELECT r.name as role_name, d.name as department_name, f.name as function_name,
       COUNT(ar.agent_id) as agent_count
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
JOIN agent_roles ar ON ar.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY r.id, r.name, d.name, f.name
HAVING COUNT(ar.agent_id) > 5
ORDER BY agent_count DESC;

-- Agent distribution by function
SELECT f.name as function_name,
       COUNT(DISTINCT r.id) as roles,
       COUNT(DISTINCT ar.agent_id) as agents,
       ROUND(COUNT(DISTINCT ar.agent_id)::numeric / COUNT(DISTINCT r.id), 2) as agents_per_role
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agent_roles ar ON ar.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name
ORDER BY f.name;
```

### Agent Coverage Targets

| Function | Roles | Current Agents | Target Agents | Gap |
|----------|-------|----------------|---------------|-----|
| Medical Affairs | 129 | 128 | 130-260 | TBD |
| Market Access | 127 | 118 | 130-250 | TBD |
| Commercial Org | 194 | 627 | 200-400 | Possible over-coverage |

### Success Criteria
- Every role has at least 1 AI agent mapping
- No role has more than 10 agents (unless justified)
- Agent specialization matches role responsibilities

---

## Phase 4.4: Documentation Reconciliation

### Objective
Fix inconsistencies in documentation.

### Known Issues

| Issue | Location | Current | Expected |
|-------|----------|---------|----------|
| Persona count mismatch | PHARMA_ONTOLOGY_AUDIT.md | 1,797 vs 2,598 | Single consistent value |
| Commercial departments incomplete | Section 99-114 | Lists 12, says 15 | List all 15 |
| Post-remediation JTBDs | Summary table | 318 total | 461 (includes new 16) |

### Fix Strategy
1. Run database count queries
2. Update all documentation with verified values
3. Add verification timestamps

### Verification Query
```sql
-- Get accurate counts for documentation
SELECT
    'Departments' as entity,
    COUNT(*) as count
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT 'Roles', COUNT(*)
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT 'Personas', COUNT(*)
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')

UNION ALL

SELECT 'JTBDs', COUNT(*)
FROM jtbd
WHERE functional_area IN ('Medical Affairs', 'Market Access', 'Commercial')

UNION ALL

SELECT 'AI Agents Mapped', COUNT(DISTINCT agent_id)
FROM agent_roles ar
JOIN org_roles r ON ar.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization');
```

---

## Phase 4.5: Value Layer Activation

### Objective
Connect the ontology to VITAL's value delivery framework.

### Components

#### 4.5.1 JTBD-to-Workflow Mapping
- Map top 41 Extreme ODI JTBDs to workflow templates
- Create workflow stages and tasks
- Assign AI agents to workflow tasks

#### 4.5.2 Value Category Assignment
Assign each JTBD to value categories:
- **Smarter:** Better decision-making
- **Faster:** Reduced time-to-completion
- **Better:** Improved quality outcomes
- **Efficient:** Cost/resource optimization
- **Safer:** Risk reduction
- **Scalable:** Volume handling

#### 4.5.3 Value Driver Mapping
Map JTBDs to internal/external value drivers:
- **Internal:** Efficiency, Quality, Compliance
- **External:** HCP Value, Patient Value, Market Value

#### 4.5.4 AI Suitability Scoring
Calculate AI intervention potential for each JTBD:
- RAG suitability (0-100)
- Summary suitability (0-100)
- Generation suitability (0-100)
- Reasoning suitability (0-100)

### Migration File
Create: `016_value_layer_activation.sql`

---

## Execution Timeline

### Week 1: Quick Wins
| Day | Task | Owner |
|-----|------|-------|
| 1 | Phase 4.1: Fix MECE gap | Data Team |
| 2 | Phase 4.4: Documentation reconciliation | Doc Team |
| 3-4 | Phase 4.2: ODI priority list generation | Analyst |
| 5 | Phase 4.3: Agent coverage audit | Agent Team |

### Week 2-3: Value Layer
| Day | Task | Owner |
|-----|------|-------|
| 6-8 | Phase 4.5.1: Workflow mapping for P0 JTBDs | Workflow Team |
| 9-10 | Phase 4.5.2-3: Value category/driver assignment | Strategy Team |
| 11-12 | Phase 4.5.4: AI suitability scoring | AI Team |
| 13-15 | Integration testing and validation | QA Team |

---

## Success Metrics

### Phase 4 Completion Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| MECE Coverage | 100% | Query: All roles have 4 archetypes |
| Documentation Accuracy | 100% | Manual review pass |
| ODI Priority List | Complete | 50+ JTBDs ranked and documented |
| Agent Coverage | No gaps | Query: All roles have >= 1 agent |
| Value Layer | Top 20 JTBDs | Workflows created for P0 items |

### KPIs Post-Activation

| KPI | Baseline | Target |
|-----|----------|--------|
| Workflow Coverage (Extreme JTBDs) | 0% | 50% |
| Value Category Assignment | 0% | 100% |
| AI Suitability Scores | 0% | 100% |
| End-to-End Ontology Completeness | 98% | 100% |

---

## Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| `016_fix_mece_gap.sql` | Fix incomplete persona | 4.1 |
| `PHASE4_ODI_PRIORITY_LIST.md` | Top 50 JTBDs ranked | 4.2 |
| `017_agent_coverage_audit.sql` | Agent gap analysis | 4.3 |
| `018_value_layer_activation.sql` | Value layer tables | 4.5 |
| `PHARMA_ONTOLOGY_AUDIT_v2.md` | Updated documentation | 4.4 |

---

## Dependencies & Prerequisites

### Required Before Starting
- [x] Phase 3 Remediation Complete (100% JTBD-Role coverage)
- [x] Database access verified
- [ ] Workflow template schema exists
- [ ] Value category/driver tables exist

### External Dependencies
- Workflow team availability for Phase 4.5.1
- Strategy team input on value categories
- AI team benchmarks for suitability scoring

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database connectivity issues | High | Use REST API fallback |
| Missing workflow tables | Medium | Create tables in Phase 4.5 |
| Incomplete agent metadata | Medium | Flag for later enrichment |
| Value layer scope creep | High | Limit to top 20 JTBDs initially |

---

**Plan Status:** Ready for Execution
**Next Action:** Execute Phase 4.1 (Fix MECE Gap)
**Estimated Completion:** 2-3 weeks
