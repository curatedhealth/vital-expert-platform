# Organizational Structure Database

## Overview

This document describes the organizational structure database tables that manage Functions, Departments, Roles, and Responsibilities within the VITAL Path platform.

## Database Schema

### Tables

#### 1. **functions**
Business functions within the organization (e.g., Research & Development, Clinical Development)

**Fields:**
- `id` (UUID, PK): Primary key
- `unique_id` (VARCHAR): Unique identifier from source system (e.g., FUNC-001)
- `department_name` (VARCHAR): Name of the function
- `description` (TEXT): Detailed description
- `migration_ready` (BOOLEAN): Migration status flag
- `created_at`, `updated_at`: Timestamps
- `created_by`, `updated_by`: User tracking
- `search_vector`: Full-text search support

**Example:**
```json
{
  "unique_id": "FUNC-001",
  "department_name": "Research & Development",
  "description": "Drug discovery, preclinical and translational research",
  "migration_ready": false
}
```

#### 2. **departments**
Departments within each function (e.g., Drug Discovery, Clinical Operations)

**Fields:**
- `id` (UUID, PK): Primary key
- `unique_id` (VARCHAR): Unique identifier
- `department_id` (VARCHAR): Department code (e.g., VP-DEPT-1)
- `department_name` (VARCHAR): Department name
- `department_type` (VARCHAR): Type (Medical Affairs, Commercial, etc.)
- `description` (TEXT): Detailed description
- `function_area` (VARCHAR): Associated function area
- `compliance_requirements` (TEXT[]): Required compliance standards
- `critical_systems` (TEXT[]): Critical systems used
- `data_classification` (VARCHAR): Data security level
- `function_id` (UUID, FK): Links to functions table
- `migration_ready` (BOOLEAN): Migration status
- `created_at`, `updated_at`: Timestamps
- `metadata` (JSONB): Additional metadata
- `search_vector`: Full-text search support

**Example:**
```json
{
  "department_id": "VP-DEPT-1",
  "department_name": "Launch Excellence Office",
  "department_type": "Commercial",
  "compliance_requirements": ["FDA Part 11", "GxP", "HIPAA"],
  "critical_systems": ["CRM", "DMS", "ERP"],
  "data_classification": "Confidential",
  "function_id": "uuid-of-function"
}
```

#### 3. **roles**
Job roles and positions within departments

**Fields:**
- `id` (UUID, PK): Primary key
- `unique_id` (VARCHAR): Unique identifier (e.g., ROLE-001)
- `role_name` (VARCHAR): Role name
- `role_title` (VARCHAR): Job title
- `description` (TEXT): Role description
- `seniority_level` (VARCHAR): Executive/Senior/Mid/Junior/Entry
- `reports_to_role_id` (UUID, FK): Reporting hierarchy
- `function_area` (VARCHAR): Associated function
- `department_name` (VARCHAR): Associated department
- `required_skills` (TEXT[]): Required skills
- `required_certifications` (TEXT[]): Required certifications
- `years_experience_min`, `years_experience_max` (INTEGER): Experience range
- `migration_ready` (BOOLEAN): Migration status
- `is_active` (BOOLEAN): Active status
- `function_id` (UUID, FK): Links to functions
- `department_id` (UUID, FK): Links to departments
- `created_at`, `updated_at`: Timestamps
- `metadata` (JSONB): Additional metadata
- `search_vector`: Full-text search support

**Example:**
```json
{
  "unique_id": "ROLE-001",
  "role_name": "Chief Scientific Officer",
  "seniority_level": "Executive",
  "required_skills": ["Scientific Leadership", "R&D Strategy"],
  "years_experience_min": 15,
  "department_id": "uuid-of-department",
  "is_active": true
}
```

#### 4. **responsibilities**
Specific responsibilities assigned to roles

