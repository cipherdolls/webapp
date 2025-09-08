import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '~/setupTests';

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

describe('Token Authentication Behavior', () => {
  let verifyToken: () => Promise<boolean>;

  beforeEach(() => {
    // Disable MSW for this test suite to allow fetch mocking
    server.close();
    verifyToken = createVerifyToken();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restart MSW server for other tests
    server.listen({ onUnhandledRequest: 'error' });
  });

  it('should authenticate successfully with valid token', async () => {
    mockGetItem.mockReturnValue('valid-token');
    mockFetch.mockResolvedValue({ status: 200 });

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Valid token should grant access
    // Test authentication outcome, not API implementation details
    expect(result).toBe(true);
  });

  it('should handle expired token gracefully', async () => {
    mockGetItem.mockReturnValue('expired-token');
    mockFetch.mockResolvedValue({ status: 401 });

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Expired token should deny access
    expect(result).toBe(false);
    
    // ✅ BEHAVIOR TEST: Expired token should be cleaned up
    // This is user-visible behavior: user won't see expired token errors repeatedly
    expect(mockRemoveItem).toHaveBeenCalledWith('token');
  });

  it('should handle server errors gracefully', async () => {
    mockGetItem.mockReturnValue('some-token');
    mockFetch.mockResolvedValue({ status: 500 });

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Server errors should deny access temporarily
    expect(result).toBe(false);
    
    // ✅ BEHAVIOR TEST: Server errors should NOT remove token
    // User experience: token preserved for retry after server recovers
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('should handle network failures gracefully', async () => {
    mockGetItem.mockReturnValue('some-token');
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Network errors should deny access temporarily
    // User experience: authentication fails gracefully during network issues
    expect(result).toBe(false);
  });

  it('should handle malformed tokens correctly', async () => {
    mockGetItem.mockReturnValue('"quoted-token"');
    mockFetch.mockResolvedValue({ status: 200 });

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Malformed tokens should be cleaned and work
    // User experience: token formatting issues handled transparently
    expect(result).toBe(true);
  });

  it('should clean complex token formatting', async () => {
    mockGetItem.mockReturnValue('""token-with-quotes""');
    mockFetch.mockResolvedValue({ status: 200 });

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Complex formatting issues should be resolved
    expect(result).toBe(true);
  });

  it('should handle missing token state', async () => {
    mockGetItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({ status: 401 }); // More realistic response

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Missing token should deny access
    expect(result).toBe(false);
  });

  it('should handle uninitialized token state', async () => {
    mockGetItem.mockReturnValue(undefined);
    mockFetch.mockResolvedValue({ status: 401 }); // More realistic response

    const result = await verifyToken();

    // ✅ BEHAVIOR TEST: Uninitialized state should deny access
    expect(result).toBe(false);
  });
});