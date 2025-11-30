# VITAL Platform: Medical Affairs AI Operating System
## Master Strategy Document v4.0

**Document Classification:** Enterprise Transformation Blueprint  
**Version:** 4.0 (Comprehensive Integration)  
**Last Updated:** November 28, 2025  
**Status:** Board-Ready | Implementation-Ready | Future-Proof  
**Audience:** Executive Leadership | Product | Engineering | Operations

---

# VOLUME I: STRATEGIC FOUNDATION

---

# Executive Summary

## The Transformation Imperative

Medical Affairs operates at the intersection of science, strategy, and stakeholder engagement—a uniquely complex domain where:
- **Information volume** exceeds human processing capacity
- **Compliance requirements** demand perfect accuracy and traceability
- **Stakeholder expectations** require personalized, timely engagement
- **Strategic decisions** depend on synthesizing vast, disparate evidence
- **Operational processes** remain largely manual despite digital investments

**The VITAL Platform transforms Medical Affairs into an AI-native operating system** that delivers:

| Capability | Current State | Future State | Value Impact |
|------------|---------------|--------------|--------------|
| Medical Inquiry Response | 4-6 hours manual | 15 minutes AI-assisted | 92% time reduction |
| KOL Meeting Preparation | 2-3 hours research | 10 minutes synthesis | 87% time reduction |
| Evidence Gap Analysis | Weeks of manual review | Real-time intelligence | 97% acceleration |
| Publication Drafting | Days per section | Hours with AI augmentation | 80% faster drafts |
| Insight Synthesis | Monthly manual reports | Continuous AI clustering | Real-time visibility |

## The Dual-Purpose Platform

VITAL serves simultaneously as:

### 1. Personalization Engine (Individual Level)
- Context-aware AI copilots for every Medical Affairs role
- Role-specific, persona-adapted interactions
- Progressive capability disclosure based on AI maturity
- Workflow automation aligned to individual JTBD

### 2. Enterprise Intelligence Platform (Organization Level)
- AI opportunity identification and prioritization
- Transformation readiness assessment
- Capability gap analysis and L&D alignment
- Value realization tracking and ROI measurement

## Strategic Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VITAL PLATFORM ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 7: VALUE & TRANSFORMATION                       │   │
│  │  Opportunities │ Value Drivers │ AI Maturity │ Change Readiness          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 6: AI COMPONENTS                                │   │
│  │  Agents │ Agent Graphs │ Panels │ LangComponents │ Tools │ RAG          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 5: EXECUTION                                    │   │
│  │  Processes │ Projects │ Workflow Templates │ Tasks │ Steps              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 4: CAPABILITIES                                 │   │
│  │  Capabilities │ Skills │ Competencies │ Learning Resources              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 3: JOBS-TO-BE-DONE                              │   │
│  │  JTBD │ Outcomes (ODI) │ Pain Points │ Constraints │ Value Drivers      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: PERSONAS                                     │   │
│  │  Personas │ Archetypes │ Goals │ Pain │ Behaviors │ AI Maturity         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: ORGANIZATIONAL STRUCTURE                     │   │
│  │  Functions │ Departments │ Roles │ Responsibilities │ Hierarchy          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         KNOWLEDGE GRAPH BACKBONE                                │
│  PostgreSQL (280+ tables) ←→ Neo4j (Graph) ←→ Pinecone (Vectors)              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Platform Metrics

| Metric Category | Current Baseline | Year 1 Target | Year 3 Target |
|-----------------|------------------|---------------|---------------|
| **Schema Coverage** | 280+ tables | 350+ tables | 500+ tables |
| **Personas Modeled** | 43 | 100+ | 250+ (cross-functional) |
| **JTBDs Documented** | 120 | 250 | 500+ |
| **AI Agents Active** | 136 | 200+ | 400+ |
| **Workflows Automated** | 180 templates | 300+ | 600+ |
| **User Adoption** | Pilot | 500+ users | 5,000+ users |
| **ROI Delivered** | Baseline | 3x investment | 10x investment |

---

# 1. The 2×2 Persona Archetype Matrix

## 1.1 Strategic Framework

The 2×2 Archetype Matrix provides a universal classification system for understanding how individuals interact with AI-powered work systems. This matrix is **function-agnostic** and applies across Medical Affairs, Commercial, R&D, and any enterprise function.

### Axes Definition

**X-Axis: Work Complexity**
- **Routine/Operational** ← → **Strategic/Complex**
- Measures: task repetitiveness, decision scope, cross-functional dependencies

**Y-Axis: GenAI Readiness**
- **Low AI Maturity** ← → **High AI Maturity**
- Measures: technology adoption, automation comfort, AI trust level

### The Four Archetypes

```
                            HIGH AI MATURITY
                                   │
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         │      AUTOMATOR          │      ORCHESTRATOR       │
         │                         │                         │
         │  • Embraces automation  │  • Strategic thinker    │
         │  • Process optimizer    │  • Multi-agent user     │
         │  • Efficiency-focused   │  • Solution builder     │
         │  • Self-service AI      │  • Enterprise vision    │
         │                         │                         │
         │  Service Affinity:      │  Service Affinity:      │
         │  L1 Ask Expert +        │  L2 Ask Panel +         │
         │  L3 Workflows           │  L4 Solution Builder    │
         │                         │                         │
ROUTINE ─┼─────────────────────────┼─────────────────────────┼─ STRATEGIC
         │                         │                         │
         │      LEARNER            │      SKEPTIC            │
         │                         │                         │
         │  • Needs guidance       │  • Requires proof       │
         │  • Tutorial-oriented    │  • Risk-conscious       │
         │  • Building confidence  │  • Compliance-focused   │
         │  • Structured paths     │  • Explainability need  │
         │                         │                         │
         │  Service Affinity:      │  Service Affinity:      │
         │  L1 Ask Expert +        │  L2 Ask Panel +         │
         │  Guided Workflows       │  HITL Workflows         │
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   │
                            LOW AI MATURITY
```

## 1.2 Archetype Characteristics

### AUTOMATOR (High AI Maturity × Routine Work)

**Profile:**
- Embraces automation for repetitive tasks
- Seeks efficiency gains and time savings
- Comfortable with self-service AI tools
- Early adopter of new capabilities

**Behavioral Signals:**
- Pain points mention "manual work," "repetitive tasks," "time wasted"
- Goals include "automate," "streamline," "reduce effort"
- Quick to adopt new features
- Provides feedback on automation gaps

**Service Layer Preferences:**
- Primary: L3 Workflows (automated execution)
- Secondary: L1 Ask Expert (quick lookups)
- Minimal: L2 Panels (views as overkill for routine work)

**Interaction Design:**
- Minimize friction in automation setup
- Provide batch processing capabilities
- Enable scheduling and triggers
- Focus on speed over explanation

### ORCHESTRATOR (High AI Maturity × Strategic Work)

**Profile:**
- Strategic decision-maker
- Comfortable with complex multi-agent reasoning
- Seeks comprehensive, synthesized intelligence
- Leverages AI for competitive advantage

**Behavioral Signals:**
- Goals include "strategic decisions," "comprehensive analysis," "enterprise view"
- Manages large teams, significant budgets
- Cross-functional responsibilities
- Executive-level communication needs

**Service Layer Preferences:**
- Primary: L4 Solution Builder (end-to-end solutions)
- Secondary: L2 Ask Panel (multi-perspective reasoning)
- Supporting: L3 Workflows (for delegated execution)

**Interaction Design:**
- Emphasize synthesis and strategic framing
- Enable multi-agent orchestration
- Provide executive-ready outputs
- Support scenario planning and what-if analysis

### LEARNER (Low AI Maturity × Routine Work)

**Profile:**
- New to AI-assisted work
- Needs guidance and hand-holding
- Building confidence through small wins
- Prefers structured, predictable experiences

**Behavioral Signals:**
- Pain points mention "don't know how," "need training," "overwhelming"
- Goals include "learn," "improve," "get help"
- Lower technology adoption scores
- Longer tenure in traditional methods

**Service Layer Preferences:**
- Primary: L1 Ask Expert (low-risk entry point)
- Secondary: Guided L3 Workflows (step-by-step)
- Avoid: Autonomous automation (too much too fast)

**Interaction Design:**
- Provide in-context tutorials and tooltips
- Celebrate small wins and progress
- Offer undo/rollback capabilities
- Gradual feature disclosure

### SKEPTIC (Low AI Maturity × Strategic Work)

**Profile:**
- Strategic responsibility but AI hesitant
- Requires proof before trust
- Highly compliance and risk-conscious
- Demands explainability and audit trails

**Behavioral Signals:**
- Pain points mention "accuracy," "compliance," "trust issues"
- Goals include "ensure quality," "maintain control," "verify outputs"
- High regulatory exposure
- Previous negative AI experiences

**Service Layer Preferences:**
- Primary: L2 Ask Panel (multiple perspectives for validation)
- Secondary: HITL L3 Workflows (human checkpoints)
- Require: Explanation and source citation for all outputs

**Interaction Design:**
- Always show sources and reasoning
- Provide human-in-the-loop checkpoints
- Enable side-by-side comparison with manual methods
- Build trust through demonstrated accuracy

## 1.3 Archetype Inference Engine

### Automated Classification Rules

The system infers archetypes from persona attributes:

```python
def infer_archetype(persona):
    # Calculate work complexity score (0-100)
    complexity = calculate_complexity(
        team_size=persona.professional_context.team_size,
        budget_authority=persona.professional_context.budget_authority,
        seniority=persona.professional_context.seniority_level,
        decision_scope=persona.professional_context.decision_scope,
        cross_functional=len(persona.internal_stakeholders) > 5
    )
    
    # Calculate AI readiness score (0-100)
    ai_readiness = calculate_ai_readiness(
        tech_adoption=persona.tech_adoption_level,
        pain_patterns=analyze_pain_for_automation_signals(persona.pain_points),
        goal_patterns=analyze_goals_for_ai_signals(persona.goals),
        prior_ai_experience=persona.ai_experience_score
    )
    
    # Classify into quadrant
    if ai_readiness >= 60 and complexity < 50:
        return "AUTOMATOR"
    elif ai_readiness >= 60 and complexity >= 50:
        return "ORCHESTRATOR"
    elif ai_readiness < 60 and complexity < 50:
        return "LEARNER"
    else:
        return "SKEPTIC"
```

### Archetype Distribution by Medical Affairs Role

| Role | Typical Archetype | Reasoning |
|------|-------------------|-----------|
| MSL (Junior) | Learner | New to role, routine field work, building AI confidence |
| MSL (Senior) | Automator | Experienced, routine optimized, seeks efficiency |
| MI Specialist | Automator | High-volume routine, automation-hungry |
| Medical Director | Orchestrator | Strategic scope, multi-agent consumer |
| VP Medical Affairs | Orchestrator | Enterprise strategy, solution builder |
| Compliance Officer | Skeptic | Risk-focused, needs explainability |
| Publications Manager | Automator | Process-heavy, workflow-oriented |
| HEOR Scientist | Skeptic → Orchestrator | Analytical rigor, transitioning to strategic |

## 1.4 Archetype-Adjusted System Behavior

### Service Layer Routing by Archetype

```
ROUTING LOGIC (Archetype-Aware)

User Request → Identify Persona → Retrieve Archetype
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
              AUTOMATOR            ORCHESTRATOR          LEARNER/SKEPTIC
                    │                   │                   │
                    ▼                   ▼                   ▼
            Fast-track to          Route to Panel      Add guardrails:
            Workflow (L3)          or Solution (L2/L4) • HITL checkpoints
            Skip explanations      Full synthesis      • Explanations
            Batch capabilities     Multi-agent         • Slower rollout
```

### Persona-Archetype Integration Schema

```sql
-- Archetype assignment stored per persona
CREATE TABLE persona_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid NOT NULL REFERENCES personas(id),
  archetype_code text NOT NULL CHECK (archetype_code IN 
    ('automator', 'orchestrator', 'learner', 'skeptic')),
  work_complexity_score integer CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),
  ai_readiness_score integer CHECK (ai_readiness_score >= 0 AND ai_readiness_score <= 100),
  inference_method text DEFAULT 'rule_based',
  confidence_level numeric DEFAULT 0.8,
  last_assessed_at timestamp with time zone DEFAULT now(),
  override_reason text -- If manually adjusted
);

-- Service layer affinity by archetype
CREATE TABLE archetype_service_affinities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_code text NOT NULL,
  service_layer_id uuid NOT NULL REFERENCES agent_levels(id),
  affinity_score numeric CHECK (affinity_score >= 0 AND affinity_score <= 1),
  is_primary boolean DEFAULT false,
  usage_guidance text
);
```

---

# 2. Outcome-Driven Innovation (ODI) Methodology

## 2.1 ODI Framework Integration

Outcome-Driven Innovation (ODI), pioneered by Tony Ulwick, provides a rigorous methodology for identifying underserved needs. VITAL integrates ODI at the JTBD layer to enable systematic opportunity identification.

### The ODI Equation

```
OPPORTUNITY SCORE = Importance + MAX(Importance - Satisfaction, 0)

Where:
- Importance: How critical is this outcome? (0-10 scale)
- Satisfaction: How well is this outcome currently met? (0-10 scale)
- Opportunity: The gap representing unmet need
```

### Opportunity Classification

| Opportunity Score | Classification | Strategic Response |
|-------------------|----------------|-------------------|
| 15+ | Extreme Opportunity | Immediate investment priority |
| 12-14.9 | High Opportunity | Near-term roadmap priority |
| 10-11.9 | Moderate Opportunity | Planned development |
| 8-9.9 | Low Opportunity | Monitor and reassess |
| <8 | Table Stakes | Maintain, don't over-invest |

## 2.2 ODI-Enhanced JTBD Schema

```sql
CREATE TABLE jtbd_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id uuid NOT NULL REFERENCES jtbd(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  
  -- Core ODI Fields
  outcome_id text NOT NULL, -- e.g., "OUT-001"
  outcome_statement text NOT NULL, -- "Minimize time to..."
  outcome_direction text CHECK (outcome_direction IN 
    ('minimize', 'maximize', 'optimize', 'eliminate', 'ensure')),
  outcome_object text NOT NULL, -- What is being measured
  
  -- ODI Scores
  importance_score numeric NOT NULL CHECK (importance_score >= 0 AND importance_score <= 10),
  satisfaction_score numeric NOT NULL CHECK (satisfaction_score >= 0 AND satisfaction_score <= 10),
  opportunity_score numeric GENERATED ALWAYS AS (
    importance_score + GREATEST(importance_score - satisfaction_score, 0)
  ) STORED,
  
  -- Classification
  outcome_type text CHECK (outcome_type IN 
    ('speed', 'reliability', 'output_quality', 'cost', 'risk', 'compliance')),
  outcome_category text CHECK (outcome_category IN 
    ('functional', 'emotional', 'social', 'job_execution')),
  opportunity_priority text GENERATED ALWAYS AS (
    CASE 
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 15 THEN 'extreme'
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 12 THEN 'high'
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 10 THEN 'moderate'
      WHEN importance_score + GREATEST(importance_score - satisfaction_score, 0) >= 8 THEN 'low'
      ELSE 'table_stakes'
    END
  ) STORED,
  
  -- Evidence
  sample_size integer,
  confidence_interval numeric,
  data_source text,
  last_surveyed_at timestamp with time zone,
  
  UNIQUE(jtbd_id, outcome_id)
);
```

## 2.3 Sample ODI Analysis: Medical Inquiry Response

**JTBD:** "When responding to a medical inquiry, I want to provide accurate, compliant, timely information so that the HCP can make informed patient care decisions."

| Outcome Statement | Direction | Imp | Sat | Opp | Priority |
|-------------------|-----------|-----|-----|-----|----------|
| Minimize time to find relevant source document | Minimize | 9.2 | 4.1 | 14.3 | High |
| Minimize errors in scientific content | Minimize | 9.8 | 6.2 | 13.4 | High |
| Maximize consistency across responses | Maximize | 8.5 | 5.0 | 12.0 | High |
| Ensure full compliance with regulations | Ensure | 9.9 | 7.5 | 12.3 | High |
| Minimize time to complete response | Minimize | 8.8 | 4.5 | 13.1 | High |
| Maximize HCP satisfaction | Maximize | 8.0 | 6.5 | 9.5 | Low |
| Minimize need for follow-up questions | Minimize | 7.2 | 5.8 | 8.6 | Low |

**Analysis:** Top automation opportunities are document retrieval (14.3), response time (13.1), and error reduction (13.4).

## 2.4 ODI-AI Suitability Mapping

VITAL extends ODI with AI suitability scoring to determine intervention type:

```sql
CREATE TABLE jtbd_ai_suitability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id uuid NOT NULL UNIQUE REFERENCES jtbd(id),
  
  -- AI Capability Scores (0-1 scale)
  rag_score numeric CHECK (rag_score >= 0 AND rag_score <= 1),
  summary_score numeric CHECK (summary_score >= 0 AND summary_score <= 1),
  generation_score numeric CHECK (generation_score >= 0 AND generation_score <= 1),
  classification_score numeric CHECK (classification_score >= 0 AND classification_score <= 1),
  reasoning_score numeric CHECK (reasoning_score >= 0 AND reasoning_score <= 1),
  automation_score numeric CHECK (automation_score >= 0 AND automation_score <= 1),
  
  -- Composite Scores
  overall_ai_score numeric GENERATED ALWAYS AS (
    (COALESCE(rag_score, 0) + COALESCE(summary_score, 0) + 
     COALESCE(generation_score, 0) + COALESCE(classification_score, 0) + 
     COALESCE(reasoning_score, 0) + COALESCE(automation_score, 0)) / 6
  ) STORED,
  
  overall_ai_readiness numeric CHECK (overall_ai_readiness >= 0 AND overall_ai_readiness <= 1),
  confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
  
  -- Intervention Classification
  intervention_type text CHECK (intervention_type IN 
    ('automate', 'augment', 'assist', 'advise', 'redesign', 'defer')),
  intervention_rationale text,
  
  -- Risk Factors
  data_availability_score numeric,
  compliance_complexity_score numeric,
  process_stability_score numeric,
  
  -- Limitations
  limitations text[],
  prerequisites text[],
  
  assessed_at timestamp with time zone DEFAULT now(),
  assessed_by text
);
```

### Intervention Type Definitions

| Type | Description | AI Role | Human Role |
|------|-------------|---------|------------|
| **Automate** | Full end-to-end automation | Primary executor | Exception handler |
| **Augment** | AI significantly assists but human drives | Enhancer | Decision maker |
| **Assist** | AI provides tools and information | Supporter | Primary executor |
| **Advise** | AI recommends, human acts | Advisor | Full control |
| **Redesign** | Process needs restructuring for AI | Future state | Current state |
| **Defer** | Not suitable for AI intervention | None | Full ownership |

---

# 3. Top 50 AI Opportunity Radar

## 3.1 Opportunity Radar Framework

The AI Opportunity Radar dynamically ranks opportunities based on multi-dimensional scoring:

```
OPPORTUNITY SCORE = 
  (ODI_Gap × 0.25) +           -- Unmet need severity
  (AI_Suitability × 0.20) +    -- Technical feasibility
  (Value_Impact × 0.20) +      -- Business value
  (Pain_Severity × 0.15) +     -- Current friction
  (Frequency × 0.10) +         -- How often performed
  (Cross_Functional × 0.10)    -- Reach across personas
```

## 3.2 Medical Affairs Top 50 AI Opportunities

| Rank | Opportunity | SP | Score | Type | Layer |
|------|-------------|----|----|------|-------|
| 1 | Evidence Gap Analysis Engine | SP02 | 9.4 | Automate | L4 |
| 2 | Medical Information Response Automation | SP02 | 9.3 | Automate | L3 |
| 3 | KOL Meeting Preparation Suite | SP03 | 9.1 | Augment | L4 |
| 4 | Congress Intelligence Synthesizer | SP03 | 8.9 | Automate | L3 |
| 5 | Field Insights NLP Aggregator | SP02 | 8.8 | Automate | L3 |
| 6 | Adverse Event Detection & Routing | SP04 | 8.7 | Automate | L3 |
| 7 | Publication Lifecycle Automation | SP02 | 8.6 | Augment | L4 |
| 8 | Competitive Intelligence Monitor | SP01 | 8.5 | Automate | L3 |
| 9 | Scientific Narrative Generator | SP02 | 8.4 | Augment | L2 |
| 10 | MLR Review Accelerator | SP04 | 8.3 | Augment | L3 |
| 11 | RWE Study Feasibility Scorer | SP02 | 8.2 | Augment | L2 |
| 12 | Payer Evidence Generator | SP01 | 8.1 | Augment | L4 |
| 13 | KOL Network Mapper (Graph Intelligence) | SP03 | 8.0 | Automate | L3 |
| 14 | Advisory Board Insight Synthesizer | SP03 | 7.9 | Augment | L2 |
| 15 | SOP Auto-Drafting & Governance Checker | SP04 | 7.8 | Automate | L3 |
| 16 | HEOR Model Parameter Finder | SP01 | 7.7 | Assist | L1 |
| 17 | Medical Strategy Co-Pilot | SP05 | 7.6 | Augment | L2 |
| 18 | Evidence Portfolio ROI Calculator | SP01 | 7.5 | Automate | L3 |
| 19 | IST Proposal Screener | SP02 | 7.4 | Augment | L2 |
| 20 | Regulatory Response Assistant | SP04 | 7.3 | Augment | L2 |
| 21 | Global/Local Strategy Alignment Analyzer | SP05 | 7.2 | Augment | L2 |
| 22 | Treatment Landscape Scanner | SP02 | 7.1 | Automate | L3 |
| 23 | Patient Journey Intelligence Engine | SP01 | 7.0 | Augment | L4 |
| 24 | Precision Medicine Data Interpreter | SP02 | 6.9 | Assist | L1 |
| 25 | Plain-Language Summary Generator | SP02 | 6.8 | Automate | L3 |
| 26 | Congress Booth Intelligence Recorder | SP03 | 6.7 | Automate | L3 |
| 27 | Publication Authorship Compliance Checker | SP04 | 6.6 | Automate | L3 |
| 28 | Safety Signal Triangulation Engine | SP04 | 6.5 | Augment | L2 |
| 29 | MSL Territory Optimization | SP05 | 6.4 | Augment | L2 |
| 30 | Cross-Functional Insight Router | SP05 | 6.3 | Automate | L3 |
| 31 | Predictive KOL Influence Model | SP03 | 6.2 | Augment | L2 |
| 32 | Predictive Inquiry Trend Forecasting | SP02 | 6.1 | Augment | L2 |
| 33 | Patient Registry Data Harmonizer | SP02 | 6.0 | Automate | L3 |
| 34 | HTA Dossier Generator | SP01 | 5.9 | Augment | L4 |
| 35 | Medical Affairs KPI Dashboard Generator | SP05 | 5.8 | Automate | L3 |
| 36 | Medical Training Pathway Automation | SP06 | 5.7 | Automate | L3 |
| 37 | Evidence Table Auto-Populator | SP02 | 5.6 | Automate | L3 |
| 38 | Clinical Guideline Comparator | SP02 | 5.5 | Assist | L1 |
| 39 | Asset Positioning Generator | SP01 | 5.4 | Augment | L2 |
| 40 | Scientific Messaging Alignment Checker | SP04 | 5.3 | Automate | L3 |
| 41 | Label Change Impact Forecaster | SP04 | 5.2 | Augment | L2 |
| 42 | Competitor Claims Analyzer | SP01 | 5.1 | Automate | L3 |
| 43 | Medical Launch Readiness Simulator | SP01 | 5.0 | Augment | L4 |
| 44 | MedComms Content Consistency Checker | SP04 | 4.9 | Automate | L3 |
| 45 | Congress Slide/Poster Generator | SP02 | 4.8 | Augment | L2 |
| 46 | Stakeholder Sentiment Tracker | SP03 | 4.7 | Automate | L3 |
| 47 | Post-Marketing Commitment Tracker | SP04 | 4.6 | Automate | L3 |
| 48 | Real-Time Evidence Quality Gatekeeper | SP04 | 4.5 | Automate | L3 |
| 49 | Use Case Discovery Engine | SP07 | 4.4 | Augment | L4 |
| 50 | Enterprise AI Opportunity Radar (Meta) | SP07 | 4.3 | Automate | L3 |

## 3.3 Opportunity Radar Visualization

```
              MEDICAL AFFAIRS AI OPPORTUNITY RADAR
                     (Impact vs Feasibility)

        HIGH IMPACT
             │
             │    ★ Evidence Gap Engine (#1)
             │    ★ MI Response Auto (#2)     ★ KOL Prep Suite (#3)
             │         ★ Congress Intel (#4)
             │              ★ Field Insights (#5)
             │    ★ Pub Lifecycle (#7)   ★ AE Detection (#6)
             │         ★ CI Monitor (#8)
             │              ★ MLR Accelerator (#10)
             │
    ─────────┼─────────────────────────────────────────────
             │
             │         ★ Strategy CoPilot (#17)
             │    ★ Territory Opt (#29)
             │              ★ Training Auto (#36)
             │
             │    ★ Sentiment Tracker (#46)
             │         ★ PMC Tracker (#47)
             │
        LOW IMPACT
             │
             └────────────────────────────────────────────
                  LOW FEASIBILITY         HIGH FEASIBILITY
```

---

# 4. AI Value Calculator

## 4.1 Value Calculator Framework

The AI Value Calculator quantifies expected benefits using a multi-dimensional model aligned with ODI outcomes.

### Input Dimensions

| Input | Description | Data Source |
|-------|-------------|-------------|
| Hours Currently Required | Time spent per task/workflow | Process analysis, time studies |
| Frequency | Daily, weekly, monthly, annual | Workflow metadata |
| Team Size & Roles | FTEs involved | Organizational data |
| Fully-Loaded Cost | Salary + benefits + overhead | HR/Finance data |
| Automation Potential | % of work automatable (0-100) | AI suitability assessment |
| Quality Uplift Potential | % improvement possible (0-100) | Benchmark analysis |
| Compliance Risk | Low/Medium/High | Risk assessment |
| Strategic Value | 1-10 score | Leadership input |
| Error Rate (Current) | % of outputs requiring rework | Quality metrics |
| Cycle Time (Current) | End-to-end duration | Process metrics |

### Output Dimensions

| Output | Formula | Unit |
|--------|---------|------|
| Time Saved | hours × frequency × automation% | Hours/year |
| Cost Avoided | time_saved × hourly_rate | $/year |
| FTE Equivalent | time_saved / 2080 | FTEs |
| Quality Improvement | error_rate × reduction% × rework_cost | $/year |
| Compliance Risk Reduction | incidents × reduction% × incident_cost | $/year |
| Strategic Impact Score | weighted multi-factor | 0-100 |
| Speed-to-Value Index | value / implementation_time | $/week |
| ROI | (total_value - investment) / investment | % |

## 4.2 Value Formula (Comprehensive)

```python
def calculate_value_score(opportunity):
    # Time & Cost Savings
    time_saved_hours = (
        opportunity.hours_per_task * 
        opportunity.frequency_per_year * 
        opportunity.automation_potential
    )
    cost_avoided = time_saved_hours * opportunity.fully_loaded_hourly_rate
    
    # Quality Improvement
    quality_value = (
        opportunity.current_error_rate * 
        opportunity.error_reduction_potential *
        opportunity.rework_cost_per_error *
        opportunity.frequency_per_year
    )
    
    # Compliance Risk Reduction
    compliance_value = (
        opportunity.compliance_incidents_per_year *
        opportunity.incident_reduction_potential *
        opportunity.cost_per_incident
    )
    
    # Strategic Impact (qualitative → quantitative)
    strategic_multiplier = 1 + (opportunity.strategic_value / 10)
    
    # Composite Value Score
    raw_value = cost_avoided + quality_value + compliance_value
    adjusted_value = raw_value * strategic_multiplier
    
    # Weighted Score (normalized 0-100)
    VALUE_SCORE = (
        (normalize(time_saved_hours) * 0.30) +
        (normalize(cost_avoided) * 0.25) +
        (normalize(quality_value) * 0.20) +
        (normalize(compliance_value) * 0.15) +
        (normalize(opportunity.strategic_value) * 0.10)
    )
    
    return {
        'raw_annual_value': adjusted_value,
        'time_saved_hours': time_saved_hours,
        'fte_equivalent': time_saved_hours / 2080,
        'value_score': VALUE_SCORE,
        'roi_estimate': adjusted_value / opportunity.implementation_cost
    }
```

## 4.3 Sample Value Calculations

### Example 1: Medical Information Response Automation

| Input | Value |
|-------|-------|
| Hours per response | 4 |
| Responses per year | 12,000 |
| Automation potential | 70% |
| Fully-loaded hourly rate | $85 |
| Current error rate | 5% |
| Error reduction potential | 80% |
| Rework cost per error | $200 |

**Calculation:**
- Time saved: 4 × 12,000 × 0.70 = 33,600 hours/year
- Cost avoided: 33,600 × $85 = $2,856,000/year
- FTE equivalent: 33,600 / 2,080 = 16.2 FTEs
- Quality value: 0.05 × 0.80 × $200 × 12,000 = $96,000/year
- **Total Annual Value: $2,952,000**

### Example 2: KOL Meeting Preparation

| Input | Value |
|-------|-------|
| Hours per prep | 2.5 |
| Meetings per year | 15,000 (fleet-wide) |
| Automation potential | 85% |
| Fully-loaded hourly rate | $95 |
| Strategic value | 8/10 |

**Calculation:**
- Time saved: 2.5 × 15,000 × 0.85 = 31,875 hours/year
- Cost avoided: 31,875 × $95 = $3,028,125/year
- Strategic multiplier: 1.8
- **Total Annual Value: $5,450,625**

## 4.4 Value Calculator Schema

```sql
CREATE TABLE opportunity_value_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id),
  
  -- Input Parameters
  hours_per_task numeric NOT NULL,
  frequency_per_year integer NOT NULL,
  automation_potential numeric CHECK (automation_potential >= 0 AND automation_potential <= 1),
  fully_loaded_hourly_rate numeric NOT NULL,
  team_size integer,
  
  -- Quality Inputs
  current_error_rate numeric,
  error_reduction_potential numeric,
  rework_cost_per_error numeric,
  
  -- Compliance Inputs
  compliance_incidents_per_year numeric,
  incident_reduction_potential numeric,
  cost_per_incident numeric,
  
  -- Strategic Inputs
  strategic_value_score integer CHECK (strategic_value_score >= 1 AND strategic_value_score <= 10),
  
  -- Calculated Outputs
  time_saved_hours_annual numeric GENERATED ALWAYS AS (
    hours_per_task * frequency_per_year * automation_potential
  ) STORED,
  
  cost_avoided_annual numeric GENERATED ALWAYS AS (
    hours_per_task * frequency_per_year * automation_potential * fully_loaded_hourly_rate
  ) STORED,
  
  fte_equivalent numeric GENERATED ALWAYS AS (
    (hours_per_task * frequency_per_year * automation_potential) / 2080
  ) STORED,
  
  quality_value_annual numeric,
  compliance_value_annual numeric,
  total_annual_value numeric,
  
  -- ROI
  implementation_cost_estimate numeric,
  roi_percentage numeric,
  payback_months numeric,
  
  -- Metadata
  calculated_at timestamp with time zone DEFAULT now(),
  calculated_by text,
  assumptions jsonb,
  confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high'))
);
```

---

*[Document continues in Part 2: AI Maturity Model, Service Layer Architecture, and Knowledge Graph Strategy]*
# VITAL Platform: Medical Affairs AI Operating System
## Master Strategy Document v4.0 - Part 2

---

# 5. Medical Affairs AI Capability Maturity Model

## 5.1 The 5-Level Maturity Framework

The AI Capability Maturity Model provides a structured progression path from manual operations to fully orchestrated AI-native Medical Affairs.

```
AI MATURITY PROGRESSION LADDER

LEVEL 5 ─ ORCHESTRATED AI ─────────────────────────────────────────────────
│ • Autonomous strategy engines with human oversight
│ • Predictive intelligence (KOL shifts, evidence gaps, market changes)
│ • Cross-functional multi-agent orchestration
│ • Full Medical Affairs AI Operating System
│ • Continuous learning and self-optimization
│ • Enterprise-wide AI governance and ethics
├──────────────────────────────────────────────────────────────────────────

LEVEL 4 ─ AUTOMATED AI ────────────────────────────────────────────────────
│ • End-to-end workflow automation (MI, Publications, Insights)
│ • Evidence gap engines with scoring and prioritization
│ • Automated compliance gating with HITL checkpoints
│ • Publication lifecycle automation
│ • Real-time dashboards and performance analytics
│ • Integrated CRM, Safety, CTMS connections
├──────────────────────────────────────────────────────────────────────────

LEVEL 3 ─ AUGMENTED AI ────────────────────────────────────────────────────
│ • Multi-agent Ask Panel reasoning for complex questions
│ • AI-assisted drafting (manuscripts, SRDs, strategies)
│ • NLP-powered insight clustering and synthesis
│ • Role-specific copilots (MSL, MI, MD copilots)
│ • Persona-aware adaptive experiences
│ • Domain-tuned prompts and retrieval
├──────────────────────────────────────────────────────────────────────────

LEVEL 2 ─ ASSISTED AI ─────────────────────────────────────────────────────
│ • Ask Expert for lookups and Q&A
│ • Basic RAG search across approved content
│ • Template-based generation
│ • Simple summarization and extraction
│ • Entry-level AI governance rules
├──────────────────────────────────────────────────────────────────────────

LEVEL 1 ─ MANUAL ──────────────────────────────────────────────────────────
│ • No AI automation
│ • Manual processes for all MA activities
│ • Fragmented, siloed data and tools
│ • Compliance through manual review only
└──────────────────────────────────────────────────────────────────────────
```

## 5.2 Detailed Level Descriptions

### LEVEL 1: MANUAL

**Characteristics:**
- All processes are manual and paper/spreadsheet-based
- Field insights stored in emails, documents, disconnected systems
- Medical Information relies on copy-paste workflows
- Publication planning managed through spreadsheets
- Evidence planning is subjective and slow
- No unified knowledge base or content management
- Compliance audits require extensive manual preparation

**Typical Technology Stack:**
- Email and file shares
- Spreadsheets (Excel, Google Sheets)
- Siloed databases
- Manual CRM data entry
- No AI or automation

**Risks:**
- High labor cost and inefficiency
- Significant compliance risk
- Slow response times
- Inconsistent scientific communication
- Knowledge loss with staff turnover

**Value Metrics:**
- Baseline measurement state
- High manual effort hours
- Slow cycle times
- Variable quality

### LEVEL 2: ASSISTED AI

**Characteristics:**
- Teams use "Ask Expert" for lookups and Q&A
- Basic RAG search across approved medical content
- Simple summarization and scientific assistance
- Entry-level copilots for drafting non-regulatory text
- First AI governance rules established

**Example Capabilities:**
- "Summarize this clinical trial abstract"
- "Find relevant SRDs for this inquiry topic"
- "Generate a meeting agenda template"
- "Draft internal communication email"

**Technology Stack:**
- Basic vector database (Pinecone, Weaviate)
- Simple RAG pipelines
- Single-agent LLM integration
- Content access controls
- Basic audit logging

**Value Gains:**
- 20-30% time savings for individual tasks
- Reliable access to approved content
- Early adoption builds digital fluency
- Foundation for advanced capabilities

**KPIs:**
- 20% faster MI responses
- 15% improved document retrieval
- 10% better meeting prep efficiency

### LEVEL 3: AUGMENTED AI

**Characteristics:**
- Multi-agent "Ask Panel" reasoning for complex questions
- NLP-powered insight extraction and clustering
- SOP-driven but AI-assisted MI workflows
- AI-assisted publication drafting (intro, methods, discussion)
- Role-specific copilots (MSL, MI Specialist, Medical Director)
- Persona-aware adaptive experiences

**Example Capabilities:**
- "Refine this scientific narrative for accuracy and clarity"
- "Synthesize these 50 MSL call notes into key insights"
- "Provide multi-expert analysis of this regulatory query"
- "Draft manuscript introduction with proper citations"

**Technology Stack:**
- Hybrid RAG + ontology retrieval
- Multi-agent orchestration (LangGraph)
- Domain-tuned prompts and models
- HITL validation steps embedded
- Panel reasoning patterns (Delphi, Socratic)

**Value Gains:**
- 35-50% productivity improvement
- Consistent, higher-quality scientific outputs
- Faster decision cycles
- Reduced cognitive load on experts

**KPIs:**
- 40% faster insight synthesis
- 30% reduction in manual drafting
- 25% faster congress reporting
- 20% improvement in response consistency

### LEVEL 4: AUTOMATED AI

**Characteristics:**
- Full multi-step workflow automation for key processes
- Evidence gap engines with scoring and prioritization
- Automated compliance gating with human checkpoints
- Real-time dashboards and performance reporting
- Integrated data flows from CRM, Safety, CTMS

**Automated Processes:**
- Medical Information end-to-end
- Publication lifecycle management
- Insight aggregation and synthesis
- Compliance document review
- Congress intelligence extraction
- AE detection and routing

**Technology Stack:**
- LangGraph workflow orchestration
- Comprehensive AI governance stack
- Role-based workflow permissions
- Automated quality gates
- Full audit trail and lineage

**Value Gains:**
- 50-70% reduction in manual workload
- Real-time visibility across MA operations
- Systematic compliance-by-design
- Predictable, reliable outputs

**KPIs:**
- 60% MI workflow automation
- 50% publication cycle time reduction
- 70% reduction in admin overhead
- 90%+ compliance adherence

### LEVEL 5: ORCHESTRATED AI

**Characteristics:**
- Medical Affairs functions run on AI Operating System
- Proactive multi-agent reasoning performs:
  - Risk identification before issues emerge
  - Evidence prediction for future needs
  - Opportunity detection across functions
  - Cross-functional scenario planning
- Autonomous scientific recommendations with human signoff
- Seamless integration with enterprise systems
- Continuous learning and model improvement

**Example Capabilities:**
- "Predict which KOLs will shift position in next NCCN update"
- "Identify evidence gaps that will affect market access in 18 months"
- "Generate full therapeutic area strategy from latest insights"
- "Simulate launch readiness scenarios across markets"
- "Recommend optimal resource allocation for evidence generation"

**Technology Stack:**
- Medical Affairs Intelligence Graph (MAIG)
- Full multi-agent orchestration
- Enterprise ontology integration
- Predictive ML models
- Autonomous workflow composition
- Advanced governance and ethics framework

**Value Gains:**
- Strategic uplift, not just efficiency
- Medical Affairs becomes predictive partner
- Real-time scientific intelligence engine
- Competitive advantage through AI leadership

**KPIs:**
- Proactive evidence insights generated
- Predictive KOL influence accuracy
- Autonomous strategy proposals accepted
- Cross-functional alignment improvement
- Innovation pipeline acceleration

## 5.3 Maturity Assessment Framework

### Assessment Dimensions

Each Medical Affairs function is scored across 6 dimensions:

| Dimension | Description | Assessment Questions |
|-----------|-------------|---------------------|
| **Data Readiness** | Availability, quality, governance | Is data structured? Tagged? Accessible? Compliant? |
| **Process Automation** | Manual → automated spectrum | What % of steps are automated? Which processes? |
| **AI Integration Depth** | Basic → multi-agent | Single agent? Panels? Workflows? Orchestration? |
| **Scientific Intelligence** | None → predictive | Reactive? Descriptive? Diagnostic? Predictive? |
| **Compliance Controls** | Manual → built-in | Manual review? Automated checks? Proactive? |
| **Cross-Functional Integration** | Isolated → connected | Siloed? Integrated? Orchestrated across functions? |

### Capability Rubric

```
                       CAPABILITY ASSESSMENT RUBRIC

Dimension                   L1     L2     L3     L4     L5
────────────────────────────────────────────────────────────
Data Readiness              ●      ●●     ●●●    ●●●●   ●●●●●
Process Automation          ●      ●●     ●●●    ●●●●   ●●●●●
AI Integration Depth        ●      ●●     ●●●    ●●●●   ●●●●●
Scientific Intelligence     ●      ●●     ●●●    ●●●●   ●●●●●
Compliance-by-Design        ●      ●●     ●●●    ●●●●   ●●●●●
Cross-Functional Sync       ●      ●●     ●●●    ●●●●   ●●●●●
────────────────────────────────────────────────────────────
Legend: ● = 0-20%  ●● = 20-40%  ●●● = 40-60%  ●●●● = 60-80%  ●●●●● = 80-100%
```

### Strategic Pillar Maturity Heatmap

```
MEDICAL AFFAIRS AI MATURITY HEATMAP (BY STRATEGIC PILLAR)

Pillar                                  L1   L2   L3   L4   L5
──────────────────────────────────────────────────────────────
SP01 – Growth & Market Access           ███  ████ ████ ███  ██
SP02 – Scientific Excellence            ███  █████ █████ ████ ██
SP03 – Stakeholder Engagement           ███  ████ █████ ████ █
SP04 – Compliance & Quality             ███  ███  ████ ████ ██
SP05 – Operational Excellence           ███  ███  ████ █████ ███
SP06 – Talent Development               ██   ███  ████ ███  ██
SP07 – Innovation & Digital             ███  ████ █████ █████ ██

Legend: █ = Current state intensity (more █ = higher concentration)
```

**Interpretation:**
- **SP02, SP03, SP05** show fastest upward mobility (information-driven)
- **SP04 (Compliance)** requires governance before advancing to L4-L5
- **SP07 (Innovation)** becomes catalyst for orchestration
- **SP01 (Market Access)** benefits disproportionately from evidence automation

## 5.4 Role-Based Maturity Playbooks

### MSL (Medical Science Liaison) Progression

```
L1 → Manual KOL notes, manual prep, reactive insights
     │
     ▼
L2 → Ask Expert for clinical intelligence, basic lookups
     │
     ▼
L3 → Personalized meeting briefs, insight summarization, territory analysis
     │
     ▼
L4 → Automated HCP engagement workflows, real-time intelligence dashboards
     │
     ▼
L5 → Predictive KOL modeling, proactive medical strategy contributions
```

### Medical Information Specialist Progression

```
L1 → Manual SRDs, manual AE detection, copy-paste responses
     │
     ▼
L2 → RAG search across PDF libraries, template matching
     │
     ▼
L3 → AI-assisted SRD drafting, consistency checks, source validation
     │
     ▼
L4 → Automated MI workflows (classify → draft → review → send)
     │
     ▼
L5 → Orchestrated MI + safety surveillance + predictive inquiry patterns
```

### Medical Director Progression

```
L1 → Manual evidence reviews, spreadsheet tracking
     │
     ▼
L2 → Ask Expert for guidelines, CI, payer insights
     │
     ▼
L3 → AI-assisted strategy narrative, insight synthesis, scenario analysis
     │
     ▼
L4 → Evidence gap engines, publication engines, automated dashboards
     │
     ▼
L5 → Multi-agent strategy orchestration, predictive evidence planning
```

### Head of Medical Affairs Progression

```
L1 → Manual KPI reviews, manually assembled presentations
     │
     ▼
L2 → Automated reporting via Ask Expert Q&A
     │
     ▼
L3 → AI-assisted decision briefs, cross-functional insights
     │
     ▼
L4 → Automated Strategic MA Dashboard, business review workflows
     │
     ▼
L5 → Predictive strategic cockpit, autonomous opportunity identification
```

## 5.5 Maturity Assessment Schema

```sql
CREATE TABLE maturity_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  assessment_scope text NOT NULL, -- 'organization', 'function', 'department', 'role'
  scope_entity_id uuid, -- References relevant entity based on scope
  
  -- Assessment Metadata
  assessment_date date NOT NULL,
  assessed_by uuid REFERENCES user_profiles(id),
  methodology_version text DEFAULT '1.0',
  
  -- Dimension Scores (1-5)
  data_readiness_score integer CHECK (data_readiness_score >= 1 AND data_readiness_score <= 5),
  process_automation_score integer CHECK (process_automation_score >= 1 AND process_automation_score <= 5),
  ai_integration_score integer CHECK (ai_integration_score >= 1 AND ai_integration_score <= 5),
  scientific_intelligence_score integer CHECK (scientific_intelligence_score >= 1 AND scientific_intelligence_score <= 5),
  compliance_controls_score integer CHECK (compliance_controls_score >= 1 AND compliance_controls_score <= 5),
  cross_functional_score integer CHECK (cross_functional_score >= 1 AND cross_functional_score <= 5),
  
  -- Composite Maturity Level
  overall_maturity_level integer GENERATED ALWAYS AS (
    ROUND((data_readiness_score + process_automation_score + ai_integration_score +
           scientific_intelligence_score + compliance_controls_score + cross_functional_score) / 6.0)
  ) STORED,
  
  -- Evidence
  supporting_evidence jsonb,
  improvement_recommendations jsonb,
  target_maturity_level integer,
  target_date date,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'archived'))
);

CREATE TABLE maturity_dimension_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES maturity_assessments(id),
  dimension text NOT NULL,
  current_state_description text,
  gaps_identified text[],
  quick_wins text[],
  strategic_initiatives text[],
  dependencies text[],
  estimated_effort text,
  priority_rank integer
);
```

---

# 6. Four-Tier Service Layer Architecture

## 6.1 Service Layer Overview

The VITAL Platform implements a four-tier service architecture that progressively scales AI capability based on task complexity, compliance requirements, and user context.

```
                    4-LAYER SERVICE ARCHITECTURE

┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 4 — SOLUTION BUILDER                                               │
│ End-to-end orchestration of multiple workflows, agents, and panels       │
│ • Medical Strategy Suite  • Publication Suite  • HCP Engagement Suite    │
│ • Evidence Portfolio Manager  • Launch Excellence Suite                  │
│ Response Time: Hours-Days │ Query Volume: ~2% │ Complexity: Strategic   │
└──────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ Escalates if need = "comprehensive"
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 3 — WORKFLOWS                                                      │
│ Multi-step LangGraph automation with HITL checkpoints                    │
│ • MI Response Workflow  • SRD Generation  • Publication Lifecycle        │
│ • AE Detection & Routing  • Congress Intelligence  • Insight Synthesis   │
│ Response Time: Minutes-Hours │ Query Volume: ~8% │ Complexity: Process   │
└──────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ Escalates if need = "multi-step"
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 2 — ASK PANEL                                                      │
│ Multiple AI experts collaborate using structured reasoning patterns      │
│ • Delphi Consensus  • Socratic Exploration  • Adversarial Debate         │
│ • Parallel Analysis  • Sequential Refinement                             │
│ Response Time: 10-30s │ Query Volume: ~20% │ Complexity: Multi-view      │
└──────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ Escalates if need = "multi-view"
┌──────────────────────────────────────────────────────────────────────────┐
│ LAYER 1 — ASK EXPERT                                                     │
│ Single specialized agent with RAG retrieval                              │
│ • Quick lookups  • Dosing info  • MoA explanations  • Reference search   │
│ • Simple drafting  • Template completion                                 │
│ Response Time: Seconds │ Query Volume: ~70% │ Complexity: Simple         │
└──────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Service Layer Router Logic

### Routing Decision Matrix

The Service Layer Router evaluates each request across multiple dimensions:

```python
def route_request(request, persona, context):
    # Scoring dimensions
    ambiguity = assess_ambiguity(request)           # 0-100
    steps_required = estimate_steps(request)        # 1-N
    cross_functional = assess_scope(request)        # 0-100
    compliance_sensitivity = assess_risk(request)   # 0-100
    time_urgency = assess_urgency(request)          # 0-100
    
    # Persona-based adjustments
    archetype = persona.archetype
    ai_maturity = persona.ai_maturity_score
    
    # Routing logic
    if cross_functional >= 70 or steps_required >= 10:
        return "L4_SOLUTION_BUILDER"
    
    elif steps_required >= 3 or compliance_sensitivity >= 80:
        if archetype == "skeptic":
            return "L3_WORKFLOW_HITL_HEAVY"
        return "L3_WORKFLOW"
    
    elif ambiguity >= 60 or requires_multiple_perspectives(request):
        if archetype == "orchestrator":
            return "L2_PANEL_FULL"
        return "L2_PANEL_LITE"
    
    else:
        if archetype == "learner":
            return "L1_EXPERT_GUIDED"
        return "L1_EXPERT"
```

### Routing Signals by Request Type

| Request Pattern | Primary Signals | Recommended Layer |
|-----------------|-----------------|-------------------|
| Simple lookup | Low ambiguity, single step | L1 Ask Expert |
| "What is the dosing for..." | Low ambiguity, reference needed | L1 Ask Expert |
| "Compare these two trials" | Multi-perspective needed | L2 Ask Panel |
| "Should we pursue this study?" | Strategic, multi-view | L2 Ask Panel |
| "Generate SRD for this inquiry" | Multi-step, compliance | L3 Workflow |
| "Prepare KOL meeting brief" | Multi-step, synthesis | L3 Workflow |
| "Develop evidence strategy" | Cross-functional, strategic | L4 Solution Builder |
| "Plan product launch" | Comprehensive, multi-domain | L4 Solution Builder |

## 6.3 Layer 1: Ask Expert (Single Agent)

### Purpose
Fast, accurate responses for straightforward questions using a single specialized agent with RAG retrieval.

### Architecture

```
USER QUERY
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│ Intent Classifier│────▶│ Agent Selector  │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Domain Expert   │
                        │ Agent           │
                        │ (e.g., Clinical │
                        │  Data Agent)    │
                        └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────┐
              │ RAG     │  │ Tools   │  │ Knowledge│
              │ Library │  │ (APIs)  │  │ Graph   │
              └─────────┘  └─────────┘  └─────────┘
                    │            │            │
                    └────────────┼────────────┘
                                 ▼
                        ┌─────────────────┐
                        │ Response        │
                        │ Generator       │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Guardrails &    │
                        │ Compliance Check│
                        └────────┬────────┘
                                 │
                                 ▼
                            RESPONSE
```

### Ontology Context Injection

For each L1 query, the system injects:
- **Role context**: Current user's role, responsibilities, permissions
- **JTBD context**: Relevant job being performed
- **Evidence context**: Approved sources and citations
- **Compliance context**: Applicable guardrails and restrictions

### Example Agents

| Agent | Domain | Sample Queries |
|-------|--------|----------------|
| Clinical Data Agent | Trial data, endpoints, safety | "What were primary endpoints in Study X?" |
| Regulatory Agent | Guidelines, labels, submissions | "What does the EMA label say about Y?" |
| Literature Agent | Publications, abstracts, reviews | "Find recent meta-analyses on Z" |
| Competitive Intel Agent | Competitor data, positioning | "What claims does competitor A make?" |
| Therapeutic Area Agent | Disease, treatment, pathways | "Explain mechanism of action for..." |

## 6.4 Layer 2: Ask Panel (Multi-Agent Reasoning)

### Purpose
Complex questions requiring multiple perspectives, synthesized through structured reasoning patterns.

### Architecture

```
USER QUERY
    │
    ▼
┌─────────────────────────────────────────────────┐
│               PANEL ORCHESTRATOR                 │
│  • Determines panel composition                  │
│  • Selects reasoning pattern                     │
│  • Manages agent interactions                    │
│  • Synthesizes final output                      │
└─────────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Agent 1 │   │ Agent 2 │   │ Agent 3 │
│ (e.g.,  │   │ (e.g.,  │   │ (e.g.,  │
│ Clinical│   │ Regulat.│   │ HEOR    │
│ Expert) │   │ Expert) │   │ Expert) │
└────┬────┘   └────┬────┘   └────┬────┘
     │             │             │
     └─────────────┼─────────────┘
                   ▼
         ┌─────────────────┐
         │ Reasoning Engine│
         │ (Pattern-based) │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Synthesis Layer │
         │ • Consensus     │
         │ • Conflicts     │
         │ • Confidence    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Arbitration     │
         │ (if needed)     │
         └────────┬────────┘
                  │
                  ▼
          SYNTHESIZED RESPONSE
```

### Reasoning Patterns

| Pattern | Description | Use Case | Agent Interaction |
|---------|-------------|----------|-------------------|
| **Delphi Consensus** | Iterative rounds to reach agreement | Evidence prioritization | Sequential refinement |
| **Socratic Exploration** | Deep questioning to uncover insights | Root cause analysis | Probing dialogue |
| **Adversarial Debate** | Opposing viewpoints challenged | Strategic decisions | Point-counterpoint |
| **Parallel Analysis** | Independent analysis, then synthesis | Comprehensive review | Simultaneous + merge |
| **Sequential Refinement** | Each agent builds on previous | Complex synthesis | Chain of thought |

### Panel Composition Logic

```python
def compose_panel(query, jtbd, context):
    # Identify required expertise domains
    domains = extract_required_domains(query, jtbd)
    
    # Select agents for each domain
    agents = []
    for domain in domains:
        agent = select_best_agent(
            domain=domain,
            persona_context=context.persona,
            compliance_level=context.compliance_requirements
        )
        agents.append(agent)
    
    # Add cross-functional agents if needed
    if requires_cross_functional(query):
        agents.append(select_integration_agent())
    
    # Select reasoning pattern
    pattern = select_reasoning_pattern(
        query_type=classify_query(query),
        domain_count=len(domains),
        controversy_level=assess_controversy(query)
    )
    
    return Panel(
        agents=agents,
        pattern=pattern,
        moderator=select_moderator(pattern),
        max_rounds=calculate_rounds(pattern),
        consensus_threshold=0.7
    )
```

### Panel Schema

```sql
CREATE TABLE panel_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  description text,
  
  -- Composition
  min_agents integer DEFAULT 3,
  max_agents integer DEFAULT 7,
  required_domains text[],
  
  -- Reasoning
  reasoning_pattern text NOT NULL CHECK (reasoning_pattern IN 
    ('delphi', 'socratic', 'adversarial', 'parallel', 'sequential')),
  max_rounds integer DEFAULT 3,
  consensus_threshold numeric DEFAULT 0.7,
  timeout_seconds integer DEFAULT 60,
  
  -- Arbitration
  arbitration_enabled boolean DEFAULT true,
  arbitrator_agent_id uuid REFERENCES agents(id),
  
  is_active boolean DEFAULT true
);

CREATE TABLE panel_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id uuid NOT NULL REFERENCES panel_configurations(id),
  query text NOT NULL,
  context jsonb,
  
  -- Execution
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  rounds_executed integer,
  final_consensus_score numeric,
  
  -- Outcome
  synthesized_response text,
  dissenting_views jsonb,
  confidence_level text,
  sources_cited jsonb
);

CREATE TABLE panel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES panel_discussions(id),
  agent_id uuid NOT NULL REFERENCES agents(id),
  round_number integer NOT NULL,
  message_type text CHECK (message_type IN 
    ('initial', 'response', 'challenge', 'refinement', 'synthesis')),
  content text NOT NULL,
  position text, -- 'agree', 'disagree', 'neutral', 'abstain'
  confidence numeric,
  reasoning text,
  sources jsonb,
  created_at timestamp with time zone DEFAULT now()
);
```

## 6.5 Layer 3: Automated Workflows

### Purpose
Multi-step process automation with LangGraph orchestration, compliance gates, and human-in-the-loop checkpoints.

### Architecture

```
WORKFLOW TRIGGER
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LANGGRAPH ORCHESTRATOR                        │
│  • Loads workflow template                                       │
│  • Initializes state                                             │
│  • Manages step execution                                        │
│  • Handles branching and conditions                              │
└─────────────────────────────────────────────────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Stage 1     │     │ Stage 2     │     │ Stage N     │
│ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │ Task 1  │ │     │ │ Task 1  │ │     │ │ Task 1  │ │
│ └────┬────┘ │     │ └────┬────┘ │     │ └────┬────┘ │
│      ▼      │     │      ▼      │     │      ▼      │
│ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │ Task 2  │ │     │ │ Task 2  │ │     │ │ Task 2  │ │
│ └────┬────┘ │     │ └────┬────┘ │     │ └────┬────┘ │
│      ▼      │     │      ▼      │     │      ▼      │
│ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │
│ │ HITL?   │ │     │ │ Complia.│ │     │ │ Output  │ │
│ │ Gate    │ │     │ │ Check   │ │     │ │ Delivery│ │
│ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌─────────────┐
                    │ Audit Log   │
                    │ & Lineage   │
                    └─────────────┘
```

### LangGraph Compiler Specification

The system compiles workflow templates into executable LangGraph DAGs:

```python
def compile_workflow(template_id):
    """
    Converts workflow_templates → tasks → steps → lang_components
    into an executable LangGraph DAG.
    """
    # 1. Load template and structure
    template = load_template(template_id)
    stages = load_stages(template.id)
    
    # 2. Build graph structure
    graph = StateGraph(WorkflowState)
    
    for stage in stages:
        tasks = load_tasks(stage.id)
        
        for task in tasks:
            steps = load_steps(task.id)
            
            for step in steps:
                # Load the reusable component
                component = load_component(step.component_id)
                
                # Create node with parameter binding
                node = create_node(
                    name=step.name,
                    component=component,
                    parameters=bind_parameters(step.parameters, template.context)
                )
                
                graph.add_node(step.id, node)
            
            # Add intra-task edges
            add_task_edges(graph, steps)
        
        # Add inter-task edges
        add_stage_edges(graph, tasks)
    
    # 3. Add compliance gates
    for gate in template.compliance_gates:
        graph.add_node(gate.id, create_compliance_node(gate))
        insert_gate_edges(graph, gate)
    
    # 4. Add HITL checkpoints
    for checkpoint in template.hitl_checkpoints:
        graph.add_node(checkpoint.id, create_hitl_node(checkpoint))
        insert_checkpoint_edges(graph, checkpoint)
    
    # 5. Compile and return
    return graph.compile()
```

### Example Workflow: Medical Information Response

```
MI RESPONSE WORKFLOW

Stage 1: Intake & Classification
├── Task 1.1: Receive Inquiry
│   └── Step: Parse inquiry content
│   └── Step: Extract key terms
├── Task 1.2: Classify Inquiry
│   └── Step: Determine type (on-label, off-label, AE)
│   └── Step: Assign priority
│   └── Step: Route to appropriate queue
├── Task 1.3: Check for Safety Signal
│   └── Step: AE keyword detection
│   └── [COMPLIANCE GATE: If AE detected, branch to Safety workflow]

Stage 2: Research & Drafting
├── Task 2.1: Retrieve Relevant SRDs
│   └── Step: Semantic search across SRD library
│   └── Step: Rank by relevance
│   └── Step: Return top matches
├── Task 2.2: Generate Draft Response
│   └── Step: Select response template
│   └── Step: Populate with SRD content
│   └── Step: Add citations
├── Task 2.3: Compliance Pre-Check
│   └── Step: Promotional language detection
│   └── Step: Off-label claim check
│   └── [COMPLIANCE GATE: Flag issues for review]

Stage 3: Review & Approval
├── Task 3.1: Medical Review
│   └── [HITL CHECKPOINT: Medical reviewer approval]
├── Task 3.2: Quality Check
│   └── Step: Spelling/grammar verification
│   └── Step: Citation validation
│   └── Step: Format compliance

Stage 4: Delivery & Logging
├── Task 4.1: Format Response
│   └── Step: Apply channel-specific formatting
│   └── Step: Generate tracking ID
├── Task 4.2: Deliver Response
│   └── Step: Send via appropriate channel
│   └── Step: Log delivery confirmation
├── Task 4.3: Archive & Metrics
│   └── Step: Store in MI database
│   └── Step: Update response metrics
│   └── Step: Trigger satisfaction survey
```

## 6.6 Layer 4: Solution Builder

### Purpose
End-to-end orchestration of multiple workflows, agents, and panels to deliver comprehensive solutions for complex strategic needs.

### Architecture

```
SOLUTION REQUEST
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOLUTION COMPOSER                             │
│  • Decomposes request into component needs                       │
│  • Selects and sequences building blocks                         │
│  • Orchestrates cross-functional integration                     │
│  • Manages dependencies and state                                │
└─────────────────────────────────────────────────────────────────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │                       │                       │
    ▼                       ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ L3 Workflow │     │ L2 Panel    │     │ L1 Expert   │
│ (Evidence   │     │ (Strategic  │     │ (Data       │
│ Generation) │     │ Analysis)   │     │ Retrieval)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
               ┌─────────────────────┐
               │ Integration Layer   │
               │ • Data aggregation  │
               │ • Conflict resolution│
               │ • Synthesis         │
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │ Output Assembly     │
               │ • Executive summary │
               │ • Detailed reports  │
               │ • Action items      │
               │ • Dashboards        │
               └──────────┬──────────┘
                          │
                          ▼
                  COMPREHENSIVE SOLUTION
```

### Solution Suite Examples

| Suite | Components | Output |
|-------|------------|--------|
| **Medical Strategy Suite** | Evidence Gap Panel + CI Workflow + Strategic Analysis Panel + Narrative Generator | TA strategy document, evidence roadmap, competitive positioning |
| **Publication Suite** | Manuscript Workflow + Author Panel + Compliance Workflow + Journal Matcher | Complete publication package, submission-ready |
| **HCP Engagement Suite** | KOL Profiler + Territory Analyzer + Insight Synthesizer + Meeting Prep Workflow | Pre-call planning, post-call analysis, relationship mapping |
| **Launch Excellence Suite** | Readiness Assessment Panel + Training Workflow + Message Testing + Scenario Planner | Launch dashboard, training materials, risk mitigation |
| **Evidence Portfolio Manager** | Gap Analysis + Study Tracker + ROI Calculator + Publication Pipeline | Portfolio dashboard, investment recommendations |

### Solution Decomposition Logic

```python
def decompose_solution(request, context):
    """
    Breaks down a complex solution request into component needs
    and assembles the execution plan.
    """
    # 1. Identify JTBDs being addressed
    jtbds = identify_jtbds(request, context.persona)
    
    # 2. For each JTBD, identify required capabilities
    capabilities = []
    for jtbd in jtbds:
        caps = get_jtbd_capabilities(jtbd)
        capabilities.extend(caps)
    
    # 3. Map capabilities to building blocks
    building_blocks = []
    for cap in deduplicate(capabilities):
        block = select_building_block(cap)
        building_blocks.append({
            'capability': cap,
            'block_type': block.type,  # 'workflow', 'panel', 'expert', 'tool'
            'block_id': block.id,
            'priority': cap.priority,
            'dependencies': block.dependencies
        })
    
    # 4. Sequence based on dependencies
    execution_plan = topological_sort(building_blocks)
    
    # 5. Identify integration points
    integration_points = identify_integration_points(execution_plan)
    
    # 6. Compose solution structure
    return Solution(
        jtbds=jtbds,
        execution_plan=execution_plan,
        integration_points=integration_points,
        estimated_duration=calculate_duration(execution_plan),
        human_checkpoints=identify_checkpoints(execution_plan)
    )
```

---

# 7. AI Governance Framework

## 7.1 Governance Principles

Medical Affairs AI requires one of the strictest governance frameworks in the enterprise due to:
- **Patient safety implications**
- **Regulatory compliance requirements**
- **Scientific accuracy demands**
- **Promotional/non-promotional boundaries**
- **Global jurisdictional variations**

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Scientific Accuracy** | All outputs grounded in verifiable evidence | Citation requirements, source validation |
| **Compliance-by-Design** | Promotional vs non-promotional enforced | Guardrails, content classification |
| **Traceability** | Every answer includes auditable sources | Lineage tracking, audit logs |
| **Guardrails** | No hallucinations, no clinical recommendations | Safety triggers, output validation |
| **Explainability** | All decisions defensible to regulators | Reasoning chains, decision logs |
| **Human Oversight** | Appropriate HITL for high-risk outputs | Checkpoint configuration |

## 7.2 Governance Architecture

```
                AI GOVERNANCE STACK

                 ┌──────────────────────────┐
                 │ REGULATORY GUARDRAILS     │
                 │ (FDA, EMA, PMDA, EFPIA,  │
                 │  PhRMA, ABPI, local laws)│
                 └──────────────────────────┘
                             ▲
                             │
                 ┌──────────────────────────┐
                 │ CONTENT CLASSIFICATION   │
                 │ (Promotional/Non-promo/  │
                 │  On-label/Off-label/AE)  │
                 └──────────────────────────┘
                             ▲
                             │
                 ┌──────────────────────────┐
                 │ CONTROLLED RAG ACCESS    │
                 │ (Approved materials only,│
                 │  source-aware retrieval) │
                 └──────────────────────────┘
                             ▲
                             │
                 ┌──────────────────────────┐
                 │ HITL CHECKPOINTS         │
                 │ (Medical, Legal,         │
                 │  Regulatory review gates)│
                 └──────────────────────────┘
                             ▲
                             │
                 ┌──────────────────────────┐
                 │ WORKFLOW LOGIC           │
                 │ (SOP-based execution,    │
                 │  compliance gating)      │
                 └──────────────────────────┘
                             ▲
                             │
                 ┌──────────────────────────┐
                 │ AUDIT & LINEAGE          │
                 │ (Full traceability,      │
                 │  version control)        │
                 └──────────────────────────┘
```

## 7.3 Governance Controls by Function

| Function | Governance Level | HITL Requirements | Special Controls |
|----------|------------------|-------------------|------------------|
| **Medical Information** | Strictest (L3-L4 HITL mandatory) | Medical review before external | AE detection, off-label flags |
| **Field Medical** | High (approved content only) | Manager review for sensitive | KOL interaction logging |
| **Publications** | High (GPP3 + authorship) | Editorial, MLR, Legal | Authorship verification |
| **Evidence Generation** | High (scientific integrity) | Statistician review | Reproducibility checks |
| **Medical Strategy** | Moderate (internal) | Leadership review | Non-promotional verification |
| **Congress/Events** | Moderate | Content approval | Fair balance checks |

## 7.4 Safety Triggers Schema

```sql
CREATE TABLE safety_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  description text,
  
  -- Trigger Configuration
  trigger_type text NOT NULL CHECK (trigger_type IN 
    ('keyword', 'pattern', 'classification', 'threshold', 'composite')),
  trigger_condition jsonb NOT NULL,
  
  -- Detection
  applies_to_layers text[] DEFAULT ARRAY['L1', 'L2', 'L3', 'L4'],
  applies_to_content_types text[],
  
  -- Actions
  action_type text NOT NULL CHECK (action_type IN 
    ('block', 'flag', 'escalate', 'log', 'notify', 'redirect')),
  action_config jsonb,
  escalation_path text,
  notification_recipients text[],
  
  -- Risk Classification
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  regulatory_reference text,
  
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE safety_trigger_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id uuid NOT NULL REFERENCES safety_triggers(id),
  
  -- Context
  session_id uuid,
  user_id uuid REFERENCES user_profiles(id),
  agent_id uuid REFERENCES agents(id),
  workflow_execution_id uuid,
  
  -- Detection Details
  triggered_at timestamp with time zone DEFAULT now(),
  input_content text,
  detection_reason text,
  confidence_score numeric,
  
  -- Action Taken
  action_taken text,
  resolution_status text,
  resolved_by uuid REFERENCES user_profiles(id),
  resolved_at timestamp with time zone,
  resolution_notes text
);
```

## 7.5 Compliance Checkpoints

```sql
CREATE TABLE compliance_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id uuid NOT NULL REFERENCES workflow_templates(id),
  
  -- Checkpoint Definition
  checkpoint_name text NOT NULL,
  checkpoint_type text CHECK (checkpoint_type IN 
    ('approval', 'review', 'verification', 'certification', 'attestation')),
  position_after_task_id uuid REFERENCES workflow_tasks(id),
  
  -- Requirements
  required_roles text[], -- Roles that can approve
  min_approvers integer DEFAULT 1,
  approval_mode text DEFAULT 'any' CHECK (approval_mode IN ('any', 'all', 'majority')),
  timeout_hours integer,
  escalation_path text,
  
  -- Compliance Mapping
  regulatory_requirement text,
  sop_reference text,
  
  is_mandatory boolean DEFAULT true,
  is_active boolean DEFAULT true
);

CREATE TABLE checkpoint_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id uuid NOT NULL REFERENCES compliance_checkpoints(id),
  workflow_execution_id uuid NOT NULL REFERENCES workflow_executions(id),
  
  -- Approval Details
  approver_id uuid NOT NULL REFERENCES user_profiles(id),
  decision text CHECK (decision IN ('approved', 'rejected', 'returned', 'escalated')),
  decision_reason text,
  conditions text[],
  
  -- Timing
  submitted_at timestamp with time zone DEFAULT now(),
  decided_at timestamp with time zone,
  
  -- Evidence
  signature_hash text,
  supporting_documents jsonb
);
```

---

*[Document continues in Part 3: Knowledge Graph Architecture, Implementation Roadmap, and Technical Specifications]*
# VITAL Platform: Medical Affairs AI Operating System
## Master Strategy Document v4.0 - Part 3

---

# VOLUME II: TECHNICAL ARCHITECTURE

---

# 8. Knowledge Graph Architecture

## 8.1 Hybrid Data Architecture Overview

The VITAL Platform implements a **hybrid data architecture** that combines the strengths of three complementary systems:

| System | Purpose | Strengths | Data Types |
|--------|---------|-----------|------------|
| **PostgreSQL** | Transactional source of truth | ACID compliance, complex queries, RLS | Entities, relationships, metadata |
| **Neo4j** | Relationship reasoning | Graph traversal, pathfinding, pattern matching | Connections, hierarchies, influence |
| **Pinecone** | Semantic similarity | Vector search, embeddings, RAG | Documents, chunks, concepts |

### Data Flow Architecture

```
                    HYBRID DATA ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                   │
│   Copilots │ Dashboards │ APIs │ Workflows │ Agents │ Panels               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
           │   GraphQL   │  │  REST API   │  │ Streaming   │
           │   Gateway   │  │   Gateway   │  │   Events    │
           └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │    QUERY ORCHESTRATOR       │
                    │ • Route by query type       │
                    │ • Federate across stores    │
                    │ • Cache management          │
                    │ • Result merging            │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │     Neo4j       │     │    Pinecone     │
│   (Supabase)    │     │ Knowledge Graph │     │  Vector Store   │
│                 │     │                 │     │                 │
│ • 280+ tables   │     │ • Relationship  │     │ • Document      │
│ • Multi-tenant  │     │   traversal     │     │   embeddings    │
│ • RLS policies  │     │ • Pathfinding   │     │ • Semantic      │
│ • ACID          │     │ • Patterns      │     │   search        │
│ • Audit logs    │     │ • Influence     │     │ • RAG           │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     SYNC ENGINE         │
                    │ • PostgreSQL → Neo4j    │
                    │ • Real-time + Batch     │
                    │ • Conflict resolution   │
                    │ • Audit trail           │
                    └─────────────────────────┘
```

## 8.2 PostgreSQL as Source of Truth

### Zero-JSONB Policy

The VITAL schema enforces a **zero-JSONB policy** for core entity data:

**Rationale:**
- Enables proper foreign key relationships
- Supports efficient indexing and querying
- Maintains referential integrity
- Allows graph projection to Neo4j
- Ensures type safety and validation

**Exception:** JSONB permitted only for:
- Audit metadata (`audit_context`)
- Flexible configuration (`settings`, `preferences`)
- External system responses (`raw_response`)
- Temporary staging (`import_staging`)

### Core Entity Tables (Summary)

| Layer | Key Tables | Relationships |
|-------|------------|---------------|
| **L1: Organization** | `organizations`, `org_functions`, `departments`, `roles`, `responsibilities` | Hierarchical, many-to-many role assignments |
| **L2: Personas** | `personas`, `persona_archetypes`, `persona_goals`, `persona_pains`, `persona_stakeholders` | Goals → Pains → Stakeholders |
| **L3: JTBD** | `jtbd`, `jtbd_outcomes`, `jtbd_pains`, `jtbd_constraints`, `jtbd_value_drivers` | JTBD → Outcomes (ODI) → Pains → Value |
| **L4: Capabilities** | `capabilities`, `skills`, `competencies`, `learning_resources` | Hierarchical capability model |
| **L5: Execution** | `workflow_templates`, `workflow_stages`, `workflow_tasks`, `workflow_steps` | Template → Stage → Task → Step |
| **L6: AI Components** | `agents`, `agent_graphs`, `panels`, `lang_components`, `rag_libraries`, `tools` | Composable AI building blocks |
| **L7: Value** | `opportunities`, `value_drivers`, `maturity_assessments`, `transformation_programs` | Opportunity scoring, transformation tracking |

### Critical Schema Relationships

```sql
-- Layer 2 → Layer 3: Personas to JTBD
CREATE TABLE persona_jtbd_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  jtbd_id uuid NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  relevance_score numeric CHECK (relevance_score >= 0 AND relevance_score <= 1),
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'situational')),
  criticality text CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
  is_primary_job boolean DEFAULT false,
  context_notes text,
  UNIQUE(persona_id, jtbd_id)
);

-- Layer 3 → Layer 5: JTBD to Workflows
CREATE TABLE jtbd_workflow_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id uuid NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  workflow_template_id uuid NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  mapping_type text CHECK (mapping_type IN ('primary', 'supporting', 'alternative')),
  coverage_percentage numeric CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
  automation_level text CHECK (automation_level IN ('manual', 'assisted', 'augmented', 'automated', 'autonomous')),
  UNIQUE(jtbd_id, workflow_template_id)
);

-- Layer 3 → Layer 7: JTBD to Opportunities
CREATE TABLE jtbd_opportunity_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id uuid NOT NULL REFERENCES jtbd(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contribution_score numeric CHECK (contribution_score >= 0 AND contribution_score <= 1),
  implementation_dependency text,
  UNIQUE(jtbd_id, opportunity_id)
);

