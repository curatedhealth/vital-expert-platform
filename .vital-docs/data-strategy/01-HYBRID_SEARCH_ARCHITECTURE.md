# VITAL Hybrid Search Architecture
**Enterprise Data Strategy for Agent Selection**

**Version:** 1.0
**Date:** 2025-11-24
**Author:** VITAL Data Strategist
**Status:** Strategic Blueprint

---

## Executive Summary

The VITAL platform requires a sophisticated hybrid search system that combines semantic similarity, graph relationships, structured metadata, and full-text search across four database systems (Postgres, Pinecone, Neo4j, Elasticsearch) to select the optimal agent(s) for user queries. This document defines the architecture, query orchestration, and ranking algorithms for both Mode 2 (Ask Expert - 1:1) and Mode 4 (Ask Panel - Multi-Expert).

**Key Findings:**
- **Current State**: Partial hybrid search exists (`hybrid_agent_search.py`) but not fully integrated with Mode 2/4
- **Performance Gap**: Current implementation targets P90 <300ms but lacks distributed query orchestration
- **Missing Components**: Neo4j graph queries, Elasticsearch full-text search, evidence-based ranking
- **Opportunity**: Implement true multi-database fusion with evidence-based agent selection

---

## 1. System Architecture Overview

### 1.1 Multi-Database Query Orchestration

```
┌─────────────────────────────────────────────────────────────────────┐
│                   HYBRID SEARCH ORCHESTRATOR                        │
│                    (Query Coordinator)                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
         ┌──────────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
         │   SEMANTIC      │ │   GRAPH    │ │  METADATA  │
         │   SEARCH        │ │   SEARCH   │ │   SEARCH   │
         │   (Pinecone)    │ │   (Neo4j)  │ │  (Postgres)│
         └──────────┬──────┘ └─────┬──────┘ └─────┬──────┘
                    │               │               │
         ┌──────────▼──────────────▼───────────────▼──────┐
         │          FUSION RANKER                          │
         │  • Reciprocal Rank Fusion                      │
         │  • Evidence-Based Weighting                    │
         │  • Tier-Aware Scoring                          │
         └──────────┬──────────────────────────────────────┘
                    │
         ┌──────────▼──────────────────────────────────────┐
         │          FINAL RESULTS                          │
         │  Mode 2: Top 1 Agent                           │
         │  Mode 4: Top 3-5 Agents (Diverse Panel)        │
         └──────────────────────────────────────────────────┘
```

### 1.2 Database Responsibilities

| Database | Primary Purpose | Query Type | Weight | Latency Target |
|----------|----------------|------------|--------|----------------|
| **Pinecone** | Semantic similarity via embeddings | Vector search (cosine similarity) | 40% | <100ms |
| **Postgres** | Structured metadata, capabilities, domains | SQL joins, filtering | 30% | <50ms |
| **Neo4j** | Relationship traversal, collaboration history | Cypher graph queries | 20% | <100ms |
| **Elasticsearch** | Full-text search on descriptions, prompts | BM25 keyword matching | 10% | <50ms |

**Total Latency Budget:** <300ms (P90)

---

## 2. Query Orchestration Flow

### 2.1 Parallel Query Execution (Optimal)

```python
"""
Parallel execution minimizes latency by querying all databases simultaneously
Target: <300ms total time
"""

async def hybrid_search(query: str, filters: Dict) -> List[AgentResult]:
    start = time.perf_counter()

    # STEP 1: Generate query embedding (blocking, ~150ms)
    query_embedding = await embeddings.aembed_query(query)

    # STEP 2: Execute all searches in PARALLEL (max ~150ms)
    results = await asyncio.gather(
        vector_search(query_embedding, filters),      # Pinecone: ~100ms
        metadata_search(query, filters),              # Postgres: ~50ms
        graph_search(query_embedding, filters),       # Neo4j: ~100ms
        fulltext_search(query, filters),              # Elasticsearch: ~50ms
        return_exceptions=True  # Don't fail if one DB is down
    )

    # STEP 3: Fusion ranking (~50ms)
    final_results = reciprocal_rank_fusion(results)

    total_time = (time.perf_counter() - start) * 1000
    logger.info(f"Hybrid search completed in {total_time:.1f}ms")

    return final_results
```

**Performance Breakdown:**
- Embedding generation: 150ms (blocking, cannot parallelize)
- Parallel searches: max(100ms, 50ms, 100ms, 50ms) = 100ms (fastest parallel execution)
- Fusion ranking: 50ms
- **Total: ~300ms (P90 target met)**

### 2.2 Sequential Query Execution (Fallback)

Use sequential execution when:
- One database result can filter subsequent queries (cascade filtering)
- Budget is limited (parallel queries = 4x cost)
- Debugging/testing specific database performance

