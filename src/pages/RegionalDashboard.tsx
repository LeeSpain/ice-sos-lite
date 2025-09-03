import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalRole } from '@/hooks/useRegionalRole';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Phone, Settings } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

const RegionalDashboard = () => {
  const { t } = useTranslation();
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
              {t('regionalDashboard.accessRestricted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {t('regionalDashboard.noPermission')}
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
                {t('regionalDashboard.title')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('regionalDashboard.subtitle')} - {regionalRole?.organizationName || t('regionalDashboard.platformAdmin')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector compact />
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
                    {t('regionalDashboard.activeCustomers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">{t('regionalDashboard.connectedCustomers')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {t('regionalDashboard.openAlerts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">{t('regionalDashboard.pendingEvents')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    {t('regionalDashboard.systemStatus')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {t('regionalDashboard.operational')}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{t('regionalDashboard.allSystemsFunctioning')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('regionalDashboard.activeSosEvents')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('regionalDashboard.noActiveSos')}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {t('regionalDashboard.sosEventsWillAppear')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel */}
            <Card>
              <CardHeader>
                <CardTitle>{t('regionalDashboard.notificationCenter')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('regionalDashboard.noPendingNotifications')}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {t('regionalDashboard.familyNotificationsWillAppear')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('regionalDashboard.systemInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm">{t('regionalDashboard.organization')}</h4>
                  <p className="text-gray-600">{regionalRole?.organizationName || t('regionalDashboard.notAssigned')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{t('regionalDashboard.role')}</h4>
                  <Badge variant="outline">
                    {isAdmin ? t('regionalDashboard.platformAdmin') :
                     regionalRole?.isRegionalSupervisor ? t('regionalDashboard.regionalSupervisor') : 
                     regionalRole?.isRegionalOperator ? t('regionalDashboard.regionalOperator') : 
                     regionalRole?.isPlatformAdmin ? t('regionalDashboard.platformAdmin') :
                     t('regionalDashboard.user')}
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