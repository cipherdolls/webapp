import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockChat } from '../../test-utils';
import YourChats from '~/components/your-chats';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import type { Chat } from '~/types';

// Mock dependencies
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

// Mock router
vi.mock('react-router', () => ({
  NavLink: ({ children, to, className }: any) => {
    const isActive = false; // Mock as not active for simplicity
    const computedClassName = typeof className === 'function' ? className({ isActive }) : className;
    return (
      <a href={to} className={computedClassName} data-testid="nav-link">
        {children}
      </a>
    );
  },
}));

describe('YourChats avatar expansion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('should expand avatar chats when clicked', () => {
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

    // Initially, chat list should not be visible
    expect(screen.queryByText('Scenario 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario 3')).not.toBeInTheDocument();

    // Click on the avatar card to expand
    const avatarCardContainer = screen.getByTestId('avatar-card').closest('.cursor-pointer');
    fireEvent.click(avatarCardContainer!);

    // Chat list should now be visible
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
    
    // "New chat" button should be visible
    expect(screen.getByText('New chat')).toBeInTheDocument();
  });

  it('should collapse avatar chats when clicked again', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
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

    const avatarCardContainer = screen.getByTestId('avatar-card').closest('.cursor-pointer');

    // First click - expand
    fireEvent.click(avatarCardContainer!);
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();

    // Second click - collapse
    fireEvent.click(avatarCardContainer!);
    expect(screen.queryByText('Scenario 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario 2')).not.toBeInTheDocument();
    expect(screen.queryByText('New chat')).not.toBeInTheDocument();
  });

  it('should show chevron icon rotation when expanded/collapsed', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
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

    const avatarCardContainer = screen.getByTestId('avatar-card').closest('.cursor-pointer');
    const chevron = screen.getByTestId('chevron-down');

    // Initially, chevron should not be rotated
    expect(chevron).not.toHaveClass('rotate-180');

    // Click to expand
    fireEvent.click(avatarCardContainer!);

    // Chevron should be rotated
    expect(chevron).toHaveClass('rotate-180');

    // Click to collapse
    fireEvent.click(avatarCardContainer!);

    // Chevron should not be rotated
    expect(chevron).not.toHaveClass('rotate-180');
  });

  it('should not show chevron or expansion for single chat avatars', () => {
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

    // Should not show chevron icons (only shown when group.chats.length > 1)
    expect(screen.queryByTestId('chevron-down')).not.toBeInTheDocument();
    
    // Should not show chat count badges
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Clicking on avatar cards should not expand anything
    const avatarCards = screen.getAllByTestId('avatar-card');
    fireEvent.click(avatarCards[0].closest('.cursor-pointer')!);
    
    // For single chat avatars, clicking should still show expansion with New chat button
    // Note: avatars are sorted by latest chat date, so a2 (Scenario 2) comes first
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('New chat')).toBeInTheDocument();
  });

  it('should show chat count badge for multi-chat avatars', () => {
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
    
    // Should show chevron icon
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('should show chat timestamps in expanded view', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01T10:00:00.000Z' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02T15:30:00.000Z' }),
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

    // Click to expand
    const avatarCardContainer = screen.getByTestId('avatar-card').closest('.cursor-pointer');
    fireEvent.click(avatarCardContainer!);

    // Should show formatted timestamps
    const timestamps = screen.getAllByText(/2023/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it('should show scenarios sorted by updatedAt (newest first)', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Old Scenario' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'New Scenario' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '3', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Middle Scenario' }, updatedAt: '2023-01-02' }),
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

    // Click to expand
    const avatarCardContainer = screen.getByTestId('avatar-card').closest('.cursor-pointer');
    fireEvent.click(avatarCardContainer!);

    // Get all nav links (chat links)
    const navLinks = screen.getAllByTestId('nav-link');
    
    // Should have 3 chat links
    expect(navLinks).toHaveLength(3);
    
    // First should be newest (New Scenario), then Middle, then Old
    expect(navLinks[0]).toHaveTextContent('New Scenario');
    expect(navLinks[1]).toHaveTextContent('Middle Scenario');
    expect(navLinks[2]).toHaveTextContent('Old Scenario');
  });

  it('should handle multiple avatar groups independently', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'A1 Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'A1 Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'A2 Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '4', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'A2 Scenario 2' }, updatedAt: '2023-01-02' }),
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
    expect(avatarCards).toHaveLength(2);

    // Expand first avatar
    fireEvent.click(avatarCards[0].closest('.cursor-pointer')!);
    
    // Only first avatar's chats should be visible
    expect(screen.getByText('A1 Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('A1 Scenario 2')).toBeInTheDocument();
    expect(screen.queryByText('A2 Scenario 1')).not.toBeInTheDocument();
    expect(screen.queryByText('A2 Scenario 2')).not.toBeInTheDocument();

    // Expand second avatar (first should collapse)
    fireEvent.click(avatarCards[1].closest('.cursor-pointer')!);
    
    // Now only second avatar's chats should be visible
    expect(screen.queryByText('A1 Scenario 1')).not.toBeInTheDocument();
    expect(screen.queryByText('A1 Scenario 2')).not.toBeInTheDocument();
    expect(screen.getByText('A2 Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('A2 Scenario 2')).toBeInTheDocument();
  });
});