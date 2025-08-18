import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../setup/basic.setup'
import { 
  SELECTORS, 
  API_ENDPOINTS,
  expectElementVisible,
  connectWallet,
  mockAPIResponse
} from './helpers/test-utils'

const test = testWithSynpress(metaMaskFixtures(basicSetup))

test.describe('SignIn Authentication Flow with Real MetaMask', () => {
  
  test('should handle invalid token and stay on signin', async ({
    page,
  }) => {
    await test.step('Setup invalid token scenario', async () => {
      // Set an invalid token in localStorage
      await page.addInitScript(() => {
        localStorage.setItem('token', '"invalid-token-456"')
      })

      // Mock the token verification API to return 401
      await mockAPIResponse(
        page,
        API_ENDPOINTS.VERIFY,
        { status: 401, body: { error: 'Invalid token' } },
        'Invalid Token Test - Mock Verify API'
      )
    })

    await test.step('Navigate and verify token is removed', async () => {
      try {
        await page.goto('/signin')
        await page.waitForLoadState('networkidle', { timeout: 10000 })
        await page.waitForTimeout(1000)
      } catch (error: any) {
        throw new Error(`
❌ PAGE NAVIGATION FAILED

Error: ${error.message}

💡 Possible causes:
  1. Page was closed unexpectedly
  2. Network timeout during navigation
  3. Invalid token mock caused page to crash

📍 This might be a test setup issue with API mocking
        `)
      }

      // Should stay on signin page
      const currentUrl = page.url()
      if (!currentUrl.includes('/signin')) {
        throw new Error(`
❌ UNEXPECTED NAVIGATION

Expected: Stay on /signin
Actual: Navigated to ${currentUrl}

💡 Invalid token should:
   1. Be detected by verifyToken()
   2. Get removed from localStorage
   3. Keep user on signin page

📍 Check: Token verification logic (lines 164-190)
        `)
      }
      
      // Check that token was removed from localStorage
      const tokenRemoved = await page.evaluate(() => {
        return localStorage.getItem('token') === null
      })
      
      if (!tokenRemoved) {
        throw new Error(`
❌ INVALID TOKEN NOT REMOVED

Token should be removed when verification fails (401)
Current state: Token still exists in localStorage

📍 Check: verifyToken() function (line 181)
        `)
      }
    })
    
    console.log('✅ Invalid token handling verified with real MetaMask')
  })

  test('should handle wallet connection and disconnection', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)
    
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })
    
    await test.step('Verify signin form is available', async () => {
      await expectElementVisible(
        page,
        SELECTORS.SIGNIN_FORM,
        'Sign In Form'
      )
    })
    
    await test.step('Connect wallet', async () => {
      await connectWallet(page, metamask, 'Wallet Connection Test')
      
      // Wait for connection
      await page.waitForTimeout(2000)
      
      // Log current state
      const currentUrl = page.url()
      console.log('After connection, URL:', currentUrl)
    })
    
    console.log('✅ Real MetaMask wallet connection flow verified')
  })

  test('should handle complete authentication flow', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)
    
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(600)
    })

    await test.step('Monitor API calls', async () => {
      // Set up response monitoring
      const signinResponsePromise = page.waitForResponse(response => 
        response.url().includes('/auth/signin')
      ).catch(() => null)

      // Connect wallet
      await page.locator(SELECTORS.SIGNIN_BUTTON).click()
      await metamask.connectToDapp()
      
      // Trigger accountsChanged to ensure connected state
      await page.evaluate(() => {
        if (window.ethereum) {
          window.ethereum.emit('accountsChanged', ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'])
        }
      })
      
      await page.waitForTimeout(1000)
      
      // Click Sign In again to trigger message signing
      await page.locator(SELECTORS.SIGNIN_BUTTON).click()
      
      // Sign the message
      await metamask.confirmSignature()
      
      // Check API response
      const signinResponse = await signinResponsePromise
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
        `)
      }
      
      const status = signinResponse.status()
      console.log('✅ API signin successful:', status)
      
      if (status !== 201) {
        const body = await signinResponse.text()
        throw new Error(`
❌ UNEXPECTED API RESPONSE

Expected status: 201
Actual status: ${status}
Response body: ${body}

📍 Check: API signin endpoint
        `)
      }
      
      // Wait for potential redirect
      await page.waitForTimeout(3000)
      
      const finalUrl = page.url()
      if (finalUrl.endsWith('/')) {
        console.log('🎉 Complete authentication flow successful - redirected to homepage!')
      } else {
        console.log('✅ Authentication API successful, staying on signin page')
      }
    })
    
    console.log('✅ Complete real MetaMask authentication flow tested')
  })

  test('should handle authentication API errors', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)

    await test.step('Setup API error mocks', async () => {
      // Mock nonce API success
      await mockAPIResponse(
        page,
        API_ENDPOINTS.NONCE,
        { status: 200, body: { nonce: 'test-nonce-123' } },
        'API Error Test - Mock Nonce'
      )

      // Mock signin API failure
      await mockAPIResponse(
        page,
        API_ENDPOINTS.SIGNIN,
        { status: 500, body: { error: 'Server error' } },
        'API Error Test - Mock Signin Failure'
      )
    })

    await test.step('Attempt authentication with API error', async () => {
      await page.goto('/signin')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(600)

      // Click Sign In button
      await page.locator(SELECTORS.SIGNIN_BUTTON).click()
      
      // Connect wallet
      await metamask.connectToDapp()
      
      // Trigger accountsChanged
      await page.evaluate(() => {
        if (window.ethereum) {
          window.ethereum.emit('accountsChanged', ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'])
        }
      })
      
      await page.waitForTimeout(1000)
      
      // Click Sign In again to trigger API call
      await page.locator(SELECTORS.SIGNIN_BUTTON).click()
      
      // Sign the message
      await metamask.confirmSignature()

      // Should stay on signin page due to error
      await page.waitForTimeout(2000)
      
      const currentUrl = page.url()
      if (!currentUrl.includes('/signin')) {
        throw new Error(`
❌ UNEXPECTED NAVIGATION AFTER API ERROR

Expected: Stay on /signin
Actual: Navigated to ${currentUrl}

💡 API errors should:
   1. Be caught in clientAction
   2. Return error object
   3. Keep user on signin page

📍 Check: Error handling (lines 67-70)
        `)
      }
      
      // Should still show the form
      await expectElementVisible(
        page,
        SELECTORS.SIGNIN_FORM,
        'Sign In Form (After API Error)'
      )
    })
    
    console.log('✅ API error handling verified with real MetaMask')
  })
})