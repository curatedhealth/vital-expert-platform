/**
 * @vital/ai-ui - VITAL AI UI Component Library
 * 
 * A comprehensive 72-component library for AI-powered healthcare applications.
 * Designed for the VITAL platform with Generative UI patterns and streaming support.
 * 
 * Built with:
 * - Vercel AI SDK (https://ai-sdk.dev/) for streaming and generative UI
 * - Streamdown (https://streamdown.ai/) for jitter-free markdown streaming
 * - shadcn/ui patterns for base components
 * - Tailwind CSS for styling
 * 
 * SHARED ACROSS ALL VITAL SERVICES:
 * - Ask Expert
 * - Ask Panel
 * - Workflow Automation
 * - Admin Dashboard
 * - Knowledge Graph
 * - Value Framework
 * 
 * Domains (13 total, 72 components):
 * - A: Core Conversation (7) - Chat, messages, input, voice
 * - B: Reasoning & Evidence (11) - Thinking, citations, sources, red pen
 * - C: Workflow & Safety (11) - Checkpoints, plan, progress, pre-flight
 * - D: Data & Visualization (2) - Tables, metrics
 * - E: Documents & Artifacts (7) - Preview, artifacts, documentation
 * - F: Agent & Collaboration (4) - Agent cards, teams, expert display
 * - G: Navigation & Layout (7) - Sidebar, panels, layouts
 * - H: Fusion Intelligence (5) - RRF, decisions, retrievers
 * - I: HITL Controls (6) - Human-in-the-loop approval
 * - J: Advanced Chat (4) - Enhanced chat input/display
 * - K: Canvas & Visualization (3) - Graph, flow, hierarchy
 * - L: Advanced Interaction (4) - Thread, diff, annotation, data lens
 * - M: Mission & Team (4) - Templates, recommendations, assembly
 * 
 * Usage:
 *   import { 
 *     VitalMessage, 
 *     VitalThinking, 
 *     VitalFusionExplanation,
 *     VitalHITLControls,
 *     VitalGraphCanvas,
 *     VitalMissionTemplateSelector,
 *     useAskExpert 
 *   } from '@vital/ai-ui';
 * 
 * Or import specific domains:
 *   import { VitalMessage } from '@vital/ai-ui/conversation';
 *   import { VitalGraphCanvas } from '@vital/ai-ui/canvas';
 *   import { VitalMissionTemplateSelector } from '@vital/ai-ui/mission';
 */

// ============================================================================
// Domain A: Core Conversation (7)
// ============================================================================
export * from './conversation';

// ============================================================================
// Domain B: Reasoning & Evidence (11)
// ============================================================================
export * from './reasoning';

// ============================================================================
// Domain C: Workflow & Safety (11)
// ============================================================================
export * from './workflow';

// ============================================================================
// Domain D: Data & Visualization (2)
// ============================================================================
export * from './data';

// ============================================================================
// Domain E: Documents & Artifacts (7)
// ============================================================================
export * from './documents';

// ============================================================================
// Domain F: Agent & Collaboration (4)
// ============================================================================
export * from './agents';

// ============================================================================
// Domain G: Navigation & Layout (7)
// ============================================================================
export * from './layout';

// ============================================================================
// Domain H: Fusion Intelligence (5)
// ============================================================================
export * from './fusion';

// ============================================================================
// Domain I: HITL Controls (6)
// ============================================================================
export * from './hitl';

// ============================================================================
// Domain J: Advanced Chat (4)
// ============================================================================
export * from './chat';

// ============================================================================
// Domain K: Canvas & Visualization (3)
// ============================================================================
export * from './canvas';

// ============================================================================
// Domain L: Advanced Interaction (4)
// ============================================================================
export * from './advanced';

// ============================================================================
// Domain M: Mission & Team (4)
// ============================================================================
export * from './mission';

// ============================================================================
// Domain N: v0 AI Generation (5)
// ============================================================================
export * from './v0';

// ============================================================================
// Domain O: Skills Registry (5)
// ============================================================================
export * from './skills';

// ============================================================================
// Domain P: Tools Registry (5)
// ============================================================================
export * from './tools';

// ============================================================================
// Domain Q: Navigation & Dashboard (3)
// Main navbar, app sidebar, unified dashboard layout
// ============================================================================
export * from './navigation';

// ============================================================================
// Domain R: Assets (Unified Tools, Skills, Workflows, Prompts)
// VitalAssetCard, VitalAssetGrid, VitalAssetList, VitalAssetTable, VitalAssetKanban, VitalAssetView
// ============================================================================
export * from './assets';

// ============================================================================
// Hooks (Vercel AI SDK integration)
// ============================================================================
export * from './hooks';

// ============================================================================
// Shared Types (Phase 2 ↔ Phase 3 Alignment)
// Central types for cross-component consistency
// ============================================================================
export * from './types';
