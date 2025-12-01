# VITAL Platform: Enterprise Intelligence Operating System
## Master Strategy Document v5.0

**Document Classification:** Enterprise Transformation Blueprint  
**Version:** 5.0 (Enterprise Intelligence Operating System)  
**Last Updated:** November 28, 2025  
**Status:** Board-Ready | Implementation-Ready | Future-Proof  
**Audience:** Executive Leadership | Product | Engineering | Operations | Architecture

---

# VOLUME I: STRATEGIC FOUNDATION

---

# Executive Summary

## The Enterprise Intelligence Vision

> "To establish a unified **Enterprise Intelligence Operating System** that serves as the cognitive architecture for the autonomous enterprise. This system provides a living, semantic map of organizational knowledge, execution, and value, enabling AI agents and human experts to seamlessly collaborate, optimize operations, predict outcomes, and drive strategic transformation across all functions."

The VITAL Platform evolves beyond a functional operating system into the **Enterprise Intelligence Operating System (OS)**, powered by the **Interaction Intelligence Graph (IIG)**. This represents the central nervous system of the organization, characterized by:

- **Universal Applicability:** A function-agnostic metamodel that scales horizontally across Medical Affairs, R&D, Commercial, Finance, and all enterprise functions
- **AI-Native Execution:** Designed explicitly for multi-agent orchestration (LangGraph) and deep semantic reasoning
- **Continuous Transformation:** A system that autonomously identifies opportunities and optimizes execution (Level 5 Maturity)

## The Transformation Imperative

Medical Affairs operates at the intersection of science, strategy, and stakeholder engagement—a uniquely complex domain where:

| Challenge | Current State | Future State | Impact |
|-----------|---------------|--------------|--------|
| Information Volume | Exceeds human processing capacity | AI-synthesized intelligence | 10x throughput |
| Compliance Requirements | Manual accuracy verification | Automated compliance-by-design | 99.9% accuracy |
| Stakeholder Expectations | Reactive, generalized engagement | Proactive, personalized engagement | 85% satisfaction |
| Strategic Decisions | Subjective, experience-based | Data-driven, evidence-based | 3x better outcomes |
| Operational Processes | Manual despite digital investments | AI-native automation | 92% time reduction |

## The Dual-Purpose Platform: Transformation Flywheel

VITAL serves simultaneously as two engines that create a self-accelerating flywheel:

### 1. Personalization Engine (Adoption Driver)
- Context-aware AI copilots for every role
- Role-specific, persona-adapted interactions using L1-L4 services
- Progressive capability disclosure based on AI maturity
- Workflow automation aligned to individual JTBD
- **Mechanism:** Role → Persona Archetype → JTBD → Context

### 2. Transformation Engine (Value Driver)
- AI opportunity identification and prioritization (Opportunity Radar)
- Transformation readiness assessment (AI Maturity Heatmaps)
- Capability gap analysis and L&D alignment
- Value realization tracking and ROI measurement
- **Mechanism:** Aggregates usage data to provide strategic intelligence

### The Flywheel Effect

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TRANSFORMATION FLYWHEEL                              │
│                                                                          │
│    ┌──────────────────┐                    ┌──────────────────┐         │
│    │  PERSONALIZATION │                    │ TRANSFORMATION   │         │
│    │      ENGINE      │                    │     ENGINE       │         │
│    │                  │     ─────────►     │                  │         │
│    │  Drives Daily    │     Usage Data     │  Provides        │         │
│    │  Adoption        │                    │  Intelligence    │         │
│    │                  │     ◄─────────     │                  │         │
│    │  L1-L4 Services  │   Opportunities    │  Radar & Maturity│         │
│    └──────────────────┘                    └──────────────────┘         │
│                                                                          │
│    Adoption → Data → Intelligence → Opportunities → Personalization     │
│                           ↑__________________________________|          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 1. The Bulletproof Strategy: Four Strategic Pillars

## Pillar 1: Deepening the Semantic Core (The Domain Knowledge Layer)

### The Critical Gap

The current 7-layer operational ontology excels at modeling *how work is done, who does it, and why*. However, it lacks a structured representation of the *subject matter* required for deep, domain-specific AI reasoning.

### The Solution: Layer 0 - Domain Knowledge

We introduce **Layer 0: The Domain Knowledge Layer** as the foundation that models core business domain concepts:

**For Medical Affairs:**
- Diseases and Therapeutic Areas
- Mechanisms of Action (MoA)
- Products and Compounds
- Evidence Types and Hierarchies
- Regulatory Frameworks and Guidelines
- Clinical Endpoints and Outcomes

### The Strategic Impact

By adding L0, every element in L1-L7 gains critical domain context:

| Without L0 | With L0 |
|------------|---------|
| "Respond to Inquiry" | "Respond to inquiry about *[Product X]* regarding *[MoA Y]* in *[Therapeutic Area Z]*" |
| "Prepare KOL Meeting" | "Prepare meeting with *[KOL Name]* specializing in *[Disease A]* about *[Evidence Gap B]*" |
| "Draft Publication" | "Draft publication on *[Endpoint C]* for *[Indication D]* targeting *[Journal E]*" |

This context is essential for sophisticated scientific and domain-specific AI reasoning.

```sql
-- Layer 0: Domain Knowledge Schema
CREATE TABLE domain_therapeutic_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  code text UNIQUE,
  parent_ta_id uuid REFERENCES domain_therapeutic_areas(id),
  description text,
  icd10_codes text[],
  mesh_terms text[],
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE domain_diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  therapeutic_area_id uuid REFERENCES domain_therapeutic_areas(id),
  icd10_code text,
  orphan_status boolean DEFAULT false,
  prevalence_per_100k numeric,
  current_treatments text[],
  unmet_needs text[],
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE domain_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  brand_name text NOT NULL,
  generic_name text,
  mechanism_of_action text,
  therapeutic_area_id uuid REFERENCES domain_therapeutic_areas(id),
  lifecycle_stage text CHECK (lifecycle_stage IN 
    ('preclinical', 'phase1', 'phase2', 'phase3', 'filed', 'approved', 'mature', 'loe')),
  first_approval_date date,
  indications text[],
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE domain_evidence_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  hierarchy_level integer, -- 1=highest (RCT), 5=lowest (expert opinion)
  description text,
  typical_use_cases text[],
  regulatory_acceptance text
);

CREATE TABLE domain_moa_disease_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanism_of_action text NOT NULL,
  disease_id uuid REFERENCES domain_diseases(id),
  product_id uuid REFERENCES domain_products(id),
  evidence_strength text CHECK (evidence_strength IN ('strong', 'moderate', 'emerging', 'theoretical')),
  key_references text[]
);
```

## Pillar 2: Formalized Semantic Governance

### The Risk: Semantic Drift

As the ontology scales across functions, different departments may use identical terms differently (e.g., "Customer," "Product," "Outcome"). This creates:
- Cross-functional misalignment
- Data quality degradation
- AI reasoning failures
- Integration complexity

### The Solution: Governance Infrastructure

#### A. The Enterprise Metamodel

Define a strict, version-controlled schema (the structure of L0-L7) that all functions must adhere to:

```yaml
# metamodel-schema.yaml
metamodel:
  version: "1.0.0"
  layers:
    L0:
      name: "Domain Knowledge"
      required_entities:
        - therapeutic_areas
        - diseases
        - products
        - evidence_types
      extension_rules:
        - "Function-specific entities must extend base types"
        - "All entities require tenant_id and created_at"
    
    L1:
      name: "Organizational Structure"
      required_entities:
        - functions
        - departments
        - roles
        - org_hierarchy
      relationships:
        - "roles BELONG_TO departments"
        - "departments BELONG_TO functions"
    
    L2:
      name: "Personas"
      required_entities:
        - personas
        - archetypes
        - persona_attributes
      relationships:
        - "personas INSTANTIATE archetypes"
        - "personas MAP_TO roles"
    
    # ... L3-L7 continue
```

#### B. Ontology Governance Council (OGC)

| Role | Responsibility | Scope |
|------|----------------|-------|
| **Chief Data Officer** | Chair, strategic direction | Enterprise-wide |
| **Enterprise Architect** | Metamodel ownership | Cross-functional |
| **Domain Steward (MA)** | Medical Affairs ontology | Function-specific |
| **Domain Steward (Comm)** | Commercial ontology | Function-specific |
| **Domain Steward (R&D)** | R&D ontology | Function-specific |
| **Ontology Engineer** | Technical implementation | All layers |

#### C. Ontology as Code

Treat the ontology schema (DDL) as immutable code, managed via CI/CD:

```yaml
# .github/workflows/ontology-validation.yml
name: Ontology Validation
on:
  pull_request:
    paths:
      - 'ontology/**'
      - 'migrations/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Schema Validation
        run: |
          python scripts/validate_metamodel.py
          python scripts/check_cross_references.py
          python scripts/lint_relationships.py
      
      - name: Semantic Consistency Check
        run: |
          python scripts/detect_semantic_drift.py
          python scripts/validate_term_definitions.py
      
      - name: Migration Safety
        run: |
          python scripts/check_backward_compatibility.py
          python scripts/validate_rollback_path.py
```

## Pillar 3: Embedded Compliance and Policy-as-Code

### The Gap: Passive Compliance Metadata

Current approach stores compliance requirements as text metadata (e.g., `role_gxp_requirements`). This is insufficient for regulated environments where compliance must be **executable**.

### The Solution: Executable Compliance

#### A. Policy-as-Code Implementation

Encode regulatory rules and SOPs directly into the architecture:

```python
# governance/policies/medical_affairs_policies.rego
# Open Policy Agent (OPA) Policy Definitions

package vital.governance.medical_affairs

# Rule: MLR Review Required
mlr_review_required {
    input.content_type in ["promotional", "scientific_exchange", "digital_media"]
    input.external_facing == true
    not input.mlr_approved
}

# Rule: Adverse Event Escalation
adverse_event_escalation_required {
    input.content_type == "medical_inquiry_response"
    input.mentions_adverse_event == true
    input.severity in ["serious", "unexpected"]
}

# Rule: Off-Label Content Restriction
off_label_content_blocked {
    input.content_type in ["promotional", "sales_aid"]
    input.mentions_off_label_use == true
}

# Rule: Data Privacy - PII Handling
pii_handling_required {
    input.contains_pii == true
    not input.consent_documented
}

# Rule: Scientific Accuracy Verification
scientific_verification_required {
    input.content_type in ["publication", "scientific_platform", "evidence_summary"]
    input.claims_count > 0
    not input.all_claims_referenced
}
```

#### B. Governance Sub-Layer in AI Execution Fabric

Implement a dedicated governance layer within L6 that validates agent actions:

