import { Button } from "@/components/ui/button";
import { Users, Heart, MapPin, Phone, Shield, Clock, Play } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { IntroVideoModal } from "@/components/IntroVideoModal";
import { useMapProvider } from "@/hooks/useMapProvider";
import FamilyMarker from "@/components/map/FamilyMarker";
import emmaAvatar from "/emma-avatar.png";
import grandmaAvatar from "/grandma-avatar.png";
import dadAvatar from "/dad-avatar.png";
import momAvatar from "/mom-avatar.png";

const Features = () => {
  const { t } = useTranslation();
  const { MapView } = useMapProvider();

  // Family member data for the map
  const familyMembers = [
    {
      id: 'emma',
      lat: 51.5074,
      lng: -0.1278,
      render: () => <FamilyMarker id="emma" name="Emma" avatar={emmaAvatar} status="alert" />
    },
    {
      id: 'grandma',
      lat: 51.5154,
      lng: -0.1423,
      render: () => <FamilyMarker id="grandma" name="Grandma" avatar={grandmaAvatar} status="live" />
    },
    {
      id: 'dad',
      lat: 51.5094,
      lng: -0.1180,
      render: () => <FamilyMarker id="dad" name="Dad" avatar={dadAvatar} status="live" />
    },
    {
      id: 'mom',
      lat: 51.5030,
      lng: -0.1340,
      render: () => <FamilyMarker id="mom" name="Mom" avatar={momAvatar} status="live" />
    }
  ];

  return (
    <section id="features" className="py-section mb-8">
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

                  {/* Real Mapbox Map */}
                  <div className="h-80 relative overflow-hidden bg-gray-100 rounded-lg">
                    <MapView 
                      className="w-full h-full"
                      markers={familyMembers}
                      center={{ lat: 51.5074, lng: -0.1278 }}
                      zoom={12}
                    />
                  </div>

                  {/* Family Status Cards - Only Grandma */}
                  <div className="p-4">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          <img src={grandmaAvatar} alt="Grandma" className="w-full h-full object-cover rounded-full" />
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
                    className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
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