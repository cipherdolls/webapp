import { test, expect } from '@playwright/test'

test.describe('Browser Compatibility Tests', () => {
  
  test('should show browser warning when ethereum is not available', async ({ page }) => {
    // Mock NO ethereum support
    await page.addInitScript(() => {
      // Ensure window.ethereum is undefined
      delete (window as any).ethereum;
    });

    await page.goto('/signin');
    await page.waitForLoadState('networkidle');

    // Wait for loading to complete (500ms timeout in component)
    await page.waitForTimeout(600);

    // Should show the warning message
    await expect(page.getByText('Your browser isn\'t supported')).toBeVisible();
    await expect(page.getByText('Use a Web3 browser')).toBeVisible();
    
    // Should show disabled Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' }).first();
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeDisabled();

    // Should show links to download browsers/extensions
    await expect(page.getByRole('link', { name: 'Brave' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Opera Crypto' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'MetaMask extension' })).toBeVisible();
    
    console.log('✅ Browser warning test completed - no MetaMask scenario verified')
  });
})