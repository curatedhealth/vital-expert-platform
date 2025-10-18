/**
 * VITAL RAG System - Tenant Context Manager
 * 
 * Provides tenant isolation and context management for multi-tenant RAG operations.
 * Ensures data segregation and proper access control across tenants.
 */

import { RAGError, TenantAccessError, ValidationError } from '../errors/rag-errors';
import { getLogger } from '../logging/logger';

// ============================================================================
// TENANT CONTEXT INTERFACES
// ============================================================================

export interface TenantContext {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  permissions?: TenantPermissions;
  metadata?: Record<string, any>;
}

export interface TenantPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canSearch: boolean;
  canUpload: boolean;
  canManageSources: boolean;
  domains?: string[];
  prismSuites?: string[];
}

export interface TenantInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  limits: {
    maxDocuments: number;
    maxStorage: number; // in bytes
    maxSearchesPerDay: number;
    maxEmbeddingsPerDay: number;
  };
  usage: {
    documents: number;
    storage: number; // in bytes
    searchesToday: number;
    embeddingsToday: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TENANT CONTEXT MANAGER
// ============================================================================

export class TenantContextManager {
  private static instance: TenantContextManager;
  private currentContext: TenantContext | null = null;
  private logger = getLogger();

  private constructor() {}

  static getInstance(): TenantContextManager {
    if (!TenantContextManager.instance) {
      TenantContextManager.instance = new TenantContextManager();
    }
    return TenantContextManager.instance;
  }

  /**
   * Set the current tenant context
   */
  setContext(context: TenantContext): void {
    this.validateTenantContext(context);
    this.currentContext = context;
    
    this.logger.tenant('Context set', context.tenantId, {
      userId: context.userId,
      sessionId: context.sessionId,
      hasPermissions: !!context.permissions
    });
  }

  /**
   * Get the current tenant context
   */
  getContext(): TenantContext | null {
    return this.currentContext;
  }

  /**
   * Get the current tenant ID
   */
  getCurrentTenantId(): string {
    if (!this.currentContext) {
      throw new ValidationError('No tenant context set', {
        operation: 'getCurrentTenantId'
      });
    }
    return this.currentContext.tenantId;
  }

  /**
   * Check if a tenant context is set
   */
  hasContext(): boolean {
    return this.currentContext !== null;
  }

  /**
   * Clear the current tenant context
   */
  clearContext(): void {
    const tenantId = this.currentContext?.tenantId;
    this.currentContext = null;
    
    if (tenantId) {
      this.logger.tenant('Context cleared', tenantId);
    }
  }

  /**
   * Validate tenant access for a specific operation
   */
  validateAccess(operation: keyof TenantPermissions, resource?: string): void {
    if (!this.currentContext) {
      throw new ValidationError('No tenant context set for access validation', {
        operation,
        resource
      });
    }

    const permissions = this.currentContext.permissions;
    if (!permissions) {
      // If no permissions are set, allow access (backward compatibility)
      return;
    }

    // Check specific permission
    if (!permissions[operation]) {
      throw new TenantAccessError(this.currentContext.tenantId, {
        operation,
        resource,
        userId: this.currentContext.userId
      });
    }

    // Check domain restrictions
    if (resource && permissions.domains && permissions.domains.length > 0) {
      const resourceDomain = this.extractDomainFromResource(resource);
      if (resourceDomain && !permissions.domains.includes(resourceDomain)) {
        throw new TenantAccessError(this.currentContext.tenantId, {
          operation,
          resource,
          domain: resourceDomain,
          allowedDomains: permissions.domains,
          userId: this.currentContext.userId
        });
      }
    }

    // Check prism suite restrictions
    if (resource && permissions.prismSuites && permissions.prismSuites.length > 0) {
      const resourcePrismSuite = this.extractPrismSuiteFromResource(resource);
      if (resourcePrismSuite && !permissions.prismSuites.includes(resourcePrismSuite)) {
        throw new TenantAccessError(this.currentContext.tenantId, {
          operation,
          resource,
          prismSuite: resourcePrismSuite,
          allowedPrismSuites: permissions.prismSuites,
          userId: this.currentContext.userId
        });
      }
    }
  }

  /**
   * Check if tenant has permission for an operation
   */
  hasPermission(operation: keyof TenantPermissions): boolean {
    if (!this.currentContext?.permissions) {
      return true; // Backward compatibility
    }
    return this.currentContext.permissions[operation] || false;
  }

  /**
   * Get tenant-specific database filters
   */
  getTenantFilters(): Record<string, any> {
    if (!this.currentContext) {
      throw new ValidationError('No tenant context set for database filters', {
        operation: 'getTenantFilters'
      });
    }

    const filters: Record<string, any> = {
      tenant_id: this.currentContext.tenantId
    };

    // Add domain filters if restricted
    if (this.currentContext.permissions?.domains?.length) {
      filters.domain = this.currentContext.permissions.domains;
    }

    // Add prism suite filters if restricted
    if (this.currentContext.permissions?.prismSuites?.length) {
      filters.prism_suite = this.currentContext.permissions.prismSuites;
    }

    return filters;
  }

  /**
   * Create a scoped context for a specific operation
   */
  createScopedContext(overrides: Partial<TenantContext>): TenantContext {
    if (!this.currentContext) {
      throw new ValidationError('No base tenant context for scoped context', {
        operation: 'createScopedContext'
      });
    }

    return {
      ...this.currentContext,
      ...overrides
    };
  }

  /**
   * Validate tenant context
   */
  private validateTenantContext(context: TenantContext): void {
    if (!context.tenantId || typeof context.tenantId !== 'string') {
      throw new ValidationError('Invalid tenant context: tenantId is required', {
        context
      });
    }

    if (context.permissions) {
      this.validatePermissions(context.permissions);
    }
  }

  /**
   * Validate tenant permissions
   */
  private validatePermissions(permissions: TenantPermissions): void {
    const booleanFields: (keyof TenantPermissions)[] = [
      'canRead', 'canWrite', 'canDelete', 'canSearch', 'canUpload', 'canManageSources'
    ];

    for (const field of booleanFields) {
      if (typeof permissions[field] !== 'boolean') {
        throw new ValidationError(`Invalid permission: ${field} must be boolean`, {
          permissions
        });
      }
    }

    if (permissions.domains && !Array.isArray(permissions.domains)) {
      throw new ValidationError('Invalid permission: domains must be an array', {
        permissions
      });
    }

    if (permissions.prismSuites && !Array.isArray(permissions.prismSuites)) {
      throw new ValidationError('Invalid permission: prismSuites must be an array', {
        permissions
      });
    }
  }

  /**
   * Extract domain from resource identifier
   */
  private extractDomainFromResource(resource: string): string | null {
    // This is a simplified implementation
    // In practice, you might need more sophisticated domain extraction
    const domainMatch = resource.match(/domain[=:]([^&,]+)/i);
    return domainMatch ? domainMatch[1] : null;
  }

  /**
   * Extract prism suite from resource identifier
   */
  private extractPrismSuiteFromResource(resource: string): string | null {
    // This is a simplified implementation
    // In practice, you might need more sophisticated prism suite extraction
    const prismMatch = resource.match(/prism[=:]([^&,]+)/i);
    return prismMatch ? prismMatch[1] : null;
  }
}

// ============================================================================
// TENANT SERVICE
// ============================================================================

export class TenantService {
  private static instance: TenantService;
  private logger = getLogger();

  private constructor() {}

  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  /**
   * Get tenant information
   */
  async getTenantInfo(tenantId: string): Promise<TenantInfo> {
    this.logger.tenant('Getting tenant info', tenantId);
    
    // This would typically query the database
    // For now, return a mock implementation
    return {
      id: tenantId,
      name: `Tenant ${tenantId.substring(0, 8)}`,
      status: 'active',
      plan: 'premium',
      limits: {
        maxDocuments: 10000,
        maxStorage: 1024 * 1024 * 1024, // 1GB
        maxSearchesPerDay: 1000,
        maxEmbeddingsPerDay: 5000
      },
      usage: {
        documents: 0,
        storage: 0,
        searchesToday: 0,
        embeddingsToday: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Check if tenant exists and is active
   */
  async isTenantActive(tenantId: string): Promise<boolean> {
    try {
      const tenantInfo = await this.getTenantInfo(tenantId);
      return tenantInfo.status === 'active';
    } catch (error) {
      this.logger.error('Failed to check tenant status', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Get tenant permissions
   */
  async getTenantPermissions(tenantId: string, userId?: string): Promise<TenantPermissions> {
    this.logger.tenant('Getting tenant permissions', tenantId, { userId });
    
    // This would typically query the database for user-specific permissions
    // For now, return default permissions
    return {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canSearch: true,
      canUpload: true,
      canManageSources: false,
      domains: undefined, // No restrictions
      prismSuites: undefined // No restrictions
    };
  }

  /**
   * Update tenant usage statistics
   */
  async updateUsage(tenantId: string, operation: 'search' | 'embedding' | 'document' | 'storage', amount: number): Promise<void> {
    this.logger.tenant('Updating usage', tenantId, { operation, amount });
    
    // This would typically update the database
    // For now, just log the usage
    this.logger.info('Usage updated', {
      tenantId,
      operation,
      amount,
      type: 'usage_update'
    });
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the global tenant context manager
 */
export function getTenantContextManager(): TenantContextManager {
  return TenantContextManager.getInstance();
}

/**
 * Get the global tenant service
 */
export function getTenantService(): TenantService {
  return TenantService.getInstance();
}

/**
 * Set tenant context with validation
 */
export function setTenantContext(context: TenantContext): void {
  getTenantContextManager().setContext(context);
}

/**
 * Get current tenant ID
 */
export function getCurrentTenantId(): string {
  return getTenantContextManager().getCurrentTenantId();
}

/**
 * Check if tenant context is set
 */
export function hasTenantContext(): boolean {
  return getTenantContextManager().hasContext();
}

/**
 * Clear tenant context
 */
export function clearTenantContext(): void {
  getTenantContextManager().clearContext();
}

/**
 * Validate tenant access for an operation
 */
export function validateTenantAccess(operation: keyof TenantPermissions, resource?: string): void {
  getTenantContextManager().validateAccess(operation, resource);
}

/**
 * Get tenant-specific database filters
 */
export function getTenantFilters(): Record<string, any> {
  return getTenantContextManager().getTenantFilters();
}

/**
 * Run a function with tenant context
 */
export async function withTenantContext<T>(
  context: TenantContext,
  fn: () => Promise<T>
): Promise<T> {
  const manager = getTenantContextManager();
  const previousContext = manager.getContext();
  
  try {
    manager.setContext(context);
    return await fn();
  } finally {
    if (previousContext) {
      manager.setContext(previousContext);
    } else {
      manager.clearContext();
    }
  }
}