```python
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

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
    modifications: List[str]
    hitl_checkpoint: Optional[str]
    audit_record_id: str

class GovernanceEngine:
    """
    Validates agent actions BEFORE execution and enforces
    Human-in-the-Loop (HITL) checkpoints.
    """
    
    def __init__(self, policy_engine: OPAClient):
        self.policy_engine = policy_engine
        self.audit_logger = AuditLogger()
    
    async def pre_execution_check(
        self, 
        action: AgentAction,
        context: ExecutionContext
    ) -> GovernanceResult:
        """
        Evaluate action against all applicable policies
        BEFORE allowing execution.
        """
        # Build policy input
        policy_input = {
            "action_type": action.type,
            "content_type": action.output_type,
            "external_facing": action.is_external,
            "contains_pii": await self._detect_pii(action),
            "mentions_adverse_event": await self._detect_ae(action),
            "mentions_off_label_use": await self._detect_off_label(action),
            "claims_count": await self._count_claims(action),
            "persona_archetype": context.persona.archetype,
            "user_role": context.user.role
        }
        
        # Evaluate against policy bundle
        evaluation = await self.policy_engine.evaluate(
            package="vital.governance.medical_affairs",
            input=policy_input
        )
        
        # Determine decision
        if evaluation.has_blocking_violations:
            decision = GovernanceDecision.BLOCKED
        elif evaluation.requires_hitl:
            decision = GovernanceDecision.HITL_REQUIRED
        elif evaluation.has_modifications:
            decision = GovernanceDecision.MODIFIED
        else:
            decision = GovernanceDecision.APPROVED
        
        # Create audit record
        audit_id = await self.audit_logger.log(
            action=action,
            context=context,
            evaluation=evaluation,
            decision=decision
        )
        
        return GovernanceResult(
            decision=decision,
            policies_evaluated=evaluation.policies,
            violations=evaluation.violations,
            modifications=evaluation.modifications,
            hitl_checkpoint=evaluation.hitl_checkpoint,
            audit_record_id=audit_id
        )
```

## Pillar 4: The 8-Layer Semantic Core

### Expanded Architecture: L0-L7

The refined architecture integrates the Domain Ontology with the Operational Ontology:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    8-LAYER SEMANTIC CORE (L0-L7)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  L1-L7: OPERATIONAL ONTOLOGY                                           │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  [L7: VALUE & OPPORTUNITY]       ← The "Why" (Transformation)          │
│  Opportunities │ Value Drivers │ AI Maturity │ Change Readiness        │
│                        ▲                                                │
│  [L6: AI & COMPONENTS]           ← The "How" (Automation/Augmentation) │
│  Agents │ Agent Graphs │ Panels │ Tools │ RAG │ Governance             │
│                        ▲                                                │
│  [L5: EXECUTION]                 ← The "What" (Process)                │
│  Processes │ Projects │ Workflow Templates │ Tasks │ Steps             │
│                        ▲                                                │
│  [L4: CAPABILITIES & SKILLS]     ← The "Means"                         │
│  Capabilities │ Skills │ Competencies │ Learning Resources             │
│                        ▲                                                │
│  [L3: JOBS-TO-BE-DONE]           ← The "Need"                          │
│  JTBD │ Outcomes (ODI) │ Pain Points │ Constraints │ Value Drivers     │
│                        ▲                                                │
│  [L2: PERSONA & ARCHETYPE]       ← The "Behavior"                      │
│  Personas │ Archetypes │ Goals │ Pain │ Behaviors │ AI Maturity        │
│                        ▲                                                │
│  [L1: ORGANIZATIONAL STRUCTURE]  ← The "Structure"                     │
│  Functions │ Departments │ Roles │ Responsibilities │ Hierarchy        │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                      (Contextualized By)                                │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  [L0: DOMAIN KNOWLEDGE]          ← The "Subject Matter"                │
│  Diseases │ Therapeutic Areas │ Products │ MoA │ Evidence │ Regulatory │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layer Interaction Model

```
Query: "What is the latest evidence on [Drug X] for [Indication Y]?"

L0 Resolution:
├── Drug X → domain_products.id = 'abc123'
├── Indication Y → domain_diseases.id = 'def456'
└── Evidence Type → domain_evidence_types.hierarchy_level <= 3

L1-L7 Context:
├── L1: User Role = Medical Information Scientist
├── L2: Persona = MI Specialist (Automator archetype)
├── L3: JTBD = "Respond to medical inquiry accurately and compliantly"
├── L4: Required Skill = Evidence Synthesis
├── L5: Workflow = Medical Inquiry Response Process
├── L6: Agents = [Evidence Retrieval Agent, Compliance Checker, Response Generator]
└── L7: Value = Time saved: 3.5 hours, Accuracy: 98%

Result: Contextually-aware, persona-adapted, compliant response
```

---

# 2. The 2×2 Persona Archetype Matrix

## 2.1 Strategic Framework

The 2×2 Archetype Matrix provides a universal classification system for understanding how individuals interact with AI-powered work systems. This matrix is **function-agnostic** and applies across Medical Affairs, Commercial, R&D, and any enterprise function.

### Axes Definition

**X-Axis: Work Complexity**
- **Routine/Operational** ← → **Strategic/Complex**
- Measures: task repetitiveness, decision scope, cross-functional dependencies

**Y-Axis: GenAI Readiness**
- **Low AI Maturity** ← → **High AI Maturity**
- Measures: technology adoption, automation comfort, AI trust level

### The Four Archetypes

