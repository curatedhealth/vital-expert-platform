# PROMPTS MIGRATION & SEEDING - EXECUTION PLAN

**Status**: Ready for Execution  
**Date**: November 3, 2025  
**Scope**: 47 use cases, 189 tasks, 128 legacy prompts  

---

## 🎯 EXECUTIVE SUMMARY

We have successfully:
1. ✅ **Analyzed** 3,561 legacy prompts and identified **128 digital health-relevant prompts**
2. ✅ **Categorized** prompts into PROMPTS™ framework (FORGE™, VALUE™, PROOF™, etc.)
3. ✅ **Created** migration SQL scripts for legacy prompts
4. ✅ **Documented** complete use case status (47 use cases across 5 domains)

---

## 📊 CURRENT STATE

### Prompts Coverage

| Metric | Current | Target | Gap | Priority |
|--------|---------|--------|-----|----------|
| **Use Cases with Prompts** | 1 / 47 | 47 | 46 | 🔴 CRITICAL |
| **Tasks with Prompts** | 2 / 189 | 189 | 187 | 🔴 CRITICAL |
| **Legacy Prompts Migrated** | 0 / 128 | 128 | 128 | 🔴 HIGH |
| **Prompt-Task Links** | 2 | 189 | 187 | 🔴 CRITICAL |
| **Prompt-Agent Links** | 0 | ~400 | ~400 | 🟡 MEDIUM |

### Use Case Completion by Domain

| Domain | Use Cases | With Prompts | Completion % |
|--------|-----------|--------------|--------------|
| **CD** (Clinical Development) | 10 | 1 | 10% |
| **RA** (Regulatory Affairs) | 10 | 0 | 0% |
| **MA** (Market Access) | 10 | 0 | 0% |
| **EG** (Evidence Generation) | 10 | 0 | 0% |
| **PD** (Product Development) | 7 | 0 | 0% |

---

## 🚀 PRAGMATIC EXECUTION PLAN

Given the scope (189 tasks needing prompts), here's a **pragmatic, high-impact approach**:

### Phase 1: Foundation (THIS SESSION) ⏳

**Goal**: Establish foundation and demonstrate proof-of-concept

1. ✅ **Migrate 24 FORGE™ legacy prompts** (SaMD, DTx, biomarker)
   - File: `LEGACY_PROMPTS_MIGRATION_FORGE.sql`
   - Status: Created, needs execution
   
2. ⏳ **Seed prompts for 3 high-priority use cases** (proof-of-concept)
   - `UC_RA_001`: FDA Software Classification (SaMD) - 6 tasks
   - `UC_CD_001`: DTx Clinical Endpoint Selection - 13 tasks
   - `UC_CD_003`: RCT Design & Clinical Trial Strategy - 10 tasks
   - **Total**: 29 tasks, ~29 prompts

3. ⏳ **Establish relationships**:
   - Prompt → Task (via `dh_prompt.task_id`)
   - Prompt → Suite/Sub-Suite (via `dh_prompt_suite_prompt`)
   - Task → Agent (via `dh_task_agent`) - already exists
   - Prompt → Agent (implicit via task) or explicit via `dh_agent_prompt_starter`

### Phase 2: Scale (NEXT SESSION) 📋

**Goal**: Complete remaining use cases in batches

4. 📋 **Batch 1: Complete CD domain** (9 remaining use cases, ~59 tasks)
5. 📋 **Batch 2: Complete RA domain** (6 remaining use cases, ~32 tasks)
6. 📋 **Batch 3: Complete MA domain** (10 use cases, ~63 tasks)
7. 📋 **Batch 4: Seed EG domain** (10 use cases, estimate ~80 tasks)
8. 📋 **Batch 5: Seed PD domain** (7 use cases, estimate ~60 tasks)

### Phase 3: Optimization (FUTURE) 📋

9. 📋 **Migrate remaining 104 legacy prompts** (VALUE™, PROOF™, BRIDGE™, etc.)
10. 📋 **Create agent-prompt starters** (for UI)
11. 📋 **Add prompt versions** (for A/B testing)
12. 📋 **Quality assurance** (review all prompts for accuracy)

---

## 📁 FILES CREATED

### Documentation

1. ✅ `LEGACY_PROMPTS_ANALYSIS.md` - Analysis of 128 digital health-relevant prompts
2. ✅ `USECASE_STATUS_SUMMARY.md` - Complete status of all 47 use cases
3. ✅ `PROMPTS_FRAMEWORK_STRUCTURE.md` - PROMPTS™ framework documentation (already exists)

### SQL Scripts

4. ✅ `LEGACY_PROMPTS_MIGRATION_FORGE.sql` - Migrate 24 FORGE™ prompts
5. ⏳ `UC_RA_001_prompts.sql` - Seed prompts for UC_RA_001 (NEXT)
6. ⏳ `UC_CD_001_prompts.sql` - Seed prompts for UC_CD_001 (NEXT)
7. ⏳ `UC_CD_003_prompts.sql` - Seed prompts for UC_CD_003 (NEXT)

---

## 🎯 IMMEDIATE NEXT STEPS

### Option A: Execute Phase 1 Now (Recommended)

I can immediately:
1. Execute `LEGACY_PROMPTS_MIGRATION_FORGE.sql` (migrate 24 FORGE prompts)
2. Create & execute `UC_RA_001_prompts.sql` (6 tasks)
3. Create & execute `UC_CD_001_prompts.sql` (13 tasks)
4. Create & execute `UC_CD_003_prompts.sql` (10 tasks)
5. Run verification queries to confirm relationships

**Time Estimate**: 30-45 minutes  
**Result**: 29 tasks with prompts, all relationships established, proof-of-concept complete

### Option B: User Review First

You review the created files and approve the approach before I proceed with execution.

---

## 🔍 KEY DECISIONS MADE (Pragmatic Approach)

### 1. **Prompts Per Task**

**Decision**: 1 prompt per task (not 1 per task per agent)

**Rationale**:
- Simpler to manage (189 prompts vs ~400+ prompts)
- Prompts can specify multiple owner agents (via `owner` JSON array)
- Can add agent-specific prompt variants later via `dh_prompt_version`

### 2. **Legacy Prompt Migration Strategy**

**Decision**: Migrate in phases, starting with FORGE™ (24 prompts), then VALUE™ (25), then others

**Rationale**:
- FORGE™ prompts are most directly relevant to current use cases (RA, CD)
- VALUE™ prompts are relevant to MA use cases (can migrate when seeding MA)
- Other frameworks (PROOF™, BRIDGE™, etc.) have fewer prompts and lower priority

### 3. **Prompt Content Strategy**

**Decision**: 
- Use legacy prompt `display_name` and `category` as foundation
- Create structured `system_prompt` and `user_template` for each
- Link to suite/sub-suite via metadata
- **For use case-specific prompts**: Create detailed, task-specific prompts (like UC_CD_002)

**Rationale**:
- Legacy prompts need enhancement (most lack full prompt content)
- Use case-specific prompts should be detailed and actionable
- Balance between quick migration and quality

### 4. **Task-Prompt Linking**

**Decision**: Link prompts to tasks via `dh_prompt.task_id` (FK)

**Rationale**:
- Direct FK relationship is clearest
- Each task gets exactly one primary prompt
- Can add secondary prompts via `dh_prompt_version` or additional `dh_prompt` rows

### 5. **Agent-Prompt Linking**

**Decision**: Use `dh_prompt.owner` (JSON array) + implicit via task assignments

**Rationale**:
- `dh_task_agent` already links tasks to agents
- `dh_prompt.owner` specifies which agents can use the prompt
- `dh_agent_prompt_starter` can be added later for UI "starter prompts"

---

## ✅ SUCCESS CRITERIA

After Phase 1 completion:

1. ✅ **24 FORGE™ prompts migrated** from legacy `prompts` table to `dh_prompt`
2. ✅ **29 tasks have prompts** (UC_RA_001, UC_CD_001, UC_CD_003)
3. ✅ **All prompts linked to suites/sub-suites** via `dh_prompt_suite_prompt`
4. ✅ **All prompts have agents** (via `owner` field)
5. ✅ **Verification queries pass** (no orphaned prompts, all relationships valid)

---

## 📈 IMPACT

### After Phase 1 (3 use cases)

- **Tasks with Prompts**: 2 → 31 (1.1% → 16.4%)
- **Use Cases with Prompts**: 1 → 4 (2.1% → 8.5%)
- **Legacy Prompts Migrated**: 0 → 24 (0% → 18.8%)

### After Phase 2 (All CD, RA, MA)

- **Tasks with Prompts**: 31 → 185 (16.4% → 97.9%)
- **Use Cases with Prompts**: 4 → 30 (8.5% → 63.8%)
- **Legacy Prompts Migrated**: 24 → 80 (18.8% → 62.5%)

### After Phase 3 (All 47 use cases)

- **Tasks with Prompts**: 185 → ~300+ (97.9% → 100%)
- **Use Cases with Prompts**: 30 → 47 (63.8% → 100%)
- **Legacy Prompts Migrated**: 80 → 128 (62.5% → 100%)

---

## 🎬 READY TO PROCEED?

**Waiting for your decision**:

- **Option A**: Proceed with Phase 1 execution now ✅
- **Option B**: Review files first, then proceed 📋
- **Option C**: Modify approach based on feedback 🔄

---

**END OF EXECUTION PLAN**

