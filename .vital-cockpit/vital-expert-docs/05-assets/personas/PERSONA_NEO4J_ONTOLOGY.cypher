// ============================================================================
// VITAL Platform: Neo4j Persona Ontology Schema
// Version: 4.0 (Gold Standard)
// Date: 2025-11-20
// Purpose: Graph-based persona intelligence for dual-purpose insights
// ============================================================================

// ============================================================================
// SECTION 1: CONSTRAINTS & INDEXES
// ============================================================================

// Persona constraints
CREATE CONSTRAINT persona_id_unique IF NOT EXISTS
FOR (p:Persona) REQUIRE p.persona_id IS UNIQUE;

CREATE CONSTRAINT persona_slug_unique IF NOT EXISTS
FOR (p:Persona) REQUIRE p.slug IS UNIQUE;

// Archetype constraints
CREATE CONSTRAINT archetype_name_unique IF NOT EXISTS
FOR (a:Archetype) REQUIRE a.name IS UNIQUE;

// JTBD constraints
CREATE CONSTRAINT jtbd_id_unique IF NOT EXISTS
FOR (j:JTBD) REQUIRE j.jtbd_id IS UNIQUE;

// Outcome constraints
CREATE CONSTRAINT outcome_id_unique IF NOT EXISTS
FOR (o:Outcome) REQUIRE o.outcome_id IS UNIQUE;

// PainPoint constraints
CREATE CONSTRAINT pain_point_id_unique IF NOT EXISTS
FOR (pp:PainPoint) REQUIRE pp.pain_point_id IS UNIQUE;

// Goal constraints
CREATE CONSTRAINT goal_id_unique IF NOT EXISTS
FOR (g:Goal) REQUIRE g.goal_id IS UNIQUE;

// Opportunity constraints
CREATE CONSTRAINT opportunity_id_unique IF NOT EXISTS
FOR (opp:Opportunity) REQUIRE opp.opportunity_id IS UNIQUE;

// Function constraints
CREATE CONSTRAINT org_function_name_unique IF NOT EXISTS
FOR (f:OrgFunction) REQUIRE f.name IS UNIQUE;

// ServiceLayer constraints
CREATE CONSTRAINT service_layer_name_unique IF NOT EXISTS
FOR (s:ServiceLayer) REQUIRE s.name IS UNIQUE;

// ============================================================================
// SECTION 2: INDEXES FOR PERFORMANCE
// ============================================================================

// Persona indexes
CREATE INDEX persona_archetype_idx IF NOT EXISTS
FOR (p:Persona) ON (p.archetype);

CREATE INDEX persona_function_idx IF NOT EXISTS
FOR (p:Persona) ON (p.business_function);

CREATE INDEX persona_seniority_idx IF NOT EXISTS
FOR (p:Persona) ON (p.seniority_level);

CREATE INDEX persona_active_idx IF NOT EXISTS
FOR (p:Persona) ON (p.is_active);

CREATE INDEX persona_work_pattern_idx IF NOT EXISTS
FOR (p:Persona) ON (p.work_pattern);

// Full-text search on persona names
CREATE FULLTEXT INDEX persona_name_fulltext IF NOT EXISTS
FOR (p:Persona) ON EACH [p.name, p.title, p.tagline];

// JTBD indexes
CREATE INDEX jtbd_category_idx IF NOT EXISTS
FOR (j:JTBD) ON (j.jtbd_category);

CREATE INDEX jtbd_complexity_idx IF NOT EXISTS
FOR (j:JTBD) ON (j.complexity_level);

// Opportunity indexes
CREATE INDEX opportunity_score_idx IF NOT EXISTS
FOR (opp:Opportunity) ON (opp.overall_score);

CREATE INDEX opportunity_status_idx IF NOT EXISTS
FOR (opp:Opportunity) ON (opp.status);

// ============================================================================
// SECTION 3: CORE NODE CREATION - ARCHETYPES
// ============================================================================

