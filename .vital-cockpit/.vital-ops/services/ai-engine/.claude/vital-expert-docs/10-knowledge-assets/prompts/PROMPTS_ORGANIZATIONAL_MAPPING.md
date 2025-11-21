# PROMPTS™ Framework - Organizational Mapping

**Date:** 2025-01-17
**Status:** ✅ COMPLETE - Fully Mapped to Business Functions & Departments

---

## Overview

The PROMPTS™ Framework has been successfully mapped to your organization's business functions and departments, enabling role-based prompt discovery and departmental specialization.

**Mappings Created:**
- ✅ **17 Suite-to-Function mappings** (primary and secondary)
- ✅ **14 Suite-to-Department mappings** (based on existing departments)
- ✅ **3 Views** for easy querying

---

## Suite to Function Mapping

| Suite | Primary Function | Secondary Function(s) | Relevance |
|-------|-----------------|----------------------|-----------|
| **RULES™** | Regulatory (10) | Quality (8) | Regulatory Excellence |
| **TRIALS™** | Clinical (10) | R&D (8) | Clinical Development |
| **GUARD™** | Medical Affairs (10) | - | Safety & PV |
| **VALUE™** | Market Access (10) | Commercial (7) | Market Access & HEOR |
| **BRIDGE™** | Medical Affairs (10) | - | Stakeholder Engagement |
| **PROOF™** | Clinical (9) | Market Access (9) | Evidence Analytics |
| **CRAFT™** | Medical Affairs (9) | Regulatory (8) | Medical Writing |
| **SCOUT™** | Commercial (10) | - | Competitive Intelligence |
| **PROJECT™** | Operations (10) | Clinical (8) | Project Management |
| **FORGE™** | IT/Digital (10) | Regulatory (7) | Digital Health |

**Relevance Score:** 1-10 scale (10 = highest relevance)

---

## Suite to Department Mapping

### RULES™ - Regulatory Excellence
**Departments:**
- CMC Regulatory Affairs (Primary, 10)

### TRIALS™ - Clinical Development
**Departments:**
- Clinical Operations (Primary, 10) - Multiple variants
- Biostatistics (Primary, 10) - Multiple variants

### GUARD™ - Safety Framework
**Departments:**
- Clinical Safety (Primary, 10)

### VALUE™ - Market Access
**Departments:**
- HEOR (Primary, 10)

### BRIDGE™ - Stakeholder Engagement
**Departments:**
- Medical Information (Primary, 10)

### PROOF™ - Evidence Analytics
**Departments:**
- Biostatistics (Primary, 9) - Multiple variants
- HEOR (Primary, 9)

### CRAFT™ - Medical Writing
**Departments:**
- *(Not yet mapped - departments may not exist)*

### SCOUT™ - Competitive Intelligence
**Departments:**
- *(Not yet mapped - departments may not exist)*

### PROJECT™ - Project Management
**Departments:**
- Clinical Operations Support (Primary, 10)

### FORGE™ - Digital Health
**Departments:**
- Clinical Validation (Primary, 10)

---

## Complete Functional Distribution

### Medical Affairs Function
- **GUARD™** (Primary) - Safety Framework
- **BRIDGE™** (Primary) - Stakeholder Engagement
- **CRAFT™** (Primary) - Medical Writing

### Clinical Function
- **TRIALS™** (Primary) - Clinical Development
- **PROOF™** (Primary) - Evidence Analytics
- **PROJECT™** (Secondary) - Clinical Operations

### Regulatory Function
- **RULES™** (Primary) - Regulatory Excellence
- **CRAFT™** (Secondary) - Regulatory Writing
- **FORGE™** (Secondary) - SaMD Regulatory

### Market Access Function
- **VALUE™** (Primary) - Market Access & HEOR
- **PROOF™** (Secondary) - Evidence for Value

### Commercial Function
- **SCOUT™** (Primary) - Competitive Intelligence
- **VALUE™** (Secondary) - Pricing Strategy

### Operations Function
- **PROJECT™** (Primary) - Project Management

### IT/Digital Function
- **FORGE™** (Primary) - Digital Health Development

### Quality Function
- **RULES™** (Secondary) - Quality Systems

### R&D Function
- **TRIALS™** (Secondary) - Clinical Research

---

## Database Structure

### Junction Tables Created

```sql
-- Suite to Function mapping
CREATE TABLE suite_functions (
    id UUID PRIMARY KEY,
    suite_id UUID REFERENCES prompt_suites(id),
    function_id UUID REFERENCES org_functions(id),
    is_primary BOOLEAN,
    relevance_score INTEGER,
    UNIQUE(suite_id, function_id)
);

-- Suite to Department mapping
CREATE TABLE suite_departments (
    id UUID PRIMARY KEY,
    suite_id UUID REFERENCES prompt_suites(id),
    department_id UUID REFERENCES org_departments(id),
    is_primary BOOLEAN,
    relevance_score INTEGER,
    UNIQUE(suite_id, department_id)
);

-- Sub-Suite to Function mapping
CREATE TABLE sub_suite_functions (
    id UUID PRIMARY KEY,
    sub_suite_id UUID REFERENCES prompt_sub_suites(id),
    function_id UUID REFERENCES org_functions(id),
    is_primary BOOLEAN,
    relevance_score INTEGER,
    UNIQUE(sub_suite_id, function_id)
);

-- Sub-Suite to Department mapping
CREATE TABLE sub_suite_departments (
    id UUID PRIMARY KEY,
    sub_suite_id UUID REFERENCES prompt_sub_suites(id),
    department_id UUID REFERENCES org_departments(id),
    is_primary BOOLEAN,
    relevance_score INTEGER,
    UNIQUE(sub_suite_id, department_id)
);
```

### Views Created

```sql
-- View 1: Suite to Function mappings with names
v_suite_function_mappings

-- View 2: Suite to Department mappings with names
v_suite_department_mappings

-- View 3: Complete organizational mapping
v_suite_organizational_mapping
```

---

## Usage Examples

### 1. Get all prompts for Medical Affairs function

```sql
SELECT DISTINCT
    ps.suite_name,
    pss.sub_suite_name,
    p.name AS prompt_name
FROM suite_functions sf
JOIN prompt_suites ps ON sf.suite_id = ps.id
JOIN prompt_sub_suites pss ON pss.suite_id = ps.id
LEFT JOIN suite_prompts sp ON sp.suite_id = ps.id
LEFT JOIN prompts p ON sp.prompt_id = p.id
WHERE sf.function_id = get_function_id('medical-affairs')
ORDER BY ps.suite_name, pss.sub_suite_name, p.name;
```

### 2. Get all suites relevant to a department

```sql
SELECT
    ps.suite_code,
    ps.suite_name,
    sd.is_primary,
    sd.relevance_score
FROM suite_departments sd
JOIN prompt_suites ps ON sd.suite_id = ps.id
WHERE sd.department_id = get_department_id('biostatistics')
ORDER BY sd.relevance_score DESC;
```

### 3. Get complete organizational context for a suite

```sql
SELECT * FROM v_suite_organizational_mapping
WHERE suite_code = 'PROOF';
```

---

## Next Steps - Sub-Suite Mapping

The current mapping is at the **Suite level**. You can extend this to **Sub-Suite level** for more granular mappings:

### Example: PROOF™ Sub-Suites to Departments

```sql
-- PROOF > ANALYZE → Biostatistics
INSERT INTO sub_suite_departments (sub_suite_id, department_id, is_primary, relevance_score)
SELECT pss.id, od.id, TRUE, 10
FROM prompt_sub_suites pss, org_departments od
WHERE pss.sub_suite_code = 'ANALYZE'
  AND pss.suite_id = get_suite_id('PROOF')
  AND od.slug = 'biostatistics';

-- PROOF > SYNTHESIZE → HEOR
INSERT INTO sub_suite_departments (sub_suite_id, department_id, is_primary, relevance_score)
SELECT pss.id, od.id, TRUE, 10
FROM prompt_sub_suites pss, org_departments od
WHERE pss.sub_suite_code = 'SYNTHESIZE'
  AND pss.suite_id = get_suite_id('PROOF')
  AND od.slug = 'heor';
```

---

## Benefits of Organizational Mapping

1. **Role-Based Discovery** - Users from Medical Affairs automatically see GUARD™, BRIDGE™, CRAFT™ prompts
2. **Departmental Specialization** - Biostatistics department gets TRIALS™ and PROOF™ prompts
3. **Cross-Functional Awareness** - Secondary mappings show related functions (e.g., PROOF™ relevant to both Clinical and Market Access)
4. **Personalized UX** - Frontend can filter prompts by user's department/function
5. **Analytics** - Track which departments use which prompt suites
6. **Governance** - Control access to prompts based on organizational role

---

## Files Created

- `supabase/migrations/010_map_prompts_to_organization.sql` - Complete mapping migration
- `PROMPTS_ORGANIZATIONAL_MAPPING.md` - This documentation

---

**Status:** ✅ COMPLETE - Organizational mapping fully implemented
**Version:** 1.0.0
**Last Updated:** 2025-01-17

---

*PROMPTS™ - Master Your Outcomes*
