import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Shield, Sparkles } from 'lucide-react';
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
          {/* Emma Chat Section */}
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
              <p className="text-muted-foreground">
                Let's chat to set up your perfect protection plan
              </p>
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

          {/* Registration Form Section */}
          <Card className="flex-1 bg-white/95 backdrop-blur-sm shadow-2xl border-0 flex flex-col">
            <CardHeader className="text-center border-b bg-gradient-to-r from-emergency/5 to-primary/5 py-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                Your Registration Details
              </CardTitle>
              <p className="text-muted-foreground">
                Fill in your information as Emma guides you
              </p>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <Input
                        value={registrationData.firstName || ''}
                        placeholder="Provided through conversation with Emma"
                        className="mt-1 bg-muted/30 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <Input
                        value={registrationData.lastName || ''}
                        placeholder="Provided through conversation with Emma"
                        className="mt-1 bg-muted/30 cursor-not-allowed"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input
                      value={registrationData.email || ''}
                      placeholder="Provided through conversation with Emma"
                      className="mt-1 bg-muted/30 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <Input
                      value={registrationData.phoneNumber || ''}
                      placeholder="Provided through conversation with Emma"
                      className="mt-1 bg-muted/30 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Selected Plans */}
                {registrationData.plans && registrationData.plans.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Selected Plans</h3>
                    <div className="space-y-2">
                      {registrationData.plans.map((plan, index) => (
                        <div key={index} className="p-3 bg-primary/5 rounded-lg border">
                          <span className="font-medium text-foreground">{plan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                {registrationData.emergencyContacts && registrationData.emergencyContacts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Emergency Contacts</h3>
                    <div className="space-y-3">
                      {registrationData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="p-3 bg-emergency/5 rounded-lg border">
                          <div className="text-sm font-medium text-foreground">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">{contact.relationship}</div>
                          <div className="text-xs text-muted-foreground">{contact.phone}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                {(registrationData.medicalConditions || registrationData.allergies) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Medical Information</h3>
                    {registrationData.medicalConditions && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">{registrationData.medicalConditions}</span>
                        </div>
                      </div>
                    )}
                    {registrationData.allergies && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">{registrationData.allergies}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Information */}
                {(registrationData.currentLocation || registrationData.preferredLanguage) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                    {registrationData.currentLocation && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">{registrationData.currentLocation}</span>
                        </div>
                      </div>
                    )}
                    {registrationData.preferredLanguage && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-foreground">{registrationData.preferredLanguage}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-emergency/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground mb-2">Registration Progress</div>
                    <div className="text-xs text-muted-foreground">
                      Current Step: {currentStep.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRegister;