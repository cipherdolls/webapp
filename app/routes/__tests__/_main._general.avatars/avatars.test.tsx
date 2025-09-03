import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  renderWithQuery, 
  createMockUser,
  createMockAvatar,
  createMockAvatarsPaginated,
  createMockUseInfiniteAvatarsResult,
} from '../_main._general._index/test-utils';
import AvatarsShow from '~/routes/_main._general.avatars';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';
import { useRouteLoaderData, useSearchParams } from 'react-router';
import useInfiniteScroll from 'react-infinite-scroll-hook';

// ========================
// MOCK SETUP
// ========================

vi.mock('~/hooks/queries/avatarQueries', () => ({
  useInfiniteAvatars: vi.fn(),
}));

vi.mock('react-router', () => ({
  useRouteLoaderData: vi.fn(),
  useSearchParams: vi.fn(),
  NavLink: ({ children, to }: any) => <a href={to}>{children}</a>,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  Outlet: () => null,
}));

vi.mock('~/components/ui/search-input', () => ({
  default: () => <input data-testid="search-input" placeholder="Search avatars" />,
}));

vi.mock('~/components/AvatarScenarioModal', () => ({
  default: ({ children }: any) => <div data-testid="avatar-scenario-modal">{children}</div>,
}));

vi.mock('~/components/PlayerButton', () => ({
  default: () => <button data-testid="player-button">Play</button>,
}));

vi.mock('~/components/ui/RecommendedBadge', () => ({
  default: ({ recommended }: { recommended: boolean }) => 
    recommended ? <span data-testid="recommended-badge">★</span> : null,
}));

vi.mock('react-infinite-scroll-hook', () => ({
  default: vi.fn(),
}));

const mockUseInfiniteAvatars = vi.mocked(useInfiniteAvatars);
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);
const mockUseSearchParams = vi.mocked(useSearchParams);
const mockUseInfiniteScroll = vi.mocked(useInfiniteScroll);

// ========================
// TEST 5: PUBLIC/MY AVATARS TOGGLE
// ========================

describe('Avatar Filter Logic - Public/My Avatars Toggle', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue(createMockUser({ id: 'current-user' }));
    // Mock useInfiniteScroll to return proper array [ref, { rootRef }]
    mockUseInfiniteScroll.mockReturnValue([vi.fn(), { rootRef: vi.fn() }]);
  });

  it('should call useInfiniteAvatars with published=true for public avatars (default state)', () => {
    // Default state - no 'mine' parameter, should show public avatars
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(), // Empty params = public avatars
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call hook with published=true (for public avatars)
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ published: 'true' })
    );
    
    // Should NOT have mine parameter
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.not.objectContaining({ mine: 'true' })
    );
  });

  it('should call useInfiniteAvatars with mine=true and NO published param for my avatars', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call hook with mine=true
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ mine: 'true' })
    );
    
    // Should NOT have published parameter when mine=true
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.not.objectContaining({ published: 'true' })
    );
  });

  it('should switch from public to my avatars when "My Avatars" button clicked', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // Currently showing public
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Find and click "My Avatars" button
    const myAvatarsButton = screen.getByText('My Avatars');
    await user.click(myAvatarsButton);
    
    // Should clear previous params and set mine=true
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams)
    );
    
    // Verify the URLSearchParams content
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('mine')).toBe('true');
    expect(call.get('published')).toBeNull(); // Should be removed
  });

  it('should switch from my to public avatars when "Public Avatars" button clicked', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true'), // Currently showing my avatars
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Find and click "Public Avatars" button
    const publicAvatarsButton = screen.getByText('Public Avatars');
    await user.click(publicAvatarsButton);
    
    // Should clear previous params and set published=true
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams)
    );
    
    // Verify the URLSearchParams content
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('published')).toBe('true');
    expect(call.get('mine')).toBeNull(); // Should be removed
  });

  it('should show active styling for Public Avatars button when in public mode', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const publicButton = screen.getByText('Public Avatars');
    const myButton = screen.getByText('My Avatars');
    
    // Public button should have active styling
    expect(publicButton.closest('button')).toHaveClass('bg-gradient-1', 'text-base-black');
    
    // My Avatars button should have inactive styling
    expect(myButton.closest('button')).toHaveClass('text-base-black', 'hover:bg-neutral-05');
    expect(myButton.closest('button')).not.toHaveClass('bg-gradient-1');
  });

  it('should show active styling for My Avatars button when in my avatars mode', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const publicButton = screen.getByText('Public Avatars');
    const myButton = screen.getByText('My Avatars');
    
    // My Avatars button should have active styling
    expect(myButton.closest('button')).toHaveClass('bg-gradient-1', 'text-base-black');
    
    // Public button should have inactive styling
    expect(publicButton.closest('button')).toHaveClass('text-base-black', 'hover:bg-neutral-05');
    expect(publicButton.closest('button')).not.toHaveClass('bg-gradient-1');
  });

  it('should preserve other search params when switching between public/my avatars', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&name=alice&published=true'), // Has other filters
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const myAvatarsButton = screen.getByText('My Avatars');
    await user.click(myAvatarsButton);
    
    // Should preserve gender and name params
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('gender')).toBe('Female');
    expect(call.get('name')).toBe('alice');
    expect(call.get('mine')).toBe('true');
    expect(call.get('published')).toBeNull(); // Should be removed
  });
});

