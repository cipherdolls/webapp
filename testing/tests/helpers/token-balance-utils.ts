import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { expectElementVisible } from './test-utils';

export const TOKEN_BALANCE_SELECTORS = {
  CONTAINER: '[data-testid="token-balance"]',
  REFRESH_BUTTON: 'button[title="Refresh token balance"]',
  BALANCE_TEXT: 'span:has-text("LOV")',
  LOADING_SPINNER: '.animate-spin',
  YOUR_BALANCE_TITLE: 'h3:has-text("Your Balance")',
  TOKEN_CARD: '.bg-white.rounded-xl',
} as const;

export const TOKEN_BALANCE_API = {
  USER_UPDATE: '**/users/**',
  REFRESH_ACTION: 'RefreshTokenBalance',
} as const;

/**
 * Helper function to verify token balance component is visible
 */
export async function expectTokenBalanceVisible(page: Page, testContext: string) {
  try {
    // Check if "Your Balance" title is visible
    await expectElementVisible(
      page,
      TOKEN_BALANCE_SELECTORS.YOUR_BALANCE_TITLE,
      'Your Balance Title',
      { timeout: 10000 }
    );

    // Check if refresh button is visible
    await expectElementVisible(
      page,
      TOKEN_BALANCE_SELECTORS.REFRESH_BUTTON,
      'Refresh Button',
      { timeout: 5000 }
    );

    // Check if token card container is visible
    await expectElementVisible(
      page,
      TOKEN_BALANCE_SELECTORS.TOKEN_CARD,
      'Token Balance Card',
      { timeout: 5000 }
    );

    console.log(`✅ Token Balance component verified: ${testContext}`);
  } catch (error: any) {
    throw new Error(`
❌ TOKEN BALANCE COMPONENT NOT VISIBLE: ${testContext}

🔍 Error: ${error.message}

💡 Possible causes:
   1. Component didn't load
   2. User data not loaded
   3. Network issues
   4. Route not loaded properly

📍 Debug info:
   - URL: ${page.url()}
    `);
  }
}

/**
 * Helper function to get current balance text from the UI
 */
export async function getCurrentBalance(page: Page): Promise<string> {
  try {
    // Find the balance text - it's the span before "LOV"
    const balanceLocator = page.locator('span').filter({ hasText: /^\d+\.?\d*$/ }).first();
    const balanceText = await balanceLocator.textContent();
    
    if (!balanceText) {
      throw new Error('Balance text not found');
    }
    
    return balanceText.trim();
  } catch (error: any) {
    // Fallback method - look for any number followed by LOV
    try {
      const cardText = await page.locator(TOKEN_BALANCE_SELECTORS.TOKEN_CARD).textContent();
      const balanceMatch = cardText?.match(/(\d+(?:\.\d+)?)\s*LOV/);
      
      if (balanceMatch) {
        return balanceMatch[1];
      }
      
      throw new Error('Could not extract balance from card text');
    } catch (fallbackError) {
      throw new Error(`
❌ COULD NOT GET CURRENT BALANCE

🔍 Primary error: ${error.message}
🔍 Fallback error: ${fallbackError}

💡 Possible causes:
   1. Balance element selector changed
   2. Balance not loaded yet
   3. Balance format changed
   4. Component structure changed

📍 Debug steps:
   1. Check if token card is visible
   2. Verify balance text format
   3. Check component HTML structure
      `);
    }
  }
}

/**
 * Helper function to click refresh button and monitor API call
 */
