/**
 * SubagentSelector Component
 *
 * Allows users to configure L4/L5 agent hierarchy in the agent edit modal.
 * Shows AI-recommended agents based on domain matching while allowing
 * manual selection for full control.
 *
 * This component:
 * - Fetches recommended subagents based on parent agent's domain
 * - Displays match scores and reasons for transparency
 * - Allows selecting/deselecting agents from recommendations
 * - Supports manual agent search for custom selections
 * - Saves configuration to agent.metadata.hierarchy
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  RefreshCw,
  Info,
  Zap,
  Brain,
  Settings2,
  Users,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Agent,
  AgentLevelNumber,
  RecommendedSubagent,
  ConfiguredSubagent,
  SubagentHierarchyConfig,
  ContextEngineerConfig,
  DEFAULT_HIERARCHY_CONFIG,
} from '../types/agent.types';
import { agentApi } from '../services/agent-api';

// ============================================================================
// TYPES
// ============================================================================

interface SubagentSelectorProps {
  agent: Agent;
  onSave?: (config: SubagentHierarchyConfig) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

interface SubagentCardProps {
  subagent: RecommendedSubagent | ConfiguredSubagent;
  isSelected: boolean;
  onToggle: () => void;
  showMatchScore?: boolean;
  disabled?: boolean;
}

// ============================================================================
// SUBAGENT CARD COMPONENT
// ============================================================================

const SubagentCard: React.FC<SubagentCardProps> = ({
  subagent,
  isSelected,
  onToggle,
  showMatchScore = true,
  disabled = false,
}) => {
  const isRecommended = 'match_score' in subagent;
  const matchScore = isRecommended
    ? (subagent as RecommendedSubagent).match_score
    : null;
  const matchReasons = isRecommended
    ? (subagent as RecommendedSubagent).match_reasons
    : [];

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onToggle()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {subagent.agent_name}
            </span>
            <Badge
              variant="outline"
              className="text-xs shrink-0"
            >
              L{subagent.agent_level}
            </Badge>
          </div>

          {showMatchScore && matchScore !== null && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    matchScore >= 0.8
                      ? 'bg-emerald-500'
                      : matchScore >= 0.6
                        ? 'bg-amber-500'
                        : 'bg-muted-foreground'
                  )}
                  style={{ width: `${matchScore * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(matchScore * 100)}%
              </span>
            </div>
          )}

          {matchReasons.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span className="truncate">{matchReasons[0]}</span>
                    {matchReasons.length > 1 && (
                      <span>+{matchReasons.length - 1}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <ul className="text-xs space-y-1">
                    {matchReasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div
          className={cn(
            'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SubagentSelector: React.FC<SubagentSelectorProps> = ({
  agent,
  onSave,
  onCancel,
  readOnly = false,
}) => {
  // State for recommendations
  const [l4Recommendations, setL4Recommendations] = useState<RecommendedSubagent[]>([]);
  const [l5Recommendations, setL5Recommendations] = useState<RecommendedSubagent[]>([]);
  const [contextEngineers, setContextEngineers] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for configuration
  const [config, setConfig] = useState<SubagentHierarchyConfig>(() => {
    // Initialize from agent's existing hierarchy config or default
    const existingConfig = agent.metadata?.hierarchy as SubagentHierarchyConfig | undefined;
    return existingConfig || {
      l4_workers: {
        recommended: [],
        configured: [],
        use_pool: true,
        max_concurrent: 3,
      },
      l5_tools: {
        recommended: [],
        configured: [],
      },
      context_engineer: {
        is_enabled: false,
        context_strategy: 'summarize',
      },
    };
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Agent[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected agents state (derived from config)
  const selectedL4Ids = new Set(config.l4_workers.configured.map((c) => c.agent_id));
  const selectedL5Ids = new Set(config.l5_tools.configured.map((c) => c.agent_id));

  // ============================================================================
  // FETCH RECOMMENDATIONS
  // ============================================================================

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch L4 Worker recommendations
      const l4Response = await agentApi.getRecommendedSubagents({
        parent_agent_id: agent.id,
        target_level: 4,
        domain_expertise: agent.metadata?.domain_expertise,
        department_name: agent.department_name,
        function_name: agent.function_name,
        limit: 10,
      });
      setL4Recommendations(l4Response.recommendations);

      // Fetch L5 Tool recommendations
      const l5Response = await agentApi.getRecommendedSubagents({
        parent_agent_id: agent.id,
        target_level: 5,
        domain_expertise: agent.metadata?.domain_expertise,
        department_name: agent.department_name,
        function_name: agent.function_name,
        limit: 10,
      });
      setL5Recommendations(l5Response.recommendations);

      // Fetch Context Engineers
      const engineers = await agentApi.getContextEngineers();
      setContextEngineers(engineers);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [agent.id, agent.metadata?.domain_expertise, agent.department_name, agent.function_name]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleL4 = (rec: RecommendedSubagent) => {
    if (readOnly) return;

    setConfig((prev) => {
      const isSelected = prev.l4_workers.configured.some(
        (c) => c.agent_id === rec.agent_id
      );

      if (isSelected) {
        // Remove from configured
        return {
          ...prev,
          l4_workers: {
            ...prev.l4_workers,
            configured: prev.l4_workers.configured.filter(
              (c) => c.agent_id !== rec.agent_id
            ),
          },
        };
      } else {
        // Add to configured
        const newConfigured: ConfiguredSubagent = {
          agent_id: rec.agent_id,
          agent_name: rec.agent_name,
          agent_level: 4,
          priority: prev.l4_workers.configured.length + 1,
          is_enabled: true,
          assignment_type: 'recommended',
          configured_at: new Date().toISOString(),
        };
        return {
          ...prev,
          l4_workers: {
            ...prev.l4_workers,
            configured: [...prev.l4_workers.configured, newConfigured],
          },
        };
      }
    });
  };

  const handleToggleL5 = (rec: RecommendedSubagent) => {
    if (readOnly) return;

    setConfig((prev) => {
      const isSelected = prev.l5_tools.configured.some(
        (c) => c.agent_id === rec.agent_id
      );

      if (isSelected) {
        return {
          ...prev,
          l5_tools: {
            ...prev.l5_tools,
            configured: prev.l5_tools.configured.filter(
              (c) => c.agent_id !== rec.agent_id
            ),
          },
        };
      } else {
        const newConfigured: ConfiguredSubagent = {
          agent_id: rec.agent_id,
          agent_name: rec.agent_name,
          agent_level: 5,
          priority: prev.l5_tools.configured.length + 1,
          is_enabled: true,
          assignment_type: 'recommended',
          configured_at: new Date().toISOString(),
        };
        return {
          ...prev,
          l5_tools: {
            ...prev.l5_tools,
            configured: [...prev.l5_tools.configured, newConfigured],
          },
        };
      }
    });
  };

  const handleContextEngineerChange = (agentId: string) => {
    if (readOnly) return;

    const selectedEngineer = contextEngineers.find((e) => e.id === agentId);
    setConfig((prev) => ({
      ...prev,
      context_engineer: {
        ...prev.context_engineer,
        agent_id: agentId,
        agent_name: selectedEngineer?.name || selectedEngineer?.display_name,
        is_enabled: true,
      },
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await agentApi.searchAgents({
        query: searchQuery,
        limit: 20,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (readOnly) return;

    setSaving(true);
    try {
      // Update recommendations in config before saving
      const finalConfig: SubagentHierarchyConfig = {
        ...config,
        l4_workers: {
          ...config.l4_workers,
          recommended: l4Recommendations,
        },
        l5_tools: {
          ...config.l5_tools,
          recommended: l5Recommendations,
        },
        last_configured_at: new Date().toISOString(),
      };

      await agentApi.updateAgentHierarchy(agent.id, finalConfig);
      onSave?.(finalConfig);
    } catch (error) {
      console.error('Failed to save hierarchy:', error);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Analyzing domain for recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Subagent Hierarchy Configuration
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure L4 Workers and L5 Tools this agent can spawn
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* L4 Workers Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            L4 Worker Agents
            <Badge variant="secondary" className="ml-2">
              {config.l4_workers.configured.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Worker agents that execute specific tasks delegated by this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pool Settings */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="use-pool"
                checked={config.l4_workers.use_pool}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    l4_workers: { ...prev.l4_workers, use_pool: checked },
                  }))
                }
                disabled={readOnly}
              />
              <Label htmlFor="use-pool" className="text-sm">
                Use Worker Pool (load balancing)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Max Concurrent:</Label>
              <Select
                value={String(config.l4_workers.max_concurrent)}
                onValueChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    l4_workers: { ...prev.l4_workers, max_concurrent: parseInt(v) },
                  }))
                }
                disabled={readOnly}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Recommendations
            </div>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {l4Recommendations.length > 0 ? (
                  l4Recommendations.map((rec) => (
                    <SubagentCard
                      key={rec.agent_id}
                      subagent={rec}
                      isSelected={selectedL4Ids.has(rec.agent_id)}
                      onToggle={() => handleToggleL4(rec)}
                      showMatchScore
                      disabled={readOnly}
                    />
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                    No L4 Worker recommendations available for this domain
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* L5 Tools Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            L5 Tool Agents
            <Badge variant="secondary" className="ml-2">
              {config.l5_tools.configured.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Tool agents that provide specific capabilities (search, analysis, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {l5Recommendations.length > 0 ? (
                l5Recommendations.map((rec) => (
                  <SubagentCard
                    key={rec.agent_id}
                    subagent={rec}
                    isSelected={selectedL5Ids.has(rec.agent_id)}
                    onToggle={() => handleToggleL5(rec)}
                    showMatchScore
                    disabled={readOnly}
                  />
                ))
              ) : (
                <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                  No L5 Tool recommendations available for this domain
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Context Engineer Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            Context Engineer
          </CardTitle>
          <CardDescription>
            Specialized agent for managing context in deep agent workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="context-enabled"
                checked={config.context_engineer.is_enabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    context_engineer: {
                      ...prev.context_engineer,
                      is_enabled: checked,
                    },
                  }))
                }
                disabled={readOnly}
              />
              <Label htmlFor="context-enabled">Enable Context Engineering</Label>
            </div>
          </div>

          {config.context_engineer.is_enabled && (
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label className="text-sm">Context Engineer Agent</Label>
                <Select
                  value={config.context_engineer.agent_id || ''}
                  onValueChange={handleContextEngineerChange}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a context engineer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contextEngineers.map((eng) => (
                      <SelectItem key={eng.id} value={eng.id}>
                        {eng.name || eng.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Context Strategy</Label>
                <Select
                  value={config.context_engineer.context_strategy}
                  onValueChange={(v) =>
                    setConfig((prev) => ({
                      ...prev,
                      context_engineer: {
                        ...prev.context_engineer,
                        context_strategy: v as 'full' | 'summarize' | 'selective',
                      },
                    }))
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Context</SelectItem>
                    <SelectItem value="summarize">Summarize</SelectItem>
                    <SelectItem value="selective">Selective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Search Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Manual Agent Search
          </CardTitle>
          <CardDescription>
            Search for specific agents to add to the hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search agents by name, department, or function..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={readOnly}
            />
            <Button
              variant="secondary"
              onClick={handleSearch}
              disabled={searching || readOnly}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ScrollArea className="h-32">
              <div className="space-y-1.5 pr-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{result.name}</span>
                      {result.department_name && (
                        <Badge variant="outline" className="text-xs">
                          {result.department_name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() =>
                                handleToggleL4({
                                  agent_id: result.id,
                                  agent_name: result.name || '',
                                  agent_level: 4,
                                  match_score: 0.5,
                                  match_reasons: ['Manually selected'],
                                })
                              }
                              disabled={readOnly || selectedL4Ids.has(result.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add as L4 Worker</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubagentSelector;
