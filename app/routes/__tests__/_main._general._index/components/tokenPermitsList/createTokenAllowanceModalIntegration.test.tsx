import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock CreateTokenAllowanceModal with proper callback handling
vi.mock('~/components/CreateTokenAllowanceModal', () => ({
  default: ({ children, onPermitSigned, tokenBalance }: { 
    children: React.ReactNode; 
    onPermitSigned: (permit: any) => void;
    tokenBalance: number;
  }) => (
    <div data-testid="create-token-allowance-modal" data-token-balance={tokenBalance}>
      {children}
      <button 
        data-testid="mock-permit-sign-button"
        onClick={() => {
          // Mock a signed permit
          onPermitSigned({
            owner: '0x123456789abcdef',
            spender: '0xfedcba987654321',
            value: '1000000000000000000',
            nonce: '0',
            deadline: Math.floor(Date.now() / 1000) + 3600,
            v: 27,
            r: '0x' + 'a'.repeat(64),
            s: '0x' + 'b'.repeat(64),
          });
        }}
      >
        Sign Permit
      </button>
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

describe('TokenPermitsList modal integration', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onPermitSigned with correct parameters', () => {
    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '0',
    });

    const mockMutation = { mutate: mockMutate, isPending: false };
    vi.mocked(useCreateTokenPermit).mockReturnValue(mockMutation as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
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

    renderWithQuery(<TokenPermitsList />);

    // Click the mock permit sign button
    fireEvent.click(screen.getByTestId('mock-permit-sign-button'));

    // Verify the mutation was called with correct parameters
    expect(mockMutate).toHaveBeenCalledWith({
      owner: '0x123456789abcdef',
      spender: '0xfedcba987654321',
      value: '1000000000000000000',
      nonce: '0',
      deadline: expect.any(String), // deadline should be converted to string
      v: '27', // v should be converted to string
      r: '0x' + 'a'.repeat(64),
      s: '0x' + 'b'.repeat(64),
    });
  });

  it('should pass tokenBalance to CreateTokenAllowanceModal', () => {
    const mockUser = createMockUser({
      tokenBalance: 250,
      tokenAllowance: '0',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
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

    renderWithQuery(<TokenPermitsList />);

    // Check that the modal receives the correct tokenBalance
    expect(screen.getByTestId('create-token-allowance-modal')).toHaveAttribute('data-token-balance', '250');
  });

  it('should render Create allowances link when no permits exist', () => {
    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '0',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
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

    renderWithQuery(<TokenPermitsList />);

    // Should show the "Create allowances" link in empty state
    expect(screen.getByText('Create allowances.')).toBeInTheDocument();
    expect(screen.getByTestId('create-token-allowance-modal')).toBeInTheDocument();
  });

  it('should render Create Permit button when permits exist', () => {
    const mockPermit = createMockTokenPermit();
    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '500000000000000000',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

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

    renderWithQuery(<TokenPermitsList />);

    // Should show the "Create Permit" button in the top section
    expect(screen.getByText('Create Permit')).toBeInTheDocument();
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
  });

  it('should handle permit signing flow correctly', () => {
    const mockUser = createMockUser({
      tokenBalance: 150,
      tokenAllowance: '0',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
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

    renderWithQuery(<TokenPermitsList />);

    // Verify the modal is properly integrated
    expect(screen.getByTestId('create-token-allowance-modal')).toBeInTheDocument();
    
    // Click to trigger permit signing
    fireEvent.click(screen.getByTestId('mock-permit-sign-button'));

    // Verify mutation was called
    expect(mockMutate).toHaveBeenCalledTimes(1);
    
    // Verify the mutation was called with the expected structure
    const callArgs = mockMutate.mock.calls[0][0];
    expect(callArgs).toHaveProperty('owner');
    expect(callArgs).toHaveProperty('spender');
    expect(callArgs).toHaveProperty('value');
    expect(callArgs).toHaveProperty('nonce');
    expect(callArgs).toHaveProperty('deadline');
    expect(callArgs).toHaveProperty('v');
    expect(callArgs).toHaveProperty('r');
    expect(callArgs).toHaveProperty('s');
  });

  it('should convert numeric permit values to strings correctly', () => {
    const mockUser = createMockUser({
      tokenBalance: 100,
      tokenAllowance: '0',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
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

    renderWithQuery(<TokenPermitsList />);

    // Trigger permit signing
    fireEvent.click(screen.getByTestId('mock-permit-sign-button'));

    // Verify deadline and v are converted to strings
    const callArgs = mockMutate.mock.calls[0][0];
    expect(typeof callArgs.deadline).toBe('string');
    expect(typeof callArgs.v).toBe('string');
    expect(callArgs.v).toBe('27');
  });

  it('should use user data from useUser hook correctly', () => {
    const mockUser = createMockUser({
      tokenBalance: 75,
      tokenAllowance: '0',
    });

    vi.mocked(useCreateTokenPermit).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(useRouteLoaderData).mockReturnValue(mockUser);
    vi.mocked(useUser).mockReturnValue(createMockUseUserResult({
      data: mockUser, // Use user data from query
      isLoading: false,
      isSuccess: true,
    }));
    vi.mocked(useTokenPermits).mockReturnValue(createMockUseTokenPermitsResult({
      data: createMockTokenPermitsPaginated({ data: [] }),
      isLoading: false,
      isSuccess: true,
    }));

    renderWithQuery(<TokenPermitsList />);

    // Should pass the correct tokenBalance from useUser hook
    expect(screen.getByTestId('create-token-allowance-modal')).toHaveAttribute('data-token-balance', '75');
  });
});