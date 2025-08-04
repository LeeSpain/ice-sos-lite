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
  Package
} from "lucide-react";

const dashboardItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Dashboard overview"
  },
  {
    title: "My Products",
    url: "/dashboard/products",
    icon: Package,
    description: "Manage your devices"
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "Personal information"
  },
  {
    title: "Emergency",
    url: "/dashboard/emergency",
    icon: Phone,
    description: "Emergency contacts & settings"
  },
  {
    title: "Health",
    url: "/dashboard/health",
    icon: Heart,
    description: "Medical information"
  },
  {
    title: "Family",
    url: "/dashboard/family",
    icon: Users,
    description: "Family members"
  },
  {
    title: "Location",
    url: "/dashboard/location",
    icon: MapPin,
    description: "Location services"
  },
  {
    title: "Activity",
    url: "/dashboard/activity",
    icon: Activity,
    description: "Activity history"
  }
];

const settingsItems = [
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    icon: CreditCard,
    description: "Billing & subscription"
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    description: "Notification preferences"
  },
  {
    title: "Security",
    url: "/dashboard/security",
    icon: Shield,
    description: "Security settings"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "General settings"
  },
  {
    title: "Support",
    url: "/dashboard/support",
    icon: HelpCircle,
    description: "Help & support"
  }
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-emergency rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">ICE SOS</h2>
                <p className="text-xs text-muted-foreground">Member Portal</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-emergency rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Main Dashboard Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.url)}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{item.title}</span>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavCls(item.url)}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{item.title}</span>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
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