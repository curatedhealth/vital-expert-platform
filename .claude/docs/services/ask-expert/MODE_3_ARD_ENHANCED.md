---
title: "Mode 3: Manual Autonomous - Architecture Requirements Document (ARD)"
version: "2.0"
status: "Enhanced Specification"
date: "2025-12-04"
owner: "VITAL Platform Team | Curated Health"
classification: "Confidential"
references:
  - LangGraph Deep Agents
  - LangChain v1 Supervisor Pattern
  - AutoGPT Architecture
  - Manus Agent Framework
  - DeepAgent Memory Folding
  - AsyncThink Multi-Agent Organization
research_basis:
  - "Fundamentals of Building Autonomous LLM Agents (Oct 2025)"
  - "DeepAgent: A General Reasoning Agent with Scalable Toolsets (Oct 2025)"
  - "The Era of Agentic Organization: AsyncThink (Oct 2025)"
  - "Agents Thinking Fast and Slow: Talker-Reasoner Architecture (Oct 2024)"
  - "SFR-DeepResearch: Autonomous Single Agents (Sep 2025)"
---

# Implementation Delta (2025-12-XX)

**Observed in `apps/vital-system/src/features/chat/services` vs ARD intent**

- Adaptive autonomy layer absent: No risk/trust/complexity/uncertainty signals; no strict/balanced/permissive routing.
- MACK separation missing: Planner/Solver/Critic/Executor not exposed; single monolithic Python call with no critic/self-check outputs.
- Execution fabric missing: No DAG scheduler, branch states, retries, or sub-agent lifecycle; no supervisor pattern; single-agent only.
- HITL governance missing: No checkpoints or policy gates on regulated actions; no audit events.
- Telemetry: No autonomy signals, execution traces, or task graph emitted; limited metadata streaming only.
- Safety/role controls absent: No permission checks or risk gating for high-impact actions.

# Phase 1 Implementation Slice (align to ARD with minimal change)

1) **Autonomy signals & banding (strict/balanced/permissive)**\n   - Compute risk_level, task_complexity, user_trust_score, model_uncertainty, knowledge_quality in gateway; tag every request and log signals.\n   - Enforce caps (iterations, tool whitelist) and HITL requirements per band.\n\n2) **Planner/Solver/Critic telemetry**\n   - Require Python engine to return structured steps: `planner` (goal_understanding, plan), `solver` (iterations: thought/action/observation), `critic` (validation/flags), even if sequential.\n   - Stream these as typed events to UI and audit log.\n\n3) **HITL checkpoints**\n   - Inject checkpoints after planner (plan approval), before high-risk tool/action, and before final answer when confidence < threshold.\n   - Record audit events (who/what/when/outcome) for each checkpoint.\n\n4) **Evidence & safety metadata**\n   - Emit citations with evidence_level, recency, and confidence; include policy tags for regulated content.\n   - Block/require approval when policy tags are high-risk.\n\n5) **Mode semantics correction**\n   - Mode 3 = manual agent required; Mode 4 = auto-select default. Validate at API boundary.\n\n# Phase 2 (deeper ARD alignment)\n\n- Introduce DAG execution fabric with node statuses, retries, cancellation, and simple parallel branches for tool calls.\n- Add supervisor + child-agent pattern (1 coordinator + up to 2 specialists) with context isolation and merge logic.\n- Implement reflexion/self-consistency loop in critic; calibrate confidence and surface calibration gap.\n- Persist episodic/task memory with folding/summary to bound context growth; expose memory slices in telemetry.\n\n# Guardrails for rollout\n\n- Ship P1 behind feature flags per tenant; log autonomy signals and checkpoint outcomes for calibration.\n- Require role/permission checks on high-risk actions; default to strict band when signals are missing.\n- Add synthetic tests that assert presence of planner/solver/critic events and checkpoints in streaming output.\n*** End Patch
# Mode 3: Manual Autonomous — Enhanced Architecture Requirements Document

## Executive Summary

Mode 3 represents VITAL's flagship agentic AI capability, combining **user-selected expert agents** with **autonomous goal-driven execution** under **Human-In-The-Loop (HITL) safety governance**. This enhanced specification elevates Mode 3 to world-class standards by incorporating patterns from leading autonomous agent systems.

### Golden Matrix Position

```
┌─────────────────────┬───────────────────────┬───────────────────────────┐
│                     │ MANUAL SELECTION      │ AUTOMATIC SELECTION       │
├─────────────────────┼───────────────────────┼───────────────────────────┤
│ INTERACTIVE         │ Mode 1                │ Mode 2                    │
│ (Chat/Multi-Turn)   │ User picks agent      │ System picks agent        │
├─────────────────────┼───────────────────────┼───────────────────────────┤
│ AUTONOMOUS          │ ★ MODE 3 ★            │ Mode 4                    │
│ (ReAct/CoT/Goals)   │ User picks agent      │ System picks agent        │
│                     │ HITL Governance       │ Full Autonomy             │
└─────────────────────┴───────────────────────┴───────────────────────────┘
```

---

## 1. Core Architecture Layers

Mode 3 comprises **six interconnected architectural layers**, each addressing specific capabilities required for world-class autonomous agent performance.

### 1.1 Layer 1: Adaptive Autonomy Layer (AAL)

A decision-making layer that **dynamically adjusts autonomy** based on real-time signals, enabling self-tuning workflows.

#### Autonomy Signals

