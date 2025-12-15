# Migration Generation Scripts

**Location:** `database/shared/scripts/generation/`  
**Purpose:** Scripts for generating database migrations

---

## Scripts

- `extract-legacy-workflows.py` - Extracts legacy workflows and generates migrations
- `extract-task-library.py` - Extracts task library and generates migrations
- `generate-legacy-migration.ts` - Generates legacy content migrations
- `run_normalize_migration.py` - Generates normalization migrations

---

## Usage

### Generate Legacy Workflow Migration

```bash
python database/shared/scripts/generation/extract-legacy-workflows.py
```

### Generate Task Library Migration

```bash
python database/shared/scripts/generation/extract-task-library.py
```

---

**See Also:**
- [Database README](../README.md)
- Generated migrations: `database/postgres/migrations/`
