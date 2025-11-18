# SP (Use Case Categories) - Final Implementation

## Summary

Successfully standardized the terminology to use **SP (Use Case Categories)** as the norm, aligning Pharma Medical Affairs workflows with Digital Health naming conventions while maintaining the strategic pillar structure.

## Terminology Alignment

### Before (Mixed Terminology):
- **Digital Health**: Use Cases → Workflows → Tasks
- **Pharma**: Strategic Pillars → JTBDs → Workflows → Tasks
- **Problem**: Inconsistent terminology across industries

### After (Unified with SP):
- **Digital Health**: Use Cases → Workflows → Tasks
- **Pharma**: **SP (Use Case Categories)** → Workflows → Tasks
- **Benefit**: Consistent "Use Case" concept, with SP as categorical organization

## Implementation

### 1. Renamed Configuration

**From**: `STRATEGIC_PILLARS`
**To**: `USE_CASE_CATEGORIES`

```typescript
const USE_CASE_CATEGORIES = {
  'SP01': {
    code: 'SP01',
    name: 'SP01: Growth & Market Access',      // SP code prefix
    shortName: 'Growth',
    icon: Target,
    color: 'text-emerald-700',
    // ...
  },
  'SP02': {
    code: 'SP02',
    name: 'SP02: Scientific Excellence',       // SP code prefix
    // ...
  },
  // ... SP03-SP07
};
```

### 2. Updated UI Labels

#### Page Title:
```tsx
<h2>Medical Affairs Use Case Categories</h2>
<p>Click on each category to view related workflows and tasks</p>
```

#### Category Cards:
```tsx
<CardTitle>SP01: Growth & Market Access</CardTitle>
<Badge>{workflows.length} Workflows</Badge>  // Not "JTBDs"
```

### 3. Hierarchical Structure

```
SP (Use Case Category)
  ├─ SP01: Growth & Market Access
  │   └─ Workflows (15)
  │       └─ Tasks
  ├─ SP02: Scientific Excellence
  │   └─ Workflows (16)
  │       └─ Tasks
  ├─ SP03: Stakeholder Engagement
  │   └─ Workflows (15)
  │       └─ Tasks
  ... (SP04-SP07)
```

## Visual Presentation

### SP Category Card (Collapsed):

```
┌──────────────────────────────────────────────────────┐
│ ┌───┐                                              ▶ │
│ │ 🎯│  SP01: Growth & Market Access  [15 Workflows] │
│ └───┘                                                │
│   Evidence generation and value demonstration        │
└──────────────────────────────────────────────────────┘
```

### SP Category Card (Expanded):

```
┌──────────────────────────────────────────────────────┐
│ ┌───┐                                              ▼ │
│ │ 🎯│  SP01: Growth & Market Access  [15 Workflows] │
│ └───┘                                                │
│   Evidence generation and value demonstration        │
├──────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │Workflow1│  │Workflow2│  │Workflow3│            │
│  │Annual   │  │Evidence │  │Cross-   │            │
│  │Strategic│  │Gen.     │  │Function │            │
│  │Planning │  │Planning │  │Coord.   │            │
│  └─────────┘  └─────────┘  └─────────┘            │
│  ... (showing all 15 workflows in SP01)            │
└──────────────────────────────────────────────────────┘
```

## SP Code Structure

### All 7 SP Categories:

| SP Code | Category Name | Workflows | Icon | Color |
|---------|--------------|-----------|------|-------|
| **SP01** | Growth & Market Access | 15 | 🎯 Target | Emerald |
| **SP02** | Scientific Excellence | 16 | 💡 Lightbulb | Blue |
| **SP03** | Stakeholder Engagement | 15 | 👥 Users | Purple |
| **SP04** | Compliance & Quality | 20 | 🛡️ Shield | Red |
| **SP05** | Operational Excellence | 20 | ⚙️ Cog | Orange |
| **SP06** | Talent Development | 9 | 🎓 GraduationCap | Indigo |
| **SP07** | Innovation & Digital | 16 | 🚀 Rocket | Pink |
| **Total** | **7 Categories** | **120** | - | - |

## Benefits of SP Terminology

### 1. Consistency Across Industries
- Both Startup and Pharma use "Use Case" terminology
- SP provides additional categorical organization for Pharma
- Easier onboarding for users switching between industries

### 2. Clear Hierarchy
```
Digital Health:
Use Case → Workflows → Tasks

Pharma:
SP (Use Case Category) → Workflows → Tasks
                ↑
            Categorical grouping
```

### 3. Scalability
- Easy to add new SP categories (SP08, SP09, etc.)
- Standard naming convention (SP + number)
- Consistent with industry best practices

### 4. Code Clarity
```typescript
// Clear, self-documenting
const categories = USE_CASE_CATEGORIES;
const spCode = 'SP01';
const categoryName = categories[spCode].name; // "SP01: Growth & Market Access"
```

## User Experience

### Navigation Flow:

1. **Select Industry**: "Pharma & Life Sciences"
2. **Select Domain**: "Medical Affairs"
3. **View Categories**: 7 SP cards displayed
4. **Expand SP**: Click "SP01: Growth & Market Access"
5. **View Workflows**: See all 15 workflows in this category
6. **Select Workflow**: Click a workflow card
7. **View Tasks**: Navigate to workflow detail with tasks

### Filter + Category Combination:

```
Industry: [Pharma]
Domain: [Medical Affairs]
         ↓
    SP Categories:
    ├─ SP01 (15 workflows)
    ├─ SP02 (16 workflows)
    ├─ SP03 (15 workflows)
    ├─ SP04 (20 workflows)
    ├─ SP05 (20 workflows)
    ├─ SP06 (9 workflows)
    └─ SP07 (16 workflows)
```

## Badge Display on Workflow Cards

Each workflow card shows its SP category:

```tsx
<Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
  SP01  {/* or SP02, SP03, etc. */}
</Badge>
```

## API Response Structure

```json
{
  "success": true,
  "data": {
    "useCases": [...],
    "stats": {
      "by_strategic_pillar": {
        "SP01": 15,
        "SP02": 16,
        "SP03": 15,
        "SP04": 20,
        "SP05": 20,
        "SP06": 9,
        "SP07": 16
      }
    },
    "strategicPillars": {
      "SP01": [...15 workflows],
      "SP02": [...16 workflows],
      // ... SP03-SP07
    }
  }
}
```

## Code Changes Summary

### Files Modified:

1. **[page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx:93-164)**
   - Renamed `STRATEGIC_PILLARS` → `USE_CASE_CATEGORIES`
   - Added `code` field to each category
   - Prefixed names with SP code (e.g., "SP01: Growth & Market Access")

2. **[page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx:473-527)**
   - Updated page title: "Medical Affairs Use Case Categories"
   - Changed description to reference "categories"
   - Updated badge text: "X Workflows" instead of "X JTBDs"

### Key Terminology Changes:

| Old Term | New Term | Context |
|----------|----------|---------|
| Strategic Pillars | SP / Use Case Categories | Overall concept |
| Strategic Objectives | Use Case Categories | Page title |
| JTBDs | Workflows | Badge labels |
| Pillar | Category/SP | Code variables |

## Alignment with Digital Health

### Digital Health View:
```
Clinical Development (Domain)
├─ Use Case 1
│   └─ Workflows → Tasks
└─ Use Case 2
    └─ Workflows → Tasks
```

### Pharma View (Aligned):
```
Medical Affairs (Domain)
├─ SP01: Growth & Market Access (Use Case Category)
│   └─ Workflows → Tasks
└─ SP02: Scientific Excellence (Use Case Category)
    └─ Workflows → Tasks
```

Both use "Use Case" terminology, with Pharma adding SP categorical organization.

## Future Enhancements

1. **SP Filtering**: Filter across all SPs by criteria
2. **SP Analytics**: Track usage/completion per SP
3. **SP Comparison**: Compare metrics across SPs
4. **SP Roadmap**: Strategic planning view by SP
5. **Cross-SP Workflows**: Workflows spanning multiple SPs

## Success Criteria

- ✅ Consistent "Use Case" terminology across industries
- ✅ SP codes clearly displayed (SP01-SP07)
- ✅ "Workflows" label used (not "JTBDs")
- ✅ Category-based organization maintained
- ✅ Clear hierarchy: SP → Workflows → Tasks
- ✅ Scalable naming convention

---

**Status**: ✅ COMPLETE

**Date**: 2025-11-09

**Impact**: High - Provides consistent terminology while maintaining strategic organization

**Key Innovation**: SP serves as both identifier AND category name, creating unified taxonomy
