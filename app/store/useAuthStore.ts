import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { apiUrl, ROUTES } from '~/constants';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // State
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setToken: (token) =>
        set((state) => {
          state.token = token;
          state.isAuthenticated = !!token;
        }),

      logout: async () => {
        const { token, clearAuth } = get();
        
        try {
          // Optionally call logout endpoint if it exists
          if (token) {
            await fetch(`${apiUrl}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }).catch(() => {
              // Ignore errors - we're logging out anyway
            });
          }
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Always clear auth state
          clearAuth();
          
          // Clear related localStorage items
          localStorage.removeItem('redirectAfterSignIn');
          localStorage.removeItem('referralId');
          
          // Redirect to sign in
          window.location.href = ROUTES.signIn;
        }
      },

      verifyToken: async () => {
        const { token, clearAuth } = get();
        
        if (!token) {
          return false;
        }

        try {
          const res = await fetch(`${apiUrl}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.status === 200) {
            return true;
          }

          if (res.status === 401) {
            clearAuth();
            return false;
          }

          return false;
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
          return false;
        }
      },

      clearAuth: () =>
        set((state) => {
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper function to get token for fetchWithAuth
export const getToken = () => useAuthStore.getState().token;

// Helper function to check if authenticated
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;