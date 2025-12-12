'use client';

/**
 * VITAL Platform - Artifact Download Component
 *
 * Handles downloading artifacts in various formats with
 * progress tracking and format conversion options.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  FileJson,
  FileCode,
  Table,
  Image,
  File,
  Check,
  Loader2,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtifactData, ArtifactType } from './ArtifactPreview';

// =============================================================================
// TYPES
// =============================================================================

export type ExportFormat =
  | 'original'
  | 'markdown'
  | 'json'
  | 'csv'
  | 'txt'
  | 'html'
  | 'pdf';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

export interface ArtifactDownloadProps {
  /** Artifact to download */
  artifact: ArtifactData;
  /** Called when download completes */
  onDownloadComplete?: (format: ExportFormat) => void;
  /** Called on download error */
  onDownloadError?: (error: Error) => void;
  /** Custom download handler (if not using default) */
  customDownloadHandler?: (artifact: ArtifactData, format: ExportFormat) => Promise<void>;
  /** Show as dropdown or button */
  variant?: 'button' | 'dropdown';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getFormatIcon(format: ExportFormat): React.ReactNode {
  const icons: Record<ExportFormat, React.ReactNode> = {
    original: <File className="w-4 h-4" />,
    markdown: <FileText className="w-4 h-4" />,
    json: <FileJson className="w-4 h-4" />,
    csv: <Table className="w-4 h-4" />,
    txt: <FileText className="w-4 h-4" />,
    html: <FileCode className="w-4 h-4" />,
    pdf: <FileText className="w-4 h-4" />,
  };
  return icons[format];
}

function getAvailableFormats(type: ArtifactType): ExportOption[] {
  const allFormats: ExportOption[] = [
    {
      format: 'original',
      label: 'Original',
      icon: <File className="w-4 h-4" />,
      description: 'Download in original format',
      available: true,
    },
    {
      format: 'markdown',
      label: 'Markdown',
      icon: <FileText className="w-4 h-4" />,
      description: 'Export as .md file',
      available: ['markdown', 'text', 'html'].includes(type),
    },
    {
      format: 'json',
      label: 'JSON',
      icon: <FileJson className="w-4 h-4" />,
      description: 'Export as .json file',
      available: ['json', 'table'].includes(type),
    },
    {
      format: 'csv',
      label: 'CSV',
      icon: <Table className="w-4 h-4" />,
      description: 'Export as spreadsheet',
      available: ['table', 'json'].includes(type),
    },
    {
      format: 'txt',
      label: 'Plain Text',
      icon: <FileText className="w-4 h-4" />,
      description: 'Export as .txt file',
      available: true,
    },
    {
      format: 'html',
      label: 'HTML',
      icon: <FileCode className="w-4 h-4" />,
      description: 'Export as .html file',
      available: ['markdown', 'html', 'table'].includes(type),
    },
  ];

  return allFormats.filter((f) => f.available);
}

function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    original: 'application/octet-stream',
    markdown: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    txt: 'text/plain',
    html: 'text/html',
    pdf: 'application/pdf',
  };
  return mimeTypes[format];
}

function getFileExtension(format: ExportFormat, originalType: ArtifactType): string {
  if (format === 'original') {
    const extensions: Record<ArtifactType, string> = {
      markdown: 'md',
      code: 'txt',
      chart: 'json',
      table: 'csv',
      image: 'png',
      json: 'json',
      text: 'txt',
      html: 'html',
    };
    return extensions[originalType] || 'txt';
  }
  return format === 'markdown' ? 'md' : format;
}

function convertContent(
  content: string,
  fromType: ArtifactType,
  toFormat: ExportFormat
): string {
  // Original - return as is
  if (toFormat === 'original') return content;

  // To plain text - strip any markup
  if (toFormat === 'txt') {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[#*_`]/g, ''); // Remove markdown syntax
  }

  // Table to CSV
  if (toFormat === 'csv' && fromType === 'table') {
    return content; // Assuming already CSV format
  }

  // JSON to CSV
  if (toFormat === 'csv' && fromType === 'json') {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map((row: Record<string, unknown>) =>
          headers.map((h) => String(row[h] ?? '')).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
      }
    } catch {
      return content;
    }
  }

  // To HTML
  if (toFormat === 'html') {
    if (fromType === 'markdown') {
      // Simple markdown to HTML conversion
      return `<!DOCTYPE html>
<html>
<head><title>Artifact</title></head>
<body>
<pre>${content}</pre>
</body>
</html>`;
    }
    if (fromType === 'table') {
      const rows = content.split('\n').map((r) => r.split(','));
      const tableHtml = `<table border="1">
${rows.map((row, i) =>
  `<tr>${row.map((cell) =>
    i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`
  ).join('')}</tr>`
).join('\n')}
</table>`;
      return `<!DOCTYPE html>
<html>
<head><title>Artifact</title></head>
<body>${tableHtml}</body>
</html>`;
    }
  }

  return content;
}

async function downloadBlob(
  content: string,
  filename: string,
  mimeType: string
): Promise<void> {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ArtifactDownload({
  artifact,
  onDownloadComplete,
  onDownloadError,
  customDownloadHandler,
  variant = 'dropdown',
  size = 'md',
  className,
}: ArtifactDownloadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<ExportFormat | null>(null);

  const availableFormats = getAvailableFormats(artifact.type);

  const handleDownload = useCallback(
    async (format: ExportFormat) => {
      setIsDownloading(true);
      setDownloadedFormat(null);

      try {
        if (customDownloadHandler) {
          await customDownloadHandler(artifact, format);
        } else {
          const content = convertContent(artifact.content, artifact.type, format);
          const extension = getFileExtension(format, artifact.type);
          const filename = `${artifact.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
          const mimeType = getMimeType(format);

          await downloadBlob(content, filename, mimeType);
        }

        setDownloadedFormat(format);
        onDownloadComplete?.(format);

        // Reset success state after 2 seconds
        setTimeout(() => setDownloadedFormat(null), 2000);
      } catch (error) {
        onDownloadError?.(error as Error);
      } finally {
        setIsDownloading(false);
        setIsOpen(false);
      }
    },
    [artifact, customDownloadHandler, onDownloadComplete, onDownloadError]
  );

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  // Simple button variant
  if (variant === 'button') {
    return (
      <button
        onClick={() => handleDownload('original')}
        disabled={isDownloading}
        className={cn(
          'flex items-center gap-2 rounded-lg font-medium transition-colors',
          'bg-purple-600 text-white hover:bg-purple-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : downloadedFormat ? (
          <Check className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isDownloading ? 'Downloading...' : downloadedFormat ? 'Downloaded!' : 'Download'}
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className={cn(
          'flex items-center gap-2 rounded-lg font-medium transition-colors',
          'bg-purple-600 text-white hover:bg-purple-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size]
        )}
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                'absolute right-0 mt-2 w-56 z-20',
                'bg-white rounded-lg shadow-lg border border-slate-200',
                'overflow-hidden'
              )}
            >
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 px-2 py-1 uppercase tracking-wider">
                  Export Format
                </div>
                {availableFormats.map((option) => (
                  <button
                    key={option.format}
                    onClick={() => handleDownload(option.format)}
                    className={cn(
                      'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors',
                      'hover:bg-purple-50 text-slate-700 hover:text-purple-700',
                      downloadedFormat === option.format && 'bg-green-50 text-green-700'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded',
                      downloadedFormat === option.format
                        ? 'bg-green-100 text-green-600'
                        : 'bg-slate-100 text-slate-500'
                    )}>
                      {downloadedFormat === option.format ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        option.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ArtifactDownload;
