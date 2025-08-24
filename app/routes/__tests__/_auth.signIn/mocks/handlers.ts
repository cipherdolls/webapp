import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Auth verify endpoint - Token verification
  http.post('http://localhost:3000/auth/verify', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Test scenarios based on token values
    if (token === 'valid-token' || token === 'quoted-token' || token === 'token-with-quotes') {
      return HttpResponse.json({ message: 'Token valid' }, { status: 200 });
    }

    if (token === 'invalid-token') {
      return HttpResponse.json({ message: 'Token invalid' }, { status: 401 });
    }

    if (token === 'undefined' || !token) {
      return HttpResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // Default success for other test cases
    return HttpResponse.json({ message: 'Token valid' }, { status: 200 });
  }),

  // Auth signin endpoint - For signin tests
  http.post('http://localhost:3000/auth/signin', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate different response scenarios
    if (body?.email === 'test@example.com') {
      return HttpResponse.json({
        token: 'success-token',
        user: { id: 1, email: 'test@example.com' }
      }, { status: 200 });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Auth signout endpoint
  http.post('http://localhost:3000/auth/signout', () => {
    return HttpResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  }),

  // Auth refresh endpoint
  http.post('http://localhost:3000/auth/refresh', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.includes('valid')) {
      return HttpResponse.json({
        token: 'new-refreshed-token'
      }, { status: 200 });
    }

    return HttpResponse.json({ message: 'Refresh token invalid' }, { status: 401 });
  }),
];