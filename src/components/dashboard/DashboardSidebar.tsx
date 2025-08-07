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
  Smartphone
} from "lucide-react";

const dashboardItems = [
  {
    title: "Overview",
    url: "/full-dashboard",
    icon: LayoutDashboard
  },
  {
    title: "My Products",
    url: "/full-dashboard/products",
    icon: Package
  },
  {
    title: "Activity",
    url: "/full-dashboard/activity",
    icon: Activity
  },
  {
    title: "Location",
    url: "/full-dashboard/location",
    icon: MapPin
  },
  {
    title: "Mobile App",
    url: "/full-dashboard/mobile-app",
    icon: Smartphone
  }
];

const profileItems = [
  {
    title: "Profile",
    url: "/full-dashboard/profile",
    icon: User
  },
  {
    title: "Emergency",
    url: "/full-dashboard/emergency",
    icon: Phone
  },
  {
    title: "Health",
    url: "/full-dashboard/health",
    icon: Heart
  },
  {
    title: "Family",
    url: "/full-dashboard/family",
    icon: Users
  }
];

const settingsItems = [
  {
    title: "Subscription",
    url: "/full-dashboard/subscription",
    icon: CreditCard
  },
  {
    title: "Notifications",
    url: "/full-dashboard/notifications",
    icon: Bell
  },
  {
    title: "Security",
    url: "/full-dashboard/security",
    icon: Shield
  },
  {
    title: "Settings",
    url: "/full-dashboard/settings",
    icon: Settings
  },
  {
    title: "Support",
    url: "/full-dashboard/support",
    icon: HelpCircle
  }
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

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
                <p className="text-sm text-sidebar-muted-foreground font-medium">Member Portal</p>
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
            Dashboard
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

        {/* Profile Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3">
            Profile
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {profileItems.map((item) => (
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
            Settings
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