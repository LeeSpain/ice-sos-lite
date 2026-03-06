import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, PhoneCall, MessageSquare, Clock, X } from "lucide-react";

interface IncidentContact {
  id: string;
  contact_name: string;
  response_status: "notified" | "no_answer" | "on_route" | "arrived" | "declined";
  notification_methods: string[];
  responded_at: string | null;
}

interface ActiveIncidentTrackerProps {
  incidentId: string;
  memberName: string;
  onResolved?: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  notified: { label: "Notified", color: "bg-yellow-100 text-yellow-800" },
  no_answer: { label: "No Answer", color: "bg-gray-100 text-gray-700" },
  on_route: { label: "On the Way", color: "bg-blue-100 text-blue-800" },
  arrived: { label: "Arrived", color: "bg-green-100 text-green-800" },
  declined: { label: "Unavailable", color: "bg-red-100 text-red-700" },
};

const ActiveIncidentTracker = ({ incidentId, memberName, onResolved }: ActiveIncidentTrackerProps) => {
  const [contacts, setContacts] = useState<IncidentContact[]>([]);
  const [incidentStatus, setIncidentStatus] = useState<string>("active");
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();

    // Subscribe to real-time updates on this incident's contacts
    const channel = supabase
      .channel(`incident-${incidentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "incident_contacts",
          filter: `incident_id=eq.${incidentId}`,
        },
        () => loadContacts()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sos_incidents",
          filter: `id=eq.${incidentId}`,
        },
        (payload) => {
          setIncidentStatus(payload.new.status);
          if (payload.new.status !== "active") {
            onResolved?.();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incidentId, onResolved]);

  const loadContacts = async () => {
    const { data } = await supabase
      .from("incident_contacts")
      .select("id, contact_name, response_status, notification_methods, responded_at")
      .eq("incident_id", incidentId)
      .order("responded_at", { ascending: true });

    if (data) setContacts(data as IncidentContact[]);
  };

  const handleResolve = async () => {
    setIsClosing(true);
    try {
      await supabase.functions.invoke("incident-update", {
        body: { incident_id: incidentId, status: "resolved" },
      });
      toast({ title: "Incident closed", description: "You're marked as safe. Stay well!" });
      onResolved?.();
    } catch (err) {
      toast({ title: "Error", description: "Failed to close incident.", variant: "destructive" });
    } finally {
      setIsClosing(false);
    }
  };

  const onRouteCount = contacts.filter((c) => c.response_status === "on_route" || c.response_status === "arrived").length;

  return (
    <div className="bg-red-950/80 backdrop-blur-sm border border-red-500/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
          <span className="font-bold text-sm">ACTIVE EMERGENCY</span>
        </div>
        <Badge className="bg-red-600 text-white text-xs">
          {incidentStatus.toUpperCase()}
        </Badge>
      </div>

      <div className="text-white/80 text-sm">
        Clar is coordinating help for <span className="font-semibold text-white">{memberName}</span>.{" "}
        {onRouteCount > 0 ? (
          <span className="text-green-300">{onRouteCount} contact{onRouteCount > 1 ? "s" : ""} on the way.</span>
        ) : (
          <span>Waiting for contacts to respond...</span>
        )}
      </div>

      {/* Contact response status */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const cfg = statusConfig[contact.response_status] || statusConfig.notified;
            return (
              <div key={contact.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  {contact.response_status === "on_route" || contact.response_status === "arrived" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : contact.response_status === "no_answer" ? (
                    <PhoneCall className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400" />
                  )}
                  <span className="text-white text-sm font-medium">{contact.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {contact.notification_methods.includes("call") && (
                      <PhoneCall className="h-3 w-3 text-white/40" />
                    )}
                    {contact.notification_methods.includes("whatsapp") && (
                      <MessageSquare className="h-3 w-3 text-white/40" />
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contacts.length === 0 && (
        <div className="text-white/50 text-xs text-center py-2">
          Contacting your emergency contacts...
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full border-green-500/50 text-green-300 hover:bg-green-500/20 hover:text-green-200"
        onClick={handleResolve}
        disabled={isClosing}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {isClosing ? "Closing..." : "I'm Safe — Close Incident"}
      </Button>
    </div>
  );
};

export default ActiveIncidentTracker;
