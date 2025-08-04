import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Shield, Sparkles, User, Phone, Heart, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface RegistrationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  plans?: string[];
  emergencyContacts?: Array<{name: string, phone: string, relationship: string}>;
  medicalConditions?: string;
  allergies?: string;
  currentLocation?: string;
  preferredLanguage?: string;
  complete?: boolean;
}

const AIRegister = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const [currentStep, setCurrentStep] = useState('introduction');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add Emma's welcome message
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hi there! I'm Emma, your personal safety advisor at ICE SOS Lite. 🛡️\n\nI'm here to help you set up the perfect emergency protection plan. Think of me as your safety consultant who will guide you through a simple conversation to understand your needs.\n\nTo get started, may I have your first name?",
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-registration', {
        body: {
          message: inputMessage,
          sessionId,
          currentStep,
          registrationData
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update registration data and step if provided
      if (data.registrationData) {
        setRegistrationData(data.registrationData);
      }
      if (data.currentStep) {
        setCurrentStep(data.currentStep);
      }

      // Check if registration is complete
      if (data.registrationData?.complete) {
        // Redirect to success page after a brief delay
        setTimeout(() => {
          window.location.href = '/registration-success';
        }, 3000);
      }

    } catch (error) {
      console.error('Registration chat error:', error);
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting right now. Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      
      {/* Full Page Registration Form */}
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
                Emergency Protection Registration
              </CardTitle>
              <CardDescription className="text-lg">
                Complete your safety profile and emergency protection setup
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">First Name</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.firstName || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Last Name</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.lastName || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Email Address</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.email || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Phone Number</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.phoneNumber || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Protection Plans */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emergency/10 rounded-full">
                      <Shield className="h-5 w-5 text-emergency" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Protection Plans</h2>
                  </div>
                  <div className="space-y-3">
                    {registrationData.plans && registrationData.plans.length > 0 ? (
                      registrationData.plans.map((plan, index) => (
                        <div key={index} className="px-4 py-3 border-2 rounded-lg bg-primary/5 border-primary/20">
                          <div className="font-medium text-foreground">{plan}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-muted-foreground min-h-[48px] flex items-center">
                        No protection plans selected yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-500/10 rounded-full">
                      <Phone className="h-5 w-5 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Emergency Contacts</h2>
                  </div>
                  <div className="space-y-4">
                    {registrationData.emergencyContacts && registrationData.emergencyContacts.length > 0 ? (
                      registrationData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="p-4 border-2 rounded-lg bg-orange-500/5 border-orange-500/20">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                              <div className="font-medium text-foreground">{contact.name}</div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                              <div className="font-medium text-foreground">{contact.phone}</div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship</label>
                              <div className="font-medium text-foreground">{contact.relationship}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-muted-foreground min-h-[48px] flex items-center">
                        No emergency contacts added yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-full">
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Medical Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Medical Conditions</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[80px] flex items-start pt-4">
                        {registrationData.medicalConditions || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Allergies</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[80px] flex items-start pt-4">
                        {registrationData.allergies || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Additional Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Current Location</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.currentLocation || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Preferred Language</label>
                      <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 text-foreground min-h-[48px] flex items-center">
                        {registrationData.preferredLanguage || <span className="text-muted-foreground">Not provided yet</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Registration Status</h2>
                  </div>
                  <div className="px-4 py-3 border-2 rounded-lg bg-muted/20 min-h-[48px] flex items-center">
                    {registrationData.complete ? (
                      <span className="text-green-600 font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Registration Complete
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Registration In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRegister;