/**
 * Knowledge Services Index
 *
 * Exports all knowledge-related services:
 * - Search caching utilities
 * - Cache statistics
 * - Performance utilities
 */

export {
  // Cache instances
  searchCache,
  externalApiCache,

  // TTL presets by source
  TTL_PRESETS,

  // Utility functions
  debounce,
  deduplicatedFetch,
  measurePerformance,

  // Default export (SearchCache class)
  default as SearchCache,
} from './search-cache';

// Type exports
export type { } from './search-cache';
