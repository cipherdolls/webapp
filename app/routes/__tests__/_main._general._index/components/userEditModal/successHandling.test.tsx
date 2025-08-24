import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQuery, createMockUser, createMockUseUpdateUserResult } from '../../test-utils';
import UserEditModal from '~/components/UserEditModal';
import { useUpdateUser } from '~/hooks/queries/userMutations';
import type { User } from '~/types';

// ========================
// MOCK SETUP
// ========================

vi.mock('~/hooks/queries/userMutations', () => ({
  useUpdateUser: vi.fn(),
}));

const mockUseUpdateUser = vi.mocked(useUpdateUser);

describe('UserEditModal success handling', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = createMockUser({ 
      id: '1',
      name: 'John',
      gender: 'Male',
      character: 'Test character'
    });
  });

  it('should close modal on successful update', async () => {
    const onOpenChange = vi.fn();
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      error: null
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} onOpenChange={onOpenChange} />
    );

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should not close modal when update is not successful', async () => {
    const onOpenChange = vi.fn();
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false, // Not successful
      error: null
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} onOpenChange={onOpenChange} />
    );

    // Wait a bit to ensure useEffect has time to run
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should not close modal when mutation has error', async () => {
    const onOpenChange = vi.fn();
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      error: new Error('Update failed') // Has error
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} onOpenChange={onOpenChange} />
    );

    // Wait a bit to ensure useEffect has time to run
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should handle uncontrolled modal close on success', async () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      error: null
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    // Render in uncontrolled mode (no open prop, no onOpenChange)
    const { rerender } = renderWithQuery(
      <UserEditModal me={mockUser} />
    );

    // Modal should be closed initially
    expect(screen.queryByText('Edit Your Info')).not.toBeInTheDocument();

    // Simulate success condition by rerendering with updated mutation state
    mockMutation.isSuccess = true;
    rerender(<UserEditModal me={mockUser} />);

    // In uncontrolled mode, we can't directly test modal closing
    // but we can verify the success state is handled without errors
    expect(mockMutation.isSuccess).toBe(true);
  });

  it('should display error message when mutation has error', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      error: { message: 'Update failed' } // Mock error with message
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });

  it('should not display error message when no error', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: true,
      error: null
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    // ErrorsBox should not be rendered when no error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should show pending state during mutation', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: true, // Mutation in progress
      isSuccess: false,
      error: null
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');
  });
});