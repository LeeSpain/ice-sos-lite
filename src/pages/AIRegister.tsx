import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Sparkles, User, Phone, MapPin, CreditCard, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import EmbeddedPayment from '@/components/EmbeddedPayment';
import ChatWidget from '@/components/ai-chat/ChatWidget';

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
  address?: string;
}

const AIRegister = () => {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: ''
  });
  const [dbPlans, setDbPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [regionalServices, setRegionalServices] = useState<RegionalService[]>([]);
  const [selectedMainPlan, setSelectedMainPlan] = useState<string>('');
  const [hasFamilyPlan, setHasFamilyPlan] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedRegionalServices, setSelectedRegionalServices] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        const premiumPlan = formattedPlans.find(p => p.name === 'Premium Protection');
        if (premiumPlan) {
          setSelectedMainPlan(premiumPlan.id);
        }

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('sort_order');

        if (productsError) throw productsError;

        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price.toString()),
          currency: product.currency,
          features: Array.isArray(product.features) ? product.features.map(f => String(f)) : [],
          images: Array.isArray(product.images) ? product.images : []
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
          title: "Error loading data",
          description: "Failed to load subscription options. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, []);

  const handlePersonalDetailsChange = (field: keyof PersonalDetails, value: string) => {
    setPersonalDetails(prev => ({
      ...prev,
      [field]: value
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
    const { firstName, lastName, email, password, phone, city, country } = personalDetails;
    return firstName && lastName && email && password && phone && city && country && password.length >= 6;
  };

  // Validation with toast messages (only called on submit)
  const validatePersonalDetails = () => {
    const { firstName, lastName, email, password, phone, city, country } = personalDetails;
    if (!firstName || !lastName || !email || !password || !phone || !city || !country) {
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validatePersonalDetails()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all personal details before continuing.",
        variant: "destructive"
      });
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

      toast({
        title: "Registration Complete!",
        description: "Welcome to ICE SOS Lite. You can now access your dashboard.",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "Failed to create your account. Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  // Emma AI chat state
  const [isEmmaOpen, setIsEmmaOpen] = useState(false);

  // Emma AI interaction handler
  const handleEmmaClick = useCallback(() => {
    setIsEmmaOpen(true);
  }, []);

  // Helper functions
  const premiumPlan = dbPlans.find(p => p.name === 'Premium Protection');
  const familyPlan = dbPlans.find(p => p.name.includes('Family'));

  const calculateSubscriptionTotal = () => {
    let total = premiumPlan ? premiumPlan.price : 0;
    if (hasFamilyPlan && familyPlan) {
      total += familyPlan.price;
    }
    // Add regional services (subscription-based)
    selectedRegionalServices.forEach(serviceId => {
      const service = regionalServices.find(s => s.id === serviceId);
      if (service) total += service.price;
    });
    return total;
  };

  const calculateProductTotal = () => {
    let total = 0;
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) total += product.price;
    });
    return total;
  };

  const calculateGrandTotal = () => {
    return calculateSubscriptionTotal() + calculateProductTotal();
  };

  const getSelectedSubscriptionPlans = (): string[] => {
    const planIds: string[] = [];
    if (premiumPlan) planIds.push(premiumPlan.id);
    if (hasFamilyPlan && familyPlan) planIds.push(familyPlan.id);
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Enhanced Emma AI Assistant */}
      <div className="fixed top-20 right-4 z-50">
        <div className="relative group cursor-pointer" onClick={handleEmmaClick}>
          {/* Floating animation wrapper */}
          <div className="animate-bounce">
            {/* Main container with gradient and glow */}
            <div className="bg-gradient-to-br from-primary/20 via-white to-emergency/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-primary/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emergency/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* Enhanced Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12 border-3 border-gradient-to-r from-primary to-emergency shadow-lg ring-2 ring-white/50">
                    <AvatarImage src="/emma-avatar.png" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emergency text-white font-bold text-lg">
                      E
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-5 w-5 text-primary animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                </div>
                
                {/* Text content */}
                <div className="hidden sm:block">
                  <div className="text-base font-bold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
                    Emma AI
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Safety Advisor
                  </div>
                  <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online & Ready
                  </div>
                </div>
                
                {/* Floating action indicator */}
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-emergency rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              
              {/* Hover tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Click to chat with Emma! 💬
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          
          {/* Ambient particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-2 left-2 w-1 h-1 bg-primary rounded-full animate-pulse opacity-60"></div>
            <div className="absolute bottom-3 right-6 w-1 h-1 bg-emergency rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-8 right-2 w-1 h-1 bg-primary rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>
      
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
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={personalDetails.lastName}
                          onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalDetails.email}
                          onChange={(e) => handlePersonalDetailsChange('email', e.target.value)}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={personalDetails.password}
                          onChange={(e) => handlePersonalDetailsChange('password', e.target.value)}
                          placeholder="Enter your password (min. 6 characters)"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={personalDetails.phone}
                          onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={personalDetails.city}
                          onChange={(e) => handlePersonalDetailsChange('city', e.target.value)}
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={personalDetails.country}
                          onChange={(e) => handlePersonalDetailsChange('country', e.target.value)}
                          placeholder="Enter your country"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Protection Plans */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emergency/10 rounded-full">
                        <Shield className="h-5 w-5 text-emergency" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Protection Plans</h2>
                    </div>
                    
                    {/* Premium Protection Plan - Fixed Standard */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Standard Protection Plan:</h3>
                      {premiumPlan && (
                        <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">{premiumPlan.name}</h3>
                                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                  Standard
                                </span>
                              </div>
                              <p className="text-muted-foreground mb-3">{premiumPlan.description}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {premiumPlan.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-sm">
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="font-bold text-lg">{premiumPlan.currency}{premiumPlan.price}</div>
                              <div className="text-sm text-muted-foreground">/{premiumPlan.billing_interval}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Optional Add-ons Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-full">
                          <Star className="h-5 w-5 text-secondary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Optional Add-ons</h3>
                      </div>

                      {/* Family Plan Add-on */}
                      {familyPlan && (
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          hasFamilyPlan ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="family"
                              checked={hasFamilyPlan}
                              onCheckedChange={handleFamilyPlanToggle}
                              className="mt-1"
                            />
                            <Label htmlFor="family" className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{familyPlan.name}</h4>
                                  </div>
                                  <p className="text-muted-foreground mb-3">{familyPlan.description}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {familyPlan.features.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-sm">
                                        <Check className="h-3 w-3 text-green-500" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-bold">{familyPlan.currency}{familyPlan.price}</div>
                                  <div className="text-sm text-muted-foreground">/{familyPlan.billing_interval}</div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* Safety Products Section */}
                      {products.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground">Safety Products (One-time purchase):</h4>
                          {products.map((product) => (
                            <div key={product.id} className={`p-4 border-2 rounded-lg transition-all ${
                              selectedProducts.includes(product.id) ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={product.id}
                                  checked={selectedProducts.includes(product.id)}
                                  onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                                  className="mt-1"
                                />
                                <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-semibold mb-2">{product.name}</h4>
                                      <p className="text-muted-foreground mb-3">{product.description}</p>
                                      {product.features.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                          {product.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-sm">
                                              <Check className="h-3 w-3 text-green-500" />
                                              <span>{feature}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="font-bold">{product.currency}{product.price}</div>
                                      <div className="text-sm text-muted-foreground">One-time</div>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Regional Services Section */}
                      {regionalServices.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground">Regional Services (Monthly subscription):</h4>
                          {regionalServices.map((service) => (
                            <div key={service.id} className={`p-4 border-2 rounded-lg transition-all ${
                              selectedRegionalServices.includes(service.id) ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={service.id}
                                  checked={selectedRegionalServices.includes(service.id)}
                                  onCheckedChange={(checked) => handleRegionalServiceToggle(service.id, checked as boolean)}
                                  className="mt-1"
                                />
                                <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold">{service.name}</h4>
                                        <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                                          {service.region}
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground mb-3">{service.description}</p>
                                      {service.features.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                          {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-sm">
                                              <Check className="h-3 w-3 text-green-500" />
                                              <span>{feature}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="font-bold">{service.currency}{service.price}</div>
                                      <div className="text-sm text-muted-foreground">/month</div>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total Summary */}
                    <div className="border-t pt-6 space-y-3">
                      <div className="flex justify-between text-base">
                        <span>Monthly Subscription:</span>
                        <span>{premiumPlan?.currency || 'EUR'}{calculateSubscriptionTotal().toFixed(2)}/month</span>
                      </div>
                      {calculateProductTotal() > 0 && (
                        <div className="flex justify-between text-base">
                          <span>One-time Products:</span>
                          <span>{premiumPlan?.currency || 'EUR'}{calculateProductTotal().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xl font-bold border-t pt-3">
                        <span>Total:</span>
                        <span className="text-primary">
                          {premiumPlan?.currency || 'EUR'}{calculateGrandTotal().toFixed(2)}
                          {calculateProductTotal() > 0 && (
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                              ({calculateSubscriptionTotal().toFixed(2)}/month + {calculateProductTotal().toFixed(2)} one-time)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="pt-6">
                    <Button 
                      onClick={handleContinueToPayment}
                      className="w-full bg-emergency hover:bg-emergency/90"
                      size="lg"
                      disabled={!isFormValid()}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <EmbeddedPayment
                  plans={getSelectedSubscriptionPlans()}
                  products={selectedProducts}
                  regionalServices={selectedRegionalServices}
                  userEmail={personalDetails.email}
                  firstName={personalDetails.firstName}
                  lastName={personalDetails.lastName}
                  password={personalDetails.password}
                  phone={personalDetails.phone}
                  city={personalDetails.city}
                  country={personalDetails.country}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep('details')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chat Widget */}
      <ChatWidget
        isOpen={isEmmaOpen}
        onClose={() => setIsEmmaOpen(false)}
        userName={personalDetails.firstName || "User"}
        context="emergency_protection_registration"
      />
    </div>
  );
};

export default AIRegister;