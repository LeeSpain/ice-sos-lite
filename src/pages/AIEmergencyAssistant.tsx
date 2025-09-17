import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  Shield, 
  Zap, 
  Eye, 
  Heart,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Clock,
  Users
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PageSEO } from '@/components/PageSEO';

const AIEmergencyAssistant = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <PageSEO pageType="ai-emergency-assistant" />
      <Navigation />
      
      <main className="container mx-auto px-4 py-section pt-page-top">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              AI-Powered Emergency Protection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Intelligent Emergency Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced AI technology that monitors your safety patterns, predicts potential emergencies, 
              and provides instant intelligent response when you need help most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg">
                <Brain className="mr-2 h-5 w-5" />
                Activate AI Protection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Try AI Assistant
              </Button>
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligent Emergency Detection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI learns your patterns and proactively identifies emergency situations before they escalate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Pattern Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced machine learning analyzes your daily patterns to detect anomalies and potential emergencies.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Movement pattern analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Behavioral anomaly detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Risk assessment algorithms
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Predictive Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI predicts potential emergency scenarios and pre-positions resources for faster response times.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Predictive emergency modeling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resource pre-positioning
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automated escalation protocols
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Intelligent Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Natural language processing enables clear communication during high-stress emergency situations.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Voice recognition & response
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-language support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Stress-aware communication
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI Capabilities */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced AI Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge artificial intelligence designed specifically for emergency response and safety monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
              <CardHeader>
                <Brain className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-xl">Deep Learning Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced neural networks process multiple data streams to understand complex emergency scenarios.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Multi-sensor data fusion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Contextual situation analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Continuous learning adaptation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-xl">Privacy-First AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced AI processing with edge computing ensures your personal data stays private and secure.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Local data processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Encrypted AI models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Zero-knowledge architecture
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/50">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-xl">Real-Time Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Millisecond response times with edge AI processing for immediate emergency detection and response.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Sub-second analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Parallel processing pipelines
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Optimized inference engines
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/50">
              <CardHeader>
                <Users className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle className="text-xl">Collaborative Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI that learns from collective patterns while maintaining individual privacy for better protection.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Federated learning models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Community threat intelligence
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    Adaptive response optimization
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Experience the Future of Emergency Protection
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Join the next generation of AI-powered safety with intelligent emergency assistance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Brain className="mr-2 h-5 w-5" />
                  Start AI Protection
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Talk to AI Assistant
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

export default AIEmergencyAssistant;