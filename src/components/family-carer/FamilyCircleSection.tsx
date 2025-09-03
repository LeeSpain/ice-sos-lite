import React from 'react';
import { Users, Heart, Shield, Wifi, AlertTriangle, User, Clock, Baby, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackgroundMap } from "./BackgroundMap";

export const FamilyCircleSection: React.FC = () => {
  return (
    <section className="py-section bg-gradient-to-br from-background to-muted/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-wellness/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - Matching Homepage Pattern */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            How Your Family Circle Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Create secure connections with family members and trusted contacts. Everyone in your circle knows exactly what's happening during an emergency.
          </p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="relative max-w-6xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Your Emergency Network
            </h3>
            <p className="text-lg text-muted-foreground">
              See how information flows instantly through your family circle during an emergency
            </p>
          </div>
          
          {/* Desktop Flow */}
          <div className="hidden lg:block relative h-[500px] bg-gradient-to-br from-primary/5 to-wellness/10 rounded-3xl p-8 border border-primary/10 shadow-2xl backdrop-blur-sm">
            {/* Background Map */}
            <BackgroundMap className="z-0" />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl z-5"></div>
            
            {/* Animated Connection Lines - SVG */}
            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 800 500">
              <defs>
                <linearGradient id="familyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="hsl(var(--wellness))" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="trustedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              
              {/* Family connections - Solid animated lines */}
              <path d="M 400 250 Q 200 150 150 120" stroke="url(#familyGradient)" strokeWidth="3" fill="none" strokeDasharray="0" className="animate-pulse">
                <animate attributeName="stroke-dasharray" values="0,1000;20,980;0,1000" dur="3s" repeatCount="indefinite"/>
              </path>
              <path d="M 400 250 Q 600 150 650 120" stroke="url(#familyGradient)" strokeWidth="3" fill="none" strokeDasharray="0" className="animate-pulse">
                <animate attributeName="stroke-dasharray" values="0,1000;20,980;0,1000" dur="3s" repeatCount="indefinite"/>
              </path>
              <path d="M 400 250 Q 400 100 400 80" stroke="url(#familyGradient)" strokeWidth="3" fill="none" strokeDasharray="0" className="animate-pulse">
                <animate attributeName="stroke-dasharray" values="0,1000;20,980;0,1000" dur="3s" repeatCount="indefinite"/>
              </path>
              
              {/* Trusted contact connections - Dashed lines */}
              <path d="M 400 250 Q 200 350 150 380" stroke="url(#trustedGradient)" strokeWidth="2" fill="none" strokeDasharray="10,10" className="animate-pulse">
                <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite"/>
              </path>
              <path d="M 400 250 Q 600 350 650 380" stroke="url(#trustedGradient)" strokeWidth="2" fill="none" strokeDasharray="10,10" className="animate-pulse">
                <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite"/>
              </path>
            </svg>

            {/* Central Figure - Grandad with glassmorphism effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/50 shadow-2xl flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-wellness/20 rounded-full"></div>
                  <img src="/grandma-avatar.png" alt="Grandmother" className="w-20 h-20 object-cover rounded-full relative z-10 border-2 border-white/30" />
                  
                  {/* Pulsing alert ring */}
                  <div className="absolute -inset-2 border-4 border-emergency/60 rounded-full animate-ping"></div>
                  <div className="absolute -inset-1 border-2 border-emergency rounded-full"></div>
                </div>
                
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-white/50 text-sm font-semibold text-primary">
                  Grandmother
                </div>
                
                {/* Alert indicator with animation */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-emergency rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Family Members with enhanced styling */}
            {/* Daughter */}
            <div className="absolute top-12 left-12">
              <div className="relative group hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-wellness/20 to-primary/10 rounded-full"></div>
                  <img src="/mom-avatar.png" alt="Daughter" className="w-16 h-16 object-cover rounded-full relative z-10" />
                  
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-xs font-medium">
                  Daughter
                </div>
                <Badge className="absolute -top-4 -right-4 text-xs px-3 py-1 bg-primary/90 text-white shadow-lg">
                  Family
                </Badge>
              </div>
            </div>

            {/* Son */}
            <div className="absolute top-12 right-12">
              <div className="relative group hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-wellness/20 to-primary/10 rounded-full"></div>
                  <img src="/dad-avatar.png" alt="Son" className="w-16 h-16 object-cover rounded-full relative z-10" />
                  
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-xs font-medium">
                  Son
                </div>
                <Badge className="absolute -top-4 -right-4 text-xs px-3 py-1 bg-primary/90 text-white shadow-lg">
                  Family
                </Badge>
              </div>
            </div>

            {/* Grandchild */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="relative group hover:scale-110 transition-transform duration-300">
                <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-wellness/20 to-primary/10 rounded-full"></div>
                  <img src="/emma-avatar.png" alt="Grandchild" className="w-14 h-14 object-cover rounded-full relative z-10" />
                  
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-xs font-medium">
                  Emma
                </div>
                <Badge className="absolute -top-4 -right-4 text-xs px-3 py-1 bg-primary/90 text-white shadow-lg">
                  Family
                </Badge>
              </div>
            </div>

            {/* Trusted Contacts with enhanced styling */}
            {/* Professional Carer */}
            <div className="absolute bottom-12 left-12">
              <div className="relative group hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-muted/10 rounded-full"></div>
                    <img src="/lovable-uploads/carer-avatar.png" alt="Professional Carer" className="w-16 h-16 object-cover rounded-full relative z-10" />
                  
                  {/* Available status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-xs font-medium">
                  Carer
                </div>
                <Badge variant="outline" className="absolute -top-4 -right-4 text-xs px-3 py-1 bg-white/90 shadow-lg">
                  Trusted
                </Badge>
              </div>
            </div>

            {/* Neighbor */}
            <div className="absolute bottom-12 right-12">
              <div className="relative group hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-muted/10 rounded-full"></div>
                    <img src="/lovable-uploads/neighbor-avatar.png" alt="Trusted Neighbor" className="w-16 h-16 object-cover rounded-full relative z-10" />
                  
                  {/* Available status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg text-xs font-medium">
                  Neighbor
                </div>
                <Badge variant="outline" className="absolute -top-4 -right-4 text-xs px-3 py-1 bg-white/90 shadow-lg">
                  Trusted
                </Badge>
              </div>
            </div>
          </div>

          {/* Mobile Flow - Enhanced vertical layout */}
          <div className="lg:hidden space-y-8 bg-gradient-to-b from-primary/5 to-wellness/10 rounded-3xl p-6 border border-primary/10 shadow-xl relative">
            {/* Background Map */}
            <BackgroundMap className="z-0" />
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/50 shadow-xl flex items-center justify-center mx-auto mb-4 overflow-hidden relative">
                  <img src="/grandma-avatar.png" alt="Grandmother" className="w-20 h-20 object-cover rounded-full" />
                  
                  {/* Pulsing alert rings */}
                  <div className="absolute -inset-2 border-4 border-emergency/60 rounded-full animate-ping"></div>
                  <div className="absolute -inset-1 border-2 border-emergency rounded-full"></div>
                </div>
                
                {/* Alert indicator */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emergency rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <h4 className="font-semibold text-lg">Grandmother</h4>
              <p className="text-sm text-muted-foreground">Emergency Alert Activated</p>
            </div>

            {/* Animated connection indicator */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-1 h-8 bg-gradient-to-b from-primary/50 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Family members */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="relative group">
                  <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    <img src="/mom-avatar.png" alt="Daughter" className="w-16 h-16 object-cover rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <h5 className="font-medium">Daughter</h5>
                  <Badge className="text-xs bg-primary/90 text-white">Family</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative group">
                  <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    <img src="/dad-avatar.png" alt="Son" className="w-16 h-16 object-cover rounded-full" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <h5 className="font-medium">Son</h5>
                  <Badge className="text-xs bg-primary/90 text-white">Family</Badge>
                </div>
              </div>
            </div>

            {/* Connection separator */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-secondary to-secondary/50 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="w-1 h-6 bg-gradient-to-b from-secondary/50 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Trusted contacts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="relative group">
                  <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-muted/10 rounded-full"></div>
                    <img src="/lovable-uploads/carer-avatar.png" alt="Professional Carer" className="w-16 h-16 object-cover rounded-full relative z-10" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <h5 className="font-medium text-sm">Professional Carer</h5>
                  <Badge variant="outline" className="text-xs bg-white/90">Trusted</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="relative group">
                  <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full border-3 border-white/50 shadow-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-muted/10 rounded-full"></div>
                    <img src="/lovable-uploads/neighbor-avatar.png" alt="Trusted Neighbor" className="w-16 h-16 object-cover rounded-full relative z-10" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <h5 className="font-medium">Neighbor</h5>
                  <Badge variant="outline" className="text-xs bg-white/90">Trusted</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Types Explanation */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-wellness/10 to-primary/10 rounded-2xl p-8 border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              <h3 className="text-xl font-bold text-foreground">Family Circle</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20">Always Connected</Badge>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your closest family members stay connected with you through continuous location sharing and full emergency coordination. They're always just a glance away from knowing you're safe.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Always-On Location Sharing</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Family members can see your real-time location 24/7, giving everyone peace of mind. Perfect for knowing when you've arrived safely or if you need assistance.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Instant Emergency Response</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">The moment an SOS is triggered, family members receive immediate alerts and can coordinate the response together in real-time.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-primary/10">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Full Coordination Access</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Family members can see each other's locations during emergencies, communicate through the app, and ensure the fastest response possible.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/20 to-secondary/10 rounded-2xl p-8 border border-muted/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 border-2 border-secondary border-dashed rounded-full animate-pulse"></div>
              <h3 className="text-xl font-bold text-foreground">Trusted Contacts</h3>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">Privacy First</Badge>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Professional carers, close neighbors, and trusted friends who provide support when needed, while respecting your privacy. They're only alerted during genuine emergencies unless you choose otherwise.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-secondary/10">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Emergency-Only Alerts</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Trusted contacts are only notified during genuine SOS situations, ensuring your privacy while maintaining a reliable support network when you need it most.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-secondary/10">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCircle className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Professional Support Access</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Perfect for professional carers who need emergency access but respect your daily privacy. You can grant additional permissions if desired.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-white/60 rounded-lg border border-secondary/10">
                <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Wifi className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Customizable Permissions</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">You control what information trusted contacts can see. Start with emergency-only access and upgrade to location sharing if you choose.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Scenario Flow */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">When Emergency Happens</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See how our seamless emergency response system activates instantly, connecting your entire support network in seconds
            </p>
          </div>
          
          {/* Professional Flow Timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connection Line - Desktop */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-emergency via-primary to-wellness opacity-30"></div>
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-emergency via-primary to-wellness">
              <div className="h-full bg-gradient-to-r from-emergency via-primary to-wellness animate-pulse"></div>
            </div>
            
            {/* Flow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              
              {/* Step 1: SOS Activation */}
              <div className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-emergency text-white rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                  1
                </div>
                
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emergency to-emergency/80 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 relative z-10">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                  {/* Pulsing Rings */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-emergency/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 border-2 border-emergency/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-foreground">SOS Button Pressed</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    Emergency SOS button is pressed, immediately triggering the emergency response system
                  </p>
                </div>
                
                {/* Mobile Connection Arrow */}
                <div className="md:hidden flex justify-center mt-6 mb-2">
                  <div className="w-6 h-6 border-r-2 border-b-2 border-primary transform rotate-45 animate-bounce"></div>
                </div>
              </div>
              
              {/* Step 2: Instant Alerts */}
              <div className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                  2
                </div>
                
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 relative z-10">
                    <Wifi className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  {/* Signal Waves */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 border-2 border-primary/50 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute inset-8 border-2 border-primary/70 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-foreground">Emergency Calls Made</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    System automatically calls emergency contacts in priority order until someone answers
                  </p>
                </div>
                
                {/* Mobile Connection Arrow */}
                <div className="md:hidden flex justify-center mt-6 mb-2">
                  <div className="w-6 h-6 border-r-2 border-b-2 border-primary transform rotate-45 animate-bounce"></div>
                </div>
              </div>
              
              {/* Step 3: Real-time Coordination */}
              <div className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-wellness text-white rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                  3
                </div>
                
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-wellness to-wellness/80 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 relative z-10">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  {/* Coordination Rings */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-2 border-wellness/40 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
                    <div className="absolute inset-6 border-2 border-wellness/60 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-foreground">Family Coordination</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    Family members receive alerts and coordinate who's responding while calls are being made
                  </p>
                </div>
                
                {/* Mobile Connection Arrow */}
                <div className="md:hidden flex justify-center mt-6 mb-2">
                  <div className="w-6 h-6 border-r-2 border-b-2 border-primary transform rotate-45 animate-bounce"></div>
                </div>
              </div>
              
              {/* Step 4: Help Arrives */}
              <div className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                  4
                </div>
                
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 relative z-10">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  {/* Success Glow */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-green-500/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-foreground">Help Responds</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    Emergency contact answers the call and family member arrives with full situation awareness
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bottom Statistics */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-wellness/10 px-6 py-3 rounded-full border border-primary/20">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Average response time: Under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};