```python
async def sequential_search(query: str) -> List[AgentResult]:
    # Step 1: Postgres metadata search (fast filter)
    candidates = await metadata_search(query)  # ~50ms
    candidate_ids = [c['id'] for c in candidates]

    # Step 2: Pinecone semantic search (filtered to candidates)
    semantic_results = await vector_search(query, filter_ids=candidate_ids)  # ~100ms

    # Step 3: Neo4j graph enrichment (only for top 10)
    top_10_ids = [r['id'] for r in semantic_results[:10]]
    graph_results = await graph_search(top_10_ids)  # ~100ms

    # Step 4: Elasticsearch full-text (optional boost)
    fulltext_results = await fulltext_search(query)  # ~50ms

    return merge_results(semantic_results, graph_results, fulltext_results)
```

**Performance Breakdown:**
- Sequential: 50ms + 100ms + 100ms + 50ms = 300ms
- Same latency as parallel but reduces concurrent DB load
- **Use for cost optimization, not performance**

---

## 3. Individual Search Implementations

### 3.1 Pinecone Vector Search (40% Weight)

**Purpose:** Semantic similarity matching using embeddings

```python
async def vector_search(
    query_embedding: List[float],
    filters: Dict,
    top_k: int = 50
) -> List[Dict]:
    """
    Query Pinecone for semantic similarity

    Index: vital-agents-prod
    Dimensions: 1536 (text-embedding-3-large)
    Metric: cosine similarity
    """

    # Build metadata filters
    metadata_filter = {}
    if filters.get('tier'):
        metadata_filter['tier'] = {'$in': filters['tier']}
    if filters.get('domains'):
        metadata_filter['domains'] = {'$in': filters['domains']}
    if filters.get('status'):
        metadata_filter['status'] = {'$eq': 'active'}

    # Query Pinecone
    results = await pinecone_index.query(
        vector=query_embedding,
        top_k=top_k,
        filter=metadata_filter,
        include_metadata=True
    )

    # Transform results
    return [
        {
            'agent_id': match['id'],
            'vector_score': match['score'],  # 0.0 to 1.0
            'metadata': match['metadata']
        }
        for match in results['matches']
        if match['score'] >= 0.70  # Similarity threshold
    ]
```

**Index Metadata Structure:**
```json
{
  "agent_id": "uuid",
  "name": "fda-regulatory-strategist",
  "tier": 3,
  "domains": ["regulatory-affairs", "fda-compliance"],
  "capabilities": ["510k_clearance", "fda_submission"],
  "status": "active",
  "department": "Regulatory Affairs",
  "embedding_type": "agent_profile"
}
```

**Performance Optimization:**
- Use HNSW index (already default in Pinecone)
- Pre-filter metadata before vector search
- Cache frequent embeddings (user queries are often similar)

### 3.2 Postgres Metadata Search (30% Weight)

**Purpose:** Structured filtering on capabilities, domains, tier, performance metrics

```sql
-- Already implemented in hybrid_agent_search.py
-- This query combines vector results with Postgres metadata

WITH metadata_candidates AS (
    SELECT
        a.id AS agent_id,
        a.name AS agent_name,
        COALESCE((a.metadata->>'tier')::INTEGER, 2) AS tier,

        -- Domain proficiency
        AVG(ad.proficiency_score)::DECIMAL(3,2) AS domain_score,
        array_agg(DISTINCT d.name) FILTER (WHERE ad.proficiency_score >= 0.70) AS matched_domains,

        -- Capability proficiency
        AVG(ac.proficiency_score)::DECIMAL(3,2) AS capability_score,
        array_agg(DISTINCT c.name) FILTER (WHERE ac.proficiency_score >= 0.70) AS matched_capabilities,

        -- Performance metrics (evidence-based)
        COALESCE((a.metadata->>'success_rate')::DECIMAL(3,2), 0.75) AS success_rate,
        COALESCE((a.metadata->>'avg_response_time_ms')::INTEGER, 5000) AS avg_response_time_ms,
        COALESCE((a.metadata->>'user_satisfaction')::DECIMAL(3,2), 0.80) AS user_satisfaction

    FROM agents a
    LEFT JOIN agent_domains ad ON a.id = ad.agent_id
    LEFT JOIN domains d ON ad.domain_id = d.id
    LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
    LEFT JOIN capabilities c ON ac.capability_id = c.id
    WHERE
        a.is_active = true
        AND a.status = 'active'
        AND (
            -- Domain filter
            ARRAY_LENGTH($1::TEXT[], 1) IS NULL
            OR d.name = ANY($1::TEXT[])
        )
        AND (
            -- Tier filter
            $2::INTEGER IS NULL
            OR COALESCE((a.metadata->>'tier')::INTEGER, 2) = $2
        )
    GROUP BY a.id, a.name, a.metadata
)
SELECT * FROM metadata_candidates
WHERE
    domain_score >= 0.70 OR capability_score >= 0.70
ORDER BY
    (domain_score * 0.6 + capability_score * 0.4) DESC
LIMIT 50;
```

**Evidence-Based Metrics:**
- `success_rate`: % of queries successfully resolved (from audit logs)
- `avg_response_time_ms`: Average latency (from performance tracking)
- `user_satisfaction`: Average user rating 1-5 stars (from feedback)
- `resolution_count`: Total queries handled (for confidence weighting)

