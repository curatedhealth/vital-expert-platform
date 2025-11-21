# VITAL Ask Expert Services - Architecture Requirements Document (ARD)
**Version:** 1.0  
**Date:** November 17, 2025  
**Status:** Gold Standard  
**Architecture Pattern:** Event-Driven Microservices with AI Orchestration

---

## Executive Summary

The VITAL Ask Expert architecture implements a sophisticated multi-agent AI system using LangGraph for orchestration, supporting four distinct interaction modes through a scalable, multi-tenant platform. The architecture prioritizes real-time performance, healthcare compliance, and elastic scaling while maintaining complete data isolation between tenants.

Core architectural principles include event-driven communication, stateless services, comprehensive observability, and defense-in-depth security. The system handles 10,000+ concurrent conversations across 136+ specialized healthcare AI agents with sub-second response times.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VITAL ASK EXPERT ARCHITECTURE                   │
│                  Multi-Tenant AI Orchestration Platform             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Web App   │  │Mobile Apps │  │   API      │  │  SDK/CLI     │ │
│  │ (Next.js)  │  │(React Nat.)│  │  (REST)    │  │ (TypeScript) │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     API GATEWAY (Kong)        │
                    │  • Rate Limiting               │
                    │  • Authentication              │
                    │  • Tenant Routing              │
                    └───────────────┬───────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATION LAYER                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LangGraph StateGraph                     │   │
│  │  ┌──────────────┐  ┌──────────────┐                       │   │
│  │  │    MODE 1    │  │    MODE 2    │   Query Modes         │   │
│  │  │Manual Select │  │ Auto Select  │   (One-Shot)          │   │
│  │  └──────────────┘  └──────────────┘                       │   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────┐                       │   │
│  │  │    MODE 3    │  │    MODE 4    │   Chat Modes          │   │
│  │  │Manual + Auto │  │ Auto + Auto  │   (Multi-turn +       │   │
│  │  │   Reasoning  │  │   Reasoning  │    Autonomous)        │   │
│  │  └──────────────┘  └──────────────┘                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Agent Management                         │   │
│  │  • Agent Registry (136+ agents)                            │   │
│  │  • Agent Selector (Semantic/Manual)                        │   │
│  │  • Autonomous Reasoning Engine                             │   │
│  │  • Checkpoint System                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Conversation │  │   Context    │  │  Knowledge   │             │
│  │   Service    │  │   Service    │  │   Service    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Tenant     │  │   Session    │  │   Tools      │             │
│  │   Service    │  │   Service    │  │   Service    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │      PostgreSQL        │  │      Vector DB         │           │
│  │  (Supabase + RLS)      │  │     (Pinecone)        │           │
│  │  • Conversations       │  │  • Embeddings         │           │
│  │  • Agent Registry      │  │  • Semantic Search    │           │
│  │  • Checkpoints         │  │  • Agent Matching     │           │
│  └────────────────────────┘  └────────────────────────┘           │
│                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐           │
│  │     Redis Cache        │  │    Object Storage      │           │
│  │  • Session State       │  │  • Documents (S3)      │           │
│  │  • Rate Limiting       │  │  • Conversation Logs   │           │
│  │  • Feature Flags       │  │  • Agent Artifacts     │           │
│  └────────────────────────┘  └────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Mode Architecture

#### Mode State Definition
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Optional, Literal

class ExpertState(TypedDict):
    # Core State
    mode: Literal["manual_selection", "auto_selection", 
                  "manual_autonomous", "auto_autonomous"]
    interaction_type: Literal["query", "chat"]
    selection_type: Literal["manual", "auto"]
    
    # Identifiers
    tenant_id: str
    conversation_id: str
    message_id: str
    
    # User Input
    query: str
    selected_agent: Optional[str]  # For manual modes
    conversation_goal: Optional[str]  # For chat modes
    
    # Agent Management  
    active_agents: List[str]
    agent_responses: Dict[str, str]
    reasoning_traces: Dict[str, List[str]]
    
    # Autonomous Features
    checkpoint_required: bool
    checkpoint_type: Optional[str]
    human_feedback: Optional[str]
    iteration_count: int
    
    # Context & Memory
    conversation_history: List[Dict]
    session_context: Dict
    expert_memory: Dict
    
    # Response State
    intermediate_steps: List[str]
    final_response: str
    citations: List[Dict]
    confidence_score: float
