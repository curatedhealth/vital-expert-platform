'use client';

import { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  FileText,
  Edit,
  Save,
  X,
  Download,
  Share2,
  Printer,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Check,
  History,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Streamdown } from 'streamdown';

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'callout';
  level?: number; // For headings
  children?: DocumentSection[];
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
  status?: 'draft' | 'review' | 'final';
  tags?: string[];
}

export interface VitalDocumentationProps {
  /** Document metadata */
  metadata: DocumentMetadata;
  /** Document content (markdown) */
  content: string;
  /** Structured sections (alternative to markdown) */
  sections?: DocumentSection[];
  /** Whether content is streaming */
  isStreaming?: boolean;
  /** Whether document is editable */
  editable?: boolean;
  /** Whether in edit mode */
  isEditing?: boolean;
  /** Show table of contents */
  showToc?: boolean;
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  /** Callback when saved */
  onSave?: (content: string) => void;
  /** Callback to download */
  onDownload?: (format: 'md' | 'pdf' | 'docx') => void;
  /** Callback to share */
  onShare?: () => void;
  /** Custom class name */
  className?: string;
}

/**
 * VitalDocumentation - Notion-like Document View
 * 
 * Renders generated reports in a "Notion-like" editable document view.
 * Supports streaming content, inline editing, and export options.
 * 
 * Uses Streamdown for jitter-free markdown rendering during streaming.
 * 
 * @example
 * ```tsx
 * <VitalDocumentation
 *   metadata={{
 *     title: 'Drug Interaction Analysis Report',
 *     author: 'AI Expert Panel',
 *     status: 'final',
 *   }}
 *   content={reportMarkdown}
 *   isStreaming={isGenerating}
 *   editable
 *   onSave={(content) => saveReport(content)}
 * />
 * ```
 */
export function VitalDocumentation({
  metadata,
  content,
  sections,
  isStreaming = false,
  editable = false,
  isEditing: initialEditing = false,
  showToc = true,
  onContentChange,
  onSave,
  onDownload,
  onShare,
  className,
}: VitalDocumentationProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [editContent, setEditContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = useCallback(() => {
    onSave?.(editContent);
    setIsEditing(false);
  }, [editContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditContent(content);
    setIsEditing(false);
  }, [content]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // Extract TOC from content
  const extractToc = useCallback(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const toc: { level: number; title: string; id: string }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      toc.push({
        level: match[1].length,
        title: match[2],
        id: match[2].toLowerCase().replace(/\s+/g, '-'),
      });
    }

    return toc;
  }, [content]);

  const toc = showToc ? extractToc() : [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      case 'review':
        return 'bg-blue-100 text-blue-700';
      case 'final':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Table of Contents Sidebar */}
      {showToc && toc.length > 0 && !isEditing && (
        <div className="w-64 border-r flex-shrink-0 hidden lg:block">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm">Contents</h3>
          </div>
          <ScrollArea className="h-[calc(100%-57px)]">
            <nav className="p-4 space-y-1">
              {toc.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className={cn(
                    'block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors',
                    item.level === 1 && 'font-medium',
                    item.level === 2 && 'pl-4',
                    item.level === 3 && 'pl-8 text-xs'
                  )}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </ScrollArea>
        </div>
      )}

      {/* Main Document Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {metadata.status && (
                  <Badge className={cn('text-xs', getStatusColor(metadata.status))}>
                    {metadata.status}
                  </Badge>
                )}
                {metadata.version && (
                  <Badge variant="outline" className="text-xs">
                    v{metadata.version}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-semibold truncate">{metadata.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {metadata.author && <span>By {metadata.author}</span>}
                {metadata.updatedAt && (
                  <span>
                    Updated {metadata.updatedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
              {metadata.tags && metadata.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isStreaming}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onDownload && (
                        <>
                          <DropdownMenuItem onClick={() => onDownload('md')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload('pdf')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload('docx')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Word
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                      {onShare && (
                        <DropdownMenuItem onClick={onShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className={cn('p-6', isEditing && showPreview && 'grid grid-cols-2 gap-6')}>
            {isEditing ? (
              <>
                {/* Editor */}
                <div className={cn(!showPreview && 'col-span-2')}>
                  <Textarea
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      onContentChange?.(e.target.value);
                    }}
                    className="min-h-[500px] font-mono text-sm resize-none"
                    placeholder="Write your document in Markdown..."
                  />
                </div>

                {/* Live Preview */}
                {showPreview && (
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-3">Preview</p>
                    <Streamdown
                      content={editContent}
                      className="prose prose-slate dark:prose-invert max-w-none prose-sm"
                    />
                  </div>
                )}
              </>
            ) : (
              /* Read-only View */
              <article className="max-w-3xl mx-auto">
                <Streamdown
                  content={content}
                  className={cn(
                    'prose prose-slate dark:prose-invert max-w-none',
                    'prose-headings:scroll-mt-20',
                    'prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:pb-2',
                    'prose-h2:text-xl prose-h2:font-semibold',
                    'prose-h3:text-lg prose-h3:font-medium',
                    'prose-p:leading-relaxed',
                    'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                    'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:bg-slate-900 prose-pre:border',
                    'prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1',
                    'prose-table:text-sm prose-th:bg-muted',
                    isStreaming && 'animate-pulse-subtle'
                  )}
                />
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
                )}
              </article>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default VitalDocumentation;
