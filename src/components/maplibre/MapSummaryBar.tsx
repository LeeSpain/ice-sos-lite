import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Pause, Play, Settings, Target } from 'lucide-react';

interface MapSummaryBarProps {
  memberCount: number;
  isTracking: boolean;
  onToggleTracking: () => void;
  onRefresh: () => void;
  onCenterOnMe: () => void;
  topSlot?: React.ReactNode; // e.g. CircleSwitcher
}

const MapSummaryBar: React.FC<MapSummaryBarProps> = ({
  memberCount,
  isTracking,
  onToggleTracking,
  onRefresh,
  onCenterOnMe,
  topSlot,
}) => {
  return (
    <div className="space-y-3">
      {topSlot}

      <Card className="p-3 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Location Sharing</span>
              <Badge variant={isTracking ? 'default' : 'secondary'}>
                {isTracking ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {memberCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {memberCount} member{memberCount !== 1 ? 's' : ''} visible
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onToggleTracking} className="flex items-center gap-1">
              {isTracking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isTracking ? 'Pause' : 'Start'}
            </Button>
            <Button size="sm" variant="outline" onClick={onRefresh}>
              <Settings className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCenterOnMe}>
              <Target className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapSummaryBar;