```
                            HIGH AI MATURITY
                                   │
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         │      AUTOMATOR          │      ORCHESTRATOR       │
         │                         │                         │
         │  • Embraces automation  │  • Strategic thinker    │
         │  • Process optimizer    │  • Multi-agent user     │
         │  • Efficiency-focused   │  • Solution builder     │
         │  • Self-service AI      │  • Enterprise vision    │
         │                         │                         │
         │  Service Affinity:      │  Service Affinity:      │
         │  L1 Ask Expert +        │  L2 Ask Panel +         │
         │  L3 Workflows           │  L4 Solution Builder    │
         │                         │                         │
ROUTINE ─┼─────────────────────────┼─────────────────────────┼─ STRATEGIC
         │                         │                         │
         │      LEARNER            │      SKEPTIC            │
         │                         │                         │
         │  • Needs guidance       │  • Requires proof       │
         │  • Tutorial-oriented    │  • Risk-conscious       │
         │  • Building confidence  │  • Compliance-focused   │
         │  • Structured paths     │  • Explainability need  │
         │                         │                         │
         │  Service Affinity:      │  Service Affinity:      │
         │  L1 Ask Expert +        │  L2 Ask Panel +         │
         │  Guided Workflows       │  HITL Workflows         │
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   │
                            LOW AI MATURITY
```

## 2.2 Archetype Characteristics

### AUTOMATOR (High AI Maturity × Routine Work)

**Profile:**
- Embraces automation for repetitive tasks
- Seeks efficiency gains and time savings
- Comfortable with self-service AI tools
- Early adopter of new capabilities

**Service Layer Preferences:**
- Primary: L3 Workflows (automated execution)
- Secondary: L1 Ask Expert (quick lookups)
- Minimal: L2 Panels (views as overkill for routine work)

**Interaction Design:**
- Minimize friction in automation setup
- Provide batch processing capabilities
- Enable scheduling and triggers
- Focus on speed over explanation

### ORCHESTRATOR (High AI Maturity × Strategic Work)

**Profile:**
- Strategic decision-maker
- Comfortable with complex multi-agent reasoning
- Seeks comprehensive, synthesized intelligence
- Leverages AI for competitive advantage

**Service Layer Preferences:**
- Primary: L4 Solution Builder (end-to-end solutions)
- Secondary: L2 Ask Panel (multi-perspective reasoning)
- Supporting: L3 Workflows (for delegated execution)

**Interaction Design:**
- Emphasize synthesis and strategic framing
- Enable multi-agent orchestration
- Provide executive-ready outputs
- Support scenario planning and what-if analysis

### LEARNER (Low AI Maturity × Routine Work)

**Profile:**
- New to AI-assisted work
- Needs guidance and hand-holding
- Building confidence through small wins
- Prefers structured, predictable experiences

**Service Layer Preferences:**
- Primary: L1 Ask Expert (low-risk entry point)
- Secondary: Guided L3 Workflows (step-by-step)
- Avoid: Autonomous automation (too much too fast)

**Interaction Design:**
- Provide in-context tutorials and tooltips
- Celebrate small wins and progress
- Offer undo/rollback capabilities
- Gradual feature disclosure

### SKEPTIC (Low AI Maturity × Strategic Work)

**Profile:**
- Strategic responsibility but AI hesitant
- Requires proof before trust
- Highly compliance and risk-conscious
- Demands explainability and audit trails

**Service Layer Preferences:**
- Primary: L2 Ask Panel (multiple perspectives for validation)
- Secondary: HITL L3 Workflows (human checkpoints)
- Require: Explanation and source citation for all outputs

**Interaction Design:**
- Always show sources and reasoning
- Provide human-in-the-loop checkpoints
- Enable side-by-side comparison with manual methods
- Build trust through demonstrated accuracy

## 2.3 Archetype Inference Engine

```python
def infer_archetype(persona):
    # Calculate work complexity score (0-100)
    complexity = calculate_complexity(
        team_size=persona.professional_context.team_size,
        budget_authority=persona.professional_context.budget_authority,
        seniority=persona.professional_context.seniority_level,
        decision_scope=persona.professional_context.decision_scope,
        cross_functional=len(persona.internal_stakeholders) > 5
    )
    
    # Calculate AI readiness score (0-100)
    ai_readiness = calculate_ai_readiness(
        tech_adoption=persona.tech_adoption_level,
        pain_patterns=analyze_pain_for_automation_signals(persona.pain_points),
        goal_patterns=analyze_goals_for_ai_signals(persona.goals),
        prior_ai_experience=persona.ai_experience_score
    )
    
    # Classify into quadrant
    if ai_readiness >= 60 and complexity < 50:
        return "AUTOMATOR"
    elif ai_readiness >= 60 and complexity >= 50:
        return "ORCHESTRATOR"
    elif ai_readiness < 60 and complexity < 50:
        return "LEARNER"
    else:
        return "SKEPTIC"
```

---

# 3. Technical Architecture: The Gold Standard

## 3.1 Industrialized Projection Spine

### The Critical Requirement

The synchronization between the Relational Core (normalized source of truth) and the Knowledge Graph (reasoning layer/IIG) is the most critical technical dependency. For a true AI OS, synchronization must be:
- **Near-real-time** (not batch)
- **Resilient** (guaranteed delivery)
- **Observable** (full audit trail)

