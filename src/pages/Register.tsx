import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Mail, User, ArrowRight, CheckCircle, Phone, CreditCard, MapPin, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import EmbeddedPayment from "@/components/EmbeddedPayment";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    plans: [] as string[],
    // Payment step
    paymentMethod: "",
    // Questionnaire step
    emergencyContact1: "",
    emergencyContact2: "",
    medicalConditions: "",
    allergies: "",
    currentLocation: "",
    preferredLanguage: "English",
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      if (formData.plans.length === 0) {
        toast({
          title: "Plan Required",
          description: "Please select at least one subscription plan.",
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
    // Validate questionnaire fields
    if (!formData.emergencyContact1 || !formData.currentLocation || !formData.acceptTerms) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields and accept the terms.",
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
            emergency_contact_1: formData.emergencyContact1,
            emergency_contact_2: formData.emergencyContact2,
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
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-emergency/10 rounded-full">
                  <Shield className="h-8 w-8 text-emergency" />
                </div>
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
                    <h3 className="text-xl font-semibold mb-2">Choose your plan(s)</h3>
                    <p className="text-muted-foreground">Select one or more subscription plans that fit your needs</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: "personal", name: "Personal Account", price: "€1.99/month", description: "Individual emergency contact system" },
                      { id: "guardian", name: "Guardian Wellness", price: "€4.99/month", description: "Advanced health monitoring and alerts" },
                      { id: "family", name: "Family Sharing", price: "€0.99/month", description: "Perfect for families with multiple members" },
                      { id: "callcenter", name: "Call Centre (Spain)", price: "€24.99/month", description: "24/7 professional emergency response" }
                    ].map((plan) => (
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
                          <Label htmlFor={plan.id} className="font-medium">{plan.name} - {plan.price}</Label>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

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
                    userEmail={formData.email}
                    firstName={formData.firstName}
                    lastName={formData.lastName}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact1">Primary Emergency Contact *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="emergencyContact1"
                          className="pl-10"
                          placeholder="Name and phone number"
                          value={formData.emergencyContact1}
                          onChange={(e) => setFormData({...formData, emergencyContact1: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact2">Secondary Emergency Contact</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="emergencyContact2"
                          className="pl-10"
                          placeholder="Name and phone number"
                          value={formData.emergencyContact2}
                          onChange={(e) => setFormData({...formData, emergencyContact2: e.target.value})}
                        />
                      </div>
                    </div>
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