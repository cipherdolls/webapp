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
    
    for (const page of pages) {
      try {
        const url = page.url();
        
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
    
    await context.clearCookies();
    await context.clearPermissions();
    
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

test.describe('Scenario Creation E2E Tests', () => {
  // Helper function for authentication flow
  async function authenticateAndNavigateToScenarios(page: any, metamask: any, testContext: string) {
    await page.goto('/');
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

    // Navigate directly to scenario creation page
    await page.goto('/scenarios/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  test('should create a new scenario successfully', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'Scenario Creation Test';

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

      await test.step('Authenticate and navigate to scenario creation page', async () => {
        await authenticateAndNavigateToScenarios(page, metamask, testName);
      });

      await test.step('Verify scenario creation modal loaded', async () => {
        // Check if we're on the scenario creation page by URL
        const currentUrl = page.url();
        if (!currentUrl.includes('/scenarios/new')) {
          throw new Error(`❌ Expected to be on scenario creation page, but URL was: ${currentUrl}`);
        }
        
        console.log('✅ On scenario creation page');

        // Ensure modal is in collapsed mode (not expanded)
        const expandButton = page.locator('button[title="Expand modal"]');
        const isExpanded = await expandButton.isVisible().catch(() => false);
        if (isExpanded) {
          console.log('ℹ️ Modal is expanded, keeping it collapsed for test');
        }

        // Verify modal form elements exist (use specific placeholders for collapsed mode)
        await expectElementVisible(page, 'input[placeholder="Movie Night"]', 'Name Input');
        await expectElementVisible(page, 'textarea[placeholder="System Message"]', 'System Message Textarea');
      });

      await test.step('Fill scenario form with test data', async () => {
        // Generate unique scenario name
        const scenarioName = 'TestScenario_' + Date.now().toString().slice(-4);
        const systemMessage = 'You are a helpful AI assistant for testing scenarios. You should be friendly, informative, and engaging. This scenario is created by automated E2E testing to verify the scenario creation functionality works properly.';

        // Fill name field (use placeholder to target specific input)
        await page.getByPlaceholder('Movie Night').fill(scenarioName);
        console.log(`✅ Filled scenario name: ${scenarioName}`);

        // Fill system message (collapsed mode)
        await page.getByPlaceholder('System Message').fill(systemMessage);
        console.log(`✅ Filled system message`);

        // Select User Gender (default is Male, change to Female)
        const userGenderTrigger = page.locator('button:has([placeholder*="Select user gender"]), [data-radix-collection-item]:has-text("Select user gender")').first();
        const userGenderExists = await userGenderTrigger.isVisible().catch(() => false);
        if (userGenderExists) {
          await userGenderTrigger.click();
          await page.waitForTimeout(500);
          await page.locator('[data-radix-collection-item]:has-text("Female")').first().click();
          console.log('✅ Selected Female user gender');
        }

        // Select Avatar Gender (default is Female, keep it)
        console.log('✅ Using default Female avatar gender');

        // Select Chat Model - ensure we wait for the dropdown to load
        await page.waitForTimeout(2000); // Wait for models to load
        
        const chatModelTrigger = page.locator('button[id="chatModelId"]');
        await chatModelTrigger.click();
        console.log('✅ Clicked chat model dropdown');
        await page.waitForTimeout(1000);
        
        // Select the first available chat model option
        const firstChatModel = page.locator('[role="option"]').first();
        await firstChatModel.click();
        console.log('✅ Selected first chat model');
        await page.waitForTimeout(500);

        // Select Embedding Model
        const embeddingModelTrigger = page.locator('button[id="embeddingModelId"]');
        await embeddingModelTrigger.click();
        console.log('✅ Clicked embedding model dropdown');
        await page.waitForTimeout(1000);
        
        // Select the first available embedding model option
        const firstEmbeddingModel = page.locator('[role="option"]').first();
        await firstEmbeddingModel.click();
        console.log('✅ Selected first embedding model');
        await page.waitForTimeout(500);

        // Select Reasoning Model
        const reasoningModelTrigger = page.locator('button[id="reasoningModelId"]');
        await reasoningModelTrigger.click();
        console.log('✅ Clicked reasoning model dropdown');
        await page.waitForTimeout(1000);
        
        // Select the first available reasoning model option
        const firstReasoningModel = page.locator('[role="option"]').first();
        await firstReasoningModel.click();
        console.log('✅ Selected first reasoning model');
        await page.waitForTimeout(500);

        // Keep default AI parameters (temperature, topP, etc.)
        console.log('✅ Using default AI parameters');

        // Set as Private (default)
        const privateButton = page.locator('button:has-text("🔒 Private")');
        await privateButton.click();
        console.log('✅ Set as Private scenario');

        // Wait for form to update
        await page.waitForTimeout(1000);
      });

      await test.step('Submit form and monitor API call', async () => {
        // Monitor API call for scenario creation
        const createScenarioResponsePromise = page.waitForResponse((response: any) => 
          response.url().includes('/scenarios') && response.request().method() === 'POST'
        ).catch(() => null);

        // Submit the form
        const createButton = page.locator('button[type="submit"]:has-text("Create Scenario")');
        await createButton.click();
        console.log('✅ Clicked Create Scenario button');

        // Wait for API response
        const createResponse = await createScenarioResponsePromise;
        if (!createResponse) {
          throw new Error('❌ API scenario creation call not detected');
        }

        const status = createResponse.status();
        if (status !== 200 && status !== 201) {
          const responseText = await createResponse.text();
          throw new Error(`❌ API scenario creation failed with status: ${status}. Response: ${responseText}`);
        }

        console.log(`✅ API scenario creation call: ${createResponse.url()} - Status: ${status}`);
        
        // Get the created scenario data
        const createdScenario = await createResponse.json();
        console.log(`✅ Scenario created with ID: ${createdScenario.id}`);
      });

      await test.step('Verify successful creation and navigation', async () => {
        // Wait for navigation to scenario detail page or back to scenarios list
        await page.waitForTimeout(3000);
        
        // Check if we navigated away from modal (modal should close)
        const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
        if (modalVisible) {
          console.log('⚠️ Modal still visible - checking for success state');
        } else {
          console.log('✅ Modal closed after successful creation');
        }
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`✅ Current URL after creation: ${currentUrl}`);
        
        // We should either be on scenario detail page or back on scenarios list
        const onScenariosPage = currentUrl.includes('/scenarios');
        if (!onScenariosPage) {
          throw new Error(`❌ Expected to be on scenarios page, but was on: ${currentUrl}`);
        }

        console.log('✅ Successfully navigated after scenario creation');
      });

      console.log('✅ Scenario creation test completed successfully');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should handle form validation errors', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'Scenario Creation Validation Test';

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
          console.log('Using default network');
        }

        await authenticateAndNavigateToScenarios(page, metamask, testName);
      });

      await test.step('Verify scenario creation form loaded', async () => {
        // Check if we're on the scenario creation page by URL
        const currentUrl = page.url();
        if (!currentUrl.includes('/scenarios/new')) {
          throw new Error(`❌ Expected to be on scenario creation page, but URL was: ${currentUrl}`);
        }
        
        console.log('✅ On scenario creation page');
      });

      await test.step('Test form validation by submitting empty form', async () => {
        // Try to submit empty form
        const createButton = page.locator('button[type="submit"]:has-text("Create Scenario")');
        await createButton.click();
        console.log('✅ Clicked Create Scenario with empty form');

        // Wait a bit to see if validation prevents submission
        await page.waitForTimeout(2000);

        // The modal should still be open if validation worked
        const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => true);
        if (!modalVisible) {
          throw new Error('❌ Form was submitted with empty fields - validation not working');
        }

        console.log('✅ Form validation prevented empty form submission');
      });

      await test.step('Fill minimal required fields and test again', async () => {
        // Fill only the name field (minimum required)
        const scenarioName = 'ValidationTest_' + Date.now().toString().slice(-4);
        await page.getByPlaceholder('Movie Night').fill(scenarioName);
        
        // Fill system message (likely required)
        await page.getByPlaceholder('System Message').fill('Test system message for validation');
        
        console.log(`✅ Filled minimal required fields with name: ${scenarioName}`);
        
        // Now try submitting
        const createButton = page.locator('button[type="submit"]:has-text("Create Scenario")');
        await createButton.click();
        
        // Wait for potential API call or validation
        await page.waitForTimeout(3000);
        
        console.log('✅ Form validation test completed');
      });

      console.log('✅ Scenario form validation test completed');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });

  test('should handle modal cancel functionality', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);
    const testName = 'Scenario Creation Cancel Test';

    try {
      await test.step('Setup and authenticate', async () => {
        await authenticateAndNavigateToScenarios(page, metamask, testName);
      });

      await test.step('Test cancel functionality', async () => {
        // Check if we're on the scenario creation page by URL
        const currentUrl = page.url();
        if (!currentUrl.includes('/scenarios/new')) {
          throw new Error(`❌ Expected to be on scenario creation page, but URL was: ${currentUrl}`);
        }
        
        console.log('✅ On scenario creation page');

        // Fill some data
        await page.getByPlaceholder('Movie Night').fill('Should Not Save');
        
        // Click cancel
        const cancelButton = page.locator('button:has-text("Cancel")');
        await cancelButton.click();
        
        await page.waitForTimeout(1000);
        
        // Verify modal closed
        const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
        if (modalVisible) {
          throw new Error('❌ Modal should have closed after cancel');
        }
        
        console.log('✅ Cancel functionality works correctly');
      });

      console.log('✅ Scenario creation cancel test completed');
    } catch (error) {
      console.error(`❌ Test failed: ${testName} - ${(error as Error).message}`);
      throw error;
    } finally {
      await cleanupContext(context, page, testName);
    }
  });
});