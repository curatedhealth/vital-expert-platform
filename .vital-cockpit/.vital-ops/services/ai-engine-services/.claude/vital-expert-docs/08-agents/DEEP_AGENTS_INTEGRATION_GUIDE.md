# VITAL Deep Agents Integration Guide
**Version:** 1.0 Gold Standard
**Date:** November 17, 2025
**Status:** Implementation Roadmap
**Framework:** LangChain Deep Agents + VITAL Healthcare Platform

---

## Executive Summary

This document provides a **comprehensive integration guide** for adopting LangChain's **Deep Agents framework** into the VITAL Ask Expert platform. It includes:

1. **Current System Analysis**: Detailed review of your existing agent architecture
2. **Gap Analysis**: Comparison with Deep Agents capabilities
3. **Integration Roadmap**: Step-by-step migration plan
4. **Enhanced Architecture**: Deep Agents-powered healthcare agent system
5. **Implementation Examples**: Production-ready code for VITAL

---

## Table of Contents

1. [Current VITAL Agent Architecture Analysis](#current-vital-agent-architecture-analysis)
2. [Deep Agents Framework Overview](#deep-agents-framework-overview)
3. [Gap Analysis & Opportunities](#gap-analysis--opportunities)
4. [Integration Architecture](#integration-architecture)
5. [Database Schema Enhancements](#database-schema-enhancements)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Production Code Examples](#production-code-examples)
8. [Migration Strategy](#migration-strategy)

---

## Current VITAL Agent Architecture Analysis

### 📊 **What You Have Now**

#### 1. **Agent Registry System** (TypeScript + Python)

**Location**: `apps/digital-health-startup/src/agents/core/AgentOrchestrator.ts`

**Current Capabilities**:
```typescript
class AgentOrchestrator {
  protected agents: Map<string, DigitalHealthAgent>;
  private workflows: Map<string, WorkflowDefinition>;
  private activeExecutions: Map<string, WorkflowExecution>;

  // Features:
  - Multi-agent workflow orchestration
  - Dependency-based step execution
  - Simple workflow definitions
  - Agent registration and discovery
}
```

**Strengths** ✅:
- Multi-agent coordination
- Workflow orchestration
- Dependency management
- Clean TypeScript architecture

**Limitations** ❌:
- No planning/decomposition tools
- No context management (file system)
- No sub-agent spawning
- Limited to predefined workflows
- No autonomous reasoning
- No human-in-the-loop checkpoints

---

#### 2. **Agent Database Schema** (Supabase)

**Location**: `supabase/migrations/20251008000004_complete_cloud_migration.sql`

**Current Schema**:
```sql
CREATE TABLE public.agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  avatar TEXT,
  color TEXT,
  system_prompt TEXT,                    -- ✅ Good: Structured prompts
  model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  context_window INTEGER,
  capabilities TEXT[],                   -- ✅ Good: Capabilities tracking
  business_function TEXT,
  department TEXT,
  role TEXT,
  tier INTEGER,
  status TEXT,
  is_public BOOLEAN,
  is_custom BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Supporting tables:
- agent_capabilities
- agent_knowledge_domains
- llm_usage_logs
- chat_sessions
- chat_messages
- knowledge_documents
- document_embeddings (JSONB, not vector yet)
```

**Strengths** ✅:
- Well-structured agent metadata
- LLM usage tracking
- Knowledge domain associations
- Multi-tenancy support (organization_id)
- RAG foundation (knowledge_documents)

**Limitations** ❌:
- No **tools registry** (Deep Agents uses tools)
- No **subagent relationships** table
- No **agent memories** table (long-term memory)
- No **checkpoint/task tracking** tables
- No **file system backend** configuration
- Vector embeddings as JSONB (not pgvector)

---

#### 3. **Python AI Services** (Agent Orchestrator)

**Location**: `services/ai-engine/src/services/agent_orchestrator.py`

**Current Capabilities**:
```python
class AgentOrchestrator:
    def __init__(self, supabase_client, rag_pipeline):
        self.supabase = supabase_client
        self.rag = rag_pipeline
        self.active_agents = {}
        self.llm = ChatOpenAI(...)
        self.agent_classes = {
            "medical_specialist": MedicalSpecialistAgent,
            "regulatory_expert": RegulatoryExpertAgent,
            "clinical_researcher": ClinicalResearcherAgent
        }

    async def process_query(request):
        - Get/create agent
        - Get RAG context
        - Execute agent query
        - Update metrics
        - Log audit trail
```

**Strengths** ✅:
- LangChain integration
- RAG pipeline integration
- Supabase database integration
- Medical domain specialization
- Usage tracking and audit logging

**Limitations** ❌:
- No **planning tools** (write_todos)
- No **file system** for context management
- No **sub-agent** spawning
- No **checkpoints** for human-in-the-loop
- No **long-term memory** across sessions
- Stateless execution (no LangGraph state)

---

#### 4. **Agent Types Registry** (250+ Agents Defined)

**Location**: `scripts/agent-definitions.ts`

**Current Structure**:
```typescript
interface AgentSpec {
  name: string;
  display_name: string;
  description: string;
  tier: number;                    // 1-3 tier system
  business_function: string;
  domain: string;
  requiresMedicalKnowledge: boolean;
  requiresHighAccuracy: boolean;
  capabilities: string[];
  avatar_offset: number;
}

// 85 Tier 1 agents (foundational)
// 115 Tier 2 agents (specialist)
// 50 Tier 3 agents (ultra-specialist)
```

**Strengths** ✅:
- Comprehensive healthcare agent registry
- Tiered expertise levels
- Domain-specific specialization
- Clear capability definitions

**Limitations** ❌:
- No **sub-agent network** definition
- No **tool assignments** per agent
- No **middleware configuration**
- No **backend configuration** (StateBackend vs StoreBackend)

---

### 🎯 **Summary: Your Current System**

| Component | Status | Deep Agents Ready? |
|-----------|--------|-------------------|
| **Agent Registry** | ✅ Implemented | ⚠️ Needs tools + subagents |
| **Workflow Orchestration** | ✅ Basic | ⚠️ Needs LangGraph migration |
| **Database Schema** | ✅ Solid foundation | ⚠️ Needs Deep Agents tables |
| **Python Services** | ✅ LangChain integrated | ⚠️ Needs middleware adoption |
| **Planning/Decomposition** | ❌ Missing | 🔴 Critical gap |
| **Context Management** | ❌ Missing | 🔴 Critical gap |
| **Sub-Agent Spawning** | ❌ Missing | 🔴 Critical gap |
| **Human-in-the-Loop** | ❌ Missing | 🟡 Important |
| **Long-Term Memory** | ❌ Missing | 🟡 Important |

---

## Deep Agents Framework Overview

### 🚀 **What Deep Agents Provides**

LangChain's Deep Agents framework is a **standalone library** for building agents that can tackle complex, multi-step tasks.

#### **Core Capabilities**:

1. **Planning & Task Decomposition** (`write_todos` tool)
   - Agents break down complex tasks into discrete steps
   - Track progress dynamically
   - Adapt plans as new information emerges

2. **Context Management** (File system tools)
   - `ls`, `read_file`, `write_file`, `edit_file`, `glob`, `grep`
   - Offload large context to memory
   - Prevent context window overflow
   - Work with variable-length tool results

3. **Sub-Agent Spawning** (`task` tool)
   - Create specialized sub-agents for context isolation
   - Keep main agent's context clean
   - Parallel execution of subtasks
   - Token-efficient deep reasoning

4. **Long-Term Memory** (Store backends)
   - Persistent memory across threads
   - Save/retrieve information from previous conversations
   - Multiple backend options (StateBackend, StoreBackend, CompositeBackend)

5. **Human-in-the-Loop** (Checkpoints)
   - Pause execution for human approval
   - Configurable interrupt policies
   - Edit tool inputs before execution

6. **Middleware Architecture** (Composable)
   - TodoListMiddleware: Planning
   - FilesystemMiddleware: Context management
   - SubAgentMiddleware: Task delegation
   - Custom middleware: Add your own capabilities

---

### 📦 **Deep Agents vs. Your Current System**

| Feature | VITAL Current | Deep Agents | Integration Priority |
|---------|---------------|-------------|---------------------|
| **Multi-Agent Orchestration** | ✅ AgentOrchestrator | ✅ LangGraph | 🟢 Enhance |
| **Planning/TODO Tracking** | ❌ None | ✅ TodoListMiddleware | 🔴 Critical |
| **File System for Context** | ❌ None | ✅ FilesystemMiddleware | 🔴 Critical |
| **Sub-Agent Spawning** | ❌ None | ✅ SubAgentMiddleware | 🔴 Critical |
| **Long-Term Memory** | ⚠️ Basic DB | ✅ StoreBackend | 🟡 Important |
| **Human Checkpoints** | ❌ None | ✅ Interrupt system | 🟡 Important |
| **Tool Registry** | ❌ None | ✅ Built-in + custom | 🔴 Critical |
| **Conversation Summarization** | ❌ None | ✅ Auto at 170K tokens | 🟢 Nice-to-have |
| **Prompt Caching** | ❌ None | ✅ Anthropic caching | 🟢 Nice-to-have |

---

## Gap Analysis & Opportunities

### 🔴 **Critical Gaps to Address**

#### 1. **No Planning/Decomposition**

**Current State**:
- Agents execute single prompts or predefined workflows
- No ability to break down complex tasks dynamically
- Limited to what you explicitly program

**Deep Agents Solution**:
```python
from deepagents import create_deep_agent

agent = create_deep_agent(
    tools=[your_healthcare_tools],
    system_prompt="You are an FDA regulatory expert..."
)

# Agent automatically uses write_todos to plan:
# User: "Create complete 510(k) submission strategy"
# Agent:
#   TODO 1: [in_progress] Research predicate devices
#   TODO 2: [pending] Analyze substantial equivalence
#   TODO 3: [pending] Design testing protocols
#   TODO 4: [pending] Develop submission timeline
```

**VITAL Benefit**:
- FDA submissions require 10-20 coordinated steps
- Clinical protocols need multi-phase planning
- Agents can adapt plans based on discovered information

---

#### 2. **No Context Management (File System)**

**Current State**:
- All context lives in chat messages
- Long FDA guidances (50+ pages) overflow context window
- No way to store intermediate results

**Deep Agents Solution**:
```python
# Agent automatically saves large tool results to filesystem
# User uploads 100-page FDA guidance document
# Agent:
#   1. Saves to /documents/fda_guidance_510k.pdf
#   2. Extracts key sections to /notes/testing_requirements.md
#   3. Works with manageable chunks
#   4. Final answer doesn't include 100 pages in context
```

**VITAL Benefit**:
- Regulatory submissions have 100+ page guidances
- Clinical protocols reference multiple source documents
- Agents can work with entire document libraries

---

#### 3. **No Sub-Agent Spawning**

**Current State**:
- If FDA expert needs clinical validation input, it's all in one context
- No way to isolate specialized subtasks
- Main agent gets bloated with specialized details

**Deep Agents Solution**:
```python
# Main Agent: FDA Regulatory Strategist
# User: "Create 510(k) pathway analysis for my AI diagnostic"

# Main agent spawns:
agent.task(
    name="clinical-validation-specialist",
    task="Determine clinical validation requirements for AI/ML diagnostics"
)

# Sub-agent works independently:
#   - Researches FDA AI/ML guidances
#   - Analyzes PCCP requirements
#   - Returns: "AI diagnostics require retrospective + prospective validation..."

# Main agent receives clean summary, not 100 sub-agent tool calls
```

**VITAL Benefit**:
- Keep regulatory expert focused on regulatory pathway
- Spawn clinical expert for clinical questions
- Spawn biostatistician for sample size calculations
- Each works in isolated context

---

### 🟡 **Important Enhancements**

#### 4. **Long-Term Memory Across Sessions**

**Current State**:
- Each conversation is isolated
- Agents forget user preferences
- No learning from past interactions

**Deep Agents Solution**:
```python
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.postgres import PostgresStore

# Hybrid storage: ephemeral + persistent
backend = lambda rt: CompositeBackend(
    default=StateBackend(rt),  # Temporary working files
    routes={
        "/memories/": StoreBackend(rt)  # Persistent memories
    }
)

store = PostgresStore(connection_string=supabase_connection)

agent = create_deep_agent(
    backend=backend,
    store=store,
    system_prompt="""
    Check /memories/user_preferences.md for user preferences.
    Save important information to /memories/ for future sessions.
    """
)
```

**VITAL Benefit**:
- Remember user's preferred regulatory pathways
- Store organization-specific compliance requirements
- Learn from past submission strategies

---

#### 5. **Human-in-the-Loop Checkpoints**

**Current State**:
- Agents execute fully autonomously
- No approval gates for critical decisions
- No way to course-correct mid-execution

**Deep Agents Solution**:
```python
agent = create_deep_agent(
    tools=[fda_submission_tool, clinical_design_tool],
    interrupt_on={
        "fda_submission_tool": True,  # Require approval
        "clinical_design_tool": {"allowed_decisions": ["approve", "edit", "reject"]}
    },
    checkpointer=checkpointer  # Required for HITL
)

# Workflow:
# 1. Agent proposes: "I will submit 510(k) with these predicates..."
# 2. Human reviews → Approves or edits
# 3. Agent continues with approved plan
```

**VITAL Benefit**:
- Safety gate for regulatory submissions
- Human oversight for clinical recommendations
- Edit agent's proposed actions before execution

---

## Integration Architecture

### 🏗️ **Enhanced VITAL Architecture with Deep Agents**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VITAL ASK EXPERT v3.0                            │
│              Deep Agents-Powered Healthcare Platform                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
│  Next.js 14 + TypeScript + React Server Components                  │
│                                                                      │
│  New Components:                                                     │
│  • TodoList Display (real-time agent planning)                      │
│  • Checkpoint Approval UI (human-in-the-loop)                       │
│  • File Explorer (agent's file system)                              │
│  • Sub-Agent Visualization (task delegation tree)                   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴──────────┐
                    │   API GATEWAY (Kong) │
                    └───────────┬──────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                    PYTHON AI ENGINE (Enhanced)                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │         DEEP AGENTS ORCHESTRATOR (NEW)                        │ │
│  │                                                                │ │
│  │  from deepagents import create_deep_agent                     │ │
│  │                                                                │ │
│  │  agent = create_deep_agent(                                   │ │
│  │      model=model_config,                                      │ │
│  │      tools=healthcare_tools,        # 100+ custom tools       │ │
│  │      system_prompt=expert_prompt,   # From DB                 │ │
│  │      subagents=specialized_agents,  # Dynamic spawning        │ │
│  │      backend=composite_backend,     # Hybrid storage          │ │
│  │      store=postgres_store,          # Long-term memory        │ │
│  │      interrupt_on=checkpoint_config # Human-in-the-loop       │ │
│  │  )                                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              MIDDLEWARE STACK (Deep Agents)                    │ │
│  │  ┌─────────────────┬─────────────────┬──────────────────────┐│ │
│  │  │ TodoList        │ Filesystem      │ SubAgent             ││ │
│  │  │ Middleware      │ Middleware      │ Middleware           ││ │
│  │  │ • Planning      │ • ls/read/write │ • Task delegation    ││ │
│  │  │ • Progress      │ • Context mgmt  │ • Sub-agent spawn    ││ │
│  │  └─────────────────┴─────────────────┴──────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              HEALTHCARE TOOLS REGISTRY (NEW)                   │ │
│  │  • fda_database_search                                         │ │
│  │  • pubmed_literature_search                                    │ │
│  │  • predicate_device_analyzer                                   │ │
│  │  • clinical_trial_designer                                     │ │
│  │  • statistical_calculator                                      │ │
│  │  • [95+ more healthcare-specific tools]                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │           EXISTING SERVICES (Keep & Enhance)                   │ │
│  │  • AgentOrchestrator (integrate with Deep Agents)              │ │
│  │  • MedicalRAGPipeline (enhanced with file system)              │ │
│  │  • SupabaseClient (agent_tools, agent_memories tables)         │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE (Enhanced)                      │
│                                                                      │
│  EXISTING TABLES (Keep):                                            │
│  • agents                    • llm_usage_logs                       │
│  • agent_capabilities        • knowledge_documents                  │
│  • chat_sessions             • document_embeddings                  │
│  • chat_messages             • organizations                        │
│                                                                      │
│  NEW TABLES FOR DEEP AGENTS:                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_tools (Tool Registry)                                   │  │
│  │ ├─ id, name, description, function_schema                     │  │
│  │ ├─ tool_type (search, calculation, database, etc.)            │  │
│  │ ├─ requires_approval (boolean)                                │  │
│  │ └─ assigned_agents (array)                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_subagents (Sub-Agent Relationships)                     │  │
│  │ ├─ parent_agent_id                                            │  │
│  │ ├─ subagent_id                                                │  │
│  │ ├─ spawn_trigger_keywords                                     │  │
│  │ └─ specialization                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_memories (Long-Term Memory via LangGraph Store)         │  │
│  │ ├─ namespace (agent_id)                                       │  │
│  │ ├─ key (memory file path: /memories/user_prefs.md)            │  │
│  │ ├─ value (file content)                                       │  │
│  │ ├─ created_at, updated_at                                     │  │
│  │ └─ metadata (tags, category)                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_checkpoints (Human-in-the-Loop Approvals)               │  │
│  │ ├─ checkpoint_id, session_id, agent_id                        │  │
│  │ ├─ checkpoint_type (tool_execution, reasoning_validation)     │  │
│  │ ├─ proposed_action (JSON)                                     │  │
│  │ ├─ approval_status (pending, approved, rejected, edited)      │  │
│  │ ├─ human_feedback, approved_by                                │  │
│  │ └─ created_at, resolved_at                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_task_history (Planning & TODO Tracking)                 │  │
│  │ ├─ task_id, session_id, agent_id                              │  │
│  │ ├─ task_description, active_form                              │  │
│  │ ├─ status (pending, in_progress, completed, failed)           │  │
│  │ ├─ created_at, started_at, completed_at                       │  │
│  │ └─ metadata (parent_task_id for subtasks)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ agent_filesystem_operations (File System Backend Audit)       │  │
│  │ ├─ operation_id, session_id, agent_id                         │  │
│  │ ├─ operation_type (ls, read, write, edit, glob, grep)         │  │
│  │ ├─ file_path, operation_data                                  │  │
│  │ └─ created_at                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Enhancements

### 🗄️ **New Tables for Deep Agents**

Add these tables to your existing Supabase schema:

```sql
-- =============================================
-- DEEP AGENTS INTEGRATION TABLES
-- =============================================

-- 1. Tool Registry
CREATE TABLE IF NOT EXISTS public.agent_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  tool_type TEXT, -- 'search', 'calculation', 'database', 'external_api'
  function_schema JSONB NOT NULL, -- JSON schema for tool function
  requires_approval BOOLEAN DEFAULT false,
  approval_config JSONB, -- {"allowed_decisions": ["approve", "edit", "reject"]}
  assigned_agents UUID[], -- Array of agent IDs that can use this tool
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sub-Agent Relationships
CREATE TABLE IF NOT EXISTS public.agent_subagents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  subagent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  spawn_trigger_keywords TEXT[], -- Keywords that trigger sub-agent spawn
  specialization TEXT,
  delegation_priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_agent_id, subagent_id)
);

-- 3. Agent Memories (LangGraph Store Backend)
CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL, -- Usually agent_id or organization_id
  key TEXT NOT NULL, -- Memory file path like '/memories/user_preferences.md'
  value TEXT, -- File content
  value_type TEXT DEFAULT 'text', -- 'text', 'json', 'markdown'
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace, key)
);

CREATE INDEX idx_agent_memories_namespace ON public.agent_memories(namespace);
CREATE INDEX idx_agent_memories_key ON public.agent_memories(key);
CREATE INDEX idx_agent_memories_tags ON public.agent_memories USING GIN(tags);

-- 4. Checkpoints (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS public.agent_checkpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  checkpoint_type TEXT NOT NULL, -- 'tool_execution', 'reasoning_validation', 'plan_approval'
  proposed_action JSONB NOT NULL, -- What the agent wants to do
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'edited'
  human_feedback TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  timeout_seconds INTEGER DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_checkpoints_session ON public.agent_checkpoints(session_id);
CREATE INDEX idx_checkpoints_status ON public.agent_checkpoints(approval_status);

-- 5. Task History (Planning & TODO Tracking)
CREATE TABLE IF NOT EXISTS public.agent_task_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  task_description TEXT NOT NULL,
  active_form TEXT, -- Present continuous form: "Researching FDA pathways"
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  parent_task_id UUID REFERENCES public.agent_task_history(id), -- For subtasks
  order_index INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_task_history_session ON public.agent_task_history(session_id);
CREATE INDEX idx_task_history_status ON public.agent_task_history(status);
CREATE INDEX idx_task_history_parent ON public.agent_task_history(parent_task_id);

-- 6. File System Operations (Audit Trail)
CREATE TABLE IF NOT EXISTS public.agent_filesystem_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  operation_type TEXT NOT NULL, -- 'ls', 'read_file', 'write_file', 'edit_file', 'glob', 'grep'
  file_path TEXT NOT NULL,
  operation_data JSONB, -- Store operation details (content for write, changes for edit, etc.)
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fs_ops_session ON public.agent_filesystem_operations(session_id);
CREATE INDEX idx_fs_ops_type ON public.agent_filesystem_operations(operation_type);

-- =============================================
-- ENHANCE EXISTING TABLES
-- =============================================

-- Add Deep Agents configuration to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS deep_agents_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS filesystem_backend_type TEXT DEFAULT 'state'; -- 'state', 'store', 'composite'
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS memory_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS subagent_spawning_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS checkpoint_config JSONB; -- Tool-specific approval config
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS middleware_config JSONB; -- Custom middleware settings

-- Add assigned_tools to agents (many-to-many via JSONB array)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS assigned_tool_ids UUID[];

-- Add sub-agent network configuration
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS can_spawn_subagents BOOLEAN DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS subagent_pool UUID[]; -- Pool of available sub-agents
```

---

## Implementation Roadmap

### 📅 **6-Week Integration Plan**

#### **Week 1-2: Foundation & Setup**

**Goals**:
- Set up Deep Agents environment
- Migrate database schema
- Create initial tools registry

**Tasks**:
```bash
# 1. Install Deep Agents
cd services/ai-engine
pip install deepagents tavily-python

# 2. Run database migrations
cd supabase
psql $DATABASE_URL < migrations/deep_agents_schema.sql

# 3. Create healthcare tools
# services/ai-engine/src/tools/healthcare_tools.py
```

**Deliverables**:
- ✅ Deep Agents installed
- ✅ Database schema updated
- ✅ 20+ healthcare tools defined

---

#### **Week 3: Basic Deep Agent Integration**

**Goals**:
- Replace basic AgentOrchestrator with Deep Agents
- Implement TodoList middleware
- Enable file system for context management

**Tasks**:
1. **Create Deep Agent Factory** (`services/ai-engine/src/agents/deep_agent_factory.py`)
2. **Integrate with existing AgentOrchestrator**
3. **Add TodoList tracking to frontend**

**Code Example**:
```python
# services/ai-engine/src/agents/deep_agent_factory.py
from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI
from tools.healthcare_tools import get_healthcare_tools

class DeepAgentFactory:
    """Factory for creating Deep Agents from VITAL agent definitions"""

    def create_agent_from_db(self, agent_record: Dict) -> Any:
        """Create Deep Agent from database agent record"""

        # Load agent configuration
        agent_id = agent_record['id']
        system_prompt = agent_record['system_prompt']
        model_name = agent_record['model']

        # Get assigned tools
        tools = self.load_agent_tools(agent_record['assigned_tool_ids'])

        # Get sub-agents if enabled
        subagents = []
        if agent_record.get('can_spawn_subagents'):
            subagents = self.load_subagents(agent_id)

        # Create Deep Agent
        agent = create_deep_agent(
            model=ChatOpenAI(model=model_name, temperature=agent_record['temperature']),
            tools=tools,
            system_prompt=system_prompt,
            subagents=subagents,
            # Store backend for long-term memory
            backend=lambda rt: self.create_backend(agent_record, rt),
            store=self.get_postgres_store(),
            # Checkpoint configuration
            interrupt_on=agent_record.get('checkpoint_config', {}),
            checkpointer=self.get_checkpointer()
        )

        return agent
```

**Deliverables**:
- ✅ Deep Agent factory
- ✅ TodoList middleware working
- ✅ File system backend configured

---

#### **Week 4: Sub-Agent Network**

**Goals**:
- Define sub-agent relationships for 136+ agents
- Implement sub-agent spawning
- Test multi-level delegation

**Tasks**:
1. **Map current 250 agents to sub-agent networks**
2. **Populate agent_subagents table**
3. **Configure SubAgentMiddleware**

**Example Sub-Agent Network**:
```python
# FDA 510(k) Expert → Sub-Agents
fda_510k_expert = {
    "agent_id": "fda-510k-expert",
    "subagents": [
        {
            "name": "predicate-search-specialist",
            "description": "Searches FDA database for predicate devices",
            "system_prompt": "You are an expert at identifying predicate devices...",
            "tools": [fda_database_search, predicate_analyzer]
        },
        {
            "name": "substantial-equivalence-analyst",
            "description": "Analyzes substantial equivalence to predicates",
            "system_prompt": "You are an expert in substantial equivalence analysis...",
            "tools": [se_analyzer, comparison_tool]
        },
        {
            "name": "testing-requirements-specialist",
            "description": "Determines testing requirements for 510(k)",
            "system_prompt": "You are an expert in 510(k) testing requirements...",
            "tools": [testing_database, guideline_search]
        }
    ]
}
```

**Deliverables**:
- ✅ Sub-agent relationships defined
- ✅ SubAgentMiddleware configured
- ✅ Multi-level task delegation working

---

#### **Week 5: Long-Term Memory & Checkpoints**

**Goals**:
- Implement persistent memory across sessions
- Add human-in-the-loop checkpoints
- Build approval UI

**Tasks**:
1. **Configure PostgresStore for long-term memory**
2. **Implement checkpoint approval workflow**
3. **Build frontend checkpoint UI**

**Code Example**:
```python
# Composite Backend: Ephemeral + Persistent
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.postgres import PostgresStore

def create_backend(agent_record, runtime):
    """Create hybrid backend for agent"""

    # Ephemeral working files in state
    # Persistent memories in PostgreSQL via LangGraph Store
    return CompositeBackend(
        default=StateBackend(runtime),
        routes={
            "/memories/": StoreBackend(runtime),
            "/organization/": StoreBackend(runtime),  # Org-specific knowledge
        }
    )

# PostgreSQL store using Supabase connection
store = PostgresStore(
    connection_string=settings.supabase_connection_string,
    namespace="vital_agent_memories"
)

agent = create_deep_agent(
    backend=create_backend,
    store=store,
    system_prompt="""
    Check /memories/user_preferences.md for user-specific preferences.
    Check /organization/compliance_requirements.md for org requirements.
    Save important discoveries to /memories/ for future reference.
    """,
    interrupt_on={
        "fda_submission_tool": {"allowed_decisions": ["approve", "edit", "reject"]},
        "clinical_protocol_generator": True
    }
)
```

**Deliverables**:
- ✅ Long-term memory working
- ✅ Checkpoint system implemented
- ✅ Approval UI complete

---

#### **Week 6: Production Optimization & Testing**

**Goals**:
- Performance optimization
- End-to-end testing
- Documentation

**Tasks**:
1. **Load testing (1000+ concurrent agents)**
2. **Prompt caching optimization**
3. **Complete API documentation**

**Deliverables**:
- ✅ Production-ready system
- ✅ Performance benchmarks met
- ✅ Complete documentation

---

## Production Code Examples

### 🔧 **Complete Implementation Examples**

#### Example 1: FDA 510(k) Expert with Deep Agents

```python
# services/ai-engine/src/agents/healthcare/fda_510k_expert.py

from deepagents import create_deep_agent, CompiledSubAgent
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from tools.fda_tools import (
    fda_database_search,
    predicate_analyzer,
    substantial_equivalence_tool,
    guidance_document_retriever
)

def create_fda_510k_expert():
    """
    Create FDA 510(k) Expert with Deep Agents framework

    Features:
    - Planning via TodoList middleware
    - Context management via File system
    - Sub-agent spawning for specialized tasks
    - Long-term memory of submission strategies
    - Human approval for final recommendations
    """

    # Define sub-agents
    predicate_search_subagent = {
        "name": "predicate-search-specialist",
        "description": "Expert at searching FDA database for appropriate predicate devices",
        "system_prompt": """You are a predicate device search specialist.

        When given a device description:
        1. Use fda_database_search to find similar devices
        2. Analyze device classifications
        3. Return top 3-5 potential predicates with 510(k) numbers

        Save results to /predicates/search_results.md for later reference.
        """,
        "tools": [fda_database_search, predicate_analyzer],
        "model": "gpt-4-turbo-preview"
    }

    substantial_equivalence_subagent = {
        "name": "substantial-equivalence-analyst",
        "description": "Expert at analyzing substantial equivalence between devices",
        "system_prompt": """You are a substantial equivalence analyst.

        When comparing subject device to predicate:
        1. Read device specs from /device/specifications.md
        2. Analyze technological characteristics
        3. Assess intended use equivalence
        4. Generate comparison table

        Output: /analysis/substantial_equivalence_assessment.md
        """,
        "tools": [substantial_equivalence_tool, predicate_analyzer],
        "model": "gpt-4-turbo-preview"
    }

    # Create main FDA 510(k) expert
    fda_510k_expert = create_deep_agent(
        model=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3),

        tools=[
            fda_database_search,
            predicate_analyzer,
            substantial_equivalence_tool,
            guidance_document_retriever
        ],

        system_prompt="""You are Dr. Sarah Mitchell, an FDA 510(k) regulatory expert.

## Your Expertise
- 15+ years FDA regulatory experience
- 500+ successful 510(k) submissions
- Expert in predicate identification and substantial equivalence

## Your Process for 510(k) Submissions

1. **Device Classification**
   - Understand intended use
   - Determine device class (I, II, III)
   - Identify product code

2. **Predicate Device Search**
   - Use fda_database_search tool
   - Delegate complex searches to predicate-search-specialist sub-agent
   - Analyze predicate device's 510(k) submission

3. **Substantial Equivalence Analysis**
   - Compare intended use
   - Compare technological characteristics
   - Delegate detailed analysis to substantial-equivalence-analyst sub-agent
   - Identify any differences requiring testing

4. **Testing Requirements**
   - Determine biocompatibility needs
   - Specify performance testing
   - Identify software validation if applicable

5. **Submission Strategy**
   - Recommend Traditional vs Abbreviated vs Special 510(k)
   - Develop submission timeline
   - Identify potential FDA questions

## File Organization
- Save device specs to /device/specifications.md
- Store predicate analysis in /predicates/
- Keep substantial equivalence in /analysis/
- Final strategy in /strategy/submission_plan.md

## Memory
- Check /memories/organization/previous_submissions.md for past strategies
- Save successful approaches to /memories/strategies/ for future use

## Important Notes
- Always cite specific FDA guidance documents
- Use 510(k) numbers when referencing predicates
- Flag high-risk areas for human review
""",

        subagents=[
            predicate_search_subagent,
            substantial_equivalence_subagent
        ],

        # Hybrid backend: ephemeral + persistent
        backend=lambda rt: CompositeBackend(
            default=StateBackend(rt),
            routes={
                "/memories/": StoreBackend(rt)
            }
        ),

        store=get_postgres_store(),

        # Require human approval for final recommendations
        interrupt_on={
            "fda_database_search": False,  # No approval needed
            "substantial_equivalence_tool": {"allowed_decisions": ["approve", "edit"]}
        },

        checkpointer=get_checkpointer()
    )

    return fda_510k_expert
```

**Usage Example**:
```python
# User query
user_query = """
I'm developing a continuous glucose monitor (CGM) for diabetes management.
The device uses a subcutaneous sensor that measures interstitial glucose
levels every 5 minutes and wirelessly transmits data to a smartphone app.

Help me develop a 510(k) submission strategy.
"""

# Execute agent
result = fda_510k_expert.invoke({
    "messages": [{"role": "user", "content": user_query}]
})

# Agent automatically:
# 1. Creates TODO list:
#    - [in_progress] Research CGM device classification
#    - [pending] Identify predicate devices
#    - [pending] Analyze substantial equivalence
#    - [pending] Determine testing requirements
#    - [pending] Develop submission timeline

# 2. Saves device description to /device/specifications.md

# 3. Spawns predicate-search-specialist sub-agent:
#    - Searches FDA database for CGM predicates
#    - Returns: "Dexcom G6 (K173810), FreeStyle Libre (K161121)"

# 4. Analyzes substantial equivalence

# 5. Triggers checkpoint before final recommendation

# 6. Saves successful strategy to /memories/strategies/cgm_510k_2025.md
```

---

#### Example 2: Clinical Trial Designer with Multi-Modal Context

```python
# services/ai-engine/src/agents/healthcare/clinical_trial_designer.py

from deepagents import create_deep_agent
from tools.clinical_tools import (
    literature_search,
    sample_size_calculator,
    endpoint_recommender,
    statistical_power_analyzer
)

def create_clinical_trial_designer():
    """
    Clinical Trial Designer with Deep Agents

    Handles:
    - Multi-step protocol development
    - Statistical calculations
    - Literature review
    - Context management for long protocols
    """

    # Biostatistics sub-agent
    biostatistics_subagent = {
        "name": "biostatistician",
        "description": "Expert in clinical trial statistics and sample size calculations",
        "system_prompt": """You are Dr. Robert Chen, a biostatistician.

        When asked for statistical design:
        1. Clarify study objectives (superiority, non-inferiority, equivalence)
        2. Use sample_size_calculator for power calculations
        3. Recommend statistical tests
        4. Specify interim analysis plan

        Output detailed statistical analysis plan to /statistics/sap.md
        """,
        "tools": [sample_size_calculator, statistical_power_analyzer]
    }

    # Create clinical trial designer
    clinical_trial_designer = create_deep_agent(
        model=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5),

        tools=[
            literature_search,
            sample_size_calculator,
            endpoint_recommender,
            statistical_power_analyzer
        ],

        system_prompt="""You are Dr. Lisa Anderson, a clinical trial design expert.

## Your Expertise
- 20+ years clinical research experience
- Expertise in FDA/EMA trial requirements
- Published 100+ protocols

## Protocol Development Process

1. **Study Objectives**
   - Define primary and secondary endpoints
   - Use endpoint_recommender for FDA-accepted endpoints
   - Save to /protocol/objectives.md

2. **Population Selection**
   - Define inclusion/exclusion criteria
   - Specify target population
   - Save to /protocol/population.md

3. **Statistical Design**
   - Delegate to biostatistician sub-agent for complex calculations
   - Get sample size, power analysis, interim analysis plan
   - Review and integrate into protocol

4. **Study Procedures**
   - Define visit schedule
   - Specify assessments
   - Save to /protocol/procedures.md

5. **Safety Monitoring**
   - Define stopping rules
   - Specify DSMB requirements
   - Save to /protocol/safety.md

## Literature Integration
- Use literature_search to find similar trials
- Save references to /literature/references.md
- Cite in protocol sections

## Memory
- Check /memories/organization/previous_trials.md for organization's past trials
- Learn from successful trial designs

## File Organization
/protocol/ - Protocol sections
/statistics/ - Statistical plans
/literature/ - Literature references
/safety/ - Safety plans
/final/ - Complete protocol
""",

        subagents=[biostatistics_subagent],

        backend=lambda rt: CompositeBackend(
            default=StateBackend(rt),
            routes={"/memories/": StoreBackend(rt)}
        ),

        store=get_postgres_store()
    )

    return clinical_trial_designer
```

---

## Migration Strategy

### 🚦 **Phased Migration Approach**

#### **Phase 1: Parallel Run** (Weeks 1-2)
- Keep existing AgentOrchestrator
- Run Deep Agents in parallel
- Compare outputs
- No production traffic

#### **Phase 2: Canary Deployment** (Weeks 3-4)
- 10% of traffic to Deep Agents
- Monitor performance, errors
- Rollback capability ready

#### **Phase 3: Gradual Rollout** (Weeks 5-6)
- 50% traffic
- 100% traffic by Week 6
- Decommission old orchestrator

---

## Success Metrics

| Metric | Current | Target | Deep Agents Impact |
|--------|---------|--------|-------------------|
| **Multi-step task completion** | 40% | 85% | +45% (planning tools) |
| **Context overflow rate** | 25% | <5% | -20% (file system) |
| **Expert consultation depth** | 1 level | 3-4 levels | +2-3 (sub-agents) |
| **User preference retention** | 0% | 90% | +90% (long-term memory) |
| **Critical decision accuracy** | 75% | 95% | +20% (checkpoints) |

---

## Conclusion

By integrating LangChain's **Deep Agents framework**, VITAL Ask Expert will gain:

1. ✅ **Planning & Decomposition** - Break complex healthcare tasks into manageable steps
2. ✅ **Context Management** - Handle 100+ page regulatory documents without overflow
3. ✅ **Sub-Agent Specialization** - Spawn clinical, regulatory, statistical experts on-demand
4. ✅ **Long-Term Memory** - Remember user preferences, org requirements, past strategies
5. ✅ **Human-in-the-Loop** - Safety gates for critical regulatory/clinical decisions

**Result**: A **world-class AI healthcare consultation platform** that matches or exceeds ChatGPT, Claude, Gemini, and Manus while maintaining healthcare compliance and domain expertise.

---

**Document Status:** Implementation Roadmap
**Next Steps:** Begin Week 1-2 foundation tasks
**Owner:** VITAL Engineering Team
**Review Date:** After each phase completion
