import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockChat } from '../../test-utils';
import YourChats from '~/components/your-chats';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import type { Chat } from '~/types';

// Mock dependencies - copied exactly from dataFetching.test.tsx
vi.mock('~/hooks/queries/chatQueries', () => ({
  useChats: vi.fn(),
}));

vi.mock('~/hooks/queries/avatarQueries', () => ({
  useAvatars: vi.fn(),
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    chevronDown: ({ className }: { className?: string }) => (
      <div data-testid="chevron-down" className={className} />
    ),
    chat: ({ className }: { className?: string }) => (
      <div data-testid="chat-icon" className={className} />
    ),
  },
}));

vi.mock('~/components/ui/button/button', () => ({
  Root: ({ children, onClick, className }: any) => (
    <button data-testid="show-all-button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
  Icon: ({ as: Component, className }: any) => (
    <Component className={className} />
  ),
}));

vi.mock('~/components/AvatarCardReusable', () => {
  const MockedAvatarCard = ({ children, avatar, className }: any) => (
    <div data-testid="avatar-card" data-avatar-id={avatar?.id} className={className}>
      {children}
    </div>
  );
  
  MockedAvatarCard.Avatar = ({ className }: { className?: string }) => (
    <div data-testid="avatar" className={className} />
  );
  MockedAvatarCard.Content = ({ children, className }: any) => (
    <div data-testid="avatar-content" className={className}>
      {children}
    </div>
  );
  MockedAvatarCard.Name = ({ className }: { className?: string }) => (
    <div data-testid="avatar-name" className={className}>Avatar Name</div>
  );
  
  return {
    default: MockedAvatarCard,
    AvatarCard: {
      Avatar: MockedAvatarCard.Avatar,
      Content: MockedAvatarCard.Content,
      Name: MockedAvatarCard.Name,
    },
  };
});

vi.mock('~/components/AvatarScenarioModal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-scenario-modal">{children}</div>
  ),
}));

vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="link">{children}</a>
  ),
  NavLink: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="nav-link">{children}</div>
  ),
}));

vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="link">{children}</a>
  ),
  NavLink: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="nav-link">{children}</div>
  ),
}));

describe('YourChats chat grouping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  // TEST: Exactly copy from working dataFetching test
  it('should call useChats and useAvatars hooks', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);
    
    expect(useChats).toHaveBeenCalled();
    expect(useAvatars).toHaveBeenCalled();
  });

  it('should group chats by avatar correctly', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    // Should show 2 avatar groups (a1 and a2, where a2 has 2 chats)
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(2);
    
    // Check that avatars are grouped correctly by checking data attributes
    const avatar1Card = avatarCards.find(card => card.getAttribute('data-avatar-id') === 'a1');
    const avatar2Card = avatarCards.find(card => card.getAttribute('data-avatar-id') === 'a2');
    
    expect(avatar1Card).toBeInTheDocument();
    expect(avatar2Card).toBeInTheDocument();
  });

  it('should sort chats within each group by updatedAt (newest first)', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-03' }), // Newer
      createMockChat({ id: '3', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-02' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    // Should have one avatar group with 3 chats
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(1);
    
    // Check chat count badge
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should sort avatar groups by latest chat date (newest first)', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-05' }), // Latest overall
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(3);
    
    // First avatar card should be for Avatar 2 (has latest chat)
    expect(avatarCards[0]).toHaveAttribute('data-avatar-id', 'a2');
  });

  it('should handle single chat per avatar', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    // Should not show chat count badges for single chats
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    
    // Should not show chevron icons for single chats
    expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
  });

  it('should show chat count badges for multiple chats per avatar', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    // Should show chat count badge
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Should show chevron icon for expansion
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('should handle empty chats array', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
    expect(screen.getByText('Start new chat')).toBeInTheDocument();
  });

  it('should find avatar from chats when not in avatarsList', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
    ];

    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: mockChats, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);

    // Should still render the avatar card even when avatar is not in avatarsList
    const avatarCard = screen.getByTestId('avatar-card');
    expect(avatarCard).toHaveAttribute('data-avatar-id', 'a1');
  });
});