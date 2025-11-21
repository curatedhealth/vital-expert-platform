# Data Management Scripts

Scripts for importing, exporting, and synchronizing data across systems.

## Subdirectories

### import/
Data import scripts organized by data type.

#### import/agents/
Agent-related data imports.

**Key scripts:**
- `import-comprehensive-agents.ts` - Import all agent data
- `import-digital-health-agents.js` - Digital health specific agents
- `import-medical-affairs-complete.js` - Medical affairs agents
- `import-marketing-agents-complete.js` - Marketing agents
- `load-expert-agents.js` - Expert agent data
- `batch_load_agents.py` - Batch loading utility

**Usage:**
```bash
# Import all agents
node import/agents/import-comprehensive-agents.ts

# Import specific domain
node import/agents/import-digital-health-agents.js
```

#### import/organizations/
Organizational structure imports.

**Key scripts:**
- `import-organizational-data.js` - Complete org structure
- `import-organizational-roles.js` - Role definitions
- `populate-org-structure.ts` - Populate org hierarchy
- `import_comprehensive_org_structure.py` - Comprehensive import

**Usage:**
```bash
# Import org structure
node import/organizations/import-organizational-data.js

# Populate hierarchy
node import/organizations/populate-org-structure.ts
```

#### import/knowledge/
Knowledge base data imports.

**Key scripts:**
- `knowledge-pipeline.py` - Knowledge import pipeline
- `import_all_jtbds.sh` - Import all JTBDs
- `import_dh_jtbds.py` - Digital health JTBDs
- `phase2b_import_all_jtbds.py` - Phase 2B import

**Usage:**
```bash
# Run knowledge pipeline
python import/knowledge/knowledge-pipeline.py

# Import JTBDs
bash import/knowledge/import_all_jtbds.sh
```

#### Other Import Scripts

- `import-from-template.js` - Import from templates
- `import-avatar-icons.js` - Import avatar assets
- `import_production_data.py` - Production data import
- `import_pharma_data.py` - Pharmaceutical data
- `load-strategic-intelligence.js` - Strategic intelligence data
- `seed-knowledge-domains.js` - Knowledge domain setup
- `auto_batch_loader.py` - Automated batch loading
- `final_comprehensive_loader.py` - Final data loader

### export/
Data export utilities.

**Key scripts:**
- `export-data-to-json.js` - Export database to JSON
- `export-to-notion-format.js` - Export for Notion

**Usage:**
```bash
# Export to JSON
node export/export-data-to-json.js --output data.json

# Export for Notion
node export/export-to-notion-format.js
```

### sync/
Data synchronization scripts.

**Key scripts:**
- `sync-notion-to-supabase.js` - Sync from Notion
- `sync-supabase-to-notion.js` - Sync to Notion
- `sync-supabase-to-pinecone.js` - Sync to vector DB
- `sync-all-agents-to-pinecone.ts` - Sync all agents
- `sync-from-notion.js` - Pull from Notion
- `sync-org-structure.js` - Sync org structure

**Usage:**
```bash
# Sync from Notion
node sync/sync-notion-to-supabase.js

# Sync to Pinecone
node sync/sync-supabase-to-pinecone.js
```

## Common Workflows

### Initial Data Import

```bash
# 1. Import organizational structure
node import/organizations/import-organizational-data.js

# 2. Import agent library
node import/agents/import-comprehensive-agents.ts

# 3. Import knowledge base
python import/knowledge/knowledge-pipeline.py

# 4. Verify imports
node ../validation/data/verify-agent-org-data.ts
```

### Syncing Data from Notion

```bash
# 1. Sync organizational structure
node sync/sync-from-notion.js --type org

# 2. Sync agents
node sync/sync-notion-to-supabase.js --type agents

# 3. Verify sync
node ../validation/data/verify-remote-data.js
```

### Syncing to Vector Database

```bash
# 1. Sync all agents
node sync/sync-all-agents-to-pinecone.ts

# 2. Verify vector sync
node ../validation/schema/check-pinecone-agents.ts
```

### Data Export

```bash
# 1. Export complete dataset
node export/export-data-to-json.js --all

# 2. Export for external systems
node export/export-to-notion-format.js
```

## Data Flow

```
External Sources (CSV, Notion, etc.)
           ↓
    import/ scripts
           ↓
    Supabase Database
           ↓
    sync/ scripts
           ↓
Vector DB (Pinecone) / Notion / Other Systems
```

## Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Notion
NOTION_API_KEY=
NOTION_DATABASE_ID=

# Pinecone
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
```

## Best Practices

### Importing Data

1. **Validate source data format** before import
2. **Backup database** before large imports
3. **Use batch operations** for large datasets
4. **Handle errors gracefully** with rollback capability
5. **Verify data integrity** after import
6. **Log all import operations**

### Exporting Data

1. **Specify output format** clearly
2. **Handle large datasets** with pagination
3. **Include metadata** in exports
4. **Validate export completeness**

### Synchronization

1. **Check for conflicts** before sync
2. **Use incremental sync** when possible
3. **Log all sync operations**
4. **Verify sync completion**
5. **Handle failures with retry logic**

## Troubleshooting

**Import Failures:**
```bash
# Check source data format
head -n 10 source-data.csv

# Validate against schema
node ../validation/schema/validate-import-data.js

# Check logs
tail -f logs/import.log
```

**Sync Conflicts:**
```bash
# Check conflict log
node sync/check-sync-conflicts.js

# Resolve manually if needed
node sync/resolve-conflicts.js
```

**Missing Data:**
```bash
# Verify source
node import/verify-source-data.js

# Check import logs
grep ERROR logs/import.log

# Re-import specific data
node import/reimport-missing.js
```

## Related Documentation

- [Data Schema](../../docs/architecture/schemas/)
- [Import Guidelines](../../docs/data/import-guidelines.md)
- [Sync Strategy](../../docs/data/sync-strategy.md)
- [API Documentation](../../docs/api/)
