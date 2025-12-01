# Role Enrichment Templates - Complete Index

**Created:** 2025-11-22
**Version:** 1.0.0
**Status:** Ready for Use

---

## 📦 What's Included

This package contains everything you need to enrich pharmaceutical/biotech organizational roles with comprehensive metadata for the VITAL platform.

### Templates (4 files)

| File | Purpose | Time Required | Best For |
|------|---------|---------------|----------|
| **quick_start_template.json** | Simplified role enrichment | 15-20 min/role | Pilots, proof of concept, quick wins |
| **role_enrichment_template.json** | Comprehensive role enrichment | 1-2 hrs/role | Production deployment, strategic roles |
| **reference_data_template.json** | Master/reference data | 4-8 hrs one-time | Organizational standards, shared data |

### Documentation (3 files)

| File | Purpose | Who Should Read |
|------|---------|-----------------|
| **README_ROLE_ENRICHMENT_TEMPLATES.md** | Complete user guide | Everyone - start here! |
| **DATA_COLLECTION_GUIDE.md** | Interview guide for SMEs | Data collectors, project leads |
| **TEMPLATES_INDEX.md** | This file - navigation | Quick reference |

---

## 🚀 Quick Start (5 Steps)

```
1. Read README_ROLE_ENRICHMENT_TEMPLATES.md (10 minutes)
   ↓
2. Review DATA_COLLECTION_GUIDE.md (15 minutes)
   ↓
3. Complete reference_data_template.json (2-4 hours)
   ↓
4. Fill out quick_start_template.json for 3-5 roles (1-2 hours)
   ↓
5. Submit completed templates for SQL generation
```

**Total time to first value:** 4-7 hours

---

## 📚 File Descriptions

### 1. quick_start_template.json

**What:** Simplified JSON template with essential role fields only
**When:** Use for pilots, quick wins, or when comprehensive data isn't available
**Size:** 2.1 KB
**Contains:**
- Basic role info (name, title, seniority, function)
- Top 5 skills
- Top 3 responsibilities
- Essential pharma context (GxP, therapeutic areas)
- Work environment basics
- Top 3 KPIs
- Career progression

**Example Use Cases:**
- "Let's test role enrichment with 5 Medical Affairs roles"
- "We need to show value to leadership quickly"
- "I don't have time for full enrichment yet"

### 2. role_enrichment_template.json

**What:** Comprehensive JSON template with 15+ enrichment categories
**When:** Use for production deployment of high-priority roles
**Size:** 15.3 KB
**Contains:**
- Everything in quick start PLUS:
- Detailed competencies with proficiency levels
- Training requirements with frequencies
- Regulatory frameworks with compliance details
- Systems/tools with usage patterns
- Workflows and process participation (RACI)
- Stakeholder interactions
- Decision authority and approval limits
- Deliverables with time allocations
- Goals, challenges, motivations
- Compensation bands
- Custom metadata

**Example Use Cases:**
- "We're building AI agents that need rich role context"
- "We want to generate 4 realistic personas per role"
- "We need data for succession planning and skills gap analysis"

### 3. reference_data_template.json

**What:** Master data tables that roles will reference
**When:** Complete FIRST, before individual roles
**Size:** 7.8 KB
**Contains 13 reference categories:**
1. Skills (20-30 recommended)
2. Certifications (10-15)
3. Competencies (15-20)
4. KPIs (10-15)
5. Training Programs (8-12)
6. Regulatory Requirements (8-10)
7. Systems (8-10)
8. Deliverables (10-15)
9. Therapeutic Areas (5-10)
10. Stakeholder Types (8-10)
11. Career Paths (5-8)
12. Approval Types (6-10)
13. Process Definitions (8-12)
14. Workflow Activities (10-15)

**Example Use Cases:**
- "We need a single source of truth for organizational competencies"
- "HR wants a standardized skills taxonomy"
- "We're building a learning & development curriculum"

### 4. README_ROLE_ENRICHMENT_TEMPLATES.md

**What:** Comprehensive user guide and instructions
**Size:** 12.4 KB
**Sections:**
- Overview and value proposition
- Template file descriptions
- Step-by-step instructions
- Best practices
- Workflow examples
- Help & FAQs
- Success metrics
- Checklist

**Read this first!** It's your roadmap.

### 5. DATA_COLLECTION_GUIDE.md

**What:** Structured interview guide for gathering role data from SMEs
**Size:** 8.9 KB
**Sections:**
- Interview preparation
- 11 question sections with probing questions
- Interview tips (do's and don'ts)
- Red flags and how to handle them
- Interview template for note-taking
- Data quality checklist
- 10 essential questions (for 15-minute interviews)

**Use this when:** Interviewing role incumbents, managers, or SMEs

### 6. TEMPLATES_INDEX.md

**What:** This file - quick navigation and reference
**Size:** You're reading it!

---

## 🎯 Recommended Workflow

### Phase 1: Discovery (Week 1)
- [ ] Read README (30 min)
- [ ] Read DATA_COLLECTION_GUIDE (20 min)
- [ ] Identify 3-5 pilot roles
- [ ] Identify data sources (HR, L&D, Compliance)
- [ ] Schedule SME interviews

### Phase 2: Reference Data (Week 2)
- [ ] Gather existing frameworks (competencies, certifications, etc.)
- [ ] Complete reference_data_template.json (basic items)
- [ ] Validate with HR/L&D/Compliance
- [ ] Save with unique IDs for use in role templates

### Phase 3: Pilot Roles (Week 3)
- [ ] Conduct 2-3 interviews per role
- [ ] Use DATA_COLLECTION_GUIDE
- [ ] Complete quick_start_template.json for each role
- [ ] Validate with role incumbents
- [ ] Submit for SQL generation

### Phase 4: Validation & Learning (Week 4)
- [ ] Review generated SQL
- [ ] Test in staging database
- [ ] Evaluate data quality
- [ ] Identify gaps or improvements
- [ ] Decide: expand to full template or continue with quick start?

### Phase 5: Scale (Weeks 5-12)
- [ ] Expand reference data
- [ ] Move to comprehensive template for priority roles
- [ ] Enrich 10-15 additional roles
- [ ] Deploy to production
- [ ] Integrate with AI agents and personas

---

## 💡 Template Features

### Built-In Validation
- JSON schema validation
- Required vs. optional fields marked
- Enumerated options provided
- Format examples included

### Pharma-Specific
- GxP classifications (GCP, GMP, GLP, GVP, GDP)
- Clinical trial phases
- Drug lifecycle stages
- Regulatory frameworks
- Therapeutic areas
- Compliance requirements

### Healthcare Context
- Patient-facing flags
- HCP interaction tracking
- Safety-critical identification
- Regulatory oversight
- Adverse event responsibilities

### Career Development
- Progression paths
- Time in role
- Advancement potential
- Succession planning priority
- Entry point identification

### Work Environment
- Travel requirements
- Remote eligibility
- On-call responsibilities
- Work location types
- Schedule patterns

### Decision Making
- Approval authority
- Monetary limits
- Escalation requirements
- RACI assignments

---

## 📊 Expected Outputs

When you complete and submit these templates, you'll receive:

### 1. SQL Migration Files
```sql
-- Example output structure
20251122000001_role_enrichment_phase1_foundation.sql
20251122000002_seed_pharma_reference_data.sql
20251122000003_seed_medical_affairs_roles.sql
20251122000004_seed_role_junction_data.sql
```

### 2. Data Quality Report
- Completeness scores
- Validation results
- Missing data flagged
- Recommendations for improvement

### 3. Integration Ready
- Roles loaded to org_roles table
- Reference data in master tables
- Junction tables populated
- Ready for persona generation
- Ready for AI agent integration

---

## ✅ Success Criteria

You'll know you're successful when:

**Data Quality:**
- [ ] 90%+ of required fields completed
- [ ] All roles validated by SMEs
- [ ] Unique IDs follow naming convention
- [ ] JSON syntax validates without errors

**Coverage:**
- [ ] Reference data covers 80%+ of organizational needs
- [ ] At least 3-5 pilot roles enriched
- [ ] All high-priority functions represented

**Validation:**
- [ ] Role incumbents confirm accuracy
- [ ] Managers approve role definitions
- [ ] Compliance validates GxP/regulatory data
- [ ] HR confirms competencies and career paths

**Deployment:**
- [ ] SQL executes without errors
- [ ] Data loads to staging successfully
- [ ] Test queries return expected results
- [ ] Ready for production deployment

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "JSON won't validate" | Use jsonlint.com to find syntax errors (usually missing comma or quote) |
| "I don't have this data" | Mark as "TBD" in notes, fill in what you know, iterate later |
| "Template is overwhelming" | Start with quick_start_template.json - don't try to do everything at once |
| "Interviewees give vague answers" | Use DATA_COLLECTION_GUIDE probing questions, ask for specific examples |
| "Data conflicts between sources" | Interview more people, look for patterns, document variance in notes |
| "Unique IDs don't match" | Reference data must be completed FIRST, then use those IDs in role templates |

---

## 📈 Metrics to Track

Track these to measure your enrichment progress:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Roles enriched | 15-30 | Count of completed role templates |
| Field completion rate | >90% | (Fields filled / Total fields) per role |
| Validation rate | 100% | % of roles reviewed by SMEs |
| Data quality score | >4.0/5.0 | Average of completeness + accuracy + validation |
| Time per role | <2 hours | Track actual vs. estimated time |
| Reference data coverage | >80% | % of organizational needs covered |

---

## 🎓 Next Steps After Template Completion

Once your templates are complete and SQL is generated:

### Week 1: Deployment
1. Review generated SQL
2. Test in staging environment
3. Validate data loads correctly
4. Run sample queries

### Week 2: Integration
1. Connect to persona generation system
2. Test AI agent access to enriched data
3. Validate workflows use role metadata
4. Enable reporting/analytics

### Week 3: Adoption
1. Train users on enriched role data
2. Publish role profiles to org
3. Enable self-service access
4. Gather feedback

### Week 4+: Iteration
1. Add more roles
2. Expand reference data
3. Refine based on usage patterns
4. Plan next phase of enrichment

---

## 📞 Support & Resources

**Template Questions:**
- Review examples in each JSON file
- Check README for detailed guidance
- Validate JSON syntax online

**Process Questions:**
- Follow workflow in README
- Use DATA_COLLECTION_GUIDE for interviews
- Refer to this INDEX for navigation

**Data Questions:**
- Consult with SMEs in your organization
- Review industry frameworks (ICH, FDA, PhRMA)
- Leverage existing documentation

---

## 🏆 Best Practices Recap

1. **Start Small** - Pilot with 3-5 roles using quick start
2. **Reference Data First** - Complete before individual roles
3. **Validate Everything** - Multiple sources, SME review
4. **Think Pharma** - Always include regulatory/compliance context
5. **Document Assumptions** - Use metadata notes field
6. **Iterate** - Don't wait for perfect, improve over time
7. **Measure** - Track quality, coverage, time metrics
8. **Integrate** - Plan how enriched data will be used

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-22 | Initial release with 3 templates and 3 docs |

---

**Ready to begin?** Start with README_ROLE_ENRICHMENT_TEMPLATES.md

**Have questions?** Review the examples and help sections in each file

**Need to collect data?** Use DATA_COLLECTION_GUIDE.md for structured interviews

**Want to dive right in?** Open quick_start_template.json and enrich your first role!
