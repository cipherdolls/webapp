import { http, HttpResponse } from 'msw';
import { createMockUser } from '../test-utils';

export const handlers = [
  // Success scenarios
  http.get('/api/user', () => {
    return HttpResponse.json(createMockUser({ name: 'John Doe' }));
  }),

  http.get('/api/user/:id', ({ params }) => {
    return HttpResponse.json(
      createMockUser({
        id: params.id as string,
        name: `User ${params.id}`,
      })
    );
  }),

  // Error scenarios
  http.get('/api/user/error', () => {
    return HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),

  http.get('/api/user/server-error', () => {
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
  }),

  // Network error scenarios
  http.get('/api/user/network-error', () => {
    return HttpResponse.error();
  }),

  // Slow response scenario for loading tests
  http.get('/api/user/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return HttpResponse.json(createMockUser({ name: 'Slow User' }));
  }),

  // Adam default username scenario
  http.get('/api/user/adam', () => {
    return HttpResponse.json(createMockUser({ name: 'adam' }));
  }),
];