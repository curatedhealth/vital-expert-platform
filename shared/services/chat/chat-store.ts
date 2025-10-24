'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Agent } from '../agents/agents-store';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    confidence?: number;
    mode?: string;
    panelAgents?: string[];
  };
}

export interface Chat {
  id: string;
  title: string;
  agentId?: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
  metadata?: {
    type: '1:1' | 'panel' | 'workflow' | 'solution';
    status?: 'active' | 'completed' | 'archived';
  };
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createNewChat: (agent?: Agent) => string;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, agent?: Agent) => Promise<void>;
  addMessage: (message: Message) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  clearCurrentChat: () => void;
  clearError: () => void;
}

export const __useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      messages: [],
      isLoading: false,
      error: null,

      createNewChat: (agent?: Agent) => {
        const newChat: Chat = {
          id: `chat_${Date.now()}`,
          title: agent ? `Chat with ${agent.name}` : 'New Chat',
          agentId: agent?.id,
          messages: [],
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {
            type: '1:1',
            status: 'active'
          }
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          currentChat: newChat,
          messages: []
        }));

        return newChat.id;
      },

      selectChat: (chatId: string) => {

        if (chat) {
          set({
            currentChat: chat,
            messages: chat.messages
          });
        }
      },

      sendMessage: async (content: string, agent?: Agent) => {

        if (!state.currentChat) return;

        const userMessage: Message = {
          id: `msg_${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date()
        };

        // Add user message immediately
        set(state => ({
          messages: [...state.messages, userMessage],
          isLoading: true
        }));

        try {
          // Use enhanced chat API for expert agent interactions
          const response = await fetch('/api/chat/enhanced', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              agents: agent ? [agent.id] : undefined, // Preferred agent for expert mode
              mode: agent ? 'expert' : 'auto', // Expert mode for single-agent conversations
              context: {
                user_id: 'anonymous', // Will be enhanced with actual user auth
                session_id: state.currentChat.id,
                timestamp: new Date().toISOString(),
                compliance_level: 'HIGH',
                audit_required: true
              }
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get response');
          }

          // Handle streaming response from enhanced chat API
          const reader = response.body?.getReader();

          if (!reader) {
            throw new Error('No response body available');
          }

          // Create placeholder assistant message for streaming
          const assistantMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            metadata: { /* TODO: implement */ }
          };

          // Add empty assistant message to show streaming
          set(state => ({
            messages: [...state.messages, assistantMessage],
            isLoading: true
          }));

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {

                    if (data.type === 'content') {
                      fullContent = data.fullContent;

                      // Update message content in real-time
                      set(state => ({
                        messages: state.messages.map(msg =>
                          msg.id === assistantMessage.id
                            ? { ...msg, content: fullContent }
                            : msg
                        )
                      }));
                    } else if (data.type === 'metadata') {
                      finalMetadata = data.metadata;
                    } else if (data.type === 'error') {
                      throw new Error(data.error);
                    }
                  } catch (parseError) {
                    // console.warn('Failed to parse SSE data:', parseError);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // Final update with complete message and metadata
          set(state => {
            const updatedMessages = state.messages.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullContent, metadata: finalMetadata }
                : msg
            );

            const updatedChat = {
              ...state.currentChat!,
              messages: updatedMessages,
              updated_at: new Date()
            };

            return {
              messages: updatedMessages,
              currentChat: updatedChat,
              chats: state.chats.map(chat =>
                chat.id === updatedChat.id ? updatedChat : chat
              ),
              isLoading: false
            };
          });

        } catch (error) {
          // console.error('Failed to send message:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false
          });
        }
      },

      addMessage: (message: Message) => {
        set(state => ({
          messages: [...state.messages, message]
        }));
      },

      updateChatTitle: (chatId: string, title: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, title, updated_at: new Date() }
              : chat
          ),
          currentChat: state.currentChat?.id === chatId
            ? { ...state.currentChat, title, updated_at: new Date() }
            : state.currentChat
        }));
      },

      deleteChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
          messages: state.currentChat?.id === chatId ? [] : state.messages
        }));
      },

      clearCurrentChat: () => {
        set({
          currentChat: null,
          messages: []
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
      }),
    }
  )
);