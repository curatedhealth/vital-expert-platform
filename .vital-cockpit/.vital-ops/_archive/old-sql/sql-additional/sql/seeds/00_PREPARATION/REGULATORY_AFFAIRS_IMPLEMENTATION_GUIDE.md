# Regulatory Affairs Complete Role Structure
## Implementation Guide & Documentation

**Date:** 2025-11-17
**Version:** 1.0 - Complete & Normalized
**Total Roles:** 38 roles across 6 departments
**Function ID:** `43382f04-a819-4839-88c1-c1054d5ae071`
**Tenant ID:** `f7aa6fd4-0af9-4706-8b31-034f1f7accda`

---

## 📦 Deliverables Summary

### ✅ Files to Create

1. **CREATE_REGULATORY_DEPARTMENTS.sql**
   - Normalize existing departments (remove duplicates)
   - Create 6 standardized departments
   - Link to Regulatory function

2. **CREATE_REGULATORY_ROLES.sql**
   - Create all 38 roles
   - Map to departments
   - Set leadership levels, seniority, and metadata

3. **This Implementation Guide**
   - Complete documentation
   - Database schema alignment
   - Implementation instructions

---

## 🏗️ Structure Overview

### Total Coverage: 38 Roles Across 6 Departments

| Department | Roles | Leadership Levels | Focus Area |
|-----------|-------|------------------|------------|
| **1. Regulatory Leadership & Strategy** | 4 | L1-L3 | Executive leadership, strategy, governance |
| **2. Regulatory Submissions & Operations** | 9 | L3-L7 | NDA, BLA, MAA submissions, regulatory writing |
| **3. Regulatory Intelligence & Policy** | 6 | L4-L7 | Intelligence, policy tracking, strategic insights |
| **4. CMC Regulatory Affairs** | 7 | L4-L7 | Chemistry, Manufacturing, Controls |
| **5. Global Regulatory Affairs** | 6 | L3-L6 | Regional regulatory (US, EU, APAC, LatAm) |
| **6. Regulatory Compliance & Systems** | 6 | L4-L7 | Compliance, labeling, regulatory systems |
| **TOTAL** | **38** | **L1-L7** | **Complete Regulatory Function** |

---

## 📊 Role Distribution

### By Leadership Level

| Level | Description | Count | % |
|-------|-------------|-------|---|
| L1 | Chief Regulatory Officer | 1 | 2.6% |
| L2 | SVP/EVP Regulatory | 1 | 2.6% |
| L3 | VP/Head of Department | 6 | 15.8% |
| L4 | Director | 9 | 23.7% |
| L5 | Senior Manager | 9 | 23.7% |
| L6 | Manager | 8 | 21.1% |
| L7 | Specialist/IC | 4 | 10.5% |

### By Seniority Level

| Seniority | Count | % |
|-----------|-------|---|
| Executive | 2 | 5.3% |
| Director | 9 | 23.7% |
| Senior | 15 | 39.5% |
| Mid | 8 | 21.1% |
| Entry | 4 | 10.5% |

---

## 📋 Complete Department & Role Breakdown

### Department 1: Regulatory Leadership & Strategy (4 roles)

**Leadership Level:** L1-L3
**Focus:** Executive leadership, regulatory strategy, governance, risk management

#### Roles:
1. **Chief Regulatory Officer (CRO)** - L1, Career 10
   - Reports to: CEO
   - Seniority: Executive
   - Scope: Global

2. **SVP/EVP Regulatory Affairs** - L2, Career 9
   - Reports to: CRO
   - Seniority: Executive
   - Scope: Global/Regional

3. **VP Regulatory Strategy** - L3, Career 8
   - Reports to: SVP Regulatory Affairs
   - Seniority: Director
   - Scope: Global

4. **Head of Regulatory Operations** - L3, Career 8
   - Reports to: SVP Regulatory Affairs
   - Seniority: Director
   - Scope: Global/Regional

---

### Department 2: Regulatory Submissions & Operations (9 roles)

**Leadership Level:** L3-L7
**Focus:** Regulatory submissions (NDA, BLA, MAA), regulatory writing, dossier management

#### Roles:
5. **VP Regulatory Submissions** - L3, Career 8
   - Reports to: SVP Regulatory Affairs
   - Seniority: Director
   - Scope: Global

6. **Regulatory Submissions Director** - L4, Career 7
   - Reports to: VP Regulatory Submissions
   - Seniority: Director
   - Scope: Regional

7. **Senior Regulatory Submissions Manager** - L5, Career 6
   - Reports to: Regulatory Submissions Director
   - Seniority: Senior
   - Scope: Product/TA