### 3.3 Neo4j Graph Search (20% Weight)

**Purpose:** Relationship-based scoring (collaboration history, expertise networks, escalation paths)

```cypher
// Query 1: Find agents with strong collaboration history
MATCH (agent:Agent {id: $agent_id})-[:COLLABORATED_WITH {strength: $min_strength}]->
      (related:Agent)
WHERE related.status = 'active'
RETURN related.id, related.name, count(*) as collaboration_count
ORDER BY collaboration_count DESC
LIMIT 20;

// Query 2: Find agents in same expertise network
MATCH (query_agent:Agent)-[:HAS_EXPERTISE]->(domain:Domain)<-[:HAS_EXPERTISE]-(candidate:Agent)
WHERE candidate.status = 'active'
  AND candidate.id <> query_agent.id
RETURN candidate.id, candidate.name, count(DISTINCT domain) as shared_domains
ORDER BY shared_domains DESC
LIMIT 20;

// Query 3: Find agents with escalation paths (for panel formation)
MATCH (primary:Agent {id: $primary_agent_id})-[:CAN_ESCALATE_TO*1..2]->(backup:Agent)
WHERE backup.status = 'active'
RETURN backup.id, backup.name, length(path) as escalation_distance
ORDER BY escalation_distance ASC
LIMIT 10;

// Query 4: Find agents who solved similar problems (semantic + graph)
MATCH (agent:Agent)-[:SOLVED]->(problem:Problem)
WHERE problem.embedding_similarity > 0.80
  AND agent.status = 'active'
RETURN agent.id, agent.name, problem.success_rate, problem.resolved_at
ORDER BY problem.success_rate DESC, problem.resolved_at DESC
LIMIT 20;
```

**Graph Schema:**
```
(Agent)-[:HAS_EXPERTISE {proficiency: 0.0-1.0}]->(Domain)
(Agent)-[:HAS_CAPABILITY {proficiency: 0.0-1.0}]->(Capability)
(Agent)-[:USES_TOOL {frequency: daily|weekly|monthly}]->(Tool)
(Agent)-[:COLLABORATED_WITH {strength: 0.0-1.0, count: N}]->(Agent)
(Agent)-[:CAN_ESCALATE_TO {priority: 1-10}]->(Agent)
(Agent)-[:SOLVED {success_rate: 0.0-1.0, timestamp: datetime}]->(Problem)
(Agent)-[:WORKS_IN]->(Department)
(Agent)-[:REPORTS_TO]->(Agent)
```

**Graph Scoring:**
```python
def calculate_graph_score(agent_id: str, query_context: Dict) -> float:
    """
    Calculate graph-based relevance score

    Factors:
    - Collaboration strength with previously selected agents (panel mode)
    - Shared domain expertise (network effect)
    - Problem-solving history (similar queries)
    - Escalation path availability (backup coverage)
    """

    score = 0.0

    # Factor 1: Collaboration history (0-25 points)
    collaboration_count = get_collaboration_count(agent_id, query_context['previous_agents'])
    score += min(collaboration_count * 5, 25)  # Max 25 points (5 collaborations)

    # Factor 2: Shared domains (0-25 points)
    shared_domains = get_shared_domains(agent_id, query_context['required_domains'])
    score += min(shared_domains * 5, 25)  # Max 25 points (5 shared domains)

    # Factor 3: Problem-solving history (0-30 points)
    similar_problems = get_similar_problems_solved(agent_id, query_context['query_embedding'])
    score += min(similar_problems * 10, 30)  # Max 30 points (3 similar problems)

    # Factor 4: Escalation paths (0-20 points)
    escalation_count = get_escalation_path_count(agent_id)
    score += min(escalation_count * 4, 20)  # Max 20 points (5 escalation paths)

    return score / 100.0  # Normalize to 0.0-1.0
```

### 3.4 Elasticsearch Full-Text Search (10% Weight)

