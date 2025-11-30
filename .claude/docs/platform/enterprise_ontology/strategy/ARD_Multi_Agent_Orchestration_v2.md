# Architecture Requirements Document (ARD)
# Multi-Agent Orchestration System v2.0

**Document ID:** ARD-VITAL-003  
**Version:** 2.0  
**Status:** Architecture Board Approved  
**Created:** November 28, 2025  
**Last Updated:** November 28, 2025  
**Author:** Architecture Team  
**Reviewers:** Engineering, AI/ML, Platform, Security, Compliance

---

# 1. Executive Summary

## 1.1 Purpose

This Architecture Requirements Document defines the technical architecture for the VITAL Platform's Multi-Agent Orchestration System v2.0. This version incorporates the **Enterprise Intelligence Operating System** vision, introducing the **Intelligence Broker**, **Policy-as-Code Governance**, **CDC-based Projection Spine**, and **L0 Domain Knowledge** integration.

## 1.2 Scope

This document covers:
- **Enhanced Service Layer Architecture (L1-L4)** with Intelligence Broker integration
- **Agent Management and Lifecycle** with governance-first design
- **Panel Orchestration Patterns** with structured deliberation protocols
- **Workflow Engine** (LangGraph) with embedded compliance checkpoints
- **Solution Composition Framework** for L4 cross-functional orchestration
- **Governance Engine** with Policy-as-Code (OPA) integration
- **Intelligence Broker** for unified GraphRAG + VectorRAG retrieval
- **Projection Spine** (CDC) for real-time ontology synchronization
- **Observability and Monitoring** across all layers

## 1.3 Key Architectural Decisions (v2.0 Updates)

| Decision | v1.0 | v2.0 | Rationale |
|----------|------|------|-----------|
| Retrieval Strategy | Separate GraphRAG/VectorRAG | Intelligence Broker (unified) | Single entry point for agents, fused context |
| Compliance | Advisory triggers | Policy-as-Code (OPA) | Executable compliance, pre-execution validation |
| Synchronization | Batch ETL | CDC (Debezium + Kafka) | Near-real-time (<500ms), guaranteed delivery |
| Ontology | L1-L7 Operational | L0-L7 (+ Domain Knowledge) | Domain-aware reasoning, entity resolution |
| Governance | Post-execution filtering | Pre-execution gates | Block violations before they occur |
| Context Building | Agent-specific retrieval | Broker-mediated context | Consistent, persona-aware context assembly |

## 1.4 Architecture Principles (v2.0)

1. **Governance-First**: Every agent action is validated against policies before execution
2. **Domain-Aware**: All reasoning is contextualized by L0 Domain Knowledge
3. **Broker-Mediated**: Agents access intelligence through the Intelligence Broker, not directly
4. **Event-Driven**: Real-time synchronization via CDC, not batch processes
5. **Composability**: Agents, panels, and workflows are reusable building blocks
6. **Observability**: Full tracing of agent reasoning, decisions, and governance outcomes
7. **Resilience**: Graceful degradation, circuit breakers, and fallback patterns
8. **Multi-tenancy**: Complete tenant isolation with RLS enforcement

---

# 2. System Context

## 2.1 Enhanced Context Diagram

```
                        SYSTEM CONTEXT DIAGRAM v2.0

                    ┌──────────────────────────────────┐
                    │        EXTERNAL SYSTEMS          │
                    │  • LLM Providers (OpenAI,        │
                    │    Anthropic, Azure)             │
                    │  • Veeva CRM                     │
                    │  • CTMS                          │
                    │  • Safety Systems (Argus)        │
                    │  • PubMed / ClinicalTrials.gov   │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
┌───────────────────┐     ┌─────────────────────────────────────────────────────────────┐
│     CLIENTS       │     │           MULTI-AGENT ORCHESTRATION SYSTEM v2.0            │
│                   │     │                                                             │
│ • Web App         │     │  ┌─────────────────────────────────────────────────────┐   │
│ • Mobile          │◄────┤  │                  API GATEWAY                        │   │
│ • API             │     │  └────────────────────────┬────────────────────────────┘   │
│ • Copilot         │     │                           │                                │
│ • Integrations    │     │  ┌────────────────────────▼────────────────────────────┐   │
│                   │     │  │              SERVICE ROUTER                         │   │
└───────────────────┘     │  │  • Query Classification  • Persona Context          │   │
                          │  │  • Layer Selection       • Archetype Adjustment     │   │
                          │  └────────────────────────┬────────────────────────────┘   │
                          │                           │                                │
                          │  ┌────────────────────────▼────────────────────────────┐   │
                          │  │           GOVERNANCE ENGINE (Pre-Execution)         │   │
                          │  │  • Policy-as-Code (OPA)  • HITL Checkpoint Mgmt     │   │
                          │  │  • Safety Triggers       • Audit Logging            │   │
                          │  └────────────────────────┬────────────────────────────┘   │
                          │                           │                                │
                          │  ┌────────────────────────▼────────────────────────────┐   │
                          │  │           INTELLIGENCE BROKER (NEW)                 │   │
                          │  │  • Entity Resolution (L0) • GraphRAG (IIG)          │   │
                          │  │  • VectorRAG (Pinecone)   • Context Fusion          │   │
                          │  └────────────────────────┬────────────────────────────┘   │
                          │                           │                                │
                          │     ┌─────────────────────┼─────────────────────┐         │
                          │     │                     │                     │         │
                          │     ▼                     ▼                     ▼         │
                          │  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
                          │  │L1 Expert │      │L2 Panel  │      │L3 Work-  │         │
                          │  │          │      │Orchestr. │      │flow Eng. │         │
                          │  └──────────┘      └──────────┘      └──────────┘         │
                          │     │                     │                     │         │
                          │     ▼                     ▼                     ▼         │
                          │  ┌──────────────────────────────────────────────┐         │
                          │  │         L4 SOLUTION COMPOSER                 │         │
                          │  └──────────────────────────────────────────────┘         │
                          │                                                            │
                          └────────────────────────────────────────────────────────────┘
                                                   │
        ┌──────────────────────────────────────────┼──────────────────────────────────┐
        │                                          │                                   │
        ▼                                          ▼                                   ▼
┌─────────────────────┐     ┌─────────────────────────────────────┐     ┌─────────────────┐
│   PostgreSQL        │     │            PROJECTION SPINE          │     │     Neo4j       │
│   (Supabase)        │────►│                                      │────►│     (IIG)       │
│                     │     │  • Debezium CDC  • Kafka Streams     │     │                 │
│   Source of Truth   │     │  • Graph Sync Service                │     │  Knowledge      │
│   280+ Tables       │     │  • <500ms Latency                    │     │  Graph          │
│   RLS Policies      │     │                                      │     │  Reasoning      │
└─────────────────────┘     └─────────────────────────────────────┘     └─────────────────┘
        │                                                                         │
        │                    ┌─────────────────────────────────────┐             │
        │                    │           OBSERVABILITY             │             │
        └───────────────────►│  • OpenTelemetry  • Prometheus      │◄────────────┘
                             │  • Jaeger         • Grafana          │
                             │  • DataDog        • PagerDuty        │
                             └─────────────────────────────────────┘
```

## 2.2 Component Overview (v2.0)

| Component | Responsibility | Technology | v2.0 Changes |
|-----------|----------------|------------|--------------|
| **API Gateway** | Entry point, auth, rate limiting | Kong / Envoy | Added tenant-aware routing |
| **Service Router** | Route to appropriate service layer | Python, Rules Engine | Archetype-aware routing |
| **Governance Engine** | Pre-execution policy validation | Python, OPA | **NEW**: Policy-as-Code |
| **Intelligence Broker** | Unified context retrieval | Python, LangChain | **NEW**: GraphRAG + VectorRAG fusion |
| **Agent Manager** | Agent lifecycle, pooling | Python, Redis | Added governance hooks |
| **Panel Orchestrator** | Multi-agent reasoning | LangGraph | Enhanced deliberation patterns |
| **Workflow Engine** | Multi-step automation | LangGraph, Temporal | HITL checkpoints |
| **Solution Composer** | L4 solution assembly | Python, DAG Builder | Cross-functional support |
| **Projection Spine** | Real-time sync to graph | Debezium, Kafka | **NEW**: CDC pipeline |

---

# 3. Service Layer Architecture

## 3.1 Four-Tier Service Model with Governance Gates

```
                    SERVICE LAYER ARCHITECTURE v2.0

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                   │
│   USER REQUEST                                                                    │
│        │                                                                          │
│        ▼                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                         SERVICE ROUTER                                    │   │
│   │  • Classify request complexity     • Evaluate persona archetype          │   │
│   │  • Apply routing rules             • Select target layer                 │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                          │
│        ▼                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                    GOVERNANCE GATE (PRE-EXECUTION)                        │   │
│   │  • Validate against policies (OPA)  • Check HITL requirements            │   │
│   │  • Assess compliance risk           • Log audit record                   │   │
│   │  • DECISION: APPROVED | BLOCKED | HITL_REQUIRED | MODIFIED               │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                          │
│        ├────────────────────┬────────────────────┬────────────────────┐          │
│        │                    │                    │                    │          │
│        ▼                    ▼                    ▼                    ▼          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│   │     L1      │     │     L2      │     │     L3      │     │     L4      │   │
│   │  ASK EXPERT │     │  ASK PANEL  │     │  WORKFLOWS  │     │  SOLUTIONS  │   │
│   │             │     │             │     │             │     │             │   │
│   │  Single     │     │  Multi-     │     │  Multi-     │     │  End-to-    │   │
│   │  Agent      │     │  Agent      │     │  Step       │     │  End        │   │
│   │  + Broker   │     │  Deliber.   │     │  Automation │     │  Orchestr.  │   │
│   │             │     │             │     │             │     │             │   │
│   │  Latency:   │     │  Latency:   │     │  Latency:   │     │  Latency:   │   │
│   │  <3s        │     │  10-30s     │     │  min-hours  │     │  hours-days │   │
│   │             │     │             │     │             │     │             │   │
│   │  Traffic:   │     │  Traffic:   │     │  Traffic:   │     │  Traffic:   │   │
│   │  70%        │     │  20%        │     │  8%         │     │  2%         │   │
│   │             │     │             │     │             │     │             │   │
│   │  Governance:│     │  Governance:│     │  Governance:│     │  Governance:│   │
│   │  Autonomous │     │  Semi-Auto  │     │  Checkpoints│     │  Multi-Gate │   │
│   └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘   │
│        │                    │                    │                    │          │
│        ▼                    ▼                    ▼                    ▼          │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                  INTELLIGENCE BROKER (SHARED)                             │   │
│   │  • Entity Resolution (L0 Domain)  • GraphRAG (IIG traversal)             │   │
│   │  • VectorRAG (semantic search)    • Context Window Assembly              │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Service Router Implementation (v2.0)

```python
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import asyncio

class ServiceLayer(Enum):
    L1_EXPERT = "L1"
    L2_PANEL = "L2"
    L3_WORKFLOW = "L3"
    L4_SOLUTION = "L4"

class GovernanceDecision(Enum):
    APPROVED = "approved"
    BLOCKED = "blocked"
    HITL_REQUIRED = "hitl_required"
    MODIFIED = "modified"

@dataclass
class RoutingContext:
    query: str
    persona_id: str
    archetype: str
    ai_maturity: int
    session_context: Dict[str, Any]
    tenant_id: str
    user_id: str

@dataclass
class RoutingDecision:
    layer: ServiceLayer
    confidence: float
    reasoning: str
    agents: List[str]
    workflow_id: Optional[str] = None
    solution_id: Optional[str] = None
    governance_pre_check: Optional[Dict[str, Any]] = None
    intelligence_context: Optional[Dict[str, Any]] = None

class ServiceRouter:
    """
    Routes incoming requests to appropriate service layer.
    v2.0: Integrated with Governance Engine and Intelligence Broker.
    """
    
    def __init__(
        self,
        config: dict,
        governance_engine: 'GovernanceEngine',
        intelligence_broker: 'IntelligenceBroker'
    ):
        self.complexity_classifier = ComplexityClassifier()
        self.persona_service = PersonaService()
        self.agent_registry = AgentRegistry()
        self.governance = governance_engine
        self.broker = intelligence_broker
        self.config = config
    
    async def route(self, context: RoutingContext) -> RoutingDecision:
        """
        Main routing logic with governance and intelligence integration.
        
        v2.0 Flow:
        1. Classify query complexity
        2. Get persona context (from IIG via Broker)
        3. Apply routing rules with archetype adjustment
        4. Pre-execution governance check
        5. Build intelligence context via Broker
        6. Return enriched routing decision
        """
        
        # 1. Classify query complexity
        complexity = await self.complexity_classifier.analyze(context.query)
        
        # 2. Get persona context from Intelligence Broker
        persona_context = await self.broker.get_persona_context(context.persona_id)
        
        # 3. Determine target layer
        target_layer = self._determine_layer(complexity, persona_context, context)
        
        # 4. Pre-execution governance check
        governance_result = await self.governance.pre_execution_check(
            action_type="query",
            target_layer=target_layer,
            query=context.query,
            persona=persona_context,
            context=context
        )
        
        if governance_result.decision == GovernanceDecision.BLOCKED:
            return self._create_blocked_decision(governance_result)
        
        # 5. Build intelligence context
        intelligence_context = await self.broker.get_context(
            query=context.query,
            persona_id=context.persona_id,
            execution_context={
                'tenant_id': context.tenant_id,
                'layer': target_layer.value,
                'archetype': context.archetype
            }
        )
        
        # 6. Create enriched routing decision
        return await self._create_routing_decision(
            target_layer=target_layer,
            context=context,
            complexity=complexity,
            persona_context=persona_context,
            governance_result=governance_result,
            intelligence_context=intelligence_context
        )
    
    def _determine_layer(
        self,
        complexity: 'ComplexityAnalysis',
        persona: Dict[str, Any],
        context: RoutingContext
    ) -> ServiceLayer:
        """
        Determine target service layer based on complexity and persona.
        """
        
        # L4: Cross-functional or solution-level requests
        if complexity.cross_functional_score >= 0.7:
            return ServiceLayer.L4_SOLUTION
        
        # L3: Multi-step processes or high compliance sensitivity
        if complexity.steps_required >= 3 or complexity.compliance_sensitivity >= 0.8:
            return ServiceLayer.L3_WORKFLOW
        
        # L2: Multi-perspective or controversial topics
        if complexity.ambiguity >= 0.6 or complexity.requires_multiple_perspectives:
            return ServiceLayer.L2_PANEL
        
        # L1: Simple, single-domain queries
        return ServiceLayer.L1_EXPERT
    
    async def _create_routing_decision(
        self,
        target_layer: ServiceLayer,
        context: RoutingContext,
        complexity: 'ComplexityAnalysis',
        persona_context: Dict[str, Any],
        governance_result: 'GovernanceResult',
        intelligence_context: 'IntelligenceContext'
    ) -> RoutingDecision:
        """
        Create enriched routing decision with all context.
        """
        
        # Select agents based on layer and domain
        agents = await self._select_agents(
            layer=target_layer,
            domains=complexity.required_domains,
            persona=persona_context,
            archetype=context.archetype
        )
        
        # Match workflow/solution if applicable
        workflow_id = None
        solution_id = None
        
        if target_layer == ServiceLayer.L3_WORKFLOW:
            workflow = await self._match_workflow_template(
                context.query, persona_context, complexity
            )
            workflow_id = workflow.id if workflow else None
        
        elif target_layer == ServiceLayer.L4_SOLUTION:
            solution = await self._match_solution_suite(
                context.query, persona_context, complexity
            )
            solution_id = solution.id if solution else None
        
        return RoutingDecision(
            layer=target_layer,
            confidence=self._calculate_confidence(complexity, persona_context),
            reasoning=self._generate_reasoning(target_layer, complexity),
            agents=agents,
            workflow_id=workflow_id,
            solution_id=solution_id,
            governance_pre_check={
                'decision': governance_result.decision.value,
                'policies_evaluated': governance_result.policies_evaluated,
                'hitl_checkpoint': governance_result.hitl_checkpoint
            },
            intelligence_context={
                'domain_entities': [e.to_dict() for e in intelligence_context.domain_entities],
                'structural_summary': intelligence_context.structural_context.get('summary'),
                'document_count': len(intelligence_context.document_chunks)
            }
        )
    
    async def _select_agents(
        self,
        layer: ServiceLayer,
        domains: List[str],
        persona: Dict[str, Any],
        archetype: str
    ) -> List[str]:
        """
        Select appropriate agents based on layer, domains, and archetype.
        """
        
        agents = []
        
        for domain in domains:
            agent = await self.agent_registry.select_best_agent(
                domain=domain,
                layer=layer.value,
                archetype=archetype
            )
            if agent:
                agents.append(agent.id)
        
        # Add archetype-specific agents
        if archetype == "skeptic":
            agents.append("citation_validator_agent")
            agents.append("compliance_checker_agent")
        
        elif archetype == "learner":
            agents.append("guidance_agent")
        
        return agents
```

## 3.3 Service Layer Definitions (v2.0)

| Level | Name | Autonomy | Complexity | Response Time | Governance | HITL |
|-------|------|----------|------------|---------------|------------|------|
| L1 | Ask Expert | Fully Autonomous | Simple | <3 seconds | Pre-check only | None |
| L2 | Ask Panel | Semi-Autonomous | Moderate | 10-30 seconds | Pre-check + monitor | Optional |
| L3 | Workflows | Supervised | Complex | Minutes-Hours | Checkpoints | At gates |
| L4 | Solution Builder | Heavily Supervised | Strategic | Hours-Days | Multiple gates | Required |

---

# 4. Governance Engine

## 4.1 Policy-as-Code Architecture

The Governance Engine implements executable compliance using Open Policy Agent (OPA):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         GOVERNANCE ENGINE ARCHITECTURE                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                         POLICY REPOSITORY                                  │  │
│   │                                                                            │  │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│   │   │  Compliance  │  │  Safety      │  │  Data        │  │  Business    │ │  │
│   │   │  Policies    │  │  Policies    │  │  Privacy     │  │  Rules       │ │  │
│   │   │              │  │              │  │  Policies    │  │              │ │  │
│   │   │  • MLR Review│  │  • AE Detect │  │  • PII       │  │  • Approval  │ │  │
│   │   │  • Off-Label │  │  • Escalation│  │  • Consent   │  │  • Limits    │ │  │
│   │   │  • Claims    │  │  • Block List│  │  • GDPR      │  │  • Scope     │ │  │
│   │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│   │                                                                            │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                        │
│                                         ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                       OPA POLICY ENGINE                                    │  │
│   │                                                                            │  │
│   │   Input Context:                    Output Decision:                       │  │
│   │   • action_type                     • allow / deny                         │  │
│   │   • content_type                    • violations[]                         │  │
│   │   • persona_archetype               • modifications[]                      │  │
│   │   • domain_entities                 • hitl_required                        │  │
│   │   • detected_flags                  • audit_record                         │  │
│   │                                                                            │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                        │
│                                         ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                      HITL CHECKPOINT MANAGER                               │  │
│   │                                                                            │  │
│   │   • Queue management      • Reviewer assignment                           │  │
│   │   • SLA tracking          • Escalation paths                              │  │
│   │   • Resolution workflow   • Audit trail                                   │  │
│   │                                                                            │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                        │
│                                         ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                         AUDIT LOGGER                                       │  │
│   │                                                                            │  │
│   │   • Every action logged    • Immutable records                            │  │
│   │   • 7-year retention       • Compliance reporting                         │  │
│   │   • Full context capture   • Queryable for investigations                 │  │
│   │                                                                            │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Governance Engine Implementation

```python
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from enum import Enum
import httpx
import json

class GovernanceDecision(Enum):
    APPROVED = "approved"
    BLOCKED = "blocked"
    HITL_REQUIRED = "hitl_required"
    MODIFIED = "modified"

@dataclass
class GovernanceResult:
    decision: GovernanceDecision
    policies_evaluated: List[str]
    violations: List[str]
    modifications: List[Dict[str, Any]]
    hitl_checkpoint: Optional[str]
    audit_record_id: str
    reasoning: str

class GovernanceEngine:
    """
    Pre-execution and post-execution governance validation
    using Policy-as-Code (OPA).
    """
    
    def __init__(
        self,
        opa_url: str,
        audit_logger: 'AuditLogger',
        hitl_manager: 'HITLManager',
        content_analyzer: 'ContentAnalyzer'
    ):
        self.opa_client = OPAClient(opa_url)
        self.audit_logger = audit_logger
        self.hitl_manager = hitl_manager
        self.analyzer = content_analyzer
    
    async def pre_execution_check(
        self,
        action_type: str,
        target_layer: 'ServiceLayer',
        query: str,
        persona: Dict[str, Any],
        context: 'RoutingContext'
    ) -> GovernanceResult:
        """
        Validate action against all applicable policies BEFORE execution.
        """
        
        # Build policy input with content analysis
        analysis = await self.analyzer.analyze(query)
        
        policy_input = {
            "action_type": action_type,
            "target_layer": target_layer.value,
            "query": query,
            "persona_archetype": persona.get('archetype'),
            "user_role": persona.get('role'),
            "tenant_id": context.tenant_id,
            
            # Content analysis results
            "external_facing": analysis.is_external_facing,
            "contains_pii": analysis.contains_pii,
            "mentions_adverse_event": analysis.mentions_adverse_event,
            "mentions_off_label_use": analysis.mentions_off_label,
            "claims_count": analysis.claims_count,
            "sensitivity_score": analysis.sensitivity_score,
            
            # Domain context
            "therapeutic_areas": analysis.therapeutic_areas,
            "products_mentioned": analysis.products_mentioned
        }
        
        # Evaluate against OPA policy bundle
        evaluation = await self.opa_client.evaluate(
            package="vital.governance.medical_affairs",
            input=policy_input
        )
        
        # Determine decision
        decision = self._determine_decision(evaluation, target_layer)
        
        # Handle HITL if required
        hitl_checkpoint = None
        if decision == GovernanceDecision.HITL_REQUIRED:
            hitl_checkpoint = await self.hitl_manager.create_checkpoint(
                action=action_type,
                reason=evaluation.hitl_reason,
                context=context.__dict__,
                policies=evaluation.hitl_policies
            )
        
        # Create audit record
        audit_id = await self.audit_logger.log_governance_check(
            action=action_type,
            context=context,
            evaluation=evaluation,
            decision=decision,
            hitl_checkpoint=hitl_checkpoint
        )
        
        return GovernanceResult(
            decision=decision,
            policies_evaluated=evaluation.policies,
            violations=evaluation.violations,
            modifications=evaluation.modifications,
            hitl_checkpoint=hitl_checkpoint,
            audit_record_id=audit_id,
            reasoning=evaluation.reasoning
        )
    
    async def post_execution_check(
        self,
        output: Dict[str, Any],
        context: 'ExecutionContext'
    ) -> GovernanceResult:
        """
        Validate output after execution for content compliance.
        """
        
        # Analyze output content
        analysis = await self.analyzer.analyze(output.get('content', ''))
        
        policy_input = {
            "action_type": "output_validation",
            "content": output.get('content'),
            "contains_pii": analysis.contains_pii,
            "mentions_adverse_event": analysis.mentions_adverse_event,
            "claims_count": analysis.claims_count,
            "sources_cited": len(output.get('sources', [])),
            "claims_referenced": output.get('claims_referenced', False)
        }
        
        evaluation = await self.opa_client.evaluate(
            package="vital.governance.output_validation",
            input=policy_input
        )
        
        decision = self._determine_decision(evaluation, context.layer)
        
        # Log audit record
        audit_id = await self.audit_logger.log_output_check(
            output=output,
            context=context,
            evaluation=evaluation,
            decision=decision
        )
        
        return GovernanceResult(
            decision=decision,
            policies_evaluated=evaluation.policies,
            violations=evaluation.violations,
            modifications=evaluation.modifications,
            hitl_checkpoint=None,
            audit_record_id=audit_id,
            reasoning=evaluation.reasoning
        )
    
    def _determine_decision(
        self,
        evaluation: 'PolicyEvaluation',
        layer: 'ServiceLayer'
    ) -> GovernanceDecision:
        """
        Map policy evaluation to governance decision.
        """
        
        if evaluation.has_blocking_violations:
            return GovernanceDecision.BLOCKED
        
        if evaluation.requires_hitl:
            return GovernanceDecision.HITL_REQUIRED
        
        if evaluation.has_modifications:
            return GovernanceDecision.MODIFIED
        
        return GovernanceDecision.APPROVED


class OPAClient:
    """
    Client for Open Policy Agent evaluation.
    """
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.http_client = httpx.AsyncClient()
    
    async def evaluate(
        self,
        package: str,
        input: Dict[str, Any]
    ) -> 'PolicyEvaluation':
        """
        Evaluate input against OPA policy package.
        """
        
        url = f"{self.base_url}/v1/data/{package.replace('.', '/')}"
        
        response = await self.http_client.post(
            url,
            json={"input": input}
        )
        response.raise_for_status()
        
        result = response.json().get('result', {})
        
        return PolicyEvaluation(
            policies=result.get('policies_evaluated', []),
            violations=result.get('violations', []),
            modifications=result.get('modifications', []),
            has_blocking_violations=result.get('block', False),
            requires_hitl=result.get('hitl_required', False),
            hitl_reason=result.get('hitl_reason'),
            hitl_policies=result.get('hitl_policies', []),
            has_modifications=len(result.get('modifications', [])) > 0,
            reasoning=result.get('reasoning', '')
        )
```

## 4.3 OPA Policy Definitions

```rego
# vital/governance/medical_affairs.rego

package vital.governance.medical_affairs

import future.keywords.in
import future.keywords.if
import future.keywords.contains

# Default deny
default allow = false

# Allow if no violations
allow if {
    count(violations) == 0
    not block
}

# Blocking Violations
block if {
    input.mentions_off_label_use
    input.action_type in ["generate_content", "respond"]
    input.content_type in ["promotional", "sales_aid"]
}

block if {
    input.contains_pii
    not input.consent_documented
    input.external_facing
}

# Violations Collection
violations contains msg if {
    input.mentions_adverse_event
    input.severity in ["serious", "unexpected"]
    not input.ae_reported
    msg := "Serious/unexpected adverse event detected but not reported"
}

violations contains msg if {
    input.claims_count > 0
    not input.all_claims_referenced
    msg := "Scientific claims present without references"
}

violations contains msg if {
    input.external_facing
    input.content_type in ["promotional", "scientific_exchange"]
    not input.mlr_approved
    msg := "External-facing promotional content requires MLR approval"
}

# HITL Requirements
hitl_required if {
    input.target_layer == "L3"
    input.sensitivity_score >= 0.8
}

hitl_required if {
    input.target_layer == "L4"
}

hitl_required if {
    input.persona_archetype == "skeptic"
    input.claims_count >= 3
}

hitl_reason = reason if {
    hitl_required
    input.sensitivity_score >= 0.8
    reason := "High sensitivity content requires human review"
}

hitl_reason = reason if {
    hitl_required
    input.target_layer == "L4"
    reason := "L4 Solution-level operations require human oversight"
}

# Modifications (content adjustments)
modifications contains mod if {
    input.contains_pii
    mod := {
        "type": "redact_pii",
        "reason": "PII detected - redaction required"
    }
}

modifications contains mod if {
    input.mentions_adverse_event
    mod := {
        "type": "add_ae_disclaimer",
        "reason": "Adverse event content requires safety disclaimer"
    }
}

# Policy tracking
policies_evaluated := [
    "mlr_review_policy",
    "adverse_event_policy",
    "off_label_policy",
    "pii_handling_policy",
    "scientific_accuracy_policy"
]

# Reasoning for audit
reasoning = concat("; ", [msg | msg := violations[_]])
```

---

# 5. Intelligence Broker

## 5.1 Architecture Overview

The Intelligence Broker provides unified access to both structured (Graph) and unstructured (Vector) intelligence:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE BROKER ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                          AGENT QUERY                                       │  │
│   │   "What evidence supports [Drug X] for [Indication Y] in [Population Z]?" │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                        │
│                                         ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                      QUERY ANALYZER                                        │  │
│   │                                                                            │  │
│   │   1. Parse query for entity mentions                                       │  │
│   │   2. Classify intent (factual, analytical, generative)                     │  │
│   │   3. Identify domain signals                                               │  │
│   │   4. Extract temporal/geographic constraints                               │  │
│   │                                                                            │  │
│   │   Output: QueryAnalysis { entities, intent, domains, constraints }         │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                        │
│                                         ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                      ENTITY RESOLVER (L0 Integration)                      │  │
│   │                                                                            │  │
│   │   • Resolve "Drug X" → domain_products.id                                  │  │
│   │   • Resolve "Indication Y" → domain_diseases.id                            │  │
│   │   • Resolve "Population Z" → domain_population_segments.id                 │  │
│   │   • Fetch entity metadata and relationships                                │  │
│   │                                                                            │  │
│   │   Output: ResolvedEntities { products[], diseases[], populations[] }       │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                  │                                           │                   │
│                  ▼                                           ▼                   │
│   ┌────────────────────────────────┐      ┌────────────────────────────────────┐│
│   │     GRAPHRAG ENGINE            │      │       VECTORRAG ENGINE             ││
│   │                                │      │                                    ││
│   │   Query IIG (Neo4j) for:       │      │   Query Pinecone for:              ││
│   │   • L1-L7 structural context   │      │   • Relevant documents             ││
│   │   • Relationship paths         │      │   • Evidence chunks                ││
│   │   • Entity connections         │      │   • Publication excerpts           ││
│   │   • Workflow associations      │      │   • Guidelines sections            ││
│   │                                │      │                                    ││
│   │   Uses: Persona → Role →       │      │   Filters by:                      ││
│   │   Department → JTBD → Workflow │      │   • Tenant ID                      ││
│   │                                │      │   • Domain entities                ││
│   │   Output: StructuralContext    │      │   • Evidence type                  ││
│   │                                │      │   • Recency                        ││
│   │                                │      │                                    ││
│   │                                │      │   Output: DocumentChunks[]         ││
│   └────────────────────────────────┘      └────────────────────────────────────┘│
│                  │                                           │                   │
│                  └─────────────────┬─────────────────────────┘                   │
│                                    ▼                                             │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │                      CONTEXT FUSION ENGINE                                 │  │
│   │                                                                            │  │
│   │   1. Rank documents by structural relevance                                │  │
│   │   2. Cross-reference with domain entities                                  │  │
│   │   3. Apply persona-specific weighting                                      │  │
│   │   4. Assemble context window (token budget aware)                          │  │
│   │                                                                            │  │
│   │   Output: IntelligenceContext { context_window, sources, confidence }      │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Intelligence Broker Implementation

```python
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import asyncio

@dataclass
class DomainEntity:
    id: str
    type: str  # 'product', 'disease', 'therapeutic_area', 'evidence_type'
    name: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    relationships: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'metadata': self.metadata
        }

@dataclass
class DocumentChunk:
    id: str
    content: str
    source: str
    metadata: Dict[str, Any]
    relevance_score: float
    embedding_distance: float

@dataclass
class IntelligenceContext:
    structural_context: Dict[str, Any]
    document_chunks: List[DocumentChunk]
    domain_entities: List[DomainEntity]
    relevance_scores: Dict[str, float]
    context_window: str
    token_count: int
    confidence: float

class IntelligenceBroker:
    """
    Unified intelligence retrieval combining GraphRAG and VectorRAG.
    v2.0: Integrated with L0 Domain Knowledge layer.
    """
    
    def __init__(
        self,
        graph_client: 'Neo4jClient',
        vector_client: 'PineconeClient',
        entity_resolver: 'EntityResolver',
        query_analyzer: 'QueryAnalyzer',
        config: Dict[str, Any]
    ):
        self.graph = graph_client
        self.vector = vector_client
        self.resolver = entity_resolver
        self.analyzer = query_analyzer
        self.config = config
        self.max_tokens = config.get('max_context_tokens', 8000)
    
    async def get_context(
        self,
        query: str,
        persona_id: str,
        execution_context: Dict[str, Any]
    ) -> IntelligenceContext:
        """
        Main entry point for agents to retrieve unified intelligence context.
        """
        
        # Step 1: Analyze query
        analysis = await self.analyzer.analyze(query)
        
        # Step 2: Resolve domain entities (L0)
        domain_entities = await self.resolver.resolve(
            entity_mentions=analysis.entity_mentions,
            tenant_id=execution_context['tenant_id']
        )
        
        # Step 3: Parallel retrieval from Graph and Vector
        structural_task = self._query_graph(
            persona_id=persona_id,
            domain_entities=domain_entities,
            query_intent=analysis.intent,
            tenant_id=execution_context['tenant_id']
        )
        
        vector_task = self._query_vectors(
            query=query,
            domain_entities=domain_entities,
            filters=self._build_filters(execution_context, domain_entities),
            top_k=self.config.get('vector_top_k', 20)
        )
        
        structural_context, document_chunks = await asyncio.gather(
            structural_task,
            vector_task
        )
        
        # Step 4: Rank and fuse results
        ranked_chunks = self._rank_and_fuse(
            chunks=document_chunks,
            structural_context=structural_context,
            domain_entities=domain_entities,
            persona_id=persona_id
        )
        
        # Step 5: Assemble context window (token-aware)
        context_window, token_count = self._assemble_context_window(
            structural=structural_context,
            documents=ranked_chunks,
            domain=domain_entities,
            max_tokens=self.max_tokens
        )
        
        # Step 6: Calculate confidence
        confidence = self._calculate_confidence(
            structural_context=structural_context,
            document_count=len(ranked_chunks),
            domain_match_rate=self._domain_match_rate(ranked_chunks, domain_entities)
        )
        
        return IntelligenceContext(
            structural_context=structural_context,
            document_chunks=ranked_chunks,
            domain_entities=domain_entities,
            relevance_scores=self._compute_relevance_scores(ranked_chunks),
            context_window=context_window,
            token_count=token_count,
            confidence=confidence
        )
    
    async def get_persona_context(self, persona_id: str) -> Dict[str, Any]:
        """
        Get persona context from IIG for routing decisions.
        """
        
        result = await self.graph.query("""
            MATCH (p:Persona {id: $persona_id})
            OPTIONAL MATCH (p)-[:HOLDS_ROLE]->(r:Role)
            OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Department)
            OPTIONAL MATCH (d)-[:PART_OF]->(f:Function)
            OPTIONAL MATCH (p)-[:HAS_ARCHETYPE]->(a:Archetype)
            OPTIONAL MATCH (p)-[:HAS_JTBD]->(j:JTBD)
            
            RETURN p {
                .id, .name,
                role: r.name,
                department: d.name,
                function: f.name,
                archetype: a.name,
                ai_maturity: p.ai_maturity_score,
                jtbd_categories: collect(DISTINCT j.category)
            } as persona
        """, persona_id=persona_id)
        
        return result[0]['persona'] if result else {}
    
    async def _query_graph(
        self,
        persona_id: str,
        domain_entities: List[DomainEntity],
        query_intent: str,
        tenant_id: str
    ) -> Dict[str, Any]:
        """
        Query IIG for structural context using GraphRAG patterns.
        """
        
        # Get persona's L1-L3 context
        persona_graph = await self.graph.query("""
            MATCH (p:Persona {id: $persona_id})
            OPTIONAL MATCH (p)-[:HOLDS_ROLE]->(r:Role)
            OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Department)
            OPTIONAL MATCH (p)-[:HAS_JTBD]->(j:JTBD)
            OPTIONAL MATCH (j)-[:REQUIRES_CAPABILITY]->(c:Capability)
            OPTIONAL MATCH (j)-[:USES_WORKFLOW]->(w:Workflow)
            
            RETURN {
                persona: p { .id, .name, .archetype },
                role: r { .name, .responsibilities },
                department: d { .name },
                jtbd: collect(DISTINCT j { .id, .name, .category }),
                capabilities: collect(DISTINCT c { .name }),
                workflows: collect(DISTINCT w { .id, .name })
            } as context
        """, persona_id=persona_id)
        
        # Get domain entity relationships (L0)
        domain_graph = {}
        if domain_entities:
            entity_ids = [e.id for e in domain_entities]
            domain_graph = await self.graph.query("""
                MATCH (e:DomainEntity)
                WHERE e.id IN $entity_ids
                OPTIONAL MATCH (e)-[r]->(related)
                
                RETURN e.id as entity_id, 
                       collect({type: type(r), target: related { .* }}) as relationships
            """, entity_ids=entity_ids)
        
        # Combine contexts
        return {
            'persona': persona_graph[0]['context'] if persona_graph else {},
            'domain': domain_graph,
            'summary': self._summarize_structural_context(persona_graph, domain_graph)
        }
    
    async def _query_vectors(
        self,
        query: str,
        domain_entities: List[DomainEntity],
        filters: Dict[str, Any],
        top_k: int
    ) -> List[DocumentChunk]:
        """
        Query Pinecone for relevant document chunks.
        """
        
        # Enhance query with domain context
        enhanced_query = self._enhance_query_with_domain(query, domain_entities)
        
        # Query Pinecone
        results = await self.vector.query(
            query=enhanced_query,
            top_k=top_k,
            filters=filters,
            include_metadata=True
        )
        
        # Convert to DocumentChunk objects
        chunks = []
        for match in results.matches:
            chunks.append(DocumentChunk(
                id=match.id,
                content=match.metadata.get('content', ''),
                source=match.metadata.get('source', ''),
                metadata=match.metadata,
                relevance_score=match.score,
                embedding_distance=1 - match.score
            ))
        
        return chunks
    
    def _rank_and_fuse(
        self,
        chunks: List[DocumentChunk],
        structural_context: Dict[str, Any],
        domain_entities: List[DomainEntity],
        persona_id: str
    ) -> List[DocumentChunk]:
        """
        Re-rank document chunks based on structural and domain relevance.
        """
        
        entity_names = {e.name.lower() for e in domain_entities}
        persona_jtbd_categories = set(
            structural_context.get('persona', {}).get('jtbd_categories', [])
        )
        
        for chunk in chunks:
            # Boost for domain entity mentions
            entity_boost = sum(
                0.1 for name in entity_names 
                if name in chunk.content.lower()
            )
            
            # Boost for JTBD category alignment
            doc_categories = set(chunk.metadata.get('categories', []))
            category_boost = len(persona_jtbd_categories & doc_categories) * 0.05
            
            # Boost for recency (within last 2 years)
            recency_boost = 0.1 if self._is_recent(chunk.metadata.get('date')) else 0
            
            # Adjust relevance score
            chunk.relevance_score = min(1.0, 
                chunk.relevance_score + entity_boost + category_boost + recency_boost
            )
        
        # Sort by adjusted relevance
        return sorted(chunks, key=lambda c: c.relevance_score, reverse=True)
    
    def _assemble_context_window(
        self,
        structural: Dict[str, Any],
        documents: List[DocumentChunk],
        domain: List[DomainEntity],
        max_tokens: int
    ) -> tuple[str, int]:
        """
        Assemble context window within token budget.
        """
        
        sections = []
        token_count = 0
        
        # Section 1: Domain Context (priority)
        if domain:
            domain_section = "## Domain Context\n"
            for entity in domain[:5]:  # Limit to top 5 entities
                domain_section += f"- **{entity.type.title()}**: {entity.name}\n"
                if entity.metadata:
                    for k, v in list(entity.metadata.items())[:3]:
                        domain_section += f"  - {k}: {v}\n"
            sections.append(domain_section)
            token_count += self._estimate_tokens(domain_section)
        
        # Section 2: Structural Context
        if structural.get('persona'):
            persona = structural['persona']
            structural_section = f"""## User Context
- **Role**: {persona.get('role', 'Unknown')}
- **Department**: {persona.get('department', 'Unknown')}
- **Archetype**: {persona.get('archetype', 'Unknown')}
"""
            sections.append(structural_section)
            token_count += self._estimate_tokens(structural_section)
        
        # Section 3: Document Evidence (fill remaining budget)
        remaining_tokens = max_tokens - token_count - 500  # Reserve 500 for formatting
        
        if documents and remaining_tokens > 0:
            doc_section = "## Relevant Evidence\n"
            
            for i, chunk in enumerate(documents, 1):
                chunk_text = f"\n### Source {i}: {chunk.metadata.get('title', 'Unknown')}\n"
                chunk_text += f"*Type: {chunk.metadata.get('document_type', 'Unknown')}*\n\n"
                chunk_text += chunk.content + "\n"
                
                chunk_tokens = self._estimate_tokens(chunk_text)
                
                if token_count + chunk_tokens > max_tokens:
                    break
                
                doc_section += chunk_text
                token_count += chunk_tokens
            
            sections.append(doc_section)
        
        context_window = "\n".join(sections)
        return context_window, token_count
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count (rough approximation)."""
        return len(text) // 4
    
    def _is_recent(self, date_str: Optional[str]) -> bool:
        """Check if date is within last 2 years."""
        if not date_str:
            return False
        try:
            from datetime import datetime, timedelta
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return date > datetime.now() - timedelta(days=730)
        except:
            return False
    
    def _calculate_confidence(
        self,
        structural_context: Dict[str, Any],
        document_count: int,
        domain_match_rate: float
    ) -> float:
        """Calculate confidence score for the intelligence context."""
        
        # Base confidence
        confidence = 0.5
        
        # Boost for structural context presence
        if structural_context.get('persona'):
            confidence += 0.1
        
        # Boost for document coverage
        confidence += min(0.2, document_count * 0.02)
        
        # Boost for domain entity matching
        confidence += domain_match_rate * 0.2
        
        return min(1.0, confidence)
    
    def _domain_match_rate(
        self,
        chunks: List[DocumentChunk],
        entities: List[DomainEntity]
    ) -> float:
        """Calculate rate of domain entity presence in documents."""
        if not entities or not chunks:
            return 0.0
        
        entity_names = {e.name.lower() for e in entities}
        matching_chunks = sum(
            1 for chunk in chunks 
            if any(name in chunk.content.lower() for name in entity_names)
        )
        
        return matching_chunks / len(chunks)
```

---

# 6. Agent Architecture

## 6.1 Enhanced Agent Model (v2.0)

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class AgentCapability(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]

class AgentConfig(BaseModel):
    id: str
    name: str
    description: str
    domain: str
    agent_type: str  # 'expert', 'specialist', 'orchestrator', 'validator'
    capability_level: str  # 'L1', 'L2', 'L3', 'L4'
    autonomy_level: str  # 'fully_autonomous', 'semi_autonomous', 'supervised'
    
    # LLM Configuration
    model_provider: str
    model_name: str
    temperature: float = 0.7
    max_tokens: int = 2048
    
    # Prompt Configuration
    system_prompt_template: str
    context_injection_rules: List[str]
    
    # v2.0: Broker Integration
    broker_enabled: bool = True
    broker_context_budget: int = 6000
    
    # v2.0: Governance Integration
    governance_policies: List[str] = []
    requires_pre_check: bool = True
    requires_post_check: bool = True
    
    # RAG Configuration (now via Broker)
    rag_namespaces: List[str] = []
    
    # Tool Configuration
    tools: List[str] = []
    
    # Safety
    safety_triggers: List[str] = []
    max_retries: int = 3

class BaseAgent(ABC):
    """
    Abstract base class for all agents.
    v2.0: Integrated with Intelligence Broker and Governance Engine.
    """
    
    def __init__(
        self,
        config: AgentConfig,
        broker: 'IntelligenceBroker',
        governance: 'GovernanceEngine'
    ):
        self.config = config
        self.broker = broker
        self.governance = governance
        self.llm = self._initialize_llm()
        self.tools = self._initialize_tools()
    
    @abstractmethod
    async def execute(
        self, 
        input: Dict[str, Any], 
        context: 'IntelligenceContext'
    ) -> Dict[str, Any]:
        """Execute the agent's primary function."""
        pass
    
    async def invoke(
        self, 
        input: Dict[str, Any], 
        execution_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Main entry point with broker and governance integration.
        """
        
        # Step 1: Pre-execution governance check
        if self.config.requires_pre_check:
            pre_check = await self.governance.pre_execution_check(
                action_type=self.config.agent_type,
                target_layer=self.config.capability_level,
                query=input.get('query', ''),
                persona=execution_context.get('persona', {}),
                context=execution_context
            )
            
            if pre_check.decision == GovernanceDecision.BLOCKED:
                return self._create_blocked_response(pre_check)
            
            if pre_check.decision == GovernanceDecision.HITL_REQUIRED:
                return self._create_hitl_response(pre_check)
        
        # Step 2: Get intelligence context from Broker
        intelligence_context = await self.broker.get_context(
            query=input.get('query', ''),
            persona_id=execution_context.get('persona_id'),
            execution_context=execution_context
        )
        
        # Step 3: Execute with retry logic
        for attempt in range(self.config.max_retries):
            try:
                result = await self.execute(input, intelligence_context)
                
                # Step 4: Post-execution governance check
                if self.config.requires_post_check:
                    post_check = await self.governance.post_execution_check(
                        output=result,
                        context=execution_context
                    )
                    
                    if post_check.decision == GovernanceDecision.BLOCKED:
                        return self._create_filtered_response(result, post_check)
                    
                    if post_check.modifications:
                        result = self._apply_modifications(result, post_check.modifications)
                
                return result
                
            except Exception as e:
                if attempt == self.config.max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
    
    def _build_prompt(
        self, 
        input: Dict[str, Any], 
        intelligence_context: 'IntelligenceContext'
    ) -> str:
        """Build prompt with intelligence context injection."""
        
        prompt = self.config.system_prompt_template
        
        # Inject intelligence context
        prompt = prompt.replace(
            '{{INTELLIGENCE_CONTEXT}}', 
            intelligence_context.context_window
        )
        
        # Inject query
        prompt = prompt.replace('{{QUERY}}', input.get('query', ''))
        
        # Inject domain entities summary
        domain_summary = ", ".join([e.name for e in intelligence_context.domain_entities])
        prompt = prompt.replace('{{DOMAIN_ENTITIES}}', domain_summary)
        
        return prompt


class ExpertAgent(BaseAgent):
    """
    L1 Expert Agent - Single domain specialist.
    v2.0: Uses Intelligence Broker for context.
    """
    
    async def execute(
        self, 
        input: Dict[str, Any], 
        context: 'IntelligenceContext'
    ) -> Dict[str, Any]:
        """Execute expert query with broker-provided context."""
        
        # Build prompt with intelligence context
        prompt = self._build_prompt(input, context)
        
        # Call LLM
        response = await self.llm.generate(
            prompt=prompt,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens
        )
        
        # Extract sources from context
        sources = [
            {
                'title': chunk.metadata.get('title'),
                'source': chunk.source,
                'relevance': chunk.relevance_score
            }
            for chunk in context.document_chunks[:5]
        ]
        
        return {
            'answer': response.content,
            'sources': sources,
            'confidence': context.confidence,
            'domain_entities': [e.to_dict() for e in context.domain_entities]
        }
```

---

# 7. Panel Orchestration

## 7.1 Structured Deliberation Patterns

```python
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

class DeliberationPattern(Enum):
    SEQUENTIAL = "sequential"      # Chain of thought
    PARALLEL = "parallel"          # Independent then merge
    ADVERSARIAL = "adversarial"    # Opposing viewpoints
    SOCRATIC = "socratic"          # Deep exploration via questioning
    DELPHI = "delphi"              # Build consensus iteratively
    CRITIQUE = "critique"          # Generate then critique

@dataclass
class PanelConfig:
    pattern: DeliberationPattern
    agents: List[str]
    max_rounds: int
    consensus_threshold: float
    governance_checkpoint: bool
    moderator_agent: Optional[str]

class PanelOrchestrator:
    """
    Orchestrates multi-agent deliberation with structured patterns.
    v2.0: Enhanced with governance checkpoints and broker integration.
    """
    
    def __init__(
        self,
        agent_registry: 'AgentRegistry',
        broker: 'IntelligenceBroker',
        governance: 'GovernanceEngine'
    ):
        self.registry = agent_registry
        self.broker = broker
        self.governance = governance
    
    async def orchestrate(
        self,
        config: PanelConfig,
        input: Dict[str, Any],
        execution_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Orchestrate panel deliberation based on pattern.
        """
        
        # Get shared intelligence context
        intelligence_context = await self.broker.get_context(
            query=input.get('query', ''),
            persona_id=execution_context.get('persona_id'),
            execution_context=execution_context
        )
        
        # Select orchestration method
        if config.pattern == DeliberationPattern.SEQUENTIAL:
            return await self._sequential_deliberation(config, input, intelligence_context, execution_context)
        
        elif config.pattern == DeliberationPattern.PARALLEL:
            return await self._parallel_deliberation(config, input, intelligence_context, execution_context)
        
        elif config.pattern == DeliberationPattern.ADVERSARIAL:
            return await self._adversarial_deliberation(config, input, intelligence_context, execution_context)
        
        elif config.pattern == DeliberationPattern.SOCRATIC:
            return await self._socratic_deliberation(config, input, intelligence_context, execution_context)
        
        elif config.pattern == DeliberationPattern.DELPHI:
            return await self._delphi_deliberation(config, input, intelligence_context, execution_context)
        
        elif config.pattern == DeliberationPattern.CRITIQUE:
            return await self._critique_deliberation(config, input, intelligence_context, execution_context)
    
    async def _adversarial_deliberation(
        self,
        config: PanelConfig,
        input: Dict[str, Any],
        context: 'IntelligenceContext',
        execution_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Adversarial pattern: agents argue opposing positions,
        moderator synthesizes.
        """
        
        # Assign roles: proponent, opponent, moderator
        proponent = await self.registry.get_agent(config.agents[0])
        opponent = await self.registry.get_agent(config.agents[1])
        moderator = await self.registry.get_agent(config.moderator_agent)
        
        positions = []
        
        for round in range(config.max_rounds):
            # Proponent presents/refines position
            proponent_input = {
                'query': input['query'],
                'role': 'proponent',
                'previous_positions': positions,
                'round': round + 1
            }
            proponent_response = await proponent.invoke(proponent_input, execution_context)
            positions.append({'agent': 'proponent', 'position': proponent_response})
            
            # Opponent counters
            opponent_input = {
                'query': input['query'],
                'role': 'opponent',
                'previous_positions': positions,
                'round': round + 1
            }
            opponent_response = await opponent.invoke(opponent_input, execution_context)
            positions.append({'agent': 'opponent', 'position': opponent_response})
            
            # Check for governance checkpoint
            if config.governance_checkpoint and round == config.max_rounds // 2:
                check = await self.governance.pre_execution_check(
                    action_type='panel_checkpoint',
                    target_layer='L2',
                    query=str(positions),
                    persona=execution_context.get('persona', {}),
                    context=execution_context
                )
                
                if check.decision == GovernanceDecision.HITL_REQUIRED:
                    # Pause for human review
                    await self._await_hitl_approval(check.hitl_checkpoint)
        
        # Moderator synthesizes
        synthesis_input = {
            'query': input['query'],
            'positions': positions,
            'task': 'synthesize balanced conclusion'
        }
        synthesis = await moderator.invoke(synthesis_input, execution_context)
        
        return {
            'synthesis': synthesis,
            'deliberation': positions,
            'pattern': 'adversarial',
            'rounds': config.max_rounds,
            'confidence': context.confidence
        }
    
    async def _delphi_deliberation(
        self,
        config: PanelConfig,
        input: Dict[str, Any],
        context: 'IntelligenceContext',
        execution_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Delphi pattern: iterative consensus building.
        Anonymous voting and refinement until convergence.
        """
        
        agents = [await self.registry.get_agent(aid) for aid in config.agents]
        
        rounds = []
        consensus_reached = False
        
        for round in range(config.max_rounds):
            # Collect anonymous positions
            positions = []
            
            for agent in agents:
                agent_input = {
                    'query': input['query'],
                    'previous_rounds': rounds,
                    'round': round + 1,
                    'task': 'provide position and confidence'
                }
                response = await agent.invoke(agent_input, execution_context)
                positions.append({
                    'position': response.get('answer'),
                    'confidence': response.get('confidence', 0.5),
                    'reasoning': response.get('reasoning', '')
                })
            
            # Calculate consensus
            consensus_score = self._calculate_consensus(positions)
            
            rounds.append({
                'round': round + 1,
                'positions': positions,
                'consensus_score': consensus_score
            })
            
            if consensus_score >= config.consensus_threshold:
                consensus_reached = True
                break
        
        # Generate final synthesis
        final_position = self._synthesize_positions(
            [r['positions'] for r in rounds]
        )
        
        return {
            'conclusion': final_position,
            'consensus_reached': consensus_reached,
            'consensus_score': rounds[-1]['consensus_score'],
            'rounds': rounds,
            'pattern': 'delphi'
        }
    
    def _calculate_consensus(self, positions: List[Dict]) -> float:
        """Calculate consensus score from positions."""
        if len(positions) < 2:
            return 1.0
        
        # Simple cosine similarity between position embeddings
        # (simplified implementation)
        confidences = [p['confidence'] for p in positions]
        avg_confidence = sum(confidences) / len(confidences)
        variance = sum((c - avg_confidence) ** 2 for c in confidences) / len(confidences)
        
        return max(0, 1 - variance)
```

---

# 8. Projection Spine (CDC Architecture)

## 8.1 Real-Time Synchronization

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         PROJECTION SPINE ARCHITECTURE                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        PostgreSQL (Supabase)                             │    │
│   │                                                                          │    │
│   │   • Source of Truth (280+ tables)                                        │    │
│   │   • RLS Policies for tenant isolation                                    │    │
│   │   • Logical replication enabled (WAL)                                    │    │
│   │                                                                          │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                        │
│                                         │ WAL (Write-Ahead Log)                 │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        Debezium CDC Connector                            │    │
│   │                                                                          │    │
│   │   • Parses PostgreSQL WAL                                                │    │
│   │   • Captures INSERT, UPDATE, DELETE events                               │    │
│   │   • At-least-once delivery guarantee                                     │    │
│   │   • Maintains replication slot                                           │    │
│   │                                                                          │    │
│   │   Tables Captured:                                                       │    │
│   │   • personas, jtbd, workflows, tasks                                     │    │
│   │   • domain_* (L0 entities)                                               │    │
│   │   • agents, agent_graphs, panels                                         │    │
│   │   • opportunities, value_drivers                                         │    │
│   │                                                                          │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                        │
│                                         │ Change Events (JSON)                  │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        Apache Kafka                                      │    │
│   │                                                                          │    │
│   │   Topics:                                                                │    │
│   │   • vital.ontology.personas                                              │    │
│   │   • vital.ontology.jtbd                                                  │    │
│   │   • vital.ontology.workflows                                             │    │
│   │   • vital.ontology.domain_*                                              │    │
│   │                                                                          │    │
│   │   Configuration:                                                         │    │
│   │   • 3 partitions per topic                                               │    │
│   │   • Replication factor: 3                                                │    │
│   │   • Retention: 7 days                                                    │    │
│   │                                                                          │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                        │
│                                         │ Consumer Group                        │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        Graph Sync Service                                │    │
│   │                                                                          │    │
│   │   • Consumes change events                                               │    │
│   │   • Idempotent graph updates                                             │    │
│   │   • Exactly-once semantics (via offset tracking)                         │    │
│   │   • Dead letter queue for failures                                       │    │
│   │                                                                          │    │
│   │   SLA: < 500ms from commit to graph update                              │    │
│   │                                                                          │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                        │
│                                         │ Cypher Mutations                      │
│                                         ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐    │
│   │                        Neo4j (IIG)                                       │    │
│   │                                                                          │    │
│   │   • L0-L7 Ontology nodes and relationships                               │    │
│   │   • Optimized for graph traversal                                        │    │
│   │   • Causal consistency with PostgreSQL                                   │    │
│   │                                                                          │    │
│   └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Graph Sync Service Implementation

```python
from kafka import KafkaConsumer, TopicPartition
from neo4j import GraphDatabase
import json
import asyncio
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class CDCEvent:
    lsn: str
    operation: str  # 'c' (create), 'u' (update), 'd' (delete)
    table: str
    before: Optional[Dict[str, Any]]
    after: Optional[Dict[str, Any]]
    timestamp: int

class GraphSyncService:
    """
    Consumes CDC events from Kafka and updates Neo4j IIG.
    Implements exactly-once semantics via idempotent operations.
    """
    
    def __init__(
        self,
        kafka_config: Dict[str, Any],
        neo4j_config: Dict[str, Any],
        sync_log: 'SyncLogRepository'
    ):
        self.consumer = KafkaConsumer(
            bootstrap_servers=kafka_config['bootstrap_servers'],
            group_id='graph-sync-service',
            auto_offset_reset='earliest',
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        self.consumer.subscribe(pattern='vital.ontology.*')
        
        self.driver = GraphDatabase.driver(
            neo4j_config['uri'],
            auth=(neo4j_config['user'], neo4j_config['password'])
        )
        self.sync_log = sync_log
        self.dlq_producer = self._init_dlq_producer(kafka_config)
    
    async def run(self):
        """Main processing loop."""
        
        while True:
            messages = self.consumer.poll(timeout_ms=100)
            
            for topic_partition, records in messages.items():
                for record in records:
                    await self._process_event(record)
    
    async def _process_event(self, record) -> None:
        """Process a single CDC event."""
        
        event = self._parse_event(record)
        
        # Idempotency check
        if await self.sync_log.is_processed(event.lsn):
            self.consumer.commit()
            return
        
        try:
            # Route to appropriate handler
            if event.table == 'personas':
                await self._sync_persona(event)
            elif event.table == 'jtbd':
                await self._sync_jtbd(event)
            elif event.table == 'workflows':
                await self._sync_workflow(event)
            elif event.table.startswith('domain_'):
                await self._sync_domain_entity(event)
            elif event.table == 'agents':
                await self._sync_agent(event)
            elif event.table == 'opportunities':
                await self._sync_opportunity(event)
            
            # Mark as processed
            await self.sync_log.mark_processed(event.lsn, event.table)
            self.consumer.commit()
            
        except Exception as e:
            # Send to dead letter queue
            await self._send_to_dlq(event, str(e))
            self.consumer.commit()
    
    def _parse_event(self, record) -> CDCEvent:
        """Parse Kafka record into CDCEvent."""
        
        payload = record.value.get('payload', {})
        
        return CDCEvent(
            lsn=payload.get('source', {}).get('lsn', ''),
            operation=payload.get('op', ''),
            table=payload.get('source', {}).get('table', ''),
            before=payload.get('before'),
            after=payload.get('after'),
            timestamp=payload.get('ts_ms', 0)
        )
    
    async def _sync_persona(self, event: CDCEvent) -> None:
        """Sync persona changes to Neo4j."""
        
        async with self.driver.session() as session:
            if event.operation == 'c':
                # Create persona node and relationships
                await session.run("""
                    MERGE (p:Persona {id: $id})
                    SET p.name = $name,
                        p.title = $title,
                        p.archetype = $archetype,
                        p.ai_maturity_score = $ai_maturity,
                        p.updated_at = datetime()
                    
                    WITH p
                    MATCH (r:Role {id: $role_id})
                    MERGE (p)-[:HOLDS_ROLE]->(r)
                    
                    WITH p
                    MATCH (a:Archetype {name: $archetype})
                    MERGE (p)-[:HAS_ARCHETYPE]->(a)
                """, 
                    id=event.after['id'],
                    name=event.after['name'],
                    title=event.after.get('title', ''),
                    archetype=event.after.get('archetype', 'LEARNER'),
                    ai_maturity=event.after.get('ai_maturity_score', 0),
                    role_id=event.after.get('role_id')
                )
            
            elif event.operation == 'u':
                # Update persona properties
                await session.run("""
                    MATCH (p:Persona {id: $id})
                    SET p.name = $name,
                        p.title = $title,
                        p.archetype = $archetype,
                        p.ai_maturity_score = $ai_maturity,
                        p.updated_at = datetime()
                    
                    WITH p
                    OPTIONAL MATCH (p)-[old_arch:HAS_ARCHETYPE]->()
                    DELETE old_arch
                    
                    WITH p
                    MATCH (a:Archetype {name: $archetype})
                    MERGE (p)-[:HAS_ARCHETYPE]->(a)
                """,
                    id=event.after['id'],
                    name=event.after['name'],
                    title=event.after.get('title', ''),
                    archetype=event.after.get('archetype', 'LEARNER'),
                    ai_maturity=event.after.get('ai_maturity_score', 0)
                )
            
            elif event.operation == 'd':
                # Delete persona and relationships
                await session.run("""
                    MATCH (p:Persona {id: $id})
                    DETACH DELETE p
                """, id=event.before['id'])
    
    async def _sync_domain_entity(self, event: CDCEvent) -> None:
        """Sync L0 domain entities to Neo4j."""
        
        # Determine entity type from table name
        entity_type = event.table.replace('domain_', '').title()
        
        async with self.driver.session() as session:
            if event.operation in ['c', 'u']:
                data = event.after
                
                await session.run(f"""
                    MERGE (e:DomainEntity:{entity_type} {{id: $id}})
                    SET e.name = $name,
                        e.code = $code,
                        e.metadata = $metadata,
                        e.updated_at = datetime()
                """,
                    id=data['id'],
                    name=data.get('name', ''),
                    code=data.get('code', ''),
                    metadata=json.dumps(data)
                )
            
            elif event.operation == 'd':
                await session.run("""
                    MATCH (e:DomainEntity {id: $id})
                    DETACH DELETE e
                """, id=event.before['id'])
```

---

# 9. Deployment Architecture

## 9.1 Kubernetes Deployment

```yaml
# agent-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-service
  labels:
    app: vital-agents
    version: v2.0
spec:
  replicas: 10
  selector:
    matchLabels:
      app: vital-agents
  template:
    metadata:
      labels:
        app: vital-agents
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      containers:
      - name: agent-service
        image: vital/agent-service:v2.0
        ports:
        - containerPort: 8080
        env:
        - name: BROKER_URL
          value: "http://intelligence-broker:8080"
        - name: GOVERNANCE_URL
          value: "http://governance-engine:8080"
        - name: NEO4J_URI
          valueFrom:
            secretKeyRef:
              name: neo4j-credentials
              key: uri
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: pinecone-credentials
              key: api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agent-service
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: agent_queue_depth
      target:
        type: AverageValue
        averageValue: 10
```

---

# 10. Security Considerations

## 10.1 Security Controls (v2.0)

| Control | Implementation | v2.0 Enhancement |
|---------|----------------|------------------|
| **Authentication** | JWT with short-lived tokens (15 min) | Added service mesh mTLS |
| **Authorization** | RBAC with RLS at database level | Policy-as-Code (OPA) integration |
| **Encryption in Transit** | TLS 1.3 for all communications | mTLS between services |
| **Encryption at Rest** | AES-256 for all data stores | Key rotation automation |
| **Secrets Management** | HashiCorp Vault | Dynamic secrets for databases |
| **API Security** | Rate limiting, request validation | Added input sanitization |
| **Audit Logging** | All agent interactions logged | Immutable audit trail |
| **Data Isolation** | Tenant-level separation | Enhanced RLS policies |
| **Compliance** | HIPAA, SOC2 | Policy-as-Code enforcement |

## 10.2 Threat Model (v2.0)

| Threat | v1.0 Mitigation | v2.0 Enhancement |
|--------|-----------------|------------------|
| Prompt Injection | Input validation | Pre-execution policy check |
| Data Leakage | Tenant isolation | Broker-level filtering |
| Model Abuse | Rate limiting | Governance monitoring |
| Unauthorized Access | Strong auth | Zero-trust architecture |
| Compliance Violation | Post-check filtering | Pre-execution blocking |
| Knowledge Graph Poisoning | N/A | **NEW**: CDC validation |

---

# 11. v1 to v2 Migration Guide

## 11.1 Breaking Changes

| Component | v1.0 | v2.0 | Migration Action |
|-----------|------|------|------------------|
| RAG Access | Direct to Pinecone | Via Intelligence Broker | Update agent configs |
| Graph Access | Direct to Neo4j | Via Intelligence Broker | Update agent configs |
| Governance | Post-execution | Pre + Post execution | Add policy definitions |
| Sync | Batch ETL | CDC (Kafka) | Deploy CDC pipeline |
| Ontology | L1-L7 | L0-L7 | Migrate domain data |

## 11.2 Migration Steps

1. **Deploy CDC Infrastructure**
   - Install Debezium connector
   - Configure Kafka topics
   - Deploy Graph Sync Service

2. **Deploy Governance Engine**
   - Install OPA
   - Define policy bundles
   - Configure HITL workflow

3. **Deploy Intelligence Broker**
   - Configure Entity Resolver
   - Set up context fusion
   - Test with sample queries

4. **Migrate Agents**
   - Update AgentConfig to include broker/governance
   - Remove direct RAG access
   - Add governance policy references

5. **Populate L0 Domain Knowledge**
   - Migrate existing domain data
   - Configure entity relationships
   - Validate graph integrity

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-28 | Architecture Team | Initial multi-agent orchestration |
| 2.0 | 2025-11-28 | Architecture Team | Intelligence Broker, Policy-as-Code, CDC Pipeline, L0 Integration |

---

**Document Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Chief Architect | | | |
| Engineering Lead | | | |
| Security Lead | | | |
| AI/ML Lead | | | |
| Platform Lead | | | |
| Compliance Lead | | | |

---

**END OF ARD v2.0**
