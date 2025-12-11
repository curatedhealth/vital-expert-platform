# VITAL Platform - Directory Structure

**Last Updated**: December 5, 2025
**Version**: 6.0 - World-Class Architecture Complete

---

## 🚨 CRITICAL: CANONICAL PROJECT DIRECTORY

**ALL work MUST be performed in:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

**NEVER work in `/Users/hichamnaim/Downloads/Cursor/VITAL/`** - this is an archived directory.

---

## 📂 Current Root Structure

```
VITAL-platform/
│
├── .claude/                     ← 🎛️ Claude Code Command Center (SINGLE SOURCE OF TRUTH)
│   ├── README.md                ← Command Center overview
│   ├── INDEX.md                 ← Master navigation
│   ├── STRUCTURE.md             ← This file
│   ├── CATALOGUE.md             ← Complete catalog
│   ├── AGENT_QUICK_START.md     ← Quick start for agents
│   │
│   ├── CLAUDE.md                ← Claude operational rules
│   ├── VITAL.md                 ← VITAL Platform standards
│   ├── EVIDENCE_BASED_RULES.md  ← Evidence-based operation policy
│   ├── settings.local.json      ← Claude Code settings
│   │
│   ├── agents/                  ← 🤖 38 Claude Code Development Agents
│   │   │
│   │   │ # LEADERSHIP TIER (Opus 4.5) - 8 agents
│   │   ├── vital-platform-orchestrator.md    ← Platform Coordinator
│   │   ├── strategy-vision-architect.md      ← Strategy Lead
│   │   ├── prd-architect.md                  ← Product Requirements Lead
│   │   ├── system-architecture-architect.md  ← Architecture Lead
│   │   ├── business-analytics-strategist.md  ← Business Strategy Lead
│   │   ├── documentation-qa-lead.md          ← Documentation Lead
│   │   ├── implementation-compliance-qa-agent.md ← QA Gatekeeper
│   │   ├── launch-strategy-agent.md          ← Launch Coordinator
│   │   │
│   │   │ # SPECIALIST TIER (Sonnet) - 30 agents
│   │   ├── data-architecture-expert.md
│   │   ├── sql-supabase-specialist.md
│   │   ├── vital-data-strategist.md
│   │   ├── frontend-ui-architect.md
│   │   ├── python-ai-ml-engineer.md
│   │   ├── langgraph-workflow-translator.md
│   │   ├── ux-ui-architect.md
│   │   ├── ask-expert-service-agent.md
│   │   ├── ask-panel-service-agent.md
│   │   ├── byoai-orchestration-service-agent.md
│   │   └── ... (19 more specialist agents)
│   │
│   └── docs/                    ← 📚 DOCUMENTATION (SINGLE SOURCE OF TRUTH)
│       ├── README.md            ← Documentation overview (START HERE)
│       ├── INDEX.md             ← Quick navigation index
│       │
│       ├── strategy/            ← Vision, Strategy, Business
│       │   ├── vision/          ← Platform vision documents
│       │   ├── prd/             ← Product Requirements Documents
│       │   ├── ard/             ← Architecture Requirements Documents
│       │   ├── business/        ← Business requirements
│       │   └── roadmap/         ← Product roadmap
│       │
│       ├── platform/            ← Platform Assets & Resources
│       │   ├── agents/          ← Agent definitions (distinct from .claude/agents/)
│       │   ├── personas/        ← User personas
│       │   ├── prompts/         ← Prompt library
│       │   ├── workflows/       ← Workflow templates
│       │   ├── jtbds/           ← Jobs-to-be-done
│       │   ├── knowledge-domains/ ← Knowledge domain definitions
│       │   ├── capabilities/    ← Platform capabilities
│       │   └── skills/          ← Skill definitions
│       │
│       ├── services/            ← Service Documentation
│       │   ├── ask-expert/      ← Ask Expert (1:1 consultation)
│       │   ├── ask-panel/       ← Ask Panel (multi-expert)
│       │   ├── ask-committee/   ← Ask Committee (deliberation)
│       │   └── byoai-orchestration/ ← BYOAI custom workflows
│       │
│       ├── architecture/        ← Technical Architecture
│       │   ├── data-schema/     ← Database schemas (383 files)
│       │   ├── architecture/    ← System architecture docs
│       │   ├── api/             ← API specifications
│       │   ├── backend/         ← Backend architecture
│       │   ├── frontend/        ← Frontend architecture
│       │   ├── infrastructure/  ← Infrastructure as code
│       │   └── rag-pipeline/    ← RAG pipeline design
│       │
│       ├── workflows/           ← Workflow Guides
│       │   └── WORKFLOW-DESIGNER-GUIDE.md
│       │
│       ├── operations/          ← Operations & DevOps
│       │   ├── deployment/      ← Deployment guides
│       │   ├── monitoring/      ← Monitoring setup
│       │   ├── maintenance/     ← Maintenance procedures
│       │   ├── runbooks/        ← Operational runbooks
│       │   └── scripts/         ← Operational scripts
│       │
│       ├── testing/             ← Testing Documentation
│       │   ├── testing/         ← Test strategies
│       │   ├── compliance/      ← Compliance testing
│       │   ├── performance/     ← Performance testing
│       │   └── security/        ← Security testing
│       │
│       └── coordination/        ← Agent Coordination Guides
│           ├── AGENT_COORDINATION_GUIDE.md
│           ├── AGENT_IMPLEMENTATION_GUIDE.md
│           ├── AGENTS_DOCUMENTATION_GUIDE.md
│           ├── QUICK_START_VISUAL_GUIDE.md
│           ├── RECOMMENDED_AGENT_STRUCTURE.md
│           ├── SQL_SUPABASE_SPECIALIST_GUIDE.md
│           ├── DOCUMENTATION_CONVENTION.md
│           └── VITAL_SYSTEM_SOURCE_OF_TRUTH.md
│
├── apps/                        ← ✅ Frontend applications (active code)
│   ├── vital-system/            ← Main application (source of truth)
│   ├── digital-health-startup/
│   ├── consulting/
│   ├── pharma/
│   └── payers/
│
├── packages/                    ← ✅ Shared packages (active code)
│   ├── protocol/                ← 🆕 Shared contract (Zod schemas)
│   ├── ui/
│   ├── sdk/
│   ├── config/
│   └── utils/
│
├── services/                    ← ✅ Backend services (active code)
│   └── ai-engine/               ← Python FastAPI + LangGraph (World-Class Architecture)
│       └── src/
│           ├── api/             ← Routes, middleware, schemas
│           ├── core/            ← Context management
│           ├── domain/          ← Business logic, services
│           ├── modules/         ← Translator, execution
│           ├── workers/         ← Celery async tasks
│           └── infrastructure/  ← LLM, database, cache
│
├── database/                    ← ✅ Production database files
│   └── policies/                ← RLS policies (8 SQL files)
├── logs/                        ← ✅ Runtime logs
├── node_modules/                ← ✅ Dependencies
├── README.md                    ← ✅ Platform entry point
└── [config files]               ← ✅ .env, .gitignore, railway.toml, etc.

✅ = Active/Essential (keep at root)
```

