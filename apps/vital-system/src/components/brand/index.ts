/**
 * VITAL Brand Components
 *
 * Design System: "Human Genius, Amplified"
 * Based on Brand Guidelines v6.0
 */

// Atomic Icons (Geometry System)
export {
  AtomicIcon,
  InsightIcon,
  StructureIcon,
  GrowthIcon,
  ConnectionIcon,
  DecisionIcon,
  TierIcon,
  type AtomicShape,
  type AtomicSize,
  type AtomicVariant,
} from './atomic-icons';

// Tier Badge (Agent Hierarchy)
export {
  TierBadge,
  FoundationalBadge,
  SpecialistBadge,
  UltraSpecialistBadge,
  getTierFromLevel,
  getTierConfig,
  type TierLevel,
  type TierBadgeVariant,
} from './tier-badge';

// Mode Chip (Service Modes)
export {
  ModeChip,
  ModeSelector,
  getModeConfig,
  getAvailableModes,
  ASK_EXPERT_MODES,
  SERVICE_LAYER_MODES,
  type ServiceMode,
  type ModeChipVariant,
} from './mode-chip';
