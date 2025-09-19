import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createFetchErrorHandler = (
  setToken: (token: string) => void,
  handleSuccessfulAuth: () => void
) => {
  return (fetcherData: any) => {
    if (fetcherData?.token) {
      setToken(fetcherData.token);
      handleSuccessfulAuth();
    }
    if (fetcherData?.error) {
      console.error('Sign-in error:', fetcherData.error);
    }
  };
};

describe('Fetch Error Handling', () => {
  let setToken: ReturnType<typeof vi.fn>;
  let handleSuccessfulAuth: ReturnType<typeof vi.fn>;
  let fetchErrorHandler: (fetcherData: any) => void;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setToken = vi.fn();
    handleSuccessfulAuth = vi.fn();
    fetchErrorHandler = createFetchErrorHandler(setToken, handleSuccessfulAuth);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('should call console.error when fetcher.data has error', () => {
    const fetcherData = { error: 'Authentication failed' };
    
    fetchErrorHandler(fetcherData);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Sign-in error:', 'Authentication failed');
  });

  it('should call setToken and handleSuccessfulAuth when fetcher.data has token', () => {
    const fetcherData = { token: 'valid-jwt-token' };
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).toHaveBeenCalledWith('valid-jwt-token');
    expect(handleSuccessfulAuth).toHaveBeenCalledTimes(1);
  });

  it('should not call anything when fetcher.data is null', () => {
    const fetcherData = null;
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not call anything when fetcher.data is undefined', () => {
    const fetcherData = undefined;
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle both token and error in same response', () => {
    const fetcherData = { token: 'some-token', error: 'Warning message' };
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).toHaveBeenCalledWith('some-token');
    expect(handleSuccessfulAuth).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Sign-in error:', 'Warning message');
  });

  it('should handle empty object', () => {
    const fetcherData = {};
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle falsy token value', () => {
    const fetcherData = { token: null };
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should handle falsy error value', () => {
    const fetcherData = { error: null };
    
    fetchErrorHandler(fetcherData);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should handle empty string token', () => {
    const fetcherData = { token: '' };
    
    fetchErrorHandler(fetcherData);
    
    expect(setToken).not.toHaveBeenCalled();
    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should handle empty string error', () => {
    const fetcherData = { error: '' };
    
    fetchErrorHandler(fetcherData);
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle complex error object', () => {
    const fetcherData = { error: { message: 'Complex error', code: 401 } };
    
    fetchErrorHandler(fetcherData);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Sign-in error:', { message: 'Complex error', code: 401 });
  });

  it('should call setToken with different token types', () => {
    const testCases = [
      { token: 'string-token' },
      { token: 12345 },
      { token: { jwt: 'object-token' } }
    ];

    testCases.forEach((fetcherData, index) => {
      fetchErrorHandler(fetcherData);
      expect(setToken).toHaveBeenNthCalledWith(index + 1, fetcherData.token);
      expect(handleSuccessfulAuth).toHaveBeenCalledTimes(index + 1);
    });
  });
});