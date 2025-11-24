# VITAL Cockpit - Platform Documentation Hub

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Status**: Production Ready

---

## 📚 Quick Navigation

### 🔥 START HERE
**📖 Complete Documentation Index**: [`INDEX.md`](INDEX.md) ← **Master navigation for all documentation**

**🔗 Quick Links**:
- **For AI Agents**: [`vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_IMPLEMENTATION_GUIDE.md)
- **For Developers**: [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md)
- **LLM Routing Guide**: [`vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md`](vital-expert-docs/06-architecture/ai-ml/CLAUDE_LLM_ROUTING.md)
- **Operations & Scripts**: [`.vital-ops/README.md`](.vital-ops/README.md)

---

## Purpose

The **VITAL Cockpit** (`.vital-cockpit/`) is the central command center containing:
- **Documentation Hub**: All guides, references, and knowledge base (`vital-expert-docs/`)
- **Operations Center**: DevOps tools, scripts, and migrations (`.vital-ops/`)

**For complete navigation and file locations**, see **[`INDEX.md`](INDEX.md)**.

---

## Directory Structure

### 📂 Top-Level Organization

```
.vital-docs/
├── INDEX.md                    ← 🔥 MASTER INDEX (START HERE)
├── README.md                   ← This file
├── QUICK_REFERENCE.md          ← Quick links for common tasks
│
├── agents/                     ← AI Agent Specifications
│   ├── AGENT_COORDINATION_GUIDE.md    (Master coordination guide)
│   ├── README.md                      (Agent overview)
│   ├── QUICK_START_VISUAL_GUIDE.md    (Visual workflows)
│   ├── SQL_SUPABASE_SPECIALIST_GUIDE.md
│   └── [12 specialized agent files]
│
└── vital-expert-docs/          ← Comprehensive Documentation
    ├── 00-overview/            ← Start here for new users
    ├── 01-strategy/            ← Vision, strategy, business
    ├── 02-brand-identity/      ← Brand & design
    ├── 03-product/             ← Product specs
    ├── 04-services/            ← Service docs (Ask Expert, Panel, etc.)
    ├── 05-architecture/        ← Technical architecture
    ├── 06-workflows/           ← Workflow implementation
    ├── 07-implementation/      ← Implementation guides
    ├── 08-agents/              ← Agent documentation (36 files)
    ├── 09-api/                 ← API documentation
    ├── 10-data-schema/         ← ⭐ DATABASE SCHEMA (CRITICAL)
    ├── 11-testing/             ← Testing & QA
    ├── 12-operations/          ← Operations
    ├── 13-compliance/          ← Compliance
    ├── 14-training/            ← Training materials
    ├── 15-releases/            ← Release management
    └── _archive/               ← Archived/obsolete files
```

**For detailed structure with all subdirectories**, see [`INDEX.md`](INDEX.md).

---

## Quick Start

### 🤖 For AI Agents
1. Read [`vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md)
2. Check [`../docs/technical/agent.md`](../docs/technical/agent.md) for guidelines
3. Review [`INDEX.md`](INDEX.md) for complete file locations
4. Find your specialized agent guide in [`vital-expert-docs/00-overview/dev-agents/`](vital-expert-docs/00-overview/dev-agents/)

### 👨‍💻 For Developers
1. Read [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md)
2. Follow [`vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`](vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md)
3. Check [`vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`](vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md)
4. Review [`../docs/technical/claude.md`](../docs/technical/claude.md) for LLM routing

