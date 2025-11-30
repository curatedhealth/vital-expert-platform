# AI Agent Implementation Guide
## VITAL Platform - Agent Coordination & Documentation

**Last Updated**: November 29, 2025
**Version**: 3.0
**Status**: Production Ready
**Audience**: AI Agents & Developers

---

## 🚨 CRITICAL: CANONICAL PROJECT DIRECTORY

**ALL work MUST be performed in:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

**NEVER work in `/Users/hichamnaim/Downloads/Cursor/VITAL/`** - this is an archived directory containing outdated code.

---

## 🤖 AGENT MODEL ASSIGNMENTS (Updated 2025-11-29)

### Leadership Tier - Opus 4.5 Model
These agents handle strategic decisions and complex reasoning:

| Agent | File | Model |
|-------|------|-------|
| vital-platform-orchestrator | `.claude/agents/vital-platform-orchestrator.md` | **opus** |
| strategy-vision-architect | `.claude/agents/strategy-vision-architect.md` | **opus** |
| prd-architect | `.claude/agents/prd-architect.md` | **opus** |
| system-architecture-architect | `.claude/agents/system-architecture-architect.md` | **opus** |
| business-analytics-strategist | `.claude/agents/business-analytics-strategist.md` | **opus** |
| documentation-qa-lead | `.claude/agents/documentation-qa-lead.md` | **opus** |
| implementation-compliance-qa-agent | `.claude/agents/implementation-compliance-qa-agent.md` | **opus** |
| launch-strategy-agent | `.claude/agents/launch-strategy-agent.md` | **opus** |

### Specialist Tier - Sonnet Model
All other agents use Sonnet for cost-effective execution.

---

## 📚 Complete Documentation Index

**🔗 Master Index**: [`.vital-docs/INDEX.md`](../../.vital-docs/INDEX.md)

This is the definitive guide for AI agents working on the VITAL platform. For the complete documentation structure, always refer to the master INDEX.

---

## Quick Navigation for AI Agents

### 🎯 Before Starting Any Task

**ALWAYS READ FIRST**:
1. [`.vital-docs/agents/AGENT_COORDINATION_GUIDE.md`](../../.vital-docs/agents/AGENT_COORDINATION_GUIDE.md) - Master coordination guide
2. [`.vital-docs/INDEX.md`](../../.vital-docs/INDEX.md) - Complete documentation index
3. Relevant specialized agent guide from [`.vital-docs/agents/`](../../.vital-docs/agents/)

### 🤖 AI Agent Team Structure

#### 12 Specialized Agents

| Agent | Guide | Responsibilities |
|-------|-------|------------------|
| **Strategy & Vision Architect** | [`strategy-vision-architect.md`](../../.vital-docs/agents/strategy-vision-architect.md) | Platform strategy, vision documents, roadmaps |
| **System Architecture Architect** | [`system-architecture-architect.md`](../../.vital-docs/agents/system-architecture-architect.md) | System design, architecture decisions, tech stack |
| **Frontend UI Architect** | [`frontend-ui-architect.md`](../../.vital-docs/agents/frontend-ui-architect.md) | React, Next.js, UI components, frontend architecture |
| **Python AI/ML Engineer** | [`python-ai-ml-engineer.md`](../../.vital-docs/agents/python-ai-ml-engineer.md) | Backend services, LangChain, AI/ML pipelines |
| **Data Architecture Expert** | [`data-architecture-expert.md`](../../.vital-docs/agents/data-architecture-expert.md) | Data pipelines, ETL, analytics, data modeling |
| **SQL/Supabase Specialist** | [`sql-supabase-specialist.md`](../../.vital-docs/agents/sql-supabase-specialist.md) | Database schema, migrations, queries, Supabase |
| **LangGraph Workflow Translator** | [`langgraph-workflow-translator.md`](../../.vital-docs/agents/langgraph-workflow-translator.md) | LangGraph workflows, state machines, agent graphs |
| **Business Analytics Strategist** | [`business-analytics-strategist.md`](../../.vital-docs/agents/business-analytics-strategist.md) | Analytics, metrics, dashboards, reports |
| **Documentation & QA Lead** | [`documentation-qa-lead.md`](../../.vital-docs/agents/documentation-qa-lead.md) | Documentation, testing, quality assurance |
| **PRD Architect** | [`prd-architect.md`](../../.vital-docs/agents/prd-architect.md) | Product requirements, feature specs |
| **Ask Expert Service Agent** | [`ask-expert-service-agent.md`](../../.vital-docs/agents/ask-expert-service-agent.md) | Expert consultation service |
| **Ask Panel Service Agent** | [`ask-panel-service-agent.md`](../../.vital-docs/agents/ask-panel-service-agent.md) | Panel discussion service |

### 📋 Task Decision Tree

```
┌─────────────────────────────────────────┐
│          New Task Received              │
└──────────────┬──────────────────────────┘
               │
               ▼
       ┌───────────────────┐
       │ What's the domain? │
       └───────┬────────────┘
               │
        ┌──────┼──────────────────────┐
        │      │                      │
        ▼      ▼                      ▼
    Strategy  Database           Frontend/UI
        │      │                      │
        │      │                      │
        ▼      ▼                      ▼
   [Guide]  [Guide]               [Guide]
```

### 🗂️ Critical Documentation by Task Type

#### Database Schema Work
**MUST READ**:
1. [`.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](../../.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)
2. [`.vital-docs/agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](../../.vital-docs/agents/SQL_SUPABASE_SPECIALIST_GUIDE.md)
3. [`.vital-docs/vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md`](../../.vital-docs/vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md)

**Key Locations**:
- Core Schema: `.vital-docs/vital-expert-docs/10-data-schema/01-core-schema/`
- Role Junctions: `.vital-docs/vital-expert-docs/10-data-schema/02-role-junctions/`
- Persona Junctions: `.vital-docs/vital-expert-docs/10-data-schema/03-persona-junctions/`
- JTBD Schema: `.vital-docs/vital-expert-docs/10-data-schema/jtbds/`
- Migrations: `.vital-docs/vital-expert-docs/10-data-schema/06-migrations/`

#### Frontend Development
**MUST READ**:
1. [`.vital-docs/agents/frontend-ui-architect.md`](../../.vital-docs/agents/frontend-ui-architect.md)
2. [`.vital-docs/vital-expert-docs/05-architecture/frontend/`](../../.vital-docs/vital-expert-docs/05-architecture/frontend/)
3. [`.vital-docs/vital-expert-docs/03-product/ui-components/`](../../.vital-docs/vital-expert-docs/03-product/ui-components/)

#### Backend Development
**MUST READ**:
1. [`.vital-docs/agents/python-ai-ml-engineer.md`](../../.vital-docs/agents/python-ai-ml-engineer.md)
2. [`.vital-docs/vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](../../.vital-docs/vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
3. [`.vital-docs/vital-expert-docs/09-api/API_DOCUMENTATION.md`](../../.vital-docs/vital-expert-docs/09-api/API_DOCUMENTATION.md)

#### Workflow Implementation
**MUST READ**:
1. [`.vital-docs/agents/langgraph-workflow-translator.md`](../../.vital-docs/agents/langgraph-workflow-translator.md)
2. [`.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](../../.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)
3. [`.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md`](../../.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md)

#### Strategy & Vision
**MUST READ**:
1. [`.vital-docs/agents/strategy-vision-architect.md`](../../.vital-docs/agents/strategy-vision-architect.md)
2. [`.vital-docs/vital-expert-docs/01-strategy/STRATEGIC_PLAN.md`](../../.vital-docs/vital-expert-docs/01-strategy/STRATEGIC_PLAN.md)
3. [`.vital-docs/vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md`](../../.vital-docs/vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md)

---

## Golden Rules for AI Agents

### 1. File Organization

**ALWAYS follow these rules**:

#### Where to Place Files

```
Database Schema
  → .vital-docs/vital-expert-docs/10-data-schema/
  → Subdirectories: 01-core-schema/, 02-role-junctions/, etc.
  → JTBD files: 10-data-schema/jtbds/

Agent Specifications
  → .vital-docs/agents/[agent-name].md

Strategy Documents
  → .vital-docs/vital-expert-docs/01-strategy/

Architecture Documents
  → .vital-docs/vital-expert-docs/05-architecture/

API Documentation
  → .vital-docs/vital-expert-docs/09-api/

Testing Documents
  → .vital-docs/vital-expert-docs/11-testing/

Workflows
  → .vital-docs/vital-expert-docs/06-workflows/
```

#### Never Place Files In
- ❌ Root directory (except master files)
- ❌ Random subdirectories
- ❌ Outside `.vital-docs/` structure

### 2. Documentation Standards

**Every documentation file MUST have**:

```markdown
# Title

**Last Updated**: YYYY-MM-DD
**Version**: X.X
**Status**: Draft | In Progress | Production Ready
**Audience**: AI Agents | Developers | Everyone

---

## Purpose
[Brief description]

## Contents
[Table of contents]
```

### 3. Naming Conventions

**Files**:
- Major documents: `UPPERCASE.md` (e.g., `README.md`, `GOLD_STANDARD_SCHEMA.md`)
- Agent files: `snake-case.md` (e.g., `sql-supabase-specialist.md`)
- Descriptive names: `TESTING_MILESTONE.md` not `doc1.md`

**Database**:
- Tables: `snake_case` (e.g., `org_roles`, `jtbd_functions`)
- Columns: `snake_case` (e.g., `created_at`, `function_name`)
- Junction tables: `[entity1]_[entity2]` (e.g., `role_tools`)

### 4. Schema Work - Critical Rules

When working on database schema:

#### ✅ DO:
- Always read `GOLD_STANDARD_SCHEMA.md` first
- Use junction tables for many-to-many relationships
- Follow role-persona inheritance pattern
- Keep migrations idempotent (`IF NOT EXISTS`)
- Document all schema changes
- Use ID + NAME caching pattern for performance
- Place files in correct subdirectories (01-core-schema, 02-role-junctions, etc.)

#### ❌ DON'T:
- Use JSONB for queryable data
- Use arrays for multi-valued attributes
- Duplicate data between roles and personas
- Hardcode tenant_id in main tables
- Skip migration documentation
- Create one-off SQL files in random locations

### 5. Agent Coordination

#### Before Starting Work:
1. ✅ Read [AGENT_COORDINATION_GUIDE.md](../../.vital-docs/agents/AGENT_COORDINATION_GUIDE.md)
2. ✅ Check if task requires specialized agent
3. ✅ Review relevant documentation section
4. ✅ Follow file organization rules
5. ✅ Update documentation after changes

#### When to Delegate:
- **Database work** → SQL/Supabase Specialist
- **Frontend work** → Frontend UI Architect
- **Backend work** → Python AI/ML Engineer
- **Strategy docs** → Strategy Vision Architect
- **Workflows** → LangGraph Workflow Translator
- **Documentation** → Documentation QA Lead

#### Communication Protocol:
1. State current task clearly
2. Mention which agent guide you're following
3. Link to relevant documentation files
4. Explain file placement rationale
5. Document all changes made

---

## Common Tasks Quick Reference

### Creating New Database Table

```sql
-- File: .vital-docs/vital-expert-docs/10-data-schema/01-core-schema/create_new_table.sql

-- 1. Read GOLD_STANDARD_SCHEMA.md
-- 2. Follow naming conventions
-- 3. Add proper constraints
-- 4. Create indexes
-- 5. Document purpose

CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);

COMMENT ON TABLE new_table IS 'Purpose of this table';
```

### Creating New Migration

```sql
-- File: .vital-docs/vital-expert-docs/10-data-schema/06-migrations/YYYYMMDD_descriptive_name.sql

-- Migration: Descriptive Name
-- Purpose: What this migration does
-- Date: YYYY-MM-DD

-- Make idempotent
CREATE TABLE IF NOT EXISTS ...

-- Include rollback instructions
-- Rollback:
-- DROP TABLE IF EXISTS ...;
```

### Creating Agent Documentation

```markdown
<!-- File: .vital-docs/agents/new-agent.md -->

# New Agent Name

**Role**: Brief role description
**Expertise**: Primary areas
**Last Updated**: YYYY-MM-DD

## Responsibilities
- What this agent does

## When to Use
- Scenarios requiring this agent

## Key Guidelines
- Important rules

## Documentation References
- Relevant docs
```

### Updating Documentation

1. Read existing file
2. Check last updated date
3. Make changes
4. Update "Last Updated" field
5. Update version if major change
6. Document changes in commit

---

## Quick Links for Common Scenarios

### "I need to work on database schema"
→ [`.vital-docs/agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](../../.vital-docs/agents/SQL_SUPABASE_SPECIALIST_GUIDE.md)  
→ [`.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](../../.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)

### "I need to implement a workflow"
→ [`.vital-docs/agents/langgraph-workflow-translator.md`](../../.vital-docs/agents/langgraph-workflow-translator.md)  
→ [`.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](../../.vital-docs/vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)

### "I need to work on frontend"
→ [`.vital-docs/agents/frontend-ui-architect.md`](../../.vital-docs/agents/frontend-ui-architect.md)  
→ [`.vital-docs/vital-expert-docs/05-architecture/frontend/`](../../.vital-docs/vital-expert-docs/05-architecture/frontend/)

### "I need to work on backend API"
→ [`.vital-docs/agents/python-ai-ml-engineer.md`](../../.vital-docs/agents/python-ai-ml-engineer.md)  
→ [`.vital-docs/vital-expert-docs/09-api/API_DOCUMENTATION.md`](../../.vital-docs/vital-expert-docs/09-api/API_DOCUMENTATION.md)

### "I need to understand the system architecture"
→ [`.vital-docs/agents/system-architecture-architect.md`](../../.vital-docs/agents/system-architecture-architect.md)  
→ [`.vital-docs/vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](../../.vital-docs/vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)

### "I need to create documentation"
→ [`.vital-docs/agents/documentation-qa-lead.md`](../../.vital-docs/agents/documentation-qa-lead.md)  
→ [`.vital-docs/INDEX.md`](../../.vital-docs/INDEX.md)

### "I need to understand personas and JTBDs"
→ [`.vital-docs/vital-expert-docs/10-data-schema/jtbds/README.md`](../../.vital-docs/vital-expert-docs/10-data-schema/jtbds/README.md)  
→ [`.vital-docs/vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md`](../../.vital-docs/vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md)

### "I need to understand LLM routing"
→ [`docs/technical/claude.md`](./claude.md)  
→ Domain-Based LLM Routing section

---

## Error Prevention Checklist

Before submitting work, verify:

- [ ] Files placed in correct directory structure
- [ ] Followed naming conventions
- [ ] Updated "Last Updated" field
- [ ] Added proper headers to new files
- [ ] Followed schema golden rules (if database work)
- [ ] Read relevant agent guide
- [ ] Checked for duplicates
- [ ] Documented changes
- [ ] Updated INDEX.md if adding major files
- [ ] Archived obsolete files to `_archive/`

---

## Getting Help

### Can't Find Documentation?
1. Check [`.vital-docs/INDEX.md`](../../.vital-docs/INDEX.md) first
2. Search by topic in INDEX
3. Check [`.vital-docs/QUICK_REFERENCE.md`](../../.vital-docs/QUICK_REFERENCE.md)
4. Browse [`.vital-docs/vital-expert-docs/00-overview/`](../../.vital-docs/vital-expert-docs/00-overview/)

### Not Sure Which Agent to Use?
→ [`.vital-docs/agents/AGENT_COORDINATION_GUIDE.md`](../../.vital-docs/agents/AGENT_COORDINATION_GUIDE.md) has decision trees

### Schema Questions?
→ [`.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](../../.vital-docs/vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)

---

## Maintenance

**Last Updated**: November 21, 2024  
**Next Review**: December 2024

### Recent Updates
- 2024-11-21: Created comprehensive agent.md guide
- 2024-11-21: Added INDEX.md reference
- 2024-11-21: Completed JTBD normalization documentation

---

**Navigation**: [Top](#ai-agent-implementation-guide) | [Quick Navigation](#quick-navigation-for-ai-agents) | [Golden Rules](#golden-rules-for-ai-agents) | [Common Tasks](#common-tasks-quick-reference)

