/**
 * Agent Comparison Sidebar
 *
 * Slide-out panel for comparing agents with:
 * - Floating compare button with agent count
 * - Collapsible sidebar panel
 * - Integration with GraphRAG for similar agent suggestions
 * - Multi-criteria comparison visualization
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  X,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Zap,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Agent } from '../types/agent.types';
import { AgentComparison, type AgentWithMetrics, type ComparisonMetrics } from './agent-comparison';
import { AGENT_LEVEL_COLORS, type AgentLevel } from '../constants/design-tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentComparisonSidebarProps {
  /** List of agents available for selection */
  allAgents?: Agent[];
  /** Callback when an agent is selected from comparison */
  onSelectAgent?: (agent: Agent) => void;
  /** Callback to get similar agents via GraphRAG */
  onFetchSimilar?: (agentId: string) => Promise<AgentWithMetrics[]>;
  /** Maximum number of agents to compare */
  maxAgents?: number;
  /** Custom class name */
  className?: string;
}

export interface ComparisonState {
  agents: AgentWithMetrics[];
  isOpen: boolean;
  isLoading: boolean;
  similarAgents: AgentWithMetrics[];
}

// ============================================================================
// CONTEXT FOR GLOBAL COMPARISON STATE
// ============================================================================

interface ComparisonContextType {
  comparisonAgents: AgentWithMetrics[];
  addToComparison: (agent: Agent) => void;
  removeFromComparison: (agentId: string) => void;
  clearComparison: () => void;
  isInComparison: (agentId: string) => boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  isOpen: boolean;
}

const ComparisonContext = React.createContext<ComparisonContextType | undefined>(undefined);

export function useAgentComparison() {
  const context = React.useContext(ComparisonContext);
  if (!context) {
    throw new Error('useAgentComparison must be used within an AgentComparisonProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AgentComparisonProvider({
  children,
  maxAgents = 3,
}: {
  children: React.ReactNode;
  maxAgents?: number;
}) {
  const [comparisonAgents, setComparisonAgents] = React.useState<AgentWithMetrics[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const addToComparison = React.useCallback((agent: Agent) => {
    setComparisonAgents((prev) => {
      if (prev.length >= maxAgents) {
        // Replace oldest agent
        return [...prev.slice(1), agent as AgentWithMetrics];
      }
      if (prev.some((a) => a.id === agent.id)) {
        return prev; // Already in comparison
      }
      return [...prev, agent as AgentWithMetrics];
    });
  }, [maxAgents]);

  const removeFromComparison = React.useCallback((agentId: string) => {
    setComparisonAgents((prev) => prev.filter((a) => a.id !== agentId));
  }, []);

  const clearComparison = React.useCallback(() => {
    setComparisonAgents([]);
  }, []);

  const isInComparison = React.useCallback(
    (agentId: string) => comparisonAgents.some((a) => a.id === agentId),
    [comparisonAgents]
  );

  const openSidebar = React.useCallback(() => setIsOpen(true), []);
  const closeSidebar = React.useCallback(() => setIsOpen(false), []);

  return (
    <ComparisonContext.Provider
      value={{
        comparisonAgents,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        openSidebar,
        closeSidebar,
        isOpen,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

// ============================================================================
// FLOATING COMPARE BUTTON
// ============================================================================

export const FloatingCompareButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { comparisonAgents, openSidebar, clearComparison } = useAgentComparison();
  const count = comparisonAgents.length;

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2',
        className
      )}
    >
      {/* Clear button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={clearComparison}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear comparison</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Main compare button */}
      <Button
        onClick={openSidebar}
        className={cn(
          'h-12 rounded-full shadow-lg gap-2 px-5',
          'bg-gradient-to-r from-primary to-purple-600',
          'hover:from-primary/90 hover:to-purple-600/90'
        )}
      >
        <ArrowRightLeft className="h-4 w-4" />
        <span className="font-semibold">Compare</span>
        <Badge
          variant="secondary"
          className="ml-1 h-6 w-6 p-0 flex items-center justify-center rounded-full bg-white/20"
        >
          {count}
        </Badge>
      </Button>
    </motion.div>
  );
};

// ============================================================================
// SIMILAR AGENTS SUGGESTIONS
// ============================================================================

const SimilarAgentsSuggestions: React.FC<{
  baseAgent: Agent;
  onAddAgent: (agent: Agent) => void;
  onFetchSimilar?: (agentId: string) => Promise<AgentWithMetrics[]>;
}> = ({ baseAgent, onAddAgent, onFetchSimilar }) => {
  const [similarAgents, setSimilarAgents] = React.useState<AgentWithMetrics[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSimilar = React.useCallback(async () => {
    if (!onFetchSimilar || !baseAgent.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const similar = await onFetchSimilar(baseAgent.id);
      setSimilarAgents(similar);
    } catch (err) {
      setError('Failed to fetch similar agents');
      console.error('Error fetching similar agents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [baseAgent.id, onFetchSimilar]);

  React.useEffect(() => {
    if (onFetchSimilar && baseAgent.id) {
      fetchSimilar();
    }
  }, [baseAgent.id, fetchSimilar, onFetchSimilar]);

  if (!onFetchSimilar) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-muted/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Similar Agents (GraphRAG)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSimilar}
          disabled={isLoading}
          className="h-7 px-2"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : similarAgents.length > 0 ? (
        <div className="space-y-2">
          {similarAgents.slice(0, 5).map((agent) => {
            const level = (agent.tier || 2) as AgentLevel;
            const levelConfig = AGENT_LEVEL_COLORS[level];

            return (
              <div
                key={agent.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-background hover:bg-primary/5 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: levelConfig.base }}
                >
                  L{level}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {agent.display_name || agent.name}
                  </p>
                  {agent.similarity_score !== undefined && (
                    <p className="text-[10px] text-emerald-600">
                      {(agent.similarity_score * 100).toFixed(0)}% match
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onAddAgent(agent)}
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          No similar agents found
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export const AgentComparisonSidebar: React.FC<AgentComparisonSidebarProps> = ({
  allAgents = [],
  onSelectAgent,
  onFetchSimilar,
  maxAgents = 3,
  className,
}) => {
  const {
    comparisonAgents,
    removeFromComparison,
    addToComparison,
    clearComparison,
    isOpen,
    closeSidebar,
  } = useAgentComparison();

  const handleSelectWinner = React.useCallback(
    (agent: Agent) => {
      if (onSelectAgent) {
        onSelectAgent(agent);
        closeSidebar();
      }
    },
    [onSelectAgent, closeSidebar]
  );

  const handleAddAgent = React.useCallback(() => {
    // This would typically open a modal or dropdown to select an agent
    // For now, we'll just log - the parent component should handle this
    console.log('Add agent clicked - implement agent picker');
  }, []);

  // Default similar agents fetcher using the recommend API
  const defaultFetchSimilar = React.useCallback(async (agentId: string) => {
    try {
      const response = await fetch('/api/agents/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Find agents similar to agent ${agentId}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch similar agents');

      const data = await response.json();
      return (data.agents || []).map((agent: Agent) => ({
        ...agent,
        similarity_score: (data.recommendations?.find((r: any) => r.agentId === agent.id)?.score || 0) / 100,
      }));
    } catch (error) {
      console.error('Error fetching similar agents:', error);
      return [];
    }
  }, []);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {comparisonAgents.length > 0 && !isOpen && <FloatingCompareButton />}
      </AnimatePresence>

      {/* Sidebar sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
        <SheetContent
          side="right"
          className={cn('w-full sm:w-[600px] lg:w-[700px] p-0', className)}
        >
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  Agent Comparison
                </SheetTitle>
                <SheetDescription>
                  Compare up to {maxAgents} agents side by side
                </SheetDescription>
              </div>
              {comparisonAgents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                  className="gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-6">
              {/* Main comparison component */}
              <AgentComparison
                agents={comparisonAgents}
                onRemoveAgent={removeFromComparison}
                onAddAgent={handleAddAgent}
                onSelectWinner={onSelectAgent ? handleSelectWinner : undefined}
                maxAgents={maxAgents}
                showHierarchy
                showSimilarity
              />

              {/* Similar agents suggestions */}
              {comparisonAgents.length > 0 && (
                <SimilarAgentsSuggestions
                  baseAgent={comparisonAgents[0]}
                  onAddAgent={addToComparison}
                  onFetchSimilar={onFetchSimilar || defaultFetchSimilar}
                />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

AgentComparisonSidebar.displayName = 'AgentComparisonSidebar';

// ============================================================================
// COMPARE BUTTON FOR AGENT CARDS
// ============================================================================

export const CompareButton: React.FC<{
  agent: Agent;
  className?: string;
  variant?: 'icon' | 'default';
}> = ({ agent, className, variant = 'icon' }) => {
  const { addToComparison, removeFromComparison, isInComparison } = useAgentComparison();
  const isSelected = agent.id ? isInComparison(agent.id) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!agent.id) return;

    if (isSelected) {
      removeFromComparison(agent.id);
    } else {
      addToComparison(agent);
    }
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0 rounded-lg transition-all duration-200',
                isSelected
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                className
              )}
              onClick={handleClick}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSelected ? 'Remove from comparison' : 'Add to comparison'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      className={cn('gap-1.5', className)}
      onClick={handleClick}
    >
      <ArrowRightLeft className="h-3.5 w-3.5" />
      {isSelected ? 'Added' : 'Compare'}
    </Button>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AgentComparisonSidebar;
