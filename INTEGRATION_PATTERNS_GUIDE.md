# AgentOS 3.0 - Integration Patterns Guide

**Version**: 1.0  
**Date**: November 23, 2025  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Integration Patterns](#core-integration-patterns)
3. [API Integration](#api-integration)
4. [Monitoring Integration](#monitoring-integration)
5. [Database Integration](#database-integration)
6. [Frontend Integration](#frontend-integration)
7. [Testing Patterns](#testing-patterns)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

AgentOS 3.0 follows a **microservices architecture** with **event-driven patterns** and **comprehensive monitoring**. This guide provides integration patterns for all major components.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│              ModeSelector │ HITLControls │ StatusIndicators     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      API Layer (FastAPI)                         │
│  Ask Expert │ GraphRAG │ Panels │ Critic │ Planner             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     Core Services Layer                          │
│  Evidence-Based Selector │ GraphRAG Service │ Graph Compiler   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Monitoring & Safety Layer                     │
│  Clinical Monitor │ Fairness Monitor │ Drift Detector          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        Data Layer                                │
│  PostgreSQL │ Neo4j │ Pinecone │ Elasticsearch                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Core Integration Patterns

### Pattern 1: Service Orchestration

**Use Case**: Executing the complete AgentOS workflow

**Implementation**:

```python
from services.evidence_based_selector import EvidenceBasedAgentSelector
from graphrag.service import GraphRAGService
from langgraph_workflows.graph_compiler import AgentGraphCompiler
from monitoring.clinical_monitor import ClinicalAIMonitor

async def execute_agentos_workflow(
    query: str,
    tenant_id: str,
    session_id: str,
    is_automatic: bool,
    is_autonomous: bool
) -> Dict[str, Any]:
    """
    Complete AgentOS 3.0 workflow
    """
    
    # Step 1: Evidence-based agent selection
    selector = EvidenceBasedAgentSelector(db_session)
    selection_result = await selector.select_agents(
        query=query,
        context={'tenant_id': tenant_id},
        tier_preference=None  # Auto-determine tier
    )
    
    # Step 2: GraphRAG context retrieval
    graphrag = GraphRAGService()
    rag_result = await graphrag.query(
        query=query,
        agent_id=selection_result.selected_agents[0].agent_id,
        session_id=session_id
    )
    
    # Step 3: Agent graph compilation
    compiler = AgentGraphCompiler(db_session)
    compiled_graph = await compiler.compile_graph(
        graph_id=selection_result.selected_agents[0].primary_graph_id,
        tenant_id=tenant_id
    )
    
    # Step 4: LangGraph execution
    initial_state = {
        'query': query,
        'context': rag_result.context_chunks,
        'evidence_chain': rag_result.evidence_chain,
        'session_id': session_id
    }
    
    result = await compiled_graph.compiled_graph.ainvoke(
        initial_state,
        config={'configurable': {'thread_id': session_id}}
    )
    
    # Step 5: Monitoring
    monitor = ClinicalAIMonitor(db_session)
    await monitor.log_interaction(
        tenant_id=tenant_id,
        session_id=session_id,
        agent_id=selection_result.selected_agents[0].agent_id,
        service_type='ask_expert',
        query=query,
        response=result['response'],
        confidence_score=result['confidence_score'],
        tier=selection_result.tier,
        # ... additional fields
    )
    
    return {
        'response': result['response'],
        'confidence_score': result['confidence_score'],
        'evidence_chain': rag_result.evidence_chain,
        'citations': result['citations']
    }
```

**Key Points**:
- Each step is async for performance
- Error handling at each stage
- Monitoring always logs (even on failure)
- State passed through workflow

---

### Pattern 2: GraphRAG Integration

**Use Case**: Retrieving hybrid search context with evidence chains

**Implementation**:

```python
from graphrag.service import GraphRAGService
from graphrag.models import GraphRAGRequest

async def get_enriched_context(
    query: str,
    agent_id: str,
    session_id: str,
    tenant_id: str
) -> Dict[str, Any]:
    """
    Get hybrid search context with evidence chains
    """
    
    # Initialize GraphRAG service
    graphrag = GraphRAGService()
    
    # Execute hybrid search
    request = GraphRAGRequest(
        query=query,
        agent_id=agent_id,
        session_id=session_id,
        tenant_id=tenant_id,
        include_graph_evidence=True,
        top_k=5,
        min_score=0.7
    )
    
    response = await graphrag.query(request)
    
    return {
        'context_chunks': response.context_chunks,
        'evidence_chain': response.evidence_chain,
        'citations': response.citations,
        'fusion_scores': {
            'vector': response.vector_weight,
            'keyword': response.keyword_weight,
            'graph': response.graph_weight
        }
    }
```

**RAG Profile Override**:

```python
# Use specific RAG profile for agent
request = GraphRAGRequest(
    query=query,
    agent_id=agent_id,
    rag_profile_id=custom_profile_id,  # Override default
    include_graph_evidence=True
)
```

---

### Pattern 3: Evidence-Based Selection

**Use Case**: Intelligent agent selection with 8-factor scoring

**Implementation**:

```python
from services.evidence_based_selector import EvidenceBasedAgentSelector

async def select_best_agent(
    query: str,
    context: Dict[str, Any],
    tenant_id: str
) -> AgentScore:
    """
    Select best agent using 8-factor scoring
    """
    
    selector = EvidenceBasedAgentSelector(db_session)
    
    # Execute selection
    result = await selector.select_agents(
        query=query,
        context=context,
        tier_preference=None,  # Auto-determine
        top_n=1
    )
    
    # Get selected agent
    selected = result.selected_agents[0]
    
    print(f"Selected: {selected.agent_name}")
    print(f"Tier: {result.tier}")
    print(f"Total Score: {selected.total_score}")
    print(f"Factors:")
    print(f"  - Semantic: {selected.semantic_similarity}")
    print(f"  - Domain: {selected.domain_expertise}")
    print(f"  - Performance: {selected.historical_performance}")
    print(f"  - Graph: {selected.graph_proximity}")
    
    return selected
```

**Tier Override**:

```python
# Force specific tier
result = await selector.select_agents(
    query=query,
    context=context,
    tier_preference='tier_3',  # Force Deep Reasoning
    top_n=3
)
```

---

### Pattern 4: Agent Graph Compilation

**Use Case**: Compiling database-defined graphs into LangGraph workflows

**Implementation**:

```python
from langgraph_workflows.graph_compiler import AgentGraphCompiler

async def compile_and_execute_graph(
    graph_id: str,
    tenant_id: str,
    initial_state: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compile graph from database and execute
    """
    
    # Initialize compiler
    compiler = AgentGraphCompiler(db_session)
    
    # Compile graph
    compiled = await compiler.compile_graph(
        graph_id=graph_id,
        tenant_id=tenant_id
    )
    
    print(f"Graph: {compiled.graph_name}")
    print(f"Nodes: {compiled.node_count}")
    print(f"Edges: {compiled.edge_count}")
    
    # Execute with checkpointer (for resumption)
    config = {
        'configurable': {
            'thread_id': initial_state['session_id']
        }
    }
    
    result = await compiled.compiled_graph.ainvoke(
        initial_state,
        config=config
    )
    
    return result
```

**Resume from Checkpoint**:

```python
# Resume interrupted workflow
result = await compiled.compiled_graph.ainvoke(
    None,  # State loaded from checkpoint
    config={'configurable': {'thread_id': existing_session_id}}
)
```

---

### Pattern 5: Clinical Monitoring

**Use Case**: Logging all interactions for compliance and analytics

**Implementation**:

```python
from monitoring.clinical_monitor import ClinicalAIMonitor
from monitoring.models import ServiceType, TierType
from decimal import Decimal

async def log_agent_interaction(
    tenant_id: str,
    session_id: str,
    agent_id: str,
    query: str,
    response: str,
    confidence_score: float,
    execution_time_ms: int,
    tier: str
) -> str:
    """
    Log interaction with clinical-grade monitoring
    """
    
    monitor = ClinicalAIMonitor(db_session)
    
    # Log interaction
    interaction_id = await monitor.log_interaction(
        tenant_id=tenant_id,
        session_id=session_id,
        agent_id=agent_id,
        service_type=ServiceType.ASK_EXPERT,
        query=query,
        response=response,
        confidence_score=Decimal(str(confidence_score)),
        execution_time_ms=execution_time_ms,
        tier=TierType(tier),
        was_successful=True,
        tokens_used=450,
        cost_usd=Decimal('0.05'),
        # Demographics (optional, for fairness monitoring)
        user_age_group='30-50',
        user_gender='female',
        user_region='northeast'
    )
    
    return interaction_id
```

**Calculate Diagnostic Metrics**:

```python
from monitoring.models import MetricPeriod
from datetime import date

# Calculate daily metrics
metrics = await monitor.calculate_diagnostic_metrics(
    agent_id=agent_id,
    period=MetricPeriod.DAILY,
    period_start=date.today(),
    period_end=date.today(),
    total_interactions=100,
    true_positives=85,
    true_negatives=10,
    false_positives=2,
    false_negatives=3
)

print(f"Sensitivity: {metrics.sensitivity:.2%}")
print(f"Specificity: {metrics.specificity:.2%}")
print(f"F1 Score: {metrics.f1_score:.2%}")
print(f"Accuracy: {metrics.accuracy:.2%}")
```

---

### Pattern 6: Fairness Monitoring

**Use Case**: Detecting bias across demographics

**Implementation**:

```python
from monitoring.fairness_monitor import FairnessMonitor
from monitoring.models import ProtectedAttribute
from decimal import Decimal

async def monitor_fairness(
    agent_id: str,
    metric_date: date
) -> Dict[str, Any]:
    """
    Monitor fairness across demographics
    """
    
    monitor = FairnessMonitor(db_session)
    
    # Calculate fairness metrics for age group
    metrics = await monitor.calculate_fairness_metrics(
        agent_id=agent_id,
        metric_date=metric_date,
        protected_attribute=ProtectedAttribute.AGE_GROUP,
        attribute_value='30-50',
        total_interactions=100,
        successful_interactions=85,
        avg_confidence=Decimal('0.88'),
        avg_response_time_ms=1500,
        escalation_rate=Decimal('0.12')
    )
    
    # Check for bias
    bias_detected = await monitor.detect_bias(
        agent_id=agent_id,
        protected_attribute=ProtectedAttribute.GENDER,
        threshold=Decimal('0.1'),  # 10% demographic parity threshold
        days=30
    )
    
    if bias_detected:
        print("⚠️ BIAS DETECTED - Review required!")
    
    return {
        'success_rate': metrics.success_rate,
        'demographic_parity': metrics.demographic_parity,
        'equal_opportunity': metrics.equal_opportunity,
        'bias_detected': bias_detected
    }
```

---

### Pattern 7: Drift Detection

**Use Case**: Proactively detecting performance degradation

**Implementation**:

```python
from monitoring.drift_detector import DriftDetector
from monitoring.models import AlertType, AlertSeverity
from decimal import Decimal

async def detect_performance_drift(
    agent_id: str
) -> List[Dict[str, Any]]:
    """
    Detect accuracy, latency, cost, and confidence drift
    """
    
    detector = DriftDetector(db_session)
    
    # Check accuracy drift
    accuracy_drift = await detector.detect_accuracy_drift(
        agent_id=agent_id,
        baseline_window_days=30,
        current_window_days=7,
        significance_level=0.05
    )
    
    if accuracy_drift:
        # Create alert
        await detector.create_alert(
            agent_id=agent_id,
            alert_type=AlertType.ACCURACY_DROP,
            severity=AlertSeverity.HIGH,
            metric_name='accuracy',
            baseline_value=Decimal('0.92'),
            current_value=Decimal('0.87'),
            drift_magnitude=Decimal('0.05'),
            drift_percentage=Decimal('5.43'),
            test_name='two_prop_z_test',
            p_value=Decimal('0.032'),
            is_significant=True,
            detection_window_days=7,
            affected_interactions=150
        )
    
    # Get all active alerts
    alerts = await detector.get_active_alerts(agent_id=agent_id)
    
    return alerts
```

---

### Pattern 8: Prometheus Metrics

**Use Case**: Real-time metrics export

**Implementation**:

```python
from monitoring.prometheus_metrics import metrics_recorder

# Record request
metrics_recorder.record_request(
    service_type='ask_expert',
    tier='tier_2',
    success=True
)

# Record latency
metrics_recorder.record_latency(
    service_type='ask_expert',
    tier='tier_2',
    latency_seconds=1.25
)

# Record quality
metrics_recorder.record_quality(
    service_type='ask_expert',
    tier='tier_2',
    confidence=0.92,
    has_evidence=True
)

# Record cost
metrics_recorder.record_cost(
    service_type='ask_expert',
    tier='tier_2',
    cost_usd=0.05
)
```

---

## 🔥 Best Practices

### 1. Always Use Async/Await
```python
# ✅ Good
async def execute_workflow(query: str) -> Dict[str, Any]:
    result = await selector.select_agents(query)
    return result

# ❌ Bad
def execute_workflow(query: str) -> Dict[str, Any]:
    result = selector.select_agents(query)  # Blocking!
    return result
```

### 2. Always Log to Monitoring
```python
# ✅ Good - Log even on error
try:
    result = await execute_workflow(query)
    await monitor.log_interaction(..., was_successful=True)
except Exception as e:
    await monitor.log_interaction(..., was_successful=False)
    raise
```

### 3. Use Type Hints
```python
# ✅ Good
async def select_agents(
    query: str,
    tenant_id: str
) -> AgentScore:
    ...

# ❌ Bad
async def select_agents(query, tenant_id):
    ...
```

### 4. Handle Errors Gracefully
```python
# ✅ Good
try:
    result = await graphrag.query(request)
except GraphRAGError as e:
    logger.error("graphrag_failed", error=str(e))
    # Fallback to simpler search
    result = await fallback_search(query)
```

### 5. Use Structured Logging
```python
# ✅ Good
logger.info(
    "agent_selected",
    agent_id=str(agent_id),
    score=score,
    tier=tier
)

# ❌ Bad
print(f"Selected agent {agent_id} with score {score}")
```

---

## 📚 Complete Example: End-to-End Integration

```python
async def complete_agentos_integration_example():
    """
    Complete end-to-end integration showing all patterns
    """
    
    # 1. Initialize components
    selector = EvidenceBasedAgentSelector(db_session)
    graphrag = GraphRAGService()
    compiler = AgentGraphCompiler(db_session)
    monitor = ClinicalAIMonitor(db_session)
    
    # 2. User query
    query = "What are the side effects of metformin?"
    tenant_id = str(uuid4())
    session_id = str(uuid4())
    
    # 3. Evidence-based selection
    selection = await selector.select_agents(
        query=query,
        context={'tenant_id': tenant_id}
    )
    
    # 4. GraphRAG context
    rag_result = await graphrag.query(
        GraphRAGRequest(
            query=query,
            agent_id=selection.selected_agents[0].agent_id,
            session_id=session_id,
            tenant_id=tenant_id
        )
    )
    
    # 5. Compile graph
    compiled = await compiler.compile_graph(
        graph_id=selection.selected_agents[0].primary_graph_id,
        tenant_id=tenant_id
    )
    
    # 6. Execute workflow
    result = await compiled.compiled_graph.ainvoke({
        'query': query,
        'context': rag_result.context_chunks,
        'evidence_chain': rag_result.evidence_chain
    })
    
    # 7. Log for monitoring
    await monitor.log_interaction(
        tenant_id=tenant_id,
        session_id=session_id,
        agent_id=selection.selected_agents[0].agent_id,
        service_type=ServiceType.ASK_EXPERT,
        query=query,
        response=result['response'],
        confidence_score=result['confidence_score'],
        tier=selection.tier,
        was_successful=True
    )
    
    # 8. Record Prometheus metrics
    metrics_recorder.record_request('ask_expert', selection.tier, True)
    metrics_recorder.record_quality('ask_expert', selection.tier, 
                                    result['confidence_score'], True)
    
    return {
        'response': result['response'],
        'confidence': result['confidence_score'],
        'tier': selection.tier,
        'evidence': rag_result.evidence_chain
    }
```

---

## 🎯 Summary

AgentOS 3.0 provides **8 core integration patterns** covering:
1. ✅ Service Orchestration
2. ✅ GraphRAG Integration
3. ✅ Evidence-Based Selection
4. ✅ Agent Graph Compilation
5. ✅ Clinical Monitoring
6. ✅ Fairness Monitoring
7. ✅ Drift Detection
8. ✅ Prometheus Metrics

**All patterns are production-ready** and follow best practices for:
- Async/await
- Error handling
- Structured logging
- Type safety
- Monitoring

---

**Next Steps**:
1. Review patterns for your use case
2. Implement using provided code examples
3. Test with provided integration test
4. Monitor using Grafana dashboards

For production deployment, see: `PRODUCTION_DEPLOYMENT_GUIDE.md`

