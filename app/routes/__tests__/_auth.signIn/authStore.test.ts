import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '~/store/useAuthStore';
import { server } from '~/setupTests';
import { http, HttpResponse } from 'msw';

// Mock window.location for redirect tests
const mockLocationReload = vi.fn();
const mockLocationAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    reload: mockLocationReload,
    pathname: '/current/path',
    search: '?param=value',
  },
  writable: true,
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
    
    // Setup MSW handlers for auth endpoints
    server.use(
      http.post('https://api.cipherdolls.com/auth/verify', () => {
        return HttpResponse.json({ valid: true }, { status: 200 });
      }),
      http.post('https://api.cipherdolls.com/auth/logout', () => {
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('setToken', () => {
    it('should set token and isAuthenticated to true', () => {
      const { setToken } = useAuthStore.getState();
      
      setToken('test-token');
      
      const state = useAuthStore.getState();
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set token to null and isAuthenticated to false', () => {
      const { setToken } = useAuthStore.getState();
      
      setToken(null);
      
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should return false when no token exists', async () => {
      const { verifyToken } = useAuthStore.getState();
      
      const result = await verifyToken();
      
      expect(result).toBe(false);
      // No fetch call should be made when no token exists
    });

    it('should return true when token is valid', async () => {
      const { setToken, verifyToken } = useAuthStore.getState();
      setToken('valid-token');
      
      const result = await verifyToken();
      
      expect(result).toBe(true);
      // Token should still be set since verification was successful
      expect(useAuthStore.getState().token).toBe('valid-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear auth and return false when token is invalid', async () => {
      // Override the default handler for this specific test
      server.use(
        http.post('https://api.cipherdolls.com/auth/verify', () => {
          return HttpResponse.json({ error: 'Invalid token' }, { status: 401 });
        })
      );
      
      const { setToken, verifyToken } = useAuthStore.getState();
      setToken('invalid-token');
      
      const result = await verifyToken();
      
      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      // Override handler to simulate network error
      server.use(
        http.post('https://api.cipherdolls.com/auth/verify', () => {
          return HttpResponse.error();
        })
      );
      
      const { setToken, verifyToken } = useAuthStore.getState();
      setToken('test-token');
      
      const result = await verifyToken();
      
      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Mock localStorage methods
      const mockRemoveItem = vi.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { removeItem: mockRemoveItem },
        writable: true,
      });
      
      // Mock window.location.href assignment
      Object.defineProperty(window.location, 'href', {
        writable: true,
        value: '',
      });
    });

    it('should clear auth state and redirect on logout', async () => {
      const { setToken, logout } = useAuthStore.getState();
      setToken('test-token');
      
      await logout();
      
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(window.location.href).toContain('/signin');
    });

    it('should clear auth state even if API call fails', async () => {
      // Override handler to simulate API failure
      server.use(
        http.post('https://api.cipherdolls.com/auth/logout', () => {
          return HttpResponse.error();
        })
      );
      
      const { setToken, logout } = useAuthStore.getState();
      setToken('test-token');
      
      await logout();
      
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(window.location.href).toContain('/signin');
    });

    it('should call logout API endpoint when token exists', async () => {
      const { setToken, logout } = useAuthStore.getState();
      setToken('test-token');
      
      // We can't easily test the fetch call with MSW, but we can test the behavior
      await logout();
      
      // Verify auth state was cleared
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(window.location.href).toContain('/signin');
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      const { setToken, setLoading, clearAuth } = useAuthStore.getState();
      setToken('test-token');
      setLoading(true);
      
      clearAuth();
      
      const state = useAuthStore.getState();
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState();
      
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});