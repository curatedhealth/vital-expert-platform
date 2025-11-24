# Medical Affairs Role Enrichment - File Index

**Command Center Location:** `.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/`

---

## 📁 File Organization

```
medical-affairs-enrichment/
│
├── 📋 INDEX.md (this file)
├── 📖 README.md (overview and quick start)
├── 📖 ORCHESTRATED_RESEARCH_COMPLETE.md (multi-agent research summary)
│
├── 📊 Schema & Documentation
│   ├── org_roles_complete_attribute_mapping.md (54-attribute schema)
│   ├── PHASE1_DELIVERY_SUMMARY.md (executive summary)
│   └── README_PHASE1_DEPLOYMENT.md (deployment guide)
│
├── 🗄️ Reference Data Seeds (Run First)
│   ├── 00_run_all_reference_data_seeds.sql (master script)
│   ├── 01_seed_regulatory_frameworks.sql (20 records)
│   ├── 02_seed_gxp_training_modules.sql (15 records)
│   └── 03_seed_clinical_competencies.sql (36 records)
│
├── 📦 Phase 1 Enrichment Data (✅ Complete)
│   └── phase1_field_medical_enrichment.json (15 Field Medical roles)
│
├── 📦 Phase 2 Enrichment Data (🔄 Needs role_ids)
│   ├── phase2_medical_information_enrichment.json (15 Medical Info roles)
│   ├── query_phase2_role_ids_FIXED.sql (database query) ⭐ USE THIS
│   ├── query_phase2_role_ids.sql (deprecated - wrong column names)
│   └── README_UPDATE_ROLE_IDS.md (update instructions)
│
├── 📦 Phase 3 Enrichment Data (🔄 Needs role_ids)
│   ├── phase3_scientific_communications_enrichment.json (15 Sci Comm roles)
│   ├── query_phase3_role_ids_FIXED.sql (database query) ⭐ USE THIS
│   └── query_phase3_role_ids.sql (deprecated - wrong column names)
│
├── 🛠️ Update Tools & Scripts
│   ├── apply_role_ids_from_export.py (✅ USED - automated update from export)
│   ├── create_missing_roles.sql (⭐ RUN THIS - creates 4 missing roles)
│   ├── update_role_ids_from_db.py (deprecated - use apply script instead)
│   ├── 00_check_actual_schema.sql (schema verification)
│   └── SCHEMA_FIX_README.md (column name fix documentation)
│
└── 📚 Guides & Documentation
    ├── QUICK_START_COMPLETE_UPDATE.md (⚡ 10-min guide to 100% completion)
    ├── CREATE_MISSING_ROLES_GUIDE.md (detailed step-by-step)
    ├── ROLE_ID_UPDATE_COMPLETE.md (87% completion report)
    └── README_UPDATE_ROLE_IDS.md (original update guide)
```

---

## 🎯 Quick Access Guide

### 🎯 ACTION REQUIRED: Complete Final 4 Roles (2025-11-23)
**Quick Start:** `QUICK_START_COMPLETE_UPDATE.md` ⚡ (10 minutes)
**Full Guide:** `CREATE_MISSING_ROLES_GUIDE.md`
**Status:** 26/30 roles updated (87%) → Target: 100%
**Action:** Run `create_missing_roles.sql` in Supabase, then re-run update script

### New to this project?
**Start here:** `README.md`

### Need to update Phase 2-3 role_ids?
**Follow this:** `README_UPDATE_ROLE_IDS.md` ⭐ **NEW**
**Use fixed queries:** `query_phase*_FIXED.sql` files

### Ready to deploy Phase 1?
**Follow this:** `README_PHASE1_DEPLOYMENT.md`

### Want multi-agent research summary?
**Read this:** `ORCHESTRATED_RESEARCH_COMPLETE.md` ⭐ **NEW**

### Need schema details?
**Check this:** `org_roles_complete_attribute_mapping.md`

### Want Phase 1 executive summary?
**Read this:** `PHASE1_DELIVERY_SUMMARY.md`

### Need to seed reference data?
**Run this:** `00_run_all_reference_data_seeds.sql`

