import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const createTokenConnectionLogic = (
  connected: boolean,
  token: string | undefined,
  handleSuccessfulAuth: () => void
) => {
  return () => {
    if (connected === true && token !== undefined) {
      handleSuccessfulAuth();
    }
  };
};

describe('Token + Connection Logic', () => {
  let handleSuccessfulAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleSuccessfulAuth = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call handleSuccessfulAuth when connected is true and token exists', () => {
    const connected = true;
    const token = 'valid-jwt-token';

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).toHaveBeenCalledTimes(1);
  });

  it('should not call handleSuccessfulAuth when connected is false', () => {
    const connected = false;
    const token = 'valid-jwt-token';

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should not call handleSuccessfulAuth when token is undefined', () => {
    const connected = true;
    const token = undefined;

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should not call handleSuccessfulAuth when both connected is false and token is undefined', () => {
    const connected = false;
    const token = undefined;

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });

  it('should call handleSuccessfulAuth when token is null (null !== undefined)', () => {
    const connected = true;
    const token = null as any;

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).toHaveBeenCalledTimes(1);
  });

  it('should not call handleSuccessfulAuth when token is empty string', () => {
    const connected = true;
    const token = '';

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).toHaveBeenCalledTimes(1);
  });

  it('should call handleSuccessfulAuth when connected is exactly true (not truthy)', () => {
    const connected = 1 as any;
    const token = 'valid-token';

    const tokenConnectionLogic = createTokenConnectionLogic(connected, token, handleSuccessfulAuth);
    tokenConnectionLogic();

    expect(handleSuccessfulAuth).not.toHaveBeenCalled();
  });
});