### 📊 For Database Work
1. **Master Reference**: [`vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md)
2. **JTBD Schema**: [`vital-expert-docs/05-assets/jtbds/README.md`](vital-expert-docs/05-assets/jtbds/README.md)
3. **Conventions**: [`vital-expert-docs/11-data-schema/NAMING_CONVENTIONS.md`](vital-expert-docs/11-data-schema/NAMING_CONVENTIONS.md)
4. **Agent Guide**: [`vital-expert-docs/00-overview/dev-agents/SQL_SUPABASE_SPECIALIST_GUIDE.md`](vital-expert-docs/00-overview/dev-agents/SQL_SUPABASE_SPECIALIST_GUIDE.md)

---

## Key Documentation Areas

### 🎯 Strategy & Vision
- **Strategic Plan**: [`vital-expert-docs/01-strategy/STRATEGIC_PLAN.md`](vital-expert-docs/01-strategy/STRATEGIC_PLAN.md)
- **Vision**: [`vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md`](vital-expert-docs/01-strategy/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md)
- **Business Requirements**: [`vital-expert-docs/01-strategy/VITAL_BUSINESS_REQUIREMENTS.md`](vital-expert-docs/01-strategy/VITAL_BUSINESS_REQUIREMENTS.md)

### 🏗️ Architecture
- **Backend**: [`vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md`](vital-expert-docs/05-architecture/VITAL_BACKEND_ENHANCED_ARCHITECTURE.md)
- **Frontend**: [`vital-expert-docs/05-architecture/frontend/`](vital-expert-docs/05-architecture/frontend/)
- **Data**: [`vital-expert-docs/05-architecture/data/`](vital-expert-docs/05-architecture/data/)

### 🗄️ Database Schema (CRITICAL)
- **Master Schema**: [`vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md`](vital-expert-docs/10-data-schema/GOLD_STANDARD_SCHEMA.md)
- **JTBD System**: [`vital-expert-docs/10-data-schema/jtbds/README.md`](vital-expert-docs/10-data-schema/jtbds/README.md)
- **Role-Persona Pattern**: [`vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md`](vital-expert-docs/10-data-schema/ROLE_PERSONA_INHERITANCE_PATTERN.md)

### 🔄 Workflows
- **Complete Summary**: [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)
- **Quick Start**: [`vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md`](vital-expert-docs/06-workflows/HIERARCHICAL_WORKFLOW_QUICKSTART.md)

### 🚀 Services
- **Ask Expert**: [`vital-expert-docs/04-services/ask-expert/`](vital-expert-docs/04-services/ask-expert/)
- **Ask Panel**: [`vital-expert-docs/04-services/ask-panel/`](vital-expert-docs/04-services/ask-panel/)
- **Ask Committee**: [`vital-expert-docs/04-services/ask-committee/`](vital-expert-docs/04-services/ask-committee/)

### 🔌 API
- **API Documentation**: [`vital-expert-docs/09-api/API_DOCUMENTATION.md`](vital-expert-docs/09-api/API_DOCUMENTATION.md)
- **Data View Endpoints**: [`vital-expert-docs/09-api/DATA_VIEW_ENDPOINTS.md`](vital-expert-docs/09-api/DATA_VIEW_ENDPOINTS.md)

---

## Document Conventions

### File Naming
- **Major documents**: UPPERCASE (e.g., `README.md`, `GOLD_STANDARD_SCHEMA.md`)
- **Agent files**: snake-case (e.g., `sql-supabase-specialist.md`)
- **Descriptive names**: Use clear, descriptive names

### Documentation Headers
All documentation files should include:
```markdown
# Title

**Last Updated**: YYYY-MM-DD
**Version**: X.X
**Status**: Draft | In Progress | Production Ready
**Audience**: AI Agents | Developers | Everyone
```

### Organization Rules
- Place files in correct numbered directories
- Archive obsolete files to `_archive/`
- Link between related documents
- Update INDEX.md when adding major files

---

## Search by Topic

**See [`INDEX.md`](INDEX.md) for complete topic index including**:
- Agent Orchestration & LLM Routing
- Database Schema
- Frontend Development
- Backend Development
- Workflows
- Personas & JTBDs
- Testing & QA
- Deployment & Operations
- Business & Strategy

---

## Getting Help

### Can't find what you need?
1. Check [`INDEX.md`](INDEX.md) - Master index with all file locations
2. Check [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) - Quick links
3. Browse [`vital-expert-docs/00-overview/`](vital-expert-docs/00-overview/) - Overview docs
4. See [`agents/AGENT_COORDINATION_GUIDE.md`](agents/AGENT_COORDINATION_GUIDE.md) - Agent coordination

### For AI Agents specifically?
→ [`../docs/technical/agent.md`](../docs/technical/agent.md) - Complete agent implementation guide

### For Developers?
→ [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md)

---

## Maintenance

**Last Updated**: November 21, 2024  
**Maintained By**: VITAL Platform Team + AI Agents

### Recent Updates
- **2024-11-21**: Created comprehensive INDEX.md
- **2024-11-21**: Added agent.md implementation guide
- **2024-11-21**: Completed JTBD normalization (v2.0)
- **2024-11**: Completed hierarchical workflows
- **2024-11**: Completed agent coordination guides

### Archive Policy
- Obsolete docs → `vital-expert-docs/_archive/`
- Old implementations → `vital-expert-docs/_archive/old-implementations/`
- Superseded SQL → `vital-expert-docs/_archive/root-sql-files/`

---

**🔗 Key Links**: [`INDEX.md`](INDEX.md) | [`QUICK_REFERENCE.md`](QUICK_REFERENCE.md) | [`agents/README.md`](agents/README.md) | [`vital-expert-docs/00-overview/README_START_HERE.md`](vital-expert-docs/00-overview/README_START_HERE.md)
