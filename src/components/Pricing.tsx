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

interface RegionalService {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  region: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

const Pricing = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [regionalServices, setRegionalServices] = useState<RegionalService[]>([]);

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
    fetchRegionalServices();
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

  const fetchRegionalServices = async () => {
    try {
      console.log('Fetching regional services...');
      const { data, error } = await supabase
        .from('regional_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching regional services:', error);
        throw error;
      }
      
      console.log('Regional services data:', data);
      setRegionalServices(data || []);
    } catch (error) {
      console.error('Error fetching regional services:', error);
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
            Your Protection Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional emergency protection at €4.99/month. Download the app and activate your plan instantly.
          </p>
        </div>


        {/* Emergency Protection Plan Section */}
        <div className="mb-12">
          
          {/* Premium Protection Plan - 3/4 width */}
          <div className="max-w-4xl mx-auto">
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
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Family Connection Card - Connected below */}
          <div className="max-w-4xl mx-auto mt-6">
            {globalPlans.filter(plan => plan.name === 'Family Connection').map((plan) => (
              <Card key={plan.id} className="relative border-2 border-wellness/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-wellness/5 via-transparent to-wellness/10"></div>
                <Badge className="absolute top-6 right-6 bg-wellness text-white text-sm px-4 py-2 shadow-lg">
                  ADD-ON
                </Badge>
                
                <div className="relative p-8">
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Plan Info */}
                    <div className="text-center lg:text-left">
                      <div className="w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-wellness to-wellness/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-3xl font-bold mb-3">{plan.name}</CardTitle>
                      <CardDescription className="text-lg text-muted-foreground mb-4">
                        {plan.description}
                      </CardDescription>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-wellness">€{plan.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-lg">/{plan.billing_interval}</span>
                      </div>
                      <Button 
                        size="lg"
                        className="bg-wellness hover:bg-wellness/90 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => handleSubscriptionPurchase(plan)}
                      >
                        Add Family Plan
                      </Button>
                    </div>
                    
                    {/* Features */}
                    <div className="lg:col-span-2">
                      <h4 className="text-xl font-semibold mb-4">Family Features:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-wellness mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

            <div className="max-w-4xl mx-auto">
              {products.map((product) => (
                <Card key={product.id} className="relative border-2 border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-guardian/5"></div>
                  <Badge className="absolute top-6 right-6 bg-primary text-white text-sm px-4 py-2 shadow-lg">
                    ONE-TIME PURCHASE
                  </Badge>
                  
                  <div className="relative p-8">
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                       {/* Product Info */}
                      <div className="text-center lg:text-left">
                        <div className={`w-16 h-16 mx-auto lg:mx-0 mb-4 ${
                          product.name === 'ICE SOS Bluetooth Pendant' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-br from-primary to-guardian'
                        } rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Package className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-3">{product.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mb-4">
                          {product.description}
                        </CardDescription>
                        <div className="mb-6">
                          <span className={`text-4xl font-bold ${
                            product.name === 'ICE SOS Bluetooth Pendant' 
                              ? 'text-blue-600' 
                              : 'text-primary'
                          }`}>€{product.price.toFixed(2)}</span>
                          <span className="text-muted-foreground text-lg"> one-time</span>
                        </div>
                        <div className="flex gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="lg"
                                className="px-8 py-4 border-secondary/20 hover:bg-secondary/5 font-semibold"
                              >
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Package className="h-5 w-5 text-secondary" />
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
                                     className={`flex-1 ${
                                       product.name === 'ICE SOS Bluetooth Pendant'
                                         ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                         : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                     }`}
                                     onClick={() => handleProductPurchase(product)}
                                   >
                                     Purchase Device
                                   </Button>
                                 </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                        <Button 
                          size="lg"
                          className={`font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                            product.name === 'ICE SOS Bluetooth Pendant'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          }`}
                          onClick={() => handleProductPurchase(product)}
                        >
                          Purchase Now
                        </Button>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="lg:col-span-2">
                        <h4 className="text-xl font-semibold mb-4">Key Features:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {product.features.slice(0, 6).map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Free shipping • {product.inventory_count} units available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* DEBUG: Regional Services state */}
        <div className="text-center mb-4 bg-yellow-100 p-4 rounded">
          <p>Regional Services Debug: {regionalServices.length} services found</p>
          <p>Data: {JSON.stringify(regionalServices.map(s => s.name))}</p>
        </div>

        {/* Regional Services */}
        {regionalServices.length > 0 && (
          <>
            <div className="text-center mb-16">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Regional Services
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Specialized coverage in your local area with dedicated emergency response teams
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {regionalServices.map((service) => (
                <Card key={service.id} className={`relative border-2 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden ${
                  service.name === 'Call Centre Spain' 
                    ? 'border-green-500/40' 
                    : 'border-secondary/40'
                }`}>
                  <div className={`absolute inset-0 ${
                    service.name === 'Call Centre Spain'
                      ? 'bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10'
                      : 'bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10'
                  }`}></div>
                  <Badge className={`absolute top-6 right-6 text-white text-sm px-4 py-2 shadow-lg ${
                    service.name === 'Call Centre Spain'
                      ? 'bg-green-600'
                      : 'bg-secondary'
                  }`}>
                    {service.region?.toUpperCase()}
                  </Badge>
                  
                  <div className="relative p-8">
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                      {/* Service Info */}
                      <div className="text-center lg:text-left">
                        <div className={`w-16 h-16 mx-auto lg:mx-0 mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                          service.name === 'Call Centre Spain'
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : 'bg-gradient-to-br from-secondary to-secondary/80'
                        }`}>
                          <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-3">{service.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mb-4">
                          {service.description}
                        </CardDescription>
                        <div className="mb-6">
                          <span className={`text-4xl font-bold ${
                            service.name === 'Call Centre Spain'
                              ? 'text-green-600'
                              : 'text-secondary'
                          }`}>€{service.price.toFixed(2)}</span>
                          <span className="text-muted-foreground text-lg">/month</span>
                        </div>
                        <Button 
                          size="lg"
                          className={`font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                            service.name === 'Call Centre Spain'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-secondary hover:bg-secondary/90 text-white'
                          }`}
                        >
                          Contact Regional Center
                        </Button>
                      </div>
                      
                      {/* Features */}
                      <div className="lg:col-span-2">
                        <h4 className="text-xl font-semibold mb-4">Regional Features:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start space-x-3">
                              <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                                service.name === 'Call Centre Spain'
                                  ? 'text-green-600'
                                  : 'text-secondary'
                              }`} />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
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