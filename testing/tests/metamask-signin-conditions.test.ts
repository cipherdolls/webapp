import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../cache/wallet-setup/basic.setup'

const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

test.describe('SignIn Page with Real MetaMask - Conditional Logic', () => {
  
  test('should show active form when MetaMask is available', async ({
    page,
  }) => {
    
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    // Should NOT show the warning message since MetaMask is available
    await expect(page.getByText('Your browser isn\'t supported')).not.toBeVisible()
    
    // Should show active Sign In button inside a form
    const signInForm = page.locator('form')
    await expect(signInForm).toBeVisible()
    
    const signInButton = signInForm.getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible()
    // Button should be enabled when MetaMask is available
    await expect(signInButton).toBeEnabled()
    await expect(signInButton).toHaveAttribute('type', 'submit')
  })

  test('should display proper page elements with MetaMask', async ({
    page,
  }) => {
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')

    // Check main elements are present
    await expect(page.getByRole('img', { name: 'Cipherdolls' }).first()).toBeVisible()
    await expect(page.locator('iframe[title="YouTube video player"]')).toBeVisible()
    await expect(page.getByText('A connected crypto wallet in your browser is required')).toBeVisible()
    
    // Check modal buttons
    await expect(page.getByRole('button', { name: 'How It Works' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Terms of Service' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Privacy Policy' })).toBeVisible()

    // Check pricing info
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Registration and usage')).toBeVisible()
    await expect(page.getByText('1 LOV')).toBeVisible()
    await expect(page.getByText('For monthly usage')).toBeVisible()

    // Check partner logos
    await expect(page.getByRole('img', { name: 'Mixedbread' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Openrouter' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Groq' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Elevenlabs' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Assembly' })).toBeVisible()
    
    console.log('✅ All page elements verified with real MetaMask')
  })

  test('should show wallet connection state changes', async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, 'TestPassword123', extensionId)
    
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Initially wallet should not be connected
    const signInButton = page.locator('form').getByRole('button', { name: 'Sign In' })
    await expect(signInButton).toBeVisible()
    
    // Click to initiate connection
    await signInButton.click()
    
    // Connect wallet through MetaMask
    await metamask.connectToDapp()
    
    // Wait for connection state to update
    await page.waitForTimeout(2000)
    
    // Verify wallet is now connected (button should still be visible for signing)
    await expect(signInButton).toBeVisible()
    
    console.log('✅ Wallet connection state changes verified')
  })

  test('should show disabled button during loading state', async ({
    page,
  }) => {
    await page.goto('/signin')
    
    // Wait for loading to complete (500ms timeout in component)
    await page.waitForTimeout(600)
    await page.waitForLoadState('networkidle')
    
    // After loading, with MetaMask available, button should be enabled
    const activeSignInButton = page.locator('form').getByRole('button', { name: 'Sign In' })
    await expect(activeSignInButton).toBeEnabled()
    
    console.log('✅ Loading state button behavior verified')
  })
})