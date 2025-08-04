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
  password: string;
  phone: string;
  city: string;
  country: string;
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
  const [selectedMainPlan, setSelectedMainPlan] = useState<string>('');
  const [hasFamilyPlan, setHasFamilyPlan] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .eq('billing_interval', 'month')
          .in('name', ['Basic Protection', 'Premium Protection', 'Family Connection'])
          .order('sort_order');

        if (error) throw error;

        const formattedPlans = data.map(plan => ({
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
        
        // Set default selection to first non-family plan
        const basicPlan = formattedPlans.find(p => p.name.includes('Basic'));
        if (basicPlan) {
          setSelectedMainPlan(basicPlan.id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error loading plans",
          description: "Failed to load subscription plans. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    fetchPlans();
  }, [toast]);

  // Get plan objects for UI display
  const getMainPlans = () => dbPlans.filter(p => !p.name.includes('Family'));
  const getFamilyPlan = () => dbPlans.find(p => p.name.includes('Family'));

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
    const selectedPlan = dbPlans.find(p => p.id === selectedMainPlan);
    let total = selectedPlan ? selectedPlan.price : 0;
    if (hasFamilyPlan) {
      const familyPlan = getFamilyPlan();
      total += familyPlan ? familyPlan.price : 0;
    }
    return total;
  };

  const getSelectedPlanIds = (): string[] => {
    const planIds: string[] = [selectedMainPlan];
    if (hasFamilyPlan) {
      const familyPlan = getFamilyPlan();
      if (familyPlan) {
        planIds.push(familyPlan.id);
      }
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
                     
                     {/* Main Plan Selection - Radio Buttons */}
                     <div className="space-y-4">
                       <h3 className="font-medium text-foreground">Choose your protection level:</h3>
                       {getMainPlans().length > 0 ? (
                         <RadioGroup value={selectedMainPlan} onValueChange={handleMainPlanChange}>
                           {getMainPlans().map((plan) => (
                             <div key={plan.id} className={`p-4 border-2 rounded-lg transition-all ${
                               selectedMainPlan === plan.id ? 'border-primary bg-primary/5' : 'border-muted'
                             }`}>
                               <div className="flex items-start gap-3">
                                 <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                                 <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                                   <div className="flex justify-between items-start">
                                     <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-2">
                                         <h3 className="font-semibold text-lg">{plan.name}</h3>
                                         {plan.is_popular && (
                                           <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                             Popular
                                           </span>
                                         )}
                                         {plan.name.includes('Premium') && (
                                           <span className="bg-emergency text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                             <Star className="h-3 w-3" />
                                             Recommended
                                           </span>
                                         )}
                                       </div>
                                       <p className="text-muted-foreground mb-3">{plan.description}</p>
                                       <div className="grid grid-cols-2 gap-2">
                                         {plan.features.map((feature, idx) => (
                                           <div key={idx} className="flex items-center gap-1 text-sm">
                                             <Check className="h-3 w-3 text-green-500" />
                                             <span>{feature}</span>
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                     <div className="text-right ml-4">
                                       <div className="font-bold text-lg">{plan.currency}{plan.price}</div>
                                       <div className="text-sm text-muted-foreground">/{plan.billing_interval}</div>
                                     </div>
                                   </div>
                                 </Label>
                               </div>
                             </div>
                           ))}
                         </RadioGroup>
                       ) : (
                         <div className="text-center text-muted-foreground">Loading plans...</div>
                        )}
                     </div>

                     {/* Family Plan Add-on */}
                     {getFamilyPlan() && (
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
                                     <h3 className="font-semibold text-lg">{getFamilyPlan()!.name}</h3>
                                   </div>
                                   <p className="text-muted-foreground mb-3">{getFamilyPlan()!.description}</p>
                                   <div className="grid grid-cols-2 gap-2">
                                     {getFamilyPlan()!.features.map((feature, idx) => (
                                       <div key={idx} className="flex items-center gap-1 text-sm">
                                         <Check className="h-3 w-3 text-green-500" />
                                         <span>{feature}</span>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                                 <div className="text-right ml-4">
                                   <div className="font-bold text-lg">{getFamilyPlan()!.currency}{getFamilyPlan()!.price}</div>
                                   <div className="text-sm text-muted-foreground">/{getFamilyPlan()!.billing_interval}</div>
                                 </div>
                               </div>
                             </Label>
                           </div>
                          </div>
                        </div>
                     )}

                     {/* Total */}
                     <div className="border-t pt-4">
                       <div className="flex justify-between items-center text-xl font-bold">
                         <span>Total Monthly:</span>
                         <span className="text-primary">{dbPlans.find(p => p.id === selectedMainPlan)?.currency || '€'}{calculateTotal().toFixed(2)}</span>
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
                  password={personalDetails.password}
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