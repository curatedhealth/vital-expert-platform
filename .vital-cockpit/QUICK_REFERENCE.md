# VITAL Platform - Quick Reference for Claude Agents

## 🎯 Start Here

When beginning any task, consult these key documents:

### Strategic Alignment
- [Platform Vision & Strategy](.claude/strategy-docs/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md)
- [Product Requirements (PRD)](.claude/strategy-docs/VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- [Architecture Requirements (ARD)](.claude/strategy-docs/VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md)

### Database & Schema
- [Gold Standard Schema](.claude/strategy-docs/GOLD_STANDARD_SCHEMA.md)
- [Database Rules](.claude/DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md)
- [Complete Persona Schema](.claude/strategy-docs/COMPLETE_PERSONA_SCHEMA_REFERENCE.md)

### Agent Coordination
- [Agent Team Structure](.claude/strategy-docs/AGENT_TEAM_STRUCTURE_AND_EXECUTION_PLAN.md)
- [Agent Coordination Guide](.claude/strategy-docs/AGENT_COORDINATION_GUIDE.md)

## 📁 Where to Find Things

### Architecture Questions
→ [.claude/vital-expert-docs/05-architecture/](vital-expert-docs/05-architecture/)
- Frontend: React/Next.js patterns
- Backend: Python/FastAPI patterns
- Data: Database schemas and models
- Security: Security patterns and compliance

### Service Implementation
→ [.claude/vital-expert-docs/04-services/](vital-expert-docs/04-services/)
- Ask Expert: `/ask-expert/`
- Ask Panel: `/ask-panel/`
- Ask Committee: `/ask-committee/`
- BYOAI Orchestration: `/byoai-orchestration/`

### Workflows & Patterns
→ [.claude/vital-expert-docs/06-workflows/](vital-expert-docs/06-workflows/)
- Workflow library
- Agent patterns
- Hierarchical workflows

### Data & Personas
→ [.claude/vital-expert-docs/10-knowledge-assets/](vital-expert-docs/10-knowledge-assets/)
- Personas: User personas and JTBD
- Prompts: Prompt library
- Tools: Tool documentation

### Implementation Guides
→ [.claude/vital-expert-docs/07-implementation/](vital-expert-docs/07-implementation/)
- Deployment guides
- Data import procedures
- Integration guides

### API Documentation
→ [.claude/vital-expert-docs/09-api/](vital-expert-docs/09-api/)
- API reference
- API guides
- Service APIs

## 🤖 Specialized Agents

Need specialized help? Consult these agent definitions:

- **SQL/Database**: [sql-supabase-specialist.md](agents/sql-supabase-specialist.md)
- **Data Architecture**: [data-architecture-expert.md](agents/data-architecture-expert.md)
- **Frontend/UI**: [frontend-ui-architect.md](agents/frontend-ui-architect.md)
- **Ask Expert Service**: [ask-expert-service-agent.md](agents/ask-expert-service-agent.md)
- **Ask Panel Service**: [ask-panel-service-agent.md](agents/ask-panel-service-agent.md)
- **Workflow Translation**: [langgraph-workflow-translator.md](agents/langgraph-workflow-translator.md)

## 📊 Common Tasks

### Database Work
1. Check [Gold Standard Schema](strategy-docs/GOLD_STANDARD_SCHEMA.md)
2. Review [Database Rules](DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md)
3. Consult [SQL specialist](agents/sql-supabase-specialist.md)
4. Check [Data Architecture](vital-expert-docs/05-architecture/data/)

### Frontend Work
1. Check [Frontend Architecture](vital-expert-docs/05-architecture/frontend/)
2. Review [UX/UI Resources](UX_UI_FRONTEND_RESOURCES_MAP.md)
3. Consult [Frontend UI Architect](agents/frontend-ui-architect.md)
4. Check service-specific docs in [04-services](vital-expert-docs/04-services/)

### Service Implementation
1. Check service docs in [04-services](vital-expert-docs/04-services/)
2. Review [API documentation](vital-expert-docs/09-api/)
3. Check [Implementation guides](vital-expert-docs/07-implementation/)
4. Consult service-specific agent

### Data Import/Seeding
1. Check [Data Import Guide](vital-expert-docs/07-implementation/data-import/)
2. Review SQL seeds in `sql/seeds/`
3. Check [Persona Schema](strategy-docs/COMPLETE_PERSONA_SCHEMA_REFERENCE.md)
4. Use data import scripts in `scripts/data-import/`

## 🗂️ File Locations

### Active Documentation
- **Strategic Docs**: `.claude/strategy-docs/`
- **Expert Docs**: `.claude/vital-expert-docs/`
- **Agent Prompts**: `.claude/agents/`

### Active Code
- **SQL Seeds**: `sql/seeds/00_PREPARATION/`
- **Data Import Scripts**: `scripts/data-import/`
- **Utilities**: `scripts/utilities/`

### Archives
- **Completion Reports**: `docs/archive/completion-reports/`
- **Migration Reports**: `docs/archive/migration-reports/`
- **Status Updates**: `docs/archive/status-updates/`
- **Fix Reports**: `docs/archive/fix-reports/`
- **Miscellaneous**: `docs/archive/misc/`

## 🔄 Workflow

### For New Features
1. Check PRD/ARD alignment
2. Review architecture docs
3. Check existing patterns
4. Implement following gold standards
5. Document decisions

### For Bug Fixes
1. Check fix reports archive
2. Review related architecture
3. Implement fix
4. Document in fix report

### For Data Work
1. Check schema documentation
2. Review database rules
3. Test with seed data
4. Document changes

## 📝 Documentation Standards

### Creating New Docs
- Place in appropriate `.claude/vital-expert-docs/` category
- Use UPPER_SNAKE_CASE.md naming
- Include date and version
- Link to related docs

### Updating Docs
- Update version/date
- Maintain historical context
- Keep DRY (Don't Repeat Yourself)
- Update index files

### Archiving Docs
- Move to `docs/archive/` with appropriate subcategory
- Don't delete unless truly obsolete
- Maintain for historical reference

## 🚀 Quick Commands

### Find Documentation
```bash
# Search all docs
grep -r "search term" .claude/

# Find by category
ls .claude/vital-expert-docs/05-architecture/

# Check SQL seeds
ls sql/seeds/00_PREPARATION/
```

### View Structure
```bash
# See .claude structure
ls -R .claude/

# See archive structure
ls -R docs/archive/
```

## 💡 Tips

1. **Always check strategic docs first** - Ensure alignment with PRD/ARD
2. **Use specialized agents** - They have deep context for specific domains
3. **Follow gold standards** - Database, API, and architecture patterns
4. **Document decisions** - Update ADRs for architectural decisions
5. **Archive completed work** - Move summaries to appropriate archive

## 📞 Need Help?

1. Check [Main README](.claude/README.md) for full documentation index
2. Review [Organization Summary](.claude/ORGANIZATION_SUMMARY.md)
3. Consult specialized agent definitions in `.claude/agents/`
4. Search archives for similar past work

---

**Last Updated**: November 2024
**Quick Links**:
- [Main README](.claude/README.md)
- [Organization Summary](.claude/ORGANIZATION_SUMMARY.md)
- [Strategic Docs](strategy-docs/)
- [Expert Docs](vital-expert-docs/)
