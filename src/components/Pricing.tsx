import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, MapPin, Brain, Users, Phone, Download, Smartphone, Package, Bluetooth, Battery, Droplets, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  sku: string;
  inventory_count: number;
  compatibility: string[];
  status: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_interval: string;
  description: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  stripe_price_id?: string;
  region?: string;
}

const Pricing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Icon mapping for subscription plans
  const getIconForPlan = (planName: string) => {
    if (planName.toLowerCase().includes('basic') || planName.toLowerCase().includes('personal')) return Phone;
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('guardian')) return Brain;
    if (planName.toLowerCase().includes('family')) return Users;
    return Phone; // default
  };

  // Badge color mapping for subscription plans
  const getBadgeColorForPlan = (planName: string) => {
    if (planName.toLowerCase().includes('basic') || planName.toLowerCase().includes('personal')) return "bg-primary";
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('guardian')) return "bg-guardian";
    if (planName.toLowerCase().includes('family')) return "bg-wellness";
    return "bg-primary"; // default
  };

  // Filter global and regional plans
  const globalPlans = subscriptionPlans.filter(plan => !plan.region || plan.region === 'global');
  const regionalPlans = subscriptionPlans.filter(plan => plan.region && plan.region !== 'global');

  useEffect(() => {
    fetchProducts();
    fetchSubscriptionPlans();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features.filter((f): f is string => typeof f === 'string')
          : [],
        description: plan.description || '',
        sort_order: plan.sort_order || 0,
        stripe_price_id: plan.stripe_price_id || undefined
      }));
      
      setSubscriptionPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const handleSubscriptionPurchase = async (plan: SubscriptionPlan) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plans: [plan.id]
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Error processing subscription. Please try again.');
    }
  };

  const handleProductPurchase = async (product: Product) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.id,
          amount: Math.round(product.price * 100), // Convert to cents
          currency: product.currency.toLowerCase(),
          productName: product.name
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Protection Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional emergency protection starting from €1.99/month. Download the app and activate your plan instantly.
          </p>
        </div>


        {/* Premium Protection Plan Section */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Emergency Protection Plan
            </h3>
            <p className="text-base text-muted-foreground">
              Professional protection with worldwide 24/7 call center and multilingual support
            </p>
          </div>
          
          {/* Premium Protection Long Box */}
          {globalPlans.filter(plan => plan.name === 'Premium Protection').map((plan) => (
            <Card key={plan.id} className="relative border-2 border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-guardian/5"></div>
              <Badge className="absolute top-6 right-6 bg-primary text-white text-sm px-4 py-2 shadow-lg">
                MOST POPULAR
              </Badge>
              
              <div className="relative p-8">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Plan Info */}
                  <div className="text-center lg:text-left">
                    <div className="w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-primary to-guardian rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-3">{plan.name}</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mb-4">
                      {plan.description}
                    </CardDescription>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary">€{plan.price.toFixed(2)}</span>
                      <span className="text-muted-foreground text-lg">/{plan.billing_interval}</span>
                    </div>
                    <Button 
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => handleSubscriptionPurchase(plan)}
                    >
                      Subscribe Now
                    </Button>
                  </div>
                  
                  {/* Features */}
                  <div className="lg:col-span-2">
                    <h4 className="text-xl font-semibold mb-4">Everything Included:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                      
                      {/* Family Connection Add-on */}
                      <div className="md:col-span-2 mt-6 p-4 bg-secondary/20 rounded-lg border border-border/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Users className="h-5 w-5 text-wellness mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-foreground">Family Connection Add-on</h5>
                              <p className="text-sm text-muted-foreground">Connect unlimited family members to receive emergency alerts and share health information</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-wellness border-wellness/40">
                            Available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Safety Products Section */}
        {products.length > 0 && (
          <>
            <div className="text-center mb-16">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Safety Products
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Enhance your safety with our Bluetooth-enabled emergency devices that work seamlessly with all subscription plans
              </p>
            </div>

            <div className="flex justify-center mb-16">
              <div className={`w-full max-w-md ${products.length > 1 ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl' : ''}`}>
                {products.map((product) => (
                  <Card key={product.id} className="relative overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-card to-card/80 h-[420px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-secondary/10"></div>
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg text-xs px-3 py-1">
                      One-time Purchase
                    </Badge>
                    <CardHeader className="relative pb-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                      <CardDescription className="text-base mt-2">{product.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-primary">€{product.price.toFixed(2)}</span>
                        <span className="text-muted-foreground"> one-time</span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-0 h-full flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        Free shipping • {product.inventory_count} units available
                      </p>

                      <div className="mb-4 flex-1">
                        <ul className="space-y-2">
                          {product.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 border-primary/20 hover:bg-primary/5">
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                {product.name}
                              </DialogTitle>
                              <DialogDescription>
                                Complete product specifications and setup information
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-3">Technical Specifications:</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Bluetooth className="h-4 w-4 text-blue-500" />
                                    <span>Bluetooth 5.0 Low Energy</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Battery className="h-4 w-4 text-green-500" />
                                    <span>7-day battery life</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                    <span>IP67 Waterproof</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    <span>100m range</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">All Features:</h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">How It Works:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                  <li>Pair the pendant with your smartphone via Bluetooth</li>
                                  <li>Connect to the ICE SOS Lite app (works with any subscription plan)</li>
                                  <li>Press the button once to activate emergency mode</li>
                                  <li>Your emergency contacts and services are notified instantly</li>
                                  <li>GPS location is shared automatically through your phone</li>
                                </ol>
                              </div>

                              <div className="flex gap-3 pt-4">
                                <Button 
                                  className="flex-1"
                                  onClick={() => handleProductPurchase(product)}
                                >
                                  Purchase Now - €{product.price.toFixed(2)}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleProductPurchase(product)}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Regional Services Section */}
        {regionalPlans.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Regional Services
              </h3>
              <p className="text-lg text-muted-foreground">
                Premium call center services available in select regions
              </p>
            </div>
            
            <div className="flex justify-center mb-16">
              <div className={`w-full max-w-md ${regionalPlans.length > 1 ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl' : ''}`}>
                {regionalPlans.map((plan, index) => {
                  const Icon = getIconForPlan(plan.name);
                  const regionName = plan.region === 'spain' ? 'Spain Only' : plan.region?.toUpperCase();
                  return (
                    <Card key={plan.id} className="relative overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-card to-card/80 h-[420px]">
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-secondary/10"></div>
                      <Badge className="absolute top-4 right-4 bg-emergency text-white shadow-lg text-xs px-3 py-1">
                        {regionName}
                      </Badge>
                      <CardHeader className="relative pb-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-primary">€{plan.price.toFixed(2)}</span>
                          <span className="text-muted-foreground">/{plan.billing_interval}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="relative pt-0 h-full flex flex-col">
                        <div className="mb-4 flex-1">
                          <ul className="space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          className="w-full mt-auto" 
                          variant="default"
                          onClick={() => handleSubscriptionPurchase(plan)}
                        >
                          Subscribe Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Important Information</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-primary mb-2">Plan Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• No setup fees or hidden costs</li>
                  <li>• Cancel anytime with 30 days notice</li>
                  <li>• Hardware devices sold separately</li>
                  <li>• Full customer support included</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Cancellation Policy:</h4>
                <p className="text-sm text-muted-foreground">
                  You can cancel your subscription at any time. Your access will continue until the end of your current billing period. 
                  Hardware purchases are non-refundable but carry a 1-year warranty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;