8. **Regulatory Submissions Manager** - L5, Career 6
   - Reports to: Regulatory Submissions Director
   - Seniority: Senior
   - Scope: Product

9. **Senior Regulatory Writer** - L6, Career 5
   - Reports to: Submissions Manager
   - Seniority: Senior
   - Scope: Product

10. **Regulatory Writer** - L6, Career 4
    - Reports to: Submissions Manager
    - Seniority: Mid
    - Scope: Product

11. **Regulatory Publishing Manager** - L5, Career 6
    - Reports to: VP Regulatory Submissions
    - Seniority: Senior
    - Scope: Operations

12. **Regulatory Document Specialist** - L6, Career 4
    - Reports to: Publishing Manager
    - Seniority: Mid
    - Scope: Operations

13. **Regulatory Coordinator** - L7, Career 3
    - Reports to: Submissions Manager
    - Seniority: Entry
    - Scope: Support

---

### Department 3: Regulatory Intelligence & Policy (6 roles)

**Leadership Level:** L4-L7
**Focus:** Regulatory intelligence, policy monitoring, strategic insights, competitive intelligence

#### Roles:
14. **Regulatory Intelligence Director** - L4, Career 7
    - Reports to: VP Regulatory Strategy
    - Seniority: Director
    - Scope: Global

15. **Senior Regulatory Intelligence Manager** - L5, Career 6
    - Reports to: Regulatory Intelligence Director
    - Seniority: Senior
    - Scope: Global/Regional

16. **Regulatory Intelligence Manager** - L5, Career 6
    - Reports to: Regulatory Intelligence Director
    - Seniority: Senior
    - Scope: Regional

17. **Regulatory Policy Analyst - Senior** - L6, Career 5
    - Reports to: Intelligence Manager
    - Seniority: Senior
    - Scope: Regional

18. **Regulatory Policy Analyst** - L6, Career 4
    - Reports to: Intelligence Manager
    - Seniority: Mid
    - Scope: Regional

19. **Regulatory Intelligence Specialist** - L7, Career 3
    - Reports to: Intelligence Manager
    - Seniority: Entry
    - Scope: Support

---

### Department 4: CMC Regulatory Affairs (7 roles)

**Leadership Level:** L4-L7
**Focus:** Chemistry, Manufacturing, Controls regulatory strategy and submissions

#### Roles:
20. **CMC Regulatory Affairs Director** - L4, Career 7
    - Reports to: VP Regulatory Submissions
    - Seniority: Director
    - Scope: Global

21. **Senior CMC Regulatory Manager** - L5, Career 6
    - Reports to: CMC Regulatory Director
    - Seniority: Senior
    - Scope: Product/Region

22. **CMC Regulatory Manager** - L5, Career 6
    - Reports to: CMC Regulatory Director
    - Seniority: Senior
    - Scope: Product

23. **Senior CMC Regulatory Specialist** - L6, Career 5
    - Reports to: CMC Regulatory Manager
    - Seniority: Senior
    - Scope: Product

24. **CMC Regulatory Specialist** - L6, Career 4
    - Reports to: CMC Regulatory Manager
    - Seniority: Mid
    - Scope: Product

25. **CMC Regulatory Associate** - L7, Career 3
    - Reports to: CMC Regulatory Specialist
    - Seniority: Entry
    - Scope: Support

26. **CMC Technical Writer** - L6, Career 4
    - Reports to: CMC Regulatory Manager
    - Seniority: Mid
    - Scope: Documentation

---

### Department 5: Global Regulatory Affairs (6 roles)

**Leadership Level:** L3-L6
**Focus:** Regional regulatory strategy (US FDA, EU EMA, APAC PMDA, LatAm ANVISA, etc.)

#### Roles:
27. **Head of US Regulatory Affairs** - L3, Career 8
    - Reports to: SVP Regulatory Affairs
    - Seniority: Director
    - Scope: US/FDA

28. **Head of EU Regulatory Affairs** - L3, Career 8
    - Reports to: SVP Regulatory Affairs
    - Seniority: Director
    - Scope: EU/EMA

29. **US Regulatory Affairs Director** - L4, Career 7
    - Reports to: Head of US Regulatory
    - Seniority: Director
    - Scope: US/FDA

30. **EU Regulatory Affairs Director** - L4, Career 7
    - Reports to: Head of EU Regulatory
    - Seniority: Director
    - Scope: EU/EMA

31. **APAC Regulatory Affairs Manager** - L5, Career 6
    - Reports to: SVP Regulatory Affairs
    - Seniority: Senior
    - Scope: APAC (PMDA, NMPA, etc.)

32. **LatAm Regulatory Affairs Manager** - L5, Career 6
    - Reports to: SVP Regulatory Affairs
    - Seniority: Senior
    - Scope: Latin America (ANVISA, COFEPRIS)

---

### Department 6: Regulatory Compliance & Systems (6 roles)

**Leadership Level:** L4-L7
**Focus:** Labeling, advertising review, regulatory compliance, regulatory systems

#### Roles:
33. **Regulatory Compliance Director** - L4, Career 7
    - Reports to: Head of Regulatory Operations
    - Seniority: Director
    - Scope: Global

34. **Regulatory Labeling Manager** - L5, Career 6
    - Reports to: Regulatory Compliance Director
    - Seniority: Senior
    - Scope: Global/Regional

35. **Regulatory Compliance Manager** - L5, Career 6
    - Reports to: Regulatory Compliance Director
    - Seniority: Senior
    - Scope: Regional

36. **Regulatory Labeling Specialist** - L6, Career 5
    - Reports to: Labeling Manager
    - Seniority: Senior
    - Scope: Product

37. **Regulatory Systems Manager** - L5, Career 6
    - Reports to: Head of Regulatory Operations
    - Seniority: Senior
    - Scope: Operations

38. **Regulatory Systems Specialist** - L7, Career 4
    - Reports to: Systems Manager
    - Seniority: Mid
    - Scope: Operations/IT

---

## 🗄️ Database Schema Alignment

### Core Tables Used

#### org_roles
All roles will be inserted into `org_roles` table with these key fields:
- `id` (UUID, auto-generated)
- `tenant_id` = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
- `function_id` = '43382f04-a819-4839-88c1-c1054d5ae071'
- `department_id` (links to org_departments)
- `name` (role name)
- `slug` (unique role slug)
- `description` (detailed description)
- `seniority_level` (executive, director, senior, mid, entry)
- `leadership_level` (L1-L7)
- `career_level` (1-10)
- `reports_to` (text, manager role name)
- `geographic_scope` (global, regional, national, etc.)
- Plus all other enhanced metadata fields

#### Junction Tables (Available in Schema)
Based on schema review, these junction tables are available:
- `role_countries` - Geographic coverage
- `role_company_sizes` - Applicable company sizes
- `role_company_types` - Applicable company types
- `role_credentials_required` - Required credentials (PharmD, PhD, etc.)
- `role_credentials_preferred` - Preferred credentials
- `role_internal_stakeholders` - Internal stakeholders
- `role_external_stakeholders` - External stakeholders (FDA, EMA, etc.)
- `role_technology_platforms` - Regulatory systems (Veeva Vault, ARIS, etc.)
- `role_kpis` - Key performance indicators
- `role_therapeutic_areas` - TA focus if applicable
- `role_key_activities` - Primary activities
- `role_prior_roles` - Career progression from
- `role_lateral_moves` - Alternative career paths

### JSONB Fields (Also Available)
- `geographic_regions` - JSONB array of regions
- `therapeutic_areas` - JSONB array of TAs
- `applicable_company_sizes` - JSONB array
- `applicable_company_types` - JSONB array
- `internal_stakeholders` - JSONB array
- `external_stakeholders` - JSONB array
- `compliance_responsibilities` - JSONB array
- `technology_platforms` - JSONB array

**Note:** We'll use both junction tables (for normalized queries) AND JSONB fields (for convenience) to ensure maximum flexibility.

---

## 🔧 Implementation Steps

### Phase 1: Database Preparation

#### Step 1.1: Normalize Existing Departments
```sql
-- Remove duplicate "Regulatory Submissions" department
-- Keep the one with more roles, delete the duplicate
-- Script: CREATE_REGULATORY_DEPARTMENTS.sql
```

#### Step 1.2: Create Missing Departments
Create 6 standardized departments:
1. Regulatory Leadership & Strategy
2. Regulatory Submissions & Operations
3. Regulatory Intelligence & Policy
4. CMC Regulatory Affairs
5. Global Regulatory Affairs
6. Regulatory Compliance & Systems

#### Step 1.3: Verify Junction Tables
All required junction tables already exist in schema.

---

### Phase 2: Role Creation

#### Step 2.1: Create All 38 Roles
```sql
-- Script: CREATE_REGULATORY_ROLES.sql
-- Insert all 38 roles with complete metadata
```

#### Step 2.2: Populate Junction Tables
For each role, populate:
- Geographic countries (US, EU, etc.)
- Company sizes (all sizes typically)
- Company types (innovator pharma primarily)
- Required credentials (PharmD, PhD, RAC, etc.)
- Internal stakeholders (R&D, Medical, Quality, Manufacturing, etc.)
- External stakeholders (FDA, EMA, PMDA, Health Canada, etc.)
- Technology platforms (Veeva Vault, ARIS, eCTD tools)

