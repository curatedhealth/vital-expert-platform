/**
 * Token counting utilities stub
 * TODO: Implement proper token counting with tiktoken when chat feature is developed
 */

export interface TokenCountResult {
  tokens: number;
  characters: number;
  words: number;
}

// Rough approximation: ~4 characters per token for English text
const CHARS_PER_TOKEN = 4;

export const countTokens = (text: string): number => {
  if (!text) return 0;
  // This is a rough approximation
  // TODO: Use tiktoken or similar for accurate counts
  return Math.ceil(text.length / CHARS_PER_TOKEN);
};

export const countTokensInMessages = (messages: { content: string }[]): number => {
  return messages.reduce((total, msg) => total + countTokens(msg.content), 0);
};

export const analyzeText = (text: string): TokenCountResult => {
  const characters = text.length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const tokens = countTokens(text);

  return {
    tokens,
    characters,
    words,
  };
};

export const estimateCost = (
  tokens: number,
  costPerThousandTokens: number
): number => {
  return (tokens / 1000) * costPerThousandTokens;
};

export const isWithinTokenLimit = (text: string, limit: number): boolean => {
  return countTokens(text) <= limit;
};

export default {
  countTokens,
  countTokensInMessages,
  analyzeText,
  estimateCost,
  isWithinTokenLimit,
};
