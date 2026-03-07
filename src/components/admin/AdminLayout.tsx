
import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { BlogNotificationBadge } from '@/components/admin/BlogNotificationBadge';
import { useTranslation } from 'react-i18next';
import SupabaseSecurityReminder from '@/components/admin/SupabaseSecurityReminder';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const useAdminMenuItems = () => {
  const { t } = useTranslation();
  
  return [
    {
      title: t('admin.overview'),
      items: [
        { title: t('admin.dashboard'), url: "/admin-dashboard" },
        { title: t('admin.analytics'), url: "/admin-dashboard/analytics" },
        { title: t('admin.videoAnalytics'), url: "/admin-dashboard/video-analytics" },
        { title: t('admin.revenueAnalytics'), url: "/admin-dashboard/revenue" },
        { title: t('admin.userGrowth'), url: "/admin-dashboard/growth" },
      ]
    },
    {
      title: t('admin.aiMarketing'),
      items: [
        { title: t('admin.claraAiAgent'), url: "/admin-dashboard/ai-agent" },
        { title: t('admin.rivenMarketingAi'), url: "/admin-dashboard/riven-marketing" },
        { title: t('admin.aiPerformance'), url: "/admin-dashboard/ai-metrics" },
      ]
    },
    {
      title: t('admin.customerManagement'),
      items: [
        { title: t('admin.allCustomers'), url: "/admin-dashboard/customers" },
        { title: t('admin.subscriptions'), url: "/admin-dashboard/subscriptions" },
        { title: t('admin.familyAccounts'), url: "/admin-dashboard/families" },
      ]
    },
    {
      title: t('admin.aiChatLeads'),
      items: [
        { title: t('admin.leadManagement'), url: "/admin-dashboard/leads" },
        { title: t('admin.leadIntelligence'), url: "/admin-dashboard/lead-intelligence" },
        { title: t('admin.conversations'), url: "/admin-dashboard/conversations" },
      ]
    },
    {
      title: t('admin.communicationMarketing'),
      items: [
        { title: t('admin.contactSubmissions'), url: "/admin-dashboard/contact-submissions" },
        { title: t('admin.communicationCenter'), url: "/admin-dashboard/communication" },
      ]
    },
    {
      title: t('admin.liveMapManagement'),
      items: [
        { title: t('admin.liveMapMonitor'), url: "/admin-dashboard/live-map-monitor" },
        { title: t('admin.circleAnalytics'), url: "/admin-dashboard/circle-analytics" },
        { title: t('admin.geofenceManagement'), url: "/admin-dashboard/geofence-admin" },
        { title: t('admin.locationData'), url: "/admin-dashboard/location-admin" },
      ]
    },
    {
      title: t('admin.emergencySafety'),
      items: [
        { title: 'SOS Incidents (Clar AI)', url: "/admin-dashboard/sos-incidents" },
        { title: t('admin.emergencyIncidents'), url: "/admin-dashboard/emergencies" },
        { title: t('admin.safetyMonitoring'), url: "/admin-dashboard/safety" },
      ]
    },
    {
      title: t('admin.regionalManagement'),
      items: [
        { title: t('admin.regionalHub'), url: "/admin-dashboard/regional-hub" },
        { title: t('admin.regionalOrganizations'), url: "/admin-dashboard/regional-organizations" },
        { title: t('admin.regionalUsers'), url: "/admin-dashboard/regional-users" },
        { title: t('admin.regionalAudit'), url: "/admin-dashboard/regional-audit" },
        { title: 'Transfer to Care Conneqt', url: "/admin-dashboard/transfer-to-care" },
      ]
    },
    {
      title: t('admin.productServices'),
      items: [
        { title: t('admin.products'), url: "/admin-dashboard/products" },
        { title: t('admin.regionalServices'), url: "/admin-dashboard/regional-services" },
        { title: t('admin.subscriptionPlans'), url: "/admin-dashboard/subscription-plans" },
        { title: t('admin.flickControl'), url: "/admin-dashboard/flic-control" },
      ]
    },
    {
      title: t('admin.system'),
      items: [
        { title: t('admin.userActivity'), url: "/admin-dashboard/activity" },
        { title: t('admin.systemSettings'), url: "/admin-dashboard/settings" },
        { title: t('admin.reports'), url: "/admin-dashboard/reports" },
        { title: t('admin.appTesting'), url: "/admin-dashboard/app-testing" },
      ]
    }
  ];
};

