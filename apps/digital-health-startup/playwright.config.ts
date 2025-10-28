/**
 * Playwright E2E Testing Configuration
 *
 * Features:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Parallel execution
 * - Video recording on failure
 * - Screenshot on failure
 * - Trace collection
 * - CI/CD integration
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // ============================================================================
  // TEST DIRECTORY
  // ============================================================================
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',

  // ============================================================================
  // TEST EXECUTION
  // ============================================================================
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit parallelism in CI
  timeout: 30_000, // 30 second timeout per test

  // ============================================================================
  // REPORTER
  // ============================================================================
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'playwright-report/junit.xml' }],
        ['github'],
      ]
    : [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
      ],

  // ============================================================================
  // SHARED SETTINGS
  // ============================================================================
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Accept downloads */
    acceptDownloads: true,

    /* Locale */
    locale: 'en-US',

    /* Timezone */
    timezoneId: 'America/New_York',

    /* Viewport */
    viewport: { width: 1280, height: 720 },

    /* Permissions */
    permissions: [],

    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US',
    },
  },

  // ============================================================================
  // PROJECTS (Browsers)
  // ============================================================================
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'microsoft-edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'google-chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // ============================================================================
  // WEB SERVER (Dev Server)
  // ============================================================================
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // 2 minutes to start
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // ============================================================================
  // OUTPUT DIRECTORY
  // ============================================================================
  outputDir: 'test-results/',
});
