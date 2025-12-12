'use client';

/**
 * VITAL Platform - HtmlRenderer Component
 *
 * Renders sanitized HTML content using DOMPurify to prevent XSS attacks.
 * Supports theme switching, source code view, and export capabilities.
 *
 * SECURITY NOTE:
 * This component uses dangerouslySetInnerHTML which is safe here because:
 * 1. ALL content is sanitized through DOMPurify before rendering
 * 2. DOMPurify strips all scripts, event handlers, and dangerous elements
 * 3. Only allowlisted tags and attributes are permitted
 * 4. Links are forced to open in new tabs with noopener noreferrer
 *
 * Features:
 * - DOMPurify sanitization (XSS protection)
 * - Toggle between rendered view and source code
 * - Theme support (dark/light)
 * - Copy/download functionality
 * - Visual indicator when content was sanitized
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Download,
  Sun,
  Moon,
  Code,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DOMPurify from 'dompurify';

// =============================================================================
// TYPES
// =============================================================================

export interface HtmlRendererProps {
  /** HTML content to render */
  content: string;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Custom class names */
  className?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Show source toggle */
  showSourceToggle?: boolean;
  /** Default to source view */
  defaultShowSource?: boolean;
  /** Title for the artifact */
  title?: string;
  /** Called when copy is clicked */
  onCopy?: () => void;
}

// =============================================================================
// DOMPURIFY CONFIGURATION
// =============================================================================

// DOMPurify config type (compatible with dompurify types)
interface PurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  ADD_URI_SAFE_ATTR?: string[];
  RETURN_TRUSTED_TYPE?: boolean;
  FORCE_BODY?: boolean;
}

// Configure DOMPurify with safe defaults
const PURIFY_CONFIG: PurifyConfig = {
  ALLOWED_TAGS: [
    // Structure
    'div', 'span', 'p', 'br', 'hr',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Text formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
    'code', 'pre', 'kbd', 'samp', 'var', 'abbr', 'cite', 'q', 'blockquote',
    // Links (target blank enforced)
    'a',
    // Images
    'img',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Forms (display only, no submissions)
    'form', 'input', 'textarea', 'select', 'option', 'optgroup', 'label', 'fieldset', 'legend', 'button',
    // Semantic
    'article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'figure', 'figcaption',
    // Media
    'video', 'audio', 'source', 'track', 'picture',
    // Other
    'details', 'summary', 'time', 'address', 'progress', 'meter',
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'style',
    'href', 'target', 'rel',
    'src', 'alt', 'title', 'width', 'height',
    'colspan', 'rowspan', 'scope',
    'type', 'name', 'value', 'placeholder', 'disabled', 'readonly', 'checked', 'selected',
    'for', 'min', 'max', 'step', 'pattern', 'required',
    'data-*',
    'aria-*', 'role',
    'datetime', 'pubdate',
    'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload',
    'open',
  ],
  // Force all links to open in new tab
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'noscript'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  FORCE_BODY: true,
};

// =============================================================================
// THEME STYLES
// =============================================================================

const THEME_STYLES = {
  dark: `
    .vital-html-content {
      color: #e5e5e5;
      background-color: #1c1c1c;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      padding: 1rem;
    }
    .vital-html-content a { color: #a78bfa; }
    .vital-html-content a:hover { color: #c4b5fd; }
    .vital-html-content h1, .vital-html-content h2, .vital-html-content h3,
    .vital-html-content h4, .vital-html-content h5, .vital-html-content h6 {
      color: #f5f5f5;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    .vital-html-content code {
      background: #2d2d2d;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.9em;
    }
    .vital-html-content pre {
      background: #2d2d2d;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
    }
    .vital-html-content pre code {
      background: none;
      padding: 0;
    }
    .vital-html-content blockquote {
      border-left: 4px solid #9055E0;
      margin-left: 0;
      padding-left: 1em;
      color: #a3a3a3;
    }
    .vital-html-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    .vital-html-content th, .vital-html-content td {
      border: 1px solid #404040;
      padding: 0.5em 1em;
      text-align: left;
    }
    .vital-html-content th {
      background: #2d2d2d;
      font-weight: 600;
    }
    .vital-html-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .vital-html-content hr {
      border: none;
      border-top: 1px solid #404040;
      margin: 2em 0;
    }
    .vital-html-content ul, .vital-html-content ol {
      padding-left: 1.5em;
    }
    .vital-html-content li {
      margin: 0.25em 0;
    }
  `,
  light: `
    .vital-html-content {
      color: #1c1c1c;
      background-color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      padding: 1rem;
    }
    .vital-html-content a { color: #7c3aed; }
    .vital-html-content a:hover { color: #9055E0; }
    .vital-html-content h1, .vital-html-content h2, .vital-html-content h3,
    .vital-html-content h4, .vital-html-content h5, .vital-html-content h6 {
      color: #171717;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    .vital-html-content code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.9em;
    }
    .vital-html-content pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
    }
    .vital-html-content pre code {
      background: none;
      padding: 0;
    }
    .vital-html-content blockquote {
      border-left: 4px solid #9055E0;
      margin-left: 0;
      padding-left: 1em;
      color: #737373;
    }
    .vital-html-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    .vital-html-content th, .vital-html-content td {
      border: 1px solid #e5e5e5;
      padding: 0.5em 1em;
      text-align: left;
    }
    .vital-html-content th {
      background: #fafafa;
      font-weight: 600;
    }
    .vital-html-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .vital-html-content hr {
      border: none;
      border-top: 1px solid #e5e5e5;
      margin: 2em 0;
    }
    .vital-html-content ul, .vital-html-content ol {
      padding-left: 1.5em;
    }
    .vital-html-content li {
      margin: 0.25em 0;
    }
  `,
};

// =============================================================================
// SANITIZATION HELPER
// =============================================================================

/**
 * Sanitize HTML content using DOMPurify.
 * This ensures all content is XSS-safe before rendering.
 */
function sanitizeHtml(content: string): string {
  // Add hooks to force links to open in new tab
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // RETURN_TRUSTED_TYPE: false ensures we get a string, not TrustedHTML
  const clean = DOMPurify.sanitize(content, { ...PURIFY_CONFIG, RETURN_TRUSTED_TYPE: false });

  // Remove hook after use
  DOMPurify.removeHook('afterSanitizeAttributes');

  return clean as string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const HtmlRenderer = memo(function HtmlRenderer({
  content,
  theme: initialTheme = 'dark',
  className,
  maxHeight = '500px',
  showSourceToggle = true,
  defaultShowSource = false,
  title,
  onCopy,
}: HtmlRendererProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [showSource, setShowSource] = useState(defaultShowSource);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sanitize HTML content - SECURITY: DOMPurify removes all XSS vectors
  const sanitizedHtml = useMemo(() => sanitizeHtml(content), [content]);

  // Check if content was modified during sanitization
  const wasModified = useMemo(() => {
    const original = content.replace(/\s+/g, ' ').trim();
    const sanitized = sanitizedHtml.replace(/\s+/g, ' ').trim();
    return original !== sanitized;
  }, [content, sanitizedHtml]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  }, [content, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title || 'content') + '.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [content, title]);

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        theme === 'dark' ? 'border-stone-700 bg-stone-900' : 'border-stone-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          theme === 'dark'
            ? 'bg-stone-800/50 border-stone-700'
            : 'bg-stone-50 border-stone-200'
        )}
      >
        {/* Title + Badge */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              theme === 'dark'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-orange-100 text-orange-600'
            )}
          >
            HTML
          </span>
          {title && (
            <span
              className={cn(
                'text-xs font-medium truncate max-w-[200px]',
                theme === 'dark' ? 'text-stone-300' : 'text-stone-600'
              )}
            >
              {title}
            </span>
          )}
          {wasModified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <AlertTriangle className="w-3 h-3" />
                    Sanitized
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Some potentially unsafe content was removed
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            {/* Source/Preview toggle */}
            {showSourceToggle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSource(!showSource)}
                    className={cn(
                      'h-7 w-7',
                      theme === 'dark'
                        ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
                      showSource && (theme === 'dark' ? 'bg-stone-700' : 'bg-stone-200')
                    )}
                    aria-label={showSource ? 'Show preview' : 'Show source'}
                  >
                    {showSource ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <Code className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {showSource ? 'Preview' : 'Source'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </TooltipContent>
            </Tooltip>

            {/* Download */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Download HTML"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Download</TooltipContent>
            </Tooltip>

            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Copy HTML"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {copied ? 'Copied!' : 'Copy'}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Content */}
      <div
        style={{ maxHeight }}
        className="overflow-auto"
      >
        {showSource ? (
          // Source code view
          <pre
            className={cn(
              'p-4 text-sm font-mono whitespace-pre-wrap break-words',
              theme === 'dark' ? 'text-stone-300' : 'text-stone-700'
            )}
          >
            {content}
          </pre>
        ) : (
          // Rendered HTML view - SECURITY: sanitizedHtml is cleaned by DOMPurify
          <>
            <style>{THEME_STYLES[theme]}</style>
            <div
              className="vital-html-content"
              // eslint-disable-next-line react/no-danger -- Safe: content is sanitized by DOMPurify
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </>
        )}
      </div>
    </div>
  );
});

export default HtmlRenderer;
