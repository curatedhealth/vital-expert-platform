'use client';

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Plus,
  Minus,
  ArrowLeftRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type DiffViewMode = 'unified' | 'split' | 'inline';
export type ContentType = 'text' | 'code' | 'table' | 'json';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldLine?: string;
  newLine?: string;
  lineNumber?: {
    old?: number;
    new?: number;
  };
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
  startLine: { old: number; new: number };
}

export interface VitalDiffViewProps {
  /** Title for the diff */
  title?: string;
  /** Left/old version label */
  oldLabel?: string;
  /** Right/new version label */
  newLabel?: string;
  /** Left/old content */
  oldContent: string;
  /** Right/new content */
  newContent: string;
  /** Pre-computed diff hunks (optional, will compute if not provided) */
  hunks?: DiffHunk[];
  /** Content type */
  contentType?: ContentType;
  /** View mode */
  mode?: DiffViewMode;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Highlight syntax (for code) */
  highlightSyntax?: boolean;
  /** Language for syntax highlighting */
  language?: string;
  /** Callback when view mode changes */
  onModeChange?: (mode: DiffViewMode) => void;
  /** Custom class name */
  className?: string;
}

/**
 * VitalDiffView - Comparative Analysis
 * 
 * Highlights changes between two versions of an Artifact (e.g., "Draft 1 vs Draft 2").
 * Green/Red inline highlighting for text; cell highlighting for data tables.
 * 
 * @example
 * ```tsx
 * <VitalDiffView
 *   title="Report Comparison"
 *   oldLabel="Draft 1"
 *   newLabel="Draft 2"
 *   oldContent={draft1Text}
 *   newContent={draft2Text}
 *   mode="split"
 * />
 * ```
 */
