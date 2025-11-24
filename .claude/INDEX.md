# VITAL Command Center - Master Index

**Gold Standard Navigation - Structured Index**

**Version**: 1.0
**Last Updated**: 2025-11-22
**Purpose**: Hierarchical navigation of all documentation

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

## 01-TEAM - Agents, Rules, Coordination

### Agents
**14 Development Agents**:
1. Strategy & Vision Architect (Master Orchestrator)
2. PRD Architect
3. System Architecture Architect
4. Data Architecture Expert
5. Frontend UI Architect
6. Python AI/ML Engineer
7. TypeScript/React Specialist
8. SQL/Supabase Specialist
9. Business & Analytics Strategist
10. Documentation & QA Lead
11. Product Launch Strategist
12. Knowledge & Learning Architect
13. Healthcare Domain Expert
14. Implementation Compliance & QA Agent ⭐ (Librarian)

**Key Files**:
- Agent specifications (one file per agent)
- Agent index.md templates

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

**Last Full Audit**: 2025-11-22
**Next Scheduled Audit**: 2025-12-22

---

**Questions?** → Ask Implementation Compliance & QA Agent (the librarian)

**Can't Find Something?** → Check [CATALOGUE.md](CATALOGUE.md)

**Need Onboarding?** → Start with [QUICK_START.md](QUICK_START.md)
