/**
 * Ask Expert Feature Module
 * 
 * The Ask Expert service implements a 4-Mode Execution Matrix for AI-powered
 * healthcare consultations with a 5-Level Agent Hierarchy.
 * 
 * Architecture:
 * - SHARED: @vital/ai-ui components (39 components)
 * - SERVICE-SPECIFIC: This module (Ask Expert specific UI)
 * 
 * 4-Mode Execution Matrix:
 * - Mode 1: Direct Expert (single L2 agent)
 * - Mode 2: Autonomous Panel (multi-agent, no HITL)
 * - Mode 3: Guided Collaboration (HITL checkpoints)
 * - Mode 4: Full Autonomous (complex multi-step)
 * 
 * Usage:
 *   // Shared components
 *   import { VitalMessage, VitalThinking, VitalFusionExplanation } from '@vital/ai-ui';
 *   
 *   // Ask Expert specific
 *   import { ModeSelector, HITLControls, useAskExpertMode } from '@/features/ask-expert';
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Types
export * from './types';
