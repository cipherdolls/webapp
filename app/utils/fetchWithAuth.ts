// utils/fetchWithAuth.ts

import { redirect } from "react-router";

const backendUrl = 'https://api.cipherdolls.com';

function getAuthTokenOrRedirect() {
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    // Throwing a redirect tells React Router 
    // to jump to /signin immediately
    throw redirect('/signin');
  }
  return localStorageToken.replaceAll('"', '');
}

/**
 * A convenience wrapper around fetch that:
 *  - Checks for a valid token or redirects
 *  - Merges in Authorization header
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getAuthTokenOrRedirect();

  // Merge your headers so you keep 'Content-Type' etc.
  const mergedHeaders: HeadersInit = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: mergedHeaders,
  };

  return fetch(`${backendUrl}/${endpoint}`, mergedOptions);
}
