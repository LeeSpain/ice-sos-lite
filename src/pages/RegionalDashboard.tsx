import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalRole } from '@/hooks/useRegionalRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Phone } from 'lucide-react';

const RegionalDashboard = () => {
  const { data: regionalRole } = useRegionalRole();

  // Show loading or access denied if not authorized
  if (!regionalRole?.isRegionalOperator && !regionalRole?.isRegionalSupervisor && !regionalRole?.isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Acceso Restringido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No tienes permisos para acceder al centro de llamadas regional.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Phone className="h-8 w-8 text-blue-600" />
            Centro de Llamadas Regional
          </h1>
          <p className="text-gray-600 mt-2">
            Panel de control para operadores del centro de emergencias - {regionalRole?.organizationName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Clientes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-gray-600">Clientes conectados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Alertas Abiertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-gray-600">Eventos pendientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  OPERATIVO
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Todos los sistemas funcionando</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Eventos SOS Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay eventos SOS activos en este momento</p>
                <p className="text-sm text-gray-400 mt-2">
                  Los eventos SOS aparecerán aquí cuando se activen
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Side Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Centro de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No hay notificaciones pendientes</p>
                <p className="text-sm text-gray-400 mt-2">
                  Las notificaciones de familia aparecerán aquí
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm">Organización</h4>
                <p className="text-gray-600">{regionalRole?.organizationName || 'No asignada'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Rol</h4>
                <Badge variant="outline">
                  {regionalRole?.isRegionalSupervisor ? 'Supervisor Regional' : 
                   regionalRole?.isRegionalOperator ? 'Operador Regional' : 
                   'Admin de Plataforma'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalDashboard;