import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
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

describe('UserEditModal gender selection', () => {
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

  it('should update gender state when gender button clicked', () => {
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const femaleButton = screen.getByText('👩🏻 Female');
    fireEvent.click(femaleButton);

    // Check that the female button has active styles (bg-white class)
    expect(femaleButton.closest('button')).toHaveClass('bg-white');
  });

  it('should show male button as active initially when user gender is Male', () => {
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const maleButton = screen.getByText('🧔🏻‍♂ Male');
    expect(maleButton.closest('button')).toHaveClass('bg-white');

    const femaleButton = screen.getByText('👩🏻 Female');
    expect(femaleButton.closest('button')).not.toHaveClass('bg-white');
  });

  it('should show female button as active initially when user gender is Female', () => {
    const femaleUser = createMockUser({ 
      id: '1',
      name: 'Jane',
      gender: 'Female',
      character: 'Test character'
    });

    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={femaleUser} open={true} />
    );

    const femaleButton = screen.getByText('👩🏻 Female');
    expect(femaleButton.closest('button')).toHaveClass('bg-white');

    const maleButton = screen.getByText('🧔🏻‍♂ Male');
    expect(maleButton.closest('button')).not.toHaveClass('bg-white');
  });

  it('should toggle between gender buttons correctly', () => {
    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const maleButton = screen.getByText('🧔🏻‍♂ Male');
    const femaleButton = screen.getByText('👩🏻 Female');

    // Initially male should be active
    expect(maleButton.closest('button')).toHaveClass('bg-white');
    expect(femaleButton.closest('button')).not.toHaveClass('bg-white');

    // Click female button
    fireEvent.click(femaleButton);
    expect(femaleButton.closest('button')).toHaveClass('bg-white');
    expect(maleButton.closest('button')).not.toHaveClass('bg-white');

    // Click male button again
    fireEvent.click(maleButton);
    expect(maleButton.closest('button')).toHaveClass('bg-white');
    expect(femaleButton.closest('button')).not.toHaveClass('bg-white');
  });

  it('should include selected gender in form submission', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    // Change gender to Female
    const femaleButton = screen.getByText('👩🏻 Female');
    fireEvent.click(femaleButton);

    // Submit form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockMutation.mutate).toHaveBeenCalledWith({
      userId: mockUser.id,
      signerAddress: mockUser.signerAddress,
      name: mockUser.name,
      character: mockUser.character,
      gender: 'Female' // Should be updated to Female
    });
  });

  it('should handle null gender gracefully', () => {
    const userWithNullGender = createMockUser({ 
      id: '1',
      name: 'John',
      gender: null,
      character: 'Test character'
    });

    const mockMutation = createMockUseUpdateUserResult();
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={userWithNullGender} open={true} />
    );

    // Both buttons should be inactive initially
    const maleButton = screen.getByText('🧔🏻‍♂ Male');
    const femaleButton = screen.getByText('👩🏻 Female');
    
    expect(maleButton.closest('button')).not.toHaveClass('bg-white');
    expect(femaleButton.closest('button')).not.toHaveClass('bg-white');

    // Clicking should work normally
    fireEvent.click(femaleButton);
    expect(femaleButton.closest('button')).toHaveClass('bg-white');
  });
});