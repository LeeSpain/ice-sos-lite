import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TermsDialog } from '@/components/legal/TermsDialog';
import { PrivacyDialog } from '@/components/legal/PrivacyDialog';
import useRateLimit from '@/hooks/useRateLimit';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  
  // Rate limiting for auth attempts
  const {
    isRateLimited,
    recordAttempt,
    getRemainingTime,
    reset: resetRateLimit
  } = useRateLimit('auth-attempts', { maxAttempts: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 minutes

  console.log('🔐 AuthPage render:', { 
    hasUser: !!user, 
    loading, 
    isSubmitting,
    path: window.location.pathname 
  });

  // Redirect if already authenticated
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

  if (user) {
    return <Navigate to="/dashboard-redirect" replace />;
  }

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited()) {
      setError(`Too many attempts. Please wait ${getRemainingTime()} seconds.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        recordAttempt();
        throw error;
      }

      if (data.user) {
        setSuccess('Sign in successful! Redirecting...');
        resetRateLimit();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isRateLimited, getRemainingTime, recordAttempt, resetRateLimit]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    
    if (isRateLimited()) {
      setError(`Too many attempts. Please wait ${getRemainingTime()} seconds.`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        recordAttempt();
        throw error;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          setSuccess('Account created successfully! Redirecting...');
          resetRateLimit();
        } else {
          setSuccess('Please check your email to confirm your account before signing in.');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, acceptTerms, isRateLimited, getRemainingTime, recordAttempt, resetRateLimit]);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
    setAcceptTerms(false);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" onClick={clearMessages}>Sign In</TabsTrigger>
                <TabsTrigger value="signup" onClick={clearMessages}>Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
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
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || isRateLimited()}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                  
                  {isRateLimited() && (
                    <p className="text-sm text-muted-foreground text-center">
                      Too many attempts. Try again in {getRemainingTime()} seconds.
                    </p>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptTerms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        disabled={isSubmitting}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="acceptTerms"
                          className="text-sm font-normal leading-relaxed cursor-pointer"
                        >
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsDialog(true)}
                            className="text-primary hover:underline font-medium"
                            disabled={isSubmitting}
                          >
                            Terms of Service
                          </button>{" "}
                          and{" "}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyDialog(true)}
                            className="text-primary hover:underline font-medium"
                            disabled={isSubmitting}
                          >
                            Privacy Policy
                          </button>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
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
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || isRateLimited() || !acceptTerms}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  {isRateLimited() && (
                    <p className="text-sm text-muted-foreground text-center">
                      Too many attempts. Try again in {getRemainingTime()} seconds.
                    </p>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Legal Dialogs */}
      <TermsDialog 
        open={showTermsDialog} 
        onOpenChange={setShowTermsDialog}
      />
      <PrivacyDialog 
        open={showPrivacyDialog} 
        onOpenChange={setShowPrivacyDialog}
      />
    </>
  );
};

export default AuthPage;