# Superadmin Domain Management Guide 🔐

## ✅ **Features Implemented**

### 1. **Add Domains** ✅
- Create new knowledge domains via UI
- Configure tier (1, 2, or 3)
- Set priority within tier
- Configure all domain properties

### 2. **Delete Domains** ✅
- Delete domains (with safety checks)
- Prevents deletion if domain has associated documents
- Superadmin-only access

### 3. **Edit Domains** ✅
- Edit domain properties
- **Update tier mapping** (change tier 1 ↔ 2 ↔ 3)
- Update priority within tier
- Update all other properties

---

## 🔐 **Access Control**

### Superadmin Only
All domain management operations require **superadmin** role:

- ✅ `POST /api/admin/knowledge-domains` - Create domain
- ✅ `PUT /api/admin/knowledge-domains/[id]` - Update domain
- ✅ `DELETE /api/admin/knowledge-domains/[id]` - Delete domain

**Authentication**: Uses `requireSuperAdmin` middleware

---

## 🎯 **Tier Mapping**

### What is Tier Mapping?

Tiers organize domains by priority:
- **Tier 1 (Core)**: Mission-critical domains (Regulatory, Clinical, etc.)
- **Tier 2 (Specialized)**: High-value specialized domains
- **Tier 3 (Emerging)**: Future-focused emerging domains

### How to Map Domains to Tiers

1. **Click on any domain** in the Knowledge Domains page
2. **Click "Edit"** button
3. **Select Tier** from dropdown:
   - Tier 1: Core
   - Tier 2: Specialized
   - Tier 3: Emerging
4. **Set Priority** (number within tier)
5. **Click "Save Changes"**

### Example: Moving Domain from Tier 2 → Tier 1

```
1. Open domain details
2. Click "Edit"
3. Change Tier: Tier 2 → Tier 1
4. Adjust Priority (e.g., set to 5)
5. Save
```

**Result**: Domain now appears in Tier 1 section, sorted by priority.

---

## 📋 **API Endpoints**

### Create Domain
```http
POST /api/admin/knowledge-domains
Content-Type: application/json

{
  "code": "NEW_DOMAIN",
  "name": "New Domain Name",
  "slug": "new_domain",
  "description": "Domain description",
  "tier": 1,  // ← Tier mapping
  "priority": 1,
  "keywords": ["keyword1", "keyword2"],
  "color": "#3B82F6"
}
```

### Update Domain (Tier Mapping)
```http
PUT /api/admin/knowledge-domains/[id]
Content-Type: application/json

{
  "tier": 2,  // ← Change tier
  "priority": 10,  // ← Update priority
  "name": "Updated Name"
}
```

### Delete Domain
```http
DELETE /api/admin/knowledge-domains/[id]
```

**Safety**: Returns error if domain has associated documents.

---

## 🎨 **UI Features**

### Domain List Page (`/knowledge-domains`)
- ✅ View all domains grouped by tier
- ✅ Filter by tier
- ✅ Search domains
- ✅ Click domain to edit/delete

### Edit Dialog
- ✅ Edit tier mapping (dropdown)
- ✅ Edit priority (number input)
- ✅ Edit name, description, keywords
- ✅ Edit color, models
- ✅ Save/Cancel buttons

### Delete Functionality
- ✅ Confirmation dialog
- ✅ Prevents deletion if documents exist
- ✅ Clear error messages

---

## 🔒 **Security**

### Authentication
- All operations require **superadmin** role
- Uses `requireSuperAdmin` middleware
- Audit logging for all operations

### Validation
- Tier must be 1, 2, or 3
- Unique constraints on code, name, slug
- Prevents deletion with associated documents

---

## 📊 **Usage Examples**

### Example 1: Add New Domain to Tier 2

1. Click **"Add Domain"** button
2. Fill form:
   - Name: "Advanced Analytics"
   - Code: "ADV_ANALYTICS"
   - Tier: **Tier 2: Specialized**
   - Priority: 25
3. Click **"Create Domain"**

### Example 2: Move Domain from Tier 3 → Tier 1

1. Click domain in list
2. Click **"Edit"**
3. Change:
   - Tier: **Tier 3** → **Tier 1**
   - Priority: 1 → 16
4. Click **"Save Changes"**

### Example 3: Delete Domain

1. Click domain in list
2. Click **"Delete"** button (red)
3. Confirm deletion
4. Domain removed (if no documents)

---

## ✅ **Current Status**

- ✅ Add domain API & UI
- ✅ Delete domain API & UI
- ✅ Edit domain API & UI
- ✅ Tier mapping (change tier)
- ✅ Priority management
- ✅ Superadmin authentication
- ✅ Safety checks

**All features are complete and ready to use!** 🎉

---

## 🚀 **Quick Start**

1. **Navigate to**: `/knowledge-domains`
2. **As superadmin**, you'll see:
   - "Add Domain" button
   - Edit/Delete buttons on each domain
3. **Click domain** → Edit tier mapping
4. **Save changes** → Tier updated! ✅

---

**Superadmin domain management is fully functional!** 🔐✨

