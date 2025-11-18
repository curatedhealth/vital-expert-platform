# Which File Should I Use?

## ✅ USE THIS: Fully Normalized (NO JSONB)

### Files:
1. **Migration**: `supabase/migrations/2025/20251115230000_create_normalized_role_tables.sql`
2. **Seed File**: `market_access_roles_part1_normalized.sql` ⬅️ **USE THIS ONE**
3. **Documentation**: `README_NORMALIZED.md`

### Characteristics:
- ✅ Zero JSONB columns
- ✅ 18 separate normalized tables
- ✅ Proper foreign keys
- ✅ Fully indexed
- ✅ Easy to query with JOINs

### Example from normalized file:
```sql
-- No JSONB! Each item in separate table
INSERT INTO role_therapeutic_areas (role_id, ta_code, is_primary, expertise_level)
VALUES (v_role_id, 'ONCO', true, 'expert');

INSERT INTO role_company_sizes (role_id, size_code, is_typical)
VALUES (v_role_id, 'LARGE', true);

INSERT INTO role_technology_platforms (role_id, platform_name, usage_level)
VALUES (v_role_id, 'Excel', 'intermediate');
```

---

## ❌ DON'T USE: Old Version (WITH JSONB)

### Files:
1. **Seed File**: `market_access_roles_part1.sql` ⬅️ **DON'T USE - HAS JSONB**
2. **Generator**: `scripts/generate_market_access_roles_seed.py` ⬅️ **DON'T USE**

### Characteristics:
- ❌ Uses JSONB columns
- ❌ Arrays stored as JSON text
- ❌ Harder to query
- ❌ No foreign key validation

### Example from old file (DON'T USE):
```sql
-- Has JSONB - this is the OLD way
therapeutic_areas,
'[{"ta_code": "ONCO", "is_primary": true, "expertise_level": "expert"}]'::jsonb,

company_sizes,
'[{"size_code": "LARGE", "is_typical": true}]'::jsonb,

technology_platforms,
'[{"platform_name": "Excel", "usage_level": "intermediate"}]'::jsonb,
```

---

## Quick Reference

| Feature | Normalized ✅ | Old (JSONB) ❌ |
|---------|--------------|---------------|
| JSONB columns | 0 | Many |
| Separate tables | 18 | 0 |
| Foreign keys | Yes | No |
| Easy queries | Yes | No |
| File to use | `market_access_roles_part1_normalized.sql` | `market_access_roles_part1.sql` |

---

## Installation Command

Use the **normalized** version:

```bash
# Step 1: Create normalized tables (18 tables)
psql "connection_string" \
  -f supabase/migrations/2025/20251115230000_create_normalized_role_tables.sql

# Step 2: Load normalized data (NO JSONB!)
psql "connection_string" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql
```

---

## File List Summary

### ✅ Normalized Files (USE THESE):
```
supabase/migrations/2025/20251115230000_create_normalized_role_tables.sql
database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1_normalized.sql
database/sql/seeds/2025/PRODUCTION_TEMPLATES/README_NORMALIZED.md
scripts/generate_market_access_roles_normalized.py
```

### ❌ Old Files (DON'T USE):
```
database/sql/seeds/2025/PRODUCTION_TEMPLATES/market_access_roles_part1.sql (HAS JSONB)
scripts/generate_market_access_roles_seed.py (GENERATES JSONB)
```

---

## How to Verify You're Using the Right File

Check the file header:

```bash
head -10 market_access_roles_part1_normalized.sql
```

Should show:
```sql
-- MARKET ACCESS ROLES - PART 1 (FULLY NORMALIZED)
-- NOTE: Fully normalized - no JSONB, all data in separate tables
```

Check for JSONB:
```bash
grep "::jsonb" market_access_roles_part1_normalized.sql
# Should return: (empty - no results)
```

---

## Summary

**Always use the `_normalized` versions for a proper relational database design!**
