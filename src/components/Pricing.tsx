import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, MapPin, Brain, Users, Phone, Download, Smartphone, Package, Bluetooth, Battery, Droplets, CheckCircle, UserCheck, Heart, Shield, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import { IntroVideoModal } from "@/components/IntroVideoModal";
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
  coming_soon_url?: string | null;
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

  const { language, currency: selectedCurrency } = usePreferences();
  const { t } = useTranslation();
  const locale = languageToLocale(language as any);
  const toCurrency = (c: string) => (['EUR','GBP','USD','AUD'].includes((c || '').toUpperCase()) ? (c || 'EUR').toUpperCase() : 'EUR') as any;
  const formatPriceDisplay = (amount: number, fromCurrency: string) => {
    const converted = convertCurrency(amount, toCurrency(fromCurrency), selectedCurrency as any);
    return formatDisplayCurrency(converted, selectedCurrency as any, locale);
  };

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
  const globalPlans = subscriptionPlans.filter(plan => plan.region === 'global' || !plan.region);
  useEffect(() => {
    // Use setTimeout to defer non-critical data loading
    const timer = setTimeout(() => {
      Promise.all([
        fetchSubscriptionPlans(),
        fetchProducts(),
        fetchRegionalServices()
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('status', ['active', 'coming_soon'])
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
      const { data, error } = await supabase
        .from('regional_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      console.log('Regional services data loaded:', data);
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
    <section id="pricing" className="pt-16 pb-2 mb-2">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>


        {/* Emergency Protection Plan Section */}
        <div className="max-w-6xl mx-auto mb-16">
          {(() => {
            const selectedPlan = globalPlans.find(p => p.name === 'Premium Protection' || p.is_popular || p.name.toLowerCase().includes('premium')) || globalPlans[0];
            return selectedPlan ? (
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-guardian/10 rounded-3xl p-8 border border-primary/20 shadow-xl relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-guardian/5"></div>
                
                {/* Core Plan Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <Badge className="bg-primary text-white text-sm px-4 py-2 shadow-lg border-0">
                    <Shield className="h-3 w-3 mr-1" />
                    {t('pricing.corePlan')}
                  </Badge>
                </div>

                <div className="relative z-10">
                  {/* Main Content Grid */}
                  <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Left Column - Plan Details (3/5 width) */}
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-guardian rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Brain className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {selectedPlan.name === 'Premium Protection' ? t('plans.premium.name', { defaultValue: selectedPlan.name }) : selectedPlan.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold text-primary">{formatPriceDisplay(selectedPlan.price, selectedPlan.currency)}</span>
                            <span className="text-muted-foreground">/{selectedPlan.billing_interval}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedPlan.name === 'Premium Protection' ? t('plans.premium.description', { defaultValue: selectedPlan.description }) : selectedPlan.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Button 
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                          asChild
                        >
                          <Link to="/ai-register">{t('pricing.subscribeNow')}</Link>
                        </Button>
                        
                        <IntroVideoModal 
                          defaultVideoId="overview"
                          trigger={
                            <Button 
                              size="lg"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {t('common.watchVideo')}
                            </Button>
                          }
                        />
                      </div>

                      {/* Compact Features Grid */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {selectedPlan.features.slice(0, 6).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="h-2.5 w-2.5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                        {selectedPlan.features.length > 6 && (
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <span className="text-sm">+{selectedPlan.features.length - 6} more features</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Column - Plan Image (2/5 width) */}
                    <div className="lg:col-span-2 relative">
                      {/* Floating accents - smaller and more subtle */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center">
                        <Shield className="h-3 w-3 text-primary" />
                      </div>
                      <div className="absolute top-1/3 -left-3 w-5 h-5 bg-guardian/15 rounded-full flex items-center justify-center">
                        <Heart className="h-2.5 w-2.5 text-guardian" />
                      </div>
                      <div className="absolute bottom-4 right-4 w-5 h-5 bg-wellness/15 rounded-full flex items-center justify-center">
                        <Phone className="h-2.5 w-2.5 text-wellness" />
                      </div>
                      
                      <div className="bg-white/90 rounded-2xl p-4 shadow-lg border border-white/50 backdrop-blur-sm">
                        <img
                          src="/lovable-uploads/ed708afa-4c90-4168-9516-83a6d034debd.png"
                          alt="ICE SOS Premium Protection - 3D phone with emergency services icons"
                          className="w-full h-auto rounded-xl shadow-md object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Safety Products Section */}
        {products.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t('pricing.safetyProductsTitle')}
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('pricing.safetyProductsDesc')}
              </p>
            </div>

            {products.map((product) => (
              <div key={product.id} className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-blue-600/10 rounded-3xl p-8 border border-blue-500/20 shadow-xl relative overflow-hidden">
                {/* Background accent - exactly matching Premium Protection */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5"></div>
                
                {product.status === 'coming_soon' && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm md:text-base font-semibold py-2 px-4 flex items-center justify-between shadow-md rounded-t-3xl">
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-white/80 animate-pulse"></span>
                        {t('common.comingSoon')}
                      </span>
                      {product.coming_soon_url ? (
                        <a
                          href={product.coming_soon_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4 hover:no-underline"
                        >
                          {t('common.learnMore')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {/* Product Badge - matching position and style */}
                <div className="absolute top-6 right-6 z-10">
                  <Badge className="bg-blue-500 text-white text-sm px-4 py-2 shadow-lg border-0">
                    <Package className="h-3 w-3 mr-1" />
                    {t('common.oneTime')}
                  </Badge>
                </div>

                <div className="relative z-10">
                  {/* Main Content Grid - EXACT same as Premium Protection */}
                  <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Left Column - Product Details (3/5 width) */}
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Bluetooth className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {product.name === 'ICE SOS Bluetooth Pendant' ? t('products.icePendant.name', { defaultValue: 'ICE SOS Bluetooth Pendant' }) : product.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold text-blue-500">{formatPriceDisplay(product.price, product.currency)}</span>
                            <span className="text-muted-foreground">/one-time</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {product.name === 'ICE SOS Bluetooth Pendant' ? t('products.icePendant.description', { defaultValue: product.description }) : product.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons - matching Premium Protection exactly */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {product.status === 'coming_soon' ? (
                          <Button 
                            size="lg"
                            className="bg-blue-500 hover:bg-blue-500/90 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled
                          >
                            {t('common.comingSoon')}
                          </Button>
                        ) : (
                          <Button 
                            size="lg"
                            className="bg-blue-500 hover:bg-blue-500/90 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                            asChild
                          >
                            <Link to="/devices/ice-sos-pendant">
                              {t('common.learnMore')}
                            </Link>
                          </Button>
                        )}
                        
                        <IntroVideoModal 
                          defaultVideoId="ice-sos-pendant"
                          trigger={
                            <Button 
                              size="lg"
                              variant="outline"
                              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {t('common.watchVideo')}
                            </Button>
                          }
                        />
                      </div>

                      {/* Compact Features Grid - exactly matching Premium Protection */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {product.features.slice(0, 6).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="h-2.5 w-2.5 text-blue-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                        {product.features.length > 6 && (
                          <div className="flex items-center gap-2 text-blue-500 font-medium">
                            <span className="text-sm">+{product.features.length - 6} more features</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Column - Product Image (2/5 width) - EXACT same structure as Premium Protection */}
                    <div className="lg:col-span-2 relative">
                      {/* Floating accents - exactly matching Premium Protection layout */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500/15 rounded-full flex items-center justify-center">
                        <Bluetooth className="h-3 w-3 text-blue-500" />
                      </div>
                      <div className="absolute top-1/3 -left-3 w-5 h-5 bg-blue-600/15 rounded-full flex items-center justify-center">
                        <Battery className="h-2.5 w-2.5 text-blue-600" />
                      </div>
                      <div className="absolute bottom-4 right-4 w-5 h-5 bg-blue-500/15 rounded-full flex items-center justify-center">
                        <Heart className="h-2.5 w-2.5 text-blue-500" />
                      </div>
                      
                      {/* Image container - exactly matching Premium Protection */}
                      <div className="bg-white/90 rounded-2xl p-4 shadow-lg border border-white/50 backdrop-blur-sm">
                        <img
                          src="/lovable-uploads/579998cf-4192-42e5-bef8-7016f892c30a.png"
                          alt="ICE SOS Bluetooth Pendant - Emergency device with Bluetooth connectivity"
                          className="w-full h-auto rounded-xl shadow-md object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regional Services Section */}
        {regionalServices.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t('pricing.regionalServicesTitle', { defaultValue: 'Regional Services' })}
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('pricing.regionalServicesDesc', { defaultValue: 'Specialized coverage for European regions with local emergency response teams and multilingual support.' })}
              </p>
            </div>

            {regionalServices.map((service) => (
              <div key={service.id} className={`rounded-3xl p-8 border shadow-xl relative overflow-hidden mb-8 ${
                service.name === 'Call Centre Spain' 
                  ? 'bg-gradient-to-br from-red-50 via-yellow-50 to-red-100 border-red-200' 
                  : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 border-blue-200'
              }`}>
                {/* Background accent */}
                <div className={`absolute inset-0 ${
                  service.name === 'Call Centre Spain' 
                    ? 'bg-gradient-to-br from-red-50/50 via-transparent to-yellow-50/50'
                    : 'bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50'
                }`}></div>
                
                {/* Regional Service Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <Badge className={`text-white text-sm px-4 py-2 shadow-lg border-0 ${
                    service.name === 'Call Centre Spain' ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    
                    {service.region.toUpperCase()} Service
                  </Badge>
                </div>


                <div className="relative z-10">
                  {/* Main Content Grid */}
                  <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Left Column - Service Details (3/5 width) */}
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          service.name === 'Call Centre Spain'
                            ? 'bg-gradient-to-br from-red-500 to-yellow-500'
                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
                        }`}>
                          <Phone className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {service.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className={`text-3xl font-bold ${
                              service.name === 'Call Centre Spain' ? 'text-red-600' : 'text-blue-600'
                            }`}>{formatPriceDisplay(service.price, service.currency)}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Button 
                          size="lg"
                          className={`text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                            service.name === 'Call Centre Spain'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          asChild
                        >
                          <Link to="/regional-center/spain">
                            {service.name === 'Call Centre Spain' ? t('common.learnMore') : t('pricing.selectPlan', { defaultValue: 'Select Plan' })}
                          </Link>
                        </Button>
                        
                        <IntroVideoModal 
                          defaultVideoId="regional-services"
                          trigger={
                            <Button 
                              size="lg"
                              variant="outline"
                              className={`font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                                service.name === 'Call Centre Spain'
                                  ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                                  : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                              }`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {t('common.watchVideo')}
                              </Button>
                          }
                        />
                      </div>

                      {/* Compact Features Grid */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {service.features.slice(0, 6).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                              service.name === 'Call Centre Spain' ? 'bg-red-600/20' : 'bg-blue-600/20'
                            }`}>
                              <Check className={`h-2.5 w-2.5 ${
                                service.name === 'Call Centre Spain' ? 'text-red-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 6 && (
                          <div className={`flex items-center gap-2 font-medium ${
                            service.name === 'Call Centre Spain' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            <span className="text-sm">+{service.features.length - 6} more features</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Column - Service Image (2/5 width) */}
                    <div className="lg:col-span-2 relative">
                      {/* Floating accents - smaller and more subtle */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                        service.name === 'Call Centre Spain' ? 'bg-red-600/15' : 'bg-blue-600/15'
                      }`}>
                        <MapPin className={`h-3 w-3 ${
                          service.name === 'Call Centre Spain' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="bg-white/90 rounded-2xl p-4 shadow-lg border border-white/50 backdrop-blur-sm">
                        <img
                          src="/lovable-uploads/ad6fb102-913b-42c4-a5e9-81162c5616c0.png"
                          alt={`${service.name} - Regional emergency response service for ${service.region}`}
                          className="w-full h-auto rounded-xl shadow-md object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground bg-white/60 rounded-lg p-4 border border-gray-200 max-w-2xl mx-auto">
                <span className="font-medium">24/7 Emergency Response:</span> All regional services include immediate access to local emergency coordinators who speak your language and understand local emergency protocols.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Pricing;