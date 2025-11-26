# Workflow Enhancement Implementation Guide
## HIPAA/GDPR Compliance + Deep Agent Architecture + Human-in-Loop

**Date:** November 17, 2025
**Status:** IMPLEMENTATION READY
**Purpose:** Step-by-step guide to enhance all 4 workflows with compliance, safety, and deep agents

---

## 🎯 Overview

This guide implements the following enhancements across ALL 4 MODE workflows:

1. ✅ **HIPAA/GDPR Compliance** - PHI/PII protection, audit trails, de-identification
2. ✅ **Human-in-Loop Validation** - Safety checks for critical decisions
3. ✅ **Enhanced Deep Agent Architecture** - Prominent multi-level agent hierarchy
4. ✅ **Performance Monitoring** - Latency, cost, and accuracy tracking

---

## 📦 Prerequisites

### New Service Created

File: `services/ai-engine/src/services/compliance_service.py`

Contains:
- `ComplianceService` - HIPAA/GDPR data protection
- `HumanInLoopValidator` - Safety validation logic
- `ComplianceRegime` - Enum for HIPAA/GDPR/BOTH
- `DataClassification` - Data sensitivity levels

---

## 🔧 Implementation Steps

### Step 1: Update Imports (All 4 Workflows)

Add to imports section in all 4 mode files:

```python
# Add these imports to mode1_manual_query.py, mode2_auto_query.py,
# mode3_manual_chat_autonomous.py, mode4_auto_chat_autonomous.py

from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification
)
from datetime import datetime
import time
```

---

### Step 2: Update `__init__` Method (All 4 Workflows)

**Current (example from Mode 1):**
```python
def __init__(
    self,
    supabase_client,
    rag_pipeline=None,
    agent_orchestrator=None,
    sub_agent_spawner=None,
    rag_service=None,
    tool_registry=None,
    confidence_calculator=None
):
```

**Enhanced:**
```python
def __init__(
    self,
    supabase_client,
    rag_pipeline=None,
    agent_orchestrator=None,
    sub_agent_spawner=None,
    rag_service=None,
    tool_registry=None,
    confidence_calculator=None,
    compliance_service=None,  # NEW
    human_validator=None      # NEW
):
    # ... existing initialization ...

    # Initialize compliance & safety services (NEW)
    self.compliance_service = compliance_service or ComplianceService(supabase_client)
    self.human_validator = human_validator or HumanInLoopValidator()

    logger.info("✅ Workflow initialized with HIPAA/GDPR compliance and safety validation")
```

---

### Step 3: Add Compliance Protection Node (All 4 Workflows)

Add this new node to each workflow class:

```python
@trace_node("compliance_protection")
async def protect_sensitive_data_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Protect sensitive data (HIPAA/GDPR compliance)

    De-identifies PHI/PII before processing
    Logs access for audit trail
    Ensures compliance with both HIPAA and GDPR
    """
    query = state['query']
    tenant_id = state['tenant_id']
    user_id = state.get('user_id', 'unknown')

    try:
        # Protect sensitive data
        protected_query, audit_id = await self.compliance_service.protect_data(
            data=query,
            regime=ComplianceRegime.BOTH,  # Both HIPAA and GDPR
            tenant_id=tenant_id,
            user_id=user_id,
            purpose="ai_expert_consultation"
        )

        logger.info(
            "Data protected (HIPAA/GDPR)",
            audit_id=audit_id,
            tenant_id=tenant_id
        )

        return {
            **state,
            'query': protected_query,  # Use protected version
            'original_query': query,   # Keep original for re-identification
            'compliance_audit_id': audit_id,
            'data_protected': True,
            'current_node': 'protect_sensitive_data'
        }

    except Exception as e:
        logger.error("Data protection failed", error=str(e))
        # Continue with original query but log the failure
        return {
            **state,
            'data_protected': False,
            'errors': state.get('errors', []) + [f"Compliance protection failed: {str(e)}"]
        }
```

---

### Step 4: Add Human-in-Loop Validation Node (All 4 Workflows)

Add this new node to each workflow class:

```python
@trace_node("human_validation")
async def validate_human_review_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Validate if human review is required

    Checks:
    - Confidence score thresholds
    - Critical decision keywords
    - Domain-specific risks
    - Patient safety concerns

    If human review is required, response is flagged for review before delivery.
    """
    response = state.get('agent_response', '')
    confidence = state.get('response_confidence', 0.0)
    query = state.get('original_query', state.get('query', ''))

    try:
        # Check if human review is required
        validation_result = await self.human_validator.requires_human_review(
            query=query,
            response=response,
            confidence=confidence,
            domain=state.get('domain'),
            context=state
        )

        if validation_result['requires_human_review']:
            logger.warning(
                "Human review required",
                risk_level=validation_result['risk_level'],
                reasons=validation_result['reasons']
            )

            # Add human review notice to response
            review_notice = f"""

⚠️ **HUMAN REVIEW REQUIRED**

**Risk Level:** {validation_result['risk_level'].upper()}
**Confidence:** {confidence:.2%}

**Reasons:**
{chr(10).join(f"• {reason}" for reason in validation_result['reasons'])}

**Recommendation:**
{validation_result['recommendation']}

---
*This response has been flagged for review by a qualified healthcare professional before being considered final.*
"""
            response_with_notice = response + review_notice

            return {
                **state,
                'agent_response': response_with_notice,
                'requires_human_review': True,
                'human_review_decision': validation_result,
                'current_node': 'validate_human_review'
            }

        else:
            logger.info("Human review not required", confidence=confidence)
            return {
                **state,
                'requires_human_review': False,
                'human_review_decision': validation_result,
                'current_node': 'validate_human_review'
            }

    except Exception as e:
        logger.error("Human validation check failed", error=str(e))
        # Default to requiring review if check fails (safe default)
        return {
            **state,
            'requires_human_review': True,
            'human_review_decision': {'error': str(e)},
            'errors': state.get('errors', []) + [f"Human validation failed: {str(e)}"]
        }
```

---

### Step 5: Add Performance Monitoring Wrapper (All 4 Workflows)

Add these helper methods to each workflow class:

```python
async def _start_performance_tracking(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Start performance tracking"""
    return {
        **state,
        'performance_start_time': time.time(),
        'performance_metrics': {
            'nodes_executed': [],
            'cache_hits': 0,
            'cache_misses': 0,
            'tokens_used': 0,
            'estimated_cost': 0.0
        }
    }

async def _track_node_performance(
    self,
    state: UnifiedWorkflowState,
    node_name: str,
    start_time: float
) -> UnifiedWorkflowState:
    """Track individual node performance"""
    duration_ms = (time.time() - start_time) * 1000

    metrics = state.get('performance_metrics', {})
    metrics['nodes_executed'].append({
        'node': node_name,
        'duration_ms': duration_ms,
        'timestamp': datetime.utcnow().isoformat()
    })

    return {**state, 'performance_metrics': metrics}

async def _finalize_performance_tracking(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Finalize performance metrics"""
    start_time = state.get('performance_start_time', time.time())
    total_duration_ms = (time.time() - start_time) * 1000

    metrics = state.get('performance_metrics', {})
    metrics['total_duration_ms'] = total_duration_ms
    metrics['total_duration_seconds'] = total_duration_ms / 1000

    # Calculate cost estimate (rough estimate based on tokens)
    tokens_used = state.get('tokens_used', 0)
    # GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
    estimated_cost = (tokens_used / 1000) * 0.045  # Average

    metrics['estimated_cost_usd'] = round(estimated_cost, 4)

    logger.info(
        "Performance tracking complete",
        total_duration_ms=total_duration_ms,
        estimated_cost=estimated_cost,
        nodes_executed=len(metrics['nodes_executed'])
    )

    return {**state, 'performance_metrics': metrics}
```

---

### Step 6: Enhance Deep Agent Architecture Description (All 4 Workflows)

Update the docstring in each workflow class to emphasize deep agent architecture:

