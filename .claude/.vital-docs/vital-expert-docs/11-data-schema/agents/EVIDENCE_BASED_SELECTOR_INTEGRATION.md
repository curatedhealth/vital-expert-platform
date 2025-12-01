# Evidence-Based Agent Selector - Integration Guide

## Overview

The `EvidenceBasedAgentSelector` is a unified agent selection service that works across **all 4 VITAL services**:

1. **Ask Expert** - Single agent for user queries
2. **Ask Panel** - Multiple agents for panel discussions
3. **Workflows** - Agents for workflow steps
4. **Solution Builder** - Agents for solution components

---

## Architecture

```
EvidenceBasedAgentSelector
├── Extends: GraphRAGSelector (30/50/20 hybrid search)
├── Adds: Evidence-based tier assessment (Tier 1/2/3)
├── Adds: 8-factor scoring matrix
├── Adds: Safety gates & escalation
└── Service-agnostic design
```

### Key Features

- **Evidence-Based Tiers**: Automatic tier determination based on query complexity, risk, and accuracy requirements
- **8-Factor Scoring**: Comprehensive agent evaluation beyond simple semantic similarity
- **Safety Gates**: Mandatory escalation triggers, confidence thresholds, human oversight
- **Service-Agnostic**: Works seamlessly across all 4 VITAL services
- **Production-Ready**: Comprehensive error handling, logging, and monitoring

---

## Usage Examples

### 1. Ask Expert (Single Agent)

```python
from services.evidence_based_selector import (
    get_evidence_based_selector,
    VitalService
)

selector = get_evidence_based_selector()

result = await selector.select_for_service(
    service=VitalService.ASK_EXPERT,
    query="What are FDA 510(k) requirements?",
    context={},
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    user_id="user-123",
    session_id="session-456",
    max_agents=1
)

print(f"Selected Agent: {result.agents[0].agent_name}")
print(f"Tier: {result.tier.value}")
print(f"Confidence: {result.agents[0].confidence_score}")
print(f"Reason: {result.agents[0].recommendation_reason}")

# Check safety requirements
if result.requires_human_oversight:
    print("⚠️ Human oversight required")
if result.requires_critic:
    print("⚠️ Critic required")
```

### 2. Ask Panel (Multiple Agents)

```python
result = await selector.select_for_service(
    service=VitalService.ASK_PANEL,
    query="Complex clinical question requiring expert panel",
    context={},
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    user_id="user-123",
    session_id="session-456",
    max_agents=5
)

print(f"Panel Size: {len(result.agents)}")
for agent in result.agents:
    print(f"  - {agent.agent_name} (confidence: {agent.confidence_score})")

# Check if panel meets requirements
if result.requires_panel and len(result.agents) < 3:
    print("⚠️ Warning: Panel size below recommended (3+)")
```

### 3. Workflows (Variable Agents)

```python
result = await selector.select_for_service(
    service=VitalService.WORKFLOWS,
    query="Execute clinical trial protocol review workflow",
    context={
        "workflow_id": "workflow-789",
        "step_name": "protocol_review"
    },
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    max_agents=3
)

# Use agents for workflow step execution
for agent in result.agents:
    print(f"Assigned Agent: {agent.agent_name}")
```

### 4. Solution Builder (Complementary Agents)

```python
result = await selector.select_for_service(
    service=VitalService.SOLUTION_BUILDER,
    query="Build regulatory submission solution",
    context={
        "solution_type": "regulatory_submission",
        "components": ["planning", "authoring", "review", "submission"]
    },
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    max_agents=4
)

# Agents are selected to be complementary
for agent in result.agents:
    print(f"{agent.agent_name}: {agent.recommendation_reason}")
```

---

## Integration with Existing Services

### Ask Expert Service (`ask_expert.py`)

**Before**:
```python
from services.agent_selector_service import get_agent_selector_service

selector = get_agent_selector_service()
analysis = await selector.analyze_query(query)
# ... manual agent selection logic
```

**After**:
```python
from services.evidence_based_selector import (
    get_evidence_based_selector,
    VitalService
)

selector = get_evidence_based_selector()
result = await selector.select_for_service(
    service=VitalService.ASK_EXPERT,
    query=request.query,
    context=request.context,
    tenant_id=request.tenant_id,
    user_id=request.user_id,
    session_id=session_id,
    max_agents=1
)

# Use result.agents[0] for the selected agent
agent = result.agents[0]
tier = result.tier
requires_human_oversight = result.requires_human_oversight
```

### Ask Panel Service (`panel_service.py`)

**Before**:
```python
# Manual agent selection for panel
panel_agents = await self._select_panel_agents(query, panel_size)
```

