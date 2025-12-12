/**
 * Agent Edit Form Tabs
 *
 * This directory contains extracted tab components from agent-edit-form-enhanced.tsx
 * to improve maintainability and code organization.
 *
 * REFACTORING STATUS: COMPLETE (14 tabs extracted)
 * - types.ts: Shared types, interfaces, and presets
 * - All 14 tabs extracted into individual files
 *
 * Tab Groups:
 * 1. Basic Info: identity-tab, org-tab, level-tab
 * 2. Model Config: models-tab, personality-tab
 * 3. Prompts: prompts-tab, system-prompt-tab
 * 4. Relationships: hierarchy-tab
 * 5. Safety & Criteria: criteria-tab, safety-tab
 * 6. Capabilities: capabilities-tab, knowledge-tab, tools-tab
 * 7. Admin: admin-tab
 *
 * Each tab accepts EditFormTabProps (formState, updateField, updateMultipleFields, options)
 * plus any tab-specific props like dropdown data or callbacks.
 */

// Shared types
export * from './types';

// Tab components (extracted from agent-edit-form-enhanced.tsx)
export { IdentityTab } from './identity-tab';
export { ModelsTab } from './models-tab';
export type { LlmModelDisplay, LlmModelWithFit, ModelSortBy, ModelsTabProps } from './models-tab';
export { OrgTab } from './org-tab';
export type { OrgTabProps } from './org-tab';
export { LevelTab } from './level-tab';
export type { LevelTabProps } from './level-tab';
export { PersonalityTab } from './personality-tab';
export type { PersonalityTabProps } from './personality-tab';

// Hierarchy & Safety tabs
export { HierarchyTab } from './hierarchy-tab';
export type { HierarchyTabProps } from './hierarchy-tab';
export { SafetyTab } from './safety-tab';

// Prompts tabs
export { PromptsTab } from './prompts-tab';
export type { PromptsTabProps, PromptStarter } from './prompts-tab';
export { SystemPromptTab } from './system-prompt-tab';
export type { SystemPromptTabProps } from './system-prompt-tab';

// Criteria tab
export { CriteriaTab } from './criteria-tab';
export type { CriteriaTabProps } from './criteria-tab';

// Capabilities & Skills tab
export { CapabilitiesTab, CAPABILITY_CATEGORIES } from './capabilities-tab';
export type { CapabilitiesTabProps, CapabilityCategory } from './capabilities-tab';

// Knowledge & RAG tab
export { KnowledgeTab, KNOWLEDGE_DOMAIN_CATEGORIES } from './knowledge-tab';
export type { KnowledgeTabProps, KnowledgeDomainCategory } from './knowledge-tab';

// Tools tab
export { ToolsTab, TOOL_CATEGORIES } from './tools-tab';
export type { ToolsTabProps, ToolCategory } from './tools-tab';

// Admin tab
export { AdminTab } from './admin-tab';
export type { AdminTabProps, TenantOption } from './admin-tab';
