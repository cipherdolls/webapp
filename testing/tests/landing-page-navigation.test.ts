import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { expectElementVisible, expectTextVisible } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

test.describe('Landing Page Navigation', () => {
  test('should navigate from landing page to signin via CTA button', async ({ page }) => {
    await test.step('Navigate to landing page', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    await test.step('Click CTA button and navigate to signin', async () => {
      // Click the "Start Chat for Free" button in header
      const ctaButton = page.locator('header a:has-text("Start Chat for Free")');
      await ctaButton.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on signin page
      const currentUrl = page.url();
      if (!currentUrl.includes('/signin')) {
        throw new Error(`Navigation failed - Expected /signin, got ${currentUrl}`);
      }
    });

    await test.step('Verify signin page loaded', async () => {
      // Check signin form exists
      await expectElementVisible(page, 'form', 'Sign In Form');
      
      console.log('✅ Successfully navigated from landing page to signin');
    });
  });
});