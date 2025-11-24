# VITAL Platform - Documentation Repository

**Location**: `.claude/docs/`  
**Purpose**: Centralized documentation repository for Claude AI and development team  
**Last Updated**: 2024-11-23

---

## 📚 About This Directory

This directory contains **all consolidated documentation** for the VITAL Platform monorepo. All README files and core documentation from across the project have been copied here for easy reference.

All documentation follows the [Documentation Convention](./DOCUMENTATION_CONVENTION.md) naming standards.

---

## 🎯 Quick Access

### Core Documentation (Root Level)

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Main project README |
| [DOCUMENTATION_CONVENTION.md](./DOCUMENTATION_CONVENTION.md) | Documentation naming standards and guidelines |
| [WORKFLOW-DESIGNER-COMPLETION-SUMMARY.md](./WORKFLOW-DESIGNER-COMPLETION-SUMMARY.md) | Workflow Designer migration summary |

### Agent Documentation

| Document | Description |
|----------|-------------|
| [AGENTS_DOCUMENTATION_GUIDE.md](./AGENTS_DOCUMENTATION_GUIDE.md) | Agent documentation guide |
| [AGENT_COORDINATION_GUIDE.md](./AGENT_COORDINATION_GUIDE.md) | Multi-agent coordination (46KB) |
| [AGENT_IMPLEMENTATION_GUIDE.md](./AGENT_IMPLEMENTATION_GUIDE.md) | Agent implementation details |
| [RECOMMENDED_AGENT_STRUCTURE.md](./RECOMMENDED_AGENT_STRUCTURE.md) | Recommended agent architecture |
| [SQL_SUPABASE_SPECIALIST_GUIDE.md](./SQL_SUPABASE_SPECIALIST_GUIDE.md) | SQL and Supabase specialist guide |

### Quick Start

| Document | Description |
|----------|-------------|
| [QUICK_START_VISUAL_GUIDE.md](./QUICK_START_VISUAL_GUIDE.md) | Visual getting started guide |

---

## 📁 Directory Structure

```
.claude/docs/
├── Core Documentation (Root)
│   ├── README.md
│   ├── DOCUMENTATION_CONVENTION.md
│   ├── WORKFLOW-DESIGNER-COMPLETION-SUMMARY.md
│   └── DOCUMENTATION_INDEX.md (this file)
│
├── Agent Documentation
│   ├── AGENTS_DOCUMENTATION_GUIDE.md
│   ├── AGENT_COORDINATION_GUIDE.md
│   ├── AGENT_IMPLEMENTATION_GUIDE.md
│   ├── RECOMMENDED_AGENT_STRUCTURE.md
│   ├── SQL_SUPABASE_SPECIALIST_GUIDE.md
│   └── QUICK_START_VISUAL_GUIDE.md
│
├── guides/
│   └── WORKFLOW-DESIGNER-GUIDE.md
│
├── specs/
│   └── (Feature specifications - TBD)
│
├── integrations/
│   └── (Integration guides - TBD)
│
├── apps/
│   ├── vital-system/
│   │   ├── README_WORKFLOW_DESIGNER.md
│   │   ├── ai-README.md
│   │   └── langgraph-workflows-README.md
│   ├── pharma/
│   │   ├── workflow-designer-README.md
│   │   └── ai-README.md
│   ├── digital-health-startup/
│   │   ├── docs-README.md
│   │   ├── service-templates-README.md
│   │   └── langgraph-workflows-README.md
│   ├── payers/
│   └── consulting/
│
├── services/
│   └── ai-engine/
│       ├── README.md
│       ├── skills-README.md
│       └── graphrag-README.md
│
├── features/
│   └── workflow-designer-README.md
│
├── packages/
│   └── types-README.md
│
├── tests/
│   └── additional-README.md
│
└── archive/
    └── 2025-11-19-root-cleanup-README.md
```

---

## 📖 Documentation by Category

### 1. Core Platform Documentation

#### Main Documentation
- **[README.md](./README.md)** - Project overview, setup, and getting started
- **[DOCUMENTATION_CONVENTION.md](./DOCUMENTATION_CONVENTION.md)** - Standards for all documentation
- **[WORKFLOW-DESIGNER-COMPLETION-SUMMARY.md](./WORKFLOW-DESIGNER-COMPLETION-SUMMARY.md)** - Recent migration summary

#### Quick Start Guides
- **[QUICK_START_VISUAL_GUIDE.md](./QUICK_START_VISUAL_GUIDE.md)** - Visual getting started guide

### 2. AI Agents Documentation

#### Agent Development
- **[AGENTS_DOCUMENTATION_GUIDE.md](./AGENTS_DOCUMENTATION_GUIDE.md)** - Comprehensive agent documentation guide
- **[AGENT_IMPLEMENTATION_GUIDE.md](./AGENT_IMPLEMENTATION_GUIDE.md)** - How to implement agents
- **[RECOMMENDED_AGENT_STRUCTURE.md](./RECOMMENDED_AGENT_STRUCTURE.md)** - Best practices for agent architecture

#### Agent Coordination
- **[AGENT_COORDINATION_GUIDE.md](./AGENT_COORDINATION_GUIDE.md)** - Multi-agent coordination and workflows (46KB comprehensive guide)

#### Specialized Agents
- **[SQL_SUPABASE_SPECIALIST_GUIDE.md](./SQL_SUPABASE_SPECIALIST_GUIDE.md)** - SQL and database specialist guide

### 3. Features Documentation

#### Workflow Designer
- **[guides/WORKFLOW-DESIGNER-GUIDE.md](./guides/WORKFLOW-DESIGNER-GUIDE.md)** - Complete workflow designer guide
- **[features/workflow-designer-README.md](./features/workflow-designer-README.md)** - Feature-level documentation
- **[apps/vital-system/README_WORKFLOW_DESIGNER.md](./apps/vital-system/README_WORKFLOW_DESIGNER.md)** - Original documentation (legacy)

#### AI Components
- **[apps/vital-system/ai-README.md](./apps/vital-system/ai-README.md)** - AI components in vital-system
- **[apps/pharma/ai-README.md](./apps/pharma/ai-README.md)** - AI components in pharma app

#### LangGraph Workflows
- **[apps/vital-system/langgraph-workflows-README.md](./apps/vital-system/langgraph-workflows-README.md)** - LangGraph workflows (vital-system)
- **[apps/digital-health-startup/langgraph-workflows-README.md](./apps/digital-health-startup/langgraph-workflows-README.md)** - LangGraph workflows (digital-health-startup)

### 4. Applications Documentation

#### Vital System (Main App)
- **[apps/vital-system/README_WORKFLOW_DESIGNER.md](./apps/vital-system/README_WORKFLOW_DESIGNER.md)** - Workflow designer
- **[apps/vital-system/ai-README.md](./apps/vital-system/ai-README.md)** - AI components
- **[apps/vital-system/langgraph-workflows-README.md](./apps/vital-system/langgraph-workflows-README.md)** - LangGraph workflows

#### Pharma App
- **[apps/pharma/workflow-designer-README.md](./apps/pharma/workflow-designer-README.md)** - Workflow designer
- **[apps/pharma/ai-README.md](./apps/pharma/ai-README.md)** - AI components

#### Digital Health Startup App
- **[apps/digital-health-startup/docs-README.md](./apps/digital-health-startup/docs-README.md)** - App documentation
- **[apps/digital-health-startup/service-templates-README.md](./apps/digital-health-startup/service-templates-README.md)** - Service templates
- **[apps/digital-health-startup/langgraph-workflows-README.md](./apps/digital-health-startup/langgraph-workflows-README.md)** - LangGraph workflows

### 5. Services Documentation

#### AI Engine (Python + LangGraph)
- **[services/ai-engine/README.md](./services/ai-engine/README.md)** - Main AI Engine documentation
- **[services/ai-engine/skills-README.md](./services/ai-engine/skills-README.md)** - Agent skills documentation
- **[services/ai-engine/graphrag-README.md](./services/ai-engine/graphrag-README.md)** - GraphRAG implementation

### 6. Packages Documentation

#### Shared Types
- **[packages/types-README.md](./packages/types-README.md)** - Shared TypeScript types

### 7. Testing Documentation

- **[tests/additional-README.md](./tests/additional-README.md)** - Additional testing documentation

### 8. Archive Documentation

- **[archive/2025-11-19-root-cleanup-README.md](./archive/2025-11-19-root-cleanup-README.md)** - Legacy root cleanup documentation

---

## 🔍 How to Use This Documentation

### For Claude AI

All documentation is consolidated here for easy reference. Use this directory as the **single source of truth** for:
- Project structure and architecture
- API endpoints and usage
- Agent implementation patterns
- Workflow designer functionality
- Database schema and relationships
- Environment setup and configuration

### For Developers

1. **Start here**: [README.md](./README.md) for project overview
2. **Follow conventions**: [DOCUMENTATION_CONVENTION.md](./DOCUMENTATION_CONVENTION.md) when writing docs
3. **Feature-specific**: Navigate to relevant subdirectories (apps/, services/, features/)
4. **Agents**: Check agent-specific guides in root directory

