# Complete Supabase Data Export Guide

This guide will help you export ALL data from your current Supabase project for migration to a new project.

## What Gets Exported

### 1. Database Export (`export_supabase_data.sh`)
- ✅ Complete database schema (tables, views, functions, triggers)
- ✅ All table data (as SQL inserts)
- ✅ Individual tables as JSON and CSV
- ✅ Migration history
- ✅ Edge functions code
- ✅ RLS policies
- ✅ Database metadata and statistics
- ✅ Storage bucket configuration

### 2. Storage Files Export (`export_storage_files.py`)
- ✅ All files from all storage buckets
- ✅ Bucket configurations
- ✅ File metadata

## Prerequisites

```bash
# Install required tools
brew install postgresql  # For pg_dump and psql
pip3 install python-dotenv requests  # For Python scripts
```

## Export Steps

### Step 1: Export Database

Run the main export script:

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
./scripts/utilities/export_supabase_data.sh
```

This will create:
- `database_exports/export_YYYYMMDD_HHMMSS/` - Full export directory
- `database_exports/export_YYYYMMDD_HHMMSS.tar.gz` - Compressed backup

**What's included:**
- `schema/complete_schema.sql` - Full database schema
- `data/complete_data.sql` - All data as INSERT statements
- `data/tables/*.json` - Individual tables as JSON
- `data/tables/*.csv` - Individual tables as CSV
- `migrations/` - All migration files
- `functions/` - Edge functions
- `storage/` - Bucket configuration
- `metadata/` - Database statistics

### Step 2: Export Storage Files

Run the storage export script:

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
python3 scripts/utilities/export_storage_files.py
```

This will create:
- `database_exports/storage_export_YYYYMMDD_HHMMSS/` - All storage files organized by bucket
- `storage_metadata.json` - Metadata about buckets and files

### Step 3: Verify Exports

Check the export directories:

```bash
# List database export
ls -lh database_exports/export_*/

# Check compressed file size
ls -lh database_exports/*.tar.gz

# List storage export
ls -lh database_exports/storage_export_*/
```

## What You'll Get

### Database Export Structure
```
export_YYYYMMDD_HHMMSS/
├── BACKUP_SUMMARY.txt          # Summary of the backup
├── RESTORE_INSTRUCTIONS.md     # How to restore
├── export.log                  # Detailed log
├── schema/
│   ├── complete_schema.sql     # Full schema DDL
│   └── rls_policies.txt        # RLS policies
├── data/
│   ├── complete_data.sql       # All data
│   └── tables/
│       ├── table1.json         # Individual table as JSON
│       ├── table1.csv          # Individual table as CSV
│       └── ...
├── migrations/                 # All migration files
├── functions/                  # Edge functions
├── storage/
│   ├── buckets_config.json     # Bucket configurations
│   └── objects_list.json       # List of all objects
└── metadata/
    ├── table_sizes.txt         # Table size information
    └── row_counts.txt          # Row counts per table
```

### Storage Export Structure
```
storage_export_YYYYMMDD_HHMMSS/
├── STORAGE_RESTORE_INSTRUCTIONS.md
├── storage_metadata.json
├── bucket1/
│   └── [all files from bucket1]
├── bucket2/
│   └── [all files from bucket2]
└── ...
```

## Restore to New Project

### Option 1: Complete Restore (Recommended)

1. **Create New Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for it to initialize

2. **Get Connection Details**
   ```bash
   # From new project settings, get:
   # - Database URL
   # - Service role key
   ```

3. **Restore Schema**
   ```bash
   # Extract if needed
   tar -xzf database_exports/export_YYYYMMDD_HHMMSS.tar.gz

   # Restore schema
   psql "<NEW_DATABASE_URL>" -f database_exports/export_YYYYMMDD_HHMMSS/schema/complete_schema.sql
   ```

4. **Restore Data**
   ```bash
   psql "<NEW_DATABASE_URL>" -f database_exports/export_YYYYMMDD_HHMMSS/data/complete_data.sql
   ```

5. **Deploy Edge Functions**
   ```bash
   # Copy functions to new project
   cp -r database_exports/export_YYYYMMDD_HHMMSS/functions/* supabase/functions/

   # Deploy
   supabase functions deploy
   ```

6. **Restore Storage Files**
   - Use Supabase Dashboard to create buckets with same configuration
   - Upload files manually or use the Python import script (to be created)

### Option 2: Selective Restore

If you only need specific tables:

```bash
# Restore specific table from CSV
psql "<NEW_DATABASE_URL>" -c "\COPY table_name FROM 'database_exports/export_*/data/tables/table_name.csv' CSV HEADER"

# Or from JSON using custom import script
```

### Option 3: Using Supabase CLI

```bash
# Initialize new project
supabase init

# Link to new project
supabase link --project-ref <new-project-ref>

# Copy migrations
cp database_exports/export_*/migrations/* supabase/migrations/

# Push migrations
supabase db push

# Note: You'll still need to import data separately
```

## Verification Checklist

After restore, verify:

- [ ] All tables exist
- [ ] Row counts match (check `metadata/row_counts.txt`)
- [ ] RLS policies are active
- [ ] Edge functions are deployed
- [ ] Storage buckets exist
- [ ] Storage files are uploaded
- [ ] Auth settings configured
- [ ] API keys regenerated

## Important Notes

⚠️ **Security**
- Never commit exports to Git
- Store backups in secure location
- Regenerate API keys in new project
- Update environment variables

⚠️ **Data Integrity**
- Compare row counts before and after
- Test critical queries
- Verify foreign key relationships

⚠️ **What's NOT Included**
- User passwords (handled by Supabase Auth)
- API keys (must regenerate)
- Webhooks (must reconfigure)
- Custom domain settings

## Troubleshooting

### pg_dump not found
```bash
brew install postgresql
```

### Permission denied
```bash
chmod +x scripts/utilities/export_supabase_data.sh
chmod +x scripts/utilities/export_storage_files.py
```

### Connection timeout
- Check firewall settings
- Verify database URL and credentials
- Ensure your IP is whitelisted in Supabase

### Large data export timeout
- Export individual tables separately
- Use the JSON/CSV exports for large tables
- Consider using Supabase's built-in backup features

## Quick Reference

```bash
# Full database export
./scripts/utilities/export_supabase_data.sh

# Storage files export
python3 scripts/utilities/export_storage_files.py

# List all exports
ls -lh database_exports/

# Extract compressed backup
tar -xzf database_exports/export_*.tar.gz

# Quick restore (replace <DB_URL>)
psql "<DB_URL>" -f database_exports/export_*/schema/complete_schema.sql
psql "<DB_URL>" -f database_exports/export_*/data/complete_data.sql
```

## Support

For issues or questions:
- Check export logs: `database_exports/export_*/export.log`
- Review Supabase documentation: https://supabase.com/docs
- Supabase support: https://supabase.com/support

---

**Generated for VITAL Path Project**
**Export Date:** $(date)
