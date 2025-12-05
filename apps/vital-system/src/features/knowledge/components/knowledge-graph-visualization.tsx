'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Filter,
  Search,
  Download,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  Pill,
  Activity,
  Building2,
  FileText,
  Tag,
  Link2,
  Users,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
type NodeType = 'entity' | 'document' | 'citation' | 'domain' | 'topic';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  subType?: string;
  x: number;
  y: number;
  size: number;
  color: string;
  connections: number;
  metadata?: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'contains' | 'references' | 'related' | 'mentions' | 'part_of';
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Color mapping for node types
const nodeColors: Record<NodeType, string> = {
  entity: '#6366f1', // Indigo
  document: '#22c55e', // Green
  citation: '#f59e0b', // Amber
  domain: '#ec4899', // Pink
  topic: '#06b6d4', // Cyan
};

// Icon mapping for node types
const nodeIcons: Record<NodeType, React.ReactNode> = {
  entity: <Tag className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  citation: <BookOpen className="h-4 w-4" />,
  domain: <Layers className="h-4 w-4" />,
  topic: <Activity className="h-4 w-4" />,
};

// Sub-type icons for entities
const entitySubTypeIcons: Record<string, React.ReactNode> = {
  medication: <Pill className="h-3 w-3" />,
  organization: <Building2 className="h-3 w-3" />,
  person: <Users className="h-3 w-3" />,
};

// Generate mock graph data
function generateMockGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add domains
  const domains = ['Rheumatology', 'Immunology', 'Regulatory'];
  domains.forEach((domain, i) => {
    nodes.push({
      id: `domain-${i}`,
      label: domain,
      type: 'domain',
      x: 200 + i * 300,
      y: 100,
      size: 50,
      color: nodeColors.domain,
      connections: 5,
    });
  });

  // Add entities
  const entities = [
    { name: 'Adalimumab', subType: 'medication' },
    { name: 'Rheumatoid Arthritis', subType: 'condition' },
    { name: 'TNF-alpha', subType: 'biomarker' },
    { name: 'Pfizer Inc.', subType: 'organization' },
    { name: 'IL-6', subType: 'biomarker' },
    { name: 'Secukinumab', subType: 'medication' },
  ];

  entities.forEach((entity, i) => {
    const nodeId = `entity-${i}`;
    nodes.push({
      id: nodeId,
      label: entity.name,
      type: 'entity',
      subType: entity.subType,
      x: 150 + (i % 3) * 250 + Math.random() * 50,
      y: 250 + Math.floor(i / 3) * 150 + Math.random() * 30,
      size: 35,
      color: nodeColors.entity,
      connections: Math.floor(Math.random() * 8) + 2,
    });

    // Connect to a domain
    edges.push({
      id: `edge-domain-${i}`,
      source: `domain-${i % 3}`,
      target: nodeId,
      type: 'contains',
      weight: 0.8,
    });
  });

  // Add documents
  const documents = [
    'Clinical Protocol v2.1.pdf',
    'Investigator Brochure.pdf',
    'FDA Approval Letter.pdf',
    'Phase 3 Results.pdf',
  ];

  documents.forEach((doc, i) => {
    const nodeId = `doc-${i}`;
    nodes.push({
      id: nodeId,
      label: doc,
      type: 'document',
      x: 100 + (i % 2) * 400 + Math.random() * 50,
      y: 450 + Math.floor(i / 2) * 120 + Math.random() * 30,
      size: 40,
      color: nodeColors.document,
      connections: Math.floor(Math.random() * 5) + 1,
    });

    // Connect documents to entities
    const entityConnections = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < entityConnections; j++) {
      const entityIdx = Math.floor(Math.random() * entities.length);
      edges.push({
        id: `edge-doc-entity-${i}-${j}`,
        source: nodeId,
        target: `entity-${entityIdx}`,
        type: 'mentions',
        weight: 0.6 + Math.random() * 0.4,
      });
    }
  });

  // Add citations
  const citations = [
    'PMID:12345678',
    'NCT04123456',
    'FDA NDA-761024',
  ];

  citations.forEach((cite, i) => {
    const nodeId = `cite-${i}`;
    nodes.push({
      id: nodeId,
      label: cite,
      type: 'citation',
      x: 550 + Math.random() * 100,
      y: 350 + i * 80 + Math.random() * 30,
      size: 30,
      color: nodeColors.citation,
      connections: Math.floor(Math.random() * 4) + 1,
    });

    // Connect citations to documents
    edges.push({
      id: `edge-cite-doc-${i}`,
      source: `doc-${i % documents.length}`,
      target: nodeId,
      type: 'references',
      weight: 0.9,
    });
  });

  // Add some cross-entity relationships
  edges.push({
    id: 'edge-related-1',
    source: 'entity-0',
    target: 'entity-2',
    type: 'related',
    weight: 0.7,
  });
  edges.push({
    id: 'edge-related-2',
    source: 'entity-1',
    target: 'entity-4',
    type: 'related',
    weight: 0.5,
  });

  return { nodes, edges };
}

