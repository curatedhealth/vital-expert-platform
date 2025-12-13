# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [neo4j]
"""
Knowledge Graph API Routes - Full Ontology Explorer Support

Provides endpoints for querying and visualizing:
- Enterprise Ontology (Functions → Departments → Roles → JTBDs → Value)
- Agent Network (Agents with collaboration/escalation relationships)
- Combined graph for interactive exploration

Integrates with Neo4j for graph storage and visualization.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
import structlog
import os

# Try to import Neo4j - graceful fallback if not available
try:
    from neo4j import AsyncGraphDatabase, AsyncDriver
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    AsyncGraphDatabase = None
    AsyncDriver = None

logger = structlog.get_logger()
router = APIRouter(tags=["Knowledge Graph"])

# ============================================================================
# Configuration
# ============================================================================

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+s://13067bdb.databases.neo4j.io")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

# Global driver instance
_driver: Optional[AsyncDriver] = None


async def get_neo4j_driver() -> Optional[AsyncDriver]:
    """Get or create Neo4j driver instance."""
    global _driver

    if not NEO4J_AVAILABLE:
        logger.warning("Neo4j package not installed - using mock mode")
        return None

    if not NEO4J_PASSWORD:
        logger.warning("NEO4J_PASSWORD not set - using mock mode")
        return None

    if _driver is None:
        try:
            _driver = AsyncGraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                max_connection_pool_size=50,
                connection_timeout=30
            )
            logger.info("Neo4j driver initialized", uri=NEO4J_URI)
        except Exception as e:
            logger.error("Failed to initialize Neo4j driver", error=str(e))
            return None

    return _driver


# ============================================================================
# Enums and Models
# ============================================================================

class NodeType(str, Enum):
    FUNCTION = "Function"
    DEPARTMENT = "Department"
    ROLE = "Role"
    JTBD = "JTBD"
    VALUE_CATEGORY = "ValueCategory"
    VALUE_DRIVER = "ValueDriver"
    AGENT = "Agent"
    PERSONA = "Persona"
    WORKFLOW = "Workflow"


class RelationshipType(str, Enum):
    HAS_DEPARTMENT = "HAS_DEPARTMENT"
    HAS_ROLE = "HAS_ROLE"
    PERFORMS = "PERFORMS"
    DELIVERS_VALUE = "DELIVERS_VALUE"
    DRIVES = "DRIVES"
    BELONGS_TO = "BELONGS_TO"
    ASSIGNED_TO = "ASSIGNED_TO"
    COLLABORATES_WITH = "COLLABORATES_WITH"
    ESCALATES_TO = "ESCALATES_TO"
    TRIGGERS = "TRIGGERS"


class LayoutType(str, Enum):
    FORCE = "force"
    HIERARCHICAL = "hierarchical"
    RADIAL = "radial"


class KGNode(BaseModel):
    """Knowledge graph node"""
    id: str
    type: str
    label: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    x: Optional[float] = None  # For layout positioning
    y: Optional[float] = None
    color: Optional[str] = None
    size: Optional[int] = None


class KGEdge(BaseModel):
    """Knowledge graph edge"""
    id: str
    source: str
    target: str
    type: str
    label: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)


class KGResponse(BaseModel):
    """Knowledge graph query response"""
    nodes: List[KGNode]
    edges: List[KGEdge]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class KGStatsResponse(BaseModel):
    """Knowledge graph statistics"""
    total_nodes: int
    total_edges: int
    node_types: Dict[str, int] = Field(default_factory=dict)
    edge_types: Dict[str, int] = Field(default_factory=dict)
    mode: str = "live"


class OntologyQueryRequest(BaseModel):
    """Request for ontology graph query"""
    node_types: Optional[List[NodeType]] = None
    function_filter: Optional[str] = None  # Filter by function name
    department_filter: Optional[str] = None
    max_depth: int = Field(default=3, ge=1, le=6)
    limit: int = Field(default=200, ge=1, le=1000)
    include_agents: bool = False
    layout: LayoutType = LayoutType.FORCE


class NLQueryRequest(BaseModel):
    """Natural language query request"""
    query: str
    max_results: int = Field(default=50, ge=1, le=200)


# ============================================================================
# Node Color and Size Configuration
# ============================================================================

NODE_STYLES = {
    "Function": {"color": "#8B5CF6", "size": 40},      # Purple
    "Department": {"color": "#3B82F6", "size": 32},    # Blue
    "Role": {"color": "#10B981", "size": 28},          # Green
    "JTBD": {"color": "#F59E0B", "size": 24},          # Orange
    "ValueCategory": {"color": "#06B6D4", "size": 28}, # Teal
    "ValueDriver": {"color": "#14B8A6", "size": 22},   # Teal lighter
    "Agent": {"color": "#EAB308", "size": 30},         # Gold
    "Persona": {"color": "#6B7280", "size": 22},       # Gray
    "Workflow": {"color": "#EC4899", "size": 26},      # Pink
}


def style_node(node_type: str, node_id: str, label: str, properties: dict) -> KGNode:
    """Apply styling to a node based on its type."""
    style = NODE_STYLES.get(node_type, {"color": "#9CA3AF", "size": 20})
    return KGNode(
        id=node_id,
        type=node_type,
        label=label,
        properties=properties,
        color=style["color"],
        size=style["size"]
    )


# ============================================================================
# Core Graph Endpoints
# ============================================================================

@router.get("/graph/health")
async def graph_health():
    """Health check for knowledge graph service."""
    driver = await get_neo4j_driver()

    if driver is None:
        return {
            "status": "degraded",
            "mode": "mock",
            "message": "Neo4j not available - using mock data",
            "timestamp": datetime.utcnow().isoformat()
        }

    try:
        async with driver.session(database="neo4j") as session:
            result = await session.run("RETURN 1 as test")
            record = await result.single()
            if record and record["test"] == 1:
                return {
                    "status": "healthy",
                    "mode": "live",
                    "uri": NEO4J_URI.split("@")[-1] if "@" in NEO4J_URI else NEO4J_URI,
                    "timestamp": datetime.utcnow().isoformat()
                }
    except Exception as e:
        logger.error("Neo4j health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "mode": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/graph/stats", response_model=KGStatsResponse)
async def get_graph_stats():
    """Get graph statistics (node counts, edge counts by type)."""
    driver = await get_neo4j_driver()

    if driver is None:
        # Return mock stats
        return KGStatsResponse(
            total_nodes=350,
            total_edges=1200,
            node_types={"Function": 15, "Department": 40, "Role": 120, "JTBD": 100, "Agent": 75},
            edge_types={"HAS_DEPARTMENT": 40, "HAS_ROLE": 120, "PERFORMS": 300, "COLLABORATES_WITH": 150},
            mode="mock"
        )

    try:
        async with driver.session(database="neo4j") as session:
            # Get node counts by type
            node_result = await session.run("""
                MATCH (n)
                RETURN labels(n)[0] as type, count(n) as count
                ORDER BY count DESC
            """)
            node_types = {}
            total_nodes = 0
            async for record in node_result:
                node_type = record["type"]
                count = record["count"]
                if node_type:
                    node_types[node_type] = count
                    total_nodes += count

            # Get edge counts by type
            edge_result = await session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as type, count(r) as count
                ORDER BY count DESC
            """)
            edge_types = {}
            total_edges = 0
            async for record in edge_result:
                edge_type = record["type"]
                count = record["count"]
                if edge_type:
                    edge_types[edge_type] = count
                    total_edges += count

            return KGStatsResponse(
                total_nodes=total_nodes,
                total_edges=total_edges,
                node_types=node_types,
                edge_types=edge_types,
                mode="live"
            )
    except Exception as e:
        logger.error("Failed to get graph stats", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get graph stats: {str(e)}")


@router.get("/graph/nodes", response_model=KGResponse)
async def get_all_nodes(
    node_types: Optional[str] = Query(None, description="Comma-separated node types to include"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Get all nodes with optional type filtering."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_ontology_data()

    try:
        async with driver.session(database="neo4j") as session:
            # Build type filter
            type_filter = ""
            if node_types:
                types = [t.strip() for t in node_types.split(",")]
                type_labels = " OR ".join([f"n:{t}" for t in types])
                type_filter = f"WHERE {type_labels}"

            query = f"""
                MATCH (n)
                {type_filter}
                RETURN n, labels(n)[0] as type
                SKIP $offset
                LIMIT $limit
            """

            result = await session.run(query, offset=offset, limit=limit)
            nodes = []
            async for record in result:
                node = record["n"]
                node_type = record["type"]
                node_props = dict(node)
                node_id = node_props.get("id", str(node.element_id))
                label = node_props.get("name", node_props.get("code", node_id))

                styled_node = style_node(node_type, str(node_id), label, node_props)
                nodes.append(styled_node)

            return KGResponse(
                nodes=nodes,
                edges=[],
                metadata={"mode": "live", "count": len(nodes), "offset": offset, "limit": limit}
            )
    except Exception as e:
        logger.error("Failed to get nodes", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/node/{node_id}", response_model=KGResponse)
async def get_node_with_neighbors(
    node_id: str,
    max_hops: int = Query(1, ge=1, le=3),
    limit: int = Query(50, ge=1, le=200)
):
    """Get a specific node with its neighbors up to max_hops away."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_neighbors(node_id)

    try:
        async with driver.session(database="neo4j") as session:
            # Build query with variable-length path (Neo4j 5+ requires literal depth)
            safe_depth = max(1, min(3, int(max_hops)))

            query = f"""
                MATCH (center {{id: $node_id}})
                OPTIONAL MATCH path = (center)-[r*1..{safe_depth}]-(neighbor)
                WITH center, collect(DISTINCT neighbor)[0..$limit] as neighbors,
                     collect(DISTINCT r) as all_rels
                RETURN center, neighbors,
                       [rel IN all_rels WHERE rel IS NOT NULL | rel] as relationships
            """

            result = await session.run(query, node_id=node_id, limit=limit)
            record = await result.single()

            if not record:
                raise HTTPException(status_code=404, detail=f"Node {node_id} not found")

            nodes = []
            edges = []
            seen_nodes = set()

            # Add center node
            center = record["center"]
            center_props = dict(center)
            center_type = list(center.labels)[0] if center.labels else "Unknown"
            center_id = center_props.get("id", str(center.element_id))
            center_label = center_props.get("name", center_props.get("code", center_id))

            nodes.append(style_node(center_type, str(center_id), center_label, center_props))
            seen_nodes.add(str(center_id))

            # Add neighbor nodes
            neighbors = record["neighbors"] or []
            for neighbor in neighbors:
                if neighbor is None:
                    continue
                neighbor_props = dict(neighbor)
                neighbor_type = list(neighbor.labels)[0] if neighbor.labels else "Unknown"
                neighbor_id = neighbor_props.get("id", str(neighbor.element_id))

                if str(neighbor_id) not in seen_nodes:
                    neighbor_label = neighbor_props.get("name", neighbor_props.get("code", neighbor_id))
                    nodes.append(style_node(neighbor_type, str(neighbor_id), neighbor_label, neighbor_props))
                    seen_nodes.add(str(neighbor_id))

            # Add edges
            relationships = record["relationships"] or []
            edge_idx = 0
            for rel_list in relationships:
                if isinstance(rel_list, list):
                    for rel in rel_list:
                        if rel is not None:
                            edges.append(KGEdge(
                                id=f"edge_{edge_idx}",
                                source=str(rel.start_node.element_id),
                                target=str(rel.end_node.element_id),
                                type=rel.type,
                                properties=dict(rel)
                            ))
                            edge_idx += 1

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={
                    "mode": "live",
                    "center_node": node_id,
                    "max_hops": max_hops,
                    "node_count": len(nodes),
                    "edge_count": len(edges)
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get node neighbors", error=str(e), node_id=node_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Ontology-Specific Endpoints
# ============================================================================

@router.post("/graph/ontology", response_model=KGResponse)
async def query_ontology_graph(request: OntologyQueryRequest):
    """
    Query the enterprise ontology graph with filtering options.

    Returns Functions → Departments → Roles → JTBDs → Value structure.
    Optionally includes agents assigned to roles.
    """
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_ontology_data()

    try:
        async with driver.session(database="neo4j") as session:
            # Build the query based on filters
            where_clauses = []
            params = {"limit": request.limit}

            if request.function_filter:
                where_clauses.append("f.name CONTAINS $function_filter")
                params["function_filter"] = request.function_filter

            if request.department_filter:
                where_clauses.append("d.name CONTAINS $department_filter")
                params["department_filter"] = request.department_filter

            where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            # Query ontology hierarchy
            query = f"""
                MATCH (f:Function)
                {where_clause}
                OPTIONAL MATCH (f)-[:HAS_DEPARTMENT]->(d:Department)
                OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
                OPTIONAL MATCH (r)-[:PERFORMS]->(j:JTBD)
                OPTIONAL MATCH (j)-[:DELIVERS_VALUE]->(vc:ValueCategory)

                WITH f, d, r, j, vc
                LIMIT $limit

                RETURN
                    collect(DISTINCT f) as functions,
                    collect(DISTINCT d) as departments,
                    collect(DISTINCT r) as roles,
                    collect(DISTINCT j) as jtbds,
                    collect(DISTINCT vc) as value_categories
            """

            result = await session.run(query, **params)
            record = await result.single()

            nodes = []
            edges = []
            seen_ids = set()

            # Process each node type
            for func in (record["functions"] or []):
                if func is None:
                    continue
                props = dict(func)
                node_id = props.get("id", str(func.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node("Function", str(node_id), props.get("name", ""), props))
                    seen_ids.add(node_id)

            for dept in (record["departments"] or []):
                if dept is None:
                    continue
                props = dict(dept)
                node_id = props.get("id", str(dept.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node("Department", str(node_id), props.get("name", ""), props))
                    seen_ids.add(node_id)
                    # Add edge to function
                    if props.get("function_id"):
                        edges.append(KGEdge(
                            id=f"edge_dept_{node_id}",
                            source=str(props["function_id"]),
                            target=str(node_id),
                            type="HAS_DEPARTMENT"
                        ))

            for role in (record["roles"] or []):
                if role is None:
                    continue
                props = dict(role)
                node_id = props.get("id", str(role.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node("Role", str(node_id), props.get("name", ""), props))
                    seen_ids.add(node_id)
                    if props.get("department_id"):
                        edges.append(KGEdge(
                            id=f"edge_role_{node_id}",
                            source=str(props["department_id"]),
                            target=str(node_id),
                            type="HAS_ROLE"
                        ))

            for jtbd in (record["jtbds"] or []):
                if jtbd is None:
                    continue
                props = dict(jtbd)
                node_id = props.get("id", str(jtbd.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node("JTBD", str(node_id), props.get("name", props.get("code", "")), props))
                    seen_ids.add(node_id)

            for vc in (record["value_categories"] or []):
                if vc is None:
                    continue
                props = dict(vc)
                node_id = props.get("id", str(vc.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node("ValueCategory", str(node_id), props.get("name", ""), props))
                    seen_ids.add(node_id)

            # If agents requested, fetch them
            if request.include_agents:
                agent_result = await session.run("""
                    MATCH (a:Agent)
                    WHERE a.status = 'active'
                    RETURN a
                    LIMIT 50
                """)
                async for agent_record in agent_result:
                    agent = agent_record["a"]
                    props = dict(agent)
                    node_id = props.get("id", str(agent.element_id))
                    if node_id not in seen_ids:
                        nodes.append(style_node("Agent", str(node_id), props.get("name", ""), props))
                        seen_ids.add(node_id)

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={
                    "mode": "live",
                    "filters": {
                        "function": request.function_filter,
                        "department": request.department_filter,
                        "include_agents": request.include_agents
                    },
                    "layout": request.layout,
                    "node_count": len(nodes),
                    "edge_count": len(edges)
                }
            )
    except Exception as e:
        logger.error("Failed to query ontology", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/ontology/functions", response_model=KGResponse)
async def get_functions_with_departments():
    """Get all functions with their departments."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_ontology_data()

    try:
        async with driver.session(database="neo4j") as session:
            result = await session.run("""
                MATCH (f:Function)
                OPTIONAL MATCH (f)-[r:HAS_DEPARTMENT]->(d:Department)
                RETURN f, collect(d) as departments, collect(r) as rels
            """)

            nodes = []
            edges = []
            seen_ids = set()
            edge_idx = 0

            async for record in result:
                func = record["f"]
                func_props = dict(func)
                func_id = func_props.get("id", str(func.element_id))

                if func_id not in seen_ids:
                    nodes.append(style_node("Function", str(func_id), func_props.get("name", ""), func_props))
                    seen_ids.add(func_id)

                for dept in record["departments"]:
                    if dept is None:
                        continue
                    dept_props = dict(dept)
                    dept_id = dept_props.get("id", str(dept.element_id))

                    if dept_id not in seen_ids:
                        nodes.append(style_node("Department", str(dept_id), dept_props.get("name", ""), dept_props))
                        seen_ids.add(dept_id)

                    edges.append(KGEdge(
                        id=f"edge_{edge_idx}",
                        source=str(func_id),
                        target=str(dept_id),
                        type="HAS_DEPARTMENT"
                    ))
                    edge_idx += 1

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={"mode": "live", "scope": "functions_departments"}
            )
    except Exception as e:
        logger.error("Failed to get functions", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/ontology/medical-affairs", response_model=KGResponse)
async def get_medical_affairs_subgraph(
    include_jtbds: bool = Query(True),
    include_value: bool = Query(False),
    limit: int = Query(100, ge=1, le=500)
):
    """Get Medical Affairs function subgraph - common use case."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_ontology_data()

    try:
        async with driver.session(database="neo4j") as session:
            # Build optional matches
            jtbd_match = "OPTIONAL MATCH (r)-[:PERFORMS]->(j:JTBD)" if include_jtbds else ""
            value_match = "OPTIONAL MATCH (j)-[:DELIVERS_VALUE]->(vc:ValueCategory)" if include_value and include_jtbds else ""

            jtbd_collect = ", collect(DISTINCT j) as jtbds" if include_jtbds else ""
            value_collect = ", collect(DISTINCT vc) as value_categories" if include_value and include_jtbds else ""

            query = f"""
                MATCH (f:Function {{name: 'Medical Affairs'}})
                OPTIONAL MATCH (f)-[:HAS_DEPARTMENT]->(d:Department)
                OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
                {jtbd_match}
                {value_match}

                RETURN f,
                       collect(DISTINCT d) as departments,
                       collect(DISTINCT r) as roles
                       {jtbd_collect}
                       {value_collect}
            """

            result = await session.run(query)
            record = await result.single()

            if not record:
                raise HTTPException(status_code=404, detail="Medical Affairs function not found")

            nodes = []
            edges = []
            seen_ids = set()
            edge_idx = 0

            # Add function
            func = record["f"]
            func_props = dict(func)
            func_id = func_props.get("id", str(func.element_id))
            nodes.append(style_node("Function", str(func_id), func_props.get("name", ""), func_props))
            seen_ids.add(func_id)

            # Add departments
            for dept in (record["departments"] or []):
                if dept is None:
                    continue
                dept_props = dict(dept)
                dept_id = dept_props.get("id", str(dept.element_id))
                if dept_id not in seen_ids:
                    nodes.append(style_node("Department", str(dept_id), dept_props.get("name", ""), dept_props))
                    seen_ids.add(dept_id)
                    edges.append(KGEdge(
                        id=f"edge_{edge_idx}", source=str(func_id), target=str(dept_id), type="HAS_DEPARTMENT"
                    ))
                    edge_idx += 1

            # Add roles
            for role in (record["roles"] or []):
                if role is None:
                    continue
                role_props = dict(role)
                role_id = role_props.get("id", str(role.element_id))
                if role_id not in seen_ids:
                    nodes.append(style_node("Role", str(role_id), role_props.get("name", ""), role_props))
                    seen_ids.add(role_id)
                    if role_props.get("department_id") in seen_ids:
                        edges.append(KGEdge(
                            id=f"edge_{edge_idx}", source=str(role_props["department_id"]), target=str(role_id), type="HAS_ROLE"
                        ))
                        edge_idx += 1

            # Add JTBDs if included
            if include_jtbds and "jtbds" in record.keys():
                for jtbd in (record["jtbds"] or [])[:limit]:
                    if jtbd is None:
                        continue
                    jtbd_props = dict(jtbd)
                    jtbd_id = jtbd_props.get("id", str(jtbd.element_id))
                    if jtbd_id not in seen_ids:
                        nodes.append(style_node("JTBD", str(jtbd_id), jtbd_props.get("name", jtbd_props.get("code", "")), jtbd_props))
                        seen_ids.add(jtbd_id)

            # Add value categories if included
            if include_value and "value_categories" in record.keys():
                for vc in (record["value_categories"] or []):
                    if vc is None:
                        continue
                    vc_props = dict(vc)
                    vc_id = vc_props.get("id", str(vc.element_id))
                    if vc_id not in seen_ids:
                        nodes.append(style_node("ValueCategory", str(vc_id), vc_props.get("name", ""), vc_props))
                        seen_ids.add(vc_id)

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={
                    "mode": "live",
                    "function": "Medical Affairs",
                    "include_jtbds": include_jtbds,
                    "include_value": include_value
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get Medical Affairs subgraph", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Agent Network Endpoints
# ============================================================================

@router.get("/graph/agents", response_model=KGResponse)
async def get_agent_network(
    include_relationships: bool = Query(True),
    agent_level: Optional[int] = Query(
        None,
        ge=1,
        le=5,
        alias="tier_filter",
        description="Filter by agent level (alias: tier_filter, deprecated)"
    ),
    limit: int = Query(100, ge=1, le=500)
):
    """Get agent network with collaboration and escalation relationships."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_agent_data()

    try:
        async with driver.session(database="neo4j") as session:
            tier_where = f"WHERE a.tier = {agent_level}" if agent_level else ""

            query = f"""
                MATCH (a:Agent)
                {tier_where}
                RETURN a
                LIMIT $limit
            """

            result = await session.run(query, limit=limit)

            nodes = []
            seen_ids = set()

            async for record in result:
                agent = record["a"]
                props = dict(agent)
                agent_id = props.get("id", str(agent.element_id))
                if agent_id not in seen_ids:
                    nodes.append(style_node("Agent", str(agent_id), props.get("name", ""), props))
                    seen_ids.add(agent_id)

            edges = []
            if include_relationships and len(nodes) > 0:
                agent_ids = list(seen_ids)
                rel_result = await session.run("""
                    MATCH (a1:Agent)-[r:COLLABORATES_WITH|ESCALATES_TO]->(a2:Agent)
                    WHERE a1.id IN $agent_ids AND a2.id IN $agent_ids
                    RETURN a1.id as source, a2.id as target, type(r) as rel_type, r as rel
                """, agent_ids=agent_ids)

                edge_idx = 0
                async for rel_record in rel_result:
                    edges.append(KGEdge(
                        id=f"edge_{edge_idx}",
                        source=str(rel_record["source"]),
                        target=str(rel_record["target"]),
                        type=rel_record["rel_type"],
                        properties=dict(rel_record["rel"]) if rel_record["rel"] else {}
                    ))
                    edge_idx += 1

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={
                    "mode": "live",
                    "scope": "agent_network",
                    "agent_level": agent_level,
                    "include_relationships": include_relationships
                }
            )
    except Exception as e:
        logger.error("Failed to get agent network", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/agents/{agent_id}/network", response_model=KGResponse)
async def get_agent_ego_network(
    agent_id: str,
    max_hops: int = Query(2, ge=1, le=3)
):
    """Get ego network for a specific agent."""
    driver = await get_neo4j_driver()

    if driver is None:
        return _generate_mock_neighbors(agent_id)

    try:
        safe_depth = max(1, min(3, int(max_hops)))

        async with driver.session(database="neo4j") as session:
            query = f"""
                MATCH (center:Agent {{id: $agent_id}})
                OPTIONAL MATCH path = (center)-[r:COLLABORATES_WITH|ESCALATES_TO|ASSIGNED_TO*1..{safe_depth}]-(connected)
                WITH center, collect(DISTINCT connected) as connected_nodes,
                     [rel in collect(DISTINCT r) WHERE rel IS NOT NULL | rel] as all_rels
                RETURN center, connected_nodes, all_rels
            """

            result = await session.run(query, agent_id=agent_id)
            record = await result.single()

            if not record or record["center"] is None:
                raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")

            nodes = []
            edges = []
            seen_ids = set()

            # Add center agent
            center = record["center"]
            center_props = dict(center)
            center_id = center_props.get("id", str(center.element_id))
            nodes.append(style_node("Agent", str(center_id), center_props.get("name", ""), center_props))
            seen_ids.add(center_id)

            # Add connected nodes
            for node in (record["connected_nodes"] or []):
                if node is None:
                    continue
                node_props = dict(node)
                node_type = list(node.labels)[0] if node.labels else "Unknown"
                node_id = node_props.get("id", str(node.element_id))
                if node_id not in seen_ids:
                    nodes.append(style_node(node_type, str(node_id), node_props.get("name", ""), node_props))
                    seen_ids.add(node_id)

            return KGResponse(
                nodes=nodes,
                edges=edges,
                metadata={
                    "mode": "live",
                    "center_agent": agent_id,
                    "max_hops": max_hops
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get agent ego network", error=str(e), agent_id=agent_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Search and Query Endpoints
# ============================================================================

@router.get("/graph/search")
async def search_graph(
    q: str = Query(..., min_length=2, description="Search query"),
    node_types: Optional[str] = Query(None, description="Comma-separated node types"),
    limit: int = Query(20, ge=1, le=100)
):
    """Search across all nodes by name, code, or description."""
    driver = await get_neo4j_driver()

    if driver is None:
        # Return mock search results
        return {
            "results": [
                {"id": "1", "type": "Role", "name": f"Mock result for '{q}'", "score": 0.9},
                {"id": "2", "type": "JTBD", "name": f"Another result for '{q}'", "score": 0.7}
            ],
            "mode": "mock"
        }

    try:
        async with driver.session(database="neo4j") as session:
            # Build type filter
            type_filter = ""
            if node_types:
                types = [t.strip() for t in node_types.split(",")]
                type_conditions = " OR ".join([f"'{t}' IN labels(n)" for t in types])
                type_filter = f"AND ({type_conditions})"

            query = f"""
                MATCH (n)
                WHERE (toLower(n.name) CONTAINS toLower($query)
                       OR toLower(n.code) CONTAINS toLower($query)
                       OR toLower(coalesce(n.description, '')) CONTAINS toLower($query))
                {type_filter}
                RETURN n, labels(n)[0] as type,
                       CASE
                           WHEN toLower(n.name) STARTS WITH toLower($query) THEN 1.0
                           WHEN toLower(n.name) CONTAINS toLower($query) THEN 0.8
                           ELSE 0.5
                       END as score
                ORDER BY score DESC
                LIMIT $limit
            """

            result = await session.run(query, query=q, limit=limit)

            results = []
            async for record in result:
                node = record["n"]
                node_props = dict(node)
                results.append({
                    "id": node_props.get("id", str(node.element_id)),
                    "type": record["type"],
                    "name": node_props.get("name", node_props.get("code", "")),
                    "description": node_props.get("description", ""),
                    "score": record["score"]
                })

            return {"results": results, "mode": "live", "query": q}
    except Exception as e:
        logger.error("Search failed", error=str(e), query=q)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/graph/cypher")
async def execute_cypher_query(
    query: str = Query(..., description="Cypher query to execute"),
    read_only: bool = Query(True, description="If true, only read queries allowed")
):
    """
    Execute a raw Cypher query (admin endpoint).

    Use with caution. Only read queries are allowed by default.
    """
    driver = await get_neo4j_driver()

    if driver is None:
        raise HTTPException(status_code=503, detail="Neo4j not available")

    # Basic safety check for read_only mode
    if read_only:
        dangerous_keywords = ["CREATE", "DELETE", "SET", "REMOVE", "MERGE", "DROP", "DETACH"]
        query_upper = query.upper()
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                raise HTTPException(
                    status_code=400,
                    detail=f"Write operation '{keyword}' not allowed in read-only mode"
                )

    try:
        async with driver.session(database="neo4j") as session:
            result = await session.run(query)
            records = []
            async for record in result:
                records.append(dict(record))

            return {
                "success": True,
                "records": records,
                "count": len(records)
            }
    except Exception as e:
        logger.error("Cypher query failed", error=str(e), query=query)
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# Mock Data Generators (Fallback when Neo4j unavailable)
# ============================================================================

def _generate_mock_ontology_data() -> KGResponse:
    """Generate mock ontology data for testing."""
    nodes = [
        style_node("Function", "f1", "Medical Affairs", {"description": "Medical Affairs function"}),
        style_node("Function", "f2", "R&D", {"description": "Research and Development"}),
        style_node("Department", "d1", "Medical Information", {"function_id": "f1"}),
        style_node("Department", "d2", "Medical Communications", {"function_id": "f1"}),
        style_node("Department", "d3", "Clinical Development", {"function_id": "f2"}),
        style_node("Role", "r1", "Medical Science Liaison", {"department_id": "d1"}),
        style_node("Role", "r2", "Medical Writer", {"department_id": "d2"}),
        style_node("JTBD", "j1", "Respond to HCP inquiries", {"code": "MA-01"}),
        style_node("JTBD", "j2", "Develop scientific content", {"code": "MA-02"}),
        style_node("ValueCategory", "vc1", "SMARTER", {"color": "#3B82F6"}),
        style_node("ValueCategory", "vc2", "FASTER", {"color": "#10B981"}),
    ]

    edges = [
        KGEdge(id="e1", source="f1", target="d1", type="HAS_DEPARTMENT"),
        KGEdge(id="e2", source="f1", target="d2", type="HAS_DEPARTMENT"),
        KGEdge(id="e3", source="f2", target="d3", type="HAS_DEPARTMENT"),
        KGEdge(id="e4", source="d1", target="r1", type="HAS_ROLE"),
        KGEdge(id="e5", source="d2", target="r2", type="HAS_ROLE"),
        KGEdge(id="e6", source="r1", target="j1", type="PERFORMS"),
        KGEdge(id="e7", source="r2", target="j2", type="PERFORMS"),
        KGEdge(id="e8", source="j1", target="vc1", type="DELIVERS_VALUE"),
        KGEdge(id="e9", source="j2", target="vc2", type="DELIVERS_VALUE"),
    ]

    return KGResponse(
        nodes=nodes,
        edges=edges,
        metadata={"mode": "mock", "message": "Neo4j unavailable - using mock data"}
    )


def _generate_mock_agent_data() -> KGResponse:
    """Generate mock agent network data."""
    nodes = [
        style_node("Agent", "a1", "Regulatory Expert", {"agent_level": 3, "status": "active"}),
        style_node("Agent", "a2", "Clinical Trials Advisor", {"agent_level": 2, "status": "active"}),
        style_node("Agent", "a3", "Medical Writer Agent", {"agent_level": 2, "status": "active"}),
        style_node("Agent", "a4", "Query Router", {"agent_level": 1, "status": "active"}),
    ]

    edges = [
        KGEdge(id="ae1", source="a4", target="a1", type="ESCALATES_TO"),
        KGEdge(id="ae2", source="a4", target="a2", type="ESCALATES_TO"),
        KGEdge(id="ae3", source="a1", target="a2", type="COLLABORATES_WITH"),
        KGEdge(id="ae4", source="a2", target="a3", type="COLLABORATES_WITH"),
    ]

    return KGResponse(
        nodes=nodes,
        edges=edges,
        metadata={"mode": "mock"}
    )


def _generate_mock_neighbors(node_id: str) -> KGResponse:
    """Generate mock neighbor data for a node."""
    nodes = [
        style_node("Role", node_id, f"Node {node_id}", {}),
        style_node("JTBD", f"{node_id}_j1", "Related JTBD 1", {}),
        style_node("JTBD", f"{node_id}_j2", "Related JTBD 2", {}),
        style_node("Department", f"{node_id}_d1", "Parent Department", {}),
    ]

    edges = [
        KGEdge(id="ne1", source=node_id, target=f"{node_id}_j1", type="PERFORMS"),
        KGEdge(id="ne2", source=node_id, target=f"{node_id}_j2", type="PERFORMS"),
        KGEdge(id="ne3", source=f"{node_id}_d1", target=node_id, type="HAS_ROLE"),
    ]

    return KGResponse(
        nodes=nodes,
        edges=edges,
        metadata={"mode": "mock", "center_node": node_id}
    )


# ============================================================================
# Legacy Endpoints (Backward Compatibility)
# ============================================================================

@router.post("/agents/{agent_id}/knowledge-graph/query", response_model=KGResponse)
async def query_agent_knowledge_graph(agent_id: UUID):
    """Legacy endpoint - redirects to agent ego network."""
    return await get_agent_ego_network(str(agent_id))


@router.get("/agents/{agent_id}/knowledge-graph/stats", response_model=KGStatsResponse)
async def get_agent_graph_stats(agent_id: UUID):
    """Legacy endpoint - returns overall graph stats."""
    return await get_graph_stats()


@router.get("/agents/{agent_id}/knowledge-graph/neighbors", response_model=KGResponse)
async def get_agent_neighbors(
    agent_id: UUID,
    node_id: str = Query(...),
    max_hops: int = Query(1, ge=1, le=3)
):
    """Legacy endpoint - get neighbors of a node."""
    return await get_node_with_neighbors(node_id, max_hops)


@router.get("/knowledge-graph/health")
async def legacy_health():
    """Legacy health endpoint."""
    return await graph_health()
