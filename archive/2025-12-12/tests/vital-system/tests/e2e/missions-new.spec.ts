/**
 * Playwright E2E Test: /missions/new Happy Path
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

const SELECTORS = {
  objectiveInput: '[data-testid="objective-input"]',
  mode3Button: '[data-testid="mode-3-button"]',
  submitButton: '[data-testid="submit-mission"]',
  statusBadge: '[data-testid="status-badge"]',
  planContainer: '[data-testid="mission-plan"]',
  artifactCard: '[data-testid="artifact-card"]',
  successBanner: '[data-testid="success-banner"]',
  finalReport: '[data-testid="final-report"]',
};

const TEST_OBJECTIVE =
  'Analyze FDA regulatory pathway for a novel GLP-1 agonist for Type 2 diabetes treatment';

test.describe('Missions New Page - Mode 3 Happy Path', () => {
  test('basic happy path', async ({ page }) => {
    test.setTimeout(120000);

    // If auth is required, add a login helper here.
    await page.goto(`${BASE_URL}/missions/new`);

    await page.fill(SELECTORS.objectiveInput, TEST_OBJECTIVE);
    await page.click(SELECTORS.mode3Button);
    await page.click(SELECTORS.submitButton);

    await expect(page.locator(SELECTORS.statusBadge)).toContainText(/planning|running/i, {
      timeout: 15000,
    });
    await expect(page.locator(SELECTORS.planContainer)).toBeVisible({ timeout: 30000 });
    await expect(page.locator(SELECTORS.artifactCard).first()).toBeVisible({ timeout: 90000 });

    await expect(page.locator(SELECTORS.statusBadge)).toContainText(/completed|done/i, {
      timeout: 120000,
    });
    await expect(page.locator(SELECTORS.successBanner)).toBeVisible();
    await expect(page.locator(SELECTORS.finalReport)).toBeVisible();
  });
});
