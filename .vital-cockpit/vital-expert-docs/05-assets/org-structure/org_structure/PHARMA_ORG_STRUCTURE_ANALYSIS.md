# Pharmaceuticals Org-Structure Analysis

**Date**: 2025-11-20  
**Current Status**: Has data but needs consolidation and alignment

## Current State

- **28 Functions** (many duplicates with different slugs)
- **192 Departments**
- **928 Roles**

## Issues Identified

### 1. Duplicate Functions
Many functions appear twice with different slugs:
- **Commercial** (2 instances)
  - `commercial-pharma-a62b92df` (6 depts, 66 roles)
  - `commercial` (4 depts, 35 roles)
  
- **Medical Affairs** (2 instances)
  - `medical-affairs-pharma-236b447c` (11 depts, 46 roles)
  - `medical-affairs` (13 depts, 25 roles)
  
- **Market Access** (2 instances)
  - `market-access-pharma-c8a998aa` (14 depts, 57 roles)
  - `market-access` (9 depts, 26 roles)
  
- **Clinical** (2 instances)
- **Regulatory** (2 instances)
- **Research & Development** (2 instances)
- **Manufacturing** (2 instances)
- **Quality** (2 instances)
- **Operations** (2 instances)
- **IT/Digital** (2 instances)
- **Legal** (2 instances)
- **Finance** (2 instances)
- **HR** (2 instances)
- **Business Development** (2 instances)

### 2. Function Name Mismatches

Current names don't match the comprehensive list:

| Current Name | Required Name |
|-------------|---------------|
| Commercial | Commercial Organization |
| Regulatory | Regulatory Affairs |
| Research & Development | Research & Development (R&D) |
| Manufacturing | Manufacturing & Supply Chain |
| Finance | Finance & Accounting |
| HR | Human Resources |
| IT/Digital | Information Technology (IT) / Digital |
| Legal | Legal & Compliance |

### 3. Missing Functions

From the comprehensive list, these are missing:
- ✅ Medical Affairs (exists but needs consolidation)
- ✅ Market Access (exists but needs consolidation)
- ✅ Commercial Organization (exists as "Commercial" but needs renaming)
- ✅ Regulatory Affairs (exists as "Regulatory" but needs renaming)
- ✅ Research & Development (R&D) (exists but needs renaming)
- ✅ Manufacturing & Supply Chain (exists as "Manufacturing" but needs renaming)
- ✅ Finance & Accounting (exists as "Finance" but needs renaming)
- ✅ Human Resources (exists as "HR" but needs renaming)
- ✅ Information Technology (IT) / Digital (exists as "IT/Digital" but needs renaming)
- ✅ Legal & Compliance (exists as "Legal" but needs renaming)
- ❌ **Corporate Communications** (MISSING)
- ❌ **Strategic Planning / Corporate Development** (MISSING)
- ❌ **Business Intelligence / Analytics** (MISSING)
- ❌ **Procurement** (MISSING)
- ❌ **Facilities / Workplace Services** (MISSING)

## Recommendations

### Phase 1: Consolidate Duplicates
1. Identify which duplicate instance has more complete data (more departments/roles)
2. Merge departments and roles from duplicate into the primary instance
3. Delete duplicate function entries
4. Update all foreign key references

### Phase 2: Rename Functions
1. Update function names to match comprehensive list:
   - "Commercial" → "Commercial Organization"
   - "Regulatory" → "Regulatory Affairs"
   - "Research & Development" → "Research & Development (R&D)"
   - "Manufacturing" → "Manufacturing & Supply Chain"
   - "Finance" → "Finance & Accounting"
   - "HR" → "Human Resources"
   - "IT/Digital" → "Information Technology (IT) / Digital"
   - "Legal" → "Legal & Compliance"

### Phase 3: Add Missing Functions
1. Add the 5 missing functions:
   - Corporate Communications
   - Strategic Planning / Corporate Development
   - Business Intelligence / Analytics
   - Procurement
   - Facilities / Workplace Services

### Phase 4: Add Missing Departments
1. Run `check_and_add_pharma_functions_departments.sql` to add all missing departments from the comprehensive list

## Scripts Available

1. **`identify_duplicates_and_missing.sql`** - Identifies duplicates and missing functions
2. **`check_and_add_pharma_functions_departments.sql`** - Adds missing functions and departments
3. **`list_current_pharma_functions.sql`** - Lists all current functions
4. **`compare_pharma_org_structure.sql`** - Compares current vs required structure

## Next Steps

1. Run `identify_duplicates_and_missing.sql` to get detailed analysis
2. Decide on consolidation strategy for duplicates
3. Create consolidation script if needed
4. Run `check_and_add_pharma_functions_departments.sql` to add missing items

