import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockChat } from '../../test-utils';
import YourChats from '~/components/your-chats';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';

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

vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="link">{children}</a>
  ),
  NavLink: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="nav-link">{children}</div>
  ),
}));

describe('YourChats show/hide logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('should show first 4 groups by default when more than 4 exist', () => {
    // Create 6 groups - should show first 4
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-06' }), // Most recent
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-05' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '5', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-02' }), // Should be hidden
      createMockChat({ id: '6', avatar: { id: 'a6', name: 'Avatar 6' }, scenario: { name: 'Scenario 6' }, updatedAt: '2023-01-01' }), // Should be hidden
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

    // Should show exactly 4 avatar cards initially (first 2 in each column)
    const allCards = screen.getAllByTestId('avatar-card');
    expect(allCards).toHaveLength(6);
    
    // Check visibility based on component logic: first 2 in each column are visible
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2); // 2 divs should be hidden (index >= 2 in each column)
    
    // Should show "Show all" button
    expect(screen.getByTestId('show-all-button')).toBeInTheDocument();
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('should not show "Show all" button when 4 or fewer groups exist', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-04' }),
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

    // Should not show "Show all" button
    expect(screen.queryByTestId('show-all-button')).not.toBeInTheDocument();
    
    // Should show all 4 avatar cards
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(4);
  });

  it('should show all groups when "Show all" button is clicked', () => {
    // Create 6 groups
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-06' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-05' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '5', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '6', avatar: { id: 'a6', name: 'Avatar 6' }, scenario: { name: 'Scenario 6' }, updatedAt: '2023-01-01' }),
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

    // Initially should hide 2 groups (last in each column)
    let hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);

    // Click "Show all"
    fireEvent.click(screen.getByText('Show all'));

    // Should now show all 6 groups (no hidden divs)
    hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(0);
    
    // Button text should change to "Collapse"
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should collapse groups when "Collapse" button is clicked', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-06' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-05' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '5', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '6', avatar: { id: 'a6', name: 'Avatar 6' }, scenario: { name: 'Scenario 6' }, updatedAt: '2023-01-01' }),
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

    // Click "Show all" first
    fireEvent.click(screen.getByText('Show all'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();

    // Click "Collapse"
    fireEvent.click(screen.getByText('Collapse'));

    // Should hide 2 groups again
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
    
    // Button text should change back to "Show all"
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('should close expanded avatar when "Show all" is clicked', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-06' }),
      createMockChat({ id: '2', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-05' }), // Same avatar - creates group with 2 chats
      createMockChat({ id: '3', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '4', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '5', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '6', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 6' }, updatedAt: '2023-01-01' }),
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

    // First, expand an avatar group (Avatar 1 has multiple chats)
    const avatarCards = screen.getAllByTestId('avatar-card');
    const avatar1Card = avatarCards.find(card => card.getAttribute('data-avatar-id') === 'a1');
    fireEvent.click(avatar1Card!.closest('.cursor-pointer')!);

    // Then click "Show all"
    fireEvent.click(screen.getByText('Show all'));

    // The expanded avatar should be collapsed (no expanded content visible)
    // This is tested indirectly by checking that expandedAvatar state was reset
    // The component should not show expanded chat list
    expect(screen.queryByText('New chat')).not.toBeInTheDocument();
  });

  it('should handle index calculation correctly for two-column layout', () => {
    // Create 8 groups to test two-column distribution with hiding
    const mockChats = Array.from({ length: 8 }, (_, i) => 
      createMockChat({ id: `${i + 1}`, avatar: { id: `a${i + 1}`, name: `Avatar ${i + 1}` }, scenario: { name: `Scenario ${i + 1}` }, updatedAt: `2023-01-${String(8 - i).padStart(2, '0')}` })
    );

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

    // Should show first 4 groups (2 in each column), hiding the rest
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(4); // 4 divs should be hidden (index >= 2 in each column)

    // Click "Show all"
    fireEvent.click(screen.getByText('Show all'));

    // Should show all 8 groups
    const allCards = screen.getAllByTestId('avatar-card');
    expect(allCards).toHaveLength(8);
  });
});