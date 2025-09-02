import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bluetooth, PlugZap, HeartPulse, Battery } from 'lucide-react';

interface CompactDeviceStatusProps {
  connected: boolean;
  heartRate?: number | null;
  batteryLevel?: number | null;
  onManageClick: () => void;
}

export const CompactDeviceStatus: React.FC<CompactDeviceStatusProps> = ({
  connected,
  heartRate,
  batteryLevel,
  onManageClick
}) => {
  return (
    <div className="space-y-3">
      {/* Device Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Pendant</span>
          </div>
          {connected ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              <PlugZap className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Ready</Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onManageClick}
          className="h-8 px-3 text-xs"
        >
          Manage
        </Button>
      </div>

      {/* Device Metrics */}
      {connected && heartRate && batteryLevel && (
        <div className="flex items-center justify-center gap-6 py-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <HeartPulse className="h-4 w-4 text-red-500" />
            <span className="font-medium">{heartRate} BPM</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Battery className={`h-4 w-4 ${batteryLevel > 20 ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="font-medium">{batteryLevel}%</span>
          </div>
        </div>
      )}
    </div>
  );
};