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
                      {/* Map base - lighter gray for streets */}
                      <rect width="100%" height="100%" fill="#f8fafc"/>
                      
                      {/* Terrain and elevation patterns */}
                      <defs>
                        <pattern id="terrain" patternUnits="userSpaceOnUse" width="8" height="8">
                          <rect width="8" height="8" fill="#f1f5f9"/>
                          <circle cx="2" cy="2" r="0.5" fill="#e2e8f0"/>
                          <circle cx="6" cy="6" r="0.5" fill="#e2e8f0"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#terrain)"/>
                      
                      {/* Water bodies - more realistic shapes */}
                      <path d="M0,100 Q40,95 80,110 Q120,125 160,115 Q200,105 240,120 Q280,135 320,125 L320,180 Q280,170 240,175 Q200,180 160,170 Q120,160 80,165 Q40,170 0,160 Z" fill="#3b82f6" opacity="0.7"/>
                      <ellipse cx="70" cy="250" rx="25" ry="15" fill="#3b82f6" opacity="0.6"/>
                      
                      {/* Parks and green spaces - more organic shapes */}
                      <path d="M240,50 Q280,55 290,75 Q295,95 280,110 Q260,125 240,120 Q225,105 235,85 Q240,65 240,50 Z" fill="#22c55e" opacity="0.4"/>
                      <path d="M20,220 Q45,215 65,230 Q85,245 75,265 Q65,280 45,275 Q25,270 15,250 Q10,235 20,220 Z" fill="#22c55e" opacity="0.4"/>
                      <circle cx="60" cy="80" r="22" fill="#22c55e" opacity="0.3"/>
                      
                      {/* Building blocks - varied sizes and colors */}
                      <rect x="120" y="40" width="28" height="38" fill="#64748b" rx="2"/>
                      <rect x="155" y="45" width="22" height="32" fill="#71717a" rx="2"/>
                      <rect x="185" y="42" width="18" height="35" fill="#6b7280" rx="1"/>
                      <rect x="115" y="240" width="35" height="45" fill="#64748b" rx="2"/>
                      <rect x="160" y="245" width="25" height="40" fill="#71717a" rx="2"/>
                      <rect x="195" y="250" width="30" height="35" fill="#6b7280" rx="2"/>
                      
                      {/* Residential areas */}
                      <rect x="40" y="140" width="12" height="12" fill="#94a3b8" rx="1"/>
                      <rect x="58" y="145" width="10" height="10" fill="#94a3b8" rx="1"/>
                      <rect x="75" y="142" width="11" height="11" fill="#94a3b8" rx="1"/>
                      <rect x="270" y="180" width="15" height="15" fill="#94a3b8" rx="1"/>
                      <rect x="290" y="185" width="12" height="12" fill="#94a3b8" rx="1"/>
                      
                      {/* Major highways - realistic curved paths */}
                      <path d="M0,100 Q80,95 160,105 Q240,115 320,110" stroke="#ffffff" strokeWidth="8" fill="none"/>
                      <path d="M0,200 Q70,195 140,205 Q210,215 280,200 L320,198" stroke="#ffffff" strokeWidth="8" fill="none"/>
                      <path d="M100,0 Q95,80 105,160 Q115,240 110,320" stroke="#ffffff" strokeWidth="8" fill="none"/>
                      <path d="M220,0 Q225,70 215,140 Q205,210 210,280 L212,320" stroke="#ffffff" strokeWidth="8" fill="none"/>
                      
                      {/* Secondary roads - curved and branching */}
                      <path d="M0,60 Q60,58 120,65 Q180,72 240,68 Q280,65 320,62" stroke="#ffffff" strokeWidth="4" fill="none"/>
                      <path d="M0,260 Q50,258 100,265 Q150,272 200,268 Q250,264 320,260" stroke="#ffffff" strokeWidth="4" fill="none"/>
                      <path d="M160,0 Q158,60 165,120 Q172,180 168,240 Q165,280 162,320" stroke="#ffffff" strokeWidth="4" fill="none"/>
                      <path d="M40,0 Q42,50 38,100 Q34,150 40,200 Q46,250 42,320" stroke="#ffffff" strokeWidth="4" fill="none"/>
                      
                      {/* Local streets - grid pattern */}
                      <path d="M0,140 L320,142" stroke="#ffffff" strokeWidth="2" fill="none"/>
                      <path d="M0,180 L320,182" stroke="#ffffff" strokeWidth="2" fill="none"/>
                      <path d="M80,0 L82,320" stroke="#ffffff" strokeWidth="2" fill="none"/>
                      <path d="M260,0 L262,320" stroke="#ffffff" strokeWidth="2" fill="none"/>
                      
                      {/* Road center lines on major highways */}
                      <path d="M0,100 Q80,95 160,105 Q240,115 320,110" stroke="#fbbf24" strokeWidth="1" strokeDasharray="8,4" fill="none"/>
                      <path d="M100,0 Q95,80 105,160 Q115,240 110,320" stroke="#fbbf24" strokeWidth="1" strokeDasharray="8,4" fill="none"/>
                      
                      {/* Points of interest */}
                      <circle cx="150" cy="150" r="3" fill="#ef4444"/>
                      <text x="155" y="155" fontSize="6" fill="#374151">School</text>
                      <circle cx="200" cy="80" r="3" fill="#3b82f6"/>
                      <text x="205" y="85" fontSize="6" fill="#374151">Hospital</text>
                      <circle cx="80" cy="200" r="3" fill="#10b981"/>
                      <text x="85" y="205" fontSize="6" fill="#374151">Park</text>
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
                    className="bg-green-600 hover:bg-green-700 text-black font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
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