### Navigation Tips

- **By Topic**: Use the "Documentation by Category" section above
- **By Location**: Use the "Directory Structure" to browse by project area
- **By Type**: 
  - Guides: `guides/`
  - Specs: `specs/`
  - Integrations: `integrations/`
  - Apps: `apps/`
  - Services: `services/`

---

## 📊 Documentation Statistics

| Category | Count | Size |
|----------|-------|------|
| **Core Documentation** | 3 | ~70KB |
| **Agent Documentation** | 6 | ~100KB |
| **Apps Documentation** | 9 | ~TBD |
| **Services Documentation** | 3 | ~TBD |
| **Features Documentation** | 2 | ~TBD |
| **Other** | 3 | ~TBD |
| **Total Files** | 26 | ~TBD |

---

## 📋 Documentation Naming Convention

All files follow these standards:

### Core Files (UPPERCASE)
- `README.md` - Main documentation entry point
- `CHANGELOG.md` - Version history (if exists)
- `CONTRIBUTING.md` - Contribution guidelines (if exists)
- `{TOPIC}.md` - Topic-specific docs (e.g., `DOCUMENTATION_CONVENTION.md`)

### Specialized Documentation
- `{TOPIC}-GUIDE.md` - Step-by-step guides
- `{FEATURE}-SPEC.md` - Feature specifications
- `{SERVICE}-INTEGRATION.md` - Integration documentation
- `{TOPIC}-REFERENCE.md` - Reference documentation

### Subdirectory Files
- Feature/component directories use `README.md` as entry point
- Specific files use descriptive names with hyphens: `workflow-designer-README.md`

**Full convention details**: [DOCUMENTATION_CONVENTION.md](./DOCUMENTATION_CONVENTION.md)

---

## 🔄 Keeping Documentation Updated

### When Adding New Documentation

1. Follow the [Documentation Convention](./DOCUMENTATION_CONVENTION.md)
2. Place in appropriate subdirectory:
   - Guides → `guides/`
   - Specs → `specs/`
   - Integrations → `integrations/`
   - App-specific → `apps/{app-name}/`
   - Service-specific → `services/{service-name}/`
3. Copy to `.claude/docs/` using the same structure
4. Update this index file

### Sync Script

To sync all documentation from the main repo to `.claude/docs/`:

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
./scripts/sync-docs-to-claude.sh  # (if script exists)
```

Or manually:
```bash
cp -f README.md .claude/docs/
cp -f DOCUMENTATION_CONVENTION.md .claude/docs/
# ... copy other updated files
```

---

## 🆘 Help & Support

### Finding Specific Documentation

- **Workflow Designer**: See [guides/WORKFLOW-DESIGNER-GUIDE.md](./guides/WORKFLOW-DESIGNER-GUIDE.md)
- **Agents**: See [AGENTS_DOCUMENTATION_GUIDE.md](./AGENTS_DOCUMENTATION_GUIDE.md)
- **AI Engine**: See [services/ai-engine/README.md](./services/ai-engine/README.md)
- **API Reference**: Check relevant app/service documentation
- **Setup & Installation**: See [README.md](./README.md)

### Documentation Issues

- Broken links? Update the source and re-copy to `.claude/docs/`
- Missing documentation? Create it following the [Convention](./DOCUMENTATION_CONVENTION.md)
- Outdated information? Update and notify the team

---

## 📅 Version History

| Date | Changes | Updated By |
|------|---------|------------|
| 2024-11-23 | Initial consolidated documentation repository | AI Assistant |
| 2024-11-23 | Added all README files from monorepo | AI Assistant |
| 2024-11-23 | Organized by category and created index | AI Assistant |

---

## 🤖 For Claude: Quick Reference

**Total Documentation Files**: 26  
**Most Important**:
1. [README.md](./README.md) - Start here
2. [WORKFLOW-DESIGNER-GUIDE.md](./guides/WORKFLOW-DESIGNER-GUIDE.md) - Workflow designer
3. [AGENT_COORDINATION_GUIDE.md](./AGENT_COORDINATION_GUIDE.md) - Agent coordination
4. [services/ai-engine/README.md](./services/ai-engine/README.md) - AI Engine backend

**Key Locations**:
- **Main Project**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/`
- **This Docs Repo**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/`
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **Database**: `https://bomltkhixeatxuoxmolq.supabase.co`

---

**Maintained By**: VITAL Platform Team  
**Last Updated**: 2024-11-23  
**Documentation Version**: 1.0.0

