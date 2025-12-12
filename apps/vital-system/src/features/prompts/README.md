# Prompts Feature Documentation

## Overview

The Prompts feature provides a comprehensive library of healthcare prompt templates organized by PRISM Suites. It includes full CRUD capabilities, batch operations, multiple view modes, and filtering options.

## Architecture

```
/prompts                    # Main prompts library page
/prompts/[slug]            # Individual prompt detail/edit page
/prompts/suites            # Browse by PRISM Suites
/prompts/suites/[suite]    # Prompts within a specific suite
/prompts/suites/[suite]/[subSuite]  # Prompts within a sub-suite
```

## CRUD Operations

### List View (`/prompts`)

The main prompts page provides full CRUD functionality:

#### Header Actions
| Action | Description | Admin Only |
|--------|-------------|------------|
| Create | Opens modal to create new prompt | Yes |
| Select | Toggles batch selection mode | Yes |
| Refresh | Reloads all prompts | No |

#### Selection Mode (Batch Operations)

When selection mode is active:

1. **Batch Action Bar** - Blue bar appears below header with:
   - Select all checkbox
   - Selected count display
   - "Delete (N)" button for batch deletion

2. **Selection Grid** - Custom card grid with:
   - Checkbox on each card (top-right)
   - Click card to toggle selection
   - Visual highlight for selected cards (blue ring)

3. **Individual Card Actions**:
   - **View** - Opens detail page
   - **Edit** - Opens detail page in edit mode
   - **Delete** - Single item deletion with confirmation

#### Batch Delete Flow
```
1. Click "Select" button in header
2. Select prompts (checkbox or click card)
3. Click "Delete (N)" in batch action bar
4. Confirm in modal dialog
5. All selected prompts deleted in parallel
```

### Detail View (`/prompts/[slug]`)

The detail page displays comprehensive prompt information and editing capabilities.

#### Sections Displayed

| Section | Color Theme | Description |
|---------|-------------|-------------|
| Metadata Badges | Various | Suite, complexity, category, status badges |
| Prompt Starter | Emerald | Quick-start prompt with "Use This Prompt" button |
| Detailed Prompt | Violet | Full detailed prompt content |
| Description | Default | Auto-generated or custom description |
| System Prompt | Blue | System prompt instructions |
| User Template | Green | User prompt template with variables |
| Variables | Amber | Template variables list |
| Tags | Default | Categorization tags |
| Organization Context | Default | Function, Department, Role info |
| Performance Metrics | Default | Usage count, accuracy, satisfaction metrics |
| Expert Validation | Green | Validator name, credentials, date |
| Details | Default | Prompt code, domain, timestamps |
| Quick Actions | Default | Copy and navigation buttons |

#### Admin Actions (Detail Page)
- **Edit** - Inline editing of all fields
- **Delete** - Single prompt deletion with confirmation
- **Save/Cancel** - When in edit mode

## Components

### Feature Components (`/features/prompts/components/`)

| Component | Description |
|-----------|-------------|
| `PromptSuiteFilter` | Filter dropdown for PRISM Suites |
| `PromptSubSuiteFilter` | Filter dropdown for Sub-Suites |
| `PromptEditModal` | Create/Edit dialog with form fields |
| `PromptDeleteModal` | Confirmation dialog for deletion |

### Exports (`/features/prompts/components/index.ts`)

```typescript
// Suite & Sub-Suite Filters
export {
  PromptSuiteFilter,
  PRISM_SUITES,
  getSuiteByCode,
  getSuiteIcon,
  type SuiteConfig,
  type PromptSuiteFilterProps,
} from './PromptSuiteFilter';

export {
  PromptSubSuiteFilter,
  type SubSuite,
  type PromptSubSuiteFilterProps,
} from './PromptSubSuiteFilter';

// CRUD Modals
export {
  PromptEditModal,
  PromptDeleteModal,
  DEFAULT_PROMPT,
  generatePromptSlug,
  COMPLEXITY_OPTIONS,
  DOMAIN_OPTIONS,
  type Prompt,
  type PromptEditModalProps,
  type PromptDeleteModalProps,
} from './PromptModals';
```

## PRISM Suites

The prompts are organized into 10 PRISM Suites:

| Code | Name | Domain | Icon |
|------|------|--------|------|
| RULES | RULES | Regulatory Excellence | Shield |
| TRIALS | TRIALS | Clinical Development | FlaskConical |
| GUARD | GUARD | Safety Framework | ShieldCheck |
| VALUE | VALUE | Market Access | DollarSign |
| BRIDGE | BRIDGE | Stakeholder Engagement | Users |
| PROOF | PROOF | Evidence Analytics | BarChart3 |
| CRAFT | CRAFT | Medical Writing | Pen |
| SCOUT | SCOUT | Competitive Intelligence | Target |
| PROJECT | PROJECT | Project Management | ClipboardList |
| FORGE | FORGE | Digital Health | Zap |

## View Modes

The main prompts page (`/prompts`) supports multiple view modes:

| Mode | Description |
|------|-------------|
| Overview | Statistics, suite distribution, recent prompts |
| Grid | Card-based responsive grid layout |
| List | Vertical list layout |
| Table | Data table with columns |
| Kanban | Columns grouped by PRISM Suite |

## API Endpoints

### `/api/prompts-crud`

Full CRUD REST API for prompts:

#### GET - Fetch prompts
```
GET /api/prompts-crud?showAll=true
GET /api/prompts-crud?action=get&id={promptId}&showAll=true
GET /api/prompts-crud?action=get&id={slug}&showAll=true
GET /api/prompts-crud?suite=RULES&complexity=basic&status=active
```

Query Parameters:
- `showAll`: Show all prompts (bypass tenant filter)
- `action=get&id`: Get specific prompt by ID, slug, or prompt_code
- `suite`: Filter by PRISM suite
- `complexity`: Filter by complexity level
- `status`: Filter by status
- `domain`: Filter by domain
- `search`: Search in name/description
- `page` / `limit`: Pagination

**Note**: The API supports flexible lookup - you can pass a UUID, slug, or prompt_code to the `id` parameter.

#### POST - Create prompt
```json
{
  "name": "Protocol Review Assistant",
  "display_name": "Protocol Review",
  "description": "Reviews clinical trial protocols",
  "domain": "clinical",
  "complexity_level": "advanced",
  "system_prompt": "You are an expert...",
  "user_prompt_template": "Review: {{protocol}}",
  "tags": ["clinical", "protocol"]
}
```

#### PUT - Update prompt
```json
{
  "id": "prompt-uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "detailed_prompt": "Full detailed prompt content..."
}
```

#### DELETE - Delete prompt
```
DELETE /api/prompts-crud?id={promptId}
```

## Prompt Schema

```typescript
interface Prompt {
  id: string;
  name: string;
  slug?: string;
  prompt_code?: string;
  display_name?: string;
  title?: string;
  description?: string;
  content?: string;
  system_prompt?: string;
  user_template?: string;
  user_prompt_template?: string;
  // Prompt starter and detailed prompt
  prompt_starter?: string;
  detailed_prompt?: string;
  // Classification
  category?: string;
  domain?: string;
  function?: string;
  function_name?: string;
  department_name?: string;
  role_name?: string;
  task_type?: string;
  pattern_type?: string;
  role_type?: string;
  complexity?: string;
  complexity_level?: string;
  // Tags and variables
  tags?: string[];
  variables?: string[];
  // Metrics
  estimated_time_minutes?: number;
  usage_count?: number;
  accuracy_clinical?: number;
  accuracy_regulatory?: number;
  user_satisfaction?: number;
  avg_latency_ms?: number;
  // Validation
  expert_validated?: boolean;
  validation_date?: string;
  validator_name?: string;
  validator_credentials?: string;
  version?: string;
  rag_enabled?: boolean;
  rag_context_sources?: string[];
  // Suite info
  suite?: string;
  suite_id?: string;
  suite_name?: string;
  sub_suite?: string;
  sub_suite_id?: string;
  sub_suite_name?: string;
  // Status
  status?: string;
  is_active?: boolean;
  is_user_created?: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
}
```

## Sidebar Navigation

The sidebar (`SidebarPromptPrismContent`) provides:

1. **Title Section**: "Prompts" with subtitle
2. **Views Section**: Overview, Grid, List, Table, Kanban
3. **Browse Section**: All Prompts, Browse Suites
4. **PRISM Suites Filter**: All 10 suites with icons
5. **Complexity Filter**: Basic, Intermediary, Advanced, Expert
6. **Actions Section**: Create New Prompt

### URL-Based State Management

Filters are managed via URL query parameters:
```
/prompts?view=grid&suite=RULES&complexity=basic
```

The `buildUrl()` function preserves existing parameters when navigating:
```typescript
const buildUrl = (params: Record<string, string | null>) => {
  const newParams = new URLSearchParams(searchParams.toString());
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
  });
  return `/prompts${newParams.toString() ? '?' + newParams.toString() : ''}`;
};
```

## UI Components Used

| Component | Package | Purpose |
|-----------|---------|---------|
| `VitalAssetView` | `@vital/ai-ui` | Multi-view asset display |
| `VitalBreadcrumb` | Local | Navigation breadcrumbs |
| `AssetOverviewStats` | Local | Stats cards for overview |
| `RecentAssetsCard` | Local | Recent items card |
| `ActiveFiltersBar` | Local | Active filter pills |
| `Checkbox` | `@/components/ui` | Selection checkboxes |

## Complexity Levels

| Level | Color | Description |
|-------|-------|-------------|
| Basic | Green | Simple, straightforward prompts |
| Intermediary | Blue | Moderate complexity with some structure |
| Advanced | Orange | Complex prompts with detailed instructions |
| Expert | Red | Highly specialized expert-level prompts |

## Domain Options

- regulatory
- clinical
- safety
- market-access
- medical-affairs
- evidence
- medical-writing
- competitive-intelligence
- project-management
- digital-health

## Kanban Configuration

The Kanban view groups prompts by PRISM Suite:

```typescript
const KANBAN_COLUMNS_BY_SUITE = PRISM_SUITES.slice(0, 5).map((suite) => ({
  id: suite.code,
  title: suite.name,
  filter: (asset: VitalAsset) => {
    const assetSuite = asset.metadata?.suite || asset.category || '';
    return assetSuite.includes(suite.code);
  },
  color: suite.textColor,
  bgColor: suite.bgColor,
}));
```

## Header Layout

The compact header includes:
- Breadcrumb (left)
- Search input (center, non-overview modes)
- View mode toggles (right, non-overview modes)
- Refresh button
- Select button (admin only, non-overview modes)
- Create button (admin only)

## Admin Features

Admins (`role === 'super_admin' || role === 'admin'`) can:

### List View Actions
- Create new prompts via Create button
- Enter selection mode for batch operations
- Select all/individual prompts
- Batch delete with confirmation
- Edit prompts via card actions
- Delete individual prompts via card actions
- Drag cards in Kanban view

### Detail View Actions
- Edit prompt inline (all fields)
- Delete prompt with confirmation
- Copy prompt content to clipboard

## Files Structure

```
apps/vital-system/src/
├── app/(app)/prompts/
│   ├── page.tsx                     # Main library page with batch ops
│   ├── [slug]/page.tsx              # Detail/edit page
│   └── suites/
│       ├── page.tsx                 # Suite browser
│       ├── [suite]/page.tsx         # Suite prompts
│       └── [suite]/[subSuite]/page.tsx  # Sub-suite prompts
├── app/api/prompts-crud/
│   └── route.ts                     # CRUD API (supports UUID/slug lookup)
├── features/prompts/
│   ├── components/
│   │   ├── index.ts                 # Exports
│   │   ├── PromptSuiteFilter.tsx    # Suite filter
│   │   ├── PromptSubSuiteFilter.tsx # Sub-suite filter
│   │   └── PromptModals.tsx         # Create/Edit/Delete modals
│   └── README.md                    # This documentation
└── components/
    └── sidebar-view-content.tsx     # SidebarPromptPrismContent
```

## Usage Examples

### Import prompt components
```typescript
import {
  PromptEditModal,
  PromptDeleteModal,
  PRISM_SUITES,
  getSuiteByCode,
  DEFAULT_PROMPT,
  type Prompt,
} from '@/features/prompts/components';
```

