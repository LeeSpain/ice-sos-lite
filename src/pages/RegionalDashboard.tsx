import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRegionalRole } from '@/hooks/useRegionalRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, MapPin, Phone, AlertTriangle, MessageSquare, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SOSEvent {
  id: string;
  client_id: string;
  triggered_at: string;
  lat: number;
  lng: number;
  emergency_type: string;
  status: 'open' | 'acknowledged' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  profiles?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

interface Client {
  user_id: string;
  subscription_regional: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface FamilyNotification {
  id: string;
  message: string;
  message_type: string;
  sent_at: string;
  delivered: boolean;
  language: string;
}

const QUICK_NOTIFICATIONS = {
  es: [
    "Hemos recibido la alerta SOS de {name} y estamos respondiendo ahora.",
    "Se ha enviado una ambulancia a la ubicación.",
    "{name} está seguro. No se requiere más acción.",
    "Estamos en contacto con {name}. Les mantendremos informados.",
    "La situación ha sido resuelta exitosamente."
  ],
  en: [
    "We've received {name}'s SOS alert and are responding now.",
    "An ambulance has been dispatched to the location.", 
    "{name} is safe. No further action needed.",
    "We are in contact with {name}. We will keep you informed.",
    "The situation has been resolved successfully."
  ]
};

const RegionalDashboard = () => {
  const { data: regionalRole } = useRegionalRole();
  const [selectedEvent, setSelectedEvent] = useState<SOSEvent | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const { toast } = useToast();

  const { data: clients } = useQuery({
    queryKey: ['regional-clients', regionalRole?.organizationId],
    queryFn: async () => {
      if (!regionalRole?.organizationId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, subscription_regional, first_name, last_name, phone')
        .eq('organization_id', regionalRole.organizationId)
        .eq('subscription_regional', true);

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!regionalRole?.organizationId
  });

  const { data: activeEvents } = useQuery({
    queryKey: ['active-sos-events', regionalRole?.organizationId],
    queryFn: async () => {
      if (!regionalRole?.organizationId) return [];

      const { data, error } = await supabase
        .from('regional_sos_events')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('organization_id', regionalRole.organizationId)
        .in('status', ['open', 'acknowledged'])
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      return data as SOSEvent[];
    },
    enabled: !!regionalRole?.organizationId,
    refetchInterval: 5000
  });

  const { data: notifications } = useQuery({
    queryKey: ['event-notifications', selectedEvent?.id],
    queryFn: async () => {
      if (!selectedEvent) return [];

      const { data, error } = await supabase
        .from('family_notifications')
        .select('*')
        .eq('event_id', selectedEvent.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as FamilyNotification[];
    },
    enabled: !!selectedEvent
  });

  useEffect(() => {
    if (!regionalRole?.organizationId) return;

    const channel = supabase
      .channel('regional-sos-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'regional_sos_events',
          filter: `organization_id=eq.${regionalRole.organizationId}`
        },
        (payload) => {
          const newEvent = payload.new as SOSEvent;
          
          if (Notification.permission === 'granted') {
            new Notification('Nueva Alerta SOS', {
              body: `Emergencia ${newEvent.emergency_type} - Prioridad ${newEvent.priority}`,
              icon: '/favicon.ico'
            });
          }

          toast({
            title: "Nueva Alerta SOS",
            description: `Emergencia ${newEvent.emergency_type} recibida`,
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regionalRole?.organizationId, toast]);

  const sendQuickNotification = async (message: string) => {
    if (!selectedEvent) return;

    const personalizedMessage = message.replace(
      '{name}', 
      selectedEvent.profiles?.first_name || 'el cliente'
    );

    try {
      const { error } = await supabase
        .from('family_notifications')
        .insert([{
          event_id: selectedEvent.id,
          client_id: selectedEvent.client_id,
          message: personalizedMessage,
          message_type: 'quick_action',
          language: selectedLanguage
        }]);

      if (error) throw error;

      toast({
        title: "Notificación Enviada",
        description: "La notificación ha sido enviada a la familia.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendCustomNote = async () => {
    if (!selectedEvent || !customNote.trim()) return;

    try {
      const { error } = await supabase
        .from('family_notifications')
        .insert([{
          event_id: selectedEvent.id,
          client_id: selectedEvent.client_id,
          message: customNote,
          message_type: 'custom_note',
          language: selectedLanguage
        }]);

      if (error) throw error;

      setCustomNote('');
      toast({
        title: "Nota Enviada",
        description: "La nota personalizada ha sido enviada a la familia.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const acknowledgeEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('regional_sos_events')
        .update({ status: 'acknowledged' })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Evento Reconocido",
        description: "El evento SOS ha sido reconocido.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!regionalRole?.isRegionalOperator && !regionalRole?.isRegionalSupervisor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="text-center p-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              No tienes permisos para acceder al panel regional.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 p-6 min-h-screen">
      {/* Left Panel - Clients */}
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Regionales
            </CardTitle>
            <CardDescription>
              {clients?.length || 0} clientes con suscripción regional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {clients?.map((client) => (
                  <div key={client.user_id} className="p-3 border rounded-lg">
                    <div className="font-medium">
                      {client.first_name} {client.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone || 'Sin teléfono'}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Eventos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {activeEvents?.map((event) => (
                  <div 
                    key={event.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEvent?.id === event.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={event.priority === 'critical' ? 'destructive' : 'secondary'}>
                        {event.priority}
                      </Badge>
                      <Badge variant={event.status === 'open' ? 'destructive' : 'default'}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="mt-2 font-medium">
                      {event.profiles?.first_name} {event.profiles?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.emergency_type}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.triggered_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Center Panel - Event Details */}
      <div className="col-span-6 space-y-4">
        {selectedEvent ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Evento SOS Activo</span>
                {selectedEvent.status === 'open' && (
                  <Button 
                    onClick={() => acknowledgeEvent(selectedEvent.id)}
                    variant="outline"
                  >
                    Reconocer
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {selectedEvent.emergency_type} - Prioridad {selectedEvent.priority}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <p>{selectedEvent.profiles?.first_name} {selectedEvent.profiles?.last_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedEvent.profiles?.phone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ubicación</h4>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedEvent.lat?.toFixed(6)}, {selectedEvent.lng?.toFixed(6)}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ver en Mapa
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="font-semibold mb-3">Notificaciones Rápidas</h4>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_NOTIFICATIONS[selectedLanguage as keyof typeof QUICK_NOTIFICATIONS].map((message, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3"
                      onClick={() => sendQuickNotification(message)}
                    >
                      {message.replace('{name}', selectedEvent.profiles?.first_name || 'el cliente')}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="font-semibold mb-3">Nota Personalizada</h4>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribir nota personalizada para la familia..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                    <Button 
                      onClick={sendCustomNote}
                      disabled={!customNote.trim()}
                      size="sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Nota
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Seleccionar Evento</h3>
              <p className="text-muted-foreground">
                Selecciona un evento SOS activo para ver los detalles y gestionar notificaciones.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Notifications History */}
      <div className="col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historial de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {notifications?.map((notification) => (
                  <div key={notification.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={notification.message_type === 'quick_action' ? 'default' : 'secondary'}>
                        {notification.message_type === 'quick_action' ? 'Rápida' : 'Personalizada'}
                      </Badge>
                      <Badge variant={notification.delivered ? 'default' : 'secondary'}>
                        {notification.delivered ? 'Entregada' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.sent_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              {notifications?.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sin notificaciones para este evento
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalDashboard;