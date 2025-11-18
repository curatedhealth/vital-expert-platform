# 🚀 Phase 3: Prompt Consolidation Plan

**Date:** November 9, 2025, 9:20 PM  
**Status:** PLANNING COMPLETE → READY TO EXECUTE  
**Estimated Duration:** 1-1.5 weeks  

---

## 📊 Current State Assessment

### Prompt Tables Inventory

| Table | Rows | Status | Purpose |
|-------|------|--------|---------|
| `prompts` | 1,000 | ✅ Clean | **Target table** - Industry-agnostic |
| `dh_prompt` | 352 | ⚠️ Legacy | Digital Health prompts (needs migration) |
| `dh_prompt_suite` | 5 | ✅ Keep | Prompt organization |
| `dh_prompt_subsuite` | 10 | ✅ Keep | Prompt sub-organization |
| `prompt_industry_mapping` | 9 | ⚠️ Sparse | **Needs expansion** (only 9 mappings!) |
| `prompt_task_mapping` | 9 | ⚠️ Sparse | **Needs expansion** (only 9 mappings!) |

### Key Findings

✅ **Good News:**
- `prompts` table already exists and is well-structured (1,000 entries)
- Mapping tables exist (`prompt_industry_mapping`, `prompt_task_mapping`)
- Suite/subsuite structure is in place
- Some migration work already done

⚠️ **Issues:**
- `dh_prompt` still has 352 prompts not migrated
- Industry mappings severely under-populated (9 vs 1,352 needed)
- Task mappings under-populated (9 vs potentially hundreds)
- Dual architecture (clean + legacy tables)

---

## 🎯 Phase 3 Objectives

### Primary Goals
1. ✅ **Migrate all prompts** from `dh_prompt` → `prompts`
2. ✅ **Create industry mappings** for all prompts
3. ✅ **Create task mappings** where applicable
4. ✅ **Maintain suite structure** (keep `dh_prompt_suite` hierarchy)
5. ✅ **Zero data loss** (preserve all metadata)

### Success Criteria
- [ ] All 352 `dh_prompt` entries migrated to `prompts`
- [ ] ~1,350 prompts with industry mappings (all prompts × industries)
- [ ] Task mappings based on metadata (where `task_id` exists)
- [ ] 100% validation pass rate
- [ ] Complete documentation

---

## 🏗️ Architecture Design

### Target Schema (Multi-Industry Support)

```
┌─────────────────────────────────────────────────────────┐
│                    PROMPTS (Clean)                       │
│  - id, name, description, category                      │
│  - system_prompt, user_prompt_template                  │
│  - execution_instructions, metadata                     │
│  - is_active, tenant_id, created_at                     │
│  *** INDUSTRY-AGNOSTIC ***                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ├─────────────────┐
                           │                 │
                           ▼                 ▼
┌────────────────────────────────┐  ┌──────────────────────────────┐
│  PROMPT_INDUSTRY_MAPPING       │  │  PROMPT_TASK_MAPPING        │
│  - prompt_id                   │  │  - prompt_id                │
│  - industry_id                 │  │  - task_id                  │
│  - is_primary                  │  │  - task_code                │
│  *** MULTI-INDUSTRY ***        │  │  - usage_context            │
└────────────────────────────────┘  └──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 DH_PROMPT_SUITE                          │
│  (Keep for organization - links to prompts via metadata)│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                DH_PROMPT_SUBSUITE                        │
│  (Keep for organization)                                 │
└─────────────────────────────────────────────────────────┘
```

### Design Principles
1. **Industry-Agnostic Core** - `prompts` table has no industry columns
2. **Multi-Industry via Mapping** - One prompt → many industries
3. **Task Associations** - Link prompts to tasks via mapping
4. **Suite Preservation** - Keep organizational structure
5. **Metadata Flexibility** - Store source info and extras in metadata

---

## 📋 Migration Strategy

### Phase 3A: Migrate dh_prompt → prompts
**Goal:** Move 352 prompts from legacy to clean table

**Steps:**
1. Fetch all `dh_prompt` records
2. Check if already in `prompts` (by name or metadata matching)
3. Transform structure:
   - `dh_prompt.name` → `prompts.name`
   - `dh_prompt.system_prompt` → `prompts.system_prompt`
   - `dh_prompt.user_template` → `prompts.user_prompt_template`
   - `dh_prompt.pattern` → `prompts.metadata.pattern`
   - `dh_prompt.task_id` → Store in metadata for later mapping
4. Insert into `prompts` with source tracking

**Expected:** ~300-350 new prompts (some may already exist)

### Phase 3B: Create Industry Mappings
**Goal:** Link all 1,350 prompts to relevant industries

**Strategy:**
- Analyze prompt categories/metadata for industry hints
- Default mappings:
  - Medical Affairs prompts → Pharmaceuticals
  - Digital Health prompts → Digital Health
  - Clinical prompts → Both industries
  - Regulatory prompts → Both industries
- Create ~2,700 mappings (1,350 prompts × 2 industries avg)

### Phase 3C: Create Task Mappings
**Goal:** Link prompts to tasks where applicable

**Strategy:**
- Extract `task_id` or `task_code` from `dh_prompt.task_id` or metadata
- Look up actual task in `dh_task` table
- Create mapping in `prompt_task_mapping`
- Expected: 300-400 task mappings

### Phase 3D: Validation & Cleanup
**Goal:** Verify data integrity

**Tests:**
1. Prompt count validation
2. No duplicate prompts
3. Industry mappings coverage
4. Task mappings integrity
5. Suite/subsuite relationships
6. Metadata preservation
7. Sample prompt verification

---

## 🛠️ Implementation Plan

### Script 1: Schema Enhancement (if needed)
**File:** `scripts/phase3/01_enhance_prompts_schema.sql`
**Purpose:** Ensure tables have all needed columns
**Time:** 5 minutes

```sql
-- Ensure prompts table has all columns
-- Verify foreign keys
-- Add indexes for performance
```

### Script 2: Migrate dh_prompt → prompts
**File:** `scripts/phase3/02_migrate_dh_prompts.py`
**Purpose:** Core migration of 352 prompts
**Time:** 30 minutes

**Logic:**
```python
for dh_prompt in dh_prompts:
    # Check if exists
    existing = find_prompt_by_name_or_id(dh_prompt)
    
    if existing:
        skip()
    else:
        prompt_record = {
            'name': dh_prompt.name,
            'system_prompt': dh_prompt.system_prompt,
            'user_prompt_template': dh_prompt.user_template,
            'metadata': {
                'source': 'dh_prompt',
                'original_id': dh_prompt.id,
                'task_id_reference': dh_prompt.task_id,
                'pattern': dh_prompt.pattern,
                **dh_prompt.metadata
            },
            'tenant_id': dh_prompt.tenant_id,
            'is_active': True
        }
        insert_into_prompts(prompt_record)
```

### Script 3: Create Industry Mappings
**File:** `scripts/phase3/03_create_prompt_industry_mappings.py`
**Purpose:** Map all prompts to industries
**Time:** 1 hour

**Strategy:**
```python
# Get all prompts
prompts = get_all_prompts()

for prompt in prompts:
    industries = determine_industries(prompt)
    
    for industry_id in industries:
        create_mapping(prompt.id, industry_id)
```

### Script 4: Create Task Mappings
**File:** `scripts/phase3/04_create_prompt_task_mappings.py`
**Purpose:** Link prompts to tasks
**Time:** 30 minutes

### Script 5: Validation
**File:** `scripts/phase3/05_validate_prompt_migration.py`
**Purpose:** Comprehensive validation
**Time:** 15 minutes

### Script 6: Rollback (Safety Net)
**File:** `scripts/phase3/06_rollback_prompt_migration.sql`
**Purpose:** Emergency rollback if needed
**Time:** 5 minutes to create

---

## 📅 Execution Timeline

### Week 1 (Days 1-5)
**Monday-Tuesday:**
- ✅ Create all 6 migration scripts
- ✅ Test in DRY_RUN mode
- ✅ Fix any issues

**Wednesday:**
- ✅ Execute Phase 3A: Migrate dh_prompt (352 prompts)
- ✅ Validate migrated prompts

**Thursday:**
- ✅ Execute Phase 3B: Create industry mappings (~2,700)
- ✅ Execute Phase 3C: Create task mappings (~300-400)

**Friday:**
- ✅ Execute Phase 3D: Full validation
- ✅ Documentation

### Week 2 (Days 6-7) - Buffer
**Monday:**
- ✅ Final testing
- ✅ Ask Expert integration testing (if ready)

**Tuesday:**
- ✅ Sign-off and Phase 3 completion

---

## 🎯 Expected Results

### After Phase 3 Completion

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **prompts** rows | 1,000 | **~1,350** | +350 |
| **dh_prompt** (legacy) | 352 | **352** | Keep for reference |
| **Industry mappings** | 9 | **~2,700** | +2,691 |
| **Task mappings** | 9 | **~350** | +341 |
| **Validation** | N/A | **7/7** | ✅ |

### Benefits
✅ **Single source of truth** for prompts  
✅ **Multi-industry support** via mappings  
✅ **Task associations** for context  
✅ **Zero data loss** (all in metadata)  
✅ **Clean architecture** (industry-agnostic core)  
✅ **Scalable** (easy to add new industries/tasks)  

---

## ⚠️ Risk Assessment

### LOW RISK ✅
- Similar to Phase 1 & 2 (proven approach)
- Non-destructive (keeps `dh_prompt` table)
- Rollback script available
- DRY_RUN testing before execution

### Potential Issues & Mitigations

**Issue 1: Duplicate Prompts**
- **Risk:** Some prompts may already exist in both tables
- **Mitigation:** Check by name + metadata before inserting
- **Impact:** Low - just skip duplicates

**Issue 2: Industry Assignment**
- **Risk:** Wrong industry for some prompts
- **Mitigation:** Use category + metadata analysis, review samples
- **Impact:** Low - can be corrected post-migration

**Issue 3: Task ID Resolution**
- **Risk:** `task_id` from dh_prompt may not match `dh_task.id`
- **Mitigation:** Store as reference, create mappings where valid match found
- **Impact:** Medium - some mappings may fail (acceptable)

---

## 📊 Success Metrics

### Must-Have (Critical)
- [ ] **100% prompt migration** (0 lost from dh_prompt)
- [ ] **>90% industry mapping coverage** (>1,200 prompts mapped)
- [ ] **Zero data loss** (all metadata preserved)
- [ ] **100% validation pass** (all tests green)

### Nice-to-Have (Bonus)
- [ ] **>80% task mapping coverage** (>270 prompts linked to tasks)
- [ ] **Suite hierarchy preserved** (all references intact)
- [ ] **Performance optimized** (indexes on mapping tables)

---

## 🔄 Comparison with Phase 1 & 2

### Phase 1: Personas
- Migrated 210 personas
- Created `personas` table
- Industry/role mappings
- **Time:** 1 day
- **Status:** ✅ Complete

### Phase 2: Agents
- Migrated 189 agents
- Created `agents` enhancements
- Industry/persona mappings
- **Time:** 2 days (with fixes)
- **Status:** ✅ Complete

### Phase 3: Prompts (This Plan)
- Migrate ~350 prompts
- Enhance `prompts` table usage
- Industry/task mappings
- **Est. Time:** 3-5 days
- **Status:** 📋 Planning → Execution

---

## 📝 Documentation Plan

### Documents to Create
1. **PHASE_3_PROMPT_MIGRATION_COMPLETE.md** - Technical guide
2. **PROMPT_ARCHITECTURE_GUIDE.md** - How to use new structure
3. **PHASE_3_VALIDATION_REPORT.md** - Results and metrics

### Updates Needed
1. Update API documentation
2. Update schema diagrams
3. Update developer guides

---

## 🚀 Ready to Execute!

### Immediate Next Steps
1. ✅ **Create migration scripts** (6 scripts)
2. ✅ **Test in DRY_RUN mode**
3. ✅ **Execute migrations**
4. ✅ **Validate results**
5. ✅ **Document everything**

### Approval Needed
- [ ] Approve this Phase 3 plan
- [ ] Confirm timeline (1-1.5 weeks)
- [ ] Proceed with script creation

---

## 💡 Questions Before Starting

1. **Timing:** Start immediately or wait for Ask Expert update completion?
2. **Scope:** Migrate all 352 dh_prompts or selective migration?
3. **Validation:** Any specific prompt categories to prioritize?
4. **Industry Assignment:** Any custom rules for specific prompt types?

---

**Phase 3 Planning: COMPLETE!** ✅  
**Ready to build scripts and execute!** 🚀

*Shall I start creating the migration scripts now?*

---

*Generated: November 9, 2025, 9:20 PM*  
*Target: 1,350 prompts unified*  
*Industry Mappings: ~2,700*  
*Task Mappings: ~350*  
*Status: Awaiting Approval to Proceed*



