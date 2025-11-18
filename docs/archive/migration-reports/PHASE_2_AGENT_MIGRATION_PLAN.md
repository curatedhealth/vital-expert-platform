# Phase 2: Agent Migration - Detailed Execution Plan

**Objective**: Consolidate agent tables (`dh_agent`, `ai_agents`) into enhanced `agents` table with multi-industry support

**Status**: Ready to Execute  
**Timeline**: 1-2 weeks (10 working days)  
**Risk Level**: Low  
**Dependencies**: Phase 1 (Personas) recommended but not required

---

## 🎯 Phase 2 Objectives

### Primary Goals
1. ✅ Enhance existing `agents` table with orchestration & registry fields
2. ✅ Create `agent_industry_mapping` for multi-industry support
3. ✅ Create `agent_persona_mapping` for agent-persona relationships
4. ✅ Migrate agents from `dh_agent` table (if exists)
5. ✅ Migrate agents from `ai_agents` table (if exists)
6. ✅ Establish industry mappings for all agents
7. ✅ Validate data integrity and relationships

### Success Criteria
- All agents have industry mappings
- No duplicate `unique_id` values
- All required fields populated
- Existing agents preserved and enhanced
- Application queries work with new schema
- Zero data loss verified

---

## 📅 Detailed Timeline

### Week 3: Preparation & Schema (Days 15-18)

#### Day 15 (Monday): Review & Setup
- **Morning**:
  - [ ] Review all 5 scripts
  - [ ] Understand enhancement vs. migration approach
  - [ ] Check if `dh_agent` and `ai_agents` tables exist
- **Afternoon**:
  - [ ] Set up development environment
  - [ ] Verify Supabase credentials
  - [ ] Create database backup
  - [ ] Test connection with validation script

**Deliverable**: Environment ready, backup created

#### Day 16 (Tuesday): Dry Run
- **Morning**:
  - [ ] Run migration in DRY_RUN mode
  - [ ] Review console output for errors
  - [ ] Verify agent counts and logic
- **Afternoon**:
  - [ ] Analyze existing agents in production
  - [ ] Identify any potential conflicts
  - [ ] Document expected migration results

**Deliverable**: Dry run completed, no errors

#### Day 17 (Wednesday): Schema Enhancement
- **Morning**:
  - [ ] Review `01_create_agents_tables.sql`
  - [ ] Run schema enhancement in development
  - [ ] Verify new columns added correctly
- **Afternoon**:
  - [ ] Create `agent_industry_mapping` table
  - [ ] Create `agent_persona_mapping` table
  - [ ] Verify indexes and triggers
  - [ ] Test views and functions

**Deliverable**: Schema enhanced in dev, all tables created

#### Day 18 (Thursday): Staging Migration
- **Morning**:
  - [ ] Run migration on staging database
  - [ ] Monitor for errors or issues
  - [ ] Verify agent counts
- **Afternoon**:
  - [ ] Run validation script
  - [ ] Check all 7 validation tests
  - [ ] Create industry mappings
  - [ ] Document any issues

**Deliverable**: Staging migration complete, validated

---

### Week 4: Production & Integration (Days 19-24)

#### Day 19 (Friday): Production Migration
- **Morning**:
  - [ ] Final backup of production database
  - [ ] Schedule maintenance window (if needed)
  - [ ] Run `01_create_agents_tables.sql` in production
- **Afternoon**:
  - [ ] Run `02_migrate_agents_data.py` (production)
  - [ ] Monitor migration progress
  - [ ] Verify completion
  - [ ] Save migration mappings

**Deliverable**: Production migration complete

#### Day 20 (Monday): Validation & Mapping
- **Morning**:
  - [ ] Run `03_validate_agent_migration.py`
  - [ ] Review all validation results
  - [ ] Address any failures
- **Afternoon**:
  - [ ] Run `04_create_agent_industry_mappings.py`
  - [ ] Verify industry mappings created
  - [ ] Spot check agent-industry relationships
  - [ ] Document mapping statistics

**Deliverable**: Migration validated, industry mappings complete

#### Day 21 (Tuesday): Application Updates
- **Morning**:
  - [ ] Update agent query logic
  - [ ] Add industry filtering to queries
  - [ ] Test agent retrieval in app
- **Afternoon**:
  - [ ] Update agent creation flows
  - [ ] Update agent editing flows
  - [ ] Test end-to-end agent workflows

