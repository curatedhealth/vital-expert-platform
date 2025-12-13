'use client';

/**
 * VITAL Platform - ReactRenderer Component
 *
 * Renders React components in a sandboxed iframe for security isolation.
 * Supports JSX/TSX code preview and live execution with error boundaries.
 *
 * SECURITY:
 * - All React code runs in a sandboxed iframe with restricted permissions
 * - No access to parent window, cookies, or storage
 * - CSP headers prevent external script loading (except React CDN)
 * - Communication only via postMessage with origin validation
 * - sandbox="allow-scripts" blocks forms, popups, top navigation
 *
 * Features:
 * - Live React component preview in sandboxed iframe
 * - Source code view with syntax highlighting
 * - Error boundary with friendly error display
 * - Theme support (dark/light)
 * - Copy/download functionality
 * - Console output capture
 *
 * Limitations:
 * - No npm imports (only React, ReactDOM available)
 * - No external API calls from sandbox
 * - Limited to single-file components
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
  RefreshCw,
  Terminal,
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

export interface ReactRendererProps {
  /** React/JSX/TSX code to render */
  content: string;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Custom class names */
  className?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Title for the artifact */
  title?: string;
  /** Show source toggle */
  showSourceToggle?: boolean;
  /** Default to source view */
  defaultShowSource?: boolean;
  /** Called when copy is clicked */
  onCopy?: () => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
}

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

// =============================================================================
// SANDBOX HTML TEMPLATE
// =============================================================================

/**
 * Creates a sandboxed HTML document for React component execution.
 * Uses React.createElement for error display to avoid innerHTML.
 */
function createSandboxHtml(code: string, theme: 'dark' | 'light'): string {
  const bgColor = theme === 'dark' ? '#1c1c1c' : '#ffffff';
  const textColor = theme === 'dark' ? '#e5e5e5' : '#1c1c1c';
  const errorBg = theme === 'dark' ? '#2d1f1f' : '#fef2f2';
  const errorBorder = theme === 'dark' ? '#dc2626' : '#fca5a5';
  const errorText = theme === 'dark' ? '#fca5a5' : '#dc2626';

  // Escape code for safe embedding in script
  const escapedCode = code
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline';">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: ${bgColor};
      color: ${textColor};
      padding: 16px;
      min-height: 100vh;
    }
    #root { width: 100%; }
    .error-boundary {
      padding: 16px;
      background: ${errorBg};
      border: 1px solid ${errorBorder};
      border-radius: 8px;
      color: ${errorText};
    }
    .error-boundary h3 { margin-bottom: 8px; font-size: 14px; font-weight: 600; }
    .error-boundary pre {
      font-family: ui-monospace, monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    // Capture console output and send to parent
    const originalConsole = { ...console };
    ['log', 'warn', 'error', 'info'].forEach(method => {
      console[method] = (...args) => {
        originalConsole[method](...args);
        window.parent.postMessage({
          type: 'console',
          method,
          content: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')
        }, '*');
      };
    });

    // Error boundary component using React.createElement (no JSX in this scope)
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      componentDidCatch(error, info) {
        window.parent.postMessage({
          type: 'error',
          content: error.toString() + (info.componentStack ? '\\n' + info.componentStack : '')
        }, '*');
      }
      render() {
        if (this.state.hasError) {
          return React.createElement('div', { className: 'error-boundary' },
            React.createElement('h3', null, 'Component Error'),
            React.createElement('pre', null, this.state.error ? this.state.error.toString() : 'Unknown error')
          );
        }
        return this.props.children;
      }
    }

    // Helper to render error using safe DOM methods
    function showError(title, message) {
      const root = document.getElementById('root');
      // Clear existing content
      while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
      // Create error display using safe DOM methods
      const container = document.createElement('div');
      container.className = 'error-boundary';
      const heading = document.createElement('h3');
      heading.textContent = title;
      const pre = document.createElement('pre');
      pre.textContent = message;
      container.appendChild(heading);
      container.appendChild(pre);
      root.appendChild(container);
    }

    try {
      // User's code (transpiled by Babel)
      ${escapedCode}

      // Try to find the default export or App component
      const ComponentToRender = typeof App !== 'undefined' ? App :
                                typeof Component !== 'undefined' ? Component :
                                typeof Default !== 'undefined' ? Default :
                                null;

      if (ComponentToRender) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          React.createElement(ErrorBoundary, null,
            React.createElement(ComponentToRender)
          )
        );
        window.parent.postMessage({ type: 'ready' }, '*');
      } else {
        window.parent.postMessage({ type: 'ready' }, '*');
      }
    } catch (error) {
      window.parent.postMessage({
        type: 'error',
        content: error.toString()
      }, '*');
      showError('Compilation Error', error.toString());
    }
  </script>
</body>
</html>`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ReactRenderer = memo(function ReactRenderer({
  content,
  theme: initialTheme = 'dark',
  className,
  maxHeight = '400px',
  title,
  showSourceToggle = true,
  defaultShowSource = false,
  onCopy,
  onError,
}: ReactRendererProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [showSource, setShowSource] = useState(defaultShowSource);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate sandbox HTML and create blob URL
  useEffect(() => {
    const sandboxHtml = createSandboxHtml(content, theme);
    const blob = new Blob([sandboxHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    // Cleanup previous blob URL
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [content, theme]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      const { type, method, content: msgContent } = event.data;

      switch (type) {
        case 'ready':
          setIsLoading(false);
          setError(null);
          break;
        case 'error':
          setError(msgContent);
          setIsLoading(false);
          onError?.(msgContent);
          break;
        case 'console':
          setConsoleMessages(prev => [...prev, {
            type: method as ConsoleMessage['type'],
            content: msgContent,
            timestamp: new Date(),
          }]);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError]);

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
      console.error('Failed to copy code:', err);
    }
  }, [content, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title || 'component') + '.jsx';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [content, title]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setConsoleMessages([]);
    // Force iframe reload by regenerating blob URL
    if (blobUrl) {
      const sandboxHtml = createSandboxHtml(content, theme);
      const blob = new Blob([sandboxHtml], { type: 'text/html' });
      const newUrl = URL.createObjectURL(blob);
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(newUrl);
    }
  }, [blobUrl, content, theme]);

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
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-cyan-100 text-cyan-600'
            )}
          >
            React
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
          {error && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle className="w-3 h-3" />
              Error
            </span>
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

            {/* Console toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConsole(!showConsole)}
                  className={cn(
                    'h-7 w-7 relative',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
                    showConsole && (theme === 'dark' ? 'bg-stone-700' : 'bg-stone-200')
                  )}
                  aria-label="Toggle console"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  {consoleMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-purple-500 text-white rounded-full flex items-center justify-center">
                      {consoleMessages.length > 9 ? '9+' : consoleMessages.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Console</TooltipContent>
            </Tooltip>

            {/* Refresh */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Refresh preview"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Refresh</TooltipContent>
            </Tooltip>

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

      {/* Content */}
      <div style={{ maxHeight }} className="overflow-auto">
        {showSource ? (
          // Source code view
          <pre
            className={cn(
              'p-4 text-sm font-mono whitespace-pre-wrap break-words',
              theme === 'dark' ? 'text-stone-300 bg-stone-900' : 'text-stone-700 bg-white'
            )}
          >
            {content}
          </pre>
        ) : (
          // Preview in sandboxed iframe
          <div className="relative" style={{ minHeight: '200px' }}>
            {isLoading && (
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center z-10',
                  theme === 'dark' ? 'bg-stone-900' : 'bg-white'
                )}
              >
                <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            )}
            {blobUrl && (
              <iframe
                ref={iframeRef}
                src={blobUrl}
                title={title || 'React Preview'}
                sandbox="allow-scripts"
                className="w-full border-0"
                style={{
                  height: typeof maxHeight === 'number' ? maxHeight : maxHeight,
                  minHeight: '200px',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div
          className={cn(
            'border-t max-h-32 overflow-auto',
            theme === 'dark' ? 'border-stone-700 bg-stone-950' : 'border-stone-200 bg-stone-50'
          )}
        >
          <div className="p-2 space-y-1">
            {consoleMessages.length === 0 ? (
              <p
                className={cn(
                  'text-xs italic',
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                )}
              >
                No console output
              </p>
            ) : (
              consoleMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'text-xs font-mono flex items-start gap-2',
                    msg.type === 'error' && 'text-red-400',
                    msg.type === 'warn' && 'text-amber-400',
                    msg.type === 'info' && 'text-violet-400',
                    msg.type === 'log' && (theme === 'dark' ? 'text-stone-300' : 'text-stone-600')
                  )}
                >
                  <span className="opacity-50">[{msg.type}]</span>
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ReactRenderer;
