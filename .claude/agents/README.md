# VITAL Claude Code Agents

This directory contains specialized Claude Code agents that assist the VITAL development team.

---

## Available Agents

### Development & Engineering

#### **python-ai-ml-engineer.md** 🐍
**Purpose:** Python, AI/ML, LangGraph, and LangChain expert for VITAL backend development

**Specializes In:**
- LangGraph workflow implementation (4 Ask Expert modes)
- GraphRAG hybrid search (PostgreSQL + Pinecone + Neo4j)
- Deep agent architectures with sub-agent spawning
- FastAPI backend development
- Database integrations (Supabase, Pinecone, Neo4j)
- Production-grade Python code (type hints, error handling, testing)

**Best For:**
- Backend engineers building agent systems
- Product managers needing technical feasibility assessments
- Implementing Ask Expert modes
- GraphRAG agent selection
- Performance optimization

**How to Use:**
Invoke with `@python-ai-ml-engineer` in Claude Code to get help with:
- "Implement Mode 3 GraphRAG agent selection"
- "Optimize PostgreSQL agent search query"
- "Create LangGraph workflow for deep agents"
- "Add logging to agent orchestrator"
- "Review Python code for production readiness"

---

### Product & Documentation

#### **prd-architect.md** 📋
Product Requirements Document expert

#### **strategy-vision-architect.md** 🎯
Strategic vision and platform planning

---

### Architecture & Design

#### **system-architecture-architect.md** 🏗️
System architecture and ARD creation

#### **data-architecture-expert.md** 🗄️
Database design, RLS policies, multi-tenant data models

#### **frontend-ui-architect.md** 🎨
Frontend architecture and UI design

#### **langgraph-workflow-translator.md** 🔀
LangGraph state machine workflows

---

### Services

#### **ask-expert-service-agent.md** 💬
Ask Expert service implementation

#### **ask-panel-service-agent.md** 👥
Ask Panel multi-agent consultation

#### **ask-committee-service-agent.md** 🏛️
Ask Committee expert panel

#### **byoai-orchestration-service-agent.md** 🔌
BYOAI integration and orchestration

---

### Specialists

#### **sql-supabase-specialist.md** 🐘
SQL and Supabase expertise

#### **business-analytics-strategist.md** 📊
Business analytics and metrics

#### **documentation-qa-lead.md** 📚
Documentation and quality assurance

---

## Quick Start Guide

### For Backend Engineers

**Working on agent orchestration?**
```
@python-ai-ml-engineer Help me implement GraphRAG agent selection with hybrid search
```

**Need database optimization?**
```
@sql-supabase-specialist Optimize this agent search query for performance
```

**Building LangGraph workflows?**
```
@langgraph-workflow-translator Create state graph for Mode 4 (Chat-Auto) with sub-agents
```

### For Product Managers

**Evaluating technical feasibility?**
```
@python-ai-ml-engineer Is it feasible to implement real-time multi-agent collaboration with <500ms latency?
```

**Need architecture context?**
```
@system-architecture-architect Explain the GraphRAG hybrid search architecture
```

### For Frontend Engineers

**API integration questions?**
```
@frontend-ui-architect How should we handle WebSocket connections for real-time agent responses?
```

---

## Agent Coordination

For complex tasks requiring multiple agents:

**Example: Implementing New Ask Expert Mode**
1. `@prd-architect` - Define product requirements
2. `@system-architecture-architect` - Design architecture
3. `@python-ai-ml-engineer` - Implement backend
4. `@frontend-ui-architect` - Build UI
5. `@documentation-qa-lead` - Document and test

---

## VITAL Context

All agents understand:
- **Multi-tenant architecture** with RLS
- **4 Ask Expert modes** (Chat/Query × Manual/Auto)
- **GraphRAG hybrid search** (PostgreSQL + Pinecone + Neo4j)
- **Deep agents** with sub-agent spawning
- **Tech stack**: Next.js, Python/FastAPI, LangGraph, Supabase

---

## Contributing New Agents

To add a new agent:

1. Create `agent-name.md` in this directory
2. Follow the format of existing agents (see `python-ai-ml-engineer.md`)
3. Include:
   - Core expertise
   - Primary mission
   - Specific responsibilities
   - Code examples
   - VITAL context
   - Collaboration model
4. Update this README with agent description

---

## Reference Documentation

All agents have access to:
- `.claude/vital-expert-docs/` - Complete VITAL documentation
- `.claude/strategy-docs/` - Strategic planning documents
- `supabase/migrations/` - Database schemas
- Project codebase

**Key Docs:**
- `vital-expert-docs/04-services/ask-expert/VITAL_Ask_Expert_PRD_ENHANCED_v2.md`
- `vital-expert-docs/04-services/ask-expert/VITAL_Ask_Expert_ARD_ENHANCED_v2.md`
- `vital-expert-docs/08-agents/VITAL_AGENT_FRAMEWORK_CORE_CONCEPTS.md`
- `vital-expert-docs/08-agents/GRAPHRAG_AGENT_SELECTION_INTEGRATION.md`
- `vital-expert-docs/08-agents/DEEP_AGENTS_INTEGRATION_GUIDE.md`

---

**Last Updated:** November 17, 2025
