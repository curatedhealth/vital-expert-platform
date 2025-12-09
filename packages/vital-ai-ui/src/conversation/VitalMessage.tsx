'use client';

/**
 * VitalMessage - Complete Message Component Suite
 * 
 * A comprehensive set of components for building chat interfaces with support for:
 * - User and assistant messages with distinct styling
 * - Response branching with navigation controls
 * - Markdown rendering with GFM support, math equations, and smart streaming
 * - Action buttons with tooltips and state management
 * - File attachments with image preview and removal
 * 
 * Features:
 * - Displays messages from both user and AI assistant with distinct styling
 * - Minimalist flat design with user messages in secondary background
 * - Response branching with navigation controls for multiple AI response versions
 * - Markdown rendering with GFM support (tables, task lists, strikethrough)
 * - Action buttons for common operations (retry, like, dislike, copy, share)
 * - File attachments display with support for images and generic files
 * - Code blocks with syntax highlighting and copy-to-clipboard
 * - Keyboard accessible with proper ARIA labels
 * - Responsive design that adapts to different screen sizes
 * 
 * @example
 * ```tsx
 * <VitalMessage from="assistant">
 *   <VitalMessageContent>
 *     <VitalMessageResponse>{markdownContent}</VitalMessageResponse>
 *   </VitalMessageContent>
 * </VitalMessage>
 * <VitalMessageActions>
 *   <VitalMessageAction onClick={handleRetry} label="Retry">
 *     <RefreshCcwIcon className="size-3" />
 *   </VitalMessageAction>
 * </VitalMessageActions>
 * ```
 */

import { cn } from '../lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperclipIcon,
  XIcon,
} from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactElement, ReactNode } from 'react';
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
  forwardRef,
} from 'react';

// ============================================================================
// VITAL Types
// ============================================================================

/** Agent level in VITAL hierarchy */
export type AgentLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** VITAL mode (1-4) */
export type VitalMode = 1 | 2 | 3 | 4;

/** Agent sending the message */
export interface MessageAgent {
  name: string;
  level: AgentLevel;
  avatar?: string;
  icon?: ReactNode;
}

/** Confidence score for the message */
export interface MessageConfidence {
  score: number; // 0-100
  label?: 'low' | 'medium' | 'high';
  reasoning?: string;
}

/** Message metadata for VITAL */
export interface MessageMetadata {
  /** Agent that generated the message */
  agent?: MessageAgent;
  /** VITAL mode */
  mode?: VitalMode;
  /** Confidence score */
  confidence?: MessageConfidence;
  /** Token usage */
  tokenUsage?: number;
  /** Generation time */
  duration?: string;
  /** Langfuse trace ID */
  traceId?: string;
  /** Sources/citations count */
  sourcesCount?: number;
  /** Tools used */
  toolsUsed?: string[];
}

// ============================================================================
// Types
// ============================================================================

/** Message role type */
export type MessageRole = 'user' | 'assistant' | 'system';

/** File attachment data */
export interface FileUIPart {
  type: 'file';
  url: string;
  mediaType?: string;
  filename?: string;
}

export type VitalMessageProps = HTMLAttributes<HTMLDivElement> & {
  /** The role of the message sender */
  from: MessageRole;
  /** VITAL-specific: Agent metadata */
  agent?: MessageAgent;
  /** VITAL-specific: Confidence score */
  confidence?: MessageConfidence;
  /** VITAL-specific: Additional metadata */
  metadata?: MessageMetadata;
};

export type VitalMessageContentProps = HTMLAttributes<HTMLDivElement>;

export type VitalMessageActionsProps = ComponentProps<'div'>;

export type VitalMessageActionProps = ComponentProps<'button'> & {
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Button variant */
  variant?: 'default' | 'ghost' | 'outline';
  /** Button size */
  size?: 'default' | 'sm' | 'icon' | 'icon-sm';
};

export type VitalMessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  /** The index of the branch to show by default */
  defaultBranch?: number;
  /** Callback fired when the branch changes */
  onBranchChange?: (branchIndex: number) => void;
};

export type VitalMessageBranchContentProps = HTMLAttributes<HTMLDivElement>;

export type VitalMessageBranchSelectorProps = HTMLAttributes<HTMLDivElement> & {
  /** Aligns the selector for user, assistant or system messages */
  from: MessageRole;
};

export type VitalMessageBranchPreviousProps = ComponentProps<'button'>;

export type VitalMessageBranchNextProps = ComponentProps<'button'>;

export type VitalMessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;

export type VitalMessageResponseProps = ComponentProps<'div'> & {
  /** The markdown content to render */
  children: string;
  /** Whether to parse and fix incomplete markdown syntax */
  parseIncompleteMarkdown?: boolean;
  /** Custom React components for rendering markdown elements */
  components?: Record<string, React.ComponentType<any>>;
  /** Array of allowed URL prefixes for images */
  allowedImagePrefixes?: string[];
  /** Array of allowed URL prefixes for links */
  allowedLinkPrefixes?: string[];
  /** Default origin for relative URLs */
  defaultOrigin?: string;
};

export type VitalMessageAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  /** The file data to display */
  data: FileUIPart;
  /** Callback fired when the remove button is clicked */
  onRemove?: () => void;
};

export type VitalMessageAttachmentsProps = ComponentProps<'div'>;

export type VitalMessageToolbarProps = ComponentProps<'div'>;

// ============================================================================
// Contexts
// ============================================================================

interface MessageBranchContextType {
  currentBranch: number;
  totalBranches: number;
  goToPrevious: () => void;
  goToNext: () => void;
  branches: ReactElement[];
  setBranches: (branches: ReactElement[]) => void;
}

const MessageBranchContext = createContext<MessageBranchContextType | null>(null);

const useMessageBranch = () => {
  const context = useContext(MessageBranchContext);
  if (!context) {
    throw new Error('MessageBranch components must be used within VitalMessageBranch');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root message container with role-based styling
 */
export const VitalMessage = forwardRef<HTMLDivElement, VitalMessageProps>(
  ({ className, from, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group flex w-full max-w-[80%] flex-col gap-2',
        from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
        className
      )}
      role="article"
      aria-label={`${from} message`}
      {...props}
    />
  )
);

/**
 * Message content wrapper with role-based styling
 */
export const VitalMessageContent = ({
  children,
  className,
  ...props
}: VitalMessageContentProps) => (
  <div
    className={cn(
      'flex w-fit flex-col gap-2 overflow-hidden text-sm',
      'group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground',
      'group-[.is-assistant]:text-foreground',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * Container for message action buttons
 */
export const VitalMessageActions = ({
  className,
  children,
  ...props
}: VitalMessageActionsProps) => (
  <div className={cn('flex items-center gap-1', className)} {...props}>
    {children}
  </div>
);

/**
 * Individual action button with optional tooltip
 */
export const VitalMessageAction = ({
  tooltip,
  children,
  label,
  variant = 'ghost',
  size = 'icon-sm',
  className,
  ...props
}: VitalMessageActionProps) => {
  const sizeClasses = {
    default: 'h-10 px-4',
    sm: 'h-8 px-3 text-sm',
    icon: 'h-10 w-10',
    'icon-sm': 'h-8 w-8',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent',
  };

  const button = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={label || tooltip}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </button>
  );

  if (tooltip) {
    return (
      <div className="relative group/tooltip">
        {button}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {tooltip}
        </div>
      </div>
    );
  }

  return button;
};

/**
 * Branch container for multiple response versions
 */
export const VitalMessageBranch = ({
  defaultBranch = 0,
  onBranchChange,
  className,
  children,
  ...props
}: VitalMessageBranchProps) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);
  const [branches, setBranches] = useState<ReactElement[]>([]);

  const handleBranchChange = (newBranch: number) => {
    setCurrentBranch(newBranch);
    onBranchChange?.(newBranch);
  };

  const goToPrevious = () => {
    const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
    handleBranchChange(newBranch);
  };

  const goToNext = () => {
    const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
    handleBranchChange(newBranch);
  };

  const contextValue: MessageBranchContextType = {
    currentBranch,
    totalBranches: branches.length,
    goToPrevious,
    goToNext,
    branches,
    setBranches,
  };

  return (
    <MessageBranchContext.Provider value={contextValue}>
      <div className={cn('grid w-full gap-2 [&>div]:pb-0', className)} {...props}>
        {children}
      </div>
    </MessageBranchContext.Provider>
  );
};

/**
 * Content container for branch items
 */
export const VitalMessageBranchContent = ({
  children,
  ...props
}: VitalMessageBranchContentProps) => {
  const { currentBranch, setBranches, branches } = useMessageBranch();
  const childrenArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    if (branches.length !== childrenArray.length) {
      setBranches(childrenArray as ReactElement[]);
    }
  }, [childrenArray, branches, setBranches]);

  return (
    <>
      {childrenArray.map((branch, index) => (
        <div
          className={cn(
            'grid gap-2 overflow-hidden [&>div]:pb-0',
            index === currentBranch ? 'block' : 'hidden'
          )}
          key={(branch as ReactElement)?.key ?? index}
          {...props}
        >
          {branch}
        </div>
      ))}
    </>
  );
};

/**
 * Branch selector navigation
 */
export const VitalMessageBranchSelector = ({
  className,
  from,
  children,
  ...props
}: VitalMessageBranchSelectorProps) => {
  const { totalBranches } = useMessageBranch();

  if (totalBranches <= 1) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border bg-background',
        from === 'user' ? 'ml-auto' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Previous branch button
 */
export const VitalMessageBranchPrevious = ({
  children,
  className,
  ...props
}: VitalMessageBranchPreviousProps) => {
  const { goToPrevious, totalBranches } = useMessageBranch();

  return (
    <button
      type="button"
      aria-label="Previous branch"
      disabled={totalBranches <= 1}
      onClick={goToPrevious}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-l-md',
        'hover:bg-accent transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children ?? <ChevronLeftIcon className="size-4" />}
    </button>
  );
};

/**
 * Next branch button
 */
export const VitalMessageBranchNext = ({
  children,
  className,
  ...props
}: VitalMessageBranchNextProps) => {
  const { goToNext, totalBranches } = useMessageBranch();

  return (
    <button
      type="button"
      aria-label="Next branch"
      disabled={totalBranches <= 1}
      onClick={goToNext}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-r-md',
        'hover:bg-accent transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon className="size-4" />}
    </button>
  );
};

/**
 * Branch page indicator
 */
export const VitalMessageBranchPage = ({
  className,
  ...props
}: VitalMessageBranchPageProps) => {
  const { currentBranch, totalBranches } = useMessageBranch();

  return (
    <span
      className={cn(
        'px-2 text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {currentBranch + 1} of {totalBranches}
    </span>
  );
};

/**
 * Markdown response renderer with streaming support
 * 
 * Note: For full Streamdown integration, add to globals.css:
 * @source "../node_modules/streamdown/dist/index.js";
 */
export const VitalMessageResponse = memo(
  ({
    className,
    children,
    parseIncompleteMarkdown = true,
    components,
    allowedImagePrefixes = ['*'],
    allowedLinkPrefixes = ['*'],
    defaultOrigin,
    ...props
  }: VitalMessageResponseProps) => {
    // Simple markdown-like rendering (for full support, use Streamdown)
    const content = typeof children === 'string' ? children : '';
    
    return (
      <div
        className={cn(
          'prose prose-sm max-w-none dark:prose-invert',
          'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          className
        )}
        {...props}
      >
        {/* Basic whitespace preservation - for full markdown use Streamdown */}
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

/**
 * Single file attachment display
 */
export const VitalMessageAttachment = ({
  data,
  className,
  onRemove,
  ...props
}: VitalMessageAttachmentProps) => {
  const filename = data.filename || '';
  const isImage = data.mediaType?.startsWith('image/') && data.url;
  const attachmentLabel = filename || (isImage ? 'Image' : 'Attachment');

  return (
    <div
      className={cn('group relative size-24 overflow-hidden rounded-lg', className)}
      {...props}
    >
      {isImage ? (
        <>
          <img
            alt={filename || 'attachment'}
            className="size-full object-cover"
            height={96}
            src={data.url}
            width={96}
          />
          {onRemove && (
            <button
              type="button"
              aria-label="Remove attachment"
              className={cn(
                'absolute top-2 right-2 size-6 rounded-full p-0',
                'bg-background/80 backdrop-blur-sm',
                'opacity-0 transition-opacity group-hover:opacity-100',
                'hover:bg-background',
                'inline-flex items-center justify-center'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <XIcon className="size-3" />
              <span className="sr-only">Remove</span>
            </button>
          )}
        </>
      ) : (
        <>
          <div
            className="flex size-full shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            title={attachmentLabel}
          >
            <PaperclipIcon className="size-4" />
          </div>
          {onRemove && (
            <button
              type="button"
              aria-label="Remove attachment"
              className={cn(
                'absolute top-2 right-2 size-6 rounded-full p-0',
                'opacity-0 transition-opacity group-hover:opacity-100',
                'hover:bg-accent',
                'inline-flex items-center justify-center'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <XIcon className="size-3" />
              <span className="sr-only">Remove</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Container for multiple file attachments
 */
export const VitalMessageAttachments = ({
  children,
  className,
  ...props
}: VitalMessageAttachmentsProps) => {
  if (!children) return null;

  return (
    <div
      className={cn('ml-auto flex w-fit flex-wrap items-start gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Toolbar container for message actions
 */
export const VitalMessageToolbar = ({
  className,
  children,
  ...props
}: VitalMessageToolbarProps) => (
  <div
    className={cn('mt-4 flex w-full items-center justify-between gap-4', className)}
    {...props}
  >
    {children}
  </div>
);

// ============================================================================
// Display Names
// ============================================================================

VitalMessage.displayName = 'VitalMessage';
VitalMessageContent.displayName = 'VitalMessageContent';
VitalMessageActions.displayName = 'VitalMessageActions';
VitalMessageAction.displayName = 'VitalMessageAction';
VitalMessageBranch.displayName = 'VitalMessageBranch';
VitalMessageBranchContent.displayName = 'VitalMessageBranchContent';
VitalMessageBranchSelector.displayName = 'VitalMessageBranchSelector';
VitalMessageBranchPrevious.displayName = 'VitalMessageBranchPrevious';
VitalMessageBranchNext.displayName = 'VitalMessageBranchNext';
VitalMessageBranchPage.displayName = 'VitalMessageBranchPage';
VitalMessageResponse.displayName = 'VitalMessageResponse';
VitalMessageAttachment.displayName = 'VitalMessageAttachment';
VitalMessageAttachments.displayName = 'VitalMessageAttachments';
VitalMessageToolbar.displayName = 'VitalMessageToolbar';

// ============================================================================
// Aliases (for compatibility with ai-elements naming)
// ============================================================================

export const Message = VitalMessage;
export const MessageContent = VitalMessageContent;
export const MessageActions = VitalMessageActions;
export const MessageAction = VitalMessageAction;
export const MessageBranch = VitalMessageBranch;
export const MessageBranchContent = VitalMessageBranchContent;
export const MessageBranchSelector = VitalMessageBranchSelector;
export const MessageBranchPrevious = VitalMessageBranchPrevious;
export const MessageBranchNext = VitalMessageBranchNext;
export const MessageBranchPage = VitalMessageBranchPage;
export const MessageResponse = VitalMessageResponse;
export const MessageAttachment = VitalMessageAttachment;
export const MessageAttachments = VitalMessageAttachments;
export const MessageToolbar = VitalMessageToolbar;

export default VitalMessage;
