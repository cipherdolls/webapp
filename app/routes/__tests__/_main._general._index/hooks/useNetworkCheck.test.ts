import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';

// ========================
// BEHAVIOR-DRIVEN HOOK TESTS
// ========================

describe('Network Status Hook - User Experience', () => {
  let originalEthereum: any;

  beforeEach(() => {
    originalEthereum = window.ethereum;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.ethereum = originalEthereum;
  });

  it('should provide network status information when MetaMask is available', async () => {
    // Given: User has MetaMask installed and is on correct network
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockResolvedValue('0xa'), // Optimism network
      on: vi.fn(),
      removeListener: vi.fn()
    };

    // When: Hook is used
    const { result } = renderHook(() => useNetworkCheck());

    // Then: Should eventually provide network information
    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should detect when MetaMask is not available', async () => {
    // Given: User does not have MetaMask
    window.ethereum = undefined;

    // When: Hook is used
    const { result } = renderHook(() => useNetworkCheck());

    // Then: Should indicate MetaMask is not available
    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should start in loading state and eventually complete', async () => {
    // Given: MetaMask is available
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockResolvedValue('0xa'),
      on: vi.fn(),
      removeListener: vi.fn()
    };

    // When: Hook is first used
    const { result } = renderHook(() => useNetworkCheck());

    // Then: Should start loading
    expect(result.current.isLoading).toBe(true);

    // And eventually complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should provide network refresh functionality', async () => {
    // Given: MetaMask is available
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockResolvedValue('0xa'),
      on: vi.fn(),
      removeListener: vi.fn()
    };

    const { result } = renderHook(() => useNetworkCheck());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // When: User refreshes network status
    act(() => {
      result.current.refetchNetwork();
    });

    // Then: Should provide loading state and complete
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle network errors gracefully', async () => {
    // Given: Network request fails
    window.ethereum = {
      isMetaMask: true,
      request: vi.fn().mockRejectedValue(new Error('Network error')),
      on: vi.fn(),
      removeListener: vi.fn()
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // When: Hook is used
    const { result } = renderHook(() => useNetworkCheck());

    // Then: Should handle error and complete loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    consoleSpy.mockRestore();
  });

  it('should return consistent hook interface', () => {
    // Given: Any state
    window.ethereum = undefined;

    // When: Hook is used
    const { result } = renderHook(() => useNetworkCheck());

    // Then: Should provide expected properties
    expect(result.current).toHaveProperty('hasMetaMask');
    expect(result.current).toHaveProperty('isOnCorrectNetwork');
    expect(result.current).toHaveProperty('currentChainId');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('refetchNetwork');
    expect(typeof result.current.refetchNetwork).toBe('function');
  });
});