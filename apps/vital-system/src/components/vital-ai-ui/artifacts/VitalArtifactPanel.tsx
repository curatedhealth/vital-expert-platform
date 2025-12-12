'use client';

/**
 * VITAL Platform - VitalArtifactPanel Component
 *
 * Horizontal artifact capability that slides in from the right in any mode.
 * Implements Claude.ai-style artifact editing with multiple renderers.
 *
 * Features:
 * - Slides in from right edge (320-900px width, resizable)
 * - Multiple artifact types: document, code, chart, table, diagram
 * - Keyboard shortcuts: Cmd+] toggle, Escape close
 * - Accessible: focus trap, ARIA labels, keyboard hints
 * - Brand v6.0 styling with mode-aware theming
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 *
 * Audit Fixes Applied (December 11, 2025):
 * - Fixed memory leak in event listeners (memoized callbacks)
 * - Added error handling for download with large files
 * - Added resize cursor cleanup on unmount
 * - Added focus trap for accessibility
 * - Enhanced header with metadata display
 * - Added ARIA labels and keyboard hints
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Share2,
  Edit3,
  Check,
  FileText,
  Code,
  BarChart3,
  Table,
  GitBranch,
  File,
  GripVertical,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Bot,
  Clock,
} from 'lucide-react';

// Import dedicated artifact renderers
import {
  MarkdownRenderer,
  CodeRenderer,
  ChartRenderer,
  TableRenderer,
} from '@/features/ask-expert/components/artifacts/renderers';

// =============================================================================
// TYPES
// =============================================================================

export type ArtifactType =
  | 'document'
  | 'code'
  | 'chart'
  | 'table'
  | 'diagram'
  | 'image'
  | 'generic';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string; // For code artifacts
  metadata?: {
    wordCount?: number;
    lineCount?: number;
    generatedBy?: string;
    agentName?: string;
    model?: string;
    createdAt?: string;
    version?: number;
  };
  actions?: ('download' | 'copy' | 'share' | 'edit' | 'regenerate')[];
}

// Maximum artifact size for rendering (10MB) - larger files should download
const MAX_ARTIFACT_RENDER_SIZE = 10 * 1024 * 1024;

export interface VitalArtifactPanelProps {
  /** Currently active artifact */
  artifact: Artifact | null;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Called when panel should close */
  onClose: () => void;
  /** Called when artifact content changes (for editing) */
  onContentChange?: (artifactId: string, content: string) => void;
  /** Called when user requests artifact regeneration */
  onRegenerate?: (artifactId: string) => void;
  /** Called when user downloads artifact */
  onDownload?: (artifact: Artifact) => void;
  /** Called when user copies artifact */
  onCopy?: (artifact: Artifact) => void;
  /** Called when user shares artifact */
  onShare?: (artifact: Artifact) => void;
  /** Initial width (default: 480) */
  initialWidth?: number;
  /** Minimum width (default: 320) */
  minWidth?: number;
  /** Maximum width (default: 900) */
  maxWidth?: number;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// ARTIFACT TYPE ICONS
// =============================================================================

const ARTIFACT_ICONS: Record<ArtifactType, typeof FileText> = {
  document: FileText,
  code: Code,
  chart: BarChart3,
  table: Table,
  diagram: GitBranch,
  image: File,
  generic: File,
};

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  document: 'Document',
  code: 'Code',
  chart: 'Chart',
  table: 'Data Table',
  diagram: 'Diagram',
  image: 'Image',
  generic: 'File',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalArtifactPanel({
  artifact,
  isOpen,
  onClose,
  onContentChange,
  onRegenerate,
  onDownload,
  onCopy,
  onShare,
  initialWidth = 480,
  minWidth = 320,
  maxWidth = 900,
  className,
}: VitalArtifactPanelProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hasUserEdits, setHasUserEdits] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate width constraints in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (minWidth >= maxWidth) {
        console.error('VitalArtifactPanel: minWidth must be less than maxWidth');
      }
      if (initialWidth < minWidth || initialWidth > maxWidth) {
        console.error('VitalArtifactPanel: initialWidth must be between minWidth and maxWidth');
      }
    }
  }, [minWidth, maxWidth, initialWidth]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Sync edited content when artifact changes (only if user hasn't made edits)
  useEffect(() => {
    if (artifact && !hasUserEdits) {
      setEditedContent(artifact.content);
    }
  }, [artifact?.id, artifact?.content, hasUserEdits]);

  // ==========================================================================
  // FOCUS TRAP FOR ACCESSIBILITY
  // ==========================================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleFocusTrap);

    // Focus first element when panel opens
    setTimeout(() => firstFocusableRef.current?.focus(), 100);

    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  // ==========================================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================================

  // Memoize the close handler to prevent listener churn
  const stableOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        stableOnClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stableOnClose]);

  // ==========================================================================
  // RESIZE HANDLING (with cursor cleanup)
  // ==========================================================================

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    // Set cursor globally during resize
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Cleanup cursor styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  // ==========================================================================
  // ACTIONS (with proper error handling)
  // ==========================================================================

  const handleCopy = useCallback(async () => {
    if (!artifact) return;

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setCopyError(null);

      // Clear previous timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);

      onCopy?.(artifact);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyError('Failed to copy to clipboard');
      setTimeout(() => setCopyError(null), 3000);
    }
  }, [artifact, onCopy]);

  const handleDownload = useCallback(() => {
    if (!artifact) return;

    try {
      // Check for extremely large files
      if (artifact.content.length > MAX_ARTIFACT_RENDER_SIZE * 2) {
        console.warn('Downloading very large artifact:', artifact.content.length);
      }

      const blob = new Blob([artifact.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artifact.title.replace(/\s+/g, '_')}.${getExtension(artifact.type, artifact.language)}`;

      document.body.appendChild(a);
      a.click();

      // Cleanup with small delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      setDownloadError(null);
      onDownload?.(artifact);
    } catch (err) {
      console.error('Failed to download artifact:', err);
      setDownloadError('Failed to download. File may be too large.');
      setTimeout(() => setDownloadError(null), 3000);
    }
  }, [artifact, onDownload]);

  const handleSaveEdit = useCallback(() => {
    if (!artifact) return;
    onContentChange?.(artifact.id, editedContent);
    setIsEditing(false);
    setHasUserEdits(false);
  }, [artifact, editedContent, onContentChange]);

  const handleCancelEdit = useCallback(() => {
    if (artifact) {
      setEditedContent(artifact.content);
    }
    setIsEditing(false);
    setHasUserEdits(false);
  }, [artifact]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setHasUserEdits(true);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (!artifact) return;
    // Create a data URL instead of using document.write for security
    const escapedContent = artifact.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const htmlContent = `<!DOCTYPE html><html><head><title>${artifact.title}</title><style>body{font-family:system-ui,sans-serif;padding:2rem;max-width:800px;margin:0 auto}pre{background:#f5f5f5;padding:1rem;border-radius:8px;overflow-x:auto}</style></head><body><h1>${artifact.title}</h1><pre>${escapedContent}</pre></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Cleanup URL after a delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [artifact]);

  // Memoize transition config to prevent unnecessary animation recalculations
  const transitionConfig = useMemo(
    () => ({ type: 'spring' as const, stiffness: 300, damping: 30 }),
    []
  );

  // Format relative time
  const formatRelativeTime = useCallback((dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return null;
    }
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!artifact) return null;

  const Icon = ARTIFACT_ICONS[artifact.type];
  const effectiveWidth = isMaximized ? '100vw' : width;
  const isLargeContent = artifact.content.length > MAX_ARTIFACT_RENDER_SIZE;
  const relativeTime = formatRelativeTime(artifact.metadata?.createdAt);

  // Large content warning
  if (isLargeContent) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={transitionConfig}
            style={{ width: effectiveWidth }}
            className={cn(
              'fixed top-0 right-0 h-screen z-50',
              'bg-white border-l shadow-2xl',
              'flex flex-col items-center justify-center p-8',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artifact-panel-title"
          >
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Large Artifact</h3>
            <p className="text-sm text-stone-600 text-center mb-4">
              This artifact is {(artifact.content.length / 1024 / 1024).toFixed(2)}MB.
              <br />Download to view full content.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={stableOnClose}>
                Close
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download ({artifact.title})
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={transitionConfig}
          style={{ width: effectiveWidth }}
          className={cn(
            'fixed top-0 right-0 h-screen z-50',
            'bg-white border-l shadow-2xl',
            'flex flex-col',
            isResizing && 'select-none',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="artifact-panel-title"
        >
          {/* Resize Handle with visual affordance */}
          {!isMaximized && (
            <div
              ref={resizeRef}
              onMouseDown={handleResizeStart}
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1.5',
                'border-l border-stone-200/50 cursor-col-resize',
                'hover:bg-[var(--ae-accent-primary,#9055E0)]/20 hover:border-[var(--ae-accent-primary,#9055E0)]/50',
                'transition-all duration-200 group'
              )}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
            >
              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-6 w-6 text-stone-400" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Enhanced Header with metadata */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b bg-stone-50/80">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Icon + Title + Metadata */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2.5 rounded-lg bg-[var(--ae-accent-light,rgba(144,85,224,0.08))] flex-shrink-0">
                  <Icon className="h-5 w-5 text-[var(--ae-accent-primary,#9055E0)]" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  {/* Type badge + timestamp */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-xs text-[var(--ae-accent-primary,#9055E0)] border-[var(--ae-accent-primary,#9055E0)]/30">
                      {ARTIFACT_LABELS[artifact.type]}
                    </Badge>
                    {relativeTime && (
                      <>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {relativeTime}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Title */}
                  <h2
                    id="artifact-panel-title"
                    className="text-lg font-semibold text-stone-800 truncate"
                  >
                    {artifact.title}
                  </h2>
                  {/* Rich metadata */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-stone-500">
                    {artifact.metadata?.agentName && (
                      <span className="flex items-center gap-1">
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        {artifact.metadata.agentName}
                      </span>
                    )}
                    {artifact.metadata?.model && (
                      <span>{artifact.metadata.model}</span>
                    )}
                    {artifact.metadata?.wordCount && (
                      <span>{artifact.metadata.wordCount.toLocaleString()} words</span>
                    )}
                    {artifact.metadata?.lineCount && (
                      <span>{artifact.metadata.lineCount.toLocaleString()} lines</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Action buttons with tooltips */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <TooltipProvider delayDuration={300}>
                  {/* Maximize/Minimize */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        ref={firstFocusableRef}
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="h-8 w-8"
                        aria-label={isMaximized ? 'Minimize panel' : 'Maximize panel'}
                      >
                        {isMaximized ? (
                          <Minimize2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Maximize2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isMaximized ? 'Minimize' : 'Maximize'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Open in new tab */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenInNewTab}
                        className="h-8 w-8"
                        aria-label="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Open in new tab</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Close */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={stableOnClose}
                        className="h-8 w-8"
                        aria-label="Close panel (Esc)"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Close (Esc)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Error messages */}
            {(copyError || downloadError) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{copyError || downloadError}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={handleContentChange}
                  className={cn(
                    'w-full min-h-[400px] p-4 rounded-lg border',
                    'font-mono text-sm resize-none',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--ae-accent-primary,#9055E0)]'
                  )}
                  autoFocus
                  aria-label="Edit artifact content"
                />
              ) : (
                <ArtifactRenderer artifact={artifact} />
              )}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-stone-50">
            <div className="text-xs text-stone-500">
              {artifact.metadata?.generatedBy && (
                <span>Generated by {artifact.metadata.generatedBy}</span>
              )}
              {artifact.metadata?.version && (
                <span className="ml-2">• v{artifact.metadata.version}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Regenerate */}
              {artifact.actions?.includes('regenerate') && onRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerate(artifact.id)}
                  className="text-stone-600"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Regenerate
                </Button>
              )}

              {/* Copy */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-stone-600"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-stone-600"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>

              {/* Share */}
              {artifact.actions?.includes('share') && onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(artifact)}
                  className="text-stone-600"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share
                </Button>
              )}

              {/* Edit / Save */}
              {artifact.actions?.includes('edit') && onContentChange && (
                isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-[var(--ae-accent-primary,#9055E0)] hover:bg-[var(--ae-accent-hover,#7C3AED)]"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="bg-[var(--ae-accent-primary,#9055E0)] hover:bg-[var(--ae-accent-hover,#7C3AED)]"
                  >
                    <Edit3 className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                )
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// ARTIFACT RENDERER
// =============================================================================

interface ArtifactRendererProps {
  artifact: Artifact;
}

/**
 * ArtifactRenderer - Delegates to dedicated renderer components
 *
 * Architecture:
 * - MarkdownRenderer → wraps VitalStreamText (Streamdown)
 * - CodeRenderer → extends VitalCodeBlock pattern
 * - ChartRenderer → standalone Recharts integration
 * - TableRenderer → wraps VitalDataTable
 *
 * Phase 4 Implementation - December 11, 2025
 */
function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
  switch (artifact.type) {
    case 'document':
      return (
        <MarkdownRenderer
          content={artifact.content}
          title={artifact.title}
          version={artifact.metadata?.version}
          lastModified={artifact.metadata?.createdAt}
          showToolbar={false} // Panel has its own toolbar
          maxHeight="none"
        />
      );

    case 'code':
      return (
        <CodeRenderer
          content={artifact.content}
          language={artifact.language}
          fileName={artifact.title}
          showLineNumbers={true}
          theme="dark"
          maxHeight="600px"
        />
      );

    case 'chart':
      return (
        <ChartRenderer
          content={artifact.content}
          title={artifact.title}
          height={400}
        />
      );

    case 'table':
      return (
        <TableRenderer
          content={artifact.content}
          title={artifact.title}
          searchable={true}
          exportable={true}
          maxHeight={500}
          showRowCount={true}
        />
      );

    case 'diagram':
      // Diagram rendering still needs Mermaid.js integration
      // For now, fallback to code display with mermaid language hint
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
            <GitBranch className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Diagram preview requires Mermaid.js integration (coming soon)</span>
          </div>
          <CodeRenderer
            content={artifact.content}
            language="mermaid"
            fileName={artifact.title}
            showLineNumbers={true}
            theme="light"
          />
        </div>
      );

    case 'image':
      // Image artifacts - display as base64 if content is data URL
      if (artifact.content.startsWith('data:image/')) {
        return (
          <div className="flex items-center justify-center p-4 bg-stone-50 rounded-lg">
            <img
              src={artifact.content}
              alt={artifact.title}
              className="max-w-full max-h-[600px] object-contain rounded"
            />
          </div>
        );
      }
      // Fallback to markdown for image URLs
      return (
        <MarkdownRenderer
          content={`![${artifact.title}](${artifact.content})`}
          maxHeight="none"
        />
      );

    case 'generic':
    default:
      // Generic/unknown types - use markdown for flexibility
      return (
        <MarkdownRenderer
          content={artifact.content}
          title={artifact.title}
          showToolbar={false}
          maxHeight="none"
        />
      );
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function getExtension(type: ArtifactType, language?: string): string {
  if (type === 'code' && language) {
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
      sql: 'sql',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      markdown: 'md',
    };
    return extensionMap[language.toLowerCase()] || 'txt';
  }

  const typeExtensions: Record<ArtifactType, string> = {
    document: 'md',
    code: 'txt',
    chart: 'json',
    table: 'csv',
    diagram: 'mmd',
    image: 'png',
    generic: 'txt',
  };

  return typeExtensions[type] || 'txt';
}

export default VitalArtifactPanel;
