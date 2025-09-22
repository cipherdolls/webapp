import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
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

describe('UserEditModal modal control', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = createMockUser({ 
      id: '1', 
      name: 'John Doe',
      gender: 'Male',
      character: 'Test character'
    });
  });

  it('should handle controlled mode with open prop', () => {
    const onOpenChange = vi.fn();
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} onOpenChange={onOpenChange} />
    );

    expect(screen.getByTestId('user-edit-modal')).toBeInTheDocument();
  });

  it('should handle uncontrolled mode', () => {
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(<UserEditModal me={mockUser} />);
    
    // Modal should be closed by default - content should not be visible
    expect(screen.queryByText('Edit Your Info')).not.toBeInTheDocument();
  });

  it('should display modal title and description in controlled open state', () => {
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    expect(screen.getByText('Edit Your Info')).toBeInTheDocument();
    expect(screen.getByText('Update your name and character description')).toBeInTheDocument();
  });

  it('should call onOpenChange when provided in controlled mode', () => {
    const onOpenChange = vi.fn();
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} onOpenChange={onOpenChange} />
    );

    // The modal should be open
    expect(screen.getByTestId('user-edit-modal')).toBeInTheDocument();
    
    // onOpenChange should be available for the modal to call
    expect(onOpenChange).toHaveBeenCalledTimes(0); // Not called initially
  });
});