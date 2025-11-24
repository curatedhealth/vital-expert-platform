# VITAL Platform Documentation

**Version**: 1.0
**Last Updated**: November 23, 2025
**Purpose**: Single source of truth for all VITAL Platform documentation

---

## 📂 Documentation Structure

```
.claude/docs/                    ← SINGLE SOURCE OF TRUTH
│
├── README.md                    ← This file
├── INDEX.md                     ← Quick navigation index
│
├── strategy/                    ← Vision, Strategy, Business
│   ├── vision/                  ← Platform vision documents
│   ├── prd/                     ← Product Requirements Documents
│   ├── ard/                     ← Architecture Requirements Documents
│   ├── business/                ← Business requirements
│   └── roadmap/                 ← Product roadmap
│
├── platform/                    ← Platform Assets
│   ├── agents/                  ← Agent definitions & specifications
│   ├── personas/                ← User personas
│   ├── prompts/                 ← Prompt library
│   ├── workflows/               ← Workflow templates
│   ├── jtbds/                   ← Jobs-to-be-done
│   ├── knowledge-domains/       ← Knowledge domain definitions
│   ├── capabilities/            ← Platform capabilities
│   └── skills/                  ← Skill definitions
│
├── services/                    ← Service Documentation
│   ├── ask-expert/              ← Ask Expert service (1:1 consultation)
│   ├── ask-panel/               ← Ask Panel service (multi-expert)
│   ├── ask-committee/           ← Ask Committee service (deliberation)
│   └── byoai-orchestration/     ← BYOAI custom workflows
│
├── architecture/                ← Technical Architecture
│   ├── data-schema/             ← Database schemas & migrations
│   ├── architecture/            ← System architecture documents
│   ├── api/                     ← API specifications
│   ├── backend/                 ← Backend architecture
│   ├── frontend/                ← Frontend architecture
│   ├── infrastructure/          ← Infrastructure as code
│   └── rag-pipeline/            ← RAG pipeline design
│
├── workflows/                   ← Workflow Guides
│   └── WORKFLOW-DESIGNER-GUIDE.md
│
├── operations/                  ← Operations & DevOps
│   ├── deployment/              ← Deployment guides
│   ├── monitoring/              ← Monitoring setup
│   ├── maintenance/             ← Maintenance procedures
│   ├── runbooks/                ← Operational runbooks
│   └── scripts/                 ← Operational scripts
│
├── testing/                     ← Testing Documentation
│   ├── testing/                 ← Test strategies
│   ├── compliance/              ← Compliance testing
│   ├── performance/             ← Performance testing
│   └── security/                ← Security testing
│
└── coordination/                ← Agent Coordination
    ├── AGENT_COORDINATION_GUIDE.md
    ├── AGENT_IMPLEMENTATION_GUIDE.md
    ├── AGENTS_DOCUMENTATION_GUIDE.md
    ├── QUICK_START_VISUAL_GUIDE.md
    ├── RECOMMENDED_AGENT_STRUCTURE.md
    ├── SQL_SUPABASE_SPECIALIST_GUIDE.md
    ├── DOCUMENTATION_CONVENTION.md
    └── VITAL_SYSTEM_SOURCE_OF_TRUTH.md
```

---

## 🎯 Quick Navigation

### For Product & Strategy
- **Vision**: `strategy/vision/`
- **Product Requirements**: `strategy/prd/`
- **Architecture Requirements**: `strategy/ard/`
- **Roadmap**: `strategy/roadmap/`

### For Platform Assets
- **Agent Definitions**: `platform/agents/`
- **User Personas**: `platform/personas/`
- **Prompt Library**: `platform/prompts/`
- **Workflow Templates**: `platform/workflows/`

### For Services
- **Ask Expert**: `services/ask-expert/`
- **Ask Panel**: `services/ask-panel/`
- **BYOAI Orchestration**: `services/byoai-orchestration/`

### For Architecture
- **Database Schemas**: `architecture/data-schema/`
- **System Architecture**: `architecture/architecture/`
- **API Specs**: `architecture/api/`
- **Frontend/Backend**: `architecture/frontend/`, `architecture/backend/`

### For Operations
- **Deployment**: `operations/deployment/`
- **Monitoring**: `operations/monitoring/`
- **Runbooks**: `operations/runbooks/`

### For Testing
- **Test Strategies**: `testing/testing/`
- **Compliance**: `testing/compliance/`
- **Performance**: `testing/performance/`

### For Agent Coordination
- **Coordination Guide**: `coordination/AGENT_COORDINATION_GUIDE.md`
- **Implementation Guide**: `coordination/AGENT_IMPLEMENTATION_GUIDE.md`
- **Agent Structure**: `coordination/RECOMMENDED_AGENT_STRUCTURE.md`

---

## 📊 Documentation Statistics

**Total Files**: 645+ markdown files
**Categories**: 8 main categories
**Subcategories**: 30+ organized folders

---

## 🔍 Finding Documentation

### By Category
Browse the directory structure above to find documentation by category.

### By Search
Use grep to search across all documentation:
```bash
grep -r "search term" .claude/docs/
```

### By Index
See `INDEX.md` for a comprehensive navigation index.

---

## 📝 Documentation Standards

All documentation follows standards defined in:
- `coordination/DOCUMENTATION_CONVENTION.md` - Naming conventions
- `coordination/AGENTS_DOCUMENTATION_GUIDE.md` - Documentation best practices

---

## 🤝 Contributing

When adding new documentation:

1. **Choose the right category** - Place docs in the appropriate folder
2. **Follow naming conventions** - Use UPPERCASE for main docs
3. **Update INDEX.md** - Add your doc to the navigation index
4. **Cross-reference** - Link related documents
5. **Keep it organized** - One topic per document

---

## 🚀 Quick Start Guides

- **Agent Coordination**: `coordination/QUICK_START_VISUAL_GUIDE.md`
- **SQL/Supabase**: `coordination/SQL_SUPABASE_SPECIALIST_GUIDE.md`
- **Workflow Designer**: `workflows/WORKFLOW-DESIGNER-GUIDE.md`

---

**This is the single source of truth for all VITAL Platform documentation.**

All Claude Code agents have access to this documentation and use it to provide context-aware assistance.
