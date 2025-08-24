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
  default: ({ children, permits }: { children: React.ReactNode; permits: any[] }) => (
    <div data-testid="permit-history-modal" data-permits={JSON.stringify(permits)}>
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

describe('TokenPermitsList expiration logic', () => {
  const mockUser = createMockUser({
    tokenBalance: 100,
    tokenAllowance: '500000000000000000',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle expired permits correctly', () => {
    // Create a permit that expired 1 hour ago
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const expiredPermit = createMockTokenPermit({
      deadline: expiredTimestamp,
      value: '1000000000000000000',
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [expiredPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);

    // Component should still render the permit (the UI doesn't currently show expiration warnings)
    // but the permit data should be passed correctly to child components
    expect(container.textContent).toContain('LOV Token Allowance');
    
    // Verify the expired permit is passed to PermitHistoryModal
    const historyModal = container.querySelector('[data-testid="permit-history-modal"]');
    expect(historyModal).toBeInTheDocument();
    
    const permitsData = JSON.parse(historyModal?.getAttribute('data-permits') || '[]');
    expect(permitsData).toHaveLength(1);
    expect(permitsData[0].deadline).toBe(expiredTimestamp);
  });

  it('should handle active permits correctly', () => {
    // Create a permit that expires 1 hour from now
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const activePermit = createMockTokenPermit({
      deadline: futureTimestamp,
      value: '1000000000000000000',
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [activePermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);

    // Component should render normally for active permits
    expect(container.textContent).toContain('LOV Token Allowance');
    expect(container.textContent).toContain('1 LOV'); // Total permit amount
    
    // Progress bar should be visible
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle mixed expired and active permits', () => {
    // Create one expired and one active permit
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600;
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
    
    const expiredPermit = createMockTokenPermit({
      id: 'expired-permit',
      deadline: expiredTimestamp,
      value: '500000000000000000', // 0.5 ether
    });
    
    const activePermit = createMockTokenPermit({
      id: 'active-permit', 
      deadline: futureTimestamp,
      value: '1000000000000000000', // 1 ether
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [expiredPermit, activePermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);

    // Should use the first permit (expired one) for display calculations
    expect(container.textContent).toContain('0.5 LOV'); // Total from first permit
    
    // Verify both permits are passed to PermitHistoryModal
    const historyModal = container.querySelector('[data-testid="permit-history-modal"]');
    const permitsData = JSON.parse(historyModal?.getAttribute('data-permits') || '[]');
    expect(permitsData).toHaveLength(2);
    expect(permitsData.find((p: any) => p.id === 'expired-permit')).toBeTruthy();
    expect(permitsData.find((p: any) => p.id === 'active-permit')).toBeTruthy();
  });

  it('should handle permit deadline at exactly current time', () => {
    // Create a permit that expires exactly now
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentPermit = createMockTokenPermit({
      deadline: currentTimestamp,
      value: '2000000000000000000', // 2 ether
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [currentPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);

    // Component should still render (expiration is handled at the blockchain level)
    expect(container.textContent).toContain('LOV Token Allowance');
    expect(container.textContent).toContain('2 LOV');
  });

  it('should handle permits with very far future deadlines', () => {
    // Create a permit that expires in 1 year
    const farFutureTimestamp = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    const longTermPermit = createMockTokenPermit({
      deadline: farFutureTimestamp,
      value: '5000000000000000000', // 5 ether
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [longTermPermit] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    const { container } = renderWithQuery(<TokenPermitsList />);

    // Should render normally for long-term permits
    expect(container.textContent).toContain('LOV Token Allowance');
    expect(container.textContent).toContain('5 LOV');
    
    // Progress calculation should work correctly
    // User has 0.5 ether allowance, permit is 5 ether = 10% progress
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '10%' });
  });

  it('should handle permits without deadline gracefully', () => {
    // Create a permit without deadline (edge case)
    const permitWithoutDeadline = createMockTokenPermit({
      deadline: undefined as any,
      value: '1000000000000000000',
    });

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [permitWithoutDeadline] }),
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    // Should not throw an error and render gracefully
    expect(() => {
      renderWithQuery(<TokenPermitsList />);
    }).not.toThrow();
  });
});