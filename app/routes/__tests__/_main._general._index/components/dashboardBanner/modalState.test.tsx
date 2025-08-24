import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
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
const modalAssertions = {
  expectModalClosed: () => {
    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-open', 'false');
  },
  
  expectModalOpen: () => {
    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-open', 'true');
  },
  
  expectEditButtonVisible: () => {
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
  },
  
  expectEditButtonHidden: () => {
    expect(screen.queryByTestId('pen-icon')).not.toBeInTheDocument();
  },
  
  expectModalForUser: (userName: string) => {
    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-user-name', userName);
    expect(modal).toHaveTextContent(`User Edit Modal for ${userName}`);
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner modal state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open UserEditModal when edit button is clicked', () => {
    const mockUser = createMockUser({ name: 'John' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={true}
      />
    );

    // Initially modal should be closed
    modalAssertions.expectModalClosed();
    modalAssertions.expectEditButtonVisible();
    modalAssertions.expectModalForUser('John');

    // Click edit button
    const editButton = screen.getByTestId('pen-icon').closest('button');
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton!);

    // Modal should now be open
    modalAssertions.expectModalOpen();
  });

  it('should not show edit button when showEditLink is false', () => {
    const mockUser = createMockUser({ name: 'Jane' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
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

    modalAssertions.expectEditButtonHidden();
    modalAssertions.expectModalClosed();
    modalAssertions.expectModalForUser('Jane');
  });

  it('should handle modal close from UserEditModal', () => {
    const mockUser = createMockUser({ name: 'Alice' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome"
        showEditLink={true}
      />
    );

    // Open modal
    const editButton = screen.getByTestId('pen-icon').closest('button');
    fireEvent.click(editButton!);
    modalAssertions.expectModalOpen();

    // Close modal from within modal component
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);
    modalAssertions.expectModalClosed();
  });

  it('should maintain modal state across re-renders', () => {
    const mockUser = createMockUser({ name: 'Bob' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Original description"
        showEditLink={true}
      />
    );

    // Open modal
    const editButton = screen.getByTestId('pen-icon').closest('button');
    fireEvent.click(editButton!);
    modalAssertions.expectModalOpen();

    // Re-render with different description
    rerender(
      <DashboardBanner 
        variant="welcome"
        description="New description"
        showEditLink={true}
      />
    );

    // Modal should still be open
    modalAssertions.expectModalOpen();
    expect(screen.getByText('New description')).toBeInTheDocument();
  });

  it('should pass correct user data to UserEditModal', () => {
    const mockUser = createMockUser({ 
      id: '123',
      name: 'Test User',
      signerAddress: '0xABC123',
    });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test"
        showEditLink={true}
      />
    );

    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-user-name', 'Test User');
    expect(modal).toHaveTextContent('User Edit Modal for Test User');
  });

  it('should position edit button correctly with proper styles', () => {
    const mockUser = createMockUser({ name: 'Style Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test"
        showEditLink={true}
      />
    );

    const editButton = screen.getByTestId('pen-icon').closest('button');
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass(
      'absolute',
      '-top-2',
      '-right-8',
      'hover:opacity-50',
      'transition-opacity'
    );
  });

  it('should work with different banner variants', () => {
    const mockUser = createMockUser({ name: 'Variant Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test with welcome variant
    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Welcome Test"
        showEditLink={true}
      />
    );

    modalAssertions.expectEditButtonVisible();
    
    // Test modal functionality
    const editButton = screen.getByTestId('pen-icon').closest('button');
    fireEvent.click(editButton!);
    modalAssertions.expectModalOpen();

    // Close modal
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);

    // Test with danger variant
    rerender(
      <DashboardBanner 
        variant="danger"
        description="Danger Test"
        showEditLink={true}
      />
    );

    modalAssertions.expectEditButtonVisible();
    modalAssertions.expectModalClosed();

    // Test with warning variant  
    rerender(
      <DashboardBanner 
        variant="warning"
        description="Warning Test"
        showEditLink={true}
      />
    );

    modalAssertions.expectEditButtonVisible();
    modalAssertions.expectModalClosed();
  });

  it('should handle rapid button clicks gracefully', () => {
    const mockUser = createMockUser({ name: 'Click Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Test"
        showEditLink={true}
      />
    );

    const editButton = screen.getByTestId('pen-icon').closest('button');
    
    // Multiple rapid clicks
    fireEvent.click(editButton!);
    fireEvent.click(editButton!);
    fireEvent.click(editButton!);

    // Modal should be open (last state)
    modalAssertions.expectModalOpen();
  });
});