export async function clickRefreshButtonAndWaitForAPI(page: Page, testContext: string) {
  try {
    console.log(`🔄 Starting refresh operation: ${testContext}`);

    // Set up API monitoring before clicking with increased timeout
    const refreshResponsePromise = page.waitForResponse((response: any) => {
      const url = response.url();
      const method = response.request().method();
      return url.includes('/users/') && method === 'PATCH';
    }, { timeout: 15000 }).catch(() => null);

    // Click refresh button
    const refreshButton = page.locator(TOKEN_BALANCE_SELECTORS.REFRESH_BUTTON);
    
    // Verify button is not disabled before clicking
    const isDisabled = await refreshButton.isDisabled();
    if (isDisabled) {
      throw new Error('Refresh button is disabled');
    }

    await refreshButton.click();
    console.log('✅ Refresh button clicked');

    // Verify loading state (spinner should appear) - optional check
    try {
      await expectElementVisible(
        page,
        TOKEN_BALANCE_SELECTORS.LOADING_SPINNER,
        'Loading Spinner',
        { timeout: 3000 }
      );
      console.log('✅ Loading spinner appeared');
    } catch (error) {
      console.log('ℹ️ Loading spinner not detected - API might be too fast');
    }

    // Wait for API response
    const refreshResponse = await refreshResponsePromise;
    if (!refreshResponse) {
      throw new Error('❌ API refresh call not detected');
    }

    const status = refreshResponse.status();
    if (status !== 200) {
      throw new Error(`❌ API refresh failed with status: ${status}`);
    }

    console.log(`✅ API refresh call successful: ${refreshResponse.url()} - Status: ${status}`);

    // Wait for loading to complete (spinner should disappear)
    await page.waitForTimeout(3000);
    
    // Verify loading spinner is gone
    const spinnerVisible = await page.locator(TOKEN_BALANCE_SELECTORS.LOADING_SPINNER).isVisible().catch(() => false);
    if (spinnerVisible) {
      console.log('⚠️ Loading spinner still visible after API response');
    } else {
      console.log('✅ Loading spinner disappeared');
    }

    return refreshResponse;

  } catch (error: any) {
    throw new Error(`
❌ REFRESH OPERATION FAILED: ${testContext}

🔍 Error: ${error.message}

💡 Possible causes:
   1. Refresh button selector changed
   2. API endpoint changed
   3. Network request failed
   4. Button was disabled
   5. Loading animation not working

📍 Debug steps:
   1. Check if refresh button exists and is clickable
   2. Monitor network tab for API calls
   3. Check browser console for errors
   4. Verify user authentication state
    `);
  }
}

/**
 * Helper function to verify balance format
 */
export async function verifyBalanceFormat(page: Page, expectedPattern: RegExp = /^\d+(\.\d{1,3})?$/) {
  try {
    const balance = await getCurrentBalance(page);
    
    if (!expectedPattern.test(balance)) {
      throw new Error(`Balance format invalid. Got: "${balance}", Expected pattern: ${expectedPattern}`);
    }
    
    console.log(`✅ Balance format verified: ${balance}`);
    return balance;
  } catch (error: any) {
    throw new Error(`
❌ BALANCE FORMAT VERIFICATION FAILED

🔍 Error: ${error.message}

💡 Expected format: Number with up to 3 decimal places
📊 Examples: "0", "123.456", "1000.1"

📍 Debug steps:
   1. Check balance display in UI
   2. Verify number formatting logic
   3. Check if balance is "0" vs empty string
    `);
  }
}

/**
 * Helper function to verify LOV token label is present
 */
export async function verifyLOVTokenLabel(page: Page) {
  try {
    await expectElementVisible(
      page,
      'span:has-text("LOV")',
      'LOV Token Label',
      { timeout: 5000 }
    );
    console.log('✅ LOV token label verified');
  } catch (error: any) {
    throw new Error(`
❌ LOV TOKEN LABEL NOT FOUND

🔍 Error: ${error.message}

💡 Possible causes:
   1. Token label text changed
   2. Component structure changed
   3. CSS classes affecting visibility

📍 Debug steps:
   1. Check token card content
   2. Verify "LOV" text is present
   3. Check component HTML structure
    `);
  }
}

/**
 * Helper function to wait for balance to update after refresh
 */
export async function waitForBalanceUpdate(page: Page, previousBalance: string, testContext: string, timeout: number = 10000) {
  const startTime = Date.now();
  
  try {
    while (Date.now() - startTime < timeout) {
      const currentBalance = await getCurrentBalance(page);
      
      // If balance changed or we confirmed it stayed the same (both are valid outcomes)
      if (currentBalance !== previousBalance) {
        console.log(`✅ Balance updated from "${previousBalance}" to "${currentBalance}": ${testContext}`);
        return currentBalance;
      }
      
      // Wait a bit before checking again
      await page.waitForTimeout(500);
    }
    
    // If we get here, balance didn't change - this might still be valid
    const finalBalance = await getCurrentBalance(page);
    console.log(`ℹ️ Balance remained same after refresh: "${finalBalance}": ${testContext}`);
    return finalBalance;
    
  } catch (error: any) {
    throw new Error(`
❌ BALANCE UPDATE CHECK FAILED: ${testContext}

🔍 Error: ${error.message}
⏱️ Timeout: ${timeout}ms
📊 Previous balance: ${previousBalance}

💡 Possible causes:
   1. Balance update is slow
   2. API response doesn't update UI immediately
   3. React state not updating
   4. Component re-render issues

📍 Debug steps:
   1. Check if API response was successful
   2. Monitor React Query cache updates
   3. Check browser console for errors
   4. Verify component re-renders after API call
    `);
  }
}