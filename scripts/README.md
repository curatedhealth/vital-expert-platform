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

---

## 🔧 Infrastructure Scripts

### Environment Validation

**validate-environment.ts** - Validates all required environment variables before deployment

```bash
npm run validate:env
# or
tsx scripts/validate-environment.ts
```

**What it checks**:
- ✅ Required Supabase credentials
- ✅ OpenAI API key configuration
- ✅ Redis configuration (optional)
- ✅ Database pool settings
- ✅ URL format validation
- ✅ API key format validation

**Exit Codes**:
- `0` - All validations passed
- `1` - Critical validations failed
- `2` - Warning validations failed (optional vars missing)

### Database Migrations

**run-migrations.ts** - Manages database schema migrations with transaction support

```bash
# Check migration status
npm run migrate:status

# Preview what will be executed (dry run)
npm run migrate:dry-run

# Apply all pending migrations
npm run migrate
```

**Migration File Format**: `YYYYMMDDHHMMSS_description.sql`

Example: `20251025000000_add_performance_indexes.sql`

**Location**: `database/sql/migrations/YYYY/`

**Features**:
- Automatic migration tracking in `schema_migrations` table
- Checksum validation to prevent modified migrations
- Dry-run mode for preview
- Transaction support
- Detailed execution logging

⚠️ **Note**: For production migrations, use Supabase CLI (`npx supabase db push`) or direct psql.

---

## 📋 NPM Scripts

The following scripts are available via `npm run`:

```bash
# Environment & Infrastructure
npm run validate:env       # Validate environment variables
npm run migrate            # Run database migrations
npm run migrate:status     # Check migration status
npm run migrate:dry-run    # Preview migrations without applying

# Development
npm run dev               # Start development server
npm run build             # Build for production
npm run type-check        # TypeScript type checking
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix ESLint issues

# Testing
npm run test              # Run all tests
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:coverage     # Run tests with coverage
npm run test:ci           # CI-optimized test run
```

---

## 🚀 Quick Start for New Developers

1. **Clone repository and install dependencies**:
```bash
git clone <repo-url>
cd vital-path
npm install
```

2. **Set up environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
npm run validate:env
```

3. **Run database migrations**:
```bash
npm run migrate:status
npm run migrate
```

4. **Start development server**:
```bash
npm run dev
```

---

## 📚 Additional Documentation

- [SECURITY_HARDENING_GUIDE.md](../SECURITY_HARDENING_GUIDE.md) - Security implementation details
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [MIGRATION_EXAMPLES.md](../MIGRATION_EXAMPLES.md) - Code migration examples

---

**Last Updated**: 2025-01-25
