# Digital Health Org Structure Setup Instructions

## Current Status
- ✅ Tenant exists: `684f6c2c-b50d-4726-ad92-c76c3b785a89`
- ❌ Functions: 0
- ❌ Departments: 0  
- ❌ Roles: 0

## ⚠️ IMPORTANT: Enum Type Issue

The `org_functions.name` column uses an enum type `functional_area_type` that doesn't include Digital Health function names. You need to add them first.

## Setup Steps

### Step 1: Add Enum Values (REQUIRED)

**Run this FIRST to add Digital Health enum values:**
```sql
\i setup_digital_health_enum_values.sql
```

This adds 9 new enum values to `functional_area_type`:
- Digital Health Strategy & Innovation
- Digital Platforms & Solutions
- Data Science & Analytics
- Digital Clinical Development
- Patient & Provider Experience
- Regulatory, Quality & Compliance
- Commercialization & Market Access
- Technology & IT Infrastructure
- Legal & IP for Digital

**Note:** If you get errors about enum values already existing, that's okay - they're already added.

### Step 2: Populate Functions and Departments

**After Step 1 completes, run:**
```sql
\i complete_digital_health_setup_fixed.sql
```

This creates:
- 9 Functions
- 40 Departments

### Step 2: Populate Roles from JSON

After functions and departments are created, run:
```sql
\i populate_digital_health_roles_from_json.sql
```

This will create 159 roles (53 unique role names × 3 scopes each: Global, Regional, Local) based on the JSON file.

### Step 3: Verify

Run the diagnostic script to verify everything:
```sql
\i diagnose_and_setup_digital_health.sql
```

Or run a simple count:
```sql
SELECT 
    'org_functions' as table_name,
    COUNT(*) as count
FROM org_functions
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 
    'org_departments',
    COUNT(*)
FROM org_departments
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89'
UNION ALL
SELECT 
    'org_roles',
    COUNT(*)
FROM org_roles
WHERE tenant_id = '684f6c2c-b50d-4726-ad92-c76c3b785a89';
```

Expected results:
- Functions: 9
- Departments: 40
- Roles: 159

## Files Created

1. **complete_digital_health_setup.sql** - Creates functions and departments (no enum dependency)
2. **populate_digital_health_roles_from_json.sql** - Creates roles from JSON data with scope information
3. **diagnose_and_setup_digital_health.sql** - Diagnostic script to check current state
4. **check_digital_health_org_structure.sql** - Detailed query script for verification

## Troubleshooting

### If you get "column does not exist" errors:
The schema might use different column names. Check your actual schema:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'org_functions' 
ORDER BY ordinal_position;
```

### If functions/departments already exist:
The scripts use `ON CONFLICT` clauses, so they're safe to run multiple times. They will update existing records.

### If roles script fails:
Make sure functions and departments are created first, as roles depend on them via foreign keys.

