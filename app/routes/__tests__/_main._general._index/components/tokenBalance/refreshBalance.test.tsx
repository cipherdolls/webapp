import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
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
    refresh: ({ className }: { className?: string }) => (
      <div data-testid="refresh-icon" className={className} />
    ),
    iconLogo: () => <div data-testid="icon-logo" />,
  },
}));

const mockUseUser = vi.mocked(useUser);
const mockUseRefreshTokenBalance = vi.mocked(useRefreshTokenBalance);
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);

describe('TokenBalance refresh functionality', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: 100,
      signerAddress: '0x123456789'
    });

    // Default route loader data
    mockUseRouteLoaderData.mockReturnValue(mockUser);
    
    // Default useUser result
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);
  });

  it('should call refresh mutation when button clicked', () => {
    const mockMutate = vi.fn();
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: mockMutate, 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);
    
    const refreshButton = screen.getByTitle('Refresh token balance');
    fireEvent.click(refreshButton);

    expect(mockMutate).toHaveBeenCalledWith({
      userId: mockUser.id,
      signerAddress: mockUser.signerAddress,
    });
  });

  it('should show loading state during refresh', () => {
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(), 
      isPending: true,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);

    const refreshButton = screen.getByTitle('Refresh token balance');
    expect(refreshButton).toBeDisabled();
    
    // Check that the icon has animate-spin class when pending
    const refreshIcon = screen.getByTestId('refresh-icon');
    expect(refreshIcon).toHaveClass('animate-spin');
  });

  it('should not be disabled when not refreshing', () => {
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(), 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);

    const refreshButton = screen.getByTitle('Refresh token balance');
    expect(refreshButton).not.toBeDisabled();
    
    // Check that the icon does not have animate-spin class when not pending
    const refreshIcon = screen.getByTestId('refresh-icon');
    expect(refreshIcon).not.toHaveClass('animate-spin');
  });

  it('should use correct button title attribute', () => {
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(), 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);

    const refreshButton = screen.getByTitle('Refresh token balance');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton.getAttribute('title')).toBe('Refresh token balance');
  });

  it('should handle refresh when using route loader data (fallback scenario)', () => {
    // Simulate scenario where useUser returns no data, falling back to route loader
    const routeUser = createMockUser({ 
      id: 'route-user-123', 
      signerAddress: '0xroute123',
      tokenBalance: 50 
    });
    mockUseRouteLoaderData.mockReturnValue(routeUser);
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefined, // No user data from useUser
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    const mockMutate = vi.fn();
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: mockMutate, 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);
    
    const refreshButton = screen.getByTitle('Refresh token balance');
    fireEvent.click(refreshButton);

    // Should use route loader data for the mutation call
    expect(mockMutate).toHaveBeenCalledWith({
      userId: routeUser.id,
      signerAddress: routeUser.signerAddress,
    });
  });

  it('should have proper button styling classes', () => {
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(), 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);

    const refreshButton = screen.getByTitle('Refresh token balance');
    
    // Check for expected CSS classes from the component
    expect(refreshButton).toHaveClass(
      'p-2', 
      'rounded-lg', 
      'text-[#350D2A]/40', 
      'hover:text-[#350D2A]', 
      'transition-all', 
      'disabled:opacity-50'
    );
  });

  it('should call useRefreshTokenBalance hook', () => {
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(), 
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);

    renderWithQuery(<TokenBalance />);

    expect(useRefreshTokenBalance).toHaveBeenCalled();
  });
});