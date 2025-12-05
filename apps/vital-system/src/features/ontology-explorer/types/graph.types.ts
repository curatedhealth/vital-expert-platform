/**
 * Types for the Ontology Explorer Graph Visualization
 */

// Node types matching the Neo4j ontology
export type NodeType =
  | "Function"
  | "Department"
  | "Role"
  | "JTBD"
  | "ValueCategory"
  | "ValueDriver"
  | "Agent"
  | "Persona"
  | "Workflow";

// Relationship types in the graph
export type RelationshipType =
  | "HAS_DEPARTMENT"
  | "HAS_ROLE"
  | "PERFORMS"
  | "DELIVERS_VALUE"
  | "DRIVES"
  | "BELONGS_TO"
  | "ASSIGNED_TO"
  | "COLLABORATES_WITH"
  | "ESCALATES_TO"
  | "TRIGGERS";

// Layout options for graph visualization
export type LayoutType = "force" | "hierarchical" | "radial";

// Graph node from API
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}

// Graph edge from API
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType | string;
  label?: string;
  properties?: Record<string, unknown>;
}

// API response for graph queries
export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    mode: "live" | "mock" | "error" | "semantic";
    source?: "supabase" | "neo4j" | "pinecone" | "mock" | "combined";
    error?: string;
    [key: string]: unknown;
  };
}

// Graph statistics
export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  node_types: Record<string, number>;
  edge_types: Record<string, number>;
  mode: "live" | "mock";
}

// Query request for ontology
export interface OntologyQueryRequest {
  node_types?: NodeType[];
  function_filter?: string;
  department_filter?: string;
  max_depth?: number;
  limit?: number;
  include_agents?: boolean;
  layout?: LayoutType;
}

// Search result item
export interface SearchResult {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  score: number;
}

// Node type configuration for visualization
export interface NodeTypeConfig {
  color: string;
  size: number;
  icon?: string;
  label: string;
}

// Default node type configurations
export const NODE_TYPE_CONFIG: Record<NodeType, NodeTypeConfig> = {
  Function: { color: "#8B5CF6", size: 40, label: "Function" },
  Department: { color: "#3B82F6", size: 32, label: "Department" },
  Role: { color: "#10B981", size: 28, label: "Role" },
  JTBD: { color: "#F59E0B", size: 24, label: "Job-to-be-Done" },
  ValueCategory: { color: "#06B6D4", size: 28, label: "Value Category" },
  ValueDriver: { color: "#14B8A6", size: 22, label: "Value Driver" },
  Agent: { color: "#EAB308", size: 30, label: "AI Agent" },
  Persona: { color: "#6B7280", size: 22, label: "Persona" },
  Workflow: { color: "#EC4899", size: 26, label: "Workflow" },
};

// Node filter state
export interface NodeFilter {
  type: NodeType;
  enabled: boolean;
}

// Graph interaction mode
export type InteractionMode = "pan" | "select" | "zoom";

// Selection state
export interface SelectionState {
  selectedNodeIds: string[];
  highlightedNodeIds: string[];
  hoveredNodeId: string | null;
}

// Chat message for AI companion
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  graphAction?: {
    type: "highlight" | "filter" | "focus" | "query";
    nodeIds?: string[];
    query?: string;
  };
}

// Graph view state for serialization
export interface GraphViewState {
  zoom: number;
  panX: number;
  panY: number;
  layout: LayoutType;
  filters: NodeFilter[];
}
