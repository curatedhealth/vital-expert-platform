/**
 * Jest Configuration
 *
 * Multi-project setup for unit, integration, and compliance tests
 */

module.exports = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',

  // Root directory
  rootDir: '.',

  // Multi-project configuration
  projects: [
    // Unit tests
    {
      displayName: 'unit',
      testEnvironment: 'jsdom', // Changed from 'node' to 'jsdom' for React component testing
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/src/**/__tests__/**/*.test.tsx',
        '<rootDir>/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/**/*.test.tsx'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/integration/',
        '\\.integration\\.test\\.',
        '\\.e2e\\.test\\.',
        'src/lib/security/__tests__/csrf.test.ts',
        'src/lib/security/__tests__/rate-limiter.test.ts',
        'src/app/api/expert/__tests__/'
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true
          }
        }]
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(uncrypto)/)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/lib/tenant$': '<rootDir>/src/lib/constants/tenant',
        '^@vital/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
        '^@vital/(.*)$': '<rootDir>/../../packages/$1/src'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    },

    // Integration tests
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/*.integration.test.ts',
        '<rootDir>/tests/integration/**/*.test.ts'
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true
          }
        }]
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(uncrypto)/)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/lib/tenant$': '<rootDir>/src/lib/constants/tenant',
        '^@vital/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
        '^@vital/(.*)$': '<rootDir>/../../packages/$1/src'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
      testTimeout: 30000 // 30s for integration tests
    },

    // Compliance tests
    {
      displayName: 'compliance',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/compliance/**/*.test.ts'
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true
          }
        }]
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(uncrypto)/)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/lib/tenant$': '<rootDir>/src/lib/constants/tenant',
        '^@vital/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
        '^@vital/(.*)$': '<rootDir>/../../packages/$1/src'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    }
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/../../tests/coverage/vital-system',

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true
};
