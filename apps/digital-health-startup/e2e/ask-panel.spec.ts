/**
 * End-to-End Integration Tests for Ask Panel
 * 
 * Uses Playwright to test complete user journey
 */

import { test, expect } from '@playwright/test';

test.describe('Ask Panel - Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/ask-panel');
  });

  test('should display landing page correctly', async ({ page }) => {
    // Check header
    await expect(page.getByRole('heading', { name: 'Ask Panel' })).toBeVisible();
    
    // Check quick question input
    await expect(page.getByPlaceholder(/help designing a clinical trial/i)).toBeVisible();
    
    // Check 3 entry points
    await expect(page.getByText('AI Suggestion')).toBeVisible();
    await expect(page.getByText('Browse Templates')).toBeVisible();
    await expect(page.getByText('Build Custom Panel')).toBeVisible();
    
    // Check popular templates
    await expect(page.getByText('Popular Templates')).toBeVisible();
  });

  test('should open wizard with quick question', async ({ page }) => {
    // Enter question
    const questionInput = page.getByPlaceholder(/help designing a clinical trial/i);
    await questionInput.fill('I need help designing a clinical trial for a digital therapeutic');
    
    // Click Get AI Panel button
    await page.getByRole('button', { name: /get ai panel/i }).click();
    
    // Wait for wizard to open
    await expect(page.getByText('Create Your Expert Panel')).toBeVisible();
    await expect(page.getByText('Step 1/4')).toBeVisible();
  });

  test('should complete full wizard flow - AI Suggest path', async ({ page }) => {
    // Step 1: Open wizard
    await page.getByRole('button', { name: /ai suggestion/i }).click();
    await expect(page.getByText('Create Your Expert Panel')).toBeVisible();
    
    // Select AI Suggest
    await page.getByRole('button', { name: /ai suggest/i }).first().click();
    
    // Enter question
    const questionTextarea = page.getByRole('textbox', { name: /your question/i });
    await questionTextarea.fill('Help me design a clinical trial for diabetes management');
    
    // Continue to Step 2
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Wait for AI recommendations
    await expect(page.getByText('AI Recommended Agents')).toBeVisible({ timeout: 10000 });
    
    // Select 3 agents
    const agentButtons = page.getByRole('button', { name: /select agent/i });
    for (let i = 0; i < 3; i++) {
      await agentButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    // Verify selection count
    await expect(page.getByText('Selected Agents (3)')).toBeVisible();
    
    // Continue to Step 3
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Configure settings
    await expect(page.getByText('Configure Panel Behavior')).toBeVisible();
    
    // Select Collaborative mode
    await page.getByRole('button', { name: /collaborative/i }).click();
    
    // Continue to Step 4
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 4: Review
    await expect(page.getByText('Review Your Panel')).toBeVisible();
    await expect(page.getByText('Panel Configuration Summary')).toBeVisible();
    
    // Verify agent count
    await expect(page.getByText('3 Agents')).toBeVisible();
    
    // Create Panel
    await page.getByRole('button', { name: /create panel/i }).click();
    
    // Should navigate to consultation view
    await expect(page.getByText('Panel Consultation')).toBeVisible({ timeout: 5000 });
  });

  test('should complete wizard using template', async ({ page }) => {
    // Click on a template card
    await page.getByText('Clinical Trial Design').first().click();
    
    // Should open wizard with template pre-selected
    await expect(page.getByText('Create Your Expert Panel')).toBeVisible();
    
    // Template should be selected
    await expect(page.locator('.border-purple-500')).toBeVisible();
    
    // Continue through wizard
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Agents should be pre-selected from template
    await expect(page.getByText(/Selected Agents/i)).toBeVisible();
    
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Settings should have template defaults
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 4: Create panel
    await page.getByRole('button', { name: /create panel/i }).click();
    
    await expect(page.getByText('Panel Consultation')).toBeVisible({ timeout: 5000 });
  });

  test('should handle agent search and filtering', async ({ page }) => {
    // Open wizard
    await page.getByRole('button', { name: /build custom panel/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Should be on agent selection
    await expect(page.getByText('Select Your Expert Agents')).toBeVisible();
    
    // Use search
    const searchInput = page.getByPlaceholder(/search agents/i);
    await searchInput.fill('clinical trial');
    await page.waitForTimeout(500);
    
    // Should filter agents
    const agentCards = page.locator('[data-testid="agent-card"]');
    const count = await agentCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should validate minimum agent selection', async ({ page }) => {
    // Open wizard and go to agent selection
    await page.getByRole('button', { name: /build custom/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Try to continue without selecting agents
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeDisabled();
    
    // Select one agent
    await page.getByRole('button', { name: /select agent/i }).first().click();
    
    // Continue button should be enabled
    await expect(continueButton).toBeEnabled();
  });

  test('should allow navigation back through wizard steps', async ({ page }) => {
    // Navigate to Step 3
    await page.getByRole('button', { name: /ai suggestion/i }).click();
    await page.getByRole('textbox').fill('Test question');
    await page.getByRole('button', { name: /continue/i }).click();
    
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /select agent/i }).first().click();
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Now on Step 3
    await expect(page.getByText('Configure Panel Behavior')).toBeVisible();
    
    // Go back to Step 2
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText('Select Your Expert Agents')).toBeVisible();
    
    // Go back to Step 1
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText('How would you like to start')).toBeVisible();
  });

  test('should cancel wizard and return to landing', async ({ page }) => {
    // Open wizard
    await page.getByRole('button', { name: /ai suggestion/i }).click();
    
    // Click cancel (X button)
    await page.locator('button[aria-label="Close"]').or(page.getByRole('button', { name: /cancel/i })).first().click();
    
    // Should be back on landing page
    await expect(page.getByText('How can our expert panel help you today?')).toBeVisible();
  });
});

test.describe('Panel Consultation View', () => {
  test.skip('should display consultation in progress', async ({ page }) => {
    // Note: This test requires mock backend or live API
    // Skip if backend not available
    
    await page.goto('http://localhost:3000/ask-panel');
    
    // Create a panel (simplified for testing)
    // ... wizard steps ...
    
    // Should see consultation view
    await expect(page.getByText('Panel Consultation')).toBeVisible();
    await expect(page.getByText('Discussing...')).toBeVisible();
  });

  test.skip('should display agent responses', async ({ page }) => {
    // Note: Requires live backend
    
    // Wait for agents to respond
    await page.waitForSelector('[data-testid="agent-response"]', { timeout: 30000 });
    
    // Check that responses are visible
    const responses = page.locator('[data-testid="agent-response"]');
    const count = await responses.count();
    expect(count).toBeGreaterThan(0);
    
    // Check for confidence scores
    await expect(page.getByText(/confidence/i)).toBeVisible();
  });

  test.skip('should allow follow-up questions', async ({ page }) => {
    // Note: Requires consultation to be complete
    
    // Enter follow-up question
    const followUpInput = page.getByPlaceholder(/ask a follow-up/i);
    await followUpInput.fill('What about patient safety?');
    
    // Submit
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should start new discussion
    await expect(page.getByText('Discussing...')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000/ask-panel');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Active element should be visible and have focus indicator
    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:3000/ask-panel');
    
    // Check for aria-labels
    const buttons = page.locator('button[aria-label]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:3000/ask-panel');
    
    // Check h1
    await expect(page.locator('h1')).toHaveCount(1);
    
    // Check h2
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/ask-panel');
    
    // Check that elements are visible
    await expect(page.getByText('Ask Panel')).toBeVisible();
    await expect(page.getByPlaceholder(/help designing/i)).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/ask-panel');
    
    await expect(page.getByText('Ask Panel')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/ask-panel');
    
    await expect(page.getByText('Ask Panel')).toBeVisible();
  });
});

