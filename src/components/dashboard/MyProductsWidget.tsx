import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bluetooth, 
  Battery, 
  Wifi, 
  MapPin, 
  Settings,
  CheckCircle,
  AlertCircle,
  Package,
  Plus,
  Smartphone,
  Crown,
  Calendar,
  CreditCard,
  ShoppingCart,
  Zap,
  Shield,
  ExternalLink
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
      // Load subscription data first
      await loadSubscription();
      
      // Load user's purchased products
      await loadUserProducts();
      
      // Load available products from admin-managed catalog
      await loadAvailableProducts();
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load your products. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's purchased products from orders table
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Transform orders into user products with mock device status for display
      const userProductsList = ordersData?.map(order => ({
        id: `user-product-${order.id}`,
        order_id: order.id,
        name: order.product?.name || 'Unknown Product',
        type: 'purchased_device',
        status: 'connected', // Mock status - in real app this would come from device API
        battery_level: Math.floor(Math.random() * 40) + 60, // Mock battery 60-100%
        last_sync: new Date().toISOString(),
        firmware_version: '1.2.3',
        setup_completed: true,
        purchase_date: order.created_at,
        price: order.unit_price,
        currency: order.currency,
        product_details: order.product
      })) || [];

      setUserProducts(userProductsList);
    } catch (error) {
      console.error('Error loading user products:', error);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      // Load all active products from admin-managed catalog
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
      // Use the check-subscription function to get the latest subscription status
      const { data: subscriptionData, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (subscriptionData?.subscribed) {
        // Get the plan details for the subscription tier
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', subscriptionData.subscription_tier)
          .single();
        
        setSubscription({
          ...subscriptionData,
          plan: planData,
          subscribed: subscriptionData.subscribed,
          subscription_tier: subscriptionData.subscription_tier,
          subscription_end: subscriptionData.subscription_end
        });
      } else {
        // No active subscription
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handlePurchaseProduct = async (product: any) => {
    try {
      setPurchaseLoading(product.id);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.id,
          amount: Math.round(product.price * 100), // Convert to cents
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

  const handleUpgradeSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plans: ['Family Protection'] // Upgrade to family plan
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to upgrade",
          description: "Complete your subscription upgrade in the new tab.",
        });
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Upgrade Error", 
        description: "Unable to process upgrade. Please try again.",
        variant: "destructive",
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-emergency';
      case 'disconnected': return 'text-destructive';
      case 'low_battery': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-emergency/10 text-emergency">Connected</Badge>;
      case 'disconnected': return <Badge variant="destructive">Disconnected</Badge>;
      case 'low_battery': return <Badge className="bg-orange-100 text-orange-700">Low Battery</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emergency';
    if (level > 20) return 'text-orange-500';
    return 'text-destructive';
  };

  const productFeatures = [
    {
      name: "Emergency SOS",
      status: "active",
      icon: CheckCircle,
      description: "One-touch emergency alert"
    },
    {
      name: "GPS Tracking",
      status: "active", 
      icon: MapPin,
      description: "Real-time location sharing"
    },
    {
      name: "Fall Detection",
      status: "active",
      icon: CheckCircle,
      description: "Automatic fall detection"
    },
    {
      name: "Waterproof",
      status: "active",
      icon: CheckCircle,
      description: "IP67 water resistance"
    }
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Products & Subscription
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Subscription Status */}
      {subscription ? (
        <Card className="border-2 border-emergency/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Crown className="h-6 w-6 text-amber-500" />
              Your Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-2xl text-primary mb-2">{subscription.plan?.name || subscription.subscription_tier}</h3>
                <p className="text-xl text-muted-foreground">
                  €{subscription.plan?.price || '0'} per {subscription.plan?.billing_interval || 'month'}
                </p>
              </div>
              <Badge className="bg-emergency text-white text-lg px-4 py-2">
                {subscription.subscribed ? '✓ Active' : 'Inactive'}
              </Badge>
            </div>
            
            {subscription.subscription_end && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg text-muted-foreground">
                  Next billing date: {new Date(subscription.subscription_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Plan Features */}
            {subscription.plan?.features && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-primary">Your Plan Includes:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {subscription.plan.features.slice(0, 5).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-emergency flex-shrink-0" />
                      <span className="text-base text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" size="lg" onClick={handleUpgradeSubscription} className="text-lg px-6 py-3">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="outline" size="lg" onClick={handleManageSubscription} className="text-lg px-6 py-3">
                <CreditCard className="h-5 w-5 mr-2" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-muted">
          <CardContent className="p-8">
            <div className="text-center">
              <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">No Active Subscription</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Choose a protection plan to get started with 24/7 emergency monitoring
              </p>
              <Button size="lg" className="text-lg px-8 py-3" onClick={handleUpgradeSubscription}>
                <Crown className="h-5 w-5 mr-2" />
                Choose a Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Devices Section - Purchased Products */}
      {userProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-3 text-primary">
            <Bluetooth className="h-6 w-6" />
            My Devices
          </h3>
          {userProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-emergency rounded-lg flex items-center justify-center">
                      <Bluetooth className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchased: {new Date(product.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Device Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Battery className={`h-4 w-4 ${getBatteryColor(product.battery_level)}`} />
                    <span className="text-sm">Battery: {product.battery_level}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-emergency" />
                    <span className="text-sm">Signal: Strong</span>
                  </div>
                </div>

                {/* Battery Level */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Battery Level</span>
                    <span className="text-sm text-muted-foreground">{product.battery_level}%</span>
                  </div>
                  <Progress 
                    value={product.battery_level} 
                    className="h-2"
                  />
                </div>

                {/* Product Features */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Active Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {productFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className="h-3 w-3 text-emergency" />
                        <span className="text-xs text-muted-foreground">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Test Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Products Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-3 text-primary">
          <ShoppingCart className="h-6 w-6" />
          Available Products
        </h3>
        
        {availableProducts.length > 0 ? (
          availableProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow border-2">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-emergency rounded-xl flex items-center justify-center">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-primary mb-2">{product.name}</h3>
                      <p className="text-lg text-muted-foreground mb-3">{product.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-emergency">
                          €{product.price}
                        </span>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {product.inventory_count > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-primary">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {product.features?.slice(0, 6).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-emergency flex-shrink-0" />
                        <span className="text-base text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compatibility */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-primary">Works With</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.compatibility?.map((plan: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-base px-3 py-1">
                        {plan}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div className="text-lg text-muted-foreground">
                    ✅ Works with all subscription plans
                  </div>
                  <Button 
                    onClick={() => handlePurchaseProduct(product)}
                    disabled={purchaseLoading === product.id || product.inventory_count === 0}
                    className="bg-emergency hover:bg-emergency/90 text-lg px-8 py-3 h-auto"
                    size="lg"
                  >
                    {purchaseLoading === product.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-3" />
                    )}
                    {purchaseLoading === product.id ? 'Processing...' : `Buy for €${product.price}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No Products Available</h3>
                <p className="text-lg text-muted-foreground">
                  Check back later for new ICE SOS products
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Devices Message */}
      {userProducts.length === 0 && (
        <Card className="border-2 border-dashed border-muted">
          <CardContent className="p-8">
            <div className="text-center">
              <Bluetooth className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">No Devices Connected</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Purchase an ICE SOS device to get started with 24/7 emergency protection
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="lg" className="text-lg px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Existing Device
                </Button>
                <Button size="lg" className="text-lg px-6 py-3">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shop Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProductsWidget;