import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe('Connection State Logic', () => {
  let setConnected: ReturnType<typeof vi.fn>;
  let mockEthereum: any;

  beforeEach(() => {
    setConnected = vi.fn();
    mockEthereum = {
      request: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (window as any).ethereum;
  });

  it('should set connected false when accounts length is 0', async () => {
    (window as any).ethereum = mockEthereum;
    mockEthereum.request.mockResolvedValue([]);

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
    expect(setConnected).toHaveBeenCalledWith(false);
  });

  it('should set connected true when accounts length is greater than 0', async () => {
    (window as any).ethereum = mockEthereum;
    mockEthereum.request.mockResolvedValue(['0x123...', '0x456...']);

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
    expect(setConnected).toHaveBeenCalledWith(true);
  });

  it('should set connected false when window.ethereum does not exist', async () => {
    delete (window as any).ethereum;

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(setConnected).toHaveBeenCalledWith(false);
  });

  it('should set connected false when ethereum request throws error', async () => {
    (window as any).ethereum = mockEthereum;
    mockEthereum.request.mockRejectedValue(new Error('User rejected request'));

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_accounts' });
    expect(setConnected).toHaveBeenCalledWith(false);
  });

  it('should set connected true with single account', async () => {
    (window as any).ethereum = mockEthereum;
    mockEthereum.request.mockResolvedValue(['0x123456789abcdef']);

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(setConnected).toHaveBeenCalledWith(true);
  });

  it('should handle null ethereum object', async () => {
    (window as any).ethereum = null;

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(setConnected).toHaveBeenCalledWith(false);
  });

  it('should handle undefined ethereum object', async () => {
    (window as any).ethereum = undefined;

    const checkConnection = createCheckConnection(setConnected);
    await checkConnection();

    expect(setConnected).toHaveBeenCalledWith(false);
  });
});