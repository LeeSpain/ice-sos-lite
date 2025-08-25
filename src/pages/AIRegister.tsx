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
import SEO from '@/components/SEO';


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
  const [testingMode, setTestingMode] = useState(false);
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
      const originalPrice = parseFloat(plan.price.toString());
      const convertedPrice = convertCurrency(originalPrice, 'EUR', currency);
      const formattedPrice = formatDisplayCurrency(convertedPrice, currency, languageToLocale(language));
      console.log(`📋 Plan "${plan.name}": ${originalPrice} EUR → ${convertedPrice} ${currency} → ${formattedPrice}`);
      return {
        ...plan,
        convertedPrice,
        formattedPrice
      };
    });
    console.log('✅ Final converted plans:', converted.map(p => ({ name: p.name, formatted: p.formattedPrice })));
    return converted;
  }, [dbPlans, currency, language]);

  const convertedProducts = useMemo(() => {
    console.log('🔄 [RECALCULATING] Converting products, currency:', currency, 'products:', products.length);
    if (products.length === 0) {
      console.log('⚠️ No products to convert yet');
      return [];
    }
    const converted = products.map(product => {
      const originalPrice = parseFloat(product.price.toString());
      const convertedPrice = convertCurrency(originalPrice, 'EUR', currency);
      const formattedPrice = formatDisplayCurrency(convertedPrice, currency, languageToLocale(language));
      console.log(`📦 Product "${product.name}": ${originalPrice} EUR → ${convertedPrice} ${currency} → ${formattedPrice}`);
      return {
        ...product,
        convertedPrice,
        formattedPrice
      };
    });
    console.log('✅ Final converted products:', converted.map(p => ({ name: p.name, formatted: p.formattedPrice })));
    return converted;
  }, [products, currency, language]);

  const convertedRegionalServices = useMemo(() => {
    console.log('🔄 [RECALCULATING] Converting regional services, currency:', currency, 'services:', regionalServices.length);
    if (regionalServices.length === 0) {
      console.log('⚠️ No regional services to convert yet');
      return [];
    }
    const converted = regionalServices.map(service => {
      const originalPrice = parseFloat(service.price.toString());
      const convertedPrice = convertCurrency(originalPrice, 'EUR', currency);
      const formattedPrice = formatDisplayCurrency(convertedPrice, currency, languageToLocale(language));
      console.log(`🌍 Service "${service.name}": ${originalPrice} EUR → ${convertedPrice} ${currency} → ${formattedPrice}`);
      return {
        ...service,
        convertedPrice,
        formattedPrice
      };
    });
    console.log('✅ Final converted regional services:', converted.map(s => ({ name: s.name, formatted: s.formattedPrice })));
    return converted;
  }, [regionalServices, currency, language]);

  // Fetch plans, products, and regional services from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .eq('billing_interval', 'month')
          .order('sort_order');

        if (plansError) throw plansError;

        const formattedPlans = plansData.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          price: parseFloat(plan.price.toString()),
          currency: plan.currency,
          billing_interval: plan.billing_interval,
          features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : [],
          is_popular: plan.is_popular
        }));

        setDbPlans(formattedPlans);
        
        // Set Premium Protection as default (fixed standard plan)
        const defaultPremiumPlan = formattedPlans.find(p => p.name === 'Premium Protection');
        if (defaultPremiumPlan) {
          setSelectedMainPlan(defaultPremiumPlan.id);
        }

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('status', ['active', 'coming_soon'])
          .order('sort_order');

        if (productsError) throw productsError;

        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price.toString()),
          currency: product.currency,
          features: Array.isArray(product.features) ? product.features.map(f => String(f)) : [],
          images: Array.isArray(product.images) ? product.images : [],
          status: product.status || 'active'
        }));

        setProducts(formattedProducts);

        // Fetch regional services
        const { data: servicesData, error: servicesError } = await supabase
          .from('regional_services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (servicesError) throw servicesError;

        const formattedServices = servicesData.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: parseFloat(service.price.toString()),
          currency: service.currency,
          region: service.region,
          features: Array.isArray(service.features) ? service.features.map(f => String(f)) : []
        }));

        setRegionalServices(formattedServices);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: t('register.loadErrorTitle', { defaultValue: 'Error loading data' }),
          description: t('register.loadErrorDesc', { defaultValue: 'Failed to load subscription options. Please refresh the page.' }),
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, []);

  const handlePersonalDetailsChange = (field: keyof PersonalDetails, value: string | boolean) => {
    setPersonalDetails(prev => ({
      ...prev,
      [field]: field === 'acceptTerms' ? value === 'true' || value === true : value
    }));
  };

  const handleMainPlanChange = (value: string) => {
    setSelectedMainPlan(value);
  };

  const handleFamilyPlanToggle = (checked: boolean) => {
    setHasFamilyPlan(checked);
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => 
      checked 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  const handleRegionalServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedRegionalServices(prev => 
      checked 
        ? [...prev, serviceId]
        : prev.filter(id => id !== serviceId)
    );
  };

  // Simple validation for button disabled state (no side effects)
  const isFormValid = () => {
    const { firstName, lastName, email, password, phone, city, country, acceptTerms } = personalDetails;
    return firstName && lastName && email && password && phone && city && country && acceptTerms && password.length >= 6;
  };

  // Validation with toast messages (only called on submit)
  const validatePersonalDetails = () => {
    const { firstName, lastName, email, password, phone, city, country, acceptTerms } = personalDetails;
    if (!firstName || !lastName || !email || !password || !phone || !city || !country) {
      return false;
    }
    
    if (!acceptTerms) {
      toast({
        title: t('register.termsErrorTitle', { defaultValue: 'Terms Required' }),
        description: t('register.termsErrorDesc', { defaultValue: 'You must accept the Terms of Service and Privacy Policy to continue.' }),
        variant: "destructive"
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: t('register.invalidPasswordTitle', { defaultValue: 'Invalid Password' }),
        description: t('register.invalidPasswordDesc', { defaultValue: 'Password must be at least 6 characters long.' }),
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validatePersonalDetails()) {
      toast({
        title: t('register.incompleteInfoTitle', { defaultValue: 'Incomplete Information' }),
        description: t('register.incompleteInfoDesc', { defaultValue: 'Please fill in all personal details before continuing.' }),
        variant: "destructive"
      });
      return;
    }
    
    // If testing mode is enabled, skip payment and complete registration directly
    if (testingMode) {
      handlePaymentSuccess();
      return;
    }
    
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async () => {
    try {
      // Create Supabase user account
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: personalDetails.email,
        password: personalDetails.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: personalDetails.firstName,
            last_name: personalDetails.lastName,
            phone: personalDetails.phone
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          // User exists, try to sign them in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: personalDetails.email,
            password: personalDetails.password,
          });
          
          if (signInError) {
            toast({
              title: "Account Creation Failed",
              description: "Email already exists but password doesn't match. Please use a different email or sign in with existing credentials.",
              variant: "destructive"
            });
            return;
          }
        } else {
          throw authError;
        }
      }

      // Create or update profile record
      if (authData?.user || !authError) {
        const userId = authData?.user?.id;
        if (userId) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              first_name: personalDetails.firstName,
              last_name: personalDetails.lastName,
              phone: personalDetails.phone,
              address: `${personalDetails.city}, ${personalDetails.country}`,
              country: personalDetails.country,
              emergency_contacts: [],
              medical_conditions: [],
              allergies: [],
              medications: []
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      }

      // Store welcome data for the PaymentSuccess page
      const welcomeData = {
        firstName: personalDetails.firstName,
        lastName: personalDetails.lastName,
        email: personalDetails.email,
        subscriptionPlans: getSelectedSubscriptionPlans(),
        products: selectedProducts,
        regionalServices: selectedRegionalServices,
        totalAmount: calculateGrandTotal()
      };
      
      sessionStorage.setItem('welcomeData', JSON.stringify(welcomeData));

      toast({
        title: t('register.successTitle', { defaultValue: 'Registration Complete!' }),
        description: t('register.successDesc', { defaultValue: 'Welcome to ICE SOS Lite. You can now access your dashboard.' }),
      });
      
      // Redirect to welcome page instead of dashboard
      setTimeout(() => {
        window.location.href = '/welcome';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t('register.errorTitle', { defaultValue: 'Registration Error' }),
        description: t('register.errorDesc', { defaultValue: 'Failed to create your account. Please try again or contact support.' }),
        variant: "destructive"
      });
    }
  };


  // Helper functions using converted data
  const convertedPremiumPlan = convertedPlans.find(p => p.name === 'Premium Protection');
  const convertedFamilyPlan = convertedPlans.find(p => p.name.includes('Family'));

  // Tax rates
  const PRODUCT_IVA_RATE = 0.21; // 21% for products
  const SERVICE_IVA_RATE = 0.10; // 10% for regional services

  const calculateSubscriptionTotal = () => {
    let total = convertedPremiumPlan ? convertedPremiumPlan.convertedPrice : 0;
    if (hasFamilyPlan && convertedFamilyPlan) {
      total += convertedFamilyPlan.convertedPrice;
    }
    // Add regional services (subscription-based) with IVA
    selectedRegionalServices.forEach(serviceId => {
      const service = convertedRegionalServices.find(s => s.id === serviceId);
      if (service) {
        const priceWithIva = service.convertedPrice * (1 + SERVICE_IVA_RATE);
        total += priceWithIva;
      }
    });
    return total;
  };

  const calculateProductTotal = () => {
    let total = 0;
    selectedProducts.forEach(productId => {
      const product = convertedProducts.find(p => p.id === productId);
      if (product) {
        const priceWithIva = product.convertedPrice * (1 + PRODUCT_IVA_RATE);
        total += priceWithIva;
      }
    });
    return total;
  };

  const calculateProductsSubtotal = () => {
    let total = 0;
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) total += product.price;
    });
    return total;
  };

  const calculateServicesSubtotal = () => {
    let total = 0;
    selectedRegionalServices.forEach(serviceId => {
      const service = regionalServices.find(s => s.id === serviceId);
      if (service) total += service.price;
    });
    return total;
  };

  const calculateGrandTotal = () => {
    return calculateSubscriptionTotal() + calculateProductTotal();
  };

  const getSelectedSubscriptionPlans = (): string[] => {
    const planIds: string[] = [];
    if (convertedPremiumPlan) planIds.push(convertedPremiumPlan.id);
    if (hasFamilyPlan && convertedFamilyPlan) planIds.push(convertedFamilyPlan.id);
    // Add selected regional services as they are subscription-based
    planIds.push(...selectedRegionalServices);
    return planIds;
  };

  const getAllSelections = () => {
    return {
      subscriptionPlans: getSelectedSubscriptionPlans(),
      products: selectedProducts,
      regionalServices: selectedRegionalServices
    };
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Join ICE SOS Lite – Emergency Protection Registration",
    "description": "Register for ICE SOS Lite emergency protection service. Quick setup with AI assistance and instant access to life-saving features.",
    "provider": {
      "@type": "Organization",
      "name": "ICE SOS Lite",
      "url": "https://icesoslite.com"
    },
    "mainEntity": {
      "@type": "Service",
      "name": "ICE SOS Lite Emergency Protection",
      "category": "Emergency Response Service",
      "provider": {
        "@type": "Organization",
        "name": "ICE SOS Lite"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SEO 
        title="Join ICE SOS Lite – Emergency Protection Registration"
        description="Register for ICE SOS Lite emergency protection service. Quick setup with AI assistance and instant access to life-saving features for you and your family."
        canonical="/ai-register"
        structuredData={structuredData}
      />
      <Navigation />
      
      
      {/* Registration Form */}
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center border-b bg-gradient-to-r from-emergency/5 to-primary/5 py-6">
              <div className="flex justify-center items-center gap-3 mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {currentStep === 'details' ? 'Emergency Protection Registration' : 'Complete Your Payment'}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep === 'details' ? 'Join ICE SOS Lite and secure your emergency protection' : 'Finalize your subscription and start protecting what matters most'}
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
                      <h2 className="text-xl font-bold text-foreground">Personal Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={personalDetails.firstName}
                          onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)}
                          placeholder="Enter your first name"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={personalDetails.lastName}
                          onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalDetails.email}
                          onChange={(e) => handlePersonalDetailsChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={personalDetails.password}
                          onChange={(e) => handlePersonalDetailsChange('password', e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={personalDetails.phone}
                          onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={personalDetails.city}
                          onChange={(e) => handlePersonalDetailsChange('city', e.target.value)}
                          placeholder="Enter your city"
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={personalDetails.country}
                          onChange={(e) => handlePersonalDetailsChange('country', e.target.value)}
                          placeholder="Enter your country"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Protection Plans Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Protection Plans</h2>
                    </div>
                    
                    {/* Core Protection Plan Display */}
                    <div className="p-6 border-2 border-primary rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Premium Protection Plan</h3>
                          <p className="text-sm text-muted-foreground mt-1">Your core protection package (included)</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {convertedPremiumPlan?.formattedPrice || '€19.99'}/month
                          </div>
                          <Badge variant="default" className="mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Included
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Family Plan Option */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Additional Family Protection</h3>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="familyPlan"
                          checked={hasFamilyPlan}
                          onCheckedChange={handleFamilyPlanToggle}
                        />
                        <div className="flex-1">
                          <Label htmlFor="familyPlan" className="text-base font-medium cursor-pointer">
                            Family Protection Plan
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Extend protection to family members
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {convertedFamilyPlan?.formattedPrice || '€9.99'}/month
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Products */}
                  {convertedProducts.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Optional Add-ons</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {convertedProducts.map((product) => (
                          <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  id={`product-${product.id}`}
                                  checked={selectedProducts.includes(product.id)}
                                  onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                                />
                                <div className="space-y-1">
                                  <Label 
                                    htmlFor={`product-${product.id}`}
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {product.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {product.description}
                                  </p>
                                  {product.status === 'coming_soon' && (
                                    <Badge variant="outline" className="text-xs">
                                      Coming Soon
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-foreground">
                                  {product.formattedPrice}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  one-time
                                </div>
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
                        <h2 className="text-xl font-bold text-foreground">Regional Services</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {convertedRegionalServices.map((service) => (
                          <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  id={`service-${service.id}`}
                                  checked={selectedRegionalServices.includes(service.id)}
                                  onCheckedChange={(checked) => handleRegionalServiceToggle(service.id, checked as boolean)}
                                />
                                <div className="space-y-1">
                                  <Label 
                                    htmlFor={`service-${service.id}`}
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {service.description}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {service.region}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-foreground">
                                  {service.formattedPrice}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  per month
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-primary/10 to-emergency/10 rounded-lg p-6 border-2 border-primary/20 shadow-lg">
                    <div className="space-y-3">
                      {/* Monthly Subscription Total */}
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-medium text-foreground">Monthly Subscription Total:</span>
                        <span className="font-bold text-primary text-xl">
                          {formatDisplayCurrency(calculateSubscriptionTotal(), currency, languageToLocale(language))}
                        </span>
                      </div>
                      
                      {/* One-time Products Total */}
                      {calculateProductTotal() > 0 && (
                        <div className="flex justify-between items-center text-lg border-t pt-3">
                          <span className="font-medium text-foreground">One-time Products Total:</span>
                          <span className="font-bold text-foreground text-xl">
                            {formatDisplayCurrency(calculateProductTotal(), currency, languageToLocale(language))}
                          </span>
                        </div>
                      )}
                      
                      {/* Grand Total */}
                      <div className="flex justify-between items-center text-xl font-bold border-t-2 pt-3 border-primary/30">
                        <span className="text-foreground">Total Today:</span>
                        <span className="text-emergency text-2xl">
                          {formatDisplayCurrency(calculateGrandTotal(), currency, languageToLocale(language))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tax Notice */}
                  <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg border border-border/30">
                    <strong>Tax Information:</strong> Products include 21% IVA, Regional Services include 10% IVA. All prices shown include applicable taxes.
                  </div>

                  {/* Terms and Conditions Checkbox - Enhanced Visibility */}
                  <div className="space-y-3 mt-6">
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      personalDetails.acceptTerms 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-destructive/50 bg-destructive/5 shadow-sm'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          id="acceptTerms"
                          checked={personalDetails.acceptTerms}
                          onCheckedChange={(checked) => handlePersonalDetailsChange('acceptTerms', checked)}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor="acceptTerms" 
                            className="text-sm font-medium leading-relaxed cursor-pointer text-foreground"
                          >
                            I agree to the{' '}
                            <button
                              type="button"
                              onClick={() => setShowTermsDialog(true)}
                              className="text-primary hover:text-primary/80 underline underline-offset-2 font-semibold"
                            >
                              Terms of Service
                            </button>
                            {' '}and{' '}
                            <button
                              type="button"
                              onClick={() => setShowPrivacyDialog(true)}
                              className="text-primary hover:text-primary/80 underline underline-offset-2 font-semibold"
                            >
                              Privacy Policy
                            </button>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue to Payment Button */}
                  <div className="flex justify-center pt-6">
                    <Button 
                      onClick={handleContinueToPayment}
                      disabled={!isFormValid()}
                      size="lg"
                      className="px-12 py-3 text-lg font-semibold"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <EmbeddedPayment
                  plans={getSelectedSubscriptionPlans()}
                  products={getAllSelections().products}
                  regionalServices={getAllSelections().regionalServices}
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
                  testingMode={testingMode}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legal Dialogs */}
      <TermsDialog 
        open={showTermsDialog} 
        onOpenChange={setShowTermsDialog}
      />
      <PrivacyDialog 
        open={showPrivacyDialog} 
        onOpenChange={setShowPrivacyDialog}
      />
    </div>
  );
};

export default AIRegister;