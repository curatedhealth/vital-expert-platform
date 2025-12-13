/**
 * Prompts Feature Components
 *
 * Shared components for the PRISM Prompt Library
 */

// Suite & Sub-Suite Filters
export {
  PromptSuiteFilter,
  PRISM_SUITES,
  getSuiteByCode,
  getSuiteIcon,
  type SuiteConfig,
  type PromptSuiteFilterProps,
} from './PromptSuiteFilter';

export {
  PromptSubSuiteFilter,
  type SubSuite,
  type PromptSubSuiteFilterProps,
} from './PromptSubSuiteFilter';

// CRUD Modals (Legacy - state-based)
export {
  PromptEditModal,
  PromptDeleteModal,
  DEFAULT_PROMPT,
  generatePromptSlug,
  COMPLEXITY_OPTIONS,
  DOMAIN_OPTIONS,
  TASK_TYPE_OPTIONS,
  PATTERN_TYPE_OPTIONS,
  STATUS_OPTIONS,
  type Prompt,
  type PromptEditModalProps,
  type PromptDeleteModalProps,
} from './PromptModals';

// CRUD Modals (V2 - React Hook Form + Zod)
export { PromptEditModalV2 } from './PromptEditModalV2';
