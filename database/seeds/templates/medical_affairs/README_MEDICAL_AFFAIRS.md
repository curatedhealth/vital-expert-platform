# Medical Affairs Role Enrichment - Quick Start Guide

**Focus:** Medical Affairs Function Only
**Timeline:** 2-4 weeks
**Target:** 8-12 core Medical Affairs roles
**Effort:** 10-15 hours total

---

## 🎯 Overview

This specialized package helps you enrich **Medical Affairs roles only** with comprehensive metadata. It's faster than the generic approach because:

- Pre-populated with Medical Affairs-specific options
- Includes 5 complete role examples (MSL, Senior MSL, MSL Manager, MI Specialist, Medical Director)
- References industry-standard frameworks (MAPS, PhRMA Code, ICH GCP)
- Focused on the 12-15 most common Medical Affairs roles

---

## 📦 What's in This Package

### **1. MEDICAL_AFFAIRS_ORG_STRUCTURE.md**
- Typical Medical Affairs organization chart
- 12-15 core roles to enrich
- Prioritization framework (which roles to do first)
- Medical Affairs-specific KPIs, workflows, and processes
- Data collection strategy

### **2. medical_affairs_roles_template.json**
- Specialized JSON template with Medical Affairs pre-populated options
- **5 complete examples:**
  - Medical Science Liaison (MSL)
  - Senior Medical Science Liaison
  - MSL Manager
  - Medical Information Specialist
  - Medical Director
- Empty template for additional roles
- Medical Affairs reference data (therapeutic areas, competencies, regulatory frameworks, systems)

### **3. This README**
- Quick start instructions
- Step-by-step workflow
- Time estimates
- Success checklist

---

## ⚡ 3-Step Quick Start

### **Step 1: Review Examples (30 minutes)**

1. Open `medical_affairs_roles_template.json`
2. Review the 5 complete role examples
3. Note which roles match your organization
4. Identify which roles you want to add

**Key Observations:**
- MSL example shows all fields filled in
- Reference data is pre-populated (therapeutic areas, competencies, systems)
- Regulatory frameworks are already listed
- KPIs are specific to each role type

### **Step 2: Customize for Your Organization (2-4 hours)**

**Option A: Use Examples As-Is (Fastest)**
- If your Medical Affairs structure is typical, use the 5 examples with minimal edits
- Just update therapeutic areas and any company-specific details
- **Time: 2 hours**

**Option B: Add Your Roles (More Complete)**
- Start with the 5 examples
- Copy the empty template for additional roles
- Fill in details specific to your organization
- **Time: 4-6 hours**

**Roles Included in Examples:**
1. ✅ Medical Science Liaison
2. ✅ Senior Medical Science Liaison
3. ✅ MSL Manager
4. ✅ Medical Information Specialist
5. ✅ Medical Director

**Common Additional Roles to Add:**
6. Regional Medical Director
7. VP Medical Affairs
8. Senior MI Specialist
9. Medical Communications Manager
10. Medical Writer
11. HEOR Director
12. Associate Medical Director

### **Step 3: Submit for SQL Generation (1 hour)**

1. Save your completed `medical_affairs_roles_template.json`
2. Validate JSON syntax (use jsonlint.com)
3. Share the file
4. Receive SQL seed files
5. Review and deploy

---

## 📋 Detailed Workflow

### **Week 1: Preparation & Review**

**Monday (1 hour):**
- [ ] Read `MEDICAL_AFFAIRS_ORG_STRUCTURE.md`
- [ ] Review your actual Medical Affairs org chart
- [ ] Identify which roles you have (vs. template)
- [ ] Prioritize which roles to enrich first

**Tuesday (1 hour):**
- [ ] Open `medical_affairs_roles_template.json`
- [ ] Review all 5 complete examples
- [ ] Compare to your job descriptions
- [ ] Note differences/gaps

**Wednesday-Thursday (2-3 hours):**
- [ ] Interview 2-3 MSLs (if you have them)
- [ ] Interview 1 MI Specialist
- [ ] Interview 1 Medical Director
- [ ] Use questions from `DATA_COLLECTION_GUIDE.md` (in parent directory)

**Friday (1 hour):**
- [ ] Compile interview notes
- [ ] Identify any unique aspects of your Medical Affairs organization
- [ ] Plan customizations needed

### **Week 2: Template Completion**

**Monday-Tuesday (4-6 hours):**
- [ ] Customize the 5 example roles for your organization
- [ ] Adjust therapeutic areas to match your products
- [ ] Update KPIs if different from examples
- [ ] Modify systems to match what you actually use
- [ ] Add any company-specific regulatory requirements

**Wednesday-Thursday (2-4 hours):**
- [ ] Add additional roles (if needed)
  - Copy empty template
  - Use examples as guide
  - Fill in all required fields
