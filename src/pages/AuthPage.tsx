import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useSearchParams } from 'react-router-dom';
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
import { PageSEO } from '@/components/PageSEO';
import { validatePasswordStrength, logSecurityEvent } from '@/utils/security';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // Rate limiting for auth attempts
  const {
    isRateLimited,
    recordAttempt,
    getRemainingTime,
    reset: resetRateLimit
  } = useRateLimit('auth-attempts', { maxAttempts: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 minutes

  console.log('🔐 AuthPage render:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading, 
    isSubmitting,
    path: window.location.pathname,
    href: window.location.href
  });

  // Redirect if already authenticated, unless they're specifically trying to signup
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

  // Only redirect logged-in users if they're not explicitly on the auth page
  const isSignupIntent = searchParams.get('tab') === 'signup';
  const isExplicitAuthVisit = window.location.pathname === '/auth';
  
  // Don't redirect if user explicitly navigated to /auth (let them see they're logged in)
  if (user && !isSignupIntent && !isExplicitAuthVisit) {
    return <Navigate to="/dashboard" replace />;
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
        // Log failed sign in attempt
        setTimeout(() => {
          logSecurityEvent('signin_failure', {
            email: email.trim(),
            error: error.message,
            timestamp: new Date().toISOString(),
            ip_address: 'client_side',
            source: 'auth_page'
          });
        }, 0);
        throw error;
      }

      if (data.user) {
        setSuccess('Sign in successful! Redirecting...');
        resetRateLimit();
        // Log successful sign in
        setTimeout(() => {
          logSecurityEvent('signin_success', {
            user_id: data.user.id,
            email: data.user.email,
            timestamp: new Date().toISOString(),
            ip_address: 'client_side',
            source: 'auth_page'
          });
        }, 0);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, isRateLimited, getRemainingTime, recordAttempt, resetRateLimit]);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    const validation = validatePasswordStrength(value);
    setPasswordErrors(validation.errors);
  }, []);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    
    // Validate password strength before submission
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setError('Please fix the password requirements below.');
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
        // Log failed signup attempt
        setTimeout(() => {
          logSecurityEvent('signup_failure', {
            email: email.trim(),
            error: error.message,
            timestamp: new Date().toISOString(),
            ip_address: 'client_side',
            source: 'auth_page'
          });
        }, 0);
        throw error;
      }

      if (data.user) {
        resetRateLimit();
        // Log successful signup
        setTimeout(() => {
          logSecurityEvent('signup_success', {
            user_id: data.user.id,
            email: data.user.email,
            email_confirmed: !!data.user.email_confirmed_at,
            timestamp: new Date().toISOString(),
            ip_address: 'client_side',
            source: 'auth_page'
          });
        }, 0);
        
        if (data.user.email_confirmed_at) {
          setSuccess('Account created successfully! Redirecting...');
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
    setPasswordErrors([]);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign In to ICE SOS Lite – Emergency Protection Access",
    "description": "Access your ICE SOS Lite emergency protection dashboard. Sign in to manage your safety profile and emergency contacts.",
    "provider": {
      "@type": "Organization",
      "name": "ICE SOS Lite",
      "url": "https://icesoslite.com"
    },
    "mainEntity": {
      "@type": "WebApplication",
      "name": "ICE SOS Lite Dashboard",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web Browser"
    }
  };

  return (
    <>
      <PageSEO pageType="auth" />
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                {user && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      You're already logged in as {user.email}. 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-2 text-primary"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        Go to Dashboard
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
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
                      placeholder="Password (min. 8 characters with uppercase, lowercase, number & special character)"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                    />
                    {passwordErrors.length > 0 && (
                      <div className="text-sm text-destructive space-y-1">
                        {passwordErrors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="text-xs">•</span>
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                    disabled={isSubmitting || isRateLimited() || !acceptTerms || passwordErrors.length > 0}
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