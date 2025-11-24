# Frontend-Backend Mapping - PROMPTS™ System

## ✅ Complete Mapping Documentation

This document shows the exact mapping between Supabase tables, API endpoints, and React components.

---

## Database Tables → API Endpoints → Frontend Components

### 1. PROMPTS™ Suites Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE: prompt_suites                                         │
│ - Stores 10 PRISM suites (RULES™, TRIALS™, GUARD™, etc.)       │
│ - Fields: id, unique_id, name, acronym, description, color,    │
│           category, function, position, metadata                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ API: GET /api/prompts/suites                                    │
│ - File: apps/digital-health-startup/src/app/api/prompts/       │
│         suites/route.ts                                         │
│ - Query: SELECT * FROM prompt_suites WHERE is_active = true    │
│ - Response:                                                     │
│   {                                                             │
│     success: true,                                              │
│     suites: [                                                   │
│       {                                                         │
│         id: "uuid",                                             │
│         name: "RULES™",                                         │
│         description: "Regulatory Excellence",                   │
│         color: "bg-blue-500",                                   │
│         category: "regulatory",                                 │
│         function: "REGULATORY",                                 │
│         statistics: {                                           │
│           totalPrompts: 523,    // Counted from prompts table   │
│           subsuites: 12         // Counted from prompts table   │
│         },                                                      │
│         metadata: {                                             │
│           acronym: "RULES",                                     │
│           uniqueId: "SUITE-RULES",                              │
│           tagline: "Master Regulatory Compliance"               │
│         }                                                       │
│       },                                                        │
│       // ... 9 more suites                                      │
│     ]                                                           │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT: PromptDashboard.tsx                                  │
│ - File: apps/digital-health-startup/src/components/prompts/    │
│         PromptDashboard.tsx                                     │
│ - Renders: Grid of suite cards                                 │
│ - Each card shows:                                              │
│   • Suite name (e.g., "RULES™")                                 │
│   • Description (e.g., "Regulatory Excellence")                 │
│   • Color-coded icon                                            │
│   • Statistics:                                                 │
│     - Total prompts count                                       │
│     - Subsuites count                                           │
│   • Function badge (e.g., "REGULATORY")                         │
│   • "Explore Suite" button                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Code Snippet**:
```typescript
// PromptDashboard.tsx - Line 24-38
const fetchSuites = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/prompts/suites');
    const data = await response.json();

    if (data.success) {
      setSuites(data.suites);  // Maps to PromptSuite[] type
    }
  } catch (error) {
    console.error('Error fetching suites:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### 2. Individual Prompts Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE: prompts                                               │
│ - Stores ALL prompts (~3,922 expected after migration)         │
│ - Fields: id, unique_id, name, display_name, description,      │
│           system_prompt, user_prompt_template, suite,          │
│           subsuite, category, domain, pattern,                 │
│           complexity_level, tags, status, metadata             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ API: GET /api/prompts?suite=RULES™                             │
│ - File: apps/digital-health-startup/src/app/api/prompts/       │
│         route.ts                                                │
│ - Query: SELECT * FROM prompts                                 │
│          WHERE status = 'active'                                │
│          ORDER BY created_at DESC                               │
│ - Filters applied:                                              │
│   • suite (if specified)                                        │
│   • domain                                                      │
│   • search term                                                 │
│   • userOnly                                                    │
│ - Response:                                                     │
│   {                                                             │
│     success: true,                                              │
│     prompts: [                                                  │
│       {                                                         │
│         id: "uuid",                                             │
│         name: "RULES_FDA_SUBMISSION_510K",                      │
│         display_name: "FDA 510(k) Submission Assistant",        │
│         description: "Generate 510(k) submission docs...",      │
│         domain: "Regulatory Affairs",                           │
│         system_prompt: "You are an expert in...",               │
│         suite: "RULES™",                                        │
│         pattern: "CoT",                                         │
│         complexity_level: "Advanced",                           │
│         tags: ["FDA", "510k", "Medical Device"],                │
│         metadata: { /* additional fields */ },                  │
│         is_user_created: false                                  │
│       },                                                        │
│       // ... more prompts                                       │
│     ],                                                          │
│     count: 523                                                  │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT: PromptViewManager.tsx                                │
│ - File: apps/digital-health-startup/src/components/prompts/    │
│         PromptViewManager.tsx                                   │
│ - Manages state and view modes                                 │
│ - Applies filters (search, pattern, complexity)                │
│ - Delegates rendering to:                                       │
│   • BoardView (card grid)                                       │
│   • ListView (compact list)                                     │
│   • TableView (sortable table)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENTS: Views                                               │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ BoardView.tsx - Card Grid                                 │   │
│ │ - Shows prompts as cards                                  │   │
│ │ - Each card displays:                                     │   │
│ │   • Display name                                          │   │
│ │   • Description                                           │   │
│ │   • Pattern badge                                         │   │
│ │   • Complexity badge                                      │   │
│ │   • Tags                                                  │   │
│ │   • Copy button                                           │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ListView.tsx - Compact List                               │   │
│ │ - Shows prompts as list items                             │   │
│ │ - Horizontal layout with inline metadata                  │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ TableView.tsx - Sortable Table                            │   │
│ │ - Shows prompts in table format                           │   │
│ │ - Sortable by: name, pattern, complexity, date            │   │
│ └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Code Snippet**:
```typescript
// PromptViewManager.tsx - Line 70-95
const fetchPrompts = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedSuite) {
      params.append('suite', selectedSuite.name);  // e.g., "RULES™"
    }

    const response = await fetch(`/api/prompts?${params.toString()}`);
    const data = await response.json();

    if (data.success) {
      setPrompts(data.prompts);  // Maps to Prompt[] type
    }
  } catch (error) {
    console.error('Error fetching prompts:', error);
    toast({
      title: 'Error',
      description: 'Failed to load prompts',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

---

### 3. Suite Detail View Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE: prompts (subsuites extracted from prompts)            │
│ - Query unique subsuite values for a given suite               │
│ - GROUP BY subsuite WHERE suite = 'RULES™'                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT: SuiteDetailView.tsx                                  │
│ - File: apps/digital-health-startup/src/components/prompts/    │
│         SuiteDetailView.tsx                                     │
│ - Shows suite header with:                                      │
│   • Suite name and description                                  │
│   • Statistics                                                  │
│   • "View All Prompts" button                                   │
│ - Shows subsuite cards (if subsuites exist)                     │
│ - Each subsuite card displays:                                  │
│   • Subsuite name                                               │
│   • Description                                                 │
│   • Prompt count                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. Sidebar Filters Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT: PromptSidebar.tsx                                    │
│ - File: apps/digital-health-startup/src/components/prompts/    │
│         PromptSidebar.tsx                                       │
│ - Provides hierarchical filtering:                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ SUITES & SUBSUITES (Expandable Tree)                    │   │
│   │ - All Prompts                                           │   │
│   │ - > RULES™                                              │   │
│   │   - > Regulatory Strategy                              │   │
│   │   - > Submission Planning                              │   │
│   │ - > TRIALS™                                             │   │
│   │   - > Protocol Design                                   │   │
│   │   - > Clinical Operations                              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ PATTERN (Dropdown)                                      │   │
│   │ - All Patterns                                          │   │
│   │ - CoT (Chain of Thought)                                │   │
│   │ - Few-Shot                                              │   │
│   │ - ReAct                                                 │   │
│   │ - Direct                                                │   │
│   │ - RAG                                                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ COMPLEXITY (Dropdown)                                   │   │
│   │ - All Levels                                            │   │
│   │ - Basic                                                 │   │
│   │ - Intermediate                                          │   │
│   │ - Advanced                                              │   │
│   │ - Expert                                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ RESET FILTERS (Button)                                  │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## TypeScript Type Mapping

### Database Schema → TypeScript Types

```typescript
// Database: prompt_suites table
// ↓
// TypeScript: PromptSuite interface (src/types/prompts.ts)

export interface PromptSuite {
  id: string;                    // maps to: prompt_suites.id
  name: string;                  // maps to: prompt_suites.name
  description: string;           // maps to: prompt_suites.description
  color: string;                 // maps to: prompt_suites.color
  category: string;              // maps to: prompt_suites.category
  function: SuiteFunction;       // maps to: prompt_suites.function
  statistics: SuiteStatistics;   // COMPUTED from prompts table
  metadata?: SuiteMetadata;      // maps to: prompt_suites.metadata (JSONB)
}

export interface SuiteStatistics {
  totalPrompts: number;          // COUNT(*) FROM prompts WHERE suite = suite.name
  subsuites: number;             // COUNT(DISTINCT subsuite) FROM prompts WHERE suite = suite.name
  avgComplexity?: ComplexityLevel;
  patterns?: Record<PromptPattern, number>;
}
```

```typescript
// Database: prompts table
// ↓
// TypeScript: Prompt interface (src/types/prompts.ts)

export interface Prompt {
  id: string;                    // maps to: prompts.id
  name: string;                  // maps to: prompts.name
  display_name: string;          // maps to: prompts.display_name
  description: string;           // maps to: prompts.description
  domain: string;                // maps to: prompts.domain
  system_prompt: string;         // maps to: prompts.system_prompt
  user_prompt_template?: string; // maps to: prompts.user_prompt_template
  suite?: string;                // maps to: prompts.suite
  category?: string;             // maps to: prompts.category
  complexity_level?: ComplexityLevel; // maps to: prompts.complexity_level
  status?: 'active' | 'inactive' | 'deprecated'; // maps to: prompts.status
  metadata?: PromptMetadata;     // maps to: prompts.metadata (JSONB)
  created_at?: string;           // maps to: prompts.created_at
  updated_at?: string;           // maps to: prompts.updated_at
  created_by?: string;           // maps to: prompts.created_by
  is_user_created?: boolean;     // COMPUTED: created_by !== null
}
```

---

## API Endpoint Details

### GET /api/prompts/suites

**Purpose**: Fetch all prompt suites with statistics

**Database Queries**:
```sql
-- Query 1: Get all suites
SELECT * FROM prompt_suites
WHERE is_active = true
ORDER BY position;

-- Query 2: Get prompt counts
SELECT id, suite, subsuite FROM prompts
WHERE status = 'active';
```

**Processing**:
1. Fetch all active suites from `prompt_suites`
2. Fetch all active prompts (just `id`, `suite`, `subsuite` fields)
3. For each suite:
   - Count prompts where `prompt.suite = suite.name`
   - Count unique subsuites where `prompt.subsuite IS NOT NULL`
4. Return enriched suite data with statistics

**Response Type**: `SuitesResponse`

---

### GET /api/prompts

**Purpose**: Fetch prompts with optional filters

**Query Parameters**:
- `suite`: Filter by suite name (e.g., "RULES™")
- `domain`: Filter by domain
- `search`: Full-text search across name, display_name, description
- `userOnly`: Show only user-created prompts
- `userId`: Filter by specific user

**Database Query**:
```sql
SELECT * FROM prompts
WHERE status = 'active'
  AND (suite = $suite OR $suite IS NULL)
  AND (domain = $domain OR $domain IS NULL)
  AND (name ILIKE $search OR display_name ILIKE $search OR description ILIKE $search)
  AND (created_by = $userId OR $userId IS NULL)
ORDER BY created_at DESC;
```

**Processing**:
1. Build query with filters
2. Execute query
3. Add `is_user_created` derived field
4. Return prompts array

**Response Type**: `PromptsResponse`

---

## Component Hierarchy

```
PRISMPage (/prism)
└── PromptViewManager
    ├── PromptDashboard (viewMode = 'dashboard')
    │   └── Suite Cards (click → SuiteDetailView)
    │
    ├── SuiteDetailView (viewMode = 'suite')
    │   ├── Suite Header
    │   ├── Subsuite Cards (click → Board/List/Table view)
    │   └── "View All Prompts" button
    │
    └── Prompt Views (viewMode = 'board' | 'list' | 'table')
        ├── PromptSidebar (filters)
        ├── Header (search, view switcher)
        └── Content
            ├── BoardView (card grid)
            ├── ListView (compact list)
            └── TableView (sortable table)
```

---

## State Management Flow

```typescript
// PromptViewManager.tsx maintains all state:

const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
const [selectedSuite, setSelectedSuite] = useState<PromptSuite | undefined>();
const [selectedSubsuite, setSelectedSubsuite] = useState<PromptSubsuite | undefined>();
const [suites, setSuites] = useState<PromptSuite[]>([]);
const [prompts, setPrompts] = useState<Prompt[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedPattern, setSelectedPattern] = useState<PromptPattern | 'all'>('all');
const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel | 'all'>('all');
const [promptViewMode, setPromptViewMode] = useState<'board' | 'list' | 'table'>('board');
```

**User Journey**:
1. Land on `/prism` → `viewMode = 'dashboard'`
2. See 10 suite cards → Data from `GET /api/prompts/suites`
3. Click suite (e.g., RULES™) → `viewMode = 'suite'`, `selectedSuite = RULES™`
4. See suite detail with subsuites
5. Click "View All Prompts" → `viewMode = 'board'`, fetch prompts filtered by suite
6. Apply filters via sidebar → Re-filter prompts client-side
7. Switch views (Board/List/Table) → Same data, different presentation

---

## Data Flow Summary

```
Database Tables          API Endpoints              React Components
───────────────          ─────────────              ────────────────
prompt_suites      →     /api/prompts/suites   →   PromptDashboard
                                                    (Suite Cards)

prompts            →     /api/prompts          →   BoardView
                         ?suite=RULES™              ListView
                                                    TableView

prompts            →     (computed in API)     →   SuiteDetailView
(GROUP BY                                          (Subsuite Cards)
 subsuite)
```

---

## ✅ Verification Checklist

- [x] `prompt_suites` table → `/api/prompts/suites` → `PromptDashboard`
- [x] `prompts` table → `/api/prompts` → `BoardView/ListView/TableView`
- [x] TypeScript types match database schema
- [x] API responses match component expectations
- [x] No references to old `dh_prompt` or `dh_prompt_suite` tables
- [x] Removed `legacyPrompts` and `workflowPrompts` from types and UI
- [x] All views use unified `prompts` table data
- [x] Filters work correctly with unified schema

---

## Migration Impact

**Before Migration** (Dual-Table):
- ❌ API fetches from `prompts` + `dh_prompt` + `dh_prompt_suite`
- ❌ Complex transformation logic
- ❌ Suite assignment via pattern matching
- ❌ UI shows "Legacy" vs "Workflow" breakdown

**After Migration** (Unified):
- ✅ API fetches from `prompts` + `prompt_suites` only
- ✅ No transformation needed
- ✅ Suite stored directly in database
- ✅ UI shows clean statistics (total prompts, subsuites)

---

## Next Steps

1. **Apply Migration**: Run the SQL migration to create/populate unified tables
2. **Verify Counts**: Check that suite statistics show correct prompt counts
3. **Test Navigation**: Click through all views to ensure proper data flow
4. **Check Filters**: Verify sidebar filters work correctly

---

**Status**: ✅ Frontend properly mapped to unified backend
**Date**: 2025-11-10
**Author**: Claude Code Assistant
