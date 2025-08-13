import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ContactChatWidget from "@/components/ContactChatWidget";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageCircle, Send, CheckCircle, Clock } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const sessionId = crypto.randomUUID();
      
      const { data: response, error } = await supabase.functions.invoke('contact-form', {
        body: {
          ...data,
          sessionId,
        },
      });

      if (error) {
        throw error;
      }

      if (response?.success) {
        setIsSubmitted(true);
        reset();
        toast.success("Message sent successfully! Check your email for confirmation.");
      } else {
        throw new Error(response?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = "Contact Us | ICE SOS Lite";
  const description = "Get in touch with ICE SOS Lite support team. Send us a message or chat with Emma, our AI assistant, for immediate help.";
  const canonical = "/contact";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our support team or chat with Emma, our AI assistant, for immediate help.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24-48 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                    <p className="text-muted-foreground mb-4">
                      Thank you for contacting us. We've sent a confirmation email to your inbox.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          {...register("name")}
                          placeholder="Enter your full name"
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="your.email@example.com"
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        placeholder="Brief description of your inquiry"
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Please provide details about your inquiry or issue..."
                        rows={6}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Response Time Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24-48 hours during business days. 
                      For urgent emergency situations, please contact your local emergency services directly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emma AI Chat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Chat with Emma
                </CardTitle>
                <CardDescription>
                  Get immediate help from our AI assistant. Emma can answer questions about our services, 
                  help with app features, and provide general support.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <ContactChatWidget 
                    className="h-full"
                    placeholder="Hi! I'm Emma, your ICE SOS Lite assistant. How can I help you today?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Help */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Other Ways to Get Help</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check our documentation and user guides</li>
                  <li>• Visit our support center for common questions</li>
                  <li>• Join our community forums for peer support</li>
                  <li>• Follow us for updates and announcements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default Contact;