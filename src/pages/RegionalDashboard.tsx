import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalRole } from '@/hooks/useRegionalRole';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Phone, Settings } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

const RegionalDashboard = () => {
  const { data: regionalRole } = useRegionalRole();
  const { isAdmin } = useOptimizedAuth();

  // Check if user has regional access (including platform admins)
  const hasRegionalAccess = isAdmin || 
                           regionalRole?.isRegionalOperator || 
                           regionalRole?.isRegionalSupervisor || 
                           regionalRole?.isPlatformAdmin;

  // Show loading or access denied if not authorized
  if (!hasRegionalAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You don't have permission to access the regional call center.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Language Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Regional Call Center
              </h1>
              <p className="text-sm text-gray-600">
                Emergency control center dashboard - {regionalRole?.organizationName || 'Platform Admin'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageCurrencySelector compact />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Active Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Connected customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Open Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Pending events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    OPERATIONAL
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">All systems functioning</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active SOS Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active SOS events at this time</p>
                  <p className="text-sm text-gray-400 mt-2">
                    SOS events will appear here when activated
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending notifications</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Family notifications will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm">Organization</h4>
                  <p className="text-gray-600">{regionalRole?.organizationName || 'Not assigned'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Role</h4>
                  <Badge variant="outline">
                    {isAdmin ? 'Platform Admin' :
                     regionalRole?.isRegionalSupervisor ? 'Regional Supervisor' : 
                     regionalRole?.isRegionalOperator ? 'Regional Operator' : 
                     regionalRole?.isPlatformAdmin ? 'Platform Admin' :
                     'User'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegionalDashboard;