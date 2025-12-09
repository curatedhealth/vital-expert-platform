'use client';

/**
 * VitalArtifact - Generated Content Container Component Suite
 * 
 * A structured container for displaying generated content like code,
 * documents, or other outputs with built-in header actions.
 * 
 * Features:
 * - Structured container with header and content areas
 * - Built-in header with title and description support
 * - Flexible action buttons with tooltips
 * - Customizable styling for all subcomponents
 * - Support for close buttons and action groups
 * - Clean, modern design with border and shadow
 * - Responsive layout that adapts to content
 * - TypeScript support with proper type definitions
 * - Composable architecture for maximum flexibility
 * 
 * @example
 * ```tsx
 * <VitalArtifact>
 *   <VitalArtifactHeader>
 *     <div>
 *       <VitalArtifactTitle>Generated Code</VitalArtifactTitle>
 *       <VitalArtifactDescription>React component</VitalArtifactDescription>
 *     </div>
 *     <VitalArtifactActions>
 *       <VitalArtifactAction icon={Copy} tooltip="Copy" onClick={handleCopy} />
 *       <VitalArtifactAction icon={Download} tooltip="Download" onClick={handleDownload} />
 *       <VitalArtifactClose onClick={handleClose} />
 *     </VitalArtifactActions>
 *   </VitalArtifactHeader>
 *   <VitalArtifactContent>
 *     <pre><code>{code}</code></pre>
 *   </VitalArtifactContent>
 * </VitalArtifact>
 * ```
 */

import { cn } from '../lib/utils';
import { XIcon, type LucideIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes } from 'react';
import { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalArtifactProps = HTMLAttributes<HTMLDivElement>;

export type VitalArtifactHeaderProps = HTMLAttributes<HTMLDivElement>;

export type VitalArtifactTitleProps = HTMLAttributes<HTMLParagraphElement>;

export type VitalArtifactDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type VitalArtifactActionsProps = HTMLAttributes<HTMLDivElement>;

export type VitalArtifactActionProps = ComponentProps<'button'> & {
  /** Tooltip text to display on hover */
  tooltip?: string;
  /** Screen reader label for the action button */
  label?: string;
  /** Lucide icon component to display in the button */
  icon?: LucideIcon;
  /** Button variant */
  variant?: 'default' | 'ghost' | 'outline';
  /** Button size */
  size?: 'default' | 'sm' | 'icon';
};

export type VitalArtifactCloseProps = ComponentProps<'button'> & {
  /** Button variant */
  variant?: 'default' | 'ghost' | 'outline';
  /** Button size */
  size?: 'default' | 'sm' | 'icon';
};

export type VitalArtifactContentProps = HTMLAttributes<HTMLDivElement>;

// ============================================================================
// Tooltip Component (inline to avoid external dependencies)
// ============================================================================

const SimpleTooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
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
 * Root artifact container
 */
export const VitalArtifact = forwardRef<HTMLDivElement, VitalArtifactProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm',
        className
      )}
      {...props}
    />
  )
);

/**
 * Artifact header container
 */
export const VitalArtifactHeader = forwardRef<HTMLDivElement, VitalArtifactHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between border-b bg-muted/50 px-4 py-3',
        className
      )}
      {...props}
    />
  )
);

/**
 * Artifact title
 */
export const VitalArtifactTitle = forwardRef<HTMLParagraphElement, VitalArtifactTitleProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('font-medium text-foreground text-sm', className)}
      {...props}
    />
  )
);

/**
 * Artifact description
 */
export const VitalArtifactDescription = forwardRef<HTMLParagraphElement, VitalArtifactDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
);

/**
 * Artifact actions container
 */
export const VitalArtifactActions = forwardRef<HTMLDivElement, VitalArtifactActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
);

/**
 * Artifact action button with optional tooltip
 */
export const VitalArtifactAction = forwardRef<HTMLButtonElement, VitalArtifactActionProps>(
  (
    {
      tooltip,
      label,
      icon: Icon,
      children,
      className,
      variant = 'ghost',
      size = 'sm',
      ...props
    },
    ref
  ) => {
    const button = (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'size-8 p-0 text-muted-foreground',
          'transition-colors hover:text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
          variant === 'outline' && 'border border-input bg-background hover:bg-accent',
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          className
        )}
        {...props}
      >
        {Icon ? <Icon className="size-4" /> : children}
        <span className="sr-only">{label || tooltip}</span>
      </button>
    );

    if (tooltip) {
      return <SimpleTooltip content={tooltip}>{button}</SimpleTooltip>;
    }

    return button;
  }
);

/**
 * Artifact close button
 */
export const VitalArtifactClose = forwardRef<HTMLButtonElement, VitalArtifactCloseProps>(
  ({ className, children, variant = 'ghost', size = 'sm', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'size-8 p-0 text-muted-foreground',
        'transition-colors hover:text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent',
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="size-4" />}
      <span className="sr-only">Close</span>
    </button>
  )
);

/**
 * Artifact content container
 */
export const VitalArtifactContent = forwardRef<HTMLDivElement, VitalArtifactContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-auto p-4', className)}
      {...props}
    />
  )
);

// ============================================================================
// Display Names
// ============================================================================

VitalArtifact.displayName = 'VitalArtifact';
VitalArtifactHeader.displayName = 'VitalArtifactHeader';
VitalArtifactTitle.displayName = 'VitalArtifactTitle';
VitalArtifactDescription.displayName = 'VitalArtifactDescription';
VitalArtifactActions.displayName = 'VitalArtifactActions';
VitalArtifactAction.displayName = 'VitalArtifactAction';
VitalArtifactClose.displayName = 'VitalArtifactClose';
VitalArtifactContent.displayName = 'VitalArtifactContent';

// ============================================================================
// Aliases (for ai-elements compatibility)
// ============================================================================

export const Artifact = VitalArtifact;
export const ArtifactHeader = VitalArtifactHeader;
export const ArtifactTitle = VitalArtifactTitle;
export const ArtifactDescription = VitalArtifactDescription;
export const ArtifactActions = VitalArtifactActions;
export const ArtifactAction = VitalArtifactAction;
export const ArtifactClose = VitalArtifactClose;
export const ArtifactContent = VitalArtifactContent;

export default VitalArtifact;
