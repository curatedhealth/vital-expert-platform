import { useState, useEffect, useCallback } from 'react';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'interrupt' | 'parallel';
  position: { x: number; y: number };
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'running';
  lastExecuted?: Date;
  executionCount: number;
  averageLatency: number;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
  status: 'active' | 'inactive' | 'error';
}

interface WorkflowExecution {
  id: string;
  sessionId: string;
  userId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNode: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
  metadata: Record<string, any>;
}

interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
  activeExecutions: number;
  nodePerformance: Record<string, {
    executions: number;
    averageLatency: number;
    errorRate: number;
  }>;
}

export function useWorkflowAdmin() {
  const [workflow, setWorkflow] = useState<{
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    metadata: {
      name: string;
      description: string;
      version: string;
      lastModified: Date;
      status: 'active' | 'inactive' | 'draft';
    };
  }>({
    nodes: [],
    edges: [],
    metadata: {
      name: 'Mode-Aware Multi-Agent Workflow',
      description: 'LangGraph workflow supporting all 4 mode combinations',
      version: '2.0.0',
      lastModified: new Date(),
      status: 'active'
    }
  });

  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Load workflow data
  const loadWorkflow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/workflow');
      const data = await response.json();
      
      if (data.success) {
        setWorkflow(data.workflow);
        addLog('✅ Workflow loaded successfully');
      } else {
        throw new Error(data.error || 'Failed to load workflow');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Failed to load workflow: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load executions
  const loadExecutions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/workflow/executions');
      const data = await response.json();
      
      if (data.success) {
        setExecutions(data.executions);
        addLog('✅ Executions loaded successfully');
      } else {
        throw new Error(data.error || 'Failed to load executions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`❌ Failed to load executions: ${errorMessage}`);
    }
  }, []);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/workflow/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        addLog('✅ Metrics loaded successfully');
      } else {
        throw new Error(data.error || 'Failed to load metrics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`❌ Failed to load metrics: ${errorMessage}`);
    }
  }, []);

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  // Add node
  const addNode = useCallback((node: Omit<WorkflowNode, 'id'>) => {
    const newNode: WorkflowNode = {
      ...node,
      id: `node_${Date.now()}`,
      executionCount: 0,
      averageLatency: 0
    };
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    addLog(`➕ Added node: ${newNode.name}`);
  }, []);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    const node = workflow.nodes.find(n => n.id === nodeId);
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    }));
    if (node) {
      addLog(`🗑️ Deleted node: ${node.name}`);
    }
  }, [workflow.nodes]);

  // Add edge
  const addEdge = useCallback((edge: Omit<WorkflowEdge, 'id'>) => {
    const newEdge: WorkflowEdge = {
      ...edge,
      id: `edge_${Date.now()}`,
      status: 'active'
    };
    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
    addLog(`🔗 Added edge: ${newEdge.source} → ${newEdge.target}`);
  }, []);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/workflow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Workflow saved successfully');
        setIsEditing(false);
      } else {
        throw new Error(data.error || 'Failed to save workflow');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Failed to save workflow: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workflow]);

  // Deploy workflow
  const deployWorkflow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/workflow/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('🚀 Workflow deployed successfully');
        // Reload data after deployment
        await loadWorkflow();
        await loadMetrics();
      } else {
        throw new Error(data.error || 'Failed to deploy workflow');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Failed to deploy workflow: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workflow, loadWorkflow, loadMetrics]);

  // Test workflow
  const testWorkflow = useCallback(async (testQuery: string, mode: 'automatic' | 'manual', autonomous: boolean, selectedTools: string[] = []) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/workflow/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testQuery,
          mode,
          autonomous,
          selectedTools
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog('🧪 Workflow test completed successfully');
        // Reload executions after test
        await loadExecutions();
        return data.result;
      } else {
        throw new Error(data.error || 'Failed to test workflow');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Failed to test workflow: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadExecutions]);

  // Add log message
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadWorkflow();
    loadExecutions();
    loadMetrics();
  }, [loadWorkflow, loadExecutions, loadMetrics]);

  return {
    // State
    workflow,
    executions,
    metrics,
    selectedNode,
    isEditing,
    isLoading,
    error,
    logs,
    
    // Actions
    setSelectedNode,
    setIsEditing,
    updateNode,
    addNode,
    deleteNode,
    addEdge,
    saveWorkflow,
    deployWorkflow,
    testWorkflow,
    addLog,
    clearLogs,
    
    // Data loading
    loadWorkflow,
    loadExecutions,
    loadMetrics
  };
}
