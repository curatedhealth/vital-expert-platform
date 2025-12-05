# Enterprise Ontology Enhancement Plan - Phases 4-7
**Created:** 2025-12-02
**Updated:** 2025-12-02 (Integrated Gemini Analysis)
**Status:** 🟡 Ready for Execution
**Prerequisite:** Phase 3 (Remediation) Complete - 98%+ Achieved

---

## External Analysis Summary (Gemini 2.5)

> "Your ontology is exceptionally well-designed and forward-thinking, especially with its integration of AI-related attributes and archetypes. It effectively links user profiles to organizational structure and product offerings, enabling deep analytical capabilities."

### Key Strengths Identified
- ✅ Comprehensive entity model (Personas, Roles, JTBDs, Functions, Archetypes)
- ✅ Sophisticated inheritance pattern (Role → Persona with overrides)
- ✅ PostgreSQL as relational source of truth
- ✅ Neo4j for graph analytics and dual-purpose insights

---

## Consolidated Roadmap Overview

### Current State: 98%+ → Target State: Production Ready + Operationalized

| Phase | Description | Priority | Effort | Source |
|-------|-------------|----------|--------|--------|
| **4.1** | Complete MECE Persona Coverage | 🔴 High | Low | Internal |
| **4.2** | ODI-Driven Workflow Prioritization | 🔴 High | Medium | Internal |
| **4.3** | AI Agent Coverage Audit | 🟡 Medium | Medium | Internal |
| **4.4** | Documentation Reconciliation | 🟢 Low | Low | Internal |
| **4.5** | Value Layer Integration | 🟡 Medium | High | Internal |
| **5.1** | PostgreSQL Effective Views | 🔴 High | Medium | Gemini |
| **5.2** | JTBD Junction Table Consolidation | 🟡 Medium | Medium | Gemini |
| **5.3** | Persona Work Mix View | 🟢 Low | Low | Gemini |
| **6.1** | PostgreSQL → Neo4j CDC Sync | 🔴 High | High | Gemini |
| **6.2** | Graph Data Science (GDS) Features | 🟡 Medium | High | Gemini |
| **7.1** | Ontology API (ai-engine) | 🔴 High | High | Gemini |
| **7.2** | Visualization & Exploration Tools | 🟡 Medium | Medium | Gemini |
| **7.3** | Schema Documentation & Governance | 🟢 Low | Medium | Gemini |

---

## Phase 4.1: Complete MECE Persona Coverage

### Objective
Achieve 100% MECE persona coverage (currently 99.5%)

### Current Gap
- **1 role** in Commercial Organization has only 3 archetypes instead of 4
- Missing archetype needs to be identified and created

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.1.1 | Identify the incomplete role | ⬜ Pending | Data Team |
| 4.1.2 | Determine missing archetype (AUTOMATOR/ORCHESTRATOR/LEARNER/SKEPTIC) | ⬜ Pending | Data Team |
| 4.1.3 | Create missing persona with appropriate attributes | ⬜ Pending | Data Team |
| 4.1.4 | Verify 100% MECE coverage achieved | ⬜ Pending | QA |

### SQL Query to Identify Gap
```sql
-- Find role with incomplete MECE coverage
SELECT
    r.id as role_id,
    r.name as role_name,
    d.name as department_name,
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

### Success Criteria
- [ ] All 450 roles have exactly 4 MECE personas
- [ ] Archetype distribution remains balanced (~25% each)

---

## Phase 4.2: ODI-Driven Workflow Prioritization

### Objective
Prioritize AI workflow development based on ODI opportunity scores

### Current State
| Tier | Score Range | Count | % | Priority |
|------|-------------|-------|---|----------|
| **Extreme** | 15+ | 41 | 9.2% | 🔴 Immediate |
| **High** | 12-14.9 | 177 | 39.8% | 🟡 Next |
| **Moderate** | 10-11.9 | ~140 | 31.5% | 🟢 Consider |
| **Table Stakes** | <10 | ~87 | 19.5% | ⬜ Maintain |

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.2.1 | Extract top 41 Extreme ODI JTBDs | ⬜ Pending | Data Team |
| 4.2.2 | Map Extreme JTBDs to functions/departments | ⬜ Pending | Data Team |
| 4.2.3 | Identify existing workflows for Extreme JTBDs | ⬜ Pending | Product |
| 4.2.4 | Create workflow development backlog | ⬜ Pending | Product |
| 4.2.5 | Define workflow templates for top 10 opportunities | ⬜ Pending | Engineering |

### SQL Query for Extreme Opportunities
```sql
-- Top Extreme ODI Opportunities
SELECT
    j.code,
    j.name,
    j.opportunity_score,
    j.importance_score,
    j.satisfaction_score,
    j.functional_area,
    COUNT(DISTINCT jr.role_id) as role_count
FROM jtbd j
LEFT JOIN jtbd_roles jr ON jr.jtbd_id = j.id
WHERE j.opportunity_score >= 15
GROUP BY j.id, j.code, j.name, j.opportunity_score,
         j.importance_score, j.satisfaction_score, j.functional_area
ORDER BY j.opportunity_score DESC;
```

### Deliverables
1. **Prioritized Workflow Backlog** - Ranked list of JTBDs for workflow development
2. **Workflow Templates** - Reusable patterns for top opportunity categories
3. **ROI Estimates** - Expected value from each workflow implementation

### Success Criteria
- [ ] All 41 Extreme JTBDs documented with workflow recommendations
- [ ] Top 10 workflows designed and ready for implementation
- [ ] Workflow-JTBD mapping stored in database

---

## Phase 4.3: AI Agent Coverage Audit

### Objective
Verify AI agent distribution across roles is appropriate and complete

### Current State
- **873 AI agents** mapped to **450 roles**
- Average: ~1.94 agents per role
- Distribution may be uneven

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.3.1 | Query agent-to-role distribution | ⬜ Pending | Data Team |
| 4.3.2 | Identify roles with 0 agents | ⬜ Pending | Data Team |
| 4.3.3 | Identify roles with excessive agents (>5) | ⬜ Pending | Data Team |
| 4.3.4 | Review agent quality for each function | ⬜ Pending | Product |
| 4.3.5 | Create agent gap remediation plan | ⬜ Pending | Product |

### SQL Query for Agent Distribution
```sql
-- Agent distribution by role
SELECT
    f.name as function_name,
    r.name as role_name,
    COUNT(DISTINCT a.id) as agent_count,
    ARRAY_AGG(DISTINCT a.display_name) as agents
FROM org_functions f
JOIN org_departments d ON d.function_id = f.id
JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agents a ON a.role_id = r.id
WHERE f.name IN ('Medical Affairs', 'Market Access', 'Commercial Organization')
GROUP BY f.name, r.name
ORDER BY agent_count DESC;
```

### Success Criteria
- [ ] All 450 roles have at least 1 AI agent
- [ ] No role has more than 10 agents (unless justified)
- [ ] Agent tier distribution matches role complexity

---

## Phase 4.4: Documentation Reconciliation

### Objective
Fix inconsistencies in documentation

### Known Issues

| Issue | Location | Current | Expected |
|-------|----------|---------|----------|
| Persona count discrepancy | PHARMA_ONTOLOGY_AUDIT.md | 2,598 vs 1,797 | Single accurate number |
| Commercial departments incomplete | PHARMA_ONTOLOGY_AUDIT.md | "12 + 3 additional" | Full list of 15 |

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.4.1 | Query actual persona count from database | ⬜ Pending | Data Team |
| 4.4.2 | Query all Commercial department names | ⬜ Pending | Data Team |
| 4.4.3 | Update PHARMA_ONTOLOGY_AUDIT.md | ⬜ Pending | Doc Team |
| 4.4.4 | Update REMEDIATION_PLAN.md status | ⬜ Pending | Doc Team |

### Success Criteria
- [ ] All documentation reflects actual database state
- [ ] No conflicting numbers across documents
- [ ] All department names explicitly listed

---

## Phase 4.5: Value Layer Integration

### Objective
Connect JTBDs to Value Categories and Value Drivers for ROI quantification

### Value Categories (6 types)
1. **Smarter** - Better decision-making
2. **Faster** - Reduced cycle time
3. **Better** - Improved quality/outcomes
4. **Efficient** - Cost reduction
5. **Safer** - Risk/compliance improvement
6. **Scalable** - Capacity increase

### Value Drivers
- **Internal:** Efficiency, Quality, Compliance, Speed
- **External:** HCP Engagement, Patient Outcomes, Market Position

### Tasks

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.5.1 | Map Extreme JTBDs to value categories | ⬜ Pending | Product |
| 4.5.2 | Estimate quantified impact per JTBD | ⬜ Pending | Business |
| 4.5.3 | Create value realization dashboard metrics | ⬜ Pending | Analytics |
| 4.5.4 | Link value drivers to AI service layers | ⬜ Pending | Engineering |

### Database Tables Required
```sql
-- Value Category Mapping
jtbd_value_categories (
    jtbd_id UUID,
    value_category TEXT,  -- smarter, faster, better, efficient, safer, scalable
    estimated_impact_pct NUMERIC,
    confidence_level TEXT
)

-- Value Driver Mapping
jtbd_value_drivers (
    jtbd_id UUID,
    driver_type TEXT,  -- internal, external
    driver_name TEXT,  -- efficiency, hcp_engagement, etc.
    quantified_value NUMERIC,
    measurement_unit TEXT
)
```

### Success Criteria
- [ ] All Extreme ODI JTBDs have value category mappings
- [ ] Estimated ROI calculated for top 20 opportunities
- [ ] Value dashboard prototype created

---

## Execution Timeline

### Week 1: Quick Wins
- [ ] Phase 4.1: Complete MECE persona (1-2 hours)
- [ ] Phase 4.4: Documentation reconciliation (2-3 hours)

### Week 2: Analysis
- [ ] Phase 4.2: ODI prioritization analysis (4-6 hours)
- [ ] Phase 4.3: Agent coverage audit (3-4 hours)

### Week 3-4: Value Layer
- [ ] Phase 4.5: Value category mapping (8-12 hours)
- [ ] Workflow template design for top 10 opportunities

---

## Success Metrics

### Minimum Success (Week 2)
| Metric | Target | Verification |
|--------|--------|--------------|
| MECE Coverage | 100% | SQL query |
| Documentation Accuracy | 100% | Manual review |
| ODI Analysis Complete | 41 JTBDs | Report |
| Agent Audit Complete | 450 roles | Report |

### Gold Standard (Week 4)
| Metric | Target | Verification |
|--------|--------|--------------|
| Workflow Templates | 10+ | Design docs |
| Value Mappings | 41+ JTBDs | Database |
| ROI Estimates | Top 20 | Business case |

---

## Files & Locations

### This Plan
- `.claude/docs/platform/enterprise_ontology/pharma/ENHANCEMENT_PLAN_PHASE4.md`

### Related Documents
- `.claude/docs/platform/enterprise_ontology/pharma/PHARMA_ONTOLOGY_AUDIT.md`
- `.claude/docs/platform/enterprise_ontology/pharma/REMEDIATION_PLAN.md`

### SQL Scripts (To Be Created)
- `.claude/docs/platform/enterprise_ontology/sql/016_identify_mece_gaps.sql`
- `.claude/docs/platform/enterprise_ontology/sql/017_odi_prioritization.sql`
- `.claude/docs/platform/enterprise_ontology/sql/018_agent_coverage_audit.sql`
- `.claude/docs/platform/enterprise_ontology/sql/019_value_layer_schema.sql`

---

## Checklist

### Phase 4.1: MECE Completion
- [ ] 4.1.1 Identify incomplete role
- [ ] 4.1.2 Determine missing archetype
- [ ] 4.1.3 Create missing persona
- [ ] 4.1.4 Verify 100% coverage

### Phase 4.2: ODI Prioritization
- [ ] 4.2.1 Extract Extreme JTBDs
- [ ] 4.2.2 Map to functions
- [ ] 4.2.3 Identify existing workflows
- [ ] 4.2.4 Create backlog
- [ ] 4.2.5 Design templates

### Phase 4.3: Agent Audit
- [ ] 4.3.1 Query distribution
- [ ] 4.3.2 Find roles with 0 agents
- [ ] 4.3.3 Find over-covered roles
- [ ] 4.3.4 Review quality
- [ ] 4.3.5 Create gap plan

### Phase 4.4: Documentation
- [ ] 4.4.1 Query persona count
- [ ] 4.4.2 Query departments
- [ ] 4.4.3 Update audit doc
- [ ] 4.4.4 Update remediation doc

### Phase 4.5: Value Layer
- [ ] 4.5.1 Map value categories
- [ ] 4.5.2 Estimate impact
- [ ] 4.5.3 Create dashboard
- [ ] 4.5.4 Link to service layers

---

## Phase 5: PostgreSQL Data Layer (Gemini Recommendations)

### Phase 5.1: Effective Views Implementation (🔴 High Priority)

#### Objective
Create comprehensive PostgreSQL views that combine inherited role data with persona-specific overrides

#### Current Gap
- Application code must manually combine role + persona data
- No standardized way to retrieve "effective" persona attributes
- Complex joins required for simple queries

#### Views to Create

```sql
-- 1. Effective Persona Responsibilities
CREATE OR REPLACE VIEW v_effective_persona_responsibilities AS
SELECT
    p.id as persona_id,
    p.name as persona_name,
    r.id as role_id,
    r.name as role_name,
    COALESCE(pr.responsibility_name, rr.responsibility_name) as responsibility,
    COALESCE(pr.is_additional, false) as is_persona_specific,
    COALESCE(pr.overrides_role, false) as overrides_role
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN role_responsibilities rr ON rr.role_id = r.id
LEFT JOIN persona_responsibilities pr ON pr.persona_id = p.id
WHERE NOT (pr.overrides_role = true AND pr.responsibility_name IS NULL);

-- 2. Effective Persona Tools
CREATE OR REPLACE VIEW v_effective_persona_tools AS
SELECT
    p.id as persona_id,
    p.name as persona_name,
    COALESCE(pt.tool_name, rt.tool_name) as tool_name,
    COALESCE(pt.proficiency_level, rt.proficiency_level) as proficiency_level,
    COALESCE(pt.is_additional, false) as is_persona_specific
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN role_tools rt ON rt.role_id = r.id
LEFT JOIN persona_tools pt ON pt.persona_id = p.id;

-- 3. Effective Persona Skills
CREATE OR REPLACE VIEW v_effective_persona_skills AS
SELECT
    p.id as persona_id,
    p.name as persona_name,
    COALESCE(ps.skill_name, rs.skill_name) as skill_name,
    COALESCE(ps.proficiency_level, rs.proficiency_level) as proficiency_level,
    COALESCE(ps.is_additional, false) as is_persona_specific
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
LEFT JOIN role_skills rs ON rs.role_id = r.id
LEFT JOIN persona_skills ps ON ps.persona_id = p.id;

-- 4. Complete Persona Profile
CREATE OR REPLACE VIEW v_persona_complete AS
SELECT
    p.id,
    p.name,
    p.derived_archetype,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.gen_ai_readiness_level,
    r.name as role_name,
    r.seniority_level,
    d.name as department_name,
    f.name as function_name,
    t.name as tenant_name
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
LEFT JOIN tenants t ON p.tenant_id = t.id;
```

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 5.1.1 | Create v_effective_persona_responsibilities | ⬜ Pending | Data Team |
| 5.1.2 | Create v_effective_persona_tools | ⬜ Pending | Data Team |
| 5.1.3 | Create v_effective_persona_skills | ⬜ Pending | Data Team |
| 5.1.4 | Create v_persona_complete | ⬜ Pending | Data Team |
| 5.1.5 | Create v_persona_jtbd_inherited | ⬜ Pending | Data Team |
| 5.1.6 | Add indexes for view performance | ⬜ Pending | Data Team |

#### Success Criteria
- [ ] All 5 effective views created and tested
- [ ] Application code simplified to use views
- [ ] Query performance acceptable (<100ms for typical queries)

---

### Phase 5.2: JTBD Junction Table Consolidation (🟡 Medium Priority)

#### Objective
Standardize and consolidate JTBD-to-Persona/Role junction tables

#### Current State (Fragmented)
- `jtbd_roles` - JTBD mapped to roles
- `jtbd_personas` - May exist separately
- `persona_jtbd` - Possible duplicate
- `jtbd_persona_mapping` - Another variation

#### Target State (Consolidated)
```sql
-- Single canonical junction table for Role-JTBD
jtbd_roles (
    jtbd_id UUID REFERENCES jtbd(id),
    role_id UUID REFERENCES org_roles(id),
    role_name TEXT,  -- Cached for performance
    relevance_score NUMERIC,
    importance NUMERIC,
    frequency TEXT,
    PRIMARY KEY (jtbd_id, role_id)
)

-- Personas inherit JTBDs from roles (no separate junction)
-- Use view: v_persona_jtbd_inherited
```

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 5.2.1 | Audit all JTBD junction tables | ⬜ Pending | Data Team |
| 5.2.2 | Create consolidation migration | ⬜ Pending | Data Team |
| 5.2.3 | Update application code to use canonical table | ⬜ Pending | Engineering |
| 5.2.4 | Deprecate redundant tables | ⬜ Pending | Data Team |

---

### Phase 5.3: Persona Work Mix View (🟢 Low Priority)

#### Objective
Create view showing how work patterns influence persona archetypes

```sql
CREATE OR REPLACE VIEW v_persona_work_mix AS
SELECT
    p.id as persona_id,
    p.name as persona_name,
    p.derived_archetype,
    COUNT(DISTINCT j.id) as jtbd_count,
    AVG(j.complexity::int) as avg_complexity,
    AVG(j.opportunity_score) as avg_opportunity,
    ARRAY_AGG(DISTINCT j.job_type) as job_types,
    SUM(CASE WHEN j.opportunity_score >= 15 THEN 1 ELSE 0 END) as extreme_opportunities
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
JOIN jtbd_roles jr ON jr.role_id = r.id
JOIN jtbd j ON j.id = jr.jtbd_id
GROUP BY p.id, p.name, p.derived_archetype;
```

---

## Phase 6: Neo4j Graph Intelligence (Gemini Recommendations)

### Phase 6.1: PostgreSQL → Neo4j CDC Sync (🔴 High Priority)

#### Objective
Implement robust Change Data Capture to keep Neo4j graph synchronized with PostgreSQL

#### Options Analysis

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Debezium CDC** | Real-time, battle-tested | Complex setup, Kafka required | Production |
| **pg_notify + Custom** | Lightweight, native PG | Custom code, may miss events | Development |
| **Scheduled ETL** | Simple, predictable | Latency, batch only | MVP |
| **Supabase Webhooks** | Built-in, serverless | Limited customization | Quick start |

#### Recommended Architecture
```
PostgreSQL (Supabase)
    │
    ▼ (Debezium CDC)
    │
Kafka/Redis Streams
    │
    ▼ (Sync Service)
    │
Neo4j Graph Database
```

#### Entities to Sync
1. **Core Entities:** personas, org_roles, org_departments, org_functions, tenants
2. **JTBDs:** jtbd, jtbd_roles, jtbd_value_categories
3. **Agents:** agents, agent_capabilities
4. **Relationships:** All junction tables

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 6.1.1 | Choose CDC approach | ⬜ Pending | Architecture |
| 6.1.2 | Set up CDC infrastructure | ⬜ Pending | DevOps |
| 6.1.3 | Create sync service | ⬜ Pending | Engineering |
| 6.1.4 | Implement entity transformers | ⬜ Pending | Engineering |
| 6.1.5 | Add monitoring & alerting | ⬜ Pending | DevOps |

---

### Phase 6.2: Graph Data Science (GDS) Features (🟡 Medium Priority)

#### Objective
Translate GDS capabilities into actionable application features

#### Features to Implement

**1. Find Similar Personas (Node Similarity)**
```cypher
CALL gds.nodeSimilarity.stream('persona-graph', {
    topK: 10,
    similarityCutoff: 0.5
})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).name AS persona1,
       gds.util.asNode(node2).name AS persona2,
       similarity
ORDER BY similarity DESC;
```

**2. Influential Personas (PageRank)**
```cypher
CALL gds.pageRank.stream('persona-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS persona,
       score AS influence
ORDER BY influence DESC
LIMIT 20;
```

**3. Persona Communities (Louvain)**
```cypher
CALL gds.louvain.stream('persona-graph')
YIELD nodeId, communityId
RETURN communityId,
       COLLECT(gds.util.asNode(nodeId).name) AS members
ORDER BY SIZE(members) DESC;
```

**4. AI Migration Candidates**
```cypher
MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype {name: 'LEARNER'})
WHERE p.ai_maturity_score < 50 AND p.work_complexity_score < 50
MATCH (p)-[:PERFORMS]->(j:JTBD)
WHERE j.opportunity_score >= 12
RETURN p.name AS persona,
       p.ai_maturity_score AS maturity,
       COLLECT(j.name) AS high_opportunity_jobs
ORDER BY p.ai_maturity_score ASC;
```

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 6.2.1 | Install Neo4j GDS plugin | ⬜ Pending | DevOps |
| 6.2.2 | Create graph projections | ⬜ Pending | Data Team |
| 6.2.3 | Implement similarity API | ⬜ Pending | Engineering |
| 6.2.4 | Implement influence API | ⬜ Pending | Engineering |
| 6.2.5 | Implement community API | ⬜ Pending | Engineering |

---

## Phase 7: API & Tooling (Gemini Recommendations)

### Phase 7.1: Ontology API (ai-engine) (🔴 High Priority)

#### Objective
Expose ontology insights via well-designed API endpoints

#### Proposed Endpoints

```yaml
# Persona Endpoints
GET  /api/ontology/personas                    # List all personas
GET  /api/ontology/personas/:id                # Get persona with effective attributes
GET  /api/ontology/personas/:id/similar        # Find similar personas (GDS)
GET  /api/ontology/personas/:id/jtbds          # Get inherited JTBDs
GET  /api/ontology/personas/archetype/:type    # Filter by archetype

# Role Endpoints
GET  /api/ontology/roles                       # List all roles
GET  /api/ontology/roles/:id                   # Get role with JTBDs
GET  /api/ontology/roles/:id/personas          # Get 4 MECE personas

# JTBD Endpoints
GET  /api/ontology/jtbds                       # List JTBDs with filters
GET  /api/ontology/jtbds/opportunities         # Get by ODI tier
GET  /api/ontology/jtbds/:id/roles             # Get mapped roles

