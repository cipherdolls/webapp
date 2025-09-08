import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import SignInRoute from '~/routes/_auth.signIn';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ========================
// SHARED MOCK SETUP (Network Layer Mocking)
// ========================

// Mock external dependencies using proper network layer mocking
vi.mock('~/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    token: null,
    isAuthenticated: false,
    setToken: vi.fn(),
    verifyToken: vi.fn(),
    setRedirectAfterSignIn: vi.fn(),
  })),
}));

// Mock ethers for wallet interactions
vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(() => ({
      getSigner: vi.fn(() => ({
        getAddress: vi.fn(),
        signMessage: vi.fn(),
      })),
    })),
  },
}));

// Mock network layer
global.fetch = vi.fn();



/**
 * Mock Ethereum interface with proper typing
 */
interface MockEthereum {
  request: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
}

/**
 * Creates a properly typed mock Ethereum object
 */
const createMockEthereum = (): MockEthereum => ({
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
});

const setupEthereumEnvironment = (hasEthereum: boolean = true): MockEthereum | null => {
  if (hasEthereum) {
    const mockEthereum = createMockEthereum();
    window.ethereum = mockEthereum;
    return mockEthereum;
  } else {
    delete window.ethereum;
    return null;
  }
};

const renderSignInPageWithNavigation = () => {
  const router = createMemoryRouter([
    { path: '/signin', element: <SignInRoute /> },
    { path: '/', element: <div data-testid="home-page">Home Page</div> },
  ], { initialEntries: ['/signin'] });

  return render(<RouterProvider router={router} />);
};

/**
 * User interaction assertion helpers
 */
const assertUserInteractions = {
  canClickLogo: async () => {
    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', '/');
    
    await act(async () => {
      fireEvent.click(logoLink);
    });
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  },
  
  canSeeModalButtons: () => {
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  },
  
  signInButtonHasCorrectAttributes: () => {
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('type', 'submit');
  },
  
  signInButtonIsDisabled: () => {
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeDisabled();
  },
  
  signInButtonIsEnabled: () => {
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).not.toBeDisabled();
  }
};

describe('SignIn User Interactions - Behavior-Driven Tests', () => {
  let mockEthereum: MockEthereum;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockEthereum = createMockEthereum();
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    if (mockEthereum) {
      mockEthereum.request.mockClear();
      mockEthereum.on.mockClear();  
      mockEthereum.removeListener.mockClear();
    }
  });

  describe('Information and Modal Access', () => {
    it('allows users to access help and policy information', () => {
      window.ethereum = mockEthereum;
      renderSignInPageWithNavigation();

      assertUserInteractions.canSeeModalButtons();
    });
  });

  describe('Logo and Navigation Behavior', () => {
    it('enables users to navigate home via logo click', async () => {
      renderSignInPageWithNavigation();
      
      await assertUserInteractions.canClickLogo();
    });
  });

  describe('Sign In Form Accessibility and State', () => {
    it('presents sign in button with correct form attributes', () => {
      window.ethereum = mockEthereum;
      renderSignInPageWithNavigation();

      assertUserInteractions.signInButtonHasCorrectAttributes();
    });

    it('prevents sign in when wallet is not available', async () => {
      delete window.ethereum;
      renderSignInPageWithNavigation();
      
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      assertUserInteractions.signInButtonIsDisabled();
    });
  });

  describe('Wallet Detection and User Feedback', () => {
    it('shows loading state during wallet detection process', () => {
      window.ethereum = mockEthereum;
      renderSignInPageWithNavigation();
      
      assertUserInteractions.signInButtonIsDisabled();
    });

    it('enables sign in after successful wallet detection', async () => {
      window.ethereum = mockEthereum;
      renderSignInPageWithNavigation();
      
      assertUserInteractions.signInButtonIsDisabled();
      
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      assertUserInteractions.signInButtonIsEnabled();
    });
  });
});