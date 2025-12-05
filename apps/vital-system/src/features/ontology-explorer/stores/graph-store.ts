/**
 * Zustand store for Ontology Explorer graph state
 *
 * Integrates three data sources:
 * - Supabase (relational ontology data via /api/graph)
 * - Neo4j (native graph queries via /api/graph/neo4j)
 * - Pinecone (semantic search via /api/graph/search)
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  GraphNode,
  GraphEdge,
  GraphResponse,
  LayoutType,
  NodeFilter,
  NodeType,
  ChatMessage,
  SelectionState,
  InteractionMode,
  OntologyQueryRequest,
} from "../types/graph.types";

// API base URLs for all data sources
const SUPABASE_API = "/api/graph"; // Primary: Supabase via Next.js API
const NEO4J_API = "/api/graph/neo4j"; // Graph queries via Neo4j
const PINECONE_API = "/api/graph/search"; // Semantic search via Pinecone
const AI_ENGINE_BASE = process.env.NEXT_PUBLIC_AI_ENGINE_URL || "http://localhost:8000";

// Data source type for tracking where data came from
type DataSource = "supabase" | "neo4j" | "pinecone" | "mock" | "combined";

// Mock data for development when backend is unavailable
function generateMockData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Functions
  const functions = [
    { id: "func_1", name: "Medical Affairs", color: "#8B5CF6" },
    { id: "func_2", name: "Clinical Operations", color: "#8B5CF6" },
    { id: "func_3", name: "Regulatory Affairs", color: "#8B5CF6" },
    { id: "func_4", name: "Commercial", color: "#8B5CF6" },
  ];

  functions.forEach((f) => {
    nodes.push({
      id: f.id,
      type: "Function",
      label: f.name,
      properties: { code: f.id.toUpperCase() },
      color: f.color,
      size: 40,
    });
  });

  // Departments per function
  const departments = [
    { id: "dept_1", name: "Scientific Communications", functionId: "func_1" },
    { id: "dept_2", name: "Medical Information", functionId: "func_1" },
    { id: "dept_3", name: "Field Medical", functionId: "func_1" },
    { id: "dept_4", name: "Clinical Trial Management", functionId: "func_2" },
    { id: "dept_5", name: "Regulatory Submissions", functionId: "func_3" },
    { id: "dept_6", name: "Marketing", functionId: "func_4" },
  ];

  departments.forEach((d) => {
    nodes.push({
      id: d.id,
      type: "Department",
      label: d.name,
      properties: { function_id: d.functionId },
      color: "#3B82F6",
      size: 32,
    });
    edges.push({
      id: `edge_${d.functionId}_${d.id}`,
      source: d.functionId,
      target: d.id,
      type: "HAS_DEPARTMENT",
      properties: {},
    });
  });

  // Roles
  const roles = [
    { id: "role_1", name: "Medical Science Liaison", deptId: "dept_3" },
    { id: "role_2", name: "Scientific Communications Manager", deptId: "dept_1" },
    { id: "role_3", name: "Medical Information Specialist", deptId: "dept_2" },
    { id: "role_4", name: "Clinical Trial Manager", deptId: "dept_4" },
    { id: "role_5", name: "Regulatory Affairs Manager", deptId: "dept_5" },
    { id: "role_6", name: "Product Manager", deptId: "dept_6" },
  ];

  roles.forEach((r) => {
    nodes.push({
      id: r.id,
      type: "Role",
      label: r.name,
      properties: { department_id: r.deptId },
      color: "#10B981",
      size: 28,
    });
    edges.push({
      id: `edge_${r.deptId}_${r.id}`,
      source: r.deptId,
      target: r.id,
      type: "HAS_ROLE",
      properties: {},
    });
  });

  // JTBDs
  const jtbds = [
    { id: "jtbd_1", name: "Respond to HCP inquiries", roleId: "role_3", code: "MA-001" },
    { id: "jtbd_2", name: "Develop scientific content", roleId: "role_2", code: "MA-002" },
    { id: "jtbd_3", name: "Build KOL relationships", roleId: "role_1", code: "MA-003" },
    { id: "jtbd_4", name: "Monitor trial progress", roleId: "role_4", code: "CO-001" },
    { id: "jtbd_5", name: "Prepare regulatory submissions", roleId: "role_5", code: "RA-001" },
    { id: "jtbd_6", name: "Launch product campaigns", roleId: "role_6", code: "CM-001" },
  ];

  jtbds.forEach((j) => {
    nodes.push({
      id: j.id,
      type: "JTBD",
      label: j.name,
      properties: { code: j.code, automation_score: Math.random() * 100 },
      color: "#F59E0B",
      size: 24,
    });
    edges.push({
      id: `edge_${j.roleId}_${j.id}`,
      source: j.roleId,
      target: j.id,
      type: "PERFORMS",
      properties: {},
    });
  });

  // Value Categories
  const valueCategories = [
    { id: "vc_1", name: "SMARTER", code: "SMARTER" },
    { id: "vc_2", name: "FASTER", code: "FASTER" },
    { id: "vc_3", name: "BETTER", code: "BETTER" },
  ];

  valueCategories.forEach((vc) => {
    nodes.push({
      id: vc.id,
      type: "ValueCategory",
      label: vc.name,
      properties: { code: vc.code },
      color: "#06B6D4",
      size: 28,
    });
  });

  // Link JTBDs to Value Categories
  jtbds.forEach((j, i) => {
    const vcId = valueCategories[i % valueCategories.length].id;
    edges.push({
      id: `edge_${j.id}_${vcId}`,
      source: j.id,
      target: vcId,
      type: "DELIVERS_VALUE",
      properties: {},
    });
  });

  // Agents
  const agents = [
    { id: "agent_1", name: "Medical Information Agent", tier: 2, roleId: "role_3" },
    { id: "agent_2", name: "Content Generation Agent", tier: 2, roleId: "role_2" },
    { id: "agent_3", name: "Regulatory Intelligence Agent", tier: 3, roleId: "role_5" },
  ];

  agents.forEach((a) => {
    nodes.push({
      id: a.id,
      type: "Agent",
      label: a.name,
      properties: { tier: a.tier, status: "active" },
      color: "#EAB308",
      size: 28,
    });
    edges.push({
      id: `edge_${a.id}_${a.roleId}`,
      source: a.id,
      target: a.roleId,
      type: "ASSIGNED_TO",
      properties: {},
    });
  });

  return { nodes, edges };
}

// Mode type for the graph state
type GraphMode = "live" | "mock" | "error" | "semantic";

interface GraphState {
  // Data
  nodes: GraphNode[];
  edges: GraphEdge[];
  isLoading: boolean;
  error: string | null;
  mode: GraphMode;
  dataSource: DataSource;

  // Selection
  selection: SelectionState;

  // View state
  layout: LayoutType;
  zoom: number;
  panPosition: { x: number; y: number };
  interactionMode: InteractionMode;

  // Filters
  nodeFilters: NodeFilter[];
  searchQuery: string;

  // Chat
  chatMessages: ChatMessage[];
  isChatOpen: boolean;

  // Actions - Data (multi-source)
  fetchOntologyGraph: (request?: OntologyQueryRequest) => Promise<void>;
  fetchFromNeo4j: (options?: { nodeTypes?: NodeType[]; nodeId?: string; limit?: number }) => Promise<void>;
  fetchFromPinecone: (query: string, options?: { topK?: number; minScore?: number; nodeTypes?: NodeType[] }) => Promise<void>;
  fetchCombined: (request?: OntologyQueryRequest) => Promise<void>;
  fetchAgentNetwork: (options?: { tier?: number; limit?: number }) => Promise<void>;
  fetchNodeNeighbors: (nodeId: string, maxHops?: number) => Promise<void>;
  searchGraph: (query: string, nodeTypes?: NodeType[]) => Promise<void>;
  semanticSearch: (query: string, options?: { topK?: number; minScore?: number }) => Promise<void>;
  refreshGraph: () => Promise<void>;

  // Actions - Selection
  selectNode: (nodeId: string) => void;
  selectNodes: (nodeIds: string[]) => void;
  clearSelection: () => void;
  highlightNodes: (nodeIds: string[]) => void;
  clearHighlight: () => void;
  setHoveredNode: (nodeId: string | null) => void;

  // Actions - View
  setLayout: (layout: LayoutType) => void;
  setZoom: (zoom: number) => void;
  setPanPosition: (position: { x: number; y: number }) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  fitToView: () => void;
  focusOnNode: (nodeId: string) => void;

  // Actions - Filters
  toggleNodeFilter: (nodeType: NodeType) => void;
  setAllFilters: (enabled: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Actions - Chat
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearChat: () => void;
  toggleChat: () => void;

  // Computed
  getVisibleNodes: () => GraphNode[];
  getVisibleEdges: () => GraphEdge[];
  getSelectedNodes: () => GraphNode[];
}

// Default node filters (all enabled)
const DEFAULT_NODE_FILTERS: NodeFilter[] = [
  { type: "Function", enabled: true },
  { type: "Department", enabled: true },
  { type: "Role", enabled: true },
  { type: "JTBD", enabled: true },
  { type: "ValueCategory", enabled: true },
  { type: "ValueDriver", enabled: true },
  { type: "Agent", enabled: true },
  { type: "Persona", enabled: true },
  { type: "Workflow", enabled: true },
];

export const useGraphStore = create<GraphState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        nodes: [],
        edges: [],
        isLoading: false,
        error: null,
        mode: "mock",
        dataSource: "supabase" as DataSource,

        selection: {
          selectedNodeIds: [],
          highlightedNodeIds: [],
          hoveredNodeId: null,
        },

        layout: "force",
        zoom: 1,
        panPosition: { x: 0, y: 0 },
        interactionMode: "pan",

        nodeFilters: DEFAULT_NODE_FILTERS,
        searchQuery: "",

        chatMessages: [],
        isChatOpen: false,

        // Data actions - Primary: Supabase via Next.js API
        fetchOntologyGraph: async (request = {}) => {
          set({ isLoading: true, error: null });
          try {
            // Build query params for Next.js API
            const params = new URLSearchParams();
            if (request.node_types?.length) {
              params.set("types", request.node_types.join(","));
            }
            if (request.function_filter) {
              params.set("function", request.function_filter);
            }
            if (request.limit) {
              params.set("limit", String(request.limit));
            }

            // Primary: Use Next.js API route (fetches from Supabase)
            const response = await fetch(`${SUPABASE_API}?${params.toString()}`);

            if (!response.ok) {
              throw new Error(`Failed to fetch ontology: ${response.status}`);
            }

            const data: GraphResponse = await response.json();
            set({
              nodes: data.nodes,
              edges: data.edges,
              mode: data.metadata.mode,
              dataSource: "supabase",
              isLoading: false,
            });
          } catch (error) {
            console.warn("Next.js API unavailable, trying AI Engine backend:", error);

            // Fallback: Try AI Engine backend
            try {
              const response = await fetch(`${AI_ENGINE_BASE}/api/v1/graph/ontology`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ limit: 200, ...request }),
              });

              if (!response.ok) throw new Error("AI Engine unavailable");

              const data: GraphResponse = await response.json();
              set({
                nodes: data.nodes,
                edges: data.edges,
                mode: data.metadata.mode,
                dataSource: "supabase",
                isLoading: false,
              });
            } catch {
              console.warn("Both APIs unavailable, using mock data");
              const mockData = generateMockData();
              set({
                nodes: mockData.nodes,
                edges: mockData.edges,
                mode: "mock",
                dataSource: "mock",
                error: null,
                isLoading: false,
              });
            }
          }
        },

        // Fetch from Neo4j native graph database
        fetchFromNeo4j: async (options = {}) => {
          set({ isLoading: true, error: null });
          try {
            const params = new URLSearchParams();
            if (options.nodeTypes?.length) {
              params.set("types", options.nodeTypes.join(","));
            }
            if (options.nodeId) {
              params.set("nodeId", options.nodeId);
            }
            if (options.limit) {
              params.set("limit", String(options.limit));
            }

            const response = await fetch(`${NEO4J_API}?${params.toString()}`);
            const data: GraphResponse = await response.json();

            if (data.metadata.mode === "error") {
              throw new Error(data.metadata.error || "Neo4j query failed");
            }

            set({
              nodes: data.nodes,
              edges: data.edges,
              mode: "live",
              dataSource: "neo4j",
              isLoading: false,
            });
          } catch (error) {
            console.error("Neo4j fetch failed:", error);
            set({
              error: String(error),
              isLoading: false,
            });
          }
        },

        // Fetch from Pinecone semantic search
        fetchFromPinecone: async (query, options = {}) => {
          set({ isLoading: true, error: null });
          try {
            const params = new URLSearchParams({ q: query });
            if (options.topK) {
              params.set("topK", String(options.topK));
            }
            if (options.minScore) {
              params.set("minScore", String(options.minScore));
            }
            if (options.nodeTypes?.length) {
              params.set("types", options.nodeTypes.join(","));
            }

            const response = await fetch(`${PINECONE_API}?${params.toString()}`);
            const data: GraphResponse = await response.json();

            if (data.metadata.mode === "error") {
              throw new Error(data.metadata.error || "Pinecone search failed");
            }

            // Pinecone returns nodes only; keep existing edges for context
            const existingEdges = get().edges;
            set({
              nodes: data.nodes,
              edges: existingEdges.filter(
                (e) =>
                  data.nodes.some((n) => n.id === e.source) &&
                  data.nodes.some((n) => n.id === e.target)
              ),
              mode: "live",
              dataSource: "pinecone",
              isLoading: false,
            });
          } catch (error) {
            console.error("Pinecone search failed:", error);
            set({
              error: String(error),
              isLoading: false,
            });
          }
        },

        // Fetch from all sources and combine (GraphRAG-style)
        fetchCombined: async (request = {}) => {
          set({ isLoading: true, error: null });

          const allNodes: GraphNode[] = [];
          const allEdges: GraphEdge[] = [];
          const seenNodeIds = new Set<string>();
          const seenEdgeIds = new Set<string>();

          // Helper to merge nodes/edges without duplicates
          const mergeData = (data: GraphResponse) => {
            data.nodes.forEach((node) => {
              if (!seenNodeIds.has(node.id)) {
                allNodes.push(node);
                seenNodeIds.add(node.id);
              }
            });
            data.edges.forEach((edge) => {
              if (!seenEdgeIds.has(edge.id)) {
                allEdges.push(edge);
                seenEdgeIds.add(edge.id);
              }
            });
          };

          try {
            // Fetch from Supabase
            const supabaseParams = new URLSearchParams();
            if (request.node_types?.length) {
              supabaseParams.set("types", request.node_types.join(","));
            }
            if (request.limit) {
              supabaseParams.set("limit", String(request.limit));
            }

            const supabaseResponse = await fetch(`${SUPABASE_API}?${supabaseParams.toString()}`);
            if (supabaseResponse.ok) {
              const data = await supabaseResponse.json();
              mergeData(data);
            }
          } catch (e) {
            console.warn("Supabase fetch failed in combined mode:", e);
          }

          try {
            // Fetch from Neo4j
            const neo4jParams = new URLSearchParams();
            if (request.node_types?.length) {
              neo4jParams.set("types", request.node_types.join(","));
            }
            if (request.limit) {
              neo4jParams.set("limit", String(Math.min(request.limit || 100, 100)));
            }

            const neo4jResponse = await fetch(`${NEO4J_API}?${neo4jParams.toString()}`);
            if (neo4jResponse.ok) {
              const data = await neo4jResponse.json();
              if (data.metadata.mode !== "error") {
                mergeData(data);
              }
            }
          } catch (e) {
            console.warn("Neo4j fetch failed in combined mode:", e);
          }

          // If we got data from at least one source
          if (allNodes.length > 0) {
            set({
              nodes: allNodes,
              edges: allEdges,
              mode: "live",
              dataSource: "combined",
              isLoading: false,
            });
          } else {
            // Fallback to mock data
            const mockData = generateMockData();
            set({
              nodes: mockData.nodes,
              edges: mockData.edges,
              mode: "mock",
              dataSource: "mock",
              isLoading: false,
            });
          }
        },

        fetchAgentNetwork: async (options = {}) => {
          set({ isLoading: true, error: null });
          try {
            // Use Next.js API with Agent type filter
            const params = new URLSearchParams({ types: "Agent,Function,Department" });
            if (options.limit) params.set("limit", String(options.limit));

            const response = await fetch(`${SUPABASE_API}?${params.toString()}`);

            if (!response.ok) {
              throw new Error(`Failed to fetch agents: ${response.status}`);
            }

            const data: GraphResponse = await response.json();
            set({
              nodes: data.nodes,
              edges: data.edges,
              mode: data.metadata.mode,
              dataSource: "supabase",
              isLoading: false,
            });
          } catch (error) {
            console.warn("API unavailable, using mock data:", error);
            const mockData = generateMockData();
            set({
              nodes: mockData.nodes.filter((n) => n.type === "Agent"),
              edges: mockData.edges.filter((e) => e.type === "ASSIGNED_TO"),
              mode: "mock",
              dataSource: "mock",
              error: null,
              isLoading: false,
            });
          }
        },

        fetchNodeNeighbors: async (nodeId, maxHops = 2) => {
          set({ isLoading: true, error: null });
          try {
            // For now, fetch full graph and filter locally
            // A more sophisticated approach would add a /neighbors endpoint
            const { nodes, edges } = get();

            // Find neighbors by traversing edges
            const neighborIds = new Set<string>();
            const visitedNodes = new Set<string>();
            const queue: { id: string; hops: number }[] = [{ id: nodeId, hops: 0 }];

            while (queue.length > 0) {
              const { id, hops } = queue.shift()!;
              if (visitedNodes.has(id) || hops > maxHops) continue;
              visitedNodes.add(id);
              neighborIds.add(id);

              edges.forEach((e) => {
                if (e.source === id && !visitedNodes.has(e.target)) {
                  queue.push({ id: e.target, hops: hops + 1 });
                }
                if (e.target === id && !visitedNodes.has(e.source)) {
                  queue.push({ id: e.source, hops: hops + 1 });
                }
              });
            }

            // Highlight neighbor nodes
            set((state) => ({
              selection: {
                ...state.selection,
                highlightedNodeIds: Array.from(neighborIds),
                selectedNodeIds: [nodeId],
              },
              isLoading: false,
            }));
          } catch (error) {
            console.warn("Error finding neighbors:", error);
            set({ isLoading: false });
          }
        },

        searchGraph: async (query, nodeTypes) => {
          set({ isLoading: true, error: null, searchQuery: query });

          // Perform local search on loaded data (fast, no API call needed)
          const { nodes } = get();
          const lowerQuery = query.toLowerCase();

          const matchingIds = nodes
            .filter((n) => {
              // Apply node type filter if specified
              if (nodeTypes?.length && !nodeTypes.includes(n.type)) {
                return false;
              }

              // Search across multiple fields
              return (
                n.label.toLowerCase().includes(lowerQuery) ||
                n.type.toLowerCase().includes(lowerQuery) ||
                String(n.properties.code || "").toLowerCase().includes(lowerQuery) ||
                String(n.properties.description || "").toLowerCase().includes(lowerQuery) ||
                String(n.properties.slug || "").toLowerCase().includes(lowerQuery)
              );
            })
            .map((n) => n.id);

          set((state) => ({
            selection: {
              ...state.selection,
              highlightedNodeIds: matchingIds,
            },
            isLoading: false,
          }));
        },

        // Semantic search using Pinecone vector similarity
        semanticSearch: async (query, options = {}) => {
          set({ isLoading: true, error: null, searchQuery: query });

          try {
            const params = new URLSearchParams({ q: query });
            if (options.topK) {
              params.set("topK", String(options.topK));
            }
            if (options.minScore) {
              params.set("minScore", String(options.minScore));
            }

            const response = await fetch(`${PINECONE_API}?${params.toString()}`);
            const data: GraphResponse = await response.json();

            if (data.metadata.mode === "error") {
              throw new Error(data.metadata.error || "Semantic search failed");
            }

            // Highlight matching nodes in the current graph
            const matchingIds = data.nodes.map((n) => n.id);
            const existingNodes = get().nodes;

            // Find matching nodes that exist in current graph
            const existingMatchIds = matchingIds.filter((id) =>
              existingNodes.some((n) => n.id === id)
            );

            // If semantic results match existing nodes, highlight them
            // Otherwise, add the new nodes from semantic search
            if (existingMatchIds.length > 0) {
              set((state) => ({
                selection: {
                  ...state.selection,
                  highlightedNodeIds: existingMatchIds,
                },
                isLoading: false,
              }));
            } else {
              // Add semantic search results to the graph
              const newNodes = data.nodes.filter(
                (n) => !existingNodes.some((existing) => existing.id === n.id)
              );

              set((state) => ({
                nodes: [...state.nodes, ...newNodes],
                selection: {
                  ...state.selection,
                  highlightedNodeIds: matchingIds,
                },
                isLoading: false,
              }));
            }
          } catch (error) {
            console.error("Semantic search failed:", error);
            // Fall back to local search
            const { searchGraph } = get();
            await searchGraph(query);
          }
        },

        refreshGraph: async () => {
          const { fetchOntologyGraph } = get();
          await fetchOntologyGraph();
        },

        // Selection actions
        selectNode: (nodeId) => {
          set((state) => ({
            selection: {
              ...state.selection,
              selectedNodeIds: [nodeId],
            },
          }));
        },

        selectNodes: (nodeIds) => {
          set((state) => ({
            selection: {
              ...state.selection,
              selectedNodeIds: nodeIds,
            },
          }));
        },

        clearSelection: () => {
          set((state) => ({
            selection: {
              ...state.selection,
              selectedNodeIds: [],
            },
          }));
        },

        highlightNodes: (nodeIds) => {
          set((state) => ({
            selection: {
              ...state.selection,
              highlightedNodeIds: nodeIds,
            },
          }));
        },

        clearHighlight: () => {
          set((state) => ({
            selection: {
              ...state.selection,
              highlightedNodeIds: [],
            },
          }));
        },

        setHoveredNode: (nodeId) => {
          set((state) => ({
            selection: {
              ...state.selection,
              hoveredNodeId: nodeId,
            },
          }));
        },

        // View actions
        setLayout: (layout) => set({ layout }),
        setZoom: (zoom) => set({ zoom }),
        setPanPosition: (position) => set({ panPosition: position }),
        setInteractionMode: (mode) => set({ interactionMode: mode }),

        fitToView: () => {
          // This would be called from the graph component
          set({ zoom: 1, panPosition: { x: 0, y: 0 } });
        },

        focusOnNode: (nodeId) => {
          const node = get().nodes.find((n) => n.id === nodeId);
          if (node && node.x !== undefined && node.y !== undefined) {
            set({
              panPosition: { x: -node.x, y: -node.y },
              zoom: 1.5,
              selection: {
                ...get().selection,
                selectedNodeIds: [nodeId],
              },
            });
          }
        },

        // Filter actions
        toggleNodeFilter: (nodeType) => {
          set((state) => ({
            nodeFilters: state.nodeFilters.map((f) =>
              f.type === nodeType ? { ...f, enabled: !f.enabled } : f
            ),
          }));
        },

        setAllFilters: (enabled) => {
          set((state) => ({
            nodeFilters: state.nodeFilters.map((f) => ({
              ...f,
              enabled,
            })),
          }));
        },

        setSearchQuery: (query) => set({ searchQuery: query }),

        // Chat actions
        addChatMessage: (message) => {
          const newMessage: ChatMessage = {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            timestamp: new Date(),
          };
          set((state) => ({
            chatMessages: [...state.chatMessages, newMessage],
          }));
        },

        clearChat: () => set({ chatMessages: [] }),
        toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

        // Computed values
        getVisibleNodes: () => {
          const { nodes, nodeFilters, searchQuery } = get();
          const enabledTypes = new Set(
            nodeFilters.filter((f) => f.enabled).map((f) => f.type)
          );

          return nodes.filter((node) => {
            // Type filter
            if (!enabledTypes.has(node.type)) return false;

            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return (
                node.label.toLowerCase().includes(query) ||
                node.type.toLowerCase().includes(query) ||
                String(node.properties.code || "")
                  .toLowerCase()
                  .includes(query)
              );
            }

            return true;
          });
        },

        getVisibleEdges: () => {
          const { edges } = get();
          const visibleNodeIds = new Set(
            get()
              .getVisibleNodes()
              .map((n) => n.id)
          );

          return edges.filter(
            (edge) =>
              visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
          );
        },

        getSelectedNodes: () => {
          const { nodes, selection } = get();
          return nodes.filter((n) => selection.selectedNodeIds.includes(n.id));
        },
      }),
      {
        name: "ontology-graph-store",
        partialize: (state) => ({
          layout: state.layout,
          nodeFilters: state.nodeFilters,
          isChatOpen: state.isChatOpen,
        }),
      }
    ),
    { name: "OntologyGraphStore" }
  )
);
