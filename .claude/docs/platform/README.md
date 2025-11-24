# Platform Assets

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Reusable platform components including agents, personas, JTBDs, workflows, and knowledge domains

**Owner**: Implementation Compliance & QA Agent

---

## Overview

This section contains all reusable platform assets that power the VITAL platform. These assets are used across multiple services and features to provide consistent, high-quality user experiences.

---

## Directory Structure

```
02-PLATFORM-ASSETS/
├── agents/                  136+ User-Facing VITAL Agents
├── knowledge-domains/       Medical Affairs, Regulatory, etc.
├── capabilities/            Capability registry
├── skills/                  Skills & tools library
├── personas/                User personas (4 MECE per role)
├── jtbds/                   Jobs-to-Be-Done framework
├── workflows/               Workflow templates
└── prompts/                 Prompt library
```

---

## Agents (User-Facing VITAL Agents)

**Location**: `agents/`

**Description**: 136+ specialized AI agents organized by therapeutic area, function, and specialty. These are the user-facing agents that power Ask Expert, Ask Panel, and Ask Committee features.

**Categories**:
- **Therapeutic Areas**: Oncology, Cardiology, Neurology, Immunology, etc.
- **Functions**: Clinical Data, Regulatory Affairs, Safety & Pharmacovigilance, Medical Writing
- **Specialties**: Pediatrics, Geriatrics, Pregnancy/Lactation

**Key Files**:
- Agent specifications (one file per agent)
- Agent registry (master list)
- Agent seeding scripts

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/vital-agents/`

---

## Knowledge Domains

**Location**: `knowledge-domains/`

**Description**: Structured knowledge organization by medical and regulatory domains.

**Domains**:
- Medical Affairs
- Regulatory Affairs
- Clinical Development
- Safety & Pharmacovigilance
- Medical Information

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/knowledge/`

---

## Personas

**Location**: `personas/`

**Description**: Comprehensive user persona definitions with VPANES prioritization, evidence-based research, and detailed attributes.

**Features**:
- VPANES priority scoring
- Evidence-based development (5-10 sources per persona)
- Typical day activities (6-13 per persona)
- Educational background & certifications
- Motivations, values, personality traits
- Success metrics

**Key Personas**:
- Medical Science Liaison (MSL)
- Medical Director
- Clinical Trial Manager
- Regulatory Affairs Specialist

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/personas/`

---

## Jobs-to-Be-Done (JTBD)

**Location**: `jtbds/`

**Description**: Outcome-Driven Innovation (ODI) framework for defining and analyzing Jobs-to-Be-Done with AI opportunity assessment.

**Features**:
- ODI format (when, circumstance, desired outcome)
- 5-12 desired outcomes per JTBD with opportunity scoring
- Gen AI opportunity assessment
- 3-5 Gen AI use cases per JTBD
- Evidence-based development (5-10 sources)
- Workflow stages (3-7 per JTBD)

**Key JTBDs**:
- Respond to HCP inquiries compliantly
- Generate medical insights from data
- Prepare regulatory submissions
- Educate healthcare professionals

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/jtbds/`

---

## Workflows

**Location**: `workflows/`

**Description**: LangGraph workflow templates for common Medical Affairs processes.

**Workflow Types**:
- Information request handling
- Advisory board orchestration
- Medical insights generation
- Document generation
- Multi-expert consultation

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/workflows/`

---

## Prompts

**Location**: `prompts/`

**Description**: Reusable prompt templates for AI agents.

**Prompt Categories**:
- System prompts (agent personas)
- Task prompts (specific operations)
- Safety prompts (compliance guardrails)
- Few-shot examples

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/prompts/`

---

## Skills

**Location**: `skills/`

**Description**: Reusable skills and capabilities that agents can use.

**Skill Types**:
- Search skills (vector, keyword, graph)
- Reasoning skills (chain-of-thought, ReAct)
- Tool-using skills (API calls, calculations)
- Validation skills (compliance checking)

**Migrated From**: `.vital-cockpit/vital-expert-docs/05-assets/skills/`

---

## Capabilities

**Location**: `capabilities/`

**Description**: Capability registry defining what the platform can do.

**Organization**:
- Capability definitions
- Capability-to-agent mapping
- Capability-to-JTBD mapping
- Capability maturity levels

---

## Usage Guidelines

### Adding New Assets

1. **Agents**: Add agent specification to `agents/` following the agent template
2. **Personas**: Create persona file in `personas/` with VPANES scoring
3. **JTBDs**: Define JTBD in `jtbds/` using ODI format
4. **Workflows**: Add LangGraph workflow to `workflows/`
5. **Prompts**: Add prompt template to `prompts/` with clear documentation

### Asset Naming Conventions

- **Agents**: `{domain}-{subdomain}-{specialty}.md` (e.g., `oncology-melanoma-expert.md`)
- **Personas**: `{role}-{variant}.md` (e.g., `msl-enterprise.md`)
- **JTBDs**: `{job-category}-{specific-job}.md` (e.g., `respond-hcp-inquiry.md`)
- **Workflows**: `{workflow-name}.json` (e.g., `advisory-board-orchestration.json`)

### Cross-References

- **To Services**: Platform assets are used by services in `03-SERVICES/`
- **To Technical**: Asset schemas defined in `04-TECHNICAL/data-schema/`
- **From Strategic**: Assets implement requirements from `00-STRATEGIC/prd/`

---

## Quality Standards

All platform assets must:
- ✅ Have evidence-based documentation
- ✅ Include clear descriptions and use cases
- ✅ Follow naming conventions
- ✅ Be indexed in CATALOGUE.md
- ✅ Have validation criteria

---

## Metrics & Coverage

**Current Status**:
- ✅ 136+ agents seeded (21 fully profiled)
- ✅ 30+ personas documented
- ✅ 20+ JTBDs defined with ODI
- ✅ 15+ workflow templates
- ✅ 100+ prompt templates

**Target Coverage**:
- 136+ agents (all fully profiled) by Q1 2026
- 50+ personas (complete VPANES) by Q2 2026
- 50+ JTBDs (with AI opportunities) by Q2 2026

---

## Related Documentation

- **Strategic Vision**: `00-STRATEGIC/vision/`
- **Product Requirements**: `00-STRATEGIC/prd/`
- **Service Implementations**: `03-SERVICES/`
- **Database Schema**: `04-TECHNICAL/data-schema/`
- **Master Navigation**: `CATALOGUE.md`

---

**Maintained By**: Implementation Compliance & QA Agent
**Questions?**: Check `CATALOGUE.md` or ask Implementation Compliance & QA Agent
