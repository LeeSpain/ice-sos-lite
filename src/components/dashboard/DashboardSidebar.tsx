import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  Heart,
  Phone,
  Settings,
  CreditCard,
  Activity,
  MapPin,
  Users,
  Shield,
  Bell,
  HelpCircle,
  Bluetooth,
  Package,
  Smartphone,
  Map,
  Navigation,
  History,
  UserPlus
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const useDashboardItems = () => {
  const { t } = useTranslation();
  
  const dashboardItems = [
    {
      title: t('dashboard.overview'),
      url: "/full-dashboard",
      icon: LayoutDashboard
    },
    {
      title: t('dashboard.profile'),
      url: "/full-dashboard/profile",
      icon: User
    },
    {
      title: t('dashboard.myProducts'),
      url: "/full-dashboard/products",
      icon: Package
    },
    {
      title: t('dashboard.flickControl'),
      url: "/full-dashboard/flic",
      icon: Bluetooth
    },
    {
      title: t('dashboard.activity'),
      url: "/full-dashboard/activity",
      icon: Activity
    },
    {
      title: "Emergency Connections",
      url: "/full-dashboard/connections",
      icon: UserPlus
    },
    {
      title: t('dashboard.mobileApp'),
      url: "/full-dashboard/mobile-app",
      icon: Smartphone
    }
  ];

  const liveMapItems = [
    {
      title: t('dashboard.liveFamilyMap'),
      url: "/full-dashboard/live-map",
      icon: Map
    },
    {
      title: t('dashboard.myCircles'),
      url: "/full-dashboard/circles",
      icon: Users
    },
    {
      title: t('dashboard.placesGeofences'),
      url: "/full-dashboard/places",
      icon: Navigation
    },
    {
      title: t('dashboard.locationHistory'),
      url: "/full-dashboard/location-history",
      icon: History
    }
  ];

  const settingsItems = [
    {
      title: t('dashboard.subscription'),
      url: "/full-dashboard/subscription",
      icon: CreditCard
    },
    {
      title: t('dashboard.notifications'),
      url: "/full-dashboard/notifications",
      icon: Bell
    },
    {
      title: t('dashboard.security'),
      url: "/full-dashboard/security",
      icon: Shield
    },
    {
      title: t('dashboard.settings'),
      url: "/full-dashboard/settings",
      icon: Settings
    },
    {
      title: t('dashboard.support'),
      url: "/full-dashboard/support",
      icon: HelpCircle
    }
  ];
  
  return { dashboardItems, liveMapItems, settingsItems };
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { t } = useTranslation();
  const { dashboardItems, liveMapItems, settingsItems } = useDashboardItems();

  const isActive = (path: string) => {
    if (path === '/full-dashboard') {
      return currentPath === '/full-dashboard';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-sidebar-accent/50 border border-sidebar-primary/20" 
      : "hover:bg-sidebar-accent/30 border border-transparent";
  };

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar-background border-sidebar-border">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border/50">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-emergency rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">ICE SOS</h2>
                <p className="text-sm text-sidebar-muted-foreground font-medium">{t('dashboard.memberPortal')}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-emergency rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Main Dashboard Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3">
            {t('dashboard.overview')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                       to={item.url} 
                       end={item.url === '/full-dashboard'}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${getNavCls(item.url)}`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive(item.url) 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'bg-sidebar-muted text-sidebar-muted-foreground group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                       {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block ${
                            isActive(item.url) ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                          }`}>
                            {item.title}
                          </span>
                        </div>
                       )}
                      {!collapsed && isActive(item.url) && (
                        <div className="w-1 h-8 bg-sidebar-primary rounded-full"></div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 h-px bg-sidebar-border/50"></div>

        {/* Live Map Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3">
            {t('dashboard.liveMap')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {liveMapItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${getNavCls(item.url)}`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive(item.url) 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'bg-sidebar-muted text-sidebar-muted-foreground group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                       {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block ${
                            isActive(item.url) ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                          }`}>
                            {item.title}
                          </span>
                        </div>
                       )}
                      {!collapsed && isActive(item.url) && (
                        <div className="w-1 h-8 bg-sidebar-primary rounded-full"></div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="mx-4 h-px bg-sidebar-border/50"></div>

        {/* Settings Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3">
            {t('dashboard.settings')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${getNavCls(item.url)}`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive(item.url) 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'bg-sidebar-muted text-sidebar-muted-foreground group-hover:bg-sidebar-accent group-hover:text-sidebar-accent-foreground'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                       {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block ${
                            isActive(item.url) ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-accent-foreground'
                          }`}>
                            {item.title}
                          </span>
                        </div>
                       )}
                      {!collapsed && isActive(item.url) && (
                        <div className="w-1 h-8 bg-sidebar-primary rounded-full"></div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}