**After**:
```python
from services.evidence_based_selector import (
    get_evidence_based_selector,
    VitalService
)

selector = get_evidence_based_selector()
result = await selector.select_for_service(
    service=VitalService.ASK_PANEL,
    query=query,
    context=context,
    tenant_id=tenant_id,
    user_id=user_id,
    session_id=session_id,
    max_agents=panel_size
)

panel_agents = result.agents
panel_requires_human_oversight = result.requires_human_oversight
```

### Workflows Service

```python
from services.evidence_based_selector import (
    get_evidence_based_selector,
    VitalService
)

# For each workflow step
selector = get_evidence_based_selector()
result = await selector.select_for_service(
    service=VitalService.WORKFLOWS,
    query=step.description,
    context={
        "workflow_id": workflow.id,
        "step_name": step.name,
        "step_type": step.type
    },
    tenant_id=tenant_id,
    max_agents=step.required_agents
)

# Assign agents to workflow step
step.assigned_agents = [a.agent_id for a in result.agents]
```

### Solution Builder Service

```python
from services.evidence_based_selector import (
    get_evidence_based_selector,
    VitalService
)

# For each solution component
selector = get_evidence_based_selector()
result = await selector.select_for_service(
    service=VitalService.SOLUTION_BUILDER,
    query=component.description,
    context={
        "solution_id": solution.id,
        "component_name": component.name,
        "required_capabilities": component.capabilities
    },
    tenant_id=tenant_id,
    max_agents=component.required_agents
)

# Assign agents to solution component
component.assigned_agents = result.agents
```

---

## Tier Definitions

### Tier 1: Rapid Response

- **Target Accuracy**: 85-92%
- **Max Response Time**: 5 seconds
- **Cost**: $0.10/query
- **Use Cases**: Simple factual questions, definitions, routine inquiries
- **Requirements**: None (no human oversight, no panel, no critic)

### Tier 2: Expert Analysis

- **Target Accuracy**: 90-96%
- **Max Response Time**: 30 seconds
- **Cost**: $0.50/query
- **Use Cases**: Complex analysis, multi-step reasoning, comparisons
- **Requirements**: Optional panel

### Tier 3: Deep Reasoning + Human Oversight

- **Target Accuracy**: 94-98%
- **Max Response Time**: 120 seconds
- **Cost**: $2.00/query
- **Use Cases**: Critical decisions, high-risk queries, regulatory compliance
- **Requirements**: **Mandatory** human oversight, panel (3+ agents), critic

### Mandatory Tier 3 Triggers

The following triggers **automatically escalate** to Tier 3:

- `diagnosis_change` - Changes to patient diagnosis
- `treatment_modification` - Modifications to treatment plans
- `emergency_symptoms` - Emergency or urgent symptoms
- `pediatric_case` - Pediatric patient cases
- `pregnancy_case` - Pregnancy-related cases
- `psychiatric_crisis` - Psychiatric emergencies
- `regulatory_compliance` - Regulatory compliance questions
- `safety_concern` - Safety-related concerns

---

## 8-Factor Scoring Matrix

| Factor | Weight | Source | Description |
|--------|--------|--------|-------------|
| **Semantic Similarity** | 30% | Pinecone | Vector embedding match |
| **Domain Expertise** | 25% | Agent Metadata | Specialty alignment |
| **Historical Performance** | 15% | Agent Metrics | Success rate, avg rating |
| **Keyword Relevance** | 10% | Postgres FTS | Keyword match |
| **Graph Proximity** | 10% | Neo4j | Knowledge graph relationships |
| **User Preference** | 5% | User History | Past agent interactions |
| **Availability** | 3% | Agent Metrics | Current load |
| **Tier Compatibility** | 2% | Agent Level | Match with required tier |

---

## Safety Gates

Safety gates are **automatically applied** based on tier and assessment:

1. **Confidence Threshold Gate**
   - Tier 1: 0.75 minimum
   - Tier 2: 0.80 minimum
   - Tier 3: 0.90 minimum

2. **Escalation Trigger Gate**
   - Detects mandatory escalation triggers
   - Forces Tier 3 requirements

3. **Human Oversight Gate**
   - Tier 3 only
   - Requires human review before final response

4. **Panel Size Gate**
   - Tier 3: Minimum 3 agents required
   - Warns if panel size insufficient

5. **Critic Gate**
   - Tier 3 only
   - Requires critic agent for response validation

---

## Response Structure

```python
class EvidenceBasedSelection:
    service: VitalService  # Service that requested selection
    agents: List[AgentScore]  # Selected agents (sorted by score)
    tier: AgentTier  # Determined tier (TIER_1, TIER_2, TIER_3)
    assessment: QueryAssessment  # Full query assessment
    requires_human_oversight: bool
    requires_panel: bool
    requires_critic: bool
    safety_gates_applied: List[str]  # List of applied safety gates
    selection_metadata: Dict[str, Any]  # Operation metadata
```

