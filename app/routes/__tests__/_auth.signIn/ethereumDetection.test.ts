import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createEthereumDetection = (setHasEthereum: (value: boolean) => void, setIsLoading: (value: boolean) => void) => {
  return () => {
    const timer = setTimeout(() => {
      setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  };
};

describe('Ethereum Detection Logic', () => {
  let setHasEthereum: ReturnType<typeof vi.fn>;
  let setIsLoading: ReturnType<typeof vi.fn>;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    setHasEthereum = vi.fn();
    setIsLoading = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (cleanup) cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
    delete (window as any).ethereum;
  });

  it('should set hasEthereum true when window.ethereum exists', () => {
    (window as any).ethereum = {};
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    vi.advanceTimersByTime(500);

    expect(setHasEthereum).toHaveBeenCalledWith(true);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  it('should set hasEthereum false when window.ethereum does not exist', () => {
    delete (window as any).ethereum;
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    vi.advanceTimersByTime(500);

    expect(setHasEthereum).toHaveBeenCalledWith(false);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  it('should set loading false after 500ms', () => {
    (window as any).ethereum = {};
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    vi.advanceTimersByTime(499);
    expect(setIsLoading).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    (window as any).ethereum = {};
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    cleanup();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should return false when window.ethereum is undefined', () => {
    (window as any).ethereum = undefined;
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    vi.advanceTimersByTime(500);

    expect(setHasEthereum).toHaveBeenCalledWith(false);
  });

  it('should return false when window.ethereum is null', () => {
    (window as any).ethereum = null;
    
    const ethereumDetection = createEthereumDetection(setHasEthereum, setIsLoading);
    cleanup = ethereumDetection();

    vi.advanceTimersByTime(500);

    expect(setHasEthereum).toHaveBeenCalledWith(false);
  });
});