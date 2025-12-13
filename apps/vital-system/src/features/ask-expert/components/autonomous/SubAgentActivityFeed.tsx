'use client';

/**
 * VITAL Platform - Sub-Agent Activity Feed
 *
 * Real-time feed showing sub-agent activity during mission execution.
 * Displays delegations, tool calls, completions, and communication.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  MessageSquare,
  ChevronDown,
  Filter,
  Search,
  Database,
  FileText,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type ActivityType =
  | 'delegation'
  | 'tool_call'
  | 'tool_result'
  | 'completion'
  | 'error'
  | 'message'
  | 'thinking';

export interface AgentInfo {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  avatar?: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: string | number;
  agent: AgentInfo;
  /** Target agent for delegations */
  targetAgent?: AgentInfo;
  /** Tool name for tool calls */
  toolName?: string;
  /** Content/message */
  content: string;
  /** Duration in ms */
  duration?: number;
  /** Status */
  status?: 'pending' | 'success' | 'error';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface SubAgentActivityFeedProps {
  /** Activity events to display */
  events: ActivityEvent[];
  /** Max events to show before collapse */
  maxVisible?: number;
  /** Filter by activity types */
  filterTypes?: ActivityType[];
  /** Filter by agent IDs */
  filterAgents?: string[];
  /** Whether to auto-scroll to latest */
  autoScroll?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(ts: string | number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function getActivityIcon(type: ActivityType): React.ReactNode {
  const icons: Record<ActivityType, React.ReactNode> = {
    delegation: <ArrowRight className="w-4 h-4" />,
    tool_call: <Zap className="w-4 h-4" />,
    tool_result: <Database className="w-4 h-4" />,
    completion: <CheckCircle2 className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    thinking: <Brain className="w-4 h-4" />,
  };
  return icons[type];
}

// Brand v6.0 Purple-centric activity colors
function getActivityColor(type: ActivityType, status?: string): string {
  if (status === 'error') return 'text-red-500 bg-red-100';
  const colors: Record<ActivityType, string> = {
    delegation: 'text-purple-500 bg-purple-100',
    tool_call: 'text-amber-500 bg-amber-100',
    tool_result: 'text-green-500 bg-green-100',
    completion: 'text-green-500 bg-green-100',
    error: 'text-red-500 bg-red-100',
    message: 'text-violet-500 bg-violet-100',
    thinking: 'text-fuchsia-500 bg-fuchsia-100',
  };
  return colors[type];
}

// Brand v6.0 Purple-centric tier badges
function getTierBadge(tier: 1 | 2 | 3): React.ReactNode {
  const styles = {
    1: 'bg-stone-100 text-stone-600',
    2: 'bg-violet-100 text-violet-600',
    3: 'bg-purple-100 text-purple-600',
  };
  return (
    <span className={cn('px-1 py-0.5 rounded text-[10px] font-medium', styles[tier])}>
      T{tier}
    </span>
  );
}

function getToolIcon(toolName?: string): React.ReactNode {
  if (!toolName) return <Zap className="w-3 h-3" />;
  if (toolName.includes('search')) return <Search className="w-3 h-3" />;
  if (toolName.includes('database') || toolName.includes('query')) return <Database className="w-3 h-3" />;
  if (toolName.includes('document') || toolName.includes('file')) return <FileText className="w-3 h-3" />;
  return <Zap className="w-3 h-3" />;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SubAgentActivityFeed({
  events,
  maxVisible = 50,
  filterTypes,
  filterAgents,
  autoScroll = true,
  className,
}: SubAgentActivityFeedProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [localFilter, setLocalFilter] = useState<ActivityType | 'all'>('all');

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Apply type filters
    if (filterTypes && filterTypes.length > 0) {
      result = result.filter((e) => filterTypes.includes(e.type));
    }
    if (localFilter !== 'all') {
      result = result.filter((e) => e.type === localFilter);
    }

    // Apply agent filters
    if (filterAgents && filterAgents.length > 0) {
      result = result.filter(
        (e) =>
          filterAgents.includes(e.agent.id) ||
          (e.targetAgent && filterAgents.includes(e.targetAgent.id))
      );
    }

    // Sort by timestamp (newest first)
    result.sort((a, b) => {
      const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
      const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
      return bTime - aTime;
    });

    return result;
  }, [events, filterTypes, filterAgents, localFilter]);

  const visibleEvents = showAll ? filteredEvents : filteredEvents.slice(0, maxVisible);
  const hasMore = filteredEvents.length > maxVisible;

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  // Activity type counts for filter
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [events]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filter Bar */}
      <div className="flex-shrink-0 flex items-center gap-2 p-2 border-b bg-slate-50 overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {(['all', 'delegation', 'tool_call', 'completion', 'error', 'thinking'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setLocalFilter(type)}
            className={cn(
              'flex-shrink-0 px-2 py-1 rounded text-xs transition-colors',
              localFilter === type
                ? 'bg-purple-100 text-purple-700'
                : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            {type === 'all' ? 'All' : type.replace('_', ' ')}
            <span className="ml-1 text-slate-400">({typeCounts[type] || 0})</span>
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'rounded-lg border bg-white p-2 transition-shadow hover:shadow-sm',
                  event.status === 'error' && 'border-red-200',
                  event.type === 'thinking' && 'border-purple-200 bg-purple-50/50'
                )}
              >
                {/* Event Header */}
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                      getActivityColor(event.type, event.status)
                    )}
                  >
                    {getActivityIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Agent info */}
                      <span className="font-medium text-sm text-slate-900">
                        {event.agent.name}
                      </span>
                      {getTierBadge(event.agent.tier)}

                      {/* Delegation arrow */}
                      {event.type === 'delegation' && event.targetAgent && (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-sm text-slate-900">
                            {event.targetAgent.name}
                          </span>
                          {getTierBadge(event.targetAgent.tier)}
                        </>
                      )}

                      {/* Tool badge */}
                      {event.toolName && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-xs text-slate-600">
                          {getToolIcon(event.toolName)}
                          {event.toolName}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                      {event.content}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{formatTimestamp(event.timestamp)}</span>
                      {event.duration && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDuration(event.duration)}
                        </span>
                      )}
                      {event.status && (
                        <span
                          className={cn(
                            'flex items-center gap-0.5',
                            event.status === 'success' && 'text-green-500',
                            event.status === 'error' && 'text-red-500',
                            event.status === 'pending' && 'text-amber-500'
                          )}
                        >
                          {event.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                          {event.status === 'error' && <AlertCircle className="w-3 h-3" />}
                          {event.status === 'pending' && <Clock className="w-3 h-3" />}
                          {event.status}
                        </span>
                      )}
                    </div>

                    {/* Expanded metadata */}
                    {expandedEvents.has(event.id) && event.metadata && (
                      <pre className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>

                  {/* Expand button */}
                  {event.metadata && (
                    <button
                      onClick={() => toggleExpanded(event.id)}
                      className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedEvents.has(event.id) && 'rotate-180'
                        )}
                      />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Show more button */}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Show {filteredEvents.length - maxVisible} more events
          </button>
        )}
      </div>
    </div>
  );
}

export default SubAgentActivityFeed;
