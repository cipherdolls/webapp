// utils/fetchWithAuth.ts

import { redirect } from 'react-router';
import { apiUrl } from '~/constants';

/**
 * If you want to do a *second* check to confirm the token is invalid,
 * you can call this from inside fetchWithAuth if you get 401.
 * e.g. maybe your server returns 401 for reasons other than invalid token.
 */
async function verifyToken(): Promise<boolean> {
  try {
    const localToken = localStorage.getItem('token')?.replaceAll('"', '');
    if (!localToken) return false;

    const res = await fetch(`${apiUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localToken}`,
      },
    });

    // If 200 => token is still valid
    if (res.status === 200) {
      return true;
    }

    // If 401 => token invalid
    if (res.status === 401) {
      localStorage.removeItem('token');
      return false;
    }

    // Otherwise, some other error—treat as invalid
    return false;
  } catch (err) {
    console.error('Verify token error:', err);
    return false;
  }
}

/**
 * A convenience wrapper around fetch that:
 *   1) Checks for a token in localStorage (throwing redirect if missing)
 *   2) Attaches Authorization header
 *   3) If response is 401 or 403, optionally re-checks token validity,
 *      removes it, and throws redirect('/signin').
 */

export async function fetchWithAuthAndType<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(endpoint, options);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
  }

  return await res.json() as T;
}

// Generic function for paginated data fetching
export async function fetchPaginatedData<T>(
  endpoint: string, 
  searchParams: URLSearchParams, 
  page: number, 
  limit: number = 10
): Promise<T> {
  // Clone the search params and add pagination
  const queryParams = new URLSearchParams(searchParams);
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return fetchWithAuthAndType<T>(url);
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // 1) Check localStorage for a token
  const localToken = localStorage.getItem('token')?.replaceAll('"', '');
  if (!localToken) {
    const currentUrl = window.location.pathname + window.location.search;
    localStorage.setItem('redirectAfterSignIn', currentUrl);
    throw redirect('/signin');
  }

  // 2) Merge Authorization header with any custom headers
  const mergedHeaders: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${localToken}`,
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  // 3) Make the request
  const res = await fetch(`${apiUrl}/${endpoint}`, mergedOptions);

  if (res.status === 401) {
    const stillValid = await verifyToken();
    if (!stillValid) {
      localStorage.removeItem('token');
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterSignIn', currentUrl);
      throw redirect('/signin');
    }
  }

  // // If 403 => definitely unauthorized
  // if (res.status === 403) {
  //   localStorage.removeItem('token');
  //   throw redirect('/signin');
  // }

  // Return the response so the loader/action can continue
  return res;
}
