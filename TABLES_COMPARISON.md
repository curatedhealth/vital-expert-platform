# Quick Reference: Existing vs New Tables

## Tables You Already Have (Preserved) ✅

### 1. `services_registry`
**Status**: ✅ Enhanced (columns added)
- Stores: Service configurations (ask_expert, ask_panel, workflows, solutions_marketplace)
- Changes: Added 15 new columns (icon, service_category, tags, etc.)
- Data: Preserved and enhanced

### 2. `prompts`
**Status**: ✅ Untouched
- Stores: Prompt templates with variables
- Comprehensive schema with validation, metrics, RAG support
- Keep using as-is

### 3. `tools`
**Status**: ✅ Untouched  
- Stores: Tool configurations and integrations
- Includes function specs, authentication, safety levels
- Keep using as-is

### 4. `workflows`
**Status**: ✅ Untouched
- Stores: Workflow definitions and configurations
- Includes workflow types, templates, triggers
- Keep using as-is

### 5. `workflow_templates`
**Status**: ✅ Untouched
- Stores: Workflow template definitions
- Includes JTBD bindings, complexity levels
- Keep using as-is

## New Tables Created 🆕

### 1. `template_library` (NEW)
**Purpose**: Universal template library with enhanced discovery
- **Complements**: Existing `prompts` table
- **Links to**: Can reference prompts, workflow_templates, or be standalone
- **Features**: Ratings, favorites, usage tracking, template forking

**Key Fields**:
```sql
- source_table, source_id (link to existing tables)
- template_type (prompt, workflow, agent, panel)
- template_category, framework
- rating_average, rating_count
- usage_count, is_featured, is_verified
```

### 2. `workflow_library` (NEW)
**Purpose**: Enhanced metadata for workflow discovery
- **Extends**: Existing `workflows` table (1:1 relationship)
- **Links to**: workflows via workflow_id
- **Features**: Discovery, visibility control, requirements tracking

**Key Fields**:
```sql
- workflow_id (FK to workflows)
- library_category, difficulty_level
- visibility (private, organization, public)
- view_count, clone_count, favorite_count
- rating_average, rating_count
- required_tools, required_services, required_api_keys
```

### 3. `user_favorites` (NEW)
**Purpose**: User bookmarks for any item
- **Supports**: workflows, templates, tools, services, prompts
- **Features**: Personal notes, quick access

**Key Fields**:
```sql
- user_id, item_type, item_id
- notes
```

### 4. `user_ratings` (NEW)
**Purpose**: 5-star rating and review system
- **Supports**: workflows, templates, tools, prompts
- **Features**: Auto-aggregation to parent tables

**Key Fields**:
```sql
- user_id, item_type, item_id
- rating (1-5), review
- helpful_count
```

## Table Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING SCHEMA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  prompts (existing)          tools (existing)               │
│    ↓                           ↓                            │
│    └─ source_table ─────┐     └─ (referenced by)           │
│                         ↓                                    │
│  template_library (NEW) ← Links to existing prompts         │
│    - rating_average                                         │
│    - usage_count                                            │
│    - is_featured                                            │
│                                                              │
│  workflows (existing)                                       │
│    ↓                                                         │
│    └─ workflow_id ──────→ workflow_library (NEW)            │
│                              - visibility                    │
│                              - rating_average                │
│                              - required_tools []             │
│                              - required_services []          │
│                                                              │
│  services_registry (enhanced)                               │
│    - service_category (NEW)                                 │
│    - icon (NEW)                                             │
│    - tags[] (NEW)                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    NEW FEATURES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  user_favorites (NEW)                                       │
│    - item_type: 'workflow', 'template', 'tool', 'prompt'   │
│    - item_id: UUID of any item                             │
│                                                              │
│  user_ratings (NEW)                                         │
│    - item_type: 'workflow', 'template', 'tool', 'prompt'   │
│    - item_id: UUID of any item                             │
│    - rating: 1-5 stars                                      │
│    - review: text                                           │
│    │                                                         │
│    └─ [TRIGGER] ──→ Updates rating_average on:             │
│                      - template_library                     │
│                      - workflow_library                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Migration Strategy

### Phase 1: Apply Migration ✅
```bash
# Run the migration SQL
database/migrations/022_enhance_services_and_create_libraries.sql
```

**What Happens**:
1. ✅ Adds 15 columns to `services_registry`
2. ✅ Creates 4 new tables
3. ✅ Sets up RLS policies
4. ✅ Creates triggers for auto-aggregation
5. ✅ Updates existing services with categories
6. ✅ Migrates 10 validated prompts to `template_library`

### Phase 2: Gradual Adoption 📈

**Keep Using Existing Tables**:
- ✅ Continue using `prompts` for prompt management
- ✅ Continue using `tools` for tool management  
- ✅ Continue using `workflows` for workflow execution
- ✅ Continue using `workflow_templates` for templates

**Start Using New Features**:
- 🆕 Use `template_library` for **browsing/discovery** (links back to prompts)
- 🆕 Use `workflow_library` for **workflow marketplace** features
- 🆕 Use `user_favorites` for **bookmarking**
- 🆕 Use `user_ratings` for **community ratings**

### Phase 3: API Integration 🔌

Create these new endpoints:
```
GET  /api/library/templates       → Browse template_library
GET  /api/library/workflows       → Browse workflow_library with metadata
POST /api/favorites               → Add to favorites
POST /api/ratings                 → Add rating (auto-updates aggregates)
```

Enhance existing endpoints:
```
GET  /api/workflows/:id           → Include workflow_library metadata
GET  /api/prompts/:id             → Include template_library link if exists
```

## Key Advantages

### 1. No Breaking Changes
- ✅ All existing tables preserved
- ✅ All existing data intact
- ✅ All existing queries still work

### 2. Gradual Enhancement
- 🔄 Start with new tables empty
- 🔄 Gradually populate as users interact
- 🔄 Link existing data at your own pace

### 3. Flexible Architecture
- 📦 Use `template_library` as a "view layer" on top of existing `prompts`
- 📦 Use `workflow_library` as metadata layer on top of `workflows`
- 📦 Keep source data in original tables

### 4. Auto-Aggregation
- ⚡ Rating averages calculated automatically
- ⚡ Favorite counts updated via triggers
- ⚡ Usage counts tracked

## Example Usage Patterns

### Pattern 1: Browse Templates (New Feature)
```sql
-- Browse all templates (includes migrated prompts)
SELECT * FROM template_library 
WHERE is_public = TRUE AND is_enabled = TRUE
ORDER BY rating_average DESC, usage_count DESC;
```

### Pattern 2: Get Prompt Details (Existing + New)
```sql
-- Get prompt from prompts table (existing)
SELECT * FROM prompts WHERE id = :prompt_id;

-- Get library metadata if it exists (new)
SELECT * FROM template_library 
WHERE source_table = 'prompts' AND source_id = :prompt_id;
```

### Pattern 3: Workflow with Marketplace Features
```sql
-- Workflow basic info (existing)
SELECT * FROM workflows WHERE id = :workflow_id;

-- Workflow library metadata (new)
SELECT * FROM workflow_library WHERE workflow_id = :workflow_id;
```

### Pattern 4: User Interaction
```sql
-- Add to favorites (new)
INSERT INTO user_favorites (user_id, item_type, item_id)
VALUES (auth.uid(), 'workflow', :workflow_id);

-- Rate a workflow (new - auto-updates workflow_library)
INSERT INTO user_ratings (user_id, item_type, item_id, rating, review)
VALUES (auth.uid(), 'workflow', :workflow_id, 5, 'Great workflow!');
```

## Summary

| Feature | Table | Status | Purpose |
|---------|-------|--------|---------|
| Prompts | `prompts` | ✅ Existing | Source of truth for prompts |
| Tools | `tools` | ✅ Existing | Source of truth for tools |
| Workflows | `workflows` | ✅ Existing | Source of truth for workflows |
| Workflow Templates | `workflow_templates` | ✅ Existing | Source of truth for templates |
| Services | `services_registry` | ✅ Enhanced | Service registry (15 new columns) |
| Template Discovery | `template_library` | 🆕 New | Browse/discover templates |
| Workflow Marketplace | `workflow_library` | 🆕 New | Workflow discovery metadata |
| User Bookmarks | `user_favorites` | 🆕 New | Personal favorites |
| Community Ratings | `user_ratings` | 🆕 New | Ratings & reviews |

**Migration File**: `database/migrations/022_enhance_services_and_create_libraries.sql`
**Documentation**: `DATABASE_MIGRATION_ENHANCED_V2.md`

