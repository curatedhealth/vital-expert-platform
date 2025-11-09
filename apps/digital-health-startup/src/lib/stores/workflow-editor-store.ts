/**
 * Workflow Editor Store
 * Centralized state management for the workflow editor using Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
} from 'reactflow';

interface WorkflowState {
  // Core workflow data
  workflowId: string | null;
  workflowTitle: string;
  workflowDescription: string;
  useCaseId: string | null;
  
  // Canvas state
  nodes: Node[];
  edges: Edge[];
  
  // Selection state
  selectedNodes: string[];
  selectedEdges: string[];
  
  // UI state
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  // History (undo/redo)
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;
  maxHistorySize: number;
  
  // Clipboard
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  
  // Execution state
  executionState: Map<string, 'pending' | 'running' | 'success' | 'error'>;
  isExecuting: boolean;
}

interface WorkflowActions {
  // Workflow metadata
  setWorkflowId: (id: string | null) => void;
  setWorkflowTitle: (title: string) => void;
  setWorkflowDescription: (description: string) => void;
  setUseCaseId: (id: string | null) => void;
  
  // Node/Edge management
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // CRUD operations
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  duplicateNode: (id: string) => void;
  
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  
  // Selection
  selectNode: (id: string, multi?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  
  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Clipboard
  copy: () => void;
  cut: () => void;
  paste: (position?: { x: number; y: number }) => void;
  
  // Workflow operations
  loadWorkflow: (workflowId: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  publishWorkflow: () => Promise<void>;
  reset: () => void;
  
  // Execution
  updateNodeExecutionState: (nodeId: string, state: 'pending' | 'running' | 'success' | 'error') => void;
  clearExecutionState: () => void;
  
  // Utility
  markDirty: () => void;
  markClean: () => void;
}

type WorkflowStore = WorkflowState & WorkflowActions;

const initialState: WorkflowState = {
  workflowId: null,
  workflowTitle: 'Untitled Workflow',
  workflowDescription: '',
  useCaseId: null,
  
  nodes: [],
  edges: [],
  
  selectedNodes: [],
  selectedEdges: [],
  
  isDirty: false,
  isLoading: false,
  isSaving: false,
  
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  clipboard: null,
  
  executionState: new Map(),
  isExecuting: false,
};

export const useWorkflowEditorStore = create<WorkflowStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Workflow metadata
        setWorkflowId: (id) => set({ workflowId: id }),
        setWorkflowTitle: (title) => set({ workflowTitle: title, isDirty: true }),
        setWorkflowDescription: (description) => set({ workflowDescription: description, isDirty: true }),
        setUseCaseId: (id) => set({ useCaseId: id }),
        
        // Node/Edge management
        setNodes: (nodes) => set({ nodes, isDirty: true }),
        setEdges: (edges) => set({ edges, isDirty: true }),
        
        onNodesChange: (changes) => {
          const { nodes } = get();
          const newNodes = applyNodeChanges(changes, nodes);
          set({ nodes: newNodes, isDirty: true });
        },
        
        onEdgesChange: (changes) => {
          const { edges } = get();
          const newEdges = applyEdgeChanges(changes, edges);
          set({ edges: newEdges, isDirty: true });
        },
        
        onConnect: (connection) => {
          const { edges } = get();
          const newEdges = addEdge(connection, edges);
          set({ edges: newEdges, isDirty: true });
          get().pushHistory();
        },
        
        // CRUD operations
        addNode: (node) => {
          set((state) => {
            state.nodes.push(node);
            state.isDirty = true;
          });
          get().pushHistory();
        },
        
        updateNode: (id, updates) => {
          set((state) => {
            const index = state.nodes.findIndex((n) => n.id === id);
            if (index !== -1) {
              state.nodes[index] = { ...state.nodes[index], ...updates };
              state.isDirty = true;
            }
          });
        },
        
        updateNodeData: (id, data) => {
          set((state) => {
            const node = state.nodes.find((n) => n.id === id);
            if (node) {
              node.data = { ...node.data, ...data };
              state.isDirty = true;
            }
          });
        },
        
        deleteNode: (id) => {
          set((state) => {
            state.nodes = state.nodes.filter((n) => n.id !== id);
            state.edges = state.edges.filter((e) => e.source !== id && e.target !== id);
            state.isDirty = true;
          });
          get().pushHistory();
        },
        
        deleteNodes: (ids) => {
          set((state) => {
            state.nodes = state.nodes.filter((n) => !ids.includes(n.id));
            state.edges = state.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target));
            state.isDirty = true;
          });
          get().pushHistory();
        },
        
        duplicateNode: (id) => {
          const { nodes } = get();
          const node = nodes.find((n) => n.id === id);
          if (node) {
            const newNode = {
              ...node,
              id: `${node.id}-copy-${Date.now()}`,
              position: {
                x: node.position.x + 50,
                y: node.position.y + 50,
              },
              selected: false,
            };
            get().addNode(newNode);
          }
        },
        
        addEdge: (edge) => {
          set((state) => {
            state.edges.push(edge);
            state.isDirty = true;
          });
          get().pushHistory();
        },
        
        deleteEdge: (id) => {
          set((state) => {
            state.edges = state.edges.filter((e) => e.id !== id);
            state.isDirty = true;
          });
          get().pushHistory();
        },
        
        // Selection
        selectNode: (id, multi = false) => {
          set((state) => {
            if (multi) {
              if (state.selectedNodes.includes(id)) {
                state.selectedNodes = state.selectedNodes.filter((nid) => nid !== id);
              } else {
                state.selectedNodes.push(id);
              }
            } else {
              state.selectedNodes = [id];
            }
          });
        },
        
        selectNodes: (ids) => set({ selectedNodes: ids }),
        clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),
        
        // History
        pushHistory: () => {
          set((state) => {
            const { nodes, edges, history, historyIndex, maxHistorySize } = state;
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
            
            if (newHistory.length > maxHistorySize) {
              newHistory.shift();
            }
            
            state.history = newHistory;
            state.historyIndex = newHistory.length - 1;
          });
        },
        
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex > 0) {
            const previous = history[historyIndex - 1];
            set({
              nodes: JSON.parse(JSON.stringify(previous.nodes)),
              edges: JSON.parse(JSON.stringify(previous.edges)),
              historyIndex: historyIndex - 1,
              isDirty: true,
            });
          }
        },
        
        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex < history.length - 1) {
            const next = history[historyIndex + 1];
            set({
              nodes: JSON.parse(JSON.stringify(next.nodes)),
              edges: JSON.parse(JSON.stringify(next.edges)),
              historyIndex: historyIndex + 1,
              isDirty: true,
            });
          }
        },
        
        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,
        
        // Clipboard
        copy: () => {
          const { nodes, edges, selectedNodes } = get();
          const nodesToCopy = nodes.filter((n) => selectedNodes.includes(n.id));
          const edgesToCopy = edges.filter(
            (e) => selectedNodes.includes(e.source) && selectedNodes.includes(e.target)
          );
          set({ clipboard: { nodes: nodesToCopy, edges: edgesToCopy } });
        },
        
        cut: () => {
          get().copy();
          const { selectedNodes } = get();
          get().deleteNodes(selectedNodes);
        },
        
        paste: (position = { x: 50, y: 50 }) => {
          const { clipboard, nodes, edges } = get();
          if (!clipboard || clipboard.nodes.length === 0) return;
          
          const idMap = new Map<string, string>();
          const pastedNodes = clipboard.nodes.map((n) => {
            const newId = `${n.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            idMap.set(n.id, newId);
            return {
              ...n,
              id: newId,
              position: {
                x: n.position.x + position.x,
                y: n.position.y + position.y,
              },
              selected: true,
            };
          });
          
          const pastedEdges = clipboard.edges.map((e) => ({
            ...e,
            id: `${e.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: idMap.get(e.source) || e.source,
            target: idMap.get(e.target) || e.target,
          }));
          
          set({
            nodes: [...nodes, ...pastedNodes],
            edges: [...edges, ...pastedEdges],
            selectedNodes: pastedNodes.map((n) => n.id),
            isDirty: true,
          });
          
          get().pushHistory();
        },
        
        // Workflow operations
        loadWorkflow: async (workflowId) => {
          set({ isLoading: true });
          
          try {
            const response = await fetch(`/api/workflows/${workflowId}`);
            if (!response.ok) throw new Error('Failed to load workflow');
            
            const { workflow } = await response.json();
            
            set({
              workflowId: workflow.id,
              workflowTitle: workflow.title,
              workflowDescription: workflow.description || '',
              useCaseId: workflow.use_case_id,
              nodes: workflow.nodes || [],
              edges: workflow.edges || [],
              isDirty: false,
              isLoading: false,
            });
            
            // Initialize history
            get().pushHistory();
          } catch (error) {
            console.error('Error loading workflow:', error);
            set({ isLoading: false });
          }
        },
        
        saveWorkflow: async () => {
          const { workflowId, workflowTitle, workflowDescription, useCaseId, nodes, edges } = get();
          set({ isSaving: true });
          
          try {
            const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';
            const method = workflowId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: workflowTitle,
                description: workflowDescription,
                use_case_id: useCaseId,
                nodes,
                edges,
              }),
            });
            
            if (!response.ok) throw new Error('Failed to save workflow');
            
            const { workflow } = await response.json();
            
            set({
              workflowId: workflow.id,
              isDirty: false,
              isSaving: false,
            });
          } catch (error) {
            console.error('Error saving workflow:', error);
            set({ isSaving: false });
            throw error;
          }
        },
        
        publishWorkflow: async () => {
          // Save first, then publish
          await get().saveWorkflow();
          
          const { workflowId } = get();
          if (!workflowId) return;
          
          try {
            await fetch(`/api/workflows/${workflowId}/publish`, {
              method: 'POST',
            });
          } catch (error) {
            console.error('Error publishing workflow:', error);
            throw error;
          }
        },
        
        reset: () => {
          set({
            ...initialState,
            history: [{ nodes: [], edges: [] }],
            historyIndex: 0,
          });
        },
        
        // Execution
        updateNodeExecutionState: (nodeId, state) => {
          set((draft) => {
            draft.executionState.set(nodeId, state);
          });
        },
        
        clearExecutionState: () => {
          set({ executionState: new Map(), isExecuting: false });
        },
        
        // Utility
        markDirty: () => set({ isDirty: true }),
        markClean: () => set({ isDirty: false }),
      })),
      {
        name: 'workflow-editor',
        partialize: (state) => ({
          // Only persist workflow data, not UI state
          workflowId: state.workflowId,
          workflowTitle: state.workflowTitle,
          workflowDescription: state.workflowDescription,
          useCaseId: state.useCaseId,
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    )
  )
);

