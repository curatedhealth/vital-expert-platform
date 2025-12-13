/**
 * Prompts Feature Hooks
 *
 * Reusable hooks for Prompts pages
 *
 * @since December 2025
 */

// Data hooks
export {
  usePromptsData,
  promptToAsset,
  filterPromptsByParams,
  applySearchFilter,
  COMPLEXITY_BADGES,
  type PromptStats,
} from './usePromptsData';

// CRUD hooks
export {
  usePromptsCRUD,
  DEFAULT_PROMPT_VALUES,
} from './usePromptsCRUD';
