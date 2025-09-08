/**
 * Dashboard Component Integration Tests
 * 
 * Tests the main dashboard behavior including:
 * - Network warning visibility logic
 * - User data integration
 * - Component rendering based on network state
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUser, createMockUseUserResult } from '../test-utils';
import Dashboard from '~/routes/_main._general.account';
import type { NetworkState } from '~/hooks/useNetworkCheck';
import type { User } from '~/types';

vi.mock('~/hooks/useNetworkCheck', () => ({
  useNetworkCheck: vi.fn(),
}));

vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

import { useNetworkCheck } from '~/hooks/useNetworkCheck';
import { useUser } from '~/hooks/queries/userQueries';

const mockUseNetworkCheck = useNetworkCheck as ReturnType<typeof vi.fn>;
const mockUseUser = vi.mocked(useUser);

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

const renderDashboard = () => {
  return renderWithQuery(<Dashboard />);
};

const dashboardAssertions = {
  expectNetworkWarningVisible: () => {
    expect(screen.getByText(/wrong network detected/i)).toBeInTheDocument();
  },
  
  expectNetworkWarningHidden: () => {
    expect(screen.queryByText(/wrong network detected/i)).not.toBeInTheDocument();
  },
  
  expectDashboardBannerVisible: () => {
    expect(screen.getByRole('heading', { name: /hey, test user/i })).toBeInTheDocument();
  },
  
  expectDescriptionVisible: (description: string) => {
    expect(screen.getByText(description)).toBeInTheDocument();
  },
  
  expectDescriptionHidden: () => {
    expect(screen.queryByText('What do you want to start from?')).not.toBeInTheDocument();
  },
  
  expectRealComponentsRender: () => {
    expect(screen.getByText(/your balance/i)).toBeInTheDocument();
    expect(screen.getByText('100.123')).toBeInTheDocument();
  },
};


describe('when dashboard loads', () => {
  let mockUser: User;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUser = createMockUser({
      id: '1',
      name: 'Test User',
      tokenBalance: 100.123,
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);
  });

  it('should display dashboard content when network is correct', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      isOnCorrectNetwork: true,
      hasMetaMask: true,
      isLoading: false,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectRealComponentsRender();
  });
});

describe('when determining network warning visibility', () => {
  let mockUser: User;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUser = createMockUser({
      id: '1', 
      name: 'Test User',
      tokenBalance: 100.123,
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);
  });

  it('should display network warning when user has MetaMask but wrong network', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: false,
      isOnCorrectNetwork: false,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectNetworkWarningVisible();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionHidden();
    dashboardAssertions.expectRealComponentsRender();
  });

  it('should show default description when user has no MetaMask', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: false,
      isLoading: false,
      isOnCorrectNetwork: false,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
    dashboardAssertions.expectRealComponentsRender();
  });

  it('should show default description during network loading', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: true,
      isOnCorrectNetwork: false,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
    dashboardAssertions.expectRealComponentsRender();
  });

  it('should show default description when user is on correct network', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: true,
      isLoading: false,
      isOnCorrectNetwork: true,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
    dashboardAssertions.expectRealComponentsRender();
  });

  it('should display normal dashboard state when all conditions are optimal', () => {
    // Arrange
    const mockNetworkCheck = createMockNetworkState({
      hasMetaMask: false,
      isLoading: false,
      isOnCorrectNetwork: true,
    });
    mockUseNetworkCheck.mockReturnValue(mockNetworkCheck);

    // Act
    renderDashboard();
    
    // Assert
    dashboardAssertions.expectNetworkWarningHidden();
    dashboardAssertions.expectDashboardBannerVisible();
    dashboardAssertions.expectDescriptionVisible('What do you want to start from?');
    dashboardAssertions.expectRealComponentsRender();
  });
});