**Mode 1 Enhanced Docstring:**
```python
"""
Mode 1: Manual Selection + One-Shot Query with Deep Agent Architecture

DEEP AGENT ORCHESTRATION (5-Level Hierarchy):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1: Master Orchestrator (workflow coordination)
Level 2: Expert Agent (319+ specialists) ← USER SELECTS HERE
Level 3: Specialist Sub-Agents (spawned automatically for complex subtasks)
Level 4: Worker Sub-Agents (parallel task execution)
Level 5: Tool Agents (RAG, web search, databases, calculators)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTOMATIC SUB-AGENT SPAWNING:
When the expert agent receives a complex query:
1. Expert analyzes query complexity
2. Spawns 2-3 specialist sub-agents for different aspects
3. Each specialist may spawn worker sub-agents for parallel tasks
4. Tool agents provide specialized capabilities
5. Results synthesized hierarchically: Tools → Workers → Specialists → Expert

Example Query: "Compare my device to predicate devices for 510(k)"
- Expert Agent: FDA 510(k) Regulatory Expert
- Specialist Sub-Agent 1: Predicate Device Analyzer
- Specialist Sub-Agent 2: Substantial Equivalence Evaluator
- Worker Agents: Document parsers, similarity calculators
- Tool Agents: RAG search, FDA database lookup

COMPLIANCE & SAFETY:
- ✅ HIPAA/GDPR compliant data handling
- ✅ PHI/PII automatic de-identification
- ✅ Human-in-loop validation for critical decisions
- ✅ Complete audit trails
- ✅ Performance monitoring

PERFORMANCE TARGETS:
- Response Time: 15-25 seconds
- Accuracy: 88-92% (evidence-based target)
- Cost per Query: $0.03-0.08
"""
```

**Mode 2 Enhanced Docstring:**
```python
"""
Mode 2: Auto Selection + One-Shot Query with Multi-Expert Deep Agents

DEEP AGENT ORCHESTRATION (Multi-Expert Parallel):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1: Master Orchestrator (expert selection & consensus)
Level 2: Expert Agents (3-5 selected automatically) ← AI SELECTS HERE
Level 3: Specialist Sub-Agents (per expert, spawned in parallel)
Level 4: Worker Sub-Agents (per expert, parallel execution)
Level 5: Tool Agents (shared across all experts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARALLEL MULTI-EXPERT ARCHITECTURE:
1. Master analyzes query → Selects 3-5 most relevant experts
2. All experts execute in PARALLEL using asyncio.gather()
3. Each expert spawns their own specialist/worker sub-agents
4. Tool agents coordinate shared resources (RAG, databases)
5. Consensus built from multiple expert perspectives

Example Query: "Comprehensive regulatory strategy for Class II device"
- Expert 1: FDA 510(k) Specialist + 2 sub-agents
- Expert 2: Clinical Trials Expert + 2 sub-agents
- Expert 3: Quality Systems Expert + 2 sub-agents
- Expert 4: Market Access Strategist + 2 sub-agents
- Expert 5: Reimbursement Specialist + 2 sub-agents
Total: 5 experts + 10 sub-agents + tool agents = 15+ agents working together

CONSENSUS BUILDING:
- Agreement scoring across experts
- Conflict detection and resolution
- Diversity optimization
- Multi-perspective synthesis
"""
```

**Mode 3 Enhanced Docstring:**
```python
"""
Mode 3: Manual Chat + Autonomous Reasoning with Deep Agents

DEEP AGENT ORCHESTRATION (Multi-Turn with Sub-Agents):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 1: Master Orchestrator (conversation management)
Level 2: Expert Agent (user-selected) ← MAINTAINS CONVERSATION
Level 3: Specialist Sub-Agents (dynamically spawned per turn)
Level 4: Worker Sub-Agents (task-specific execution)
Level 5: Tool Agents (code execution, RAG, web search)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTONOMOUS REASONING WITH SUB-AGENTS:
Turn 1: "Help me prepare an IND application"
- Expert spawns 3 specialists: Regulatory, Clinical, CMC

Turn 2: "What about the safety monitoring plan?"
- Expert spawns 2 new specialists: Safety Monitoring, Data Management
- Original specialists remain available

Turn 3: "Generate the protocol synopsis"
- Expert spawns worker agents for document generation
- Specialists provide content
- Tool agents execute formatting

CHAIN-OF-THOUGHT REASONING:
Each agent (expert + sub-agents) uses structured reasoning:
1. Understanding → 2. Analysis → 3. Approach → 4. Execution → 5. Validation
"""
```

