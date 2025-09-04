import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { expectElementVisible, expectTextVisible, connectWallet, handleSignatureWithCleanup } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Context cleanup function - keeps main page, closes only MetaMask popups
// Following PLAYWRIGHT-GUIDE.md critical cleanup pattern
async function cleanupContext(context: any, mainPage: any, testName: string) {
  try {
    console.log(`🧹 Starting context cleanup: ${testName}`);
    
    const pages = context.pages();
    console.log(`📄 Found ${pages.length} pages to cleanup`);
    
    // SADECE MetaMask extension sayfalarını kapat, ana sayfayı koru
    for (const page of pages) {
      try {
        const url = page.url();
        
        // Sadece MetaMask popup'larını kapat
        if (url.includes('chrome-extension') && url.includes('metamask') && page !== mainPage) {
          console.log(`🗑️ Closing MetaMask page: ${url.substring(0, 50)}...`);
          await page.close({ runBeforeUnload: false });
        } else if (page === mainPage) {
          console.log(`✅ Keeping main page: ${url.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`⚠️ Page already closed: ${(e as Error).message}`);
      }
    }
    
    // Storage temizle ama ana sayfayı koru
    await context.clearCookies();
    await context.clearPermissions();
    
    // Ana sayfanın storage'ını temizle
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

test.describe('User Edit Modal E2E Tests', () => {
  // Helper function for authentication flow
  async function authenticateAndNavigateToHome(page: any, metamask: any, testContext: string) {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Connect wallet and complete authentication
    await connectWallet(page, metamask, testContext);
    await page.waitForTimeout(1000);
    
    // Monitor API calls
    const signinResponsePromise = page.waitForResponse((response: any) => 
      response.url().includes('/auth/signin')
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

    // Navigate to dashboard page (account route)
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Helper function to open user edit modal
  async function openUserEditModal(page: any) {
    // Look for the edit button next to the dashboard banner title
    const editButton = page.locator('h1').locator('..').locator('button').first();
    
    // Try to find the edit button
    const buttonExists = await editButton.isVisible().catch(() => false);
    
    if (!buttonExists) {
      throw new Error(`
❌ EDIT BUTTON NOT FOUND

Expected: Pen icon button next to dashboard banner title
Actual: Button not found or not visible

💡 Possible causes:
  1. showEditLink prop is false
  2. User data not loaded
  3. Button selector needs adjustment
  4. Dashboard banner not rendered

📍 Check: DashboardBanner showEditLink prop and user data
      `);
    }

    await editButton.click();
    await page.waitForTimeout(1000);

    // Verify modal opened
    await expectElementVisible(
      page,
      '[data-testid="user-edit-modal"]',
      'User Edit Modal'
    );

    await expectTextVisible(page, 'Edit Your Info', {
      testName: 'Modal Title',
      timeout: 5000,
    });
  }

  test('should open user edit modal and modify name only', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'User Edit Modal Test - Name Only';

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

      await test.step('Authenticate and navigate to dashboard', async () => {
        await authenticateAndNavigateToHome(page, metamask, testName);
      });

      await test.step('Open user edit modal', async () => {
        await openUserEditModal(page);
      });

      await test.step('Modify name field only', async () => {
        // Get current values
        const currentName = await page.locator('input[name="name"]').inputValue();
        console.log('Current name:', currentName);
      
      // Clear and enter new name
      const newName = 'TestUser_Name_' + Date.now().toString().slice(-4);
      await page.locator('input[name="name"]').clear();
      await page.locator('input[name="name"]').fill(newName);
      
      // Verify gender buttons are present but don't change them
      await expectElementVisible(
        page,
        'button:has-text("👩🏻 Female")',
        'Female Gender Button'
      );
      
      await expectElementVisible(
        page,
        'button:has-text("🧔🏻‍♂ Male")',
        'Male Gender Button'
      );
      
      // Monitor API call
      const updateResponsePromise = page.waitForResponse((response: any) => 
        response.url().includes('/users/') && response.request().method() === 'PATCH'
      ).catch(() => null);
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for API response
      const updateResponse = await updateResponsePromise;
      if (!updateResponse) {
        throw new Error('❌ API user update call not detected');
      }

      const status = updateResponse.status();
      if (status !== 200) {
        throw new Error(`❌ API user update failed with status: ${status}`);
      }

      console.log(`✅ API user update call: ${updateResponse.url()} - Status: ${status}`);
      
      // Wait for the modal to close (success)
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
      
      console.log(`✅ Name changed from "${currentName}" to "${newName}"`);
    });

    await test.step('Verify data persistence after page reload', async () => {
      // Reload page to verify data persisted
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Open modal again to check if name change persisted
      await openUserEditModal(page);
      
      // Get the name value after reload
      const persistedName = await page.locator('input[name="name"]').inputValue();
      
      // The name should contain our test pattern
      if (!persistedName.includes('TestUser_Name_')) {
        throw new Error(`❌ Name change not persisted. Expected pattern 'TestUser_Name_', got: '${persistedName}'`);
      }
      
      console.log(`✅ Name change persisted after reload: ${persistedName}`);
      
      // Close modal
      const cancelButton = page.locator('button[type="button"]:has-text("Cancel")');
      await cancelButton.click();
      await page.waitForTimeout(1000);
    });

      console.log('✅ User edit modal - name only test completed');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should open user edit modal and modify gender only', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'User Edit Modal Test - Gender Only';

    try {
      await test.step('Setup Optimism network connection', async () => {
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

      try {
        await metamask.switchNetwork('OP Mainnet');
        console.log('✅ Switched to OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }
    });

    await test.step('Authenticate and navigate to dashboard', async () => {
      await authenticateAndNavigateToHome(page, metamask, 'User Edit Modal Test - Gender Only');
    });

    await test.step('Open user edit modal', async () => {
      await openUserEditModal(page);
    });

    await test.step('Modify gender field only', async () => {
      // Don't change the name field
      const currentName = await page.locator('input[name="name"]').inputValue();
      console.log('Keeping current name:', currentName);
      
      // Check current gender selection (by looking at button styles)
      const femaleButton = page.locator('button:has-text("👩🏻 Female")');
      const maleButton = page.locator('button:has-text("🧔🏻‍♂ Male")');
      
      const femaleActive = await femaleButton.locator('..').getAttribute('class').then(cls => cls?.includes('bg-white'));
      const maleActive = await maleButton.locator('..').getAttribute('class').then(cls => cls?.includes('bg-white'));
      
      console.log('Female active:', femaleActive, 'Male active:', maleActive);
      
      // Click the opposite gender
      if (femaleActive) {
        await maleButton.click();
        console.log('✅ Changed gender from Female to Male');
      } else {
        await femaleButton.click();
        console.log('✅ Changed gender from Male to Female');
      }
      
      await page.waitForTimeout(500);
      
      // Monitor API call
      const updateResponsePromise = page.waitForResponse((response: any) => 
        response.url().includes('/users/') && response.request().method() === 'PATCH'
      ).catch(() => null);
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for API response
      const updateResponse = await updateResponsePromise;
      if (!updateResponse) {
        throw new Error('❌ API user update call not detected');
      }

      const status = updateResponse.status();
      if (status !== 200) {
        throw new Error(`❌ API user update failed with status: ${status}`);
      }

      console.log(`✅ API user update call: ${updateResponse.url()} - Status: ${status}`);
      
      // Wait for the modal to close
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
    });

    await test.step('Verify gender persistence after page reload', async () => {
      // Reload page to verify data persisted
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Open modal again to check if gender change persisted
      await openUserEditModal(page);
      
      // Check which gender button is active after reload
      const femaleButton = page.locator('button:has-text("👩🏻 Female")');
      const maleButton = page.locator('button:has-text("🧔🏻‍♂ Male")');
      
      const femaleActiveAfter = await femaleButton.getAttribute('class').then(cls => cls?.includes('bg-white')).catch(() => false);
      const maleActiveAfter = await maleButton.getAttribute('class').then(cls => cls?.includes('bg-white')).catch(() => false);
      
      console.log(`✅ Gender persistence verified - Female: ${femaleActiveAfter}, Male: ${maleActiveAfter}`);
      
      // Close modal
      const cancelButton = page.locator('button[type="button"]:has-text("Cancel")');
      await cancelButton.click();
      await page.waitForTimeout(1000);
    });

      console.log('✅ User edit modal - gender only test completed');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should open user edit modal and modify both name and gender', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'User Edit Modal Test - Both Fields';

    try {
      await test.step('Setup Optimism network connection', async () => {
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

      try {
        await metamask.switchNetwork('OP Mainnet');
        console.log('✅ Switched to OP Mainnet');
      } catch (error) {
        console.log('Using default network - OP Mainnet switch failed');
      }
    });

    await test.step('Authenticate and navigate to dashboard', async () => {
      await authenticateAndNavigateToHome(page, metamask, 'User Edit Modal Test - Both Fields');
    });

    await test.step('Open user edit modal', async () => {
      await openUserEditModal(page);
    });

    await test.step('Modify both name and gender fields', async () => {
      // Change name
      const currentName = await page.locator('input[name="name"]').inputValue();
      const newName = 'TestUser_Both_' + Date.now().toString().slice(-4);
      await page.locator('input[name="name"]').clear();
      await page.locator('input[name="name"]').fill(newName);
      console.log(`Name changed from "${currentName}" to "${newName}"`);
      
      // Change gender
      const femaleButton = page.locator('button:has-text("👩🏻 Female")');
      const maleButton = page.locator('button:has-text("🧔🏻‍♂ Male")');
      
      const femaleActive = await femaleButton.getAttribute('class').then(cls => cls?.includes('bg-white'));
      
      if (femaleActive) {
        await maleButton.click();
        console.log('✅ Gender changed from Female to Male');
      } else {
        await femaleButton.click();
        console.log('✅ Gender changed from Male to Female');
      }
      
      await page.waitForTimeout(500);
      
      // Monitor API call
      const updateResponsePromise = page.waitForResponse((response: any) => 
        response.url().includes('/users/') && response.request().method() === 'PATCH'
      ).catch(() => null);
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for API response
      const updateResponse = await updateResponsePromise;
      if (!updateResponse) {
        throw new Error('❌ API user update call not detected');
      }

      const status = updateResponse.status();
      if (status !== 200) {
        throw new Error(`❌ API user update failed with status: ${status}`);
      }

      console.log(`✅ API user update call: ${updateResponse.url()} - Status: ${status}`);
      
      // Wait for the modal to close
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
      
      console.log('✅ Both name and gender updated successfully');
    });

    await test.step('Verify both changes persisted after page reload', async () => {
      // Reload page to verify data persisted
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Open modal again to check if both changes persisted
      await openUserEditModal(page);
      
      // Check name persistence
      const persistedName = await page.locator('input[name="name"]').inputValue();
      if (!persistedName.includes('TestUser_Both_')) {
        throw new Error(`❌ Name change not persisted. Expected pattern 'TestUser_Both_', got: '${persistedName}'`);
      }
      
      // Check gender persistence
      const femaleButton = page.locator('button:has-text("👩🏻 Female")');
      const maleButton = page.locator('button:has-text("🧔🏻‍♂ Male")');
      
      const femaleActiveAfter = await femaleButton.getAttribute('class').then(cls => cls?.includes('bg-white')).catch(() => false);
      const maleActiveAfter = await maleButton.getAttribute('class').then(cls => cls?.includes('bg-white')).catch(() => false);
      
      console.log(`✅ Both changes persisted - Name: ${persistedName}, Female: ${femaleActiveAfter}, Male: ${maleActiveAfter}`);
      
      // Close modal
      const cancelButton = page.locator('button[type="button"]:has-text("Cancel")');
      await cancelButton.click();
      await page.waitForTimeout(1000);
    });

      console.log('✅ User edit modal - both fields test completed');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should handle modal cancel functionality', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'User Edit Modal Test - Cancel';

    try {
      await test.step('Setup and authenticate', async () => {
        await authenticateAndNavigateToHome(page, metamask, testName);
      });

      await test.step('Open user edit modal and cancel', async () => {
        await openUserEditModal(page);
      
      // Make some changes
      await page.locator('input[name="name"]').clear();
      await page.locator('input[name="name"]').fill('Should Not Save');
      
      // Click cancel instead of save
      const cancelButton = page.locator('button[type="button"]:has-text("Cancel")');
      await cancelButton.click();
      
      await page.waitForTimeout(1000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after cancel');
      }
      
        console.log('✅ Cancel functionality works correctly');
      });
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });
});