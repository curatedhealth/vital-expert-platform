'use client';

/**
 * VITAL Platform - ReasoningChainViewer Component
 *
 * Visualizes the agent's reasoning process as a chain of thoughts.
 * Provides transparency into AI decision-making with:
 * - Step-by-step reasoning display
 * - Visual connections between steps
 * - Expandable details for each step
 * - Support for nested reasoning (sub-chains)
 * - Confidence indicators per step
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Search,
  FileText,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  GitBranch,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type ReasoningType =
  | 'analysis'      // Breaking down the problem
  | 'search'        // Looking up information
  | 'synthesis'     // Combining information
  | 'calculation'   // Computing values
  | 'inference'     // Drawing conclusions
  | 'validation'    // Checking results
  | 'decision'      // Making a choice
  | 'warning'       // Flagging an issue
  | 'insight';      // Key finding

export interface ReasoningNode {
  id: string;
  step: number;
  type: ReasoningType;
  content: string;
  details?: string;
  confidence?: number; // 0-1
  timestamp?: string;
  duration?: number; // ms
  children?: ReasoningNode[];
  sources?: Array<{ title: string; url?: string }>;
  metadata?: Record<string, unknown>;
}

export interface ReasoningChainViewerProps {
  /** Array of reasoning nodes */
  nodes: ReasoningNode[];
  /** Currently active node (streaming) */
  activeNodeId?: string;
  /** Show confidence indicators */
  showConfidence?: boolean;
  /** Show timing information */
  showTiming?: boolean;
  /** Allow expanding node details */
  expandable?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Show as tree (with branches) or linear */
  layout?: 'linear' | 'tree';
  /** Max height before scrolling */
  maxHeight?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_CONFIG: Record<ReasoningType, { icon: typeof Brain; color: string; bgColor: string; label: string }> = {
  analysis: { icon: Brain, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Analysis' },
  search: { icon: Search, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Search' },
  synthesis: { icon: Sparkles, color: 'text-pink-400', bgColor: 'bg-pink-500/20', label: 'Synthesis' },
  calculation: { icon: Calculator, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Calculation' },
  inference: { icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Inference' },
  validation: { icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Validation' },
  decision: { icon: GitBranch, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', label: 'Decision' },
  warning: { icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: 'Warning' },
  insight: { icon: Lightbulb, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Insight' },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-amber-400';
  return 'text-red-400';
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ReasoningNodeCardProps {
  node: ReasoningNode;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  showConfidence: boolean;
  showTiming: boolean;
  expandable: boolean;
  compact: boolean;
  depth: number;
}

const ReasoningNodeCard: React.FC<ReasoningNodeCardProps> = ({
  node,
  isActive,
  isExpanded,
  onToggle,
  showConfidence,
  showTiming,
  expandable,
  compact,
  depth,
}) => {
  const config = TYPE_CONFIG[node.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.05 }}
      className={cn(
        'relative',
        depth > 0 && 'ml-6 border-l-2 border-neutral-700 pl-4'
      )}
    >
      {/* Connector dot for nested items */}
      {depth > 0 && (
        <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-neutral-700" />
      )}

      <div
        className={cn(
          'rounded-lg border transition-all',
          isActive
            ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
            : 'border-neutral-700/50 bg-neutral-800/50 hover:border-neutral-600',
          compact ? 'p-2' : 'p-3'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Step number & icon */}
          <div className={cn(
            'flex-shrink-0 rounded-lg flex items-center justify-center',
            config.bgColor,
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            {isActive ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Icon className={cn('w-4 h-4', config.color)} />
              </motion.div>
            ) : (
              <Icon className={cn(compact ? 'w-4 h-4' : 'w-5 h-5', config.color)} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded',
                config.bgColor,
                config.color
              )}>
                {config.label}
              </span>
              <span className="text-xs text-neutral-500">Step {node.step}</span>

              {showConfidence && node.confidence !== undefined && (
                <span className={cn(
                  'text-xs ml-auto',
                  getConfidenceColor(node.confidence)
                )}>
                  {(node.confidence * 100).toFixed(0)}% confident
                </span>
              )}

              {showTiming && node.duration && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(node.duration)}
                </span>
              )}
            </div>

            <p className={cn(
              'text-neutral-200',
              compact ? 'text-sm' : 'text-sm leading-relaxed'
            )}>
              {node.content}
            </p>

            {/* Expandable details */}
            {expandable && (node.details || node.sources) && (
              <button
                onClick={onToggle}
                className="flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    Show details
                  </>
                )}
              </button>
            )}

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-neutral-700/50">
                    {node.details && (
                      <p className="text-xs text-neutral-400 whitespace-pre-wrap mb-2">
                        {node.details}
                      </p>
                    )}

                    {node.sources && node.sources.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-neutral-500">Sources:</p>
                        {node.sources.map((source, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <FileText className="w-3 h-3 text-blue-400" />
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                {source.title}
                              </a>
                            ) : (
                              <span className="text-neutral-400">{source.title}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Children (nested reasoning) - with depth limit to prevent infinite recursion */}
        {node.children && node.children.length > 0 && depth < 5 && (
          <div className="mt-3 space-y-2">
            {node.children.map(child => (
              <ReasoningNodeCard
                key={child.id}
                node={child}
                isActive={false}
                isExpanded={false}
                onToggle={() => {}}
                showConfidence={showConfidence}
                showTiming={showTiming}
                expandable={expandable}
                compact={compact}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
        {/* Show truncation notice when max depth reached */}
        {node.children && node.children.length > 0 && depth >= 5 && (
          <div className="text-xs text-neutral-500 mt-2 pl-3">
            ({node.children.length} nested steps hidden)
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ReasoningChainViewer: React.FC<ReasoningChainViewerProps> = ({
  nodes,
  activeNodeId,
  showConfidence = true,
  showTiming = false,
  expandable = true,
  compact = false,
  layout = 'linear',
  maxHeight = '500px',
  className,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // Calculate stats (with division by zero protection)
  const stats = useMemo(() => {
    const totalSteps = nodes.length;
    const avgConfidence = totalSteps > 0
      ? nodes.reduce((sum, n) => sum + (n.confidence || 0), 0) / totalSteps
      : 0;
    const totalDuration = nodes.reduce((sum, n) => sum + (n.duration || 0), 0);
    return { totalSteps, avgConfidence, totalDuration };
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8', className)}>
        <Brain className="w-10 h-10 text-neutral-600 mb-3" />
        <p className="text-sm text-neutral-500">No reasoning steps yet</p>
        <p className="text-xs text-neutral-600 mt-1">Agent thinking will appear here</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border border-neutral-700/50 bg-neutral-900/50',
        isFullscreen && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Reasoning Chain</h3>
            <p className="text-xs text-neutral-400">
              {stats.totalSteps} steps
              {showConfidence && stats.avgConfidence > 0 && (
                <span className={cn('ml-2', getConfidenceColor(stats.avgConfidence))}>
                  • {(stats.avgConfidence * 100).toFixed(0)}% avg confidence
                </span>
              )}
              {showTiming && stats.totalDuration > 0 && (
                <span className="ml-2 text-neutral-500">
                  • {formatDuration(stats.totalDuration)} total
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto p-3"
        style={{ maxHeight: isFullscreen ? 'calc(100vh - 120px)' : maxHeight }}
      >
        <div className="space-y-3">
          {nodes.map((node, index) => (
            <div key={node.id} className="relative">
              {/* Connector line between nodes */}
              {index < nodes.length - 1 && layout === 'linear' && (
                <div className="absolute left-5 top-full h-3 w-0.5 bg-neutral-700" />
              )}

              <ReasoningNodeCard
                node={node}
                isActive={node.id === activeNodeId}
                isExpanded={expandedNodes.has(node.id)}
                onToggle={() => toggleNode(node.id)}
                showConfidence={showConfidence}
                showTiming={showTiming}
                expandable={expandable}
                compact={compact}
                depth={0}
              />
            </div>
          ))}
        </div>

        {/* Active indicator */}
        {activeNodeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-4 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-purple-500"
            />
            <span className="text-xs text-purple-400">Processing...</span>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-3 border-t border-neutral-700/50 text-xs">
        {Object.entries(TYPE_CONFIG).slice(0, 5).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5">
            <config.icon className={cn('w-3 h-3', config.color)} />
            <span className="text-neutral-500">{config.label}</span>
          </div>
        ))}
        <span className="text-neutral-600">+{Object.keys(TYPE_CONFIG).length - 5} more</span>
      </div>
    </div>
  );
};

export default ReasoningChainViewer;
