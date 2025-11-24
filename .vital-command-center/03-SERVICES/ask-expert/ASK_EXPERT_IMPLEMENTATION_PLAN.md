# VITAL Ask Expert Services - Detailed Implementation Plan
**Version:** 1.0
**Date:** November 17, 2025
**Status:** Active Roadmap
**Based On:** Backend Gap Analysis (62% → 95% Completion)
**Timeline:** 30 weeks (7.5 months)
**Investment:** $169k

---

## Executive Summary

This plan outlines the **complete implementation roadmap** to bring VITAL Ask Expert from **62% to 95% completion**, achieving full PRD v2.0 and ARD v2.0 compliance.

### Current State vs Target State

| Component | Current | Target | Gap |
|-----------|---------|--------|-----|
| **Core Workflows** | 90% | 100% | Multi-agent panel, streaming |
| **GraphRAG** | 65% | 95% | Neo4j, correct weights |
| **Deep Agents** | 25% | 90% | Sub-agent spawning, Levels 3-5 |
| **Database** | 67% | 95% | Neo4j integration |
| **Advanced Services** | 15% | 90% | Artifacts, collaboration, multimodal |
| **Overall** | **62%** | **95%** | **33% gap** |

### Strategic Priorities

**Phase 1 (Weeks 1-8):** Fix critical blockers - **P0 Features**
**Phase 2 (Weeks 9-24):** Build competitive advantages - **P1 Features**
**Phase 3 (Weeks 25-30):** Production polish - **P2 Features**

### Success Criteria

✅ All 4 modes fully functional with GraphRAG
✅ 5-level deep agent architecture operational
✅ Artifacts system with 50+ templates
✅ Team collaboration with RBAC
✅ Multimodal processing (images, videos, audio)
✅ Code execution (R, Python, SAS)
✅ 92-95% agent selection accuracy
✅ <450ms P95 GraphRAG latency

---

## Table of Contents

1. [Phase 1: Critical Foundations (Weeks 1-8)](#phase-1-critical-foundations-weeks-1-8)
2. [Phase 2: Major Features (Weeks 9-24)](#phase-2-major-features-weeks-9-24)
3. [Phase 3: Production Polish (Weeks 25-30)](#phase-3-production-polish-weeks-25-30)
4. [Team Structure & Resource Allocation](#team-structure--resource-allocation)
5. [Technical Specifications](#technical-specifications)
6. [Dependencies & Integration Points](#dependencies--integration-points)
7. [Testing & Validation Strategy](#testing--validation-strategy)
8. [Risk Management](#risk-management)
9. [Success Metrics & KPIs](#success-metrics--kpis)
10. [Implementation Checklist](#implementation-checklist)

---

## Phase 1: Critical Foundations (Weeks 1-8)

**Goal:** Unblock core PRD features and fix critical gaps
**Priority:** P0 (Blocks core functionality)
**Team:** 2 Senior Engineers + 1 DevOps
**Investment:** $48k

### Week 1-2: Neo4j Integration & GraphRAG Fix

#### Objectives
- ✅ Deploy Neo4j AuraDB database
- ✅ Implement Neo4jClient service
- ✅ Migrate agent relationships to graph model
- ✅ Fix GraphRAG hybrid search weights (30/50/20)
- ✅ Achieve <450ms P95 latency

#### Detailed Tasks

**Day 1-2: Neo4j Setup**
```yaml
Task 1.1: Provision Neo4j AuraDB
  - Create Neo4j Aura account
  - Provision production database (4GB RAM, 2 cores)
  - Configure network access (Railway whitelist)
  - Setup backups (daily automated)
  Owner: DevOps Engineer
  Estimate: 4 hours

Task 1.2: Local Development Setup
  - Docker Compose with Neo4j container
  - Seed data for testing
  - Neo4j Browser access
  Owner: Senior Engineer 1
  Estimate: 4 hours
```

**Day 3-5: Neo4jClient Service**
```python
# File: services/ai-engine/src/services/neo4j_client.py

from neo4j import AsyncGraphDatabase
from typing import List, Dict, Optional
import structlog

logger = structlog.get_logger()

class Neo4jClient:
    """Neo4j graph database client for agent relationships."""

    def __init__(self, uri: str, user: str, password: str):
        self.driver = AsyncGraphDatabase.driver(
            uri,
            auth=(user, password),
            max_connection_pool_size=50,
            connection_timeout=30
        )

    async def close(self):
        await self.driver.close()

    async def create_agent_node(
        self,
        agent_id: str,
        name: str,
        capabilities: List[str],
        domains: List[str],
        tenant_id: str
    ) -> Dict:
        """Create agent node in graph."""
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                CREATE (a:Agent {
                    id: $agent_id,
                    name: $name,
                    capabilities: $capabilities,
                    domains: $domains,
                    tenant_id: $tenant_id,
                    created_at: datetime()
                })
                RETURN a
            """, agent_id=agent_id, name=name,
                capabilities=capabilities, domains=domains,
                tenant_id=tenant_id)

            record = await result.single()
            return dict(record["a"])

    async def create_relationship(
        self,
        from_agent_id: str,
        to_agent_id: str,
        relationship_type: str,
        weight: float = 1.0,
        metadata: Optional[Dict] = None
    ):
        """Create relationship between agents."""
        async with self.driver.session(database="neo4j") as session:
            await session.run(f"""
                MATCH (a1:Agent {{id: $from_id}})
                MATCH (a2:Agent {{id: $to_id}})
                CREATE (a1)-[r:{relationship_type} {{
                    weight: $weight,
                    metadata: $metadata,
                    created_at: datetime()
                }}]->(a2)
            """, from_id=from_agent_id, to_id=to_agent_id,
                weight=weight, metadata=metadata or {})

    async def graph_traversal_search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        max_depth: int = 3,
        limit: int = 10
    ) -> List[Dict]:
        """
        Graph-based agent discovery using relationship traversal.

        Returns agents that are:
        - Directly related to query-matching agents
        - Frequently co-occur in successful consultations
        - Complement each other's capabilities
        """
        async with self.driver.session(database="neo4j") as session:
            result = await session.run("""
                // Find seed agents matching query
                MATCH (seed:Agent {tenant_id: $tenant_id})
                WHERE seed.embedding IS NOT NULL

                // Calculate similarity (cosine distance)
                WITH seed,
                     gds.similarity.cosine(seed.embedding, $query_embedding) as similarity
                WHERE similarity > 0.7
                ORDER BY similarity DESC
                LIMIT 5

                // Traverse relationships
                MATCH path = (seed)-[r:RELATES_TO|CO_OCCURS_WITH|COMPLEMENTS*1..$max_depth]-(related:Agent)
                WHERE related.tenant_id = $tenant_id
                  AND related.is_active = true

                // Calculate graph-based score
                WITH related,
                     seed,
                     path,
                     similarity,
                     [rel in relationships(path) | rel.weight] as weights

                WITH related,
                     similarity,
                     reduce(s = 0.0, w in weights | s + w) / size(weights) as avg_relationship_weight,
                     length(path) as distance,
                     count(DISTINCT seed) as seed_count

                // Combine scores
                WITH related,
                     (similarity * 0.4 +
                      avg_relationship_weight * 0.3 +
                      (1.0 / distance) * 0.2 +
                      (seed_count / 5.0) * 0.1) as graph_score

                RETURN DISTINCT
                    related.id as agent_id,
                    related.name as name,
                    related.capabilities as capabilities,
                    graph_score,
                    avg_relationship_weight,
                    distance
                ORDER BY graph_score DESC
                LIMIT $limit
            """, tenant_id=tenant_id, query_embedding=query_embedding,
                max_depth=max_depth, limit=limit)

            return [dict(record) async for record in result]

    async def update_agent_performance(
        self,
        agent_id: str,
        success: bool,
        confidence: float,
        user_rating: Optional[float] = None
    ):
        """Update agent node with performance metrics."""
        async with self.driver.session(database="neo4j") as session:
            await session.run("""
                MATCH (a:Agent {id: $agent_id})
                SET a.total_queries = coalesce(a.total_queries, 0) + 1,
                    a.success_count = coalesce(a.success_count, 0) + CASE WHEN $success THEN 1 ELSE 0 END,
                    a.avg_confidence = (coalesce(a.avg_confidence, 0) * coalesce(a.total_queries, 0) + $confidence) / (coalesce(a.total_queries, 0) + 1),
                    a.avg_rating = CASE
                        WHEN $user_rating IS NOT NULL
                        THEN (coalesce(a.avg_rating, 0) * coalesce(a.rating_count, 0) + $user_rating) / (coalesce(a.rating_count, 0) + 1)
                        ELSE a.avg_rating
                    END,
                    a.rating_count = CASE WHEN $user_rating IS NOT NULL THEN coalesce(a.rating_count, 0) + 1 ELSE coalesce(a.rating_count, 0) END,
                    a.last_used = datetime()
            """, agent_id=agent_id, success=success, confidence=confidence, user_rating=user_rating)
```

```yaml
Task 1.3: Implement Neo4jClient
  - Core client with connection pooling
  - Agent node CRUD operations
  - Relationship management (RELATES_TO, CO_OCCURS_WITH, COMPLEMENTS)
  - Graph traversal search algorithm
  - Performance tracking
  Owner: Senior Engineer 1
  Estimate: 16 hours
  Files:
    - src/services/neo4j_client.py (new)
    - src/core/config.py (add Neo4j config)
```

**Day 6-8: Data Migration**
```python
# File: scripts/migrate_agents_to_neo4j.py

import asyncio
from services.supabase_client import SupabaseClient
from services.neo4j_client import Neo4jClient

async def migrate_agents():
    """Migrate agent data from PostgreSQL to Neo4j."""

    supabase = SupabaseClient()
    neo4j = Neo4jClient(uri, user, password)

    # 1. Fetch all agents from PostgreSQL
    agents = await supabase.client.table("agents").select("*").execute()

    # 2. Create agent nodes in Neo4j
    for agent in agents.data:
        await neo4j.create_agent_node(
            agent_id=agent["id"],
            name=agent["name"],
            capabilities=agent["capabilities"],
            domains=agent["domain_expertise"],
            tenant_id=agent["tenant_id"]
        )

    # 3. Migrate relationships
    collaborations = await supabase.client.table("agent_collaborations").select("*").execute()

    for collab in collaborations.data:
        await neo4j.create_relationship(
            from_agent_id=collab["agent_id_1"],
            to_agent_id=collab["agent_id_2"],
            relationship_type="CO_OCCURS_WITH",
            weight=collab["co_occurrence_score"]
        )

    # 4. Create capability-based relationships
    # Agents with overlapping capabilities complement each other
    for agent1 in agents.data:
        for agent2 in agents.data:
            if agent1["id"] != agent2["id"]:
                overlap = set(agent1["capabilities"]) & set(agent2["capabilities"])
                if overlap and len(overlap) > 2:
                    await neo4j.create_relationship(
                        from_agent_id=agent1["id"],
                        to_agent_id=agent2["id"],
                        relationship_type="COMPLEMENTS",
                        weight=len(overlap) / max(len(agent1["capabilities"]), len(agent2["capabilities"]))
                    )

    await neo4j.close()
```

```yaml
Task 1.4: Data Migration Script
  - Migrate 136+ agents to Neo4j
  - Create relationships (collaborations, escalations, complements)
  - Validate data integrity
  - Rollback plan
  Owner: Senior Engineer 1
  Estimate: 8 hours
  Files: scripts/migrate_agents_to_neo4j.py (new)
```

**Day 9-10: Fix GraphRAG Weights**
```python
# File: services/ai-engine/src/services/graphrag_selector.py (new)

from typing import List, Dict, Optional
import asyncio
import time
from services.supabase_client import SupabaseClient
from services.neo4j_client import Neo4jClient
from services.embedding_service import EmbeddingService
import structlog

logger = structlog.get_logger()

class GraphRAGSelector:
    """
    GraphRAG hybrid agent selection with 3-method fusion.

    Weights (ARD v2.0 specification):
    - PostgreSQL full-text: 30%
    - Pinecone vector: 50%
    - Neo4j graph: 20%

    Performance targets:
    - P95 latency: <450ms
    - Accuracy: 92-95%
    """

    WEIGHTS = {
        "postgres_fulltext": 0.30,
        "pinecone_vector": 0.50,
        "neo4j_graph": 0.20
    }

    def __init__(
        self,
        supabase: SupabaseClient,
        neo4j: Neo4jClient,
        embedding_service: EmbeddingService
    ):
        self.supabase = supabase
        self.neo4j = neo4j
        self.embedding_service = embedding_service

    async def select_agents(
        self,
        query: str,
        tenant_id: str,
        mode: str,
        max_agents: int = 3
    ) -> List[Dict]:
        """
        Hybrid agent selection using 3 methods with weighted fusion.

        Returns:
            List of selected agents with confidence scores
        """
        start_time = time.time()

        # Generate query embedding
        query_embedding = await self.embedding_service.embed_query(query)

        # Parallel execution of all 3 methods
        results = await asyncio.gather(
            self._postgres_fulltext_search(query, tenant_id),
            self._pinecone_vector_search(query_embedding, tenant_id),
            self._neo4j_graph_search(query_embedding, tenant_id),
            return_exceptions=True
        )

        postgres_results, pinecone_results, neo4j_results = results

        # Handle failures gracefully
        if isinstance(postgres_results, Exception):
            logger.error("PostgreSQL search failed", error=str(postgres_results))
            postgres_results = []
        if isinstance(pinecone_results, Exception):
            logger.error("Pinecone search failed", error=str(pinecone_results))
            pinecone_results = []
        if isinstance(neo4j_results, Exception):
            logger.error("Neo4j search failed", error=str(neo4j_results))
            neo4j_results = []

        # Weighted score fusion
        fused = self._fuse_scores(
            postgres=postgres_results,
            pinecone=pinecone_results,
            neo4j=neo4j_results
        )

        # Re-rank and select top-k
        selected = fused[:max_agents]

        # Calculate confidence metrics
        selected = self._calculate_confidence(selected, query)

        latency_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "GraphRAG agent selection completed",
            latency_ms=latency_ms,
            agents_found=len(selected),
            postgres_count=len(postgres_results),
            pinecone_count=len(pinecone_results),
            neo4j_count=len(neo4j_results)
        )

        # Alert if latency exceeds P95 target
        if latency_ms > 450:
            logger.warning("GraphRAG latency exceeded P95 target", latency_ms=latency_ms, target=450)

        return selected

    async def _postgres_fulltext_search(
        self,
        query: str,
        tenant_id: str
    ) -> List[Dict]:
        """PostgreSQL full-text search (30% weight)."""

        result = await self.supabase.client.rpc(
            "search_agents_fulltext",
            {
                "search_query": query,
                "tenant_filter": tenant_id,
                "result_limit": 20
            }
        ).execute()

        return [
            {
                "agent_id": r["id"],
                "agent_name": r["name"],
                "postgres_score": r["text_rank"],
                "source": "postgres"
            }
            for r in result.data
        ]

    async def _pinecone_vector_search(
        self,
        query_embedding: List[float],
        tenant_id: str
    ) -> List[Dict]:
        """Pinecone vector search (50% weight)."""

        # Use Pinecone for agent embeddings (not just documents)
        from pinecone import Pinecone

        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index("vital-agents")  # New index for agent embeddings

        results = index.query(
            vector=query_embedding,
            top_k=20,
            namespace=f"tenant-{tenant_id}",
            include_metadata=True,
            filter={"is_active": True}
        )

        return [
            {
                "agent_id": match.id,
                "agent_name": match.metadata.get("name"),
                "pinecone_score": match.score,
                "source": "pinecone"
            }
            for match in results.matches
        ]

    async def _neo4j_graph_search(
        self,
        query_embedding: List[float],
        tenant_id: str
    ) -> List[Dict]:
        """Neo4j graph traversal search (20% weight)."""

        results = await self.neo4j.graph_traversal_search(
            query_embedding=query_embedding,
            tenant_id=tenant_id,
            max_depth=3,
            limit=20
        )

        return [
            {
                "agent_id": r["agent_id"],
                "agent_name": r["name"],
                "neo4j_score": r["graph_score"],
                "source": "neo4j"
            }
            for r in results
        ]

    def _fuse_scores(
        self,
        postgres: List[Dict],
        pinecone: List[Dict],
        neo4j: List[Dict]
    ) -> List[Dict]:
        """
        Fuse scores from 3 methods using weighted reciprocal rank fusion.

        Formula:
        fused_score = sum(weight_i * (1 / (rank_i + k)))
        where k = 60 (standard RRF constant)
        """
        k = 60  # RRF constant
        agent_scores = {}

        # Process PostgreSQL results
        for rank, result in enumerate(postgres):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + k)
            agent_scores[agent_id]["scores"]["postgres"] = rrf_score
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["postgres_fulltext"] * rrf_score

        # Process Pinecone results
        for rank, result in enumerate(pinecone):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + k)
            agent_scores[agent_id]["scores"]["pinecone"] = rrf_score
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["pinecone_vector"] * rrf_score

        # Process Neo4j results
        for rank, result in enumerate(neo4j):
            agent_id = result["agent_id"]
            if agent_id not in agent_scores:
                agent_scores[agent_id] = {
                    "agent_id": agent_id,
                    "agent_name": result["agent_name"],
                    "scores": {},
                    "fused_score": 0.0
                }

            rrf_score = 1.0 / (rank + k)
            agent_scores[agent_id]["scores"]["neo4j"] = rrf_score
            agent_scores[agent_id]["fused_score"] += self.WEIGHTS["neo4j_graph"] * rrf_score

        # Sort by fused score
        sorted_agents = sorted(
            agent_scores.values(),
            key=lambda x: x["fused_score"],
            reverse=True
        )

        return sorted_agents

    def _calculate_confidence(
        self,
        selected_agents: List[Dict],
        query: str
    ) -> List[Dict]:
        """Calculate confidence metrics for selected agents."""

        for agent in selected_agents:
            # Multi-factor confidence
            confidence = {
                "overall": min(agent["fused_score"] * 100, 95),  # Cap at 95%
                "search_quality": self._assess_search_quality(agent["scores"]),
                "consensus": len([s for s in agent["scores"].values() if s > 0.5]) / 3.0
            }

            agent["confidence"] = confidence

        return selected_agents

    def _assess_search_quality(self, scores: Dict) -> float:
        """Assess quality based on method agreement."""
        if len(scores) >= 2:
            # High quality if multiple methods agree
            return sum(scores.values()) / len(scores)
        else:
            # Lower quality if only one method found the agent
            return 0.6
```

```yaml
Task 1.5: Implement GraphRAGSelector
  - 3-method hybrid search with correct weights (30/50/20)
  - Reciprocal rank fusion algorithm
  - Confidence calculation
  - Performance monitoring
  Owner: Senior Engineer 2
  Estimate: 16 hours
  Files:
    - src/services/graphrag_selector.py (new)
    - src/services/hybrid_agent_search.py (deprecate)
```

**Day 11-14: Integration & Testing**
```yaml
Task 1.6: Update Mode 2 & 4 Workflows
  - Replace hybrid_agent_search with graphrag_selector
  - Update state schemas
  - Add latency monitoring
  Owner: Senior Engineer 2
  Estimate: 8 hours
  Files:
    - src/langgraph_workflows/mode2_interactive_manual_workflow.py
    - src/langgraph_workflows/mode4_autonomous_manual_workflow.py

Task 1.7: PostgreSQL Full-Text Setup
  - Add pg_trgm extension
  - Create text search indexes
  - Implement RPC function search_agents_fulltext
  Owner: Senior Engineer 1
  Estimate: 4 hours
  Files:
    - supabase/migrations/add_fulltext_search.sql (new)

Task 1.8: Pinecone Agent Index
  - Create new Pinecone index "vital-agents"
  - Migrate agent embeddings from PostgreSQL
  - Setup namespace isolation per tenant
  Owner: DevOps
  Estimate: 4 hours

Task 1.9: Integration Tests
  - Test all 3 search methods individually
  - Test weighted fusion algorithm
  - Benchmark P95 latency (<450ms target)
  - Accuracy testing with known queries
  Owner: Both Engineers
  Estimate: 12 hours
  Files: tests/test_graphrag_selector.py (new)
```

#### Success Criteria Week 1-2
- ✅ Neo4j database deployed and accessible
- ✅ Neo4jClient service implemented and tested
- ✅ All 136+ agents migrated to Neo4j
- ✅ GraphRAGSelector using correct weights (30/50/20)
- ✅ P95 latency <450ms achieved
- ✅ Integration tests passing

#### Deliverables
1. Neo4j AuraDB production database
2. `neo4j_client.py` service (400+ lines)
3. `graphrag_selector.py` service (500+ lines)
4. Migration script
5. PostgreSQL fulltext search functions
6. Pinecone agent embeddings index
7. Integration tests
8. Performance benchmarks

---

### Week 3-4: Sub-Agent Spawning & Deep Architecture

#### Objectives
- ✅ Implement 5-level deep agent hierarchy
- ✅ Sub-agent spawning capability
- ✅ Planning tools integration
- ✅ Level 3-5 agent classes

#### Detailed Tasks

**Day 15-17: SubAgentSpawner Service**
```python
# File: services/ai-engine/src/services/sub_agent_spawner.py

from typing import List, Dict, Optional
from pydantic import BaseModel
import structlog

logger = structlog.get_logger()

class SubAgentConfig(BaseModel):
    """Configuration for spawned sub-agent."""
    agent_type: str  # "specialist", "worker", "tool"
    specialty: str
    parent_agent_id: str
    task: str
    context: Dict
    tools: List[str] = []
    model: str = "gpt-4"
    temperature: float = 0.7

class SubAgentResult(BaseModel):
    """Result from sub-agent execution."""
    sub_agent_id: str
    task: str
    result: Dict
    confidence: float
    execution_time_ms: int
    cost: float

class SubAgentSpawner:
    """
    Service for spawning and managing sub-agents (Levels 3-5).

    Level 3: Specialists - Domain-specific sub-experts
    Level 4: Workers - Parallel task executors
    Level 5: Tools - Specialized tool agents
    """

    def __init__(self):
        self.active_sub_agents: Dict[str, SubAgentConfig] = {}

    async def spawn_specialist(
        self,
        parent_agent_id: str,
        task: str,
        specialty: str,
        context: Dict
    ) -> str:
        """
        Spawn a Level 3 specialist sub-agent.

        Example specialties:
        - "FDA 510(k) Predicate Search"
        - "Clinical Endpoint Selection"
        - "Reimbursement Code Mapping"
        """
        sub_agent_id = f"specialist_{specialty}_{uuid.uuid4().hex[:8]}"

        config = SubAgentConfig(
            agent_type="specialist",
            specialty=specialty,
            parent_agent_id=parent_agent_id,
            task=task,
            context=context
        )

        self.active_sub_agents[sub_agent_id] = config

        logger.info(
            "Spawned specialist sub-agent",
            sub_agent_id=sub_agent_id,
            specialty=specialty,
            parent=parent_agent_id
        )

        return sub_agent_id

    async def spawn_workers(
        self,
        parent_agent_id: str,
        tasks: List[str],
        context: Dict
    ) -> List[str]:
        """
        Spawn multiple Level 4 worker agents for parallel execution.

        Example tasks:
        - Literature search
        - Data analysis
        - Document generation
        """
        worker_ids = []

        for task in tasks:
            worker_id = f"worker_{uuid.uuid4().hex[:8]}"

            config = SubAgentConfig(
                agent_type="worker",
                specialty="parallel_execution",
                parent_agent_id=parent_agent_id,
                task=task,
                context=context
            )

            self.active_sub_agents[worker_id] = config
            worker_ids.append(worker_id)

        logger.info(
            "Spawned worker sub-agents",
            count=len(worker_ids),
            parent=parent_agent_id
        )

        return worker_ids

    async def execute_sub_agent(
        self,
        sub_agent_id: str
    ) -> SubAgentResult:
        """Execute spawned sub-agent and return result."""

        if sub_agent_id not in self.active_sub_agents:
            raise ValueError(f"Sub-agent {sub_agent_id} not found")

        config = self.active_sub_agents[sub_agent_id]
        start_time = time.time()

        # Build sub-agent prompt
        system_prompt = self._build_sub_agent_prompt(config)

        # Execute using LLM
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(
            model=config.model,
            temperature=config.temperature
        )

        response = await llm.ainvoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": config.task}
        ])

        execution_time = int((time.time() - start_time) * 1000)

        result = SubAgentResult(
            sub_agent_id=sub_agent_id,
            task=config.task,
            result={"response": response.content},
            confidence=0.85,  # Calculate based on response quality
            execution_time_ms=execution_time,
            cost=self._calculate_cost(response)
        )

        logger.info(
            "Sub-agent executed",
            sub_agent_id=sub_agent_id,
            execution_time_ms=execution_time
        )

        return result

    async def execute_parallel(
        self,
        sub_agent_ids: List[str]
    ) -> List[SubAgentResult]:
        """Execute multiple sub-agents in parallel."""

        tasks = [self.execute_sub_agent(sid) for sid in sub_agent_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out failures
        successful = [r for r in results if isinstance(r, SubAgentResult)]

        logger.info(
            "Parallel sub-agent execution completed",
            total=len(sub_agent_ids),
            successful=len(successful)
        )

        return successful

    def _build_sub_agent_prompt(self, config: SubAgentConfig) -> str:
        """Build specialized system prompt for sub-agent."""

        if config.agent_type == "specialist":
            return f"""You are a specialized sub-agent with expertise in: {config.specialty}

Your parent agent has delegated a specific task to you. Focus ONLY on this task and provide a detailed, expert-level response.

Context from parent agent:
{json.dumps(config.context, indent=2)}

Provide your specialized analysis and recommendations."""

        elif config.agent_type == "worker":
            return f"""You are a worker sub-agent responsible for executing a specific task in parallel with other workers.

Task: {config.task}

Context:
{json.dumps(config.context, indent=2)}

Complete this task efficiently and return structured results."""

        else:  # tool agent
            return f"""You are a tool agent specialized in using specific tools to accomplish tasks.

Available tools: {', '.join(config.tools)}

Context:
{json.dumps(config.context, indent=2)}

Use the appropriate tools to complete the task."""

    async def terminate_sub_agent(self, sub_agent_id: str):
        """Terminate and cleanup sub-agent."""
        if sub_agent_id in self.active_sub_agents:
            del self.active_sub_agents[sub_agent_id]
            logger.info("Sub-agent terminated", sub_agent_id=sub_agent_id)
```

```yaml
Task 3.1: Implement SubAgentSpawner
  - Spawn specialist, worker, and tool agents
  - Parallel execution capability
  - Result aggregation
  - Lifecycle management
  Owner: Senior Engineer 1
  Estimate: 20 hours
  Files: src/services/sub_agent_spawner.py (new, 600+ lines)
```

**Day 18-20: Planning Tools Integration**
```python
# File: services/ai-engine/src/tools/planning_tools.py

from langchain.tools import BaseTool
from typing import List, Dict
import structlog

logger = structlog.get_logger()

class WriteToDosTool(BaseTool):
    """
    Planning tool for breaking down complex tasks into sub-tasks.

    Enables deep agents to decompose work and spawn sub-agents.
    """

    name = "write_todos"
    description = """Break down a complex task into actionable sub-tasks.

    Use this when you encounter a multi-step problem that requires:
    - Multiple specialist sub-agents
    - Parallel execution of different tasks
    - Sequential dependencies between tasks

    Returns a structured task breakdown with dependencies."""

    def _run(self, task: str, context: Dict = None) -> Dict:
        """Synchronous execution (not used in async workflows)."""
        raise NotImplementedError("Use async version")

    async def _arun(
        self,
        task: str,
        context: Dict = None
    ) -> Dict[str, List[Dict]]:
        """
        Break down task using LLM to generate structured sub-tasks.

        Returns:
            {
                "sub_tasks": [
                    {
                        "id": "task_1",
                        "description": "...",
                        "type": "specialist|worker|tool",
                        "specialty": "...",
                        "dependencies": [],
                        "estimated_time": "...",
                        "priority": "high|medium|low"
                    },
                    ...
                ],
                "execution_plan": "sequential|parallel|hybrid"
            }
        """
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(model="gpt-4", temperature=0.3)

        prompt = f"""Analyze this complex task and break it down into structured sub-tasks:

Task: {task}

Context: {json.dumps(context or {}, indent=2)}

Generate a JSON response with:
1. List of sub-tasks with types (specialist/worker/tool)
2. Dependencies between tasks
3. Recommended execution plan (sequential/parallel/hybrid)
4. For each sub-task, specify:
   - Clear description
   - Required specialty (for specialist agents)
   - Dependencies on other tasks
   - Estimated completion time
   - Priority level

Return ONLY valid JSON matching this structure:
{{
  "sub_tasks": [...],
  "execution_plan": "...",
  "estimated_total_time": "...",
  "complexity_score": 0-10
}}"""

        response = await llm.ainvoke([{"role": "user", "content": prompt}])

        try:
            task_breakdown = json.loads(response.content)
            logger.info("Task breakdown completed", subtask_count=len(task_breakdown["sub_tasks"]))
            return task_breakdown
        except json.JSONDecodeError:
            logger.error("Failed to parse task breakdown", response=response.content)
            return {"sub_tasks": [], "execution_plan": "sequential"}

class DelegateTaskTool(BaseTool):
    """
    Tool for delegating tasks to sub-agents.

    Works in conjunction with write_todos to spawn appropriate sub-agents.
    """

    name = "delegate_task"
    description = """Delegate a sub-task to a specialist sub-agent.

    Use this after breaking down a complex task with write_todos.
    Spawns the appropriate sub-agent type and executes the delegated task."""

    def __init__(self, sub_agent_spawner):
        super().__init__()
        self.spawner = sub_agent_spawner

    async def _arun(
        self,
        sub_task: Dict,
        parent_agent_id: str,
        context: Dict
    ) -> Dict:
        """
        Delegate task to spawned sub-agent.

        Args:
            sub_task: Task definition from write_todos
            parent_agent_id: ID of delegating agent
            context: Execution context

        Returns:
            Sub-agent execution result
        """
        if sub_task["type"] == "specialist":
            sub_agent_id = await self.spawner.spawn_specialist(
                parent_agent_id=parent_agent_id,
                task=sub_task["description"],
                specialty=sub_task["specialty"],
                context=context
            )
        elif sub_task["type"] == "worker":
            [sub_agent_id] = await self.spawner.spawn_workers(
                parent_agent_id=parent_agent_id,
                tasks=[sub_task["description"]],
                context=context
            )
        else:  # tool agent
            sub_agent_id = await self.spawner.spawn_tool_agent(
                parent_agent_id=parent_agent_id,
                task=sub_task["description"],
                tools=sub_task.get("tools", []),
                context=context
            )

        # Execute sub-agent
        result = await self.spawner.execute_sub_agent(sub_agent_id)

        # Cleanup
        await self.spawner.terminate_sub_agent(sub_agent_id)

        return {
            "sub_task_id": sub_task["id"],
            "result": result.result,
            "confidence": result.confidence,
            "execution_time_ms": result.execution_time_ms
        }
```

```yaml
Task 3.2: Implement Planning Tools
  - write_todos tool for task decomposition
  - delegate_task tool for sub-agent spawning
  - Integration with SubAgentSpawner
  Owner: Senior Engineer 2
  Estimate: 12 hours
  Files: src/tools/planning_tools.py (new, 300+ lines)
```

**Day 21-24: LangGraph Integration**
```python
# File: src/langgraph_workflows/deep_agent_nodes.py

from typing import TypedDict, List, Annotated
import operator
from services.sub_agent_spawner import SubAgentSpawner
from tools.planning_tools import WriteToDosTool, DelegateTaskTool

class DeepAgentState(TypedDict):
    """State for deep agent workflow with sub-agent spawning."""
    query: str
    primary_agent_id: str
    task_breakdown: Dict
    spawned_sub_agents: Annotated[List[str], operator.add]
    sub_agent_results: Annotated[List[Dict], operator.add]
    final_response: str
    confidence: float

async def analyze_task_complexity(state: DeepAgentState) -> DeepAgentState:
    """Determine if task requires sub-agent spawning."""

    # Simple heuristic: complex tasks have multiple steps or domains
    query_lower = state["query"].lower()

    complexity_indicators = [
        "and also",
        "in addition",
        "multiple",
        "comprehensive",
        "across",
        "both",
        "compare",
        "analyze",
        "develop",
        "create"
    ]

    complexity_score = sum(1 for indicator in complexity_indicators if indicator in query_lower)

    state["complexity_score"] = complexity_score
    state["requires_sub_agents"] = complexity_score >= 2

    return state

async def decompose_task(state: DeepAgentState) -> DeepAgentState:
    """Break down complex task using write_todos tool."""

    write_todos = WriteToDosTool()

    task_breakdown = await write_todos._arun(
        task=state["query"],
        context={"agent_id": state["primary_agent_id"]}
    )

    state["task_breakdown"] = task_breakdown

    return state

async def spawn_sub_agents(state: DeepAgentState) -> DeepAgentState:
    """Spawn sub-agents based on task breakdown."""

    spawner = SubAgentSpawner()
    delegate = DelegateTaskTool(spawner)

    spawned = []

    for sub_task in state["task_breakdown"]["sub_tasks"]:
        result = await delegate._arun(
            sub_task=sub_task,
            parent_agent_id=state["primary_agent_id"],
            context=state.get("context", {})
        )

        state["sub_agent_results"].append(result)
        spawned.append(sub_task["id"])

    state["spawned_sub_agents"] = spawned

    return state

async def synthesize_sub_agent_results(state: DeepAgentState) -> DeepAgentState:
    """Combine results from all sub-agents into final response."""

    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(model="gpt-4")

    synthesis_prompt = f"""Synthesize these sub-agent results into a comprehensive response:

Original Query: {state["query"]}

Sub-Agent Results:
{json.dumps(state["sub_agent_results"], indent=2)}

Provide a coherent, comprehensive response that integrates all sub-agent insights."""

    response = await llm.ainvoke([{"role": "user", "content": synthesis_prompt}])

    state["final_response"] = response.content
    state["confidence"] = min(
        sum(r["confidence"] for r in state["sub_agent_results"]) / len(state["sub_agent_results"]),
        0.95
    )

    return state

# Update Mode 4 workflow to use deep agents
def create_mode4_deep_agent_workflow():
    """Mode 4 with deep agent sub-spawning capability."""

    from langgraph.graph import StateGraph, END

    graph = StateGraph(DeepAgentState)

    graph.add_node("graphrag_selection", select_primary_agent)
    graph.add_node("analyze_complexity", analyze_task_complexity)
    graph.add_node("decompose_task", decompose_task)
    graph.add_node("spawn_sub_agents", spawn_sub_agents)
    graph.add_node("execute_direct", execute_primary_agent_direct)
    graph.add_node("synthesize_results", synthesize_sub_agent_results)

    graph.add_edge("graphrag_selection", "analyze_complexity")
    graph.add_conditional_edges(
        "analyze_complexity",
        lambda s: "decompose" if s["requires_sub_agents"] else "direct",
        {
            "decompose": "decompose_task",
            "direct": "execute_direct"
        }
    )
    graph.add_edge("decompose_task", "spawn_sub_agents")
    graph.add_edge("spawn_sub_agents", "synthesize_results")
    graph.add_edge("execute_direct", END)
    graph.add_edge("synthesize_results", END)

    graph.set_entry_point("graphrag_selection")

    return graph.compile()
```

```yaml
Task 3.3: Integrate Deep Agents into Mode 4
  - Add complexity analysis node
  - Task decomposition with write_todos
  - Sub-agent spawning and execution
  - Result synthesis
  Owner: Both Engineers
  Estimate: 16 hours
  Files:
    - src/langgraph_workflows/deep_agent_nodes.py (new)
    - src/langgraph_workflows/mode4_autonomous_manual_workflow.py (update)
```

#### Success Criteria Week 3-4
- ✅ SubAgentSpawner service implemented
- ✅ Planning tools (write_todos, delegate_task) working
- ✅ Mode 4 workflow spawns sub-agents for complex queries
- ✅ 5-level hierarchy functional (Master → Expert → Specialist → Worker → Tool)
- ✅ Parallel sub-agent execution working

#### Deliverables
1. `sub_agent_spawner.py` service (600+ lines)
2. `planning_tools.py` (300+ lines)
3. `deep_agent_nodes.py` LangGraph integration (400+ lines)
4. Updated Mode 4 workflow with sub-agent spawning
5. Unit tests for all components
6. Integration tests for deep agent workflows

---

### Week 5-6: Workflow Boundary Detection

#### Objectives
- ✅ Detect when task exceeds Ask Expert scope
- ✅ Automatic handoff to Workflow Services
- ✅ User notification system
- ✅ Workflow complexity analyzer

[Continue with detailed implementation for Weeks 5-8...]

---

## Phase 2: Major Features (Weeks 9-24)

[Detailed implementation plans for Artifacts, Collaboration, Multimodal, Code Execution...]

---

## Phase 3: Production Polish (Weeks 25-30)

[Detailed implementation plans for Integration Hub, Performance, Documentation...]

---

## Team Structure & Resource Allocation

### Core Team

**Senior Backend Engineer 1** (Full-time, 30 weeks)
- Primary: Neo4j, GraphRAG, database integrations
- Secondary: Deep agents, LangGraph workflows
- Skills: Python, databases, distributed systems
- Estimated: $45k

**Senior Backend Engineer 2** (Full-time, 30 weeks)
- Primary: Sub-agent spawning, planning tools
- Secondary: Artifacts, multimodal
- Skills: Python, AI/ML, LangChain
- Estimated: $45k

**Senior Full-Stack Engineer** (Full-time, weeks 9-24)
- Primary: Artifacts UI, team collaboration
- Secondary: Template system, exports
- Skills: Next.js, React, Python
- Estimated: $24k (16 weeks)

**DevOps Engineer** (Part-time, 30 weeks)
- Primary: Infrastructure, deployments
- Secondary: Neo4j, Pinecone, monitoring
- Skills: Docker, Railway, databases
- Estimated: $28k

**QA Engineer** (Part-time, weeks 15-30)
- Primary: Testing, validation
- Secondary: Performance benchmarking
- Skills: pytest, load testing
- Estimated: $20k (16 weeks part-time)

**Total Team Cost:** $162k

---

## Technical Specifications

### Neo4j Database Schema

```cypher
// Agent nodes
CREATE (a:Agent {
  id: UUID,
  name: STRING,
  capabilities: LIST<STRING>,
  domains: LIST<STRING>,
  tier: INT,  // 1-5
  tenant_id: UUID,
  embedding: LIST<FLOAT>,  // 1536 dimensions
  total_queries: INT,
  success_count: INT,
  avg_confidence: FLOAT,
  avg_rating: FLOAT,
  is_active: BOOLEAN,
  created_at: DATETIME,
  last_used: DATETIME
})

// Relationships
(:Agent)-[:RELATES_TO {weight: FLOAT, created_at: DATETIME}]->(:Agent)
(:Agent)-[:CO_OCCURS_WITH {weight: FLOAT, co_occurrence_count: INT}]->(:Agent)
(:Agent)-[:COMPLEMENTS {weight: FLOAT, capability_overlap: LIST<STRING>}]->(:Agent)
(:Agent)-[:ESCALATES_TO {confidence_threshold: FLOAT}]->(:Agent)
(:Agent)-[:SPAWNS {sub_agent_type: STRING}]->(:Agent)

// Indexes
CREATE INDEX agent_id_index FOR (a:Agent) ON (a.id)
CREATE INDEX agent_tenant_index FOR (a:Agent) ON (a.tenant_id)
CREATE INDEX agent_capabilities_index FOR (a:Agent) ON (a.capabilities)
CREATE VECTOR INDEX agent_embedding_index FOR (a:Agent) ON (a.embedding) OPTIONS {dimension: 1536, similarity: 'cosine'}
```

### GraphRAG Performance Targets

```yaml
Latency Targets:
  P50: <200ms
  P95: <450ms
  P99: <800ms

Accuracy Targets:
  Top-1 accuracy: >85%
  Top-3 accuracy: >92%
  Top-5 accuracy: >95%

Throughput Targets:
  Requests per second: >100
  Concurrent queries: >500

Cache Hit Rates:
  L1 (Redis): >60%
  L2 (PostgreSQL): >30%
  Overall: >85%
```

### Sub-Agent Architecture

```yaml
Level 1 - Master Agents (5 orchestrators):
  - Regulatory Master
  - Clinical Master
  - Market Access Master
  - Technical Master
  - Strategic Master

Level 2 - Expert Agents (136+):
  - Stored in PostgreSQL agents table
  - Selected via GraphRAG
  - Examples: Global Regulatory Expert, Clinical Trial Design Expert

Level 3 - Specialist Sub-Agents (dynamic):
  - Spawned on-demand by Level 2
  - Specialty: FDA 510(k), EMA MDR, PMDA, etc.
  - Lifecycle: spawn → execute → terminate
  - Max concurrent: 10 per Level 2 agent

Level 4 - Worker Agents (parallel):
  - Task executors spawned for parallel work
  - Examples: Literature Search, Data Analysis, Document Gen
  - Max concurrent: 20 per query
  - Execution: asyncio.gather()

Level 5 - Tool Agents (100+):
  - Specialized tool wrappers
  - Examples: PubMed Search, Statistical Calculator
  - Implemented as LangChain tools
```

---

## Dependencies & Integration Points

### External Services

**Neo4j AuraDB**
- Dependency: GraphRAG agent selection
- Required by: Week 1
- Cost: $500/month
- Setup time: 4 hours

**Pinecone Serverless**
- Dependency: Vector search
- Current: Document search
- New: Agent embeddings index
- Additional cost: $300/month

**E2B.dev Code Execution** (Phase 2)
- Dependency: R, Python, SAS execution
- Required by: Week 17
- Cost: $300/month

**Supabase Storage** (Phase 2)
- Dependency: Artifacts, multimodal files
- Required by: Week 9
- Additional storage: $200/month

### Internal Integration Points

**Frontend (Next.js)**
- API contracts for new endpoints
- WebSocket integration for streaming
- Artifacts UI components
- Team collaboration UI

**API Gateway**
- Route new endpoints
- Add GraphRAG metrics
- WebSocket proxy

**Database Migrations**
- PostgreSQL schema updates
- RLS policy additions
- New tables for artifacts, workspaces

---

## Testing & Validation Strategy

### Phase 1 Testing (Weeks 1-8)

**Unit Tests**
```python
# Test coverage targets
Neo4jClient: >90%
GraphRAGSelector: >85%
SubAgentSpawner: >85%
Planning Tools: >80%

# Key test scenarios
- Neo4j connection pooling
- Graph traversal edge cases
- Score fusion algorithm accuracy
- Sub-agent lifecycle management
- Parallel execution error handling
```

**Integration Tests**
```python
# Test Mode 2 & 4 with GraphRAG
test_mode2_graphrag_selection()
test_mode4_deep_agent_spawning()
test_hybrid_search_3_methods()
test_sub_agent_parallel_execution()
```

**Performance Tests**
```bash
# Benchmarking
pytest tests/performance/test_graphrag_latency.py
  - Target: P95 <450ms
  - Load: 100 concurrent requests
  - Duration: 5 minutes

pytest tests/performance/test_sub_agent_scaling.py
  - Target: 20 parallel sub-agents
  - Memory limit: <2GB per agent
  - Execution time: <30s total
```

### Phase 2 Testing (Weeks 9-24)

**Artifacts Tests**
- Template rendering accuracy
- PDF export fidelity
- Version control merging
- Real-time collaboration (OT algorithm)

**Multimodal Tests**
- Image processing (medical scans)
- Video transcription accuracy
- Audio quality after processing
- OCR accuracy for documents

**Code Execution Tests**
- R script sandboxing
- Python execution security
- SAS code compatibility
- Resource limit enforcement

### Phase 3 Testing (Weeks 25-30)

**Load Testing**
```bash
# Production readiness
k6 run load_tests/ask_expert_load.js
  - 10,000 concurrent users
  - 95% success rate target
  - P95 latency <2s

# Stress testing
k6 run stress_tests/graphrag_stress.js
  - 500 req/s sustained
  - Neo4j connection pool saturation
  - Redis cache eviction behavior
```

**Security Testing**
- Penetration testing (OWASP Top 10)
- SQL injection attempts
- Sandbox escape attempts
- RLS policy validation

---

## Risk Management

### Critical Risks

**Risk 1: Neo4j Learning Curve**
- **Probability:** High (70%)
- **Impact:** 2-week delay
- **Mitigation:**
  - Hire Neo4j consultant (week 1)
  - Team training (2-day workshop)
  - Pair programming with consultant
  - Fallback: Use PostgreSQL graph queries (slower)

**Risk 2: Sub-Agent Complexity**
- **Probability:** Medium (40%)
- **Impact:** 3-week delay
- **Mitigation:**
  - Start simple (1 level of spawning)
  - Incremental complexity addition
  - Comprehensive integration tests
  - Performance monitoring from day 1

**Risk 3: GraphRAG Performance**
- **Probability:** Medium (50%)
- **Impact:** Miss P95 <450ms target
- **Mitigation:**
  - Early performance benchmarking (week 2)
  - Optimize slowest method first
  - Implement aggressive caching
  - Parallel query execution

### Medium Risks

**Risk 4: Artifacts Real-Time Collaboration**
- **Probability:** Medium (40%)
- **Impact:** Reduced functionality
- **Mitigation:**
  - Use proven OT library (ShareDB or Yjs)
  - Start with simple merge resolution
  - Progressive enhancement approach

**Risk 5: Code Execution Security**
- **Probability:** Low (20%)
- **Impact:** Security vulnerability
- **Mitigation:**
  - Use E2B.dev (proven sandboxing)
  - Strict resource limits
  - Security audit before launch
  - Bug bounty program

**Risk 6: Team Velocity**
- **Probability:** Medium (50%)
- **Impact:** Timeline slip 2-4 weeks
- **Mitigation:**
  - Weekly sprints with clear deliverables
  - Daily standups
  - Remove blockers immediately
  - Buffer time in schedule (built-in)

---

## Success Metrics & KPIs

### Phase 1 KPIs (Weeks 1-8)

**Technical Metrics**
```yaml
GraphRAG Performance:
  - P95 latency: <450ms ✅
  - Top-3 accuracy: >92% ✅
  - Cache hit rate: >85% ✅

Neo4j Integration:
  - All 136+ agents migrated ✅
  - Graph queries <100ms P95 ✅
  - Connection pool stable (no leaks) ✅

Sub-Agent Spawning:
  - Spawning latency: <500ms ✅
  - Parallel execution: 20 concurrent ✅
  - Resource cleanup: 100% ✅
```

**Business Metrics**
```yaml
Development Velocity:
  - Story points completed: >80% planned ✅
  - Critical bugs: <5 ✅
  - Code coverage: >85% ✅
```

### Phase 2 KPIs (Weeks 9-24)

**Feature Completeness**
```yaml
Artifacts System:
  - 50+ templates available ✅
  - PDF export working ✅
  - Version control functional ✅

Team Collaboration:
  - Workspaces created ✅
  - RBAC enforced ✅
  - Real-time collab working ✅

Multimodal:
  - Image processing <5s ✅
  - Video transcription accurate >95% ✅
  - Audio quality >90% ✅

Code Execution:
  - R, Python, SAS working ✅
  - Sandbox secure (pen test passed) ✅
  - Results visualized ✅
```

### Phase 3 KPIs (Weeks 25-30)

**Production Readiness**
```yaml
Performance:
  - 10,000 concurrent users supported ✅
  - 95% uptime SLA ✅
  - P95 response time <2s ✅

Quality:
  - 0 critical bugs ✅
  - 100% test coverage critical paths ✅
  - Security audit passed ✅

Documentation:
  - API docs complete ✅
  - Developer guides published ✅
  - User training materials ready ✅
```

---

## Implementation Checklist

### Pre-Implementation (Week 0)

- [ ] Secure $169k budget approval
- [ ] Hire 3 engineers (2 backend, 1 full-stack)
- [ ] Provision Neo4j AuraDB account
- [ ] Setup project management (Linear/Jira)
- [ ] Create GitHub milestones
- [ ] Schedule kickoff meeting

### Phase 1 Checklist (Weeks 1-8)

**Week 1-2: Neo4j & GraphRAG**
- [ ] Neo4j database deployed
- [ ] `neo4j_client.py` implemented
- [ ] Agent data migrated to Neo4j
- [ ] `graphrag_selector.py` with 30/50/20 weights
- [ ] PostgreSQL fulltext search added
- [ ] Pinecone agent embeddings index created
- [ ] P95 latency <450ms achieved
- [ ] Integration tests passing

**Week 3-4: Sub-Agents**
- [ ] `sub_agent_spawner.py` implemented
- [ ] Planning tools (write_todos, delegate_task)
- [ ] Mode 4 workflow updated for deep agents
- [ ] Parallel sub-agent execution working
- [ ] Unit tests >85% coverage
- [ ] Performance tests passing

**Week 5-6: Workflow Boundaries**
- [ ] Complexity analyzer implemented
- [ ] Boundary detection logic added
- [ ] WorkflowHandoffService created
- [ ] User notification system
- [ ] Integration with Workflow Services API
- [ ] E2E tests for handoff scenarios

**Week 7-8: Testing & Validation**
- [ ] All P0 features integration tested
- [ ] Performance benchmarks documented
- [ ] Bug fixes completed
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Phase 1 demo prepared

### Phase 2 Checklist (Weeks 9-24)

**Week 9-12: Artifacts System**
- [ ] `artifact_service.py` implemented
- [ ] 50+ regulatory templates added
- [ ] PDF/Word export working
- [ ] Version control system functional
- [ ] Artifacts UI components
- [ ] E2E tests for artifact workflows

**Week 13-16: Team Collaboration**
- [ ] `workspace_service.py` implemented
- [ ] `project_service.py` implemented
- [ ] RBAC middleware added
- [ ] Real-time collaboration (WebSockets)
- [ ] Sharing & permissions
- [ ] Collaboration UI

**Week 17-20: Multimodal & Code Execution**
- [ ] `multimodal_service.py` implemented
- [ ] Image processing (X-ray, CT, MRI)
- [ ] Video transcription
- [ ] Audio processing
- [ ] `code_execution_service.py` implemented
- [ ] E2B.dev integration
- [ ] R, Python, SAS support
- [ ] Security sandboxing validated

**Week 21-24: Context & Streaming**
- [ ] `context_service.py` for 1M+ tokens
- [ ] Document chunking strategies
- [ ] Streaming integration in workflows
- [ ] Multi-agent panel execution
- [ ] Checkpoint resumption working
- [ ] Performance optimization

### Phase 3 Checklist (Weeks 25-30)

**Week 25-26: Integration Hub**
- [ ] `integration_hub_service.py`
- [ ] Third-party API connectors
- [ ] OAuth integration
- [ ] Webhook support

**Week 27-28: Performance & Monitoring**
- [ ] Database migration system (Alembic)
- [ ] APM integration (Datadog/New Relic)
- [ ] Load testing (10k users)
- [ ] Performance optimization
- [ ] Monitoring dashboards

**Week 29-30: Documentation & Launch**
- [ ] API documentation (OpenAPI)
- [ ] Developer guides
- [ ] User training materials
- [ ] Production deployment
- [ ] Launch checklist completed
- [ ] Post-launch monitoring

---

## Appendices

### A. Database Migration Scripts

See: `/scripts/migrations/`
- `001_add_neo4j_indexes.sql`
- `002_create_artifacts_tables.sql`
- `003_create_workspace_tables.sql`

### B. API Contract Specifications

See: `/docs/api/`
- `graphrag_api_spec.yaml`
- `artifacts_api_spec.yaml`
- `collaboration_api_spec.yaml`

### C. Performance Benchmarking Tools

See: `/tests/performance/`
- `benchmark_graphrag.py`
- `benchmark_sub_agents.py`
- `load_test_k6.js`

### D. Cost Analysis Breakdown

```yaml
Development (30 weeks):
  Senior Backend Engineer 1: $45,000
  Senior Backend Engineer 2: $45,000
  Senior Full-Stack Engineer: $24,000 (16 weeks)
  DevOps Engineer (PT): $28,000
  QA Engineer (PT): $20,000
  Total Development: $162,000

Infrastructure (Year 1):
  Neo4j AuraDB: $6,000 ($500/mo)
  Pinecone Additional: $3,600 ($300/mo)
  E2B.dev Code Execution: $3,600 ($300/mo)
  Supabase Storage: $2,400 ($200/mo)
  Monitoring (Datadog): $1,800 ($150/mo)
  Total Infrastructure: $17,400

Contingency (10%): $17,940

Grand Total: $197,340
(Original estimate: $169k, adjusted for contingency)
```

---

**Plan Status:** Ready for Execution
**Next Step:** Secure budget approval and begin Week 1
**Plan Owner:** VITAL Product & Engineering Leadership
**Last Updated:** November 17, 2025
**Review Cadence:** Weekly during execution
