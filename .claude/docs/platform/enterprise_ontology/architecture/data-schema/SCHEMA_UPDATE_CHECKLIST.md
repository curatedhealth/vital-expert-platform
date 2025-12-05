# Schema Update Checklist

**Created**: 2025-11-22
**Purpose**: Ensure all schema changes are properly documented and data is populated

---

## Checklist for Schema Updates

### ✅ Phase 1: Document Changes

- [ ] **Identify what changed**
  - List new tables
  - List modified columns
  - List new relationships
  - List removed/deprecated fields

- [ ] **Update GOLD_STANDARD_SCHEMA.md**
  - Add new table definitions
  - Update column descriptions
  - Document new relationships
  - Update ER diagrams

- [ ] **Update migration documentation**
  - Document migration purpose
  - Add rollback instructions
  - Note breaking changes

### ✅ Phase 2: Create Seed Templates

- [ ] **Create CSV/JSON templates for each new/modified table**
  - Include all required columns
  - Add example data rows
  - Document data types
  - Add validation rules

- [ ] **Create seed SQL files**
  - One file per domain (e.g., `seed_personas.sql`)
  - Include UPSERT logic (INSERT ... ON CONFLICT)
  - Add data validation
  - Include rollback/cleanup

### ✅ Phase 3: Validate Data Structure

- [ ] **Run schema validator**
  ```bash
  ./07-TOOLING/validators/validate-schema.sh
  ```

- [ ] **Check constraints**
  - Foreign keys exist
  - Required fields not null
  - Check constraints valid
  - Unique constraints appropriate

- [ ] **Check indexes**
  - tenant_id indexed
  - Foreign keys indexed
  - Frequently queried columns indexed

### ✅ Phase 4: Populate Data

- [ ] **Prepare source data**
  - Validate data format
  - Clean/transform data
  - Check for duplicates
  - Verify referential integrity

- [ ] **Run seed scripts**
  ```bash
  psql -f supabase/seeds/seed_[domain].sql
  ```

- [ ] **Verify population**
  ```sql
  SELECT COUNT(*) FROM [table_name];
  SELECT * FROM [table_name] LIMIT 5;
  ```

### ✅ Phase 5: Test & Validate

- [ ] **Test queries**
  - SELECT queries work
  - JOIN queries work
  - Aggregations work
  - Performance acceptable

- [ ] **Test application**
  - UI can read data
  - UI can write data
  - API endpoints work
  - No errors in logs

- [ ] **Run integration tests**
  ```bash
  npm test
  ```

### ✅ Phase 6: Update Documentation

- [ ] **Update API documentation**
  - New endpoints documented
  - Request/response schemas updated
  - Examples added

- [ ] **Update frontend documentation**
  - New components documented
  - State management updated
  - Props/types documented

- [ ] **Update README files**
  - Service READMEs updated
  - Platform assets documented
  - Cross-references updated

---

## Common Issues & Solutions

### Issue: Foreign Key Constraint Violations
**Solution**: Populate parent tables before child tables

### Issue: Duplicate Key Violations
**Solution**: Use UPSERT (INSERT ... ON CONFLICT)

### Issue: Null Constraint Violations
**Solution**: Ensure all required fields have values in seed data

### Issue: Performance Slow
**Solution**: Add indexes on frequently queried columns

---

## Quick Commands

### Check what tables exist
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### Check table schema
```sql
\d+ table_name
```

### Count rows in all tables
```sql
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Find tables without data
```sql
SELECT tablename, n_live_tup
FROM pg_stat_user_tables
WHERE n_live_tup = 0
ORDER BY tablename;
```

---

**Next Steps**: Tell me what changed and what data you need to populate!
