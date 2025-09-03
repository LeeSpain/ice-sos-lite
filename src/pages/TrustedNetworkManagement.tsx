import React, { useState } from 'react';
import { Shield, Users, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { NetworkOverview } from '@/components/trusted-network/NetworkOverview';
import { ContactManagement } from '@/components/trusted-network/ContactManagement';
import { AccessLevels } from '@/components/trusted-network/AccessLevels';
import { BillingPlans } from '@/components/trusted-network/BillingPlans';
import { MobileAppSetup } from '@/components/trusted-network/MobileAppSetup';
import { SEO } from '@/components/SEO';

const TrustedNetworkManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <SEO 
        title="Trusted Network Management - ICE SOS Emergency Coordination"
        description="Professional emergency contact management with family and carer coordination. Secure emergency response network with granular privacy controls."
        keywords={["emergency contacts", "family coordination", "professional care", "emergency network", "ICE SOS"]}
      />
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            {/* Professional Header */}
            <header className="bg-gradient-to-r from-guardian to-primary shadow-lg border-b border-primary/20">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-white hover:bg-white/10" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Trusted Network</h1>
                      <p className="text-white/80 text-sm">Emergency Coordination Management</p>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  Professional Dashboard
                </Badge>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-background">
              <div className="container mx-auto px-6 py-8">
                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger 
                      value="overview" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contacts" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Contacts</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="access" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Access</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="billing" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Plans</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mobile" 
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Mobile</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <TabsContent value="overview" className="space-y-6">
                    <NetworkOverview />
                  </TabsContent>

                  <TabsContent value="contacts" className="space-y-6">
                    <ContactManagement />
                  </TabsContent>

                  <TabsContent value="access" className="space-y-6">
                    <AccessLevels />
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-6">
                    <BillingPlans />
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-6">
                    <MobileAppSetup />
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default TrustedNetworkManagement;