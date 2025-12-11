# VITAL Platform - Internal Documentation

**Version**: 4.1  
**Last Updated**: December 6, 2025  
**Purpose**: Comprehensive internal documentation for AI assistants and developers

---

## 🔴 CRITICAL: This is the ONLY Location for Internal Documentation

### AI Agents: ALL internal documentation goes here!

```
✅ CORRECT: /.claude/docs/{category}/your-doc.md
❌ WRONG:   /your-doc.md (project root)
❌ WRONG:   /docs/your-doc.md (public docs only)
❌ WRONG:   /scripts/your-doc.md
❌ WRONG:   /apps/your-doc.md
```

### Before Creating Any Documentation:
1. ✅ Use this directory (`/.claude/docs/`)
2. ✅ Find the correct subdirectory (see structure below)
3. ✅ Check if a similar file already exists
4. ❌ NEVER create docs in project root
5. ❌ NEVER create docs in `/docs/` (that's for PUBLIC developer guides only)

---

## 📁 Directory Structure

```
.claude/docs/
├── README.md                     # This file
├── DOCUMENTATION_INDEX.md        # Full index of all docs
│
├── architecture/                 # 🏗️ System Architecture
│   ├── VITAL_WORLD_CLASS_STRUCTURE_FINAL.md  # ⭐ MASTER ARCHITECTURE
│   ├── api/                      # API documentation (13 files)
│   ├── backend/                  # Backend architecture
│   ├── frontend/                 # Frontend/sidebar docs (9 files)
│   ├── database/                 # Database/migration docs (15 files)
│   ├── data-schema/              # Database schemas
│   └── rag-pipeline/             # RAG pipeline docs
│
├── brand/                        # 🎨 Brand Guidelines
│   ├── VITAL_BRAND_GUIDELINES_V5.0.md
│   └── Visual assets & avatars
│
├── coordination/                 # 🤝 Agent Coordination
│   ├── AGENT_COORDINATION_GUIDE.md
│   ├── DOCUMENTATION_CONVENTION.md
│   ├── QUICK_START_GUIDE.md
│   └── Style guides & workflows
│
├── launch/                       # 🚀 Launch Planning
│   ├── LAUNCH_RUNBOOK.md
│   └── Phase-specific docs
│
├── methodology/                  # 📋 Methodology
│   └── Development methodologies
│
├── operations/                   # ⚙️ Operations
│   ├── deployment/               # Deployment guides (13 files)
│   ├── environment/              # Environment setup (3 files)
│   ├── fixes/                    # Bug fixes & issues (11 files)
│   └── testing/                  # Test documentation (6 files)
│
├── platform/                     # 💻 Platform Components
│   ├── agents/                   # Agent definitions
│   ├── capabilities/             # Capability taxonomy
│   ├── data-loading/             # Data loading docs (6 files)
│   ├── enterprise_ontology/      # Ontology & JTBD
│   ├── knowledge-graph/          # Knowledge graph (6 files)
│   ├── organizations/            # Organization structure (3 files)
│   ├── personas/                 # User personas
│   ├── prompts/                  # Prompt templates
│   ├── responsibilities/         # Responsibility mapping
│   ├── rls/                      # Row-Level Security
│   └── workflows/                # Workflow definitions
│
├── services/                     # 🔧 Service Documentation
│   ├── ask-expert/               # Ask Expert service (58 files)
│   └── ask-panel/                # Ask Panel service (28 files)
│
├── strategy/                     # 📈 Strategy Documents
│   ├── ard/                      # Architecture Req Docs
│   ├── prd/                      # Product Req Docs
│   └── vision/                   # Platform vision
│
├── testing/                      # 🧪 Testing
│   └── Test documentation
│
├── _historical/                  # 📜 Historical Documents
│   ├── phases/                   # Phase completion docs (19 files)
│   ├── migrations/               # Migration history (3 files)
│   └── Legacy & completed docs
│
└── _archive/                     # 📦 Archived Documents
    └── Old/outdated docs
```

---

## ⭐ Key Documents

### Architecture (Start Here)
| Document | Purpose |
|----------|---------|
| [VITAL_WORLD_CLASS_STRUCTURE_FINAL.md](architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md) | **Master Architecture Blueprint** |

### Platform Configuration
| Document | Purpose |
|----------|---------|
| [platform/rls/README.md](platform/rls/README.md) | Row-Level Security documentation |
| [platform/agents/](platform/agents/) | Agent definitions & taxonomies |
| [platform/enterprise_ontology/](platform/enterprise_ontology/) | Enterprise ontology & JTBDs |

### Services
| Document | Purpose |
|----------|---------|
| [services/ask-expert/](services/ask-expert/) | Ask Expert service docs |
| [services/ask-panel/](services/ask-panel/) | Ask Panel service docs |

### Operations
| Document | Purpose |
|----------|---------|
| [operations/deployment/](operations/deployment/) | Deployment guides |
| [operations/environment/](operations/environment/) | Environment setup |
| [operations/fixes/](operations/fixes/) | Bug fixes & resolutions |

---

## 🔗 Related Locations

**Root Documentation**:
- `/.claude/VITAL.md` - Master reference
- `/.claude/CLAUDE.md` - Claude guidelines

**Public Docs**: `/docs/`  
**Database**: `/database/migrations/`, `/database/queries/`  
**Scripts**: `/scripts/diagnostics/`, `/scripts/testing/`

---

## 📝 Documentation Guidelines

1. **New architecture docs** → `architecture/`
2. **Service-specific docs** → `services/<service-name>/`
3. **Platform config docs** → `platform/<component>/`
4. **Operations docs** → `operations/<category>/`
5. **SQL files** → `/database/queries/` or `/database/migrations/`
6. **Historical docs** → `_historical/`
7. **Outdated docs** → `_archive/`

---

**Maintained by**: Platform Team  
**Last Reorganization**: December 6, 2025
