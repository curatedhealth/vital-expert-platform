/**
 * VITAL Path API Connectivity Integration Tests
 * Tests for healthcare API middleware, authentication, and validation
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test data
const HEALTHCARE_AGENTS = [
  'digital-therapeutics-expert',
  'fda-regulatory-strategist',
  'clinical-trial-designer',
  'medical-safety-officer',
  'ai-ml-clinical-specialist',
  'health-economics-analyst',
  'biomedical-informatics-specialist',
  'clinical-data-scientist',
  'pharmaceutical-rd-director',
  'market-access-strategist'
];

const MEDICAL_QUERIES = {
  SAFE: 'What are the regulatory requirements for digital health applications?',
  PHI_VIOLATION: 'Patient John Doe, SSN 123-45-6789, needs treatment for diabetes.',
  EMERGENCY: 'Patient is experiencing severe chest pain and difficulty breathing.',
  MEDICATION: 'What is the recommended dosage for metformin in diabetic patients?'
};

describe('VITAL Path API Connectivity Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Set up test authentication
    authToken = await getTestAuthToken();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  beforeEach(() => {
    // Reset any test-specific state
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

    test('should block requests with PHI violations', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/clinical-trial-designer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.PHI_VIOLATION,
          agentType: 'clinical-trial-designer'
        })
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('HIPAA compliance');
      expect(errorData.error.violations).toBeDefined();
    }, TEST_TIMEOUT);

    test('should flag emergency content appropriately', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/medical-safety-officer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.EMERGENCY,
          agentType: 'medical-safety-officer'
        })
      });

      expect(response.status).toBe(403);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('medical safety concerns');
      expect(errorData.error.safetyNotice).toContain('emergency services');
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

      // Check rate limit headers
      const successfulResponse = responses.find(r => r.status === 200);
      if (successfulResponse) {
        expect(successfulResponse.headers.get('X-RateLimit-Limit')).toBeTruthy();
        expect(successfulResponse.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      }
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

      expect(response.status).toBeOneOf([200, 202]); // Accept async processing

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('response');
        expect(data).toHaveProperty('agentType', agentType);
        expect(data).toHaveProperty('confidence');
      }
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

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('Invalid healthcare agent type');
    }, TEST_TIMEOUT);
  });

  describe('WebSocket Connectivity', () => {
    test('should establish WebSocket connection for real-time collaboration', async () => {
      const response = await fetch(`${BASE_URL}/api/events/websocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          action: 'connect',
          sessionId: 'test-session-123'
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('connectionId');
      expect(data).toHaveProperty('status', 'connected');
    }, TEST_TIMEOUT);

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

      expect(response.status).toBe(401);
    }, TEST_TIMEOUT);
  });

  describe('Knowledge Management APIs', () => {
    test('should handle knowledge upload with validation', async () => {
      const testDocument = {
        title: 'Test Medical Document',
        content: 'This is a test medical document for validation.',
        tags: ['medical', 'test'],
        category: 'clinical-research'
      };

      const response = await fetch(`${BASE_URL}/api/knowledge/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testDocument)
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('documentId');
      expect(data).toHaveProperty('status', 'processed');
    }, TEST_TIMEOUT);

    test('should search knowledge base with healthcare validation', async () => {
      const response = await fetch(`${BASE_URL}/api/knowledge/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: 'clinical trial design',
          limit: 10,
          filters: {
            category: 'clinical-research'
          }
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('LLM Service APIs', () => {
    test('should process medical queries with safety validation', async () => {
      const response = await fetch(`${BASE_URL}/api/llm/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: MEDICAL_QUERIES.SAFE,
          model: 'gpt-4',
          maxTokens: 500,
          temperature: 0.1
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('safetyCheck');
      expect(data).toHaveProperty('confidence');
    }, TEST_TIMEOUT);

    test('should provide usage metrics with authorization', async () => {
      const response = await fetch(`${BASE_URL}/api/llm/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('usage');
      expect(data).toHaveProperty('period');
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

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('Invalid request format');
    }, TEST_TIMEOUT);

    test('should handle missing required fields', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/clinical-trial-designer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          // Missing query field
          agentType: 'clinical-trial-designer'
        })
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('validation failed');
    }, TEST_TIMEOUT);

    test('should handle server errors gracefully', async () => {
      // Test with endpoint that might cause server error
      const response = await fetch(`${BASE_URL}/api/agents/test-error-endpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: 'trigger server error',
          agentType: 'test-error-endpoint'
        })
      });

      // Should handle error gracefully, not crash
      expect(response.status).toBeOneOf([400, 404, 500]);

      if (response.headers.get('content-type')?.includes('application/json')) {
        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
      }
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

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    }, TEST_TIMEOUT);

    test('should validate input sanitization', async () => {
      const maliciousInput = '<script>alert("xss")</script> DROP TABLE users;';

      const response = await fetch(`${BASE_URL}/api/agents/digital-therapeutics-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: maliciousInput,
          agentType: 'digital-therapeutics-expert'
        })
      });

      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error.message).toContain('dangerous pattern');
    }, TEST_TIMEOUT);
  });
});

// Helper functions

async function getTestAuthToken(): Promise<string> {
  // In production, this would use a proper test user authentication
  // For now, create a mock token
  const testToken = Buffer.from(JSON.stringify({
    sub: 'test-user-123',
    role: 'healthcare_provider',
    email: 'test@vital-path.com',
    sessionId: 'test-session-123',
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64');

  return testToken;
}

async function cleanupTestData(): Promise<void> {
  // Clean up any test data created during tests
  try {
    // Implementation would clean up test documents, sessions, etc.
    console.log('Test cleanup completed');
  } catch (error) {
    console.warn('Test cleanup warning:', error);
  }
}

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: number[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: number, expected: number[]) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      };
    }
  },
});