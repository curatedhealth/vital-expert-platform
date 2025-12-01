# AgentOS 3.0: From Schema to Execution Platform
## Complete Implementation Roadmap

**Version**: 1.0.0  
**Date**: November 21, 2025  
**Status**: Implementation Ready  
**Prerequisites**: AgentOS 2.0 schema complete (34 tables, 6 views)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [GraphRAG Service Implementation](#2-graphrag-service-implementation)
3. [Advanced Agents & Deep Architecture](#3-advanced-agents--deep-architecture)
4. [Evidence-Based Selection & Tiering](#4-evidence-based-selection--tiering)
5. [Safety Gates & Clinical Monitoring](#5-safety-gates--clinical-monitoring)
6. [Service Integration & API Layer](#6-service-integration--api-layer)
7. [Implementation Phases](#7-implementation-phases)
8. [Testing & Validation](#8-testing--validation)

---

## 1. Architecture Overview

### 1.1 Three-Plane Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTION PLANE                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │ AI Engine   │  │ Orchestration│  │  LangGraph  │       │
│  │  Services   │  │   Service    │  │   Runtime   │       │
│  └─────────────┘  └──────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE PLANE                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │  Graph DB   │  │   Vector DB  │  │  Elastic    │       │
│  │  (Neo4j)    │  │  (pgvector)  │  │  (BM25)     │       │
│  └─────────────┘  └──────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    CONTROL PLANE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (AgentOS 2.0)               │   │
│  │  • 34 Tables (agents, graphs, RAG, routing, etc.)  │   │
│  │  • 6 Views (complete, marketplace, topology, etc.) │   │
│  │  • 101 Indexes for performance                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
User Query
    ↓
API Gateway → Auth & Rate Limiting
    ↓
AI Engine Service → Agent Selection (Evidence-Based)
    ↓
    ├──→ Query RAG Profile (Postgres: rag_profiles, agent_rag_policies)
    ├──→ Query Agent KG View (Postgres: agent_kg_views)
    ├──→ Load Agent Graph (Postgres: agent_graphs, nodes, edges)
    ↓
GraphRAG Service → Hybrid Search
    ├──→ Vector Search (pgvector)
    ├──→ Keyword Search (Elastic/BM25)
    ├──→ Graph Traversal (Neo4j)
    ├──→ Fusion & Rerank
    ↓
LangGraph Runtime → Execute Agent Graph
    ├──→ Instantiate nodes (agents, skills, panels)
    ├──→ Execute with RAG context
    ├──→ Apply safety gates
    ├──→ Checkpoint state (Postgres)
    ↓
Response Builder → Format & Cite
    ↓
Monitoring → Log metrics (Langfuse, Prometheus)
    ↓
Return to User
```

---

## 2. GraphRAG Service Implementation

### 2.1 Core Service Architecture

**File**: `backend/services/ai_engine/rag/graphrag_service.py`

```python
class GraphRAGService:
    """
    Unified GraphRAG service that orchestrates:
    - Vector search (pgvector)
    - Keyword search (Elastic/BM25)
    - Graph traversal (Neo4j)
    - Hybrid fusion & reranking
    """
    
    def __init__(
        self,
        postgres_client: PostgresClient,
        vector_db: VectorDBClient,
        graph_db: GraphDBClient,
        keyword_search: KeywordSearchClient,
        reranker: RerankerClient
    ):
        self.pg = postgres_client
        self.vector_db = vector_db
        self.graph_db = graph_db
        self.keyword_search = keyword_search
        self.reranker = reranker
    
    async def query(
        self,
        query: str,
        agent_id: UUID,
        session_id: UUID,
        rag_profile_id: Optional[UUID] = None
    ) -> GraphRAGResponse:
        """
        Execute hybrid GraphRAG query with agent-specific config.
        """
        # 1. Load RAG profile and agent overrides
        profile = await self._load_rag_profile(agent_id, rag_profile_id)
        kg_view = await self._load_kg_view(agent_id)
        
        # 2. Execute parallel searches
        vector_results, keyword_results, graph_results = await asyncio.gather(
            self._vector_search(query, profile),
            self._keyword_search(query, profile),
            self._graph_search(query, kg_view, profile)
        )
        
        # 3. Hybrid fusion
        fused_results = self._fuse_results(
            vector_results, 
            keyword_results, 
            graph_results,
            weights=profile.fusion_weights
        )
        
        # 4. Rerank
        reranked = await self.reranker.rerank(
            query=query,
            documents=fused_results,
            model=profile.rerank_model
        )
        
        # 5. Build context with evidence chains
        context = self._build_context_with_evidence(
            reranked,
            graph_paths=graph_results.paths,
            max_tokens=profile.max_context_tokens
        )
        
        return GraphRAGResponse(
            context_chunks=context.chunks,
            graph_paths=graph_results.paths,
            evidence_chain=context.evidence_chain,
            metadata=GraphRAGMetadata(
                profile=profile.slug,
                vector_score=vector_results.avg_score,
                keyword_score=keyword_results.avg_score,
                graph_score=graph_results.avg_score,
                fusion_weights=profile.fusion_weights,
                latency_ms=...,
                total_hops=graph_results.max_hops_used
            )
        )
```

### 2.2 RAG Profile Resolution

**File**: `backend/services/ai_engine/rag/profile_resolver.py`

```python
async def _load_rag_profile(
    self, 
    agent_id: UUID, 
    profile_id: Optional[UUID]
) -> RAGProfile:
    """
    Load RAG profile with agent-specific overrides.
    Priority: explicit profile_id > agent policy > agent default > system default
    """
    # Query Postgres for profile + overrides
    query = """
        SELECT 
            rp.*,
            arp.agent_specific_top_k,
            arp.agent_specific_threshold,
            arp.restrict_to_domains,
            arp.restrict_to_sources
        FROM rag_profiles rp
        LEFT JOIN agent_rag_policies arp ON rp.id = arp.rag_profile_id
            AND arp.agent_id = $1
            AND arp.is_active = true
        WHERE rp.id = COALESCE($2, arp.rag_profile_id, 
                               (SELECT id FROM rag_profiles 
                                WHERE slug = 'semantic_standard' LIMIT 1))
        LIMIT 1
    """
    
    row = await self.pg.fetchrow(query, agent_id, profile_id)
    
    # Build profile with overrides
    return RAGProfile(
        id=row['id'],
        slug=row['slug'],
        strategy_type=row['strategy_type'],
        top_k=row['agent_specific_top_k'] or row['top_k'],
        similarity_threshold=row['agent_specific_threshold'] or row['similarity_threshold'],
        # ... map all fields with override logic
        fusion_weights=self._get_fusion_weights(row['strategy_type']),
        domain_filters=row['restrict_to_domains'],
        source_filters=row['restrict_to_sources']
    )

def _get_fusion_weights(self, strategy_type: str) -> FusionWeights:
    """Map RAG strategy to fusion weights."""
    return {
        'semantic_standard': FusionWeights(vector=1.0, keyword=0.0, graph=0.0),
        'hybrid_enhanced': FusionWeights(vector=0.6, keyword=0.4, graph=0.0),
        'graphrag_entity': FusionWeights(vector=0.4, keyword=0.2, graph=0.4),
        'agent_optimized': self._dynamic_weights()  # ML-based tuning
    }[strategy_type]
```

### 2.3 Agent KG View & Graph Traversal

**File**: `backend/services/ai_engine/rag/kg_view_resolver.py`

```python
async def _load_kg_view(self, agent_id: UUID) -> AgentKGView:
    """Load agent's allowed knowledge graph nodes/edges."""
    query = """
        SELECT 
            include_nodes,
            include_edges,
            max_hops,
            graph_limit
        FROM agent_kg_views
        WHERE agent_id = $1 AND is_active = true
        LIMIT 1
    """
    
    row = await self.pg.fetchrow(query, agent_id)
    
    if not row:
        # Return default safe view
        return AgentKGView(
            include_nodes=['Drug', 'Disease', 'Guideline'],
            include_edges=['TREATS', 'INDICATED_FOR'],
            max_hops=2,
            graph_limit=50
        )
    
    return AgentKGView(**row)
```

**File**: `backend/services/ai_engine/rag/graph_search.py`

```python
async def _graph_search(
    self,
    query: str,
    kg_view: AgentKGView,
    profile: RAGProfile
) -> GraphSearchResults:
    """
    Execute knowledge graph traversal with agent-specific view.
    """
    # 1. Extract entities from query (NER)
    entities = await self._extract_entities(query)
    
    # 2. Find matching nodes in graph
    seed_nodes = await self.graph_db.find_nodes(
        entity_names=entities,
        node_types=kg_view.include_nodes
    )
    
    # 3. Traverse graph with constraints
    cypher = """
        MATCH (seed)
        WHERE id(seed) IN $seed_ids
        
        CALL apoc.path.expandConfig(seed, {
            relationshipFilter: $allowed_edges,
            labelFilter: $allowed_nodes,
            minLevel: 1,
            maxLevel: $max_hops,
            limit: $limit
        })
        YIELD path
        
        RETURN path,
               [node IN nodes(path) | {
                   id: id(node),
                   labels: labels(node),
                   properties: properties(node)
               }] as nodes,
               [rel IN relationships(path) | {
                   type: type(rel),
                   properties: properties(rel)
               }] as edges
        ORDER BY length(path) ASC
        LIMIT $limit
    """
    
    results = await self.graph_db.execute(
        cypher,
        seed_ids=[n.id for n in seed_nodes],
        allowed_edges='|'.join(kg_view.include_edges),
        allowed_nodes=':' + '|'.join(kg_view.include_nodes),
        max_hops=kg_view.max_hops,
        limit=kg_view.graph_limit
    )
    
    # 4. Convert paths to evidence chains
    evidence_chains = self._build_evidence_chains(results)
    
    # 5. Score paths by relevance
    scored_paths = self._score_graph_paths(
        paths=results,
        query=query,
        evidence_chains=evidence_chains
    )
    
    return GraphSearchResults(
        paths=scored_paths,
        evidence_chains=evidence_chains,
        avg_score=np.mean([p.score for p in scored_paths]),
        max_hops_used=max([len(p.nodes) for p in scored_paths])
    )
```

### 2.4 Hybrid Fusion Algorithm

**File**: `backend/services/ai_engine/rag/fusion.py`

```python
def _fuse_results(
    self,
    vector_results: List[VectorResult],
    keyword_results: List[KeywordResult],
    graph_results: List[GraphResult],
    weights: FusionWeights
) -> List[FusedResult]:
    """
    Reciprocal Rank Fusion (RRF) with weighted sources.
    Based on: https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
    """
    k = 60  # RRF constant
    
    # Build unified doc registry
    doc_registry = {}
    
    # Add vector results
    for rank, result in enumerate(vector_results, 1):
        doc_id = result.chunk_id
        if doc_id not in doc_registry:
            doc_registry[doc_id] = FusedResult(
                chunk_id=doc_id,
                content=result.content,
                metadata=result.metadata,
                sources={}
            )
        doc_registry[doc_id].sources['vector'] = {
            'rank': rank,
            'score': result.score,
            'rrf_score': weights.vector / (k + rank)
        }
    
    # Add keyword results
    for rank, result in enumerate(keyword_results, 1):
        doc_id = result.chunk_id
        if doc_id not in doc_registry:
            doc_registry[doc_id] = FusedResult(
                chunk_id=doc_id,
                content=result.content,
                metadata=result.metadata,
                sources={}
            )
        doc_registry[doc_id].sources['keyword'] = {
            'rank': rank,
            'score': result.score,
            'rrf_score': weights.keyword / (k + rank)
        }
    
    # Add graph results (path-based)
    for rank, result in enumerate(graph_results, 1):
        doc_id = result.chunk_id
        if doc_id not in doc_registry:
            doc_registry[doc_id] = FusedResult(
                chunk_id=doc_id,
                content=result.content,
                metadata=result.metadata,
                sources={}
            )
        doc_registry[doc_id].sources['graph'] = {
            'rank': rank,
            'score': result.score,
            'rrf_score': weights.graph / (k + rank),
            'path_id': result.path_id,
            'hops': result.hops
        }
    
    # Calculate final RRF scores
    for doc in doc_registry.values():
        doc.final_score = sum(
            source['rrf_score'] 
            for source in doc.sources.values()
        )
    
    # Sort by final score
    return sorted(
        doc_registry.values(),
        key=lambda x: x.final_score,
        reverse=True
    )
```

### 2.5 Evidence Chain Builder

**File**: `backend/services/ai_engine/rag/evidence_builder.py`

```python
def _build_context_with_evidence(
    self,
    ranked_docs: List[FusedResult],
    graph_paths: List[GraphPath],
    max_tokens: int = 4000
) -> ContextWithEvidence:
    """
    Build LLM context with explicit evidence chains and citations.
    """
    context_chunks = []
    evidence_chain = []
    current_tokens = 0
    
    for rank, doc in enumerate(ranked_docs, 1):
        # Estimate tokens (rough: 4 chars = 1 token)
        doc_tokens = len(doc.content) // 4
        
        if current_tokens + doc_tokens > max_tokens:
            break
        
        # Add chunk with citation
        chunk = ContextChunk(
            content=doc.content,
            citation_id=f"[{rank}]",
            sources=doc.sources,
            metadata=doc.metadata
        )
        context_chunks.append(chunk)
        current_tokens += doc_tokens
        
        # Build evidence trail
        if 'graph' in doc.sources:
            path = next(
                (p for p in graph_paths if p.id == doc.sources['graph']['path_id']),
                None
            )
            if path:
                evidence_chain.append(EvidenceNode(
                    citation_id=f"[{rank}]",
                    type='graph_path',
                    content=doc.content,
                    graph_path=path,
                    confidence=doc.final_score
                ))
        else:
            evidence_chain.append(EvidenceNode(
                citation_id=f"[{rank}]",
                type='retrieved_chunk',
                content=doc.content,
                sources=list(doc.sources.keys()),
                confidence=doc.final_score
            ))
    
    return ContextWithEvidence(
        chunks=context_chunks,
        evidence_chain=evidence_chain,
        total_tokens=current_tokens
    )
```

---

## 3. Advanced Agents & Deep Architecture

### 3.1 LangGraph Compiler (Postgres → Executable)

**File**: `backend/services/ai_engine/orchestration/graph_compiler.py`

```python
class AgentGraphCompiler:
    """
    Compiles Postgres agent_graphs into executable LangGraph instances.
    """
    
    async def compile_graph(self, graph_id: UUID) -> CompiledGraph:
        """Load graph from Postgres and compile to LangGraph."""
        # 1. Load graph definition
        graph_def = await self._load_graph_definition(graph_id)
        nodes = await self._load_graph_nodes(graph_id)
        edges = await self._load_graph_edges(graph_id)
        
        # 2. Build LangGraph StateGraph
        from langgraph.graph import StateGraph
        
        workflow = StateGraph(AgentState)
        
        # 3. Add nodes based on type
        for node in nodes:
            node_impl = await self._compile_node(node)
            workflow.add_node(node.node_name, node_impl)
        
        # 4. Add edges
        for edge in edges:
            if edge.condition_expression:
                # Conditional edge
                workflow.add_conditional_edges(
                    edge.source_node_name,
                    self._compile_condition(edge.condition_expression),
                    {
                        edge.edge_label: edge.target_node_name
                    }
                )
            else:
                # Direct edge
                workflow.add_edge(
                    edge.source_node_name,
                    edge.target_node_name
                )
        
        # 5. Set entry point
        if graph_def.entry_node_name:
            workflow.set_entry_point(graph_def.entry_node_name)
        
        # 6. Compile
        compiled = workflow.compile(
            checkpointer=self.postgres_checkpointer
        )
        
        return CompiledGraph(
            graph_id=graph_id,
            langgraph=compiled,
            metadata=graph_def
        )
    
    async def _compile_node(self, node: AgentGraphNode) -> Callable:
        """Compile individual node based on type and role."""
        if node.node_type == 'agent':
            return await self._compile_agent_node(node)
        elif node.node_type == 'skill':
            return await self._compile_skill_node(node)
        elif node.node_type == 'panel':
            return await self._compile_panel_node(node)
        elif node.node_type == 'router':
            return await self._compile_router_node(node)
        elif node.node_type == 'tool':
            return await self._compile_tool_node(node)
        elif node.node_type == 'human':
            return self._compile_human_node(node)
        else:
            raise ValueError(f"Unknown node type: {node.node_type}")
```

### 3.2 Deep Agent Node Implementation

**File**: `backend/services/ai_engine/agents/deep_agent_nodes.py`

```python
async def _compile_agent_node(self, node: AgentGraphNode) -> Callable:
    """
    Compile agent node with role-specific behavior.
    Roles: planner, executor, critic, synthesizer
    """
    # Load agent details
    agent = await self.pg.fetchrow(
        "SELECT * FROM v_agent_complete WHERE id = $1",
        node.agent_id
    )
    
    # Determine agent level based on role
    if node.role == 'planner':
        return self._create_planner_node(agent, node)
    elif node.role == 'executor':
        return self._create_executor_node(agent, node)
    elif node.role == 'critic':
        return self._create_critic_node(agent, node)
    elif node.role == 'synthesizer':
        return self._create_synthesizer_node(agent, node)
    else:
        return self._create_standard_agent_node(agent, node)

def _create_planner_node(
    self, 
    agent: AgentRecord, 
    node: AgentGraphNode
) -> Callable:
    """
    Planner uses Tree-of-Thoughts for strategic planning.
    """
    async def planner_node(state: AgentState) -> AgentState:
        # Initialize Tree-of-Thoughts planner
        tot_planner = TreeOfThoughtsAgent(
            agent_id=agent['id'],
            model=agent['base_model'],
            system_prompt=agent['system_prompt'],
            max_depth=node.config.get('max_depth', 3),
            branching_factor=node.config.get('branching_factor', 3)
        )
        
        # Generate plan with multiple thought branches
        plan = await tot_planner.plan(
            query=state['query'],
            context=state['context'],
            constraints=state.get('constraints', [])
        )
        
        # Update state
        state['plan'] = plan
        state['thought_tree'] = tot_planner.get_tree()
        state['next_step'] = 'execute'
        
        return state
    
    return planner_node

def _create_critic_node(
    self,
    agent: AgentRecord,
    node: AgentGraphNode
) -> Callable:
    """
    Critic uses Constitutional AI for self-critique.
    """
    async def critic_node(state: AgentState) -> AgentState:
        # Initialize Constitutional AI critic
        constitutional_agent = ConstitutionalAgent(
            agent_id=agent['id'],
            model=agent['base_model'],
            constitution=await self._load_constitution(node),
            critique_mode='iterative'
        )
        
        # Critique previous output
        critique_result = await constitutional_agent.critique(
            output=state['draft_response'],
            context=state['context'],
            criteria=state.get('quality_criteria', [])
        )
        
        # Update state
        state['critique'] = critique_result.critique
        state['passes_constitution'] = critique_result.passes
        state['revised_response'] = critique_result.revised_output
        
        if critique_result.passes:
            state['next_step'] = 'finalize'
        else:
            state['next_step'] = 'revise'
        
        return state
    
    return critic_node
```

### 3.3 Panel Node Implementation

**File**: `backend/services/ai_engine/agents/panel_nodes.py`

```python
async def _compile_panel_node(self, node: AgentGraphNode) -> Callable:
    """
    Panel node orchestrates multi-agent discussions.
    """
    async def panel_node(state: AgentState) -> AgentState:
        # Load panel configuration
        panel_config = await self._load_panel_config(node)
        
        # Initialize Ask Panel service
        panel_service = AskPanelService(
            graphrag=self.graphrag_service,
            agent_registry=self.agent_registry
        )
        
        # Execute panel discussion
        panel_result = await panel_service.execute_panel_discussion(
            query=state['query'],
            panel_type=panel_config.panel_type,  # parallel, consensus, debate, etc.
            agent_ids=panel_config.agent_ids,
            context=state['context'],
            session_id=state['session_id']
        )
        
        # Update state with panel outputs
        state['panel_responses'] = panel_result.responses
        state['panel_consensus'] = panel_result.consensus
        state['panel_confidence'] = panel_result.confidence_score
        state['dissenting_views'] = panel_result.dissenting_views
        
        # Determine next step based on consensus
        if panel_result.consensus_reached:
            state['next_step'] = 'finalize'
        else:
            state['next_step'] = 'escalate'
        
        return state
    
    return panel_node
```

---

## 4. Evidence-Based Selection & Tiering

### 4.1 Evidence-Based Agent Selector

**File**: `backend/services/ai_engine/agents/evidence_selector.py`

```python
class EvidenceBasedAgentSelector:
    """
    Implements gold-standard agent selection with evidence-based tiering.
    """
    
    async def select_agents(
        self,
        query: str,
        context: SelectionContext
    ) -> SelectionResult:
        """
        Multi-stage selection with complexity assessment and tier assignment.
        """
        # Stage 1: Assess query complexity and risk
        assessment = await self._assess_query(query, context)
        
        # Stage 2: Determine required tier
        tier = self._determine_tier(assessment)
        
        # Stage 3: Multi-modal agent search
        candidates = await self._search_candidates(query, tier, context)
        
        # Stage 4: Score and rank
        scored = await self._score_agents(candidates, query, assessment, tier)
        
        # Stage 5: Apply diversity and coverage
        final_selection = self._apply_diversity_coverage(scored, tier)
        
        # Stage 6: Safety gates
        gated_selection = await self._apply_safety_gates(
            final_selection,
            assessment
        )
        
        return SelectionResult(
            agents=gated_selection,
            tier=tier,
            assessment=assessment,
            requires_human_oversight=tier.requires_human_oversight,
            escalation_path=tier.escalation_path if not gated_selection else None
        )
    
    async def _assess_query(
        self,
        query: str,
        context: SelectionContext
    ) -> QueryAssessment:
        """
        Assess query complexity, risk, and required accuracy.
        """
        # Use LLM to classify query
        classifier_prompt = f"""
        Analyze this medical/pharma query and assess:
        1. Complexity level (low, medium, high)
        2. Risk level (low, moderate, high, critical)
        3. Required accuracy (standard, high, very_high)
        4. Domain (regulatory, clinical, commercial, medical_info, etc.)
        5. Data classification (public, internal, confidential, restricted)
        
        Query: {query}
        Context: {context}
        
        Respond in JSON format.
        """
        
        assessment_result = await self.llm.generate(
            prompt=classifier_prompt,
            model='gpt-4',
            response_format='json'
        )
        
        return QueryAssessment(**assessment_result)
    
    def _determine_tier(self, assessment: QueryAssessment) -> AgentTier:
        """
        Map assessment to agent tier with performance expectations.
        """
        # Tier 1: Simple, low-risk, standard accuracy
        if (assessment.complexity == 'low' and 
            assessment.risk in ['low', 'moderate'] and
            assessment.required_accuracy == 'standard'):
            return AgentTier(
                level=1,
                name='Tier 1: Rapid Response',
                accuracy_range=(0.85, 0.92),
                response_time_target='< 5s',
                cost_per_query=0.10,
                escalation_rate=0.08,
                requires_human_oversight=False,
                allowed_rag_profiles=['semantic_standard', 'hybrid_enhanced']
            )
        
        # Tier 2: Moderate complexity, higher accuracy
        elif (assessment.complexity in ['medium', 'high'] and
              assessment.risk in ['moderate', 'high'] and
              assessment.required_accuracy in ['standard', 'high']):
            return AgentTier(
                level=2,
                name='Tier 2: Expert Analysis',
                accuracy_range=(0.90, 0.96),
                response_time_target='< 30s',
                cost_per_query=0.50,
                escalation_rate=0.12,
                requires_human_oversight=False,
                allowed_rag_profiles=['hybrid_enhanced', 'graphrag_entity', 'agent_optimized'],
                panel_involvement='optional'
            )
        
        # Tier 3: High complexity, critical risk, very high accuracy
        else:
            return AgentTier(
                level=3,
                name='Tier 3: Deep Reasoning + Human Oversight',
                accuracy_range=(0.94, 0.98),
                response_time_target='< 120s',
                cost_per_query=2.00,
                escalation_rate=0.05,
                requires_human_oversight=True,
                allowed_rag_profiles=['graphrag_entity', 'agent_optimized'],
                panel_involvement='required',
                mandatory_critic=True,
                human_review_stage='post_generation'
            )
    
    async def _search_candidates(
        self,
        query: str,
        tier: AgentTier,
        context: SelectionContext
    ) -> List[AgentCandidate]:
        """
        Multi-modal search for candidate agents.
        Uses: semantic, keyword, domain filters, graph proximity, historical performance.
        """
        # Parallel search across modalities
        semantic_results, keyword_results, graph_results, historical_results = await asyncio.gather(
            self._semantic_search(query, tier),
            self._keyword_search(query, tier),
            self._graph_proximity_search(query, tier),
            self._historical_performance_search(query, tier)
        )
        
        # Merge candidates
        candidates = self._merge_candidate_lists([
            semantic_results,
            keyword_results,
            graph_results,
            historical_results
        ])
        
        return candidates
    
    async def _score_agents(
        self,
        candidates: List[AgentCandidate],
        query: str,
        assessment: QueryAssessment,
        tier: AgentTier
    ) -> List[ScoredAgent]:
        """
        Multi-factor scoring matrix from gold standard.
        """
        scored = []
        
        for candidate in candidates:
            # Load agent metadata
            agent = await self.pg.fetchrow(
                "SELECT * FROM v_agent_complete WHERE id = $1",
                candidate.agent_id
            )
            
            # Calculate scores
            scores = {
                'semantic_similarity': candidate.semantic_score,
                'domain_expertise': await self._domain_expertise_score(agent, assessment.domain),
                'keyword_relevance': candidate.keyword_score,
                'historical_performance': await self._historical_performance_score(agent, assessment),
                'graph_proximity': candidate.graph_score,
                'user_preference': await self._user_preference_score(agent, context.user_id),
                'availability': self._availability_score(agent),
                'tier_compatibility': self._tier_compatibility_score(agent, tier)
            }
            
            # Weighted final score (from gold standard weights)
            final_score = (
                0.30 * scores['semantic_similarity'] +
                0.25 * scores['domain_expertise'] +
                0.15 * scores['historical_performance'] +
                0.10 * scores['keyword_relevance'] +
                0.10 * scores['graph_proximity'] +
                0.05 * scores['user_preference'] +
                0.03 * scores['availability'] +
                0.02 * scores['tier_compatibility']
            )
            
            scored.append(ScoredAgent(
                agent=agent,
                final_score=final_score,
                component_scores=scores,
                tier=tier
            ))
        
        return sorted(scored, key=lambda x: x.final_score, reverse=True)
```

### 4.2 Safety Gates Implementation

**File**: `backend/services/ai_engine/safety/safety_gates.py`

```python
class SafetyGateSystem:
    """
    Implements mandatory escalation rules and safety checks.
    """
    
    MANDATORY_ESCALATION_TRIGGERS = [
        'diagnosis_change',
        'treatment_modification',
        'emergency_symptoms',
        'pediatric_case',
        'pregnancy_case',
        'psychiatric_crisis',
        'end_of_life_care',
        'low_confidence'
    ]
    
    async def _apply_safety_gates(
        self,
        selection: List[ScoredAgent],
        assessment: QueryAssessment
    ) -> List[ScoredAgent]:
        """
        Apply safety gates and escalation rules.
        """
        # Check for mandatory escalation triggers
        triggers = await self._check_escalation_triggers(assessment.query)
        
        if triggers:
            # Force escalation
            return await self._escalate_selection(
                selection,
                assessment,
                triggers
            )
        
        # Check confidence thresholds
        if selection[0].final_score < assessment.tier.min_confidence_threshold:
            return await self._escalate_selection(
                selection,
                assessment,
                ['low_confidence']
            )
        
        # Apply tier-specific gates
        if assessment.tier.level == 3:
            # Tier 3 requires critic + human review
            selection = await self._add_mandatory_critic(selection)
            selection = await self._add_human_review_node(selection)
        
        return selection
    
    async def _check_escalation_triggers(self, query: str) -> List[str]:
        """
        Detect mandatory escalation triggers using NLP + rules.
        """
        triggers = []
        
        # Use LLM to detect clinical trigger patterns
        prompt = f"""
        Analyze this query for mandatory escalation triggers:
        - Diagnosis changes
        - Treatment modifications
        - Emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.)
        - Pediatric cases
        - Pregnancy-related queries
        - Psychiatric crisis indicators
        - End-of-life care discussions
        - Low confidence in response
        
        Query: {query}
        
        Return list of detected triggers or empty list.
        """
        
        detected = await self.llm.generate(prompt, response_format='json')
        
        return [t for t in detected if t in self.MANDATORY_ESCALATION_TRIGGERS]
```

---

## 5. Safety Gates & Clinical Monitoring

### 5.1 Clinical AI Monitoring Structure

**File**: `backend/services/ai_engine/monitoring/clinical_monitor.py`

```python
class ClinicalAIMonitor:
    """
    Production-grade clinical AI monitoring with diagnostic metrics,
    drift detection, fairness, and outcome tracking.
    """
    
    def __init__(
        self,
        prometheus_client: PrometheusClient,
        langfuse_client: LangfuseClient,
        postgres_client: PostgresClient
    ):
        self.prometheus = prometheus_client
        self.langfuse = langfuse_client
        self.pg = postgres_client
    
    async def log_interaction(
        self,
        session_id: UUID,
        agent_id: UUID,
        query: str,
        response: str,
        assessment: QueryAssessment,
        tier: AgentTier,
        rag_metadata: GraphRAGMetadata,
        execution_metadata: ExecutionMetadata
    ):
        """
        Comprehensive logging of agent interaction for monitoring.
        """
        # 1. Log to Langfuse for tracing
        await self.langfuse.trace(
            session_id=str(session_id),
            name=f"agent_interaction_tier{tier.level}",
            metadata={
                'agent_id': str(agent_id),
                'tier': tier.level,
                'complexity': assessment.complexity,
                'risk': assessment.risk,
                'domain': assessment.domain
            },
            input=query,
            output=response,
            tags=[f"tier_{tier.level}", assessment.domain, assessment.risk]
        )
        
        # 2. Log to Prometheus for metrics
        self.prometheus.observe(
            'agent_response_time_seconds',
            execution_metadata.total_time_ms / 1000,
            labels={
                'tier': str(tier.level),
                'domain': assessment.domain,
                'agent_id': str(agent_id)
            }
        )
        
        self.prometheus.inc(
            'agent_queries_total',
            labels={
                'tier': str(tier.level),
                'risk': assessment.risk,
                'domain': assessment.domain
            }
        )
        
        # 3. Log to Postgres for analysis
        await self.pg.execute("""
            INSERT INTO agent_interaction_logs (
                session_id, agent_id, tier_level, complexity, risk_level,
                domain, query, response, rag_profile_used, graph_hops,
                response_time_ms, cost_usd, confidence_score, 
                escalated, human_review_required, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        """,
            session_id, agent_id, tier.level, assessment.complexity, assessment.risk,
            assessment.domain, query, response, rag_metadata.profile, rag_metadata.total_hops,
            execution_metadata.total_time_ms, execution_metadata.cost_usd, 
            execution_metadata.confidence_score, execution_metadata.escalated,
            tier.requires_human_oversight
        )
    
    async def calculate_diagnostic_metrics(
        self,
        agent_id: UUID,
        time_window_days: int = 30
    ) -> DiagnosticMetrics:
        """
        Calculate clinical diagnostic metrics (sensitivity, specificity, AUROC).
        Requires ground truth labels from human feedback or eval runs.
        """
        # Query eval results
        results = await self.pg.fetch("""
            SELECT 
                aec.passed as predicted_positive,
                ec.expected_answer as ground_truth
            FROM agent_eval_cases aec
            JOIN eval_cases ec ON aec.eval_case_id = ec.id
            JOIN agent_eval_runs aer ON aec.eval_run_id = aer.id
            WHERE aer.agent_id = $1
              AND aer.completed_at >= NOW() - INTERVAL '$2 days'
              AND aer.status = 'completed'
        """, agent_id, time_window_days)
        
        # Calculate confusion matrix
        tp = sum(1 for r in results if r['predicted_positive'] and self._is_positive(r['ground_truth']))
        tn = sum(1 for r in results if not r['predicted_positive'] and not self._is_positive(r['ground_truth']))
        fp = sum(1 for r in results if r['predicted_positive'] and not self._is_positive(r['ground_truth']))
        fn = sum(1 for r in results if not r['predicted_positive'] and self._is_positive(r['ground_truth']))
        
        # Calculate metrics
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        f1_score = 2 * (precision * sensitivity) / (precision + sensitivity) if (precision + sensitivity) > 0 else 0
        
        # Calculate AUROC (requires probability scores)
        # ... implement ROC curve calculation
        
        return DiagnosticMetrics(
            sensitivity=sensitivity,
            specificity=specificity,
            precision=precision,
            f1_score=f1_score,
            auroc=0.0,  # Placeholder
            total_evaluations=len(results),
            time_window_days=time_window_days
        )
    
    async def detect_drift(
        self,
        agent_id: UUID,
        metric: str = 'accuracy'
    ) -> DriftDetectionResult:
        """
        Detect statistical drift in agent performance using KS test.
        """
        # Get historical baseline
        baseline = await self._get_baseline_distribution(agent_id, metric, days=90)
        
        # Get recent window
        recent = await self._get_recent_distribution(agent_id, metric, days=7)
        
        # Kolmogorov-Smirnov test
        from scipy.stats import ks_2samp
        statistic, p_value = ks_2samp(baseline, recent)
        
        # Alert if drift detected (p < 0.05)
        drift_detected = p_value < 0.05
        
        if drift_detected:
            await self._send_drift_alert(agent_id, metric, statistic, p_value)
        
        return DriftDetectionResult(
            agent_id=agent_id,
            metric=metric,
            drift_detected=drift_detected,
            ks_statistic=statistic,
            p_value=p_value,
            baseline_mean=np.mean(baseline),
            recent_mean=np.mean(recent),
            baseline_std=np.std(baseline),
            recent_std=np.std(recent)
        )
```

### 5.2 Fairness & Bias Monitoring

**File**: `backend/services/ai_engine/monitoring/fairness_monitor.py`

```python
class FairnessMonitor:
    """
    Monitor for demographic fairness and bias in agent responses.
    """
    
    PROTECTED_ATTRIBUTES = [
        'age_group',
        'gender',
        'ethnicity',
        'geographic_region',
        'socioeconomic_status'
    ]
    
    async def calculate_fairness_metrics(
        self,
        agent_id: UUID,
        time_window_days: int = 30
    ) -> FairnessMetrics:
        """
        Calculate demographic parity and equalized odds.
        """
        # Query interactions with demographic data
        interactions = await self.pg.fetch("""
            SELECT 
                ail.*,
                u.age_group,
                u.gender,
                u.ethnicity,
                u.geographic_region
            FROM agent_interaction_logs ail
            JOIN users u ON ail.user_id = u.id
            WHERE ail.agent_id = $1
              AND ail.created_at >= NOW() - INTERVAL '$2 days'
        """, agent_id, time_window_days)
        
        metrics = {}
        
        for attr in self.PROTECTED_ATTRIBUTES:
            # Group by protected attribute
            groups = {}
            for interaction in interactions:
                group_value = interaction.get(attr)
                if group_value not in groups:
                    groups[group_value] = []
                groups[group_value].append(interaction)
            
            # Calculate metrics per group
            group_metrics = {}
            for group_value, group_interactions in groups.items():
                group_metrics[group_value] = {
                    'count': len(group_interactions),
                    'avg_confidence': np.mean([i['confidence_score'] for i in group_interactions]),
                    'escalation_rate': sum(1 for i in group_interactions if i['escalated']) / len(group_interactions),
                    'avg_response_time': np.mean([i['response_time_ms'] for i in group_interactions])
                }
            
            # Calculate demographic parity (difference in positive rate)
            positive_rates = [m['avg_confidence'] for m in group_metrics.values()]
            demographic_parity = max(positive_rates) - min(positive_rates)
            
            metrics[attr] = {
                'group_metrics': group_metrics,
                'demographic_parity': demographic_parity,
                'is_fair': demographic_parity < 0.1  # Threshold
            }
        
        return FairnessMetrics(
            agent_id=agent_id,
            time_window_days=time_window_days,
            attribute_metrics=metrics
        )
```

---

## 6. Service Integration & API Layer

### 6.1 Unified AI Engine API

**File**: `backend/services/ai_engine/api/routes.py`

```python
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/v1/ai", tags=["AI Engine"])

@router.post("/ask-expert")
async def ask_expert(
    request: AskExpertRequest,
    user: User = Depends(get_current_user),
    ai_engine: AIEngineService = Depends(get_ai_engine)
) -> AskExpertResponse:
    """
    Ask an expert agent with evidence-based selection and GraphRAG.
    """
    # 1. Evidence-based agent selection
    selection_result = await ai_engine.selector.select_agents(
        query=request.query,
        context=SelectionContext(
            user_id=user.id,
            tenant_id=user.tenant_id,
            domain=request.domain,
            session_id=request.session_id
        )
    )
    
    # 2. Load agent graph
    agent = selection_result.agents[0]
    compiled_graph = await ai_engine.compiler.compile_graph(
        agent.primary_graph_id
    )
    
    # 3. Execute GraphRAG
    rag_context = await ai_engine.graphrag.query(
        query=request.query,
        agent_id=agent.id,
        session_id=request.session_id,
        rag_profile_id=agent.primary_rag_profile_id
    )
    
    # 4. Execute agent graph with context
    result = await compiled_graph.invoke(
        input={
            'query': request.query,
            'context': rag_context.context_chunks,
            'evidence_chain': rag_context.evidence_chain,
            'user_id': user.id,
            'session_id': request.session_id
        },
        config={
            'configurable': {
                'thread_id': str(request.session_id)
            }
        }
    )
    
    # 5. Log for monitoring
    await ai_engine.monitor.log_interaction(
        session_id=request.session_id,
        agent_id=agent.id,
        query=request.query,
        response=result['response'],
        assessment=selection_result.assessment,
        tier=selection_result.tier,
        rag_metadata=rag_context.metadata,
        execution_metadata=result['metadata']
    )
    
    # 6. Return response
    return AskExpertResponse(
        agent=agent,
        response=result['response'],
        evidence_chain=rag_context.evidence_chain,
        confidence_score=result['confidence'],
        tier=selection_result.tier,
        requires_human_review=selection_result.requires_human_oversight,
        metadata={
            'rag_profile': rag_context.metadata.profile,
            'graph_hops': rag_context.metadata.total_hops,
            'execution_time_ms': result['metadata'].total_time_ms
        }
    )

@router.post("/ask-panel")
async def ask_panel(
    request: AskPanelRequest,
    user: User = Depends(get_current_user),
    ai_engine: AIEngineService = Depends(get_ai_engine)
) -> AskPanelResponse:
    """
    Ask a panel of experts with specified panel type.
    """
    # Similar flow to ask-expert but with panel orchestration
    ...

@router.post("/graphrag/query")
async def graphrag_query(
    request: GraphRAGRequest,
    user: User = Depends(get_current_user),
    graphrag: GraphRAGService = Depends(get_graphrag)
) -> GraphRAGResponse:
    """
    Direct GraphRAG query endpoint for testing/debugging.
    """
    return await graphrag.query(
        query=request.query,
        agent_id=request.agent_id,
        session_id=request.session_id,
        rag_profile_id=request.rag_profile_id
    )
```

---

## 7. Implementation Phases

### Phase 1: GraphRAG Foundation (Week 1-2)
- [ ] Implement GraphRAG service core
- [ ] Implement RAG profile resolution
- [ ] Implement agent KG view system
- [ ] Implement hybrid fusion algorithm
- [ ] Implement evidence chain builder
- [ ] Connect to vector DB (pgvector)
- [ ] Connect to graph DB (Neo4j)
- [ ] Connect to keyword search (Elastic)
- [ ] Add basic monitoring

**Deliverables**:
- Working `/v1/graphrag/query` endpoint
- 4 RAG profiles operational
- Evidence chains with citations

### Phase 2: Agent Graph Compilation (Week 3-4)
- [ ] Implement LangGraph compiler
- [ ] Implement agent node compilation
- [ ] Implement panel node compilation
- [ ] Implement skill node compilation
- [ ] Implement router/conditional nodes
- [ ] Connect Postgres checkpointer
- [ ] Test graph execution

**Deliverables**:
- Postgres → LangGraph compilation working
- At least 3 reference graphs compiled
- Checkpointing functional

### Phase 3: Evidence-Based Selection (Week 5-6)
- [ ] Implement query assessment
- [ ] Implement tier determination
- [ ] Implement multi-modal agent search
- [ ] Implement scoring matrix
- [ ] Implement diversity & coverage
- [ ] Implement safety gates
- [ ] Test with real queries

**Deliverables**:
- Working agent selection with tiers
- Safety gates operational
- Tier 1-3 performance validated

### Phase 4: Deep Agent Patterns (Week 7-8)
- [ ] Implement Tree-of-Thoughts planner
- [ ] Implement Constitutional AI critic
- [ ] Implement ReAct executor
- [ ] Implement panel orchestration
- [ ] Integrate with compiled graphs
- [ ] Test multi-step workflows

**Deliverables**:
- Deep agent patterns operational
- Panel discussions working
- Multi-step reasoning validated

### Phase 5: Monitoring & Safety (Week 9-10)
- [ ] Implement clinical AI monitoring
- [ ] Implement diagnostic metrics calculation
- [ ] Implement drift detection
- [ ] Implement fairness monitoring
- [ ] Connect Prometheus
- [ ] Connect Langfuse
- [ ] Create monitoring dashboards

**Deliverables**:
- Full monitoring operational
- Drift detection alerts
- Fairness dashboards
- Safety gate logs

### Phase 6: Integration & Testing (Week 11-12)
- [ ] Integrate all services
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Production deployment

**Deliverables**:
- `/v1/ai/ask-expert` fully operational
- `/v1/ai/ask-panel` fully operational
- Production-ready system
- Complete documentation

---

## 8. Testing & Validation

### 8.1 Unit Tests
- GraphRAG service components
- Agent graph compilation
- Selection algorithm
- Safety gates
- Monitoring calculations

### 8.2 Integration Tests
- End-to-end query flows
- Multi-agent panels
- Graph execution with checkpoints
- RAG profile switching
- Tier escalation

### 8.3 Performance Tests
- Response time targets by tier
- Concurrent request handling
- GraphRAG latency
- Database query performance

### 8.4 Safety Tests
- Mandatory escalation triggers
- Human oversight gates
- Confidence threshold enforcement
- Fairness metrics validation

### 8.5 Clinical Validation
- Diagnostic metrics baseline
- Tier performance validation
- Panel consensus accuracy
- Evidence quality assessment

---

## Success Criteria

### Technical Metrics
- ✅ GraphRAG response time < 2s for semantic, < 5s for graphrag
- ✅ Agent selection time < 500ms
- ✅ Graph compilation time < 100ms
- ✅ Tier 1 accuracy: 85-92%
- ✅ Tier 2 accuracy: 90-96%
- ✅ Tier 3 accuracy: 94-98%
- ✅ Escalation rate: < 12%
- ✅ 99.9% uptime

### Clinical Safety
- ✅ 100% escalation compliance for mandatory triggers
- ✅ Zero missed critical safety signals
- ✅ Demographic fairness: parity < 0.1
- ✅ Drift detection: alerts within 24h

### User Experience
- ✅ Tier 1: < 5s response time
- ✅ Tier 2: < 30s response time
- ✅ Tier 3: < 120s response time
- ✅ Evidence chains present in 100% of responses
- ✅ User satisfaction > 4.0/5.0

---

**This implementation guide provides the complete roadmap from your schema-complete AgentOS 2.0 to a fully operational Graph-RAG + Advanced Agents execution platform. All architectural patterns, algorithms, and safety requirements are included and ready for implementation.**

