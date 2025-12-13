# Jobs-to-Be-Done Page Optimization Plan

> **Status:** Planned
> **Created:** 2025-12-13
> **Target Page:** `/optimize/jobs-to-be-done`

---

## Executive Summary

The JTBD page contains **529 lines** that can be reduced to **~180 lines** (66% reduction) through component extraction and hook creation.

---

## Current State Analysis

### Page File

| File | Lines | Purpose |
|------|-------|---------|
| `jobs-to-be-done/page.tsx` | 529 | List view with 3 view modes |

### Existing Components (`src/components/jtbd/`)

Components referenced but need verification:
- `JTBDCard` - Grid card component
- `JTBDListItem` - List row component
- Types: `JTBD`, `JTBDStats`

---

## Code Analysis

### Sections to Extract

| Section | Lines | Description |
|---------|-------|-------------|
| Stats Cards | 241-305 (~65) | 5 stat cards at top |
| Distribution Cards | 307-352 (~45) | Priority + Status distribution |
| Filters Bar | 354-436 (~82) | Search, category, priority, status, sort |
| Data Fetching | 86-119 (~33) | `loadJTBDs` function |
| Filter Logic | 126-178 (~52) | `filteredJTBDs` memo |

---

## Phase 1: Extract Components

### Components to Create

| Component | Lines | Source Location | Props |
|-----------|-------|-----------------|-------|
| `JTBDStatsCards` | ~65 | Lines 241-305 | `stats: JTBDStats` |
| `JTBDDistributionCards` | ~45 | Lines 307-352 | `stats: JTBDStats` |
| `JTBDFiltersBar` | ~80 | Lines 354-436 | `filters, onFilterChange, onReset` |

### Target Location

```
src/components/jtbd/
├── JTBDCard.tsx           (existing)
├── JTBDListItem.tsx       (existing)
├── JTBDStatsCards.tsx     (NEW)
├── JTBDDistributionCards.tsx (NEW)
├── JTBDFiltersBar.tsx     (NEW)
├── types.ts               (existing)
└── index.ts               (update exports)
```

---

## Phase 2: Extract Hooks

### Hooks to Create

| Hook | Lines | Returns |
|------|-------|---------|
| `useJTBDData` | ~50 | `{ jtbds, stats, loading, error, reload }` |
| `useJTBDFilters` | ~60 | `{ filtered, filters, setFilter, resetFilters }` |

### Target Location

```
src/features/jtbd/
├── hooks/
│   ├── index.ts
│   ├── useJTBDData.ts     (NEW)
│   └── useJTBDFilters.ts  (NEW)
└── index.ts
```

---

## Phase 3: Refactored Page Structure

```tsx
// jobs-to-be-done/page.tsx (~180 lines)
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger, Button } from '@vital/ui';
import { Target, Plus, RefreshCw } from 'lucide-react';
import {
  JTBDCard,
  JTBDListItem,
  JTBDStatsCards,
  JTBDDistributionCards,
  JTBDFiltersBar,
} from '@/components/jtbd';
import { useJTBDData, useJTBDFilters } from '@/features/jtbd';
import { AssetLoadingSkeleton, AssetEmptyState } from '@/components/shared';

export default function JTBDPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view') || 'grid';

  const { jtbds, stats, loading, reload } = useJTBDData();
  const { filtered, filters, setFilter, resetFilters } = useJTBDFilters(jtbds, searchParams);

  const updateURL = (params: Record<string, string>) => {
    // URL update logic
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <PageHeader
        icon={Target}
        title="Jobs to Be Done"
        description={`${stats.total} user jobs across categories`}
        actions={...}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <JTBDStatsCards stats={stats} />
          <JTBDDistributionCards stats={stats} />
          <JTBDFiltersBar
            filters={filters}
            categories={uniqueCategories}
            onFilterChange={setFilter}
            onReset={resetFilters}
            resultCount={filtered.length}
          />

          {loading && <AssetLoadingSkeleton variant={viewMode} />}

          {!loading && (
            <Tabs value={viewMode} onValueChange={(v) => updateURL({ view: v })}>
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
              </TabsList>

              <TabsContent value="grid">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((jtbd) => (
                      <JTBDCard key={jtbd.id} jtbd={jtbd} onClick={handleClick} />
                    ))}
                  </div>
                ) : (
                  <AssetEmptyState ... />
                )}
              </TabsContent>

              {/* Similar for list and categories views */}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Components

- [ ] Create `JTBDStatsCards.tsx` in `src/components/jtbd/`
- [ ] Create `JTBDDistributionCards.tsx` in `src/components/jtbd/`
- [ ] Create `JTBDFiltersBar.tsx` in `src/components/jtbd/`
- [ ] Update `src/components/jtbd/index.ts` exports

### Phase 2: Hooks

- [ ] Create `src/features/jtbd/` folder structure
- [ ] Create `useJTBDData.ts` hook
- [ ] Create `useJTBDFilters.ts` hook
- [ ] Create barrel exports

### Phase 3: Refactor Page

- [ ] Refactor `jobs-to-be-done/page.tsx` to use new components
- [ ] Verify TypeScript compilation
- [ ] Test all view modes and filters

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| `jobs-to-be-done/page.tsx` | 529 lines | ~180 lines | **66%** |
| New components | 0 | 3 | +3 |
| New hooks | 0 | 2 | +2 |
| Reusability | Low | High | ✅ |

---

## Brand Guidelines Compliance

All new components follow **VITAL Brand Guidelines v6.0**:

- Primary: `purple-600`
- Canvas: `stone-50`
- Text: `stone-600`, `stone-700`, `stone-800`
- Transitions: `duration-150`

---

## Dependencies

- Already uses `@vital/ui` components
- Already uses shared `AssetLoadingSkeleton`, `AssetEmptyState`
- Follows same patterns as Personas pages

---

## Related Documents

- [Optimize Pages Overview](./OPTIMIZE_PAGES_OVERVIEW.md)
- [Personas Optimization Plan](./PERSONAS_OPTIMIZATION_PLAN.md)
