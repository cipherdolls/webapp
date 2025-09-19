import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

const PASSWORD = 'TestPassword123'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)
  
  await metamask.importWallet(
    'test test test test test test test test test test test junk'
  )
})