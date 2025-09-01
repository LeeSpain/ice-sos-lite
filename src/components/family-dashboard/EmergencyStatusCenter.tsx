import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Activity,
  Shield,
  Bell
} from 'lucide-react';

interface EmergencyStatusCenterProps {
  activeSOSEvents: any[];
  recentAlerts: any[];
  ownerName: string;
  onSOSAcknowledge: (eventId: string) => void;
}

const EmergencyStatusCenter = ({ 
  activeSOSEvents, 
  recentAlerts, 
  ownerName, 
  onSOSAcknowledge 
}: EmergencyStatusCenterProps) => {
  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'sos_emergency': return AlertTriangle;
      case 'location_alert': return MapPin;
      case 'safety_check': return Shield;
      default: return Bell;
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'sos_emergency': return 'text-red-600';
      case 'location_alert': return 'text-orange-600';
      case 'safety_check': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Activity className="h-5 w-5" />
          Emergency Status Center
        </CardTitle>
        <p className="text-sm text-orange-600">
          Real-time emergency monitoring for {ownerName}'s safety
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Emergency Events */}
        {activeSOSEvents.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ACTIVE EMERGENCY ALERTS
            </h4>
            {activeSOSEvents.map((event) => (
              <div key={event.id} className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-red-900">🚨 SOS Emergency Active</h3>
                    <p className="text-sm text-red-700">
                      {ownerName} triggered an emergency alert
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                      {event.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">
                    URGENT
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onSOSAcknowledge(event.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I'm Responding
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/family-dashboard/emergency-map?event=${event.id}`, '_blank')}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Location
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`tel:112`)}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call 112
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* All Safe Status */
          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-800">All Clear</h3>
            <p className="text-sm text-emerald-700">
              No active emergency alerts • {ownerName} is safe
            </p>
          </div>
        )}

        {/* Recent Activity */}
        {recentAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Emergency Activity
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentAlerts.slice(0, 3).map((alert) => {
                const AlertIcon = getAlertTypeIcon(alert.alert_type);
                const alertColor = getAlertTypeColor(alert.alert_type);
                
                return (
                  <div key={alert.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                    <AlertIcon className={`h-4 w-4 ${alertColor}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {alert.alert_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={alert.status === 'delivered' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Emergency Response Guidelines */}
        <div className="p-3 bg-white rounded-lg border border-orange-200">
          <h4 className="text-sm font-medium text-orange-700 mb-2">Emergency Response Steps:</h4>
          <ol className="space-y-1 text-xs text-orange-600">
            <li>1. <strong>Acknowledge alert</strong> - Let {ownerName} know you received it</li>
            <li>2. <strong>Assess situation</strong> - Check location and contact them</li>
            <li>3. <strong>Take action</strong> - Go to location or call emergency services</li>
            <li>4. <strong>Stay connected</strong> - Keep family informed of your response</li>
          </ol>
        </div>

        {/* Quick Emergency Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-orange-700 border-orange-300 hover:bg-orange-50"
            onClick={() => window.location.href = '/family-dashboard/live-map'}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Live Location
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-orange-700 border-orange-300 hover:bg-orange-50"
            onClick={() => window.location.href = '/family-dashboard/notifications'}
          >
            <Bell className="h-4 w-4 mr-2" />
            All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyStatusCenter;