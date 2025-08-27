import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import { getCurrentChainId, isOnCorrectNetworkForTokenPermits, listenForNetworkChanges } from '~/utils/networkUtils';

// Mock dependencies
vi.mock('~/utils/networkUtils', () => ({
  getCurrentChainId: vi.fn(),
  isOnCorrectNetworkForTokenPermits: vi.fn(),
  listenForNetworkChanges: vi.fn(),
}));

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};

describe('useNetworkCheck hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window.ethereum by default
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useNetworkCheck());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasMetaMask).toBe(false);
    expect(result.current.isOnCorrectNetwork).toBe(false);
    expect(result.current.currentChainId).toBe(null);
  });

  it('should detect no MetaMask', async () => {
    // Remove ethereum from window
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isOnCorrectNetwork).toBe(false);
      expect(result.current.currentChainId).toBe(null);
    });
  });

  it('should check network correctly when MetaMask is available', async () => {
    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(true);
      expect(result.current.isOnCorrectNetwork).toBe(true);
      expect(result.current.currentChainId).toBe('0xa');
      expect(result.current.isLoading).toBe(false);
    });

    expect(getCurrentChainId).toHaveBeenCalled();
    expect(isOnCorrectNetworkForTokenPermits).toHaveBeenCalled();
    expect(listenForNetworkChanges).toHaveBeenCalled();
  });

  it('should detect wrong network when MetaMask is available', async () => {
    vi.mocked(getCurrentChainId).mockResolvedValue('0x1'); // Ethereum mainnet
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(false);
    vi.mocked(listenForNetworkChanges).mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(true);
      expect(result.current.isOnCorrectNetwork).toBe(false);
      expect(result.current.currentChainId).toBe('0x1');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle network check errors gracefully', async () => {
    vi.mocked(getCurrentChainId).mockRejectedValue(new Error('Network error'));
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockRejectedValue(new Error('Network error'));
    vi.mocked(listenForNetworkChanges).mockReturnValue(() => {});

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error checking network:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle network change events', async () => {
    let networkChangeCallback: (chainId: string) => void;
    const mockCleanup = vi.fn();

    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockImplementation((callback) => {
      networkChangeCallback = callback;
      return mockCleanup;
    });

    const { result } = renderHook(() => useNetworkCheck());

    // Wait for initial network check
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentChainId).toBe('0xa');
    });

    // Simulate network change to Ethereum mainnet
    act(() => {
      networkChangeCallback('0x1');
    });

    await waitFor(() => {
      expect(result.current.currentChainId).toBe('0x1');
      expect(result.current.isOnCorrectNetwork).toBe(false); // 0x1 is not Optimism (0xa)
    });

    // Simulate network change back to Optimism
    act(() => {
      networkChangeCallback('0xa');
    });

    await waitFor(() => {
      expect(result.current.currentChainId).toBe('0xa');
      expect(result.current.isOnCorrectNetwork).toBe(true); // 0xa is Optimism
    });
  });

  it('should provide refetchNetwork function', async () => {
    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkCheck());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refetchNetwork
    act(() => {
      result.current.refetchNetwork();
    });

    // Should set loading to true
    expect(result.current.isLoading).toBe(true);

    // Should complete loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have called network check functions again
    expect(getCurrentChainId).toHaveBeenCalledTimes(2);
    expect(isOnCorrectNetworkForTokenPermits).toHaveBeenCalledTimes(2);
  });

  it('should cleanup network listeners on unmount', async () => {
    const mockCleanup = vi.fn();
    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockReturnValue(mockCleanup);

    const { result, unmount } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });

  it('should handle null cleanup function from listenForNetworkChanges', async () => {
    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockReturnValue(null); // No MetaMask case

    const { result, unmount } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not throw error when unmounting with null cleanup
    expect(() => unmount()).not.toThrow();
  });

  it('should handle multiple rapid network changes', async () => {
    let networkChangeCallback: (chainId: string) => void;
    const mockCleanup = vi.fn();

    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockImplementation((callback) => {
      networkChangeCallback = callback;
      return mockCleanup;
    });

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate rapid network changes
    act(() => {
      networkChangeCallback('0x1'); // Ethereum
    });

    act(() => {
      networkChangeCallback('0x89'); // Polygon
    });

    act(() => {
      networkChangeCallback('0xa'); // Optimism
    });

    await waitFor(() => {
      expect(result.current.currentChainId).toBe('0xa');
      expect(result.current.isOnCorrectNetwork).toBe(true);
    });
  });

  it('should maintain correct network state during refetch', async () => {
    vi.mocked(getCurrentChainId).mockResolvedValue('0x1');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(false);
    vi.mocked(listenForNetworkChanges).mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isOnCorrectNetwork).toBe(false);
    });

    // Change mock to return correct network
    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);

    // Trigger refetch
    act(() => {
      result.current.refetchNetwork();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isOnCorrectNetwork).toBe(true);
      expect(result.current.currentChainId).toBe('0xa');
    });
  });

  it('should preserve hasMetaMask state during network changes', async () => {
    let networkChangeCallback: (chainId: string) => void;

    vi.mocked(getCurrentChainId).mockResolvedValue('0xa');
    vi.mocked(isOnCorrectNetworkForTokenPermits).mockResolvedValue(true);
    vi.mocked(listenForNetworkChanges).mockImplementation((callback) => {
      networkChangeCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useNetworkCheck());

    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate network change
    act(() => {
      networkChangeCallback('0x1');
    });

    await waitFor(() => {
      expect(result.current.hasMetaMask).toBe(true); // Should remain true
      expect(result.current.currentChainId).toBe('0x1');
    });
  });
});