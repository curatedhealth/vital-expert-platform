import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

/**
 * Ask Expert Feature E2E Tests
 */
test.describe('Ask Expert', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/ask-expert');
  });

  test('should display ask expert interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ask expert/i })).toBeVisible();
    await expect(page.getByPlaceholder(/ask a question|type your question/i)).toBeVisible();
  });

  test('should allow mode selection', async ({ page }) => {
    // Check all 4 modes are available
    await expect(page.getByText(/mode 1|quick answer/i)).toBeVisible();
    await expect(page.getByText(/mode 2|smart select/i)).toBeVisible();
    await expect(page.getByText(/mode 3|deep research/i)).toBeVisible();
    await expect(page.getByText(/mode 4|panel discussion/i)).toBeVisible();
  });

  test('should submit question in Mode 1 (Quick Answer)', async ({ page }) => {
    // Select Mode 1
    await page.click('[data-testid="mode-1"]');

    // Enter question
    await page.fill('[data-testid="question-input"]', 'What is clinical trial Phase 3?');

    // Submit
    await page.click('[data-testid="submit-question"]');

    // Wait for response (streaming)
    await expect(page.getByTestId('response-container')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('response-text')).not.toBeEmpty({ timeout: 60000 });
  });

  test('should show expert selection in Mode 2', async ({ page }) => {
    // Select Mode 2
    await page.click('[data-testid="mode-2"]');

    // Enter question
    await page.fill('[data-testid="question-input"]', 'How do I design a clinical trial?');

    // Submit
    await page.click('[data-testid="submit-question"]');

    // Should show expert being selected
    await expect(page.getByText(/selecting expert|finding expert/i)).toBeVisible({ timeout: 10000 });

    // Wait for response
    await expect(page.getByTestId('response-container')).toBeVisible({ timeout: 60000 });
  });

  test('should handle Mode 3 async job', async ({ page }) => {
    // Select Mode 3
    await page.click('[data-testid="mode-3"]');

    // Select an expert
    await page.click('[data-testid="expert-selector"]');
    await page.click('[data-testid="expert-option"]:first-child');

    // Enter question
    await page.fill('[data-testid="question-input"]', 'Perform deep research on mRNA vaccine development');

    // Submit
    await page.click('[data-testid="submit-question"]');

    // Should show job started
    await expect(page.getByText(/job started|processing/i)).toBeVisible({ timeout: 10000 });

    // Should show progress
    await expect(page.getByTestId('job-progress')).toBeVisible();
  });

  test('should display conversation history', async ({ page }) => {
    // Submit a question first
    await page.click('[data-testid="mode-1"]');
    await page.fill('[data-testid="question-input"]', 'Test question');
    await page.click('[data-testid="submit-question"]');

    // Wait for response
    await expect(page.getByTestId('response-container')).toBeVisible({ timeout: 30000 });

    // Check history sidebar
    await page.click('[data-testid="history-toggle"]');
    await expect(page.getByTestId('conversation-history')).toBeVisible();
    await expect(page.getByText('Test question')).toBeVisible();
  });
});