// Create the 4 universal archetypes
MERGE (a:Archetype {name: 'AUTOMATOR'})
SET a.description = 'High AI maturity + Routine work. Focuses on efficiency and automation.',
    a.ai_maturity = 'HIGH',
    a.work_complexity = 'ROUTINE',
    a.primary_value = 'Time savings and cost reduction',
    a.service_preference = 'Workflows + Ask Expert',
    a.ux_style = 'Minimal',
    a.adoption_speed = 'Fast (weeks)'
;

MERGE (a:Archetype {name: 'ORCHESTRATOR'})
SET a.description = 'High AI maturity + Strategic work. Seeks multi-agent reasoning and synthesis.',
    a.ai_maturity = 'HIGH',
    a.work_complexity = 'STRATEGIC',
    a.primary_value = 'Decision quality and strategic speed',
    a.service_preference = 'Ask Panel + Solution Builder',
    a.ux_style = 'Canvas-based',
    a.adoption_speed = 'Medium (months)'
;

MERGE (a:Archetype {name: 'LEARNER'})
SET a.description = 'Low AI maturity + Routine work. Needs guidance and education.',
    a.ai_maturity = 'LOW',
    a.work_complexity = 'ROUTINE',
    a.primary_value = 'Skill velocity and error reduction',
    a.service_preference = 'Ask Expert + Guided Workflows',
    a.ux_style = 'Wizard/step-by-step',
    a.adoption_speed = 'Medium (months)'
;

MERGE (a:Archetype {name: 'SKEPTIC'})
SET a.description = 'Low AI maturity + Strategic work. Requires transparency and validation.',
    a.ai_maturity = 'LOW',
    a.work_complexity = 'STRATEGIC',
    a.primary_value = 'Risk mitigation and compliance assurance',
    a.service_preference = 'Ask Panel + HITL Workflows',
    a.ux_style = 'Split-screen with citations',
    a.adoption_speed = 'Slow (6+ months)'
;

// ============================================================================
// SECTION 4: CORE NODE CREATION - SERVICE LAYERS
// ============================================================================

MERGE (s:ServiceLayer {name: 'ASK_EXPERT'})
SET s.layer_number = 1,
    s.description = 'Single-agent Q&A for quick answers',
    s.use_case = 'Fact-finding, unblocking, knowledge retrieval',
    s.ideal_for_archetypes = ['AUTOMATOR', 'LEARNER']
;

MERGE (s:ServiceLayer {name: 'ASK_PANEL'})
SET s.layer_number = 2,
    s.description = 'Multi-agent reasoning with different perspectives',
    s.use_case = 'Strategic decisions, multi-dimensional analysis',
    s.ideal_for_archetypes = ['ORCHESTRATOR', 'SKEPTIC']
;

MERGE (s:ServiceLayer {name: 'WORKFLOWS'})
SET s.layer_number = 3,
    s.description = 'Multi-step automation with HITL checkpoints',
    s.use_case = 'Repeatable processes, complex workflows',
    s.ideal_for_archetypes = ['AUTOMATOR', 'LEARNER', 'SKEPTIC']
;

MERGE (s:ServiceLayer {name: 'SOLUTION_BUILDER'})
SET s.layer_number = 4,
    s.description = 'Integrated solutions bundling workflows and agents',
    s.use_case = 'End-to-end business processes, strategic initiatives',
    s.ideal_for_archetypes = ['ORCHESTRATOR', 'AUTOMATOR']
;

// ============================================================================
// SECTION 5: CORE NODE CREATION - ORGANIZATIONAL FUNCTIONS
// ============================================================================

MERGE (f:OrgFunction {name: 'MEDICAL_AFFAIRS'})
SET f.description = 'Medical science liaison, evidence generation, medical information'
;

MERGE (f:OrgFunction {name: 'SALES'})
SET f.description = 'Revenue generation, account management, business development'
;

MERGE (f:OrgFunction {name: 'MARKETING'})
SET f.description = 'Brand, demand generation, product marketing'
;

MERGE (f:OrgFunction {name: 'FINANCE'})
SET f.description = 'FP&A, accounting, financial operations'
;

MERGE (f:OrgFunction {name: 'HR'})
SET f.description = 'Talent acquisition, employee experience, L&D'
;

MERGE (f:OrgFunction {name: 'ENGINEERING'})
SET f.description = 'Product development, infrastructure, platform'
;

