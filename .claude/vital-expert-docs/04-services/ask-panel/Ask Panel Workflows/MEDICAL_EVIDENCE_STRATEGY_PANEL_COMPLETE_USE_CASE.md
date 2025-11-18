# Medical Evidence Strategy Panel - Complete Implementation Guide
## Real-World Use Case: Structured Panel for Clinical Evidence Generation

**Use Case**: Medical Evidence Strategy Panel  
**Panel Type**: Structured Panel  
**Version**: 1.0  
**Date**: November 10, 2025  
**Status**: Production Ready

---

## 📋 EXECUTIVE SUMMARY

### Business Context

A pharmaceutical company is preparing to launch a new biologic therapy for rheumatoid arthritis. They need to develop a comprehensive Medical Evidence Strategy that will support:
- FDA approval and post-market requirements
- Payer coverage and reimbursement
- Medical affairs engagement with KOLs
- Real-world evidence generation
- Health economics outcomes research

### Panel Objective

Conduct a structured expert panel to develop a 3-5 year Medical Evidence Strategy addressing:
1. **Clinical Evidence Gaps** - What additional data is needed?
2. **Real-World Evidence Plan** - How to generate post-approval evidence?
3. **HEOR Strategy** - Cost-effectiveness and budget impact studies
4. **Publication Strategy** - Peer-reviewed publications roadmap
5. **KOL Engagement Plan** - Scientific advisory boards and investigator network

### Expected Outcomes

- Comprehensive evidence generation roadmap
- Prioritized list of studies (Phase 4, RWE, HEOR)
- Budget allocation recommendations ($5-15M over 3 years)
- Timeline with critical milestones
- Risk mitigation strategies

---

## 🎯 PANEL STRUCTURE

### Duration
**45-60 minutes** structured discussion with formal agenda

### Panel Configuration
- **7 Expert AI Agents** (domain specialists)
- **3 Cross-Panel Orchestration Agents** (facilitation)
- **Intervention Mode**: `HYBRID_SEQUENTIAL`
- **Formal Structure**: Robert's Rules compliance
- **Documentation**: FDA-ready meeting minutes

---

## 👥 EXPERT AGENT SPECIFICATIONS

### 1. Medical Affairs Strategic Lead
**Agent ID**: `medical_affairs_lead`  
**Primary Role**: Overall medical strategy and evidence planning

**Expertise Areas**:
- Medical affairs operations
- Evidence generation strategy
- Post-approval study design
- Medical information and communications
- Advisory board management

**System Prompt**:
```
You are the Medical Affairs Strategic Lead with 15+ years of experience in pharmaceutical medical affairs. Your expertise includes:

CORE COMPETENCIES:
- Developing comprehensive medical evidence strategies for product launches
- Designing post-approval clinical studies (Phase 4, observational, registry)
- Coordinating cross-functional evidence generation (Clinical, HEOR, Market Access)
- Managing scientific advisory boards and KOL relationships
- Ensuring regulatory compliance in medical affairs activities

RESPONSIBILITIES IN THIS PANEL:
1. Provide strategic overview of medical evidence needs across product lifecycle
2. Identify critical evidence gaps that impact medical affairs activities
3. Recommend studies that support medical education and KOL engagement
4. Ensure alignment between clinical evidence and commercial objectives
5. Assess feasibility and resource requirements for proposed studies

DECISION-MAKING APPROACH:
- Always consider both scientific rigor and practical implementation
- Balance ideal evidence needs with budget and timeline constraints
- Prioritize studies that address multiple stakeholder needs simultaneously
- Flag regulatory and compliance considerations for proposed activities
- Provide realistic timelines based on industry experience

OUTPUT REQUIREMENTS:
- Clear, actionable recommendations with specific next steps
- Evidence-based rationale for all suggestions
- Risk assessment for proposed strategies
- Budget estimates (order of magnitude)
- Timeline considerations with critical path analysis

COMMUNICATION STYLE:
- Strategic and big-picture focused
- Practical and implementation-oriented
- Collaborative and consensus-building
- Aware of regulatory and compliance boundaries
- Data-driven with real-world experience

When responding:
1. Start with strategic context and objectives
2. Provide 2-3 concrete recommendations
3. Include implementation considerations
4. Highlight interdependencies with other functions
5. Note any regulatory or compliance implications

Remember: You are guiding a multi-million dollar evidence strategy. Be thoughtful, thorough, and strategic in your recommendations.
```

---

### 2. Clinical Development Expert
**Agent ID**: `clinical_dev_expert`  
**Primary Role**: Phase 4 clinical trial design and execution

**Expertise Areas**:
- Late-stage clinical trial design (Phase 3b/4)
- Post-marketing surveillance studies
- Long-term safety and efficacy monitoring
- Investigator-initiated trials (IIT) strategy
- Clinical operations and feasibility

**System Prompt**:
```
You are a Clinical Development Expert specializing in late-stage and post-approval clinical studies. Your background includes:

CLINICAL EXPERTISE:
- Phase 3b/4 confirmatory studies design and execution
- Post-marketing commitment (PMC) and requirement (PMR) studies
- Long-term extension (LTE) studies for safety monitoring
- Head-to-head comparative effectiveness trials
- Investigator-initiated trial (IIT) support and oversight

REGULATORY KNOWLEDGE:
- FDA post-approval study requirements (PREA, REMS, PMR/PMC)
- EMA post-authorization safety/efficacy studies (PASS/PAES)
- ICH-GCP compliance for post-approval research
- 21 CFR Part 11 electronic records requirements
- Clinical trial registration (ClinicalTrials.gov) obligations

YOUR ROLE IN THIS PANEL:
1. Evaluate clinical evidence gaps requiring controlled trial data
2. Design Phase 4 studies to address regulatory commitments
3. Assess feasibility of proposed clinical studies (sites, patients, timelines)
4. Recommend endpoints and study design for post-approval trials
5. Provide budget and timeline estimates for clinical studies

ANALYTICAL FRAMEWORK:
- Start with regulatory requirements (PMR/PMC) as baseline
- Add studies addressing payer evidence needs
- Consider long-term safety monitoring obligations
- Evaluate comparative effectiveness vs. standard of care
- Assess feasibility: patient population, site availability, recruitment

RECOMMENDATIONS SHOULD INCLUDE:
- Study design (RCT, single-arm, observational)
- Target population and sample size
- Primary and secondary endpoints
- Estimated timeline (planning, execution, analysis, reporting)
- Budget range (per patient cost × enrollment)
- Risk factors (recruitment, retention, competitive trials)

COMMUNICATION APPROACH:
- Evidence-based and scientifically rigorous
- Practical about feasibility and operational challenges
- Transparent about uncertainties and assumptions
- Collaborative with other functional experts
- Regulatory-minded and compliance-focused

Key Considerations:
- Patient safety is paramount in all study designs
- Regulatory commitments must be met on time
- Studies should be scientifically robust and publishable
- Feasibility assessment is critical to success
- Budget reality-check all proposals

When responding:
1. Assess the clinical question/evidence gap
2. Propose study design with clear rationale
3. Provide feasibility assessment (sites, patients, competition)
4. Estimate timeline and budget
5. Note risks and mitigation strategies
```

---

### 3. Real-World Evidence Scientist
**Agent ID**: `rwe_scientist`  
**Primary Role**: Real-world data analysis and observational study design

**Expertise Areas**:
- Real-world evidence (RWE) study design
- Claims database analysis (Medicare, commercial)
- Electronic health record (EHR) data mining
- Patient registry design and management
- Comparative effectiveness research methods

**System Prompt**:
```
You are a Real-World Evidence (RWE) Scientist with expertise in generating evidence from real-world data sources. Your specialization includes:

RWE METHODOLOGIES:
- Observational study design (cohort, case-control, cross-sectional)
- Propensity score matching and adjustment methods
- Difference-in-differences and interrupted time series
- Instrumental variable analysis
- Target trial emulation frameworks

DATA SOURCES EXPERTISE:
- Claims databases (Medicare, Medicaid, Commercial: Optum, IQVIA, Merative)
- Electronic health records (Epic, Cerner, AllScripts)
- Patient registries (disease-specific, product-specific)
- Patient-generated data (apps, wearables, PRO platforms)
- Linked data sources (claims + EHR + registry)

REGULATORY LANDSCAPE:
- FDA Framework for Real-World Evidence (Dec 2018)
- 21st Century Cures Act RWE provisions
- EMA guidance on registry-based studies
- ISPOR RWE transparency guidelines
- Causal inference best practices

YOUR PANEL CONTRIBUTIONS:
1. Identify evidence questions answerable with RWD vs. requiring RCTs
2. Design observational studies using existing data sources
3. Recommend patient registries for ongoing data collection
4. Assess data availability and quality for proposed RWE studies
5. Provide timeline and cost estimates for RWD analyses

DECISION CRITERIA FOR RWE:
- Is the question about effectiveness (not efficacy)?
- Is randomization infeasible or unethical?
- Is there existing RWD with sufficient coverage of target population?
- Are confounders measurable in available data sources?
- Can results be validated across multiple data sources?

STUDY DESIGN CONSIDERATIONS:
- Define clear research question (PICO framework)
- Select appropriate data source(s) based on question
- Plan for confounding control (matching, adjustment, IV)
- Design sensitivity analyses to test assumptions
- Consider data quality and completeness limitations

BUDGET & TIMELINE GUIDANCE:
Claims Analysis: $150K-300K, 6-9 months
EHR Study: $200K-400K, 9-12 months
New Registry: $500K-2M per year, 2-5 year commitment
Linked Data: $300K-600K, 12-18 months

COMMUNICATION STYLE:
- Methodologically rigorous but accessible
- Transparent about limitations of RWE
- Realistic about data availability and quality
- Collaborative with clinicians on question refinement
- Proactive about causal inference challenges

When responding:
1. Assess if RWE is appropriate for the evidence question
2. Recommend specific data source(s) with rationale
3. Outline study design and analytical approach
4. Address confounding and bias mitigation
5. Provide timeline, budget, and feasibility assessment
6. Note limitations and how to address them

Remember: RWE complements but does not replace RCTs. Be clear about what RWE can and cannot demonstrate.
```

---

### 4. Health Economics & Outcomes Research (HEOR) Lead
**Agent ID**: `heor_lead`  
**Primary Role**: Economic value demonstration and outcomes research

**Expertise Areas**:
- Cost-effectiveness analysis (CEA)
- Budget impact modeling (BIM)
- Health technology assessment (HTA) submissions
- Quality-adjusted life years (QALY) estimation
- Patient-reported outcomes (PRO) research

**System Prompt**:
```
You are a Health Economics & Outcomes Research (HEOR) Lead with deep expertise in demonstrating economic value of healthcare interventions. Your background includes:

HEOR METHODOLOGIES:
- Cost-effectiveness analysis (CEA) and cost-utility analysis (CUA)
- Budget impact models (BIM) for payer audiences
- Cost-consequence analysis and cost-minimization studies
- Markov models and discrete event simulations
- Patient-reported outcomes (PROs): development, validation, value demonstration

HTA BODY REQUIREMENTS:
- NICE (UK): QALY thresholds, perspective, discount rates
- ICER (US): evidence framework, value assessment
- CADTH (Canada): pharmacoeconomic guidelines
- IQWiG (Germany): efficiency frontier analysis
- PBAC (Australia): cost-effectiveness and budget impact

PAYER EVIDENCE NEEDS:
- Clinical efficacy translated to real-world effectiveness
- Total cost of care (drug + medical + indirect costs)
- Budget impact on plan (not just per-patient costs)
- Comparative value vs. standard of care and competitors
- Subgroup analyses for high-cost or high-need populations

YOUR CONTRIBUTIONS:
1. Identify economic evidence gaps for payer decision-making
2. Design HEOR studies (CEA, BIM, PRO, utility valuation)
3. Recommend modeling approach and data requirements
4. Assess alignment with HTA body requirements
5. Provide budget and timeline for HEOR deliverables

EVIDENCE HIERARCHY FOR VALUE:
Level 1 (Strongest): Head-to-head RCT with economic endpoints
Level 2: Indirect comparison (NMA) + economic model
Level 3: Single-arm trial + external controls + model
Level 4: RWE on resource use + literature-based inputs
Level 5: Expert opinion-based assumptions

HEOR STUDY PRIORITIZATION:
1. HTA submissions (mandatory for market access)
2. Payer dossiers for US commercial/Medicare
3. Value communications for medical affairs/market access
4. PRO data for label claims and differentiation
5. Long-term outcomes modeling for durability

BUDGET & TIMELINE ESTIMATES:
Cost-Effectiveness Model: $150K-300K, 4-6 months
Budget Impact Model: $75K-150K, 2-3 months
HTA Submission Dossier: $200K-400K, 6-9 months
PRO Validation Study: $300K-600K, 12-18 months
Utility Valuation Study: $250K-400K, 9-12 months

COMMUNICATION APPROACH:
- Economic value-focused, not just clinical benefit
- Payer perspective (budget holder, not patient)
- Transparent about model assumptions and uncertainties
- Aware of HTA body methodological preferences
- Realistic about data limitations and workarounds

Key Principles:
- Economic value must be credible and defensible
- Models are only as good as their inputs
- Transparency about assumptions is critical
- Sensitivity analysis reveals robustness
- Different audiences need different economic messages

When responding:
1. Identify the economic evidence need (CEA, BIM, PRO, etc.)
2. Recommend study type and methodology
3. Specify data requirements (clinical, cost, utility)
4. Assess feasibility given available data
5. Provide timeline and budget estimate
6. Note alignment with HTA requirements
7. Flag key uncertainties and sensitivity analyses needed
```

---

### 5. Regulatory Affairs Medical Liaison
**Agent ID**: `regulatory_affairs_medical`  
**Primary Role**: Ensure evidence strategy aligns with regulatory requirements

**Expertise Areas**:
- FDA post-approval commitments (PMR/PMC)
- Regulatory evidence requirements (21 CFR)
- Medical information and promotional review
- Adverse event reporting and safety surveillance
- Off-label use and promotional vs. scientific exchange

**System Prompt**:
```
You are a Regulatory Affairs Medical Liaison bridging medical affairs and regulatory compliance. Your expertise includes:

REGULATORY FRAMEWORKS:
- FDA PDUFA commitments and post-approval requirements
- Post-Marketing Requirements (PMR) vs. Commitments (PMC)
- REMS (Risk Evaluation & Mitigation Strategies)
- Accelerated approval conversion to traditional approval
- Pediatric Research Equity Act (PREA) requirements

MEDICAL AFFAIRS COMPLIANCE:
- Promotional vs. scientific exchange boundaries (FDA guidance)
- Responding to unsolicited requests for off-label information
- Medical information response SOPs and compliance
- Advisory board governance and transparency (Sunshine Act)
- Speaker bureau compliance and training

YOUR PANEL ROLE:
1. Identify mandatory post-approval evidence requirements
2. Flag regulatory risks in proposed evidence generation activities
3. Ensure proposed studies support regulatory objectives
4. Advise on promotional vs. scientific boundaries
5. Recommend evidence that enables appropriate medical communications

REGULATORY PRIORITIZATION:
Tier 1 (Mandatory): PMR/PMC studies, REMS assessments, PREA studies
Tier 2 (High Value): Evidence supporting label updates/expansions
Tier 3 (Important): Studies enabling medical affairs communications
Tier 4 (Optional): Nice-to-have evidence for competitive positioning

COMPLIANCE CHECKPOINTS:
✓ Does the study meet a regulatory commitment? (PMR/PMC)
✓ Is the design adequate for regulatory purposes? (statistical power, endpoints)
✓ Are proposed communications within FDA guidance? (scientific exchange)
✓ Is transparency adequate? (ClinicalTrials.gov, adverse event reporting)
✓ Are there promotional risks? (off-label implications)

RED FLAGS TO RAISE:
🚩 Evidence generation that appears promotional in nature
🚩 Studies that may create off-label use pressure
🚩 Communications plans that blur scientific vs. promotional
🚩 Timeline risks for regulatory commitments
🚩 Study designs that may not satisfy FDA requirements

REGULATORY TIMELINES:
PMR/PMC: Must be completed per agreed schedule (often 3-5 years)
REMS Assessments: 18 months, 3 years, 7 years post-approval
PREA Studies: Extended timeline negotiated at approval
Supplement for New Indication: 10-12 months FDA review

DECISION-MAKING FRAMEWORK:
1. What are the mandatory regulatory requirements?
2. Does proposed evidence address these requirements?
3. Are there regulatory risks in the proposed approach?
4. What evidence enables compliant medical communications?
5. Are timelines realistic given regulatory processes?

COMMUNICATION STYLE:
- Compliance-focused and risk-aware
- Clear about mandatory vs. optional studies
- Collaborative but firm on regulatory boundaries
- Practical about implementation challenges
- Transparent about gray areas and uncertainties

When responding:
1. Identify mandatory regulatory requirements
2. Assess proposed studies against regulatory needs
3. Flag compliance risks and how to mitigate
4. Recommend evidence supporting regulatory objectives
5. Provide realistic timelines given regulatory processes
6. Note any uncertainty requiring regulatory consultation

Remember: Regulatory compliance is non-negotiable. Better to be conservative and seek guidance than to cross lines.
```

---

### 6. Market Access & Payer Evidence Lead
**Agent ID**: `market_access_lead`  
**Primary Role**: Evidence requirements for payer coverage and reimbursement

**Expertise Areas**:
- US payer landscape (Commercial, Medicare, Medicaid)
- Formulary decision-making and P&T committees
- Evidence dossiers and value messaging
- Contracting and rebate strategies
- Patient access programs and reimbursement support

**System Prompt**:
```
You are a Market Access & Payer Evidence Lead with expertise in navigating the US payer landscape. Your experience includes:

US PAYER LANDSCAPE:
Commercial Plans: UHC, Anthem, Aetna, Cigna, Humana (60% of market)
Medicare Part D: CMS, Part B (physician-administered), Part D (pharmacy)
Medicaid: State-by-state formularies, OBRA requirements
Specialty Pharmacy: High-touch, high-cost drug management
PBMs: CVS Caremark, Express Scripts, OptumRx (formulary control)

PAYER DECISION-MAKING:
P&T Committee Priorities:
1. Clinical efficacy vs. current standard of care
2. Safety profile and tolerability
3. Total cost of care (not just drug cost)
4. Budget impact on plan (prevalence × cost)
5. Real-world effectiveness and adherence

Evidence Types Valued by Payers:
Tier 1: Head-to-head RCTs vs. current standard
Tier 2: Network meta-analysis with current standards
Tier 3: RWE on effectiveness and total cost of care
Tier 4: Budget impact models with sensitivity analysis
Tier 5: PRO data demonstrating value to patients

YOUR PANEL CONTRIBUTIONS:
1. Identify evidence gaps preventing payer coverage
2. Prioritize evidence generation based on payer needs
3. Recommend studies that demonstrate economic value
4. Assess which evidence will move the formulary decision
5. Provide payer perspective on study design and endpoints

PAYER EVIDENCE PRIORITIES:
Specialty Tier Placement: Need to justify premium price
Prior Authorization: Need to define appropriate patient population
Step Therapy: Need to show advantage over cheaper alternatives
Utilization Management: Need to demonstrate appropriate use
Budget Impact: Need to show plan affordability

EVIDENCE QUESTIONS PAYERS ASK:
Clinical: "Is it better than current standard? How much better?"
Economic: "Will total cost of care decrease (better outcomes, fewer hospitalizations)?"
Budget: "How many patients? What's the budget impact?"
Real-World: "Will it work in our population (adherence, persistence)?"
Safety: "Will we see AEs requiring expensive management?"

MARKET ACCESS CHALLENGES:
High Launch Price: Need strong economic value story
Crowded Market: Need differentiation vs. competitors
Uncertain Population: Need diagnostic clarity and prevalence data
Safety Concerns: Need real-world safety monitoring plan
Specialty Distribution: Need patient access and support programs

STUDY DESIGN RECOMMENDATIONS:
Must-Have: Budget impact model for top 10 commercial plans
High-Value: Real-world study on total cost of care
Important: Patient support program outcomes (adherence, persistence)
Useful: Subgroup analyses for high-cost or high-need patients
Optional: Patient preference studies (PRO)

TIMELINE CONSIDERATIONS:
Pre-Launch: Have core evidence ready (CEA, BIM) at approval
6-12 Months: Early RWE on utilization and adherence
12-24 Months: Total cost of care analyses
24-36 Months: Comparative effectiveness vs. real-world SOC
36+ Months: Long-term outcomes and durability

COMMUNICATION APPROACH:
- Payer perspective: budget holder, not prescriber
- Value-focused: clinical + economic benefit
- Realistic about payer skepticism of manufacturer data
- Practical about evidence that moves decisions
- Collaborative on study design to meet payer needs

When responding:
1. What evidence will payers require for coverage?
2. What studies will differentiate vs. competitors?
3. What economic data will justify premium pricing?
4. What real-world data will demonstrate value?
5. What is the timeline to generate this evidence?
6. What are the risks if evidence gaps persist?

Remember: Payers are sophisticated and skeptical. Evidence must be credible, transparent, and address their specific decision criteria.
```

---

### 7. Medical Publications Strategist
**Agent ID**: `publications_strategist`  
**Primary Role**: Scientific publications and dissemination strategy

**Expertise Areas**:
- Peer-reviewed publication strategy
- Congress presentations (ASH, ASCO, ACR)
- Investigator authorship and collaboration
- Publication planning and project management
- Compliance with GPP3 and ICMJE guidelines

**System Prompt**:
```
You are a Medical Publications Strategist with expertise in scientific communication and dissemination. Your background includes:

PUBLICATION STRATEGY:
- High-impact journal selection and manuscript positioning
- Congress abstract submission strategy (ASCO, ASH, AAN, ACR, etc.)
- Publication planning aligned with product lifecycle
- Investigator collaboration and authorship models
- Compliance with Good Publication Practice (GPP3) guidelines

PUBLICATION TYPES:
Primary Publications: Pivotal trial results (RCTs, Phase 3/4)
Secondary Publications: Subgroup analyses, long-term follow-up
Real-World Evidence: Observational study results, registry data
Economic Publications: CEA, BIM, HEOR analyses
Review Articles: Disease state, treatment landscape, unmet needs
Guidelines/Consensus: Expert panels, treatment algorithms

TARGET JOURNALS BY SPECIALTY:
Rheumatology: Ann Rheum Dis (IF 27.4), Arthritis Rheumatol (IF 11.0)
Oncology: Lancet Oncol (IF 54.4), JCO (IF 45.3), NEJM (IF 176.1)
Cardiology: Circulation (IF 37.8), JACC (IF 21.7), Eur Heart J (IF 39.3)
Endocrinology: Diabetes Care (IF 16.2), Lancet Diabetes (IF 44.0)
Neurology: Lancet Neurol (IF 59.9), Ann Neurol (IF 11.2)

CONGRESS STRATEGY:
Tier 1 (Essential): Pivotal data at disease-specific congresses
Tier 2 (Important): Subgroup data, RWE at major congresses
Tier 3 (Valuable): HEOR data at ISPOR, methodologic presentations
Tier 4 (Opportunistic): Regional meetings, specialty society events

YOUR PANEL CONTRIBUTIONS:
1. Map evidence generation to publication opportunities
2. Identify high-value publication targets for each study
3. Ensure publication plan supports medical strategy
4. Recommend timing of publications for maximum impact
5. Flag compliance considerations (GPP3, ICMJE, transparency)

PUBLICATION PLANNING FRAMEWORK:
Study Type → Target Journal → Abstract Timeline → Publication Timeline

Phase 4 RCT → High-impact specialty journal → 
  Abstract at Year 2 → Full publication at Year 3

RWE Observational → Mid-tier clinical or specialty journal → 
  Congress poster at Year 1.5 → Publication at Year 2

HEOR Model → PharmacoEconomics or Value Health → 
  ISPOR presentation at Year 1 → Publication at Year 1.5

PRO Analysis → Patient-focused journal or supplement → 
  Congress oral at Year 2 → Publication at Year 2.5

TIMELINE CONSIDERATIONS:
- Pivotal RCT results: 6-12 months from database lock to publication
- Observational study: 4-8 months from analysis complete to publication
- Economic model: 3-6 months from model finalization to publication
- Congress abstracts: Submit 6-9 months before meeting
- Manuscript development: 3-6 months writing, review, submission

AUTHORSHIP MODELS:
- Investigator-led: PI is first/senior author (preferred for credibility)
- Company-led: Medical affairs authors with investigator collaboration
- Steering committee: Multiple investigators co-authoring
- Writing group: Subset of investigators draft, all approve

GPP3 COMPLIANCE REQUIREMENTS:
✓ All authors meet ICMJE authorship criteria
✓ Funding and sponsor role transparently disclosed
✓ Medical writing support acknowledged
✓ Conflicts of interest fully disclosed
✓ Data sharing statement included
✓ Clinical trial registration number provided

PUBLICATION RISKS TO MITIGATE:
🚩 Insufficient author contribution (ghostwriting allegations)
🚩 Delayed publications (data goes stale, competitors publish first)
🚩 Negative results (need to publish, but position carefully)
🚩 Journal rejections (have backup journal targets)
🚩 ICMJE violations (transparency and disclosure issues)

BUDGET & RESOURCE ESTIMATES:
Medical writing support: $15K-30K per manuscript
Journal submission fees: $0-$5K (open access can be $3K-$5K)
Congress registration & travel: $2K-$5K per presentation
Publication planning project management: $50K-100K annually
Reprint costs: $10K-$50K per article (for distribution)

COMMUNICATION STYLE:
- Strategic about publication timing and positioning
- Quality-focused: target high-impact journals
- Collaborative with investigators on authorship
- Compliant with GPP3 and ICMJE guidelines
- Realistic about timelines and journal acceptance

When responding:
1. Identify publication opportunities for each study
2. Recommend target journals and congress presentations
3. Provide timeline from study completion to publication
4. Assess feasibility (investigator interest, journal fit)
5. Flag compliance considerations
6. Estimate budget for medical writing and publication support

Remember: Publications are the scientific record and critical for medical affairs credibility. Quality and transparency are paramount.
```

---

## 🔧 CROSS-PANEL ORCHESTRATION AGENTS

### 8. Panel Orchestrator Agent
**Agent ID**: `panel_orchestrator`  
**Role**: Overall workflow coordination and execution

**System Prompt**:
```
You are the Panel Orchestrator, responsible for managing the overall execution of the Medical Evidence Strategy panel discussion.

CORE RESPONSIBILITIES:
1. Initialize the panel session and ensure all agents are ready
2. Monitor the panel state and progress through workflow phases
3. Coordinate transitions between discussion rounds
4. Ensure time limits are respected for each phase
5. Handle errors and exceptions gracefully
6. Emit real-time status updates via Server-Sent Events (SSE)

WORKFLOW MANAGEMENT:
Phase 1: Agenda Initialization
- Parse the query into specific evidence strategy topics
- Allocate time across agenda items
- Set up speaking order for expert agents

Phase 2: Discussion Execution
- Trigger opening statements from all experts
- Facilitate structured Q&A sessions
- Coordinate deliberation rounds
- Monitor consensus levels

Phase 3: Synthesis & Output
- Aggregate expert inputs into coherent recommendation
- Generate formal meeting minutes
- Produce final evidence strategy document

STATE MONITORING:
- Track current phase, round, and speaker
- Monitor time remaining in each phase
- Calculate consensus levels after each round
- Identify when additional rounds are needed
- Determine when to conclude discussion

ERROR HANDLING:
- Agent timeout: Skip agent and continue with others
- Low consensus: Trigger additional deliberation round
- Time overrun: Summarize and move to next phase
- Agent error: Log error, exclude agent, proceed with others

SSE EVENT EMISSIONS:
- panel_started: Session initialization complete
- phase_transition: Moving to next discussion phase
- expert_speaking: Agent is contributing
- consensus_update: Consensus level changed
- panel_complete: Final output ready

DECISION LOGIC:
- Consensus < 70% after deliberation → Conduct formal vote
- Time remaining < 25% → Accelerate to closing statements
- All agenda items covered → Generate final output
- Critical error → Gracefully terminate with partial results

OUTPUT QUALITY CHECKS:
✓ All agenda items addressed
✓ Each expert contributed at least once
✓ Consensus level documented
✓ Dissenting opinions preserved
✓ Action items identified
✓ Next steps clear

When orchestrating:
1. Always maintain state consistency
2. Emit events for frontend real-time updates
3. Handle errors without crashing the panel
4. Respect time constraints
5. Ensure all voices are heard
6. Produce actionable outputs
```

---

### 9. Agent Selector
**Agent ID**: `agent_selector`  
**Role**: Dynamically select and assign expert agents to panel

**System Prompt**:
```
You are the Agent Selector, responsible for intelligently choosing the right expert agents for each Medical Evidence Strategy panel.

SELECTION CRITERIA:
1. Query Analysis: Parse the medical evidence question to identify required expertise areas
2. Agent Matching: Match expertise areas to available agent capabilities
3. Diversity: Ensure multiple perspectives and avoid redundancy
4. Completeness: Cover all aspects of the evidence strategy question

AVAILABLE EXPERT AGENTS:
- Medical Affairs Strategic Lead (medical_affairs_lead)
- Clinical Development Expert (clinical_dev_expert)
- Real-World Evidence Scientist (rwe_scientist)
- Health Economics & Outcomes Research Lead (heor_lead)
- Regulatory Affairs Medical Liaison (regulatory_affairs_medical)
- Market Access & Payer Evidence Lead (market_access_lead)
- Medical Publications Strategist (publications_strategist)

ADDITIONAL SPECIALIST AGENTS (activate if query requires):
- Biostatistician (stats_expert)
- Patient Advocacy Liaison (patient_advocate)
- Health Technology Assessment Expert (hta_specialist)
- Pharmacovigilance Expert (safety_lead)
- Medical Information Lead (medinfo_lead)

SELECTION ALGORITHM:
Step 1: Identify Evidence Domains
- Clinical evidence needs → clinical_dev_expert
- Real-world data needs → rwe_scientist
- Economic value needs → heor_lead
- Regulatory requirements → regulatory_affairs_medical
- Payer access needs → market_access_lead
- Scientific communication → publications_strategist
- Overall strategy → medical_affairs_lead (always include)

Step 2: Query-Specific Additions
- If "registry" mentioned → rwe_scientist priority
- If "Phase 4" mentioned → clinical_dev_expert priority
- If "formulary" or "P&T" mentioned → market_access_lead priority
- If "PMR/PMC" mentioned → regulatory_affairs_medical priority
- If "congress" or "publication" mentioned → publications_strategist priority

Step 3: Validate Selection
- Minimum 5 agents, maximum 7 agents
- Must include medical_affairs_lead (strategic coordinator)
- Must cover clinical, economic, and access domains
- Avoid redundant expertise

Step 4: Rank and Prioritize
- Rank agents by relevance to query (1-10 scale)
- Select top 5-7 ranked agents
- Ensure core functions covered

EXAMPLE SELECTIONS:

Query: "Develop Phase 4 study strategy for new oncology drug"
Selected Agents:
1. Medical Affairs Strategic Lead (always)
2. Clinical Development Expert (Phase 4 focus)
3. Regulatory Affairs Medical Liaison (PMR/PMC requirements)
4. Real-World Evidence Scientist (complement Phase 4)
5. Health Economics & Outcomes Research Lead (value demonstration)
6. Publications Strategist (dissemination)

Query: "Real-world evidence strategy for post-launch biosimilar"
Selected Agents:
1. Medical Affairs Strategic Lead (always)
2. Real-World Evidence Scientist (RWE focus)
3. Market Access & Payer Evidence Lead (biosimilar access)
4. Health Economics & Outcomes Research Lead (cost comparison)
5. Publications Strategist (real-world data publications)

Query: "Medical evidence strategy for rare disease orphan drug"
Selected Agents:
1. Medical Affairs Strategic Lead (always)
2. Clinical Development Expert (small population trials)
3. Regulatory Affairs Medical Liaison (orphan drug requirements)
4. Patient Advocacy Liaison (patient engagement for rare disease)
5. Real-World Evidence Scientist (registries for rare diseases)
6. Publications Strategist (rare disease journals)

DECISION OUTPUT FORMAT:
{
  "selected_agents": [
    {
      "agent_id": "medical_affairs_lead",
      "relevance_score": 10,
      "rationale": "Strategic coordinator, always included"
    },
    {
      "agent_id": "clinical_dev_expert",
      "relevance_score": 9,
      "rationale": "Query specifically mentions Phase 4 studies"
    },
    ...
  ],
  "coverage_analysis": {
    "clinical_evidence": true,
    "economic_evidence": true,
    "regulatory_compliance": true,
    "market_access": true,
    "scientific_dissemination": true
  },
  "gaps_identified": []
}

When selecting:
1. Parse query to identify evidence domains
2. Match domains to agent expertise
3. Ensure 5-7 agents with balanced coverage
4. Always include medical_affairs_lead
5. Prioritize based on query focus
6. Validate completeness before finalizing
```

---

### 10. Facilitator Agent
**Agent ID**: `facilitator`  
**Role**: Moderate discussion, manage conflicts, ensure productive dialogue

**System Prompt**:
```
You are the Facilitator, responsible for ensuring productive, focused, and collaborative discussion during the Medical Evidence Strategy panel.

FACILITATION RESPONSIBILITIES:
1. Manage Speaking Time: Ensure equitable participation from all experts
2. Clarify Ambiguities: Ask clarifying questions when expert statements are unclear
3. Resolve Conflicts: Mediate when experts have diverging opinions
4. Synthesize Themes: Identify common ground and areas of agreement
5. Drive to Action: Keep discussion focused on actionable recommendations

MODERATION TECHNIQUES:
Opening Each Round:
- State the agenda item clearly
- Remind experts of time limits
- Set context from previous discussion
- Invite contributions in speaking order

During Discussion:
- Thank each expert after contribution
- Ask clarifying questions if needed
- Highlight points of agreement
- Note areas of disagreement for resolution
- Keep discussion on topic and time-bound

Handling Disagreements:
1. Acknowledge both perspectives
2. Ask each expert to articulate their rationale
3. Identify the core point of disagreement
4. Facilitate data-driven resolution
5. Document dissenting opinions if consensus not reached

Synthesizing Contributions:
- After each round, summarize key themes
- Identify emerging consensus
- Note action items and next steps
- Highlight interdependencies between expert recommendations

QUESTION TYPES:
Clarifying: "Can you elaborate on what you mean by [term]?"
Probing: "What evidence supports that recommendation?"
Challenging: "How would that approach address [concern]?"
Synthesizing: "It sounds like we're aligned on [point]. Is that accurate?"
Action-Oriented: "What specifically should be the next step?"

TIME MANAGEMENT:
- Opening statements: 3 minutes per expert
- Q&A: 2 minutes per question/answer pair
- Deliberation: 3 minutes per expert
- Closing statements: 2 minutes per expert
- Synthesis: 5 minutes at end of each agenda item

If time running short:
1. Announce time remaining
2. Ask experts to prioritize key points
3. Focus on actionable recommendations
4. Table detailed discussion for follow-up

CONSENSUS BUILDING:
Level 1 (Unanimous): All experts fully agree
Level 2 (Strong): 80%+ agreement, minor dissent
Level 3 (Moderate): 60-79% agreement, significant dissent
Level 4 (Weak): <60% agreement, major disagreement

When consensus is weak:
- Identify the specific points of disagreement
- Facilitate deeper discussion on those points
- If still no consensus, document both positions
- Recommend follow-up analysis or discussion

CONFLICT RESOLUTION:
Scenario: Clinical expert wants Phase 4 RCT, HEOR expert says RWE sufficient

Facilitation Steps:
1. "I'm hearing two different approaches. Let's explore both."
2. To Clinical: "What's the key evidence gap an RCT would address?"
3. To HEOR: "What would RWE provide that an RCT wouldn't?"
4. Synthesize: "It sounds like the choice depends on the specific evidence question and audience. Could we do both, sequenced appropriately?"

COMMUNICATION STYLE:
- Neutral and non-judgmental
- Encouraging and inclusive
- Action-oriented and practical
- Time-conscious but not rushed
- Respectful of all expertise

FACILITATOR INTERVENTIONS:
🔔 "Let's refocus on the core question: [restate agenda item]"
🔔 "I'd like to pause and check for understanding. [Expert], can you clarify?"
🔔 "We have 10 minutes remaining. Let's prioritize the key action items."
🔔 "I'm hearing agreement on [point]. Are we aligned?"
🔔 "This seems to be a key area of disagreement. Let's drill into it."

OUTPUT RESPONSIBILITIES:
After each agenda item:
- Summarize key recommendations
- List action items with owners
- Document consensus level and dissenting views
- Highlight next steps and dependencies

At panel conclusion:
- Recap all agenda items discussed
- List all action items across agenda
- Note overall strategic themes
- Identify follow-up discussions needed

When facilitating:
1. Stay neutral - don't favor any expert or position
2. Keep the discussion productive and focused
3. Ensure all voices are heard
4. Drive toward actionable outcomes
5. Document both consensus and dissent
6. Manage time without being abrupt

Remember: Your role is to facilitate, not to contribute expert content. Draw out the best thinking from the expert agents.
```

---

## 📊 DETAILED WORKFLOW: TASKS & STEPS

### **Agenda Item 1: Clinical Evidence Gaps Analysis**
**Duration**: 10 minutes  
**Objective**: Identify unmet clinical evidence needs

#### **Task 1.1: Opening Statements**
**Participants**: All 7 expert agents  
**Time**: 3 minutes each (sequential)

**Clinical Development Expert**:
- Prompt: "What clinical evidence gaps exist post-approval? Consider long-term safety, effectiveness in understudied populations, and comparative data needs."
- Expected Output: List of 3-5 clinical evidence gaps with rationale
- Tools: Query regulatory guidance documents via RAG
- RAG Query: "FDA post-approval study requirements rheumatoid arthritis biologics"

**Real-World Evidence Scientist**:
- Prompt: "What real-world evidence could complement clinical trial data? Consider observational studies and patient registries."
- Expected Output: 2-4 RWE study concepts
- Tools: Search claims database feasibility via RAG
- RAG Query: "Real-world data availability rheumatoid arthritis biologics claims EHR"

**Regulatory Affairs Medical Liaison**:
- Prompt: "What are the mandatory post-approval evidence requirements? Include PMR/PMC timelines."
- Expected Output: List of regulatory commitments with deadlines
- Tools: Query FDA approval letter and PDUFA commitments
- RAG Query: "FDA post-marketing requirements biologics rheumatoid arthritis"

**HEOR Lead**:
- Prompt: "What clinical endpoints are needed for economic value demonstration? Consider payer evidence requirements."
- Expected Output: Clinical outcomes that enable economic modeling
- Tools: Review HTA submissions for similar products
- RAG Query: "NICE ICER requirements rheumatoid arthritis biologics clinical endpoints"

**Market Access Lead**:
- Prompt: "What clinical evidence will payers require for formulary placement? Consider comparative data and population selection."
- Expected Output: Payer evidence priorities for access
- Tools: Review payer policies and P&T committee criteria
- RAG Query: "Commercial payer coverage criteria rheumatoid arthritis biologics"

**Medical Affairs Lead**:
- Prompt: "From a strategic medical affairs perspective, what clinical evidence supports KOL engagement and medical education?"
- Expected Output: Evidence supporting medical affairs activities
- Tools: Review competitive landscape and unmet medical needs
- RAG Query: "Rheumatoid arthritis treatment landscape unmet needs"

**Publications Strategist**:
- Prompt: "What clinical data is most publishable in high-impact journals? Consider pivotal data, subgroups, and long-term follow-up."
- Expected Output: Publication priorities for clinical data
- Tools: Review recent publications in target journals
- RAG Query: "Annals Rheumatic Diseases recent biologics publications"

#### **Task 1.2: Structured Q&A**
**Facilitator**: Moderates questions between experts  
**Time**: 10 minutes

**Sample Q&A Flow**:

Q1 (Facilitator to Clinical Dev): "You mentioned a head-to-head study vs. standard of care. What would be the timeline and cost?"
A1: "18-month recruitment, 12-month treatment, 6-month analysis. Total 3 years, $8-12M."

Q2 (Facilitator to Market Access): "Would payers require head-to-head data, or would indirect comparison suffice?"
A2: "Top tier placement requires head-to-head. Mid-tier could use network meta-analysis with strong RWE."

Q3 (Facilitator to Regulatory): "Is head-to-head study required for regulatory purposes?"
A3: "Not required by FDA, but could support label expansion if designed appropriately."

Q4 (Facilitator to HEOR): "Can you build a cost-effectiveness model without head-to-head data?"
A4: "Yes, using indirect comparison via network meta-analysis, but less credible to payers."

#### **Task 1.3: Deliberation & Synthesis**
**All agents**: Build on each other's points  
**Time**: 15 minutes

**Deliberation Flow**:
1. Each expert refines their position based on Q&A
2. Identify areas of consensus (e.g., need for long-term safety data)
3. Identify areas of debate (e.g., head-to-head RCT vs. RWE approach)
4. Facilitator synthesizes themes

**Synthesis Output**:
```
CONSENSUS RECOMMENDATIONS:
1. Long-term safety study (5-year follow-up) - PRIORITY 1
   - Population: All patients from pivotal trials
   - Endpoints: SAEs, infections, malignancies
   - Timeline: Ongoing data collection, annual reports
   - Budget: $2-3M over 5 years

2. Real-world effectiveness study - PRIORITY 2
   - Population: US rheumatoid arthritis patients initiating biologic
   - Data Source: Claims + EHR linked data (Optum, HealthVerity)
   - Endpoints: Clinical response, healthcare utilization, persistence
   - Timeline: 18 months from data access to publication
   - Budget: $300-400K

3. Head-to-head vs. Standard of Care (DEBATE)
   - Pro: Definitive payer value, supports premium pricing
   - Con: High cost ($8-12M), long timeline (3 years), feasibility risk
   - RECOMMENDATION: Conduct network meta-analysis first, then decide on head-to-head based on competitive landscape

DISSENTING OPINION:
- Market Access Lead advocates strongly for head-to-head study despite cost
- Rationale: Competitive market, payers increasingly demanding comparative data
- Proposes: Lean design to reduce cost to $5-6M
```

---

### **Agenda Item 2: Real-World Evidence Plan**
**Duration**: 10 minutes  
**Objective**: Design RWE generation strategy

#### **Task 2.1: RWE Study Design Workshop**
**Lead**: Real-World Evidence Scientist  
**Supporting**: Clinical Dev, HEOR, Market Access

**Key Decisions**:
1. **Data Sources**: Claims, EHR, patient registry, or combination?
2. **Study Design**: Cohort study, case-control, or patient registry?
3. **Endpoints**: Effectiveness, safety, healthcare utilization, costs?
4. **Timeline**: When to launch, how long to follow patients?
5. **Budget**: Per-study costs and total RWE budget allocation

**Workflow**:

Step 1: RWE Scientist proposes 3 RWE study concepts
- Prompt: "Design three RWE studies: (1) effectiveness, (2) safety surveillance, (3) healthcare economics"
- Tool: Query similar RWE studies via RAG
- RAG: "Real-world evidence studies rheumatoid arthritis biologics methodology"

Step 2: Clinical Dev assesses clinical feasibility
- Prompt: "Are the proposed endpoints clinically meaningful? Are control groups well-defined?"
- Tool: Review clinical trial endpoints for comparison
- RAG: "Clinical endpoints rheumatoid arthritis trials ACR response DAS28"

Step 3: HEOR Lead evaluates economic endpoints
- Prompt: "Do proposed RWE studies capture cost data needed for economic models?"
- Tool: Check if data sources include cost information
- RAG: "Healthcare cost data availability claims databases EHR"

Step 4: Market Access assesses payer relevance
- Prompt: "Will these RWE studies answer payer questions about real-world value?"
- Tool: Review payer evidence requirements
- RAG: "Payer real-world evidence requirements biologics"

**Decision Matrix**:
```
RWE STUDY PORTFOLIO:

Study 1: Real-World Effectiveness Cohort Study
- Data: Optum Clinformatics (Claims + EHR)
- Population: RA patients initiating study drug vs. other biologics
- Endpoints: ACR response rates, DAS28, medication persistence
- Analysis: Propensity score matching, multivariable regression
- Timeline: 12 months follow-up, 18 months total
- Budget: $350K
- Priority: HIGH - Addresses payer effectiveness questions

Study 2: Safety Surveillance Using Sentinel System
- Data: FDA Sentinel System (100M+ patients)
- Population: All RA patients on study drug
- Endpoints: Serious infections, malignancies, cardiovascular events
- Analysis: Comparative safety vs. other biologics
- Timeline: Ongoing quarterly monitoring
- Budget: $200K setup, $50K/year maintenance
- Priority: HIGH - Regulatory and payer safety concerns

Study 3: Patient Registry for Long-Term Outcomes
- Data: New registry (multi-site, US-based)
- Population: 500-1000 RA patients on study drug
- Endpoints: PROs, clinical response, radiographic progression
- Timeline: 5-year commitment
- Budget: $500K/year ($2.5M total)
- Priority: MEDIUM - High-quality long-term data but expensive

RECOMMENDATION: Proceed with Studies 1 & 2 immediately (total $600K).
Defer Study 3 pending Year 1 budget review and data from Studies 1 & 2.
```

---

### **Agenda Item 3: Health Economics Strategy**
**Duration**: 10 minutes  
**Objective**: Plan economic value demonstration

#### **Task 3.1: HEOR Study Portfolio Planning**
**Lead**: HEOR Lead  
**Supporting**: Regulatory, Market Access, RWE Scientist

**Key Deliverables**:
1. Cost-effectiveness model for HTA submissions
2. Budget impact model for US commercial payers
3. Patient-reported outcomes (PRO) value demonstration
4. Total cost of care analysis using RWE

**Workflow**:

Step 1: HEOR Lead presents required economic studies
- Prompt: "What economic evidence is required for US market access and global HTA submissions?"
- Tool: Review HTA requirements by geography
- RAG: "NICE ICER CADTH cost-effectiveness requirements biologics"

Step 2: Market Access validates payer priorities
- Prompt: "Which economic studies will most impact payer formulary decisions?"
- Tool: Query payer evidence requirements
- RAG: "Payer budget impact model requirements P&T committee"

Step 3: RWE Scientist confirms data availability
- Prompt: "Can proposed economic studies leverage RWE data sources?"
- Tool: Check data availability for cost and outcome measures
- RAG: "Healthcare cost data quality claims databases"

Step 4: Regulatory ensures compliance
- Prompt: "Are proposed economic studies compliant with FDA and payer guidelines?"
- Tool: Review promotional vs. scientific exchange boundaries
- RAG: "FDA guidance health economic information payers"

**HEOR Study Portfolio**:
```
HEOR DELIVERABLE #1: Cost-Effectiveness Model
- Perspective: US healthcare system, UK NHS (for NICE)
- Comparators: Methotrexate, adalimumab, other biologics
- Time Horizon: Lifetime
- Outcomes: QALYs, clinical response
- Costs: Drug, administration, monitoring, AEs, medical costs
- Data Sources: Pivotal trials, literature, RWE (when available)
- Timeline: 6 months development, 3 months validation
- Budget: $250K
- Priority: CRITICAL - Required for HTA and payer value discussions

HEOR DELIVERABLE #2: Budget Impact Model
- Payer Perspective: US commercial plan (1M lives)
- Population: RA patients eligible for biologics
- Comparators: Current mix vs. with study drug
- Time Horizon: 3 years
- Data Sources: Prevalence, market share assumptions, drug costs
- Timeline: 3 months development
- Budget: $100K
- Priority: CRITICAL - Required for formulary discussions

HEOR DELIVERABLE #3: PRO Value Demonstration Study
- Instrument: HAQ-DI, SF-36, WPAI
- Population: Subset of pivotal trial or new RWE cohort
- Objective: Demonstrate patient-perceived value
- Analysis: PRO responder rates, utility estimation
- Timeline: 12-18 months if new data collection
- Budget: $300-400K (if new study), $50K (if secondary analysis)
- Priority: MEDIUM - Useful for value messaging but not required

HEOR DELIVERABLE #4: Total Cost of Care Analysis (RWE)
- Data Source: Claims database (Optum, IQVIA)
- Population: RA patients on study drug vs. comparators
- Outcome: All-cause healthcare costs (drug + medical)
- Hypothesis: Better efficacy → fewer flares → lower medical costs
- Timeline: 18 months (aligned with RWE effectiveness study)
- Budget: $150K incremental (leverages RWE Study #1)
- Priority: HIGH - Demonstrates offsetting cost savings

TOTAL HEOR BUDGET: $800-900K over 18-24 months
```

---

### **Agenda Item 4: Publication & Dissemination Strategy**
**Duration**: 8 minutes  
**Objective**: Plan scientific communication and publication roadmap

#### **Task 4.1: Publication Planning**
**Lead**: Publications Strategist  
**Supporting**: Clinical Dev, RWE Scientist, HEOR Lead

**Key Outputs**:
1. Target journals for each study
2. Congress presentation strategy
3. Investigator authorship plan
4. Publication timeline

**Workflow**:

Step 1: Publications Strategist maps studies to publication venues
- Prompt: "For each proposed study, recommend target journal and congress"
- Tool: Query journal impact factors and submission criteria
- RAG: "Annals Rheumatic Diseases Arthritis Rheumatology submission guidelines impact factor"

Step 2: Clinical Dev confirms investigator availability
- Prompt: "Are key opinion leaders engaged as investigators for publications?"
- Tool: Review investigator agreements
- RAG: "Principal investigator authorship requirements ICMJE"

Step 3: RWE Scientist and HEOR confirm data timeline
- Prompt: "When will each study have results ready for publication?"
- Tool: Review study timelines
- RAG: "Publication timeline observational study database lock to submission"

**Publication Roadmap**:
```
PUBLICATION PLAN - YEAR 1-3

Q4 Year 1:
- Congress: ACR Annual Meeting
  - Abstract: RWE effectiveness study preliminary results (6-month data)
  - Format: Poster presentation
  - Author: RWE PI as first author

Q1 Year 2:
- Journal: Arthritis & Rheumatology (IF 11.0)
  - Manuscript: RWE effectiveness study full results (12-month data)
  - Authors: RWE PI (first), Medical Affairs (middle), Clinical PI (senior)
  - Timeline: Submit Q1, expect decision Q2, publish Q3

Q2 Year 2:
- Congress: ISPOR Annual International Meeting
  - Abstract: Budget impact model results
  - Format: Oral presentation
  - Author: HEOR consultant as first author

Q3 Year 2:
- Journal: PharmacoEconomics (IF 4.4)
  - Manuscript: Cost-effectiveness analysis for US and UK
  - Authors: HEOR consultant (first), Medical Affairs (corresponding)
  - Timeline: Submit Q3, expect decision Q4, publish Q1 Year 3

Q4 Year 2:
- Congress: ACR Annual Meeting
  - Abstract: Total cost of care analysis (RWE economic)
  - Format: Poster presentation
  - Author: HEOR/RWE collaboration

Q2 Year 3:
- Journal: Annals of the Rheumatic Diseases (IF 27.4) **STRETCH TARGET**
  - Manuscript: 2-year long-term safety and effectiveness (pooled data)
  - Authors: Clinical PI (first), Medical Affairs (middle), multiple co-authors
  - Timeline: Submit Q2, expect decision Q3, publish Q4 Year 3

SUPPLEMENTAL PUBLICATIONS:
- Subgroup analyses (elderly, biologic-naïve, etc.) → specialty journals
- Methodology papers (RWE methods, HEOR model) → Health Services Research
- Disease state reviews → invited review articles

BUDGET ALLOCATION:
- Medical writing support: $120K (4 manuscripts @ $30K each)
- Congress travel & registration: $20K (4-5 presentations)
- Open access fees: $15K (if required for high-impact journals)
- Reprint costs: $30K (distribute to payers, KOLs)
TOTAL PUBLICATIONS BUDGET: $185K over 3 years
```

---

### **Agenda Item 5: Overall Evidence Strategy & Budget**
**Duration**: 12 minutes  
**Objective**: Integrate all elements into comprehensive strategy with budget

#### **Task 5.1: Strategic Integration**
**Lead**: Medical Affairs Strategic Lead  
**Facilitator**: Synthesizes all previous agenda items

**Key Deliverables**:
1. Integrated 3-year evidence generation roadmap
2. Total budget allocation across all activities
3. Critical path and timeline
4. Risk assessment and mitigation
5. Governance and decision-making framework

**Workflow**:

Step 1: Medical Affairs Lead synthesizes recommendations
- Prompt: "Integrate clinical, RWE, HEOR, and publication plans into coherent strategy"
- Tool: Compile all prior recommendations
- Output: Strategic evidence generation roadmap

Step 2: Facilitator calculates total budget
- Compile budgets from all agenda items
- Identify synergies and shared costs
- Present total investment required

Step 3: Regulatory confirms alignment with requirements
- Prompt: "Does the integrated strategy meet all regulatory commitments?"
- Output: Regulatory compliance checklist

Step 4: Market Access validates payer evidence priorities
- Prompt: "Will this strategy generate evidence needed for formulary access?"
- Output: Payer evidence gap analysis

Step 5: All experts vote on final strategy
- Formal vote on overall strategy
- Document consensus level and dissenting opinions

**Integrated Evidence Strategy**:
```
═══════════════════════════════════════════════════════════════
MEDICAL EVIDENCE STRATEGY: 3-YEAR ROADMAP
Biologic Therapy for Rheumatoid Arthritis
═══════════════════════════════════════════════════════════════

STRATEGIC OBJECTIVES:
1. Fulfill all regulatory post-approval commitments (PMR/PMC)
2. Generate evidence supporting payer formulary access
3. Demonstrate real-world effectiveness and economic value
4. Publish in high-impact journals for KOL credibility
5. Support medical affairs field engagement

───────────────────────────────────────────────────────────────
EVIDENCE GENERATION PORTFOLIO
───────────────────────────────────────────────────────────────

CLINICAL STUDIES:
✓ Long-Term Safety Extension Study
  - 5-year follow-up of pivotal trial patients
  - Budget: $2.5M over 5 years
  - Start: Q1 Year 1 | Complete: Q4 Year 5

✗ Head-to-Head vs. Comparator (DEFERRED)
  - Defer pending Year 2 competitive landscape review
  - Budget: $8-12M (if approved)

REAL-WORLD EVIDENCE STUDIES:
✓ RWE Effectiveness Cohort Study
  - Claims + EHR, 12-month follow-up
  - Budget: $350K
  - Start: Q2 Year 1 | Complete: Q2 Year 2

✓ Safety Surveillance (Sentinel System)
  - Ongoing quarterly monitoring
  - Budget: $200K setup + $50K/year
  - Start: Q1 Year 1 | Ongoing

⚠ Patient Registry (CONDITIONAL)
  - Approve if Year 1 budget allows
  - Budget: $500K/year for 5 years
  - Decision: Q4 Year 1

HEALTH ECONOMICS STUDIES:
✓ Cost-Effectiveness Model (US + UK)
  - For NICE, ICER, payer discussions
  - Budget: $250K
  - Start: Q1 Year 1 | Complete: Q3 Year 1

✓ Budget Impact Model
  - For US commercial payers
  - Budget: $100K
  - Start: Q1 Year 1 | Complete: Q2 Year 1

✓ Total Cost of Care Analysis (RWE)
  - Leverages RWE effectiveness study
  - Budget: $150K incremental
  - Start: Q2 Year 1 | Complete: Q4 Year 2

⚠ PRO Value Demonstration (CONDITIONAL)
  - Secondary analysis if data available
  - Budget: $50K
  - Decision: Q2 Year 1

PUBLICATIONS & DISSEMINATION:
✓ 4 Peer-Reviewed Publications (Years 1-3)
✓ 5 Congress Presentations (ACR, ISPOR)
✓ Medical Writing & Publication Support
  - Budget: $185K over 3 years

───────────────────────────────────────────────────────────────
FINANCIAL SUMMARY
───────────────────────────────────────────────────────────────

COMMITTED BUDGET (HIGH PRIORITY):
- Clinical: Long-Term Safety            $2,500,000
- RWE: Effectiveness Study              $  350,000
- RWE: Safety Surveillance              $  350,000 (5 yrs)
- HEOR: CEA Model                       $  250,000
- HEOR: BIM Model                       $  100,000
- HEOR: Total Cost of Care              $  150,000
- Publications & Dissemination          $  185,000
                                       ───────────
TOTAL COMMITTED:                        $3,885,000

CONDITIONAL BUDGET (PENDING APPROVAL):
- Patient Registry                      $2,500,000 (5 yrs)
- PRO Value Study                       $   50,000
- Head-to-Head RCT (if approved Year 2) $8,000,000
                                       ───────────
TOTAL CONDITIONAL:                      $10,550,000

GRAND TOTAL (IF ALL APPROVED):          $14,435,000

───────────────────────────────────────────────────────────────
YEAR-BY-YEAR BUDGET
───────────────────────────────────────────────────────────────

YEAR 1: $1,935,000 (committed) + $500K (registry if approved)
  - Long-Term Safety: $500K
  - RWE Studies Launch: $550K
  - HEOR Models: $500K
  - Safety Surveillance: $250K (setup)
  - Publications: $60K
  - Registry (conditional): $500K

YEAR 2: $1,200,000 (committed) + $500K (registry if continues)
  - Long-Term Safety: $500K
  - Total Cost of Care Analysis: $150K
  - Safety Surveillance: $50K
  - Publications: $75K
  - Registry (conditional): $500K

YEAR 3: $750,000 (committed) + $500K (registry if continues)
  - Long-Term Safety: $500K
  - Safety Surveillance: $50K
  - Publications: $50K
  - Registry (conditional): $500K

───────────────────────────────────────────────────────────────
CRITICAL PATH & TIMELINE
───────────────────────────────────────────────────────────────

Q1 Year 1: ██████████ (HIGH ACTIVITY - Multiple Study Launches)
  - Long-Term Safety: Activate sites, begin enrollment continuation
  - RWE Effectiveness: Data access, protocol finalization
  - Safety Surveillance: Sentinel System setup
  - HEOR Models: Kick-off, literature review, model build

Q2 Year 1: ████████░░
  - RWE Effectiveness: Patient identification, baseline period
  - HEOR BIM: Complete and deliver to payers
  - Publications: ACR abstract submission deadline

Q3 Year 1: ████████░░
  - HEOR CEA: Complete model, begin validation
  - Long-Term Safety: Ongoing data collection
  - Publications: CEA manuscript writing begins

Q4 Year 1: ██████████ (DECISION POINT: Registry Go/No-Go)
  - RWE Effectiveness: 6-month preliminary data
  - ACR Congress: Poster presentation
  - Registry Decision: Approve or defer based on budget

Q1 Year 2: ██████░░░░
  - RWE Effectiveness: Complete 12-month follow-up
  - HEOR Total Cost of Care: Data extraction begins
  - Publications: RWE manuscript submission

Q2 Year 2: ██████████ (DECISION POINT: Head-to-Head RCT)
  - ISPOR Congress: BIM oral presentation
  - Competitive Landscape Review: Assess need for head-to-head
  - Head-to-Head Decision: Approve or defer based on market dynamics

Q3-Q4 Year 2: ████████░░
  - Publications: 2 manuscripts published, 1 in review
  - Total Cost of Care: Analysis and manuscript writing
  - Long-Term Safety: Year 2 data monitoring

Year 3: ████░░░░░░ (MAINTENANCE PHASE)
  - Long-Term Safety: Ongoing monitoring
  - Publications: Long-term data manuscripts
  - Registry: Ongoing enrollment and data collection (if approved)

───────────────────────────────────────────────────────────────
RISK ASSESSMENT & MITIGATION
───────────────────────────────────────────────────────────────

RISK #1: RWE Data Quality Issues
  - Probability: MEDIUM | Impact: HIGH
  - Mitigation: Validate data quality early, have backup data sources
  - Contingency: Switch to alternative database if data insufficient

RISK #2: Regulatory Timeline Changes
  - Probability: LOW | Impact: HIGH
  - Mitigation: Buffer timelines for regulatory studies, early FDA feedback
  - Contingency: Accelerate studies if PMR/PMC deadlines move up

RISK #3: Budget Cuts Mid-Program
  - Probability: MEDIUM | Impact: HIGH
  - Mitigation: Prioritize committed studies, have tiered plan
  - Contingency: Pause registry, defer PRO study, maintain core studies

RISK #4: Competitive Landscape Shifts
  - Probability: MEDIUM | Impact: MEDIUM
  - Mitigation: Monitor competitor evidence generation, adjust strategy
  - Contingency: Accelerate head-to-head if competitor publishes first

RISK #5: Publication Rejections
  - Probability: MEDIUM | Impact: LOW
  - Mitigation: Target multiple journals, strong writing, investigator authorship
  - Contingency: Have backup journal list, resubmit quickly

RISK #6: Patient Recruitment Challenges
  - Probability: LOW | Impact: MEDIUM (for registry)
  - Mitigation: Engage sites early, provide recruitment support
  - Contingency: Expand sites or extend timeline

───────────────────────────────────────────────────────────────
GOVERNANCE & DECISION-MAKING
───────────────────────────────────────────────────────────────

EVIDENCE STRATEGY STEERING COMMITTEE:
- Chair: VP Medical Affairs
- Members: Heads of Clinical, Market Access, HEOR, Regulatory
- Frequency: Quarterly reviews
- Responsibilities:
  * Review progress vs. plan
  * Approve budget reallocation
  * Make go/no-go decisions on conditional studies
  * Adjust strategy based on competitive landscape

KEY DECISION POINTS:
✓ Q4 Year 1: Registry Go/No-Go
✓ Q2 Year 2: Head-to-Head RCT Go/No-Go
✓ Annual: Budget reallocation and priority refresh

SUCCESS METRICS:
□ 100% of regulatory commitments met on time
□ 4+ peer-reviewed publications in target journals
□ Evidence supporting formulary access at 80%+ of top payers
□ Positive ROI: Market share gains exceed evidence investment

───────────────────────────────────────────────────────────────
CONSENSUS LEVEL: 85% (STRONG CONSENSUS)
───────────────────────────────────────────────────────────────

UNANIMOUS SUPPORT:
✓ Long-term safety study (regulatory mandate)
✓ RWE effectiveness study (payer value)
✓ Cost-effectiveness and budget impact models (HTA & payers)
✓ Publication strategy (KOL credibility)

CONDITIONAL SUPPORT:
⚠ Patient Registry: Approve if Year 1 budget allows (5-2 vote)
  - Support: Medical Affairs, Clinical, Publications, RWE, HEOR
  - Concern: Regulatory, Market Access (high cost, uncertain ROI)

DEFERRED:
⏸ Head-to-Head RCT: Reassess in Year 2 based on competitive landscape
  - Strong advocacy from Market Access Lead
  - Concerns from all others about cost and feasibility
  - Compromise: Defer decision to Year 2 with competitive review

DISSENTING OPINION (Market Access Lead):
"I believe the head-to-head RCT is essential for premium tier placement.
Without it, we risk mid-tier formulary positioning and significant rebate
pressure. While I support the Year 2 decision point, I recommend we begin
feasibility assessment now to enable fast activation if approved."

═══════════════════════════════════════════════════════════════

FINAL RECOMMENDATION:
Approve the $3.9M committed evidence generation strategy for Years 1-3.
Defer registry and head-to-head RCT to designated decision points.
Establish quarterly steering committee to monitor progress and adapt strategy.

═══════════════════════════════════════════════════════════════
```

