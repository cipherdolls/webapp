import { vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import type { RenderOptions, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { User, Chat, AvatarsPaginated } from '~/types';
import type { ReactElement, ReactNode } from 'react';
// Import global MSW server from setupTests
import { server } from '../../../setupTests';

// ========================
// QUERY CLIENT UTILITIES
// ========================

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,        // Test'lerde retry kapalı
        gcTime: Infinity,    // v5'te gcTime (cacheTime yerine)
        staleTime: 0,        // Her zaman stale (refetch için)
      },
      mutations: {
        retry: false,
      },
    },
    // ⚠️ v5'te logger property'si kaldırıldı - varsayılan console logging kullanılıyor
  });
}

export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    ...options,
  });
}

export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

// ========================
// MSW UTILITIES
// ========================

/**
 * MSW server instance for tests
 */
export { server };

/**
 * renderHook with Query wrapper
 */
export function renderHookWithQuery<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {};
  const client = queryClient || createTestQueryClient();
  
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    ),
    ...renderOptions,
  });
}

// ========================
// MOCK FACTORY FUNCTIONS
// ========================

/**
 * Creates a mock User object with proper typing
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${Math.random().toString(36).substring(2, 11)}`, // ✅ substr() deprecated - substring() kullan
  name: 'John Doe',
  signerAddress: '0x123456789',
  gender: 'Male',
  weiBalance: '0',
  freeWeiBalance: '0',
  walletAddress: '0x123456789',
  apikey: 'test-api-key',
  role: 'user',
  character: 'Test character description',
  tokenBalance: 100,
  ...overrides,
});

/**
 * Creates a mock Chat object with proper typing - using unknown for flexibility
 */
export const createMockChat = (overrides: any = {}): Chat => ({
  id: `chat-${Math.random().toString(36).substring(2, 11)}`,
  userId: 'user-123',
  avatar: {
    id: 'avatar-123',
    name: 'Test Avatar',
  },
  scenario: {
    name: 'Test Scenario',
  },
  updatedAt: new Date().toISOString(),
  chatCompletionJobs: [],
  doll: null,
  _count: { chatCompletionJobs: 0 },
  ...overrides,
} as unknown as Chat);

/**
 * Creates a mock Avatar object with proper typing
 */
export const createMockAvatar = (overrides: any = {}) => ({
  id: `avatar-${Math.random().toString(36).substring(2, 11)}`,
  name: 'Test Avatar',
  shortDesc: 'Test avatar description',
  picture: 'https://example.com/avatar.jpg',
  character: 'Test character description',
  ttsVoiceId: 'voice-123',
  userId: 'user-123',
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a mock Scenario object with proper typing
 */
export const createMockScenario = (overrides: any = {}) => ({
  id: `scenario-${Math.random().toString(36).substring(2, 11)}`,
  name: 'Test Scenario',
  introduction: 'Test scenario introduction',
  systemMessage: 'You are a helpful assistant',
  picture: 'https://example.com/scenario.jpg',
  temperature: 0.7,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  chatModel: 'gpt-4',
  embeddingModel: 'text-embedding-ada-002',
  userId: 'user-123',
  recommended: false,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  chats: [],
  ...overrides,
});

/**
 * Creates a mock ScenariosPaginated object with proper typing
 */
export const createMockScenariosPaginated = (overrides: any = {}) => ({
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  ...overrides,
});

/**
 * Creates a mock AvatarsPaginated object with proper typing
 */
export const createMockAvatarsPaginated = (overrides: Partial<AvatarsPaginated> = {}): AvatarsPaginated => ({
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  ...overrides,
});

/**
 * Creates a mock UseQueryResult for useUser hook with proper state consistency
 * Using type assertion to bypass TypeScript's strict mutual exclusive constraints for testing
 */
export const createMockUseUserResult = (overrides: any = {}): UseQueryResult<User, Error> => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as User),
    refetch: vi.fn(),
  };

  // Apply overrides with type assertion for testing flexibility
  return { ...baseResult, ...overrides } as UseQueryResult<User, Error>;
};

/**
 * Creates a mock UseQueryResult for useChats hook with proper state consistency
 */
export const createMockUseChatsResult = (overrides: any = {}): UseQueryResult<Chat[], Error> => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as Chat[]),
    refetch: vi.fn(),
  };

  return { ...baseResult, ...overrides } as UseQueryResult<Chat[], Error>;
};

/**
 * Creates a mock UseQueryResult for useAvatars hook with proper state consistency
 */
