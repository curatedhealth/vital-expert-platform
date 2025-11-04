# VITAL Platform - Root Folder Analysis

**Current Branch**: `restructure/world-class-architecture`
**Analysis Date**: October 25, 2025

---

## 🔍 Root Directory Overview

The root directory contains **42 folders**. These can be categorized as follows:

---

## ✅ **ACTIVE FOLDERS** (New Monorepo Structure)

These are the **primary folders** for the world-class monorepo:

### 1. **apps/** - Tenant Applications ✅ ACTIVE
**Role**: Multi-tenant frontend applications
**Status**: ✅ Core monorepo structure
**Contents**:
- `digital-health-startup/` - MVP app (active)
- `consulting/` - Consulting app (placeholder)
- `pharma/` - Pharma app (placeholder)
- `payers/` - Payers app (placeholder)

**Keep**: YES - Essential for monorepo

---

### 2. **packages/** - Shared Libraries ✅ ACTIVE
**Role**: Reusable packages across all apps
**Status**: ✅ Core monorepo structure
**Contents**:
- `ui/` - @vital/ui (40 components)
- `sdk/` - @vital/sdk (backend integration)
- `config/` - @vital/config (shared configs)
- `utils/` - @vital/utils (utilities)

**Keep**: YES - Essential for monorepo

---

### 3. **services/** - Backend Services ✅ ACTIVE
**Role**: Backend microservices
**Status**: ✅ Core monorepo structure
**Contents**:
- `ai-engine/` - Python FastAPI + LangChain
- `api-gateway/` - Node.js gateway (placeholder)

**Keep**: YES - Backend services

---

### 4. **docs/** - Documentation ✅ ACTIVE
**Role**: All project documentation
**Status**: ✅ Core monorepo structure
**Contents**:
- `architecture/` - System design docs
- `api/` - API documentation
- `guides/` - Development guides
- `archive/` - Historical docs (62 files)

**Keep**: YES - Documentation hub

---

### 5. **database/** - Database Layer ✅ ACTIVE
**Role**: Database migrations, schemas, SQL scripts
**Status**: ✅ Core monorepo structure
**Contents**:
- `sql/migrations/` - Database migrations
- `sql/seeds/` - Seed data
- `sql/functions/` - PostgreSQL functions
- `sql/policies/` - RLS policies

**Keep**: YES - Database management

---

### 6. **scripts/** - Automation Scripts ✅ ACTIVE
**Role**: Build, deployment, and utility scripts
**Status**: ✅ Core monorepo structure
**Contents**:
- `update-imports.sh` - Import path updater
- `validate-environment.ts` - Env validation
- `run-migrations.ts` - DB migrations
- `seed-*.js` - Data seeding

**Keep**: YES - Build automation

---

## ⚠️ **LEGACY/OLD STRUCTURE FOLDERS** (From Before Restructure)

These folders are **remnants of the old single-app structure** and are now redundant:

