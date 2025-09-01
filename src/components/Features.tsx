import { Button } from "@/components/ui/button";
import { Users, Heart, MapPin, Phone, Shield, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

const Features = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-wellness/5 via-background to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--wellness)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-wellness/10 to-primary/10 border border-wellness/20 text-wellness font-medium text-lg mb-8">
            <Heart className="h-5 w-5 mr-3 text-wellness" />
            {t('familyConnections.badge')}
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-wellness via-primary to-guardian bg-clip-text text-transparent">
              {t('familyConnections.title')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            {t('familyConnections.description')}
          </p>
        </div>

        {/* Main Visual Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side - Family App Demo */}
          <div className="relative">
            {/* Phone Mockup */}
            <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="flex justify-between items-center px-6 py-3 bg-primary text-white text-sm">
                  <span className="font-semibold">Family Tracker</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                  </div>
                </div>

                {/* Family Map View */}
                <div className="h-80 bg-gradient-to-br from-blue-100 to-green-100 relative">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <path d="M10,30 Q30,10 50,30 T90,30" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                      <path d="M10,50 Q30,30 50,50 T90,50" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                      <path d="M10,70 Q30,50 50,70 T90,70" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    </svg>
                  </div>
                  
                  {/* Family Member Pins */}
                  <div className="absolute top-16 left-12">
                    <div className="w-12 h-12 bg-wellness rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">👵</span>
                    </div>
                    <div className="text-xs font-semibold text-center mt-1 bg-white px-2 py-1 rounded shadow">Grandma</div>
                  </div>
                  
                  <div className="absolute top-24 right-16">
                    <div className="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">👨</span>
                    </div>
                    <div className="text-xs font-semibold text-center mt-1 bg-white px-2 py-1 rounded shadow">Dad</div>
                  </div>
                  
                  <div className="absolute bottom-16 left-20">
                    <div className="w-12 h-12 bg-emergency rounded-full border-4 border-white shadow-lg flex items-center justify-center relative">
                      <span className="text-white font-bold text-sm">👧</span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-xs font-semibold text-center mt-1 bg-red-100 px-2 py-1 rounded shadow text-red-800">Emma - Alert!</div>
                  </div>
                </div>

                {/* Family Status Cards */}
                <div className="p-4 space-y-3">
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">👵</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Grandma is safe</p>
                        <p className="text-xs text-gray-600">At home • Last seen 2 min ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mr-3 animate-pulse">
                        <span className="text-white text-sm">👧</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-red-800">Emma needs help!</p>
                        <p className="text-xs text-red-600">SOS activated • 30 seconds ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-primary text-white rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Emergency Response</span>
                      </div>
                      <div className="text-sm bg-white/20 px-3 py-1 rounded-full">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
            <div className="absolute -left-8 top-20 bg-white rounded-xl p-4 shadow-xl border border-wellness/20 max-w-48">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-wellness mr-2" />
                <span className="font-semibold text-sm">Real-time Location</span>
              </div>
              <p className="text-xs text-gray-600">See where everyone is, instantly</p>
            </div>

            <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-4 shadow-xl border border-primary/20 max-w-48">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <span className="font-semibold text-sm">Instant Alerts</span>
              </div>
              <p className="text-xs text-gray-600">Get notified the moment help is needed</p>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-foreground">
                Keep Your Family Connected & Protected
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                See exactly where your loved ones are, get instant alerts when they need help, and coordinate care seamlessly across your entire family network.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-wellness/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-wellness" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Family Network</h4>
                  <p className="text-muted-foreground">Connect all family members with secure, role-based access to location and emergency information.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-emergency" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Emergency Alerts</h4>
                  <p className="text-muted-foreground">Instant notifications when someone activates SOS, with location data and response coordination.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">24/7 Monitoring</h4>
                  <p className="text-muted-foreground">Professional monitoring and family alerts ensure someone is always watching over your loved ones.</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-wellness to-primary hover:from-wellness/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              >
                <Link to="/family-carer-access">
                  <Users className="h-5 w-5 mr-2" />
                  {t('familyConnections.cta.button')}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Connect your first family member for free • No setup fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;