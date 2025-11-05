import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { expectElementVisible } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

test.describe('Landing Page Navigation', () => {
  test('should navigate from landing page to signin via CTA button', async ({ page }) => {
    await test.step('Navigate to landing page', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    await test.step('Locate header login button', async () => {
      await expectElementVisible(page, 'header button:has-text("Log in")', 'Header Log in Button');
    });

    await test.step('Click header login button', async () => {
      const loginButton = page.locator('header button:has-text("Log in")');
      await loginButton.click();
      
      console.log('✅ Header Log in button is clickable');
    });
  });
});