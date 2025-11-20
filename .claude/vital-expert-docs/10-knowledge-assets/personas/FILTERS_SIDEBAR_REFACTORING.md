# Personas Filters - Sidebar Refactoring

**Date**: 2025-11-19  
**Status**: ✅ COMPLETE

---

## 🎯 Overview

Refactored the personas filters to:
1. Move filters to the sidebar
2. Use actual org structure data (Functions → Departments → Roles)
3. Create a reusable hierarchical filter component
4. Update stats to reflect current data

---

## 📁 Files Created/Modified

### 1. Reusable Hierarchical Filter Component
**File**: `apps/vital-system/src/components/personas/HierarchicalOrgFilter.tsx`

**Purpose**: Reusable component for Function → Department → Role filtering

**Features**:
- Cascading dropdowns (Function → Department → Role)
- Automatically filters dependent dropdowns based on parent selection
- Uses actual org structure data from API
- Handles loading states
- Supports slug-based or ID-based filtering

**Props**:
```typescript
interface HierarchicalOrgFilterProps {
  selectedFunction: string;
  selectedDepartment: string;
  selectedRole: string;
  onFunctionChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  orgStructure?: OrgStructure;
  loading?: boolean;
}
```

### 2. Sidebar Filters Component
**File**: `apps/vital-system/src/components/personas/PersonaFiltersSidebar.tsx`

**Purpose**: Sidebar version of filters with hierarchical org filter

**Features**:
- Search input
- Hierarchical org filter (Function → Department → Role)
- Seniority filter
- Reset button (only shows when filters are active)
- Persona count display
- Fetches org structure from API

### 3. API Endpoint
**File**: `apps/vital-system/src/app/api/org-structure/route.ts`

**Purpose**: Fetch organizational structure (functions, departments, roles)

**Features**:
- Fetches from `org_functions`, `org_departments`, `org_roles` tables
- Builds hierarchical mappings (departmentsByFunction, rolesByDepartment, rolesByFunction)
- Tenant filtering via `allowed_tenants`
- Returns structured data for frontend consumption

**Response**:
```json
{
  "success": true,
  "data": {
    "functions": [...],
    "departments": [...],
    "roles": [...],
    "departmentsByFunction": {...},
    "rolesByDepartment": {...},
    "rolesByFunction": {...},
    "stats": {
      "totalFunctions": 42,
      "totalDepartments": 294,
      "totalRoles": 1389
    }
  }
}
```

### 4. Sidebar Content Component
**File**: `apps/vital-system/src/components/sidebar-view-content.tsx`

**Added**: `SidebarPersonasContent` component

**Features**:
- Renders navigation links
- Includes PersonaFiltersSidebar component
- Uses custom events to sync filter state with page

### 5. Updated App Sidebar
**File**: `apps/vital-system/src/components/app-sidebar.tsx`

**Changes**:
- Added check for `/personas` path
- Renders `SidebarPersonasContent` for personas routes

### 6. Updated Personas Page
**File**: `apps/vital-system/src/app/(app)/personas/page.tsx`

**Changes**:
- Removed old `PersonaFilters` component from main content
- Added custom event listeners to sync with sidebar filters
- Filters now controlled from sidebar

### 7. Updated Stats Cards
**File**: `apps/vital-system/src/components/personas/PersonaStatsCards.tsx`

**Changes**:
- Now uses `totalRoles`, `totalDepartments`, `totalFunctions` from API
- Falls back to counting unique slugs if API stats not available

### 8. Updated API Route
**File**: `apps/vital-system/src/app/api/personas/route.ts`

**Changes**:
- Added queries to fetch actual counts from org tables
- Returns stats object with total counts

---

## 🔄 Filter Flow

### Hierarchical Filtering
1. **Function Selected** → Filters departments to show only those in selected function
2. **Department Selected** → Filters roles to show only those in selected department
3. **Role Selected** → Filters personas to show only those with selected role

### State Synchronization
- **Sidebar → Page**: Custom event `personas-filters-change`
- **Page → Sidebar**: Custom event `personas-filters-update`
- Both components listen and update accordingly

---

## 📊 Data Structure

### Org Structure API Response
```typescript
interface OrgStructure {
  functions: Array<{
    id: string;
    slug: string;
    name?: string;
    department_name?: string;
  }>;
  departments: Array<{
    id: string;
    slug: string;
    name?: string;
    department_name?: string;
    function_id?: string;
  }>;
  roles: Array<{
    id: string;
    slug: string;
    name?: string;
    role_name?: string;
    department_id?: string;
    function_id?: string;
  }>;
  departmentsByFunction: Record<string, Department[]>;
  rolesByDepartment: Record<string, Role[]>;
  rolesByFunction: Record<string, Role[]>;
}
```

---

## ✅ Benefits

1. **Reusable Component**: `HierarchicalOrgFilter` can be used anywhere
2. **Accurate Data**: Uses actual org structure tables, not persona slugs
3. **Better UX**: Filters in sidebar, more space for content
4. **Cascading Filters**: Dependent dropdowns automatically filter
5. **Real-time Stats**: Shows actual counts from org tables

---

## 🔧 Technical Details

### Custom Events
- `personas-filters-change`: Dispatched from sidebar when filters change
- `personas-filters-update`: Dispatched from page to update sidebar state

### Filter Matching
- Uses slugs for matching when available
- Falls back to IDs if slugs not present
- Handles both slug-based and ID-based persona data

---

## 🧪 Testing Checklist

- [x] Hierarchical filter component created
- [x] Sidebar filters component created
- [x] API endpoint created
- [x] Sidebar integration complete
- [x] Filter state synchronization working
- [x] Stats updated to use org table counts
- [ ] Test with actual org structure data
- [ ] Test cascading filter behavior
- [ ] Test filter reset functionality

---

## 🔗 Related Files

- `apps/vital-system/src/components/personas/HierarchicalOrgFilter.tsx` - Reusable filter
- `apps/vital-system/src/components/personas/PersonaFiltersSidebar.tsx` - Sidebar filters
- `apps/vital-system/src/app/api/org-structure/route.ts` - Org structure API
- `apps/vital-system/src/components/sidebar-view-content.tsx` - Sidebar content
- `apps/vital-system/src/components/app-sidebar.tsx` - Main sidebar
- `apps/vital-system/src/app/(app)/personas/page.tsx` - Personas page

---

**Status**: ✅ Complete and ready for testing  
**Last Updated**: 2025-11-19

