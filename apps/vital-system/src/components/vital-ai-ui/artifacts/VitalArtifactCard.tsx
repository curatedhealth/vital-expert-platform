'use client';

/**
 * VITAL Platform - VitalArtifactCard Component
 *
 * Inline artifact preview card that appears in chat messages.
 * Clicking expands to the full ArtifactPanel.
 *
 * Features:
 * - Compact preview with type icon
 * - Hover to preview first 100 chars
 * - Click to open in ArtifactPanel
 * - Quick actions without opening panel
 * - Mode-based theming (blue for interactive, purple for autonomous)
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 *
 * Audit Fixes Applied (December 11, 2025):
 * - Added mode-based color theming
 * - Enhanced visual feedback
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Download,
  Copy,
  Check,
  FileText,
  Code,
  BarChart3,
  Table,
  GitBranch,
  File,
} from 'lucide-react';
import type { Artifact, ArtifactType } from './VitalArtifactPanel';

// =============================================================================
// TYPES
// =============================================================================

/** Mode type for theming: interactive (1,2) or autonomous (3,4) */
export type ArtifactMode = 'interactive' | 'autonomous';

export interface VitalArtifactCardProps {
  /** The artifact to display */
  artifact: Artifact;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Mode for theming - interactive (blue) or autonomous (purple) */
  mode?: ArtifactMode;
  /** Called when card is clicked (to open panel) */
  onExpand?: (artifact: Artifact) => void;
  /** Called when download is requested */
  onDownload?: (artifact: Artifact) => void;
  /** Called when copy is requested */
  onCopy?: (artifact: Artifact) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// MODE-BASED THEMING
// =============================================================================

/**
 * Mode-based theming for artifact cards
 * - Interactive (Modes 1 & 2): Blue theme - direct user engagement
 * - Autonomous (Modes 3 & 4): Purple theme - AI-driven workflows
 */
const MODE_THEME: Record<ArtifactMode, {
  accent: string;
  accentBg: string;
  hoverBorder: string;
  chevronColor: string;
}> = {
  interactive: {
    accent: 'text-blue-600',
    accentBg: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-400/50',
    chevronColor: 'text-blue-600',
  },
  autonomous: {
    accent: 'text-[var(--ae-accent-primary,#9055E0)]',
    accentBg: 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
    hoverBorder: 'hover:border-[var(--ae-accent-primary,#9055E0)]/30',
    chevronColor: 'text-[var(--ae-accent-primary,#9055E0)]',
  },
};

// =============================================================================
// ARTIFACT TYPE ICONS & COLORS
// =============================================================================

const ARTIFACT_CONFIG: Record<ArtifactType, {
  icon: typeof FileText;
  label: string;
  bgColor: string;
  iconColor: string;
}> = {
  document: {
    icon: FileText,
    label: 'Document',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  code: {
    icon: Code,
    label: 'Code',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  chart: {
    icon: BarChart3,
    label: 'Chart',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  table: {
    icon: Table,
    label: 'Data Table',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  diagram: {
    icon: GitBranch,
    label: 'Diagram',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  image: {
    icon: File,
    label: 'Image',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  generic: {
    icon: File,
    label: 'File',
    bgColor: 'bg-stone-100',
    iconColor: 'text-stone-600',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalArtifactCard({
  artifact,
  compact = false,
  mode = 'autonomous',
  onExpand,
  onDownload,
  onCopy,
  className,
}: VitalArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const config = ARTIFACT_CONFIG[artifact.type];
  const modeTheme = MODE_THEME[mode];
  const Icon = config.icon;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(artifact);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [artifact, onCopy]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(artifact);
  }, [artifact, onDownload]);

  const handleClick = useCallback(() => {
    onExpand?.(artifact);
  }, [artifact, onExpand]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={cn(
        'border rounded-lg bg-white overflow-hidden',
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        modeTheme.hoverBorder,
        compact ? 'p-3' : 'p-4',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Open ${artifact.title} artifact`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'p-2 rounded-lg shrink-0',
          config.bgColor
        )}>
          <Icon className={cn('h-5 w-5', config.iconColor)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-stone-800 truncate">
              {artifact.title}
            </h4>
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
            >
              <ChevronRight className={cn('h-4 w-4', modeTheme.chevronColor)} />
            </motion.div>
          </div>

          <p className="text-xs text-stone-500 mt-0.5">
            {config.label}
            {artifact.metadata?.wordCount && ` • ${artifact.metadata.wordCount} words`}
            {artifact.metadata?.lineCount && ` • ${artifact.metadata.lineCount} lines`}
            {artifact.language && ` • ${artifact.language}`}
          </p>

          {/* Preview (non-compact only) */}
          {!compact && artifact.type === 'document' && (
            <p className="text-sm text-stone-600 mt-2 line-clamp-2">
              {artifact.content.slice(0, 150)}
              {artifact.content.length > 150 && '...'}
            </p>
          )}

          {!compact && artifact.type === 'code' && (
            <pre className="text-xs text-stone-600 mt-2 line-clamp-2 font-mono bg-stone-50 p-2 rounded">
              {artifact.content.slice(0, 100)}
              {artifact.content.length > 100 && '...'}
            </pre>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }}
          className="flex gap-2 mt-3 pt-3 border-t overflow-hidden"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-stone-600 h-8"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </>
            )}
          </Button>

          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-stone-600 h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
          )}

          <div className="flex-1" />

          <span className="text-xs text-stone-400 self-center">
            Click to expand
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default VitalArtifactCard;
