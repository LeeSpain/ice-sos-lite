import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Smartphone, Mail, MessageSquare, AlertTriangle, Users, MapPin } from "lucide-react";

export function NotificationsPage() {
  const [settings, setSettings] = useState({
    emergencyAlerts: true,
    familyUpdates: true,
    locationAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    
    emergencyMethod: "all",
    familyMethod: "push",
    locationMethod: "push",
    systemMethod: "email",
    
    quietHours: true,
    quietStart: "22:00",
    quietEnd: "07:00"
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    {
      id: "emergency",
      title: "Emergency Alerts",
      description: "Critical safety alerts and SOS notifications",
      icon: AlertTriangle,
      setting: "emergencyAlerts",
      methodSetting: "emergencyMethod",
      color: "text-red-600"
    },
    {
      id: "family",
      title: "Family Updates",
      description: "Family member status changes and location updates",
      icon: Users,
      setting: "familyUpdates",
      methodSetting: "familyMethod",
      color: "text-blue-600"
    },
    {
      id: "location",
      title: "Location Notifications",
      description: "Safe zone entries/exits and location sharing alerts",
      icon: MapPin,
      setting: "locationAlerts",
      methodSetting: "locationMethod",
      color: "text-green-600"
    },
    {
      id: "system",
      title: "System Updates",
      description: "App updates, maintenance notifications, and feature announcements",
      icon: Bell,
      setting: "systemUpdates",
      methodSetting: "systemMethod",
      color: "text-purple-600"
    }
  ];

  const deliveryMethods = [
    { value: "all", label: "Push + Email + SMS" },
    { value: "push", label: "Push Notifications Only" },
    { value: "email", label: "Email Only" },
    { value: "sms", label: "SMS Only" },
    { value: "none", label: "Disabled" }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Customize how and when you receive notifications</p>
        </div>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive and how you want to receive them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationTypes.map((type) => (
              <div key={type.id} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${type.color}`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[type.setting as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(type.setting, checked)}
                  />
                </div>
                
                {settings[type.setting as keyof typeof settings] && (
                  <div className="ml-13 pt-2">
                    <label className="text-sm font-medium text-muted-foreground">Delivery Method</label>
                    <Select
                      value={settings[type.methodSetting as keyof typeof settings] as string}
                      onValueChange={(value) => updateSetting(type.methodSetting, value)}
                    >
                      <SelectTrigger className="w-64 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set specific hours when non-emergency notifications are silenced
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Quiet Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Emergency alerts will still come through during quiet hours
                </p>
              </div>
              <Switch
                checked={settings.quietHours}
                onCheckedChange={(checked) => updateSetting("quietHours", checked)}
              />
            </div>
            
            {settings.quietHours && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Select
                    value={settings.quietStart}
                    onValueChange={(value) => updateSetting("quietStart", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Select
                    value={settings.quietEnd}
                    onValueChange={(value) => updateSetting("quietEnd", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Channels</CardTitle>
            <CardDescription>
              Manage your notification delivery preferences across different channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Mobile app alerts</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">Email notifications</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold">SMS</h3>
                  <p className="text-sm text-muted-foreground">Text messages</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Communications</CardTitle>
            <CardDescription>
              Control promotional and marketing communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Promotional Emails</h3>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features, tips, and special offers
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}