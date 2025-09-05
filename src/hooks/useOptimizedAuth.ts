import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedUserRole } from './useOptimizedData';
import { useMemo } from 'react';

export function useOptimizedAuth() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { data: role, isLoading: roleLoading, error: roleError } = useOptimizedUserRole();

  console.log('🔧 useOptimizedAuth Debug:', {
    user: user?.id || 'none',
    userEmail: user?.email,
    role,
    authLoading,
    roleLoading,
    roleError: roleError?.message,
    timestamp: new Date().toISOString()
  });

  const isAdmin = useMemo(() => {
    const adminStatus = role === 'admin';
    console.log('🔧 Admin check:', { role, isAdmin: adminStatus });
    return adminStatus;
  }, [role]);
  
  const isUser = useMemo(() => role === 'user', [role]);
  const loading = authLoading || roleLoading;

  return {
    user,
    session,
    role,
    isAdmin,
    isUser,
    loading,
    signOut,
  };
}