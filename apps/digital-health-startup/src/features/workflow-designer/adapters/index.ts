/**
 * Framework Registry & Initialization
 * 
 * Central registry for all framework adapters.
 * Auto-registers all adapters on import.
 */

import { FrameworkRegistry } from './FrameworkAdapter';
import { LangGraphAdapter } from './LangGraphAdapter';
import { AutoGenAdapter } from './AutoGenAdapter';
import { CrewAIAdapter } from './CrewAIAdapter';

// Auto-register all adapters
FrameworkRegistry.register(new LangGraphAdapter());
FrameworkRegistry.register(new AutoGenAdapter());
FrameworkRegistry.register(new CrewAIAdapter());

// Export everything
export * from './FrameworkAdapter';
export * from './LangGraphAdapter';
export * from './AutoGenAdapter';
export * from './CrewAIAdapter';

// Export convenience functions
export function getAdapter(framework: string) {
  return FrameworkRegistry.get(framework);
}

export function getAllAdapters() {
  return FrameworkRegistry.getAll();
}

export function getSupportedFrameworks() {
  return FrameworkRegistry.getNames();
}

/**
 * Get adapter for a specific framework or throw error
 */
export function requireAdapter(framework: string) {
  const adapter = FrameworkRegistry.get(framework);
  if (!adapter) {
    throw new Error(`Framework adapter not found: ${framework}. Available: ${FrameworkRegistry.getNames().join(', ')}`);
  }
  return adapter;
}

/**
 * Check if a framework is supported
 */
export function isFrameworkSupported(framework: string): boolean {
  return FrameworkRegistry.has(framework);
}

/**
 * Get framework capabilities comparison
 */
export function compareFrameworkCapabilities() {
  return FrameworkRegistry.getAll().map(adapter => ({
    name: adapter.name,
    displayName: adapter.displayName,
    version: adapter.version,
    capabilities: adapter.getCapabilities(),
    nodeTypes: adapter.getNodeTypes().length,
    edgeTypes: adapter.getEdgeTypes().length,
  }));
}

