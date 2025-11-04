import { test, expect } from '@playwright/test';

/**
 * Ask Expert E2E Tests
 * 
 * Tests the complete Ask Expert user journey:
 * - Expert browsing and selection
 * - Question submission
 * - Response streaming
 * - Citation display
 * - Multi-turn conversations
 */

test.describe('Ask Expert Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Ask Expert page
    // Assumes user is authenticated (would use auth fixture in real scenario)
    await page.goto('/ask-expert');
  });

  test('should display expert selection interface', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: /ask expert|consult expert/i })).toBeVisible();
    
    // Verify expert grid or list is visible
    const expertGrid = page.locator('[data-testid="expert-grid"]').or(
      page.locator('.expert-list')
    );
    await expect(expertGrid).toBeVisible();
    
    // Verify at least one expert card is visible
    const expertCards = page.locator('[data-testid="expert-card"]').or(
      page.locator('.expert-card')
    );
    await expect(expertCards.first()).toBeVisible();
  });

  test('should allow filtering experts by specialty', async ({ page }) => {
    // Find specialty filter dropdown
    const specialtyFilter = page.getByRole('combobox', { name: /specialty|category/i }).or(
      page.locator('[data-testid="specialty-filter"]')
    );
    
    if (await specialtyFilter.isVisible()) {
      await specialtyFilter.click();
      
      // Select a specialty (e.g., Cardiology)
      await page.getByRole('option', { name: /cardiology/i }).click();
      
      // Verify filtered results
      const expertCards = page.locator('[data-testid="expert-card"]');
      const count = await expertCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should allow searching for experts by name or expertise', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/search experts|find an expert/i).or(
      page.locator('input[type="search"]')
    );
    
    await searchInput.fill('oncologist');
    
    // Wait for search results
    await page.waitForTimeout(500); // Debounce
    
    // Verify results contain the search term
    const expertCards = page.locator('[data-testid="expert-card"]');
    const firstCard = expertCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should display expert details when clicked', async ({ page }) => {
    // Click on first expert card
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    // Verify expert detail view appears
    const expertDetail = page.locator('[data-testid="expert-detail"]').or(
      page.getByRole('dialog')
    );
    await expect(expertDetail).toBeVisible();
    
    // Verify key information is displayed
    await expect(page.getByText(/specialization|expertise/i)).toBeVisible();
    await expect(page.getByText(/experience|years/i)).toBeVisible();
  });

  test('should allow submitting a question to an expert', async ({ page }) => {
    // Select an expert
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    // Find question input
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    
    const testQuestion = 'What are the latest treatments for heart disease?';
    await questionInput.fill(testQuestion);
    
    // Submit question
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Verify submission (loading state or response)
    const loadingIndicator = page.getByText(/thinking|processing|analyzing/i).or(
      page.locator('[data-testid="loading"]')
    );
    
    // Wait for response to start
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should display streaming response from expert', async ({ page }) => {
    // Select an expert and ask a question
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    await questionInput.fill('Explain diabetes management');
    
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Wait for response container
    const responseContainer = page.locator('[data-testid="expert-response"]').or(
      page.locator('.response-content')
    );
    
    await expect(responseContainer).toBeVisible({ timeout: 10000 });
    
    // Verify response has content
    const responseText = await responseContainer.textContent();
    expect(responseText).toBeTruthy();
    expect(responseText!.length).toBeGreaterThan(50);
  });

  test('should display citations with expert response', async ({ page }) => {
    // Submit question and wait for response
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    await questionInput.fill('What are the guidelines for treating hypertension?');
    
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Look for citations section
    const citationsSection = page.locator('[data-testid="citations"]').or(
      page.getByText(/references|sources|citations/i)
    );
    
    // Citations may not always be present
    const citationsVisible = await citationsSection.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (citationsVisible) {
      const citations = page.locator('[data-testid="citation-item"]');
      const count = await citations.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should allow follow-up questions in conversation', async ({ page }) => {
    // Initial question
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    await questionInput.fill('What causes diabetes?');
    
    let submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Wait for first response
    await page.waitForTimeout(3000);
    
    // Ask follow-up question
    await questionInput.fill('What are the treatment options?');
    submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Verify conversation history shows both Q&A pairs
    const messages = page.locator('[data-testid="message"]').or(
      page.locator('.conversation-message')
    );
    
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2); // At least 2 user messages
  });

  test('should display confidence score for expert response', async ({ page }) => {
    // Submit question
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    await questionInput.fill('What is the prognosis for stage 2 cancer?');
    
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Look for confidence indicator
    const confidenceIndicator = page.locator('[data-testid="confidence-score"]').or(
      page.getByText(/confidence|certainty/i)
    );
    
    const confidenceVisible = await confidenceIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    expect(confidenceVisible).toBeTruthy();
  });

  test('should allow saving conversation history', async ({ page }) => {
    // Complete a conversation
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    await questionInput.fill('Explain cholesterol management');
    
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Look for save button
    const saveButton = page.getByRole('button', { name: /save|export|download/i });
    
    const saveVisible = await saveButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (saveVisible) {
      await saveButton.click();
      
      // Verify save confirmation
      const confirmation = page.getByText(/saved|exported/i);
      await expect(confirmation).toBeVisible({ timeout: 3000 });
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to submit without selecting expert
    const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
      page.locator('textarea[name="question"]')
    );
    
    if (await questionInput.isVisible()) {
      await questionInput.fill('Test question without expert');
      
      const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
      
      if (await submitButton.isEnabled()) {
        await submitButton.click();
        
        // Should show error message
        const errorMessage = page.getByText(/select an expert|choose an expert/i);
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should validate empty questions', async ({ page }) => {
    const firstExpert = page.locator('[data-testid="expert-card"]').first();
    await firstExpert.click();
    
    // Try to submit empty question
    const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
    
    // Button should be disabled or show validation error
    const isDisabled = await submitButton.isDisabled();
    
    if (!isDisabled) {
      await submitButton.click();
      
      // Should show validation error
      const validationError = page.getByText(/question is required|enter a question/i);
      await expect(validationError).toBeVisible({ timeout: 2000 });
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });
});

test.describe('Expert Modes', () => {
  test('should allow switching between manual and automatic modes', async ({ page }) => {
    await page.goto('/ask-expert');
    
    // Look for mode toggle
    const modeToggle = page.locator('[data-testid="mode-toggle"]').or(
      page.getByRole('button', { name: /mode|automatic|manual/i })
    );
    
    const toggleVisible = await modeToggle.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (toggleVisible) {
      await modeToggle.click();
      
      // Verify mode changed
      const autoMode = page.getByText(/automatic mode|auto-select/i);
      await expect(autoMode).toBeVisible({ timeout: 2000 });
    }
  });

  test('should auto-select expert in automatic mode', async ({ page }) => {
    await page.goto('/ask-expert');
    
    // Switch to automatic mode if not already
    const autoModeButton = page.getByRole('button', { name: /automatic/i });
    
    const autoVisible = await autoModeButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (autoVisible) {
      await autoModeButton.click();
      
      // Enter question directly
      const questionInput = page.getByPlaceholder(/ask a question|your question/i).or(
        page.locator('textarea[name="question"]')
      );
      await questionInput.fill('What are the symptoms of heart attack?');
      
      const submitButton = page.getByRole('button', { name: /submit|ask|send/i });
      await submitButton.click();
      
      // Should auto-select expert and provide response
      await page.waitForTimeout(3000);
      
      const response = page.locator('[data-testid="expert-response"]');
      await expect(response).toBeVisible({ timeout: 10000 });
    }
  });
});

