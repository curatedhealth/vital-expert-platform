import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * 
 * Tests critical authentication flows:
 * - Login flow
 * - Logout flow
 * - Protected route access
 * - Session persistence
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Check if redirected to auth page
    await expect(page).toHaveURL(/.*auth.*/);
    
    // Verify sign in button exists
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should allow user to sign in with email/password', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/auth/signin');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click sign in
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or home
    await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
    
    // Verify user is logged in
    const userMenu = page.getByRole('button', { name: /user menu/i }).or(
      page.locator('[data-testid="user-menu"]')
    );
    await expect(userMenu).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Click sign in
    await page.click('button[type="submit"]');
    
    // Wait for error message
    const errorMessage = page.getByText(/invalid credentials|incorrect password/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should allow user to sign out', async ({ page, context }) => {
    // Assume user is already signed in (set up session)
    // This would typically use a session fixture
    
    await page.goto('/dashboard');
    
    // Open user menu
    const userMenu = page.getByRole('button', { name: /user menu/i }).or(
      page.locator('[data-testid="user-menu"]')
    );
    await userMenu.click();
    
    // Click sign out
    const signOutButton = page.getByRole('menuitem', { name: /sign out|logout/i });
    await signOutButton.click();
    
    // Verify redirect to auth page
    await page.waitForURL(/.*auth.*/);
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to auth
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('should persist session across page reloads', async ({ page, context }) => {
    // Sign in
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*dashboard.*/);
    
    // Reload page
    await page.reload();
    
    // Verify still logged in
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    const userMenu = page.getByRole('button', { name: /user menu/i }).or(
      page.locator('[data-testid="user-menu"]')
    );
    await expect(userMenu).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password|reset password/i });
    await forgotPasswordLink.click();
    
    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success message
    const successMessage = page.getByText(/check your email|reset link sent/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe('OAuth Authentication', () => {
  test.skip('should allow sign in with Google OAuth', async ({ page }) => {
    // This test would require OAuth provider setup
    // Skipping for now, but structure is here
    await page.goto('/auth/signin');
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();
    
    // Would handle OAuth flow here
  });

  test.skip('should allow sign in with GitHub OAuth', async ({ page }) => {
    // Similar to Google OAuth test
    await page.goto('/auth/signin');
    
    const githubButton = page.getByRole('button', { name: /sign in with github/i });
    await githubButton.click();
    
    // Would handle OAuth flow here
  });
});

test.describe('Session Management', () => {
  test('should expire session after inactivity', async ({ page }) => {
    // This would require session timeout configuration
    // Placeholder for session expiration testing
    test.skip();
  });

  test('should refresh session token before expiration', async ({ page }) => {
    // Placeholder for session refresh testing
    test.skip();
  });
});

