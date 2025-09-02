import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUser, createMockUseUserResult, createMockUseRefreshTokenBalanceResult } from '../../test-utils';
import TokenBalance from '~/components/TokenBalance';
import { useUser } from '~/hooks/queries/userQueries';
import { useRefreshTokenBalance } from '~/hooks/queries/userMutations';
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

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    refresh: () => <div data-testid="refresh-icon" />,
    iconLogo: () => <div data-testid="icon-logo" />,
  },
}));

const mockUseUser = vi.mocked(useUser);
const mockUseRefreshTokenBalance = vi.mocked(useRefreshTokenBalance);

describe('TokenBalance validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for mutation
    const mockMutation = createMockUseRefreshTokenBalanceResult({ 
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseRefreshTokenBalance.mockReturnValue(mockMutation);
  });

  it('should display 0 for null balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: null as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('LOV')).toBeInTheDocument();
  });

  it('should display 0 for undefined balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: undefined as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display 0 for NaN balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: NaN as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display 0 for Infinity balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: Infinity as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display 0 for invalid string balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: 'invalid-number' as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should display 0 for object balance', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: {} as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle valid string numbers correctly', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: '123.456' as any
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('123.456')).toBeInTheDocument();
  });

  it('should handle valid numeric balances correctly', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: 456.789
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('456.789')).toBeInTheDocument();
  });

  it('should handle zero balance correctly', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: 0
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle negative balance by displaying 0', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: -100
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle very small positive numbers correctly', () => {
    const mockUser = createMockUser({ 
      id: 'user-123', 
      tokenBalance: 0.001
    });
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isLoading: false,
    });
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(<TokenBalance />);

    expect(screen.getByText('0.001')).toBeInTheDocument();
  });
});