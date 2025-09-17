import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  Phone, 
  MapPin, 
  Users, 
  Heart, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PageSEO } from '@/components/PageSEO';
import SEOBreadcrumbs from '@/components/SEOBreadcrumbs';
import SEOFAQSection from '@/components/SEOFAQSection';
import StructuredData from '@/components/StructuredData';

const EmergencyResponseServices = () => {
  const emergencyFAQs = [
    {
      question: "How fast is your emergency response time?",
      answer: "Our professional monitoring team responds to emergencies within 30 seconds of detection. Emergency services are contacted immediately, and family members are notified within 1 minute."
    },
    {
      question: "What types of emergencies do you monitor?",
      answer: "We monitor all types of emergencies including medical crises (heart attacks, strokes, falls), personal safety threats, home security incidents, and location-based emergencies like being lost or stranded."
    },
    {
      question: "Is the service available 24/7?",
      answer: "Yes, our emergency monitoring service operates 24 hours a day, 7 days a week, 365 days a year. Our professional response team is always ready to assist you."
    },
    {
      question: "How does the AI detection work?",
      answer: "Our AI continuously analyzes patterns from your device sensors, location data, and behavior patterns to detect anomalies that may indicate an emergency situation. The AI learns your normal routines to better identify when something is wrong."
    },
    {
      question: "What happens during a false alarm?",
      answer: "If our system detects a potential emergency, we first attempt to contact you directly. If you don't respond or confirm you're safe within the grace period, we proceed with emergency protocols. False alarms are handled professionally and help us improve our detection accuracy."
    },
    {
      question: "Can I customize my emergency contacts?",
      answer: "Yes, you can set up multiple emergency contacts including family members, friends, and healthcare providers. You can specify different contacts for different types of emergencies and set the order in which they should be contacted."
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSEO pageType="emergency-response-services" />
      <StructuredData type="Service" data={{ serviceType: 'emergency-response' }} />
      <Navigation />
      <SEOBreadcrumbs />
      
      <main className="container mx-auto px-4 py-section pt-page-top">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              24/7 Emergency Protection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Professional Emergency Response Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced emergency monitoring with AI-powered detection, instant professional response, 
              and comprehensive family protection. Your safety is our priority, 24 hours a day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg">
                <Shield className="mr-2 h-5 w-5" />
                Start Protection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Talk to Expert
              </Button>
            </div>
          </div>
        </section>

        {/* Emergency Response Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Emergency Response
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade emergency services with cutting-edge technology and human expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">24/7 Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Round-the-clock professional monitoring with AI-powered threat detection and instant human verification.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Continuous location monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI-powered anomaly detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Professional response team
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Instant Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Immediate emergency response with direct dispatch to emergency services and family notification.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sub-30 second response time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Direct emergency service dispatch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automatic family alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Family Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete family emergency protection with coordinated response and real-time communication.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-member monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Coordinated family response
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Emergency contact network
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Emergency Types */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Emergency Response Coverage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive protection for all emergency scenarios with specialized response protocols
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-red-200 dark:border-red-800">
              <CardHeader>
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Medical Emergencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Heart attacks, strokes, falls, and other medical crises with direct hospital dispatch
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-orange-200 dark:border-orange-800">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Personal Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Personal threats, panic situations, and security emergencies with police coordination
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 dark:border-blue-800">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Location Emergencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Lost person scenarios, outdoor emergencies, and location-based incidents
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200 dark:border-purple-800">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <CardTitle className="text-lg">Technology Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Wearable device monitoring, smart home integration, and IoT emergency detection
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <SEOFAQSection 
          title="Emergency Response FAQ"
          faqs={emergencyFAQs}
          className="bg-background/50"
        />

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready for Complete Emergency Protection?
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Join thousands of families who trust ICE SOS Lite for their emergency response needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Shield className="mr-2 h-5 w-5" />
                  Get Emergency Protection
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EmergencyResponseServices;