// Graph Canvas Component
function GraphCanvas({
  data,
  selectedNode,
  onNodeClick,
  zoom,
  pan,
  showLabels,
  highlightedType,
}: {
  data: GraphData;
  selectedNode: GraphNode | null;
  onNodeClick: (node: GraphNode) => void;
  zoom: number;
  pan: { x: number; y: number };
  showLabels: boolean;
  highlightedType: NodeType | 'all';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    data.edges.forEach((edge) => {
      const sourceNode = data.nodes.find((n) => n.id === edge.source);
      const targetNode = data.nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const isHighlighted =
        selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
      const isDimmed =
        highlightedType !== 'all' &&
        sourceNode.type !== highlightedType &&
        targetNode.type !== highlightedType;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.strokeStyle = isHighlighted
        ? '#3b82f6'
        : isDimmed
          ? 'rgba(156, 163, 175, 0.2)'
          : `rgba(156, 163, 175, ${edge.weight * 0.5})`;
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    data.nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const isDimmed = highlightedType !== 'all' && node.type !== highlightedType;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = isDimmed ? 'rgba(156, 163, 175, 0.3)' : node.color;
      ctx.fill();

      if (isSelected || isHovered) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw label
      if (showLabels && !isDimmed) {
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label,
          node.x,
          node.y + node.size / 2 + 15
        );
      }
    });

    ctx.restore();
  }, [data, selectedNode, hoveredNode, zoom, pan, showLabels, highlightedType]);

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const hovered = data.nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.size / 2;
    });

    setHoveredNode(hovered?.id || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = data.nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.size / 2;
    });

    if (clicked) {
      onNodeClick(clicked);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full bg-muted/20 rounded-lg"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}

// Node Details Panel
function NodeDetailsPanel({
  node,
  edges,
  nodes,
  onClose,
}: {
  node: GraphNode;
  edges: GraphEdge[];
  nodes: GraphNode[];
  onClose: () => void;
}) {
  const connectedEdges = edges.filter(
    (e) => e.source === node.id || e.target === node.id
  );

  const connectedNodes = connectedEdges.map((e) => {
    const connectedId = e.source === node.id ? e.target : e.source;
    const connectedNode = nodes.find((n) => n.id === connectedId);
    return { edge: e, node: connectedNode };
  });

  return (
    <Card className="absolute right-4 top-4 w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            {nodeIcons[node.type]}
            <CardTitle className="text-sm">{node.label}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            &times;
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {node.type}
          </Badge>
          {node.subType && (
            <Badge variant="secondary" className="capitalize">
              {node.subType}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Connections ({connectedNodes.length})
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {connectedNodes.map(({ edge, node: connNode }, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50"
              >
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="capitalize text-muted-foreground">
                  {edge.type}
                </span>
                <span className="font-medium truncate">
                  {connNode?.label || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Metadata
            </p>
            <div className="text-xs space-y-1">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key}:
                  </span>
                  <span className="font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Knowledge Graph Visualization Component
export function KnowledgeGraphVisualization() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [highlightedType, setHighlightedType] = useState<NodeType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/knowledge/graph');
      // const data = await response.json();
      // setGraphData(data);

      // Mock data
      const mockData = generateMockGraphData();
      setGraphData(mockData);
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Stats
  const stats = {
    nodes: graphData.nodes.length,
    edges: graphData.edges.length,
    byType: graphData.nodes.reduce(
      (acc, n) => ({ ...acc, [n.type]: (acc[n.type] || 0) + 1 }),
      {} as Record<NodeType, number>
    ),
  };

  // Filter nodes by search
  const filteredNodes = searchQuery
    ? graphData.nodes.filter((n) =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : graphData.nodes;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Layers className="h-3 w-3" />
            {stats.nodes} nodes
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Link2 className="h-3 w-3" />
            {stats.edges} edges
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1"
              style={{ backgroundColor: `${nodeColors[type as NodeType]}20` }}
            >
              {nodeIcons[type as NodeType]}
              {count} {type}s
            </Badge>
          ))}
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={highlightedType}
              onValueChange={(v) => setHighlightedType(v as NodeType | 'all')}
            >
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="entity">Entities</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="citation">Citations</SelectItem>
                <SelectItem value="domain">Domains</SelectItem>
                <SelectItem value="topic">Topics</SelectItem>
              </SelectContent>
            </Select>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Toggle Labels */}
            <Button
              variant={showLabels ? 'default' : 'outline'}
              size="sm"
              className="h-8"
              onClick={() => setShowLabels(!showLabels)}
            >
              {showLabels ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              Labels
            </Button>

            {/* Reset View */}
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setSelectedNode(null);
              }}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Reset
            </Button>

            {/* Refresh */}
            <Button variant="outline" size="sm" className="h-8" onClick={fetchGraphData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Graph Canvas */}
      <div className="relative h-[600px] border rounded-lg overflow-hidden">
        <GraphCanvas
          data={{ ...graphData, nodes: filteredNodes }}
          selectedNode={selectedNode}
          onNodeClick={setSelectedNode}
          zoom={zoom}
          pan={pan}
          showLabels={showLabels}
          highlightedType={highlightedType}
        />

        {/* Node Details Panel */}
        {selectedNode && (
          <NodeDetailsPanel
            node={selectedNode}
            edges={graphData.edges}
            nodes={graphData.nodes}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Legend */}
        <div className="absolute left-4 bottom-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border">
          <p className="text-xs font-medium mb-2">Legend</p>
          <div className="space-y-1">
            {Object.entries(nodeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGraphVisualization;
