import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Euro, Users, Calendar, BarChart3 } from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  totalSubscribers: number;
  churnRate: number;
  growthRate: number;
}

export default function RevenueAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    averageRevenuePerUser: 0,
    totalSubscribers: 0,
    churnRate: 0,
    growthRate: 15.2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Load subscription data
      const { data: subscribersData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('subscribed', true);

      if (subscribersData) {
        // Count subscribers by tier - default to 'Basic' if no tier specified
        const basicCount = subscribersData.filter(s => (s.subscription_tier || 'Basic') === 'Basic').length;
        const premiumCount = subscribersData.filter(s => s.subscription_tier === 'Premium').length;
        const enterpriseCount = subscribersData.filter(s => s.subscription_tier === 'Enterprise').length;
        
        // Calculate revenue in euros
        const monthlyRevenue = (basicCount * 7.99) + (premiumCount * 19.99) + (enterpriseCount * 49.99);
        const yearlyRevenue = monthlyRevenue * 12;
        const averageRevenuePerUser = subscribersData.length > 0 ? monthlyRevenue / subscribersData.length : 0;
        
        setRevenueData({
          totalRevenue: yearlyRevenue,
          monthlyRevenue,
          yearlyRevenue,
          averageRevenuePerUser,
          totalSubscribers: subscribersData.length,
          churnRate: 3.2, // Mock data
          growthRate: 15.2 // Mock data
        });
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 Revenue Analytics</h1>
          <p className="text-muted-foreground">Financial performance and revenue insights</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-900">€{revenueData.monthlyRevenue.toFixed(0)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{revenueData.growthRate}% vs last month</span>
                </div>
              </div>
              <Euro className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Yearly Revenue</p>
                <p className="text-3xl font-bold text-blue-900">€{revenueData.yearlyRevenue.toFixed(0)}</p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">Projected</span>
                </div>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">ARPU</p>
                <p className="text-3xl font-bold text-purple-900">€{revenueData.averageRevenuePerUser.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600">Per user/month</span>
                </div>
              </div>
              <Users className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Churn Rate</p>
                <p className="text-3xl font-bold text-orange-900">{revenueData.churnRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">Monthly churn</span>
                </div>
              </div>
              <TrendingDown className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">Basic Plan</p>
                    <p className="text-sm text-muted-foreground">€7.99/month</p>
                  </div>
                </div>
                <Badge variant="secondary">€7.99/user</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Premium Plan</p>
                    <p className="text-sm text-muted-foreground">€19.99/month</p>
                  </div>
                </div>
                <Badge variant="secondary">€19.99/user</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <div>
                    <p className="font-medium">Enterprise Plan</p>
                    <p className="text-sm text-muted-foreground">€49.99/month</p>
                  </div>
                </div>
                <Badge variant="secondary">€49.99/user</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <span className="text-sm text-green-600">+{revenueData.growthRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                    style={{ width: `${revenueData.growthRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Customer Retention</span>
                  <span className="text-sm text-blue-600">96.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-[96.8%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Revenue Target</span>
                  <span className="text-sm text-purple-600">78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-[78%]"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Strong Growth</h3>
              <p className="text-sm text-green-700">Revenue growing at {revenueData.growthRate}% monthly</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-blue-50 border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Low Churn</h3>
              <p className="text-sm text-blue-700">Only {revenueData.churnRate}% monthly churn rate</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-purple-50 border border-purple-200">
              <Euro className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">High ARPU</h3>
              <p className="text-sm text-purple-700">€{revenueData.averageRevenuePerUser.toFixed(2)} average revenue per user</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}