'use client';

/**
 * VitalOpenIn - Open Query in VITAL Platform Destinations
 * 
 * A dropdown menu component that allows users to open a query
 * in different VITAL platform modes, services, or workflows.
 * 
 * Features:
 * - VITAL Mode navigation (Mode 1-4)
 * - Ask Expert service integration
 * - Workflow automation support
 * - Ask Panel integration
 * - Context-aware query passing
 * - Accessible dropdown menu with keyboard navigation
 * - Extensible provider system
 * 
 * @example
 * ```tsx
 * // VITAL Platform Internal Navigation
 * <VitalOpenIn query={userMessage}>
 *   <VitalOpenInTrigger />
 *   <VitalOpenInContent>
 *     <VitalOpenInLabel>Open in VITAL</VitalOpenInLabel>
 *     <VitalOpenInSeparator />
 *     <VitalOpenInMode1 />
 *     <VitalOpenInMode2 />
 *     <VitalOpenInMode3 />
 *     <VitalOpenInMode4 />
 *     <VitalOpenInSeparator />
 *     <VitalOpenInAskExpert />
 *     <VitalOpenInWorkflow />
 *   </VitalOpenInContent>
 * </VitalOpenIn>
 * 
 * // Or with external AI platforms
 * <VitalOpenIn query={userMessage}>
 *   <VitalOpenInTrigger />
 *   <VitalOpenInContent>
 *     <VitalOpenInLabel>Open externally</VitalOpenInLabel>
 *     <VitalOpenInChatGPT />
 *     <VitalOpenInClaude />
 *   </VitalOpenInContent>
 * </VitalOpenIn>
 * ```
 */

import { cn } from '../lib/utils';
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  BrainIcon,
  ZapIcon,
  TargetIcon,
  RocketIcon,
  SparklesIcon,
  WorkflowIcon,
  PanelLeftIcon,
  BotIcon,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';

// ============================================================================
// VITAL Platform Destinations
// ============================================================================

const vitalDestinations = {
  // Mode 1: Manual + Interactive (Expert Chat)
  mode1: {
    title: 'Mode 1: Expert Chat',
    description: 'Manual + Interactive',
    createUrl: (q: string) => `/ask-expert/mode-1?${new URLSearchParams({ q })}`,
    icon: <MessageCircleIcon className="size-4" />,
  },
  // Mode 2: Auto + Interactive (Smart Copilot)
  mode2: {
    title: 'Mode 2: Smart Copilot',
    description: 'Auto + Interactive',
    createUrl: (q: string) => `/ask-expert/mode-2?${new URLSearchParams({ q })}`,
    icon: <SparklesIcon className="size-4" />,
  },
  // Mode 3: Manual + Autonomous (Mission Control)
  mode3: {
    title: 'Mode 3: Mission Control',
    description: 'Manual + Autonomous',
    createUrl: (q: string) => `/ask-expert/mode-3?${new URLSearchParams({ q })}`,
    icon: <TargetIcon className="size-4" />,
  },
  // Mode 4: Auto + Autonomous (Background Dashboard)
  mode4: {
    title: 'Mode 4: Autonomous',
    description: 'Auto + Autonomous',
    createUrl: (q: string) => `/ask-expert/mode-4?${new URLSearchParams({ q })}`,
    icon: <RocketIcon className="size-4" />,
  },
  // Ask Expert service
  askExpert: {
    title: 'Ask Expert',
    description: 'AI-powered consultation',
    createUrl: (q: string) => `/ask-expert?${new URLSearchParams({ q })}`,
    icon: <BrainIcon className="size-4" />,
  },
  // Ask Panel
  askPanel: {
    title: 'Ask Panel',
    description: 'Quick AI assistance',
    createUrl: (q: string) => `/ask-panel?${new URLSearchParams({ q })}`,
    icon: <PanelLeftIcon className="size-4" />,
  },
  // Workflow Automation
  workflow: {
    title: 'Workflow Automation',
    description: 'Create automated workflow',
    createUrl: (q: string) => `/workflows/new?${new URLSearchParams({ prompt: q })}`,
    icon: <WorkflowIcon className="size-4" />,
  },
  // Agent Builder
  agentBuilder: {
    title: 'Agent Builder',
    description: 'Create custom agent',
    createUrl: (q: string) => `/agents/new?${new URLSearchParams({ prompt: q })}`,
    icon: <BotIcon className="size-4" />,
  },
};

// ============================================================================
// External AI Platforms (for reference/comparison)
// ============================================================================

const externalProviders = {
  chatgpt: {
    title: 'ChatGPT',
    createUrl: (prompt: string) =>
      `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', prompt })}`,
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="size-4">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729z" />
      </svg>
    ),
  },
  claude: {
    title: 'Claude',
    createUrl: (q: string) => `https://claude.ai/new?${new URLSearchParams({ q })}`,
    icon: (
      <svg fill="currentColor" viewBox="0 0 12 12" className="size-4">
        <path d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.222H5.2375L2.066 9.28L1.501 9.353L1.2575 9.125L1.288 8.752L1.4035 8.6305L2.3575 7.9745L2.3545 7.9775Z" />
      </svg>
    ),
  },
  t3: {
    title: 'T3 Chat',
    createUrl: (q: string) => `https://t3.chat/new?${new URLSearchParams({ q })}`,
    icon: <MessageCircleIcon className="size-4" />,
  },
  scira: {
    title: 'Scira AI',
    createUrl: (q: string) => `https://scira.ai/?${new URLSearchParams({ q })}`,
    icon: (
      <svg fill="none" viewBox="0 0 910 934" className="size-4">
        <path
          d="M647.664 197.775C569.13 189.049 525.5 145.419 516.774 66.8849C508.048 145.419 464.418 189.049 385.884 197.775C464.418 206.501 508.048 250.131 516.774 328.665C525.5 250.131 569.13 206.501 647.664 197.775Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="8"
        />
        <path
          d="M760.632 764.337C720.719 814.616 669.835 855.1 611.872 882.692C553.91 910.285 490.404 924.255 426.213 923.533C362.022 922.812 298.846 907.419 241.518 878.531C184.19 849.643 134.228 808.026 95.4548 756.863C56.6815 705.7 30.1238 646.346 17.8129 583.343C5.50207 520.339 7.76433 455.354 24.4266 393.359C41.089 331.364 71.7099 274.001 113.947 225.658C156.184 177.315 208.919 139.273 268.117 114.442"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="30"
        />
      </svg>
    ),
  },
  v0: {
    title: 'v0',
    createUrl: (q: string) => `https://v0.dev?${new URLSearchParams({ q })}`,
    icon: (
      <svg fill="currentColor" viewBox="0 0 147 70" className="size-4">
        <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z" />
        <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z" />
      </svg>
    ),
  },
  cursor: {
    title: 'Cursor',
    createUrl: (text: string) => {
      const url = new URL('https://cursor.com/link/prompt');
      url.searchParams.set('text', text);
      return url.toString();
    },
    icon: (
      <svg viewBox="0 0 466.73 532.09" className="size-4" fill="currentColor">
        <path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z" />
      </svg>
    ),
  },
  perplexity: {
    title: 'Perplexity',
    createUrl: (q: string) => `https://perplexity.ai/search?q=${encodeURIComponent(q)}`,
    icon: <ZapIcon className="size-4" />,
  },
};

// ============================================================================
// Context
// ============================================================================

interface OpenInContextValue {
  query: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const OpenInContext = createContext<OpenInContextValue | null>(null);

export const useOpenInContext = () => {
  const context = useContext(OpenInContext);
  if (!context) {
    throw new Error('OpenIn components must be used within VitalOpenIn');
  }
  return context;
};

// ============================================================================
// Types
// ============================================================================

export type VitalOpenInProps = ComponentProps<'div'> & {
  /** The query/message to pass to destinations */
  query: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
};

export type VitalOpenInTriggerProps = ComponentProps<'button'>;
export type VitalOpenInContentProps = ComponentProps<'div'>;
export type VitalOpenInItemProps = ComponentProps<'a'> & {
  /** Whether this is an internal VITAL link (default) or external */
  external?: boolean;
};
export type VitalOpenInLabelProps = ComponentProps<'div'>;
export type VitalOpenInSeparatorProps = ComponentProps<'div'>;

// ============================================================================
// Components
// ============================================================================

/**
 * Root container with context
 */
export const VitalOpenIn = forwardRef<HTMLDivElement, VitalOpenInProps>(
  ({ query, open, onOpenChange, className, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isOpen = open ?? internalOpen;
    const setIsOpen = onOpenChange ?? setInternalOpen;

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, setIsOpen]);

    // Close on Escape
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen, setIsOpen]);

    return (
      <OpenInContext.Provider value={{ query, isOpen, setIsOpen }}>
        <div
          ref={containerRef}
          className={cn('relative inline-block', className)}
          {...props}
        >
          {children}
        </div>
      </OpenInContext.Provider>
    );
  }
);

/**
 * Dropdown trigger button
 */
export const VitalOpenInTrigger = forwardRef<HTMLButtonElement, VitalOpenInTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useOpenInContext();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2',
          'text-sm font-medium hover:bg-accent transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        {...props}
      >
        {children ?? (
          <>
            Open in...
            <ChevronDownIcon className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
          </>
        )}
      </button>
    );
  }
);

/**
 * Dropdown content
 */
export const VitalOpenInContent = forwardRef<HTMLDivElement, VitalOpenInContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useOpenInContext();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full left-0 z-50 mt-1 w-[260px]',
          'rounded-md border bg-popover p-1 shadow-md',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
          className
        )}
        role="menu"
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * Menu item (supports both internal and external links)
 */
export const VitalOpenInItem = forwardRef<HTMLAnchorElement, VitalOpenInItemProps>(
  ({ className, external = false, children, ...props }, ref) => {
    const { setIsOpen } = useOpenInContext();

    return (
      <a
        ref={ref}
        className={cn(
          'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
          'hover:bg-accent cursor-pointer transition-colors',
          'focus:bg-accent focus:outline-none',
          className
        )}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        role="menuitem"
        onClick={() => !external && setIsOpen(false)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

/**
 * Label for grouping
 */
export const VitalOpenInLabel = forwardRef<HTMLDivElement, VitalOpenInLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
      {...props}
    />
  )
);

/**
 * Separator
 */
export const VitalOpenInSeparator = forwardRef<HTMLDivElement, VitalOpenInSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
  )
);

// ============================================================================
// VITAL Platform Destination Items
// ============================================================================

type VitalDestinationItemProps = Omit<VitalOpenInItemProps, 'href' | 'external'>;

/** Mode 1: Expert Chat (Manual + Interactive) */
export const VitalOpenInMode1 = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.mode1;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-blue-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Mode 2: Smart Copilot (Auto + Interactive) */
export const VitalOpenInMode2 = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.mode2;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-purple-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Mode 3: Mission Control (Manual + Autonomous) */
export const VitalOpenInMode3 = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.mode3;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-orange-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Mode 4: Autonomous (Auto + Autonomous) */
export const VitalOpenInMode4 = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.mode4;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-green-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Ask Expert Service */
export const VitalOpenInAskExpert = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.askExpert;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-primary">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Ask Panel */
export const VitalOpenInAskPanel = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.askPanel;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Workflow Automation */
export const VitalOpenInWorkflow = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.workflow;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-cyan-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

