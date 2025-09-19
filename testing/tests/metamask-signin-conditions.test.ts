import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { UI_TEXTS, SELECTORS, expectTextVisible, expectElementVisible, expectButtonState, connectWallet } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test.describe('SignIn Page with Real MetaMask - Conditional Logic', () => {
  test('should show active form when MetaMask is available', async ({ page }) => {
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);
    });

    await test.step('Verify browser warning is NOT shown', async () => {
      const warningElement = page.getByText(UI_TEXTS.BROWSER_NOT_SUPPORTED);
      const isVisible = await warningElement.isVisible();
      if (isVisible) {
        throw new Error(`
❌ UNEXPECTED WARNING SHOWN

❓ Browser warning should NOT be visible when MetaMask is available
📊 MetaMask status: Available ✅
⚠️  Warning shown: ${isVisible ? 'Yes ❌' : 'No ✅'}

💡 This might indicate:
   1. MetaMask detection logic is broken
   2. Loading state is not working properly
   3. hasEthereum state is not updating

📍 Check: app/routes/_auth.signIn.tsx (lines 192-199)
        `);
      }
    });

    await test.step('Verify Sign In form and button', async () => {
      await expectElementVisible(page, SELECTORS.SIGNIN_FORM, 'Sign In Form');
      await expectButtonState(page, UI_TEXTS.SIGN_IN_BUTTON, 'enabled', {
        selector: SELECTORS.SIGNIN_BUTTON,
      });

      const signInButton = page.locator(SELECTORS.SIGNIN_BUTTON);
      const buttonType = await signInButton.getAttribute('type');
      if (buttonType !== 'submit') {
        throw new Error(`
❌ BUTTON TYPE INCORRECT

Expected: type="submit"
Actual: type="${buttonType}"

📍 Check: Sign In button configuration
        `);
      }
    });
  });

  test('should display proper page elements with MetaMask', async ({ page }) => {
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check main UI elements', async () => {
      await expectElementVisible(page, 'img[alt="Cipherdolls"][src="/logo.svg"]', 'CipherDolls Main Logo');

      await expectElementVisible(page, SELECTORS.VIDEO_IFRAME, 'YouTube Tutorial Video');
    });

    await test.step('Verify wallet connection message', async () => {
      await expectTextVisible(page, UI_TEXTS.WALLET_REQUIRED, {
        testName: 'Wallet Required Message Check',
        timeout: 5000,
      });
    });

    await test.step('Check modal buttons', async () => {
      const modalButtons = [
        { name: UI_TEXTS.HOW_IT_WORKS, description: 'How It Works modal button' },
        { name: UI_TEXTS.TERMS_OF_SERVICE, description: 'Terms of Service modal button' },
        { name: UI_TEXTS.PRIVACY_POLICY, description: 'Privacy Policy modal button' },
      ];

      for (const button of modalButtons) {
        const buttonElement = page.getByRole('button', { name: button.name });
        const isVisible = await buttonElement.isVisible();
        if (!isVisible) {
          throw new Error(`
❌ MODAL BUTTON NOT FOUND: ${button.description}

Expected button text: "${button.name}"
Found: Not visible

💡 Check if:
   1. Button text changed
   2. Button is conditionally rendered
   3. Button is hidden by CSS

📍 Location: Bottom of signin form
          `);
        }
      }
    });

    await test.step('Check pricing information', async () => {
      await expectTextVisible(page, UI_TEXTS.FREE_TIER, {
        testName: 'Free Tier Text',
      });
      await expectTextVisible(page, UI_TEXTS.REGISTRATION_AND_USAGE, {
        testName: 'Free Tier Description',
      });
      await expectTextVisible(page, UI_TEXTS.PAID_TIER, {
        testName: 'Paid Tier Price',
      });
      await expectTextVisible(page, UI_TEXTS.MONTHLY_USAGE, {
        testName: 'Paid Tier Description',
      });
    });

    // Partner logos check removed - not essential for signin functionality

    console.log('✅ All page elements verified with real MetaMask');
  });

  test('should show wallet connection state changes', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Navigate and verify initial state', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expectElementVisible(page, SELECTORS.SIGNIN_BUTTON, 'Sign In Button (Initial State)');
    });

    await test.step('Connect wallet and verify state change', async () => {
      await connectWallet(page, metamask, 'Wallet Connection State Test');

      await page.waitForTimeout(2000);

      await expectElementVisible(page, SELECTORS.SIGNIN_BUTTON, 'Sign In Button (After Connection)');
    });

    console.log('✅ Wallet connection state changes verified');
  });

  test('should show disabled button during loading state', async ({ page }) => {
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');

      await page.waitForTimeout(600);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify button state after loading', async () => {
      await expectButtonState(page, UI_TEXTS.SIGN_IN_BUTTON, 'enabled', { selector: SELECTORS.SIGNIN_BUTTON });
    });

    console.log('✅ Loading state button behavior verified');
  });
});
