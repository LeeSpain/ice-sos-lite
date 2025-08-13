import * as React from 'react';
import type { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    let initialSessionLoaded = false;

    // Get initial session first with proper error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted && !initialSessionLoaded) {
          initialSessionLoaded = true;
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('✅ Initial session loaded:', session?.user?.id || 'no user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted && !initialSessionLoaded) {
          initialSessionLoaded = true;
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with proper guards
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'no user');
        
        // Skip INITIAL_SESSION to avoid double-setting from getInitialSession
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        // Only update state if we have a meaningful change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Handle email confirmation status
          if (session?.user && !session.user.email_confirmed_at) {
            console.log('⚠️ User email not confirmed:', session.user.email);
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};