import { test, expect } from '@playwright/test';
import { UI_TEXTS, SELECTORS, expectTextVisible, expectElementVisible, expectButtonState } from './helpers/test-utils';

test.describe('Browser Compatibility Tests', () => {
  test('should show browser warning when ethereum is not available', async ({ page }) => {
    await test.step('Setup no ethereum environment', async () => {
      await page.addInitScript(() => {
        delete (window as any).ethereum;
      });
    });

    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(600);
    });

    await test.step('Verify browser warning is shown', async () => {
      await expectTextVisible(page, UI_TEXTS.BROWSER_NOT_SUPPORTED, {
        testName: 'Browser Not Supported Warning',
        timeout: 5000,
      });

      await expectTextVisible(page, 'Use a Web3 browser', {
        testName: 'Web3 Browser Instruction',
        timeout: 5000,
      });
    });

    await test.step('Verify Sign In button is disabled', async () => {
      try {
        await expectElementVisible(page, 'button:has-text("Sign In")', 'Sign In Button (Should be visible but disabled)');

        const signInButton = page.locator('button:has-text("Sign In")').first();
        const isDisabled = await signInButton.isDisabled();

        if (!isDisabled) {
          throw new Error(`
❌ BUTTON STATE ERROR

Expected: Sign In button should be disabled when no ethereum
Actual: Button is enabled

💡 This means:
  1. Button exists ✅
  2. Button is visible ✅  
  3. Button should be disabled when no ethereum ❌

📍 Check: Button disabled state logic when hasEthereum is false
          `);
        }
      } catch (error: any) {
        const pageContent = await page.locator('body').innerText();
        const hasButton = pageContent.includes('Sign In');

        throw new Error(`
❌ SIGN IN BUTTON NOT FOUND

Expected: Button should exist but be disabled
Actual: Button not found in DOM

📊 Debug info:
  - Page contains "Sign In" text: ${hasButton ? '✅ Yes' : '❌ No'}
  - Button selector tried: button:has-text("Sign In")
  
💡 Possible causes:
  1. Button is not rendered when ethereum is missing
  2. Button text is different
  3. Button selector needs adjustment
  4. Loading state is still active

📍 Check: Button rendering logic in signin component
        `);
      }
    });

    await test.step('Verify browser download links are available', async () => {
      const browserLinks = [
        { name: 'Brave', description: 'Brave Browser download link' },
        { name: 'Opera Crypto', description: 'Opera Crypto Browser download link' },
        { name: 'MetaMask extension', description: 'MetaMask extension download link' },
      ];

      for (const link of browserLinks) {
        const linkElement = page.getByRole('link', { name: link.name });
        const isVisible = await linkElement.isVisible();

        if (!isVisible) {
          throw new Error(`
❌ BROWSER DOWNLOAD LINK MISSING: ${link.description}

Expected link text: "${link.name}"
Found: Not visible

💡 Possible causes:
  1. Link text changed in UI
  2. Link is conditionally rendered
  3. Browser warning section not displayed
  4. CSS hiding the link

📍 Check: Browser warning section in signin component
          `);
        }
      }
    });

    console.log('✅ Browser warning test completed - no MetaMask scenario verified');
  });
});
