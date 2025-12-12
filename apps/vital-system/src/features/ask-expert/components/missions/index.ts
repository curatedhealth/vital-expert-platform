/**
 * VITAL Platform - Mission Components Index
 *
 * Exports all components for Mission Template System.
 * These components handle template browsing, previewing,
 * customization, and mission launching.
 *
 * Phase 2 Implementation - December 11, 2025
 */

// Template Selection
export { TemplateCard } from './TemplateCard';
export type { TemplateCardData, TemplateCardProps } from './TemplateCard';

export { TemplateGallery } from './TemplateGallery';
export type { TemplateGalleryProps } from './TemplateGallery';

// Template Details
export { TemplatePreview } from './TemplatePreview';
export type {
  TemplatePreviewData,
  TemplatePreviewProps,
  ExpectedInput,
  ExpectedOutput,
} from './TemplatePreview';

// Template Configuration
export { TemplateCustomizer } from './TemplateCustomizer';
export type {
  TemplateCustomizerData,
  TemplateCustomizerProps,
  MissionCustomizations,
} from './TemplateCustomizer';

// Re-export types from mission-runners for convenience
export type {
  MissionFamily,
  MissionComplexity,
  MissionTemplate,
  MissionCard,
  Runner,
  RunnerCapability,
  RunnerFlag,
} from '../../types/mission-runners';

export {
  FAMILY_COLORS,
  COMPLEXITY_BADGES,
  DEFAULT_MISSION_TEMPLATES,
  RUNNERS,
  CORE_COGNITIVE_RUNNERS,
  PHARMA_DOMAIN_RUNNERS,
} from '../../types/mission-runners';
