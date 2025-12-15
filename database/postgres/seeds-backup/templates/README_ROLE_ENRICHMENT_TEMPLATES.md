# Role Enrichment Templates - User Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-22
**Owner:** VITAL Data Team

---

## 📋 Overview

This directory contains JSON templates for enriching pharmaceutical/biotech organizational roles with comprehensive metadata. These templates enable you to transform basic role definitions into rich, detailed role profiles that power AI agents, personas, and intelligent workflows.

## 🎯 What You'll Achieve

By completing these templates, you'll create:

1. **Rich Role Profiles** - Detailed descriptions with pharma-specific context
2. **Reference Data Libraries** - Master lists of competencies, certifications, KPIs, etc.
3. **Intelligent Mappings** - Connections between roles and organizational capabilities
4. **Database Seeds** - Production-ready SQL that populates your VITAL database

## 📁 Template Files

### 1. **quick_start_template.json** ⚡
**Best for:** Getting started quickly, pilot projects, proof of concept
**Time required:** 15-20 minutes per role
**Includes:** Essential role metadata only

**Start here if you:**
- Want to test the enrichment process with a few roles
- Need to show value quickly to stakeholders
- Are new to role data modeling
- Have limited time or resources

### 2. **role_enrichment_template.json** 🎯
**Best for:** Complete role enrichment, production deployment
**Time required:** 1-2 hours per role
**Includes:** Comprehensive role metadata across 15+ categories

**Use this when you:**
- Want the full power of role enrichment
- Have completed the quick start and are ready to expand
- Are enriching strategic/high-priority roles
- Need detailed data for AI agent development

### 3. **reference_data_template.json** 📚
**Best for:** Organizational master data
**Time required:** 4-8 hours total (one-time setup)
**Includes:** Master lists that all roles reference

**Complete this:**
- **FIRST** - Before filling out individual role templates
- **Once** - Then reuse across all roles
- **With SMEs** - Get input from HR, L&D, Compliance, Medical Affairs

---

## 🚀 Getting Started

### Quick Start Path (Recommended for First-Timers)

```
Day 1: Read this README
Day 2: Complete reference_data_template.json (basic items only)
Day 3: Fill out quick_start_template.json for 3-5 roles
Day 4: Review with stakeholders
Day 5: Share completed templates for SQL generation
```

### Comprehensive Path

```
Week 1: Stakeholder alignment + data collection planning
Week 2: Complete reference_data_template.json (all categories)
Week 3-4: Complete role_enrichment_template.json for 10-15 high-priority roles
Week 5: Review and validation
Week 6: SQL generation and database deployment
```

---

## 📝 Step-by-Step Instructions

### Step 1: Choose Your Approach

**Option A: Quick Start (Pilot)**
- Focus: 3-5 high-impact roles
- Template: quick_start_template.json
- Timeline: 1 week

**Option B: Comprehensive (Production)**
- Focus: 15-30 roles across all functions
- Templates: reference_data_template.json + role_enrichment_template.json
- Timeline: 4-6 weeks

### Step 2: Gather Your Data Sources

**For Reference Data:**
- [ ] Existing competency frameworks (from HR/L&D)
- [ ] Training course catalog
- [ ] Professional certification list
- [ ] KPI dashboard templates
- [ ] Regulatory compliance matrix
- [ ] Organizational chart
- [ ] Job family/career level definitions

**For Individual Roles:**
- [ ] Current job descriptions
- [ ] Performance review criteria
- [ ] Org chart (reporting relationships)
- [ ] Interviews with 2-3 role incumbents
- [ ] Subject matter expert validation

### Step 3: Complete Reference Data Template (FIRST!)

1. Open `reference_data_template.json`
2. Start with categories you already have data for:
   - Skills (if you have a skills matrix)
   - Certifications (professional requirements)
   - Training programs (from LMS)
   - Regulatory requirements (from compliance team)
3. Fill out basic items (you can expand later)
4. **Save unique IDs** - you'll use these in role templates