```

#### Four-Mode Orchestration Graph
```python
def create_expert_graph():
    graph = StateGraph(ExpertState)
    
    # Add nodes for each mode
    graph.add_node("mode_router", route_to_mode)
    graph.add_node("manual_selection", handle_manual_selection)
    graph.add_node("auto_selection", handle_auto_selection)
    graph.add_node("manual_autonomous", handle_manual_autonomous)
    graph.add_node("auto_autonomous", handle_auto_autonomous)
    
    # Add reasoning components
    graph.add_node("chain_of_thought", perform_reasoning)
    graph.add_node("evidence_gathering", gather_evidence)
    graph.add_node("synthesis", synthesize_response)
    graph.add_node("checkpoint", handle_checkpoint)
    
    # Define edges
    graph.add_conditional_edges(
        "mode_router",
        determine_mode,
        {
            "mode_1": "manual_selection",
            "mode_2": "auto_selection", 
            "mode_3": "manual_autonomous",
            "mode_4": "auto_autonomous"
        }
    )
    
    # Autonomous reasoning flow
    graph.add_edge("manual_autonomous", "chain_of_thought")
    graph.add_edge("auto_autonomous", "chain_of_thought")
    graph.add_edge("chain_of_thought", "evidence_gathering")
    graph.add_edge("evidence_gathering", "checkpoint")
    graph.add_conditional_edges(
        "checkpoint",
        check_approval,
        {
            "approved": "synthesis",
            "rejected": "chain_of_thought"
        }
    )
    
    return graph.compile()
```

---

### 2. Mode-Specific Implementations

#### Mode 1: Manual Selection (Query)
```python
async def handle_manual_selection(state: ExpertState):
    """User chooses specific expert for one-shot answer"""
    
    # 1. Load selected expert
    expert = await load_expert(
        state.selected_agent,
        state.tenant_id
    )
    
    # 2. Generate expert-specific prompt
    prompt = expert.generate_prompt(
        query=state.query,
        expertise=expert.specialties,
        style=expert.response_style
    )
    
    # 3. Execute expert
    response = await expert.execute(
        prompt=prompt,
        context=state.session_context,
        tools=expert.available_tools
    )
    
    # 4. Format response with citations
    state.final_response = response.content
    state.citations = response.sources
    state.confidence_score = response.confidence
    
    # Timing: 20-30 seconds
    return state
```

#### Mode 2: Auto Selection (Query)
```python
async def handle_auto_selection(state: ExpertState):
    """AI selects best 3 experts for comprehensive answer"""
    
    # 1. Semantic analysis of query
    query_embedding = await embed_query(state.query)
    query_domains = await identify_domains(state.query)
    
    # 2. Select top 3 relevant experts
    experts = await semantic_expert_search(
        embedding=query_embedding,
        domains=query_domains,
        top_k=3,
        tenant_id=state.tenant_id
    )
    
    # 3. Parallel expert execution
    tasks = []
    for expert in experts:
        task = expert.execute_async(
            query=state.query,
            context=state.session_context
        )
        tasks.append(task)
    
    responses = await asyncio.gather(*tasks)
    
    # 4. Multi-expert synthesis
    synthesis = await synthesize_multi_expert(
        responses=responses,
        query=state.query,
        synthesis_model="gpt-4"
    )
    
    state.final_response = synthesis.content
    state.citations = synthesis.combined_sources
    state.active_agents = [e.id for e in experts]
    
    # Timing: 30-45 seconds
    return state
```

#### Mode 3: Manual + Autonomous (Chat)
```python
async def handle_manual_autonomous(state: ExpertState):
    """Selected expert with autonomous reasoning capabilities"""
    
    # 1. Load selected expert with reasoning engine
    expert = await load_expert_with_reasoning(
        state.selected_agent,
        state.tenant_id
    )
    
    # 2. Chain-of-Thought reasoning
    reasoning_chain = await expert.decompose_problem(
        query=state.query,
        context=state.conversation_history
    )
    
    state.reasoning_traces[expert.id] = reasoning_chain.steps
    
    # 3. Evidence gathering
    evidence = await expert.gather_evidence(
        reasoning_chain=reasoning_chain,
        tools=['pubmed', 'fda_db', 'clinical_trials']
    )
    
    # 4. Checkpoint for human validation
    if reasoning_chain.requires_validation:
        checkpoint = create_checkpoint(
            type="reasoning_validation",
            content={
                "reasoning": reasoning_chain.steps,
                "evidence": evidence.summary,
                "proposed_answer": reasoning_chain.conclusion
            }
        )
        
        approval = await wait_for_checkpoint(checkpoint, timeout=30)
        if not approval.approved:
            # Iterate based on feedback
            state.human_feedback = approval.feedback
            state.iteration_count += 1
            return await handle_manual_autonomous(state)
    
    # 5. Generate comprehensive response
    response = await expert.generate_response(
        reasoning=reasoning_chain,
        evidence=evidence,
        style="detailed_technical"
    )
    
    state.final_response = response.content
    state.citations = evidence.sources
    
    # Timing: 60-90 seconds
    return state
```

#### Mode 4: Auto + Autonomous (Chat)
```python
async def handle_auto_autonomous(state: ExpertState):
    """AI orchestrates multiple experts with autonomous reasoning"""
    
    # 1. Analyze problem complexity
    complexity = await analyze_complexity(state.query)
    required_domains = await identify_required_expertise(state.query)
    
    # 2. Select and coordinate experts
    expert_team = await assemble_expert_team(
        domains=required_domains,
        size=min(complexity.expert_count, 3),
        tenant_id=state.tenant_id
    )
    
    # 3. Parallel autonomous reasoning
    reasoning_tasks = []
    for expert in expert_team:
        task = expert.autonomous_reasoning(
            query=state.query,
            context=state.conversation_history,
            collaboration_mode=True
        )
        reasoning_tasks.append(task)
    
    reasoning_results = await asyncio.gather(*reasoning_tasks)
    
    # 4. Expert collaboration & consensus
    consensus = await build_expert_consensus(
        expert_results=reasoning_results,
        resolution_strategy="weighted_voting"
    )
    
    # 5. Checkpoint for complex decisions
    if consensus.confidence < 0.8 or complexity.risk_level == "high":
        checkpoint = create_checkpoint(
            type="multi_expert_consensus",
            content={
                "experts": [e.name for e in expert_team],
                "individual_conclusions": reasoning_results,
                "consensus": consensus.conclusion,
                "disagreements": consensus.disagreements
            }
        )
        
        approval = await wait_for_checkpoint(checkpoint)
        if not approval.approved:
            state.human_feedback = approval.feedback
            return await refine_consensus(state, expert_team)
    
    # 6. Synthesize final response
    final_response = await synthesize_expert_collaboration(
        consensus=consensus,
        expert_traces=reasoning_results,
        query=state.query
    )
    
    state.final_response = final_response.content
    state.citations = final_response.all_sources
    state.active_agents = [e.id for e in expert_team]
    
    # Timing: 45-60 seconds
    return state
```

---

### 3. Autonomous Reasoning Engine

#### Chain-of-Thought Implementation
```python
class ChainOfThoughtReasoner:
    """Implements multi-step reasoning with checkpoints"""
    
    def __init__(self, expert: Expert):
        self.expert = expert
        self.reasoning_steps = []
        self.evidence_cache = {}
        
    async def decompose_problem(self, query: str) -> ReasoningChain:
        # Break complex query into sub-questions
        decomposition_prompt = f"""
        Expert: {self.expert.name}
        Specialty: {self.expert.specialties}
        
        Problem: {query}
        
        Decompose this into 3-5 sub-questions that need answering:
        1. Identify key components
        2. Determine dependencies
        3. Structure logical flow
        """
        
        sub_questions = await self.llm.generate(decomposition_prompt)
        
        # Create reasoning chain
        chain = ReasoningChain(
            original_query=query,
            sub_questions=sub_questions,
            expert_id=self.expert.id
        )
        
        # Execute each step
        for question in sub_questions:
            step_result = await self.reason_step(question)
            chain.add_step(step_result)
            
            # Check if checkpoint needed
            if step_result.uncertainty > 0.7:
                chain.requires_validation = True
        
        return chain
    
    async def reason_step(self, question: str) -> ReasoningStep:
        # Gather evidence
        evidence = await self.gather_evidence(question)
        
        # Analyze evidence
        analysis = await self.analyze_evidence(evidence)
        
        # Draw conclusion
        conclusion = await self.draw_conclusion(analysis)
        
        return ReasoningStep(
            question=question,
            evidence=evidence,
            analysis=analysis,
            conclusion=conclusion,
            uncertainty=self.calculate_uncertainty(analysis)
        )
