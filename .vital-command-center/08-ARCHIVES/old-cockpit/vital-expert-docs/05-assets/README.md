# 05-Assets Directory

**Last Updated**: November 21, 2024  
**Version**: 2.0  
**Purpose**: Central repository for all VITAL platform assets

---

## Overview

This directory contains all platform assets that are used across the VITAL system. Assets are organized by type for easy discovery and management.

---

## Directory Structure

```
05-assets/
│
├── dev-agents/              ← Development & Coordination Agents
│   ├── AGENT_COORDINATION_GUIDE.md
│   ├── README.md
│   ├── QUICK_START_VISUAL_GUIDE.md
│   ├── SQL_SUPABASE_SPECIALIST_GUIDE.md
│   └── [12 specialized agent files]
│
├── vital-agents/            ← VITAL Platform Agents (User-facing)
│   ├── [36 agent specification files]
│   └── Agent capabilities and configurations
│
├── knowledge/               ← Knowledge Domains & Content
│   └── knowledge-domains/
│
├── prompts/                 ← Prompt Library
│   └── [7 prompt template files]
│
├── tools/                   ← Agent Tools
│   └── Tool definitions and configurations
│
├── skills/                  ← Agent Skills
│   └── Skill definitions and mappings
│
├── workflows/               ← Workflow Patterns & Templates
│   ├── HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md
│   ├── HIERARCHICAL_WORKFLOW_QUICKSTART.md
│   ├── workflow-library/
│   ├── workflow-patterns/
│   └── agent-patterns/
│
├── jtbds/                   ← Jobs-to-Be-Done System
│   ├── README.md
│   ├── JTBD_IMPLEMENTATION_SUMMARY.md
│   ├── migrations/          (6 phase normalization)
│   └── views/               (Comprehensive JTBD views)
│
├── personas/                ← User Personas (Merged)
│   ├── PERSONA_STRATEGY_GOLD_STANDARD.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── seeds/               (Persona seed templates)
│   └── [25+ persona documentation files]
│
├── org-structure/           ← Organizational Structure
│   ├── Functions, Departments, Roles
│   └── [77 org structure files]
│
└── llms/                    ← LLM Configurations
    └── Model configurations and settings
```

---

## Asset Types

### Development Agents
**Location**: [`../00-overview/dev-agents/`](../00-overview/dev-agents/)  
**Purpose**: AI agents for development, coordination, and system work

**Key Agents**:
- Strategy & Vision Architect
- System Architecture Architect
- Frontend UI Architect
- Python AI/ML Engineer
- Data Architecture Expert
- SQL/Supabase Specialist
- LangGraph Workflow Translator
- Business Analytics Strategist
- Documentation & QA Lead
- PRD Architect
- Service-specific agents

**Documentation**: See `00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`

---

### VITAL Agents (vital-agents/)
**Purpose**: User-facing AI agents that power VITAL services

**Count**: 36 specialized agents  
**Coverage**: 30 healthcare knowledge domains  
**Tiers**: 
- Tier 1: Core domains (15 agents)
- Tier 2: Specialized domains (10 agents)
- Tier 3: Emerging domains (5 agents)

**Documentation**: See individual agent specification files

---

### Knowledge (knowledge/)
**Purpose**: Knowledge domains and content for agent expertise

**Structure**:
- Domain definitions
- Domain hierarchies
- Knowledge mappings
- LLM recommendations per domain

**Reference**: See `../11-data-schema/GOLD_STANDARD_SCHEMA.md`

---

### Prompts (prompts/)
**Purpose**: Reusable prompt templates for agents

**Count**: 7 prompt template files  
**Types**:
- System prompts
- Task-specific prompts
- Service prompts
- Context prompts

---

### Tools (tools/)
**Purpose**: Agent tool definitions and configurations

**Examples**:
- FDA database tools
- PubMed search tools
- ClinicalTrials.gov tools
- Internal data tools

---

### Skills (skills/)
**Purpose**: Agent skill definitions and proficiency levels

**Categories**:
- Domain expertise
- Technical skills
- Communication skills
- Analysis skills

---

### Workflows (workflows/)
**Purpose**: Workflow patterns and LangGraph implementations

**Key Documentation**:
- `HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md` - Complete workflow guide
- `HIERARCHICAL_WORKFLOW_QUICKSTART.md` - Quick start guide
- `workflow-library/` - Reusable workflow templates
- `workflow-patterns/` - Common patterns
- `agent-patterns/` - Agent coordination patterns

---

### JTBDs (jtbds/)
**Purpose**: Jobs-to-Be-Done system (fully normalized)

**Key Files**:
- `README.md` - Complete JTBD documentation
- `JTBD_IMPLEMENTATION_SUMMARY.md` - Implementation status
- `migrations/` - 6-phase normalization scripts
- `views/` - Comprehensive JTBD views

**Status**: ✅ Complete (v2.0 - Fully normalized)

**Documentation**: See `jtbds/README.md`

---

### Personas (personas/)
**Purpose**: User personas and behavioral profiles

**Count**: 25+ persona documentation files  
**Coverage**: All roles across pharmaceutical functions

**Key Documentation**:
- `PERSONA_STRATEGY_GOLD_STANDARD.md` - Master strategy
- `IMPLEMENTATION_GUIDE.md` - Implementation guide
- `PERSONA_SCHEMA_ANALYSIS.md` - Schema analysis
- `seeds/` - Persona seed templates and scripts

**Framework**: MECE 2x2 matrix (AI Maturity × Work Complexity)

---

### Org Structure (org-structure/)
**Purpose**: Organizational structure definitions

**Count**: 77 files (62 SQL, 12 MD, 3 other)

**Coverage**:
- 15 Functions
- 45+ Departments
- 120+ Roles

**Key Documentation**:
- Pharma org structure
- Digital health structure
- Role mappings
- Consolidation guides

---

### LLMs (llms/)
**Purpose**: LLM configurations and model settings

**Coverage**:
- Model selection rules
- Domain-specific models
- Embedding models
- Chat models

**Reference**: See `../../docs/technical/claude.md` for LLM routing

---

## Usage Guidelines

### For Developers
1. Browse asset type directories
2. Review README files in each subdirectory
3. Follow documentation links
4. Use seed templates for new assets

### For AI Agents
1. Check `dev-agents/AGENT_COORDINATION_GUIDE.md` first
2. Use specialized agent guides for specific tasks
3. Reference asset directories as needed
4. Follow golden rules in agent guides

### Adding New Assets
1. Determine asset type
2. Place in appropriate subdirectory
3. Follow naming conventions
4. Add documentation
5. Update this README if major addition

---

## Integration Points

### With Data Schema
- JTBDs → `11-data-schema/jtbds/`
- Personas → `11-data-schema/05-seeds/personas/`
- Org Structure → `11-data-schema/org_structure/`
- Skills/Tools → `11-data-schema/reference-catalogs/`

### With Services
- VITAL Agents → `04-services/ask-expert/`, `ask-panel/`, etc.
- Workflows → Used in all services
- Prompts → Used by all agents

### With Architecture
- Dev Agents → `06-architecture/system-design/`
- LLMs → `06-architecture/ai-ml/`
- Tools → `06-architecture/data/`

---

## Maintenance

### Regular Tasks
- [ ] Update agent specifications
- [ ] Add new personas as roles evolve
- [ ] Expand prompt library
- [ ] Document new workflows
- [ ] Update JTBD mappings

### Quality Checks
- [ ] Verify all cross-references
- [ ] Check for outdated content
- [ ] Ensure naming consistency
- [ ] Validate documentation completeness

---

## Quick Links

- **Dev Agents**: [`../00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md`](../00-overview/dev-agents/AGENT_COORDINATION_GUIDE.md)
- **VITAL Agents**: [`vital-agents/`](vital-agents/)
- **Workflows**: [`workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md`](workflows/HIERARCHICAL_WORKFLOWS_COMPLETE_SUMMARY.md)
- **JTBDs**: [`jtbds/README.md`](jtbds/README.md)
- **Personas**: [`personas/PERSONA_STRATEGY_GOLD_STANDARD.md`](personas/PERSONA_STRATEGY_GOLD_STANDARD.md)
- **Org Structure**: [`org-structure/`](org-structure/)

---

**Navigation**: [Back to vital-expert-docs](../) | [Master INDEX](../../INDEX.md)

