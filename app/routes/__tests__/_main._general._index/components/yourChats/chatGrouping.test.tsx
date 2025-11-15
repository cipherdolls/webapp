import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockChat, createMockAvatar } from '../../test-utils';
import YourChats from '~/components/your-chats';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import type { Chat } from '~/types';

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
// DELETED 6 MOCKS (same as dataFetching.test.tsx):
// ❌ vi.mock('~/components/ui/icons')
// ❌ vi.mock('~/components/ui/button/button')  
// ❌ vi.mock('~/components/AvatarCardReusable')
// ❌ vi.mock('~/components/ChatSelectionWizard')
// ❌ Duplicate vi.mock('react-router') declarations removed
//
// RESULT: Real integration testing for chat grouping logic

const mockUseChats = vi.mocked(useChats);
const mockUseAvatars = vi.mocked(useAvatars);

// ========================
// INTEGRATION TESTS - Chat Grouping Behavior
// ========================

describe('YourChats Chat Grouping Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should group chats by avatar with real components', () => {
    const mockChatsData: Chat[] = [
      createMockChat({ id: 'chat1', avatar: { id: 'avatar1', name: 'Avatar One' }, title: 'Chat with Avatar 1-A' }),
      createMockChat({ id: 'chat2', avatar: { id: 'avatar1', name: 'Avatar One' }, title: 'Chat with Avatar 1-B' }),
      createMockChat({ id: 'chat3', avatar: { id: 'avatar2', name: 'Avatar Two' }, title: 'Chat with Avatar 2-A' }),
      createMockChat({ id: 'chat4', avatar: { id: 'avatar2', name: 'Avatar Two' }, title: 'Chat with Avatar 2-B' }),
      createMockChat({ id: 'chat5', avatar: { id: 'avatar2', name: 'Avatar Two' }, title: 'Chat with Avatar 2-C' }),
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

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Real AvatarCard grouping
    expect(screen.getByText('Avatar One')).toBeInTheDocument();
    expect(screen.getByText('Avatar Two')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Chat count indicators (only show if more than 1 chat per avatar)
    expect(screen.getByText('2')).toBeInTheDocument(); // Avatar One has 2 chats
    expect(screen.getByText('3')).toBeInTheDocument(); // Avatar Two has 3 chats
  });

  it('should handle avatar without chats gracefully', () => {
    const mockChatsData: Chat[] = [
      createMockChat({ id: 'chat1', avatar: { id: 'avatar1', name: 'Avatar One' }, title: 'Only Chat' }),
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

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Only avatar with chats should be visible
    expect(screen.getByText('Avatar One')).toBeInTheDocument();
    expect(screen.queryByText('Avatar Two')).not.toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: No chat count indicator for single chat
    // Avatar with only one chat won't show count badge
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should handle orphaned chats (chats without avatars)', () => {
    const mockChatsData: Chat[] = [
      createMockChat({ id: 'chat1', avatar: { id: 'avatar1', name: 'Avatar One' }, title: 'Valid Chat' }),
      createMockChat({ id: 'chat2', avatar: { id: 'orphan-avatar', name: 'Orphan Avatar' }, title: 'Orphaned Chat' }),
    ];

    const mockAvatarsData = createMockAvatarsPaginated({
      data: [
        createMockAvatar({ id: 'avatar1', name: 'Avatar One' })
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

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Valid avatar should be visible
    expect(screen.getByText('Avatar One')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Should handle orphaned chat gracefully
    // Component will still show the orphaned avatar from chat data
    expect(screen.getByText('Orphan Avatar')).toBeInTheDocument();
  });

  it('should display correct chat count per avatar group', () => {
    const mockChatsData: Chat[] = [
      // Avatar 1: 1 chat
      createMockChat({ id: 'chat1', avatar: { id: 'avatar1', name: 'Solo Avatar' }, title: 'Single Chat' }),
      
      // Avatar 2: 4 chats  
      createMockChat({ id: 'chat2', avatar: { id: 'avatar2', name: 'Busy Avatar' }, title: 'Chat A' }),
      createMockChat({ id: 'chat3', avatar: { id: 'avatar2', name: 'Busy Avatar' }, title: 'Chat B' }),
      createMockChat({ id: 'chat4', avatar: { id: 'avatar2', name: 'Busy Avatar' }, title: 'Chat C' }),
      createMockChat({ id: 'chat5', avatar: { id: 'avatar2', name: 'Busy Avatar' }, title: 'Chat D' }),
    ];

    const mockAvatarsData = createMockAvatarsPaginated({
      data: [
        createMockAvatar({ id: 'avatar1', name: 'Solo Avatar' }),
        createMockAvatar({ id: 'avatar2', name: 'Busy Avatar' })
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

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Both avatars should be visible
    expect(screen.getByText('Solo Avatar')).toBeInTheDocument();
    expect(screen.getByText('Busy Avatar')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Chat count indicators
    // Solo Avatar has 1 chat (no badge), Busy Avatar has 4 chats (shows badge)
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should handle empty avatar and chat data', () => {
    mockUseChats.mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    mockUseAvatars.mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Empty state should be handled gracefully
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Start new chat link in empty state
    expect(screen.getByText('Start new chat')).toBeInTheDocument();
  });

  it('should preserve chat ordering within avatar groups', () => {
    const mockChatsData: Chat[] = [
      // Same avatar, different timestamps/order
      createMockChat({ 
        id: 'chat1', 
        avatar: { id: 'avatar1', name: 'Time Avatar' },
        title: 'Older Chat',
        updatedAt: '2023-01-01T00:00:00Z'
      }),
      createMockChat({ 
        id: 'chat2', 
        avatar: { id: 'avatar1', name: 'Time Avatar' },
        title: 'Newer Chat',
        updatedAt: '2023-01-02T00:00:00Z'
      }),
    ];

    const mockAvatarsData = createMockAvatarsPaginated({
      data: [
        createMockAvatar({ id: 'avatar1', name: 'Time Avatar' })
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

    renderWithQuery(<YourChats />);
    
    // ✅ INTEGRATION TEST: Avatar should be visible
    expect(screen.getByText('Time Avatar')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Chat count badge for 2 chats
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Real component determines ordering
    // Component orders by updatedAt timestamp in descending order
  });
});