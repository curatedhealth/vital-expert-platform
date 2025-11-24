# 🚨 Persona Organizational Mapping Issue - Analysis & Remediation Plan

**Date**: 2025-11-17
**Issue**: 326 personas deployed WITHOUT proper organizational structure mapping
**Impact**: HIGH - Personas not queryable by Business Function, Department, or Role

---

## ❌ Current Problem

### Missing Mappings
All 326 personas have NULL values for:
- `function_id` → Should link to `org_functions` (Business Function)
- `department_id` → Should link to `org_departments` (Department)
- `role_id` → Should link to `org_roles` (Role)

### Correct Organizational Hierarchy
```
Business Function (e.g., "Medical Affairs", "Market Access")
  ↓
Department (e.g., "HEOR", "MSL", "Payer Relations")
  ↓
Role (e.g., "HEOR Director", "MSL Manager", "Payer Director")
  ↓
Persona (Individual with specific profile)
```

### Current State
```
❌ Personas → NULL → NULL → NULL
✅ Should be: Personas → Role → Department → Function
```

---

## 📊 Available Organizational Structure

### Business Functions (org_functions)

| ID | Name | Slug | Personas to Map |
|----|------|------|-----------------|
| bd4cbbef-e3a2-4b22-836c-61ccfd7f042d | Medical Affairs | medical-affairs | 150 |
| 4087be09-38e0-4c84-81e6-f79dd38151d3 | Market Access | market-access | 176 |

---

### Departments (org_departments) - Available

**Market Access Departments:**
| ID | Name | Slug | Personas |
|----|------|------|----------|
| be5ef154-4196-4531-9a40-87ae13295895 | Health Economics & Outcomes Research (HEOR) | health-economics-outcomes-research-heor | ~32 |
| dc8ef851-05fe-48ba-a98f-ddefe35f1265 | Pricing & Reimbursement | pricing-and-reimbursement | ~25 |
| 55734f5f-fa05-4955-bb7c-30bc6df979fc | Payer Relations & Contracting | payer-relations-contracting | ~28 |
| 7d90e4b9-984f-4e1e-bcf8-c307a748d996 | Market Access Analytics & Insights | market-access-analytics-insights | ~12 |
| f6c0c098-102e-45dc-9d55-42c6d3350a47 | Market Access Operations & Excellence | market-access-operations-excellence | ~18 |

**Medical Affairs Departments:**
| ID | Name | Slug | Personas |
|----|------|------|----------|
| 36241f10-7950-4298-b0cd-4f4dccdf95a6 | Medical Science Liaisons | medical-science-liaisons | ~22 |
| 047acfb6-ddb4-4d77-b8cf-273fee31db41 | Medical Information | medical-information | ~21 |
| 962e2a96-0af8-491a-82fe-4e876b610be3 | Medical Communications | medical-communications | ~41 |

**Missing Departments (Need to Create):**
- Patient Access & Hub Services (~23 personas)
- Government Affairs (~9 personas)
- Trade & Distribution (~7 personas)
- Clinical Development (~18 personas)
- Medical Excellence & Quality (~21 personas)
- Publications (separate from Communications) (~15 personas)
- Evidence Generation & Analytics (~16 personas)

---

## 🎯 Remediation Plan

### Phase 1: Create Missing Departments

We need to create departments for:
1. Patient Access & Hub Services
2. Government Affairs
3. Trade & Distribution
4. Clinical Development
5. Medical Excellence & Quality
6. Field Medical (MSL) Leadership
7. Evidence Generation

### Phase 2: Create or Map Roles

For each unique title in our 326 personas, we need to either:
- Map to existing role in `org_roles`, OR
- Create new role in `org_roles`

**Example Mapping:**
```
Persona Title: "Chief Market Access Officer - Large Pharma (Global)"
  ↓
Role: "Chief Market Access Officer"
  ↓
Department: "Leadership & Strategy"
  ↓
Function: "Market Access"
```

### Phase 3: Update All Personas

Execute UPDATE statements to set:
- `function_id` based on title analysis
- `department_id` based on title/role categorization
- `role_id` based on standardized role definition

---

## 📋 Proposed Mapping Strategy

### Strategy 1: Title-Based Mapping (Quick)

Use title keywords to map to functions and departments:

**Market Access (function_id = 4087be09-38e0-4c84-81e6-f79dd38151d3)**
- Title contains: "Market Access", "HEOR", "VEO", "Pricing", "Reimbursement", "Payer", "Patient Access", "Government Affairs", "Trade", "GPO", "IDN", "MA Analytics", "MA Operations"

**Medical Affairs (function_id = bd4cbbef-e3a2-4b22-836c-61ccfd7f042d)**
- Title contains: "Medical", "MSL", "Publication", "Clinical", "Biostatistician", "Epidemiologist", "Medical Writer", "Medical Editor", "Congress Manager"

### Strategy 2: Create Standardized Role Definitions

Extract role base from title (remove seniority/specialization modifiers):
- "HEOR Director - Modeling (Senior Expert)" → Role: "HEOR Director"
- "VP Market Access - Global (Strategic)" → Role: "VP Market Access"
- "MSL Manager - Hands-On" → Role: "MSL Manager"

### Strategy 3: Department Mapping by Role Category

| Role Pattern | Department | Function |
|--------------|------------|----------|
| "Chief Market Access Officer" | Leadership & Strategy | Market Access |
| "VP Market Access" | Leadership & Strategy | Market Access |
| "HEOR Director", "Health Economist" | HEOR | Market Access |
| "Pricing Director", "Pricing Manager" | Pricing & Reimbursement | Market Access |
| "Payer Director", "Payer Relations" | Payer Relations | Market Access |
| "Patient Services", "Hub Services" | Patient Access | Market Access |
| "Chief Medical Officer" | Leadership | Medical Affairs |
| "VP Medical Affairs" | Leadership | Medical Affairs |
| "MSL", "Medical Science Liaison" | Medical Science Liaisons | Medical Affairs |
| "Medical Information", "Medical Info" | Medical Information | Medical Affairs |
| "Medical Writer", "Medical Editor" | Medical Communications | Medical Affairs |

---

## 🔧 Remediation SQL Script Outline

### Step 1: Create Missing Departments
```sql
INSERT INTO org_departments (name, slug, description, ...)
VALUES
  ('Patient Access & Hub Services', 'patient-access-hub-services', ...),
  ('Government Affairs', 'government-affairs', ...),
  -- etc.
```

### Step 2: Create Roles (if needed)
```sql
INSERT INTO org_roles (name, slug, function_id, department_id, ...)
SELECT DISTINCT ... FROM personas
WHERE role doesn't exist
```

### Step 3: Update Personas with function_id
```sql
-- Market Access
UPDATE personas
SET function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
WHERE title ILIKE ANY (ARRAY['%market access%', '%heor%', '%pricing%', ...]);

-- Medical Affairs
UPDATE personas
SET function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
WHERE title ILIKE ANY (ARRAY['%medical%', '%msl%', '%publication%', ...]);
```

### Step 4: Update Personas with department_id
```sql
-- HEOR Department
UPDATE personas
SET department_id = 'be5ef154-4196-4531-9a40-87ae13295895'
WHERE function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND title ILIKE ANY (ARRAY['%heor%', '%health economist%', '%veo%']);

-- Continue for each department...
```

### Step 5: Update Personas with role_id
```sql
-- Map to role based on standardized title
UPDATE personas p
SET role_id = r.id
FROM org_roles r
WHERE p.title ILIKE r.name || '%'
  AND p.function_id = r.function_id;
```

---

## ⚠️ Challenges & Considerations

### Challenge 1: Role Granularity
**Issue**: We have very specific persona titles like "HEOR Director - Modeling (Senior Expert)"
**Question**: Should role be "HEOR Director" (generic) or "HEOR Director - Modeling" (specific)?

**Recommendation**: Use generic role names, store specialization in persona title/metadata

### Challenge 2: Duplicate Departments
**Issue**: Multiple departments with similar names (e.g., 3 "HEOR" departments, 3 "Pricing" departments)
**Question**: Which one should we use?

**Recommendation**: Use the most descriptive one or consolidate duplicates

### Challenge 3: Missing Department Structure
**Issue**: Some persona categories don't have matching departments
**Examples**: Patient Access, Government Affairs, Trade & Distribution

**Recommendation**: Create new departments as part of remediation

### Challenge 4: Role Explosion
**Issue**: 326 unique persona titles could create 326 roles
**Question**: How granular should roles be?

**Recommendation**: Extract ~50-80 standardized roles from 326 persona titles

---

## 📊 Impact Assessment

### Current State (Broken)
```sql
-- Cannot query personas by function
SELECT * FROM personas WHERE function_id = '<medical-affairs-id>';
-- Returns 0 (should return 150)

-- Cannot query personas by department
SELECT * FROM personas WHERE department_id = '<heor-id>';
-- Returns 0 (should return ~32)

-- Cannot query personas by role
SELECT * FROM personas WHERE role_id = '<heor-director-id>';
-- Returns 0 (should return ~8)
```

### After Remediation
```sql
-- Will work correctly
SELECT * FROM personas WHERE function_id = '<medical-affairs-id>';
-- Returns 150

-- Proper hierarchy queries
SELECT p.*
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
WHERE f.slug = 'market-access';
```

---

## 🎯 Recommended Next Steps

### Option 1: Quick Fix (Title-Based Mapping)
**Time**: 1-2 hours
**Approach**:
1. Create missing departments
2. Update function_id based on title keywords
3. Update department_id based on title keywords
4. Leave role_id NULL for now

**Pros**: Fast, gets basic structure in place
**Cons**: Incomplete, role_id still NULL

### Option 2: Complete Remediation
**Time**: 4-6 hours
**Approach**:
1. Create missing departments
2. Extract and create ~50-80 standardized roles
3. Map all personas to function, department, AND role
4. Validate all mappings

**Pros**: Complete solution, fully normalized
**Cons**: More time intensive

### Option 3: Automated Script + Manual Review
**Time**: 2-3 hours + review time
**Approach**:
1. Run automated mapping script
2. Generate report of mappings
3. Manually review and adjust edge cases
4. Execute final update

**Pros**: Balance of automation and accuracy
**Cons**: Requires review/validation

---

## 📝 Decision Needed

**Questions for User:**
1. **Department Creation**: Should we create ~7 new departments for missing categories?
2. **Role Granularity**: How specific should roles be? (Generic vs. Specialized)
3. **Mapping Approach**: Which option (Quick Fix, Complete, or Hybrid)?
4. **Validation**: Should we review mapping before or after execution?

---

## 📊 Sample Mapping Table

| Persona Title | → | Role | → | Department | → | Function |
|---------------|---|------|---|------------|---|----------|
| Chief Market Access Officer - Large Pharma | → | Chief Market Access Officer | → | Leadership & Strategy | → | Market Access |
| HEOR Director - Modeling (Senior Expert) | → | HEOR Director | → | HEOR | → | Market Access |
| VP Market Access - Global (Strategic) | → | VP Market Access | → | Leadership & Strategy | → | Market Access |
| MSL Manager - Hands-On | → | MSL Manager | → | Medical Science Liaisons | → | Medical Affairs |
| Medical Writer Regulatory - CSR | → | Medical Writer | → | Medical Communications | → | Medical Affairs |

---

**Status**: ISSUE IDENTIFIED - Awaiting remediation approach decision
**Priority**: HIGH - Impacts all persona queries and organizational reporting
**Affected Records**: 326 personas (100% of database)
**Estimated Remediation Time**: 2-6 hours depending on approach
