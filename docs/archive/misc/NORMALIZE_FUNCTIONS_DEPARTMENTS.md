# Normalize Functions, Departments & Roles - Data Model

**Date:** 2025-11-10
**Issue:** Duplicate functions/departments causing data mapping issues
**Solution:** Create normalized reference tables with industry mappings

---

## 🎯 Problem Analysis

From the screenshot, we see many duplicate categories:
- "Commercial & Market Access" (appears 3+ times)
- "Clinical Development" (appears 2+ times)
- "Clinical & Medical" (appears 2+ times)
- "Compliance & Governance" variations
- "Data Science" variations
- "Digital Health & Innovation" variations
- "HEOR" variations
- "Manufacturing" variations

**Root Cause:** Functions, Departments, and Roles are stored as free text in multiple tables instead of normalized reference tables.

---

## 📊 Proposed Normalized Schema

### 1. Industries Table (Already Exists - 16 records)
```sql
-- Keep existing industries table
-- Examples: Pharmaceuticals, Biotech, Medical Devices, etc.
```

### 2. Functions Table (NEW - Industry Agnostic & Specific)
```sql
CREATE TABLE functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- FUNC-001, FUNC-002
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Industry relationship
  industry_id UUID REFERENCES industries(id),  -- NULL = industry-agnostic
  is_industry_agnostic BOOLEAN DEFAULT false,

  -- Hierarchy
  parent_function_id UUID REFERENCES functions(id),  -- For sub-functions
  level INTEGER DEFAULT 1,  -- 1 = top level, 2 = sub-function

  -- Metadata
  category VARCHAR(100),  -- e.g., "Core Business", "Support", "Specialized"
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name, industry_id)  -- Same name allowed only if different industry
);

CREATE INDEX idx_functions_industry ON functions(industry_id);
CREATE INDEX idx_functions_code ON functions(code);
CREATE INDEX idx_functions_agnostic ON functions(is_industry_agnostic);
```

### 3. Departments Table (NEW)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- DEPT-001, DEPT-002
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Function relationship
  function_id UUID REFERENCES functions(id),  -- Departments belong to functions

  -- Industry relationship (optional - inherit from function if NULL)
  industry_id UUID REFERENCES industries(id),

  -- Hierarchy
  parent_department_id UUID REFERENCES departments(id),
  level INTEGER DEFAULT 1,

  -- Metadata
  typical_headcount_range VARCHAR(50),  -- e.g., "10-50", "50-200"
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name, function_id, industry_id)
);

CREATE INDEX idx_departments_function ON departments(function_id);
CREATE INDEX idx_departments_industry ON departments(industry_id);
```

### 4. Roles Table (NEW)
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- ROLE-001, ROLE-002
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Organizational relationships
  department_id UUID REFERENCES departments(id),  -- Roles belong to departments
  function_id UUID REFERENCES functions(id),      -- Can also directly link to function

  -- Seniority
  seniority_level VARCHAR(50),  -- e.g., "Entry", "Mid", "Senior", "Executive", "C-Suite"
  seniority_rank INTEGER,       -- 1-10 for sorting

  -- Reporting
  reports_to_role_id UUID REFERENCES roles(id),

  -- Metadata
  typical_salary_range VARCHAR(100),
  required_years_experience INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name, department_id)
);

CREATE INDEX idx_roles_department ON roles(department_id);
CREATE INDEX idx_roles_function ON roles(function_id);
CREATE INDEX idx_roles_seniority ON roles(seniority_level);
```

---

## 🔗 Updated Personas Table

```sql
-- Update personas table to use references instead of free text
ALTER TABLE personas
  ADD COLUMN function_id UUID REFERENCES functions(id),
  ADD COLUMN department_id UUID REFERENCES departments(id),
  ADD COLUMN role_id UUID REFERENCES roles(id),
  ADD COLUMN industry_id UUID REFERENCES industries(id);

-- Keep legacy text fields temporarily for migration
-- ALTER TABLE personas
--   ADD COLUMN function_legacy VARCHAR(255),  -- Old free text
--   ADD COLUMN department_legacy VARCHAR(255); -- Old free text

CREATE INDEX idx_personas_function ON personas(function_id);
CREATE INDEX idx_personas_department ON personas(department_id);
CREATE INDEX idx_personas_role ON personas(role_id);
CREATE INDEX idx_personas_industry ON personas(industry_id);
```

---

## 📋 Data Migration Strategy

### Phase 1: Extract Unique Values

