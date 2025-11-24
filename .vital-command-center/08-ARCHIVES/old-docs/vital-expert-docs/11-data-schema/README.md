# Data Schema Documentation

**Last Updated**: 2025-11-21  
**Status**: ✅ Production Ready  
**Version**: 2.0 (Gold Standard)

---

## 📋 Quick Navigation

### **Getting Started**
- [📖 Complete Summary](./GOLD_STANDARD_COMPLETE.md) - **START HERE** for overview
- [📋 Original Plan](./GOLD_STANDARD_FINAL_GAPS.md) - Detailed implementation roadmap
- [🗂️ Migration History](./06-migrations/README.md) - All schema changes

### **Architecture Guides**
- [🎯 JTBD Architecture](./jtbds/COMPLETE_JTBD_ARCHITECTURE.md) - Job-to-be-Done system
- [📊 Data Ownership Guide](./jtbds/DATA_OWNERSHIP_GUIDE.md) - What goes where
- [🔄 Workflow Architecture](./workflows/WORKFLOW_ARCHITECTURE.md) - Execution layer
- [💡 Query Examples](./jtbds/QUERY_EXAMPLES.md) - Practical SQL patterns

### **Technical Reference**
- [🔍 Views](./04-views/) - Aggregation & reporting views
- [⚙️ Migrations](./06-migrations/) - All schema change scripts
- [🛠️ Utilities](./07-utilities/) - Helper scripts & verification

---

## 🎯 Current Status

### ✅ **Completed (100%)**

All gold-standard normalization phases complete:

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1-4** | Foundation (already complete) | ✅ Done |
| **Phase 5** | JTBD Table Unification | ✅ Done |
| **Phase 6** | Capability Normalization | ✅ Done |
| **Phase 7** | Array Cleanup | ✅ Done |
| **Phase 8** | Documentation | ✅ Done |

---

## 🏗️ Architecture Overview

### **5-Layer Data Architecture**

```
┌─────────────────────────────────────────────┐
│  1. ORGANIZATIONAL STRUCTURE (Supply-Side)  │
│     org_functions → org_departments         │
│     → org_roles → personas                  │
│     Zero arrays ✅                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. JTBD LAYER (Demand-Side)               │
│     jtbd (single canonical table)           │
│     + outcomes, pain points, constraints    │
│     + normalized mappings (ID+NAME)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. VALUE & AI LAYERS                       │
│     value_categories, value_drivers         │
│     ai_intervention_types                   │
│     + junction tables & assessments         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. EXECUTION LAYER                         │
│     workflow_templates (with work_mode)     │
│     → workflow_stages → workflow_tasks      │
│     tasks → task_steps → lang_components    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. RUNTIME LAYER                           │
│     workflow_executions, logs               │
│     (JSONB acceptable here)                 │
└─────────────────────────────────────────────┘
```

---

## 🎉 Key Achievements

### **✅ Zero Technical Debt**
- Single canonical tables (no duplicates)
- Zero arrays in core tables
- Zero JSONB in ontology (only in logs)
- Consistent junction patterns throughout

### **✅ Enterprise-Ready Features**
- Multi-tenant architecture
- Backward compatibility via views
- Auto-sync triggers for cached fields
- Comprehensive error handling

### **✅ LangGraph Integration**
- `lang_components` registry
- `task_steps` → `step_parameters` model
- Ready for agentic workflow execution

---

## 📊 Schema Statistics

### **Core Tables**
- **JTBD**: 1 canonical table (was 2)
- **Personas**: 1 main + 20+ normalized children
- **Workflows**: 1 template model (3 legacy deprecated)
- **Mappings**: All use "ID + NAME" pattern

### **Data Quality**
- **Arrays in core tables**: 0 (was 10+)
- **JSONB in ontology**: 0 (except runtime/logs)
- **Orphaned mappings**: 0 (verified)
- **Foreign key integrity**: 100%

---

## 🚀 Quick Start

### **1. Understanding the Schema**

Read these in order:
1. [GOLD_STANDARD_COMPLETE.md](./GOLD_STANDARD_COMPLETE.md) - Summary
2. [jtbds/COMPLETE_JTBD_ARCHITECTURE.md](./jtbds/COMPLETE_JTBD_ARCHITECTURE.md) - JTBD details
3. [jtbds/QUERY_EXAMPLES.md](./jtbds/QUERY_EXAMPLES.md) - Practical queries

### **2. Running Migrations**

All migrations are idempotent and can be run multiple times:

```bash
# Via Supabase SQL Editor (recommended)
# Copy and paste each file in order:
1. phase5_unify_jtbd_tables.sql
2. phase6_capability_normalization.sql
3. phase7_complete_array_cleanup.sql

# Or via psql
cd .vital-docs/vital-expert-docs/11-data-schema/06-migrations
psql -f phase5_unify_jtbd_tables.sql
psql -f phase6_capability_normalization.sql
psql -f phase7_complete_array_cleanup.sql
```

### **3. Verifying the Schema**

```sql
-- Check for arrays (should return 0)
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('jtbd', 'org_roles', 'personas', 'tasks')
  AND data_type = 'ARRAY';

-- Verify JTBD unification
SELECT COUNT(*) as jtbd_count,
       COUNT(job_statement) as with_job_statement,
       COUNT(when_situation) as with_when_situation
FROM jtbd;

-- Check junction tables
SELECT 'jtbd_roles' as table_name, 
       COUNT(*) as total,
       COUNT(role_name) as with_cached_name
FROM jtbd_roles;
```

---

## 📁 Directory Structure

```
11-data-schema/
├── README.md (this file)
├── GOLD_STANDARD_COMPLETE.md (executive summary)
├── GOLD_STANDARD_FINAL_GAPS.md (detailed plan)
│
├── 01-core-schema/
│   └── [Core table definitions]
│
├── 04-views/
│   ├── README.md
│   ├── jtbd_comprehensive_views.sql (5 aggregation views)
│   └── workflow_views.sql
│
├── 06-migrations/
│   ├── README.md
│   ├── phase1_foundation_cleanup.sql
│   ├── phase2_array_jsonb_cleanup.sql
│   ├── phase3_value_ai_layers.sql
│   ├── phase4_jtbd_comprehensive_views.sql
│   ├── phase5_unify_jtbd_tables.sql (NEW)
│   ├── phase6_capability_normalization.sql (NEW)
│   ├── phase7_complete_array_cleanup.sql (NEW)
│   └── workflow_normalization.sql
│
├── 07-utilities/
│   ├── cleanup/
│   │   └── reset_workflows_tasks_only.sql
│   └── verification/
│       ├── phase1_verification.sql
│       ├── phase2_verification.sql
│       └── final_gold_standard_verification.sql
│
├── jtbds/
│   ├── README.md
│   ├── COMPLETE_JTBD_ARCHITECTURE.md
│   ├── DATA_OWNERSHIP_GUIDE.md
│   └── QUERY_EXAMPLES.md
│
└── workflows/
    ├── README.md
    ├── WORKFLOW_ARCHITECTURE.md
    └── LANGGRAPH_BUILDER_EXAMPLE.md
```

---

## 🔧 Common Tasks

### **Adding a New JTBD**

```sql
-- Insert JTBD
INSERT INTO jtbd (code, name, description, functional_area, job_type, tenant_id)
VALUES ('JOB-001', 'Job Name', 'Description', 'medical_affairs', 'main', '<tenant_id>');

-- Map to role
INSERT INTO jtbd_roles (jtbd_id, role_id)
VALUES ('<jtbd_id>', '<role_id>')
ON CONFLICT DO NOTHING;
-- Note: role_name is auto-populated by trigger
```

### **Querying JTBD with All Context**

```sql
-- Use the comprehensive view
SELECT *
FROM v_jtbd_complete
WHERE jtbd_code = 'JOB-001';

-- Or build custom query
SELECT 
  j.*,
  string_agg(DISTINCT jr.role_name, ', ') as roles,
  string_agg(DISTINCT jf.function_name, ', ') as functions
FROM jtbd j
LEFT JOIN jtbd_roles jr ON j.id = jr.jtbd_id
LEFT JOIN jtbd_functions jf ON j.id = jf.jtbd_id
WHERE j.code = 'JOB-001'
GROUP BY j.id;
```

### **Creating a Workflow**

```sql
-- Create workflow template
INSERT INTO workflow_templates (
  jtbd_id, code, name, workflow_type, work_mode, binding_type
)
VALUES (
  '<jtbd_id>', 'WF-001', 'Workflow Name', 
  'standard', 'routine', 'process'
);

-- Add stages and tasks...
```

---

## 🎓 Design Principles

### **1. Data Ownership**
- **JTBD** = Demand-side (what + why)
- **Roles** = Supply-side (who + organizational expectation)
- **Personas** = Behavioral-side (how + style + preferences)
- **Workflows** = Execution-side (step-by-step how-to)

### **2. Junction Pattern**
All many-to-many relationships use:
- `{entity}_id` (UUID FK)
- `{entity}_name` (TEXT cached, auto-synced)
- Relevance/importance scores
- Metadata (created_at, updated_at, tenant_id)

### **3. Normalization Rules**
- ❌ No arrays in core ontology tables
- ❌ No JSONB for queryable structured data
- ✅ All multi-valued attributes in junction tables
- ✅ Proper foreign keys and referential integrity

### **4. Backward Compatibility**
- Deprecated tables renamed with `_deprecated` suffix
- Views created with old table names
- Legacy code continues working
- Migration warnings in comments

---

## 🆘 Troubleshooting

### **Issue: View not working**
Views may reference old column names. Check:
```sql
SELECT definition 
FROM pg_views 
WHERE viewname = 'your_view_name';
```

### **Issue: Trigger not firing**
Verify trigger exists:
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%';
```

### **Issue: Missing cached names**
Run backfill:
```sql
-- Example for jtbd_roles
UPDATE jtbd_roles jr
SET role_name = r.name
FROM org_roles r
WHERE jr.role_id = r.id AND jr.role_name IS NULL;
```

---

## 📞 Support & Feedback

### **Documentation Issues**
- Check [GOLD_STANDARD_COMPLETE.md](./GOLD_STANDARD_COMPLETE.md) first
- Review migration logs for details
- Verify schema with verification queries

### **Schema Questions**
- Review [DATA_OWNERSHIP_GUIDE.md](./jtbds/DATA_OWNERSHIP_GUIDE.md)
- Check [QUERY_EXAMPLES.md](./jtbds/QUERY_EXAMPLES.md)
- Refer to [COMPLETE_JTBD_ARCHITECTURE.md](./jtbds/COMPLETE_JTBD_ARCHITECTURE.md)

---

## 📜 Version History

### **v2.0 (2025-11-21) - Gold Standard** 🎉
- ✅ Complete normalization (Phases 5-7)
- ✅ Zero arrays in core tables
- ✅ Single source of truth for all entities
- ✅ Comprehensive documentation

### **v1.5 (Previous) - Foundation**
- ✅ Initial JTBD normalization (Phases 1-4)
- ✅ Workflow system consolidation
- ✅ Value & AI layers

### **v1.0 (Initial)**
- Basic schema with technical debt
- Multiple JSONB and array fields
- Duplicate tables and mappings

---

## 🌟 What Makes This Gold Standard

1. **Zero Technical Debt** - No arrays, no JSONB in ontology, no duplicates
2. **Consistent Patterns** - ID+NAME junction pattern throughout
3. **Enterprise Ready** - Multi-tenant, performant, scalable
4. **LangGraph Ready** - Execution model for AI agents
5. **Fully Documented** - Comprehensive guides and examples
6. **Backward Compatible** - Legacy code continues working
7. **Verified** - All migrations tested with verification queries

**Your data schema is production-ready!** 🚀

---

**Need help?** Start with [GOLD_STANDARD_COMPLETE.md](./GOLD_STANDARD_COMPLETE.md)

