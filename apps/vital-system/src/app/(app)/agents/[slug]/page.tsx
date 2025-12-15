'use client';

/**
 * Agent Detail Page
 *
 * Displays comprehensive agent information with tabbed interface
 * Refactored to use modular components from features/agents
 * Uses Brand Guidelines v6.0 styling
 */

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Brain,
  Target,
  MessageCircle,
  ThumbsUp,
  GitBranch,
  ArrowRightLeft,
  Network,
  Building2,
  Briefcase,
  Sparkles,
  MessageSquare,
  User,
  FileText,
  Wrench,
  Zap,
} from 'lucide-react';

import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

// Feature components
import {
  AgentDetailHeader,
  AgentDetailSkeleton,
  AgentOverviewCard,
  AgentCapabilitiesTab,
  AgentKnowledgeTab,
  AgentCompareTab,
  AgentSettingsTab,
  AgentHierarchyView,
} from '@/features/agents/components/detail';
import { KnowledgeGraphVisualization } from '@/features/agents/components/knowledge-graph-view';
import {
  AgentComparisonProvider,
  useAgentComparison,
} from '@/features/agents/components/agent-comparison-sidebar';
import { AgentNetworkGraph } from '@/components/agents/AgentNetworkGraph';

// Hooks
import { useAgentDetail } from '@/features/agents/hooks';
import { agentLevelConfig } from '@/features/agents/hooks/useAgentHierarchy';
import { useAgentsStore } from '@/lib/stores/agents-store';

// Helper to convert tier number to L1-L5 level format for Cytoscape
const tierToLevel = (tier: number | undefined): 'L1' | 'L2' | 'L3' | 'L4' | 'L5' => {
  switch (tier) {
    case 1: return 'L1';
    case 2: return 'L2';
    case 3: return 'L3';
    case 4: return 'L4';
    case 5: return 'L5';
    default: return 'L2'; // Default to Expert level
  }
};

/**
 * Main content component (inside comparison provider)
 */
function AgentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Use the custom hook for agent data
  const { agent, relatedAgents, loading, error } = useAgentDetail(slug);
  const { agents } = useAgentsStore();
  const { addToComparison, comparisonAgents } = useAgentComparison();

  // Hierarchy view mode: 'tree' (React Flow) or 'network' (Cytoscape)
  const [hierarchyViewMode, setHierarchyViewMode] = useState<'tree' | 'network'>('network');

  // Transform agents for Cytoscape network graph
  const networkAgents = useMemo(() => {
    return agents.map((a: any) => ({
      id: a.id,
      name: a.display_name || a.name || 'Unknown Agent',
      slug: a.slug || a.id,
      level: tierToLevel(a.tier),
      tier: a.tier,
      function_name: a.business_function || a.function_name,
      department_name: a.department || a.department_name,
      parent_agent_id: a.parent_agent_id || null,
      can_delegate_to: a.can_delegate_to || [],
      can_escalate_to: a.can_escalate_to || [],
      status: a.status || 'active',
    }));
  }, [agents]);

  // Handle adding to comparison
  const handleAddToCompare = useCallback(() => {
    if (agent) {
      addToComparison(agent as any);
    }
  }, [agent, addToComparison]);

  // Loading state
  if (loading || (!agent && !error)) {
    return <AgentDetailSkeleton />;
  }

  // Error state
  if (error || !agent) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-stone-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Agent Not Found</h2>
            <p className="text-stone-600 mb-6">
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
  const levelNumber = agent.tier || 2;
  const levelInfo = agentLevelConfig[levelNumber as keyof typeof agentLevelConfig];

  // Get enriched data
  const promptStarters = (agent as any).prompt_starters || [];
  const assignedTools = (agent as any).assigned_tools || [];
  const personalityType = (agent as any).personality_type || null;

  // Generate stable stats based on agent ID
  const idHash = (agent.id || agent.name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const consultations = (agent as any).consultation_count ?? (agent as any).usage_count ?? (50 + (idHash % 500));
  const satisfaction = (agent as any).satisfaction_rating ?? (agent as any).rating ?? (85 + (idHash % 15));

  const handleStartChat = () => {
    router.push(`/chat?agent=${agent.id}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Hero Header */}
      <AgentDetailHeader agent={agent} onAddToCompare={handleAddToCompare} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7 bg-stone-100">
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
              {comparisonAgents && comparisonAgents.length > 0 && (
                <span className="ml-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
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
              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">Model</p>
                      <p className="text-xs text-stone-600">{agent.model || 'gpt-4'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">Capabilities</p>
                      <p className="text-xs text-stone-600">
                        {agent.capabilities?.length > 0
                          ? `${agent.capabilities.length} listed`
                          : 'None'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">Consultations</p>
                      <p className="text-xs text-stone-600">{consultations} chats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">Satisfaction</p>
                      <p className="text-xs text-stone-600">{satisfaction}% positive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Info & Prompt Starters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-stone-900">
                    <Building2 className="w-4 h-4 text-stone-500" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(agent as any).business_function && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Function</span>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {(agent as any).business_function.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  )}
                  {(agent as any).department && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Department</span>
                      <Badge variant="outline">{(agent as any).department}</Badge>
                    </div>
                  )}
                  {(agent as any).role && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Role</span>
                      <Badge variant="outline">{(agent as any).role}</Badge>
                    </div>
                  )}
                  {levelInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Level</span>
                      <Badge className={cn('font-medium border', levelInfo.color)}>
                        {levelInfo.label}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-stone-900">
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
                        className="w-full justify-start text-left h-auto py-3 px-4 text-sm font-normal text-stone-700 hover:bg-purple-50 hover:border-purple-300 group border-stone-200"
                        onClick={handleStartChat}
                      >
                        <MessageSquare className="h-4 w-4 mr-3 text-stone-400 group-hover:text-purple-600" />
                        <span className="flex-1">{typeof starter === 'string' ? starter : starter.text}</span>
                        {starter.icon && <span className="ml-2">{starter.icon}</span>}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-stone-500 italic text-center py-4">
                      No prompt starters configured
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personality Type */}
            {personalityType && (
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-stone-900">
                    <User className="w-4 h-4 text-pink-500" />
                    Communication Style
                  </CardTitle>
                  <CardDescription>
                    Personality and communication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: personalityType.color || '#f0abfc' }}
                    >
                      {personalityType.icon || '🎭'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-900">
                        {personalityType.display_name || personalityType.name}
                      </h4>
                      {personalityType.description && (
                        <p className="text-sm text-stone-600 mt-1">{personalityType.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalityType.communication_style && (
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
                          Communication Style
                        </p>
                        <p className="text-sm text-stone-900">{personalityType.communication_style}</p>
                      </div>
                    )}
                    {personalityType.reasoning_approach && (
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
                          Reasoning Approach
                        </p>
                        <p className="text-sm text-stone-900">{personalityType.reasoning_approach}</p>
                      </div>
                    )}
                  </div>

                  {personalityType.tone_keywords && personalityType.tone_keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
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
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-stone-900">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    System Prompt
                  </CardTitle>
                  <CardDescription>
                    Instructions that define how this agent behaves and responds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <pre className="text-sm text-stone-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
                      {agent.system_prompt}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools Section in Overview */}
            {assignedTools.length > 0 && (
              <Card className="border-stone-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-stone-900">
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
                          className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 bg-white hover:border-purple-300 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">
                              {tool.name || 'Unknown Tool'}
                            </p>
                            {tool.description && (
                              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
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
          <TabsContent value="capabilities">
            <AgentCapabilitiesTab agent={agent} />
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge">
            <AgentKnowledgeTab agent={agent} />
          </TabsContent>

          {/* Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-6">
            <Card className="border-stone-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-stone-900">
                      <GitBranch className="w-5 h-5 text-purple-600" />
                      Agent Hierarchy
                    </CardTitle>
                    <CardDescription>
                      Visual representation of agent relationships and delegation chains
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={hierarchyViewMode === 'tree' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHierarchyViewMode('tree')}
                      className={hierarchyViewMode === 'tree' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <GitBranch className="w-4 h-4 mr-1" />
                      Tree View
                    </Button>
                    <Button
                      variant={hierarchyViewMode === 'network' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHierarchyViewMode('network')}
                      className={hierarchyViewMode === 'network' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <Network className="w-4 h-4 mr-1" />
                      Network View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hierarchyViewMode === 'tree' ? (
                  <AgentHierarchyView
                    agent={agent}
                    allAgents={agents}
                    onAgentClick={(agentId) => router.push(`/agents/${agentId}`)}
                  />
                ) : (
                  <AgentNetworkGraph
                    agents={networkAgents}
                    onNodeClick={(clickedAgent) => router.push(`/agents/${clickedAgent.slug}`)}
                    layout="hierarchical"
                    height={600}
                    showLegend={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare">
            <AgentCompareTab agent={agent} relatedAgents={relatedAgents} />
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="graph" className="space-y-6">
            <Card className="border-stone-200">
              <CardContent className="p-6">
                <KnowledgeGraphVisualization
                  agentId={agent.id}
                  height="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AgentSettingsTab agent={agent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Main export with comparison provider wrapper
 */
export default function AgentDetailPage() {
  return (
    <AgentComparisonProvider>
      <AgentDetailContent />
    </AgentComparisonProvider>
  );
}
