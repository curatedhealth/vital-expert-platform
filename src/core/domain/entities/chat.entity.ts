/**
 * Chat Entity - Core domain entity for chat conversations
 * 
 * Represents a chat conversation with messages, metadata, and state.
 * This entity manages the conversation flow and message history.
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agentId?: string;
  metadata?: {
    citations?: string[];
    sources?: string[];
    reasoning?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    processingTime?: number;
    workflowStep?: string;
  };
  attachments?: unknown[];
  isLoading?: boolean;
}

export interface ChatMetadata {
  title: string;
  mode: 'manual' | 'automatic';
  interactionType: 'interactive' | 'autonomous';
  agentId?: string;
  agentName?: string;
  totalMessages: number;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export class Chat {
  constructor(
    public readonly id: string,
    public readonly messages: ChatMessage[],
    public readonly metadata: ChatMetadata,
    public readonly isActive: boolean = true
  ) {}

  /**
   * Add a new message to the chat
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Chat {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const updatedMessages = [...this.messages, newMessage];
    const updatedMetadata = {
      ...this.metadata,
      totalMessages: updatedMessages.length,
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    return new Chat(this.id, updatedMessages, updatedMetadata, this.isActive);
  }

  /**
   * Update an existing message
   */
  updateMessage(messageId: string, updates: Partial<ChatMessage>): Chat {
    const updatedMessages = this.messages.map(msg =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );

    const updatedMetadata = {
      ...this.metadata,
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    return new Chat(this.id, updatedMessages, updatedMetadata, this.isActive);
  }

  /**
   * Get the last message in the chat
   */
  getLastMessage(): ChatMessage | null {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  /**
   * Get the last user message
   */
  getLastUserMessage(): ChatMessage | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'user') {
        return this.messages[i];
      }
    }
    return null;
  }

  /**
   * Get the last assistant message
   */
  getLastAssistantMessage(): ChatMessage | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        return this.messages[i];
      }
    }
    return null;
  }

  /**
   * Get messages by role
   */
  getMessagesByRole(role: 'user' | 'assistant' | 'system'): ChatMessage[] {
    return this.messages.filter(msg => msg.role === role);
  }

  /**
   * Get total token usage
   */
  getTotalTokenUsage(): number {
    return this.messages.reduce((total, msg) => {
      return total + (msg.metadata?.tokenUsage?.totalTokens || 0);
    }, 0);
  }

  /**
   * Get average processing time
   */
  getAverageProcessingTime(): number {
    const messagesWithTime = this.messages.filter(msg => 
      msg.metadata?.processingTime && msg.role === 'assistant'
    );
    
    if (messagesWithTime.length === 0) return 0;
    
    const totalTime = messagesWithTime.reduce((total, msg) => 
      total + (msg.metadata?.processingTime || 0), 0
    );
    
    return totalTime / messagesWithTime.length;
  }

  /**
   * Check if chat is empty
   */
  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  /**
   * Check if chat has unread messages
   */
  hasUnreadMessages(): boolean {
    return this.messages.some(msg => 
      msg.role === 'assistant' && msg.isLoading === true
    );
  }

  /**
   * Get conversation summary
   */
  getSummary(): string {
    if (this.messages.length === 0) {
      return 'Empty conversation';
    }

    const userMessages = this.getMessagesByRole('user');
    const assistantMessages = this.getMessagesByRole('assistant');

    return `Conversation with ${assistantMessages.length} responses to ${userMessages.length} user messages`;
  }

  /**
   * Export chat data
   */
  export(): {
    id: string;
    messages: ChatMessage[];
    metadata: ChatMetadata;
    summary: string;
    statistics: {
      totalMessages: number;
      totalTokens: number;
      averageProcessingTime: number;
      userMessages: number;
      assistantMessages: number;
    };
  } {
    return {
      id: this.id,
      messages: this.messages,
      metadata: this.metadata,
      summary: this.getSummary(),
      statistics: {
        totalMessages: this.messages.length,
        totalTokens: this.getTotalTokenUsage(),
        averageProcessingTime: this.getAverageProcessingTime(),
        userMessages: this.getMessagesByRole('user').length,
        assistantMessages: this.getMessagesByRole('assistant').length
      }
    };
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      messages: this.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString(),
        lastActivity: this.metadata.lastActivity.toISOString()
      },
      isActive: this.isActive
    };
  }

  /**
   * Create a copy with updated fields
   */
  withUpdates(updates: Partial<Pick<Chat, 'messages' | 'metadata' | 'isActive'>>): Chat {
    return new Chat(
      this.id,
      updates.messages ?? this.messages,
      updates.metadata ?? this.metadata,
      updates.isActive ?? this.isActive
    );
  }

  /**
   * Validate chat data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === '') {
      errors.push('Chat ID is required');
    }

    if (!this.metadata.title || this.metadata.title.trim() === '') {
      errors.push('Chat title is required');
    }

    if (this.metadata.totalMessages < 0) {
      errors.push('Total messages cannot be negative');
    }

    if (this.metadata.totalTokens < 0) {
      errors.push('Total tokens cannot be negative');
    }

    // Validate each message
    this.messages.forEach((msg, index) => {
      if (!msg.id || msg.id.trim() === '') {
        errors.push(`Message ${index + 1} is missing ID`);
      }
      if (!msg.content || msg.content.trim() === '') {
        errors.push(`Message ${index + 1} is missing content`);
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push(`Message ${index + 1} has invalid role: ${msg.role}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
