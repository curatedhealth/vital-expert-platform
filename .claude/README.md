# Claude Code Command Center

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Central hub for all Claude Code configuration, agents, and VITAL Platform documentation

---

## 🎯 Quick Start

This directory contains everything Claude Code needs to assist with the VITAL Platform:

- **Agents** (`./agents/`) - 14 production-ready specialized agents
- **Documentation** (`./docs/`) - Complete VITAL Platform documentation (645+ files)
- **Rules** (`CLAUDE.md`, `VITAL.md`) - Operational rules and standards
- **Configuration** (`settings.local.json`) - Claude Code settings

**Start Here**: Read `STRUCTURE.md` for complete directory structure or `docs/INDEX.md` for documentation navigation

---

## 📂 Directory Structure

```
.claude/
├── README.md                     ← This file (v1.0.0)
├── STRUCTURE.md                  ← Directory structure (v4.0)
├── NAMING_CONVENTION.md          ← Naming & versioning guide (v1.0.0)
├── STANDARDIZATION_COMPLETE.md   ← Standardization summary (v1.0.0)
├── DOCUMENTATION_GOVERNANCE_PLAN.md ← Governance & quality system (v1.0.0)
├── AGENT_QUICK_START.md          ← Agent onboarding checklist (v1.0.0)
├── CATALOGUE.md                  ← Complete catalog
├── INDEX.md                      ← Master index (deprecated - use docs/INDEX.md)
├── MASTER_DOCUMENTATION_INDEX.md ← Legacy index (deprecated)
├── CONSOLIDATION_COMPLETE.md     ← Migration history
│
├── CLAUDE.md                     ← Claude operational rules
├── VITAL.md                      ← VITAL Platform standards
├── EVIDENCE_BASED_RULES.md       ← Evidence-based operation policy
├── settings.local.json           ← Claude Code settings
│
├── agents/                       ← 14 Specialized Agents
│   ├── Service Agents (3)
│   │   ├── ask-expert-service-agent.md
│   │   ├── ask-panel-service-agent.md
│   │   └── byoai-orchestration-service-agent.md
│   │
│   └── Platform Agents (11)
│       ├── business-analytics-strategist.md
│       ├── data-architecture-expert.md
│       ├── documentation-qa-lead.md
│       ├── frontend-ui-architect.md
│       ├── implementation-compliance-qa-agent.md
│       ├── langgraph-workflow-translator.md
│       ├── prd-architect.md
│       ├── python-ai-ml-engineer.md
│       ├── sql-supabase-specialist.md
│       ├── strategy-vision-architect.md
│       └── system-architecture-architect.md
│
└── docs/                         ← Documentation (645+ files)
    ├── README.md                 ← Documentation overview (START HERE)
    ├── INDEX.md                  ← Quick navigation index
    ├── strategy/                 ← Vision, PRD, ARD, roadmap
    ├── platform/                 ← Agents, personas, prompts, workflows
    ├── services/                 ← Service documentation
    ├── architecture/             ← Technical architecture
    ├── workflows/                ← Workflow guides
    ├── operations/               ← Operations & DevOps
    ├── testing/                  ← Testing documentation
    └── coordination/             ← Agent coordination guides
```

---

## 🤖 Agents

All 14 agents have:
- ✅ Proper YAML frontmatter (name, description, model, tools, color)
- ✅ Enhanced descriptions based on coordination guide
- ✅ Full tool access (`tools: ["*"]`)
- ✅ Sonnet model specification
- ✅ Clear collaboration protocols

**Invoke agents using:** `Task` tool with `subagent_type="agent-name"`

**Example**:
```typescript
Task({
  subagent_type: "data-architecture-expert",
  prompt: "Design schema for new feature",
  description: "Schema design"
})
```

---

## 📖 Documentation

### Core Rules & Standards
- **CLAUDE.md** - How Claude Code should operate
- **VITAL.md** - VITAL Platform standards and conventions
- **EVIDENCE_BASED_RULES.md** - Evidence-based operation requirements
- **NAMING_CONVENTION.md** - File naming & versioning standards

### Agent Coordination
- **Location**: `docs/coordination/`
- **Key Guides**:
  - AGENT_COORDINATION_GUIDE.md
  - AGENT_IMPLEMENTATION_GUIDE.md
  - RECOMMENDED_AGENT_STRUCTURE.md

### Platform Documentation
- **Location**: `docs/`
- **Categories**: 8 main categories with 645+ files
- **Navigation**: See `docs/INDEX.md` for complete navigation

---

## 🔗 Quick Links

- **Agent Registry**: `./agents/`
- **Documentation Home**: `./docs/README.md`
- **Documentation Index**: `./docs/INDEX.md`
- **Directory Structure**: `STRUCTURE.md`
- **Naming Convention**: `NAMING_CONVENTION.md`
- **Complete Catalog**: `CATALOGUE.md`

---

## 📊 Statistics

- **Agents**: 14 production-ready agents
- **Documentation Files**: 645+ markdown files
- **Documentation Categories**: 8 main categories
- **Rules Documents**: 3 core rule documents
- **Total Size**: ~50MB of documentation

---

## 🚀 For Developers

### Quick Commands

```bash
# Navigate to Claude directory
cd .claude

# View structure
cat STRUCTURE.md

# Browse documentation
cd docs && cat README.md

# List all agents
ls agents/

# Search documentation
grep -r "search term" docs/
```

### Agent Collaboration

Agents collaborate following protocols in `docs/coordination/`:
- Service agents own PRD/ARD for their services
- Platform agents provide specialized expertise
- Leadership agents coordinate strategy and vision

---

## 📋 Documentation Standards

All documentation follows:
- **Naming Convention**: See `NAMING_CONVENTION.md`
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Required Headers**: Version, Last Updated, Status
- **File Naming**: UPPERCASE for root docs, lowercase-with-hyphens for topics

---

## 🔄 Recent Updates

### Version 1.0.0 (November 23, 2025)
- ✅ Consolidated all documentation into `docs/`
- ✅ Configured 14 production agents
- ✅ Established naming convention (NAMING_CONVENTION.md)
- ✅ Standardized all README files with versioning
- ✅ Created comprehensive navigation (docs/INDEX.md)
- ✅ Added semantic versioning system (MAJOR.MINOR.PATCH)

---

## 📝 Contributing

When adding new content:

1. **Follow naming convention** - See `NAMING_CONVENTION.md`
2. **Add version headers** - Include version, date, status
3. **Update navigation** - Add to `docs/INDEX.md` if applicable
4. **Maintain structure** - Keep organization consistent
5. **Test agent access** - Ensure agents can find new docs

---

**This is the single source of truth for all Claude Code operations.**

All agents have access to this directory and use it to provide context-aware assistance.

---

**Version History**:
- v1.0.0 (Nov 23, 2025) - Initial standardized release
