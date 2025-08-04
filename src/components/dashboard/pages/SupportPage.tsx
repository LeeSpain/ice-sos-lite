import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail, Book, FileText, Send, ExternalLink } from "lucide-react";

export function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    message: ""
  });

  const handleSubmitTicket = () => {
    // TODO: Implement ticket submission
    console.log("Submitting support ticket:", ticketForm);
    setTicketForm({ subject: "", category: "", priority: "", message: "" });
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
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  const supportTickets = [
    {
      id: "#12345",
      subject: "Device connection issues",
      status: "In Progress",
      created: "2 days ago",
      lastUpdate: "1 day ago"
    },
    {
      id: "#12344",
      subject: "Billing question about family plan",
      status: "Resolved",
      created: "1 week ago",
      lastUpdate: "5 days ago"
    }
  ];

  const faqItems = [
    {
      question: "How do I set up my emergency device?",
      answer: "To set up your emergency device, follow these steps: 1) Download the ICE SOS mobile app, 2) Create an account or log in, 3) Go to 'My Products' and tap 'Add Device', 4) Follow the pairing instructions displayed on your screen. The device will automatically connect to your account once properly configured."
    },
    {
      question: "What happens when I press the SOS button?",
      answer: "When you press the SOS button, several things happen immediately: 1) Your location is shared with your emergency contacts, 2) Emergency services are contacted based on your plan, 3) A monitoring agent is alerted to assess the situation, 4) Your family members receive instant notifications with your location and status."
    },
    {
      question: "How do I update my emergency contacts?",
      answer: "You can update your emergency contacts by going to the Emergency section in your dashboard. Click 'Edit' next to any contact to modify their information, or use 'Add Contact' to include new emergency contacts. Make sure to keep this information current for the best emergency response."
    },
    {
      question: "Can I share my location with family members?",
      answer: "Yes! You can enable location sharing with family members in the Location section of your dashboard. You can control who sees your location, set up safe zones for automatic notifications, and choose when location sharing is active."
    },
    {
      question: "How do I manage my subscription?",
      answer: "Visit the Subscription section in your dashboard to view your current plan, billing history, and payment methods. You can upgrade, downgrade, or cancel your subscription at any time. For family plans, you can also manage family member access from this section."
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help with your account, devices, and emergency services</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <h3 className="font-semibold mb-2">Emergency Line</h3>
              <p className="text-sm text-muted-foreground mb-4">24/7 emergency support</p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our support team</p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Book className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground mb-4">Browse help articles</p>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit
              </Button>
            </CardContent>
          </Card>
        </div>

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
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
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
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Describe your issue in detail..."
                rows={5}
                value={ticketForm.message}
                onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
              />
            </div>

            <Button onClick={handleSubmitTicket} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Previous Tickets */}
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
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
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

            {supportTickets.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any support tickets yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
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
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Additional ways to reach our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">support@icesurvival.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Phone Support</h3>
                  <p className="text-sm text-muted-foreground">1-800-ICE-HELP</p>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}