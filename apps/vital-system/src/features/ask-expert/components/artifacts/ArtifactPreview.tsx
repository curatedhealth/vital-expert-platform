'use client';

/**
 * VITAL Platform - Artifact Preview Component
 *
 * Rich preview modal for mission artifacts with syntax highlighting,
 * zoom controls, and interactive viewing options.
 *
 * Uses VitalStreamText (Streamdown) for consistent markdown rendering
 * with syntax highlighting and Mermaid diagram support.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025 (Updated: December 12, 2025 - VitalStreamText integration)
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  Code,
  BarChart3,
  Table,
  Image,
  FileJson,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VitalStreamText } from '@/components/vital-ai-ui/conversation/VitalStreamText';

// =============================================================================
// TYPES
// =============================================================================

export type ArtifactType =
  | 'markdown'
  | 'code'
  | 'chart'
  | 'table'
  | 'image'
  | 'json'
  | 'text'
  | 'html';

export interface ArtifactData {
  id: string;
  title: string;
  type: ArtifactType;
  content: string;
  language?: string; // For code artifacts
  mimeType?: string;
  size?: number; // bytes
  createdAt: string | number;
  createdBy?: string;
  version?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ArtifactPreviewProps {
  /** Artifact to preview */
  artifact: ArtifactData | null;
  /** Whether the preview is open */
  isOpen: boolean;
  /** Called when preview is closed */
  onClose: () => void;
  /** Called when download is requested */
  onDownload?: (artifact: ArtifactData) => void;
  /** Called when copy is requested */
  onCopy?: (artifact: ArtifactData) => void;
  /** Called when user wants to open externally */
  onOpenExternal?: (artifact: ArtifactData) => void;
  /** Navigate to previous artifact */
  onPrevious?: () => void;
  /** Navigate to next artifact */
  onNext?: () => void;
  /** Whether there's a previous artifact */
  hasPrevious?: boolean;
  /** Whether there's a next artifact */
  hasNext?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getArtifactIcon(type: ArtifactType): React.ReactNode {
  const icons: Record<ArtifactType, React.ReactNode> = {
    markdown: <FileText className="w-5 h-5" />,
    code: <Code className="w-5 h-5" />,
    chart: <BarChart3 className="w-5 h-5" />,
    table: <Table className="w-5 h-5" />,
    image: <Image className="w-5 h-5" />,
    json: <FileJson className="w-5 h-5" />,
    text: <FileText className="w-5 h-5" />,
    html: <Code className="w-5 h-5" />,
  };
  return icons[type] || <FileText className="w-5 h-5" />;
}

function getArtifactColor(type: ArtifactType): string {
  const colors: Record<ArtifactType, string> = {
    markdown: 'text-purple-500 bg-purple-100',
    code: 'text-green-500 bg-green-100',
    chart: 'text-violet-500 bg-violet-100',
    table: 'text-amber-500 bg-amber-100',
    image: 'text-pink-500 bg-pink-100',
    json: 'text-fuchsia-500 bg-fuchsia-100',
    text: 'text-slate-500 bg-slate-100',
    html: 'text-red-500 bg-red-100',
  };
  return colors[type] || 'text-slate-500 bg-slate-100';
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string | number): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// =============================================================================
// CONTENT RENDERERS
// =============================================================================

interface ContentRendererProps {
  artifact: ArtifactData;
  zoom: number;
}

function MarkdownRenderer({ artifact, zoom }: ContentRendererProps) {
  // Use VitalStreamText for consistent markdown rendering with Streamdown
  return (
    <div style={{ fontSize: `${zoom}%` }}>
      <VitalStreamText
        content={artifact.content}
        isStreaming={false}
        highlightCode={true}
        enableMermaid={true}
        showControls={false}
        className="prose prose-sm max-w-none dark:prose-invert"
      />
    </div>
  );
}

function CodeRenderer({ artifact, zoom }: ContentRendererProps) {
  // Wrap code in markdown code fence for VitalStreamText to handle syntax highlighting
  const codeContent = `\`\`\`${artifact.language || ''}\n${artifact.content}\n\`\`\``;

  return (
    <div className="relative" style={{ fontSize: `${zoom * 0.9}%` }}>
      <VitalStreamText
        content={codeContent}
        isStreaming={false}
        highlightCode={true}
        enableMermaid={false}
        showControls={false}
      />
    </div>
  );
}

function JsonRenderer({ artifact, zoom }: ContentRendererProps) {
  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(artifact.content), null, 2);
    } catch {
      return artifact.content;
    }
  }, [artifact.content]);

  // Wrap JSON in markdown code fence for VitalStreamText to handle syntax highlighting
  const jsonContent = `\`\`\`json\n${formattedJson}\n\`\`\``;

  return (
    <div style={{ fontSize: `${zoom * 0.9}%` }}>
      <VitalStreamText
        content={jsonContent}
        isStreaming={false}
        highlightCode={true}
        enableMermaid={false}
        showControls={false}
      />
    </div>
  );
}

function TableRenderer({ artifact, zoom }: ContentRendererProps) {
  // Parse CSV/table content
  const rows = useMemo(() => {
    return artifact.content.split('\n').map((row) => row.split(','));
  }, [artifact.content]);

  if (rows.length === 0) return null;

  const headers = rows[0];
  const data = rows.slice(1);

  return (
    <div className="overflow-auto" style={{ fontSize: `${zoom}%` }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-sm font-medium text-slate-700 border-b"
              >
                {header.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-sm text-slate-600 border-b"
                >
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageRenderer({ artifact }: ContentRendererProps) {
  // Content could be base64 or URL
  const src = artifact.content.startsWith('data:')
    ? artifact.content
    : artifact.content.startsWith('http')
    ? artifact.content
    : `data:${artifact.mimeType || 'image/png'};base64,${artifact.content}`;

  return (
    <div className="flex items-center justify-center p-4">
      <img
        src={src}
        alt={artifact.title}
        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
      />
    </div>
  );
}

function TextRenderer({ artifact, zoom }: ContentRendererProps) {
  return (
    <div
      className="p-4 bg-white rounded-lg"
      style={{ fontSize: `${zoom}%` }}
    >
      <pre className="whitespace-pre-wrap font-sans text-slate-700">
        {artifact.content}
      </pre>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ArtifactPreview({
  artifact,
  isOpen,
  onClose,
  onDownload,
  onCopy,
  onOpenExternal,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  className,
}: ArtifactPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(200, prev + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(50, prev - 10));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!artifact) return;
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(artifact);
  }, [artifact, onCopy]);

  const handleDownload = useCallback(() => {
    if (!artifact) return;
    onDownload?.(artifact);
  }, [artifact, onDownload]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrevious) onPrevious?.();
      if (e.key === 'ArrowRight' && hasNext) onNext?.();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    },
    [onClose, hasPrevious, hasNext, onPrevious, onNext, handleZoomIn, handleZoomOut]
  );

  const renderContent = useCallback(() => {
    if (!artifact) return null;

    const props = { artifact, zoom };

    switch (artifact.type) {
      case 'markdown':
        return <MarkdownRenderer {...props} />;
      case 'code':
        return <CodeRenderer {...props} />;
      case 'json':
        return <JsonRenderer {...props} />;
      case 'table':
        return <TableRenderer {...props} />;
      case 'image':
        return <ImageRenderer {...props} />;
      case 'html':
        return <CodeRenderer {...props} />;
      default:
        return <TextRenderer {...props} />;
    }
  }, [artifact, zoom]);

  if (!artifact) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className={cn(
              'fixed z-50 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col',
              isFullscreen
                ? 'inset-2'
                : 'inset-8 md:inset-16 lg:inset-24',
              className
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', getArtifactColor(artifact.type))}>
                  {getArtifactIcon(artifact.type)}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{artifact.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(artifact.createdAt)}
                    </span>
                    {artifact.createdBy && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {artifact.createdBy}
                      </span>
                    )}
                    {artifact.size && (
                      <span>{formatFileSize(artifact.size)}</span>
                    )}
                    {artifact.version && (
                      <span>v{artifact.version}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Zoom controls */}
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-500 w-12 text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                {/* Actions */}
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy content"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                {onDownload && (
                  <button
                    onClick={handleDownload}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                {onOpenExternal && (
                  <button
                    onClick={() => onOpenExternal(artifact)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            {artifact.tags && artifact.tags.length > 0 && (
              <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-50 border-b">
                <Tag className="w-4 h-4 text-slate-400" />
                {artifact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              {renderContent()}
            </div>

            {/* Navigation */}
            {(hasPrevious || hasNext) && (
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t bg-slate-50">
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                    hasPrevious
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-xs text-slate-400">
                  Use ← → keys to navigate
                </span>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                    hasNext
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 cursor-not-allowed'
                  )}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ArtifactPreview;
