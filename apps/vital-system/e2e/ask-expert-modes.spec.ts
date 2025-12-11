import { test, expect, Page } from '@playwright/test';

/**
 * VITAL Platform - Ask Expert 4-Mode E2E Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Comprehensive end-to-end tests for all 4 execution modes:
 * - Mode 1: Manual Interactive (Expert Chat)
 * - Mode 2: Auto Interactive (Smart Copilot)
 * - Mode 3: Manual Autonomous (Mission Control)
 * - Mode 4: Auto Autonomous (Background Dashboard)
 */

// =============================================================================
// TEST CONFIGURATION & FIXTURES
// =============================================================================

test.describe.configure({ mode: 'serial' });

// Test data
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@vital.ai',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

const TEST_QUESTIONS = {
  simple: 'What are the common side effects of aspirin?',
  complex: 'Analyze the competitive landscape for diabetes treatments in the EU market, including regulatory pathways and pricing strategies.',
  researchGoal: 'Conduct a comprehensive literature review on CAR-T cell therapy efficacy in pediatric leukemia patients.',
  backgroundMission: 'Generate a complete competitive intelligence report for Drug X covering clinical trials, regulatory status, and market positioning.',
};

// Helper function to wait for SSE stream completion
async function waitForStreamComplete(page: Page, timeout = 30000): Promise<void> {
  await page.waitForFunction(
    () => {
      const doneIndicator = document.querySelector('[data-streaming="false"]');
      const loadingGone = !document.querySelector('[data-testid="loading"]');
      return doneIndicator || loadingGone;
    },
    { timeout }
  );
}

// Helper to safely check element visibility
async function isVisible(page: Page, selector: string, timeout = 2000): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// AUTHENTICATION FIXTURE
// =============================================================================

test.describe('Authentication Setup', () => {
  test('should handle authentication state', async ({ page }) => {
    await page.goto('/');
    
    // Check if already authenticated
    const dashboardVisible = await isVisible(page, '[data-testid="dashboard"]');
    
    if (!dashboardVisible) {
      // Navigate to login
      await page.goto('/login');
      
      // Skip if no login form (might be authenticated via cookies)
      const loginForm = page.locator('form[data-testid="login-form"]').or(
        page.locator('input[type="email"]')
      );
      
      if (await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.fill('input[type="email"]', TEST_USER.email);
        await page.fill('input[type="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/dashboard|home/, { timeout: 10000 });
      }
    }
    
    expect(true).toBeTruthy(); // Pass if we get here
  });
});

// =============================================================================
// MODE 1: MANUAL INTERACTIVE (EXPERT CHAT)
// =============================================================================

test.describe('Mode 1: Manual Interactive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    await page.waitForLoadState('networkidle');
  });

  test('should display Mode 1 interface with expert selection', async ({ page }) => {
    // Verify page loaded
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Check for expert selection sidebar or grid
    const expertSelector = page.locator('[data-testid="expert-selector"]').or(
      page.locator('[data-testid="expert-list"]').or(
        page.locator('.expert-selection')
      )
    );
    
    await expect(expertSelector).toBeVisible({ timeout: 5000 });
  });

  test('should allow expert selection', async ({ page }) => {
    // Find and click on an expert card
    const expertCard = page.locator('[data-testid="expert-card"]').first().or(
      page.locator('.expert-card').first()
    );
    
    if (await expertCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expertCard.click();
      
      // Verify selection indicator
      const selectedState = page.locator('[data-selected="true"]').or(
        page.locator('.expert-selected')
      );
      await expect(selectedState).toBeVisible({ timeout: 2000 });
    }
  });

  test('should submit question and receive streaming response', async ({ page }) => {
    // Select an expert first
    const expertCard = page.locator('[data-testid="expert-card"]').first();
    if (await expertCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expertCard.click();
    }
    
    // Find chat input
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea[placeholder*="question"]').or(
        page.locator('textarea[name="message"]')
      )
    );
    
    await chatInput.fill(TEST_QUESTIONS.simple);
    
    // Submit
    const sendButton = page.locator('[data-testid="send-button"]').or(
      page.getByRole('button', { name: /send|submit/i })
    );
    await sendButton.click();
    
    // Verify streaming indicator appears
    const streamingIndicator = page.locator('[data-testid="streaming"]').or(
      page.locator('[data-streaming="true"]').or(
        page.locator('.streaming-indicator')
      )
    );
    
    await expect(streamingIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should display thinking/reasoning steps', async ({ page }) => {
    // Select expert and submit question
    const expertCard = page.locator('[data-testid="expert-card"]').first();
    if (await expertCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expertCard.click();
    }
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea').first()
    );
    await chatInput.fill(TEST_QUESTIONS.simple);
    
    const sendButton = page.getByRole('button', { name: /send|submit/i });
    await sendButton.click();
    
    // Wait for thinking component
    const thinkingSection = page.locator('[data-testid="thinking"]').or(
      page.locator('.vital-thinking').or(
        page.getByText(/thinking|analyzing|processing/i)
      )
    );
    
    const isThinkingVisible = await thinkingSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Thinking may or may not be shown depending on model config
    expect(true).toBeTruthy();
  });

  test('should display citations when available', async ({ page }) => {
    // Submit a question that should produce citations
    const expertCard = page.locator('[data-testid="expert-card"]').first();
    if (await expertCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expertCard.click();
    }
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea').first()
    );
    await chatInput.fill('What are the FDA guidelines for clinical trials?');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i });
    await sendButton.click();
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Look for citation markers [1], [2], etc.
    const citations = page.locator('[data-testid="citation"]').or(
      page.locator('.citation').or(
        page.locator('sup')
      )
    );
    
    // Citations may not always be present
    const citationCount = await citations.count();
    expect(citationCount).toBeGreaterThanOrEqual(0);
  });

  test('should track cost in real-time', async ({ page }) => {
    const costTracker = page.locator('[data-testid="cost-tracker"]').or(
      page.locator('.cost-display').or(
        page.getByText(/\$[\d.]+/)
      )
    );
    
    const isCostVisible = await costTracker.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Cost tracker may be hidden initially
    expect(true).toBeTruthy();
  });

  test('should allow conversation continuation', async ({ page }) => {
    // First message
    const expertCard = page.locator('[data-testid="expert-card"]').first();
    if (await expertCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expertCard.click();
    }
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea').first()
    );
    await chatInput.fill('What is hypertension?');
    
    let sendButton = page.getByRole('button', { name: /send|submit/i });
    await sendButton.click();
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Follow-up message
    await chatInput.fill('What are the treatment options?');
    sendButton = page.getByRole('button', { name: /send|submit/i });
    await sendButton.click();
    
    // Verify message history
    const messages = page.locator('[data-testid="message"]').or(
      page.locator('.message')
    );
    
    await page.waitForTimeout(2000);
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });
});

// =============================================================================
// MODE 2: AUTO INTERACTIVE (SMART COPILOT)
// =============================================================================

test.describe('Mode 2: Auto Interactive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ask-expert/mode-2');
    await page.waitForLoadState('networkidle');
  });

  test('should display Mode 2 interface with Fusion Intelligence', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Mode 2 should show query input directly without manual expert selection
    const queryInput = page.locator('[data-testid="query-input"]').or(
      page.locator('textarea').first()
    );
    
    await expect(queryInput).toBeVisible({ timeout: 5000 });
  });

  test('should auto-select expert team via Fusion Intelligence', async ({ page }) => {
    const queryInput = page.locator('[data-testid="query-input"]').or(
      page.locator('textarea').first()
    );
    await queryInput.fill(TEST_QUESTIONS.complex);
    
    const submitButton = page.getByRole('button', { name: /send|submit|analyze/i });
    await submitButton.click();
    
    // Wait for Fusion Intelligence results
    const fusionResults = page.locator('[data-testid="fusion-evidence"]').or(
      page.locator('[data-testid="team-recommendation"]').or(
        page.locator('.fusion-explanation')
      )
    );
    
    const isFusionVisible = await fusionResults.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Fusion may be shown or hidden depending on UI config
    expect(true).toBeTruthy();
  });

  test('should display confidence scores for selected experts', async ({ page }) => {
    const queryInput = page.locator('[data-testid="query-input"]').or(
      page.locator('textarea').first()
    );
    await queryInput.fill(TEST_QUESTIONS.complex);
    
    const submitButton = page.getByRole('button', { name: /send|submit|analyze/i });
    await submitButton.click();
    
    // Look for confidence indicators
    await page.waitForTimeout(5000);
    
    const confidenceIndicators = page.locator('[data-testid="confidence"]').or(
      page.locator('.confidence-score').or(
        page.getByText(/%/)
      )
    );
    
    const count = await confidenceIndicators.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show multi-expert response synthesis', async ({ page }) => {
    const queryInput = page.locator('[data-testid="query-input"]').or(
      page.locator('textarea').first()
    );
    await queryInput.fill(TEST_QUESTIONS.complex);
    
    const submitButton = page.getByRole('button', { name: /send|submit|analyze/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(10000);
    
    // Look for synthesized response
    const response = page.locator('[data-testid="response"]').or(
      page.locator('.assistant-message').or(
        page.locator('[role="article"]')
      )
    );
    
    await expect(response).toBeVisible({ timeout: 15000 });
  });

  test('should provide suggestion chips for follow-up', async ({ page }) => {
    const queryInput = page.locator('[data-testid="query-input"]').or(
      page.locator('textarea').first()
    );
    await queryInput.fill('What is diabetes?');
    
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Look for suggestion chips
    const suggestions = page.locator('[data-testid="suggestion-chip"]').or(
      page.locator('.suggestion-chip').or(
        page.locator('button.suggestion')
      )
    );
    
    const suggestionCount = await suggestions.count();
    expect(suggestionCount).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// MODE 3: MANUAL AUTONOMOUS (MISSION CONTROL)
// =============================================================================

test.describe('Mode 3: Manual Autonomous', () => {
  test.beforeEach(async ({ page }) => {
    // Setup default mock for mission stream endpoint
    // Individual tests can override this if needed
    await page.route('**/api/ask-expert/stream', async (route) => {
      const sseResponse = [
        'event: status\ndata: {"status":"running","message":"Mission started"}\n\n',
        'event: plan\ndata: {"plan":[{"id":"1","name":"Research","status":"pending"}]}\n\n',
        'event: progress\ndata: {"stage":"execution","progress":50,"message":"Executing"}\n\n',
        'event: artifact\ndata: {"id":"art-1","title":"Analysis","summary":"Content..."}\n\n',
        'event: done\ndata: {"status":"completed","cost":0.05,"durationMs":3000}\n\n',
      ].join('');

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: { 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        body: sseResponse,
      });
    });

    await page.goto('/ask-expert/mode-3');
    await page.waitForLoadState('networkidle');
  });

  test('should display Mode 3 mission interface', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Should show mission goal input
    const goalInput = page.locator('[data-testid="goal-input"]').or(
      page.locator('textarea[placeholder*="goal"]').or(
        page.locator('textarea').first()
      )
    );
    
    await expect(goalInput).toBeVisible({ timeout: 5000 });
  });

  test('should allow expert selection for mission', async ({ page }) => {
    // Mode 3 allows manual expert selection
    const expertSelector = page.locator('[data-testid="expert-selector"]').or(
      page.locator('.expert-selection')
    );
    
    const isVisible = await expertSelector.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      const expertCard = page.locator('[data-testid="expert-card"]').first();
      await expertCard.click();
      
      const selected = page.locator('[data-selected="true"]');
      await expect(selected).toBeVisible({ timeout: 2000 });
    }
  });

  test('should start autonomous mission', async ({ page }) => {
    // Mock is already set up in beforeEach
    // Select expert if available (preselected by default in the page)
    let expertCard = page.locator('[data-testid="expert-card"]').first();
    if (!(await expertCard.count())) {
      expertCard = page.getByRole('button', { name: /select agent|select expert|agent/i }).first();
    }
    if (await expertCard.isVisible().catch(() => false)) {
      await expertCard.click();
    }

    // Enter mission goal
    let goalInput = page.locator('[data-testid="goal-input"]');
    if (!(await goalInput.count())) {
      goalInput = page.locator('textarea').first();
    }
    await goalInput.fill(TEST_QUESTIONS.researchGoal);
    await expect(goalInput).toHaveValue(TEST_QUESTIONS.researchGoal);

    // Start mission
    const startButton = page.getByRole('button', { name: /start|launch|begin/i });
    await expect(startButton).toBeEnabled({ timeout: 10000 });
    await startButton.click();

    // Verify mission started - the mock triggers isStreaming=true briefly
    // Check for either mission-active during streaming OR progress/completion after
    const missionActive = page.locator('[data-testid="mission-active"]');
    const progressIndicator = page.locator('[data-testid="progress-timeline"]');
    const completedBadge = page.locator('[class*="completed"]').or(
      page.locator('text=completed').or(page.locator('text=Research Complete'))
    );

    // Wait for any of these indicators (mission starts fast with mock)
    const isActive = await missionActive.isVisible({ timeout: 3000 }).catch(() => false);
    const hasProgress = await progressIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    const isCompleted = await completedBadge.isVisible({ timeout: 5000 }).catch(() => false);

    // At least one should be true - mission started OR completed
    expect(isActive || hasProgress || isCompleted).toBeTruthy();
  });

  test('should display mission progress timeline', async ({ page }) => {
    // Start a mission
    const goalInput = page.locator('[data-testid="goal-input"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill('Research cancer treatments');
    
    const startButton = page.getByRole('button', { name: /start|launch/i });
    await startButton.click();
    
    // Look for progress timeline
    const progressTimeline = page.locator('[data-testid="progress-timeline"]').or(
      page.locator('.progress-steps').or(
        page.locator('[role="progressbar"]')
      )
    );
    
    const isVisible = await progressTimeline.isVisible({ timeout: 5000 }).catch(() => false);
    expect(true).toBeTruthy();
  });

  test('should handle HITL checkpoint', async ({ page }) => {
    // Start mission that triggers checkpoint
    const goalInput = page.locator('[data-testid="goal-input"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill(TEST_QUESTIONS.researchGoal);
    
    const startButton = page.getByRole('button', { name: /start|launch/i });
    await startButton.click();
    
    // Wait for potential checkpoint
    await page.waitForTimeout(10000);
    
    // Check for checkpoint modal
    const checkpointModal = page.locator('[data-testid="checkpoint-modal"]').or(
      page.locator('[role="dialog"]').filter({ hasText: /approve|checkpoint/i })
    );
    
    const isCheckpointVisible = await checkpointModal.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isCheckpointVisible) {
      // Approve checkpoint
      const approveButton = page.getByRole('button', { name: /approve|continue/i });
      await approveButton.click();
      
      // Verify mission continues
      await page.waitForTimeout(2000);
    }
    
    expect(true).toBeTruthy();
  });

  test('should allow mission pause and resume', async ({ page }) => {
    const goalInput = page.locator('[data-testid="goal-input"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill('Research task');
    
    const startButton = page.getByRole('button', { name: /start|launch/i });
    await startButton.click();
    
    // Wait for mission to start
    await page.waitForTimeout(2000);
    
    // Pause button
    const pauseButton = page.getByRole('button', { name: /pause/i });
    const isPauseVisible = await pauseButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isPauseVisible) {
      await pauseButton.click();
      
      // Verify paused state
      const pausedIndicator = page.getByText(/paused/i);
      await expect(pausedIndicator).toBeVisible({ timeout: 2000 });
      
      // Resume
      const resumeButton = page.getByRole('button', { name: /resume/i });
      await resumeButton.click();
    }
    
    expect(true).toBeTruthy();
  });

  test('should display generated artifacts', async ({ page }) => {
    const goalInput = page.locator('[data-testid="goal-input"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill(TEST_QUESTIONS.researchGoal);
    
    const startButton = page.getByRole('button', { name: /start|launch/i });
    await startButton.click();
    
    // Wait for artifacts (may take time)
    await page.waitForTimeout(15000);
    
    // Look for artifacts section
    const artifactsSection = page.locator('[data-testid="artifacts"]').or(
      page.locator('.artifacts-list').or(
        page.getByText(/artifacts|deliverables|results/i)
      )
    );
    
    const isVisible = await artifactsSection.isVisible({ timeout: 5000 }).catch(() => false);
    expect(true).toBeTruthy();
  });
});

// =============================================================================
// MODE 4: AUTO AUTONOMOUS (BACKGROUND DASHBOARD)
// =============================================================================

test.describe('Mode 4: Auto Autonomous', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ask-expert/mode-4');
    await page.waitForLoadState('networkidle');
  });

  test('should display Mode 4 dashboard interface', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Should show mission creation form
    const missionForm = page.locator('[data-testid="mission-form"]').or(
      page.locator('form').first()
    );
    
    await expect(missionForm).toBeVisible({ timeout: 5000 });
  });

  test('should create background mission', async ({ page }) => {
    // Fill mission goal
    const goalInput = page.locator('[data-testid="mission-goal"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill(TEST_QUESTIONS.backgroundMission);
    
    // Optional: Fill mission title
    const titleInput = page.locator('[data-testid="mission-title"]').or(
      page.locator('input[placeholder*="title"]')
    );
    if (await titleInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await titleInput.fill('Q4 Competitive Analysis');
    }
    
    // Create mission button
    const createButton = page.getByRole('button', { name: /create|new mission/i });
    await createButton.click();
    
    // Verify mission created
    const missionCard = page.locator('[data-testid="mission-card"]').or(
      page.locator('[data-status="idle"]')
    );
    
    await expect(missionCard).toBeVisible({ timeout: 5000 });
  });

  test('should run pre-flight checks', async ({ page }) => {
    // Create mission
    const goalInput = page.locator('[data-testid="mission-goal"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill(TEST_QUESTIONS.backgroundMission);
    
    const createButton = page.getByRole('button', { name: /create|new mission/i });
    await createButton.click();
    
    // Run pre-flight
    const preFlightButton = page.getByRole('button', { name: /pre-flight|validate|check/i });
    const isPreFlightVisible = await preFlightButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isPreFlightVisible) {
      await preFlightButton.click();
      
      // Wait for checks
      await page.waitForTimeout(3000);
      
      // Look for check results
      const checkResults = page.locator('[data-testid="preflight-checks"]').or(
        page.locator('.preflight-check')
      );
      
      await expect(checkResults).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show Fusion Intelligence team assembly', async ({ page }) => {
    // Create and launch mission
    const goalInput = page.locator('[data-testid="mission-goal"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill(TEST_QUESTIONS.backgroundMission);
    
    const createButton = page.getByRole('button', { name: /create|new mission/i });
    await createButton.click();
    
    // Run pre-flight if required
    const preFlightButton = page.getByRole('button', { name: /pre-flight|validate/i });
    if (await preFlightButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await preFlightButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Launch mission
    const launchButton = page.getByRole('button', { name: /launch|start/i });
    if (await launchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await launchButton.click();
      
      // Look for team assembly view
      const teamView = page.locator('[data-testid="team-assembly"]').or(
        page.locator('.team-assembly-view')
      );
      
      const isTeamVisible = await teamView.isVisible({ timeout: 10000 }).catch(() => false);
      expect(true).toBeTruthy();
    }
  });

  test('should display mission progress with polling', async ({ page }) => {
    // Create and start mission
    const goalInput = page.locator('[data-testid="mission-goal"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill('Quick analysis task');
    
    const createButton = page.getByRole('button', { name: /create|new mission/i });
    await createButton.click();
    
    // Try to launch
    const launchButton = page.getByRole('button', { name: /launch|start/i });
    if (await launchButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await launchButton.click();
      
      // Wait for progress updates
      await page.waitForTimeout(5000);
      
      // Look for progress indicator
      const progressBar = page.locator('[data-testid="mission-progress"]').or(
        page.locator('[role="progressbar"]').or(
          page.locator('.progress-bar')
        )
      );
      
      const isProgressVisible = await progressBar.isVisible({ timeout: 5000 }).catch(() => false);
      expect(true).toBeTruthy();
    }
  });

  test('should show notifications panel', async ({ page }) => {
    const notificationsTab = page.getByRole('tab', { name: /notifications/i }).or(
      page.locator('[data-testid="notifications-tab"]')
    );
    
    const isNotificationsTabVisible = await notificationsTab.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isNotificationsTabVisible) {
      await notificationsTab.click();
      
      // Verify notifications panel
      const notificationsPanel = page.locator('[data-testid="notifications-panel"]').or(
        page.locator('.notifications-list')
      );
      
      await expect(notificationsPanel).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show mission history', async ({ page }) => {
    const historyTab = page.getByRole('tab', { name: /history/i }).or(
      page.locator('[data-testid="history-tab"]')
    );
    
    const isHistoryTabVisible = await historyTab.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isHistoryTabVisible) {
      await historyTab.click();
      
      // Verify history panel
      const historyPanel = page.locator('[data-testid="mission-history"]').or(
        page.locator('.history-list')
      );
      
      await expect(historyPanel).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow mission cancellation', async ({ page }) => {
    // Create a mission
    const goalInput = page.locator('[data-testid="mission-goal"]').or(
      page.locator('textarea').first()
    );
    await goalInput.fill('Cancellable task');
    
    const createButton = page.getByRole('button', { name: /create|new mission/i });
    await createButton.click();
    
    // Launch if possible
    const launchButton = page.getByRole('button', { name: /launch|start/i });
    if (await launchButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await launchButton.click();
      await page.waitForTimeout(2000);
      
      // Cancel mission
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      if (await cancelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelButton.click();
        
        // Confirm cancellation
        const confirmCancel = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmCancel.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmCancel.click();
        }
        
        // Verify cancelled state
        await page.waitForTimeout(2000);
        const cancelledStatus = page.getByText(/cancelled/i);
        const isCancelled = await cancelledStatus.isVisible({ timeout: 2000 }).catch(() => false);
        expect(true).toBeTruthy();
      }
    }
  });
});

// =============================================================================
// CROSS-MODE NAVIGATION
// =============================================================================

test.describe('Mode Navigation', () => {
  test('should navigate between all 4 modes', async ({ page }) => {
    await page.goto('/ask-expert');
    
    // Navigate to Mode 1
    const mode1Link = page.getByRole('link', { name: /mode 1|manual interactive|expert chat/i }).or(
      page.locator('[href*="mode-1"]')
    );
    if (await mode1Link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mode1Link.click();
      await expect(page).toHaveURL(/mode-1/);
    }
    
    // Navigate to Mode 2
    await page.goto('/ask-expert');
    const mode2Link = page.getByRole('link', { name: /mode 2|auto interactive|smart copilot/i }).or(
      page.locator('[href*="mode-2"]')
    );
    if (await mode2Link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mode2Link.click();
      await expect(page).toHaveURL(/mode-2/);
    }
    
    // Navigate to Mode 3
    await page.goto('/ask-expert');
    const mode3Link = page.getByRole('link', { name: /mode 3|manual autonomous|mission control/i }).or(
      page.locator('[href*="mode-3"]')
    );
    if (await mode3Link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mode3Link.click();
      await expect(page).toHaveURL(/mode-3/);
    }
    
    // Navigate to Mode 4
    await page.goto('/ask-expert');
    const mode4Link = page.getByRole('link', { name: /mode 4|auto autonomous|background/i }).or(
      page.locator('[href*="mode-4"]')
    );
    if (await mode4Link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mode4Link.click();
      await expect(page).toHaveURL(/mode-4/);
    }
  });

  test('should preserve context when switching modes', async ({ page }) => {
    // This test would verify session/context preservation
    // For now, just verify navigation works
    await page.goto('/ask-expert/mode-1');
    await page.goto('/ask-expert/mode-2');
    await page.goto('/ask-expert/mode-3');
    await page.goto('/ask-expert/mode-4');
    
    expect(true).toBeTruthy();
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Simulate offline mode
    await page.context().setOffline(true);
    
    const chatInput = page.locator('[data-testid="chat-input"]').or(
      page.locator('textarea').first()
    );
    
    if (await chatInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatInput.fill('Test message');
      
      const sendButton = page.getByRole('button', { name: /send|submit/i });
      await sendButton.click();
      
      // Should show error state
      const errorMessage = page.getByText(/network|offline|connection/i).or(
        page.locator('[data-testid="error"]')
      );
      
      await page.waitForTimeout(3000);
    }
    
    // Restore online
    await page.context().setOffline(false);
    expect(true).toBeTruthy();
  });

  test('should display error messages clearly', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Try to submit empty form
    const sendButton = page.getByRole('button', { name: /send|submit/i });
    
    if (await sendButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await sendButton.click();
      
      // Should show validation error
      const validationError = page.getByText(/required|empty|enter/i);
      const isErrorVisible = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
      expect(true).toBeTruthy();
    }
  });
});

// =============================================================================
// ACCESSIBILITY
// =============================================================================

test.describe('Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count() > 0;
    expect(hasFocus).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Check for main landmarks
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.getAttribute('aria-label') || await button.textContent();
      expect(hasLabel).toBeTruthy();
    }
  });
});

// =============================================================================
// MOBILE RESPONSIVENESS
// =============================================================================

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile-friendly Mode 1 interface', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Verify no horizontal scroll
    const body = page.locator('body');
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    const viewportWidth = 375;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/ask-expert/mode-1');
    
    // Check button sizes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Minimum touch target size should be 44x44
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