---

## 🎯 Key Principles

### Single Source of Truth
- **All Documentation**: `.claude/docs/` (645+ files)
- **All Agents**: `.claude/agents/` (14 agents)
- **All Rules**: `.claude/` root (CLAUDE.md, VITAL.md, EVIDENCE_BASED_RULES.md)

### Clean Separation
- **Claude Resources**: `.claude/` (config, agents, docs, rules)
- **Application Code**: `apps/`, `packages/`, `services/` (active development)
- **Infrastructure**: `database/`, `logs/`, config files

### Logical Organization
- **8 Categories**: strategy, platform, services, architecture, workflows, operations, testing, coordination
- **Clear Hierarchy**: Category → Subcategory → Documents
- **Easy Navigation**: README.md + INDEX.md in docs/

---

## 🔗 Quick Access

### For Everything Claude Code
```bash
cd .claude
cat README.md          # Command Center overview
cat docs/README.md     # Documentation overview
cat docs/INDEX.md      # Quick navigation
```

### For Agents
```bash
cd .claude/agents
ls -la                 # List all 14 agents
```

### For Documentation
```bash
cd .claude/docs
cat README.md          # Start here
cat INDEX.md           # Navigate by category/role/topic
```

### For Coordination
```bash
cd .claude/docs/coordination
cat AGENT_COORDINATION_GUIDE.md
```

---

## 📊 Documentation Statistics

**Total Files**: 645+ markdown files
**Categories**: 8 main categories
**Agents**: 14 production-ready agents
**Rules**: 3 core rule documents

---

## 🆕 What Changed (v6.0 - World-Class Architecture)

### Architecture Implementation Complete
- ✅ **Phase 1**: Protocol Package + RLS Policies + Translator Module
- ✅ **Phase 2**: Workers + API Routes + Middleware + Context
- ✅ **Phase 3**: Execution Module + Streaming + LLM Client
- ✅ **Phase 4**: Frontend Hooks + Components + Protocol Integration
- ✅ **Phase 5**: Integration Tests + Fixtures

### New Directories Added
```
packages/protocol/               ← Shared TypeScript/Zod schemas
database/policies/               ← RLS multi-tenant security
services/ai-engine/src/
├── api/middleware/             ← Auth, Tenant, Budget middleware
├── api/routes/                 ← Jobs, Health, Streaming endpoints
├── core/                       ← Request context management
├── domain/services/            ← Budget service, token tracking
├── modules/translator/         ← React Flow → LangGraph
├── modules/execution/          ← Workflow runner, SSE streaming
├── workers/tasks/              ← Celery async tasks
└── infrastructure/llm/         ← OpenAI/Anthropic clients
```

### Files Created
- **71+ new files** implementing world-class architecture
- **5 integration test files** for E2E testing
- **Makefile** with 30+ development commands

---

## What Changed (v4.0)

### Simplified Structure
- ✅ Merged `vital-expert-docs/` into `docs/`
- ✅ Single documentation location
- ✅ Cleaner category names
- ✅ Better navigation

### Before (v3.0)
```
.claude/
├── docs/              ← Agent coordination only
└── vital-expert-docs/ ← Platform documentation
```

### After (v4.0)
```
.claude/
└── docs/              ← EVERYTHING (645+ files)
    ├── strategy/
    ├── platform/
    ├── services/
    ├── architecture/
    ├── workflows/
    ├── operations/
    ├── testing/
    └── coordination/
```

---

**Next Steps**: See `.claude/docs/README.md` for complete documentation guide