- [ ] Common additions:
  - VP Medical Affairs
  - Regional Medical Director
  - Medical Writer
  - HEOR roles

**Friday (1 hour):**
- [ ] Review all roles for consistency
- [ ] Validate JSON syntax
- [ ] Check that unique_ids are consistent
- [ ] Ensure required fields are filled

### **Week 3: Validation**

**Monday-Tuesday (2 hours):**
- [ ] Share draft with Medical Affairs leadership
- [ ] Get feedback from role incumbents
- [ ] Review with Compliance/Legal (for regulatory accuracy)
- [ ] Check with HR (for career levels, compensation)

**Wednesday-Thursday (2 hours):**
- [ ] Incorporate feedback
- [ ] Final quality check
- [ ] Resolve any inconsistencies
- [ ] Add notes/metadata for context

**Friday (1 hour):**
- [ ] Final JSON validation
- [ ] Prepare submission with context notes
- [ ] Submit completed template
- [ ] Await SQL generation

### **Week 4: Deployment**

**Monday-Tuesday:**
- [ ] Review generated SQL
- [ ] Test in staging database
- [ ] Validate queries return expected data

**Wednesday-Thursday:**
- [ ] Deploy to production
- [ ] Smoke test critical queries
- [ ] Validate persona generation works

**Friday:**
- [ ] Document what was deployed
- [ ] Plan next phase (if expanding beyond Medical Affairs)
- [ ] Gather feedback from users

---

## 🎯 Role Prioritization

### **Priority 1: Field Medical (Start Here)**

**Roles to Complete:**
1. Medical Science Liaison (MSL)
2. Senior Medical Science Liaison
3. MSL Manager

**Why First:**
- Largest Medical Affairs team (typically)
- Highest compliance risk (HCP interactions)
- Examples already complete in template

**Time Required:** 3-4 hours (including interviews)

### **Priority 2: Medical Information**

**Roles to Complete:**
4. Medical Information Specialist
5. Senior MI Specialist (if you have this role)

**Why Second:**
- Regulatory requirement (must respond to inquiries)
- Safety reporting responsibility
- Different workflow from Field Medical

**Time Required:** 2-3 hours

### **Priority 3: Leadership**

**Roles to Complete:**
6. Medical Director
7. VP Medical Affairs
8. Regional Medical Director (if applicable)

**Why Third:**
- Strategic importance
- Budget authority
- Lower headcount (less urgency)

**Time Required:** 2-3 hours

### **Priority 4: Specialists (Optional)**

**Roles to Complete:**
9. Medical Writer
10. Medical Communications Manager
11. HEOR Director
12. Associate Medical Director

**Why Last:**
- Smaller teams
- Specialized functions
- Can leverage reference data from Priorities 1-3

**Time Required:** 3-4 hours

---

## ✅ Success Checklist

### **Before You Start**

- [ ] Read `MEDICAL_AFFAIRS_ORG_STRUCTURE.md`
- [ ] Have access to current Medical Affairs job descriptions
- [ ] Have access to Veeva CRM (for KPI data)
- [ ] Have Medical Affairs SOPs available
- [ ] Identified 2-3 interview subjects per role

### **Template Completion**

- [ ] All 5 example roles reviewed and customized
- [ ] Therapeutic areas match your company's products
- [ ] Systems match what Medical Affairs actually uses
- [ ] KPIs are realistic and measurable
- [ ] Regulatory frameworks are accurate
- [ ] GxP classifications correct
- [ ] Reporting relationships match org chart
- [ ] JSON syntax validates without errors

### **Validation**

- [ ] Reviewed by Medical Affairs leadership
- [ ] Validated by role incumbents
- [ ] Compliance/Legal sign-off (for regulatory accuracy)
- [ ] HR confirmation (career levels, compensation bands)

### **Deployment**

- [ ] SQL generated successfully
- [ ] Tested in staging
- [ ] Deployed to production
- [ ] Personas generated from enriched roles
- [ ] AI agents can access role metadata

---

## 💡 Tips for Success

### **Use the Examples**

Don't start from scratch! The 5 complete examples cover 70-80% of most Medical Affairs organizations. Just customize them for your company.

### **Start Small**

Begin with the 5 examples only. You can always add more roles later. Perfect is the enemy of good.

### **Leverage Industry Standards**

- **MSL Competencies:** Use MAPS (MSL Society) framework
- **Regulatory:** PhRMA Code, ICH GCP are pre-populated
- **KPIs:** Examples include industry-standard metrics

### **Interview Smart**

- 30-45 minutes per role incumbent
- Focus on "what makes this role unique?"
- Ask for specific KPIs and targets
- Validate regulatory requirements

### **Validate with Real Data**

- Pull Veeva CRM interaction data for MSL KPIs
- Check MI response time reports
- Review actual congress attendance patterns
- Confirm travel percentages from expense reports

---

## 🔍 Common Customizations Needed

### **Therapeutic Areas**

The template includes common TAs. Update to match your products:
```json
"therapeutic_areas": [
  "Oncology",
  "Immunology",
  "[Your TA 1]",
  "[Your TA 2]"
]
```

### **Systems**

Update to match your actual tech stack:
```json
"medical_affairs_systems": [
  "Veeva CRM",              // Most companies have this
  "Medical Insights Platform",  // May be different name
  "Safety Database",        // Argus? Oracle AE? Other?
  "[Your specific systems]"
]
```

### **KPI Targets**

Adjust targets based on your actual data:
```json
{
  "kpi_name": "Tier 1 KOL interactions",
  "target_value": "100-120 per year",  // Update to your target
  "measurement_frequency": "Monthly",
  "data_source": "Veeva CRM"
}
```

### **Reporting Relationships**

Match your org chart:
```json
"hierarchy": {
  "reports_to_unique_id": "ROLE-MA-MSLMGR-001",  // Update if different
  "reports_to_role_name": "MSL Manager",
  "typical_direct_reports": 0
}
```

---

## 📊 What You'll Get

After submission, you'll receive SQL that populates:

### **1. org_roles Table**
- All Medical Affairs roles with full metadata
- Pharma-specific fields (GxP, regulatory, therapeutic areas)
- Career progression, KPIs, work environment

### **2. Reference Tables**
- Medical Affairs competencies
- Regulatory frameworks
- Systems and tools
- Therapeutic areas
- Stakeholder types

### **3. Junction Tables**
- Role ↔ Skills mappings
- Role ↔ Competencies
- Role ↔ Regulatory frameworks
- Role ↔ Therapeutic areas
- Role ↔ Systems

### **4. Integration-Ready**
- Personas can be auto-generated from roles
- AI agents can access role context
- Workforce planning reports enabled
- Skills gap analysis possible

---

## 🆘 Troubleshooting

### **"I don't have an MSL team"**

No problem! Focus on the roles you DO have. The template is flexible. Just skip the MSL roles and use the MI Specialist or Medical Director examples as your starting point.

### **"Our Medical Affairs structure is different"**

That's expected! Use the examples as inspiration, but customize freely. The key is to capture YOUR organization's reality.

### **"I don't know the KPI targets"**

Ask managers or pull actual performance data. If not available, use the template defaults as placeholders and note that they need validation.

### **"What if we use different systems than Veeva?"**

Update the systems list to match what you actually use. The template is just a starting point.

### **"JSON syntax errors"**

Use jsonlint.com to find and fix syntax errors (usually missing commas or quotes).

---

## 📈 Time Estimates by Role

| Role | Template Status | Customization Time | Interview Time | Total |
|------|----------------|-------------------|----------------|-------|
| MSL | Complete example | 15 min | 30 min | 45 min |
| Senior MSL | Complete example | 15 min | 30 min | 45 min |
| MSL Manager | Complete example | 15 min | 30 min | 45 min |
| MI Specialist | Complete example | 15 min | 30 min | 45 min |
| Medical Director | Complete example | 15 min | 30 min | 45 min |
| Regional Medical Director | Empty template | 30 min | 30 min | 60 min |
| VP Medical Affairs | Empty template | 30 min | 30 min | 60 min |
| Medical Writer | Empty template | 30 min | 30 min | 60 min |

**Total for 5 examples:** ~4 hours (including interviews)
**Total for 8 roles:** ~7 hours

---

## 🎓 Resources

### **Included in This Package**
- `MEDICAL_AFFAIRS_ORG_STRUCTURE.md` - Org structure and workflows
- `medical_affairs_roles_template.json` - Template with examples
- This README

### **In Parent Directory**
- `DATA_COLLECTION_GUIDE.md` - Interview questions and techniques
- `role_enrichment_template.json` - Generic template (if you need more fields)
- `reference_data_template.json` - If you want to add more reference data

### **External Resources**
- MSL Society (MAPS) competency framework
- PhRMA Code on HCP Interactions
- ICH GCP E6 Guidelines
- Your company's Medical Affairs SOPs

---

## ✨ Next Steps

**Right Now:**
1. Open `medical_affairs_roles_template.json`
2. Review the MSL example
3. Decide: use as-is or customize?

**This Week:**
1. Interview 2-3 Medical Affairs team members
2. Customize the 5 example roles
3. Add 2-3 additional roles (optional)

**Next Week:**
1. Validate with stakeholders
2. Submit completed template
3. Receive SQL and deploy

**Questions?** Review `MEDICAL_AFFAIRS_ORG_STRUCTURE.md` for detailed Medical Affairs context.

**Ready?** Open the template and start customizing!
