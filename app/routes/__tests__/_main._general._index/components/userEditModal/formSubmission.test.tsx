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

describe('UserEditModal form submission', () => {
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = createMockUser({ 
      id: '1',
      name: 'John', 
      signerAddress: '0x123',
      gender: 'Male',
      character: 'Test character'
    });
  });

  it('should submit form with correct data', async () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    // Change the name input
    const nameInput = screen.getByDisplayValue('John');
    fireEvent.change(nameInput, { target: { value: 'Jane' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockMutation.mutate).toHaveBeenCalledWith({
      userId: mockUser.id,
      signerAddress: mockUser.signerAddress,
      name: 'Jane',
      character: expect.any(String),
      gender: expect.any(String)
    });
  });

  it('should include character and gender data in submission', async () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    // Change the character textarea
    const characterTextarea = screen.getByDisplayValue('Test character');
    fireEvent.change(characterTextarea, { target: { value: 'Updated character' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockMutation.mutate).toHaveBeenCalledWith({
      userId: mockUser.id,
      signerAddress: mockUser.signerAddress,
      name: 'John',
      character: 'Updated character',
      gender: 'Male' // Should maintain current gender
    });
  });

  it('should handle form submission with empty values', async () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    // Clear the name input
    const nameInput = screen.getByDisplayValue('John');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Clear the character textarea
    const characterTextarea = screen.getByDisplayValue('Test character');
    fireEvent.change(characterTextarea, { target: { value: '' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockMutation.mutate).toHaveBeenCalledWith({
      userId: mockUser.id,
      signerAddress: mockUser.signerAddress,
      name: '',
      character: '',
      gender: 'Male'
    });
  });

  it('should disable submit button when mutation is pending', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: true // Mutation in progress
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');
  });

  it('should show enabled submit button when mutation is not pending', () => {
    const mockMutation = createMockUseUpdateUserResult({
      mutate: vi.fn(),
      isPending: false
    });
    mockUseUpdateUser.mockReturnValue(mockMutation);

    renderWithQuery(
      <UserEditModal me={mockUser} open={true} />
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent('Save Changes');
  });
});