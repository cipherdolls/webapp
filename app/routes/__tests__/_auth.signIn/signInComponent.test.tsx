/**
 * SignIn Component Rendering Tests
 * 
 * Tests core rendering functionality including:
 * - Page element visibility
 * - Ethereum wallet detection states
 * - Loading and error states
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import SignInRoute from '~/routes/_auth.signIn';

declare global {
  interface Window {
    ethereum?: any;
  }
}

vi.mock('~/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    token: null,
    isAuthenticated: false,
    setToken: vi.fn(),
    verifyToken: vi.fn(),
    setRedirectAfterSignIn: vi.fn(),
  })),
}));

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

const mockFetch = vi.fn();
global.fetch = mockFetch;


interface MockEthereum {
  request: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  isMetaMask?: boolean;
}

const createMockEthereum = (): MockEthereum => ({
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true,
});

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
    // ✅ ENHANCED SPECIFICITY: Check for exact logo elements (there are 6 background patterns + 1 main logo)
    const logos = screen.getAllByAltText('Cipherdolls');
    expect(logos).toHaveLength(6); // 6 Cipherdolls images: main logo + background patterns
    expect(logos[0]).toBeInTheDocument();
    expect(logos[0]).toHaveAttribute('alt', 'Cipherdolls');
    expect(logos[0]).toHaveAttribute('src');
    
    // ✅ ENHANCED SPECIFICITY: Verify main logo is present
    const mainLogo = logos.find(logo => logo.getAttribute('src') === '/logo.svg');
    expect(mainLogo).toBeInTheDocument();
  },
  showsWarningMessage: () => {
    // ✅ ENHANCED SPECIFICITY: Use exact text that actually appears on the page
    const warningText = 'A connected crypto wallet in your browser is required to log in (new or empty wallets are fine).';
    expect(screen.getByText(warningText)).toBeInTheDocument();
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
    it('should display essential sign-in page elements to users', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      assertPageContent.showsLogo();
      assertPageContent.showsVideoPlayer();
      assertPageContent.showsFeatureInfo();
      assertSignInButton.exists();
    });

    it('should provide users with access to all help resources', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      
      const patternImages = screen.getAllByAltText('Cipherdolls');
      expect(patternImages.length).toBeGreaterThan(1);
    });

    it('should show users the instructional video content', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com'));
    });
  });

  describe('Ethereum Detection and Wallet States', () => {
    it('should indicate to users that wallet detection is in progress', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      assertSignInButton.isDisabled();
    });

    it('should allow users to sign in when their wallet is ready', async () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Assert
      assertSignInButton.isEnabled();
    });

    it('should prevent sign-in and guide users when wallet is unavailable', async () => {
      // Arrange
      delete window.ethereum;
      
      // Act
      renderSignInPage();
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Assert
      assertPageContent.showsWarningMessage();
      assertSignInButton.isDisabled();
    });

    it('should gracefully handle wallet detection delays for users', async () => {
      // Arrange
      // Don't set ethereum for this test
      
      // Act
      renderSignInPage();
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Assert
      assertSignInButton.isDisabled();
      assertPageContent.showsWarningMessage();
    });
  });

  describe('Feature Information Display', () => {
    it('displays free usage information correctly', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Registration and usage')).toBeInTheDocument();
    });

    it('displays pricing information correctly', () => {
      // Arrange
      window.ethereum = mockEthereum;
      
      // Act
      renderSignInPage();
      
      // Assert
      expect(screen.getByText('1 LOV')).toBeInTheDocument();
      expect(screen.getByText('For monthly usage')).toBeInTheDocument();
    });
  });
});