import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Mock Ethereum interface for connection testing
 */
interface MockEthereum {
  request: ReturnType<typeof vi.fn>;
}

/**
 * Creates a properly typed mock Ethereum object for connection testing
 */
const createMockEthereum = (): MockEthereum => ({
  request: vi.fn(),
});

const createCheckConnection = (setConnected: (value: boolean) => void) => {
  return async () => {
    try {
      if (!window.ethereum) {
        setConnected(false);
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length === 0) {
        setConnected(false);
      } else {
        setConnected(true);
      }
    } catch (error) {
      setConnected(false);
    }
  };
};

describe('Wallet Connection Detection', () => {
  let connectionResult: boolean | null = null;
  let mockEthereum: MockEthereum;

  const setConnected = (value: boolean) => {
    connectionResult = value;
  };

  beforeEach(() => {
    connectionResult = null;
    mockEthereum = createMockEthereum();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete window.ethereum;
  });

  describe('when wallet has no accounts', () => {
    it('should indicate user is disconnected', async () => {
      // Arrange
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValue([]);
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(false);
    });
  });

  describe('when wallet has active accounts', () => {
    it('should indicate user is connected', async () => {
      // Arrange
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValue(['0x123...', '0x456...']);
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(true);
    });
  });

  describe('when wallet is missing', () => {
    it('should gracefully handle missing wallet and show disconnected state', async () => {
      // Arrange
      delete window.ethereum;
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(false);
    });
  });

  describe('when wallet connection fails', () => {
    it('should handle connection errors and show disconnected state', async () => {
      // Arrange
      window.ethereum = mockEthereum;
      mockEthereum.request.mockRejectedValue(new Error('User rejected request'));
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(false);
    });
  });

  describe('when wallet has single account', () => {
    it('should connect successfully with one account', async () => {
      // Arrange
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValue(['0x123456789abcdef']);
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(true);
    });
  });

  describe('when wallet is in invalid state', () => {
    it('should handle null wallet state safely', async () => {
      // Arrange
      window.ethereum = null;
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(false);
    });

    it('should handle undefined wallet state consistently', async () => {
      // Arrange
      window.ethereum = undefined;
      const checkConnection = createCheckConnection(setConnected);

      // Act
      await checkConnection();

      // Assert
      expect(connectionResult).toBe(false);
    });
  });
});