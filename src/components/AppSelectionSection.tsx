import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Heart, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppSelectionSection = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Two Apps, One Mission</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the right app for your role in keeping your family safe and connected.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* SOS App Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emergency/5 to-emergency/10 border-emergency/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emergency/20 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-emergency" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">SOS Emergency App</h3>
                  <p className="text-sm text-muted-foreground">For owners & individuals</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Your personal emergency response system. One-tap SOS alerts with instant location sharing to your emergency contacts and family circle.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-emergency rounded-full mr-3"></div>
                  <span>One-tap emergency alerts</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-emergency rounded-full mr-3"></div>
                  <span>Automatic location sharing</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-emergency rounded-full mr-3"></div>
                  <span>Voice activation "Help me"</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-emergency rounded-full mr-3"></div>
                  <span>Family & emergency contacts</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-emergency text-white hover:bg-emergency/90">
                <Link to="/auth">Get SOS App</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Family Tracker Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-wellness/5 to-wellness/10 border-wellness/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-wellness/20 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-wellness" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Family Tracker</h3>
                  <p className="text-sm text-muted-foreground">For family & carers</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Monitor and protect your loved ones. Real-time location tracking, emergency alerts, and family coordination tools.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-wellness rounded-full mr-3"></div>
                  <span>Live location tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-wellness rounded-full mr-3"></div>
                  <span>Emergency alert notifications</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-wellness rounded-full mr-3"></div>
                  <span>Family member status</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-wellness rounded-full mr-3"></div>
                  <span>Check-in coordination</span>
                </div>
              </div>
              
              <Button asChild variant="outline" className="w-full border-wellness text-wellness hover:bg-wellness hover:text-black">
                <Link to="/family-carer-access">Get Family App</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Already have an account?
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">Access My App</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AppSelectionSection;