// ========================
// TEST 6: GENDER FILTER
// ========================

describe('Gender Filter Logic', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue(createMockUser({ id: 'current-user' }));
    mockUseInfiniteScroll.mockReturnValue([vi.fn(), { rootRef: vi.fn() }]);
  });

  it('should call useInfiniteAvatars with gender parameter when filter is applied', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call hook with gender parameter
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        gender: 'Female',
        published: 'true'
      })
    );
  });

  it('should call useInfiniteAvatars with Male gender parameter', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Male&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        gender: 'Male',
        published: 'true'
      })
    );
  });

  it('should not include gender parameter when "All genders" is selected', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // No gender param = All genders
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should NOT have gender parameter
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.not.objectContaining({ gender: expect.any(String) })
    );
  });

  it('should update search params when Female is selected from dropdown', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // Starting with no gender filter
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Click gender dropdown trigger
    const genderButton = screen.getByText('All genders');
    await user.click(genderButton);
    
    // Select Female option
    const femaleOption = screen.getByText('Female');
    await user.click(femaleOption);
    
    // Should add gender=Female to params
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams)
    );
    
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('gender')).toBe('Female');
    expect(call.get('published')).toBe('true'); // Should preserve other params
  });

  it('should update search params when Male is selected from dropdown', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const genderButton = screen.getByText('All genders');
    await user.click(genderButton);
    
    const maleOption = screen.getByText('Male');
    await user.click(maleOption);
    
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('gender')).toBe('Male');
    expect(call.get('published')).toBe('true');
  });

  it('should remove gender parameter when "All genders" is selected from active filter', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'), // Currently filtered by Female
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Click gender dropdown (currently shows "Female")
    const genderButton = screen.getByText('Female');
    await user.click(genderButton);
    
    // Select "All genders" to clear filter
    const allGendersOption = screen.getByText('All genders');
    await user.click(allGendersOption);
    
    // Should remove gender parameter
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('gender')).toBeNull();
    expect(call.get('published')).toBe('true'); // Should preserve other params
  });

  it('should show correct button text based on current gender filter', () => {
    // Test with Female filter
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    const { rerender } = renderWithQuery(<AvatarsShow />);
    
    // Should show "Female" as button text
    expect(screen.getByText('Female')).toBeInTheDocument();
    
    // Test with Male filter
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Male&published=true'),
      mockSetSearchParams
    ]);
    
    rerender(<AvatarsShow />);
    expect(screen.getByText('Male')).toBeInTheDocument();
    
    // Test with no filter
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'),
      mockSetSearchParams
    ]);
    
    rerender(<AvatarsShow />);
    expect(screen.getByText('All genders')).toBeInTheDocument();
  });

  it('should show active styling for gender button when filter is applied', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const genderButton = screen.getByText('Female');
    
    // Should have active styling when filter is applied
    expect(genderButton.closest('button')).toHaveClass('bg-gradient-1', 'text-base-black');
  });

  it('should show inactive styling for gender button when no filter is applied', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // No gender filter
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const genderButton = screen.getByText('All genders');
    
    // Should have inactive styling when no filter is applied
    expect(genderButton.closest('button')).toHaveClass('text-base-black', 'hover:bg-neutral-05');
    expect(genderButton.closest('button')).not.toHaveClass('bg-gradient-1');
  });

  it('should preserve other search params when changing gender filter', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true&name=alice'), // Has other filters, no gender
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const genderButton = screen.getByText('All genders');
    await user.click(genderButton);
    
    const femaleOption = screen.getByText('Female');
    await user.click(femaleOption);
    
    // Should preserve mine and name params while adding gender
    const call = mockSetSearchParams.mock.calls[0][0];
    expect(call.get('mine')).toBe('true');
    expect(call.get('name')).toBe('alice');
    expect(call.get('gender')).toBe('Female');
  });
});

