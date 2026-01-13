import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Clock, AlertTriangle, CheckCircle, Info, ExternalLink, Settings, Filter, Search, Zap, FileText, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  read_at: string | null;
  action_url: string | null;
  action_label: string | null;
  metadata: any;
  created_at: string;
}

export const AdminNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    
    const channel = supabase
      .channel('admin_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_notifications' },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw error;
      await loadNotifications();
      toast({
        title: "All marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "h-3.5 w-3.5";
    switch (category) {
      case 'approval': return <Clock className={iconClass} />;
      case 'campaign': return <Zap className={iconClass} />;
      case 'content': return <FileText className={iconClass} />;
      case 'error': return <AlertTriangle className={iconClass} />;
      case 'user': return <UserPlus className={iconClass} />;
      case 'system': return <Settings className={iconClass} />;
      default: return <Info className={iconClass} />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'approval': return 'bg-amber-500/10 text-amber-600';
      case 'campaign': return 'bg-blue-500/10 text-blue-600';
      case 'content': return 'bg-emerald-500/10 text-emerald-600';
      case 'error': return 'bg-red-500/10 text-red-600';
      case 'user': return 'bg-violet-500/10 text-violet-600';
      case 'system': return 'bg-slate-500/10 text-slate-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.read_at) ||
                      (activeTab === 'read' && notification.read_at);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleNotificationAction = (notification: AdminNotification) => {
    if (!notification.action_url) return;
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.action_url.startsWith('/')) {
      navigate(notification.action_url);
    } else if (notification.action_url.startsWith('http')) {
      window.open(notification.action_url, '_blank');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs & Filters */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-2 border-b space-y-2">
            <TabsList className="h-7 w-full grid grid-cols-3 bg-muted/50">
              <TabsTrigger value="all" className="h-6 text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="h-6 text-xs">Unread</TabsTrigger>
              <TabsTrigger value="read" className="h-6 text-xs">Read</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 pl-7 text-xs bg-muted/30"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-7 w-[90px] text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="approval" className="text-xs">Approval</SelectItem>
                  <SelectItem value="campaign" className="text-xs">Campaign</SelectItem>
                  <SelectItem value="content" className="text-xs">Content</SelectItem>
                  <SelectItem value="error" className="text-xs">Error</SelectItem>
                  <SelectItem value="user" className="text-xs">User</SelectItem>
                  <SelectItem value="system" className="text-xs">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[320px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                  <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-2 hover:bg-muted/40 transition-colors cursor-pointer group ${
                        !notification.read_at ? 'bg-primary/[0.03]' : ''
                      }`}
                      onClick={() => notification.action_url && handleNotificationAction(notification)}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Category Icon */}
                        <div className={`p-1.5 rounded-md shrink-0 ${getCategoryStyle(notification.category)}`}>
                          {getCategoryIcon(notification.category)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-xs font-medium truncate ${!notification.read_at ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </span>
                            {notification.priority === 'high' && (
                              <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-tight">
                            {notification.message}
                          </p>
                          {notification.action_url && (
                            <span className="text-[10px] text-primary/70 flex items-center gap-0.5 mt-1">
                              <ExternalLink className="h-2.5 w-2.5" />
                              {notification.action_label || 'View details'}
                            </span>
                          )}
                        </div>
                        
                        {/* Time & Actions */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Unread dot */}
                        {!notification.read_at && (
                          <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminNotificationCenter;
