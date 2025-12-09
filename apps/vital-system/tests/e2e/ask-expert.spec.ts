/**
 * Playwright E2E: Ask Expert flows (Modes 1-4) with streaming.
 *
 * Prereqs:
 * - Frontend dev server running (set BASE_URL or use http://localhost:3000).
 * - Backend Ask Expert API reachable (BFF/API routes proxying to FastAPI).
 * - Test users/agents seeded; agent_level badges visible in UI.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Ask Expert E2E', () => {
  test('Mode 1 manual chat shows streaming and agent level badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/ask-expert?mode=mode1`);
    await page.getByPlaceholder('Ask your question').fill('What are FDA 510(k) requirements?');
    await page.getByRole('button', { name: /send/i }).click();

    // Streaming content appears
    await expect(page.getByTestId('streaming-output')).toContainText('FDA', { timeout: 15000 });
    // Agent level badge rendered (L1-L5)
    await expect(page.getByTestId('agent-level-badge')).toHaveText(/L[1-5]/);
    // Citations/evidence surface
    await expect(page.getByTestId('citations-panel')).toBeVisible();
  });

  test('Mode 4 auto-autonomous runs and shows HITL prompt if required', async ({ page }) => {
    await page.goto(`${BASE_URL}/ask-expert?mode=mode4`);
    await page.getByPlaceholder('Ask your question').fill('Deep research on EMA MDR class IIb devices.');
    await page.getByRole('button', { name: /start/i }).click();

    // Streaming progress/plan visible
    await expect(page.getByTestId('streaming-output')).toContainText(/plan|step/i, { timeout: 20000 });
    // Agent level badge (L1 orchestrator)
    await expect(page.getByTestId('agent-level-badge')).toHaveText(/L1/);
    // HITL checkpoint may appear for autonomous modes
    const hitl = page.getByTestId('hitl-prompt');
    if (await hitl.isVisible()) {
      await expect(hitl).toContainText(/approval|checkpoint/i);
    }
  });
});
