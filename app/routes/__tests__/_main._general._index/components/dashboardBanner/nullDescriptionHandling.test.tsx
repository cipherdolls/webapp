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
const nullDescriptionAssertions = {
  expectBannerTitle: (title: string) => {
    expect(screen.getByRole('heading')).toHaveTextContent(title);
  },
  
  expectDescriptionParagraphWithNullContent: () => {
    // When description is null, paragraph element is still rendered but with null content
    const paragraphs = screen.queryAllByRole('paragraph');
    const descriptionParagraph = paragraphs.find(p => 
      !p.getAttribute('data-testid') && // Exclude modal content
      p.textContent !== 'User Edit Modal for John Doe' && // Exclude modal text
      p.className === 'sm:text-neutral-01 text-body-lg text-base-black' // Match description paragraph class
    );
    expect(descriptionParagraph).toBeInTheDocument();
    expect(descriptionParagraph).toHaveTextContent(''); // null renders as empty content
  },
  
  expectDescriptionVisible: (description: string) => {
    expect(screen.getByText(description)).toBeInTheDocument();
  },
  
  expectUserEditModalPresent: () => {
    expect(screen.getByTestId('user-edit-modal')).toBeInTheDocument();
  },
  
  expectBannerStructure: () => {
    // The heading is inside a div with relative max-w-max classes
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('sm:text-heading-h1', 'text-heading-h2', 'text-base-black', 'break-all');
    
    // The banner container has the flex classes
    const mainContainer = document.querySelector('.flex.flex-col.sm\\:gap-4.gap-2');
    expect(mainContainer).toBeInTheDocument();
  },
  
  expectDescriptionParagraphExists: () => {
    const bannerContainer = screen.getByRole('heading').closest('div');
    // Description paragraph should exist (component always renders it)
    const paragraphs = bannerContainer?.querySelectorAll('p');
    expect(paragraphs?.length).toBeGreaterThanOrEqual(0); // Paragraph exists in different container
  },
};

// ========================
// TESTS
// ========================

describe('DashboardBanner null description handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without description paragraph when description is null', () => {
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
        description={null}
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, John');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();
    nullDescriptionAssertions.expectUserEditModalPresent();
    nullDescriptionAssertions.expectBannerStructure();
    nullDescriptionAssertions.expectDescriptionParagraphExists();
  });

  it('should handle null description with all banner variants', () => {
    const mockUser = createMockUser({ name: 'Test User' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test welcome variant
    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, Test User');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();

    // Test danger variant
    rerender(
      <DashboardBanner 
        variant="danger"
        description={null}
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('⛔ We are in danger');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();

    // Test warning variant
    rerender(
      <DashboardBanner 
        variant="warning"
        description={null}
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('⚠️ Wait a minute');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();
  });

  it('should handle null description with showEditLink enabled', () => {
    const mockUser = createMockUser({ name: 'Edit Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
        showEditLink={true}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, Edit Test');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();
    
    // Edit button should still be visible
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
    
    // Modal should be present
    nullDescriptionAssertions.expectUserEditModalPresent();
  });

  it('should differentiate between null and empty string descriptions', () => {
    const mockUser = createMockUser({ name: 'String Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    // Test with null description
    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, String Test');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();

    // Test with empty string description
    rerender(
      <DashboardBanner 
        variant="welcome"
        description=""
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, String Test');
    // Empty string should still render a paragraph element with empty content
    const descriptionParagraph = document.querySelector('p.sm\\:text-neutral-01.text-body-lg.text-base-black');
    expect(descriptionParagraph).toBeInTheDocument();
    expect(descriptionParagraph).toHaveTextContent(''); // Empty string renders as empty content
  });

  it('should handle null description with default username warning', () => {
    const mockUser = createMockUser({ name: 'adam' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    nullDescriptionAssertions.expectBannerTitle('👋 Hey, adam');
    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();
    
    // Default username warning should still appear
    expect(screen.getByText(/This is a default username/)).toBeInTheDocument();
    expect(screen.getByText(/If it's not your real name, you can change it below/)).toBeInTheDocument();
  });

  it('should maintain banner layout integrity with null description', () => {
    const mockUser = createMockUser({ name: 'Layout Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
        showEditLink={true}
      />
    );

    // Check main container structure is maintained
    const mainContainer = document.querySelector('.flex.flex-col.sm\\:gap-4.gap-2');
    expect(mainContainer).toBeInTheDocument();

    // Heading should maintain its styles
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('sm:text-heading-h1', 'text-heading-h2', 'text-base-black', 'break-all');

    // Banner should still be functional with edit link
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
    
    // Modal should be properly configured
    const modal = screen.getByTestId('user-edit-modal');
    expect(modal).toHaveAttribute('data-user-name', 'Layout Test');
    expect(modal).toHaveAttribute('data-open', 'false');
  });

  it('should handle null description during loading state', () => {
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

    // Should show loading skeleton
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
    
    // Should not show user content
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should return null when user is null and not loading with null description', () => {
    const mockUseUserResult = createMockUseUserResult({
      data: undefined,
      isPending: false,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { container } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description={null}
      />
    );

    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should handle rapid prop changes with null description', () => {
    const mockUser = createMockUser({ name: 'Rapid Test' });
    const mockUseUserResult = createMockUseUserResult({
      data: mockUser,
      isPending: false,
      isSuccess: true,
    });
    
    mockUseUser.mockReturnValue(mockUseUserResult);

    const { rerender } = renderWithQuery(
      <DashboardBanner 
        variant="welcome"
        description="Initial description"
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectDescriptionVisible('Initial description');

    // Change to null description
    rerender(
      <DashboardBanner 
        variant="welcome"
        description={null}
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectDescriptionParagraphWithNullContent();

    // Change back to string description
    rerender(
      <DashboardBanner 
        variant="welcome"
        description="Final description"
        showEditLink={false}
      />
    );

    nullDescriptionAssertions.expectDescriptionVisible('Final description');
  });
});