```

#### Checkpoint System
```python
class CheckpointManager:
    """Manages human-in-the-loop validation points"""
    
    def __init__(self):
        self.pending_checkpoints = {}
        self.checkpoint_history = []
        
    async def create_checkpoint(
        self,
        checkpoint_type: str,
        content: Dict,
        timeout: int = 30
    ) -> Checkpoint:
        
        checkpoint = Checkpoint(
            id=str(uuid.uuid4()),
            type=checkpoint_type,
            content=content,
            created_at=datetime.now(),
            timeout=timeout,
            status="pending"
        )
        
        # Store checkpoint
        self.pending_checkpoints[checkpoint.id] = checkpoint
        
        # Send to UI via WebSocket
        await self.notify_ui(checkpoint)
        
        # Wait for response
        approval = await self.wait_for_approval(checkpoint)
        
        # Record decision
        checkpoint.status = "approved" if approval.approved else "rejected"
        checkpoint.feedback = approval.feedback
        self.checkpoint_history.append(checkpoint)
        
        return approval
    
    async def wait_for_approval(
        self,
        checkpoint: Checkpoint
    ) -> CheckpointApproval:
        
        # Set up timeout
        timeout_task = asyncio.create_task(
            asyncio.sleep(checkpoint.timeout)
        )
        
        # Wait for user response
        approval_task = asyncio.create_task(
            self.approval_queue.get(checkpoint.id)
        )
        
        # Race between timeout and approval
        done, pending = await asyncio.wait(
            [timeout_task, approval_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel pending tasks
        for task in pending:
            task.cancel()
        
        # Check result
        if approval_task in done:
            return approval_task.result()
        else:
            # Timeout - auto-approve with note
            return CheckpointApproval(
                approved=True,
                feedback="Auto-approved due to timeout",
                auto_approved=True
            )
```

---

### 4. Expert Orchestration

#### Expert Registry
```typescript
interface ExpertAgent {
  // Core Identity
  agent_id: string;
  name: string;
  title: string;
  avatar_url: string;
  
  // Expertise Profile
  domain: 'regulatory' | 'clinical' | 'technical' | 'market';
  specialties: string[];
  sub_specialties: string[];
  credentials: string[];
  
  // Capabilities
  supported_modes: ('manual' | 'auto' | 'autonomous')[];
  reasoning_capabilities: {
    chain_of_thought: boolean;
    evidence_gathering: boolean;
    hypothesis_testing: boolean;
    risk_assessment: boolean;
  };
  
  // Knowledge Sources
  knowledge_bases: string[];
  tool_access: string[];
  update_frequency: 'daily' | 'weekly' | 'monthly';
  
  // Performance Metrics
  accuracy_score: number;  // 0-100
  response_time_p50: number;  // milliseconds
  usage_count: number;
  satisfaction_rating: number;  // 1-5
  
  // Sub-Agent Network
  sub_agents?: {
    agent_id: string;
    trigger_keywords: string[];
    specialization: string;
  }[];
}
```

#### Dynamic Expert Selection
```python
class ExpertSelector:
    """Intelligent expert selection for auto modes"""
    
    def __init__(self, vector_db: Pinecone, registry: AgentRegistry):
        self.vector_db = vector_db
        self.registry = registry
        self.selection_cache = TTLCache(maxsize=1000, ttl=600)
        
    async def select_experts(
        self,
        query: str,
        mode: str,
        tenant_id: str,
        count: int = 3
    ) -> List[Expert]:
        
        # Check cache
        cache_key = f"{query_hash(query)}:{mode}:{tenant_id}"
        if cache_key in self.selection_cache:
            return self.selection_cache[cache_key]
        
        # Semantic search
        query_embedding = await self.embed(query)
        
        candidates = await self.vector_db.query(
            vector=query_embedding,
            top_k=count * 3,  # Get more candidates
            filter={
                "tenant_id": tenant_id,
                "status": "active",
                "modes": {"$in": [mode]}
            }
        )
        
        # Multi-factor ranking
        ranked = await self.rank_experts(
            candidates=candidates,
            factors={
                "semantic_relevance": 0.35,
                "domain_match": 0.25,
                "specialty_overlap": 0.20,
                "performance_history": 0.15,
                "availability": 0.05
            },
            query=query
        )
        
        # Select top experts
        selected = ranked[:count]
        
        # Cache result
        self.selection_cache[cache_key] = selected
        
        return selected
    
    async def rank_experts(
        self,
        candidates: List[Dict],
        factors: Dict[str, float],
        query: str
    ) -> List[Expert]:
        
        scores = []
        query_domains = await self.identify_domains(query)
        
        for candidate in candidates:
            expert = await self.registry.get_expert(candidate['id'])
            
            score = 0
            score += factors['semantic_relevance'] * candidate['score']
            score += factors['domain_match'] * self.domain_overlap(
                expert.domain, 
                query_domains
            )
            score += factors['specialty_overlap'] * self.specialty_match(
                expert.specialties, 
                query
            )
            score += factors['performance_history'] * (
                expert.accuracy_score / 100
            )
            score += factors['availability'] * expert.get_availability()
            
            scores.append((expert, score))
        
        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)
        
        return [expert for expert, _ in scores]
```

---

### 5. Performance Optimization

#### Response Caching Strategy
```python
CACHE_LAYERS = {
    'L1_MEMORY': {
        'type': 'in_memory',
        'ttl': 60,  # 1 minute
        'max_size': 1000
    },
    'L2_REDIS': {
        'type': 'redis',
        'ttl': 300,  # 5 minutes
        'max_size': 10000
    },
    'L3_CDN': {
        'type': 'cloudflare',
        'ttl': 3600,  # 1 hour
        'patterns': ['static_expert_profiles', 'common_queries']
    }
}

class MultiLayerCache:
    async def get_or_compute(
        self,
        key: str,
        compute_fn: Callable,
        cache_level: str = 'L2_REDIS'
    ):
        # Try L1 (memory)
        if value := self.memory_cache.get(key):
            return value
        
        # Try L2 (Redis)
        if value := await self.redis.get(key):
            self.memory_cache.set(key, value, ttl=60)
            return value
        
        # Compute and cache
        value = await compute_fn()
        
        # Write through all layers
        self.memory_cache.set(key, value, ttl=60)
        await self.redis.set(key, value, ttl=300)
        
        return value
```

#### Parallel Processing
```python
class ParallelOrchestrator:
    """Manages parallel expert execution"""
    
    async def execute_experts_parallel(
        self,
        experts: List[Expert],
        query: str,
        max_parallel: int = 5
    ) -> List[ExpertResponse]:
        
        # Create semaphore for parallelism control
        semaphore = asyncio.Semaphore(max_parallel)
        
        async def execute_with_limit(expert: Expert):
            async with semaphore:
                return await expert.execute(query)
        
        # Execute all experts in parallel
        tasks = [
            execute_with_limit(expert) 
            for expert in experts
        ]
        
        # Wait for all to complete
        responses = await asyncio.gather(
            *tasks,
            return_exceptions=True
        )
        
        # Filter out errors
        valid_responses = [
            r for r in responses 
            if not isinstance(r, Exception)
        ]
        
        return valid_responses
```

---

### 6. Real-Time Communication

#### WebSocket Manager
```python
class ConversationWebSocket:
    """Manages real-time conversation streaming"""
    
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
        self.mode_handlers = {
            'manual_selection': self.stream_manual,
            'auto_selection': self.stream_auto,
            'manual_autonomous': self.stream_autonomous,
            'auto_autonomous': self.stream_multi_autonomous
        }
        
    async def handle_connection(
        self,
        websocket: WebSocket,
        conversation_id: str,
        mode: str
    ):
        await websocket.accept()
        self.connections[conversation_id] = websocket
        
        try:
            # Route to appropriate handler
            handler = self.mode_handlers[mode]
            await handler(websocket, conversation_id)
        finally:
            del self.connections[conversation_id]
    
    async def stream_autonomous(
        self,
        websocket: WebSocket,
        conversation_id: str
    ):
        """Stream autonomous reasoning steps"""
        
        async for event in self.reasoning_events(conversation_id):
            await websocket.send_json({
                'type': event.type,
                'content': event.content,
                'timestamp': event.timestamp
            })
            
            # Handle checkpoint events
            if event.type == 'checkpoint_required':
                approval = await self.wait_for_approval(
                    websocket,
                    event.checkpoint
                )
                await self.send_approval(conversation_id, approval)
```

---

### 7. Multi-Tenant Architecture

#### Tenant Isolation
```python
class TenantIsolation:
    """Ensures complete data isolation between tenants"""
    
    def __init__(self):
        self.tenant_cache = {}
        
    async def enforce_isolation(
        self,
        request: Request,
        tenant_id: str
    ):
        # Database level - RLS policies
        await self.db.execute(
            "SET app.current_tenant_id = $1",
            tenant_id
        )
        
        # Application level - validate all queries
        request.state.tenant_id = tenant_id
        
        # Cache level - namespace separation  
        cache_namespace = f"tenant:{tenant_id}"
        request.state.cache_namespace = cache_namespace
        
        # Vector DB - metadata filtering
        request.state.vector_filter = {
            "tenant_id": tenant_id
        }
        
    async def validate_expert_access(
        self,
        expert_id: str,
        tenant_id: str
    ) -> bool:
        """Verify tenant has access to requested expert"""
        
        result = await self.db.fetchone("""
            SELECT 1 FROM agent_registry
            WHERE agent_id = $1 
            AND tenant_id = $2
            AND status = 'active'
        """, expert_id, tenant_id)
        
        return result is not None
```

---

### 8. Monitoring & Observability

#### Metrics Collection
```python
METRICS = {
    # Mode-specific metrics
    'mode_usage': Counter(
        'expert_mode_usage_total',
        'Usage count by mode',
        ['mode', 'tenant_id']
    ),
    
    'mode_latency': Histogram(
        'expert_mode_latency_seconds',
        'Response time by mode',
        ['mode', 'selection_type', 'interaction_type']
    ),
    
    # Expert metrics
    'expert_invocations': Counter(
        'expert_invocations_total',
        'Expert usage count',
        ['expert_id', 'mode']
    ),
    
    'expert_accuracy': Gauge(
        'expert_accuracy_score',
        'Expert accuracy rating',
        ['expert_id']
    ),
    
    # Checkpoint metrics
    'checkpoint_approvals': Counter(
        'checkpoint_approvals_total',
        'Checkpoint approval count',
        ['type', 'decision']
    ),
    
    'checkpoint_latency': Histogram(
        'checkpoint_decision_time_seconds',
        'Time to checkpoint decision',
        ['type']
    ),
    
    # Business metrics
    'tokens_consumed': Counter(
        'llm_tokens_total',
        'Total tokens consumed',
        ['model', 'mode', 'tenant_id']
    )
}

class MetricsCollector:
    def record_mode_usage(self, mode: str, tenant_id: str):
        METRICS['mode_usage'].labels(
            mode=mode,
            tenant_id=tenant_id
        ).inc()
        
    def record_expert_invocation(
        self,
        expert_id: str,
        mode: str,
        latency: float
    ):
        METRICS['expert_invocations'].labels(
            expert_id=expert_id,
            mode=mode
        ).inc()
        
        METRICS['mode_latency'].labels(
            mode=mode,
            selection_type=self.get_selection_type(mode),
            interaction_type=self.get_interaction_type(mode)
        ).observe(latency)
```

---

### 9. Performance Requirements

#### Latency Targets by Mode
| Mode | Selection | Interaction | P50 | P95 | P99 |
|------|-----------|-------------|-----|-----|-----|
| Mode 1 | Manual | Query | 20s | 25s | 30s |
| Mode 2 | Auto | Query | 30s | 40s | 45s |
| Mode 3 | Manual | Chat + Auto | 60s | 75s | 90s |
| Mode 4 | Auto | Chat + Auto | 45s | 55s | 60s |

#### Throughput Requirements
- **Concurrent Users:** 10,000+
- **Requests/Second:** 1,000 peak
- **Active Conversations:** 50,000 concurrent
- **Parallel Expert Executions:** 500 concurrent
- **Checkpoint Processing:** <5 seconds

#### Scalability Targets
- **Horizontal Scaling:** 1-100 pods
- **Database Connections:** 1,000 concurrent
- **WebSocket Connections:** 50,000 concurrent
- **Cache Hit Rate:** >85%
- **Expert Selection Accuracy:** >90%

---

## Deployment Architecture

### Kubernetes Configuration
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ask-expert-orchestrator
spec:
  replicas: 10
  selector:
    matchLabels:
      app: ask-expert
  template:
    spec:
      containers:
      - name: orchestrator
        image: vital/ask-expert:latest
        env:
        - name: MODE_CONFIG
          value: "4_mode_system"
        - name: MAX_EXPERTS
          value: "136"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ask-expert-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ask-expert-orchestrator
  minReplicas: 5
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

**Document Status:** Complete
**Architecture Pattern:** 4-Mode System with Autonomous Reasoning
**Next Review:** Q1 2026