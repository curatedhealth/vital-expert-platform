# V5.0 Persona Extension Strategy
## Extending 31 Existing Personas with v5.0 Schema

**Date**: 2025-11-16
**Existing Personas**: 31 (Part 1: 16, Part 3: 15)
**Missing v5.0 Attributes**: 30 tables (Time Perspectives, Stakeholder Ecosystem, Evidence Architecture)
**Strategy**: Extend + Create Variants

---

## Current State Analysis

### Existing Personas (31 total)

**Part 1 - 16 personas**:
1. Dr. Sarah Chen - Chief Medical Officer (Executive)
2. Dr. Michael Torres - VP Medical Affairs (Executive)
3. Dr. Elena Rodriguez - Medical Director (Senior)
4. Dr. James Patterson - Head of Field Medical (Senior)
5. Dr. Priya Sharma - Regional Medical Director (Senior)
6. Dr. Robert Kim - MSL Manager (Senior)
7. Dr. Lisa Chang - Therapeutic Area MSL Lead (Senior)
8. Dr. Marcus Johnson - Senior Medical Science Liaison (Senior)
9. Dr. Amy Zhang - Medical Science Liaison (Mid)
10. Jennifer Martinez - Field Medical Trainer (Mid)
11. Dr. Thomas Williams - Head of Medical Information (Senior)
12. Dr. Susan Lee - Medical Information Manager (Mid-Senior)
13. Dr. Kevin Brown - Senior Medical Information Specialist (Mid-Senior)
14. Michelle Davis - Medical Information Specialist (Mid)
15. Sarah Thompson - Medical Librarian (Mid)
16. David Wilson - Medical Content Manager (Mid)

**Part 3 - 15 personas**:
17. Dr. Patricia Garcia - Medical Evidence Manager (Senior)
18. Dr. Richard Phillips - Market Access Medical Lead (Senior)
19. Dr. Steven Campbell - Medical Monitor (Senior)
20. Dr. Maria Rodriguez - Safety Physician (Senior)
21. Dr. Jonathan Wright - Clinical Trial Physician (Mid-Senior)
22. Dr. Angela Turner - Study Site Medical Lead (Mid)
23. Sarah Mitchell - Medical Affairs Clinical Liaison (Mid)
24. Dr. Elizabeth Collins - Head of Medical Excellence (Executive)
25. Linda Stewart - Medical Compliance Manager (Mid-Senior)
26. Robert Martinez - Medical Quality Manager (Mid-Senior)
27. Jennifer Green - Medical Training Manager (Mid)
28. Dr. William Baker - Head of Medical Strategy (Executive)
29. Michelle Torres - Medical Operations Manager (Mid-Senior)
30. Dr. Kevin Nguyen - Medical Analytics Manager (Mid-Senior)
31. Dr. Sophia Anderson - Medical Business Partner (Mid-Senior)

### Current JSON Structure (Has):
✅ Core profile (age, location, education, experience, seniority)
✅ Demographics
✅ Professional context (function, department, role, team size, budget)
✅ Work context (work model, travel, hours)
✅ Psychographics (work style, leadership, decision making)
✅ Goals
✅ Pain points
✅ Challenges
✅ Responsibilities
✅ Frustrations
✅ Quotes
✅ Tools
✅ Communication channels
✅ Decision makers
✅ Success metrics
✅ Motivations
✅ Personality traits
✅ Values
✅ Education
✅ Certifications
✅ Typical day (DILO - partial)
✅ Organization type
✅ Typical locations
✅ Evidence sources (basic)
✅ VPANES scoring

### Missing v5.0 Attributes (30 tables):

**Time Perspectives (9 tables)**:
❌ week_in_life (WILO - 7 days detailed)
❌ weekly_milestones
❌ weekly_meetings
❌ month_in_life (MILO - 4 weeks)
❌ monthly_objectives
❌ monthly_stakeholders
❌ year_in_life (YILO - 4 quarters)
❌ annual_conferences
❌ career_trajectory

**Stakeholder Ecosystem (10 tables)**:
❌ internal_stakeholders
❌ internal_networks
❌ external_stakeholders
❌ vendor_relationships
❌ customer_relationships
❌ regulatory_stakeholders
❌ industry_relationships
❌ stakeholder_influence_map
❌ stakeholder_journey
❌ stakeholder_value_exchange

**Evidence Architecture (11 tables)**:
❌ public_research
❌ research_quantitative_results
❌ industry_reports
❌ expert_opinions
❌ case_studies
❌ case_study_investments
❌ case_study_results
❌ case_study_metrics
❌ supporting_statistics
❌ statistic_history
❌ evidence_summary

---

## Extension Strategy

### Phase 1: Extend All 31 Existing Personas (Priority)
**Goal**: Add missing v5.0 attributes to every existing persona

For each of the 31 personas, add:
- **Week in Life** (7 entries: Mon-Sun with detailed activities)
- **Weekly Milestones** (4-6 recurring weekly milestones)
- **Weekly Meetings** (8-12 recurring meetings)
- **Month in Life** (4 entries: Week 1-4 with deliverables)
- **Monthly Objectives** (6-10 objectives)
- **Monthly Stakeholders** (8-12 stakeholder interactions)
- **Year in Life** (4 entries: Q1-Q4 annual patterns)
- **Annual Conferences** (4-8 conferences)
- **Career Trajectory** (progression path)
- **Internal Stakeholders** (8-12 with relationship details)
- **Internal Networks** (3-5 networks)
- **External Stakeholders** (10-15 KOLs, partners)
- **Vendor Relationships** (5-8 vendors)
- **Customer Relationships** (8-12 if applicable)
- **Regulatory Stakeholders** (3-6 regulatory bodies)
- **Industry Relationships** (5-8 associations)
- **Stakeholder Influence Map** (10-15 with influence scores)
- **Stakeholder Journey** (8-12 journey stages)
- **Stakeholder Value Exchange** (10-15 value exchanges)
- **Public Research** (5-8 key studies)
- **Research Quantitative Results** (10-15 data points)
- **Industry Reports** (4-6 reports)
- **Expert Opinions** (5-8 opinions cited)
- **Case Studies** (3-5 case studies)
- **Case Study Investments** (detailed breakdowns)
- **Case Study Results** (metrics)
- **Case Study Metrics** (before/after)
- **Supporting Statistics** (8-12 key stats)
- **Statistic History** (historical trends)
- **Evidence Summary** (overall evidence quality)

### Phase 2: Create Role Variants (Expansion)
**Goal**: Create 3-5 variants for key high-volume roles

Focus on these role types:
1. **MSL** (Currently have: MSL Manager, TA MSL Lead, Senior MSL, MSL)
   - Add: Entry-Level MSL, Strategic HQ-based MSL

2. **Medical Director** (Currently have: Medical Director, Regional MD)
   - Add: Associate MD (first leadership), Global Sr MD, Startup MD

3. **HEOR** (Currently have: Medical Evidence Manager)
   - Add: HEOR Analyst (junior), HEOR Manager (mid), Sr HEOR Director, Global HEOR Head

4. **Clinical Research** (Currently have: Medical Monitor, Clinical Trial Physician, Study Site Lead, Safety Physician)
   - Add: Clinical Scientist (early phase), Clinical Development Lead, VP Clinical

5. **Medical Communications** (Currently have: Medical Content Manager)
   - Add: Medical Writer (junior), Med Comms Manager (mid), Sr Manager Med Comms, Director Med Comms

Total new variants: ~15-20 additional personas

### Phase 3: Dual-Purpose Attributes (Enhancement)
**Goal**: Add organizational context and service opportunity mapping

For each persona, add:
- **Organizational Prevalence** (how common is this role by company size)
- **Service Layer Fit Scores** (Ask Agent, Advisory Board, Workflow, Solution Building)
- **Lifetime Value Potential** (Year 1-3 projections)
- **Expansion Opportunities** (similar roles, cross-functional paths)
- **Workflow Priority Matrix** (which workflows fit best)
- **Personalization Preferences** (interaction mode, response style)

---

## Implementation Plan

### Step 1: Create Extension JSON Template
Create a new JSON file: `Medical_Affairs_Personas_V5_EXTENDED.json`

Structure:
```json
{
  "metadata": {
    "version": "5.0",
    "created_date": "2025-11-16",
    "description": "Medical Affairs Personas - V5.0 Schema Complete",
    "base_personas": 31,
    "extended_personas": 31,
    "new_variant_personas": 18,
    "total_personas": 49,
    "schema_coverage": "69 tables (100%)"
  },
  "personas": [
    {
      // Existing persona data (all current fields)
      "name": "Dr. Sarah Chen",
      "title": "Chief Medical Officer",
      // ... existing fields ...

      // NEW V5.0 TIME PERSPECTIVES
      "week_in_life": [
        {
          "day_of_week": "Monday",
          "typical_activities": ["Executive team meeting", "Strategic planning", "1:1s with direct reports"],
          "meeting_load": 4,
          "focus_time_hours": 2,
          "travel_likelihood": "low",
          "energy_pattern": "high",
          "stakeholder_interactions": 8,
          "value_rating": 8
        },
        // ... 6 more days
      ],
      "weekly_milestones": [
        {
          "milestone_type": "strategic_review",
          "milestone_description": "Weekly executive dashboard review",
          "week_phase": "Monday AM",
          "criticality": "high"
        },
        // ... more milestones
      ],
      "weekly_meetings": [
        {
          "meeting_type": "executive_team",
          "frequency": "weekly",
          "duration_hours": 2,
          "attendee_count": 8,
          "value_rating": 9
        },
        // ... more meetings
      ],

      // NEW V5.0 STAKEHOLDER ECOSYSTEM
      "internal_stakeholders": [
        {
          "stakeholder_role": "CEO",
          "relationship_type": "reports_to",
          "interaction_frequency": "daily",
          "influence_level": "very_high",
          "collaboration_areas": ["Strategic decisions", "Board reporting"],
          "trust_level": "very_high",
          "political_alignment": "aligned"
        },
        // ... more stakeholders
      ],
      "external_stakeholders": [
        {
          "stakeholder_name": "FDA Center for Drug Evaluation",
          "stakeholder_type": "regulatory",
          "relationship_importance": "critical",
          "interaction_mode": "quarterly meetings",
          "value_exchange": "Regulatory guidance ↔ Clinical data",
          "contract_value": 0
        },
        // ... more external stakeholders
      ],

      // NEW V5.0 EVIDENCE ARCHITECTURE
      "public_research": [
        {
          "research_title": "Efficacy of Novel Immunotherapy in Advanced NSCLC",
          "research_type": "clinical_trial_phase_3",
          "publication_source": "New England Journal of Medicine",
          "sample_size": 1200,
          "methodology": "Randomized controlled trial",
          "key_findings": ["30% improvement in PFS", "Manageable safety profile"],
          "relevance_score": 9
        },
        // ... more research
      ],
      "case_studies": [
        {
          "case_study_title": "Launch Excellence: Oncology Product Launch Best Practices",
          "organization_name": "Leading Pharma Co.",
          "challenge_addressed": "Successful product launch in competitive market",
          "solution_implemented": "Integrated medical affairs strategy",
          "outcomes_achieved": ["20% market share in year 1", "$500M revenue"],
          "roi_achieved": 300
        },
        // ... more case studies
      ],

      // NEW V5.0 DUAL-PURPOSE ATTRIBUTES
      "organizational_context": {
        "archetype_name": "Chief Medical Officer",
        "universality_score": 10,
        "criticality_score": 10,
        "typical_count_per_org": {
          "startup_biotech": 0,
          "small_biotech": 0,
          "mid_pharma": "0-1",
          "large_pharma": 1,
          "enterprise_pharma": "1-2"
        },
        "organizational_prevalence": "Exists in 100% of mid-large pharma companies",
        "influence_scope": "enterprise"
      },
      "service_opportunity": {
        "service_layer_fit": {
          "ask_agent": {"score": 7, "frequency": "weekly", "ltv_year1": 6000},
          "advisory_board": {"score": 10, "frequency": "weekly", "ltv_year1": 48000},
          "workflow_orchestration": {"score": 8, "frequency": "monthly", "ltv_year1": 24000},
          "solution_building": {"score": 9, "frequency": "annual", "ltv_year1": 100000}
        },
        "total_ltv_potential": {
          "year_1": 178000,
          "year_2": 200000,
          "year_3": 200000
        },
        "expansion_catalyst_score": 10,
        "network_effect_multiplier": 5.0
      }
    }
    // ... 30 more extended personas + 18 new variants
  ]
}
```

### Step 2: Generate SQL Transformation Script
Create: `TRANSFORM_V5_PERSONAS_TO_SQL.py`

This script will:
1. Read the extended JSON
2. Generate SQL INSERT statements for all 69 tables
3. Handle proper foreign key relationships
4. Include tenant_id references
5. Create deployment-ready .sql files

### Step 3: Create Deployment Package
Files to create:
1. `Medical_Affairs_Personas_V5_EXTENDED.json` - Extended JSON (49 personas)
2. `01_DEPLOY_V5_PERSONA_EXTENSIONS.sql` - SQL for 31 existing + v5.0 data
3. `02_DEPLOY_V5_PERSONA_VARIANTS.sql` - SQL for 18 new variants
4. `03_VERIFY_V5_DEPLOYMENT.sql` - Verification queries
5. `04_ACCOUNT_OPPORTUNITY_QUERIES.sql` - Business intelligence queries

---

## Immediate Next Steps

1. ✅ **Analyze existing structure** (DONE)
2. ⏳ **Create first example** - Extend Dr. Sarah Chen (CMO) with ALL v5.0 attributes
3. ⏳ **Generate Python transformation script** - Automate JSON → SQL
4. ⏳ **Extend all 31 personas** - Add v5.0 data systematically
5. ⏳ **Create 18 new variants** - Fill role coverage gaps
6. ⏳ **Deploy to Supabase** - Load all data

Starting with Dr. Sarah Chen (CMO) as the example...
