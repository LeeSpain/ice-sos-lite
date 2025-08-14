import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, MapPin, Brain, Users, Phone, Download, Smartphone, Package, Bluetooth, Battery, Droplets, CheckCircle, UserCheck, Heart, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
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
    <section id="pricing" className="py-20">
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
        <div className="mb-8">
          
          {/* Premium Protection Plan - 3/4 width */}
          <div className="max-w-4xl mx-auto">
            {(() => {
              const selectedPlan = globalPlans.find(p => p.name === 'Premium Protection' || p.is_popular || p.name.toLowerCase().includes('premium')) || globalPlans[0];
              return selectedPlan ? (
                <Card key={selectedPlan.id} className="relative border-2 border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-guardian/5"></div>
<Badge className="absolute top-6 right-6 bg-primary text-white text-sm px-4 py-2 shadow-lg">
  {t('pricing.corePlan')}
</Badge>
                  
                  <div className="relative p-8">
                    {/* Upper half - Image and Text side by side */}
                    <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
                       {/* Plan Info - Left Side */}
                      <div className="text-center lg:text-left">
                        <div className="w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-primary to-guardian rounded-2xl flex items-center justify-center shadow-lg">
                          <Brain className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-3">
                          {selectedPlan.name === 'Premium Protection' ? t('plans.premium.name', { defaultValue: 'Premium Protection' }) : selectedPlan.name}
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mb-4">
                          {selectedPlan.name === 'Premium Protection' ? t('plans.premium.description', { defaultValue: selectedPlan.description }) : selectedPlan.description}
                        </CardDescription>
<div className="mb-6">
  <span className="text-4xl font-bold text-primary">{formatPriceDisplay(selectedPlan.price, selectedPlan.currency)}</span>
  <span className="text-muted-foreground text-lg">/{selectedPlan.billing_interval}</span>
</div>
                        <Button 
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                          asChild
                        >
<Link to="/ai-register">{t('pricing.subscribeNow')}</Link>
                        </Button>
                       </div>
                        
                        {/* Plan Image - Right Side */}
                        <div className="flex justify-center items-center">
                          <div className="w-full max-w-md p-6 bg-gradient-to-br from-primary/10 to-guardian/10 rounded-2xl">
                            <img
                              src="/lovable-uploads/ed708afa-4c90-4168-9516-83a6d034debd.png"
                              alt="ICE SOS Premium Protection - 3D phone with emergency services icons"
                              className="w-full h-auto rounded-xl shadow-lg object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        </div>
                    </div>
                        
                    {/* Features - Bottom half */}
                    <div className="border-t pt-6">
                      <h4 className="text-xl font-semibold mb-4">{t('pricing.everythingIncluded')}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedPlan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null;
            })()}
          </div>


        </div>

        {/* Safety Products Section */}
        {products.length > 0 && (
          <>
            <div className="text-center mb-8 mt-16">
              <h3 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
                {t('pricing.safetyProductsTitle')}
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('pricing.safetyProductsDesc')}
              </p>
            </div>


            <div className="max-w-4xl mx-auto">
              {products.map((product) => (
                <Card key={product.id} className="relative border-2 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5"></div>
{product.status === 'coming_soon' && (
  <div className="absolute top-0 left-0 right-0">
    <div className="bg-gradient-to-r from-secondary to-primary text-white text-sm md:text-base font-semibold py-2 px-4 flex items-center justify-between shadow-md">
      <span className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-white/80 animate-pulse"></span>
        {t('common.comingSoon', { defaultValue: 'Coming Soon' })}
      </span>
      {product.coming_soon_url ? (
        <a
          href={product.coming_soon_url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:no-underline"
        >
          {t('common.learnMore', { defaultValue: 'Learn more' })}
        </a>
      ) : null}
    </div>
  </div>
)}
                  
                  <div className="relative p-8">
                    {/* Upper half - Image and Text side by side */}
                    <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
                       {/* Product Info - Left Side */}
                      <div className="text-center lg:text-left">
                        <div className={`w-16 h-16 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Package className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-3">
                          {product.name === 'ICE SOS Bluetooth Pendant' ? t('products.icePendant.name', { defaultValue: 'ICE SOS Bluetooth Pendant' }) : product.name}
                        </CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mb-4">
                          {product.name === 'ICE SOS Bluetooth Pendant' ? t('products.icePendant.description', { defaultValue: product.description }) : product.description}
                        </CardDescription>
                         <div className="mb-6">
  <span className={`text-4xl font-bold text-blue-600`}>{formatPriceDisplay(product.price, product.currency)}</span>
</div>
                        <div className="flex gap-3">
{product.name === 'ICE SOS Bluetooth Pendant' ? (
                              <div className="flex gap-3">
                                {product.status === 'coming_soon' ? (
                                  <Badge className="px-8 py-4 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
                                ) : (
                                  <Button 
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                                    asChild
                                  >
                                    <Link to="/devices/ice-sos-pendant">Learn More</Link>
                                  </Button>
                                 )}
                              </div>
                            ) : (
                              <Button 
                                size="lg"
                                className="px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 border-0 font-semibold"
                                asChild
                              >
                                <Link to="/devices/ice-sos-pendant">
                                  {t('pricing.details')}
                                </Link>
                              </Button>
                            )}

                        </div>
                       </div>
                        
                        {/* Product Image - Right Side */}
                        <div className="flex justify-center items-center">
                         {product.name === 'ICE SOS Bluetooth Pendant' && (
                           <div className="w-full max-w-md p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl">
                             <img
                               src="/lovable-uploads/579998cf-4192-42e5-bef8-7016f892c30a.png"
                               alt="ICE Smart SOS Button – Emergency pendant device"
                               className="w-full h-auto rounded-xl shadow-lg object-cover"
                               loading="lazy"
                               decoding="async"
                             />
                           </div>
                         )}
                        </div>
                    </div>
                        
                        {/* Features - Bottom half */}
                        <div className="border-t pt-6">
                         <h4 className="text-xl font-semibold mb-4">{t('pricing.keyFeaturesTitle', { defaultValue: 'Key Features:' })}</h4>
                         <div className="grid md:grid-cols-3 gap-4">
                           {product.features.slice(0, 6).map((feature, index) => (
                             <div key={index} className="flex items-start space-x-3">
                               <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                               <span className="text-sm text-muted-foreground">{feature}</span>
                             </div>
                           ))}
                         </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                           <Check className="h-4 w-4 text-green-500" />
                           <span>{t('pricing.freeShippingInventory', { count: product.inventory_count, defaultValue: 'Free shipping • {{count}} units available' })}</span>
                         </div>
                       </div>
                   </div>
                 </Card>
              ))}
            </div>
          </>
        )}

        {/* Regional Services */}
        <>
          <div className="text-center mb-8 mt-16">
            <h3 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              {t('pricing.regionalServicesTitle', { defaultValue: 'Regional Services' })}
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('pricing.regionalServicesDesc', { defaultValue: 'Specialized coverage in your local area with dedicated emergency response teams' })}
            </p>
          </div>

            {(() => {
              console.log('Regional services length:', regionalServices.length, 'Services:', regionalServices);
              return regionalServices.length > 0;
            })() ? (
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
                      {/* Upper half - Image and Text side by side */}
                      <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
                         {/* Service Info - Left Side */}
                        <div className="text-center lg:text-left">
                          <div className={`w-16 h-16 mx-auto lg:mx-0 mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                            service.name === 'Call Centre Spain'
                              ? 'bg-gradient-to-br from-green-500 to-green-600'
                              : 'bg-gradient-to-br from-secondary to-secondary/80'
                          }`}>
                            <MapPin className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-3xl font-bold mb-3">
                            {(service.region === 'Spain' || service.name.toLowerCase().includes('spain'))
                              ? t('regionServices.spain.name', { defaultValue: service.name })
                              : service.name}
                          </CardTitle>
                          <CardDescription className="text-lg text-muted-foreground mb-4">
                            {(service.region === 'Spain' || service.name.toLowerCase().includes('spain'))
                              ? t('regionServices.spain.description', { defaultValue: service.description })
                              : service.description}
                          </CardDescription>
                          <div className="mb-6">
                            <span className={`text-4xl font-bold ${
                              service.name === 'Call Centre Spain'
                                ? 'text-green-600'
                                : 'text-secondary'
                            }`}>{formatPriceDisplay(service.price, service.currency)}</span>
                            <span className="text-muted-foreground text-lg">{t('common.perMonth', { defaultValue: '/month' })}</span>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              size="lg"
                              className={`px-8 py-4 ${
                                service.name === 'Call Centre Spain'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-secondary text-white hover:bg-secondary/90'
                              } border-0 font-semibold`}
                              asChild
                            >
                              <Link to="/regional-center/spain">
                                {t('pricing.details')}
                              </Link>
                            </Button>
                          </div>
                         </div>
                          
                          {/* Call Center Image - Right Side */}
                          <div className="flex justify-center items-center">
                            {service.name === 'Call Centre Spain' && (
                              <div className="w-full max-w-md p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl">
                                <img
                                  src="/lovable-uploads/f65e7524-8dfe-491a-86d1-8d153266a17f.png"
                                  alt="Centro de Respuesta 24/7 - Spanish Call Center Emergency Response Team"
                                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            )}
                          </div>
                      </div>
                          
                      {/* Features - Bottom half */}
                      <div className="border-t pt-6">
                        <h4 className="text-xl font-semibold mb-4">{t('pricing.regionalFeaturesTitle', { defaultValue: 'Regional Features:' })}</h4>
                        <div className="grid md:grid-cols-3 gap-4">
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
                           {service.name === 'Call Centre Spain' && (
                             <div className="flex items-start space-x-3">
                               <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                               <span className="text-sm text-muted-foreground">24/7 Professional Support • Live Translation Available</span>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <Card className="relative border-2 border-green-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10"></div>
                  <Badge className="absolute top-6 right-6 bg-green-600 text-white text-sm px-4 py-2 shadow-lg">
                    SPAIN
                  </Badge>
                  
                  <div className="relative p-8">
                    {/* Upper half - Image and Text side by side */}
                    <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
                       {/* Service Info - Left Side */}
                      <div className="text-center lg:text-left">
                        <div className="w-16 h-16 mx-auto lg:mx-0 mb-4 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-green-500 to-green-600">
                          <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold mb-3">{t('regionServices.spain.name', { defaultValue: 'Call Centre Spain' })}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mb-4">
                          {t('regionServices.spain.description', { defaultValue: 'Bilingual English & Spanish 24/7 emergency support with live translation and coordination with local services.' })}
                        </CardDescription>
                        <div className="mb-6">
                          <span className="text-4xl font-bold text-green-600">{formatPriceDisplay(4.99, 'EUR')}</span>
                          <span className="text-muted-foreground text-lg">{t('common.perMonth', { defaultValue: '/month' })}</span>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            size="lg"
                            className="px-8 py-4 bg-green-600 text-white hover:bg-green-700 border-0 font-semibold"
                            asChild
                          >
                            <Link to="/regional-center/spain">
                              {t('pricing.details')}
                            </Link>
                          </Button>
                        </div>
                       </div>
                        
                        {/* Call Center Image - Right Side */}
                        <div className="flex justify-center items-center">
                          <div className="w-full max-w-md p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl">
                            <img
                              src="/lovable-uploads/f65e7524-8dfe-491a-86d1-8d153266a17f.png"
                              alt="Centro de Respuesta 24/7 - Spanish Call Center Emergency Response Team"
                              className="w-full h-auto rounded-xl shadow-lg object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        </div>
                    </div>
                        
                    {/* Features - Bottom half */}
                    <div className="border-t pt-6">
                      <h4 className="text-xl font-semibold mb-4">{t('pricing.regionalFeaturesTitle', { defaultValue: 'Regional Features:' })}</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                         {[
                           'Bilingual English & Spanish agents',
                           'Live translation during emergencies',
                           'Direct coordination with local services',
                           'Priority escalation and callback',
                           'Cultural and regional expertise',
                           'SMS and phone support options',
                           '24/7 Professional Support • Live Translation Available'
                         ].map((feature, idx) => (
                           <div key={idx} className="flex items-start space-x-3">
                             <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                             <span className="text-sm text-muted-foreground">{feature}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
        </>

      </div>
    </section>
  );
};

export default Pricing;