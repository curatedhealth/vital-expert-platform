# 🚀 Apply PRISM™ Migrations to Your Supabase Database

## ✅ Issue Fixed: Display Name Column

The database error you encountered has been **resolved**! The migrations now correctly include the required `display_name` column for all prompt insertions.

## 📋 How to Apply Migrations

### **Option 1: Supabase Dashboard (Recommended)**

1. **Open your Supabase Dashboard**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `xazinxsiglqokwfmogyk`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Apply Migrations in Order**

   **Step 1: Schema Enhancement**
   ```sql
   -- Copy and paste the entire content of:
   -- database/sql/migrations/2025/20250920100000_enhance_prompts_schema_prism.sql
   ```

   **Step 2: Reference Data**
   ```sql
   -- Copy and paste the entire content of:
   -- database/sql/migrations/2025/20250920110000_populate_prism_reference_data.sql
   ```

   **Step 3: Sample Prompts**
   ```sql
   -- Copy and paste the entire content of:
   -- database/sql/migrations/2025/20250920120000_import_prism_prompts.sql
   ```

   **Step 4: Validation**
   ```sql
   -- Copy and paste the entire content of:
   -- database/sql/migrations/2025/20250920130000_validate_prism_data_integrity.sql
   ```

4. **Execute Each Migration**
   - Run each migration **one at a time**
   - Wait for completion before proceeding to the next
   - Check for any error messages

### **Option 2: Using Supabase CLI (Advanced)**

**Note**: The Supabase CLI installation has changed. For the most reliable experience, **use Option 1 (Dashboard)**.

If you want to use the CLI, install it via your platform's package manager:

**macOS (Homebrew)**:
```bash
brew install supabase/tap/supabase
```

**Other platforms**: See [official installation guide](https://github.com/supabase/cli#install-the-cli)

Once installed:
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xazinxsiglqokwfmogyk

# Apply migrations via SQL editor or manual execution
```

## ✅ Verification Steps

After applying all migrations, verify success:

### **Check Table Creation**
```sql
SELECT
  COUNT(*) as total_tables,
  STRING_AGG(table_name, ', ') as table_list
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'prompt%';
```
*Expected: 9 tables total*

### **Check Reference Data**
```sql
SELECT
  (SELECT COUNT(*) FROM prompt_systems) as systems,
  (SELECT COUNT(*) FROM prompt_domains) as domains,
  (SELECT COUNT(*) FROM complexity_levels) as levels,
  (SELECT COUNT(*) FROM prompt_categories) as categories;
```
*Expected: systems=3, domains=7, levels=5, categories=35+*

### **Check Sample Prompts**
```sql
SELECT
  p.display_name,
  ps.display_name as system,
  pd.display_name as domain
FROM prompts p
JOIN prompt_systems ps ON p.prompt_system_id = ps.id
JOIN prompt_domains pd ON p.domain_id = pd.id
WHERE p.prompt_system_id IS NOT NULL;
```
*Expected: 8 sample prompts across different systems*

### **Run Final Validation**
The validation migration (step 4) will output a comprehensive report. Look for:
```
✅ All PRISM™ tables exist successfully
✅ Reference data validation passed
✅ PRISM™ prompts validation passed
✅ All foreign key relationships are valid
✅ Data type validation passed
🎉 PRISM™ Enterprise Healthcare Prompt Library validation completed successfully!
```

## 🛠️ Troubleshooting

### **Common Issues:**

1. **"Table already exists" warnings**
   - ✅ **Normal** - Migrations use `IF NOT EXISTS` clauses
   - Continue with next migration

2. **Foreign key constraint errors**
   - ❌ **Issue** - Migrations not applied in order
   - Solution: Apply migrations in the exact order specified

3. **"null value in column" errors**
   - ✅ **Fixed** - The display_name issue has been resolved
   - All prompts now include proper display names

4. **Permission denied**
   - ❌ **Issue** - Insufficient database permissions
   - Solution: Ensure you're logged in as project owner/admin

### **Recovery Steps:**

If a migration fails partially:
```sql
-- Check which tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'prompt%';

-- If needed, drop incomplete tables and retry
-- (BE CAREFUL - only if migration failed completely)
-- DROP TABLE IF EXISTS prompt_variables CASCADE;
```

## 🎉 Success Indicators

When all migrations are complete, you should see:

✅ **9 Prompt Tables** (1 enhanced + 8 new)
✅ **3 Prompt Systems** (PRISM™, VITAL Path, Digital Health)
✅ **7 Healthcare Domains** with full categorization
✅ **8 Sample Prompts** ready to use
✅ **35+ Categories** across all domains
✅ **Comprehensive Analytics** and relationship tracking

## 🚀 Next Steps

Once migrations are applied:

1. **Explore the new schema** in your Supabase Table Editor
2. **Test prompt queries** using the sample prompts
3. **Integrate with your application** using the new PRISM™ fields
4. **Add more prompts** using the established framework

Your VITAL Path platform now has a **production-ready enterprise healthcare prompt library**! 🎉

---

**Need Help?**
- Check the detailed README in `database/sql/migrations/2025/README_PRISM_MIGRATIONS.md`
- Review the implementation summary in `PRISM_IMPLEMENTATION_SUMMARY.md`