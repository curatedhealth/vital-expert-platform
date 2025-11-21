# VITAL Platform - Claude Agent Documentation Hub

This directory contains all essential documentation organized for optimal Claude agent performance and collaboration.

## 📁 Directory Structure

### `/vital-expert-docs/` - Comprehensive Platform Documentation

Organized by function with numbered categories for easy navigation:

#### `00-overview/` - Platform Overview & Quick Start
- Getting started guides
- Commands cheatsheet
- Setup checklist

#### `01-strategy/` - Strategic Documents
- Business requirements
- Vision and strategy
- Analytics framework

#### `02-brand-identity/` - Brand & Positioning
- Brand foundation
- Naming and positioning
- Messaging guidelines

#### `03-product/` - Product Documentation
- Features documentation
- User research
- User personas and journey maps

#### `04-services/` - Core Services
- `/ask-expert/` - Ask Expert service implementation
- `/ask-panel/` - Ask Panel service implementation
- `/ask-committee/` - Ask Committee service implementation
- `/byoai-orchestration/` - BYOAI orchestration service

#### `05-architecture/` - System Architecture
- `/frontend/` - React/Next.js frontend architecture
- `/backend/` - Python/FastAPI backend architecture
- `/data/` - Database schemas and data models
- `/security/` - Security patterns and compliance
- `/infrastructure/` - Infrastructure and deployment
- `/ai-ml/` - AI/ML architecture
- `/adrs/` - Architecture Decision Records

#### `06-workflows/` - Workflow Patterns
- Workflow library
- Agent patterns
- Hierarchical workflows

#### `07-implementation/` - Implementation Guides
- `/deployment-guides/` - Deployment procedures
- `/data-import/` - Data import and seeding
- `/integration-guides/` - Integration documentation
- `/development-guides/` - Developer guides

#### `08-agents/` - Agent Documentation
- `/platform-agents/` - Platform-level agents
- `/service-agents/` - Service-specific agents
- `/leadership-agents/` - Strategic leadership agents
- `/cross-cutting-agents/` - Cross-cutting concern agents
- Agent capabilities and schema
- Agent library audits

#### `09-api/` - API Documentation
- `/api-reference/` - API documentation
- `/api-guides/` - API usage guides
- `/service-apis/` - Service-specific APIs

#### `10-knowledge-assets/` - Knowledge Management
- `/personas/` - User personas and JTBD
- `/prompts/` - Prompt library
- `/tools/` - Tool documentation
- `/knowledge-domains/` - Domain knowledge

#### `11-testing/` - Testing Documentation
- Testing strategy
- Test plans
- Quality assurance
- API testing guides

#### `12-operations/` - Operations
- `/monitoring/` - Monitoring and observability
- `/maintenance/` - Maintenance procedures
- `/scaling/` - Scaling strategies

#### `13-compliance/` - Compliance & Security
- `/regulatory-requirements/` - Healthcare regulations
- `/security-compliance/` - Security standards

#### `14-training/` - Training Materials
- `/developer-onboarding/` - Developer onboarding
- `/user-training/` - User training materials

#### `15-releases/` - Release Management
- `/roadmap/` - Product roadmap
- `/release-notes/` - Release notes and changelogs

---

### `/strategy-docs/` - High-Level Strategic Documents

Core strategic documents for platform vision and planning:

- `VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md` - Overall platform vision
- `VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md` - Product requirements (PRD)
- `VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md` - Architecture requirements (ARD)
- `VITAL_BUSINESS_REQUIREMENTS.md` - Business requirements
- `VITAL_ANALYTICS_FRAMEWORK.md` - Analytics strategy
- `VITAL_ROI_BUSINESS_CASE.md` - ROI and business case
- `STRATEGIC_PLAN.md` - Strategic execution plan
- `GOLD_STANDARD_SCHEMA.md` - Database schema gold standard
- `COMPLETE_PERSONA_SCHEMA_REFERENCE.md` - Persona schema reference
- `AGENT_COORDINATION_GUIDE.md` - Agent coordination guidelines
- `AGENT_TEAM_STRUCTURE_AND_EXECUTION_PLAN.md` - Agent team structure

---

### `/agents/` - Claude Agent Definitions

Individual agent prompt files for specialized Claude agents:

- `sql-supabase-specialist.md` - SQL and Supabase specialist
- `data-architecture-expert.md` - Data architecture expert
- `frontend-ui-architect.md` - Frontend UI architect
- `ask-expert-service-agent.md` - Ask Expert service agent
- `ask-panel-service-agent.md` - Ask Panel service agent
- `ask-committee-service-agent.md` - Ask Committee service agent
- `langgraph-workflow-translator.md` - LangGraph workflow translator
- Plus additional specialized agents

---

## 🎯 Purpose

This documentation hub serves multiple purposes:

1. **Agent Context** - Provides comprehensive context for Claude agents to work effectively
2. **Knowledge Base** - Central repository of platform knowledge and decisions
3. **Collaboration** - Enables consistent collaboration between agents and developers
4. **Onboarding** - Streamlines onboarding for new team members (human and AI)
5. **Historical Record** - Maintains architectural decisions and evolution

## 🚀 Quick Start for Agents

When starting a new task:

1. **Check `/strategy-docs/`** for strategic alignment
2. **Review relevant `/vital-expert-docs/`** sections for context
3. **Consult `/agents/`** for specialized agent capabilities
4. **Reference architecture docs** in `/vital-expert-docs/05-architecture/`

## 📝 Document Conventions

- Use markdown for all documentation
- Include dates and version info where applicable
- Keep documentation DRY (Don't Repeat Yourself)
- Link between related documents
- Update index files when adding new docs

## 🔄 Maintenance

This documentation is actively maintained. Archive old/obsolete docs to:
- `docs/archive/completion-reports/` - Completed work summaries
- `docs/archive/migration-reports/` - Migration documentation
- `docs/archive/status-updates/` - Historical status updates
- `docs/archive/fix-reports/` - Bug fix reports
- `docs/archive/misc/` - Miscellaneous archived docs

## 📚 Related Resources

- **SQL Seeds**: `sql/seeds/` - Database seed files
- **Scripts**: `scripts/` - Utility and data import scripts
- **Archive**: `docs/archive/` - Historical documentation
- **Service Docs**: `services/*/docs/` - Service-specific documentation

---

**Last Updated**: November 2024
**Maintained By**: VITAL Platform Team + Claude Agents
