# JOBS TO BE DONE (JTBD) FRAMEWORK - MEDICAL AFFAIRS
## Comprehensive JTBD Analysis for 6 Medical Affairs Roles × 4 MECE Archetypes

**Version:** 1.0.0
**Created:** 2025-11-27
**Framework:** JTBD + ODI (Outcome-Driven Innovation)
**Coverage:** 24 Personas (6 Roles × 4 Archetypes)

---

## TABLE OF CONTENTS

1. [Framework Overview](#framework-overview)
2. [JTBD by Role](#jtbd-by-role)
   - [Medical Science Liaison (MSL)](#role-1-medical-science-liaison-msl)
   - [Senior MSL](#role-2-senior-msl)
   - [MSL Manager](#role-3-msl-manager)
   - [Medical Information Specialist](#role-4-medical-information-specialist)
   - [Medical Director](#role-5-medical-director)
   - [VP Medical Affairs](#role-6-vp-medical-affairs)
3. [Archetype Variations](#archetype-variations)
4. [Service Layer Routing](#service-layer-routing)
5. [ODI Scoring Framework](#odi-scoring-framework)
6. [Database Seed Structure](#database-seed-structure)

---

## FRAMEWORK OVERVIEW

### JTBD Format
All JTBDs follow the structure:
> **When I** [situation/trigger], **I want to** [motivation/action], **so I can** [desired outcome]

### JTBD Categories
- **Functional Jobs:** Getting work done (core tasks, deliverables)
- **Emotional Jobs:** How they want to feel (confident, respected, valued)
- **Social Jobs:** How they want to be perceived (expert, innovator, reliable)

### Outcome Structure
For each JTBD, outcomes include:
- **Outcome Statement:** Specific, measurable outcome
- **Direction:** minimize, maximize, optimize
- **Measurement Type:** time, quality, frequency, cost, accuracy

### ODI (Outcome-Driven Innovation) Scoring
- **Importance:** How critical is this outcome? (0-10)
- **Satisfaction:** How satisfied are they currently? (0-10)
- **Opportunity Score:** Importance + (Importance - Satisfaction)
  - **50+:** Critical opportunity (under-served)
  - **35-49:** High opportunity
  - **20-34:** Medium opportunity
  - **<20:** Low opportunity (over-served)

---

## JTBD BY ROLE

---

## ROLE 1: MEDICAL SCIENCE LIAISON (MSL)

### CORE JTBDs (All Archetypes)

#### JTBD-MSL-001: Pre-Meeting Preparation
**When I** prepare for a KOL meeting, **I want to** quickly synthesize the latest clinical data, KOL's publications, and prior interactions, **so I can** have a credible, personalized scientific exchange that builds the relationship.

**Category:** Functional
**Job Type:** Routine but critical

**Outcomes:**
1. Minimize time spent searching for relevant information (Direction: minimize, Type: time)
2. Maximize comprehensiveness of background research (Direction: maximize, Type: quality)
3. Maximize relevance of discussion topics to KOL's interests (Direction: maximize, Type: quality)
4. Minimize risk of missing important context (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated briefing documents, templates, AI summaries
- **ORCHESTRATOR:** Wants synthesis across multiple sources, competitive insights
- **LEARNER:** Wants guided prep checklists, examples, templates
- **SKEPTIC:** Wants verified sources, citation trails, manual review capability

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (automated briefing generation)
- **ORCHESTRATOR:** ASK_PANEL (multi-source synthesis)
- **LEARNER:** ASK_EXPERT (guided prep with examples)
- **SKEPTIC:** ASK_EXPERT + HITL (human verification)

---

#### JTBD-MSL-002: Post-Meeting Documentation
**When I** complete a KOL interaction, **I want to** quickly capture key insights, action items, and relationship notes in CRM, **so I can** maintain accurate records without sacrificing evening/family time.

**Category:** Functional
**Job Type:** Routine, high-frequency

**Outcomes:**
1. Minimize time spent on CRM documentation (Direction: minimize, Type: time)
2. Maximize accuracy of captured insights (Direction: maximize, Type: quality)
3. Maximize compliance with documentation requirements (Direction: maximize, Type: quality)
4. Minimize delay between meeting and documentation (Direction: minimize, Type: time)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 3 | Opportunity: 13 (8 + (8-3))

**Archetype Variations:**
- **AUTOMATOR:** Wants AI auto-documentation from notes, voice capture
- **ORCHESTRATOR:** Wants insights extracted, trends identified automatically
- **LEARNER:** Wants templates, examples of good documentation
- **SKEPTIC:** Wants to review/edit AI suggestions before saving

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-capture and format)
- **ORCHESTRATOR:** SOLUTION_BUILDER (insight extraction + trend analysis)
- **LEARNER:** WORKFLOWS with templates
- **SKEPTIC:** WORKFLOWS + HITL (AI suggests, human reviews)

---

#### JTBD-MSL-003: Literature Review and Synthesis
**When I** need to answer a complex clinical question from a KOL, **I want to** rapidly review relevant literature and synthesize key findings, **so I can** respond with credible, evidence-based information.

**Category:** Functional
**Job Type:** Strategic, variable complexity

**Outcomes:**
1. Minimize time to identify relevant studies (Direction: minimize, Type: time)
2. Maximize comprehensiveness of literature search (Direction: maximize, Type: quality)
3. Maximize accuracy of synthesis (Direction: maximize, Type: quality)
4. Minimize risk of missing important publications (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 4 | Opportunity: 14 (9 + (9-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated literature alerts, summary generation
- **ORCHESTRATOR:** Wants cross-study synthesis, meta-insights
- **LEARNER:** Wants search strategies, expert guidance
- **SKEPTIC:** Wants primary sources, citation verification

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-alerts + summaries)
- **ORCHESTRATOR:** ASK_PANEL (multi-study synthesis)
- **LEARNER:** ASK_EXPERT (guided search strategies)
- **SKEPTIC:** ASK_EXPERT + full citations

---

#### JTBD-MSL-004: Territory Planning and Prioritization
**When I** plan my quarterly KOL engagement strategy, **I want to** identify high-value targets and optimize my territory coverage, **so I can** maximize scientific impact with limited time and resources.

**Category:** Functional
**Job Type:** Strategic, periodic

**Outcomes:**
1. Maximize identification of high-value KOL opportunities (Direction: maximize, Type: quality)
2. Optimize travel time vs engagement time ratio (Direction: optimize, Type: time)
3. Maximize alignment with medical strategy priorities (Direction: maximize, Type: quality)
4. Minimize time spent on planning vs executing (Direction: minimize, Type: time)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated scheduling, route optimization
- **ORCHESTRATOR:** Wants predictive KOL engagement scoring, strategic insights
- **LEARNER:** Wants planning templates, manager guidance
- **SKEPTIC:** Wants data-backed recommendations, ability to override

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-scheduling)
- **ORCHESTRATOR:** ASK_PANEL (strategic analysis)
- **LEARNER:** ASK_EXPERT (guided planning)
- **SKEPTIC:** ASK_EXPERT + manual override capability

---

#### JTBD-MSL-005: Responding to Off-Label Questions
**When I** receive an off-label question from a KOL, **I want to** provide compliant, scientifically accurate information without crossing regulatory boundaries, **so I can** maintain trust while protecting the company.

**Category:** Functional
**Job Type:** Strategic, high-risk

**Outcomes:**
1. Maximize compliance with regulatory requirements (Direction: maximize, Type: quality)
2. Maximize scientific accuracy of response (Direction: maximize, Type: quality)
3. Minimize risk of regulatory violation (Direction: minimize, Type: quality)
4. Minimize response time while ensuring compliance review (Direction: minimize, Type: time)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 4 | Opportunity: 16 (10 + (10-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants pre-approved response templates, routing automation
- **ORCHESTRATOR:** Wants comprehensive response packages, competitive context
- **LEARNER:** Wants clear guidance, examples, approval workflows
- **SKEPTIC:** Wants legal/regulatory review, audit trail

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (template routing to approval)
- **ORCHESTRATOR:** SOLUTION_BUILDER (comprehensive response package)
- **LEARNER:** ASK_EXPERT (guided response with approval)
- **SKEPTIC:** ASK_EXPERT + full compliance review

---

#### JTBD-MSL-006: Building Long-Term KOL Relationships
**When I** engage with a KOL over multiple touchpoints, **I want to** demonstrate consistent scientific value and understanding of their research, **so I can** evolve from vendor to trusted scientific partner.

**Category:** Emotional + Social
**Job Type:** Strategic, long-term

**Outcomes:**
1. Maximize personalization of interactions (Direction: maximize, Type: quality)
2. Maximize demonstration of scientific expertise (Direction: maximize, Type: quality)
3. Minimize repetition or irrelevant topics (Direction: minimize, Type: quality)
4. Maximize KOL perception as trusted partner (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 6 | Opportunity: 12 (9 + (9-6))

**Archetype Variations:**
- **AUTOMATOR:** Wants relationship history summaries, touchpoint tracking
- **ORCHESTRATOR:** Wants KOL network insights, strategic engagement opportunities
- **LEARNER:** Wants relationship-building guidance, mentoring
- **SKEPTIC:** Wants evidence of relationship ROI, track record

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (relationship tracking)
- **ORCHESTRATOR:** ASK_PANEL (KOL network analysis)
- **LEARNER:** ASK_EXPERT (relationship coaching)
- **SKEPTIC:** ASK_EXPERT + ROI tracking

---

#### JTBD-MSL-007: Competitive Intelligence Gathering
**When I** hear about competitor activities or perceptions in the market, **I want to** accurately capture and report strategic insights, **so I can** inform medical strategy and product positioning.

**Category:** Functional
**Job Type:** Opportunistic, strategic

**Outcomes:**
1. Maximize accuracy of competitive intelligence (Direction: maximize, Type: quality)
2. Minimize time to report critical insights (Direction: minimize, Type: time)
3. Maximize compliance with competitive intelligence policies (Direction: maximize, Type: quality)
4. Maximize strategic value of insights reported (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 5 | Opportunity: 9 (7 + (7-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants quick capture templates, automated routing
- **ORCHESTRATOR:** Wants trend analysis, strategic synthesis
- **LEARNER:** Wants guidance on what to capture, how to report
- **SKEPTIC:** Wants verification of sources, compliance checks

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (capture + route)
- **ORCHESTRATOR:** SOLUTION_BUILDER (trend analysis)
- **LEARNER:** ASK_EXPERT (guidance on reporting)
- **SKEPTIC:** ASK_EXPERT + compliance review

---

#### JTBD-MSL-008: Continuous Scientific Learning
**When I** need to stay current on therapeutic area developments, **I want to** efficiently consume and retain relevant scientific information, **so I can** maintain credibility as a scientific expert.

**Category:** Emotional + Functional
**Job Type:** Continuous, foundational

**Outcomes:**
1. Minimize time spent filtering relevant from irrelevant information (Direction: minimize, Type: time)
2. Maximize retention of critical scientific updates (Direction: maximize, Type: quality)
3. Maximize ability to apply new knowledge in KOL interactions (Direction: maximize, Type: quality)
4. Minimize feeling of being behind on latest developments (Direction: minimize, Type: emotional)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants curated updates, personalized learning paths
- **ORCHESTRATOR:** Wants trend analysis, cross-therapeutic insights
- **LEARNER:** Wants structured learning, expert guidance
- **SKEPTIC:** Wants primary sources, credible expert interpretation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (curated updates)
- **ORCHESTRATOR:** ASK_PANEL (trend synthesis)
- **LEARNER:** ASK_EXPERT (guided learning)
- **SKEPTIC:** ASK_EXPERT + primary sources

---

## ROLE 2: SENIOR MSL

### CORE JTBDs (All Archetypes)

#### JTBD-SRMSL-001: Strategic KOL Network Development
**When I** analyze my regional KOL landscape, **I want to** identify emerging thought leaders and strategic engagement opportunities, **so I can** build a future-proof KOL network before competitors.

**Category:** Functional + Social
**Job Type:** Strategic, proactive

**Outcomes:**
1. Maximize identification of emerging KOL opportunities (Direction: maximize, Type: quality)
2. Minimize time spent on network analysis (Direction: minimize, Type: time)
3. Maximize predictive accuracy of KOL trajectory (Direction: maximize, Type: quality)
4. Maximize competitive advantage in KOL access (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 4 | Opportunity: 14 (9 + (9-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated KOL tracking, scoring algorithms
- **ORCHESTRATOR:** Wants predictive analytics, network mapping AI
- **LEARNER:** Wants mentor guidance on identifying rising stars
- **SKEPTIC:** Wants evidence-based KOL scoring, track record data

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-tracking + scoring)
- **ORCHESTRATOR:** ASK_PANEL (predictive network analysis)
- **LEARNER:** ASK_EXPERT (mentored KOL identification)
- **SKEPTIC:** ASK_EXPERT + historical data validation

---

#### JTBD-SRMSL-002: Mentoring Junior MSLs
**When I** mentor a junior MSL, **I want to** efficiently transfer my knowledge and best practices, **so I can** develop the next generation without sacrificing my own productivity.

**Category:** Functional + Emotional
**Job Type:** Ongoing, organizational

**Outcomes:**
1. Maximize knowledge transfer effectiveness (Direction: maximize, Type: quality)
2. Minimize time spent on repetitive mentoring questions (Direction: minimize, Type: time)
3. Maximize mentee confidence and competence growth (Direction: maximize, Type: quality)
4. Maximize personal satisfaction from mentoring (Direction: maximize, Type: emotional)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 5 | Opportunity: 9 (7 + (7-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants scalable mentoring tools, recorded best practices
- **ORCHESTRATOR:** Wants mentoring frameworks, competency tracking
- **LEARNER:** Wants mentoring training, peer learning
- **SKEPTIC:** Wants proven mentoring methods, measurable outcomes

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (knowledge base creation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (mentoring framework)
- **LEARNER:** ASK_EXPERT (mentoring coaching)
- **SKEPTIC:** ASK_EXPERT + effectiveness metrics

---

#### JTBD-SRMSL-003: Cross-Functional Medical Strategy Input
**When I** participate in medical strategy discussions, **I want to** provide field insights that influence strategic decisions, **so I can** ensure strategy is grounded in KOL/market reality.

**Category:** Functional + Social
**Job Type:** Strategic, periodic

**Outcomes:**
1. Maximize credibility of field insights presented (Direction: maximize, Type: quality)
2. Maximize influence on strategic decisions (Direction: maximize, Type: quality)
3. Minimize time preparing strategic presentations (Direction: minimize, Type: time)
4. Maximize alignment between strategy and field reality (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants auto-generated field insights, data visualization
- **ORCHESTRATOR:** Wants strategic synthesis, trend analysis
- **LEARNER:** Wants presentation coaching, strategic thinking frameworks
- **SKEPTIC:** Wants data-backed insights, evidence validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (insight generation)
- **ORCHESTRATOR:** ASK_PANEL (strategic synthesis)
- **LEARNER:** ASK_EXPERT (coaching)
- **SKEPTIC:** ASK_EXPERT + data validation

---

#### JTBD-SRMSL-004: Complex Medical Information Escalations
**When I** receive a highly complex clinical question, **I want to** coordinate with internal experts and synthesize a comprehensive response, **so I can** maintain my reputation as the go-to expert for difficult cases.

**Category:** Functional + Social
**Job Type:** Escalation, high-stakes

**Outcomes:**
1. Maximize accuracy of complex responses (Direction: maximize, Type: quality)
2. Minimize time to coordinate expert input (Direction: minimize, Type: time)
3. Maximize comprehensiveness of response (Direction: maximize, Type: quality)
4. Maximize reputation as expert problem-solver (Direction: maximize, Type: social)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 4 | Opportunity: 14 (9 + (9-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants expert routing workflows, response assembly automation
- **ORCHESTRATOR:** Wants expert panel coordination, synthesis tools
- **LEARNER:** Wants expert consultation guidance, escalation protocols
- **SKEPTIC:** Wants expert verification, multi-source validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (expert routing)
- **ORCHESTRATOR:** ASK_PANEL (expert coordination)
- **LEARNER:** ASK_EXPERT (escalation guidance)
- **SKEPTIC:** ASK_PANEL + verification protocols

---

#### JTBD-SRMSL-005: Investigator-Initiated Study (IIS) Support
**When I** discuss potential research collaborations with KOLs, **I want to** quickly assess feasibility and guide them through the IIS process, **so I can** foster meaningful research partnerships.

**Category:** Functional
**Job Type:** Strategic, partnership-building

**Outcomes:**
1. Maximize quality of IIS proposals generated (Direction: maximize, Type: quality)
2. Minimize time guiding KOLs through process (Direction: minimize, Type: time)
3. Maximize IIS approval rate (Direction: maximize, Type: quality)
4. Maximize KOL satisfaction with support (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 5 | Opportunity: 9 (7 + (7-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants IIS templates, automated feasibility checks
- **ORCHESTRATOR:** Wants IIS portfolio insights, strategic alignment tools
- **LEARNER:** Wants IIS process training, examples
- **SKEPTIC:** Wants precedent review, compliance verification

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (templates + feasibility)
- **ORCHESTRATOR:** SOLUTION_BUILDER (portfolio strategy)
- **LEARNER:** ASK_EXPERT (process guidance)
- **SKEPTIC:** ASK_EXPERT + compliance review

---

#### JTBD-SRMSL-006: Advisory Board Planning and Execution
**When I** plan an advisory board meeting, **I want to** design agendas that maximize strategic insights from KOLs, **so I can** deliver high-value strategic intelligence to medical leadership.

**Category:** Functional + Strategic
**Job Type:** Periodic, high-stakes

**Outcomes:**
1. Maximize strategic value of insights generated (Direction: maximize, Type: quality)
2. Maximize KOL engagement during meeting (Direction: maximize, Type: quality)
3. Minimize planning and logistics burden (Direction: minimize, Type: time)
4. Maximize actionability of outputs (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants agenda templates, automated logistics
- **ORCHESTRATOR:** Wants strategic agenda design, insight synthesis tools
- **LEARNER:** Wants advisory board best practices, examples
- **SKEPTIC:** Wants proven agenda formats, past meeting analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (logistics automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (strategic design)
- **LEARNER:** ASK_EXPERT (best practices)
- **SKEPTIC:** ASK_EXPERT + historical analysis

---

## ROLE 3: MSL MANAGER

### CORE JTBDs (All Archetypes)

#### JTBD-MSLMGR-001: Team Performance Management
**When I** review my team's KOL engagement metrics, **I want to** identify performance gaps and coaching opportunities, **so I can** improve team effectiveness while maintaining morale.

**Category:** Functional
**Job Type:** Ongoing, management

**Outcomes:**
1. Maximize early identification of performance issues (Direction: maximize, Type: quality)
2. Minimize time spent on performance analysis (Direction: minimize, Type: time)
3. Maximize effectiveness of coaching interventions (Direction: maximize, Type: quality)
4. Maximize team morale during performance discussions (Direction: maximize, Type: emotional)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 4 | Opportunity: 14 (9 + (9-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated dashboards, performance alerts
- **ORCHESTRATOR:** Wants predictive analytics, team optimization insights
- **LEARNER:** Wants coaching frameworks, manager training
- **SKEPTIC:** Wants objective metrics, bias-free analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-dashboards)
- **ORCHESTRATOR:** ASK_PANEL (team optimization)
- **LEARNER:** ASK_EXPERT (coaching guidance)
- **SKEPTIC:** ASK_EXPERT + objective metrics

---

#### JTBD-MSLMGR-002: Territory Planning and Resource Allocation
**When I** allocate MSL resources across my region, **I want to** optimize coverage based on strategic priorities and KOL density, **so I can** maximize team impact with limited headcount.

**Category:** Functional
**Job Type:** Strategic, periodic

**Outcomes:**
1. Maximize alignment with medical strategy priorities (Direction: maximize, Type: quality)
2. Maximize territory coverage efficiency (Direction: maximize, Type: quality)
3. Minimize gaps in KOL coverage (Direction: minimize, Type: quality)
4. Maximize team satisfaction with territory assignments (Direction: maximize, Type: emotional)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants algorithmic territory optimization
- **ORCHESTRATOR:** Wants strategic scenario modeling
- **LEARNER:** Wants territory planning frameworks
- **SKEPTIC:** Wants data-driven allocation, historical performance data

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (optimization algorithms)
- **ORCHESTRATOR:** SOLUTION_BUILDER (scenario modeling)
- **LEARNER:** ASK_EXPERT (planning frameworks)
- **SKEPTIC:** ASK_EXPERT + historical analysis

---

#### JTBD-MSLMGR-003: Upward Reporting to Medical Leadership
**When I** prepare reports for medical leadership, **I want to** synthesize team activities into strategic insights, **so I can** demonstrate medical affairs value and secure resources.

**Category:** Functional + Social
**Job Type:** Periodic, high-stakes

**Outcomes:**
1. Maximize strategic value of insights reported (Direction: maximize, Type: quality)
2. Minimize time spent on report preparation (Direction: minimize, Type: time)
3. Maximize leadership perception of medical affairs value (Direction: maximize, Type: social)
4. Maximize ability to secure budget/resources (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants auto-generated reports, data visualization
- **ORCHESTRATOR:** Wants strategic storytelling, insight synthesis
- **LEARNER:** Wants report templates, communication coaching
- **SKEPTIC:** Wants data-backed insights, precedent analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-reporting)
- **ORCHESTRATOR:** SOLUTION_BUILDER (strategic synthesis)
- **LEARNER:** ASK_EXPERT (communication coaching)
- **SKEPTIC:** ASK_EXPERT + data validation

---

#### JTBD-MSLMGR-004: Cross-Functional Coordination
**When I** work with Commercial, Medical Communications, and Clinical Development, **I want to** ensure my team delivers on cross-functional commitments, **so I can** maintain strong partnerships and team reputation.

**Category:** Functional + Social
**Job Type:** Ongoing, coordination

**Outcomes:**
1. Maximize on-time delivery of cross-functional commitments (Direction: maximize, Type: quality)
2. Minimize coordination overhead (Direction: minimize, Type: time)
3. Maximize partner satisfaction with MSL team (Direction: maximize, Type: social)
4. Minimize conflicts between MSL work and cross-functional requests (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 5 | Opportunity: 9 (7 + (7-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants project tracking automation, dependency management
- **ORCHESTRATOR:** Wants cross-functional workflow optimization
- **LEARNER:** Wants coordination frameworks, conflict resolution training
- **SKEPTIC:** Wants clear SLAs, commitment tracking

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (project tracking)
- **ORCHESTRATOR:** SOLUTION_BUILDER (workflow optimization)
- **LEARNER:** ASK_EXPERT (coordination training)
- **SKEPTIC:** ASK_EXPERT + SLA management

---

#### JTBD-MSLMGR-005: Talent Development and Retention
**When I** develop my team members' careers, **I want to** provide growth opportunities that retain top talent, **so I can** maintain team stability and development pipeline.

**Category:** Functional + Emotional
**Job Type:** Ongoing, strategic

**Outcomes:**
1. Maximize team member skill development (Direction: maximize, Type: quality)
2. Maximize retention of high performers (Direction: maximize, Type: quality)
3. Minimize time spent on talent management activities (Direction: minimize, Type: time)
4. Maximize team member career satisfaction (Direction: maximize, Type: emotional)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants development tracking, automated learning paths
- **ORCHESTRATOR:** Wants competency frameworks, succession planning tools
- **LEARNER:** Wants talent management training, coaching resources
- **SKEPTIC:** Wants objective development metrics, proven retention strategies

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (development tracking)
- **ORCHESTRATOR:** SOLUTION_BUILDER (competency framework)
- **LEARNER:** ASK_EXPERT (talent management coaching)
- **SKEPTIC:** ASK_EXPERT + retention analytics

---

#### JTBD-MSLMGR-006: Budget Management and Justification
**When I** manage my team's budget, **I want to** demonstrate ROI of MSL activities and justify resource needs, **so I can** secure adequate funding while showing fiscal responsibility.

**Category:** Functional
**Job Type:** Periodic, accountability

**Outcomes:**
1. Maximize demonstrated ROI of MSL activities (Direction: maximize, Type: quality)
2. Minimize time spent on budget reporting (Direction: minimize, Type: time)
3. Maximize success in budget increase requests (Direction: maximize, Type: quality)
4. Minimize budget variance (Direction: minimize, Type: cost)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 4 | Opportunity: 10 (7 + (7-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated expense tracking, variance alerts
- **ORCHESTRATOR:** Wants ROI modeling, strategic budget allocation tools
- **LEARNER:** Wants budget management training, templates
- **SKEPTIC:** Wants detailed audit trails, precedent-based budgeting

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (expense tracking)
- **ORCHESTRATOR:** SOLUTION_BUILDER (ROI modeling)
- **LEARNER:** ASK_EXPERT (budget management training)
- **SKEPTIC:** ASK_EXPERT + audit capabilities

---

#### JTBD-MSLMGR-007: Compliance and Risk Management
**When I** ensure team compliance with regulations, **I want to** proactively identify and mitigate risks, **so I can** protect the company while maintaining team productivity.

**Category:** Functional
**Job Type:** Ongoing, critical

**Outcomes:**
1. Maximize early detection of compliance risks (Direction: maximize, Type: quality)
2. Minimize compliance incidents (Direction: minimize, Type: frequency)
3. Minimize compliance burden on team productivity (Direction: minimize, Type: time)
4. Maximize audit readiness (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants compliance monitoring automation, risk alerts
- **ORCHESTRATOR:** Wants risk scoring, compliance optimization
- **LEARNER:** Wants compliance training, best practices
- **SKEPTIC:** Wants rigorous audit trails, proven compliance frameworks

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (compliance monitoring)
- **ORCHESTRATOR:** SOLUTION_BUILDER (risk optimization)
- **LEARNER:** ASK_EXPERT (compliance guidance)
- **SKEPTIC:** ASK_EXPERT + audit trail verification

---

## ROLE 4: MEDICAL INFORMATION SPECIALIST

### CORE JTBDs (All Archetypes)

#### JTBD-MIS-001: Rapid Response to Medical Inquiries
**When I** receive a medical inquiry from an HCP, **I want to** quickly locate accurate, approved information, **so I can** respond within SLA while maintaining 100% accuracy.

**Category:** Functional
**Job Type:** High-frequency, time-sensitive

**Outcomes:**
1. Minimize response time (Direction: minimize, Type: time)
2. Maximize accuracy of information provided (Direction: maximize, Type: quality)
3. Maximize compliance with approved messaging (Direction: maximize, Type: quality)
4. Minimize need for escalation (Direction: minimize, Type: frequency)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 5 | Opportunity: 15 (10 + (10-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants AI-powered response suggestions, template automation
- **ORCHESTRATOR:** Wants cross-product synthesis, comprehensive packages
- **LEARNER:** Wants response examples, guided search
- **SKEPTIC:** Wants verified sources, manual review capability

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-response suggestions)
- **ORCHESTRATOR:** SOLUTION_BUILDER (comprehensive packages)
- **LEARNER:** ASK_EXPERT (guided response)
- **SKEPTIC:** ASK_EXPERT + source verification

---

#### JTBD-MIS-002: Adverse Event Documentation
**When I** identify a potential adverse event during an inquiry, **I want to** capture required information and route to safety, **so I can** meet regulatory timelines without losing the caller.

**Category:** Functional
**Job Type:** Critical, time-sensitive

**Outcomes:**
1. Maximize completeness of AE documentation (Direction: maximize, Type: quality)
2. Minimize time to route to safety (Direction: minimize, Type: time)
3. Maximize compliance with AE reporting regulations (Direction: maximize, Type: quality)
4. Minimize disruption to caller experience (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 4 | Opportunity: 16 (10 + (10-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated AE forms, routing workflows
- **ORCHESTRATOR:** Wants AE pattern detection, trend analysis
- **LEARNER:** Wants AE documentation training, checklists
- **SKEPTIC:** Wants compliance verification, audit trails

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (AE automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (pattern analysis)
- **LEARNER:** ASK_EXPERT (documentation guidance)
- **SKEPTIC:** ASK_EXPERT + compliance verification

---

#### JTBD-MIS-003: Managing Inquiry Trends
**When I** notice patterns in incoming inquiries, **I want to** analyze trends and inform medical strategy, **so I can** proactively address unmet information needs.

**Category:** Functional + Strategic
**Job Type:** Analytical, periodic

**Outcomes:**
1. Maximize early detection of inquiry trends (Direction: maximize, Type: quality)
2. Maximize strategic value of trend insights (Direction: maximize, Type: quality)
3. Minimize time spent on trend analysis (Direction: minimize, Type: time)
4. Maximize actionability of trend reports (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 4 | Opportunity: 10 (7 + (7-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated trend detection, dashboards
- **ORCHESTRATOR:** Wants predictive analytics, strategic synthesis
- **LEARNER:** Wants trend analysis training, reporting templates
- **SKEPTIC:** Wants statistically valid trend identification

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-trend detection)
- **ORCHESTRATOR:** ASK_PANEL (predictive analysis)
- **LEARNER:** ASK_EXPERT (analysis training)
- **SKEPTIC:** ASK_EXPERT + statistical validation

---

#### JTBD-MIS-004: Complex Escalation Management
**When I** receive a question beyond standard responses, **I want to** coordinate with internal experts to develop accurate answers, **so I can** maintain my credibility without creating bottlenecks.

**Category:** Functional
**Job Type:** Escalation, variable frequency

**Outcomes:**
1. Maximize accuracy of complex responses (Direction: maximize, Type: quality)
2. Minimize time to coordinate expert input (Direction: minimize, Type: time)
3. Maximize expert availability/responsiveness (Direction: maximize, Type: quality)
4. Minimize caller wait time (Direction: minimize, Type: time)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants expert routing automation, response assembly
- **ORCHESTRATOR:** Wants expert panel coordination
- **LEARNER:** Wants escalation protocols, expert consultation guidance
- **SKEPTIC:** Wants expert verification, multi-source validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (expert routing)
- **ORCHESTRATOR:** ASK_PANEL (expert coordination)
- **LEARNER:** ASK_EXPERT (escalation guidance)
- **SKEPTIC:** ASK_PANEL + verification

---

#### JTBD-MIS-005: Response Template Management
**When I** maintain response templates, **I want to** ensure all content is current and approved, **so I can** provide consistent, compliant information efficiently.

**Category:** Functional
**Job Type:** Maintenance, periodic

**Outcomes:**
1. Maximize currency of template content (Direction: maximize, Type: quality)
2. Minimize time spent on template updates (Direction: minimize, Type: time)
3. Maximize compliance with approved messaging (Direction: maximize, Type: quality)
4. Minimize risk of using outdated information (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated template updates, version control
- **ORCHESTRATOR:** Wants template performance analytics, optimization
- **LEARNER:** Wants template creation training, review processes
- **SKEPTIC:** Wants rigorous approval workflows, change tracking

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (auto-updates)
- **ORCHESTRATOR:** SOLUTION_BUILDER (template optimization)
- **LEARNER:** ASK_EXPERT (template best practices)
- **SKEPTIC:** ASK_EXPERT + approval tracking

---

#### JTBD-MIS-006: Cross-Product Information Synthesis
**When I** receive inquiries spanning multiple products, **I want to** synthesize consistent information across the portfolio, **so I can** provide comprehensive, accurate answers.

**Category:** Functional
**Job Type:** Complex, increasing frequency

**Outcomes:**
1. Maximize comprehensiveness of cross-product responses (Direction: maximize, Type: quality)
2. Maximize consistency across product information (Direction: maximize, Type: quality)
3. Minimize time to synthesize cross-product info (Direction: minimize, Type: time)
4. Minimize risk of contradictory information (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 3 | Opportunity: 13 (8 + (8-3))

**Archetype Variations:**
- **AUTOMATOR:** Wants cross-product search automation
- **ORCHESTRATOR:** Wants portfolio synthesis tools
- **LEARNER:** Wants cross-product training, synthesis frameworks
- **SKEPTIC:** Wants consistency verification, source validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (cross-product search)
- **ORCHESTRATOR:** ASK_PANEL (portfolio synthesis)
- **LEARNER:** ASK_EXPERT (synthesis training)
- **SKEPTIC:** ASK_EXPERT + consistency validation

---

## ROLE 5: MEDICAL DIRECTOR

### CORE JTBDs (All Archetypes)

#### JTBD-MEDDIR-001: Portfolio Medical Strategy Development
**When I** develop medical strategy across my portfolio, **I want to** synthesize clinical, competitive, and market intelligence, **so I can** create evidence-based strategies that maximize product success.

**Category:** Functional
**Job Type:** Strategic, high-stakes

**Outcomes:**
1. Maximize comprehensiveness of strategic inputs (Direction: maximize, Type: quality)
2. Maximize competitive advantage of strategy (Direction: maximize, Type: quality)
3. Minimize time to synthesize strategic insights (Direction: minimize, Type: time)
4. Maximize leadership buy-in for strategy (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 4 | Opportunity: 16 (10 + (10-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated competitive intelligence, strategic dashboards
- **ORCHESTRATOR:** Wants multi-source synthesis, scenario modeling
- **LEARNER:** Wants strategy frameworks, executive coaching
- **SKEPTIC:** Wants evidence-based strategy, validation data

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (competitive intelligence automation)
- **ORCHESTRATOR:** ASK_PANEL (strategic synthesis)
- **LEARNER:** ASK_EXPERT (strategy coaching)
- **SKEPTIC:** ASK_EXPERT + data validation

---

#### JTBD-MEDDIR-002: Executive Presentation and Influence
**When I** present to the executive team or board, **I want to** deliver compelling, data-driven insights, **so I can** influence strategic decisions and secure resources for medical affairs.

**Category:** Functional + Social
**Job Type:** High-stakes, periodic

**Outcomes:**
1. Maximize persuasiveness of presentations (Direction: maximize, Type: quality)
2. Maximize executive confidence in medical affairs (Direction: maximize, Type: social)
3. Minimize preparation time for presentations (Direction: minimize, Type: time)
4. Maximize success rate of resource requests (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants auto-generated executive summaries, slide automation
- **ORCHESTRATOR:** Wants strategic storytelling tools, narrative synthesis
- **LEARNER:** Wants executive communication coaching, presentation training
- **SKEPTIC:** Wants data-backed insights, precedent analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (slide automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (strategic storytelling)
- **LEARNER:** ASK_EXPERT (communication coaching)
- **SKEPTIC:** ASK_EXPERT + data validation

---

#### JTBD-MEDDIR-003: Regulatory Pathway Planning
**When I** plan regulatory pathways for products, **I want to** analyze global regulatory requirements and competitive precedents, **so I can** optimize approval strategies and timelines.

**Category:** Functional
**Job Type:** Strategic, technical

**Outcomes:**
1. Maximize regulatory approval success rate (Direction: maximize, Type: quality)
2. Minimize time to approval (Direction: minimize, Type: time)
3. Maximize global regulatory alignment (Direction: maximize, Type: quality)
4. Minimize regulatory strategy risk (Direction: minimize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants regulatory database automation, pathway templates
- **ORCHESTRATOR:** Wants global regulatory synthesis, scenario modeling
- **LEARNER:** Wants regulatory strategy training, expert consultation
- **SKEPTIC:** Wants precedent analysis, regulatory expert verification

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (regulatory automation)
- **ORCHESTRATOR:** ASK_PANEL (global synthesis)
- **LEARNER:** ASK_EXPERT (regulatory training)
- **SKEPTIC:** ASK_EXPERT + precedent validation

---

#### JTBD-MEDDIR-004: Medical Affairs Team Leadership
**When I** lead my medical affairs team, **I want to** develop talent, optimize processes, and drive performance, **so I can** build a high-performing organization.

**Category:** Functional + Emotional
**Job Type:** Ongoing, leadership

**Outcomes:**
1. Maximize team performance and productivity (Direction: maximize, Type: quality)
2. Maximize team member development and satisfaction (Direction: maximize, Type: emotional)
3. Minimize leadership overhead (Direction: minimize, Type: time)
4. Maximize retention of top talent (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants performance dashboards, automated reporting
- **ORCHESTRATOR:** Wants organizational optimization, talent analytics
- **LEARNER:** Wants leadership training, coaching frameworks
- **SKEPTIC:** Wants objective performance metrics, proven leadership methods

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (performance automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (organizational optimization)
- **LEARNER:** ASK_EXPERT (leadership coaching)
- **SKEPTIC:** ASK_EXPERT + performance analytics

---

#### JTBD-MEDDIR-005: Cross-Functional Leadership Coordination
**When I** coordinate with Clinical, Regulatory, Commercial, and R&D leaders, **I want to** align on strategic priorities and deliverables, **so I can** ensure medical affairs delivers on cross-functional commitments.

**Category:** Functional
**Job Type:** Ongoing, coordination

**Outcomes:**
1. Maximize cross-functional strategic alignment (Direction: maximize, Type: quality)
2. Maximize on-time delivery of commitments (Direction: maximize, Type: quality)
3. Minimize coordination overhead (Direction: minimize, Type: time)
4. Maximize partner satisfaction with medical affairs (Direction: maximize, Type: social)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants cross-functional tracking, dependency management
- **ORCHESTRATOR:** Wants strategic alignment tools, workflow optimization
- **LEARNER:** Wants cross-functional leadership training
- **SKEPTIC:** Wants clear SLAs, accountability tracking

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (tracking automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (alignment optimization)
- **LEARNER:** ASK_EXPERT (leadership training)
- **SKEPTIC:** ASK_EXPERT + SLA tracking

---

#### JTBD-MEDDIR-006: Publication Strategy and Execution
**When I** develop publication strategy for clinical programs, **I want to** maximize scientific impact and evidence dissemination, **so I can** build product credibility and KOL engagement.

**Category:** Functional
**Job Type:** Strategic, ongoing

**Outcomes:**
1. Maximize publication quality and impact factor (Direction: maximize, Type: quality)
2. Maximize publication timeline adherence (Direction: maximize, Type: quality)
3. Minimize publication planning overhead (Direction: minimize, Type: time)
4. Maximize KOL authorship opportunities (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 5 | Opportunity: 11 (8 + (8-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants publication tracking automation, timeline management
- **ORCHESTRATOR:** Wants publication portfolio optimization, impact modeling
- **LEARNER:** Wants publication strategy training, best practices
- **SKEPTIC:** Wants precedent analysis, impact validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (tracking automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (portfolio optimization)
- **LEARNER:** ASK_EXPERT (strategy training)
- **SKEPTIC:** ASK_EXPERT + impact analysis

---

#### JTBD-MEDDIR-007: Budget Planning and Resource Justification
**When I** plan annual budgets for medical affairs, **I want to** demonstrate ROI and justify resource needs, **so I can** secure adequate funding while showing fiscal responsibility.

**Category:** Functional
**Job Type:** Annual, high-stakes

**Outcomes:**
1. Maximize demonstrated ROI of medical affairs (Direction: maximize, Type: quality)
2. Maximize success in budget requests (Direction: maximize, Type: quality)
3. Minimize budget planning overhead (Direction: minimize, Type: time)
4. Maximize budget variance control (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants budget automation, ROI dashboards
- **ORCHESTRATOR:** Wants ROI modeling, strategic budget allocation
- **LEARNER:** Wants budget planning training, financial acumen development
- **SKEPTIC:** Wants detailed justification, precedent-based budgeting

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (budget automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (ROI modeling)
- **LEARNER:** ASK_EXPERT (financial training)
- **SKEPTIC:** ASK_EXPERT + justification validation

---

## ROLE 6: VP MEDICAL AFFAIRS

### CORE JTBDs (All Archetypes)

#### JTBD-VPMA-001: Enterprise Medical Affairs Strategy
**When I** define enterprise-wide medical affairs strategy, **I want to** align with corporate objectives while positioning medical affairs as strategic driver, **so I can** maximize organizational impact and executive visibility.

**Category:** Functional
**Job Type:** Strategic, transformational

**Outcomes:**
1. Maximize strategic alignment with corporate objectives (Direction: maximize, Type: quality)
2. Maximize medical affairs organizational influence (Direction: maximize, Type: social)
3. Minimize time to develop strategy (Direction: minimize, Type: time)
4. Maximize board/C-suite buy-in (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 4 | Opportunity: 16 (10 + (10-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants automated strategic intelligence, efficiency metrics
- **ORCHESTRATOR:** Wants enterprise synthesis, strategic scenario modeling
- **LEARNER:** Wants executive strategy coaching, C-level communication training
- **SKEPTIC:** Wants evidence-based strategy, industry precedent analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (strategic intelligence automation)
- **ORCHESTRATOR:** ASK_PANEL (enterprise synthesis)
- **LEARNER:** ASK_EXPERT (executive coaching)
- **SKEPTIC:** ASK_EXPERT + precedent validation

---

#### JTBD-VPMA-002: Board-Level Communication
**When I** present to the board or investors, **I want to** articulate medical affairs value and strategic contributions, **so I can** secure support for medical affairs initiatives and budget.

**Category:** Functional + Social
**Job Type:** High-stakes, periodic

**Outcomes:**
1. Maximize board confidence in medical affairs (Direction: maximize, Type: social)
2. Maximize success in securing board support (Direction: maximize, Type: quality)
3. Minimize presentation preparation time (Direction: minimize, Type: time)
4. Maximize credibility with board members (Direction: maximize, Type: social)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants board-ready automated summaries, metrics dashboards
- **ORCHESTRATOR:** Wants strategic narrative synthesis, board insight generation
- **LEARNER:** Wants board communication coaching, investor relations training
- **SKEPTIC:** Wants data-backed presentations, fiduciary-aligned messaging

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (board summaries automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (strategic narratives)
- **LEARNER:** ASK_EXPERT (board communication training)
- **SKEPTIC:** ASK_EXPERT + data validation

---

#### JTBD-VPMA-003: Organizational Transformation Leadership
**When I** drive organizational transformation in medical affairs, **I want to** modernize processes, adopt new technologies, and develop talent, **so I can** build a future-ready organization.

**Category:** Functional + Emotional
**Job Type:** Transformational, multi-year

**Outcomes:**
1. Maximize organizational adoption of new capabilities (Direction: maximize, Type: quality)
2. Maximize team readiness for future challenges (Direction: maximize, Type: quality)
3. Minimize disruption during transformation (Direction: minimize, Type: quality)
4. Maximize retention during change (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 4 | Opportunity: 14 (9 + (9-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants change management automation, adoption tracking
- **ORCHESTRATOR:** Wants transformation roadmap optimization, change analytics
- **LEARNER:** Wants transformation leadership training, change management frameworks
- **SKEPTIC:** Wants proven transformation methods, risk mitigation plans

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (change tracking automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (transformation roadmap)
- **LEARNER:** ASK_EXPERT (transformation coaching)
- **SKEPTIC:** ASK_EXPERT + risk analysis

---

#### JTBD-VPMA-004: Enterprise-Wide Resource Allocation
**When I** allocate resources across the global medical affairs organization, **I want to** optimize investment based on strategic priorities and ROI, **so I can** maximize organizational impact with finite resources.

**Category:** Functional
**Job Type:** Strategic, annual

**Outcomes:**
1. Maximize ROI of resource allocation (Direction: maximize, Type: quality)
2. Maximize strategic alignment of investments (Direction: maximize, Type: quality)
3. Minimize resource allocation conflicts (Direction: minimize, Type: quality)
4. Maximize team satisfaction with resource distribution (Direction: maximize, Type: emotional)

**ODI Baseline:**
- Importance: 9 | Satisfaction: 5 | Opportunity: 13 (9 + (9-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants algorithmic resource optimization, portfolio management automation
- **ORCHESTRATOR:** Wants strategic scenario modeling, ROI optimization
- **LEARNER:** Wants resource allocation frameworks, financial strategy training
- **SKEPTIC:** Wants data-driven allocation, historical ROI analysis

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (portfolio automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (scenario modeling)
- **LEARNER:** ASK_EXPERT (allocation training)
- **SKEPTIC:** ASK_EXPERT + ROI validation

---

#### JTBD-VPMA-005: Industry Thought Leadership
**When I** represent medical affairs externally, **I want to** establish industry thought leadership and best practices, **so I can** enhance company reputation and attract talent.

**Category:** Social + Emotional
**Job Type:** Ongoing, reputation-building

**Outcomes:**
1. Maximize industry recognition as thought leader (Direction: maximize, Type: social)
2. Maximize company reputation in medical affairs (Direction: maximize, Type: social)
3. Minimize time spent on thought leadership activities (Direction: minimize, Type: time)
4. Maximize talent attraction from thought leadership (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 7 | Satisfaction: 5 | Opportunity: 9 (7 + (7-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants thought leadership content automation, speaking prep tools
- **ORCHESTRATOR:** Wants industry insight synthesis, strategic positioning
- **LEARNER:** Wants executive presence training, public speaking coaching
- **SKEPTIC:** Wants evidence-based thought leadership, industry validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (content automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (insight synthesis)
- **LEARNER:** ASK_EXPERT (executive presence coaching)
- **SKEPTIC:** ASK_EXPERT + validation

---

#### JTBD-VPMA-006: Enterprise Risk and Compliance Governance
**When I** oversee enterprise medical affairs compliance, **I want to** proactively identify and mitigate risks, **so I can** protect the organization while enabling business objectives.

**Category:** Functional
**Job Type:** Ongoing, critical

**Outcomes:**
1. Maximize early detection of compliance risks (Direction: maximize, Type: quality)
2. Minimize compliance incidents (Direction: minimize, Type: frequency)
3. Maximize audit readiness (Direction: maximize, Type: quality)
4. Minimize compliance burden on organization (Direction: minimize, Type: time)

**ODI Baseline:**
- Importance: 10 | Satisfaction: 5 | Opportunity: 15 (10 + (10-5))

**Archetype Variations:**
- **AUTOMATOR:** Wants compliance monitoring automation, risk alerts
- **ORCHESTRATOR:** Wants enterprise risk modeling, compliance optimization
- **LEARNER:** Wants governance frameworks, compliance leadership training
- **SKEPTIC:** Wants rigorous audit trails, proven compliance frameworks

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (compliance automation)
- **ORCHESTRATOR:** SOLUTION_BUILDER (risk modeling)
- **LEARNER:** ASK_EXPERT (governance training)
- **SKEPTIC:** ASK_EXPERT + audit validation

---

#### JTBD-VPMA-007: Competitive Intelligence and Market Positioning
**When I** analyze competitive landscape and market dynamics, **I want to** identify threats and opportunities for strategic positioning, **so I can** maintain competitive advantage.

**Category:** Functional
**Job Type:** Ongoing, strategic

**Outcomes:**
1. Maximize early detection of competitive threats (Direction: maximize, Type: quality)
2. Maximize identification of market opportunities (Direction: maximize, Type: quality)
3. Minimize time to synthesize competitive intelligence (Direction: minimize, Type: time)
4. Maximize strategic advantage from insights (Direction: maximize, Type: quality)

**ODI Baseline:**
- Importance: 8 | Satisfaction: 4 | Opportunity: 12 (8 + (8-4))

**Archetype Variations:**
- **AUTOMATOR:** Wants competitive intelligence automation, alert systems
- **ORCHESTRATOR:** Wants multi-source competitive synthesis, predictive analytics
- **LEARNER:** Wants competitive analysis training, strategic frameworks
- **SKEPTIC:** Wants verified competitive data, source validation

**Service Layer Routing:**
- **AUTOMATOR:** WORKFLOWS (competitive automation)
- **ORCHESTRATOR:** ASK_PANEL (competitive synthesis)
- **LEARNER:** ASK_EXPERT (competitive analysis training)
- **SKEPTIC:** ASK_EXPERT + source validation

---

## ARCHETYPE VARIATIONS

### How JTBDs Differ by Archetype

#### AUTOMATOR Archetype (High AI Maturity + Routine Work)
**Characteristics:** Power users who seek efficiency through automation

**JTBD Patterns:**
- **Primary Focus:** Eliminating repetitive tasks, scaling personal productivity
- **Outcome Priorities:** Time minimization, consistency maximization
- **Typical Language:** "automate," "streamline," "eliminate," "scale"
- **Success Metrics:** Hours saved, tasks automated, team efficiency gains

**Common JTBDs:**
- "When I do the same task repeatedly, I want to automate it, so I can focus on high-value work"
- "When I manage workflows, I want to eliminate manual steps, so I can scale without adding headcount"
- "When I document activities, I want auto-capture, so I can avoid evening admin work"

**Service Preferences:**
- **WORKFLOWS:** Routine automation, template generation, auto-documentation
- **SOLUTION_BUILDER:** Building reusable automated systems

**ODI Score Adjustments:**
- Importance: +1 to +2 for time-saving outcomes
- Satisfaction: -1 to -2 for manual processes (higher opportunity)

---

#### ORCHESTRATOR Archetype (High AI Maturity + Strategic Work)
**Characteristics:** Visionaries who use AI for synthesis and strategic insights

**JTBD Patterns:**
- **Primary Focus:** Multi-source synthesis, strategic insights, innovation
- **Outcome Priorities:** Comprehensiveness maximization, insight quality
- **Typical Language:** "synthesize," "integrate," "identify patterns," "predict"
- **Success Metrics:** Strategic impact, insights generated, competitive advantage

**Common JTBDs:**
- "When I analyze complex situations, I want to synthesize across multiple data sources, so I can identify strategic opportunities"
- "When I make strategic decisions, I want predictive insights, so I can stay ahead of competitors"
- "When I influence leadership, I want comprehensive evidence, so I can drive strategic change"

**Service Preferences:**
- **ASK_PANEL:** Multi-perspective synthesis, expert coordination
- **SOLUTION_BUILDER:** Complex strategic analysis, scenario modeling

**ODI Score Adjustments:**
- Importance: +2 to +3 for synthesis and strategic outcomes
- Satisfaction: -2 to -3 for siloed or manual synthesis (highest opportunity)

---

#### LEARNER Archetype (Low AI Maturity + Routine Work)
**Characteristics:** Beginners who need guidance and confidence-building

**JTBD Patterns:**
- **Primary Focus:** Learning safely, avoiding mistakes, building confidence
- **Outcome Priorities:** Error minimization, guidance maximization
- **Typical Language:** "learn," "understand," "avoid mistakes," "gain confidence"
- **Success Metrics:** Skills mastered, mistakes avoided, confidence gained

**Common JTBDs:**
- "When I try new AI tools, I want clear step-by-step guidance, so I can avoid embarrassing mistakes"
- "When I learn new features, I want examples and templates, so I can build confidence gradually"
- "When I'm stuck, I want accessible help, so I can keep progressing without feeling incompetent"

**Service Preferences:**
- **ASK_EXPERT:** Guided experiences, tutorials, mentoring
- **WORKFLOWS:** Template-based, guided workflows with examples

**ODI Score Adjustments:**
- Importance: +1 to +2 for guidance and error prevention
- Satisfaction: -2 to -3 for current tools (high opportunity for better onboarding)

---

#### SKEPTIC Archetype (Low AI Maturity + Strategic Work)
**Characteristics:** Traditionalists who require proof and validation

**JTBD Patterns:**
- **Primary Focus:** Verification, validation, risk mitigation
- **Outcome Priorities:** Accuracy maximization, error minimization
- **Typical Language:** "verify," "validate," "prove," "show me the evidence"
- **Success Metrics:** Accuracy rate, audit trail completeness, risk avoided

**Common JTBDs:**
- "When I evaluate AI outputs, I want to verify sources and reasoning, so I can trust the accuracy"
- "When I adopt new tools, I want proof of ROI and compliance, so I can protect the organization"
- "When I use AI-assisted work, I want human-in-the-loop review, so I can catch errors before they cause harm"

**Service Preferences:**
- **ASK_EXPERT:** Expert verification, citation transparency
- **All Services:** HITL (human-in-the-loop) features, audit trails

**ODI Score Adjustments:**
- Importance: +2 to +3 for validation and accuracy outcomes
- Satisfaction: -3 to -4 for black-box AI (highest opportunity for transparency)

---

## SERVICE LAYER ROUTING

### Mapping JTBDs to Service Layers

#### ASK_EXPERT Service
**Best For:**
- Complex, nuanced questions requiring expert judgment
- Guidance and coaching needs
- Single-perspective deep expertise
- Learning and development JTBDs

**JTBD Characteristics:**
- High complexity, low repeatability
- Requires human judgment and context
- Needs explanation and reasoning
- Benefits from single expert perspective

**Example JTBDs:**
- "Provide strategic guidance on KOL engagement approach"
- "Explain complex clinical concepts for KOL meeting"
- "Coach me on handling difficult stakeholder situation"
- "Help me understand regulatory pathway options"

**Archetype Routing:**
- **LEARNER:** Primary service (guidance, examples, coaching)
- **SKEPTIC:** With verification features (expert credentials, citations)
- **AUTOMATOR:** Lower priority (prefers automation)
- **ORCHESTRATOR:** For specialized expertise (combined with panels)

**Key Features Needed:**
- Expert credentials and background
- Explanation of reasoning
- Citation and source transparency
- Follow-up question capability

---

#### ASK_PANEL Service
**Best For:**
- Multi-perspective synthesis
- Complex strategic decisions
- Synthesizing across domains/specialties
- Identifying patterns and insights

**JTBD Characteristics:**
- Requires multiple viewpoints
- Strategic or complex decisions
- Cross-domain synthesis
- Pattern identification

**Example JTBDs:**
- "Synthesize competitive intelligence across clinical, commercial, regulatory"
- "Analyze KOL network dynamics with multiple expert perspectives"
- "Evaluate strategic options with diverse expert input"
- "Identify trends across multiple data sources"

**Archetype Routing:**
- **ORCHESTRATOR:** Primary service (synthesis, strategic insights)
- **SKEPTIC:** With verification (multi-source validation)
- **AUTOMATOR:** For complex one-time decisions
- **LEARNER:** Lower priority (can be overwhelming)

**Key Features Needed:**
- Panel composition transparency
- Synthesis methodology explanation
- Dissenting opinions surfaced
- Confidence scoring per perspective

---

#### WORKFLOWS Service
**Best For:**
- Routine, repeatable tasks
- Template-based processes
- Auto-documentation and capture
- Guided step-by-step processes

**JTBD Characteristics:**
- High frequency, routine tasks
- Standardizable processes
- Time-consuming manual work
- Clear start and end points

**Example JTBDs:**
- "Auto-generate meeting briefings from multiple sources"
- "Capture and format CRM documentation from notes"
- "Route medical inquiries to appropriate approvers"
- "Generate compliance-ready reports from raw data"

**Archetype Routing:**
- **AUTOMATOR:** Primary service (automation of repetitive work)
- **LEARNER:** With guided templates and examples
- **ORCHESTRATOR:** For scalable routine processes
- **SKEPTIC:** With human review checkpoints

**Key Features Needed:**
- Template customization
- Automation rule transparency
- Human-in-the-loop checkpoints (for Skeptics)
- Progress tracking and version control

---

#### SOLUTION_BUILDER Service
**Best For:**
- Custom deliverable creation
- Complex multi-step projects
- Strategic document assembly
- Comprehensive analysis packages

**JTBD Characteristics:**
- Custom, non-routine outputs
- Multi-component deliverables
- Strategic or high-stakes work
- Synthesis into coherent package

**Example JTBDs:**
- "Build comprehensive response package for complex medical inquiry"
- "Create board presentation with strategic insights and recommendations"
- "Develop publication strategy with timeline and KOL authorship plan"
- "Assemble competitive intelligence dossier with analysis"

**Archetype Routing:**
- **ORCHESTRATOR:** Primary service (strategic deliverables)
- **AUTOMATOR:** For scalable solution templates
- **LEARNER:** With guided assembly and examples
- **SKEPTIC:** With component verification

**Key Features Needed:**
- Component assembly transparency
- Iterative refinement capability
- Source attribution for all components
- Quality review checkpoints

---

### Service Routing Decision Tree

```
START: User has a JTBD
│
├─ Is it routine/repeatable?
│  ├─ YES → WORKFLOWS
│  │  └─ Does user need guidance? → Add templates/examples (LEARNER)
│  │  └─ Does user need verification? → Add HITL checkpoints (SKEPTIC)
│  │
│  └─ NO → Continue
│
├─ Does it require multiple perspectives?
│  ├─ YES → ASK_PANEL
│  │  └─ Is user ORCHESTRATOR? → Primary service
│  │  └─ Is user SKEPTIC? → Add verification features
│  │
│  └─ NO → Continue
│
├─ Is it a custom deliverable/project?
│  ├─ YES → SOLUTION_BUILDER
│  │  └─ Is user ORCHESTRATOR? → Strategic complexity
│  │  └─ Is user AUTOMATOR? → Reusable template
│  │
│  └─ NO → Continue
│
└─ Default → ASK_EXPERT
   └─ Is user LEARNER? → Guidance mode
   └─ Is user SKEPTIC? → Verification mode
```

---

## ODI SCORING FRAMEWORK

### Outcome-Driven Innovation Methodology

#### Scoring Components

**1. Importance Score (0-10)**
- How critical is this outcome to success?
- 0-3: Nice to have
- 4-6: Important
- 7-8: Very important
- 9-10: Mission-critical

**2. Satisfaction Score (0-10)**
- How satisfied are users currently with existing solutions?
- 0-3: Severely under-served
- 4-6: Moderately served
- 7-8: Well served
- 9-10: Over-served

**3. Opportunity Score Calculation**
```
Opportunity Score = Importance + (Importance - Satisfaction)
```

**Interpretation:**
- **50+:** Critical opportunity (under-served, high importance)
- **35-49:** High opportunity
- **20-34:** Medium opportunity
- **<20:** Low opportunity (over-served or low importance)

---

### ODI Baseline Scores by Role and Archetype

#### MSL Role - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Pre-Meeting Prep | Minimize prep time | I:9, S:5, O:13 | I:9, S:4, O:14 | I:8, S:3, O:13 | I:8, S:5, O:11 |
| Post-Meeting Docs | Minimize doc time | I:9, S:3, O:15 | I:7, S:4, O:10 | I:8, S:4, O:12 | I:7, S:5, O:9 |
| Literature Review | Minimize search time | I:8, S:4, O:12 | I:9, S:3, O:15 | I:9, S:2, O:16 | I:9, S:5, O:13 |
| Territory Planning | Optimize coverage | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:7, S:5, O:9 |
| Off-Label Response | Maximize compliance | I:10, S:4, O:16 | I:10, S:5, O:15 | I:10, S:3, O:17 | I:10, S:4, O:16 |
| KOL Relationships | Maximize trust | I:9, S:6, O:12 | I:9, S:5, O:13 | I:8, S:4, O:12 | I:9, S:7, O:11 |
| Competitive Intel | Maximize insight value | I:7, S:5, O:9 | I:8, S:4, O:12 | I:6, S:5, O:7 | I:7, S:5, O:9 |
| Continuous Learning | Minimize filter time | I:8, S:4, O:12 | I:8, S:3, O:13 | I:9, S:2, O:16 | I:7, S:5, O:9 |

**Key Patterns:**
- **AUTOMATOR:** Highest opportunity on documentation/admin tasks
- **ORCHESTRATOR:** Highest opportunity on synthesis/analysis tasks
- **LEARNER:** Highest opportunity on learning/guidance needs
- **SKEPTIC:** More satisfied overall (lower opportunity) but critical on compliance

---

#### Senior MSL Role - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Strategic KOL Network | Identify emerging KOLs | I:9, S:4, O:14 | I:10, S:3, O:17 | I:7, S:5, O:9 | I:8, S:5, O:11 |
| Mentoring | Maximize knowledge transfer | I:7, S:5, O:9 | I:8, S:5, O:11 | I:8, S:4, O:12 | I:7, S:6, O:8 |
| Strategy Input | Maximize influence | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:8, S:6, O:10 |
| Complex Escalations | Maximize accuracy | I:9, S:4, O:14 | I:9, S:3, O:15 | I:8, S:3, O:13 | I:9, S:5, O:13 |
| IIS Support | Maximize approval rate | I:7, S:5, O:9 | I:8, S:4, O:12 | I:7, S:4, O:10 | I:7, S:5, O:9 |
| Advisory Boards | Maximize strategic value | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:8, S:5, O:11 |

**Key Patterns:**
- **ORCHESTRATOR:** Dominates strategic/analytical JTBDs
- **LEARNER:** Higher importance on mentoring/learning transfer
- **All:** Higher baseline satisfaction (more experienced)

---

#### MSL Manager Role - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Team Performance | Early gap identification | I:9, S:4, O:14 | I:9, S:3, O:15 | I:8, S:3, O:13 | I:9, S:5, O:13 |
| Territory Allocation | Optimize coverage | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:8, S:5, O:11 |
| Upward Reporting | Maximize strategic value | I:8, S:4, O:12 | I:9, S:3, O:15 | I:7, S:3, O:11 | I:8, S:5, O:11 |
| Cross-Functional | On-time delivery | I:7, S:5, O:9 | I:8, S:5, O:11 | I:7, S:4, O:10 | I:7, S:6, O:8 |
| Talent Development | Maximize retention | I:8, S:5, O:11 | I:8, S:4, O:12 | I:8, S:4, O:12 | I:7, S:5, O:9 |
| Budget Management | Maximize ROI demo | I:7, S:4, O:10 | I:8, S:3, O:13 | I:7, S:3, O:11 | I:8, S:5, O:11 |
| Compliance | Early risk detection | I:9, S:5, O:13 | I:9, S:4, O:14 | I:9, S:4, O:14 | I:10, S:5, O:15 |

**Key Patterns:**
- **ORCHESTRATOR:** Leads on reporting/strategic synthesis
- **SKEPTIC:** Highest importance on compliance
- **LEARNER:** Emotional stakes higher (learning while managing)

---

#### Medical Information Specialist - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Rapid Response | Minimize response time | I:10, S:5, O:15 | I:10, S:4, O:16 | I:10, S:3, O:17 | I:10, S:5, O:15 |
| AE Documentation | Maximize completeness | I:10, S:4, O:16 | I:10, S:4, O:16 | I:10, S:3, O:17 | I:10, S:5, O:15 |
| Inquiry Trends | Early trend detection | I:7, S:4, O:10 | I:8, S:3, O:13 | I:6, S:4, O:8 | I:7, S:5, O:9 |
| Complex Escalation | Minimize expert coord time | I:8, S:4, O:12 | I:9, S:3, O:15 | I:8, S:3, O:13 | I:8, S:5, O:11 |
| Template Mgmt | Maximize currency | I:8, S:4, O:12 | I:8, S:3, O:13 | I:7, S:3, O:11 | I:9, S:4, O:14 |
| Cross-Product | Minimize synthesis time | I:8, S:3, O:13 | I:9, S:2, O:16 | I:7, S:3, O:11 | I:8, S:4, O:12 |

**Key Patterns:**
- **All:** Universally high importance on response time and AE compliance
- **ORCHESTRATOR:** Highest opportunity on cross-product synthesis
- **SKEPTIC:** Higher on template/compliance management

---

#### Medical Director Role - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Portfolio Strategy | Comprehensive inputs | I:10, S:4, O:16 | I:10, S:3, O:17 | I:9, S:4, O:14 | I:10, S:5, O:15 |
| Executive Presentation | Maximize persuasiveness | I:9, S:5, O:13 | I:10, S:4, O:16 | I:8, S:4, O:12 | I:9, S:6, O:12 |
| Regulatory Planning | Maximize approval success | I:9, S:5, O:13 | I:9, S:4, O:14 | I:8, S:4, O:12 | I:9, S:5, O:13 |
| Team Leadership | Maximize performance | I:8, S:5, O:11 | I:8, S:4, O:12 | I:8, S:4, O:12 | I:8, S:6, O:10 |
| Cross-Functional Lead | Maximize alignment | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:8, S:6, O:10 |
| Publication Strategy | Maximize impact | I:8, S:5, O:11 | I:9, S:4, O:14 | I:7, S:4, O:10 | I:8, S:5, O:11 |
| Budget Planning | Maximize ROI demo | I:8, S:4, O:12 | I:9, S:3, O:15 | I:7, S:3, O:11 | I:8, S:5, O:11 |

**Key Patterns:**
- **ORCHESTRATOR:** Dominates strategic synthesis opportunities
- **All:** High importance on portfolio strategy
- **LEARNER:** Emotional stakes around credibility at director level

---

#### VP Medical Affairs Role - ODI Matrix

| JTBD | Outcome | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|------|---------|-----------|--------------|---------|---------|
| Enterprise Strategy | Strategic alignment | I:10, S:4, O:16 | I:10, S:3, O:17 | I:9, S:4, O:14 | I:10, S:5, O:15 |
| Board Communication | Board confidence | I:9, S:5, O:13 | I:10, S:4, O:16 | I:9, S:4, O:14 | I:9, S:6, O:12 |
| Org Transformation | Maximize adoption | I:9, S:4, O:14 | I:10, S:3, O:17 | I:8, S:4, O:12 | I:9, S:5, O:13 |
| Resource Allocation | Maximize ROI | I:9, S:5, O:13 | I:10, S:4, O:16 | I:8, S:4, O:12 | I:9, S:5, O:13 |
| Thought Leadership | Industry recognition | I:7, S:5, O:9 | I:8, S:4, O:12 | I:7, S:4, O:10 | I:7, S:6, O:8 |
| Enterprise Compliance | Early risk detection | I:10, S:5, O:15 | I:10, S:4, O:16 | I:9, S:5, O:13 | I:10, S:5, O:15 |
| Competitive Intel | Early threat detection | I:8, S:4, O:12 | I:9, S:3, O:15 | I:7, S:4, O:10 | I:8, S:5, O:11 |

**Key Patterns:**
- **ORCHESTRATOR:** Highest opportunities across all strategic JTBDs
- **All:** Universal high importance on compliance and strategy
- **LEARNER:** Highest emotional stakes (VP imposter syndrome)
- **SKEPTIC:** Fiduciary responsibility drives higher importance

---

### Using ODI Scores for Prioritization

#### Product Development Priority
1. **Target 50+ Opportunity Scores First**
   - These are critical under-served needs
   - Highest ROI potential
   - Quick wins for user satisfaction

2. **Focus on High-Value Archetypes**
   - **ORCHESTRATOR:** Typically highest opportunity on complex synthesis
   - **AUTOMATOR:** Highest opportunity on routine automation
   - Prioritize features that serve these power users first

3. **Role-Specific Priorities**
   - **MSL/Senior MSL:** Pre-meeting prep, literature review
   - **Manager:** Performance analytics, reporting automation
   - **Medical Info:** Response time, cross-product synthesis
   - **Director/VP:** Strategic synthesis, board communication

4. **Universal High Opportunities**
   - Off-label compliance (all roles)
   - Strategic synthesis (director+)
   - Documentation automation (MSL roles)
   - AE handling (MIS role)

---

## DATABASE SEED STRUCTURE

### Recommended Database Schema for JTBDs

```sql
-- =====================================================================
-- JTBD TABLES
-- =====================================================================

-- Core JTBD table
CREATE TABLE jtbds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'JTBD-MSL-001'
    role_id UUID REFERENCES org_roles(id),
    jtbd_statement TEXT NOT NULL,
    situation TEXT NOT NULL, -- "When I..." part
    motivation TEXT NOT NULL, -- "I want to..." part
    desired_outcome TEXT NOT NULL, -- "so I can..." part
    job_category VARCHAR(50), -- Functional, Emotional, Social
    job_type VARCHAR(50), -- Routine, Strategic, etc.
    complexity VARCHAR(20), -- Low, Medium, High, Critical
    frequency VARCHAR(20), -- Daily, Weekly, Monthly, Quarterly, Annual, Ad-hoc
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JTBD Outcomes
CREATE TABLE jtbd_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jtbds(id) ON DELETE CASCADE,
    outcome_statement TEXT NOT NULL,
    direction VARCHAR(20), -- minimize, maximize, optimize
    measurement_type VARCHAR(50), -- time, quality, frequency, cost, accuracy
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ODI Scoring by Archetype
CREATE TABLE jtbd_odi_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jtbds(id) ON DELETE CASCADE,
    outcome_id UUID REFERENCES jtbd_outcomes(id) ON DELETE CASCADE,
    archetype VARCHAR(20) NOT NULL, -- AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
    importance_score INTEGER CHECK (importance_score BETWEEN 0 AND 10),
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 0 AND 10),
    opportunity_score INTEGER, -- Calculated: importance + (importance - satisfaction)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(jtbd_id, outcome_id, archetype)
);

-- Service Layer Routing
CREATE TABLE jtbd_service_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jtbds(id) ON DELETE CASCADE,
    archetype VARCHAR(20) NOT NULL, -- AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
    service_layer VARCHAR(50) NOT NULL, -- ASK_EXPERT, ASK_PANEL, WORKFLOWS, SOLUTION_BUILDER
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0, -- 1 = highest priority
    routing_notes TEXT,
    required_features JSONB, -- e.g., {"hitl": true, "citations": true}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(jtbd_id, archetype, service_layer)
);

-- Archetype Variations
CREATE TABLE jtbd_archetype_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id UUID NOT NULL REFERENCES jtbds(id) ON DELETE CASCADE,
    archetype VARCHAR(20) NOT NULL,
    variation_description TEXT,
    preferred_approach TEXT,
    key_requirements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(jtbd_id, archetype)
);

-- Indexes
CREATE INDEX idx_jtbds_role ON jtbds(role_id);
CREATE INDEX idx_jtbd_outcomes_jtbd ON jtbd_outcomes(jtbd_id);
CREATE INDEX idx_jtbd_odi_jtbd ON jtbd_odi_scores(jtbd_id);
CREATE INDEX idx_jtbd_odi_archetype ON jtbd_odi_scores(archetype);
CREATE INDEX idx_jtbd_routing_jtbd ON jtbd_service_routing(jtbd_id);
CREATE INDEX idx_jtbd_routing_archetype ON jtbd_service_routing(archetype);
CREATE INDEX idx_jtbd_variations_jtbd ON jtbd_archetype_variations(jtbd_id);
```

---

### Sample Seed Data (JTBD-MSL-001)

```sql
-- =====================================================================
-- SAMPLE: JTBD-MSL-001 - Pre-Meeting Preparation
-- =====================================================================

DO $$
DECLARE
    v_role_id UUID;
    v_jtbd_id UUID;
    v_outcome1_id UUID;
    v_outcome2_id UUID;
    v_outcome3_id UUID;
    v_outcome4_id UUID;
BEGIN
    -- Get MSL role ID
    SELECT id INTO v_role_id FROM org_roles
    WHERE name ILIKE '%Medical Science Liaison%'
      AND name NOT ILIKE '%Senior%'
      AND name NOT ILIKE '%Manager%'
    LIMIT 1;

    -- Insert JTBD
    INSERT INTO jtbds (
        unique_id, role_id, jtbd_statement, situation, motivation, desired_outcome,
        job_category, job_type, complexity, frequency
    ) VALUES (
        'JTBD-MSL-001',
        v_role_id,
        'When I prepare for a KOL meeting, I want to quickly synthesize the latest clinical data, KOL''s publications, and prior interactions, so I can have a credible, personalized scientific exchange that builds the relationship.',
        'prepare for a KOL meeting',
        'quickly synthesize the latest clinical data, KOL''s publications, and prior interactions',
        'have a credible, personalized scientific exchange that builds the relationship',
        'Functional',
        'Routine but critical',
        'Medium',
        'Weekly'
    ) RETURNING id INTO v_jtbd_id;

    -- Insert Outcomes
    INSERT INTO jtbd_outcomes (jtbd_id, outcome_statement, direction, measurement_type, sequence_order)
    VALUES
        (v_jtbd_id, 'Minimize time spent searching for relevant information', 'minimize', 'time', 1)
        RETURNING id INTO v_outcome1_id;

    INSERT INTO jtbd_outcomes (jtbd_id, outcome_statement, direction, measurement_type, sequence_order)
    VALUES
        (v_jtbd_id, 'Maximize comprehensiveness of background research', 'maximize', 'quality', 2)
        RETURNING id INTO v_outcome2_id;

    INSERT INTO jtbd_outcomes (jtbd_id, outcome_statement, direction, measurement_type, sequence_order)
    VALUES
        (v_jtbd_id, 'Maximize relevance of discussion topics to KOL''s interests', 'maximize', 'quality', 3)
        RETURNING id INTO v_outcome3_id;

    INSERT INTO jtbd_outcomes (jtbd_id, outcome_statement, direction, measurement_type, sequence_order)
    VALUES
        (v_jtbd_id, 'Minimize risk of missing important context', 'minimize', 'quality', 4)
        RETURNING id INTO v_outcome4_id;

    -- Insert ODI Scores for AUTOMATOR
    INSERT INTO jtbd_odi_scores (jtbd_id, outcome_id, archetype, importance_score, satisfaction_score, opportunity_score, notes)
    VALUES
        (v_jtbd_id, v_outcome1_id, 'AUTOMATOR', 9, 5, 13, 'High opportunity - wants automated briefing docs'),
        (v_jtbd_id, v_outcome2_id, 'AUTOMATOR', 8, 5, 11, 'Moderate - prefers automated comprehensive summaries'),
        (v_jtbd_id, v_outcome3_id, 'AUTOMATOR', 8, 6, 10, 'Moderate - AI can personalize automatically'),
        (v_jtbd_id, v_outcome4_id, 'AUTOMATOR', 7, 5, 9, 'Lower priority - trusts automated alerts');

    -- Insert ODI Scores for ORCHESTRATOR
    INSERT INTO jtbd_odi_scores (jtbd_id, outcome_id, archetype, importance_score, satisfaction_score, opportunity_score, notes)
    VALUES
        (v_jtbd_id, v_outcome1_id, 'ORCHESTRATOR', 9, 4, 14, 'High opportunity - multi-source synthesis needed'),
        (v_jtbd_id, v_outcome2_id, 'ORCHESTRATOR', 9, 4, 14, 'High opportunity - comprehensive across sources'),
        (v_jtbd_id, v_outcome3_id, 'ORCHESTRATOR', 9, 5, 13, 'High - wants KOL network context'),
        (v_jtbd_id, v_outcome4_id, 'ORCHESTRATOR', 8, 4, 12, 'Moderate - strategic context important');

    -- Insert ODI Scores for LEARNER
    INSERT INTO jtbd_odi_scores (jtbd_id, outcome_id, archetype, importance_score, satisfaction_score, opportunity_score, notes)
    VALUES
        (v_jtbd_id, v_outcome1_id, 'LEARNER', 8, 3, 13, 'High opportunity - overwhelmed by where to start'),
        (v_jtbd_id, v_outcome2_id, 'LEARNER', 8, 3, 13, 'High - needs guided checklist'),
        (v_jtbd_id, v_outcome3_id, 'LEARNER', 8, 3, 13, 'High - needs examples of good prep'),
        (v_jtbd_id, v_outcome4_id, 'LEARNER', 9, 2, 16, 'Critical - fear of missing something important');

    -- Insert ODI Scores for SKEPTIC
    INSERT INTO jtbd_odi_scores (jtbd_id, outcome_id, archetype, importance_score, satisfaction_score, opportunity_score, notes)
    VALUES
        (v_jtbd_id, v_outcome1_id, 'SKEPTIC', 8, 5, 11, 'Moderate - willing to save time if accurate'),
        (v_jtbd_id, v_outcome2_id, 'SKEPTIC', 9, 6, 12, 'Moderate - currently does manually'),
        (v_jtbd_id, v_outcome3_id, 'SKEPTIC', 8, 6, 10, 'Lower - trusts own judgment on relevance'),
        (v_jtbd_id, v_outcome4_id, 'SKEPTIC', 9, 5, 13, 'High - wants AI to surface but human to verify');

    -- Insert Service Layer Routing
    INSERT INTO jtbd_service_routing (jtbd_id, archetype, service_layer, is_primary, priority, routing_notes, required_features)
    VALUES
        (v_jtbd_id, 'AUTOMATOR', 'WORKFLOWS', true, 1, 'Automated briefing document generation', '{"templates": true, "auto_update": true}'),
        (v_jtbd_id, 'ORCHESTRATOR', 'ASK_PANEL', true, 1, 'Multi-source synthesis for comprehensive prep', '{"multi_source": true, "synthesis": true}'),
        (v_jtbd_id, 'LEARNER', 'ASK_EXPERT', true, 1, 'Guided prep with examples and checklists', '{"guided": true, "examples": true, "templates": true}'),
        (v_jtbd_id, 'SKEPTIC', 'ASK_EXPERT', true, 1, 'AI-assisted with human verification', '{"hitl": true, "citations": true, "verification": true}');

    -- Insert Archetype Variations
    INSERT INTO jtbd_archetype_variations (jtbd_id, archetype, variation_description, preferred_approach, key_requirements)
    VALUES
        (v_jtbd_id, 'AUTOMATOR', 'Wants automated briefing documents, templates, AI summaries', 'Fully automated workflow that generates meeting briefing doc', '{"automation_level": "high", "human_review": "minimal"}'),
        (v_jtbd_id, 'ORCHESTRATOR', 'Wants synthesis across multiple sources, competitive insights', 'AI panel that synthesizes clinical data, KOL pubs, competitive intel', '{"synthesis": "multi_source", "depth": "comprehensive"}'),
        (v_jtbd_id, 'LEARNER', 'Wants guided prep checklists, examples, templates', 'Guided workflow with step-by-step instructions and examples', '{"guidance_level": "high", "examples": "required", "templates": "provided"}'),
        (v_jtbd_id, 'SKEPTIC', 'Wants verified sources, citation trails, manual review capability', 'AI-suggested prep with full citations and human review checkpoints', '{"transparency": "full", "verification": "required", "hitl": true}');

    RAISE NOTICE 'JTBD-MSL-001 seeded successfully with ODI scores and routing';
END $$;
```

---

## APPENDIX A: JTBD ID Registry

### ID Format
`JTBD-[ROLE_ABBREV]-[NUMBER]`

### Role Abbreviations
- **MSL:** Medical Science Liaison
- **SRMSL:** Senior MSL
- **MSLMGR:** MSL Manager
- **MIS:** Medical Information Specialist
- **MEDDIR:** Medical Director
- **VPMA:** VP Medical Affairs

### Allocated IDs

**MSL (JTBD-MSL-001 to JTBD-MSL-008):**
- 001: Pre-Meeting Preparation
- 002: Post-Meeting Documentation
- 003: Literature Review and Synthesis
- 004: Territory Planning and Prioritization
- 005: Responding to Off-Label Questions
- 006: Building Long-Term KOL Relationships
- 007: Competitive Intelligence Gathering
- 008: Continuous Scientific Learning

**Senior MSL (JTBD-SRMSL-001 to JTBD-SRMSL-006):**
- 001: Strategic KOL Network Development
- 002: Mentoring Junior MSLs
- 003: Cross-Functional Medical Strategy Input
- 004: Complex Medical Information Escalations
- 005: Investigator-Initiated Study (IIS) Support
- 006: Advisory Board Planning and Execution

**MSL Manager (JTBD-MSLMGR-001 to JTBD-MSLMGR-007):**
- 001: Team Performance Management
- 002: Territory Planning and Resource Allocation
- 003: Upward Reporting to Medical Leadership
- 004: Cross-Functional Coordination
- 005: Talent Development and Retention
- 006: Budget Management and Justification
- 007: Compliance and Risk Management

**Medical Information Specialist (JTBD-MIS-001 to JTBD-MIS-006):**
- 001: Rapid Response to Medical Inquiries
- 002: Adverse Event Documentation
- 003: Managing Inquiry Trends
- 004: Complex Escalation Management
- 005: Response Template Management
- 006: Cross-Product Information Synthesis

**Medical Director (JTBD-MEDDIR-001 to JTBD-MEDDIR-007):**
- 001: Portfolio Medical Strategy Development
- 002: Executive Presentation and Influence
- 003: Regulatory Pathway Planning
- 004: Medical Affairs Team Leadership
- 005: Cross-Functional Leadership Coordination
- 006: Publication Strategy and Execution
- 007: Budget Planning and Resource Justification

**VP Medical Affairs (JTBD-VPMA-001 to JTBD-VPMA-007):**
- 001: Enterprise Medical Affairs Strategy
- 002: Board-Level Communication
- 003: Organizational Transformation Leadership
- 004: Enterprise-Wide Resource Allocation
- 005: Industry Thought Leadership
- 006: Enterprise Risk and Compliance Governance
- 007: Competitive Intelligence and Market Positioning

**Total JTBDs:** 41 unique Jobs to be Done across 6 roles

---

## APPENDIX B: Quick Reference - Service Routing

### By Archetype

**AUTOMATOR** (Primary: WORKFLOWS)
- Use for: Routine automation, template generation, auto-documentation
- Secondary: SOLUTION_BUILDER for reusable systems
- Tertiary: ASK_EXPERT for complex one-time decisions

**ORCHESTRATOR** (Primary: ASK_PANEL)
- Use for: Multi-source synthesis, strategic analysis, complex decisions
- Secondary: SOLUTION_BUILDER for strategic deliverables
- Tertiary: WORKFLOWS for scalable routine processes

**LEARNER** (Primary: ASK_EXPERT)
- Use for: Guided experiences, tutorials, coaching, examples
- Secondary: WORKFLOWS with templates and guidance
- Tertiary: SOLUTION_BUILDER with guided assembly

**SKEPTIC** (Primary: ASK_EXPERT + HITL)
- Use for: Verification, validation, expert review with citations
- Secondary: ASK_PANEL for multi-source validation
- Tertiary: All services with HITL and audit trails

---

## APPENDIX C: Implementation Roadmap

### Phase 1: High-Opportunity JTBDs (Months 1-3)
**Target: ODI Opportunity Score 50+**

1. **JTBD-MSL-002:** Post-Meeting Documentation (AUTOMATOR: O:15)
2. **JTBD-MSL-003:** Literature Review (LEARNER: O:16)
3. **JTBD-MSL-005:** Off-Label Questions (LEARNER: O:17)
4. **JTBD-MIS-001:** Rapid Response (LEARNER: O:17)
5. **JTBD-MIS-002:** AE Documentation (AUTOMATOR: O:16)
6. **JTBD-MEDDIR-001:** Portfolio Strategy (ORCHESTRATOR: O:17)
7. **JTBD-VPMA-001:** Enterprise Strategy (ORCHESTRATOR: O:17)

### Phase 2: High-Value Archetypes (Months 4-6)
**Target: ORCHESTRATOR + AUTOMATOR personas**

Focus on strategic synthesis and automation JTBDs with O:14-16

### Phase 3: Complete Coverage (Months 7-12)
**Target: All JTBDs with O:10+**

Build out complete JTBD coverage for all roles and archetypes

---

## END OF DOCUMENT

**Document Summary:**
- **Total JTBDs Defined:** 41
- **Roles Covered:** 6
- **Archetypes per Role:** 4 (MECE framework)
- **ODI Scores:** Defined for all JTBD × Outcome × Archetype combinations
- **Service Routing:** Mapped for all JTBD × Archetype combinations
- **Database-Ready:** Complete seed structure provided

**Next Steps:**
1. Review and validate JTBD statements with actual Medical Affairs professionals
2. Implement database schema in Supabase
3. Create seed scripts for all 41 JTBDs
4. Build service layer routing logic based on framework
5. Develop ODI scoring dashboard for product prioritization
