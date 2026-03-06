import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronRight, Phone, MessageSquare, Bell } from "lucide-react";

interface IncidentContact {
  id: string;
  contact_name: string;
  contact_phone: string;
  response_status: string;
  notification_methods: string[];
  notified_at: string;
  responded_at: string | null;
}

interface TimelineEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface Incident {
  id: string;
  member_id: string;
  triggered_at: string;
  trigger_method: string;
  status: string;
  situation_summary: string | null;
  resolved_at: string | null;
  member_name?: string;
  contacts?: IncidentContact[];
  timeline?: TimelineEvent[];
}

const statusColors: Record<string, string> = {
  active: "bg-red-100 text-red-800",
  resolved: "bg-green-100 text-green-800",
  false_alarm: "bg-yellow-100 text-yellow-800",
};

const contactStatusColors: Record<string, string> = {
  notified: "bg-yellow-50 text-yellow-700",
  on_route: "bg-blue-50 text-blue-700",
  arrived: "bg-green-50 text-green-700",
  no_answer: "bg-gray-50 text-gray-600",
  declined: "bg-red-50 text-red-700",
};

const SOSIncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ active: 0, resolved: 0, false_alarms: 0, total: 0 });

  useEffect(() => {
    loadIncidents();

    const channel = supabase
      .channel("admin-sos-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "sos_incidents" }, loadIncidents)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const { data: incidentsData } = await supabase
        .from("sos_incidents")
        .select("*")
        .order("triggered_at", { ascending: false })
        .limit(100);

      if (!incidentsData) return;

      // Enrich with member names and contacts
      const enriched: Incident[] = await Promise.all(
        incidentsData.map(async (inc) => {
          const [profileRes, contactsRes, timelineRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("user_id", inc.member_id)
              .single(),
            supabase
              .from("incident_contacts")
              .select("*")
              .eq("incident_id", inc.id)
              .order("notified_at"),
            supabase
              .from("incident_timeline")
              .select("*")
              .eq("incident_id", inc.id)
              .order("created_at"),
          ]);

          const memberName = profileRes.data
            ? [profileRes.data.first_name, profileRes.data.last_name].filter(Boolean).join(" ")
            : "Unknown Member";

          return {
            ...inc,
            member_name: memberName,
            contacts: contactsRes.data || [],
            timeline: timelineRes.data || [],
          };
        })
      );

      setIncidents(enriched);
      setStats({
        active: enriched.filter((i) => i.status === "active").length,
        resolved: enriched.filter((i) => i.status === "resolved").length,
        false_alarms: enriched.filter((i) => i.status === "false_alarm").length,
        total: enriched.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });

  const eventLabel = (type: string) => {
    const labels: Record<string, string> = {
      sos_triggered: "SOS Triggered",
      clar_called_member: "Clar Called Member",
      clar_connected: "Clar Connected",
      false_alarm: "False Alarm Confirmed",
      escalated: "Escalated to Contacts",
      contact_called: "Contact Called",
      contact_confirmed_route: "Contact On Route",
      contact_arrived: "Contact Arrived",
      resolved: "Incident Resolved",
      member_speech: "Member Speaking",
      clar_call_failed: "Clar Call Failed",
    };
    return labels[type] || type.replace(/_/g, " ");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SOS Incidents</h1>
        <p className="text-muted-foreground">Live and historical emergency activations handled by Clar AI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active", value: stats.active, color: "text-red-600", icon: AlertTriangle },
          { label: "Resolved", value: stats.resolved, color: "text-green-600", icon: CheckCircle2 },
          { label: "False Alarms", value: stats.false_alarms, color: "text-yellow-600", icon: Clock },
          { label: "Total", value: stats.total, color: "text-blue-600", icon: Bell },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incidents list */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No SOS incidents yet.
            </CardContent>
          </Card>
        )}

        {incidents.map((incident) => (
          <Card key={incident.id} className={incident.status === "active" ? "border-red-400 shadow-red-100" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-semibold">{incident.member_name}</CardTitle>
                  <Badge className={statusColors[incident.status] || "bg-gray-100 text-gray-700"}>
                    {incident.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {incident.trigger_method === "pendant" ? "Pendant" : "App Button"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatTime(incident.triggered_at)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                  >
                    {expandedId === incident.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {incident.situation_summary && (
                <p className="text-sm text-muted-foreground mt-1">{incident.situation_summary}</p>
              )}
            </CardHeader>

            {expandedId === incident.id && (
              <CardContent className="pt-0 space-y-4">
                {/* Contacts */}
                {incident.contacts && incident.contacts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Emergency Contacts</p>
                    <div className="space-y-2">
                      {incident.contacts.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.contact_name}</span>
                            <span className="text-muted-foreground">{c.contact_phone}</span>
                            <div className="flex gap-1">
                              {c.notification_methods.includes("call") && <Phone className="h-3 w-3 text-muted-foreground" />}
                              {c.notification_methods.includes("whatsapp") && <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                              {c.notification_methods.includes("push") && <Bell className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          </div>
                          <Badge className={contactStatusColors[c.response_status] || "bg-gray-50 text-gray-600"}>
                            {c.response_status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {incident.timeline && incident.timeline.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Timeline</p>
                    <div className="relative pl-4 space-y-2 border-l border-muted">
                      {incident.timeline.map((event) => (
                        <div key={event.id} className="relative">
                          <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-muted-foreground/40" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{eventLabel(event.event_type)}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(event.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SOSIncidentsPage;
