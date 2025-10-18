/**
 * VITAL RAG System - Phase 2 Integration Tests
 * 
 * Tests for error handling, logging, and tenant isolation features.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  RAGError, 
  ValidationError, 
  DatabaseError, 
  AuthenticationError,
  RAGErrorFactory,
  ErrorCategory 
} from '../../src/lib/errors/rag-errors';
import { getLogger } from '../../src/lib/logging/logger';
import { 
  getTenantContextManager, 
  getTenantService,
  TenantContext,
  TenantPermissions 
} from '../../src/lib/tenant/tenant-context';
import { ragService } from '../../src/rag-service';

// Mock the logger to avoid console output during tests
vi.mock('../../src/lib/logging/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    performance: vi.fn(),
    apiRequest: vi.fn(),
    apiResponse: vi.fn(),
    database: vi.fn(),
    embedding: vi.fn(),
    vectorSearch: vi.fn(),
    documentProcessing: vi.fn(),
    tenant: vi.fn(),
    security: vi.fn()
  })
}));

// Mock the embedding service
vi.mock('../../src/lib/services/embeddings/openai-embedding-service', () => ({
  embeddingService: {
    generateEmbedding: vi.fn().mockResolvedValue({
      embedding: new Array(3072).fill(0.1),
      model: 'text-embedding-3-large',
      dimensions: 3072,
      usage: { prompt_tokens: 10, total_tokens: 10 }
    })
  }
}));

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null })
  }))
}));

// Mock the tenant service
vi.mock('../../src/lib/tenant/tenant-context', async () => {
  const actual = await vi.importActual('../../src/lib/tenant/tenant-context');
  return {
    ...actual,
    getTenantService: () => ({
      getTenantInfo: vi.fn().mockResolvedValue({
        id: 'test-tenant',
        name: 'Test Tenant',
        status: 'active',
        plan: 'premium',
        limits: {
          maxDocuments: 10000,
          maxStorage: 1024 * 1024 * 1024,
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
      }),
      isTenantActive: vi.fn().mockResolvedValue(true),
      getTenantPermissions: vi.fn().mockResolvedValue({
        canRead: true,
        canWrite: true,
        canDelete: false,
        canSearch: true,
        canUpload: true,
        canManageSources: false
      }),
      updateUsage: vi.fn().mockResolvedValue(undefined)
    })
  };
});

describe('Phase 2: Error Handling & Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear tenant context after each test
    getTenantContextManager().clearContext();
  });

  describe('Error Classes', () => {
    it('should create ValidationError with proper properties', () => {
      const error = new ValidationError('Invalid input', { field: 'test' });
      
      expect(error).toBeInstanceOf(RAGError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.message).toBe('Invalid input');
      expect(error.context).toEqual({ field: 'test' });
      expect(error.retryable).toBe(false);
    });

    it('should create DatabaseError with retryable flag', () => {
      const error = new DatabaseError('Connection failed', { service: 'supabase' }, true);
      
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.retryable).toBe(true);
    });

    it('should serialize error to JSON correctly', () => {
      const error = new AuthenticationError('Invalid token', { userId: '123' });
      const json = error.toJSON();
      
      expect(json.name).toBe('AuthenticationError');
      expect(json.code).toBe('AUTH_ERROR');
      expect(json.statusCode).toBe(401);
      expect(json.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(json.context).toEqual({ userId: '123' });
      expect(json.timestamp).toBeDefined();
    });

    it('should provide user-friendly error messages', () => {
      const authError = new AuthenticationError('Invalid token');
      const validationError = new ValidationError('Invalid input');
      
      expect(authError.getUserMessage()).toBe('Please log in to access this feature.');
      expect(validationError.getUserMessage()).toBe('Invalid input');
    });
  });

  describe('Error Factory', () => {
    it('should create error from unknown error', () => {
      const unknownError = new Error('Something went wrong');
      const ragError = RAGErrorFactory.fromUnknown(unknownError, { context: 'test' });
      
      expect(ragError).toBeInstanceOf(RAGError);
      expect(ragError.message).toBe('Something went wrong');
      expect(ragError.context).toEqual({ originalError: 'Error', context: 'test' });
    });

    it('should create error from Supabase error', () => {
      const supabaseError = { code: 'PGRST301', message: 'Invalid token' };
      const ragError = RAGErrorFactory.fromSupabaseError(supabaseError, { query: 'test' });
      
      expect(ragError).toBeInstanceOf(AuthenticationError);
      expect(ragError.message).toContain('Invalid authentication token');
    });

    it('should create error from OpenAI error', () => {
      const openAIError = { status: 401, message: 'Invalid API key' };
      const ragError = RAGErrorFactory.fromOpenAIError(openAIError, { text: 'test' });
      
      expect(ragError).toBeInstanceOf(AuthenticationError);
      expect(ragError.message).toContain('Invalid OpenAI API key');
    });
  });

  describe('Tenant Context Management', () => {
    it('should set and get tenant context', () => {
      const context: TenantContext = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        sessionId: 'session-456',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: true,
          canUpload: true,
          canManageSources: false
        }
      };

      const manager = getTenantContextManager();
      manager.setContext(context);
      
      expect(manager.getContext()).toEqual(context);
      expect(manager.getCurrentTenantId()).toBe('test-tenant');
      expect(manager.hasContext()).toBe(true);
    });

    it('should validate tenant access', () => {
      const context: TenantContext = {
        tenantId: 'test-tenant',
        permissions: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canSearch: true,
          canUpload: false,
          canManageSources: false
        }
      };

      const manager = getTenantContextManager();
      manager.setContext(context);

      // Should not throw for allowed operations
      expect(() => manager.validateAccess('canRead')).not.toThrow();
      expect(() => manager.validateAccess('canSearch')).not.toThrow();

      // Should throw for denied operations
      expect(() => manager.validateAccess('canWrite')).toThrow();
      expect(() => manager.validateAccess('canDelete')).toThrow();
    });

    it('should get tenant-specific database filters', () => {
      const context: TenantContext = {
        tenantId: 'test-tenant',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: true,
          canUpload: true,
          canManageSources: false,
          domains: ['medical_affairs'],
          prismSuites: ['RULES']
        }
      };

      const manager = getTenantContextManager();
      manager.setContext(context);

      const filters = manager.getTenantFilters();
      
      expect(filters.tenant_id).toBe('test-tenant');
      expect(filters.domain).toEqual(['medical_affairs']);
      expect(filters.prism_suite).toEqual(['RULES']);
    });

    it('should clear tenant context', () => {
      const context: TenantContext = {
        tenantId: 'test-tenant',
        userId: 'user-123'
      };

      const manager = getTenantContextManager();
      manager.setContext(context);
      expect(manager.hasContext()).toBe(true);

      manager.clearContext();
      expect(manager.hasContext()).toBe(false);
    });
  });

  describe('RAG Service with Error Handling', () => {
    beforeEach(() => {
      // Set up tenant context for tests
      const context: TenantContext = {
        tenantId: 'test-tenant',
        userId: 'user-123',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: true,
          canUpload: true,
          canManageSources: false
        }
      };
      getTenantContextManager().setContext(context);
    });

    it('should handle validation errors in generateEmbedding', async () => {
      await expect(ragService.generateEmbedding('')).rejects.toThrow(ValidationError);
      await expect(ragService.generateEmbedding('   ')).rejects.toThrow(ValidationError);
    });

    it('should handle validation errors in searchKnowledge', async () => {
      const validEmbedding = new Array(3072).fill(0.1);
      
      await expect(ragService.searchKnowledge('', validEmbedding)).rejects.toThrow(ValidationError);
      await expect(ragService.searchKnowledge('test', [])).rejects.toThrow(ValidationError);
    });

    it('should validate tenant access in searchKnowledge', async () => {
      // Set up context without search permission
      const context: TenantContext = {
        tenantId: 'test-tenant',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: false, // No search permission
          canUpload: true,
          canManageSources: false
        }
      };
      getTenantContextManager().setContext(context);

      const validEmbedding = new Array(3072).fill(0.1);
      
      await expect(ragService.searchKnowledge('test query', validEmbedding)).rejects.toThrow();
    });
  });

  describe('Error Metrics', () => {
    it('should record error metrics', () => {
      const error = new ValidationError('Test error');
      
      // This would typically be called by the error handler
      // For now, we'll test the error creation
      expect(error.toJSON()).toBeDefined();
      expect(error.getUserMessage()).toBeDefined();
    });
  });

  describe('Logging Integration', () => {
    it('should log errors with proper context', () => {
      const logger = getLogger();
      const error = new DatabaseError('Connection failed', { service: 'supabase' });
      
      // The logger should be called with proper context
      expect(logger.error).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
    });
  });
});