```yaml
autonomy_signals:
  task_complexity:
    type: "numeric"
    range: [1, 10]
    factors:
      - step_count
      - domain_expertise_required
      - tool_diversity
      - ambiguity_score
  
  risk_level:
    type: "categorical"
    values: ["low", "medium", "high", "critical"]
    dimensions:
      - regulatory_impact
      - financial_exposure
      - reputational_risk
      - safety_implications
  
  user_trust_score:
    type: "numeric"
    range: [0, 100]
    factors:
      - historical_approval_rate
      - task_completion_success
      - tenure_days
      - role_permissions
  
  model_uncertainty:
    type: "numeric"
    range: [0, 1]
    sources:
      - token_entropy
      - self_consistency_variance
      - calibration_score
  
  knowledge_quality:
    type: "numeric"
    range: [0, 1]
    factors:
      - rag_retrieval_confidence
      - source_recency
      - citation_density
```

#### Autonomy Adjustment Logic

```python
def calculate_autonomy_level(signals: AutonomySignals) -> AutonomyLevel:
    """
    Returns: strict | balanced | permissive
    """
    # High risk or low trust → Strict
    if signals.risk_level == "critical" or signals.user_trust_score < 30:
        return AutonomyLevel.STRICT
    
    # Complex task with uncertainty → Strict
    if signals.task_complexity > 7 and signals.model_uncertainty > 0.6:
        return AutonomyLevel.STRICT
    
    # Trusted user, simple task, high confidence → Permissive
    if (signals.user_trust_score > 80 and 
        signals.task_complexity < 4 and 
        signals.model_uncertainty < 0.3):
        return AutonomyLevel.PERMISSIVE
    
    # Default
    return AutonomyLevel.BALANCED
```

---

### 1.2 Layer 2: Multi-Agent Cognitive Kernel (MACK)

Inspired by the **Talker-Reasoner architecture** and **AsyncThink** research, MACK provides a unified cognitive processing pipeline.

#### MACK Components

```yaml
cognitive_kernel:
  planner:
    responsibility: "Goal decomposition and multi-step planning"
    patterns:
      - chain_of_thought
      - tree_of_thoughts
      - hierarchical_task_network
    outputs:
      - execution_plan
      - dependency_graph
      - resource_estimates
  
  solver:
    responsibility: "Action execution and tool orchestration"
    patterns:
      - react_squared  # ReAct with verification
      - multi_tool_routing
      - parallel_execution
    outputs:
      - action_results
      - tool_outputs
      - intermediate_states
  
  critic:
    responsibility: "Output validation and quality assurance"
    patterns:
      - constitutional_ai
      - reflexion
      - self_consistency_check
    outputs:
      - validation_scores
      - correction_suggestions
      - hallucination_flags
  
  executor:
    responsibility: "Sub-agent coordination and parallel tasks"
    patterns:
      - supervisor_pattern
      - dag_scheduler
      - context_isolation
    outputs:
      - sub_agent_results
      - merged_outputs
      - execution_traces
```

#### MACK Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MACK Processing Cycle                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │ PLANNER  │───▶│  SOLVER  │───▶│  CRITIC  │───▶│ EXECUTOR │ │
│   │          │    │          │    │          │    │          │ │
│   │ CoT/ToT  │    │ ReAct²   │    │ Const.AI │    │Supervisor│ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│        │                               │                │       │
│        │         ┌─────────────────────┘                │       │
│        │         │ Feedback Loop                        │       │
│        ▼         ▼                                      ▼       │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              HITL Checkpoint (if triggered)              │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Layer 3: Execution Fabric (EFX)

A unified runtime replacing linear execution with an **intelligent DAG scheduler**.

#### EFX Capabilities

```yaml
execution_fabric:
  dag_execution:
    description: "Workflow execution as directed acyclic graph"
    features:
      - parallel_branch_execution
      - dependency_resolution
      - dynamic_graph_modification
      - conditional_branching
  
  sub_agent_management:
    description: "Spawn and coordinate child agents"
    features:
      - context_isolation
      - resource_pooling
      - lifecycle_management
      - result_aggregation
  
  streaming_outputs:
    description: "Real-time result streaming"
    features:
      - token_streaming
      - progress_events
      - intermediate_results
      - cancellation_support
  
  retry_logic:
    description: "Intelligent failure recovery"
    strategies:
      - exponential_backoff
      - alternative_tool_fallback
      - partial_result_salvage
      - checkpoint_recovery
  
  rollback_safety:
    description: "State management for recovery"
    features:
      - checkpoint_creation
      - state_snapshots
      - transaction_boundaries
      - graceful_degradation
```

#### DAG Execution State

```python
@dataclass
class ExecutionDAG:
    nodes: Dict[str, ExecutionNode]
    edges: List[Tuple[str, str]]
    current_state: Dict[str, NodeState]
    checkpoints: List[Checkpoint]
    
    def get_ready_nodes(self) -> List[str]:
        """Return nodes whose dependencies are satisfied"""
        ready = []
        for node_id, node in self.nodes.items():
            if self.current_state[node_id] == NodeState.PENDING:
                deps_satisfied = all(
                    self.current_state[dep] == NodeState.COMPLETED
                    for dep in self.get_dependencies(node_id)
                )
                if deps_satisfied:
                    ready.append(node_id)
        return ready
    
    def can_parallelize(self, nodes: List[str]) -> List[List[str]]:
        """Group nodes that can execute in parallel"""
        # Implementation based on dependency analysis
        pass
```

---

### 1.4 Layer 4: Autonomous Tool Router (ATR)

Intelligent tool selection based on **semantic task analysis** and **historical performance**.

#### Tool Routing Configuration

```yaml
tool_router:
  routing_signals:
    semantic_task_type:
      description: "Classification of task intent"
      categories:
        - evidence_retrieval
        - data_analysis
        - code_execution
        - document_generation
        - regulatory_compliance
        - risk_assessment
    
    historical_performance:
      description: "Per-user/agent tool success rates"
      metrics:
        - success_rate
        - latency_p95
        - cost_per_call
        - user_satisfaction
    
    tool_reliability:
      description: "Current tool health status"
      metrics:
        - uptime_percentage
        - error_rate_24h
        - queue_depth
        - rate_limit_remaining
    
    cost_optimization:
      description: "Token and API cost factors"
      factors:
        - token_cost_per_call
        - api_call_cost
        - cache_hit_potential
  
  routing_rules:
    evidence_retrieval:
      primary: "rag_unified_service"
      fallback: ["web_search", "document_store"]
      fusion_enabled: true
    
    code_execution:
      primary: "python_sandbox"
      fallback: ["r_executor", "sas_executor"]
      verification: "code_critic_agent"
    
    database_query:
      primary: "sql_agent"
      fallback: ["schema_inspector"]
      mode: "read_only"
    
    risk_assessment:
      primary: "l3_risk_specialist"
      requires_hitl: true
```

#### Tool Selection Algorithm

```python
def select_optimal_tool(
    task: Task,
    available_tools: List[Tool],
    user_context: UserContext,
    performance_history: PerformanceHistory
) -> ToolSelection:
    """
    Select optimal tool based on multi-factor scoring
    """
    candidates = []
    
    for tool in available_tools:
        if not tool.supports_task_type(task.semantic_type):
            continue
        
        score = ToolScore(
            semantic_match=calculate_semantic_match(task, tool),
            historical_success=performance_history.get_success_rate(
                tool.id, user_context.user_id
            ),
            reliability=tool.current_reliability_score(),
            cost_efficiency=calculate_cost_efficiency(task, tool),
            latency_estimate=tool.estimated_latency(task.complexity)
        )
        
        candidates.append((tool, score.weighted_total()))
    
    # Sort by score, return best with fallback chain
    candidates.sort(key=lambda x: x[1], reverse=True)
    
    return ToolSelection(
        primary=candidates[0][0],
        fallbacks=[c[0] for c in candidates[1:3]],
        scores={c[0].id: c[1] for c in candidates}
    )
```

---

### 1.5 Layer 5: Tri-Memory Architecture

Based on **DeepAgent's autonomous memory folding** mechanism, providing persistent, searchable, and compressible memory.

#### Memory Layer Specifications

```yaml
tri_memory:
  episodic_memory:
    purpose: "State snapshots per execution step"
    implementation: "LangGraph Checkpointer"
    storage: "PostgreSQL with AsyncPostgresSaver"
    features:
      - step_by_step_snapshots
      - execution_trace_replay
      - time_travel_debugging
      - branching_support
    retention:
      hot_storage: "24 hours"
      warm_storage: "30 days"
      cold_archive: "1 year"
  
  semantic_memory:
    purpose: "Knowledge graph from prior work"
    implementation: "InMemoryStore + Vector DB"
    storage: "Supabase pgvector"
    features:
      - semantic_search
      - knowledge_graph_construction
      - cross_task_learning
      - domain_expertise_accumulation
    configuration:
      embedding_model: "text-embedding-3-small"
      embedding_dims: 1536
      similarity_threshold: 0.75
  
  working_memory:
    purpose: "Dynamic scratchpad for active task"
    implementation: "LangGraph StateGraph"
    features:
      - context_compression
      - attention_management
      - priority_queue
      - overflow_to_semantic
    limits:
      max_tokens: 32000
      compression_threshold: 24000
      compression_ratio: 0.6
```

#### Memory Operations

```python
class TriMemoryManager:
    """Manages the three-layer memory system"""
    
    async def store_episodic(
        self,
        thread_id: str,
        checkpoint: Checkpoint
    ) -> None:
        """Store execution state snapshot"""
        await self.checkpointer.aput(
            config={"configurable": {"thread_id": thread_id}},
            checkpoint=checkpoint
        )
    
    async def search_semantic(
        self,
        query: str,
        user_id: str,
        namespace: str = "memories",
        limit: int = 5
    ) -> List[MemoryItem]:
        """Semantic search across accumulated knowledge"""
        return await self.store.search(
            (user_id, namespace),
            query=query,
            limit=limit
        )
    
    async def compress_working(
        self,
        state: GraphState,
        target_tokens: int
    ) -> GraphState:
        """Compress working memory when approaching limits"""
        if state.token_count < self.compression_threshold:
            return state
        
        # Extract key information
        compressed = await self.compression_agent.compress(
            state.messages,
            target_ratio=self.compression_ratio
        )
        
        # Store overflow in semantic memory
        await self.store.put(
            (state.user_id, "overflow"),
            str(uuid4()),
            {"content": state.messages, "compressed": compressed}
        )
        
        return state.with_messages(compressed)
```

---

### 1.6 Layer 6: Reliability Envelope & Guardrails

Continuous runtime monitoring with **automatic escalation** for anomaly detection.

#### Monitoring Signals

```yaml
reliability_envelope:
  divergence_detection:
    description: "Detect when agent goes off-track"
    signals:
      - plan_adherence_score
      - goal_alignment_drift
      - topic_coherence
    threshold: 0.7
    action: "escalate_to_critic"
  
  hallucination_detection:
    description: "Identify potentially fabricated content"
    signals:
      - claim_verification_score
      - citation_validity
      - self_consistency
    threshold: 0.6
    action: "flag_for_review"
  
  tool_misuse_detection:
    description: "Identify inappropriate tool usage"
    signals:
      - tool_task_alignment
      - parameter_validity
      - frequency_anomaly
    threshold: 0.8
    action: "block_and_notify"
  
  cyclic_loop_detection:
    description: "Detect infinite loops or stuck states"
    signals:
      - action_repetition_count
      - state_similarity_score
      - progress_stagnation
    threshold: 3  # repetitions
    action: "break_loop_escalate"
  
  confidence_pipeline:
    description: "End-to-end confidence scoring"
    components:
      - input_clarity_score
      - plan_confidence
      - execution_confidence
      - output_confidence
    aggregation: "weighted_harmonic_mean"
    hitl_threshold: 0.65
```

