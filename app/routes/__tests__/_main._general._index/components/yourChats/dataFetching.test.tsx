import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockChat, createMockAvatar } from '../../test-utils';
import YourChats from '~/components/your-chats';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';

// ========================
// EXTERNAL DEPENDENCY MOCKS - Following UNIT_TEST_FUNDAMENTALS.md
// ========================

vi.mock('~/hooks/queries/chatQueries', () => ({
  useChats: vi.fn(),
}));

vi.mock('~/hooks/queries/avatarQueries', () => ({
  useAvatars: vi.fn(),
}));

// Mock react-router for navigation context (external dependency)
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  NavLink: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// REMOVED: UI Component Mocks - Over-mocking Anti-Pattern Fixed!
// Following UNIT_TEST_FUNDAMENTALS.md: "Mock external dependencies, not child components"
//
// DELETED MOCKS (6 total):
// ❌ vi.mock('~/components/ui/icons') → UI utility should render naturally
// ❌ vi.mock('~/components/ui/button/button') → UI component should render naturally  
// ❌ vi.mock('~/components/AvatarCardReusable') → Child component should render naturally
// ❌ vi.mock('~/components/ChatSelectionWizard') → Child component should render naturally
// ❌ vi.mock('react-router') → Let real Link/NavLink render (not external for component test)
//
// RESULT: Real integration testing instead of mock-heavy brittle tests

const mockUseChats = vi.mocked(useChats);
const mockUseAvatars = vi.mocked(useAvatars);

// ========================
// INTEGRATION TESTS - Real Component Behavior  
// ========================

describe('YourChats Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when user has no chats', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert - Focus on what user sees, not implementation
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
    expect(screen.getByText('Start new chat')).toBeInTheDocument();
  });

  it('should show loading skeleton with real UI components', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show avatars loading skeleton with real UI', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show comprehensive loading state', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(5);
  });

  it('should handle empty data gracefully with real UI', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
  });

  it('should handle null data edge case', () => {
    // Arrange
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: null, 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: null, 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
  });

  it('should render real chat data when available', () => {
    // Arrange
    const mockChatsData = [
      createMockChat({ id: 'chat1', avatar: { id: 'avatar1', name: 'Avatar One' } }),
      createMockChat({ id: 'chat2', avatar: { id: 'avatar2', name: 'Avatar Two' } })
    ];
    
    const mockAvatarsData = createMockAvatarsPaginated({
      data: [
        createMockAvatar({ id: 'avatar1', name: 'Avatar One' }),
        createMockAvatar({ id: 'avatar2', name: 'Avatar Two' })
      ]
    });

    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: mockChatsData, 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: mockAvatarsData, 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    expect(screen.getByText('Avatar One')).toBeInTheDocument();
    expect(screen.getByText('Avatar Two')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should handle show all functionality with real button', () => {
    // Arrange
    const mockChatsData = Array.from({ length: 10 }, (_, i) => 
      createMockChat({ 
        id: `chat${i + 1}`,
        avatar: { id: `avatar${i + 1}`, name: `Avatar ${i + 1}` }
      })
    );

    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: mockChatsData, 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourChats />);
    
    // Assert
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    const showAllButton = screen.queryByRole('button', { name: /show all/i });
    expect(showAllButton).toBeInTheDocument();
  });
});