### The Solution: Change Data Capture (CDC)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     PROJECTION SPINE ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─────────────────┐                    ┌─────────────────────────────┐ │
│   │   PostgreSQL    │                    │    Neo4j (IIG)              │ │
│   │   (Supabase)    │                    │    Knowledge Graph          │ │
│   │                 │                    │                             │ │
│   │  Normalized     │    CDC Stream      │  L0-L7 Ontology             │ │
│   │  Source of      │ ───────────────►   │  Relationship-First         │ │
│   │  Truth          │                    │  Graph Traversal            │ │
│   │                 │                    │                             │ │
│   │  280+ Tables    │                    │  Cypher Queries             │ │
│   │  RLS Policies   │                    │  Path Analysis              │ │
│   └────────┬────────┘                    └─────────────────────────────┘ │
│            │                                                              │
│            │ WAL                                                          │
│            ▼                                                              │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐│
│   │    Debezium     │     │     Kafka       │     │   Graph Sync        ││
│   │    CDC          │────►│     Topics      │────►│   Service           ││
│   │                 │     │                 │     │                     ││
│   │  WAL Parsing    │     │  Durable Queue  │     │  Event Consumer     ││
│   │  Change Events  │     │  Partitioned    │     │  Idempotent Updates ││
│   │  At-Least-Once  │     │  Ordered        │     │  Retry Logic        ││
│   └─────────────────┘     └─────────────────┘     └─────────────────────┘│
│                                                                           │
│   Latency Target: < 500ms from commit to graph update                    │
│   Durability: Zero data loss with exactly-once semantics                 │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### CDC Configuration

```yaml
# debezium-connector-config.json
{
  "name": "vital-pg-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "${PG_HOST}",
    "database.port": "5432",
    "database.user": "${PG_USER}",
    "database.password": "${PG_PASSWORD}",
    "database.dbname": "vital",
    "database.server.name": "vital-db",
    "table.include.list": "public.personas,public.jtbd,public.workflows,public.agents,public.domain_*",
    "plugin.name": "pgoutput",
    "slot.name": "vital_cdc_slot",
    "publication.name": "vital_publication",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "vital-db.public.(.*)",
    "transforms.route.replacement": "vital.ontology.$1"
  }
}
```

### Graph Sync Service

```python
from kafka import KafkaConsumer
from neo4j import GraphDatabase
import json

class GraphSyncService:
    """
    Consumes CDC events and updates the IIG.
    Implements idempotent, exactly-once semantics.
    """
    
    def __init__(self, kafka_config: dict, neo4j_config: dict):
        self.consumer = KafkaConsumer(
            'vital.ontology.*',
            bootstrap_servers=kafka_config['bootstrap_servers'],
            group_id='graph-sync-service',
            auto_offset_reset='earliest',
            enable_auto_commit=False,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        self.driver = GraphDatabase.driver(
            neo4j_config['uri'],
            auth=(neo4j_config['user'], neo4j_config['password'])
        )
        self.sync_log = SyncLogRepository()
    
    async def process_events(self):
        """Main event processing loop."""
        for message in self.consumer:
            event = message.value
            
            # Idempotency check
            if await self.sync_log.is_processed(event['lsn']):
                self.consumer.commit()
                continue
            
            try:
                # Route to appropriate handler
                table = event['source']['table']
                operation = event['op']  # c=create, u=update, d=delete
                
                await self._sync_to_graph(table, operation, event)
                
                # Mark as processed
                await self.sync_log.mark_processed(event['lsn'])
                self.consumer.commit()
                
            except Exception as e:
                # Dead letter queue for failed events
                await self._send_to_dlq(event, str(e))
    
    async def _sync_to_graph(self, table: str, operation: str, event: dict):
        """Sync change to Neo4j graph."""
        
        if table == 'personas':
            await self._sync_persona(operation, event)
        elif table == 'jtbd':
            await self._sync_jtbd(operation, event)
        elif table == 'workflows':
            await self._sync_workflow(operation, event)
        elif table.startswith('domain_'):
            await self._sync_domain_entity(table, operation, event)
    
    async def _sync_persona(self, operation: str, event: dict):
        """Sync persona changes to graph."""
        
        data = event['after'] if operation in ['c', 'u'] else event['before']
        
        async with self.driver.session() as session:
            if operation == 'c':
                await session.run("""
                    MERGE (p:Persona {id: $id})
                    SET p.name = $name,
                        p.archetype = $archetype,
                        p.department = $department,
                        p.updated_at = datetime()
                    WITH p
                    MATCH (r:Role {id: $role_id})
                    MERGE (p)-[:HOLDS_ROLE]->(r)
                """, **data)
            elif operation == 'u':
                await session.run("""
                    MATCH (p:Persona {id: $id})
                    SET p.name = $name,
                        p.archetype = $archetype,
                        p.updated_at = datetime()
                """, **data)
            elif operation == 'd':
                await session.run("""
                    MATCH (p:Persona {id: $id})
                    DETACH DELETE p
                """, id=data['id'])
```

## 3.2 Hybrid Reasoning Fabric (GraphRAG + VectorRAG)

### The Intelligence Broker

Agents interact with an "Intelligence Broker" layer rather than querying the KG or Vector DB directly:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE BROKER ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐│
│   │                        AGENT QUERY                                   ││
│   │   "What evidence supports [Product X] for [Indication Y]?"          ││
│   └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                      │
│                                    ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐│
│   │                    INTELLIGENCE BROKER                               ││
│   │                                                                      ││
│   │   1. Parse query to extract domain entities                         ││
│   │   2. Resolve entities against L0 (Domain Knowledge)                 ││
│   │   3. Build structural context from L1-L7 (IIG GraphRAG)            ││
│   │   4. Formulate precise vector queries with context                  ││
│   │   5. Retrieve and rank documents (VectorRAG)                        ││
│   │   6. Fuse structural + document context                             ││
│   │   7. Return unified context window to agent                         ││
│   │                                                                      ││
│   └─────────────────────────────────────────────────────────────────────┘│
│            │                                           │                  │
│            ▼                                           ▼                  │
│   ┌─────────────────────┐                 ┌─────────────────────────────┐│
│   │   Neo4j (IIG)       │                 │   Pinecone (Vector)         ││
│   │   GraphRAG          │                 │   VectorRAG                 ││
│   │                     │                 │                             ││
│   │   • L0-L7 Context   │                 │   • Documents               ││
│   │   • Relationships   │                 │   • Evidence                ││
│   │   • Pathfinding     │                 │   • Publications            ││
│   │   • Inference       │                 │   • Guidelines              ││
│   └─────────────────────┘                 └─────────────────────────────┘│
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Intelligence Broker Implementation

```python
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class IntelligenceContext:
    """Unified context returned by Intelligence Broker."""
    structural_context: Dict[str, Any]  # From GraphRAG
    document_chunks: List[DocumentChunk]  # From VectorRAG
    domain_entities: List[DomainEntity]   # Resolved L0 entities
    relevance_scores: Dict[str, float]
    context_window: str  # Formatted for LLM injection

class IntelligenceBroker:
    """
    Coordinates GraphRAG and VectorRAG to provide
    unified intelligence context to agents.
    """
    
    def __init__(
        self,
        graph_client: Neo4jClient,
        vector_client: PineconeClient,
        entity_resolver: EntityResolver
    ):
        self.graph = graph_client
        self.vector = vector_client
        self.resolver = entity_resolver
    
    async def get_context(
        self,
        query: str,
        persona_id: str,
        execution_context: Dict[str, Any]
    ) -> IntelligenceContext:
        """
        Main entry point for agents to retrieve context.
        """
        
        # Step 1: Parse query and extract entities
        extracted = await self._extract_entities(query)
        
        # Step 2: Resolve entities against L0 Domain Knowledge
        domain_entities = await self.resolver.resolve(
            extracted.entity_mentions,
            tenant_id=execution_context['tenant_id']
        )
        
        # Step 3: Build structural context via GraphRAG
        structural_context = await self._query_graph(
            persona_id=persona_id,
            domain_entities=domain_entities,
            query_intent=extracted.intent
        )
        
        # Step 4: Formulate vector queries with domain context
        vector_queries = self._build_vector_queries(
            original_query=query,
            domain_entities=domain_entities,
            structural_context=structural_context
        )
        
        # Step 5: Retrieve documents via VectorRAG
        document_chunks = await self._query_vectors(
            queries=vector_queries,
            filters=self._build_filters(execution_context, domain_entities)
        )
        
        # Step 6: Rank and fuse results
        ranked_chunks = self._rank_by_relevance(
            chunks=document_chunks,
            structural_context=structural_context,
            domain_entities=domain_entities
        )
        
        # Step 7: Format unified context window
        context_window = self._format_context_window(
            structural=structural_context,
            documents=ranked_chunks[:10],
            domain=domain_entities
        )
        
        return IntelligenceContext(
            structural_context=structural_context,
            document_chunks=ranked_chunks,
            domain_entities=domain_entities,
            relevance_scores=self._compute_relevance_scores(ranked_chunks),
            context_window=context_window
        )
    
    async def _query_graph(
        self,
        persona_id: str,
        domain_entities: List[DomainEntity],
        query_intent: str
    ) -> Dict[str, Any]:
        """
        Query IIG for structural context using GraphRAG patterns.
        """
        
        # Get persona context (L1-L2)
        persona_context = await self.graph.query("""
            MATCH (p:Persona {id: $persona_id})
            OPTIONAL MATCH (p)-[:HOLDS_ROLE]->(r:Role)
            OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Department)
            OPTIONAL MATCH (p)-[:HAS_ARCHETYPE]->(a:Archetype)
            RETURN p, r, d, a
        """, persona_id=persona_id)
        
        # Get JTBD context (L3)
        jtbd_context = await self.graph.query("""
            MATCH (p:Persona {id: $persona_id})-[:HAS_JTBD]->(j:JTBD)
            WHERE j.category IN $relevant_categories
            RETURN j
            ORDER BY j.frequency DESC
            LIMIT 5
        """, persona_id=persona_id, relevant_categories=self._infer_categories(query_intent))
        
        # Get domain relationships (L0)
        domain_context = await self.graph.query("""
            MATCH (e:DomainEntity)-[r]->(related)
            WHERE e.id IN $entity_ids
            RETURN e, type(r) as relationship, related
        """, entity_ids=[e.id for e in domain_entities])
        
        return {
            'persona': persona_context,
            'jtbd': jtbd_context,
            'domain': domain_context
        }
    
    def _format_context_window(
        self,
        structural: Dict[str, Any],
        documents: List[DocumentChunk],
        domain: List[DomainEntity]
    ) -> str:
        """
        Format all context into a unified string for LLM injection.
        """
        
        sections = []
        
        # Domain Context Section
        if domain:
            domain_text = "## Domain Context\n"
            for entity in domain:
                domain_text += f"- **{entity.type}**: {entity.name}\n"
                if entity.metadata:
                    for k, v in entity.metadata.items():
                        domain_text += f"  - {k}: {v}\n"
            sections.append(domain_text)
        
        # Structural Context Section
        if structural.get('persona'):
            persona = structural['persona']
            sections.append(f"""## User Context
- **Role**: {persona.get('role', 'Unknown')}
- **Department**: {persona.get('department', 'Unknown')}
- **Archetype**: {persona.get('archetype', 'Unknown')}
""")
        
        # Document Context Section
        if documents:
            doc_text = "## Relevant Evidence\n"
            for i, chunk in enumerate(documents, 1):
                doc_text += f"\n### Source {i}: {chunk.metadata.get('title', 'Unknown')}\n"
                doc_text += f"*Type: {chunk.metadata.get('document_type', 'Unknown')}*\n\n"
                doc_text += chunk.content + "\n"
            sections.append(doc_text)
        
        return "\n".join(sections)
```

