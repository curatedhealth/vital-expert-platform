# Persona to Role Mapping

## Overview
This document describes the process of mapping personas to their corresponding roles, functions, and departments based on the `BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json` file.

## Source Data
- **JSON File**: `/Users/hichamnaim/Downloads/BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json`
- **Total Personas**: 20 personas across 4 business functions:
  - Medical Affairs (8 personas)
  - Market Access (4 personas)
  - Commercial Organization (4 personas)
  - Regulatory Affairs (4 personas)

## Mapping Logic

### Persona Identification
Personas are identified by:
1. **Primary**: `persona_id` (used as `slug` in database)
2. **Fallback**: `name` (full persona name)

### Role Matching
Roles are matched by:
1. Exact match on role name (case-insensitive)
2. Partial match on role name (case-insensitive)
3. Handles both `name` and `role_name` columns in `org_roles` table

### Function and Department Assignment
Once a role is found:
- `function_id` and `department_id` are automatically extracted from the role's existing mappings
- This ensures consistency with the role's organizational structure

## Generated Scripts

### 1. `map_personas_to_roles.js`
Node.js script that:
- Parses the JSON file
- Extracts persona-to-role mappings
- Generates SQL update statements

### 2. `map_personas_to_roles_generated.sql`
Generated SQL script that:
- Maps all 20 personas to their roles
- Updates `role_id`, `function_id`, and `department_id` in the `personas` table
- Includes error handling and progress reporting
- Uses dynamic column detection for schema compatibility

## Execution Steps

1. **Review the generated SQL**:
   ```bash
   cat .claude/vital-expert-docs/10-knowledge-assets/org_structure/map_personas_to_roles_generated.sql
   ```

2. **Run in Supabase SQL Editor**:
   - Copy the contents of `map_personas_to_roles_generated.sql`
   - Paste into Supabase SQL Editor
   - Execute

3. **Verify Results**:
   ```sql
   SELECT 
       p.name as persona_name,
       r.name as role_name,
       f.name as function_name,
       d.name as department_name
   FROM personas p
   LEFT JOIN org_roles r ON p.role_id = r.id
   LEFT JOIN org_functions f ON p.function_id = f.id
   LEFT JOIN org_departments d ON p.department_id = d.id
   WHERE p.role_id IS NOT NULL
   ORDER BY f.name, d.name, r.name;
   ```

## Expected Results

After execution:
- ✅ 20 personas should have `role_id` populated
- ✅ 20 personas should have `function_id` populated
- ✅ 20 personas should have `department_id` populated
- ✅ All mappings should align with the JSON structure

## Personas Mapped

### Medical Affairs (8 personas)
- Medical Science Liaison Persona 1-4 (Field Medical)
- HEOR Director Persona 1-4 (HEOR & Evidence)

### Market Access (4 personas)
- VP Market Access Persona 1-4 (Leadership & Strategy)

### Commercial Organization (4 personas)
- Commercial Lead Persona 1-4 (Commercial Ops)

### Regulatory Affairs (4 personas)
- Chief Regulatory Officer Persona 1-4 (Regulatory Strategy)

## Troubleshooting

### Personas Not Found
If personas are not found in the database:
- Check if personas exist with matching `slug` or `name`
- Verify the `persona_id` in JSON matches the `slug` in database
- Check for typos or naming differences

### Roles Not Found
If roles are not found:
- Verify role names in JSON match role names in `org_roles` table
- Check if roles are mapped to the Pharmaceuticals tenant
- Review role name variations (e.g., "Medical Science Liaison" vs "MSL")

### Schema Issues
If column errors occur:
- Verify `personas` table has `name`, `slug`, `role_id`, `function_id`, `department_id` columns
- Check `org_roles` table has `name` or `role_name` column
- Ensure all foreign key relationships are valid

## Notes

- The script is idempotent - safe to run multiple times
- Updates only occur if personas and roles are found
- Progress is logged via `RAISE NOTICE` statements
- The script uses transactions for data integrity

