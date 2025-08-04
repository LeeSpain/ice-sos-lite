import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, Shield, Clock, Plus, Navigation, Home, Briefcase } from "lucide-react";

export function LocationPage() {
  const [locationSharing, setLocationSharing] = useState(true);
  const [emergencySharing, setEmergencySharing] = useState(true);

  // Mock location data
  const currentLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    address: "123 Main St, New York, NY 10001",
    lastUpdated: "2 minutes ago"
  };

  const safeZones = [
    {
      id: 1,
      name: "Home",
      address: "123 Main St, New York, NY",
      radius: "200m",
      icon: Home,
      active: true
    },
    {
      id: 2,
      name: "Office",
      address: "456 Business Ave, New York, NY",
      radius: "150m",
      icon: Briefcase,
      active: true
    }
  ];

  const locationHistory = [
    {
      id: 1,
      location: "Home",
      address: "123 Main St, New York, NY",
      timestamp: "2 hours ago",
      duration: "6 hours"
    },
    {
      id: 2,
      location: "Central Park",
      address: "Central Park, New York, NY",
      timestamp: "8 hours ago",
      duration: "2 hours"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Location Services
            </CardTitle>
            <CardDescription>
              Manage your location sharing and safe zones
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Sharing Settings
            </CardTitle>
            <CardDescription>
              Control how your location is shared with family members and emergency services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Share Location with Family</h3>
                <p className="text-sm text-muted-foreground">
                  Allow family members to see your current location
                </p>
              </div>
              <Switch 
                checked={locationSharing} 
                onCheckedChange={setLocationSharing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Emergency Location Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically share location during emergency situations
                </p>
              </div>
              <Switch 
                checked={emergencySharing} 
                onCheckedChange={setEmergencySharing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentLocation.address}</h3>
                <p className="text-sm text-muted-foreground">
                  Coordinates: {currentLocation.latitude}, {currentLocation.longitude}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {currentLocation.lastUpdated}
                  </span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Safe Zones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Safe Zones
                </CardTitle>
                <CardDescription>
                  Designated areas where family members receive arrival/departure notifications
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeZones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <zone.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{zone.name}</h3>
                      <p className="text-sm text-muted-foreground">{zone.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">Radius: {zone.radius}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={zone.active ? "default" : "secondary"} 
                           className={zone.active ? "bg-green-100 text-green-800" : ""}>
                      {zone.active ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Location History
            </CardTitle>
            <CardDescription>
              Your recent location visits and duration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <h4 className="font-medium">{entry.location}</h4>
                      <p className="text-sm text-muted-foreground">{entry.address}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{entry.timestamp}</p>
                    <p>Duration: {entry.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}