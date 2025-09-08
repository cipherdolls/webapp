import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Mock Ethereum interface for event handling testing
 */
interface MockEthereum {
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
}

/**
 * Creates a properly typed mock Ethereum object for event testing
 */
const createMockEthereum = (): MockEthereum => ({
  on: vi.fn(),
  removeListener: vi.fn(),
});

const createAccountsChangedHandler = (setConnected: (value: boolean) => void) => {
  return (accounts: string[]) => {
    if (accounts.length === 0) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  };
};

const createEventListenerSetup = (setConnected: (value: boolean) => void) => {
  return () => {
    if (window.ethereum) {
      const handleAccountsChanged = createAccountsChangedHandler(setConnected);

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  };
};

describe('accountsChanged Event Handler', () => {
  let setConnected: ReturnType<typeof vi.fn>;
  let mockEthereum: MockEthereum;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    setConnected = vi.fn();
    mockEthereum = createMockEthereum();
  });

  afterEach(() => {
    if (cleanup) cleanup();
    vi.clearAllMocks();
    delete window.ethereum;
  });

  it('should set connected false when accounts length is 0', () => {
    const handleAccountsChanged = createAccountsChangedHandler(setConnected);
    
    handleAccountsChanged([]);

    expect(setConnected).toHaveBeenCalledWith(false);
  });

  it('should set connected true when accounts length is greater than 0', () => {
    const handleAccountsChanged = createAccountsChangedHandler(setConnected);
    
    handleAccountsChanged(['0x123...', '0x456...']);

    expect(setConnected).toHaveBeenCalledWith(true);
  });

  it('should set connected true with single account', () => {
    const handleAccountsChanged = createAccountsChangedHandler(setConnected);
    
    handleAccountsChanged(['0x123456789abcdef']);

    expect(setConnected).toHaveBeenCalledWith(true);
  });

  it('should register event listener when ethereum exists', () => {
    window.ethereum = mockEthereum;

    const eventListenerSetup = createEventListenerSetup(setConnected);
    cleanup = eventListenerSetup();

    expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });

  it('should cleanup event listener on unmount', () => {
    window.ethereum = mockEthereum;

    const eventListenerSetup = createEventListenerSetup(setConnected);
    cleanup = eventListenerSetup();

    if (cleanup) cleanup();

    expect(mockEthereum.removeListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });

  it('should not register event listener when ethereum does not exist', () => {
    delete window.ethereum;

    const eventListenerSetup = createEventListenerSetup(setConnected);
    cleanup = eventListenerSetup();

    expect(cleanup).toBeUndefined();
  });

  it('should handle multiple account changes correctly', () => {
    const handleAccountsChanged = createAccountsChangedHandler(setConnected);
    
    handleAccountsChanged(['0x123']);
    expect(setConnected).toHaveBeenLastCalledWith(true);

    handleAccountsChanged([]);
    expect(setConnected).toHaveBeenLastCalledWith(false);

    handleAccountsChanged(['0x123', '0x456']);
    expect(setConnected).toHaveBeenLastCalledWith(true);

    expect(setConnected).toHaveBeenCalledTimes(3);
  });
});