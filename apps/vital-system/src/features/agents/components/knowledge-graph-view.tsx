'use client';

/**
 * Knowledge Graph Visualization Component
 * Interactive graph visualization using React Flow
 * Queries Neo4j, Pinecone, and Supabase for agent knowledge graphs
 */

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Search,
  Network,
  Zap,
  GitBranch,
  Filter,
  Download,
  Maximize2,
  RefreshCw,
  Info,
  Database,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Badge } from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface KGNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  embedding_similarity?: number;
}

interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

interface KGStats {
  agent_id: string;
  node_count: number;
  edge_count: number;
  node_types: Record<string, number>;
  relationship_types: Record<string, number>;
  connected_agents: number;
  avg_connections: number;
}

interface KnowledgeGraphProps {
  agentId: string;
  height?: string;
  className?: string;
}

type SearchMode = 'graph' | 'semantic' | 'hybrid';

// ============================================================================
// Node Type Colors
// ============================================================================

const nodeTypeColors: Record<string, string> = {
  Agent: '#3B82F6', // Blue
  Skill: '#10B981', // Green
  Tool: '#F59E0B', // Amber
  Knowledge: '#8B5CF6', // Purple
  Document: '#EC4899', // Pink
  Capability: '#06B6D4', // Cyan
  Domain: '#EF4444', // Red
  default: '#6B7280', // Gray
};

// ============================================================================
// Custom Node Component
// ============================================================================

function CustomNode({ data }: { data: any }) {
  const nodeColor = nodeTypeColors[data.type] || nodeTypeColors.default;
  
  return (
    <div
      className="px-4 py-2 rounded-lg border-2 shadow-md bg-canvas-surface min-w-[120px]"
      style={{ borderColor: nodeColor }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: nodeColor }}
        />
        <div className="font-medium text-sm text-neutral-900">{data.label}</div>
      </div>
      <div className="text-xs text-neutral-500 mt-1">{data.type}</div>
      {data.embedding_similarity && (
        <div className="text-xs text-blue-600 mt-1">
          {Math.round(data.embedding_similarity * 100)}% match
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

// ============================================================================
// Main Component
// ============================================================================

export function KnowledgeGraphVisualization({
  agentId,
  height = '600px',
  className,
}: KnowledgeGraphProps) {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<KGStats | null>(null);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<string[]>([]);
  const [maxHops, setMaxHops] = useState(2);

  // Load initial graph
  useEffect(() => {
    loadGraph();
    loadStats();
  }, [agentId]);

  // Load stats
  const loadStats = async () => {
    try {
      const response = await fetch(
        `/v1/agents/${agentId}/knowledge-graph/stats`,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers as needed
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading KG stats:', error);
    }
  };

  // Load graph data
  const loadGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/v1/agents/${agentId}/knowledge-graph/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: agentId,
            query: query || undefined,
            node_types: selectedNodeTypes.length > 0 ? selectedNodeTypes : undefined,
            max_hops: maxHops,
            limit: 100,
            search_mode: searchMode,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to load graph');

      const data = await response.json();
      
      // Convert to React Flow format
      const flowNodes: Node[] = data.nodes.map((node: KGNode, index: number) => ({
        id: node.id,
        type: 'custom',
        position: calculateNodePosition(index, data.nodes.length),
        data: {
          label: node.label,
          type: node.type,
          properties: node.properties,
          embedding_similarity: node.embedding_similarity,
        },
      }));

      const flowEdges: Edge[] = data.edges.map((edge: KGEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.type,
        type: 'smoothstep',
        animated: edge.type === 'USES' || edge.type === 'KNOWS',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          stroke: '#94A3B8',
          strokeWidth: 2,
        },
        labelStyle: {
          fontSize: 10,
          fill: '#64748B',
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      await loadStats();
    } catch (error) {
      console.error('Error loading graph:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate node positions in a circle
  const calculateNodePosition = (index: number, total: number) => {
    const radius = Math.min(300, total * 30);
    const angle = (index / total) * 2 * Math.PI;
    return {
      x: 400 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle),
    };
  };

  // Handle search
  const handleSearch = () => {
    loadGraph();
  };

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // TODO: Show node details modal
  }, []);

  // Export graph data
  const handleExport = () => {
    const graphData = {
      nodes,
      edges,
      stats,
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(graphData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agentId}-kg-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Knowledge Graph
          </h3>
          {stats && (
            <p className="text-sm text-neutral-500 mt-1">
              {stats.node_count} nodes · {stats.edge_count} edges · {stats.connected_agents} connected agents
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGraph}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Query */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Search Query (Semantic)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search knowledge graph..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Mode */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Search Mode
              </label>
              <Select value={searchMode} onValueChange={(v) => setSearchMode(v as SearchMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graph">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Graph Only
                    </div>
                  </SelectItem>
                  <SelectItem value="semantic">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Semantic Only
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Hybrid (Both)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Hops */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Max Hops
              </label>
              <Select value={maxHops.toString()} onValueChange={(v) => setMaxHops(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hop</SelectItem>
                  <SelectItem value="2">2 hops</SelectItem>
                  <SelectItem value="3">3 hops</SelectItem>
                  <SelectItem value="4">4 hops</SelectItem>
                  <SelectItem value="5">5 hops</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Node Type Legend */}
          {stats && Object.keys(stats.node_types).length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.node_types).map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="cursor-pointer hover:bg-neutral-50"
                    style={{
                      borderColor: nodeTypeColors[type] || nodeTypeColors.default,
                      color: nodeTypeColors[type] || nodeTypeColors.default,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{
                        backgroundColor: nodeTypeColors[type] || nodeTypeColors.default,
                      }}
                    />
                    {type} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <div style={{ height }} className="border border-neutral-200 rounded-lg bg-neutral-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const type = node.data?.type as string;
              return nodeTypeColors[type] || nodeTypeColors.default;
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          
          {/* Info Panel */}
          <Panel position="top-right" className="bg-canvas-surface rounded-lg shadow-md p-3 max-w-xs">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Navigation</span>
            </div>
            <ul className="text-xs text-neutral-600 mt-2 space-y-1">
              <li>• Click nodes to see details</li>
              <li>• Drag to rearrange</li>
              <li>• Scroll to zoom</li>
              <li>• Use minimap for overview</li>
            </ul>
          </Panel>
        </ReactFlow>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-canvas-surface/80 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-neutral-600">Loading knowledge graph...</p>
          </div>
        </div>
      )}
    </div>
  );
}

