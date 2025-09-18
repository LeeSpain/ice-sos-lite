
import React from 'react';
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
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Users,
  MessageSquare,
  AlertTriangle,
  Activity,
  Settings,
  FileText,
  DollarSign,
  TrendingUp,
  Heart,
  Shield,
  Database,
  Bot,
  Brain,
  Package,
  MapPin,
  Mail,
  Smartphone,
  Bluetooth,
  Video,
  Map,
  Navigation,
  History,
  Phone,
  Building,
  BookOpen,
  Target
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { BlogNotificationBadge } from '@/components/admin/BlogNotificationBadge';
import { useTranslation } from 'react-i18next';
import SupabaseSecurityReminder from '@/components/admin/SupabaseSecurityReminder';

const useAdminMenuItems = () => {
  const { t } = useTranslation();
  
  return [
    {
      title: t('admin.overview'),
      items: [
        { title: t('admin.dashboard'), url: "/admin-dashboard", icon: BarChart3 },
        { title: t('admin.analytics'), url: "/admin-dashboard/analytics", icon: BarChart3 },
        { title: t('admin.videoAnalytics'), url: "/admin-dashboard/video-analytics", icon: Video },
        { title: t('admin.revenueAnalytics'), url: "/admin-dashboard/revenue", icon: DollarSign },
        { title: t('admin.userGrowth'), url: "/admin-dashboard/growth", icon: TrendingUp },
      ]
    },
    {
      title: t('admin.aiMarketing'), 
      items: [
        { title: t('admin.emmaAiAgent'), url: "/admin-dashboard/ai-agent", icon: Bot },
        { title: t('admin.rivenMarketingAi'), url: "/admin-dashboard/riven-marketing", icon: Brain },
        { title: t('admin.aiPerformance'), url: "/admin-dashboard/ai-metrics", icon: BarChart3 },
      ]
    },
    {
      title: t('admin.customerManagement'), 
      items: [
        { title: t('admin.allCustomers'), url: "/admin-dashboard/customers", icon: Users },
        { title: t('admin.subscriptions'), url: "/admin-dashboard/subscriptions", icon: Database },
        { title: t('admin.familyAccounts'), url: "/admin-dashboard/families", icon: Heart },
      ]
    },
    {
      title: t('admin.aiChatLeads'),
      items: [
        { title: t('admin.leadManagement'), url: "/admin-dashboard/leads", icon: MessageSquare },
        { title: t('admin.conversations'), url: "/admin-dashboard/conversations", icon: MessageSquare },
      ]
    },
    {
      title: t('admin.communicationMarketing'),
      items: [
        { title: t('admin.contactSubmissions'), url: "/admin-dashboard/contact-submissions", icon: Mail },
        { title: t('admin.communicationCenter'), url: "/admin-dashboard/communication", icon: MessageSquare },
      ]
    },
    {
      title: t('admin.liveMapManagement'),
      items: [
        { title: t('admin.liveMapMonitor'), url: "/admin-dashboard/live-map-monitor", icon: Map },
        { title: t('admin.circleAnalytics'), url: "/admin-dashboard/circle-analytics", icon: Users },
        { title: t('admin.geofenceManagement'), url: "/admin-dashboard/geofence-admin", icon: Navigation },
        { title: t('admin.locationData'), url: "/admin-dashboard/location-admin", icon: History },
      ]
    },
    {
      title: t('admin.emergencySafety'),
      items: [
        { title: t('admin.emergencyIncidents'), url: "/admin-dashboard/emergencies", icon: AlertTriangle },
        { title: t('admin.safetyMonitoring'), url: "/admin-dashboard/safety", icon: Shield },
      ]
    },
    {
      title: t('admin.regionalManagement'),
      items: [
        { title: t('admin.regionalHub'), url: "/admin-dashboard/regional-hub", icon: MapPin },
        { title: t('admin.regionalOrganizations'), url: "/admin-dashboard/regional-organizations", icon: Building },
        { title: t('admin.regionalUsers'), url: "/admin-dashboard/regional-users", icon: Users },
        { title: t('admin.regionalAudit'), url: "/admin-dashboard/regional-audit", icon: FileText },
      ]
    },
    {
      title: t('admin.productServices'),
      items: [
        { title: t('admin.products'), url: "/admin-dashboard/products", icon: Package },
        { title: t('admin.regionalServices'), url: "/admin-dashboard/regional-services", icon: MapPin },
        { title: t('admin.subscriptionPlans'), url: "/admin-dashboard/protection-plans", icon: Shield },
        { title: t('admin.flickControl'), url: "/admin-dashboard/flic-control", icon: Bluetooth },
      ]
    },
    {
      title: t('admin.system'),
      items: [
        { title: t('admin.userActivity'), url: "/admin-dashboard/activity", icon: Activity },
        { title: t('admin.systemSettings'), url: "/admin-dashboard/settings", icon: Settings },
        { title: t('admin.reports'), url: "/admin-dashboard/reports", icon: FileText },
        { title: t('admin.appTesting'), url: "/admin-dashboard/app-testing", icon: Smartphone },
      ]
    }
  ];
};

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();
  const adminMenuItems = useAdminMenuItems();

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: typeof adminMenuItems[0]['items']) => 
    items.some(item => isActive(item.url));

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} variant="sidebar">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-primary rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">
                  {t('dashboard.iceAdmin')}
                </h2>
                <p className="text-xs text-sidebar-foreground/60">{t('dashboard.managementDashboard')}</p>
              </div>
            )}
          </div>
        </div>
        
        {adminMenuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="px-3 py-2">
            <SidebarGroupLabel className={`${state === "collapsed" ? 'hidden' : 'block'} text-xs font-semibold text-sidebar-foreground/70 px-2 py-1 flex items-center gap-2`}>
              <div className={`w-2 h-2 rounded-full ${
                groupIndex === 0 ? 'bg-blue-500' :
                groupIndex === 1 ? 'bg-purple-500' :
                groupIndex === 2 ? 'bg-green-500' :
                groupIndex === 3 ? 'bg-orange-500' :
                groupIndex === 4 ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="group">
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]' 
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-[1.01]'
                          }`
                        }
                      >
                        <div className={`p-1.5 rounded-md transition-colors ${
                          isActive(item.url) 
                            ? 'bg-white/20' 
                            : 'bg-sidebar-accent/50 group-hover:bg-sidebar-accent'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        {state !== "collapsed" && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  console.log('🏗️ AdminLayout is rendering');
  const { t } = useTranslation();
  
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
        
        console.log('🧹 Emergency modal cleanup triggered');
      }
    };
    
    document.addEventListener('keydown', handleGlobalEscape);
    return () => document.removeEventListener('keydown', handleGlobalEscape);
  }, []);
  
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
<header className="h-16 border-b border-border/40 flex items-center px-6 bg-gradient-to-r from-background to-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60 transition-colors" />
              <div className="h-6 w-px bg-border/60" />
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {t('admin.title')}
                </h1>
                <p className="text-xs text-muted-foreground">{t('admin.subtitle')}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <BlogNotificationBadge />
              <AdminNotificationCenter />
              <LanguageCurrencySelector compact />
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/5">
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