# Analytics Endpoints
GET  /api/ontology/analytics/communities       # Persona communities
GET  /api/ontology/analytics/influence         # Most influential personas
GET  /api/ontology/analytics/migration-candidates  # AI adoption candidates
```

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 7.1.1 | Design OpenAPI spec | ⬜ Pending | Architecture |
| 7.1.2 | Implement persona endpoints | ⬜ Pending | Engineering |
| 7.1.3 | Implement role endpoints | ⬜ Pending | Engineering |
| 7.1.4 | Implement JTBD endpoints | ⬜ Pending | Engineering |
| 7.1.5 | Implement analytics endpoints | ⬜ Pending | Engineering |
| 7.1.6 | Add caching layer | ⬜ Pending | Engineering |

---

### Phase 7.2: Visualization & Exploration Tools (🟡 Medium Priority)

#### Objective
Make complex ontology relationships accessible to users

#### Options

| Tool | Use Case | Effort |
|------|----------|--------|
| **Neo4j Bloom** | Interactive graph exploration | Low (config only) |
| **React Flow** | Custom workflow visualization | Medium |
| **D3.js** | Custom persona network graph | High |
| **Cytoscape.js** | Embedded graph component | Medium |

#### Recommended: Neo4j Bloom + Custom React Component

**Neo4j Bloom (Admin/Power Users)**
- Pre-configured perspectives for ontology exploration
- Search patterns for common queries
- Export capabilities

**Custom React Component (End Users)**
- Simplified persona explorer
- JTBD opportunity heatmap
- Archetype distribution charts

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 7.2.1 | Configure Neo4j Bloom perspectives | ⬜ Pending | Data Team |
| 7.2.2 | Design persona explorer UI | ⬜ Pending | Design |
| 7.2.3 | Implement graph visualization component | ⬜ Pending | Frontend |
| 7.2.4 | Create JTBD heatmap dashboard | ⬜ Pending | Frontend |

---

### Phase 7.3: Schema Documentation & Governance (🟢 Low Priority)

#### Objective
Maintain living documentation that auto-reflects schema changes

#### Tools to Implement

1. **PostgreSQL Documentation**
   - dbdocs.io for visual ERD
   - Auto-generated from schema
   - Version controlled

2. **API Documentation**
   - OpenAPI 3.0 spec
   - Swagger UI integration
   - Auto-generated from code

3. **Neo4j Documentation**
   - Graph model diagrams (arrows.app)
   - Cypher query library
   - GDS algorithm catalog

#### Tasks
| # | Task | Status | Owner |
|---|------|--------|-------|
| 7.3.1 | Set up dbdocs.io integration | ⬜ Pending | DevOps |
| 7.3.2 | Generate OpenAPI spec | ⬜ Pending | Engineering |
| 7.3.3 | Create graph model diagram | ⬜ Pending | Architecture |
| 7.3.4 | Document Cypher query library | ⬜ Pending | Data Team |

---

## Execution Timeline (Updated)

### Sprint 1 (Week 1-2): Data Quality
- [ ] Phase 4.1: Complete MECE persona
- [ ] Phase 4.4: Documentation reconciliation
- [ ] Phase 5.1: Create effective views

### Sprint 2 (Week 3-4): Analysis & Prioritization
- [ ] Phase 4.2: ODI prioritization
- [ ] Phase 4.3: Agent coverage audit
- [ ] Phase 5.2: Junction table consolidation

### Sprint 3 (Week 5-6): Value Layer
- [ ] Phase 4.5: Value category mapping
- [ ] Phase 5.3: Persona work mix view
- [ ] Phase 7.3: Schema documentation

### Sprint 4 (Week 7-8): Infrastructure
- [ ] Phase 6.1: CDC sync setup
- [ ] Phase 7.1: Ontology API (core endpoints)

### Sprint 5 (Week 9-10): Intelligence
- [ ] Phase 6.2: GDS features
- [ ] Phase 7.1: Analytics endpoints
- [ ] Phase 7.2: Visualization tools

---

## Success Metrics (Updated)

### Phase 4 Complete (Week 4)
| Metric | Target | Verification |
|--------|--------|--------------|
| MECE Coverage | 100% | SQL query |
| ODI Analysis | 41 JTBDs | Report |
| Effective Views | 5 views | PostgreSQL |
| Documentation | Updated | Manual review |

### Phase 5-6 Complete (Week 8)
| Metric | Target | Verification |
|--------|--------|--------------|
| CDC Sync Latency | <5 min | Monitoring |
| Neo4j Freshness | 99%+ | Comparison query |
| API Endpoints | 15+ | OpenAPI spec |
| GDS Algorithms | 4 | Feature tests |

### Phase 7 Complete (Week 10)
| Metric | Target | Verification |
|--------|--------|--------------|
| API Response Time | <200ms | Load test |
| Visualization | 3 components | UI review |
| Documentation | 100% coverage | Audit |

---

**Plan Status:** 🟡 Ready for Execution
**Next Action:** Execute Phase 4.1 (MECE Completion)
**Estimated Total Effort:** 80-120 hours (10-12 weeks)
