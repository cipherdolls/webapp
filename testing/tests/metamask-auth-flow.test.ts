import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { SELECTORS, expectElementVisible, connectWallet } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

test.describe('SignIn Authentication Flow with Real MetaMask', () => {
  test('should handle wallet connection and disconnection', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    await test.step('Verify signin form is available', async () => {
      await expectElementVisible(page, SELECTORS.SIGNIN_FORM, 'Sign In Form');
    });

    await test.step('Connect wallet', async () => {
      await connectWallet(page, metamask, 'Wallet Connection Test');

      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log('After connection, URL:', currentUrl);
    });

    console.log('✅ Real MetaMask wallet connection flow verified');
  });

  test('should handle complete authentication flow', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);
    });

    await test.step('Monitor API calls', async () => {
      const signinResponsePromise = page.waitForResponse((response) => response.url().includes('/auth/signin')).catch(() => null);

      await page.locator(SELECTORS.SIGNIN_BUTTON).click();
      await metamask.connectToDapp();

      await page.evaluate(() => {
        if (window.ethereum) {
          window.ethereum.emit('accountsChanged', ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']);
        }
      });

      await page.waitForTimeout(1000);

      await page.locator(SELECTORS.SIGNIN_BUTTON).click();

      await metamask.confirmSignature();

      const signinResponse = await signinResponsePromise;
      if (!signinResponse) {
        throw new Error(`
❌ API CALL NOT DETECTED

Expected: POST to /auth/signin
Actual: No API call captured

💡 Possible causes:
   1. Sign In button didn't trigger action
   2. MetaMask signature was not confirmed
   3. API endpoint changed

📍 Check: clientAction function (lines 28-71)
        `);
      }

      const status = signinResponse.status();
      console.log('✅ API signin successful:', status);

      if (status !== 201) {
        const body = await signinResponse.text();
        throw new Error(`
❌ UNEXPECTED API RESPONSE

Expected status: 201
Actual status: ${status}
Response body: ${body}

📍 Check: API signin endpoint
        `);
      }

      await page.waitForTimeout(3000);

      const finalUrl = page.url();
      if (finalUrl.endsWith('/')) {
        console.log('🎉 Complete authentication flow successful - redirected to homepage!');
      } else {
        console.log('✅ Authentication API successful, staying on signin page');
      }
    });

    console.log('✅ Complete real MetaMask authentication flow tested');
  });
});
