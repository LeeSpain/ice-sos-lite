import { Button } from "@/components/ui/button";
import { Users, Heart, MapPin, Phone, Shield, Clock, Play } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { IntroVideoModal } from "@/components/IntroVideoModal";

const Features = () => {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header - matching other sections */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('familyConnections.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('familyConnections.description')}
          </p>
        </div>

        {/* Main Content - matching other sections layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Family App Demo */}
            <div className="relative order-2 lg:order-1">
              {/* Phone Mockup with realistic map */}
              <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-6 py-3 bg-primary text-white text-sm font-medium">
                    <span>Family Tracker</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span className="ml-2 text-xs">100%</span>
                      <div className="w-6 h-3 border border-white rounded-sm bg-white/20 ml-1"></div>
                    </div>
                  </div>

                  {/* Real Map View */}
                  <div className="h-80 relative overflow-hidden bg-gray-100">
                    {/* Realistic map background */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                      {/* Map base */}
                      <rect width="100%" height="100%" fill="#f1f5f9"/>
                      
                      {/* Water/river */}
                      <path d="M0,120 Q80,110 160,130 T320,140 L320,180 Q240,170 160,160 Q80,150 0,160 Z" fill="#bfdbfe"/>
                      
                      {/* Parks and green spaces */}
                      <rect x="240" y="50" width="60" height="80" fill="#bbf7d0" rx="8"/>
                      <rect x="20" y="220" width="80" height="60" fill="#bbf7d0" rx="8"/>
                      <circle cx="60" cy="80" r="25" fill="#bbf7d0"/>
                      
                      {/* Building blocks */}
                      <rect x="120" y="40" width="30" height="40" fill="#e2e8f0" rx="2"/>
                      <rect x="160" y="40" width="25" height="35" fill="#e2e8f0" rx="2"/>
                      <rect x="120" y="240" width="40" height="50" fill="#e2e8f0" rx="2"/>
                      <rect x="180" y="250" width="35" height="45" fill="#e2e8f0" rx="2"/>
                      
                      {/* Major roads */}
                      <path d="M0,100 L320,100" stroke="#ffffff" strokeWidth="6"/>
                      <path d="M0,200 L320,200" stroke="#ffffff" strokeWidth="6"/>
                      <path d="M100,0 L100,320" stroke="#ffffff" strokeWidth="6"/>
                      <path d="M220,0 L220,320" stroke="#ffffff" strokeWidth="6"/>
                      
                      {/* Secondary roads */}
                      <path d="M0,60 L320,60" stroke="#ffffff" strokeWidth="3"/>
                      <path d="M0,260 L320,260" stroke="#ffffff" strokeWidth="3"/>
                      <path d="M160,0 L160,320" stroke="#ffffff" strokeWidth="3"/>
                      <path d="M40,0 L40,320" stroke="#ffffff" strokeWidth="3"/>
                      
                      {/* Road markings */}
                      <path d="M0,100 L320,100" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,5"/>
                      <path d="M100,0 L100,320" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,5"/>
                    </svg>
                    
                    {/* Family Member Pins */}
                    <div className="absolute top-16 left-12">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">👵</span>
                        </div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-green-500"></div>
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-white px-2 py-1 rounded shadow-md border whitespace-nowrap">Grandma</div>
                    </div>
                    
                    <div className="absolute top-20 right-12">
                      <div className="relative">
                        <div className="w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">👨</span>
                        </div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500"></div>
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-white px-2 py-1 rounded shadow-md border whitespace-nowrap">Dad</div>
                    </div>
                    
                    <div className="absolute bottom-12 left-12">
                      <div className="relative">
                        <div className="w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center relative animate-pulse">
                          <span className="text-white font-bold text-sm">👧</span>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white animate-ping"></div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500"></div>
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-red-50 px-2 py-1 rounded shadow-md border border-red-200 text-red-800 whitespace-nowrap">Emma - Alert!</div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1">
                      <div className="w-10 h-10 bg-white rounded-md border shadow-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                        <span className="text-gray-700 text-lg font-light">+</span>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-md border shadow-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                        <span className="text-gray-700 text-lg font-light">−</span>
                      </div>
                    </div>

                    {/* Map attribution */}
                    <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                      Map data ©2024
                    </div>
                  </div>

                  {/* Family Status Cards - Only Grandma */}
                  <div className="p-4">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs">👵</span>
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-green-800">Grandma is safe</p>
                          <p className="text-xs text-green-600">At home • 2 min ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-primary text-white rounded-xl p-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">Emergency Active</span>
                        </div>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Responding</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Highlights */}
              <div className="absolute -left-8 top-20 bg-white rounded-xl p-3 shadow-xl border border-wellness/20 max-w-44">
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 text-wellness mr-2" />
                  <span className="font-semibold text-xs">Live Location</span>
                </div>
                <p className="text-xs text-gray-600">Real-time family tracking</p>
              </div>

              <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-3 shadow-xl border border-primary/20 max-w-44">
                <div className="flex items-center mb-1">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  <span className="font-semibold text-xs">Instant Alerts</span>
                </div>
                <p className="text-xs text-gray-600">Emergency notifications</p>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  Keep Your Family Connected & Protected
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  See exactly where your loved ones are, get instant alerts when they need help, and coordinate care seamlessly across your entire family network.
                </p>
              </div>

              <div className="grid gap-6 mb-8">
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-wellness/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-wellness" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Family Network</h4>
                    <p className="text-muted-foreground">Connect all family members with secure, role-based access to location and emergency information.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Emergency Alerts</h4>
                    <p className="text-muted-foreground">Instant notifications when someone activates SOS, with location data and response coordination.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">24/7 Monitoring</h4>
                    <p className="text-muted-foreground">Professional monitoring and family alerts ensure someone is always watching over your loved ones.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/family-carer-access">
                      <Users className="h-5 w-5 mr-2" />
                      {t('familyConnections.cta.button')}
                    </Link>
                  </Button>
                  <IntroVideoModal 
                    defaultVideoId="family"
                    trigger={
                      <Button 
                        size="lg" 
                        className="bg-wellness text-black hover:bg-wellness/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-4"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Family Video
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your first family member for free • No setup fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;