MERGE (f:OrgFunction {name: 'PRODUCT'})
SET f.description = 'Product strategy, roadmap, user research'
;

MERGE (f:OrgFunction {name: 'OPERATIONS'})
SET f.description = 'Business operations, process optimization'
;

MERGE (f:OrgFunction {name: 'CUSTOMER_SUCCESS'})
SET f.description = 'Customer support, onboarding, retention'
;

MERGE (f:OrgFunction {name: 'LEGAL'})
SET f.description = 'Legal counsel, compliance, contracts'
;

// ============================================================================
// SECTION 6: SAMPLE DATA - CREATING A PERSONA NODE
// ============================================================================

// Example: Creating a Medical Director (Orchestrator) persona
MERGE (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
SET p.name = 'Dr. Sarah Chen',
    p.title = 'Senior Medical Director - Oncology',
    p.slug = 'senior-med-dir-onc-orchestrator',
    p.tagline = 'Strategic Evidence Leader',
    p.archetype = 'ORCHESTRATOR',
    p.archetype_confidence = 0.92,
    p.business_function = 'MEDICAL_AFFAIRS',
    p.department = 'Medical Affairs - Oncology',
    p.seniority_level = 'senior',
    p.years_of_experience = 15,
    p.team_size_typical = 18,
    p.direct_reports = 6,
    p.budget_authority = 4500000.00,
    p.work_pattern = 'strategic',
    p.work_complexity_score = 85.5,
    p.ai_maturity_score = 78.0,
    p.technology_adoption = 'early_adopter',
    p.risk_tolerance = 'moderate',
    p.change_readiness = 'high',
    p.decision_making_style = 'analytical',
    p.learning_preference = 'self_directed',
    p.collaboration_style = 'collaborative',
    p.geographic_scope = 'global',
    p.is_active = true
;

// ============================================================================
// SECTION 7: RELATIONSHIP PATTERNS
// ============================================================================

// Pattern 1: Persona → Archetype
// Connect persona to their archetype
MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (a:Archetype {name: 'ORCHESTRATOR'})
MERGE (p)-[r:HAS_ARCHETYPE]->(a)
SET r.assigned_at = datetime(),
    r.confidence = 0.92,
    r.inference_method = 'automated'
;

// Pattern 2: Persona → OrgFunction
MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (f:OrgFunction {name: 'MEDICAL_AFFAIRS'})
MERGE (p)-[r:BELONGS_TO_FUNCTION]->(f)
SET r.primary_function = true
;

// Pattern 3: Persona → PainPoint
// Create pain point node and connect
MERGE (pp:PainPoint {pain_point_id: '660e8400-e29b-41d4-a716-446655440001'})
SET pp.pain_point_text = 'I can''t synthesize evidence from 50+ sources fast enough for strategic planning',
    pp.pain_category = 'information_overload',
    pp.severity = 'high',
    pp.frequency = 'frequent',
    pp.time_impact_hours_per_week = 12.0,
    pp.is_ai_addressable = true,
    pp.addressable_via_service_layer = 'ASK_PANEL'
;

MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (pp:PainPoint {pain_point_id: '660e8400-e29b-41d4-a716-446655440001'})
MERGE (p)-[r:HAS_PAIN_POINT]->(pp)
SET r.impact_score = 9.5,
    r.priority = 'critical'
;

// Pattern 4: Persona → Goal
MERGE (g:Goal {goal_id: '770e8400-e29b-41d4-a716-446655440001'})
SET g.goal_text = 'Make better strategic decisions faster with multi-source evidence synthesis',
    g.goal_category = 'strategic_decision_making',
    g.priority = 'critical',
    g.time_horizon = 'immediate',
    g.is_measurable = true,
    g.measurement_metric = 'decision_confidence_score',
    g.target_value = '8.5/10'
;

MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (g:Goal {goal_id: '770e8400-e29b-41d4-a716-446655440001'})
MERGE (p)-[r:HAS_GOAL]->(g)
SET r.importance = 10,
    r.urgency = 9
;

// Pattern 5: Persona → JTBD
MERGE (j:JTBD {jtbd_id: '880e8400-e29b-41d4-a716-446655440001'})
SET j.situation_context = 'preparing for strategic planning sessions',
    j.motivation_goal = 'synthesize evidence from multiple sources',
    j.expected_outcome = 'build credible, comprehensive strategic recommendations',
    j.full_statement = 'When preparing for strategic planning sessions, I want to synthesize evidence from multiple sources so I can build credible, comprehensive strategic recommendations',
    j.jtbd_category = 'strategic_analysis',
    j.complexity_level = 'very_complex',
    j.is_cross_functional = true,
    j.ai_addressable = true,
    j.best_service_layer = 'ASK_PANEL'
;

MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (j:JTBD {jtbd_id: '880e8400-e29b-41d4-a716-446655440001'})
MERGE (p)-[r:PERFORMS_JTBD]->(j)
SET r.priority_rank = 1,
    r.priority_level = 'critical',
    r.frequency = 'weekly',
    r.time_spent_per_occurrence_hours = 8.0,
    r.importance_score = 9.5,
    r.satisfaction_score = 4.2,
    r.opportunity_score = 14.8
;

// Pattern 6: JTBD → Outcome
MERGE (o:Outcome {outcome_id: '990e8400-e29b-41d4-a716-446655440001'})
SET o.outcome_description = 'Maximize decision confidence',
    o.outcome_category = 'quality',
    o.is_measurable = true,
    o.measurement_metric = 'confidence_score',
    o.measurement_unit = 'scale_1_to_10',
    o.automator_weight = 7.0,
    o.orchestrator_weight = 10.0,
    o.learner_weight = 6.0,
    o.skeptic_weight = 9.0,
    o.ai_can_improve = true
;

MATCH (j:JTBD {jtbd_id: '880e8400-e29b-41d4-a716-446655440001'})
MATCH (o:Outcome {outcome_id: '990e8400-e29b-41d4-a716-446655440001'})
MERGE (j)-[r:HAS_OUTCOME]->(o)
SET r.weight = 10.0
;

// Pattern 7: Persona → ServiceLayer (Preference)
MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (s:ServiceLayer {name: 'ASK_PANEL'})
MERGE (p)-[r:PREFERS_SERVICE]->(s)
SET r.expected_usage_percentage = 60.0,
    r.preference_score = 9.5,
    r.automation_level = 'moderate',
    r.explanation_depth = 'detailed',
    r.citation_density = 'medium',
    r.proactivity_level = 'moderate'
;

// Pattern 8: Persona → Stakeholder (Internal)
MERGE (s:Persona {persona_id: 'aaa00000-e29b-41d4-a716-446655440002'})
SET s.name = 'VP Commercial Strategy',
    s.title = 'VP Commercial Strategy',
    s.slug = 'vp-commercial-strategy',
    s.business_function = 'SALES',
    s.seniority_level = 'executive'
;

MATCH (p:Persona {persona_id: '550e8400-e29b-41d4-a716-446655440001'})
MATCH (s:Persona {persona_id: 'aaa00000-e29b-41d4-a716-446655440002'})
MERGE (p)-[r:COLLABORATES_WITH]->(s)
SET r.relationship_type = 'collaborates_with',
    r.interaction_frequency = 'weekly',
    r.is_cross_functional = true,
    r.criticality = 'high'
;

// Pattern 9: Opportunity → JTBD
MERGE (opp:Opportunity {opportunity_id = 'bbb00000-e29b-41d4-a716-446655440001'})
SET opp.opportunity_name = 'Multi-Source Evidence Synthesis Panel',
    opp.opportunity_description = 'Multi-agent panel for synthesizing evidence from 20+ sources across Medical Affairs',
    opp.opportunity_category = 'augmentation',
    opp.target_archetype = 'ORCHESTRATOR',
    opp.reach_score = 85.0,
    opp.impact_score = 92.0,
    opp.feasibility_score = 75.0,
    opp.adoption_readiness_score = 78.0,
    opp.overall_score = 82.0,
    opp.recommended_service_layer = 'ASK_PANEL',
    opp.estimated_time_savings_hours_per_week = 12.0,
    opp.estimated_annual_value_usd = 2500000.00,
    opp.status = 'approved',
    opp.priority = 'p0'
;

MATCH (opp:Opportunity {opportunity_id = 'bbb00000-e29b-41d4-a716-446655440001'})
MATCH (j:JTBD {jtbd_id: '880e8400-e29b-41d4-a716-446655440001'})
MERGE (opp)-[r:ADDRESSES_JTBD]->(j)
SET r.addresses_fully = false,
    r.addresses_partially = true,
    r.improvement_percentage = 75.0
;

// Pattern 10: Opportunity → ServiceLayer
MATCH (opp:Opportunity {opportunity_id = 'bbb00000-e29b-41d4-a716-446655440001'})
MATCH (s:ServiceLayer {name: 'ASK_PANEL'})
MERGE (opp)-[r:REQUIRES_SERVICE]->(s)
SET r.usage_type = 'primary'
;

// ============================================================================
// SECTION 8: GRAPH TRAVERSAL QUERIES (EXAMPLES)
// ============================================================================

// Query 1: Find all personas of a specific archetype in a function
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype {name: 'ORCHESTRATOR'})
// MATCH (p)-[:BELONGS_TO_FUNCTION]->(f:OrgFunction {name: 'MEDICAL_AFFAIRS'})
// WHERE p.is_active = true
// RETURN p.name, p.title, p.work_complexity_score, p.ai_maturity_score
// ORDER BY p.work_complexity_score DESC;

// Query 2: Find cross-functional pain patterns
// MATCH (p1:Persona)-[:HAS_PAIN_POINT]->(pp:PainPoint)<-[:HAS_PAIN_POINT]-(p2:Persona)
// WHERE p1.business_function <> p2.business_function
// RETURN pp.pain_point_text,
//        pp.pain_category,
//        collect(DISTINCT p1.business_function) + collect(DISTINCT p2.business_function) as affected_functions,
//        count(DISTINCT p1) + count(DISTINCT p2) as affected_persona_count
// ORDER BY affected_persona_count DESC;

// Query 3: Find highest-priority JTBDs for an archetype
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype {name: 'AUTOMATOR'})
// MATCH (p)-[r:PERFORMS_JTBD]->(j:JTBD)
// WHERE p.is_active = true
// RETURN j.full_statement,
//        j.jtbd_category,
//        AVG(r.importance_score) as avg_importance,
//        AVG(r.satisfaction_score) as avg_satisfaction,
//        AVG(r.opportunity_score) as avg_opportunity_score,
//        count(p) as persona_count
// ORDER BY avg_opportunity_score DESC
// LIMIT 10;

// Query 4: Find opportunities by archetype with affected personas
// MATCH (opp:Opportunity {target_archetype: 'ORCHESTRATOR'})
// MATCH (opp)-[:ADDRESSES_JTBD]->(j:JTBD)<-[r:PERFORMS_JTBD]-(p:Persona)
// WHERE p.is_active = true AND r.priority_level IN ['high', 'critical']
// RETURN opp.opportunity_name,
//        opp.overall_score,
//        opp.estimated_annual_value_usd,
//        count(DISTINCT p) as affected_personas,
//        collect(DISTINCT p.business_function) as affected_functions
// ORDER BY opp.overall_score DESC;

// Query 5: Find collaboration networks (stakeholder graph)
// MATCH path = (p1:Persona)-[:COLLABORATES_WITH*1..2]-(p2:Persona)
// WHERE p1.persona_id = '550e8400-e29b-41d4-a716-446655440001'
// AND p2.business_function <> p1.business_function
// RETURN p1.name as source_persona,
//        p2.name as connected_persona,
//        p2.business_function as function,
//        length(path) as degrees_of_separation;

// Query 6: Calculate department adoption readiness
// MATCH (p:Persona)-[:BELONGS_TO_FUNCTION]->(f:OrgFunction {name: 'FINANCE'})
// MATCH (p)-[:HAS_ARCHETYPE]->(a:Archetype)
// WHERE p.is_active = true
// WITH f, a.name as archetype, count(p) as persona_count
// RETURN f.name as function,
//        archetype,
//        persona_count,
//        CASE archetype
//          WHEN 'AUTOMATOR' THEN persona_count * 1.0
//          WHEN 'ORCHESTRATOR' THEN persona_count * 0.9
//          WHEN 'LEARNER' THEN persona_count * 0.5
//          WHEN 'SKEPTIC' THEN persona_count * 0.2
//        END as weighted_count
// ORDER BY archetype;

// Query 7: Find migration candidates (Learner → Automator)
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype {name: 'LEARNER'})
// WHERE p.is_active = true
// AND p.ai_maturity_score >= 45
// AND p.technology_adoption IN ['early_majority', 'early_adopter']
// RETURN p.name,
//        p.title,
//        p.ai_maturity_score,
//        p.technology_adoption,
//        'Candidate for Automator migration' as insight
// ORDER BY p.ai_maturity_score DESC;

// Query 8: Find service layer usage by archetype
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype)
// MATCH (p)-[r:PREFERS_SERVICE]->(s:ServiceLayer)
// RETURN a.name as archetype,
//        s.name as service_layer,
//        AVG(r.expected_usage_percentage) as avg_usage_percent,
//        AVG(r.preference_score) as avg_preference_score,
//        count(p) as persona_count
// ORDER BY archetype, avg_usage_percent DESC;

// Query 9: Find JTBD outcome importance by archetype
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype)
// MATCH (p)-[:PERFORMS_JTBD]->(j:JTBD)-[:HAS_OUTCOME]->(o:Outcome)
// WITH a.name as archetype, o,
//      CASE a.name
//        WHEN 'AUTOMATOR' THEN o.automator_weight
//        WHEN 'ORCHESTRATOR' THEN o.orchestrator_weight
//        WHEN 'LEARNER' THEN o.learner_weight
//        WHEN 'SKEPTIC' THEN o.skeptic_weight
//      END as weight
// RETURN archetype,
//        o.outcome_description,
//        o.outcome_category,
//        weight
// ORDER BY archetype, weight DESC;

// Query 10: Find highest-value opportunities with full context
// MATCH (opp:Opportunity)
// WHERE opp.status IN ['identified', 'evaluated', 'approved']
// OPTIONAL MATCH (opp)-[:ADDRESSES_JTBD]->(j:JTBD)<-[r:PERFORMS_JTBD]-(p:Persona)
// WHERE r.priority_level IN ['high', 'critical']
// OPTIONAL MATCH (opp)-[:REQUIRES_SERVICE]->(s:ServiceLayer)
// RETURN opp.opportunity_name,
//        opp.opportunity_description,
//        opp.target_archetype,
//        opp.overall_score,
//        opp.estimated_annual_value_usd,
//        s.name as required_service,
//        count(DISTINCT p) as affected_personas,
//        collect(DISTINCT j.jtbd_category) as addressed_job_categories
// ORDER BY opp.overall_score DESC
// LIMIT 20;

// ============================================================================
// SECTION 9: SYNCHRONIZATION WITH POSTGRESQL
// ============================================================================

// Strategy for keeping Neo4j and PostgreSQL in sync:
//
// 1. PostgreSQL is the source of truth for all persona data
// 2. Neo4j is synchronized from PostgreSQL for graph queries
// 3. Sync happens via:
//    - Initial bulk import using LOAD CSV or APOC procedures
//    - Incremental updates via CDC (Change Data Capture) or scheduled ETL
// 4. Sync frequency: Real-time for critical paths, batch for analytics
//
// Sample bulk import pattern (using APOC):
//
// CALL apoc.load.jdbc('jdbc:postgresql://host:5432/vital', 'SELECT * FROM personas WHERE is_active = true')
// YIELD row
// MERGE (p:Persona {persona_id: row.persona_id})
// SET p.name = row.name,
//     p.title = row.title,
//     p.slug = row.slug,
//     p.archetype = row.archetype,
//     p.business_function = row.business_function,
//     p.seniority_level = row.seniority_level,
//     p.work_complexity_score = row.work_complexity_score,
//     p.ai_maturity_score = row.ai_maturity_score,
//     p.is_active = row.is_active;

// ============================================================================
// SECTION 10: GRAPH ALGORITHMS (USING GDS LIBRARY)
// ============================================================================

// Use Case 1: Community Detection (Find natural persona clusters)
// CALL gds.louvain.write({
//   nodeProjection: 'Persona',
//   relationshipProjection: 'COLLABORATES_WITH',
//   writeProperty: 'community_id'
// })
// YIELD communityCount, modularity;

// Use Case 2: PageRank (Find most influential personas)
// CALL gds.pageRank.write({
//   nodeProjection: 'Persona',
//   relationshipProjection: 'COLLABORATES_WITH',
//   writeProperty: 'influence_score'
// })
// YIELD nodePropertiesWritten;

// Use Case 3: Shortest Path (Find cross-functional collaboration paths)
// MATCH (p1:Persona {name: 'Dr. Sarah Chen'}), (p2:Persona {name: 'CFO'})
// CALL gds.shortestPath.dijkstra.stream({
//   sourceNode: p1,
//   targetNode: p2,
//   relationshipTypes: ['COLLABORATES_WITH']
// })
// YIELD path
// RETURN path;

// Use Case 4: Similarity (Find similar personas for recommendations)
// CALL gds.nodeSimilarity.write({
//   nodeProjection: 'Persona',
//   relationshipProjection: {
//     HAS_PAIN_POINT: { orientation: 'UNDIRECTED' },
//     PERFORMS_JTBD: { orientation: 'UNDIRECTED' },
//     HAS_GOAL: { orientation: 'UNDIRECTED' }
//   },
//   writeProperty: 'similarity_score',
//   writeRelationshipType: 'SIMILAR_TO'
// })
// YIELD nodesCompared, relationshipsWritten;

// ============================================================================
// SECTION 11: DATA QUALITY & VALIDATION
// ============================================================================

// Query to find orphaned nodes (personas without archetypes)
// MATCH (p:Persona)
// WHERE NOT (p)-[:HAS_ARCHETYPE]->(:Archetype)
// RETURN p.name, p.persona_id, 'Missing archetype assignment' as issue;

// Query to find inconsistent archetype assignments
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype)
// WHERE (p.archetype <> a.name)
// RETURN p.name, p.archetype as persona_property, a.name as archetype_node, 'Inconsistent archetype' as issue;

// Query to find personas with low inference confidence
// MATCH (p:Persona)-[r:HAS_ARCHETYPE]->(a:Archetype)
// WHERE r.confidence < 0.60
// RETURN p.name, p.archetype, r.confidence, 'Low confidence - requires review' as issue
// ORDER BY r.confidence ASC;

// Query to find JTBDs without outcomes
// MATCH (j:JTBD)
// WHERE NOT (j)-[:HAS_OUTCOME]->(:Outcome)
// RETURN j.full_statement, 'Missing outcomes' as issue;

// ============================================================================
// SECTION 12: CLEANUP & MAINTENANCE
// ============================================================================

// Remove inactive personas from graph
// MATCH (p:Persona {is_active: false})
// DETACH DELETE p;

// Remove orphaned nodes
// MATCH (pp:PainPoint)
// WHERE NOT (pp)<-[:HAS_PAIN_POINT]-(:Persona)
// DELETE pp;

// Update materialized aggregations (run periodically)
// MATCH (p:Persona)-[:HAS_ARCHETYPE]->(a:Archetype)
// MATCH (p)-[:BELONGS_TO_FUNCTION]->(f:OrgFunction)
// WITH f, a, count(p) as persona_count
// MERGE (f)-[r:HAS_ARCHETYPE_DISTRIBUTION]->(a)
// SET r.persona_count = persona_count,
//     r.last_updated = datetime();

// ============================================================================
// END OF ONTOLOGY
// ============================================================================

// Schema Summary:
// - Core Nodes: Persona, Archetype, JTBD, Outcome, PainPoint, Goal, Opportunity, OrgFunction, ServiceLayer
// - Key Relationships: HAS_ARCHETYPE, PERFORMS_JTBD, HAS_PAIN_POINT, HAS_GOAL, ADDRESSES_JTBD, COLLABORATES_WITH
// - Supports: Dual-purpose intelligence (personalization + transformation)
// - Enables: Cross-functional insights, opportunity discovery, adoption planning