#### Escalation Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                    Escalation Chain                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Anomaly Detected                                              │
│         │                                                       │
│         ▼                                                       │
│   ┌──────────┐   Correctable?   ┌──────────────┐               │
│   │  CRITIC  │────────Yes──────▶│ Self-Correct │               │
│   └──────────┘                  └──────────────┘               │
│         │ No                                                    │
│         ▼                                                       │
│   ┌──────────────┐   Recoverable?   ┌────────────┐             │
│   │ MASTER (L1)  │────────Yes──────▶│  Replan    │             │
│   └──────────────┘                  └────────────┘             │
│         │ No                                                    │
│         ▼                                                       │
│   ┌──────────┐                                                 │
│   │   HITL   │◀─────── Human Decision Required                 │
│   └──────────┘                                                 │
│         │                                                       │
│         ▼                                                       │
│   ┌──────────┐                                                 │
│   │   USER   │◀─────── Final Authority                         │
│   └──────────┘                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Enhanced 5-Level Agent Hierarchy

Building on **LangGraph's Deep Agents** pattern with enhanced capabilities at each level.

### 2.1 Hierarchy Overview

```yaml
agent_hierarchy:
  L1_master:
    role: "Task Coordination & Safety"
    model: "gpt-4-turbo"
    capabilities:
      - task_decomposition
      - hitl_trigger_management
      - escalation_handling
      - final_synthesis
    enhancements:
      - uncertainty_gating
      - anomaly_detection
      - fallback_strategies
      - memory_writes
    communication:
      upward: "user"
      downward: ["L2"]
  
  L2_expert:
    role: "Domain Expertise (User-Selected)"
    model: "gpt-4-turbo | claude-3-opus"
    capabilities:
      - domain_reasoning
      - l3_delegation
      - evidence_synthesis
      - compliance_validation
    enhancements:
      - domain_specific_templates
      - self_evaluation_rubric
      - expertise_calibration
    communication:
      upward: "L1"
      downward: ["L3"]
  
  L3_specialist:
    role: "Sub-Domain Tasks (Spawned)"
    model: "gpt-4-turbo"
    capabilities:
      - focused_subtasks
      - l4_delegation
      - parallel_coordination
    enhancements:
      - dynamic_subtask_planning
      - ephemeral_worker_spawning
      - resource_optimization
    communication:
      upward: "L2"
      downward: ["L4"]
  
  L4_worker:
    role: "Parallel Execution"
    model: "gpt-4o-mini | gpt-3.5-turbo"
    capabilities:
      - parallel_task_execution
      - tool_invocation
      - result_formatting
    enhancements:
      - distributed_execution
      - local_verification_loops
      - batch_processing
    communication:
      upward: "L3"
      downward: ["L5"]
  
  L5_tool:
    role: "Tool Execution"
    model: "function_calling"
    capabilities:
      - rag_retrieval
      - web_search
      - code_execution
      - database_queries
    enhancements:
      - reliability_scoring
      - result_caching
      - cost_classification
    communication:
      upward: "L4"
      downward: null
```

### 2.2 Cross-Agent Communication Protocol

```yaml
communication_protocol:
  critique_channel:
    purpose: "Agents critique each other's output"
    format:
      critique_id: "uuid"
      source_agent: "agent_id"
      target_agent: "agent_id"
      critique_type: "accuracy | completeness | relevance | safety"
      severity: "info | warning | error | critical"
      content: "string"
      suggestions: ["string"]
    routing: "broadcast_to_peers"
  
  delegation_channel:
    purpose: "Formal task delegation with metadata"
    format:
      delegation_id: "uuid"
      from_agent: "agent_id"
      to_agent: "agent_id"
      task: "TaskDefinition"
      rationale: "string"
      constraints: ["string"]
      deadline: "datetime"
      priority: "low | medium | high | critical"
    routing: "direct_to_target"
  
  failover_channel:
    purpose: "Structured error propagation"
    format:
      error_id: "uuid"
      source_agent: "agent_id"
      error_type: "ErrorType"
      severity: "recoverable | fatal"
      context: "dict"
      attempted_recovery: "bool"
      recovery_result: "success | partial | failed"
    routing: "propagate_upward"
```

### 2.3 Multi-Agent Collaboration Mode

```yaml
multi_agent_collaboration:
  description: "Enable multiple L2 agents for cross-domain tasks"
  
  collaboration_patterns:
    parallel_synthesis:
      description: "Multiple experts work independently, L1 merges"
      example:
        agents: ["regulatory_expert", "market_access_expert", "clinical_expert"]
        task: "Comprehensive product dossier"
        merge_strategy: "weighted_consensus"
    
    sequential_handoff:
      description: "Experts work in sequence, passing enriched context"
      example:
        pipeline: ["research_agent", "analysis_agent", "recommendation_agent"]
        handoff: "enriched_state"
    
    debate_resolution:
      description: "Experts debate, critic mediates, L1 decides"
      example:
        debaters: ["optimist_agent", "pessimist_agent"]
        mediator: "critic_agent"
        decider: "master_agent"
  
  conflict_resolution:
    strategy: "weighted_expertise_voting"
    weights:
      domain_match: 0.4
      confidence_score: 0.3
      historical_accuracy: 0.3
    escalation_threshold: 0.6  # Below this, escalate to HITL
```

---

## 3. HITL System Architecture

Enhanced from static checkpoints to an **adaptive, intelligent approval system**.

### 3.1 HITL Middleware Configuration

