import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, MapPin, Smartphone } from "lucide-react";

interface FamilyInviteModalProps {
  onInviteCreated: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FamilyInviteModal = ({ onInviteCreated, isOpen, onOpenChange }: FamilyInviteModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    billing_type: "owner" as "owner" | "self"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || (!formData.email && !formData.phone)) {
        throw new Error("Name and either email or phone are required");
      }

      const { data, error } = await supabase.functions.invoke('family-invite-management', {
        body: {
          action: 'create',
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          billing_type: formData.billing_type
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Family Invite Sent",
        description: `Invite sent to ${formData.name}. ${formData.billing_type === 'owner' ? 'You will be billed €2.99/month.' : 'They will be billed €2.99/month.'}`
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        billing_type: "owner"
      });

      onInviteCreated();
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating family invite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send family invite",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Invite Family Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border">
            <h4 className="font-medium mb-3 text-foreground">Family gets SOS alerts and a live map with a single "Received & On It."</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Location only during SOS. No continuous tracking.</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>No device/battery telemetry shared with family.</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span>Live alerts, map access, and acknowledgment tools.</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter family member's name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Who pays? (€2.99/month)</Label>
              <RadioGroup
                value={formData.billing_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, billing_type: value as "owner" | "self" }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="owner" id="owner" />
                  <Label htmlFor="owner" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>You pay (Owner-paid)</span>
                      <Badge variant="secondary">€2.99/month</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Seat is billed on your subscription
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>They pay (Invitee-paid)</span>
                      <Badge variant="outline">€2.99/month</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      They create their own subscription
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyInviteModal;