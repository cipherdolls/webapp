/**
 * TokenBalance Component User Experience Tests
 * 
 * Tests how users see and interact with their token balance including:
 * - Clear balance display for users
 * - Easy-to-read formatting for various amounts
 * - Graceful handling of edge cases
 * - User-friendly refresh functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUser, createMockUseUserResult, createMockUseRefreshTokenBalanceResult } from '../../test-utils';
import TokenBalance from '~/components/TokenBalance';
import { useUser } from '~/hooks/queries/userQueries';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
import type { User } from '~/types';


vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

vi.mock('~/hooks/queries/userMutations', () => ({
  useRefreshTokenBalance: vi.fn(),
}));



const mockUseUser = vi.mocked(useUser);
const mockUseRefreshTokenBalance = vi.mocked(useRefreshTokenBalance);

describe('TokenBalance User Experience', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseRefreshTokenBalance.mockReturnValue(
      createMockUseRefreshTokenBalanceResult({
        mutate: vi.fn(),
        isPending: false,
      })
    );

    // REMOVED: Unused mock call
    // mockUseRouteLoaderData.mockReturnValue(createMockUser({ tokenBalance: 0 }));
  });

  it('should display user token balance clearly and precisely', () => {
    // Arrange
    mockUser = createMockUser({ id: '1', tokenBalance: 123.456789 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Focus on what users see and can interact with
    expect(screen.getByText('123.457')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
    
    // ✅ ACCESSIBILITY: Section heading should be accessible to screen readers
    const balanceHeading = screen.getByRole('heading', { name: /your balance/i });
    expect(balanceHeading).toBeInTheDocument();
    expect(balanceHeading).toHaveProperty('tagName', 'H3');
    
    // ✅ ACCESSIBILITY: User should be able to refresh their balance with proper button role and name
    const refreshButton = screen.getByRole('button', { name: /refresh token balance/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
    expect(refreshButton).toHaveAttribute('title', 'Refresh token balance');
    
    // ✅ ACCESSIBILITY: Visual indicator (OP logo) should have proper alt text for screen readers
    const opLogo = screen.getByRole('img', { name: /op/i });
    expect(opLogo).toBeInTheDocument();
    expect(opLogo).toHaveAttribute('alt', 'OP');
  });

  it('should show users when they have no tokens', () => {
    // Arrange
    mockUser = createMockUser({ id: '1', tokenBalance: 0 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - User should clearly see they have zero tokens
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
    
    // ✅ ACCESSIBILITY: Balance section should be accessible even with zero tokens
    const balanceHeading = screen.getByRole('heading', { name: /your balance/i });
    expect(balanceHeading).toBeInTheDocument();
    
    // ✅ ACCESSIBILITY: User should still have access to refresh functionality with proper accessibility attributes
    const refreshButton = screen.getByRole('button', { name: /refresh token balance/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveAttribute('title', 'Refresh token balance');
  });

  it('should display balance correctly regardless of data format', () => {
    // Arrange - Backend might send balance as string
    mockUser = createMockUser({ id: '1', tokenBalance: '456.789123' as any });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - User should see properly formatted balance regardless of data type
    expect(screen.getByText('456.789')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should make large token amounts easy to read for users', () => {
    // Arrange - User has a large token balance
    mockUser = createMockUser({ id: '1', tokenBalance: 1234567.123 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Large numbers should have thousand separators for readability
    expect(screen.getByText('1,234,567.123')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should display small token amounts accurately for users', () => {
    // Arrange - User has a very small token balance
    mockUser = createMockUser({ id: '1', tokenBalance: 0.001 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Small amounts should be preserved and visible to users
    expect(screen.getByText('0.001')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should protect users from displaying negative balances', () => {
    // Arrange - Edge case where balance might be negative
    mockUser = createMockUser({ id: '1', tokenBalance: -123.456 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Negative balance should be shown as 0 to avoid user confusion
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should show sensible default when balance data is unavailable', () => {
    // Arrange - Balance data is missing or undefined
    mockUser = createMockUser({ id: '1', tokenBalance: undefined as any });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Should show 0 as safe default when data is unavailable
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should provide consistent precision for user readability', () => {
    // Arrange - User has whole number token balance
    mockUser = createMockUser({ id: '1', tokenBalance: 5 });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Act
    renderWithQuery(<TokenBalance />);
    
    // Assert - Should display consistent decimal places for uniformity
    expect(screen.getByText('5.000')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });
});