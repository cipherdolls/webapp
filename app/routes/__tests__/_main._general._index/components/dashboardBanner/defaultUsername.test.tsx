import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { User } from '~/types';
import { 
  createMockUser, 
  createMockUseUserResult, 
  renderWithQuery
} from '../../test-utils';

// ========================
// SHARED MOCK SETUP
// ========================

// Mock hooks
vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

// Mock components
vi.mock('~/components/UserEditModal', () => ({
  default: ({ me, open, onOpenChange }: {
    me: User;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="user-edit-modal" data-open={open} data-user-name={me?.name}>
      User Edit Modal for {me?.name}
      <button data-testid="close-modal" onClick={() => onOpenChange && onOpenChange(false)}>
        Close Modal
      </button>
    </div>
  ),
}));

// Mock icons
vi.mock('~/components/ui/icons', () => ({
  Icons: {
    pen: () => <svg data-testid="pen-icon" />,
  },
}));

import { useUser } from '~/hooks/queries/userQueries';
import DashboardBanner from '~/components/dashboardBanner';

// Create typed mock
const mockUseUser = vi.mocked(useUser);

// ========================
// ASSERTION HELPERS
// ========================

/**
 * Common assertion helpers
 */
const defaultUsernameAssertions = {
  expectDefaultUsernameWarning: () => {
    expect(screen.getByText(/This is a default username/)).toBeInTheDocument();
    expect(screen.getByText(/If it's not your real name, you can change it below/)).toBeInTheDocument();
  },
  
  expectNoDefaultUsernameWarning: () => {
    expect(screen.queryByText(/This is a default username/)).not.toBeInTheDocument();
    expect(screen.queryByText(/If it's not your real name, you can change it below/)).not.toBeInTheDocument();
  },
  
  expectWelcomeTitle: (name: string) => {
    expect(screen.getByRole('heading')).toHaveTextContent(`👋 Hey, ${name}`);
  },
  
  expectDescription: (description: string) => {
    expect(screen.getByText(description)).toBeInTheDocument();
  },

  expectWarningSpanStyles: () => {
    const warningSpan = screen.getByText(/This is a default username/);
    expect(warningSpan.tagName).toBe('SPAN');
    expect(warningSpan).toHaveClass(
      'text-xs', 
      'max-w-72', 
      'block', 
      'text-neutral-01', 
      'mt-1', 
      'break-normal',
      'sm:max-w-full'
    );
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner default username handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show default username warning when username is "adam"', () => {
    const adamUser = createMockUser({ name: 'adam' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome to your dashboard"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('adam');
    defaultUsernameAssertions.expectDefaultUsernameWarning();
    defaultUsernameAssertions.expectDescription('Welcome to your dashboard');
    defaultUsernameAssertions.expectWarningSpanStyles();
  });

  it('should show default username warning when username is "ADAM" (case insensitive)', () => {
    const adamUser = createMockUser({ name: 'ADAM' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('ADAM');
    defaultUsernameAssertions.expectDefaultUsernameWarning();
  });

  it('should show default username warning when username is "Adam" (mixed case)', () => {
    const adamUser = createMockUser({ name: 'Adam' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('Adam');
    defaultUsernameAssertions.expectDefaultUsernameWarning();
  });

  it('should not show warning for non-default usernames', () => {
    const regularUser = createMockUser({ name: 'John' });
    const mockUseUserResult = createMockUseUserResult({
      data: regularUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome John"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('John');
    defaultUsernameAssertions.expectNoDefaultUsernameWarning();
    defaultUsernameAssertions.expectDescription('Welcome John');
  });

  it('should not show warning for usernames containing "adam" but not exactly "adam"', () => {
    const adamContainingUser = createMockUser({ name: 'adamsmith' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamContainingUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('adamsmith');
    defaultUsernameAssertions.expectNoDefaultUsernameWarning();
  });

  it('should not show warning for names with "adam" as substring', () => {
    const substringUser = createMockUser({ name: 'madame' });
    const mockUseUserResult = createMockUseUserResult({
      data: substringUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('madame');
    defaultUsernameAssertions.expectNoDefaultUsernameWarning();
  });

  it('should handle empty name gracefully (no warning)', () => {
    const emptyNameUser = createMockUser({ name: '' });
    const mockUseUserResult = createMockUseUserResult({
      data: emptyNameUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    // Empty name results in "👋 Hey, " (with trailing comma and space)
    expect(screen.getByRole('heading')).toHaveTextContent('👋 Hey,');
    defaultUsernameAssertions.expectNoDefaultUsernameWarning();
  });

  it('should handle undefined name gracefully (no warning)', () => {
    const undefinedNameUser = createMockUser();
    // Remove name property to make it undefined
    delete (undefinedNameUser as Partial<User>).name;
    
    const mockUseUserResult = createMockUseUserResult({
      data: undefinedNameUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={false}
      />
    );

    defaultUsernameAssertions.expectWelcomeTitle('undefined');
    defaultUsernameAssertions.expectNoDefaultUsernameWarning();
  });

  it('should work with danger and warning variants for default username', () => {
    const adamUser = createMockUser({ name: 'adam' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test with danger variant - shows default warning for adam username
    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="danger"
        description="Danger message"
        showEditLink={false}
      />
    );

    expect(screen.getByRole('heading')).toHaveTextContent('⛔ We are in danger');
    // Default username warning shows for all variants when username is adam
    defaultUsernameAssertions.expectDefaultUsernameWarning();

    // Test with warning variant - also shows default warning for adam username
    rerender(
      <DashboardBanner 
        variant="warning"
        description="Warning message"
        showEditLink={false}
      />
    );

    expect(screen.getByRole('heading')).toHaveTextContent('⚠️ Wait a minute');
    // Default username warning shows for all variants when username is adam
    defaultUsernameAssertions.expectDefaultUsernameWarning();
  });

  it('should show warning within correct HTML structure', () => {
    const adamUser = createMockUser({ name: 'adam' });
    const mockUseUserResult = createMockUseUserResult({
      data: adamUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test"
        showEditLink={false}
      />
    );

    // Warning should be inside the heading element
    const heading = screen.getByRole('heading');
    const warningSpan = screen.getByText(/This is a default username/);
    
    expect(heading).toContainElement(warningSpan);
    
    // Warning should be a direct child span of heading
    expect(warningSpan.parentElement).toBe(heading);
  });
});