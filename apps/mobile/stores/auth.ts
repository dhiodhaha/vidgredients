import { authClient } from '../lib/auth-client';

// Re-export the Better Auth client hooks and methods
export const { useSession, signIn, signUp, signOut, getCookie } = authClient;

// Helper to check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: session, isPending } = useSession();
  return {
    isAuthenticated: !!session?.user,
    isPending,
    user: session?.user,
    session: session?.session,
  };
};

// Type exports for convenience
export type { Session, User } from 'better-auth/types';
