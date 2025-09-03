import React from 'react';
import { Users, Heart, Shield, Wifi, WifiOff, Dot, ArrowRight, UserCircle, Baby, User } from "lucide-react";

export const FamilyCircleSection = () => {
  return (
    <section className="py-section bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Family Connections</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            How Your
            <span className="bg-gradient-to-r from-primary via-emergency to-wellness bg-clip-text text-transparent"> Family Circle</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Create secure connections between family members and trusted carers. When emergencies happen, 
            everyone in your circle knows instantly and can coordinate the response.
          </p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="relative min-h-[600px] flex items-center justify-center">
            
            {/* Central Grandfather Figure */}
            <div className="absolute z-20 flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  <img 
                    src="/dad-avatar.png" 
                    alt="Grandfather" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="font-semibold text-foreground">Grandad</p>
                <p className="text-sm text-muted-foreground">Protected Person</p>
              </div>
            </div>

            {/* Family Connections (Solid Lines) */}
            
            {/* Daughter - Left */}
            <div className="absolute left-12 top-20 z-10">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-wellness to-wellness/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <img 
                        src="/emma-avatar.png" 
                        alt="Daughter" 
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-sm">Emma</p>
                    <p className="text-xs text-muted-foreground">Daughter</p>
                  </div>
                </div>
                {/* Connection Line */}
                <div className="w-32 h-0.5 bg-gradient-to-r from-wellness to-primary"></div>
              </div>
            </div>

            {/* Son - Right */}
            <div className="absolute right-12 top-20 z-10">
              <div className="flex items-center space-x-4 flex-row-reverse">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-guardian to-guardian/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-sm">James</p>
                    <p className="text-xs text-muted-foreground">Son</p>
                  </div>
                </div>
                {/* Connection Line */}
                <div className="w-32 h-0.5 bg-gradient-to-l from-guardian to-primary"></div>
              </div>
            </div>

            {/* Grandchild - Top */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emergency to-emergency/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Baby className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-sm">Sophie</p>
                    <p className="text-xs text-muted-foreground">Grandchild</p>
                  </div>
                </div>
                {/* Connection Line */}
                <div className="w-0.5 h-24 bg-gradient-to-b from-emergency to-primary"></div>
              </div>
            </div>

            {/* Trusted Carer Connections (Dashed Lines) */}
            
            {/* Professional Carer - Bottom Left */}
            <div className="absolute bottom-4 left-20 z-10">
              <div className="flex flex-col items-center space-y-4">
                {/* Connection Line - Dashed */}
                <div className="w-0.5 h-24 bg-gradient-to-t from-muted to-primary opacity-60" 
                     style={{
                       background: `repeating-linear-gradient(to top, hsl(var(--primary)) 0px, hsl(var(--primary)) 4px, transparent 4px, transparent 8px)`
                     }}>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <UserCircle className="h-8 w-8 text-foreground" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-sm">Care Pro</p>
                    <p className="text-xs text-muted-foreground">Professional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Neighbor/Friend - Bottom Right */}
            <div className="absolute bottom-4 right-20 z-10">
              <div className="flex flex-col items-center space-y-4">
                {/* Connection Line - Dashed */}
                <div className="w-0.5 h-24 bg-gradient-to-t from-muted to-primary opacity-60"
                     style={{
                       background: `repeating-linear-gradient(to top, hsl(var(--primary)) 0px, hsl(var(--primary)) 4px, transparent 4px, transparent 8px)`
                     }}>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Heart className="h-8 w-8 text-foreground" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-sm">Neighbor</p>
                    <p className="text-xs text-muted-foreground">Trusted Friend</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Circles for Visual Depth */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-primary/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary/10 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Connection Types Explanation */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-wellness/10 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-wellness rounded-full"></div>
              <h3 className="text-xl font-bold text-foreground">Family Circle</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Direct family members with full access to emergency status, location data, and coordination capabilities.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-wellness" />
                <span>Instant SOS notifications</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-wellness" />
                <span>Real-time location access</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-wellness" />
                <span>Full coordination rights</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl p-8 border border-muted/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-muted border-2 border-primary rounded-full" 
                   style={{
                     background: `repeating-conic-gradient(hsl(var(--primary)) 0deg, hsl(var(--primary)) 45deg, transparent 45deg, transparent 90deg)`
                   }}>
              </div>
              <h3 className="text-xl font-bold text-foreground">Trusted Contacts</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Professional carers, neighbors, and friends with limited access for support and backup assistance.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>Emergency notifications</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>Status updates only</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>Support role access</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Scenario Flow */}
        <div className="bg-gradient-to-r from-emergency/10 via-primary/5 to-wellness/10 rounded-3xl p-8 border border-emergency/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">When Emergency Happens</h3>
            <p className="text-muted-foreground">See how alerts flow through your family circle in real-time</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emergency rounded-full flex items-center justify-center mx-auto mb-4 emergency-pulse">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">SOS Activated</h4>
              <p className="text-sm text-muted-foreground">Grandad presses emergency button</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h4 className="font-semibold mb-2">Instant Alerts</h4>
              <p className="text-sm text-muted-foreground">All family members notified simultaneously</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-wellness rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Coordination</h4>
              <p className="text-sm text-muted-foreground">Family coordinates response in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-guardian rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Help Arrives</h4>
              <p className="text-sm text-muted-foreground">Fastest responder reaches grandad</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};