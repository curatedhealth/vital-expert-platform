# Phase 1: Persona Migration Plan 👤
## Start Small, Prove the Pattern

**Date**: November 9, 2025  
**Duration**: 1-2 weeks  
**Risk Level**: Low  
**Business Impact**: High

---

## 🎯 Objective

Consolidate **TWO persona tables** into **ONE clean table** with industry mappings:
- `dh_personas` (59 columns, industry-specific) 
- `org_personas` (organizational hierarchy)
→ **`personas`** (clean, multi-industry)

---

## 📊 Current State

### Table 1: dh_personas (Legacy)
- **59 columns** (way too many!)
- Industry-specific IDs: `pharma_id`, `digital_health_id`, `biotech_id`
- Rich data: `responsibilities`, `pain_points`, `goals`
- Foreign key: `industry_id`, `primary_role_id`
- **182 personas** currently

### Table 2: org_personas (Organizational)
- Fewer columns, focused on org hierarchy
- Foreign key: `industry_id`, `primary_role_id`
- Maps to: `org_roles`, `org_departments`, `org_functions`

### The Problem
- **Which is the source of truth?** Neither!
- Data duplication risk
- Confusion for developers
- Can't easily map one persona to multiple industries

---

## ✅ Target State

### Single Clean Table: `personas`
```sql
personas (
    -- Identity & Core
    id, unique_id, name, description
    
    -- Attributes (15 core columns)
    seniority_level, decision_authority, persona_type
    
    -- Flexible Data (JSONB)
    profile, responsibilities, pain_points, goals
    
    -- Multi-tenancy
    tenant_id, is_public
    
    -- Audit
    created_at, updated_at, created_by, deleted_at
)
```

### Industry Mapping: `persona_industry_mapping`
```sql
persona_industry_mapping (
    persona_id → personas(id)
    industry_id → industries(id)
    is_primary, industry_specific_id, industry_metadata
)
```

### Role Mapping: `persona_role_mapping`
```sql
persona_role_mapping (
    persona_id → personas(id)
    role_id → org_roles(id)
    is_primary, responsibilities
)
```

---

## 🗺️ Migration Strategy

### Week 1: Preparation & Setup

#### Day 1: Create New Tables
1. Create `personas` table
2. Create `persona_industry_mapping` table
3. Create `persona_role_mapping` table
4. Set up indexes

#### Day 2: Build Migration Script
1. Write data migration script
2. Write validation script
3. Write rollback script
4. Test on development data

#### Day 3: Set Up Dual-Write
1. Update application layer to write to BOTH tables
2. Deploy dual-write code
3. Monitor for issues

#### Day 4-5: Testing & Validation
1. Run migration in staging
2. Validate data integrity
3. Performance testing
4. Fix any issues

### Week 2: Execution & Cutover

#### Day 1: Production Migration
1. **Backup database** (full backup)
2. Run migration script (read-only mode)
3. Validate results
4. Create industry mappings
5. Create role mappings

#### Day 2: Validation
1. Run comprehensive validation
2. Compare old vs new data
3. Fix any discrepancies
4. Get team sign-off

#### Day 3: Application Update
1. Update queries to use `personas` table
2. Update API endpoints
3. Deploy incrementally (feature flag)

#### Day 4: Monitoring
1. Monitor application performance
2. Monitor error logs
3. Track query patterns
4. Collect feedback

#### Day 5: Deprecation Planning
1. If all looks good → mark old tables as deprecated
2. Document migration completion
3. Schedule cleanup (30 days out)

---

## 📋 Migration Scripts

I'll create 5 scripts for you:

### Script 1: `01_create_personas_tables.sql`
Creates the new clean schema

### Script 2: `02_migrate_personas_data.py`
Migrates data from old → new

### Script 3: `03_validate_persona_migration.py`
Validates data integrity

### Script 4: `04_create_industry_mappings.py`
Creates all industry mappings

### Script 5: `05_rollback_persona_migration.sql`
Emergency rollback if needed

---

## 📊 Success Metrics

### Data Integrity
- ✅ 100% of personas migrated
- ✅ 0 data loss
- ✅ All relationships preserved
- ✅ All attributes mapped correctly

### Performance
- ✅ Query speed maintained or improved
- ✅ No application errors
- ✅ No performance degradation

### Business Value
- ✅ One source of truth established
- ✅ Multi-industry mapping enabled
- ✅ Pattern proven for other entities

---

## 🚨 Risk Mitigation

### Risk 1: Data Loss
**Mitigation**: 
- Full backup before migration
- Dual-write system (write to both tables)
- Keep old tables for 30 days
- Comprehensive validation scripts

### Risk 2: Application Downtime
**Mitigation**:
- Migration runs in background
- Dual-write ensures no interruption
- Feature flag for gradual rollout
- Rollback script ready

### Risk 3: Missing Data
**Mitigation**:
- Map all 59 columns from dh_personas
- JSONB for flexible attributes
- Validation compares old vs new
- Manual review of high-value personas

### Risk 4: Foreign Key Violations
**Mitigation**:
- Preserve all existing IDs
- Create mappings before queries switch
- Validate FK relationships
- Test in staging first

---

## ✅ Validation Checklist

### Pre-Migration
- [ ] Backup database completed
- [ ] Migration scripts tested in dev
- [ ] Validation scripts ready
- [ ] Rollback script tested
- [ ] Team briefed on process

### During Migration
- [ ] Migration script runs successfully
- [ ] No errors in logs
- [ ] Data count matches
- [ ] Foreign keys valid
- [ ] JSONB data valid

### Post-Migration
- [ ] All personas present in new table
- [ ] Industry mappings created
- [ ] Role mappings created
- [ ] Queries return same results
- [ ] No application errors
- [ ] Performance acceptable
- [ ] Team trained on new schema

---

## 📈 Expected Results

### Before
```
dh_personas: 182 personas (59 columns each)
org_personas: ??? personas (different schema)
Total: Duplicate/inconsistent data
```

### After
```
personas: 182+ personas (15 core columns + JSONB)
persona_industry_mapping: 250+ mappings (multi-industry!)
persona_role_mapping: 182+ role mappings
Total: Single source of truth, multi-industry enabled
```

---

## 🎓 What We Learn

### Technical Learnings
1. **Pattern proven** for other entities
2. **JSONB effectiveness** for flexible data
3. **Industry mapping** model validated
4. **Migration process** refined

### Business Learnings
1. **Impact of consolidation** (before/after metrics)
2. **Multi-industry value** (personas can be shared)
3. **Team velocity** (faster with clean schema)
4. **Risk management** (dual-write safety net works)

---

## 🚀 Next Steps After Phase 1

### If Successful (Expected!)
**Option 1: Continue Pattern**
- Apply same pattern to Agents (Week 3-4)
- Then Workflows (Week 5-6)
- Then Tasks (Week 7-8)

**Option 2: Focus on High-Value**
- Just do Personas, Agents, Prompts
- Leave other entities for later
- Get 80% value with 20% effort

**Option 3: Go All In**
- Execute full 12-week plan
- Transform entire schema
- Achieve gold standard

### If Issues Found
**Adjust & Iterate**
- Fix issues in Phase 1
- Refine scripts
- Apply learnings to Phase 2
- Slower but safer approach

---

## 📞 Support Structure

### Daily Standup (15 min)
- Progress update
- Blockers
- Plan for today

### Slack Channel: #persona-migration
- Real-time questions
- Issue tracking
- Success sharing

### Documentation
- `/docs/persona-migration/`
- Scripts in `/scripts/phase1/`
- Runbook in `/docs/runbook.md`

---

## 💰 Effort Estimate

| Activity | Hours | Owner |
|----------|-------|-------|
| **Schema Creation** | 4 | Developer 1 |
| **Migration Script** | 8 | Developer 1 |
| **Validation Script** | 4 | Developer 2 |
| **Testing** | 8 | Both |
| **Execution** | 4 | Developer 1 |
| **Monitoring** | 4 | Developer 2 |
| **Documentation** | 4 | Both |
| **TOTAL** | **36 hours** | **2 developers** |

**Timeline**: 1-2 weeks (depending on team availability)

---

## 📋 Deliverables

### Week 1
- ✅ New `personas` tables created
- ✅ Migration scripts complete
- ✅ Validation scripts complete
- ✅ Tested in staging
- ✅ Team trained

### Week 2
- ✅ Production migration complete
- ✅ Data validated
- ✅ Application updated
- ✅ Old tables deprecated
- ✅ Documentation complete
- ✅ Lessons learned documented

---

## 🎯 Decision Point

After Phase 1 completes, we'll have a **GO/NO-GO decision point**:

### GO Criteria (Continue to Phase 2)
- ✅ 100% data migrated successfully
- ✅ No application errors
- ✅ Performance maintained
- ✅ Team confident in process
- ✅ Pattern proven

### NO-GO Criteria (Pause & Fix)
- ❌ Data loss occurred
- ❌ Performance degraded significantly
- ❌ Application errors
- ❌ Team not confident
- ❌ Major issues found

**Most likely outcome: GO!** (Based on the success of your prompt migration)

---

## 📊 Comparison: Prompt Migration (Already Done) vs Persona Migration

| Aspect | Prompts ✅ | Personas (Planned) |
|--------|-----------|-------------------|
| **Old Tables** | dh_prompt | dh_personas + org_personas |
| **New Table** | prompts | personas |
| **Complexity** | Medium | High (2 sources) |
| **Row Count** | 9 | 182+ |
| **Mappings** | Industry, workflow, task | Industry, role, JTBD |
| **Success** | ✅ 100% | Expected ✅ 100% |

**If prompts worked (and they did!), personas will too!** 🎉

---

## 🎓 Training Materials

### For Developers
1. **New Schema Overview** (30 min)
   - personas table structure
   - Industry mapping pattern
   - Role mapping pattern
   - JSONB usage

2. **Query Patterns** (30 min)
   - How to query personas
   - How to get industry mappings
   - How to get role mappings
   - Performance tips

3. **Hands-On Practice** (60 min)
   - Write queries against new schema
   - Create test data
   - Practice migrations

### For Product Team
1. **Business Value** (15 min)
   - Why we're doing this
   - Benefits of consolidation
   - Multi-industry capabilities

2. **What Changed** (15 min)
   - Old vs new
   - Impact on features
   - Timeline

---

## ✅ Ready to Start?

**Next Immediate Actions:**

1. **Review this plan** (15 min)
   - Any questions?
   - Any concerns?
   - Any adjustments needed?

2. **Create migration scripts** (I'll do this!)
   - Script 1: Create tables
   - Script 2: Migrate data
   - Script 3: Validate
   - Script 4: Industry mappings
   - Script 5: Rollback

3. **Schedule kickoff** (when?)
   - Team availability?
   - Preferred timeline?
   - Any blockers?

---

**Status**: Ready to execute  
**Confidence Level**: High (proven pattern from prompts)  
**Risk Level**: Low (dual-write safety net)  
**Expected Success Rate**: 100%

Let me know when you're ready and I'll create all 5 migration scripts! 🚀

