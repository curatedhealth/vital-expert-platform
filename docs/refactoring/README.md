# Refactoring Documentation

> **Purpose:** Track code optimization and refactoring efforts across the VITAL platform
> **Updated:** 2025-12-13

---

## Overview

This folder contains detailed plans for refactoring large page components into smaller, reusable modules following best practices:

- **Thin route pages** (~50-100 lines)
- **Feature-based folder structure**
- **Custom hooks for data/logic**
- **Reusable UI components**

---

## Documents

| Document | Description | Priority |
|----------|-------------|----------|
| [OPTIMIZE_PAGES_OVERVIEW.md](./OPTIMIZE_PAGES_OVERVIEW.md) | Overview of all `/optimize` pages | Reference |
| [PERSONAS_OPTIMIZATION_PLAN.md](./PERSONAS_OPTIMIZATION_PLAN.md) | Personas list + detail refactoring | **High** |
| [JTBD_OPTIMIZATION_PLAN.md](./JTBD_OPTIMIZATION_PLAN.md) | Jobs-to-Be-Done refactoring | Medium |

---

## Current Status

| Page | Current Lines | Target Lines | Status |
|------|---------------|--------------|--------|
| `/optimize/personas` | 611 | ~120 | Planned |
| `/optimize/personas/[slug]` | 643 | ~100 | Planned |
| `/optimize/jobs-to-be-done` | 529 | ~180 | Planned |
| `/optimize/ontology` | 23 | 23 | ✅ Optimal |

---

## Optimization Principles

### 1. Thin Route Pages
Route files should be ~50-100 lines, acting as orchestrators:
```tsx
export default function Page() {
  const data = usePageData();
  return <PageLayout><FeatureComponent data={data} /></PageLayout>;
}
```

### 2. Feature Folder Structure
```
src/features/{feature}/
├── components/     # UI components
├── hooks/          # Data & logic hooks
├── types/          # TypeScript types
├── utils/          # Helper functions
└── index.ts        # Barrel exports
```

### 3. Custom Hooks
Extract data fetching and business logic:
```tsx
// Before: 80 lines in component
// After: useFeatureData hook
const { data, loading, error, reload } = useFeatureData();
```

### 4. Component Extraction
Extract repeated UI patterns:
```tsx
// Before: 90 lines of inline tab content
// After: <FeatureTabContent data={data} />
```

---

## Brand Guidelines

All refactored components must follow **VITAL Brand Guidelines v6.0**:

| Element | Value |
|---------|-------|
| Primary | `purple-600` |
| Canvas | `stone-50` |
| Text | `stone-600/700/800` |
| Transitions | `duration-150` |

---

## Getting Started

1. Read the overview document first
2. Review the specific page optimization plan
3. Follow the implementation checklist
4. Verify TypeScript compilation after each phase
5. Update status in this README when complete

---

## Related Documentation

- [Architecture docs](../architecture/)
- [Frontend Integration](../FRONTEND_INTEGRATION_REFERENCE.md)
- [Component Library](../../packages/ui/)