---

### Phase 3: Validation

#### Validation Queries

```sql
-- 1. Count roles by department
SELECT
  d.name as department,
  COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id
WHERE d.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
GROUP BY d.name
ORDER BY role_count DESC;

-- Expected: 6 departments with 4-9 roles each

-- 2. Verify total role count
SELECT COUNT(*) as total_roles
FROM org_roles
WHERE function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

-- Expected: 38

-- 3. Check leadership level distribution
SELECT
  leadership_level,
  COUNT(*) as count
FROM org_roles
WHERE function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
GROUP BY leadership_level
ORDER BY leadership_level;

-- Expected: L1(1), L2(1), L3(6), L4(9), L5(9), L6(8), L7(4)
```

---

## 📊 Regulatory Affairs Specifics

### Key External Stakeholders
- **FDA** (US Food & Drug Administration)
- **EMA** (European Medicines Agency)
- **PMDA** (Japan Pharmaceuticals and Medical Devices Agency)
- **Health Canada** (HPFB)
- **ANVISA** (Brazil)
- **COFEPRIS** (Mexico)
- **NMPA** (China National Medical Products Administration)
- **TGA** (Australia Therapeutic Goods Administration)
- **HTA Bodies** (NICE, IQWIG, HAS, etc.)

### Key Internal Stakeholders
- R&D / Clinical Development
- Quality Assurance
- Manufacturing / CMC
- Medical Affairs
- Commercial / Marketing
- Legal
- Pharmacovigilance
- Project Management

### Technology Platforms
- **Veeva Vault** (Regulatory Information Management)
- **ARIS** (Publishing & eCTD)
- **Lorenz Docubridge** (Publishing)
- **Adobe FrameMaker** (Authoring)
- **ZINC MAPS** (Submission tracking)
- **Oracle Argus** (Safety integration)
- **MasterControl** (Document management)
- **TrackWise** (Change control)

### Required/Preferred Credentials
- **RAC** (Regulatory Affairs Certification)
- **PharmD** (Doctor of Pharmacy)
- **PhD** (Life Sciences)
- **MS** (Regulatory Science, Pharmacy, Life Sciences)
- **BS** (Life Sciences, Chemistry)
- **MBA** (for leadership roles)

### Compliance Requirements
- **GxP** (Good Clinical/Laboratory/Manufacturing Practices)
- **CFR Title 21** (US Code of Federal Regulations)
- **ICH Guidelines** (E2, E3, M4, Q series)
- **EU Directives** (2001/83/EC, etc.)
- **Data Integrity** (ALCOA+ principles)
- **Labeling Regulations**
- **Advertising & Promotion Compliance**

---

## ✨ Key Features

### ✅ Aligned with Current Schema
- Uses existing org_roles table structure
- Leverages junction tables for normalization
- Uses JSONB fields where appropriate
- Follows existing patterns from Medical Affairs and Market Access

### ✅ Comprehensive Coverage
- 38 roles across 6 departments
- Leadership levels L1-L7
- Career levels 3-10
- All seniority levels represented

### ✅ Industry-Standard Taxonomy
- Based on real pharma regulatory organization structures
- Covers all key regulatory functions
- Regional differentiation (US, EU, APAC, LatAm)
- CMC, Submissions, Intelligence, Compliance

### ✅ Ready for Persona Mapping
- Clear role definitions
- Proper hierarchy
- 3-5 personas per role (target)
- Behavioral variation support

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ Review this implementation guide
2. ⏳ Execute CREATE_REGULATORY_DEPARTMENTS.sql
3. ⏳ Execute CREATE_REGULATORY_ROLES.sql
4. ⏳ Validate with verification queries
5. ⏳ Begin persona collection (target: 100-120 personas)

### Future Enhancements
- Add enhanced metadata (KPIs, travel requirements, etc.)
- Populate all junction tables
- Create persona variations
- Map to VPANES framework
- Configure AI agents

---

## 📞 Documentation

### File Structure
```
/sql/seeds/00_PREPARATION/
├── REGULATORY_AFFAIRS_IMPLEMENTATION_GUIDE.md (this file)
├── CREATE_REGULATORY_DEPARTMENTS.sql
├── CREATE_REGULATORY_ROLES.sql
└── VALIDATE_REGULATORY_STRUCTURE.sql
```

---

**Version:** 1.0
**Date:** 2025-11-17
**Status:** ✅ Ready for Implementation
**Total Roles:** 38 across 6 departments
**Total Personas Target:** 100-120 (3-5 per role)

---

END OF IMPLEMENTATION GUIDE
