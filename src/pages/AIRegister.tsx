import React, { useState, useEffect } from 'react';
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

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

const AIRegister = () => {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: ''
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedMainPlan, setSelectedMainPlan] = useState<'basic' | 'premium'>('basic');
  const [hasFamilyPlan, setHasFamilyPlan] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Static plan definitions based on new structure
  const staticPlans = {
    basic: {
      id: 'basic',
      name: 'Basic Protection',
      description: 'Essential emergency protection with GPS tracking and emergency alerts',
      price: 1.99,
      features: ['24/7 Emergency Response', 'GPS Location Tracking', 'Emergency Contacts', 'Basic Medical Info']
    },
    premium: {
      id: 'premium', 
      name: 'Premium Protection',
      description: 'Advanced protection with AI assistance and priority response',
      price: 4.99,
      features: ['Everything in Basic', 'AI Safety Assistant', 'Priority Response', 'Advanced Medical Records', 'Incident Reporting']
    },
    family: {
      id: 'family',
      name: 'Family Connection',
      description: 'Connect and protect your family members',
      price: 1.99,
      features: ['Family Member Linking', 'Shared Emergency Contacts', 'Group Notifications', 'Family Location Sharing']
    }
  };

  const handlePersonalDetailsChange = (field: keyof PersonalDetails, value: string) => {
    setPersonalDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMainPlanChange = (value: 'basic' | 'premium') => {
    setSelectedMainPlan(value);
  };

  const handleFamilyPlanToggle = (checked: boolean) => {
    setHasFamilyPlan(checked);
  };

  const validatePersonalDetails = () => {
    const { firstName, lastName, email, phone, city, country } = personalDetails;
    return firstName && lastName && email && phone && city && country;
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

  const handlePaymentSuccess = () => {
    toast({
      title: "Registration Complete!",
      description: "Welcome to ICE SOS Lite. You can now add additional information in your dashboard.",
    });
    // Redirect to dashboard or next step
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const calculateTotal = () => {
    let total = staticPlans[selectedMainPlan].price;
    if (hasFamilyPlan) {
      total += staticPlans.family.price;
    }
    return total;
  };

  const getSelectedPlanIds = (): string[] => {
    const planIds: string[] = [selectedMainPlan];
    if (hasFamilyPlan) {
      planIds.push('family');
    }
    return planIds;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Emma Icon in top right */}
      <div className="fixed top-24 right-6 z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-primary/20">
              <AvatarImage src="/emma-avatar.png" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                E
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-foreground">Emma</div>
              <div className="text-xs text-muted-foreground">Safety Advisor</div>
            </div>
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    
                    {/* Main Plan Selection - Radio Buttons */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Choose your protection level:</h3>
                      <RadioGroup value={selectedMainPlan} onValueChange={handleMainPlanChange}>
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          selectedMainPlan === 'basic' ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="basic" id="basic" className="mt-1" />
                            <Label htmlFor="basic" className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{staticPlans.basic.name}</h3>
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                      Popular
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mb-3">{staticPlans.basic.description}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {staticPlans.basic.features.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-sm">
                                        <Check className="h-3 w-3 text-green-500" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-bold text-lg">€{staticPlans.basic.price}</div>
                                  <div className="text-sm text-muted-foreground">/month</div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                        
                        <div className={`p-4 border-2 rounded-lg transition-all ${
                          selectedMainPlan === 'premium' ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}>
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="premium" id="premium" className="mt-1" />
                            <Label htmlFor="premium" className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{staticPlans.premium.name}</h3>
                                    <span className="bg-emergency text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                      <Star className="h-3 w-3" />
                                      Recommended
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mb-3">{staticPlans.premium.description}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {staticPlans.premium.features.map((feature, idx) => (
                                      <div key={idx} className="flex items-center gap-1 text-sm">
                                        <Check className="h-3 w-3 text-green-500" />
                                        <span>{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-bold text-lg">€{staticPlans.premium.price}</div>
                                  <div className="text-sm text-muted-foreground">/month</div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Family Plan Add-on */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Optional Add-on:</h3>
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
                                  <h3 className="font-semibold text-lg">{staticPlans.family.name}</h3>
                                </div>
                                <p className="text-muted-foreground mb-3">{staticPlans.family.description}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {staticPlans.family.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-1 text-sm">
                                      <Check className="h-3 w-3 text-green-500" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-lg">€{staticPlans.family.price}</div>
                                <div className="text-sm text-muted-foreground">/month</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total Monthly:</span>
                        <span className="text-primary">€{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="pt-6">
                    <Button 
                      onClick={handleContinueToPayment}
                      className="w-full bg-emergency hover:bg-emergency/90"
                      size="lg"
                      disabled={!validatePersonalDetails()}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <EmbeddedPayment
                  plans={getSelectedPlanIds()}
                  userEmail={personalDetails.email}
                  firstName={personalDetails.firstName}
                  lastName={personalDetails.lastName}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep('details')}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRegister;