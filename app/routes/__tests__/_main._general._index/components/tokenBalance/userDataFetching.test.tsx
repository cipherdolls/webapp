import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUser, createMockUseUserResult, createMockUseRefreshTokenBalanceResult } from '../../test-utils';
import TokenBalance from '~/components/TokenBalance';
import { useUser } from '~/hooks/queries/userQueries';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import { useRouteLoaderData } from 'react-router';
import type { User } from '~/types';

// ========================
// MOCK SETUP
// ========================

vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

vi.mock('~/hooks/queries/userMutations', () => ({
  useRefreshTokenBalance: vi.fn(),
}));

vi.mock('react-router', () => ({
  useRouteLoaderData: vi.fn(),
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    refresh: () => <div data-testid="refresh-icon" />,
    iconLogo: () => <div data-testid="icon-logo" />,
  },
}));

const mockUseUser = vi.mocked(useUser);
const mockUseRefreshTokenBalance = vi.mocked(useRefreshTokenBalance);
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);

describe('TokenBalance user data fetching', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = createMockUser({ 
      id: '1', 
      tokenBalance: 100 
    });

    // Default mock implementations
    mockUseRefreshTokenBalance.mockReturnValue(
      createMockUseRefreshTokenBalanceResult({
        mutate: vi.fn(),
        isPending: false,
      })
    );
  });

  it('should use both useUser hook and RouteLoaderData', () => {
    const mockRouteData = createMockUser({ id: '1', tokenBalance: 100 });
    mockUseRouteLoaderData.mockReturnValue(mockRouteData);
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    expect(useUser).toHaveBeenCalled();
    expect(useRouteLoaderData).toHaveBeenCalledWith('routes/_main');
  });

  it('should use useUser data when available', () => {
    const routeUser = createMockUser({ id: '1', tokenBalance: 50, name: 'Route User' });
    const queryUser = createMockUser({ id: '1', tokenBalance: 100, name: 'Query User' });
    
    mockUseRouteLoaderData.mockReturnValue(routeUser);
    
    const mockUseUserResult = createMockUseUserResult({
      data: queryUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should prioritize useUser data over route loader data
    // TokenBalance uses: const currentUser = user || me;
    // So if user (from useUser) exists, it should be used
    expect(screen.getByText('100.000')).toBeInTheDocument(); // Query user balance
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should fall back to RouteLoaderData when useUser returns no data', () => {
    const routeUser = createMockUser({ id: '1', tokenBalance: 75 });
    
    mockUseRouteLoaderData.mockReturnValue(routeUser);
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should use route loader data when useUser returns no data
    expect(screen.getByText('75.000')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should show loading skeleton when userLoading is true', () => {
    const routeUser = createMockUser({ id: '1', tokenBalance: 50 });
    mockUseRouteLoaderData.mockReturnValue(routeUser);
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isLoading: true, // Loading state
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should show loading skeleton
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    
    // Should not show the actual content
    expect(screen.queryByText('Your Balance')).not.toBeInTheDocument();
    expect(screen.queryByText('LOV')).not.toBeInTheDocument();
  });

  it('should display Your Balance title', () => {
    const routeUser = createMockUser({ id: '1', tokenBalance: 100 });
    mockUseRouteLoaderData.mockReturnValue(routeUser);
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    expect(screen.getByText('Your Balance')).toBeInTheDocument();
  });
});