**Recommended Starter Set:**
- 20-30 skills
- 10-15 certifications
- 10-15 competencies
- 8-12 training programs
- 8-10 regulatory requirements
- 5-10 therapeutic areas

### Step 4: Complete Role Templates

**For Quick Start:**
1. Open `quick_start_template.json`
2. Delete the example MSL role
3. Copy the empty template for each role
4. Fill in fields (see template for help text)
5. Validate with someone in that role

**For Comprehensive:**
1. Open `role_enrichment_template.json`
2. Study the complete MSL example
3. Copy the example structure for each new role
4. Fill in all sections systematically
5. Use unique IDs from reference_data_template.json
6. Review each role with SMEs

### Step 5: Validate Your Data

**Data Quality Checklist:**
- [ ] All required fields completed
- [ ] Unique IDs follow naming convention
- [ ] Skills/certifications match reference data
- [ ] Experience ranges are realistic
- [ ] Travel percentages total makes sense
- [ ] KPIs are measurable and specific
- [ ] Regulatory requirements are accurate
- [ ] Role reviewed by current incumbent

**Common Mistakes to Avoid:**
- ❌ Skipping reference data template
- ❌ Making up unique IDs that don't match
- ❌ Copy-pasting without customizing
- ❌ Setting unrealistic KPI targets
- ❌ Missing required GxP classifications
- ❌ Forgetting to validate with SMEs

### Step 6: Share Completed Templates

Once validated, share your completed JSON files:

1. Save files with descriptive names:
   - `reference_data_YOURORG_2025-11-22.json`
   - `roles_medical_affairs_2025-11-22.json`
   - `roles_clinical_dev_2025-11-22.json`

2. Provide context:
   - Number of roles completed
   - Functions/departments covered
   - Validation approach used
   - Known gaps or questions

3. Request SQL generation:
   - Specify deployment timeline
   - Identify test vs. production environment
   - Note any custom requirements

---

## 💡 Best Practices

### Data Collection

1. **Start with What You Know**
   - Begin with roles in your own department
   - Leverage existing documentation
   - Don't try to be perfect on first pass

2. **Validate with Real People**
   - Interview 2-3 current role incumbents
   - Get manager perspective on expectations
   - Confirm KPIs and deliverables with leadership

3. **Think Pharma-Specific**
   - Always include GxP context
   - Specify regulatory requirements
   - Note therapeutic area focus
   - Include compliance considerations

4. **Plan for Evolution**
   - Roles change - plan for updates
   - Leave notes in metadata field
   - Document assumptions and sources

### Naming Conventions

**Unique IDs:**
```
Format: {PREFIX}-{CATEGORY}-{CODE}-{NUMBER}

Examples:
- ROLE-MA-MSL-001 (Role - Medical Affairs - MSL - #001)
- SKILL-CLIN-001 (Skill - Clinical - #001)
- COMP-SAFETY-001 (Competency - Safety - #001)
- KPI-ENROLL-001 (KPI - Enrollment - #001)
```

**Role Names:**
- Use official job titles
- Be consistent across similar roles
- Include seniority in title if applicable
- Examples: "Medical Science Liaison", "Senior Clinical Research Associate"

### Prioritization

**High Priority Roles (Do First):**
1. Patient-facing or safety-critical roles
2. GxP-critical roles
3. Roles with most headcount
4. Roles that interact with AI agents
5. Roles with complex regulatory requirements

**Can Wait:**
- Administrative/support roles
- Roles with < 5 FTE globally
- Rarely hired roles
- Roles without regulatory requirements

---

## 🔄 Workflow Example

### Scenario: Enriching Medical Affairs Roles

**Week 1 - Planning**
- Identify 8 Medical Affairs roles to enrich
- Assign owners for data collection
- Schedule validation sessions

**Week 2 - Reference Data**
- HR provides competency framework
- L&D shares training catalog
- Compliance provides GxP requirements
- Complete reference_data_template.json

**Week 3 - Role Data Collection**
- Interview MSLs, Medical Directors, Medical Writers
- Review job descriptions and performance criteria
- Document workflows and deliverables

