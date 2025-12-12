/**
 * Unit Tests for ConversationsService
 * 
 * Tests conversation CRUD operations, migration, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Import after mocks
import { ConversationsService } from '@/lib/services/conversations/conversations-service';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let mockFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConversationsService();
    mockFrom = mockSupabase.from('');
  });

  describe('getUserConversations', () => {
    it('should fetch conversations for a user', async () => {
      const userId = 'user-123';
      const mockData = [
        {
          id: 'conv-1',
          user_id: userId,
          title: 'Test Conversation',
          messages: [],
          created_at: '2025-01-29T00:00:00Z',
          updated_at: '2025-01-29T00:00:00Z',
        },
      ];

      mockFrom.select.mockResolvedValue({ data: mockData, error: null });
      mockFrom.order.mockReturnThis();

      const conversations = await service.getUserConversations(userId);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toBe('conv-1');
      expect(conversations[0].title).toBe('Test Conversation');
    });

    it('should return empty array if user has no conversations', async () => {
      const userId = 'user-123';
      mockFrom.select.mockResolvedValue({ data: [], error: null });
      mockFrom.order.mockReturnThis();

      const conversations = await service.getUserConversations(userId);

      expect(conversations).toEqual([]);
    });

    it('should handle table not found gracefully', async () => {
      const userId = 'user-123';
      const error = { code: '42P01' }; // Table does not exist
      mockFrom.select.mockResolvedValue({ data: null, error });

      const conversations = await service.getUserConversations(userId);

      expect(conversations).toEqual([]);
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const userId = 'user-123';
      const conversationData = {
        title: 'New Conversation',
        messages: [],
      };

      const mockCreated = {
        id: 'conv-2',
        user_id: userId,
        title: 'New Conversation',
        messages: [],
        created_at: '2025-01-29T00:00:00Z',
        updated_at: '2025-01-29T00:00:00Z',
      };

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({ data: mockCreated, error: null });

      const conversation = await service.createConversation(userId, conversationData);

      expect(conversation.id).toBe('conv-2');
      expect(conversation.title).toBe('New Conversation');
    });

    it('should validate required fields', async () => {
      const userId = 'user-123';
      const invalidData = { title: '' };

      await expect(
        service.createConversation(userId, invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('updateConversation', () => {
    it('should update conversation fields', async () => {
      const userId = 'user-123';
      const conversationId = 'conv-1';
      const updates = { title: 'Updated Title' };

      const mockUpdated = {
        id: conversationId,
        user_id: userId,
        title: 'Updated Title',
        messages: [],
        updated_at: '2025-01-29T00:00:00Z',
      };

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({ data: mockUpdated, error: null });

      const conversation = await service.updateConversation(userId, conversationId, updates);

      expect(conversation.title).toBe('Updated Title');
    });

    it('should ensure user owns conversation', async () => {
      const userId = 'user-123';
      const conversationId = 'conv-1';

      mockFrom.update.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      mockFrom.select.mockReturnThis();
      mockFrom.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      await expect(
        service.updateConversation(userId, conversationId, { title: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const userId = 'user-123';
      const conversationId = 'conv-1';

      mockFrom.delete.mockReturnThis();
      mockFrom.eq.mockReturnThis();
      const mockDelete = { eq: vi.fn().mockResolvedValue({ error: null }) };
      mockFrom.delete.mockReturnValue(mockDelete);

      await service.deleteConversation(userId, conversationId);

      expect(mockFrom.delete).toHaveBeenCalled();
    });
  });

  describe('migrateFromLocalStorage', () => {
    it('should migrate conversations from localStorage', async () => {
      const userId = 'user-123';
      
      // Mock localStorage
      const mockConversations = [
        {
          id: 'old-1',
          title: 'Old Conversation',
          messages: [],
          createdAt: Date.now(),
        },
      ];

      // Mock localStorage.getItem
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => JSON.stringify(mockConversations)),
          removeItem: vi.fn(),
        },
        writable: true,
      });

      mockFrom.insert.mockReturnThis();
      mockFrom.select.mockResolvedValue({ data: [{ id: 'new-1' }], error: null });

      const result = await service.migrateFromLocalStorage(userId);

      expect(result.success).toBe(true);
      expect(result.migrated).toBeGreaterThan(0);
    });

    it('should handle empty localStorage gracefully', async () => {
      const userId = 'user-123';
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          removeItem: vi.fn(),
        },
        writable: true,
      });

      const result = await service.migrateFromLocalStorage(userId);

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(0);
    });
  });
});
