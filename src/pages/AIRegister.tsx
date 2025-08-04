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
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 h-[600px] flex flex-col">
            <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-emergency/5">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-emergency/10 rounded-full">
                  <Shield className="h-8 w-8 text-emergency" />
                </div>
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Meet Emma, Your Safety Advisor
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Let's have a conversation to set up your perfect protection plan
              </p>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarImage src="/emma-avatar.png" />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            E
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-white ml-auto'
                            : 'bg-muted/80 text-foreground shadow-sm'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <Avatar className="w-10 h-10 border-2 border-muted">
                          <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          E
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/80 text-foreground rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm">Emma is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t bg-gradient-to-r from-background/50 to-muted/20">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response here..."
                      disabled={isLoading}
                      className="text-base py-3 px-4 rounded-xl border-2 focus:border-primary/50 bg-white/80"
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 rounded-xl px-6 shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Powered by AI • Secure & Private • GDPR Compliant</span>
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