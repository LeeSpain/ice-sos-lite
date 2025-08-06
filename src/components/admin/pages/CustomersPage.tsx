import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Mail, Phone, Calendar } from 'lucide-react';

interface Customer {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  country?: string;
  created_at: string;
  profile_completion_percentage?: number;
  subscription?: {
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Load profiles with subscription data (LEFT JOIN to include customers without subscriptions)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          subscribers(
            subscribed,
            subscription_tier,
            subscription_end,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading customers:', profilesError);
        return;
      }

      // Transform data to include subscription info and email
      const transformedCustomers = profilesData?.map(profile => ({
        ...profile,
        email: Array.isArray(profile.subscribers) && profile.subscribers.length > 0 
          ? profile.subscribers[0].email 
          : null,
        subscription: Array.isArray(profile.subscribers) && profile.subscribers.length > 0 
          ? profile.subscribers[0] 
          : { subscribed: false }
      })) || [];

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.first_name?.toLowerCase().includes(searchLower) ||
        customer.last_name?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.country?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCustomers(filtered);
  };

  const getSubscriptionBadge = (subscription: Customer['subscription']) => {
    if (!subscription?.subscribed) {
      return <Badge variant="secondary">Free</Badge>;
    }
    
    const tier = subscription.subscription_tier || 'Basic';
    const variant = tier === 'Premium' ? 'default' : tier === 'Enterprise' ? 'destructive' : 'secondary';
    
    return <Badge variant={variant}>{tier}</Badge>;
  };

  const getCompletionColor = (percentage?: number) => {
    if (!percentage) return 'text-red-500';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage and view all customer profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-medium">{filteredCustomers.length} customers</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.first_name || customer.last_name 
                            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                            : 'Unnamed User'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {customer.user_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.country || 'Not specified'}
                      </div>
                      {customer.date_of_birth && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(customer.date_of_birth).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(customer.subscription)}
                      {customer.subscription?.subscription_end && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Until: {new Date(customer.subscription.subscription_end).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${getCompletionColor(customer.profile_completion_percentage)}`}>
                        {customer.profile_completion_percentage || 0}% complete
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-3 w-3" />
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