import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '~/routes/_main._general._index';
import type { NetworkState } from '~/hooks/useNetworkCheck';

// ========================
// SHARED MOCK SETUP
// ========================

// Mock hooks
vi.mock('~/hooks/useNetworkCheck', () => ({
  useNetworkCheck: vi.fn(),
}));

// Mock components
vi.mock('~/components/dashboardBanner', () => ({
  default: ({ variant, description, showEditLink }: { 
    variant: string; 
    description: string | null; 
    showEditLink: boolean; 
  }) => (
    <div data-testid="dashboard-banner" data-variant={variant} data-show-edit-link={showEditLink}>
      {description && <span data-testid="description">{description}</span>}
    </div>
  ),
}));

vi.mock('~/components/NetworkWarningBanner', () => ({
  default: () => <div data-testid="network-warning-banner">Network Warning</div>,
}));

vi.mock('~/components/your-chats', () => ({
  default: () => <div data-testid="your-chats">Your Chats</div>,
}));

vi.mock('~/components/yourAvatars', () => ({
  default: () => <div data-testid="your-avatars">Your Avatars</div>,
}));

vi.mock('~/components/your-scenarios', () => ({
  default: () => <div data-testid="your-scenarios">Your Scenarios</div>,
}));

vi.mock('~/components/TokenBalance', () => ({
  default: () => <div data-testid="token-balance">Token Balance</div>,
}));

vi.mock('~/components/TokenPermitsList', () => ({
  default: () => <div data-testid="token-permits-list">Token Permits List</div>,
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    mobileLogo: () => <svg data-testid="mobile-logo" />,
  },
}));

import { useNetworkCheck } from '~/hooks/useNetworkCheck';

// Create typed mock
const mockUseNetworkCheck = useNetworkCheck as ReturnType<typeof vi.fn>;

// ========================
// SHARED HELPER FUNCTIONS
// ========================

/**
 * Creates a mock NetworkState object with required properties
 */
interface CreateMockNetworkStateOptions {
  isOnCorrectNetwork?: boolean;
  hasMetaMask?: boolean;
  isLoading?: boolean;
  currentChainId?: string | null;
}

const createMockNetworkState = (overrides: CreateMockNetworkStateOptions = {}): NetworkState & { refetchNetwork: ReturnType<typeof vi.fn> } => ({
  isOnCorrectNetwork: false,
  hasMetaMask: false,
  isLoading: false,
  currentChainId: null,
  refetchNetwork: vi.fn(),
  ...overrides,
});

/**
 * Standard render function for Dashboard
 */
const renderDashboard = () => {
  return render(<Dashboard />);
};

/**
 * Common assertion helpers
 */
const dashboardAssertions = {
  expectNetworkWarningVisible: () => {
    expect(screen.getByTestId('network-warning-banner')).toBeInTheDocument();
  },
  
  expectNetworkWarningHidden: () => {
    expect(screen.queryByTestId('network-warning-banner')).not.toBeInTheDocument();
  },
  
  expectDashboardBannerVisible: () => {
    expect(screen.getByTestId('dashboard-banner')).toBeInTheDocument();
  },
  
  expectDescriptionVisible: (description: string) => {
    expect(screen.getByTestId('description')).toHaveTextContent(description);
  },
  
  expectDescriptionHidden: () => {
    expect(screen.queryByTestId('description')).not.toBeInTheDocument();
  },
};

// ========================
// TESTS
// ========================

describe('Dashboard useNetworkCheck integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useNetworkCheck hook and use its values', () => {
    const mockNetworkCheck = createMockNetworkState({
      isOnCorrectNetwork: true,
      hasMetaMask: true,
      isLoading: false,
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    expect(useNetworkCheck).toHaveBeenCalled();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectNetworkWarningHidden();
  });
});

describe('Dashboard shouldShowNetworkWarning logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show network warning when hasMetaMask=true, isLoading=false, isOnCorrectNetwork=false', () => {
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: false,
      isOnCorrectNetwork: false,
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    dashboardAssertions.expectNetworkWarningVisible();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionHidden();
  });

  it('should not show network warning when hasMetaMask=false', () => {
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: false,
      isLoading: false,
      isOnCorrectNetwork: false,
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
  });

  it('should not show network warning when isLoading=true', () => {
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: true,
      isOnCorrectNetwork: false,
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
  });

  it('should not show network warning when isOnCorrectNetwork=true', () => {
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: false,
      isOnCorrectNetwork: true,
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
  });

  it('should show normal description when all conditions for warning are false', () => {
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: false,
      isLoading: false,
      isOnCorrectNetwork: true, // doesn't matter when hasMetaMask is false
    });
    
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    renderDashboard();
    
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
  });
});