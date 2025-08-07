import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package,
  CreditCard,
  ShoppingCart,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MyProductsWidgetProps {
  profile: any;
}

const MyProductsWidget = ({ profile }: MyProductsWidgetProps) => {
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscription(),
        loadUserProducts(),
        loadAvailableProducts()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`*, product:products(*)`)
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      const userProductsList = ordersData?.map(order => ({
        id: `user-product-${order.id}`,
        name: order.product?.name || 'Unknown Product',
        status: 'connected',
        purchase_date: order.created_at,
        price: order.unit_price,
        currency: order.currency
      })) || [];

      setUserProducts(userProductsList);
    } catch (error) {
      console.error('Error loading user products:', error);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('sort_order');
      
      setAvailableProducts(productsData || []);
    } catch (error) {
      console.error('Error loading available products:', error);
    }
  };

  const loadSubscription = async () => {
    try {
      const { data: subscriptionData, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        setSubscription({ error: true });
        return;
      }

      if (subscriptionData?.subscribed && subscriptionData.subscription_tiers?.length > 0) {
        const { data: allPlans } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true);
        
        const userPlans = allPlans?.filter(plan => 
          subscriptionData.subscription_tiers.includes(plan.name)
        ) || [];
        
        setSubscription({
          ...subscriptionData,
          plans: userPlans,
          subscribed: true
        });
      } else {
        setSubscription({ subscribed: false });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({ error: true });
    }
  };

  const handlePurchaseProduct = async (product: any) => {
    try {
      setPurchaseLoading(product.id);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.id,
          amount: Math.round(product.price * 100),
          currency: product.currency.toLowerCase(),
          productName: product.name
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to payment",
          description: "Please complete your purchase in the new tab.",
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-emergency/10 text-emergency">Connected</Badge>;
      case 'disconnected': return <Badge variant="destructive">Disconnected</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          My Products & Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Overview */}
        {subscription?.subscribed ? (
          <div className="p-4 bg-emergency/5 rounded-lg border border-emergency/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {subscription.plans?.[0]?.name || subscription.subscription_tier || 'Active Plan'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.plans?.[0]?.price ? `€${subscription.plans[0].price} per ${subscription.plans[0].billing_interval}` : 'Active subscription'}
                </p>
              </div>
              <Badge className="bg-emergency text-black">
                ✓ Active
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">No Active Subscription</h3>
                <p className="text-sm text-muted-foreground">Subscribe to activate emergency protection</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => window.location.href = '/dashboard/subscription'}
                className="bg-emergency text-black hover:bg-emergency/90"
              >
                Subscribe
              </Button>
            </div>
          </div>
        )}

        {/* Products Overview */}
        {userProducts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Your Products</h4>
            {userProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Purchased {new Date(product.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            ))}
          </div>
        ) : availableProducts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Available Products</h4>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{availableProducts[0].name}</p>
                    <p className="text-xs text-muted-foreground">€{availableProducts[0].price}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handlePurchaseProduct(availableProducts[0])}
                  disabled={purchaseLoading === availableProducts[0].id}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {purchaseLoading === availableProducts[0].id ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products available</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {subscription?.subscribed && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManageSubscription}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
          {availableProducts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/products'}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Shop
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyProductsWidget;