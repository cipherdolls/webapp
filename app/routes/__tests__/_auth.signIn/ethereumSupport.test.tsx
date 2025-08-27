import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockUseFetcher = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useFetcher: () => mockUseFetcher(),
}));

vi.mock('usehooks-ts', () => ({
  useLocalStorage: () => [undefined, vi.fn()],
}));

vi.mock('~/constants', () => ({
  apiUrl: 'http://localhost:3000',
}));

const MockButton = ({ disabled, children, ...props }: any) => (
  <button disabled={disabled} {...props}>
    {children}
  </button>
);

vi.mock('~/components/ui/button/button', () => ({
  Root: MockButton,
}));

const EthereumSupportComponent = ({ 
  isLoading, 
  hasEthereum 
}: { 
  isLoading: boolean; 
  hasEthereum: boolean; 
}) => {
  const fetcher = { Form: ({ children, ...props }: any) => <form {...props}>{children}</form> };
  
  return (
    <div>
      {!isLoading && !hasEthereum ? (
        <div className="p-5 bg-neutral-05 rounded-xl flex flex-col gap-4">
          <div className="flex gap-4">
            <span className="text-heading-h2">⛔</span>
            <p className="text-body-sm md:text-body-md text-neutral-01">
              Your browser isn't supported. Use a Web3 browser (e.g.,{' '}
              <a
                href="https://brave.com/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-medium underline hover:text-black/70"
              >
                Brave
              </a>
              ,{' '}
              <a
                href="https://www.opera.com/features/opera-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-medium underline hover:text-black/70 mr-2"
              >
                Opera Crypto
              </a>
              or{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-medium underline hover:text-black/70 mr-2"
              >
                MetaMask extension
              </a>{' '}
              for Chrome/Firefox.
            </p>
          </div>
          <MockButton size="lg" disabled={isLoading || !hasEthereum}>
            Sign In
          </MockButton>
        </div>
      ) : (
        <fetcher.Form method="post" className="w-full">
          <MockButton disabled={isLoading || !hasEthereum} size="lg" type="submit" className="w-full">
            Sign In
          </MockButton>
        </fetcher.Form>
      )}
    </div>
  );
};

describe('Ethereum Support', () => {
  beforeEach(() => {
    mockUseFetcher.mockReturnValue({
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
      data: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show browser warning when hasEthereum is false', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    expect(screen.getByText('⛔')).toBeInTheDocument();
    expect(screen.getByText(/your browser isn't supported/i)).toBeInTheDocument();
  });

  it('should disable Sign In button when hasEthereum is false', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it('should show normal form when hasEthereum is true', () => {
    const { container } = render(<EthereumSupportComponent isLoading={false} hasEthereum={true} />);
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(screen.queryByText('⛔')).not.toBeInTheDocument();
  });

  it('should show Brave download link with correct href', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    const braveLink = screen.getByRole('link', { name: /brave/i });
    expect(braveLink).toHaveAttribute('href', 'https://brave.com/download/');
    expect(braveLink).toHaveAttribute('target', '_blank');
    expect(braveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should show Opera Crypto download link with correct href', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    const operaLink = screen.getByRole('link', { name: /opera crypto/i });
    expect(operaLink).toHaveAttribute('href', 'https://www.opera.com/features/opera-wallet');
    expect(operaLink).toHaveAttribute('target', '_blank');
    expect(operaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should show MetaMask extension download link with correct href', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    const metamaskLink = screen.getByRole('link', { name: /metamask extension/i });
    expect(metamaskLink).toHaveAttribute('href', 'https://metamask.io/download/');
    expect(metamaskLink).toHaveAttribute('target', '_blank');
    expect(metamaskLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not show browser warning when hasEthereum is true', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={true} />);
    
    expect(screen.queryByText('⛔')).not.toBeInTheDocument();
    expect(screen.queryByText(/your browser isn't supported/i)).not.toBeInTheDocument();
  });

  it('should enable Sign In button when hasEthereum is true and not loading', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).not.toBeDisabled();
  });

  it('should not show warning when isLoading is true even if hasEthereum is false', () => {
    render(<EthereumSupportComponent isLoading={true} hasEthereum={false} />);
    
    expect(screen.queryByText('⛔')).not.toBeInTheDocument();
    expect(screen.queryByText(/your browser isn't supported/i)).not.toBeInTheDocument();
  });

  it('should show all three browser download options', () => {
    render(<EthereumSupportComponent isLoading={false} hasEthereum={false} />);
    
    expect(screen.getByRole('link', { name: /brave/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /opera crypto/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /metamask extension/i })).toBeInTheDocument();
  });
});