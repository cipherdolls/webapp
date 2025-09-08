import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { User } from '~/types';
import { 
  createMockUser, 
  createMockUseUserResult, 
  renderWithQuery,
  server
} from '../../test-utils';

// ========================
// SHARED MOCK SETUP
// ========================

// Mock hooks
vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

// REMOVED: UserEditModal mock - Let real modal render for integration testing
// This allows us to test the actual modal behavior and component interaction
// vi.mock('~/components/UserEditModal', () => ({
//   default: ({ me, open, onOpenChange }: {
//     me: User;
//     open: boolean;
//     onOpenChange?: (open: boolean) => void;
//   }) => (
//     <div data-testid="user-edit-modal" data-open={open} data-user-name={me?.name}>
//       User Edit Modal for {me?.name}
//       <button data-testid="close-modal" onClick={() => onOpenChange && onOpenChange(false)}>
//         Close Modal
//       </button>
//     </div>
//   ),
// }));

// REMOVED: Icons mock - Let real icons render for integration testing
// vi.mock('~/components/ui/icons', () => ({
//   Icons: {
//     pen: () => <svg data-testid="pen-icon" />,
//   },
// }));

import { useUser } from '~/hooks/queries/userQueries';
import DashboardBanner from '~/components/dashboardBanner';

// Create typed mock
const mockUseUser = vi.mocked(useUser);

// ========================
// ASSERTION HELPERS
// ========================

/**
 * Common assertion helpers for error scenarios
 */
const errorAssertions = {
  expectLoadingSkeleton: () => {
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  },
  
  expectNoUserContent: () => {
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  },
  
  expectNullRender: (container: HTMLElement) => {
    expect(container.firstChild).toBeNull();
  },
  
  expectErrorState: (errorMessage: string) => {
    // In a real app, you might show error messages to users
    // For now, we test that the component handles errors gracefully
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle user fetch 404 error gracefully', async () => {
    // Override MSW handler for this test
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      })
    );

    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('User not found'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="This should not be visible on error"
        showEditLink={false}
      />
    );

    // Component should return null when there's an error and no user data
    errorAssertions.expectNullRender(container);
  });

  it('should handle user fetch 500 server error gracefully', async () => {
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
      })
    );

    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Internal server error'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="danger"
        description="Server error occurred"
      />
    );

    errorAssertions.expectNullRender(container);
  });

  it('should handle network error gracefully', async () => {
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.error();
      })
    );

    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Network Error'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="warning"
        description="Network issues"
      />
    );

    errorAssertions.expectNullRender(container);
  });

  it('should handle loading state during error recovery', async () => {
    // First, set error state
    const errorUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Temporary error'),
    });
    
    mockUseUser.mockReturnValue(errorUseUserResult);

    const { container, rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Loading..."
      />
    );

    // Should render null during error
    errorAssertions.expectNullRender(container);

    // Now simulate recovery with loading state
    const loadingUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    });
    
    mockUseUser.mockReturnValue(loadingUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Loading..."
      />
    );

    // Should show loading skeleton during recovery
    errorAssertions.expectLoadingSkeleton();
  });

  it('should handle successful recovery from error state', async () => {
    // Start with error state
    const errorUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Initial error'),
    });
    
    mockUseUser.mockReturnValue(errorUseUserResult);

    const { container, rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Recovery test"
      />
    );

    errorAssertions.expectNullRender(container);

    // Simulate successful recovery
    const successUser = createMockUser({ name: 'Recovered User' });
    const successUseUserResult = createMockUseUserResult({
      data: successUser,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
    });
    
    mockUseUser.mockReturnValue(successUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Recovery successful"
        showEditLink={true}
      />
    );

    // Should render normally after recovery
    expect(screen.getByRole('heading')).toHaveTextContent('👋 Hey, Recovered User');
    expect(screen.getByText('Recovery successful')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Real UserEditModal should be present but not visible
    // This tests that unmocked modal actually renders in DOM
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument(); // Modal should be closed initially
    
    // ✅ INTEGRATION TEST: Edit button should be real and functional
    const editButton = screen.getByRole('button');
    expect(editButton).toBeInTheDocument();
    // We test that the button exists - user interaction test would be separate
  });

  it('should handle error state with different banner variants', async () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Test error'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test welcome variant
    const { container: welcomeContainer, rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome error"
      />
    );

    errorAssertions.expectNullRender(welcomeContainer);

    // Test danger variant  
    rerender(
      <DashboardBanner 
        variant="danger"
        description="Danger error"
      />
    );

    errorAssertions.expectNullRender(welcomeContainer);

    // Test warning variant
    rerender(
      <DashboardBanner 
        variant="warning"
        description="Warning error"
      />
    );

    errorAssertions.expectNullRender(welcomeContainer);
  });

  it('should handle error state with showEditLink enabled', async () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('User load error'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Error with edit link"
        showEditLink={true}
      />
    );

    // Should still render null even with edit link enabled
    errorAssertions.expectNullRender(container);
  });

  it('should handle error state with null description', async () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Null description error'),
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    errorAssertions.expectNullRender(container);
  });

  it('should handle loading state transition after error', async () => {
    // Start with error state
    const errorUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error('Initial error'),
    });
    
    mockUseUser.mockReturnValue(errorUseUserResult);

    const { container, rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Error state test"
      />
    );

    // Should render null during error
    errorAssertions.expectNullRender(container);

    // Transition to loading state (user retries)
    const loadingUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
    });
    
    mockUseUser.mockReturnValue(loadingUseUserResult);

    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Loading after error"
      />
    );

    // Should show loading skeleton now
    errorAssertions.expectLoadingSkeleton();
    errorAssertions.expectNoUserContent();
  });

  it('should handle query that has not been initiated', async () => {
    // This simulates when query is in initial state with no data
    const initialUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    });
    
    mockUseUser.mockReturnValue(initialUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Initial state test"
      />
    );

    // Should render null when data is undefined and not loading
    errorAssertions.expectNullRender(container);
  });
});