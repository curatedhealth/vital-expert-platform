# VITAL Command Center 🎛️

**The Gold Standard Documentation Architecture for VITAL Platform**

**Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Production Ready
**Managed By**: Implementation Compliance & QA Agent

---

## Welcome

The **VITAL Command Center** is your single source of truth for all platform documentation, specifications, assets, and operational knowledge. This gold standard architecture ensures:

✅ **Clear Separation of Concerns** - Strategy, Team, Assets, Services, Technical, Operations, Quality, Tooling
✅ **Audience-First Navigation** - Find what you need based on your role
✅ **Evidence-Based Traceability** - PRD → ARD → Implementation → Validation
✅ **Scalable Structure** - Grows with the platform
✅ **Agent Coordination** - Each agent knows their domain

---

## 🚀 Quick Start

### First Time Here?
→ **Read**: [`QUICK_START.md`](QUICK_START.md)

### Looking for Something Specific?
→ **Search**: [`CATALOGUE.md`](CATALOGUE.md) - Comprehensive navigation
→ **Browse**: [`INDEX.md`](INDEX.md) - Structured index

### I'm a...
- **Executive/Product Manager** → [`00-STRATEGIC/`](00-STRATEGIC/)
- **Development Agent** → [`01-TEAM/`](01-TEAM/)
- **Developer** → [`04-TECHNICAL/`](04-TECHNICAL/), [`07-TOOLING/`](07-TOOLING/)
- **DevOps/Operations** → [`05-OPERATIONS/`](05-OPERATIONS/)
- **QA/Compliance** → [`06-QUALITY/`](06-QUALITY/)

---

## 📂 Structure Overview

```
.vital-command-center/
│
├── 📋 INDEX.md                    ← Master Navigation
├── 📖 CATALOGUE.md                ← Comprehensive Directory
├── 🚀 QUICK_START.md             ← Onboarding Guide
├── 📄 README.md                   ← This File
│
├── 00-STRATEGIC/                  🎯 Vision, Strategy, Requirements
│   ├── vision/                    Platform vision & value proposition
│   ├── prd/                       Product Requirements Documents
│   ├── ard/                       Architecture Requirements Documents
│   ├── business/                  Business requirements & analysis
│   └── roadmap/                   Product roadmap & releases
│
├── 01-TEAM/                       👥 Agents, Rules, Coordination
│   ├── agents/                    14 Development Agents
│   ├── coordination/              Agent collaboration patterns
│   ├── rules/                     CLAUDE.md, VITAL.md, standards
│   └── processes/                 Team workflows
│
├── 02-PLATFORM-ASSETS/            🧩 Reusable Platform Components
│   ├── agents/                    136+ User-Facing VITAL Agents
│   ├── knowledge-domains/         Medical Affairs, Regulatory, etc.
│   ├── capabilities/              Capability registry
│   ├── skills/                    Skills & tools library
│   ├── personas/                  User personas (4 MECE per role)
│   ├── jtbds/                     Jobs-to-Be-Done framework
│   ├── workflows/                 Workflow templates
│   └── prompts/                   Prompt library
│
├── 03-SERVICES/                   🚀 Service-Specific Documentation
│   ├── ask-expert/                Ask Expert service
│   ├── ask-panel/                 Ask Panel service
│   ├── ask-committee/             Ask Committee service
│   └── byoai-orchestration/       BYOAI service
│
├── 04-TECHNICAL/                  ⚙️ Technical Implementation
│   ├── architecture/              System architecture
│   ├── data-schema/               Database & data model (GOLD STANDARD)
│   ├── api/                       API documentation
│   ├── frontend/                  Frontend architecture
│   ├── backend/                   Backend architecture
│   └── infrastructure/            Infrastructure as Code
│
├── 05-OPERATIONS/                 🔧 DevOps & Operations
│   ├── deployment/                Deployment guides & CI/CD
│   ├── monitoring/                Monitoring & observability
│   ├── scripts/                   Operational scripts
│   ├── runbooks/                  Operational procedures
│   └── maintenance/               Backup, upgrades, scaling
│
├── 06-QUALITY/                    ✅ Quality Assurance
│   ├── testing/                   Test strategy & plans
│   ├── compliance/                HIPAA, GDPR, FDA compliance
│   ├── security/                  Security policies & threat models
│   └── performance/               Performance targets & benchmarks
│
├── 07-TOOLING/                    🛠️ Development Tools
│   ├── scripts/                   Build, setup, utility scripts
│   ├── generators/                Code generators
│   ├── validators/                Compliance validators
│   └── helpers/                   Helper utilities
│
└── 08-ARCHIVES/                   📦 Historical & Deprecated
    ├── deprecated/                Deprecated code & docs
    ├── legacy/                    Legacy systems
    ├── historical/                Historical documentation
    └── migrations-archive/        Old migration scripts
```

---

## 🎯 Core Principles

### 1. Separation of Concerns
Each section has a clear purpose:
- **Strategic** = What and Why
- **Team** = Who and How (collaboration)
- **Assets** = Reusable components
- **Services** = Specific implementations
- **Technical** = How it's built
- **Operations** = How it runs
- **Quality** = How we ensure quality
- **Tooling** = How we accelerate development

### 2. Audience-First Navigation
Documentation organized by who needs it:
- **Executives** find strategy, ROI, roadmap
- **Agents** find their roles, coordination patterns
- **Developers** find architecture, APIs, schemas
- **Operations** find deployment, monitoring, runbooks
- **QA** find testing, compliance, security

### 3. Evidence-Based Traceability
Clear path from specification to implementation:
```
PRD (requirement) → ARD (architecture) → Implementation (code) → Compliance (validation)
```

### 4. Single Source of Truth
- One `INDEX.md` - master navigation
- One `CATALOGUE.md` - comprehensive directory
- One gold standard schema - `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`
- Each agent has one `index.md` in their domain

### 5. Scalability
Structure supports growth:
- New services → `03-SERVICES/{new-service}/`
- New platform assets → `02-PLATFORM-ASSETS/{new-asset}/`
- New tools → `07-TOOLING/{new-tool}/`

---

## 🔍 Finding What You Need

### Quick Navigation
1. **I know what I'm looking for** → [`CATALOGUE.md`](CATALOGUE.md)
2. **I want to browse** → [`INDEX.md`](INDEX.md)
3. **I'm new here** → [`QUICK_START.md`](QUICK_START.md)

### Common Queries

| I Need... | Go To... |
|-----------|----------|
| PRD compliance checklist | [`00-STRATEGIC/prd/`](00-STRATEGIC/prd/) |
| ARD compliance checklist | [`00-STRATEGIC/ard/`](00-STRATEGIC/ard/) |
| Agent coordination rules | [`01-TEAM/coordination/`](01-TEAM/coordination/) |
| AI assistant rules | [`01-TEAM/rules/CLAUDE.md`](01-TEAM/rules/CLAUDE.md) |
| Platform standards | [`01-TEAM/rules/VITAL.md`](01-TEAM/rules/VITAL.md) |
| Database schema | [`04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`](04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md) |
| API documentation | [`04-TECHNICAL/api/`](04-TECHNICAL/api/) |
| Deployment guide | [`05-OPERATIONS/deployment/`](05-OPERATIONS/deployment/) |
| Test strategy | [`06-QUALITY/testing/`](06-QUALITY/testing/) |
| Compliance tools | [`07-TOOLING/validators/`](07-TOOLING/validators/) |

---

## 👥 Agent Ownership

Each section has designated agent owners:

| Section | Primary Owner | Support Agents |
|---------|--------------|----------------|
| **00-STRATEGIC** | Master Orchestrator, PRD Architect, System Architecture Architect | All agents contribute |
| **01-TEAM** | Master Orchestrator | Documentation & QA Lead |
| **02-PLATFORM-ASSETS** | Multiple (by asset type) | Data Architecture Expert |
| **03-SERVICES** | Service-specific agents | All technical agents |
| **04-TECHNICAL** | System Architecture Architect | Data, Frontend, Backend agents |
| **05-OPERATIONS** | System Architecture Architect | Python AI/ML Engineer |
| **06-QUALITY** | Documentation & QA Lead, Implementation Compliance & QA Agent | All agents |
| **07-TOOLING** | Implementation Compliance & QA Agent | SQL/Supabase Specialist |
| **08-ARCHIVES** | Documentation & QA Lead | N/A |

---

## 🛡️ Quality Standards

### Documentation Quality
All documentation must:
- ✅ Have clear headers (Title, Last Updated, Version, Status)
- ✅ Include table of contents (if >5 pages)
- ✅ Use evidence-based language
- ✅ Include cross-references
- ✅ Be indexed in CATALOGUE.md

### Code Quality
All code must:
- ✅ Match PRD specifications
- ✅ Follow ARD architecture
- ✅ Pass compliance validation
- ✅ Include evidence of testing

### Compliance Requirements
All implementations must:
- ✅ Have PRD reference
- ✅ Have ARD reference
- ✅ Have compliance report
- ✅ Have test evidence
- ✅ Follow CLAUDE.md/VITAL.md rules

---

## 📊 Metrics & Success

### Coverage Metrics
- ✅ 100% of features have PRD references
- ✅ 100% of architecture has ARD references
- ✅ 100% of documents are indexed
- ✅ <1% broken links

### Quality Metrics
- ✅ <5% compliance gaps
- ✅ All gaps closed within 1 sprint
- ✅ Zero critical violations
- ✅ >95% documentation coverage

### Usability Metrics
- ✅ Agents find docs in <30 seconds
- ✅ Zero orphaned documentation
- ✅ All cross-references accurate

---

## 🚀 Getting Started

### For New Team Members
1. Read [`QUICK_START.md`](QUICK_START.md)
2. Review [`01-TEAM/rules/VITAL.md`](01-TEAM/rules/VITAL.md)
3. Explore your role's section
4. Check [`CATALOGUE.md`](CATALOGUE.md) for specific topics

### For Development Agents
1. Read [`01-TEAM/agents/AGENT_COORDINATION_GUIDE.md`](01-TEAM/agents/)
2. Review your agent specification in [`01-TEAM/agents/`](01-TEAM/agents/)
3. Check your domain ownership
4. Query Implementation Compliance & QA Agent if you can't find something

### For Developers
1. Review [`00-STRATEGIC/prd/MASTER_PRD.md`](00-STRATEGIC/prd/) - What we're building
2. Review [`00-STRATEGIC/ard/MASTER_ARD.md`](00-STRATEGIC/ard/) - How we're building it
3. Check [`04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`](04-TECHNICAL/data-schema/) - Database
4. Browse [`07-TOOLING/`](07-TOOLING/) - Development tools

---

## 📞 Getting Help

### I Can't Find...

1. **Check [`CATALOGUE.md`](CATALOGUE.md)** - Comprehensive navigation
2. **Search [`INDEX.md`](INDEX.md)** - Structured index
3. **Ask Implementation Compliance & QA Agent** - The librarian
4. **Check agent index.md files** - Agent-specific docs

### Still Need Help?

| Question Type | Contact |
|--------------|---------|
| Strategic/Vision | Master Orchestrator |
| Product Requirements | PRD Architect |
| Architecture | System Architecture Architect |
| Documentation | Documentation & QA Lead |
| Compliance/Finding Docs | Implementation Compliance & QA Agent |

---

## 🔄 Maintenance

### How This Structure Stays Current

1. **Continuous Updates**
   - Implementation Compliance & QA Agent monitors all changes
   - CATALOGUE.md updated after every documentation change
   - Agent index.md files maintained by respective agents

2. **Quality Checks**
   - Weekly link validation
   - Monthly compliance audits
   - Quarterly structure reviews

3. **Version Control**
   - All major documents versioned
   - Change log maintained
   - Archive old versions to `08-ARCHIVES/`

---

## 🎉 Welcome to the Gold Standard

This architecture represents **enterprise-grade documentation management** designed specifically for:
- ✅ Multi-agent coordination
- ✅ Healthcare compliance (HIPAA, FDA)
- ✅ Rapid scaling
- ✅ Evidence-based development

**Maintained by**: Implementation Compliance & QA Agent
**Last Full Audit**: 2025-11-22
**Next Scheduled Audit**: 2025-12-22

---

**Navigation**: [INDEX.md](INDEX.md) | [CATALOGUE.md](CATALOGUE.md) | [QUICK_START.md](QUICK_START.md)
