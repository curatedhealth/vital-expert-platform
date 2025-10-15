import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { chromium, Browser, Page } from 'playwright';

describe('Autonomous Mode E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  describe('Autonomous Mode Activation', () => {
    it('should enable autonomous mode and show indicator', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      expect(autonomousToggle).toBeTruthy();
      await autonomousToggle.click();

      // Step 3: Verify autonomous mode indicator
      const autonomousIndicator = await page.$('[data-testid="autonomous-indicator"]');
      expect(autonomousIndicator).toBeTruthy();

      // Step 4: Verify mode status
      const modeStatus = await page.$('[data-testid="mode-status"]');
      expect(modeStatus).toBeTruthy();
      const statusText = await modeStatus.textContent();
      expect(statusText).toContain('Autonomous');
    });

    it('should show autonomous mode settings', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Open autonomous settings
      const settingsButton = await page.$('[data-testid="autonomous-settings"]');
      expect(settingsButton).toBeTruthy();
      await settingsButton.click();

      // Step 4: Verify settings modal
      const settingsModal = await page.$('[data-testid="autonomous-settings-modal"]');
      expect(settingsModal).toBeTruthy();

      // Step 5: Verify settings options
      const confidenceSlider = await page.$('[data-testid="confidence-threshold"]');
      const maxStepsInput = await page.$('[data-testid="max-steps"]');
      const timeoutInput = await page.$('[data-testid="timeout-duration"]');

      expect(confidenceSlider).toBeTruthy();
      expect(maxStepsInput).toBeTruthy();
      expect(timeoutInput).toBeTruthy();
    });
  });

  describe('Autonomous Workflow Execution', () => {
    it('should execute complex multi-step workflow autonomously', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type complex medical question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('I have chest pain, shortness of breath, and dizziness. What should I do and what tests might I need?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for autonomous processing indicator
      await page.waitForSelector('[data-testid="autonomous-processing"]', { timeout: 10000 });
      const processingIndicator = await page.$('[data-testid="autonomous-processing"]');
      expect(processingIndicator).toBeTruthy();

      // Step 6: Wait for step-by-step reasoning
      await page.waitForSelector('[data-testid="reasoning-steps"]', { timeout: 15000 });
      const reasoningSteps = await page.$$('[data-testid="reasoning-step"]');
      expect(reasoningSteps.length).toBeGreaterThan(0);

      // Step 7: Wait for final response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);

      // Step 8: Verify comprehensive response
      const lastMessage = chatMessages[chatMessages.length - 1];
      const messageText = await lastMessage.textContent();
      expect(messageText.toLowerCase()).toMatch(/chest pain|shortness of breath|dizziness|medical|doctor|emergency|test/);
    });

    it('should show autonomous reasoning steps', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type question requiring multi-step reasoning
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What are the causes, symptoms, and treatments for hypertension?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for reasoning steps
      await page.waitForSelector('[data-testid="reasoning-steps"]', { timeout: 15000 });
      const reasoningSteps = await page.$$('[data-testid="reasoning-step"]');
      expect(reasoningSteps.length).toBeGreaterThan(1);

      // Step 6: Verify step content
      for (let i = 0; i < reasoningSteps.length; i++) {
        const stepText = await reasoningSteps[i].textContent();
        expect(stepText).toBeTruthy();
        expect(stepText.length).toBeGreaterThan(10);
      }
    });

    it('should handle autonomous decision making', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type question requiring decision making
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('I have a headache and fever. Should I take medication or see a doctor?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for autonomous decision
      await page.waitForSelector('[data-testid="autonomous-decision"]', { timeout: 15000 });
      const decisionDisplay = await page.$('[data-testid="autonomous-decision"]');
      expect(decisionDisplay).toBeTruthy();

      // Step 6: Verify decision reasoning
      const decisionText = await decisionDisplay.textContent();
      expect(decisionText).toContain('decision');
      expect(decisionText).toContain('reasoning');
    });
  });

  describe('Autonomous Mode Controls', () => {
    it('should allow pausing autonomous execution', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Start autonomous execution
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Complex medical question requiring multi-step analysis');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for processing to start
      await page.waitForSelector('[data-testid="autonomous-processing"]', { timeout: 10000 });

      // Step 5: Pause execution
      const pauseButton = await page.$('[data-testid="pause-autonomous"]');
      expect(pauseButton).toBeTruthy();
      await pauseButton.click();

      // Step 6: Verify paused state
      const pausedIndicator = await page.$('[data-testid="autonomous-paused"]');
      expect(pausedIndicator).toBeTruthy();
    });

    it('should allow resuming paused execution', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Start and pause execution
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Complex medical question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      await page.waitForSelector('[data-testid="autonomous-processing"]', { timeout: 10000 });
      const pauseButton = await page.$('[data-testid="pause-autonomous"]');
      await pauseButton.click();

      // Step 4: Resume execution
      const resumeButton = await page.$('[data-testid="resume-autonomous"]');
      expect(resumeButton).toBeTruthy();
      await resumeButton.click();

      // Step 5: Verify resumed state
      const processingIndicator = await page.$('[data-testid="autonomous-processing"]');
      expect(processingIndicator).toBeTruthy();
    });

    it('should allow stopping autonomous execution', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Start autonomous execution
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Complex medical question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for processing to start
      await page.waitForSelector('[data-testid="autonomous-processing"]', { timeout: 10000 });

      // Step 5: Stop execution
      const stopButton = await page.$('[data-testid="stop-autonomous"]');
      expect(stopButton).toBeTruthy();
      await stopButton.click();

      // Step 6: Verify stopped state
      const stoppedIndicator = await page.$('[data-testid="autonomous-stopped"]');
      expect(stoppedIndicator).toBeTruthy();
    });
  });

  describe('Autonomous Mode Safety', () => {
    it('should show safety warnings for medical emergencies', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type emergency question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('I am having severe chest pain and cannot breathe. What should I do?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for safety warning
      await page.waitForSelector('[data-testid="safety-warning"]', { timeout: 10000 });
      const safetyWarning = await page.$('[data-testid="safety-warning"]');
      expect(safetyWarning).toBeTruthy();

      // Step 6: Verify warning content
      const warningText = await safetyWarning.textContent();
      expect(warningText.toLowerCase()).toMatch(/emergency|urgent|call.*911|doctor|hospital/);
    });

    it('should require confirmation for high-risk decisions', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type high-risk question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Should I stop taking my blood pressure medication?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for confirmation request
      await page.waitForSelector('[data-testid="confirmation-required"]', { timeout: 15000 });
      const confirmationModal = await page.$('[data-testid="confirmation-required"]');
      expect(confirmationModal).toBeTruthy();

      // Step 6: Verify confirmation options
      const confirmButton = await page.$('[data-testid="confirm-decision"]');
      const cancelButton = await page.$('[data-testid="cancel-decision"]');
      expect(confirmButton).toBeTruthy();
      expect(cancelButton).toBeTruthy();
    });
  });

  describe('Autonomous Mode Performance', () => {
    it('should complete autonomous workflow within timeout', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Type complex question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Analyze my symptoms: headache, fever, nausea, and provide treatment recommendations');

      // Step 4: Measure execution time
      const startTime = Date.now();
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for completion
      await page.waitForSelector('[data-testid="autonomous-complete"]', { timeout: 60000 });
      const endTime = Date.now();

      // Step 6: Verify completion within timeout
      expect(endTime - startTime).toBeLessThan(60000); // 60 seconds max
    });

    it('should show progress indicators during execution', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      await autonomousToggle.click();

      // Step 3: Start autonomous execution
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Complex medical analysis question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for progress indicators
      await page.waitForSelector('[data-testid="progress-indicator"]', { timeout: 10000 });
      const progressIndicator = await page.$('[data-testid="progress-indicator"]');
      expect(progressIndicator).toBeTruthy();

      // Step 5: Verify progress updates
      const progressText = await progressIndicator.textContent();
      expect(progressText).toMatch(/\d+%/); // Should show percentage
    });
  });
});
