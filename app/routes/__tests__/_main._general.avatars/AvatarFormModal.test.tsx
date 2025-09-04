import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQuery, createMockUser, createMockAvatar, createMockScenario, createMockTtsVoice, createMockUseUserResult, createMockUseScenariosResult, createMockUseTtsVoicesResult, createMockScenariosPaginated } from '../_main._general._index/test-utils';
import AvatarFormModal from '~/components/AvatarFormModal';
import { useUser } from '~/hooks/queries/userQueries';
import { useScenarios } from '~/hooks/queries/scenarioQueries';
import { useTtsVoices } from '~/hooks/queries/ttsQueries';

// ========================
// MOCKS
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

// Mock UI components for simpler testing
vi.mock('~/components/ui/icons', () => ({
  Icons: {
    expand: () => <div data-testid="expand-icon" />,
    fileUpload: ({ onClick }: any) => <div data-testid="file-upload-button" onClick={onClick}>Upload</div>,
    fileUploadIcon: () => <div data-testid="file-upload-icon" />,
    trash: ({ onClick }: any) => <div data-testid="trash-button" onClick={onClick}>Delete</div>,
  },
}));

vi.mock('~/components/PlayerButton', () => ({
  default: ({ audioSrc, ...props }: any) => (
    <button data-testid="player-button" data-audio-src={audioSrc} {...props}>
      Play Voice
    </button>
  ),
}));

vi.mock('~/components/selectVoiceModal', () => ({
  default: ({ ttsVoices, selectedVoice, onVoiceChange }: any) => (
    <div data-testid="select-voice-modal">
      <p>Selected: {selectedVoice?.name || 'None'}</p>
      <div>
        {ttsVoices?.map((voice: any) => (
          <button
            key={voice.id}
            data-testid={`voice-option-${voice.id}`}
            onClick={() => onVoiceChange(voice)}
          >
            Select {voice.name}
          </button>
        ))}
      </div>
    </div>
  ),
}));

vi.mock('~/components/ui/input/multiselect', () => ({
  default: ({ options, selectedOptions, onChange, placeholder }: any) => (
    <div data-testid="multiselect">
      <p data-testid="multiselect-placeholder">{placeholder}</p>
      <p data-testid="multiselect-selected">Selected: {selectedOptions?.length || 0} scenarios</p>
      <div>
        {options?.map((option: any) => (
          <button
            key={option.id}
            data-testid={`scenario-option-${option.id}`}
            onClick={() => {
              const newSelection = selectedOptions?.some((s: any) => s.id === option.id)
                ? selectedOptions.filter((s: any) => s.id !== option.id)
                : [...(selectedOptions || []), option];
              onChange(newSelection);
            }}
          >
            {selectedOptions?.some((s: any) => s.id === option.id) ? 'Remove' : 'Add'} {option.name}
          </button>
        ))}
      </div>
    </div>
  ),
}));

