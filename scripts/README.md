# Scripts Directory

> **Complete script collection for VITAL Expert Platform**

---

## 📂 Quick Reference

```bash
# Import personas
python3 scripts/data-import/personas/import_personas.py

# Import agents
python3 scripts/data-import/agents/import_agents.py

# Import workflows  
python3 scripts/data-import/workflows/import_workflows.py

# Verify data
python3 scripts/utilities/verify_migration_complete.py

# Organize project
bash scripts/utilities/organize_project_structure.sh
```

---

## 📁 Directory Structure

```
scripts/
├── migrations/         # Database migrations (Phase 1-3)
├── data-import/        # Data import & seeding
│   ├── personas/      # Persona imports
│   ├── agents/        # Agent imports
│   ├── workflows/     # Workflow imports
│   ├── prompts/       # Prompt imports
│   └── enrichment/    # Data enrichment
├── utilities/          # Verification & cleanup
└── archive/            # Deprecated scripts
```

---

## 🔐 Environment Setup

```bash
# Required environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run script
python3 scripts/data-import/your_script.py
```

---

## 📊 Statistics

- **Total Scripts**: 110+
- **Data Import**: 30+
- **Migrations**: 15+
- **Utilities**: 25+

[→ View Full Documentation](../docs/guides/development/)

---

**Last Updated**: January 10, 2025
**Status**: ✅ Production Ready
