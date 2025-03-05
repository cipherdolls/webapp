// utils/fetchWithAuth.ts

import { redirect } from "react-router";

const backendUrl = 'https://api.cipherdolls.com';

function getAuthTokenOrRedirect() {
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    throw redirect('/signin');
  }
  return localStorageToken.replaceAll('"', '');
}

/**
 * Wrapper around fetch that injects Authorization header
 * and automatically redirects if no token is found.
 */
export async function fetchWithAuth(
  endpoint: string, 
  options?: RequestInit // optional: you can make it more typed
) {
  const token = getAuthTokenOrRedirect();
  const mergedOptions: RequestInit = {
    // Provide defaults, then merge
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {})
    },
    ...options,
  };

  const res = await fetch(`${backendUrl}/${endpoint}`, mergedOptions);

  return res;
}