---

# 4. Unified Architecture Visualization

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE INTELLIGENCE OPERATING SYSTEM                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────┐  │
│   │              IIG - INTERACTION INTELLIGENCE GRAPH                          │  │
│   │                        (Knowledge Core)                                    │  │
│   │                                                                            │  │
│   │   ┌─────────────────────────────────────────────────────────────────────┐ │  │
│   │   │  L7: Value & Opportunity  │  L6: AI Components  │  L5: Execution    │ │  │
│   │   │  L4: Capabilities         │  L3: JTBD           │  L2: Persona      │ │  │
│   │   │  L1: Org Structure        │                                         │ │  │
│   │   └─────────────────────────────────────────────────────────────────────┘ │  │
│   │                                     ▲                                      │  │
│   │   ┌─────────────────────────────────────────────────────────────────────┐ │  │
│   │   │            L0: DOMAIN KNOWLEDGE (Contextualization)                 │ │  │
│   │   │   Diseases │ Products │ MoA │ Evidence Types │ Regulatory          │ │  │
│   │   └─────────────────────────────────────────────────────────────────────┘ │  │
│   └───────────────────────────────────────────────────────────────────────────┘  │
│                │                                                │                 │
│                │ Context & Structure                            │ Powers Analysis │
│                ▼                                                ▼                 │
│   ┌─────────────────────────────────┐      ┌─────────────────────────────────┐  │
│   │    AI EXECUTION FABRIC          │      │    TRANSFORMATION ENGINE         │  │
│   │         (L1-L4)                 │      │                                  │  │
│   │                                 │      │   ┌─────────────────────────┐   │  │
│   │  ┌───────────────────────────┐ │      │   │  Opportunity Radar      │   │  │
│   │  │    Service Router         │ │      │   └─────────────────────────┘   │  │
│   │  └───────────┬───────────────┘ │      │   ┌─────────────────────────┐   │  │
│   │              │                 │      │   │  AI Maturity Assessment │   │  │
│   │  ┌───────────▼───────────────┐ │      │   └─────────────────────────┘   │  │
│   │  │  Intelligence Broker      │ │      │   ┌─────────────────────────┐   │  │
│   │  │  (GraphRAG + VectorRAG)   │ │      │   │  L&D & Change Mgmt      │   │  │
│   │  └───────────┬───────────────┘ │      │   └─────────────────────────┘   │  │
│   │              │                 │      │                                  │  │
│   │  ┌───────────▼───────────────┐ │      └─────────────────────────────────┘  │
│   │  │  L1 Expert │ L2 Panel     │ │                       ▲                   │
│   │  │  L3 Workflow│ L4 Solution │ │                       │                   │
│   │  └───────────┬───────────────┘ │                       │ Prioritization    │
│   │              │                 │───────────────────────┘                   │
│   │  ┌───────────▼───────────────┐ │                                          │
│   │  │   Governance Layer        │ │     Execution Data                       │
│   │  │   (Policy-as-Code / HITL) │ │─────────────────────────────────────────►│
│   │  └───────────────────────────┘ │                                          │
│   │                                 │                                          │
│   └─────────────────────────────────┘                                          │
│                                                                                   │
│   ════════════════════════════════════════════════════════════════════════════   │
│                           CRITICAL INFRASTRUCTURE                                 │
│   ════════════════════════════════════════════════════════════════════════════   │
│                                                                                   │
│   ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐   │
│   │    PostgreSQL       │     │      Kafka          │     │     Neo4j       │   │
│   │    (Supabase)       │────►│    (CDC Stream)     │────►│     (IIG)       │   │
│   │                     │     │                     │     │                 │   │
│   │  Normalized Source  │     │  Projection Spine   │     │  Reasoning      │   │
│   │  of Truth           │     │  (Debezium CDC)     │     │  Layer          │   │
│   └─────────────────────┘     └─────────────────────┘     └─────────────────┘   │
│                                                                                   │
│   ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐   │
│   │    Pinecone         │     │      Redis          │     │      OPA        │   │
│   │    (Vectors)        │     │    (Cache/Queue)    │     │  (Policy-as-    │   │
│   │                     │     │                     │     │   Code)         │   │
│   │  Semantic Search    │     │  State & Messaging  │     │  Governance     │   │
│   └─────────────────────┘     └─────────────────────┘     └─────────────────┘   │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# 5. Key Platform Metrics

## 5.1 Strategic Metrics

| Metric Category | Current Baseline | Year 1 Target | Year 3 Target |
|-----------------|------------------|---------------|---------------|
| **Schema Coverage** | 280+ tables | 400+ tables (incl. L0) | 600+ tables |
| **Personas Modeled** | 43 | 150+ | 350+ (cross-functional) |
| **JTBDs Documented** | 120 | 300 | 700+ |
| **AI Agents Active** | 136 | 250+ | 500+ |
| **Workflows Automated** | 180 templates | 400+ | 900+ |
| **User Adoption** | Pilot | 1,000+ users | 10,000+ users |
| **ROI Delivered** | Baseline | 5x investment | 15x investment |

## 5.2 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **CDC Latency** | < 500ms | Commit to graph update |
| **L1 Response Time** | < 3s | 95th percentile |
| **L2 Panel Time** | < 30s | 95th percentile |
| **L3 Workflow Completion** | < 5 min | Simple workflows |
| **Graph Query Performance** | < 100ms | Complex traversals |
| **Vector Search Performance** | < 200ms | Top-k retrieval |
| **System Availability** | 99.9% | Monthly uptime |

## 5.3 Governance Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Policy Coverage** | 100% | All agent actions have policies |
| **Compliance Rate** | 99.5% | Actions passing governance checks |
| **HITL Resolution Time** | < 4 hours | Time to resolve HITL requests |
| **Audit Trail Completeness** | 100% | All actions logged |
| **Semantic Drift Score** | < 5% | Cross-function term consistency |

---

# 6. Implementation Roadmap

## Phase 1: Foundation (Q1-Q2 2026)

**Objective:** Establish core infrastructure and L0 implementation

| Deliverable | Timeline | Owner |
|-------------|----------|-------|
| L0 Domain Knowledge Schema | Q1 W1-4 | Data Architecture |
| CDC Pipeline (Debezium + Kafka) | Q1 W2-6 | Platform Engineering |
| Graph Sync Service | Q1 W4-8 | Platform Engineering |
| Intelligence Broker MVP | Q1 W6-10 | AI Engineering |
| Policy-as-Code Framework | Q1 W8-12 | Security/Compliance |
| Governance Layer Integration | Q2 W1-6 | AI Engineering |

## Phase 2: Enhancement (Q3-Q4 2026)

**Objective:** Full ontology governance and advanced reasoning

| Deliverable | Timeline | Owner |
|-------------|----------|-------|
| Ontology Governance Council | Q3 W1-4 | CDO Office |
| Metamodel CI/CD Pipeline | Q3 W2-6 | DevOps |
| Advanced GraphRAG Patterns | Q3 W4-10 | AI Engineering |
| Cross-Function Ontology Expansion | Q3-Q4 | Domain Stewards |
| Transformation Engine MVP | Q4 W1-8 | Product |

## Phase 3: Scale (2027)

**Objective:** Enterprise-wide deployment and autonomous capabilities

| Deliverable | Timeline | Owner |
|-------------|----------|-------|
| Commercial Function Ontology | Q1 | Domain Steward (Comm) |
| R&D Function Ontology | Q2 | Domain Steward (R&D) |
| Autonomous Opportunity Identification | Q2-Q3 | AI Engineering |
| Federated Learning (Privacy-Preserving) | Q3-Q4 | AI/ML |
| Self-Optimizing Workflows | Q4 | AI Engineering |

---

# 7. Appendices

## Appendix A: Strategic Pillar Definitions

| Pillar | Name | Description |
|--------|------|-------------|
| SP01 | Growth & Market Access | Evidence for access, payer engagement, launch excellence |
| SP02 | Scientific Excellence | Publications, evidence synthesis, scientific leadership |
| SP03 | Stakeholder Engagement | KOL/HCP engagement, advisory boards, congress activities |
| SP04 | Compliance & Quality | Regulatory compliance, quality assurance, risk management |
| SP05 | Operational Excellence | Process efficiency, resource optimization, performance |
| SP06 | Talent Development | Capability building, training, succession planning |
| SP07 | Innovation & Digital | AI adoption, digital transformation, innovation |

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **CDC** | Change Data Capture; streaming database changes in real-time |
| **Domain Ontology (L0)** | Subject matter model (diseases, products, evidence types) |
| **GraphRAG** | Graph-enhanced retrieval-augmented generation |
| **HITL** | Human-in-the-loop; manual checkpoint requiring human approval |
| **IIG** | Interaction Intelligence Graph; the unified knowledge graph |
| **Metamodel** | The schema that defines how the ontology is structured |
| **OPA** | Open Policy Agent; policy-as-code engine |
| **Operational Ontology (L1-L7)** | Model of how work is done, who does it, and why |
| **Policy-as-Code** | Executable compliance rules embedded in architecture |
| **Projection Spine** | CDC mechanism syncing relational DB to knowledge graph |
| **Semantic Drift** | Inconsistent term definitions across functions |
| **VectorRAG** | Vector similarity-based retrieval-augmented generation |

## Appendix C: v4 to v5 Change Summary

| Area | v4 State | v5 Enhancement |
|------|----------|----------------|
| Ontology | 7-layer operational | 8-layer with L0 Domain Knowledge |
| Synchronization | Batch ETL logs | Real-time CDC with Kafka |
| Compliance | Metadata-based | Policy-as-Code (OPA) |
| Retrieval | Separate Graph/Vector | Intelligence Broker (unified) |
| Governance | Advisory | Executable with HITL gates |
| Vision | Medical Affairs OS | Enterprise Intelligence OS |
| Scalability | Function-specific | Function-agnostic metamodel |

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-09 | Architecture Team | Initial ontology strategy |
| 2.0 | 2025-10 | Architecture Team | Added Neo4j integration |
| 3.0 | 2025-11 | Architecture Team | Added persona framework |
| 4.0 | 2025-11-28 | Architecture Team | Comprehensive integration |
| 5.0 | 2025-11-28 | Architecture Team | Enterprise Intelligence OS, L0 Domain Layer, CDC Pipeline, Policy-as-Code, Intelligence Broker |

---

**END OF MASTER STRATEGY DOCUMENT v5.0**
