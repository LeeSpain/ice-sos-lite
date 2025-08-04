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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <Navigation />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-6xl h-[80vh] flex gap-6">
          {/* Registration Details Section - Now on the LEFT */}
          <Card className="flex-1 bg-white/95 backdrop-blur-sm shadow-2xl border-0 flex flex-col">
            <CardHeader className="text-center border-b bg-gradient-to-r from-emergency/5 to-primary/5 py-4">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Your Registration Details
              </CardTitle>
              <CardDescription>
                Your information will appear here as you chat with Emma
              </CardDescription>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        {registrationData.firstName || <span className="text-muted-foreground">Provided through conversation with Emma</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        {registrationData.lastName || <span className="text-muted-foreground">Provided through conversation with Emma</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                      {registrationData.email || <span className="text-muted-foreground">Provided through conversation with Emma</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                      {registrationData.phoneNumber || <span className="text-muted-foreground">Provided through conversation with Emma</span>}
                    </div>
                  </div>
                </div>

                {/* Selected Plans */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Selected Protection Plans</h3>
                  </div>
                  <div className="space-y-2">
                    {registrationData.plans && registrationData.plans.length > 0 ? (
                      registrationData.plans.map((plan, index) => (
                        <div key={index} className="px-3 py-2 border rounded-md bg-primary/5 text-sm">
                          {plan}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        <span className="text-muted-foreground">Plans will be selected during conversation</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Emergency Contacts</h3>
                  </div>
                  <div className="space-y-3">
                    {registrationData.emergencyContacts && registrationData.emergencyContacts.length > 0 ? (
                      registrationData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="p-3 border rounded-md bg-primary/5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {contact.name}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span> {contact.phone}
                            </div>
                            <div>
                              <span className="font-medium">Relationship:</span> {contact.relationship}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        <span className="text-muted-foreground">Emergency contacts will be added during conversation</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Medical Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[60px] flex items-start pt-3">
                        {registrationData.medicalConditions || <span className="text-muted-foreground">Medical conditions will be discussed with Emma</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[60px] flex items-start pt-3">
                        {registrationData.allergies || <span className="text-muted-foreground">Allergies will be discussed with Emma</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Additional Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Location</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        {registrationData.currentLocation || <span className="text-muted-foreground">Location will be discussed with Emma</span>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                      <div className="mt-1 px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                        {registrationData.preferredLanguage || <span className="text-muted-foreground">Language preference will be discussed with Emma</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Registration Status</h3>
                  </div>
                  <div className="px-3 py-2 border rounded-md bg-muted/30 text-sm min-h-[40px] flex items-center">
                    {registrationData.complete ? (
                      <span className="text-green-600 font-medium">✓ Registration Complete</span>
                    ) : (
                      <span className="text-muted-foreground">In Progress - Continue chatting with Emma</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Emma Chat Section - Now on the RIGHT */}
          <Card className="flex-1 bg-white/95 backdrop-blur-sm shadow-2xl border-0 flex flex-col">
            <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-emergency/5 py-4">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="p-2 bg-emergency/10 rounded-full">
                  <Shield className="h-6 w-6 text-emergency" />
                </div>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Meet Emma, Your Safety Advisor
              </CardTitle>
              <CardDescription>
                Let's chat to set up your perfect protection plan
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 max-h-full">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <Avatar className="w-8 h-8 border-2 border-primary/20 flex-shrink-0">
                          <AvatarImage src="/emma-avatar.png" />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            E
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          message.type === 'user'
                            ? 'bg-primary text-white ml-auto'
                            : 'bg-muted/80 text-foreground shadow-sm'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 opacity-70 ${
                          message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <Avatar className="w-8 h-8 border-2 border-muted flex-shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">
                            U
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-8 h-8 border-2 border-primary/20 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          E
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/80 text-foreground rounded-2xl px-3 py-2 flex items-center gap-2 shadow-sm">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-sm">Emma is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-gradient-to-r from-background/50 to-muted/20">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response here..."
                      disabled={isLoading}
                      className="text-sm py-2 px-3 rounded-xl border-2 focus:border-primary/50 bg-white/80"
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 rounded-xl px-4 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Powered by AI • Secure & Private</span>
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