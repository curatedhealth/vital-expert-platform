# Database Migration: Enhanced Services & Libraries (v2)

## ✅ Updated Migration - Works with Existing Schema

This migration is specifically designed to work with your **existing database schema**. It enhances existing tables and creates new library features without breaking anything.

## Migration File
- **Location**: `/database/migrations/022_enhance_services_and_create_libraries.sql`
- **Date**: 2025-11-23
- **Status**: ✅ Ready to apply (compatible with existing schema)

## What This Migration Does

### Part 1: Enhance Existing `services_registry` Table
**Adds** these columns (preserves existing data):
- `icon` - Icon identifier
- `service_category` - Category classification
- `service_type` - Type classification
- `is_public` - Public visibility flag
- `requires_auth` - Authentication requirement
- `rate_limit_per_minute` - Per-minute rate limit
- `quota_per_day` - Daily quota
- `base_cost_per_use` - Base cost
- `cost_per_token` - Token cost
- `api_endpoint` - API endpoint URL
- `webhook_url` - Webhook URL
- `required_services` - Service dependencies (array)
- `tags` - Tags for discovery (array)
- `version` - Version tracking
- `changelog` - Change log

**Updates** existing services:
- Sets categories for ask_expert, ask_panel, workflows, solutions_marketplace
- Adds icons and service types

### Part 2: Create `template_library` Table (NEW)
Universal template storage that **complements** your existing `prompts` table:
- Links to existing prompts via `source_table` and `source_id`
- Supports multiple template types (prompt, workflow, agent, panel)
- Rating and favorites system
- Usage tracking
- Template versioning and forking
- Discovery features (tags, categories, search)

**Initial Data**: Automatically migrates top 10 validated prompts from your existing `prompts` table

### Part 3: Create `workflow_library` Table (NEW)
Enhances your existing `workflows` table with library features:
- Links to workflows via `workflow_id`
- Discovery metadata (keywords, categories, difficulty)
- Visibility control (private, organization, public)
- Featured and verified flags
- Usage metrics (views, clones, favorites)
- Rating system
- Requirements tracking (tools, services, API keys needed)
- Documentation (setup, usage, troubleshooting guides)

### Part 4: Create `user_favorites` Table (NEW)
User bookmarks for any item type:
- Supports workflows, templates, tools, services, prompts
- Personal notes
- Quick access

### Part 5: Create `user_ratings` Table (NEW)
5-star rating and review system:
- Ratings for workflows, templates, tools, prompts
- Written reviews
- Helpful votes
- **Auto-updates** aggregate ratings on template_library and workflow_library

### Part 6-7: Security & Automation
- **Row Level Security (RLS)** on all new tables
- **Automatic triggers** for:
  - Updating `updated_at` timestamps
  - Calculating average ratings
  - Counting favorites
- **Functions** for aggregate calculations

### Part 8-9: Seed Data
- Updates existing services with new metadata
- Inserts missing core services
- Migrates top validated prompts to template_library

## Existing Tables (Preserved)
Your existing tables are **NOT modified** (except services_registry gets new columns):
- ✅ `prompts` - Keep using as-is
- ✅ `tools` - Keep using as-is
- ✅ `workflows` - Keep using as-is
- ✅ `workflow_templates` - Keep using as-is

## New Tables Created
- 🆕 `template_library` - Enhanced template management
- 🆕 `workflow_library` - Enhanced workflow discovery
- 🆕 `user_favorites` - User bookmarks
- 🆕 `user_ratings` - Ratings & reviews

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://bomltkhixeatxuoxmolq.supabase.co
2. Navigate to **SQL Editor**
3. Copy contents of `database/migrations/022_enhance_services_and_create_libraries.sql`
4. Click **Run**

### Option 2: Command Line
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/migrations/022_enhance_services_and_create_libraries.sql
```

### Option 3: Supabase CLI
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
supabase db push database/migrations/022_enhance_services_and_create_libraries.sql
```

## Verification After Migration

Run these queries to verify success:

```sql
-- 1. Check services_registry was enhanced
SELECT 
  service_name, 
  display_name, 
  service_category, 
  service_type, 
  icon
FROM services_registry 
ORDER BY service_name;

-- Expected: 4 services with categories and icons

-- 2. Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'template_library',
    'workflow_library', 
    'user_favorites',
    'user_ratings'
  );

-- Expected: 4 tables

-- 3. Check template migration
SELECT 
  COUNT(*) as migrated_templates,
  template_type,
  template_category
FROM template_library
GROUP BY template_type, template_category;

-- Expected: ~10 prompt templates migrated

-- 4. Check column additions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services_registry'
  AND column_name IN ('service_category', 'icon', 'tags', 'service_type')
ORDER BY column_name;

-- Expected: All new columns present
```

## Integration Examples

### 1. Fetch All Services with Categories
```sql
SELECT 
  service_name,
  display_name,
  service_category,
  service_type,
  icon,
  is_enabled,
  is_public
FROM services_registry
WHERE is_enabled = TRUE
  AND deleted_at IS NULL
ORDER BY service_category, display_name;
```

### 2. Browse Template Library
```sql
SELECT 
  t.template_name,
  t.display_name,
  t.template_type,
  t.template_category,
  t.rating_average,
  t.rating_count,
  t.usage_count,
  t.is_featured
FROM template_library t
WHERE t.is_public = TRUE
  AND t.is_enabled = TRUE
  AND t.deleted_at IS NULL
ORDER BY t.is_featured DESC, t.rating_average DESC NULLS LAST, t.usage_count DESC
LIMIT 20;
```

### 3. Get Workflow with Library Metadata
```sql
SELECT 
  w.id,
  w.name,
  w.description,
  w.workflow_type,
  wl.library_category,
  wl.difficulty_level,
  wl.visibility,
  wl.is_featured,
  wl.rating_average,
  wl.view_count,
  wl.clone_count,
  wl.favorite_count,
  wl.required_tools,
  wl.required_services
FROM workflows w
LEFT JOIN workflow_library wl ON w.id = wl.workflow_id
WHERE w.is_active = TRUE
  AND (wl.visibility = 'public' OR w.created_by = auth.uid())
ORDER BY wl.is_featured DESC, wl.rating_average DESC NULLS LAST;
```

### 4. User Favorites
```sql
-- Add favorite
INSERT INTO user_favorites (user_id, item_type, item_id, notes)
VALUES (auth.uid(), 'workflow', '<workflow-uuid>', 'My favorite workflow for data analysis');

-- Get user's favorites
SELECT 
  uf.item_type,
  uf.item_id,
  uf.notes,
  uf.created_at,
  CASE 
    WHEN uf.item_type = 'workflow' THEN w.name
    WHEN uf.item_type = 'template' THEN t.template_name
    WHEN uf.item_type = 'tool' THEN tl.name
  END as item_name
FROM user_favorites uf
LEFT JOIN workflows w ON uf.item_type = 'workflow' AND uf.item_id = w.id
LEFT JOIN template_library t ON uf.item_type = 'template' AND uf.item_id = t.id
LEFT JOIN tools tl ON uf.item_type = 'tool' AND uf.item_id = tl.id
WHERE uf.user_id = auth.uid()
ORDER BY uf.created_at DESC;
```

### 5. Add Rating
```sql
-- Add a rating
INSERT INTO user_ratings (user_id, item_type, item_id, rating, review)
VALUES (
  auth.uid(), 
  'workflow', 
  '<workflow-uuid>', 
  5, 
  'Excellent workflow! Saved me hours of work.'
)
ON CONFLICT (user_id, item_type, item_id) 
DO UPDATE SET 
  rating = EXCLUDED.rating,
  review = EXCLUDED.review,
  updated_at = NOW();

-- Aggregates are automatically updated via trigger!
```

## API Endpoints to Create

Based on the new tables, you should create these API routes:

```typescript
// Services
GET  /api/services                    // List all services
GET  /api/services/:slug              // Get service details

// Templates
GET  /api/templates                   // Browse templates
GET  /api/templates/:id               // Get template
POST /api/templates                   // Create custom template
GET  /api/templates/categories        // List categories
GET  /api/templates/featured          // Featured templates

// Workflows Library
GET  /api/workflows/library           // Browse workflow library
GET  /api/workflows/library/featured  // Featured workflows
GET  /api/workflows/:id/library       // Get workflow library metadata
POST /api/workflows/:id/clone         // Clone a workflow

// User Favorites
GET  /api/user/favorites              // Get user favorites
POST /api/favorites                   // Add favorite
DELETE /api/favorites/:id             // Remove favorite

// User Ratings
GET  /api/ratings/:itemType/:itemId   // Get item ratings
POST /api/ratings                     // Add/update rating
DELETE /api/ratings/:id               // Delete rating
POST /api/ratings/:id/helpful         // Mark rating as helpful
```

## Frontend Components Needed

1. **Service Registry Display**
   - Grid/list of available services
   - Service cards with icons and descriptions

2. **Template Gallery**
   - Browse templates by type and category
   - Template preview and details
   - Rating and favorite buttons
   - Use template button

3. **Workflow Marketplace**
   - Browse public workflows
   - Filter by category, difficulty, rating
   - Clone workflow button
   - View requirements (tools, services, API keys)

4. **Favorites Panel**
   - User's bookmarked items
   - Quick access to favorites

5. **Rating & Review Components**
   - Star rating widget
   - Review form
   - Display ratings and reviews

## Benefits

✅ **Backward Compatible** - Existing tables and data preserved
✅ **Enhanced Discovery** - Tags, categories, search keywords
✅ **Community Features** - Ratings, reviews, favorites
✅ **Better Organization** - Library metadata for workflows
✅ **Usage Analytics** - Track views, clones, usage
✅ **Quality Control** - Featured and verified flags
✅ **Template Reuse** - Easy template sharing and forking
✅ **Auto-aggregation** - Ratings calculated automatically

## What's Preserved

- ✅ All existing `prompts` data
- ✅ All existing `tools` data
- ✅ All existing `workflows` data
- ✅ All existing `workflow_templates` data
- ✅ All existing `services_registry` data (enhanced with new columns)
- ✅ All existing relationships and foreign keys
- ✅ All existing RLS policies

## Migration Safety

- ✅ Uses `ADD COLUMN IF NOT EXISTS` for safety
- ✅ Uses `CREATE TABLE IF NOT EXISTS` for idempotency
- ✅ Uses `DROP POLICY IF EXISTS` before creating policies
- ✅ Uses `DROP TRIGGER IF EXISTS` before creating triggers
- ✅ Updates existing data safely with WHERE clauses
- ✅ Inserts new data only if not exists
- ✅ All changes are additive (no data deletion)

---

**Ready to Apply**: This migration is production-ready and safe to run on your existing database!