### 7. **app/** - Old Next.js App Directory ⚠️ DUPLICATE
**Role**: Old Next.js app router pages (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/app/`
**Contents**: (app), (auth), api/, admin/, etc.

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 8. **components/** - Old Components ⚠️ DUPLICATE
**Role**: Old React components (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/components/`
**Contents**: UI components, layouts, etc.

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 9. **lib/** - Old Libraries ⚠️ DUPLICATE
**Role**: Old utility libraries (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/lib/`
**Contents**: Utils, services, helpers

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 10. **hooks/** - Old Custom Hooks ⚠️ DUPLICATE
**Role**: Old React hooks (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/hooks/`
**Contents**: Custom React hooks

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 11. **features/** - Old Features ⚠️ DUPLICATE
**Role**: Old feature modules (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/features/`
**Contents**: Feature modules

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 12. **contexts/** - Old React Contexts ⚠️ DUPLICATE
**Role**: Old React context providers (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/contexts/`
**Contents**: Context providers

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 13. **middleware/** - Old Middleware ⚠️ DUPLICATE
**Role**: Old Next.js middleware (before restructure)
**Status**: ⚠️ DUPLICATE of `apps/digital-health-startup/src/middleware/`
**Contents**: Middleware files

**Recommendation**: ❌ DELETE - Duplicated in apps/digital-health-startup/

---

### 14. **shared/** - Old Shared Code ⚠️ DUPLICATE
**Role**: Old shared utilities (before restructure)
**Status**: ⚠️ NOW in packages/
**Contents**: Shared types, utils

**Recommendation**: ❌ DELETE - Moved to packages/

---

### 15. **config/** - Old Config ⚠️ DUPLICATE
**Role**: Old configuration files (before restructure)
**Status**: ⚠️ NOW in packages/config/
**Contents**: Config files

**Recommendation**: ❌ DELETE - Moved to packages/config/

---

### 16. **types/** - Old Types ⚠️ DUPLICATE
**Role**: Old TypeScript type definitions (before restructure)
**Status**: ⚠️ NOW in packages/sdk/src/types/
**Contents**: Type definitions

**Recommendation**: ❌ DELETE - Moved to packages/sdk/

---

### 17. **agents/** - Old Agent Files ⚠️ DUPLICATE
**Role**: Old agent implementations (before restructure)
**Status**: ⚠️ DUPLICATE of services/ai-engine/
**Contents**: Agent classes, Python files

**Recommendation**: ❌ DELETE - Moved to services/ai-engine/

---

## 🗂️ **SPECIAL PURPOSE FOLDERS**

### 18. **supabase/** - Supabase Configuration ✅ KEEP
**Role**: Supabase local development config
**Status**: ✅ Active - Used for local Supabase instance
**Contents**:
- `config.toml` - Supabase config
- `seed.sql` - Local seed data
- `migrations/` - Supabase migrations

**Recommendation**: ✅ KEEP - Required for Supabase local dev

---

### 19. **backend/** - Old Backend Services ⚠️ DUPLICATE
**Role**: Old Python backend (before restructure)
**Status**: ⚠️ DUPLICATE of services/ai-engine/
**Contents**: Python AI services

**Recommendation**: ❌ DELETE - Consolidated into services/ai-engine/

---

### 20. **python-services/** - Old Python Services ⚠️ DUPLICATE
**Role**: Another old Python backend (before restructure)
**Status**: ⚠️ DUPLICATE of services/ai-engine/
**Contents**: Python services

**Recommendation**: ❌ DELETE - Consolidated into services/ai-engine/

---

### 21. **tools/** - Development Tools ⚠️ EVALUATE
**Role**: Development utilities and tools
**Status**: ⚠️ May contain useful scripts
**Contents**: Unknown - needs inspection

**Recommendation**: ⚠️ INSPECT - Move useful scripts to scripts/

---

### 22. **tests/** - Old Test Files ⚠️ EVALUATE
**Role**: Old test files (before restructure)
**Status**: ⚠️ Tests now in apps/*/src/__tests__/
**Contents**: Test files

**Recommendation**: ⚠️ INSPECT - Move to apps/ or delete

---

### 23. **test/** - Old Test Files ⚠️ DUPLICATE
**Role**: Another old test directory
**Status**: ⚠️ Duplicate of tests/
**Contents**: Test files

**Recommendation**: ❌ DELETE - Consolidated into tests/

---

### 24. **cypress/** - E2E Tests ⚠️ EVALUATE
**Role**: Cypress end-to-end tests
**Status**: ⚠️ May still be useful
**Contents**: Cypress test specs

**Recommendation**: ⚠️ INSPECT - Move to apps/digital-health-startup/

---

## 📦 **BUILD/DEPLOYMENT FOLDERS**

### 25. **.next/** - Next.js Build Output ✅ AUTO-GENERATED
**Role**: Next.js build cache
**Status**: ✅ Auto-generated, ignored by git
**Contents**: Build artifacts

**Recommendation**: ✅ KEEP - Auto-generated (in .gitignore)

---

### 26. **node_modules/** - Dependencies ✅ AUTO-GENERATED
**Role**: npm/pnpm dependencies
**Status**: ✅ Auto-generated, ignored by git
**Contents**: Node packages

**Recommendation**: ✅ KEEP - Auto-generated (in .gitignore)

---

### 27. **.vercel/** - Vercel Config ✅ AUTO-GENERATED
**Role**: Vercel deployment config
**Status**: ✅ Auto-generated
**Contents**: Vercel build info

**Recommendation**: ✅ KEEP - Vercel deployment

---

## 🔧 **INFRASTRUCTURE/DEPLOYMENT**

### 28. **k8s/** - Kubernetes Configs ⚠️ EVALUATE
**Role**: Kubernetes deployment configs
**Status**: ⚠️ May not be used (using Vercel)
**Contents**: K8s manifests

**Recommendation**: ⚠️ EVALUATE - Archive if not using K8s

---

### 29. **infrastructure/** - Infrastructure as Code ⚠️ EVALUATE
**Role**: Infrastructure configs
**Status**: ⚠️ May not be used
**Contents**: IaC files

**Recommendation**: ⚠️ EVALUATE - Keep if using Terraform/Pulumi

---

### 30. **monitoring/** - Monitoring Configs ⚠️ EVALUATE
**Role**: Monitoring and observability configs
**Status**: ⚠️ Using Langfuse now
**Contents**: Monitoring setup

**Recommendation**: ⚠️ EVALUATE - Keep relevant configs

---

## 📁 **DATA/BACKUP FOLDERS**

### 31. **archive/** - Archived Files ✅ KEEP
**Role**: Historical files and backups
**Status**: ✅ Useful for reference
**Contents**: Old project files

**Recommendation**: ✅ KEEP - Historical reference

---

### 32. **backups/** - Database Backups ✅ KEEP
**Role**: Database backup files
**Status**: ✅ Important backups
**Contents**: DB dumps

**Recommendation**: ✅ KEEP - Data safety

---

### 33. **data/** - Sample Data ⚠️ EVALUATE
**Role**: Sample/test data
**Status**: ⚠️ May be useful
**Contents**: Data files

**Recommendation**: ⚠️ EVALUATE - Move to database/seeds/

---

### 34. **sample-knowledge/** - Sample Knowledge Base ⚠️ EVALUATE
**Role**: Sample knowledge documents
**Status**: ⚠️ May be useful for testing
**Contents**: Sample docs

**Recommendation**: ⚠️ EVALUATE - Keep for testing

---

### 35. **exports/** - Exported Data ⚠️ EVALUATE
**Role**: Exported data files
**Status**: ⚠️ May be temporary
**Contents**: Export files

**Recommendation**: ⚠️ EVALUATE - Clean up old exports

---

## 🔌 **INTEGRATION/EXTERNAL**

### 36. **mcp-server/** - MCP Server ⚠️ EVALUATE
**Role**: Model Context Protocol server
**Status**: ⚠️ Unknown if active
**Contents**: MCP implementation

**Recommendation**: ⚠️ EVALUATE - Check if still used

---

### 37. **notion-setup/** - Notion Integration ⚠️ EVALUATE
**Role**: Notion integration setup
**Status**: ⚠️ May be for agent sync
**Contents**: Notion configs

**Recommendation**: ⚠️ INSPECT - Keep if using Notion sync

---

## 🗄️ **DATABASE FOLDERS**

### 38. **db/** - Database Files ⚠️ DUPLICATE
**Role**: Database-related files
**Status**: ⚠️ DUPLICATE of database/
**Contents**: DB files

**Recommendation**: ❌ DELETE - Consolidated into database/

---

### 39. **mock-database/** - Mock Database ⚠️ EVALUATE
**Role**: Mock database for testing
**Status**: ⚠️ May be useful for tests
**Contents**: Mock DB data

**Recommendation**: ⚠️ EVALUATE - Keep for integration tests

---

## 📝 **MISC/OTHER**

### 40. **examples/** - Example Code ⚠️ EVALUATE
**Role**: Example implementations
**Status**: ⚠️ May be useful for reference
**Contents**: Code examples

**Recommendation**: ⚠️ EVALUATE - Move to docs/examples/

---

### 41. **logs/** - Log Files ⚠️ CLEANUP
**Role**: Application logs
**Status**: ⚠️ Should be in .gitignore
**Contents**: Log files

**Recommendation**: ⚠️ CLEANUP - Add to .gitignore

---

### 42. **vital-platform/** - Unknown Subdirectory ❓ INSPECT
**Role**: Unknown - needs inspection
**Status**: ❓ May be duplicate or legacy
**Contents**: Unknown

**Recommendation**: ❓ INSPECT - Determine purpose

---

### 43. **packages.disabled/** - Disabled Packages ⚠️ CLEANUP
**Role**: Disabled/unused packages
**Status**: ⚠️ Legacy
**Contents**: Disabled code

**Recommendation**: ❌ DELETE - No longer needed

---

## 📊 **SUMMARY**

### Total Folders: 43

**Active/Keep** (11):
- ✅ apps/
- ✅ packages/
- ✅ services/
- ✅ docs/
- ✅ database/
- ✅ scripts/
- ✅ supabase/
- ✅ archive/
- ✅ backups/
- ✅ .next/ (auto)
- ✅ node_modules/ (auto)

**Delete/Duplicate** (17):
- ❌ app/
- ❌ components/
- ❌ lib/
- ❌ hooks/
- ❌ features/
- ❌ contexts/
- ❌ middleware/
- ❌ shared/
- ❌ config/
- ❌ types/
- ❌ agents/
- ❌ backend/
- ❌ python-services/
- ❌ test/
- ❌ db/
- ❌ packages.disabled/
- ❌ vital-platform/ (if duplicate)

**Evaluate/Inspect** (15):
- ⚠️ tools/
- ⚠️ tests/
- ⚠️ cypress/
- ⚠️ k8s/
- ⚠️ infrastructure/
- ⚠️ monitoring/
- ⚠️ data/
- ⚠️ sample-knowledge/
- ⚠️ exports/
- ⚠️ mcp-server/
- ⚠️ notion-setup/
- ⚠️ mock-database/
- ⚠️ examples/
- ⚠️ logs/
- ⚠️ vital-platform/

---

## 🎯 **RECOMMENDED CLEANUP ACTION**

### Phase 1: Safe Deletions (Space Savings: ~3-4GB)
```bash
# Delete obvious duplicates
rm -rf app/ components/ lib/ hooks/ features/ contexts/ middleware/
rm -rf shared/ config/ types/ agents/ backend/ python-services/
rm -rf test/ db/ packages.disabled/
```

### Phase 2: Inspect & Decide
```bash
# Inspect these folders first
ls -la tools/ tests/ cypress/ examples/
ls -la k8s/ infrastructure/ monitoring/
ls -la data/ sample-knowledge/ exports/
ls -la mcp-server/ notion-setup/ vital-platform/
```

### Phase 3: Move Useful Content
```bash
# Move useful scripts to scripts/
# Move useful tests to apps/digital-health-startup/cypress/
# Move useful docs to docs/
```

---

## ✅ **FINAL CLEAN STRUCTURE**

After cleanup, root should have only:

```
vital-platform/
├── apps/              ✅ Tenant apps
├── packages/          ✅ Shared packages
├── services/          ✅ Backend services
├── docs/              ✅ Documentation
├── database/          ✅ Database layer
├── scripts/           ✅ Automation
├── supabase/          ✅ Supabase config
├── archive/           ✅ Historical files
├── backups/           ✅ Database backups
├── .github/           ✅ CI/CD
├── .next/             ✅ Build (auto)
├── node_modules/      ✅ Deps (auto)
└── [config files]     ✅ Root configs
```

**Total**: ~15 folders (instead of 43)
**Space Saved**: ~3-4GB additional

---

**Analysis Date**: October 25, 2025
**Branch**: restructure/world-class-architecture
