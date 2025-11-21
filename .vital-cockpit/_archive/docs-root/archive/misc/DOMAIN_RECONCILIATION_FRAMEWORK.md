# Domain Reconciliation Framework: Digital Health + Pharma Medical Affairs

## Executive Summary

This document establishes the unified hierarchical structure for both **Digital Health Startup** and **Pharma & Life Sciences (Medical Affairs)** industries within the VITAL platform.

**Key Insight:** While both industries use similar hierarchical levels, they organize differently:
- **Digital Health:** Domains → Use Cases → Workflows → Tasks
- **Pharma (Medical Affairs):** Strategic Pillars (SP) → JTBDs → Workflows → Tasks

**Resolution:** Use **SP (Strategic Pillars)** as the categorical organizing layer for Medical Affairs, analogous to how Digital Health uses Domains.

---

## Hierarchical Structure Comparison

### Digital Health Startup Industry

```
Industry: Digital Health Startup
  └─ Domain: Clinical Development (CD)
      └─ Use Case: UC_CD_001 (DTx Clinical Endpoint Selection)
          └─ Workflow: Endpoint Selection Process
              └─ Task: Identify Primary Endpoint
              └─ Task: Validate with FDA Guidance
              └─ Task: Document Rationale
```

**5 Domains:**
1. **Clinical Development (CD)** - 10 use cases
2. **Regulatory Affairs (RA)** - 10 use cases
3. **Medical Affairs (MA)** - 10 use cases
4. **Product Development (PD)** - 10 use cases
5. **Evidence Generation (EG)** - 10 use cases

**Total:** 5 domains, ~50 use cases

---

### Pharma & Life Sciences (Medical Affairs) Industry

```
Industry: Pharma & Life Sciences
  └─ Domain: Medical Affairs (MA)
      └─ Strategic Pillar (SP): SP01 (Growth & Market Access)
          └─ JTBD: JTBD-MA-001 (Annual Strategic Planning)
              └─ Workflow: Strategic Planning Workflow
                  └─ Task: Conduct Situational Analysis
                  └─ Task: Define Strategic Objectives
                  └─ Task: Develop Resource Allocation Plan
```

**7 Strategic Pillars (SP):**
1. **SP01: Growth & Market Access** - ~15 JTBDs
2. **SP02: Scientific Excellence** - ~16 JTBDs
3. **SP03: Stakeholder Engagement** - ~15 JTBDs
4. **SP04: Compliance & Quality** - ~20 JTBDs
5. **SP05: Operational Excellence** - ~20 JTBDs
6. **SP06: Talent Development** - ~9 JTBDs
7. **SP07: Innovation & Digital** - ~16 JTBDs

**Total:** 1 domain (Medical Affairs), 7 SPs, ~120 JTBDs

---

## Terminology Alignment Matrix

| Level | Digital Health | Pharma MA | Database Field | UI Display |
|-------|---------------|-----------|----------------|------------|
| **Level 1: Industry** | Digital Health Startup | Pharma & Life Sciences | `industry` / `sector` | Industry filter |
| **Level 2: Domain** | Clinical Development, Regulatory Affairs, etc. | Medical Affairs | `domain` | Domain tabs |
| **Level 3: Category** | N/A (goes directly to Use Cases) | **Strategic Pillar (SP01-SP07)** | `strategic_pillar` / `function` | Collapsible SP cards |
| **Level 4: Use Case / JTBD** | Use Case (UC_CD_001) | JTBD (JTBD-MA-001) | `code`, `jtbd_code` | Workflow cards |
| **Level 5: Workflow** | Workflow | Workflow | `dh_workflow` table | Workflow detail |
| **Level 6: Task** | Task | Task | `dh_task` table | Task list |

---

## Key Insight: SP as Categorical Layer

**Strategic Pillars (SP)** serve as the **categorical organization layer** for Medical Affairs, providing:

1. **Strategic Grouping:** JTBDs are organized by strategic objectives
2. **Navigation Aid:** Users can browse by strategic priority
3. **Reporting Structure:** Metrics can be rolled up by SP
4. **Scalability:** Easy to add SP08, SP09, etc. as needed

**Analogy:**
- Digital Health **Domains** (CD, RA, MA, PD, EG) = Pharma **Strategic Pillars** (SP01-SP07)
- Digital Health **Use Cases** (UC_CD_001) = Pharma **JTBDs** (JTBD-MA-001)

---

## Database Schema Reconciliation

### Problem Identified

**Root Cause of 22P02 Error:**
- `jtbd_library.id` is `VARCHAR(20)` (stores "JTBD-MA-042")
- `dh_workflow.use_case_id` is `UUID`
- When querying workflows by JTBD id, PostgreSQL tries to cast "JTBD-MA-042" to UUID → **22P02 error**

**Solution Applied:**
```typescript
// Only query workflows if use case id is a valid UUID
if (isValidUuid(useCase.id)) {
  // Query dh_workflow table
} else {
  // JTBD from jtbd_library - skip workflow query (no workflows yet)
  console.log(`Skipping workflow query for non-UUID use case id: ${useCase.id}`);
}
```

### Schema Alignment

**Two Source Tables:**

1. **`dh_use_case`** (Digital Health Use Cases)
   - `id`: UUID (Primary Key)
   - `code`: VARCHAR (e.g., "UC_CD_001")
   - `domain`: Extracted from code (CD, RA, MA, PD, EG)
   - Used by: Digital Health Startup workflows

2. **`jtbd_library`** (Medical Affairs JTBDs)
   - `id`: VARCHAR(20) (e.g., "JTBD-MA-042") ⚠️ NOT UUID
   - `jtbd_code`: TEXT (e.g., "JTBD-MA-042")
   - `function`: TEXT (Strategic Pillar: "SP01", "SP02", etc.)
   - `unique_id`: TEXT (alternative identifier)
   - Used by: Pharma Medical Affairs workflows

**Workflow Table:**

3. **`dh_workflow`**
   - `id`: UUID (Primary Key)
   - `use_case_id`: UUID (Foreign Key → `dh_use_case.id`) ⚠️ UUID only
   - Currently: Only supports Digital Health use cases
   - Future: Need to support both UUID and VARCHAR ids OR create separate MA workflow table

---

## API Data Flow

### GET `/api/workflows/usecases` (List View)

**Returns combined data from both sources:**

```typescript
{
  success: true,
  data: {
    useCases: [
      // Digital Health Use Cases
      {
        id: "uuid-123...",
        code: "UC_CD_001",
        domain: "CD",
        industry: "Digital Health Startup",
        source: "Digital Health Use Cases"
      },
      // Medical Affairs JTBDs
      {
        id: "JTBD-MA-042",
        code: "JTBD-MA-042",
        domain: "MA",
        strategic_pillar: "SP02",
        industry: "Pharma",
        source: "Medical Affairs JTBD Library"
      }
    ],
    strategicPillars: {
      "SP01": [...15 JTBDs],
      "SP02": [...16 JTBDs],
      // ... SP03-SP07
    }
  }
}
```

### GET `/api/workflows/usecases/[code]/complete` (Detail View)

**Handles both UUID and VARCHAR ids:**

```typescript
// Step 1: Try dh_use_case by code
const dhUseCase = await supabase
  .from('dh_use_case')
  .eq('code', code)
  .maybeSingle();

// Step 2: If not found, try jtbd_library by jtbd_code
if (!dhUseCase) {
  const jtbd = await supabase
    .from('jtbd_library')
    .eq('jtbd_code', code)
    .maybeSingle();
}

// Step 3: Only query workflows if useCase.id is UUID
if (isValidUuid(useCase.id)) {
  const workflows = await supabase
    .from('dh_workflow')
    .eq('use_case_id', useCase.id);
} else {
  // JTBD - no workflows yet (VARCHAR id incompatible with dh_workflow)
  workflows = [];
}
```

---

## UI/UX Presentation

### Workflows Page

**When Industry = "Pharma" AND Domain = "MA":**

Shows **Strategic Pillar (SP) View**:

```
┌─────────────────────────────────────────────────────┐
│ Medical Affairs Use Case Categories                 │
│ Click on each category to view related workflows    │
└─────────────────────────────────────────────────────┘

┌─ SP01: Growth & Market Access ─────────── [15] ───▶┐
│ 🎯 Evidence generation and value demonstration      │
│                                                      │
│ [Expand to see 15 JTBDs]                           │
└──────────────────────────────────────────────────────┘

┌─ SP02: Scientific Excellence ──────────── [16] ───▶┐
│ 💡 Advancing medical knowledge                      │
└──────────────────────────────────────────────────────┘

... (SP03-SP07)
```

**When Expanded:**

```
┌─ SP01: Growth & Market Access ─────────── [15] ───▼┐
│ 🎯 Evidence generation and value demonstration      │
├──────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │JTBD-MA-001│  │JTBD-MA-002│  │JTBD-MA-003│          │
│  │Annual    │  │Evidence  │  │Cross-    │          │
│  │Strategic │  │Generation│  │Functional│          │
│  │Planning  │  │Planning  │  │Coord.    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ... (12 more JTBDs)                                │
└──────────────────────────────────────────────────────┘
```

**When Industry = "Digital Health Startup":**

Shows **Domain Tabs** (standard view):

```
Tabs: [All] [Clinical Development] [Regulatory Affairs] [Medical Affairs] [Product Dev] [Evidence Gen]

┌─ Clinical Development ──────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │UC_CD_001 │  │UC_CD_002 │  │UC_CD_003 │          │
│  │Endpoint  │  │Digital   │  │RCT Design│          │
│  │Selection │  │Biomarker │  │for DTx   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ... (7 more use cases)                             │
└──────────────────────────────────────────────────────┘
```

---

## Code Implementation Status

### ✅ Completed Fixes

1. **API Routes Updated:**
   - [/api/workflows/usecases/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/route.ts) - Combines both sources
   - [/api/workflows/usecases/[code]/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/%5Bcode%5D/route.ts) - Dual-table lookup
   - [/api/workflows/usecases/[code]/complete/route.ts](apps/digital-health-startup/src/app/api/workflows/usecases/%5Bcode%5D/complete/route.ts) - **Fixed 22P02 error with UUID validation**

2. **Frontend Updated:**
   - [/workflows/page.tsx](apps/digital-health-startup/src/app/(app)/workflows/page.tsx) - Strategic Pillar UI
   - Renamed `STRATEGIC_PILLARS` → `USE_CASE_CATEGORIES`
   - Added SP code prefixes (SP01, SP02, etc.)
   - Collapsible SP cards with workflow counts

3. **Database Compatibility:**
   - Added `isValidUuid()` helper function
   - Conditional workflow queries based on id type
   - Graceful handling of VARCHAR JTBDs

### ⚠️ Remaining Considerations

1. **Workflow Association:**
   - Currently: JTBDs have NO workflows in `dh_workflow` table (UUID constraint)
   - **Options:**
     - A. Create separate `ma_workflow` table with VARCHAR foreign keys
     - B. Add UUID column to `jtbd_library` for workflow linking
     - C. Keep separate - JTBDs describe work, workflows are execution

2. **Data Model Evolution:**
   - Need decision: Should JTBDs have executable workflows?
   - Or: JTBDs remain descriptive, workflows are built separately?

---

## Future Enhancements

### Short Term (Current Session)

1. ✅ Fix 22P02 error (COMPLETE)
2. ✅ Display JTBDs by Strategic Pillar (COMPLETE)
3. ⏳ Test JTBD detail pages work correctly
4. ⏳ Verify all 120 JTBDs display properly

### Medium Term

1. **Workflow Builder for JTBDs:**
   - Allow creating workflows associated with JTBDs
   - Need to resolve UUID/VARCHAR id mismatch

2. **Cross-Industry Search:**
   - Search across both DH use cases AND MA JTBDs
   - Unified filtering by complexity, domain, SP

3. **Analytics Dashboard:**
   - Usage by Strategic Pillar
   - JTBD completion rates
   - Workflow execution metrics

### Long Term

1. **Multi-Tenant Support:**
   - Different organizations see different JTBD libraries
   - Custom Strategic Pillars per organization

2. **JTBD-to-Workflow Templating:**
   - Convert JTBD into executable workflow template
   - Auto-generate tasks from JTBD structure

---

## Success Criteria

### ✅ Completed

- [x] JTBDs display in workflows page
- [x] Strategic Pillar grouping works
- [x] Industry filter separates DH vs Pharma
- [x] No 22P02 database errors
- [x] Consistent terminology ("SP" instead of "Strategic Pillars")

### ⏳ In Progress

- [ ] JTBD detail pages load without error
- [ ] All 120 JTBDs visible and navigable
- [ ] Correct badge display (SP codes)

### 📋 Future

- [ ] Workflows can be created for JTBDs
- [ ] Cross-industry search works seamlessly
- [ ] Analytics by Strategic Pillar

---

## Glossary

| Term | Definition | Used In |
|------|------------|---------|
| **Domain** | High-level functional area (CD, RA, MA, PD, EG) | Digital Health, Pharma MA |
| **Strategic Pillar (SP)** | Strategic objective category (SP01-SP07) | Pharma MA only |
| **Use Case** | Discrete workflow scenario with specific goal | Digital Health only |
| **JTBD** | Jobs-to-be-Done - user objectives to accomplish | Pharma MA only |
| **Workflow** | Sequence of tasks to complete use case/JTBD | Both |
| **Task** | Individual step within workflow | Both |
| **UC Code** | Use Case code (e.g., UC_CD_001) | Digital Health |
| **JTBD Code** | JTBD code (e.g., JTBD-MA-042) | Pharma MA |
| **SP Code** | Strategic Pillar code (SP01-SP07) | Pharma MA |

---

**Status:** ✅ Framework Established, Core Fixes Applied

**Date:** 2025-11-09

**Impact:** Unified taxonomy enables seamless multi-industry support
