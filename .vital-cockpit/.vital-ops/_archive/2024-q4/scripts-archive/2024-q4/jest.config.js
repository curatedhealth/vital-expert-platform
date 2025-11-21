const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapping for path aliases
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/shared/components/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/services/(.*)$': '<rootDir>/src/shared/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/shared/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/shared/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/tools/(.*)$': '<rootDir>/tools/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',

    // Handle static file imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(js|jsx|ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(js|jsx|ts|tsx)',
    '!src/**/index.(js|jsx|ts|tsx)',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],

  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Healthcare critical components should have higher coverage
    './src/features/clinical/**/*.{ts,tsx}': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/features/compliance/**/*.{ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Test timeout (important for async healthcare operations)
  testTimeout: 10000,

  // Global test setup
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    '^.+\\.jsx?$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module file extensions for resolving modules
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Verbose output for healthcare compliance testing
  verbose: true,

  // Error handling for healthcare safety
  errorOnDeprecated: true,

  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.(test|spec).(js|jsx|ts|tsx)'],
      testEnvironment: 'jest-environment-jsdom',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).(js|jsx|ts|tsx)'],
      testEnvironment: 'jest-environment-node',
    },
    {
      displayName: 'compliance',
      testMatch: ['<rootDir>/tests/compliance/**/*.(test|spec).(js|jsx|ts|tsx)'],
      testEnvironment: 'jest-environment-node',
      setupFilesAfterEnv: ['<rootDir>/tests/compliance/setup.js'],
    },
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'VITAL Path Healthcare AI Platform',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'coverage',
        filename: 'test-report.html',
        expand: true,
      },
    ],
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);