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

// Component mocks focused on behavior rather than implementation
vi.mock('~/components/howItWorksModal', () => ({
  default: () => (
    <div>
      <button>How It Works</button>
      <div data-testid="how-it-works-content">How It Works Modal Content</div>
    </div>
  ),
}));

vi.mock('~/components/TermsOfServiceModal', () => ({
  default: () => (
    <div>
      <button>Terms of Service</button>
      <div data-testid="terms-content">Terms Modal Content</div>
    </div>
  ),
}));

vi.mock('~/components/PrivacyPolicyModal', () => ({
  default: () => (
    <div>
      <button>Privacy Policy</button>
      <div data-testid="privacy-content">Privacy Modal Content</div>
    </div>
  ),
}));

vi.mock('~/components/ui/signInPatterns', () => ({
  default: () => <div data-testid="sign-in-patterns">Sign In Patterns</div>,
}));

// ========================
// SHARED HELPER FUNCTIONS (Data Factories & Test Utilities)
// ========================

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

/**
 * Sets up Ethereum environment for testing
 */
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

/**
 * Standard render function for SignIn component with routing
 */
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
    
    // Setup persistent ethereum mock using same pattern as original
    mockEthereum = {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    };
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    // Clean up but don't delete the mock structure - same pattern as original
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
      // Explicitly remove ethereum to simulate no wallet
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
      
      // Before ethereum detection completes, should be in loading state
      assertUserInteractions.signInButtonIsDisabled();
    });

    it('enables sign in after successful wallet detection', async () => {
      window.ethereum = mockEthereum;
      renderSignInPageWithNavigation();
      
      // Initially disabled during detection
      assertUserInteractions.signInButtonIsDisabled();
      
      // After successful ethereum detection
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      assertUserInteractions.signInButtonIsEnabled();
    });
  });
});