### Create a new prompt
```typescript
const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt>>(DEFAULT_PROMPT);
const [isModalOpen, setIsModalOpen] = useState(false);

const handleCreatePrompt = () => {
  setEditingPrompt({ ...DEFAULT_PROMPT });
  setIsModalOpen(true);
};

<PromptEditModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  prompt={editingPrompt}
  onPromptChange={setEditingPrompt}
  onSave={handleSavePrompt}
  isSaving={isSaving}
  error={error}
/>
```

### Batch selection state
```typescript
// State for batch operations
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [isSelectionMode, setIsSelectionMode] = useState(false);

// Toggle selection for a prompt
const toggleSelectPrompt = (id: string) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedIds(newSelected);
};

// Select all prompts
const selectAllPrompts = () => {
  if (selectedIds.size === prompts.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(prompts.map(p => p.id)));
  }
};

// Batch delete
const handleBatchDelete = async () => {
  const deletePromises = Array.from(selectedIds).map(id =>
    fetch(`/api/prompts-crud?id=${id}`, { method: 'DELETE' })
  );
  await Promise.allSettled(deletePromises);
};
```

### Use suite configuration
```typescript
const suiteConfig = getSuiteByCode('RULES');
// { code: 'RULES', name: 'RULES', icon: Shield, color: 'text-blue-600', ... }
```

## Consistency with Skills & Tools Pages

The Prompts feature follows the same design pattern as `/discover/skills` and `/discover/tools`:

### Shared Sidebar Pattern

All three pages use identical sidebar structure:
1. **Title Section** - Icon + name + subtitle
2. **Views Section** - Overview, Grid, List, Table, Kanban
3. **Browse Section** - "All [Items]" link to reset filters
4. **Category Filters** - Domain-specific with "All X" reset option
5. **Additional Filters** - Complexity, status, type, etc.
6. **Actions Section** - Create button
7. **Related Section** - Links to sibling pages

### URL-Based State Management

All pages use the same `buildUrl()` pattern:
```typescript
const buildUrl = (params: Record<string, string | null>) => {
  const newParams = new URLSearchParams(searchParams.toString());
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
  });
  return `/path${newParams.toString() ? '?' + newParams.toString() : ''}`;
};
```

### Active State Highlighting

Sidebar items use `data-active` attribute for visual feedback:
```typescript
<SidebarMenuButton asChild data-active={isViewActive("grid")}>
  <Link href={buildUrl({ view: "grid" })}>...</Link>
</SidebarMenuButton>
```

### Page Comparison

| Feature | Prompts | Skills | Tools |
|---------|---------|--------|-------|
| Title | Prompts | Skills | Tools |
| Subtitle | Healthcare prompt templates | AI agent capabilities | Healthcare AI tools registry |
| Category Filter | PRISM Suites | Categories | Categories |
| Secondary Filter | Complexity | Complexity | Lifecycle |
| Tertiary Filter | - | Implementation | Tool Type |
| Icon | FileText | Sparkles | Settings |
| Batch Operations | Yes | No | No |

## Changelog

### December 2024
- Initial implementation with full CRUD
- PRISM Suite organization
- Multiple view modes (Grid, List, Table, Kanban)
- Sidebar navigation with filters
- Compact header with search and view controls
- Kanban view grouped by PRISM Suite
- URL-based filter state management
- Consistency updates to match Skills/Tools sidebar pattern
- Added title section with icon and subtitle
- Added Actions section with Create Prompt button
- Added Browse section with "All Prompts" reset link
- Added "All Suites" and "All Levels" options to filters
- Added `data-active` state highlighting to all sidebar items

### December 2024 (Update)
- **Batch Operations**: Added selection mode with batch delete
- **Selection Mode**: Toggle with "Select" button, custom grid with checkboxes
- **Batch Action Bar**: Select all, selected count, batch delete button
- **Individual Card Actions**: View, Edit, Delete buttons on each card
- **Enhanced Detail Page**:
  - Prompt Starter card (emerald theme)
  - Detailed Prompt card (violet theme)
  - Organization Context section
  - Performance Metrics section
  - Expert Validation section
  - Extended metadata badges (category, task type, pattern type)
- **API Enhancement**: Flexible lookup by UUID, slug, or prompt_code
- **Updated Prompt Schema**: Added 20+ new fields for comprehensive data display