vi.mock('~/components/ui/input/errorsBox', () => ({
  default: ({ errors }: any) => (
    <div data-testid="errors-box">
      {errors ? `Error: ${errors.message}` : 'No errors'}
    </div>
  ),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseScenarios = vi.mocked(useScenarios);
const mockUseTtsVoices = vi.mocked(useTtsVoices);

// ========================
// TEST DATA
// ========================

const mockUser = createMockUser({ id: 'user-123', name: 'Test User' });
const mockScenarios = [
  createMockScenario({ id: 'scenario-1', name: 'Chat Scenario' }),
  createMockScenario({ id: 'scenario-2', name: 'Gaming Scenario' }),
];
const mockVoices = [
  createMockTtsVoice({ id: 'voice-1', name: 'Voice 1' }),
  createMockTtsVoice({ id: 'voice-2', name: 'Voice 2' }),
];

// ========================
// TESTS
// ========================

describe('AvatarFormModal Component', () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockUseUser.mockReturnValue(createMockUseUserResult({
      data: mockUser,
      isSuccess: true,
    }));
    
    mockUseScenarios.mockReturnValue(createMockUseScenariosResult({
      data: createMockScenariosPaginated({ data: mockScenarios }),
      isSuccess: true,
    }));
    
    mockUseTtsVoices.mockReturnValue(createMockUseTtsVoicesResult({
      data: mockVoices,
      isSuccess: true,
    }));
    
    // Mock URL.createObjectURL for file upload tests
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  describe('Component Rendering', () => {
    it('should render create avatar modal for new avatar', () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      expect(screen.getByRole('heading', { name: 'Create Avatar' })).toBeInTheDocument();
      expect(screen.getByText('Create new avatar')).toBeInTheDocument();
    });

    it('should render edit avatar modal for existing avatar', () => {
      const mockAvatar = createMockAvatar({
        id: 'avatar-123',
        name: 'Test Avatar',
      });
      
      renderWithQuery(
        <AvatarFormModal
          avatar={mockAvatar}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      expect(screen.getByRole('heading', { name: 'Edit Avatar' })).toBeInTheDocument();
      expect(screen.getByText('Edit avatar')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Check form fields
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Character')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Voice')).toBeInTheDocument();
      expect(screen.getByText('Scenarios')).toBeInTheDocument();
      expect(screen.getByText('Availability')).toBeInTheDocument();
    });
  });

  describe('Form Input Interactions', () => {
    it('should handle name input changes', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'My New Avatar');
      
      expect(nameInput).toHaveValue('My New Avatar');
    });

    it('should handle short description input changes', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      const shortDescInput = screen.getByLabelText('Short Description');
      await user.type(shortDescInput, 'A friendly assistant');
      
      expect(shortDescInput).toHaveValue('A friendly assistant');
    });

    it('should handle character textarea changes', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      const characterTextarea = screen.getByLabelText('Character');
      await user.type(characterTextarea, 'A detailed character description');
      
      expect(characterTextarea).toHaveValue('A detailed character description');
    });
  });

  describe('Gender Selection', () => {
    it('should allow user to select gender options', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // User should be able to click gender buttons
      const femaleButton = screen.getByRole('button', { name: /👩🏻 Female/i });
      const maleButton = screen.getByRole('button', { name: /🧔🏻‍♂ Male/i });
      
      expect(femaleButton).toBeInTheDocument();
      expect(maleButton).toBeInTheDocument();
      
      // User can interact with gender selection
      await user.click(femaleButton);
      await user.click(maleButton);
    });
  });

  describe('Image Upload Functionality', () => {
    it('should handle file selection and preview', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Create a mock file
      const file = new File(['test'], 'test-image.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[name="picture"]') as HTMLInputElement;
      
      // Upload file
      await user.upload(fileInput, file);
      
      // Verify URL.createObjectURL was called
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
      
      // Verify image preview is displayed
      const imagePreview = screen.getByRole('img');
      expect(imagePreview).toHaveAttribute('src', 'blob:mock-url');
    });

    it('should handle image removal when trash button is clicked', async () => {
      const mockAvatar = createMockAvatar({
        picture: 'https://example.com/avatar.jpg',
      });
      
      renderWithQuery(
        <AvatarFormModal
          avatar={mockAvatar}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Initially should show image
      expect(screen.getByRole('img')).toBeInTheDocument();
      
      // Click trash button to remove image
      const trashButton = screen.getByTestId('trash-button');
      await user.click(trashButton);
      
      // Image should be removed and upload icon should appear
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByTestId('file-upload-icon')).toBeInTheDocument();
    });
  });

  describe('Voice Selection', () => {
    it('should display voice selection modal', () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      expect(screen.getByTestId('select-voice-modal')).toBeInTheDocument();
    });

    it('should handle voice selection', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Select a voice
      const voiceButton = screen.getByTestId('voice-option-voice-2');
      await user.click(voiceButton);
      
      // Voice should be selected and displayed
      await waitFor(() => {
        expect(screen.getByText('Voice 2')).toBeInTheDocument();
      });
    });

    it('should display selected voice with player button', async () => {
      const mockAvatar = createMockAvatar({
        ttsVoice: mockVoices[0],
      });
      
      renderWithQuery(
        <AvatarFormModal
          avatar={mockAvatar}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Should show selected voice info
      expect(screen.getByText('Voice 1')).toBeInTheDocument();
      expect(screen.getByTestId('player-button')).toBeInTheDocument();
    });
  });

  describe('Scenario Selection', () => {
    it('should display multiselect for scenarios', () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      expect(screen.getByTestId('multiselect')).toBeInTheDocument();
      expect(screen.getByText('Select scenarios for this avatar')).toBeInTheDocument();
    });

    it('should handle scenario selection', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Select a scenario
      const scenarioButton = screen.getByTestId('scenario-option-scenario-1');
      await user.click(scenarioButton);
      
      // Should update selected count
      await waitFor(() => {
        expect(screen.getByText('Selected: 1 scenarios')).toBeInTheDocument();
      });
    });
  });

  describe('Privacy Settings', () => {
    it('should allow user to choose avatar visibility', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // User should see privacy options
      const privateButton = screen.getByRole('button', { name: /🔒 Private/i });
      const publicButton = screen.getByRole('button', { name: /🌐 Public/i });
      
      expect(privateButton).toBeInTheDocument();
      expect(publicButton).toBeInTheDocument();
      
      // User can select privacy settings
      await user.click(privateButton);
      await user.click(publicButton);
    });
  });

  describe('Modal Expand/Collapse', () => {
    it('should toggle expanded mode when expand button is clicked', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      const expandButton = screen.getByTitle('Expand modal');
      await user.click(expandButton);
      
      // Should change to collapse button
      expect(screen.getByTitle('Collapse modal')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when form is submitted', async () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Fill out form
      await user.type(screen.getByLabelText('Name'), 'Test Avatar');
      await user.type(screen.getByLabelText('Short Description'), 'A test avatar');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Create Avatar' });
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should show correct submit button text for edit mode', () => {
      const mockAvatar = createMockAvatar();
      
      renderWithQuery(
        <AvatarFormModal
          avatar={mockAvatar}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Save Avatar' })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display errors when provided', () => {
      const testError = new Error('Validation error');
      
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
          errors={testError}
        />
      );
      
      expect(screen.getByText('Error: Validation error')).toBeInTheDocument();
    });

    it('should show no errors when error is null', () => {
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
          errors={null}
        />
      );
      
      expect(screen.getByText('No errors')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should handle loading scenarios', () => {
      mockUseScenarios.mockReturnValue(createMockUseScenariosResult({
        isLoading: true,
        data: undefined,
      }));
      
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Should still render multiselect but with empty options
      expect(screen.getByTestId('multiselect')).toBeInTheDocument();
    });

    it('should handle loading TTS voices', () => {
      mockUseTtsVoices.mockReturnValue(createMockUseTtsVoicesResult({
        isLoading: true,
        data: undefined,
      }));
      
      renderWithQuery(
        <AvatarFormModal
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // Should still render voice modal but with empty voices
      expect(screen.getByTestId('select-voice-modal')).toBeInTheDocument();
    });
  });

  describe('Edit Mode Behavior', () => {
    it('should show existing avatar data for editing', () => {
      const mockAvatar = createMockAvatar({
        name: 'Existing Avatar',
        shortDesc: 'An existing avatar description',
        character: 'Existing character description',
      });
      
      renderWithQuery(
        <AvatarFormModal
          avatar={mockAvatar}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
          isPending={false}
        />
      );
      
      // User should see existing data in form
      expect(screen.getByDisplayValue('Existing Avatar')).toBeInTheDocument();
      expect(screen.getByDisplayValue('An existing avatar description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing character description')).toBeInTheDocument();
    });
  });
});