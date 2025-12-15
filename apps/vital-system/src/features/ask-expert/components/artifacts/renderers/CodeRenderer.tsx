'use client';

/**
 * VITAL Platform - CodeRenderer (Artifact Wrapper)
 *
 * Artifact-specific code renderer extending VitalCodeBlock capabilities.
 * Adds advanced artifact features while leveraging core VITAL components.
 *
 * ARCHITECTURE: Extends VitalCodeBlock pattern with artifact enhancements
 * - VitalCodeBlock provides: basic code display, copy, download
 * - This renderer adds: theme toggle, word wrap, expand/collapse, line highlighting
 *
 * For simple code display, use VitalCodeBlock directly.
 * For artifact code with editing/approval flows, use this renderer.
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VitalCodeBlock } from '@/components/vital-ai-ui/documents/VitalCodeBlock';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  WrapText,
  AlignLeft,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@vital/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface CodeRendererProps {
  /** Code content to render */
  content: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Lines to highlight (1-indexed) */
  highlightLines?: number[];
  /** Custom class names */
  className?: string;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Enable word wrap */
  wordWrap?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: number | string;
  /** File name to display */
  fileName?: string;
  /** Called when copy is clicked */
  onCopy?: () => void;
  /** Called when download is clicked */
  onDownload?: () => void;
  /**
   * Use VitalCodeBlock for simple rendering (no advanced features)
   * When true, delegates to VitalCodeBlock for basic code display
   * When false (default), uses advanced artifact renderer with theme toggle, word wrap, etc.
   */
  useSimpleMode?: boolean;
}

// =============================================================================
// LANGUAGE DETECTION
// =============================================================================

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  yml: 'yaml',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  cs: 'csharp',
  kt: 'kotlin',
  rs: 'rust',
  tf: 'hcl',
  dockerfile: 'docker',
};

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  bash: 'Bash',
  powershell: 'PowerShell',
  docker: 'Dockerfile',
  hcl: 'HCL',
  graphql: 'GraphQL',
  tsx: 'TSX',
  jsx: 'JSX',
};

function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';
  const lower = lang.toLowerCase();
  return LANGUAGE_ALIASES[lower] || lower;
}

function getDisplayName(lang: string): string {
  const normalized = normalizeLanguage(lang);
  return LANGUAGE_DISPLAY_NAMES[normalized] || lang.toUpperCase();
}

// =============================================================================
// COMPONENT
// =============================================================================

export const CodeRenderer = memo(function CodeRenderer({
  content,
  language = 'text',
  showLineNumbers = true,
  highlightLines = [],
  className,
  theme: initialTheme = 'dark',
  wordWrap: initialWordWrap = false,
  maxHeight = '600px',
  fileName,
  onCopy,
  onDownload,
  useSimpleMode = false,
}: CodeRendererProps) {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(initialWordWrap);
  const [isExpanded, setIsExpanded] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple mode: delegate to VitalCodeBlock
  if (useSimpleMode) {
    return (
      <VitalCodeBlock
        code={content}
        language={language}
        filename={fileName}
        showLineNumbers={showLineNumbers}
        highlightLines={highlightLines}
        maxHeight={typeof maxHeight === 'string' ? parseInt(maxHeight) : maxHeight}
        showCopyButton={true}
        showDownloadButton={true}
        onCopy={onCopy}
        onDownload={onDownload}
        className={className}
      />
    );
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const normalizedLanguage = useMemo(() => normalizeLanguage(language), [language]);
  const displayName = useMemo(() => getDisplayName(language), [language]);
  const lineCount = useMemo(() => content.split('\n').length, [content]);

  // Create highlight line set for O(1) lookup
  const highlightLineSet = useMemo(
    () => new Set(highlightLines),
    [highlightLines]
  );

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
      logger.error('Failed to copy code', { error: err });
    }
  }, [content, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `code.${normalizedLanguage}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    onDownload?.();
  }, [content, fileName, normalizedLanguage, onDownload]);

  const selectedStyle = theme === 'dark' ? oneDark : oneLight;

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border',
        theme === 'dark' ? 'border-stone-700 bg-[#282c34]' : 'border-stone-200 bg-white',
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
        {/* Language badge + file name */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              theme === 'dark'
                ? 'bg-[var(--ae-accent-primary,#9055E0)]/20 text-[var(--ae-accent-primary,#9055E0)]'
                : 'bg-[var(--ae-accent-primary,#9055E0)]/10 text-[var(--ae-accent-primary,#9055E0)]'
            )}
          >
            {displayName}
          </span>
          {fileName && (
            <span
              className={cn(
                'text-xs font-mono',
                theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
              )}
            >
              {fileName}
            </span>
          )}
          <span
            className={cn(
              'text-xs',
              theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
            )}
          >
            {lineCount} lines
          </span>
        </div>

        {/* Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
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

            {/* Word wrap toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWordWrap(!wordWrap)}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
                    wordWrap && 'bg-stone-700/50'
                  )}
                  aria-label={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
                >
                  {wordWrap ? (
                    <AlignLeft className="h-3.5 w-3.5" />
                  ) : (
                    <WrapText className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {wordWrap ? 'Disable wrap' : 'Word wrap'}
              </TooltipContent>
            </Tooltip>

            {/* Expand/collapse */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isExpanded ? 'Collapse' : 'Expand'}
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
                  aria-label="Download code"
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
                  aria-label="Copy code"
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

      {/* Code content */}
      <div
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflowY: isExpanded ? 'visible' : 'auto',
        }}
      >
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={selectedStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          wrapLongLines={wordWrap}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = {
              display: 'block',
              width: '100%',
            };
            if (highlightLineSet.has(lineNumber)) {
              style.backgroundColor =
                theme === 'dark'
                  ? 'rgba(144, 85, 224, 0.15)'
                  : 'rgba(144, 85, 224, 0.1)';
              style.borderLeft = '3px solid var(--ae-accent-primary, #9055E0)';
              style.paddingLeft = '0.5rem';
              style.marginLeft = '-0.5rem';
            }
            return { style };
          }}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            },
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

export default CodeRenderer;
