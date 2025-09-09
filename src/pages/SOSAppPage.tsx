import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencySOS } from '@/hooks/useEmergencySOS';
import { useEmergencyDisclaimer } from '@/hooks/useEmergencyDisclaimer';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Phone, MapPin, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { EmergencyDisclaimerModal } from '@/components/emergency/EmergencyDisclaimerModal';

const SOSAppPage = () => {
  const { user } = useAuth();
  const { triggerEmergencySOS, isTriggering, locationPermissionGranted } = useEmergencySOS();
  const { 
    showDisclaimer, 
    requestDisclaimerAcceptance, 
    acceptDisclaimer, 
    cancelDisclaimer 
  } = useEmergencyDisclaimer();
  const { contacts, loading: contactsLoading } = useEmergencyContacts();

  const handleSOSActivation = async () => {
    // Check disclaimer first
    if (!requestDisclaimerAcceptance()) {
      return; // Disclaimer modal will show
    }

    try {
      await triggerEmergencySOS();
    } catch (error) {
      console.error('SOS activation failed:', error);
    }
  };

  const getStatusColor = () => {
    if (!locationPermissionGranted) return 'destructive';
    if (contacts.length === 0) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!locationPermissionGranted) return 'Location Required';
    if (contacts.length === 0) return 'Setup Required';
    return 'Ready';
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <SEO 
        title="Emergency SOS App"
        description="Emergency response system with one-touch SOS activation"
      />

      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center text-white py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Emergency SOS</h1>
          </div>
          <p className="text-white/80">Instant emergency response system</p>
        </div>

        {/* Status Card */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">System Status</CardTitle>
              <Badge variant={getStatusColor()} className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Location Services</span>
              </div>
              <Badge variant={locationPermissionGranted ? 'default' : 'destructive'} className="text-xs">
                {locationPermissionGranted ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Emergency Contacts</span>
              </div>
              <Badge variant={contacts.length > 0 ? 'default' : 'secondary'} className="text-xs">
                {contactsLoading ? 'Loading...' : `${contacts.length} configured`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main SOS Button */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Button
            onClick={handleSOSActivation}
            disabled={isTriggering}
            className="relative w-full h-32 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isTriggering ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-lg">Activating...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-12 w-12" />
                <span>EMERGENCY SOS</span>
                <span className="text-sm font-normal">Hold for 3 seconds</span>
              </div>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/member-dashboard/emergency-contacts">
            <Button variant="outline" className="w-full h-20 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-6 w-6" />
                <span className="text-sm">Contacts</span>
              </div>
            </Button>
          </Link>
          <Link to="/member-dashboard/settings">
            <Button variant="outline" className="w-full h-20 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <div className="flex flex-col items-center gap-2">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Emergency Contacts Summary */}
        {contacts.length > 0 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Primary Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contacts.slice(0, 2).map((contact, index) => (
                  <div key={contact.id || index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-white/70">{contact.relationship}</span>
                  </div>
                ))}
                {contacts.length > 2 && (
                  <p className="text-xs text-white/60 mt-2">
                    +{contacts.length - 2} more contacts configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="pt-4">
          <Link to="/member-dashboard">
            <Button variant="ghost" className="w-full text-white hover:bg-white/10">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Emergency Disclaimer Modal */}
      <EmergencyDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={acceptDisclaimer}
        onCancel={cancelDisclaimer}
        subscriptionTier="basic"
      />
    </div>
  );
};

export default SOSAppPage;