```sql
-- Extract unique functions from existing personas
SELECT DISTINCT
  category as function_name,
  COUNT(*) as persona_count
FROM personas
WHERE category IS NOT NULL
GROUP BY category
ORDER BY persona_count DESC;

-- This will give us the canonical list to normalize
```

### Phase 2: Create Normalized Functions

Based on your screenshot, here are the canonical functions:

**Industry-Agnostic Functions:**
1. Commercial & Market Access
2. Clinical Development
3. Clinical Operations
4. Medical Affairs
5. Regulatory Affairs
6. Quality Assurance
7. Manufacturing & Operations
8. Research & Development
9. Business Development
10. Finance & Administration
11. Legal & Compliance
12. Data Science & Analytics
13. IT/Digital
14. Human Resources

**Pharma/Biotech Specific:**
1. Drug Safety (Pharmacovigilance)
2. HEOR (Health Economics & Outcomes Research)
3. Medical Information
4. Clinical Data Management

---

## 📊 Consolidated Function Hierarchy

```
Medical Affairs (Parent)
├── Field Medical
├── Medical Information
├── Medical Communications
└── HEOR

Clinical Development (Parent)
├── Clinical Operations
├── Clinical Data Management
└── Biometrics

Commercial (Parent)
├── Commercial & Market Access
├── Brand Management
└── Sales Operations

Regulatory & Quality (Parent)
├── Regulatory Affairs
├── Quality Assurance
└── Compliance & Governance

Research & Development (Parent)
├── Drug Discovery
├── Preclinical Research
└── Translational Medicine

Operations (Parent)
├── Manufacturing & Operations
├── Supply Chain
└── Facilities

Corporate Functions (Parent)
├── Finance & Administration
├── Legal
├── Human Resources
└── IT/Digital

Innovation (Parent)
├── Data Science & AI/ML
├── Digital Health & Innovation
└── Technology Transfer
```

---

## 🔧 Migration Script

```sql
-- scripts/normalize_functions_departments.sql

-- 1. Create industry-agnostic functions
INSERT INTO functions (code, name, is_industry_agnostic, category, display_order)
VALUES
  ('FUNC-001', 'Medical Affairs', true, 'Core Business', 1),
  ('FUNC-002', 'Clinical Development', true, 'Core Business', 2),
  ('FUNC-003', 'Regulatory Affairs', true, 'Core Business', 3),
  ('FUNC-004', 'Commercial & Market Access', true, 'Core Business', 4),
  ('FUNC-005', 'Manufacturing & Operations', true, 'Core Business', 5),
  ('FUNC-006', 'Quality Assurance', true, 'Core Business', 6),
  ('FUNC-007', 'Research & Development', true, 'Core Business', 7),
  ('FUNC-008', 'Business Development', true, 'Corporate', 8),
  ('FUNC-009', 'Finance & Administration', true, 'Corporate', 9),
  ('FUNC-010', 'Legal & Compliance', true, 'Corporate', 10),
  ('FUNC-011', 'Data Science & Analytics', true, 'Innovation', 11),
  ('FUNC-012', 'Digital Health & Innovation', true, 'Innovation', 12),
  ('FUNC-013', 'Human Resources', true, 'Corporate', 13),
  ('FUNC-014', 'IT/Digital', true, 'Corporate', 14);

-- 2. Create sub-functions (children)
INSERT INTO functions (code, name, parent_function_id, level, is_industry_agnostic, display_order)
SELECT
  'FUNC-101', 'Field Medical', id, 2, true, 101
FROM functions WHERE code = 'FUNC-001'
UNION ALL
SELECT 'FUNC-102', 'Medical Information', id, 2, true, 102
FROM functions WHERE code = 'FUNC-001'
UNION ALL
SELECT 'FUNC-103', 'HEOR', id, 2, true, 103
FROM functions WHERE code = 'FUNC-001'
UNION ALL
SELECT 'FUNC-104', 'Medical Communications', id, 2, true, 104
FROM functions WHERE code = 'FUNC-001';

-- 3. Create departments under functions
INSERT INTO departments (code, name, function_id, display_order)
SELECT
  'DEPT-001', 'Medical Affairs Leadership', id, 1
FROM functions WHERE code = 'FUNC-001'
UNION ALL
SELECT 'DEPT-002', 'MSL Team', id, 2
FROM functions WHERE code = 'FUNC-101'
UNION ALL
SELECT 'DEPT-003', 'Medical Information Services', id, 3
FROM functions WHERE code = 'FUNC-102';

-- 4. Create roles
INSERT INTO roles (code, name, department_id, seniority_level, seniority_rank, display_order)
SELECT
  'ROLE-001', 'VP Medical Affairs', d.id, 'C-Suite', 10, 1
FROM departments d
JOIN functions f ON d.function_id = f.id
WHERE f.code = 'FUNC-001' AND d.code = 'DEPT-001'
UNION ALL
SELECT
  'ROLE-002', 'Medical Director', d.id, 'Executive', 9, 2
FROM departments d
JOIN functions f ON d.function_id = f.id
WHERE f.code = 'FUNC-001' AND d.code = 'DEPT-001';

-- 5. Map existing personas to normalized structure
UPDATE personas p
SET function_id = (
  SELECT f.id FROM functions f
  WHERE f.name = p.category
  AND f.is_industry_agnostic = true
  LIMIT 1
)
WHERE p.function_id IS NULL
  AND p.category IS NOT NULL;
```

