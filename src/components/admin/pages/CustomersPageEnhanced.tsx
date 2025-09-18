import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  Plus, 
  Eye, 
  Download,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useEnhancedCustomers } from '@/hooks/useEnhancedCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import CustomerDetailsModal from '@/components/admin/CustomerDetailsModal';
import AddCustomerModal from '@/components/admin/AddCustomerModal';
import { CustomerStatsCards } from '../CustomerStatsCards';
import { CustomerFilters } from '../CustomerFilters';
import { CustomerAnalytics } from '../CustomerAnalytics';
import { VirtualizedList } from '@/hooks/usePerformanceOptimizedComponents';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  country?: string;
  subscriber?: {
    created_at: string;
    email: string;
    id: string;
    stripe_customer_id: string;
    subscribed: boolean;
    subscription_end: string;
    subscription_tier: string;
    updated_at: string;
    user_id: string;
  };
}

export default function CustomersPageEnhanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    country: "",
    subscriptionStatus: "",
    registrationDate: "",
    orderStatus: ""
  });
  
  const { data: customers = [], isLoading, error, refetch } = useEnhancedCustomers();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    return customers.filter((customer: Customer) => {
      // Text search
      const searchFields = [
        customer.first_name,
        customer.last_name,
        customer.phone,
        customer.subscriber?.email,
        customer.country
      ].filter(Boolean);
      
      const searchString = searchFields.join(' ').toLowerCase();
      const matchesSearch = searchString.includes(debouncedSearchTerm.toLowerCase());
      
      // Filter conditions
      const matchesCountry = !filters.country || customer.country === filters.country;
      const customerStatus = customer.subscriber?.subscribed ? 'active' : 'inactive';
      const matchesSubscription = !filters.subscriptionStatus || customerStatus === filters.subscriptionStatus.toLowerCase();
      
      return matchesSearch && matchesCountry && matchesSubscription;
    });
  }, [customers, debouncedSearchTerm, filters]);

  // Calculate metrics for stats cards
  const customerMetrics = useMemo(() => {
    if (!customers) return { total: 0, newThisMonth: 0, activeSubscriptions: 0, totalRevenue: 0 };
    
    const total = customers.length;
    const newThisMonth = customers.filter((c: Customer) => {
      const createdAt = new Date(c.created_at);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;
    
    const activeSubscriptions = customers.filter((c: Customer) => 
      c.subscriber?.subscribed
    ).length;
    const totalRevenue = customers.reduce((sum, customer) => {
      const subscription = customer.subscriber;
      if (subscription?.subscribed && subscription.subscription_tier) {
        switch (subscription.subscription_tier) {
          case 'premium': return sum + 0.99;
          case 'call_centre': return sum + 4.99;
          default: return sum;
        }
      }
      return sum;
    }, 0);
    
    return { total, newThisMonth, activeSubscriptions, totalRevenue };
  }, [customers]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleExportData = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Country', 'Subscription', 'Revenue', 'Joined'].join(','),
      ...filteredCustomers.map(customer => [
        `"${customer.first_name || ''} ${customer.last_name || ''}"`,
        `"${customer.subscriber?.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.country || ''}"`,
        `"${customer.subscriber?.subscribed ? customer.subscriber.subscription_tier || 'Active' : 'Free'}"`,
        `"€29.99"`,
        `"${new Date(customer.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export completed",
      description: `${filteredCustomers.length} customers exported successfully.`
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <CustomerStatsCards 
          totalCustomers={0}
          newCustomersThisMonth={0}
          activeSubscriptions={0}
          totalRevenue={0}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive customer management with advanced analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <CustomerStatsCards 
        totalCustomers={customerMetrics.total}
        newCustomersThisMonth={customerMetrics.newThisMonth}
        activeSubscriptions={customerMetrics.activeSubscriptions}
        totalRevenue={customerMetrics.totalRevenue}
      />

      {/* Analytics Charts */}
      {customers && customers.length > 0 && (
        <CustomerAnalytics customers={customers} />
      )}

      {/* Advanced Filters */}
      <CustomerFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFiltersChange={setFilters}
      />

      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Customer Directory
              <Badge variant="secondary" className="ml-2">
                {filteredCustomers.length} of {customers?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Real-time data
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {customers?.length === 0 
                  ? "Get started by adding your first customer" 
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {customers?.length === 0 && (
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="border-t">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Contact Info</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Member Since</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              
              <VirtualizedList 
                items={filteredCustomers}
                itemHeight={80}
                containerHeight={500}
                renderItem={(customer: Customer, index: number) => (
                  <div key={customer.id} className="flex items-center justify-between px-6 py-5 border-b hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 group">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-lg border-2 border-primary/10">
                        {(customer.first_name?.[0] || customer.last_name?.[0] || customer.subscriber?.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Customer ID: {customer.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{customer.subscriber?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{customer.phone || 'No phone'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{customer.country || 'Unknown'}</span>
                    </div>
                    
                    <div className="min-w-[100px]">
                      <Badge 
                        variant={customer.subscriber?.subscribed ? 'default' : 'secondary'}
                        className={`${
                          customer.subscriber?.subscribed
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300'
                        } transition-colors`}
                      >
                        {customer.subscriber?.subscribed ? customer.subscriber.subscription_tier || 'Active' : 'Free'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground min-w-[100px]">
                      {new Date(customer.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    
                    <div className="min-w-[80px] text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                        className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all group-hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onUpdate={() => refetch()}
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={() => refetch()}
      />
    </div>
  );
}