-- ============================================================================
-- MEDICAL AFFAIRS ROLES REFERENCE DATA
-- Version: 1.0
-- Date: 2025-11-27
-- Purpose: Define all Medical Affairs roles for persona creation
-- ============================================================================

-- This file defines the 15 core Medical Affairs roles that will each have
-- 4 MECE personas (Automator, Orchestrator, Learner, Skeptic) = 60 total personas

/*
MEDICAL AFFAIRS ORGANIZATIONAL HIERARCHY:

Level 1: Executive Leadership
├── Chief Medical Officer (CMO)
└── VP Medical Affairs

Level 2: Director Level
├── Medical Director
├── Field Medical Director
├── Medical Information Director
└── HEOR Director

Level 3: Manager Level
├── Medical Affairs Manager
├── KOL Manager
├── Evidence Generation Manager
└── Medical Communications Manager

Level 4: Specialist Level
├── Medical Science Liaison (MSL)
├── Medical Information Specialist
├── HEOR Specialist
├── Medical Writer
└── Clinical Trial Liaison

TOTAL: 15 Roles × 4 Archetypes = 60 Personas
*/

-- ============================================================================
-- ROLE DEFINITIONS WITH KEY ATTRIBUTES
-- ============================================================================

/*
ROLE 1: Chief Medical Officer (CMO)
- Seniority: Executive (C-Suite)
- Years Experience: 20-30 years
- Budget Authority: $50M-$500M
- Team Size: 200-1000
- Geographic Scope: Global
- Work Pattern: Strategic
- Key Responsibilities:
  * Set overall medical strategy for the organization
  * Ensure patient safety and scientific integrity
  * Lead medical governance and compliance
  * Represent company to regulators and KOLs
  * Oversee clinical development and medical affairs
- Salary Range: $400,000 - $800,000 USD

ROLE 2: VP Medical Affairs
- Seniority: Executive
- Years Experience: 15-25 years
- Budget Authority: $10M-$100M
- Team Size: 50-200
- Geographic Scope: Global/Regional
- Work Pattern: Strategic
- Key Responsibilities:
  * Lead Medical Affairs strategy and operations
  * Manage relationships with senior KOLs
  * Oversee evidence generation programs
  * Ensure compliance with regulations
  * Drive cross-functional collaboration
- Salary Range: $300,000 - $500,000 USD

ROLE 3: Medical Director
- Seniority: Director
- Years Experience: 12-20 years
- Budget Authority: $5M-$20M
- Team Size: 15-50
- Geographic Scope: Regional/Global
- Work Pattern: Strategic
- Key Responsibilities:
  * Lead therapeutic area medical strategy
  * Manage MSL teams and medical programs
  * Develop scientific communication plans
  * Support regulatory submissions
  * Build KOL relationships
- Salary Range: $220,000 - $350,000 USD

ROLE 4: Field Medical Director
- Seniority: Director
- Years Experience: 10-18 years
- Budget Authority: $2M-$10M
- Team Size: 10-30
- Geographic Scope: Regional
- Work Pattern: Mixed
- Key Responsibilities:
  * Lead field medical team strategy
  * Oversee MSL activities and KOL engagement
  * Ensure field compliance
  * Gather and synthesize field insights
  * Support launch activities
- Salary Range: $200,000 - $300,000 USD

ROLE 5: Medical Information Director
- Seniority: Director
- Years Experience: 12-18 years
- Budget Authority: $1M-$5M
- Team Size: 10-25
- Geographic Scope: Global
- Work Pattern: Mixed
- Key Responsibilities:
  * Lead medical information strategy
  * Oversee response to medical inquiries
  * Manage medical content development
  * Ensure regulatory compliance
  * Support pharmacovigilance activities
- Salary Range: $180,000 - $280,000 USD

ROLE 6: HEOR Director
- Seniority: Director
- Years Experience: 12-20 years
- Budget Authority: $3M-$15M
- Team Size: 8-20
- Geographic Scope: Global
- Work Pattern: Strategic
- Key Responsibilities:
  * Lead health economics research strategy
  * Develop value demonstration evidence
  * Support market access decisions
  * Publish outcomes research
  * Engage with payers and HTAs
- Salary Range: $200,000 - $320,000 USD

ROLE 7: Medical Affairs Manager
- Seniority: Manager
- Years Experience: 8-15 years
- Budget Authority: $500K-$3M
- Team Size: 5-15
- Geographic Scope: Regional
- Work Pattern: Mixed
- Key Responsibilities:
  * Manage medical affairs programs
  * Coordinate MSL activities
  * Develop medical content
  * Support product launches
  * Track KPIs and metrics
- Salary Range: $140,000 - $200,000 USD

ROLE 8: KOL Manager
- Seniority: Manager
- Years Experience: 8-12 years
- Budget Authority: $500K-$2M
- Team Size: 3-8
- Geographic Scope: Regional
- Work Pattern: Mixed
- Key Responsibilities:
  * Develop KOL engagement strategy
  * Manage KOL database and mapping
  * Coordinate advisory boards
  * Track KOL interactions
  * Identify emerging thought leaders
- Salary Range: $130,000 - $180,000 USD

ROLE 9: Evidence Generation Manager
- Seniority: Manager
- Years Experience: 8-12 years
- Budget Authority: $1M-$5M
- Team Size: 3-10
- Geographic Scope: Regional/Global
- Work Pattern: Mixed
- Key Responsibilities:
  * Manage real-world evidence studies
  * Coordinate investigator-initiated trials
  * Oversee data collection programs
  * Support publication planning
  * Ensure study compliance
- Salary Range: $140,000 - $190,000 USD

ROLE 10: Medical Communications Manager
- Seniority: Manager
- Years Experience: 7-12 years
- Budget Authority: $500K-$2M
- Team Size: 3-8
- Geographic Scope: Regional
- Work Pattern: Mixed
- Key Responsibilities:
  * Lead medical communications strategy
  * Manage publication planning
  * Oversee content development
  * Coordinate congress activities
  * Review promotional materials
- Salary Range: $130,000 - $180,000 USD

ROLE 11: Medical Science Liaison (MSL)
- Seniority: Mid-Senior
- Years Experience: 5-12 years
- Budget Authority: $50K-$200K
- Team Size: 0 (Individual Contributor)
- Geographic Scope: Territory/Regional
- Work Pattern: Routine (Field)
- Key Responsibilities:
  * Engage with KOLs and HCPs
  * Provide scientific information
  * Gather clinical insights
  * Support clinical trials
  * Deliver scientific presentations
- Salary Range: $150,000 - $220,000 USD

ROLE 12: Medical Information Specialist
- Seniority: Mid
- Years Experience: 3-8 years
- Budget Authority: $0-$50K
- Team Size: 0 (Individual Contributor)
- Geographic Scope: Global (Remote)
- Work Pattern: Routine
- Key Responsibilities:
  * Respond to medical inquiries
  * Develop standard response documents
  * Maintain medical databases
  * Support pharmacovigilance
  * Ensure compliance
- Salary Range: $90,000 - $140,000 USD

ROLE 13: HEOR Specialist
- Seniority: Mid-Senior
- Years Experience: 5-10 years
- Budget Authority: $100K-$500K
- Team Size: 0-3
- Geographic Scope: Regional/Global
- Work Pattern: Mixed
- Key Responsibilities:
  * Conduct health economics analyses
  * Develop economic models
  * Support payer submissions
  * Publish outcomes research
  * Analyze real-world data
- Salary Range: $120,000 - $180,000 USD

ROLE 14: Medical Writer
- Seniority: Mid
- Years Experience: 4-10 years
- Budget Authority: $0-$100K
- Team Size: 0 (Individual Contributor)
- Geographic Scope: Global (Remote)
- Work Pattern: Routine
- Key Responsibilities:
  * Write clinical documents
  * Develop regulatory submissions
  * Create scientific publications
  * Prepare presentations
  * Review promotional content
- Salary Range: $100,000 - $160,000 USD

ROLE 15: Clinical Trial Liaison (CTL)
- Seniority: Mid
- Years Experience: 4-8 years
- Budget Authority: $50K-$200K
- Team Size: 0 (Individual Contributor)
- Geographic Scope: Regional
- Work Pattern: Routine (Field)
- Key Responsibilities:
  * Support clinical trial sites
  * Facilitate investigator relationships
  * Coordinate trial activities
  * Gather site feedback
  * Ensure protocol compliance
- Salary Range: $120,000 - $170,000 USD
*/

-- ============================================================================
-- ARCHETYPE DEFINITIONS FOR MEDICAL AFFAIRS
-- ============================================================================

/*
ARCHETYPE 1: AUTOMATOR
- AI Maturity Score: 70-85
- Work Complexity Score: 25-45
- Technology Adoption: Early Adopter
- Risk Tolerance: Moderate
- Change Readiness: High
- Preferred Service Layer: WORKFLOWS
- Profile: Power user who automates routine tasks
- Focus: Efficiency, automation, time savings
- AI Use Cases: Auto-generate reports, smart templates, workflow automation

ARCHETYPE 2: ORCHESTRATOR
- AI Maturity Score: 75-90
- Work Complexity Score: 65-90
- Technology Adoption: Innovator
- Risk Tolerance: High
- Change Readiness: Very High
- Preferred Service Layer: SOLUTION_BUILDER
- Profile: AI leader who orchestrates complex multi-agent workflows
- Focus: Strategic advantage, innovation, competitive edge
- AI Use Cases: Multi-agent panels, predictive analytics, custom AI workflows

ARCHETYPE 3: LEARNER
- AI Maturity Score: 25-45
- Work Complexity Score: 25-45
- Technology Adoption: Late Majority
- Risk Tolerance: Low
- Change Readiness: Moderate
- Preferred Service Layer: ASK_EXPERT
- Profile: Beginner who needs guided AI assistance
- Focus: Learning, support, gradual adoption
- AI Use Cases: Simple Q&A, guided workflows, AI tutoring

ARCHETYPE 4: SKEPTIC
- AI Maturity Score: 20-40
- Work Complexity Score: 65-85
- Technology Adoption: Laggard
- Risk Tolerance: Low
- Change Readiness: Low
- Preferred Service Layer: HYBRID (AI + Human)
- Profile: Traditionalist who requires human validation
- Focus: Trust, transparency, proven methods
- AI Use Cases: Hybrid panels, transparent AI, human oversight
*/

-- ============================================================================
-- JUNCTION TABLE DATA REQUIREMENTS
-- ============================================================================

/*
For each of the 60 personas, the following junction tables must be populated:

1. persona_typical_day_activities (6-13 activities per persona)
2. persona_motivations (3-7 per persona)
3. persona_values (3-5 per persona)
4. persona_frustrations (5-10 per persona)
5. persona_evidence_sources (5-10 per persona)
6. persona_goals (3-7 per persona)
7. persona_challenges (3-7 per persona)
8. persona_skills (5-10 per persona)
9. persona_skill_gaps (3-5 per persona)
10. persona_tools_used (5-10 per persona)
11. persona_information_sources (3-7 per persona)
12. persona_decision_criteria (3-5 per persona)
13. persona_buying_triggers (3-5 per persona)
14. persona_objections (3-5 per persona)
15. persona_success_metrics (3-5 per persona)
16. persona_communication_preferences (3-5 per persona)
17. persona_content_preferences (3-5 per persona)
18. persona_influencers (3-5 per persona)
19. persona_adoption_barriers (3-5 per persona)
20. persona_ideal_features (3-5 per persona)
21. persona_workflow_steps (5-10 per persona)
22. persona_pain_point_intensity (5-10 per persona)
23. persona_opportunity_areas (3-5 per persona)
24. persona_competitive_alternatives (3-5 per persona)

TOTAL DATA POINTS PER PERSONA: ~150-200 items
TOTAL DATA POINTS FOR 60 PERSONAS: ~9,000-12,000 items
*/

-- End of reference file

