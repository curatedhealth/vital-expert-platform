'use client';

/**
 * AgentHierarchyView - React Flow Hierarchy Visualization
 *
 * Displays agent relationships in an interactive graph
 * Uses Brand Guidelines v6.0 styling
 */

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@vital/ui';
import { ChevronUp, ChevronDown, Users } from 'lucide-react';
import { useEffect } from 'react';
import { type Agent } from '@/lib/stores/agents-store';
import { useAgentHierarchy } from '../../hooks/useAgentHierarchy';
import { agentNodeTypes } from './AgentHierarchyNode';

interface AgentHierarchyViewProps {
  agent: Agent;
  allAgents: Agent[];
  onAgentClick?: (agentId: string) => void;
  className?: string;
}

export function AgentHierarchyView({
  agent,
  allAgents,
  onAgentClick,
  className,
}: AgentHierarchyViewProps) {
  const {
    nodes: hierarchyNodes,
    edges: hierarchyEdges,
    hierarchyView,
    setHierarchyView,
  } = useAgentHierarchy(agent, allAgents);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync hierarchy data to React Flow state
  useEffect(() => {
    setNodes(hierarchyNodes);
    setEdges(hierarchyEdges);
  }, [hierarchyNodes, hierarchyEdges, setNodes, setEdges]);

  const handleNodeClick = (_: any, node: any) => {
    if (onAgentClick && node.id !== agent.id) {
      onAgentClick(node.id);
    }
  };

  return (
    <div className={className}>
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-stone-600">View:</span>
        <div className="flex rounded-lg border border-stone-200 overflow-hidden">
          <Button
            variant={hierarchyView === 'tree' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setHierarchyView('tree')}
            className="rounded-none border-r border-stone-200"
          >
            Full Tree
          </Button>
          <Button
            variant={hierarchyView === 'escalation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setHierarchyView('escalation')}
            className="rounded-none border-r border-stone-200"
          >
            <ChevronUp className="w-4 h-4 mr-1" />
            Escalation
          </Button>
          <Button
            variant={hierarchyView === 'peers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setHierarchyView('peers')}
            className="rounded-none"
          >
            <Users className="w-4 h-4 mr-1" />
            Peers
          </Button>
        </div>
      </div>

      {/* React Flow Graph */}
      <div className="h-[500px] bg-stone-50 rounded-lg border border-stone-200">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={agentNodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#e7e5e4" gap={16} />
          <Controls className="bg-white border border-stone-200 rounded-lg" />
          <MiniMap
            nodeColor={(node) => {
              const level = node.data?.level || 2;
              const colors: Record<number, string> = {
                1: '#F59E0B',
                2: '#3B82F6',
                3: '#6366F1',
                4: '#10B981',
                5: '#A855F7',
              };
              return colors[level] || '#9CA3AF';
            }}
            maskColor="rgba(255, 255, 255, 0.8)"
            className="bg-white border border-stone-200 rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>L1 Master</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>L2 Expert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>L3 Specialist</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>L4 Worker</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>L5 Tool</span>
        </div>
      </div>
    </div>
  );
}
