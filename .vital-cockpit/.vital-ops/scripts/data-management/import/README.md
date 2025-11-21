# Data Import Scripts

Scripts for importing and seeding data into the VITAL Path database.

## Subdirectories

### agents/ (21 files)
Agent-specific data imports including persona loading and agent-tool mappings.

**Key Scripts**:
- `batch_load_agents.py` - Batch load agents from JSON
- `fast_load_all_agents.py` - Optimized agent loading
- `import-agents-from-registry.js` - Import from agent registry
- `execute_registry_batches.py` - Execute agent registry batch imports

### organizations/ (8 files)
Organization structure and role data imports.

**Key Scripts**:
- `populate-org-structure.ts` - Load organization hierarchy
- `import-organizational-roles.js` - Import role definitions
- `import_comprehensive_org_structure.py` - Complete org structure import

### knowledge/ (6 files)
Knowledge domain and Jobs-to-be-Done (JTBD) imports.

**Key Scripts**:
- `knowledge-pipeline.py` - Knowledge processing pipeline
- `import_dh_jtbds.py` - Digital health JTBDs import
- `import_phase2_jtbds.py` - Phase 2 JTBD imports

### General Import Scripts (28 files)
Generic import utilities and multi-purpose loaders.

**Key Scripts**:
- `auto_batch_loader.py` - Automated batch loading
- `final_comprehensive_loader.py` - Comprehensive data loader
- `execute_seeds_via_api.py` - Execute seed files via API

## Usage

Most import scripts require:

```bash
# Database credentials
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run import
python3 scripts/data-import/agents/batch_load_agents.py
```

## Data Sources

Import scripts typically load from:
- `/data/` - JSON data files
- `/sql/seeds/` - SQL seed files
- External APIs (Notion, etc.)

## Related

- `/sql/seeds/` - SQL seed data files
- `/data/` - JSON source data files
- `/database/seeds/` - Legacy seed files
