# 🚀 MARKET ACCESS - QUICK START GUIDE

## ✅ Status: 100% COMPLETE

All 10 Market Access use cases are seeded and ready to execute!

---

## 📁 What Was Created

### Files (14 total):
1. `16_ma_001_value_dossier_part1.sql` + `part2.sql` (8 tasks)
2. `17_ma_002_health_economics_part1.sql` + `part2.sql` (7 tasks)
3. `18_ma_003_cpt_hcpcs_code_part1.sql` + `part2.sql` (6 tasks)
4. `19_ma_004_formulary_positioning_part1.sql` + `part2.sql` (5 tasks)
5. `20_ma_005_pt_presentation_part1.sql` + `part2.sql` (5 tasks)
6. `21-25_ma_006-010_combined_part1.sql` (MA_006-010 workflows & tasks)
7. `21-25_ma_006-010_combined_part2.sql` (MA_006-010 assignments)
8. `execute_all_ma_usecases.sh` (Execution script)

---

## ⚡ Quick Execute (30 seconds)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Set your database credentials
export DB_NAME="your_database"
export DB_USER="your_username"

# Execute all Market Access use cases
./execute_all_ma_usecases.sh
```

**Done!** All 10 use cases will be seeded automatically.

---

## 🔍 Verify Seeding

```sql
SELECT 
  uc.code, 
  uc.title,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
WHERE uc.code LIKE 'UC_MA_%'
GROUP BY uc.code, uc.title
ORDER BY uc.code;
```

**Expected Result**: 10 use cases, 10 workflows, ~63 tasks

---

## 📚 Use Cases Covered

| Code | Title | Tasks | Complexity | Duration |
|------|-------|-------|------------|----------|
| UC_MA_001 | Payer Value Dossier | 8 | ADVANCED | 200 min |
| UC_MA_002 | Health Economics Model | 7 | EXPERT | 180 min |
| UC_MA_003 | CPT/HCPCS Code Strategy | 6 | EXPERT | 150 min |
| UC_MA_004 | Formulary Positioning | 5 | INTERMEDIATE | 150 min |
| UC_MA_005 | P&T Presentation | 5 | ADVANCED | 120 min |
| UC_MA_006 | Budget Impact Model | 6 | ADVANCED | 180 min |
| UC_MA_007 | Comparative Effectiveness | 6 | EXPERT | 240 min |
| UC_MA_008 | Value-Based Contracting | 7 | EXPERT | 210 min |
| UC_MA_009 | HTA Submission | 8 | EXPERT | 360 min |
| UC_MA_010 | Patient Assistance Program | 5 | INTERMEDIATE | 120 min |

**Total**: 63 tasks across 10 workflows

---

## 🎯 Key Features

### Complete Market Access Lifecycle ✅
- Payer evidence generation
- Economic modeling (CEA, BIM)
- Reimbursement strategy (CPT codes, formulary positioning)
- Payer engagement (P&T presentations, VBC)
- Global access (HTA submissions)
- Patient support (PAP design)

### AI-Human Collaboration ✅
- Agents: Workflow orchestration, biostatistics, literature search, report writing
- Personas: Market Access Director, HEOR Specialist, Regulatory Affairs, Medical Affairs, Payer Relations
- Human approval at critical decision points
- Escalation paths configured

### Production-Ready ✅
- Schema compliant
- Validation tested
- Executable immediately
- Well-documented

---

## 💡 Common Tasks

### Execute Individual Use Case
```bash
# Example: Execute only UC_MA_001
psql -U your_user -d your_database -f 16_ma_001_value_dossier_part1.sql
psql -U your_user -d your_database -f 16_ma_001_value_dossier_part2.sql
```

### Execute Specific Group
```bash
# Execute MA_001-005 (individual files)
for uc in 16_ma_001 17_ma_002 18_ma_003 19_ma_004 20_ma_005; do
  psql -U your_user -d your_database -f ${uc}_*_part1.sql
  psql -U your_user -d your_database -f ${uc}_*_part2.sql
done

# Execute MA_006-010 (combined files)
psql -U your_user -d your_database -f 21-25_ma_006-010_combined_part1.sql
psql -U your_user -d your_database -f 21-25_ma_006-010_combined_part2.sql
```

### Test Specific Workflow
```sql
-- Get workflow ID for UC_MA_001
SELECT id, name, description FROM dh_workflow WHERE unique_id = 'WFL-MA-001-001';

-- Get tasks for this workflow
SELECT t.code, t.title, t.position, t.objective 
FROM dh_task t
INNER JOIN dh_workflow wf ON wf.id = t.workflow_id
WHERE wf.unique_id = 'WFL-MA-001-001'
ORDER BY t.position;

-- Get agent assignments
SELECT t.code, a.name, ta.assignment_type, ta.execution_order
FROM dh_task_agent ta
INNER JOIN dh_task t ON t.id = ta.task_id
INNER JOIN dh_agent a ON a.id = ta.agent_id
WHERE t.code LIKE 'TSK-MA-001-%'
ORDER BY t.code, ta.execution_order;
```

---

## 📖 Documentation

For detailed information, see:
- **MA_COMPLETE_SUMMARY.md** - Comprehensive overview
- **MA_FINAL_STATUS.md** - Implementation progress
- **MARKET_ACCESS_IMPLEMENTATION_PLAN.md** - Original strategy
- **SCHEMA_REFERENCE_FINAL.md** - Database schema reference

---

## 🐛 Troubleshooting

### Error: Tenant not found
**Solution**: Ensure your tenant slug is 'digital-health-startup' or update the SQL files

### Error: Duplicate key violation
**Solution**: Use cases already seeded. Either:
1. Skip (ON CONFLICT will update)
2. Delete existing data first
3. Use different tenant

### Error: Column does not exist
**Solution**: Ensure all migrations are run:
```bash
cd database
npm run db:migrate
```

---

## 🎉 You're All Set!

Execute the script and you'll have a complete Market Access workflow architecture in your database.

**Questions?** Check the comprehensive documentation files.

**Next Domain?** Move to Regulatory Affairs (RA), Product Development (PD), or other domains.

---

**Created**: November 2, 2025  
**Status**: Production-Ready ✅  
**Version**: 1.0

