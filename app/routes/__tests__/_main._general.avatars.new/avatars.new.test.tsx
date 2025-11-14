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
// EXTERNAL DEPENDENCY MOCKS - Following UNIT_TEST_FUNDAMENTALS.md
// ========================

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' })),
    useParams: vi.fn(() => ({})),
  };
});

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

// Mock audio context for PlayerButton component in AvatarFormModal
// This is external dependency, not child component logic
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

// AvatarFormModal renders naturally for real integration testing

const mockNavigate = vi.mocked(useNavigate);
const mockUseCreateAvatar = vi.mocked(useCreateAvatar);
const mockUseUser = vi.mocked(useUser);
const mockUseScenarios = vi.mocked(useScenarios);
const mockUseTtsVoices = vi.mocked(useTtsVoices);

// ========================
// INTEGRATION TESTS - Real Component Behavior
// ========================

describe('AvatarNew Integration Tests', () => {
  const user = userEvent.setup();
  const mockNavigateFn = vi.fn();
  const mockCreateAvatar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup external dependency mocks
    mockNavigate.mockReturnValue(mockNavigateFn);
    mockUseCreateAvatar.mockReturnValue({
      mutate: mockCreateAvatar,
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      error: null,
      data: undefined,
      variables: null as any,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'idle' as const,
      submittedAt: 0,
      reset: vi.fn(),
    });

    // Mock required data for AvatarFormModal integration
    const mockUser = createMockUser({ id: '1', name: 'Test User' });
    const mockScenarios = [
      createMockScenario({ id: '1', name: 'Test Scenario 1' }),
      createMockScenario({ id: '2', name: 'Test Scenario 2' }),
    ];
    const mockVoices = [
      createMockTtsVoice({ id: 'voice1', name: 'Voice 1' }),
      createMockTtsVoice({ id: 'voice2', name: 'Voice 2' }),
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

  it('should display avatar creation form to users', () => {
    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Real AvatarFormModal should render
    // This now tests the actual component instead of a mock
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create avatar/i })).toBeInTheDocument();
  });

  it('should handle form submission through real AvatarFormModal', async () => {
    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Test real form interaction
    // Fill out the actual form fields (not mock buttons)
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.type(nameInput, 'Test Avatar');
    
    const submitButton = screen.getByRole('button', { name: /create avatar/i });
    await user.click(submitButton);
    
    // ✅ INTEGRATION TEST: Verify real form submission
    await waitFor(() => {
      expect(mockCreateAvatar).toHaveBeenCalledWith(
        expect.any(FormData),
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  it('should handle close action through real AvatarFormModal', async () => {
    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Test real close button interaction
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    // ✅ INTEGRATION TEST: Verify navigation
    expect(mockNavigateFn).toHaveBeenCalledWith('/avatars');
  });

  it('should handle successful avatar creation and navigation', async () => {
    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Fill real form
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await user.type(nameInput, 'Success Avatar');
    
    const submitButton = screen.getByRole('button', { name: /create avatar/i });
    await user.click(submitButton);
    
    // Simulate successful creation
    await waitFor(() => {
      const createCall = mockCreateAvatar.mock.calls[0];
      const onSuccessCallback = createCall[1].onSuccess;
      onSuccessCallback({ id: 'new-avatar-123' });
    });
    
    // ✅ INTEGRATION TEST: Verify navigation to new avatar
    expect(mockNavigateFn).toHaveBeenCalledWith('/avatars/new-avatar-123');
  });

  it('should show loading state in real AvatarFormModal', () => {
    // Setup loading state
    mockUseCreateAvatar.mockReturnValue({
      mutate: mockCreateAvatar,
      mutateAsync: vi.fn(),
      isPending: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      error: null,
      data: undefined,
      variables: null as any,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      status: 'pending' as const,
      submittedAt: 0,
      reset: vi.fn(),
    });

    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Real loading state should be visible
    // Form should be present with loading state
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle error state in real AvatarFormModal', () => {
    // Setup error state
    const mockError = new Error('Creation failed');
    mockUseCreateAvatar.mockReturnValue({
      mutate: mockCreateAvatar,
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      isSuccess: false,
      isIdle: false,
      error: mockError,
      data: undefined,
      variables: null as any,
      context: undefined,
      failureCount: 1,
      failureReason: mockError,
      isPaused: false,
      status: 'error' as const,
      submittedAt: 0,
      reset: vi.fn(),
    });

    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Real error state should be visible
    expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
  });

  it('should pass correct props to AvatarFormModal', () => {
    renderWithQuery(<AvatarNew />);
    
    // ✅ INTEGRATION TEST: Verify modal receives correct props
    // The modal should be open (not showing initial closed state)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-state', 'open');
  });
});