```yaml
hitl_middleware:
  implementation: "LangGraph HumanInTheLoopMiddleware"
  
  checkpoint_types:
    plan_approval:
      trigger: "multi_step_plan_generated"
      always_required: true
      allowed_decisions: ["approve", "edit", "reject"]
      timeout: "5 minutes"
      auto_action: "reject"
    
    tool_execution:
      trigger: "external_tool_call"
      configurable_per_tool: true
      allowed_decisions: ["approve", "edit", "reject"]
      default_tools_requiring_approval:
        - code_execution
        - database_write
        - external_api_mutation
        - file_system_write
    
    subagent_spawn:
      trigger: "l3_l4_l5_delegation"
      allowed_decisions: ["approve", "reject"]
      auto_approve_trusted: true
      trust_threshold: 80
    
    critical_decision:
      trigger: "risk_score_exceeds_threshold OR regulatory_impact"
      allowed_decisions: ["approve", "edit", "reject"]
      requires_justification: true
    
    final_review:
      trigger: "before_response_delivery"
      configurable: true
      allowed_decisions: ["approve", "request_revision"]
  
  safety_levels:
    strict:
      description: "All checkpoints active"
      use_cases: ["regulatory", "first_time_tasks", "critical_decisions"]
      checkpoints: ["plan", "tool", "subagent", "decision", "final"]
    
    balanced:
      description: "Core checkpoints only"
      use_cases: ["default", "moderate_complexity"]
      checkpoints: ["plan", "decision", "final"]
    
    permissive:
      description: "Minimal oversight"
      use_cases: ["trusted_users", "low_risk", "routine_tasks"]
      checkpoints: ["final"]
```

### 3.2 HITL Explanation Packets

```yaml
explanation_packet:
  required_fields:
    reasoning_summary:
      type: "string"
      max_length: 500
      purpose: "Concise explanation of why approval is needed"
    
    confidence_levels:
      plan_confidence: "0-100"
      execution_confidence: "0-100"
      output_confidence: "0-100"
    
    risk_assessment:
      level: "low | medium | high | critical"
      factors: ["string"]
      mitigations: ["string"]
    
    alternatives:
      type: "list"
      items:
        option: "string"
        pros: ["string"]
        cons: ["string"]
        confidence: "0-100"
    
    cost_estimate:
      tokens_consumed: "integer"
      tokens_remaining: "integer"
      api_calls: "integer"
      estimated_cost_usd: "float"
    
    downstream_impact:
      affected_steps: ["string"]
      reversibility: "full | partial | none"
      time_to_complete: "duration"
```

### 3.3 HITL Override Logic

```python
class HITLOverrideHandler:
    """Handle user overrides during HITL checkpoints"""
    
    async def handle_override(
        self,
        checkpoint: HITLCheckpoint,
        decision: HITLDecision,
        modifications: Optional[Dict] = None
    ) -> OverrideResult:
        
        if decision == HITLDecision.APPROVE:
            return OverrideResult(
                action="continue",
                state_modification=None
            )
        
        elif decision == HITLDecision.EDIT:
            # User can modify:
            # - Individual plan steps
            # - Tool parameters
            # - Constraints
            validated_mods = self.validate_modifications(modifications)
            
            # Trigger replanning for downstream steps
            new_plan = await self.replan_downstream(
                checkpoint.current_plan,
                validated_mods
            )
            
            return OverrideResult(
                action="continue_with_modifications",
                state_modification=new_plan
            )
        
        elif decision == HITLDecision.REJECT:
            # User can optionally provide feedback
            feedback = modifications.get("feedback", "")
            
            return OverrideResult(
                action="abort",
                feedback=feedback,
                retry_allowed=True
            )
        
        elif decision == HITLDecision.LOCK_CONSTRAINT:
            # User can lock constraints like "Do NOT use code execution"
            constraint = modifications.get("constraint")
            
            return OverrideResult(
                action="continue_with_constraint",
                locked_constraints=[constraint]
            )
```

---

## 4. Multi-Phase Planning Pipeline

Enhanced from single ToT step to a **comprehensive 6-phase pipeline**.

### 4.1 Planning Phases

```yaml
planning_pipeline:
  phase_1_initial_draft:
    name: "Initial Plan Drafting"
    method: "chain_of_thought"
    inputs:
      - user_goal
      - context
      - constraints
    outputs:
      - candidate_plan
      - assumptions
      - open_questions
    max_duration: "10 seconds"
  
  phase_2_exploration:
    name: "Parallel Plan Exploration"
    method: "tree_of_thoughts"
    configuration:
      beam_width:
        simple_tasks: 3
        moderate_tasks: 5
        complex_tasks: 7
      evaluation_criteria:
        - feasibility
        - efficiency
        - risk
        - completeness
    outputs:
      - ranked_plan_candidates
      - exploration_tree
    max_duration: "30 seconds"
  
  phase_3_constraints:
    name: "Constraint Satisfaction"
    method: "constraint_solver"
    constraint_types:
      - regulatory_compliance
      - business_rules
      - resource_limits
      - time_constraints
      - safety_requirements
    outputs:
      - validated_plans
      - constraint_violations
      - required_modifications
    max_duration: "10 seconds"
  
  phase_4_feasibility:
    name: "Resource & Tool Feasibility"
    method: "resource_checker"
    checks:
      - tool_availability
      - api_quota_status
      - rate_limit_headroom
      - time_budget_fit
      - token_budget_fit
    outputs:
      - feasibility_scores
      - resource_allocation
      - fallback_options
    max_duration: "5 seconds"
  
  phase_5_risk_scoring:
    name: "Risk & Ambiguity Scoring"
    method: "risk_assessor"
    risk_dimensions:
      - regulatory_impact
      - data_sensitivity
      - irreversibility
      - downstream_effects
    ambiguity_detection:
      - unclear_requirements
      - missing_information
      - conflicting_constraints
    outputs:
      - risk_scores_per_step
      - ambiguity_flags
      - hitl_recommendations
    max_duration: "5 seconds"
  
  phase_6_compression:
    name: "Plan Compression"
    method: "plan_optimizer"
    optimizations:
      - merge_redundant_steps
      - parallelize_independent_steps
      - remove_unnecessary_validations
      - optimize_token_usage
    outputs:
      - optimized_plan
      - token_savings
      - execution_estimate
    max_duration: "5 seconds"
```

### 4.2 Planning State Schema

```python
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph

class PlanningState(TypedDict):
    # Input
    user_goal: str
    context: dict
    constraints: List[str]
    
    # Phase outputs
    initial_draft: Optional[Plan]
    exploration_tree: Optional[ExplorationTree]
    ranked_candidates: Optional[List[RankedPlan]]
    constraint_validation: Optional[ConstraintResult]
    feasibility_check: Optional[FeasibilityResult]
    risk_assessment: Optional[RiskAssessment]
    
    # Final output
    optimized_plan: Optional[Plan]
    execution_estimate: Optional[ExecutionEstimate]
    hitl_required: bool
    hitl_reason: Optional[str]

# Build planning graph
planning_graph = StateGraph(PlanningState)
planning_graph.add_node("draft", initial_draft_node)
planning_graph.add_node("explore", exploration_node)
planning_graph.add_node("validate", constraint_validation_node)
planning_graph.add_node("feasibility", feasibility_check_node)
planning_graph.add_node("risk", risk_assessment_node)
planning_graph.add_node("compress", compression_node)

# Linear flow with conditional HITL
planning_graph.add_edge("draft", "explore")
planning_graph.add_edge("explore", "validate")
planning_graph.add_edge("validate", "feasibility")
planning_graph.add_edge("feasibility", "risk")
planning_graph.add_conditional_edges(
    "risk",
    lambda s: "hitl" if s["hitl_required"] else "compress",
    {"hitl": "hitl_checkpoint", "compress": "compress"}
)
```

---

## 5. ReAct² Execution Loop

Upgraded ReAct with **verification at every step**.

### 5.1 ReAct² Cycle Definition

```yaml
react_squared:
  description: "ReAct with pre/post verification and uncertainty estimation"
  
  cycle_phases:
    1_precondition_check:
      purpose: "Verify state prerequisites before action"
      checks:
        - required_state_present
        - dependencies_satisfied
        - resources_available
        - no_blocking_constraints
      on_failure: "skip_to_replanning"
    
    2_reasoning:
      purpose: "Generate thought about current observation"
      prompt_template: |
        Given the current state and observation, reason about:
        1. What information do I have?
        2. What do I need to accomplish?
        3. What is the best next action?
        4. What could go wrong?
      output: "thought_trace"
    
    3_action:
      purpose: "Execute tool call or generate response"
      types:
        - tool_invocation
        - sub_agent_delegation
        - response_generation
        - state_modification
      requires_hitl_check: true
    
    4_observation:
      purpose: "Receive and parse action result"
      processing:
        - result_extraction
        - error_detection
        - format_normalization
        - relevance_scoring
    
    5_postcondition_verify:
      purpose: "Validate expected outcomes achieved"
      verifications:
        - expected_state_reached
        - no_side_effects
        - output_quality_check
        - consistency_with_plan
      on_failure: "retry_or_escalate"
    
    6_uncertainty_estimate:
      purpose: "Calculate confidence score for this step"
      factors:
        - reasoning_coherence
        - action_success
        - observation_clarity
        - verification_pass_rate
      output: "step_confidence: 0-1"
    
    7_checkpoint:
      purpose: "Store checkpoint for potential recovery"
      stored:
        - current_state
        - execution_trace
        - intermediate_results
        - rollback_instructions
```

### 5.2 ReAct² Implementation

```python
class ReactSquaredExecutor:
    """Execute ReAct² cycle with verification"""
    
    async def execute_cycle(
        self,
        state: ExecutionState,
        plan_step: PlanStep
    ) -> CycleResult:
        
        # Phase 1: Precondition Check
        preconditions = await self.check_preconditions(state, plan_step)
        if not preconditions.satisfied:
            return CycleResult(
                status="precondition_failed",
                reason=preconditions.failures,
                action="replan"
            )
        
        # Phase 2: Reasoning
        thought = await self.reason(state, plan_step)
        
        # Phase 3: Action (with HITL check)
        action = self.determine_action(thought, plan_step)
        
        if self.requires_hitl(action):
            hitl_decision = await self.request_hitl_approval(action)
            if hitl_decision.rejected:
                return CycleResult(
                    status="hitl_rejected",
                    feedback=hitl_decision.feedback
                )
            action = hitl_decision.potentially_modified_action
        
        action_result = await self.execute_action(action)
        
        # Phase 4: Observation
        observation = self.parse_observation(action_result)
        
        # Phase 5: Postcondition Verification
        verification = await self.verify_postconditions(
            state, plan_step, observation
        )
        
        if not verification.passed:
            if verification.retryable:
                return await self.retry_with_adjustment(
                    state, plan_step, verification.suggestions
                )
            else:
                return CycleResult(
                    status="verification_failed",
                    reason=verification.failures,
                    action="escalate"
                )
        
        # Phase 6: Uncertainty Estimation
        confidence = self.estimate_uncertainty(
            thought, action_result, verification
        )
        
        # Phase 7: Checkpoint
        checkpoint = await self.create_checkpoint(
            state, thought, action, observation, confidence
        )
        
        return CycleResult(
            status="success",
            observation=observation,
            confidence=confidence,
            checkpoint=checkpoint,
            new_state=state.with_updates(observation)
        )
```

---

## 6. Tool & Code Execution

### 6.1 Tool Registry

```yaml
tool_registry:
  rag_tools:
    rag_unified_service:
      description: "Unified RAG retrieval from vector database"
      requires_hitl: false
      tier: "all"
      parameters:
        query: "string"
        top_k: "integer (default: 5)"
        filters: "dict (optional)"
        rerank: "boolean (default: true)"
    
    web_search:
      description: "Web search with source verification"
      requires_hitl: false
      tier: "2+"
      parameters:
        query: "string"
        num_results: "integer (default: 10)"
        domains: "list (optional)"
  
  code_execution:
    python_sandbox:
      description: "Sandboxed Python execution"
      requires_hitl: true
      tier: "2+"
      sandbox:
        timeout: "30 seconds"
        memory_limit: "512MB"
        network: "disabled"
        filesystem: "read_only_workspace"
      allowed_packages:
        - pandas
        - numpy
        - scipy
        - matplotlib
        - seaborn
    
    r_executor:
      description: "R statistical analysis"
      requires_hitl: true
      tier: "3"
      sandbox:
        timeout: "60 seconds"
        packages: ["tidyverse", "ggplot2", "survival"]
    
    sas_executor:
      description: "SAS for regulatory submissions"
      requires_hitl: true
      tier: "3"
      compliance: "FDA_21_CFR_Part_11"
  
  database_tools:
    sql_agent:
      description: "SQL query execution"
      requires_hitl: "write_operations_only"
      tier: "2+"
      default_mode: "read_only"
      max_rows: 10000
    
    schema_inspector:
      description: "Database schema exploration"
      requires_hitl: false
      tier: "all"
```

### 6.2 Code Execution Safety

```yaml
code_execution_safety:
  pre_execution:
    static_analysis:
      - syntax_validation
      - import_whitelist_check
      - dangerous_pattern_detection
      - resource_usage_estimation
    
    llm_review:
      enabled: true
      prompt: "Review this code for safety issues..."
      model: "gpt-4-turbo"
  
  runtime_isolation:
    container: "gvisor"
    network: "none"
    filesystem: "overlay_readonly"
    syscalls: "restricted"
    capabilities: "none"
  
  post_execution:
    output_validation:
      - size_limits
      - format_validation
      - sensitive_data_scan
    
    result_verification:
      - reproducibility_check
      - sanity_bounds_check
```

---

## 7. LangGraph Integration

### 7.1 StateGraph Definition

```python
from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.memory import InMemoryStore
from langchain.agents.middleware import HumanInTheLoopMiddleware

class Mode3State(TypedDict):
    # User input
    message: str
    agent_id: str
    session_id: str
    tenant_id: str
    
    # Agent state
    selected_agent: Optional[AgentConfig]
    current_plan: Optional[Plan]
    execution_trace: List[ExecutionStep]
    
    # Memory
    episodic_checkpoints: List[str]
    semantic_context: List[MemoryItem]
    working_memory: dict
    
    # HITL
    hitl_pending: bool
    hitl_checkpoint_type: Optional[str]
    hitl_explanation: Optional[ExplanationPacket]
    
    # Output
    response: Optional[str]
    citations: List[Citation]
    confidence: float
    
    # Control
    autonomy_level: str
    error_state: Optional[ErrorState]

def create_mode3_graph():
    """Create the Mode 3 execution graph"""
    
    # Initialize stores
    checkpointer = AsyncPostgresSaver.from_conn_string(
        os.environ["POSTGRES_URI"]
    )
    
    memory_store = InMemoryStore(
        index={
            "embed": "openai:text-embedding-3-small",
            "dims": 1536
        }
    )
    
    # Build graph
    graph = StateGraph(Mode3State)
    
    # Add nodes
    graph.add_node("load_agent", load_agent_node)
    graph.add_node("assess_autonomy", autonomy_assessment_node)
    graph.add_node("plan", planning_pipeline_node)
    graph.add_node("hitl_plan", hitl_plan_checkpoint)
    graph.add_node("execute", react_squared_executor_node)
    graph.add_node("hitl_tool", hitl_tool_checkpoint)
    graph.add_node("hitl_subagent", hitl_subagent_checkpoint)
    graph.add_node("hitl_decision", hitl_decision_checkpoint)
    graph.add_node("validate", validation_node)
    graph.add_node("synthesize", synthesis_node)
    graph.add_node("hitl_final", hitl_final_checkpoint)
    graph.add_node("respond", response_node)
    
    # Add edges
    graph.add_edge(START, "load_agent")
    graph.add_edge("load_agent", "assess_autonomy")
    graph.add_edge("assess_autonomy", "plan")
    graph.add_conditional_edges(
        "plan",
        route_after_plan,
        {"hitl": "hitl_plan", "execute": "execute"}
    )
    graph.add_edge("hitl_plan", "execute")
    graph.add_conditional_edges(
        "execute",
        route_during_execution,
        {
            "tool_hitl": "hitl_tool",
            "subagent_hitl": "hitl_subagent",
            "decision_hitl": "hitl_decision",
            "continue": "execute",
            "validate": "validate"
        }
    )
    graph.add_edge("hitl_tool", "execute")
    graph.add_edge("hitl_subagent", "execute")
    graph.add_edge("hitl_decision", "execute")
    graph.add_edge("validate", "synthesize")
    graph.add_conditional_edges(
        "synthesize",
        route_after_synthesis,
        {"hitl": "hitl_final", "respond": "respond"}
    )
    graph.add_edge("hitl_final", "respond")
    graph.add_edge("respond", END)
    
    # Compile with middleware
    return graph.compile(
        checkpointer=checkpointer,
        store=memory_store,
        interrupt_before=["hitl_plan", "hitl_tool", "hitl_subagent", 
                         "hitl_decision", "hitl_final"]
    )
```

### 7.2 API Endpoint Integration

