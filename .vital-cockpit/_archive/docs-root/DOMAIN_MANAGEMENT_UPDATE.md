# Domain Management Update - Design Thinking & Strategy Split

## ✅ Changes Completed

### 1. New Domains Created

#### Design Thinking
- **Domain ID**: `design_thinking`
- **Tier**: 2 (Specialized)
- **Function**: Innovation & Product Development
- **Description**: Human-centered design methodologies and design-led innovation

#### Strategy
- **Domain ID**: `strategy`
- **Tier**: 2 (Specialized)
- **Function**: Corporate Strategy
- **Description**: Strategic planning, business strategy, competitive strategy

#### Strategic Foresight
- **Domain ID**: `strategic_foresight`
- **Tier**: 3 (Emerging)
- **Function**: Corporate Strategy
- **Description**: Scenario planning, trend analysis, horizon scanning

### 2. Strategy/Foresight Split

The migration script:
1. Detects any existing "Strategy/Foresight" domain
2. Creates two separate domains: "Strategy" and "Strategic Foresight"
3. Archives the original combined domain (sets to inactive)

### 3. Super Admin CRUD Operations

#### API Endpoints Updated
- ✅ `GET /api/admin/knowledge-domains` - Works with both `knowledge_domains_new` and `knowledge_domains`
- ✅ `POST /api/admin/knowledge-domains` - Creates in `knowledge_domains_new` (fallback to old table)
- ✅ `PUT /api/admin/knowledge-domains/[id]` - Updates in `knowledge_domains_new` (fallback to old table)
- ✅ `DELETE /api/admin/knowledge-domains/[id]` - Deletes from `knowledge_domains_new` (fallback to old table)

#### UI Components Updated
- ✅ Domain list page loads from `knowledge_domains_new` first
- ✅ Create/Edit dialogs support new architecture fields
- ✅ Domain cards and tables display new architecture fields
- ✅ Filter and search work with both old and new architectures

## 🔒 Access Control

### Super Admin Only
All CRUD operations require `super_admin` role:
- ✅ Create domains
- ✅ Update domains (including tier changes)
- ✅ Delete domains (with safety checks)
- ✅ View all domains

**Authentication**: Uses `requireSuperAdmin` middleware from `@/middleware/auth`

## 📋 Migration Steps

### Step 1: Run Migration Script

```sql
-- Run in Supabase SQL Editor
\i database/sql/migrations/2025/20250131000003_add_design_thinking_split_strategy.sql
```

Or copy-paste the contents into Supabase SQL Editor and run.

### Step 2: Verify Domains

```sql
-- Verify new domains exist
SELECT domain_id, domain_name, tier, priority, is_active
FROM knowledge_domains_new
WHERE domain_id IN ('design_thinking', 'strategy', 'strategic_foresight')
ORDER BY tier, priority;
```

### Step 3: Check UI

1. Navigate to `/knowledge-domains`
2. You should see:
   - **Design Thinking** in Tier 2
   - **Strategy** in Tier 2
   - **Strategic Foresight** in Tier 3

## 🎯 Super Admin Features

### Create Domain
1. Click **"Add Domain"** button (super admin only)
2. Fill in domain details:
   - Domain Name
   - Code
   - Slug (auto-generated if not provided)
   - Tier (1, 2, or 3)
   - Description
   - Keywords
   - Function ID/Name (for new architecture)
   - Other optional fields
3. Click **"Create Domain"**

### Edit Domain
1. Click on any domain card/row
2. Click **"Edit"** button
3. Update any field:
   - Change tier (1 ↔ 2 ↔ 3)
   - Update priority
   - Modify name, description, etc.
   - Update new architecture fields
4. Click **"Save Changes"**

### Delete Domain
1. Click on domain
2. Click **"Delete"** button (red)
3. Confirm deletion
4. Domain is deleted if no documents are associated

## 🔍 Key Features

### Backward Compatibility
- ✅ All API endpoints work with both `knowledge_domains_new` and `knowledge_domains`
- ✅ UI components handle both old and new field names
- ✅ Fallback gracefully if new table doesn't exist

### Field Mapping
- `domain_id` ↔ `id` (for identification)
- `domain_name` ↔ `name` (for display)
- `domain_description_llm` ↔ `description` (for description)
- `slug` (backward compatibility)

### New Architecture Fields
- `function_id` / `function_name` - Function classification
- `domain_scope` - global | enterprise | user
- `maturity_level` - Established | Specialized | Emerging | Draft
- `regulatory_exposure` - High | Medium | Low
- `pii_sensitivity` - None | Low | Medium | High
- `rag_priority_weight` - Priority weight (0-1)
- `access_policy` - public | enterprise_confidential | team_confidential | personal_draft

## 📊 Domain Organization

### Tier 1: Core Domains
- Highest priority, mission-critical domains
- Examples: Regulatory Affairs, Clinical Development

### Tier 2: Specialized Domains
- High-value specialized functions
- Examples: **Design Thinking**, **Strategy**, HEOR

### Tier 3: Emerging Domains
- Future-focused, emerging domains
- Examples: **Strategic Foresight**, ESG

## ✅ Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify Design Thinking domain appears in Tier 2
- [ ] Verify Strategy domain appears in Tier 2
- [ ] Verify Strategic Foresight domain appears in Tier 3
- [ ] Create new domain via UI (super admin)
- [ ] Edit domain tier via UI (super admin)
- [ ] Update domain fields via UI (super admin)
- [ ] Delete domain via UI (super admin)
- [ ] Verify deletion prevents if documents exist
- [ ] Check domain appears in upload dropdown
- [ ] Check domain appears in documents library

## 🔄 Next Steps

1. Run migration script to add new domains
2. Test CRUD operations as super admin
3. Verify domains appear in all relevant UIs
4. Update any existing documents to use new domain IDs if needed