**Purpose:** Keyword matching on descriptions, system prompts, specialties

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "FDA 510k regulatory submission",
            "fields": [
              "name^3",
              "description^2",
              "system_prompt",
              "specialties^2",
              "knowledge_domains"
            ],
            "type": "best_fields",
            "operator": "or",
            "minimum_should_match": "60%"
          }
        }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "tier": { "gte": 1, "lte": 3 } } }
      ],
      "should": [
        {
          "match_phrase": {
            "description": {
              "query": "FDA regulatory",
              "boost": 2
            }
          }
        },
        {
          "term": {
            "domains": {
              "value": "regulatory-affairs",
              "boost": 1.5
            }
          }
        }
      ]
    }
  },
  "size": 50,
  "_source": ["id", "name", "description", "tier", "domains"],
  "highlight": {
    "fields": {
      "description": {},
      "system_prompt": {}
    }
  }
}
```

**BM25 Scoring:**
- Uses Elasticsearch's default BM25 algorithm
- Boosts exact phrase matches
- Field-level boosting (name > description > prompt)
- Returns highlighted snippets for explainability

---

## 4. Fusion Ranking Algorithm

### 4.1 Reciprocal Rank Fusion (RRF)

**Purpose:** Merge results from multiple databases without requiring normalized scores

```python
def reciprocal_rank_fusion(
    search_results: Dict[str, List[Dict]],
    weights: Dict[str, float] = {
        'vector': 0.40,
        'metadata': 0.30,
        'graph': 0.20,
        'fulltext': 0.10
    },
    k: int = 60  # RRF constant
) -> List[Dict]:
    """
    Reciprocal Rank Fusion (RRF) Algorithm

    Formula: RRF(agent) = Σ weight_i / (k + rank_i)

    where:
    - weight_i = weight for database i
    - rank_i = rank of agent in results from database i (1-indexed)
    - k = constant (usually 60) to reduce impact of high ranks

    Benefits:
    - No score normalization needed
    - Robust to outliers
    - Gives higher weight to consistently high-ranked items
    """

    agent_scores = {}

    # Process vector results
    for rank, result in enumerate(search_results.get('vector', []), start=1):
        agent_id = result['agent_id']
        rrf_score = weights['vector'] / (k + rank)
        agent_scores[agent_id] = agent_scores.get(agent_id, 0.0) + rrf_score

    # Process metadata results
    for rank, result in enumerate(search_results.get('metadata', []), start=1):
        agent_id = result['agent_id']
        rrf_score = weights['metadata'] / (k + rank)
        agent_scores[agent_id] = agent_scores.get(agent_id, 0.0) + rrf_score

    # Process graph results
    for rank, result in enumerate(search_results.get('graph', []), start=1):
        agent_id = result['agent_id']
        rrf_score = weights['graph'] / (k + rank)
        agent_scores[agent_id] = agent_scores.get(agent_id, 0.0) + rrf_score

    # Process fulltext results
    for rank, result in enumerate(search_results.get('fulltext', []), start=1):
        agent_id = result['agent_id']
        rrf_score = weights['fulltext'] / (k + rank)
        agent_scores[agent_id] = agent_scores.get(agent_id, 0.0) + rrf_score

    # Sort by combined RRF score
    ranked_agents = sorted(
        agent_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [{'agent_id': agent_id, 'rrf_score': score}
            for agent_id, score in ranked_agents]
```

### 4.2 Evidence-Based Weighting

**Purpose:** Adjust RRF scores based on empirical performance metrics

```python
def apply_evidence_based_weighting(
    rrf_results: List[Dict],
    agent_metadata: Dict[str, Dict]
) -> List[Dict]:
    """
    Apply evidence-based adjustments to RRF scores

    Evidence Factors:
    1. Success Rate (0.0-1.0) - % of queries successfully resolved
    2. User Satisfaction (0.0-1.0) - Average rating from feedback
    3. Response Time (normalized) - Faster = better
    4. Tier Appropriateness - Tier 3 for complex, Tier 1 for simple
    5. Availability - Current load (active conversations)
    6. Domain Authority - # of successful resolutions in domain
    7. Recent Performance - Success rate in last 30 days
    8. Confidence Level - Based on resolution_count (more = higher confidence)
    """

    for result in rrf_results:
        agent_id = result['agent_id']
        metadata = agent_metadata.get(agent_id, {})

        # Base score from RRF
        base_score = result['rrf_score']

        # Evidence multipliers (0.5 to 1.5 range)
        success_multiplier = 0.5 + (metadata.get('success_rate', 0.75))
        satisfaction_multiplier = 0.5 + (metadata.get('user_satisfaction', 0.80))

        # Response time penalty (normalize to 0.8-1.2)
        avg_time = metadata.get('avg_response_time_ms', 5000)
        time_multiplier = max(0.8, min(1.2, 10000 / avg_time))

        # Confidence weighting (based on experience)
        resolution_count = metadata.get('resolution_count', 0)
        confidence = min(1.0, resolution_count / 100)  # Saturates at 100 resolutions

        # Final score
        result['final_score'] = (
            base_score *
            success_multiplier *
            satisfaction_multiplier *
            time_multiplier *
            (0.5 + 0.5 * confidence)  # Confidence range: 0.5-1.0
        )

    # Re-sort by final score
    rrf_results.sort(key=lambda x: x['final_score'], reverse=True)

    return rrf_results
```

---

## 5. Mode-Specific Selection Logic

### 5.1 Mode 2: Ask Expert (1:1 Selection)

**Goal:** Select the single best agent for user query

**Selection Criteria:**
1. **Highest Final Score** from fusion ranking
2. **Tier Appropriateness** - Match query complexity to agent tier
3. **Availability** - Prefer agents with lower active conversation count
4. **Domain Coverage** - Ensure agent covers all required domains

```python
async def select_mode2_agent(
    query: str,
    query_metadata: Dict
) -> AgentSelectionResult:
    """
    Mode 2: Select single best agent for 1:1 conversation

    Returns:
        Top 1 agent with highest evidence-based score
    """

    # Run hybrid search
    results = await hybrid_search(query, query_metadata)

    # Filter: Must cover at least 80% of required domains
    required_domains = query_metadata.get('domains', [])
    filtered_results = [
        r for r in results
        if domain_coverage(r['agent_id'], required_domains) >= 0.80
    ]

    # Filter: Check availability (max 5 concurrent conversations per agent)
    available_results = [
        r for r in filtered_results
        if get_active_conversation_count(r['agent_id']) < 5
    ]

    # Fallback: If no available agents, allow up to 10 conversations
    if not available_results:
        available_results = [
            r for r in filtered_results
            if get_active_conversation_count(r['agent_id']) < 10
        ]

    # Select top 1
    if not available_results:
        raise NoAvailableAgentsError("All matching agents are at capacity")

    selected_agent = available_results[0]

    return AgentSelectionResult(
        agent_id=selected_agent['agent_id'],
        confidence=selected_agent['final_score'],
        selection_method='hybrid_search',
        ranking_breakdown={
            'vector_score': selected_agent.get('vector_score', 0),
            'metadata_score': selected_agent.get('metadata_score', 0),
            'graph_score': selected_agent.get('graph_score', 0),
            'fulltext_score': selected_agent.get('fulltext_score', 0),
            'rrf_score': selected_agent['rrf_score'],
            'final_score': selected_agent['final_score']
        }
    )
```

### 5.2 Mode 4: Ask Panel (Multi-Expert Selection)

**Goal:** Select 3-5 complementary agents for panel discussion

**Selection Criteria:**
1. **Diversity** - Agents from different domains/departments
2. **Complementary Expertise** - Cover all aspects of query
3. **Collaboration History** - Prefer agents who work well together
4. **Tier Balance** - Mix of Tier 2 and Tier 3 agents

```python
async def select_mode4_panel(
    query: str,
    query_metadata: Dict,
    panel_size: int = 3
) -> List[AgentSelectionResult]:
    """
    Mode 4: Select diverse panel of agents for multi-expert discussion

    Algorithm:
    1. Select top agent (same as Mode 2)
    2. Select complementary agents (maximize diversity)
    3. Verify collaboration history (bonus for strong collaborations)
    4. Balance panel by tier and domain

    Returns:
        List of 3-5 agents forming a diverse expert panel
    """

    # Run hybrid search
    results = await hybrid_search(query, query_metadata)

    panel = []
    selected_domains = set()
    selected_departments = set()

    # Step 1: Select primary agent (highest score)
    primary = results[0]
    panel.append(primary)
    selected_domains.update(primary['matched_domains'])
    selected_departments.add(primary['department'])

    # Step 2: Select complementary agents
    for candidate in results[1:]:
        if len(panel) >= panel_size:
            break

        # Diversity checks
        candidate_domains = set(candidate['matched_domains'])
        candidate_dept = candidate['department']

        # Calculate diversity score
        domain_diversity = len(candidate_domains - selected_domains) / len(candidate_domains)
        dept_diversity = 1.0 if candidate_dept not in selected_departments else 0.3

        # Collaboration bonus
        collaboration_score = get_collaboration_strength(
            candidate['agent_id'],
            [p['agent_id'] for p in panel]
        )

        # Combined score
        diversity_score = (
            domain_diversity * 0.5 +
            dept_diversity * 0.3 +
            collaboration_score * 0.2
        )

        # Add to panel if diversity threshold met
        if diversity_score >= 0.60:
            panel.append(candidate)
            selected_domains.update(candidate_domains)
            selected_departments.add(candidate_dept)

    # Step 3: Validate panel
    if len(panel) < 2:
        # Fallback: Add second-best agent regardless of diversity
        panel.append(results[1])

    return [
        AgentSelectionResult(
            agent_id=agent['agent_id'],
            confidence=agent['final_score'],
            panel_position=idx + 1,
            diversity_contribution=calculate_diversity_contribution(agent, panel)
        )
        for idx, agent in enumerate(panel)
    ]
```

---

## 6. Performance Optimization

### 6.1 Caching Strategy

```python
"""
Multi-Level Caching for Hybrid Search
"""

# Level 1: Query Cache (Redis, TTL 5 minutes)
# - Cache complete search results for identical queries
# - Key: hash(query + filters)
# - Value: List[AgentResult]
# - Hit rate: ~40% (users ask similar questions)

@cache(ttl=300, key_func=lambda q, f: hash(q + str(f)))
async def hybrid_search_cached(query: str, filters: Dict):
    return await hybrid_search(query, filters)

# Level 2: Embedding Cache (Redis, TTL 1 hour)
# - Cache query embeddings (expensive to generate)
# - Key: hash(query_text)
# - Value: List[float] (1536 dims)
# - Hit rate: ~30% (queries vary but overlap)

@cache(ttl=3600, key_func=lambda q: hash(q))
async def generate_embedding_cached(query: str):
    return await embeddings.aembed_query(query)

# Level 3: Agent Metadata Cache (Redis, TTL 1 hour)
# - Cache full agent metadata (capabilities, domains, performance)
# - Key: f"agent:{agent_id}:metadata"
# - Value: Dict[str, Any]
# - Hit rate: ~90% (agents rarely change)

@cache(ttl=3600, key_func=lambda agent_id: f"agent:{agent_id}:metadata")
async def get_agent_metadata_cached(agent_id: str):
    return await db.fetch_agent_metadata(agent_id)

# Level 4: Graph Relationship Cache (Redis, TTL 30 minutes)
# - Cache graph query results (Neo4j queries are expensive)
# - Key: f"graph:{agent_id}:collaborations"
# - Value: List[Dict]
# - Hit rate: ~60% (relationships change slowly)

@cache(ttl=1800, key_func=lambda agent_id: f"graph:{agent_id}:collab")
async def get_collaboration_history_cached(agent_id: str):
    return await neo4j.query_collaborations(agent_id)
```

### 6.2 Index Optimization

**Postgres Indexes:**
```sql
-- Vector search support (pgvector)
CREATE INDEX idx_agent_embeddings_hnsw
ON agent_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Metadata filters
CREATE INDEX idx_agents_status_tier
ON agents (is_active, (metadata->>'tier'));

CREATE INDEX idx_agent_domains_proficiency
ON agent_domains (agent_id, proficiency_score)
WHERE proficiency_score >= 0.70;

CREATE INDEX idx_agent_capabilities_proficiency
ON agent_capabilities (agent_id, proficiency_score)
WHERE proficiency_score >= 0.70;

-- Performance metrics (evidence-based)
CREATE INDEX idx_agents_performance
ON agents (
    (metadata->>'success_rate'),
    (metadata->>'user_satisfaction'),
    (metadata->>'avg_response_time_ms')
);
```

**Pinecone Indexes:**
- Use namespace per tenant for isolation
- Enable metadata filtering on tier, domains, status
- Use HNSW index (default, optimized for latency)

**Neo4j Indexes:**
```cypher
// Agent lookups
CREATE INDEX agent_id_index FOR (a:Agent) ON (a.id);
CREATE INDEX agent_status_index FOR (a:Agent) ON (a.status);

// Relationship queries
CREATE INDEX collaboration_strength_index
FOR ()-[r:COLLABORATED_WITH]-() ON (r.strength);

CREATE INDEX expertise_proficiency_index
FOR ()-[r:HAS_EXPERTISE]-() ON (r.proficiency);
```

**Elasticsearch Indexes:**
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "vital_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "stop", "snowball"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "vital_analyzer", "boost": 3.0 },
      "description": { "type": "text", "analyzer": "vital_analyzer", "boost": 2.0 },
      "system_prompt": { "type": "text", "analyzer": "vital_analyzer" },
      "domains": { "type": "keyword" },
      "tier": { "type": "integer" },
      "status": { "type": "keyword" }
    }
  }
}
```

---

## 7. Integration with Mode 2 & Mode 4

### 7.1 Current Implementation Gaps

**Evidence from Code Analysis:**

1. **`hybrid_agent_search.py`** (existing):
   - ✅ Implements Postgres + Pinecone hybrid search
   - ❌ Missing Neo4j graph queries
   - ❌ Missing Elasticsearch full-text search
   - ❌ Not integrated into Mode 2/4 workflows

2. **`mode2_auto_query.py`** (Mode 2 implementation):
   - ✅ Uses `AgentSelectorService` for agent selection
   - ❌ Falls back to simple semantic search (not true hybrid)
   - ❌ No evidence-based weighting
   - ❌ No graph relationship consideration

3. **`medical_affairs_agent_selector.py`**:
   - ✅ Multi-factor scoring (semantic, domain, skills, performance)
   - ❌ Limited to Medical Affairs agents (165 agents)
   - ❌ No graph search
   - ❌ Sequential execution (not parallel)

### 7.2 Integration Plan

**Phase 1: Enhance Hybrid Search Service (Week 1-2)**

```python
# services/enhanced_hybrid_search.py

class EnhancedHybridSearch:
    """
    Production-ready hybrid search for VITAL platform
    Integrates Postgres, Pinecone, Neo4j, Elasticsearch
    """

    def __init__(self):
        self.postgres = SupabaseClient()
        self.pinecone = PineconeClient()
        self.neo4j = Neo4jClient()
        self.elasticsearch = ElasticsearchClient()
        self.embeddings = OpenAIEmbeddings()
        self.cache = RedisCache()

    async def search_agents(
        self,
        query: str,
        mode: Literal['mode2', 'mode4'],
        filters: Optional[Dict] = None
    ) -> List[AgentSelectionResult]:
        """
        Unified search for Mode 2 and Mode 4
        """

        # Check cache
        cache_key = f"hybrid_search:{mode}:{hash(query + str(filters))}"
        cached_results = await self.cache.get(cache_key)
        if cached_results:
            return cached_results

        # Generate embedding
        query_embedding = await self.embeddings.aembed_query(query)

        # Parallel search across all databases
        results = await asyncio.gather(
            self._vector_search(query_embedding, filters),
            self._metadata_search(query, filters),
            self._graph_search(query_embedding, filters),
            self._fulltext_search(query, filters),
            return_exceptions=True
        )

        # Fusion ranking
        fused_results = self._reciprocal_rank_fusion(results)

        # Evidence-based weighting
        agent_metadata = await self._load_agent_metadata(
            [r['agent_id'] for r in fused_results]
        )
        final_results = self._apply_evidence_weighting(fused_results, agent_metadata)

        # Mode-specific selection
        if mode == 'mode2':
            selected = await self._select_mode2_agent(final_results)
        else:  # mode4
            selected = await self._select_mode4_panel(final_results)

        # Cache results
        await self.cache.set(cache_key, selected, ttl=300)

        return selected
```

**Phase 2: Update Mode 2 Workflow (Week 2)**

```python
# langgraph_workflows/mode2_auto_query.py

async def auto_select_agent(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Enhanced agent selection using hybrid search
    """

    # Use enhanced hybrid search
    hybrid_search = EnhancedHybridSearch()

    result = await hybrid_search.search_agents(
        query=state['query'],
        mode='mode2',
        filters={
            'tenant_id': state['tenant_id'],
            'domains': state.get('domains'),
            'tier': state.get('required_tier')
        }
    )

    selected_agent = result[0]  # Top 1 agent

    state['selected_agent_id'] = selected_agent.agent_id
    state['selection_confidence'] = selected_agent.confidence
    state['selection_metadata'] = {
        'method': 'hybrid_search',
        'breakdown': selected_agent.ranking_breakdown,
        'alternatives': [r.agent_id for r in result[1:6]]  # Top 5 alternatives
    }

    return state
```

**Phase 3: Update Mode 4 Panel Formation (Week 3)**

```python
# langgraph_workflows/mode4_auto_chat_autonomous.py

async def select_expert_panel(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Enhanced panel selection using hybrid search + diversity optimization
    """

    # Use enhanced hybrid search
    hybrid_search = EnhancedHybridSearch()

    panel = await hybrid_search.search_agents(
        query=state['query'],
        mode='mode4',
        filters={
            'tenant_id': state['tenant_id'],
            'panel_size': 3,  # Default 3 experts
            'diversity_threshold': 0.60  # 60% diversity requirement
        }
    )

    state['expert_panel'] = [agent.agent_id for agent in panel]
    state['panel_metadata'] = {
        'primary_expert': panel[0].agent_id,
        'panel_composition': [
            {
                'agent_id': agent.agent_id,
                'role': 'primary' if idx == 0 else 'supporting',
                'confidence': agent.confidence,
                'diversity_score': agent.diversity_contribution
            }
            for idx, agent in enumerate(panel)
        ]
    }

    return state
```

---

## 8. Success Metrics & Monitoring

### 8.1 Key Performance Indicators (KPIs)

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| **Search Latency P50** | <150ms | Total time from query to results | Real-time |
| **Search Latency P90** | <300ms | 90th percentile latency | Real-time |
| **Search Latency P99** | <500ms | 99th percentile latency | Real-time |
| **Cache Hit Rate** | >40% | (Cache hits / Total searches) × 100 | Hourly |
| **Agent Selection Accuracy** | >85% | User accepts recommended agent | Daily |
| **Result Relevance** | >4.0/5.0 | User rating of search results | Daily |
| **Mode 2 Success Rate** | >90% | Queries resolved by selected agent | Daily |
| **Mode 4 Panel Effectiveness** | >85% | Queries resolved by panel consensus | Daily |

### 8.2 Monitoring Implementation

```python
# services/search_monitoring.py

class SearchMonitor:
    """Monitor hybrid search performance and quality"""

    def __init__(self, metrics_client, logger):
        self.metrics = metrics_client
        self.logger = logger

    async def track_search(
        self,
        query: str,
        results: List[AgentResult],
        latency_ms: float,
        cache_hit: bool
    ):
        """Track individual search metrics"""

        # Latency metrics
        self.metrics.histogram(
            'hybrid_search.latency_ms',
            latency_ms,
            tags={'mode': results[0].mode, 'cache_hit': cache_hit}
        )

        # Result quality
        self.metrics.gauge(
            'hybrid_search.result_count',
            len(results),
            tags={'mode': results[0].mode}
        )

        # Top result confidence
        self.metrics.gauge(
            'hybrid_search.top_confidence',
            results[0].confidence,
            tags={'mode': results[0].mode}
        )

        # Cache performance
        self.metrics.increment(
            'hybrid_search.cache_hit' if cache_hit else 'hybrid_search.cache_miss',
            tags={'mode': results[0].mode}
        )

    async def track_selection_feedback(
        self,
        query: str,
        selected_agent_id: str,
        user_accepted: bool,
        user_rating: Optional[float]
    ):
        """Track user feedback on agent selection"""

        # Acceptance rate
        self.metrics.increment(
            'agent_selection.accepted' if user_accepted else 'agent_selection.rejected',
            tags={'agent_id': selected_agent_id}
        )

        # User rating
        if user_rating:
            self.metrics.gauge(
                'agent_selection.rating',
                user_rating,
                tags={'agent_id': selected_agent_id}
            )
```

### 8.3 A/B Testing Framework

```python
# services/ab_testing.py

class HybridSearchABTest:
    """A/B test different hybrid search configurations"""

    experiments = {
        'weight_optimization': {
            'control': {
                'vector': 0.40,
                'metadata': 0.30,
                'graph': 0.20,
                'fulltext': 0.10
            },
            'variant_a': {  # More weight on vector
                'vector': 0.50,
                'metadata': 0.25,
                'graph': 0.15,
                'fulltext': 0.10
            },
            'variant_b': {  # More weight on graph
                'vector': 0.35,
                'metadata': 0.25,
                'graph': 0.30,
                'fulltext': 0.10
            }
        },
        'panel_size': {
            'control': {'panel_size': 3},
            'variant_a': {'panel_size': 4},
            'variant_b': {'panel_size': 5}
        }
    }

    async def assign_variant(self, user_id: str, experiment_id: str) -> str:
        """Assign user to experiment variant"""
        # Hash-based assignment for consistency
        hash_val = int(hashlib.md5(f"{user_id}:{experiment_id}".encode()).hexdigest(), 16)
        variant_idx = hash_val % 3
        return ['control', 'variant_a', 'variant_b'][variant_idx]
```

---

## 9. Cost Optimization

### 9.1 Query Cost Analysis

| Database | Query Type | Cost per Query | QPM @ P90 | Monthly Cost (10K queries/day) |
|----------|-----------|----------------|-----------|-------------------------------|
| **Pinecone** | Vector search (1536 dims) | $0.001 | 100 | $30 |
| **Postgres** | SQL joins + aggregation | $0.0001 | 200 | $3 |
| **Neo4j** | Cypher graph traversal | $0.002 | 100 | $60 |
| **Elasticsearch** | BM25 full-text search | $0.0005 | 200 | $15 |
| **OpenAI Embeddings** | text-embedding-3-large | $0.00013 per 1K tokens | - | $39 |
| **Redis Cache** | Get/Set operations | $0.00001 | 500 | $3 |
| **Total** | - | **~$0.005** | - | **$150/month** |

**Cost per successful agent selection:** $0.005 (0.5 cents)
**Cost per conversation (10 turns):** $0.05 (5 cents)

### 9.2 Cost Optimization Strategies

1. **Aggressive Caching**
   - 40% cache hit rate saves $60/month
   - Implement L1 (query results) + L2 (embeddings) cache

2. **Cascade Filtering**
   - Use cheap Postgres queries to filter before expensive Pinecone/Neo4j
   - Reduce search space by 60-80%

3. **Batch Embedding Generation**
   - Pre-generate embeddings for common queries
   - Cache for 1 hour (most queries repeat)

4. **Lazy Graph Queries**
   - Only query Neo4j for Mode 4 (panel formation)
   - Skip graph search for Mode 2 if confidence >0.90

5. **Dynamic Weight Adjustment**
   - Reduce graph/fulltext weight when not needed
   - Use lightweight searches for simple queries

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement `EnhancedHybridSearch` service
- [ ] Add Neo4j graph queries (collaboration, expertise networks)
- [ ] Add Elasticsearch full-text search
- [ ] Implement RRF fusion algorithm
- [ ] Add evidence-based weighting

### Phase 2: Integration (Weeks 3-4)
- [ ] Integrate hybrid search into Mode 2 workflow
- [ ] Integrate hybrid search into Mode 4 workflow
- [ ] Update agent selection nodes in LangGraph
- [ ] Implement multi-level caching
- [ ] Add performance monitoring

### Phase 3: Optimization (Weeks 5-6)
- [ ] A/B test weight configurations
- [ ] Optimize database indexes
- [ ] Implement cascade filtering
- [ ] Add cost tracking and optimization
- [ ] Performance tuning (target P90 <300ms)

### Phase 4: Evidence Collection (Weeks 7-8)
- [ ] Implement feedback collection system
- [ ] Build agent performance tracking
- [ ] Create evidence-based metrics dashboard
- [ ] A/B test panel size and composition
- [ ] Document learnings and iterate

---

## 11. Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Database Downtime** (Neo4j, Elasticsearch) | High | Low | Graceful degradation: Use Postgres + Pinecone only |
| **Latency Spikes** (>500ms P99) | Medium | Medium | Implement timeouts, cache warming, load shedding |
| **Poor Selection Accuracy** (<80%) | High | Medium | A/B test weights, collect user feedback, iterate |
| **Cost Overruns** (>$500/month) | Medium | Low | Implement cost tracking, dynamic weight adjustment |
| **Cache Stampede** (mass cache expiry) | Medium | Low | Use jittered TTLs, cache warming |

---

## Appendices

### A. Database Schema Reference

See: `/Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`

### B. Performance Benchmarks

See: `02-EVIDENCE_BASED_SELECTION.md` (Section 7: Performance Metrics)

### C. API Reference

See: `services/ai-engine/src/api/routes/hybrid_search.py`

---

**Next Document:** `02-EVIDENCE_BASED_SELECTION.md` - Evidence-Based Agent Selection Framework
