import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithQuery, createMockUseChatsResult, createMockUseAvatarsResult, createMockAvatarsPaginated } from '../../test-utils';
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

describe('YourChats data fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('should show skeleton when chats are loading', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated(), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);
    
    // Check for skeleton elements (gradient backgrounds with animate-pulse)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show skeleton when avatars are loading', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: [], 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    renderWithQuery(<YourChats />);
    
    // Check for skeleton elements
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show skeleton when both are loading', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    renderWithQuery(<YourChats />);
    
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
    
    // Check that skeleton structure is rendered properly
    expect(skeletonElements.length).toBeGreaterThan(5); // Multiple skeleton elements
  });

  it('should handle null data gracefully', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);
    
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
  });

  it('should handle undefined data gracefully', () => {
    vi.mocked(useChats).mockReturnValue(createMockUseChatsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourChats />);
    
    expect(screen.getByText('Your Chats')).toBeInTheDocument();
    expect(screen.getByText('You Have No Chats Yet')).toBeInTheDocument();
  });
});