/** Agent Builder */
export const VitalOpenInAgentBuilder = forwardRef<HTMLAnchorElement, VitalDestinationItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const dest = vitalDestinations.agentBuilder;
    return (
      <VitalOpenInItem ref={ref} href={dest.createUrl(query)} {...props}>
        <span className="shrink-0 text-amber-500">{dest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{dest.title}</div>
          <div className="text-xs text-muted-foreground">{dest.description}</div>
        </div>
      </VitalOpenInItem>
    );
  }
);

// ============================================================================
// External AI Platform Items (for reference/export use cases)
// ============================================================================

type ExternalItemProps = Omit<VitalOpenInItemProps, 'href' | 'external'>;

/** ChatGPT (External) */
export const VitalOpenInChatGPT = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.chatgpt;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** Claude (External) */
export const VitalOpenInClaude = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.claude;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** T3 Chat (External) */
export const VitalOpenInT3 = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.t3;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** Scira AI (External) */
export const VitalOpenInScira = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.scira;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** v0 (External) */
export const VitalOpenInV0 = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.v0;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** Cursor (External) */
export const VitalOpenInCursor = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.cursor;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

/** Perplexity (External) */
export const VitalOpenInPerplexity = forwardRef<HTMLAnchorElement, ExternalItemProps>(
  (props, ref) => {
    const { query } = useOpenInContext();
    const provider = externalProviders.perplexity;
    return (
      <VitalOpenInItem ref={ref} href={provider.createUrl(query)} external {...props}>
        <span className="shrink-0">{provider.icon}</span>
        <span className="flex-1">{provider.title}</span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </VitalOpenInItem>
    );
  }
);

// ============================================================================
// Display Names
// ============================================================================

VitalOpenIn.displayName = 'VitalOpenIn';
VitalOpenInTrigger.displayName = 'VitalOpenInTrigger';
VitalOpenInContent.displayName = 'VitalOpenInContent';
VitalOpenInItem.displayName = 'VitalOpenInItem';
VitalOpenInLabel.displayName = 'VitalOpenInLabel';
VitalOpenInSeparator.displayName = 'VitalOpenInSeparator';
VitalOpenInMode1.displayName = 'VitalOpenInMode1';
VitalOpenInMode2.displayName = 'VitalOpenInMode2';
VitalOpenInMode3.displayName = 'VitalOpenInMode3';
VitalOpenInMode4.displayName = 'VitalOpenInMode4';
VitalOpenInAskExpert.displayName = 'VitalOpenInAskExpert';
VitalOpenInAskPanel.displayName = 'VitalOpenInAskPanel';
VitalOpenInWorkflow.displayName = 'VitalOpenInWorkflow';
VitalOpenInAgentBuilder.displayName = 'VitalOpenInAgentBuilder';
VitalOpenInChatGPT.displayName = 'VitalOpenInChatGPT';
VitalOpenInClaude.displayName = 'VitalOpenInClaude';
VitalOpenInT3.displayName = 'VitalOpenInT3';
VitalOpenInScira.displayName = 'VitalOpenInScira';
VitalOpenInV0.displayName = 'VitalOpenInV0';
VitalOpenInCursor.displayName = 'VitalOpenInCursor';
VitalOpenInPerplexity.displayName = 'VitalOpenInPerplexity';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const OpenIn = VitalOpenIn;
export const OpenInTrigger = VitalOpenInTrigger;
export const OpenInContent = VitalOpenInContent;
export const OpenInItem = VitalOpenInItem;
export const OpenInLabel = VitalOpenInLabel;
export const OpenInSeparator = VitalOpenInSeparator;
export const OpenInChatGPT = VitalOpenInChatGPT;
export const OpenInClaude = VitalOpenInClaude;
export const OpenInT3 = VitalOpenInT3;
export const OpenInScira = VitalOpenInScira;
export const OpenInv0 = VitalOpenInV0;
export const OpenInCursor = VitalOpenInCursor;

// Legacy aliases
export const VitalOpenInChat = VitalOpenIn;
export const OpenInChat = VitalOpenIn;

export default VitalOpenIn;
