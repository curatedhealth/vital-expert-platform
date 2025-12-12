/**
 * Message Manager Tests
 * 
 * Tests message CRUD operations, history retrieval, and conversation summarization
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MessageManager } from '../services/message-manager';
import type { SaveMessageParams, MessageMetadata } from '../services/message-manager';

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('MessageManager', () => {
  let messageManager: MessageManager;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock query chain
    mockQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    mockSupabaseClient.from.mockReturnValue(mockQuery);

    messageManager = new MessageManager('https://test.supabase.co', 'test-key');
  });

  describe('saveMessage', () => {
    it('should save a user message', async () => {
      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'user',
        content: 'Hello, how are you?',
        metadata: {},
        tokens: null,
        cost: null,
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const params: SaveMessageParams = {
        session_id: 'session-1',
        role: 'user',
        content: 'Hello, how are you?',
      };

      const result = await messageManager.saveMessage(params);

      expect(result.id).toBe('msg-1');
      expect(result.role).toBe('user');
      expect(result.content).toBe('Hello, how are you?');
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-1',
          role: 'user',
          content: 'Hello, how are you?',
        })
      );
    });

    it('should save assistant message with metadata', async () => {
      const metadata: MessageMetadata = {
        tokens: { prompt: 100, completion: 50, total: 150 },
        cost: 0.001,
        model: 'gpt-4',
        rag_sources: [
          { id: 'src-1', title: 'Source 1', similarity: 0.9 },
        ],
      };

      const mockMessage = {
        id: 'msg-2',
        session_id: 'session-1',
        role: 'assistant',
        content: 'I am doing well, thank you!',
        agent_id: 'agent-1',
        metadata,
        tokens: 150,
        cost: 0.001,
        created_at: '2025-01-30T00:00:01Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const params: SaveMessageParams = {
        session_id: 'session-1',
        role: 'assistant',
        content: 'I am doing well, thank you!',
        agent_id: 'agent-1',
        metadata,
        tokens: 150,
        cost: 0.001,
      };

      const result = await messageManager.saveMessage(params);

      expect(result.role).toBe('assistant');
      expect(result.metadata).toEqual(metadata);
      expect(result.tokens).toBe(150);
      expect(result.cost).toBe(0.001);
    });

    it('should handle empty metadata', async () => {
      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
        metadata: {},
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
      });

      expect(result.metadata).toEqual({});
    });

    it('should throw error on save failure', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        messageManager.saveMessage({
          session_id: 'session-1',
          role: 'user',
          content: 'Test',
        })
      ).rejects.toThrow('Failed to save message');
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages for a session', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          session_id: 'session-1',
          role: 'user',
          content: 'Hello',
          metadata: {},
          created_at: '2025-01-30T00:00:00Z',
        },
        {
          id: 'msg-2',
          session_id: 'session-1',
          role: 'assistant',
          content: 'Hi there',
          metadata: {},
          created_at: '2025-01-30T00:00:01Z',
        },
      ];

      mockQuery.range.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await messageManager.getMessages('session-1');

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-1');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should support pagination', async () => {
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
      });

      await messageManager.getMessages('session-1', 10, 20);

      // getMessages uses .range(offset, offset + limit - 1) directly
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should use default pagination values', async () => {
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
      });

      await messageManager.getMessages('session-1');

      // Default: limit=20, offset=0, so range should be (0, 19)
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19);
    });

    it('should handle empty message list', async () => {
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await messageManager.getMessages('session-1');

      expect(result).toEqual([]);
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve conversation history for LLM', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          session_id: 'session-1',
          role: 'user',
          content: 'Hello',
          metadata: {},
          created_at: '2025-01-30T00:00:00Z',
        },
        {
          id: 'msg-2',
          session_id: 'session-1',
          role: 'assistant',
          content: 'Hi there',
          metadata: {},
          created_at: '2025-01-30T00:00:01Z',
        },
      ];

      mockQuery.range.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await messageManager.getConversationHistory('session-1', 10);

      expect(result.length).toBe(2);
      expect(result[0].role).toBe('user');
      expect(result[0].content).toBe('Hello');
    });

    it('should filter out system messages', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          session_id: 'session-1',
          role: 'system',
          content: 'System prompt',
          metadata: {},
          created_at: '2025-01-30T00:00:00Z',
        },
        {
          id: 'msg-2',
          session_id: 'session-1',
          role: 'user',
          content: 'Question',
          metadata: {},
          created_at: '2025-01-30T00:00:01Z',
        },
      ];

      mockQuery.range.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await messageManager.getConversationHistory('session-1', 10);

      expect(result.length).toBe(1);
      expect(result[0].role).toBe('user');
    });
  });

  describe('getMessage', () => {
    it('should retrieve message by ID', async () => {
      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'user',
        content: 'Test message',
        metadata: {},
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await messageManager.getMessage('msg-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('msg-1');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'msg-1');
    });

    it('should return null for non-existent message', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await messageManager.getMessage('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateMessageMetadata', () => {
    it('should update message metadata', async () => {
      const existingMetadata = { key: 'value' };
      const newMetadata = { newKey: 'newValue' };

      // Create a separate query chain for the select and update operations
      const selectQuery = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { metadata: existingMetadata },
          error: null,
        }),
      };

      const updateQuery = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'msg-1',
            session_id: 'session-1',
            role: 'user',
            content: 'Test',
            metadata: { ...existingMetadata, ...newMetadata },
            created_at: '2025-01-30T00:00:00Z',
          },
          error: null,
        }),
      };

      mockQuery.select.mockReturnValueOnce(selectQuery);
      mockQuery.update.mockReturnValueOnce(updateQuery);

      const result = await messageManager.updateMessageMetadata('msg-1', newMetadata);

      expect(result.metadata).toEqual({ ...existingMetadata, ...newMetadata });
    });
  });

  describe('getMessageCount', () => {
    it('should return message count for session', async () => {
      // Mock select to return count
      const countMock = {
        eq: jest.fn().mockResolvedValue({
          count: 5,
          error: null,
        }),
      };
      mockQuery.select.mockReturnValue(countMock);

      const result = await messageManager.getMessageCount('session-1');

      expect(result).toBe(5);
      expect(countMock.eq).toHaveBeenCalledWith('session_id', 'session-1');
    });

    it('should return 0 when no messages', async () => {
      const countMock = {
        eq: jest.fn().mockResolvedValue({
          count: 0,
          error: null,
        }),
      };
      mockQuery.select.mockReturnValue(countMock);

      const result = await messageManager.getMessageCount('session-1');

      expect(result).toBe(0);
    });

    it('should return 0 when count is null', async () => {
      const countMock = {
        eq: jest.fn().mockResolvedValue({
          count: null,
          error: null,
        }),
      };
      mockQuery.select.mockReturnValue(countMock);

      const result = await messageManager.getMessageCount('session-1');

      expect(result).toBe(0);
    });
  });

  describe('getSummarizedHistory', () => {
    it('should return summary for long conversations', async () => {
      const mockMessages = Array.from({ length: 20 }, (_, i) => ({
        id: `msg-${i}`,
        session_id: 'session-1',
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        metadata: {},
        created_at: `2025-01-30T00:00:${i.toString().padStart(2, '0')}Z`,
      }));

      mockQuery.range.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await messageManager.getSummarizedHistory('session-1', 5);

      expect(result.totalMessages).toBe(20);
      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.recentMessages.length).toBeGreaterThan(0);
    });

    it('should return all messages for short conversations', async () => {
      const mockMessages = Array.from({ length: 5 }, (_, i) => ({
        id: `msg-${i}`,
        session_id: 'session-1',
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        metadata: {},
        created_at: `2025-01-30T00:00:${i.toString().padStart(2, '0')}Z`,
      }));

      mockQuery.range.mockResolvedValue({
        data: mockMessages,
        error: null,
      });

      const result = await messageManager.getSummarizedHistory('session-1', 5);

      expect(result.summary).toBe('');
      expect(result.recentMessages.length).toBeGreaterThan(0);
    });
  });

  describe('deleteSessionMessages', () => {
    it('should delete messages for a session', async () => {
      mockQuery.eq.mockResolvedValue({
        data: {},
        error: null,
      });

      await messageManager.deleteSessionMessages('session-1');

      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-1');
      expect(mockQuery.delete).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      mockQuery.eq.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      await expect(messageManager.deleteSessionMessages('session-1')).rejects.toThrow(
        'Failed to delete session messages'
      );
    });
  });

  describe('mapToMessage', () => {
    it('should map database record correctly', async () => {
      const mockData = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'assistant',
        content: 'Test content',
        agent_id: 'agent-1',
        metadata: { key: 'value' },
        tokens: 100,
        cost: 0.001,
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'assistant',
        content: 'Test content',
      });

      expect(result.id).toBe(mockData.id);
      expect(result.session_id).toBe(mockData.session_id);
      expect(result.role).toBe(mockData.role);
      expect(result.content).toBe(mockData.content);
      expect(result.metadata).toEqual(mockData.metadata);
    });

    it('should handle default values', async () => {
      const mockData = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
      });

      expect(result.metadata).toEqual({});
    });

    it('should handle null metadata', async () => {
      const mockData = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
        metadata: null,
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'user',
        content: 'Test',
      });

      expect(result.metadata).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle messages with complex metadata', async () => {
      const complexMetadata: MessageMetadata = {
        tokens: { prompt: 1000, completion: 500, total: 1500 },
        cost: 0.01,
        model: 'gpt-4-turbo',
        thinking_steps: [
          { step: 'analyze', description: 'Analyzing query', timestamp: '2025-01-30T00:00:00Z' },
        ],
        tools_used: [
          {
            tool_name: 'calculator',
            input: { expression: '2+2' },
            output: 4,
            duration_ms: 100,
          },
        ],
        rag_sources: Array.from({ length: 5 }, (_, i) => ({
          id: `src-${i}`,
          title: `Source ${i}`,
          similarity: 0.9 - i * 0.1,
        })),
      };

      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'assistant',
        content: 'Response',
        metadata: complexMetadata,
        tokens: 1500,
        cost: 0.01,
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'assistant',
        content: 'Response',
        metadata: complexMetadata,
        tokens: 1500,
        cost: 0.01,
      });

      expect(result.metadata).toEqual(complexMetadata);
    });

    it('should handle very long message content', async () => {
      const longContent = 'word '.repeat(10000);

      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'assistant',
        content: longContent,
        metadata: {},
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'assistant',
        content: longContent,
      });

      expect(result.content).toBe(longContent);
    });

    it('should handle system messages', async () => {
      const mockMessage = {
        id: 'msg-1',
        session_id: 'session-1',
        role: 'system',
        content: 'System instruction',
        metadata: {},
        created_at: '2025-01-30T00:00:00Z',
      };

      mockQuery.single.mockResolvedValue({
        data: mockMessage,
        error: null,
      });

      const result = await messageManager.saveMessage({
        session_id: 'session-1',
        role: 'system',
        content: 'System instruction',
      });

      expect(result.role).toBe('system');
    });
  });
});

