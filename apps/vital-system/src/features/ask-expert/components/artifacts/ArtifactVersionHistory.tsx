'use client';

/**
 * VITAL Platform - Artifact Version History Component
 *
 * Displays version history for artifacts with diff viewing,
 * restore functionality, and timeline visualization.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Eye,
  GitBranch,
  Check,
  AlertCircle,
  FileEdit,
  Plus,
  Minus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtifactData } from './ArtifactPreview';

// =============================================================================
// TYPES
// =============================================================================

export type ChangeType = 'created' | 'modified' | 'restored' | 'auto_saved';

export interface VersionAuthor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface ContentDiff {
  /** Lines added */
  additions: number;
  /** Lines removed */
  deletions: number;
  /** Changed sections summary */
  summary?: string;
  /** Detailed line-by-line diff (optional) */
  hunks?: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface ArtifactVersion {
  id: string;
  versionNumber: number;
  timestamp: string | number;
  author?: VersionAuthor;
  changeType: ChangeType;
  changeDescription?: string;
  /** Content snapshot at this version */
  content: string;
  /** Size in bytes */
  size: number;
  /** Diff from previous version */
  diff?: ContentDiff;
  /** Whether this is the current version */
  isCurrent?: boolean;
  /** Tags/labels for this version */
  tags?: string[];
}

