import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Shield, ArrowRight } from 'lucide-react';
import { PageSEO } from '@/components/PageSEO';


interface WelcomeData {
  firstName: string;
  lastName: string;
  email: string;
  subscriptionPlans: any[];
  products: any[];
  regionalServices: any[];
  totalAmount: number;
}

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);

  useEffect(() => {
    const initializeWelcomePage = async () => {
      if (!user) {
        // Try stored data for users who haven't confirmed email yet
        const storedData = sessionStorage.getItem('welcomeData');
        if (storedData) {
          setWelcomeData(JSON.parse(storedData));
          sessionStorage.removeItem('welcomeData');
          return;
        }
        navigate('/dashboard');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: subscription } = await supabase
          .from('subscribers')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .eq('subscribed', true)
          .maybeSingle();

        const subscriptionPlans: any[] = [];
        if (subscription?.subscription_tier) {
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('id, name, price, billing_interval')
            .eq('name', subscription.subscription_tier)
            .maybeSingle();
          if (planData) subscriptionPlans.push(planData);
        }

        setWelcomeData({
          firstName: profile?.first_name || user.user_metadata?.first_name || 'User',
          lastName: profile?.last_name || user.user_metadata?.last_name || '',
          email: user.email || '',
          subscriptionPlans,
          products: [],
          regionalServices: [],
          totalAmount: subscriptionPlans.reduce((sum, plan) => sum + (Number(plan.price) || 0), 0),
        });

        sessionStorage.removeItem('welcomeData');
      } catch (error) {
        console.error('Error fetching welcome data:', error);
        const storedData = sessionStorage.getItem('welcomeData');
        if (storedData) {
          setWelcomeData(JSON.parse(storedData));
          sessionStorage.removeItem('welcomeData');
        }
      }
    };

    initializeWelcomePage();
  }, [user, navigate]);

  if (!welcomeData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your welcome page...</p>
        </div>
      </div>
    );
  }

  const PRODUCT_IVA_RATE = 0.21;
  const SERVICE_IVA_RATE = 0.10;

  const subscriptionTotal = (welcomeData.subscriptionPlans || []).reduce((sum, plan) => {
    return sum + (plan?.price ? Number(plan.price) : 0);
  }, 0) + (welcomeData.regionalServices || []).reduce((sum, service) => {
    return sum + ((service?.price ? Number(service.price) : 0) * (1 + SERVICE_IVA_RATE));
  }, 0);

  const productTotal = (welcomeData.products || []).reduce((sum, product) => {
    return sum + ((product?.price ? Number(product.price) : 0) * (1 + PRODUCT_IVA_RATE));
  }, 0);

  const grandTotal = subscriptionTotal + productTotal;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSEO pageType="payment-success" />
      <Navigation />

      <div className="container mx-auto px-4 pt-page-top pb-section">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-emergency" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-20 h-20 text-emergency opacity-30" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Thank You, {welcomeData.firstName}!
            </h1>

            <p className="text-xl text-white/90 mb-3">
              Your payment was successful
            </p>

            <Badge variant="secondary" className="bg-emergency/20 text-emergency border-emergency/30 px-4 py-2 text-lg">
              <Shield className="w-5 h-5 mr-2" />
              Account Activated
            </Badge>
          </div>

          {/* Purchase Summary */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="w-5 h-5 text-emergency" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {welcomeData.firstName} {welcomeData.lastName}</p>
                <p><strong>Email:</strong> {welcomeData.email}</p>
              </div>

              {(welcomeData.subscriptionPlans?.length ?? 0) > 0 && (
                <div>
                  {welcomeData.subscriptionPlans.map(plan => (
                    <div key={plan.id} className="flex justify-between p-2 bg-secondary rounded border">
                      <span className="font-medium">{plan.name}</span>
                      <span>{'\u20AC'}{(Number(plan.price) || 0).toFixed(2)}/month</span>
                    </div>
                  ))}
                </div>
              )}

              {grandTotal > 0 && (
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-emergency">{'\u20AC'}{grandTotal.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Check Your Email CTA */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl mb-6">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Check Your Email</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We've sent a welcome email to <strong>{welcomeData.email}</strong> with a link to complete your safety profile setup.
              </p>
              <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
                <p>Can't find it? Check your spam folder, or click below to continue setup now.</p>
              </div>
              <Button
                onClick={() => navigate('/onboarding')}
                size="lg"
                className="w-full sm:w-auto"
              >
                Continue Setup Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <div className="text-center">
            <p className="text-white/70 text-sm">
              Need help? Email <strong className="text-white/90">support@icesos.com</strong> or call <strong className="text-white/90">+34 900 123 456</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;