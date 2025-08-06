import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const AdminSetupPage = () => {
  useScrollToTop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [creatingTestAccount, setCreatingTestAccount] = useState(false);

  // Test admin credentials
  const TEST_ADMIN_EMAIL = 'admin@icesoslite.com';
  const TEST_ADMIN_PASSWORD = 'AdminTest123!';

  const createTestAdminAccount = async () => {
    setCreatingTestAccount(true);
    try {
      // Sign up the test admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-dashboard`,
          data: {
            first_name: 'Test',
            last_name: 'Admin',
            phone: '+1234567890'
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          // User exists, try to sign them in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: TEST_ADMIN_EMAIL,
            password: TEST_ADMIN_PASSWORD,
          });
          
          if (signInError) {
            throw new Error('Test admin account exists but sign in failed. Try signing in manually.');
          }
          
          toast.success('Signed in to existing test admin account!');
          navigate('/admin-dashboard');
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Update the profile to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            user_id: authData.user.id,
            first_name: 'Test',
            last_name: 'Admin',
            phone: '+1234567890',
            role: 'admin',
            emergency_contacts: [],
            medical_conditions: [],
            allergies: [],
            medications: [],
            profile_completion_percentage: 100
          });

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }

        toast.success('Test admin account created successfully!');
        toast.info('Check your email for confirmation link, then try signing in.');
      }
    } catch (error) {
      console.error('Error creating test admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create test admin account');
    } finally {
      setCreatingTestAccount(false);
    }
  };

  const makeCurrentUserAdmin = async () => {
    if (!user) {
      toast.error('You must be signed in to become admin');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) {
        throw error;
      }

      toast.success('Admin role assigned successfully!');
      
      // Refresh the page to update user role
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast.error('Failed to assign admin role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Create Test Admin Account */}
        <Card>
          <CardHeader className="text-center">
            <UserPlus className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <CardTitle>Create Test Admin Account</CardTitle>
            <CardDescription>
              Create a dedicated test admin account for easy access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Test Admin Credentials:</strong><br />
                Email: {TEST_ADMIN_EMAIL}<br />
                Password: {TEST_ADMIN_PASSWORD}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={createTestAdminAccount} 
              disabled={creatingTestAccount}
              className="w-full"
            >
              {creatingTestAccount ? 'Creating Account...' : 'Create Test Admin Account'}
            </Button>
          </CardContent>
        </Card>

        {/* Make Current User Admin */}
        {user && (
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Make Yourself Admin</CardTitle>
              <CardDescription>
                Assign admin role to your current account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Current User:</strong> {user.email}<br />
                  This will give your current account admin privileges.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={makeCurrentUserAdmin} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Assigning Role...' : 'Make Me Admin'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center space-y-2">
          <Button asChild variant="ghost" size="sm" className="text-white hover:text-white/80">
            <a href="/auth">← Back to Login</a>
          </Button>
          <br />
          <Button asChild variant="ghost" size="sm" className="text-white hover:text-white/80">
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;