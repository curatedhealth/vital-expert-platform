'use client';

/**
 * useAgentHierarchy Hook
 *
 * Computes agent hierarchy nodes and edges for React Flow visualization
 * Extracted from agents/[slug]/page.tsx
 */

import { useState, useEffect, useMemo } from 'react';
import { type Node, type Edge, MarkerType } from 'reactflow';
import { type Agent } from '@/lib/stores/agents-store';

// 5-Level Agent Hierarchy Configuration
export const agentLevelConfig = {
  1: { label: 'L1 Master', color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900 border-purple-400', description: 'Top-level orchestrator' },
  2: { label: 'L2 Expert', color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-300', description: 'Deep domain specialist' },
  3: { label: 'L3 Specialist', color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300', description: 'Focused sub-domain expert' },
  4: { label: 'L4 Worker', color: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-300', description: 'Task execution agent' },
  5: { label: 'L5 Tool', color: 'bg-gradient-to-r from-gray-50 to-slate-50 text-neutral-700 border-neutral-300', description: 'API/Tool wrapper' },
};

// Level colors for React Flow nodes
export const LEVEL_COLORS: Record<number, {
  bg: string;
  bgGradient: string;
  border: string;
  text: string;
  glow: string;
  icon: string;
}> = {
  1: {
    bg: '#FEF3C7',
    bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    border: '#F59E0B',
    text: '#92400E',
    glow: 'rgba(245, 158, 11, 0.3)',
    icon: '👑'
  },
  2: {
    bg: '#DBEAFE',
    bgGradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    border: '#3B82F6',
    text: '#1E40AF',
    glow: 'rgba(59, 130, 246, 0.3)',
    icon: '🎯'
  },
  3: {
    bg: '#E0E7FF',
    bgGradient: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    border: '#6366F1',
    text: '#3730A3',
    glow: 'rgba(99, 102, 241, 0.3)',
    icon: '⚡'
  },
  4: {
    bg: '#D1FAE5',
    bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    border: '#10B981',
    text: '#065F46',
    glow: 'rgba(16, 185, 129, 0.3)',
    icon: '🔧'
  },
  5: {
    bg: '#F3E8FF',
    bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    border: '#A855F7',
    text: '#6B21A8',
    glow: 'rgba(168, 85, 247, 0.3)',
    icon: '🔌'
  },
};

// Relationship type configurations
export const RELATIONSHIP_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  'escalates to': { color: '#F59E0B', label: 'Escalates To', icon: '↑' },
  'delegates to': { color: '#10B981', label: 'Delegates To', icon: '↓' },
  'peer': { color: '#6366F1', label: 'Collaborates With', icon: '↔' },
};

type HierarchyView = 'tree' | 'escalation' | 'peers';

interface UseAgentHierarchyResult {
  nodes: Node[];
  edges: Edge[];
  hierarchyView: HierarchyView;
  setHierarchyView: (view: HierarchyView) => void;
}

/**
 * Hook for computing agent hierarchy nodes and edges
 */
export function useAgentHierarchy(
  agent: Agent | null,
  allAgents: Agent[]
): UseAgentHierarchyResult {
  const [hierarchyView, setHierarchyView] = useState<HierarchyView>('tree');

  const { nodes, edges } = useMemo(() => {
    if (!agent) {
      return { nodes: [], edges: [] };
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const agentLevel = agent.tier || 2;

    // Layout constants
    const CENTER_X = 400;
    const CENTER_Y = 280;
    const VERTICAL_SPACING = 180;
    const HORIZONTAL_SPACING = 280;
    const NODE_WIDTH = 220;

    // Current agent node (center)
    newNodes.push({
      id: agent.id,
      type: 'agent',
      position: { x: CENTER_X - NODE_WIDTH / 2, y: CENTER_Y },
      data: {
        label: agent.display_name || agent.name,
        avatar: agent.avatar,
        level: agentLevel,
        levelName: agentLevelConfig[agentLevel as keyof typeof agentLevelConfig]?.label.split(' ')[1] || 'Expert',
        isCurrentAgent: true,
      },
    });

    // Build hierarchy based on view type
    if (hierarchyView === 'tree' || hierarchyView === 'escalation') {
      // Higher level agents
      const higherLevelAgents = allAgents.filter(
        (a) =>
          a.id !== agent.id &&
          (a.tier || 2) < agentLevel &&
          (a.function_name === agent.function_name || a.department === agent.department)
      );

      const higherCount = Math.min(higherLevelAgents.length, 2);
      const higherStartX = CENTER_X - ((higherCount - 1) * HORIZONTAL_SPACING) / 2 - NODE_WIDTH / 2;

      higherLevelAgents.slice(0, 2).forEach((higher, idx) => {
        const higherId = higher.id;
        newNodes.push({
          id: higherId,
          type: 'agent',
          position: { x: higherStartX + idx * HORIZONTAL_SPACING, y: CENTER_Y - VERTICAL_SPACING },
          data: {
            label: higher.display_name || higher.name,
            avatar: higher.avatar,
            level: higher.tier || 1,
            levelName: agentLevelConfig[(higher.tier || 1) as keyof typeof agentLevelConfig]?.label.split(' ')[1] || 'Master',
            relationshipType: 'escalates to',
          },
        });

        newEdges.push({
          id: `edge-${agent.id}-${higherId}`,
          source: agent.id,
          target: higherId,
          type: 'smoothstep',
          animated: true,
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          labelStyle: { fill: '#F59E0B', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#FEF3C7', stroke: '#F59E0B', strokeWidth: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B', width: 20, height: 20 },
          style: { stroke: '#F59E0B', strokeWidth: 2 },
        });
      });

      // Lower level agents
      const lowerLevelAgents = allAgents.filter(
        (a) =>
          a.id !== agent.id &&
          (a.tier || 2) > agentLevel &&
          (a.function_name === agent.function_name || a.department === agent.department)
      );

      const lowerCount = Math.min(lowerLevelAgents.length, 3);
      const lowerStartX = CENTER_X - ((lowerCount - 1) * HORIZONTAL_SPACING) / 2 - NODE_WIDTH / 2;

      lowerLevelAgents.slice(0, 3).forEach((lower, idx) => {
        const lowerId = lower.id;
        newNodes.push({
          id: lowerId,
          type: 'agent',
          position: { x: lowerStartX + idx * HORIZONTAL_SPACING, y: CENTER_Y + VERTICAL_SPACING },
          data: {
            label: lower.display_name || lower.name,
            avatar: lower.avatar,
            level: lower.tier || 4,
            levelName: agentLevelConfig[(lower.tier || 4) as keyof typeof agentLevelConfig]?.label.split(' ')[1] || 'Worker',
            relationshipType: 'delegates to',
          },
        });

        newEdges.push({
          id: `edge-${agent.id}-${lowerId}`,
          source: agent.id,
          target: lowerId,
          type: 'smoothstep',
          animated: false,
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          labelStyle: { fill: '#10B981', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#D1FAE5', stroke: '#10B981', strokeWidth: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981', width: 20, height: 20 },
          style: { stroke: '#10B981', strokeWidth: 2 },
        });
      });
    }

    // Peer agents
    if (hierarchyView === 'peers' || hierarchyView === 'tree') {
      const peerAgents = allAgents.filter(
        (a) =>
          a.id !== agent.id &&
          (a.tier || 2) === agentLevel &&
          (a.function_name === agent.function_name || a.department === agent.department)
      );

      const peerCount = Math.min(peerAgents.length, 3);

      peerAgents.slice(0, 3).forEach((peer, idx) => {
        const peerId = peer.id;
        let xPos: number;
        let yPos: number;

        if (hierarchyView === 'peers') {
          const peerStartX = CENTER_X - ((peerCount - 1) * HORIZONTAL_SPACING) / 2 - NODE_WIDTH / 2;
          xPos = peerStartX + idx * HORIZONTAL_SPACING;
          yPos = CENTER_Y;
        } else {
          xPos = CENTER_X + HORIZONTAL_SPACING + 60;
          yPos = CENTER_Y - 80 + idx * 100;
        }

        newNodes.push({
          id: peerId,
          type: 'agent',
          position: { x: xPos, y: yPos },
          data: {
            label: peer.display_name || peer.name,
            avatar: peer.avatar,
            level: peer.tier || 2,
            levelName: 'Peer',
            relationshipType: 'peer',
          },
        });

        newEdges.push({
          id: `edge-peer-${agent.id}-${peerId}`,
          source: agent.id,
          target: peerId,
          type: 'straight',
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          style: {
            stroke: '#6366F1',
            strokeWidth: 2,
            strokeDasharray: '5,5',
          },
        });
      });
    }

    return { nodes: newNodes, edges: newEdges };
  }, [agent, allAgents, hierarchyView]);

  return {
    nodes,
    edges,
    hierarchyView,
    setHierarchyView,
  };
}
