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
      render: () => <FamilyMarker id="emma" name={t('mockupNames.emma')} avatar={emmaAvatar} status="alert" />
    },
    {
      id: 'grandma',
      lat: 51.5154,
      lng: -0.1423,
      render: () => <FamilyMarker id="grandma" name={t('mockupNames.grandma')} avatar={grandmaAvatar} status="live" />
    },
    {
      id: 'dad',
      lat: 51.5094,
      lng: -0.1180,
      render: () => <FamilyMarker id="dad" name={t('mockupNames.dad')} avatar={dadAvatar} status="live" />
    },
    {
      id: 'mom',
      lat: 51.5030,
      lng: -0.1340,
      render: () => <FamilyMarker id="mom" name={t('mockupNames.mom')} avatar={momAvatar} status="live" />
    }
  ];

  return (
    <section id="features" className="py-section">
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
                    <span>{t('features.familyTracker')}</span>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                      {/* Fallback map background with family markers */}
                      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-emerald-200 opacity-80"></div>
                      
                      {/* Simulated map features */}
                      <div className="absolute inset-0">
                        {/* Roads */}
                        <div className="absolute top-1/3 left-0 right-0 h-1 bg-white opacity-60"></div>
                        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white opacity-40"></div>
                        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white opacity-60"></div>
                        <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-white opacity-40"></div>
                        
                        {/* Green spaces */}
                        <div className="absolute top-4 right-4 w-16 h-12 bg-green-300 rounded-lg opacity-50"></div>
                        <div className="absolute bottom-8 left-8 w-12 h-12 bg-green-300 rounded-full opacity-50"></div>
                        
                        {/* Buildings */}
                        <div className="absolute top-12 left-12 w-6 h-8 bg-gray-400 opacity-60"></div>
                        <div className="absolute top-16 right-16 w-8 h-6 bg-gray-400 opacity-60"></div>
                      </div>

                      {/* Family Member Markers with Real Photos */}
                      <div className="absolute top-16 left-16">
                        <div className="relative">
                          <div className="w-10 h-10 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            <img src={grandmaAvatar} alt={t('mockupNames.grandma')} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-green-500"></div>
                        </div>
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-white px-2 py-1 rounded shadow-md border whitespace-nowrap">{t('mockupNames.grandma')}</div>
                      </div>
                      
                      <div className="absolute top-20 right-12">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            <img src={dadAvatar} alt={t('mockupNames.dad')} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-blue-500"></div>
                        </div>
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-white px-2 py-1 rounded shadow-md border whitespace-nowrap">{t('mockupNames.dad')}</div>
                      </div>
                      
                      <div className="absolute bottom-12 left-12">
                        <div className="relative">
                          <div className="w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center overflow-hidden relative animate-pulse">
                            <img src={emmaAvatar} alt={t('mockupNames.emma')} className="w-full h-full object-cover rounded-full" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white animate-ping"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-500"></div>
                        </div>
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-red-50 px-2 py-1 rounded shadow-md border border-red-200 text-red-800 whitespace-nowrap">{t('mockupNames.emma')} - Alert!</div>
                      </div>

                      <div className="absolute bottom-16 right-16">
                        <div className="relative">
                          <div className="w-10 h-10 bg-pink-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            <img src={momAvatar} alt={t('mockupNames.mom')} className="w-full h-full object-cover rounded-full" />
                          </div>
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-pink-500"></div>
                        </div>
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center bg-white px-2 py-1 rounded shadow-md border whitespace-nowrap">{t('mockupNames.mom')}</div>
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
                  </div>

                  {/* Family Status Cards - Only Grandma */}
                  <div className="p-4">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          <img src={grandmaAvatar} alt={t('mockupNames.grandma')} className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-green-800">{t('features.grandmaSafe')}</p>
                          <p className="text-xs text-green-600">{t('features.atHome')}</p>
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
                          <span className="font-medium text-sm">{t('features.emergencyActive')}</span>
                        </div>
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">{t('features.responding')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Highlights */}
              <div className="absolute -left-8 top-20 bg-white rounded-xl p-3 shadow-xl border border-wellness/20 max-w-44">
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 text-wellness mr-2" />
                  <span className="font-semibold text-xs">{t('features.liveLocation')}</span>
                </div>
                <p className="text-xs text-gray-600">{t('features.realtimeTracking')}</p>
              </div>

              <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-3 shadow-xl border border-primary/20 max-w-44">
                <div className="flex items-center mb-1">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  <span className="font-semibold text-xs">{t('features.instantAlerts')}</span>
                </div>
                <p className="text-xs text-gray-600">{t('features.emergencyNotifications')}</p>
              </div>
            </div>

            {/* Right Side - Benefits */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {t('features.keepFamilyConnected')}
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('features.familyDescription')}
                </p>
              </div>

              <div className="grid gap-6 mb-8">
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-wellness/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-wellness" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{t('features.familyNetwork')}</h4>
                    <p className="text-muted-foreground">{t('features.familyNetworkDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{t('features.emergencyAlerts')}</h4>
                    <p className="text-muted-foreground">{t('features.emergencyAlertsDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{t('features.monitoring247')}</h4>
                    <p className="text-muted-foreground">{t('features.monitoring247Desc')}</p>
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
                        {t('features.familyVideo')}
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('features.connectFirstFree')}
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