// =====================================================================
// VITAL Platform - Neo4j GDS Query Templates
// Graph Data Science queries for enterprise ontology analysis
// =====================================================================

// =============================================================================
// 1. GRAPH PROJECTION TEMPLATES
// Create in-memory graph projections for GDS algorithms
// =============================================================================

// --- 1.1 Full Ontology Graph Projection ---
// Projects the complete organizational ontology including all relationships
CALL gds.graph.project(
    'ontology-full',
    ['Function', 'Department', 'Role', 'Persona', 'JTBD', 'ValueCategory', 'ValueDriver', 'Workflow'],
    {
        BELONGS_TO: {type: 'BELONGS_TO', orientation: 'UNDIRECTED'},
        ASSIGNED_TO: {type: 'ASSIGNED_TO', orientation: 'UNDIRECTED'},
        HAS_JTBD: {type: 'HAS_JTBD', orientation: 'UNDIRECTED'},
        DELIVERS_VALUE: {type: 'DELIVERS_VALUE', orientation: 'UNDIRECTED'},
        DRIVES_VALUE: {type: 'DRIVES_VALUE', orientation: 'UNDIRECTED'},
        TRIGGERS: {type: 'TRIGGERS', orientation: 'UNDIRECTED'},
        COLLABORATES_WITH: {type: 'COLLABORATES_WITH', orientation: 'UNDIRECTED'}
    },
    {
        nodeProperties: ['ai_readiness', 'complexity_score', 'importance_score', 'opportunity_score'],
        relationshipProperties: ['weight', 'relevance_score', 'impact_score']
    }
);

// --- 1.2 JTBD-Role Network Projection ---
// Focused projection for JTBD-Role analysis
CALL gds.graph.project(
    'jtbd-role-network',
    {
        Role: {properties: ['complexity_score', 'ai_readiness']},
        JTBD: {properties: ['importance_score', 'satisfaction_score', 'opportunity_score', 'automation_score']}
    },
    {
        HAS_JTBD: {
            type: 'HAS_JTBD',
            orientation: 'UNDIRECTED',
            properties: ['relevance_score']
        }
    }
);

// --- 1.3 Value Flow Network Projection ---
// Tracks how value flows through the organization
CALL gds.graph.project(
    'value-flow-network',
    {
        Function: {properties: []},
        Department: {properties: []},
        Role: {properties: []},
        JTBD: {properties: ['opportunity_score']},
        ValueCategory: {properties: ['sort_order']},
        ValueDriver: {properties: ['impact_weight']}
    },
    {
        BELONGS_TO: {orientation: 'NATURAL'},
        HAS_JTBD: {orientation: 'NATURAL', properties: ['relevance_score']},
        DELIVERS_VALUE: {orientation: 'NATURAL', properties: ['relevance_score']},
        DRIVES_VALUE: {orientation: 'NATURAL', properties: ['impact_score']}
    }
);

// =============================================================================
// 2. CENTRALITY ANALYSIS
// Identify most influential nodes in the ontology
// =============================================================================

// --- 2.1 PageRank - Most influential roles ---
// Find which roles are most central to organizational operations
CALL gds.pageRank.stream('ontology-full', {
    maxIterations: 50,
    dampingFactor: 0.85,
    relationshipWeightProperty: 'weight'
})
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE 'Role' IN labels(node)
RETURN
    node.name AS role_name,
    node.function_name AS function_name,
    score AS pagerank_score
ORDER BY score DESC
LIMIT 20;

// --- 2.2 Betweenness Centrality - Bridge roles ---
// Identify roles that bridge different functional areas
CALL gds.betweenness.stream('ontology-full')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE 'Role' IN labels(node) AND score > 0
RETURN
    node.name AS role_name,
    node.department_name AS department,
    score AS betweenness_score
ORDER BY score DESC
LIMIT 15;

// --- 2.3 Degree Centrality - Most connected JTBDs ---
// Find JTBDs with the most role connections
CALL gds.degree.stream('jtbd-role-network', {
    relationshipWeightProperty: 'relevance_score'
})
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS node, score
WHERE 'JTBD' IN labels(node)
RETURN
    node.code AS jtbd_code,
    node.name AS jtbd_name,
    node.job_category AS category,
    score AS weighted_degree
ORDER BY score DESC
LIMIT 25;

// =============================================================================
// 3. COMMUNITY DETECTION
// Discover natural groupings in the ontology
// =============================================================================

// --- 3.1 Louvain Communities - Role clusters ---
// Detect natural role clusters based on JTBD overlap
CALL gds.louvain.stream('jtbd-role-network', {
    relationshipWeightProperty: 'relevance_score',
    includeIntermediateCommunities: true
})
YIELD nodeId, communityId, intermediateCommunityIds
WITH gds.util.asNode(nodeId) AS node, communityId, intermediateCommunityIds
WHERE 'Role' IN labels(node)
RETURN
    communityId,
    collect(node.name) AS roles_in_community,
    count(*) AS community_size
ORDER BY community_size DESC
LIMIT 10;

// --- 3.2 Label Propagation - Function boundaries ---
// Test if function boundaries align with natural communities
CALL gds.labelPropagation.stream('ontology-full', {
    relationshipWeightProperty: 'weight',
    maxIterations: 10
})
YIELD nodeId, communityId
WITH gds.util.asNode(nodeId) AS node, communityId
WHERE 'Role' IN labels(node)
RETURN
    node.function_name AS function,
    communityId AS detected_community,
    count(*) AS role_count
ORDER BY function, detected_community;

// --- 3.3 Weakly Connected Components - Isolated subgraphs ---
// Find isolated clusters that may need cross-functional bridges
CALL gds.wcc.stream('ontology-full')
YIELD nodeId, componentId
WITH componentId, collect(gds.util.asNode(nodeId)) AS nodes
RETURN
    componentId,
    size(nodes) AS component_size,
    [n IN nodes WHERE 'Function' IN labels(n) | n.name] AS functions,
    [n IN nodes WHERE 'JTBD' IN labels(n) | n.code][..5] AS sample_jtbds
ORDER BY component_size DESC;

// =============================================================================
// 4. SIMILARITY ANALYSIS
// Find similar nodes based on graph structure
// =============================================================================

// --- 4.1 Node Similarity - Similar roles by JTBD ---
// Find roles that share similar JTBDs
CALL gds.nodeSimilarity.stream('jtbd-role-network', {
    topK: 5,
    similarityCutoff: 0.3
})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS role1, gds.util.asNode(node2) AS role2, similarity
WHERE 'Role' IN labels(role1) AND 'Role' IN labels(role2)
RETURN
    role1.name AS role_1,
    role1.function_name AS function_1,
    role2.name AS role_2,
    role2.function_name AS function_2,
    similarity AS jaccard_similarity
ORDER BY similarity DESC
LIMIT 20;

// --- 4.2 K-Nearest Neighbors - Similar JTBDs ---
// Find JTBDs similar based on role assignments and value delivery
CALL gds.knn.stream('jtbd-role-network', {
    topK: 5,
    nodeProperties: ['importance_score', 'opportunity_score', 'automation_score'],
    similarityCutoff: 0.5
})
YIELD node1, node2, similarity
WITH gds.util.asNode(node1) AS jtbd1, gds.util.asNode(node2) AS jtbd2, similarity
WHERE 'JTBD' IN labels(jtbd1) AND 'JTBD' IN labels(jtbd2)
RETURN
    jtbd1.code AS jtbd_1,
    jtbd1.name AS name_1,
    jtbd2.code AS jtbd_2,
    jtbd2.name AS name_2,
    similarity
ORDER BY similarity DESC
LIMIT 15;

// =============================================================================
// 5. PATH ANALYSIS
// Analyze paths and distances in the ontology
// =============================================================================

// --- 5.1 Shortest Path - Value Delivery Chain ---
// Find shortest path from a function to value delivery
MATCH (start:Function {name: 'Medical Affairs'}), (end:ValueCategory {code: 'BETTER'})
CALL gds.shortestPath.dijkstra.stream('value-flow-network', {
    sourceNode: start,
    targetNode: end,
    relationshipWeightProperty: 'weight'
})
YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
RETURN
    [nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS path_nodes,
    totalCost AS total_weight,
    length(path) AS path_length;

// --- 5.2 All Shortest Paths - Cross-functional collaboration ---
// Find all shortest paths between two departments
MATCH (dept1:Department {name: 'Medical Information'}), (dept2:Department {name: 'Commercial Operations'})
CALL gds.allShortestPaths.stream('ontology-full', {
    sourceNode: dept1,
    targetNode: dept2
})
YIELD sourceNode, targetNode, distance, path
RETURN
    gds.util.asNode(sourceNode).name AS from_dept,
    gds.util.asNode(targetNode).name AS to_dept,
    distance,
    [n IN nodes(path) | labels(n)[0] + ': ' + n.name] AS path_nodes
LIMIT 5;

// =============================================================================
// 6. AI READINESS SCORING
// Custom algorithms for AI transformation analysis
// =============================================================================

// --- 6.1 AI Opportunity Score by Role ---
// Aggregate AI readiness from connected JTBDs to roles
MATCH (r:Role)-[rel:HAS_JTBD]->(j:JTBD)
WHERE j.automation_score IS NOT NULL
WITH r,
     avg(j.automation_score) AS avg_automation,
     avg(j.opportunity_score) AS avg_opportunity,
     count(j) AS jtbd_count
RETURN
    r.name AS role_name,
    r.function_name AS function_name,
    r.department_name AS department,
    round(avg_automation, 2) AS avg_automation_score,
    round(avg_opportunity, 2) AS avg_opportunity_score,
    jtbd_count,
    round(avg_automation * avg_opportunity / 100, 2) AS composite_ai_score
ORDER BY composite_ai_score DESC
LIMIT 20;

// --- 6.2 Value Impact Scoring ---
// Calculate total value impact per function
MATCH (f:Function)-[:BELONGS_TO*2..3]-(r:Role)-[:HAS_JTBD]->(j:JTBD)-[del:DELIVERS_VALUE]->(vc:ValueCategory)
WHERE del.relevance_score IS NOT NULL
WITH f, vc,
     sum(del.relevance_score * coalesce(j.opportunity_score, 1)) AS weighted_value
RETURN
    f.name AS function_name,
    vc.name AS value_category,
    round(weighted_value, 2) AS total_value_impact
ORDER BY function_name, total_value_impact DESC;

// =============================================================================
// 7. UTILITY QUERIES
// Maintenance and analysis utilities
// =============================================================================

// --- 7.1 Graph Statistics ---
// Get overview statistics for a projected graph
CALL gds.graph.list()
YIELD graphName, nodeCount, relationshipCount, density, creationTime
RETURN graphName, nodeCount, relationshipCount,
       round(density, 4) AS density, creationTime
ORDER BY creationTime DESC;

// --- 7.2 Node Label Distribution ---
// Count nodes by label in projection
MATCH (n)
RETURN labels(n)[0] AS node_type, count(*) AS count
ORDER BY count DESC;

// --- 7.3 Relationship Type Distribution ---
// Count relationships by type
MATCH ()-[r]->()
RETURN type(r) AS relationship_type, count(*) AS count
ORDER BY count DESC;

// --- 7.4 Drop Graph Projection ---
// Clean up graph projection when done
CALL gds.graph.drop('ontology-full', false) YIELD graphName;
CALL gds.graph.drop('jtbd-role-network', false) YIELD graphName;
CALL gds.graph.drop('value-flow-network', false) YIELD graphName;

// =============================================================================
// 8. MEDICAL AFFAIRS SPECIFIC QUERIES
// Focused analysis for Medical Affairs function
// =============================================================================

// --- 8.1 Medical Affairs Role Network ---
// Project only Medical Affairs roles and their JTBDs
CALL gds.graph.project.cypher(
    'medical-affairs-network',
    'MATCH (n) WHERE n:Role AND n.function_name = "Medical Affairs"
     OR n:JTBD AND EXISTS((n)<-[:HAS_JTBD]-(:Role {function_name: "Medical Affairs"}))
     RETURN id(n) AS id, labels(n) AS labels,
            coalesce(n.ai_readiness, 0) AS ai_readiness,
            coalesce(n.opportunity_score, 0) AS opportunity_score',
    'MATCH (r:Role {function_name: "Medical Affairs"})-[rel:HAS_JTBD]->(j:JTBD)
     RETURN id(r) AS source, id(j) AS target,
            coalesce(rel.relevance_score, 1.0) AS relevance_score'
);

// --- 8.2 MA Department Collaboration Analysis ---
// Find collaboration opportunities between MA departments
MATCH (d1:Department)-[:BELONGS_TO]->(:Function {name: 'Medical Affairs'})
MATCH (d2:Department)-[:BELONGS_TO]->(:Function {name: 'Medical Affairs'})
WHERE d1 <> d2
MATCH (d1)<-[:BELONGS_TO]-(r1:Role)-[:HAS_JTBD]->(j:JTBD)<-[:HAS_JTBD]-(r2:Role)-[:BELONGS_TO]->(d2)
WITH d1, d2, count(DISTINCT j) AS shared_jtbds, collect(DISTINCT j.code) AS jtbd_codes
WHERE shared_jtbds > 0
RETURN
    d1.name AS department_1,
    d2.name AS department_2,
    shared_jtbds,
    jtbd_codes[..5] AS sample_shared_jtbds
ORDER BY shared_jtbds DESC;

// --- 8.3 MA AI Transformation Priorities ---
// Rank MA roles by AI transformation potential
MATCH (r:Role)-[:BELONGS_TO]->(:Department)-[:BELONGS_TO]->(:Function {name: 'Medical Affairs'})
MATCH (r)-[rel:HAS_JTBD]->(j:JTBD)
WHERE j.opportunity_score IS NOT NULL AND j.automation_score IS NOT NULL
WITH r,
     count(j) AS total_jtbds,
     avg(j.opportunity_score) AS avg_opportunity,
     avg(j.automation_score) AS avg_automation,
     sum(CASE WHEN j.odi_tier IN ['extreme', 'high'] THEN 1 ELSE 0 END) AS high_opportunity_jtbds
RETURN
    r.name AS role_name,
    r.department_name AS department,
    total_jtbds,
    round(avg_opportunity, 2) AS avg_opportunity_score,
    round(avg_automation, 2) AS avg_automation_score,
    high_opportunity_jtbds,
    round((avg_opportunity * avg_automation * (1 + high_opportunity_jtbds/10.0)) / 100, 2) AS transformation_priority
ORDER BY transformation_priority DESC
LIMIT 15;
