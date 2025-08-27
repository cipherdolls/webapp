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
const bannerAssertions = {
  expectBannerTitle: (title: string) => {
    expect(screen.getByRole('heading')).toHaveTextContent(title);
  },
  
  expectDescription: (description: string) => {
    expect(screen.getByText(description)).toBeInTheDocument();
  },
  
  expectUserEditModalHidden: () => {
    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-open', 'false');
  },
  
  expectNoDefaultUsernameWarning: () => {
    expect(screen.queryByText(/This is a default username/)).not.toBeInTheDocument();
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner configurations', () => {
  const mockUser = createMockUser({ name: 'John Doe' });

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);
  });

  it('should display welcome variant correctly', () => {
    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome to your dashboard"
        showEditLink={false}
      />
    );

    bannerAssertions.expectBannerTitle('👋 Hey, John Doe');
    bannerAssertions.expectDescription('Welcome to your dashboard');
    bannerAssertions.expectUserEditModalHidden();
    bannerAssertions.expectNoDefaultUsernameWarning();
  });

  it('should display danger variant correctly', () => {
    renderWithQuery(
      <DashboardBanner 
        variant="danger"
        description="Something went wrong"
        showEditLink={false}
      />
    );

    bannerAssertions.expectBannerTitle('⛔ We are in danger');
    bannerAssertions.expectDescription('Something went wrong');
    bannerAssertions.expectUserEditModalHidden();
    bannerAssertions.expectNoDefaultUsernameWarning();
  });

  it('should display warning variant correctly', () => {
    renderWithQuery(
      <DashboardBanner 
        variant="warning"
        description="Please wait"
        showEditLink={false}
      />
    );

    bannerAssertions.expectBannerTitle('⚠️ Wait a minute');
    bannerAssertions.expectDescription('Please wait');
    bannerAssertions.expectUserEditModalHidden();
    bannerAssertions.expectNoDefaultUsernameWarning();
  });

  it('should handle different user names in welcome variant', () => {
    const customUser = createMockUser({ name: 'Alice Smith' });
    const mockUseUserResult = createMockUseUserResult({
      data: customUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Hello Alice"
        showEditLink={false}
      />
    );

    bannerAssertions.expectBannerTitle('👋 Hey, Alice Smith');
    bannerAssertions.expectDescription('Hello Alice');
  });

  it('should handle empty username gracefully', () => {
    const userWithEmptyName = createMockUser({ name: '' });
    const mockUseUserResult = createMockUseUserResult({
      data: userWithEmptyName,
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

    bannerAssertions.expectBannerTitle('👋 Hey,');
    bannerAssertions.expectDescription('Welcome');
  });

  it('should handle undefined username gracefully', () => {
    const userWithUndefinedName = createMockUser();
    // Remove name property to make it undefined
    delete (userWithUndefinedName as Partial<User>).name;
    
    const mockUseUserResult = createMockUseUserResult({
      data: userWithUndefinedName,
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

    bannerAssertions.expectBannerTitle('👋 Hey, undefined');
    bannerAssertions.expectDescription('Welcome');
  });

  it('should render correct HTML structure for banner', () => {
    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test description"
        showEditLink={false}
      />
    );

    // Check main container structure (heading is inside a div with 'relative max-w-max')
    const headingContainer = screen.getByRole('heading').closest('div');
    expect(headingContainer).toHaveClass('relative', 'max-w-max');
    
    // The main container is the parent div with flex classes
    const mainContainer = headingContainer?.parentElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col');

    // Check heading styles
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('sm:text-heading-h1', 'text-heading-h2', 'text-base-black', 'break-all');

    // Check description paragraph
    const description = screen.getByText('Test description');
    expect(description.tagName).toBe('P');
    expect(description).toHaveClass('sm:text-neutral-01', 'text-body-lg', 'text-base-black');
  });

  it('should pass correct props to UserEditModal', () => {
    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test"
        showEditLink={true}
      />
    );

    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-user-name', 'John Doe');
    expect(modal).toHaveAttribute('data-open', 'false');
    expect(modal).toHaveTextContent('User Edit Modal for John Doe');
  });
});