function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();
  const adminMenuItems = useAdminMenuItems();

  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Auto-expand the section that contains the current active route
    const activeSection = adminMenuItems.find(group =>
      group.items.some(item => item.url === currentPath)
    );
    return new Set(activeSection ? [activeSection.title] : []);
  });

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: typeof adminMenuItems[0]['items']) =>
    items.some(item => isActive(item.url));

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  return (
    <Sidebar collapsible="offcanvas" className="w-64" variant="sidebar">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-primary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-sidebar-foreground">
                {t('dashboard.iceAdmin')}
              </h2>
              <p className="text-xs text-sidebar-foreground/60">{t('dashboard.managementDashboard')}</p>
            </div>
          </div>
        </div>

        {adminMenuItems.map((group, groupIndex) => {
          const isExpanded = expandedSections.has(group.title);
          const hasActiveItem = isGroupActive(group.items);

          return (
            <SidebarGroup key={group.title} className="px-3 py-2">
              <SidebarGroupLabel
                className={`text-sm font-semibold px-2 py-2 flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/50 rounded-md transition-colors ${
                  hasActiveItem ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'
                }`}
                onClick={() => toggleSection(group.title)}
              >
                <div className={`w-2 h-2 rounded-full ${
                  groupIndex === 0 ? 'bg-blue-500' :
                  groupIndex === 1 ? 'bg-purple-500' :
                  groupIndex === 2 ? 'bg-green-500' :
                  groupIndex === 3 ? 'bg-orange-500' :
                  groupIndex === 4 ? 'bg-red-500' :
                  groupIndex === 5 ? 'bg-cyan-500' :
                  groupIndex === 6 ? 'bg-amber-500' :
                  groupIndex === 7 ? 'bg-pink-500' :
                  groupIndex === 8 ? 'bg-indigo-500' :
                  'bg-gray-500'
                }`} />
                <span className="flex-1">{group.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform" />
                )}
              </SidebarGroupLabel>

              {isExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1 mt-1">
                    {group.items.map((item, itemIndex) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="group">
                          <NavLink
                            to={item.url}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                                isActive
                                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`
                            }
                          >
                            {item.title}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Emergency cleanup for stuck modal overlays
  React.useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && e.ctrlKey) {
        // Emergency cleanup - remove any stuck modal overlays
        const overlays = document.querySelectorAll('[data-state="open"][role="dialog"]');
        const backdrops = document.querySelectorAll('[data-radix-popper-content-wrapper]');
        
        overlays.forEach(overlay => {
          const parent = overlay.parentElement;
          if (parent) parent.style.display = 'none';
        });
        
        backdrops.forEach(backdrop => {
          const element = backdrop as HTMLElement;
          element.style.display = 'none';
        });
        
        // Force remove any backdrop blur overlays
        const blurOverlays = document.querySelectorAll('.fixed.inset-0.z-\\[60\\]');
        blurOverlays.forEach(overlay => {
          (overlay as HTMLElement).style.display = 'none';
        });
        
        // Emergency modal cleanup triggered
      }
    };
    
    document.addEventListener('keydown', handleGlobalEscape);
    return () => document.removeEventListener('keydown', handleGlobalEscape);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b border-border/40 flex items-center px-4 md:px-6 bg-gradient-to-r from-background to-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="hover:bg-muted/60 transition-colors" />
              <div className="h-6 w-px bg-border/60" />
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {t('admin.title')}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('admin.subtitle')}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <BlogNotificationBadge />
              <AdminNotificationCenter />
              <LanguageCurrencySelector compact />
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t('dashboard.signOut')}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-background via-background to-muted/5 overflow-x-hidden">
            {/* Security reminder for Supabase Auth hardening */}
            <div className="max-w-5xl mx-auto mb-4">
              <SupabaseSecurityReminder />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

