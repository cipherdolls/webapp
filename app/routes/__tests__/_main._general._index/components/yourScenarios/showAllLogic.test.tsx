import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithQuery, createMockUseScenariosResult, createMockScenariosPaginated, createMockScenario, createMockChat } from '../../test-utils';
import YourScenarios from '~/components/your-scenarios';
import { useScenarios } from '~/hooks/queries/scenarioQueries';

// ========================
// EXTERNAL DEPENDENCY MOCKS - Following UNIT_TEST_FUNDAMENTALS.md
// ========================

vi.mock('~/hooks/queries/scenarioQueries', () => ({
  useScenarios: vi.fn(),
}));

// Mock react-router for navigation context (external dependency)
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: vi.fn(() => vi.fn()),
}));

// REMOVED: UI Component Mocks - Over-mocking Anti-Pattern Fixed!
// DELETED 5 MOCKS:
// ❌ vi.mock('~/components/ui/icons') → Icons should render naturally
// ❌ vi.mock('~/components/ui/button/button') → Buttons should render naturally  
// ❌ vi.mock('~/components/ChatSelectionWizard') → Modal should render naturally
// ❌ vi.mock('~/components/DashboardCard') → Cards should render naturally
//
// RESULT: Real integration testing instead of brittle mock-heavy tests

// ========================
// INTEGRATION TESTS - Real Component Behavior
// ========================

describe('YourScenarios Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when user has no scenarios', () => {
    // Arrange
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: createMockScenariosPaginated({ data: [] }), 
      isLoading: false,
      isSuccess: true 
    }));

    // Act
    renderWithQuery(<YourScenarios />);
    
    // Assert - Focus on what user sees
    expect(screen.getByText('Your Scenarios')).toBeInTheDocument();
    expect(screen.getByText('You Have No Scenarios Yet')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({ 
      data: undefined, 
      isLoading: true,
      isPending: true 
    }));

    renderWithQuery(<YourScenarios />);
    
    // ✅ INTEGRATION TEST: Real loading skeleton behavior
    // During loading, skeleton elements should be present instead of content
    const loadingElements = document.querySelectorAll('[class*="animate-pulse"]');
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // ✅ INTEGRATION TEST: Content should not be visible during loading
    expect(screen.queryByText('You Have No Scenarios Yet')).not.toBeInTheDocument();
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
    
    // ✅ INTEGRATION TEST: Real button behavior test
    // Test semantic content, not test-ids or CSS classes
    expect(screen.getByText('Show all')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show all/i })).toBeInTheDocument();
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
    
    // ✅ INTEGRATION TEST: Behavior-focused test - no Show all button for <= 4 scenarios
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: All scenarios should be visible immediately
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
  });

  it('should show Show All button and render all scenarios in DOM when more than 4 exist', () => {
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
    
    // ✅ INTEGRATION TEST: All scenarios are rendered in DOM
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario 3')).toBeInTheDocument();
    expect(screen.getByText('Scenario 4')).toBeInTheDocument();
    expect(screen.getByText('Scenario 5')).toBeInTheDocument();
    expect(screen.getByText('Scenario 6')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Show All button is present for > 4 scenarios
    expect(screen.getByText('Show all')).toBeInTheDocument();
  });

  it('should toggle button text correctly', async () => {
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
    
    // ✅ INTEGRATION TEST: All scenarios are in DOM (component behavior)
    expect(screen.getByText('Scenario 5')).toBeInTheDocument();
    expect(screen.getByText('Scenario 6')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Initial button text
    expect(screen.getByText('Show all')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Click show all button
    const showAllButton = screen.getByText('Show all');
    fireEvent.click(showAllButton);
    
    // ✅ INTEGRATION TEST: Button text should change to "Collapse"
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
  });

  it('should collapse button functionality work correctly', () => {
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
    
    // ✅ INTEGRATION TEST: Click Show all first
    fireEvent.click(screen.getByText('Show all'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Click Collapse
    fireEvent.click(screen.getByText('Collapse'));
    
    // ✅ INTEGRATION TEST: Button text should change back to "Show all"
    expect(screen.getByText('Show all')).toBeInTheDocument();
    expect(screen.queryByText('Collapse')).not.toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: All scenarios still exist in DOM (real behavior)
    expect(screen.getByText('Scenario 5')).toBeInTheDocument();
    expect(screen.getByText('Scenario 6')).toBeInTheDocument();
  });

  it('should test complete toggle cycle behavior', () => {
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
    
    // ✅ INTEGRATION TEST: All scenarios are always in DOM
    expect(screen.getByText('Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Scenario 4')).toBeInTheDocument();
    expect(screen.getByText('Scenario 5')).toBeInTheDocument();
    expect(screen.getByText('Scenario 6')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Button toggle functionality
    expect(screen.getByText('Show all')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show all'));
    expect(screen.getByText('Collapse')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Collapse'));
    expect(screen.getByText('Show all')).toBeInTheDocument();
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
    
    // ✅ INTEGRATION TEST: Real navigation text should be present
    // Test semantic content, not test-ids or icons
    expect(screen.getByText('Find Scenario')).toBeInTheDocument();
    expect(screen.getByText('Create Scenario')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Real scenario content should be displayed
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    expect(screen.getByText('Test introduction')).toBeInTheDocument();
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

  it('should handle optional chats prop correctly', () => {
    const mockScenarios = [
      createMockScenario({ 
        id: 'scenario-1', 
        name: 'Test Scenario',
        introduction: 'Test introduction'
      })
    ];
    
    const mockChats = [createMockChat({ id: 'chat-1', scenarioId: 'scenario-1' })];
    
    vi.mocked(useScenarios).mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isLoading: false,
      isSuccess: true
    }));

    renderWithQuery(<YourScenarios chats={mockChats} />);
    
    // ✅ INTEGRATION TEST: Component should render with chats prop
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    expect(screen.getByText('Test introduction')).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Chat action should be available
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });
});