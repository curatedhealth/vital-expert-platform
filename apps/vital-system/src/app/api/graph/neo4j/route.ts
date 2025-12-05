/**
 * Neo4j Graph Database API Route
 *
 * Connects to Neo4j Aura for native graph queries.
 * Supports Cypher queries and graph traversal operations.
 */

import { NextRequest, NextResponse } from "next/server";
import neo4j, { Driver, Session } from "neo4j-driver";
import type {
  GraphNode,
  GraphEdge,
  NodeType,
} from "../../../../features/ontology-explorer/types/graph.types";

const NEO4J_URI = process.env.NEO4J_URI || "";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "";
const NEO4J_DATABASE = process.env.NEO4J_DATABASE || "neo4j";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (!driver) {
    if (!NEO4J_URI || !NEO4J_PASSWORD) {
      throw new Error("Neo4j credentials not configured");
    }
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD), {
      maxConnectionLifetime: 3 * 60 * 1000, // 3 minutes
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 30 * 1000, // 30 seconds
    });
  }
  return driver;
}

interface Neo4jNode {
  identity: { low: number; high: number };
  labels: string[];
  properties: Record<string, unknown>;
}

interface Neo4jRelationship {
  identity: { low: number; high: number };
  type: string;
  start: { low: number; high: number };
  end: { low: number; high: number };
  properties: Record<string, unknown>;
}

function nodeTypeFromLabels(labels: string[]): NodeType {
  const labelMap: Record<string, NodeType> = {
    Function: "Function",
    Department: "Department",
    Role: "Role",
    JTBD: "JTBD",
    Agent: "Agent",
    ValueCategory: "ValueCategory",
    ValueDriver: "ValueDriver",
  };

  for (const label of labels) {
    if (labelMap[label]) {
      return labelMap[label];
    }
  }
  return "Agent"; // Default
}

function transformNeo4jNode(node: Neo4jNode): GraphNode {
  const nodeId =
    (node.properties.id as string) ||
    `neo4j-${node.identity.low}-${node.identity.high}`;
  const label =
    (node.properties.name as string) ||
    (node.properties.display_name as string) ||
    nodeId;

  return {
    id: nodeId,
    type: nodeTypeFromLabels(node.labels),
    label,
    properties: {
      ...node.properties,
      neo4j_labels: node.labels,
    },
  };
}

function transformNeo4jRelationship(
  rel: Neo4jRelationship,
  nodeIdMap: Map<string, string>
): GraphEdge | null {
  const startKey = `${rel.start.low}-${rel.start.high}`;
  const endKey = `${rel.end.low}-${rel.end.high}`;

  const sourceId = nodeIdMap.get(startKey);
  const targetId = nodeIdMap.get(endKey);

  if (!sourceId || !targetId) {
    return null;
  }

  return {
    id: `${sourceId}-${rel.type}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: rel.type,
    label: rel.type.replace(/_/g, " ").toLowerCase(),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const nodeTypes = searchParams.get("types")?.split(",") || [];
  const limit = parseInt(searchParams.get("limit") || "100");
  const nodeId = searchParams.get("nodeId");

  let session: Session | null = null;

  try {
    const neo4jDriver = getDriver();
    session = neo4jDriver.session({ database: NEO4J_DATABASE });

    // If a specific node ID is provided, get its neighbors
    if (nodeId) {
      const cypherQuery = `
        MATCH (n)-[r]-(m)
        WHERE n.id = $nodeId OR n.name = $nodeId
        RETURN n, r, m
        LIMIT $limit
      `;

      const result = await session.run(cypherQuery, { nodeId, limit });

      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];
      const nodeIdMap = new Map<string, string>();
      const seenNodes = new Set<string>();

      for (const record of result.records) {
        const n = record.get("n") as Neo4jNode;
        const m = record.get("m") as Neo4jNode;
        const r = record.get("r") as Neo4jRelationship;

        // Process source node
        const nKey = `${n.identity.low}-${n.identity.high}`;
        if (!seenNodes.has(nKey)) {
          const node = transformNeo4jNode(n);
          nodes.push(node);
          seenNodes.add(nKey);
          nodeIdMap.set(nKey, node.id);
        }

        // Process target node
        const mKey = `${m.identity.low}-${m.identity.high}`;
        if (!seenNodes.has(mKey)) {
          const node = transformNeo4jNode(m);
          nodes.push(node);
          seenNodes.add(mKey);
          nodeIdMap.set(mKey, node.id);
        }

        // Process relationship
        const edge = transformNeo4jRelationship(r, nodeIdMap);
        if (edge && !edges.some((e) => e.id === edge.id)) {
          edges.push(edge);
        }
      }

      return NextResponse.json({
        nodes,
        edges,
        metadata: {
          mode: "live",
          source: "neo4j",
          query: "neighbors",
          nodeId,
          totalNodes: nodes.length,
          totalEdges: edges.length,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Default: Get all nodes of specified types (or all types)
    let cypherQuery: string;
    const params: Record<string, unknown> = { limit };

    if (query) {
      // Custom Cypher query (read-only)
      cypherQuery = query;
    } else if (nodeTypes.length > 0) {
      // Filter by node types
      const labelFilter = nodeTypes.map((t) => `n:${t}`).join(" OR ");
      cypherQuery = `
        MATCH (n)
        WHERE ${labelFilter}
        OPTIONAL MATCH (n)-[r]-(m)
        RETURN n, r, m
        LIMIT $limit
      `;
    } else {
      // Get full graph
      cypherQuery = `
        MATCH (n)
        OPTIONAL MATCH (n)-[r]-(m)
        RETURN n, r, m
        LIMIT $limit
      `;
    }

    const result = await session.run(cypherQuery, params);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIdMap = new Map<string, string>();
    const seenNodes = new Set<string>();
    const seenEdges = new Set<string>();

    for (const record of result.records) {
      const n = record.get("n") as Neo4jNode | null;
      const m = record.get("m") as Neo4jNode | null;
      const r = record.get("r") as Neo4jRelationship | null;

      // Process source node
      if (n) {
        const nKey = `${n.identity.low}-${n.identity.high}`;
        if (!seenNodes.has(nKey)) {
          const node = transformNeo4jNode(n);
          nodes.push(node);
          seenNodes.add(nKey);
          nodeIdMap.set(nKey, node.id);
        }
      }

      // Process target node
      if (m) {
        const mKey = `${m.identity.low}-${m.identity.high}`;
        if (!seenNodes.has(mKey)) {
          const node = transformNeo4jNode(m);
          nodes.push(node);
          seenNodes.add(mKey);
          nodeIdMap.set(mKey, node.id);
        }
      }

      // Process relationship
      if (r) {
        const edge = transformNeo4jRelationship(r, nodeIdMap);
        if (edge && !seenEdges.has(edge.id)) {
          edges.push(edge);
          seenEdges.add(edge.id);
        }
      }
    }

    // Calculate stats
    const nodeTypeCounts: Record<string, number> = {};
    const edgeTypeCounts: Record<string, number> = {};

    nodes.forEach((n) => {
      nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
    });

    edges.forEach((e) => {
      edgeTypeCounts[e.type] = (edgeTypeCounts[e.type] || 0) + 1;
    });

    return NextResponse.json({
      nodes,
      edges,
      metadata: {
        mode: "live",
        source: "neo4j",
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: nodeTypeCounts,
        edgeTypes: edgeTypeCounts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Neo4j API error:", error);

    // Return empty result with error info (don't break the frontend)
    return NextResponse.json({
      nodes: [],
      edges: [],
      metadata: {
        mode: "error",
        source: "neo4j",
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    if (session) {
      await session.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let session: Session | null = null;

  try {
    const body = await request.json();
    const { cypher, params = {} } = body;

    if (!cypher) {
      return NextResponse.json({ error: "Cypher query required" }, { status: 400 });
    }

    // Security: Only allow read queries
    const upperCypher = cypher.toUpperCase();
    if (
      upperCypher.includes("CREATE") ||
      upperCypher.includes("DELETE") ||
      upperCypher.includes("SET") ||
      upperCypher.includes("MERGE") ||
      upperCypher.includes("REMOVE") ||
      upperCypher.includes("DROP")
    ) {
      return NextResponse.json(
        { error: "Only read queries are allowed" },
        { status: 403 }
      );
    }

    const neo4jDriver = getDriver();
    session = neo4jDriver.session({ database: NEO4J_DATABASE });

    const result = await session.run(cypher, params);

    const records = result.records.map((record) => {
      const obj: Record<string, unknown> = {};
      record.keys.forEach((key) => {
        const keyStr = String(key);
        obj[keyStr] = record.get(keyStr);
      });
      return obj;
    });

    return NextResponse.json({
      records,
      summary: {
        query: cypher,
        counters: result.summary.counters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Neo4j query error:", error);
    return NextResponse.json(
      { error: "Query execution failed", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.close();
    }
  }
}