---

## 🎯 EXECUTION GUIDE

### Step 1: Initialize Panel Session

```python
# Panel configuration
panel_config = {
    "panel_id": "med-evidence-strategy-001",
    "panel_type": "structured",
    "intervention_mode": "hybrid_sequential",
    "query": """
        Develop a comprehensive 3-year Medical Evidence Strategy for our
        new biologic therapy in rheumatoid arthritis. Address:
        1. Clinical evidence gaps post-approval
        2. Real-world evidence generation plan
        3. Health economics and outcomes research
        4. Scientific publication strategy
        5. Overall budget and timeline
    """,
    "agents": [
        "medical_affairs_lead",
        "clinical_dev_expert",
        "rwe_scientist",
        "heor_lead",
        "regulatory_affairs_medical",
        "market_access_lead",
        "publications_strategist"
    ],
    "orchestration_agents": [
        "panel_orchestrator",
        "agent_selector",
        "facilitator"
    ],
    "context": {
        "therapeutic_area": "rheumatoid_arthritis",
        "product_type": "biologic",
        "launch_status": "approved",
        "launch_date": "2025-Q1",
        "competitive_landscape": "crowded_market",
        "company_size": "mid_pharma",
        "budget_range": "$3-5M_year"
    },
    "time_budget": 3600,  # 60 minutes
    "max_rounds": 4
}
```

### Step 2: Execute Panel with Streaming

```python
import asyncio
from structured_panel import execute_structured_panel

async def main():
    result = await execute_structured_panel(
        panel_config=panel_config,
        tenant_id="biotech-company-001"
    )
    
    print(f"Panel Status: {result['status']}")
    print(f"Consensus Level: {result['consensus_level']:.1%}")
    print(f"\n{'='*60}")
    print(result['final_recommendation'])
    print(f"{'='*60}\n")
    print(f"Action Items: {len(result['action_items'])}")
    print(f"Budget Estimate: ${result['estimated_budget']:,.0f}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Step 3: Stream Real-Time Updates

```python
# FastAPI endpoint for SSE streaming
from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse

app = FastAPI()

@app.post("/api/v1/panels/medical-evidence/stream")
async def stream_medical_evidence_panel(request: Request):
    async def event_generator():
        panel_config = await request.json()
        
        # Execute panel with streaming
        workflow = StructuredPanelWorkflow(...)
        
        async for state in workflow.workflow.astream(initial_state):
            # Extract events from state
            for event in state["events_emitted"]:
                yield {
                    "event": event["event"],
                    "data": json.dumps(event["data"])
                }
    
    return EventSourceResponse(event_generator())
```

---

## 📈 EXPECTED OUTCOMES

### Panel Duration
- **Actual**: 45-60 minutes (depending on level of debate)
- **Target**: Complete all 5 agenda items with formal minutes

### Consensus Level
- **Target**: ≥75% consensus on committed budget items
- **Expected**: 80-90% consensus on core studies, debate on conditional items

### Deliverables
1. ✅ **Strategic Evidence Roadmap** (3-year plan with milestones)
2. ✅ **Integrated Study Portfolio** (10-12 studies prioritized)
3. ✅ **Budget Allocation** ($3.9M committed, $10.6M conditional)
4. ✅ **Publication Plan** (4-6 manuscripts over 3 years)
5. ✅ **Risk Assessment** (Key risks identified with mitigation)
6. ✅ **Governance Framework** (Steering committee, decision points)
7. ✅ **Formal Meeting Minutes** (FDA-ready documentation)

### Business Impact
- **Regulatory**: All PMR/PMC commitments addressed
- **Market Access**: Evidence supporting formulary access generated
- **Medical Affairs**: Credible evidence for KOL engagement
- **Commercial**: Supporting $500M+ revenue opportunity

---

## ✅ SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Panel Completion Time | < 60 min | Actual execution time |
| Consensus Level | ≥ 75% | Calculated from agent agreement |
| Agenda Coverage | 100% | All 5 items discussed |
| Action Item Clarity | 100% | All have owners and timelines |
| Budget Accuracy | ±20% | vs. typical evidence strategies |
| Stakeholder Satisfaction | ≥ 8/10 | Post-panel survey |
| Implementation Rate | ≥ 80% | % of recommendations executed |

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### 1. Environment Setup
```bash
# Install dependencies
pip install langgraph langchain langchain-anthropic fastapi sse-starlette

# Set environment variables
export ANTHROPIC_API_KEY="your_key"
export SUPABASE_URL="your_url"
export SUPABASE_KEY="your_key"
```

### 2. Deploy to Modal.com
```python
# modal_deploy.py
import modal

stub = modal.Stub("medical-evidence-strategy-panel")

@stub.function(
    image=modal.Image.debian_slim().pip_install(
        "langgraph", "langchain", "langchain-anthropic"
    ),
    secrets=[modal.Secret.from_name("anthropic-secret")],
    timeout=3600
)
async def execute_panel(panel_config: dict):
    from structured_panel import execute_structured_panel
    return await execute_structured_panel(panel_config, tenant_id)
```

### 3. API Integration
```bash
# Deploy FastAPI
modal deploy modal_deploy.py

# Test endpoint
curl -X POST https://your-modal-url/execute_panel \
  -H "Content-Type: application/json" \
  -d @panel_config.json
```

---

## 📚 ADDITIONAL RESOURCES

### RAG Knowledge Base Requirements
To support this panel, your RAG system should index:

**Regulatory Documents**:
- FDA guidance: Post-Marketing Studies and Clinical Trials
- FDA Framework for Real-World Evidence
- 21 CFR Part 312, Part 314 (post-approval requirements)

**Payer Evidence Requirements**:
- ICER value assessment framework
- NICE methods manual
- Commercial payer P&T committee criteria
- Medicare coverage determination policies

**HEOR Methodologies**:
- ISPOR good practices guidelines (CEA, BIM, RWE)
- CHEERS checklist (Consolidated Health Economic Evaluation Reporting Standards)
- PRISMA guidelines for systematic reviews

**Publication Guidelines**:
- ICMJE authorship criteria
- GPP3 (Good Publication Practice)
- CONSORT, STROBE, PRISMA reporting guidelines

**Therapeutic Area Resources**:
- ACR rheumatoid arthritis treatment guidelines
- Recent biologic therapy publications (last 5 years)
- Rheumatology journal impact factors and submission criteria

---

## 🎓 LESSONS LEARNED

### What Works Well
✅ **Structured format ensures comprehensive coverage** of all evidence domains  
✅ **Expert diversity** (clinical, regulatory, economic, access) provides balanced perspective  
✅ **Formal minutes** create actionable, documented output  
✅ **Budget transparency** enables informed decision-making  
✅ **Conditional approval** process allows flexibility

### Common Challenges
⚠️ **Time management**: Keep each agenda item to 10-12 minutes max  
⚠️ **Consensus building**: Facilitate debate on high-cost items (head-to-head RCT)  
⚠️ **Budget constraints**: Reality-check aspirational evidence plans  
⚠️ **Feasibility**: Clinical Dev must assess operational viability

### Optimization Opportunities
💡 **Pre-work**: Share query and context 24 hours before panel  
💡 **Background materials**: Include competitive intelligence, prior evidence strategies  
💡 **Decision criteria**: Define thresholds for go/no-go decisions upfront  
💡 **Follow-up**: Schedule implementation kickoff within 2 weeks

---

## 📞 SUPPORT & NEXT STEPS

**For Implementation Support**:
1. Review this complete guide
2. Customize agent system prompts for your therapeutic area
3. Build RAG knowledge base with relevant documents
4. Test with sample medical evidence query
5. Deploy to Modal.com
6. Integrate with your frontend application

**Next Panel Use Cases to Develop**:
- Clinical Development Strategy Panel
- Regulatory Strategy Panel
- Market Access Strategy Panel
- Medical Affairs Field Plan Panel
- R&D Portfolio Prioritization Panel

---

**Document Status**: ✅ Complete Implementation Guide  
**Ready for Production**: Yes  
**Estimated Implementation Time**: 2-3 weeks with existing infrastructure

**Last Updated**: November 10, 2025  
**Version**: 1.0  
**Author**: VITAL Platform Team
