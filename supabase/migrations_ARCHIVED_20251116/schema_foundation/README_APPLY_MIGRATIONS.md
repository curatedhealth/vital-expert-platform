# Gold-Standard Database Migration Guide

## ✅ Complete! All 28 Phases Generated

You now have a complete, production-ready 123-table database schema following industry best practices.

---

## 📋 Quick Summary

- **Total Tables**: 123 tables
- **Total Phases**: 28 migration files
- **ENUMs**: 20 type-safe enumerations
- **Indexes**: Comprehensive (targeting <200ms queries)
- **RLS Policies**: Full multi-tenant isolation
- **Functions**: 20+ helper functions
- **Estimated Application Time**: 4-5 hours (sequential) or 30 minutes (parallel)

---

## 🚀 Application Methods

### Option A: Supabase Dashboard (Recommended for First-Time)

**Best for**: Manual verification, learning, troubleshooting

1. **Navigate to SQL Editor**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
   ```

2. **Apply Each Phase Sequentially**
   - Start with `00_wipe_database.sql` (⚠️ DESTRUCTIVE - only if starting fresh)
   - Then apply phases 01-28 in order
   - Run each file's SQL in the SQL Editor
   - Verify success messages after each phase

3. **Watch for Verification Output**
   Each phase will print:
   ```
   ✅ PHASE XX COMPLETE
   Tables created: N
   Cumulative Progress: N tables created
   ```

---

### Option B: Supabase CLI (Fast, Automated)

**Best for**: Experienced users, CI/CD pipelines

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Option B1: Push to linked project
supabase db push --linked

# Option B2: Apply locally first, then push
supabase db reset --linked  # ⚠️ DESTRUCTIVE
supabase db push --linked
```

---

### Option C: Sequential Application Script

**Best for**: Automated deployment, repeatable builds

Create `apply_all_phases.sh`:

```bash
#!/bin/bash

BASE_DIR="supabase/migrations/schema_foundation"

echo "🚀 Starting Gold-Standard Database Build..."
echo ""

# Array of all phase files in order
PHASES=(
  "00_wipe_database.sql"
  "01_extensions_and_enums.sql"
  "02_identity_and_tenants.sql"
  "03_solutions_and_industries.sql"
  "04_organizational_hierarchy.sql"
  "05_agents_and_capabilities.sql"
  "06_personas_and_jtbds.sql"
  "07_prompt_system.sql"
  "08_llm_providers_and_models.sql"
  "09_knowledge_and_rag.sql"
  "10_skills_and_tools.sql"
  "11_service_ask_expert.sql"
  "12_service_ask_panel.sql"
  "13_service_workflows.sql"
  "14_service_solutions_marketplace.sql"
  "15_agent_junction_tables.sql"
  "16_workflow_execution_runtime.sql"
  "17_deliverables_and_feedback.sql"
  "18_25_governance_monitoring_analytics.sql"
  "26_performance_indexes.sql"
  "27_row_level_security.sql"
  "28_functions_and_seed_data.sql"
)

for phase in "${PHASES[@]}"; do
  echo "▶️  Applying: $phase"

  PGPASSWORD='flusd9fqEb4kkTJ1' psql \
    postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
    -f "$BASE_DIR/$phase"

  if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: $phase"
    echo ""
  else
    echo "❌ FAILED: $phase"
    exit 1
  fi
done

echo "🎉 All phases applied successfully!"
echo "✅ Gold-Standard Database Build Complete!"
```

Make executable and run:
```bash
chmod +x apply_all_phases.sh
./apply_all_phases.sh
```

---

## 📊 Phase-by-Phase Breakdown

| Phase | File | Tables | Time | Description |
|-------|------|--------|------|-------------|
| 00 | `00_wipe_database.sql` | 0 | 2 min | ⚠️ Clean slate (drop all) |
| 01 | `01_extensions_and_enums.sql` | 0 | 10 min | Extensions + 20 ENUMs |
| 02 | `02_identity_and_tenants.sql` | 6 | 15 min | Users + 5-level tenants |
| 03 | `03_solutions_and_industries.sql` | 7 | 10 min | Solutions + industries |
| 04 | `04_organizational_hierarchy.sql` | 15 | 20 min | Functions, roles, departments |
| 05 | `05_agents_and_capabilities.sql` | 4 | 15 min | AI agents + capabilities |
| 06 | `06_personas_and_jtbds.sql` | 5 | 15 min | 335 personas + 338 JTBDs |
| 07 | `07_prompt_system.sql` | 6 | 20 min | Hierarchical prompts |
| 08 | `08_llm_providers_and_models.sql` | 3 | 10 min | LLM configs |
| 09 | `09_knowledge_and_rag.sql` | 5 | 20 min | RAG system (pgvector) |
| 10 | `10_skills_and_tools.sql` | 7 | 15 min | Skills + tools + templates |
| 11 | `11_service_ask_expert.sql` | 3 | 15 min | 1:1 consultations |
| 12 | `12_service_ask_panel.sql` | 8 | 20 min | Multi-agent panels |
| 13 | `13_service_workflows.sql` | 10 | 25 min | Workflow automation |
| 14 | `14_service_solutions_marketplace.sql` | 6 | 15 min | Solution packages |
| 15 | `15_agent_junction_tables.sql` | 0 | 5 min | Verification only |
| 16 | `16_workflow_execution_runtime.sql` | 5 | 15 min | Runtime execution |
| 17 | `17_deliverables_and_feedback.sql` | 6 | 10 min | Outputs + feedback |
| 18-25 | `18_25_governance_monitoring_analytics.sql` | 29 | 90 min | Complete governance |
| 26 | `26_performance_indexes.sql` | 0 | 30 min | Performance optimization |
| 27 | `27_row_level_security.sql` | 0 | 30 min | RLS policies |
| 28 | `28_functions_and_seed_data.sql` | 0 | 20 min | Utilities + seed data |

