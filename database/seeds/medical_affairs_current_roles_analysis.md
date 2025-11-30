# Medical Affairs Current Roles Analysis

**Date:** 2025-11-22
**Total Roles:** 100 Medical Affairs roles
**Status:** Basic structure exists, needs enrichment

---

## 📊 Role Breakdown by Category

###  **Field Medical (MSL-related): 15 roles**
- Global Medical Science Liaison (MSL)
- Regional Medical Science Liaison (MSL)
- Local Medical Science Liaison (MSL)
- Global Senior MSL
- Regional Senior MSL
- Local Senior MSL
- Global Field Team Lead
- Regional Field Team Lead
- Local Field Team Lead
- Global Medical Scientific Manager
- Regional Medical Scientific Manager
- Local Medical Scientific Manager
- Global Field Medical Director
- Regional Field Medical Director
- Local Field Medical Director

### **Medical Information: 18 roles**
- Global Medical Information Manager
- Regional Medical Information Manager
- Local Medical Information Manager
- Global Medical Info Scientist
- Regional Medical Info Scientist
- Local Medical Info Scientist
- Regional Medical Information Specialist
- Local Medical Information Specialist
- Global Medical Info Associate
- Regional Medical Info Associate
- Local Medical Info Associate
- Global MI Operations Lead
- Regional MI Operations Lead
- Local MI Operations Lead
- Global Medical Communications Specialist
- Regional Medical Communications Specialist
- Local Medical Communications Specialist
- (Plus Scientific Communications roles below)

### **Scientific Communications & Publications: 18 roles**
- Global Scientific Communications Manager
- Regional Scientific Communications Manager
- Local Scientific Communications Manager
- Global Scientific Affairs Lead
- Regional Scientific Affairs Lead
- Local Scientific Affairs Lead
- Global Publications Manager
- Regional Publications Manager
- Local Publications Manager
- Global Publications Lead
- Regional Publications Lead
- Local Publications Lead
- Global Publication Planner
- Regional Publication Planner
- Local Publication Planner
- Global Medical Writer
- Regional Medical Writer
- Local Medical Writer

### **Medical Education: 12 roles**
- Global Medical Education Manager
- Regional Medical Education Manager
- Local Medical Education Manager
- Global Medical Education Strategist
- Regional Medical Education Strategist
- Local Medical Education Strategist
- Global Digital Medical Education Lead
- Regional Digital Medical Education Lead
- Local Digital Medical Education Lead
- Global Scientific Trainer
- Regional Scientific Trainer
- Local Scientific Trainer

### **HEOR & Evidence: 9 roles**
- Global Real-World Evidence Lead
- Regional Real-World Evidence Lead
- Local Real-World Evidence Lead
- Global HEOR Project Manager
- Regional HEOR Project Manager
- Local HEOR Project Manager
- Global Economic Modeler
- Regional Economic Modeler
- (1 role missing - likely local)

### **Clinical Operations Support: 9 roles**
- Global Clinical Operations Liaison
- Regional Clinical Operations Liaison
- Local Clinical Operations Liaison
- Global Medical Liaison Clinical Trials
- Regional Medical Liaison Clinical Trials
- Local Medical Liaison Clinical Trials
- Global Clinical Ops Support Analyst
- Regional Clinical Ops Support Analyst
- Local Clinical Ops Support Analyst

### **Governance & Compliance: 9 roles**
- Global Medical Governance Officer
- Regional Medical Governance Officer
- Local Medical Governance Officer
- Global Medical Excellence Lead
- Regional Medical Excellence Lead
- Local Medical Excellence Lead
- Global Compliance Specialist
- Regional Compliance Specialist
- Local Compliance Specialist

### **Leadership: 10 roles**
- Global Chief Medical Officer
- Regional Chief Medical Officer
- Local Chief Medical Officer
- Global VP Medical Affairs
- Regional VP Medical Affairs
- Local VP Medical Affairs
- Global Medical Affairs Director
- Regional Medical Affairs Director
- Local Medical Affairs Director
- Global Senior Medical Director
- Regional Senior Medical Director
- Local Senior Medical Director

---

## 🔍 Key Observations

### **1. Pattern: Global → Regional → Local**
All roles exist in 3 geographic scopes:
- **Global:** 33 roles
- **Regional:** 33 roles
- **Local:** 34 roles

This suggests a highly matrixed organization with geographic tiers.

### **2. Current Data Status**

**What EXISTS:**
- ✅ Role names
- ✅ Geographic scope (global/regional/local)
- ✅ Role category (field/office/hybrid)
- ✅ Seniority level (entry/mid/senior/director/executive/c_suite)
- ✅ Leadership level (all marked as "individual_contributor")
- ✅ Department IDs and Function IDs (linked to org structure)

**What's MISSING (all null):**
- ❌ descriptions
- ❌ role_type
- ❌ years_experience_min/max
- ❌ travel_percentage_min/max
- ❌ budget fields
- ❌ team size
- ❌ reports_to_role_id
- ❌ typical_education_level
- ❌ work_location_model
- ❌ typical_work_pattern
- ❌ required_skills
- ❌ required_certifications
- ❌ GxP classifications
- ❌ regulatory frameworks
- ❌ KPIs
- ❌ therapeutic areas

### **3. Data Quality Issues**

**Issue #1: Leadership Level Inconsistency**
- All roles marked as "individual_contributor"
- But roles like "Chief Medical Officer" and "VP Medical Affairs" are clearly leadership
- **Fix needed:** Update leadership_level for Director+ roles

**Issue #2: Missing Reporting Relationships**
- reports_to_role_id is null for all roles
- **Fix needed:** Map reporting hierarchy

**Issue #3: No Enrichment Data**
- All the metadata we need for persona generation is missing
- **Fix needed:** Enrich with template data

---

## 🎯 Enrichment Strategy

### **Phase 1: Core Field Medical (Priority 1) - 15 roles**

**Focus on MSL roles first** - highest headcount, compliance-critical

**Roles to enrich:**
1. Global/Regional/Local Medical Science Liaison (MSL) - 3 roles
2. Global/Regional/Local Senior MSL - 3 roles
3. Global/Regional/Local Field Team Lead - 3 roles
4. Global/Regional/Local Medical Scientific Manager - 3 roles
5. Global/Regional/Local Field Medical Director - 3 roles

**Time estimate:** 6-8 hours (can use template examples)

**Enrichment data needed:**
- Description
- Years experience (3-8 for MSL, 5-12 for Senior MSL, etc.)
- Travel percentage (50-70% for MSL)
- Required skills (scientific communication, KOL management, etc.)
- Required certifications (PharmD/PhD/MD)
- GxP critical (true - GCP, GVP)
- Regulatory frameworks (PhRMA Code, ICH GCP, Sunshine Act)
- KPIs (KOL interactions, insights submitted, quality scores)
- Reporting relationships

### **Phase 2: Medical Information (Priority 2) - 18 roles**

**Focus on MI Specialist/Manager roles** - regulatory requirement

**Roles to enrich:**
1. Medical Information Specialist/Manager/Scientist - 9 roles
2. Medical Info Associate - 3 roles
3. MI Operations Lead - 3 roles
4. Medical Communications Specialist - 3 roles

**Time estimate:** 4-6 hours

**Enrichment data needed:**
- Response time KPIs (24-48 hours)
- GVP critical
- Systems (MI response database, safety database)
- Inquiry volume targets

### **Phase 3: Leadership (Priority 3) - 10 roles**

**Focus on decision-makers** - budget authority, strategic direction

**Roles to enrich:**
1. CMO (3 geographic scopes)
2. VP Medical Affairs (3)
3. Medical Affairs Director (3)
4. Senior Medical Director (1 - global only?)

**Time estimate:** 3-4 hours

**Enrichment data needed:**
- Budget authority (significant for VP/CMO)
- Team size (direct reports)
- Strategic KPIs
- Board-level reporting

### **Phase 4: Specialists (Priority 4) - 57 remaining roles**

**All other roles** - lower priority, can leverage Phase 1-3 reference data

**Time estimate:** 10-12 hours

---

## 📋 Recommended Approach

### **Option A: Template-Based Enrichment (Recommended)**

**Use the Medical Affairs template** I created with 5 complete examples:
1. Map each of your 100 roles to one of the template examples
2. Copy the enrichment data
3. Adjust for geographic scope (global roles = more travel, etc.)
4. Generate UPDATE SQL statements

**Advantages:**
- Faster (2-3 days vs. 2-3 weeks)
- Consistent data structure
- Industry-standard values pre-populated

**Time: 12-16 hours total**

### **Option B: Custom Data Collection**

**Interview incumbents for each role:**
1. Use DATA_COLLECTION_GUIDE.md
2. Fill out templates role-by-role
3. Generate enrichment SQL

**Advantages:**
- More accurate to your organization
- Validates assumptions

**Time: 40-60 hours total**

### **Option C: Hybrid (Best)**

**Combine both approaches:**
1. Use templates for 80% of data
2. Interview for 5-10 key roles to validate
3. Adjust template values based on interviews
4. Apply to all 100 roles

**Time: 16-20 hours total**

---

## 🚀 Next Steps - What I Need From You

### **1. Confirm Approach**
Which option do you want to pursue?
- [ ] Option A: Template-based (fastest)
- [ ] Option B: Custom data collection (most accurate)
- [ ] Option C: Hybrid (recommended)

### **2. Provide Department Mapping**
I need to know what these department IDs map to:
- `ca5503b6-7821-4f65-8162-2b75952d5363` = Field Medical?
- `2b320eab-1758-42d7-adfa-7f49c12cdf40` = Medical Information?
- `9871d82a-631a-4cf7-9a00-1ab838a45c3e` = Scientific Communications?
- `9e1759d6-1f66-484e-b174-1ff68150697d` = Medical Education?
- `04723b72-04b3-40fe-aa1f-2e834b719b03` = HEOR?
- `a8018f58-6a8a-4a09-92b2-b1667b1148c5` = Clinical Operations Support?
- `bffee306-7ed9-4ea9-aa1d-9d3d01c46741` = Compliance & Governance?
- `5d5ded20-c30a-48f1-844c-fc9f80fcaacb` = Publications?
- `23ee308e-b415-4471-9605-d50c69d33209` = Medical Affairs Leadership?

### **3. Prioritize Roles**
Of the 100 roles, which are most important to enrich first?
- Do you have actual employees in all 100 roles?
- Which roles have the highest headcount?
- Which roles are safety/compliance-critical?

### **4. Validate Geographic Model**
- Is "Global" = worldwide responsibility?
- Is "Regional" = multi-country (e.g., EMEA, APAC, Americas)?
- Is "Local" = single country?

---

## 💡 My Recommendation

**Start with Option A (Template-Based) for Phase 1 only:**

1. I'll create enrichment SQL for the **15 Field Medical roles** using the template
2. You review and validate with 1-2 MSL incumbents
3. If data looks good, we proceed with Phases 2-4
4. If adjustments needed, we refine and continue

**Timeline:**
- **Today:** I generate enrichment SQL for 15 Field Medical roles
- **Tomorrow:** You review/validate
- **Day 3:** I generate remaining 85 roles
- **Day 4:** Final review and deployment

**Deliverable:**
- UPDATE SQL statements that populate all missing fields for 100 roles
- Ready to execute in Supabase SQL editor

---

## ✅ What To Do Right Now

**Share with me:**
1. Department ID → Department Name mapping (run query in Supabase)
2. Which approach you want (A, B, or C)
3. Any roles you want to prioritize or skip

**Then I'll:**
1. Generate enrichment UPDATE SQL for your 100 roles
2. Include all missing metadata (skills, KPIs, GxP, regulatory, etc.)
3. Provide you SQL you can run directly in Supabase editor

**Questions?**
- Do all 100 roles have actual employees, or are some aspirational?
- What's your typical MSL territory size (for validation)?
- Do you use Veeva CRM for Field Medical?
