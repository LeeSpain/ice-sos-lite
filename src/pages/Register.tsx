import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Mail, User, ArrowRight, CheckCircle, Phone, CreditCard, MapPin, Heart, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import EmbeddedPayment from "@/components/EmbeddedPayment";
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    plans: [] as string[],
    products: [] as string[],
    regionalServices: [] as string[],
    // Payment step
    paymentMethod: "",
    // Questionnaire step
    emergencyContacts: [{ name: "", phone: "", relationship: "" }] as Array<{name: string, phone: string, relationship: string}>,
    medicalConditions: "",
    allergies: "",
    currentLocation: "",
    preferredLanguage: "English",
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [regionalServices, setRegionalServices] = useState<any[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currency, language } = usePreferences();
  
  // Convert all data based on current currency using useMemo for proper re-rendering
  const convertedSubscriptionPlans = useMemo(() => {
    return subscriptionPlans.map(plan => ({
      ...plan,
      convertedPrice: convertCurrency(parseFloat(plan.price.toString()), 'EUR', currency),
      formattedPrice: formatDisplayCurrency(
        convertCurrency(parseFloat(plan.price.toString()), 'EUR', currency), 
        currency, 
        languageToLocale(language)
      )
    }));
  }, [subscriptionPlans, currency, language]);

  const convertedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      convertedPrice: convertCurrency(parseFloat(product.price.toString()), 'EUR', currency),
      formattedPrice: formatDisplayCurrency(
        convertCurrency(parseFloat(product.price.toString()), 'EUR', currency), 
        currency, 
        languageToLocale(language)
      )
    }));
  }, [products, currency, language]);

  const convertedRegionalServices = useMemo(() => {
    return regionalServices.map(service => ({
      ...service,
      convertedPrice: convertCurrency(parseFloat(service.price.toString()), 'EUR', currency),
      formattedPrice: formatDisplayCurrency(
        convertCurrency(parseFloat(service.price.toString()), 'EUR', currency), 
        currency, 
        languageToLocale(language)
      )
    }));
  }, [regionalServices, currency, language]);

  // Fetch data from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (plansError) throw plansError;
        setSubscriptionPlans(plansData || []);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('sort_order', { ascending: true });
        
        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch regional services
        const { data: servicesData, error: servicesError } = await supabase
          .from('regional_services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (servicesError) throw servicesError;
        setRegionalServices(servicesData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription options. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, []); // Only fetch once on mount

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (formData.plans.length === 0 && formData.products.length === 0 && formData.regionalServices.length === 0) {
        toast({
          title: "Selection Required",
          description: "Please select at least one subscription plan, product, or service.",
          variant: "destructive"
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Payment overview step - no validation needed, just move to questionnaire
      setStep(4);
    }
  };

  const handlePaymentSuccess = () => {
    // Move to questionnaire step after successful payment
    setStep(4);
  };

  const handleCheckout = async () => {
    // Validate questionnaire fields - at least one emergency contact required
    const hasValidEmergencyContact = formData.emergencyContacts.some(contact => 
      contact.name.trim() && contact.phone.trim()
    );
    
    if (!hasValidEmergencyContact || !formData.currentLocation || !formData.acceptTerms) {
      toast({
        title: "Missing Information",
        description: "Please add at least one emergency contact, your location, and accept the terms.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update user metadata with all collected information
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            phone: formData.phoneNumber, // Add both formats for consistency
            emergency_contacts: JSON.stringify(formData.emergencyContacts.filter(contact => 
              contact.name.trim() && contact.phone.trim()
            )),
            medical_conditions: formData.medicalConditions,
            allergies: formData.allergies,
            current_location: formData.currentLocation,
            preferred_language: formData.preferredLanguage,
          }
        }
      });

      if (signUpError) throw signUpError;
      
      toast({
        title: "Registration Complete!",
        description: "Your account has been created successfully.",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard?success=true';
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-emergency/10 rounded-full">
                      <Shield className="h-8 w-8 text-emergency" />
                    </div>
                  </div>
                </div>
                <LanguageCurrencySelector compact />
              </div>
              <CardTitle className="text-3xl font-bold">Join ICE SOS Platform</CardTitle>
              <CardDescription className="text-lg">
                Register now to receive your personalized app download link via email
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Let's get to know you</h3>
                    <p className="text-muted-foreground">First, tell us a bit about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          className="pl-10"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        className="pl-10"
                        placeholder="+44 7700 900000"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <Button onClick={handleNextStep} size="lg" className="w-full bg-emergency hover:bg-emergency/90">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Choose your plan(s) and products</h3>
                    <p className="text-muted-foreground">Select subscription plans, products, and services that fit your needs</p>
                  </div>

                   {/* Subscription Plans */}
                   {convertedSubscriptionPlans.length > 0 && (
                     <div key={`plans-${currency}`} className="space-y-4">
                       <h4 className="font-medium text-lg">Monthly Subscription Plans</h4>
                       {convertedSubscriptionPlans.map((plan) => (
                         <div key={plan.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                           <Checkbox
                             id={plan.id}
                             checked={formData.plans.includes(plan.id)}
                             onCheckedChange={(checked) => {
                               if (checked) {
                                 setFormData({
                                   ...formData,
                                   plans: [...formData.plans, plan.id]
                                 });
                               } else {
                                 setFormData({
                                   ...formData,
                                   plans: formData.plans.filter(p => p !== plan.id)
                                 });
                               }
                             }}
                           />
                           <div className="flex-1">
                             <Label htmlFor={plan.id} className="font-medium">{plan.name} - {plan.formattedPrice}/month</Label>
                             <p className="text-sm text-muted-foreground">{plan.description}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Products */}
                   {convertedProducts.length > 0 && (
                     <div key={`products-${currency}`} className="space-y-4">
                       <h4 className="font-medium text-lg">Safety Products (One-time purchase)</h4>
                       {convertedProducts.map((product) => (
                         <div key={product.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                           <Checkbox
                             id={product.id}
                             checked={formData.products.includes(product.id)}
                             onCheckedChange={(checked) => {
                               if (checked) {
                                 setFormData({
                                   ...formData,
                                   products: [...formData.products, product.id]
                                 });
                               } else {
                                 setFormData({
                                   ...formData,
                                   products: formData.products.filter(p => p !== product.id)
                                 });
                               }
                             }}
                           />
                           <div className="flex-1">
                             <Label htmlFor={product.id} className="font-medium">{product.name} - {product.formattedPrice}</Label>
                             <p className="text-sm text-muted-foreground">{product.description}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Regional Services */}
                   {convertedRegionalServices.length > 0 && (
                     <div key={`services-${currency}`} className="space-y-4">
                       <h4 className="font-medium text-lg">Regional Services</h4>
                       {convertedRegionalServices.map((service) => (
                         <div key={service.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                           <Checkbox
                             id={service.id}
                             checked={formData.regionalServices.includes(service.id)}
                             onCheckedChange={(checked) => {
                               if (checked) {
                                 setFormData({
                                   ...formData,
                                   regionalServices: [...formData.regionalServices, service.id]
                                 });
                               } else {
                                 setFormData({
                                   ...formData,
                                   regionalServices: formData.regionalServices.filter(s => s !== service.id)
                                 });
                               }
                             }}
                           />
                            <div className="flex-1">
                              <Label htmlFor={service.id} className="font-medium">{service.name} ({service.region}) - {service.formattedPrice}/month</Label>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNextStep} size="lg" className="flex-1 bg-emergency hover:bg-emergency/90">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CreditCard className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                    <p className="text-muted-foreground">Complete your payment securely</p>
                  </div>

                  <EmbeddedPayment 
                    plans={formData.plans}
                    products={formData.products}
                    regionalServices={formData.regionalServices}
                    userEmail={formData.email}
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    password={formData.password || Math.random().toString(36).slice(-8)}
                    currency={currency}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => setStep(2)}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Heart className="h-16 w-16 text-emergency mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Complete Your Emergency Profile</h3>
                    <p className="text-muted-foreground">Help us protect you better with these details</p>
                  </div>

                  {/* Emergency Contacts Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Emergency Contacts *</Label>
                      <span className="text-sm text-muted-foreground">
                        {formData.emergencyContacts.length}/5 contacts
                      </span>
                    </div>
                    
                    {formData.emergencyContacts.map((contact, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/25">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Contact {index + 1}</h4>
                          {formData.emergencyContacts.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
                                setFormData({...formData, emergencyContacts: newContacts});
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`contactName${index}`}>Full Name</Label>
                            <Input
                              id={`contactName${index}`}
                              placeholder="Contact's full name"
                              value={contact.name}
                              onChange={(e) => {
                                const newContacts = [...formData.emergencyContacts];
                                newContacts[index] = {...newContacts[index], name: e.target.value};
                                setFormData({...formData, emergencyContacts: newContacts});
                              }}
                              required={index === 0}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`contactPhone${index}`}>Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`contactPhone${index}`}
                                className="pl-10"
                                placeholder="+44 7700 900000"
                                value={contact.phone}
                                onChange={(e) => {
                                  const newContacts = [...formData.emergencyContacts];
                                  newContacts[index] = {...newContacts[index], phone: e.target.value};
                                  setFormData({...formData, emergencyContacts: newContacts});
                                }}
                                required={index === 0}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`contactRelationship${index}`}>Relationship</Label>
                          <Select 
                            value={contact.relationship} 
                            onValueChange={(value) => {
                              const newContacts = [...formData.emergencyContacts];
                              newContacts[index] = {...newContacts[index], relationship: value};
                              setFormData({...formData, emergencyContacts: newContacts});
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse/Partner</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="colleague">Colleague</SelectItem>
                              <SelectItem value="neighbor">Neighbor</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    
                    {formData.emergencyContacts.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            emergencyContacts: [
                              ...formData.emergencyContacts,
                              { name: "", phone: "", relationship: "" }
                            ]
                          });
                        }}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Emergency Contact
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentLocation">Current Location/Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentLocation"
                        className="pl-10"
                        placeholder="Your current address"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="Any medical conditions emergency responders should know about"
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Any allergies emergency responders should know about"
                      value={formData.allergies}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData({...formData, preferredLanguage: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I accept the{" "}
                      <a href="#" className="text-primary hover:underline">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={handleCheckout} 
                      size="lg" 
                      className="flex-1 bg-emergency hover:bg-emergency/90"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Complete Registration & Pay"}
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    After payment, you'll receive your app download link via email
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;