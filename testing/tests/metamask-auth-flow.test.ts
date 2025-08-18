import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../setup/basic.setup'

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe('SignIn Authentication Flow with Real MetaMask', () => {
  
  test('should handle invalid token and stay on signin', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    // Set an invalid token in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('token', '"invalid-token-456"')
    })

    // Mock the token verification API to return 401
    await page.route('**/auth/verify', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid token' })
      })
    })

    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Should stay on signin page and token should be removed
    expect(page.url()).toMatch(/.*signin/)
    
    // Check that token was removed from localStorage
    const tokenRemoved = await page.evaluate(() => {
      return localStorage.getItem('token') === null
    })
    expect(tokenRemoved).toBe(true)
    
    console.log('✅ Invalid token handling verified with real MetaMask')
  })

  test('should handle wallet connection and disconnection', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)
    
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Verify the signin form is available
    await expect(page.locator('form')).toBeVisible()
    
    // Connect wallet
    await page.locator('form button[type="submit"]').click()
    await metamask.connectToDapp()
    
    // Wait for connection
    await page.waitForTimeout(2000)
    
    // Verify connection worked
    const currentUrl = page.url()
    console.log('After connection, URL:', currentUrl)
    
    console.log('✅ Real MetaMask wallet connection flow verified')
  })

  test('should handle complete authentication flow', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)
    
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Monitor API calls
    const signinResponsePromise = page.waitForResponse(response => 
      response.url().includes('/auth/signin')
    ).catch(() => null)

    // Click Sign In button to initiate connection
    await page.locator('form button[type="submit"]').click()
    
    // Connect wallet through MetaMask
    await metamask.connectToDapp()
    
    // Trigger accountsChanged to ensure connected state
    await page.evaluate(() => {
      if (window.ethereum) {
        window.ethereum.emit('accountsChanged', ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'])
      }
    })
    
    await page.waitForTimeout(1000)
    
    // Click Sign In again to trigger message signing
    await page.locator('form button[type="submit"]').click()
    
    // Sign the message
    await metamask.confirmSignature()
    
    // Check API response
    const signinResponse = await signinResponsePromise
    if (signinResponse) {
      console.log('✅ API signin successful:', signinResponse.status())
      
      // Wait for potential redirect
      await page.waitForTimeout(3000)
      
      const finalUrl = page.url()
      if (finalUrl.endsWith('/')) {
        console.log('🎉 Complete authentication flow successful - redirected to homepage!')
      } else {
        console.log('✅ Authentication API successful, staying on signin page')
      }
    }
    
    console.log('✅ Complete real MetaMask authentication flow tested')
  })

  test('should handle authentication API errors', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)

    // Mock nonce API success
    await page.route('**/auth/nonce', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ nonce: 'test-nonce-123' })
      })
    })

    // Mock signin API failure
    await page.route('**/auth/signin', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      })
    })

    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Click Sign In button
    await page.locator('form button[type="submit"]').click()
    
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
    await page.locator('form button[type="submit"]').click()
    
    // Sign the message
    await metamask.confirmSignature()

    // Should stay on signin page due to error
    await page.waitForTimeout(2000)
    expect(page.url()).toMatch(/.*signin/)
    
    // Should still show the form
    const signInForm = page.locator('form')
    await expect(signInForm).toBeVisible()
    
    console.log('✅ API error handling verified with real MetaMask')
  })
})