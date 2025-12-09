'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

// Agent Level colors matching VITAL 5-tier hierarchy
const LEVEL_COLORS = {
  L1: '#8B5CF6', // Purple - Masters (Strategic Orchestrators)
  L2: '#3B82F6', // Blue - Experts (Domain Specialists)
  L3: '#10B981', // Green - Specialists (Task Executors)
  L4: '#F59E0B', // Amber - Workers (Process Handlers)
  L5: '#EF4444', // Red - Tools (Atomic Operations)
} as const;

const LEVEL_LABELS = {
  L1: 'Master',
  L2: 'Expert',
  L3: 'Specialist',
  L4: 'Worker',
  L5: 'Tool',
} as const;

interface Agent {
  id: string;
  name: string;
  slug: string;
  level: keyof typeof LEVEL_COLORS;
  tier?: number;
  function_name?: string;
  department_name?: string;
  parent_agent_id?: string | null;
  can_delegate_to?: string[];
  can_escalate_to?: string[];
  status?: string;
}

interface AgentNetworkGraphProps {
  agents: Agent[];
  onNodeClick?: (agent: Agent) => void;
  layout?: 'hierarchical' | 'cose' | 'circle' | 'breadthfirst';
  height?: number;
  showLegend?: boolean;
  filterByLevel?: keyof typeof LEVEL_COLORS | null;
  filterByFunction?: string | null;
}

export function AgentNetworkGraph({
  agents,
  onNodeClick,
  layout = 'hierarchical',
  height = 600,
  showLegend = true,
  filterByLevel = null,
  filterByFunction = null,
}: AgentNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Agent | null>(null);
  const [currentLayout, setCurrentLayout] = useState(layout);

  // Filter agents based on criteria
  const filteredAgents = agents.filter((agent) => {
    if (filterByLevel && agent.level !== filterByLevel) return false;
    if (filterByFunction && agent.function_name !== filterByFunction) return false;
    return true;
  });

  // Build graph data
  const buildGraphData = useCallback(() => {
    const nodes = filteredAgents.map((agent) => ({
      data: {
        id: agent.id,
        label: agent.name,
        level: agent.level,
        tier: agent.tier,
        function_name: agent.function_name,
        department_name: agent.department_name,
        slug: agent.slug,
        color: LEVEL_COLORS[agent.level] || '#6B7280',
      },
    }));

    const edges: { data: { id: string; source: string; target: string; type: string } }[] = [];
    const agentIds = new Set(filteredAgents.map((a) => a.id));

    filteredAgents.forEach((agent) => {
      // Parent-child relationships (hierarchy)
      if (agent.parent_agent_id && agentIds.has(agent.parent_agent_id)) {
        edges.push({
          data: {
            id: `parent-${agent.id}`,
            source: agent.parent_agent_id,
            target: agent.id,
            type: 'hierarchy',
          },
        });
      }

      // Delegation relationships
      if (agent.can_delegate_to) {
        agent.can_delegate_to.forEach((targetId) => {
          if (agentIds.has(targetId)) {
            edges.push({
              data: {
                id: `delegate-${agent.id}-${targetId}`,
                source: agent.id,
                target: targetId,
                type: 'delegation',
              },
            });
          }
        });
      }

      // Escalation relationships
      if (agent.can_escalate_to) {
        agent.can_escalate_to.forEach((targetId) => {
          if (agentIds.has(targetId)) {
            edges.push({
              data: {
                id: `escalate-${agent.id}-${targetId}`,
                source: agent.id,
                target: targetId,
                type: 'escalation',
              },
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, [filteredAgents]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || filteredAgents.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { nodes, edges } = buildGraphData();

    // Cytoscape configuration
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '10px',
            'text-margin-y': 5,
            color: '#374151',
            width: 40,
            height: 40,
            'border-width': 2,
            'border-color': '#E5E7EB',
          },
        },
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#1D4ED8',
            'background-color': '#DBEAFE',
          },
        },
        // Hover effect
        {
          selector: 'node:active',
          style: {
            'overlay-opacity': 0.3,
            'overlay-color': '#3B82F6',
          },
        },
        // Level-specific node sizes
        {
          selector: 'node[level="L1"]',
          style: { width: 60, height: 60, 'font-size': '12px', 'font-weight': 'bold' },
        },
        {
          selector: 'node[level="L2"]',
          style: { width: 50, height: 50, 'font-size': '11px' },
        },
        {
          selector: 'node[level="L3"]',
          style: { width: 40, height: 40 },
        },
        {
          selector: 'node[level="L4"]',
          style: { width: 35, height: 35, 'font-size': '9px' },
        },
        {
          selector: 'node[level="L5"]',
          style: { width: 30, height: 30, 'font-size': '8px' },
        },
        // Edge styles - hierarchy (solid)
        {
          selector: 'edge[type="hierarchy"]',
          style: {
            width: 2,
            'line-color': '#9CA3AF',
            'target-arrow-color': '#9CA3AF',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        // Edge styles - delegation (dashed blue)
        {
          selector: 'edge[type="delegation"]',
          style: {
            width: 1.5,
            'line-color': '#3B82F6',
            'line-style': 'dashed',
            'target-arrow-color': '#3B82F6',
            'target-arrow-shape': 'vee',
            'curve-style': 'bezier',
          },
        },
        // Edge styles - escalation (dotted red)
        {
          selector: 'edge[type="escalation"]',
          style: {
            width: 1.5,
            'line-color': '#EF4444',
            'line-style': 'dotted',
            'target-arrow-color': '#EF4444',
            'target-arrow-shape': 'diamond',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: getLayoutConfig(currentLayout),
      wheelSensitivity: 0.3,
    });

    // Event handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      const agentData = node.data();
      const agent = filteredAgents.find((a) => a.id === agentData.id);
      if (agent) {
        setSelectedNode(agent);
        onNodeClick?.(agent);
      }
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;
    setIsLoading(false);

    return () => {
      cy.destroy();
    };
  }, [filteredAgents, buildGraphData, currentLayout, onNodeClick]);

  // Layout configuration
  function getLayoutConfig(layoutType: string) {
    switch (layoutType) {
      case 'hierarchical':
        return {
          name: 'breadthfirst',
          directed: true,
          padding: 50,
          spacingFactor: 1.5,
          roots: filteredAgents.filter((a) => a.level === 'L1').map((a) => `#${a.id}`),
        };
      case 'cose':
        return {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20,
          padding: 30,
          animate: true,
        };
      case 'circle':
        return {
          name: 'circle',
          padding: 50,
          avoidOverlap: true,
        };
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          directed: true,
          padding: 50,
        };
      default:
        return { name: 'grid', padding: 30 };
    }
  }

  // Control functions
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  const handleExport = () => {
    if (!cyRef.current) return;
    const png = cyRef.current.png({ scale: 2, bg: 'white' });
    const link = document.createElement('a');
    link.href = png;
    link.download = 'agent-network.png';
    link.click();
  };

  const handleLayoutChange = (newLayout: string) => {
    setCurrentLayout(newLayout as typeof currentLayout);
    if (cyRef.current) {
      cyRef.current.layout(getLayoutConfig(newLayout)).run();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Agent Network Graph</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={currentLayout} onValueChange={handleLayoutChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="cose">Force-Directed</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="breadthfirst">Breadth-First</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleFit}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showLegend && (
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {Object.entries(LEVEL_COLORS).map(([level, color]) => (
                <Badge
                  key={level}
                  variant="outline"
                  style={{ borderColor: color, color: color }}
                  className="text-xs"
                >
                  {level}: {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}
                </Badge>
              ))}
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>--- Hierarchy</span>
              <span className="text-blue-500">- - Delegation</span>
              <span className="text-red-500">&middot;&middot;&middot; Escalation</span>
            </div>
          </div>
        )}

        <div className="relative border rounded-lg bg-white dark:bg-gray-950">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={containerRef} style={{ height: `${height}px`, width: '100%' }} />

          {filteredAgents.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No agents to display
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge style={{ backgroundColor: LEVEL_COLORS[selectedNode.level] }}>
                {selectedNode.level}
              </Badge>
              <span className="font-semibold">{selectedNode.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Slug: {selectedNode.slug}</div>
              <div>Function: {selectedNode.function_name || 'N/A'}</div>
              <div>Department: {selectedNode.department_name || 'N/A'}</div>
              <div>Status: {selectedNode.status || 'active'}</div>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground text-right">
          Showing {filteredAgents.length} agents
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentNetworkGraph;
