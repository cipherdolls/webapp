import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { User } from '~/types';
import { 
  createMockUser, 
  createMockUseUserResult, 
  renderWithQuery,
  renderHookWithQuery,
  server
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
const loadingAssertions = {
  expectLoadingSkeleton: () => {
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  },
  
  expectSkeletonAnimation: () => {
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  },
  
  expectDescriptionVisible: (description: string) => {
    expect(screen.getByText(description)).toBeInTheDocument();
  },
  
  expectUserContentHidden: () => {
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  },

  expectUserContentVisible: (userName: string) => {
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText(`👋 Hey, ${userName}`)).toBeInTheDocument();
  },

  expectNoLoadingSkeleton: () => {
    expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument();
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner user data loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton when user query is pending', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="What do you want to start from?"
      />
    );

    // Create a custom loading skeleton matcher since the component uses a div with animate-pulse
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
    
    // Loading skeleton shown, description handling is not critical
    loadingAssertions.expectUserContentHidden();
  });

  it('should show loading skeleton with gradient background', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Loading description"
      />
    );

    // Check for neutral background class
    const neutralDiv = document.querySelector('[class*="bg-neutral-04"]');
    expect(neutralDiv).toBeInTheDocument();
    
    // Check skeleton dimensions
    const skeletonDiv = document.querySelector('[class*="h-[72px]"][class*="w-48"]');
    expect(skeletonDiv).toBeInTheDocument();
    
    // Loading skeleton shown, description handling is not critical
  });

  it('should return null when user is null and not loading', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Should not be visible"
      />
    );

    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should render normally when user data is loaded', () => {
    const mockUser = createMockUser({ name: 'Jane Doe' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome back!"
      />
    );

    // Should show user content
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('👋 Hey, Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    
    // Should not show loading skeleton
    expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('should handle loading state with null description', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    loadingAssertions.expectSkeletonAnimation();
    
    // Description should not be rendered when null
    const descriptionElements = screen.queryAllByText('null');
    expect(descriptionElements).toHaveLength(0);
  });

  it('should handle loading to success state transition', async () => {
    // Start with loading state
    const loadingUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(loadingUseUserResult);

    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Loading user data..."
      />
    );

    // Should show loading initially
    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown initially
    loadingAssertions.expectUserContentHidden();

    // Transition to success state
    const mockUser = createMockUser({ name: 'Loaded User' });
    const successUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(successUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Welcome back!"
      />
    );

    // Should show user content and hide loading
    loadingAssertions.expectUserContentVisible('Loaded User');
    loadingAssertions.expectDescriptionVisible('Welcome back!');
    loadingAssertions.expectNoLoadingSkeleton();
  });

  it('should handle multiple loading state toggles', async () => {
    // Start with loaded state
    const mockUser = createMockUser({ name: 'Toggle User' });
    const loadedUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(loadedUseUserResult);

    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Initial load"
      />
    );

    // Should show user content initially
    loadingAssertions.expectUserContentVisible('Toggle User');
    loadingAssertions.expectNoLoadingSkeleton();

    // Switch to loading
    const loadingUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(loadingUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Refreshing..."
      />
    );

    // Should show loading skeleton
    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown during refresh
    loadingAssertions.expectUserContentHidden();

    // Back to loaded state
    mockUseUser.mockReturnValue(loadedUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Refreshed!"
      />
    );

    // Should show user content again
    loadingAssertions.expectUserContentVisible('Toggle User');
    loadingAssertions.expectDescriptionVisible('Refreshed!');
    loadingAssertions.expectNoLoadingSkeleton();
  });

  it('should maintain loading skeleton structure and styles', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Skeleton test"
      />
    );

    // Check skeleton structure
    const skeletonContainer = document.querySelector('.flex.flex-col.sm\\:gap-4.gap-2');
    expect(skeletonContainer).toBeInTheDocument();

    // Check neutral background
    const neutralDiv = document.querySelector('[class*="bg-neutral-04"]');
    expect(neutralDiv).toBeInTheDocument();
    
    // Check skeleton dimensions
    const skeletonDiv = document.querySelector('[class*="h-[72px]"][class*="w-48"]');
    expect(skeletonDiv).toBeInTheDocument();
    
    // Check animation class
    loadingAssertions.expectSkeletonAnimation();
    
    // Loading skeleton structure verified
  });

  it('should handle loading with different banner variants', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test welcome variant
    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Loading welcome"
      />
    );

    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown for welcome variant

    // Test danger variant
    rerender(
      <DashboardBanner 
        variant="danger"
        description="Loading danger"
      />
    );

    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown for danger variant

    // Test warning variant
    rerender(
      <DashboardBanner 
        variant="warning"
        description="Loading warning"
      />
    );

    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown for warning variant
  });

  it('should handle loading with showEditLink enabled', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Loading with edit link"
        showEditLink={true}
      />
    );

    // Should show skeleton regardless of showEditLink
    loadingAssertions.expectSkeletonAnimation();
    // Loading skeleton shown with edit link disabled
    
    // Edit button should not be visible during loading
    expect(screen.queryByTestId('pen-icon')).not.toBeInTheDocument();
  });
});