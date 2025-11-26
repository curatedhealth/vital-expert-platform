# Agent Selection System: Comprehensive Audit & Refinem

ent

**Date**: November 26, 2025  
**Status**: 🔴 Critical Review Required  
**Target**: Evidence-Based Agent Selection with Capabilities/Skills/Responsibilities

---

## Executive Summary

### Current State Assessment

✅ **Working Systems:**
- 3-method hybrid search (PostgreSQL, Pinecone, Neo4j)
- Query analysis with GPT-4
- Weighted reciprocal rank fusion (30%/50%/20%)
- Performance targets: <450ms

❌ **Critical Issues Identified:**

1. **Schema Misalignment** (BLOCKER)
   - Services reference `competency` fields that **DO NOT EXIST** in agent schema
   - Actual schema uses: `capabilities`, `skills`, `responsibilities`, `knowledge_domains`
   - No `competency_selection` or `competency_id` columns found

2. **AgentQueryRequest Over-Bloat** (MEDIUM)
   - 32 attributes (many unused in selection)
   - Includes `competency_selection`, `capabilities`, `selected_capabilities`
   - Should be cleaned up to match actual agent selection logic

3. **Evidence-Based Selection Not Implemented** (HIGH)
   - Current selection is embedding-based only
   - Missing: Capability proficiency matching
   - Missing: Skill-level matching
   - Missing: Responsibility alignment

4. **GraphRAG Integration Incomplete** (MEDIUM)
   - Neo4j relationships not fully utilized
   - Agent hierarchy (L1-L5) not leveraged in selection
   - Delegation chains not considered

---

## Part 1: Agent Schema Analysis

### Actual Database Schema (Confirmed)

#### Core `agents` Table (40+ columns)

```sql
-- Identity & Organization
id UUID PRIMARY KEY
tenant_id UUID -- Multi-tenancy
name TEXT
slug TEXT
title TEXT
description TEXT
tagline TEXT

-- Organizational Hierarchy
role_id UUID -> org_roles(id)
function_id UUID -> org_functions(id)
department_id UUID -> org_departments(id)
agent_level_id UUID -> agent_levels(id) -- L1-L5 hierarchy
persona_id UUID -> personas(id)

-- Denormalized for Performance
function_name TEXT
department_name TEXT
role_name TEXT

-- Experience
expertise_level TEXT -- 'beginner', 'intermediate', 'expert', 'master'
years_of_experience INTEGER

-- AI Configuration
system_prompt TEXT
system_prompt_template_id UUID
prompt_variables JSONB
base_model TEXT
temperature NUMERIC(3,2)
max_tokens INTEGER

-- Status
status TEXT
validation_status TEXT

-- Metadata
metadata JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### Junction Tables (Agent Enrichment)

```sql
-- Capabilities (High-level categories)
agent_capabilities:
  agent_id UUID
  capability_id UUID -> capabilities(id)
  proficiency_level TEXT -- 'basic', 'intermediate', 'advanced', 'expert'
  is_primary BOOLEAN
  years_of_experience INTEGER
  usage_count INTEGER
  success_rate NUMERIC

-- Skills (Granular task-level)
agent_skills:
  agent_id UUID
  skill_id UUID -> skills(id)
  proficiency_level TEXT
  is_primary BOOLEAN
  usage_count INTEGER
  success_rate NUMERIC

-- Responsibilities (Role-specific duties)
agent_responsibilities:
  agent_id UUID
  responsibility_id UUID -> responsibilities(id)
  proficiency_level TEXT
  accountability_score NUMERIC

-- Knowledge Domains (Medical specializations)
agent_knowledge_domains:
  agent_id UUID
  knowledge_domain_id UUID -> knowledge_domains(id)
  domain_name TEXT (cached)
  proficiency_level TEXT
  is_primary_domain BOOLEAN
```

### What EXISTS vs What DOESN'T

✅ **CONFIRMED TO EXIST:**
- `capabilities` (60+ defined, 30% role-specific, 21% cross-cutting)
- `skills` (150+ defined, task/tool level)
- `responsibilities` (60+ defined, accountability-based)
- `knowledge_domains` (50+ defined, medical/TA specializations)
- `agent_level_id` (5-level hierarchy: L1 Master → L5 Tool)

❌ **DOES NOT EXIST:**
- ~~`competency`~~ (NOT IN SCHEMA)
- ~~`competency_id`~~ (NOT IN SCHEMA)
- ~~`competency_selection`~~ (NOT IN SCHEMA)

---

## Part 2: Current Selection Services Audit

### 1. AgentSelectorService (`agent_selector_service.py`)

**Purpose**: LLM-powered query analysis

**Current Implementation:**
```python
async def analyze_query(query: str) -> QueryAnalysisResponse:
    # Uses GPT-4 to extract:
    # - intent (diagnosis, treatment, research, etc.)
    # - domains (cardiology, oncology, etc.)
    # - complexity (low, medium, high)
    # - keywords
    # - medical_terms
    # - confidence (0-1)
```

**Issues:**
- ✅ Good: Extracts medical domains and intent
- ❌ **Missing**: No mapping to agent capabilities
- ❌ **Missing**: No skill requirement extraction
- ❌ **Missing**: No responsibility alignment

**Recommendation:**
```python
class QueryAnalysisResponse(BaseModel):
    intent: str
    domains: List[str]
    complexity: str
    keywords: List[str]
    medical_terms: List[str]
    confidence: float
    
    # ADD THESE:
    required_capabilities: List[str] = []  # Extracted capabilities
    required_skills: List[str] = []  # Extracted skills
    required_agent_level: Optional[str] = None  # L1, L2, L3, L4, L5
    suggested_responsibilities: List[str] = []  # Role responsibilities
```

---

### 2. HybridAgentSearch (`hybrid_agent_search.py`)

**Purpose**: Combines vector + graph search

**Current Scoring:**
```python
weights = {
    "vector": 0.60,  # 60% semantic similarity
    "domain": 0.25,  # 25% domain proficiency
    "capability": 0.10,  # 10% capability match
    "graph": 0.05  # 5% graph relationships
}
```

**SQL Query Analysis:**
```sql
-- ✅ GOOD: Uses pgvector for embeddings
-- ✅ GOOD: Joins agent_domains for proficiency
-- ✅ GOOD: Joins agent_capabilities
-- ❌ MISSING: Does NOT join agent_skills
-- ❌ MISSING: Does NOT join agent_responsibilities
-- ❌ MISSING: Does NOT consider agent_level hierarchy
```

**Recommendations:**

1. **Add Skills Matching** (15% weight):
```sql
skill_results AS (
    SELECT
        ags.agent_id,
        COUNT(DISTINCT s.id) AS skill_match_count,
        AVG(ags.proficiency_level_numeric) AS avg_skill_proficiency,
        array_agg(DISTINCT s.name) AS matched_skills
    FROM agent_skills ags
    JOIN skills s ON ags.skill_id = s.id
    WHERE
        (ARRAY_LENGTH($N::TEXT[], 1) IS NULL OR s.name = ANY($N::TEXT[]))
        AND ags.proficiency_level_numeric >= 0.50
    GROUP BY ags.agent_id
)
```

2. **Add Agent Level Filtering** (Critical):
```sql
-- Query requires L2 Expert or higher
WHERE al.level_number <= 2  -- L1 Master, L2 Expert only
```

3. **Adjust Weights**:
```python
weights = {
    "vector": 0.45,  # 45% (reduced from 60%)
    "domain": 0.20,  # 20% (reduced from 25%)
    "capability": 0.15,  # 15% (increased from 10%)
    "skill": 0.15,  # 15% (NEW)
    "graph": 0.05  # 5% (unchanged)
}
```

---

### 3. GraphRAGSelector (`graphrag_selector.py`)

**Purpose**: 3-method hybrid (PostgreSQL + Pinecone + Neo4j)

**Current Weights:**
```python
WEIGHTS = {
    "postgres_fulltext": 0.30,
    "pinecone_vector": 0.50,
    "neo4j_graph": 0.20
}
```

**Issues:**

1. **PostgreSQL Fulltext** (`search_agents_fulltext` RPC):
   - ❌ **Assumes RPC function exists** (needs verification)
   - ❌ **No evidence** it queries capabilities/skills/responsibilities

2. **Pinecone Vector**:
   - ✅ Uses dedicated `vital-agents` index
   - ❌ **Doesn't filter by capabilities**
   - ❌ **Doesn't filter by agent_level**

3. **Neo4j Graph**:
   - ❌ **Method not implemented** (calls `graph_traversal_search` which doesn't exist)
   - ❌ **Missing**: Agent hierarchy traversal (L1 → L2 → L3)
   - ❌ **Missing**: Delegation chain analysis

**Recommendations:**

1. **Implement PostgreSQL RPC Function**:
```sql
CREATE OR REPLACE FUNCTION search_agents_fulltext(
    search_query TEXT,
    tenant_filter UUID,
    result_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    text_rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        ts_rank(
            to_tsvector('english',
                COALESCE(a.name, '') || ' ' ||
                COALESCE(a.description, '') || ' ' ||
                COALESCE(array_to_string(a.capabilities, ' '), '') || ' ' ||
                COALESCE(array_to_string(a.domain_expertise, ' '), '')
            ),
            plainto_tsquery('english', search_query)
        )::FLOAT AS text_rank
    FROM agents a
    WHERE
        a.tenant_id = tenant_filter
        AND a.is_active = TRUE
        AND to_tsvector('english',
                COALESCE(a.name, '') || ' ' ||
                COALESCE(a.description, '')
            ) @@ plainto_tsquery('english', search_query)
    ORDER BY text_rank DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

2. **Implement Neo4j Graph Traversal**:
```cypher
// Find agents through capability relationships
MATCH (query:Query {embedding: $query_embedding})
MATCH (agent:Agent)-[:HAS_CAPABILITY]->(cap:Capability)
WHERE agent.tenant_id = $tenant_id
  AND agent.is_active = true
  
// Calculate semantic similarity
WITH agent,
     gds.similarity.cosine(query.embedding, agent.embedding) AS sem_score,
     count(cap) AS cap_count

// Boost for agent hierarchy
WITH agent, sem_score, cap_count,
     CASE agent.level
       WHEN 'L1_MASTER' THEN 1.0
       WHEN 'L2_EXPERT' THEN 0.95
       WHEN 'L3_SPECIALIST' THEN 0.85
       WHEN 'L4_WORKER' THEN 0.70
       ELSE 0.50
     END AS level_boost

// Calculate graph score
RETURN
    agent.id AS agent_id,
    agent.name AS name,
    (sem_score * 0.6 + (cap_count / 10.0) * 0.2 + level_boost * 0.2) AS graph_score
ORDER BY graph_score DESC
LIMIT $limit
```

---

## Part 3: Schema Refinement Plan

### Step 1: Remove Competency References

**Files to Update:**

1. `services/ai-engine/src/models/requests.py`
```python
class AgentQueryRequest(BaseModel):
    # REMOVE THESE:
    # competency_selection: Optional[str] = None  ❌ DELETE
    
    # KEEP THESE (but clean up):
    capabilities: Optional[List[str]] = Field(default_factory=list)
    selected_capabilities: Optional[List[str]] = Field(default_factory=list)
    
    # ADD THESE:
    required_skills: Optional[List[str]] = Field(default_factory=list)
    required_agent_level: Optional[int] = Field(None, ge=1, le=5)
    required_responsibilities: Optional[List[str]] = Field(default_factory=list)
```

2. `services/ai-engine/src/services/agent_orchestrator.py`
```python
# Remove all references to:
# - request.competency_selection  ❌
# - request.competency_id  ❌
```

### Step 2: Enhance Query Analysis

Update `agent_selector_service.py`:

```python
system_prompt = """You are a medical/healthcare query analysis assistant.

Analyze queries and extract structured information:

1. **Intent**: diagnosis, treatment, research, consultation, education, regulation, compliance
2. **Medical Domains**: cardiology, oncology, neurology, immunology, endocrinology, etc.
3. **Complexity**: low, medium, high
4. **Keywords**: Key medical terms
5. **Required Capabilities**: Extract from CAPABILITY_TAXONOMY (CAP-MA-001 to CAP-MA-060)
6. **Required Skills**: Specific technical skills needed
7. **Agent Level**: Recommend agent level (L1-L5)
   - L1 MASTER: Strategic, cross-functional, executive decisions
   - L2 EXPERT: Deep domain expertise, complex analysis
   - L3 SPECIALIST: Focused task execution
   - L4 WORKER: Routine tasks
   - L5 TOOL: Atomic operations
8. **Confidence**: 0-1 score

Return JSON with ALL fields."""
```

### Step 3: Implement Evidence-Based Matching

Create new service: `services/ai-engine/src/services/evidence_based_selector.py`

```python
class EvidenceBasedSelector:
    """
    Evidence-based agent selection using:
    - Capabilities proficiency (30%)
    - Skills match (25%)
    - Knowledge domains (20%)
    - Responsibilities alignment (15%)
    - Agent level appropriateness (10%)
    """
    
    async def select_agents(
        self,
        query_analysis: QueryAnalysisResponse,
        tenant_id: str,
        max_agents: int = 3
    ) -> List[AgentSelectionResult]:
        """
        Select agents based on evidence:
        1. Match required capabilities
        2. Match required skills
        3. Filter by agent level
        4. Score by proficiency
        5. Rank by weighted evidence
        """
        
        # SQL query with ALL enrichment data
        query_sql = """
        WITH capability_match AS (
            SELECT
                ac.agent_id,
                COUNT(c.id) AS cap_match_count,
                AVG(
                    CASE ac.proficiency_level
                        WHEN 'expert' THEN 1.0
                        WHEN 'advanced' THEN 0.85
                        WHEN 'intermediate' THEN 0.70
                        WHEN 'basic' THEN 0.50
                        ELSE 0.30
                    END
                ) AS avg_cap_proficiency
            FROM agent_capabilities ac
            JOIN capabilities c ON ac.capability_id = c.id
            WHERE c.capability_slug = ANY($1::TEXT[])
            GROUP BY ac.agent_id
        ),
        skill_match AS (
            SELECT
                ags.agent_id,
                COUNT(s.id) AS skill_match_count,
                AVG(
                    CASE ags.proficiency_level
                        WHEN 'expert' THEN 1.0
                        WHEN 'advanced' THEN 0.85
                        WHEN 'intermediate' THEN 0.70
                        WHEN 'basic' THEN 0.50
                        ELSE 0.30
                    END
                ) AS avg_skill_proficiency
            FROM agent_skills ags
            JOIN skills s ON ags.skill_id = s.id
            WHERE s.skill_slug = ANY($2::TEXT[])
            GROUP BY ags.agent_id
        ),
        domain_match AS (
            SELECT
                akd.agent_id,
                COUNT(kd.id) AS domain_match_count,
                AVG(
                    CASE akd.proficiency_level
                        WHEN 'expert' THEN 1.0
                        WHEN 'advanced' THEN 0.85
                        WHEN 'intermediate' THEN 0.70
                        WHEN 'basic' THEN 0.50
                        ELSE 0.30
                    END
                ) AS avg_domain_proficiency
            FROM agent_knowledge_domains akd
            JOIN knowledge_domains kd ON akd.knowledge_domain_id = kd.id
            WHERE kd.domain_slug = ANY($3::TEXT[])
            GROUP BY akd.agent_id
        )
        SELECT
            a.id AS agent_id,
            a.name,
            a.slug,
            a.title,
            al.level_number,
            al.level_name,
            
            -- Evidence scores
            COALESCE(cm.avg_cap_proficiency, 0.0) AS capability_score,
            COALESCE(sm.avg_skill_proficiency, 0.0) AS skill_score,
            COALESCE(dm.avg_domain_proficiency, 0.0) AS domain_score,
            
            -- Match counts
            COALESCE(cm.cap_match_count, 0) AS capabilities_matched,
            COALESCE(sm.skill_match_count, 0) AS skills_matched,
            COALESCE(dm.domain_match_count, 0) AS domains_matched,
            
            -- Weighted evidence score
            (
                COALESCE(cm.avg_cap_proficiency, 0.0) * 0.30 +
                COALESCE(sm.avg_skill_proficiency, 0.0) * 0.25 +
                COALESCE(dm.avg_domain_proficiency, 0.0) * 0.20 +
                (
                    CASE
                        WHEN al.level_number = $4 THEN 1.0
                        WHEN al.level_number = $4 - 1 THEN 0.90
                        WHEN al.level_number = $4 + 1 THEN 0.85
                        ELSE 0.70
                    END
                ) * 0.10
            ) AS evidence_score
            
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        LEFT JOIN capability_match cm ON a.id = cm.agent_id
        LEFT JOIN skill_match sm ON a.id = sm.agent_id
        LEFT JOIN domain_match dm ON a.id = dm.agent_id
        WHERE
            a.tenant_id = $5
            AND a.status = 'active'
            AND (
                cm.cap_match_count > 0 OR
                sm.skill_match_count > 0 OR
                dm.domain_match_count > 0
            )
        ORDER BY evidence_score DESC
        LIMIT $6
        """
```

---

## Part 4: Implementation Roadmap

### Phase 1: Schema Cleanup (Day 1)
- [ ] Remove all `competency_*` references from `AgentQueryRequest`
- [ ] Remove all `competency_*` references from `agent_orchestrator.py`
- [ ] Add `required_skills`, `required_agent_level`, `required_responsibilities` to request model
- [ ] Test Mode 1 after cleanup

### Phase 2: Query Analysis Enhancement (Day 1-2)
- [ ] Update `AgentSelectorService.analyze_query()` to extract capabilities/skills
- [ ] Map extracted medical terms to CAPABILITY_TAXONOMY (CAP-MA-001 to CAP-MA-060)
- [ ] Add agent level recommendation logic
- [ ] Test query analysis with sample queries

### Phase 3: Evidence-Based Selection (Day 2-3)
- [ ] Create `EvidenceBasedSelector` service
- [ ] Implement capability/skill/domain matching SQL
- [ ] Integrate with existing hybrid search
- [ ] Test selection accuracy

### Phase 4: GraphRAG Enhancement (Day 3-4)
- [ ] Implement `search_agents_fulltext` PostgreSQL RPC function
- [ ] Implement Neo4j graph traversal query
- [ ] Add agent hierarchy consideration
- [ ] Test 3-method fusion

### Phase 5: Integration & Testing (Day 4-5)
- [ ] Integrate all services into Mode 2/3/4 workflows
- [ ] Performance testing (<450ms target)
- [ ] Accuracy testing (>92% top-3)
- [ ] Documentation update

---

## Part 5: Success Metrics

### Performance Targets
- P95 latency: <450ms ✅
- P99 latency: <800ms 🎯

### Accuracy Targets
- Top-1 accuracy: >85% 🎯
- Top-3 accuracy: >92% 🎯 (ARD v2.0 requirement)
- Top-5 accuracy: >95% ✅

### Evidence Quality
- Capability match rate: >70%
- Skill match rate: >60%
- Domain match rate: >80%
- Agent level appropriate: >90%

---

## Part 6: Testing Plan

### Test Queries

```python
test_queries = [
    # L1 MASTER queries
    {
        "query": "Develop enterprise medical affairs strategy for oncology portfolio",
        "expected_level": "L1",
        "expected_capabilities": ["CAP-MA-001", "CAP-MA-002", "CAP-MA-034"],
        "expected_agents": ["Chief Medical Officer", "VP Medical Affairs"]
    },
    
    # L2 EXPERT queries
    {
        "query": "Design real-world evidence study for cardiovascular outcomes",
        "expected_level": "L2",
        "expected_capabilities": ["CAP-MA-025", "CAP-MA-026"],
        "expected_agents": ["Real-World Evidence Lead", "HEOR Project Manager"]
    },
    
    # L3 SPECIALIST queries
    {
        "query": "Respond to HCP inquiry about drug-drug interactions",
        "expected_level": "L3",
        "expected_capabilities": ["CAP-MA-016"],
        "expected_agents": ["Medical Information Specialist"]
    },
    
    # Complex multi-capability queries
    {
        "query": "Prepare FDA 510(k) submission with clinical and economic evidence",
        "expected_level": "L2",
        "expected_capabilities": ["CAP-MA-011", "CAP-MA-024", "CAP-MA-014"],
        "expected_agents": ["Medical Writer", "Economic Modeler", "Publications Manager"]
    }
]
```

---

## Appendices

### Appendix A: Capability Taxonomy Summary

**60 Defined Capabilities:**
- Role-Specific (39): CAP-MA-001 to CAP-MA-039
- Cross-Cutting (21): CAP-MA-040 to CAP-MA-060

**Categories:**
- Leadership & Strategic: 4
- Field Medical (MSL): 6
- Medical Writing & Publications: 5
- Medical Information: 4
- Medical Education: 4
- HEOR & RWE: 4
- Clinical Operations: 2
- Compliance & Governance: 3
- Scientific Affairs: 2
- Operational Support: 5
- Cross-Cutting: 21

### Appendix B: Skills Taxonomy Summary

**150+ Defined Skills:**
- Technical Skills: ~60
- Communication Skills: ~30
- Analytical Skills: ~25
- Tool-Specific Skills: ~35

### Appendix C: Agent Level Distribution

| Level | Name | Count | Can Delegate | Can Spawn | Example Roles |
|-------|------|-------|--------------|-----------|---------------|
| L1 | Master | 24 | ✅ | ✅ | CMO, VP, Directors |
| L2 | Expert | 110 | ✅ | ✅ | Senior Managers, Lead Roles |
| L3 | Specialist | 266 | ❌ | ❌ | Mid-level, Entry Roles |
| L4 | Worker | 39 | ❌ | ❌ | Task Executors |
| L5 | Tool | 50 | ❌ | ❌ | Atomic Operations |

**Total**: 489 agents

---

**End of Audit Report**