export function VitalDiffView({
  title,
  oldLabel = 'Before',
  newLabel = 'After',
  oldContent,
  newContent,
  hunks: propHunks,
  contentType = 'text',
  mode: initialMode = 'split',
  showLineNumbers = true,
  highlightSyntax = false,
  language,
  onModeChange,
  className,
}: VitalDiffViewProps) {
  const [mode, setMode] = useState<DiffViewMode>(initialMode);
  const [copied, setCopied] = useState<'old' | 'new' | null>(null);
  const [expandedHunks, setExpandedHunks] = useState<Set<number>>(new Set([0]));

  // Compute diff if not provided
  const diffResult = useMemo(() => {
    if (propHunks) return { hunks: propHunks, stats: computeStats(propHunks) };
    return computeDiff(oldContent, newContent);
  }, [oldContent, newContent, propHunks]);

  const { hunks, stats } = diffResult;

  const handleModeChange = (newMode: DiffViewMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const handleCopy = async (content: string, which: 'old' | 'new') => {
    await navigator.clipboard.writeText(content);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleHunk = (index: number) => {
    const newExpanded = new Set(expandedHunks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHunks(newExpanded);
  };

  const renderLine = (line: DiffLine, index: number) => {
    const bgColor = {
      added: 'bg-green-50 dark:bg-green-950/30',
      removed: 'bg-red-50 dark:bg-red-950/30',
      modified: 'bg-amber-50 dark:bg-amber-950/30',
      unchanged: '',
    }[line.type];

    const textColor = {
      added: 'text-green-700 dark:text-green-300',
      removed: 'text-red-700 dark:text-red-300',
      modified: 'text-amber-700 dark:text-amber-300',
      unchanged: 'text-foreground',
    }[line.type];

    const icon = {
      added: <Plus className="h-3 w-3 text-green-600" />,
      removed: <Minus className="h-3 w-3 text-red-600" />,
      modified: <ArrowLeftRight className="h-3 w-3 text-amber-600" />,
      unchanged: <span className="w-3" />,
    }[line.type];

    if (mode === 'unified') {
      return (
        <div
          key={index}
          className={cn('flex items-start font-mono text-sm', bgColor)}
        >
          {showLineNumbers && (
            <span className="w-16 px-2 text-xs text-muted-foreground text-right border-r select-none">
              {line.lineNumber?.old || ''} {line.lineNumber?.new || ''}
            </span>
          )}
          <span className="w-6 flex items-center justify-center flex-shrink-0">
            {icon}
          </span>
          <span className={cn('flex-1 px-2 whitespace-pre-wrap', textColor)}>
            {line.newLine || line.oldLine}
          </span>
        </div>
      );
    }

    if (mode === 'split') {
      return (
        <div key={index} className="flex font-mono text-sm">
          {/* Old side */}
          <div
            className={cn(
              'flex-1 flex items-start border-r',
              line.type === 'removed' || line.type === 'modified'
                ? 'bg-red-50 dark:bg-red-950/30'
                : ''
            )}
          >
            {showLineNumbers && (
              <span className="w-10 px-2 text-xs text-muted-foreground text-right border-r select-none">
                {line.lineNumber?.old || ''}
              </span>
            )}
            <span
              className={cn(
                'flex-1 px-2 whitespace-pre-wrap',
                (line.type === 'removed' || line.type === 'modified') &&
                  'text-red-700 dark:text-red-300'
              )}
            >
              {line.oldLine || ''}
            </span>
          </div>

          {/* New side */}
          <div
            className={cn(
              'flex-1 flex items-start',
              line.type === 'added' || line.type === 'modified'
                ? 'bg-green-50 dark:bg-green-950/30'
                : ''
            )}
          >
            {showLineNumbers && (
              <span className="w-10 px-2 text-xs text-muted-foreground text-right border-r select-none">
                {line.lineNumber?.new || ''}
              </span>
            )}
            <span
              className={cn(
                'flex-1 px-2 whitespace-pre-wrap',
                (line.type === 'added' || line.type === 'modified') &&
                  'text-green-700 dark:text-green-300'
              )}
            >
              {line.newLine || ''}
            </span>
          </div>
        </div>
      );
    }

    // Inline mode
    return (
      <span
        key={index}
        className={cn(
          'whitespace-pre-wrap',
          line.type === 'added' && 'bg-green-200 dark:bg-green-900/50',
          line.type === 'removed' && 'bg-red-200 dark:bg-red-900/50 line-through',
          line.type === 'modified' && 'bg-amber-200 dark:bg-amber-900/50'
        )}
      >
        {line.newLine || line.oldLine}
      </span>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          {title && <h3 className="font-medium text-sm">{title}</h3>}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1 text-green-600">
              <Plus className="h-3 w-3" />
              {stats.added}
            </Badge>
            <Badge variant="outline" className="gap-1 text-red-600">
              <Minus className="h-3 w-3" />
              {stats.removed}
            </Badge>
            {stats.modified > 0 && (
              <Badge variant="outline" className="gap-1 text-amber-600">
                <ArrowLeftRight className="h-3 w-3" />
                {stats.modified}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <Select value={mode} onValueChange={(v) => handleModeChange(v as DiffViewMode)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split">Split</SelectItem>
              <SelectItem value="unified">Unified</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Labels Row (for split view) */}
      {mode === 'split' && (
        <div className="flex border-b bg-muted/30">
          <div className="flex-1 px-3 py-2 border-r">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {oldLabel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(oldContent, 'old')}
              >
                {copied === 'old' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex-1 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {newLabel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(newContent, 'new')}
              >
                {copied === 'new' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Content */}
      <ScrollArea className="max-h-[500px]">
        {mode === 'inline' ? (
          <div className="p-4 font-mono text-sm whitespace-pre-wrap">
            {hunks.map((hunk) => hunk.lines.map(renderLine))}
          </div>
        ) : (
          <div>
            {hunks.map((hunk, hunkIndex) => (
              <div key={hunkIndex}>
                {/* Hunk Header */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 text-xs text-muted-foreground cursor-pointer hover:bg-muted"
                  onClick={() => toggleHunk(hunkIndex)}
                >
                  {expandedHunks.has(hunkIndex) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronUp className="h-3 w-3" />
                  )}
                  <span className="font-mono">{hunk.header}</span>
                </div>

                {/* Hunk Lines */}
                {expandedHunks.has(hunkIndex) && (
                  <div>{hunk.lines.map(renderLine)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Helper functions
function computeDiff(oldText: string, newText: string): { hunks: DiffHunk[]; stats: { added: number; removed: number; modified: number } } {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const lines: DiffLine[] = [];
  let added = 0, removed = 0, modified = 0;

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      lines.push({ type: 'added', newLine, lineNumber: { new: i + 1 } });
      added++;
    } else if (newLine === undefined) {
      lines.push({ type: 'removed', oldLine, lineNumber: { old: i + 1 } });
      removed++;
    } else if (oldLine !== newLine) {
      lines.push({ type: 'modified', oldLine, newLine, lineNumber: { old: i + 1, new: i + 1 } });
      modified++;
    } else {
      lines.push({ type: 'unchanged', oldLine, newLine, lineNumber: { old: i + 1, new: i + 1 } });
    }
  }

  return {
    hunks: [{ header: `@@ -1,${oldLines.length} +1,${newLines.length} @@`, lines, startLine: { old: 1, new: 1 } }],
    stats: { added, removed, modified }
  };
}

function computeStats(hunks: DiffHunk[]): { added: number; removed: number; modified: number } {
  let added = 0, removed = 0, modified = 0;
  hunks.forEach(hunk => {
    hunk.lines.forEach(line => {
      if (line.type === 'added') added++;
      if (line.type === 'removed') removed++;
      if (line.type === 'modified') modified++;
    });
  });
  return { added, removed, modified };
}

export default VitalDiffView;
