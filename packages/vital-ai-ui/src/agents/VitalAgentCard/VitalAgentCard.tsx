/**
 * VitalAgentCard - Unified Agent Card Component
 * 
 * Main entry point for the Agent Card system.
 * Supports three variants (minimal, compact, rich) with
 * click-to-expand behavior and responsive adaptation.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { VitalAgentCardMinimal } from './VitalAgentCardMinimal';
import { VitalAgentCardCompact } from './VitalAgentCardCompact';
import { VitalAgentCardRich } from './VitalAgentCardRich';
import { DEFAULT_RESPONSIVE_VARIANTS } from '../constants';
import type { 
  VitalAgentCardProps, 
  AgentCardVariant,
  ResponsiveVariants 
} from '../types';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to determine current breakpoint
 */
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint('sm');
      } else if (width < 768) {
        setBreakpoint('md');
      } else if (width < 1024) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

/**
 * Hook to manage card expansion state
 */
function useCardExpansion(
  defaultVariant: AgentCardVariant,
  expandable: boolean,
  expandTo: 'compact' | 'rich' | undefined,
  onExpand?: (variant: AgentCardVariant) => void,
  onCollapse?: () => void
) {
  const [currentVariant, setCurrentVariant] = React.useState<AgentCardVariant>(defaultVariant);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const expansionOrder: AgentCardVariant[] = ['minimal', 'compact', 'rich'];
  
  const expand = React.useCallback(() => {
    if (!expandable) return;
    
    const currentIndex = expansionOrder.indexOf(currentVariant);
    const maxIndex = expandTo ? expansionOrder.indexOf(expandTo) : expansionOrder.length - 1;
    
    if (currentIndex < maxIndex) {
      const nextVariant = expansionOrder[currentIndex + 1];
      setCurrentVariant(nextVariant);
      setIsExpanded(true);
      onExpand?.(nextVariant);
    }
  }, [expandable, currentVariant, expandTo, onExpand]);
  
  const collapse = React.useCallback(() => {
    setCurrentVariant(defaultVariant);
    setIsExpanded(false);
    onCollapse?.();
  }, [defaultVariant, onCollapse]);
  
  const toggle = React.useCallback(() => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [isExpanded, expand, collapse]);
  
  // Reset to default when defaultVariant changes
  React.useEffect(() => {
    if (!isExpanded) {
      setCurrentVariant(defaultVariant);
    }
  }, [defaultVariant, isExpanded]);
  
  return {
    currentVariant,
    isExpanded,
    expand,
    collapse,
    toggle,
    setCurrentVariant,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAgentCard is the unified entry point for displaying agent cards.
 * 
 * Features:
 * - Three variants: minimal, compact, rich
 * - Click-to-expand: minimal → compact → rich
 * - Responsive variant adaptation
 * - Consistent API across all variants
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * // Basic usage with default compact variant
 * <VitalAgentCard
 *   agent={agent}
 *   onSelect={handleSelect}
 * />
 * 
 * // Minimal variant for sidebar
 * <VitalAgentCard
 *   agent={agent}
 *   variant="minimal"
 *   onAddToChat={handleAddToChat}
 * />
 * 
 * // Expandable card
 * <VitalAgentCard
 *   agent={agent}
 *   variant="compact"
 *   expandable
 *   expandTo="rich"
 *   onExpand={(v) => console.log('Expanded to:', v)}
 * />
 * 
 * // Responsive variants
 * <VitalAgentCard
 *   agent={agent}
 *   responsiveVariants={{
 *     sm: 'minimal',
 *     md: 'compact',
 *     lg: 'compact',
 *     xl: 'rich'
 *   }}
 * />
 * ```
 */
export const VitalAgentCard = React.forwardRef<HTMLDivElement, VitalAgentCardProps>(
  (
    {
      agent,
      variant: explicitVariant,
      responsiveVariants,
      expandable = false,
      expandTo,
      expandOnHover = false,
      expandDirection = 'inline',
      onExpand,
      onCollapse,
      isSelected,
      isBookmarked,
      isInComparison,
      featured,
      showActions,
      showMetrics,
      showCapabilities,
      className,
      style,
      animationDelay,
      onSelect,
      onAddToChat,
      onBookmark,
      onDuplicate,
      onEdit,
      onDelete,
      onCompare,
      onViewDetails,
      canEdit,
      canDelete,
      canDuplicate,
    },
    ref
  ) => {
    // Determine base variant
    const breakpoint = useBreakpoint();
    const variants = responsiveVariants || DEFAULT_RESPONSIVE_VARIANTS;
    
    const baseVariant: AgentCardVariant = explicitVariant || variants[breakpoint] || 'compact';
    
    // Expansion state
    const {
      currentVariant,
      isExpanded,
      expand,
      collapse,
      toggle,
    } = useCardExpansion(
      baseVariant,
      expandable,
      expandTo,
      onExpand,
      onCollapse
    );
    
    // Handle expand on hover
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout>();
    
    const handleMouseEnter = React.useCallback(() => {
      if (expandOnHover && expandable && !isExpanded) {
        hoverTimeoutRef.current = setTimeout(() => {
          expand();
        }, 300); // Delay to prevent accidental expansion
      }
    }, [expandOnHover, expandable, isExpanded, expand]);
    
    const handleMouseLeave = React.useCallback(() => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (expandOnHover && isExpanded) {
        collapse();
      }
    }, [expandOnHover, isExpanded, collapse]);
    
    // Handle click with expansion
    const handleSelect = React.useCallback((selectedAgent: typeof agent) => {
      if (expandable && !expandOnHover) {
        toggle();
      }
      onSelect?.(selectedAgent);
    }, [expandable, expandOnHover, toggle, onSelect]);
    
    // Handle keyboard for expansion
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
      if (expandable) {
        if (e.key === 'Escape' && isExpanded) {
          e.preventDefault();
          collapse();
        }
        if ((e.key === 'Enter' || e.key === ' ') && !isExpanded) {
          // Let the card handle its own selection
        }
      }
    }, [expandable, isExpanded, collapse]);
    
    // Click outside to collapse
    const cardRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (!expandable || !isExpanded || expandOnHover) return;
      
      const handleClickOutside = (event: MouseEvent) => {
        if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
          collapse();
        }
      };
      
      // Delay adding listener to prevent immediate collapse
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [expandable, isExpanded, expandOnHover, collapse]);
    
    // Common props
    const commonProps = {
      agent,
      isSelected,
      isBookmarked,
      isInComparison,
      featured,
      showActions,
      showCapabilities,
      className,
      style,
      animationDelay,
      onSelect: handleSelect,
      onAddToChat,
      onBookmark,
      onDuplicate,
      onEdit,
      onDelete,
      onCompare,
      onViewDetails,
      canEdit,
      canDelete,
      canDuplicate,
    };
    
    // Wrapper for expansion behavior
    const wrapperClasses = cn(
      'transition-all duration-300 ease-out',
      expandable && 'relative',
      isExpanded && expandDirection === 'inline' && 'z-10'
    );
    
    return (
      <div
        ref={(node) => {
          // Handle both refs
          cardRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={wrapperClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {/* Render appropriate variant */}
        {currentVariant === 'minimal' && (
          <VitalAgentCardMinimal
            {...commonProps}
          />
        )}
        
        {currentVariant === 'compact' && (
          <VitalAgentCardCompact
            {...commonProps}
          />
        )}
        
        {currentVariant === 'rich' && (
          <VitalAgentCardRich
            {...commonProps}
            showMetrics={showMetrics}
          />
        )}
        
        {/* Expansion indicator */}
        {expandable && !isExpanded && currentVariant !== 'rich' && (
          <div 
            className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          >
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        )}
      </div>
    );
  }
);

VitalAgentCard.displayName = 'VitalAgentCard';

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentCard;

// Re-export variants for direct access
export { VitalAgentCardMinimal } from './VitalAgentCardMinimal';
export { VitalAgentCardCompact } from './VitalAgentCardCompact';
export { VitalAgentCardRich } from './VitalAgentCardRich';
