# PRISM™ Enterprise Healthcare Prompt Library Database Migrations

This directory contains the complete database migrations to implement the **PRISM™ Enterprise Healthcare Prompt Library** in your VITAL Path Digital Health Intelligence Platform.

## 🎯 Overview

The PRISM™ framework enhances your existing prompts table with a comprehensive enterprise healthcare prompt management system supporting:

- **3 Prompt Systems**: PRISM™ Acronym Prompts, VITAL Path AI Agents, Digital Health Structured Prompts
- **7 Healthcare Domains**: Medical Affairs, Compliance, Commercial, Marketing, Patient Advocacy, Data Analytics, Operations
- **5 Complexity Levels**: Quick Reference, Standard Analysis, Comprehensive Review, Expert Consultation, Strategic Planning
- **Advanced Features**: Variable substitution, prompt relationships, usage analytics, templates

## 📁 Migration Files

Apply these migrations **in order**:

### 1. `20250920100000_enhance_prompts_schema_prism.sql`
**Schema Enhancement**
- Creates 8 new tables for the PRISM™ framework
- Enhances existing `prompts` table with PRISM™-specific fields
- Adds comprehensive indexing and RLS policies
- **Tables Created**:
  - `prompt_systems` - Framework definitions
  - `prompt_domains` - Healthcare domains
  - `complexity_levels` - Complexity with time estimates
  - `prompt_categories` - Domain subcategories
  - `prompt_variables` - Dynamic placeholders
  - `prompt_relationships` - Dependencies and connections
  - `prompt_templates` - Reusable components
  - `prompt_usage_analytics` - Usage tracking

### 2. `20250920110000_populate_prism_reference_data.sql`
**Reference Data Population**
- Inserts 3 prompt systems
- Inserts 7 healthcare domains with icons and colors
- Inserts 5 complexity levels with time estimates
- Inserts 35+ categories across all domains
- Inserts 3 reusable prompt templates
- **Key Data**:
  - Medical Affairs, Compliance, Commercial domains
  - Marketing, Patient Advocacy, Data Analytics, Operations domains
  - Entry to Specialist complexity levels (5-480 minutes)

### 3. `20250920120000_import_prism_prompts.sql`
**Sample Prompts Import**
- Imports representative prompts from each system type
- Includes PRISM™ acronym prompts with framework structure
- Includes VITAL Path AI agents with specialized roles
- Includes Digital Health structured templates
- Adds prompt variables and relationships
- **Sample Prompts**:
  - Clinical Research Protocol Analysis (PRISM™)
  - Regulatory Submission Strategy (PRISM™)
  - Sales Performance Optimization Agent (VITAL Path)
  - Market Access Strategy Agent (VITAL Path)
  - Digital Health Content Marketing Strategy (Structured)
  - Patient Engagement Program Analysis (PRISM™)

### 4. `20250920130000_validate_prism_data_integrity.sql`
**Validation & Testing**
- Validates all tables exist and are properly structured
- Checks foreign key relationships and data integrity
- Validates JSON fields and array constraints
- Tests query performance
- Generates summary report
- **Validation Checks**:
  - Table existence and structure
  - Reference data completeness
  - Foreign key integrity
  - Data type validation
  - Index verification
  - RLS policy confirmation

## 🚀 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content **in order**
4. Execute each migration one at a time
5. Verify completion by running the validation queries

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or apply individual files
supabase db reset --linked
```

### Option 3: Direct SQL Execution
If you have direct database access:
```bash
psql -d your_database_url -f 20250920100000_enhance_prompts_schema_prism.sql
psql -d your_database_url -f 20250920110000_populate_prism_reference_data.sql
psql -d your_database_url -f 20250920120000_import_prism_prompts.sql
psql -d your_database_url -f 20250920130000_validate_prism_data_integrity.sql
```

## ✅ Verification Steps

After applying all migrations, verify success:

1. **Check Table Count**:
   ```sql
   SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'prompt%';
   -- Should return 9 tables (including original prompts table)
   ```

2. **Check Reference Data**:
   ```sql
   SELECT
     (SELECT COUNT(*) FROM prompt_systems) as systems,
     (SELECT COUNT(*) FROM prompt_domains) as domains,
     (SELECT COUNT(*) FROM complexity_levels) as levels,
     (SELECT COUNT(*) FROM prompt_categories) as categories;
   -- Should return: systems=3, domains=7, levels=5, categories=35+
   ```

3. **Check Sample Prompts**:
   ```sql
   SELECT p.name, ps.display_name as system, pd.display_name as domain
   FROM prompts p
   JOIN prompt_systems ps ON p.prompt_system_id = ps.id
   JOIN prompt_domains pd ON p.domain_id = pd.id
   WHERE p.prompt_system_id IS NOT NULL;
   -- Should return 6+ sample prompts
   ```

4. **Run Validation**:
   ```sql
   -- The validation script from migration 4 will output a comprehensive report
   ```

## 🔧 Post-Migration Configuration

### 1. Update Your Application Code
Update your application to use the new schema:
- Query prompts by system, domain, and complexity
- Use the new variable substitution system
- Implement usage analytics tracking
- Leverage prompt relationships and templates

### 2. Configure User Permissions
The migrations include RLS policies. Ensure your users have appropriate roles:
- **Admins**: Can manage all reference data
- **Users**: Can view active prompts and submit usage analytics
- **Authenticated**: Required for usage analytics

### 3. Performance Optimization
All necessary indexes are created, but monitor performance:
- GIN indexes for array and JSONB columns
- B-tree indexes for foreign keys and common queries
- Partial indexes for active records

## 📊 Database Schema Overview

```
prompts (enhanced)
├── prompt_system_id → prompt_systems.id
├── domain_id → prompt_domains.id
├── category_id → prompt_categories.id
├── complexity_level_id → complexity_levels.id
├── acronym (PRISM™ identifier)
├── framework_components (JSON)
├── target_users (array)
├── use_cases (array)
├── regulatory_requirements (array)
├── integration_points (JSON)
├── customization_guide (text)
└── quality_assurance (JSON)

prompt_categories
├── domain_id → prompt_domains.id
└── ...

prompt_variables
├── prompt_id → prompts.id
└── ...

prompt_relationships
├── parent_prompt_id → prompts.id
├── child_prompt_id → prompts.id
└── ...

prompt_usage_analytics
├── prompt_id → prompts.id
├── user_id → auth.users.id
└── ...
```

## 🆘 Troubleshooting

### Common Issues

1. **"Table already exists" errors**:
   - Normal if running migrations multiple times
   - Uses `IF NOT EXISTS` clauses to prevent errors

2. **Foreign key constraint errors**:
   - Ensure migrations are applied in order
   - Check that parent tables exist before child tables

3. **Permission denied errors**:
   - Ensure you're using the service role key for migrations
   - Database user needs CREATE, ALTER, INSERT permissions

4. **RLS policy conflicts**:
   - Temporarily disable RLS during migration if needed
   - Re-enable after completion

### Recovery Steps

If migrations fail partially:
```sql
-- Check which tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'prompt%';

-- Drop incomplete tables if needed (BE CAREFUL!)
-- DROP TABLE prompt_variables CASCADE;
-- Then rerun the appropriate migration
```

## 📚 Documentation

- **PRISM™ Framework**: See the original prompt library document
- **Variable Substitution**: Support for {simple}, {{double}}, and structured schemas
- **Complexity Levels**: Time estimates from 5 minutes to 8 hours
- **Healthcare Domains**: Comprehensive coverage of healthcare business functions

## 🎉 Success!

Once completed, you'll have a production-ready enterprise healthcare prompt library with:
- ✅ Comprehensive categorization and taxonomy
- ✅ Multiple prompt systems support
- ✅ Variable substitution and customization
- ✅ Usage analytics and performance tracking
- ✅ Relationship mapping and dependencies
- ✅ Security and compliance features
- ✅ Sample prompts ready to use

Your VITAL Path platform now supports the full PRISM™ Enterprise Healthcare Prompt Library! 🚀