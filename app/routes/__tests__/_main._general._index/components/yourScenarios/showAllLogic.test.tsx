import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithQuery, createMockUseScenariosResult, createMockScenariosPaginated, createMockScenario } from '../../test-utils';
import YourScenarios from '~/components/your-scenarios';
import { useScenarios } from '~/hooks/queries/scenarioQueries';

// Mock dependencies
vi.mock('~/hooks/queries/scenarioQueries', () => ({
  useScenarios: vi.fn(),
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
    // Only add test-id for the actual "Show all" button based on className
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

vi.mock('~/components/ScenarioAvatarModal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scenario-avatar-modal">{children}</div>
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

describe('YourScenarios show all logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useScenarios with mine=true parameter', () => {
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: createMockScenariosPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(useScenarios).toHaveBeenCalledWith({ mine: 'true' });
  });

  it('should show skeleton when loading', () => {
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    renderWithQuery(<YourScenarios />);
    
    // Check for skeleton elements (gradient backgrounds with animate-pulse)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should show empty state when no scenarios', () => {
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: createMockScenariosPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('You Have No Scenarios Yet')).toBeInTheDocument();
    expect(screen.getByText('Add new scenario')).toBeInTheDocument();
  });

  it('should handle null data gracefully', () => {
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: undefined, 
      isLoading: false,
      isSuccess: true 
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('Your Scenarios')).toBeInTheDocument();
    expect(screen.getByText('You Have No Scenarios Yet')).toBeInTheDocument();
  });

  it('should show Show all button when scenarios > 4', () => {
    const mockScenarios = Array.from({ length: 6 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('Show all')).toBeInTheDocument();
    expect(screen.getByTestId('show-all-button')).toBeInTheDocument();
  });

  it('should not show Show all button when scenarios <= 4', () => {
    const mockScenarios = Array.from({ length: 3 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
    expect(screen.queryByTestId('show-all-button')).not.toBeInTheDocument();
  });

  it('should show only first 4 scenarios initially when more than 4 exist', () => {
    const mockScenarios = Array.from({ length: 6 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    // Should show first 4 scenarios
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
    expect(screen.getByText('Scenario 4')).toBeInTheDocument();
    
    // Last 2 should be hidden (DOM elements exist but have 'hidden' class)
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
  });

  it('should toggle show all functionality correctly', () => {
    const mockScenarios = Array.from({ length: 6 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    // Initially should have 2 hidden elements
    let hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
    
    // Click show all
    fireEvent.click(screen.getByText('Show all'));
    
    // Should now show all scenarios (no hidden elements)
    hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(0);
    
    // All scenarios should be visible
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
    expect(screen.getByText('Scenario 4')).toBeInTheDocument();
    expect(screen.getByText('Scenario 5')).toBeInTheDocument();
    expect(screen.getByText('Scenario 6')).toBeInTheDocument();
    
    // Button text should change to "Collapse"
    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should collapse scenarios when Collapse button is clicked', () => {
    const mockScenarios = Array.from({ length: 6 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    // Click Show all first
    fireEvent.click(screen.getByText('Show all'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    
    // Click Collapse
    fireEvent.click(screen.getByText('Collapse'));
    
    // Should hide last 2 scenarios again
    const hiddenDivs = document.querySelectorAll('.hidden');
    expect(hiddenDivs).toHaveLength(2);
    
    // Button text should change back to "Show all"
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('should show chevron icon rotation when toggled', () => {
    const mockScenarios = Array.from({ length: 6 }, (_, i) => 
      createMockScenario({ 
        id: `scenario-${i + 1}`, 
        name: `Scenario ${i + 1}`,
        introduction: `Introduction ${i + 1}`
      })
    );
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
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

  it('should display scenario information correctly', () => {
    const mockScenarios = [
      createMockScenario({ 
        id: 'scenario-1', 
        name: 'Test Scenario Name',
        introduction: 'Test scenario introduction'
      })
    ];
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('Test Scenario Name')).toBeInTheDocument();
    expect(screen.getByText('Test scenario introduction')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('should show navigation links when scenarios exist', () => {
    const mockScenarios = [
      createMockScenario({ 
        id: 'scenario-1', 
        name: 'Test Scenario',
        introduction: 'Test introduction'
      })
    ];
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('Find Scenario')).toBeInTheDocument();
    expect(screen.getByText('Create Scenario')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
  });

  it('should handle scenarios without introduction', () => {
    const mockScenarios = [
      createMockScenario({ 
        id: 'scenario-1', 
        name: 'Test Scenario',
        introduction: undefined
      })
    ];
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios />);
    
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    // Should not show introduction text when undefined
  });

  it('should handle optional chats prop', () => {
    const mockScenarios = [
      createMockScenario({ 
        id: 'scenario-1', 
        name: 'Test Scenario',
        introduction: 'Test introduction'
      })
    ];
    
    const mockChats = [{ id: 'chat-1', scenarioId: 'scenario-1' }];
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios chats={mockChats as any} />);
    
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    expect(screen.getByTestId('scenario-avatar-modal')).toBeInTheDocument();
  });
});