
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
  History
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';

const adminMenuItems = [
  {
    title: "📊 Overview & Analytics",
    items: [
      { title: "Dashboard", url: "/admin-dashboard", icon: BarChart3 },
      { title: "Analytics", url: "/admin-dashboard/analytics", icon: BarChart3 },
      { title: "Video Analytics", url: "/admin-dashboard/video-analytics", icon: Video },
      { title: "Revenue Analytics", url: "/admin-dashboard/revenue", icon: DollarSign },
      { title: "User Growth", url: "/admin-dashboard/growth", icon: TrendingUp },
    ]
  },
  {
    title: "🤖 AI & Marketing Intelligence", 
    items: [
      { title: "Emma AI Agent", url: "/admin-dashboard/ai-agent", icon: Bot },
      { title: "Riven Marketing AI", url: "/admin-dashboard/riven-marketing", icon: Brain },
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
    title: "📧 Communication & Marketing",
    items: [
      { title: "Contact Submissions", url: "/admin-dashboard/contact-submissions", icon: Mail },
      { title: "Email Campaigns", url: "/admin-dashboard/email-campaigns", icon: Mail },
      { title: "Communication Center", url: "/admin-dashboard/communication", icon: MessageSquare },
      { title: "Social Media Integration", url: "/admin-dashboard/social-media", icon: MessageSquare },
      { title: "Content Automation", url: "/admin-dashboard/content-automation", icon: Bot },
    ]
  },
  {
    title: "🗺️ Live Map Management",
    items: [
      { title: "Live Map Monitor", url: "/admin-dashboard/live-map-monitor", icon: Map },
      { title: "Circle Analytics", url: "/admin-dashboard/circle-analytics", icon: Users },
      { title: "Geofence Management", url: "/admin-dashboard/geofence-admin", icon: Navigation },
      { title: "Location Data", url: "/admin-dashboard/location-admin", icon: History },
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
    title: "🛍️ Product & Services",
    items: [
      { title: "Products", url: "/admin-dashboard/products", icon: Package },
      { title: "Regional Services", url: "/admin-dashboard/regional-services", icon: MapPin },
      { title: "Subscription Plans", url: "/admin-dashboard/protection-plans", icon: Shield },
      { title: "Flic Control", url: "/admin-dashboard/flic-control", icon: Bluetooth },
    ]
  },
  {
    title: "⚙️ System",
    items: [
      { title: "User Activity", url: "/admin-dashboard/activity", icon: Activity },
      { title: "System Settings", url: "/admin-dashboard/settings", icon: Settings },
      { title: "Reports", url: "/admin-dashboard/reports", icon: FileText },
      { title: "App Testing", url: "/admin-dashboard/app-testing", icon: Smartphone },
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
                  ICE SOS Admin
                </h2>
                <p className="text-xs text-sidebar-foreground/60">Management Dashboard</p>
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
            <div className="ml-auto flex items-center gap-4">
              <AdminNotificationCenter />
              <LanguageCurrencySelector compact />
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

