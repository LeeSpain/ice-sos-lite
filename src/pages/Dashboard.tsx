import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, Settings, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-emergency mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to ICE SOS</h1>
            <p className="text-xl text-white/80">Your emergency protection is now active</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription?.subscribed ? (
                  <div className="space-y-2">
                    <p className="text-green-600 font-medium">Active Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      Plan: {subscription.subscription_tier}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Next billing: {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'Unknown'}
                    </p>
                    <Button onClick={handleManageSubscription} variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-600 font-medium">No Active Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your subscription to access all features
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  Download App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download the ICE SOS mobile app to get started
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Download for iOS
                    </Button>
                    <Button variant="outline" size="sm">
                      Download for Android
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Finish setting up your emergency information to ensure optimal protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The following information will be completed in your mobile app after download:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emergency rounded-full"></div>
                    Emergency contact details
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emergency rounded-full"></div>
                    Medical information and allergies
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emergency rounded-full"></div>
                    Location permissions for emergency services
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-emergency rounded-full"></div>
                    Notification preferences
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;