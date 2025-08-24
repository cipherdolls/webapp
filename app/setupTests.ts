import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupServer } from 'msw/node';

// Import all handlers from different test suites
import { handlers } from './routes/__tests__/_main._general._index/mocks/handlers';
import { authHandlers } from './routes/__tests__/_auth.signIn/mocks/handlers';

expect.extend(matchers);

// Combine all handlers into single server
const allHandlers = [
  ...handlers,
  ...authHandlers,
];

const server = setupServer(...allHandlers);

// Export server for per-test overrides
export { server };

// MSW server setup - Global for all test suites
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => []),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
