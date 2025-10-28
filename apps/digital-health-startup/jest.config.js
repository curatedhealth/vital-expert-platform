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
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.ts',
        '<rootDir>/src/**/__tests__/**/*.test.tsx'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/integration/',
        '\\.integration\\.test\\.',
        '\\.e2e\\.test\\.'
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
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
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
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
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
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
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
  coverageDirectory: '<rootDir>/coverage',

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
