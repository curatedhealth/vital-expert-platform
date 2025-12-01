# VITAL Platform - Enterprise Ontology Business Guide

## Executive Summary

The VITAL Enterprise Ontology is a structured knowledge framework that models pharmaceutical organizations, their people, and their intelligence needs. It enables AI agents to understand organizational context, match the right expertise to tasks, and deliver personalized experiences based on user archetypes.

---

## 1. What is an Enterprise Ontology?

An **Enterprise Ontology** is a formal representation of an organization's structure, roles, capabilities, and knowledge domains. Unlike a simple org chart, an ontology captures:

- **Hierarchical relationships** (who reports to whom)
- **Semantic relationships** (what skills relate to what tasks)
- **Behavioral patterns** (how different user types prefer to work)
- **Knowledge connections** (what expertise applies to what domains)

### Why Pharma Needs This

Pharmaceutical companies face unique challenges:

| Challenge | How Ontology Helps |
|-----------|-------------------|
| Complex regulations | Maps regulatory domains to expert agents |
| Cross-functional collaboration | Connects roles across functions |
| Diverse stakeholder needs | Personalizes experiences via personas |
| Knowledge silos | Unified knowledge graph breaks silos |
| AI adoption resistance | Archetype-aware agents adapt to user comfort |

---

## 2. The 8-Layer Enterprise Ontology (L0-L7)

The VITAL ontology is organized into 8 hierarchical layers representing the complete enterprise structure:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ L7: AI AGENTS LAYER                                        [972 agents]     │
│     Expert AI agents mapped to roles via agent_roles junction              │
│     • 2,245 agent-role mappings                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ L6: JTBD-ROLE MAPPINGS                                    [3,451 mappings] │
│     Jobs linked to roles via jtbd_roles junction table                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ L5: JOBS-TO-BE-DONE (JTBD)                                [526 JTBDs]      │
│     Universal job definitions with ODI format                              │
│     job_statement, desired_outcome, success_criteria                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ L4: PERSONAS LAYER                                        [1,798 personas] │
│     MECE archetypes: AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC          │
│     Behavioral deltas on top of role baselines                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ L3: ROLES LAYER                                           [949 roles]      │
│     Job titles with responsibilities, tools, competencies                  │
│     org_roles table with seniority_level, leadership_level                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ L2: DEPARTMENTS LAYER                                     [149 departments]│
│     Functional sub-units within business functions                         │
│     org_departments table                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ L1: FUNCTIONS LAYER                                       [27 functions]   │
│     Top-level business functions (Medical Affairs, Commercial, etc.)       │
│     org_functions table                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ L0: TENANTS LAYER                                         [12 tenants]     │
│     Multi-tenant isolation, enterprise customers                           │
│     tenants table with RLS policies                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Summary (Current State - 2025-11-30)

| Layer | Entity | Count | Primary Table | Key Junction Tables |
|-------|--------|-------|---------------|---------------------|
| L0 | Tenants | 12 | `tenants` | `tenant_agents`, `function_tenants` |
| L1 | Functions | 27 | `org_functions` | `function_tenants` |
| L2 | Departments | 149 | `org_departments` | `department_tenants` |
| L3 | Roles | 949 | `org_roles` | `role_tenants`, `role_tools` |
| L4 | Personas | 1,798 | `personas` | `persona_tenants` |
| L5 | JTBDs | 526 | `jtbd` | `jtbd_kpis`, `jtbd_pain_points` |
| L6 | JTBD-Roles | 3,451 | `jtbd_roles` | - |
| L7 | Agents | 972 | `agents` | `agent_roles` (2,245) |

---

## 3. Organizational Structure (L1-L3)

### 3.1 Three-Tier Hierarchy

```
FUNCTION (27)                    [L1: org_functions]
    │
    ├── DEPARTMENT (149)         [L2: org_departments]
    │       │
    │       └── ROLE (949)       [L3: org_roles]
    │
    └── Example:
        Medical Affairs (Function)
            ├── Field Medical (Department)
            │       ├── Medical Science Liaison - Oncology (Role)
            │       ├── Medical Science Liaison - Immunology (Role)
            │       └── Field Medical Director (Role)
            ├── Medical Information (Department)
            │       ├── Medical Information Specialist (Role)
            │       └── Medical Information Manager (Role)
            └── Publications (Department)
                    ├── Medical Writer (Role)
                    └── Publications Manager (Role)
```

