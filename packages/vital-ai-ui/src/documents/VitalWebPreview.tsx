'use client';

/**
 * VitalWebPreview - Live Web Preview Component Suite
 * 
 * A flexible way to showcase generated UI components with live preview
 * and optional source code display. Designed for documentation and demos.
 * 
 * Features:
 * - Live preview of UI components
 * - Composable architecture with dedicated sub-components
 * - Responsive design modes (Desktop, Tablet, Mobile)
 * - Navigation controls with back/forward functionality
 * - URL input and example selector
 * - Full screen mode support
 * - Console logging with timestamps
 * - Context-based state management
 * - Consistent styling with the design system
 * 
 * @example
 * ```tsx
 * <VitalWebPreview defaultUrl="https://example.com">
 *   <VitalWebPreviewNavigation>
 *     <VitalWebPreviewNavigationButton tooltip="Back">
 *       <ChevronLeft className="size-4" />
 *     </VitalWebPreviewNavigationButton>
 *     <VitalWebPreviewUrl />
 *   </VitalWebPreviewNavigation>
 *   <VitalWebPreviewBody src={url} />
 *   <VitalWebPreviewConsole logs={logs} />
 * </VitalWebPreview>
 * ```
 */

import { cn } from '../lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useEffect, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface WebPreviewContextValue {
  url: string;
  setUrl: (url: string) => void;
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
}

export type VitalWebPreviewProps = ComponentProps<'div'> & {
  /** The initial URL to load in the preview */
  defaultUrl?: string;
  /** Callback fired when the URL changes */
  onUrlChange?: (url: string) => void;
};

export type VitalWebPreviewNavigationProps = ComponentProps<'div'>;

export type VitalWebPreviewNavigationButtonProps = ComponentProps<'button'> & {
  /** Tooltip text to display on hover */
  tooltip?: string;
};

export type VitalWebPreviewUrlProps = ComponentProps<'input'>;

export type VitalWebPreviewBodyProps = ComponentProps<'iframe'> & {
  /** Optional loading indicator to display over the preview */
  loading?: ReactNode;
};

export type ConsoleLogEntry = {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: Date;
};

export type VitalWebPreviewConsoleProps = ComponentProps<'div'> & {
  /** Console log entries to display in the console panel */
  logs?: ConsoleLogEntry[];
};

// ============================================================================
// Context
// ============================================================================

const WebPreviewContext = createContext<WebPreviewContextValue | null>(null);

export const useWebPreview = () => {
  const context = useContext(WebPreviewContext);
  if (!context) {
    throw new Error('WebPreview components must be used within a VitalWebPreview');
  }
  return context;
};

// ============================================================================
// Tooltip Component (inline to avoid external dependencies)
// ============================================================================

const SimpleTooltip = ({
  children,
  content,
}: {
  children: ReactNode;
  content: string;
}) => (
  <div className="group relative inline-flex">
    {children}
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
        'z-50 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground',
        'opacity-0 transition-opacity group-hover:opacity-100',
        'whitespace-nowrap'
      )}
    >
      {content}
    </div>
  </div>
);

// ============================================================================
// Components
// ============================================================================

/**
 * Root web preview container with context
 */
export const VitalWebPreview = forwardRef<HTMLDivElement, VitalWebPreviewProps>(
  ({ className, children, defaultUrl = '', onUrlChange, ...props }, ref) => {
    const [url, setUrl] = useState(defaultUrl);
    const [consoleOpen, setConsoleOpen] = useState(false);

    const handleUrlChange = (newUrl: string) => {
      setUrl(newUrl);
      onUrlChange?.(newUrl);
    };

    // Update URL when defaultUrl prop changes
    useEffect(() => {
      if (defaultUrl !== url) {
        setUrl(defaultUrl);
      }
    }, [defaultUrl]);

    const contextValue: WebPreviewContextValue = {
      url,
      setUrl: handleUrlChange,
      consoleOpen,
      setConsoleOpen,
    };

    return (
      <WebPreviewContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'flex size-full flex-col rounded-lg border bg-card',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </WebPreviewContext.Provider>
    );
  }
);

/**
 * Navigation bar container
 */
export const VitalWebPreviewNavigation = forwardRef<HTMLDivElement, VitalWebPreviewNavigationProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-1 border-b p-2', className)}
      {...props}
    >
      {children}
    </div>
  )
);

/**
 * Navigation button with optional tooltip
 */
export const VitalWebPreviewNavigationButton = forwardRef<HTMLButtonElement, VitalWebPreviewNavigationButtonProps>(
  ({ className, onClick, disabled, tooltip, children, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'h-8 w-8 p-0 text-muted-foreground',
          'transition-colors hover:text-foreground hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );

    if (tooltip) {
      return <SimpleTooltip content={tooltip}>{button}</SimpleTooltip>;
    }

    return button;
  }
);

/**
 * URL input field
 */
export const VitalWebPreviewUrl = forwardRef<HTMLInputElement, VitalWebPreviewUrlProps>(
  ({ className, value, onChange, onKeyDown, ...props }, ref) => {
    const { url, setUrl } = useWebPreview();
    const [inputValue, setInputValue] = useState(url);

    // Sync input value with context URL when it changes externally
    useEffect(() => {
      setInputValue(url);
    }, [url]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      onChange?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        setUrl(target.value);
      }
      onKeyDown?.(event);
    };

    return (
      <input
        ref={ref}
        type="text"
        className={cn(
          'flex h-8 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onChange={onChange ?? handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter URL..."
        value={value ?? inputValue}
        {...props}
      />
    );
  }
);

/**
 * Preview iframe body
 */
export const VitalWebPreviewBody = forwardRef<HTMLIFrameElement, VitalWebPreviewBodyProps>(
  ({ className, loading, src, ...props }, ref) => {
    const { url } = useWebPreview();

    return (
      <div className="relative flex-1">
        <iframe
          ref={ref}
          className={cn('size-full', className)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          src={(src ?? url) || undefined}
          title="Preview"
          {...props}
        />
        {loading}
      </div>
    );
  }
);

/**
 * Console output panel
 */
export const VitalWebPreviewConsole = forwardRef<HTMLDivElement, VitalWebPreviewConsoleProps>(
  ({ className, logs = [], children, ...props }, ref) => {
    const { consoleOpen, setConsoleOpen } = useWebPreview();

    return (
      <div
        ref={ref}
        className={cn('border-t bg-muted/50 font-mono text-sm', className)}
        {...props}
      >
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setConsoleOpen(!consoleOpen)}
          className={cn(
            'flex w-full items-center justify-between p-4 text-left font-medium',
            'hover:bg-muted/50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset'
          )}
        >
          Console
          <ChevronDownIcon
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              consoleOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Content */}
        {consoleOpen && (
          <div className="px-4 pb-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No console output</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={`${log.timestamp.getTime()}-${index}`}
                    className={cn(
                      'text-xs',
                      log.level === 'error' && 'text-destructive',
                      log.level === 'warn' && 'text-yellow-600',
                      log.level === 'log' && 'text-foreground'
                    )}
                  >
                    <span className="text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </span>{' '}
                    {log.message}
                  </div>
                ))
              )}
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }
);

// ============================================================================
// Display Names
// ============================================================================

VitalWebPreview.displayName = 'VitalWebPreview';
VitalWebPreviewNavigation.displayName = 'VitalWebPreviewNavigation';
VitalWebPreviewNavigationButton.displayName = 'VitalWebPreviewNavigationButton';
VitalWebPreviewUrl.displayName = 'VitalWebPreviewUrl';
VitalWebPreviewBody.displayName = 'VitalWebPreviewBody';
VitalWebPreviewConsole.displayName = 'VitalWebPreviewConsole';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const WebPreview = VitalWebPreview;
export const WebPreviewNavigation = VitalWebPreviewNavigation;
export const WebPreviewNavigationButton = VitalWebPreviewNavigationButton;
export const WebPreviewUrl = VitalWebPreviewUrl;
export const WebPreviewBody = VitalWebPreviewBody;
export const WebPreviewConsole = VitalWebPreviewConsole;

export default VitalWebPreview;