**Deliverable**: Application code updated

#### Day 22 (Wednesday): Persona Integration
- **Morning**:
  - [ ] Review agent-persona relationships
  - [ ] Create `agent_persona_mapping` entries
  - [ ] Map key agents to personas
- **Afternoon**:
  - [ ] Test persona-based agent queries
  - [ ] Verify interaction patterns
  - [ ] Document relationship patterns

**Deliverable**: Agent-persona relationships established

#### Day 23 (Thursday): Testing & Documentation
- **Morning**:
  - [ ] Run comprehensive integration tests
  - [ ] Test multi-industry agent queries
  - [ ] Test agent search functionality
  - [ ] Test agent orchestration features
- **Afternoon**:
  - [ ] Update API documentation
  - [ ] Update internal wiki
  - [ ] Create migration summary report
  - [ ] Train team on new schema

**Deliverable**: Testing complete, documentation updated

#### Day 24 (Friday): Monitoring & Wrap-up
- **Morning**:
  - [ ] Monitor production for 24 hours
  - [ ] Review logs for errors
  - [ ] Check performance metrics
- **Afternoon**:
  - [ ] Create Phase 2 completion report
  - [ ] Document lessons learned
  - [ ] Plan Phase 3 (Prompts)
  - [ ] Celebrate success! 🎉

**Deliverable**: Phase 2 complete, ready for Phase 3

---

## 🔧 What Gets Fixed

### Before Phase 2
```
❌ Multiple agent tables (agents, dh_agent, ai_agents)
❌ Agents locked to single industry
❌ No agent-persona relationships
❌ No orchestration support
❌ Limited metadata structure
❌ No performance tracking per industry
```

### After Phase 2
```
✅ ONE enhanced agents table
✅ Multi-industry agent support via mapping
✅ Agent-persona relationships defined
✅ Orchestration ready (delegation, escalation)
✅ Flexible JSONB metadata
✅ Performance metrics per industry
✅ Agent registry (public/private)
✅ Agent variants (parent_agent_id)
```

---

## 📊 Migration Metrics

### Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Agent Tables | 3 (agents, dh_agent, ai_agents) | 1 (agents, enhanced) |
| Total Agents | ~182 (in agents) + ? | 200-250 (consolidated) |
| Industry Mappings | 0 | 200-300 |
| Persona Mappings | 0 | Ready for creation |
| Orchestration Ready | No | Yes |
| Multi-Industry | No | Yes |

---

## ⚠️ Risk Assessment

### Risk Level: **LOW**

#### Why Low Risk?
1. **Existing Table Enhanced**: Not replacing, just adding columns
2. **Proven Pattern**: Following exact same pattern as Phase 1
3. **Non-Destructive**: Old tables preserved (dh_agent, ai_agents)
4. **Rollback Available**: Emergency rollback script ready
5. **Validation Built-In**: 7 comprehensive validation tests
6. **Dry Run First**: Test before production

#### Potential Issues & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Duplicate unique_id | Low | Low | Script auto-skips duplicates |
| Missing industry mapping | Medium | Low | Mapping script infers from metadata |
| Application breaks | Low | Medium | Update queries in dev first |
| Performance degradation | Very Low | Medium | Indexes added, queries optimized |
| Data loss | Very Low | High | Backup + rollback available |

---

## 🔄 Rollback Plan

### If Issues Occur

**Severity 1: Minor Issues (validation warnings)**
- Fix data and re-run validation
- No rollback needed

**Severity 2: Major Issues (multiple validation failures)**
1. Run `05_rollback_agent_migration.sql`
2. Soft-deletes migrated agents (DH_AGENT_*, AI_AGENT_*)
3. Removes agent_industry_mapping entries
4. Removes agent_persona_mapping entries
5. Keeps existing agents intact
6. Old tables (dh_agent, ai_agents) remain unchanged

**Severity 3: Critical Issues (data corruption)**
1. Restore from backup
2. Investigate root cause
3. Fix scripts
4. Re-attempt migration

**Recovery Time**: 5-15 minutes (soft delete) or 30-60 minutes (full restore)

---

## 🎓 Key Differences from Phase 1

### What's Different?

