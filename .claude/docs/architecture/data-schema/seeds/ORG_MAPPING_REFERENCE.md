# Medical Affairs Organizational Structure Reference

This document provides the complete organizational structure for Medical Affairs to be used in agent seeding.

## Function
- **ID**: `06127088-4d52-40aa-88c9-93f4e79e085a`
- **Name**: `Medical Affairs`
- **Slug**: `medical-affairs`

## Departments (9 Total)

### 1. Clinical Operations Support
- **ID**: `a8018f58-6a8a-4a09-92b2-b1667b1148c5`
- **Slug**: `clinical-operations-support`
- **Roles**: 9

### 2. Field Medical
- **ID**: `ca5503b6-7821-4f65-8162-2b75952d5363`
- **Slug**: `field-medical`
- **Roles**: 15

### 3. HEOR & Evidence
- **ID**: `04723b72-04b3-40fe-aa1f-2e834b719b03`
- **Slug**: `heor-evidence`
- **Roles**: 9

### 4. Medical Education
- **ID**: `9e1759d6-1f66-484e-b174-1ff68150697d`
- **Slug**: `medical-education`
- **Roles**: 12

### 5. Medical Excellence & Compliance
- **ID**: `bffee306-7ed9-4ea9-aa1d-9d3d01c46741`
- **Slug**: `medical-excellence-compliance`
- **Roles**: 9

### 6. Medical Information Services
- **ID**: `2b320eab-1758-42d7-adfa-7f49c12cdf40`
- **Slug**: `medical-information-services`
- **Roles**: 15

### 7. Medical Leadership
- **ID**: `23ee308e-b415-4471-9605-d50c69d33209`
- **Slug**: `medical-leadership`
- **Roles**: 12

### 8. Publications
- **ID**: `5d5ded20-c30a-48f1-844c-fc9f80fcaacb`
- **Slug**: `publications`
- **Roles**: 9

### 9. Scientific Communications
- **ID**: `9871d82a-631a-4cf7-9a00-1ab838a45c3e`
- **Slug**: `scientific-communications`
- **Roles**: 12

## Total Roles: 102

All roles follow the pattern: `{Geographic Scope} {Role Title}`
- **Geographic Scopes**: Global, Regional, Local
- **Seniority Levels**: c_suite, executive, director, senior, mid, entry

## Usage in Seed Files

When creating agent seed files, always include:
```sql
function_id = '06127088-4d52-40aa-88c9-93f4e79e085a',
function_name = 'Medical Affairs',
department_id = '<appropriate-department-id>',
department_name = '<appropriate-department-name>',
role_id = '<appropriate-role-id>',
role_name = '<appropriate-role-name>'
```

This ensures perfect graph connectivity for GraphRAG queries.

