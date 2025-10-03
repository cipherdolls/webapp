import { ethers } from 'ethers';

export interface BurnerWallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export class BurnerWalletManager {
  private static instance: BurnerWalletManager;
  private wallet: BurnerWallet | null = null;

  private constructor() {}

  static getInstance(): BurnerWalletManager {
    if (!BurnerWalletManager.instance) {
      BurnerWalletManager.instance = new BurnerWalletManager();
    }
    return BurnerWalletManager.instance;
  }

  /**
   * Generate a new burner wallet
   */
  generateWallet(): BurnerWallet {
    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    
    this.wallet = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase
    };

    // Store in localStorage for persistence
    this.saveWallet();
    
    return this.wallet;
  }

  /**
   * Get existing wallet or create new one
   */
  getOrCreateWallet(): BurnerWallet {
    if (this.wallet) {
      return this.wallet;
    }

    // Try to load from localStorage
    const saved = this.loadWallet();
    if (saved) {
      this.wallet = saved;
      return this.wallet;
    }

    // Create new wallet
    return this.generateWallet();
  }

  /**
   * Get current wallet
   */
  getWallet(): BurnerWallet | null {
    return this.wallet;
  }

  /**
   * Sign a message with the burner wallet
   */
  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('No burner wallet available');
    }

    const wallet = new ethers.Wallet(this.wallet.privateKey);
    return await wallet.signMessage(message);
  }

  /**
   * Get wallet address
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Save wallet to localStorage
   */
  private saveWallet(): void {
    if (this.wallet) {
      localStorage.setItem('burner_wallet', JSON.stringify({
        address: this.wallet.address,
        privateKey: this.wallet.privateKey,
        mnemonic: this.wallet.mnemonic
      }));
    }
  }

  /**
   * Load wallet from localStorage
   */
  private loadWallet(): BurnerWallet | null {
    try {
      const saved = localStorage.getItem('burner_wallet');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          address: parsed.address,
          privateKey: parsed.privateKey,
          mnemonic: parsed.mnemonic
        };
      }
    } catch (error) {
      console.error('Failed to load burner wallet:', error);
    }
    return null;
  }

  /**
   * Clear wallet (logout)
   */
  clearWallet(): void {
    this.wallet = null;
    localStorage.removeItem('burner_wallet');
  }

  /**
   * Check if wallet exists
   */
  hasWallet(): boolean {
    return this.wallet !== null || this.loadWallet() !== null;
  }
}

// Export singleton instance
export const burnerWalletManager = BurnerWalletManager.getInstance();
