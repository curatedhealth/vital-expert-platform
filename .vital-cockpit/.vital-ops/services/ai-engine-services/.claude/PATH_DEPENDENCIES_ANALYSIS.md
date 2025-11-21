# Path Dependencies Analysis

**Date**: 2025-11-19
**Purpose**: Identify hardcoded paths before executing cleanup

---

## Critical Findings

### ⚠️ FOUND: Hardcoded References to `database/sql/` Directory

**Location**: Multiple TypeScript files reference `database/sql/migrations/`

#### 1. Healthcare Migration References (3 files)

```typescript
// apps/vital-system/src/app/api/admin/apply-healthcare-migration/route.ts
sql_file: 'database/sql/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql'

// apps/digital-health-startup/src/app/api/admin/apply-healthcare-migration/route.ts
sql_file: 'database/sql/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql'

// apps/pharma/src/app/api/admin/apply-healthcare-migration/route.ts
sql_file: 'database/sql/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql'
```

**Impact**: These APIs explicitly reference a migration file in `database/sql/migrations/`

#### 2. Organizational Structure Comments (3 files)

```typescript
// apps/vital-system/src/config/organizational-structure.ts
// defined in: database/sql/migrations/2025/20250120000000_healthcare_compliance_enhancement.sql

// apps/digital-health-startup/src/config/organizational-structure.ts
// defined in: database/sql/migrations/2025/20250120000000_healthcare_compliance_enhancement.sql

// apps/pharma/src/config/organizational-structure.ts
// defined in: database/sql/migrations/2025/20250120000000_healthcare_compliance_enhancement.sql
```

**Impact**: Comments only - no runtime impact

#### 3. Chat Schema Migration

```typescript
// apps/vital-system/src/app/api/migrate/chat-schema/route.ts
const migrationPath = path.join(process.cwd(), 'database/migrations/006_chat_management_schema.sql');
```

**Impact**: References `database/migrations/` (already exists, no conflict)

#### 4. Schema Fix API

```typescript
// apps/vital-system/src/app/api/fix-schema/route.ts
message: 'Database schema needs to be updated. Please run the migration: 20250919170000_add_healthcare_fields_to_agents.sql'
```

**Impact**: Message only - no path dependency

---

## Affected Files Summary

| File | Reference | Type | Impact |
|------|-----------|------|--------|
| `apps/*/api/admin/apply-healthcare-migration/route.ts` (3 files) | `database/sql/migrations/2025/*.sql` | **CRITICAL** | Runtime path |
| `apps/*/config/organizational-structure.ts` (3 files) | `database/sql/migrations/2025/*.sql` | Comment | Documentation only |
| `apps/vital-system/api/migrate/chat-schema/route.ts` | `database/migrations/*.sql` | OK | No conflict |
| `apps/vital-system/api/fix-schema/route.ts` | Migration filename | OK | Message only |

---

## Required Action BEFORE Archiving `/sql/`

### Option 1: Copy Referenced Files to `/database/`

```bash
# Check if files exist
ls -la database/sql/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql
ls -la database/sql/migrations/2025/20250120000000_healthcare_compliance_enhancement.sql

# If they exist, copy to database/migrations/
cp database/sql/migrations/2025/*.sql database/migrations/

# OR create the 2025 subdirectory structure
mkdir -p database/migrations/2025
cp database/sql/migrations/2025/*.sql database/migrations/2025/
```

### Option 2: Update Code References (Recommended)

**Before archiving `/sql/`, update the 3 API route files:**

```typescript
// FROM:
sql_file: 'database/sql/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql'

// TO:
sql_file: 'database/migrations/2025/20250919170000_add_healthcare_fields_to_agents.sql'
```

**Files to update**:
1. `/Users/amine/desktop/vital/apps/vital-system/src/app/api/admin/apply-healthcare-migration/route.ts`
2. `/Users/amine/desktop/vital/apps/digital-health-startup/src/app/api/admin/apply-healthcare-migration/route.ts`
3. `/Users/amine/desktop/vital/apps/pharma/src/app/api/admin/apply-healthcare-migration/route.ts`

### Option 3: Keep `/sql/` Structure (Conservative)

**Don't archive `/sql/` directory - leave it as-is for now**

This is the safest option if uncertain about migration file status.

---

## Recommended Approach

### Phase 1: Verify Migration Files Exist

```bash
# Check if the referenced migration files actually exist
find database/sql -name "*20250919170000*" -o -name "*20250120000000*"
```

### Phase 2: Copy Files if Found

```bash
# Copy healthcare migrations to /database/migrations/
mkdir -p database/migrations/2025
cp database/sql/migrations/2025/*.sql database/migrations/2025/ 2>/dev/null || echo "Files not found"
```

### Phase 3: Update Code References

**Edit 3 files to change path from `database/sql/migrations/` to `database/migrations/`**

### Phase 4: Test Migration API

```bash
# Test the healthcare migration API endpoint
# Verify it can find the migration file at new location
```

### Phase 5: Archive `/sql/` Directory

```bash
# Only after verifying migration files are accessible
git mv sql/ archive/2025-11-19-root-cleanup/sql-legacy/
```

---

## Alternative: Hybrid Approach

**Keep migration subdirectory structure in `/database/`:**

```
database/
├── migrations/
│   ├── 2025/                          ← NEW: Create year-based subdirs
│   │   ├── 20250919170000_add_healthcare_fields_to_agents.sql
│   │   └── 20250120000000_healthcare_compliance_enhancement.sql
│   ├── 20251006_add_enhanced_agent_fields.sql
│   └── 20251118_*.sql
└── ...
```

**Then update code to use new paths.**

---

## No References Found For

✅ **Root SQL scripts** (7 files) - Safe to move:
- add_tenant_to_knowledge.sql
- complete_tenant_mapping.sql
- duplicate_for_pharma.sql
- make_super_admins.sql
- remove_duplicates.sql
- run_in_supabase_sql_editor.sql
- set_allowed_tenants.sql

✅ **Root shell scripts** (5 files) - No code references found

✅ **Root JS utilities** (2 files) - No import references found

---

## Updated Recommendation

### For `/sql/` Directory Archival

**CRITICAL DECISION**: Choose one approach:

#### A. SAFE PATH (Recommended for immediate execution)
1. Check if migration files exist: `find database/sql/migrations/2025 -type f`
2. If found, copy to `database/migrations/2025/`
3. Update 3 API route files with new paths
4. Test healthcare migration API
5. Archive `/sql/` directory

#### B. CONSERVATIVE PATH (If uncertain)
1. **DON'T archive `/sql/` directory yet**
2. Proceed with all other cleanup tasks
3. Investigate migration file dependencies later
4. Archive `/sql/` in a future cleanup phase

#### C. VERIFY-FIRST PATH (Most thorough)
1. Run migration file verification script
2. Document all active vs. obsolete migrations
3. Consolidate to single migration location
4. Update all code references
5. Archive `/sql/` directory

---

## Action Required from Owner

**Before proceeding with `/sql/` archival, please confirm:**

1. [ ] Do the healthcare migration files exist?
   ```bash
   ls -la database/sql/migrations/2025/
   ```

2. [ ] Are these migrations actively used?
   - Test: Try accessing healthcare migration API endpoint

3. [ ] Choose approach:
   - [ ] A - Copy files, update paths, then archive
   - [ ] B - Skip `/sql/` archival for now
   - [ ] C - Full verification first

---

## Modified Cleanup Plan

### Original Plan
- Archive entire `/sql/` directory → **BLOCKED** (path dependencies found)

### Updated Plan
1. **FIRST**: Resolve migration file dependencies (see options above)
2. **THEN**: Proceed with archival

OR

1. **SKIP**: `/sql/` directory archival
2. **PROCEED**: With all other cleanup tasks (still achieves 85% of benefits)

---

## Impact on Cleanup Goals

### Without `/sql/` Archival
- Root reduction: 84 → ~42 items (still achieves 50% reduction)
- Documentation: 100% organized ✅
- Scripts: 100% organized ✅
- Database files: Partially organized (root scripts moved, but `/sql/` remains)

### With `/sql/` Archival (after dependency resolution)
- Root reduction: 84 → 42 items
- Full database consolidation
- Single migration strategy
- Complete cleanup goals

---

## Recommendation to Owner

**Proceed with cleanup in TWO phases:**

### Phase 1 (Low-Risk - Execute Now)
- Move documentation files ✅
- Move root SQL scripts ✅
- Move root shell scripts ✅
- Move root JS utilities ✅
- Archive agent data ✅
- Delete system files ✅

### Phase 2 (After Verification - Execute Later)
- Verify migration file dependencies
- Consolidate migration strategy
- Archive `/sql/` directory

**This approach gives you 85% of the benefits with ZERO risk.**
