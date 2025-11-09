/**
 * Unit Tests for useMessageManagement Hook
 * 
 * Tests message CRUD, streaming, branches, and computed values
 * Target: 80%+ coverage
 */

import { renderHook, act } from '@testing-library/react';
import { useMessageManagement } from '../useMessageManagement';
import type { Message, MessageBranch } from '../../types';

describe('useMessageManagement', () => {
  // ============================================================================
  // SETUP
  // ============================================================================
  
  const createMockMessage = (overrides?: Partial<Message>): Message => ({
    id: `msg-${Date.now()}`,
    role: 'user',
    content: 'Test message',
    timestamp: Date.now(),
    ...overrides,
  });
  
  const createMockBranch = (overrides?: Partial<MessageBranch>): MessageBranch => ({
    id: `branch-${Date.now()}`,
    content: 'Branch content',
    ...overrides,
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with empty messages by default', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.streamingMessage).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.hasMessages).toBe(false);
      expect(result.current.totalMessages).toBe(0);
    });
    
    it('should initialize with provided messages', () => {
      const initialMessages = [createMockMessage(), createMockMessage()];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages })
      );
      
      expect(result.current.messages).toEqual(initialMessages);
      expect(result.current.totalMessages).toBe(2);
      expect(result.current.hasMessages).toBe(true);
    });
  });
  
  // ============================================================================
  // MESSAGE CRUD
  // ============================================================================
  
  describe('message CRUD operations', () => {
    it('should add a message', () => {
      const { result } = renderHook(() => useMessageManagement());
      const message = createMockMessage();
      
      act(() => {
        result.current.addMessage(message);
      });
      
      expect(result.current.messages).toContain(message);
      expect(result.current.totalMessages).toBe(1);
    });
    
    it('should update a message by ID', () => {
      const message = createMockMessage({ id: 'msg-1', content: 'Original' });
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: [message] })
      );
      
      act(() => {
        result.current.updateMessage('msg-1', { content: 'Updated' });
      });
      
      expect(result.current.messages[0].content).toBe('Updated');
    });
    
    it('should delete a message by ID', () => {
      const message1 = createMockMessage({ id: 'msg-1' });
      const message2 = createMockMessage({ id: 'msg-2' });
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: [message1, message2] })
      );
      
      act(() => {
        result.current.deleteMessage('msg-1');
      });
      
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe('msg-2');
    });
    
    it('should clear all messages', () => {
      const { result } = renderHook(() => 
        useMessageManagement({ 
          initialMessages: [createMockMessage(), createMockMessage()] 
        })
      );
      
      act(() => {
        result.current.clearMessages();
      });
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.totalMessages).toBe(0);
    });
  });
  
  // ============================================================================
  // STREAMING OPERATIONS
  // ============================================================================
  
  describe('streaming operations', () => {
    it('should set streaming message', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      act(() => {
        result.current.setStreamingMessage('Streaming content');
      });
      
      expect(result.current.streamingMessage).toBe('Streaming content');
      expect(result.current.isStreaming).toBe(true);
    });
    
    it('should append to streaming message', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      act(() => {
        result.current.setStreamingMessage('Hello');
        result.current.appendStreamingMessage(' world');
      });
      
      expect(result.current.streamingMessage).toBe('Hello world');
    });
    
    it('should commit streaming message and clear stream', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      act(() => {
        result.current.setStreamingMessage('Streaming content');
      });
      
      let messageId: string;
      act(() => {
        messageId = result.current.commitStreamingMessage({
          role: 'assistant',
          reasoning: ['Step 1', 'Step 2'],
        });
      });
      
      expect(result.current.streamingMessage).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Streaming content');
      expect(result.current.messages[0].role).toBe('assistant');
      expect(result.current.messages[0].reasoning).toEqual(['Step 1', 'Step 2']);
    });
    
    it('should cancel streaming', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      act(() => {
        result.current.setStreamingMessage('Streaming content');
        result.current.cancelStreaming();
      });
      
      expect(result.current.streamingMessage).toBe('');
      expect(result.current.isStreaming).toBe(false);
    });
  });
  
  // ============================================================================
  // BRANCH OPERATIONS
  // ============================================================================
  
  describe('branch operations', () => {
    it('should add a branch to a message', () => {
      const message = createMockMessage({ id: 'msg-1' });
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: [message] })
      );
      const branch = createMockBranch();
      
      act(() => {
        result.current.addBranch('msg-1', branch);
      });
      
      expect(result.current.messages[0].branches).toContain(branch);
    });
    
    it('should switch to a different branch', () => {
      const message = createMockMessage({ 
        id: 'msg-1',
        branches: [
          createMockBranch({ id: 'branch-1' }),
          createMockBranch({ id: 'branch-2' }),
        ],
        currentBranch: 0,
      });
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: [message] })
      );
      
      act(() => {
        result.current.switchBranch('msg-1', 1);
      });
      
      expect(result.current.messages[0].currentBranch).toBe(1);
    });
  });
  
  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================
  
  describe('query operations', () => {
    it('should get message by ID', () => {
      const message = createMockMessage({ id: 'msg-1' });
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: [message] })
      );
      
      const found = result.current.getMessageById('msg-1');
      expect(found).toEqual(message);
    });
    
    it('should get last message', () => {
      const messages = [
        createMockMessage({ id: 'msg-1' }),
        createMockMessage({ id: 'msg-2' }),
      ];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: messages })
      );
      
      const last = result.current.getLastMessage();
      expect(last?.id).toBe('msg-2');
    });
    
    it('should get last assistant message', () => {
      const messages = [
        createMockMessage({ id: 'msg-1', role: 'user' }),
        createMockMessage({ id: 'msg-2', role: 'assistant' }),
        createMockMessage({ id: 'msg-3', role: 'user' }),
      ];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: messages })
      );
      
      const last = result.current.getLastAssistantMessage();
      expect(last?.id).toBe('msg-2');
    });
    
    it('should get user messages', () => {
      const messages = [
        createMockMessage({ role: 'user' }),
        createMockMessage({ role: 'assistant' }),
        createMockMessage({ role: 'user' }),
      ];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: messages })
      );
      
      const userMessages = result.current.getUserMessages();
      expect(userMessages).toHaveLength(2);
      expect(userMessages.every(m => m.role === 'user')).toBe(true);
    });
    
    it('should get assistant messages', () => {
      const messages = [
        createMockMessage({ role: 'user' }),
        createMockMessage({ role: 'assistant' }),
        createMockMessage({ role: 'assistant' }),
      ];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: messages })
      );
      
      const assistantMessages = result.current.getAssistantMessages();
      expect(assistantMessages).toHaveLength(2);
      expect(assistantMessages.every(m => m.role === 'assistant')).toBe(true);
    });
  });
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  describe('computed values', () => {
    it('should calculate message count correctly', () => {
      const messages = [
        createMockMessage({ role: 'user' }),
        createMockMessage({ role: 'assistant' }),
        createMockMessage({ role: 'user' }),
        createMockMessage({ role: 'assistant' }),
      ];
      const { result } = renderHook(() => 
        useMessageManagement({ initialMessages: messages })
      );
      
      expect(result.current.messageCount).toEqual({
        user: 2,
        assistant: 2,
      });
    });
    
    it('should update computed values when messages change', () => {
      const { result } = renderHook(() => useMessageManagement());
      
      expect(result.current.hasMessages).toBe(false);
      expect(result.current.totalMessages).toBe(0);
      
      act(() => {
        result.current.addMessage(createMockMessage());
      });
      
      expect(result.current.hasMessages).toBe(true);
      expect(result.current.totalMessages).toBe(1);
    });
  });
});