**Week 4 - Template Completion**
- Fill out role_enrichment_template.json for each role
- Include mappings to reference data
- Add pharma-specific context

**Week 5 - Validation**
- Review with role incumbents
- Medical Affairs leadership approval
- HR/Compliance sign-off

**Week 6 - Deployment**
- Generate SQL from templates
- Load to staging database
- Test queries and agent integration
- Deploy to production

---

## 📊 What Happens Next

After you submit completed templates:

### 1. Data Transformation (Automated)
Your JSON will be transformed into:
- SQL INSERT statements for reference tables
- SQL INSERT statements for org_roles table
- SQL INSERT statements for junction tables
- Validation queries and data quality checks

### 2. Database Deployment
SQL will be:
- Reviewed for correctness
- Tested in staging environment
- Deployed via migration files
- Validated with test queries

### 3. Integration
Your enriched roles will power:
- **AI Agents** - Context-aware agents that understand role constraints
- **Personas** - 4 MECE personas auto-generated per role
- **Workflows** - Intelligent routing based on role capabilities
- **Reporting** - Skills gaps, succession planning, workforce analytics

### 4. Ongoing Maintenance
You'll be able to:
- Update roles via JSON → SQL pipeline
- Add new roles using templates
- Extend reference data as needed
- Track role evolution over time

---

## 🆘 Help & Support

### Common Questions

**Q: How many roles should I start with?**
A: Start with 3-5 high-impact roles using quick_start_template.json. Expand from there.

**Q: What if I don't have all the data?**
A: Fill in what you know, mark unknowns as "TBD" in notes. You can enrich incrementally.

**Q: Do I need to complete EVERY field?**
A: No. Required fields are marked. Optional fields add value but aren't mandatory.

**Q: Can I add custom fields?**
A: Yes! Use the "metadata.custom_fields" section to add organization-specific data.

**Q: How do I validate my JSON syntax?**
A: Use any online JSON validator (e.g., jsonlint.com) before submitting.

**Q: What if our role names don't match the template?**
A: That's fine! Use your organization's official role titles.

**Q: Can I submit in batches?**
A: Absolutely. Submit reference data first, then roles in waves (e.g., by function).

### Need Help?

- **Template Questions:** Review the examples in each JSON file
- **Process Questions:** Refer to this README
- **Technical Issues:** Check JSON syntax with validator
- **Data Questions:** Consult with SMEs in your organization

---

## 📈 Success Metrics

Track these metrics to measure success:

- **Data Quality:** % of fields completed per role
- **Validation Rate:** % of roles reviewed by SMEs
- **Coverage:** % of total roles enriched
- **Time to Complete:** Average hours per role
- **Downstream Impact:** Number of AI agents using enriched data

---

## 🎓 Learning Resources

### Internal
- VITAL Platform Documentation
- Organizational competency frameworks
- Career leveling guides
- Training catalogs

### External
- ICH GCP E6 Guidelines
- FDA 21 CFR Part 312 (Clinical Trials)
- PhRMA Code on HCP Interactions
- MAPS MSL Competency Framework
- AIPM Pharma Competency Model

---

## 📝 Changelog

### Version 1.0.0 (2025-11-22)
- Initial release
- Three template types: quick start, comprehensive, reference data
- Support for pharmaceutical/biotech roles
- 15+ enrichment categories
- Complete examples and documentation

---

## ✅ Quick Reference Checklist

Before submitting, ensure:

- [ ] Reference data template completed (at minimum, basic items)
- [ ] Unique IDs follow naming convention
- [ ] All required role fields populated
- [ ] Roles validated by SMEs
- [ ] JSON syntax validated
- [ ] Files saved with descriptive names
- [ ] Context/notes provided in submission
- [ ] Deployment timeline specified

---

**Ready to start?** Open `quick_start_template.json` and begin enriching your first role!

**Questions?** Review the examples in each template file for detailed guidance.

**Need inspiration?** Check out the complete MSL example in `role_enrichment_template.json`.
