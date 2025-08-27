import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { renderWithQuery, createMockUseUserResult, createMockUseTokenPermitsResult, createMockTokenPermitsPaginated, createMockTokenPermit, createMockUser } from '../../test-utils';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useUser } from '~/hooks/queries/userQueries';
import { useTokenPermits } from '~/hooks/queries/tokenQueries';
import { useCreateTokenPermit } from '~/hooks/queries/tokenMutations';
import { useRouteLoaderData } from 'react-router';

// Mock dependencies
vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

vi.mock('~/hooks/queries/tokenQueries', () => ({
  useTokenPermits: vi.fn(),
}));

vi.mock('~/hooks/queries/tokenMutations', () => ({
  useCreateTokenPermit: vi.fn(),
}));

vi.mock('react-router', () => ({
  useRouteLoaderData: vi.fn(),
}));

vi.mock('~/components/CreateTokenAllowanceModal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="create-token-allowance-modal">
      {children}
    </div>
  ),
}));

vi.mock('~/components/PermitHistoryModal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="permit-history-modal">
      {children}
    </div>
  ),
}));

vi.mock('~/components/ui/InformationBadge', () => ({
  InformationBadge: () => (
    <div data-testid="information-badge" />
  ),
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    pen: () => <div data-testid="pen-icon" />,
    history: () => <div data-testid="history-icon" />,
  },
}));

vi.mock('~/components/ui/button/button', () => ({
  Root: ({ children }: any) => (
    <button data-testid="button">
      {children}
    </button>
  ),
}));

describe('TokenPermitsList formatting functions', () => {
  const mockUser = createMockUser({
    tokenBalance: 100,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format permit amount correctly', () => {
    // Test with 1 ether in wei
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatPermitAmount should convert wei to ether and display as string
    // 1000000000000000000 wei = 1 ether should be displayed as "1 LOV"
    expect(container.textContent).toContain('1 LOV');
  });

  it('should format permit amount with decimal values correctly', () => {
    // Test with 0.5 ether in wei
    const mockPermit = createMockTokenPermit({ 
      value: '500000000000000000' // 0.5 ether in wei
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatPermitAmount should convert 0.5 ether and display as "0.5 LOV"
    expect(container.textContent).toContain('0.5 LOV');
  });

  it('should format allowance amount correctly for large wei values', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether
    });

    // Test with large wei value (more than 15 digits - should be treated as wei)
    const mockUserWithAllowance = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '1500000000000000000', // 1.5 ether in wei (18 digits)
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUserWithAllowance);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUserWithAllowance,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatAllowanceAmount should convert wei to ether and format with 2 decimals
    // 1.5 ether should display as "1.50 LOV"
    expect(container.textContent).toContain('1.50 LOV');
  });

  it('should format allowance amount correctly for small ether values', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether
    });

    // Test with small value (less than 15 digits - should be treated as ether)
    const mockUserWithAllowance = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '2.5', // already in ether format
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUserWithAllowance);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUserWithAllowance,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatAllowanceAmount should format directly as ether with 2 decimals
    // 2.5 ether should display as "2.50 LOV"
    expect(container.textContent).toContain('2.50 LOV');
  });

  it('should handle invalid permit values gracefully', () => {
    const mockPermit = createMockTokenPermit({ 
      value: 'invalid-value'
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatPermitAmount should return "0" for invalid values
    expect(container.textContent).toContain('0 LOV');
  });

  it('should handle invalid allowance values gracefully', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether
    });

    const mockUserWithInvalidAllowance = createMockUser({
      tokenBalance: 100,
      tokenAllowance: 'invalid-allowance',
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUserWithInvalidAllowance);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUserWithInvalidAllowance,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [mockPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);
    
    // formatAllowanceAmount should return "0.00" for invalid values
    expect(container.textContent).toContain('0.00 LOV');
  });
});