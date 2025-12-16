import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

/**
 * Workflow Designer E2E Tests
 */
test.describe('Workflow Designer', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/workflow-designer');
  });

  test('should display workflow designer canvas', async ({ page }) => {
    // Check for React Flow canvas
    await expect(page.locator('.react-flow')).toBeVisible();
    await expect(page.getByTestId('node-palette')).toBeVisible();
  });

  test('should have node palette with all node types', async ({ page }) => {
    const nodeTypes = [
      'Start',
      'End',
      'Expert',
      'Router',
      'Panel',
      'Tool',
      'Memory',
      'Delay',
      'Transform',
    ];

    for (const nodeType of nodeTypes) {
      await expect(page.getByTestId(`node-${nodeType.toLowerCase()}`)).toBeVisible();
    }
  });

  test('should drag and drop nodes onto canvas', async ({ page }) => {
    // Get source node from palette
    const expertNode = page.getByTestId('node-expert');
    const canvas = page.locator('.react-flow__viewport');

    // Drag node to canvas
    await expertNode.dragTo(canvas, {
      targetPosition: { x: 300, y: 200 },
    });

    // Verify node was added
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('should connect nodes with edges', async ({ page }) => {
    // Add start node
    await page.getByTestId('node-start').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 100, y: 200 },
    });

    // Add expert node
    await page.getByTestId('node-expert').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 400, y: 200 },
    });

    // Connect nodes (drag from source handle to target handle)
    const sourceHandle = page.locator('.react-flow__node').first().locator('.react-flow__handle-right');
    const targetHandle = page.locator('.react-flow__node').last().locator('.react-flow__handle-left');

    await sourceHandle.dragTo(targetHandle);

    // Verify edge was created
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  });

  test('should open node configuration panel', async ({ page }) => {
    // Add an expert node
    await page.getByTestId('node-expert').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 300, y: 200 },
    });

    // Click on the node
    await page.locator('.react-flow__node').click();

    // Configuration panel should open
    await expect(page.getByTestId('node-config-panel')).toBeVisible();
    await expect(page.getByLabel(/expert|agent/i)).toBeVisible();
  });

  test('should save workflow', async ({ page }) => {
    // Create a simple workflow
    await page.getByTestId('node-start').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 100, y: 200 },
    });

    await page.getByTestId('node-expert').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 300, y: 200 },
    });

    await page.getByTestId('node-end').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 500, y: 200 },
    });

    // Click save
    await page.click('[data-testid="save-workflow"]');

    // Fill workflow name
    await page.fill('[data-testid="workflow-name"]', 'Test Workflow');
    await page.click('[data-testid="confirm-save"]');

    // Should show success
    await expect(page.getByText(/saved|success/i)).toBeVisible();
  });

  test('should validate workflow before execution', async ({ page }) => {
    // Add only a start node (incomplete workflow)
    await page.getByTestId('node-start').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 200, y: 200 },
    });

    // Try to execute
    await page.click('[data-testid="execute-workflow"]');

    // Should show validation error
    await expect(page.getByText(/invalid|missing end node|validation/i)).toBeVisible();
  });

  test('should execute valid workflow', async ({ page }) => {
    // Create a valid workflow
    await page.getByTestId('node-start').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 100, y: 200 },
    });

    const expertNode = await page.getByTestId('node-expert').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 300, y: 200 },
    });

    await page.getByTestId('node-end').dragTo(page.locator('.react-flow__viewport'), {
      targetPosition: { x: 500, y: 200 },
    });

    // Connect nodes (simplified - assume auto-connect or manual connection)

    // Execute
    await page.click('[data-testid="execute-workflow"]');

    // Should show execution overlay
    await expect(page.getByTestId('execution-overlay')).toBeVisible({ timeout: 10000 });
  });
});










