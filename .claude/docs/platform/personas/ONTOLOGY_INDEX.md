# ONTOLOGY DOCUMENTATION INDEX

**Complete guide to Medical Affairs knowledge graph ontology**

---

## DOCUMENT OVERVIEW

| Document | Purpose | Audience | Length | Read Time |
|----------|---------|----------|--------|-----------|
| **[ONTOLOGY_STRATEGY.md](ONTOLOGY_STRATEGY.md)** | Complete ontology blueprint with entity taxonomy, relationships, VPANES/ODI scoring | Architects, Data Scientists, Product Leads | 35 pages | 60-90 min |
| **[ONTOLOGY_STRATEGY_SUMMARY.md](ONTOLOGY_STRATEGY_SUMMARY.md)** | Quick reference with key tables, scores, and patterns | Developers, AI Engineers, All Teams | 10 pages | 15-20 min |
| **[ONTOLOGY_IMPLEMENTATION_GUIDE.md](ONTOLOGY_IMPLEMENTATION_GUIDE.md)** | Practical 5-day sprint with SQL scripts and validation | Developers, DBAs | 15 pages | 30-45 min |
| **This Index** | Navigation and visual overview | All audiences | 5 pages | 10 min |

---

## KNOWLEDGE GRAPH VISUAL OVERVIEW

### Core Entity Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERSONA (Central Node)                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Attributes: persona_type (archetype), title, description     │      │
│  │ Source: org_roles (via source_role_id FK)                    │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
    ┌──────────┐            ┌──────────┐            ┌──────────┐
    │ ARCHETYPE│            │   TOOLS  │            │   PAIN   │
    │  (1:N)   │            │  (N:M)   │            │ POINTS   │
    │          │            │          │            │  (N:M)   │
    │ AUTOMATOR│            │ Veeva    │            │ Manual   │
    │ORCHESTR. │            │ Argus    │            │ Data     │
    │ LEARNER  │            │ ChatGPT  │            │ Entry    │
    │ SKEPTIC  │            │ Teams    │            │ Email    │
    └──────────┘            └──────────┘            │ Overload │
                                   │                └──────────┘
                                   │                      │
                                   │                      │
                    ┌──────────────┼──────────────────────┼─────────┐
                    │              │                      │         │
                    ▼              ▼                      ▼         ▼
              ┌──────────┐   ┌──────────┐         ┌──────────┐ ┌──────────┐
              │  GOALS   │   │ACTIVITIES│         │OPPORTUN. │ │ SERVICE  │
              │  (N:M)   │   │  (N:M)   │         │  (N:M)   │ │ LAYERS   │
              │          │   │          │         │          │ │  (N:M)   │
              │Efficiency│   │HCP Calls │         │AI Auto-  │ │Ask Expert│
              │Quality   │   │Email     │         │Document  │ │Workflows │
              │Growth    │   │Literature│         │CRM-Safety│ │Solution  │
              │Compliance│   │Reporting │         │Integrate │ │Builder   │
              └──────────┘   └──────────┘         └──────────┘ └──────────┘
                                                         │
                    ┌────────────────────────────────────┘
                    │
                    ▼
              ┌──────────┐
              │  JTBDs   │
              │  (N:M)   │
              │          │
              │Document  │
              │Quickly   │
              │Respond   │
              │Inquiries │
              └──────────┘
                    │
                    ▼
              ┌──────────┐
              │ OUTCOMES │
              │  (N:M)   │
              │          │
              │Speed↓    │
              │Quality↑  │
              │Risk↓     │
              └──────────┘
```

### Relationship Flow (Graph Traversal)

```
User Query: "What pain points do AUTOMATOR MSLs have?"

1. START → Persona Table
   Filter: persona_type = 'AUTOMATOR' AND title LIKE '%MSL%'

2. TRAVERSE → persona_pain_points (junction table)
   Join: persona_id = persona.id
   Metadata: severity, vpanes_*, weight_automator

3. LOOKUP → ref_pain_points
   Join: pain_point_id = ref_pain_points.id
   Filter: weight_automator > 1.5 (high pain for AUTOMATOR)

