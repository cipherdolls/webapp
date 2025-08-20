import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockNavigate = vi.fn();
const mockGetItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: mockGetItem,
    removeItem: mockRemoveItem,
  },
  writable: true,
});

const createHandleSuccessfulAuth = (hasNavigated: boolean, setHasNavigated: (value: boolean) => void) => {
  return () => {
    if (hasNavigated) return;

    setHasNavigated(true);
    const redirectUrl = localStorage.getItem('redirectAfterSignIn');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterSignIn');
      mockNavigate(redirectUrl);
    } else {
      mockNavigate('/');
    }
  };
};

describe('handleSuccessfulAuth', () => {
  let hasNavigated: boolean;
  let setHasNavigated: ReturnType<typeof vi.fn>;
  let handleSuccessfulAuth: () => void;

  beforeEach(() => {
    hasNavigated = false;
    setHasNavigated = vi.fn();
    handleSuccessfulAuth = createHandleSuccessfulAuth(hasNavigated, setHasNavigated);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return early when hasNavigated is true', () => {
    hasNavigated = true;
    handleSuccessfulAuth = createHandleSuccessfulAuth(hasNavigated, setHasNavigated);

    handleSuccessfulAuth();

    expect(setHasNavigated).not.toHaveBeenCalled();
    expect(mockGetItem).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to redirectUrl and remove from localStorage when redirectUrl exists', () => {
    const testRedirectUrl = '/dashboard';
    mockGetItem.mockReturnValue(testRedirectUrl);

    handleSuccessfulAuth();

    expect(setHasNavigated).toHaveBeenCalledWith(true);
    expect(mockGetItem).toHaveBeenCalledWith('redirectAfterSignIn');
    expect(mockRemoveItem).toHaveBeenCalledWith('redirectAfterSignIn');
    expect(mockNavigate).toHaveBeenCalledWith(testRedirectUrl);
  });

  it('should navigate to home when redirectUrl does not exist', () => {
    mockGetItem.mockReturnValue(null);

    handleSuccessfulAuth();

    expect(setHasNavigated).toHaveBeenCalledWith(true);
    expect(mockGetItem).toHaveBeenCalledWith('redirectAfterSignIn');
    expect(mockRemoveItem).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should cleanup localStorage correctly when redirectUrl exists', () => {
    const testRedirectUrl = '/profile';
    mockGetItem.mockReturnValue(testRedirectUrl);

    handleSuccessfulAuth();

    expect(mockGetItem).toHaveBeenCalledTimes(1);
    expect(mockGetItem).toHaveBeenCalledWith('redirectAfterSignIn');
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('redirectAfterSignIn');
    expect(mockGetItem).toHaveBeenCalledBefore(mockRemoveItem);
  });
});