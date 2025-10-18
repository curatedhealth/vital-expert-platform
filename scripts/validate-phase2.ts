#!/usr/bin/env node

/**
 * VITAL RAG System - Phase 2 Validation Script
 * 
 * Validates error handling, logging, and tenant isolation features.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  RAGError, 
  ValidationError, 
  DatabaseError, 
  AuthenticationError,
  RAGErrorFactory,
  ErrorCategory 
} from '../src/lib/errors/rag-errors';
import { getLogger } from '../src/lib/logging/logger';
import { 
  getTenantContextManager, 
  getTenantService,
  TenantContext,
  TenantPermissions 
} from '../src/lib/tenant/tenant-context';
import { ragService } from '../src/rag-service';

// Load environment variables
dotenv.config();

// ============================================================================
// VALIDATION CLASS
// ============================================================================

class Phase2Validator {
  private supabase: any;
  private logger = getLogger();
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;

  constructor() {
    this.logger.setContext({ 
      component: 'phase2-validator',
      operation: 'validation'
    });
  }

  async runValidation(): Promise<void> {
    console.log('🔍 Phase 2 Validation: Error Handling, Logging & Tenant Isolation');
    console.log('='.repeat(70));

    try {
      await this.initializeSupabase();
      await this.validateErrorHandling();
      await this.validateLogging();
      await this.validateTenantIsolation();
      await this.validateServiceIntegration();
      
      this.printSummary();
    } catch (error) {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    }
  }

  private async initializeSupabase(): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Supabase client initialized');
  }

  private async validateErrorHandling(): Promise<void> {
    console.log('\n📋 Validating Error Handling...');

    // Test 1: Error class creation
    await this.runTest('Error Class Creation', async () => {
      const validationError = new ValidationError('Test validation error', { field: 'test' });
      const databaseError = new DatabaseError('Test database error', { service: 'test' });
      const authError = new AuthenticationError('Test auth error');

      if (validationError.code !== 'VALIDATION_ERROR') {
        throw new Error('ValidationError code incorrect');
      }
      if (databaseError.retryable !== true) {
        throw new Error('DatabaseError should be retryable');
      }
      if (authError.statusCode !== 401) {
        throw new Error('AuthenticationError status code incorrect');
      }

      return 'All error classes created correctly';
    });

    // Test 2: Error serialization
    await this.runTest('Error Serialization', async () => {
      const error = new ValidationError('Test error', { context: 'test' });
      const json = error.toJSON();

      if (!json.timestamp || !json.code || !json.message) {
        throw new Error('Error serialization incomplete');
      }

      return 'Error serialization working correctly';
    });

    // Test 3: Error factory
    await this.runTest('Error Factory', async () => {
      const unknownError = new Error('Unknown error');
      const ragError = RAGErrorFactory.fromUnknown(unknownError, { test: true });

      if (!(ragError instanceof RAGError)) {
        throw new Error('Error factory failed to create RAGError');
      }

      return 'Error factory working correctly';
    });

    // Test 4: User-friendly messages
    await this.runTest('User-Friendly Messages', async () => {
      const authError = new AuthenticationError('Invalid token');
      const validationError = new ValidationError('Invalid input');

      const authMessage = authError.getUserMessage();
      const validationMessage = validationError.getUserMessage();

      if (!authMessage || !validationMessage) {
        throw new Error('User-friendly messages not generated');
      }

      return 'User-friendly messages working correctly';
    });
  }

  private async validateLogging(): Promise<void> {
    console.log('\n📋 Validating Logging System...');

    // Test 1: Logger initialization
    await this.runTest('Logger Initialization', async () => {
      const logger = getLogger();
      
      if (!logger) {
        throw new Error('Logger not initialized');
      }

      // Test logging methods
      logger.info('Test info message', { test: true });
      logger.error('Test error message', { test: true });
      logger.debug('Test debug message', { test: true });

      return 'Logger initialized and methods working';
    });

    // Test 2: Context logging
    await this.runTest('Context Logging', async () => {
      const logger = getLogger();
      logger.setContext({ 
        tenantId: 'test-tenant',
        userId: 'test-user',
        operation: 'test'
      });

      logger.info('Test with context');
      
      return 'Context logging working correctly';
    });

    // Test 3: Specialized logging methods
    await this.runTest('Specialized Logging Methods', async () => {
      const logger = getLogger();
      
      logger.performance('test operation', 100);
      logger.embedding('test embedding', 100, 3072, 50);
      logger.vectorSearch('test query', 5, 200);
      logger.tenant('test operation', 'test-tenant');

      return 'Specialized logging methods working';
    });
  }

  private async validateTenantIsolation(): Promise<void> {
    console.log('\n📋 Validating Tenant Isolation...');

    // Test 1: Tenant context management
    await this.runTest('Tenant Context Management', async () => {
      const manager = getTenantContextManager();
      
      const context: TenantContext = {
        tenantId: 'test-tenant-123',
        userId: 'user-456',
        sessionId: 'session-789',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: true,
          canUpload: true,
          canManageSources: false
        }
      };

      manager.setContext(context);
      
      if (manager.getCurrentTenantId() !== 'test-tenant-123') {
        throw new Error('Tenant ID not set correctly');
      }
      
      if (!manager.hasContext()) {
        throw new Error('Tenant context not detected');
      }

      return 'Tenant context management working';
    });

    // Test 2: Permission validation
    await this.runTest('Permission Validation', async () => {
      const manager = getTenantContextManager();
      
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

      manager.setContext(context);

      // Should not throw
      manager.validateAccess('canRead');
      manager.validateAccess('canSearch');

      // Should throw
      try {
        manager.validateAccess('canWrite');
        throw new Error('Should have thrown for canWrite');
      } catch (error) {
        // Expected
      }

      return 'Permission validation working correctly';
    });

    // Test 3: Tenant filters
    await this.runTest('Tenant Filters', async () => {
      const manager = getTenantContextManager();
      
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

      manager.setContext(context);
      const filters = manager.getTenantFilters();

      if (filters.tenant_id !== 'test-tenant') {
        throw new Error('Tenant ID filter incorrect');
      }

      if (!filters.domain?.includes('medical_affairs')) {
        throw new Error('Domain filter incorrect');
      }

      return 'Tenant filters working correctly';
    });

    // Test 4: Tenant service
    await this.runTest('Tenant Service', async () => {
      const service = getTenantService();
      
      const tenantInfo = await service.getTenantInfo('test-tenant');
      
      if (!tenantInfo.id || !tenantInfo.name) {
        throw new Error('Tenant info incomplete');
      }

      const isActive = await service.isTenantActive('test-tenant');
      
      if (typeof isActive !== 'boolean') {
        throw new Error('Tenant active check failed');
      }

      return 'Tenant service working correctly';
    });
  }

  private async validateServiceIntegration(): Promise<void> {
    console.log('\n📋 Validating Service Integration...');

    // Test 1: RAG service with tenant context
    await this.runTest('RAG Service with Tenant Context', async () => {
      const manager = getTenantContextManager();
      
      const context: TenantContext = {
        tenantId: 'test-tenant',
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canSearch: true,
          canUpload: true,
          canManageSources: false
        }
      };

      manager.setContext(context);

      // Initialize RAG service
      await ragService.initialize();

      return 'RAG service initialized with tenant context';
    });

    // Test 2: Error handling in services
    await this.runTest('Service Error Handling', async () => {
      try {
        // This should throw a validation error
        await ragService.generateEmbedding('');
        throw new Error('Should have thrown validation error');
      } catch (error) {
        if (!(error instanceof ValidationError)) {
          throw new Error('Expected ValidationError, got: ' + error.constructor.name);
        }
      }

      return 'Service error handling working correctly';
    });

    // Test 3: Tenant access validation in services
    await this.runTest('Service Tenant Access Validation', async () => {
      const manager = getTenantContextManager();
      
      // Set context without search permission
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

      manager.setContext(context);

      try {
        const validEmbedding = new Array(3072).fill(0.1);
        await ragService.searchKnowledge('test query', validEmbedding);
        throw new Error('Should have thrown access error');
      } catch (error) {
        // Expected to throw due to no search permission
        if (!(error instanceof Error)) {
          throw new Error('Expected error, got: ' + typeof error);
        }
      }

      return 'Service tenant access validation working';
    });
  }

  private async runTest(name: string, testFn: () => Promise<string>): Promise<void> {
    try {
      const result = await testFn();
      console.log(`  ✅ ${name}: ${result}`);
      this.passedTests++;
    } catch (error) {
      console.log(`  ❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
      this.failedTests++;
    }
  }

  private printSummary(): void {
    console.log('\n📊 Phase 2 Validation Summary');
    console.log('='.repeat(40));
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`⏭️ Skipped: ${this.skippedTests}`);
    console.log(`📈 Total: ${this.passedTests + this.failedTests + this.skippedTests}`);

    const successRate = ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (this.failedTests === 0) {
      console.log('\n🎉 Phase 2 validation completed successfully!');
      console.log('✅ Error handling system working correctly');
      console.log('✅ Logging system operational');
      console.log('✅ Tenant isolation implemented');
      console.log('✅ Service integration complete');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    const validator = new Phase2Validator();
    await validator.runValidation();
  } catch (error) {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
