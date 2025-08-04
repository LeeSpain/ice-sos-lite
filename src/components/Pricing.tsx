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

const Pricing = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const globalPlans = [
    {
      name: "Personal Contact",
      price: "€1.99",
      period: "/month",
      description: "Essential emergency protection",
      badge: "Global",
      badgeColor: "bg-primary",
      icon: Phone,
      features: [
        "Up to 5 personal emergency contacts",
        "SOS sends SMS + GPS location",
        "Available in every country",
        "Multilingual support",
        "Basic emergency alerts"
      ]
    },
    {
      name: "Guardian Wellness",
      price: "€4.99",
      period: "/month",
      description: "AI-powered health monitoring",
      badge: "Global",
      badgeColor: "bg-guardian",
      icon: Brain,
      features: [
        "AI daily check-ins (voice or screen)",
        "Missed check-in alerts",
        "Wellness reminders (meds, hydration)",
        "Weekly summaries to family",
        "Available globally in local language"
      ]
    },
    {
      name: "Family Sharing",
      price: "€0.99",
      period: "/member/month",
      description: "Connect your loved ones",
      badge: "Global",
      badgeColor: "bg-wellness",
      icon: Users,
      features: [
        "Independent app download",
        "Connect via sharing code",
        "View alerts and SOS events",
        "Guardian reports access",
        "Wellness status visibility"
      ]
    }
  ];

  const regionalPlans = [
    {
      name: "Call Centre",
      price: "€24.99",
      period: "/month",
      description: "Professional emergency response",
      badge: "Spain Only",
      badgeColor: "bg-emergency",
      icon: MapPin,
      features: [
        "24/7 access to ICE Alarm support team",
        "Staff speak English and Spanish",
        "Direct escalation to call center",
        "Professional emergency response",
        "Geofenced to Spain region"
      ]
    }
  ];

  useEffect(() => {
    fetchProducts();
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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Protection Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download the app and select the emergency protection level that fits your needs.
          </p>
        </div>

        {/* Free Download Hero Section */}
        <div className="mb-20">
          <Card className="relative border border-border bg-card shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-secondary to-muted"></div>
            <CardHeader className="relative text-center py-16 px-8">
              <Badge className="bg-emergency text-white w-fit mx-auto mb-6 text-sm font-semibold px-4 py-2 shadow-lg">
                PROFESSIONAL APP
              </Badge>
              <div className="w-24 h-24 mx-auto mb-8 bg-white shadow-lg rounded-2xl flex items-center justify-center border border-border/20">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Download ICE SOS Lite
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Professional emergency protection platform for individuals and families. 
                Choose your subscription plan to activate full protection features.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative px-8 pb-16">
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Emergency SOS</h4>
                  <p className="text-sm text-muted-foreground">One-tap emergency button with GPS location sharing</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Global Coverage</h4>
                  <p className="text-sm text-muted-foreground">Works worldwide with full multilingual support</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Instant Setup</h4>
                  <p className="text-sm text-muted-foreground">Ready to use in minutes with simple configuration</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/register">
                    <Download className="mr-2 h-5 w-5" />
                    Get Started Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-5 w-5" />
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Global Protection Plans
            </h3>
            <p className="text-lg text-muted-foreground">
              Available worldwide with full multilingual support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {globalPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card key={index} className="relative border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader className="text-center">
                    <Badge className={`${plan.badgeColor} text-white w-fit mx-auto mb-4`}>
                      {plan.badge}
                    </Badge>
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild
                      className="w-full" 
                      variant={index === 1 ? "default" : "outline"}
                    >
                      <Link to="/register">Subscribe Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
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

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
              {products.map((product) => (
                <Card key={product.id} className="relative overflow-hidden border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-card to-card/80 h-[420px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-secondary/10"></div>
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg text-xs px-2 py-1">
                    One-time Purchase
                  </Badge>
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-md">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{product.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-0 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">€{product.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-sm">one-time</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        Free shipping • {product.inventory_count} units available
                      </p>
                    </div>

                    <div className="mb-4 flex-1">
                      <h4 className="font-semibold mb-2 text-sm text-foreground">Key Features:</h4>
                      <ul className="grid grid-cols-1 gap-1">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-sm text-foreground">Compatible with:</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.compatibility.slice(0, 3).map((plan, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-primary/20 px-2 py-0">
                            {plan}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 border-primary/20 hover:bg-primary/5 text-xs">
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
                        className="flex-1 text-xs"
                        onClick={() => handleProductPurchase(product)}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Regional Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
              Regional Services
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional emergency response available in select regions with 24/7 call center support
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-sm">
              {regionalPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <Card key={index} className="relative border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-card to-card/80 overflow-hidden h-[420px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-emergency/5 via-transparent to-primary/5"></div>
                    <CardHeader className="relative text-center pb-4">
                      <Badge className={`${plan.badgeColor} text-white w-fit mx-auto mb-3 shadow-lg text-xs`}>
                        {plan.badge}
                      </Badge>
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                      <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-emergency/10 rounded-lg">
                        <span className="text-2xl font-bold text-primary">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative pt-0 h-full flex flex-col">
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-2 shadow-lg hover:shadow-xl transition-all duration-300 mt-auto text-sm" 
                      >
                        <Link to="/register">Subscribe Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include end-to-end encryption, GDPR compliance, and can be cancelled anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;