export interface ArtifactVersionHistoryProps {
  /** Current artifact */
  artifact: ArtifactData;
  /** Version history */
  versions: ArtifactVersion[];
  /** Called when user wants to preview a version */
  onPreviewVersion?: (version: ArtifactVersion) => void;
  /** Called when user wants to restore a version */
  onRestoreVersion?: (version: ArtifactVersion) => void;
  /** Called when user wants to compare versions */
  onCompareVersions?: (v1: ArtifactVersion, v2: ArtifactVersion) => void;
  /** Whether restore is allowed */
  canRestore?: boolean;
  /** Maximum versions to show before collapse */
  maxVisible?: number;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(ts: string | number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatFullTimestamp(ts: string | number): string {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getChangeIcon(type: ChangeType): React.ReactNode {
  const icons: Record<ChangeType, React.ReactNode> = {
    created: <Plus className="w-3 h-3" />,
    modified: <FileEdit className="w-3 h-3" />,
    restored: <RotateCcw className="w-3 h-3" />,
    auto_saved: <Clock className="w-3 h-3" />,
  };
  return icons[type];
}

function getChangeColor(type: ChangeType): string {
  const colors: Record<ChangeType, string> = {
    created: 'bg-green-100 text-green-600',
    modified: 'bg-blue-100 text-blue-600',
    restored: 'bg-amber-100 text-amber-600',
    auto_saved: 'bg-slate-100 text-slate-500',
  };
  return colors[type];
}

function getChangeLabel(type: ChangeType): string {
  const labels: Record<ChangeType, string> = {
    created: 'Created',
    modified: 'Modified',
    restored: 'Restored',
    auto_saved: 'Auto-saved',
  };
  return labels[type];
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function DiffStats({ diff }: { diff: ContentDiff }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {diff.additions > 0 && (
        <span className="flex items-center gap-0.5 text-green-600">
          <Plus className="w-3 h-3" />
          {diff.additions}
        </span>
      )}
      {diff.deletions > 0 && (
        <span className="flex items-center gap-0.5 text-red-600">
          <Minus className="w-3 h-3" />
          {diff.deletions}
        </span>
      )}
    </div>
  );
}

function DiffViewer({ hunks }: { hunks: DiffHunk[] }) {
  return (
    <div className="mt-2 rounded-lg border bg-slate-50 overflow-hidden font-mono text-xs">
      {hunks.map((hunk, hunkIdx) => (
        <div key={hunkIdx} className="border-b last:border-b-0">
          <div className="px-3 py-1 bg-slate-100 text-slate-500">
            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
          </div>
          {hunk.lines.map((line, lineIdx) => (
            <div
              key={lineIdx}
              className={cn(
                'px-3 py-0.5 whitespace-pre-wrap',
                line.type === 'add' && 'bg-green-50 text-green-800',
                line.type === 'remove' && 'bg-red-50 text-red-800',
                line.type === 'context' && 'text-slate-600'
              )}
            >
              <span className="inline-block w-4 text-slate-400 select-none">
                {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
              </span>
              {line.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function VersionCard({
  version,
  isExpanded,
  onToggle,
  onPreview,
  onRestore,
  canRestore,
}: {
  version: ArtifactVersion;
  isExpanded: boolean;
  onToggle: () => void;
  onPreview?: () => void;
  onRestore?: () => void;
  canRestore: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border bg-white transition-shadow',
        version.isCurrent && 'border-purple-200 ring-1 ring-purple-100',
        isExpanded && 'shadow-md'
      )}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
      >
        {/* Timeline dot */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              getChangeColor(version.changeType)
            )}
          >
            {getChangeIcon(version.changeType)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-slate-900">
              v{version.versionNumber}
            </span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                getChangeColor(version.changeType)
              )}
            >
              {getChangeLabel(version.changeType)}
            </span>
            {version.isCurrent && (
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-xs font-medium">
                Current
              </span>
            )}
            {version.tags?.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span title={formatFullTimestamp(version.timestamp)}>
              {formatTimestamp(version.timestamp)}
            </span>
            {version.author && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {version.author.name}
              </span>
            )}
            <span>{formatSize(version.size)}</span>
            {version.diff && <DiffStats diff={version.diff} />}
          </div>

          {version.changeDescription && (
            <p className="mt-1 text-xs text-slate-600 line-clamp-1">
              {version.changeDescription}
            </p>
          )}
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t bg-slate-50/50">
              {/* Actions */}
              <div className="flex items-center gap-2 py-2">
                {onPreview && (
                  <button
                    onClick={onPreview}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                )}
                {onRestore && !version.isCurrent && canRestore && (
                  <button
                    onClick={onRestore}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                )}
              </div>

              {/* Diff details */}
              {version.diff?.summary && (
                <p className="text-xs text-slate-600 mb-2">{version.diff.summary}</p>
              )}

              {version.diff?.hunks && version.diff.hunks.length > 0 && (
                <DiffViewer hunks={version.diff.hunks} />
              )}

              {/* Content preview if no diff */}
              {!version.diff?.hunks && (
                <div className="rounded-lg border bg-white p-2 max-h-32 overflow-auto">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                    {version.content.slice(0, 500)}
                    {version.content.length > 500 && '...'}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ArtifactVersionHistory({
  artifact,
  versions,
  onPreviewVersion,
  onRestoreVersion,
  onCompareVersions,
  canRestore = true,
  maxVisible = 10,
  className,
}: ArtifactVersionHistoryProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Sort versions by timestamp (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => {
      const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
      const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
      return bTime - aTime;
    });
  }, [versions]);

  const visibleVersions = showAll ? sortedVersions : sortedVersions.slice(0, maxVisible);
  const hasMore = sortedVersions.length > maxVisible;

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCompareToggle = (versionId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2 && onCompareVersions) {
      const v1 = versions.find((v) => v.id === selectedForCompare[0]);
      const v2 = versions.find((v) => v.id === selectedForCompare[1]);
      if (v1 && v2) {
        onCompareVersions(v1, v2);
      }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAdditions = versions.reduce((sum, v) => sum + (v.diff?.additions || 0), 0);
    const totalDeletions = versions.reduce((sum, v) => sum + (v.diff?.deletions || 0), 0);
    const authors = new Set(versions.filter((v) => v.author).map((v) => v.author!.id));
    return { totalAdditions, totalDeletions, authorCount: authors.size };
  }, [versions]);

  if (versions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm text-slate-500">No version history available</p>
        <p className="text-xs text-slate-400 mt-1">
          Changes will be tracked as you edit this artifact
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-900">Version History</h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
            {versions.length} versions
          </span>
        </div>

        {onCompareVersions && versions.length >= 2 && (
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedForCompare([]);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              compareMode
                ? 'bg-purple-100 text-purple-700'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <GitBranch className="w-4 h-4" />
            {compareMode ? 'Cancel' : 'Compare'}
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 p-2 rounded-lg bg-slate-50 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {versions.length} revisions
        </span>
        <span className="flex items-center gap-1 text-green-600">
          <Plus className="w-3.5 h-3.5" />
          {stats.totalAdditions} additions
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <Minus className="w-3.5 h-3.5" />
          {stats.totalDeletions} deletions
        </span>
        {stats.authorCount > 0 && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {stats.authorCount} contributor{stats.authorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Compare mode instructions */}
      {compareMode && (
        <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-700">
              Select 2 versions to compare ({selectedForCompare.length}/2 selected)
            </p>
            {selectedForCompare.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Compare Selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Version list */}
      <div className="space-y-2">
        {visibleVersions.map((version) => (
          <div key={version.id} className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-200" />

            {/* Compare checkbox */}
            {compareMode && (
              <div className="absolute left-0 top-3 z-10">
                <button
                  onClick={() => handleCompareToggle(version.id)}
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    selectedForCompare.includes(version.id)
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-slate-300 hover:border-purple-400'
                  )}
                >
                  {selectedForCompare.includes(version.id) && <Check className="w-3 h-3" />}
                </button>
              </div>
            )}

            <div className={cn(compareMode && 'ml-8')}>
              <VersionCard
                version={version}
                isExpanded={expandedIds.has(version.id)}
                onToggle={() => toggleExpanded(version.id)}
                onPreview={onPreviewVersion ? () => onPreviewVersion(version) : undefined}
                onRestore={onRestoreVersion ? () => onRestoreVersion(version) : undefined}
                canRestore={canRestore}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          Show {sortedVersions.length - maxVisible} more versions
        </button>
      )}
    </div>
  );
}

export default ArtifactVersionHistory;
