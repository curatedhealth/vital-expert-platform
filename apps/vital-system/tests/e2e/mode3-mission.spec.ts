import { test, expect } from '@playwright/test';

test('Mode 3 mission runs', async ({ page }) => {
  await page.goto('/ask-expert');

  // Adjust selectors to your UI; assuming data-test hooks exist
  await page.click('[data-test="agent-item"]:first-child');
  await page.click('[data-test="mode-selector"]');
  await page.click('[data-test="mode-3"]');

  // Expand mission setup accordion
  await page.click('text=Mission Setup');
  await page.fill('textarea#objective', 'Test mission objective');
  await page.click('button:has-text("Start Mission")');

  // Expect to see mission UI elements
  await expect(page.getByText(/Mission/)).toBeVisible();
});
