import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Chat Workflow E2E Tests', () => {
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

  describe('Complete Chat Workflow', () => {
    it('should complete full chat interaction from login to response', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Verify chat interface is loaded
      const chatInterface = await page.$('[data-testid="chat-interface"]');
      expect(chatInterface).toBeTruthy();

      // Step 3: Type a medical question
      const messageInput = await page.$('[data-testid="message-input"]');
      expect(messageInput).toBeTruthy();
      
      await messageInput.fill('What are the symptoms of hypertension?');

      // Step 4: Send the message
      const sendButton = await page.$('[data-testid="send-button"]');
      expect(sendButton).toBeTruthy();
      await sendButton.click();

      // Step 5: Wait for agent selection
      await page.waitForSelector('[data-testid="agent-selection"]', { timeout: 10000 });
      const agentSelection = await page.$('[data-testid="agent-selection"]');
      expect(agentSelection).toBeTruthy();

      // Step 6: Wait for reasoning display
      await page.waitForSelector('[data-testid="reasoning-display"]', { timeout: 15000 });
      const reasoningDisplay = await page.$('[data-testid="reasoning-display"]');
      expect(reasoningDisplay).toBeTruthy();

      // Step 7: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);

      // Step 8: Verify response content
      const lastMessage = chatMessages[chatMessages.length - 1];
      const messageText = await lastMessage.textContent();
      expect(messageText).toContain('hypertension');
    });

    it('should handle manual agent selection workflow', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Switch to manual mode
      const modeToggle = await page.$('[data-testid="mode-toggle"]');
      expect(modeToggle).toBeTruthy();
      await modeToggle.click();

      // Step 3: Type a question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What are the side effects of medication X?');

      // Step 4: Send the message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for agent selection modal
      await page.waitForSelector('[data-testid="agent-selection-modal"]', { timeout: 10000 });
      const agentModal = await page.$('[data-testid="agent-selection-modal"]');
      expect(agentModal).toBeTruthy();

      // Step 6: Select an agent
      const agentOption = await page.$('[data-testid="agent-option"]');
      expect(agentOption).toBeTruthy();
      await agentOption.click();

      // Step 7: Confirm selection
      const confirmButton = await page.$('[data-testid="confirm-agent"]');
      expect(confirmButton).toBeTruthy();
      await confirmButton.click();

      // Step 8: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);
    });

    it('should handle autonomous mode workflow', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Enable autonomous mode
      const autonomousToggle = await page.$('[data-testid="autonomous-toggle"]');
      expect(autonomousToggle).toBeTruthy();
      await autonomousToggle.click();

      // Step 3: Type a complex medical question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('I have chest pain and shortness of breath. What should I do?');

      // Step 4: Send the message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for autonomous processing
      await page.waitForSelector('[data-testid="autonomous-indicator"]', { timeout: 10000 });
      const autonomousIndicator = await page.$('[data-testid="autonomous-indicator"]');
      expect(autonomousIndicator).toBeTruthy();

      // Step 6: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);

      // Step 7: Verify response includes medical advice
      const lastMessage = chatMessages[chatMessages.length - 1];
      const messageText = await lastMessage.textContent();
      expect(messageText.toLowerCase()).toMatch(/chest pain|shortness of breath|medical|doctor|emergency/);
    });
  });

  describe('Error Handling E2E', () => {
    it('should handle network errors gracefully', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Simulate network failure
      await page.route('**/api/chat', route => route.abort());

      // Step 3: Type a message
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Test message');

      // Step 4: Send the message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      const errorMessage = await page.$('[data-testid="error-message"]');
      expect(errorMessage).toBeTruthy();

      // Step 6: Verify error content
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('error');
    });

    it('should handle invalid input gracefully', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Send empty message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 3: Verify validation error
      const validationError = await page.$('[data-testid="validation-error"]');
      expect(validationError).toBeTruthy();
    });
  });

  describe('Performance E2E', () => {
    it('should load chat interface within 3 seconds', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('should respond to messages within 10 seconds', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type and send message
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What is hypertension?');

      const startTime = Date.now();
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 3: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 15000 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Accessibility E2E', () => {
    it('should be keyboard navigable', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Tab through interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Step 3: Type message using keyboard
      await page.keyboard.type('Test message');

      // Step 4: Send using Enter key
      await page.keyboard.press('Enter');

      // Step 5: Verify message was sent
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 10000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Check for ARIA labels
      const messageInput = await page.$('[data-testid="message-input"]');
      const ariaLabel = await messageInput.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      const sendButton = await page.$('[data-testid="send-button"]');
      const buttonAriaLabel = await sendButton.getAttribute('aria-label');
      expect(buttonAriaLabel).toBeTruthy();
    });
  });

  describe('Mobile Responsiveness E2E', () => {
    it('should work on mobile viewport', async () => {
      // Step 1: Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Step 2: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 3: Verify mobile layout
      const chatInterface = await page.$('[data-testid="chat-interface"]');
      const boundingBox = await chatInterface.boundingBox();
      expect(boundingBox.width).toBeLessThanOrEqual(375);

      // Step 4: Test mobile interaction
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Mobile test message');

      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 15000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);
    });
  });
});