**Mode 4 Enhanced Docstring:**
```python
"""
Mode 4: Auto Chat + Multi-Expert Autonomous with Dynamic Sub-Agents

DEEP AGENT ORCHESTRATION (Most Advanced):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 0: Meta-Orchestrator (expert rotation & debate coordination)
Level 1: Master Agents (multi-expert panel management)
Level 2: Expert Agents (2-5, dynamically rotated) ← AI MANAGES PANEL
Level 3: Specialist Sub-Agents (per expert, context-aware)
Level 4: Worker Sub-Agents (parallel, shared workspace)
Level 5: Tool Agents (100+ integrations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DYNAMIC EXPERT ROTATION:
Turn 1: Query about regulatory strategy
- Experts: FDA Specialist, EU Regulatory Expert
- Each spawns 2 specialists = 6 agents total

Turn 2: Discussion reveals clinical trial needs
- System adds: Clinical Trials Expert (auto-rotated in)
- New expert spawns 2 specialists = 9 agents total

Turn 3: Cost discussion emerges
- System adds: Health Economics Expert
- Panel now: 4 experts + 8 specialists = 13 agents

EXPERT DEBATE & CONSENSUS:
- Parallel autonomous reasoning per expert
- Adversarial challenge (experts critique each other)
- Conflict detection and resolution
- Consensus building with debate summary
- Shared workspace for artifact collaboration
"""
```

---

### Step 7: Update Graph Construction (All 4 Workflows)

Add the new nodes to the workflow graph in the `build_workflow()` method:

**Insert these nodes into the graph:**

```python
def build_workflow(self) -> StateGraph:
    """Build the LangGraph workflow with compliance and validation"""

    # Create workflow graph
    workflow = StateGraph(UnifiedWorkflowState)

    # Add nodes (UPDATED ORDER with new nodes)
    workflow.add_node("protect_sensitive_data", self.protect_sensitive_data_node)  # NEW
    workflow.add_node("validate_inputs", self.validate_inputs_node)
    workflow.add_node("rag_retrieval", self.rag_retrieval_node)
    workflow.add_node("execute_tools", self.execute_tools_node)
    workflow.add_node("execute_expert_agent", self.execute_expert_agent_node)
    workflow.add_node("validate_human_review", self.validate_human_review_node)  # NEW
    workflow.add_node("format_output", self.format_output_node)

    # Set entry point (UPDATED to start with compliance)
    workflow.set_entry_point("protect_sensitive_data")

    # Define edges (UPDATED flow)
    workflow.add_edge("protect_sensitive_data", "validate_inputs")  # NEW edge
    workflow.add_edge("validate_inputs", "rag_retrieval")
    workflow.add_edge("rag_retrieval", "execute_tools")
    workflow.add_edge("execute_tools", "execute_expert_agent")
    workflow.add_edge("execute_expert_agent", "validate_human_review")  # NEW edge
    workflow.add_edge("validate_human_review", "format_output")  # NEW edge
    workflow.add_edge("format_output", END)

    return workflow.compile(checkpointer=self.checkpointer if self.enable_checkpoints else None)
```

---

### Step 8: Enhanced Sub-Agent Spawning (Mode 1 Specific)

Update the `execute_expert_agent_node` in Mode 1 to make deep agent architecture more prominent:

```python
@trace_node("mode1_execute_expert_agent")
async def execute_expert_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Execute expert agent with PROMINENT deep agent architecture.

    Deep Agent Hierarchy Implementation:
    1. Expert Agent (Level 2) receives query
    2. Analyzes complexity → Spawns 2-3 Specialist Sub-Agents (Level 3)
    3. Each specialist may spawn Worker Sub-Agents (Level 4)
    4. All agents use Tool Agents (Level 5) for capabilities
    5. Results synthesized bottom-up: Tools → Workers → Specialists → Expert
    """
    tenant_id = state['tenant_id']
    query = state['query']
    expert_agent_id = state.get('current_agent_id')
    context_summary = state.get('context_summary', '')
    tools_results = state.get('tools_executed', [])

    node_start = time.time()

    try:
        # Step 1: Execute expert agent
        logger.info(
            "Executing expert agent with deep architecture",
            expert_id=expert_agent_id,
            deep_agent_mode=True
        )

        agent_response = await self.agent_orchestrator.execute_agent(
            agent_id=expert_agent_id,
            query=query,
            context=context_summary,
            tenant_id=tenant_id
        )

        response_text = agent_response.get('response', '')
        citations = agent_response.get('citations', [])
        artifacts = agent_response.get('artifacts', [])

        # Step 2: ALWAYS spawn specialists for non-trivial queries (DEEP AGENT EMPHASIS)
        query_word_count = len(query.split())
        is_complex = query_word_count > 20 or any(word in query.lower() for word in [
            'comprehensive', 'detailed', 'strategy', 'plan', 'compare', 'analyze'
        ])

        sub_agents_spawned = []
        specialist_responses = []

        if is_complex or state.get('force_deep_agents', True):  # Default to deep agents
            logger.info(
                "🤖 Spawning specialist sub-agents for deep analysis",
                expert_id=expert_agent_id,
                query_complexity="high" if is_complex else "medium"
            )

            # Spawn 2-3 specialist sub-agents
            specialist_tasks = [
                ("Primary Analysis Specialist", "Conduct primary analysis"),
                ("Evidence Synthesis Specialist", "Synthesize supporting evidence"),
                ("Quality Assurance Specialist", "Validate conclusions")
            ]

            for specialist_name, task_description in specialist_tasks[:2 if not is_complex else 3]:
                try:
                    specialist_id = await self.sub_agent_spawner.spawn_specialist(
                        parent_agent_id=expert_agent_id,
                        task=f"{task_description}: {query[:100]}",
                        specialty=specialist_name,
                        context={'query': query, 'tenant_id': tenant_id}
                    )

                    sub_agents_spawned.append({
                        'id': specialist_id,
                        'name': specialist_name,
                        'level': 3  # Level 3 in hierarchy
                    })

                    # Execute specialist
                    specialist_result = await self.sub_agent_spawner.execute_sub_agent(
                        sub_agent_id=specialist_id
                    )

                    if specialist_result:
                        specialist_responses.append({
                            'specialist': specialist_name,
                            'response': specialist_result.get('response', ''),
                            'confidence': specialist_result.get('confidence', 0.75)
                        })

                except Exception as e:
                    logger.error(f"Failed to spawn {specialist_name}", error=str(e))

            # Synthesize specialist results into expert response
            if specialist_responses:
                synthesis = "\n\n**Deep Analysis from Specialist Sub-Agents:**\n\n"
                for i, spec in enumerate(specialist_responses, 1):
                    synthesis += f"**{spec['specialist']}:**\n{spec['response']}\n\n"

                response_text += synthesis

                logger.info(
                    "✅ Deep agent hierarchy executed successfully",
                    expert_agent=expert_agent_id,
                    specialists_spawned=len(sub_agents_spawned),
                    total_agents=1 + len(sub_agents_spawned)  # Expert + specialists
                )

        # Calculate confidence
        confidence = await self.confidence_calculator.calculate(
            response=response_text,
            context=context_summary,
            citations=citations
        )

        # Track performance
        state = await self._track_node_performance(state, 'execute_expert_agent', node_start)

        return {
            **state,
            'agent_response': response_text,
            'response_confidence': confidence,
            'citations': citations,
            'sub_agents_spawned': sub_agents_spawned,
            'specialist_responses': specialist_responses,
            'artifacts': artifacts,
            'deep_agent_architecture_used': True,
            'agent_hierarchy_levels': 3 if sub_agents_spawned else 2,
            'total_agents_involved': 1 + len(sub_agents_spawned),
            'tokens_used': agent_response.get('tokens_used', 0),
            'current_node': 'execute_expert_agent'
        }

    except Exception as e:
        logger.error("Expert agent execution failed", error=str(e))
        return {
            **state,
            'agent_response': 'I apologize, but I encountered an error processing your request.',
            'response_confidence': 0.0,
            'errors': state.get('errors', []) + [f"Agent execution failed: {str(e)}"]
        }
```

---

## 📊 Testing Checklist

After implementing these enhancements, verify:

### HIPAA/GDPR Compliance
- [ ] PHI/PII is de-identified in query
- [ ] Audit trail created in `compliance_audit_log` table
- [ ] Protected data can be re-identified by authorized users
- [ ] Consent check implemented for data processing

### Human-in-Loop Validation
- [ ] Low confidence responses flagged for review
- [ ] Critical keywords trigger human review
- [ ] Review notice appears in response
- [ ] Risk level correctly classified

### Deep Agent Architecture
- [ ] Sub-agents spawned for complex queries
- [ ] Agent hierarchy visible in response
- [ ] Specialist results synthesized correctly
- [ ] Performance acceptable with multiple agents

### Performance Monitoring
- [ ] Total duration tracked
- [ ] Per-node latency measured
- [ ] Cost estimated correctly
- [ ] Metrics logged to database

---

## 🎯 Expected Outcomes

After implementing these enhancements:

1. **Regulatory Compliance**
   - ✅ HIPAA compliant: PHI de-identification + audit trails
   - ✅ GDPR compliant: Right to erasure + consent management
   - ✅ Full audit trail for regulatory inspection

2. **Patient Safety**
   - ✅ Critical decisions flagged for human review
   - ✅ Confidence thresholds enforced
   - ✅ Risk stratification implemented

3. **Deep Agent Architecture**
   - ✅ Visible multi-level agent hierarchy
   - ✅ Automatic sub-agent spawning
   - ✅ Parallel execution for efficiency
   - ✅ Bottom-up result synthesis

4. **Performance**
   - ✅ Latency tracking per node
   - ✅ Cost estimation per query
   - ✅ Optimization opportunities identified

---

## 📋 Database Schema Updates Required

### Create Compliance Audit Log Table

```sql
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id VARCHAR(255) UNIQUE NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    tenant_id VARCHAR(255),
    user_id VARCHAR(255),
    data_type VARCHAR(100),
    action VARCHAR(100),
    compliance_regime VARCHAR(50),
    purpose TEXT,
    parent_audit_id VARCHAR(255),
    status VARCHAR(50),
    completed_at TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compliance_audit_tenant ON compliance_audit_log(tenant_id);
CREATE INDEX idx_compliance_audit_user ON compliance_audit_log(user_id);
CREATE INDEX idx_compliance_audit_id ON compliance_audit_log(audit_id);
```

### Create User Consent Table

```sql
CREATE TABLE IF NOT EXISTS user_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    consent_date TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    withdrawal_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_consent_user ON user_consent(user_id);
CREATE INDEX idx_user_consent_tenant ON user_consent(tenant_id);
```

---

## 🚀 Deployment Steps

1. **Deploy Compliance Service**
   ```bash
   # Ensure compliance_service.py is deployed
   cp services/compliance_service.py /path/to/production/services/
   ```

2. **Run Database Migrations**
   ```bash
   # Create compliance tables
   psql -d vital_db -f migrations/add_compliance_tables.sql
   ```

3. **Update Workflow Files**
   - Apply changes from this guide to all 4 mode files
   - Test each mode individually

4. **Integration Testing**
   ```bash
   pytest tests/test_compliance_workflows.py
   pytest tests/test_deep_agents.py
   pytest tests/test_human_validation.py
   ```

5. **Monitor Deployment**
   - Check audit log creation
   - Verify human review triggers
   - Monitor sub-agent spawning
   - Track performance metrics

---

## 📚 Additional Resources

- **HIPAA Compliance Guide:** [HHS HIPAA Overview](https://www.hhs.gov/hipaa/index.html)
- **GDPR Requirements:** [GDPR.EU Guidelines](https://gdpr.eu/)
- **Sub-Agent Spawner API:** `services/ai-engine/src/services/sub_agent_spawner.py`
- **Performance Monitoring:** `langgraph_workflows/observability.py`

---

**Document Status:** ✅ READY FOR IMPLEMENTATION
**Estimated Implementation Time:** 6-8 hours per workflow
**Priority:** HIGH (Compliance & Safety)
**Version:** 1.0
