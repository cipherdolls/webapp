import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { switchToOptimismNetwork } from '~/utils/networkUtils';

// ========================
// BEHAVIOR-DRIVEN NETWORK SWITCHING TESTS
// ========================

describe('Network Switching - User Behavior', () => {
  let originalEthereum: any;

  beforeEach(() => {
    // Save original ethereum object
    originalEthereum = window.ethereum;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original ethereum object
    window.ethereum = originalEthereum;
  });

  it('should successfully switch to Optimism network when user approves', async () => {
    // Given: MetaMask is available and user approves the switch
    window.ethereum = {
      request: vi.fn().mockResolvedValue(undefined)
    };

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should succeed
    expect(result.success).toBe(true);
  });

  it('should handle when MetaMask is not installed', async () => {
    // Given: MetaMask is not available
    window.ethereum = undefined;

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should fail with helpful message
    expect(result.success).toBe(false);
    expect(result.error).toContain('MetaMask');
  });

  it('should handle when user rejects the network switch', async () => {
    // Given: MetaMask is available but user rejects
    window.ethereum = {
      request: vi.fn().mockRejectedValue(new Error('User rejected the request'))
    };

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should fail gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should add Optimism network if it does not exist', async () => {
    // Given: MetaMask doesn't have Optimism network configured
    window.ethereum = {
      request: vi.fn()
        .mockRejectedValueOnce({ code: 4902 }) // Network not found
        .mockResolvedValueOnce(undefined) // Successfully added
    };

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should successfully add and switch to network
    expect(result.success).toBe(true);
  });

  it('should handle network addition failure', async () => {
    // Given: Network doesn't exist and adding fails
    window.ethereum = {
      request: vi.fn()
        .mockRejectedValueOnce({ code: 4902 }) // Network not found
        .mockRejectedValueOnce(new Error('Failed to add network')) // Add fails
    };

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should fail appropriately
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle unexpected errors gracefully', async () => {
    // Given: An unexpected error occurs
    window.ethereum = {
      request: vi.fn().mockRejectedValue(new Error('Network error'))
    };

    // When: User attempts to switch network
    const result = await switchToOptimismNetwork();

    // Then: Should fail with error message
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});