4. TRAVERSE → pain_point_opportunities
   Join: pain_point_id = ref_pain_points.id
   Metadata: resolution_effectiveness, roi_estimate

5. LOOKUP → ref_opportunities
   Join: opportunity_id = ref_opportunities.id
   Filter: opportunity_type = 'Automation' (matches AUTOMATOR preference)

6. TRAVERSE → opportunity_service_layers
   Join: opportunity_id = ref_opportunities.id
   Metadata: fit_score, routing_priority

7. LOOKUP → ref_service_layers
   Join: service_layer_id = ref_service_layers.id
   Result: Route to "Workflows" (best fit for AUTOMATOR)

RETURN: Pain points + Opportunities + Service routing
```

---

## ENTITY TAXONOMY AT A GLANCE

### 8 Core Entity Types (250+ Total Entities)

```
1. TOOLS (40-50)
   └─ Categories: CRM, Analytics, Safety, AI, Literature, Communication
   └─ Medical Affairs: Veeva CRM, Argus Safety, iMed
   └─ Generic: Teams, PowerPoint, ChatGPT

2. PAIN POINTS (80-100)
   └─ Categories: Process, Technology, Communication, Compliance, Resource, Knowledge
   └─ Medical Affairs: GxP burden, KOL access, AE complexity
   └─ Generic: Email overload, approval delays

3. GOALS (40-50)
   └─ Categories: Efficiency, Quality, Growth, Compliance, Innovation, Relationship
   └─ Medical Affairs: KOL relationships, publications, compliance
   └─ Generic: Career advancement, work-life balance

4. MOTIVATIONS (25-30)
   └─ Categories: Intrinsic, Extrinsic, Social, Achievement, Security
   └─ Medical Affairs: Patient impact, scientific excellence
   └─ Generic: Compensation, autonomy, job security

5. ACTIVITIES (60-80)
   └─ Categories: Administrative, Clinical, Strategic, Communication, Travel, Development
   └─ Medical Affairs: HCP interactions, literature review, AE reporting
   └─ Generic: Email, meetings, reporting

6. JTBDS (30-40)
   └─ Categories: Functional, Emotional, Social
   └─ Format: "When I [situation], I want to [motivation], so I can [outcome]"
   └─ Medical Affairs: Document interactions, respond to inquiries, build KOL trust

7. OUTCOMES (40-50)
   └─ Categories: Speed, Quality, Cost, Risk, Compliance, Impact
   └─ Direction: Minimize (speed, cost, risk) or Maximize (quality, compliance, impact)
   └─ Medical Affairs: HCP satisfaction, AE compliance, time to document

8. OPPORTUNITIES (20-30)
   └─ Types: Automation, Workflow, Insight, Training, Integration, AI Assistant
   └─ Medical Affairs: AI Veeva auto-doc, CRM-Safety integration, Literature synthesis
   └─ Generic: Email automation, meeting scheduling
```

---

## ARCHETYPE FRAMEWORK (MECE 2x2 Matrix)

```
                          AI MATURITY
                    High              Low
              ┌──────────────┬──────────────┐
              │              │              │
    Routine   │  AUTOMATOR   │   LEARNER    │
              │              │              │
              │ • Efficiency │ • Growth     │
              │ • Innovation │ • Compliance │
WORK          │ • Tools      │ • Training   │
TYPE          │ • Speed      │ • Guidance   │
              │              │              │
              ├──────────────┼──────────────┤
              │              │              │
   Strategic  │ORCHESTRATOR  │   SKEPTIC    │
              │              │              │
              │ • Impact     │ • Quality    │
              │ • Innovation │ • Compliance │
              │ • Insights   │ • Evidence   │
              │ • Leadership │ • Risk       │
              │              │              │
              └──────────────┴──────────────┘

Key Differentiators:
- Pain Point Weights: 0.0-2.0 scale (archetype-specific)
- VPANES Scoring: Engagement prediction (0-60)
- ODI Scoring: JTBD opportunity (0-20)
- Service Routing: Ask Expert vs Workflows vs Ask Panel
- Time Allocation: Admin, Clinical, Strategic, Communication
```

---

## SCORING FRAMEWORKS

### VPANES Scoring (0-60 Total)

```
┌─────────────────────────────────────────────────────────┐
│ V: VISIBILITY    (0-10) How aware are they?            │
│ P: PAIN          (0-10) How painful is it?             │
│ A: ACTIONS       (0-10) What have they tried?          │
│ N: NEEDS         (0-10) How urgent is a solution?      │
│ E: EMOTIONS      (0-10) What emotions are evoked?      │
│ S: SCENARIOS     (0-10) How often does it occur?       │
└─────────────────────────────────────────────────────────┘

Total VPANES: Sum of 6 dimensions
- 50-60: PRIME TARGET (high engagement)
- 40-49: HIGH (strong engagement)
- 30-39: MEDIUM (moderate engagement)
- 20-29: LOW (passive awareness)
- 0-19: IGNORE (not a priority)

Example: "Manual Veeva CRM Entry" for AUTOMATOR
V=9, P=8, A=9, N=8, E=7, S=9 → Total=50 (PRIME TARGET)
```

### ODI Scoring (0-20 Range)

```
┌─────────────────────────────────────────────────────────┐
│ ODI FORMULA: Importance + max(Importance - Satisfaction, 0) │
└─────────────────────────────────────────────────────────┘

Interpretation:
- 15-20: CRITICAL (immediate automation target)
- 12-14: HIGH (strong opportunity)
- 9-11: MEDIUM-HIGH (good opportunity)
- 7-8: MEDIUM-LOW (optimization)
- 0-6: LOW (satisfactory)

Example: "Document HCP Interactions Quickly"
AUTOMATOR: I=9, S=4 → Opp = 9 + (9-4) = 14 (HIGH)
ORCHESTRATOR: I=7, S=6 → Opp = 7 + (7-6) = 8 (MEDIUM-LOW)
LEARNER: I=8.5, S=3.5 → Opp = 8.5 + (8.5-3.5) = 13 (HIGH)
SKEPTIC: I=7.5, S=5.5 → Opp = 7.5 + (7.5-5.5) = 9.5 (MEDIUM-HIGH)
```

---

## DATABASE SCHEMA SUMMARY

### Core Tables (3 Tiers)

```
TIER 1: Reference Tables (Nodes)
├── ref_archetypes           (4 rows)
├── ref_service_layers       (4 rows)
├── ref_tools                (40-50 rows)
├── ref_pain_points          (80-100 rows)
├── ref_goals                (40-50 rows)
├── ref_motivations          (25-30 rows)
├── ref_activities           (60-80 rows)
├── ref_jtbds                (30-40 rows)
├── ref_outcomes             (40-50 rows)
└── ref_opportunities        (20-30 rows)

TIER 2: Junction Tables (Edges with Metadata)
├── persona_archetypes       (N:1, archetype_strength)
├── persona_tools            (N:M, proficiency, satisfaction, archetype_weights)
├── persona_pain_points      (N:M, severity, VPANES scores, archetype_weights)
├── persona_goals            (N:M, priority, importance, archetype_weights)
├── persona_motivations      (N:M, strength, archetype_weights)
├── persona_activities       (N:M, time_percentage, archetype time allocations)
├── persona_jtbds            (N:M, importance, satisfaction, ODI by archetype)
├── pain_point_opportunities (N:M, resolution_effectiveness, ROI)
├── jtbd_opportunities       (N:M, enablement_score)
├── opportunity_service_layers (N:M, fit_score, routing_priority)
└── jtbd_outcomes            (N:M, outcome_priority, importance_weight)

TIER 3: Views (Pre-computed Graph Queries)
├── v_persona_pain_opportunities
├── v_jtbd_opportunities_by_archetype
├── v_shared_pain_points
├── v_tool_adoption_by_archetype
└── v_goals_by_role
```

### Key Columns (Metadata)

```
Archetype Weights (on all persona-entity junctions):
├── weight_automator         DECIMAL(3,2)  -- 0.0-2.0
├── weight_orchestrator      DECIMAL(3,2)
├── weight_learner           DECIMAL(3,2)
└── weight_skeptic           DECIMAL(3,2)

VPANES Scores (on persona_pain_points):
├── vpanes_visibility        DECIMAL(3,2)  -- 0-10
├── vpanes_pain              DECIMAL(3,2)
├── vpanes_actions           DECIMAL(3,2)
├── vpanes_needs             DECIMAL(3,2)
├── vpanes_emotions          DECIMAL(3,2)
├── vpanes_scenarios         DECIMAL(3,2)
└── vpanes_total             DECIMAL(4,2) GENERATED  -- Sum

ODI Scores (on persona_jtbds):
├── importance_score         DECIMAL(3,2)  -- 0-10
├── satisfaction_score       DECIMAL(3,2)  -- 0-10
├── opportunity_score        DECIMAL(4,2) GENERATED  -- I + max(I-S, 0)
├── importance_automator     DECIMAL(3,2)
├── satisfaction_automator   DECIMAL(3,2)
└── [similar for other archetypes...]
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Medical Affairs Foundation (Weeks 1-4)

```
Week 1: Schema + Tools + Pain Points
├── Day 1: Deploy schemas (001_gold_standard, 002_ontology)
├── Day 2: Seed tools (40 entities)
├── Day 2: Seed pain points (40 entities)
└── Validate: 80+ entities, tables created

Week 2: Goals + Motivations + Activities
├── Day 3: Seed goals (30 entities)
├── Day 3: Seed motivations (25 entities)
├── Day 3: Seed activities (40 entities)
└── Validate: 175+ entities total

Week 3: JTBDs + Outcomes + Opportunities
├── Day 4: Seed JTBDs (30 entities)
├── Day 4: Seed outcomes (30 entities)
├── Day 4: Seed opportunities (25 entities)
└── Validate: 260+ entities total

Week 4: Relationship Mapping
├── Day 5: Map pain→opportunity (50+ edges)
├── Day 5: Map opportunity→service layer (30+ edges)
├── Day 5: Map JTBD→outcome (40+ edges)
└── Day 6-7: Link personas to entities (600+ edges with VPANES/ODI)
```

### Phase 2: Query & Analytics (Weeks 5-6)

```
Week 5: Views + Stored Procedures
├── Create high-opportunity views
├── Create archetype analysis views
├── Create cross-functional pattern views
└── Stored procedures: calculate_vpanes(), recommend_opportunities()

Week 6: Validation + Performance
├── Validate VPANES/ODI calculations
├── Benchmark query performance (<1s target)
├── Add missing indexes
└── Test graph traversal queries
```

### Phase 3: AI Agent Integration (Weeks 7-8)

```
Week 7: Context Queries
├── Persona context builder
├── Service layer router
├── Similarity scorer
└── Opportunity ranker

Week 8: Routing Logic
├── Archetype-aware prompts
├── VPANES-based urgency detection
├── ODI-based recommendations
└── Testing with real personas
```

---

## QUICK START CHECKLIST

### For Developers

- [ ] Read ONTOLOGY_STRATEGY_SUMMARY.md (15 min)
- [ ] Review ONTOLOGY_IMPLEMENTATION_GUIDE.md Day 1 (30 min)
- [ ] Deploy 001_gold_standard_schema.sql
- [ ] Deploy 002_ontology_schema.sql
- [ ] Verify 4 archetypes, 4 service layers seeded
- [ ] Start Day 2 seeding (tools, pain points)

### For AI Agent Team

- [ ] Study archetype definitions (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
- [ ] Learn VPANES scoring (0-60 engagement scale)
- [ ] Understand ODI formula (I + max(I-S, 0))
- [ ] Review service layer routing logic
- [ ] Test persona context queries

### For Data Scientists

- [ ] Review entity taxonomy (250+ entities)
- [ ] Validate archetype weights (0.0-2.0 scale)
- [ ] Audit VPANES calculations
- [ ] Analyze ODI distributions
- [ ] Benchmark query performance

### For Product/Design

- [ ] Understand MECE archetype framework
- [ ] Review pain point priorities by archetype
- [ ] See opportunity mapping (pain→solution)
- [ ] Explore service layer routing
- [ ] Interpret VPANES/ODI scores

---

## KEY SQL QUERY PATTERNS

### 1. High-Engagement Pain Points

```sql
SELECT pp.pain_point_name, ppp.vpanes_total, o.opportunity_name
FROM persona_pain_points ppp
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
JOIN ref_opportunities o ON ppo.opportunity_id = o.id
WHERE ppp.vpanes_total >= 40
ORDER BY ppp.vpanes_total DESC;
```

### 2. JTBD Opportunity Analysis

```sql
SELECT j.jtbd_statement, pj.opportunity_score,
       CASE WHEN pj.opportunity_score >= 15 THEN 'CRITICAL'
            WHEN pj.opportunity_score >= 12 THEN 'HIGH'
            ELSE 'MEDIUM' END AS priority
FROM persona_jtbds pj
JOIN ref_jtbds j ON pj.jtbd_id = j.id
WHERE pj.opportunity_score >= 12
ORDER BY pj.opportunity_score DESC;
```

### 3. Service Layer Routing

```sql
SELECT p.persona_type, pp.pain_point_name,
       o.opportunity_name, sl.layer_name, osl.fit_score
FROM personas p
JOIN persona_pain_points ppp ON p.id = ppp.persona_id
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
JOIN ref_opportunities o ON ppo.opportunity_id = o.id
JOIN opportunity_service_layers osl ON o.id = osl.opportunity_id
JOIN ref_service_layers sl ON osl.service_layer_id = sl.id
WHERE ppp.vpanes_total >= 40
ORDER BY osl.fit_score DESC;
```

---

## SUPPORT & RESOURCES

### Documentation Files

- **ONTOLOGY_STRATEGY.md** - Complete 35-page strategy
- **ONTOLOGY_STRATEGY_SUMMARY.md** - 10-page quick reference
- **ONTOLOGY_IMPLEMENTATION_GUIDE.md** - 15-page implementation guide
- **This Index** - Navigation and overview

### Existing Schema Files

- **/database/seeds/medical_affairs/001_gold_standard_schema.sql** - Role schema
- **/database/seeds/medical_affairs/002_ontology_schema.sql** - Ontology schema
- **/database/seeds/medical_affairs/002_msl_seed.sql** - Example persona seed

### External References

- MSL Society (MAPS) competency framework
- PhRMA Code on HCP Interactions
- ICH GCP E6 Guidelines
- FDA Promotional Guidelines
- JTBD Framework (Clayton Christensen)
- ODI Framework (Anthony Ulwick)

---

## GLOSSARY

| Term | Definition |
|------|------------|
| **MECE** | Mutually Exclusive, Collectively Exhaustive (framework principle) |
| **VPANES** | Visibility, Pain, Actions, Needs, Emotions, Scenarios (engagement scoring) |
| **ODI** | Outcome-Driven Innovation (JTBD prioritization framework) |
| **JTBD** | Jobs to be Done (situation-motivation-outcome framework) |
| **Archetype** | Persona classification based on AI maturity + work type (2x2 matrix) |
| **Junction Table** | N:M relationship table with edge metadata (graph database pattern) |
| **Edge Metadata** | Properties on relationships (weights, scores, frequencies) |
| **Graph Traversal** | Multi-hop query across nodes via edges (e.g., Persona→Pain→Opportunity→Service) |
| **GxP** | Good Practice (GCP, GVP, GMP, GLP) - pharma compliance frameworks |
| **HCP** | Healthcare Professional |
| **KOL** | Key Opinion Leader |
| **MSL** | Medical Science Liaison |
| **MI** | Medical Information |
| **AE** | Adverse Event |

---

## VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-11-27 | Initial ontology strategy release | Data Strategist Agent |

---

**Next Steps:**
1. Read ONTOLOGY_STRATEGY_SUMMARY.md for quick overview
2. Follow ONTOLOGY_IMPLEMENTATION_GUIDE.md for hands-on setup
3. Refer to ONTOLOGY_STRATEGY.md for deep dives
4. Use this index for navigation

**Questions?** Review the relevant document section or consult the glossary.

---

**Maintained By:** Data Strategist Agent
**Review Cycle:** Quarterly
**Last Updated:** 2025-11-27
