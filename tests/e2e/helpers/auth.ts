import { Page } from '@playwright/test';

/**
 * Login helper for E2E tests
 */
export async function login(page: Page, options?: { email?: string; password?: string }) {
  const email = options?.email || process.env.TEST_USER_EMAIL || 'test@vital.ai';
  const password = options?.password || process.env.TEST_USER_PASSWORD || 'testpassword';

  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for successful login
  await page.waitForURL(/dashboard|home|ask-expert/, { timeout: 30000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(/login|signin/);
}

/**
 * Create authenticated context for parallel tests
 */
export async function createAuthenticatedContext(browser: any) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  await context.storageState({ path: 'tests/e2e/.auth/user.json' });
  await page.close();
  return context;
}



