### Agent Score Details

```python
class AgentScore:
    agent_id: str
    agent_name: str
    agent_type: str
    agent_level: Optional[int]
    
    # 8-factor scores (0-1 scale)
    semantic_similarity: float
    domain_expertise: float
    historical_performance: float
    keyword_relevance: float
    graph_proximity: float
    user_preference: float
    availability: float
    tier_compatibility: float
    
    # Weighted total
    total_score: float
    confidence_score: float
    
    # Metadata
    recommendation_reason: str
    tier_match: str
    can_delegate_to: List[str]
```

---

## Error Handling

The selector has comprehensive error handling with fallbacks:

1. **LLM Assessment Failure**: Falls back to rule-based assessment
2. **GraphRAG Search Failure**: Returns gracefully with error logged
3. **Database Query Failure**: Uses cached/default values
4. **Scoring Failure**: Skips failed agent, continues with others

All errors are logged with structured logging for monitoring.

---

## Monitoring & Analytics

Every selection is logged to `agent_selection_history` table:

```sql
{
  tenant_id: UUID,
  user_id: UUID,
  session_id: UUID,
  service: TEXT,
  tier: TEXT,
  agents_selected: UUID[],
  query_complexity: TEXT,
  query_risk_level: TEXT,
  escalation_triggers: TEXT[],
  safety_gates_applied: TEXT[],
  requires_human_oversight: BOOLEAN,
  metadata: JSONB,
  created_at: TIMESTAMP
}
```

This enables:
- **Performance tracking** per service
- **Tier distribution analysis**
- **Safety gate metrics**
- **Agent selection patterns**
- **ML training data collection**

---

## Testing

Run comprehensive test suite:

```bash
cd services/ai-engine
pytest tests/services/test_evidence_based_selector.py -v
```

Test coverage:
- ✅ Tier determination (all scenarios)
- ✅ 8-factor scoring
- ✅ Safety gates
- ✅ Service-specific constraints
- ✅ Integration flow
- ✅ Error handling
- ✅ Performance benchmarks

---

## Migration from Existing Selectors

### Deprecation Plan

| Old Selector | Status | Migration Path |
|--------------|--------|----------------|
| `AgentSelectorService` | **Keep for query analysis only** | Use `_assess_query()` from Evidence-Based Selector |
| `EnhancedAgentSelector` | **Deprecate** | Replace with `EvidenceBasedAgentSelector` |
| `GraphRAGSelector` | **Extended** | Now inherited by `EvidenceBasedAgentSelector` |
| `MedicalAffairsAgentSelector` | **Keep for MA-specific** | Use for 165 MA agents only |

### Migration Steps

1. **Update imports** in all 4 services
2. **Replace selector instantiation** with `get_evidence_based_selector()`
3. **Update method calls** to `select_for_service()`
4. **Handle new response structure** (`EvidenceBasedSelection`)
5. **Implement safety gate checks** (human oversight, critic, panel)
6. **Test thoroughly** with existing queries

---

## Performance Targets

| Metric | Target | Current (with mocks) |
|--------|--------|---------------------|
| **Selection Latency** | < 500ms | ~200ms |
| **GraphRAG Latency** | < 450ms (P95) | ~300ms |
| **LLM Assessment** | < 2s | ~1s |
| **8-Factor Scoring** | < 100ms | ~50ms |
| **Safety Gates** | < 50ms | ~20ms |
| **Total (end-to-end)** | < 3s | ~1.5s |

---

## Best Practices

1. **Always use `select_for_service()`** - Don't bypass the unified interface
2. **Respect tier requirements** - Enforce human oversight, panel, critic as required
3. **Log all selections** - Analytics are critical for ML training
4. **Monitor safety gates** - Track escalation rate and gate effectiveness
5. **Handle low confidence** - Always check `confidence_score` and provide fallback
6. **Cache user preferences** - Improve user preference scoring over time

---

## Support & Documentation

- **Source**: `services/ai-engine/src/services/evidence_based_selector.py`
- **Tests**: `services/ai-engine/tests/services/test_evidence_based_selector.py`
- **Integration Guide**: This document
- **ARD**: `.vital-docs/vital-expert-docs/03-architecture/ARD_v2.0.md`
- **AgentOS 3.0 Roadmap**: `.vital-docs/vital-expert-docs/11-data-schema/agents/AGENTOS_3.0_IMPLEMENTATION_ROADMAP.md`

For questions or issues, see structured logs or contact the AI Engine team.