export const createMockUseAvatarsResult = (overrides: any = {}): UseQueryResult<AvatarsPaginated, Error> => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as AvatarsPaginated),
    refetch: vi.fn(),
  };

  return { ...baseResult, ...overrides } as UseQueryResult<AvatarsPaginated, Error>;
};

/**
 * Creates a mock UseQueryResult for useScenarios hook with proper state consistency
 */
export const createMockUseScenariosResult = (overrides: any = {}) => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as any),
    refetch: vi.fn(),
  };
  return { ...baseResult, ...overrides } as any;
};

/**
 * Creates a mock UseQueryResult for useTtsVoices hook with proper state consistency
 */
export const createMockUseTtsVoicesResult = (overrides: any = {}) => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as any),
    refetch: vi.fn(),
  };
  return { ...baseResult, ...overrides } as any;
};

/**
 * Creates a mock TtsVoice object with proper typing
 */
export const createMockTtsVoice = (overrides: any = {}) => ({
  id: `voice-${Math.random().toString(36).substring(2, 11)}`,
  name: 'Test Voice',
  model: 'test-model',
  ttsProviderId: 'provider-123',
  ttsProvider: {
    id: 'provider-123',
    name: 'Test Provider',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a mock UseInfiniteQueryResult for useInfiniteAvatars hook with proper state consistency
 * Using type assertion to bypass TypeScript's strict mutual exclusive constraints for testing
 */
export const createMockUseInfiniteAvatarsResult = (overrides: any = {}) => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    fetchNextPage: vi.fn(),
    fetchPreviousPage: vi.fn(),
    hasNextPage: false,
    hasPreviousPage: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    promise: Promise.resolve(undefined as unknown as any),
    refetch: vi.fn(),
  };
  return { ...baseResult, ...overrides } as any;
};

/**
 * Creates a mock TokenPermit object with proper typing
 */
export const createMockTokenPermit = (overrides: any = {}) => ({
  id: `token-permit-${Math.random().toString(36).substring(2, 11)}`,
  owner: '0x123456789abcdef',
  spender: '0xfedcba987654321',
  value: '1000000000000000000', // 1 ether in wei
  nonce: '0',
  deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  v: 27,
  r: '0x' + 'a'.repeat(64),
  s: '0x' + 'b'.repeat(64),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-123',
  txHash: '0x' + 'c'.repeat(64),
  ...overrides,
});

/**
 * Creates a mock TokenPermitsPaginated object with proper typing
 */
export const createMockTokenPermitsPaginated = (overrides: any = {}) => ({
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  ...overrides,
});

/**
 * Creates a mock UseQueryResult for useTokenPermits hook with proper state consistency
 */
export const createMockUseTokenPermitsResult = (overrides: any = {}) => {
  const baseResult = {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    isLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isInitialLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isEnabled: true,
    promise: Promise.resolve(undefined as unknown as any),
    refetch: vi.fn(),
  };
  return { ...baseResult, ...overrides } as any;
};

/**
 * Creates a mock mutation result for useUpdateUser with proper typing
 */
export const createMockUseUpdateUserResult = (overrides: any = {}) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  status: 'idle' as const,
  submittedAt: 0,
  reset: vi.fn(),
  ...overrides,
});

/**
 * Creates a mock mutation result for useRefreshTokenBalance with proper typing
 */
export const createMockUseRefreshTokenBalanceResult = (overrides: any = {}) => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  status: 'idle' as const,
  submittedAt: 0,
  reset: vi.fn(),
  ...overrides,
});

// ========================
// MOCK COMPONENTS
// ========================

/**
 * Standard UserEditModal mock component
 */
export const createMockUserEditModal = () => ({
  default: ({ me, open, onOpenChange }: {
    me: User;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="user-edit-modal" data-open={open} data-user-name={me?.name}>
      User Edit Modal for {me?.name}
      <button data-testid="close-modal" onClick={() => onOpenChange && onOpenChange(false)}>
        Close Modal
      </button>
    </div>
  ),
});

/**
 * Standard Icons mock
 */
export const createMockIcons = () => ({
  Icons: {
    pen: () => <svg data-testid="pen-icon" />,
  },
});

// ========================
// STANDARD RENDER FUNCTION
// ========================

// renderDashboardBanner function removed - use renderWithQuery + JSX directly in test files
// Example:
// renderWithQuery(
//   <DashboardBanner 
//     variant="welcome"
//     description="Test description"
//     showEditLink={false}
//   />
// );