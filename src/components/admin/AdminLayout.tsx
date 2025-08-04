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
    title: "Overview & Analytics",
    items: [
      { title: "Dashboard", url: "/admin-dashboard", icon: BarChart3 },
      { title: "Revenue Analytics", url: "/admin-dashboard/revenue", icon: DollarSign },
      { title: "User Growth", url: "/admin-dashboard/growth", icon: TrendingUp },
    ]
  },
  {
    title: "Customer Management", 
    items: [
      { title: "All Customers", url: "/admin-dashboard/customers", icon: Users },
      { title: "Subscriptions", url: "/admin-dashboard/subscriptions", icon: Database },
      { title: "Family Accounts", url: "/admin-dashboard/families", icon: Heart },
    ]
  },
  {
    title: "AI Chat & Leads",
    items: [
      { title: "Lead Management", url: "/admin-dashboard/leads", icon: MessageSquare },
      { title: "Conversations", url: "/admin-dashboard/conversations", icon: MessageSquare },
      { title: "AI Performance", url: "/admin-dashboard/ai-metrics", icon: BarChart3 },
    ]
  },
  {
    title: "Emergency & Safety",
    items: [
      { title: "Emergency Incidents", url: "/admin-dashboard/emergencies", icon: AlertTriangle },
      { title: "Safety Monitoring", url: "/admin-dashboard/safety", icon: Shield },
    ]
  },
  {
    title: "System",
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
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-lg ${state === "collapsed" ? 'hidden' : 'block'}`}>
            ICE SOS Admin
          </h2>
        </div>
        
        {adminMenuItems.map((group) => (
          <SidebarGroup
            key={group.title}
          >
            <SidebarGroupLabel className={state === "collapsed" ? 'hidden' : 'block'}>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          `flex items-center gap-2 ${isActive ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'}`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
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
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">Admin Dashboard</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}