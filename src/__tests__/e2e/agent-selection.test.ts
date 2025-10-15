import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('Agent Selection E2E Tests', () => {
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

  describe('Automatic Agent Selection', () => {
    it('should automatically select appropriate agent for medical queries', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type medical question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What are the symptoms of diabetes?');

      // Step 3: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for agent selection
      await page.waitForSelector('[data-testid="agent-selection"]', { timeout: 10000 });
      const agentSelection = await page.$('[data-testid="agent-selection"]');
      expect(agentSelection).toBeTruthy();

      // Step 5: Verify medical agent was selected
      const selectedAgent = await page.$('[data-testid="selected-agent"]');
      expect(selectedAgent).toBeTruthy();
      
      const agentName = await selectedAgent.textContent();
      expect(agentName.toLowerCase()).toMatch(/medical|doctor|physician|healthcare/);
    });

    it('should select general agent for non-medical queries', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type general question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What is the weather like today?');

      // Step 3: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for agent selection
      await page.waitForSelector('[data-testid="agent-selection"]', { timeout: 10000 });

      // Step 5: Verify general agent was selected
      const selectedAgent = await page.$('[data-testid="selected-agent"]');
      expect(selectedAgent).toBeTruthy();
      
      const agentName = await selectedAgent.textContent();
      expect(agentName.toLowerCase()).toMatch(/general|assistant|helper/);
    });

    it('should show agent selection reasoning', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type complex medical question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('I have chest pain and shortness of breath. What should I do?');

      // Step 3: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for reasoning display
      await page.waitForSelector('[data-testid="reasoning-display"]', { timeout: 15000 });
      const reasoningDisplay = await page.$('[data-testid="reasoning-display"]');
      expect(reasoningDisplay).toBeTruthy();

      // Step 5: Verify reasoning content
      const reasoningText = await reasoningDisplay.textContent();
      expect(reasoningText).toContain('Selecting');
      expect(reasoningText).toContain('agent');
    });
  });

  describe('Manual Agent Selection', () => {
    it('should allow user to manually select agent', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Switch to manual mode
      const modeToggle = await page.$('[data-testid="mode-toggle"]');
      expect(modeToggle).toBeTruthy();
      await modeToggle.click();

      // Step 3: Type question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What are the side effects of medication X?');

      // Step 4: Send message
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 5: Wait for agent selection modal
      await page.waitForSelector('[data-testid="agent-selection-modal"]', { timeout: 10000 });
      const agentModal = await page.$('[data-testid="agent-selection-modal"]');
      expect(agentModal).toBeTruthy();

      // Step 6: Verify available agents are displayed
      const agentOptions = await page.$$('[data-testid="agent-option"]');
      expect(agentOptions.length).toBeGreaterThan(0);

      // Step 7: Select an agent
      await agentOptions[0].click();

      // Step 8: Confirm selection
      const confirmButton = await page.$('[data-testid="confirm-agent"]');
      expect(confirmButton).toBeTruthy();
      await confirmButton.click();

      // Step 9: Wait for response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(0);
    });

    it('should display agent information in selection modal', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Switch to manual mode
      const modeToggle = await page.$('[data-testid="mode-toggle"]');
      await modeToggle.click();

      // Step 3: Type question and send
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Test question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for agent selection modal
      await page.waitForSelector('[data-testid="agent-selection-modal"]', { timeout: 10000 });

      // Step 5: Verify agent information is displayed
      const agentOptions = await page.$$('[data-testid="agent-option"]');
      expect(agentOptions.length).toBeGreaterThan(0);

      const firstAgent = agentOptions[0];
      const agentName = await firstAgent.$('[data-testid="agent-name"]');
      const agentDescription = await firstAgent.$('[data-testid="agent-description"]');
      const agentTier = await firstAgent.$('[data-testid="agent-tier"]');

      expect(agentName).toBeTruthy();
      expect(agentDescription).toBeTruthy();
      expect(agentTier).toBeTruthy();
    });

    it('should allow canceling agent selection', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Switch to manual mode
      const modeToggle = await page.$('[data-testid="mode-toggle"]');
      await modeToggle.click();

      // Step 3: Type question and send
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Test question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for agent selection modal
      await page.waitForSelector('[data-testid="agent-selection-modal"]', { timeout: 10000 });

      // Step 5: Cancel selection
      const cancelButton = await page.$('[data-testid="cancel-agent-selection"]');
      expect(cancelButton).toBeTruthy();
      await cancelButton.click();

      // Step 6: Verify modal is closed
      const agentModal = await page.$('[data-testid="agent-selection-modal"]');
      expect(agentModal).toBeFalsy();
    });
  });

  describe('Agent Switching', () => {
    it('should allow switching agents mid-conversation', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Start conversation with first agent
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What is hypertension?');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 3: Wait for first response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });

      // Step 4: Switch to manual mode
      const modeToggle = await page.$('[data-testid="mode-toggle"]');
      await modeToggle.click();

      // Step 5: Ask new question requiring different agent
      await messageInput.fill('What are the side effects of blood pressure medication?');
      await sendButton.click();

      // Step 6: Select different agent
      await page.waitForSelector('[data-testid="agent-selection-modal"]', { timeout: 10000 });
      const agentOptions = await page.$$('[data-testid="agent-option"]');
      if (agentOptions.length > 1) {
        await agentOptions[1].click();
        const confirmButton = await page.$('[data-testid="confirm-agent"]');
        await confirmButton.click();
      }

      // Step 7: Wait for response from new agent
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });
      const chatMessages = await page.$$('[data-testid="chat-message"]');
      expect(chatMessages.length).toBeGreaterThan(1);
    });
  });

  describe('Agent Performance', () => {
    it('should select agent within 5 seconds', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What is diabetes?');

      // Step 3: Measure agent selection time
      const startTime = Date.now();
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      await page.waitForSelector('[data-testid="agent-selection"]', { timeout: 10000 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should maintain agent context throughout conversation', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Start conversation
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('What is hypertension?');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 3: Wait for first response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });

      // Step 4: Ask follow-up question
      await messageInput.fill('What are the treatment options?');
      await sendButton.click();

      // Step 5: Wait for second response
      await page.waitForSelector('[data-testid="chat-message"]', { timeout: 30000 });

      // Step 6: Verify agent context is maintained
      const selectedAgent = await page.$('[data-testid="selected-agent"]');
      expect(selectedAgent).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle agent selection errors gracefully', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Simulate network error
      await page.route('**/api/agent/select', route => route.abort());

      // Step 3: Type question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Test question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 4: Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      const errorMessage = await page.$('[data-testid="error-message"]');
      expect(errorMessage).toBeTruthy();
    });

    it('should retry agent selection on failure', async () => {
      // Step 1: Navigate to chat page
      await page.goto('http://localhost:3000/chat');
      await page.waitForSelector('[data-testid="chat-interface"]');

      // Step 2: Type question
      const messageInput = await page.$('[data-testid="message-input"]');
      await messageInput.fill('Test question');
      const sendButton = await page.$('[data-testid="send-button"]');
      await sendButton.click();

      // Step 3: Wait for retry button if error occurs
      const retryButton = await page.$('[data-testid="retry-agent-selection"]');
      if (retryButton) {
        await retryButton.click();
        await page.waitForSelector('[data-testid="agent-selection"]', { timeout: 10000 });
      }
    });
  });
});