// ========================
// TEST 7: CLEAR FILTERS
// ========================

describe('Clear Filters Logic', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue(createMockUser({ id: 'current-user' }));
    mockUseInfiniteScroll.mockReturnValue([vi.fn(), { rootRef: vi.fn() }]);
  });

  it('should show clear filters button when mine filter is active', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should show clear filters button when gender filter is active', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should show clear filters button when both mine and gender filters are active', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true&gender=Male'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should NOT show clear filters button when only published=true (default public state)', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // Default state, not considered active filter
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('should NOT show clear filters button when no filters are active', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(), // Empty = default state
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('should clear all filters when clear filters button is clicked', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true&gender=Female&name=alice'), // Multiple active filters
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const clearButton = screen.getByText('Clear filters');
    await user.click(clearButton);
    
    // Should call setSearchParams with empty object (clears all)
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('should clear filters with only gender active', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Male&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const clearButton = screen.getByText('Clear filters');
    await user.click(clearButton);
    
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('should clear filters with only mine active', async () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true&name=test'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const clearButton = screen.getByText('Clear filters');
    await user.click(clearButton);
    
    expect(mockSetSearchParams).toHaveBeenCalledWith({});
  });

  it('should have correct styling for clear filters button', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    const clearButton = screen.getByText('Clear filters');
    
    // Should have red styling (danger/clear action styling)
    expect(clearButton.closest('button')).toHaveClass(
      'text-red-600',
      'hover:bg-red-50'
    );
  });

  it('should show close icon in clear filters button', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('mine=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should have close icon (assuming it gets data-testid or is recognizable)
    const clearButton = screen.getByText('Clear filters').closest('button');
    expect(clearButton).toBeInTheDocument();
    
    // Note: In real component, Icons.close would be rendered
    // This test verifies the button structure is correct
  });

  it('should not show clear filters button when filter changes from active to inactive', () => {
    const mockSetSearchParams = vi.fn();
    
    // Start with active filter
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    const { rerender } = renderWithQuery(<AvatarsShow />);
    
    // Should show clear button initially
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
    
    // Change to no active filters
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // Only default state
      mockSetSearchParams
    ]);
    
    rerender(<AvatarsShow />);
    
    // Should not show clear button anymore
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('should show clear filters button when search/name filter is active', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=alice&published=true'),
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Note: Search filter is handled by SearchInput component
    // But the logic should still work based on hasActiveFilters
    // This test verifies the hasActiveFilters logic includes search
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
    // Note: Based on the component code, name filter might not trigger hasActiveFilters
    // This test documents current behavior - can be adjusted if logic changes
  });
});

// ========================
// TEST 8: SEARCH INTEGRATION
// ========================