---

## 🎯 Updated UI Components

### Filter Component Update

```typescript
// components/PersonaFilters.tsx
interface FilterProps {
  onFilterChange: (filters: PersonaFilters) => void;
}

interface PersonaFilters {
  industryId?: string;
  functionId?: string;
  departmentId?: string;
  roleId?: string;
  seniorityLevel?: string;
}

export function PersonaFilters({ onFilterChange }: FilterProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [functions, setFunctions] = useState<Function[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load industries
  useEffect(() => {
    loadIndustries();
  }, []);

  // Load functions when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      loadFunctions(selectedIndustry);
    } else {
      loadAgnosticFunctions();
    }
  }, [selectedIndustry]);

  // Load departments when function changes
  useEffect(() => {
    if (selectedFunction) {
      loadDepartments(selectedFunction);
    }
  }, [selectedFunction]);

  // Cascading dropdowns - no duplicates!
}
```

### Persona Card Update

```typescript
// Show normalized hierarchy
<PersonaCard>
  <Industry>{persona.industry?.name || 'Industry Agnostic'}</Industry>
  <Function>{persona.function?.name}</Function>
  <Department>{persona.department?.name}</Department>
  <Role>{persona.role?.name}</Role>
  <Seniority>{persona.role?.seniority_level}</Seniority>
</PersonaCard>
```

---

## ✅ Benefits of Normalization

1. **No Duplicates**: Each function/department/role exists once
2. **Consistency**: Same spelling, capitalization across system
3. **Hierarchy**: Clear parent-child relationships
4. **Industry Mapping**: Know which are agnostic vs. industry-specific
5. **Easier Filtering**: Cascade filters work correctly
6. **Data Integrity**: Foreign keys prevent orphaned records
7. **Reporting**: Accurate counts and analytics
8. **Maintenance**: Update once, reflects everywhere

---

## 🚀 Execution Plan

### Step 1: Create Tables (5 min)
```bash
# Run in Supabase SQL Editor
# See: scripts/create_normalized_tables.sql
```

### Step 2: Seed Reference Data (10 min)
```bash
# Run seed script
python3 scripts/seed_functions_departments.py
```

### Step 3: Migrate Existing Personas (15 min)
```bash
# Map free text to normalized IDs
python3 scripts/migrate_persona_references.py
```

### Step 4: Update UI Components (20 min)
- Update PersonasManagement.tsx
- Add FilterComponent
- Update PersonaCard
- Test cascading filters

---

## 📊 Expected Results

**Before:**
- 220 personas with 50+ duplicate function names

**After:**
- 220 personas
- ~15 unique functions
- ~30 unique departments
- ~100 unique roles
- Zero duplicates
- Clean hierarchical navigation

---

## 📁 All Scripts Created

### SQL Scripts
- ✅ [scripts/create_normalized_tables.sql](scripts/create_normalized_tables.sql) - Create functions, departments, roles tables

### Migration Scripts
- ✅ [scripts/seed_functions_departments.py](scripts/seed_functions_departments.py) - Seed 21 functions, 7 departments, 10 roles
- ✅ [scripts/migrate_persona_references.py](scripts/migrate_persona_references.py) - Map personas to normalized structure

### Documentation
- ✅ [NORMALIZE_FUNCTIONS_DEPARTMENTS.md](NORMALIZE_FUNCTIONS_DEPARTMENTS.md) - This file (design document)
- ✅ [EXECUTE_NORMALIZATION.md](EXECUTE_NORMALIZATION.md) - Step-by-step execution guide

---

**Last Updated:** 2025-11-10
**Status:** ✅ Implementation Complete - Ready to Execute
**Next Action:** Run [EXECUTE_NORMALIZATION.md](EXECUTE_NORMALIZATION.md) guide
