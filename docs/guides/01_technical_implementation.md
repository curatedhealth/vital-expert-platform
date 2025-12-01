# VITAL Platform - Technical Implementation Guide

## Overview

VITAL (Virtual Intelligence for Therapeutic Affairs & Lifecycle) is an Enterprise Intelligence Operating System designed for pharmaceutical Medical Affairs organizations. This document details the complete technical implementation.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VITAL Platform Architecture                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Supabase  │    │   Pinecone  │    │    Neo4j    │    │  LangGraph  │  │
│  │ (PostgreSQL)│◄──►│  (Vectors)  │◄──►│   (Graph)   │◄──►│ (Workflow)  │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┴──────────────────┴──────────────────┘         │
│                                    │                                        │
│                         ┌──────────▼──────────┐                            │
│                         │   Agent Registry    │                            │
│                         │  (Unified Access)   │                            │
│                         └──────────┬──────────┘                            │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    │               │               │                        │
│              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐                 │
│              │  REST API │   │  GraphQL  │   │ Dashboard │                 │
│              │ /api/v1/* │   │ /graphql  │   │/dashboard │                 │
│              └───────────┘   └───────────┘   └───────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Layer

### 2.1 Supabase (PostgreSQL) - Source of Truth

**Project URL**: `https://bomltkhixeatxuoxmolq.supabase.co`

#### Core Tables

| Table | Records | Description |
|-------|---------|-------------|
| `org_functions` | 26 | Organizational functions (Medical Affairs, R&D, etc.) |
| `org_departments` | 136 | Departments within functions |
| `org_roles` | 858 | Job roles with attributes |
| `personas` | 3,432 | MECE persona archetypes (4 per role) |
| `agents` | 1,138+ | AI agent definitions with system prompts |

#### Key Relationships

```sql
org_functions (1) ──► (N) org_departments
org_departments (1) ──► (N) org_roles
org_roles (1) ──► (N) personas  [4 MECE archetypes per role]
org_roles (1) ──► (N) agents    [AI agents serve roles]
```

### 2.2 Pinecone Vector Store

**Index**: `vital-knowledge` (3072 dimensions)

**Total Vectors**: 21,613

#### Namespace Structure

| Namespace | Vectors | Purpose |
|-----------|---------|---------|
| **Ontology (ont-*)** | | |
| `ont-agents` | 2,547 | Agent embeddings for semantic selection |
| `personas` | 2,142 | Persona embeddings |
| `ont-personas` | 1,400 | Additional persona vectors |
| `skills` | 455 | Skill taxonomy |
| `capabilities` | 369 | Capability definitions |
| `responsibilities` | 278 | JTBD responsibilities |
| **Knowledge Domains (KD-*)** | | |
| `KD-dh-samd` | 3,934 | Software as Medical Device |
| `KD-dh-general` | 3,010 | Digital Health general |
| `KD-business-strategy` | 2,488 | Business strategy content |
| `KD-reg-ema` | 1,627 | EMA regulations |
| `KD-reg-fda` | 1,300 | FDA regulations |
| `KD-clinical-trials` | 1,147 | Clinical trial knowledge |
| `KD-reg-general` | 511 | General regulatory |
| `KD-best-practices` | 274 | Implementation guides |
| `KD-industry` | 63 | Industry reports |
| `KD-dh-cybersec` | 63 | Digital health security |
| `KD-reg-ich` | 5 | ICH guidelines |

### 2.3 Neo4j Knowledge Graph

**URI**: `neo4j+s://13067bdb.databases.neo4j.io`

#### Node Types

```
(:Function)      - Organizational functions
(:Department)    - Departments
(:Role)          - Job roles
(:Persona)       - Persona archetypes
(:Agent)         - AI agents
(:Archetype)     - AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
```

#### Relationships

```
(:Department)-[:BELONGS_TO]->(:Function)
(:Role)-[:IN_DEPARTMENT]->(:Department)
(:Role)-[:IN_FUNCTION]->(:Function)
(:Persona)-[:BASED_ON_ROLE]->(:Role)
(:Persona)-[:HAS_ARCHETYPE]->(:Archetype)
(:Agent)-[:SERVES_ROLE]->(:Role)
(:Agent)-[:IN_FUNCTION]->(:Function)
(:Agent)-[:IN_DEPARTMENT]->(:Department)
```

---

## 3. Integration Layer

### 3.1 Agent Registry (`src/integrations/agent_registry.py`)

Unified access layer for agent data across all stores.

```python
# Core Classes
SupabaseAgentClient   # CRUD operations on agents
PineconeAgentSearch   # Semantic search
Neo4jAgentGraph       # Graph-based queries
AgentSelector         # Unified GraphRAG selection
```

**Key Method**: `AgentSelector.select_agent()`

```python
def select_agent(
    task: str,                           # User's task description
    context: Optional[Dict] = None,      # Additional context
    user_persona_type: Optional[str] = None,  # AUTOMATOR/ORCHESTRATOR/LEARNER/SKEPTIC
    top_k: int = 3
) -> List[Dict]:
    """
    Combines semantic search + graph context for optimal agent selection.
    Applies persona-aware boosting based on user archetype.
    """
```

### 3.2 CDC Pipeline (`src/integrations/cdc_pipeline.py`)

Real-time synchronization from Supabase to Neo4j.

#### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Python CDC Client | `src/integrations/cdc_pipeline.py` | Realtime/Polling sync |
| Edge Function | `supabase/functions/cdc-neo4j/` | Webhook handler |
| Database Triggers | `database/migrations/004_cdc_triggers.sql` | Event capture |

#### Sync Modes

1. **Full Sync**: `python cdc_pipeline.py full-sync`
2. **Realtime**: `python cdc_pipeline.py realtime` (WebSocket)
3. **Polling**: `python cdc_pipeline.py polling` (every 60s)

---

## 4. Workflow Layer

### 4.1 LangGraph Workflow (`src/langgraph/`)

Agentic workflow with persona-aware agent selection.

#### State Structure (`state.py`)

```python
class VITALState(TypedDict):
    # Input
    user_query: str
    user_persona_type: Optional[str]
    session_id: str

    # Classification
    intent: Optional[str]  # question/task/analysis/recommendation
    therapeutic_area: Optional[str]
    functional_domain: Optional[str]

    # Agent Selection
    selected_agents: List[Dict]
    primary_agent: Optional[Dict]

    # Retrieval
    retrieved_chunks: List[Dict]
    rag_namespaces: List[str]
    graph_context: Optional[Dict]

    # Generation
    final_response: Optional[str]
    citations: List[Dict]
```

#### Node Pipeline (`nodes.py`)

```
┌───────────────────┐
│  classify_intent  │  Extract intent, therapeutic area, functional domain
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│   select_agents   │  GraphRAG agent selection with persona boosting
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│ retrieve_context  │  Query KD-* namespaces based on domain
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│enrich_graph_context│  Add organizational context from Neo4j
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│ generate_response │  Claude response with agent persona
└─────────┬─────────┘
          │
┌─────────▼─────────┐
│ format_citations  │  Add source references
└───────────────────┘
```

#### Usage

```python
from langgraph.graph import VITALWorkflow

workflow = VITALWorkflow()
result = workflow.run(
    query="What are effective KOL engagement strategies?",
    user_persona_type="AUTOMATOR"
)
print(result["final_response"])
```

---

## 5. API Layer

### 5.1 REST API (`src/api/routers/`)

**Base URL**: `http://localhost:8000/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agents` | GET | List agents with filters |
| `/agents/{id}` | GET | Get single agent |
| `/agents/search` | POST | Semantic agent search |
| `/agents/by-role/{role_id}` | GET | Agents for a role |
| `/personas` | GET | List personas |
| `/personas/stats` | GET | Persona breakdown by archetype |
| `/personas/archetypes/{type}` | GET | Get personas by archetype |
| `/ontology/functions` | GET | List functions |
| `/ontology/departments` | GET | List departments |
| `/ontology/roles` | GET | List roles |
| `/ontology/hierarchy` | GET | Full hierarchy with counts |
| `/workflow/execute` | POST | Execute agentic workflow |
| `/workflow/select-agent` | POST | Agent selection only |

### 5.2 GraphQL API (`src/api/graphql/`)

**Endpoint**: `http://localhost:8000/graphql`

#### Schema

```graphql
type Query {
  # Ontology
  functions: [Function!]!
  function(id: String!): Function
  departments(functionId: String, limit: Int): [Department!]!
  roles(functionId: String, departmentId: String, seniorityLevel: String): [Role!]!

  # Personas
  personas(personaType: String, roleId: String, limit: Int): [Persona!]!
  persona(id: String!): Persona

  # Agents
  agents(status: String, roleId: String, expertiseLevel: String): [Agent!]!
  agent(id: String!): Agent
  searchAgents(query: String!, topK: Int): [AgentSearchResult!]!

  # Stats
  ontologyStats: OntologyStats!
}

type Role {
  id: String!
  name: String!
  department: Department          # Resolved relationship
  personas: [Persona!]!           # 4 MECE archetypes
  agents: [Agent!]!               # AI agents serving this role
}
```

---

## 6. Admin Dashboard

**Location**: `dashboard/`

**Access**: `http://localhost:8000/dashboard`

### Features

- Real-time stats from Supabase
- Interactive D3.js knowledge graph visualization
- Persona archetype breakdown
- Pinecone namespace statistics
- Quick actions (API docs, GraphQL, Neo4j sync)

---

## 7. Test Suite

**Location**: `tests/`

**Run**: `pytest tests/ -v`

| Test File | Coverage |
|-----------|----------|
| `test_supabase_integration.py` | Data integrity, MECE validation, relationships |
| `test_pinecone_integration.py` | Vector store, namespaces, search |
| `test_api.py` | REST and GraphQL endpoints |
| `test_langgraph_workflow.py` | Workflow execution, intent classification |

---

## 8. File Structure

```
VITAL/
├── src/
│   ├── api/
│   │   ├── main.py                 # FastAPI app
│   │   ├── routers/
│   │   │   ├── agents.py
│   │   │   ├── personas.py
│   │   │   ├── ontology.py
│   │   │   └── workflow.py
│   │   └── graphql/
│   │       └── schema.py           # Strawberry GraphQL
│   ├── integrations/
│   │   ├── agent_registry.py       # Unified agent access
│   │   └── cdc_pipeline.py         # Supabase → Neo4j sync
│   └── langgraph/
│       ├── state.py                # VITALState definition
│       ├── nodes.py                # Workflow nodes
│       └── graph.py                # Graph orchestration
├── database/
│   ├── migrations/
│   │   ├── 003_normalize_ontology.sql
│   │   └── 004_cdc_triggers.sql
│   ├── seeds/
│   │   └── seed_personas_existing_schema.py
│   └── sync/
│       ├── sync_to_neo4j.py
│       ├── sync_personas_to_pinecone.py
│       └── sync_agents_to_pinecone.py
├── supabase/
│   └── functions/
│       └── cdc-neo4j/
│           └── index.ts            # Edge Function
├── dashboard/
│   ├── index.html
│   └── app.js
├── tests/
│   ├── conftest.py
│   ├── test_supabase_integration.py
│   ├── test_pinecone_integration.py
│   ├── test_api.py
│   └── test_langgraph_workflow.py
├── docs/
│   ├── pinecone_namespace_taxonomy.md
│   ├── cdc_pipeline_setup.md
│   └── guides/
│       ├── 01_technical_implementation.md
│       └── 02_enterprise_ontology_guide.md
└── pytest.ini
```

---

## 9. Quick Start

```bash
# Install dependencies
pip install fastapi uvicorn strawberry-graphql pinecone-client neo4j requests langgraph anthropic

# Start API server
cd /Users/hichamnaim/Downloads/Cursor/VITAL
uvicorn src.api.main:app --reload --port 8000

# Access
# Dashboard: http://localhost:8000/dashboard
# API Docs:  http://localhost:8000/docs
# GraphQL:   http://localhost:8000/graphql

# Run tests
pytest tests/ -v

# Sync to Neo4j (from whitelisted IP)
python src/integrations/cdc_pipeline.py full-sync
```

---

## 10. Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `PINECONE_API_KEY` | Pinecone API key |
| `NEO4J_URI` | Neo4j Aura connection string |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `ANTHROPIC_API_KEY` | Claude API key (for response generation) |
