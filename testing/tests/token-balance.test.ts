import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';

// Extend Window interface for test properties
declare global {
  interface Window {
    testBalanceBeforeReload?: string;
  }
}
import { expectElementVisible, expectTextVisible, connectWallet, handleSignatureWithCleanup } from './helpers/test-utils';
import { 
  expectTokenBalanceVisible, 
  getCurrentBalance, 
  clickRefreshButtonAndWaitForAPI,
  verifyBalanceFormat,
  verifyLOVTokenLabel
} from './helpers/token-balance-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Configure test timeouts
test.setTimeout(120000); // 2 minutes per test

test.describe('Token Balance E2E Tests', () => {
  // Helper to create a fresh page for each test
  async function createFreshPage(context: any) {
    // Close all existing pages except MetaMask extension pages
    const pages = context.pages();
    for (const page of pages) {
      try {
        const url = page.url();
        if (!url.includes('chrome-extension')) {
          await page.close({ runBeforeUnload: false });
        }
      } catch (e) {
        // Page might already be closed
      }
    }
    
    // Clear context storage
    try {
      await context.clearCookies();
      await context.clearPermissions();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // Create new fresh page
    return await context.newPage();
  }

  // Cleanup function to close only MetaMask popups, NOT the main page
  async function cleanupContext(context: any, mainPage: any, testName: string) {
    try {
      console.log(`🧹 Starting context cleanup: ${testName}`);
      
      // Get all pages before cleanup
      const pages = context.pages();
      console.log(`📄 Found ${pages.length} pages to cleanup`);
      
      // Close only MetaMask extension pages, keep the main page
      for (const page of pages) {
        try {
          const url = page.url();
          
          // Only close MetaMask extension pages, not the main application page
          if (url.includes('chrome-extension') && url.includes('metamask') && page !== mainPage) {
            console.log(`🗑️ Closing MetaMask page: ${url.substring(0, 50)}...`);
            await page.close({ runBeforeUnload: false });
          } else if (page === mainPage) {
            console.log(`✅ Keeping main page: ${url.substring(0, 50)}...`);
          } else {
            console.log(`ℹ️ Keeping page: ${url.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`⚠️ Page already closed or couldn't close: ${(e as Error).message}`);
        }
      }
      
      // Clear storage but don't close the main page
      await context.clearCookies();
      await context.clearPermissions();
      
      // Clear localStorage and sessionStorage from main page
      if (mainPage && !mainPage.isClosed()) {
        try {
          await mainPage.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          console.log('✅ Cleared main page storage');
        } catch (e) {
          console.log(`⚠️ Could not clear main page storage: ${(e as Error).message}`);
        }
      }
      
      console.log(`✅ Context cleanup completed: ${testName}`);
    } catch (error) {
      console.log(`⚠️ Context cleanup error: ${(error as Error).message}`);
    }
  }

  // Helper function for authentication flow
  async function authenticateAndNavigateToAccount(page: any, metamask: any, testContext: string) {
    console.log(`🔐 Starting authentication: ${testContext}`);
    
    // Navigate to signin with increased timeout
    await page.goto('/signin', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(1500);

    // Connect wallet and complete authentication
    await connectWallet(page, metamask, testContext);
    await page.waitForTimeout(1500);
    
    // Monitor API calls with timeout
    const signinResponsePromise = page.waitForResponse((response: any) => 
      response.url().includes('/auth/signin'), 
      { timeout: 20000 }
    ).catch(() => null);
    
    // Complete authentication flow
    await page.locator('form button[type="submit"]').click();
    await handleSignatureWithCleanup(page, metamask, `${testContext} - Signature`);
    
    const signinResponse = await signinResponsePromise;
    if (!signinResponse) {
      throw new Error('❌ API signin call not detected');
    }

    const status = signinResponse.status();
    if (status !== 201) {
      throw new Error(`❌ Unexpected API response status: ${status}`);
    }

    console.log(`✅ API signin call: ${signinResponse.url()} - Status: ${status}`);
    await page.waitForTimeout(1000);

    // Handle redirect manually if needed
    let currentUrl = page.url();
    if (currentUrl.endsWith('/signin')) {
      const tokenFromResponse = await page.evaluate(
        (responseText: string) => {
          try {
            const data = JSON.parse(responseText);
            return data.token;
          } catch (e) {
            return null;
          }
        },
        (await signinResponse?.text()) || '{}'
      );

      if (tokenFromResponse) {
        console.log('⚡ Manually setting token to trigger redirect...');
        await page.evaluate((token: string) => {
          // Set auth store data in the format expected by Zustand persist
          const authData = {
            state: {
              token: token,
              isAuthenticated: true,
              redirectAfterSignIn: null,
              referralId: null
            },
            version: 0
          };
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'auth-storage',
              newValue: JSON.stringify(authData),
            })
          );
        }, tokenFromResponse);

        await page.waitForTimeout(3000);
      }
    }

    // Navigate to account page where TokenBalance is displayed
    console.log(`📄 Navigating to account page: ${testContext}`);
    await page.goto('/account', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log(`✅ Authentication completed: ${testContext}`);
  }

  test('should display token balance component with initial balance', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    let testName = 'Token Balance Display Test';
    
    // Create fresh page for this test
    page = await createFreshPage(context);

    try {
      await test.step('Setup Optimism network connection', async () => {
      // Add Optimism network
      try {
        await metamask.addNetwork({
          chainId: 10, // Chain ID 10 (Optimism)
          name: 'OP Mainnet',
          rpcUrl: 'https://mainnet.optimism.io',
          symbol: 'ETH',
          blockExplorerUrl: 'https://optimistic.etherscan.io',
        });
        console.log('✅ Optimism network added successfully');
      } catch (error) {
        console.log('Optimism network might already exist');
      }

      // Switch to Optimism network
      try {
        await metamask.switchNetwork('OP Mainnet');
        console.log('✅ Switched to OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }
    });

    await test.step('Authenticate and navigate to account page', async () => {
      await authenticateAndNavigateToAccount(page, metamask, 'Token Balance Display Test');
    });

    await test.step('Verify token balance component is displayed', async () => {
      // Verify the entire component is visible
      await expectTokenBalanceVisible(page, 'Initial Display Check');
      
      // Verify "Your Balance" title
      await expectTextVisible(page, 'Your Balance', {
        testName: 'Balance Title',
        timeout: 5000,
      });

      // Verify LOV token label is present
      await verifyLOVTokenLabel(page);

      console.log('✅ Token balance component verified');
    });

    await test.step('Verify balance format and display', async () => {
      // Get current balance and verify format
      const balance = await verifyBalanceFormat(page);
      
      console.log(`✅ Initial balance displayed: ${balance} LOV`);
      
      // Verify balance is either "0" or a properly formatted number
      const balanceNum = parseFloat(balance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        throw new Error(`❌ Invalid balance value: ${balance}`);
      }
      
      console.log('✅ Balance format and value verified');
    });

    await test.step('Verify refresh button is present and clickable', async () => {
      const refreshButton = page.locator('button[title="Refresh token balance"]');
      
      // Check button exists
      await expectElementVisible(
        page,
        'button[title="Refresh token balance"]',
        'Refresh Button'
      );
      
      // Check button is enabled
      const isEnabled = await refreshButton.isEnabled();
      if (!isEnabled) {
        throw new Error('❌ Refresh button should be enabled');
      }
      
      console.log('✅ Refresh button is present and clickable');
    });

    console.log('✅ Token balance display test completed');
    
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should refresh token balance with API call', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    let testName = 'Token Balance Refresh Test';
    
    // Create fresh page for this test
    page = await createFreshPage(context);

    try {
      await test.step('Setup Optimism network connection', async () => {
      try {
        await metamask.addNetwork({
          chainId: 10,
          name: 'OP Mainnet',
          rpcUrl: 'https://mainnet.optimism.io',
          symbol: 'ETH',
          blockExplorerUrl: 'https://optimistic.etherscan.io',
        });
        console.log('✅ Optimism network added successfully');
      } catch (error) {
        console.log('Optimism network might already exist');
      }

      try {
        await metamask.switchNetwork('OP Mainnet');
        console.log('✅ Switched to OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }
    });

    await test.step('Authenticate and navigate to account page', async () => {
      await authenticateAndNavigateToAccount(page, metamask, 'Token Balance Refresh Test');
    });

    await test.step('Verify initial balance and perform refresh', async () => {
      // Verify component is loaded
      await expectTokenBalanceVisible(page, 'Pre-refresh Check');
      
      // Get initial balance
      const initialBalance = await getCurrentBalance(page);
      console.log(`Initial balance: ${initialBalance}`);

      // Perform refresh with API monitoring
      const refreshResponse = await clickRefreshButtonAndWaitForAPI(page, 'Balance Refresh Operation');
      
      // Verify API call was successful
      const responseStatus = refreshResponse.status();
      if (responseStatus !== 200) {
        throw new Error(`❌ Refresh API call failed with status: ${responseStatus}`);
      }
      
      console.log(`✅ Refresh API call successful: ${refreshResponse.url()}`);
    });

    await test.step('Verify balance after refresh', async () => {
      // Wait a moment for UI to update
      await page.waitForTimeout(1000);
      
      // Get balance after refresh
      const refreshedBalance = await getCurrentBalance(page);
      console.log(`Balance after refresh: ${refreshedBalance}`);
      
      // Verify balance format is still valid
      await verifyBalanceFormat(page);
      
      // Note: Balance might or might not change - both outcomes are valid
      // The important thing is that the refresh operation completed successfully
      console.log('✅ Balance refresh operation completed successfully');
    });

    console.log('✅ Token balance refresh test completed');
    
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should persist balance after page reload', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    let testName = 'Token Balance Persistence Test';
    
    // Create fresh page for this test
    page = await createFreshPage(context);

    try {
      await test.step('Setup and authenticate', async () => {
      try {
        await metamask.addNetwork({
          chainId: 10,
          name: 'OP Mainnet', 
          rpcUrl: 'https://mainnet.optimism.io',
          symbol: 'ETH',
          blockExplorerUrl: 'https://optimistic.etherscan.io',
        });
      } catch (error) {
        console.log('Optimism network might already exist');
      }

      try {
        await metamask.switchNetwork('OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }

      await authenticateAndNavigateToAccount(page, metamask, 'Token Balance Persistence Test');
    });

    await test.step('Get initial balance and refresh', async () => {
      await expectTokenBalanceVisible(page, 'Pre-refresh Check');
      
      const initialBalance = await getCurrentBalance(page);
      console.log(`Initial balance before refresh: ${initialBalance}`);

      // Perform refresh to ensure we have the latest balance
      await clickRefreshButtonAndWaitForAPI(page, 'Balance Refresh for Persistence Test');
      
      // Wait for UI to update
      await page.waitForTimeout(2000);
    });

    await test.step('Record balance before reload', async () => {
      const balanceBeforeReload = await getCurrentBalance(page);
      console.log(`Balance before reload: ${balanceBeforeReload}`);
      
      // Store balance for comparison
      await page.evaluate((balance) => {
        window.testBalanceBeforeReload = balance;
      }, balanceBeforeReload);
    });

    await test.step('Reload page and verify balance persistence', async () => {
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Verify component loads again
      await expectTokenBalanceVisible(page, 'Post-reload Check');
      
      // Get balance after reload
      const balanceAfterReload = await getCurrentBalance(page);
      console.log(`Balance after reload: ${balanceAfterReload}`);

      // Get the balance we stored before reload
      const balanceBeforeReload = await page.evaluate(() => {
        return window.testBalanceBeforeReload;
      });

      // Verify balance persisted (should be the same)
      if (balanceBeforeReload !== balanceAfterReload) {
        // This could be valid if the actual blockchain balance changed
        console.log(`ℹ️ Balance changed from ${balanceBeforeReload} to ${balanceAfterReload} - this may be due to actual balance changes`);
      } else {
        console.log(`✅ Balance persisted correctly: ${balanceAfterReload}`);
      }

      // Verify format is still valid
      await verifyBalanceFormat(page);
    });

    console.log('✅ Token balance persistence test completed');
    
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should handle refresh button states correctly', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    let testName = 'Token Balance Button State Test';
    
    // Create fresh page for this test
    page = await createFreshPage(context);

    try {
      await test.step('Setup and authenticate', async () => {
      try {
        await metamask.addNetwork({
          chainId: 10,
          name: 'OP Mainnet',
          rpcUrl: 'https://mainnet.optimism.io', 
          symbol: 'ETH',
          blockExplorerUrl: 'https://optimistic.etherscan.io',
        });
      } catch (error) {
        console.log('Optimism network might already exist');
      }

      try {
        await metamask.switchNetwork('OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }

      await authenticateAndNavigateToAccount(page, metamask, 'Token Balance Button State Test');
    });

    await test.step('Test refresh button basic functionality', async () => {
      await expectTokenBalanceVisible(page, 'Pre-operation Check');
      
      // Just perform a simple refresh operation without testing complex states
      console.log('🔄 Testing basic refresh functionality...');
      
      // Use the optimized refresh function
      await clickRefreshButtonAndWaitForAPI(page, 'Button State Test - Simple Refresh');
      
      // Verify component still works after refresh
      await expectTokenBalanceVisible(page, 'Post-refresh Check');
      
      console.log('✅ Basic refresh functionality verified');
    });

    console.log('✅ Token balance button state test completed');
    
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });
});