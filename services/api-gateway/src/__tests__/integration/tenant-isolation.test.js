/**
 * Integration tests for Tenant Isolation
 * 
 * Tests that tenants can only access their own resources
 * and shared platform resources.
 * 
 * Note: These tests require a running database with test tenants.
 * Set SKIP_INTEGRATION_TESTS=true to skip these tests.
 */

const request = require('supertest');
const app = require('../../index');

// Skip integration tests if flag is set
if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
  describe.skip('Tenant Isolation Integration Tests', () => {
    it('Integration tests skipped (SKIP_INTEGRATION_TESTS=true)', () => {});
  });
} else {

describe('Tenant Isolation Integration Tests', () => {
  const TENANT_A_ID = '00000000-0000-0000-0000-000000000002';
  const TENANT_B_ID = '00000000-0000-0000-0000-000000000003';
  const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

  describe('Agent Access', () => {
    it('should return only tenant A agents for tenant A', async () => {
      const response = await request(app)
        .get('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .expect(200);

      // Verify all returned agents belong to tenant A or are shared
      response.body.forEach(agent => {
        expect(
          agent.tenant_id === TENANT_A_ID ||
          (agent.is_shared === true && agent.sharing_mode === 'global')
        ).toBe(true);
      });
    });

    it('should not return tenant A agents to tenant B', async () => {
      const response = await request(app)
        .get('/api/agents')
        .set('x-tenant-id', TENANT_B_ID)
        .expect(200);

      // Verify no tenant A private agents are returned
      response.body.forEach(agent => {
        if (agent.tenant_id === TENANT_A_ID) {
          expect(agent.is_shared).toBe(true);
          expect(agent.sharing_mode).toBe('global');
        }
      });
    });

    it('should return platform shared agents to all tenants', async () => {
      const tenantAResponse = await request(app)
        .get('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .expect(200);

      const tenantBResponse = await request(app)
        .get('/api/agents')
        .set('x-tenant-id', TENANT_B_ID)
        .expect(200);

      // Find platform shared agents
      const platformAgentsA = tenantAResponse.body.filter(
        a => a.tenant_id === PLATFORM_TENANT_ID && a.is_shared === true
      );
      const platformAgentsB = tenantBResponse.body.filter(
        a => a.tenant_id === PLATFORM_TENANT_ID && a.is_shared === true
      );

      // Both tenants should see the same platform agents
      expect(platformAgentsA.length).toBeGreaterThan(0);
      expect(platformAgentsA.length).toBe(platformAgentsB.length);
    });
  });

  describe('Resource Creation', () => {
    it('should create agent with correct tenant ID', async () => {
      const newAgent = {
        name: 'test-agent-tenant-a',
        display_name: 'Test Agent Tenant A',
        description: 'Test agent for tenant A',
        system_prompt: 'You are a test agent',
      };

      const response = await request(app)
        .post('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .send(newAgent)
        .expect(201);

      expect(response.body.tenant_id).toBe(TENANT_A_ID);
    });

    it('should prevent tenant B from accessing tenant A agent', async () => {
      // First, create an agent for tenant A
      const newAgent = {
        name: 'private-agent-tenant-a',
        display_name: 'Private Agent Tenant A',
        description: 'Private agent for tenant A',
        system_prompt: 'You are a private agent',
      };

      const createResponse = await request(app)
        .post('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .send(newAgent)
        .expect(201);

      const agentId = createResponse.body.id;

      // Try to access it as tenant B
      const getResponse = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('x-tenant-id', TENANT_B_ID);

      // Should not be accessible (404 or empty response)
      expect([404, 200]).toContain(getResponse.status);
      if (getResponse.status === 200) {
        expect(getResponse.body).toBeNull();
      }
    });
  });

  describe('Selective Sharing', () => {
    it('should allow tenant B to access selectively shared agent', async () => {
      // Create agent for tenant A with selective sharing
      const sharedAgent = {
        name: 'selectively-shared-agent',
        display_name: 'Selectively Shared Agent',
        description: 'Agent shared with tenant B',
        system_prompt: 'You are a shared agent',
        is_shared: true,
        sharing_mode: 'selective',
        shared_with: [TENANT_B_ID],
      };

      const createResponse = await request(app)
        .post('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .send(sharedAgent)
        .expect(201);

      const agentId = createResponse.body.id;

      // Tenant B should be able to access it
      const getResponse = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('x-tenant-id', TENANT_B_ID)
        .expect(200);

      expect(getResponse.body.id).toBe(agentId);
    });

    it('should prevent tenant C from accessing selectively shared agent', async () => {
      const TENANT_C_ID = '00000000-0000-0000-0000-000000000004';

      // Create agent for tenant A shared only with tenant B
      const sharedAgent = {
        name: 'selective-agent',
        display_name: 'Selective Agent',
        description: 'Agent shared only with tenant B',
        system_prompt: 'You are a selective agent',
        is_shared: true,
        sharing_mode: 'selective',
        shared_with: [TENANT_B_ID],
      };

      const createResponse = await request(app)
        .post('/api/agents')
        .set('x-tenant-id', TENANT_A_ID)
        .send(sharedAgent)
        .expect(201);

      const agentId = createResponse.body.id;

      // Tenant C should NOT be able to access it
      const getResponse = await request(app)
        .get(`/api/agents/${agentId}`)
        .set('x-tenant-id', TENANT_C_ID);

      expect([404, 200]).toContain(getResponse.status);
      if (getResponse.status === 200) {
        expect(getResponse.body).toBeNull();
      }
    });
  });
}

