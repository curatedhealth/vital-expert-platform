# Frontend Refactoring Plan v2.0

**Date:** December 13, 2025
**Scope:** All frontend pages EXCEPT /ask-expert and /ask-panel (handled separately)
**Goal:** Brand v6.0 compliance, component consolidation, TypeScript fixes

---

## Executive Summary

| Category | Pages | Lines | Priority |
|----------|-------|-------|----------|
| Massive (1000+) | 6 | 8,062 | P0 - Critical |
| Large (500-999) | 12 | 7,653 | P1 - High |
| Medium (200-499) | 8 | 2,576 | P2 - Medium |
| Small (<200) | ~20 | ~2,500 | P3 - Quick wins |
| **TOTAL** | ~46 | ~20,800 | - |

**Excluded:** 12 pages in `/ask-expert/` and `/ask-panel/` (separate project)

---

## Phase 0: Build Blockers (IMMEDIATE)

### 0.1 Delete Legacy Archive
```bash
rm -rf src/features/_legacy_archive/
```
**Impact:** -512 TypeScript errors

### 0.2 Install Missing Dependencies
```bash
pnpm add clsx tailwind-merge
```

### 0.3 Verify Build
```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | wc -l
```

---

## Phase 1: /optimize Pages (COMPLETED ✅)

| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| `/optimize/personas/page.tsx` | 611 | 244 | 60% |
| `/optimize/personas/[slug]/page.tsx` | 643 | 179 | 72% |

**Pattern Applied:**
- Feature folder: `src/features/personas/`
- Hooks: `usePersonaData`, `usePersonaFilters`, `usePersonaDetail`
- View components: `PersonaArchetypeView`, `PersonaDepartmentView`, `PersonaFocusView`
- Detail components: `PersonaSummaryCard`, `PersonaJTBDTab`, etc.

### Remaining /optimize Pages

| Page | Lines | Status |
|------|-------|--------|
| `/optimize/jobs-to-be-done/page.tsx` | 529 | ⏳ Pending |
| `/optimize/ontology/page.tsx` | 23 | ✅ Already thin |

---

## Phase 2: /agents Pages (P0 - Critical)

| Page | Lines | Priority |
|------|-------|----------|
| `/agents/[slug]/page.tsx` | 1,602 | 🔴 CRITICAL |
| `/agents/page.tsx` | 704 | 🔴 HIGH |
| `/agents/create/page.tsx` | ~150 | ⏳ Pending |

**Recommended Feature Structure:**
```
src/features/agents/
├── hooks/
│   ├── useAgentDetail.ts
│   ├── useAgentList.ts
│   └── useAgentFilters.ts
├── components/
│   ├── detail/
│   │   ├── AgentOverviewCard.tsx
│   │   ├── AgentCapabilitiesTab.tsx
│   │   ├── AgentConfigurationTab.tsx
│   │   └── AgentAnalyticsTab.tsx
│   └── list/
│       ├── AgentGridView.tsx
│       ├── AgentListView.tsx
│       └── AgentKanbanView.tsx
└── index.ts
```

---

## Phase 3: /discover Pages (P1 - High)

| Page | Lines | Priority |
|------|-------|----------|
| `/discover/tools/[slug]/page.tsx` | 915 | 🔴 HIGH |
| `/discover/skills/[slug]/page.tsx` | 729 | 🟡 MEDIUM |
| `/discover/tools/page.tsx` | 630 | 🟡 MEDIUM |
| `/discover/skills/page.tsx` | 574 | 🟡 MEDIUM |
| `/discover/tools/new/page.tsx` | 397 | 🟡 MEDIUM |

**Recommended Feature Structure:**
```
src/features/discover/
├── tools/
│   ├── hooks/
│   ├── components/
│   └── index.ts
└── skills/
    ├── hooks/
    ├── components/
    └── index.ts
```

---

## Phase 4: /designer Pages (P1 - High)

| Page | Lines | Priority |
|------|-------|----------|
| `/designer/knowledge/page.tsx` | 2,209 | 🔴 CRITICAL |
| `/designer/agent/page.tsx` | 657 | 🟡 MEDIUM |
| `/designer/page.tsx` | ~100 | ✅ Thin |

**Note:** Knowledge designer is the largest page in the app. Major refactoring needed.

---

## Phase 5: /prompts Pages (P1 - High)

| Page | Lines | Priority |
|------|-------|----------|
| `/prompts/[slug]/page.tsx` | 1,062 | 🔴 HIGH |
| `/prompts/page.tsx` | 897 | 🔴 HIGH |
| `/prompts/suites/[suite]/page.tsx` | 525 | 🟡 MEDIUM |
| `/prompts/suites/[suite]/[subSuite]/page.tsx` | 477 | 🟡 MEDIUM |
| `/prompts/suites/page.tsx` | ~150 | ⏳ Pending |

---

## Phase 6: /knowledge Pages (P1 - High)

| Page | Lines | Priority |
|------|-------|----------|
| `/knowledge/page.tsx` | 1,021 | 🔴 HIGH |
| `/knowledge/documents/page.tsx` | 621 | 🟡 MEDIUM |
| `/knowledge/upload/page.tsx` | ~200 | ⏳ Pending |
| `/knowledge/analytics/page.tsx` | ~150 | ⏳ Pending |

---

## Phase 7: /workflows Pages (P2 - Medium)

| Page | Lines | Priority |
|------|-------|----------|
| `/workflows/[code]/page.tsx` | 559 | 🟡 MEDIUM |
| `/workflows/page.tsx` | 454 | 🟡 MEDIUM |

---

## Phase 8: Standalone Pages (P2 - Medium)

| Page | Lines | Priority |
|------|-------|----------|
| `/value/page.tsx` | 946 | 🔴 HIGH |
| `/v0-demo/page.tsx` | 692 | 🟡 MEDIUM |
| `/dashboard/page.tsx` | 619 | 🟡 MEDIUM |
| `/solution-builder/page.tsx` | 350 | 🟡 MEDIUM |
| `/capabilities/page.tsx` | 1,273 | 🔴 HIGH (public) |
| `/jobs-to-be-done/page.tsx` | ~200 | ⏳ Duplicate? |

---

## Phase 9: /admin Pages (P3 - Lower)

| Page | Lines | Priority |
|------|-------|----------|
| `/admin/feedback-dashboard/page.tsx` | 704 | 🟡 MEDIUM |
| `/admin/page.tsx` | 272 | ⏳ Pending |
| `/admin/batch-upload/page.tsx` | ~150 | ⏳ Pending |
| `/admin/agent-analytics/page.tsx` | ~150 | ⏳ Pending |

---

## Phase 10: Component Consolidation

### Agent Cards (3 → 1)
- DELETE: `features/agents/components/agent-card.tsx`
- DELETE: `features/agents/components/agent-card-enhanced.tsx`
- KEEP: `packages/vital-ai-ui/src/agents/VitalAgentCard.tsx` (canonical)

### Sidebars (7 → 1 + wrappers)
- Audit all sidebar implementations
- Create single canonical sidebar
- Create context-specific wrappers

### Loading States (12+ → 1)
- Create `VitalLoadingStates` component library
- Standardize skeleton patterns

---

## Phase 11: Brand v6.0 Migration

### Color Palette Update
```typescript
// tailwind.config.ts
colors: {
  purple: {
    500: '#9055E0',  // Brand primary
    600: '#7C3AED',  // Hover
    700: '#6D28D9',  // Active
  },
  stone: {
    50: '#FAFAF9',   // Background
    100: '#F5F5F4',  // Cards
    500: '#78716C',  // Muted text
    700: '#57534E',  // Body text
    900: '#292524',  // Headings
  }
}
```

### Emoji → Lucide Migration (87 instances)
```bash
grep -rn "🏥\|📱\|💊\|🔬\|⚕️" src/ --include="*.tsx" | wc -l
```

---

## Phase 12: /consult Pages (LAST)

| Page | Lines | Status |
|------|-------|--------|
| All `/ask-expert/*` pages | ~3,000+ | 🔒 Separate project |
| All `/ask-panel/*` pages | ~1,000+ | 🔒 Separate project |

**Note:** These are handled by separate Ask Expert/Ask Panel service work.

---

## Recommended Execution Order

```
Week 1: Foundation
├── Phase 0: Build blockers (1 hour)
├── Phase 2: /agents pages (8 hours) - Most critical
└── Phase 7: /optimize/jobs-to-be-done (2 hours)

Week 2: Discovery & Design
├── Phase 3: /discover pages (6 hours)
├── Phase 4: /designer pages (8 hours)
└── Phase 5: /prompts pages (4 hours)

Week 3: Knowledge & Workflows
├── Phase 6: /knowledge pages (4 hours)
├── Phase 7: /workflows pages (3 hours)
└── Phase 8: Standalone pages (4 hours)

Week 4: Polish
├── Phase 9: /admin pages (2 hours)
├── Phase 10: Component consolidation (4 hours)
└── Phase 11: Brand v6.0 migration (4 hours)

Week 5+: Ask Expert/Panel
└── Phase 12: /consult pages (separate project)
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Average page lines | 450 | <200 |
| TypeScript errors | ~3,000 | <50 |
| Component duplication | 40% | <5% |
| Brand v6.0 compliance | 25% | 100% |
| Emoji instances | 87 | 0 |

---

## Quick Reference: Feature Folder Pattern

```typescript
// src/features/{feature}/hooks/use{Feature}Data.ts
export function use{Feature}Data() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logic

  return { data, loading, error, reload };
}

// src/features/{feature}/components/{View}.tsx
export function {Feature}View({ data, onItemClick }) {
  return (
    // Extracted view logic
  );
}

// Page becomes thin orchestrator
import { use{Feature}Data } from '@/features/{feature}/hooks';
import { {Feature}View } from '@/features/{feature}/components';

export default function Page() {
  const { data, loading, error } = use{Feature}Data();
  return <{Feature}View data={data} />;
}
```

---

*Plan created December 13, 2025*
*Last updated: Post-personas refactoring*
