import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('YourChats column distribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('should use single column layout for 2 or fewer groups', () => {
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

    // Check for single column layout - should have md:grid-cols-2 but all items in single column behavior
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    
    // With 2 groups, should not have separate left/right column divs
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(2);
  });

  it('should use single column layout for 1 group', () => {
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

    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(1);
  });

  it('should use two column layout for more than 2 groups', () => {
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

    // With more than 2 groups, should use two column layout with left and right columns
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    
    // Should have column divs for left and right
    const columnDivs = document.querySelectorAll('.flex.flex-col.gap-2');
    expect(columnDivs).toHaveLength(2); // Left and right columns
    
    const avatarCards = screen.getAllByTestId('avatar-card');
    expect(avatarCards).toHaveLength(4);
  });

  it('should distribute groups evenly between columns', () => {
    // 6 groups should be split: 3 in left, 3 in right
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '5', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-05' }),
      createMockChat({ id: '6', avatar: { id: 'a6', name: 'Avatar 6' }, scenario: { name: 'Scenario 6' }, updatedAt: '2023-01-06' }),
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

    const columnDivs = document.querySelectorAll('.flex.flex-col.gap-2');
    expect(columnDivs).toHaveLength(2);
    
    // Each column should have 3 avatar cards
    const leftColumnCards = columnDivs[0].querySelectorAll('[data-testid="avatar-card"]');
    const rightColumnCards = columnDivs[1].querySelectorAll('[data-testid="avatar-card"]');
    
    expect(leftColumnCards).toHaveLength(3);
    expect(rightColumnCards).toHaveLength(3);
  });

  it('should handle odd number of groups correctly', () => {
    // 5 groups should be split: 3 in left, 2 in right (Math.ceil for left)
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
      createMockChat({ id: '3', avatar: { id: 'a3', name: 'Avatar 3' }, scenario: { name: 'Scenario 3' }, updatedAt: '2023-01-03' }),
      createMockChat({ id: '4', avatar: { id: 'a4', name: 'Avatar 4' }, scenario: { name: 'Scenario 4' }, updatedAt: '2023-01-04' }),
      createMockChat({ id: '5', avatar: { id: 'a5', name: 'Avatar 5' }, scenario: { name: 'Scenario 5' }, updatedAt: '2023-01-05' }),
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

    const columnDivs = document.querySelectorAll('.flex.flex-col.gap-2');
    expect(columnDivs).toHaveLength(2);
    
    // Left column should have 2, right should have 3 (5/2 = 2.5, integer division = 2 for left)
    const leftColumnCards = columnDivs[0].querySelectorAll('[data-testid="avatar-card"]');
    const rightColumnCards = columnDivs[1].querySelectorAll('[data-testid="avatar-card"]');
    
    expect(leftColumnCards).toHaveLength(2);
    expect(rightColumnCards).toHaveLength(3);
  });

  it('should maintain responsive grid classes regardless of column count', () => {
    const mockChats = [
      createMockChat({ id: '1', avatar: { id: 'a1', name: 'Avatar 1' }, scenario: { name: 'Scenario 1' }, updatedAt: '2023-01-01' }),
      createMockChat({ id: '2', avatar: { id: 'a2', name: 'Avatar 2' }, scenario: { name: 'Scenario 2' }, updatedAt: '2023-01-02' }),
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

    // Should always have responsive grid classes
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('gap-2');
  });
});