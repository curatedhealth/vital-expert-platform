'use client';

/**
 * VITAL Platform - AgentTeamSetup Component (Mode 3/4 Redesign)
 *
 * Allows users to configure their agent team for a mission using the
 * 5-level agent hierarchy (L1-L5). Users select:
 * - L2 Expert: Primary domain expert (required)
 * - L3 Specialists: Optional domain-specific sub-experts
 * - L4 Workers: Task execution agents (usually auto-selected)
 * - L5 Tools: Atomic functions (usually auto-selected)
 *
 * Design System: VITAL Brand v6.0 (Purple theme)
 * Phase 3 Redesign - December 13, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Users,
  User,
  UserCog,
  Wrench,
  Hammer,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Sparkles,
  Check,
  Plus,
  X,
  Info,
  Zap,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface AgentInfo {
  id: string;
  name: string;
  level: AgentLevel;
  specialty?: string;
  description?: string;
  avatar?: string;
  confidence?: number;
  isRecommended?: boolean;
  reason?: string;
}

export interface AgentTeamConfig {
  primaryAgent: AgentInfo | null;
  specialists: AgentInfo[];
  workers: AgentInfo[];
  tools: AgentInfo[];
}

export interface AgentTeamSetupProps {
  /** Current team configuration */
  value: AgentTeamConfig;
  /** Called when team changes */
  onChange: (team: AgentTeamConfig) => void;
  /** Available agents by level */
  availableAgents: {
    L2: AgentInfo[];
    L3: AgentInfo[];
    L4: AgentInfo[];
    L5: AgentInfo[];
  };
  /** AI-recommended agents */
  recommendations?: {
    primaryAgent?: AgentInfo;
    specialists?: AgentInfo[];
    workers?: AgentInfo[];
    tools?: AgentInfo[];
  };
  /** Whether to show auto-selection option */
  showAutoSelect?: boolean;
  /** Whether the team is locked (during execution) */
  isLocked?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// LEVEL CONFIG
// =============================================================================

const LEVEL_CONFIG: Record<AgentLevel, {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  L1: {
    label: 'Master',
    description: 'Orchestration & coordination (system-managed)',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  L2: {
    label: 'Expert',
    description: 'Primary domain expert for your mission',
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  L3: {
    label: 'Specialist',
    description: 'Domain-specific sub-experts for complex tasks',
    icon: UserCog,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  L4: {
    label: 'Worker',
    description: 'Task execution agents for data processing',
    icon: Wrench,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  L5: {
    label: 'Tool',
    description: 'Atomic functions like search and parse',
    icon: Hammer,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
};

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface AgentCardProps {
  agent: AgentInfo;
  isSelected: boolean;
  isRecommended?: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function AgentCard({ agent, isSelected, isRecommended, onToggle, disabled }: AgentCardProps) {
  const levelConfig = LEVEL_CONFIG[agent.level];
  const LevelIcon = levelConfig.icon;

  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      className={cn(
        'w-full p-3 rounded-lg border-2 text-left transition-all',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        isSelected
          ? `${levelConfig.borderColor} ${levelConfig.bgColor}`
          : 'border-slate-200 bg-white hover:border-slate-300',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          isSelected
            ? `${levelConfig.borderColor.replace('border-', 'bg-').replace('-200', '-500')} border-transparent`
            : 'border-slate-300'
        )}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        {/* Agent info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900 truncate">{agent.name}</span>
            <Badge variant="secondary" className={cn('text-xs', levelConfig.color, levelConfig.bgColor)}>
              <LevelIcon className="w-3 h-3 mr-1" />
              {agent.level}
            </Badge>
            {isRecommended && (
              <Badge className="bg-amber-100 text-amber-700 text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                Recommended
              </Badge>
            )}
          </div>
          {agent.specialty && (
            <p className="text-sm text-slate-600 truncate">{agent.specialty}</p>
          )}
          {agent.reason && isRecommended && (
            <p className="text-xs text-purple-600 mt-1">{agent.reason}</p>
          )}
          {agent.confidence !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${agent.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{Math.round(agent.confidence * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

interface LevelSectionProps {
  level: AgentLevel;
  agents: AgentInfo[];
  selectedAgents: AgentInfo[];
  recommendations?: AgentInfo[];
  onToggleAgent: (agent: AgentInfo) => void;
  isMultiSelect: boolean;
  isLocked?: boolean;
  defaultExpanded?: boolean;
}

function LevelSection({
  level,
  agents,
  selectedAgents,
  recommendations = [],
  onToggleAgent,
  isMultiSelect,
  isLocked,
  defaultExpanded = false,
}: LevelSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const levelConfig = LEVEL_CONFIG[level];
  const LevelIcon = levelConfig.icon;

  const selectedIds = useMemo(() => new Set(selectedAgents.map(a => a.id)), [selectedAgents]);
  const recommendedIds = useMemo(() => new Set(recommendations.map(a => a.id)), [recommendations]);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      a => a.name.toLowerCase().includes(query) ||
           a.specialty?.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  // Sort: recommended first, then alphabetically
  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => {
      const aRec = recommendedIds.has(a.id) ? 0 : 1;
      const bRec = recommendedIds.has(b.id) ? 0 : 1;
      if (aRec !== bRec) return aRec - bRec;
      return a.name.localeCompare(b.name);
    });
  }, [filteredAgents, recommendedIds]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', levelConfig.bgColor)}>
            <LevelIcon className={cn('w-5 h-5', levelConfig.color)} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{levelConfig.label} Agents</span>
              <Badge variant="secondary" className="text-xs">
                {selectedAgents.length}/{agents.length}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{levelConfig.description}</p>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-slate-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-3">
          {/* Search (only show if > 5 agents) */}
          {agents.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder={`Search ${levelConfig.label.toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Agent list */}
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2 pr-2">
              {sortedAgents.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No agents found
                </div>
              ) : (
                sortedAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedIds.has(agent.id)}
                    isRecommended={recommendedIds.has(agent.id)}
                    onToggle={() => onToggleAgent(agent)}
                    disabled={isLocked}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Selection hint */}
          <p className="text-xs text-slate-500">
            {isMultiSelect
              ? `Select multiple ${levelConfig.label.toLowerCase()}s to assist your mission`
              : `Select one ${levelConfig.label.toLowerCase()} as your primary agent`}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentTeamSetup({
  value,
  onChange,
  availableAgents,
  recommendations,
  showAutoSelect = true,
  isLocked = false,
  className,
}: AgentTeamSetupProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate team stats
  const teamSize = useMemo(() => {
    return (
      (value.primaryAgent ? 1 : 0) +
      value.specialists.length +
      value.workers.length +
      value.tools.length
    );
  }, [value]);

  // Handle L2 (primary) selection - single select
  const handlePrimaryToggle = useCallback((agent: AgentInfo) => {
    if (isLocked) return;
    onChange({
      ...value,
      primaryAgent: value.primaryAgent?.id === agent.id ? null : agent,
    });
  }, [value, onChange, isLocked]);

  // Handle L3 (specialists) toggle - multi select
  const handleSpecialistToggle = useCallback((agent: AgentInfo) => {
    if (isLocked) return;
    const exists = value.specialists.some(s => s.id === agent.id);
    onChange({
      ...value,
      specialists: exists
        ? value.specialists.filter(s => s.id !== agent.id)
        : [...value.specialists, agent],
    });
  }, [value, onChange, isLocked]);

  // Handle L4 (workers) toggle - multi select
  const handleWorkerToggle = useCallback((agent: AgentInfo) => {
    if (isLocked) return;
    const exists = value.workers.some(w => w.id === agent.id);
    onChange({
      ...value,
      workers: exists
        ? value.workers.filter(w => w.id !== agent.id)
        : [...value.workers, agent],
    });
  }, [value, onChange, isLocked]);

  // Handle L5 (tools) toggle - multi select
  const handleToolToggle = useCallback((agent: AgentInfo) => {
    if (isLocked) return;
    const exists = value.tools.some(t => t.id === agent.id);
    onChange({
      ...value,
      tools: exists
        ? value.tools.filter(t => t.id !== agent.id)
        : [...value.tools, agent],
    });
  }, [value, onChange, isLocked]);

  // Auto-select recommended team
  const handleAutoSelect = useCallback(() => {
    if (isLocked || !recommendations) return;
    onChange({
      primaryAgent: recommendations.primaryAgent || null,
      specialists: recommendations.specialists || [],
      workers: recommendations.workers || [],
      tools: recommendations.tools || [],
    });
  }, [recommendations, onChange, isLocked]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    if (isLocked) return;
    onChange({
      primaryAgent: null,
      specialists: [],
      workers: [],
      tools: [],
    });
  }, [onChange, isLocked]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Agent Team Setup</h3>
            <p className="text-sm text-slate-600">
              Configure your research team ({teamSize} agent{teamSize !== 1 ? 's' : ''} selected)
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          {showAutoSelect && recommendations && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSelect}
              disabled={isLocked}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Auto-select
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isLocked || teamSize === 0}
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Selected team summary */}
      {teamSize > 0 && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Your Team</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.primaryAgent && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 gap-1">
                <User className="w-3 h-3" />
                {value.primaryAgent.name}
                {!isLocked && (
                  <button
                    onClick={() => handlePrimaryToggle(value.primaryAgent!)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            )}
            {value.specialists.map((s) => (
              <Badge key={s.id} variant="secondary" className="bg-blue-100 text-blue-700 gap-1">
                <UserCog className="w-3 h-3" />
                {s.name}
                {!isLocked && (
                  <button
                    onClick={() => handleSpecialistToggle(s)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {showAdvanced && value.workers.map((w) => (
              <Badge key={w.id} variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1">
                <Wrench className="w-3 h-3" />
                {w.name}
                {!isLocked && (
                  <button
                    onClick={() => handleWorkerToggle(w)}
                    className="ml-1 hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {showAdvanced && value.tools.map((t) => (
              <Badge key={t.id} variant="secondary" className="bg-slate-100 text-slate-700 gap-1">
                <Hammer className="w-3 h-3" />
                {t.name}
                {!isLocked && (
                  <button
                    onClick={() => handleToolToggle(t)}
                    className="ml-1 hover:text-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* L2 Expert Selection (Required) */}
      <LevelSection
        level="L2"
        agents={availableAgents.L2}
        selectedAgents={value.primaryAgent ? [value.primaryAgent] : []}
        recommendations={recommendations?.primaryAgent ? [recommendations.primaryAgent] : []}
        onToggleAgent={handlePrimaryToggle}
        isMultiSelect={false}
        isLocked={isLocked}
        defaultExpanded={true}
      />

      {/* L3 Specialist Selection */}
      <LevelSection
        level="L3"
        agents={availableAgents.L3}
        selectedAgents={value.specialists}
        recommendations={recommendations?.specialists}
        onToggleAgent={handleSpecialistToggle}
        isMultiSelect={true}
        isLocked={isLocked}
        defaultExpanded={false}
      />

      {/* Advanced: L4 Workers and L5 Tools */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          {showAdvanced ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>Advanced: Workers & Tools</span>
          <Info className="w-3 h-3" />
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            <Info className="w-4 h-4 inline mr-2" />
            Workers (L4) and Tools (L5) are typically auto-selected based on your mission template.
            Only customize these if you have specific requirements.
          </div>

          <LevelSection
            level="L4"
            agents={availableAgents.L4}
            selectedAgents={value.workers}
            recommendations={recommendations?.workers}
            onToggleAgent={handleWorkerToggle}
            isMultiSelect={true}
            isLocked={isLocked}
          />

          <LevelSection
            level="L5"
            agents={availableAgents.L5}
            selectedAgents={value.tools}
            recommendations={recommendations?.tools}
            onToggleAgent={handleToolToggle}
            isMultiSelect={true}
            isLocked={isLocked}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default AgentTeamSetup;
