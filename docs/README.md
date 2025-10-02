# VITAL Path Documentation

Welcome to the VITAL Path Platform documentation. This directory contains comprehensive documentation for developers, users, and administrators.

## Documentation Structure

### Architecture Documentation (`architecture/`)

System design, technical architecture, and implementation details:

- **[ARCHITECTURE.md](architecture/ARCHITECTURE.md)** - High-level system architecture
- **[MICROSERVICES_ARCHITECTURE.md](architecture/MICROSERVICES_ARCHITECTURE.md)** - Microservices design patterns
- **[AGENT_SYSTEMS_ARCHITECTURE.md](architecture/AGENT_SYSTEMS_ARCHITECTURE.md)** - AI agent system architecture
- **[AGENT_DATA_MODEL.md](architecture/AGENT_DATA_MODEL.md)** - Agent data models and schemas
- **[AGENT_REGISTRY_250_IMPLEMENTATION.md](architecture/AGENT_REGISTRY_250_IMPLEMENTATION.md)** - 250 agent registry implementation
- **[ORGANIZATIONAL_STRUCTURE.md](architecture/ORGANIZATIONAL_STRUCTURE.md)** - Organizational hierarchy and structure
- **[SITEMAP.md](architecture/SITEMAP.md)** - Platform sitemap
- **[platform_sitemap.yaml](architecture/platform_sitemap.yaml)** - YAML sitemap configuration
- **[platform_description.md](architecture/platform_description.md)** - Detailed platform description
- **[architecture_c4.mmd](architecture/architecture_c4.mmd)** - C4 architecture diagram (Mermaid)
- **[EVIDENCE_BASED_MODEL_SCORING.md](architecture/EVIDENCE_BASED_MODEL_SCORING.md)** - Model scoring methodology and citations
- **[MODEL_FITNESS_SCORING.md](architecture/MODEL_FITNESS_SCORING.md)** - Model fitness evaluation

### User and Developer Guides (`guides/`)

How-to guides, tutorials, and best practices:

- **[ADDING_AGENTS_GUIDE.md](guides/ADDING_AGENTS_GUIDE.md)** - Complete guide to adding new agents
- **[BATCH_UPLOAD_GUIDE.md](guides/BATCH_UPLOAD_GUIDE.md)** - Batch uploading agents and capabilities
- **[Executive_Implementation_Report.md](guides/Executive_Implementation_Report.md)** - Executive summary and implementation report

### API Documentation (`api/`)

API schemas, endpoints, and integration guides:

- **[agent-bulk-import-schema.json](api/agent-bulk-import-schema.json)** - Agent bulk import JSON schema
- **[vital_agents_complete_registry.json](api/vital_agents_complete_registry.json)** - Complete 250 agent registry

### Compliance Documentation (`compliance/`)

HIPAA compliance, regulatory documentation, and security policies:

*Currently being populated with compliance documentation*

### Prompt Library (`prompt-library/`)

AI prompt templates and engineering resources:

- Complete library of AI prompts for development
- Agent-specific prompt templates
- Conversation patterns and best practices

### Agent Capabilities (`Agents_Cap_Libraries/`)

Agent specifications, capabilities, and configuration:

- Agent capability definitions
- Agent configuration templates
- Specialized agent libraries

### Archive (`archive/`)

Historical documentation and reference materials:

- **[README.md](archive/README.md)** - Archive index and guide
- **[CHANGELOG.md](archive/CHANGELOG.md)** - Project changelog and version history
- **[CONTRIBUTING.md](archive/CONTRIBUTING.md)** - Contributing guidelines
- **[SECURITY.md](archive/SECURITY.md)** - Security policy
- **[AGENTS_QUICK_REFERENCE.md](archive/AGENTS_QUICK_REFERENCE.md)** - Quick reference guide for agents
- **[VITAL_AI_PLATFORM_PRD.md](archive/VITAL_AI_PLATFORM_PRD.md)** - Original Product Requirements Document
- Historical architecture and planning documents

**Note**: Temporary implementation reports have been removed. See git history for details on past migrations, fixes, and implementations.

## Quick Start Guides

### For New Developers

1. Start with the main [README.md](../README.md) in the project root
2. Review [ARCHITECTURE.md](architecture/ARCHITECTURE.md) for system overview
3. Read [ADDING_AGENTS_GUIDE.md](guides/ADDING_AGENTS_GUIDE.md) to understand agent development
4. Check [prompt-library/](prompt-library/) for AI-assisted development

### For Platform Users

1. Review the [Executive_Implementation_Report.md](guides/Executive_Implementation_Report.md)
2. Understand the [ORGANIZATIONAL_STRUCTURE.md](architecture/ORGANIZATIONAL_STRUCTURE.md)
3. Browse available agents in [vital_agents_complete_registry.json](api/vital_agents_complete_registry.json)

### For System Architects

1. Study [AGENT_SYSTEMS_ARCHITECTURE.md](architecture/AGENT_SYSTEMS_ARCHITECTURE.md)
2. Review [MICROSERVICES_ARCHITECTURE.md](architecture/MICROSERVICES_ARCHITECTURE.md)
3. Examine [AGENT_DATA_MODEL.md](architecture/AGENT_DATA_MODEL.md)
4. Check [architecture_c4.mmd](architecture/architecture_c4.mmd) for visual diagrams

### For Compliance Officers

1. Review compliance documentation in [compliance/](compliance/)
2. Check HIPAA configuration in `../config/compliance/`
3. Review audit logging and access control documentation

## Key Concepts

### VITAL Framework

The platform is built around the VITAL Framework:
- **V**ision - Define digital health objectives
- **I**ntegrate - Connect systems and data
- **T**est - Validate and verify solutions
- **A**ctivate - Deploy and launch
- **L**earn - Measure and optimize

### AI Agent System

VITAL Path includes 250+ specialized AI agents organized by:
- **Business Functions** - Market Access, Clinical, Regulatory, etc.
- **Departments** - Organized by healthcare department
- **Roles** - Specific job functions and responsibilities
- **Capabilities** - Individual skills and knowledge areas

### Multi-LLM Orchestration

The platform orchestrates multiple Large Language Models:
- OpenAI GPT-4 for general intelligence
- Anthropic Claude for reasoning and analysis
- Specialized models for domain-specific tasks
- Custom fine-tuned models for healthcare

## Database Documentation

Database schema and migrations are documented in:
- `../database/sql/schema/` - Schema definitions
- `../database/sql/migrations/` - Migration history
- `../database/sql/README.md` - Database documentation

## Configuration

Configuration files are organized in:
- `../config/environments/` - Environment-specific configs
- `../config/compliance/` - HIPAA compliance configurations

## Contributing to Documentation

When adding or updating documentation:

1. **Architecture docs** go in `architecture/`
2. **How-to guides** go in `guides/`
3. **API documentation** goes in `api/`
4. **Compliance docs** go in `compliance/`
5. **Old/deprecated docs** go in `archive/`

### Documentation Standards

- Use Markdown format (.md)
- Include table of contents for long documents
- Add code examples where applicable
- Link to related documentation
- Keep language clear and concise
- Update this index when adding new docs

## Getting Help

- Check relevant documentation sections above
- Review the [archive/](archive/) for historical context
- Use the [prompt-library/](prompt-library/) for AI assistance
- Create an issue in the repository for missing documentation

## Documentation Changelog

### October 2025 Reorganization

Major documentation reorganization completed:
- Created structured subdirectories (architecture, guides, api, compliance, archive)
- Moved 70+ documentation files to appropriate locations
- Archived outdated MA001 PRD ARD documentation
- Consolidated CSV data files
- Created this comprehensive index

See [archive/REORGANIZATION_SUMMARY.md](archive/REORGANIZATION_SUMMARY.md) for previous reorganization details.

---

**Last Updated**: October 2, 2025
**Maintained By**: VITAL Path Development Team
