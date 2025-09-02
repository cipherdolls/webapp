// utils/fetchWithAuth.ts

import { redirect } from 'react-router';
import { apiUrl, ROUTES } from '~/constants';
import { getToken, useAuthStore } from '~/store/useAuthStore';

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
  // 1) Check for token using auth store
  const token = getToken();
  if (!token) {
    const params = new URLSearchParams(window.location.search);
    const referral = params.get('referral');
    if (referral) {
      localStorage.setItem('referralId', referral);
      throw redirect(`${ROUTES.signIn}?invitedBy=${referral}`);
    }

    const currentUrl = window.location.pathname + window.location.search;
    localStorage.setItem('redirectAfterSignIn', currentUrl);
    throw redirect(ROUTES.signIn);
  }

  // 2) Merge Authorization header with any custom headers
  const mergedHeaders: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  // 3) Make the request
  const res = await fetch(`${apiUrl}/${endpoint}`, mergedOptions);

  if (res.status === 401) {
    // Use auth store's verifyToken method
    const { verifyToken } = useAuthStore.getState();
    const stillValid = await verifyToken();
    if (!stillValid) {
      const currentUrl = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterSignIn', currentUrl);
      throw redirect(ROUTES.signIn);
    }
  }

  // Return the response so the loader/action can continue
  return res;
}
