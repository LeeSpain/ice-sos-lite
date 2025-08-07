import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

interface EmergencyContactsCardProps {
  profile: any;
  onProfileUpdate: () => void;
}

const EmergencyContactsCard = ({ profile, onProfileUpdate }: EmergencyContactsCardProps) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.emergency_contacts) {
      setContacts(Array.isArray(profile.emergency_contacts) ? profile.emergency_contacts : []);
    }
  }, [profile]);

  const updateContacts = async (newContacts: EmergencyContact[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ emergency_contacts: newContacts as any })
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(newContacts);
      onProfileUpdate();
      toast({
        title: "Success",
        description: "Emergency contacts updated successfully."
      });
    } catch (error) {
      console.error('Error updating contacts:', error);
      toast({
        title: "Error",
        description: "Failed to update emergency contacts.",
        variant: "destructive"
      });
    }
  };

  const addContact = () => {
    if (contacts.length < 5) {
      const newContacts = [...contacts, { name: "", phone: "", email: "", relationship: "" }];
      updateContacts(newContacts);
    }
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    updateContacts(newContacts);
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = contacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    setContacts(newContacts);
  };

  const saveContacts = () => {
    updateContacts(contacts);
    setIsEditing(false);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Emergency Contacts
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.length === 0 && !isEditing ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No emergency contacts added yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          ) : (
            <>
              {contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Contact {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={contact.relationship}
                          onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                          className="px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                      </div>
                      <Badge variant="secondary">{contact.relationship}</Badge>
                    </div>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="flex gap-2">
                  {contacts.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addContact}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={saveContacts}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsCard;