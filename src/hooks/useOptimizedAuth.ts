import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedUserRole } from './useOptimizedData';
import { useMemo } from 'react';

export function useOptimizedAuth() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { data: role, isLoading: roleLoading } = useOptimizedUserRole();

  const isAdmin = useMemo(() => role === 'admin', [role]);
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