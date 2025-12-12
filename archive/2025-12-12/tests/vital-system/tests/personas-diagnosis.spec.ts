import { test, expect } from '@playwright/test';

/**
 * Diagnostic test for personas page loading issue
 * Run with: npx playwright test tests/personas-diagnosis.spec.ts --headed
 */

test.describe('Personas Page Diagnosis', () => {
  test('diagnose blank page issue', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    const networkErrors: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });

    // Capture page errors
    page.on('pageerror', error => {
      const errorMsg = `[Page Error] ${error.message}\n${error.stack}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    });

    // Capture failed network requests
    page.on('requestfailed', request => {
      const failure = request.failure();
      const errorMsg = `[Network Failed] ${request.method()} ${request.url()}\n  Error: ${failure?.errorText}`;
      networkErrors.push(errorMsg);
      console.error(errorMsg);
    });

    // Log all responses
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 400) {
        console.log(`[Response ${status}] ${url}`);
      }
    });

    console.log('\n=== Starting Diagnosis ===\n');
    console.log('Navigating to http://vital-system.localhost:3000/personas...\n');

    try {
      await page.goto('/personas', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      console.log('✓ Page navigation completed\n');

      // Wait a bit for any async rendering
      await page.waitForTimeout(3000);

      // Check page state
      const title = await page.title();
      console.log(`Page Title: ${title}`);

      const url = page.url();
      console.log(`Current URL: ${url}`);

      // Check body content
      const bodyHTML = await page.locator('body').innerHTML();
      const bodyText = await page.locator('body').textContent();
      
      console.log(`\nBody HTML Length: ${bodyHTML.length}`);
      console.log(`Body Text Length: ${bodyText?.length || 0}`);
      
      if (bodyHTML.length < 100) {
        console.log('\n❌ ISSUE: Body HTML is very short (likely empty)');
        console.log(`Body HTML: ${bodyHTML.substring(0, 500)}`);
      } else {
        console.log(`\n✓ Body has content`);
        console.log(`Body preview: ${bodyHTML.substring(0, 200)}...`);
      }

      // Check for React root
      const reactRoots = await page.locator('#__next, [data-reactroot], [id^="__next"]').count();
      console.log(`\nReact Root Elements: ${reactRoots}`);

      // Check for any visible elements
      const visibleCount = await page.locator('body > *').count();
      console.log(`Direct Body Children: ${visibleCount}`);

      // Check for error elements
      const errorElements = await page.locator('[class*="error" i], [id*="error" i]').count();
      console.log(`Error Elements: ${errorElements}`);

      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/personas-diagnosis.png', 
        fullPage: true 
      });
      console.log('\n✓ Screenshot saved to test-results/personas-diagnosis.png');

      // Summary
      console.log('\n=== DIAGNOSIS SUMMARY ===');
      console.log(`Console Messages: ${consoleMessages.length}`);
      console.log(`Page Errors: ${errors.length}`);
      console.log(`Network Errors: ${networkErrors.length}`);
      
      if (errors.length > 0) {
        console.log('\n❌ PAGE ERRORS FOUND:');
        errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
      }

      if (networkErrors.length > 0) {
        console.log('\n❌ NETWORK ERRORS FOUND:');
        networkErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
      }

      if (bodyHTML.length < 100) {
        console.log('\n❌ ROOT CAUSE: Page body is empty');
        console.log('Possible causes:');
        console.log('  1. Server-side error in layout.tsx');
        console.log('  2. Middleware blocking request');
        console.log('  3. AppLayoutClient returning null');
        console.log('  4. Build/compilation error');
      }

    } catch (error) {
      console.error('\n❌ TEST FAILED:', error);
      await page.screenshot({ 
        path: 'test-results/personas-diagnosis-error.png', 
        fullPage: true 
      });
    }
  });
});
