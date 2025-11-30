# ONTOLOGY VISUAL GUIDE

**Visual diagrams and examples for understanding the Medical Affairs knowledge graph**

---

## GRAPH STRUCTURE OVERVIEW

### Complete Knowledge Graph (High-Level)

```
                                    PERSONAS
                                  (6 MA Roles)
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │ARCHETYPES│      │  TOOLS   │      │   PAIN   │
              │   (4)    │      │ (40-50)  │      │ POINTS   │
              │          │      │          │      │ (80-100) │
              │AUTOMATOR │◄─┐   │Veeva CRM │   ┌─►│Manual    │
              │ORCHESTR. │  │   │Argus     │   │  │Entry     │
              │LEARNER   │  │   │ChatGPT   │   │  │GxP       │
              │SKEPTIC   │  │   │Teams     │   │  │Burden    │
              └──────────┘  │   └──────────┘   │  └──────────┘
                            │         │        │        │
                            │         │        │        │
                            │         ▼        │        ▼
                            │   ┌──────────┐  │  ┌──────────┐
                            │   │ACTIVITIES│  │  │OPPORTUN. │
                            │   │ (60-80)  │  │  │ (20-30)  │
                            │   │          │  │  │          │
                            │   │HCP Calls │  │  │AI Auto-  │
                            │   │Literature│  │  │Document  │
                            │   │Reporting │  │  │CRM-Safety│
                            │   └──────────┘  │  │Integrate │
                            │                 │  └──────────┘
                            │                 │        │
                            │                 │        │
                            ▼                 │        ▼
                      ┌──────────┐            │  ┌──────────┐
                      │  GOALS   │            │  │ SERVICE  │
                      │ (40-50)  │            │  │ LAYERS   │
                      │          │            │  │   (4)    │
                      │Efficiency│            │  │          │
                      │Quality   │            │  │Ask Expert│
                      │Growth    │            └─►│Workflows │
                      │Compliance│               │Solution  │
                      └──────────┘               │Builder   │
                            │                    └──────────┘
                            │
                            ▼
                      ┌──────────┐
                      │MOTIVATION│
                      │ (25-30)  │
                      │          │
                      │Patient   │
                      │Impact    │
                      │Scientific│
                      │Excellence│
                      └──────────┘
                            │
                            ▼
                      ┌──────────┐
                      │  JTBDs   │
                      │ (30-40)  │
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
                      │ (40-50)  │
                      │          │
                      │Speed↓    │
                      │Quality↑  │
                      │Risk↓     │
                      └──────────┘
```

---

## ARCHETYPE DIFFERENTIATION MODEL

### 2x2 Matrix with Characteristics

```
                          AI MATURITY
                    High              Low
              ┌──────────────┬──────────────┐
              │              │              │
              │  AUTOMATOR   │   LEARNER    │
              │              │              │
    Routine   │ 🤖 Tech-Savvy│ 📚 Developing│
              │              │              │
WORK          │Pain Focus:   │Pain Focus:   │
TYPE          │• Manual tasks│• Knowledge   │
              │• Repetition  │• Training    │
              │              │              │
              │Tools:        │Tools:        │
              │• AI (high)   │• Templates   │
              │• Automation  │• Guidance    │
              │              │              │
              │Service:      │Service:      │
              │• Workflows   │• Workflows   │
              │             +│• Ask Panel   │
              │              │              │
              │VPANES: 45-55 │VPANES: 35-45 │
              │ODI: 12-15    │ODI: 12-15    │
              │              │              │
              ├──────────────┼──────────────┤
              │              │              │
              │ORCHESTRATOR  │   SKEPTIC    │
              │              │              │
   Strategic  │ 🎯 Visionary │ 🔬 Evidence  │
              │              │              │
              │Pain Focus:   │Pain Focus:   │
              │• Insights    │• Compliance  │
              │• Alignment   │• Risk        │
              │              │              │
              │Tools:        │Tools:        │
              │• Analytics   │• Validated   │
              │• AI insights │• Evidence    │
              │              │              │
              │Service:      │Service:      │
              │• Ask Expert  │• Ask Panel   │
              │• Ask Panel   │• Ask Expert  │
              │              │              │
              │VPANES: 40-50 │VPANES: 30-40 │
              │ODI: 11-14    │ODI: 10-13    │
              │              │              │
              └──────────────┴──────────────┘
```

---

## RELATIONSHIP MAPPING EXAMPLES

### Example 1: Pain Point → Opportunity → Service Layer

```
PAIN POINT: "Manual Veeva CRM Data Entry"
│
├─ Archetype Weights:
│  ├─ AUTOMATOR:    1.9 (very high pain)
│  ├─ ORCHESTRATOR: 0.7 (low - delegates)
│  ├─ LEARNER:      1.3 (moderate - learning)
│  └─ SKEPTIC:      1.0 (baseline - accepts as necessary)
│
├─ VPANES Scores (AUTOMATOR):
│  ├─ Visibility:  9 (constantly aware)
│  ├─ Pain:        8 (high productivity loss)
│  ├─ Actions:     9 (built workarounds)
│  ├─ Needs:       8 (high urgency)
│  ├─ Emotions:    7 (frustration)
│  ├─ Scenarios:   9 (multiple times daily)
│  └─ TOTAL:       50 (PRIME TARGET)
│
├─ ADDRESSED BY Opportunities:
│  │
│  ├─ OPP-AUTO-001: "AI-powered Veeva auto-documentation"
│  │  ├─ Resolution Effectiveness: 8.5/10
│  │  ├─ Implementation Effort: Medium
│  │  ├─ ROI Estimate: 6-12 months
│  │  └─ Routes To:
│  │     └─ SL-WORKFLOWS (fit_score: 9.0, priority: 1)
│  │
│  └─ OPP-WORK-001: "Guided interaction documentation workflow"
│     ├─ Resolution Effectiveness: 6.0/10
│     ├─ Implementation Effort: Low
│     ├─ ROI Estimate: 2-3 months
│     └─ Routes To:
│        └─ SL-WORKFLOWS (fit_score: 8.5, priority: 2)
│
└─ RECOMMENDATION: Route AUTOMATOR to "AI-powered Veeva auto-documentation" → Workflows
```

### Example 2: JTBD → Outcome → ODI Scoring

```
JTBD: "When I return from a KOL meeting, I want to quickly document
       the interaction in Veeva CRM, so I can meet compliance
       requirements without losing field time"
│
├─ Job Category: Functional (core job)
├─ Situation: Post-KOL meeting
├─ Motivation: Quickly document interaction
├─ Outcome: Meet compliance without field time loss
│
├─ ODI Scores by Archetype:
│  │
│  ├─ AUTOMATOR:
│  │  ├─ Importance: 9.0 (critical)
│  │  ├─ Satisfaction: 4.0 (low - manual process)
│  │  └─ Opportunity: 9 + (9-4) = 14.0 (HIGH)
│  │
│  ├─ ORCHESTRATOR:
│  │  ├─ Importance: 7.0 (moderate - delegates)
│  │  ├─ Satisfaction: 6.0 (adequate - team does it)
│  │  └─ Opportunity: 7 + (7-6) = 8.0 (MEDIUM-LOW)
│  │
│  ├─ LEARNER:
│  │  ├─ Importance: 8.5 (high - learning compliance)
│  │  ├─ Satisfaction: 3.5 (low - struggles with Veeva)
│  │  └─ Opportunity: 8.5 + (8.5-3.5) = 13.0 (HIGH)
│  │
│  └─ SKEPTIC:
│     ├─ Importance: 7.5 (high - compliance focus)
│     ├─ Satisfaction: 5.5 (moderate - careful documentation)
│     └─ Opportunity: 7.5 + (7.5-5.5) = 9.5 (MEDIUM-HIGH)
│
├─ HAS_OUTCOME:
│  └─ OUT-SPEED-001: "Minimize time to document HCP interactions"
│     ├─ Direction: Minimize
│     ├─ Typical Metric: Minutes per interaction
│     ├─ Target Value: <10 minutes
│     └─ Current State: 15-20 minutes (based on persona data)
│
└─ ENABLED BY Opportunities:
   └─ OPP-AUTO-001: "AI-powered Veeva auto-documentation"
      ├─ Enablement Score: 9.0/10
      └─ Expected Outcome: Reduce to 3-5 minutes (70% improvement)
```

### Example 3: Persona → Activity → Time Allocation

```
PERSONA: MSL (AUTOMATOR Archetype)
│
├─ PERFORMS_ACTIVITY Junction Table Entries:
│  │
│  ├─ ACT-ADMIN-001: "Enter HCP interactions in Veeva CRM"
│  │  ├─ Time %: 20% (high for AUTOMATOR - pain point!)
│  │  ├─ Frequency: Daily
│  │  ├─ Satisfaction: 3.0/10 (low)
│  │  ├─ Automation Desire: 9.0/10 (very high)
│  │  └─ Archetype Time % Comparison:
│  │     ├─ AUTOMATOR:    20% ← High (pain point)
│  │     ├─ ORCHESTRATOR: 10% (delegates)
│  │     ├─ LEARNER:      25% (learning, slower)
│  │     └─ SKEPTIC:      15% (meticulous documentation)
│  │
│  ├─ ACT-COMM-001: "Scientific exchange with HCPs"
│  │  ├─ Time %: 20%
│  │  ├─ Frequency: Daily
│  │  ├─ Satisfaction: 9.0/10 (high)
│  │  ├─ Automation Desire: 2.0/10 (low - core value)
│  │  └─ Consistent across archetypes: 15-25%
│  │
│  ├─ ACT-CLIN-002: "Conduct literature review"
│  │  ├─ Time %: 10%
│  │  ├─ Frequency: Daily
│  │  ├─ Satisfaction: 6.0/10
│  │  ├─ Automation Desire: 7.0/10 (high)
│  │  └─ Archetype Time % Comparison:
│  │     ├─ AUTOMATOR:    8%  (wants AI assistance)
│  │     ├─ ORCHESTRATOR: 10% (strategic insights)
│  │     ├─ LEARNER:      12% (building knowledge)
│  │     └─ SKEPTIC:      15% (thorough evidence review)
│  │
│  └─ [38 more activities...]
│
└─ TIME ALLOCATION SUMMARY (AUTOMATOR MSL):
   ├─ Administrative: 25% (target: reduce to 15% via automation)
   ├─ Clinical:       30%
   ├─ Strategic:      10% (target: increase to 20% via time savings)
   ├─ Communication:  25%
   └─ Travel:         10%
```

---

## VPANES SCORING VISUALIZATION

### VPANES Heat Map by Archetype

```
Pain Point: "Manual Veeva CRM Data Entry"

         AUTOMATOR  ORCHESTRATOR  LEARNER  SKEPTIC
         ─────────  ────────────  ───────  ───────
Visibility   9         5           8        6
             ███       ██          ███      ██

Pain         8         3           7        5
             ███       █           ███      ██

Actions      9         2           3        4
             ███       █           █        ██

Needs        8         3           6        4
             ███       █           ██       ██

Emotions     7         2           6        3
             ███       █           ██       █

Scenarios    9         5           9        6
             ███       ██          ███      ██
         ─────────  ────────────  ───────  ───────
TOTAL        50        20          39       28
             ███       █           ███      ██

Engagement   PRIME     LOW         MEDIUM   MEDIUM
             TARGET                         -LOW

Legend: █ = 2 points
```

### VPANES Decision Tree

```
                    Is VPANES Total ≥ 40?
                           │
            ┌──────────────┼──────────────┐
           YES                            NO
            │                              │
            ▼                              ▼
    HIGH ENGAGEMENT                Is VPANES Total ≥ 20?
    ┌──────────────────┐                  │
    │ • Route to       │        ┌─────────┴─────────┐
    │   solution       │       YES                 NO
    │ • High priority  │        │                   │
    │ • Personalized   │        ▼                   ▼
    │   messaging      │  MEDIUM ENGAGEMENT   LOW ENGAGEMENT
    └──────────────────┘  ┌──────────────────┐ ┌──────────────────┐
                          │ • Educate on     │ │ • Low priority   │
                          │   solution       │ │ • General        │
                          │ • Moderate       │ │   awareness      │
                          │   priority       │ │ • No action      │
                          └──────────────────┘ └──────────────────┘
```

---

## ODI SCORING VISUALIZATION

### ODI Matrix (Importance vs Satisfaction)

```
        HIGH IMPORTANCE (I ≥ 7.5)
               │
               │  OVER-SERVED           SATISFIED
               │  (I high, S high)      (I high, S high)
               │  Opportunity: 7-10     Opportunity: 7-8
         10 ───┤  Example:              Example:
               │  - N/A                 - Build KOL trust
               │                        (I=9, S=7 → Opp=11)
               │
SATISFACTION   │
         7.5 ──┤
               │  UNDER-SERVED          RIGHTFULLY SERVED
               │  (I high, S low)       (I high, S medium)
               │  Opportunity: 12-20    Opportunity: 10-12
               │  🎯 TARGET ZONE        Example:
         5 ────┤  Example:              - Respond to MI
               │  - Document quickly    (I=9.5, S=6 → Opp=13)
               │  (I=9, S=4 → Opp=14)
               │
               │
         2.5 ──┤  OVER-SERVED           ADEQUATELY SERVED
               │  (I low, S high)       (I medium, S low)
               │  Opportunity: 0-5      Opportunity: 7-9
               │  Example:              Example:
               │  - N/A                 - Congress planning
          0 ───┴─────────────────────────────────────────
               0    2.5    5    7.5   10
                    LOW      MEDIUM    HIGH
                      IMPORTANCE →
```

### ODI Opportunity Bands

```
OPPORTUNITY SCORE RANGES:

┌───────────────────────────────────────────────────────────┐
│ 15-20: CRITICAL                                   🔴     │
│ ═════════════════════════════════════════════            │
│ • Immediate automation target                            │
│ • High importance, low satisfaction                      │
│ • Examples: AI auto-doc (I=9, S=4 → 14)                 │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 12-14: HIGH                                       🟠     │
│ ═══════════════════════════════════════                  │
│ • Strong opportunity, prioritize                         │
│ • Examples: New MSL onboarding (I=8.5, S=4 → 12.5)      │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 9-11: MEDIUM-HIGH                                 🟡     │
│ ═══════════════════════════════                          │
│ • Good opportunity, consider                             │
│ • Examples: Work-life balance (I=8.5, S=4.5 → 12.5)     │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 7-8: MEDIUM-LOW                                   🟢     │
│ ═════════════                                            │
│ • Optimization opportunity                               │
│ • Examples: Publication planning (I=8, S=5.5 → 10.5)    │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 0-6: LOW                                          ⚪     │
│ ═══                                                      │
│ • Satisfactory, monitor only                            │
│ • Examples: Team engagement (I=7, S=6.5 → 7.5)         │
└───────────────────────────────────────────────────────────┘
```

---

## SERVICE LAYER ROUTING LOGIC

### Routing Decision Tree

```
                        User Query
                             │
                             ▼
                  Identify Persona Archetype
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    AUTOMATOR          ORCHESTRATOR         LEARNER/SKEPTIC
          │                  │                  │
          ▼                  ▼                  ▼
   Calculate VPANES    Calculate VPANES   Calculate VPANES
          │                  │                  │
   ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
   │             │    │             │    │             │
VPANES≥40   VPANES<40 VPANES≥40  VPANES<40 VPANES≥40  VPANES<40
   │             │    │             │    │             │
   ▼             ▼    ▼             ▼    ▼             ▼
 ┌─────┐      ┌─────┐ ┌─────┐    ┌─────┐ ┌─────┐    ┌─────┐
 │WORK │      │SOLN │ │ASK  │    │ASK  │ │ASK  │    │WORK │
 │FLOWS│      │BLDR │ │EXPRT│    │PANEL│ │PANEL│    │FLOWS│
 └─────┘      └─────┘ └─────┘    └─────┘ └─────┘    └─────┘
   │             │       │           │       │           │
   ▼             ▼       ▼           ▼       ▼           ▼
 Guided      Custom   Expert     Cross-   Expert     Guided
 workflow    solution consult   functional consult   workflow
 (high       (medium  (high     panel     (high      (training
 automation) auto)    touch)    (collab)  touch)     focus)
```

### Service Layer Fit Scores by Archetype

```
SERVICE LAYER          AUTOMATOR  ORCHESTRATOR  LEARNER  SKEPTIC
────────────────────── ────────── ──────────── ──────── ────────

Workflows               9.0        6.5          8.5      6.0
(Guided automation)     ████       ███          ████     ███
Use Case: Repetitive    High fit   Moderate     High fit Moderate
tasks, data entry

Ask Expert              5.0        9.0          6.5      8.5
(Expert consultation)   ██         ████         ███      ████
Use Case: Complex       Low need   High fit     Moderate High fit
strategic questions

Ask Panel               4.0        8.5          7.0      9.0
(Multi-expert panel)    ██         ████         ███      ████
Use Case: Cross-func    Low need   High fit     Good fit High fit
decisions, validation

Solution Builder        7.5        8.0          5.5      6.0
(Custom assembly)       ███        ████         ██       ███
Use Case: Custom        Good fit   High fit     Low need Moderate
reports, analysis

Legend: █ = 2 points fit score
```

---

## REAL-WORLD EXAMPLE: MSL AUTOMATOR PERSONA

### Complete Persona Profile

```
PERSONA: Dr. Sarah Chen, MSL (AUTOMATOR)
════════════════════════════════════════════════════════════

ARCHETYPE: AUTOMATOR (High AI Maturity + Routine Work)
  └─ Archetype Strength: 0.95 (strong fit)

TOP 5 PAIN POINTS (VPANES ≥ 40):
┌─────────────────────────────────────────────────────┐
│ 1. Manual Veeva CRM data entry          VPANES: 50 │
│    └─ Severity: High, Frequency: Always             │
│    └─ Opportunity: OPP-AUTO-001 (AI auto-doc)       │
│                                                      │
│ 2. Duplicative reporting                VPANES: 46 │
│    └─ Severity: High, Frequency: Often              │
│    └─ Opportunity: OPP-AUTO-002 (Automation)        │
│                                                      │
│ 3. Email overload                       VPANES: 44 │
│    └─ Severity: Medium, Frequency: Always           │
│    └─ Opportunity: OPP-AI-005 (Email summary)       │
│                                                      │
│ 4. Manual literature review             VPANES: 42 │
│    └─ Severity: Medium, Frequency: Often            │
│    └─ Opportunity: OPP-AUTO-002 (AI synthesis)      │
│                                                      │
│ 5. Manual slide deck prep               VPANES: 40 │
│    └─ Severity: Medium, Frequency: Often            │
│    └─ Opportunity: OPP-AUTO-004 (Smart slides)      │
└─────────────────────────────────────────────────────┘

TOP 3 GOALS (Priority):
┌─────────────────────────────────────────────────────┐
│ 1. Reduce administrative time by 30%   Priority: 1 │
│    └─ Importance: 9.5/10, Progress: 40%             │
│                                                      │
│ 2. Automate repetitive tasks           Priority: 1 │
│    └─ Importance: 9.0/10, Progress: 30%             │
│                                                      │
│ 3. Pilot AI tools for efficiency       Priority: 2 │
│    └─ Importance: 8.5/10, Progress: 20%             │
└─────────────────────────────────────────────────────┘

TOP 3 JTBDs (ODI Opportunity ≥ 12):
┌─────────────────────────────────────────────────────┐
│ 1. Document HCP interactions quickly   ODI: 14.0  │
│    └─ Importance: 9.0, Satisfaction: 4.0            │
│    └─ Opportunity: OPP-AUTO-001                     │
│                                                      │
│ 2. Onboard quickly as new MSL          ODI: 12.5  │
│    └─ Importance: 8.5, Satisfaction: 4.0            │
│    └─ Opportunity: OPP-TRAIN-002                    │
│                                                      │
│ 3. Respond to MI inquiries in 24h      ODI: 13.0  │
│    └─ Importance: 9.5, Satisfaction: 6.0            │
│    └─ Opportunity: OPP-WORK-002                     │
└─────────────────────────────────────────────────────┘

SERVICE LAYER ROUTING:
┌─────────────────────────────────────────────────────┐
│ Primary: Workflows (fit_score: 9.0)                │
│ └─ Use for: Automation, guided processes            │
│                                                      │
│ Secondary: Solution Builder (fit_score: 7.5)       │
│ └─ Use for: Custom reports, analytics               │
│                                                      │
│ Tertiary: Ask Expert (fit_score: 5.0)              │
│ └─ Use for: Complex clinical questions only         │
└─────────────────────────────────────────────────────┘

TIME ALLOCATION:
┌─────────────────────────────────────────────────────┐
│ Administrative:   25% (🎯 Target: 15% via automation)│
│ Clinical:         30%                                │
│ Strategic:        10% (🎯 Target: 20% freed up time) │
│ Communication:    25%                                │
│ Travel:           10%                                │
└─────────────────────────────────────────────────────┘
```

---

## DATA FLOW EXAMPLES

### Example Query Flow: "Show me automation opportunities for AUTOMATOR MSLs"

```
Step 1: Find AUTOMATOR MSL Personas
┌───────────────────────────────────────────┐
│ SELECT * FROM personas                    │
│ WHERE persona_type = 'AUTOMATOR'          │
│   AND title LIKE '%MSL%'                  │
└───────────────────────────────────────────┘
        │
        ▼
Step 2: Get High-VPANES Pain Points
┌───────────────────────────────────────────┐
│ SELECT pp.*, ppp.vpanes_total             │
│ FROM persona_pain_points ppp              │
│ JOIN ref_pain_points pp                   │
│   ON ppp.pain_point_id = pp.id            │
│ WHERE ppp.persona_id IN (step1_personas)  │
│   AND ppp.vpanes_total >= 40              │
│   AND ppp.weight_automator >= 1.5         │
└───────────────────────────────────────────┘
        │
        ▼
Step 3: Map to Automation Opportunities
┌───────────────────────────────────────────┐
│ SELECT o.*, ppo.resolution_effectiveness  │
│ FROM pain_point_opportunities ppo         │
│ JOIN ref_opportunities o                  │
│   ON ppo.opportunity_id = o.id            │
│ WHERE ppo.pain_point_id IN (step2_pains)  │
│   AND o.opportunity_type = 'Automation'   │
│   AND ppo.resolution_effectiveness >= 7.0 │
└───────────────────────────────────────────┘
        │
        ▼
Step 4: Determine Service Layer Routing
┌───────────────────────────────────────────┐
│ SELECT sl.*, osl.fit_score                │
│ FROM opportunity_service_layers osl       │
│ JOIN ref_service_layers sl                │
│   ON osl.service_layer_id = sl.id         │
│ WHERE osl.opportunity_id IN (step3_opps)  │
│ ORDER BY osl.fit_score DESC               │
└───────────────────────────────────────────┘
        │
        ▼
Step 5: Return Recommendations
┌───────────────────────────────────────────┐
│ RESULT:                                   │
│ ┌─────────────────────────────────────┐   │
│ │ Pain: Manual Veeva CRM entry        │   │
│ │ VPANES: 50 (PRIME TARGET)           │   │
│ │ Opportunity: AI auto-documentation  │   │
│ │ Effectiveness: 8.5/10               │   │
│ │ Service: Workflows (fit: 9.0)       │   │
│ │ Priority: 1 (Immediate)             │   │
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

---

## SUMMARY

This visual guide provides:

1. **Graph Structure Overview** - How all entities connect
2. **Archetype Differentiation** - Visual 2x2 matrix with characteristics
3. **Relationship Examples** - Pain→Opportunity→Service flows
4. **VPANES Visualization** - Heat maps and decision trees
5. **ODI Visualization** - Importance vs Satisfaction matrix
6. **Service Routing Logic** - Decision trees and fit scores
7. **Real-World Example** - Complete MSL AUTOMATOR profile
8. **Data Flow Examples** - Query execution patterns

**Use this guide to:**
- Understand the knowledge graph structure visually
- See how archetypes differentiate in scoring and routing
- Follow data flows from personas to service recommendations
- Communicate the ontology to non-technical stakeholders

**Related Documents:**
- ONTOLOGY_STRATEGY.md - Complete strategy (35 pages)
- ONTOLOGY_STRATEGY_SUMMARY.md - Quick reference (10 pages)
- ONTOLOGY_IMPLEMENTATION_GUIDE.md - Implementation steps (15 pages)
- ONTOLOGY_INDEX.md - Navigation guide (5 pages)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-27
**Maintained By:** Data Strategist Agent
