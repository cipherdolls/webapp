import { test, expect } from '@playwright/test'
import { 
  UI_TEXTS, 
  SELECTORS,
  expectTextVisible,
  expectElementVisible,
  expectButtonState
} from './helpers/test-utils'

test.describe('Browser Compatibility Tests', () => {
  // Test browsers without Web3 support
  
  test('should show browser warning when ethereum is not available', async ({ page }) => {
    await test.step('Setup no ethereum environment', async () => {
      // Mock NO ethereum support
      await page.addInitScript(() => {
        // Ensure window.ethereum is undefined
        delete (window as any).ethereum;
      });
    })
    
    await test.step('Navigate to signin page', async () => {
      await page.goto('/signin');
      await page.waitForLoadState('networkidle');
      
      // Wait for loading to complete (500ms timeout in component)
      await page.waitForTimeout(600);
    })

    await test.step('Verify browser warning is shown', async () => {
      await expectTextVisible(page, UI_TEXTS.BROWSER_NOT_SUPPORTED, {
        testName: 'Browser Not Supported Warning',
        timeout: 5000
      })
      
      await expectTextVisible(page, 'Use a Web3 browser', {
        testName: 'Web3 Browser Instruction',
        timeout: 5000  
      })
    })
    
    await test.step('Verify Sign In button is disabled', async () => {
      await expectButtonState(
        page, 
        UI_TEXTS.SIGN_IN_BUTTON, 
        'disabled',
        { selector: SELECTORS.SIGNIN_BUTTON }
      )
    })

    await test.step('Verify browser download links are available', async () => {
      const browserLinks = [
        { name: 'Brave', description: 'Brave Browser download link' },
        { name: 'Opera Crypto', description: 'Opera Crypto Browser download link' }, 
        { name: 'MetaMask extension', description: 'MetaMask extension download link' }
      ]
      
      for (const link of browserLinks) {
        const linkElement = page.getByRole('link', { name: link.name })
        const isVisible = await linkElement.isVisible()
        
        if (!isVisible) {
          throw new Error(`
❌ BROWSER DOWNLOAD LINK MISSING: ${link.description}

Expected link text: "${link.name}"
Found: Not visible

💡 Possible causes:
  1. Link text changed in UI
  2. Link is conditionally rendered
  3. Browser warning section not displayed
  4. CSS hiding the link

📍 Check: Browser warning section in signin component
          `)
        }
      }
    })
    
    console.log('✅ Browser warning test completed - no MetaMask scenario verified')
  });
})