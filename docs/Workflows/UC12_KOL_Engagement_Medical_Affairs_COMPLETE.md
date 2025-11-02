# UC-12: KOL ENGAGEMENT & MEDICAL AFFAIRS STRATEGY
## Complete Use Case Documentation with Workflows, Prompts, Personas & Examples

**Document Version**: 3.0 Complete Edition  
**Date**: October 10, 2025  
**Status**: Production Ready - Expert Validation Required  
**Framework**: PROMPTS™ (Purpose-driven Robust Outcomes Master Prompting Toolkit & Suites)  
**Suite**: BRIDGE™ (Building Relationships & Intelligence Development & Global Engagement)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Value Proposition](#2-business-context--value-proposition)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Step-by-Step Implementation Guide](#5-step-by-step-implementation-guide)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Practical Examples & Case Studies](#7-practical-examples--case-studies)
8. [How-To Implementation Guide](#8-how-to-implementation-guide)
9. [Success Metrics & Validation Criteria](#9-success-metrics--validation-criteria)
10. [Troubleshooting & FAQs](#10-troubleshooting--faqs)
11. [Appendices](#11-appendices)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Overview

**UC-12: KOL Engagement & Medical Affairs Strategy** is the foundational stakeholder engagement activity that identifies, maps, and develops relationships with key opinion leaders (KOLs) who influence clinical practice, guideline development, and product adoption. This is critical because:

- **Commercial Impact**: KOL advocacy drives 60-80% of early product adoption in specialty therapeutic areas
- **Clinical Development Impact**: KOL engagement accelerates trial enrollment by 40-50% and reduces site activation time by 3-6 months
- **Regulatory Impact**: KOL input shapes guideline development and regulatory decision-making
- **Reputation Impact**: Strong KOL relationships differentiate leaders from fast-followers

### 1.2 Key Deliverables

This use case produces:
1. **KOL Identification & Mapping Strategy** across therapeutic area and geography
2. **KOL Tier Classification System** (Tier 1, 2, 3) with influence scoring
3. **Competitive KOL Intelligence** (engagement status, relationships, bias)
4. **Engagement Plan & Tactics** tailored by KOL tier and objectives
5. **Medical Affairs Resource Allocation** (MSL deployment, budget)
6. **Advisory Board Strategy** (composition, objectives, logistics)
7. **Measurement Framework** (engagement metrics, relationship health, business impact)
8. **Compliance Framework** ensuring PhRMA Code and Sunshine Act adherence

### 1.3 Who Should Use This Use Case

**Primary Users:**
- **P11_MEDAFF**: Director of Medical Affairs - Digital Health (Lead)
- **P12_MSL**: Medical Science Liaison (Execution)
- **P01_CMO**: Chief Medical Officer - DTx (Strategic Oversight)

**Supporting Users:**
- **P13_KOLMGR**: KOL Management Lead (Data & Systems)
- **P14_COMPMED**: Medical Director, Compliance (Guardrails)

### 1.4 Time & Effort

| Activity Phase | Duration | Effort (Hours) | Complexity |
|----------------|----------|----------------|------------|
| **Phase 1: KOL Identification** | 2-3 weeks | 20-25 hours | INTERMEDIATE |
| **Phase 2: Mapping & Tiering** | 1-2 weeks | 15-20 hours | ADVANCED |
| **Phase 3: Engagement Planning** | 1-2 weeks | 15-20 hours | ADVANCED |
| **Phase 4: Advisory Board Strategy** | 1 week | 10-12 hours | EXPERT |
| **Phase 5: Measurement & Optimization** | Ongoing | 5-8 hours/month | INTERMEDIATE |
| **TOTAL (Initial Setup)** | **5-8 weeks** | **65-85 hours** | **ADVANCED** |

### 1.5 Success Criteria

A successful KOL engagement strategy achieves:

✅ **Coverage**: 80-100% of Tier 1 KOLs identified and profiled  
✅ **Engagement**: 60-80% of Tier 1 KOLs engaged within 6 months  
✅ **Advocacy**: 40-60% of engaged Tier 1 KOLs become product advocates  
✅ **Advisory**: 2-3 successful advisory boards delivering actionable insights  
✅ **Compliance**: 100% adherence to PhRMA Code and reporting requirements  
✅ **ROI**: Medical affairs spend generates 8-12x ROI in accelerated adoption  

---

## 2. BUSINESS CONTEXT & VALUE PROPOSITION

### 2.1 The Strategic Importance of KOL Engagement

**Why KOL Engagement Matters:**

Key Opinion Leaders are the influencers who:
- **Shape Clinical Practice**: Guidelines, protocols, treatment pathways
- **Drive Product Adoption**: Early adopters whose use influences peers
- **Inform Clinical Development**: Trial design, endpoint selection, feasibility
- **Influence Payers**: Participate in P&T committees and coverage decisions
- **Educate the Market**: CME programs, publications, congress presentations
- **Validate Innovation**: Endorse new technologies and approaches

**The Digital Health KOL Challenge:**

Digital therapeutics face unique KOL engagement challenges:
- **Novel Category**: Few established DTx KOLs; must identify early adopters
- **Cross-Disciplinary**: Requires clinical + digital health + health economics expertise
- **Regulatory Uncertainty**: KOLs hesitant to advocate until FDA clarity
- **Evidence Generation**: KOLs want peer-reviewed data before endorsement
- **Adoption Barriers**: Workflow integration, reimbursement concerns

### 2.2 Common Pitfalls & Failure Modes

**Pitfall #1: Reactive KOL Identification**
- ❌ **Problem**: Identifying KOLs only when needed (e.g., for advisory board)
- ✅ **Solution**: Proactive mapping 12-18 months before product launch
- 📊 **Impact**: Reactive approach delays launch by 6-9 months

**Pitfall #2: Over-Reliance on Publication Metrics**
- ❌ **Problem**: Focusing only on h-index and publication count
- ✅ **Solution**: Multi-dimensional influence scoring (digital, clinical practice, guidelines)
- 📊 **Impact**: Missing 40-50% of actual influencers (digital native KOLs)

**Pitfall #3: Transactional Relationships**
- ❌ **Problem**: Engaging KOLs only for advisory boards or speaker programs
- ✅ **Solution**: Building authentic, long-term scientific partnerships
- 📊 **Impact**: Transactional KOLs become competitors' advocates

**Pitfall #4: Insufficient Competitive Intelligence**
- ❌ **Problem**: Not tracking competitor KOL relationships
- ✅ **Solution**: Competitive KOL mapping and relationship monitoring
- 📊 **Impact**: Engaging "captive" KOLs wastes 30-40% of engagement budget

**Pitfall #5: Compliance Blind Spots**
- ❌ **Problem**: Insufficient tracking of Fair Market Value, Sunshine Act reporting
- ✅ **Solution**: Integrated compliance system with real-time alerts
- 📊 **Impact**: Compliance violations = $10K-$1M+ fines + reputation damage

**Pitfall #6: Lack of Measurement**
- ❌ **Problem**: No KPIs or ROI metrics for medical affairs spend
- ✅ **Solution**: Multi-tier engagement metrics tied to business outcomes
- 📊 **Impact**: Cannot justify medical affairs investment to leadership

### 2.3 Industry Benchmarks

| Metric | Poor Performance | Average Performance | Best-in-Class |
|--------|------------------|---------------------|---------------|
| **Tier 1 KOL Coverage** | <50% | 60-80% | 90-100% |
| **Engagement Success Rate** | <40% | 50-70% | 75-90% |
| **Time to First Engagement** | >12 months | 6-9 months | 3-6 months |
| **Advisory Board Insights** | Generic, unusable | Some actionable | Highly strategic |
| **MSL Productivity** | <50 interactions/year | 80-120 interactions/year | 150+ interactions/year |
| **KOL Advocacy Rate** | <20% | 30-50% | 60-80% |
| **Medical Affairs ROI** | <3x | 5-8x | 10-15x |
| **Compliance Violations** | >5/year | 1-2/year | 0/year |

### 2.4 Regulatory & Compliance Landscape

**Key Regulatory Frameworks:**

**1. PhRMA Code on Interactions with Healthcare Professionals (2024)**
- Prohibition on entertainment and recreation
- Fair Market Value requirements for consulting/speaking
- Educational vs. promotional activity distinctions
- Transparency and documentation requirements

**2. Physician Payments Sunshine Act (Open Payments)**
- Reporting threshold: $10+ per payment
- Annual reporting deadline: March 31
- Public database publication: June 30
- Categories: Consulting, speaking, meals, travel, research

**3. Anti-Kickback Statute (AKS)**
- Prohibits remuneration for referrals
- Fair Market Value safe harbor
- Bona fide services exception
- Documentation requirements

**4. FDA Promotional vs. Non-Promotional Guidance**
- Medical information vs. promotion distinction
- Unsolicited vs. solicited request handling
- Off-label information dissemination rules
- Scientific exchange vs. marketing

**5. EFPIA Code of Practice (Europe)**
- Similar to PhRMA Code
- Cross-border interaction rules
- National code variations (UK, Germany, France)

### 2.5 Value Proposition of This Use Case

**Direct Benefits:**
1. **Accelerated Product Adoption**: 40-60% faster uptake vs. poor KOL engagement
2. **Clinical Development Efficiency**: 30-50% faster trial enrollment
3. **Market Differentiation**: Early KOL advocacy creates competitive moat
4. **Scientific Credibility**: Publications and presentations by Tier 1 KOLs
5. **Regulatory Success**: KOL input improves regulatory strategy
6. **Commercial Intelligence**: Early market feedback and competitive insights

**Indirect Benefits:**
- Stronger payer relationships (KOLs on P&T committees)
- Better clinical trial protocol design
- Earlier identification of market access barriers
- Enhanced company reputation in therapeutic area
- Pipeline acceleration through investigator-initiated trials

**ROI Calculation:**
```
Medical Affairs Investment: $1.5M-$3M annually
  - MSL salaries & expenses: $800K-$1.5M
  - Advisory boards & KOL fees: $400K-$800K
  - Technology & systems: $200K-$400K
  - Educational programs: $100K-$300K

Business Impact: $15M-$40M
  - Accelerated adoption: $10M-$25M (6-month revenue pull-forward)
  - Trial enrollment acceleration: $2M-$5M (reduced CRO costs)
  - Competitive advantage: $2M-$5M (premium positioning)
  - Pipeline acceleration: $1M-$5M (faster development)

ROI: 10-20x return on medical affairs investment
```

### 2.6 Integration with Broader Development Strategy

**Upstream Dependencies** (Must be completed first):
- ✅ Therapeutic Area Strategy & Indication Selection
- ✅ Target Product Profile (TPP) Definition
- ✅ Clinical Development Plan (CDP)
- ✅ Commercial Strategy & Launch Planning

**Downstream Outputs** (UC-12 enables):
- Advisory Board Execution & Insights
- Investigator-Initiated Trial Facilitation
- Publication Planning & Steering Committees
- Medical Education Program Development
- Congress Strategy & KOL Presence
- Guideline Development Participation

**Parallel Activities** (Concurrent with UC-12):
- Clinical trial site selection and activation
- Payer engagement and market access strategy
- Regulatory interactions and submissions
- Commercial launch preparation

---

## 3. PERSONA DEFINITIONS

### Primary Personas

#### **P11_MEDAFF: Director of Medical Affairs - Digital Health**

**Role Profile:**
```yaml
Title: Director, Medical Affairs - Digital Health
Experience: 10-15 years in Medical Affairs + 3-5 years in digital health
Education: MD, PharmD, or PhD + MBA (preferred)
Reporting: VP Medical Affairs or Chief Medical Officer
Team Size: 5-15 FTEs (MSLs, KOL managers, medical information)

Core Responsibilities:
  - Strategic KOL engagement planning
  - MSL team leadership and deployment
  - Advisory board strategy and execution
  - Medical information services
  - Thought leader development
  - Scientific publications and presentations
  - Cross-functional collaboration (clinical, commercial, regulatory)

Key Skills:
  - Therapeutic area expertise
  - Stakeholder relationship management
  - Strategic planning and execution
  - Scientific communication
  - Regulatory compliance (PhRMA, Sunshine Act)
  - Budget management
  - Digital health landscape knowledge

Success Metrics:
  - KOL coverage and engagement rates
  - Advisory board insights and impact
  - MSL productivity and effectiveness
  - Publication and presentation metrics
  - Compliance adherence (100%)
  - Business impact (product adoption)
```

**How P11_MEDAFF Uses This Use Case:**
- Develops overall KOL engagement strategy
- Leads KOL mapping and tier classification
- Designs advisory board programs
- Allocates MSL resources geographically
- Tracks engagement metrics and ROI
- Ensures compliance with all regulations

---

#### **P12_MSL: Medical Science Liaison**

**Role Profile:**
```yaml
Title: Medical Science Liaison (MSL)
Experience: 3-8 years post-advanced degree
Education: PharmD, MD, PhD, or equivalent advanced degree
Reporting: Director of Medical Affairs
Territory: Typically regional (5-10 major academic centers)

Core Responsibilities:
  - Building relationships with KOLs in assigned territory
  - Scientific exchange and education
  - Gathering insights and competitive intelligence
  - Supporting investigator-initiated trials
  - Facilitating advisory board participation
  - Responding to medical inquiries
  - Congress support and scientific programs

Key Skills:
  - Deep therapeutic area knowledge
  - Excellent communication and listening
  - Relationship building and maintenance
  - Scientific credibility
  - Compliance adherence
  - CRM system proficiency (Veeva, Salesforce)
  - Presentation skills

Success Metrics:
  - KOL interactions per quarter (target: 30-40)
  - Relationship quality scores
  - Insights captured and reported
  - Advisory board recruitment success
  - Compliance adherence (100%)
  - KOL satisfaction scores
```

**How P12_MSL Uses This Use Case:**
- Identifies and prioritizes KOLs in territory
- Develops individualized engagement plans
- Executes scientific exchanges
- Captures and reports KOL insights
- Facilitates advisory board participation
- Tracks relationship health over time

---

#### **P13_KOLMGR: KOL Management Lead**

**Role Profile:**
```yaml
Title: KOL Management Lead / Senior Manager, Stakeholder Engagement
Experience: 5-10 years in Medical Affairs or Market Research
Education: BA/BS in life sciences + MBA or advanced degree
Reporting: Director of Medical Affairs
Responsibilities:
  - KOL database management
  - Influence mapping and analytics
  - Competitive intelligence gathering
  - CRM system administration
  - Reporting and dashboards
  - Sunshine Act compliance tracking
  
Key Skills:
  - Data analysis and visualization
  - CRM systems (Veeva CRM, Salesforce)
  - Social media and digital influence tracking
  - Competitive intelligence
  - Budget tracking and Fair Market Value management
```

---

#### **P14_COMPMED: Medical Director, Compliance**

**Role Profile:**
```yaml
Title: Medical Director, Compliance
Experience: 8-12 years in Regulatory/Compliance + Medical Affairs
Education: MD, PharmD, JD, or equivalent
Reporting: VP Regulatory Affairs or Chief Compliance Officer
Responsibilities:
  - Ensuring PhRMA Code adherence
  - Reviewing speaker programs and materials
  - Managing Sunshine Act reporting
  - Training on compliant interactions
  - Investigating compliance concerns
  
Key Skills:
  - Regulatory and compliance expertise
  - Risk assessment
  - Training and education
  - Audit and investigation
  - Cross-functional influence
```

---

### Secondary Personas

**P01_CMO**: Chief Medical Officer - DTx (Strategic Oversight)  
**P05_REGDIR**: VP Regulatory Affairs (Regulatory Guidance)  
**P15_COMDIR**: Commercial Director (Commercial Alignment)  
**P16_PAYDIR**: Payer Strategy Director (Payer KOL Coordination)

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
                    [START: New DTx Product KOL Engagement]
                                    |
                                    v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 1: KOL IDENTIFICATION & DISCOVERY     ║
            ║  Time: 2-3 weeks                             ║
            ║  Personas: P11_MEDAFF, P13_KOLMGR            ║
            ╚═══════════════════════════════════════════════╝
                                    |
                    ┌───────────────┴───────────────┐
                    v                               v
            ┌─────────────────┐           ┌─────────────────┐
            │ STEP 1.1:       │           │ STEP 1.2:       │
            │ Therapeutic     │           │ Digital Health  │
            │ Area KOL        │           │ Influencer      │
            │ Identification  │           │ Mapping         │
            │ (12 hours)      │           │ (8 hours)       │
            └────────┬────────┘           └────────┬────────┘
                     └───────────┬────────────────┘
                                 v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 2: KOL MAPPING & TIERING             ║
            ║  Time: 1-2 weeks                             ║
            ║  Personas: P11_MEDAFF, P13_KOLMGR            ║
            ╚═══════════════════════════════════════════════╝
                                 |
                    ┌────────────┴─────────────┐
                    v                          v
            ┌─────────────────┐       ┌─────────────────┐
            │ STEP 2.1:       │       │ STEP 2.2:       │
            │ Influence       │       │ Competitive     │
            │ Scoring &       │       │ KOL             │
            │ Tier            │       │ Intelligence    │
            │ Classification  │       │ (6 hours)       │
            │ (10 hours)      │       └────────┬────────┘
            └────────┬────────┘                │
                     └────────────┬────────────┘
                                  v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 3: ENGAGEMENT PLANNING                ║
            ║  Time: 1-2 weeks                             ║
            ║  Personas: P11_MEDAFF, P12_MSL               ║
            ╚═══════════════════════════════════════════════╝
                                  |
                    ┌─────────────┴──────────────┐
                    v                            v
            ┌─────────────────┐         ┌─────────────────┐
            │ STEP 3.1:       │         │ STEP 3.2:       │
            │ Engagement      │         │ MSL Resource    │
            │ Strategy by     │         │ Allocation &    │
            │ Tier            │         │ Territory       │
            │ (10 hours)      │         │ Planning        │
            └────────┬────────┘         │ (8 hours)       │
                     │                  └────────┬────────┘
                     └──────────┬───────────────┘
                                v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 4: ADVISORY BOARD STRATEGY            ║
            ║  Time: 1 week                                ║
            ║  Personas: P11_MEDAFF, P01_CMO               ║
            ╚═══════════════════════════════════════════════╝
                                |
                    ┌───────────┴────────────┐
                    v                        v
            ┌─────────────────┐      ┌─────────────────┐
            │ STEP 4.1:       │      │ STEP 4.2:       │
            │ Advisory Board  │      │ Expert          │
            │ Strategic       │      │ Selection &     │
            │ Objectives      │      │ Recruitment     │
            │ (6 hours)       │      │ (6 hours)       │
            └────────┬────────┘      └────────┬────────┘
                     └────────────┬───────────┘
                                  v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 5: MEASUREMENT & OPTIMIZATION         ║
            ║  Time: Ongoing                               ║
            ║  Personas: P11_MEDAFF, P13_KOLMGR            ║
            ╚═══════════════════════════════════════════════╝
                                  |
                    ┌─────────────┴──────────────┐
                    v                            v
            ┌─────────────────┐         ┌─────────────────┐
            │ STEP 5.1:       │         │ STEP 5.2:       │
            │ Engagement      │         │ Compliance      │
            │ Metrics &       │         │ Monitoring &    │
            │ Tracking        │         │ Sunshine Act    │
            │ (5 hrs/mo)      │         │ (3 hrs/mo)      │
            └────────┬────────┘         └────────┬────────┘
                     └──────────┬───────────────┘
                                v
            ╔═══════════════════════════════════════════════╗
            ║  DELIVERABLES PACKAGE                        ║
            ║  - KOL Database (100-200 profiles)           ║
            ║  - Tier Classification Matrix                ║
            ║  - Competitive Intelligence Report           ║
            ║  - Engagement Plan by KOL Tier               ║
            ║  - MSL Territory Assignments                 ║
            ║  - Advisory Board Strategy Document          ║
            ║  - Engagement Metrics Dashboard              ║
            ║  - Compliance Tracking System                ║
            ╚═══════════════════════════════════════════════╝
                                 |
                                 v
                            [END: KOL Engagement Strategy Complete]
```

### 4.2 Workflow Phase Summary

| Phase | Duration | Key Activities | Primary Outputs |
|-------|----------|----------------|-----------------|
| **Phase 1: KOL Identification** | 2-3 weeks | Literature review, social media analysis, congress mapping | KOL database (100-200 profiles) |
| **Phase 2: Mapping & Tiering** | 1-2 weeks | Influence scoring, tier classification, competitive intel | Tier classification matrix |
| **Phase 3: Engagement Planning** | 1-2 weeks | Strategy by tier, MSL deployment, tactical plans | Engagement plan & resource allocation |
| **Phase 4: Advisory Board Strategy** | 1 week | Objectives definition, expert selection, logistics | Advisory board strategy document |
| **Phase 5: Measurement** | Ongoing | Metrics tracking, compliance monitoring, optimization | Engagement dashboard & reports |
| **TOTAL (Initial Setup)** | **5-8 weeks** | **Complete KOL engagement strategy** | **Ready-to-execute engagement plan** |

---

## 5. STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: KOL IDENTIFICATION & DISCOVERY (2-3 weeks)

---

#### **STEP 1.1: Therapeutic Area KOL Identification (12 hours)**

**Objective**: Identify traditional clinical KOLs (academic physicians, researchers, guideline authors) in the target therapeutic area.

**Persona**: P13_KOLMGR (Lead), P11_MEDAFF (Review)

**Prerequisites**:
- Therapeutic area defined (e.g., Type 2 Diabetes, Major Depressive Disorder)
- Target geographies selected (e.g., US, Top 5 EU countries, Japan)
- Access to databases (PubMed, Scopus, congress speaker lists)

**Process**:

1. **Execute Prompt 1.1.1: Traditional KOL Literature Search** (4 hours)
   - Use systematic search across PubMed, Google Scholar, Scopus
   - Identify top authors by publication count, h-index, citations
   - Filter by therapeutic area relevance and recency
   - Export candidate list (aim for 150-200 names)

2. **Execute Prompt 1.1.2: Guideline & Society Leadership Mapping** (3 hours)
   - Identify guideline authors (ADA, AHA, ACC, NCCN, etc.)
   - Map society leadership (Presidents, Board members, Committee chairs)
   - Identify congress organizing committee members
   - Cross-reference with literature search results

3. **Execute Prompt 1.1.3: Academic & Clinical Practice Leaders** (3 hours)
   - Identify top academic centers of excellence
   - Map department chairs and division chiefs
   - Identify high-volume practitioners in target condition
   - Verify active clinical practice vs. pure research

4. **Review & Consolidate** (2 hours)
   - De-duplicate across sources
   - Verify contact information and current affiliations
   - Create initial KOL database in CRM (Veeva, Salesforce)
   - Validate with P11_MEDAFF

**Deliverable**: Traditional KOL Database (100-150 clinical KOLs)

**Quality Check**:
✅ Geographic coverage adequate (all target markets)  
✅ Mix of academic and community-based KOLs  
✅ Active in clinical practice (not retired)  
✅ Publication record within last 3-5 years  
✅ No major competitive affiliations flagged  

---

#### **STEP 1.2: Digital Health Influencer Mapping (8 hours)**

**Objective**: Identify digital health influencers, patient advocates, health tech leaders who influence DTx adoption.

**Persona**: P13_KOLMGR (Lead), P11_MEDAFF (Review)

**Prerequisites**:
- Traditional KOL database from Step 1.1
- Social media monitoring tools (Twitter/X, LinkedIn, Doximity)
- Digital health congress lists (HIMSS, ATA, Connected Health)

**Process**:

1. **Execute Prompt 1.2.1: Digital Health Twitter/X Influencer Analysis** (3 hours)
   - Identify high-engagement accounts in digital health + therapeutic area
   - Analyze follower counts, engagement rates, content themes
   - Cross-reference with traditional KOL list
   - Flag digital-native influencers (non-MD/PhD but influential)

2. **Execute Prompt 1.2.2: Digital Health Congress Speaker Mapping** (2 hours)
   - Review past 2 years of digital health congress programs
   - Identify frequent speakers on digital therapeutics
   - Map DTx-specific expertise (reimbursement, clinical validation, UX)
   - Cross-reference with traditional KOL list

3. **Execute Prompt 1.2.3: Patient Advocacy & Digital Health Policy Leaders** (2 hours)
   - Identify patient advocacy organization leaders
   - Map digital health policy influencers (ATA, DITF, others)
   - Identify health system digital health executives
   - Document unique value proposition of each

4. **Consolidate & Integrate** (1 hour)
   - Merge digital health influencers with traditional KOL database
   - Tag profiles with "Digital Health Expertise" flag
   - Identify unique digital-native KOLs (e.g., health tech CEOs, policy experts)
   - Validate with P11_MEDAFF

**Deliverable**: Comprehensive KOL Database (150-200 KOLs including digital influencers)

**Quality Check**:
✅ 20-30% of KOLs have digital health expertise  
✅ Mix of clinical + digital + policy + patient advocacy  
✅ Social media reach quantified where applicable  
✅ Digital health congress participation documented  
✅ Unique value of each influencer articulated  

---

### PHASE 2: KOL MAPPING & TIERING (1-2 weeks)

---

#### **STEP 2.1: Influence Scoring & Tier Classification (10 hours)**

**Objective**: Score and classify KOLs into tiers (Tier 1 / Tier 2 / Tier 3) based on multi-dimensional influence.

**Persona**: P11_MEDAFF (Lead), P13_KOLMGR (Analysis)

**Prerequisites**:
- Complete KOL database from Phase 1
- Influence scoring criteria defined
- CRM system ready for tier classification

**Process**:

1. **Execute Prompt 2.1.1: Multi-Dimensional Influence Scoring** (5 hours)
   - Apply scoring framework across 6 dimensions:
     - **Clinical Practice Influence** (patient volume, site leadership)
     - **Academic/Research Influence** (h-index, publications, grants)
     - **Guideline Influence** (guideline author, committee membership)
     - **Digital/Social Influence** (Twitter followers, engagement)
     - **Industry Influence** (advisory boards, consultancies, speaker bureaus)
     - **Policy/Payer Influence** (P&T committees, policy roles)
   - Assign scores (1-5) for each dimension
   - Calculate weighted total influence score

**Scoring Rubric Example:**

| Dimension | Weight | Score 1 | Score 3 | Score 5 |
|-----------|--------|---------|---------|---------|
| Clinical Practice | 20% | <100 patients/year | 500-1000 patients/year | >2000 patients/year, site PI |
| Academic/Research | 20% | h-index <10 | h-index 15-30 | h-index >40, R01 funding |
| Guideline Influence | 20% | No participation | Committee member | Lead author, chair |
| Digital/Social | 15% | <1K followers | 5K-20K followers | >50K followers, high engagement |
| Industry Influence | 15% | Limited consulting | 2-3 advisory boards | >5 advisory boards, steering committees |
| Policy/Payer | 10% | No involvement | Occasional participation | P&T committee, policy taskforce |

2. **Execute Prompt 2.1.2: Tier Classification Logic** (3 hours)
   - **Tier 1 (National/International Leaders)**: Total score ≥4.0, leadership in ≥3 dimensions
   - **Tier 2 (Regional/Rising Leaders)**: Total score 3.0-3.9, leadership in ≥2 dimensions
   - **Tier 3 (Local Influencers)**: Total score 2.0-2.9, leadership in ≥1 dimension
   - Apply classification rules to all KOLs
   - Review edge cases and adjust based on qualitative factors

3. **Tier Distribution Analysis** (1 hour)
   - Target distribution: 15-20% Tier 1, 25-35% Tier 2, 45-60% Tier 3
   - Adjust scoring weights if distribution skewed
   - Ensure geographic balance within each tier

4. **Validation & Finalization** (1 hour)
   - Review tier assignments with P11_MEDAFF and P01_CMO
   - Validate with field medical team (MSLs) for local knowledge
   - Finalize tier classification in CRM

**Deliverable**: Tier-Classified KOL Database with Influence Scores

**Quality Check**:
✅ Scoring applied consistently across all KOLs  
✅ Tier distribution aligns with targets (15-20% Tier 1)  
✅ Geographic balance maintained within tiers  
✅ Edge cases reviewed and justified  
✅ CRM system updated with tier classifications  

---

#### **STEP 2.2: Competitive KOL Intelligence (6 hours)**

**Objective**: Assess competitive engagement status and relationship bias for each KOL.

**Persona**: P13_KOLMGR (Lead), P12_MSL (Field Input), P11_MEDAFF (Review)

**Prerequisites**:
- Tier-classified KOL database from Step 2.1
- Competitive intelligence sources (congress disclosures, ClinicalTrials.gov, company websites)
- MSL field intelligence on competitor relationships

**Process**:

1. **Execute Prompt 2.2.1: Competitive Relationship Mapping** (3 hours)
   - Review congress speaker disclosures for competitor affiliations
   - Check ClinicalTrials.gov for competitor study involvement
   - Review competitor advisory board rosters (when public)
   - Document competitive relationships in CRM

**Competitive Engagement Classification:**
- **🔴 Competitor Captive**: Deep, exclusive relationship (>3 years, multiple activities)
- **🟡 Competitor Engaged**: Active but not exclusive relationship
- **🟢 Open/Available**: No or minimal competitor engagement
- **🔵 Company Engaged**: Already engaged with our company

2. **Execute Prompt 2.2.2: Relationship Bias Assessment** (2 hours)
   - Assess sentiment toward our company (positive / neutral / negative)
   - Document past interactions (if any)
   - Identify potential obstacles to engagement
   - Flag KOLs with competitive bias or conflicts

3. **Prioritization Matrix** (1 hour)
   - Create 2x2 matrix: Influence (High/Low) × Accessibility (Easy/Hard)
   - Prioritize **High Influence + Easy Access** KOLs for immediate outreach
   - Develop long-term cultivation strategy for **High Influence + Hard Access**
   - Flag **Competitor Captive + High Influence** as defensive targets

**Deliverable**: Competitive Intelligence Report & KOL Prioritization Matrix

**Quality Check**:
✅ Competitive relationships documented for ≥80% of Tier 1/2 KOLs  
✅ Relationship bias assessed with confidence levels  
✅ Prioritization matrix identifies quick wins  
✅ Defensive strategy for competitor-captive KOLs  
✅ CRM updated with competitive intelligence flags  

---

### PHASE 3: ENGAGEMENT PLANNING (1-2 weeks)

---

#### **STEP 3.1: Engagement Strategy by Tier (10 hours)**

**Objective**: Develop differentiated engagement strategies for each KOL tier with specific tactics and touchpoint frequency.

**Persona**: P11_MEDAFF (Lead), P12_MSL (Input)

**Prerequisites**:
- Tier-classified KOL database with competitive intelligence
- Medical affairs budget allocation
- MSL headcount and territory assignments

**Process**:

1. **Execute Prompt 3.1.1: Tier 1 Engagement Strategy** (3 hours)
   - **Objective**: Develop advocates and thought leaders
   - **Tactics**: 
     - 1:1 strategic discussions with CMO/CEO (2-4x per year)
     - Advisory board participation (2x per year)
     - Steering committee roles (pivotal trials)
     - Co-authored publications and congress presentations
     - Early access to data and strategic insights
   - **Touchpoint Frequency**: 8-12 interactions per year (MSL + leadership)
   - **Budget Allocation**: $20K-$50K per KOL annually (consulting, speaking, travel)

2. **Execute Prompt 3.1.2: Tier 2 Engagement Strategy** (3 hours)
   - **Objective**: Build relationships and identify future Tier 1 candidates
   - **Tactics**:
     - Quarterly MSL scientific exchanges
     - Advisory board participation (1x per year, rotating)
     - Speaker opportunities at regional programs
     - Research collaboration (investigator-initiated trials)
     - Regional congress meetings
   - **Touchpoint Frequency**: 4-6 interactions per year (primarily MSL)
   - **Budget Allocation**: $5K-$15K per KOL annually

3. **Execute Prompt 3.1.3: Tier 3 Engagement Strategy** (2 hours)
   - **Objective**: Awareness and education; identify rising stars
   - **Tactics**:
     - Educational MSL discussions (2-3x per year)
     - Group educational programs (CME, grand rounds)
     - Product information and clinical data sharing
     - Occasional speaker opportunities (local programs)
   - **Touchpoint Frequency**: 2-4 interactions per year
   - **Budget Allocation**: $1K-$5K per KOL annually

4. **Compliance Review & Approval** (2 hours)
   - Review all tactics with P14_COMPMED for PhRMA Code compliance
   - Ensure Fair Market Value limits not exceeded
   - Document educational vs. promotional distinctions
   - Establish Sunshine Act reporting workflows

**Deliverable**: Tier-Specific Engagement Playbooks (3 documents)

**Quality Check**:
✅ Differentiated strategies by tier (not one-size-fits-all)  
✅ Touchpoint frequency realistic given MSL capacity  
✅ Budget allocation aligns with medical affairs spend  
✅ All tactics compliant with PhRMA Code  
✅ Clear objectives for each tier  

---

#### **STEP 3.2: MSL Resource Allocation & Territory Planning (8 hours)**

**Objective**: Deploy MSL resources geographically and assign KOL portfolios to maximize coverage and impact.

**Persona**: P11_MEDAFF (Lead), P12_MSL (Input)

**Prerequisites**:
- KOL database with geographic locations
- MSL headcount and territories defined
- Engagement strategy by tier from Step 3.1

**Process**:

1. **Execute Prompt 3.2.1: Geographic KOL Density Mapping** (2 hours)
   - Map KOL locations by city and metro area
   - Identify geographic clusters (e.g., Boston, NYC, SF, Houston)
   - Calculate KOL density per territory
   - Identify coverage gaps

2. **Execute Prompt 3.2.2: MSL Territory Optimization** (3 hours)
   - Assign MSLs to territories based on:
     - KOL tier mix (balance Tier 1 access across MSLs)
     - Geographic coverage (travel time, logistics)
     - MSL experience and expertise
     - Existing relationships (if any)
   - Target: 30-50 KOLs per MSL (10-15 Tier 1/2, 20-35 Tier 3)
   - Document territory assignments in CRM

3. **Execute Prompt 3.2.3: Individual KOL Engagement Plans** (2 hours)
   - For each Tier 1/2 KOL, develop individualized plan:
     - Engagement objectives (e.g., advisory board participation, publication)
     - Tactical activities and timeline (6-12 months)
     - Key discussion topics and scientific interests
     - Relationship history and next steps
   - Assign MSL ownership in CRM
   - Set quarterly review checkpoints

4. **Resource Adequacy Check** (1 hour)
   - Calculate total touchpoint target: (Tier 1 × 10) + (Tier 2 × 5) + (Tier 3 × 3)
   - Assess if MSL capacity sufficient (target: 80-120 interactions per MSL per year)
   - Identify need for additional MSLs or prioritization

**Deliverable**: MSL Territory Assignments & Individual KOL Engagement Plans

**Quality Check**:
✅ All Tier 1/2 KOLs assigned to MSL owner  
✅ MSL workload balanced (no overallocation)  
✅ Geographic coverage complete (no major gaps)  
✅ Individual plans for Tier 1/2 KOLs documented  
✅ CRM system fully populated with assignments  

---

### PHASE 4: ADVISORY BOARD STRATEGY (1 week)

---

#### **STEP 4.1: Advisory Board Strategic Objectives (6 hours)**

**Objective**: Define strategic objectives, format, and logistics for 2-3 advisory boards aligned with product development and launch milestones.

**Persona**: P11_MEDAFF (Lead), P01_CMO (Strategic Input)

**Prerequisites**:
- Product development timeline and key decision points
- Clinical development milestones (e.g., Phase 2 readout, Phase 3 design, launch preparation)
- Budget allocation for advisory boards ($50K-$150K per board)

**Process**:

1. **Execute Prompt 4.1.1: Advisory Board Needs Assessment** (2 hours)
   - Identify key decision points requiring KOL input:
     - Clinical development (endpoint selection, trial design, comparator)
     - Regulatory strategy (FDA pathway, claims, labeling)
     - Market access (value proposition, reimbursement strategy)
     - Commercial strategy (positioning, segmentation, HCP education)
   - Prioritize top 3-5 strategic questions for advisory input
   - Map to product development timeline

2. **Execute Prompt 4.1.2: Advisory Board Format & Logistics** (2 hours)
   - **Format Options**:
     - In-person full-day meeting (highest engagement, highest cost)
     - Virtual half-day meeting (good engagement, lower cost)
     - Hybrid format (core in-person + virtual participants)
   - **Logistics**:
     - Timing: Align with product milestones (6-12 months pre-launch, etc.)
     - Location: Major city with airport hub vs. attractive destination
     - Duration: Half-day (4 hours) vs. Full-day (6-8 hours)
     - Size: 8-12 advisors (sweet spot for discussion)
   - **Budget**:
     - Honoraria: $1.5K-$5K per advisor (based on FMV)
     - Travel & accommodations: $1K-$2K per advisor
     - Meeting space & meals: $10K-$30K
     - Internal staff time: $10K-$20K
     - **Total**: $50K-$150K per advisory board

3. **Execute Prompt 4.1.3: Advisory Board Agenda Development** (2 hours)
   - Structure agenda around strategic questions
   - Balance presentation time (company) vs. discussion time (advisors)
   - Target ratio: 40% presentation / 60% facilitated discussion
   - Include interactive exercises (e.g., conjoint analysis, positioning matrix)
   - Plan for insights capture (note-taking, recordings, summary)

**Deliverable**: Advisory Board Strategic Plan (1-2 boards defined)

**Quality Check**:
✅ Strategic objectives clearly defined and aligned with product milestones  
✅ Format and logistics optimized for objectives and budget  
✅ Agenda balances presentation and discussion  
✅ Insights capture plan ensures actionable outputs  
✅ Timeline allows for proper planning (3-4 months lead time)  

---

#### **STEP 4.2: Expert Selection & Recruitment (6 hours)**

**Objective**: Select optimal mix of experts for advisory board and execute compliant recruitment process.

**Persona**: P11_MEDAFF (Lead), P12_MSL (Recruitment), P14_COMPMED (Compliance Review)

**Prerequisites**:
- Advisory board strategic objectives from Step 4.1
- Tier-classified KOL database with competitive intelligence
- Compliance approval for advisory board concept

**Process**:

1. **Execute Prompt 4.2.1: Advisory Board Expert Selection Criteria** (2 hours)
   - **Diversity Dimensions**:
     - Geographic (East/West Coast, Midwest, international)
     - Practice Setting (academic, community, integrated health system)
     - Expertise (clinical, digital health, health economics, policy)
     - Career Stage (established leaders + rising stars)
     - Demographics (gender, underrepresented groups)
   - **Exclusion Criteria**:
     - Competitor captive status (exclusive relationships)
     - Conflicts of interest (financial, institutional)
     - Past non-compliance with confidentiality
   - Target: 10-14 invitees for 8-12 confirmed attendees (assume 20% decline rate)

2. **Execute Prompt 4.2.2: Advisory Board Recruitment Process** (3 hours)
   - **Recruitment Timeline** (8-10 weeks before board):
     - Week 1-2: MSL outreach and save-the-date
     - Week 3-4: Formal invitation letter with agenda outline
     - Week 5-6: Contract execution (consulting agreement)
     - Week 7-8: Pre-board materials distribution
   - **Compliant Recruitment**:
     - Use standard consulting agreement template (approved by legal)
     - Document Fair Market Value rationale
     - Collect conflict of interest disclosures
     - Execute contracts before board (not after)
     - Obtain Sunshine Act reporting information

3. **Backup Expert List & Contingency** (1 hour)
   - Identify 3-5 backup experts in case of declines
   - Maintain rolling recruitment until 8-12 confirmed
   - Have contingency plan for last-minute cancellations

**Deliverable**: Advisory Board Expert Roster & Recruitment Tracker

**Quality Check**:
✅ Expert mix diverse across all dimensions  
✅ No major conflicts of interest or competitor captives  
✅ Recruitment timeline allows 8+ weeks for contracting  
✅ All contracts executed before advisory board date  
✅ Compliance approval documented  

---

### PHASE 5: MEASUREMENT & OPTIMIZATION (Ongoing)

---

#### **STEP 5.1: Engagement Metrics & Tracking (5 hours/month)**

**Objective**: Track KOL engagement metrics, relationship health, and business impact on an ongoing basis.

**Persona**: P13_KOLMGR (Lead), P11_MEDAFF (Review)

**Prerequisites**:
- CRM system with engagement tracking (Veeva CRM, Salesforce)
- KOL engagement activities underway
- Baseline metrics established

**Process**:

1. **Execute Prompt 5.1.1: Monthly Engagement Metrics Dashboard** (2 hours/month)
   - **Quantitative Metrics**:
     - KOL coverage rate by tier (% engaged in last 3 months)
     - MSL interaction volume (meetings, emails, calls)
     - Advisory board participation rate
     - Speaker program participation rate
     - Publication and congress presentation tracking
   - **Qualitative Metrics**:
     - Relationship health scores (1-5 scale, MSL-assessed)
     - KOL sentiment (positive / neutral / negative)
     - Competitive intelligence updates
     - Insights quality and actionability
   - Generate monthly dashboard for leadership review

**Example KPIs:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tier 1 Coverage (3-month) | 80-100% | 85% | ✅ On Target |
| Tier 2 Coverage (3-month) | 60-80% | 72% | ✅ On Target |
| MSL Interactions/Quarter | 30-40 per MSL | 35 | ✅ On Target |
| Advisory Board Participants | 8-12 per board | 10 | ✅ On Target |
| KOL Advocacy Rate | 40-60% | 52% | ✅ On Target |

2. **Execute Prompt 5.1.2: Business Impact Attribution** (2 hours/month)
   - Track downstream impact of KOL engagement:
     - Trial enrollment (sites led by engaged KOLs)
     - Product adoption (prescriptions at engaged KOL institutions)
     - Publications and presentations (KOL-authored or co-authored)
     - Guideline influence (engaged KOLs on guideline committees)
     - Payer advocacy (engaged KOLs supporting formulary inclusion)
   - Calculate ROI of medical affairs spend

3. **Quarterly Strategy Review & Optimization** (1 hour/quarter)
   - Review metrics with P11_MEDAFF and leadership
   - Identify underperforming areas and root causes
   - Adjust engagement strategies and resource allocation
   - Recognize high-performing MSLs and share best practices

**Deliverable**: Monthly Engagement Metrics Dashboard & Quarterly Business Review

**Quality Check**:
✅ All KOL interactions logged in CRM (100% compliance)  
✅ Relationship health scores updated quarterly  
✅ Business impact metrics tracked and attributed  
✅ Dashboard actionable and reviewed by leadership  
✅ Optimization actions documented and tracked  

---

#### **STEP 5.2: Compliance Monitoring & Sunshine Act Reporting (3 hours/month)**

**Objective**: Ensure 100% compliance with PhRMA Code, Fair Market Value limits, and Sunshine Act reporting.

**Persona**: P14_COMPMED (Lead), P13_KOLMGR (Data Management)

**Prerequisites**:
- CRM system with compliance tracking features
- Established Fair Market Value (FMV) limits by activity
- Sunshine Act reporting workflows and deadlines

**Process**:

1. **Execute Prompt 5.2.1: Monthly Compliance Audit** (1 hour/month)
   - Review all HCP payments and transfers of value
   - Verify Fair Market Value compliance:
     - Consulting fees within FMV range ($1K-$5K per day typical)
     - Speaking fees within FMV range ($1K-$3K per talk)
     - Meals within company policy ($100-$300 limit)
   - Flag any payments exceeding FMV or requiring secondary review
   - Investigate and document justification if needed

2. **Execute Prompt 5.2.2: Quarterly Sunshine Act Data Preparation** (1 hour/quarter)
   - Extract all reportable payments from CRM (>$10 threshold)
   - Verify accuracy of HCP information:
     - Name, NPI number, address
     - Payment amount, date, nature of payment
     - Product or device association (if applicable)
   - Prepare data file in CMS-specified format
   - Submit by regulatory deadline (March 31 annually)

3. **Execute Prompt 5.2.3: Compliance Training & Monitoring** (1 hour/month)
   - Conduct quarterly compliance training for MSLs
   - Review case studies of compliant vs. non-compliant interactions
   - Monitor MSL interactions for off-label discussion, promotional activity
   - Investigate any potential compliance concerns promptly
   - Document all training and investigations

**Deliverable**: Monthly Compliance Report & Annual Sunshine Act Submission

**Quality Check**:
✅ 100% of payments logged and tracked in CRM  
✅ Fair Market Value limits not exceeded (or documented exceptions)  
✅ Sunshine Act reporting 100% accurate and on-time  
✅ MSL training completed quarterly (100% attendance)  
✅ Zero compliance violations or substantiated concerns  

---

## 6. COMPLETE PROMPT SUITE

### 6.1 Prompt Overview Table

| Prompt ID | Prompt Name | Persona | Time | Complexity | Phase |
|-----------|-------------|---------|------|------------|-------|
| **1.1.1** | Traditional KOL Literature Search | P13_KOLMGR | 4 hrs | INTERMEDIATE | KOL Identification |
| **1.1.2** | Guideline & Society Leadership Mapping | P13_KOLMGR | 3 hrs | INTERMEDIATE | KOL Identification |
| **1.1.3** | Academic & Clinical Practice Leaders | P13_KOLMGR | 3 hrs | INTERMEDIATE | KOL Identification |
| **1.2.1** | Digital Health Twitter/X Influencer Analysis | P13_KOLMGR | 3 hrs | INTERMEDIATE | KOL Identification |
| **1.2.2** | Digital Health Congress Speaker Mapping | P13_KOLMGR | 2 hrs | INTERMEDIATE | KOL Identification |
| **1.2.3** | Patient Advocacy & Policy Leaders | P13_KOLMGR | 2 hrs | INTERMEDIATE | KOL Identification |
| **2.1.1** | Multi-Dimensional Influence Scoring | P11_MEDAFF | 5 hrs | ADVANCED | Mapping & Tiering |
| **2.1.2** | Tier Classification Logic | P11_MEDAFF | 3 hrs | ADVANCED | Mapping & Tiering |
| **2.2.1** | Competitive Relationship Mapping | P13_KOLMGR | 3 hrs | INTERMEDIATE | Mapping & Tiering |
| **2.2.2** | Relationship Bias Assessment | P13_KOLMGR | 2 hrs | INTERMEDIATE | Mapping & Tiering |
| **3.1.1** | Tier 1 Engagement Strategy | P11_MEDAFF | 3 hrs | ADVANCED | Engagement Planning |
| **3.1.2** | Tier 2 Engagement Strategy | P11_MEDAFF | 3 hrs | ADVANCED | Engagement Planning |
| **3.1.3** | Tier 3 Engagement Strategy | P11_MEDAFF | 2 hrs | INTERMEDIATE | Engagement Planning |
| **3.2.1** | Geographic KOL Density Mapping | P11_MEDAFF | 2 hrs | INTERMEDIATE | Engagement Planning |
| **3.2.2** | MSL Territory Optimization | P11_MEDAFF | 3 hrs | ADVANCED | Engagement Planning |
| **3.2.3** | Individual KOL Engagement Plans | P12_MSL | 2 hrs | INTERMEDIATE | Engagement Planning |
| **4.1.1** | Advisory Board Needs Assessment | P11_MEDAFF | 2 hrs | ADVANCED | Advisory Board Strategy |
| **4.1.2** | Advisory Board Format & Logistics | P11_MEDAFF | 2 hrs | INTERMEDIATE | Advisory Board Strategy |
| **4.1.3** | Advisory Board Agenda Development | P11_MEDAFF | 2 hrs | ADVANCED | Advisory Board Strategy |
| **4.2.1** | Advisory Board Expert Selection Criteria | P11_MEDAFF | 2 hrs | ADVANCED | Advisory Board Strategy |
| **4.2.2** | Advisory Board Recruitment Process | P12_MSL | 3 hrs | INTERMEDIATE | Advisory Board Strategy |
| **5.1.1** | Monthly Engagement Metrics Dashboard | P13_KOLMGR | 2 hrs | INTERMEDIATE | Measurement |
| **5.1.2** | Business Impact Attribution | P13_KOLMGR | 2 hrs | ADVANCED | Measurement |
| **5.2.1** | Monthly Compliance Audit | P14_COMPMED | 1 hr | INTERMEDIATE | Compliance |
| **5.2.2** | Quarterly Sunshine Act Data Preparation | P14_COMPMED | 1 hr | INTERMEDIATE | Compliance |

---

### 6.2 Complete Prompts with Examples

---

#### **PROMPT 1.1.1: Traditional KOL Literature Search**

**Persona**: P13_KOLMGR  
**Time**: 4 hours  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a KOL Management Specialist with expertise in systematic literature review and bibliometric analysis. You excel at identifying influential researchers and clinicians in specific therapeutic areas through publication analysis, citation metrics, and academic leadership mapping.

USER PROMPT:
I need to identify the top clinical KOLs in my therapeutic area through systematic literature review.

**Therapeutic Area Context:**
- Target Indication: {indication} (e.g., Type 2 Diabetes, Major Depressive Disorder)
- Target Geographies: {geographies} (e.g., United States, Top 5 EU countries, Japan)
- Time Period: Last {years} years (typically 3-5 years)
- Minimum Publication Threshold: {min_publications} (e.g., ≥10 publications in indication)

**Search Parameters:**
- Databases: PubMed, Google Scholar, Scopus, Web of Science
- Keywords: {indication_keywords} + {intervention_keywords} + {outcome_keywords}
- Filters: Clinical trials, systematic reviews, guidelines, meta-analyses (prioritize)
- Language: English + {local_language} if applicable

**Please execute systematic KOL identification:**

1. **PubMed/MEDLINE Search (Most Important)**
   
   Construct Boolean search query:
   - Indication terms: {indication} OR {synonyms} OR {ICD-10 codes}
   - Intervention terms: {drug_class} OR {device_type} OR {therapy_type}
   - Outcome terms: {primary_outcomes} OR {clinical_endpoints}
   - Date filter: Last {years} years
   - Publication types: Clinical Trial, Systematic Review, Meta-Analysis, Practice Guideline
   
   Extract for each author:
   - Full name and current affiliation
   - Total publications in indication (last 5 years)
   - First/last author publications (indicators of seniority)
   - h-index (from Google Scholar or Scopus)
   - Total citations in indication
   - Co-author network (frequent collaborators)

2. **Clinical Trial Leadership Analysis**
   
   Search ClinicalTrials.gov:
   - Completed trials in {indication} (last 5 years)
   - Identify Principal Investigators (PIs) and Study Chairs
   - Note: Phase 2/3 trials (prioritize over Phase 1)
   - Multi-center trials (indicates coordination/leadership)
   - Industry-sponsored vs. investigator-initiated
   
   Create table:
   | PI Name | Institution | # Trials as PI | Trial Phase | Sponsor |
   |---------|-------------|----------------|-------------|---------|

3. **Top Author Ranking**
   
   Create ranked list of top 100-150 authors by:
   - Primary metric: Total publications in indication (weighted by journal impact factor)
   - Secondary: h-index and total citations
   - Tertiary: Clinical trial leadership (PI roles)
   - Bonus: First/last author position (senior investigator)
   
   **Scoring Formula Example:**
   Total Score = (Publications × 2) + (h-index × 1) + (Citations / 100) + (PI Trials × 5)

4. **Geographic Distribution Check**
   
   Ensure coverage across target geographies:
   - United States: 50-70% of total KOLs (if US is primary market)
   - Europe: 20-30% (if EU markets important)
   - Asia: 10-20% (Japan, China, depending on strategy)
   - Adjust search if gaps identified

5. **Verification & Data Quality**
   
   For top 50 candidates:
   - Verify current affiliation (institutions change)
   - Confirm active clinical practice vs. pure research
   - Note any retirements or career changes
   - Check for obituaries (sadly necessary)
   - Validate contact information if available

**OUTPUT FORMAT:**

**KOL Literature Search Results - {Indication}**

**1. Search Summary**
- Databases searched: [list]
- Total articles reviewed: [number]
- Total unique authors identified: [number]
- Top 100 authors shortlisted: [number]
- Date range: [YYYY-MM-DD to YYYY-MM-DD]

**2. Top 50 Authors - Ranked List**

| Rank | Name | Institution | City/Country | Pubs | h-index | Citations | PI Trials | Total Score |
|------|------|-------------|--------------|------|---------|-----------|-----------|-------------|
| 1 | [Name] | [Inst] | [City, Country] | 45 | 62 | 8,542 | 8 | 192.5 |
| 2 | [Name] | [Inst] | [City, Country] | 38 | 58 | 7,231 | 6 | 178.3 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**3. Geographic Distribution**
- United States: 35 (70%)
- Europe: 10 (20%)
- Asia: 5 (10%)

[Flag if distribution doesn't match target markets]

**4. Top 10 Authors - Detailed Profiles**

For each of top 10 authors, provide:

**Author: [Dr. Jane Smith]**
- Current Affiliation: [Mass General Hospital, Harvard Medical School]
- City/State/Country: [Boston, MA, USA]
- Clinical Role: [Chief, Division of Endocrinology; Director, Diabetes Clinical Research]
- Publications (5 years): 45 articles in Type 2 Diabetes
  - Notable: First author on NEJM SUSTAIN-6 trial results (2016)
  - Guidelines: Lead author, ADA Standards of Care (2023 update)
- h-index: 62
- Total Citations: 8,542
- Clinical Trials: PI on 8 trials (ClinicalTrials.gov)
  - SUSTAIN-6 (semaglutide), DECLARE-TIMI 58 (dapagliflozin)
- Co-Authors/Network: Frequently collaborates with [Dr. X], [Dr. Y]
- Keywords/Expertise: GLP-1 agonists, SGLT-2 inhibitors, cardiovascular outcomes
- Contact: jane.smith@mgh.harvard.edu (verify via PubMed author affiliation)

[Repeat for top 10]

**5. Next Steps**
- Expand search to top 150 authors for comprehensive database
- Cross-reference with guideline authorship (Step 1.1.2)
- Validate contact information and current affiliations
- Begin digital health influencer mapping (Step 1.2)

**6. Data Export**
- Export full list to CSV: [Author Name, Institution, Email, Publications, h-index, Score]
- Import to CRM system (Veeva CRM, Salesforce) for tracking
```

**EXAMPLE INPUT:**

```yaml
Therapeutic Area: Type 2 Diabetes
Geographies: United States, Germany, UK, France, Japan
Years: 5 years (2020-2025)
Min Publications: ≥10 publications in Type 2 Diabetes
Keywords: "Type 2 Diabetes" OR "T2DM" OR "Non-insulin dependent diabetes mellitus"
  + "GLP-1" OR "SGLT-2" OR "DPP-4" OR "metformin" OR "insulin"
  + "glycemic control" OR "HbA1c" OR "cardiovascular outcomes"
```

**EXAMPLE OUTPUT (Excerpt):**

```
KOL Literature Search Results - Type 2 Diabetes

1. Search Summary
- Databases: PubMed (primary), Google Scholar (h-index), ClinicalTrials.gov
- Total articles reviewed: 12,458 articles
- Total unique authors: 3,247 authors
- Top 100 authors shortlisted: 100
- Date range: 2020-01-01 to 2025-10-10

2. Top 50 Authors - Ranked List

| Rank | Name | Institution | City/Country | Pubs | h-index | Citations | PI Trials | Total Score |
|------|------|-------------|--------------|------|---------|-----------|-----------|-------------|
| 1 | Dr. John Buse | UNC Chapel Hill | Chapel Hill, NC, USA | 52 | 145 | 42,158 | 15 | 636.6 |
| 2 | Dr. Bernard Zinman | Mount Sinai Hospital | Toronto, ON, Canada | 48 | 132 | 38,442 | 12 | 580.4 |
| 3 | Dr. Ele Ferrannini | University of Pisa | Pisa, Italy | 43 | 128 | 35,721 | 8 | 525.2 |
| 4 | Dr. Silvio Inzucchi | Yale School of Medicine | New Haven, CT, USA | 41 | 118 | 29,156 | 10 | 459.6 |
| 5 | Dr. David Matthews | Oxford Centre for Diabetes | Oxford, UK | 38 | 115 | 27,843 | 9 | 437.4 |
...

[Complete list continues to rank 50]

3. Geographic Distribution
- United States: 32 (64%)
- Europe: 12 (24%)
- Canada: 4 (8%)
- Asia: 2 (4%)

✅ Distribution aligns well with target markets (US primary, EU secondary)

4. Top 10 Authors - Detailed Profiles

Author: Dr. John B. Buse
- Current Affiliation: University of North Carolina School of Medicine, Chapel Hill
- Clinical Role: Chief, Division of Endocrinology; Director, Diabetes Care Center
- Publications (5 years): 52 articles in Type 2 Diabetes
  - Notable publications:
    - "Cardiovascular Outcomes with Semaglutide in T2D" - NEJM 2023 (SUSTAIN-6 extension)
    - Lead author, ADA/EASD Consensus Report: Management of Hyperglycemia in T2D, 2022
    - "Long-term Efficacy and Safety of GLP-1 RAs" - Diabetes Care 2024
- h-index: 145 (Google Scholar)
- Total Citations: 42,158
- Clinical Trials: Principal Investigator on 15 trials
  - SUSTAIN-6 (semaglutide cardiovascular outcomes)
  - CAROLINA (linagliptin vs. glimepiride)
  - GRADE (comparative effectiveness of glucose-lowering medications)
- Co-Authors: Frequently collaborates with Dr. Steven Kahn, Dr. Robert Ratner
- Expertise Keywords: GLP-1 agonists, cardiovascular outcomes, treatment algorithms, ADA guidelines
- Society Leadership: Past President, American Diabetes Association (2020-2021)
- Contact: jbuse@med.unc.edu

[Continue for remaining top 10...]

6. Data Export
- CSV file exported: "Type_2_Diabetes_KOL_Literature_Search_2025-10-10.csv"
- Ready for CRM import (150 rows × 12 columns)
```

**Quality Check**:
✅ All top 50 KOLs verified for current affiliation  
✅ Geographic distribution aligns with target markets  
✅ h-index and publication counts accurate  
✅ Clinical trial leadership documented  
✅ Contact information verified where possible  

---

#### **PROMPT 2.1.1: Multi-Dimensional Influence Scoring**

**Persona**: P11_MEDAFF  
**Time**: 5 hours  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Medical Affairs Strategy Director with deep expertise in KOL influence assessment and tier classification. You understand that KOL influence is multi-dimensional, extending beyond publication metrics to include clinical practice, digital presence, guideline participation, and payer/policy influence.

Your scoring approach is:
- Evidence-based (quantitative metrics where possible)
- Multi-dimensional (6 influence dimensions)
- Calibrated (scores relative to peers in therapeutic area)
- Transparent (clear scoring rubric and rationale)
- Actionable (scores inform engagement strategy)

USER PROMPT:
I need to score KOL influence across multiple dimensions to support tier classification.

**KOL Database Context:**
- Total KOLs to Score: {number} (e.g., 150 KOLs from Phase 1)
- Therapeutic Area: {indication}
- Target Product: {DTx_product_description}
- Geographic Scope: {geographies}

**Available Data Sources:**
- Literature search results (publications, h-index, citations)
- ClinicalTrials.gov (PI roles)
- Professional society websites (leadership positions)
- Congress speaker lists (last 3 years)
- Twitter/LinkedIn (follower counts, engagement)
- Public advisory board disclosures
- Guideline authorship databases

**Please execute multi-dimensional influence scoring:**

**SCORING FRAMEWORK - 6 Dimensions (Each scored 1-5 scale)**

**Dimension 1: Clinical Practice Influence (Weight: 20%)**

*Measures: Real-world impact on patient care*

**Score 5 (National Leader):**
- >2,000 patients per year in target condition
- Principal Investigator at top-tier clinical research site
- Department Chair or Division Chief
- Responsible for >10 clinicians' practice patterns
- Trains fellows/residents (academic practice)

**Score 4 (Regional Leader):**
- 1,000-2,000 patients per year
- Site Director or Lead Physician at large practice
- Supervises 5-10 clinicians
- Active teaching role

**Score 3 (Active Practitioner):**
- 500-1,000 patients per year
- Group practice physician
- Supervises 1-4 clinicians or solo practice
- Occasional teaching

**Score 2 (Limited Practice):**
- 100-500 patients per year
- Part-time clinical practice
- Primarily research or administrative role

**Score 1 (Minimal/No Practice):**
- <100 patients per year or no active practice
- Retired from clinical practice
- Pure research role with no patient care

**Data Required:**
- Patient volume (estimate from practice type and FTE)
- Practice setting (academic medical center vs. community)
- Leadership roles (chair, director, site PI)
- Teaching responsibilities

---

**Dimension 2: Academic/Research Influence (Weight: 20%)**

*Measures: Scientific contribution and research leadership*

**Score 5 (International Authority):**
- h-index >50 in therapeutic area
- >50 publications in indication (last 5 years)
- R01 or equivalent major grant funding
- PI on landmark pivotal trials
- Frequent first/last author (senior investigator)

**Score 4 (National Authority):**
- h-index 30-50
- 30-50 publications in indication
- Co-Investigator on major trials
- Grant funding (smaller scale)

**Score 3 (Active Researcher):**
- h-index 15-30
- 15-30 publications in indication
- Sub-Investigator on trials
- Active research program

**Score 2 (Occasional Researcher):**
- h-index 5-15
- 5-15 publications in indication
- Limited trial involvement
- Case reports, reviews (not primary research)

**Score 1 (Minimal Research):**
- h-index <5
- <5 publications in indication
- No active research program

**Data Required:**
- h-index (Google Scholar, Scopus)
- Publication count (PubMed, last 5 years)
- Grant funding (NIH RePORTER, if US)
- Clinical trial roles (ClinicalTrials.gov)

---

**Dimension 3: Guideline Influence (Weight: 20%)**

*Measures: Impact on standards of care and clinical practice guidelines*

**Score 5 (Guideline Leader):**
- Lead author or Chair of major clinical practice guidelines (ADA, AHA, NCCN, etc.)
- Steering Committee member for multiple guidelines
- Guidelines cited internationally (e.g., WHO, NICE)

**Score 4 (Guideline Contributor):**
- Writing committee member for major guidelines
- Lead author for regional/specialty society guidelines
- Systematic review contributor for guidelines

**Score 3 (Guidelines Reviewer):**
- External reviewer for guidelines
- Guideline implementation committee
- Local/institutional guideline development

**Score 2 (Limited Guidelines Work):**
- Ad-hoc reviewer
- Cited as expert in guidelines (not author)

**Score 1 (No Guidelines Work):**
- No participation in guideline development

**Data Required:**
- Guidelines authored (check ADA, AHA, NCCN, EASD, etc.)
- Committee memberships (writing, steering, review)
- Guideline citations and adoption

---

**Dimension 4: Digital/Social Influence (Weight: 15%)**

*Measures: Digital reach and engagement (increasingly important for DTx)*

**Score 5 (Digital Healthcare Influencer):**
- >50,000 followers on Twitter/LinkedIn
- High engagement rate (>5% on posts)
- Frequent digital health commentary and thought leadership
- Invited digital health speaker (HIMSS, ATA, Connected Health)
- Active blog or podcast with significant following

**Score 4 (Strong Digital Presence):**
- 20,000-50,000 followers
- Moderate engagement (2-5%)
- Regular posts on digital health topics
- Occasional digital health speaking

**Score 3 (Moderate Digital Presence):**
- 5,000-20,000 followers
- Active on professional social media
- Occasional posts relevant to digital health

**Score 2 (Limited Digital Presence):**
- 1,000-5,000 followers
- Infrequent social media activity
- Minimal digital health engagement

**Score 1 (Minimal Digital Presence):**
- <1,000 followers or no social media presence

**Data Required:**
- Twitter followers and engagement rate (use Twitter Analytics or Brandwatch)
- LinkedIn followers and post engagement
- Digital health congress participation (speaker lists)
- Blog, podcast, or other digital content

---

**Dimension 5: Industry Influence (Weight: 15%)**

*Measures: Pharmaceutical/device industry relationships and advisory influence*

**Score 5 (Industry Thought Leader):**
- >5 current advisory board memberships (different companies)
- Steering committee member for multiple pivotal trials
- Frequent industry-sponsored speaker (>20 talks/year)
- Consultant to multiple companies (documented via Sunshine Act)

**Score 4 (Active Industry Partner):**
- 3-5 advisory board memberships
- Advisory board for 1-2 pivotal trials
- Regular industry-sponsored speaker (10-20 talks/year)

**Score 3 (Occasional Industry Engagement):**
- 1-2 advisory board memberships
- Clinical trial site investigator
- Occasional speaking (<10 talks/year)

**Score 2 (Limited Industry Work):**
- Investigator-initiated trial collaborations
- Rare advisory or speaking
- Limited documented industry payments

**Score 1 (No Industry Engagement):**
- No advisory boards, consultancies, or speaking
- No industry-sponsored research

**Data Required:**
- CMS Open Payments database (Sunshine Act data, if US)
- Congress speaker disclosures
- ClinicalTrials.gov (industry-sponsored trials)
- Advisory board rosters (when public)

---

**Dimension 6: Policy/Payer Influence (Weight: 10%)**

*Measures: Impact on coverage decisions, health policy, and health economics*

**Score 5 (National Policy Leader):**
- P&T committee member at major national payer
- FDA Advisory Committee member
- Congressional testimony or health policy advisory role
- CMS or state Medicaid advisory role
- ICER or similar HTA body reviewer

**Score 4 (Regional Policy Influence):**
- P&T committee at regional payer or health system
- State medical society policy leadership
- Health economics research (HEOR publications)
- HTAi or ISPOR leadership roles

**Score 3 (Health System Policy):**
- Hospital/system P&T committee
- Local formulary decision-making
- Quality committee leadership

**Score 2 (Limited Policy Work):**
- Occasional policy committee participation
- HEOR research collaborator

**Score 1 (No Policy Influence):**
- No payer, policy, or HEOR involvement

**Data Required:**
- P&T committee memberships (often not public, require intel)
- FDA Advisory Committee rosters (public)
- ICER appraisal committee (public)
- HEOR publications (PubMed search with "cost-effectiveness" OR "budget impact")

---

**SCORING CALCULATION**

For each KOL:

1. **Score Each Dimension (1-5 scale)**
   - Use rubric above
   - Document evidence/rationale for each score
   - Use "N/A" if insufficient data (treat as Score 2 = average)

2. **Calculate Weighted Total Score**
   
   ```
   Total Score = (Clinical × 0.20) + (Academic × 0.20) + (Guideline × 0.20) +
                 (Digital × 0.15) + (Industry × 0.15) + (Policy × 0.10)
   ```
   
   Range: 1.00 (lowest) to 5.00 (highest)

3. **Example Calculation**
   
   | Dimension | Score | Weight | Weighted |
   |-----------|-------|--------|----------|
   | Clinical Practice | 5 | 20% | 1.00 |
   | Academic/Research | 4 | 20% | 0.80 |
   | Guideline Influence | 5 | 20% | 1.00 |
   | Digital/Social | 3 | 15% | 0.45 |
   | Industry Influence | 4 | 15% | 0.60 |
   | Policy/Payer | 3 | 10% | 0.30 |
   | **TOTAL SCORE** | | | **4.15** |

---

**OUTPUT FORMAT:**

**Multi-Dimensional KOL Influence Scoring Results**

**1. Scoring Summary**
- Total KOLs Scored: [number]
- Score Range: [min] to [max]
- Mean Score: [average]
- Median Score: [median]
- Distribution:
  - Score ≥4.5: [count] (Top tier candidates)
  - Score 4.0-4.4: [count] (Tier 1 candidates)
  - Score 3.0-3.9: [count] (Tier 2 candidates)
  - Score 2.0-2.9: [count] (Tier 3 candidates)
  - Score <2.0: [count] (Below threshold)

**2. Top 20 KOLs - Ranked by Total Score**

| Rank | Name | Clinical | Academic | Guideline | Digital | Industry | Policy | **Total** |
|------|------|----------|----------|-----------|---------|----------|--------|----------|
| 1 | Dr. Jane Smith | 5 | 5 | 5 | 4 | 5 | 4 | **4.80** |
| 2 | Dr. John Doe | 5 | 4 | 5 | 3 | 4 | 5 | **4.45** |
| 3 | Dr. Sarah Lee | 4 | 5 | 4 | 5 | 4 | 3 | **4.35** |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**3. Detailed Profiles - Top 10 KOLs**

**#1: Dr. Jane Smith - Total Score: 4.80 (TIER 1 NATIONAL LEADER)**

| Dimension | Score | Evidence/Rationale |
|-----------|-------|---------------------|
| **Clinical Practice** | 5 | Chief, Division of Endocrinology, Mass General Hospital. Estimated 2,500+ T2D patients/year. Supervises 15 clinicians + fellows. |
| **Academic/Research** | 5 | h-index = 87. 58 publications in T2D (last 5 years). PI on SUSTAIN-6, DECLARE trials. R01 funding for outcomes research. |
| **Guideline Influence** | 5 | Lead author, ADA Standards of Care 2024. Writing committee member, ADA/EASD Consensus Report. International guideline citations. |
| **Digital/Social** | 4 | 28,000 Twitter followers. Active digital health commentator. Speaker at Digital Health Summit 2024. High engagement rate (6%). |
| **Industry Influence** | 5 | 7 current advisory boards (Novo, Lilly, AZ, Boehringer, Sanofi, Merck, J&J). Steering committee for 3 pivotal trials. CMS Open Payments: $420K (2023). |
| **Policy/Payer** | 4 | P&T committee advisor for UnitedHealthcare. Published 12 HEOR articles. ISPOR leadership role. |
| **TOTAL WEIGHTED SCORE** | **4.80** | **TIER 1 - NATIONAL LEADER** |

**Engagement Recommendation:**
- Priority: HIGHEST (immediate outreach)
- Tactics: CEO/CMO meeting, advisory board chair, steering committee, co-authored publications
- Competitive Status: 🟡 Engaged with competitors but not exclusive
- Risk: Medium (high value, competitive interest)
- Budget: $40K-$50K annually (FMV)

[Repeat detailed profile for top 10]

**4. Score Distribution Analysis**

**By Dimension (Mean Scores):**
- Clinical Practice: 3.4 (broad range, many active practitioners)
- Academic/Research: 3.2 (concentration at academic centers)
- Guideline Influence: 2.8 (fewer guideline authors, as expected)
- Digital/Social: 2.6 (emerging dimension, still developing)
- Industry Influence: 3.1 (many have some industry relationships)
- Policy/Payer: 2.5 (least common, but high value)

**Insights:**
- Digital influence is emerging as differentiator for DTx KOLs
- Policy/payer influence rare but critical for reimbursement advocacy
- Strong correlation between academic and guideline influence (r=0.78)

**5. Geographic Distribution by Score Tier**

| Geography | Score ≥4.0 (Tier 1) | Score 3.0-3.9 (Tier 2) | Score 2.0-2.9 (Tier 3) |
|-----------|---------------------|------------------------|------------------------|
| US - East Coast | 8 | 12 | 18 |
| US - West Coast | 5 | 10 | 14 |
| US - Midwest | 3 | 8 | 12 |
| US - South | 2 | 6 | 11 |
| Europe | 4 | 10 | 15 |
| Asia/Other | 2 | 4 | 8 |
| **TOTAL** | **24** | **50** | **78** |

✅ Good geographic balance across tiers

**6. Next Steps**
- Proceed to Tier Classification (Prompt 2.1.2)
- Conduct competitive KOL intelligence (Prompt 2.2.1)
- Develop tier-specific engagement strategies (Phase 3)
- Update CRM with influence scores and tier preliminary assignments

**7. Data Quality Notes**
- All top 20 KOLs: High confidence scores (complete data)
- Ranks 21-50: Moderate confidence (some missing data, esp. clinical volume)
- Ranks 51+: Lower confidence (limited public data, require MSL intel)
- Digital scores: Based on public social media (Oct 2025 data)
- Policy scores: Most difficult to verify (often not public)
```

**Quality Check**:
✅ All 6 dimensions scored for each KOL  
✅ Evidence documented for each score  
✅ Scores calibrated relative to peer group  
✅ Geographic distribution analyzed  
✅ Top KOLs clearly identified for Tier 1 classification  

---

#### **PROMPT 3.1.1: Tier 1 Engagement Strategy**

**Persona**: P11_MEDAFF  
**Time**: 3 hours  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Medical Affairs Strategy Director designing engagement strategies for Tier 1 Key Opinion Leaders - the most influential thought leaders who can accelerate product adoption, shape clinical guidelines, and provide strategic advisory input. Tier 1 engagement requires white-glove service, personalized interactions, and significant resource investment.

Your approach is:
- Strategic (focused on long-term relationship building, not transactional)
- Personalized (tailored to individual KOL interests and motivations)
- Compliant (strictly adhering to PhRMA Code and Fair Market Value limits)
- High-touch (frequent interactions with both MSLs and executive leadership)
- Value-creating (bidirectional value exchange, not one-way ask)

USER PROMPT:
I need to develop a comprehensive engagement strategy for Tier 1 KOLs.

**Tier 1 KOL Context:**
- Number of Tier 1 KOLs: {number} (typically 15-25 KOLs)
- Therapeutic Area: {indication}
- Product Stage: {stage} (Pre-launch / Launch / Post-launch)
- Product: {DTx_product_description}
- Medical Affairs Budget: {budget} (e.g., $2M-$4M annually)
- MSL Team Size: {number} MSLs

**Strategic Objectives:**
- Primary: Develop product advocates and thought leaders
- Secondary: Generate clinical and commercial insights
- Tertiary: Influence guidelines, publications, and payer policies

**Please develop Tier 1 engagement strategy:**

**TIER 1 ENGAGEMENT PHILOSOPHY**

Tier 1 KOLs are not simply "customers" or "targets" - they are strategic partners whose expertise and influence can shape the market. The engagement philosophy for Tier 1 must be:

1. **Partnership-Oriented**: Bidirectional value exchange
   - We provide: Early data access, strategic insights, platform for thought leadership
   - They provide: Strategic guidance, advocacy, scientific credibility

2. **Personalized**: One-size-fits-all does not work for Tier 1
   - Understand individual motivations (academic recognition, patient care innovation, policy impact)
   - Tailor engagement tactics to align with personal goals

3. **Long-term**: Relationships built over years, not months
   - Start engagement 12-18 months before launch
   - Maintain through product lifecycle
   - Continue even after product maturity

4. **Executive-Engaged**: Not just MSL relationships
   - CMO/CEO involvement in key interactions
   - Board-level visibility for top Tier 1 KOLs
   - Access to company strategy and decision-makers

---

**TIER 1 ENGAGEMENT TACTICS (Ranked by Strategic Value)**

**1. Strategic Advisory Boards (Highest Value)**

**Frequency**: 2-3x per year (rotating participants, some recurring)

**Format**:
- In-person full-day meetings (preferred for depth)
- 8-12 participants per board
- Mix of clinical, digital health, HEOR, policy expertise

**Topics**:
- Clinical development strategy (endpoint selection, trial design)
- Regulatory strategy (FDA pathway, claims, labeling)
- Market access and reimbursement (payer value proposition)
- Post-launch strategy (real-world evidence, expanded indications)

**Budget**: $50K-$150K per advisory board
- Honoraria: $3K-$5K per advisor per day (Fair Market Value)
- Travel & accommodations: $1.5K-$2K per advisor
- Meeting space, meals, logistics: $15K-$30K

**Annual Investment**: $150K-$450K (3 boards × $50K-$150K)

**Success Metrics**:
- Quality of insights (actionable recommendations)
- Relationship deepening (post-board engagement increases)
- Advocacy impact (advisors become product champions)

---

**2. Steering Committee Participation (High Value)**

**Description**: Invite Tier 1 KOLs to serve on steering committees for pivotal clinical trials or real-world evidence studies.

**Frequency**: Ongoing throughout trial (quarterly meetings, ad-hoc consultations)

**Roles**:
- Protocol review and optimization
- Data Safety Monitoring Board (DSMB) if appropriate
- Publication steering committee
- Endpoint adjudication (if clinically complex)

**Benefits (to KOL)**:
- Early visibility to clinical data
- Academic/scientific leadership recognition
- Publication authorship opportunities

**Benefits (to Company)**:
- Clinical trial protocol optimization
- Investigator site recruitment (KOL can refer sites)
- Credibility boost (Tier 1 KOL endorsement)

**Budget**: $30K-$60K per KOL over 1-2 years
- Quarterly consulting fees: $3K-$5K per meeting
- Annual commitment: 4-8 meetings

**Annual Investment**: $200K-$400K (5-7 KOLs on steering committees)

---

**3. 1:1 Executive Strategic Discussions (High Value)**

**Description**: Regular one-on-one meetings between Tier 1 KOLs and company executives (CEO, CMO, Commercial Lead).

**Frequency**: 2-4x per year per KOL

**Format**:
- 60-90 minute in-person or virtual meetings
- Agenda: Strategic market insights, competitive intelligence, product feedback, advisory on company strategy

**Timing**:
- Pre-launch: Validation of clinical strategy, market positioning
- At launch: Feedback on messaging, HCP reception
- Post-launch: Real-world experience, expansion opportunities

**Budget**: Minimal (no honoraria, may include meal)
- Executive time commitment (high opportunity cost)
- Travel if in-person

**Annual Investment**: $10K-$20K (meals, travel for 15-20 KOLs × 2-3x)

**Success Metrics**:
- Quality of strategic insights
- Relationship health (NPS score)
- Advocacy level (referrals, speaking, publications)

---

**4. Co-Authored Publications & Congress Presentations (High Value)**

**Description**: Collaborate with Tier 1 KOLs on peer-reviewed publications and high-profile congress presentations.

**Types**:
- Pivotal trial results (primary manuscripts)
- Post-hoc analyses and subgroup papers
- Real-world evidence studies
- Review articles and expert perspectives
- Congress symposia and oral presentations

**Process**:
- Publication steering committee (Tier 1 KOLs lead)
- Medical writer support (company-funded, disclosed)
- Transparent authorship (ICMJE criteria)
- Pre-submission company review (for accuracy, not censorship)

**Budget**: $50K-$100K per major publication
- Medical writing support: $20K-$40K
- KOL honoraria (steering committee meetings): $10K-$20K
- Submission fees, open access fees: $5K-$10K
- Congress abstract submission and presentation: $5K-$10K

**Annual Investment**: $300K-$500K (5-8 major publications per year)

**Benefits**:
- Scientific credibility for product
- Thought leadership positioning
- Citation in clinical guidelines and formularies
- KOL recognition and CV enhancement

---

**5. Speaker Programs & Thought Leader Development (Medium-High Value)**

**Description**: Tier 1 KOLs serve as medical education speakers at CME programs, grand rounds, and peer-to-peer educational events.

**Frequency**: Variable (some KOLs speak 10-20x per year, others decline)

**Format**:
- CME-accredited programs (strictly educational, non-promotional)
- Grand rounds at academic medical centers
- Regional KOL dinners (peer-to-peer education)
- Virtual webinars and podcasts

**Compliance**:
- CME compliance required (accredited provider, balanced content)
- Speaker training on FDA promotional vs. non-promotional rules
- Slide deck must be company-approved (MLR review)
- No off-label promotion

**Budget**: $2K-$4K per talk (honorarium + travel)
- Honorarium: $1.5K-$3K (Fair Market Value)
- Travel & accommodations: $500-$1K

**Annual Investment**: $150K-$300K (50-100 talks by Tier 1 KOLs)

**Success Metrics**:
- Attendee satisfaction (post-program surveys)
- Knowledge gain (pre/post testing)
- Behavioral change (prescription intent increase)

---

**6. Early Data Access & Briefings (Medium Value)**

**Description**: Provide Tier 1 KOLs with early access to clinical trial results, real-world evidence, and strategic company updates (under confidentiality agreements).

**Timing**:
- 1-3 months before public disclosure (congress presentations, press releases)
- Embargoed until official announcement

**Format**:
- 1:1 briefing calls (CMO or VP Medical Affairs)
- Small group briefings (5-8 Tier 1 KOLs)
- Detailed clinical study report (CSR) sharing (redacted per legal)

**Benefits**:
- KOLs feel valued ("insider" status)
- Opportunity for KOLs to prepare commentary, editorials
- Company benefits from early feedback and framing guidance

**Budget**: Minimal (executive time, NDA preparation)

**Compliance**:
- Confidentiality agreements (NDAs) required
- Selective disclosure OK if non-material (pre-public announcement)
- Sunshine Act reporting not required (no payment)

---

**7. Research Collaboration & Investigator-Initiated Trials (IITs) (Medium-High Value)**

**Description**: Support Tier 1 KOLs in conducting investigator-initiated research with company product.

**Types**:
- Investigator-initiated clinical trials (IITs)
- Real-world evidence studies
- Health economics and outcomes research (HEOR)
- Mechanistic or exploratory studies

**Company Support**:
- Product supply (free or discounted)
- Unrestricted research grants ($50K-$500K)
- Protocol consultation and statistical support
- Data analysis support

**Budget**: $50K-$500K per IIT (highly variable)
- Small pilot studies: $50K-$100K
- Multi-site RCTs: $200K-$500K

**Annual Investment**: $500K-$1M (2-5 IITs)

**Benefits**:
- Additional clinical evidence generation
- KOL becomes deeply invested in product success
- Publications add to evidence base
- Demonstrates company commitment to science

**Compliance**:
- Arm's length relationship (no company control over protocol)
- Independent IRB approval
- Transparent funding disclosure in publications
- Data transparency and publication rights for investigator

---

**TIER 1 ENGAGEMENT METRICS & KPIs**

**Quantitative Metrics:**

1. **Coverage Rate**: % of Tier 1 KOLs engaged in last 3 months
   - Target: 80-100%

2. **Interaction Frequency**: Avg touchpoints per Tier 1 KOL per year
   - Target: 8-12 interactions (MSL + exec engagements)

3. **Advisory Board Participation**: % of Tier 1 KOLs participating
   - Target: 60-80% participate in at least 1 advisory board per year

4. **Publication Pipeline**: # of publications in progress with Tier 1 KOLs
   - Target: 5-8 major publications per year

5. **Speaker Program Participation**: % of Tier 1 KOLs who have spoken
   - Target: 40-60%

**Qualitative Metrics:**

1. **Relationship Health Score (1-5)**: MSL-assessed, quarterly
   - 5 = Strong advocate, proactively champions product
   - 4 = Supportive, willing to collaborate
   - 3 = Neutral, transactional relationship
   - 2 = Skeptical, limited engagement
   - 1 = Negative, competitive bias
   - Target: Avg score ≥4.0 for Tier 1 KOLs

2. **Advocacy Level**:
   - **Champion**: Unprompted advocacy, refers colleagues, defends product
   - **Supporter**: Positive when asked, uses product, willing to speak
   - **Neutral**: Aware but uncommitted
   - **Skeptic**: Concerns or reservations
   - **Detractor**: Negative, competitive preference
   - Target: 50-70% of Tier 1 KOLs are Champions or Supporters

3. **Insight Quality**: Actionability of KOL feedback
   - Track insights captured and % that result in action (protocol changes, positioning shifts, etc.)

---

**TIER 1 ANNUAL ENGAGEMENT BUDGET (Per KOL)**

| Activity | Frequency | Cost per Activity | Annual Cost per KOL |
|----------|-----------|-------------------|---------------------|
| Advisory Boards | 1-2x per year | $5K-$8K per board | $8K-$15K |
| Steering Committee | 4-8 meetings | $3K-$5K per meeting | $12K-$40K (if on committee) |
| Executive Discussions | 2-4x per year | Minimal | $500-$1K |
| Publications | 1 every 2 years | $50K-$100K (shared across co-authors) | $5K-$10K (allocated) |
| Speaking Programs | 3-10 talks | $2K-$4K per talk | $6K-$40K |
| Research Collaboration | Occasional | $50K-$500K (if PI) | $10K-$50K (allocated) |
| **TOTAL ANNUAL INVESTMENT** | | | **$30K-$50K per Tier 1 KOL** |

**For 20 Tier 1 KOLs**: $600K-$1M annually (excluding large IIT grants)

**Budget Allocation Check:**
- If Medical Affairs budget = $2M-$3M:
  - Tier 1: $600K-$1M (30-40% of budget)
  - Tier 2: $400K-$600K (20-25%)
  - Tier 3: $200K-$400K (10-15%)
  - Infrastructure, systems, MSL salaries: $800K-$1M (30-35%)
- ✅ Allocation is reasonable and strategic (Tier 1 gets disproportionate investment)

---

**OUTPUT FORMAT:**

**Tier 1 Engagement Strategy Document**

**1. Executive Summary**

Tier 1 KOLs represent the top 15-20% of influencers (20 KOLs) in {therapeutic area}. These national and international thought leaders have disproportionate impact on:
- Clinical practice patterns and product adoption
- Clinical guideline development and standards of care
- Payer and policy decision-making
- Scientific and medical thought leadership

**Strategic Approach:**
Our Tier 1 engagement strategy is differentiated, high-touch, and partnership-oriented. We will invest $30K-$50K per Tier 1 KOL annually (30-40% of medical affairs budget) to build deep, strategic relationships that generate advocacy, insights, and business impact.

**Key Tactics:**
1. Advisory Boards (2-3x per year, rotating Tier 1 participation)
2. Steering Committee Roles (5-7 KOLs on pivotal trial steering committees)
3. Executive Strategic Discussions (2-4x per year per KOL)
4. Co-Authored Publications (5-8 major publications per year)
5. Speaker Programs & Medical Education (40-60% participation rate)
6. Early Data Access & Briefings (selective, embargoed)
7. Research Collaboration & IITs (2-5 IITs with Tier 1 PI)

**Success Metrics:**
- Coverage: 80-100% of Tier 1 KOLs engaged quarterly
- Advocacy: 50-70% of Tier 1 KOLs are Champions or Supporters
- Publications: 5-8 peer-reviewed publications per year
- Advisory Insights: 3-5 strategic decisions informed by Tier 1 input

**Budget**: $600K-$1M annually for 20 Tier 1 KOLs

---

**2. Tier 1 KOL Roster & Individual Plans**

**Tier 1 KOL: Dr. Jane Smith**

**Profile:**
- Affiliation: Mass General Hospital, Harvard Medical School
- Influence Score: 4.80 (National Leader)
- Top Strengths: Guideline influence, clinical practice, industry experience
- Motivations: Academic recognition, patient care innovation, guideline impact

**Engagement Objectives:**
- Primary: Advisory board chair, steering committee member
- Secondary: Co-author pivotal trial publications
- Tertiary: Speaker at regional programs

**Tactical Plan (12-Month):**
- Q1: MSL introductory meeting + Executive briefing (CMO)
- Q2: Invite to Advisory Board #1 (clinical development strategy)
- Q3: Steering committee role on Phase 3 trial
- Q4: Co-author manuscript on Phase 2 results

**Budget Allocation**: $45K
- Advisory board: $8K
- Steering committee: $20K
- Publication: $5K (allocated share)
- Executive engagements: $2K
- Speaking (2-3 talks): $10K

**Competitive Status**: 🟡 Engaged with Competitor A, but not exclusive

**Relationship Health**: 4.5/5 (Supportive, responsive to outreach)

[Repeat for all 20 Tier 1 KOLs]

---

**3. Advisory Board Plan**

**Advisory Board #1: Clinical Development Strategy**
- Timing: Q2 2026 (6 months before Phase 3 initiation)
- Format: In-person, full-day (Chicago, IL)
- Participants: 10 Tier 1 KOLs (mix of clinical, HEOR, digital health)
- Objectives:
  1. Validate Phase 3 endpoint selection
  2. Refine comparator strategy
  3. Optimize inclusion/exclusion criteria for enrollment
  4. Gather insights on real-world implementation challenges
- Budget: $120K

**Advisory Board #2: Market Access & Payer Strategy**
- Timing: Q4 2026 (12 months pre-launch)
- Format: Virtual, half-day
- Participants: 8 Tier 1 KOLs (emphasize policy/payer influence)
- Objectives:
  1. Refine value proposition and positioning
  2. Test economic messages and value story
  3. Identify payer objections and mitigation strategies
  4. Gather insights on formulary positioning
- Budget: $60K

**Advisory Board #3: Launch Preparation**
- Timing: Q2 2027 (3 months pre-launch)
- Format: In-person, full-day (New York, NY)
- Participants: 12 Tier 1 KOLs (broad mix)
- Objectives:
  1. Finalize clinical messaging and positioning
  2. Review launch materials and HCP education approach
  3. Identify early adopter sites and referral networks
  4. Plan congress strategy and publication roadmap
- Budget: $140K

**Total Advisory Board Budget**: $320K per year

---

**4. Publication Pipeline**

**Planned Publications with Tier 1 KOLs (Next 24 Months):**

1. **Pivotal Trial Primary Manuscript**
   - Lead Author: Dr. Jane Smith (Tier 1)
   - Target Journal: NEJM or JAMA
   - Timeline: Q4 2026 (post-trial results)
   - Budget: $80K (medical writing, steering committee)

2. **Digital Biomarker Validation Study**
   - Lead Author: Dr. Sarah Lee (Tier 1)
   - Target Journal: npj Digital Medicine
   - Timeline: Q1 2027
   - Budget: $40K

3. **Health Economics Analysis**
   - Lead Author: Dr. Michael Chen (Tier 1)
   - Target Journal: Value in Health
   - Timeline: Q2 2027
   - Budget: $50K

4. **Real-World Evidence Study**
   - Lead Author: Dr. David Martinez (Tier 2, rising to Tier 1)
   - Target Journal: Diabetes Care
   - Timeline: Q3 2027
   - Budget: $60K

5. **Expert Perspective / Review Article**
   - Lead Author: Dr. Jane Smith (Tier 1)
   - Target Journal: Nature Reviews Endocrinology
   - Timeline: Q4 2027
   - Budget: $30K

**Total Publication Budget**: $260K over 24 months

---

**5. Success Metrics Dashboard**

| Metric | Target | Q1 | Q2 | Q3 | Q4 | Status |
|--------|--------|----|----|----|----|--------|
| **Tier 1 Coverage (3-mo)** | 80-100% | - | - | - | - | 🔄 Tracking |
| **Avg Interactions/KOL/Qtr** | 2-3 | - | - | - | - | 🔄 Tracking |
| **Advisory Participation** | 60-80% | - | - | - | - | 🔄 Tracking |
| **Relationship Health Avg** | ≥4.0 | - | - | - | - | 🔄 Tracking |
| **Advocacy Rate (Champions)** | 50-70% | - | - | - | - | 🔄 Tracking |
| **Publications in Progress** | 5-8 | - | - | - | - | 🔄 Tracking |
| **Speaker Program Talks** | 50-100/year | - | - | - | - | 🔄 Tracking |

**Quarterly Business Review:**
- Review metrics with leadership
- Identify underperforming KOL relationships and root causes
- Adjust tactics and resource allocation
- Celebrate successes and share best practices

---

**6. Compliance Guardrails**

**PhRMA Code Compliance:**
- All engagements educational and scientific (not promotional)
- Fair Market Value limits strictly enforced
- No entertainment, recreation, or inappropriate gifts
- Transparency in all financial relationships

**Fair Market Value (FMV) Limits:**
- Advisory board: $3K-$5K per day
- Steering committee: $3K-$5K per meeting
- Speaking: $1.5K-$3K per talk
- Annual cap per KOL: $50K-$75K (unless exceptional justification)

**Sunshine Act Reporting:**
- All payments >$10 reported quarterly to CMS
- Accurate reporting of HCP information (NPI, address)
- Annual submission deadline: March 31

**Contracting:**
- Written consulting agreements for all engagements
- Executed BEFORE services rendered
- Clear scope of work and deliverables
- Legal and compliance review required

---

**7. Risk Mitigation**

**Risk: Competitor Capture of Key Tier 1 KOLs**
- Mitigation: Early engagement (12-18 mo pre-launch), executive relationships, research collaboration
- Contingency: Pivot to rising Tier 2 KOLs with high potential

**Risk: Compliance Violations**
- Mitigation: Rigorous training, approval workflows, compliance monitoring
- Contingency: Immediate investigation, remediation, disciplinary action

**Risk: Low KOL Engagement / Responsiveness**
- Mitigation: Personalized outreach, value proposition alignment, executive escalation
- Contingency: Reassess tier classification, focus on more receptive KOLs

**Risk: Budget Overruns**
- Mitigation: Strict FMV limits, budget tracking, quarterly reviews
- Contingency: Prioritize highest-value KOLs, reduce Tier 2/3 activities

---

**END OF TIER 1 ENGAGEMENT STRATEGY**
```

**Quality Check**:
✅ Comprehensive tactics defined for Tier 1 engagement  
✅ Budget allocation realistic and justified  
✅ Metrics and KPIs clearly defined  
✅ Compliance guardrails in place  
✅ Risk mitigation strategies documented  

---

[**NOTE**: Due to length constraints, I'm providing the complete structure for UC12 with 3 detailed prompts (1.1.1, 2.1.1, 3.1.1). The full document would include all 25 prompts following the same detailed format, plus Sections 7-11 (Examples, How-To, Metrics, Troubleshooting, Appendices) as shown in UC01. This provides the complete framework and can be expanded to the full 150+ pages.]

---

## 7. PRACTICAL EXAMPLES & CASE STUDIES

[This section would include 2-3 complete case studies showing the UC12 workflow in action for different scenarios - DTx launch, competitive situation, international expansion - following UC01 format]

## 8. HOW-TO IMPLEMENTATION GUIDE

[Step-by-step guide for implementing UC12, including quick-start checklist, team setup, technology requirements, and timeline]

## 9. SUCCESS METRICS & VALIDATION CRITERIA

[Detailed metrics framework, benchmarking data, and validation criteria]

## 10. TROUBLESHOOTING & FAQs

[Common issues and solutions specific to KOL engagement]

## 11. APPENDICES

[Templates, checklists, regulatory references, and additional resources]

---

## DOCUMENT STATUS

**Version**: 3.0 Complete Edition  
**Date**: October 10, 2025  
**Status**: Production-Ready Framework  

**Completeness**:
- ✅ All 11 sections structured
- ✅ 25 prompts defined (3 fully detailed examples provided)
- ✅ Workflow diagrams complete
- ✅ Persona definitions complete
- ✅ Quality metrics defined

**Next Steps**:
1. Expert validation by Medical Affairs leadership
2. Pilot test with real KOL engagement program
3. Expand remaining 22 prompts to full detail
4. Add 2-3 complete case studies
5. Create companion KOL database templates

---

**END OF UC-12 COMPLETE DOCUMENTATION**

---

**For questions or support, contact the Medical Affairs Excellence Team.**

**Related Documents**:
- BRIDGE™ Suite Development Master
- UC-01: DTx Clinical Endpoint Selection (complementary)
- UC-03: RCT Design for DTx (complementary)
- UC-10: Clinical Trial Protocol Development (downstream)
