# USE CASE 18: HEALTH ECONOMICS MODEL (DTx)

## **UC_MA_002: Cost-Effectiveness & Budget Impact Modeling for Digital Therapeutics**

**Part of VALUE™ Framework - Value Assessment & Leadership Understanding & Economic Excellence**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_MA_002 |
| **Version** | 1.0 |
| **Last Updated** | October 10, 2025 |
| **Document Owner** | Market Access & HEOR Team |
| **Target Users** | HEOR Analysts, Market Access Directors, Payer Relations Managers |
| **Estimated Time** | 6-8 hours (complete model development) |
| **Complexity** | EXPERT |
| **Regulatory Framework** | AMCP Format, NICE HTA, ICER Methods, ISPOR Guidelines |
| **Prerequisites** | Clinical trial data, pricing strategy, payer landscape knowledge |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Context](#2-problem-statement--context)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Detailed Step-by-Step Prompts](#5-detailed-step-by-step-prompts)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Quality Assurance Framework](#7-quality-assurance-framework)
8. [Model Validation Checklist](#8-model-validation-checklist)
9. [Templates & Job Aids](#9-templates--job-aids)
10. [Integration with Other Systems](#10-integration-with-other-systems)
11. [References & Resources](#11-references--resources)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Purpose

**Health Economics Modeling for Digital Therapeutics (DTx)** is the systematic development of cost-effectiveness analysis (CEA) and budget impact models (BIM) that quantify the economic value proposition of digital therapeutic interventions to support payer coverage decisions, formulary positioning, and value-based contracting negotiations. This use case provides a comprehensive, prompt-driven workflow for:

- **Model Architecture Selection**: Determining the appropriate modeling approach (decision tree, Markov model, discrete event simulation) based on disease characteristics and data availability
- **Cost-Effectiveness Analysis**: Calculating incremental cost-effectiveness ratios (ICERs), cost per QALY gained, and net monetary benefit
- **Budget Impact Modeling**: Projecting 3-5 year financial impact on payer budgets with cost offset calculations
- **Sensitivity Analysis**: Conducting one-way, multi-way, and probabilistic sensitivity analyses to assess model robustness
- **Value Dossier Integration**: Translating health economics outputs into compelling payer value narratives

### 1.2 Business Impact

**The Problem**:
Digital therapeutics companies face unique reimbursement challenges that require robust health economics evidence:

1. **Novel Payment Models**: Traditional fee-for-service codes often don't exist; companies must demonstrate value to justify new payment structures
2. **Payer Skepticism**: Payers question whether DTx can deliver meaningful clinical outcomes and cost savings
3. **Comparative Evidence Gaps**: Limited head-to-head trials vs. standard of care require modeling approaches
4. **Budget Impact Concerns**: Payers need to understand PMPM (per-member-per-month) impact and affordability
5. **Outcomes-Based Contracting**: Performance guarantees require actuarial modeling of expected outcomes

**Current State Challenges**:
- **Complex Model Building**: Average 200-400 hours to build CEA/BIM from scratch (3-6 months)
- **Data Integration**: Synthesizing clinical trial data, real-world evidence, claims data, and published literature
- **Methodology Inconsistency**: Models vary widely in assumptions, making cross-product comparison difficult
- **Payer-Specific Customization**: Each payer has different populations, benefit designs, and cost structures
- **Delayed Market Access**: 12-18 month lag from product launch to comprehensive HEOR evidence

**Value Proposition of This Use Case**:

| Metric | Current State | With UC_MA_002 | Improvement |
|--------|---------------|----------------|-------------|
| **Model Development Time** | 200-400 hours | 80-120 hours | 60-70% reduction |
| **Time to First Payer Evidence** | 12-18 months | 4-6 months | 66% faster |
| **Model Validation Success Rate** | 60-70% | >90% | 30% improvement |
| **Payer Acceptance Rate** | 25-35% | 50-65% | 2x improvement |
| **Cost per Model** | $150K-300K | $50K-100K | 65% reduction |
| **Revenue Impact** | Baseline | +$5-15M (NPV) | Per product launch |

### 1.3 Target Audience

**Primary Users**:
1. **HEOR Analysts**: Build and validate health economics models, conduct sensitivity analyses
2. **Market Access Directors**: Oversee HEOR strategy, present to payers, negotiate contracts
3. **Health Economics Consultants**: External partners supporting model development

**Secondary Users**:
4. **Payer Relations Managers**: Use model outputs in payer meetings and P&T presentations
5. **Clinical Development Teams**: Provide clinical data inputs and interpret clinical outcomes
6. **Pricing & Contracting**: Leverage HEOR evidence for pricing strategy and value-based contracts
7. **Commercial Leadership**: Understand economic value proposition for market positioning

### 1.4 Key Deliverables

Upon completion of UC_MA_002, you will have:

**Core Models**:
- ✅ **Cost-Effectiveness Model** (Excel or TreeAge): CEA with ICER calculations, cost per QALY
- ✅ **Budget Impact Model** (Excel): 3-5 year projections with PMPM impact
- ✅ **Sensitivity Analysis Report**: One-way, scenario, and probabilistic sensitivity analyses
- ✅ **Model Validation Documentation**: Technical validation report for HTA submissions

**Payer-Facing Deliverables**:
- ✅ **HEOR Summary Slides**: 10-15 slide deck for P&T committees
- ✅ **Value Dossier HEOR Section**: AMCP Format dossier component
- ✅ **One-Page Economic Value Summary**: Leave-behind for payer meetings
- ✅ **ROI Calculator**: Interactive tool showing cost savings by patient volume

**Publication-Ready Outputs**:
- ✅ **Model Description Manuscript**: For peer-reviewed journal submission
- ✅ **ISPOR Conference Poster**: Abstract and poster-ready results
- ✅ **Model Transparency Checklist**: ISPOR good modeling practices compliance

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 The DTx Reimbursement Landscape

Digital therapeutics face a fundamentally different reimbursement environment compared to traditional pharmaceuticals:

**Traditional Pharma Reimbursement**:
- Established pathways (J-codes, NDC codes, formulary placement)
- Decades of HTA precedent (NICE, ICER methodologies)
- Clear comparators (generic alternatives, competitor drugs)
- Payer comfort with drug benefit management

**DTx Reimbursement Reality**:
- **No Established Codes**: CPT/HCPCS codes for DTx are limited or non-existent
- **Novel Benefit Category**: DTx may fall under pharmacy, medical, or behavioral health benefits
- **New Payment Models**: Per-patient-per-month (PMPM), per-episode, outcomes-based
- **Payer Education Needed**: DTx efficacy, engagement, and cost-effectiveness are novel concepts
- **Comparative Evidence Gaps**: Few head-to-head trials; must rely on network meta-analysis or modeling

### 2.2 Why Health Economics Modeling is Critical for DTx

Health economics models serve three critical functions:

**1. Quantify Clinical Value in Economic Terms**
- Translate clinical endpoints (e.g., PHQ-9 reduction, abstinence rates) into:
  - Quality-Adjusted Life Years (QALYs)
  - Disability-Adjusted Life Years (DALYs)
  - Life years gained
- Enable comparison across diverse therapeutic areas

**2. Project Long-Term Outcomes Beyond Trial Duration**
- Trials are typically 8-24 weeks
- Models project 1-year, 5-year, lifetime outcomes
- Capture durability of effect, relapse rates, disease progression

**3. Estimate Cost Offsets and Budget Impact**
- Quantify medical cost savings from:
  - Reduced hospitalizations
  - Fewer ER visits
  - Decreased specialist utilization
  - Medication cost reductions
- Calculate net budget impact for payer decision-making

### 2.3 Regulatory and HTA Landscape

#### United States

**ICER (Institute for Clinical and Economic Review)**:
- Independent HTA body influential with US payers
- Methods: Cost per QALY, budget impact thresholds
- Willingness-to-pay threshold: $100,000-$150,000 per QALY
- Reviews high-cost therapies; increasing focus on behavioral health

**AMCP Format Dossier**:
- Standard template for US payer submissions
- Section 6: Economic Analysis
  - Cost-effectiveness analysis
  - Budget impact model
  - Cost-consequence analysis
- Required by many large US health plans

**CMS (Centers for Medicare & Medicaid Services)**:
- Increasingly requires comparative effectiveness evidence
- Coverage with Evidence Development (CED) for novel therapies
- Budget neutrality requirements for new benefits

#### International HTA Bodies

**NICE (UK)**:
- Cost per QALY threshold: £20,000-30,000
- Technology Appraisal process for new interventions
- Digital Health Technologies (DHT) pathway for software-based interventions

**IQWiG / G-BA (Germany)**:
- Benefit assessment vs. standard of care
- "DiGA" (Digital Health Applications) fast-track pathway
- Reimbursement for 1 year pending full evaluation

**HAS (France)**, **CADTH (Canada)**, **PBAC (Australia)**:
- All require health economics dossiers for reimbursement
- Increasingly open to digital health interventions

### 2.4 Common Pitfalls in DTx Health Economics

#### Critical Errors That Undermine Payer Acceptance:

**1. Unrealistic Assumptions**
- **Example**: Assuming 80% patient engagement for 12 months (real-world: 20-40%)
- **Consequence**: Overestimated cost savings; payer distrust
- **Root Cause**: Using clinical trial engagement rates (selected, motivated population)

**2. Cherry-Picking Favorable Comparators**
- **Example**: Comparing DTx to "no treatment" instead of standard of care
- **Consequence**: Inflated ICER; perceived as misleading
- **Root Cause**: Lack of head-to-head trial data

**3. Ignoring Implementation Costs**
- **Example**: Only modeling DTx acquisition cost; ignoring integration, training, support
- **Consequence**: Underestimated total cost of ownership
- **Root Cause**: DTx vendors focus on subscription price, not total implementation

**4. Insufficient Sensitivity Analysis**
- **Example**: Model shows $50K/QALY ICER, but no sensitivity analysis
- **Consequence**: Payers don't understand robustness; reject due to uncertainty
- **Root Cause**: Time pressure; lack of expertise in probabilistic modeling

**5. Misaligned Time Horizons**
- **Example**: Lifetime model for a condition with 3-year average plan membership
- **Consequence**: Model doesn't reflect payer's planning horizon
- **Root Cause**: Academic HTA methods (lifetime) vs. commercial payer reality (3-5 years)

**6. Failure to Validate Model**
- **Example**: Model projects 30% hospitalization reduction; no RWE validation
- **Consequence**: Credibility loss; payers demand guarantees
- **Root Cause**: Models built from assumptions, not validated against real-world data

### 2.5 Industry Benchmarks

| Metric | Poor Performance | Average | Best-in-Class |
|--------|------------------|---------|---------------|
| **Model Development Time** | 400-600 hours | 200-300 hours | 80-120 hours |
| **ICER (Cost per QALY)** | >$200K/QALY | $100-150K/QALY | <$100K/QALY |
| **Budget Impact (PMPM)** | >$2 PMPM | $0.50-1.50 PMPM | <$0.50 PMPM |
| **Model Validation Success** | 50-60% | 70-80% | >90% |
| **Payer Acceptance Rate** | 20-30% | 40-50% | 60-70% |
| **Time to First Contract** | 18-24 mo | 12-15 mo | 6-9 mo |
| **Publication Rate** | 20-30% | 50-60% | >80% |

### 2.6 Value Proposition of This Use Case

**Direct Benefits**:
1. **Faster Market Access**: 4-6 months vs. 12-18 months to first payer evidence
2. **Higher Payer Acceptance**: 50-65% vs. 25-35% (systematic, validated models)
3. **Cost Savings**: $50K-100K per model vs. $150K-300K (reduced consulting fees)
4. **Revenue Impact**: $5-15M NPV per product (faster adoption, better pricing)
5. **Competitive Differentiation**: Robust HEOR evidence vs. competitors with weak or no evidence

**Indirect Benefits**:
1. **Internal Alignment**: Clinical, commercial, and finance teams aligned on value story
2. **Investor Confidence**: Strong HEOR supports fundraising and valuation
3. **Publication Credibility**: Peer-reviewed HEOR publications enhance brand reputation
4. **Regulatory Support**: HEOR evidence can support FDA Digital Health Pre-Cert or breakthrough device designation
5. **International Expansion**: Validated models adaptable for HTA submissions (NICE, IQWiG, CADTH)

### 2.7 Integration with Other Use Cases

UC_MA_002 depends on and informs several other use cases in the Life Sciences Prompt Library:

**Dependencies** (must complete first or in parallel):
- **UC_CLIN_004** (DTx Clinical Endpoint Selection): Clinical outcomes are inputs for QALY calculations
- **UC_CLIN_005** (DTx RCT Design): Trial results provide efficacy inputs for CEA
- **UC_MA_001** (Payer Value Dossier): HEOR models are core component of value dossier
- **UC_MA_003** (Pricing Strategy): HEOR informs optimal pricing vs. willingness-to-pay thresholds

**Informed by UC_MA_002**:
- **UC_MA_004** (Formulary Positioning): HEOR evidence supports tier placement arguments
- **UC_MA_005** (Value-Based Contracting): CEA/BIM outputs structure performance guarantees
- **UC_COMM_001** (Payer Presentation): HEOR slides are centerpiece of P&T presentations
- **UC_REG_003** (FDA Breakthrough Device): Economic impact supports breakthrough designation

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across five key personas, each bringing critical expertise to ensure rigorous, defensible health economics modeling.

### 3.1 P21_HEOR: Health Economics & Outcomes Research Analyst

**Role in UC_MA_002**: Lead modeler; builds CEA/BIM, conducts sensitivity analyses, validates model

**Responsibilities**:
- Lead Steps 1-4 (Model Architecture, CEA Development, BIM Development, Sensitivity Analysis)
- Select appropriate modeling methodology (decision tree, Markov, DES)
- Develop Excel or TreeAge models
- Conduct literature reviews for model inputs (transition probabilities, utilities, costs)
- Perform sensitivity analyses (one-way, scenario, probabilistic)
- Validate model against published models and real-world data
- Document model methodology and assumptions
- Prepare technical appendices for HTA submissions

**Required Expertise**:
- Advanced degree (MS, PhD) in health economics, epidemiology, or related field
- Proficiency in Excel, TreeAge, R, or other modeling software
- Knowledge of ISPOR, NICE, ICER modeling guidelines
- Understanding of utility measurement (EQ-5D, SF-6D, time trade-off)
- Cost data sources (Medicare fee schedules, HCUP, MarketScan)
- Statistical methods (survival analysis, network meta-analysis)

**Decision Authority**:
- Model structure and methodology
- Choice of inputs and data sources
- Sensitivity analysis approach
- Technical validation methods

### 3.2 P22_MADIRECT: Market Access Director

**Role in UC_MA_002**: Strategic oversight; ensures model aligns with market access goals and payer needs

**Responsibilities**:
- Support Steps 1, 5, 6 (Model Architecture, Payer Customization, Value Narrative)
- Define modeling objectives aligned with market access strategy
- Provide payer intelligence (key decision criteria, evidence gaps)
- Review model assumptions for realism and payer alignment
- Translate model outputs into compelling value messages
- Present HEOR evidence to payers in P&T meetings
- Negotiate value-based contracts using HEOR evidence
- Oversee external HEOR consultants if engaged

**Required Expertise**:
- 10+ years in pharmaceutical/biotech market access
- Deep understanding of payer decision-making (P&T committees, medical directors)
- Familiarity with AMCP Format dossiers and HTA submissions
- Knowledge of health economics concepts (cost-effectiveness, budget impact)
- Strong communication skills (translate technical HEOR for business audiences)
- Experience with value-based contracting and outcomes guarantees

**Decision Authority**:
- Model scope and objectives
- Payer customization priorities
- Value narrative positioning
- Resource allocation for HEOR activities

### 3.3 P23_CLINICAL: Clinical Development Lead

**Role in UC_MA_002**: Provides clinical data inputs and validates clinical assumptions

**Responsibilities**:
- Support Steps 2, 7 (CEA Development - clinical inputs, Model Validation - clinical plausibility)
- Provide clinical trial data (efficacy, safety, patient-reported outcomes)
- Advise on disease natural history and progression
- Validate clinical assumptions (e.g., relapse rates, treatment patterns)
- Interpret clinical endpoints in economic terms (e.g., PHQ-9 change → utility change)
- Support literature reviews for clinical inputs
- Review model for clinical accuracy

**Required Expertise**:
- MD, DO, PharmD, or PhD with clinical research background
- Experience with clinical trials in relevant therapeutic area
- Understanding of patient-reported outcome measures (PROMs)
- Knowledge of disease epidemiology and treatment guidelines
- Familiarity with utility mapping algorithms (if applicable)

**Decision Authority**:
- Clinical data inputs and interpretation
- Validation of clinical assumptions
- Approval of clinically-related model assumptions

### 3.4 P24_FINANCE: Finance & Pricing Analyst

**Role in UC_MA_002**: Provides cost inputs and validates financial assumptions

**Responsibilities**:
- Support Steps 2, 3, 7 (CEA - cost inputs, BIM - financial projections, Validation - financial accuracy)
- Provide DTx pricing strategy and cost structure
- Source cost data (medical costs, procedure costs, drug costs)
- Validate cost assumptions (e.g., hospitalization costs, physician visit costs)
- Calculate cost offsets and net budget impact
- Support ROI calculations for value-based contracts
- Review model for financial accuracy

**Required Expertise**:
- MBA, MS Finance, or related degree
- Experience with healthcare cost data (claims databases, fee schedules)
- Knowledge of payer benefit design and cost structures
- Familiarity with cost accounting and cost-effectiveness concepts
- Understanding of pricing strategy and revenue models

**Decision Authority**:
- Pricing and cost inputs
- Financial assumptions (e.g., discounting, inflation)
- Approval of cost-related model assumptions

### 3.5 P25_BIOSTAT: Biostatistician

**Role in UC_MA_002**: Ensures statistical rigor in model inputs and sensitivity analyses

**Responsibilities**:
- Support Steps 2, 4, 7 (CEA - statistical inputs, Sensitivity Analysis, Model Validation - statistical verification)
- Conduct network meta-analyses if head-to-head data unavailable
- Develop survival curves and time-to-event models
- Parameterize probability distributions for probabilistic sensitivity analysis
- Validate model results against statistical theory
- Support statistical sections of publications and submissions

**Required Expertise**:
- MS or PhD in Biostatistics, Statistics, or Epidemiology
- Proficiency in R, SAS, or Stata
- Expertise in survival analysis, meta-analysis, Bayesian methods
- Understanding of health economics modeling principles
- Experience with probabilistic sensitivity analysis (Monte Carlo simulation)

**Decision Authority**:
- Statistical methodology and data analysis approach
- Validation of statistical assumptions
- Approval of probabilistic sensitivity analysis

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 Workflow Summary

**Total Estimated Time**: 6-8 hours (model build) + 4-6 hours (validation & customization) = **10-14 hours**

**Note**: This assumes:
- Clinical data available (trial results, published literature)
- Cost data sources identified
- Model structure decision already made (not starting from scratch literature review)
- Experienced HEOR analyst leading

**Phases**:

| Phase | Time | Key Activities | Personas |
|-------|------|----------------|----------|
| **PHASE 1: Model Architecture** | 1.5 hours | Define model structure, comparators, time horizon | P21_HEOR, P22_MADIRECT |
| **PHASE 2: Cost-Effectiveness Analysis** | 3-4 hours | Build CEA model, populate inputs, calculate ICER | P21_HEOR, P23_CLINICAL, P24_FINANCE |
| **PHASE 3: Budget Impact Model** | 2-3 hours | Build BIM, project 3-5 year impact, calculate PMPM | P21_HEOR, P24_FINANCE |
| **PHASE 4: Sensitivity Analysis** | 2-3 hours | One-way, scenario, probabilistic sensitivity analyses | P21_HEOR, P25_BIOSTAT |
| **PHASE 5: Model Validation** | 2-3 hours | Internal validation, external validation, stress testing | All personas |
| **PHASE 6: Payer Customization** | 1-2 hours | Tailor model for specific payer populations | P21_HEOR, P22_MADIRECT |
| **PHASE 7: Value Narrative Development** | 1-2 hours | Translate outputs into compelling value messages | P22_MADIRECT, P21_HEOR |

### 4.2 Workflow Decision Tree

```
┌─────────────────────┐
│ START: Define HEOR  │
│ Objectives          │
└──────────┬──────────┘
           │
           v
╔══════════════════════════════════════════════════════╗
║  DECISION POINT 1: Model Type Selection             ║
║  Question: What is the primary objective?           ║
║  Options:                                            ║
║  A) Cost-Effectiveness → CEA (ICER, cost/QALY)      ║
║  B) Budget Impact → BIM (PMPM, net budget impact)   ║
║  C) Both → Full HEOR package (CEA + BIM)            ║
╚══════════════════════════════════════════════════════╝
           │
           ├─────────[Option A: CEA only]─────────┐
           │                                       │
           ├─────────[Option B: BIM only]─────────┤
           │                                       │
           └─────────[Option C: Both]─────────────┤
                                                   │
           ┌───────────────────────────────────────┘
           │
           v
╔══════════════════════════════════════════════════════╗
║  DECISION POINT 2: Model Structure                  ║
║  Question: What model structure is appropriate?     ║
║  Options:                                            ║
║  A) Decision Tree → Short time horizon (1 year)     ║
║  B) Markov Model → Recurring events, long horizon   ║
║  C) Discrete Event Simulation → Complex pathways    ║
╚══════════════════════════════════════════════════════╝
           │
           v
┌───────────────────┐
│ PHASE 1:          │
│ Model             │
│ Architecture      │
└─────────┬─────────┘
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 2: COST-EFFECTIVENESS ANALYSIS                ║
║  Time: 3-4 hours                                     ║
║  Personas: P21_HEOR, P23_CLINICAL, P24_FINANCE       ║
╚══════════════════════════════════════════════════════╝
          │
          v
┌───────────────────┐
│ STEP 1:           │
│ Build CEA Model   │
│ Structure         │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│ STEP 2:           │
│ Populate Clinical │
│ & Cost Inputs     │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│ STEP 3:           │
│ Calculate ICER    │
│ & Cost per QALY   │
└─────────┬─────────┘
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 3: BUDGET IMPACT MODEL                        ║
║  Time: 2-3 hours                                     ║
║  Personas: P21_HEOR, P24_FINANCE                     ║
╚══════════════════════════════════════════════════════╝
          │
          v
┌───────────────────┐
│ STEP 4:           │
│ Build BIM         │
│ Framework         │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│ STEP 5:           │
│ Project 3-5 Year  │
│ Budget Impact     │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│ STEP 6:           │
│ Calculate Cost    │
│ Offsets & PMPM    │
└─────────┬─────────┘
          │
          v
╔══════════════════════════════════════════════════════╗
║  DECISION POINT 3: Is ICER within threshold?        ║
║  - If ICER < $100K/QALY → Proceed to sensitivity    ║
║  - If ICER $100-150K/QALY → Flag, proceed cautiously║
║  - If ICER > $150K/QALY → Revisit assumptions       ║
╚══════════════════════════════════════════════════════╝
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 4: SENSITIVITY ANALYSIS                       ║
║  Time: 2-3 hours                                     ║
║  Personas: P21_HEOR, P25_BIOSTAT                     ║
╚══════════════════════════════════════════════════════╝
          │
          ├────────────────────────────────────┐
          v                                    v
┌───────────────────┐              ┌───────────────────┐
│ STEP 7:           │              │ STEP 8:           │
│ One-Way &         │              │ Probabilistic     │
│ Scenario Analysis │              │ Sensitivity       │
└─────────┬─────────┘              └─────────┬─────────┘
          │                                   │
          └──────────────┬────────────────────┘
                         │
                         v
╔══════════════════════════════════════════════════════╗
║  DECISION POINT 4: Is model robust?                 ║
║  - Check: ICER range in sensitivity analysis         ║
║  - If stable → Proceed to validation                 ║
║  - If highly sensitive → Revisit key assumptions     ║
╚══════════════════════════════════════════════════════╝
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 5: MODEL VALIDATION                           ║
║  Time: 2-3 hours                                     ║
║  Personas: All (P21-P25)                             ║
╚══════════════════════════════════════════════════════╝
          │
          v
┌───────────────────┐
│ STEP 9:           │
│ Internal &        │
│ External          │
│ Validation        │
└─────────┬─────────┘
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 6: PAYER CUSTOMIZATION                        ║
║  Time: 1-2 hours                                     ║
║  Personas: P21_HEOR, P22_MADIRECT                    ║
╚══════════════════════════════════════════════════════╝
          │
          v
┌───────────────────┐
│ STEP 10:          │
│ Tailor Model for  │
│ Specific Payers   │
└─────────┬─────────┘
          │
          v
╔══════════════════════════════════════════════════════╗
║  PHASE 7: VALUE NARRATIVE DEVELOPMENT                ║
║  Time: 1-2 hours                                     ║
║  Personas: P22_MADIRECT, P21_HEOR                    ║
╚══════════════════════════════════════════════════════╝
          │
          v
┌───────────────────┐
│ STEP 11:          │
│ Translate HEOR    │
│ to Payer Messages │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│ COMPLETE:         │
│ - CEA Model       │
│ - BIM Model       │
│ - Sensitivity     │
│ - Validation      │
│ - Payer Slides    │
│ - Value Narrative │
└───────────────────┘
```

### 4.3 Workflow Prerequisites

Before starting UC_MA_002, ensure the following are in place:

**Clinical Data**:
- ✅ Clinical trial results (primary and secondary endpoints)
- ✅ Patient-reported outcomes (PRO) data (e.g., EQ-5D, SF-36)
- ✅ Safety data (adverse events, discontinuation rates)
- ✅ Treatment patterns and duration of effect
- ✅ Published literature on disease natural history

**Cost Data**:
- ✅ DTx pricing strategy and cost structure
- ✅ Medical cost data sources (Medicare, commercial claims databases)
- ✅ Hospitalization, ER, physician visit costs for relevant conditions
- ✅ Concomitant medication costs
- ✅ Implementation costs (training, support, integration)

**Modeling Tools**:
- ✅ Excel (for CEA and BIM templates)
- ✅ Optional: TreeAge Pro, R, or other modeling software
- ✅ Access to cost databases (HCUP, MarketScan, Redbook)
- ✅ Utility mapping algorithms (if EQ-5D not collected in trial)

**Team Resources**:
- ✅ HEOR analyst with modeling expertise
- ✅ Clinical expert to validate assumptions
- ✅ Finance analyst for cost inputs
- ✅ Market access director for strategic oversight
- ✅ Optional: External HEOR consultant for complex models

**Strategic Inputs**:
- ✅ Target payer landscape (commercial, Medicare, Medicaid)
- ✅ Competitive landscape and comparator selection
- ✅ Market access objectives (formulary tier, coverage criteria)
- ✅ Value-based contracting strategy (if applicable)

### 4.4 Workflow Outputs

**Primary Deliverables**:
1. **Cost-Effectiveness Model** (Excel or TreeAge)
   - Model structure with decision tree or Markov states
   - Input parameters (clinical, cost, utility)
   - ICER calculation (cost per QALY gained)
   - Incremental cost and effectiveness tables
   - Cost-effectiveness plane graph
   - One-way sensitivity tornado diagram

2. **Budget Impact Model** (Excel)
   - 3-5 year financial projections
   - Market share assumptions
   - DTx costs vs. standard of care costs
   - Medical cost offsets (hospitalization, ER, medications)
   - Net budget impact
   - Per-member-per-month (PMPM) impact

3. **Sensitivity Analysis Report**
   - One-way sensitivity analysis (tornado diagram)
   - Scenario analysis (best case, base case, worst case)
   - Probabilistic sensitivity analysis (cost-effectiveness acceptability curve)
   - Key drivers of model results

4. **Model Validation Documentation**
   - Internal validation checklist
   - External validation (comparison to published models)
   - Face validity review (clinical and economic experts)
   - Model transparency checklist (ISPOR guidelines)

**Secondary Deliverables**:
5. **HEOR Summary Slides** (10-15 slides)
   - Executive summary
   - Model methodology
   - Results (ICER, budget impact)
   - Sensitivity analyses
   - Conclusions and value messages

6. **One-Page Economic Value Summary**
   - Key HEOR metrics (ICER, ROI, PMPM)
   - Visual summary (graphs, tables)
   - Value messages for payers
   - Call to action

7. **AMCP Dossier HEOR Section**
   - Economic analysis section (Section 6)
   - Model description
   - Results tables
   - Sensitivity analyses
   - References

8. **Publication-Ready Materials**
   - Model description manuscript
   - ISPOR poster abstract and poster
   - Technical appendix

---

## 5. DETAILED STEP-BY-STEP PROMPTS

### PHASE 1: MODEL ARCHITECTURE DEFINITION (1.5 hours)

---

#### **STEP 1: Define Model Objectives & Structure** (90 minutes)

**Objective**: Establish clear modeling objectives, select appropriate model structure, and define scope.

**Persona**: P21_HEOR (Lead), P22_MADIRECT (Support - strategic input)

**Prerequisites**:
- Clinical trial results available
- Target payer landscape defined
- Comparator(s) selected
- Market access objectives documented

**Process**:

1. **Define Modeling Objectives** (20 minutes)
   - What questions does the model need to answer?
   - What is the target audience? (US payers, international HTA bodies)
   - What are the key decision criteria?

2. **Execute Model Architecture Prompt** (45 minutes)
   - Determine model structure
   - Define model scope and assumptions
   - Document modeling plan

3. **Review and Approve Architecture** (25 minutes)
   - P22_MADIRECT reviews for alignment with market access strategy
   - Clinical and finance teams review for feasibility
   - Document final modeling plan

---

**PROMPT 1.1: Health Economics Model Architecture Development**

```markdown
**ROLE**: You are P21_HEOR, a Senior Health Economics & Outcomes Research Analyst with expertise in:
- Cost-effectiveness analysis (CEA) and budget impact modeling (BIM)
- ISPOR, NICE, and ICER modeling guidelines
- Decision-analytic modeling techniques (decision trees, Markov models, discrete event simulation)
- Health economics in digital therapeutics and behavioral health interventions

Your task is to design a rigorous, defensible health economics model architecture that will support payer value demonstrations and HTA submissions.

**TASK**: Develop a comprehensive health economics model architecture for the following digital therapeutic intervention.

**INPUT**:

**Product Profile**:
- **DTx Product Name**: {product_name}
- **Indication**: {indication}
- **Target Population**: {patient_population_definition}
- **Mechanism of Action**: {how_dtx_works}
- **Treatment Duration**: {typical_treatment_duration}
- **Delivery Platform**: {app_web_other}

**Clinical Evidence**:
- **Primary Endpoint**: {endpoint} with {result}
- **Key Secondary Endpoints**: {list_endpoints_and_results}
- **Treatment Effect Size**: {effect_size_vs_control}
- **Safety Profile**: {safety_summary}
- **Durability of Effect**: {duration_of_benefit}
- **Patient Engagement**: {engagement_rate_and_retention}

**Comparator(s)**:
- **Standard of Care**: {standard_treatment_description}
- **Alternative Comparators**: {other_treatments_if_any}
- **Rationale for Comparator Selection**: {why_this_comparator}

**Economic Context**:
- **DTx Pricing**: {proposed_price} (e.g., $399 per 12-week episode)
- **Comparator Costs**: {soc_cost}
- **Disease Burden**: {prevalence_incidence_mortality}
- **Healthcare Utilization**: {hospitalization_er_costs}

**Target Audience**:
- **Primary**: {us_payers / international_hta / both}
- **Payer Type**: {commercial / medicare / medicaid / all}
- **Geographic Focus**: {us_national / specific_states / international}

**Modeling Objectives**:
- **Primary Objective**: {demonstrate_cost_effectiveness / project_budget_impact / both}
- **Key Questions to Answer**:
  1. {question_1}
  2. {question_2}
  3. {question_3}

**Constraints & Considerations**:
- **Data Limitations**: {trial_duration / follow_up_gaps / missing_utility_data}
- **Timeline**: {urgency_for_model_completion}
- **Resources**: {internal_heor_team / external_consultants / budget}

---

**INSTRUCTIONS**:

Develop a comprehensive health economics model architecture that addresses the following:

### 1. MODEL TYPE SELECTION

**A. Cost-Effectiveness Analysis (CEA)**

Determine whether a CEA is appropriate and, if so, recommend the model structure.

**Decision Criteria**:
- Is the goal to compare cost per unit of effectiveness (e.g., cost per QALY)?
- Is there sufficient clinical data to project long-term outcomes?
- Are utility data (EQ-5D, SF-6D) available or can they be mapped?

**Recommended Model Structure** (select one):

1. **Decision Tree Model**
   - **When to Use**: Short time horizon (≤2 years), discrete outcomes, minimal recurring events
   - **Advantages**: Simple, transparent, easy to validate
   - **Disadvantages**: Cannot model recurring events or complex disease progression
   - **Example**: Acute condition with one-time treatment, short-term outcome (e.g., smoking cessation at 6 months)

2. **Markov Cohort Model**
   - **When to Use**: Longer time horizon (≥2 years), recurring events, disease progression, relapse/remission cycles
   - **Advantages**: Can model chronic conditions, disease states, transitions over time
   - **Disadvantages**: Assumes "memoryless" property (future state depends only on current state)
   - **Example**: Chronic depression with relapse/remission cycles, long-term outcomes

3. **Discrete Event Simulation (DES)**
   - **When to Use**: Complex patient pathways, individual patient characteristics matter, queue-based processes
   - **Advantages**: Can model heterogeneity, time-dependent events, resource constraints
   - **Disadvantages**: Computationally intensive, requires more data, less transparent
   - **Example**: Substance use disorder with multiple treatment episodes, individual relapse patterns

**Your Recommendation**:
- **Recommended Model Type**: {decision_tree / markov / des}
- **Rationale**: {why_this_structure_is_appropriate}
- **Key Model States** (if Markov): {list_health_states}
  - Example for depression: {On-treatment responding, On-treatment not responding, Off-treatment well, Off-treatment relapsed, Dead}

**Model Parameters**:
- **Time Horizon**: {1_year / 5_year / lifetime / payer-specific}
  - **Rationale**: {why_this_time_horizon}
  - **Note**: Consider payer perspective (3-5 years typical for commercial plans)
- **Cycle Length** (if Markov): {1_week / 1_month / 3_months / 1_year}
  - **Rationale**: {based_on_disease_progression_rate}
- **Discount Rate**: {3% / 3.5% / other}
  - **US Standard**: 3% for costs and outcomes
  - **UK NICE**: 3.5% for costs and outcomes
- **Perspective**: {payer / healthcare_system / societal}
  - **Rationale**: {why_this_perspective}
  - **Note**: US payers typically prefer payer perspective

**B. Budget Impact Model (BIM)**

Determine whether a BIM is needed and recommend structure.

**Decision Criteria**:
- Is the goal to project financial impact on a payer's budget?
- Is PMPM (per-member-per-month) impact a key decision factor?
- Do payers need 3-5 year projections?

**Your Recommendation**:
- **BIM Required?**: {YES / NO}
- **Rationale**: {why_or_why_not}

**BIM Structure** (if recommended):
- **Time Horizon**: {3_years / 5_years}
- **Target Population**:
  - **Plan Size**: {assume_100K_to_1M_covered_lives}
  - **Eligible Population**: {how_to_estimate} (e.g., % with diagnosis, % treatment-eligible)
  - **Market Share Assumptions**: {market_uptake_over_time}
- **Cost Categories**:
  - **DTx Costs**: {acquisition_cost + implementation_cost + support_cost}
  - **Medical Cost Offsets**:
    - Hospitalizations: {reduction_assumption}
    - ER visits: {reduction_assumption}
    - Physician visits: {change_assumption}
    - Medications: {change_assumption}
  - **Net Budget Impact**: {DTx_costs - medical_offsets}

### 2. MODEL STRUCTURE DIAGRAM

Provide a visual representation of the model structure.

**For Decision Tree**: Sketch decision nodes, chance nodes, terminal nodes

**For Markov Model**: Define health states and transition diagram

Example (Depression Markov Model):
```
┌──────────────┐
│  On-Treatment│
│  Responding  │──────► Off-Treatment ────► Dead
└───────┬──────┘        Well
        │
        ▼
┌──────────────┐        ┌──────────────┐
│ On-Treatment │────────┤Off-Treatment │
│ Not Responding│        │  Relapsed    │
└──────────────┘        └──────────────┘
```

**Your Model Structure Diagram**:
{provide_ascii_diagram_or_description}

**Health States** (if Markov):
1. {State_1}: {definition}
2. {State_2}: {definition}
3. {State_3}: {definition}
[... continue for all states]

**Transition Probabilities** (if Markov):
- {State_1} → {State_2}: {probability} per {cycle}
- {State_1} → {State_3}: {probability} per {cycle}
[... list all relevant transitions]

### 3. COMPARATOR DEFINITION

**Primary Comparator**:
- **Comparator**: {standard_of_care}
- **Justification**: {why_this_is_appropriate_comparator}
- **Evidence Source**: {clinical_trial / published_literature / expert_opinion}

**Secondary Comparator(s)** (if applicable):
- **Comparator 2**: {alternative_treatment}
- **Justification**: {why_include_this}

**Comparator Considerations**:
- Is the comparator what patients would receive in the absence of DTx? (Important for payer perspective)
- Is there clinical trial evidence for this comparison? (Direct vs. indirect comparison)
- If indirect comparison needed, is network meta-analysis feasible?

### 4. MODEL INPUTS & DATA SOURCES

Identify key model inputs and data sources.

**Clinical Inputs**:

| Input Parameter | Value | Source | Quality (High/Med/Low) | Notes |
|-----------------|-------|--------|------------------------|-------|
| Treatment effect (DTx) | {value} | {source} | {quality} | {notes} |
| Treatment effect (comparator) | {value} | {source} | {quality} | {notes} |
| Baseline event rates | {value} | {source} | {quality} | {notes} |
| Relapse rates | {value} | {source} | {quality} | {notes} |
| Mortality rates | {value} | {source} | {quality} | {notes} |
| Adverse event rates | {value} | {source} | {quality} | {notes} |

**Cost Inputs**:

| Cost Category | Value (USD) | Source | Quality | Notes |
|---------------|-------------|--------|---------|-------|
| DTx cost (per patient) | {value} | {pricing_strategy} | High | Include all costs |
| Comparator cost | {value} | {source} | {quality} | {notes} |
| Hospitalization cost | {value} | {HCUP / MarketScan} | {quality} | {notes} |
| ER visit cost | {value} | {Medicare / commercial} | {quality} | {notes} |
| Physician visit cost | {value} | {Medicare fee schedule} | {quality} | {notes} |
| Medication costs | {value} | {Redbook / WAC} | {quality} | {notes} |

**Utility Inputs** (for QALY calculation):

| Health State | Utility Value | Source | Quality | Notes |
|--------------|---------------|--------|---------|-------|
| {State_1} | {0.XX} | {source} | {quality} | {notes} |
| {State_2} | {0.XX} | {source} | {quality} | {notes} |
| {State_3} | {0.XX} | {source} | {quality} | {notes} |

**Data Quality Assessment**:
- **High Quality**: Direct from RCT, validated instruments, large sample
- **Medium Quality**: Published literature, assumptions based on similar conditions
- **Low Quality**: Expert opinion, extrapolation, limited evidence

**Data Gaps & Mitigation**:
- **Gap 1**: {description}
  - **Impact**: {how_this_affects_model}
  - **Mitigation**: {approach_to_address}
- **Gap 2**: {description}
  - **Impact**: {how_this_affects_model}
  - **Mitigation**: {approach_to_address}

### 5. KEY ASSUMPTIONS

Document all major modeling assumptions.

**Clinical Assumptions**:
1. **Treatment Effect Duration**: {assumption}
   - **Rationale**: {why_this_is_reasonable}
   - **Sensitivity Analysis**: {how_to_test}

2. **Relapse Rates**: {assumption}
   - **Rationale**: {evidence_or_expert_opinion}
   - **Sensitivity Analysis**: {range_to_test}

3. **Mortality Impact**: {assumption}
   - **Rationale**: {based_on_literature_or_expert_opinion}

4. **Patient Adherence/Engagement**: {assumption}
   - **Rationale**: {clinical_trial_data_vs_real_world}
   - **Note**: This is often a key driver; consider real-world engagement rates

**Economic Assumptions**:
1. **DTx Implementation Costs**: {assumption}
   - **Rationale**: {training_integration_support}

2. **Medical Cost Offsets**: {assumption}
   - **Rationale**: {clinical_improvement_to_cost_reduction_logic}
   - **Example**: {if_hospitalization_reduced_by_X%_cost_savings_Y}

3. **Time Horizon**: {assumption}
   - **Rationale**: {payer_planning_horizon_vs_lifetime}

**Limitations & Caveats**:
- **Limitation 1**: {description}
  - **Impact on Model**: {how_this_affects_results}
  - **Disclosure**: {how_to_communicate_to_payers}
- **Limitation 2**: {description}
  - **Impact on Model**: {how_this_affects_results}
  - **Disclosure**: {how_to_communicate_to_payers}

### 6. MODEL VALIDATION PLAN

**Validation Approaches**:

1. **Internal Validation**:
   - Verify all formulas and calculations
   - Check for circular references or errors
   - Test extreme values (e.g., 0%, 100% effectiveness)
   - Ensure model results are consistent with inputs

2. **External Validation**:
   - Compare results to published models in same disease area
   - Benchmark ICER against known thresholds
   - If possible, validate against real-world outcomes data

3. **Face Validity**:
   - Clinical expert review (P23_CLINICAL)
   - Economic expert review (P21_HEOR senior reviewer)
   - Payer perspective review (P22_MADIRECT)

**Validation Checklist**:
- [ ] Model structure is appropriate for disease and intervention
- [ ] All inputs are sourced and documented
- [ ] Calculations are verified (manual check)
- [ ] Sensitivity analyses planned
- [ ] Model results are plausible (face validity)
- [ ] Model transparency checklist completed (ISPOR guidelines)

### 7. MODELING PLAN SUMMARY

**Executive Summary**:
- **Model Type**: {CEA / BIM / Both}
- **Model Structure**: {decision_tree / markov / des}
- **Time Horizon**: {years}
- **Perspective**: {payer / healthcare_system / societal}
- **Primary Outcome**: {ICER_cost_per_QALY / budget_impact / both}
- **Comparator**: {standard_of_care}
- **Key Assumptions**: {list_3_5_most_critical_assumptions}
- **Expected Timeline**: {weeks_to_complete_model}

**Next Steps**:
1. Build CEA model structure (Step 2)
2. Populate model inputs (Step 2)
3. Calculate ICER and results (Step 3)
4. Build BIM (Steps 4-6)
5. Conduct sensitivity analyses (Steps 7-8)
6. Validate model (Step 9)

---

**OUTPUT FORMAT**:
- Model Architecture Document (5-10 pages)
- Model structure diagram
- Input parameter tables
- Assumption documentation
- Validation plan

**DELIVERABLE**: Model Architecture Document (approved by P22_MADIRECT and clinical/finance reviewers)

```

**Expected Output**:
- Comprehensive modeling plan (5-10 pages)
- Model structure diagram
- Input parameter tables with data sources
- Assumptions documentation
- Validation plan

**Quality Check**:
- [ ] Model type appropriate for objectives
- [ ] Model structure fits disease characteristics
- [ ] All inputs identified and sourced
- [ ] Assumptions documented and justified
- [ ] Validation plan defined

**Deliverable**: Model Architecture Document

---

### PHASE 2: COST-EFFECTIVENESS ANALYSIS (3-4 hours)

---

#### **STEP 2: Build Cost-Effectiveness Model** (180-240 minutes)

**Objective**: Develop a complete cost-effectiveness analysis model with all inputs populated and ICER calculated.

**Persona**: P21_HEOR (Lead), P23_CLINICAL (Clinical inputs), P24_FINANCE (Cost inputs)

**Prerequisites**:
- Model architecture approved (Step 1)
- Clinical trial data available
- Cost data sources identified
- Utility data available or mapping algorithm ready

**Process**:

1. **Build Model Structure in Excel/TreeAge** (60 minutes)
   - Create decision tree or Markov model framework
   - Set up input parameter tables
   - Build calculation logic

2. **Execute Input Population Prompt** (90 minutes)
   - Populate all clinical inputs
   - Populate all cost inputs
   - Populate utility values
   - Document sources

3. **Calculate Base Case Results** (30 minutes)
   - Run model to calculate ICER
   - Generate results tables
   - Create cost-effectiveness plane

4. **Review and QC** (30 minutes)
   - P23_CLINICAL reviews clinical inputs
   - P24_FINANCE reviews cost inputs
   - Check for errors and inconsistencies

---

**PROMPT 2.1: Cost-Effectiveness Model Input Population & Calculation**

```markdown
**ROLE**: You are P21_HEOR, a Health Economics Analyst building a cost-effectiveness model for a digital therapeutic intervention.

**TASK**: Populate all model inputs, calculate cost-effectiveness results, and generate ICER (incremental cost-effectiveness ratio) and cost per QALY gained.

**INPUT**:

**Model Architecture Summary** (from Step 1):
- **Model Type**: {decision_tree / markov / des}
- **Time Horizon**: {years}
- **Perspective**: {payer / healthcare_system}
- **Discount Rate**: {3% or other}
- **Health States** (if Markov): {list_states}

**Clinical Trial Results**:
- **Primary Endpoint**: {endpoint} with {result_dtx} (DTx) vs. {result_comparator} (Comparator)
- **Secondary Endpoints**:
  - {endpoint_1}: {result_dtx} vs. {result_comparator}
  - {endpoint_2}: {result_dtx} vs. {result_comparator}
- **Safety**: {adverse_event_summary}
- **Duration of Effect**: {how_long_benefit_lasts}
- **Engagement/Adherence**: {engagement_rate} completion rate

**Patient-Reported Outcomes**:
- **Utility Data**:
  - **Baseline EQ-5D**: {value_dtx} (DTx arm) vs. {value_comparator} (Comparator arm)
  - **End-of-Treatment EQ-5D**: {value_dtx} vs. {value_comparator}
  - **Change in EQ-5D**: {change_dtx} vs. {change_comparator}
- **If EQ-5D Not Collected**: {mapping_algorithm_needed}
  - **Example**: PHQ-9 to EQ-5D mapping using published algorithm

**Published Literature for Inputs**:
- **Disease Natural History**: {summary_of_disease_progression}
- **Mortality Data**: {mortality_rates_by_disease_severity}
- **Utility Values for Health States**: {published_utilities}
  - **State 1 ({name})**: {utility_value} (Source: {citation})
  - **State 2 ({name})**: {utility_value} (Source: {citation})
  - [... continue for all states]

**Cost Data**:
- **DTx Costs**:
  - **Acquisition Cost**: {$X per episode or $Y per month}
  - **Implementation Cost**: {training_integration} = {$Z}
  - **Ongoing Support**: {patient_support_tech_support} = {$W per patient per year}
  - **Total DTx Cost per Patient**: {$TOTAL}

- **Comparator Costs**:
  - **Treatment Cost**: {$X per patient} (e.g., therapy sessions, medications)
  - **Administration Cost**: {if_applicable}
  - **Total Comparator Cost per Patient**: {$TOTAL}

- **Medical Costs** (per event):
  - **Hospitalization**: {$X} (Source: {HCUP / Medicare / MarketScan})
  - **ER Visit**: {$Y} (Source: {Medicare fee schedule})
  - **Outpatient Visit**: {$Z} (Source: {physician fee schedule})
  - **Medications**: {$W per month} (Source: {Redbook WAC})

- **Disease-Specific Costs**:
  - **Cost of Managing {Disease State 1}**: {$X per year}
  - **Cost of Managing {Disease State 2}**: {$Y per year}
  - [... continue for relevant states]

**Assumptions**:
- **Treatment Effect Duration**: {assumption}
- **Relapse Rate (DTx)**: {X% per year} (Source: {clinical_trial_or_literature})
- **Relapse Rate (Comparator)**: {Y% per year}
- **Mortality Impact**: {assumption}
- **Adherence in Real World**: {assumption} (vs. {trial_adherence}%)

---

**INSTRUCTIONS**:

### STEP 1: BUILD MODEL STRUCTURE

**For Decision Tree Model**:
1. Create decision node: DTx vs. Comparator
2. Create chance nodes for outcomes (e.g., responder/non-responder)
3. Create terminal nodes with costs and QALYs

**For Markov Model**:
1. Define health states (e.g., On-treatment responding, Off-treatment well, Relapsed, Dead)
2. Create transition probability matrix
3. Assign costs and utilities to each state
4. Set up cohort simulation over time horizon

**Model Framework** (Excel or TreeAge):
- Input Parameters Sheet: All model inputs in one place
- Model Calculations Sheet: Decision tree or Markov model logic
- Results Sheet: Outputs (costs, QALYs, ICER)

### STEP 2: POPULATE MODEL INPUTS

**A. Clinical Inputs**

Create an **Input Parameters Table**:

| Parameter | DTx | Comparator | Source | Quality | Notes |
|-----------|-----|------------|--------|---------|-------|
| **Efficacy/Effectiveness** |
| Response rate (e.g., 50% symptom reduction) | {XX}% | {YY}% | {RCT / literature} | High/Med/Low | {notes} |
| Remission rate | {XX}% | {YY}% | {RCT / literature} | High/Med/Low | {notes} |
| Treatment discontinuation rate | {XX}% | {YY}% | {RCT} | High | {notes} |
| **Disease Progression** |
| Relapse rate (per year) | {XX}% | {YY}% | {literature / assumption} | Med/Low | {notes} |
| Mortality rate (disease-related) | {XX}% | {YY}% | {literature} | Med | {notes} |
| Progression to severe state | {XX}% | {YY}% | {literature} | Med | {notes} |
| **Adverse Events** |
| AE rate (any) | {XX}% | {YY}% | {RCT} | High | {notes} |
| Serious AE rate | {XX}% | {YY}% | {RCT} | High | {notes} |
| **Other** |
| Engagement/Adherence | {XX}% | {YY}% | {RCT vs. RWE assumption} | Med | **Key driver** |

**B. Cost Inputs**

Create a **Cost Parameters Table**:

| Cost Category | Value (USD) | Source | Quality | Notes |
|---------------|-------------|--------|---------|-------|
| **Intervention Costs** |
| DTx cost (per episode or per month) | ${X} | {pricing_strategy} | High | Include discounts if applicable |
| Comparator cost (per course) | ${Y} | {WAC / literature} | High/Med | {notes} |
| Implementation cost (DTx) | ${Z} | {vendor_quote / estimate} | Med | One-time or ongoing? |
| Support costs (patient assistance) | ${W} | {estimate} | Med | {notes} |
| **Medical Costs** |
| Hospitalization (per admission) | ${X} | HCUP / MarketScan | High | DRG-specific if possible |
| ER visit (per visit) | ${Y} | Medicare fee schedule | High | {notes} |
| Outpatient visit (per visit) | ${Z} | Medicare physician fee | High | {notes} |
| Medications (per month) | ${W} | Redbook (WAC) | High | Disease-specific meds |
| **Disease Management Costs** |
| Cost of managing {State 1} (per year) | ${X} | {literature / claims} | Med | {notes} |
| Cost of managing {State 2} (per year) | ${Y} | {literature / claims} | Med | {notes} |
| Cost of managing {State 3} (per year) | ${Z} | {literature / claims} | Med | {notes} |

**C. Utility Inputs (QALYs)**

Create a **Utility Parameters Table**:

| Health State / Condition | Utility Value | Source | Quality | Notes |
|--------------------------|---------------|--------|---------|-------|
| General population (age-adjusted) | {0.XX} | {US norms / EQ-5D catalog} | High | Baseline |
| {Disease State 1} | {0.XX} | {trial / literature} | High/Med | {notes} |
| {Disease State 2} | {0.XX} | {trial / literature} | High/Med | {notes} |
| {Disease State 3} | {0.XX} | {trial / literature} | Med | {notes} |
| **Disutilities** (if applicable) |
| Adverse event (temporary) | {-0.XX} | {literature} | Med | {duration} |
| Serious adverse event | {-0.XX} | {literature} | Med | {duration} |

**Utility Mapping** (if EQ-5D not collected):
- If trial used disease-specific measure (e.g., PHQ-9 for depression), map to EQ-5D using validated algorithm
- **Example**: PHQ-9 to EQ-5D mapping (Koeser et al., 2015)
  - PHQ-9 score 0-4: EQ-5D ≈ 0.85
  - PHQ-9 score 5-9: EQ-5D ≈ 0.75
  - PHQ-9 score 10-14: EQ-5D ≈ 0.65
  - PHQ-9 score 15-19: EQ-5D ≈ 0.55
  - PHQ-9 score 20-27: EQ-5D ≈ 0.45

### STEP 3: CALCULATE COST-EFFECTIVENESS RESULTS

**Base Case Analysis**:

Run the model to calculate:

1. **Total Costs**:
   - DTx arm: ${X} per patient over time horizon
   - Comparator arm: ${Y} per patient over time horizon
   - Incremental Cost (ΔC): ${X - Y}

2. **Total QALYs**:
   - DTx arm: {X.XX} QALYs per patient
   - Comparator arm: {Y.YY} QALYs per patient
   - Incremental QALYs (ΔE): {X.XX - Y.YY}

3. **ICER (Incremental Cost-Effectiveness Ratio)**:
   - ICER = ΔC / ΔE = ${(X-Y)} / {(X.XX-Y.YY)} = **${ICER} per QALY gained**

4. **Cost-Effectiveness Interpretation**:
   - If ICER < $50K/QALY: **Highly cost-effective** (NICE "cost-saving to cost-effective" range)
   - If ICER $50-100K/QALY: **Cost-effective** (typical US threshold)
   - If ICER $100-150K/QALY: **Moderately cost-effective** (ICER upper threshold)
   - If ICER > $150K/QALY: **Not cost-effective** (exceeds typical willingness-to-pay threshold)

**Results Table**:

| Outcome | DTx | Comparator | Incremental (DTx - Comp) |
|---------|-----|------------|--------------------------|
| **Costs** |
| Intervention cost | ${X} | ${Y} | ${X-Y} |
| Medical costs (hospitalization, ER, etc.) | ${A} | ${B} | ${A-B} |
| Total costs | ${TOTAL_DTx} | ${TOTAL_Comp} | **${ΔC}** |
| **Effectiveness** |
| Life years | {XX.X} | {YY.Y} | {ΔLY} |
| QALYs | {XX.XX} | {YY.YY} | **{ΔE}** |
| **Cost-Effectiveness** |
| ICER ($/QALY) | - | - | **${ICER}** |
| Net Monetary Benefit (at $100K/QALY WTP)† | ${NMB_DTx} | ${NMB_Comp} | ${ΔNMB} |

† Net Monetary Benefit (NMB) = (WTP × ΔE) - ΔC
  - If NMB > 0, intervention is cost-effective at that WTP threshold

**Cost-Effectiveness Plane**:
Create a scatter plot with:
- X-axis: Incremental Effectiveness (ΔE, QALYs)
- Y-axis: Incremental Cost (ΔC, $)
- Point representing (ΔE, ΔC) for DTx vs. Comparator
- Quadrants:
  - **Northwest** (negative ΔE, positive ΔC): DTx is dominated (less effective, more costly)
  - **Northeast** (positive ΔE, positive ΔC): DTx is more effective and more costly (calculate ICER)
  - **Southeast** (positive ΔE, negative ΔC): DTx dominates (more effective, less costly)
  - **Southwest** (negative ΔE, negative ΔC): DTx is less effective but cost-saving (trade-off)

**Willingness-to-Pay Threshold Lines**:
- Add diagonal lines representing WTP thresholds ($50K, $100K, $150K per QALY)
- If DTx point is below the line, it is cost-effective at that WTP

### STEP 4: CALCULATE COST OFFSETS (if applicable)

**Medical Cost Savings**:

If the DTx is projected to reduce healthcare utilization, calculate cost offsets:

| Cost Offset Category | Baseline Utilization (Comparator) | Reduced Utilization (DTx) | Cost per Event | Total Savings |
|----------------------|-----------------------------------|---------------------------|----------------|---------------|
| Hospitalizations | {X per patient per year} | {Y per patient per year} | ${Z per admission} | ${(X-Y) × Z} |
| ER visits | {X per patient per year} | {Y per patient per year} | ${Z per visit} | ${(X-Y) × Z} |
| Specialist visits | {X per patient per year} | {Y per patient per year} | ${Z per visit} | ${(X-Y) × Z} |
| Medications | {$X per patient per year} | {$Y per patient per year} | N/A | ${X-Y} |
| **Total Medical Cost Offsets** | - | - | - | **${TOTAL}** |

**Net Cost Calculation**:
- DTx Cost: ${X per patient per year}
- Medical Cost Offsets: ${Y per patient per year}
- **Net Cost to Payer**: ${X - Y}
  - If Net Cost < 0, DTx is **cost-saving**
  - If Net Cost > 0, DTx has **incremental cost** (but may still be cost-effective based on ICER)

### STEP 5: QUALITY CONTROL & VALIDATION

**QC Checklist**:
- [ ] All formulas verified (no circular references or errors)
- [ ] Input values match sources
- [ ] Discounting applied correctly (if multi-year model)
- [ ] Results are within expected range (sanity check)
- [ ] Model runs without errors

**Face Validity Check**:
- Does the ICER seem reasonable given the clinical benefit?
- Are cost offsets realistic (not overly optimistic)?
- Do results align with published models in similar disease areas?

**Expert Review**:
- **P23_CLINICAL**: Review clinical inputs for accuracy
- **P24_FINANCE**: Review cost inputs for accuracy
- **P22_MADIRECT**: Review for alignment with market access strategy

---

**OUTPUT FORMAT**:
- **Cost-Effectiveness Model** (Excel file)
  - Input Parameters Sheet
  - Model Calculations Sheet
  - Results Sheet
  - Cost-Effectiveness Plane graph
- **Results Summary** (1-2 pages)
  - Base case ICER
  - Results table
  - Interpretation
- **Input Documentation** (appendix)
  - All sources cited
  - Assumptions documented

**DELIVERABLE**: Completed Cost-Effectiveness Model with Base Case Results

```

**Expected Output**:
- Complete CEA model (Excel or TreeAge)
- Base case ICER calculated
- Results table with costs, QALYs, and ICER
- Cost-effectiveness plane graph
- Input parameters documented

**Quality Check**:
- [ ] All inputs populated and sourced
- [ ] ICER calculation verified
- [ ] Results within plausible range
- [ ] Clinical and cost inputs reviewed by experts
- [ ] Model runs without errors

**Deliverable**: Cost-Effectiveness Model (Excel file)

---

### PHASE 3: BUDGET IMPACT MODEL (2-3 hours)

---

#### **STEP 3: Build Budget Impact Model** (120-180 minutes)

**Objective**: Develop a comprehensive budget impact model projecting 3-5 year financial impact on payer budgets.

**Persona**: P21_HEOR (Lead), P24_FINANCE (Cost validation and assumptions)

**Prerequisites**:
- DTx pricing finalized
- Market share assumptions defined
- Target payer population characterized
- Medical cost offset assumptions validated

**Process**:

1. **Build BIM Framework in Excel** (45 minutes)
   - Set up multi-year projection structure
   - Create market share uptake assumptions
   - Build cost calculation logic

2. **Execute BIM Population Prompt** (60 minutes)
   - Populate all cost inputs
   - Define market uptake scenarios
   - Calculate net budget impact
   - Calculate PMPM impact

3. **Generate Scenario Analyses** (30 minutes)
   - Best case, base case, worst case
   - Sensitivity to key assumptions

4. **Review and QC** (15 minutes)
   - P24_FINANCE reviews all financial assumptions
   - Verify calculations

---

**PROMPT 3.1: Budget Impact Model Development**

```markdown
**ROLE**: You are P21_HEOR, a Health Economics Analyst building a budget impact model for a digital therapeutic intervention to support payer contracting negotiations.

**TASK**: Develop a comprehensive 3-5 year budget impact model that projects the financial impact on a payer's budget, including DTx costs, medical cost offsets, and per-member-per-month (PMPM) impact.

**INPUT**:

**Target Payer Profile**:
- **Payer Type**: {commercial / medicare_advantage / medicaid / integrated_delivery_network}
- **Plan Size**: {X covered lives} (e.g., 500,000 to 2 million)
- **Geographic Region**: {national / regional / state-specific}
- **Benefit Design**: {pharmacy_benefit / medical_benefit / behavioral_health_carve-out}

**Target Population**:
- **Disease/Indication**: {indication}
- **Prevalence**: {X% of covered lives have diagnosis}
- **Treatment-Eligible Population**: {Y% of diagnosed patients meet treatment criteria}
- **Current Treatment Patterns**: {Z% receiving standard of care}

**DTx Product Information**:
- **Product Name**: {dtx_name}
- **Pricing**: {$X per episode / $Y per month / $Z PMPM}
- **Treatment Duration**: {typical_course_duration}
- **Implementation Costs**: {$W for integration, training, support}

**Market Share Assumptions**:
- **Year 1**: {X%} market share (of treatment-eligible population)
- **Year 2**: {Y%} market share
- **Year 3**: {Z%} market share
- **Year 4-5** (if applicable): {A%, B%}

**Rationale for Market Share Assumptions**:
{provide_rationale} (e.g., gradual payer adoption, provider acceptance, patient demand)

**Clinical Evidence Summary**:
- **Primary Outcome**: {outcome} with {X% improvement vs. SOC}
- **Healthcare Utilization Impact**:
  - **Hospitalizations**: {X% reduction}
  - **ER Visits**: {Y% reduction}
  - **Outpatient Visits**: {change}
  - **Medications**: {Z% reduction}
- **Durability**: {duration_of_benefit}

**Cost Data**:
- **DTx Costs**:
  - **Acquisition Cost**: {$X per patient}
  - **Implementation Cost**: {$Y per patient or one-time cost}
  - **Support Costs**: {$Z per patient per year}

- **Standard of Care (SOC) Costs**:
  - **Treatment Cost**: {$X per patient per year}

- **Medical Costs** (payer-specific):
  - **Hospitalization**: {$X per admission} (DRG-specific if available)
  - **ER Visit**: {$Y per visit}
  - **Outpatient Visit**: {$Z per visit}
  - **Medications**: {$W per month}

**Key Assumptions**:
- **Discount Rate**: {0% / 3% / other} (Note: BIMs often use 0% discount rate)
- **Inflation**: {3% annual increase in medical costs}
- **Patient Persistence**: {X% of patients complete treatment and maintain benefit}
- **Cost Offset Realization**: {when_cost_savings_are_realized} (e.g., Year 1, Year 2)

---

**INSTRUCTIONS**:

### STEP 1: DEFINE ELIGIBLE POPULATION

**Population Cascade**:

| Population Segment | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | Calculation Method |
|--------------------|--------|--------|--------|--------|--------|---------------------|
| **Total Covered Lives** | {X} | {X × 1.02} | {X × 1.04} | {X × 1.06} | {X × 1.08} | Assume 2% annual growth |
| **Prevalence (% with diagnosis)** | {Y%} | {Y%} | {Y%} | {Y%} | {Y%} | Based on epidemiology data |
| **Diagnosed Population** | {X × Y%} | {calculation} | {calculation} | {calculation} | {calculation} | Total lives × prevalence |
| **Treatment-Eligible (%)** | {Z%} | {Z%} | {Z%} | {Z%} | {Z%} | Clinical eligibility criteria |
| **Eligible Population** | {X × Y% × Z%} | {calculation} | {calculation} | {calculation} | {calculation} | Diagnosed × eligible % |

**Example** (for depression DTx):
- Total Covered Lives: 1,000,000
- Prevalence of MDD: 7% = 70,000
- Treatment-Eligible (moderate-severe, not on adequate treatment): 40% = 28,000
- **Eligible Population**: 28,000 patients

### STEP 2: PROJECT MARKET UPTAKE

**Market Share Assumptions**:

Determine how many eligible patients will use DTx in each year:

| Year | Market Share (% of Eligible) | Patients Using DTx | Rationale |
|------|------------------------------|-------------------|-----------|
| **Year 1** | {X%} | {calculation} | Conservative uptake; payer learning curve |
| **Year 2** | {Y%} | {calculation} | Increased provider awareness; positive outcomes |
| **Year 3** | {Z%} | {calculation} | Steady-state adoption; formulary placement |
| **Year 4** | {A%} | {calculation} | Mature product; competitive landscape |
| **Year 5** | {B%} | {calculation} | Plateau or continued growth |

**Example**:
- Year 1: 5% of 28,000 = 1,400 patients
- Year 2: 15% of 28,000 = 4,200 patients
- Year 3: 25% of 28,000 = 7,000 patients

**Sensitivity Scenarios**:
- **Conservative**: {lower_uptake}
- **Base Case**: {assumptions_above}
- **Optimistic**: {higher_uptake}

### STEP 3: CALCULATE INTERVENTION COSTS

**DTx Costs**:

| Cost Category | Per Patient Cost | Year 1 Patients | Year 1 Total Cost | Year 2 | Year 3 | Year 4 | Year 5 |
|---------------|------------------|-----------------|-------------------|--------|--------|--------|--------|
| **Acquisition Cost** | ${X} | {N patients} | ${X × N} | ${calc} | ${calc} | ${calc} | ${calc} |
| **Implementation (one-time or recurring)** | ${Y} | {N patients} | ${Y × N} | ${calc} | ${calc} | ${calc} | ${calc} |
| **Support Costs** | ${Z} | {N patients} | ${Z × N} | ${calc} | ${calc} | ${calc} | ${calc} |
| **Total DTx Costs** | - | - | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** |

**Standard of Care (SOC) Costs (for patients who would have received SOC)**:

In a budget impact model, we compare the world WITH the DTx vs. the world WITHOUT the DTx.

**"Without DTx" Scenario**:
- Patients receive standard of care
- SOC Cost per Patient: ${X}
- Number of Patients: {N patients who use DTx}
- Total SOC Cost: ${X × N}

**"With DTx" Scenario**:
- Patients receive DTx instead of SOC
- DTx Cost per Patient: ${Y}
- Number of Patients: {N patients}
- Total DTx Cost: ${Y × N}

**Incremental Intervention Cost**:
- Incremental Cost = (DTx Cost - SOC Cost) × N patients
- If DTx is more expensive: Positive incremental cost
- If DTx is less expensive: Negative incremental cost (cost-saving from intervention alone)

### STEP 4: CALCULATE MEDICAL COST OFFSETS

**Medical Cost Savings from Reduced Healthcare Utilization**:

Based on clinical evidence, the DTx reduces hospitalizations, ER visits, etc. Calculate the cost savings:

**Cost Offset Table**:

| Cost Offset Category | Baseline Utilization (per patient per year) | Reduced Utilization (DTx patients) | Reduction | Cost per Event | Annual Savings per Patient | Year 1 Savings | Year 2 | Year 3 |
|----------------------|---------------------------------------------|-------------------------------------|-----------|----------------|---------------------------|----------------|--------|--------|
| **Hospitalizations** | {X admissions} | {Y admissions} | {X-Y} | ${Z} | ${(X-Y) × Z} | ${calc} | ${calc} | ${calc} |
| **ER Visits** | {X visits} | {Y visits} | {X-Y} | ${Z} | ${(X-Y) × Z} | ${calc} | ${calc} | ${calc} |
| **Outpatient Visits** | {X visits} | {Y visits} | {X-Y} | ${Z} | ${(X-Y) × Z} | ${calc} | ${calc} | ${calc} |
| **Medications** | ${X} | ${Y} | ${X-Y} | N/A | ${X-Y} | ${calc} | ${calc} | ${calc} |
| **Total Medical Cost Offsets** | - | - | - | - | **${TOTAL per patient}** | **${TOTAL Year 1}** | **${Year 2}** | **${Year 3}** |

**Example** (Depression DTx):
- Baseline Hospitalizations: 0.15 per patient per year × $15,000 per admission = $2,250/patient/year
- Reduced Hospitalizations (DTx): 0.05 per patient per year × $15,000 = $750/patient/year
- **Savings**: $2,250 - $750 = $1,500/patient/year
- If 1,400 patients in Year 1: $1,500 × 1,400 = **$2.1M savings** from reduced hospitalizations alone

**Total Medical Cost Offsets** (all categories combined):
- Year 1: ${X}
- Year 2: ${Y}
- Year 3: ${Z}

### STEP 5: CALCULATE NET BUDGET IMPACT

**Net Budget Impact Formula**:
**Net Budget Impact = (DTx Costs - SOC Costs) - Medical Cost Offsets**

If Net Budget Impact < 0, the DTx is **cost-saving** (reduces overall budget).
If Net Budget Impact > 0, the DTx has an **incremental cost** (but may still be valuable if cost-effective).

**Budget Impact Table**:

| Budget Category | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 | 5-Year Total |
|-----------------|--------|--------|--------|--------|--------|--------------|
| **Intervention Costs** |
| DTx costs | ${X} | ${Y} | ${Z} | ${A} | ${B} | **${TOTAL}** |
| SOC costs (avoided) | ${-X} | ${-Y} | ${-Z} | ${-A} | ${-B} | **${-TOTAL}** |
| **Net Intervention Cost** | **${DTx - SOC}** | **${calc}** | **${calc}** | **${calc}** | **${calc}** | **${TOTAL}** |
| **Medical Cost Offsets** |
| Hospitalization savings | ${X} | ${Y} | ${Z} | ${A} | ${B} | **${TOTAL}** |
| ER visit savings | ${X} | ${Y} | ${Z} | ${A} | ${B} | **${TOTAL}** |
| Outpatient visit savings | ${X} | ${Y} | ${Z} | ${A} | ${B} | **${TOTAL}** |
| Medication savings | ${X} | ${Y} | ${Z} | ${A} | ${B} | **${TOTAL}** |
| **Total Medical Offsets** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** | **${TOTAL}** |
| **NET BUDGET IMPACT** | **${Net}** | **${Net}** | **${Net}** | **${Net}** | **${Net}** | **${5-Year Net}** |

**Interpretation**:
- **Positive Net Budget Impact**: Incremental cost to payer (DTx costs exceed offsets)
  - Example: +$5M over 3 years
- **Negative Net Budget Impact**: Cost-saving to payer (offsets exceed DTx costs)
  - Example: -$2M over 3 years (payer saves $2M)

### STEP 6: CALCULATE PER-MEMBER-PER-MONTH (PMPM) IMPACT

**PMPM Calculation**:
PMPM = (Annual Net Budget Impact) / (Total Covered Lives × 12 months)

**PMPM Table**:

| Year | Net Budget Impact | Total Covered Lives | PMPM Impact |
|------|-------------------|---------------------|-------------|
| **Year 1** | ${X} | {Y} | ${X / (Y × 12)} = **${PMPM}** |
| **Year 2** | ${X} | {Y} | ${X / (Y × 12)} = **${PMPM}** |
| **Year 3** | ${X} | {Y} | ${X / (Y × 12)} = **${PMPM}** |

**Benchmark**:
- **<$0.50 PMPM**: Low budget impact (highly affordable)
- **$0.50-1.00 PMPM**: Moderate budget impact (acceptable for most payers)
- **$1.00-2.00 PMPM**: Higher budget impact (requires strong value justification)
- **>$2.00 PMPM**: Very high budget impact (significant payer concern)

**Example**:
- Net Budget Impact Year 1: $3M
- Covered Lives: 1,000,000
- PMPM: $3M / (1M × 12) = **$0.25 PMPM**
- **Interpretation**: Low budget impact; highly affordable

### STEP 7: SCENARIO ANALYSIS

Create **Best Case**, **Base Case**, and **Worst Case** scenarios:

**Key Scenario Variables**:
- Market Share (uptake rate)
- Cost Offsets (% reduction in utilization)
- DTx Persistence (% of patients who complete and maintain benefit)
- Implementation Costs

**Scenario Table**:

| Scenario | Market Share (Year 3) | Hospitalization Reduction | Net Budget Impact (3-Year) | PMPM (Year 3) |
|----------|----------------------|---------------------------|----------------------------|---------------|
| **Worst Case** | {conservative} | {lower_reduction} | ${higher_cost_or_lower_savings} | ${higher_pmpm} |
| **Base Case** | {assumptions_above} | {expected_reduction} | ${net_impact} | ${pmpm} |
| **Best Case** | {optimistic} | {higher_reduction} | ${greater_savings} | ${lower_pmpm} |

**Example**:
- Worst Case: 15% market share, 20% hospitalization reduction → +$8M (3-year), $0.45 PMPM
- Base Case: 25% market share, 40% hospitalization reduction → +$5M (3-year), $0.28 PMPM
- Best Case: 35% market share, 60% hospitalization reduction → -$2M (3-year, cost-saving), -$0.11 PMPM

### STEP 8: RETURN ON INVESTMENT (ROI)

Calculate ROI from the payer's perspective:

**ROI Formula**:
ROI = (Medical Cost Savings - DTx Investment) / DTx Investment

**ROI Table**:

| Year | DTx Investment | Medical Cost Savings | Net Savings / (Cost) | ROI |
|------|----------------|----------------------|----------------------|-----|
| **Year 1** | ${X} | ${Y} | ${Y - X} | {(Y-X)/X × 100%} |
| **Year 2** | ${X} | ${Y} | ${Y - X} | {(Y-X)/X × 100%} |
| **Year 3** | ${X} | ${Y} | ${Y - X} | {(Y-X)/X × 100%} |
| **Cumulative 3-Year** | ${TOTAL} | ${TOTAL} | **${TOTAL}** | **{%}** |

**ROI Interpretation**:
- **ROI > 100%**: For every $1 spent on DTx, payer saves >$1 in medical costs
- **ROI = 0%**: Break-even (DTx cost = medical savings)
- **ROI < 0%**: Net cost (DTx cost exceeds savings, but may still be cost-effective per QALY)

**Example**:
- 3-Year DTx Investment: $15M
- 3-Year Medical Savings: $20M
- **Net Savings**: $5M
- **ROI**: ($5M / $15M) × 100% = **33% ROI** (or 1.33:1 return)

### STEP 9: VALIDATION & QUALITY CHECK

**Validation Checklist**:
- [ ] Eligible population calculation verified (prevalence × eligibility)
- [ ] Market share assumptions realistic (validated with market research)
- [ ] Cost inputs verified (match sources)
- [ ] Medical cost offsets align with clinical evidence
- [ ] PMPM impact is within reasonable range (<$2 PMPM for most payers)
- [ ] Scenario analyses cover plausible range
- [ ] ROI calculation is correct

**P24_FINANCE Review**:
- Validate all cost assumptions
- Verify calculation logic
- Assess realism of cost offsets

**P22_MADIRECT Review**:
- Confirm alignment with payer expectations
- Assess whether BIM supports contracting strategy
- Identify any potential payer objections

---

**OUTPUT FORMAT**:
- **Budget Impact Model** (Excel file)
  - Input Parameters Sheet
  - Market Uptake Projections
  - Cost Calculations
  - Net Budget Impact Table
  - PMPM Calculations
  - Scenario Analyses
  - Graphs (Net Budget Impact over time, PMPM impact)

- **BIM Summary** (1-2 pages)
  - Executive summary of budget impact
  - Key assumptions
  - Results table
  - Scenario analysis
  - PMPM impact

**DELIVERABLE**: Completed Budget Impact Model with 3-5 Year Projections

```

**Expected Output**:
- Complete BIM model (Excel file)
- 3-5 year budget impact projections
- PMPM impact calculated
- Scenario analyses (best, base, worst case)
- ROI calculations

**Quality Check**:
- [ ] Eligible population calculations verified
- [ ] Market share assumptions documented
- [ ] All costs validated
- [ ] PMPM impact reasonable (<$2 PMPM preferred)
- [ ] Scenario analyses completed

**Deliverable**: Budget Impact Model (Excel file)

---

### PHASE 4: SENSITIVITY ANALYSIS (2-3 hours)

---

#### **STEP 4: Conduct Sensitivity Analyses** (120-180 minutes)

**Objective**: Test the robustness of the health economics model by varying key assumptions and parameters.

**Persona**: P21_HEOR (Lead), P25_BIOSTAT (Probabilistic sensitivity analysis support)

**Prerequisites**:
- CEA model completed (Step 2)
- BIM completed (Step 3)
- Key uncertain parameters identified

**Process**:

1. **Identify Key Drivers** (30 minutes)
   - Review model inputs
   - Determine which parameters have highest uncertainty
   - Prioritize parameters for sensitivity analysis

2. **Execute One-Way Sensitivity Analysis** (45 minutes)
   - Vary each parameter individually
   - Generate tornado diagram
   - Identify top 5-10 drivers

3. **Execute Scenario Analysis** (30 minutes)
   - Best case, base case, worst case scenarios
   - Clinical vs. economic assumptions

4. **Execute Probabilistic Sensitivity Analysis (PSA)** (60 minutes)
   - Assign probability distributions to key parameters
   - Run Monte Carlo simulation (1,000-10,000 iterations)
   - Generate cost-effectiveness acceptability curve (CEAC)

5. **Review and Document** (15 minutes)
   - Summarize sensitivity analysis findings
   - Identify key uncertainties
   - Document implications for payers

---

**PROMPT 4.1: Comprehensive Sensitivity Analysis**

```markdown
**ROLE**: You are P21_HEOR, a Health Economics Analyst conducting sensitivity analyses to assess the robustness of your cost-effectiveness and budget impact models.

**TASK**: Perform comprehensive sensitivity analyses including one-way, scenario, and probabilistic sensitivity analyses (PSA) to identify key drivers of model results and quantify uncertainty.

**INPUT**:

**Base Case Model Results** (from Steps 2-3):
- **ICER**: ${X} per QALY gained
- **Net Budget Impact (3-year)**: ${Y}
- **PMPM Impact (Year 3)**: ${Z}

**Key Model Parameters with Uncertainty**:

| Parameter | Base Case Value | Lower Bound | Upper Bound | Distribution (for PSA) | Rationale for Range |
|-----------|-----------------|-------------|-------------|------------------------|---------------------|
| **Clinical Parameters** |
| Treatment effect (DTx) | {X%} | {lower} | {upper} | {normal / beta} | 95% CI from trial |
| Treatment effect (comparator) | {Y%} | {lower} | {upper} | {normal / beta} | 95% CI from literature |
| Relapse rate (DTx) | {X% per year} | {lower} | {upper} | {beta} | Expert opinion range |
| Relapse rate (comparator) | {Y% per year} | {lower} | {upper} | {beta} | Literature range |
| Patient engagement | {X%} | {lower} | {upper} | {beta} | Trial vs. RWE |
| **Cost Parameters** |
| DTx cost | ${X} | ${lower} | ${upper} | {fixed / uniform} | Pricing scenarios |
| Hospitalization cost | ${Y} | ${lower} | ${upper} | {gamma} | HCUP range |
| ER visit cost | ${Z} | ${lower} | ${upper} | {gamma} | Medicare range |
| **Utility Parameters** |
| Utility (on-treatment) | {0.XX} | {lower} | {upper} | {beta} | 95% CI |
| Utility (off-treatment) | {0.XX} | {lower} | {upper} | {beta} | Literature range |
| **Economic Assumptions** |
| Discount rate | {3%} | {0%} | {5%} | {fixed} | ISPOR guideline range |
| Time horizon | {X years} | {lower} | {upper} | {fixed} | Payer vs. lifetime |

---

**INSTRUCTIONS**:

### PART 1: ONE-WAY SENSITIVITY ANALYSIS (OWSA)

**Objective**: Vary one parameter at a time to determine which parameters have the greatest impact on model results.

**Method**:
1. For each parameter in the table above:
   - Hold all other parameters at base case values
   - Vary the parameter from lower bound to upper bound
   - Recalculate ICER (for CEA) or Net Budget Impact (for BIM)
   - Record the range of results

2. Calculate the **"swing"** for each parameter:
   - Swing = |Result at Upper Bound - Result at Lower Bound|
   - Larger swing = more influential parameter

**One-Way Sensitivity Analysis Table (CEA)**:

| Parameter | Base Case Value | Lower Bound | Result (ICER) at Lower | Upper Bound | Result (ICER) at Upper | Swing | Rank |
|-----------|-----------------|-------------|------------------------|-------------|------------------------|-------|------|
| Treatment effect (DTx) | {X%} | {lower} | ${ICER_low} | {upper} | ${ICER_high} | ${swing} | {rank} |
| DTx cost | ${X} | ${lower} | ${ICER_low} | ${upper} | ${ICER_high} | ${swing} | {rank} |
| Hospitalization cost | ${Y} | ${lower} | ${ICER_low} | ${upper} | ${ICER_high} | ${swing} | {rank} |
| Utility (on-treatment) | {0.XX} | {lower} | ${ICER_low} | {upper} | ${ICER_high} | ${swing} | {rank} |
| Relapse rate (DTx) | {X%} | {lower} | ${ICER_low} | {upper} | ${ICER_high} | ${swing} | {rank} |
[... continue for all parameters]

**One-Way Sensitivity Analysis Table (BIM)**:

| Parameter | Base Case Value | Lower Bound | Net Budget Impact at Lower | Upper Bound | Net Budget Impact at Upper | Swing | Rank |
|-----------|-----------------|-------------|----------------------------|-------------|----------------------------|-------|------|
| Market share (Year 3) | {X%} | {lower} | ${NBI_low} | {upper} | ${NBI_high} | ${swing} | {rank} |
| Hospitalization reduction | {X%} | {lower} | ${NBI_low} | {upper} | ${NBI_high} | ${swing} | {rank} |
| Patient engagement | {X%} | {lower} | ${NBI_low} | {upper} | ${NBI_high} | ${swing} | {rank} |
[... continue for all parameters]

**Tornado Diagram**:

Create a tornado diagram showing the top 10 parameters ranked by swing (largest swing at top):

```
                    ICER ($/QALY)
                    
Treatment Effect (DTx)  ▌███████████████████████████████▌
DTx Cost                ▌████████████████████████▌
Hospitalization Cost    ▌██████████████████▌
Utility (On-Treatment)  ▌███████████████▌
Relapse Rate (DTx)      ▌████████████▌
...
                    ├───────┼───────┼───────┼───────┤
                    $50K   $100K  $150K  $200K
                    
                    ◄── Lower Bound    Upper Bound ──►
```

**Key Insights from OWSA**:
- **Top 3 Drivers**: {list_parameters}
  - **Implication**: These parameters have the greatest influence on cost-effectiveness; focus validation efforts here
- **Parameters with Minimal Impact**: {list_parameters}
  - **Implication**: Model is insensitive to these; less concern about uncertainty

### PART 2: SCENARIO ANALYSIS

**Objective**: Explore plausible combinations of assumptions to understand model behavior under different scenarios.

**Scenario Definitions**:

**Scenario 1: Best Case (Optimistic)**
- Assumptions:
  - Treatment effect (DTx): {upper_bound}
  - Relapse rate (DTx): {lower_bound}
  - Patient engagement: {upper_bound}
  - Hospitalization reduction: {upper_bound}
- **Results**:
  - ICER: ${X} per QALY
  - Net Budget Impact (3-year): ${Y}
  - PMPM (Year 3): ${Z}

**Scenario 2: Base Case (Expected)**
- Assumptions: {use_base_case_values}
- **Results**:
  - ICER: ${X} per QALY
  - Net Budget Impact (3-year): ${Y}
  - PMPM (Year 3): ${Z}

**Scenario 3: Worst Case (Conservative)**
- Assumptions:
  - Treatment effect (DTx): {lower_bound}
  - Relapse rate (DTx): {upper_bound}
  - Patient engagement: {lower_bound}
  - Hospitalization reduction: {lower_bound}
- **Results**:
  - ICER: ${X} per QALY
  - Net Budget Impact (3-year): ${Y}
  - PMPM (Year 3): ${Z}

**Scenario Comparison Table**:

| Scenario | ICER ($/QALY) | Cost-Effective at $100K WTP? | Net Budget Impact (3-Yr) | PMPM (Yr 3) | Interpretation |
|----------|---------------|------------------------------|--------------------------|-------------|----------------|
| **Best Case** | ${X} | {YES / NO} | ${Y} | ${Z} | {interpretation} |
| **Base Case** | ${X} | {YES / NO} | ${Y} | ${Z} | {interpretation} |
| **Worst Case** | ${X} | {YES / NO} | ${Y} | ${Z} | {interpretation} |

**Key Insights from Scenario Analysis**:
- **Range of Cost-Effectiveness**: ICER ranges from ${X} to ${Y} per QALY
  - **Implication**: {is_dtx_cost_effective_across_all_scenarios?}
- **Range of Budget Impact**: Net budget impact ranges from ${A} to ${B}
  - **Implication**: {affordability_concerns?}
- **Robustness Assessment**: {is_model_robust_to_scenario_variations?}

**Additional Scenarios** (if relevant):
- **Scenario 4: Real-World Engagement** (lower engagement than trial)
- **Scenario 5: Shorter Time Horizon** (3 years vs. 5 years or lifetime)
- **Scenario 6: Societal Perspective** (include productivity costs)

### PART 3: PROBABILISTIC SENSITIVITY ANALYSIS (PSA)

**Objective**: Simultaneously vary all uncertain parameters according to probability distributions to quantify overall uncertainty and generate cost-effectiveness acceptability curves.

**Method**:
1. Assign probability distributions to all uncertain parameters (see table above)
2. Run Monte Carlo simulation (1,000-10,000 iterations)
3. For each iteration:
   - Randomly sample values for each parameter from its distribution
   - Calculate ICER and/or Net Budget Impact
   - Store results
4. Analyze distribution of results

**Probability Distributions**:

| Parameter Type | Recommended Distribution | Rationale |
|----------------|--------------------------|-----------|
| Probabilities (0-1) | **Beta** distribution | Bounded between 0 and 1; flexible shape |
| Costs | **Gamma** distribution | Right-skewed; non-negative |
| Utilities | **Beta** distribution | Bounded between 0 and 1 |
| Relative risks | **Log-normal** distribution | Non-negative; multiplicative effects |
| Discount rate | **Fixed** (or uniform if varying) | Typically not varied in PSA |

**PSA Results**:

Run 10,000 Monte Carlo iterations and generate:

**1. Cost-Effectiveness Scatter Plot**:
- X-axis: Incremental Effectiveness (ΔQALYs)
- Y-axis: Incremental Cost (Δ$)
- Each point represents one Monte Carlo iteration
- Overlay willingness-to-pay (WTP) threshold lines ($50K, $100K, $150K per QALY)

**Quadrant Distribution**:
- **Southeast (Dominant)**: DTx is more effective and less costly → {X}% of iterations
- **Northeast (Cost-Effective?)**: DTx is more effective and more costly → {Y}% of iterations
  - Of these, {Z}% are below $100K/QALY WTP threshold
- **Northwest (Dominated)**: DTx is less effective and more costly → {W}% of iterations
- **Southwest**: DTx is less effective and less costly → {V}% of iterations

**2. Cost-Effectiveness Acceptability Curve (CEAC)**:
- X-axis: Willingness-to-Pay Threshold ($/QALY) from $0 to $200K
- Y-axis: Probability that DTx is Cost-Effective (0-100%)
- Curve shows: At each WTP threshold, what % of iterations fall below that ICER?

**CEAC Table**:

| WTP Threshold | Probability DTx is Cost-Effective |
|---------------|-----------------------------------|
| $50,000/QALY | {X}% |
| $100,000/QALY | {Y}% |
| $150,000/QALY | {Z}% |

**Example Interpretation**:
- At $100,000/QALY WTP: 85% probability that DTx is cost-effective
- **Implication**: High confidence in cost-effectiveness at typical US threshold

**3. PSA Summary Statistics**:

| Outcome | Mean | Median | 95% Credible Interval | % Cost-Effective at $100K WTP |
|---------|------|--------|----------------------|-------------------------------|
| **ICER ($/QALY)** | ${X} | ${Y} | [${lower}, ${upper}] | {Z}% |
| **Incremental Cost** | ${A} | ${B} | [${lower}, ${upper}] | - |
| **Incremental QALYs** | {C} | {D} | [{lower}, {upper}] | - |

**4. Net Monetary Benefit (NMB) at $100K WTP**:
- NMB = (WTP × ΔQALYs) - ΔCost
- Mean NMB: ${X}
- 95% Credible Interval: [${lower}, ${upper}]
- **Interpretation**: If NMB > 0, DTx is cost-effective at that WTP
  - {X}% of iterations have NMB > 0 at $100K WTP

### PART 4: TWO-WAY SENSITIVITY ANALYSIS (Optional)

**Objective**: Explore the interaction between two key parameters simultaneously.

**Example: DTx Cost vs. Treatment Effect**

Create a 2-D heat map showing ICER across combinations of:
- X-axis: DTx Cost (range: $300 to $600)
- Y-axis: Treatment Effect (range: 30% to 70% response rate)
- Color: ICER value (green = cost-effective, yellow = moderate, red = not cost-effective)

**Key Insight**:
- Identify combinations where DTx remains cost-effective (<$100K/QALY)
- **Implication for pricing**: Maximum DTx price to maintain cost-effectiveness at given efficacy

### PART 5: SENSITIVITY ANALYSIS SUMMARY & IMPLICATIONS

**Key Findings**:
1. **Most Influential Parameters** (from OWSA):
   - {Parameter_1}: {impact_description}
   - {Parameter_2}: {impact_description}
   - {Parameter_3}: {impact_description}

2. **Robustness of Base Case** (from Scenario Analysis):
   - {is_model_robust? / what_scenarios_challenge_cost_effectiveness?}

3. **Overall Uncertainty** (from PSA):
   - {X}% probability DTx is cost-effective at $100K/QALY WTP
   - **Interpretation**: {high / moderate / low confidence in cost-effectiveness}

**Implications for Payers**:
- **Data Needs**: {what_additional_data_would_reduce_uncertainty?}
- **Risk Mitigation**: {should_payers_consider_outcomes_based_contracts?}
- **Monitoring**: {what_real_world_outcomes_should_be_tracked?}

**Implications for Company**:
- **Clinical Development**: {should_additional_studies_be_conducted?}
- **Real-World Evidence**: {what_RWE_studies_would_strengthen_case?}
- **Pricing Strategy**: {is_current_pricing_robust_to_uncertainty?}

---

**OUTPUT FORMAT**:
- **Sensitivity Analysis Report** (5-10 pages)
  - One-way sensitivity analysis (tornado diagram)
  - Scenario analysis (best/base/worst case)
  - Probabilistic sensitivity analysis (CEAC, scatter plot)
  - Key findings and implications

- **Updated Model Files** (Excel/TreeAge)
  - PSA simulation results
  - Sensitivity analysis tabs

**DELIVERABLE**: Comprehensive Sensitivity Analysis Report

```

**Expected Output**:
- One-way sensitivity analysis (tornado diagram)
- Scenario analysis (best, base, worst case)
- Probabilistic sensitivity analysis (CEAC, scatter plot)
- Sensitivity analysis summary report (5-10 pages)

**Quality Check**:
- [ ] Key drivers identified
- [ ] Tornado diagram created
- [ ] Scenario analyses completed
- [ ] PSA run with sufficient iterations (≥1,000)
- [ ] CEAC generated
- [ ] Implications documented

**Deliverable**: Sensitivity Analysis Report

---

### PHASE 5: MODEL VALIDATION (2-3 hours)

---

#### **STEP 5: Conduct Model Validation** (120-180 minutes)

**Objective**: Ensure the health economics model is accurate, transparent, and defensible through internal and external validation.

**Persona**: All personas (P21_HEOR leads, P22-P25 support validation)

**Prerequisites**:
- CEA and BIM models completed
- Sensitivity analyses completed
- All inputs documented

**Process**:

1. **Internal Validation** (60 minutes)
   - Formula verification
   - Input/output checks
   - Extreme value testing
   - Logic verification

2. **External Validation** (45 minutes)
   - Compare to published models
   - Benchmark against similar interventions
   - Face validity with clinical and economic experts

3. **Transparency Check** (30 minutes)
   - ISPOR modeling checklist
   - Documentation completeness
   - Source citations

4. **Document Validation Results** (15 minutes)
   - Summarize validation findings
   - Document any limitations
   - Obtain sign-offs

---

**PROMPT 5.1: Comprehensive Model Validation**

```markdown
**ROLE**: You are P21_HEOR leading a model validation process with support from clinical, finance, and market access experts.

**TASK**: Conduct comprehensive internal and external validation to ensure the health economics model is accurate, transparent, and defensible for payer presentations and HTA submissions.

**INPUT**:

**Model Overview**:
- **Model Type**: {CEA / BIM / Both}
- **Indication**: {indication}
- **Comparator**: {comparator}
- **Base Case Results**:
  - ICER: ${X} per QALY
  - Net Budget Impact (3-year): ${Y}
  - PMPM (Year 3): ${Z}

**Model Files**:
- {Excel_file_name.xlsx}
- {Input_parameters_documented}
- {Sensitivity_analyses_completed}

---

**INSTRUCTIONS**:

### PART 1: INTERNAL VALIDATION

**Objective**: Verify that the model is technically sound, free of errors, and produces consistent results.

**A. Formula Verification**

**Checklist**:
- [ ] All Excel formulas manually verified (no circular references)
- [ ] Cell references correct (no hard-coded values in formulas)
- [ ] Calculations match expected logic (e.g., ICER = ΔCost / ΔQALY)
- [ ] Discounting applied correctly (if multi-year model)
- [ ] Markov trace sums to 100% (if Markov model)
- [ ] Transition probabilities sum to 1.0 for each health state

**Testing Method**:
1. Manually calculate 5-10 key outputs using a calculator
2. Compare to Excel results
3. Document any discrepancies

**Results**:
- [ ] Formula verification complete
- [ ] Discrepancies found: {YES / NO}
  - If YES, describe: {discrepancy_description}
  - Resolution: {how_fixed}

**B. Input/Output Consistency**

**Test 1: Extreme Values**
- Set all effectiveness parameters to 0% → ICER should be infinite or undefined
- Set DTx cost to $0 → ICER should be negative (cost-saving)
- Set all utilities to 0 → QALYs should be 0

**Results**:
- [ ] Extreme value testing complete
- [ ] Model behaves as expected: {YES / NO}
  - If NO, describe issue: {description}

**Test 2: Benchmark Against Base Case**
- Re-run base case → Results should match exactly
- Change one input → Results should change as expected (direction and magnitude)

**Results**:
- [ ] Base case reproducible: {YES / NO}
- [ ] Input changes produce expected output changes: {YES / NO}

**C. Logic Verification**

**Checklist**:
- [ ] Model structure is appropriate for disease and intervention
- [ ] Health states are mutually exclusive and exhaustive (Markov)
- [ ] Transition logic is clinically plausible
- [ ] Cost and utility assignments are appropriate
- [ ] Time horizon is reasonable for payer perspective

**Clinical Plausibility Check** (P23_CLINICAL):
- Are the health states clinically meaningful?
- Are transition probabilities realistic?
- Is the treatment effect modeled appropriately?

**P23_CLINICAL Sign-Off**:
- [ ] Clinical logic validated
- [ ] Comments: {comments_from_clinical_expert}
- [ ] Approved by: {P23_CLINICAL name}

**Economic Plausibility Check** (P24_FINANCE):
- Are cost estimates realistic?
- Are cost offsets supported by evidence?
- Is the budget impact calculation correct?

**P24_FINANCE Sign-Off**:
- [ ] Economic logic validated
- [ ] Comments: {comments_from_finance_expert}
- [ ] Approved by: {P24_FINANCE name}

### PART 2: EXTERNAL VALIDATION

**Objective**: Compare model results to published models and external benchmarks to assess face validity.

**A. Literature Comparison**

**Published Models in Same Disease Area**:

| Published Model | Indication | Comparator | ICER ($/QALY) | Our Model | Difference | Explanation |
|-----------------|------------|------------|---------------|-----------|------------|-------------|
| {Author_Year} | {indication} | {comparator} | ${X} | ${Y} | ${diff} | {why_different?} |
| {Author_Year} | {indication} | {comparator} | ${X} | ${Y} | ${diff} | {why_different?} |
| {Author_Year} | {indication} | {comparator} | ${X} | ${Y} | ${diff} | {why_different?} |

**Key Comparisons**:
1. **ICER Range in Literature**: ${X} to ${Y} per QALY
   - **Our Model**: ${Z} per QALY
   - **Assessment**: {within_range / higher / lower}
   - **Explanation**: {why_our_model_differs}

2. **Utility Values**:
   - **Literature Range**: {0.XX to 0.YY}
   - **Our Model**: {0.ZZ}
   - **Assessment**: {consistent / inconsistent}

3. **Cost Estimates**:
   - **Literature Range**: ${X} to ${Y}
   - **Our Model**: ${Z}
   - **Assessment**: {consistent / inconsistent}

**Conclusion**:
- [ ] Model results are consistent with published literature
- [ ] Any differences are explainable and justified

**B. Benchmark Against Similar Interventions**

**Behavioral Health / DTx Interventions**:

| Intervention | Indication | ICER ($/QALY) | Budget Impact (PMPM) | Comparison to Our Model |
|--------------|------------|---------------|----------------------|-------------------------|
| {Intervention_1} | {indication} | ${X} | ${Y} | {similar / higher / lower} |
| {Intervention_2} | {indication} | ${X} | ${Y} | {similar / higher / lower} |
| {Intervention_3} | {indication} | ${X} | ${Y} | {similar / higher / lower} |

**Key Insights**:
- Our ICER (${X}/QALY) is {comparable_to / higher_than / lower_than} similar DTx interventions
- Our PMPM impact (${Y}) is {acceptable / concerning} compared to benchmarks

**C. Face Validity Review**

**Expert Panel Review**:

Convene a panel of 3-5 experts (clinicians, health economists, payers) to review the model and assess face validity.

**Expert Panel Members**:
1. {P23_CLINICAL}: Clinical expert in {specialty}
2. {P22_MADIRECT}: Market access and payer perspective
3. {P24_FINANCE}: Health economics and finance
4. {External_Expert_1}: {independent_heor_consultant / academic}
5. {External_Expert_2}: {payer_medical_director / pdirector / optional}

**Face Validity Questions**:
1. **Model Structure**: Is the model structure appropriate for this disease and intervention?
   - Expert Consensus: {YES / NO / PARTIALLY}
   - Comments: {comments}

2. **Input Parameters**: Are the input values reasonable and well-sourced?
   - Expert Consensus: {YES / NO / PARTIALLY}
   - Comments: {comments}

3. **Results**: Are the results plausible given the clinical evidence?
   - Expert Consensus: {YES / NO / PARTIALLY}
   - Comments: {comments}

4. **Assumptions**: Are the key assumptions transparent and justifiable?
   - Expert Consensus: {YES / NO / PARTIALLY}
   - Comments: {comments}

**Face Validity Conclusion**:
- [ ] Model passes face validity review
- [ ] Recommended changes: {list_any_recommended_changes}
- [ ] Sign-off: {expert_panel_sign_offs}

### PART 3: TRANSPARENCY & REPORTING CHECKLIST

**ISPOR Good Modeling Practices**:

Use the ISPOR-SMDM Modeling Good Research Practices checklist:

**Checklist**:
- [ ] **Model Conceptualization**
  - [ ] Research question clearly defined
  - [ ] Target population specified
  - [ ] Comparators appropriate and justified
  - [ ] Time horizon appropriate for decision problem
  - [ ] Perspective (payer, societal) clearly stated

- [ ] **Model Structure**
  - [ ] Model structure appropriate for disease and intervention
  - [ ] Health states clinically meaningful
  - [ ] Model diagram provided
  - [ ] Assumptions documented and justified

- [ ] **Input Parameters**
  - [ ] All inputs sourced and referenced
  - [ ] Data quality assessed (high/medium/low)
  - [ ] Uncertainty characterized (ranges, distributions)
  - [ ] Inputs consistent with literature

- [ ] **Model Validation**
  - [ ] Internal validation conducted (formula checks, extreme values)
  - [ ] External validation conducted (comparison to published models)
  - [ ] Face validity assessed by experts
  - [ ] Sensitivity analyses conducted

- [ ] **Reporting**
  - [ ] Methods described in sufficient detail for replication
  - [ ] Results clearly presented (tables, figures)
  - [ ] Limitations acknowledged
  - [ ] Conflicts of interest disclosed (if applicable)

**ISPOR Checklist Compliance**: {X} / {Total} items met

**Gaps / Areas for Improvement**:
- {list_any_gaps}
- {remediation_plan}

### PART 4: VALIDATION DOCUMENTATION

**Validation Report Summary**:

**1. Internal Validation Results**:
- Formula verification: {PASS / FAIL}
- Input/output consistency: {PASS / FAIL}
- Logic verification: {PASS / FAIL}
- **Overall**: {PASS / CONDITIONAL PASS / FAIL}

**2. External Validation Results**:
- Literature comparison: {CONSISTENT / PARTIALLY CONSISTENT / INCONSISTENT}
- Benchmark analysis: {FAVORABLE / ACCEPTABLE / UNFAVORABLE}
- Face validity: {PASS / FAIL}
- **Overall**: {PASS / CONDITIONAL PASS / FAIL}

**3. Transparency & Reporting**:
- ISPOR checklist compliance: {X / Total items}
- Documentation completeness: {COMPLETE / NEEDS IMPROVEMENT}

**4. Key Findings**:
- {finding_1}
- {finding_2}
- {finding_3}

**5. Recommended Actions**:
- {action_1}
- {action_2}
- {action_3}

**6. Model Limitations**:
- {limitation_1}
  - **Impact**: {how_this_affects_model}
  - **Mitigation**: {how_addressed}
- {limitation_2}
  - **Impact**: {how_this_affects_model}
  - **Mitigation**: {how_addressed}

**7. Sign-Offs**:
- **P21_HEOR (Lead Modeler)**: {name} - {date}
- **P23_CLINICAL (Clinical Validation)**: {name} - {date}
- **P24_FINANCE (Cost Validation)**: {name} - {date}
- **P22_MADIRECT (Market Access Approval)**: {name} - {date}
- **External Expert (if applicable)**: {name} - {date}

---

**OUTPUT FORMAT**:
- **Validation Report** (5-10 pages)
  - Executive summary of validation results
  - Internal validation findings
  - External validation findings
  - ISPOR checklist
  - Limitations and caveats
  - Sign-offs

- **Updated Model Documentation**
  - Validation notes in model file
  - Model transparency appendix

**DELIVERABLE**: Model Validation Report with Expert Sign-Offs

```

**Expected Output**:
- Validation report (5-10 pages)
- Internal validation results (formulas, logic verified)
- External validation (comparison to published models)
- Expert panel sign-offs
- ISPOR modeling checklist completed

**Quality Check**:
- [ ] All formulas verified
- [ ] Model logic validated by clinical and finance experts
- [ ] External benchmarking completed
- [ ] Face validity confirmed
- [ ] ISPOR checklist >90% compliance
- [ ] All sign-offs obtained

**Deliverable**: Model Validation Report

---

### PHASE 6: PAYER CUSTOMIZATION (1-2 hours)

---

#### **STEP 6: Customize Model for Specific Payers** (60-120 minutes)

**Objective**: Adapt the health economics model for specific payer populations, benefit designs, and decision criteria.

**Persona**: P21_HEOR (Lead), P22_MADIRECT (Payer intelligence and strategy)

**Prerequisites**:
- Base case model validated
- Target payer profiles documented
- Payer-specific data available (if any)

**Process**:

1. **Identify Target Payers** (15 minutes)
   - Priority commercial payers (e.g., UnitedHealthcare, Anthem)
   - Medicare Advantage plans
   - Medicaid (state-specific)

2. **Gather Payer-Specific Data** (30 minutes)
   - Population demographics
   - Benefit design (co-pays, cost-sharing)
   - Historical utilization patterns

3. **Execute Payer Customization Prompt** (45 minutes)
   - Tailor model assumptions
   - Adjust costs for payer-specific fee schedules
   - Calculate payer-specific budget impact

4. **Create Payer-Specific Deliverables** (30 minutes)
   - Customized HEOR slides
   - One-page economic summary
   - Scenario analyses for payer

---

**PROMPT 6.1: Payer-Specific Model Customization**

```markdown
**ROLE**: You are P21_HEOR working with P22_MADIRECT to customize the health economics model for a specific target payer.

**TASK**: Adapt the base case model to reflect the specific population, benefit design, and cost structure of the target payer, and generate payer-specific outputs for presentations and negotiations.

**INPUT**:

**Target Payer Profile**:
- **Payer Name**: {payer_name} (e.g., UnitedHealthcare, Aetna, Medicare Advantage Plan X)
- **Payer Type**: {commercial / medicare_advantage / medicaid / integrated_delivery_network}
- **Covered Lives**: {X million}
- **Geographic Coverage**: {national / regional / state-specific}
- **Market Position**: {top_5_national / regional_dominant / niche_player}

**Payer Population Characteristics**:
- **Age Distribution**: {age_breakdown} (e.g., 18-34: 20%, 35-54: 40%, 55-64: 25%, 65+: 15%)
- **Disease Prevalence**: {X% of covered lives have target indication}
- **Treatment Patterns**: {what_are_current_treatment_rates?}
- **Engagement with Digital Health**: {payer_history_with_dtx / telehealth}

**Payer Benefit Design**:
- **Pharmacy Benefit**: {formulary_structure / cost_sharing}
- **Medical Benefit**: {co_pays / deductibles}
- **Behavioral Health Benefit**: {carved_out / integrated / coverage_limits}
- **Prior Authorization**: {required / not_required for relevant treatments}

**Payer Cost Structure**:
- **Reimbursement Rates**:
  - Hospitalizations: {$X per admission} (vs. Medicare: {$Y})
  - ER Visits: {$X per visit}
  - Outpatient Visits: {$X per visit}
  - Medications: {WAC / AWP / negotiated_rate}
- **Cost-Sharing**: {patient_out_of_pocket_vs_payer_payment}

**Payer Decision Criteria** (from P22_MADIRECT intelligence):
- **Key Metrics**: {ICER / budget_impact / PMPM / ROI}
- **Budget Impact Threshold**: {payer_concern_if_pmpm_exceeds_X}
- **Cost-Effectiveness Threshold**: {payer_wtp_threshold if_known}
- **Evidence Requirements**: {RCT / RWE / both}
- **Contract Preferences**: {FFS / outcomes_based / hybrid}

**Base Case Model Results** (from Steps 2-3):
- ICER: ${X} per QALY
- Net Budget Impact (3-year): ${Y}
- PMPM (Year 3): ${Z}

---

**INSTRUCTIONS**:

### STEP 1: ADJUST POPULATION ASSUMPTIONS

**Payer-Specific Eligible Population**:

| Population Segment | Base Model | Payer-Specific | Adjustment Rationale |
|--------------------|------------|----------------|----------------------|
| **Covered Lives** | {X} | {Y} | Payer's actual plan size |
| **Disease Prevalence** | {A%} | {B%} | Payer-specific data (if available) or adjusted for age/demographics |
| **Treatment-Eligible** | {C%} | {D%} | Payer's prior authorization criteria, coverage policies |
| **Eligible Population** | {N} | {M} | Calculation: Lives × Prevalence × Eligible % |

**Example**:
- Base Model: 1,000,000 lives × 7% prevalence × 40% eligible = 28,000
- Payer-Specific (Medicare Advantage, older population): 500,000 lives × 9% prevalence × 50% eligible = 22,500

### STEP 2: ADJUST COST INPUTS

**Payer-Specific Cost Table**:

| Cost Category | Base Model (National Average) | Payer-Specific Cost | Source | Adjustment Rationale |
|---------------|-------------------------------|---------------------|--------|----------------------|
| **Hospitalization** | ${X} | ${Y} | {payer_fee_schedule / claims_data} | Payer-specific DRG rates |
| **ER Visit** | ${X} | ${Y} | {payer_reimbursement} | Payer contracts with hospitals |
| **Outpatient Visit** | ${X} | ${Y} | {payer_fee_schedule} | Payer physician contracts |
| **Medications** | ${X} | ${Y} | {payer_formulary_rebates} | Payer-negotiated drug prices |
| **DTx Cost** | ${X} | ${Y} | {negotiated_price_if_different} | Potential payer-specific pricing |

**Adjustment Method**:
- If payer-specific data available: Use actual costs
- If not available: Adjust based on payer type:
  - **Commercial**: Use national average or +10-20% (higher reimbursement than Medicare)
  - **Medicare Advantage**: Use Medicare fee schedules
  - **Medicaid**: Use Medicaid rates (typically 70-80% of Medicare)

### STEP 3: ADJUST CLINICAL ASSUMPTIONS

**Payer Population Clinical Profile**:

| Clinical Parameter | Base Model | Payer-Specific | Adjustment Rationale |
|--------------------|------------|----------------|----------------------|
| **Baseline Disease Severity** | {moderate} | {moderate_to_severe} | Medicare pop may be older, sicker |
| **Comorbidity Burden** | {average} | {higher} | Older population, more comorbidities |
| **Treatment Effect** | {X%} | {Y%} | Adjust if payer pop differs significantly |
| **Baseline Healthcare Utilization** | {X hospitalizations/year} | {Y hospitalizations/year} | Payer-specific utilization data |

**Note**: Only adjust if there is strong evidence that the payer population differs materially from the trial population. Otherwise, maintain base case assumptions.

### STEP 4: RECALCULATE PAYER-SPECIFIC RESULTS

**Cost-Effectiveness Analysis (Payer-Specific)**:

| Outcome | Base Model | Payer-Specific Model | Change |
|---------|------------|----------------------|--------|
| **Total Costs (DTx)** | ${X} | ${Y} | {+/- $Z} |
| **Total Costs (Comparator)** | ${A} | ${B} | {+/- $C} |
| **Incremental Cost (ΔC)** | ${ΔC_base} | ${ΔC_payer} | {+/- $D} |
| **Total QALYs (DTx)** | {X.XX} | {Y.YY} | {+/- Z.ZZ} |
| **Total QALYs (Comparator)** | {A.AA} | {B.BB} | {+/- C.CC} |
| **Incremental QALYs (ΔE)** | {ΔE_base} | {ΔE_payer} | {+/- D.DD} |
| **ICER ($/QALY)** | **${ICER_base}** | **${ICER_payer}** | **{+/- $E}** |

**Interpretation**:
- If ICER_payer < ICER_base: More cost-effective for this payer
- If ICER_payer > ICER_base: Less cost-effective (but still may be acceptable)

**Budget Impact Model (Payer-Specific)**:

| Year | Base Model Net Budget Impact | Payer-Specific Net Budget Impact | Change | PMPM (Payer-Specific) |
|------|------------------------------|----------------------------------|--------|------------------------|
| **Year 1** | ${X} | ${Y} | {+/- $Z} | ${PMPM} |
| **Year 2** | ${X} | ${Y} | {+/- $Z} | ${PMPM} |
| **Year 3** | ${X} | ${Y} | {+/- $Z} | ${PMPM} |
| **3-Year Total** | **${TOTAL_base}** | **${TOTAL_payer}** | **{+/- $Z}** | - |

**Interpretation**:
- PMPM Impact for this payer: ${X} per member per month
  - **Assessment**: {low / acceptable / high}
- Net Budget Impact (3-year): ${Y}
  - **Assessment**: {cost_saving / minimal_cost / affordable / concern}

### STEP 5: PAYER-SPECIFIC SCENARIO ANALYSIS

**Scenarios Tailored to Payer Concerns**:

**Scenario 1: Lower Engagement in Payer Population**
- Assumption: Real-world engagement is {X}% vs. {Y}% in trial
- **Results**:
  - ICER: ${Z} per QALY
  - Net Budget Impact: ${W}
  - **Interpretation**: {still_cost_effective? / budget_impact_acceptable?}

**Scenario 2: Payer-Specific Market Share**
- Assumption: Market share in Year 3 is {X}% (payer's projected uptake)
- **Results**:
  - Net Budget Impact: ${Y}
  - PMPM: ${Z}

**Scenario 3: Outcomes-Based Contract**
- Assumption: Payer pays full price if outcomes achieved, reduced price if not
- **Structure**:
  - Performance Metric: {e.g., 50% response rate}
  - Full Price if Met: ${X}
  - Reduced Price if Not Met: ${Y} ({Z}% refund)
- **Expected Budget Impact** (risk-adjusted): ${W}

### STEP 6: PAYER-SPECIFIC DELIVERABLES

**A. One-Page Economic Summary (Payer-Specific)**

Create a one-page summary tailored for this payer:

**[PAYER NAME] Economic Value Summary**

**Clinical Value**:
- {2-3 sentence summary of clinical benefit}

**Economic Value**:
- **Cost-Effectiveness**: ${ICER} per QALY gained ({well_below / within / exceeds} {payer_name}'s cost-effectiveness threshold)
- **Budget Impact**: ${X} net budget impact over 3 years (${PMPM} per member per month)
- **ROI**: {X}:1 return on investment ({payer_name} saves ${Y} for every ${Z} invested in DTx)

**Cost Offsets**:
- Hospitalization reduction: {X}% → ${Y} savings
- ER visit reduction: {X}% → ${Y} savings
- Total Annual Savings: ${Z} per patient

**Key Assumptions**:
- {assumption_1}
- {assumption_2}
- {assumption_3}

**Recommended Next Steps**:
- {action_1} (e.g., "Pilot program with 500 patients in Q1 2026")
- {action_2} (e.g., "Outcomes-based contract with performance guarantees")

**B. Payer-Specific Presentation Slides** (10-15 slides)

Create a slide deck customized for this payer:

**Slide 1**: Executive Summary
- Clinical and economic value headline
- Payer-specific budget impact

**Slide 2-3**: Clinical Evidence
- Trial results
- Real-world evidence (if available)
- Safety profile

**Slide 4-5**: Economic Value (Payer-Specific)
- Cost-effectiveness (ICER)
- Budget impact (PMPM)
- ROI

**Slide 6-7**: Payer Population Analysis
- Eligible population in {payer_name}
- Market uptake assumptions
- Patient journey

**Slide 8**: Cost Offsets & Medical Savings
- Breakdown of savings by category
- Timeline to realize savings

**Slide 9**: Sensitivity & Scenario Analyses
- Key drivers
- Best/base/worst case scenarios

**Slide 10**: Competitive Positioning
- How DTx compares to current treatments
- Value proposition vs. SOC

**Slide 11**: Implementation Plan
- Integration with payer systems
- Provider engagement
- Patient support

**Slide 12**: Contract Options
- Fee-for-service
- Outcomes-based contracting
- Hybrid models

**Slide 13**: Next Steps
- Pilot program proposal
- Timeline
- Success metrics

**C. Interactive ROI Calculator (Optional)**

Create a simple Excel-based calculator that allows the payer to input their own assumptions and see real-time budget impact:

**Inputs**:
- Plan size (covered lives)
- Market share assumptions (Year 1-3)
- DTx price
- Cost offset assumptions (hospitalization reduction %)

**Outputs**:
- Net budget impact (3-year)
- PMPM impact
- ROI

### STEP 7: DOCUMENT PAYER CUSTOMIZATION

**Payer Customization Summary**:

**Payer**: {payer_name}
**Date**: {date}
**Customization Lead**: {P21_HEOR}, {P22_MADIRECT}

**Key Adjustments**:
1. {adjustment_1} (e.g., "Population size: 500K covered lives vs. 1M in base model")
2. {adjustment_2} (e.g., "Hospitalization cost: $18,000 vs. $15,000 national average")
3. {adjustment_3} (e.g., "Medicare Advantage population: higher baseline disease severity")

**Payer-Specific Results**:
- ICER: ${X} per QALY (vs. ${Y} base model)
- Net Budget Impact (3-year): ${A} (vs. ${B} base model)
- PMPM (Year 3): ${C} (vs. ${D} base model)

**Payer-Specific Recommendations**:
- {recommendation_1}
- {recommendation_2}
- {recommendation_3}

**Deliverables Created**:
- [ ] One-page economic summary
- [ ] Payer-specific presentation (15 slides)
- [ ] Scenario analyses tailored to payer concerns
- [ ] Interactive ROI calculator (if requested)

---

**OUTPUT FORMAT**:
- **Payer-Specific Model** (Excel file with adjustments documented)
- **One-Page Economic Summary** (PDF)
- **Payer Presentation** (PPT, 10-15 slides)
- **Payer Customization Report** (2-3 pages documenting adjustments)

**DELIVERABLE**: Payer-Specific HEOR Package (model, summary, slides)

```

**Expected Output**:
- Payer-specific model with adjusted assumptions
- One-page economic value summary (payer-specific)
- Payer presentation slides (10-15 slides)
- Payer customization report (2-3 pages)

**Quality Check**:
- [ ] Population assumptions adjusted for payer
- [ ] Cost inputs reflect payer-specific reimbursement
- [ ] Results recalculated for payer
- [ ] Deliverables tailored to payer decision criteria
- [ ] P22_MADIRECT review and approval

**Deliverable**: Payer-Specific HEOR Package

---

### PHASE 7: VALUE NARRATIVE DEVELOPMENT (1-2 hours)

---

#### **STEP 7: Translate HEOR to Compelling Value Messages** (60-120 minutes)

**Objective**: Convert technical health economics outputs into compelling, payer-friendly value narratives for P&T presentations, contracting negotiations, and marketing materials.

**Persona**: P22_MADIRECT (Lead), P21_HEOR (Support - technical accuracy)

**Prerequisites**:
- CEA and BIM completed and validated
- Sensitivity analyses completed
- Payer customization (if applicable) completed

**Process**:

1. **Identify Key Value Messages** (20 minutes)
   - Extract 3-5 core value pillars from HEOR
   - Prioritize messages for payer audiences

2. **Execute Value Narrative Prompt** (45 minutes)
   - Develop clinical value narrative
   - Develop economic value narrative
   - Integrate into cohesive value story

3. **Create Supporting Materials** (30 minutes)
   - Value summary slides
   - Leave-behind one-pager
   - FAQ on health economics

4. **Review and Finalize** (15 minutes)
   - P21_HEOR verifies technical accuracy
   - P22_MADIRECT approves messaging

---

**PROMPT 7.1: Health Economics Value Narrative Development**

```markdown
**ROLE**: You are P22_MADIRECT, a Market Access Director with deep expertise in translating health economics evidence into compelling value narratives for payer audiences.

**TASK**: Transform the technical health economics model outputs into clear, concise, and compelling value messages that resonate with P&T committees, medical directors, and payer decision-makers.

**INPUT**:

**HEOR Model Results Summary**:
- **Cost-Effectiveness**:
  - ICER: ${X} per QALY gained
  - Interpretation: {well_below / within / exceeds} typical US cost-effectiveness threshold ($100K-150K/QALY)
  - Probability cost-effective at $100K WTP: {Y}%

- **Budget Impact**:
  - Net Budget Impact (3-year): ${A} ({cost_saving / incremental_cost})
  - PMPM Impact (Year 3): ${B}
  - ROI: {C}:1 ({payer_saves_$X_for_every_$1_invested})

- **Cost Offsets**:
  - Hospitalization reduction: {X}% → ${Y} savings per patient per year
  - ER visit reduction: {X}% → ${Y} savings per patient per year
  - Total Annual Medical Savings: ${Z} per patient

**Clinical Evidence Summary**:
- **Primary Outcome**: {outcome} with {X% improvement} vs. standard of care
- **Key Secondary Outcomes**: {list_3_5_key_outcomes}
- **Safety Profile**: {summary}
- **Patient-Reported Outcomes**: {summary}

**Product Profile**:
- **DTx Product**: {name}
- **Indication**: {indication}
- **Target Population**: {patient_demographics}
- **Treatment Duration**: {typical_course}
- **Pricing**: {$X per episode / per month}

**Target Audience**:
- **Primary**: {us_commercial_payers / medicare / medicaid}
- **Decision-Makers**: {P&T_committees / medical_directors / CFOs}
- **Key Concerns**: {budget_impact / clinical_efficacy / patient_access}

---

**INSTRUCTIONS**:

### PART 1: CORE VALUE PILLARS

Identify 3-5 core value pillars that form the foundation of the value narrative.

**Value Pillar Framework**:

**Pillar 1: Clinical Effectiveness**
- **Message**: {concise_clinical_value_statement}
- **Supporting Evidence**: {key_clinical_data_points}
- **Payer Relevance**: {why_this_matters_to_payers}

**Example**:
- **Message**: "Reduces depression symptoms by 45% vs. 25% for standard of care, with durable benefits lasting 12+ months"
- **Supporting Evidence**: RCT (N=500), PHQ-9 reduction: -8.5 vs. -4.2 (p<0.001), remission rate: 40% vs. 20%
- **Payer Relevance**: Sustained clinical improvement reduces relapse and ongoing treatment costs

**Pillar 2: Economic Value**
- **Message**: {concise_economic_value_statement}
- **Supporting Evidence**: {icer / budget_impact / roi}
- **Payer Relevance**: {affordability / cost_effectiveness}

**Example**:
- **Message**: "Highly cost-effective at $75,000 per QALY gained with minimal budget impact ($0.28 PMPM)"
- **Supporting Evidence**: ICER well below $100K WTP threshold; >90% probability cost-effective
- **Payer Relevance**: Strong value for money; affordable at scale

**Pillar 3: Medical Cost Savings**
- **Message**: {concise_cost_offset_statement}
- **Supporting Evidence**: {hospitalization_reduction / er_reduction}
- **Payer Relevance**: {roi / break_even_timeline}

**Example**:
- **Message**: "Reduces hospitalizations by 50% and ER visits by 40%, generating $3,500 in annual medical savings per patient"
- **Supporting Evidence**: Clinical trial utilization data; cost offsets validated in BIM
- **Payer Relevance**: 2.5:1 ROI; payer breaks even within 18 months

**Pillar 4: Patient Access & Equity**
- **Message**: {concise_access_statement}
- **Supporting Evidence**: {scalability / digital_delivery}
- **Payer Relevance**: {improve_access / reduce_disparities}

**Example**:
- **Message**: "Digital delivery overcomes access barriers, reaching underserved populations without geographic or provider capacity constraints"
- **Supporting Evidence**: 24/7 availability; no wait times; available in English and Spanish
- **Payer Relevance**: Expands access to evidence-based treatment for all members

**Pillar 5: Implementation & Integration**
- **Message**: {concise_implementation_statement}
- **Supporting Evidence**: {ease_of_integration / provider_acceptance}
- **Payer Relevance**: {low_burden / scalable}

**Example**:
- **Message**: "Seamless integration with payer systems and EHRs; minimal provider burden; rapid scalability"
- **Supporting Evidence**: FHIR-compatible APIs; single sign-on; <30 day implementation
- **Payer Relevance**: Low administrative lift; can scale to entire member population quickly

### PART 2: INTEGRATED VALUE NARRATIVE

**Executive Summary (Elevator Pitch - 30 seconds)**:

Craft a compelling 2-3 sentence value statement that integrates clinical and economic value:

**Example**:
"[Product] is a clinically proven digital therapeutic that reduces [indication] symptoms by [X]% vs. standard of care, delivering an exceptional value proposition at [$ICER] per QALY gained—well below cost-effectiveness thresholds. With minimal budget impact ([$PMPM] PMPM) and strong medical cost offsets generating [X]:1 ROI, [Product] offers payers a highly cost-effective solution that improves patient outcomes while reducing overall healthcare costs."

**Your Executive Summary**:
{write_compelling_2_3_sentence_value_statement}

---

**Expanded Value Narrative (3-5 minutes)**:

Develop a structured narrative that tells a cohesive value story:

**1. The Problem**:
"[Indication] affects [X]% of your member population, with [Y] patients eligible for treatment. Current treatments face challenges including [access_barriers / high_cost / limited_efficacy / patient_adherence]. This results in [poor_outcomes / high_costs / member_dissatisfaction]."

**Your Problem Statement**:
{write_problem_description}

**2. The Solution**:
"[Product] addresses these challenges by [how_dtx_solves_problem]. Our digital therapeutic delivers [clinical_intervention_description] through [platform], providing members with [key_benefits: convenience / accessibility / personalization / continuous_support]."

**Your Solution Statement**:
{write_solution_description}

**3. The Clinical Evidence**:
"In a rigorous randomized controlled trial of [N] patients, [Product] demonstrated [primary_outcome] with [effect_size] vs. [comparator]. Key results include:
- [Result_1]: [data]
- [Result_2]: [data]
- [Result_3]: [data]
These benefits were sustained at [follow_up_duration], demonstrating durability of effect."

**Your Clinical Evidence Summary**:
{write_clinical_evidence_summary}

**4. The Economic Value**:
"From a health economics perspective, [Product] delivers exceptional value:
- **Cost-Effectiveness**: At [$ICER] per QALY gained, [Product] is [highly_cost_effective / cost_effective] compared to the US willingness-to-pay threshold of $100,000-$150,000 per QALY
- **Budget Impact**: With a modest [$PMPM] per member per month impact, [Product] is highly affordable even at scale
- **Medical Savings**: By reducing [hospitalizations / ER_visits / other_utilization] by [X]%, [Product] generates [$Y] in annual medical cost savings per patient, resulting in a [Z]:1 return on investment"

**Your Economic Value Summary**:
{write_economic_value_summary}

**5. The Call to Action**:
"We believe [Product] represents a compelling opportunity for [Payer_Name] to improve member outcomes, reduce healthcare costs, and demonstrate leadership in digital health innovation. We propose [next_step: pilot_program / formulary_inclusion / contract_negotiation] to bring this evidence-based solution to your members."

**Your Call to Action**:
{write_call_to_action}

---

### PART 3: PAYER-SPECIFIC MESSAGING

Tailor value messages for different payer audiences:

**A. P&T Committee Presentation (Clinical + Economic Focus)**

**Key Messages (3-5)**:
1. **Clinical Efficacy**: {message_emphasizing_evidence_quality}
2. **Cost-Effectiveness**: {message_emphasizing_value_for_money}
3. **Safety Profile**: {message_emphasizing_low_risk}
4. **Patient Access**: {message_emphasizing_improved_access}
5. **Guideline Alignment**: {message_emphasizing_clinical_practice_guidelines}

**Objection Handling**:
- **Objection**: "We're concerned about patient engagement and real-world effectiveness"
  - **Response**: {address_engagement_data / real_world_evidence / offer_performance_guarantees}
- **Objection**: "The budget impact seems high given our member base"
  - **Response**: {explain_pmpm_calculation / offer_phased_rollout / highlight_cost_offsets}

**B. CFO / Finance Team (Budget Impact Focus)**

**Key Messages**:
1. **Affordability**: [$PMPM] PMPM impact—minimal budget impact even at scale
2. **ROI**: [X]:1 return on investment; payer breaks even within [Y] months
3. **Cost Offsets**: [$Z] annual medical savings per patient from reduced utilization
4. **Risk Mitigation**: {offer_outcomes_based_contracting / performance_guarantees}

**C. Medical Director (Clinical Outcomes + Member Experience)**

**Key Messages**:
1. **Evidence-Based**: Proven efficacy in [RCT / real_world_studies]
2. **Member Satisfaction**: {engagement_rates / satisfaction_scores}
3. **Provider Integration**: {seamless_workflows / physician_acceptance}
4. **Quality Metrics**: {hedis / star_ratings_impact}

**D. Contracting Team (Commercial Terms)**

**Key Messages**:
1. **Pricing Flexibility**: {fee_for_service / outcomes_based / hybrid_models}
2. **Performance Guarantees**: {offer_refunds_if_outcomes_not_achieved}
3. **Scalability**: {can_handle_volume / rapid_implementation}
4. **Partnership**: {long_term_collaboration / data_sharing / continuous_improvement}

### PART 4: SUPPORTING MATERIALS

**A. One-Page Value Summary (Leave-Behind)**

Create a visually compelling one-page summary (see template in STEP 6, PART 6B for structure):

**Sections**:
- Product overview (2-3 sentences)
- Clinical value (3-4 bullets with data)
- Economic value (3-4 bullets with ICER, budget impact, ROI)
- Call to action

**B. Health Economics FAQ**

Anticipate and answer common payer questions about the HEOR model:

**Q1**: How was the cost-effectiveness analysis conducted?
**A**: {brief_methodology_description}

**Q2**: What are the key assumptions in the budget impact model?
**A**: {list_3_5_key_assumptions}

**Q3**: How robust are the results to changes in assumptions?
**A**: {sensitivity_analysis_summary}

**Q4**: How does the ICER compare to other treatments for this condition?
**A**: {benchmark_comparison}

**Q5**: When will we see the medical cost savings?
**A**: {timeline_for_cost_offset_realization}

**Q6**: Can we structure an outcomes-based contract?
**A**: {yes / framework_for_performance_based_payment}

**C. Value Message Matrix**

Create a matrix mapping value messages to different stakeholder priorities:

| Stakeholder | Top Priority | Primary Message | Supporting Data | Deliverable |
|-------------|--------------|-----------------|-----------------|-------------|
| **P&T Committee** | Clinical efficacy & safety | {message} | {RCT results} | {CEA slides} |
| **CFO** | Budget impact | {message} | {PMPM, ROI} | {BIM summary} |
| **Medical Director** | Member outcomes | {message} | {PROs, satisfaction} | {clinical summary} |
| **Contracting** | Commercial terms | {message} | {pricing options} | {contract proposal} |

### PART 5: QUALITY CHECK & FINALIZATION

**Checklist**:
- [ ] Value messages are clear and concise (no jargon)
- [ ] Clinical and economic claims are supported by data
- [ ] Messages are tailored to different payer audiences
- [ ] Objection handling responses prepared
- [ ] One-page summary created
- [ ] FAQ developed
- [ ] Value message matrix completed

**P21_HEOR Technical Accuracy Review**:
- [ ] All HEOR claims are accurate
- [ ] ICERs, budget impacts, ROI calculations are correct
- [ ] Citations to model results are accurate
- **Approved by**: {P21_HEOR name} - {date}

**P22_MADIRECT Messaging Approval**:
- [ ] Messages resonate with payer decision criteria
- [ ] Value narrative is compelling and differentiated
- [ ] Call to action is clear
- **Approved by**: {P22_MADIRECT name} - {date}

---

**OUTPUT FORMAT**:
- **Value Narrative Document** (5-8 pages)
  - Executive summary (elevator pitch)
  - Expanded value narrative
  - Payer-specific messaging
  - Objection handling
  - FAQ

- **One-Page Value Summary** (PDF)
- **Value Message Matrix** (Excel)
- **HEOR Presentation Slides** (PPT, 10-15 slides with value narrative integrated)

**DELIVERABLE**: Complete Value Narrative Package

```

**Expected Output**:
- Value narrative document (5-8 pages)
- One-page value summary (leave-behind)
- Health economics FAQ
- Value message matrix
- Updated HEOR presentation with value messaging

**Quality Check**:
- [ ] Core value pillars identified
- [ ] Integrated value narrative developed
- [ ] Messages tailored for different payer audiences
- [ ] Objection handling prepared
- [ ] Technical accuracy verified by P21_HEOR
- [ ] Messaging approved by P22_MADIRECT

**Deliverable**: Value Narrative Package (ready for payer presentations)

---

## 6. COMPLETE PROMPT SUITE

### Master Prompt Index

| Prompt ID | Prompt Name | Phase | Persona | Estimated Time | Complexity |
|-----------|-------------|-------|---------|----------------|------------|
| **1.1** | Model Architecture Development | Phase 1 | P21_HEOR, P22_MADIRECT | 90 min | EXPERT |
| **2.1** | CEA Model Input Population & Calculation | Phase 2 | P21_HEOR, P23_CLINICAL, P24_FINANCE | 180-240 min | EXPERT |
| **3.1** | Budget Impact Model Development | Phase 3 | P21_HEOR, P24_FINANCE | 120-180 min | EXPERT |
| **4.1** | Comprehensive Sensitivity Analysis | Phase 4 | P21_HEOR, P25_BIOSTAT | 120-180 min | EXPERT |
| **5.1** | Comprehensive Model Validation | Phase 5 | All Personas | 120-180 min | EXPERT |
| **6.1** | Payer-Specific Model Customization | Phase 6 | P21_HEOR, P22_MADIRECT | 60-120 min | ADVANCED |
| **7.1** | Health Economics Value Narrative Development | Phase 7 | P22_MADIRECT, P21_HEOR | 60-120 min | ADVANCED |

### Prompt Chaining Strategy

**Sequential Workflow** (recommended for new models):
1. Start with Prompt 1.1 (Model Architecture)
2. Proceed to Prompt 2.1 (CEA Development)
3. Continue to Prompt 3.1 (BIM Development)
4. Execute Prompt 4.1 (Sensitivity Analysis)
5. Perform Prompt 5.1 (Validation)
6. If needed: Prompt 6.1 (Payer Customization)
7. Finish with Prompt 7.1 (Value Narrative)

**Parallel Workflow** (for experienced teams with established models):
- Prompts 2.1 (CEA) and 3.1 (BIM) can be developed in parallel
- Prompt 6.1 (Payer Customization) can be done for multiple payers simultaneously
- Prompt 7.1 (Value Narrative) can begin while validation (5.1) is ongoing

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 Model Quality Standards

**ISPOR Good Modeling Practices Compliance**:
- [ ] Research question clearly defined
- [ ] Model structure appropriate for disease and decision problem
- [ ] All inputs sourced and referenced
- [ ] Model validated (internal and external)
- [ ] Sensitivity analyses conducted
- [ ] Results transparently reported
- [ ] Limitations acknowledged

**Technical Quality Checklist**:
- [ ] All Excel formulas verified (no errors)
- [ ] Calculations match expected logic
- [ ] Discounting applied correctly
- [ ] Model runs without errors
- [ ] Results reproducible

**Clinical Quality Checklist**:
- [ ] Clinical assumptions validated by P23_CLINICAL
- [ ] Health states clinically meaningful
- [ ] Transition probabilities realistic
- [ ] Treatment effects aligned with trial data
- [ ] Safety considerations incorporated

**Economic Quality Checklist**:
- [ ] Cost inputs validated by P24_FINANCE
- [ ] Cost sources clearly documented
- [ ] Cost offsets justified by clinical evidence
- [ ] Budget impact calculations correct
- [ ] PMPM impact calculated accurately

### 7.2 Payer Acceptance Criteria

**What Payers Look For**:
1. **Clinical Rigor**: Is the clinical evidence strong? (RCT, RWE)
2. **Economic Soundness**: Is the HEOR methodology appropriate? (ISPOR guidelines)
3. **Transparency**: Are assumptions clearly stated and justified?
4. **Relevance**: Does the model reflect the payer's population and costs?
5. **Robustness**: Are results stable across sensitivity analyses?
6. **Affordability**: Is the budget impact manageable? (PMPM <$1-2)

**Red Flags That Undermine Credibility**:
- ❌ Unrealistic assumptions (e.g., 80% engagement in real-world)
- ❌ Cherry-picked comparators (e.g., comparing to "no treatment" instead of SOC)
- ❌ Missing cost categories (e.g., implementation costs)
- ❌ No sensitivity analysis
- ❌ ICER far from published benchmarks without explanation
- ❌ Overstated cost offsets without clinical evidence

### 7.3 Continuous Improvement Process

**Post-Launch Model Updates**:
1. **Real-World Evidence Integration** (6-12 months post-launch)
   - Update engagement rates with real-world data
   - Validate cost offsets against claims data
   - Refine relapse/persistence assumptions

2. **Payer Feedback Incorporation** (ongoing)
   - Track payer objections and questions
   - Refine model to address common concerns
   - Update messaging based on what resonates

3. **Publication and Peer Review** (12-18 months post-launch)
   - Submit model to peer-reviewed journal (JMIR, Value in Health)
   - Present at ISPOR, AcademyHealth, or disease-specific conferences
   - Incorporate reviewer feedback into model updates

4. **Model Versioning** (annual)
   - Update cost inputs for inflation
   - Incorporate new clinical evidence
   - Refine based on accumulated real-world data
   - Maintain version control (v1.0, v2.0, etc.)

---

## 8. MODEL VALIDATION CHECKLIST

### 8.1 Internal Validation

**Formula Verification**:
- [ ] All Excel formulas manually spot-checked
- [ ] No circular references
- [ ] Cell references correct (no hard-coded values in formulas)
- [ ] Discounting formulas correct
- [ ] ICER calculation correct: (ΔCost / ΔQALY)

**Logic Verification**:
- [ ] Model structure appropriate for disease
- [ ] Health states mutually exclusive and exhaustive
- [ ] Transition probabilities sum to 1.0
- [ ] Costs and utilities assigned appropriately

**Extreme Value Testing**:
- [ ] Model behavior appropriate when inputs set to extreme values
- [ ] ICER undefined when ΔQALYs = 0 (as expected)
- [ ] Model produces plausible results across input ranges

### 8.2 External Validation

**Literature Comparison**:
- [ ] ICER compared to published models in same disease area
- [ ] Utility values consistent with literature
- [ ] Cost estimates within published ranges
- [ ] Any differences explained and justified

**Expert Review**:
- [ ] Clinical expert (P23_CLINICAL) reviewed and approved clinical assumptions
- [ ] Health economist (P21_HEOR senior or external) reviewed model structure
- [ ] Payer expert (P22_MADIRECT) confirmed alignment with payer decision criteria

**Face Validity**:
- [ ] Results are clinically plausible
- [ ] Cost-effectiveness aligns with intuition given clinical benefit
- [ ] Budget impact is reasonable for payer scale

### 8.3 Transparency & Reporting

**ISPOR Modeling Checklist Compliance**:
- [ ] >90% of ISPOR checklist items met
- [ ] Any gaps documented with justification

**Documentation Completeness**:
- [ ] All inputs sourced and referenced
- [ ] All assumptions documented
- [ ] Model structure diagram provided
- [ ] Validation process documented
- [ ] Limitations acknowledged

**Auditability**:
- [ ] Model can be replicated from documentation
- [ ] Excel file is well-organized with clear labels
- [ ] Input parameters sheet separate from calculations
- [ ] Version control maintained

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Model Architecture Template

**[Model Name] Architecture Document**

**1. Model Overview**
- **Objective**: {what_question_does_model_answer}
- **Target Audience**: {payers / hta_bodies}
- **Modeling Approach**: {CEA / BIM / both}

**2. Model Structure**
- **Model Type**: {decision_tree / markov / des}
- **Time Horizon**: {X years}
- **Perspective**: {payer / societal}
- **Discount Rate**: {3%}
- **Cycle Length** (if Markov): {1 month}

**3. Health States** (if Markov)
- {State_1}: {definition}
- {State_2}: {definition}
- ...

**4. Model Diagram**
- {insert_diagram}

**5. Comparators**
- **Primary**: {comparator_name}
- **Rationale**: {why}

**6. Key Inputs**
- **Clinical**: {list}
- **Costs**: {list}
- **Utilities**: {list}

**7. Key Assumptions**
- {assumption_1}
- {assumption_2}
- ...

**8. Validation Plan**
- {internal_validation_approach}
- {external_validation_approach}

---

### 9.2 Input Parameters Template

**[Model Name] Input Parameters**

| Category | Parameter | Value | Lower Bound | Upper Bound | Source | Quality |
|----------|-----------|-------|-------------|-------------|--------|---------|
| **Clinical** | | | | | | |
| Efficacy | Treatment effect (DTx) | {X%} | {L} | {U} | {RCT} | High |
| Efficacy | Treatment effect (comparator) | {Y%} | {L} | {U} | {literature} | Med |
| ... | | | | | | |
| **Costs** | | | | | | |
| Intervention | DTx cost | ${X} | ${L} | ${U} | {pricing} | High |
| Medical | Hospitalization cost | ${Y} | ${L} | ${U} | {HCUP} | High |
| ... | | | | | | |
| **Utilities** | | | | | | |
| Health State | On-treatment utility | {0.XX} | {L} | {U} | {EQ-5D} | High |
| ... | | | | | | |

---

### 9.3 Results Reporting Template

**[Model Name] Cost-Effectiveness Results**

**Base Case Analysis**:

| Outcome | DTx | Comparator | Incremental (Δ) |
|---------|-----|------------|------------------|
| **Costs** | | | |
| Intervention cost | ${X} | ${Y} | ${X-Y} |
| Medical costs | ${A} | ${B} | ${A-B} |
| Total costs | ${TOTAL_DTx} | ${TOTAL_Comp} | **${ΔC}** |
| **Effectiveness** | | | |
| QALYs | {X.XX} | {Y.YY} | **{ΔE}** |
| **Cost-Effectiveness** | | | |
| ICER ($/QALY) | - | - | **${ICER}** |

**Interpretation**:
- ICER of ${ICER} per QALY is {well_below / within / exceeds} typical US cost-effectiveness threshold ($100K-150K/QALY)
- {X}% probability that DTx is cost-effective at $100K WTP threshold

---

### 9.4 Budget Impact Reporting Template

**[Model Name] Budget Impact Model Results**

**3-Year Budget Impact Projection**:

| Year | Patients Treated | DTx Costs | SOC Costs (Avoided) | Medical Cost Offsets | Net Budget Impact | PMPM |
|------|------------------|-----------|---------------------|----------------------|-------------------|------|
| **Year 1** | {N} | ${X} | ${-Y} | ${Z} | **${Net}** | **${PMPM}** |
| **Year 2** | {N} | ${X} | ${-Y} | ${Z} | **${Net}** | **${PMPM}** |
| **Year 3** | {N} | ${X} | ${-Y} | ${Z} | **${Net}** | **${PMPM}** |
| **3-Year Total** | {N_total} | ${TOTAL} | ${-TOTAL} | ${TOTAL} | **${TOTAL_Net}** | - |

**Return on Investment**:
- Total DTx Investment (3-year): ${X}
- Total Medical Savings (3-year): ${Y}
- **ROI**: {(Y-X)/X × 100%} = **{Z}:1**

---

### 9.5 Sensitivity Analysis Summary Template

**One-Way Sensitivity Analysis (Top 10 Drivers)**:

| Rank | Parameter | Base Case | Range Tested | ICER Range | Swing |
|------|-----------|-----------|--------------|------------|-------|
| 1 | {parameter} | {value} | {low-high} | ${X}-${Y} | ${swing} |
| 2 | {parameter} | {value} | {low-high} | ${X}-${Y} | ${swing} |
| ... | | | | | |

**Scenario Analysis**:

| Scenario | Key Assumptions | ICER ($/QALY) | Net Budget Impact (3-Yr) |
|----------|-----------------|---------------|--------------------------|
| Best Case | {assumptions} | ${X} | ${Y} |
| Base Case | {assumptions} | ${X} | ${Y} |
| Worst Case | {assumptions} | ${X} | ${Y} |

**Probabilistic Sensitivity Analysis**:
- Mean ICER: ${X} per QALY
- 95% Credible Interval: [${L}, ${U}]
- Probability cost-effective at $100K WTP: {Y}%

---

## 10. INTEGRATION WITH OTHER SYSTEMS

### 10.1 Integration with Clinical Development

**Data Flow from Clinical Trials to HEOR**:
- **Clinical Trial Results** (UC_CLIN_005) → Input for CEA clinical effectiveness
- **Patient-Reported Outcomes** (UC_CLIN_004) → Input for QALY calculations (utility values)
- **Safety Data** (UC_PV_013) → Input for adverse event costs and disutilities

**Best Practice**: Embed HEOR considerations into clinical trial design:
- Collect EQ-5D or SF-6D for utility measurement
- Capture healthcare utilization data (hospitalizations, ER visits, medications)
- Plan for long-term follow-up to assess durability of effect

### 10.2 Integration with Market Access Strategy

**HEOR Outputs Support**:
- **Payer Value Dossiers** (UC_MA_001): CEA and BIM are core components
- **Formulary Positioning** (UC_MA_004): ICER and budget impact inform tier placement arguments
- **Pricing Strategy** (UC_MA_003): HEOR models test pricing scenarios vs. cost-effectiveness thresholds
- **Value-Based Contracting** (UC_MA_005): CEA/BIM structure performance guarantees and risk-sharing

### 10.3 Integration with Real-World Evidence

**RWE Feeds Back into HEOR Models**:
- **Post-Launch RWE Studies** → Update engagement rates, persistence, cost offsets
- **Claims Data Analysis** → Validate budget impact assumptions
- **Patient Registry Data** → Refine long-term outcomes projections

**Model Update Cycle**:
- **Year 1**: Launch with base case model (clinical trial data)
- **Year 2**: Incorporate 6-12 month RWE; validate model assumptions
- **Year 3**: Update model with mature RWE; publish updated analysis

### 10.4 Integration with Publications & Medical Affairs

**HEOR Publications Support**:
- **Peer-Reviewed Manuscripts** → CEA and BIM results published in Value in Health, JMIR, disease-specific journals
- **Conference Presentations** → ISPOR, AcademyHealth, disease-specific conferences
- **KOL Engagement** → Share HEOR evidence with key opinion leaders for third-party validation

**Medical Affairs Use Cases**:
- **MSL Presentations** → Use HEOR slides in HCP meetings
- **Payer Medical Director Engagement** → Share HEOR evidence in one-on-one meetings
- **Advisory Boards** → Solicit expert input on model assumptions and validation

---

## 11. REFERENCES & RESOURCES

### 11.1 Key Guidelines & Standards

**ISPOR (International Society for Pharmacoeconomics and Outcomes Research)**:
- ISPOR-SMDM Modeling Good Research Practices Task Force Reports
- Guidelines for Budget Impact Analysis
- Guidelines for Cost-Effectiveness Analysis
- Website: https://www.ispor.org

**NICE (National Institute for Health and Care Excellence) - UK**:
- Guide to the Methods of Technology Appraisal (2013)
- Digital Health Technologies Evidence Standards Framework
- Website: https://www.nice.org.uk

**ICER (Institute for Clinical and Economic Review) - US**:
- Value Assessment Framework (2020-2023)
- Methods for Determining Prices of High-Value Care
- Website: https://icer.org

**CADTH (Canadian Agency for Drugs and Technologies in Health)**:
- Guidelines for the Economic Evaluation of Health Technologies
- Website: https://www.cadth.ca

**AMCP (Academy of Managed Care Pharmacy) - US**:
- Format for Formulary Submissions (Version 4.1, 2019)
- Website: https://www.amcp.org

### 11.2 Data Sources for Model Inputs

**Clinical Data**:
- PubMed / MEDLINE: Published clinical trials and meta-analyses
- ClinicalTrials.gov: Trial registry with results database
- Cochrane Library: Systematic reviews and meta-analyses

**Cost Data**:
- **US Healthcare Costs**:
  - Healthcare Cost and Utilization Project (HCUP): Hospitalization costs
  - Medicare Physician Fee Schedule: Physician visit costs
  - Red Book (Truven/IBM Watson Health): Drug wholesale acquisition costs (WAC)
  - MarketScan (Truven/IBM Watson Health): Commercial claims data
- **International Costs**:
  - OECD Health Statistics
  - National health system fee schedules (NHS England, etc.)

**Utility Data**:
- EQ-5D Value Sets: Country-specific utility norms
- SF-6D Mapping Algorithms: Convert SF-36 to utilities
- Tufts Cost-Effectiveness Analysis Registry: Published utility values by condition
- Disease-specific utility catalogs (e.g., Sullivan et al. Value in Health)

### 11.3 Modeling Software

**Excel**: Widely used for CEA and BIM; transparent; easy to share
**TreeAge Pro**: Decision tree and Markov modeling software; industry standard for HTA submissions
**R (with packages like `heemod`, `dampack`)**: Open-source; flexible; reproducible
**WinBUGS / OpenBUGS**: Bayesian modeling; used for probabilistic sensitivity analysis
**STATA / SAS**: Statistical software for data analysis and meta-analysis

### 11.4 Training & Certification

**ISPOR Short Courses**:
- Introduction to Cost-Effectiveness Analysis
- Budget Impact Analysis
- Markov Modeling
- Probabilistic Sensitivity Analysis
- Offered at ISPOR conferences (May, November annually)

**University Programs**:
- Master's in Health Economics (various universities)
- Certificate in Health Technology Assessment
- Online courses (Coursera, edX): Health Economics, Decision Modeling

**Professional Societies**:
- ISPOR (International Society for Pharmacoeconomics and Outcomes Research)
- iHEA (International Health Economics Association)
- AcademyHealth (US-focused health services research)

### 11.5 Example Published DTx Health Economics Models

**Depression**:
- Kolovos S, et al. "Cost-effectiveness of internet-based treatment for depression compared with usual care." *BMC Psychiatry* 2016.
- Donker T, et al. "Economic evaluations of internet-based mental health interventions: A systematic review." *World Psychiatry* 2015.

**Insomnia**:
- Thiart H, et al. "Internet-based cognitive behavioral therapy for insomnia: a health economic evaluation." *Sleep* 2016.

**Substance Use Disorder**:
- Ruger JP, et al. "Cost-effectiveness of motivational interviewing for substance use disorders." *Journal of Substance Abuse Treatment* 2012.

**Diabetes**:
- Greenwood DA, et al. "Cost-effectiveness of diabetes education among patients with type 2 diabetes." *Diabetes Care* 2017.

### 11.6 Useful Contacts & Networks

**HEOR Consultants**:
- Evidera (PPD)
- ICON plc
- Analysis Group
- IQVIA Real-World Solutions
- Genesis Research (digital health HEOR specialists)

**Academic Centers with DTx HEOR Expertise**:
- Tufts Medical Center Center for the Evaluation of Value and Risk in Health (CEVR)
- USC Schaeffer Center for Health Policy & Economics
- UCSF Philip R. Lee Institute for Health Policy Studies
- Duke-Margolis Center for Health Policy

**Networking**:
- ISPOR Conferences (May in US, November in Europe)
- Digital Health Special Interest Group (SIG) within ISPOR
- AcademyHealth Annual Research Meeting
- Health economics listservs and LinkedIn groups

---

## APPENDIX A: ABBREVIATIONS & GLOSSARY

**AMCP**: Academy of Managed Care Pharmacy - US professional organization; publishes Format for Formulary Submissions

**BIM**: Budget Impact Model - Projects financial impact of new intervention on payer's budget over 3-5 years

**CEA**: Cost-Effectiveness Analysis - Compares costs and outcomes (typically QALYs) of alternative interventions

**CEAC**: Cost-Effectiveness Acceptability Curve - Graph showing probability intervention is cost-effective at various willingness-to-pay thresholds

**DES**: Discrete Event Simulation - Modeling approach where individual patients move through events over time

**DTx**: Digital Therapeutics - Software-based interventions that treat medical conditions

**EQ-5D**: EuroQol 5-Dimension questionnaire - Most commonly used instrument for measuring health-related quality of life (utilities)

**HEOR**: Health Economics and Outcomes Research - Field combining health economics and clinical outcomes research

**HTA**: Health Technology Assessment - Systematic evaluation of properties, effects, and/or impacts of health technologies

**ICER**: Incremental Cost-Effectiveness Ratio - (ΔCost / ΔQALYs); key metric in CEA; typically expressed as cost per QALY gained

**ISPOR**: International Society for Pharmacoeconomics and Outcomes Research - Leading professional society for HEOR

**NMB**: Net Monetary Benefit - (WTP × ΔQALYs) - ΔCost; if NMB > 0, intervention is cost-effective at that WTP

**OWSA**: One-Way Sensitivity Analysis - Vary one parameter at a time to assess impact on results

**PMPM**: Per-Member-Per-Month - Budget impact metric; total cost divided by covered lives divided by 12 months

**PSA**: Probabilistic Sensitivity Analysis - Simultaneously vary multiple parameters according to probability distributions

**QALY**: Quality-Adjusted Life Year - Measure combining length and quality of life; 1 QALY = 1 year in perfect health

**ROI**: Return on Investment - (Medical Savings - DTx Cost) / DTx Cost; expressed as ratio (e.g., 2:1 = $2 saved for every $1 spent)

**SOC**: Standard of Care - Current treatment that patients would receive in the absence of the new intervention

**WTP**: Willingness-to-Pay - Threshold representing maximum amount decision-maker is willing to pay per QALY gained; typically $100K-150K/QALY in US

---

## APPENDIX B: CASE STUDY - CBT-BASED DTx FOR DEPRESSION

**Product Profile**:
- **Product**: MindWell (fictional)
- **Indication**: Major Depressive Disorder (MDD), moderate severity
- **Mechanism**: Cognitive Behavioral Therapy (CBT) modules, mood tracking, behavioral activation
- **Treatment Duration**: 12 weeks
- **Pricing**: $450 per 12-week episode

**Clinical Evidence**:
- RCT (N=500): PHQ-9 reduction: -8.5 (DTx) vs. -4.2 (usual care), p<0.001
- Response rate (≥50% PHQ-9 reduction): 55% vs. 28%
- Remission rate (PHQ-9 <5): 40% vs. 20%
- EQ-5D improvement: 0.15 QALYs gained over 1 year vs. usual care

**HEOR Results**:
- **ICER**: $65,000 per QALY gained (vs. usual care)
- **3-Year Budget Impact**: $4.2M incremental cost for 1M-member plan ($0.35 PMPM)
- **Medical Cost Offsets**: $850/patient/year (hospitalization reduction: 40%)
- **ROI**: 2.1:1 (payer saves $2.10 for every $1 spent on DTx)

**Conclusion**: MindWell demonstrates strong cost-effectiveness, minimal budget impact, and favorable ROI—supporting formulary inclusion and favorable contracting terms.

---

**END OF DOCUMENT**

---

**Document Status**: FINAL v1.0  
**Total Pages**: 147  
**Total Word Count**: ~52,000 words  
**Estimated Reading Time**: 4-5 hours  
**Estimated Completion Time** (following all prompts): 10-14 hours

---

**FEEDBACK & CONTINUOUS IMPROVEMENT**

This use case document is designed to be a living resource. Please provide feedback to improve future versions:

- **What worked well?** {feedback}
- **What could be improved?** {feedback}
- **What additional examples would be helpful?** {feedback}
- **What tools/templates are missing?** {feedback}

**Document Owner**: {P21_HEOR Lead} - {contact_email}  
**Last Reviewed**: October 10, 2025  
**Next Review Date**: April 10, 2026
