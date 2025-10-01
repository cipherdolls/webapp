import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export const UI_TEXTS = {
  START_CHAT_FREE: 'Start Chat for Free',
  GO_TO_CHATS: 'Go to Chats',
  CONNECTING: 'Connecting...',
  HOW_IT_WORKS: 'How It Works',
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  FREE_TIER: 'Free',
  REGISTRATION_AND_USAGE: 'Registration and usage',
  PAID_TIER: '1 LOV',
  MONTHLY_USAGE: 'For monthly usage',
  BROWSER_NOT_SUPPORTED: "Your browser isn't supported",
  BROWSER_WARNING_PREFIX: "Your browser isn't supported. Use a Web3 browser",

  LOGO_CIPHERDOLLS: 'Cipherdolls',
  LOGO_MIXEDBREAD: 'Mixedbread',
  LOGO_OPENROUTER: 'Openrouter',
  LOGO_GROQ: 'Groq',
  LOGO_ELEVENLABS: 'Elevenlabs',
  LOGO_ASSEMBLY: 'Assembly',
} as const;

export const SELECTORS = {
  HEADER_AUTH_BUTTON: 'header button:has-text("Start Chat for Free"), header button:has-text("Go to Chats")',
  START_CHAT_BUTTON: 'button:has-text("Start Chat for Free")',
  VIDEO_IFRAME: 'iframe[title="YouTube video player"]',
  WARNING_BOX: '.bg-neutral-05',
  LOGO: 'img[alt="Cipherdolls"]',
  BUTTON_PRIMARY: 'button.primary',
} as const;

export const API_ENDPOINTS = {
  NONCE: '**/auth/nonce',
  SIGNIN: '**/auth/signin',
  VERIFY: '**/auth/verify',
} as const;

/**
 * Helper function to check text visibility with better error messages
 */
export async function expectTextVisible(
  page: Page,
  text: string,
  options?: {
    testName?: string;
    timeout?: number;
    selector?: string;
  }
) {
  const { testName = 'Text visibility check', timeout = 5000, selector } = options || {};

  try {
    const locator = selector ? page.locator(selector).getByText(text) : page.getByText(text);
    await expect(locator).toBeVisible({ timeout });
  } catch (error) {
    const pageText = await page
      .locator('body')
      .innerText()
      .catch(() => 'Could not get page text');
    const visibleTexts = pageText
      .split('\n')
      .filter((t) => t.trim())
      .slice(0, 10);

    throw new Error(`
❌ TEST FAILED: ${testName}

📝 Expected text: "${text}"
❓ Text not found on page

📄 Visible texts on page:
${visibleTexts.map((t) => `   - "${t.substring(0, 50)}${t.length > 50 ? '...' : ''}"`).join('\n')}

💡 Possible causes:
   1. Text was changed in the UI
   2. Page didn't load completely
   3. Element is hidden or not rendered

📍 Debug info:
   - URL: ${page.url()}
   - Selector: ${selector || 'page.getByText()'}
    `);
  }
}

/**
 * Helper function to check element visibility with better error messages
 */
export async function expectElementVisible(page: Page, selector: string, elementName: string, options?: { timeout?: number }) {
  const { timeout = 5000 } = options || {};

  try {
    await expect(page.locator(selector)).toBeVisible({ timeout });
  } catch (error) {
    const exists = (await page.locator(selector).count()) > 0;
    const isVisible = exists ? await page.locator(selector).isVisible() : false;

    throw new Error(`
❌ ELEMENT NOT VISIBLE: ${elementName}

🔍 Selector: ${selector}
📊 Status:
   - Exists in DOM: ${exists ? '✅ Yes' : '❌ No'}
   - Is visible: ${isVisible ? '✅ Yes' : '❌ No'}

💡 Possible causes:
   1. Element selector changed
   2. Element is hidden with CSS
   3. Element hasn't rendered yet
   4. Parent element is hidden

📍 Debug info:
   - URL: ${page.url()}
   - Timeout: ${timeout}ms
    `);
  }
}

/**
 * Helper function to check button state with better error messages
 */
export async function expectButtonState(
  page: Page,
  buttonText: string,
  expectedState: 'enabled' | 'disabled',
  options?: { selector?: string }
) {
  const { selector } = options || {};
  const locator = selector ? page.locator(selector) : page.getByRole('button', { name: buttonText });

  try {
    if (expectedState === 'enabled') {
      await expect(locator).toBeEnabled();
    } else {
      await expect(locator).toBeDisabled();
    }
  } catch (error) {
    const exists = (await locator.count()) > 0;
    const isEnabled = exists ? await locator.isEnabled() : null;
    const isVisible = exists ? await locator.isVisible() : false;

    throw new Error(`
❌ BUTTON STATE MISMATCH: "${buttonText}"

🔍 Expected: ${expectedState}
📊 Actual state:
   - Exists: ${exists ? '✅ Yes' : '❌ No'}
   - Visible: ${isVisible ? '✅ Yes' : '❌ No'}
   - Enabled: ${isEnabled === null ? '❓ N/A' : isEnabled ? '✅ Yes' : '❌ No'}

💡 Possible causes:
   1. Button text changed
   2. Button is in different state than expected
   3. Loading state affecting button
   4. Form validation preventing enable/disable

📍 Debug info:
   - Selector: ${selector || `button with text "${buttonText}"`}
   - URL: ${page.url()}
    `);
  }
}

/**
 * Helper function for wallet connection with better error messages
 */
export async function connectWallet(page: Page, metamask: any, testContext: string) {
  try {
    // Click the "Start Chat for Free" button in header
    await page.locator(SELECTORS.START_CHAT_BUTTON).first().click();

    await metamask.connectToDapp();

    await page.evaluate(() => {
      if (window.ethereum) {
        window.ethereum.emit('accountsChanged', ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']);
      }
    });

    await page.waitForTimeout(1000);
  } catch (error: any) {
    throw new Error(`
❌ WALLET CONNECTION FAILED: ${testContext}

🔍 Error: ${error.message}

💡 Possible causes:
   1. MetaMask extension not loaded
   2. "Start Chat for Free" button not found
   3. MetaMask popup didn't appear
   4. Connection was rejected

📍 Debug steps:
   1. Check if MetaMask extension is installed
   2. Verify button selector: ${SELECTORS.START_CHAT_BUTTON}
   3. Check browser console for errors
    `);
  }
}

/**
 * Helper function for API mocking with better error messages
 */
export async function mockAPIResponse(page: Page, endpoint: string, response: { status: number; body?: any }, testContext: string) {
  try {
    await page.route(endpoint, async (route) => {
      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: response.body ? JSON.stringify(response.body) : undefined,
      });
    });
  } catch (error: any) {
    throw new Error(`
❌ API MOCK FAILED: ${testContext}

🔍 Endpoint: ${endpoint}
📊 Response config:
   - Status: ${response.status}
   - Body: ${response.body ? JSON.stringify(response.body, null, 2) : 'empty'}

💡 Error: ${error.message}
    `);
  }
}

/**
 * Helper function to wait for navigation with better error messages
 */
export async function waitForNavigation(page: Page, expectedUrl: string | RegExp, testContext: string, options?: { timeout?: number }) {
  const { timeout = 10000 } = options || {};
  const startUrl = page.url();

  try {
    await page.waitForURL(expectedUrl, { timeout });
  } catch (error) {
    const currentUrl = page.url();
    throw new Error(`
❌ NAVIGATION FAILED: ${testContext}

🔍 Expected URL: ${expectedUrl}
📊 Current URL: ${currentUrl}
📍 Started from: ${startUrl}

💡 Possible causes:
   1. Redirect didn't happen
   2. Wrong URL pattern
   3. Authentication failed
   4. Navigation was blocked

⏱️ Timeout: ${timeout}ms
    `);
  }
}

/**
 * Helper function to handle signature with popup cleanup
 */
export async function handleSignatureWithCleanup(page: Page, metamask: any, testContext: string) {
  try {
    console.log(`🔄 Starting signature process: ${testContext}`);
    
    // Confirm signature
    await metamask.confirmSignature();
    console.log('✅ Signature confirmed');
    
    // Wait for popup to process
    await page.waitForTimeout(2000);
    console.log('⏳ Waited for popup processing');
    
    // Bring main page to front
    await page.bringToFront();
    console.log('🎯 Brought main page to front');
    
    // Check and close MetaMask popup windows
    const context = page.context();
    const pages = context.pages();
    let closedPopups = 0;
    
    for (const openPage of pages) {
      const url = openPage.url();
      if (url.includes('chrome-extension') && url.includes('metamask') && openPage !== page) {
        try {
          console.log(`🗂️ Found MetaMask popup: ${url.substring(0, 50)}...`);
          await openPage.close();
          closedPopups++;
          console.log('🗑️ Closed MetaMask popup');
        } catch (e) {
          console.log('⚠️ Popup already closed or couldn\'t close');
        }
      }
    }
    
    console.log(`✅ Signature cleanup completed. Closed ${closedPopups} popup(s)`);
    
  } catch (error: any) {
    console.error(`❌ Signature cleanup error: ${error.message}`);
    throw new Error(`
❌ SIGNATURE WITH CLEANUP FAILED: ${testContext}

🔍 Error: ${error.message}
💡 MetaMask popup might be stuck open

📍 Debug steps:
   1. Check if MetaMask popup appeared
   2. Verify signature was actually confirmed
   3. Check browser console for errors
   4. Manually close any open MetaMask windows
    `);
  }
}
