import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Share, 
  Bell, 
  MapPin, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Mail,
  MessageSquare
} from 'lucide-react';

export const MobileAppSetup = () => {
  const setupSteps = [
    {
      step: 1,
      title: 'Send Invitation',
      description: 'Family member receives secure email invitation with setup instructions',
      icon: Mail,
      status: 'completed'
    },
    {
      step: 2,
      title: 'Download App',
      description: 'Download ICE SOS Family from App Store or Google Play',
      icon: Download,
      status: 'completed'
    },
    {
      step: 3,
      title: 'Account Setup',
      description: 'Create account using invitation link and verify identity',
      icon: Shield,
      status: 'completed'
    },
    {
      step: 4,
      title: 'Enable Permissions',
      description: 'Grant location, notifications, and camera permissions for emergency features',
      icon: Bell,
      status: 'pending'
    },
    {
      step: 5,
      title: 'Test Connection',
      description: 'Complete test emergency alert to verify all systems working',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  const appFeatures = [
    {
      title: 'Emergency Alerts',
      description: 'Instant push notifications when family members trigger SOS',
      icon: Bell,
      color: 'text-emergency'
    },
    {
      title: 'Location Sharing',
      description: 'Emergency-only GPS sharing with family coordination',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: 'Family Chat',
      description: 'Secure emergency coordination chat activated during SOS events',
      icon: MessageSquare,
      color: 'text-wellness'
    },
    {
      title: 'Quick Response',
      description: 'One-tap "Received & On It" responses for emergency coordination',
      icon: CheckCircle,
      color: 'text-wellness'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-wellness" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-emergency" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-wellness bg-wellness/5';
      case 'pending':
        return 'border-l-warning bg-warning/5';
      case 'error':
        return 'border-l-emergency bg-emergency/5';
      default:
        return 'border-l-muted-foreground bg-muted/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mobile App Setup</h2>
        <p className="text-muted-foreground">Help family members set up the ICE SOS mobile app for emergency coordination</p>
      </div>

      {/* App Download Section */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            ICE SOS Family App
          </CardTitle>
          <CardDescription>
            Professional emergency coordination app for family members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center mx-auto">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Quick Download</p>
                <p className="text-sm text-muted-foreground">Scan QR code to download app directly</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Download Links</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download for iOS (App Store)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download for Android (Google Play)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="h-4 w-4 mr-2" />
                    Share Download Link
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* App Features */}
          <div className="pt-6 border-t border-border/50">
            <h4 className="font-semibold text-foreground mb-4">Key App Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Progress */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Family Member Setup Progress
          </CardTitle>
          <CardDescription>
            Track setup progress for family members who have been invited
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Setup Steps */}
            <div className="space-y-3">
              {setupSteps.map((step, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getStatusColor(step.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Family Member Status */}
            <div className="pt-6 border-t border-border/50">
              <h4 className="font-semibold text-foreground mb-4">Individual Setup Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emergency/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-emergency">SM</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sarah Miller</p>
                      <p className="text-sm text-muted-foreground">Daughter • sarah@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-wellness text-white">Setup Complete</Badge>
                    <CheckCircle className="h-5 w-5 text-wellness" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">MJ</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Michael Johnson</p>
                      <p className="text-sm text-muted-foreground">Son • michael@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-warning border-warning">Permissions Needed</Badge>
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-wellness/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-wellness">EW</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Emma Wilson</p>
                      <p className="text-sm text-muted-foreground">Sister • emma@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">Invitation Sent</Badge>
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Setup Instructions for Family Members
          </CardTitle>
          <CardDescription>
            Step-by-step guide you can share with family members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold text-foreground mb-2">1. Check Your Email</h4>
              <p className="text-sm text-muted-foreground">Look for an invitation email from ICE SOS with subject "Emergency Access Invitation"</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold text-foreground mb-2">2. Download the App</h4>
              <p className="text-sm text-muted-foreground">Use the link in the email or search "ICE SOS Family" in your app store</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold text-foreground mb-2">3. Create Your Account</h4>
              <p className="text-sm text-muted-foreground">Use the invitation link to create your account - this connects you to the family network</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold text-foreground mb-2">4. Enable Permissions</h4>
              <p className="text-sm text-muted-foreground">Allow location access and notifications - these are only used during emergencies</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold text-foreground mb-2">5. Test the System</h4>
              <p className="text-sm text-muted-foreground">Complete the setup test to ensure you'll receive emergency alerts</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <Share className="h-4 w-4 mr-2" />
                Share Instructions
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Resend Invitations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card className="border border-border/50 shadow-sm bg-gradient-to-r from-primary/5 to-wellness/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Common Setup Issues</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Invitation email in spam folder</li>
                <li>• Location permissions not enabled</li>
                <li>• Notification settings blocked</li>
                <li>• App not downloading from store</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Get Support</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Live Chat Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="h-3 w-3 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};