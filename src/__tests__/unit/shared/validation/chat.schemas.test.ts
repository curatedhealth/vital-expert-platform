import { describe, it, expect, vi } from 'vitest';
import { ChatRequestSchema, validateChatRequest } from '@/shared/validation/chat.schemas';

describe('Chat Validation Schemas', () => {
  describe('ChatRequestSchema', () => {
    it('should validate a valid chat request', () => {
      const validRequest = {
        message: 'Hello, I need help with a medical question',
        userId: 'user@example.com',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        agent: {
          id: 'medical-expert',
          name: 'Medical Expert',
          display_name: 'Dr. Medical Expert',
          system_prompt: 'You are a medical expert.'
        },
        interactionMode: 'manual',
        autonomousMode: false,
        selectedTools: ['medical-knowledge', 'diagnosis'],
        chatHistory: [
          { role: 'user', content: 'Previous message' },
          { role: 'assistant', content: 'Previous response' }
        ]
      };

      const result = ChatRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe(validRequest.message);
        expect(result.data.userId).toBe(validRequest.userId);
        expect(result.data.sessionId).toBe(validRequest.sessionId);
        expect(result.data.agent).toEqual(validRequest.agent);
        expect(result.data.interactionMode).toBe(validRequest.interactionMode);
        expect(result.data.autonomousMode).toBe(validRequest.autonomousMode);
        expect(result.data.selectedTools).toEqual(validRequest.selectedTools);
        expect(result.data.chatHistory).toEqual(validRequest.chatHistory);
      }
    });

    it('should validate with minimal required fields', () => {
      const minimalRequest = {
        message: 'Hello',
        userId: 'user@example.com'
      };

      const result = ChatRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe('Hello');
        expect(result.data.userId).toBe('user@example.com');
        expect(result.data.sessionId).toBeDefined(); // Should be auto-generated
        expect(result.data.interactionMode).toBe('automatic'); // Default value
        expect(result.data.autonomousMode).toBe(false); // Default value
        expect(result.data.selectedTools).toEqual([]); // Default value
        expect(result.data.chatHistory).toEqual([]); // Default value
        expect(result.data.agent).toBeNull(); // Default value
      }
    });

    it('should reject empty message', () => {
      const invalidRequest = {
        message: '',
        userId: 'user@example.com'
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Message cannot be empty');
      }
    });

    it('should reject message that is too long', () => {
      const invalidRequest = {
        message: 'a'.repeat(4001), // Exceeds 4000 character limit
        userId: 'user@example.com'
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Message too long');
      }
    });

    it('should reject invalid email format', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'invalid-email'
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });

    it('should reject invalid UUID for sessionId', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        sessionId: 'invalid-uuid'
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid uuid');
      }
    });

    it('should reject invalid interaction mode', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        interactionMode: 'invalid-mode'
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid enum value');
      }
    });

    it('should reject too many selected tools', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        selectedTools: Array(11).fill('tool') // Exceeds 10 tool limit
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Too many tools selected');
      }
    });

    it('should reject too long chat history', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        chatHistory: Array(101).fill({ role: 'user', content: 'Message' }) // Exceeds 100 message limit
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Chat history too long');
      }
    });

    it('should reject invalid agent structure', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        agent: {
          id: 'test-agent',
          name: 'Test Agent',
          // Missing required fields
        }
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject system prompt that is too long', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        agent: {
          id: 'test-agent',
          name: 'Test Agent',
          system_prompt: 'a'.repeat(10001) // Exceeds 10000 character limit
        }
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('String must contain at most 10000 character(s)');
      }
    });

    it('should reject invalid chat history message roles', () => {
      const invalidRequest = {
        message: 'Hello',
        userId: 'user@example.com',
        chatHistory: [
          { role: 'invalid-role', content: 'Message' }
        ]
      };

      const result = ChatRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid enum value');
      }
    });
  });

  describe('validateChatRequest', () => {
    it('should return parsed data for valid request', () => {
      const validRequest = {
        message: 'Hello',
        userId: 'user@example.com'
      };

      const result = validateChatRequest(validRequest);
      expect(result.message).toBe('Hello');
      expect(result.userId).toBe('user@example.com');
      expect(result.sessionId).toBeDefined();
    });

    it('should throw error for invalid request', () => {
      const invalidRequest = {
        message: '',
        userId: 'invalid-email'
      };

      expect(() => validateChatRequest(invalidRequest)).toThrow();
    });

    it('should handle unknown input type', () => {
      expect(() => validateChatRequest(null)).toThrow();
      expect(() => validateChatRequest(undefined)).toThrow();
      expect(() => validateChatRequest('string')).toThrow();
      expect(() => validateChatRequest(123)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long but valid message', () => {
      const request = {
        message: 'a'.repeat(4000), // Exactly at the limit
        userId: 'user@example.com'
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should handle maximum number of tools', () => {
      const request = {
        message: 'Hello',
        userId: 'user@example.com',
        selectedTools: Array(10).fill('tool') // Exactly at the limit
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should handle maximum chat history length', () => {
      const request = {
        message: 'Hello',
        userId: 'user@example.com',
        chatHistory: Array(100).fill({ role: 'user', content: 'Message' }) // Exactly at the limit
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should handle system prompt at maximum length', () => {
      const request = {
        message: 'Hello',
        userId: 'user@example.com',
        agent: {
          id: 'test-agent',
          name: 'Test Agent',
          system_prompt: 'a'.repeat(10000) // Exactly at the limit
        }
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });
});
