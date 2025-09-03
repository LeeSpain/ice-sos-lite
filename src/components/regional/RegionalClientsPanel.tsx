import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Clock, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegionalClientsPanelProps {
  organizationId?: string;
  selectedClient: any;
  onClientSelect: (client: any) => void;
}

export const RegionalClientsPanel: React.FC<RegionalClientsPanelProps> = ({
  organizationId,
  selectedClient,
  onClientSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['regional-clients', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          regional_sos_events (
            id,
            status,
            priority,
            triggered_at,
            emergency_type
          )
        `)
        .eq('organization_id', organizationId)
        .eq('subscription_regional', true)
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
    refetchInterval: 30000,
  });

  const filteredClients = clients.filter(client => {
    const name = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const phone = client.phone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  const getClientStatus = (client: any) => {
    const activeEvents = client.regional_sos_events?.filter((e: any) => e.status === 'open') || [];
    if (activeEvents.length > 0) {
      const highestPriority = activeEvents.reduce((max: any, event: any) => {
        const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorities[event.priority] > priorities[max.priority] ? event : max;
      });
      return { status: 'emergency', event: highestPriority };
    }
    return { status: 'normal' };
  };

  const getStatusBadge = (client: any) => {
    const { status, event } = getClientStatus(client);
    
    if (status === 'emergency') {
      const colorMap = {
        critical: 'bg-red-600 text-white',
        high: 'bg-orange-500 text-white',
        medium: 'bg-yellow-500 text-black',
        low: 'bg-blue-500 text-white'
      };
      return (
        <Badge className={colorMap[event.priority as keyof typeof colorMap] || 'bg-red-600 text-white'}>
          {event.priority.toUpperCase()} SOS
        </Badge>
      );
    }
    
    return <Badge variant="secondary">Normal</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Regional Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Regional Clients</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        {filteredClients.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No clients found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.user_id === client.user_id;
              const { status } = getClientStatus(client);
              
              return (
                <div
                  key={client.user_id}
                  onClick={() => onClientSelect(client)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-l-4 ${
                    isSelected 
                      ? 'bg-muted border-l-primary' 
                      : status === 'emergency'
                      ? 'border-l-red-500'
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(client.first_name?.charAt(0) || '') + (client.last_name?.charAt(0) || '')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm truncate">
                          {client.first_name} {client.last_name}
                        </p>
                        {getStatusBadge(client)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {client.phone || 'No phone'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.country_code || 'ES'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {client.preferred_language?.toUpperCase() || 'ES'}
                        </span>
                      </div>
                      
                      {status === 'emergency' && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          Active Emergency
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};