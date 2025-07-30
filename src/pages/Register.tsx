import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Mail, User, ArrowRight, CheckCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    plans: [] as string[],
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
    }
  };

  const handleCheckout = async () => {
    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plans: formData.plans }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to Payment",
        description: "Complete your payment to activate your subscription.",
      });
    } catch (error) {
      console.error('Checkout error:', error);
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
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Complete your subscription</h3>
                    <p className="text-muted-foreground">Review your selection and proceed to payment</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium">Summary:</h4>
                    <p className="text-sm"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {formData.phoneNumber}</p>
                    <div className="text-sm">
                      <strong>Selected Plans:</strong>
                      <ul className="mt-1 space-y-1">
                        {formData.plans.map(planId => {
                          const planNames = {
                            personal: { name: "Personal Account", price: 1.99 },
                            guardian: { name: "Guardian Wellness", price: 4.99 },
                            family: { name: "Family Sharing", price: 0.99 },
                            callcenter: { name: "Call Centre (Spain)", price: 24.99 }
                          };
                          const plan = planNames[planId as keyof typeof planNames];
                          return (
                            <li key={planId} className="flex justify-between">
                              <span>{plan.name}</span>
                              <span>€{plan.price}/month</span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="border-t pt-2 mt-2 font-semibold">
                        <span>Total: €{formData.plans.reduce((total, planId) => {
                          const prices = { personal: 1.99, guardian: 4.99, family: 0.99, callcenter: 24.99 };
                          return total + (prices[planId as keyof typeof prices] || 0);
                        }, 0).toFixed(2)}/month</span>
                      </div>
                    </div>
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
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handleCheckout} 
                      size="lg" 
                      className="flex-1 bg-emergency hover:bg-emergency/90"
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Subscribe & Pay"}
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