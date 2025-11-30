# VITAL Command Center - Master Index

**Gold Standard Navigation - Structured Index**

**Version**: 3.0.0
**Last Updated**: 2025-11-29
**Purpose**: Hierarchical navigation of all documentation

---

## 🚨 CRITICAL: CANONICAL PROJECT DIRECTORY

**ALL work MUST be performed in:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

**NEVER work in `/Users/hichamnaim/Downloads/Cursor/VITAL/`** - this is an archived directory.

---

## Quick Links

- [README.md](README.md) - What is the Command Center?
- [QUICK_START.md](QUICK_START.md) - 5-minute onboarding
- **[CATALOGUE.md](CATALOGUE.md)** - Comprehensive directory (find anything)
- [EXECUTION_PLAN.md](EXECUTION_PLAN.md) - How we built this structure

---

## 00-STRATEGIC - Vision, Strategy, Requirements

### Vision
- Platform Vision & Value Proposition
- Strategic Goals & Objectives

### PRD (Product Requirements Documents)
- Master PRD: `VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md`
- Service PRDs (Ask Expert, Ask Panel, Ask Committee, BYOAI)
- **Updates**: `PRD_UPDATE_PHASE1_2025-11-22.md`, `ASK_EXPERT_PRD_UPDATE_2025-11-22.md`

### ARD (Architecture Requirements Documents)
- Master ARD: `VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md`
- Service ARDs

### Business
- Business Requirements
- ROI Model & Business Case

### Roadmap
- Product Roadmap (3-year horizon)
- Release Planning
- Feature Prioritization

---

## 01-TEAM - Claude Code Development Agents

### Agent Model Tiers (Updated 2025-11-29)

**Leadership Tier (Opus 4.5)** - 8 agents for strategic decisions:
| Agent | Role |
|-------|------|
| `vital-platform-orchestrator` | Platform Coordinator |
| `strategy-vision-architect` | Strategy Lead |
| `prd-architect` | Product Requirements Lead |
| `system-architecture-architect` | Architecture Lead |
| `business-analytics-strategist` | Business Strategy Lead |
| `documentation-qa-lead` | Documentation Lead |
| `implementation-compliance-qa-agent` | QA Gatekeeper (Librarian) |
| `launch-strategy-agent` | Launch Coordinator |

**Specialist Tier (Sonnet)** - 30 agents for tactical execution:
- `data-architecture-expert` - Database Architecture
- `sql-supabase-specialist` - SQL Operations
- `vital-data-strategist` - Data Strategy
- `frontend-ui-architect` - Frontend UI
- `python-ai-ml-engineer` - AI/ML Backend
- `langgraph-workflow-translator` - Workflow Translation
- `ux-ui-architect` - UX/UI Design
- `visual-design-brand-strategist` - Brand & Design
- `ask-expert-service-agent` - Ask Expert Service
- `ask-panel-service-agent` - Ask Panel Service
- `byoai-orchestration-service-agent` - BYOAI Service
- And 19 more specialized agents...

**Total: 38 Claude Code Development Agents**

**Key Files**:
- Agent specifications: `.claude/agents/*.md`
- Coordination guide: `docs/coordination/AGENT_COORDINATION_GUIDE.md`

### Coordination
- Agent Coordination Guide
- Multi-Agent Collaboration Patterns
- Sync Points & Communication Protocol

### Rules
- **CLAUDE.md** - AI assistant rules
- **VITAL.md** - Platform standards
- **EVIDENCE_BASED_RULES.md** - Evidence-based documentation rules

### Processes
- Team workflows
- Development processes
- Review processes

---

## 02-PLATFORM-ASSETS - Reusable Components

### Agents (136+ User-Facing VITAL Agents)
- Therapeutic Area Agents (Oncology, Cardiology, etc.)
- Functional Agents (Clinical Data, Regulatory, Safety)
- Specialty Agents (Pediatrics, Geriatrics, etc.)
- Agent Registry & Seeding Scripts

### Knowledge Domains
- Medical Affairs
- Regulatory Affairs
- Clinical Development
- Safety & Pharmacovigilance

### Capabilities
- Capability Registry
- Capability-to-Agent Mapping
- Capability-to-JTBD Mapping

### Skills
- Search Skills (vector, keyword, graph)
- Reasoning Skills (chain-of-thought, ReAct)
- Tool-Using Skills (API calls, calculations)
- Validation Skills (compliance checking)

### Personas (30+ User Personas)
- VPANES Priority Scoring
- Evidence-Based Development
- Typical Day Activities
- Motivations, Values, Traits
- Success Metrics

### JTBDs (Jobs-to-Be-Done)
- ODI Framework (Outcome-Driven Innovation)
- Desired Outcomes with Opportunity Scoring
- Gen AI Opportunity Assessment
- Gen AI Use Cases
- Evidence Sources

### Workflows
- LangGraph Workflow Templates
- Common Medical Affairs Processes
- Advisory Board Orchestration
- Document Generation Workflows

### Prompts
- System Prompts (agent personas)
- Task Prompts (specific operations)
- Safety Prompts (compliance guardrails)
- Few-Shot Examples

### User Management ✨ NEW!
**Location**: `docs/platform/users/` (9 files)
**Status**: ✅ Production-Ready (v3.0.0)

**Core Documentation**:
- [README.md](docs/platform/users/README.md) - Navigation hub
- [INDEX.md](docs/platform/users/INDEX.md) - Quick reference

**Schema Documentation**:
- [USER_AGENTS_SCHEMA.md](docs/platform/users/schema/USER_AGENTS_SCHEMA.md) - 54-column table
- [USER_DATA_SCHEMA_COMPLETE.md](docs/platform/users/schema/USER_DATA_SCHEMA_COMPLETE.md) - 14 tables
- [DATABASE_NORMALIZATION_GUIDE.md](docs/platform/users/schema/DATABASE_NORMALIZATION_GUIDE.md) - Design principles

**Implementation**:
- [USER_AGENTS_API_REFERENCE.md](docs/platform/users/api/USER_AGENTS_API_REFERENCE.md) - REST API & React Query
- [GETTING_STARTED_GUIDE.md](docs/platform/users/guides/GETTING_STARTED_GUIDE.md) - 5-minute setup
- [MIGRATION_HISTORY.md](docs/platform/users/migrations/MIGRATION_HISTORY.md) - Changelog
- [USER_MANAGEMENT_TEST_DATA.sql](docs/platform/users/seeds/USER_MANAGEMENT_TEST_DATA.sql) - Test data

**Key Features**:
- 54-column user_agents table (3NF normalized)
- 14 user-related tables
- 23 performance indexes
- 6 RLS policies
- 5 helper functions
- 4 pre-built views

---

## 03-SERVICES - Service Documentation

### Ask Expert ✅ Modes 1-2 Complete (95%)
- **Mode 1**: Manual Selection - Query (20-30s response)
- **Mode 2**: Auto Selection - Query (30-45s response)
- **Mode 3**: Manual + Autonomous Chat ⏳ Q1 2026
- **Mode 4**: Auto + Autonomous Chat ⏳ Q2 2026

**Documents**:
- Service PRD
- Service Architecture
- API Documentation
- Workflow Specifications
- Performance Benchmarks

### Ask Panel ✅ 90% Complete
- Custom Panel Creation (2-5 experts)
- Panel Templates (10+ archetypes)
- Consensus/Dissent Tracking
- Multi-Perspective Synthesis

**Documents**:
- Panel Workflows (19+ workflows)
- Panel Archetype Library
- Execution Orchestration

### Ask Committee ⏳ Q3 2026
- Multi-Phase Deliberation (8-24 hours)
- 5-12 Expert Agents
- Chairperson AI Orchestration
- 15-20 Page Report Generation

### BYOAI Orchestration ⏳ Q2 2026
- Custom Agent Registration
- OpenAPI Spec Validation
- Security Sandboxing
- BYOAI Marketplace

---

## 04-TECHNICAL - Technical Implementation

### Architecture
- System Architecture
- Multi-Tenancy Design
- Microservices vs Monolith
- Scalability & Performance

### Data Schema ⭐ GOLD STANDARD
- **GOLD_STANDARD_SCHEMA.md** - Single source of truth
- Database Tables (85+ tables)
- Relationships & Constraints
- Migrations (31,342 lines of SQL)
- Schema Evolution

### API
- API Reference
- API Routes (100+ endpoints)
- Authentication & Authorization
- Rate Limiting
- Webhooks

### Frontend
- Next.js 14 App Router
- React Server Components
- UI Component Library (shadcn)
- State Management (Zustand)
- Design System

### Backend
- Technology Stack
- LangChain & LangGraph
- RAG Pipeline (Pinecone, Neo4j)
- Multi-Agent Orchestration
- Background Jobs

### Infrastructure
- Infrastructure as Code (Terraform/Pulumi)
- Docker & Containerization
- Kubernetes Orchestration
- Cloud Architecture (AWS/GCP)

---

## 05-OPERATIONS - DevOps & Operations

### Deployment
- Deployment Guide
- CI/CD Pipelines
- Environment Configuration
- Docker Setup
- Kubernetes Manifests

### Monitoring
- Monitoring Setup
- Observability (Logs, Metrics, Traces)
- Alerting Rules
- Dashboards

### Scripts
- Operational Scripts
- Database Scripts
- Backup Scripts
- Migration Scripts

### Runbooks
- Incident Response
- Common Issues
- Emergency Procedures
- Rollback Procedures

### Maintenance
- Backup & Restore
- Upgrades & Patches
- Scaling Procedures
- Database Maintenance

---

## 06-QUALITY - Quality Assurance

### Testing
- Test Strategy
- Test Plans
- Unit Testing (65% coverage)
- Integration Testing
- E2E Testing
- Performance Testing

### Compliance
- HIPAA Compliance
- GDPR Compliance
- FDA 21 CFR Part 11 Compliance
- SOC 2 Certification

### Security
- Security Policy
- Threat Models
- Penetration Testing
- Vulnerability Management
- Security Audits

### Performance
- Performance Targets
- Performance Benchmarks
- Load Testing
- Optimization Strategies

---

## 07-TOOLING - Development Tools

### Scripts
- Build Scripts
- Setup Scripts
- Database Scripts
- Deployment Scripts
- Utility Scripts

### Generators
- Agent Generator
- API Generator
- Component Generator
- Migration Generator
- Test Generator

### Validators
- **PRD Validator** - Ensure code matches PRD
- **ARD Validator** - Ensure architecture follows ARD
- **CLAUDE.md Validator** - Check AI assistant rules compliance
- **VITAL.md Validator** - Check platform standards compliance
- **Link Validator** - Verify cross-references
- **Schema Validator** - Validate database schema

### Helpers
- Data Helpers
- File Helpers
- Documentation Helpers
- Testing Helpers

---

## 08-ARCHIVES - Historical & Deprecated

### Deprecated
- Deprecated Code
- Deprecated Documentation
- Deprecation Notices

### Legacy
- Legacy Systems
- Migration Guides
- Legacy Documentation

### Historical
- Historical Decisions
- Architecture Decision Records (ADRs)
- Project History

### Migrations Archive
- Old Migration Scripts
- Obsolete Migrations
- Migration History

---

## Navigation Tools

### For Quick Answers
→ **[CATALOGUE.md](CATALOGUE.md)** - Find anything by role, task, or keyword

### For Structured Browsing
→ **[INDEX.md](INDEX.md)** (this file) - Hierarchical navigation

### For New Users
→ **[QUICK_START.md](QUICK_START.md)** - 5-minute orientation

### For Understanding Structure
→ **[README.md](README.md)** - Overview & principles

---

## Document Status Legend

- ✅ **Complete** - Document is production-ready
- ⏳ **Planned** - Document is designed but not yet created
- 🚧 **In Progress** - Document is actively being written
- ⚠️ **Deprecated** - Document is being sunset
- ⭐ **Critical** - Must-read document

---

## Maintenance

**Maintained By**: Implementation Compliance & QA Agent

**Update Frequency**:
- Weekly: Link validation
- Monthly: Compliance audits
- Quarterly: Structure reviews

**Last Full Audit**: 2025-11-25
**Next Scheduled Audit**: 2025-12-25

---

**Questions?** → Ask Implementation Compliance & QA Agent (the librarian)

**Can't Find Something?** → Check [CATALOGUE.md](CATALOGUE.md)

**Need Onboarding?** → Start with [QUICK_START.md](QUICK_START.md)

---

## 06-PLATFORM-AGENTS - AgentOS 3.0 Documentation

### AgentOS 3.0 Complete Documentation
**Location**: `docs/platform/agents/`
**Status**: ✅ Production-Ready (100% Complete)
**Version**: 1.0.0
**Last Updated**: November 26, 2025
**Total Agents**: 489 (fully enriched)

### Quick Start
- **[README.md](docs/platform/agents/README.md)** - Master index and navigation
- **[AGENT_SCHEMA_SPEC.md](docs/platform/agents/AGENT_SCHEMA_SPEC.md)** - Complete technical specification
- **[AGENT_SCHEMA_REFERENCE.md](docs/platform/agents/AGENT_SCHEMA_REFERENCE.md)** - Quick SQL reference

### Core Schema Documentation
- **AGENT_SCHEMA_SPEC.md** - Complete technical spec for 35+ agent tables
- **AGENT_SCHEMA_REFERENCE.md** - Quick SQL snippets and API examples
- **AGENT_SCHEMA_ARCHITECTURE.md** - Visual ERD and architecture diagrams

### Enrichment Documentation
- **AGENT_ENRICHMENT_REPORT.md** - Enrichment status and verification (100% complete)
- **AGENT_ENRICHMENT_REFERENCE.md** - Quick enrichment reference
- **AGENT_ENRICHMENT_PLAN.md** - Master enrichment plan

### Implementation & Delivery
- **AGENTOS_3_DELIVERY_REPORT.md** - Final delivery summary
- **AGENTOS_3_IMPLEMENTATION_GUIDE.md** - Implementation guide

### Function-Specific Documentation
- **MEDICAL_AFFAIRS_ENRICHMENT_REPORT.md** - Medical Affairs enrichment
- **MARKET_ACCESS_SUMMARY.md** - Market Access completion
- **AGENT_WORKFLOW_GUIDE.md** - Agent workflow patterns

### SQL Seeds & Migrations
**Location**: `docs/platform/agents/sql-seeds/` (12 files)

**Core Migrations** (Run in order):
1. `20251126-alter-agents-system-prompts.sql` - Add system prompt fields
2. `20251126-link-agents-to-templates.sql` - Link agents to templates
3. `20251126-assign-agent-capabilities.sql` - Assign capabilities
4. `20251126-assign-agent-skills.sql` - Assign skills
5. `20251126-assign-agent-knowledge-domains.sql` - Assign knowledge domains

**System Prompt Seeds**:
- `20251126-system-prompt-infrastructure.sql` - Infrastructure tables
- `20251126-system-prompt-seed-data.sql` - Base seed data
- `20251126-system-prompt-l2-l3-templates.sql` - L2/L3 Expert templates
- `20251126-system-prompt-l4-l5-templates.sql` - L4/L5 Worker/Tool templates

**Additional**:
- `20251125-agent-relationships-workflows.sql` - Agent relationships
- `20251126-medical-affairs-capabilities.sql` - Medical Affairs taxonomy (WIP)
- `20251126-drop-agentos3-tables.sql` - Cleanup script (if needed)

### Agent Distribution
- **L1 MASTER**: 24 agents (Strategic orchestrators)
- **L2 EXPERT**: 110 agents (Domain specialists)
- **L3 SPECIALIST**: 266 agents (Focused experts)
- **L4 WORKER**: 39 agents (Task executors)
- **L5 TOOL**: 50 agents (Automated functions)

### Multi-Tenant Support
- **Pharma**: 400+ agents (8 functions)
- **Digital Health**: 89 agents (6 functions)

### Key Features
✅ 5-Level Agent Hierarchy (L1 Master → L5 Tool)
✅ 489 Fully Enriched Agents
✅ Capabilities & Skills System (30+ capabilities, 150+ skills)
✅ Knowledge Domains (50+ domains)
✅ System Prompt Templates (AgentOS 3.0 gold standard)
✅ Agent Relationships (440 relationships)
✅ Complete Schema Documentation
✅ SQL Seed Files

---

**Updated**: November 26, 2025 (AgentOS 3.0)  
**Updated**: November 25, 2025 (User Management v3.0.0)  
**Next Review**: December 26, 2025

## Version History

- **v2.0.0** (Nov 25, 2025) - Added User Management System documentation
- **v1.1.0** (Nov 26, 2025) - Added AgentOS 3.0 documentation
- **v1.0.0** (Nov 22, 2025) - Initial version