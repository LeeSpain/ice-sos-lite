import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, User, Phone, MapPin, CreditCard, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import EmbeddedPayment from '@/components/EmbeddedPayment';
import { TermsDialog } from '@/components/legal/TermsDialog';
import { PrivacyDialog } from '@/components/legal/PrivacyDialog';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_interval: string;
  features: string[];
  is_popular: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  images: any[];
  status: string;
}

interface RegionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  features: string[];
}

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  acceptTerms: boolean;
}

const AIRegister = () => {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    acceptTerms: false,
  });
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [regionalServices, setRegionalServices] = useState<RegionalService[]>([]);
  const [selectedMainPlan, setSelectedMainPlan] = useState<string>('');
  const [hasFamilyPlan, setHasFamilyPlan] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedRegionalServices, setSelectedRegionalServices] = useState<string[]>([]);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currency, language } = usePreferences();

  // Debug log for component renders and currency changes
  console.log('🎯 AIRegister component render - Currency:', currency, 'Language:', language);

  // Convert all data based on current currency using useMemo for proper re-rendering
  const convertedPlans = useMemo(() => {
    console.log('🔄 [RECALCULATING] Converting plans, currency:', currency, 'plans:', dbPlans.length);
    if (dbPlans.length === 0) {
      console.log('⚠️ No plans to convert yet');
      return [];
    }
    const converted = dbPlans.map(plan => {
      const convertedPrice = convertCurrency(plan.price, plan.currency as any, currency);
      console.log(`💰 Plan ${plan.name}: ${plan.price} ${plan.currency} → ${convertedPrice.toFixed(2)} ${currency}`);
      return {
        ...plan,
        price: convertedPrice,
        currency: currency
      };
    });
    console.log('✅ Plans conversion complete:', converted.length, 'plans converted');
    return converted;
  }, [dbPlans, currency]);

  const convertedProducts = useMemo(() => {
    console.log('🔄 [RECALCULATING] Converting products, currency:', currency, 'products:', products.length);
    if (products.length === 0) {
      console.log('⚠️ No products to convert yet');
      return [];
    }
    const converted = products.map(product => {
      const convertedPrice = convertCurrency(product.price, product.currency as any, currency);
      console.log(`🛒 Product ${product.name}: ${product.price} ${product.currency} → ${convertedPrice.toFixed(2)} ${currency}`);
      return {
        ...product,
        price: convertedPrice,
        currency: currency
      };
    });
    console.log('✅ Products conversion complete:', converted.length, 'products converted');
    return converted;
  }, [products, currency]);

  const convertedRegionalServices = useMemo(() => {
    console.log('🔄 [RECALCULATING] Converting regional services, currency:', currency, 'services:', regionalServices.length);
    if (regionalServices.length === 0) {
      console.log('⚠️ No regional services to convert yet');
      return [];
    }
    const converted = regionalServices.map(service => {
      const convertedPrice = convertCurrency(service.price, service.currency as any, currency);
      console.log(`🗺️ Service ${service.name}: ${service.price} ${service.currency} → ${convertedPrice.toFixed(2)} ${currency}`);
      return {
        ...service,
        price: convertedPrice,
        currency: currency
      };
    });
    console.log('✅ Regional services conversion complete:', converted.length, 'services converted');
    return converted;
  }, [regionalServices, currency]);

  // Load data on component mount
  useEffect(() => {
    console.log('🚀 AIRegister useEffect triggered - Loading data');
    const loadData = async () => {
      try {
        console.log('📊 Fetching subscription plans...');
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price');
        
        if (plansError) {
          console.error('❌ Plans fetch error:', plansError);
          throw plansError;
        }
        console.log('✅ Plans loaded:', plansData?.length || 0, 'plans');
        setDbPlans((plansData || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features.filter(f => typeof f === 'string') as string[]
            : typeof plan.features === 'string' 
              ? [plan.features]
              : []
        })));

        console.log('🛍️ Fetching products...');
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('status', ['active', 'coming_soon'])
          .order('sort_order');
        
        if (productsError) {
          console.error('❌ Products fetch error:', productsError);
          throw productsError;
        }
        console.log('✅ Products loaded:', productsData?.length || 0, 'products');
        setProducts((productsData || []).map(product => ({
          ...product,
          images: Array.isArray(product.images) ? product.images : []
        })));

        console.log('🗺️ Fetching regional services...');
        const { data: servicesData, error: servicesError } = await supabase
          .from('regional_services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        
        if (servicesError) {
          console.error('❌ Regional services fetch error:', servicesError);
          throw servicesError;
        }
        console.log('✅ Regional services loaded:', servicesData?.length || 0, 'services');
        setRegionalServices(servicesData || []);
      } catch (error) {
        console.error('💥 Data loading error:', error);
        toast({
          title: "Error",
          description: "Failed to load registration data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  const handlePersonalDetailsChange = useCallback((field: keyof PersonalDetails, value: string | boolean) => {
    setPersonalDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMainPlanChange = useCallback((planId: string) => {
    console.log('📋 Main plan selected:', planId);
    setSelectedMainPlan(planId);
  }, []);

  const handleFamilyPlanToggle = useCallback((enabled: boolean) => {
    console.log('👨‍👩‍👧‍👦 Family plan toggled:', enabled);
    setHasFamilyPlan(enabled);
  }, []);

  const handleProductToggle = useCallback((productId: string) => {
    console.log('🛒 Product toggled:', productId);
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleRegionalServiceToggle = useCallback((serviceId: string) => {
    console.log('🗺️ Regional service toggled:', serviceId);
    setSelectedRegionalServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const validatePersonalDetails = () => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return {
      firstName: personalDetails.firstName.trim().length > 0,
      lastName: personalDetails.lastName.trim().length > 0,
      email: personalDetails.email.trim().length > 0 && emailRegex.test(personalDetails.email),
      password: personalDetails.password.length >= 6,
      phone: personalDetails.phone.trim().length > 0,
      city: personalDetails.city.trim().length > 0,
      country: personalDetails.country.trim().length > 0,
      acceptTerms: personalDetails.acceptTerms,
    };
  };

  const isFormValid = () => {
    const validation = validatePersonalDetails();
    return Object.values(validation).every(isValid => isValid) && selectedMainPlan;
  };

  const calculateSubscriptionTotal = () => {
    let total = 0;
    
    if (selectedMainPlan) {
      const plan = convertedPlans.find(p => p.id === selectedMainPlan);
      if (plan) total += plan.price;
    }
    
    if (hasFamilyPlan) {
      const familyPlan = convertedPlans.find(p => p.name.toLowerCase().includes('family'));
      if (familyPlan) total += familyPlan.price;
    }
    
    selectedRegionalServices.forEach(serviceId => {
      const service = convertedRegionalServices.find(s => s.id === serviceId);
      if (service) total += service.price;
    });
    
    return total;
  };

  const calculateProductTotal = () => {
    return selectedProducts.reduce((total, productId) => {
      const product = convertedProducts.find(p => p.id === productId);
      return total + (product ? product.price : 0);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubscriptionTotal() + calculateProductTotal();
  };

  const handleContinueToPayment = async () => {
    if (!isFormValid()) {
      toast({
        title: t('register.validation.planRequired'),
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async () => {
    console.log('💳 Payment successful, creating user...');
    setIsLoading(true);
    
    try {
      // Create Supabase user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: personalDetails.email,
        password: personalDetails.password,
        options: {
          data: {
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            phone_number: personalDetails.phone,
            preferred_language: language,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Update profile with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            phone: personalDetails.phone,
            address: `${personalDetails.city}, ${personalDetails.country}`,
            language_preference: language,
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      // Store welcome data for later processing
      await supabase.from('registration_selections').insert({
        user_id: authData.user?.id,
        session_id: crypto.randomUUID(),
        subscription_plans: [
          { id: selectedMainPlan, selected: true },
          ...(hasFamilyPlan ? [{ id: 'family', selected: true }] : [])
        ],
        selected_products: selectedProducts.map(id => ({ id, selected: true })),
        selected_regional_services: selectedRegionalServices.map(id => ({ id, selected: true })),
        total_subscription_amount: calculateSubscriptionTotal(),
        total_product_amount: calculateProductTotal(),
        currency: currency,
        registration_completed: true,
      });

      toast({
        title: "Registration Successful!",
        description: "Welcome to ICE SOS Lite! Check your email for verification.",
      });

      // Redirect to success page or dashboard
      window.location.href = '/registration-success';
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "There was an issue completing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center border-b bg-gradient-to-r from-emergency/5 to-primary/5 py-6">
              <div className="flex justify-center items-center gap-3 mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {t('register.title')}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep === 'details' ? t('register.stepDetails') : t('register.stepPayment')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {currentStep === 'details' ? (
                <div className="space-y-8">
                  {/* Personal Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{t('register.personalDetails.title')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">{t('register.personalDetails.firstName')} *</Label>
                        <Input
                          id="firstName"
                          value={personalDetails.firstName}
                          onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)}
                          placeholder={t('register.personalDetails.firstName')}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('register.personalDetails.lastName')} *</Label>
                        <Input
                          id="lastName"
                          value={personalDetails.lastName}
                          onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                          placeholder={t('register.personalDetails.lastName')}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">{t('register.personalDetails.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalDetails.email}
                          onChange={(e) => handlePersonalDetailsChange('email', e.target.value)}
                          placeholder={t('register.personalDetails.email')}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">{t('register.personalDetails.password')} *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={personalDetails.password}
                          onChange={(e) => handlePersonalDetailsChange('password', e.target.value)}
                          placeholder={t('register.personalDetails.password')}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">{t('register.personalDetails.phone')} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={personalDetails.phone}
                          onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                          placeholder={t('register.personalDetails.phone')}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">{t('register.personalDetails.city')} *</Label>
                        <Input
                          id="city"
                          value={personalDetails.city}
                          onChange={(e) => handlePersonalDetailsChange('city', e.target.value)}
                          placeholder={t('register.personalDetails.city')}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="country">{t('register.personalDetails.country')} *</Label>
                        <Input
                          id="country"
                          value={personalDetails.country}
                          onChange={(e) => handlePersonalDetailsChange('country', e.target.value)}
                          placeholder={t('register.personalDetails.country')}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Protection Plans */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{t('register.plans.title')}</h2>
                    </div>
                    
                    {/* Main Plans */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t('register.plans.selectMain')} *</h3>
                      <RadioGroup value={selectedMainPlan} onValueChange={handleMainPlanChange}>
                        <div className="grid gap-4">
                          {convertedPlans.map((plan) => (
                            <div key={plan.id} className="flex items-center space-x-3 border rounded-lg p-4">
                              <RadioGroupItem value={plan.id} id={plan.id} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={plan.id} className="font-semibold">{plan.name}</Label>
                                  {plan.is_popular && <Badge variant="default">Popular</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                <p className="font-bold text-primary">
                                  {formatDisplayCurrency(plan.price, currency, languageToLocale(language))}/{t('common.perMonth')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Family Plan Add-on */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t('register.plans.familyAdd')}</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="familyPlan"
                          checked={hasFamilyPlan}
                          onCheckedChange={(checked) => handleFamilyPlanToggle(!!checked)}
                        />
                        <label htmlFor="familyPlan" className="text-sm font-medium">
                          {t('register.plans.familyAdd')} - {t('register.plans.familyDesc')}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Safety Products */}
                  {convertedProducts.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                          {t('register.products.title')} 
                          <Badge variant="secondary" className="ml-2">{t('register.products.optional')}</Badge>
                        </h2>
                      </div>
                      <p className="text-muted-foreground">{t('register.products.subtitle')}</p>
                      <div className="grid gap-4">
                        {convertedProducts.map((product) => (
                          <div key={product.id} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={product.id}
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => handleProductToggle(product.id)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={product.id} className="font-semibold">{product.name}</Label>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <p className="font-bold text-primary">
                                  {formatDisplayCurrency(product.price, currency, languageToLocale(language))} {t('pricing.oneTimeLabel')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regional Services */}
                  {convertedRegionalServices.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{t('register.regionalServices.title')}</h2>
                      </div>
                      <p className="text-muted-foreground">{t('register.regionalServices.subtitle')}</p>
                      <div className="grid gap-4">
                        {convertedRegionalServices.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={service.id}
                                checked={selectedRegionalServices.includes(service.id)}
                                onCheckedChange={() => handleRegionalServiceToggle(service.id)}
                              />
                              <div className="flex-1">
                                <Label htmlFor={service.id} className="font-semibold">{service.name}</Label>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                <p className="font-bold text-primary">
                                  {formatDisplayCurrency(service.price, currency, languageToLocale(language))}/{t('common.perMonth')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold">{t('register.summary.title')}</h3>
                    
                    {/* Monthly Subscriptions */}
                    {calculateSubscriptionTotal() > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">{t('register.summary.monthly')}</h4>
                        {selectedMainPlan && (
                          <div className="flex justify-between text-sm">
                            <span>{convertedPlans.find(p => p.id === selectedMainPlan)?.name}</span>
                            <span>{formatDisplayCurrency(convertedPlans.find(p => p.id === selectedMainPlan)?.price || 0, currency, languageToLocale(language))}</span>
                          </div>
                        )}
                        {hasFamilyPlan && (
                          <div className="flex justify-between text-sm">
                            <span>{t('register.plans.familyAdd')}</span>
                            <span>{formatDisplayCurrency(convertedPlans.find(p => p.name.toLowerCase().includes('family'))?.price || 0, currency, languageToLocale(language))}</span>
                          </div>
                        )}
                        {selectedRegionalServices.map(serviceId => {
                          const service = convertedRegionalServices.find(s => s.id === serviceId);
                          return service ? (
                            <div key={serviceId} className="flex justify-between text-sm">
                              <span>{service.name}</span>
                              <span>{formatDisplayCurrency(service.price, currency, languageToLocale(language))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* One-time Purchases */}
                    {calculateProductTotal() > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">{t('register.summary.oneTime')}</h4>
                        {selectedProducts.map(productId => {
                          const product = convertedProducts.find(p => p.id === productId);
                          return product ? (
                            <div key={productId} className="flex justify-between text-sm">
                              <span>{product.name}</span>
                              <span>{formatDisplayCurrency(product.price, currency, languageToLocale(language))}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Total Summary */}
                    <div className="border-t pt-4 space-y-2">
                      {calculateSubscriptionTotal() > 0 && (
                        <div className="flex justify-between text-lg font-semibold">
                          <span>{t('register.summary.totalMonthly')}:</span>
                          <span>{formatDisplayCurrency(calculateSubscriptionTotal(), currency, languageToLocale(language))}</span>
                        </div>
                      )}
                      {calculateProductTotal() > 0 && (
                        <div className="flex justify-between text-lg font-semibold">
                          <span>{t('register.summary.totalOneTime')}:</span>
                          <span>{formatDisplayCurrency(calculateProductTotal(), currency, languageToLocale(language))}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={personalDetails.acceptTerms}
                      onCheckedChange={(checked) => handlePersonalDetailsChange('acceptTerms', !!checked)}
                    />
                    <label htmlFor="acceptTerms" className="text-sm font-medium">
                      {t('register.legal.acceptTerms').split('Terms of Service')[0]}
                      <button
                        type="button"
                        onClick={() => setShowTermsDialog(true)}
                        className="text-primary underline hover:no-underline"
                      >
                        {t('register.legal.termsLink')}
                      </button>
                      {t('register.legal.acceptTerms').includes('and') ? ' and ' : ' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyDialog(true)}
                        className="text-primary underline hover:no-underline"
                      >
                        {t('register.legal.privacyLink')}
                      </button>
                    </label>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinueToPayment}
                    disabled={!isFormValid() || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? t('register.buttons.processing') : t('register.buttons.continueToPayment')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('details')}
                    className="mb-4"
                  >
                    {t('register.buttons.backToDetails')}
                  </Button>
                  <EmbeddedPayment
                    plans={selectedMainPlan ? [selectedMainPlan] : []}
                    products={selectedProducts}
                    regionalServices={selectedRegionalServices}
                    userEmail={personalDetails.email}
                    firstName={personalDetails.firstName}
                    lastName={personalDetails.lastName}
                    password={personalDetails.password}
                    phone={personalDetails.phone}
                    city={personalDetails.city}
                    country={personalDetails.country}
                    currency={currency}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setCurrentStep('details')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
      <PrivacyDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog} />
    </div>
  );
};

export default AIRegister;