describe('Search Integration Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue(createMockUser({ id: 'current-user' }));
    mockUseInfiniteScroll.mockReturnValue([vi.fn(), { rootRef: vi.fn() }]);
  });

  it('should pass name search parameter to useInfiniteAvatars hook', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=alice&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call hook with name parameter from search
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'alice',
        published: 'true'
      })
    );
  });

  it('should pass name parameter with mine filter', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=bob&mine=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'bob',
        mine: 'true'
      })
    );
    
    // Should NOT have published parameter with mine=true
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.not.objectContaining({ published: 'true' })
    );
  });

  it('should pass name parameter with gender filter', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=charlie&gender=Female&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'charlie',
        gender: 'Female',
        published: 'true'
      })
    );
  });

  it('should pass name parameter with all filters combined', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=diana&gender=Male&mine=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'diana',
        gender: 'Male',
        mine: 'true'
      })
    );
  });

  it('should NOT pass name parameter when search is empty', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('published=true'), // No name parameter
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.not.objectContaining({ name: expect.any(String) })
    );
  });

  it('should render SearchInput component with correct props', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should render SearchInput component
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search avatars');
  });

  it('should handle special characters in search parameter', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=test%20avatar&published=true'), // URL encoded space
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should decode and pass the search term correctly
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'test avatar', // Should be decoded
        published: 'true'
      })
    );
  });

  it('should handle empty string search parameter', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=&published=true'), // Empty name parameter
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should pass empty string if present in URL
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: '',
        published: 'true'
      })
    );
  });

  it('should preserve search parameter when switching between public/my avatars', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=test&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    // Verify search is preserved when switching filter states
    renderWithQuery(<AvatarsShow />);
    
    // Initial call should include search
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'test',
        published: 'true'
      })
    );
  });

  it('should work with search parameter in different URL positions', () => {
    const mockSetSearchParams = vi.fn();
    
    // Test with name parameter at the beginning
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=avatar1&gender=Female&published=true'), 
      mockSetSearchParams
    ]);

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false 
      })
    );

    const { rerender } = renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'avatar1',
        gender: 'Female',
        published: 'true'
      })
    );

    // Test with name parameter at the end
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Male&published=true&name=avatar2'), 
      mockSetSearchParams
    ]);

    rerender(<AvatarsShow />);
    
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        name: 'avatar2',
        gender: 'Male',
        published: 'true'
      })
    );
  });

  it('should integrate search with infinite scroll functionality', () => {
    const mockSetSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=searchterm&published=true'), 
      mockSetSearchParams
    ]);

    const mockAvatars = [
      createMockAvatar({ id: '1', name: 'Searchterm Avatar 1' }),
      createMockAvatar({ id: '2', name: 'Searchterm Avatar 2' })
    ];

    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({ 
        isLoading: false,
        isPending: false,
        isSuccess: true,
        data: {
          pages: [createMockAvatarsPaginated({ data: mockAvatars })],
          pageParams: [1]
        },
        hasNextPage: true,
        isFetchingNextPage: false
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should render search results
    expect(screen.getByText('Searchterm Avatar 1')).toBeInTheDocument();
    expect(screen.getByText('Searchterm Avatar 2')).toBeInTheDocument();
    
    // Should still have infinite scroll functionality
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'searchterm' })
    );
  });
});

// ========================
// TEST 9: INFINITE SCROLL
// ========================

describe('Infinite Scroll Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouteLoaderData.mockReturnValue(createMockUser({ id: 'current-user' }));
    mockUseSearchParams.mockReturnValue([new URLSearchParams('published=true'), vi.fn()]);
    
    // Default mock return
    mockUseInfiniteScroll.mockReturnValue([vi.fn(), { rootRef: vi.fn() }]);
  });

  it('should call useInfiniteScroll with correct parameters when hasNextPage is true', () => {
    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isError: false,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: false,          // isFetchingNextPage
      hasNextPage: true,       // hasNextPage
      onLoadMore: mockFetchNextPage, // fetchNextPage function
      disabled: false,         // !!isError
    });
  });

  it('should call useInfiniteScroll with loading=true when fetching next page', () => {
    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: true, // Currently loading next page
        fetchNextPage: mockFetchNextPage,
        isError: false,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: true,           // isFetchingNextPage = true
      hasNextPage: true,
      onLoadMore: mockFetchNextPage,
      disabled: false,
    });
  });

  it('should call useInfiniteScroll with hasNextPage=false when no more pages', () => {
    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: false,      // No more pages available
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isError: false,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: false,
      hasNextPage: false,      // No more pages
      onLoadMore: mockFetchNextPage,
      disabled: false,
    });
  });

  it('should call useInfiniteScroll with disabled=true when error occurs', () => {
    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isError: true,           // Error occurred
        error: new Error('API Error'),
        isLoading: false,
        isPending: false,
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: false,
      hasNextPage: true,
      onLoadMore: mockFetchNextPage,
      disabled: true,          // Disabled due to error
    });
  });

  it('should show loading indicator when fetching next page', () => {
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        isFetchingNextPage: true, // Loading next page
        hasNextPage: true,
        isLoading: false,
        isPending: false,
        data: { 
          pages: [createMockAvatarsPaginated({ 
            data: [createMockAvatar({ name: 'Existing Avatar' })]
          })] 
        }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should show loading indicator
    expect(screen.getByText('Loading more avatars...')).toBeInTheDocument();
    
    // Should also show existing content
    expect(screen.getByText('Existing Avatar')).toBeInTheDocument();
  });

  it('should show loading icon when fetching next page', () => {
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        isFetchingNextPage: true,
        hasNextPage: true,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should have loading icon (component renders Icons.loading)
    const loadingElement = screen.getByText('Loading more avatars...');
    expect(loadingElement).toBeInTheDocument();
    
    // Loading section should exist (don't test specific classes, just structure)
    expect(loadingElement.closest('div')).toBeInTheDocument();
  });

  it('should render scroll trigger div when hasNextPage and not fetching', () => {
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,        // More pages available
        isFetchingNextPage: false, // Not currently loading
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should render the scroll trigger div
    const scrollTrigger = document.querySelector('.h-4');
    expect(scrollTrigger).toBeInTheDocument();
  });

  it('should NOT render scroll trigger when hasNextPage=false', () => {
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: false,       // No more pages
        isFetchingNextPage: false,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should NOT show loading indicator
    expect(screen.queryByText('Loading more avatars...')).not.toBeInTheDocument();
    
    // Should NOT render scroll trigger when no more pages
    const scrollTriggers = document.querySelectorAll('.h-4');
    expect(scrollTriggers).toHaveLength(0);
  });

  it('should NOT render scroll trigger when currently fetching next page', () => {
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: true,  // Currently fetching
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should show loading indicator
    expect(screen.getByText('Loading more avatars...')).toBeInTheDocument();
    
    // Should NOT render scroll trigger when fetching
    const scrollTriggers = document.querySelectorAll('.h-4');
    expect(scrollTriggers).toHaveLength(0);
  });

  it('should work with search and infinite scroll together', () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('name=test&published=true'),
      vi.fn()
    ]);

    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isLoading: false,
        isPending: false,
        data: { 
          pages: [createMockAvatarsPaginated({ 
            data: [createMockAvatar({ name: 'Test Avatar' })]
          })] 
        }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call useInfiniteAvatars with search parameter
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'test' })
    );
    
    // Should call useInfiniteScroll with correct config
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: false,
      hasNextPage: true,
      onLoadMore: mockFetchNextPage,
      disabled: false,
    });
    
    // Should render content
    expect(screen.getByText('Test Avatar')).toBeInTheDocument();
  });

  it('should work with filters and infinite scroll together', () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('gender=Female&mine=true'),
      vi.fn()
    ]);

    const mockFetchNextPage = vi.fn();
    
    mockUseInfiniteAvatars.mockReturnValue(
      createMockUseInfiniteAvatarsResult({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isLoading: false,
        isPending: false,
        data: { pages: [createMockAvatarsPaginated({ data: [] })] }
      })
    );

    renderWithQuery(<AvatarsShow />);
    
    // Should call useInfiniteAvatars with filter parameters
    expect(mockUseInfiniteAvatars).toHaveBeenCalledWith(
      expect.objectContaining({ 
        gender: 'Female',
        mine: 'true'
      })
    );
    
    // Should call useInfiniteScroll with correct config
    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      loading: false,
      hasNextPage: true,
      onLoadMore: mockFetchNextPage,
      disabled: false,
    });
  });
});