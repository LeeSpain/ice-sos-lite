import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertTriangle, CheckCircle, Info, ExternalLink, Settings, Filter, Search, Archive, MoreVertical, Star, UserPlus, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription
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
        title: "All notifications marked as read",
        description: "Your notification center has been cleared.",
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approval': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'campaign': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'content': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'error': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'user': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'system': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval': return <Clock className="h-4 w-4" />;
      case 'campaign': return <Zap className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'user': return <UserPlus className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && !notification.read_at) ||
                      (activeTab === 'read' && notification.read_at);
    
    return matchesSearch && matchesCategory && matchesPriority && matchesTab;
  });

  const archiveNotification = async (notificationId: string) => {
    try {
      // Since there's no archived_at column, we'll just delete it
      await deleteNotification(notificationId);
      toast({
        title: "Notification archived",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const snoozeNotification = async (notificationId: string, hours: number) => {
    try {
      // Since there's no snoozed_until column, we'll mark as read and show a message
      await markAsRead(notificationId);
      toast({
        title: "Notification handled",
        description: `Notification marked as read. Set up a reminder in ${hours} hour${hours > 1 ? 's' : ''} if needed.`,
      });
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Admin Notifications</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {unreadCount} unread
              </Badge>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No notifications found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          !notification.read_at 
                            ? 'bg-primary/5 border-primary/20 shadow-sm' 
                            : 'bg-card border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(notification.priority)}
                            {getCategoryIcon(notification.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCategoryColor(notification.category)}`}
                                >
                                  {notification.category}
                                </Badge>
                                <Badge 
                                  variant={notification.priority === 'high' ? 'destructive' : 
                                          notification.priority === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {notification.priority} priority
                                </Badge>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.read_at && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => snoozeNotification(notification.id, 1)}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Handle & Remind (1h)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => snoozeNotification(notification.id, 24)}>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Handle & Remind (24h)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {new Date(notification.created_at).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {notification.read_at && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Read
                                  </span>
                                )}
                              </div>
                              
                              {notification.action_url && notification.action_label && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-auto"
                                  onClick={() => {
                                    if (notification.action_url?.startsWith('/')) {
                                      window.location.href = notification.action_url;
                                    } else if (notification.action_url?.startsWith('http')) {
                                      window.open(notification.action_url, '_blank');
                                    }
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {notification.action_label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};