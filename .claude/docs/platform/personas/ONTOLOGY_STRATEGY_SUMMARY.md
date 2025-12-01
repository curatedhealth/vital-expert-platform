# ONTOLOGY STRATEGY - EXECUTIVE SUMMARY

**Quick Reference Guide for Medical Affairs Knowledge Graph**

---

## AT A GLANCE

### What We're Building
A **graph-native knowledge system** in PostgreSQL that connects:
- 250+ domain entities (tools, pain points, goals, motivations, activities, JTBDs, outcomes, opportunities)
- 4 persona archetypes (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
- 1000+ weighted relationships with metadata
- VPANES scoring (0-60) for engagement prediction
- ODI scoring (0-20) for JTBD prioritization

### Why It Matters
- **Personalization:** Route users to right solutions based on archetype + pain + context
- **Pattern Discovery:** Find cross-functional problems and shared solutions
- **Prioritization:** Quantify opportunity using VPANES + ODI scores
- **Scalability:** Blueprint extends to Commercial, R&D, Corporate functions

---

## ENTITY COUNTS

| Category | Total Entities | Medical Affairs Specific | Shared/Generic |
|----------|---------------|-------------------------|----------------|
| **Tools** | 40-50 | 20 (Veeva, Argus, etc.) | 20 (Teams, PowerPoint) |
| **Pain Points** | 80-100 | 40 (GxP, KOL access) | 40 (email, approvals) |
| **Goals** | 40-50 | 15 (publications, KOLs) | 25 (efficiency, growth) |
| **Motivations** | 25-30 | 10 (patient impact, KOLs) | 15 (career, autonomy) |
| **Activities** | 60-80 | 40 (HCP interactions) | 20 (meetings, email) |
| **JTBDs** | 30-40 | 25 (document interactions) | 5 (work-life balance) |
| **Outcomes** | 40-50 | 20 (HCP satisfaction) | 20 (time savings, cost) |
| **Opportunities** | 20-30 | 15 (AI Veeva entry) | 10 (email automation) |
| **TOTAL** | **335-420** | **185** | **150-235** |

---

## ARCHETYPE QUICK REFERENCE

### AUTOMATOR (High AI + Routine)
- **Pain Priority:** Manual, repetitive tasks (weight 1.8-2.0)
- **Goal Priority:** Efficiency ⭐⭐⭐, Innovation ⭐⭐⭐
- **VPANES Sweet Spot:** 45-55 (high visibility, high pain, active actions)
- **ODI Sweet Spot:** 12-15 (automation opportunities)
- **Service Layer:** Workflows (high fit)
- **Time Allocation:** Admin 20%, Clinical 30%, Strategic 10%, Communication 25%, Travel 15%

### ORCHESTRATOR (High AI + Strategic)
- **Pain Priority:** Lack of insights, strategic gaps (weight 1.8-2.0)
- **Goal Priority:** Innovation ⭐⭐⭐, Quality ⭐⭐⭐, Relationship ⭐⭐⭐
- **VPANES Sweet Spot:** 40-50 (high needs, moderate actions)
- **ODI Sweet Spot:** 11-14 (insight opportunities)
- **Service Layer:** Ask Expert, Ask Panel (high fit)
- **Time Allocation:** Admin 10%, Clinical 30%, Strategic 35%, Communication 20%, Travel 5%

### LEARNER (Low AI + Routine)
- **Pain Priority:** Knowledge gaps, compliance complexity (weight 1.8-2.0)
- **Goal Priority:** Growth ⭐⭐⭐, Compliance ⭐⭐⭐, Quality ⭐⭐⭐
- **VPANES Sweet Spot:** 35-45 (high pain, low actions, high needs)
- **ODI Sweet Spot:** 12-15 (training opportunities)
- **Service Layer:** Workflows (high fit), Ask Panel (moderate)
- **Time Allocation:** Admin 25%, Clinical 25%, Strategic 5%, Communication 30%, Travel 15%

### SKEPTIC (Low AI + Strategic)
- **Pain Priority:** Audit anxiety, compliance burden (weight 1.8-2.0)
- **Goal Priority:** Compliance ⭐⭐⭐, Quality ⭐⭐⭐
- **VPANES Sweet Spot:** 30-40 (high emotions, moderate needs)
- **ODI Sweet Spot:** 10-13 (compliance/risk opportunities)
- **Service Layer:** Ask Panel (high fit), Ask Expert (moderate)
- **Time Allocation:** Admin 15%, Clinical 40%, Strategic 20%, Communication 20%, Travel 5%

---

## TOP 10 MEDICAL AFFAIRS PAIN POINTS

| Rank | Pain Point | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC | Opportunity |
|------|-----------|-----------|--------------|---------|---------|-------------|
| 1 | Manual Veeva CRM data entry | 1.9 | 0.7 | 1.7 | 1.0 | OPP-AUTO-001 (AI auto-doc) |
| 2 | Data silos (CRM-Safety) | 1.6 | 1.8 | 1.1 | 1.3 | OPP-INTEG-001 (Integration) |
| 3 | Duplicative reporting | 1.8 | 1.7 | 1.4 | 1.2 | OPP-AUTO-002 (Automation) |
| 4 | Email overload | 1.5 | 1.6 | 1.5 | 1.4 | OPP-AI-005 (Email summary) |
| 5 | GxP training burden | 1.2 | 1.0 | 1.7 | 1.5 | OPP-TRAIN-001 (Efficient training) |
| 6 | Approval workflow delays | 1.4 | 1.8 | 1.2 | 1.6 | OPP-WORK-001 (Guided workflow) |
| 7 | Lack of onboarding (new MSLs) | 1.3 | 1.2 | 1.9 | 1.4 | OPP-TRAIN-002 (Accelerator) |
| 8 | AE reporting complexity | 1.1 | 0.9 | 1.8 | 1.7 | OPP-INTEG-001 (Integration) |
| 9 | Audit anxiety | 0.8 | 1.0 | 1.6 | 1.9 | OPP-WORK-001 (Guided docs) |
| 10 | Limited KOL access | 1.6 | 1.7 | 1.5 | 1.6 | OPP-AI-003 (KOL advisor) |

---

## TOP 10 OPPORTUNITIES

| Rank | Opportunity | Type | Impact | Complexity | Addresses Pains | Enables JTBDs |
|------|-------------|------|--------|------------|-----------------|---------------|
| 1 | AI-powered Veeva auto-doc | Automation | High | Medium | PAIN-PROC-001 | JTBD-FUNC-001 |
| 2 | CRM-Safety integration | Integration | High | High | PAIN-TECH-001, PAIN-COMP-003 | JTBD-FUNC-005 |
| 3 | Automated literature synthesis | Automation | High | Low | PAIN-TECH-006, PAIN-KNOW-002 | JTBD-FUNC-007 |
| 4 | KOL engagement analytics | Insight | High | Medium | PAIN-TECH-007, PAIN-PROC-004 | JTBD-FUNC-004 |
| 5 | Standardized MI response templates | Workflow | High | Low | PAIN-KNOW-004, PAIN-SPEED-002 | JTBD-FUNC-002 |
| 6 | New MSL onboarding accelerator | Training | High | Medium | PAIN-KNOW-001 | JTBD-FUNC-012 |
| 7 | Medical affairs AI copilot (VITAL) | AI Assistant | Transformative | Medium | Multiple | Multiple |
| 8 | Intelligent inquiry routing | Automation | Medium | Medium | PAIN-PROC-009 | JTBD-FUNC-002 |
| 9 | Field insights actionability scoring | Insight | High | Medium | PAIN-PROC-007 | JTBD-FUNC-008 |
| 10 | Guided interaction documentation | Workflow | Medium | Low | PAIN-PROC-001, PAIN-QUAL-003 | JTBD-FUNC-001 |

---

## VPANES SCORING CHEAT SHEET

### Quick Score Guide (0-10 per dimension)

| Dimension | 9-10 | 7-8 | 5-6 | 3-4 | 0-2 |
|-----------|------|-----|-----|-----|-----|
| **Visibility** | Daily awareness | Weekly recognition | Monthly notice | Rare awareness | Unaware |
| **Pain** | Critical blocker | High impact | Medium annoyance | Low impact | Negligible |
| **Actions** | Active workarounds | Exploring solutions | Complained | Mentioned | None |
| **Needs** | Immediate urgency | High (this quarter) | Moderate (nice to have) | Low (6-12 months) | No need |
| **Emotions** | Strong negative (fear, anger) | Moderate (stress, annoyance) | Mild frustration | Neutral | Indifferent |
| **Scenarios** | Multiple times daily | Daily/several times weekly | Weekly | Monthly | Quarterly+ |

### Total VPANES Interpretation

- **50-60:** PRIME TARGET - High engagement, immediate opportunity
- **40-49:** HIGH - Strong engagement, prioritize
- **30-39:** MEDIUM - Moderate engagement, consider
- **20-29:** LOW - Passive awareness, monitor
- **0-19:** IGNORE - Not a priority

---

## ODI SCORING CHEAT SHEET

### Formula
```
Opportunity Score = Importance + max(Importance - Satisfaction, 0)
```

### Interpretation

| Opportunity Score | Priority | Action |
|-------------------|----------|--------|
| **15-20** | CRITICAL | Immediate automation/innovation target |
| **12-14** | HIGH | Strong opportunity, prioritize in roadmap |
| **9-11** | MEDIUM-HIGH | Good opportunity, consider for next phase |
| **7-8** | MEDIUM-LOW | Optimization opportunity, lower priority |
| **0-6** | LOW | Satisfactory, monitor only |

### Example JTBD Scores

| JTBD | Importance | Satisfaction | Opportunity | Archetype |
|------|-----------|--------------|-------------|-----------|
| Document HCP interactions quickly | 9.0 | 4.0 | **14.0** (HIGH) | AUTOMATOR |
| Respond to MI inquiries in 24h | 9.5 | 6.0 | **13.0** (HIGH) | LEARNER (MI) |
| Prepare with latest clinical data | 9.0 | 5.0 | **13.0** (HIGH) | All |
| Onboard quickly as new MSL | 8.5 | 4.0 | **12.5** (HIGH) | LEARNER |
| Maintain work-life balance | 8.5 | 4.5 | **12.5** (HIGH) | LEARNER |

---

## RELATIONSHIP TYPES (40+)

### Persona-Level (8 types)
- **HAS_ARCHETYPE** (N:1) - Persona → Archetype
- **USES_TOOL** (N:M) - Persona → Tool [proficiency, satisfaction, automation_desire, archetype_weights]
- **HAS_PAIN_POINT** (N:M) - Persona → Pain Point [severity, VPANES scores, archetype_weights]
- **HAS_GOAL** (N:M) - Persona → Goal [priority, importance, archetype_weights]
- **DRIVEN_BY** (N:M) - Persona → Motivation [strength, archetype_weights]
- **PERFORMS_ACTIVITY** (N:M) - Persona → Activity [time_percentage, archetype time allocations]
- **PERFORMS_JTBD** (N:M) - Persona → JTBD [importance, satisfaction, opportunity_score, archetype ODI]
- **ACHIEVES** (N:M) - Persona → Outcome [target, current, gap]

### Solution Mapping (4 types)
- **ADDRESSED_BY** (N:M) - Pain Point → Opportunity [resolution_effectiveness, ROI]
- **ENABLES** (N:M) - Opportunity → JTBD [enablement_score]
- **ROUTES_TO** (N:M) - Opportunity → Service Layer [priority, fit_score, conditions]
- **HAS_OUTCOME** (N:M) - JTBD → Outcome [priority, importance_weight]

### Cross-Entity (6+ types)
- **USED_IN** (N:M) - Tool → Activity [usage_pattern, dependency]
- **EXPERIENCED_DURING** (N:M) - Pain Point → Activity [relationship_type, frequency]
- **ACHIEVES** (N:M) - Goal → JTBD [contribution_weight]
- **CONFLICTS_WITH** (N:M) - Motivation → Motivation [conflict_severity]
- **PREREQUISITE_FOR** (N:M) - Activity → Activity [sequence_order]
- **REQUIRES_COMPETENCY** (N:M) - Activity → Competency [proficiency_level]

---

## IMPLEMENTATION TIMELINE

### Phase 1: Medical Affairs Foundation (Weeks 1-4)
- Week 1: Schema + Tools + Pain Points (40 entities)
- Week 2: Goals + Motivations + Activities (95 entities)
- Week 3: JTBDs + Outcomes + Opportunities (95 entities)
- Week 4: Persona linkage + VPANES scoring (1000+ edges)

### Phase 2: Query Layer (Weeks 5-6)
- Week 5: Views + stored procedures
- Week 6: Validation + performance tuning

### Phase 3: AI Agent Integration (Weeks 7-8)
- Week 7: Context queries + similarity scoring
- Week 8: Routing logic + testing

### Phase 4: Commercial Extension (Weeks 9-12)
- Week 9-10: Commercial reference data
- Week 11: Commercial personas
- Week 12: Cross-functional analysis

### Phase 5: Production (Weeks 13-16)
- Week 13: Performance optimization
- Week 14: Data quality + governance
- Week 15: Documentation + training
- Week 16: Production deployment

---

## KEY SQL PATTERNS

### 1. Find High-Engagement Pain Points

```sql
SELECT pp.pain_point_name, ppp.vpanes_total, o.opportunity_name
FROM persona_pain_points ppp
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
JOIN ref_opportunities o ON ppo.opportunity_id = o.id
WHERE ppp.engagement_level = 'high'
  AND ppp.vpanes_total >= 40
ORDER BY ppp.vpanes_total DESC;
```

### 2. JTBD Opportunity Scoring

```sql
SELECT j.jtbd_statement, pj.importance_score, pj.satisfaction_score,
       pj.opportunity_score,
       CASE WHEN pj.opportunity_score >= 15 THEN 'CRITICAL'
            WHEN pj.opportunity_score >= 12 THEN 'HIGH'
            ELSE 'MEDIUM' END AS priority
FROM persona_jtbds pj
JOIN ref_jtbds j ON pj.jtbd_id = j.id
WHERE pj.opportunity_score >= 12
ORDER BY pj.opportunity_score DESC;
```

### 3. Cross-Functional Pain Discovery

```sql
SELECT pp.pain_point_name,
       COUNT(DISTINCT p.persona_type) AS affected_archetypes,
       AVG(ppp.vpanes_total) AS avg_vpanes
FROM ref_pain_points pp
JOIN persona_pain_points ppp ON pp.id = ppp.pain_point_id
JOIN personas p ON ppp.persona_id = p.id
WHERE pp.is_systemic = true
GROUP BY pp.id, pp.pain_point_name
HAVING COUNT(DISTINCT p.persona_type) >= 2
ORDER BY avg_vpanes DESC;
```

### 4. Service Layer Routing

```sql
SELECT p.persona_type, pp.pain_point_name,
       o.opportunity_name, sl.layer_name,
       osl.fit_score
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

## SCALABILITY CHECKLIST

### Shared Entities (Reuse Across Functions)
- [ ] Archetypes (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
- [ ] Service Layers (Ask Expert, Workflows, Solution Builder)
- [ ] Generic Tools (Teams, PowerPoint, Excel)
- [ ] Generic Pain Points (Email overload, approval delays)
- [ ] Generic Goals (Efficiency, quality, growth)
- [ ] Generic Motivations (Career advancement, autonomy)

### Function-Specific (Create Per Function)
- [ ] Function-specific tools (Veeva for MA, Salesforce for Commercial)
- [ ] Function-specific pain points (GxP for MA, quota pressure for Sales)
- [ ] Function-specific KPIs (MSL interactions for MA, revenue for Sales)
- [ ] Function-specific regulatory frameworks
- [ ] Function-specific therapeutic areas / market segments

### Naming Conventions
```
Shared:     TOOL-COMM-001 (Teams), PAIN-PROC-001 (Email overload)
MA-Specific: TOOL-MA-CRM-001 (Veeva), PAIN-MA-COMP-001 (GxP burden)
Commercial:  TOOL-COMM-CRM-001 (Salesforce), PAIN-COMM-PROC-001 (Quota)
R&D:         TOOL-RD-CTMS-001 (Medidata), PAIN-RD-PROC-001 (Enrollment)
```

---

## SUCCESS METRICS

### Entity Coverage
- [ ] 500+ nodes (entities) in Medical Affairs
- [ ] 1000+ edges (relationships) with metadata
- [ ] 80% of personas linked to all entity types
- [ ] 100% of pain points mapped to opportunities

### Query Performance
- [ ] <1s for persona context retrieval
- [ ] <500ms for VPANES scoring
- [ ] <1s for cross-functional pattern discovery
- [ ] <2s for full knowledge graph traversal

### Data Quality
- [ ] 90%+ archetype classification accuracy
- [ ] 80%+ VPANES score correlation with engagement
- [ ] 75%+ ODI score correlation with adoption
- [ ] 95%+ referential integrity (no orphaned edges)

### Business Impact
- [ ] 50%+ improvement in opportunity prioritization
- [ ] 30%+ increase in personalized recommendations
- [ ] 70%+ service layer routing accuracy
- [ ] 40%+ reduction in manual persona research

---

## QUICK START GUIDE

### For Developers
1. Review `/database/seeds/templates/medical_affairs/` for context
2. Run `001_gold_standard_schema.sql` (role schema)
3. Run `002_ontology_schema.sql` (ontology tables)
4. Seed reference data (tools, pain points, goals, etc.)
5. Populate junction tables with archetype weights
6. Test example queries from ONTOLOGY_STRATEGY.md

### For AI Agent Team
1. Study archetype definitions (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
2. Learn VPANES scoring (0-60 scale)
3. Understand ODI opportunity formula (I + max(I-S, 0))
4. Review service layer routing logic
5. Test persona context queries

### For Data Team
1. Validate entity taxonomies (250+ entities)
2. Verify archetype weights (0.0-2.0 scale)
3. Audit VPANES calculations
4. Benchmark query performance
5. Create data quality dashboard

### For Stakeholders
1. Review entity taxonomy (what's in the knowledge graph)
2. Understand archetype framework (4 persona types)
3. Interpret VPANES scores (engagement prediction)
4. See opportunity mapping (pain → solution)
5. Explore cross-functional patterns

---

**For Full Details:** See `ONTOLOGY_STRATEGY.md` (complete 35-page strategy document)

**Document Version:** 1.0.0
**Last Updated:** 2025-11-27
**Maintained By:** Data Strategist Agent
