import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Settings, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCardProps {
  subscription: any;
}

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const { toast } = useToast();

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

  const getSubscriptionStatus = () => {
    if (subscription?.subscribed) {
      return {
        status: "Active",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4" />,
        description: "Your emergency protection is active"
      };
    }
    return {
      status: "Inactive",
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-4 w-4" />,
      description: "Complete your subscription to activate protection"
    };
  };

  const status = getSubscriptionStatus();

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          Subscription & Billing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {status.icon}
              <div>
                <Badge className={status.color}>
                  {status.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {status.description}
                </p>
              </div>
            </div>
          </div>

          {subscription?.subscribed ? (
            <div className="space-y-4">
              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Plan</label>
                  <p className="text-lg font-semibold capitalize">
                    {subscription.subscription_tier?.replace('_', ' ') || 'Basic'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Billing</label>
                  <p className="text-lg font-semibold">
                    {subscription.subscription_end 
                      ? new Date(subscription.subscription_end).toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24/7 Emergency Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Location Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Emergency Contacts</span>
                  </div>
                  {subscription.subscription_tier === 'spain_plan' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Call Center Support</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">
                No active subscription found. Complete your subscription to access all emergency protection features.
              </p>
              <Button onClick={() => window.location.href = '/register'}>
                Complete Subscription
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;