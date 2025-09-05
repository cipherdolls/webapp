import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import SignInRoute from '~/routes/_auth.signIn';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ========================
// SHARED MOCK SETUP - Copy exact working pattern from userInteractions.test.tsx
// ========================

// Mock external dependencies
vi.mock('~/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    token: null,
    isAuthenticated: false,
    setToken: vi.fn(),
    verifyToken: vi.fn(),
    setRedirectAfterSignIn: vi.fn(),
  })),
}));

// Mock ethers
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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock components
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
// SHARED HELPER FUNCTIONS (Data Factories & Utilities)
// ========================

/**
 * Mock Ethereum interface with proper typing
 */
interface MockEthereum {
  request: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  isMetaMask?: boolean;
}

/**
 * Creates a properly typed mock Ethereum object
 */
const createMockEthereum = (): MockEthereum => ({
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
});

/**
 * Standard render function for SignIn component with proper setup
 */
const renderSignInPage = () => {
  const router = createMemoryRouter([
    {
      path: '/signin',
      element: <SignInRoute />,
    },
  ], {
    initialEntries: ['/signin'],
  });

  return render(<RouterProvider router={router} />);
};

/**
 * Sets up window.ethereum for testing
 */
const setupEthereumEnvironment = (hasEthereum: boolean = true) => {
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
 * User behavior assertion helpers
 */
const assertSignInButton = {
  isEnabled: () => {
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).not.toBeDisabled();
  },
  isDisabled: () => {
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  },
  exists: () => {
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  },
};

const assertPageContent = {
  showsLogo: () => {
    expect(screen.getByAltText('Cipherdolls')).toBeInTheDocument();
  },
  showsWarningMessage: () => {
    expect(screen.getByText(/A connected crypto wallet in your browser is required/)).toBeInTheDocument();
  },
  showsVideoPlayer: () => {
    expect(screen.getByTitle('YouTube video player')).toBeInTheDocument();
  },
  showsFeatureInfo: () => {
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('1 LOV')).toBeInTheDocument();
  },
};

// ========================
// TESTS - Behavior-Driven & User-Focused
// ========================

describe('SignIn Component - User Experience', () => {
  let mockEthereum: MockEthereum;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup persistent ethereum mock - same pattern as userInteractions.test.tsx
    mockEthereum = createMockEthereum();
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    // Clean up but keep mock structure
    if (mockEthereum) {
      mockEthereum.request.mockClear();
      mockEthereum.on.mockClear();  
      mockEthereum.removeListener.mockClear();
    }
  });

  describe('Page Loading and Rendering', () => {
    it('renders core page elements without errors', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      assertPageContent.showsLogo();
      assertPageContent.showsVideoPlayer();
      assertPageContent.showsFeatureInfo();
      assertSignInButton.exists();
    });

    it('displays all navigation and modal links', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByTestId('sign-in-patterns')).toBeInTheDocument();
    });

    it('shows video player with correct YouTube embed', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com'));
    });
  });

  describe('Ethereum Detection and Wallet States', () => {
    it('shows loading state before Ethereum detection completes', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      // Before timer completion - should be in loading state
      assertSignInButton.isDisabled();
    });

    it('enables sign in when Ethereum wallet is detected', async () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      assertSignInButton.isEnabled();
    });

    it('shows warning and disables sign in when no wallet is detected', async () => {
      // Explicitly remove ethereum to simulate no wallet
      delete window.ethereum;
      renderSignInPage();
      
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      assertPageContent.showsWarningMessage();
      assertSignInButton.isDisabled();
    });

    it('handles Ethereum detection timeout gracefully', async () => {
      // Don't set ethereum for this test
      renderSignInPage();
      
      // Initially loading
      assertSignInButton.isDisabled();
      
      // After timeout - should show appropriate warning
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      assertPageContent.showsWarningMessage();
    });
  });

  describe('Feature Information Display', () => {
    it('displays free usage information correctly', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Registration and usage')).toBeInTheDocument();
    });

    it('displays pricing information correctly', () => {
      window.ethereum = mockEthereum;
      renderSignInPage();
      
      expect(screen.getByText('1 LOV')).toBeInTheDocument();
      expect(screen.getByText('For monthly usage')).toBeInTheDocument();
    });
  });
});