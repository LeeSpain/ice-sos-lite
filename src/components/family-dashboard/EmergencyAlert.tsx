import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, MapPin, Navigation, CheckCircle2, Phone } from "lucide-react";

interface EmergencyAlertProps {
  incidentId: string;
  memberName: string;
  location: string;
  situationSummary: string;
  incidentContactId?: string; // set if this family member is a contact on this incident
  onDismiss?: () => void;
}

const EmergencyAlert = ({
  incidentId,
  memberName,
  location,
  situationSummary,
  incidentContactId,
  onDismiss,
}: EmergencyAlertProps) => {
  const [responseStatus, setResponseStatus] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();

  const mapsUrl = location && location !== "Location unavailable"
    ? `https://maps.google.com/?q=${encodeURIComponent(location)}`
    : null;

  const handleResponse = async (status: "on_route" | "declined") => {
    if (!incidentContactId) return;
    setIsResponding(true);
    try {
      await supabase.functions.invoke("incident-update", {
        body: {
          incident_id: incidentId,
          incident_contact_id: incidentContactId,
          status,
        },
      });
      setResponseStatus(status);
      toast({
        title: status === "on_route" ? "Confirmed — On the way!" : "Response recorded",
        description: status === "on_route"
          ? `Clar will let ${memberName} know you're on your way.`
          : "We've noted you can't respond right now.",
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to send response.", variant: "destructive" });
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 px-4 pointer-events-none">
      <div className="w-full max-w-md bg-red-950 border border-red-500 rounded-2xl shadow-2xl p-5 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
          <div className="flex-1">
            <p className="font-bold text-white text-base">Emergency SOS Alert</p>
            <p className="text-red-300 text-sm">{memberName} needs help</p>
          </div>
          <Badge className="bg-red-600 text-white">LIVE</Badge>
        </div>

        {/* Situation */}
        {situationSummary && (
          <div className="bg-white/5 rounded-lg px-3 py-2 mb-3">
            <p className="text-white/80 text-sm">{situationSummary}</p>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-white/60" />
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline text-sm flex items-center gap-1"
            >
              View on Map
              <Navigation className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-white/50 text-sm">Location unavailable</span>
          )}
        </div>

        {/* Response buttons */}
        {!responseStatus && incidentContactId && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleResponse("on_route")}
              disabled={isResponding}
            >
              <Navigation className="h-4 w-4 mr-2" />
              I'm On My Way
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/10"
              onClick={() => handleResponse("declined")}
              disabled={isResponding}
            >
              Can't Help
            </Button>
          </div>
        )}

        {responseStatus === "on_route" && (
          <div className="flex items-center gap-2 text-green-300 text-sm bg-green-900/30 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Clar has notified {memberName} you're on the way.</span>
          </div>
        )}

        {responseStatus === "declined" && (
          <p className="text-white/50 text-sm text-center">Response recorded. Stay safe.</p>
        )}

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-3 w-full text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            Dismiss alert
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlert;
