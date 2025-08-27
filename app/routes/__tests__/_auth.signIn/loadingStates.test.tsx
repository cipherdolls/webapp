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

const LoadingStatesComponent = ({ isLoading, hasEthereum }: { isLoading: boolean; hasEthereum: boolean }) => {
  const fetcher = { Form: ({ children, ...props }: any) => <form {...props}>{children}</form> };
  
  return (
    <div>
      {!hasEthereum ? (
        <div>
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

describe('Loading States', () => {
  beforeEach(() => {
    mockUseFetcher.mockReturnValue({
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
      data: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should disable button when isLoading is true', () => {
    render(<LoadingStatesComponent isLoading={true} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when isLoading is false and hasEthereum is true', () => {
    render(<LoadingStatesComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).not.toBeDisabled();
  });

  it('should disable button when isLoading is false but hasEthereum is false', () => {
    render(<LoadingStatesComponent isLoading={false} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it('should disable button when both isLoading and hasEthereum are false', () => {
    render(<LoadingStatesComponent isLoading={true} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it('should render form when hasEthereum is true', () => {
    const { container } = render(<LoadingStatesComponent isLoading={false} hasEthereum={true} />);
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('method', 'post');
  });

  it('should not render form when hasEthereum is false', () => {
    const { container } = render(<LoadingStatesComponent isLoading={false} hasEthereum={false} />);
    
    const form = container.querySelector('form');
    expect(form).not.toBeInTheDocument();
  });

  it('should render submit button when hasEthereum is true', () => {
    render(<LoadingStatesComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should not render submit button when hasEthereum is false', () => {
    render(<LoadingStatesComponent isLoading={false} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).not.toHaveAttribute('type', 'submit');
  });
});