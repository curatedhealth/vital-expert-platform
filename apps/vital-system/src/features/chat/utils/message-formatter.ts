/**
 * Message formatting utilities stub
 * TODO: Implement message formatting when chat feature is developed
 */

import type { Message } from '../types/conversation.types';

export interface FormatOptions {
  includeTimestamp?: boolean;
  includeRole?: boolean;
  maxLength?: number;
}

export const formatMessage = (
  message: Message,
  options: FormatOptions = {}
): string => {
  const { includeTimestamp = false, includeRole = false, maxLength } = options;

  let formatted = message.content;

  if (includeRole) {
    formatted = `[${message.role}]: ${formatted}`;
  }

  if (includeTimestamp) {
    const timestamp = message.timestamp.toISOString();
    formatted = `${timestamp} ${formatted}`;
  }

  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...';
  }

  return formatted;
};

export const formatMessages = (
  messages: Message[],
  options: FormatOptions = {}
): string[] => {
  return messages.map(m => formatMessage(m, options));
};

export const joinMessages = (
  messages: Message[],
  separator = '\n'
): string => {
  return messages.map(m => m.content).join(separator);
};

export const parseMarkdown = (content: string): string => {
  // TODO: Implement markdown parsing
  return content;
};

export default {
  formatMessage,
  formatMessages,
  joinMessages,
  parseMarkdown,
};
