/**
 * Pinecone Semantic Search API Route
 *
 * Provides vector-based semantic search for the knowledge graph.
 * Uses OpenAI embeddings + Pinecone for similarity search.
 */

import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import type {
  GraphNode,
  NodeType,
} from "../../../../features/ontology-explorer/types/graph.types";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "vital-knowledge";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Embedding model configuration
const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIMENSION = 3072;

let pinecone: Pinecone | null = null;
let openai: OpenAI | null = null;

function getPinecone(): Pinecone {
  if (!pinecone) {
    if (!PINECONE_API_KEY) {
      throw new Error("Pinecone API key not configured");
    }
    pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
  }
  return pinecone;
}

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openai;
}

async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSION,
  });

  return response.data[0].embedding;
}

interface PineconeMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

function inferNodeType(metadata: Record<string, unknown>): NodeType {
  // Try to infer from metadata fields
  if (metadata.node_type) {
    return metadata.node_type as NodeType;
  }
  if (metadata.type) {
    return metadata.type as NodeType;
  }
  if (metadata.entity_type) {
    const entityType = metadata.entity_type as string;
    const typeMap: Record<string, NodeType> = {
      function: "Function",
      department: "Department",
      role: "Role",
      jtbd: "JTBD",
      job: "JTBD",
      agent: "Agent",
      value_category: "ValueCategory",
      value_driver: "ValueDriver",
    };
    return typeMap[entityType.toLowerCase()] || "Agent";
  }

  // Infer from ID prefix or content
  const id = metadata.id as string | undefined;
  if (id) {
    if (id.startsWith("agent-") || id.includes("agent")) return "Agent";
    if (id.startsWith("jtbd-") || id.includes("jtbd")) return "JTBD";
    if (id.startsWith("role-") || id.includes("role")) return "Role";
    if (id.startsWith("dept-") || id.includes("department")) return "Department";
    if (id.startsWith("func-") || id.includes("function")) return "Function";
  }

  return "Agent"; // Default fallback
}

function transformPineconeMatch(match: PineconeMatch): GraphNode {
  const metadata = match.metadata || {};

  return {
    id: match.id,
    type: inferNodeType(metadata),
    label:
      (metadata.name as string) ||
      (metadata.title as string) ||
      (metadata.display_name as string) ||
      match.id,
    properties: {
      ...metadata,
      similarity_score: match.score,
      source: "pinecone",
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || searchParams.get("query");
  const topK = parseInt(searchParams.get("topK") || searchParams.get("limit") || "20");
  const minScore = parseFloat(searchParams.get("minScore") || "0.5");
  const nodeTypes = searchParams.get("types")?.split(",") || [];
  const namespace = searchParams.get("namespace") || "";

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  try {
    // Create embedding for the query
    const embedding = await createEmbedding(query);

    // Query Pinecone
    const pc = getPinecone();
    const index = pc.index(PINECONE_INDEX_NAME);

    // Build filter if node types specified
    let filter: Record<string, unknown> | undefined;
    if (nodeTypes.length > 0) {
      filter = {
        $or: nodeTypes.map((type) => ({
          node_type: { $eq: type },
        })),
      };
    }

    const queryOptions: {
      vector: number[];
      topK: number;
      includeMetadata: boolean;
      filter?: Record<string, unknown>;
    } = {
      vector: embedding,
      topK,
      includeMetadata: true,
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    // Use namespace if provided
    const targetIndex = namespace ? index.namespace(namespace) : index;
    const results = await targetIndex.query(queryOptions);

    // Filter by minimum score and transform results
    const matches = (results.matches || []).filter((match) => match.score >= minScore);

    const nodes: GraphNode[] = matches.map((match) =>
      transformPineconeMatch({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as Record<string, unknown>,
      })
    );

    // Group by node type for stats
    const nodeTypeCounts: Record<string, number> = {};
    nodes.forEach((n) => {
      nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
    });

    return NextResponse.json({
      nodes,
      edges: [], // Semantic search returns nodes only; edges come from graph sources
      metadata: {
        mode: "semantic",
        source: "pinecone",
        query,
        totalResults: nodes.length,
        topK,
        minScore,
        nodeTypes: nodeTypeCounts,
        embeddingModel: EMBEDDING_MODEL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Pinecone search error:", error);

    // Return empty result with error info
    return NextResponse.json({
      nodes: [],
      edges: [],
      metadata: {
        mode: "error",
        source: "pinecone",
        query,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      topK = 20,
      minScore = 0.5,
      nodeTypes = [],
      namespace = "",
      includeVectors = false,
    } = body;

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // Create embedding
    const embedding = await createEmbedding(query);

    // Query Pinecone
    const pc = getPinecone();
    const index = pc.index(PINECONE_INDEX_NAME);

    // Build filter
    let filter: Record<string, unknown> | undefined;
    if (nodeTypes.length > 0) {
      filter = {
        $or: nodeTypes.map((type: string) => ({
          node_type: { $eq: type },
        })),
      };
    }

    const queryOptions: {
      vector: number[];
      topK: number;
      includeMetadata: boolean;
      includeValues: boolean;
      filter?: Record<string, unknown>;
    } = {
      vector: embedding,
      topK,
      includeMetadata: true,
      includeValues: includeVectors,
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const targetIndex = namespace ? index.namespace(namespace) : index;
    const results = await targetIndex.query(queryOptions);

    // Filter and transform
    const matches = (results.matches || []).filter((match) => match.score >= minScore);

    const nodes: GraphNode[] = matches.map((match) =>
      transformPineconeMatch({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as Record<string, unknown>,
      })
    );

    // Include raw results for advanced use cases
    const rawResults = matches.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      values: includeVectors ? match.values : undefined,
    }));

    return NextResponse.json({
      nodes,
      edges: [],
      rawResults,
      queryEmbedding: includeVectors ? embedding : undefined,
      metadata: {
        mode: "semantic",
        source: "pinecone",
        query,
        totalResults: nodes.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Pinecone POST error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
