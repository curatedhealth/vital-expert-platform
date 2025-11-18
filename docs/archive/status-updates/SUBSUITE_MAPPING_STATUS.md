# Subsuite Mapping Status Report

## Current Situation Analysis

### ❌ Problem 1: Subsuite Tables Not Migrated

The unified prompts migration (`20251110120000_unified_prompts_schema.sql`) does **NOT** create a separate `prompt_subsuites` table. Instead, it stores subsuites as **field values** in the `prompts` table.

**Current Schema**:
```sql
-- In prompts table:
CREATE TABLE prompts (
  ...
  suite TEXT NOT NULL,      -- e.g., "RULES™"
  subsuite TEXT,            -- e.g., "Regulatory Strategy" (nullable)
  ...
);
```

**Missing Tables** (not in unified migration):
- ❌ `prompt_subsuites` - Does not exist
- ❌ `dh_prompt_subsuite` - Old table, still exists in production
- ❌ `dh_prompt_suite_prompt` - Junction table for old architecture

### ❌ Problem 2: Subsuite API Still Using Old Tables

**File**: `apps/digital-health-startup/src/app/api/prompts/suites/[suiteId]/subsuites/route.ts`

**Current Code** (Lines 23-42):
```typescript
// Fetch the suite
const { data: suite } = await supabase
  .from('dh_prompt_suite')  // ❌ OLD TABLE
  .select('*')
  .eq('unique_id', suiteId)
  .single();

// Fetch subsuites for this suite
const { data: subsuites } = await supabase
  .from('dh_prompt_subsuite')  // ❌ OLD TABLE
  .select('*')
  .eq('suite_id', suite.id)
  .eq('is_active', true)
  .order('position');
```

**This API will FAIL after migration** because these tables won't exist!

---

## Two Possible Architectures

### Option 1: Subsuites as Field Values (Current Migration)

**Schema**:
```sql
CREATE TABLE prompts (
  suite TEXT NOT NULL,      -- "RULES™"
  subsuite TEXT,            -- "Regulatory Strategy"
);
```

**Pros**:
- ✅ Simpler schema
- ✅ No joins needed
- ✅ Easy to query

**Cons**:
- ❌ No metadata for subsuites
- ❌ No position/ordering for subsuites
- ❌ Can't have subsuite descriptions
- ❌ Subsuites are just strings, not entities

**Subsuite API with this approach**:
```typescript
// Query unique subsuites for a suite
const { data: prompts } = await supabase
  .from('prompts')
  .select('subsuite')
  .eq('suite', suiteName)
  .not('subsuite', 'is', null);

// Extract unique subsuites
const uniqueSubsuites = [...new Set(prompts.map(p => p.subsuite))];
```

---

### Option 2: Dedicated Subsuite Table (Recommended)

**Schema**:
```sql
CREATE TABLE prompt_suites (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,       -- "RULES™"
  ...
);

CREATE TABLE prompt_subsuites (
  id UUID PRIMARY KEY,
  suite_id UUID REFERENCES prompt_suites(id),
  unique_id TEXT UNIQUE NOT NULL,  -- "SUBSUITE-RULES-REG-STRAT"
  name TEXT NOT NULL,              -- "Regulatory Strategy"
  description TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  suite_id UUID REFERENCES prompt_suites(id),      -- FK to suite
  subsuite_id UUID REFERENCES prompt_subsuites(id), -- FK to subsuite (nullable)
  ...
);
```

**Pros**:
- ✅ Subsuites are first-class entities
- ✅ Can have rich metadata (description, tags, etc.)
- ✅ Can enforce referential integrity
- ✅ Can order subsuites (position field)
- ✅ Can have subsuite-level statistics

**Cons**:
- ❌ More complex schema
- ❌ Requires joins for queries
- ❌ More migration work

---

## Current Database State

### What Tables ACTUALLY Exist in Production:

Based on the code and migration history, these tables likely exist:

1. **`dh_prompt`** - Digital Health prompts (~352 prompts)
2. **`dh_prompt_suite`** - Suite metadata (10 suites)
3. **`dh_prompt_subsuite`** - Subsuite entities
4. **`dh_prompt_suite_prompt`** - Junction table linking prompts to suites/subsuites

### What Tables the NEW Migration Creates:

1. **`prompts`** - Unified prompts table
2. **`prompt_suites`** - Unified suites table
3. **NO subsuite table** - Subsuite is just a TEXT field in prompts

---

## Data Loading Status

### ✅ What WILL Work (After Migration):

1. **Dashboard View** (`/api/prompts/suites`)
   - ✅ Fetches from `prompt_suites` table
   - ✅ Counts prompts from `prompts` table
   - ✅ Shows correct suite statistics

2. **Prompts List** (`/api/prompts`)
   - ✅ Fetches from `prompts` table
   - ✅ Filters by suite
   - ✅ Shows individual prompts

### ❌ What WILL FAIL (After Migration):

1. **Subsuite Detail View** (`/api/prompts/suites/[suiteId]/subsuites`)
   - ❌ Queries `dh_prompt_suite` (won't exist after migration)
   - ❌ Queries `dh_prompt_subsuite` (won't exist after migration)
   - ❌ Queries `dh_prompt_suite_prompt` (won't exist after migration)

2. **Sidebar Subsuite Expansion** (`PromptSidebar.tsx`)
   - ❌ Calls `/api/prompts/suites/[suiteId]/subsuites`
   - ❌ Will get 404 or 500 errors

---

## Recommendation: Fix Subsuite API

Since the migration uses **subsuites as field values** (Option 1), we need to update the subsuite API to match.

### Updated Subsuite API

**File**: `apps/digital-health-startup/src/app/api/prompts/suites/[suiteId]/subsuites/route.ts`

**New Implementation**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { suiteId: string } }
) {
  const logger = createLogger();
  const operationId = `prompt_subsuites_get_${Date.now()}`;

  try {
    const supabase = await createClient();
    const { suiteId } = params;

    logger.info('prompt_subsuites_get_started', {
      operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
      operationId,
      suiteId,
    });

    // Fetch the suite from unified table
    const { data: suite, error: suiteError } = await supabase
      .from('prompt_suites')
      .select('*')
      .eq('unique_id', suiteId)
      .single();

    if (suiteError || !suite) {
      return NextResponse.json(
        { success: false, error: 'Suite not found' },
        { status: 404 }
      );
    }

    // Fetch all prompts for this suite to extract unique subsuites
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('subsuite')
      .eq('suite', suite.name)
      .not('subsuite', 'is', null)
      .eq('status', 'active');

    if (promptsError) {
      logger.error(
        'subsuites_fetch_error',
        new Error(promptsError.message),
        { suiteId, errorCode: promptsError.code }
      );

      return NextResponse.json(
        { success: false, error: 'Failed to fetch subsuites' },
        { status: 500 }
      );
    }

    // Extract unique subsuites and count prompts for each
    const subsuiteMap = new Map<string, number>();
    (prompts || []).forEach((p: any) => {
      if (p.subsuite) {
        subsuiteMap.set(p.subsuite, (subsuiteMap.get(p.subsuite) || 0) + 1);
      }
    });

    // Convert to array with statistics
    const subsuitesWithStats = Array.from(subsuiteMap.entries())
      .map(([name, count], index) => ({
        id: `${suite.id}-${index}`,
        unique_id: `SUBSUITE-${suite.acronym}-${name.replace(/\s+/g, '-').toUpperCase()}`,
        name: name,
        description: `${name} prompts for ${suite.name}`,
        tags: [],
        metadata: {},
        position: index,
        statistics: {
          promptCount: count,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    logger.info('prompt_subsuites_get_completed', {
      operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
      operationId,
      suiteId,
      count: subsuitesWithStats.length,
    });

    return NextResponse.json({
      success: true,
      suite: {
        id: suite.id,
        unique_id: suite.unique_id,
        name: suite.name,
        description: suite.description,
        metadata: suite.metadata,
      },
      subsuites: subsuitesWithStats,
    });
  } catch (error) {
    logger.error(
      'prompt_subsuites_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
        operationId,
      }
    );

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Action Items

### Immediate (Before Migration):
1. ⚠️ **Update Subsuite API** - Fix `/api/prompts/suites/[suiteId]/subsuites/route.ts`
2. ⚠️ **Test Sidebar** - Ensure subsuite expansion works with new API

### After Migration:
1. ✅ Verify dashboard loads suite cards
2. ✅ Verify suite detail view shows subsuites
3. ✅ Verify sidebar subsuite expansion works
4. ✅ Verify prompt filtering by subsuite works

### Future Enhancement (Optional):
1. Consider migrating to Option 2 (dedicated subsuite table) for richer metadata
2. Add subsuite descriptions, icons, and ordering
3. Create subsuite detail pages

---

## Summary

| Component | Status | Issue | Fix Required |
|-----------|--------|-------|--------------|
| `prompt_suites` table | ✅ Ready | - | None |
| `prompts` table | ✅ Ready | - | None |
| `prompt_subsuites` table | ❌ Missing | Not created in migration | Optional - use field values |
| Dashboard API | ✅ Ready | - | None |
| Prompts API | ✅ Ready | - | None |
| **Subsuites API** | ❌ Broken | Queries old tables | **Must fix before migration** |
| PromptDashboard UI | ✅ Ready | - | None |
| PromptSidebar UI | ⚠️ Depends | Calls subsuite API | Will work after API fix |
| SuiteDetailView UI | ⚠️ Depends | Calls subsuite API | Will work after API fix |

---

**Critical**: The subsuite API MUST be updated before applying the migration, otherwise the frontend will break when users try to expand suites in the sidebar.
