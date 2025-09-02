import { useRouteLoaderData } from 'react-router';
import type { User } from '~/types';

/**
 * Type guard to check if data is a valid User object
 */
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' && 
    data !== null && 
    'id' in data && 
    'signerAddress' in data && 
    'role' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).role === 'string'
  );
}

/**
 * Hook to safely get current user from route loader data
 * Returns User object or null if not available/invalid
 */
export function useCurrentUser(): User | null {
  const data = useRouteLoaderData('routes/_main');
  
  if (isUser(data)) {
    return data;
  }
  
  return null;
}

/**
 * Hook to safely get current user with default fallback
 * Never returns null - provides safe defaults
 */
export function useCurrentUserWithDefaults(): User {
  const user = useCurrentUser();
  
  if (user) {
    return user;
  }
  
  // Safe defaults for when user data is unavailable
  return {
    id: '',
    name: 'Anonymous',
    weiBalance: '0',
    freeWeiBalance: '0',
    signerAddress: '',
    walletAddress: '',
    apikey: '',
    gender: null,
    role: 'USER',
    character: '',
    tokenBalance: 0,
    tokenAllowance: '0',
  };
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  const user = useCurrentUser();
  return user?.role === 'ADMIN' || false;
}