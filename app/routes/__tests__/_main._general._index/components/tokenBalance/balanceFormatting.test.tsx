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

describe('TokenBalance formatting', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseRefreshTokenBalance.mockReturnValue(
      createMockUseRefreshTokenBalanceResult({
        mutate: vi.fn(),
        isPending: false,
      })
    );

    mockUseRouteLoaderData.mockReturnValue(createMockUser({ tokenBalance: 0 }));
  });

  it('should format balance with 3 decimal places', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: 123.456789 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should format to 3 decimal places: 123.457 (rounded up from 123.456789)
    expect(screen.getByText('123.457')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should show 0 for zero balance', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: 0 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should handle string balance values', () => {
    // TokenBalance can receive string values from API
    mockUser = createMockUser({ id: '1', tokenBalance: '456.789123' as any });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should parse string and format to 3 decimal places: 456.789
    expect(screen.getByText('456.789')).toBeInTheDocument();
  });

  it('should format large numbers with thousand separators', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: 1234567.123 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should include thousand separators: 1,234,567.123
    expect(screen.getByText('1,234,567.123')).toBeInTheDocument();
  });

  it('should handle very small decimal values', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: 0.001 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should format small decimals: 0.001
    expect(screen.getByText('0.001')).toBeInTheDocument();
  });

  it('should handle negative balance (edge case)', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: -123.456 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // For negative values, the formatting logic shows 0
    // Based on: roundedValue > 0 ? formatted : '0'
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle null or undefined balance gracefully', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: undefined as any });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should fall back to '0' for undefined balance
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should always display 3 decimal places for non-zero values', () => {
    mockUser = createMockUser({ id: '1', tokenBalance: 5 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);
    
    // Should show 3 decimal places even for whole numbers: 5.000
    expect(screen.getByText('5.000')).toBeInTheDocument();
  });
});