import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Check for login elements
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should show validation errors for invalid credentials', async ({ page }) => {
    await page.fill('[name="email"]', 'invalid@email');
    await page.fill('[name="password"]', '123');
    await page.click('button[type="submit"]');

    // Expect validation error
    await expect(page.getByText(/invalid|error/i)).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Use test credentials
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@vital.ai');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/dashboard|home/);
    await expect(page).toHaveURL(/dashboard|home/);
  });

  test('should allow logout', async ({ page }) => {
    // Login first
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@vital.ai');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should be back at login
    await expect(page).toHaveURL(/login|signin/);
  });
});










