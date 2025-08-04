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
  Database
} from 'lucide-react';

const adminMenuItems = [
  {
    title: "📊 Overview & Analytics",
    items: [
      { title: "Dashboard", url: "/admin-dashboard", icon: BarChart3 },
      { title: "Revenue Analytics", url: "/admin-dashboard/revenue", icon: DollarSign },
      { title: "User Growth", url: "/admin-dashboard/growth", icon: TrendingUp },
    ]
  },
  {
    title: "👥 Customer Management", 
    items: [
      { title: "All Customers", url: "/admin-dashboard/customers", icon: Users },
      { title: "Subscriptions", url: "/admin-dashboard/subscriptions", icon: Database },
      { title: "Family Accounts", url: "/admin-dashboard/families", icon: Heart },
    ]
  },
  {
    title: "💬 AI Chat & Leads",
    items: [
      { title: "Lead Management", url: "/admin-dashboard/leads", icon: MessageSquare },
      { title: "Conversations", url: "/admin-dashboard/conversations", icon: MessageSquare },
      { title: "AI Performance", url: "/admin-dashboard/ai-metrics", icon: BarChart3 },
    ]
  },
  {
    title: "🚨 Emergency & Safety",
    items: [
      { title: "Emergency Incidents", url: "/admin-dashboard/emergencies", icon: AlertTriangle },
      { title: "Safety Monitoring", url: "/admin-dashboard/safety", icon: Shield },
    ]
  },
  {
    title: "⚙️ System",
    items: [
      { title: "User Activity", url: "/admin-dashboard/activity", icon: Activity },
      { title: "System Settings", url: "/admin-dashboard/settings", icon: Settings },
      { title: "Reports", url: "/admin-dashboard/reports", icon: FileText },
    ]
  }
];

function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: typeof adminMenuItems[0]['items']) => 
    items.some(item => isActive(item.url));

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"}>
      <SidebarContent className="bg-gradient-to-b from-background to-muted/20">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ICE SOS Admin
                </h2>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
            )}
          </div>
        </div>
        
        {adminMenuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="px-3 py-2">
            <SidebarGroupLabel className={`${state === "collapsed" ? 'hidden' : 'block'} text-xs font-semibold text-muted-foreground/80 px-2 py-1 flex items-center gap-2`}>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                groupIndex === 0 ? 'from-blue-500 to-blue-600' :
                groupIndex === 1 ? 'from-green-500 to-green-600' :
                groupIndex === 2 ? 'from-purple-500 to-purple-600' :
                groupIndex === 3 ? 'from-red-500 to-red-600' :
                'from-orange-500 to-orange-600'
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
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]' 
                              : 'hover:bg-muted/60 hover:scale-[1.01] text-muted-foreground hover:text-foreground'
                          }`
                        }
                      >
                        <div className={`p-1.5 rounded-md ${
                          isActive(item.url) 
                            ? 'bg-white/20' 
                            : 'bg-muted/40 group-hover:bg-muted/60'
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
                  Admin Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">ICE SOS Lite Management Portal</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/5">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}