### Ready for role enrichment?
- **Phase 1:** `phase1_field_medical_enrichment.json` ✅
- **Phase 2:** `phase2_medical_information_enrichment.json` 🔄
- **Phase 3:** `phase3_scientific_communications_enrichment.json` 🔄

---

## 📈 Status Overview

| Component | Status | Records/Roles |
|-----------|--------|---------------|
| Reference Data Seeds | ✅ Ready | 71 records |
| Phase 1 Enrichment (Field Medical) | ✅ Ready | 15 roles |
| Phase 2 Enrichment (Medical Info) | ✅ 14/15 Updated (93%) | 15 roles |
| Phase 3 Enrichment (Sci Comm) | ✅ 12/15 Updated (80%) | 15 roles |
| Phase 4 Enrichment (HEOR, etc.) | ⏳ Pending | 55 roles |
| Documentation | ✅ Complete | 6 docs |
| Database Queries | ✅ Ready | 2 queries |
| Update Tools | ✅ Ready | 1 script |
| **Total Progress** | **45% Complete** | **45/100 roles** |
| **Total Files** | **✅ Production Ready** | **17 files** |

---

## 🔄 Migration History

**From:** `database/seeds/` (project root)
**To:** `.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/`
**Date:** 2025-11-23
**Reason:** Centralize all templates and seeds in command center

---

## 🚀 Deployment Order

1. **Prerequisites** → Verify migration applied
2. **Reference Data** → Run `00_run_all_reference_data_seeds.sql`
3. **Enrichment** → Transform JSON to SQL (see deployment guide)
4. **Validation** → Run validation queries
5. **Phase 2-4** → Repeat for remaining 85 roles

---

## 📚 Related Resources

### In Command Center:
- **Main Schema:** `../../` (data-schema root)
- **Other Role Seeds:** `../populate_roles_01_medical_affairs.sql`
- **Templates:** `../../../08-templates/`

### In Project Root:
- **Migration:** `supabase/migrations/20251122000001_role_enrichment_phase1_foundation.sql`
- **Database:** `database/` (DO NOT use for templates/seeds - use command center instead)

---

## 🔍 Search Tips

**Find regulatory frameworks:**
```bash
grep -r "ICH GCP" 01_seed_regulatory_frameworks.sql
```

**Find GxP training modules:**
```bash
grep -r "Pharmacovigilance" 02_seed_gxp_training_modules.sql
```

**Find competencies:**
```bash
grep -r "KOL" 03_seed_clinical_competencies.sql
```

**Find role enrichment:**
```bash
jq '.roles[] | select(.role_name | contains("MSL"))' phase1_field_medical_enrichment.json
```

---

## ⚠️ Important Notes

1. **Always use command center location** for templates and seeds
2. **Do not modify files in `database/seeds/`** - they've been moved here
3. **Run reference data seeds BEFORE enrichment** - junction tables need foreign keys
4. **Validate after each deployment** - use queries in deployment guide
5. **Follow same structure for Phases 2-4** - maintain consistency

---

## 📞 Support

**Questions about:**
- **🎯 Completing 100% Update** → See `QUICK_START_COMPLETE_UPDATE.md` ⚡ **START HERE**
- **Creating Missing Roles** → See `CREATE_MISSING_ROLES_GUIDE.md` 📖
- **Current Update Status** → See `ROLE_ID_UPDATE_COMPLETE.md` (87% report)
- **Multi-agent Research** → See `ORCHESTRATED_RESEARCH_COMPLETE.md`
- **Structure/Organization** → See `README.md`
- **Phase 1 Deployment** → See `README_PHASE1_DEPLOYMENT.md`
- **Schema Details** → See `org_roles_complete_attribute_mapping.md`
- **Phase 1 Deliverables** → See `PHASE1_DELIVERY_SUMMARY.md`
- **Database Queries** → Use `query_phase*_FIXED.sql` files
- **Schema Column Issues** → See `SCHEMA_FIX_README.md`
- **Schema Verification** → See `00_check_actual_schema.sql`

---

**Last Updated:** 2025-11-23
**Version:** 2.0
**Maintained By:** Medical Affairs Data Team & VITAL Multi-Agent Platform
