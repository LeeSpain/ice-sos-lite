import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Users, Shield, GripVertical, Crown, AlertTriangle } from 'lucide-react';
import { useConnections, useSpainRule } from '@/hooks/useConnections';
import { ConnectionInviteModal } from './ConnectionInviteModal';
import { ConnectionCard } from './ConnectionCard';
import { SpainRuleBanner } from './SpainRuleBanner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export const ConnectionsPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<'family_circle' | 'trusted_contact'>('family_circle');
  
  const { data: familyConnections = [], isLoading: loadingFamily } = useConnections('family_circle');
  const { data: trustedConnections = [], isLoading: loadingTrusted } = useConnections('trusted_contact');
  const { data: spainRule } = useSpainRule();

  const activeConnections = [...familyConnections, ...trustedConnections].filter(c => c.status === 'active');

  const handleInvite = (type: 'family_circle' | 'trusted_contact') => {
    setInviteType(type);
    setShowInviteModal(true);
  };

  const handleDragEnd = (result: any) => {
    // TODO: Implement drag and drop reordering
    console.log('Drag end:', result);
  };

  if (loadingFamily || loadingTrusted) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Spain Rule Banner */}
      <SpainRuleBanner spainRule={spainRule} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Emergency Connections</h1>
          <p className="text-muted-foreground mt-2">
            Manage your family circle and trusted contacts for emergency situations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {activeConnections.length} Active Connections
          </Badge>
        </div>
      </div>

      {/* Connection Types Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Family Circle</CardTitle>
            </div>
            <CardDescription>
              Full access to your dashboard, history, and real-time updates. Always receives notifications.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-secondary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <CardTitle className="text-lg">Trusted Contacts</CardTitle>
            </div>
            <CardDescription>
              Receive notifications and live incident view only during active emergencies. No history access.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Connections Tabs */}
      <Tabs defaultValue="family" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family Circle ({familyConnections.length})
          </TabsTrigger>
          <TabsTrigger value="trusted" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Trusted Contacts ({trustedConnections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="family" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Family Circle Members</h3>
            <Button onClick={() => handleInvite('family_circle')}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Family Member
            </Button>
          </div>

          {familyConnections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No family members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invite family members to give them full access to your safety dashboard
                </p>
                <Button onClick={() => handleInvite('family_circle')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Your First Family Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="family-connections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {familyConnections.map((connection, index) => (
                      <Draggable key={connection.id} draggableId={connection.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ConnectionCard connection={connection} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </TabsContent>

        <TabsContent value="trusted" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trusted Contacts</h3>
            <Button variant="secondary" onClick={() => handleInvite('trusted_contact')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trusted Contact
            </Button>
          </div>

          {trustedConnections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trusted contacts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add trusted contacts who should be notified during emergencies
                </p>
                <Button variant="secondary" onClick={() => handleInvite('trusted_contact')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Trusted Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="trusted-connections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {trustedConnections.map((connection, index) => (
                      <Draggable key={connection.id} draggableId={connection.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ConnectionCard connection={connection} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <ConnectionInviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        type={inviteType}
      />
    </div>
  );
};