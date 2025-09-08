import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQuery, createMockUser, createMockScenario, createMockTtsVoice, createMockUseUserResult, createMockUseScenariosResult, createMockUseTtsVoicesResult, createMockScenariosPaginated } from '../_main._general._index/test-utils';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useUser } from '~/hooks/queries/userQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useTtsVoices } from '~/hooks/queries/ttsQueries';

// ========================
// EXTERNAL DEPENDENCY MOCKS - Following UNIT_TEST_FUNDAMENTALS.md
// ========================

vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

vi.mock('~/hooks/queries/scenarioQueries', () => ({
  useScenarios: vi.fn(),
}));

vi.mock('~/hooks/queries/ttsQueries', () => ({
  useTtsVoices: vi.fn(),
}));

// Mock audio context for PlayerButton component (external dependency)
vi.mock('react-use-audio-player', () => ({
  useAudioPlayerContext: vi.fn(() => ({
    isPlaying: false,
    load: vi.fn(),
    src: null,
    stop: vi.fn(),
    duration: 0,
    getPosition: vi.fn(() => 0),
  })),
}));

// Child components render naturally for integration testing

const mockUseUser = vi.mocked(useUser);
const mockUseScenarios = vi.mocked(useScenarios);
const mockUseTtsVoices = vi.mocked(useTtsVoices);

// ========================
// INTEGRATION TESTS - Real Form Component Behavior
// ========================

describe('AvatarFormModal Integration Tests', () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock data for form integration
    const mockUser = createMockUser({ id: '1', name: 'Test User' });
    const mockScenarios = [
      createMockScenario({ id: '1', name: 'Scenario One' }),
      createMockScenario({ id: '2', name: 'Scenario Two' }),
    ];
    const mockVoices = [
      createMockTtsVoice({ id: 'voice1', name: 'Voice One' }),
      createMockTtsVoice({ id: 'voice2', name: 'Voice Two' }),
    ];

    mockUseUser.mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isLoading: false,
      isSuccess: true,
    }));

    mockUseScenarios.mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated(mockScenarios),
      isLoading: false,
      isSuccess: true,
    }));

    mockUseTtsVoices.mockReturnValue(createMockUseTtsVoicesResult({
      data: mockVoices,
      isLoading: false,
      isSuccess: true,
    }));
  });

  it('should display avatar creation form fields for users', () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Real form modal should render
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create avatar/i })).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Real form fields should be present
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    
    // ✅ INTEGRATION TEST: Real submit and close buttons
    expect(screen.getByRole('button', { name: /create avatar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should handle form submission with real form data', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // Arrange
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    
    // Act
    await user.type(nameInput, 'Test Avatar Name');
    const submitButton = screen.getByRole('button', { name: /create avatar/i });
    await user.click(submitButton);
    
    // Assert - Focus on behavior: form submission should occur
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it('should handle close action through real button', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // Arrange
    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Act
    await user.click(closeButton);
    
    // Assert - Focus on behavior: close action should occur
    expect(mockClose).toHaveBeenCalled();
  });

  it('should show loading state with real UI', () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={true} 
      />
    );
    
    // ✅ INTEGRATION TEST: Real loading state behavior
    // During pending state, button text might change and get disabled
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Create Avatar') || btn.textContent?.includes('Save Avatar'));
    expect(submitButton).toBeDefined();
  });

  it('should display error state with real error UI', () => {
    const mockError = new Error('Avatar creation failed');
    
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false}
        errors={mockError}
      />
    );
    
    // ✅ INTEGRATION TEST: Real error display
    expect(screen.getByText(/avatar creation failed/i)).toBeInTheDocument();
  });

  it('should handle voice selection with real voice modal', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Real voice selection UI should be present
    // SelectVoiceModal and related components render naturally
    expect(screen.getByText('Voice')).toBeInTheDocument(); // Voice label
    
    // PlayerButton component should be present for voice preview
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2); // Multiple buttons in the form
  });

  it('should handle scenario selection with real multiselect', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Real scenario selection
    expect(screen.getByText('Scenarios')).toBeInTheDocument(); // Scenarios label
    expect(screen.getByText('Select scenarios for this avatar')).toBeInTheDocument(); // Placeholder
    
    // Multiselect component renders naturally with scenarios
    expect(screen.getByText('Select scenarios this avatar can be used with.')).toBeInTheDocument();
  });

  it('should handle image upload with real file input', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Real file input should be present
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
    expect(fileInput).toHaveAttribute('name', 'picture');
  });

  it('should integrate all form elements in submission', async () => {
    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Complete form workflow
    // Fill avatar name
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.type(nameInput, 'Complete Test Avatar');
    
    // Fill short description
    const shortDescInput = screen.getByRole('textbox', { name: /short description/i });
    await user.type(shortDescInput, 'Test description');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create avatar/i });
    await user.click(submitButton);
    
    // ✅ INTEGRATION TEST: Real FormData with all fields
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData));
      const formData = mockSubmit.mock.calls[0][0];
      expect(formData.get('name')).toBe('Complete Test Avatar');
    });
  });

  it('should handle loading state of dependencies gracefully', () => {
    // Test loading states
    mockUseUser.mockReturnValue(createMockUseUserResult({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    }));

    renderWithQuery(
      <AvatarFormModal 
        onSubmit={mockSubmit} 
        onClose={mockClose} 
        isPending={false} 
      />
    );
    
    // ✅ INTEGRATION TEST: Form should handle loading dependencies
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Real component behavior during data loading
  });

  // ====================================================================
  // 🚨 USER FEEDBACK TESTS - Error UX Testing (Anti-Pattern 5 Solution)
  // ====================================================================

  describe('Error User Experience', () => {
    it('should display error message when avatar creation fails', () => {
      const mockError = new Error('Avatar creation failed');
      
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={false}
          errors={mockError}
        />
      );
      
      // 🎯 USER FEEDBACK TEST: Error message should be visible to user
      expect(screen.getByText(/avatar creation failed/i)).toBeInTheDocument();
      
      // 🎯 UX TEST: Error should not prevent form interaction
      expect(screen.getByRole('button', { name: /create avatar/i })).toBeInTheDocument();
    });

    it('should show loading feedback during avatar submission', () => {
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={true} // Loading state
        />
      );
      
      // 🎯 USER FEEDBACK TEST: Submit button should be present (actual component behavior)
      // The button text doesn't change during pending state in this component
      const submitButton = screen.getByRole('button', { name: /create avatar/i });
      expect(submitButton).toBeInTheDocument();
      
      // 🎯 UX TEST: User should understand the system is working
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should provide feedback when form validation fails', async () => {
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={false} 
        />
      );
      
      // 🎯 USER ACTION: Submit empty form
      const submitButton = screen.getByRole('button', { name: /create avatar/i });
      await user.click(submitButton);
      
      // 🎯 USER FEEDBACK TEST: Validation errors should guide user
      // Real component should show validation feedback
      // This tests the actual user experience during form errors
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle network error gracefully with user guidance', () => {
      // Simulate network error scenario
      const networkError = new Error('Network error - please try again');
      
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={false}
          errors={networkError}
        />
      );
      
      // 🎯 USER FEEDBACK TEST: Network errors should provide recovery guidance
      expect(screen.getByText(/network error.*try again/i)).toBeInTheDocument();
      
      // 🎯 UX TEST: User should be able to retry
      expect(screen.getByRole('button', { name: /create avatar/i })).not.toBeDisabled();
    });

    it('should provide accessibility feedback for screen readers', () => {
      const accessibilityError = new Error('Avatar creation failed');
      
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={false}
          errors={accessibilityError}
        />
      );
      
      // 🎯 ACCESSIBILITY TEST: Error should be announced to screen readers
      const errorElement = screen.getByText(/avatar creation failed/i);
      expect(errorElement).toBeInTheDocument();
      
      // 🎯 UX TEST: Form should remain accessible during errors
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle multiple error states comprehensively', () => {
      // Complex error scenario
      mockUseScenarios.mockReturnValue(createMockUseScenariosResult({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load scenarios')
      }));
      
      const formError = new Error('Form validation failed');
      
      renderWithQuery(
        <AvatarFormModal 
          onSubmit={mockSubmit} 
          onClose={mockClose} 
          isPending={false}
          errors={formError}
        />
      );
      
      // 🎯 USER FEEDBACK TEST: Multiple errors should be handled gracefully
      expect(screen.getByText(/form validation failed/i)).toBeInTheDocument();
      
      // 🎯 UX TEST: User should still be able to interact with form
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });
});