import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { apiUrl, ROUTES } from '~/constants';
import { burnerWalletManager } from '~/utils/burnerWallet';
import { clearQueryCache } from '~/utils/queryCache';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardWizardCompleted: boolean;
  redirectAfterSignIn: string | null;
  referralId: string | null;
  isUsingBurnerWallet: boolean;
}

interface AuthActions {
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setRedirectAfterSignIn: (url: string | null) => void;
  setReferralId: (id: string | null) => void;
  setOnboardWizardCompleted: (value: boolean) => void;
  setUsingBurnerWallet: (value: boolean) => void;
  clearBurnerWallet: () => void;
  logoutFromBurnerWallet: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // State
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isOnboardWizardCompleted: false,
      redirectAfterSignIn: null,
      referralId: null,
      isUsingBurnerWallet: false,

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
          // Always clear auth state and query cache
          clearAuth();
          clearQueryCache(); // Clear React Query cache on logout

          // Redirect to homepage
          window.location.href = ROUTES.index;
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

          if (res.status === 200 || res.status === 201) {
            const data = await res.json();
            if (data.token === 'valid') {
              set((state) => {
                state.isAuthenticated = true;
              });
              return true;
            }
            clearAuth();
            return false;
          }

          if (res.status === 401) {
            clearAuth();
            return false;
          }

          clearAuth();
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
          state.redirectAfterSignIn = null;
          state.referralId = null;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setRedirectAfterSignIn: (url) =>
        set((state) => {
          state.redirectAfterSignIn = url;
        }),

      setReferralId: (id) =>
        set((state) => {
          state.referralId = id;
        }),

      setOnboardWizardCompleted: (value) =>
        set((state) => {
          state.isOnboardWizardCompleted = value;
        }),

      setUsingBurnerWallet: (value) =>
        set((state) => {
          state.isUsingBurnerWallet = value;
        }),

      clearBurnerWallet: () => {
        // Clear burner wallet from localStorage
        burnerWalletManager.clearWallet();
        
        // Update state
        set((state) => {
          state.isUsingBurnerWallet = false;
        });
      },

      logoutFromBurnerWallet: () => {
        // Clear burner wallet
        burnerWalletManager.clearWallet();
        
        // Clear auth state
        set((state) => {
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.redirectAfterSignIn = null;
          state.referralId = null;
          state.isUsingBurnerWallet = false;
        });
        
        // Clear React Query cache
        clearQueryCache();
        
        // Redirect to homepage
        window.location.href = ROUTES.index;
      },
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isOnboardWizardCompleted: state.isOnboardWizardCompleted,
        redirectAfterSignIn: state.redirectAfterSignIn,
        referralId: state.referralId,
        isUsingBurnerWallet: state.isUsingBurnerWallet,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync burner wallet state with localStorage
        if (typeof window !== 'undefined' && state) {
          const hasBurnerWallet = localStorage.getItem('burner_wallet') !== null;
          state.isUsingBurnerWallet = hasBurnerWallet;
        }
      },
    }
  )
);


// Helper function to get token for fetchWithAuth
export const getToken = () => useAuthStore.getState().token;

// Helper function to check if authenticated
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
