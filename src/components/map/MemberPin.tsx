import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Battery, Clock, User } from "lucide-react";

interface Presence {
  user_id: string;
  lat: number;
  lng: number;
  last_seen?: string;
  battery?: number | null;
  is_paused?: boolean;
}

interface MemberPinProps {
  presence: Presence;
  onClick?: () => void;
}

export function MemberPin({ presence, onClick }: MemberPinProps) {
  const status = React.useMemo(() => {
    if (presence.is_paused) return "paused";
    if (!presence.last_seen) return "offline";
    const diff = Date.now() - new Date(presence.last_seen).getTime();
    if (diff < 2 * 60 * 1000) return "live";
    if (diff < 60 * 60 * 1000) return "idle";
    return "offline";
  }, [presence.last_seen, presence.is_paused]);

  const statusConfig = {
    live: {
      color: "bg-emerald-500",
      ring: "ring-emerald-500",
      icon: Wifi,
      pulse: true
    },
    idle: {
      color: "bg-amber-500", 
      ring: "ring-amber-500",
      icon: Clock,
      pulse: false
    },
    offline: {
      color: "bg-slate-400",
      ring: "ring-slate-400", 
      icon: WifiOff,
      pulse: false
    },
    paused: {
      color: "bg-slate-500",
      ring: "ring-slate-500",
      icon: User,
      pulse: false
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={`
        relative p-0 h-12 w-12 rounded-full shadow-lg border-2 border-background
        ${config.color} hover:scale-110 transition-all duration-200
        ${config.pulse ? 'animate-pulse' : ''}
      `}
    >
      {/* Status Ring */}
      <div className={`absolute inset-0 rounded-full ring-4 ${config.ring} ring-opacity-30`} />
      
      {/* Main Icon */}
      <Icon className="w-5 h-5 text-white" />
      
      {/* Battery Indicator */}
      {presence.battery !== null && presence.battery !== undefined && (
        <div className="absolute -top-1 -right-1">
          <Badge 
            variant="secondary" 
            className="text-xs px-1 py-0 h-4 min-w-0 flex items-center gap-0.5"
          >
            <Battery className="w-2 h-2" />
            <span className="text-[10px]">{presence.battery}%</span>
          </Badge>
        </div>
      )}
      
      {/* Live Indicator */}
      {status === 'live' && (
        <div className="absolute -bottom-1 -right-1">
          <div className="w-3 h-3 bg-emerald-400 rounded-full border border-white animate-ping" />
        </div>
      )}
    </Button>
  );
}