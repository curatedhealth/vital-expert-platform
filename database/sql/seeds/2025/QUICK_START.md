# 🚀 QUICK START: Execute Remaining Clinical Development Use Cases

## ✅ What's Complete

**4 NEW USE CASES READY TO SEED:**
1. UC_CD_005: PRO Instrument Selection (8 tasks)
2. UC_CD_007: Sample Size Calculation (7 tasks)
3. UC_CD_009: Subgroup Analysis Planning (5 tasks)
4. UC_CD_010: Clinical Trial Protocol Development (8 tasks)

**Total: 28 new tasks across 4 use cases**

---

## 🎯 Quick Execution (Recommended)

### Option 1: Use the Shell Script (Easiest)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Execute all 4 use cases at once
./execute_remaining_cd_usecases.sh
```

This script will:
- Execute all 8 SQL files in correct order
- Verify successful execution
- Show summary statistics
- Handle errors gracefully

---

## 🔍 Option 2: Validate First (Recommended for Safety)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds"

# Validate all files first
python3 validate_seed_file.py 2025/12_cd_005_pro_instrument_selection_part1.sql
python3 validate_seed_file.py 2025/12_cd_005_pro_instrument_selection_part2.sql
python3 validate_seed_file.py 2025/13_cd_007_sample_size_calculation_part1.sql
python3 validate_seed_file.py 2025/13_cd_007_sample_size_calculation_part2.sql
python3 validate_seed_file.py 2025/14_cd_009_subgroup_analysis_planning_part1.sql
python3 validate_seed_file.py 2025/14_cd_009_subgroup_analysis_planning_part2.sql
python3 validate_seed_file.py 2025/15_cd_010_protocol_development_part1.sql
python3 validate_seed_file.py 2025/15_cd_010_protocol_development_part2.sql

# If all pass validation, run the execution script
cd 2025
./execute_remaining_cd_usecases.sh
```

---

## 📝 Option 3: Manual Execution (Step-by-Step)

If you prefer to execute files one by one:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# UC_CD_005: PRO Instrument Selection
psql -U your_user -d your_database -f 12_cd_005_pro_instrument_selection_part1.sql
psql -U your_user -d your_database -f 12_cd_005_pro_instrument_selection_part2.sql

# UC_CD_007: Sample Size Calculation
psql -U your_user -d your_database -f 13_cd_007_sample_size_calculation_part1.sql
psql -U your_user -d your_database -f 13_cd_007_sample_size_calculation_part2.sql

# UC_CD_009: Subgroup Analysis Planning
psql -U your_user -d your_database -f 14_cd_009_subgroup_analysis_planning_part1.sql
psql -U your_user -d your_database -f 14_cd_009_subgroup_analysis_planning_part2.sql

# UC_CD_010: Clinical Trial Protocol Development
psql -U your_user -d your_database -f 15_cd_010_protocol_development_part1.sql
psql -U your_user -d your_database -f 15_cd_010_protocol_development_part2.sql
```

---

## ✅ Verify Success

After execution, run this query to verify:

```sql
SELECT 
  uc.code,
  uc.title,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code IN ('UC_CD_005', 'UC_CD_007', 'UC_CD_009', 'UC_CD_010')
GROUP BY uc.code, uc.title
ORDER BY uc.code;
```

**Expected Results:**
- UC_CD_005: 1 workflow, 8 tasks
- UC_CD_007: 1 workflow, 7 tasks
- UC_CD_009: 1 workflow, 5 tasks
- UC_CD_010: 1 workflow, 8 tasks

---

## 📚 Full Documentation

For complete details, see:
- **`CLINICAL_DEVELOPMENT_COMPLETE_FINAL.md`** - Comprehensive summary
- **`SCHEMA_REFERENCE_FINAL.md`** - Schema documentation
- **`CREATION_CHECKLIST.md`** - Best practices
- **`README_DOCUMENTATION.md`** - Documentation guide

---

## 🎉 After Execution

Once all use cases are seeded, you'll have:

**10 Complete Clinical Development Use Cases**
- UC_CD_001: DTx Clinical Endpoint Selection ✅
- UC_CD_002: Digital Biomarker Validation Strategy ✅
- UC_CD_003: DTx RCT Design ✅
- UC_CD_004: Comparator Selection Strategy ✅
- UC_CD_005: PRO Instrument Selection ✅ (NEW)
- UC_CD_006: Adaptive Trial Design ✅
- UC_CD_007: Sample Size Calculation ✅ (NEW)
- UC_CD_008: Engagement Metrics as Endpoints ✅
- UC_CD_009: Subgroup Analysis Planning ✅ (NEW)
- UC_CD_010: Clinical Trial Protocol Development ✅ (NEW)

**Total: 78 tasks, ~500+ assignments across workflows, agents, personas, tools, and RAG sources**

---

## 🚨 Troubleshooting

### If execution fails:

1. **Check database connection**:
   ```bash
   psql -U your_user -d your_database -c "SELECT 1;"
   ```

2. **Verify tenant exists**:
   ```sql
   SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
   ```

3. **Check foundation data is seeded**:
   ```sql
   SELECT 'Agents' as type, COUNT(*) FROM dh_agent
   UNION ALL
   SELECT 'Personas', COUNT(*) FROM dh_persona
   UNION ALL
   SELECT 'Tools', COUNT(*) FROM dh_tool
   UNION ALL
   SELECT 'RAG Sources', COUNT(*) FROM dh_rag_source;
   ```

4. **Review error logs** and check against `SCHEMA_REFERENCE_FINAL.md`

---

**Ready to go? Run the execution script and you're done! 🎊**

```bash
./execute_remaining_cd_usecases.sh
```

