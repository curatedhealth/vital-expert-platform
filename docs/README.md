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

- **[quick-start.md](guides/quick-start.md)** - Quick start guide for new users
- **[ADDING_AGENTS_GUIDE.md](guides/ADDING_AGENTS_GUIDE.md)** - Complete guide to adding new agents
- **[BATCH_UPLOAD_GUIDE.md](guides/BATCH_UPLOAD_GUIDE.md)** - Batch uploading agents and capabilities
- **[Executive_Implementation_Report.md](guides/Executive_Implementation_Report.md)** - Executive summary and implementation report

#### Setup Guides (`guides/setup/`)

Step-by-step setup instructions for specific features:

- **[langsmith-integration.md](guides/setup/langsmith-integration.md)** - LangSmith integration setup
- **[phase1-creation.md](guides/setup/phase1-creation.md)** - Phase 1 system creation guide
- **[phase1-ui-integration.md](guides/setup/phase1-ui-integration.md)** - Phase 1 UI integration guide
- **[rag-setup.md](guides/setup/rag-setup.md)** - RAG (Retrieval-Augmented Generation) setup
- **[testing-setup.md](guides/setup/testing-setup.md)** - Testing environment setup
- **[tool-calling-setup.md](guides/setup/tool-calling-setup.md)** - Tool calling configuration

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

### Implementation Documentation (`implementation/`)

Detailed implementation summaries and technical reports:

#### Core Features
- **[agent-enhancement-plan.md](implementation/agent-enhancement-plan.md)** - Agent enhancement implementation plan
- **[agent-enhancement-complete.md](implementation/agent-enhancement-complete.md)** - Completed agent enhancements
- **[agent-tool-ui-integration.md](implementation/agent-tool-ui-integration.md)** - Agent tool UI integration
- **[orchestrator-integration.md](implementation/orchestrator-integration.md)** - Master orchestrator integration
- **[orchestration-complete.md](implementation/orchestration-complete.md)** - Orchestration implementation complete

#### Advanced Features
- **[checkpointing-summary.md](implementation/checkpointing-summary.md)** - Checkpointing implementation
- **[hitl-complete.md](implementation/hitl-complete.md)** - Human-in-the-loop (HITL) complete
- **[hitl-progress.md](implementation/hitl-progress.md)** - HITL implementation progress
- **[hitl-status.md](implementation/hitl-status.md)** - HITL implementation status
- **[langgraph-summary.md](implementation/langgraph-summary.md)** - LangGraph implementation
- **[langgraph-migration-plan.md](implementation/langgraph-migration-plan.md)** - Full LangGraph migration plan
- **[memory-history.md](implementation/memory-history.md)** - Memory and history implementation
- **[streaming-summary.md](implementation/streaming-summary.md)** - Streaming implementation
- **[tool-registry-complete.md](implementation/tool-registry-complete.md)** - Tool registry system complete

#### Virtual Advisory Board (VAB)
- **[vab-roadmap.md](implementation/vab-roadmap.md)** - VAB implementation roadmap
- **[vab-summary.md](implementation/vab-summary.md)** - VAB implementation summary
- **[vab-file-map.md](implementation/vab-file-map.md)** - VAB file mapping

#### Phased Implementations
- **[phase1-complete.md](implementation/phase1-complete.md)** - Phase 1 completion report
- **[phases-2-3-4-complete.md](implementation/phases-2-3-4-complete.md)** - Phases 2-4 completion
- **[roadmap-complete.md](implementation/roadmap-complete.md)** - Implementation roadmap complete
- **[remaining-features-plan.md](implementation/remaining-features-plan.md)** - Remaining features plan
- **[remaining-roadmap.md](implementation/remaining-roadmap.md)** - Remaining implementation roadmap

#### Integration & Status
- **[complete-summary.md](implementation/complete-summary.md)** - Complete implementation summary
- **[integration-complete.md](implementation/integration-complete.md)** - Integration complete summary
- **[integration-edits-required.md](implementation/integration-edits-required.md)** - Integration edits required
- **[status.md](implementation/status.md)** - Current implementation status
- **[ui-integration-complete.md](implementation/ui-integration-complete.md)** - UI integration complete

### Operational Documentation (`docs/`)

- **[prevent-background-processes.md](prevent-background-processes.md)** - Guide to prevent background processes
- **[todo-comprehensive.md](todo-comprehensive.md)** - Comprehensive TODO list

### Archive (`archive/`)

Historical documentation and reference materials:

- **[README.md](archive/README.md)** - Archive index and guide
- **[reorganization-summary-2025-10-02.md](archive/reorganization-summary-2025-10-02.md)** - Previous reorganization details
- **[AGENTS_QUICK_REFERENCE.md](archive/AGENTS_QUICK_REFERENCE.md)** - Quick reference guide for agents
- **[VITAL_AI_PLATFORM_PRD.md](archive/VITAL_AI_PLATFORM_PRD.md)** - Original Product Requirements Document
- Historical architecture and planning documents

#### Session Archives (`archive/2025-10-03-session/`)

Documentation from October 3, 2025 implementation session:

- **[final-implementation-status.md](archive/2025-10-03-session/final-implementation-status.md)** - Final implementation status
- **[final-implementation-summary.md](archive/2025-10-03-session/final-implementation-summary.md)** - Final implementation summary
- **[final-next-steps.md](archive/2025-10-03-session/final-next-steps.md)** - Next steps from session
- **[final-session-summary.md](archive/2025-10-03-session/final-session-summary.md)** - Complete session summary
- **[next-steps-implementation.md](archive/2025-10-03-session/next-steps-implementation.md)** - Implementation next steps
- **[session-complete-summary.md](archive/2025-10-03-session/session-complete-summary.md)** - Session completion summary
- **[session-summary.md](archive/2025-10-03-session/session-summary.md)** - Session summary

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

### October 4, 2025 - Comprehensive Reorganization & Versioning

**Major Changes:**
- Reorganized 43+ root-level markdown files into structured directories
- Moved implementation summaries to `implementation/` (27 files)
- Created `guides/setup/` for setup documentation (7 files)
- Archived session summaries to `archive/2025-10-03-session/` (7 files)
- Established naming conventions: kebab-case for all documentation files
- Reduced root directory to 4 essential files (README, CHANGELOG, CONTRIBUTING, SECURITY)

**Naming Convention:**
- All documentation files use kebab-case (lowercase with hyphens)
- Implementation files: `{feature}-{type}.md` (e.g., `langgraph-summary.md`)
- Guide files: `{topic}-{type}.md` (e.g., `rag-setup.md`)
- Archive files include date: `{name}-YYYY-MM-DD.md` (e.g., `reorganization-summary-2025-10-02.md`)

**Directory Structure:**
```
docs/
├── architecture/        (13 files) - System architecture & design
├── guides/             (4 files) - User & developer guides
│   └── setup/          (7 files) - Setup instructions
├── implementation/     (27 files) - Implementation summaries & reports
├── api/                (2 files) - API documentation
├── compliance/         - HIPAA & regulatory docs
├── prompt-library/     - AI prompt templates
├── Agents_Cap_Libraries/ - Agent capabilities
└── archive/            - Historical documentation
    └── 2025-10-03-session/ (7 files) - Session archives
```

**Files Moved:**
- Implementation documentation: 27 files → `docs/implementation/`
- Setup guides: 7 files → `docs/guides/setup/`
- Session summaries: 7 files → `docs/archive/2025-10-03-session/`
- Operational docs: 2 files → `docs/`
- Previous reorganization summary → `docs/archive/`

### October 2, 2025 - Initial Reorganization

Major documentation reorganization completed:
- Created structured subdirectories (architecture, guides, api, compliance, archive)
- Moved 70+ documentation files to appropriate locations
- Archived outdated MA001 PRD ARD documentation
- Consolidated CSV data files

See [archive/reorganization-summary-2025-10-02.md](archive/reorganization-summary-2025-10-02.md) for details.

---

**Last Updated**: October 4, 2025
**Maintained By**: VITAL Path Development Team
**Version**: 2.0
