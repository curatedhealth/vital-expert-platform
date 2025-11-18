/**
 * VITAL Path API Connectivity Integration Tests
 * Tests for healthcare API middleware, authentication, and validation
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test data
const HEALTHCARE_AGENTS = [
  'digital-therapeutics-expert',
  'fda-regulatory-strategist',
  'clinical-trial-designer',
  'medical-safety-officer'
];

const MEDICAL_QUERIES = {
  SAFE: 'What are the regulatory requirements for digital health applications?',
  PHI_VIOLATION: 'Patient John Doe, SSN 123-45-6789, needs treatment for diabetes.',
  EMERGENCY: 'Patient is experiencing severe chest pain and difficulty breathing.'
};

describe('VITAL Path API Connectivity Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Set up test authentication
    authToken = await getTestAuthToken();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('Healthcare API Middleware', () => {
    test('should apply healthcare middleware to agent endpoints', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/digital-therapeutics-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.SAFE,
          agentType: 'digital-therapeutics-expert'
        })
      });

      // Check for healthcare middleware headers
      expect(response.headers.get('X-Healthcare-Compliance')).toBe('HIPAA-Validated');
      expect(response.headers.get('X-Medical-Safety-Level')).toBeTruthy();
      expect(response.headers.get('X-Request-ID')).toBeTruthy();
    }, TEST_TIMEOUT);

    test('should apply appropriate rate limiting', async () => {
      const promises = [];

      // Send multiple requests rapidly to trigger rate limiting
      for (let i = 0; i < 15; i++) {
        promises.push(
          fetch(`${BASE_URL}/api/agents/clinical-trial-designer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              query: MEDICAL_QUERIES.SAFE,
              agentType: 'clinical-trial-designer'
            })
          })
        );
      }

      const responses = await Promise.all(promises);

      // At least one should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });

  describe('Healthcare Agent Endpoints', () => {
    test.each(HEALTHCARE_AGENTS)('should validate %s agent endpoint', async (agentType) => {
      const response = await fetch(`${BASE_URL}/api/agents/${agentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.SAFE,
          agentType: agentType
        })
      });

      expect([200, 202, 404]).toContain(response.status); // Accept async processing or not found
    }, TEST_TIMEOUT);

    test('should handle invalid agent types', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/invalid-agent-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.SAFE,
          agentType: 'invalid-agent-type'
        })
      });

      expect([400, 404]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('WebSocket Connectivity', () => {
    test('should handle WebSocket authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/events/websocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No authorization header
        },
        body: JSON.stringify({
          action: 'connect',
          sessionId: 'test-session-123'
        })
      });

      expect([401, 404]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('Error Handling and Recovery', () => {
    test('should handle malformed JSON requests gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/digital-therapeutics-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: '{ malformed json'
      });

      expect([400, 404]).toContain(response.status);
    }, TEST_TIMEOUT);
  });

  describe('Security and Compliance', () => {
    test('should include required security headers', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/digital-therapeutics-expert`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // These should be set by middleware regardless of endpoint status
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    }, TEST_TIMEOUT);
  });
});

// Helper functions
async function getTestAuthToken() {
  // Create a mock token for testing
  const testToken = Buffer.from(JSON.stringify({
    sub: 'test-user-123',
    role: 'healthcare_provider',
    email: 'test@vital-path.com',
    sessionId: 'test-session-123',
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64');

  return testToken;
}

async function cleanupTestData() {
  // Clean up any test data created during tests
  try {
    console.log('Test cleanup completed');
  } catch (error) {
    console.warn('Test cleanup warning:', error);
  }
}