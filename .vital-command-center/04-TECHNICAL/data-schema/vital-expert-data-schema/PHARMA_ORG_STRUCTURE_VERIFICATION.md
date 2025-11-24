# Pharmaceuticals Tenant Org-Structure Verification

## Overview

This document describes the verification and normalization process for the Pharmaceuticals tenant's organizational structure data (business functions, departments, and roles).

## Tenant Information

- **Tenant ID**: `c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b`
- **Tenant Key**: `pharma` or `pharmaceuticals`
- **Tenant Type**: `pharmaceuticals`

## Schema Structure

The org-structure consists of three main tables:

1. **org_functions** - Business functions (top level)
   - `id` (UUID, PK)
   - `unique_id` (VARCHAR(50), UNIQUE, NOT NULL)
   - `department_name` (VARCHAR(255), NOT NULL) - This is the function name
   - `description` (TEXT)
   - `tenant_id` (UUID, FK → tenants(id) or organizations(id))
   - `created_at`, `updated_at`, `created_by`, `updated_by`

2. **org_departments** - Departments within functions
   - `id` (UUID, PK)
   - `unique_id` (VARCHAR(50), UNIQUE)
   - `department_name` (VARCHAR(255), NOT NULL)
   - `function_id` (UUID, FK → org_functions(id))
   - `tenant_id` (UUID, FK → tenants(id) or organizations(id))
   - `created_at`, `updated_at`, `created_by`, `updated_by`

3. **org_roles** - Roles within departments
   - `id` (UUID, PK)
   - `unique_id` (VARCHAR(50), UNIQUE, NOT NULL)
   - `role_name` (VARCHAR(255), NOT NULL)
   - `function_id` (UUID, FK → org_functions(id))
   - `department_id` (UUID, FK → org_departments(id))
   - `tenant_id` (UUID, FK → tenants(id) or organizations(id))
   - `created_at`, `updated_at`, `created_by`, `updated_by`

## Normalization Rules

### 1. Uniqueness Constraints
- **Functions**: `unique_id` must be unique globally
- **Departments**: `unique_id` should be unique (if provided)
- **Roles**: `unique_id` must be unique globally
- **Within Tenant**: Function names, department names, and role names should be unique per tenant

### 2. Foreign Key Integrity
- All `function_id` in `org_departments` must reference `org_functions` within the same tenant
- All `function_id` and `department_id` in `org_roles` must reference records within the same tenant
- No cross-tenant relationships allowed

### 3. Required Fields
- Functions: `unique_id`, `department_name`, `tenant_id`
- Departments: `department_name`, `function_id`, `tenant_id`
- Roles: `unique_id`, `role_name`, `function_id`, `department_id`, `tenant_id`

## Verification Script

Run `verify_pharma_org_structure.sql` to check:

1. ✅ Tenant exists and is active
2. ✅ Schema structure (tenant_id columns exist)
3. ✅ Data counts by tenant
4. ✅ Pharmaceuticals-specific data exists
5. ✅ Duplicate detection (names and unique_ids)
6. ✅ Orphaned records (departments/roles without valid parents)
7. ✅ Cross-tenant relationship detection
8. ✅ Missing required fields
9. ✅ Hierarchy structure completeness

## Fix Script

If issues are found, run `fix_pharma_org_structure_normalization.sql` to:

1. Remove orphaned departments and roles
2. Fix cross-tenant relationships
3. Remove duplicate records (keeping first occurrence)
4. Fill missing required fields with defaults
5. Verify fixes applied

## Expected Data Structure

Based on the seed file `database/sql/seeds/01_pharma_organization.sql`, the Pharmaceuticals tenant should have:

### Functions (10 expected):
- Research & Development
- Regulatory Affairs
- Manufacturing & Operations
- Quality Assurance & Compliance
- Commercial
- Medical Affairs
- Pharmacovigilance & Safety
- Supply Chain & Logistics
- Business Development & Licensing
- Finance & Administration

### Departments (20+ expected):
- Under R&D: Drug Discovery, Preclinical Development, Clinical Development, Biostatistics & Data Management, CMC
- Under Regulatory: Regulatory Strategy, Regulatory Submissions, Regulatory Intelligence
- Under Manufacturing: Drug Substance Manufacturing, Drug Product Manufacturing, Process Development
- Under Quality: Quality Control, Quality Assurance & Compliance, Validation & Qualification
- Under Commercial: Sales & Account Management, Marketing & Brand Management, Market Access & HEOR
- Under Medical Affairs: Medical Science Liaisons, Medical Information, Medical Publications
- Under Pharmacovigilance: Drug Safety & Risk Management, Pharmacovigilance Operations, Signal Detection & Epidemiology

### Roles (30+ expected):
- Executive roles: CSO, VP R&D, VP Regulatory, VP Operations, CCO, CMO, VP PV
- Senior roles: Directors for each function
- Mid-level roles: Managers and Specialists
- Junior roles: Analysts and Coordinators

## Running the Verification

1. **First, run the verification script**:
   ```sql
   \i verify_pharma_org_structure.sql
   ```

2. **Review the output** for any issues:
   - Check for duplicates
   - Check for orphaned records
   - Check for cross-tenant links
   - Check for missing data

3. **If issues are found, run the fix script**:
   ```sql
   \i fix_pharma_org_structure_normalization.sql
   ```

4. **Re-run verification** to confirm all issues are resolved

## Notes

- The schema may reference either `tenants(id)` or `organizations(id)` depending on the migration version
- The verification script checks for both possibilities
- The fix script assumes `tenant_id` is a UUID that should match within the same tenant
- Always backup your database before running fix scripts

