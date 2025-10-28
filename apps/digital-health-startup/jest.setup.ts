/**
 * Jest Test Setup
 *
 * Global test configuration and utilities.
 * Runs before all tests.
 *
 * @see https://jestjs.io/docs/configuration#setupfilesafterenv-array
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// ============================================================================
// POLYFILLS
// ============================================================================

// TextEncoder/TextDecoder (required for Edge runtime testing)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Fetch API mock (if needed)
if (!global.fetch) {
  global.fetch = jest.fn();
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

// Use Object.assign to bypass TypeScript read-only restrictions
Object.assign(process.env, {
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  OPENAI_API_KEY: 'sk-test-key',
  JWT_SECRET: 'test-jwt-secret',
  ENCRYPTION_KEY: 'test-encryption-key-32-characters',
  CSRF_SECRET: 'test-csrf-secret'
});

// ============================================================================
// MOCK MODULES
// ============================================================================

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// ============================================================================
// GLOBAL TEST UTILITIES
// ============================================================================

/**
 * Wait for async updates to complete
 */
export async function waitForAsync(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create mock fetch response
 */
export function createMockResponse<T>(data: T, options: { status?: number } = {}): Response {
  return new Response(JSON.stringify(data), {
    status: options.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// ============================================================================
// CONSOLE SUPPRESSION (Optional)
// ============================================================================

// Suppress console errors/warnings in tests (remove if you want to see them)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// ============================================================================
// CLEANUP
// ============================================================================

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
