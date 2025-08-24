import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetworkWarningBanner } from '~/components/NetworkWarningBanner';

// Mock dependencies
vi.mock('~/utils/networkUtils', () => ({
  switchToOptimismNetwork: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('NetworkWarningBanner self-contained functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render warning message and switch button', () => {
    render(<NetworkWarningBanner />);
    
    expect(screen.getByText('Wrong Network Detected')).toBeInTheDocument();
    expect(screen.getByText('Switch to Optimism')).toBeInTheDocument();
  });

  it('should render the warning icon', () => {
    render(<NetworkWarningBanner />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should render the explanatory text', () => {
    render(<NetworkWarningBanner />);
    
    expect(screen.getByText(/You need to be on the Optimism network/)).toBeInTheDocument();
    expect(screen.getByText(/Please switch your network to continue/)).toBeInTheDocument();
  });

  it('should render switch button in default state', () => {
    render(<NetworkWarningBanner />);
    
    const switchButton = screen.getByRole('button', { name: /Switch to Optimism/i });
    expect(switchButton).toBeInTheDocument();
    expect(switchButton).not.toBeDisabled();
  });
});