import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithQuery, createMockUseUserResult, createMockUseTokenPermitsResult, createMockTokenPermitsPaginated, createMockUser } from '../../test-utils';
import TokenPermitsList from '~/components/TokenPermitsList';
import { useUser } from '~/hooks/queries/userQueries';
import { useTokenPermits } from '~/hooks/queries/tokenQueries';
import { useCreateTokenPermit } from '~/hooks/queries/tokenMutations';
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

vi.mock('~/components/CreateTokenAllowanceModal', () => ({
  default: ({ children, onPermitSigned }: { children: React.ReactNode; onPermitSigned: any }) => (
    <div data-testid="create-token-allowance-modal" data-on-permit-signed={!!onPermitSigned}>
      {children}
    </div>
  ),
}));

vi.mock('~/components/PermitHistoryModal', () => ({
  default: ({ children, permits }: { children: React.ReactNode; permits: any }) => (
    <div data-testid="permit-history-modal" data-permits-length={permits?.length || 0}>
      {children}
    </div>
  ),
}));

vi.mock('~/components/ui/InformationBadge', () => ({
  InformationBadge: ({ tooltipText, className }: { tooltipText: string; className: string }) => (
    <div data-testid="information-badge" data-tooltip={tooltipText} className={className} />
  ),
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    pen: ({ className }: { className?: string }) => (
      <div data-testid="pen-icon" className={className} />
    ),
    history: ({ className }: { className?: string }) => (
      <div data-testid="history-icon" className={className} />
    ),
  },
}));

vi.mock('~/components/ui/button/button', () => ({
  Root: ({ children, onClick, className, variant }: any) => (
    <button data-testid="button" onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('TokenPermitsList user data fetching', () => {
  const mockUser = createMockUser({
    tokenBalance: 100,
    tokenAllowance: '500000000000000000', // 0.5 ether in wei
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user and token permits data', () => {
    // Mock useUser
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));

    // Mock useTokenPermits
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [] }),
      isLoading: false,
      isSuccess: true,
    }));

    // Mock useCreateTokenPermit
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithQuery(<TokenPermitsList />);
    
    expect(useUser).toHaveBeenCalled();
    expect(useTokenPermits).toHaveBeenCalled();
  });

  it('should render Token Permits heading when hooks are called successfully', () => {
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithQuery(<TokenPermitsList />);
    
    expect(screen.getByText('Token Permits')).toBeInTheDocument();
    expect(screen.getByTestId('information-badge')).toBeInTheDocument();
  });

  it('should handle when user query data is not available', () => {
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithQuery(<TokenPermitsList />);
    
    // Should still render properly even without user data
    expect(screen.getByText('Token Permits')).toBeInTheDocument();
    expect(screen.getByTestId('information-badge')).toBeInTheDocument();
  });

  it('should show skeleton when user data is loading', () => {
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: undefined,
      isLoading: true,
      isPending: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithQuery(<TokenPermitsList />);
    
    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show skeleton when token permits data is loading', () => {
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: undefined,
      isLoading: true,
      isPending: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    renderWithQuery(<TokenPermitsList />);
    
    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});