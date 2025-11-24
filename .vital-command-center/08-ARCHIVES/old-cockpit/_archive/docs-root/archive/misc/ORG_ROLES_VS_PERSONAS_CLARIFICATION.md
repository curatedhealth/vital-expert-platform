# 🎯 IMPORTANT: org_roles vs org_personas Distinction

## Key Difference

### **org_roles** 
**Purpose**: Define **job positions/titles** within the organization  
**Example**: "VP Clinical Development"

```sql
org_roles:
- id: uuid
- unique_id: dh_org_role_vpclin
- org_role: "VP Clinical Development"  ← THE JOB TITLE
- role_title: "VP Clinical Development"
- seniority_level: Executive
- function_id: → org_functions
- department_id: → org_departments
```

### **org_personas**
**Purpose**: Define **actual people** (or persona archetypes) who fill those roles  
**Example**: "Dr. Frank Valentin" who is a VP Clinical Development

```sql
org_personas:
- id: uuid
- code: P02_VPCLIN
- unique_id: dh_org_persona_p02vpclin
- name: "Dr. Frank Valentin"  ← THE PERSON'S NAME
- department: "Clinical Development"
- role_id: → org_roles (links to the VP Clinical Development role)
- expertise_level: EXPERT
- typical_titles: ["VP Clinical Development", ...]
```

---

## Current Issue

Right now, `org_personas.name` contains **role titles** instead of **person names**:

| Current (WRONG) | Should Be (CORRECT) |
|-----------------|---------------------|
| `name: "VP Clinical Development"` | `name: "Dr. Frank Valentin"` |
| `name: "Chief Medical Officer"` | `name: "Dr. Sarah Chen"` |
| `name: "Data Scientist - Digital Biomarker"` | `name: "Alex Martinez"` |

---

## Correct Relationship

```
org_roles (Job Positions)
    ↓ (many people can have the same role type)
org_personas (Actual People)
    ↓ (people work in departments)
org_departments
    ↓ (departments belong to functions)
org_functions
```

### Example Hierarchy

```
org_function: "Clinical & Medical"
    ↓
org_department: "Clinical Development"
    ↓
org_role: "VP Clinical Development"  ← The job position
    ↓
org_persona: "Dr. Frank Valentin"    ← The actual person in that role
    - code: P02_VPCLIN
    - expertise_level: EXPERT
    - years_experience: 15
    - key_responsibilities: [...]
```

---

## Two Approaches

### Approach 1: Personas as Fictional Archetypes (Current)
**Use Case**: Create representative "persona profiles" for each role type for AI/agent training

```sql
org_persona:
- code: P02_VPCLIN
- name: "Dr. Frank Valentin (Persona Archetype)"  ← Fictional representative
- typical_titles: ["VP Clinical Development", ...]
- key_responsibilities: [...]
- decision_authority: HIGH
```

This is useful for:
- AI agent training
- User story development
- Role-based access control templates
- Workflow design

### Approach 2: Personas as Real People (Your Intent)
**Use Case**: Track actual individuals in the organization

```sql
org_persona:
- code: FRANK_VALENTIN_001
- name: "Dr. Frank Valentin"  ← Actual person
- email: "frank.valentin@company.com"
- role_id: → dh_org_role_vpclin
- department_id: → dh_org_department_clindev
- start_date: 2020-03-15
- reports_to: → another persona_id
```

This is useful for:
- Org charts
- Directory/contact management
- Assignment tracking
- Performance reviews

---

## Recommendation: Hybrid Approach

Given the current data structure with codes like `P01_CMO`, `P02_VPCLIN`, these appear to be **persona archetypes** (fictional representatives), not real people.

### Updated Structure:

```sql
CREATE TABLE org_personas (
    id uuid PRIMARY KEY,
    code varchar,                          -- P01_CMO, P02_VPCLIN
    unique_id varchar,                     -- dh_org_persona_p01cmo
    
    -- Persona identity (could be fictional archetype or real person)
    name varchar NOT NULL,                 -- "Dr. Frank Valentin" (archetype name)
    persona_type varchar,                  -- 'archetype' or 'individual'
    
    -- Role linkage
    primary_role_id uuid REFERENCES org_roles(id),
    department varchar,
    
    -- Characteristics
    expertise_level varchar,
    decision_authority varchar,
    years_experience_min int,
    years_experience_max int,
    typical_titles jsonb,                 -- ["VP Clinical Development", ...]
    
    -- Persona details
    key_responsibilities text[],
    capabilities jsonb,
    typical_availability_hours int,
    response_time_sla_hours int,
    
    ...
);
```

### Link to Roles:

```sql
-- Add foreign key to org_personas
ALTER TABLE org_personas 
  ADD COLUMN primary_role_id uuid REFERENCES org_roles(id);

-- This creates the relationship:
-- org_persona "Dr. Frank Valentin" → org_role "VP Clinical Development"
```

---

## Action Required

### Option 1: Keep as Archetypes (Recommended for current use)
Update `name` field to have archetype person names:

```sql
UPDATE org_personas SET name = 'Dr. Sarah Chen' WHERE code = 'P01_CMO';
UPDATE org_personas SET name = 'Dr. Frank Valentin' WHERE code = 'P02_VPCLIN';
UPDATE org_personas SET name = 'John Smith' WHERE code = 'P03_CEO';
-- etc.
```

Add `persona_type = 'archetype'` to clarify these are representative personas.

### Option 2: Convert to Real People System
Add actual employee/person management fields:
- `employee_id`
- `email`
- `phone`
- `manager_id` (self-reference)
- `start_date`
- `end_date`

---

## Current State vs Desired State

### Current:
```
org_personas.name = "VP Clinical Development"  ← Role title (WRONG)
```

### Desired:
```
org_personas.name = "Dr. Frank Valentin"       ← Person name (RIGHT)
org_personas.primary_role_id → org_roles       ← Links to the role
```

---

## Summary

| Table | Contains | Example |
|-------|----------|---------|
| **org_roles** | Job positions/titles | "VP Clinical Development" |
| **org_personas** | People (real or archetype) | "Dr. Frank Valentin" |
| **Relationship** | Persona → holds → Role | Frank → is → VP Clinical Dev |

**Next Step**: Decide if we want:
1. Fictional archetype personas (for AI training) → Update names to fictional people
2. Real individual tracking → Add person management fields

---

**Created**: November 8, 2025  
**Issue**: org_personas.name currently contains role titles instead of person names  
**Action Required**: Update data model and populate with correct person names

