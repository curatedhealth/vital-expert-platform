'use client';

/**
 * VitalLoader - Animated Spinner Component
 * 
 * An SVG-based loading spinner with 8-spoke animation.
 * Direct port from ai-elements/loader.tsx for full compatibility.
 * 
 * Features:
 * - Custom 8-spoke SVG design
 * - Opacity-based animation effect
 * - Configurable size
 * - CSS spin animation
 * 
 * @example
 * ```tsx
 * <VitalLoader />
 * <VitalLoader size={24} />
 * <VitalLoader size={32} className="text-primary" />
 * ```
 */

import { cn } from '../lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalLoaderIconProps = {
  /** Icon size in pixels */
  size?: number;
};

export type VitalLoaderProps = HTMLAttributes<HTMLDivElement> & {
  /** Loader size in pixels */
  size?: number;
};

// ============================================================================
// Loader Icon (SVG)
// ============================================================================

/**
 * 8-spoke loader SVG icon with opacity gradient
 */
const LoaderIcon = ({ size = 16 }: VitalLoaderIconProps) => (
  <svg
    height={size}
    strokeLinejoin="round"
    style={{ color: 'currentcolor' }}
    viewBox="0 0 16 16"
    width={size}
  >
    <title>Loader</title>
    <g clipPath="url(#clip0_2393_1490)">
      <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 16V12"
        opacity="0.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.29773 1.52783L5.64887 4.7639"
        opacity="0.9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.7023 1.52783L10.3511 4.7639"
        opacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.7023 14.472L10.3511 11.236"
        opacity="0.4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.29773 14.472L5.64887 11.236"
        opacity="0.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15.6085 5.52783L11.8043 6.7639"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M0.391602 10.472L4.19583 9.23598"
        opacity="0.7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15.6085 10.4722L11.8043 9.2361"
        opacity="0.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M0.391602 5.52783L4.19583 6.7639"
        opacity="0.8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </g>
    <defs>
      <clipPath id="clip0_2393_1490">
        <rect fill="white" height="16" width="16" />
      </clipPath>
    </defs>
  </svg>
);

// ============================================================================
// Main Component
// ============================================================================

/**
 * Animated loader spinner
 */
export const VitalLoader = forwardRef<HTMLDivElement, VitalLoaderProps>(
  ({ className, size = 16, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex animate-spin items-center justify-center',
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <LoaderIcon size={size} />
      <span className="sr-only">Loading...</span>
    </div>
  )
);

VitalLoader.displayName = 'VitalLoader';

// ============================================================================
// Variant: Loader with Text
// ============================================================================

export type VitalLoaderWithTextProps = VitalLoaderProps & {
  /** Loading text to display */
  text?: string;
  /** Text position relative to spinner */
  textPosition?: 'right' | 'bottom';
};

export const VitalLoaderWithText = forwardRef<HTMLDivElement, VitalLoaderWithTextProps>(
  ({ className, size = 16, text = 'Loading...', textPosition = 'right', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2',
        textPosition === 'bottom' && 'flex-col',
        className
      )}
      role="status"
      {...props}
    >
      <VitalLoader size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
);

VitalLoaderWithText.displayName = 'VitalLoaderWithText';

// ============================================================================
// Variant: Loader Overlay
// ============================================================================

export type VitalLoaderOverlayProps = HTMLAttributes<HTMLDivElement> & {
  /** Whether overlay is visible */
  visible?: boolean;
  /** Loader size */
  size?: number;
  /** Loading message */
  message?: string;
};

export const VitalLoaderOverlay = forwardRef<HTMLDivElement, VitalLoaderOverlayProps>(
  ({ className, visible = true, size = 24, message, children, ...props }, ref) => {
    if (!visible) return <>{children}</>;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <VitalLoader size={size} />
          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    );
  }
);

VitalLoaderOverlay.displayName = 'VitalLoaderOverlay';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

export const Loader = VitalLoader;
export const LoaderWithText = VitalLoaderWithText;
export const LoaderOverlay = VitalLoaderOverlay;

export default VitalLoader;
