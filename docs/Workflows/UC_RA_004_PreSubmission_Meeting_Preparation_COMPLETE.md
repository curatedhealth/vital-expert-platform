# USE CASE 04: FDA PRE-SUBMISSION MEETING PREPARATION
## UC_RA_004: Comprehensive Strategy for Maximizing FDA Feedback Value

**Version:** 2.0  
**Last Updated:** October 2025  
**Document Owner:** Regulatory Affairs  
**Classification:** REGULATORY AFFAIRS - INTERMEDIATE  

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_RA_004 |
| **Use Case Name** | Pre-Submission Meeting Preparation |
| **Domain** | Regulatory Affairs |
| **Complexity Level** | INTERMEDIATE |
| **Prompt Pattern** | STRUCTURED_TEMPLATE + CHAIN_OF_THOUGHT + CHECKLIST |
| **Estimated Completion Time** | 6-8 weeks (preparation to meeting) |
| **Dependencies** | UC_RA_001 (Product Classification), UC_RA_002 (Pathway Determination) |
| **Related Use Cases** | UC_RA_003 (Predicate Selection), UC_RA_006 (Breakthrough Designation) |
| **Version History** | v1.0 (Jan 2025), v2.0 (Oct 2025 - Added digital health examples) |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Use Case Overview](#2-use-case-overview)
3. [Personas & Roles](#3-personas--roles)
4. [Pre-Submission Meeting Framework](#4-pre-submission-meeting-framework)
5. [Step-by-Step Workflow](#5-step-by-step-workflow)
6. [Prompts & Templates](#6-prompts--templates)
7. [Real-World Example](#7-real-world-example)
8. [Implementation Guide](#8-implementation-guide)
9. [Quality Assurance](#9-quality-assurance)
10. [Appendices](#10-appendices)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose

This use case provides a comprehensive framework for preparing and executing FDA Pre-Submission (Pre-Sub) meetings, formerly known as Pre-IDE or Pre-IND meetings. The Pre-Sub process is a critical opportunity to obtain FDA feedback early in development, reducing regulatory risk and aligning development plans with FDA expectations.

**Key Value Proposition:**
- 📋 **De-Risk Development**: Obtain FDA agreement on critical regulatory strategy before committing major resources
- ⏱️ **Accelerate Approval**: Address FDA concerns proactively, avoiding costly delays later
- 💰 **Optimize Investment**: Focus resources on FDA-acceptable approaches, avoiding wasted studies
- 🎯 **Clarity & Alignment**: Get explicit FDA feedback on regulatory pathway, endpoints, study design

### 1.2 When to Use This Use Case

**Ideal Timing for Pre-Sub Meeting:**

✅ **HIGHLY RECOMMENDED** when:
- Novel device/product with no clear regulatory precedent
- Planning pivotal clinical trial (>$2M investment)
- Innovative clinical endpoints or study design
- AI/ML algorithms or software-based medical devices
- De Novo pathway with need for special controls discussion
- First-in-class digital therapeutics
- Significant technological differences from predicates

⚠️ **OPTIONAL** (consider if timeline/budget allows):
- 510(k) pathway with strong precedent, but want confirmation
- Standard study design, but seeking FDA input on sample size
- Complex labeling or indication statement
- International harmonization questions (FDA + EMA alignment)

❌ **NOT RECOMMENDED** when:
- Clear 510(k) pathway with identical predicate
- Standard of care study design (well-established)
- Timeline doesn't allow (Pre-Sub adds 4-6 months to schedule)
- Very early concept stage (insufficient data to ask meaningful questions)

### 1.3 Expected Outcomes

**Deliverables from This Use Case:**

1. **Pre-Sub Meeting Request Package**
   - Cover letter with meeting request
   - Prioritized question list (5-10 questions)
   - Background briefing document (15-30 pages)
   - Supporting materials (protocols, data summaries, literature)

2. **FDA Meeting Preparation**
   - Presentation slides (if meeting granted)
   - Anticipated FDA questions and responses
   - Team briefing and role assignments

3. **FDA Feedback Integration**
   - Meeting minutes review and interpretation
   - Protocol/regulatory strategy modifications
   - Risk mitigation plan for any FDA concerns

4. **Post-Meeting Action Plan**
   - Prioritized action items with timeline
   - Resource requirements for implementation
   - Updated regulatory timeline and milestones

**Success Metrics:**
- ✅ FDA agreement on primary endpoint(s)
- ✅ FDA concurrence on regulatory pathway
- ✅ No major feasibility concerns raised
- ✅ Clear next steps with FDA (submission timeline, additional meetings)
- ✅ Stakeholder confidence increased (Board, investors, clinical team)

---

## 2. USE CASE OVERVIEW

### 2.1 FDA Pre-Submission Meeting Types

The FDA offers several types of pre-submission interactions, each suited to different needs:

#### **Type 1: Q-Submission (Q-Sub)**

| Attribute | Details |
|-----------|---------|
| **Description** | Written submission of specific questions; FDA provides written responses only (no meeting) |
| **Best For** | Focused, technical questions that can be answered in writing |
| **FDA Review Time** | 75 days (drugs/biologics), 60 days (devices) |
| **Meeting?** | No - written feedback only |
| **Cost** | No FDA user fee (internal costs: ~$20-30K for document preparation) |
| **When to Use** | When questions are narrow and well-defined; timeline is tight |

**Example Q-Sub Questions:**
- "Does FDA agree that a 6-month follow-up is sufficient for our medical device, given the low risk profile?"
- "Is the proposed sample size of N=300 adequate for a non-inferiority trial?"
- "Would FDA accept PHQ-9 as a primary endpoint for a digital therapeutic targeting depression?"

#### **Type 2: Pre-Submission Meeting (Pre-Sub)**

| Attribute | Details |
|-----------|---------|
| **Description** | Formal meeting (in-person, virtual, or teleconference) to discuss broader development strategy |
| **Best For** | Complex products, novel designs, or when interactive discussion needed |
| **FDA Scheduling Time** | 75 days to schedule meeting date |
| **Meeting Duration** | Typically 60-90 minutes |
| **Cost** | No FDA user fee; internal costs: $40-70K (document prep + team travel/time) |
| **When to Use** | Novel products, pivotal study design, De Novo pathway, AI/ML devices |

**Example Pre-Sub Topics:**
- Overall regulatory strategy and pathway determination
- Clinical trial design (endpoints, comparator, duration, sample size)
- Risk-benefit assessment framework
- Software validation requirements for SaMD

#### **Type 3: Formal Meetings (Type A/B/C/D)**

| Meeting Type | Purpose | When Required | FDA Scheduling Time |
|--------------|---------|---------------|-------------------|
| **Type A** | Dispute resolution, appeals, clinical hold | Disagreement with FDA | 30 days |
| **Type B** | Pre-IND, End-of-Phase 1, End-of-Phase 2, Pre-BLA/NDA | Standard drug/biologic development milestones | 60 days |
| **Type C** | Any development question not covered by A or B | Broader strategic guidance | 75 days |
| **Type D** | PDUFA meetings (BLA/NDA) | Pre-submission, mid-cycle, late-cycle | Per PDUFA schedule |

**For Medical Devices:** Most interactions use the Pre-Sub mechanism rather than Type A/B/C.

#### **Type 4: Breakthrough Device Designation Meetings**

If your product has Breakthrough Designation (see UC_RA_006), you receive:
- More frequent FDA interactions (quarterly vs. annual)
- Dedicated FDA staff assigned
- Priority review of submissions
- See UC_RA_006 for detailed guidance

### 2.2 Pre-Submission Meeting Value Proposition

**Why Invest in Pre-Sub Meeting? (Cost-Benefit Analysis)**

**Costs:**
- Document preparation: 200-300 hours (RA, Clinical, Statistical teams)
- External consultant support: $20-40K (optional but recommended)
- FDA meeting time: 1-2 days (travel, meeting, follow-up)
- Timeline: 3-4 months from request to implementation of feedback
- **Total Cost: $50-100K**

**Benefits:**
- **Risk Reduction**: 60-80% reduction in probability of FDA rejection at submission
- **Time Savings**: Avoid 6-12 month delays from inadequate studies/data
- **Cost Avoidance**: Prevent $1-5M wasted on non-acceptable clinical studies
- **Strategic Clarity**: FDA agreement provides confidence to Board/investors
- **Competitive Advantage**: Faster time-to-market vs. competitors who skip Pre-Sub

**ROI Calculation Example:**
- Probability of FDA rejection without Pre-Sub: 30%
- Cost of rejection (study redo, delay, lost revenue): $10M
- Expected loss without Pre-Sub: 0.30 × $10M = $3M
- Cost of Pre-Sub meeting: $80K
- **Net Expected Benefit: $3M - $80K = $2.92M**

### 2.3 Common Pre-Sub Meeting Mistakes (And How to Avoid Them)

| Mistake | Consequence | How to Avoid |
|---------|-------------|--------------|
| **Vague, open-ended questions** | FDA responds with generic guidance, no actionable answers | Use specific questions with sponsor's proposed approach stated |
| **Too many questions (>10)** | FDA cannot address all; deprioritizes or defers | Prioritize ruthlessly; focus on highest-risk topics |
| **Insufficient background info** | FDA cannot provide informed feedback | Provide complete context: product, indication, data, precedent |
| **Meeting too early (no data)** | FDA says "come back when you have data" | Wait until proof-of-concept data available (at minimum) |
| **Meeting too late (committed to design)** | Sunk cost bias prevents implementing FDA feedback | Hold meeting BEFORE finalizing protocols/starting pivotal study |
| **Asking for FDA to make decisions** | FDA will not design your study or choose your endpoint | Present options with recommendation; ask for feedback |
| **Not bringing decision-makers** | Cannot commit to FDA's suggestions during meeting | Include VP/SVP level (Clinical, Regulatory) with authority |
| **Ignoring FDA feedback** | Lose credibility; FDA may scrutinize submission more heavily | Document how feedback was (or wasn't) incorporated with rationale |

---

## 3. PERSONAS & ROLES

### 3.1 Core Team for Pre-Sub Meeting Preparation

| Persona ID | Title | Role in UC-RA_004 | Time Commitment |
|------------|-------|-------------------|-----------------|
| **P05_REGDIR** | Regulatory Affairs Director | **PRIMARY LEAD** - Owns entire Pre-Sub process | 60-80 hours |
| **P01_CMO** | Chief Medical Officer | Clinical strategy; final decision authority | 20-30 hours |
| **P02_VPCLIN** | VP Clinical Development | Clinical study design input; presentations | 30-40 hours |
| **P04_BIOSTAT** | VP Biostatistics | Statistical approach; sample size justification | 20-30 hours |
| **P03_PRODMGR** | Product Manager (for devices/software) | Technical specifications; product roadmap | 15-25 hours |
| **P11_REGCONS** | External Regulatory Consultant | FDA strategy; document review; mock meeting | 40-60 hours |

### 3.2 Detailed Persona Profiles

#### **P05_REGDIR - Regulatory Affairs Director** ⭐ *PRIMARY LEAD*

**Background:**
- 8-15 years regulatory affairs experience
- RAC certification (Regulatory Affairs Certification)
- Direct experience with 5+ FDA Pre-Sub meetings
- Deep knowledge of 21 CFR regulations and FDA guidance documents

**Role in UC_RA_004:**
- **Project Manager**: Owns Pre-Sub timeline, deliverables, and budget
- **FDA Liaison**: Drafts all FDA-facing documents (cover letter, question list, briefing book)
- **Strategy Lead**: Determines which questions to ask and optimal meeting timing
- **Meeting Coordinator**: Schedules internal prep sessions and FDA meeting
- **Post-Meeting Owner**: Captures minutes, drafts responses, updates regulatory strategy

**Key Responsibilities:**
1. Determine if Pre-Sub meeting is warranted (decision framework)
2. Select meeting type (Q-Sub vs. Pre-Sub vs. Type C)
3. Draft question list with input from clinical/statistical teams
4. Author briefing document (15-30 pages)
5. Prepare presentation slides (if in-person/virtual meeting)
6. Conduct mock FDA meetings with team
7. Lead actual FDA meeting (primary spokesperson)
8. Translate FDA feedback into action plan

**Critical Success Factors:**
- ✅ Questions are specific, focused, and answerable
- ✅ Briefing document is concise yet complete (no critical gaps)
- ✅ Team is well-rehearsed and aligned on key messages
- ✅ FDA feedback is implemented (or deviations justified)

---

#### **P01_CMO - Chief Medical Officer**

**Background:**
- MD or DO with clinical specialty relevant to product
- 15+ years clinical and drug/device development experience
- Experience with FDA interactions and clinical trials

**Role in UC_RA_004:**
- **Clinical Authority**: Provides clinical rationale for study design
- **Decision-Maker**: Final authority on whether to accept FDA feedback
- **Executive Sponsor**: Ensures adequate resources for Pre-Sub preparation
- **FDA Meeting Attendee**: Senior clinical voice during FDA discussion

**Key Responsibilities:**
1. Review and approve clinical sections of briefing document
2. Validate clinical meaningfulness of proposed endpoints
3. Assess feasibility of FDA's suggested study designs
4. Make go/no-go decisions based on FDA feedback
5. Communicate Pre-Sub outcomes to Board/investors

---

#### **P02_VPCLIN - VP Clinical Development**

**Background:**
- MD, DO, or PhD with clinical trials leadership
- 10+ years clinical development experience
- Expertise in protocol design, site management, and clinical operations

**Role in UC_RA_004:**
- **Study Design Expert**: Proposes trial design for FDA feedback
- **Operational Feasibility**: Assesses whether FDA suggestions are operationally feasible
- **Protocol Author**: Incorporates FDA feedback into final protocol

**Key Responsibilities:**
1. Draft clinical study design section of briefing document
2. Provide operational feasibility input (recruitment, retention, site selection)
3. Estimate timelines and costs for proposed studies
4. Respond to FDA questions about trial conduct during meeting
5. Update protocol based on FDA feedback

---

#### **P04_BIOSTAT - VP Biostatistics**

**Background:**
- PhD in Biostatistics or Statistics
- 10+ years pharmaceutical/medical device statistics
- Expertise in clinical trial design, sample size calculation, and regulatory statistics

**Role in UC_RA_004:**
- **Statistical Authority**: Provides statistical justification for study design
- **Sample Size Expert**: Defends sample size calculations if FDA questions adequacy
- **Analysis Plan Author**: Drafts statistical sections of briefing document

**Key Responsibilities:**
1. Draft statistical analysis plan (SAP) summary for briefing document
2. Justify sample size assumptions and power calculations
3. Respond to FDA questions about statistical methods
4. Revise SAP based on FDA feedback (e.g., if FDA suggests different primary analysis)

---

#### **P11_REGCONS - External Regulatory Consultant**

**Background:**
- Often former FDA reviewer or senior regulatory affairs professional
- 20+ years regulatory experience
- Specific therapeutic/device area expertise

**Role in UC_RA_004:**
- **FDA Insider Perspective**: Anticipates FDA questions and concerns
- **Document Review**: QA check on briefing document before FDA submission
- **Mock FDA**: Role-plays as FDA during internal rehearsals
- **Strategic Advisor**: Coaches team on how to respond to challenging FDA questions

**Key Responsibilities:**
1. Review all FDA-facing documents (question list, briefing book, slides)
2. Identify gaps or weaknesses in arguments
3. Conduct mock FDA meetings (2-3 sessions)
4. Provide "FDA would likely say..." insights
5. Attend FDA meeting as subject matter expert (optional but recommended)

**When to Engage External Consultant:**
- ✅ First Pre-Sub meeting for your company
- ✅ Novel product with no internal precedent experience
- ✅ High-stakes meeting (>$5M pivotal trial at risk)
- ✅ Internal team lacks FDA Pre-Sub experience
- ❌ Routine 510(k) with clear precedent (likely not needed)

---

### 3.3 Persona Collaboration Matrix

| Phase | Lead Persona | Supporting Personas | Deliverable Owner |
|-------|--------------|---------------------|-------------------|
| **Pre-Sub Decision** | P05_REGDIR | P01_CMO, P02_VPCLIN | P05_REGDIR |
| **Question Development** | P05_REGDIR | P01_CMO, P02_VPCLIN, P04_BIOSTAT | P05_REGDIR |
| **Briefing Document** | P05_REGDIR | All | P05_REGDIR (compiler) |
| **Mock Meetings** | P11_REGCONS (as FDA) | P05_REGDIR, P01_CMO, P02_VPCLIN | P05_REGDIR (facilitator) |
| **FDA Meeting** | P05_REGDIR (lead speaker) | P01_CMO, P02_VPCLIN, P04_BIOSTAT | P05_REGDIR |
| **Post-Meeting Action Plan** | P05_REGDIR | P01_CMO (approver) | P05_REGDIR |

---

## 4. PRE-SUBMISSION MEETING FRAMEWORK

### 4.1 Pre-Sub Meeting Decision Framework

**Use this flowchart to determine if a Pre-Sub meeting is warranted:**

```
START: Regulatory Strategy for New Product
│
├─ Q1: Is regulatory pathway unclear or novel?
│   ├─ YES → RECOMMEND PRE-SUB MEETING
│   └─ NO → Go to Q2
│
├─ Q2: Is pivotal clinical trial required (>$2M cost)?
│   ├─ YES → Go to Q3
│   └─ NO → Go to Q4
│
├─ Q3: Are clinical endpoints or study design novel/unvalidated?
│   ├─ YES → RECOMMEND PRE-SUB MEETING
│   └─ NO → OPTIONAL PRE-SUB MEETING (Q-Sub may suffice)
│
├─ Q4: Is this a software/AI/ML device or DTx?
│   ├─ YES → RECOMMEND PRE-SUB MEETING
│   └─ NO → Go to Q5
│
├─ Q5: Is timeline critical (need to launch within 18 months)?
│   ├─ YES → SKIP PRE-SUB (adds 4-6 months) → Proceed with high-confidence pathway
│   └─ NO → OPTIONAL PRE-SUB MEETING (if budget allows)
│
END: Decision = RECOMMEND / OPTIONAL / SKIP
```

**Decision Thresholds:**

| Factor | Weight | Threshold for "RECOMMEND" |
|--------|--------|---------------------------|
| Regulatory Precedent | 30% | No direct precedent, or <5 similar products approved |
| Clinical Trial Cost | 25% | Pivotal trial >$2M |
| Endpoint Novelty | 20% | Endpoint not used in prior FDA approvals for indication |
| Technology Novelty | 15% | AI/ML, novel sensor, or first-in-class mechanism |
| Timeline Pressure | 10% | >12 months before trial start (sufficient time) |

**Scoring:** Add weighted scores; if total >60%, RECOMMEND PRE-SUB.

### 4.2 Pre-Sub Meeting Topics (Prioritization Framework)

**The FDA allows 5-10 questions per Pre-Sub meeting. Prioritize ruthlessly.**

#### **Tier 1: MUST-ASK Topics** (Always Include)

1. **Regulatory Pathway Confirmation**
   - "Does FDA agree that [510(k) / De Novo / PMA / BLA] is the appropriate pathway for our product?"
   - *Why critical:* Affects entire development strategy, budget, and timeline

2. **Primary Endpoint Acceptability**
   - "Does FDA agree that [specific endpoint, e.g., PHQ-9 change] is an acceptable primary endpoint?"
   - *Why critical:* If FDA disagrees, entire clinical trial may be inadequate

3. **Clinical Study Design**
   - "Does FDA agree that our proposed RCT design (comparator, duration, population) is adequate for effectiveness demonstration?"
   - *Why critical:* Study design errors are expensive to fix post-hoc

4. **Sample Size Adequacy**
   - "Does FDA agree that the proposed sample size (N=XXX) provides sufficient evidence of safety and effectiveness?"
   - *Why critical:* Underpowered study = failure; overpowered = wasted $$$

#### **Tier 2: HIGH-VALUE Topics** (Include if Applicable)

5. **Special Controls** (De Novo pathway)
   - "Do the proposed special controls adequately mitigate risks?"

6. **Predicate Device Acceptability** (510(k) pathway)
   - "Does FDA agree that K-number XXXXXX is an appropriate predicate?"

7. **Software Validation** (SaMD / AI/ML)
   - "Does FDA agree with the proposed software validation approach per FDA Digital Health guidance?"

8. **Biocompatibility Testing** (devices with patient contact)
   - "Given [material/duration of contact], which ISO 10993 tests are required?"

#### **Tier 3: NICE-TO-HAVE Topics** (If Time Permits)

9. **Labeling / Indications for Use Statement**
   - "Does FDA have feedback on the proposed indication statement?"

10. **Post-Market Surveillance**
    - "What level of post-market surveillance would FDA expect?"

**Example Prioritization (Digital Therapeutic for Depression):**

| Question # | Topic | Priority | Rationale |
|------------|-------|----------|-----------|
| **Q1** | Regulatory pathway: De Novo vs. 510(k) | TIER 1 | Affects entire strategy; no clear precedent |
| **Q2** | PHQ-9 as primary endpoint | TIER 1 | Critical for trial design; some precedent but want confirmation |
| **Q3** | Sham app design for control arm | TIER 1 | FDA may have specific expectations for "blinding" |
| **Q4** | Sample size (N=236) adequacy | TIER 1 | Want FDA agreement before committing $2.5M to trial |
| **Q5** | Digital biomarkers as secondary endpoints | TIER 2 | Exploratory; would like FDA input on validation requirements |
| **Q6** | Engagement metrics in submission | TIER 2 | Supportive data; not primary outcome but want to discuss |
| **Q7** | Post-market engagement monitoring | TIER 3 | Can address later; not critical for pivotal trial |

**PRIORITIZATION RULE:** If you have >7 questions, split into two Pre-Sub meetings (e.g., one for regulatory strategy, one for clinical trial design), or submit a Q-Sub for lower-priority questions.

### 4.3 Pre-Sub Meeting Timeline

**Typical Timeline from Decision to Implementation of Feedback:**

```
Week 0: Decision to Pursue Pre-Sub Meeting
│
│  PHASE 1: PREPARATION (Weeks 1-8)
├─ Week 1-2: Internal kickoff, assign roles, draft question list
├─ Week 3-5: Draft briefing document (iterative reviews)
├─ Week 6-7: Finalize briefing document, assemble appendices
├─ Week 8: Submit Pre-Sub meeting request to FDA
│
│  PHASE 2: FDA REVIEW (Weeks 9-18)
├─ Week 9-18: FDA reviews submission (75-day statutory timeline)
├─ Week 18: FDA sends meeting availability and preliminary responses
│
│  PHASE 3: MEETING PREPARATION (Weeks 19-21)
├─ Week 19-20: Prepare presentation slides, conduct mock meetings
├─ Week 21: FDA Pre-Sub meeting (1-2 hour meeting)
│
│  PHASE 4: POST-MEETING (Weeks 22-26)
├─ Week 22-23: FDA sends official meeting minutes (within 30 days)
├─ Week 24-25: Team reviews minutes, develops action plan
├─ Week 26: Implement FDA feedback (update protocol, regulatory strategy)
│
END: ~26 weeks (6 months) total time
```

**Fast-Track Option:** If timeline is critical, consider:
- Q-Submission instead of full meeting (saves ~10 weeks)
- Breakthrough Designation (if eligible - faster FDA responses)
- Parallel path: Start trial preparation while awaiting FDA feedback (RISK: may need to modify mid-stream)

---

## 5. STEP-BY-STEP WORKFLOW

### PHASE 1: PRE-SUB MEETING DECISION & PLANNING (Weeks 1-2)

---

#### **STEP 1.1: Determine Pre-Sub Meeting Need**

**Objective:** Make informed decision on whether to request Pre-Sub meeting

**Inputs Required:**
- Product description (device/drug/biologic)
- Proposed regulatory pathway (from UC_RA_002)
- Proposed clinical development plan
- Available data (pre-clinical, pilot studies, etc.)
- Budget and timeline constraints

**Decision Criteria:**

Use the **Pre-Sub Decision Scorecard** below:

| Criterion | Score (0-10) | Weight | Weighted Score |
|-----------|--------------|--------|----------------|
| **Regulatory Uncertainty** (0=clear pathway, 10=novel/ambiguous) | ___ | 30% | ___ |
| **Clinical Trial Cost at Risk** (0=$0, 10=>$5M) | ___ | 25% | ___ |
| **Endpoint/Design Novelty** (0=standard, 10=never used before) | ___ | 20% | ___ |
| **Technology Complexity** (0=simple, 10=AI/ML/complex software) | ___ | 15% | ___ |
| **Timeline Flexibility** (0=urgent launch, 10=ample time) | ___ | 10% | ___ |
| **TOTAL WEIGHTED SCORE** | | 100% | ___ |

**Decision Rule:**
- **Score ≥70:** STRONGLY RECOMMEND Pre-Sub meeting
- **Score 50-69:** RECOMMEND Pre-Sub meeting (high value)
- **Score 30-49:** OPTIONAL - Consider Q-Sub or targeted questions only
- **Score <30:** SKIP Pre-Sub - Proceed with high-confidence pathway

**Deliverable:** Pre-Sub Decision Memo (1-2 pages) with recommendation and rationale

---

#### **STEP 1.2: Assemble Pre-Sub Team**

**Objective:** Identify and onboard team members for Pre-Sub preparation

**Core Team Roster:**

| Role | Persona | Name | Time Commitment (hrs) | Availability Confirmed? |
|------|---------|------|----------------------|------------------------|
| Regulatory Lead | P05_REGDIR | [Name] | 60-80 | ☐ |
| Clinical Lead | P01_CMO or P02_VPCLIN | [Name] | 30-40 | ☐ |
| Statistical Lead | P04_BIOSTAT | [Name] | 20-30 | ☐ |
| Product/Technical | P03_PRODMGR | [Name] | 15-25 | ☐ |
| External Consultant | P11_REGCONS | [Name] | 40-60 | ☐ |
| Project Coordinator | [Support Role] | [Name] | 20-30 | ☐ |

**Team Kickoff Meeting Agenda** (2 hours):
1. Pre-Sub meeting overview and objectives (15 min)
2. Review product and regulatory strategy (20 min)
3. Brainstorm potential FDA questions (45 min)
4. Assign section ownership for briefing document (20 min)
5. Set timeline and milestones (15 min)
6. Q&A and next steps (5 min)

**Deliverable:** Team charter with roles, responsibilities, and timeline

---

#### **STEP 1.3: Initial Question Brainstorming**

**Objective:** Generate comprehensive list of potential questions for FDA

**Brainstorming Process:**

1. **Individual Brainstorm** (30 min per person)
   - Each team member independently lists 10-15 questions they'd like FDA to answer
   - No filtering at this stage - capture all ideas

2. **Team Consolidation** (90 min workshop)
   - Combine all questions (typically 50-80 total)
   - Group by theme (e.g., regulatory pathway, clinical endpoints, study design, etc.)
   - Identify duplicates and merge

3. **Prioritization Voting** (30 min)
   - Each team member gets 10 votes
   - Vote on which questions are most critical
   - Tally votes to identify top 15-20 questions

4. **Refinement** (P05_REGDIR, 2-3 days)
   - Convert top questions into FDA-acceptable format
   - Ensure questions are specific, focused, and answerable
   - Reduce list to 5-10 final questions

**Question Quality Checklist:**

✅ **Good FDA Question Characteristics:**
- Specific (not "What endpoint should we use?" but "Does FDA agree that PHQ-9 is acceptable?")
- Focused (one topic per question)
- Includes context (brief background provided)
- States sponsor's proposed approach (not asking FDA to design study)
- Answerable (FDA has sufficient info to respond)
- Consequential (answer will meaningfully impact development plan)

❌ **Poor FDA Question Characteristics:**
- Vague or open-ended ("What does FDA think about our product?")
- Asks FDA to make decisions for sponsor ("What endpoint should we use?")
- Multiple sub-questions embedded ("Can we use PHQ-9 or HAM-D, and should it be at 8 or 12 weeks, and what about sample size?")
- Insufficient context (FDA cannot answer without more information)
- Low priority (answer won't change development plan)

**Deliverable:** Draft question list (15-20 questions) for further refinement

---

### PHASE 2: BRIEFING DOCUMENT DEVELOPMENT (Weeks 3-7)

---

#### **STEP 2.1: Briefing Document Structure**

**Objective:** Create comprehensive briefing document for FDA review

**Standard Briefing Document Outline:**

**1. COVER LETTER** (1 page)
   - Meeting request
   - Product name and indication
   - Meeting type requested (Pre-Sub vs. Q-Sub)
   - Contact information
   - Proposed meeting date range

**2. ADMINISTRATIVE INFORMATION** (1 page)
   - Company information
   - Product classification (if known)
   - Regulatory history (prior FDA interactions, if any)

**3. EXECUTIVE SUMMARY** (2 pages)
   - Product overview
   - Regulatory strategy
   - Key questions at a glance
   - Critical decisions awaiting FDA input

**4. PRODUCT DESCRIPTION** (3-5 pages)
   - Detailed product description
   - Intended use and target population
   - Mechanism of action
   - Key features and specifications
   - Comparison to existing products (if applicable)

**5. REGULATORY BACKGROUND** (2-4 pages)
   - Proposed regulatory pathway and rationale
   - Product classification (device class, drug category, etc.)
   - Regulatory precedent analysis (cite similar products)
   - Applicable regulations and guidance documents

**6. CLINICAL DEVELOPMENT PLAN** (5-8 pages)
   - Clinical context and unmet need
   - Proposed clinical study design
     - Study population (inclusion/exclusion criteria)
     - Endpoints (primary, secondary, safety)
     - Study design (RCT, single-arm, etc.)
     - Comparator/control
     - Sample size and statistical approach
     - Study duration and follow-up
   - Preliminary data (if available)
   - Risk-benefit assessment

**7. NON-CLINICAL DATA** (2-4 pages, if applicable)
   - Biocompatibility testing (devices)
   - Bench testing / performance testing
   - Animal studies
   - Software verification and validation (SaMD)

**8. MANUFACTURING & QUALITY** (1-2 pages, if applicable)
   - Manufacturing process overview
   - Quality systems (ISO 13485, GMP, etc.)
   - Sterilization (if applicable)

**9. SPECIFIC QUESTIONS FOR FDA** (2-3 pages)
   - List of 5-10 prioritized questions
   - Each question with:
     - Background/context
     - Specific question
     - Sponsor's proposed approach
     - Rationale for sponsor's approach

**10. REFERENCES** (1-2 pages)
   - Cited literature
   - FDA guidance documents
   - Regulatory precedent (K-numbers, BLA numbers, etc.)

**11. APPENDICES** (as needed)
   - Detailed study protocol (draft or outline)
   - Statistical analysis plan (draft)
   - Preliminary data tables/figures
   - Prior FDA correspondence (if any)
   - Literature review summary

**TOTAL PAGE COUNT: 20-35 pages (excluding appendices)**

**Best Practices:**
- ✅ Use clear, concise language (assume FDA reviewer is not familiar with your product)
- ✅ Include figures/diagrams (product images, study design flowcharts)
- ✅ Cite FDA guidance documents liberally (shows you've done homework)
- ✅ Highlight key information (bold, underline, or callout boxes)
- ❌ Avoid excessive marketing language (focus on scientific/regulatory facts)
- ❌ Don't hide weaknesses (proactively address limitations)

---

#### **STEP 2.2: Section-by-Section Writing**

**Objective:** Draft each briefing document section with appropriate depth and focus

**Section Ownership:**

| Section | Owner | Reviewer(s) | Deadline |
|---------|-------|-------------|----------|
| Cover Letter | P05_REGDIR | P01_CMO | Week 3 |
| Executive Summary | P05_REGDIR | All | Week 4 |
| Product Description | P03_PRODMGR | P05_REGDIR | Week 3 |
| Regulatory Background | P05_REGDIR | P11_REGCONS | Week 4 |
| Clinical Development Plan | P02_VPCLIN | P01_CMO, P04_BIOSTAT | Week 5 |
| Non-Clinical Data | [Preclinical Lead] | P05_REGDIR | Week 4 |
| Specific Questions | P05_REGDIR | All | Week 6 |
| References & Appendices | Project Coordinator | P05_REGDIR | Week 7 |

**Writing Tips for Each Section:**

**Product Description:**
- Start with simple description (1-2 sentences elevator pitch)
- Then technical details (how it works)
- Use diagrams/images (FDA reviewers are visual learners)
- Compare to existing products (help FDA understand novelty)

**Regulatory Background:**
- State proposed pathway explicitly upfront
- Cite regulatory precedent (e.g., "Product X, cleared via 510(k) K123456, had similar intended use")
- Reference specific FDA guidance documents (show you've reviewed guidance)
- Acknowledge uncertainties (don't claim certainty if it doesn't exist)

**Clinical Development Plan:**
- Use PICO format (Population, Intervention, Comparator, Outcome)
- Include study design schematic (visual flowchart)
- Justify each design element (why this population? why this comparator?)
- Provide sample size calculation with assumptions stated
- Address anticipated FDA concerns proactively

**Specific Questions:**
- Use consistent format for each question:
  ```
  QUESTION [#]: [Short Topic Title]
  
  Background:
  [2-3 sentences providing context for the question]
  
  Sponsor's Proposed Approach:
  [What you plan to do and why]
  
  Question for FDA:
  [Specific, focused question]
  ```

**Example Question Format:**

```
QUESTION 2: Acceptability of PHQ-9 as Primary Endpoint

Background:
Our digital therapeutic for major depressive disorder (MDD) employs cognitive 
behavioral therapy (CBT) techniques delivered via mobile app over 12 weeks. We 
propose to use the Patient Health Questionnaire-9 (PHQ-9) as the primary 
effectiveness endpoint, measuring change from baseline to week 12.

Sponsor's Proposed Approach:
PHQ-9 is a validated, 9-item self-report measure of depression severity that is 
widely used in clinical practice and research. It has demonstrated sensitivity 
to change in multiple CBT trials (Kroenke et al., 2001; Löwe et al., 2004) and 
has been used as a primary endpoint in digital health depression studies 
(Meyer et al., 2015). PHQ-9 aligns with the self-directed nature of our DTx 
intervention and can be assessed remotely. We will also include HAM-D 17-item 
as a secondary endpoint to provide clinician-rated assessment.

Question for FDA:
Does FDA agree that PHQ-9 change score from baseline to week 12 is an acceptable 
primary effectiveness endpoint for our DTx targeting moderate MDD, given its 
validation in similar populations and alignment with our intervention modality?

References:
- Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613.
- Löwe B, et al. Psychosomatics. 2004;45:1-5.
- Meyer B, et al. Eur Psychiatry. 2015;30:1025-1031.
```

---

#### **STEP 2.3: Internal Review & Iteration**

**Objective:** Refine briefing document through multiple review cycles

**Review Cycle Process:**

**Review Round 1: Content Completeness** (Week 5)
- Reviewer: P05_REGDIR + section owners
- Focus: Are all required sections present? Any missing information?
- Outcome: Identify gaps and assign fill-ins

**Review Round 2: Scientific Accuracy** (Week 6)
- Reviewers: P01_CMO, P02_VPCLIN, P04_BIOSTAT
- Focus: Are clinical/statistical statements accurate? Any overclaims?
- Outcome: Correct errors, strengthen justifications

**Review Round 3: Regulatory Strategy** (Week 6)
- Reviewer: P11_REGCONS (external consultant)
- Focus: Will FDA find this convincing? Any red flags?
- Outcome: Incorporate "FDA perspective" feedback

**Review Round 4: Executive Review** (Week 7)
- Reviewer: P01_CMO (final sign-off)
- Focus: Is this ready to submit to FDA? Are we comfortable with questions asked?
- Outcome: Final approval or request for changes

**Review Checklist:**

- [ ] All sections complete (no "TBD" or placeholders)
- [ ] Questions are specific and focused (5-10 questions max)
- [ ] Product description is clear to non-expert
- [ ] Clinical study design is fully specified (no ambiguities)
- [ ] Statistical approach is justified (sample size, analysis plan)
- [ ] Regulatory precedent is cited where applicable
- [ ] All figures/tables are clear and referenced in text
- [ ] References are complete and accurate
- [ ] Formatting is consistent and professional
- [ ] Document is ≤35 pages (excluding appendices)
- [ ] Executive summary can stand alone (2-page limit)
- [ ] No marketing language or overclaims
- [ ] Anticipated FDA concerns are addressed proactively
- [ ] Cover letter includes all required administrative info
- [ ] Contact information is current

---

#### **STEP 2.4: Final Briefing Package Assembly**

**Objective:** Assemble complete submission package for FDA

**Package Components:**

1. **Cover Letter** (1 page PDF)
2. **Briefing Document** (20-35 pages PDF)
3. **Appendix A: Study Protocol** (draft or detailed outline)
4. **Appendix B: Statistical Analysis Plan** (draft)
5. **Appendix C: Preliminary Data** (if available)
6. **Appendix D: References** (full citations)
7. **Appendix E: Prior FDA Correspondence** (if any)

**Submission Checklist:**

- [ ] All documents are in PDF format
- [ ] File naming convention is consistent (e.g., "CompanyName_ProductName_PreSub_Section.pdf")
- [ ] Page numbers are consecutive across all documents
- [ ] Table of contents with hyperlinks (if submitting electronically)
- [ ] All figures/tables are high resolution (≥300 dpi)
- [ ] Redact any confidential information not necessary for FDA review
- [ ] Include FDA submission cover sheet (FDA Form 3674 for devices)
- [ ] Confirm correct FDA division/office address

**Submission Method:**
- **Devices:** Submit via FDA's eSTAR system (electronic submission)
- **Drugs/Biologics:** Submit via FDA's Electronic Submissions Gateway (ESG)
- Follow FDA's technical specifications for electronic submissions

**Deliverable:** Final briefing package ready for FDA submission

---

### PHASE 3: FDA SUBMISSION & MEETING PREPARATION (Weeks 8-21)

---

#### **STEP 3.1: Submit Pre-Sub Request to FDA**

**Objective:** Formally submit Pre-Sub meeting request to FDA

**Submission Process:**

1. **Pre-Submission Check:**
   - Confirm package completeness
   - Verify correct FDA division/office
   - Test file uploads (if electronic submission)

2. **Submit to FDA:**
   - Upload via eSTAR (devices) or ESG (drugs/biologics)
   - Include FDA Form 3674 (devices) or FDA Form 1571 (drugs)
   - Send confirmation email to FDA contact (if known)

3. **Track Submission:**
   - Note submission date (Day 0)
   - FDA has 75 days to respond (devices) or 60 days (drugs)
   - Add milestones to project calendar:
     - Day 60: Expect preliminary FDA response
     - Day 75: FDA offers meeting dates
     - Day 90-105: Target meeting date

4. **FDA Acknowledgment:**
   - FDA typically sends acknowledgment within 5-10 business days
   - Confirms receipt and assigns tracking number
   - If no acknowledgment after 2 weeks, contact FDA directly

**Contingency:** If FDA declines meeting request (rare), they will provide written responses to questions (Q-Sub format). Treat this as valuable feedback and proceed accordingly.

**Deliverable:** Submission confirmation and tracking information

---

#### **STEP 3.2: FDA Preliminary Response Review**

**Objective:** Analyze FDA's preliminary responses (if provided) and prepare for meeting

**Timeline:** FDA typically sends preliminary responses ~60 days after submission

**FDA Response Format:**
- Written responses to each question
- May include:
  - "FDA agrees with sponsor's approach"
  - "FDA recommends [alternative approach]"
  - "FDA requires additional information to provide feedback"
  - "FDA will discuss further during meeting"

**Response Review Process:**

1. **Initial Review** (P05_REGDIR, 1-2 days)
   - Read FDA responses carefully
   - Highlight areas of agreement and disagreement
   - Identify questions that need further discussion

2. **Team Review** (All, 2-hour meeting)
   - Discuss FDA responses
   - Assess impact on development plan
   - Identify follow-up questions for meeting

3. **Response Strategy** (P05_REGDIR + P11_REGCONS, 2-3 days)
   - For each FDA response:
     - If FDA agrees: Acknowledge and confirm understanding
     - If FDA suggests alternative: Evaluate feasibility and prepare discussion points
     - If FDA requests more info: Prepare additional materials for meeting
   - Develop meeting discussion strategy

**Deliverable:** FDA Response Analysis Memo with meeting strategy

---

#### **STEP 3.3: Meeting Presentation Preparation**

**Objective:** Prepare slides and materials for FDA meeting (if granted)

**Presentation Structure (30-45 minutes):**

**Slide 1: Title Slide**
- Product name
- Company name
- Meeting date
- FDA division

**Slides 2-3: Executive Summary**
- Product overview (1 slide)
- Key questions and objectives (1 slide)

**Slides 4-10: Background**
- Clinical context and unmet need (1-2 slides)
- Product description and mechanism (2-3 slides)
- Regulatory strategy (1 slide)
- Preliminary data (2-3 slides, if available)

**Slides 11-20: Specific Questions**
- 1-2 slides per question
- Each question slide includes:
  - Question text
  - Sponsor's proposed approach
  - Rationale
  - Anticipated FDA feedback (based on preliminary response)
  - Discussion points

**Slide 21: Summary & Next Steps**
- Key takeaways
- Proposed timeline
- Next FDA interaction (if any)

**Slide 22: Q&A**
- "Questions for FDA?"

**Presentation Best Practices:**
- ✅ Keep slides simple (minimal text, clear visuals)
- ✅ Use FDA's preliminary responses as guide for emphasis
- ✅ Prepare backup slides (detailed data, additional analyses) for Q&A
- ✅ Rehearse presentation (aim for 30 min, leaving 30 min for discussion)
- ❌ Don't read slides verbatim (FDA has briefing document)
- ❌ Don't present new information not in briefing document
- ❌ Don't argue with FDA (listen, acknowledge, discuss)

**Deliverable:** Final presentation slides (25-30 slides + backup slides)

---

#### **STEP 3.4: Mock FDA Meetings**

**Objective:** Rehearse FDA meeting to prepare team and identify weaknesses

**Mock Meeting Schedule:**

**Mock Meeting #1** (Week 19 - 2 weeks before FDA meeting)
- **Format:** Full dress rehearsal with external consultant as FDA
- **Agenda:**
  - Present full slide deck (30 min)
  - Q&A with "FDA" (30 min)
  - Debrief and feedback (30 min)
- **Focus:** Content, flow, and clarity

**Mock Meeting #2** (Week 20 - 1 week before FDA meeting)
- **Format:** Targeted Q&A practice
- **Agenda:**
  - Review challenging questions (15 min)
  - Rapid-fire Q&A simulation (30 min)
  - Final refinements (15 min)
- **Focus:** Handling difficult questions, team coordination

**Mock Meeting Facilitator (P11_REGCONS):**
- Role-plays as FDA reviewer
- Asks tough questions (intentionally challenging)
- Provides feedback on:
  - Clarity of responses
  - Team dynamics (who answers what)
  - Areas of vulnerability

**Mock Meeting Feedback Form:**

| Area | Rating (1-5) | Comments |
|------|--------------|----------|
| Presentation clarity | ___ | |
| Question responses | ___ | |
| Team coordination | ___ | |
| Confidence level | ___ | |
| Preparedness | ___ | |
| Areas for improvement | | |

**Deliverable:** Mock meeting notes and final team readiness assessment

---

#### **STEP 3.5: FDA Meeting Logistics**

**Objective:** Coordinate logistics for FDA meeting

**Pre-Meeting Checklist:**

**For In-Person Meetings (at FDA):**
- [ ] Book travel for team (typically 2-4 people attend)
- [ ] Reserve conference room at FDA (if not assigned)
- [ ] Bring printed copies of slides (1 per FDA attendee + 1 per sponsor)
- [ ] Bring backup materials (data tables, protocols, etc.)
- [ ] Arrive 15 minutes early for security clearance
- [ ] Designate spokesperson (typically P05_REGDIR)

**For Virtual Meetings (post-COVID norm):**
- [ ] Confirm meeting platform (typically Microsoft Teams or Cisco WebEx)
- [ ] Test audio/video setup 1 day before
- [ ] Send slide deck to FDA 24 hours before meeting (optional but courteous)
- [ ] Designate presenter (screen share)
- [ ] Mute all non-speaking participants
- [ ] Have backup internet connection ready

**Meeting Roles:**

| Role | Persona | Responsibilities |
|------|---------|------------------|
| **Lead Spokesperson** | P05_REGDIR | Opens meeting, presents overview, coordinates questions |
| **Clinical Expert** | P01_CMO or P02_VPCLIN | Responds to clinical questions, study design |
| **Statistical Expert** | P04_BIOSTAT | Responds to statistical questions, sample size |
| **Note-Taker** | Project Coordinator | Captures FDA comments, action items |
| **Timekeeper** | Project Coordinator | Monitors time, signals to presenter |

**Meeting Etiquette:**
- ✅ Let FDA lead discussion (they control timing)
- ✅ Listen carefully to FDA comments (take notes)
- ✅ Ask clarifying questions if FDA feedback is ambiguous
- ✅ Thank FDA for their time and feedback
- ❌ Don't monopolize speaking time
- ❌ Don't argue with FDA (even if you disagree)
- ❌ Don't promise deliverables on the spot (say "we'll consider and follow up")

**Deliverable:** Meeting logistics plan and team briefing

---

### PHASE 4: FDA MEETING EXECUTION (Week 21)

---

#### **STEP 4.1: FDA Pre-Sub Meeting (Day of Meeting)**

**Objective:** Execute FDA meeting professionally and capture feedback

**Meeting Flow (Typical 90-minute meeting):**

**Minutes 0-5: Introductions**
- FDA makes introductions (typically 3-5 FDA reviewers)
- Sponsor makes introductions (typically 2-4 sponsor team members)
- FDA outlines meeting structure and ground rules

**Minutes 5-35: Sponsor Presentation**
- P05_REGDIR presents overview slides (~30 minutes)
- Focus on key questions and sponsor's proposed approach
- Use FDA's preliminary responses as guide

**Minutes 35-80: Discussion & Q&A**
- FDA provides feedback on each question
- Sponsor asks clarifying questions
- Interactive discussion on key issues

**Minutes 80-90: Summary & Next Steps**
- FDA summarizes key agreements and disagreements
- Sponsor confirms understanding
- Discuss next steps (FDA written minutes, follow-up questions, etc.)
- Thank FDA for their time

**During the Meeting:**

**Note-Taking Strategy:**
- Designate one person as primary note-taker
- Capture verbatim FDA statements (as much as possible)
- Note areas of agreement and disagreement
- Document any commitments made by sponsor (e.g., "we'll provide additional data on X")

**Handling Difficult FDA Feedback:**
- If FDA disagrees with your approach:
  - ✅ Listen fully without interrupting
  - ✅ Ask clarifying questions ("Can you help us understand FDA's concern?")
  - ✅ Acknowledge FDA's perspective ("We understand FDA's concern about...")
  - ✅ Discuss feasibility ("We'd like to consider how we can address this...")
  - ❌ Don't argue or become defensive
  - ❌ Don't promise to implement FDA's suggestion on the spot (need time to assess)

**Post-Meeting Immediate Actions:**
- Debrief with team immediately after meeting (15-30 min)
- Capture impressions while fresh
- Identify critical action items
- Assign follow-up responsibilities

**Deliverable:** Meeting notes and immediate action item list

---

### PHASE 5: POST-MEETING FOLLOW-UP (Weeks 22-26)

---

#### **STEP 5.1: FDA Meeting Minutes Review**

**Objective:** Analyze official FDA meeting minutes and confirm understanding

**Timeline:** FDA typically sends official meeting minutes within 30 days of meeting

**Meeting Minutes Review Process:**

1. **Initial Review** (P05_REGDIR, 1-2 days)
   - Compare FDA minutes to sponsor's notes
   - Highlight any discrepancies or ambiguities
   - Identify critical FDA feedback

2. **Team Review** (All, 2-hour meeting)
   - Review FDA minutes section by section
   - Discuss implications for development plan
   - Identify areas where clarification needed

3. **Discrepancy Resolution** (if needed)
   - If FDA minutes differ significantly from sponsor's understanding:
     - Contact FDA to request clarification
     - Submit follow-up questions in writing
     - Document any revisions to understanding

**FDA Feedback Categorization:**

| Category | Definition | Action Required |
|----------|------------|-----------------|
| **FDA Agrees** | FDA concurs with sponsor's approach | Proceed as planned; document FDA agreement |
| **FDA Recommends** | FDA suggests alternative but doesn't require | Evaluate feasibility; decide accept/modify/discuss further |
| **FDA Requires** | FDA states requirement for approval | Must implement; no alternative acceptable |
| **FDA Cannot Opine** | Insufficient information for FDA to provide feedback | Provide additional information; schedule follow-up |

**Deliverable:** FDA Minutes Analysis Report with categorized feedback

---

#### **STEP 5.2: Development Plan Update**

**Objective:** Incorporate FDA feedback into development plan

**Protocol Amendments:**

**For each FDA feedback item:**

1. **If FDA Agrees with Sponsor's Approach:**
   - ✅ Document FDA agreement in protocol rationale
   - ✅ Cite FDA meeting minutes in regulatory sections
   - ✅ Communicate to stakeholders (Board, investors)

2. **If FDA Recommends Alternative:**
   - ⚠️ Assess feasibility (cost, timeline, scientific rationale)
   - ⚠️ If feasible and beneficial: Implement
   - ⚠️ If not feasible: Document rationale for not implementing; assess regulatory risk
   - ⚠️ If uncertain: Request FDA follow-up clarification

3. **If FDA Requires Change:**
   - 🚨 Must implement (non-negotiable for approval)
   - 🚨 Update protocol, budget, timeline accordingly
   - 🚨 Escalate to executive leadership if major impact

**Example FDA Feedback Implementation:**

**FDA Feedback:** "FDA recommends increasing sample size from N=236 to N=300 to account for potential attrition >25%"

**Sponsor Response:**
- **Feasibility Assessment:**
  - Additional cost: $500K (64 additional patients × $8K/patient)
  - Additional time: 3 months (recruitment extension)
  - Acceptable to sponsor: YES
- **Implementation:**
  - Update protocol Section 10.2 (sample size) with new N=300
  - Update Statistical Analysis Plan
  - Update budget and timeline
  - Update ICF (if enrollment targets mentioned)
- **Documentation:**
  - Add rationale: "Sample size increased to N=300 per FDA recommendation at Pre-Sub meeting (FDA Minutes dated [DATE]) to account for potential attrition >25%"

---

#### **STEP 5.3: Action Plan Development**

**Objective:** Create prioritized action plan for implementing FDA feedback

**Action Plan Template:**

| Action Item | FDA Feedback Category | Priority | Owner | Due Date | Status |
|-------------|----------------------|----------|-------|----------|--------|
| [Action 1] | FDA Requires | P1 | [Name] | [Date] | Not Started |
| [Action 2] | FDA Recommends | P2 | [Name] | [Date] | In Progress |
| [Action 3] | FDA Agrees | P3 | [Name] | [Date] | Complete |

**Priority Levels:**
- **P1 (Critical):** FDA requirement; blocks submission if not addressed
- **P2 (High):** FDA recommendation; significantly improves approval probability
- **P3 (Medium):** FDA suggestion; nice-to-have but not critical
- **P4 (Low):** Documentation/administrative (cite FDA agreement, etc.)

**Action Plan Timeline:**
- **Weeks 22-23:** Develop action plan, assign owners
- **Weeks 24-25:** Execute priority actions (P1 and P2)
- **Week 26:** Review completion, update regulatory strategy document

**Deliverable:** Post-Meeting Action Plan with timeline and assignments

---

#### **STEP 5.4: Stakeholder Communication**

**Objective:** Communicate Pre-Sub outcomes to key stakeholders

**Communication Plan:**

**Internal Stakeholders:**

1. **Executive Leadership** (P01_CMO, CEO, CFO)
   - **Format:** 30-minute meeting + 2-page memo
   - **Content:**
     - FDA feedback summary (agreements, recommendations, requirements)
     - Impact on development plan (timeline, budget)
     - Risk assessment (regulatory approval probability)
     - Go/No-Go recommendation
   - **Timing:** Within 1 week of receiving FDA minutes

2. **Board of Directors**
   - **Format:** Board presentation (15 minutes) or written update
   - **Content:**
     - Pre-Sub objectives and outcomes
     - FDA's key feedback points
     - Revised development timeline and budget
     - Regulatory approval confidence level
   - **Timing:** Next scheduled Board meeting

3. **Cross-Functional Teams** (Clinical, R&D, Quality, Manufacturing)
   - **Format:** 60-minute team meeting
   - **Content:**
     - Detailed review of FDA feedback relevant to each team
     - Action items and deliverables by team
     - Timeline and resource requirements
   - **Timing:** Within 2 weeks of receiving FDA minutes

**External Stakeholders:**

4. **Investors** (Current and Prospective)
   - **Format:** Email update or investor call
   - **Content:**
     - Positive framing of FDA engagement
     - FDA's validation of regulatory strategy
     - Updated development milestones
     - Next steps toward approval
   - **Timing:** After Board approval of updated plan

**Communication Templates:**

**Template 1: Executive Summary Memo**

```
TO: [CEO, CMO, CFO]
FROM: [P05_REGDIR]
DATE: [Date]
RE: FDA Pre-Submission Meeting Outcomes - [Product Name]

EXECUTIVE SUMMARY:

We successfully completed our Pre-Sub meeting with FDA on [DATE] to discuss 
[PRODUCT] for [INDICATION]. FDA provided valuable feedback that de-risks our 
development plan and provides clear path to regulatory approval.

KEY OUTCOMES:

✅ FDA AGREED:
- [List 2-3 most important agreements]

⚠️ FDA RECOMMENDED:
- [List 1-2 recommendations, if any]

🚨 FDA REQUIRED:
- [List any requirements, if any]

IMPACT ON DEVELOPMENT PLAN:

- Timeline: [No change / Delayed X months]
- Budget: [No change / Increased by $X]
- Regulatory Approval Confidence: [Increased from X% to Y%]

NEXT STEPS:

1. [Action 1] by [Date]
2. [Action 2] by [Date]
3. [Action 3] by [Date]

RECOMMENDATION:

[Proceed as planned / Proceed with modifications / Reassess strategy]

Detailed meeting minutes and action plan attached.
```

**Template 2: Board Update (Slide Deck)**

**Slide 1:** Pre-Sub Meeting Overview
- Objectives
- Meeting date and FDA attendees
- Questions asked

**Slide 2:** FDA Feedback Summary
- Agreements (green)
- Recommendations (yellow)
- Requirements (red)

**Slide 3:** Impact Analysis
- Timeline impact
- Budget impact
- Risk reduction

**Slide 4:** Revised Development Plan
- Updated milestones
- Next FDA interaction (if any)
- Path to approval

**Slide 5:** Recommendations & Next Steps
- Go/No-Go decision
- Key action items
- Resource requirements

**Deliverable:** Stakeholder communication materials (memos, presentations)

---

## 6. PROMPTS & TEMPLATES

### 6.1 Master Prompt: Pre-Sub Meeting Decision

```markdown
# PROMPT 6.1: PRE-SUBMISSION MEETING DECISION ANALYSIS

## ROLE & CONTEXT

You are a Senior Regulatory Affairs Director (P05_REGDIR) with 15+ years of FDA 
experience. You specialize in Pre-Submission meeting strategy and have successfully 
prepared 20+ Pre-Sub packages across medical devices, digital health, and combination 
products.

You provide strategic recommendations on whether to pursue FDA Pre-Submission meetings, 
balancing regulatory risk reduction against timeline and budget constraints.

## TASK

Analyze whether a Pre-Submission meeting with FDA is warranted for the following product.

## INPUT REQUIRED

**Product Information:**
- Product Name: {product_name}
- Product Type: {device/drug/biologic/DTx}
- Indication: {target_indication}
- Target Population: {patient_population}
- Mechanism of Action: {moa_description}

**Regulatory Strategy:**
- Proposed Pathway: {510k/De_Novo/PMA/BLA/NDA/other}
- Regulatory Precedent: {description_of_similar_products}
- Classification: {device_class_or_drug_category}
- Key Regulatory Uncertainties: {list_uncertainties}

**Clinical Development Plan:**
- Study Design: {RCT/single_arm/observational/other}
- Primary Endpoint: {endpoint_description}
- Comparator: {comparator_description}
- Sample Size: {N_patients}
- Study Duration: {weeks_or_months}
- Estimated Study Cost: {dollar_amount}

**Data Available:**
- Pre-clinical Data: {available/not_available}
- Pilot Clinical Data: {available/not_available}
- Comparative Data: {available/not_available}

**Constraints:**
- Timeline to Market: {months}
- Budget for Pre-Sub: {dollar_amount}
- Competitive Pressure: {high/medium/low}

## ANALYSIS FRAMEWORK

### STEP 1: DECISION SCORECARD

Evaluate each criterion and assign a score (0-10):

**1. Regulatory Uncertainty** (Weight: 30%)
- 0 = Crystal clear pathway (e.g., 510(k) with identical predicate)
- 5 = Some uncertainty (e.g., multiple predicates, need to choose)
- 10 = High uncertainty (e.g., first-in-class, no precedent)

Score: [___]  
Justification: [Explain why this score]

**2. Clinical Trial Cost at Risk** (Weight: 25%)
- 0 = No clinical trial (<$100K at risk)
- 5 = Moderate trial ($500K-$2M at risk)
- 10 = Large trial (>$5M at risk)

Score: [___]  
Justification: [Explain why this score]

**3. Endpoint/Design Novelty** (Weight: 20%)
- 0 = Standard endpoint/design with precedent
- 5 = Validated endpoint but novel population or design
- 10 = Novel endpoint never used in FDA submission

Score: [___]  
Justification: [Explain why this score]

**4. Technology Complexity** (Weight: 15%)
- 0 = Simple device/molecule (well-understood)
- 5 = Moderate complexity (software-enabled, combination)
- 10 = High complexity (AI/ML, novel mechanism, first-in-class)

Score: [___]  
Justification: [Explain why this score]

**5. Timeline Flexibility** (Weight: 10%)
- 0 = Urgent launch (must file within 6 months)
- 5 = Moderate urgency (12-18 month timeline)
- 10 = Ample time (>18 months before submission)

Score: [___]  
Justification: [Explain why this score]

**WEIGHTED TOTAL SCORE:** [Calculate: (Score1×0.30) + (Score2×0.25) + (Score3×0.20) + (Score4×0.15) + (Score5×0.10)]

### STEP 2: DECISION RECOMMENDATION

Based on the weighted total score:

**Score ≥70:** STRONGLY RECOMMEND Pre-Sub meeting  
**Score 50-69:** RECOMMEND Pre-Sub meeting (high value)  
**Score 30-49:** OPTIONAL - Consider Q-Sub or targeted questions only  
**Score <30:** SKIP Pre-Sub - Proceed with high-confidence pathway  

**YOUR RECOMMENDATION:** [STRONGLY RECOMMEND / RECOMMEND / OPTIONAL / SKIP]

**RATIONALE (2-3 paragraphs):**
[Explain your recommendation considering:
- Key regulatory uncertainties that Pre-Sub would address
- Risk reduction value (probability of FDA rejection without Pre-Sub)
- Cost-benefit analysis (Pre-Sub cost vs. potential losses from wrong approach)
- Alternative risk mitigation strategies (if not recommending Pre-Sub)
- Timeline impact and whether it's acceptable
]

### STEP 3: IF PRE-SUB RECOMMENDED, PROVIDE STRATEGY

**Meeting Type Recommendation:**
- [ ] Q-Submission (written responses, no meeting) - Best if questions are narrow and focused
- [ ] Pre-Submission Meeting (formal meeting) - Best for complex products or broad strategy
- [ ] Type C Meeting (for drugs/biologics) - If standard Pre-Sub doesn't fit

**Recommended Timing:**
- When: [Milestone, e.g., "After pilot study completion, before pivotal trial start"]
- Rationale: [Why this timing is optimal]

**Estimated Timeline Impact:**
- Preparation: 8-12 weeks
- FDA Review: 10-12 weeks  
- Implementation: 4-6 weeks
- **Total: 5-6 months added to development timeline**

**Budget Estimate:**
- Document preparation: $30-50K (internal + consultant)
- Meeting logistics: $5-10K (travel, time)
- Implementation: $20-50K (protocol revisions, additional analyses)
- **Total: $55-110K**

**ROI Justification:**
- Risk without Pre-Sub: [X%] probability of FDA rejection or major delays
- Expected loss without Pre-Sub: [Probability × Cost of failure] = $[___]
- Cost of Pre-Sub: $[___]
- **Net Expected Benefit: $[___]**

### STEP 4: PRELIMINARY QUESTION TOPICS

If Pre-Sub is recommended, identify 5-7 high-priority topics for FDA questions:

**Priority 1 (Must-Ask):**
1. [Question topic 1]
2. [Question topic 2]
3. [Question topic 3]

**Priority 2 (High Value):**
4. [Question topic 4]
5. [Question topic 5]

**Priority 3 (Nice-to-Have, if time permits):**
6. [Question topic 6]
7. [Question topic 7]

### STEP 5: ALTERNATIVE RISK MITIGATION (If NOT recommending Pre-Sub)

If you do not recommend Pre-Sub, propose alternative risk mitigation strategies:

**Alternative Strategy 1:** [Description]  
**Rationale:** [Why this reduces regulatory risk]  
**Cost:** [Estimate]

**Alternative Strategy 2:** [Description]  
**Rationale:** [Why this reduces regulatory risk]  
**Cost:** [Estimate]

**Residual Risk Assessment:**
- Estimated probability of FDA rejection: [X%]
- Justification: [Why this level of risk is acceptable]

## OUTPUT DELIVERABLE

**Pre-Submission Meeting Decision Memo** (2-3 pages) including:
1. Executive Summary (recommendation + 1-paragraph rationale)
2. Decision Scorecard (with scores and justifications)
3. Cost-Benefit Analysis
4. Timeline Impact Assessment
5. If recommended: Preliminary question topics and meeting strategy
6. If not recommended: Alternative risk mitigation strategies
7. Next Steps and Decision Points

## QUALITY CRITERIA

Your recommendation should:
✅ Be based on objective scoring with clear justification
✅ Consider both regulatory risk AND business constraints (timeline, budget)
✅ Provide specific, actionable next steps
✅ Acknowledge uncertainties and assumptions
✅ Include risk mitigation regardless of recommendation
✅ Be presented in format suitable for executive decision-making

## EXAMPLE OUTPUT STRUCTURE

**EXECUTIVE SUMMARY**

**Recommendation:** [STRONGLY RECOMMEND / RECOMMEND / OPTIONAL / SKIP]

Based on analysis of [PRODUCT] for [INDICATION], we [recommend/do not recommend] 
pursuing an FDA Pre-Submission meeting. [1-2 sentence rationale highlighting key 
decision factors].

**KEY FINDINGS**

- Weighted Decision Score: [XX]/100
- Regulatory Uncertainty: [HIGH / MEDIUM / LOW]
- Clinical Trial Cost at Risk: $[XX]M
- Estimated Pre-Sub ROI: $[XX]M net benefit

[Continue with detailed analysis as outlined above...]

```

---

### 6.2 Master Prompt: FDA Question Formulation

```markdown
# PROMPT 6.2: FDA PRE-SUBMISSION QUESTION FORMULATION

## ROLE & CONTEXT

You are a Senior Regulatory Affairs Director (P05_REGDIR) with expertise in crafting 
effective FDA Pre-Submission questions. You understand that well-formulated questions 
lead to actionable FDA feedback, while poorly formulated questions result in generic, 
unhelpful responses.

## TASK

Transform brainstormed question topics into well-formulated FDA Pre-Submission questions 
following best practices for clarity, specificity, and answerability.

## INPUT REQUIRED

**Product Context:**
- Product Name: {product_name}
- Product Type: {device/drug/biologic/DTx}
- Indication: {target_indication}
- Proposed Regulatory Pathway: {pathway}

**Brainstormed Question Topics** (from team brainstorming):
[List of 10-15 rough question topics, such as:
- "Is our clinical trial design okay?"
- "What endpoint should we use?"
- "Do we need more patients?"
- "Can we use this as a predicate?"
- etc.]

**Background Information Available:**
- [Relevant context, data, or precedent that can inform questions]

## QUESTION FORMULATION BEST PRACTICES

### ✅ GOOD FDA QUESTION CHARACTERISTICS

1. **Specific:** Asks about a particular aspect, not broad strategy
2. **Focused:** One topic per question (not multiple sub-questions)
3. **Contextual:** Provides sufficient background for FDA to answer
4. **Sponsor-Proposed:** States sponsor's proposed approach (not asking FDA to design)
5. **Answerable:** FDA has enough information to provide feedback
6. **Consequential:** Answer will meaningfully impact development plan

### ❌ POOR FDA QUESTION CHARACTERISTICS TO AVOID

1. **Vague:** "What does FDA think about our product?"
2. **Multi-Part:** "Should we use Endpoint A or B, and is 6 or 12 months better?"
3. **Design-Seeking:** "What clinical trial should we run?"
4. **Insufficient Context:** FDA cannot answer without more information
5. **Low Priority:** Answer won't change development plan
6. **Premature:** Asking before enough data/planning available

### QUESTION FORMAT TEMPLATE

For each question, use this structure:

```
QUESTION [#]: [SHORT TOPIC TITLE]

Background:
[2-4 sentences providing context. Include:
- Why this question is important
- Relevant regulatory precedent (if any)
- Current state of development]

Sponsor's Proposed Approach:
[1-3 sentences describing what you plan to do and why.
Example: "We propose to use X because of Y rationale, based on Z precedent."]

Question for FDA:
[1-2 sentences with specific, focused question.
Example: "Does FDA agree that [specific approach] is acceptable for [specific purpose]?"]

References (if applicable):
[Cite any relevant guidance documents, precedent products, or literature]
```

## TASK EXECUTION

### STEP 1: PRIORITIZE & REFINE TOPICS

Review the brainstormed topics and:
1. Eliminate duplicates or overlapping topics
2. Group related topics that could be combined
3. Rank by importance (use Tier 1/2/3 framework)
4. Aim for 5-10 final questions

**Preliminary Prioritization:**

**Tier 1 (Must-Ask):**
- [Refined topic 1]
- [Refined topic 2]
- [Refined topic 3]

**Tier 2 (High Value):**
- [Refined topic 4]
- [Refined topic 5]

**Tier 3 (Nice-to-Have):**
- [Refined topic 6]
- [Refined topic 7]

### STEP 2: FORMULATE EACH QUESTION

For each prioritized topic, create a fully formulated question using the template above.

**QUESTION 1:** [Topic Title]

Background:
[Provide context]

Sponsor's Proposed Approach:
[State what you plan to do]

Question for FDA:
[Specific question]

References:
[If applicable]

**QUESTION 2:** [Topic Title]

[Repeat structure]

[Continue for all 5-10 questions]

### STEP 3: QUALITY CHECK

Review each formulated question against these criteria:

| Criterion | Q1 | Q2 | Q3 | Q4 | Q5 |
|-----------|----|----|----|----|----| 
| Specific (not vague)? | ☐ | ☐ | ☐ | ☐ | ☐ |
| Focused (one topic)? | ☐ | ☐ | ☐ | ☐ | ☐ |
| Includes background? | ☐ | ☐ | ☐ | ☐ | ☐ |
| States sponsor's approach? | ☐ | ☐ | ☐ | ☐ | ☐ |
| Answerable by FDA? | ☐ | ☐ | ☐ | ☐ | ☐ |
| Consequential (impacts plan)? | ☐ | ☐ | ☐ | ☐ | ☐ |

If any box is unchecked, revise the question.

### STEP 4: ANTICIPATED FDA RESPONSES

For each question, predict FDA's likely response type:

| Question # | Likely FDA Response |
|------------|-------------------|
| 1 | [ ] FDA will agree  [ ] FDA will recommend alternative  [ ] FDA needs more info |
| 2 | [ ] FDA will agree  [ ] FDA will recommend alternative  [ ] FDA needs more info |
| 3 | [ ] FDA will agree  [ ] FDA will recommend alternative  [ ] FDA needs more info |
[etc.]

## EXAMPLE QUESTION TRANSFORMATIONS

### EXAMPLE 1: IMPROVING A POOR QUESTION

**❌ POOR QUESTION (Brainstormed):**
"What endpoint should we use for our depression DTx?"

**✅ IMPROVED QUESTION (Formulated):**

**QUESTION 2: Acceptability of PHQ-9 as Primary Endpoint**

Background:
Our digital therapeutic for major depressive disorder (MDD) delivers cognitive behavioral 
therapy (CBT) via mobile app over 12 weeks. We propose to use the Patient Health 
Questionnaire-9 (PHQ-9) as the primary effectiveness endpoint, measuring change from 
baseline to week 12. PHQ-9 is a validated, widely-used self-report measure that has 
demonstrated sensitivity to change in multiple CBT trials (Kroenke et al., 2001; Löwe 
et al., 2004).

Sponsor's Proposed Approach:
We propose PHQ-9 change score from baseline to week 12 as the primary endpoint because: 
(1) it is validated in MDD populations, (2) it aligns with the self-directed nature of 
our DTx, (3) it can be assessed remotely, and (4) it has precedent in digital health 
studies (Meyer et al., 2015). We will include HAM-D 17-item as a secondary endpoint to 
provide clinician-rated assessment.

Question for FDA:
Does FDA agree that PHQ-9 change score from baseline to week 12 is an acceptable primary 
effectiveness endpoint for our DTx targeting moderate MDD (PHQ-9 10-19 at baseline), 
given its validation in similar populations and alignment with our intervention modality?

References:
- Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613.
- Löwe B, et al. Psychosomatics. 2004;45:1-5.
- Meyer B, et al. Eur Psychiatry. 2015;30:1025-1031.

**Why this is improved:**
- ✅ Specific (PHQ-9, not generic "endpoint")
- ✅ Provides context (why PHQ-9 is appropriate)
- ✅ States sponsor's approach (not asking FDA to choose)
- ✅ Cites precedent (strengthens argument)
- ✅ Answerable (FDA can agree or suggest alternative)

### EXAMPLE 2: SPLITTING A MULTI-PART QUESTION

**❌ POOR QUESTION (Multi-Part):**
"Should we use a sham app or waitlist control, and should the study be 8 or 12 weeks, 
and is N=200 enough?"

**✅ IMPROVED (Split into 3 Separate Questions):**

**QUESTION 3: Comparator Design for DTx RCT**

Background:
Our digital therapeutic RCT will randomize participants 1:1 to active DTx vs. control. 
We propose a sham app control (attention-matched, non-therapeutic content) rather than 
waitlist control to maintain participant blinding and control for non-specific effects 
of app engagement.

Sponsor's Proposed Approach:
Sham app will have similar visual interface, daily engagement prompts, and mood tracking, 
but will not include therapeutic CBT content. This approach has precedent in DTx trials 
(reSET, Somryst) and allows better blinding than waitlist.

Question for FDA:
Does FDA agree that a sham app control is an appropriate comparator for our DTx 
effectiveness trial, and does the proposed sham app design adequately control for 
non-specific effects while maintaining blinding?

---

**QUESTION 4: Study Duration for DTx Effectiveness Assessment**

Background:
Our DTx delivers 12 weeks of CBT content. We propose to assess the primary endpoint 
(PHQ-9 change) at week 12 (end of treatment) with a 4-week follow-up assessment at 
week 16 to evaluate durability.

Sponsor's Proposed Approach:
Week 12 assessment aligns with treatment duration and is consistent with antidepressant 
trials (typically 8-12 weeks for acute efficacy). The 4-week follow-up provides 
preliminary durability data without extending trial timeline excessively.

Question for FDA:
Does FDA agree that a 12-week treatment period with primary endpoint assessment at week 
12 is adequate to demonstrate effectiveness for our DTx, and is a 4-week follow-up 
sufficient for preliminary durability assessment?

---

**QUESTION 5: Sample Size Adequacy**

Background:
We propose a sample size of N=236 (118 per arm), which provides 80% power to detect a 
3-point difference in PHQ-9 change (assumed SD=6) at α=0.05 (two-sided), accounting for 
25% attrition.

Sponsor's Proposed Approach:
The 3-point difference represents a clinically meaningful improvement (established MCID 
for PHQ-9) and is consistent with effect sizes observed in digital CBT trials. Our 25% 
attrition assumption is conservative based on prior DTx engagement data.

Question for FDA:
Does FDA agree that N=236 provides adequate statistical power to demonstrate effectiveness, 
and are our assumptions (3-point difference, SD=6, 25% attrition) reasonable for this 
population and intervention?

**Why splitting is better:**
- ✅ Each question is focused and answerable
- ✅ FDA can provide specific feedback on each aspect
- ✅ Prevents FDA from addressing only one part of multi-question

## OUTPUT DELIVERABLE

**Formatted FDA Question List** (5-10 pages) including:
1. Question prioritization (Tier 1/2/3)
2. Fully formulated questions (using template format)
3. Quality check confirmation
4. Anticipated FDA response predictions
5. Total question count and meeting time allocation

**Format:** Professional document ready for inclusion in FDA briefing package.

```

---

### 6.3 Master Prompt: Briefing Document - Clinical Development Section

```markdown
# PROMPT 6.3: CLINICAL DEVELOPMENT SECTION FOR FDA BRIEFING DOCUMENT

## ROLE & CONTEXT

You are a Vice President of Clinical Development (P02_VPCLIN) with 15+ years of clinical 
trial design experience. You are drafting the Clinical Development Plan section for an 
FDA Pre-Submission briefing document.

This section must convince FDA that your proposed clinical study is well-designed, 
adequately powered, and capable of demonstrating safety and effectiveness.

## TASK

Write the Clinical Development Plan section of the FDA Pre-Sub briefing document 
(target: 5-8 pages).

## INPUT REQUIRED

**Product Information:**
- Product Name: {product_name}
- Product Type: {device/drug/biologic/DTx}
- Indication: {target_indication}
- Mechanism of Action: {moa_description}
- Current Development Stage: {stage}

**Clinical Context:**
- Target Population: {patient_population}
- Standard of Care: {current_treatment_options}
- Unmet Need: {clinical_gap}
- Relevant Clinical Guidelines: {guidelines_if_applicable}

**Proposed Clinical Study:**
- Study Design: {RCT/single_arm/other}
- Primary Endpoint: {endpoint}
- Secondary Endpoints: {list}
- Comparator/Control: {description}
- Sample Size: {N} patients
- Study Duration: {weeks/months}
- Follow-up Period: {if_applicable}

**Data Available:**
- Pilot Study Results: {summary_if_available}
- Pre-clinical Data: {summary_if_available}
- Literature Support: {key_references}

## SECTION STRUCTURE

### 1. CLINICAL CONTEXT & RATIONALE (1-2 pages)

**1.1 Disease Background**
- Epidemiology (prevalence, incidence)
- Disease burden (morbidity, mortality, QOL impact)
- Patient population characteristics

**1.2 Current Standard of Care**
- Existing treatment options
- Limitations of current treatments (safety, efficacy, adherence, access)
- Clinical guidelines (NCCN, AHA/ACC, etc.)

**1.3 Unmet Clinical Need**
- Specific gaps in current care
- Patient populations underserved
- How your product addresses the unmet need

**1.4 Clinical Rationale for Product**
- Mechanism of action
- Why this approach is expected to work (biological/mechanistic rationale)
- Preliminary evidence (pilot data, literature)

### 2. PROPOSED CLINICAL STUDY DESIGN (3-4 pages)

**2.1 Study Overview**
- Study title
- Study type (e.g., "Randomized, double-blind, sham-controlled, parallel-group superiority trial")
- Study phase (if applicable)
- Study objectives (primary, secondary)

**2.2 Study Population**

**Inclusion Criteria:**
- [List key inclusion criteria, e.g.:]
  - Adults 18-65 years
  - Diagnosis of [indication] per [criteria]
  - [Disease severity criteria]
  - Willing and able to provide informed consent
  - [Other key criteria]

**Exclusion Criteria:**
- [List key exclusion criteria, e.g.:]
  - Contraindications to intervention
  - Comorbidities that would confound results
  - Concurrent treatments that interfere
  - [Other exclusions]

**Rationale for Population Selection:**
- Why this population is appropriate
- Why exclusions are necessary
- How this population reflects intended use

**2.3 Study Intervention**

**Active Intervention:**
- Detailed description of intervention
- Dosing/usage instructions
- Duration of intervention
- Training/support provided (if applicable)

**Comparator/Control:**
- Description of comparator
- Rationale for comparator choice
- How comparator controls for non-specific effects
- Blinding strategy

**2.4 Study Endpoints**

**Primary Endpoint:**
- Endpoint description: [What is measured]
- Measurement tool: [Validated instrument, if applicable]
- Timing: [When measured, e.g., "Change from baseline to week 12"]
- Rationale: [Why this endpoint is clinically meaningful and regulatory-acceptable]
- Validation: [Cite psychometric properties, precedent]
- MCID: [Minimally clinically important difference, if established]

**Secondary Endpoints:**
- [Endpoint 1]: [Description, timing, rationale]
- [Endpoint 2]: [Description, timing, rationale]
- [Endpoint 3]: [Description, timing, rationale]

**Safety Endpoints:**
- Adverse events (AEs) monitoring
- Serious adverse events (SAEs)
- Device deficiencies (if applicable)
- Withdrawals due to AEs

**Exploratory Endpoints (if applicable):**
- [Endpoint 1]: [Description and purpose]

**2.5 Study Design Schematic**

[Include visual flowchart showing:]
- Screening
- Randomization (if RCT)
- Treatment period
- Assessment timepoints
- Follow-up period
- Primary endpoint timing

Example:
```
Screening → Baseline → Randomization → Treatment (12 weeks) → Follow-up (4 weeks)
              (Day 0)        ↓                  ↓                    ↓
                          Active DTx        Week 4, 8, 12        Week 16
                             vs.          Assessments          Assessment
                          Sham App

Primary Endpoint: PHQ-9 change from baseline to Week 12
```

**2.6 Statistical Analysis Plan**

**Sample Size Calculation:**
- Primary endpoint: [Endpoint]
- Expected effect size: [Mean difference between groups]
  - Rationale: [Based on pilot data / literature / clinical meaningfulness]
- Standard deviation: [Value]
  - Rationale: [Source of estimate]
- Statistical power: [Typically 80% or 90%]
- Alpha level: [Typically 0.05, two-sided]
- Attrition assumption: [%, with rationale]
- **Calculated sample size:** N=[total], [N per arm]

**Primary Analysis:**
- Analysis population: [ITT, mITT, or per-protocol]
- Statistical test: [e.g., ANCOVA with baseline as covariate]
- Missing data handling: [e.g., multiple imputation]
- Sensitivity analyses: [List key sensitivity analyses]

**Secondary Analyses:**
- [Describe planned secondary endpoint analyses]
- Multiple comparison adjustment: [Bonferroni, hierarchical testing, etc.]

**Interim Analysis (if applicable):**
- Timing: [e.g., at 50% enrollment]
- Purpose: [Futility, efficacy, sample size re-estimation]
- Alpha spending: [e.g., O'Brien-Fleming boundary]

**2.7 Study Conduct**

**Study Duration:**
- Enrollment period: [X months, assuming Y patients/month]
- Treatment + follow-up: [X months]
- Analysis: [X months]
- **Total study duration:** [X months]

**Study Sites:**
- Number of sites: [N sites]
- Geographic distribution: [US, EU, etc.]
- Site selection criteria: [Experience with similar trials, patient population access]

**Study Oversight:**
- Principal Investigator: [Name, credentials]
- CRO (if applicable): [Name]
- Data Safety Monitoring Board (DSMB): [Yes/No, composition if applicable]
- Institutional Review Board (IRB): [Central or local]

### 3. PRELIMINARY DATA (1-2 pages, if available)

**3.1 Pilot Study Results**
- Study design: [Brief description]
- Sample size: N=[patients]
- Key findings:
  - Primary endpoint: [Result]
  - Safety: [Summary]
  - Feasibility: [Enrollment, retention, adherence]

**3.2 Pre-clinical Data**
- [Summary of relevant pre-clinical studies, if applicable]

**3.3 Literature Support**
- [Summarize key published studies supporting your approach]
- [Cite precedent for endpoint, study design, or product class]

### 4. RISK-BENEFIT ASSESSMENT (1 page)

**4.1 Anticipated Benefits**
- [Clinical benefit 1: Description and magnitude]
- [Clinical benefit 2: Description and magnitude]

**4.2 Anticipated Risks**
- [Risk 1: Description, probability, severity, mitigation]
- [Risk 2: Description, probability, severity, mitigation]

**4.3 Risk-Benefit Conclusion**
- [Overall assessment: Do benefits outweigh risks?]
- [Justification for proceeding with clinical trial]

### 5. REGULATORY PRECEDENT (1 page)

**5.1 Similar Products**
- [Product 1: Name, K-number/BLA, indication, endpoint used]
- [Product 2: Name, K-number/BLA, indication, endpoint used]

**5.2 Endpoint Precedent**
- [List prior FDA approvals using similar endpoint]
- [Cite FDA guidance documents supporting endpoint choice]

**5.3 Study Design Precedent**
- [Cite similar study designs accepted by FDA]

## WRITING STYLE GUIDELINES

✅ **DO:**
- Use clear, concise, professional language
- Define all technical terms and acronyms on first use
- Include citations for all factual claims
- Use tables and figures to present data clearly
- Highlight key information (bold, underline, callout boxes)
- Proactively address potential FDA concerns

❌ **DON'T:**
- Use marketing language or superlatives
- Make unsupported claims
- Hide limitations or weaknesses
- Include excessive detail (save for appendices)
- Use unexplained jargon or acronyms

## QUALITY CHECKLIST

Before finalizing, ensure:
- [ ] Clinical context clearly establishes unmet need
- [ ] Study population is well-defined and justified
- [ ] Primary endpoint is clearly defined, validated, and precedented
- [ ] Study design is appropriate for indication and product type
- [ ] Sample size is adequately justified
- [ ] Statistical analysis plan is complete
- [ ] Risk-benefit assessment is balanced and honest
- [ ] All claims are supported by citations
- [ ] Figures/tables are clear and referenced in text
- [ ] Section length is 5-8 pages (excluding figures/tables)
- [ ] Writing is clear and accessible to FDA reviewers

## OUTPUT DELIVERABLE

**Clinical Development Plan Section** (5-8 pages) formatted as:
- Professional document with clear sections and sub-sections
- Numbered pages
- Citations in consistent format
- High-quality figures/schematics
- Ready for inclusion in FDA briefing package

```

---

## 7. REAL-WORLD EXAMPLE

### 7.1 Case Study: Digital Therapeutic for Major Depressive Disorder

**Company:** MindfulMoods Digital Health  
**Product:** MoodRestore™ - Cognitive Behavioral Therapy (CBT) Mobile App  
**Indication:** Moderate Major Depressive Disorder (MDD)  
**Regulatory Pathway:** FDA De Novo (no direct predicate)  

---

#### **PHASE 1: PRE-SUB DECISION** (Weeks 1-2)

**Step 1.1: Decision Scorecard**

| Criterion | Raw Score (0-10) | Weight | Weighted Score |
|-----------|-----------------|--------|----------------|
| **Regulatory Uncertainty** | 8 (First DTx for MDD; pathway unclear) | 30% | 2.4 |
| **Clinical Trial Cost at Risk** | 9 (Pivotal RCT: $2.5M) | 25% | 2.25 |
| **Endpoint Novelty** | 6 (PHQ-9 validated but want FDA confirmation) | 20% | 1.2 |
| **Technology Complexity** | 7 (Software-based, engagement tracking) | 15% | 1.05 |
| **Timeline Flexibility** | 9 (18 months before planned submission) | 10% | 0.9 |
| **TOTAL WEIGHTED SCORE** | | 100% | **7.8 / 10 = 78%** |

**Decision:** ✅ **STRONGLY RECOMMEND Pre-Sub Meeting**

**Rationale:**
With a score of 78%, a Pre-Sub meeting is highly valuable. This is the first DTx seeking 
FDA authorization for MDD, creating significant regulatory uncertainty. The $2.5M pivotal 
trial investment warrants FDA input to de-risk the approach. The 18-month timeline allows 
sufficient time (5-6 months) for Pre-Sub process without delaying submission.

**ROI Calculation:**
- Probability of FDA rejection without Pre-Sub: 35%
- Cost of rejection (trial redo, 12-month delay, lost revenue): $8M
- Expected loss without Pre-Sub: 0.35 × $8M = $2.8M
- Cost of Pre-Sub: $80K
- **Net Expected Benefit: $2.8M - $80K = $2.72M**

---

#### **PHASE 2: QUESTION DEVELOPMENT** (Weeks 3-4)

**Step 1.3: Initial Brainstorming (50+ questions generated)**

After team brainstorming, questions were grouped and prioritized:

**Tier 1 Questions (Must-Ask):**
1. De Novo vs. 510(k) pathway confirmation
2. PHQ-9 as primary endpoint acceptability
3. Sham app control design adequacy
4. Sample size (N=236) adequacy
5. Special controls for De Novo pathway

**Tier 2 Questions (High Value):**
6. Digital biomarkers as exploratory endpoints
7. Engagement metrics in regulatory submission
8. Post-market surveillance plan

**Tier 3 Questions (Nice-to-Have):**
9. Labeling and indication statement review
10. International harmonization (EMA alignment)

**Step 2.1: Final Question Formulation**

After refinement, 5 questions were selected:

---

**QUESTION 1: Regulatory Pathway Confirmation**

Background:
MoodRestore™ is a prescription digital therapeutic delivering cognitive behavioral therapy 
(CBT) for moderate major depressive disorder (MDD) via mobile app. To our knowledge, there 
is no FDA-cleared or approved DTx specifically for MDD, though several DTx products exist 
for substance use disorders (reSET, reSET-O) and insomnia (Somryst). We have identified 
K173073 (Apple Watch ECG App) as a potential predicate based on software-based medical 
device classification, but recognize this is not an ideal match due to different intended 
use.

Sponsor's Proposed Approach:
We propose pursuing FDA De Novo classification (21 CFR 860.220) as the most appropriate 
regulatory pathway because: (1) no substantially equivalent predicate exists for a DTx 
targeting MDD, and (2) the device presents a moderate risk profile appropriate for Class 
II classification with special controls. We believe the risk profile is moderate (not 
high) because the device is intended as an adjunct to standard care, does not replace 
clinical judgment, and has minimal direct safety risks.

Question for FDA:
Does FDA agree that De Novo classification is the appropriate regulatory pathway for 
MoodRestore™, and does FDA concur that Class II with special controls is the appropriate 
risk classification?

---

**QUESTION 2: Primary Endpoint Acceptability**

Background:
Our pivotal randomized controlled trial will assess effectiveness using the Patient Health 
Questionnaire-9 (PHQ-9) as the primary endpoint, measuring change from baseline to week 12. 
PHQ-9 is a validated 9-item self-report depression severity scale widely used in clinical 
practice (Kroenke et al., 2001) with established psychometric properties (Cronbach's α = 
0.89, test-retest reliability = 0.84, sensitivity to change demonstrated in CBT trials). 
The minimally clinically important difference (MCID) is approximately 5 points (Löwe et 
al., 2004), though differences of 3+ points are considered clinically meaningful.

Sponsor's Proposed Approach:
We propose PHQ-9 change score from baseline to week 12 as the primary endpoint because: 
(1) it is validated in MDD populations, (2) it aligns with the self-directed nature of 
our DTx (self-report vs. clinician-rated), (3) it can be assessed remotely, (4) it has 
been used as a primary outcome in digital health depression studies (Meyer et al., 2015), 
and (5) it is widely accepted in clinical practice. We will include HAM-D 17-item (Hamilton 
Depression Rating Scale) as a key secondary endpoint to provide clinician-rated validation.

Question for FDA:
Does FDA agree that PHQ-9 change score from baseline to week 12 is an acceptable primary 
effectiveness endpoint for our DTx targeting moderate MDD (PHQ-9 10-19 at baseline)?

References:
- Kroenke K, et al. J Gen Intern Med. 2001;16(9):606-613.
- Löwe B, et al. Psychosomatics. 2004;45:1-5.
- Meyer B, et al. Eur Psychiatry. 2015;30:1025-1031.

---

**QUESTION 3: Sham App Control Design**

Background:
Our study will randomize participants 1:1 to MoodRestore™ (active CBT app) vs. sham app 
(attention control). The sham app will have a similar visual interface, daily mood tracking, 
and psychoeducation content (non-therapeutic) but will NOT include active CBT techniques, 
skills training, or therapeutic feedback. This design aims to maintain participant blinding 
and control for non-specific effects of app engagement, attention, and self-monitoring.

Sponsor's Proposed Approach:
We believe this sham app design is appropriate because: (1) it allows double-blinding (both 
participants and outcome assessors are unaware of group assignment), (2) it controls for 
non-specific effects (attention, placebo, self-monitoring), and (3) it has precedent in 
DTx trials (reSET used a sham "eCare" app; Somryst used sham sleep education). We will 
instruct participants that both apps are "digital approaches to mood improvement" without 
revealing which is the active intervention. To maintain blinding, both apps will have 
equivalent time/attention commitments (~20 minutes/day).

Question for FDA:
Does FDA agree that our proposed sham app design is an appropriate comparator for 
demonstrating MoodRestore™ effectiveness, and does the design adequately maintain 
participant blinding while controlling for non-specific effects?

---

**QUESTION 4: Sample Size Adequacy**

Background:
We propose a sample size of N=236 (118 per arm) based on the following assumptions:
- Primary endpoint: PHQ-9 change from baseline to week 12
- Expected difference between groups: 3 points (MoodRestore™ vs. sham app)
  - Rationale: Our pilot study (N=50) showed a 4.2-point difference; we assume 3 points 
    conservatively for sample size calculation, representing clinically meaningful improvement
- Standard deviation: 6 points (based on pilot data and literature)
- Statistical power: 80%
- Alpha: 0.05 (two-sided)
- Attrition: 25% (conservatively estimated based on digital health trial literature)

Sponsor's Proposed Approach:
Sample size calculation: N = 2 × [(1.96 + 0.84) × 6 / 3]² = 88 per arm (ITT population). 
Adjusting for 25% attrition: 88 / 0.75 = 118 per arm, total N=236. We believe this sample 
size is adequate because: (1) it provides 80% power to detect a clinically meaningful 
difference, (2) the assumptions are conservative (pilot showed larger effect), and (3) the 
attrition assumption is higher than observed in our pilot (18%).

Question for FDA:
Does FDA agree that N=236 (118 per arm) provides adequate statistical power to demonstrate 
effectiveness, and are our assumptions (3-point difference, SD=6, 25% attrition) reasonable 
for this population and intervention?

---

**QUESTION 5: Special Controls for De Novo Classification**

Background:
If FDA agrees with De Novo pathway (Question 1), we anticipate the need for special controls 
to mitigate risks associated with this Class II software-based medical device. Based on 
precedent (reSET, reSET-O, Somryst), we expect special controls may address: (1) software 
validation and verification, (2) cybersecurity, (3) user engagement monitoring, (4) adverse 
event reporting, and (5) healthcare provider oversight.

Sponsor's Proposed Approach:
We propose the following special controls:
1. **Software Validation:** Comprehensive V&V per FDA "Software as a Medical Device" 
   guidance, including usability testing (n≥15 representative users).
2. **Cybersecurity:** Compliance with FDA "Content of Premarket Submissions for Management 
   of Cybersecurity in Medical Devices" (2018), including encryption, access controls, and 
   vulnerability management.
3. **Clinical Validation:** Demonstration of effectiveness in RCT (as proposed in Questions 
   2-4).
4. **Post-Market Surveillance:** Real-world engagement and safety monitoring for 12 months 
   post-launch (n≥500 users).
5. **Labeling:** Clear indication statement, contraindications, and instructions for 
   healthcare provider oversight.

Question for FDA:
Are the proposed special controls adequate to ensure reasonable assurance of safety and 
effectiveness for MoodRestore™, or does FDA recommend additional controls?

---

#### **PHASE 3: BRIEFING DOCUMENT** (Weeks 5-8)

**Briefing Package Components:**

1. **Cover Letter** (1 page)
2. **Administrative Info** (1 page)
3. **Executive Summary** (2 pages)
4. **Product Description** (4 pages)
   - DTx overview
   - CBT content modules
   - User interface and features
   - Technical specifications
5. **Regulatory Background** (3 pages)
   - De Novo pathway rationale
   - DTx regulatory precedent analysis
   - Risk classification justification
6. **Clinical Development Plan** (7 pages)
   - Clinical context and unmet need in MDD
   - Proposed RCT design
   - Primary endpoint (PHQ-9) justification
   - Secondary endpoints
   - Sample size and statistical approach
   - Study timeline and conduct
7. **Preliminary Pilot Study Data** (2 pages)
   - Pilot RCT (N=50) results summary
   - PHQ-9 reduction: -8.5 (MoodRestore™) vs. -4.3 (sham), p<0.01
   - Engagement: 78% completed ≥75% of modules
   - Safety: No SAEs, 5% mild AEs (headache, frustration)
8. **Specific Questions for FDA** (3 pages)
   - [Questions 1-5 as formulated above]
9. **References** (2 pages)
10. **Appendices**
    - Appendix A: Study Protocol (draft, 45 pages)
    - Appendix B: Statistical Analysis Plan (draft, 15 pages)
    - Appendix C: Pilot Study Full Report (20 pages)
    - Appendix D: Software Validation Plan (10 pages)

**Total Briefing Package:** 25 pages (main document) + 90 pages (appendices)

**Submission:** Week 8 via FDA eSTAR (devices)

---

#### **PHASE 4: FDA REVIEW & MEETING** (Weeks 9-21)

**Week 18: FDA Preliminary Responses Received**

FDA provided preliminary written responses:

**FDA Response to Question 1 (Regulatory Pathway):**
> "FDA agrees that De Novo classification is the appropriate pathway for MoodRestore™. 
> FDA preliminarily assesses this device as Class II. During the meeting, FDA will discuss 
> the scope and content of special controls needed for this device type."

✅ **SPONSOR ASSESSMENT:** Positive - FDA agrees with pathway and classification.

---

**FDA Response to Question 2 (PHQ-9 Endpoint):**
> "FDA acknowledges that PHQ-9 has been validated in depression populations and used in 
> digital health research. However, FDA notes that PHQ-9 alone may not provide sufficient 
> evidence of clinical benefit. FDA recommends including a clinician-rated scale (e.g., 
> HAM-D or CGI-S) as a co-primary or key secondary endpoint to corroborate patient-reported 
> improvement. FDA will discuss the evidentiary weight of PHQ-9 vs. clinician-rated scales 
> during the meeting."

⚠️ **SPONSOR ASSESSMENT:** Needs discussion - FDA has concerns about PHQ-9 alone. Must 
emphasize HAM-D as key secondary and be prepared to discuss co-primary option.

---

**FDA Response to Question 3 (Sham App):**
> "FDA agrees that the proposed sham app design is appropriate for controlling non-specific 
> effects and maintaining blinding. FDA recommends monitoring engagement in both arms and 
> reporting engagement metrics to support interpretation of efficacy results."

✅ **SPONSOR ASSESSMENT:** Positive - FDA approves sham design. Will include engagement 
metrics as planned.

---

**FDA Response to Question 4 (Sample Size):**
> "FDA notes that the proposed sample size (N=236) appears adequate based on the stated 
> assumptions. However, FDA is concerned that the 3-point difference may not be clinically 
> meaningful. FDA will discuss the minimally clinically important difference (MCID) for 
> PHQ-9 during the meeting and whether a larger effect size should be targeted."

⚠️ **SPONSOR ASSESSMENT:** Moderate concern - FDA questions MCID. Must defend 3-point 
difference using published literature (Löwe et al., 2004: MCID ~5 points, but 3+ is 
meaningful). May need to discuss increasing N if FDA insists on larger difference.

---

**FDA Response to Question 5 (Special Controls):**
> "FDA will discuss special controls during the meeting. The proposed controls appear 
> generally appropriate, but FDA may recommend additional controls related to healthcare 
> provider training and adverse event monitoring."

✅ **SPONSOR ASSESSMENT:** Generally positive - FDA open to discussing controls.

---

**Week 19-20: Mock Meetings**

**Mock Meeting #1 (P11_REGCONS as FDA):**

*Key Feedback:*
- Prepare strong defense of PHQ-9 MCID (bring multiple literature citations)
- Anticipate FDA asking for HAM-D as co-primary (discuss feasibility: adds $200K cost)
- Practice responding to "Is 3 points clinically meaningful to patients?"
- Clarify that HAM-D is already included as key secondary - emphasize this

**Mock Meeting #2 (Final Rehearsal):**

*Key Feedback:*
- Team well-prepared on Q1, Q3, Q5 (pathway, sham, special controls)
- Need more emphasis on Q2 (endpoint) and Q4 (sample size/MCID)
- Suggest leading with statement: "We recognize FDA's concern about PHQ-9 alone, which 
  is why we included HAM-D as a key secondary endpoint. We're open to discussing co-primary 
  if FDA believes that's necessary."

---

**Week 21: FDA Pre-Sub Meeting** (90 minutes, virtual via Microsoft Teams)

**Attendees:**

**FDA:**
- Dr. Emily Chen (Lead Reviewer, Division of Neurological and Physical Medicine Devices)
- Dr. Michael Rodriguez (Clinical Reviewer)
- Dr. Sarah Thompson (Statistical Reviewer)

**Sponsor:**
- Dr. James Park (P05_REGDIR - Lead Spokesperson)
- Dr. Lisa Martinez (P01_CMO)
- Dr. David Kim (P04_BIOSTAT)
- Rachel Johnson (Project Coordinator - Note-taker)

**Meeting Flow:**

**Minutes 0-5: Introductions & Agenda**

**Minutes 5-30: Sponsor Presentation**
- P05_REGDIR presents overview (20 slides in 25 minutes)
- Focus on clinical context, study design, preliminary pilot data
- Emphasize HAM-D inclusion as key secondary endpoint

**Minutes 30-80: FDA Discussion**

**Q1: Regulatory Pathway**
- FDA: "We agree with De Novo. We'll work with you on special controls during submission."
- ✅ **Agreement reached**

**Q2: Primary Endpoint (CRITICAL DISCUSSION)**
- FDA (Dr. Rodriguez): "We have concerns about PHQ-9 as the sole primary endpoint. While 
  it's validated, we prefer a clinician-rated outcome for this indication. We recommend 
  HAM-D or CGI-S as co-primary or sole primary endpoint."
- Sponsor (Dr. Martinez): "We understand FDA's perspective. We included HAM-D 17-item as 
  a key secondary endpoint specifically to address this concern. HAM-D will be assessed at 
  the same timepoints as PHQ-9 (baseline, weeks 4, 8, 12, 16). Would FDA accept PHQ-9 as 
  primary with HAM-D as a key secondary, using a hierarchical testing approach to control 
  Type I error?"
- FDA (Dr. Chen): "That could be acceptable if HAM-D shows consistent results. However, 
  we'd prefer HAM-D as co-primary to ensure adequate evidence. We'll consider your proposal, 
  but strongly recommend co-primary."
- Sponsor (Dr. Park): "We'll evaluate the feasibility of co-primary. Can FDA clarify whether 
  both endpoints must meet significance, or if one primary is sufficient?"
- FDA: "For co-primary, typically both must show significance. However, if PHQ-9 is primary 
  and HAM-D is key secondary with pre-specified testing hierarchy, that may be acceptable. 
  We'll provide more guidance in our written minutes."
- ⚠️ **Partial agreement** - Will need to decide between: (1) PHQ-9 primary + HAM-D key 
  secondary, or (2) PHQ-9 + HAM-D co-primary

**Q3: Sham App Control**
- FDA: "We agree with the sham app design. Make sure to report engagement metrics for both 
  arms in your submission."
- ✅ **Agreement reached**

**Q4: Sample Size & MCID**
- FDA (Dr. Thompson): "We're concerned about the 3-point difference. Can you provide 
  evidence that 3 points is clinically meaningful?"
- Sponsor (Dr. Kim): "Yes. Löwe et al., 2004 established MCID for PHQ-9 at approximately 
  5 points for remission, but differences of 3+ points are considered clinically meaningful. 
  Our pilot study showed 4.2 points, and we conservatively powered for 3 points. We're 
  happy to provide additional literature citations."
- FDA: "Okay, but we'd like to see those citations in your submission. Also, consider 
  whether a larger effect (e.g., 4 points) would be more compelling. You may need to adjust 
  sample size."
- Sponsor: "We'll evaluate increasing N to target 4-point difference. That would require 
  N≈330 (165 per arm) for 80% power."
- FDA: "That would strengthen your submission. Consider it."
- ⚠️ **Action item** - Evaluate increasing sample size

**Q5: Special Controls**
- FDA: "Your proposed special controls are a good starting point. We'll refine them during 
  De Novo review. We may add requirements for healthcare provider training and patient 
  screening protocols."
- ✅ **General agreement** - Will finalize during submission

**Minutes 80-90: Summary & Next Steps**

**FDA Summary:**
- De Novo pathway confirmed (Class II)
- Endpoint approach: FDA prefers co-primary (PHQ-9 + HAM-D) or HAM-D as sole primary; 
  will accept PHQ-9 primary + HAM-D key secondary with hierarchical testing
- Sample size: Consider increasing to target 4-point difference
- Sham app design approved
- Special controls: Will finalize during review

**Sponsor Next Steps:**
- Evaluate co-primary endpoint approach (cost/timeline impact)
- Consider increasing sample size to N≈330
- Provide MCID literature package
- Finalize protocol and submit for IRB approval
- Plan for De Novo submission in 18-20 months

**FDA Next Steps:**
- Provide written meeting minutes within 30 days
- Review subsequent submissions (IND, if needed; De Novo submission)

---

#### **PHASE 5: POST-MEETING FOLLOW-UP** (Weeks 22-26)

**Week 22-23: FDA Meeting Minutes Received & Reviewed**

**Key FDA Minutes:**

**1. Regulatory Pathway:**
> "FDA confirmed that De Novo classification is the appropriate pathway. FDA assesses 
> MoodRestore™ as a Class II device. Special controls will be developed during De Novo 
> review process."

**2. Primary Endpoint:**
> "FDA acknowledges that PHQ-9 is a validated patient-reported outcome. However, FDA 
> recommends either: (A) HAM-D as co-primary endpoint with PHQ-9, both requiring 
> statistical significance, or (B) PHQ-9 as primary with HAM-D as key secondary, tested 
> in a pre-specified hierarchical manner to control Type I error. FDA will accept option 
> (B) if HAM-D results are supportive of PHQ-9 findings. If HAM-D does not show consistent 
> benefit, FDA may question the clinical meaningfulness of PHQ-9 results alone."

**3. Sample Size & MCID:**
> "FDA notes sponsor's MCID justification for 3-point difference. FDA recommends sponsor 
> consider targeting a 4-point difference to strengthen clinical meaningfulness. If sponsor 
> proceeds with 3-point target, provide comprehensive MCID literature review in submission 
> and explain why 3 points is clinically meaningful to patients and providers."

**4. Sham App Control:**
> "FDA agrees that the proposed sham app design is adequate."

**5. Special Controls:**
> "Proposed special controls are generally appropriate. FDA may require additional controls 
> related to: (i) healthcare provider training on product use and interpretation, (ii) 
> patient screening for appropriateness (e.g., suicide risk assessment), and (iii) adverse 
> event reporting and post-market surveillance."

---

**Week 24-25: Action Plan Execution**

**Action Item #1: Endpoint Strategy Decision**

**Options Evaluated:**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **A: PHQ-9 + HAM-D co-primary** | Strongest FDA support; no ambiguity | Both must be significant (higher risk); adds $200K cost (HAM-D raters) | ❌ Rejected (too risky) |
| **B: PHQ-9 primary + HAM-D key secondary (hierarchical)** | FDA acceptable; lower risk (only PHQ-9 must be significant); HAM-D supports | If HAM-D negative, FDA may question PHQ-9 | ✅ **SELECTED** |
| **C: HAM-D sole primary** | Strong FDA support; clear clinical validation | Conflicts with digital health paradigm (self-report); adds $250K cost; misaligned with product | ❌ Rejected |

**DECISION:** Proceed with Option B (PHQ-9 primary + HAM-D key secondary, hierarchical)

**Rationale:**
- Balances FDA's concerns with feasibility
- Maintains alignment with digital health paradigm (patient-reported)
- Lower statistical risk than co-primary
- FDA explicitly stated this is acceptable
- Pilot data showed both PHQ-9 and HAM-D improvements, reducing risk

**Protocol Amendment:**
- Update primary endpoint section: "Primary endpoint is PHQ-9 change at week 12. Key 
  secondary endpoint is HAM-D 17-item change at week 12, tested hierarchically after 
  primary endpoint if p<0.05."
- Update Statistical Analysis Plan: Hierarchical testing procedure

---

**Action Item #2: Sample Size Decision**

**Options Evaluated:**

| Option | N (per arm) | Total N | Power | Cost Impact | Timeline Impact |
|--------|-------------|---------|-------|-------------|-----------------|
| **Current: 3-point difference** | 118 | 236 | 80% | $0 (baseline) | 0 months |
| **FDA Suggestion: 4-point difference** | 90 | 180 | 80% | -$400K (fewer patients) | -2 months (faster enrollment) |
| **Conservative: 3-point, 90% power** | 158 | 316 | 90% | +$640K | +3 months |

**Analysis:**

Interestingly, if we target a 4-point difference (instead of 3), we actually need FEWER 
patients (N=180 vs. 236) because the effect size is larger. This would:
- REDUCE cost by $400K
- REDUCE enrollment time by ~2 months
- Increase confidence in clinical meaningfulness (FDA preference)

**RISK:** What if true effect is only 3 points (not 4)? Then we'd be underpowered.

**DECISION:** **Hybrid approach - Power for 3.5-point difference, N=200 (100 per arm)**

**Rationale:**
- Balances FDA's preference (larger effect) with conservative pilot data (4.2 points observed)
- Provides 80% power for 3.5-point difference (midpoint between 3 and 4)
- Reduces cost by $288K vs. original plan
- Reduces enrollment time by ~1.5 months
- If true effect is 4+ points, we're overpowered (good problem to have)
- If true effect is ~3 points, we still have ~70% power (acceptable)

**Protocol Amendment:**
- Update sample size section: N=200 (100 per arm), powered for 3.5-point difference

---

**Action Item #3: MCID Literature Package**

**Compiled comprehensive MCID justification document (8 pages):**

1. Löwe et al., 2004: MCID = 5 points for remission, but 2.59 points represents reliable 
   change, and 3+ points clinically meaningful
2. Kroenke et al., 2001: PHQ-9 responsiveness to treatment; changes as small as 3 points 
   detect clinical improvement
3. Multiple RCTs in depression: 3-point differences considered clinically meaningful
4. Patient perspective interviews (n=15): Patients report meaningful improvement with 
   3-point reductions
5. Provider surveys (n=20 psychiatrists): 80% agree 3-point improvement is clinically 
   relevant

**Action:** Include in De Novo submission appendix

---

**Action Item #4: Special Controls Preparation**

**Drafted proposed special controls for FDA discussion during De Novo review:**

1. **Software Validation:** Per FDA guidance, including V&V and usability testing
2. **Clinical Validation:** RCT demonstrating effectiveness (as proposed)
3. **Cybersecurity:** Per FDA guidance
4. **Healthcare Provider Oversight:** Prescription-only; provider training materials
5. **Patient Screening:** Suicide risk assessment required before use (PHQ-9 item 9 = 0-1)
6. **Adverse Event Reporting:** Real-time monitoring and reporting system
7. **Post-Market Surveillance:** 12-month, n≥500 real-world use study
8. **Labeling:** Clear indication, contraindications, and usage instructions

**Action:** Finalize during De Novo review process

---

**Week 26: Updated Regulatory Strategy & Stakeholder Communication**

**Executive Summary to CEO/CFO/Board:**

```
TO: Executive Leadership & Board of Directors
FROM: Dr. James Park, Regulatory Affairs Director
DATE: [Date]
RE: FDA Pre-Submission Meeting Outcomes - MoodRestore™

EXECUTIVE SUMMARY

We successfully completed our Pre-Submission meeting with FDA to discuss MoodRestore™, 
our DTx for moderate major depressive disorder. FDA provided valuable feedback that 
significantly de-risks our development plan.

KEY OUTCOMES

✅ FDA CONFIRMED:
- De Novo regulatory pathway (Class II) is appropriate
- PHQ-9 primary endpoint + HAM-D key secondary (hierarchical testing) is acceptable
- Sham app control design is adequate
- Special controls approach is generally appropriate

DEVELOPMENT PLAN MODIFICATIONS

Based on FDA feedback, we are making the following strategic adjustments:

1. **Endpoint Approach:** Retain PHQ-9 as primary, strengthen with HAM-D as key secondary 
   (hierarchical testing). This addresses FDA's desire for clinician validation while 
   maintaining our digital health paradigm.

2. **Sample Size Optimization:** INCREASE to N=200 (from N=236) to target 4-point difference, 
   aligning with FDA's preference for stronger clinical meaningfulness.
   - IMPACT: REDUCES cost by $288K (fewer patients needed)
   - IMPACT: REDUCES enrollment time by 1.5 months

3. **MCID Justification:** Compiled comprehensive literature package supporting 3+ point 
   PHQ-9 change as clinically meaningful.

IMPACT ASSESSMENT

**Timeline:**
- Original: 18 months to De Novo submission
- Updated: 16.5 months to De Novo submission (FASTER by 1.5 months)

**Budget:**
- Pre-Sub cost: $78K (as budgeted)
- Clinical trial savings: $288K (from sample size reduction)
- **NET SAVINGS: $210K**

**Risk Reduction:**
- Regulatory approval confidence: INCREASED from 65% to 85%
- Probability of costly protocol amendments: REDUCED from 30% to 10%

NEXT STEPS

1. Finalize protocol amendments (HAM-D, sample size) - Week 27
2. Submit protocol to IRB for approval - Week 28
3. Initiate clinical trial - Week 32 (assuming IRB approval)
4. Complete enrollment - Month 16 (target 12-13 patients/month)
5. Complete follow-up & analysis - Month 20
6. Submit De Novo application - Month 22

RECOMMENDATION

**PROCEED with clinical trial as modified per FDA feedback.** The Pre-Sub meeting achieved 
all objectives: FDA confirmed our regulatory strategy, accepted our endpoint approach 
(with minor modification), and provided clear guidance for special controls. The development 
plan is now de-risked, on budget, and on accelerated timeline.

FDA engagement was highly productive and positions us strongly for De Novo submission.

Detailed FDA meeting minutes, action plan, and updated protocol attached.
```

**Board Approval:** ✅ **GRANTED** (unanimous vote)

---

#### **OUTCOME SUMMARY**

**Pre-Sub Meeting Success Metrics:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| FDA agreement on pathway | Yes | Yes (De Novo confirmed) | ✅ ACHIEVED |
| FDA agreement on primary endpoint | Yes | Yes (with HAM-D secondary) | ✅ ACHIEVED |
| FDA concerns about feasibility | None raised | None raised | ✅ ACHIEVED |
| Clear next steps | Yes | Yes (De Novo submission in 20-22 months) | ✅ ACHIEVED |
| Stakeholder confidence | Increase | Increased (Board approval) | ✅ ACHIEVED |

**ROI Realized:**
- Pre-Sub cost: $78K
- Development risk reduction: Approval probability 65% → 85% (+20%)
- Cost savings: $210K (net savings from optimized sample size)
- Timeline improvement: 1.5 months faster
- **NET BENEFIT: $210K savings + 20% risk reduction = ~$2.5M value created**

**Lessons Learned:**

1. ✅ **Pre-Sub was essential** for first-in-class DTx - FDA feedback shaped endpoint strategy
2. ✅ **Mock meetings were valuable** - Prepared team for FDA's endpoint concerns
3. ✅ **External consultant added value** - Anticipated FDA's HAM-D preference
4. ✅ **Hierarchical testing compromise** - Balanced FDA preference with feasibility
5. ✅ **Sample size optimization** - Serendipitous discovery that larger effect → fewer patients

**Next Milestone:** Initiate clinical trial (Week 32)

---

## 8. IMPLEMENTATION GUIDE

### 8.1 Getting Started Checklist

Before beginning Pre-Sub preparation, ensure you have:

**☐ Team Assembly**
- [ ] Regulatory Affairs Director (P05_REGDIR) identified and committed
- [ ] Chief Medical Officer or VP Clinical (P01_CMO / P02_VPCLIN) available
- [ ] VP Biostatistics (P04_BIOSTAT) engaged
- [ ] External regulatory consultant (P11_REGCONS) retained (recommended)
- [ ] Project coordinator assigned for logistics and documentation

**☐ Information Gathering**
- [ ] Product description documented (1-2 pages)
- [ ] Proposed regulatory pathway identified (UC_RA_002)
- [ ] Clinical development plan drafted (at least outline)
- [ ] Preliminary data available (pilot study, pre-clinical, etc.)
- [ ] Regulatory precedent researched (similar products, K-numbers, guidances)

**☐ Resources Allocated**
- [ ] Budget approved: $50-100K (document prep, consultant, travel)
- [ ] Timeline confirmed: 5-6 months (preparation → FDA feedback → implementation)
- [ ] Protected time scheduled for team (60-80 hrs for RA, 20-30 hrs for others)
- [ ] Executive sponsor identified (for final decisions and Board communication)

**☐ Decision Confirmation**
- [ ] Pre-Sub decision scorecard completed (Section 6.1)
- [ ] Decision rationale documented (why Pre-Sub is warranted)
- [ ] Executive leadership buy-in obtained
- [ ] Timeline flexibility confirmed (can accommodate 5-6 month process)

### 8.2 Timeline & Resource Planning

**Detailed Gantt Chart:**

```
WEEK | PHASE | ACTIVITY | LEAD | HOURS
-----|-------|----------|------|-------
1-2  | PHASE 1: DECISION & PLANNING
  1  | Planning | Pre-Sub decision analysis | P05_REGDIR | 8
  1  | Planning | Team assembly & kickoff | P05_REGDIR | 4
  2  | Planning | Initial question brainstorming | All | 8
  2  | Planning | Question prioritization | P05_REGDIR | 6

3-7  | PHASE 2: BRIEFING DOCUMENT DEVELOPMENT
  3-4 | Writing | Product description section | P03_PRODMGR | 12
  3-4 | Writing | Regulatory background section | P05_REGDIR | 16
  4-5 | Writing | Clinical development plan section | P02_VPCLIN | 24
  4-5 | Writing | Statistical analysis section | P04_BIOSTAT | 20
  5-6 | Writing | Question formulation & refinement | P05_REGDIR | 16
  6   | Review | Internal review round 1 (content) | All | 8
  6   | Review | Internal review round 2 (scientific) | P01/P02/P04 | 6
  6-7 | Review | External consultant review | P11_REGCONS | 12
  7   | Review | Executive review & approval | P01_CMO | 4
  7   | Assembly | Final package assembly | Project Coord | 8

8    | PHASE 3: SUBMISSION
  8  | Submission | Submit to FDA via eSTAR/ESG | P05_REGDIR | 4

9-18 | PHASE 4: FDA REVIEW (75-day statutory period)
  18 | Review | FDA preliminary responses received | - | -
  18 | Planning | Review FDA responses, develop strategy | P05_REGDIR | 8

19-21| PHASE 5: MEETING PREPARATION
  19 | Prep | Presentation slide deck development | P05_REGDIR | 12
  19 | Prep | Mock meeting #1 (full rehearsal) | All | 3
  20 | Prep | Refine responses to FDA concerns | P05_REGDIR | 8
  20 | Prep | Mock meeting #2 (Q&A practice) | All | 2
  21 | Meeting | FDA Pre-Sub meeting (90 min) | All | 4
  21 | Debrief | Post-meeting team debrief | All | 2

22-26| PHASE 6: POST-MEETING FOLLOW-UP
  22-23 | Follow-up | FDA meeting minutes review | P05_REGDIR | 6
  24-25 | Implementation | Develop action plan | P05_REGDIR | 12
  24-25 | Implementation | Execute priority actions | Various | 40
  26 | Communication | Stakeholder communication | P05_REGDIR | 8
  26 | Update | Update regulatory strategy | P05_REGDIR | 6

TOTAL TIME: 26 weeks (6 months)
TOTAL EFFORT: ~300 person-hours (team)
```

**Resource Allocation by Persona:**

| Persona | Total Hours | Key Activities |
|---------|-------------|----------------|
| P05_REGDIR | 120-140 | Project lead, document writing, FDA interaction |
| P01_CMO | 30-40 | Strategy, review, decision-making, FDA meeting |
| P02_VPCLIN | 40-50 | Clinical sections, protocol, FDA meeting |
| P04_BIOSTAT | 30-40 | Statistical sections, sample size, FDA meeting |
| P03_PRODMGR | 15-20 | Product description, technical specs |
| P11_REGCONS | 40-60 | Review, mock meetings, FDA strategy |
| Project Coord | 30-40 | Logistics, scheduling, note-taking |

### 8.3 Common Pitfalls & How to Avoid Them

**PITFALL #1: Starting Too Early (Insufficient Data)**

**Symptoms:**
- No pilot data or proof-of-concept
- Study design still very preliminary
- FDA asks for "more data" and defers feedback

**How to Avoid:**
- Wait until you have at least pilot study results or strong pre-clinical data
- Finalize study design (at least 80% complete) before Pre-Sub
- If FDA asks for more data during meeting, ask specifically what data would be helpful

**PITFALL #2: Vague, Unanswerable Questions**

**Symptoms:**
- FDA responds with generic guidance that doesn't help
- FDA says "we need more information to answer"
- Questions are too broad (e.g., "What clinical trial should we run?")

**How to Avoid:**
- Use the question formulation template (Section 6.2) rigorously
- State your proposed approach explicitly in each question
- Include sufficient background context for FDA to understand
- Have external consultant review questions for clarity

**PITFALL #3: Ignoring FDA Feedback**

**Symptoms:**
- Sponsor proceeds with original plan despite FDA concerns
- FDA scrutinizes submission more heavily
- Submission receives NSE (Not Substantially Equivalent) or CRL (Complete Response Letter)

**How to Avoid:**
- Document FDA feedback carefully and review multiple times
- If FDA "recommends" something, treat it seriously (not optional)
- If you disagree with FDA feedback, engage in follow-up dialogue (don't just ignore)
- Justify any deviations from FDA recommendations explicitly in submission

**PITFALL #4: Poor Meeting Preparation (Not Rehearsing)**

**Symptoms:**
- Team is disorganized during FDA meeting
- Responses are inconsistent or contradictory
- Team doesn't know who should answer which questions
- Meeting time runs out before all topics covered

**How to Avoid:**
- Conduct at least 2 mock FDA meetings with external consultant role-playing FDA
- Assign clear roles (who answers clinical questions? statistical? regulatory?)
- Time presentations and Q&A to fit within meeting duration
- Prepare backup slides for anticipated FDA questions

**PITFALL #5: Inadequate Post-Meeting Follow-Up**

**Symptoms:**
- FDA feedback is not incorporated into protocol
- Team forgets FDA's specific recommendations
- Submission doesn't address FDA concerns from Pre-Sub

**How to Avoid:**
- Create detailed action plan within 2 weeks of FDA meeting
- Assign owners and deadlines for each action item
- Track completion of action items in project management system
- Reference FDA meeting minutes explicitly in protocol/submission

### 8.4 Budget Template

**Pre-Sub Meeting Budget Breakdown:**

| Item | Description | Estimated Cost |
|------|-------------|----------------|
| **INTERNAL LABOR** | |
| Regulatory Affairs Director (P05_REGDIR) | 120 hrs × $150/hr | $18,000 |
| CMO (P01_CMO) | 35 hrs × $200/hr | $7,000 |
| VP Clinical (P02_VPCLIN) | 45 hrs × $150/hr | $6,750 |
| VP Biostatistics (P04_BIOSTAT) | 35 hrs × $150/hr | $5,250 |
| Product Manager (P03_PRODMGR) | 20 hrs × $125/hr | $2,500 |
| Project Coordinator | 35 hrs × $75/hr | $2,625 |
| **Subtotal: Internal Labor** | | **$42,125** |
| **EXTERNAL CONSULTANTS** | |
| Regulatory Consultant (P11_REGCONS) | 50 hrs × $400/hr | $20,000 |
| Medical Writing Support (optional) | 20 hrs × $200/hr | $4,000 |
| **Subtotal: External Consultants** | | **$24,000** |
| **TRAVEL & LOGISTICS** | |
| FDA Meeting Travel (if in-person) | 3 people × $1,500 | $4,500 |
| Virtual Meeting Technology (if virtual) | Software, equipment | $500 |
| **Subtotal: Travel** | | **$5,000** |
| **MISCELLANEOUS** | |
| Literature Database Access | PubMed, FDA databases | $1,000 |
| Document Printing & Materials | Hard copies, binders | $500 |
| Contingency (10%) | Buffer for unexpected costs | $7,263 |
| **Subtotal: Miscellaneous** | | **$8,763** |
| **TOTAL PRE-SUB BUDGET** | | **$79,888** |

**Budget Notes:**
- Internal labor rates are approximate (varies by company, geography)
- External consultant rates vary widely ($250-$500/hr typical)
- Travel costs assume domestic US travel (adjust for international)
- This budget does NOT include protocol amendments or additional studies (those are separate)

**Cost-Saving Options:**
- **Use internal resources only (no consultant):** Save $24,000 (but risk lower quality feedback)
- **Virtual meeting instead of in-person:** Save $4,000 (travel)
- **Medical writing in-house (no external support):** Save $4,000
- **Minimum budget:** ~$50,000 (internal labor + essential travel)

### 8.5 Success Metrics & KPIs

**How to Measure Pre-Sub Meeting Success:**

| Metric | How to Measure | Target | Data Source |
|--------|----------------|--------|-------------|
| **FDA Pathway Agreement** | Did FDA agree with proposed regulatory pathway? | 100% agreement | FDA meeting minutes |
| **Endpoint Acceptance** | Did FDA accept primary endpoint (or provide acceptable alternative)? | Acceptance or clear alternative | FDA meeting minutes |
| **Study Design Approval** | Did FDA raise major feasibility concerns about study design? | No major concerns | FDA meeting minutes |
| **Clarity of Feedback** | How clear was FDA's feedback? (1-5 scale, team survey) | ≥4/5 average | Post-meeting team survey |
| **Actionable Guidance** | Percentage of questions receiving actionable FDA feedback | ≥80% | FDA meeting minutes review |
| **Timeline Impact** | Did Pre-Sub cause delays beyond expected 5-6 months? | No unexpected delays | Project timeline tracking |
| **Budget Adherence** | Did Pre-Sub stay within budget? | ≤10% over budget | Finance tracking |
| **Regulatory Risk Reduction** | Change in confidence level for approval (pre vs post) | +15-25% increase | Executive assessment |
| **Stakeholder Satisfaction** | Board/investor confidence in regulatory strategy | Positive feedback | Board meeting notes |
| **FDA Relationship** | Quality of FDA engagement (productive, collaborative) | Positive | Team assessment |

**Post-Meeting Survey for Team:**

1. How well-prepared were we for the FDA meeting? (1-5 scale)
2. How clear was FDA's feedback on our questions? (1-5 scale)
3. Did we get the guidance we needed? (Yes/No/Partially)
4. What was most valuable about the Pre-Sub process?
5. What would we do differently next time?
6. Overall, was the Pre-Sub meeting worth the time and investment? (Yes/No)

**Long-Term Success Metrics (6-12 months post-meeting):**

- Did we successfully implement FDA feedback? (Yes/No)
- Did FDA raise any concerns at submission that were not addressed in Pre-Sub? (Count)
- Did we receive FDA approval without major setbacks? (Yes/No/Pending)
- In retrospect, was Pre-Sub meeting valuable? (Yes/No)

---

## 9. QUALITY ASSURANCE

### 9.1 Briefing Document Review Checklist

Use this checklist before submitting briefing package to FDA:

**☐ COMPLETENESS**
- [ ] All required sections included (cover letter, exec summary, background, clinical plan, questions)
- [ ] No "TBD" or placeholder text
- [ ] All figures/tables referenced in text
- [ ] All citations complete and formatted consistently
- [ ] Appendices attached and referenced

**☐ CLARITY**
- [ ] Product description understandable to non-expert FDA reviewer
- [ ] Acronyms defined on first use
- [ ] Technical jargon explained
- [ ] Figures/diagrams clearly labeled
- [ ] Key points highlighted (bold, underline, callout boxes)

**☐ SCIENTIFIC ACCURACY**
- [ ] All factual claims supported by citations
- [ ] No overclaims or exaggerations
- [ ] Statistical calculations verified
- [ ] Clinical data accurately reported
- [ ] Limitations acknowledged transparently

**☐ REGULATORY APPROPRIATENESS**
- [ ] Regulatory pathway clearly stated and justified
- [ ] FDA guidance documents cited appropriately
- [ ] Precedent examples provided (K-numbers, BLA numbers, etc.)
- [ ] Questions follow FDA-acceptable format
- [ ] Sponsor's proposed approach stated for each question

**☐ FORMATTING & PROFESSIONALISM**
- [ ] Consistent formatting throughout
- [ ] Page numbers on all pages
- [ ] Header/footer with company name and product name
- [ ] Professional fonts and layout
- [ ] No typos or grammatical errors
- [ ] PDF format (not Word) for submission

**☐ STRATEGIC ALIGNMENT**
- [ ] Questions prioritized appropriately (Tier 1 most important)
- [ ] 5-10 questions total (not too many)
- [ ] Questions are consequential (answers will impact development plan)
- [ ] Anticipated FDA concerns addressed proactively
- [ ] Risk-benefit assessment is balanced

**☐ EXECUTIVE REVIEW**
- [ ] CMO/CEO has reviewed and approved
- [ ] Board (if applicable) has been briefed
- [ ] Budget and timeline confirmed
- [ ] Go/No-Go decision documented

### 9.2 Pre-Meeting Preparation Checklist

Use this checklist 1 week before FDA meeting:

**☐ LOGISTICS**
- [ ] Meeting date/time confirmed with FDA
- [ ] Meeting format confirmed (in-person or virtual)
- [ ] If virtual: Meeting link tested, backup connection ready
- [ ] If in-person: Travel booked, hotel reserved, directions to FDA confirmed
- [ ] FDA attendees identified (names, titles, roles)
- [ ] Sponsor attendees confirmed (availability, roles)

**☐ MATERIALS**
- [ ] Presentation slides finalized and approved
- [ ] Backup slides prepared for anticipated FDA questions
- [ ] Printed copies prepared (1 per FDA attendee + 1 per sponsor)
- [ ] Briefing document re-reviewed by team
- [ ] FDA preliminary responses reviewed by team

**☐ TEAM PREPARATION**
- [ ] Mock meetings completed (at least 2)
- [ ] Roles assigned (lead spokesperson, clinical expert, statistical expert, note-taker)
- [ ] Anticipated FDA questions practiced
- [ ] Team briefed on "difficult question" responses
- [ ] Backup expertise identified (if needed)

**☐ STRATEGIC PREPARATION**
- [ ] Key messages identified (3-5 main points)
- [ ] Anticipated FDA concerns and responses prepared
- [ ] Decision authority clarified (who can commit to FDA suggestions on the spot?)
- [ ] Post-meeting debrief scheduled (immediately after meeting)

**☐ DOCUMENTATION**
- [ ] Note-taking assignments confirmed
- [ ] Recording (if allowed) equipment tested
- [ ] Post-meeting minutes template prepared

### 9.3 Post-Meeting Quality Check

Use this checklist after FDA meeting:

**☐ DOCUMENTATION**
- [ ] Meeting notes captured (sponsor's version)
- [ ] FDA attendees and roles documented
- [ ] All FDA feedback categorized (Agree, Recommend, Require, Cannot Opine)
- [ ] Action items identified and assigned owners
- [ ] FDA meeting minutes received (within 30 days) and reviewed

**☐ ACCURACY**
- [ ] Sponsor notes compared to FDA minutes (any discrepancies?)
- [ ] Team consensus on interpretation of FDA feedback
- [ ] Ambiguities identified and clarification requested (if needed)

**☐ ACTION PLANNING**
- [ ] Action plan developed with priorities, owners, deadlines
- [ ] Resource requirements estimated (time, budget)
- [ ] Timeline impact assessed
- [ ] Stakeholders informed (Board, investors, cross-functional teams)

**☐ IMPLEMENTATION**
- [ ] Protocol amendments drafted (if required)
- [ ] Regulatory strategy document updated
- [ ] Budget and timeline revised (if needed)
- [ ] Implementation progress tracked weekly

**☐ LESSONS LEARNED**
- [ ] Post-meeting debrief completed with team
- [ ] "What went well?" documented
- [ ] "What would we do differently?" documented
- [ ] Best practices captured for future Pre-Subs
- [ ] Feedback provided to external consultant (if used)

---

## 10. APPENDICES

### 10.1 Glossary of Terms

| Term | Definition |
|------|------------|
| **510(k)** | Premarket notification pathway for medical devices demonstrating substantial equivalence to a predicate device |
| **BLA** | Biologics License Application - submission for marketing approval of biological products |
| **CGI-S** | Clinical Global Impression - Severity scale, clinician-rated outcome measure |
| **De Novo** | Regulatory pathway for novel, low-to-moderate risk medical devices with no predicate |
| **DTx** | Digital Therapeutics - software-based medical interventions to treat, manage, or prevent disease |
| **HAM-D** | Hamilton Depression Rating Scale, clinician-administered assessment of depression severity |
| **ITT** | Intent-to-Treat analysis - includes all randomized participants regardless of adherence |
| **MCID** | Minimally Clinically Important Difference - smallest change in outcome that patients/clinicians consider meaningful |
| **NDA** | New Drug Application - submission for marketing approval of new pharmaceutical products |
| **PHQ-9** | Patient Health Questionnaire-9, validated self-report measure of depression severity |
| **PMA** | Premarket Approval - most stringent regulatory pathway for high-risk medical devices |
| **Pre-Sub** | Pre-Submission meeting (formerly Pre-IDE or Pre-IND) - formal FDA interaction before submission |
| **Q-Sub** | Q-Submission - written submission of questions to FDA without formal meeting |
| **RCT** | Randomized Controlled Trial - gold standard clinical study design |
| **SAE** | Serious Adverse Event - adverse event resulting in death, hospitalization, or significant disability |
| **SaMD** | Software as a Medical Device - software intended for medical purposes |
| **Type C Meeting** | Formal FDA meeting for any development question not covered by Type A or B meetings |

### 10.2 FDA Resources & Guidance Documents

**Key FDA Guidance Documents for Pre-Submission Meetings:**

1. **"Requests for Feedback and Meetings for Medical Device Submissions: The Q-Submission Program"** (2019)
   - https://www.fda.gov/regulatory-information/search-fda-guidance-documents
   - Comprehensive guidance on Q-Sub and Pre-Sub processes

2. **"Formal Meetings Between the FDA and Sponsors or Applicants of PDUFA Products"** (2017)
   - Covers Type A/B/C meetings for drugs and biologics

3. **"Clinical Decision Support Software"** (2019)
   - Guidance for software-based medical devices including DTx

4. **"Policy for Device Software Functions and Mobile Medical Applications"** (2019)
   - Clarifies FDA's approach to mobile medical apps and digital health

5. **"Content of Premarket Submissions for Management of Cybersecurity in Medical Devices"** (2018)
   - Required for any device with software/connectivity

**FDA Databases for Precedent Research:**

- **510(k) Premarket Notification Database:** https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm
- **De Novo Classification Database:** https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/denovo.cfm
- **Drugs@FDA Database:** https://www.accessdata.fda.gov/scripts/cder/daf/
- **FDA Guidance Documents:** https://www.fda.gov/regulatory-information/search-fda-guidance-documents

### 10.3 Templates & Tools

**Template 1: Cover Letter for Pre-Sub Request**

```
[Date]

[FDA Division Name]
[FDA Address]

Re: Request for Pre-Submission Meeting
     Product: [Product Name]
     Indication: [Indication]
     Proposed Regulatory Pathway: [Pathway]

Dear [FDA Division]:

[Company Name] respectfully requests a Pre-Submission meeting with FDA to discuss 
[Product Name], a [device/drug/biologic] for [indication]. We seek FDA's feedback on 
[high-level topics] before initiating our pivotal clinical study.

**Product Overview:**
[1-2 paragraph description of product, indication, and mechanism of action]

**Regulatory Strategy:**
We propose pursuing [510(k)/De Novo/PMA/BLA/NDA] for [Product Name]. [1 sentence 
rationale for pathway choice.]

**Meeting Request:**
We request a [Pre-Submission Meeting / Q-Submission] to obtain FDA feedback on the 
following topics:
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

**Proposed Meeting Timeframe:**
We propose meeting in [Month Range, e.g., "March-April 2025"] to allow sufficient time 
to incorporate FDA's feedback into our clinical trial protocol before study initiation 
in [Target Month].

**Contact Information:**
Primary Contact: [Name, Title]
Email: [email]
Phone: [phone]

We have enclosed our Pre-Submission briefing document and welcome FDA's review. We are 
available for a meeting at FDA's convenience and appreciate your consideration of our 
request.

Sincerely,

[Name, Title]
[Company Name]

Enclosures:
- Pre-Submission Briefing Document ([Page Count] pages)
- Appendix A: [Description]
- Appendix B: [Description]
```

---

**Template 2: FDA Meeting Agenda**

```
FDA PRE-SUBMISSION MEETING AGENDA
Product: [Product Name]
Date: [Date]
Time: [Time]
Location: [In-Person or Virtual]

MEETING DURATION: 90 minutes

ATTENDEES:
FDA:
- [Name, Title, Role]
- [Name, Title, Role]
- [Name, Title, Role]

Sponsor:
- [Name, Title, Role]
- [Name, Title, Role]
- [Name, Title, Role]

AGENDA:

I. INTRODUCTIONS (5 minutes)
   - FDA team introductions
   - Sponsor team introductions
   - Meeting objectives and ground rules

II. SPONSOR PRESENTATION (25-30 minutes)
    A. Product Overview (5 min)
       - Device description and indication
       - Mechanism of action
       - Target population
    
    B. Regulatory Strategy (3 min)
       - Proposed pathway and rationale
       - Regulatory precedent
    
    C. Clinical Development Plan (15 min)
       - Proposed study design
       - Endpoints
       - Statistical approach
    
    D. Specific Questions for FDA (7 min)
       - Summary of key questions

III. FDA FEEDBACK & DISCUSSION (45-50 minutes)
     - Question 1: [Topic]
     - Question 2: [Topic]
     - Question 3: [Topic]
     - Question 4: [Topic]
     - Question 5: [Topic]
     - Open discussion

IV. SUMMARY & NEXT STEPS (5-10 minutes)
    - FDA summary of key feedback
    - Sponsor confirmation of understanding
    - Next steps and timeline
    - Post-meeting minutes process

V. ADJOURNMENT
```

---

**Template 3: Post-Meeting Action Plan**

```
FDA PRE-SUBMISSION MEETING - ACTION PLAN
Product: [Product Name]
Meeting Date: [Date]
Document Date: [Date]
Owner: [P05_REGDIR Name]

MEETING SUMMARY:
[1-2 paragraph summary of meeting outcomes and key FDA feedback]

ACTION ITEMS:

| # | Action Item | FDA Feedback Category | Priority | Owner | Due Date | Status |
|---|-------------|----------------------|----------|-------|----------|--------|
| 1 | [Description] | [FDA Requires/Recommends/Agrees] | P1/P2/P3 | [Name] | [Date] | [Not Started/In Progress/Complete] |
| 2 | [Description] | [FDA Requires/Recommends/Agrees] | P1/P2/P3 | [Name] | [Date] | [Status] |
| 3 | [Description] | [FDA Requires/Recommends/Agrees] | P1/P2/P3 | [Name] | [Date] | [Status] |

PRIORITY DEFINITIONS:
- P1 (Critical): FDA requirement; blocks submission if not addressed
- P2 (High): FDA recommendation; significantly improves approval probability
- P3 (Medium): FDA suggestion; nice-to-have but not critical

TIMELINE IMPACT:
- [Summary of how FDA feedback affects development timeline]

BUDGET IMPACT:
- [Summary of cost implications from FDA feedback]

RISK ASSESSMENT:
- Regulatory Approval Confidence: [Pre-Meeting: X%] → [Post-Meeting: Y%]
- Key Remaining Risks: [List]

NEXT MILESTONES:
1. [Milestone 1] - [Target Date]
2. [Milestone 2] - [Target Date]
3. [Milestone 3] - [Target Date]

STAKEHOLDER COMMUNICATION:
- Executive Leadership: [Date briefed]
- Board of Directors: [Date of next Board presentation]
- Cross-Functional Teams: [Date of team briefing]
```

### 10.4 Related Use Cases & Cross-References

**Related Use Cases in the Life Sciences Prompt Library:**

| Use Case ID | Title | Relationship to UC_RA_004 |
|-------------|-------|--------------------------|
| **UC_RA_001** | Product Classification & Risk Assessment | **PREREQUISITE** - Must complete before Pre-Sub |
| **UC_RA_002** | Regulatory Pathway Determination | **PREREQUISITE** - Informs Pre-Sub questions |
| **UC_RA_003** | Predicate Device Identification (510(k)) | **INPUT** - Predicate analysis supports Pre-Sub briefing |
| **UC_RA_005** | De Novo Classification Strategy | **FOLLOW-ON** - If FDA confirms De Novo pathway |
| **UC_RA_006** | FDA Breakthrough Designation | **PARALLEL** - May pursue alongside Pre-Sub if eligible |
| **UC_CD_001** | DTx Clinical Endpoint Selection | **INPUT** - Endpoint strategy informs Pre-Sub questions |
| **UC_CD_002** | Clinical Trial Design | **INPUT** - Trial design discussed in Pre-Sub |
| **UC_CD_004** | Statistical Analysis Plan Development | **INPUT** - SAP informs Pre-Sub sample size discussion |

**How to Use Related Use Cases in Sequence:**

```
RECOMMENDED WORKFLOW:

1. START: UC_RA_001 (Product Classification)
   ↓
2. UC_RA_002 (Pathway Determination)
   ↓
3. [IF 510(k)]: UC_RA_003 (Predicate Identification)
   [IF De Novo]: Proceed to Pre-Sub
   ↓
4. UC_CD_001 (Endpoint Selection) + UC_CD_002 (Trial Design)
   ↓
5. ➡️ UC_RA_004 (PRE-SUB MEETING) ⬅️ [YOU ARE HERE]
   ↓
6. [Based on FDA Feedback]:
   - Finalize Protocol
   - Submit IND/IDE (if required)
   - Initiate Clinical Trial
   ↓
7. [After Trial]: Submission Preparation (UC_RA_007/008/009)
```

### 10.5 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | January 2025 | P05_REGDIR Team | Initial document creation |
| v1.5 | June 2025 | P05_REGDIR Team | Added DTx-specific examples and digital health guidance |
| v2.0 | October 2025 | P05_REGDIR Team | Complete overhaul with real-world case study; added QA section; expanded templates |

---

## DOCUMENT END

**Total Document Length:** ~50 pages (excluding appendices)

**Document Status:** ✅ COMPLETE - Ready for operational use

**Next Review Date:** April 2026 (6 months)

**Questions or Feedback:** Contact [P05_REGDIR Lead] or submit via [Feedback System]

---

**ACKNOWLEDGMENTS:**

This use case was developed with input from:
- FDA regulatory affairs professionals (15+ years experience)
- Digital health regulatory consultants (former FDA reviewers)
- Pharma/biotech regulatory directors
- Clinical development leaders
- Biostatisticians with FDA submission experience

**DISCLAIMER:**

This document provides general guidance for FDA Pre-Submission meeting preparation. It is 
not legal or regulatory advice. Regulatory strategy should be tailored to your specific 
product and indication. Consult with qualified regulatory professionals and consider 
retaining external regulatory consultants with FDA experience.

FDA regulations and guidance documents are subject to change. Always verify current FDA 
requirements and guidance on the FDA website (www.fda.gov).

---

**END OF DOCUMENT**