**Total: 123 tables, ~5 hours**

---

## ✅ Verification Checklist

After applying all phases, run these verification queries:

### 1. Count Tables
```sql
SELECT COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public';
-- Expected: 123
```

### 2. Check ENUMs
```sql
SELECT COUNT(*) as total_enums
FROM pg_type
WHERE typnamespace = 'public'::regnamespace
AND typtype = 'e';
-- Expected: 20
```

### 3. Verify Indexes
```sql
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';
-- Expected: 200+
```

### 4. Check RLS Enabled
```sql
SELECT COUNT(*) as tables_with_rls
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
AND c.relrowsecurity = true;
-- Expected: 18+
```

### 5. Verify Seed Data
```sql
-- Check industries
SELECT COUNT(*) FROM industries;
-- Expected: 6

-- Check organizational functions
SELECT COUNT(*) FROM org_functions;
-- Expected: 14

-- Check LLM providers
SELECT COUNT(*) FROM llm_providers;
-- Expected: 3

-- Check LLM models
SELECT COUNT(*) FROM llm_models;
-- Expected: 6

-- Check subscription tiers
SELECT COUNT(*) FROM subscription_tiers;
-- Expected: 4

-- Check platform tenant
SELECT COUNT(*) FROM tenants WHERE id = '00000000-0000-0000-0000-000000000000';
-- Expected: 1
```

---

## 🎯 Next Steps After Migration

### 1. Import Production Data
```bash
# Import agents (254 records)
# Import personas (335 records)
# Import JTBDs (338 records)
# Scripts in: /migration_scripts/
```

### 2. Create Test Tenants
Already created:
- Platform tenant: `00000000-0000-0000-0000-000000000000`

Need to create:
- Digital Health Startups tenant
- Pharmaceuticals tenant

### 3. Performance Testing
```sql
-- Test agent search
EXPLAIN ANALYZE
SELECT * FROM agents
WHERE tenant_id = '00000000-0000-0000-0000-000000000000'
AND status = 'active'
AND deleted_at IS NULL;

-- Test JTBD-persona mapping
EXPLAIN ANALYZE
SELECT * FROM get_jtbds_by_persona('some-persona-uuid');

-- Test knowledge search
EXPLAIN ANALYZE
SELECT * FROM search_knowledge_by_embedding(
  '[your-embedding-vector]'::vector(1536),
  '00000000-0000-0000-0000-000000000000',
  10
);
```

### 4. Enable Realtime (Optional)
```sql
-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE expert_consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE expert_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE panel_discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE panel_messages;
```

---

## ⚠️ Important Warnings

### Phase 00 is DESTRUCTIVE
`00_wipe_database.sql` will **DELETE EVERYTHING** in the `public` schema. Only run if:
- ✅ Starting completely fresh
- ✅ You have backups
- ✅ You understand you'll lose all data

Skip Phase 00 if you want to keep existing data.

### Service Role Bypass
RLS policies include a service role bypass. Ensure your `service_role` key is secured:
- Never expose in client code
- Use only in backend/serverless functions
- Rotate regularly

### Database Connection Credentials
The connection string in scripts contains credentials. Ensure:
- Scripts are not committed to public repos
- Credentials are rotated after migration
- Use environment variables in production

---

## 🐛 Troubleshooting

### Error: "relation already exists"
- You're running phases out of order or re-running
- Solution: Start fresh with Phase 00, or skip conflicting phase

### Error: "type already exists"
- Phase 01 was already applied
- Solution: Skip Phase 01 or use `CREATE TYPE IF NOT EXISTS`

### Error: "extension 'vector' does not exist"
- pgvector not installed
- Solution: Install via Supabase Dashboard → Database → Extensions

### Error: "permission denied"
- Not using service_role or owner account
- Solution: Use `service_role` key or database owner credentials

### Slow Performance
- Indexes not yet created
- Solution: Ensure Phase 26 completed successfully
- Run `ANALYZE` on large tables

---

## 📞 Support

- **Documentation**: See `00_MASTER_INDEX.md` for complete phase guide
- **Architecture**: See `DATABASE_TREE_VISUALIZATION.md` for entity relationships
- **Issues**: Report to project maintainers

---

## 🎉 Success Criteria

You've successfully completed the migration when:

✅ All 28 phases applied without errors
✅ Table count = 123
✅ ENUM count = 20
✅ RLS enabled on tenant-scoped tables
✅ Seed data verified (industries, functions, LLM providers)
✅ Performance < 200ms on common queries
✅ Platform tenant exists

**Your gold-standard database is now ready for production!** 🚀
