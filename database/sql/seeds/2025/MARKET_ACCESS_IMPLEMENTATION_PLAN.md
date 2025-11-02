# 🎯 MARKET ACCESS USE CASES - IMPLEMENTATION PLAN

## Status: IN PROGRESS

**Goal**: Create seed files for all 10 Market Access (MA) use cases  
**Total Files Needed**: 20 (Part 1 + Part 2 for each use case)  
**Current Progress**: 1/20 files created

---

## 📊 Use Case Overview

| # | Use Case | Code | Steps | Complexity | Duration (min) | Status |
|---|----------|------|-------|------------|----------------|--------|
| 1 | Payer Value Dossier Development | UC_MA_001 | 8 | EXPERT | 480 | ✅ Part 1 Created |
| 2 | Health Economics Model (DTx) | UC_MA_002 | 7 | EXPERT | 240 | ⏳ Pending |
| 3 | CPT/HCPCS Code Strategy | UC_MA_003 | 6 | ADVANCED | 180 | ⏳ Pending |
| 4 | Formulary Positioning Strategy | UC_MA_004 | 5 | INTERMEDIATE | 150 | ⏳ Pending |
| 5 | P&T Committee Presentation | UC_MA_005 | 5 | ADVANCED | 120 | ⏳ Pending |
| 6 | Budget Impact Model (BIM) | UC_MA_006 | 6 | ADVANCED | 180 | ⏳ Pending |
| 7 | Comparative Effectiveness Analysis | UC_MA_007 | 6 | EXPERT | 240 | ⏳ Pending |
| 8 | Value-Based Contracting Strategy | UC_MA_008 | 7 | EXPERT | 210 | ⏳ Pending |
| 9 | Health Technology Assessment (HTA) | UC_MA_009 | 8 | EXPERT | 360 | ⏳ Pending |
| 10 | Patient Assistance Program Design | UC_MA_010 | 5 | INTERMEDIATE | 120 | ⏳ Pending |

**Total Tasks**: ~60 tasks across all workflows

---

## 🎯 Implementation Strategy

### Phase 1: Foundation (COMPLETE ✅)
- Created `16_ma_001_value_dossier_part1.sql` with 8 tasks
- Established naming convention: `16-25_ma_00X_name_part1/2.sql`

### Phase 2: Remaining Files (IN PROGRESS)
Due to scope, we have two options:

#### **Option A: Create Simplified Templates** (Recommended)
Create Part 1 & Part 2 files with:
- ✅ Correct schema structure
- ✅ Workflow definitions
- ✅ Task placeholders or simplified tasks
- ✅ Standard agent/persona/tool/RAG mappings
- ⚡ Fast creation (can complete all 19 remaining files)

#### **Option B: Full Detailed Implementation**
Create complete files like CD use cases:
- ✅ Detailed task definitions
- ✅ Comprehensive extra metadata
- ✅ Full assignment mappings
- ⏱️ Slower (would require multiple context windows)

**Recommendation**: Start with Option A templates, then enhance specific use cases as needed.

---

## 📁 File Naming Convention

```
Market Access (MA) Use Cases: Files 16-25

16_ma_001_value_dossier_part1.sql          ✅ CREATED
16_ma_001_value_dossier_part2.sql          ⏳ Next
17_ma_002_health_economics_part1.sql       ⏳ Pending
17_ma_002_health_economics_part2.sql       ⏳ Pending
18_ma_003_cpt_hcpcs_code_part1.sql         ⏳ Pending
18_ma_003_cpt_hcpcs_code_part2.sql         ⏳ Pending
19_ma_004_formulary_positioning_part1.sql  ⏳ Pending
19_ma_004_formulary_positioning_part2.sql  ⏳ Pending
20_ma_005_pt_presentation_part1.sql        ⏳ Pending
20_ma_005_pt_presentation_part2.sql        ⏳ Pending
21_ma_006_budget_impact_part1.sql          ⏳ Pending
21_ma_006_budget_impact_part2.sql          ⏳ Pending
22_ma_007_comparative_effectiveness_part1.sql ⏳ Pending
22_ma_007_comparative_effectiveness_part2.sql ⏳ Pending
23_ma_008_value_based_contracting_part1.sql   ⏳ Pending
23_ma_008_value_based_contracting_part2.sql   ⏳ Pending
24_ma_009_hta_submission_part1.sql         ⏳ Pending
24_ma_009_hta_submission_part2.sql         ⏳ Pending
25_ma_010_patient_assistance_part1.sql     ⏳ Pending
25_ma_010_patient_assistance_part2.sql     ⏳ Pending
```

---

## 🔧 Technical Requirements

### Foundation Dependencies
All MA use cases require:
- **Personas**: Need MA-specific personas (P21_MA_DIR, P22_HEOR, P23_MED_AFF, P24_PAYER_REL, etc.)
- **Agents**: Standard agents (AGT-WORKFLOW-ORCHESTRATOR, AGT-EVIDENCE-SYNTHESIZER, etc.)
- **Tools**: Statistical tools (TOOL-R-STATS), literature databases (TOOL-PUBMED, TOOL-COCHRANE)
- **RAG Sources**: Need MA-specific RAG sources (AMCP guidelines, ISPOR guidelines, payer policies)

### Schema Compliance
All files must follow `SCHEMA_REFERENCE_FINAL.md`:
- ✅ `unique_id` NOT NULL for workflows and tasks
- ✅ `position` (not `order_index`)
- ✅ `extra` (not `metadata` for tasks)
- ✅ Correct `ON CONFLICT` clauses
- ✅ Valid CHECK constraint values (`on_failure`, `assignment_type`, etc.)

---

## 📚 Key Learnings from CD Use Cases

### What Worked Well ✅
1. Individual files per use case (maintainability)
2. Consistent naming convention
3. Comprehensive task `extra` metadata
4. Pre-validation with `validate_seed_file.py`
5. Verification queries in each file

### Common Pitfalls to Avoid ❌
1. Invalid `on_failure` values (use ESCALATE_TO_HUMAN, RETRY, SKIP, FAIL, FALLBACK_AGENT)
2. Missing `tenant_id` in SELECT clauses
3. Incorrect `ON CONFLICT` clauses
4. Using `CONTINUE` instead of `SKIP`
5. Missing foundation entity codes

---

## 🚀 Next Steps

### Immediate Action Items
1. ✅ **UC_MA_001 Part 1** - COMPLETE
2. ⏳ **UC_MA_001 Part 2** - Create assignments (dependencies, agents, personas, tools, RAG)
3. ⏳ **UC_MA_002-010 Part 1 & 2** - Create remaining 18 files

### Execution Options

**Option 1: Continue This Session**
- Create UC_MA_001 Part 2 next
- Then create simplified templates for remaining 9 use cases
- Estimated: Can complete ~4-6 more files before token limit

**Option 2: Batch Approach**
- Complete UC_MA_001 Part 2 now
- Create batch generation script for remaining use cases
- User executes script to generate placeholder files
- Enhance specific files as needed

**Option 3: Prioritized Approach**
- Complete highest-priority MA use cases first (e.g., MA_001, MA_002, MA_006)
- Leave lower-priority ones for later

---

## 💡 Recommendation

**Suggested Approach**:
1. ✅ Complete UC_MA_001 Part 2 (next immediate step)
2. Create 2-3 more complete use case files (UC_MA_002, UC_MA_006)
3. Generate template/skeleton files for remaining use cases
4. User can enhance templates as needed per business priorities

This balances completeness with practical efficiency!

---

**Last Updated**: November 2, 2025  
**Status**: 1/20 files complete, continuing implementation

