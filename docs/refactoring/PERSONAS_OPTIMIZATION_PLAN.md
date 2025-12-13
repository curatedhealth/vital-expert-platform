# Personas Pages Optimization Plan

> **Status:** Planned
> **Created:** 2025-12-13
> **Target Pages:** `/optimize/personas`, `/optimize/personas/[slug]`

---

## Executive Summary

The personas pages contain **1,254 lines** across 2 files that can be reduced to **~220 lines** (82% reduction) through component extraction and hook creation.

---

## Current State Analysis

### Page Files

| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `personas/page.tsx` | 611 | List view with 5 view modes | Mixed concerns, duplicated config |
| `personas/[slug]/page.tsx` | 643 | Detail view with 4 tabs | Large inline tab content |
| **Total** | **1,254** | | |

### Existing Components (`src/components/personas/`)

| File | Lines | Purpose |
|------|-------|---------|
| `PersonaModalsV2.tsx` | 578 | Edit/Delete modals |
| `PersonaCard.tsx` | 217 | Grid card component |
| `PersonaFiltersSidebar.tsx` | 216 | Sidebar filters |
| `PersonaStatsCards.tsx` | 199 | Stats display |
| `HierarchicalOrgFilter.tsx` | 184 | Org tree filter |
| `types.ts` | 163 | Types + ARCHETYPE_INFO constant |
| `PersonaFilters.tsx` | 154 | Filter bar |
| `PersonaListItem.tsx` | 143 | List row component |
| `index.ts` | 23 | Exports |
| **Total** | **1,877** | |

### Key Problems Identified

1. **Duplicated Configuration**
   - `archetypeConfig` in `page.tsx` (lines 38-63) duplicates `ARCHETYPE_INFO` from `types.ts`

2. **Large Inline Content**
   - Detail page has 4 tab sections (~90 lines each) inline
   - List page has 3 view mode sections (~60 lines each) inline

3. **No Custom Hooks**
   - Data fetching logic embedded in components
   - Filter/sort logic repeated and not reusable

4. **Missing Feature Structure**
   - No `/features/personas/` folder for domain-specific logic

---

## Phase 1: Detail Page Extraction (`personas/[slug]/page.tsx`)

### Components to Extract

| Component | Lines | Source Location | Props |
|-----------|-------|-----------------|-------|
| `PersonaSummaryCard` | ~90 | Lines 220-312 | `persona: Persona` |
| `PersonaJTBDTab` | ~45 | Lines 324-368 | `jtbds: JTBD[]` |
| `PersonaPainTab` | ~70 | Lines 370-438 | `painPoints, challenges` |
| `PersonaGoalsTab` | ~110 | Lines 440-547 | `goals, motivations, values, traits` |
| `PersonaStakeholdersTab` | ~90 | Lines 549-635 | `internal, external` |

### Target Structure

```tsx
// personas/[slug]/page.tsx (~100 lines)
export default function PersonaDetailPage() {
  const { slug } = useParams();
  const { persona, loading, error, reload } = usePersonaDetail(slug);

  if (loading) return <PersonaDetailSkeleton />;
  if (error) return <PersonaDetailError error={error} onRetry={reload} />;
  if (!persona) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <PageHeader ... />
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PersonaSummaryCard persona={persona} />
          <div className="lg:col-span-2">
            <Tabs defaultValue="jobs">
              <TabsList>...</TabsList>
              <TabsContent value="jobs"><PersonaJTBDTab ... /></TabsContent>
              <TabsContent value="pain"><PersonaPainTab ... /></TabsContent>
              <TabsContent value="goals"><PersonaGoalsTab ... /></TabsContent>
              <TabsContent value="stakeholders"><PersonaStakeholdersTab ... /></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### New Hook: `usePersonaDetail`

```tsx
// hooks/usePersonaDetail.ts
export function usePersonaDetail(slug: string) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Fetch logic from lines 51-98
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  return { persona, loading, error, reload: load };
}
```

---

## Phase 2: List Page Extraction (`personas/page.tsx`)

### Components to Extract

| Component | Lines | Source Location | Props |
|-----------|-------|-----------------|-------|
| `PersonaArchetypeView` | ~65 | Lines 435-500 | `personas, onPersonaClick` |
| `PersonaDepartmentView` | ~35 | Lines 502-538 | `personas, departments, onPersonaClick` |
| `PersonaFocusView` | ~60 | Lines 540-602 | `personas, onPersonaClick, onSortChange` |

### Hooks to Extract

| Hook | Lines | Source Location | Returns |
|------|-------|-----------------|---------|
| `usePersonaData` | ~80 | Lines 126-197 | `personas, stats, loading, error, reload` |
| `usePersonaFilters` | ~60 | Lines 208-264 | `filtered, sorted, filters, setFilters` |

### Configuration Cleanup

**Remove duplicate `archetypeConfig`** (lines 38-63) and import from types:

```tsx
// Before (in page.tsx)
const archetypeConfig = {
  AUTOMATOR: { icon: <Zap />, color: 'text-cyan-600', ... },
  // ... duplicated from types.ts
};

// After
import { ARCHETYPE_INFO } from '@/components/personas';
```

### Target Structure

```tsx
// personas/page.tsx (~120 lines)
export default function PersonasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view') || 'grid';

  const { personas, stats, loading, error, reload } = usePersonaData();
  const { filtered, sorted, filters, updateFilters } = usePersonaFilters(personas, searchParams);

  const handlePersonaClick = (p: Persona) => router.push(`/optimize/personas/${p.slug}`);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <PageHeader ... />
      <div className="flex-1 overflow-y-auto">
        {loading && <AssetLoadingSkeleton />}
        {!loading && <PersonaStatsCards stats={stats} />}
        {!loading && (
          <Tabs value={viewMode} onValueChange={...}>
            <TabsList>...</TabsList>
            <TabsContent value="grid"><PersonaGridView ... /></TabsContent>
            <TabsContent value="list"><PersonaListView ... /></TabsContent>
            <TabsContent value="archetypes"><PersonaArchetypeView ... /></TabsContent>
            <TabsContent value="departments"><PersonaDepartmentView ... /></TabsContent>
            <TabsContent value="focus"><PersonaFocusView ... /></TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 3: Feature Folder Structure

### New Directory Layout

```
src/features/personas/
├── components/
│   ├── index.ts
│   ├── detail/
│   │   ├── PersonaSummaryCard.tsx
│   │   ├── PersonaJTBDTab.tsx
│   │   ├── PersonaPainTab.tsx
│   │   ├── PersonaGoalsTab.tsx
│   │   └── PersonaStakeholdersTab.tsx
│   └── views/
│       ├── PersonaArchetypeView.tsx
│       ├── PersonaDepartmentView.tsx
│       └── PersonaFocusView.tsx
├── hooks/
│   ├── index.ts
│   ├── usePersonaData.ts
│   ├── usePersonaDetail.ts
│   └── usePersonaFilters.ts
└── index.ts
```

### Keep in `src/components/personas/`

These remain as shared UI components:
- `PersonaCard.tsx`
- `PersonaListItem.tsx`
- `PersonaStatsCards.tsx`
- `PersonaFilters.tsx`
- `PersonaFiltersSidebar.tsx`
- `PersonaModalsV2.tsx`
- `types.ts`

---

## Implementation Checklist

### Phase 1: Detail Page (Priority: High)

- [ ] Create `src/features/personas/hooks/usePersonaDetail.ts`
- [ ] Create `src/features/personas/components/detail/PersonaSummaryCard.tsx`
- [ ] Create `src/features/personas/components/detail/PersonaJTBDTab.tsx`
- [ ] Create `src/features/personas/components/detail/PersonaPainTab.tsx`
- [ ] Create `src/features/personas/components/detail/PersonaGoalsTab.tsx`
- [ ] Create `src/features/personas/components/detail/PersonaStakeholdersTab.tsx`
- [ ] Refactor `personas/[slug]/page.tsx` to use new components
- [ ] Verify TypeScript compilation
- [ ] Test all tab functionality

### Phase 2: List Page (Priority: Medium)

- [ ] Create `src/features/personas/hooks/usePersonaData.ts`
- [ ] Create `src/features/personas/hooks/usePersonaFilters.ts`
- [ ] Create `src/features/personas/components/views/PersonaArchetypeView.tsx`
- [ ] Create `src/features/personas/components/views/PersonaDepartmentView.tsx`
- [ ] Create `src/features/personas/components/views/PersonaFocusView.tsx`
- [ ] Remove duplicate `archetypeConfig`, use `ARCHETYPE_INFO`
- [ ] Refactor `personas/page.tsx` to use new components/hooks
- [ ] Verify TypeScript compilation
- [ ] Test all view modes

### Phase 3: Cleanup (Priority: Low)

- [ ] Create barrel exports (`index.ts` files)
- [ ] Update any imports across codebase
- [ ] Remove unused code
- [ ] Update this document with completion status

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| `personas/page.tsx` | 611 lines | ~120 lines | **80%** |
| `personas/[slug]/page.tsx` | 643 lines | ~100 lines | **85%** |
| New reusable components | 0 | 8 | +8 |
| New hooks | 0 | 3 | +3 |
| Code duplication | High | Eliminated | ✅ |
| Testability | Low | High | ✅ |

---

## Brand Guidelines Compliance

All new components will follow **VITAL Brand Guidelines v6.0**:

- **Primary Accent:** `purple-600` (#9055E0)
- **Canvas:** `stone-50`
- **Surface:** `stone-100`, `white`
- **Text:** `stone-600`, `stone-700`, `stone-800`
- **Transitions:** `duration-150`
- **Imports:** Use `@vital/ui` for shared components

---

## Related Documents

- [VITAL Brand Guidelines v6.0](../architecture/VITAL_BRAND_GUIDELINES_V6.md)
- [Frontend Integration Reference](../FRONTEND_INTEGRATION_REFERENCE.md)
- [Component Library](../../packages/ui/README.md)