```python
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from langgraph.types import StreamMode

app = FastAPI()
mode3_graph = create_mode3_graph()

@app.post("/api/mode3/autonomous-manual")
async def mode3_endpoint(
    request: Mode3Request,
    user: User = Depends(get_current_user)
) -> StreamingResponse:
    """
    Mode 3: Manual Autonomous execution endpoint
    
    Streams SSE events for:
    - Planning progress
    - HITL approval requests
    - Execution progress
    - Tool calls
    - Final response
    """
    
    config = {
        "configurable": {
            "thread_id": request.session_id,
            "user_id": user.id,
            "tenant_id": request.tenant_id
        }
    }
    
    initial_state = {
        "message": request.message,
        "agent_id": request.agent_id,
        "session_id": request.session_id,
        "tenant_id": request.tenant_id,
        "hitl_pending": False,
        "execution_trace": [],
        "autonomy_level": request.hitl_safety_level
    }
    
    async def event_generator():
        async for event in mode3_graph.astream(
            initial_state,
            config=config,
            stream_mode=StreamMode.UPDATES
        ):
            yield format_sse_event(event)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

---

## 8. Security & Compliance

### 8.1 Healthcare Compliance

```yaml
compliance:
  hipaa:
    phi_handling:
      - encryption_at_rest: "AES-256"
      - encryption_in_transit: "TLS 1.3"
      - access_logging: "comprehensive"
      - minimum_necessary: "enforced"
    
    audit_requirements:
      - all_phi_access_logged
      - user_identity_verified
      - timestamp_immutable
      - retention_7_years
  
  fda_21_cfr_part_11:
    electronic_records:
      - audit_trail_required
      - electronic_signatures
      - system_validation
      - change_control
    
    electronic_signatures:
      - unique_to_individual
      - identity_verification
      - datetime_stamped
      - linked_to_record
  
  tenant_isolation:
    level: "complete"
    enforcement:
      - database_row_level_security
      - api_tenant_validation
      - model_context_isolation
      - vector_store_partitioning
```

### 8.2 Agent Security

```yaml
agent_security:
  prompt_injection_protection:
    input_sanitization: true
    instruction_hierarchy: "system > user"
    canary_tokens: true
  
  tool_permissions:
    per_agent_scoping: true
    least_privilege: "enforced"
    permission_escalation: "requires_hitl"
  
  audit_signatures:
    per_agent_signing: true
    execution_trace_hash: true
    tamper_detection: true
  
  data_governance:
    no_cross_tenant_leakage: "verified"
    no_cross_user_memory: "enforced"
    pii_detection: "automatic"
    sensitive_data_masking: "enabled"
```

---

## 9. Observability & Monitoring

### 9.1 Metrics

```yaml
observability:
  metrics:
    latency:
      - planning_duration_p50
      - planning_duration_p95
      - execution_duration_p50
      - execution_duration_p95
      - hitl_wait_time
      - total_response_time
    
    quality:
      - plan_optimality_score
      - execution_success_rate
      - validation_pass_rate
      - confidence_accuracy_correlation
    
    efficiency:
      - tokens_per_task
      - api_calls_per_task
      - cache_hit_rate
      - tool_reuse_rate
    
    safety:
      - hitl_trigger_rate
      - escalation_rate
      - anomaly_detection_rate
      - false_positive_rate
  
  dashboards:
    operational:
      - real_time_execution_status
      - hitl_queue_depth
      - error_rate_trends
      - agent_utilization
    
    quality:
      - confidence_distribution
      - validation_failure_analysis
      - user_satisfaction_trends
      - accuracy_by_domain
    
    cost:
      - token_consumption_by_agent
      - cost_per_task_type
      - efficiency_trends
      - budget_utilization
```

### 9.2 Tracing

```yaml
tracing:
  integration: "LangSmith"
  
  trace_points:
    - planning_start
    - planning_phase_complete
    - hitl_request
    - hitl_response
    - tool_invocation
    - tool_result
    - subagent_spawn
    - subagent_complete
    - validation_result
    - response_generation
  
  trace_metadata:
    - agent_id
    - session_id
    - tenant_id
    - user_id
    - autonomy_level
    - confidence_scores
    - token_counts
```

---

## 10. Performance Requirements

```yaml
performance:
  latency:
    planning_p50: "<15 seconds"
    planning_p95: "<30 seconds"
    execution_p50: "<45 seconds"
    execution_p95: "<90 seconds"
    total_p50: "<60 seconds"
    total_p95: "<120 seconds"
    hitl_prompt_latency: "<2 seconds"
  
  throughput:
    concurrent_sessions: "100+"
    requests_per_minute: "500+"
    agent_spawn_time: "<5 seconds"
  
  reliability:
    uptime: "99.9%"
    checkpoint_recovery: "100%"
    session_persistence: "24+ hours"
    error_recovery: "graceful_fallback"
  
  scalability:
    horizontal: "kubernetes_auto_scaling"
    database: "read_replicas"
    cache: "redis_cluster"
    vector_store: "sharded_pgvector"
```

---

## Appendix A: Golden Rules Compliance

| Rule | Implementation |
|------|----------------|
| Golden Rule #1 | LangGraph StateGraph for all workflow execution |
| Golden Rule #2 | Caching at all nodes (agent config, conversation, RAG) |
| Golden Rule #3 | Tenant isolation enforced at every layer (RLS, API, context) |
| Golden Rule #4 | RAG/Tools enabled by default with HITL approval |
| Golden Rule #5 | Evidence-based responses with citation requirements |

---

## Appendix B: Research References

1. **Fundamentals of Building Autonomous LLM Agents** (Oct 2025) - Architecture patterns for perception, reasoning, memory, and execution systems
2. **DeepAgent: A General Reasoning Agent with Scalable Toolsets** (Oct 2025) - Autonomous memory folding and ToolPO reinforcement learning
3. **The Era of Agentic Organization: AsyncThink** (Oct 2025) - Asynchronous thinking with organizer-worker paradigm
4. **Agents Thinking Fast and Slow: Talker-Reasoner Architecture** (Oct 2024) - Dual-system cognitive architecture
5. **SFR-DeepResearch** (Sep 2025) - Reinforcement learning for autonomous reasoning agents
6. **LangGraph Deep Agents** - Planning, subagents, and file systems for complex tasks
7. **LangChain v1 Supervisor Pattern** - Multi-agent coordination with HITL middleware
