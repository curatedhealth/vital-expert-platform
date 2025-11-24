# Database Import Templates

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active

This directory contains JSON templates for bulk data imports into the VITAL Path database.

## Available Templates

### 1. agent_template.json
Template for importing agents with all supported fields.

**Usage:**
```bash
# Use the import script
node scripts/import-from-template.js database/templates/your_agents.json
```

**Fields:**
- `name`: Unique identifier (snake_case)
- `display_name`: Human-readable name
- `tier`: 0 (Core), 1 (Tier 1), 2 (Tier 2), 3 (Tier 3)
- `status`: active, inactive, development, testing, deprecated, planned, pipeline
- `domain_expertise`: general, regulatory, clinical, market_access, quality, safety, commercial, legal, analytics
- `data_classification`: public, internal, confidential, restricted

### 2. capability_template.json
Template for importing capabilities.

**Fields:**
- `stage`: unmet_needs_investigation, solution_design, prototyping_development, clinical_validation, regulatory_pathway, reimbursement_strategy, go_to_market, post_market_optimization
- `vital_component`: innovation, trust, evidence, market_access, lifecycle
- `priority`: critical, high, medium, low
- `maturity`: concept, pilot, production_ready, mature, legacy

## Enum Values Reference

### agent_status
- `active` - Agent is live and available
- `inactive` - Agent is disabled
- `development` - Under development
- `testing` - In testing phase
- `deprecated` - No longer recommended
- `planned` - Planned for future
- `pipeline` - In development pipeline

### domain_expertise
- `general` - General purpose
- `regulatory` - Regulatory affairs
- `clinical` - Clinical development
- `market_access` - Market access & reimbursement
- `quality` - Quality assurance
- `safety` - Safety & pharmacovigilance
- `commercial` - Commercial operations
- `legal` - Legal & compliance
- `analytics` - Data & analytics

### validation_status
- `pending` - Awaiting validation
- `validated` - Validated and approved
- `in_review` - Currently under review
- `expired` - Validation expired
- `not_required` - No validation needed

### data_classification
- `public` - Public data
- `internal` - Internal use only
- `confidential` - Confidential
- `restricted` - Highly restricted

## Creating Your Data Files

1. Copy a template file
2. Rename it (e.g., `my_agents.json`)
3. Fill in your data following the template structure
4. Validate JSON syntax
5. Import using the import script

## Import Scripts

### Import Agents
```bash
node scripts/import-agents-from-template.js database/templates/my_agents.json
```

### Import Capabilities
```bash
node scripts/import-capabilities-from-template.js database/templates/my_capabilities.json
```

## Validation

Before importing, validate your JSON:
```bash
# Check JSON syntax
cat your_file.json | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

## Backup Before Import

Always backup before importing:
```bash
./scripts/backup-db.sh
```

## Restore if Needed

If something goes wrong:
```bash
./scripts/restore-db.sh database/backups/full_backup_TIMESTAMP.sql
```
