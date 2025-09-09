import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useLocationServices } from '@/hooks/useLocationServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Phone, MapPin, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import EmergencyButton from '@/components/sos-app/EmergencyButton';

const SOSAppPage = () => {
  const { user } = useAuth();
  const { contacts, loading: contactsLoading } = useEmergencyContacts();
  const { permissionState } = useLocationServices();

  const locationPermissionGranted = permissionState?.granted;

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
        <div className="flex justify-center">
          <EmergencyButton />
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
        <div className="flex gap-4">
          <Link to="/member-dashboard" className="flex-1">
            <Button variant="ghost" className="w-full text-white hover:bg-white/10">
              ← Dashboard
            </Button>
          </Link>
          <Link to="/family-app" className="flex-1">
            <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
              Family Tracker
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SOSAppPage;