**Fields:**
- `id` (UUID, PK): Primary key
- `unique_id` (VARCHAR): Unique identifier (e.g., RESP-001)
- `name` (VARCHAR): Responsibility name
- `description` (TEXT): Detailed description
- `category` (VARCHAR): Category grouping
- `priority` (INTEGER): Priority level (0-100)
- `complexity_level` (VARCHAR): Low/Medium/High/Critical
- `mapped_to_use_cases` (TEXT[]): Related VITAL Path use cases
- `use_case_ids` (TEXT[]): Use case identifiers
- `is_active` (BOOLEAN): Active status
- `created_at`, `updated_at`: Timestamps
- `metadata` (JSONB): Additional metadata
- `search_vector`: Full-text search support

**Example:**
```json
{
  "unique_id": "RESP-001",
  "name": "Set R&D Strategy",
  "description": "Define overall research and development strategy",
  "mapped_to_use_cases": ["UC-001: Portfolio optimization analytics"],
  "complexity_level": "Critical",
  "priority": 95
}
```

### Relationship Tables

#### 5. **function_departments**
Many-to-many relationship between functions and departments

**Fields:**
- `id` (UUID, PK)
- `function_id` (UUID, FK → functions)
- `department_id` (UUID, FK → departments)
- `created_at`

#### 6. **role_responsibilities**
Many-to-many relationship between roles and responsibilities

**Fields:**
- `id` (UUID, PK)
- `role_id` (UUID, FK → roles)
- `responsibility_id` (UUID, FK → responsibilities)
- `is_primary` (BOOLEAN): Primary responsibility flag
- `weight` (DECIMAL): Responsibility weight (0-1)
- `created_at`

#### 7. **department_roles**
Many-to-many relationship between departments and roles

**Fields:**
- `id` (UUID, PK)
- `department_id` (UUID, FK → departments)
- `role_id` (UUID, FK → roles)
- `headcount` (INTEGER): Number of people in this role
- `created_at`

#### 8. **function_roles**
Many-to-many relationship between functions and roles

**Fields:**
- `id` (UUID, PK)
- `function_id` (UUID, FK → functions)
- `role_id` (UUID, FK → roles)
- `created_at`

## Database Functions

### Helper Functions

#### `get_department_roles(dept_id UUID)`
Returns all roles for a specific department with headcount information.

**Usage:**
```sql
SELECT * FROM get_department_roles('uuid-of-department');
```

**Returns:**
- `role_id`: Role UUID
- `role_name`: Role name
- `role_title`: Role title
- `seniority_level`: Seniority level
- `headcount`: Number of people

#### `get_role_responsibilities(r_id UUID)`
Returns all responsibilities for a specific role with weights.

**Usage:**
```sql
SELECT * FROM get_role_responsibilities('uuid-of-role');
```

**Returns:**
- `responsibility_id`: Responsibility UUID
- `responsibility_name`: Responsibility name
- `description`: Detailed description
- `is_primary`: Primary responsibility flag
- `weight`: Responsibility weight

#### `get_organizational_hierarchy()`
Returns the complete organizational hierarchy.

**Usage:**
```sql
SELECT * FROM get_organizational_hierarchy();
```

**Returns:**
- `function_name`: Function name
- `function_id`: Function UUID
- `department_name`: Department name
- `department_id`: Department UUID
- `role_name`: Role name
- `role_id`: Role UUID
- `seniority_level`: Seniority level

## Installation

### 1. Apply Migration

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/database/sql/migrations/2025/20251001000000_create_organizational_structure.sql`
3. Execute the SQL

**Option B: Via Script**
```bash
node scripts/apply-organizational-migration.js
```

**Option C: Via Supabase CLI**
```bash
npx supabase db push
```

### 2. Import Data

After applying the migration, import the organizational data:

```bash
node scripts/import-organizational-data.js
```

This will import:
- Functions from `docs/Functions 2753dedf985680178336f15f9342a9a7_all.csv`
- Departments from `docs/Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv`
- Roles from `docs/Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv`
- Responsibilities from `docs/Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv`

## Usage Examples

### Query All Functions with Department Count
```sql
SELECT
    f.department_name,
    COUNT(DISTINCT d.id) as department_count
FROM functions f
LEFT JOIN departments d ON d.function_id = f.id
GROUP BY f.id, f.department_name
ORDER BY f.department_name;
```

### Query Roles by Seniority in a Department
```sql
SELECT
    r.role_name,
    r.seniority_level,
    dr.headcount
FROM roles r
INNER JOIN department_roles dr ON r.id = dr.role_id
INNER JOIN departments d ON d.id = dr.department_id
WHERE d.department_name = 'Drug Discovery'
ORDER BY
    CASE r.seniority_level
        WHEN 'Executive' THEN 1
        WHEN 'Senior' THEN 2
        WHEN 'Mid' THEN 3
        WHEN 'Junior' THEN 4
        WHEN 'Entry' THEN 5
    END,
    r.role_name;
```

### Query Role with All Responsibilities
```sql
SELECT
    r.role_name,
    resp.name as responsibility,
    resp.description,
    rr.is_primary,
    rr.weight
FROM roles r
INNER JOIN role_responsibilities rr ON r.id = rr.role_id
INNER JOIN responsibilities resp ON resp.id = rr.responsibility_id
WHERE r.role_name = 'Chief Scientific Officer'
ORDER BY rr.is_primary DESC, rr.weight DESC;
```

### Query Complete Organizational Chart
```sql
SELECT * FROM get_organizational_hierarchy()
ORDER BY function_name, department_name, seniority_level;
```

## API Integration

### TypeScript Types

```typescript
export interface Function {
  id: string;
  unique_id: string;
  department_name: string;
  description: string | null;
  migration_ready: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  unique_id: string | null;
  department_id: string | null;
  department_name: string;
  department_type: string | null;
  description: string | null;
  function_area: string | null;
  compliance_requirements: string[];
  critical_systems: string[];
  data_classification: string | null;
  function_id: string | null;
  migration_ready: boolean;
  metadata: Record<string, any>;
}

export interface Role {
  id: string;
  unique_id: string;
  role_name: string;
  role_title: string | null;
  description: string | null;
  seniority_level: 'Executive' | 'Senior' | 'Mid' | 'Junior' | 'Entry';
  function_area: string | null;
  department_name: string | null;
  required_skills: string[];
  required_certifications: string[];
  years_experience_min: number | null;
  years_experience_max: number | null;
  is_active: boolean;
  function_id: string | null;
  department_id: string | null;
}

export interface Responsibility {
  id: string;
  unique_id: string;
  name: string;
  description: string | null;
  category: string | null;
  priority: number | null;
  complexity_level: 'Low' | 'Medium' | 'High' | 'Critical';
  mapped_to_use_cases: string[];
  is_active: boolean;
}
```

### Example API Route

```typescript
// /api/organizational/departments/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      function:functions(id, department_name),
      roles:department_roles(
        role:roles(*)
      )
    `)
    .order('department_name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

## Security

### Row Level Security (RLS)

RLS is enabled on all tables with the following policies:

1. **Authenticated Users**: Can read all organizational data
2. **Service Role**: Has full access to all operations

### Modifying Policies

To add custom policies:

```sql
-- Example: Restrict department access by user's department
CREATE POLICY "Users can only see their department"
ON departments FOR SELECT
TO authenticated
USING (department_id = auth.jwt() ->> 'department_id');
```

## Maintenance

### Updating Data

To update organizational data after making changes to CSV files:

```bash
# Re-run the import script
node scripts/import-organizational-data.js
```

The import script uses `upsert` operations, so existing data will be updated rather than duplicated.

### Backup

To backup organizational data:

```bash
# Export to JSON
node scripts/export-organizational-data.js > backup.json
```

## Related Files

- Migration: `/database/sql/migrations/2025/20251001000000_create_organizational_structure.sql`
- Import Script: `/scripts/import-organizational-data.js`
- Source Data: `/docs/` (CSV files)
- Agent Data Model: `/docs/AGENT_DATA_MODEL.md`
