import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clientAction } from '~/routes/_auth.signIn';
import { server } from '~/setupTests';
import { http, HttpResponse } from 'msw';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ========================
// SHARED MOCK SETUP (Network Layer Mocking with MSW)
// ========================

// Mock ethers with proper typing and factory functions
interface MockSigner {
  getAddress: ReturnType<typeof vi.fn>;
  signMessage: ReturnType<typeof vi.fn>;
}

interface MockProvider {
  getSigner: ReturnType<typeof vi.fn>;
}

const createMockSigner = (): MockSigner => ({
  getAddress: vi.fn(),
  signMessage: vi.fn(),
});

const createMockProvider = (signer: MockSigner): MockProvider => ({
  getSigner: vi.fn(() => signer),
});

// Create mock instances
const mockSigner = createMockSigner();
const mockProvider = createMockProvider(mockSigner);

vi.mock('ethers', () => ({
  ethers: {
    BrowserProvider: vi.fn(() => mockProvider),
  },
}));

// ========================
// SHARED HELPER FUNCTIONS (Data Factories & Test Utilities)
// ========================

/**
 * Creates a mock request object for clientAction
 */
const createMockRequest = (url: string = 'https://example.com/signin') => ({
  url,
});

/**
 * Creates mock client action arguments with proper typing
 */
const createMockClientActionArgs = (url?: string) => ({
  request: createMockRequest(url) as any,
  params: {},
  serverAction: async () => undefined,
});

/**
 * Sets up MSW handlers for successful authentication flow
 */
const setupSuccessfulAuthFlow = () => {
  server.use(
    http.get('https://api.cipherdolls.com/auth/nonce', () => {
      return HttpResponse.json({ nonce: 'test-nonce-123' });
    }),
    http.post('https://api.cipherdolls.com/auth/signin', () => {
      return HttpResponse.json({ token: 'test-jwt-token' });
    })
  );
};

/**
 * Sets up mock signer responses for successful flow
 */
const setupSuccessfulSignerMocks = (address = '0x1234567890abcdef', signature = '0xsigned-message') => {
  mockSigner.getAddress.mockResolvedValue(address);
  mockSigner.signMessage.mockResolvedValue(signature);
};

/**
 * Authentication flow assertion helpers
 */
const assertEIP191MessageFormat = {
  containsDomain: (domain: string) => {
    const signedMessage = mockSigner.signMessage.mock.calls[0][0];
    expect(signedMessage).toContain(`${domain} wants you to sign in`);
  },
  containsAddress: (address: string) => {
    const signedMessage = mockSigner.signMessage.mock.calls[0][0];
    expect(signedMessage).toContain(address);
  },
  isValidEIP191: () => {
    const signedMessage = mockSigner.signMessage.mock.calls[0][0];
    expect(signedMessage).toContain('wants you to sign in with your Ethereum account');
  },
};

const assertAuthResult = {
  hasToken: (expectedToken: string) => (result: any) => {
    expect(result).toEqual({ token: expectedToken });
  },
  hasError: () => (result: any) => {
    expect(result).toHaveProperty('error');
  },
  hasSpecificError: (expectedError: string) => (result: any) => {
    expect(result).toEqual({ error: expectedError });
  },
};

describe('ClientAction Authentication Flow - Behavior-Driven Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup window.ethereum environment
    window.ethereum = {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    };
    
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete window.ethereum;
  });

  describe('Successful Authentication Flow', () => {
    beforeEach(() => {
      setupSuccessfulAuthFlow();
      setupSuccessfulSignerMocks();
    });

    it('generates correct EIP-191 message format for domain verification', async () => {
      const args = createMockClientActionArgs('https://example.com/signin');
      
      await clientAction(args);
      
      assertEIP191MessageFormat.isValidEIP191();
      assertEIP191MessageFormat.containsDomain('example.com');
    });

    it('includes wallet address in authentication message', async () => {
      const walletAddress = '0x1234567890abcdef';
      setupSuccessfulSignerMocks(walletAddress);
      const args = createMockClientActionArgs('https://test.com/signin');
      
      await clientAction(args);
      
      assertEIP191MessageFormat.containsAddress(walletAddress);
    });

    it('customizes message for different domains', async () => {
      const args = createMockClientActionArgs('https://cipherdolls.com/signin');
      
      await clientAction(args);
      
      assertEIP191MessageFormat.containsDomain('cipherdolls.com');
    });

    it('returns JWT token on successful authentication', async () => {
      const args = createMockClientActionArgs();
      
      const result = await clientAction(args);
      
      assertAuthResult.hasToken('test-jwt-token')(result);
    });
  });

  describe('Network and API Error Handling', () => {
    beforeEach(() => {
      setupSuccessfulSignerMocks();
    });

    it('handles nonce service unavailability gracefully', async () => {
      server.use(
        http.get('https://api.cipherdolls.com/auth/nonce', () => HttpResponse.error())
      );
      const args = createMockClientActionArgs();

      const result = await clientAction(args);

      assertAuthResult.hasError()(result);
    });

    it('handles user rejection of wallet signature', async () => {
      server.use(
        http.get('https://api.cipherdolls.com/auth/nonce', () => {
          return HttpResponse.json({ nonce: 'test-nonce' });
        })
      );
      mockSigner.signMessage.mockRejectedValue(new Error('User denied message signature'));
      const args = createMockClientActionArgs();

      const result = await clientAction(args);

      assertAuthResult.hasSpecificError('User denied message signature')(result);
    });

    it('handles missing wallet extension gracefully', async () => {
      delete window.ethereum;
      const args = createMockClientActionArgs();

      const result = await clientAction(args);

      assertAuthResult.hasError()(result);
    });
  });
});