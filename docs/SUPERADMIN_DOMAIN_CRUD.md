# Super Admin Domain CRUD Operations

## 🔐 Overview

Super Admin users can perform full CRUD (Create, Read, Update, Delete) operations on knowledge domains using the unified RAG domain architecture (`knowledge_domains_new` table).

## ✅ Features

### 1. **Create Domain** ✅
- Create new knowledge domains with all fields
- Supports both new architecture (`knowledge_domains_new`) and legacy table (`knowledge_domains`)
- Auto-generates slug if not provided
- Validates required fields and tier values
- Sets default priority within tier

### 2. **Read Domains** ✅
- List all domains with tier grouping
- Supports filtering and sorting
- Works with both new and old architectures

### 3. **Update Domain** ✅
- Update any domain field
- Change tier mapping (move between tiers)
- Update priority within tier
- Partial updates (only provided fields)

### 4. **Delete Domain** ✅
- Delete domains with safety checks
- Prevents deletion if domain has associated documents
- Shows helpful error messages

## 🔒 Access Control

### Super Admin Only
All domain management operations require **super_admin** role:

- ✅ `GET /api/admin/knowledge-domains` - List domains
- ✅ `POST /api/admin/knowledge-domains` - Create domain
- ✅ `PUT /api/admin/knowledge-domains/[id]` - Update domain
- ✅ `DELETE /api/admin/knowledge-domains/[id]` - Delete domain

**Authentication**: Uses `requireSuperAdmin` middleware

## 📋 API Endpoints

### GET /api/admin/knowledge-domains
List all knowledge domains

**Response:**
```json
{
  "success": true,
  "domains": [...],
  "domainsByTier": {
    "tier1": [...],
    "tier2": [...],
    "tier3": [...]
  },
  "counts": {
    "total": 32,
    "tier1": 10,
    "tier2": 15,
    "tier3": 7
  }
}
```

### POST /api/admin/knowledge-domains
Create new knowledge domain

**Request Body:**
```json
{
  "code": "DESIGN_THINKING",
  "name": "Design Thinking",
  "slug": "design_thinking",
  "description": "Human-centered design methodologies...",
  "tier": 2,
  "priority": 25,
  "function_id": "innovation_product_development",
  "function_name": "Innovation & Product Development",
  "domain_description_llm": "Covers human-centered design...",
  "maturity_level": "Established",
  "regulatory_exposure": "Low",
  "pii_sensitivity": "Low",
  "embedding_model": "text-embedding-3-large",
  "rag_priority_weight": 0.85,
  "access_policy": "public",
  "domain_scope": "global",
  "keywords": ["design thinking", "UX", "user experience"],
  "color": "#8B5CF6",
  "icon": "lightbulb"
}
```

**Response:**
```json
{
  "success": true,
  "domain": {...},
  "message": "Domain created successfully"
}
```

### PUT /api/admin/knowledge-domains/[id]
Update knowledge domain

**Request Body (partial update):**
```json
{
  "tier": 1,
  "priority": 10,
  "name": "Updated Name",
  "rag_priority_weight": 0.95
}
```

**Response:**
```json
{
  "success": true,
  "domain": {...},
  "message": "Domain updated successfully"
}
```

### DELETE /api/admin/knowledge-domains/[id]
Delete knowledge domain

**Response:**
```json
{
  "success": true,
  "message": "Domain \"Design Thinking\" deleted successfully"
}
```

**Error Response (if documents exist):**
```json
{
  "error": "Cannot delete domain with associated documents",
  "documentsCount": 5,
  "suggestion": "Update or delete associated documents first, or set domain to inactive instead"
}
```

## 🎯 Domain Fields

### Required Fields
- `code` - Domain code (unique)
- `name` / `domain_name` - Domain name
- `slug` / `domain_id` - Domain identifier (unique)
- `tier` - Tier (1, 2, or 3)

