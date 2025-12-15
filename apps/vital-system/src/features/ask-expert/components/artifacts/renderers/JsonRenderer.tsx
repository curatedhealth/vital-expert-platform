'use client';

/**
 * VITAL Platform - JsonRenderer Component
 *
 * Renders JSON data as an interactive tree view with syntax highlighting,
 * collapsible nodes, search, and copy functionality.
 *
 * Features:
 * - Collapsible tree structure for nested objects/arrays
 * - Syntax highlighting for keys, values, types
 * - Copy path (JSONPath) or value on click
 * - Search within JSON structure
 * - Expand/collapse all functionality
 * - Theme support (dark/light)
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logger } from '@vital/utils';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export interface JsonRendererProps {
  /** JSON content (string to be parsed or already parsed object) */
  content: string | object;
  /** Initial expansion depth (default: 2) */
  defaultExpandDepth?: number;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Show root braces */
  showRoot?: boolean;
  /** Custom class names */
  className?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Called when copy is clicked */
  onCopy?: () => void;
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  path: string;
  depth: number;
  expandDepth: number;
  theme: 'dark' | 'light';
  searchTerm?: string;
  onCopyPath: (path: string) => void;
  onCopyValue: (value: unknown) => void;
}

// =============================================================================
// STYLING
// =============================================================================

const TYPE_COLORS = {
  dark: {
    string: 'text-green-400',
    number: 'text-amber-400',
    boolean: 'text-purple-400',
    null: 'text-stone-500',
    key: 'text-violet-400',
    bracket: 'text-stone-400',
    colon: 'text-stone-500',
  },
  light: {
    string: 'text-green-600',
    number: 'text-amber-600',
    boolean: 'text-purple-600',
    null: 'text-stone-400',
    key: 'text-violet-600',
    bracket: 'text-stone-600',
    colon: 'text-stone-400',
  },
};

// =============================================================================
// JSON NODE COMPONENT
// =============================================================================

const JsonNode = memo(function JsonNode({
  keyName,
  value,
  path,
  depth,
  expandDepth,
  theme,
  searchTerm,
  onCopyPath,
  onCopyValue,
}: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < expandDepth);
  const colors = TYPE_COLORS[theme];

  const valueType = useMemo(() => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }, [value]);

  const isExpandable = valueType === 'object' || valueType === 'array';
  const itemCount = isExpandable
    ? Array.isArray(value)
      ? value.length
      : Object.keys(value as object).length
    : 0;

  const highlightMatch = useCallback(
    (text: string) => {
      if (!searchTerm) return text;
      const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (index === -1) return text;
      return (
        <>
          {text.slice(0, index)}
          <span className="bg-yellow-400/30 rounded px-0.5">
            {text.slice(index, index + searchTerm.length)}
          </span>
          {text.slice(index + searchTerm.length)}
        </>
      );
    },
    [searchTerm]
  );

  const renderValue = () => {
    switch (valueType) {
      case 'string':
        return (
          <span className={colors.string}>
            &quot;{highlightMatch(value as string)}&quot;
          </span>
        );
      case 'number':
        return <span className={colors.number}>{String(value)}</span>;
      case 'boolean':
        return <span className={colors.boolean}>{String(value)}</span>;
      case 'null':
        return <span className={colors.null}>null</span>;
      case 'array':
        if (!isExpanded) {
          return (
            <span className={colors.bracket}>
              [{itemCount} items]
            </span>
          );
        }
        return null;
      case 'object':
        if (!isExpanded) {
          return (
            <span className={colors.bracket}>
              {'{'}
              {itemCount} keys{'}'}
            </span>
          );
        }
        return null;
      default:
        return <span className={colors.null}>{String(value)}</span>;
    }
  };

  const renderChildren = () => {
    if (!isExpandable || !isExpanded) return null;

    const entries = Array.isArray(value)
      ? value.map((v, i) => [i, v] as [number, unknown])
      : Object.entries(value as object);

    return (
      <div className="pl-4 border-l border-stone-700/30">
        {entries.map(([k, v], index) => (
          <JsonNode
            key={String(k)}
            keyName={String(k)}
            value={v}
            path={Array.isArray(value) ? `${path}[${k}]` : `${path}.${k}`}
            depth={depth + 1}
            expandDepth={expandDepth}
            theme={theme}
            searchTerm={searchTerm}
            onCopyPath={onCopyPath}
            onCopyValue={onCopyValue}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="font-mono text-sm">
      <div
        className={cn(
          'flex items-start gap-1 py-0.5 group',
          isExpandable && 'cursor-pointer hover:bg-stone-700/20 rounded px-1 -mx-1'
        )}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {/* Expand/collapse icon */}
        {isExpandable && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-stone-500">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!isExpandable && <span className="w-4" />}

        {/* Key */}
        {keyName !== undefined && (
          <>
            <span className={colors.key}>{highlightMatch(keyName)}</span>
            <span className={colors.colon}>:</span>
          </>
        )}

        {/* Opening bracket for expanded objects/arrays */}
        {isExpandable && isExpanded && (
          <span className={colors.bracket}>
            {valueType === 'array' ? '[' : '{'}
          </span>
        )}

        {/* Value or collapsed preview */}
        {renderValue()}

        {/* Copy buttons (shown on hover) */}
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyPath(path);
            }}
            className={cn(
              'px-1.5 py-0.5 text-xs rounded',
              theme === 'dark'
                ? 'hover:bg-stone-700 text-stone-400'
                : 'hover:bg-stone-200 text-stone-500'
            )}
            title="Copy path"
          >
            path
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyValue(value);
            }}
            className={cn(
              'px-1.5 py-0.5 text-xs rounded',
              theme === 'dark'
                ? 'hover:bg-stone-700 text-stone-400'
                : 'hover:bg-stone-200 text-stone-500'
            )}
            title="Copy value"
          >
            value
          </button>
        </div>
      </div>

      {/* Children */}
      {renderChildren()}

      {/* Closing bracket */}
      {isExpandable && isExpanded && (
        <div className="flex items-center">
          <span className="w-4" />
          <span className={colors.bracket}>
            {valueType === 'array' ? ']' : '}'}
          </span>
        </div>
      )}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const JsonRenderer = memo(function JsonRenderer({
  content,
  defaultExpandDepth = 2,
  theme: initialTheme = 'dark',
  showRoot = true,
  className,
  maxHeight = '500px',
  onCopy,
}: JsonRendererProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse JSON content
  const parsedData = useMemo(() => {
    if (typeof content === 'object') {
      setParseError(null);
      return content;
    }

    try {
      const parsed = JSON.parse(content);
      setParseError(null);
      return parsed;
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  }, [content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    try {
      await navigator.clipboard.writeText(text);
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
      logger.error('Failed to copy JSON', { error: err });
    }
  }, [content, onCopy]);

  const handleCopyPath = useCallback(async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
    } catch (err) {
      logger.error('Failed to copy path', { error: err });
    }
  }, []);

  const handleCopyValue = useCallback(async (value: unknown) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      logger.error('Failed to copy value', { error: err });
    }
  }, []);

  const handleDownload = useCallback(() => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [content]);

  // Error state
  if (parseError) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          theme === 'dark'
            ? 'border-red-500/30 bg-red-500/10'
            : 'border-red-300 bg-red-50',
          className
        )}
      >
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">JSON Parse Error</span>
        </div>
        <p
          className={cn(
            'mt-2 text-sm font-mono',
            theme === 'dark' ? 'text-red-300' : 'text-red-600'
          )}
        >
          {parseError}
        </p>
        <pre
          className={cn(
            'mt-2 p-2 rounded text-xs overflow-auto',
            theme === 'dark' ? 'bg-stone-900' : 'bg-white'
          )}
        >
          {typeof content === 'string' ? content.slice(0, 200) : JSON.stringify(content).slice(0, 200)}...
        </pre>
      </div>
    );
  }

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
        {/* Title + Search */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              theme === 'dark'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-purple-100 text-purple-600'
            )}
          >
            JSON
          </span>

          {/* Search input */}
          <div className="relative">
            <Search
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3',
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              )}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pl-7 pr-2 py-1 text-xs rounded border w-32 focus:outline-none focus:ring-1 focus:ring-purple-500',
                theme === 'dark'
                  ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500'
                  : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400'
              )}
            />
          </div>
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
                  aria-label="Download JSON"
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
                  aria-label="Copy JSON"
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

      {/* JSON Tree */}
      <div
        className="p-4"
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflow: isExpanded ? 'visible' : 'auto',
        }}
      >
        {showRoot ? (
          <JsonNode
            value={parsedData}
            path="$"
            depth={0}
            expandDepth={defaultExpandDepth}
            theme={theme}
            searchTerm={searchTerm}
            onCopyPath={handleCopyPath}
            onCopyValue={handleCopyValue}
          />
        ) : (
          <>
            {Array.isArray(parsedData)
              ? parsedData.map((item, index) => (
                  <JsonNode
                    key={index}
                    keyName={String(index)}
                    value={item}
                    path={`$[${index}]`}
                    depth={0}
                    expandDepth={defaultExpandDepth}
                    theme={theme}
                    searchTerm={searchTerm}
                    onCopyPath={handleCopyPath}
                    onCopyValue={handleCopyValue}
                  />
                ))
              : Object.entries(parsedData as object).map(([key, val]) => (
                  <JsonNode
                    key={key}
                    keyName={key}
                    value={val}
                    path={`$.${key}`}
                    depth={0}
                    expandDepth={defaultExpandDepth}
                    theme={theme}
                    searchTerm={searchTerm}
                    onCopyPath={handleCopyPath}
                    onCopyValue={handleCopyValue}
                  />
                ))}
          </>
        )}
      </div>
    </div>
  );
});

export default JsonRenderer;
