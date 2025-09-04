import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQuery, createMockUser, createMockScenario, createMockTtsVoice, createMockUseUserResult, createMockUseScenariosResult, createMockUseTtsVoicesResult, createMockScenariosPaginated } from '../_main._general._index/test-utils';
import AvatarNew from '~/routes/_main._general.avatars.new';
import { useNavigate } from 'react-router';
import { useCreateAvatar } from '~/hooks/queries/avatarMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useTtsVoices } from '~/hooks/queries/ttsQueries';

// ========================
// MOCKS
// ========================

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('~/hooks/queries/avatarMutations', () => ({
  useCreateAvatar: vi.fn(),
}));

vi.mock('~/hooks/queries/userQueries', () => ({
  useUser: vi.fn(),
}));

vi.mock('~/hooks/queries/scenarioQueries', () => ({
  useScenarios: vi.fn(),
}));

vi.mock('~/hooks/queries/ttsQueries', () => ({
  useTtsVoices: vi.fn(),
}));

// Mock AvatarFormModal component for easier testing
vi.mock('~/components/AvatarFormModal', () => ({
  default: ({ onSubmit, onClose, isPending, errors }: any) => (
    <div data-testid="avatar-form-modal">
      <h1>Avatar Form Modal</h1>
      <button data-testid="mock-submit" onClick={() => {
        const mockFormData = new FormData();
        mockFormData.append('name', 'Test Avatar');
        onSubmit(mockFormData);
      }}>
        Submit
      </button>
      <button data-testid="mock-close" onClick={onClose}>
        Close
      </button>
      <div data-testid="loading-state">{isPending ? 'Loading...' : 'Not Loading'}</div>
      <div data-testid="error-state">{errors ? `Error: ${errors.message}` : 'No Errors'}</div>
    </div>
  ),
}));

const mockNavigate = vi.mocked(useNavigate);
const mockUseCreateAvatar = vi.mocked(useCreateAvatar);
const mockUseUser = vi.mocked(useUser);
const mockUseScenarios = vi.mocked(useScenarios);
const mockUseTtsVoices = vi.mocked(useTtsVoices);

// ========================
// TESTS
// ========================

describe('AvatarNew Component', () => {
  const user = userEvent.setup();
  const mockNavigateFn = vi.fn();
  const mockCreateAvatar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockNavigate.mockReturnValue(mockNavigateFn);
    mockUseCreateAvatar.mockReturnValue({
      mutate: mockCreateAvatar,
      isPending: false,
      error: null,
    } as any);
    
    mockUseUser.mockReturnValue(createMockUseUserResult({
      data: createMockUser({ id: 'user-123', name: 'Test User' }),
      isSuccess: true,
    }));
    
    mockUseScenarios.mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({
        data: [
          createMockScenario({ id: 'scenario-1', name: 'Chat Scenario' }),
          createMockScenario({ id: 'scenario-2', name: 'Gaming Scenario' }),
        ],
      }),
      isSuccess: true,
    }));
    
    mockUseTtsVoices.mockReturnValue(createMockUseTtsVoicesResult({
      data: [
        createMockTtsVoice({ id: 'voice-1', name: 'Voice 1' }),
        createMockTtsVoice({ id: 'voice-2', name: 'Voice 2' }),
      ],
      isSuccess: true,
    }));
  });

  describe('Component Rendering', () => {
    it('should render AvatarFormModal with correct props', () => {
      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('avatar-form-modal')).toBeInTheDocument();
      expect(screen.getByText('Avatar Form Modal')).toBeInTheDocument();
    });

    it('should pass isPending=false when not creating', () => {
      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    it('should pass isPending=true when creating avatar', () => {
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: true,
        error: null,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
    });

    it('should display error when creation fails', () => {
      const testError = new Error('Creation failed');
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: false,
        error: testError,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('Error: Creation failed');
    });

    it('should display no errors when error is null', () => {
      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('No Errors');
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to avatars route when form is closed', async () => {
      renderWithQuery(<AvatarNew />);
      
      const closeButton = screen.getByTestId('mock-close');
      await user.click(closeButton);
      
      expect(mockNavigateFn).toHaveBeenCalledWith('/avatars');
    });
  });

  describe('Form Submission', () => {
    it('should call createAvatar with form data on submit', async () => {
      renderWithQuery(<AvatarNew />);
      
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);
      
      expect(mockCreateAvatar).toHaveBeenCalledWith(
        expect.any(FormData),
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });

    it('should navigate to avatar detail page on successful creation', async () => {
      const mockNewAvatar = { id: 'new-avatar-123' };
      
      // Mock successful creation
      mockUseCreateAvatar.mockReturnValue({
        mutate: (formData: FormData, options: any) => {
          // Simulate successful creation
          options.onSuccess(mockNewAvatar);
        },
        isPending: false,
        error: null,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);
      
      expect(mockNavigateFn).toHaveBeenCalledWith('/avatars/new-avatar-123');
    });

    it('should handle form data correctly', async () => {
      renderWithQuery(<AvatarNew />);
      
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);
      
      // Verify FormData was created and passed
      expect(mockCreateAvatar).toHaveBeenCalledWith(
        expect.any(FormData),
        expect.any(Object)
      );
      
      // Get the FormData that was passed
      const callArgs = mockCreateAvatar.mock.calls[0];
      const formData = callArgs[0] as FormData;
      
      // Verify FormData contains expected values
      expect(formData.get('name')).toBe('Test Avatar');
    });
  });

  describe('Error Handling', () => {
    it('should display API error message when provided', () => {
      const apiError = new Error('Server validation error');
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: false,
        error: apiError,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('Error: Server validation error');
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: false,
        error: networkError,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('Error: Network request failed');
    });
  });

  describe('Component Integration', () => {
    it('should pass all required props to AvatarFormModal', () => {
      renderWithQuery(<AvatarNew />);
      
      // Verify modal is rendered (integration test)
      expect(screen.getByTestId('avatar-form-modal')).toBeInTheDocument();
      
      // Verify all interaction elements are present
      expect(screen.getByTestId('mock-submit')).toBeInTheDocument();
      expect(screen.getByTestId('mock-close')).toBeInTheDocument();
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should handle modal state changes correctly', async () => {
      renderWithQuery(<AvatarNew />);
      
      // Test close functionality
      const closeButton = screen.getByTestId('mock-close');
      await user.click(closeButton);
      
      expect(mockNavigateFn).toHaveBeenCalledWith('/avatars');
      
      // Test submit functionality
      const submitButton = screen.getByTestId('mock-submit');
      await user.click(submitButton);
      
      expect(mockCreateAvatar).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during avatar creation', () => {
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: true,
        error: null,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
    });

    it('should hide loading state when not pending', () => {
      mockUseCreateAvatar.mockReturnValue({
        mutate: mockCreateAvatar,
        isPending: false,
        error: null,
      } as any);

      renderWithQuery(<AvatarNew />);
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
  });
});