| Aspect | Phase 1 (Personas) | Phase 2 (Agents) |
|--------|-------------------|------------------|
| **Approach** | Create new table | Enhance existing |
| **Data Volume** | ~200 personas | ~200-250 agents |
| **Complexity** | Medium | Low |
| **Risk** | Low | Lower |
| **Impact** | High | High |
| **Tables Created** | 3 new | 2 new (1 enhanced) |

### What's the Same?

- ✅ Multi-industry mapping pattern
- ✅ Industry-agnostic core data
- ✅ Validation-first approach
- ✅ Rollback safety
- ✅ Dry run testing
- ✅ Comprehensive documentation

---

## 📈 Success Indicators

### During Migration
- ✅ No Python exceptions
- ✅ All agents found and processed
- ✅ Mapping files generated
- ✅ Progress logs show expected counts

### Post-Migration
- ✅ All 7 validation tests pass
- ✅ Agent count = expected range
- ✅ Industry mappings = 200-300
- ✅ No duplicate unique_ids
- ✅ Sample queries work
- ✅ Application functions normally
- ✅ No performance degradation

### Long-Term (1 week)
- ✅ No errors in production logs
- ✅ User feedback positive
- ✅ Query performance stable
- ✅ Data integrity maintained

---

## 🚀 Next Steps After Phase 2

### Phase 3: Prompt Consolidation (Weeks 5-6)
Already partially done! Need to:
- Consolidate `dh_prompt` into `prompts` ✅ (Done!)
- Verify prompt-task mappings ✅ (Done!)
- Add prompt-agent mappings (New!)

### Phase 4: Workflow Consolidation (Weeks 7-8)
- Consolidate `dh_workflow` + other workflow tables
- Create `workflow_industry_mapping`
- Map workflows to personas & agents

### Phase 5: Task Consolidation (Weeks 9-10)
- Consolidate `dh_task` + other task tables
- Create `task_industry_mapping`
- Simplify over-normalized structure

---

## 📋 Pre-Flight Checklist

Before starting Phase 2:

### Environment
- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`supabase`, `python-dotenv`)
- [ ] `.env` file configured with correct credentials
- [ ] Supabase connection tested

### Database
- [ ] Production database backed up
- [ ] Development/staging environment available
- [ ] Sufficient database storage space
- [ ] No ongoing migrations

### Team
- [ ] Team notified of migration schedule
- [ ] Key stakeholders informed
- [ ] Maintenance window scheduled (if needed)
- [ ] Support on standby

### Scripts
- [ ] All 5 scripts reviewed
- [ ] Scripts executable (`chmod +x`)
- [ ] Dry run completed successfully
- [ ] Rollback script ready

---

## 💡 Pro Tips

### Optimization Tips
1. **Run dry run first** - Always test with `DRY_RUN=true`
2. **Monitor logs** - Watch for patterns in skipped/failed agents
3. **Check industry detection** - Verify automatic industry assignment logic
4. **Batch industry mappings** - Run mapping script after main migration
5. **Create persona mappings gradually** - Don't map all at once

### Common Pitfalls to Avoid
1. ❌ Skipping dry run
2. ❌ Not backing up database
3. ❌ Running in production hours without warning
4. ❌ Ignoring validation failures
5. ❌ Not testing application queries before deployment

---

## 📞 Support & Resources

### Documentation
- `README.md` - Quick start guide (this file)
- `MASTER_SCHEMA_CONSOLIDATION_PLAN.md` - Overall strategy
- `PHASE_1_PERSONA_MIGRATION_PLAN.md` - Similar pattern reference

### Scripts
- `scripts/phase2/01_create_agents_tables.sql`
- `scripts/phase2/02_migrate_agents_data.py`
- `scripts/phase2/03_validate_agent_migration.py`
- `scripts/phase2/04_create_agent_industry_mappings.py`
- `scripts/phase2/05_rollback_agent_migration.sql`

---

## 🎉 Completion Criteria

Phase 2 is **COMPLETE** when:
- [x] Schema enhancement SQL executed successfully
- [x] Migration script executed (all agents processed)
- [x] All 7 validation tests PASS
- [x] Industry mappings created for all agents
- [x] Application queries updated and tested
- [x] Documentation updated
- [x] Team trained on new schema
- [x] Production stable for 48 hours

---

**Created**: November 9, 2025  
**Owner**: Schema Migration Team  
**Status**: Ready for Execution  
**Next Phase**: Prompt Consolidation (Partial - already started!)  

🚀 **Let's consolidate those agents!**

