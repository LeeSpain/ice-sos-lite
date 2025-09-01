import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Presence {
  user_id: string;
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
    if (diff < 2 * 60 * 1000) return "live"; // 2 minutes
    if (diff < 60 * 60 * 1000) return "idle"; // 1 hour
    return "offline";
  }, [presence.last_seen, presence.is_paused]);

  const statusColors = {
    live: "ring-emerald-500 bg-emerald-500",
    idle: "ring-amber-500 bg-amber-500", 
    offline: "ring-slate-400 bg-slate-400",
    paused: "ring-slate-300 bg-slate-300"
  };

  const statusClass = statusColors[status];

  return (
    <button 
      onClick={onClick} 
      className={cn(
        "relative w-10 h-10 rounded-full ring-4 shadow-lg transition-all duration-200 hover:scale-110",
        statusClass
      )}
      title={`${status === 'live' ? 'Online' : status === 'idle' ? 'Away' : status === 'paused' ? 'Paused' : 'Offline'}`}
    >
      <Avatar className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <AvatarFallback className="bg-white text-slate-700 text-xs font-medium">
          {presence.user_id.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {/* Battery indicator */}
      {presence.battery !== null && presence.battery !== undefined && (
        <div className="absolute -bottom-1 -right-1 w-4 h-2 bg-background rounded-sm border text-xs flex items-center justify-center">
          <span className={cn(
            "text-[8px] font-mono",
            presence.battery > 20 ? "text-green-600" : 
            presence.battery > 10 ? "text-amber-600" : "text-red-600"
          )}>
            {presence.battery}
          </span>
        </div>
      )}
      
      {/* Status pulse for live users */}
      {status === 'live' && (
        <div className="absolute inset-0 rounded-full ring-4 ring-emerald-500 animate-ping opacity-30"></div>
      )}
    </button>
  );
}