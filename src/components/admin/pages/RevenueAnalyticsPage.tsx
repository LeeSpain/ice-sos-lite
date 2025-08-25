import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, ShoppingCart, Calendar, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_interval: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscribed: boolean;
  created_at: string;
}

interface RevenueData {
  subscriptionRevenue: number;
  productRevenue: number;
  totalRevenue: number;
  subscriberCount: number;
  averageRevenuePerUser: number;
  pendantSales: number;
  planBreakdown: { [key: string]: { count: number; revenue: number; price: number } };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const RevenueAnalyticsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Fetch subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) {
        console.error('Error fetching subscription plans:', plansError);
        toast({
          title: "Error",
          description: "Failed to fetch subscription plans",
          variant: "destructive",
        });
        return;
      }

      // Fetch products (pendants)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Fetch subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*');

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
      }

      // Fetch completed orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      setSubscriptionPlans(plansData || []);
      setProducts(productsData || []);

      // Calculate revenue metrics
      const plans = plansData || [];
      const subscribers = subscribersData || [];
      const orders = ordersData || [];

      console.log('📊 Revenue Analytics Debug:', {
        plans: plans.length,
        subscribers: subscribers.length,
        orders: orders.length,
        planData: plans,
        subscriberData: subscribers
      });

      // Calculate subscription revenue and plan breakdown
      let subscriptionRevenue = 0;
      const planBreakdown: { [key: string]: { count: number; revenue: number; price: number } } = {};

      // Initialize all plans
      plans.forEach(plan => {
        planBreakdown[plan.name] = { count: 0, revenue: 0, price: plan.price };
      });

      subscribers.forEach(subscriber => {
        if (subscriber.subscribed && subscriber.subscription_tier) {
          // Find plan by exact name match first
          let plan = plans.find(p => p.name.toLowerCase() === subscriber.subscription_tier.toLowerCase());
          
          // If no direct match, try mapping common variations
          if (!plan) {
            const tierMappings: { [key: string]: string } = {
              'basic': 'Family Connection',
              'premium': 'Premium Protection', 
              'family': 'Family Connection',
              'pro': 'Premium Protection',
              'call center': 'Call Centre (Spain)',
              'call centre': 'Call Centre (Spain)',
              'personal': 'Personal Account',
              'guardian': 'Guardian Wellness',
              'wellness': 'Guardian Wellness',
              'sharing': 'Family Sharing'
            };
            
            const mappedName = tierMappings[subscriber.subscription_tier.toLowerCase()];
            if (mappedName) {
              plan = plans.find(p => p.name === mappedName);
            }
          }
          
          if (plan) {
            subscriptionRevenue += plan.price;
            planBreakdown[plan.name].count += 1;
            planBreakdown[plan.name].revenue += plan.price;
          } else {
            console.warn(`No matching plan found for tier: ${subscriber.subscription_tier}`);
          }
        }
      });

      // Calculate product revenue
      const productRevenue = orders.reduce((total, order) => total + order.total_price, 0);
      
      // Count pendant sales
      const pendantProduct = products.find(p => p.name.toLowerCase().includes('pendant'));
      const pendantSales = orders.filter(order => 
        pendantProduct && order.product_id === pendantProduct.id
      ).length;

      const totalRevenue = subscriptionRevenue + productRevenue;
      const subscriberCount = subscribers.filter(s => s.subscribed).length;
      const averageRevenuePerUser = subscriberCount > 0 ? totalRevenue / subscriberCount : 0;

      console.log('💰 Revenue Calculations:', {
        subscriptionRevenue,
        productRevenue,
        totalRevenue,
        subscriberCount,
        averageRevenuePerUser,
        pendantSales,
        planBreakdown
      });

      setRevenueData({
        subscriptionRevenue,
        productRevenue,
        totalRevenue,
        subscriberCount,
        averageRevenuePerUser,
        pendantSales,
        planBreakdown
      });

      // Generate monthly trend data (mock data for visualization)
      const monthlyTrend = [
        { month: 'Jan', subscription: subscriptionRevenue * 0.6, product: productRevenue * 0.4 },
        { month: 'Feb', subscription: subscriptionRevenue * 0.7, product: productRevenue * 0.5 },
        { month: 'Mar', subscription: subscriptionRevenue * 0.8, product: productRevenue * 0.7 },
        { month: 'Apr', subscription: subscriptionRevenue * 0.9, product: productRevenue * 0.8 },
        { month: 'May', subscription: subscriptionRevenue, product: productRevenue }
      ];

      setMonthlyData(monthlyTrend);

    } catch (error) {
      console.error('Error in fetchRevenueData:', error);
      toast({
        title: "Error",
        description: "Failed to fetch revenue data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">💰 Revenue Analytics</h1>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">💰 Revenue Analytics</h1>
          <p className="text-muted-foreground">No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 Revenue Analytics</h1>
          <p className="text-muted-foreground">Track your subscription and product revenue performance</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">€{revenueData.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">Subscription + Product Sales</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Subscription Revenue</p>
                <p className="text-3xl font-bold text-blue-900">€{revenueData.subscriptionRevenue.toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">Monthly recurring</p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Product Revenue</p>
                <p className="text-3xl font-bold text-purple-900">€{revenueData.productRevenue.toFixed(2)}</p>
                <p className="text-xs text-purple-600 mt-1">{revenueData.pendantSales} pendant sales</p>
              </div>
              <ShoppingCart className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Subscribers</p>
                <p className="text-3xl font-bold text-orange-900">{revenueData.subscriberCount}</p>
                <p className="text-xs text-orange-600 mt-1">ARPU: €{revenueData.averageRevenuePerUser.toFixed(2)}</p>
              </div>
              <Users className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Split between subscriptions and product sales</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Subscriptions', value: revenueData.subscriptionRevenue, color: '#0088FE' },
                        { name: 'Product Sales', value: revenueData.productRevenue, color: '#00C49F' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: €${Number(value).toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[{ color: '#0088FE' }, { color: '#00C49F' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan Performance</CardTitle>
                <CardDescription>Revenue by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(revenueData.planBreakdown).map(([name, data]) => ({
                    name,
                    revenue: data.revenue,
                    subscribers: data.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`€${Number(value).toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Subscribers']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Revenue by Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(revenueData.planBreakdown).map(([planName, data], index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={planName} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <div>
                          <p className="font-medium">{planName}</p>
                          <p className="text-sm text-muted-foreground">€{data.price.toFixed(2)}/month</p>
                          <p className="text-xs text-muted-foreground">{data.count} subscribers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">€{data.revenue.toFixed(2)}/month</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Total revenue</p>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(revenueData.planBreakdown).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No subscription data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="subscription" stroke="#8884d8" strokeWidth={2} name="Subscription" />
                  <Line type="monotone" dataKey="product" stroke="#82ca9d" strokeWidth={2} name="Product Sales" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Sales Details</CardTitle>
            <CardDescription>Individual product performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">€{product.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{revenueData.pendantSales} sold</Badge>
                    <p className="text-xs text-muted-foreground mt-1">€{(revenueData.pendantSales * product.price).toFixed(2)} revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueAnalyticsPage;