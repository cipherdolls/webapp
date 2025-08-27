import { describe, it, expect, vi, beforeEach } from 'vitest';
import { switchToOptimismNetwork } from '~/utils/networkUtils';
import { NETWORKS } from '~/constants';

// Mock window.ethereum globally
const mockEthereum = {
  request: vi.fn(),
};

// Setup window.ethereum mock
Object.defineProperty(window, 'ethereum', {
  value: mockEthereum,
  writable: true,
  configurable: true,
});

// Mock vi.mocked for window.ethereum
vi.mocked = vi.fn().mockImplementation((fn) => fn as any);

describe('switchToOptimismNetwork utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when MetaMask is not available', async () => {
    // Remove ethereum from window
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(result).toEqual({
      success: false,
      error: 'MetaMask not detected. Please install MetaMask to switch networks.',
    });

    // Restore ethereum for other tests
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
      configurable: true,
    });
  });

  it('should successfully switch network', async () => {
    const mockRequest = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.OPTIMISM.chainId }],
    });
    expect(result).toEqual({ success: true });
  });

  it('should add network when chain not found (error 4902)', async () => {
    const mockRequest = vi.fn()
      .mockRejectedValueOnce({ code: 4902 })
      .mockResolvedValueOnce(undefined);

    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(mockRequest).toHaveBeenNthCalledWith(1, {
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.OPTIMISM.chainId }],
    });

    expect(mockRequest).toHaveBeenNthCalledWith(2, {
      method: 'wallet_addEthereumChain',
      params: [NETWORKS.OPTIMISM],
    });

    expect(result).toEqual({ success: true });
  });

  it('should handle other errors', async () => {
    const mockRequest = vi.fn().mockRejectedValue({ message: 'User rejected' });
    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(result).toEqual({
      success: false,
      error: 'User rejected',
    });
  });

  it('should handle errors without message', async () => {
    const mockRequest = vi.fn().mockRejectedValue({ code: 1001 });
    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(result).toEqual({
      success: false,
      error: 'Failed to switch network',
    });
  });

  it('should handle network addition failure after 4902 error', async () => {
    const mockRequest = vi.fn()
      .mockRejectedValueOnce({ code: 4902 })
      .mockRejectedValueOnce({ message: 'Failed to add network' });

    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(mockRequest).toHaveBeenNthCalledWith(1, {
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.OPTIMISM.chainId }],
    });

    expect(mockRequest).toHaveBeenNthCalledWith(2, {
      method: 'wallet_addEthereumChain',
      params: [NETWORKS.OPTIMISM],
    });

    expect(result).toEqual({
      success: false,
      error: 'Failed to add network',
    });
  });

  it('should handle network addition failure without message', async () => {
    const mockRequest = vi.fn()
      .mockRejectedValueOnce({ code: 4902 })
      .mockRejectedValueOnce({ code: 500 });

    Object.defineProperty(window, 'ethereum', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(result).toEqual({
      success: false,
      error: 'Failed to add Optimism network',
    });
  });

  it('should handle MetaMask not available during network addition', async () => {
    // This test is actually not achievable with current implementation 
    // because window.ethereum is checked at function start, not during addOptimismNetwork
    // The function returns error immediately if no ethereum at start
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await switchToOptimismNetwork();

    expect(result).toEqual({
      success: false,
      error: 'MetaMask not detected. Please install MetaMask to switch networks.',
    });

    // Restore ethereum for cleanup
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
      configurable: true,
    });
  });
});