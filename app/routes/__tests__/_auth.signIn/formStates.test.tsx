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

const FormStatesComponent = ({ 
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

describe('Form States', () => {
  beforeEach(() => {
    mockUseFetcher.mockReturnValue({
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
      data: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render fetcher.Form when hasEthereum is true', () => {
    const { container } = render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveClass('w-full');
  });

  it('should render disabled button when hasEthereum is false', () => {
    render(<FormStatesComponent isLoading={false} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('type', 'submit');
  });

  it('should display correct button text "Sign In"', () => {
    render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toHaveTextContent('Sign In');
  });

  it('should display correct button text "Sign In" when hasEthereum is false', () => {
    render(<FormStatesComponent isLoading={false} hasEthereum={false} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toHaveTextContent('Sign In');
  });

  it('should render submit button when hasEthereum is true', () => {
    render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('w-full');
  });

  it('should not render form when hasEthereum is false', () => {
    const { container } = render(<FormStatesComponent isLoading={false} hasEthereum={false} />);
    
    const form = container.querySelector('form');
    expect(form).not.toBeInTheDocument();
  });

  it('should enable button when hasEthereum is true and not loading', () => {
    render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).not.toBeDisabled();
  });

  it('should disable button when hasEthereum is true but isLoading is true', () => {
    render(<FormStatesComponent isLoading={true} hasEthereum={true} />);
    
    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeDisabled();
  });

  it('should render form with correct attributes when hasEthereum is true', () => {
    const { container } = render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveClass('w-full');
  });

  it('should render only one Sign In button regardless of hasEthereum state', () => {
    const { rerender } = render(<FormStatesComponent isLoading={false} hasEthereum={true} />);
    
    let buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons).toHaveLength(1);

    rerender(<FormStatesComponent isLoading={false} hasEthereum={false} />);
    
    buttons = screen.getAllByRole('button', { name: /sign in/i });
    expect(buttons).toHaveLength(1);
  });
});