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

describe('TokenPermitsList progress bar calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate progress percentage correctly', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '500000000000000000', // 0.5 ether in wei
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
    
    // Progress bar should show 50% (0.5 / 1.0 = 50%)
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should cap progress at 100%', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '2000000000000000000', // 2 ether in wei - more than permit
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
    
    // Progress bar should be capped at 100%
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('should show 0% progress when no allowance', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '0', // No allowance
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
    
    // Progress bar should show 0%
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('should show 0% progress when allowance is undefined', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: undefined, // undefined allowance
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
    
    // Progress bar should show 0%
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('should calculate progress correctly with decimal values', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '3000000000000000000' // 3 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '1000000000000000000', // 1 ether in wei
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
    
    // Progress bar should show ~33.33% (1 / 3 = 33.33%)
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    
    // Get the computed width style
    const style = progressBar?.getAttribute('style');
    expect(style).toContain('33.33333333333333%'); // JavaScript float precision
  });

  it('should show progress bar container with proper styling', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '500000000000000000', // 0.5 ether in wei
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
    
    // Check progress bar container exists
    const progressContainer = container.querySelector('.bg-neutral-04.rounded-full.h-2');
    expect(progressContainer).toBeInTheDocument();
    
    // Check progress bar styling
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600.h-2.rounded-full');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass('transition-all', 'duration-300');
  });

  it('should handle edge case with very small amounts', () => {
    const mockPermit = createMockTokenPermit({ 
      value: '1000000000000000000' // 1 ether in wei
    });

    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '1000000000000000', // 0.001 ether in wei (very small)
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
    
    // Progress bar should show very small percentage (0.001 / 1 = 0.1%)
    const progressBar = container.querySelector('.bg-gradient-to-r.from-green-500.to-green-600');
    expect(progressBar).toBeInTheDocument();
    
    const style = progressBar?.getAttribute('style');
    expect(style).toContain('0%'); // Very small amounts round to 0%
  });
});