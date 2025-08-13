import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useLocationServices } from '@/hooks/useLocationServices';

export const LocationPermissionPrompt = () => {
  const { permissionState, requestLocationPermission } = useLocationServices();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    await requestLocationPermission();
    setIsRequesting(false);
  };

  const getStatusBadge = () => {
    if (permissionState.granted) {
      return (
        <Badge variant="default" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Location Access Granted
        </Badge>
      );
    }
    
    if (permissionState.denied) {
      return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="h-3 w-3 mr-1" />
          Location Access Denied
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Location Permission Required
      </Badge>
    );
  };

  if (permissionState.granted) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-success" />
              <CardTitle className="text-sm text-success">Location Services Active</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            ✅ Emergency SOS can share your precise GPS location with contacts
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/20 bg-warning/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Location Access Required</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Enable location access to share your precise GPS coordinates during emergencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 inline mr-1" />
            When you activate Emergency SOS, contacts will receive:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-5">
            <li>• Your exact GPS coordinates</li>
            <li>• Clickable Google Maps link</li>
            <li>• Location accuracy information</li>
            <li>• Human-readable address (when available)</li>
          </ul>
        </div>
        
        {!permissionState.denied && (
          <Button 
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full"
            size="sm"
          >
            {isRequesting ? 'Requesting Permission...' : 'Enable Location Access'}
          </Button>
        )}
        
        {permissionState.denied && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Location access was denied. To enable:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>1. Click the location icon in your browser's address bar</li>
              <li>2. Select "Allow" for location access</li>
              <li>3. Refresh this page</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};