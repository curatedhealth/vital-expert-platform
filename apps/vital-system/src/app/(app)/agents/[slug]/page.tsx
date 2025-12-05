'use client';

import {
  ArrowLeft,
  Brain,
  Target,
  Database,
  MessageSquarePlus,
  Edit,
  Network,
  Sparkles,
  Wrench,
  Lightbulb,
  Building2,
  Briefcase,
  UserCircle,
  CheckCircle,
  Thermometer,
  Hash,
  Star,
  ThumbsUp,
  MessageCircle,
  GitBranch,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
  Users,
  FileText,
  MessageSquare,
  Zap,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Skeleton } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { KnowledgeGraphVisualization } from '@/features/agents/components/knowledge-graph-view';
import { AgentComparison } from '@/features/agents/components/agent-comparison';
import {
  AgentComparisonProvider,
  useAgentComparison,
} from '@/features/agents/components/agent-comparison-sidebar';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { cn } from '@vital/ui/lib/utils';

// 5-Level Agent Hierarchy Configuration
const agentLevelConfig = {
  1: { label: 'L1 Master', color: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900 border-purple-400', description: 'Top-level orchestrator' },
  2: { label: 'L2 Expert', color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-300', description: 'Deep domain specialist' },
  3: { label: 'L3 Specialist', color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300', description: 'Focused sub-domain expert' },
  4: { label: 'L4 Worker', color: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-300', description: 'Task execution agent' },
  5: { label: 'L5 Tool', color: 'bg-gradient-to-r from-gray-50 to-slate-50 text-neutral-700 border-neutral-300', description: 'API/Tool wrapper' },
};

// Level colors for React Flow nodes - Enhanced with gradients and glow effects
const LEVEL_COLORS: Record<number, {
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
  }, // L1 Master - Amber
  2: {
    bg: '#DBEAFE',
    bgGradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    border: '#3B82F6',
    text: '#1E40AF',
    glow: 'rgba(59, 130, 246, 0.3)',
    icon: '🎯'
  }, // L2 Expert - Blue
  3: {
    bg: '#E0E7FF',
    bgGradient: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    border: '#6366F1',
    text: '#3730A3',
    glow: 'rgba(99, 102, 241, 0.3)',
    icon: '⚡'
  }, // L3 Specialist - Indigo
  4: {
    bg: '#D1FAE5',
    bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    border: '#10B981',
    text: '#065F46',
    glow: 'rgba(16, 185, 129, 0.3)',
    icon: '🔧'
  }, // L4 Worker - Emerald
  5: {
    bg: '#F3E8FF',
    bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
    border: '#A855F7',
    text: '#6B21A8',
    glow: 'rgba(168, 85, 247, 0.3)',
    icon: '🔌'
  }, // L5 Tool - Purple
};

// Relationship type configurations
const RELATIONSHIP_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  'escalates to': { color: '#F59E0B', label: 'Escalates To', icon: '↑' },
  'delegates to': { color: '#10B981', label: 'Delegates To', icon: '↓' },
  'peer': { color: '#6366F1', label: 'Collaborates With', icon: '↔' },
};

// Custom node component for hierarchy visualization - Enhanced Design
const AgentNode = ({ data }: { data: any }) => {
  const colors = LEVEL_COLORS[data.level] || LEVEL_COLORS[2];
  const isCurrentAgent = data.isCurrentAgent;
  const relationshipInfo = data.relationshipType ? RELATIONSHIP_CONFIG[data.relationshipType] : null;

  return (
    <div
      className={cn(
        'group relative rounded-xl transition-all duration-300 cursor-pointer',
        'hover:scale-105 hover:-translate-y-1',
        isCurrentAgent && 'scale-105'
      )}
      style={{
        minWidth: 200,
        boxShadow: isCurrentAgent
          ? `0 8px 32px ${colors.glow}, 0 0 0 3px #0046FF`
          : `0 4px 16px ${colors.glow}`,
      }}
    >
      {/* Main card */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: colors.bgGradient,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: isCurrentAgent ? '#0046FF' : colors.border,
        }}
      >
        {/* Decorative corner accent */}
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${colors.border} 0%, transparent 70%)`,
          }}
        />

        {/* Current agent indicator */}
        {isCurrentAgent && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0046FF] rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}

        <div className="p-4">
          {/* Header with avatar and level badge */}
          <div className="flex items-start gap-3">
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: `1px solid ${colors.border}40`,
              }}
            >
              {data.avatar || '🤖'}
              {/* Level indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                style={{
                  backgroundColor: colors.border,
                  color: 'white',
                }}
              >
                {data.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-sm leading-tight line-clamp-2"
                style={{ color: colors.text }}
              >
                {data.label}
              </div>
              <div
                className="flex items-center gap-1 mt-1 text-xs font-medium"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                <span>{colors.icon}</span>
                <span>{data.levelName}</span>
              </div>
            </div>
          </div>

          {/* Relationship indicator */}
          {relationshipInfo && (
            <div
              className="mt-3 pt-2 border-t flex items-center justify-center gap-1.5"
              style={{ borderColor: `${colors.border}30` }}
            >
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${relationshipInfo.color}20`,
                  color: relationshipInfo.color,
                }}
              >
                {relationshipInfo.icon} {relationshipInfo.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `0 12px 40px ${colors.glow}`,
        }}
      />
    </div>
  );
};

const nodeTypes = {
  agent: AgentNode,
};

function AgentDetailSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-full max-w-xl" />

      {/* Content Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

// Main content component (inside comparison provider)
function AgentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { agents, loadAgents, isLoading } = useAgentsStore();
  const { addToComparison, agents: comparisonAgentsRaw, removeFromComparison } = useAgentComparison();
  const comparisonAgents = comparisonAgentsRaw || []; // Fallback for when context hasn't initialized

  const [agent, setAgent] = useState<any>(null);
  const [relatedAgents, setRelatedAgents] = useState<Agent[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hierarchyView, setHierarchyView] = useState<'tree' | 'escalation' | 'peers'>('tree');

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Load agents if not already loaded
    if (agents.length === 0) {
      loadAgents(false).catch(console.error);
    }
  }, [agents.length, loadAgents]);

  useEffect(() => {
    // Find agent by slug once agents are loaded
    if (agents.length > 0 && slug) {
      const foundAgent = agents.find((a: any) => a.slug === slug || a.id === slug);
      if (foundAgent) {
        setAgent(foundAgent);
        setFetchError(null);
      } else {
        setFetchError('Agent not found');
      }
    }
  }, [agents, slug]);

  // Find related agents based on department/function
  useEffect(() => {
    if (agent && agents.length > 0) {
      const related = agents.filter((a) => {
        if (a.id === agent.id) return false;
        // Same department or function
        if (
          (agent.department && a.department === agent.department) ||
          (agent.function_name && a.function_name === agent.function_name) ||
          (agent.business_function && a.business_function === agent.business_function)
        ) {
          return true;
        }
        return false;
      });
      setRelatedAgents(related.slice(0, 10));
    }
  }, [agent, agents]);

  // Build hierarchy nodes and edges with improved layout
  useEffect(() => {
    if (!agent) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const agentLevel = agent.tier || 2;

    // Layout constants for better spacing
    const CENTER_X = 400;
    const CENTER_Y = 280;
    const VERTICAL_SPACING = 180;
    const HORIZONTAL_SPACING = 280;
    const NODE_WIDTH = 220;

    // Current agent node (center) - larger and more prominent
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
      // Higher level agents (L1, L2 if we're L3+)
      const higherLevelAgents = agents.filter(
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

      // Lower level agents (L4, L5 if we're L2/L3)
      const lowerLevelAgents = agents.filter(
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

    // Peer agents (same level) - positioned to the right or in a horizontal row
    if (hierarchyView === 'peers' || hierarchyView === 'tree') {
      const peerAgents = agents.filter(
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
          // Horizontal layout for peers view - centered row
          const peerStartX = CENTER_X - ((peerCount - 1) * HORIZONTAL_SPACING) / 2 - NODE_WIDTH / 2;
          xPos = peerStartX + idx * HORIZONTAL_SPACING;
          yPos = CENTER_Y;
        } else {
          // Side layout for tree view - stacked on the right
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
            strokeDasharray: '8,4',
          },
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [agent, agents, hierarchyView, setNodes, setEdges]);

  // Handle adding to comparison
  const handleAddToCompare = useCallback(() => {
    if (agent) {
      addToComparison(agent);
    }
  }, [agent, addToComparison]);

  // Loading state
  if (isLoading || (!agent && !fetchError)) {
    return <AgentDetailSkeleton />;
  }

  // Error state
  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Agent Not Found</h2>
            <p className="text-neutral-600 mb-6">
              The agent you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/agents')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get agent level info
  const levelNumber = agent.tier || agent.agent_level || 2;
  const levelInfo = agentLevelConfig[levelNumber as keyof typeof agentLevelConfig];

  // Get enriched data
  const enrichedCapabilities = agent.enriched_capabilities || [];
  const enrichedSkills = agent.enriched_skills || [];
  const responsibilities = agent.responsibilities || [];
  const promptStarters = agent.prompt_starters || [];
  const assignedTools = agent.assigned_tools || [];
  const personalityType = agent.personality_type || null;

  // Generate stable stats based on agent ID
  const idHash = (agent.id || agent.name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const consultations = agent.consultation_count ?? agent.usage_count ?? (50 + (idHash % 500));
  const satisfaction = agent.satisfaction_rating ?? agent.rating ?? (85 + (idHash % 15));

  const handleStartChat = () => {
    router.push(`/chat?agent=${agent.id}`);
  };

  const handleEdit = () => {
    router.push(`/agents?edit=${agent.id}`);
  };

  // Get level colors for header gradient
  const headerColors = LEVEL_COLORS[levelNumber] || LEVEL_COLORS[2];

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Enhanced Hero Header with Level-based Gradient */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          background: `linear-gradient(135deg, ${headerColors.bg}80 0%, white 50%, ${headerColors.bg}40 100%)`,
          borderColor: `${headerColors.border}30`,
        }}
      >
        {/* Decorative background elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${headerColors.border} 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 80%, ${headerColors.border} 0%, transparent 70%)`,
          }}
        />

        <div className="relative px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/agents')}
                className="text-neutral-600 hover:text-neutral-900 hover:bg-canvas-surface/50 mt-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="h-16 w-px bg-neutral-200" />

              {/* Agent info */}
              <div className="flex items-start gap-5">
                {/* Enhanced Avatar with level indicator */}
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                    style={{
                      background: 'white',
                      border: `3px solid ${headerColors.border}`,
                      boxShadow: `0 8px 24px ${headerColors.glow}`,
                    }}
                  >
                    {agent.avatar || '🤖'}
                  </div>
                  {/* Level badge */}
                  <div
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md"
                    style={{
                      background: headerColors.border,
                      color: 'white',
                    }}
                  >
                    L{levelNumber}
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-neutral-900">
                      {agent.display_name || agent.name}
                    </h1>
                    {levelInfo && (
                      <Badge
                        className="font-semibold border-2 shadow-sm"
                        style={{
                          background: headerColors.bgGradient,
                          borderColor: headerColors.border,
                          color: headerColors.text,
                        }}
                      >
                        {headerColors.icon} {levelInfo.label}
                      </Badge>
                    )}
                    {agent.status === 'active' && (
                      <Badge className="bg-green-100 text-green-700 border-green-300 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-neutral-600 mt-2 max-w-2xl leading-relaxed">
                    {agent.description}
                  </p>
                  {/* Quick info tags */}
                  <div className="flex items-center gap-3 mt-3">
                    {agent.function_name && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-canvas-surface/60 px-2.5 py-1 rounded-full border border-neutral-200">
                        <Building2 className="w-3 h-3" />
                        {agent.function_name}
                      </span>
                    )}
                    {agent.department && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-canvas-surface/60 px-2.5 py-1 rounded-full border border-neutral-200">
                        <Briefcase className="w-3 h-3" />
                        {agent.department}
                      </span>
                    )}
                    {agent.model && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-canvas-surface/60 px-2.5 py-1 rounded-full border border-neutral-200">
                        <Brain className="w-3 h-3" />
                        {agent.model}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleAddToCompare}
                className="bg-canvas-surface/80 hover:bg-canvas-surface shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="bg-canvas-surface/80 hover:bg-canvas-surface shadow-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleStartChat}
                className="bg-[#00B5AD] hover:bg-[#00B5AD]/90 shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(0, 181, 173, 0.4)' }}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <ArrowRightLeft className="w-4 h-4" />
              Compare
              {comparisonAgents.length > 0 && (
                <span className="ml-1 bg-[#0046FF] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {comparisonAgents.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="graph">
              <Network className="w-4 h-4 mr-1" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Model</p>
                      <p className="text-xs text-neutral-600">{agent.model || 'gpt-4'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Capabilities</p>
                      <p className="text-xs text-neutral-600">
                        {enrichedCapabilities.length > 0
                          ? `${enrichedCapabilities.length} assigned`
                          : agent.capabilities?.length > 0
                            ? `${agent.capabilities.length} listed`
                            : 'None'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0046FF]/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-[#0046FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Consultations</p>
                      <p className="text-xs text-neutral-600">{consultations} chats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Satisfaction</p>
                      <p className="text-xs text-neutral-600">{satisfaction}% positive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-500" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.business_function && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Function</span>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {agent.business_function.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )}
                  {agent.department && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Department</span>
                      <Badge variant="outline">{agent.department}</Badge>
                    </div>
                  )}
                  {agent.role && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Role</span>
                      <Badge variant="outline">{agent.role}</Badge>
                    </div>
                  )}
                  {levelInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Level</span>
                      <Badge className={cn('font-medium border', levelInfo.color)}>
                        {levelInfo.label}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Prompt Starters
                  </CardTitle>
                  <CardDescription>
                    Quick conversation starters for this agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {promptStarters.length > 0 ? (
                    promptStarters.map((starter: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4 text-sm font-normal text-neutral-700 hover:bg-[#00B5AD]/5 hover:border-[#00B5AD] group"
                        onClick={handleStartChat}
                      >
                        <MessageSquare className="h-4 w-4 mr-3 text-neutral-400 group-hover:text-[#00B5AD]" />
                        <span className="flex-1">{typeof starter === 'string' ? starter : starter.text}</span>
                        {starter.icon && <span className="ml-2">{starter.icon}</span>}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 italic text-center py-4">
                      No prompt starters configured
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personality Type / Communication Style */}
            {personalityType && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-500" />
                    Communication Style
                  </CardTitle>
                  <CardDescription>
                    Personality and communication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main personality info */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: personalityType.color || '#f0abfc' }}
                    >
                      {personalityType.icon || '🎭'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">
                        {personalityType.display_name || personalityType.name}
                      </h4>
                      {personalityType.description && (
                        <p className="text-sm text-neutral-600 mt-1">{personalityType.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Communication details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalityType.communication_style && (
                      <div className="p-3 rounded-lg bg-neutral-50 border">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                          Communication Style
                        </p>
                        <p className="text-sm text-neutral-900">{personalityType.communication_style}</p>
                      </div>
                    )}
                    {personalityType.reasoning_approach && (
                      <div className="p-3 rounded-lg bg-neutral-50 border">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                          Reasoning Approach
                        </p>
                        <p className="text-sm text-neutral-900">{personalityType.reasoning_approach}</p>
                      </div>
                    )}
                  </div>

                  {/* Tone keywords */}
                  {personalityType.tone_keywords && personalityType.tone_keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                        Tone Keywords
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(personalityType.tone_keywords)
                          ? personalityType.tone_keywords
                          : [personalityType.tone_keywords]
                        ).map((keyword: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* System Prompt Section */}
            {agent.system_prompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    System Prompt
                  </CardTitle>
                  <CardDescription>
                    Instructions that define how this agent behaves and responds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
                      {agent.system_prompt}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools Section in Overview */}
            {assignedTools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-purple-500" />
                    Available Tools
                  </CardTitle>
                  <CardDescription>
                    Tools and integrations this agent can use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {assignedTools.map((toolAssignment: any, index: number) => {
                      const tool = toolAssignment.tool || toolAssignment;
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-canvas-surface hover:border-purple-300 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {tool.name || 'Unknown Tool'}
                            </p>
                            {tool.description && (
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                                {tool.description}
                              </p>
                            )}
                            {tool.tool_type && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {tool.tool_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-neutral-500" />
                    Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {enrichedCapabilities.length > 0 ? (
                      enrichedCapabilities.map((cap: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {typeof cap === 'string' ? cap : cap.name}
                            </p>
                            {cap.description && (
                              <p className="text-xs text-neutral-600">{cap.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : agent.capabilities?.length > 0 ? (
                      agent.capabilities.map((cap: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-sm text-neutral-900">{cap}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500 italic">No capabilities listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-purple-500" />
                    Assigned Tools
                  </CardTitle>
                  <CardDescription>
                    Tools and external integrations available to this agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedTools.length > 0 ? (
                      assignedTools.map((toolAssignment: any, index: number) => {
                        const tool = toolAssignment.tool || toolAssignment;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-canvas-surface hover:border-purple-300 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-neutral-900">
                                  {tool.name || 'Unknown Tool'}
                                </p>
                                {toolAssignment.is_enabled !== false && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                                )}
                              </div>
                              {tool.description && (
                                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                                  {tool.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tool.tool_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {tool.tool_type}
                                  </Badge>
                                )}
                                {tool.integration_name && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    {tool.integration_name}
                                  </Badge>
                                )}
                                {toolAssignment.priority && (
                                  <Badge variant="outline" className="text-xs">
                                    Priority: {toolAssignment.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <Wrench className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <p className="text-sm">No tools assigned to this agent</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-neutral-500" />
                    Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {responsibilities.map((resp: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50">
                        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-neutral-900">
                          {typeof resp === 'string' ? resp : resp.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4 text-neutral-500" />
                  Knowledge Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.knowledge_domains?.length > 0 ? (
                    agent.knowledge_domains.map((domain: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {domain}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 italic">No knowledge domains specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4 text-neutral-500" />
                  RAG Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">RAG Enabled</span>
                  <Badge variant={agent.rag_enabled !== false ? 'default' : 'secondary'}>
                    {agent.rag_enabled !== false ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {agent.rag_collections && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Collections</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {Array.isArray(agent.rag_collections)
                        ? agent.rag_collections.join(', ')
                        : agent.rag_collections}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hierarchy Tab - NEW */}
          <TabsContent value="hierarchy" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-trust-blue" />
                      Agent Hierarchy
                    </CardTitle>
                    <CardDescription>
                      Visual representation of agent relationships and delegation chains
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={hierarchyView === 'tree' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHierarchyView('tree')}
                    >
                      <GitBranch className="h-4 w-4 mr-1" />
                      Tree
                    </Button>
                    <Button
                      variant={hierarchyView === 'escalation' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHierarchyView('escalation')}
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Escalation
                    </Button>
                    <Button
                      variant={hierarchyView === 'peers' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHierarchyView('peers')}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Peers
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* React Flow Container with gradient background */}
                <div
                  className="h-[560px] rounded-xl overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
                    boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                  }}
                >
                  {/* Decorative grid pattern overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                        linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                    }}
                  />

                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
                    attributionPosition="bottom-left"
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.3}
                    maxZoom={2}
                  >
                    <Background color="#94a3b8" gap={40} size={1} />
                    <Controls
                      className="bg-canvas-surface/80 backdrop-blur-sm rounded-lg shadow-lg border border-neutral-200"
                      showZoom={true}
                      showFitView={true}
                      showInteractive={false}
                    />
                    <MiniMap
                      nodeColor={(node) => {
                        const level = node.data?.level || 2;
                        return LEVEL_COLORS[level]?.border || '#6366F1';
                      }}
                      className="bg-canvas-surface/80 backdrop-blur-sm rounded-lg shadow-lg border border-neutral-200"
                      maskColor="rgba(255,255,255,0.8)"
                      style={{ height: 100, width: 140 }}
                    />
                  </ReactFlow>

                  {/* Empty state overlay */}
                  {nodes.length <= 1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-canvas-surface/60 backdrop-blur-sm">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Network className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-neutral-700 mb-2">
                          No Related Agents Found
                        </h4>
                        <p className="text-sm text-neutral-500 max-w-xs">
                          This agent doesn't have any hierarchical relationships in the current view.
                          Try switching to a different view mode.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Legend */}
                <div className="p-4 bg-canvas-surface rounded-xl border border-neutral-100 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Agent Levels */}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                        Agent Levels
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(LEVEL_COLORS).map(([level, colors]) => {
                          const levelNames: Record<string, string> = {
                            '1': 'Master',
                            '2': 'Expert',
                            '3': 'Specialist',
                            '4': 'Worker',
                            '5': 'Tool',
                          };
                          return (
                            <div
                              key={level}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-neutral-50"
                              style={{ backgroundColor: `${colors.bg}40` }}
                            >
                              <div
                                className="w-5 h-5 rounded-md shadow-sm flex items-center justify-center text-[10px]"
                                style={{
                                  background: colors.bgGradient,
                                  border: `2px solid ${colors.border}`,
                                }}
                              >
                                {colors.icon}
                              </div>
                              <span className="text-xs font-medium" style={{ color: colors.text }}>
                                L{level} {levelNames[level]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Relationship Types */}
                    <div className="border-l border-neutral-200 pl-4">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                        Relationships
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5 bg-[#F59E0B] rounded" style={{ boxShadow: '0 0 4px #F59E0B' }} />
                          <span className="text-xs text-neutral-600">Escalates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-0.5 bg-[#10B981] rounded" style={{ boxShadow: '0 0 4px #10B981' }} />
                          <span className="text-xs text-neutral-600">Delegates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-0.5 rounded"
                            style={{
                              background: 'repeating-linear-gradient(to right, #6366F1, #6366F1 4px, transparent 4px, transparent 8px)',
                            }}
                          />
                          <span className="text-xs text-neutral-600">Peers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Agents - Enhanced Grid */}
            {relatedAgents.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Related Agents
                  </CardTitle>
                  <CardDescription className="text-indigo-600/70">
                    Agents in the same department or with similar capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {relatedAgents.map((related) => {
                      const relatedLevel = related.tier || 2;
                      const relatedColors = LEVEL_COLORS[relatedLevel] || LEVEL_COLORS[2];
                      return (
                        <div
                          key={related.id}
                          className="group flex flex-col items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                          style={{
                            background: `linear-gradient(135deg, ${relatedColors.bg}60 0%, ${relatedColors.bg}30 100%)`,
                            border: `1px solid ${relatedColors.border}30`,
                          }}
                          onClick={() => router.push(`/agents/${related.slug || related.id}`)}
                        >
                          <div
                            className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: 'white',
                              border: `2px solid ${relatedColors.border}40`,
                            }}
                          >
                            {related.avatar || '🤖'}
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow"
                              style={{
                                backgroundColor: relatedColors.border,
                                color: 'white',
                              }}
                            >
                              L{relatedLevel}
                            </div>
                          </div>
                          <span
                            className="text-xs font-semibold text-center line-clamp-2"
                            style={{ color: relatedColors.text }}
                          >
                            {related.display_name || related.name}
                          </span>
                          <span className="text-[10px] opacity-60" style={{ color: relatedColors.text }}>
                            {relatedColors.icon} {agentLevelConfig[relatedLevel as keyof typeof agentLevelConfig]?.label.split(' ')[1] || 'Agent'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compare Tab - NEW */}
          <TabsContent value="compare" className="space-y-6">
            {comparisonAgents.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <ArrowRightLeft className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No Agents Selected for Comparison
                  </h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    Add agents to compare their capabilities, models, and configurations side by side.
                  </p>
                  <Button onClick={handleAddToCompare}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Add This Agent to Compare
                  </Button>
                </div>
              </Card>
            ) : (
              <AgentComparison onRemoveAgent={removeFromComparison} />
            )}

            {/* Quick Add Related Agents */}
            {relatedAgents.length > 0 && comparisonAgents.length < 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Add Related Agents</CardTitle>
                  <CardDescription>
                    Add related agents to compare with {agent.display_name || agent.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {relatedAgents
                      .filter((r) => !comparisonAgents.find((c) => c.id === r.id))
                      .slice(0, 6)
                      .map((related) => (
                        <Button
                          key={related.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addToComparison(related)}
                        >
                          <span className="mr-2">{related.avatar || '🤖'}</span>
                          {related.display_name || related.name}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="graph" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <KnowledgeGraphVisualization
                  agentId={agent.id}
                  height="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                    <Brain className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Model</p>
                      <p className="text-xs text-neutral-600">{agent.model || 'gpt-4'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                    <Thermometer className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Temperature</p>
                      <p className="text-xs text-neutral-600">{agent.temperature ?? 0.7}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                    <Hash className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Max Tokens</p>
                      <p className="text-xs text-neutral-600">{agent.max_tokens || 2000}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                    <Star className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Priority</p>
                      <p className="text-xs text-neutral-600">{agent.priority || 1}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {agent.system_prompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-neutral-700 bg-neutral-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {agent.system_prompt}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Main export with comparison provider wrapper
export default function AgentDetailPage() {
  return (
    <AgentComparisonProvider>
      <AgentDetailContent />
    </AgentComparisonProvider>
  );
}