### Optional Fields (New Architecture)
- `function_id` - Function identifier
- `function_name` - Function name
- `domain_description_llm` - LLM-readable description
- `domain_scope` - Scope (global, enterprise, user)
- `enterprise_id` - Enterprise ID (for enterprise scoped)
- `owner_user_id` - Owner user ID (for user scoped)
- `maturity_level` - Established | Specialized | Emerging | Draft
- `regulatory_exposure` - High | Medium | Low
- `pii_sensitivity` - None | Low | Medium | High
- `lifecycle_stage` - Array of stages
- `governance_owner` - Governance owner
- `last_review_owner_role` - Last review owner role
- `embedding_model` - Embedding model name
- `rag_priority_weight` - Priority weight (0-1)
- `access_policy` - public | enterprise_confidential | team_confidential | personal_draft

### Legacy Fields (Backward Compatibility)
- `description` - Domain description
- `keywords` - Array of keywords
- `sub_domains` - Array of sub-domains
- `color` - UI color code
- `icon` - UI icon name
- `agent_count_estimate` - Estimated agent count
- `recommended_models` - Model recommendations JSON
- `metadata` - Additional metadata JSON
- `is_active` - Active status

## 🔄 New Domains Added

### 1. Design Thinking
- **Domain ID**: `design_thinking`
- **Tier**: 2 (Specialized)
- **Function**: Innovation & Product Development
- **Description**: Human-centered design methodologies and design-led innovation

### 2. Strategy
- **Domain ID**: `strategy`
- **Tier**: 2 (Specialized)
- **Function**: Corporate Strategy
- **Description**: Strategic planning, business strategy, competitive strategy

### 3. Strategic Foresight
- **Domain ID**: `strategic_foresight`
- **Tier**: 3 (Emerging)
- **Function**: Corporate Strategy
- **Description**: Scenario planning, trend analysis, horizon scanning

## 🎨 UI Features

### Domain Management Page (`/knowledge-domains`)
- ✅ View all domains grouped by tier
- ✅ Filter by tier (1, 2, 3, or all)
- ✅ Search domains by name, description, or keywords
- ✅ Click domain to view/edit/delete
- ✅ Create new domain button (super admin only)

### Create/Edit Dialog
- ✅ Form with all domain fields
- ✅ Tier selection dropdown
- ✅ Priority number input
- ✅ All new architecture fields
- ✅ Validation and error handling
- ✅ Save/Cancel buttons

### Delete Functionality
- ✅ Confirmation dialog
- ✅ Prevents deletion if documents exist
- ✅ Clear error messages

## 🔒 Security

### Authentication
- All operations require **super_admin** role
- Uses `requireSuperAdmin` middleware
- Audit logging for all operations

### Validation
- Tier must be 1, 2, or 3
- Unique constraints on code, name, slug/domain_id
- Prevents deletion with associated documents
- Validates enum values (maturity_level, access_policy, etc.)

## 📊 Usage Examples

### Example 1: Create Design Thinking Domain

```bash
POST /api/admin/knowledge-domains
{
  "code": "DESIGN_THINKING",
  "name": "Design Thinking",
  "slug": "design_thinking",
  "tier": 2,
  "function_id": "innovation_product_development",
  "domain_description_llm": "Covers human-centered design methodologies..."
}
```

### Example 2: Update Domain Tier

```bash
PUT /api/admin/knowledge-domains/strategy
{
  "tier": 1,
  "priority": 5
}
```

### Example 3: Delete Domain

```bash
DELETE /api/admin/knowledge-domains/old_domain_id
```

## ✅ Migration Script

A migration script has been created to:
1. Add "Design Thinking" domain
2. Split "Strategy/Foresight" into "Strategy" and "Strategic Foresight"
3. Preserve existing data

Run the migration:
```sql
\i database/sql/migrations/2025/20250131000003_add_design_thinking_split_strategy.sql
```

## 🔍 Verification

After migration, verify domains were created:

```sql
SELECT domain_id, domain_name, tier, priority 
FROM knowledge_domains_new 
WHERE domain_id IN ('design_thinking', 'strategy', 'strategic_foresight')
ORDER BY tier, priority;
```

