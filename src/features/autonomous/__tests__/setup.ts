// Test setup file
import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mocked-hash')
  }))
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

// Mock LangChain OpenAI
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
    stream: jest.fn(),
    bindTools: jest.fn()
  }))
}));

// Mock enhanced langchain service
jest.mock('../../chat/services/enhanced-langchain-service', () => ({
  createEnhancedLangChainService: jest.fn(() => ({
    processQuery: jest.fn(),
    streamQuery: jest.fn()
  }))
}));

// Set test timeout
jest.setTimeout(30000);
