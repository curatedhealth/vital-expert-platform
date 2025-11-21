'use client';

/**
 * Tenant Context Provider (Compatibility Wrapper)
 * Re-exports from tenant-context-subdomain for subdomain-based multitenancy
 * All imports from '@/contexts/tenant-context' will use the subdomain version
 */

// Re-export everything from the subdomain context
export {
  TenantProviderSubdomain as TenantProvider,
  useTenant,
} from './tenant-context-subdomain';
