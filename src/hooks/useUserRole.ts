import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'admin';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        console.log('👤 useUserRole: No user found');
        setRole(null);
        setLoading(false);
        return;
      }

      console.log('👤 useUserRole: Fetching role for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ useUserRole: Error fetching user role:', error);
          setRole('user'); // Default to user role on error
        } else if (!data) {
          console.warn('⚠️ useUserRole: No profile found for user, defaulting to user role');
          setRole('user');
        } else {
          const userRole = (data?.role as UserRole) || 'user';
          console.log('✅ useUserRole: Found role:', userRole);
          setRole(userRole);
        }
      } catch (error) {
        console.error('❌ useUserRole: Unexpected error:', error);
        setRole('user'); // Default to user role on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user'
  };
};