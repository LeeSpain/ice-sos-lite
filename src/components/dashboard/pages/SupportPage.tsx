import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import ChatWidget from "@/components/ai-chat/ChatWidget";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Book, 
  FileText, 
  Send, 
  ExternalLink, 
  Bot,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(true); // Open by default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    message: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically save to a support_tickets table
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Ticket Submitted",
        description: "Your support ticket has been submitted successfully. We'll respond within 24 hours.",
      });
      
      setTicketForm({ subject: "", category: "", priority: "", message: "" });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: "technical", label: "Technical Issue" },
    { value: "billing", label: "Billing & Subscription" },
    { value: "account", label: "Account Management" },
    { value: "device", label: "Device Setup" },
    { value: "emergency", label: "Emergency Services" },
    { value: "feature", label: "Feature Request" },
    { value: "other", label: "Other" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" }
  ];

  const supportTickets = [
    {
      id: "#12345",
      subject: "Device connection issues",
      status: "In Progress",
      created: "2 days ago",
      lastUpdate: "1 day ago",
      priority: "high"
    },
    {
      id: "#12344",
      subject: "Billing question about family plan",
      status: "Resolved",
      created: "1 week ago",
      lastUpdate: "5 days ago",
      priority: "medium"
    }
  ];

  const faqItems = [
    {
      question: "How do I set up my emergency device?",
      answer: "To set up your emergency device: 1) Download the ICE SOS mobile app, 2) Create an account or log in, 3) Go to 'My Products' and tap 'Add Device', 4) Follow the pairing instructions displayed on your screen. The device will automatically connect to your account once properly configured.",
      category: "Device Setup"
    },
    {
      question: "What happens when I press the SOS button?",
      answer: "When you press the SOS button: 1) Your location is shared with your emergency contacts, 2) Emergency services are contacted based on your plan, 3) A monitoring agent is alerted to assess the situation, 4) Your family members receive instant notifications with your location and status.",
      category: "Emergency Services"
    },
    {
      question: "How do I update my emergency contacts?",
      answer: "You can update your emergency contacts by going to the Emergency section in your dashboard. Click 'Edit' next to any contact to modify their information, or use 'Add Contact' to include new emergency contacts. Make sure to keep this information current for the best emergency response.",
      category: "Account Management"
    },
    {
      question: "Can I share my location with family members?",
      answer: "Yes! You can enable location sharing with family members in the Location section of your dashboard. You can control who sees your location, set up safe zones for automatic notifications, and choose when location sharing is active.",
      category: "Privacy & Location"
    },
    {
      question: "How do I manage my subscription?",
      answer: "Visit the Subscription section in your dashboard to view your current plan, billing history, and payment methods. You can upgrade, downgrade, or cancel your subscription at any time. For family plans, you can also manage family member access from this section.",
      category: "Billing"
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take your privacy and security seriously. All data is encrypted in transit and at rest. We never share your personal information with third parties except for emergency services when you activate SOS. You can control your privacy settings in your dashboard.",
      category: "Privacy & Security"
    },
    {
      question: "How long does the battery last on emergency devices?",
      answer: "Battery life varies by device model, but most of our emergency devices last 3-7 days on a single charge with normal usage. In emergency mode, devices can operate for 24-48 hours continuously. We recommend charging your device weekly.",
      category: "Device Specifications"
    },
    {
      question: "Can I test my emergency system?",
      answer: "Yes! You can perform a test from your dashboard without triggering actual emergency services. Go to Settings > Emergency Test to send test notifications to your contacts and verify your system is working properly.",
      category: "Testing & Maintenance"
    }
  ];

  const knowledgeBaseArticles = [
    {
      title: "Getting Started Guide",
      description: "Complete setup instructions for new users",
      category: "Setup",
      readTime: "5 min",
      icon: <Zap className="h-5 w-5 text-primary" />
    },
    {
      title: "Emergency Response Procedures",
      description: "What happens during an emergency activation",
      category: "Emergency",
      readTime: "8 min",
      icon: <AlertCircle className="h-5 w-5 text-emergency" />
    },
    {
      title: "Device Troubleshooting",
      description: "Common issues and solutions for all devices",
      category: "Technical",
      readTime: "10 min",
      icon: <HelpCircle className="h-5 w-5 text-accent" />
    },
    {
      title: "Privacy and Security Settings",
      description: "Managing your data and privacy preferences",
      category: "Privacy",
      readTime: "6 min",
      icon: <CheckCircle className="h-5 w-5 text-secondary-foreground" />
    },
    {
      title: "Family Plan Management",
      description: "Adding and managing family members",
      category: "Account",
      readTime: "7 min",
      icon: <FileText className="h-5 w-5 text-primary" />
    },
    {
      title: "Billing and Subscription FAQ",
      description: "Common billing questions and account management",
      category: "Billing",
      readTime: "4 min",
      icon: <Clock className="h-5 w-5 text-accent" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help with your account, devices, and emergency services</p>
      </div>

      {/* Emma AI Assistant - Featured */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-emergency/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Chat with Emma AI Assistant
          </CardTitle>
          <CardDescription>
            Get instant help from Emma, our AI assistant specialized in emergency protection and account support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Emma is here to help</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7 • Instant responses • Emergency procedures
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit Support Ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Support Ticket
          </CardTitle>
          <CardDescription>
            Create a support ticket for detailed assistance with your issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject *</label>
              <Input
                placeholder="Brief description of your issue"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category *</label>
              <Select
                value={ticketForm.category}
                onValueChange={(value) => setTicketForm({...ticketForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:w-1/2">
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select
              value={ticketForm.priority}
              onValueChange={(value) => setTicketForm({...ticketForm, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={priority.color}>{priority.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message *</label>
            <Textarea
              placeholder="Describe your issue in detail..."
              rows={5}
              value={ticketForm.message}
              onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
            />
          </div>

          <Button 
            onClick={handleSubmitTicket} 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Save className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Tickets */}
      {supportTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
            <CardDescription>
              Track the status of your recent support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">Ticket {ticket.id}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Created: {ticket.created}</span>
                      <span>Last update: {ticket.lastUpdate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(ticket.status)}
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequently Asked Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {filteredFAQ.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-col items-start gap-1">
                    <span>{item.question}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQ.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all questions above
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Comprehensive guides and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeBaseArticles.map((article, index) => (
              <div 
                key={index}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    {article.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Emergency Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 border border-emergency/20 rounded-lg bg-emergency/5">
              <div className="w-12 h-12 bg-emergency/10 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-emergency" />
              </div>
              <div>
                <h3 className="font-semibold text-emergency">Emergency Line</h3>
                <p className="text-sm text-muted-foreground">1-800-ICE-HELP</p>
                <p className="text-xs text-muted-foreground">Available 24/7 for emergencies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@icesurvival.com</p>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emma AI Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={userName}
        context="dashboard-support"
      />
    </div>
  );
}