import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Shield, 
  Clock, 
  Phone, 
  AlertTriangle, 
  UserCheck,
  Home,
  Pill,
  Activity,
  CheckCircle,
  ArrowRight,
  Users,
  Brain,
  Eye,
  Smartphone,
  MapPin
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PageSEO } from '@/components/PageSEO';

const SeniorEmergencyProtection = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSEO pageType="senior-emergency-protection" />
      <Navigation />
      
      <main className="container mx-auto px-4 py-section pt-page-top">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Senior Safety Specialist
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Senior Emergency Protection
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Specialized emergency protection designed for seniors and elderly family members. 
              Advanced medical alert systems, fall detection, and 24/7 professional monitoring for complete peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg">
                <Heart className="mr-2 h-5 w-5" />
                Protect Your Loved One
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Speak to Care Specialist
              </Button>
            </div>
          </div>
        </section>

        {/* Senior-Specific Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Senior Care Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced monitoring systems designed specifically for the unique needs and challenges of senior care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/50">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Medical Emergency Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI monitoring for heart attacks, strokes, falls, and other medical emergencies with instant response.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    Heart rate monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    Fall detection algorithms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    Medical alert integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">24/7 Care Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Round-the-clock professional monitoring with trained care specialists who understand senior needs.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Professional care team
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Medical history awareness
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Family communication
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Medication Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart medication reminders and monitoring to ensure proper medication adherence and safety.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automated reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dosage tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Drug interaction alerts
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Senior Care Scenarios */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Senior Care Coverage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive protection for all aspects of senior safety and independence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50">
              <CardHeader>
                <Home className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Independent Living Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Enable seniors to live independently with confidence through comprehensive home safety monitoring.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Daily activity monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Home security integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Wellness check protocols
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Emergency response coordination
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/50">
              <CardHeader>
                <Users className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-xl">Family Peace of Mind</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Keep families connected and informed about their loved ones' safety and well-being.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Real-time family updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Emergency family notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Care team coordination
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Medical information sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/50">
              <CardHeader>
                <Activity className="h-8 w-8 text-teal-500 mb-2" />
                <CardTitle className="text-xl">Health Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced health monitoring with wearable device integration and medical professional oversight.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                    Vital signs monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                    Chronic condition tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                    Healthcare provider integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-500" />
                    Emergency medical alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/50">
              <CardHeader>
                <Brain className="h-8 w-8 text-rose-500 mb-2" />
                <CardTitle className="text-xl">Cognitive Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Specialized monitoring and support for seniors with cognitive challenges like dementia or Alzheimer's.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Wandering prevention
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Memory assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Caregiver alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Safe zone monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Device Options */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Senior-Friendly Emergency Devices
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Easy-to-use emergency devices designed specifically for seniors with large buttons and simple operation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Medical Alert Pendant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Waterproof pendant with large emergency button, GPS tracking, and two-way communication.
                </p>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Fall Detection Included
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Watch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Senior-friendly smartwatch with large display, health monitoring, and emergency features.
                </p>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Health Monitoring
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Home Base Station</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Voice-activated home emergency system with medication reminders and family communication.
                </p>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Voice Activated
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Give Your Loved One the Protection They Deserve
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Start senior emergency protection today and enjoy peace of mind knowing your loved one is safe
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Senior Protection
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Talk to Care Specialist
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

export default SeniorEmergencyProtection;