# Frontend Data Mapping - Complete ✅

**Date:** 2025-11-10
**Status:** PRODUCTION READY
**Mapping:** Database ↔ Frontend

---

## 🎯 Problem Solved

The frontend components were using local constants (PRESET_TEMPLATES) instead of fetching from the Supabase database. This is now fixed with:

1. ✅ Centralized type definitions
2. ✅ Database-to-frontend mapping functions
3. ✅ API service with React hooks
4. ✅ Updated components to use real data
5. ✅ Fallback to presets if database is empty

---

## 📁 New Files Created

### **1. Centralized Types**
`apps/digital-health-startup/src/types/panel.types.ts`

**Database Types** (snake_case - matches Supabase):
- `PanelTemplateRow` - Maps to `panel_templates` table
- `PanelManagementPatternRow` - Maps to `panel_management_patterns` table
- `UserPanelCustomizationRow` - Maps to `user_panel_customizations` table

**Frontend Types** (camelCase - for UI components):
- `PanelTemplate` - UI model for templates
- `PanelManagementPattern` - UI model for patterns
- `PanelTypeInfo` - UI model for type information

**Mapping Functions**:
```typescript
mapTemplateRowToTemplate(row) // DB → Frontend
mapTemplateToTemplateRow(template) // Frontend → DB
```

**Type Guards**:
```typescript
isPanelType(value)
isManagementType(value)
isFacilitationPattern(value)
```

### **2. API Service**
`apps/digital-health-startup/src/services/panel-templates-api.ts`

**PanelTemplatesAPI Class**:
- `getPublicTemplates()` - Get all public templates
- `getTemplatesByType(type)` - Filter by panel type
- `getTemplatesByManagement(type)` - Filter by management
- `getTemplatesByCategory(category)` - Filter by category
- `searchTemplates(query)` - Full-text search
- `getPopularTemplates(limit)` - Most used
- `getTopRatedTemplates(limit)` - Highest rated
- `createTemplate()` - Save new template
- `updateTemplate()` - Modify existing
- `incrementUsage()` - Track usage
- `getUserCustomizations()` - Get user's customizations
- `saveCustomization()` - Save user customization
- `toggleFavorite()` - Favorite templates

**React Hooks**:
```typescript
const { templates, loading, error } = usePanelTemplates();
const { templates } = usePopularTemplates(10);
const { templates } = useTemplatesByType('structured');
```

---

## 🔄 Data Flow

### **From Database to Frontend**:

```
Supabase DB (panel_templates table)
  ↓ snake_case columns
PanelTemplateRow interface
  ↓ mapTemplateRowToTemplate()
PanelTemplate interface (camelCase)
  ↓ React components
UI Display
```

**Example**:
```typescript
// Database row
{
  panel_type: 'structured',
  management_type: 'ai_only',
  suggested_agents: [...],
  optimal_experts: 5,
  duration_typical: 15
}

// Frontend model
{
  panelType: 'structured',
  managementType: 'ai_only',
  suggestedAgents: [...],
  optimalExperts: 5,
  durationTypical: 15
}
```

### **From Frontend to Database**:

```
UI Component
  ↓ PanelTemplate (camelCase)
mapTemplateToTemplateRow()
  ↓ snake_case columns
API Service
  ↓ Supabase insert/update
Database Storage
```

---

## 🎨 Updated Components

### **PanelTemplatesLibrary.tsx**

**Before**:
```typescript
// Used local constant
const templates = PRESET_TEMPLATES;
```

**After**:
```typescript
// Fetches from database
const { templates, loading, error } = usePanelTemplates();

// Fallback to presets if database is empty
const allTemplates = templates.length > 0 ? templates : PRESET_TEMPLATES;
```

**Features Added**:
- ✅ Loading state with spinner
- ✅ Error handling with fallback
- ✅ Real-time data from Supabase
- ✅ Proper type mapping
- ✅ Usage tracking

---

## 📊 Type Mapping Reference

### **Panel Types** (6 types):
| Database Value | Frontend Display | Color |
|---|---|---|
| `structured` | Structured Panel | Blue |
| `open` | Open Panel | Purple |
| `socratic` | Socratic Panel | Amber |
| `adversarial` | Adversarial Panel | Red |
| `delphi` | Delphi Panel | Green |
| `hybrid` | Hybrid Panel | Violet |

### **Management Types** (4 types):
| Database Value | Frontend Display | Tier |
|---|---|---|
| `ai_only` | AI Only | Standard ($500) |
| `human_moderated` | Human Moderated | Professional ($2K) |
| `hybrid_facilitated` | Hybrid Facilitated | Professional ($2K) |
| `human_expert` | Human Expert | Enterprise ($10K) |

### **Facilitation Patterns** (5 patterns):
| Database Value | Frontend Display |
|---|---|
| `sequential` | Sequential |
| `parallel` | Parallel |
| `round_robin` | Round Robin |
| `consensus_driven` | Consensus Driven |
| `time_boxed` | Time Boxed |

---

## 🔧 Database Schema Mapping

### **panel_templates Table** → **PanelTemplate Interface**

| Database Column | TypeScript Property | Type | Notes |
|---|---|---|---|
| `id` | `id` | `string` | UUID |
| `name` | `name` | `string` | Display name |
| `description` | `description` | `string` | Full description |
| `category` | `category` | `string` | e.g., "Regulatory Affairs" |
| `panel_type` | `panelType` | `PanelType` | Enum: structured, open, etc. |
| `management_type` | `managementType` | `ManagementType` | Enum: ai_only, etc. |
| `facilitation_pattern` | `facilitationPattern` | `FacilitationPattern` | Enum: sequential, etc. |
| `suggested_agents` | `suggestedAgents` | `string[]` | Agent names array |
| `min_experts` | `minExperts` | `number` | Minimum expert count |
| `max_experts` | `maxExperts` | `number` | Maximum expert count |
| `optimal_experts` | `optimalExperts` | `number` | Recommended count |
| `duration_min` | `durationMin` | `number` | Minutes |
| `duration_typical` | `durationTypical` | `number` | Minutes |
| `duration_max` | `durationMax` | `number` | Minutes |
| `max_rounds` | `maxRounds` | `number` | Discussion rounds |
| `requires_moderator` | `requiresModerator` | `boolean` | Needs human moderator |
| `parallel_execution` | `parallelExecution` | `boolean` | Concurrent vs sequential |
| `enable_consensus` | `enableConsensus` | `boolean` | Build consensus |
| `consensus_threshold` | `consensusThreshold` | `number \| undefined` | 0.0-1.0 |
| `use_cases` | `useCases` | `string[]` | Array of use cases |
| `example_scenarios` | `exampleScenarios` | `ExampleScenario[]` | JSONB array |
| `tags` | `tags` | `string[]` | Search tags |
| `usage_count` | `usageCount` | `number` | Times used |
| `avg_rating` | `avgRating` | `number` | 0.0-5.0 |
| `is_preset` | `isPreset` | `boolean` | System preset |
| `is_public` | (not mapped) | `boolean` | Visibility |
| `created_at` | (not mapped) | `string` | Timestamp |
| `updated_at` | (not mapped) | `string` | Timestamp |

---

## 🚀 Usage Examples

### **Get All Templates**:
```typescript
import { usePanelTemplates } from '@/services/panel-templates-api';

function MyComponent() {
  const { templates, loading, error } = usePanelTemplates();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {templates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
```

### **Filter by Type**:
```typescript
import { getPanelTemplatesAPI } from '@/services/panel-templates-api';

async function loadStructuredPanels() {
  const api = getPanelTemplatesAPI();
  const templates = await api.getTemplatesByType('structured');
  return templates;
}
```

### **Create Custom Template**:
```typescript
const api = getPanelTemplatesAPI();

const newTemplate: PanelTemplate = {
  id: 'temp-id', // Will be replaced by DB
  name: 'My Custom Panel',
  description: 'Custom panel for my use case',
  panelType: 'structured',
  managementType: 'ai_only',
  // ... other fields
};

const saved = await api.createTemplate(newTemplate, userId, tenantId);
```

### **Track Usage**:
```typescript
const api = getPanelTemplatesAPI();

// When user runs a template
await api.incrementUsage(templateId);
```

---

## ✅ Verification Checklist

### **Database**:
- [x] Migration applied: `20251110000000_create_panel_templates_schema.sql`
- [x] 12 preset templates seeded
- [x] 4 management patterns seeded
- [x] RLS policies active
- [x] Functions created (increment_usage, etc.)

### **Types**:
- [x] Centralized type definitions
- [x] Database row types (snake_case)
- [x] Frontend UI types (camelCase)
- [x] Mapping functions
- [x] Type guards

### **API Service**:
- [x] Supabase client integration
- [x] CRUD operations
- [x] Search & filter
- [x] Usage tracking
- [x] React hooks
- [x] Error handling

### **Components**:
- [x] PanelTemplatesLibrary uses API
- [x] Loading states
- [x] Error handling
- [x] Fallback to presets
- [x] Proper type usage

---

## 🧪 Testing Guide

### **1. Test Database Connection**:
```typescript
import { getPanelTemplatesAPI } from '@/services/panel-templates-api';

const api = getPanelTemplatesAPI();
const templates = await api.getPublicTemplates();
console.log('Templates:', templates);
```

### **2. Test in Component**:
```tsx
<PanelTemplatesLibrary
  onRunTemplate={(template) => console.log('Run:', template)}
  onCustomizeTemplate={(template) => console.log('Customize:', template)}
  onDuplicateTemplate={(template) => console.log('Duplicate:', template)}
/>
```

### **3. Verify Data Mapping**:
Check that all fields display correctly:
- Panel type badges
- Expert counts
- Duration ranges
- Use cases
- Ratings & usage counts

### **4. Test Filters**:
- Search by name
- Filter by panel type
- Filter by management type
- Filter by category
- Favorites toggle

---

## 🔐 Security

### **Row Level Security (RLS)**:
```sql
-- Public templates visible to all
CREATE POLICY "Public templates viewable"
  ON panel_templates FOR SELECT
  USING (is_public = true);

-- Users can view tenant templates
CREATE POLICY "Users can view tenant templates"
  ON panel_templates FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));
```

---

## 📝 Summary

### **What Was Fixed**:
1. ❌ **Before**: Components used hardcoded PRESET_TEMPLATES array
2. ✅ **After**: Components fetch from Supabase with fallback

### **What Was Added**:
1. ✅ Centralized type system (`panel.types.ts`)
2. ✅ Database-to-frontend mapping functions
3. ✅ Full API service (`panel-templates-api.ts`)
4. ✅ React hooks for data fetching
5. ✅ Loading & error states in components
6. ✅ Proper TypeScript types throughout

### **Benefits**:
- 🎯 **Single source of truth** - Database is the source
- 🔄 **Real-time updates** - Changes reflect immediately
- 📦 **Type safety** - Full TypeScript coverage
- 🚀 **Performance** - React hooks with proper caching
- 🛡️ **Security** - RLS policies enforced
- 🎨 **UX** - Loading states & error handling
- 📊 **Analytics** - Usage tracking built-in

---

**READY FOR PRODUCTION** ✅

All data is properly mapped between database and frontend with type safety, error handling, and fallback support.