-- Layer 6 → Layer 5: Agents to Workflow Steps
CREATE TABLE workflow_step_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_step_id uuid NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  invocation_order integer DEFAULT 1,
  is_primary boolean DEFAULT true,
  fallback_agent_id uuid REFERENCES agents(id),
  UNIQUE(workflow_step_id, agent_id)
);
```

## 8.3 Neo4j Graph Projection Model

### Projection Strategy

PostgreSQL serves as the **source of truth**. Neo4j receives **projected graphs** for relationship-intensive queries:

```
PROJECTION PIPELINE

PostgreSQL Tables                    Neo4j Graph
─────────────────                    ───────────
                                    
┌─────────────┐      ┌────────┐     ┌─────────────┐
│ personas    │─────▶│ ETL    │────▶│ (:Persona)  │
└─────────────┘      │ Pipeline│     └─────────────┘
                     │        │            │
┌─────────────┐      │        │     ┌──────▼──────┐
│ jtbd        │─────▶│        │────▶│ (:JTBD)     │
└─────────────┘      │        │     └─────────────┘
                     │        │            │
┌─────────────┐      │        │     ┌──────▼──────┐
│ jtbd_outcomes│────▶│        │────▶│ (:Outcome)  │
└─────────────┘      │        │     └─────────────┘
                     │        │
┌─────────────┐      │        │     ┌─────────────┐
│ opportunities│────▶│        │────▶│(:Opportunity)│
└─────────────┘      │        │     └─────────────┘
                     │        │
┌─────────────┐      │        │     ┌─────────────┐
│ workflows   │─────▶│        │────▶│(:Workflow)  │
└─────────────┘      └────────┘     └─────────────┘
```

### Neo4j Node Definitions (Complete)

```cypher
// ============================================
// LAYER 1: ORGANIZATIONAL STRUCTURE
// ============================================

CREATE CONSTRAINT org_function_id IF NOT EXISTS
FOR (o:OrgFunction) REQUIRE o.id IS UNIQUE;

CREATE (o:OrgFunction {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  code: $code,
  description: $description,
  parent_function_id: $parent_function_id,
  hierarchy_level: $hierarchy_level
});

CREATE CONSTRAINT role_id IF NOT EXISTS
FOR (r:Role) REQUIRE r.id IS UNIQUE;

CREATE (r:Role {
  id: $id,
  tenant_id: $tenant_id,
  title: $title,
  level: $level,           // L1-L7
  function_id: $function_id,
  reports_to_role_id: $reports_to_role_id,
  span_of_control: $span_of_control,
  budget_authority: $budget_authority,
  geographic_scope: $geographic_scope
});

// ============================================
// LAYER 2: PERSONAS
// ============================================

CREATE CONSTRAINT persona_id IF NOT EXISTS
FOR (p:Persona) REQUIRE p.id IS UNIQUE;

CREATE (p:Persona {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  role_id: $role_id,
  archetype: $archetype,    // automator, orchestrator, learner, skeptic
  ai_maturity_level: $ai_maturity_level,
  seniority: $seniority,
  team_size: $team_size,
  decision_scope: $decision_scope,
  vpanes_score: $vpanes_score
});

CREATE CONSTRAINT goal_id IF NOT EXISTS
FOR (g:Goal) REQUIRE g.id IS UNIQUE;

CREATE (g:Goal {
  id: $id,
  persona_id: $persona_id,
  goal_type: $goal_type,    // strategic, operational, development
  description: $description,
  priority: $priority,
  timeframe: $timeframe
});

CREATE CONSTRAINT pain_id IF NOT EXISTS
FOR (pa:Pain) REQUIRE pa.id IS UNIQUE;

CREATE (pa:Pain {
  id: $id,
  persona_id: $persona_id,
  description: $description,
  severity: $severity,       // 1-10
  frequency: $frequency,     // daily, weekly, monthly
  impact_type: $impact_type  // time, quality, cost, risk
});

// ============================================
// LAYER 3: JOBS-TO-BE-DONE
// ============================================

CREATE CONSTRAINT jtbd_id IF NOT EXISTS
FOR (j:JTBD) REQUIRE j.id IS UNIQUE;

CREATE (j:JTBD {
  id: $id,
  tenant_id: $tenant_id,
  job_id: $job_id,
  name: $name,
  description: $description,
  category: $category,       // strategic, operational, tactical
  strategic_pillar: $strategic_pillar,  // SP01-SP07
  complexity_level: $complexity_level,
  ai_suitability_score: $ai_suitability_score,
  intervention_type: $intervention_type  // automate, augment, assist, advise
});

CREATE CONSTRAINT outcome_id IF NOT EXISTS
FOR (o:Outcome) REQUIRE o.id IS UNIQUE;

CREATE (o:Outcome {
  id: $id,
  jtbd_id: $jtbd_id,
  outcome_statement: $outcome_statement,
  outcome_direction: $outcome_direction,  // minimize, maximize, ensure
  importance_score: $importance_score,    // 0-10
  satisfaction_score: $satisfaction_score, // 0-10
  opportunity_score: $opportunity_score    // calculated: imp + max(imp-sat, 0)
});

CREATE CONSTRAINT constraint_id IF NOT EXISTS
FOR (c:Constraint) REQUIRE c.id IS UNIQUE;

CREATE (c:Constraint {
  id: $id,
  jtbd_id: $jtbd_id,
  description: $description,
  constraint_type: $constraint_type,  // regulatory, resource, time, technical
  severity: $severity
});

// ============================================
// LAYER 5: EXECUTION (WORKFLOWS)
// ============================================

CREATE CONSTRAINT workflow_template_id IF NOT EXISTS
FOR (wt:WorkflowTemplate) REQUIRE wt.id IS UNIQUE;

CREATE (wt:WorkflowTemplate {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  description: $description,
  category: $category,
  automation_level: $automation_level,
  avg_duration_minutes: $avg_duration_minutes,
  complexity_score: $complexity_score
});

CREATE CONSTRAINT workflow_stage_id IF NOT EXISTS
FOR (ws:WorkflowStage) REQUIRE ws.id IS UNIQUE;

CREATE (ws:WorkflowStage {
  id: $id,
  workflow_template_id: $workflow_template_id,
  stage_number: $stage_number,
  name: $name,
  description: $description,
  typical_duration_minutes: $typical_duration_minutes
});

CREATE CONSTRAINT workflow_task_id IF NOT EXISTS
FOR (wta:WorkflowTask) REQUIRE wta.id IS UNIQUE;

CREATE (wta:WorkflowTask {
  id: $id,
  stage_id: $stage_id,
  task_number: $task_number,
  name: $name,
  description: $description,
  responsible_role: $responsible_role,
  estimated_duration_minutes: $estimated_duration_minutes,
  automation_potential: $automation_potential
});

CREATE CONSTRAINT workflow_step_id IF NOT EXISTS
FOR (wst:WorkflowStep) REQUIRE wst.id IS UNIQUE;

CREATE (wst:WorkflowStep {
  id: $id,
  task_id: $task_id,
  step_number: $step_number,
  name: $name,
  component_id: $component_id,
  is_automated: $is_automated
});

// ============================================
// LAYER 6: AI COMPONENTS
// ============================================

CREATE CONSTRAINT agent_id IF NOT EXISTS
FOR (a:Agent) REQUIRE a.id IS UNIQUE;

CREATE (a:Agent {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  agent_type: $agent_type,
  domain: $domain,
  capability_level: $capability_level,  // L1-L4
  autonomy_level: $autonomy_level,
  prompt_template_id: $prompt_template_id
});

CREATE CONSTRAINT service_layer_id IF NOT EXISTS
FOR (sl:ServiceLayer) REQUIRE sl.id IS UNIQUE;

CREATE (sl:ServiceLayer {
  id: $id,
  name: $name,
  code: $code,          // L1, L2, L3, L4
  description: $description,
  typical_response_time: $typical_response_time,
  complexity_threshold: $complexity_threshold
});

CREATE CONSTRAINT capability_id IF NOT EXISTS
FOR (cap:Capability) REQUIRE cap.id IS UNIQUE;

CREATE (cap:Capability {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  category: $category,
  proficiency_levels: $proficiency_levels
});

// ============================================
// LAYER 7: VALUE & OPPORTUNITIES
// ============================================

CREATE CONSTRAINT opportunity_id IF NOT EXISTS
FOR (opp:Opportunity) REQUIRE opp.id IS UNIQUE;

CREATE (opp:Opportunity {
  id: $id,
  tenant_id: $tenant_id,
  name: $name,
  description: $description,
  opportunity_rank: $opportunity_rank,
  strategic_pillar: $strategic_pillar,
  impact_score: $impact_score,
  feasibility_score: $feasibility_score,
  ai_suitability_score: $ai_suitability_score,
  composite_score: $composite_score,
  intervention_type: $intervention_type,
  target_service_layer: $target_service_layer,
  estimated_annual_value: $estimated_annual_value
});

CREATE CONSTRAINT value_driver_id IF NOT EXISTS
FOR (vd:ValueDriver) REQUIRE vd.id IS UNIQUE;

CREATE (vd:ValueDriver {
  id: $id,
  name: $name,
  category: $category,  // time, cost, quality, risk, strategic
  measurement_unit: $measurement_unit
});
```

### Neo4j Relationship Definitions (Complete)

```cypher
// ============================================
// ORGANIZATIONAL RELATIONSHIPS
// ============================================

// Role hierarchy
MATCH (child:Role {id: $child_id}), (parent:Role {id: $parent_id})
CREATE (child)-[:REPORTS_TO {
  relationship_type: 'direct',
  effective_date: $effective_date
}]->(parent);

// Role to Function
MATCH (r:Role {id: $role_id}), (f:OrgFunction {id: $function_id})
CREATE (r)-[:BELONGS_TO]->(f);

// ============================================
// PERSONA RELATIONSHIPS
// ============================================

// Persona to Role
MATCH (p:Persona {id: $persona_id}), (r:Role {id: $role_id})
CREATE (p)-[:HAS_ROLE]->(r);

// Persona to Goals
MATCH (p:Persona {id: $persona_id}), (g:Goal {id: $goal_id})
CREATE (p)-[:HAS_GOAL {priority: $priority}]->(g);

// Persona to Pains
MATCH (p:Persona {id: $persona_id}), (pa:Pain {id: $pain_id})
CREATE (p)-[:EXPERIENCES_PAIN {severity: $severity, frequency: $frequency}]->(pa);

// Persona to JTBD
MATCH (p:Persona {id: $persona_id}), (j:JTBD {id: $jtbd_id})
CREATE (p)-[:HAS_JTBD {
  relevance_score: $relevance_score,
  frequency: $frequency,
  is_primary: $is_primary
}]->(j);

// Persona influences Persona (stakeholder relationships)
MATCH (p1:Persona {id: $from_persona_id}), (p2:Persona {id: $to_persona_id})
CREATE (p1)-[:INFLUENCES {
  influence_type: $influence_type,
  influence_strength: $influence_strength,
  interaction_frequency: $interaction_frequency
}]->(p2);

// ============================================
// JTBD RELATIONSHIPS
// ============================================

// JTBD to Outcomes (ODI)
MATCH (j:JTBD {id: $jtbd_id}), (o:Outcome {id: $outcome_id})
CREATE (j)-[:HAS_OUTCOME {
  outcome_type: $outcome_type,
  measurement_method: $measurement_method
}]->(o);

// JTBD to Pains
MATCH (j:JTBD {id: $jtbd_id}), (pa:Pain {id: $pain_id})
CREATE (j)-[:HAS_PAIN {
  pain_point_in_job: $pain_point_in_job
}]->(pa);

// JTBD to Constraints
MATCH (j:JTBD {id: $jtbd_id}), (c:Constraint {id: $constraint_id})
CREATE (j)-[:HAS_CONSTRAINT]->(c);

// JTBD to Capabilities (required)
MATCH (j:JTBD {id: $jtbd_id}), (cap:Capability {id: $capability_id})
CREATE (j)-[:REQUIRES_CAPABILITY {
  proficiency_required: $proficiency_required,
  is_critical: $is_critical
}]->(cap);

// JTBD to Workflow
MATCH (j:JTBD {id: $jtbd_id}), (wt:WorkflowTemplate {id: $workflow_id})
CREATE (j)-[:IMPLEMENTED_BY {
  mapping_type: $mapping_type,
  coverage_percentage: $coverage_percentage
}]->(wt);

// JTBD to Opportunity
MATCH (j:JTBD {id: $jtbd_id}), (opp:Opportunity {id: $opportunity_id})
CREATE (j)-[:ENABLES_OPPORTUNITY {
  contribution_score: $contribution_score
}]->(opp);

// JTBD to Value Driver
MATCH (j:JTBD {id: $jtbd_id}), (vd:ValueDriver {id: $value_driver_id})
CREATE (j)-[:DRIVES_VALUE {
  value_impact: $value_impact
}]->(vd);

// ============================================
// WORKFLOW RELATIONSHIPS
// ============================================

// Workflow Template contains Stages
MATCH (wt:WorkflowTemplate {id: $template_id}), (ws:WorkflowStage {id: $stage_id})
CREATE (wt)-[:HAS_STAGE {stage_order: $stage_order}]->(ws);

// Stage contains Tasks
MATCH (ws:WorkflowStage {id: $stage_id}), (wta:WorkflowTask {id: $task_id})
CREATE (ws)-[:HAS_TASK {task_order: $task_order}]->(wta);

// Task contains Steps
MATCH (wta:WorkflowTask {id: $task_id}), (wst:WorkflowStep {id: $step_id})
CREATE (wta)-[:HAS_STEP {step_order: $step_order}]->(wst);

// Step uses Agent
MATCH (wst:WorkflowStep {id: $step_id}), (a:Agent {id: $agent_id})
CREATE (wst)-[:USES_AGENT {
  is_primary: $is_primary,
  invocation_order: $invocation_order
}]->(a);

// ============================================
// AI COMPONENT RELATIONSHIPS
// ============================================

// Agent to Service Layer
MATCH (a:Agent {id: $agent_id}), (sl:ServiceLayer {id: $layer_id})
CREATE (a)-[:OPERATES_IN]->(sl);

// Agent to Capability
MATCH (a:Agent {id: $agent_id}), (cap:Capability {id: $capability_id})
CREATE (a)-[:PROVIDES_CAPABILITY]->(cap);

// Agent to Agent (composition)
MATCH (parent:Agent {id: $parent_id}), (child:Agent {id: $child_id})
CREATE (parent)-[:ORCHESTRATES {
  orchestration_type: $orchestration_type
}]->(child);

// ============================================
// OPPORTUNITY RELATIONSHIPS
// ============================================

// Opportunity to Service Layer
MATCH (opp:Opportunity {id: $opportunity_id}), (sl:ServiceLayer {id: $layer_id})
CREATE (opp)-[:MAPS_TO_LAYER {
  implementation_priority: $implementation_priority
}]->(sl);

// Opportunity to Value Driver
MATCH (opp:Opportunity {id: $opportunity_id}), (vd:ValueDriver {id: $value_driver_id})
CREATE (opp)-[:DELIVERS_VALUE {
  expected_impact: $expected_impact,
  measurement_method: $measurement_method
}]->(vd);

// Opportunity to Capability (required)
MATCH (opp:Opportunity {id: $opportunity_id}), (cap:Capability {id: $capability_id})
CREATE (opp)-[:REQUIRES_CAPABILITY]->(cap);
```

## 8.4 Graph Query Patterns

### Query Performance Targets

| Query Type | Target Latency | Use Case |
|------------|----------------|----------|
| Single-hop | <100ms | Direct relationships (persona → JTBD) |
| Multi-hop (2-3) | <250ms | Pathway queries (persona → JTBD → workflow) |
| Deep traversal (4+) | <500ms | Influence chains, dependency analysis |
| Pathfinding | <500ms | Shortest path, all paths |
| Pattern matching | <1000ms | Subgraph isomorphism |
| Aggregation | <2000ms | Counts, distributions |

### Common Query Patterns

```cypher
// ============================================
// DISCOVERY QUERIES
// ============================================

// 1. Get all JTBDs for a persona with outcomes
MATCH (p:Persona {id: $persona_id})-[:HAS_JTBD]->(j:JTBD)
OPTIONAL MATCH (j)-[:HAS_OUTCOME]->(o:Outcome)
RETURN p, j, collect(o) as outcomes
ORDER BY j.ai_suitability_score DESC;

// 2. Find top opportunities for a persona
MATCH (p:Persona {id: $persona_id})-[:HAS_JTBD]->(j:JTBD)-[:ENABLES_OPPORTUNITY]->(opp:Opportunity)
RETURN opp.name, opp.composite_score, opp.target_service_layer, 
       collect(DISTINCT j.name) as related_jtbds
ORDER BY opp.composite_score DESC
LIMIT 10;

// 3. Navigate JTBD → Workflow → Tasks → Steps → Agents
MATCH path = (j:JTBD {id: $jtbd_id})-[:IMPLEMENTED_BY]->(wt:WorkflowTemplate)
             -[:HAS_STAGE]->(ws:WorkflowStage)-[:HAS_TASK]->(wta:WorkflowTask)
             -[:HAS_STEP]->(wst:WorkflowStep)-[:USES_AGENT]->(a:Agent)
RETURN path;

// 4. Find persona influence network
MATCH path = (p:Persona {id: $persona_id})-[:INFLUENCES*1..3]->(influenced:Persona)
RETURN path, length(path) as depth
ORDER BY depth;

// 5. Identify capability gaps for persona
MATCH (p:Persona {id: $persona_id})-[:HAS_JTBD]->(j:JTBD)-[:REQUIRES_CAPABILITY]->(req:Capability)
OPTIONAL MATCH (p)-[:HAS_CAPABILITY]->(has:Capability)
WHERE has.id = req.id
WITH p, req, has
WHERE has IS NULL
RETURN req.name as missing_capability, count(*) as jtbd_count
ORDER BY jtbd_count DESC;

// ============================================
// OPPORTUNITY RADAR QUERIES
// ============================================

// 6. Full opportunity radar with value projections
MATCH (opp:Opportunity)
OPTIONAL MATCH (opp)<-[:ENABLES_OPPORTUNITY]-(j:JTBD)<-[:HAS_JTBD]-(p:Persona)
OPTIONAL MATCH (opp)-[:MAPS_TO_LAYER]->(sl:ServiceLayer)
OPTIONAL MATCH (opp)-[:DELIVERS_VALUE]->(vd:ValueDriver)
RETURN opp.name, 
       opp.opportunity_rank,
       opp.composite_score,
       opp.estimated_annual_value,
       sl.code as target_layer,
       collect(DISTINCT p.name) as affected_personas,
       collect(DISTINCT vd.name) as value_drivers
ORDER BY opp.composite_score DESC;

// 7. Service layer distribution analysis
MATCH (opp:Opportunity)-[:MAPS_TO_LAYER]->(sl:ServiceLayer)
RETURN sl.code, count(opp) as opportunity_count, 
       avg(opp.composite_score) as avg_score,
       sum(opp.estimated_annual_value) as total_value
ORDER BY sl.code;

// ============================================
// WORKFLOW OPTIMIZATION QUERIES
// ============================================

// 8. Identify bottleneck tasks
MATCH (wt:WorkflowTemplate)-[:HAS_STAGE]->(ws:WorkflowStage)-[:HAS_TASK]->(wta:WorkflowTask)
WHERE wta.automation_potential > 0.7 AND wta.is_automated = false
RETURN wt.name as workflow, ws.name as stage, wta.name as task,
       wta.estimated_duration_minutes as duration,
       wta.automation_potential
ORDER BY wta.estimated_duration_minutes DESC;

// 9. Agent utilization across workflows
MATCH (a:Agent)<-[:USES_AGENT]-(wst:WorkflowStep)<-[:HAS_STEP]-(wta:WorkflowTask)
      <-[:HAS_TASK]-(ws:WorkflowStage)<-[:HAS_STAGE]-(wt:WorkflowTemplate)
RETURN a.name, a.domain, count(DISTINCT wt) as workflow_count,
       count(wst) as step_count
ORDER BY step_count DESC;

// ============================================
// MATURITY ASSESSMENT QUERIES
// ============================================

// 10. Maturity readiness by strategic pillar
MATCH (j:JTBD)
OPTIONAL MATCH (j)-[:ENABLES_OPPORTUNITY]->(opp:Opportunity)
RETURN j.strategic_pillar, 
       count(j) as jtbd_count,
       avg(j.ai_suitability_score) as avg_ai_suitability,
       count(opp) as opportunity_count,
       avg(opp.composite_score) as avg_opportunity_score
ORDER BY j.strategic_pillar;
```

## 8.5 ETL Pipeline: PostgreSQL → Neo4j

### Sync Architecture

```
                    ETL SYNC PIPELINE

┌─────────────────────────────────────────────────────────────────┐
│                    CHANGE DATA CAPTURE                          │
│              (PostgreSQL Logical Replication)                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE                                │
│                    (Kafka/SQS)                                  │
│  • personas_changed                                             │
│  • jtbd_changed                                                 │
│  • workflows_changed                                            │
│  • opportunities_changed                                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ETL PROCESSOR                                │
│  • Validates change events                                      │
│  • Transforms to Neo4j format                                   │
│  • Batches for efficiency                                       │
│  • Handles conflicts                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEO4J LOADER                                 │
│  • MERGE operations (upsert)                                    │
│  • Relationship updates                                         │
│  • Index maintenance                                            │
│  • Transaction management                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYNC LOG                                     │
│  • Tracks sync state                                            │
│  • Records conflicts                                            │
│  • Enables replay                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Sync State Table

```sql
CREATE TABLE kg_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  source_table text NOT NULL,
  source_operation text NOT NULL CHECK (source_operation IN ('INSERT', 'UPDATE', 'DELETE')),
  source_record_id uuid NOT NULL,
  source_record_data jsonb,
  
  -- Target
  target_node_type text,
  target_node_id text,
  
  -- Execution
  sync_status text DEFAULT 'pending' CHECK (sync_status IN 
    ('pending', 'processing', 'completed', 'failed', 'skipped')),
  sync_started_at timestamp with time zone,
  sync_completed_at timestamp with time zone,
  
  -- Error Handling
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  batch_id uuid
);

CREATE INDEX idx_kg_sync_log_status ON kg_sync_log(sync_status);
CREATE INDEX idx_kg_sync_log_table ON kg_sync_log(source_table, source_operation);
```

### Python ETL Implementation

```python
from neo4j import GraphDatabase
import json

class Neo4jSyncProcessor:
    """
    Processes PostgreSQL changes and syncs to Neo4j.
    """
    
    def __init__(self, neo4j_uri, neo4j_user, neo4j_password):
        self.driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        
        # Mapping: PostgreSQL table → Neo4j node type + properties
        self.node_mappings = {
            'personas': {
                'node_type': 'Persona',
                'id_field': 'id',
                'properties': ['name', 'role_id', 'archetype', 'ai_maturity_level', 
                              'seniority', 'team_size', 'vpanes_score']
            },
            'jtbd': {
                'node_type': 'JTBD',
                'id_field': 'id',
                'properties': ['job_id', 'name', 'description', 'category', 
                              'strategic_pillar', 'ai_suitability_score']
            },
            'jtbd_outcomes': {
                'node_type': 'Outcome',
                'id_field': 'id',
                'properties': ['outcome_statement', 'outcome_direction', 
                              'importance_score', 'satisfaction_score', 'opportunity_score']
            },
            'opportunities': {
                'node_type': 'Opportunity',
                'id_field': 'id',
                'properties': ['name', 'description', 'opportunity_rank', 'strategic_pillar',
                              'impact_score', 'feasibility_score', 'composite_score',
                              'target_service_layer', 'estimated_annual_value']
            },
            'workflow_templates': {
                'node_type': 'WorkflowTemplate',
                'id_field': 'id',
                'properties': ['name', 'description', 'category', 'automation_level',
                              'avg_duration_minutes']
            },
            'agents': {
                'node_type': 'Agent',
                'id_field': 'id',
                'properties': ['name', 'agent_type', 'domain', 'capability_level',
                              'autonomy_level']
            }
        }
        
        # Mapping: PostgreSQL join table → Neo4j relationship
        self.relationship_mappings = {
            'persona_jtbd_mapping': {
                'from_table': 'personas',
                'from_field': 'persona_id',
                'from_node': 'Persona',
                'to_table': 'jtbd',
                'to_field': 'jtbd_id',
                'to_node': 'JTBD',
                'relationship': 'HAS_JTBD',
                'properties': ['relevance_score', 'frequency', 'is_primary_job']
            },
            'jtbd_outcome_mapping': {
                'from_table': 'jtbd',
                'from_field': 'jtbd_id',
                'from_node': 'JTBD',
                'to_table': 'jtbd_outcomes',
                'to_field': 'id',
                'to_node': 'Outcome',
                'relationship': 'HAS_OUTCOME',
                'properties': []
            },
            'jtbd_opportunity_mapping': {
                'from_table': 'jtbd',
                'from_field': 'jtbd_id',
                'from_node': 'JTBD',
                'to_table': 'opportunities',
                'to_field': 'opportunity_id',
                'to_node': 'Opportunity',
                'relationship': 'ENABLES_OPPORTUNITY',
                'properties': ['contribution_score']
            }
        }
    
    def process_change(self, change_event):
        """
        Process a single change event from PostgreSQL.
        """
        table = change_event['table']
        operation = change_event['operation']
        record = change_event['record']
        
        with self.driver.session() as session:
            if table in self.node_mappings:
                self._sync_node(session, table, operation, record)
            elif table in self.relationship_mappings:
                self._sync_relationship(session, table, operation, record)
    
    def _sync_node(self, session, table, operation, record):
        """
        Sync a node to Neo4j.
        """
        mapping = self.node_mappings[table]
        node_type = mapping['node_type']
        id_field = mapping['id_field']
        
        if operation in ('INSERT', 'UPDATE'):
            # Build properties dictionary
            props = {prop: record.get(prop) for prop in mapping['properties'] if record.get(prop) is not None}
            props['id'] = record[id_field]
            props['tenant_id'] = record.get('tenant_id')
            
            # MERGE (upsert)
            query = f"""
            MERGE (n:{node_type} {{id: $id}})
            SET n += $props
            """
            session.run(query, id=record[id_field], props=props)
            
        elif operation == 'DELETE':
            query = f"""
            MATCH (n:{node_type} {{id: $id}})
            DETACH DELETE n
            """
            session.run(query, id=record[id_field])
    
    def _sync_relationship(self, session, table, operation, record):
        """
        Sync a relationship to Neo4j.
        """
        mapping = self.relationship_mappings[table]
        
        if operation in ('INSERT', 'UPDATE'):
            # Build properties
            props = {prop: record.get(prop) for prop in mapping['properties'] if record.get(prop) is not None}
            
            query = f"""
            MATCH (from:{mapping['from_node']} {{id: $from_id}})
            MATCH (to:{mapping['to_node']} {{id: $to_id}})
            MERGE (from)-[r:{mapping['relationship']}]->(to)
            SET r += $props
            """
            session.run(query, 
                       from_id=record[mapping['from_field']], 
                       to_id=record[mapping['to_field']],
                       props=props)
            
        elif operation == 'DELETE':
            query = f"""
            MATCH (:{mapping['from_node']} {{id: $from_id}})-[r:{mapping['relationship']}]->(:{mapping['to_node']} {{id: $to_id}})
            DELETE r
            """
            session.run(query,
                       from_id=record[mapping['from_field']],
                       to_id=record[mapping['to_field']])
    
    def full_sync(self, postgres_connection):
        """
        Perform full sync from PostgreSQL to Neo4j.
        Used for initial load or recovery.
        """
        import psycopg2
        
        conn = psycopg2.connect(postgres_connection)
        cursor = conn.cursor()
        
        with self.driver.session() as session:
            # Sync nodes first
            for table, mapping in self.node_mappings.items():
                cursor.execute(f"SELECT * FROM {table}")
                columns = [desc[0] for desc in cursor.description]
                
                for row in cursor.fetchall():
                    record = dict(zip(columns, row))
                    self._sync_node(session, table, 'INSERT', record)
            
            # Then sync relationships
            for table, mapping in self.relationship_mappings.items():
                cursor.execute(f"SELECT * FROM {table}")
                columns = [desc[0] for desc in cursor.description]
                
                for row in cursor.fetchall():
                    record = dict(zip(columns, row))
                    self._sync_relationship(session, table, 'INSERT', record)
        
        cursor.close()
        conn.close()
```

---

# 9. Hybrid RAG Architecture

## 9.1 Dual-Engine RAG Strategy

VITAL implements a **hybrid RAG architecture** that combines:

| Engine | Technology | Best For | Query Types |
|--------|------------|----------|-------------|
| **GraphRAG** | Neo4j + LLM | Relationship reasoning, influence, paths | "Who influences whom?", "What depends on what?" |
| **VectorRAG** | Pinecone + LLM | Semantic similarity, document retrieval | "Find similar documents", "Answer from corpus" |

### Query Router Logic

```python
def route_rag_query(query, context):
    """
    Routes queries to appropriate RAG engine based on query characteristics.
    """
    # Analyze query characteristics
    query_features = analyze_query(query)
    
    # GraphRAG signals
    graph_signals = [
        query_features.contains_relationship_terms,  # "related to", "connected", "influences"
        query_features.asks_about_paths,             # "how does X lead to Y"
        query_features.asks_about_hierarchy,         # "who reports to", "what's under"
        query_features.asks_about_dependencies,      # "what depends on", "prerequisites"
        query_features.asks_about_influence,         # "who impacts", "stakeholders"
        context.entity_count > 2                     # Multi-entity queries
    ]
    
    # VectorRAG signals
    vector_signals = [
        query_features.asks_for_content,            # "what does the document say"
        query_features.asks_for_similarity,         # "find similar", "like this"
        query_features.asks_for_summary,            # "summarize", "key points"
        query_features.asks_for_examples,           # "examples of", "instances"
        query_features.is_open_ended                # No specific entity focus
    ]
    
    graph_score = sum(graph_signals) / len(graph_signals)
    vector_score = sum(vector_signals) / len(vector_signals)
    
    if graph_score > 0.5 and vector_score > 0.5:
        return "HYBRID"  # Use both engines
    elif graph_score > vector_score:
        return "GRAPH"
    else:
        return "VECTOR"
```

## 9.2 GraphRAG Implementation

### Architecture

```
GRAPHRAG PIPELINE

User Query
    │
    ▼
┌─────────────────────┐
│ Entity Recognition  │
│ • Identify entities │
│ • Classify types    │
│ • Resolve ambiguity │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Graph Query Builder │
│ • Construct Cypher  │
│ • Optimize paths    │
│ • Set depth limits  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Neo4j Execution     │
│ • Run query         │
│ • Retrieve subgraph │
│ • Include metadata  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Context Assembly    │
│ • Serialize graph   │
│ • Add descriptions  │
│ • Format for LLM    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ LLM Reasoning       │
│ • Prompt with graph │
│ • Generate answer   │
│ • Cite sources      │
└──────────┬──────────┘
           │
           ▼
      Response
```

### GraphRAG Query Templates

```python
class GraphRAGQueryTemplates:
    """
    Pre-built query templates for common GraphRAG patterns.
    """
    
    @staticmethod
    def persona_context(persona_id: str) -> str:
        """Get full context for a persona."""
        return """
        MATCH (p:Persona {id: $persona_id})
        OPTIONAL MATCH (p)-[:HAS_ROLE]->(r:Role)
        OPTIONAL MATCH (p)-[:HAS_GOAL]->(g:Goal)
        OPTIONAL MATCH (p)-[:EXPERIENCES_PAIN]->(pa:Pain)
        OPTIONAL MATCH (p)-[:HAS_JTBD]->(j:JTBD)
        OPTIONAL MATCH (j)-[:HAS_OUTCOME]->(o:Outcome)
        RETURN p, r, collect(DISTINCT g) as goals, 
               collect(DISTINCT pa) as pains,
               collect(DISTINCT {jtbd: j, outcomes: collect(DISTINCT o)}) as jobs
        """
    
    @staticmethod
    def opportunity_analysis(opportunity_id: str) -> str:
        """Get full analysis context for an opportunity."""
        return """
        MATCH (opp:Opportunity {id: $opportunity_id})
        OPTIONAL MATCH (opp)<-[:ENABLES_OPPORTUNITY]-(j:JTBD)
        OPTIONAL MATCH (j)<-[:HAS_JTBD]-(p:Persona)
        OPTIONAL MATCH (opp)-[:MAPS_TO_LAYER]->(sl:ServiceLayer)
        OPTIONAL MATCH (opp)-[:DELIVERS_VALUE]->(vd:ValueDriver)
        OPTIONAL MATCH (opp)-[:REQUIRES_CAPABILITY]->(cap:Capability)
        RETURN opp, sl,
               collect(DISTINCT j) as jtbds,
               collect(DISTINCT p) as personas,
               collect(DISTINCT vd) as value_drivers,
               collect(DISTINCT cap) as capabilities
        """
    
    @staticmethod
    def workflow_navigation(workflow_id: str) -> str:
        """Navigate full workflow structure."""
        return """
        MATCH path = (wt:WorkflowTemplate {id: $workflow_id})
                     -[:HAS_STAGE]->(ws:WorkflowStage)
                     -[:HAS_TASK]->(wta:WorkflowTask)
                     -[:HAS_STEP]->(wst:WorkflowStep)
        OPTIONAL MATCH (wst)-[:USES_AGENT]->(a:Agent)
        RETURN wt, ws, wta, wst, a
        ORDER BY ws.stage_number, wta.task_number, wst.step_number
        """
    
    @staticmethod
    def influence_network(persona_id: str, max_depth: int = 3) -> str:
        """Map influence network from a persona."""
        return f"""
        MATCH path = (p:Persona {{id: $persona_id}})-[:INFLUENCES*1..{max_depth}]->(influenced:Persona)
        RETURN path, 
               [r in relationships(path) | r.influence_strength] as strengths,
               length(path) as depth
        ORDER BY depth, reduce(s = 0, x in [r in relationships(path) | r.influence_strength] | s + x) DESC
        """
    
    @staticmethod
    def capability_gap_analysis(persona_id: str) -> str:
        """Identify capability gaps for a persona."""
        return """
        MATCH (p:Persona {id: $persona_id})-[:HAS_JTBD]->(j:JTBD)-[:REQUIRES_CAPABILITY]->(required:Capability)
        OPTIONAL MATCH (p)-[has:HAS_CAPABILITY]->(required)
        WITH p, required, j, has
        WHERE has IS NULL OR has.proficiency_level < required.required_proficiency
        RETURN required.name as capability,
               required.category,
               collect(DISTINCT j.name) as needed_for_jtbds,
               count(DISTINCT j) as jtbd_count,
               CASE WHEN has IS NULL THEN 'missing' ELSE 'insufficient' END as gap_type
        ORDER BY jtbd_count DESC
        """
```

## 9.3 VectorRAG Implementation

### Architecture

```
VECTORRAG PIPELINE

User Query
    │
    ▼
┌─────────────────────┐
│ Query Enhancement   │
│ • Expand terms      │
│ • Add synonyms      │
│ • Apply filters     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Embedding Generator │
│ • Encode query      │
│ • Model: text-embed │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Pinecone Search     │
│ • Top-K retrieval   │
│ • Metadata filter   │
│ • Namespace scoping │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Reranking           │
│ • Cross-encoder     │
│ • Diversity filter  │
│ • Recency boost     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Context Assembly    │
│ • Chunk ordering    │
│ • Source citation   │
│ • Token management  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ LLM Generation      │
│ • RAG prompt        │
│ • Answer synthesis  │
│ • Citation linking  │
└──────────┬──────────┘
           │
           ▼
      Response
```

### Pinecone Index Configuration

```python
# Pinecone index structure for VITAL
PINECONE_INDEXES = {
    'vital-medical-content': {
        'dimension': 1536,  # OpenAI text-embedding-3-small
        'metric': 'cosine',
        'namespaces': [
            'srd',           # Standard Response Documents
            'publications',   # Published papers, abstracts
            'guidelines',     # Clinical guidelines
            'labels',         # Product labels, prescribing info
            'training',       # Training materials
            'sop',           # Standard Operating Procedures
            'competitive',   # Competitive intelligence
            'congress'       # Congress materials
        ],
        'metadata_fields': [
            'tenant_id',
            'document_type',
            'therapeutic_area',
            'product_id',
            'publication_date',
            'approval_status',
            'geographic_scope',
            'language',
            'source_url'
        ]
    },
    'vital-ontology-descriptions': {
        'dimension': 1536,
        'metric': 'cosine',
        'namespaces': [
            'personas',
            'jtbd',
            'workflows',
            'opportunities',
            'capabilities'
        ],
        'metadata_fields': [
            'tenant_id',
            'entity_type',
            'entity_id',
            'strategic_pillar',
            'function_id'
        ]
    }
}
```

### Chunking Strategy

```python
class MedicalAffairsChunker:
    """
    Domain-specific chunking for Medical Affairs content.
    """
    
    def __init__(self):
        self.chunk_configs = {
            'srd': {
                'strategy': 'section',
                'max_tokens': 512,
                'overlap_tokens': 64,
                'preserve_sections': ['question', 'answer', 'references']
            },
            'publications': {
                'strategy': 'semantic',
                'max_tokens': 768,
                'overlap_tokens': 128,
                'preserve_sections': ['abstract', 'methods', 'results', 'discussion']
            },
            'guidelines': {
                'strategy': 'hierarchical',
                'max_tokens': 512,
                'overlap_tokens': 64,
                'preserve_hierarchy': True
            },
            'labels': {
                'strategy': 'section',
                'max_tokens': 384,
                'overlap_tokens': 48,
                'preserve_sections': ['indications', 'dosage', 'warnings', 'contraindications']
            },
            'sop': {
                'strategy': 'step',
                'max_tokens': 256,
                'overlap_tokens': 32,
                'preserve_numbering': True
            }
        }
    
    def chunk_document(self, document: dict, doc_type: str) -> list:
        """
        Chunk a document according to its type.
        """
        config = self.chunk_configs.get(doc_type, self.chunk_configs['publications'])
        
        if config['strategy'] == 'section':
            return self._chunk_by_section(document, config)
        elif config['strategy'] == 'semantic':
            return self._chunk_semantically(document, config)
        elif config['strategy'] == 'hierarchical':
            return self._chunk_hierarchically(document, config)
        elif config['strategy'] == 'step':
            return self._chunk_by_step(document, config)
        else:
            return self._chunk_fixed_size(document, config)
    
    def _chunk_by_section(self, document: dict, config: dict) -> list:
        """Preserve logical sections."""
        chunks = []
        content = document.get('content', '')
        
        # Split by section headers
        sections = self._extract_sections(content, config['preserve_sections'])
        
        for section_name, section_content in sections.items():
            # Further split if section exceeds max tokens
            if self._count_tokens(section_content) > config['max_tokens']:
                sub_chunks = self._split_with_overlap(
                    section_content, 
                    config['max_tokens'], 
                    config['overlap_tokens']
                )
                for i, sub_chunk in enumerate(sub_chunks):
                    chunks.append({
                        'content': sub_chunk,
                        'metadata': {
                            **document.get('metadata', {}),
                            'section': section_name,
                            'chunk_index': i,
                            'total_section_chunks': len(sub_chunks)
                        }
                    })
            else:
                chunks.append({
                    'content': section_content,
                    'metadata': {
                        **document.get('metadata', {}),
                        'section': section_name,
                        'chunk_index': 0,
                        'total_section_chunks': 1
                    }
                })
        
        return chunks
```

## 9.4 Hybrid Query Execution

### Fusion Strategy

```python
class HybridRAGExecutor:
    """
    Executes hybrid RAG queries combining Graph and Vector results.
    """
    
    def __init__(self, neo4j_client, pinecone_client, llm_client):
        self.neo4j = neo4j_client
        self.pinecone = pinecone_client
        self.llm = llm_client
    
    async def execute_hybrid_query(self, query: str, context: dict) -> dict:
        """
        Execute hybrid RAG query with intelligent fusion.
        """
        # 1. Determine routing
        route = self._determine_route(query, context)
        
        # 2. Execute appropriate engines
        graph_results = None
        vector_results = None
        
        if route in ('GRAPH', 'HYBRID'):
            graph_results = await self._execute_graph_query(query, context)
        
        if route in ('VECTOR', 'HYBRID'):
            vector_results = await self._execute_vector_query(query, context)
        
        # 3. Fuse results
        if route == 'HYBRID':
            fused_context = self._fuse_results(graph_results, vector_results, query)
        elif route == 'GRAPH':
            fused_context = self._format_graph_context(graph_results)
        else:
            fused_context = self._format_vector_context(vector_results)
        
        # 4. Generate response
        response = await self._generate_response(query, fused_context, context)
        
        return {
            'answer': response['answer'],
            'sources': response['sources'],
            'reasoning_path': response.get('reasoning_path'),
            'confidence': response.get('confidence'),
            'route_used': route
        }
    
    def _fuse_results(self, graph_results: dict, vector_results: list, query: str) -> str:
        """
        Intelligently fuse graph and vector results.
        """
        fused = []
        
        # Add graph context (structural understanding)
        if graph_results:
            fused.append("## Structural Context (from Knowledge Graph)")
            fused.append(self._serialize_graph(graph_results))
            fused.append("")
        
        # Add vector context (semantic content)
        if vector_results:
            fused.append("## Relevant Documents")
            for i, result in enumerate(vector_results[:5]):
                fused.append(f"### Source {i+1}: {result['metadata'].get('title', 'Untitled')}")
                fused.append(result['content'])
                fused.append(f"Relevance: {result['score']:.2f}")
                fused.append("")
        
        return "\n".join(fused)
    
    async def _generate_response(self, query: str, context: str, user_context: dict) -> dict:
        """
        Generate final response using LLM with fused context.
        """
        prompt = f"""You are a Medical Affairs AI assistant. Answer the following question using the provided context.

## User Context
- Role: {user_context.get('persona', {}).get('name', 'Unknown')}
- Archetype: {user_context.get('persona', {}).get('archetype', 'Unknown')}
- Current JTBD: {user_context.get('current_jtbd', 'Not specified')}

## Question
{query}

## Available Context
{context}

## Instructions
1. Answer based ONLY on the provided context
2. Cite sources using [Source N] notation
3. If the context doesn't contain enough information, say so
4. Maintain scientific accuracy and appropriate compliance boundaries
5. Adapt your response depth to the user's role and archetype

## Response Format
Provide your answer, followed by:
- Sources: List of sources cited
- Confidence: High/Medium/Low based on context coverage
- Reasoning: Brief explanation of how you derived the answer
"""
        
        response = await self.llm.generate(prompt)
        
        return self._parse_llm_response(response)
```

---

*[Document continues in Part 4: Implementation Roadmap, PRD/ARD specifications, and Future State Architecture]*
# VITAL Platform: Medical Affairs AI Operating System
## Master Strategy Document v4.0 - Part 4

---

# VOLUME III: IMPLEMENTATION & FUTURE STATE

---

# 10. Implementation Roadmap

## 10.1 Phased Transformation Journey

```
                    VITAL PLATFORM IMPLEMENTATION ROADMAP

PHASE 1                 PHASE 2                 PHASE 3                 PHASE 4
FOUNDATION              ACCELERATION            ORCHESTRATION           INTELLIGENCE
(Q1-Q2 2026)           (Q3-Q4 2026)            (Q1-Q2 2027)            (Q3+ 2027)
────────────────────────────────────────────────────────────────────────────────────

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Schema & Data   │   │ Workflow Engine │   │ Multi-Agent     │   │ Predictive      │
│ Foundation      │   │                 │   │ Orchestration   │   │ Intelligence    │
│                 │   │                 │   │                 │   │                 │
│ • PostgreSQL    │   │ • LangGraph     │   │ • Panel systems │   │ • ML models     │
│   280+ tables   │   │   integration   │   │ • L4 Solutions  │   │ • Forecasting   │
│ • Neo4j sync    │   │ • L3 Workflows  │   │ • Cross-func    │   │ • Autonomous    │
│ • Pinecone RAG  │   │ • HITL gates    │   │   integration   │   │   recommendations│
│ • Base L1/L2    │   │ • Compliance    │   │ • Full persona  │   │ • Self-optimize │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │                     │
         ▼                     ▼                     ▼                     ▼
    AI MATURITY:          AI MATURITY:          AI MATURITY:          AI MATURITY:
      L2 Assisted           L3 Augmented          L4 Automated          L5 Orchestrated
         │                     │                     │                     │
         ▼                     ▼                     ▼                     ▼
    VALUE DELIVERED:      VALUE DELIVERED:      VALUE DELIVERED:      VALUE DELIVERED:
    • 25% time savings    • 45% productivity    • 70% automation      • Strategic uplift
    • Basic RAG access    • Role copilots       • Real-time intel     • Predictive edge
    • L1 Ask Expert       • L2 Panels active    • Full L4 suites      • Autonomous ops
```

## 10.2 Phase 1: Foundation (Q1-Q2 2026)

### Objectives
- Deploy production-ready schema with full ontology
- Establish hybrid data architecture (PostgreSQL + Neo4j + Pinecone)
- Launch L1 Ask Expert and basic L2 Panels
- Implement core governance framework
- Onboard pilot users (50-100)

### Deliverables

| Workstream | Deliverable | Owner | Timeline |
|------------|-------------|-------|----------|
| **Data Platform** | PostgreSQL schema deployment (280+ tables) | Data Engineering | Week 1-4 |
| **Data Platform** | Neo4j projection pipeline | Data Engineering | Week 3-6 |
| **Data Platform** | Pinecone index configuration | Data Engineering | Week 2-4 |
| **Data Platform** | ETL sync engine | Data Engineering | Week 5-8 |
| **AI Services** | L1 Ask Expert (5 domain agents) | AI Engineering | Week 4-10 |
| **AI Services** | L2 Ask Panel (basic) | AI Engineering | Week 8-12 |
| **AI Services** | RAG pipeline (VectorRAG) | AI Engineering | Week 4-8 |
| **Governance** | Safety triggers & guardrails | Compliance | Week 1-6 |
| **Governance** | Audit logging framework | Platform | Week 2-5 |
| **UX** | Copilot interface v1 | Product/Design | Week 6-12 |
| **UX** | Admin console v1 | Product/Design | Week 8-12 |
| **Content** | Initial RAG corpus (SRDs, guidelines) | Medical Affairs | Week 1-8 |
| **Content** | Persona seeding (20 personas) | Product | Week 1-4 |
| **Operations** | Pilot user onboarding | Customer Success | Week 10-12 |

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Schema deployment | 100% tables live | Automated verification |
| Neo4j sync latency | <5 minutes | Monitoring |
| L1 query accuracy | >85% | Human evaluation |
| User adoption (pilot) | 50+ active users | Analytics |
| Governance compliance | 100% queries logged | Audit |

### Technical Architecture (Phase 1)

```
PHASE 1 ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│        Copilot Interface │ Admin Console │ API Clients                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                    │
│                  REST │ GraphQL │ WebSocket                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
           │ L1 Ask      │  │ L2 Ask      │  │ Governance  │
           │ Expert      │  │ Panel       │  │ Service     │
           │ Service     │  │ Service     │  │             │
           └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │       QUERY ROUTER          │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │     Neo4j       │     │    Pinecone     │
│   (Supabase)    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 10.3 Phase 2: Acceleration (Q3-Q4 2026)

### Objectives
- Launch L3 Workflow engine with LangGraph
- Deploy role-specific copilots (MSL, MI, Medical Director)
- Implement full HITL governance gates
- Expand to 500+ users
- Achieve L3 Augmented maturity

### Deliverables

| Workstream | Deliverable | Owner | Timeline |
|------------|-------------|-------|----------|
| **AI Services** | LangGraph workflow engine | AI Engineering | Week 1-8 |
| **AI Services** | MI Response Workflow | AI Engineering | Week 4-10 |
| **AI Services** | Publication Lifecycle Workflow | AI Engineering | Week 6-12 |
| **AI Services** | Congress Intelligence Workflow | AI Engineering | Week 8-14 |
| **AI Services** | Field Insights Synthesizer | AI Engineering | Week 6-12 |
| **AI Services** | Enhanced L2 Panels (5 patterns) | AI Engineering | Week 4-10 |
| **Copilots** | MSL Copilot | Product/AI | Week 4-12 |
| **Copilots** | MI Specialist Copilot | Product/AI | Week 6-14 |
| **Copilots** | Medical Director Copilot | Product/AI | Week 8-16 |
| **Governance** | Full HITL checkpoint system | Compliance | Week 1-6 |
| **Governance** | Compliance gate automation | Compliance | Week 4-10 |
| **Platform** | Workflow monitoring dashboard | Platform | Week 6-10 |
| **Content** | Expanded RAG corpus (5x) | Medical Affairs | Week 1-16 |
| **Operations** | Enterprise rollout (500 users) | Customer Success | Week 10-16 |

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow automation rate | >50% of MI responses | Workflow metrics |
| Copilot daily active users | 300+ | Analytics |
| Time savings (MI) | 60% reduction | Time studies |
| User satisfaction | NPS >50 | Surveys |
| Compliance adherence | 99.5% | Audit |

## 10.4 Phase 3: Orchestration (Q1-Q2 2027)

### Objectives
- Launch L4 Solution Builder suites
- Deploy full multi-agent panel orchestration
- Implement cross-functional integration
- Expand to enterprise-wide deployment
- Achieve L4 Automated maturity

### Deliverables

| Workstream | Deliverable | Owner | Timeline |
|------------|-------------|-------|----------|
| **AI Services** | Medical Strategy Suite (L4) | AI Engineering | Week 1-12 |
| **AI Services** | Publication Suite (L4) | AI Engineering | Week 4-14 |
| **AI Services** | HCP Engagement Suite (L4) | AI Engineering | Week 6-16 |
| **AI Services** | Evidence Portfolio Manager (L4) | AI Engineering | Week 8-18 |
| **AI Services** | Advanced Panel Orchestration | AI Engineering | Week 1-10 |
| **Platform** | Solution Composer Engine | Platform | Week 1-8 |
| **Integration** | CRM Integration (Veeva) | Integration | Week 4-12 |
| **Integration** | CTMS Integration | Integration | Week 6-14 |
| **Integration** | Safety System Integration | Integration | Week 8-16 |
| **Analytics** | Real-time Intelligence Dashboard | Analytics | Week 4-12 |
| **Analytics** | Opportunity Radar (live) | Analytics | Week 6-14 |
| **Operations** | Enterprise deployment (2000+ users) | Customer Success | Week 10-20 |

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| L4 Suite adoption | 5+ active suites | Platform metrics |
| Cross-functional workflows | 10+ integrated | Workflow metrics |
| Automation rate (overall) | >70% | Process analytics |
| Annual value delivered | $5M+ | ROI calculation |
| Enterprise user coverage | 80% of MA org | Analytics |

## 10.5 Phase 4: Intelligence (Q3+ 2027)

### Objectives
- Deploy predictive intelligence capabilities
- Launch autonomous recommendation systems
- Implement continuous learning and optimization
- Achieve L5 Orchestrated maturity
- Position as strategic enterprise asset

### Deliverables

| Workstream | Deliverable | Owner | Timeline |
|------------|-------------|-------|----------|
| **AI Services** | Predictive KOL Influence Model | AI/ML | Week 1-16 |
| **AI Services** | Evidence Gap Forecasting | AI/ML | Week 4-18 |
| **AI Services** | Market Dynamics Predictor | AI/ML | Week 6-20 |
| **AI Services** | Autonomous Strategy Recommender | AI/ML | Week 8-24 |
| **Platform** | Self-Optimizing Workflow Engine | Platform | Week 4-16 |
| **Platform** | Continuous Learning Pipeline | Platform | Week 6-18 |
| **Analytics** | Strategic Intelligence Cockpit | Analytics | Week 8-20 |
| **Governance** | AI Ethics & Bias Monitoring | Compliance | Week 1-12 |
| **Operations** | Full enterprise operationalization | Operations | Ongoing |

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Prediction accuracy (KOL) | >75% | Validation studies |
| Autonomous recommendations accepted | >60% | Usage analytics |
| Strategic decisions influenced | 50+ per quarter | Leadership surveys |
| Annual value delivered | $20M+ | ROI calculation |
| AI maturity score | L5 across functions | Assessment |

---

# 11. API Specifications

## 11.1 Core API Architecture

```
                        VITAL API ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                    │
│  • Rate limiting  • Authentication  • Request validation  • Routing        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   REST API      │       │   GraphQL API   │       │  WebSocket API  │
│   /api/v1/*     │       │   /graphql      │       │   /ws           │
│                 │       │                 │       │                 │
│ • CRUD ops      │       │ • Flexible      │       │ • Real-time     │
│ • Simple queries│       │   queries       │       │ • Streaming     │
│ • Batch ops     │       │ • Relationships │       │ • Notifications │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
│  Persona │ JTBD │ Workflow │ Agent │ Panel │ Opportunity │ Value           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11.2 REST API Endpoints

### Persona APIs

```yaml
# Persona Management
POST   /api/v1/personas                    # Create persona
GET    /api/v1/personas                    # List personas (with filters)
GET    /api/v1/personas/{id}               # Get persona by ID
PUT    /api/v1/personas/{id}               # Update persona
DELETE /api/v1/personas/{id}               # Delete persona

# Persona Context
GET    /api/v1/personas/{id}/jtbds         # Get all JTBDs for persona
GET    /api/v1/personas/{id}/goals         # Get persona goals
GET    /api/v1/personas/{id}/pains         # Get persona pain points
GET    /api/v1/personas/{id}/stakeholders  # Get stakeholder network
GET    /api/v1/personas/{id}/context       # Get full persona context (for LLM)
GET    /api/v1/personas/{id}/archetype     # Get archetype classification
GET    /api/v1/personas/{id}/capabilities  # Get capability profile
GET    /api/v1/personas/{id}/maturity      # Get AI maturity assessment

# Persona Discovery
GET    /api/v1/personas/search             # Semantic search across personas
GET    /api/v1/personas/by-role/{role_id}  # Get personas by role
GET    /api/v1/personas/by-function/{func_id} # Get personas by function
```

### JTBD APIs

```yaml
# JTBD Management
POST   /api/v1/jtbd                        # Create JTBD
GET    /api/v1/jtbd                        # List JTBDs (with filters)
GET    /api/v1/jtbd/{id}                   # Get JTBD by ID
PUT    /api/v1/jtbd/{id}                   # Update JTBD
DELETE /api/v1/jtbd/{id}                   # Delete JTBD

# JTBD Context
GET    /api/v1/jtbd/{id}/outcomes          # Get ODI outcomes
GET    /api/v1/jtbd/{id}/pains             # Get pain points
GET    /api/v1/jtbd/{id}/constraints       # Get constraints
GET    /api/v1/jtbd/{id}/workflows         # Get implementing workflows
GET    /api/v1/jtbd/{id}/opportunities     # Get enabled opportunities
GET    /api/v1/jtbd/{id}/ai-suitability    # Get AI suitability assessment
GET    /api/v1/jtbd/{id}/value-calculation # Get value calculation

# JTBD Discovery
GET    /api/v1/jtbd/search                 # Semantic search across JTBDs
GET    /api/v1/jtbd/by-pillar/{pillar}     # Get JTBDs by strategic pillar
GET    /api/v1/jtbd/by-category/{cat}      # Get JTBDs by category
GET    /api/v1/jtbd/top-opportunities      # Get top opportunity JTBDs
```

### Opportunity APIs

```yaml
# Opportunity Management
POST   /api/v1/opportunities               # Create opportunity
GET    /api/v1/opportunities               # List opportunities (with filters)
GET    /api/v1/opportunities/{id}          # Get opportunity by ID
PUT    /api/v1/opportunities/{id}          # Update opportunity
DELETE /api/v1/opportunities/{id}          # Delete opportunity

# Opportunity Context
GET    /api/v1/opportunities/{id}/jtbds    # Get related JTBDs
GET    /api/v1/opportunities/{id}/personas # Get affected personas
GET    /api/v1/opportunities/{id}/value    # Get value calculation
GET    /api/v1/opportunities/{id}/service-layer # Get target service layer
GET    /api/v1/opportunities/{id}/implementation # Get implementation details

# Opportunity Discovery
GET    /api/v1/opportunities/radar         # Get opportunity radar (ranked list)
GET    /api/v1/opportunities/by-pillar/{pillar} # Get by strategic pillar
GET    /api/v1/opportunities/by-layer/{layer}   # Get by service layer
GET    /api/v1/opportunities/top-value     # Get top value opportunities
```

### Service Layer APIs

```yaml
# L1 Ask Expert
POST   /api/v1/ask/expert                  # Submit expert query
GET    /api/v1/ask/expert/agents           # List available expert agents
GET    /api/v1/ask/expert/history          # Get query history

# L2 Ask Panel
POST   /api/v1/ask/panel                   # Submit panel query
GET    /api/v1/ask/panel/patterns          # List available reasoning patterns
GET    /api/v1/ask/panel/configurations    # List panel configurations
GET    /api/v1/ask/panel/discussions/{id}  # Get discussion transcript

# L3 Workflows
POST   /api/v1/workflows/execute           # Execute workflow
GET    /api/v1/workflows/templates         # List workflow templates
GET    /api/v1/workflows/templates/{id}    # Get workflow template details
GET    /api/v1/workflows/executions        # List workflow executions
GET    /api/v1/workflows/executions/{id}   # Get execution status/results
POST   /api/v1/workflows/executions/{id}/approve # Approve HITL checkpoint
POST   /api/v1/workflows/executions/{id}/reject  # Reject HITL checkpoint

# L4 Solution Builder
POST   /api/v1/solutions/compose           # Compose solution from request
GET    /api/v1/solutions/suites            # List available solution suites
GET    /api/v1/solutions/suites/{id}       # Get suite details
GET    /api/v1/solutions/executions        # List solution executions
GET    /api/v1/solutions/executions/{id}   # Get execution status/results
```

### Discovery & Search APIs

```yaml
# Unified Discovery
POST   /api/v1/discover                    # Natural language discovery query
GET    /api/v1/discover/brief              # Get discovery brief for persona

# Graph Queries
POST   /api/v1/graph/query                 # Execute graph query (Cypher)
GET    /api/v1/graph/paths                 # Find paths between entities
GET    /api/v1/graph/influence             # Get influence network
GET    /api/v1/graph/dependencies          # Get dependency graph

# Vector Search
POST   /api/v1/search/semantic             # Semantic search across content
POST   /api/v1/search/hybrid               # Hybrid search (graph + vector)
GET    /api/v1/search/similar              # Find similar entities
```

## 11.3 API Request/Response Schemas

### Discovery Brief Response

```json
{
  "discovery_brief": {
    "persona": {
      "id": "uuid",
      "name": "Senior MSL - Oncology",
      "archetype": "orchestrator",
      "ai_maturity_level": 3,
      "vpanes_score": 8.5
    },
    "top_jtbds": [
      {
        "id": "uuid",
        "name": "Prepare for KOL Scientific Exchange",
        "relevance_score": 0.95,
        "ai_suitability_score": 0.88,
        "intervention_type": "augment",
        "top_outcomes": [
          {
            "statement": "Minimize time to synthesize KOL's publication history",
            "opportunity_score": 14.2
          }
        ]
      }
    ],
    "recommended_opportunities": [
      {
        "id": "uuid",
        "name": "KOL Meeting Preparation Suite",
        "opportunity_rank": 3,
        "composite_score": 9.1,
        "target_service_layer": "L4",
        "estimated_annual_value": 450000,
        "implementation_status": "available"
      }
    ],
    "recommended_service_layer": "L2",
    "recommended_agents": [
      {
        "id": "uuid",
        "name": "KOL Intelligence Agent",
        "domain": "stakeholder_intelligence"
      }
    ],
    "capability_gaps": [
      {
        "capability": "Real-World Evidence Analysis",
        "gap_type": "insufficient",
        "recommended_learning": ["RWE Fundamentals Course"]
      }
    ]
  },
  "meta": {
    "generated_at": "2026-03-15T14:30:00Z",
    "cache_ttl_seconds": 3600,
    "data_freshness": "real-time"
  }
}
```

### Opportunity Radar Response

```json
{
  "opportunity_radar": {
    "generated_at": "2026-03-15T14:30:00Z",
    "total_opportunities": 50,
    "filter_applied": {
      "strategic_pillar": null,
      "service_layer": null,
      "min_score": 4.0
    },
    "summary": {
      "total_estimated_value": 25000000,
      "by_layer": {
        "L1": {"count": 8, "value": 2000000},
        "L2": {"count": 12, "value": 5000000},
        "L3": {"count": 20, "value": 10000000},
        "L4": {"count": 10, "value": 8000000}
      },
      "by_pillar": {
        "SP01": {"count": 8, "value": 4000000},
        "SP02": {"count": 15, "value": 8000000},
        "SP03": {"count": 10, "value": 5000000},
        "SP04": {"count": 7, "value": 3000000},
        "SP05": {"count": 6, "value": 3000000},
        "SP06": {"count": 2, "value": 1000000},
        "SP07": {"count": 2, "value": 1000000}
      }
    },
    "opportunities": [
      {
        "rank": 1,
        "id": "uuid",
        "name": "Evidence Gap Analysis Engine",
        "strategic_pillar": "SP02",
        "composite_score": 9.4,
        "scores": {
          "odi_gap": 8.8,
          "ai_suitability": 9.2,
          "value_impact": 9.5,
          "pain_severity": 9.0,
          "frequency": 8.5,
          "cross_functional": 7.5
        },
        "intervention_type": "automate",
        "target_service_layer": "L4",
        "estimated_annual_value": 2500000,
        "implementation_status": "in_development",
        "affected_personas_count": 12,
        "related_jtbds_count": 8
      }
    ]
  }
}
```

### Workflow Execution Request

```json
{
  "workflow_template_id": "uuid",
  "context": {
    "persona_id": "uuid",
    "jtbd_id": "uuid",
    "tenant_id": "uuid"
  },
  "inputs": {
    "inquiry_text": "What is the recommended dosing for...",
    "inquiry_source": "email",
    "priority": "standard",
    "requester_type": "hcp"
  },
  "options": {
    "auto_approve_low_risk": true,
    "notification_channels": ["email", "slack"],
    "timeout_minutes": 60
  }
}
```

### Panel Discussion Request

```json
{
  "query": "Should we prioritize a phase 4 study in elderly patients given the competitive landscape and regulatory feedback?",
  "context": {
    "persona_id": "uuid",
    "jtbd_id": "uuid",
    "therapeutic_area": "oncology",
    "product_id": "uuid"
  },
  "panel_configuration": {
    "reasoning_pattern": "delphi",
    "required_domains": ["clinical", "regulatory", "heor", "competitive"],
    "max_rounds": 3,
    "consensus_threshold": 0.7,
    "include_dissent": true
  },
  "options": {
    "max_response_tokens": 2000,
    "include_sources": true,
    "include_reasoning_trace": true
  }
}
```

## 11.4 Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_uuid",
    "tenant_id": "tenant_uuid",
    "persona_id": "persona_uuid",
    "roles": ["medical_director", "publication_lead"],
    "permissions": [
      "ask:expert",
      "ask:panel",
      "workflow:execute",
      "workflow:approve",
      "opportunity:read",
      "persona:read",
      "persona:write"
    ],
    "archetype": "orchestrator",
    "ai_maturity_level": 4,
    "iat": 1710512400,
    "exp": 1710598800,
    "iss": "vital-platform"
  }
}
```

### Permission Matrix

| Role | L1 Expert | L2 Panel | L3 Workflow | L4 Solution | Admin |
|------|-----------|----------|-------------|-------------|-------|
| Viewer | Read | Read | Read | Read | — |
| Contributor | Execute | Execute | Execute | — | — |
| Approver | Execute | Execute | Execute + Approve | — | — |
| Manager | Execute | Execute | Execute + Approve | Execute | — |
| Director | Execute | Execute | Execute + Approve | Execute | Partial |
| Admin | Full | Full | Full | Full | Full |

---

# 12. Future State Architecture

## 12.1 Target State Vision (2028+)

```
                    VITAL PLATFORM - FUTURE STATE ARCHITECTURE (2028+)

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXPERIENCE LAYER                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  MA Copilot │ │ Strategic   │ │ Mobile      │ │ Voice       │               │
│  │  (Web/Desktop)│ │ Cockpit     │ │ Companion   │ │ Assistant   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INTELLIGENCE LAYER                                    │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │
│  │ Predictive Models │ │ Autonomous Agents │ │ Self-Optimizing   │             │
│  │ • KOL Influence   │ │ • Strategy Recom. │ │ • Workflow Tuning │             │
│  │ • Evidence Gaps   │ │ • Resource Alloc. │ │ • Model Retraining│             │
│  │ • Market Dynamics │ │ • Risk Detection  │ │ • Prompt Opt.     │             │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATION LAYER                                   │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │
│  │ Multi-Agent       │ │ Cross-Functional  │ │ Enterprise        │             │
│  │ Orchestrator      │ │ Integration Hub   │ │ Event Mesh        │             │
│  │ • LangGraph       │ │ • CRM/Veeva       │ │ • Real-time       │             │
│  │ • Panel Composer  │ │ • CTMS            │ │ • Event Sourcing  │             │
│  │ • Solution Builder│ │ • Safety/PV       │ │ • Saga Patterns   │             │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Persona │ │  JTBD   │ │Workflow │ │  Agent  │ │ Oppor-  │ │ Govern- │       │
│  │ Service │ │ Service │ │ Service │ │ Service │ │ tunity  │ │  ance   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           KNOWLEDGE LAYER                                       │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │
│  │ PostgreSQL        │ │ Neo4j             │ │ Pinecone          │             │
│  │ (Source of Truth) │ │ (Knowledge Graph) │ │ (Vector Store)    │             │
│  │ • 500+ tables     │ │ • Full ontology   │ │ • Multi-modal     │             │
│  │ • Multi-tenant    │ │ • Real-time sync  │ │ • 100M+ vectors   │             │
│  │ • Global RLS      │ │ • Graph ML        │ │ • Hybrid search   │             │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FOUNDATION LAYER                                      │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐             │
│  │ Security & Compl. │ │ Observability     │ │ Infrastructure    │             │
│  │ • Zero Trust      │ │ • Full telemetry  │ │ • Multi-cloud     │             │
│  │ • AI Ethics       │ │ • AI monitoring   │ │ • Edge compute    │             │
│  │ • Audit/Lineage   │ │ • Anomaly detect  │ │ • Auto-scaling    │             │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 12.2 Cross-Functional Expansion

### Target Functions (Beyond Medical Affairs)

```
                    ENTERPRISE PHARMACEUTICAL AI PLATFORM

                              ┌─────────────────┐
                              │    VITAL OS     │
                              │  (Shared Core)  │
                              └────────┬────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Medical   │ │   Market    │ │ Regulatory  │ │  Clinical   │ │ Commercial  │
│   Affairs   │ │   Access    │ │   Affairs   │ │ Development │ │             │
│             │ │             │ │             │ │             │ │             │
│ (Current)   │ │ (Phase 2)   │ │ (Phase 2)   │ │ (Phase 3)   │ │ (Phase 3)   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │               │               │               │               │
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHARED ONTOLOGY COMPONENTS                           │
│  • Personas (250+)  • JTBDs (500+)  • Workflows (600+)  • Agents (400+)    │
│  • Cross-functional relationships  • Enterprise value model                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Function Expansion Roadmap

| Function | Target Date | Personas | JTBDs | Key Capabilities |
|----------|-------------|----------|-------|------------------|
| Medical Affairs | Q2 2026 | 43 | 120 | Current scope |
| Market Access | Q4 2026 | 25 | 60 | Payer evidence, HTA support, contracting |
| Regulatory Affairs | Q4 2026 | 20 | 50 | Submission prep, compliance monitoring |
| Clinical Development | Q2 2027 | 35 | 80 | Protocol optimization, site selection |
| Commercial | Q2 2027 | 40 | 90 | Brand strategy, KAM support |
| R&D | Q4 2027 | 30 | 70 | Target identification, compound selection |
| Safety/PV | Q4 2027 | 15 | 40 | Signal detection, case processing |
| Supply Chain | Q2 2028 | 20 | 50 | Demand forecasting, logistics |
| Manufacturing | Q2 2028 | 15 | 40 | Quality optimization, deviation handling |
| **Total** | Q2 2028 | **250+** | **600+** | Enterprise coverage |

## 12.3 Advanced Capabilities Roadmap

### 2026: Foundation & Acceleration
- ✅ Full ontology schema (280+ tables)
- ✅ Hybrid data architecture
- ✅ L1-L3 service layers
- ✅ Core RAG capabilities
- ✅ Basic governance framework

### 2027: Orchestration & Integration
- [ ] L4 Solution Suites
- [ ] Multi-agent orchestration
- [ ] Cross-functional integration
- [ ] Real-time intelligence dashboards
- [ ] Advanced compliance automation

### 2028: Intelligence & Autonomy
- [ ] Predictive ML models
- [ ] Autonomous recommendation systems
- [ ] Self-optimizing workflows
- [ ] Enterprise-wide deployment
- [ ] Full function coverage

### 2029+: Transformation & Innovation
- [ ] Federated learning across tenants (privacy-preserving)
- [ ] Multi-modal AI (documents, images, voice)
- [ ] Real-time global intelligence network
- [ ] AI-driven strategic planning
- [ ] Regulatory AI co-pilot (global submissions)

## 12.4 Technology Evolution

### AI/ML Capabilities

| Capability | 2026 | 2027 | 2028 | 2029+ |
|------------|------|------|------|-------|
| LLM Integration | GPT-4 class | GPT-5 class | Multi-modal | AGI-adjacent |
| RAG | VectorRAG | Hybrid RAG | GraphRAG + Agentic | Self-constructing |
| Multi-Agent | Basic panels | Full orchestration | Autonomous teams | Emergent coordination |
| ML Models | Classification | Prediction | Causal inference | Continuous learning |
| Personalization | Rule-based | Embedding-based | Behavioral | Anticipatory |

### Infrastructure Evolution

| Component | 2026 | 2027 | 2028 | 2029+ |
|-----------|------|------|------|-------|
| Compute | Cloud (single region) | Multi-region | Hybrid cloud | Edge + Cloud |
| Database | PostgreSQL + Neo4j | + Graph ML | + Time series | + Federated |
| Vector Store | Pinecone | + Multi-modal | + Real-time | + On-device |
| Orchestration | LangGraph | + Event mesh | + Saga patterns | + Self-healing |
| Security | RBAC + RLS | Zero Trust | AI Ethics | Autonomous governance |

---

# 13. Appendices

## Appendix A: Strategic Pillar Definitions

| Pillar | Name | Description | Key JTBDs |
|--------|------|-------------|-----------|
| SP01 | Growth & Market Access | Evidence for access, payer engagement, launch excellence | Evidence generation, payer dossiers, launch readiness |
| SP02 | Scientific Excellence | Publications, evidence synthesis, scientific leadership | Publication lifecycle, evidence synthesis, congress strategy |
| SP03 | Stakeholder Engagement | KOL/HCP engagement, advisory boards, congress activities | KOL planning, meeting prep, insight capture |
| SP04 | Compliance & Quality | Regulatory compliance, quality assurance, risk management | MLR review, SOP compliance, adverse event handling |
| SP05 | Operational Excellence | Process efficiency, resource optimization, performance | Workflow optimization, resource allocation, metrics |
| SP06 | Talent Development | Capability building, training, succession planning | Skill development, training delivery, competency assessment |
| SP07 | Innovation & Digital | AI adoption, digital transformation, innovation | Use case discovery, technology adoption, change management |

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Archetype** | Behavioral classification (Automator, Orchestrator, Learner, Skeptic) based on work complexity and AI readiness |
| **GraphRAG** | Retrieval-augmented generation using graph traversal for relationship-aware context |
| **HITL** | Human-in-the-loop; manual checkpoint requiring human approval |
| **JTBD** | Jobs-to-be-Done; outcome-focused framework for understanding user needs |
| **LangGraph** | Framework for building stateful, multi-actor applications with LLMs |
| **ODI** | Outcome-Driven Innovation; methodology for quantifying unmet needs |
| **Panel** | Multi-agent reasoning system with structured deliberation patterns |
| **Persona** | Composite representation of a user type with goals, pains, and context |
| **RAG** | Retrieval-Augmented Generation; combining search with LLM generation |
| **RLS** | Row-Level Security; database access control by tenant |
| **Service Layer** | Tiered AI capability (L1: Expert, L2: Panel, L3: Workflow, L4: Solution) |
| **VectorRAG** | Retrieval-augmented generation using vector similarity search |
| **VPANES** | Value, Pain, Adoption, Network effects, Ease, Strategic importance scoring |

## Appendix C: Document Cross-References

| Source Document | Sections Integrated |
|-----------------|---------------------|
| Medical Affairs AI Strategy | Sections 1.1, 6.1-6.6, 7.1-7.5 |
| Medical Affairs AI Maturity Model | Section 5.1-5.5 |
| Interaction Intelligence PRD/ARD | Sections 8.1-8.5, 11.1-11.4 |
| Neo4j Schema with Stories | Section 8.3 (complete DDL) |
| Medical Affairs Ontology Strategy YAML | Sections 8.1-8.2, 9.1-9.4 |
| MA JTBD Value Opportunity Blueprint | Sections 2.1-2.4, 3.1-3.3, 4.1-4.4 |
| Cross-Functional Persona Archetype Framework | Section 1.1-1.4 |

---

# Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-09 | Architecture Team | Initial ontology strategy |
| 2.0 | 2025-10 | Architecture Team | Added Neo4j integration |
| 3.0 | 2025-11 | Architecture Team | Added persona framework |
| 4.0 | 2025-11-28 | Architecture Team | Comprehensive integration of all strategy documents |

---

**END OF MASTER STRATEGY DOCUMENT v4.0**
