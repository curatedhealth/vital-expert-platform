# VITAL Cockpit - Documentation Index

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Production Ready

---

## 🎛️ Welcome to VITAL Cockpit

**VITAL Cockpit** is your command center for all platform documentation, guides, knowledge resources, and operations.

**Quick Navigation**:
- **📚 Documentation**: `vital-expert-docs/` (16 organized sections)
- **🔧 Operations**: `.vital-ops/` (migrations, scripts, DevOps tools)

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Documentation Structure](#documentation-structure)
3. [For AI Agents](#for-ai-agents)
4. [For Developers](#for-developers)
5. [Critical Files Reference](#critical-files-reference)
6. [Search by Topic](#search-by-topic)

---

## Quick Start

### 🚀 New to VITAL?
**Start Here**: [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md)

### 👨‍💻 Developer Onboarding
1. [`vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`](vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md)
2. [`vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`](vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md)
3. [`docs/technical/claude.md`](../docs/technical/claude.md) - Complete LLM routing & agent orchestration guide

### 🤖 AI Agent Quick Start
1. [`vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md)
2. [`vital-expert-docs/00-overview/dev-agents/README.md`](vital-expert-docs/00-overview/dev-agents/README.md)
3. [`vital-expert-docs/00-overview/dev-agents/QUICK_START_VISUAL_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/QUICK_START_VISUAL_GUIDE.md)

### 📊 Database Schema
**Master Reference**: [`vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md)

---

## Documentation Structure

```
.vital-docs/
│
├── INDEX.md                        ← YOU ARE HERE
├── QUICK_REFERENCE.md              ← Quick links for common tasks
├── README.md                       ← Overview & purpose
│
└── vital-expert-docs/              ← Comprehensive Documentation
    │
    ├── 00-overview/                ← START HERE
    │   ├── README_START_HERE.md              (New user entry point)
    │   ├── VITAL_EXPERT_SETUP_CHECKLIST.md   (Setup instructions)
    │   ├── COMMANDS_CHEATSHEET.md            (Common commands)
    │   ├── GOLD_STANDARD_INTEGRATION_GUIDE.md
    │   └── dev-agents/               ⭐ Development & Coordination Agents
    │       ├── AGENT_COORDINATION_GUIDE.md   (Master coordination guide)
    │       ├── README.md                     (Agent overview)
    │       ├── QUICK_START_VISUAL_GUIDE.md   (Visual workflows)
    │       └── [12 specialized agent files]
    │
    ├── 01-strategy/                ← Vision & Strategy
    │   ├── STRATEGIC_PLAN.md
    │   ├── GOLD_STANDARD_SCHEMA.md           (Database master plan)
    │   ├── COMPLETE_PERSONA_SCHEMA_REFERENCE.md
    │   ├── VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md
    │   ├── VITAL_BUSINESS_REQUIREMENTS.md
    │   ├── VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md
    │   ├── VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md
    │   └── VITAL_ROI_BUSINESS_CASE.md
    │
    ├── 02-brand-identity/          ← Brand & Design
    │   ├── brand-foundation/
    │   ├── messaging/
    │   └── naming-and-positioning/
    │
    ├── 03-product/                 ← Product Specs
    │   ├── VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md
    │   ├── VITAL_Ask_Expert_PRD.md
    │   ├── features/
    │   ├── ui-components/
    │   └── user-research/
    │
    ├── 04-services/                ← Service Documentation
    │   ├── README.md
    │   ├── ask-expert/     (20 files - Expert service)
    │   ├── ask-panel/      (22 files - Panel service)
    │   ├── ask-committee/  (Committee service)
    │   └── byoai-orchestration/
    │
    ├── 05-assets/                  ← ⭐ PLATFORM ASSETS
    │   ├── README.md                     (Asset overview)
    │   ├── vital-agents/     (User-facing VITAL agents - 36 files)
    │   ├── knowledge/        (Knowledge domains)
    │   ├── prompts/          (Prompt library)
    │   ├── tools/            (Agent tools)
    │   ├── skills/           (Agent skills)
    │   ├── workflows/        (Workflow patterns & templates)
    │   ├── jtbds/            (Jobs-to-Be-Done system)
    │   ├── personas/         (User personas - MERGED)
    │   ├── org-structure/    (Organizational structure)
    │   └── llms/             (LLM configurations)
    │
    ├── 06-architecture/            ← Technical Architecture
    │   ├── VITAL_BACKEND_ENHANCED_ARCHITECTURE.md
    │   ├── VITAL_Ask_Expert_ARD.md
    │   ├── system-design/
    │   ├── frontend/       (21 files)
    │   ├── backend/
    │   ├── data/           (11 files)
    │   ├── ai-ml/
    │   ├── infrastructure/
    │   ├── security/
    │   └── adrs/           (Architecture Decision Records)
    │
    ├── 07-integrations/            ← Integration Documentation
    │   └── (Placeholder for future integration docs)
    │
    ├── 08-implementation/          ← Implementation Guides
    │   ├── data-import/    (12 files)
    │   ├── deployment-guides/  (6 files)
    │   ├── development-guides/
    │   └── integration-guides/
    │
    ├── 09-deployment/              ← Deployment
    │   └── (Placeholder for deployment-specific docs)
    │
    ├── 10-api/                     ← API Documentation
    │   ├── API_DOCUMENTATION.md
    │   ├── API_TESTING_RESULTS.md
    │   ├── BACKEND_API_IMPLEMENTATION_SUMMARY.md
    │   ├── DATA_VIEW_ENDPOINTS.md
    │   ├── api-reference/
    │   ├── api-guides/
    │   └── service-apis/
    │
    ├── 11-data-schema/             ← DATABASE SCHEMA (CRITICAL)
    │   ├── README.md                     (Schema overview)
    │   ├── GOLD_STANDARD_SCHEMA.md       (MASTER REFERENCE)
    │   ├── NAMING_CONVENTIONS.md
    │   ├── ROLE_PERSONA_INHERITANCE_PATTERN.md
    │   ├── EXECUTION_GUIDE.md
    │   │
    │   ├── 01-core-schema/         (Core tables)
    │   ├── 02-role-junctions/      (Role mappings)
    │   ├── 03-persona-junctions/   (Persona mappings)
    │   ├── 04-views/               (Database views)
    │   ├── 05-seeds/               (Seed data templates)
    │   ├── 06-migrations/          (Migration scripts)
    │   └── 07-utilities/           (Utilities & verification)
    │
    ├── 12-testing/                 ← Testing Documentation
    │   ├── TESTING_FINAL_MILESTONE.md
    │   ├── TESTING_JOURNEY_FINAL.md
    │   ├── POSTMAN_TESTING_GUIDE.md
    │   ├── testing-strategy/
    │   ├── test-plans/
    │   └── quality-assurance/
    │
    ├── 13-operations/              ← Operations
    │   ├── monitoring/
    │   ├── maintenance/
    │   └── scaling/
    │
    ├── 14-compliance/              ← Compliance
    │   ├── regulatory-requirements/
    │   └── security-compliance/
    │
    ├── 15-training/                ← Training Materials
    │   ├── developer-onboarding/
    │   └── user-training/
    │
    ├── 16-releases/                ← Release Management
    │   ├── release-notes/
    │   └── roadmap/
    │
    └── _archive/                   ← Archived/Obsolete Files
        ├── old-implementations/
        └── root-sql-files/
```

---

## For AI Agents

### 🎯 Essential Files for AI Agents

#### Agent Coordination & Guidelines
1. **[`agents/AGENT_COORDINATION_GUIDE.md`](agents/AGENT_COORDINATION_GUIDE.md)**
   - **Purpose**: Master coordination guide for all AI agents
   - **When to use**: Before starting any task
   - **Contains**: Agent roles, handoff protocols, file organization rules

2. **[`agents/README.md`](agents/README.md)**
   - **Purpose**: Agent team structure overview
   - **When to use**: Understanding team composition
   - **Contains**: 12 specialized agents, responsibilities, when to delegate

3. **[`agents/QUICK_START_VISUAL_GUIDE.md`](agents/QUICK_START_VISUAL_GUIDE.md)**
   - **Purpose**: Visual workflow guide
   - **When to use**: Understanding execution patterns
   - **Contains**: Flowcharts, decision trees, example workflows

#### Database Work
4. **[`agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](agents/SQL_SUPABASE_SPECIALIST_GUIDE.md)**
   - **Purpose**: Database agent guidelines
   - **When to use**: Database schema work, migrations, queries
   - **Contains**: Schema patterns, migration templates, best practices

5. **[`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)**
   - **Purpose**: Master database schema reference
   - **When to use**: Any database-related work
   - **Contains**: Complete schema, relationships, golden rules

#### Specialized Agent Guides
- **Strategy**: [`agents/strategy-vision-architect.md`](agents/strategy-vision-architect.md)
- **Architecture**: [`agents/system-architecture-architect.md`](agents/system-architecture-architect.md)
- **Frontend**: [`agents/frontend-ui-architect.md`](agents/frontend-ui-architect.md)
- **Backend**: [`agents/python-ai-ml-engineer.md`](agents/python-ai-ml-engineer.md)
- **Data**: [`agents/data-architecture-expert.md`](agents/data-architecture-expert.md)
- **SQL**: [`agents/sql-supabase-specialist.md`](agents/sql-supabase-specialist.md)
- **LangGraph**: [`agents/langgraph-workflow-translator.md`](agents/langgraph-workflow-translator.md)
- **Analytics**: [`agents/business-analytics-strategist.md`](agents/business-analytics-strategist.md)
- **Documentation**: [`agents/documentation-qa-lead.md`](agents/documentation-qa-lead.md)
- **PRD**: [`agents/prd-architect.md`](agents/prd-architect.md)

### 📋 Agent Task Checklist

Before starting any task:
1. ✅ Read [`agents/AGENT_COORDINATION_GUIDE.md`](agents/AGENT_COORDINATION_GUIDE.md)
2. ✅ Check if task requires delegation to specialized agent
3. ✅ Review relevant section in [`vital-expert-docs/`](vital-expert-docs/)
4. ✅ Follow file organization rules (Golden Rules)
5. ✅ Update documentation after changes

### 🔍 Quick Agent Decision Tree

```
Start
  │
  ├─ Strategy/Vision? → strategy-vision-architect.md
  │
  ├─ Database Schema? → sql-supabase-specialist.md
  │                     + 10-data-schema/GOLD_STANDARD_SCHEMA.md
  │
  ├─ Frontend/UI? → frontend-ui-architect.md
  │                 + 05-architecture/frontend/
  │
  ├─ Backend/API? → python-ai-ml-engineer.md
  │                 + 05-architecture/backend/
  │
  ├─ Data Pipeline? → data-architecture-expert.md
  │                   + 05-architecture/data/
  │
  ├─ Workflows? → langgraph-workflow-translator.md
  │               + 06-workflows/
  │
  ├─ Documentation? → documentation-qa-lead.md
  │
  └─ Multi-service? → ask-committee/panel/expert service agents
```

---

## For Developers

### 🛠️ Development Quick Links

#### Setup & Environment
- **Setup Checklist**: [`vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`](vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md)
- **Commands Cheatsheet**: [`vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`](vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md)
- **Claude AI Guide**: [`../docs/technical/claude.md`](../docs/technical/claude.md)

#### Architecture
- **Backend Architecture**: [`vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- **Frontend Architecture**: [`vital-expert-docs/05-architecture/frontend/`](vital-expert-docs/05-architecture/frontend/)
- **System Design**: [`vital-expert-docs/05-architecture/system-design/`](vital-expert-docs/05-architecture/system-design/)

#### Database
- **Schema Master**: [`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)
- **Naming Conventions**: [`vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md`](vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md)
- **Execution Guide**: [`vital-expert-docs/10-data-schema/EXECUTION_GUIDE.md`](vital-expert-docs/10-data-schema/EXECUTION_GUIDE.md)
- **JTBD Schema**: [`vital-expert-docs/10-data-schema/jtbds/README.md`](vital-expert-docs/10-data-schema/jtbds/README.md)

#### Services
- **Ask Expert**: [`vital-expert-docs/04-services/ask-expert/`](vital-expert-docs/04-services/ask-expert/)
- **Ask Panel**: [`vital-expert-docs/04-services/ask-panel/`](vital-expert-docs/04-services/ask-panel/)
- **Ask Committee**: [`vital-expert-docs/04-services/ask-committee/`](vital-expert-docs/04-services/ask-committee/)

#### API
- **API Documentation**: [`vital-expert-docs/09-api/API_DOCUMENTATION.md`](vital-expert-docs/09-api/API_DOCUMENTATION.md)
- **API Testing**: [`vital-expert-docs/09-api/API_TESTING_RESULTS.md`](vital-expert-docs/09-api/API_TESTING_RESULTS.md)
- **Data View Endpoints**: [`vital-expert-docs/09-api/DATA_VIEW_ENDPOINTS.md`](vital-expert-docs/09-api/DATA_VIEW_ENDPOINTS.md)

#### Testing
- **Testing Milestone**: [`vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md`](vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md)
- **Postman Guide**: [`vital-expert-docs/11-testing/POSTMAN_TESTING_GUIDE.md`](vital-expert-docs/11-testing/POSTMAN_TESTING_GUIDE.md)

#### Deployment
- **Deployment Guides**: [`vital-expert-docs/07-implementation/deployment-guides/`](vital-expert-docs/07-implementation/deployment-guides/)

---

## Critical Files Reference

### 🔴 Must-Read Files (Priority 1)

| File | Purpose | Audience |
|------|---------|----------|
| [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md) | Entry point for new users | Everyone |
| [`agents/AGENT_COORDINATION_GUIDE.md`](agents/AGENT_COORDINATION_GUIDE.md) | Agent coordination master guide | AI Agents |
| [`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md) | Database schema master reference | Developers, AI Agents |
| [`vital-expert-docs/01-strategy/STRATEGIC_PLAN.md`](vital-expert-docs/01-strategy/STRATEGIC_PLAN.md) | Platform strategy & vision | Everyone |
| [`../docs/technical/claude.md`](../docs/technical/claude.md) | LLM routing & agent orchestration | Developers, AI Agents |

### 🟡 Important Files (Priority 2)

| File | Purpose | Audience |
|------|---------|----------|
| [`vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md) | Backend architecture | Backend Devs |
| [`vital-expert-docs/10-data-schema/jtbds/README.md`](vital-expert-docs/10-data-schema/jtbds/README.md) | JTBD schema documentation | Developers, AI Agents |
| [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md) | Workflow implementation | Developers |
| [`vital-expert-docs/09-api/API_DOCUMENTATION.md`](vital-expert-docs/09-api/API_DOCUMENTATION.md) | API reference | Developers |
| [`agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](agents/SQL_SUPABASE_SPECIALIST_GUIDE.md) | Database agent guide | AI Agents |

### 🟢 Reference Files (Priority 3)

| File | Purpose | Audience |
|------|---------|----------|
| [`vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md`](vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md) | Database naming standards | Developers, AI Agents |
| [`vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`](vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md) | Common commands | Developers |
| [`vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md`](vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md) | Testing strategy | QA, Developers |
| [`vital-expert-docs/01-strategy/VITAL_ROI_BUSINESS_CASE.md`](vital-expert-docs/01-strategy/VITAL_ROI_BUSINESS_CASE.md) | Business case & ROI | Product, Business |

---

## Search by Topic

### 🗂️ Topic Index

#### Agent Orchestration & LLM Routing
- **Claude LLM Routing**: [`vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md)
- **Domain-Based LLM Routing**: [`vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/DOMAIN_BASED_LLM_ROUTING.md)
- **Agent Implementation**: [`vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md)
- **Agent Coordination**: [`vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md)
- **Agent Specs**: [`vital-expert-docs/00-overview/dev-agents/`](vital-expert-docs/00-overview/dev-agents/) (20 agents)
- **Service Orchestration**: [`vital-expert-docs/04-services/`](vital-expert-docs/04-services/)

#### Database Schema
- **Master Reference**: [`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)
- **JTBD Schema**: [`vital-expert-docs/10-data-schema/jtbds/README.md`](vital-expert-docs/10-data-schema/jtbds/README.md)
- **Role-Persona Pattern**: [`vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md`](vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md)
- **Naming Conventions**: [`vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md`](vital-expert-docs/10-data-schema/NAMING_CONVENTIONS.md)
- **Migrations**: [`vital-expert-docs/10-data-schema/06-migrations/`](vital-expert-docs/10-data-schema/06-migrations/)
- **Seed Data**: [`vital-expert-docs/10-data-schema/05-seeds/`](vital-expert-docs/10-data-schema/05-seeds/)

#### Frontend Development
- **Architecture**: [`vital-expert-docs/05-architecture/frontend/`](vital-expert-docs/05-architecture/frontend/)
- **UI Components**: [`vital-expert-docs/03-product/ui-components/`](vital-expert-docs/03-product/ui-components/)
- **Agent Guide**: [`agents/frontend-ui-architect.md`](agents/frontend-ui-architect.md)

#### Backend Development
- **Architecture**: [`vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- **API Docs**: [`vital-expert-docs/09-api/`](vital-expert-docs/09-api/)
- **Agent Guide**: [`agents/python-ai-ml-engineer.md`](agents/python-ai-ml-engineer.md)

#### Workflows
- **Complete Summary**: [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)
- **Quick Start**: [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md)
- **Workflow Library**: [`vital-expert-docs/06-workflows/workflow-library/`](vital-expert-docs/06-workflows/workflow-library/)
- **Agent Guide**: [`agents/langgraph-workflow-translator.md`](agents/langgraph-workflow-translator.md)

#### Personas & JTBDs
- **Persona Strategy**: [`vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md`](vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md)
- **Persona Schema**: [`vital-expert-docs/01-strategy/COMPLETE_PERSONA_SCHEMA_REFERENCE.md`](vital-expert-docs/01-strategy/COMPLETE_PERSONA_SCHEMA_REFERENCE.md)
- **JTBD Implementation**: [`vital-expert-docs/10-data-schema/jtbds/JTBD_IMPLEMENTATION_SUMMARY.md`](vital-expert-docs/10-data-schema/jtbds/JTBD_IMPLEMENTATION_SUMMARY.md)
- **MECE Framework**: [`vital-expert-docs/10-data-schema/MECE_PERSONA_FRAMEWORK.md`](vital-expert-docs/10-data-schema/MECE_PERSONA_FRAMEWORK.md)

#### Testing & QA
- **Testing Milestone**: [`vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md`](vital-expert-docs/11-testing/TESTING_FINAL_MILESTONE.md)
- **Postman Guide**: [`vital-expert-docs/11-testing/POSTMAN_TESTING_GUIDE.md`](vital-expert-docs/11-testing/POSTMAN_TESTING_GUIDE.md)
- **Test Plans**: [`vital-expert-docs/11-testing/test-plans/`](vital-expert-docs/11-testing/test-plans/)

#### Deployment & Operations
- **Deployment Overview**: [`vital-expert-docs/09-deployment/README.md`](vital-expert-docs/09-deployment/README.md)
- **Railway Deployment**: [`vital-expert-docs/09-deployment/railway/`](vital-expert-docs/09-deployment/railway/)
- **AI Engine Deployment**: [`vital-expert-docs/09-deployment/AI_ENGINE_DEPLOYMENT.md`](vital-expert-docs/09-deployment/AI_ENGINE_DEPLOYMENT.md)
- **Monitoring**: [`vital-expert-docs/13-operations/monitoring/`](vital-expert-docs/13-operations/monitoring/)
- **LangFuse Setup**: [`vital-expert-docs/13-operations/monitoring/LANGFUSE_SETUP.md`](vital-expert-docs/13-operations/monitoring/LANGFUSE_SETUP.md)
- **Health Checks**: [`vital-expert-docs/13-operations/monitoring/HEALTH_CHECKS.md`](vital-expert-docs/13-operations/monitoring/HEALTH_CHECKS.md)
- **Current Release**: [`vital-expert-docs/16-releases/current-release/`](vital-expert-docs/16-releases/current-release/)

#### Business & Strategy
- **Strategic Plan**: [`vital-expert-docs/01-strategy/STRATEGIC_PLAN.md`](vital-expert-docs/01-strategy/STRATEGIC_PLAN.md)
- **Vision & Strategy**: [`vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md`](vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md)
- **Business Requirements**: [`vital-expert-docs/01-strategy/VITAL_BUSINESS_REQUIREMENTS.md`](vital-expert-docs/01-strategy/VITAL_BUSINESS_REQUIREMENTS.md)
- **ROI & Business Case**: [`vital-expert-docs/01-strategy/VITAL_ROI_BUSINESS_CASE.md`](vital-expert-docs/01-strategy/VITAL_ROI_BUSINESS_CASE.md)

---

## Documentation Standards

### File Naming Conventions
- **Use UPPERCASE for major documents**: `README.md`, `GOLD_STANDARD_SCHEMA.md`
- **Use snake_case for agent files**: `sql-supabase-specialist.md`
- **Use descriptive names**: Not `doc1.md`, but `TESTING_MILESTONE.md`
- **Version in filename**: `v2.0` suffix if needed

### File Organization Rules
1. **Core docs** → `vital-expert-docs/00-overview/`
2. **Strategy** → `vital-expert-docs/01-strategy/`
3. **Database** → `vital-expert-docs/10-data-schema/`
4. **Agents** → `agents/`
5. **Archive old files** → `vital-expert-docs/_archive/`

### Documentation Headers
All documentation files should include:
```markdown
# Document Title

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

---

## Getting Help

### 🆘 I can't find...

#### Database Schema Information
→ [`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)

#### Agent Coordination Rules
→ [`agents/AGENT_COORDINATION_GUIDE.md`](agents/AGENT_COORDINATION_GUIDE.md)

#### API Endpoints
→ [`vital-expert-docs/09-api/API_DOCUMENTATION.md`](vital-expert-docs/09-api/API_DOCUMENTATION.md)

#### Setup Instructions
→ [`vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`](vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md)

#### Workflow Implementation
→ [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)

### 📧 Still Can't Find It?

1. Search this INDEX.md file
2. Check [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md)
3. Browse [`vital-expert-docs/00-overview/`](vital-expert-docs/00-overview/)
4. Ask the Documentation QA Lead agent

---

## Maintenance

### Last Updated
- **Index Structure**: November 21, 2024 - Documentation reorganization complete
- **JTBD Schema**: November 21, 2024 (v2.0 - Complete normalization)
- **Agent Guides**: November 2024
- **Deployment Docs**: November 21, 2024
- **Monitoring Docs**: November 21, 2024

### Change Log
- **2024-11-21**: Completed major documentation reorganization
- **2024-11-21**: Added deployment documentation (Railway, Vercel)
- **2024-11-21**: Added monitoring documentation (LangFuse, Health Checks)
- **2024-11-21**: Added current release documentation
- **2024-11-21**: Removed 40+ obsolete files
- **2024-11-21**: Created comprehensive INDEX.md
- **2024-11-21**: Completed JTBD normalization (6 phases)
- **2024-11**: Completed hierarchical workflows
- **2024-11**: Completed agent coordination guides

### TODO
- [ ] Create visual directory tree diagram
- [ ] Add search functionality
- [ ] Create topic-based tutorials
- [ ] Add video walkthroughs

---

**Navigation**: [Top](#vital-platform-documentation-index) | [Quick Start](#quick-start) | [AI Agents](#for-ai-agents) | [Developers](#for-developers)

