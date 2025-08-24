import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQuery, createMockUseAvatarsResult, createMockAvatarsPaginated } from '../../test-utils';
import YourAvatars from '~/components/yourAvatars';
import { useAvatars } from '~/hooks/queries/avatarQueries';

// Mock dependencies
vi.mock('~/hooks/queries/avatarQueries', () => ({
  useAvatars: vi.fn(),
}));

vi.mock('~/components/ui/icons', () => ({
  Icons: {
    search: ({ className }: { className?: string }) => (
      <div data-testid="search-icon" className={className} />
    ),
    pen: ({ className }: { className?: string }) => (
      <div data-testid="pen-icon" className={className} />
    ),
    chevronDown: ({ className }: { className?: string }) => (
      <div data-testid="chevron-down" className={className} />
    ),
  },
}));

vi.mock('~/components/ui/button/button', () => ({
  Root: ({ children, onClick, className }: any) => {
    // Only add test-id for the actual "Show all" button based on className or children content
    const testId = className?.includes('px-4 h-10 gap-2') ? "show-all-button" : "button";
    return (
      <button data-testid={testId} onClick={onClick} className={className}>
        {children}
      </button>
    );
  },
  Icon: ({ as: Component, className }: any) => (
    <Component className={className} />
  ),
}));

vi.mock('~/components/AvatarScenarioModal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-scenario-modal">{children}</div>
  ),
}));

vi.mock('~/components/DashboardCard', () => ({
  default: ({ children, item, type, to }: any) => (
    <div data-testid="dashboard-card" data-item-id={item?.id} data-type={type} data-to={to}>
      {children}
    </div>
  ),
}));

vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="link">{children}</a>
  ),
}));

describe('YourAvatars mine query validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useAvatars with mine=true parameter', () => {
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(useAvatars).toHaveBeenCalledWith({ mine: 'true' });
  });

  it('should show skeleton when loading', () => {
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    renderWithQuery(<YourAvatars />);
    
    // Check for skeleton elements (gradient backgrounds with animate-pulse)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show empty state when no avatars', () => {
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: createMockAvatarsPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.getByText('You Have No Avatars Yet')).toBeInTheDocument();
    expect(screen.getByText('Add new avatar')).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.getByText('Your Avatars')).toBeInTheDocument();
    expect(screen.getByText('You Have No Avatars Yet')).toBeInTheDocument();
  });
});