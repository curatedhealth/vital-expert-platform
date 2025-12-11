'use client';

/**
 * VITAL Platform - AgentSelectionCard Component
 *
 * Displays the AI-selected expert with confidence score and reasoning.
 * Appears in Mode 2 and Mode 4 after Fusion Intelligence selects an expert.
 *
 * Features:
 * - Animated entrance with scale effect
 * - Confidence badge with color coding
 * - Expandable reasoning section
 * - Level badge indicator (L1-L5)
 * - Alternative experts suggestion
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

import type { Expert } from './ExpertPicker';
import type { AgentSelectedEvent } from '../../hooks/streamReducer';

// =============================================================================
// TYPES
// =============================================================================

export interface AgentSelectionCardProps {
  /** Selected agent from stream event or FusionResult */
  agent: AgentSelectedEvent | Expert;
  /** Confidence score (0-1) - defaults to agent's confidence if available */
  confidence?: number;
  /** AI reasoning for the selection */
  reason?: string;
  /** Show in compact mode (inline in messages) */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// LEVEL BADGE CONFIG
// =============================================================================

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  L1: { label: 'Master', color: 'text-purple-700', bgColor: 'bg-purple-100', description: 'Strategic orchestrator' },
  L2: { label: 'Expert', color: 'text-blue-700', bgColor: 'bg-blue-100', description: 'Domain specialist' },
  L3: { label: 'Specialist', color: 'text-emerald-700', bgColor: 'bg-emerald-100', description: 'Task specialist' },
  L4: { label: 'Worker', color: 'text-amber-700', bgColor: 'bg-amber-100', description: 'Execution agent' },
  L5: { label: 'Tool', color: 'text-slate-700', bgColor: 'bg-slate-100', description: 'Utility tool' },
};

// =============================================================================
// CONFIDENCE COLORS
// =============================================================================

function getConfidenceColor(confidence: number): { text: string; bg: string; border: string } {
  if (confidence >= 0.9) {
    return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' };
  } else if (confidence >= 0.75) {
    return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' };
  } else if (confidence >= 0.6) {
    return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' };
  } else {
    return { text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-300' };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentSelectionCard({
  agent,
  confidence: propConfidence,
  reason: propReason,
  compact = false,
  className,
}: AgentSelectionCardProps) {
  const [showDetails, setShowDetails] = useState(!compact);

  // Normalize agent data (can come from stream event or Expert type)
  const agentId = 'agentId' in agent ? agent.agentId : agent.id;
  const agentName = 'agentName' in agent ? agent.agentName : agent.name;
  const level = 'level' in agent ? agent.level : (agent as Expert).level;
  const domain = 'domain' in agent ? agent.domain : (agent as Expert).domain;
  const confidence = propConfidence ?? ('confidence' in agent ? agent.confidence : 0.85);
  const reason = propReason ?? ('selectionReason' in agent ? agent.selectionReason : undefined);

  const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG.L3;
  const confidenceColors = getConfidenceColor(confidence);

  const handleToggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  // =========================================================================
  // COMPACT RENDER
  // =========================================================================

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
          confidenceColors.bg,
          'border',
          confidenceColors.border,
          className
        )}
      >
        <Target className={cn('h-3.5 w-3.5', confidenceColors.text)} />
        <span className="text-sm font-medium text-slate-700">{agentName}</span>
        <Badge className={cn('text-xs', levelConfig.bgColor, levelConfig.color)}>
          {levelConfig.label}
        </Badge>
        <span className={cn('text-xs font-medium', confidenceColors.text)}>
          {Math.round(confidence * 100)}%
        </span>
      </motion.div>
    );
  }

  // =========================================================================
  // FULL RENDER
  // =========================================================================

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'rounded-xl border-2 overflow-hidden',
        confidenceColors.bg,
        confidenceColors.border,
        className
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection indicator icon */}
          <div className={cn(
            'p-2 rounded-full shrink-0',
            confidence >= 0.9 ? 'bg-green-100' : 'bg-blue-100'
          )}>
            {confidence >= 0.9 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-xs font-medium uppercase tracking-wide',
                confidenceColors.text
              )}>
                <Sparkles className="h-3 w-3 inline mr-1" />
                VITAL Selected
              </span>
              <Badge variant="outline" className={cn(
                'text-xs',
                confidenceColors.border,
                confidenceColors.text
              )}>
                {Math.round(confidence * 100)}% match
              </Badge>
            </div>

            {/* Agent name and level */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-xs', levelConfig.bgColor, levelConfig.color)}>
                {level} {levelConfig.label}
              </Badge>
              <h3 className="font-semibold text-slate-900 truncate">
                {agentName}
              </h3>
            </div>

            {/* Domain */}
            {domain && (
              <p className="text-sm text-slate-600 mt-1">
                {domain}
              </p>
            )}
          </div>
        </div>

        {/* Reasoning (expandable) */}
        {reason && (
          <>
            <button
              onClick={handleToggleDetails}
              className="mt-3 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors w-full"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Why this expert?</span>
              <ChevronDown className={cn(
                'h-4 w-4 ml-auto transition-transform',
                showDetails && 'rotate-180'
              )} />
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-600 italic">
                    "{reason}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// LEVEL BADGE COMPONENT (Exported for reuse)
// =============================================================================

export interface VitalLevelBadgeProps {
  level: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function VitalLevelBadge({
  level,
  size = 'md',
  showLabel = true,
  className,
}: VitalLevelBadgeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.L3;

  return (
    <Badge
      className={cn(
        config.bgColor,
        config.color,
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs',
        className
      )}
    >
      {level}
      {showLabel && ` ${config.label}`}
    </Badge>
  );
}

export default AgentSelectionCard;
