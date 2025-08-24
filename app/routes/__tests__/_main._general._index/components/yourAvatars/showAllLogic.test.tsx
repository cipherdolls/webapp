import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithQuery, createMockUseAvatarsResult, createMockAvatarsPaginated, createMockAvatar } from '../../test-utils';
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

describe('YourAvatars show all logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show Show all button when avatars > 4', () => {
    const mockAvatars = Array.from({ length: 6 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.getByText('Show all')).toBeInTheDocument();
    expect(screen.getByTestId('show-all-button')).toBeInTheDocument();
  });

  it('should not show Show all button when avatars <= 4', () => {
    const mockAvatars = Array.from({ length: 3 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
    expect(screen.queryByTestId('show-all-button')).not.toBeInTheDocument();
  });

  it('should show only first 4 avatars initially when more than 4 exist', () => {
    const mockAvatars = Array.from({ length: 6 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    // Should show first 4 avatars
    expect(screen.getByText('Avatar 1')).toBeInTheDocument();
    expect(screen.getByText('Avatar 2')).toBeInTheDocument();
    expect(screen.getByText('Avatar 3')).toBeInTheDocument();
    expect(screen.getByText('Avatar 4')).toBeInTheDocument();
    
    // Last 2 should be hidden (DOM elements exist but have 'hidden' class)
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
  });

  it('should show all avatars when Show all button is clicked', () => {
    const mockAvatars = Array.from({ length: 6 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    // Initially should have 2 hidden elements
    let hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
    
    // Click Show all
    fireEvent.click(screen.getByText('Show all'));
    
    // Should now show all avatars (no hidden elements)
    hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(0);
    
    // All avatars should be visible
    expect(screen.getByText('Avatar 1')).toBeInTheDocument();
    expect(screen.getByText('Avatar 2')).toBeInTheDocument();
    expect(screen.getByText('Avatar 3')).toBeInTheDocument();
    expect(screen.getByText('Avatar 4')).toBeInTheDocument();
    expect(screen.getByText('Avatar 5')).toBeInTheDocument();
    expect(screen.getByText('Avatar 6')).toBeInTheDocument();
    
    // Button text should change to "Collapse"
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should collapse avatars when Collapse button is clicked', () => {
    const mockAvatars = Array.from({ length: 6 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    // Click Show all first
    fireEvent.click(screen.getByText('Show all'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    
    // Click Collapse
    fireEvent.click(screen.getByText('Collapse'));
    
    // Should hide last 2 avatars again
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
    
    // Button text should change back to "Show all"
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('should show chevron icon rotation when toggled', () => {
    const mockAvatars = Array.from({ length: 6 }, (_, i) => 
      createMockAvatar({ 
        id: `avatar-${i + 1}`, 
        name: `Avatar ${i + 1}`,
        shortDesc: `Description ${i + 1}`
      })
    );
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    const chevron = screen.getByTestId('chevron-down');
    
    // Initially, chevron should not be rotated
    expect(chevron).not.toHaveClass('rotate-180');
    
    // Click to expand
    fireEvent.click(screen.getByText('Show all'));
    
    // Chevron should be rotated
    expect(chevron).toHaveClass('rotate-180');
    
    // Click to collapse
    fireEvent.click(screen.getByText('Collapse'));
    
    // Chevron should not be rotated
    expect(chevron).not.toHaveClass('rotate-180');
  });

  it('should display avatar information correctly', () => {
    const mockAvatars = [
      createMockAvatar({ 
        id: 'avatar-1', 
        name: 'Test Avatar Name',
        shortDesc: 'Test avatar description'
      })
    ];
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.getByText('Test Avatar Name')).toBeInTheDocument();
    expect(screen.getByText('Test avatar description')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('should show navigation links when avatars exist', () => {
    const mockAvatars = [
      createMockAvatar({ 
        id: 'avatar-1', 
        name: 'Test Avatar',
        shortDesc: 'Test description'
      })
    ];
    
    vi.mocked(useAvatars).mockReturnValue(createMockUseAvatarsResult({
      data: createMockAvatarsPaginated({ data: mockAvatars }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourAvatars />);
    
    expect(screen.getByText('Find Avatar')).toBeInTheDocument();
    expect(screen.getByText('Create Avatar')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
  });
});