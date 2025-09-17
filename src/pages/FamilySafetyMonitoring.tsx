import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Heart, 
  Shield, 
  Clock, 
  Smartphone,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Baby,
  User,
  UserCheck,
  Eye,
  Bell,
  Home
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PageSEO } from '@/components/PageSEO';
import SEOBreadcrumbs from '@/components/SEOBreadcrumbs';
import SEOFAQSection from '@/components/SEOFAQSection';
import StructuredData from '@/components/StructuredData';

const FamilySafetyMonitoring = () => {
  const familyFAQs = [
    {
      question: "How does family safety monitoring work?",
      answer: "Our system provides real-time location tracking for all family members with smart alerts, safe zone notifications, and coordinated emergency response. Each family member gets a personalized safety profile with age-appropriate monitoring."
    },
    {
      question: "Can I monitor family members without invading their privacy?",
      answer: "Yes, our system includes privacy controls and age-appropriate settings. Teen and adult family members can control their privacy levels while maintaining safety features. Location sharing can be customized based on individual preferences."
    },
    {
      question: "What age groups does family monitoring support?",
      answer: "We provide tailored monitoring for all ages: children with school tracking, teens with friend activity monitoring, adults with commute safety, and seniors with health monitoring. Each age group has specialized features."
    },
    {
      question: "How do family emergency alerts work?",
      answer: "When an emergency is detected for any family member, our system immediately notifies all designated family contacts with location details and situation information. Emergency services are contacted automatically based on your preferences."
    },
    {
      question: "Can family members see each other's locations?",
      answer: "Location sharing within families is customizable. Parents can monitor children, and family members can opt-in to share their locations with others. All sharing respects individual privacy settings and legal requirements."
    },
    {
      question: "Is there a family dashboard to see everyone's status?",
      answer: "Yes, our centralized family dashboard shows the real-time status and location of all family members, recent activities, safe zone arrivals/departures, and emergency contacts. It's designed for easy monitoring without information overload."
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSEO pageType="family-safety-monitoring" />
      <StructuredData type="Service" data={{ serviceType: 'family-monitoring' }} />
      <Navigation />
      <SEOBreadcrumbs />
      
      <main className="container mx-auto px-4 py-section pt-page-top">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Complete Family Protection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Family Safety Monitoring
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive safety monitoring for your entire family. Real-time location tracking, 
              emergency coordination, and peace of mind for parents, children, and elderly family members.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg">
                <Users className="mr-2 h-5 w-5" />
                Protect Your Family
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Heart className="mr-2 h-5 w-5" />
                Free Family Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Family Protection Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Family Protection System
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced monitoring and coordination tools designed specifically for family safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Know where your family members are at all times with precise GPS tracking and location history.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Precise GPS location tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Location history and patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Safe zone notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent notifications that keep you informed without overwhelming you with false alarms.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Emergency situation alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Arrival/departure notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Customizable alert preferences
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Emergency Coordination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Coordinated family response during emergencies with automated communication and location sharing.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Family emergency protocols
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automated family notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Emergency service coordination
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Family Member Protection */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Protection for Every Family Member
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored safety solutions for different family members and their unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
              <CardHeader>
                <Baby className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-xl">Children & Teens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Age-appropriate monitoring with school zone tracking, after-school safety, and parent communication.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    School arrival/departure alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Friend and activity tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Emergency contact system
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
              <CardHeader>
                <User className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-xl">Adults & Parents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Professional monitoring for working adults with commute safety, meeting locations, and travel protection.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Commute and travel safety
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Work location monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Professional emergency response
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50">
              <CardHeader>
                <UserCheck className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <CardTitle className="text-xl">Elderly Family</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Specialized monitoring for seniors with medical alert integration, fall detection, and health monitoring.
                </p>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Medical emergency detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Medication reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Daily wellness checks
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Monitoring Dashboard */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Centralized Family Dashboard
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Monitor your entire family's safety from one intuitive dashboard with real-time updates and intelligent insights.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Live Family Map</h3>
                    <p className="text-muted-foreground">See all family members on a single map with real-time locations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Activity Timeline</h3>
                    <p className="text-muted-foreground">Track daily activities and movement patterns for each family member</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Home className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Safe Zones</h3>
                    <p className="text-muted-foreground">Set up home, school, and work zones with automatic arrival notifications</p>
                  </div>
                </li>
              </ul>
            </div>
            <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Family Safety Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Sarah (Mom)</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    At Work
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Mike (Dad)</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Commuting
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Emma (16)</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    At School
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Grandma Rose</span>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    At Home
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <SEOFAQSection 
          title="Family Safety Monitoring FAQ"
          faqs={familyFAQs}
          className="bg-background/50"
        />

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Start Protecting Your Family Today
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Join thousands of families who trust ICE SOS Lite for comprehensive family safety monitoring
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Start Family Protection
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Free Family Trial
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

export default FamilySafetyMonitoring;