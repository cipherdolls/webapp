import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NetworkWarningBanner } from '~/components/NetworkWarningBanner';
import { switchToOptimismNetwork } from '~/utils/networkUtils';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('~/utils/networkUtils', () => ({
  switchToOptimismNetwork: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('NetworkWarningBanner network switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call switchToOptimismNetwork when button clicked', async () => {
    vi.mocked(switchToOptimismNetwork).mockResolvedValue({ success: true });

    render(<NetworkWarningBanner />);
    
    // ✅ ENHANCED SPECIFICITY: Use role-based selection for better reliability
    const switchButton = screen.getByRole('button', { name: /switch to optimism/i });
    fireEvent.click(switchButton);

    // ✅ ENHANCED SPECIFICITY: Verify exact call count, not just that it was called
    expect(switchToOptimismNetwork).toHaveBeenCalledTimes(1);
    expect(switchToOptimismNetwork).toHaveBeenCalledWith();
  });

  it('should show loading state during network switch', async () => {
    // Mock a promise that never resolves to keep loading state
    vi.mocked(switchToOptimismNetwork).mockImplementation(() => new Promise(() => {}));

    render(<NetworkWarningBanner />);
    
    // ✅ ENHANCED SPECIFICITY: Use role-based button selection
    const switchButton = screen.getByRole('button', { name: /switch to optimism/i });
    fireEvent.click(switchButton);

    // ✅ ENHANCED SPECIFICITY: Wait for exact loading text to appear
    await waitFor(() => {
      expect(screen.getByText('Switching...')).toBeInTheDocument();
    });
    
    // ✅ ENHANCED SPECIFICITY: Verify specific button is disabled, not just any button
    expect(switchButton).toBeDisabled();
    expect(switchButton).toHaveAttribute('disabled');
  });

  it('should show loading indicator with proper accessibility attributes', async () => {
    vi.mocked(switchToOptimismNetwork).mockImplementation(() => new Promise(() => {}));

    render(<NetworkWarningBanner />);
    
    const switchButton = screen.getByRole('button', { name: /switch to optimism/i });
    fireEvent.click(switchButton);

    // ✅ ENHANCED SPECIFICITY: Test both loading text and accessibility state
    await waitFor(() => {
      expect(screen.getByText('Switching...')).toBeInTheDocument();
      
      // ✅ ENHANCED SPECIFICITY: Verify specific button state and attributes
      expect(switchButton).toBeDisabled();
      expect(switchButton).toHaveAttribute('disabled');
      
      // ✅ ENHANCED SPECIFICITY: Ensure no other buttons are affected
      const allButtons = screen.getAllByRole('button');
      expect(allButtons).toHaveLength(1);
      expect(allButtons[0]).toBe(switchButton);
    });
  });

  it('should show error toast on network switch failure', async () => {
    vi.mocked(switchToOptimismNetwork).mockResolvedValue({
      success: false,
      error: 'Network switch failed'
    });

    render(<NetworkWarningBanner />);
    fireEvent.click(screen.getByText('Switch to Optimism'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network switch failed');
    });
  });

  it('should show default error message when no error message provided', async () => {
    vi.mocked(switchToOptimismNetwork).mockResolvedValue({
      success: false,
      error: undefined
    });

    render(<NetworkWarningBanner />);
    fireEvent.click(screen.getByText('Switch to Optimism'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to switch network');
    });
  });

  it('should handle unexpected errors during network switch', async () => {
    vi.mocked(switchToOptimismNetwork).mockRejectedValue(new Error('Unexpected error'));

    render(<NetworkWarningBanner />);
    fireEvent.click(screen.getByText('Switch to Optimism'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred while switching networks');
    });
  });

  it('should reset loading state after successful network switch', async () => {
    vi.mocked(switchToOptimismNetwork).mockResolvedValue({ success: true });

    render(<NetworkWarningBanner />);
    fireEvent.click(screen.getByText('Switch to Optimism'));

    await waitFor(() => {
      expect(screen.getByText('Switch to Optimism')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('should reset loading state after failed network switch', async () => {
    vi.mocked(switchToOptimismNetwork).mockResolvedValue({
      success: false,
      error: 'Network switch failed'
    });

    render(<NetworkWarningBanner />);
    fireEvent.click(screen.getByText('Switch to Optimism'));

    await waitFor(() => {
      expect(screen.getByText('Switch to Optimism')).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('should handle multiple rapid clicks correctly', async () => {
    let resolvePromise: (value: { success: boolean }) => void;
    const networkSwitchPromise = new Promise<{ success: boolean }>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(switchToOptimismNetwork).mockReturnValue(networkSwitchPromise);

    render(<NetworkWarningBanner />);
    
    // Click multiple times rapidly
    fireEvent.click(screen.getByText('Switch to Optimism'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    // Should only be called once due to disabled state
    expect(switchToOptimismNetwork).toHaveBeenCalledTimes(1);

    // Resolve the promise
    resolvePromise!({ success: true });
    
    await waitFor(() => {
      expect(screen.getByText('Switch to Optimism')).toBeInTheDocument();
    });
  });
});