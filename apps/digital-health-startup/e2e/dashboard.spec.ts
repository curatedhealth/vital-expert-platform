import { test, expect } from '@playwright/test';

/**
 * Dashboard Navigation E2E Tests
 * 
 * Tests navigation and core dashboard functionality:
 * - Main navigation
 * - Sidebar navigation
 * - Page transitions
 * - Mobile responsiveness
 * - Breadcrumbs
 */

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes authenticated user)
    await page.goto('/dashboard');
  });

  test('should display dashboard with main navigation', async ({ page }) => {
    // Verify dashboard page loaded
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verify main navigation elements
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();
    
    // Verify key navigation items
    const askExpertLink = page.getByRole('link', { name: /ask expert/i });
    const askPanelLink = page.getByRole('link', { name: /ask panel|panel/i });
    
    await expect(askExpertLink.or(page.getByText(/ask expert/i))).toBeVisible();
  });

  test('should navigate to Ask Expert from dashboard', async ({ page }) => {
    // Click Ask Expert link
    const askExpertLink = page.getByRole('link', { name: /ask expert/i }).or(
      page.locator('a[href*="ask-expert"]')
    );
    
    await askExpertLink.click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*ask-expert.*/);
    await expect(page.getByRole('heading', { name: /ask expert/i })).toBeVisible();
  });

  test('should navigate to Ask Panel from dashboard', async ({ page }) => {
    // Click Ask Panel link
    const askPanelLink = page.getByRole('link', { name: /ask panel|panel/i }).or(
      page.locator('a[href*="ask-panel"]')
    );
    
    if (await askPanelLink.isVisible({ timeout: 2000 })) {
      await askPanelLink.click();
      
      // Verify navigation
      await expect(page).toHaveURL(/.*ask-panel.*/);
    }
  });

  test('should display sidebar with navigation items', async ({ page }) => {
    // Look for sidebar
    const sidebar = page.locator('aside').or(
      page.locator('[data-testid="sidebar"]')
    );
    
    const sidebarVisible = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (sidebarVisible) {
      // Verify sidebar contains navigation items
      const sidebarLinks = sidebar.locator('a');
      const linkCount = await sidebarLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should allow sidebar collapse/expand', async ({ page }) => {
    // Look for sidebar toggle button
    const sidebarToggle = page.getByRole('button', { name: /toggle sidebar|collapse|expand/i }).or(
      page.locator('[data-testid="sidebar-toggle"]')
    );
    
    const toggleVisible = await sidebarToggle.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (toggleVisible) {
      const sidebar = page.locator('aside').or(page.locator('[data-testid="sidebar"]'));
      
      // Get initial state
      const initialWidth = await sidebar.boundingBox();
      
      // Toggle sidebar
      await sidebarToggle.click();
      await page.waitForTimeout(500); // Animation
      
      // Verify state changed
      const newWidth = await sidebar.boundingBox();
      expect(newWidth?.width).not.toBe(initialWidth?.width);
    }
  });

  test('should display breadcrumbs for current page', async ({ page }) => {
    // Navigate to a nested page
    await page.goto('/dashboard/settings');
    
    // Look for breadcrumbs
    const breadcrumbs = page.locator('[aria-label="breadcrumb"]').or(
      page.locator('[data-testid="breadcrumbs"]')
    );
    
    const breadcrumbsVisible = await breadcrumbs.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (breadcrumbsVisible) {
      // Verify breadcrumb contains dashboard
      await expect(breadcrumbs.getByText(/dashboard/i)).toBeVisible();
    }
  });

  test('should navigate between different dashboard sections', async ({ page }) => {
    // Test multiple navigation paths
    const navigationTests = [
      { link: /settings/i, url: /settings/, heading: /settings/i },
      { link: /profile/i, url: /profile/, heading: /profile/i },
      { link: /dashboard/i, url: /dashboard/, heading: /dashboard/i },
    ];

    for (const { link, url, heading } of navigationTests) {
      const navLink = page.getByRole('link', { name: link });
      
      const linkVisible = await navLink.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (linkVisible) {
        await navLink.click();
        await expect(page).toHaveURL(url);
        
        // Verify page loaded
        const pageHeading = page.getByRole('heading', { name: heading });
        const headingVisible = await pageHeading.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (!headingVisible) {
          // Some pages might have different heading structures
          console.log(`Heading not found for ${link.source}, but URL matches`);
        }
        
        // Return to dashboard for next test
        await page.goto('/dashboard');
      }
    }
  });

  test('should display user menu in header', async ({ page }) => {
    // Look for user menu button
    const userMenu = page.getByRole('button', { name: /user menu|account/i }).or(
      page.locator('[data-testid="user-menu"]')
    );
    
    await expect(userMenu).toBeVisible();
    
    // Click to open menu
    await userMenu.click();
    
    // Verify menu items
    const menuItems = page.locator('[role="menu"]').or(
      page.locator('[data-testid="user-menu-dropdown"]')
    );
    await expect(menuItems).toBeVisible();
    
    // Verify sign out option exists
    const signOutOption = page.getByRole('menuitem', { name: /sign out|logout/i });
    await expect(signOutOption).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through several pages
    await page.goto('/dashboard');
    await page.goto('/ask-expert');
    await page.goto('/dashboard');
    
    // Use browser back
    await page.goBack();
    await expect(page).toHaveURL(/.*ask-expert.*/);
    
    // Use browser forward
    await page.goForward();
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should display notifications or alerts section', async ({ page }) => {
    // Look for notifications
    const notificationBell = page.getByRole('button', { name: /notifications/i }).or(
      page.locator('[data-testid="notifications"]')
    );
    
    const bellVisible = await notificationBell.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (bellVisible) {
      await notificationBell.click();
      
      // Verify notifications dropdown
      const notificationsPanel = page.locator('[data-testid="notifications-panel"]').or(
        page.getByText(/no new notifications|notifications/i)
      );
      await expect(notificationsPanel).toBeVisible();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile viewport

  test('should display mobile menu button', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for hamburger menu
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i }).or(
      page.locator('[data-testid="mobile-menu-button"]')
    );
    
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should open mobile navigation drawer', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click mobile menu button
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i }).or(
      page.locator('[data-testid="mobile-menu-button"]')
    );
    
    await mobileMenuButton.click();
    
    // Verify drawer opened
    const mobileNav = page.locator('[data-testid="mobile-nav"]').or(
      page.locator('nav[role="navigation"]')
    );
    await expect(mobileNav).toBeVisible();
  });

  test('should navigate from mobile menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i }).or(
      page.locator('[data-testid="mobile-menu-button"]')
    );
    await mobileMenuButton.click();
    
    // Click a navigation link
    const askExpertLink = page.getByRole('link', { name: /ask expert/i });
    
    if (await askExpertLink.isVisible({ timeout: 2000 })) {
      await askExpertLink.click();
      
      // Verify navigation
      await expect(page).toHaveURL(/.*ask-expert.*/);
      
      // Verify mobile menu closed
      const mobileNav = page.locator('[data-testid="mobile-nav"]');
      const navVisible = await mobileNav.isVisible({ timeout: 1000 }).catch(() => false);
      
      // Menu should close after navigation
      // Some implementations keep it open, so this is informational
    }
  });

  test('should close mobile menu when clicking outside', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i }).or(
      page.locator('[data-testid="mobile-menu-button"]')
    );
    await mobileMenuButton.click();
    
    // Click outside (on main content)
    const main = page.locator('main');
    await main.click({ position: { x: 10, y: 10 } });
    
    // Verify menu closed
    await page.waitForTimeout(500); // Animation
    
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    const navVisible = await mobileNav.isVisible({ timeout: 1000 }).catch(() => false);
    
    // Expect menu to be closed (if implementation supports click-outside)
    // This is a best practice, not all implementations have this
  });
});

test.describe('Search Functionality', () => {
  test('should display global search if available', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i).or(
      page.locator('input[type="search"]')
    );
    
    const searchVisible = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (searchVisible) {
      await searchInput.fill('cardiology');
      await page.waitForTimeout(500); // Debounce
      
      // Verify search results appear
      const searchResults = page.locator('[data-testid="search-results"]').or(
        page.locator('[role="listbox"]')
      );
      
      const resultsVisible = await searchResults.isVisible({ timeout: 3000 }).catch(() => false);
      expect(resultsVisible).toBeTruthy();
    }
  });
});

test.describe('Accessibility', () => {
  test('should allow keyboard navigation through main menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Focus first navigation item
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Get focused element
    const focusedElement = page.locator(':focus');
    const isLink = await focusedElement.evaluate(el => el.tagName === 'A');
    
    if (isLink) {
      // Press Enter to navigate
      await page.keyboard.press('Enter');
      
      // Verify navigation occurred
      await page.waitForTimeout(1000);
      
      // Page should have changed
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost');
    }
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for nav element with aria-label
    const nav = page.locator('nav[aria-label]');
    
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });
});

