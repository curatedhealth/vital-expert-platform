/**
 * VitalAgentCard - Agent Card Component System
 * 
 * Unified agent card system with three variants:
 * - Minimal: Compact inline display (64-80px)
 * - Compact: Standard grid view (180-220px)
 * - Rich: Full detail display (320px+)
 * 
 * Features:
 * - Click-to-expand: minimal → compact → rich
 * - Responsive variant adaptation
 * - Consistent API across all variants
 * - Skeleton loading states
 * 
 * @packageDocumentation
 */

// Main component
export { 
  VitalAgentCard, 
  default 
} from './VitalAgentCard';

// Individual variants
export { 
  VitalAgentCardMinimal,
  VitalAgentCardMinimalSkeleton,
} from './VitalAgentCardMinimal';

export { 
  VitalAgentCardCompact,
  VitalAgentCardCompactSkeleton,
} from './VitalAgentCardCompact';

export { 
  VitalAgentCardRich,
  VitalAgentCardRichSkeleton,
} from './VitalAgentCardRich';

// Skeleton components
export {
  VitalAgentCardSkeleton,
  VitalAgentCardGridSkeleton,
  VitalAgentCardListSkeleton,
} from './VitalAgentCardSkeleton';
