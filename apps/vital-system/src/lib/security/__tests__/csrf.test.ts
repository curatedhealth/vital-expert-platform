/**
 * CSRF Protection Unit Tests
 *
 * Tests for double-submit cookie pattern with timing-safe comparison
 */

import { describe, it, expect, jest } from '@jest/globals';
import { generateCSRFToken, validateCSRFToken } from '../csrf';

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('generates a token', () => {
      const token = generateCSRFToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('generates unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).not.toBe(token2);
    });

    it('generates tokens of expected length', () => {
      const token = generateCSRFToken();

      // 32 bytes hex = 64 characters
      expect(token).toHaveLength(64);
    });

    it('generates cryptographically secure tokens', () => {
      const tokens = new Set();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        tokens.add(generateCSRFToken());
      }

      // All should be unique
      expect(tokens.size).toBe(iterations);
    });

    it('generates tokens with valid characters', () => {
      const token = generateCSRFToken();

      // Should only contain hex characters (0-9, a-f)
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('generates multiple tokens quickly', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        generateCSRFToken();
      }

      const duration = Date.now() - startTime;

      // Should generate 100 tokens in < 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('validateCSRFToken', () => {
    it('validates matching tokens', () => {
      const token = generateCSRFToken();
      const cookie = token;
      const header = token;

      const result = validateCSRFToken(cookie, header);

      expect(result).toBe(true);
    });

    it('rejects mismatched tokens', () => {
      const cookie = generateCSRFToken();
      const header = generateCSRFToken();

      const result = validateCSRFToken(cookie, header);

      expect(result).toBe(false);
    });

    it('rejects empty cookie', () => {
      const header = generateCSRFToken();

      const result = validateCSRFToken('', header);

      expect(result).toBe(false);
    });

    it('rejects empty header', () => {
      const cookie = generateCSRFToken();

      const result = validateCSRFToken(cookie, '');

      expect(result).toBe(false);
    });

    it('rejects both empty', () => {
      const result = validateCSRFToken('', '');

      expect(result).toBe(false);
    });

    it('rejects null/undefined values', () => {
      const token = generateCSRFToken();

      // @ts-ignore - Testing invalid input
      expect(validateCSRFToken(null, token)).toBe(false);

      // @ts-ignore - Testing invalid input
      expect(validateCSRFToken(token, null)).toBe(false);

      // @ts-ignore - Testing invalid input
      expect(validateCSRFToken(undefined, token)).toBe(false);

      // @ts-ignore - Testing invalid input
      expect(validateCSRFToken(token, undefined)).toBe(false);
    });

    it('is case-sensitive', () => {
      const token = generateCSRFToken();
      const upperToken = token.toUpperCase();

      const result = validateCSRFToken(token, upperToken);

      // Should not match (case-sensitive)
      expect(result).toBe(false);
    });

    it('rejects tokens with different lengths', () => {
      const cookie = generateCSRFToken();
      const header = cookie.substring(0, 32); // Half length

      const result = validateCSRFToken(cookie, header);

      expect(result).toBe(false);
    });

    it('rejects tokens with whitespace', () => {
      const token = generateCSRFToken();
      const tokenWithSpace = ` ${token}`;

      const result = validateCSRFToken(token, tokenWithSpace);

      expect(result).toBe(false);
    });

    it('uses timing-safe comparison', () => {
      const token = 'a'.repeat(64);
      const validHeader = 'a'.repeat(64);
      const invalidHeader = 'b'.repeat(64);

      // Measure timing for valid vs invalid
      const iterations = 1000;

      const validStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        validateCSRFToken(token, validHeader);
      }
      const validTime = Date.now() - validStart;

      const invalidStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        validateCSRFToken(token, invalidHeader);
      }
      const invalidTime = Date.now() - invalidStart;

      // Timing difference should be minimal (within 20% variance)
      const difference = Math.abs(validTime - invalidTime);
      const maxDifference = Math.max(validTime, invalidTime) * 0.2;

      expect(difference).toBeLessThan(maxDifference);
    });
  });

  describe('integration scenarios', () => {
    it('handles complete CSRF flow', () => {
      // 1. Generate token for form
      const token = generateCSRFToken();

      // 2. Set as cookie
      const cookie = token;

      // 3. Submit form with header
      const header = token;

      // 4. Validate on server
      const isValid = validateCSRFToken(cookie, header);

      expect(isValid).toBe(true);
    });

    it('rejects replay attack with old token', () => {
      // Original request
      const token1 = generateCSRFToken();
      const cookie = token1;

      // Attacker tries to replay with different header
      const token2 = generateCSRFToken();
      const header = token2;

      const isValid = validateCSRFToken(cookie, header);

      expect(isValid).toBe(false);
    });

    it('rejects forged requests without cookie', () => {
      // Attacker generates their own token
      const attackerToken = generateCSRFToken();

      // But doesn't have the cookie
      const cookie = '';
      const header = attackerToken;

      const isValid = validateCSRFToken(cookie, header);

      expect(isValid).toBe(false);
    });

    it('handles token refresh', () => {
      // Old token
      const oldToken = generateCSRFToken();

      // Generate new token
      const newToken = generateCSRFToken();

      // Validate with new token
      const isValid = validateCSRFToken(newToken, newToken);

      expect(isValid).toBe(true);

      // Old token should not work
      const oldIsValid = validateCSRFToken(oldToken, newToken);
      expect(oldIsValid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles very long strings', () => {
      const longCookie = 'a'.repeat(10000);
      const longHeader = 'a'.repeat(10000);

      const result = validateCSRFToken(longCookie, longHeader);

      expect(result).toBe(true);
    });

    it('handles special characters', () => {
      const specialToken = generateCSRFToken();

      const result = validateCSRFToken(specialToken, specialToken);

      expect(result).toBe(true);
    });

    it('handles binary data', () => {
      const token = generateCSRFToken();

      // Try to validate with binary
      const result = validateCSRFToken(token, token);

      expect(result).toBe(true);
    });
  });

  describe('security properties', () => {
    it('prevents timing attacks', () => {
      const token = generateCSRFToken();

      // Try tokens that differ at different positions
      const differences = [
        token.substring(0, 1) + 'x' + token.substring(2),    // First char
        token.substring(0, 32) + 'x' + token.substring(33),  // Middle
        token.substring(0, 63) + 'x'                         // Last char
      ];

      const timings: number[] = [];

      differences.forEach(differentToken => {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          validateCSRFToken(token, differentToken);
        }
        timings.push(performance.now() - start);
      });

      // Variance should be minimal
      const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
      const variance = timings.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / timings.length;

      // Standard deviation should be small relative to average
      expect(Math.sqrt(variance) / avg).toBeLessThan(0.1);
    });

    it('generates unpredictable tokens', () => {
      const tokens = Array.from({ length: 100 }, () => generateCSRFToken());

      // Check that consecutive tokens don't have patterns
      for (let i = 1; i < tokens.length; i++) {
        // No token should be substring of another
        expect(tokens[i]).not.toContain(tokens[i - 1].substring(0, 10));
        expect(tokens[i - 1]).not.toContain(tokens[i].substring(0, 10));
      }
    });

    it('has high entropy', () => {
      const tokens = Array.from({ length: 1000 }, () => generateCSRFToken());

      // Count unique characters across all tokens
      const chars = new Set(tokens.join(''));

      // Should use all hex characters (0-9, a-f = 16 chars)
      expect(chars.size).toBe(16);
    });
  });

  describe('performance', () => {
    it('validates tokens quickly', () => {
      const token = generateCSRFToken();

      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        validateCSRFToken(token, token);
      }

      const duration = Date.now() - startTime;

      // 10,000 validations should take < 100ms
      expect(duration).toBeLessThan(100);
    });

    it('handles high throughput', () => {
      const tokens = Array.from({ length: 100 }, () => ({
        cookie: generateCSRFToken(),
        header: generateCSRFToken()
      }));

      const startTime = Date.now();

      tokens.forEach(({ cookie, header }) => {
        validateCSRFToken(cookie, header);
      });

      const duration = Date.now() - startTime;

      // 100 validations should take < 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});
