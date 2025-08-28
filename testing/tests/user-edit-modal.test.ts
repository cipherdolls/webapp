import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { expectElementVisible, expectTextVisible, connectWallet } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

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
    await metamask.confirmSignature();
    
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
          localStorage.setItem('token', JSON.stringify(token));
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: 'token',
              newValue: JSON.stringify(token),
            })
          );
        }, tokenFromResponse);

        await page.waitForTimeout(3000);
      }
    }

    // Navigate to home page if not already there
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Helper function to open user edit modal
  async function openUserEditModal(page: any) {
    // Look for the pen icon button in the dashboard banner
    const penButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    
    // Alternative selector - look for pen button specifically
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
      await authenticateAndNavigateToHome(page, metamask, 'User Edit Modal Test - Name Only');
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
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for the modal to close (success)
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
      
      console.log(`✅ Name changed from "${currentName}" to "${newName}"`);
    });

    console.log('✅ User edit modal - name only test completed');
  });

  test('should open user edit modal and modify gender only', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

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
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for the modal to close
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
    });

    console.log('✅ User edit modal - gender only test completed');
  });

  test('should open user edit modal and modify both name and gender', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

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
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"]:has-text("Save Changes")');
      await saveButton.click();
      
      // Wait for the modal to close
      await page.waitForTimeout(3000);
      
      // Verify modal closed
      const modalVisible = await page.locator('[data-testid="user-edit-modal"]').isVisible().catch(() => false);
      if (modalVisible) {
        throw new Error('❌ Modal should have closed after successful save');
      }
      
      console.log('✅ Both name and gender updated successfully');
    });

    console.log('✅ User edit modal - both fields test completed');
  });

  test('should handle modal cancel functionality', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Setup and authenticate', async () => {
      await authenticateAndNavigateToHome(page, metamask, 'User Edit Modal Test - Cancel');
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
  });
});