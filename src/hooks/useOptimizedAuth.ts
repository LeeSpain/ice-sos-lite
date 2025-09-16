import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedUserRole } from './useOptimizedData';
import { useMemo } from 'react';

export function useOptimizedAuth() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { data: role, isLoading: roleLoading } = useOptimizedUserRole();

  const isAdmin = useMemo(() => {
    return role === 'admin';
  }, [role]);
  
  const isUser = useMemo(() => role === 'user', [role]);
  
  // Optimize loading state - don't show loading if we have basic auth data
  const loading = authLoading || (roleLoading && !user);

  return {
    user,
    session,
    role: role || 'user', // Default to 'user' to prevent undefined states
    isAdmin,
    isUser,
    loading,
    signOut,
  };
}