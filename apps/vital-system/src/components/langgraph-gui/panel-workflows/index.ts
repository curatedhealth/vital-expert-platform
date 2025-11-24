export * from './types';
export * from './node-builders';
export * from './edge-builders';
export * from './workflow-factory';
export * from './panel-definitions';

import { createPanelWorkflow } from './workflow-factory';
import { PANEL_CONFIGS } from './panel-definitions';
import { PanelWorkflowResult } from './types';

/**
 * Creates a default panel workflow by type
 * 
 * @param panelType - The panel type ID (e.g., 'structured_panel', 'socratic_panel')
 * @returns Complete workflow with nodes, edges, and phase metadata
 */
export function createDefaultPanelWorkflow(panelType: string): PanelWorkflowResult {
  const config = PANEL_CONFIGS[panelType];
  
  if (!config) {
    throw new Error(`Unknown panel type: ${panelType}. Available types: ${Object.keys(PANEL_CONFIGS).join(', ')}`);
  }
  
  return createPanelWorkflow(config);
}

/**
 * Gets all available panel types
 */
export function getAvailablePanelTypes(): string[] {
  return Object.keys(PANEL_CONFIGS);
}

/**
 * Gets panel configuration by type
 */
export function getPanelConfig(panelType: string) {
  return PANEL_CONFIGS[panelType];
}

