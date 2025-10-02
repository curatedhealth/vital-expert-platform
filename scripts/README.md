# Scripts Directory

This directory contains utility scripts for development, testing, and maintenance of the VITAL Path platform.

## Organization

### `/archive/`
Historical scripts that are no longer actively used but preserved for reference.

### `/maintenance/`
Database maintenance, cleanup, and optimization scripts.

### `/migration/`
Database migration runners and utilities.

### `/setup/`
Initial setup and configuration scripts.

### `/testing/`
Test scripts and validation utilities.

## Root-Level Scripts

### Database Scripts
- `check-tables.js` - Verify database table structure
- `auto_fix_eslint.js` - Automated ESLint fixing

### Agent Management
- Various agent import, update, and verification scripts
- Organizational structure management scripts

## Usage

Most scripts require environment variables to be set. Make sure you have a valid `.env.local` file configured before running scripts.

```bash
# Example: Run a database check
node scripts/check-tables.js

# Example: Run with TypeScript
npx tsx scripts/check-database-schema.ts
```

## Important Notes

⚠️ **Production Warning**: Many of these scripts interact directly with the database. Always:
1. Test in development first
2. Backup your data before running migration scripts
3. Review the script code before execution
4. Use caution with scripts that modify data

## Archive Policy

Scripts are moved to `/archive/` when:
- They are no longer needed for active development
- They have been replaced by newer versions
- They served a one-time migration purpose

Scripts are NOT deleted to maintain git history and allow recovery if needed.
