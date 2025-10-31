/**
 * Unit tests for Tenant Middleware
 */

const { tenantMiddleware, extractTenantId, PLATFORM_TENANT_ID } = require('../tenant');
const { createClient } = require('@supabase/supabase-js');

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Tenant Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      locals: {},
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('extractTenantId', () => {
    it('should extract tenant ID from x-tenant-id header', async () => {
      const tenantId = 'test-tenant-id';
      req.headers['x-tenant-id'] = tenantId;

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe(tenantId);
      expect(result.detectionMethod).toBe('header');
    });

    it('should use platform tenant if x-tenant-id is platform tenant', async () => {
      req.headers['x-tenant-id'] = PLATFORM_TENANT_ID;

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(result.detectionMethod).toBe('header');
    });

    it('should extract tenant from subdomain', async () => {
      req.headers.host = 'digital-health-startup.vital.expert';
      
      const mockTenant = { id: 'subdomain-tenant-id' };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTenant,
          error: null,
        }),
      };

      createClient.mockReturnValue(mockSupabase);
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe('subdomain-tenant-id');
      expect(result.detectionMethod).toBe('subdomain');
      expect(mockSupabase.from).toHaveBeenCalledWith('tenants');
    });

    it('should fallback to platform tenant if subdomain not found', async () => {
      req.headers.host = 'unknown-subdomain.vital.expert';
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      createClient.mockReturnValue(mockSupabase);
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(result.detectionMethod).toBe('fallback');
    });

    it('should extract tenant from cookie if subdomain not found', async () => {
      req.headers.host = 'localhost:3001';
      req.cookies = { tenant_id: 'cookie-tenant-id' };

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe('cookie-tenant-id');
      expect(result.detectionMethod).toBe('cookie');
    });

    it('should skip common subdomains', async () => {
      req.headers.host = 'www.vital.expert';

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(result.detectionMethod).toBe('fallback');
    });

    it('should fallback to platform tenant when no tenant detected', async () => {
      req.headers.host = 'vital.expert';

      const result = await extractTenantId(req);

      expect(result.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(result.detectionMethod).toBe('fallback');
    });
  });

  describe('tenantMiddleware', () => {
    it('should attach tenant ID to request', async () => {
      req.headers['x-tenant-id'] = 'test-tenant-id';

      await tenantMiddleware(req, res, next);

      expect(req.tenantId).toBe('test-tenant-id');
      expect(req.headers['x-tenant-id']).toBe('test-tenant-id');
      expect(res.locals.tenantId).toBe('test-tenant-id');
      expect(next).toHaveBeenCalled();
    });

    it('should continue on error with platform tenant', async () => {
      req.headers.host = 'invalid';
      
      // Mock extractTenantId to throw an error
      const originalExtractTenantId = extractTenantId;
      jest.spyOn(require('../tenant'), 'extractTenantId').mockRejectedValue(new Error('Test error'));

      await tenantMiddleware(req, res, next);

      expect(req.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(res.locals.tenantId).toBe(PLATFORM_TENANT_ID);
      expect(res.locals.tenantDetectionMethod).toBe('error-fallback');
      expect(next).toHaveBeenCalled();
      
      // Restore original function
      jest.restoreAllMocks();
    });

    it('should log tenant detection in development', async () => {
      process.env.NODE_ENV = 'development';
      req.headers['x-tenant-id'] = 'test-tenant-id';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await tenantMiddleware(req, res, next);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

