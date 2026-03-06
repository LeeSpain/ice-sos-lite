import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import useRateLimit from '@/hooks/useRateLimit';
import { PageSEO } from '@/components/PageSEO';
import { logSecurityEvent } from '@/utils/security';

type AuthMode = 'signin' | 'reset';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    isRateLimited,
    recordAttempt,
    getRemainingTime,
    reset: resetRateLimit
  } = useRateLimit('auth-attempts', { maxAttempts: 5, windowMs: 15 * 60 * 1000 });

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRateLimited()) {
      setError(`Too many attempts. Please wait ${getRemainingTime()} seconds.`);
      return;
    }

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password,
      });

      if (error) {
        recordAttempt();
        logSecurityEvent('signin_failure', {
          email: emailTrimmed,
          error: error.message,
          timestamp: new Date().toISOString(),
          ip_address: 'client_side',
          source: 'auth_page'
        });
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('invalid login') || msg.includes('invalid_credentials') || msg.includes('invalid credentials')) {
          setError('Incorrect email or password. Please try again, or use "Forgot password?" below.');
        } else if (msg.includes('email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.');
        } else {
          setError(error.message || 'Failed to sign in. Please try again.');
        }
        return;
      }

      if (data.user) {
        setSuccess('Sign in successful! Redirecting...');
        resetRateLimit();
        logSecurityEvent('signin_success', {
          user_id: data.user.id,
          email: data.user.email,
          timestamp: new Date().toISOString(),
          ip_address: 'client_side',
          source: 'auth_page'
        });

        const nextUrl = searchParams.get('next');
        const planParam = searchParams.get('plan');
        let redirectTo = '/dashboard';
        if (nextUrl) {
          redirectTo = nextUrl;
          if (planParam) {
            redirectTo += `${nextUrl.includes('?') ? '&' : '?'}plan=${planParam}`;
          }
        }

        setTimeout(() => navigate(redirectTo), 800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isRateLimited, getRemainingTime, recordAttempt, resetRateLimit, navigate, searchParams]);

  const handlePasswordReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      setSuccess('Password reset email sent! Check your inbox and follow the link to reset your password.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user && window.location.pathname !== '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <PageSEO pageType="auth" />
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {mode === 'signin' ? 'Welcome Back' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin'
                ? 'Sign in to your ICE SOS account'
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting || isRateLimited()}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                {isRateLimited() && (
                  <p className="text-sm text-muted-foreground text-center">
                    Too many attempts. Try again in {getRemainingTime()} seconds.
                  </p>
                )}

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-muted-foreground"
                    onClick={() => switchMode('reset')}
                  >
                    Forgot password?
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-muted-foreground"
                    onClick={() => switchMode('signin')}
                  >
                    Back to sign in
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button asChild variant="link" className="p-0 h-auto font-medium">
                  <Link to="/ai-register">Register here</Link>
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuthPage;