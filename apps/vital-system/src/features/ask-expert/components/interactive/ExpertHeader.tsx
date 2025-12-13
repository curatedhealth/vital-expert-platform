'use client';

/**
 * VITAL Platform - ExpertHeader Component
 *
 * Header displaying the selected expert during conversation.
 * Shows avatar, name, level, status, and quick actions.
 *
 * Features:
 * - Expert avatar with online/busy status
 * - Level badge (L1-L5)
 * - Expandable expert details
 * - Quick switch expert action
 * - Conversation controls
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  RefreshCw,
  Info,
  ChevronDown,
  X,
  Brain,
  Sparkles,
  History,
  Settings,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Expert } from './ExpertPicker';
import { VitalLevelBadge } from './AgentSelectionCard';

// =============================================================================
// TYPES
// =============================================================================

export interface ExpertHeaderProps {
  /** Currently selected expert */
  expert: Expert;
  /** Current status */
  status?: 'idle' | 'thinking' | 'streaming' | 'error';
  /** Mode indicator */
  mode?: 'mode1' | 'mode2';
  /** Called when user wants to switch expert */
  onSwitchExpert?: () => void;
  /** Called when user wants to clear conversation */
  onClearConversation?: () => void;
  /** Called when user wants to view history */
  onViewHistory?: () => void;
  /** Called when close is clicked */
  onClose?: () => void;
  /** Whether to show compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

// Brand v6.0 Purple-centric status colors
const STATUS_CONFIG: Record<string, { color: string; label: string; pulse: boolean }> = {
  idle: { color: 'bg-green-500', label: 'Ready', pulse: false },
  thinking: { color: 'bg-violet-500', label: 'Thinking', pulse: true },
  streaming: { color: 'bg-purple-500', label: 'Responding', pulse: true },
  error: { color: 'bg-red-500', label: 'Error', pulse: false },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ExpertHeader({
  expert,
  status = 'idle',
  mode = 'mode1',
  onSwitchExpert,
  onClearConversation,
  onViewHistory,
  onClose,
  compact = false,
  className,
}: ExpertHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const statusConfig = STATUS_CONFIG[status];

  const handleToggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  // =========================================================================
  // COMPACT MODE
  // =========================================================================

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 px-4 py-2 border-b bg-white/80 backdrop-blur-sm',
        className
      )}>
        {/* Avatar with status */}
        <div className="relative">
          {expert.avatar ? (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              {expert.name.charAt(0)}
            </div>
          )}
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
            statusConfig.color,
            statusConfig.pulse && 'animate-pulse'
          )} />
        </div>

        {/* Name and level */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{expert.name}</span>
            <VitalLevelBadge level={expert.level} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // =========================================================================
  // FULL MODE
  // =========================================================================

  return (
    <div className={cn(
      'border-b bg-gradient-to-r from-purple-50/50 to-white',
      className
    )}>
      {/* Main header row */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Avatar with status indicator */}
        <div className="relative">
          {expert.avatar ? (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white shadow-md">
              {expert.name.charAt(0)}
            </div>
          )}
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
            statusConfig.color,
            statusConfig.pulse && 'animate-pulse'
          )} />
        </div>

        {/* Expert info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-lg text-slate-900 truncate">
              {expert.name}
            </h2>
            <VitalLevelBadge level={expert.level} size="md" />
            {mode === 'mode2' && (
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Selected
              </Badge>
            )}
          </div>

          {expert.tagline && (
            <p className="text-sm text-slate-600 truncate">
              {expert.tagline}
            </p>
          )}

          {/* Status text */}
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              'text-xs font-medium',
              status === 'error' ? 'text-red-600' : 'text-slate-500'
            )}>
              {statusConfig.label}
            </span>
            {expert.domain && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">{expert.domain}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Details toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleDetails}
            className="gap-1"
          >
            <Info className="h-4 w-4" />
            <ChevronDown className={cn(
              'h-3 w-3 transition-transform',
              showDetails && 'rotate-180'
            )} />
          </Button>

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSwitchExpert && (
                <DropdownMenuItem onClick={onSwitchExpert}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Switch Expert
                </DropdownMenuItem>
              )}
              {onViewHistory && (
                <DropdownMenuItem onClick={onViewHistory}>
                  <History className="h-4 w-4 mr-2" />
                  View History
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onClearConversation && (
                <DropdownMenuItem onClick={onClearConversation} className="text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Clear Conversation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close button */}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expandable details section */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pt-2 border-t border-slate-100">
              {/* Description */}
              {expert.description && (
                <p className="text-sm text-slate-600 mb-3">
                  {expert.description}
                </p>
              )}

              {/* Expertise tags */}
              {expert.expertise && expert.expertise.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-slate-500 mb-1.5">Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {expert.expertise.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              {expert.capabilities && expert.capabilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 mb-1.5">Capabilities</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {expert.capabilities.slice(0, 5).map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Brain className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExpertHeader;
