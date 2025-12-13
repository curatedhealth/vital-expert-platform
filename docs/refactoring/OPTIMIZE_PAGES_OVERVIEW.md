# Optimize Pages Overview

> **Status:** Active Development
> **Updated:** 2025-12-13
> **Location:** `/optimize/*`

---

## Page Inventory

| Page | Route | Lines | Status | Refactor Priority |
|------|-------|-------|--------|-------------------|
| Personas List | `/optimize/personas` | 611 | Styled | High |
| Persona Detail | `/optimize/personas/[slug]` | 643 | Styled | High |
| Jobs-to-Be-Done | `/optimize/jobs-to-be-done` | 529 | Styled | Medium |
| Ontology Explorer | `/optimize/ontology` | 23 | Ideal | None |
| **Total** | | **1,806** | | |

---

## Brand Guidelines Applied

All pages updated to **VITAL Brand Guidelines v6.0**:

| Element | Value | Tailwind Class |
|---------|-------|----------------|
| Primary Accent | #9055E0 | `purple-600` |
| Canvas Background | Stone 50 | `bg-stone-50` |
| Surface | Stone 100 / White | `bg-stone-100`, `bg-white` |
| Text Primary | Stone 800 | `text-stone-800` |
| Text Secondary | Stone 600 | `text-stone-600` |
| Text Muted | Stone 500 | `text-stone-500` |
| Borders | Stone 200/300 | `border-stone-200` |
| Hover States | Purple 300/400 | `hover:border-purple-300` |
| Transitions | 150ms | `duration-150` |

---

## Shared Components Used

All pages import from `@vital/ui`:

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@vital/ui';
```

---

## Sidebar Context Mapping

Each page has a context-specific sidebar configured in `app-sidebar.tsx`:

| Route | Sidebar Component | Features |
|-------|-------------------|----------|
| `/optimize/personas` | `SidebarPersonasContent` | Archetype filters, org hierarchy |
| `/optimize/jobs-to-be-done` | `SidebarJTBDContent` | Priority, status, category filters |
| `/optimize/ontology` | `SidebarOntologyContent` | Layer navigation, search |

---

## File Locations

```
apps/vital-system/src/
├── app/(app)/optimize/
│   ├── personas/
│   │   ├── page.tsx              (611 lines)
│   │   └── [slug]/
│   │       └── page.tsx          (643 lines)
│   ├── jobs-to-be-done/
│   │   └── page.tsx              (529 lines)
│   └── ontology/
│       └── page.tsx              (23 lines - wrapper)
├── components/
│   ├── personas/                  (1,877 lines total)
│   │   ├── PersonaCard.tsx
│   │   ├── PersonaListItem.tsx
│   │   ├── PersonaStatsCards.tsx
│   │   ├── PersonaFilters.tsx
│   │   ├── PersonaFiltersSidebar.tsx
│   │   ├── PersonaModalsV2.tsx
│   │   ├── HierarchicalOrgFilter.tsx
│   │   ├── types.ts
│   │   └── index.ts
│   ├── jtbd/                      (shared JTBD components)
│   └── sidebar-view-content.tsx   (sidebar definitions)
└── features/
    └── ontology-explorer/         (ontology feature module)
```

---

## Refactoring Plans

| Page | Plan Document | Priority |
|------|---------------|----------|
| Personas | [PERSONAS_OPTIMIZATION_PLAN.md](./PERSONAS_OPTIMIZATION_PLAN.md) | High |
| JTBD | [JTBD_OPTIMIZATION_PLAN.md](./JTBD_OPTIMIZATION_PLAN.md) | Medium |
| Ontology | N/A (already optimal) | None |

---

## Optimization Targets

### Current vs Target Line Counts

| Page | Current | Target | Reduction |
|------|---------|--------|-----------|
| `personas/page.tsx` | 611 | ~120 | 80% |
| `personas/[slug]/page.tsx` | 643 | ~100 | 85% |
| `jobs-to-be-done/page.tsx` | 529 | ~180 | 66% |
| `ontology/page.tsx` | 23 | 23 | 0% |
| **Total** | **1,806** | **~423** | **77%** |

---

## Dependencies

### Shared Packages

- `@vital/ui` - shadcn/ui components
- `@vital/ai-ui` - AI-specific components

### Internal Components

- `@/components/page-header` - Consistent page headers
- `@/components/shared/AssetLoadingSkeleton` - Loading states
- `@/components/shared/AssetEmptyState` - Empty states
- `@/components/shared/AssetResultsCount` - Results counter

---

## Related Documentation

- [Personas Optimization Plan](./PERSONAS_OPTIMIZATION_PLAN.md)
- [JTBD Optimization Plan](./JTBD_OPTIMIZATION_PLAN.md)
- [Brand Guidelines v6.0](../architecture/VITAL_BRAND_GUIDELINES_V6.md)
- [Frontend Integration Reference](../FRONTEND_INTEGRATION_REFERENCE.md)
