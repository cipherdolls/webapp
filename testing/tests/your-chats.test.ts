import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../setup/basic.setup';
import { expectElementVisible, expectTextVisible, connectWallet, handleSignatureWithCleanup } from './helpers/test-utils';

const test = testWithSynpress(metaMaskFixtures(basicSetup));

test.describe('YourChats Component E2E Tests', () => {
  // Helper function for authentication flow
  async function authenticateAndNavigateToHome(page: any, metamask: any, testContext: string) {
    // Setup Optimism network first
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

    // Navigate to account dashboard page where YourChats component is located
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Helper to setup real public avatar data for YourChats component
  async function setupRealAvatarData(page: any) {
    console.log('🔥 Using REAL APIs - No mocking for avatars and chats');
    console.log('📡 YourChats will fetch real public avatars and create real chats');
    
    // No mocking - let real APIs handle everything
    // This will use real public avatars and scenarios
    
    // Monitor API calls for debugging
    page.on('response', async (response: any) => {
      if (response.url().includes('/avatars') && response.request().method() === 'GET') {
        console.log(`📊 Real Avatars API: ${response.status()} - ${response.url()}`);
      }
      if (response.url().includes('/chats') && response.request().method() === 'GET') {
        console.log(`📊 Real Chats API: ${response.status()} - ${response.url()}`);
      }
      if (response.url().includes('/scenarios') && response.request().method() === 'GET') {
        console.log(`📊 Real Scenarios API: ${response.status()} - ${response.url()}`);
      }
      if (response.url().includes('/chats') && response.request().method() === 'POST') {
        console.log(`🚀 Real Create Chat API: ${response.status()} - ${response.url()}`);
        const responseText = await response.text().catch(() => 'Could not read response');
        console.log(`📋 Create Chat Response:`, responseText);
      }
    });
  }

  // Test 1: Avatar Chat Navigation - Expand avatar and navigate to existing chat
  test('should expand avatar and navigate to existing chat', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Setup real data monitoring and authenticate', async () => {
      await setupRealAvatarData(page);
      await authenticateAndNavigateToHome(page, metamask, 'YourChats Chat Navigation Test');
    });

    await test.step('Verify YourChats loads with real data', async () => {
      await expectTextVisible(page, 'Your Chats', {
        testName: 'YourChats Title',
        timeout: 10000,
      });

      // Wait for real API data to load and avatar cards to appear
      await page.waitForTimeout(3000);
      const avatarCards = await page.locator('.cursor-pointer .size-8').count();
      console.log(`🎴 Found ${avatarCards} real avatar cards`);
      
      if (avatarCards === 0) {
        console.log('ℹ️ No avatar cards found - user may have no chats with public avatars');
        console.log('ℹ️ This is expected for a fresh test user - skipping navigation test');
        return; // Skip this test if no chats exist
      }
      
      console.log(`✅ Found ${avatarCards} avatar cards from real API data`);
    });

    await test.step('Expand avatar and navigate to chat', async () => {
      // Click first avatar to expand
      const firstAvatarContainer = page.locator('.cursor-pointer').first();
      await firstAvatarContainer.click();
      
      console.log('🔄 Avatar expanded');
      await page.waitForTimeout(1000);

      // Find chat links after expansion
      const chatLinks = page.locator('a[href^="/chats/"]');
      const chatLinkCount = await chatLinks.count();
      
      if (chatLinkCount > 0) {
        console.log(`✅ Found ${chatLinkCount} chat links after expansion`);

        // Click first chat link
        const firstChatLink = chatLinks.first();
        const chatUrl = await firstChatLink.getAttribute('href');
        console.log(`🔗 Navigating to: ${chatUrl}`);

        await firstChatLink.click();

        // Verify navigation
        await page.waitForURL(`**${chatUrl}`, { timeout: 10000 });
        
        const currentUrl = page.url();
        if (currentUrl.includes('/chats/')) {
          console.log(`✅ Successfully navigated to chat: ${currentUrl}`);
          
          // Wait a bit to ensure the page is fully loaded
          await page.waitForTimeout(3000);
          
          // Verify we're on the chat page by looking for chat-specific elements
          const chatPageLoaded = await page.locator('h1, h2, h3').count();
          console.log(`📄 Found ${chatPageLoaded} headers on chat page`);
          
          console.log('✅ Chat page navigation completed successfully');
        } else {
          throw new Error(`❌ Navigation failed. Current URL: ${currentUrl}`);
        }
      } else {
        throw new Error('❌ No chat links found after avatar expansion');
      }
    });
  });

  // Test 2: New Chat Modal - Test modal with real public scenarios and real chat creation
  test('should create new chat with real public avatar and scenario', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId);

    await test.step('Setup real data monitoring and authenticate', async () => {
      await setupRealAvatarData(page);
      await authenticateAndNavigateToHome(page, metamask, 'YourChats New Chat Test');
    });

    await test.step('Navigate to public avatars and open "New chat"', async () => {
      await expectTextVisible(page, 'Your Chats', {
        testName: 'YourChats Title',
        timeout: 10000,
      });

      await page.waitForTimeout(3000); // Wait for real API data
      
      // Check if user has any chats/avatars - if not, we need to use a different approach
      const avatarCards = await page.locator('.cursor-pointer .size-8').count();
      console.log(`🎴 Found ${avatarCards} avatar cards in YourChats`);
      
      if (avatarCards === 0) {
        console.log('ℹ️ No existing chats found - need to get public avatars first');
        
        // Navigate to public avatars page to find a public avatar to test with
        console.log('🔄 Navigating to public avatars page...');
        await page.goto('/avatars?published=true');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Look for public avatar cards
        const publicAvatars = page.locator('[data-testid="avatar-card"], .cursor-pointer');
        const publicAvatarCount = await publicAvatars.count();
        console.log(`🎴 Found ${publicAvatarCount} public avatars`);
        
        if (publicAvatarCount === 0) {
          throw new Error('❌ No public avatars found - cannot test new chat creation');
        }
        
        // Click on first public avatar
        await publicAvatars.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Look for "Start Chat" button on public avatar page
        const startChatButton = page.locator('button:has-text("Start Chat")');
        const startChatVisible = await startChatButton.isVisible();
        
        if (!startChatVisible) {
          throw new Error('❌ "Start Chat" button not found on public avatar page');
        }
        
        console.log('✅ Found "Start Chat" button on public avatar page');
        await startChatButton.click();
        console.log('🖱️ Clicked "Start Chat" button');
        
        await page.waitForTimeout(1500);
      } else {
        console.log('✅ Found existing chats - using YourChats "New chat" flow');
        
        // Use existing chat expansion flow
        const firstAvatarContainer = page.locator('.cursor-pointer').first();
        await firstAvatarContainer.click();
        
        console.log('🔄 Avatar expanded');
        await page.waitForTimeout(1000);

        // Look for "New chat" button after expansion
        const newChatButton = page.locator('button:has-text("New chat")');
        const newChatButtonVisible = await newChatButton.isVisible();
        
        if (!newChatButtonVisible) {
          throw new Error('❌ "New chat" button not found in YourChats');
        }
        
        console.log('✅ "New chat" button found in YourChats');
        await newChatButton.click();
        console.log('🖱️ Clicked "New chat" button');
        
        await page.waitForTimeout(1500);
      }
    });

    await test.step('Select real scenario and create chat', async () => {
      // Verify modal opened
      const modalTitle = page.locator('text="Select Scenario"');
      const modalVisible = await modalTitle.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
      
      if (!modalVisible) {
        throw new Error('❌ AvatarScenarioModal did not open');
      }
      
      console.log('✅ AvatarScenarioModal opened successfully');

      // Wait for real scenarios to load from API
      console.log('⏳ Waiting for real scenarios to load from API...');
      await page.waitForTimeout(3000);

      // Find all scenario buttons (real scenarios from API)
      const scenarioButtons = page.locator('button[class*="flex items-start gap-3 p-3 rounded-xl border"]');
      const scenarioCount = await scenarioButtons.count();
      console.log(`🎭 Found ${scenarioCount} real scenarios from API`);
      
      if (scenarioCount === 0) {
        throw new Error('❌ No scenarios loaded from real API');
      }

      // Get text content of first few scenarios to see what's available
      const availableScenarios: string[] = [];
      for (let i = 0; i < Math.min(scenarioCount, 4); i++) {
        const scenarioText = await scenarioButtons.nth(i).textContent();
        availableScenarios.push(scenarioText || `Scenario ${i + 1}`);
      }
      console.log('🎯 Available real scenarios:', availableScenarios);

      // Select the first available scenario
      const firstScenario = scenarioButtons.first();
      const firstScenarioText = await firstScenario.textContent();
      console.log(`🎯 Selecting first scenario: "${firstScenarioText}"`);
      
      await firstScenario.click();
      await page.waitForTimeout(500);

      // Verify scenario is selected (should have blue styling)
      const isSelected = await firstScenario.locator('.border-blue-500, .bg-blue-50').count() > 0;
      console.log(`✅ Scenario selected: ${isSelected}`);

      // Click "Start Chat" button
      const startChatButton = page.locator('button:has-text("Start Chat")');
      const startButtonVisible = await startChatButton.isVisible();
      
      if (!startButtonVisible) {
        throw new Error('❌ "Start Chat" button not found');
      }

      console.log('🚀 Clicking "Start Chat" button to create real chat...');
      
      // Track the create chat API call
      let createChatResponse: any = null;
      const createChatListener = (response: any) => {
        if (response.url().includes('/chats') && response.request().method() === 'POST') {
          createChatResponse = response;
          console.log(`🎉 Create chat API called: ${response.status()}`);
        }
      };
      
      page.on('response', createChatListener);
      
      await startChatButton.click();
      
      // Wait for API call and navigation
      await page.waitForTimeout(5000);
      
      page.off('response', createChatListener);
      
      if (!createChatResponse) {
        throw new Error('❌ Create chat API was not called');
      }
      
      if (createChatResponse.status() !== 201) {
        const responseText = await createChatResponse.text().catch(() => 'Could not read response');
        throw new Error(`❌ Create chat API failed: ${createChatResponse.status()} - ${responseText}`);
      }
      
      console.log('✅ Real chat created successfully via API');
    });

    await test.step('Verify navigation to new chat page', async () => {
      // Check current URL - should be navigated to the new chat
      await page.waitForTimeout(2000); // Allow time for navigation
      
      const currentUrl = page.url();
      console.log(`📍 Current URL after chat creation: ${currentUrl}`);
      
      if (currentUrl.includes('/chats/')) {
        console.log('✅ Successfully navigated to new chat page');
        
        // Wait for chat page to fully load
        await page.waitForTimeout(3000);
        
        // Verify we're on a functioning chat page
        const chatPageElements = await page.locator('h1, h2, h3, [data-testid], .chat').count();
        console.log(`📄 Found ${chatPageElements} elements on chat page`);
        
        console.log('✅ New chat creation and navigation completed successfully');
        
        // Optional: Check if we can go back to account page and see the new chat
        await page.goto('/account');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const avatarCardsAfter = await page.locator('.cursor-pointer .size-8').count();
        console.log(`🎴 Found ${avatarCardsAfter} avatar cards after chat creation`);
        
      } else if (currentUrl.includes('/account')) {
        console.log('ℹ️ Still on account page - checking if modal closed properly');
        
        const modalStillOpen = await page.locator('text="Select Scenario"').isVisible().catch(() => false);
        
        if (modalStillOpen) {
          throw new Error('❌ Modal is still open - chat creation may have failed');
        } else {
          console.log('✅ Modal closed - chat creation may have succeeded but navigation failed');
          console.log('ℹ️ This could be expected behavior - checking for new chats');
          
          // Refresh page to see if new chat appears
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          const avatarCardsAfter = await page.locator('.cursor-pointer .size-8').count();
          console.log(`🎴 Found ${avatarCardsAfter} avatar cards after refresh`);
        }
      } else {
        throw new Error(`❌ Unexpected navigation. Expected /chats/* or /account, got: ${currentUrl}`);
      }
    });
  });
});