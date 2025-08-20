import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockGetItem = vi.fn();
const mockRemoveItem = vi.fn();
const mockFetch = vi.fn();

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockGetItem,
    removeItem: mockRemoveItem,
  },
  writable: true,
});

global.fetch = mockFetch;

const apiUrl = 'http://localhost:3000';

const createVerifyToken = () => {
  return async () => {
    try {
      const localToken = localStorage.getItem('token')?.replaceAll('"', '');
      const res = await fetch(`${apiUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localToken}`,
        },
      });

      if (res.status === 200) {
        return true;
      }
      if (res.status === 401) {
        localStorage.removeItem('token');
        return false;
      }
      return false;
    } catch (err) {
      return false;
    }
  };
};

describe('verifyToken Function', () => {
  let verifyToken: () => Promise<boolean>;

  beforeEach(() => {
    verifyToken = createVerifyToken();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when response status is 200', async () => {
    mockGetItem.mockReturnValue('valid-token');
    mockFetch.mockResolvedValue({ status: 200 });

    const result = await verifyToken();

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
    });
  });

  it('should return false and remove token when response status is 401', async () => {
    mockGetItem.mockReturnValue('invalid-token');
    mockFetch.mockResolvedValue({ status: 401 });

    const result = await verifyToken();

    expect(result).toBe(false);
    expect(mockRemoveItem).toHaveBeenCalledWith('token');
  });

  it('should return false when response status is other than 200 or 401', async () => {
    mockGetItem.mockReturnValue('some-token');
    mockFetch.mockResolvedValue({ status: 500 });

    const result = await verifyToken();

    expect(result).toBe(false);
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('should return false when network error occurs', async () => {
    mockGetItem.mockReturnValue('some-token');
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await verifyToken();

    expect(result).toBe(false);
  });

  it('should remove quotes from token before sending request', async () => {
    mockGetItem.mockReturnValue('"quoted-token"');
    mockFetch.mockResolvedValue({ status: 200 });

    await verifyToken();

    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer quoted-token',
      },
    });
  });

  it('should handle token with multiple quotes', async () => {
    mockGetItem.mockReturnValue('""token-with-quotes""');
    mockFetch.mockResolvedValue({ status: 200 });

    await verifyToken();

    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-with-quotes',
      },
    });
  });

  it('should handle null token from localStorage', async () => {
    mockGetItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({ status: 200 });

    await verifyToken();

    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer undefined',
      },
    });
  });

  it('should handle undefined token from localStorage', async () => {
    mockGetItem.mockReturnValue(undefined);
    mockFetch.mockResolvedValue({ status: 200 });

    await verifyToken();

    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer undefined',
      },
    });
  });
});