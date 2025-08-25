import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Mail, Phone, Calendar, Plus, Eye, Trash2, Download, RefreshCw } from 'lucide-react';
import CustomerDetailsModal from '@/components/admin/CustomerDetailsModal';
import AddCustomerModal from '@/components/admin/AddCustomerModal';
import { useCustomers } from '@/hooks/useOptimizedData';
import { useDebounce } from '@/hooks/useDebounce';
import { VirtualizedList, OptimizedTableRow } from '@/hooks/usePerformanceOptimizedComponents';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface Customer {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  country?: string;
  subscriber?: {
    subscribed: boolean;
    subscription_tier?: string;
    subscription_end?: string;
  };
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Performance monitoring
  usePerformanceMonitoring();

  // Use optimized data fetching
  const { data: customers = [], isLoading, error, refetch } = useCustomers();

  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered customers for performance
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm) return customers;
    
    return customers.filter(customer => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        customer.first_name?.toLowerCase().includes(searchLower) ||
        customer.last_name?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.country?.toLowerCase().includes(searchLower)
      );
    });
  }, [customers, debouncedSearchTerm]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const handleExportData = () => {
    const csv = [
      ['Name', 'Phone', 'Country', 'Subscription', 'Joined'].join(','),
      ...filteredCustomers.map(customer => [
        `"${customer.first_name || ''} ${customer.last_name || ''}"`,
        `"${customer.phone || ''}"`,
        `"${customer.country || ''}"`,
        `"${customer.subscriber?.subscribed ? customer.subscriber.subscription_tier || 'Basic' : 'Free'}"`,
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
  };

  if (isLoading) {
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">{filteredCustomers.length} customers</span>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 100 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <VirtualizedList
                        items={filteredCustomers}
                        itemHeight={65}
                        containerHeight={500}
                        renderItem={(customer: any, index: number) => (
                          <div key={customer.id} className="flex items-center p-4 border-b hover:bg-muted/50">
                            <div className="flex-1 grid grid-cols-6 gap-4">
                              <div className="font-medium">
                                {customer.first_name || customer.last_name 
                                  ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                                  : 'Unnamed User'
                                }
                              </div>
                              <div>
                                {customer.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone}
                                  </div>
                                )}
                              </div>
                              <div>{customer.country || 'Not specified'}</div>
                              <div>
                                <Badge variant={customer.subscriber?.subscribed ? "default" : "secondary"}>
                                  {customer.subscriber?.subscribed ? customer.subscriber.subscription_tier || 'Active' : 'Free'}
                                </Badge>
                              </div>
                              <div>{new Date(customer.created_at).toLocaleDateString()}</div>
                              <div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">
                          {customer.first_name || customer.last_name 
                            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                            : 'Unnamed User'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{customer.country || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={customer.subscriber?.subscribed ? "default" : "secondary"}>
                          {customer.subscriber?.subscribed ? customer.subscriber.subscription_tier || 'Active' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
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