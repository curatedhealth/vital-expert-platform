# 🎯 Next Migration Ready: Service Modes & Node Library

## Status: Ready to Apply ⏳

Migration `023_service_modes_and_node_library.sql` is ready but needs manual application due to Supabase connection timeout.

## What This Migration Adds

### 🎨 Complete Service Architecture

**6 New Tables**:
1. **`service_modes`** - Service configurations (Ask Expert: 4 modes, Ask Panel: 6 modes)
2. **`service_mode_templates`** - Many-to-many: modes ↔ templates
3. **`node_library`** - Reusable workflow nodes/steps
4. **`workflow_publications`** - Workflow → Service publishing
5. **`node_collections`** - Node grouping/organization
6. **`node_collection_items`** - Collection membership

### 📊 Seed Data Included

**10 Service Modes**:
- Ask Expert: Mode 1-4 (Direct, Tools, Specialist, Research)
- Ask Panel: Mode 1-6 (Open, Structured, Consensus, Debate, Review, Multi-Phase)

**7 Built-in Nodes**:
- Control Flow: Start, End, Condition
- AI Agents: Agent, Orchestrator
- Tools: Web Search, Document Parser

## 🚀 How to Apply

### Method 1: Supabase Dashboard (Recommended)
```
1. Go to https://bomltkhixeatxuoxmolq.supabase.co
2. Navigate to SQL Editor
3. Open: database/migrations/023_service_modes_and_node_library.sql
4. Copy all contents
5. Paste in SQL Editor
6. Click Run
```

### Method 2: Terminal
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/migrations/023_service_modes_and_node_library.sql
```

## ✅ After Application - Verify

```sql
-- Check service modes created
SELECT 
  s.service_name,
  COUNT(sm.id) as mode_count
FROM services_registry s
LEFT JOIN service_modes sm ON s.id = sm.service_id
WHERE sm.deleted_at IS NULL
GROUP BY s.service_name;

-- Expected results:
-- ask_expert: 4 modes
-- ask_panel: 6 modes

-- Check built-in nodes
SELECT 
  COUNT(*) as node_count,
  node_category
FROM node_library
WHERE is_builtin = TRUE
GROUP BY node_category;

-- Expected: 7 nodes across 3 categories
```

## 🎯 What You Get

### Design → Publish → Execute Flow

```
1. DESIGN in Workflow Designer
   ↓ (using nodes from node_library)
   
2. CREATE workflow
   ↓ (saved to workflows table)
   
3. PUBLISH to service
   ↓ (creates workflow_publications record)
   
4. USERS ACCESS via service view
   ↓ (Ask Expert Mode 1, Ask Panel Mode 3, etc.)
   
5. EXECUTE published workflow
   (with mode-specific configuration)
```

### Example: Publish to Ask Expert Mode 1

```sql
-- After designing workflow in designer
INSERT INTO workflow_publications (
  workflow_id,
  service_id,
  service_mode_id,
  publication_type,
  publication_status,
  workflow_snapshot
) VALUES (
  '<your-workflow-uuid>',
  (SELECT id FROM services_registry WHERE service_name = 'ask_expert'),
  (SELECT id FROM service_modes WHERE mode_code = 'ae_mode_1'),
  'mode',
  'published',
  '<workflow-definition>'::jsonb
);
```

## 📚 Documentation

- **`SERVICE_ARCHITECTURE.md`** - Complete architecture guide
- **`023_service_modes_and_node_library.sql`** - Migration SQL

## 🔗 Relation to Your Vision

This directly implements your requirements:

✅ **"we have 4 modes in ask expert, 6 modes in ask panel"**
   → service_modes table with 10 modes created

✅ **"templates for each types many to many"**
   → service_mode_templates (many-to-many linking)

✅ **"design the service in the workflow designer then publish it in each service view"**
   → workflow_publications table

✅ **"library with nodes as steps that are reusables"**
   → node_library table with 7 built-in nodes

## 🎬 Next Actions

### Priority 1: Apply Migration
```bash
# Run this in terminal or Supabase Dashboard
psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/migrations/023_service_modes_and_node_library.sql
```

### Priority 2: Build Features

**API Routes Needed**:
```typescript
// Service Modes
GET  /api/services/:slug/modes           // List modes
GET  /api/modes/:code                    // Get mode details
GET  /api/modes/:code/templates          // Templates for mode
POST /api/modes/:code/templates          // Link template to mode

// Node Library
GET  /api/nodes                          // Browse nodes
GET  /api/nodes/categories               // Node categories
GET  /api/nodes/:slug                    // Get node details
POST /api/nodes                          // Create custom node

// Workflow Publishing
POST /api/workflows/:id/publish          // Publish to service/mode
GET  /api/workflows/:id/publications     // List publications
GET  /api/services/:slug/workflows       // Published workflows for service
```

**Frontend Components**:
1. **Mode Selector** - Switch between service modes
2. **Node Palette** (Enhanced) - Browse node_library with categories
3. **Publish Modal** - Publish workflow to service/mode
4. **Service View** - Display published workflows

## 🔄 Migration Sequence

So far you've completed:
1. ✅ **Migration 022** - Services registry, template_library, workflow_library, favorites, ratings
2. ⏳ **Migration 023** - Service modes, node library, publications (READY TO APPLY)

This creates the foundation for:
3. **Next**: Enhanced workflow designer with node library
4. **Next**: Service views with mode switching
5. **Next**: Publishing interface

---

**Status**: Migration created and documented
**Action Required**: Apply via Supabase Dashboard or psql
**Expected Time**: ~5-10 seconds to run
**Breaking Changes**: None (all new tables)