### 3.2 Functions (27 Total)

The platform models a complete pharmaceutical organization:

| Category | Functions |
|----------|-----------|
| **R&D** | Research, Discovery, Preclinical, Clinical Development |
| **Medical** | Medical Affairs, Pharmacovigilance, Medical Writing |
| **Regulatory** | Regulatory Affairs, Regulatory Operations, Quality |
| **Commercial** | Marketing, Sales, Market Access, Business Development |
| **Operations** | Manufacturing, Supply Chain, Procurement |
| **Support** | Legal, Finance, HR, IT, Communications |

### 3.3 Role Attributes

Each role has rich metadata enabling precise matching:

| Attribute | Purpose | Example Values |
|-----------|---------|----------------|
| `seniority_level` | Career stage | Entry, Mid, Senior, Director, VP, C-Suite |
| `leadership_level` | Management scope | Individual Contributor, Team Lead, Manager, Director |
| `geographic_scope` | Territory | Local, Regional, National, Global |
| `hcp_facing` | Interacts with doctors | true/false |
| `patient_facing` | Interacts with patients | true/false |
| `gxp_critical` | Regulatory compliance role | true/false |
| `safety_critical` | Patient safety impact | true/false |
| `travel_percentage` | Field vs. office | 0-100% |

---

## 4. Persona Framework (L4)

### 4.1 The MECE Archetype Model

Every role generates **4 personas** representing different user archetypes. MECE (Mutually Exclusive, Collectively Exhaustive) ensures complete coverage without overlap.

```
              ┌─────────────────────────────────────────┐
              │           AI MATURITY SPECTRUM          │
              ├─────────────────────────────────────────┤
 HIGH ◄───────┤  AUTOMATOR │ ORCHESTRATOR │ LEARNER │ SKEPTIC  ├───────► LOW
              │     4      │      3       │    2    │    1     │
              └─────────────────────────────────────────┘
```

### 4.2 Archetype Definitions

| Archetype | AI Maturity | Tech Adoption | Characteristics |
|-----------|-------------|---------------|-----------------|
| **AUTOMATOR** | 4 (High) | Early Adopter | Seeks AI/automation, builds workflows, experiments with tools |
| **ORCHESTRATOR** | 3 | Early Majority | Strategic coordinator, manages complex processes, delegates to AI |
| **LEARNER** | 2 | Late Majority | Curious but cautious, wants guidance, appreciates step-by-step help |
| **SKEPTIC** | 1 (Low) | Laggard | Prefers proven methods, needs trust-building, values human expertise |

### 4.3 Why 4 Personas Per Role?

**Business Rationale**:

1. **Same job, different people**: Two MSLs may have identical responsibilities but vastly different AI comfort levels
2. **Personalized experience**: AI agents adapt communication style based on archetype
3. **Adoption strategy**: Marketing teams can target different archetypes with appropriate messaging
4. **Training design**: L&D can create role-specific training for each archetype

**Example: Medical Science Liaison Role**

| Persona | Name Pattern | Behavior |
|---------|--------------|----------|
| AUTOMATOR MSL | "The Digital MSL" | Uses AI for territory analysis, automated follow-ups, data synthesis |
| ORCHESTRATOR MSL | "The Strategic MSL" | Coordinates with AI for meeting prep, delegates research tasks |
| LEARNER MSL | "The Curious MSL" | Asks AI for explanations, appreciates tutorials, gradual adoption |
| SKEPTIC MSL | "The Traditional MSL" | Prefers face-to-face, uses AI only when required, values human judgment |

### 4.4 Persona Attributes

Each persona includes:

```yaml
Persona:
  # Identity
  persona_name: "The Digital MSL"
  persona_type: AUTOMATOR
  title: "AI-Forward Medical Science Liaison"

  # Context
  department: "Field Medical"
  function_area: "Medical Affairs"
  geographic_scope: "Regional"
  experience_level: "senior"

  # Behavioral
  goals: ["Maximize territory coverage", "Automate routine tasks"]
  challenges: ["Data overload", "Too many systems"]
  motivations: ["Efficiency", "Innovation recognition"]
  frustrations: ["Slow legacy systems", "Manual data entry"]
  daily_activities: ["AI-assisted meeting prep", "Territory analytics"]
  tools_used: ["CRM", "AI assistants", "Analytics dashboards"]
```

---

## 5. AI Agents (L7)

### 5.1 Agent Architecture

AI Agents are the "workers" of the platform. Each agent:

- Is linked to one or more **Roles**
- Has a **system prompt** defining its expertise and personality
- Inherits organizational context from its role
- Can be matched to users via semantic search

### 5.2 Agent Selection Logic

When a user submits a query, the platform:

1. **Classifies intent** (question, task, analysis, recommendation)
2. **Detects domains** (therapeutic area, functional domain)
3. **Searches agents** semantically via Pinecone
4. **Applies persona boosting** based on user archetype
5. **Enriches with graph context** from Neo4j

```
User Query: "Help me prepare for a KOL meeting on immunotherapy"

→ Intent: task
→ Therapeutic Area: oncology (immunotherapy)
→ Functional Domain: medical_affairs

→ Semantic Search: Finds MSL agents, Medical Affairs agents
→ Persona Boost: If user is AUTOMATOR, boosts tech-forward agents
→ Graph Context: Adds organizational hierarchy for context

→ Selected Agent: "Senior MSL AI Assistant - Oncology"
```

### 5.3 Agent-Role-Persona Relationship

```
Role: Medical Science Liaison - Oncology
    │
    ├── Agents (serve this role):
    │       ├── MSL Meeting Prep Assistant
    │       ├── KOL Engagement Analyzer
    │       └── Territory Intelligence Agent
    │
    └── Personas (4 archetypes):
            ├── AUTOMATOR MSL (inherits agents via role)
            ├── ORCHESTRATOR MSL
            ├── LEARNER MSL
            └── SKEPTIC MSL
```

**Key Insight**: Personas don't own agents. Personas inherit agents through their source role. This ensures:
- Agents are role-appropriate, not archetype-specific
- Same agent can adapt its communication based on the user's archetype
- Clean data model without duplication

---

## 6. Knowledge Domains

### 6.1 Domain Taxonomy

Knowledge is organized into specialized domains:

| Category | Domains | Examples |
|----------|---------|----------|
| **Therapeutic Areas** | Oncology, Immunology, Neurology, Cardiology, Rare Diseases | Disease biology, treatment guidelines, clinical data |
| **Regulatory** | FDA, EMA, ICH, PMDA, Health Canada | Regulations, guidance documents, submission requirements |
| **Functional** | Medical Affairs, Clinical Development, Pharmacovigilance | Best practices, SOPs, role-specific knowledge |
| **Technology** | Digital Health, AI/ML, Data Analytics | Technical standards, implementation guides |
| **Business** | Strategy, Market Access, Competitive Intelligence | Business frameworks, market data |

### 6.2 Namespace Naming Convention

Vector embeddings are stored in Pinecone with a clear naming scheme:

```
Ontology:     ont-*        (ont-agents, ont-personas)
Knowledge:    KD-*         (KD-reg-fda, KD-dh-samd)
```

This separation enables:
- **Targeted retrieval**: Query only relevant namespaces
- **Efficient search**: Smaller search space per query
- **Clear ownership**: Different teams can maintain different namespaces

---

## 7. Jobs-To-Be-Done & Workflows (L5-L6)

### 7.1 JTBD Framework (L5)

Jobs-To-Be-Done (JTBD) capture what users are trying to accomplish, independent of how they do it. The VITAL platform stores 526 JTBDs in ODI (Outcome-Driven Innovation) format:

- **Job Statement**: The core task the user needs to accomplish
- **Desired Outcome**: What success looks like
- **Success Criteria**: Measurable outcomes

### 7.2 JTBD-Role Mappings (L6)

The `jtbd_roles` junction table links JTBDs to roles with 3,451 mappings, enabling:
- Role-appropriate task suggestions
- Workload analysis across positions
- Skills gap identification

### 7.3 Agentic Workflow

The platform doesn't just answer questions—it executes intelligent workflows:

```
┌────────────────────────────────────────────────────────────────┐
│                     VITAL Agentic Workflow                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  User Query ──► Intent Classification ──► Agent Selection     │
│                                               │                │
│                                               ▼                │
│  Response ◄── Citation Formatting ◄── Response Generation     │
│                                               ▲                │
│                                               │                │
│                    Graph Enrichment ◄── RAG Retrieval         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.4 Persona-Aware Responses

The same query generates different responses based on user archetype:

| Query | AUTOMATOR Response | SKEPTIC Response |
|-------|-------------------|------------------|
| "How do I analyze my territory?" | "Here's a Python script for automated analysis. Connect your CRM via API..." | "Let me walk you through a step-by-step manual analysis. Start by reviewing your top 10 accounts..." |

---

## 8. Business Value

### 8.1 Use Cases

| Use Case | Ontology Enabler |
|----------|------------------|
| **Onboarding** | New hire's role links to agents, personas, and knowledge domains |
| **Training** | Archetype-specific learning paths |
| **Knowledge Search** | Role-aware search results prioritization |
| **AI Adoption** | Archetype-based adoption campaigns |
| **Compliance** | Role attributes identify GxP-critical positions |
| **Workforce Planning** | Skill gap analysis across roles |

### 8.2 Key Metrics

| Metric | How Ontology Helps |
|--------|-------------------|
| Time to productivity | Faster onboarding via role-specific agents |
| AI adoption rate | Track by archetype, tailor interventions |
| Knowledge reuse | Measure cross-functional knowledge sharing |
| Compliance risk | Identify gaps in GxP-critical role coverage |

---

## 9. Data Model Summary

### 9.1 Entity Counts (Current State - 2025-11-30)

| Layer | Entity | Count | Table/Relationship |
|-------|--------|-------|-------------------|
| L0 | Tenants | 12 | `tenants` |
| L1 | Functions | 27 | `org_functions` |
| L2 | Departments | 149 | `org_departments` |
| L3 | Roles | 949 | `org_roles` |
| L4 | Personas | 1,798 | `personas` (4 archetypes × role) |
| L5 | JTBDs | 526 | `jtbd` |
| L6 | JTBD-Role Mappings | 3,451 | `jtbd_roles` |
| L7 | Agents | 972 | `agents` (active) |
| L7 | Agent-Role Mappings | 2,245 | `agent_roles` |

### 9.2 Relationship Rules

1. **Every department belongs to exactly one function**
2. **Every role belongs to exactly one department**
3. **Every role has exactly 4 personas** (one per archetype)
4. **Agents can serve one or more roles**
5. **Personas inherit agents from their source role**

---

## 10. Governance

### 10.1 Data Stewardship

| Layer | Owner | Update Frequency |
|-------|-------|------------------|
| Functions/Departments | HR/Org Design | Quarterly |
| Roles | HRBP + Function Leads | Monthly |
| Personas | Persona Design Team | Semi-annually |
| Agents | AI Platform Team | Continuous |
| Knowledge Domains | Subject Matter Experts | Continuous |

### 10.2 Quality Assurance

- **MECE Validation**: Automated tests ensure every role has exactly 4 personas
- **Orphan Detection**: Identifies roles without agents
- **Relationship Integrity**: Validates all foreign keys
- **Embedding Freshness**: Monitors vector store sync status

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **MECE** | Mutually Exclusive, Collectively Exhaustive - a framework ensuring complete coverage without overlap |
| **GraphRAG** | Combining graph traversal with retrieval-augmented generation for context-rich responses |
| **Archetype** | A behavioral pattern representing a category of users |
| **Persona** | A specific instantiation of an archetype for a given role |
| **CDC** | Change Data Capture - real-time data synchronization |
| **Ontology** | A formal representation of knowledge and relationships |
| **Semantic Search** | Finding content by meaning rather than keywords |
| **Vector Embedding** | A numerical representation of text enabling similarity comparison |

---

## 12. Getting Started

### For Business Users

1. **Identify your role** in the ontology
2. **Discover your archetype** (take the assessment)
3. **Meet your AI agents** - specialized assistants for your work
4. **Explore knowledge domains** relevant to your function

### For IT/Platform Teams

1. **Review the data model** in Supabase
2. **Explore the API** at `/docs`
3. **Query the graph** via GraphQL at `/graphql`
4. **Visualize the ontology** at `/dashboard`

### For AI/ML Teams

1. **Understand vector namespaces** in Pinecone
2. **Study agent selection logic** in `agent_registry.py`
3. **Extend the workflow** in `langgraph/`
4. **Add knowledge domains** following the `KD-*` convention
