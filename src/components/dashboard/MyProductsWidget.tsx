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
  const [regionalServices, setRegionalServices] = useState<any[]>([]);
  const [familyPlan, setFamilyPlan] = useState<any | null>(null);
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
        loadAvailableProducts(),
        loadRegionalServices(),
        loadFamilyPlan()
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

  const loadRegionalServices = async () => {
    try {
      const { data: servicesData } = await supabase
        .from('regional_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      setRegionalServices(servicesData || []);
    } catch (error) {
      console.error('Error loading regional services:', error);
    }
  };

  const loadFamilyPlan = async () => {
    try {
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .ilike('name', '%Family%')
        .limit(1);
      setFamilyPlan(plans && plans.length > 0 ? plans[0] : null);
    } catch (error) {
      console.error('Error loading family plan:', error);
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

  const handleAddFamilyPlan = async () => {
    if (!familyPlan) return;
    try {
      setPurchaseLoading('family-plan');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plans: [familyPlan.id] }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
      toast({ title: 'Redirecting to checkout', description: 'Complete your add-on purchase in the new tab.' });
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({ title: 'Checkout Error', description: 'Unable to start checkout. Please try again.', variant: 'destructive' });
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

  const hasFamilyActive = Boolean(
    (subscription?.plans && Array.isArray(subscription.plans) && subscription.plans.some((p: any) => p?.name === 'Family Connection')) ||
    (Array.isArray(subscription?.subscription_tiers) && subscription.subscription_tiers.includes('Family Connection')) ||
    subscription?.subscription_tier === 'Family Connection'
  );

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

        {/* Family Connection Add-on */}
        {familyPlan && !hasFamilyActive && (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-1">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm mb-1">Family Connection</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    Invite a trusted family member or carer to your dashboard for secure monitoring and support.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">€{Number(familyPlan.price || 1.99).toFixed(2)}/month</span>
                    <span>• Add-on</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    • Secure dashboard access • Instant SOS alerts • Live protection status • View emergency profile
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleAddFamilyPlan}
                disabled={purchaseLoading === 'family-plan'}
                className="ml-3"
              >
                {purchaseLoading === 'family-plan' ? 'Processing...' : 'Add Family Member'}
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
        ) : (
          <div className="space-y-4">
            {/* Available Products */}
            {availableProducts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Available Products</h4>
                {availableProducts.slice(0, 2).map((product) => (
                  <div key={product.id} className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Package className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{product.name}</h5>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {product.description || "Premium emergency device for enhanced personal safety and protection."}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">€{product.price}</span>
                            {product.features && (
                              <span>• {Array.isArray(product.features) ? product.features.slice(0, 2).join(' • ') : 'Advanced Features'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handlePurchaseProduct(product)}
                        disabled={purchaseLoading === product.id}
                        className="bg-primary text-white hover:bg-primary/90 ml-3"
                      >
                        {purchaseLoading === product.id ? 'Processing...' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regional Services */}
            {regionalServices.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Regional Services</h4>
                {regionalServices.slice(0, 2).map((service) => (
                  <div key={service.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-1">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1">{service.name}</h5>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {service.description || "24/7 emergency response and monitoring service for your region with local emergency coordination."}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-semibold text-green-600">€{service.price}/month</span>
                            <span>• {service.region || 'Regional Coverage'}</span>
                            {service.features && Array.isArray(service.features) && (
                              <span>• {service.features.slice(0, 1).join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/dashboard/subscription'}
                        className="ml-3 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {availableProducts.length === 0 && regionalServices.length === 0 && (
              <div className="text-center py-4">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No products or services available</p>
              </div>
            )}
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
          {(availableProducts.length > 0 || regionalServices.length > 0) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/products'}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              View All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyProductsWidget;