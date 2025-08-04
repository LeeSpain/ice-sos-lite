import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, CreditCard, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

interface Subscription {
  id: string;
  user_id?: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [searchTerm, tierFilter, statusFilter, subscriptions]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const { data: subscriptionsData, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading subscriptions:', error);
        return;
      }

      setSubscriptions(subscriptionsData || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchLower) ||
        sub.stripe_customer_id?.includes(searchTerm)
      );
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(sub => sub.subscription_tier === tierFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(sub => sub.subscribed);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(sub => !sub.subscribed);
      } else if (statusFilter === 'expired') {
        filtered = filtered.filter(sub => 
          sub.subscription_end && new Date(sub.subscription_end) < new Date()
        );
      }
    }

    setFilteredSubscriptions(filtered);
  };

  const getTierBadge = (tier?: string, subscribed?: boolean) => {
    if (!subscribed) {
      return <Badge variant="secondary">Free</Badge>;
    }
    
    switch (tier) {
      case 'Basic':
        return <Badge variant="secondary">Basic</Badge>;
      case 'Premium':
        return <Badge variant="default">Premium</Badge>;
      case 'Enterprise':
        return <Badge variant="destructive">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.subscribed) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (subscription.subscription_end) {
      const endDate = new Date(subscription.subscription_end);
      const now = new Date();
      
      if (endDate < now) {
        return <Badge variant="destructive">Expired</Badge>;
      } else if (endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return <Badge variant="outline">Expiring Soon</Badge>;
      }
    }
    
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const calculateRevenue = (tier?: string) => {
    switch (tier) {
      case 'Basic': return 7.99;
      case 'Premium': return 19.99;
      case 'Enterprise': return 49.99;
      default: return 0;
    }
  };

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.subscribed).length,
    basic: subscriptions.filter(s => s.subscription_tier === 'Basic' && s.subscribed).length,
    premium: subscriptions.filter(s => s.subscription_tier === 'Premium' && s.subscribed).length,
    enterprise: subscriptions.filter(s => s.subscription_tier === 'Enterprise' && s.subscribed).length,
    monthlyRevenue: subscriptions
      .filter(s => s.subscribed)
      .reduce((sum, s) => sum + calculateRevenue(s.subscription_tier), 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage all subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Subs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-xl font-bold">{stats.basic}</p>
                <p className="text-sm text-muted-foreground">Basic</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{stats.premium}</p>
                <p className="text-sm text-muted-foreground">Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xl font-bold">{stats.enterprise}</p>
                <p className="text-sm text-muted-foreground">Enterprise</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">€{stats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Monthly Revenue (EUR)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Subscription End</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.email}</div>
                        {subscription.stripe_customer_id && (
                          <div className="text-sm text-muted-foreground">
                            Customer: {subscription.stripe_customer_id.substring(0, 15)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(subscription)}
                    </TableCell>
                    <TableCell>
                      {getTierBadge(subscription.subscription_tier, subscription.subscribed)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        €{calculateRevenue(subscription.subscription_tier).toFixed(2)}/month
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.subscription_end ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(subscription.subscription_end).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}