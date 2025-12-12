/**
 * Agent Comparison Component
 *
 * Multi-criteria agent comparison with:
 * - AgentOS 5-level hierarchy visualization
 * - Radar chart for multi-dimensional assessment
 * - Side-by-side metrics comparison
 * - Cost/model/capability analysis
 * - GraphRAG similarity integration
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  X,
  Plus,
  GitBranch,
  DollarSign,
  Cpu,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Clock,
  Users,
  Layers,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRightLeft,
  Check,
  Crown,
  Star,
  Wrench,
  Cog,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { Agent, AgentLevelNumber } from '../types/agent.types';
import { AGENT_LEVEL_COLORS, SPAWNING_RULES, type AgentLevel } from '../constants/design-tokens';
import { LevelBadge } from './level-badge';

// ============================================================================
// TYPES
// ============================================================================

export interface ComparisonMetrics {
  relevance: number;      // 0-100: How relevant to user's query
  performance: number;    // 0-100: Historical performance score
  coverage: number;       // 0-100: Domain coverage breadth
  regulatory: number;     // 0-100: Regulatory compliance score
  popularity: number;     // 0-100: Usage frequency
  freshness: number;      // 0-100: How recently updated/validated
}

export interface AgentWithMetrics extends Agent {
  metrics?: ComparisonMetrics;
  similarity_score?: number; // 0-1 from GraphRAG/vector search
}

export interface AgentComparisonProps {
  agents: AgentWithMetrics[];
  onRemoveAgent?: (agentId: string) => void;
  onAddAgent?: () => void;
  onSelectWinner?: (agent: Agent) => void;
  maxAgents?: number;
  showHierarchy?: boolean;
  showSimilarity?: boolean;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Level icons mapping
const LEVEL_ICONS: Record<AgentLevel, React.ComponentType<{ className?: string }>> = {
  1: Crown,   // Master
  2: Star,    // Expert
  3: Shield,  // Specialist
  4: Wrench,  // Worker
  5: Cog,     // Tool
};

// Default metrics when not provided
const DEFAULT_METRICS: ComparisonMetrics = {
  relevance: 75,
  performance: 80,
  coverage: 70,
  regulatory: 85,
  popularity: 60,
  freshness: 90,
};

// Metric labels and descriptions
const METRIC_INFO: Record<keyof ComparisonMetrics, { label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  relevance: { label: 'Relevance', description: 'Match to query intent', icon: Target },
  performance: { label: 'Performance', description: 'Historical accuracy & speed', icon: TrendingUp },
  coverage: { label: 'Coverage', description: 'Domain knowledge breadth', icon: Layers },
  regulatory: { label: 'Compliance', description: 'Regulatory adherence', icon: Shield },
  popularity: { label: 'Popularity', description: 'Usage frequency', icon: Users },
  freshness: { label: 'Freshness', description: 'Recent validation', icon: Clock },
};

// Chart colors for up to 4 agents
const CHART_COLORS = [
  'hsl(268, 68%, 62%)', // Purple
  'hsl(217, 91%, 60%)', // Blue
  'hsl(160, 84%, 39%)', // Green
  'hsl(38, 92%, 50%)',  // Orange
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getAgentLevel = (agent: Agent): AgentLevel => {
  if (agent.tier !== undefined && agent.tier >= 1 && agent.tier <= 5) {
    return agent.tier as AgentLevel;
  }
  const levelNumber = (agent as any).agent_levels?.level_number;
  if (levelNumber !== undefined && levelNumber >= 1 && levelNumber <= 5) {
    return levelNumber as AgentLevel;
  }
  return 2; // Default to L2 Expert
};

const getLevelConfig = (level: AgentLevel) => AGENT_LEVEL_COLORS[level];

const getSpawningCapabilities = (level: AgentLevel): AgentLevel[] => {
  // Spread to convert readonly tuple to mutable array
  return [...SPAWNING_RULES[level].canSpawn] as AgentLevel[];
};

const calculateOverallScore = (metrics: ComparisonMetrics): number => {
  const weights = {
    relevance: 0.25,
    performance: 0.20,
    coverage: 0.15,
    regulatory: 0.20,
    popularity: 0.10,
    freshness: 0.10,
  };

  return Object.entries(metrics).reduce((sum, [key, value]) => {
    return sum + value * (weights[key as keyof ComparisonMetrics] || 0);
  }, 0);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Agent slot in comparison panel - shows agent mini-card or empty slot
 */
const ComparisonSlot: React.FC<{
  agent?: AgentWithMetrics;
  index: number;
  onRemove?: () => void;
  onAdd?: () => void;
  isWinner?: boolean;
}> = ({ agent, index, onRemove, onAdd, isWinner }) => {
  const level = agent ? getAgentLevel(agent) : undefined;
  const levelConfig = level ? getLevelConfig(level) : null;

  if (!agent) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onAdd}
        className={cn(
          'w-full h-32 rounded-xl border-2 border-dashed',
          'border-muted-foreground/20 hover:border-primary/50',
          'flex flex-col items-center justify-center gap-2',
          'text-muted-foreground hover:text-primary',
          'transition-all duration-200 cursor-pointer',
          'hover:bg-primary/5'
        )}
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-medium">Add Agent</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative w-full p-4 rounded-xl border-2',
        'transition-all duration-300',
        isWinner
          ? 'border-emerald-500 bg-emerald-500/10'
          : 'border-border bg-card hover:border-primary/50'
      )}
      style={{
        boxShadow: levelConfig ? `0 4px 16px ${levelConfig.base}20` : undefined,
      }}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
          <Check className="w-3 h-3" />
          Best Match
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Agent info */}
      <div className="flex items-start gap-3">
        {/* Level indicator */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'text-white font-bold text-sm shadow-lg'
          )}
          style={{ background: levelConfig?.base || '#6B7280' }}
        >
          L{level}
        </div>

        {/* Name & details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm line-clamp-1">
            {agent.display_name || agent.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {agent.function_name || 'General'}
          </p>

          {/* Quick stats */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <TooltipProvider>
              <TooltipUI>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    ${agent.cost_per_query?.toFixed(3) || '0.00'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Cost per query</TooltipContent>
              </TooltipUI>
            </TooltipProvider>

            {agent.similarity_score !== undefined && (
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Target className="w-3 h-3" />
                      {(agent.similarity_score * 100).toFixed(0)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Similarity score from GraphRAG</TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Overall score bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Overall Score</span>
          <span className="font-medium">
            {calculateOverallScore(agent.metrics || DEFAULT_METRICS).toFixed(0)}
          </span>
        </div>
        <Progress
          value={calculateOverallScore(agent.metrics || DEFAULT_METRICS)}
          className="h-2"
        />
      </div>
    </motion.div>
  );
};

/**
 * Hierarchy visualization showing agent level and spawning capabilities
 */
const HierarchyVisualization: React.FC<{
  agents: AgentWithMetrics[];
}> = ({ agents }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="w-4 h-4" />
          AgentOS 5-Level Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Level pyramid */}
        <div className="relative py-4">
          {[1, 2, 3, 4, 5].map((level) => {
            const levelConfig = AGENT_LEVEL_COLORS[level as AgentLevel];
            const agentsAtLevel = agents.filter(a => getAgentLevel(a) === level);
            const Icon = LEVEL_ICONS[level as AgentLevel];

            return (
              <div
                key={level}
                className={cn(
                  'flex items-center gap-4 py-2 px-3 rounded-lg mb-2',
                  'transition-all duration-200',
                  agentsAtLevel.length > 0 ? 'bg-primary/5 border border-primary/20' : 'opacity-50'
                )}
              >
                {/* Level badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                  style={{ background: levelConfig.base }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Level info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{levelConfig.name}</span>
                    <span className="text-xs text-muted-foreground">L{level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {levelConfig.description}
                  </p>
                </div>

                {/* Agents at this level */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {agentsAtLevel.length > 0 ? (
                    agentsAtLevel.map((agent, idx) => (
                      <TooltipProvider key={agent.id || idx}>
                        <TooltipUI>
                          <TooltipTrigger asChild>
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{
                                background: CHART_COLORS[agents.indexOf(agent) % CHART_COLORS.length]
                              }}
                            >
                              {(agent.display_name || agent.name).charAt(0)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {agent.display_name || agent.name}
                          </TooltipContent>
                        </TooltipUI>
                      </TooltipProvider>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </div>

                {/* Spawning indicator */}
                {level <= 4 && (
                  <div className="flex-shrink-0">
                    <TooltipProvider>
                      <TooltipUI>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5">
                            <GitBranch className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              →L{getSpawningCapabilities(level as AgentLevel).join(', L')}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Can spawn: {getSpawningCapabilities(level as AgentLevel).map(l => AGENT_LEVEL_COLORS[l].name).join(', ')}
                        </TooltipContent>
                      </TooltipUI>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cost & Model summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg. Cost/Query</p>
              <p className="font-semibold text-sm">
                ${(agents.reduce((sum, a) => sum + (a.cost_per_query || 0), 0) / agents.length || 0).toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Models Used</p>
              <p className="font-semibold text-sm line-clamp-1">
                {[...new Set(agents.map(a => a.model || a.base_model || 'Unknown'))].join(', ')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Radar chart for multi-criteria comparison
 */
const ComparisonRadarChart: React.FC<{
  agents: AgentWithMetrics[];
}> = ({ agents }) => {
  // Prepare data for radar chart
  const chartData = Object.keys(METRIC_INFO).map(key => {
    const metricKey = key as keyof ComparisonMetrics;
    const dataPoint: Record<string, any> = {
      metric: METRIC_INFO[metricKey].label,
      fullMark: 100,
    };

    agents.forEach((agent, idx) => {
      const metrics = agent.metrics || DEFAULT_METRICS;
      dataPoint[`agent${idx}`] = metrics[metricKey];
    });

    return dataPoint;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Multi-Criteria Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: 'currentColor' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              {agents.map((agent, idx) => (
                <Radar
                  key={agent.id || idx}
                  name={agent.display_name || agent.name}
                  dataKey={`agent${idx}`}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metric legend */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(METRIC_INFO).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <TooltipProvider key={key}>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="w-3 h-3" />
                      <span>{info.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{info.description}</TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Detailed metrics comparison table
 */
const MetricsComparisonTable: React.FC<{
  agents: AgentWithMetrics[];
}> = ({ agents }) => {
  const comparisonRows: {
    label: string;
    key: string;
    getValue: (agent: Agent) => React.ReactNode;
    highlight?: 'highest' | 'lowest';
  }[] = [
    {
      label: 'Level',
      key: 'level',
      getValue: (agent) => {
        const level = getAgentLevel(agent);
        return <LevelBadge level={level} showLabel size="sm" />;
      },
    },
    {
      label: 'Model',
      key: 'model',
      getValue: (agent) => (
        <span className="text-xs font-mono">
          {agent.model || agent.base_model || 'Unknown'}
        </span>
      ),
    },
    {
      label: 'Cost/Query',
      key: 'cost',
      getValue: (agent) => (
        <span className="font-semibold">${agent.cost_per_query?.toFixed(3) || '0.000'}</span>
      ),
      highlight: 'lowest',
    },
    {
      label: 'Temperature',
      key: 'temperature',
      getValue: (agent) => (
        <span className="font-mono text-xs">{agent.temperature?.toFixed(2) || '0.40'}</span>
      ),
    },
    {
      label: 'Max Tokens',
      key: 'max_tokens',
      getValue: (agent) => (
        <span className="font-mono text-xs">{agent.max_tokens?.toLocaleString() || '3,000'}</span>
      ),
    },
    {
      label: 'Can Spawn',
      key: 'spawning',
      getValue: (agent) => {
        const level = getAgentLevel(agent);
        const canSpawn = getSpawningCapabilities(level);
        return canSpawn.length > 0 ? (
          <span className="text-emerald-600 text-xs">
            L{canSpawn.join(', L')}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">None</span>
        );
      },
    },
    {
      label: 'RAG Enabled',
      key: 'rag',
      getValue: (agent) => (
        agent.rag_enabled ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground" />
        )
      ),
    },
    {
      label: 'HIPAA',
      key: 'hipaa',
      getValue: (agent) => (
        agent.hipaa_compliant ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground" />
        )
      ),
    },
  ];

  // Find best values for highlighting
  const findBest = (key: string, type: 'highest' | 'lowest') => {
    if (key === 'cost') {
      const costs = agents.map(a => a.cost_per_query || 0);
      return type === 'lowest' ? Math.min(...costs) : Math.max(...costs);
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          Side-by-Side Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">
                  Metric
                </th>
                {agents.map((agent, idx) => (
                  <th
                    key={agent.id || idx}
                    className="text-center py-2 px-4 font-medium"
                    style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}
                  >
                    {agent.display_name || agent.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => {
                const bestValue = row.highlight ? findBest(row.key, row.highlight) : null;

                return (
                  <tr key={row.key} className="border-b last:border-0">
                    <td className="py-2 px-4 text-muted-foreground">
                      {row.label}
                    </td>
                    {agents.map((agent, idx) => {
                      const isBest = row.key === 'cost' &&
                        (agent.cost_per_query || 0) === bestValue;

                      return (
                        <td
                          key={agent.id || idx}
                          className={cn(
                            'text-center py-2 px-4',
                            isBest && 'bg-emerald-500/10'
                          )}
                        >
                          {row.getValue(agent)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Capability overlap analysis
 */
const CapabilityOverlap: React.FC<{
  agents: AgentWithMetrics[];
}> = ({ agents }) => {
  // Extract all capabilities
  const allCapabilities = new Set<string>();
  agents.forEach(agent => {
    agent.capabilities?.forEach(cap => allCapabilities.add(cap));
    agent.knowledge_domains?.forEach(domain => allCapabilities.add(domain));
  });

  const capabilityList = Array.from(allCapabilities).slice(0, 12); // Limit for UI

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Capability Overlap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {capabilityList.map((cap) => {
            const agentsWithCap = agents.filter(
              a => a.capabilities?.includes(cap) || a.knowledge_domains?.includes(cap)
            );
            const overlapPercent = (agentsWithCap.length / agents.length) * 100;

            return (
              <div key={cap} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" title={cap}>{cap}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {agents.map((agent, idx) => {
                    const hasCap = agent.capabilities?.includes(cap) ||
                                   agent.knowledge_domains?.includes(cap);
                    return (
                      <div
                        key={agent.id || idx}
                        className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center',
                          hasCap ? 'opacity-100' : 'opacity-20'
                        )}
                        style={{
                          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                        }}
                      >
                        {hasCap && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    );
                  })}
                </div>
                <Badge
                  variant={overlapPercent === 100 ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0 flex-shrink-0"
                >
                  {overlapPercent.toFixed(0)}%
                </Badge>
              </div>
            );
          })}
        </div>

        {allCapabilities.size > 12 && (
          <p className="text-xs text-muted-foreground mt-3">
            +{allCapabilities.size - 12} more capabilities
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AgentComparison: React.FC<AgentComparisonProps> = ({
  agents,
  onRemoveAgent,
  onAddAgent,
  onSelectWinner,
  maxAgents = 3,
  showHierarchy = true,
  showSimilarity = true,
  className,
}) => {
  // Find winner based on overall score
  const winnerIdx = React.useMemo(() => {
    if (agents.length < 2) return -1;

    let maxScore = -1;
    let winnerIndex = -1;

    agents.forEach((agent, idx) => {
      const score = calculateOverallScore(agent.metrics || DEFAULT_METRICS);
      if (score > maxScore) {
        maxScore = score;
        winnerIndex = idx;
      }
    });

    return winnerIndex;
  }, [agents]);

  if (agents.length === 0) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Compare Agents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select 2-3 agents to compare their capabilities, performance, and costs
        </p>
        {onAddAgent && (
          <Button onClick={onAddAgent} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First Agent
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Agent slots */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(agents.length + (agents.length < maxAgents ? 1 : 0), maxAgents)}, 1fr)` }}>
        <AnimatePresence mode="popLayout">
          {agents.map((agent, idx) => (
            <ComparisonSlot
              key={agent.id || idx}
              agent={agent}
              index={idx}
              onRemove={onRemoveAgent ? () => onRemoveAgent(agent.id!) : undefined}
              isWinner={idx === winnerIdx && agents.length > 1}
            />
          ))}
          {agents.length < maxAgents && onAddAgent && (
            <ComparisonSlot
              key="add-slot"
              index={agents.length}
              onAdd={onAddAgent}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Comparison panels - only show if we have 2+ agents */}
      {agents.length >= 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radar chart */}
          <ComparisonRadarChart agents={agents} />

          {/* Hierarchy visualization */}
          {showHierarchy && <HierarchyVisualization agents={agents} />}
        </div>
      )}

      {/* Detailed comparison table */}
      {agents.length >= 2 && <MetricsComparisonTable agents={agents} />}

      {/* Capability overlap */}
      {agents.length >= 2 && <CapabilityOverlap agents={agents} />}

      {/* Select winner action */}
      {agents.length >= 2 && onSelectWinner && winnerIdx >= 0 && (
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => onSelectWinner(agents[winnerIdx])}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Select {agents[winnerIdx].display_name || agents[winnerIdx].name}
          </Button>
        </div>
      )}
    </div>
  );
};

AgentComparison.displayName = 'AgentComparison';

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentComparison;
