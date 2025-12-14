# Next Documentation Review Batches

**Date:** December 14, 2025  
**Status:** Prioritized review plan

---

## ✅ Already Reviewed

1. **Architecture Docs** - Created consolidation plan
2. **Comprehensive Review** - Created DOCUMENTATION_REVIEW_2025.md

---

## 📋 Next Review Batches (Prioritized)

### Batch 1: Audit Reports (HIGH PRIORITY) ⭐
**Location:** `/docs/audits/`  
**Count:** 18 files  
**Estimated Time:** 1-2 hours  
**Action:** Archive all to `/.claude/docs/audits/`

**Files:**
1. `AGENTS_UNIFIED_AUDIT_REPORT.md`
2. `ASK_EXPERT_END_TO_END_AUDIT_2025_01_27.md`
3. `ask-expert-audit.md`
4. `ASSET_1_SKILLS_TOOLS_AUDIT.md`
5. `AUDIT_VS_IMPLEMENTATION_CROSSCHECK_2025_12_13.md`
6. `BACKEND_AUDIT_REPORT_2025_Q4.md`
7. `COMPREHENSIVE_FRONTEND_AUDIT_DETAILED_REPORT.md`
8. `DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md`
9. `FRONTEND_AUDIT_REPORT.md`
10. `FRONTEND_DESIGN_COMPREHENSIVE_AUDIT.md`
11. `FRONTEND_IMPLEMENTATION_PLAN.md`
12. `ONTOLOGY_VALUE_COMPREHENSIVE_AUDIT.md`
13. `PHASE_5_BACKEND_INTEGRATION_PLAN.md`
14. `REMAINING_FRONTEND_IMPLEMENTATION_PLAN.md`
15. `UNIFIED_FRONTEND_AUDIT_REPORT.md`
16. `VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md`
17. `VERCEL_DEPLOYMENT_READINESS_REPORT.md`
18. `WORLD_CLASS_PROJECT_STRUCTURE.md`

**Rationale:** All audit reports are internal assessments, not public developer docs. Should be organized by category in `/.claude/docs/audits/`.

---

### Batch 2: Ask Expert Unified Docs (MEDIUM PRIORITY)
**Location:** `/docs/ask-expert/`  
**Count:** 4 files  
**Estimated Time:** 2-3 hours  
**Action:** Consolidate or archive

**Files:**
1. `ASK_EXPERT_UNIFIED_BACKEND_OVERVIEW.md`
2. `ASK_EXPERT_UNIFIED_FRONTEND_OVERVIEW.md`
3. `ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md` (3,310 lines!)
4. `ASK_EXPERT_UNIFIED_STRUCTURE.md`

**Rationale:** These are detailed implementation docs. Should either:
- Create single public overview in `/docs/architecture/ask-expert-overview.md`
- Archive detailed docs to `/.claude/docs/services/ask-expert/implementation/`

---

### Batch 3: Integration References (MEDIUM PRIORITY)
**Location:** `/docs/` (root)  
**Count:** 2 files  
**Estimated Time:** 30 min  
**Action:** Archive to internal docs

**Files:**
1. `BACKEND_INTEGRATION_REFERENCE.md`
2. `FRONTEND_INTEGRATION_REFERENCE.md`

**Rationale:** These are internal integration specs for frontend/backend teams, not public API docs. Should move to `/.claude/docs/services/ask-expert/integration/`.

---

### Batch 4: Refactoring Plans (LOW PRIORITY)
**Location:** `/docs/refactoring/`  
**Count:** 5 files  
**Estimated Time:** 30 min  
**Action:** Archive to internal docs

**Files:**
1. `FRONTEND_REFACTORING_PLAN.md`
2. `JTBD_OPTIMIZATION_PLAN.md`
3. `OPTIMIZE_PAGES_OVERVIEW.md`
4. `PERSONAS_OPTIMIZATION_PLAN.md`
5. `README.md`

**Rationale:** Internal code optimization plans, not public developer guides. Should move to `/.claude/docs/refactoring/`.

---

### Batch 5: Root Level Strategy Docs (LOW PRIORITY)
**Location:** `/docs/` (root)  
**Count:** 3 files  
**Estimated Time:** 30 min  
**Action:** Archive to internal docs

**Files:**
1. `knowledge-data-strategy.md`
2. `world_class_knowledge_data_strategy_implementation_handbook.md`
3. `DOCS_REORGANIZATION_PLAN.md` (superseded by DOCUMENTATION_REVIEW_2025.md)

**Rationale:** Internal strategy and planning documents. Should move to `/.claude/docs/platform/knowledge/` or `/.claude/docs/operations/documentation/`.

---

## Recommended Next Step: Batch 1 (Audit Reports)

**Why Start Here:**
- ✅ Largest batch (18 files)
- ✅ Clear action (all should be archived)
- ✅ Low risk (no content changes needed)
- ✅ Quick win (1-2 hours)
- ✅ Immediate impact (cleans up `/docs/audits/` folder)

**Action Plan:**
1. Review each audit report
2. Categorize by type (frontend, backend, deployment, etc.)
3. Create organized structure in `/.claude/docs/audits/`
4. Move files to appropriate subdirectories
5. Update any references/links

**Suggested Organization:**
```
/.claude/docs/audits/
├── frontend/
│   ├── FRONTEND_AUDIT_REPORT.md
│   ├── COMPREHENSIVE_FRONTEND_AUDIT_DETAILED_REPORT.md
│   ├── UNIFIED_FRONTEND_AUDIT_REPORT.md
│   ├── FRONTEND_DESIGN_COMPREHENSIVE_AUDIT.md
│   ├── FRONTEND_IMPLEMENTATION_PLAN.md
│   └── REMAINING_FRONTEND_IMPLEMENTATION_PLAN.md
├── backend/
│   ├── BACKEND_AUDIT_REPORT_2025_Q4.md
│   └── PHASE_5_BACKEND_INTEGRATION_PLAN.md
├── deployment/
│   ├── DEPLOYMENT_READINESS_COMPREHENSIVE_AUDIT.md
│   ├── VERCEL_DEPLOYMENT_READINESS_REPORT.md
│   └── VERCEL_DEPLOYMENT_IMPLEMENTATION_PLAN.md
├── ask-expert/
│   ├── ask-expert-audit.md
│   ├── ASK_EXPERT_END_TO_END_AUDIT_2025_01_27.md
│   └── AUDIT_VS_IMPLEMENTATION_CROSSCHECK_2025_12_13.md
├── agents/
│   └── AGENTS_UNIFIED_AUDIT_REPORT.md
├── assets/
│   └── ASSET_1_SKILLS_TOOLS_AUDIT.md
├── ontology/
│   └── ONTOLOGY_VALUE_COMPREHENSIVE_AUDIT.md
└── structure/
    └── WORLD_CLASS_PROJECT_STRUCTURE.md
```

---

## Summary

| Batch | Files | Priority | Time | Action |
|-------|-------|----------|------|--------|
| **Batch 1: Audits** | 18 | HIGH | 1-2h | Archive all |
| **Batch 2: Ask Expert** | 4 | MEDIUM | 2-3h | Consolidate/Archive |
| **Batch 3: Integration** | 2 | MEDIUM | 30m | Archive |
| **Batch 4: Refactoring** | 5 | LOW | 30m | Archive |
| **Batch 5: Strategy** | 3 | LOW | 30m | Archive |
| **TOTAL** | **32** | | **5-7h** | |

---

**Next Step:** Review Batch 1 (Audit Reports) together?
