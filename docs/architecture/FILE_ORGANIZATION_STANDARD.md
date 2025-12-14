# VITAL Platform - File Organization Standard

**Version:** 1.0  
**Date:** December 14, 2025  
**Last Updated:** December 14, 2025  
**Status:** Production Standard  
**Purpose:** Comprehensive file organization, tagging, naming, and taxonomy system

---

## Table of Contents

1. [File Location Standards](#1-file-location-standards)
2. [File Naming Conventions](#2-file-naming-conventions)
3. [File Header Metadata](#3-file-header-metadata)
4. [File Tagging System](#4-file-tagging-system)
5. [Taxonomy & Classification](#5-taxonomy--classification)
6. [Versioning Standards](#6-versioning-standards)
7. [Dependency Tracking](#7-dependency-tracking)
8. [Directory Structure Rules](#8-directory-structure-rules)
9. [File Lifecycle Management](#9-file-lifecycle-management)
10. [Examples & Templates](#10-examples--templates)

---

## 1. File Location Standards

### 1.1 Directory Hierarchy Rules

Files must be located based on their **purpose** and **layer** in the architecture:

```
vital-path/
├── apps/                          # Deployable applications
│   └── vital-system/             # Frontend (Next.js)
│       ├── src/
│       │   ├── app/              # Routes (Next.js App Router)
│       │   ├── components/       # Shared UI components
│       │   ├── features/         # Feature modules
│       │   ├── lib/              # Utilities & services
│       │   ├── types/            # TypeScript types
│       │   └── config/           # Configuration
│       └── public/               # Static assets
│
├── services/                      # Backend services
│   └── ai-engine/                # AI Engine (FastAPI)
│       └── src/
│           ├── api/              # API layer
│           ├── domain/           # Domain layer
│           ├── infrastructure/   # Infrastructure layer
│           └── workers/          # Async workers
│
├── packages/                      # Shared packages
│   ├── protocol/                 # Type contracts
│   ├── ui/                       # UI components
│   └── sdk/                      # Client SDK
│
├── database/                      # Database management
│   ├── migrations/               # SQL migrations
│   ├── policies/                 # RLS policies
│   └── seeds/                   # Seed data
│
├── docs/                          # Public documentation
│   ├── guides/                   # Developer guides
│   ├── api/                      # API documentation
│   └── architecture/             # Architecture docs
│
└── .claude/docs/                  # Internal documentation
    ├── services/                 # Service-specific docs
    ├── platform/                 # Platform features
    └── operations/               # Operations docs
```

### 1.2 File Location Decision Tree

```
Is it deployable code?
├── YES → Is it frontend?
│   ├── YES → apps/vital-system/src/
│   └── NO → Is it backend?
│       └── YES → services/ai-engine/src/
│
├── NO → Is it shared code?
│   ├── YES → packages/
│   └── NO → Is it documentation?
│       ├── YES → Is it public?
│       │   ├── YES → docs/
│       │   └── NO → .claude/docs/
│       └── NO → Is it database?
│           └── YES → database/
```

---

## 2. File Naming Conventions

### 2.1 Universal Rules

| Rule | Example | ❌ Bad Example |
|------|---------|----------------|
| **kebab-case** for files | `user-profile.tsx` | `UserProfile.tsx`, `user_profile.tsx` |
| **PascalCase** for React components | `UserProfile.tsx` | `user-profile.tsx` |
| **snake_case** for Python files | `user_service.py` | `userService.py`, `user-service.py` |
| **Descriptive names** | `agent-selector-service.ts` | `service.ts`, `selector.ts` |
| **No abbreviations** | `authentication-middleware.ts` | `auth-mw.ts` |
| **Include type suffix** | `user.types.ts`, `user.service.ts` | `user.ts` (ambiguous) |

### 2.2 File Type Suffixes

| Type | Suffix | Example |
|------|--------|---------|
| TypeScript types | `.types.ts` | `user.types.ts` |
| TypeScript service | `.service.ts` | `auth.service.ts` |
| TypeScript hook | `.hook.ts` or `use*.ts` | `useAuth.ts` |
| TypeScript component | `.tsx` | `UserProfile.tsx` |
| Python module | `.py` | `user_service.py` |
| Python test | `test_*.py` | `test_user_service.py` |
| SQL migration | `YYYYMMDD_description.sql` | `20251214_add_users_table.sql` |
| Configuration | `.config.*` | `database.config.ts` |
| Documentation | `.md` | `deployment-guide.md` |

### 2.3 Special File Names

| Purpose | Name | Location |
|---------|------|----------|
| Main entry point | `main.py`, `index.ts` | Root of module |
| Configuration | `config.ts`, `settings.py` | Root of module |
| Types/Interfaces | `types.ts`, `models.py` | `types/` or `models/` |
| Constants | `constants.ts`, `constants.py` | Root of module |
| Utilities | `utils.ts`, `helpers.py` | `utils/` or `helpers/` |
| Tests | `*.test.ts`, `test_*.py` | `__tests__/` or `tests/` |

---

## 3. File Header Metadata

### 3.1 Required Header Format

Every production file **must** include a header with metadata:

#### TypeScript/JavaScript Files

```typescript
/**
 * @fileoverview Brief description of file purpose
 * 
 * @production PRODUCTION_READY | PRODUCTION_CORE | NEEDS_REVIEW | EXPERIMENTAL | DEPRECATED | ARCHIVE | STUB
 * @lastVerified YYYY-MM-DD
 * @version MAJOR.MINOR.PATCH
 * @category api | feature | component | service | utility | type | config
 * @layer frontend | backend | shared | infrastructure
 * 
 * @dependencies
 * - package:name@version (reason)
 * - ./relative/path (reason)
 * 
 * @dependents
 * - ./relative/path (reason)
 * 
 * @author Team/Individual Name
 * @created YYYY-MM-DD
 * @updated YYYY-MM-DD
 */
```

#### Python Files

```python
"""
File: filename.py
Purpose: Brief description of file purpose

PRODUCTION_TAG: PRODUCTION_READY | PRODUCTION_CORE | NEEDS_REVIEW | EXPERIMENTAL | DEPRECATED | ARCHIVE | STUB
LAST_VERIFIED: YYYY-MM-DD
VERSION: MAJOR.MINOR.PATCH
CATEGORY: api | service | domain | infrastructure | worker | test
LAYER: api | domain | infrastructure | worker

DEPENDENCIES:
- package==version (reason)
- module.path (reason)

DEPENDENTS:
- module.path (reason)

AUTHOR: Team/Individual Name
CREATED: YYYY-MM-DD
UPDATED: YYYY-MM-DD
"""
```

#### SQL Migration Files

```sql
-- Migration: YYYYMMDD_description
-- Purpose: Brief description of migration
-- 
-- PRODUCTION_TAG: PRODUCTION_READY
-- LAST_VERIFIED: YYYY-MM-DD
-- VERSION: MAJOR.MINOR.PATCH
-- CATEGORY: schema | data | policy | function
-- 
-- DEPENDENCIES:
-- - migration: YYYYMMDD_previous_migration (reason)
-- 
-- ROLLBACK: YYYYMMDD_rollback_description.sql
-- 
-- AUTHOR: Team/Individual Name
-- CREATED: YYYY-MM-DD
```

### 3.2 Header Field Definitions

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| `@production` / `PRODUCTION_TAG` | ✅ Yes | Tag from system | Production readiness status |
| `@lastVerified` / `LAST_VERIFIED` | ✅ Yes | `YYYY-MM-DD` | Last verification date |
| `@version` / `VERSION` | ✅ Yes | `MAJOR.MINOR.PATCH` | File version |
| `@category` / `CATEGORY` | ✅ Yes | From taxonomy | File category |
| `@layer` / `LAYER` | ✅ Yes | Architecture layer | Architecture layer |
| `@dependencies` / `DEPENDENCIES` | ⚠️ If any | List | External dependencies |
| `@dependents` / `DEPENDENTS` | ⚠️ If tracked | List | Files that depend on this |
| `@author` / `AUTHOR` | ✅ Yes | Name | Creator/maintainer |
| `@created` / `CREATED` | ✅ Yes | `YYYY-MM-DD` | Creation date |
| `@updated` / `UPDATED` | ✅ Yes | `YYYY-MM-DD` | Last update date |

---

## 4. File Tagging System

### 4.1 Production Tags

| Tag | Meaning | Use When | Action |
|-----|---------|----------|--------|
| `PRODUCTION_READY` | ✅ Fully tested, documented, deployed | File is production-ready | Keep as-is |
| `PRODUCTION_CORE` | ✅ Critical infrastructure | File is essential for system | Keep as-is, never delete |
| `NEEDS_REVIEW` | ⚠️ Works but needs improvement | File works but needs refactoring | Review for optimization |
| `EXPERIMENTAL` | 🧪 Prototype/experimental | File is experimental | Consider removal before production |
| `DEPRECATED` | ❌ Old implementation | File is superseded | Safe to remove after migration |
| `ARCHIVE` | 📦 Reference only | File kept for reference | Move to archive, not deployed |
| `STUB` | 🔨 Placeholder | File is incomplete | Complete or remove |

### 4.2 Tag Assignment Rules

1. **New files** start as `EXPERIMENTAL` or `STUB`
2. **After testing** → `NEEDS_REVIEW` or `PRODUCTION_READY`
3. **Critical files** → `PRODUCTION_CORE`
4. **Replaced files** → `DEPRECATED` (with migration path)
5. **Historical files** → `ARCHIVE`

### 4.3 Tag Verification Workflow

```
New File Created
    ↓
Tag: EXPERIMENTAL or STUB
    ↓
Development & Testing
    ↓
Tag: NEEDS_REVIEW or PRODUCTION_READY
    ↓
Code Review
    ↓
Tag: PRODUCTION_READY
    ↓
Deployed to Production
    ↓
Regular Verification (update LAST_VERIFIED)
```

---

## 5. Taxonomy & Classification

### 5.1 Category Taxonomy

#### Frontend Categories

| Category | Use For | Example Files |
|----------|---------|---------------|
| `api` | API routes, handlers | `api/ask-expert/route.ts` |
| `feature` | Feature modules | `features/ask-expert/` |
| `component` | UI components | `components/Button.tsx` |
| `service` | Business logic services | `services/auth.service.ts` |
| `utility` | Helper functions | `utils/format.ts` |
| `type` | TypeScript types | `types/user.types.ts` |
| `config` | Configuration files | `config/env.ts` |
| `hook` | React hooks | `hooks/useAuth.ts` |

#### Backend Categories

| Category | Use For | Example Files |
|----------|---------|---------------|
| `api` | API routes, endpoints | `api/routes/mode1.py` |
| `service` | Business logic services | `services/agent_service.py` |
| `domain` | Domain entities, models | `domain/entities/agent.py` |
| `infrastructure` | External integrations | `infrastructure/llm/client.py` |
| `worker` | Async task workers | `workers/tasks/execution.py` |
| `test` | Test files | `tests/unit/test_agent.py` |
| `config` | Configuration | `config/settings.py` |

#### Database Categories

| Category | Use For | Example Files |
|----------|---------|---------------|
| `schema` | Table/column changes | `20251214_add_users_table.sql` |
| `data` | Data migrations | `20251214_seed_agents.sql` |
| `policy` | RLS policies | `20251214_user_policies.sql` |
| `function` | Database functions | `20251214_calculate_score.sql` |

### 5.2 Layer Taxonomy

| Layer | Purpose | Location Pattern |
|-------|---------|------------------|
| `frontend` | Client-side code | `apps/vital-system/src/` |
| `backend` | Server-side code | `services/ai-engine/src/` |
| `shared` | Shared code | `packages/` |
| `infrastructure` | Infrastructure code | `services/ai-engine/src/infrastructure/` |
| `database` | Database code | `database/` |
| `documentation` | Documentation | `docs/` or `.claude/docs/` |

---

## 6. Versioning Standards

### 6.1 Semantic Versioning

Files use **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible

### 6.2 Version Update Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change | MAJOR | `1.0.0` → `2.0.0` |
| New feature | MINOR | `1.0.0` → `1.1.0` |
| Bug fix | PATCH | `1.0.0` → `1.0.1` |
| Documentation only | PATCH | `1.0.0` → `1.0.1` |

### 6.3 Version Tracking

- **File header** contains current version
- **Changelog** (optional) tracks version history
- **Git tags** track major versions (if applicable)

---

## 7. Dependency Tracking

### 7.1 Dependency Types

| Type | Format | Example |
|------|--------|---------|
| Package dependency | `package:name@version` | `package:@supabase/supabase-js@2.38.0` |
| Internal module | `./relative/path` | `./services/auth.service` |
| External service | `service:name` | `service:openai-api` |
| Database | `database:table` | `database:users` |

### 7.2 Dependency Documentation

**Required for:**
- External packages
- Critical internal dependencies
- Database dependencies
- Service dependencies

**Optional for:**
- Utility dependencies
- Type-only dependencies

### 7.3 Dependency Update Workflow

1. **Add dependency** → Update header `@dependencies`
2. **Remove dependency** → Update header, remove from list
3. **Update dependency** → Update version in header
4. **Breaking change** → Bump file version (MAJOR)

---

## 8. Directory Structure Rules

### 8.1 Directory Naming

| Type | Convention | Example |
|------|------------|---------|
| Feature directories | `kebab-case` | `ask-expert/` |
| Component directories | `kebab-case` | `ui-components/` |
| Service directories | `kebab-case` | `auth-service/` |
| Utility directories | `kebab-case` | `format-utils/` |

### 8.2 Directory Depth Rules

- **Maximum depth**: 5 levels from root
- **Recommended depth**: 3-4 levels
- **Exception**: Test files can be deeper if needed

### 8.3 Directory Organization

```
feature-name/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── services/           # Feature-specific services
├── types/              # Feature-specific types
├── utils/              # Feature-specific utilities
└── index.ts            # Public API exports
```

---

## 9. File Lifecycle Management

### 9.1 File States

```
CREATED (EXPERIMENTAL/STUB)
    ↓
DEVELOPMENT (NEEDS_REVIEW)
    ↓
TESTED (PRODUCTION_READY)
    ↓
DEPLOYED (PRODUCTION_READY)
    ↓
MAINTAINED (PRODUCTION_READY)
    ↓
DEPRECATED (DEPRECATED)
    ↓
ARCHIVED (ARCHIVE)
```

### 9.2 File Cleanup Rules

| Tag | Cleanup Action | Timeline |
|-----|----------------|----------|
| `DEPRECATED` | Remove after migration | 30 days |
| `ARCHIVE` | Move to archive folder | Immediate |
| `STUB` | Complete or remove | 14 days |
| `EXPERIMENTAL` | Review for production | Before release |

### 9.3 File Verification Schedule

- **PRODUCTION_READY**: Verify every 3 months
- **PRODUCTION_CORE**: Verify every 6 months
- **NEEDS_REVIEW**: Verify every month
- **DEPRECATED**: Remove after 30 days

---

## 10. Examples & Templates

### 10.1 TypeScript Component Example

```typescript
/**
 * @fileoverview User profile component with authentication
 * 
 * @production PRODUCTION_READY
 * @lastVerified 2025-12-14
 * @version 1.2.0
 * @category component
 * @layer frontend
 * 
 * @dependencies
 * - package:@supabase/supabase-js@2.38.0 (authentication)
 * - ./hooks/useAuth.ts (auth state)
 * - ./types/user.types.ts (user types)
 * 
 * @dependents
 * - ./features/profile/page.tsx (uses this component)
 * 
 * @author Platform Team
 * @created 2025-11-01
 * @updated 2025-12-14
 */

import { useAuth } from './hooks/useAuth';
import type { User } from './types/user.types';

export function UserProfile() {
  // Component implementation
}
```

### 10.2 Python Service Example

```python
"""
File: agent_service.py
Purpose: Agent selection and management service

PRODUCTION_TAG: PRODUCTION_READY
LAST_VERIFIED: 2025-12-14
VERSION: 2.1.0
CATEGORY: service
LAYER: domain

DEPENDENCIES:
- langchain==0.1.0 (agent framework)
- supabase==2.0.0 (database)
- services.agent_selector (agent selection logic)

DEPENDENTS:
- api.routes.mode1 (uses this service)
- api.routes.mode2 (uses this service)

AUTHOR: AI Engine Team
CREATED: 2025-10-15
UPDATED: 2025-12-14
"""

from langchain import agents
from supabase import create_client

class AgentService:
    # Service implementation
    pass
```

### 10.3 SQL Migration Example

```sql
-- Migration: 20251214_add_agents_table
-- Purpose: Create agents table with RLS policies
-- 
-- PRODUCTION_TAG: PRODUCTION_READY
-- LAST_VERIFIED: 2025-12-14
-- VERSION: 1.0.0
-- CATEGORY: schema
-- 
-- DEPENDENCIES:
-- - migration: 20251201_create_tenants_table (tenant_id foreign key)
-- 
-- ROLLBACK: 20251214_rollback_agents_table.sql
-- 
-- AUTHOR: Database Team
-- CREATED: 2025-12-14

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant agents"
    ON agents FOR SELECT
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 10.4 Configuration File Example

```typescript
/**
 * @fileoverview Environment configuration and validation
 * 
 * @production PRODUCTION_CORE
 * @lastVerified 2025-12-14
 * @version 1.0.0
 * @category config
 * @layer frontend
 * 
 * @dependencies
 * - package:zod@3.22.0 (schema validation)
 * 
 * @dependents
 * - All files that use environment variables
 * 
 * @author Platform Team
 * @created 2025-11-01
 * @updated 2025-12-14
 */

import { z } from 'zod';

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
});
```

---

## 11. Enforcement & Validation

### 11.1 Automated Checks

Create scripts to validate:
- ✅ File headers present
- ✅ Required fields filled
- ✅ Tags are valid
- ✅ Version format correct
- ✅ Dates are valid
- ✅ Dependencies listed

### 11.2 Pre-commit Hooks

Add pre-commit hooks to:
- Check file headers
- Validate tags
- Verify version format
- Check file location

### 11.3 Code Review Checklist

- [ ] File header present and complete
- [ ] Tag is appropriate
- [ ] Version updated if needed
- [ ] Dependencies documented
- [ ] File location is correct
- [ ] Naming follows conventions

---

## 12. Migration Guide

### 12.1 Existing Files

For existing files without headers:

1. **Add header** with current information
2. **Tag appropriately** based on current state
3. **Set version** to `1.0.0` (or current version)
4. **Document dependencies** (if critical)
5. **Update `LAST_VERIFIED`** to today's date

### 12.2 Bulk Update Script

Create script to:
- Add headers to files without them
- Tag files based on location/name
- Set default version to `1.0.0`
- Set `LAST_VERIFIED` to file modification date

---

## 13. Quick Reference

### File Header Checklist

- [ ] `@production` tag set
- [ ] `@lastVerified` date set
- [ ] `@version` set
- [ ] `@category` set
- [ ] `@layer` set
- [ ] `@dependencies` listed (if any)
- [ ] `@author` set
- [ ] `@created` date set
- [ ] `@updated` date set

### File Location Checklist

- [ ] File is in correct directory based on purpose
- [ ] Directory name follows conventions
- [ ] File name follows conventions
- [ ] File type suffix is correct
- [ ] No duplicate files

### Tag Selection Guide

```
Is file critical infrastructure?
├── YES → PRODUCTION_CORE
└── NO → Is file production-ready?
    ├── YES → PRODUCTION_READY
    └── NO → Is file experimental?
        ├── YES → EXPERIMENTAL
        └── NO → Is file incomplete?
            ├── YES → STUB
            └── NO → NEEDS_REVIEW
```

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Status:** Production Standard  
**Maintained By:** Platform Team
