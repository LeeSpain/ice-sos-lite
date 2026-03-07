import React from 'react';
import { Card } from '@/components/ui/card';

interface PlaceEvent {
  id: string;
  user_id: string;
  event_type: 'enter' | 'exit';
  place_name: string;
}

interface MapEventFeedProps {
  events: PlaceEvent[];
  maxItems?: number;
}

const MapEventFeed: React.FC<MapEventFeedProps> = ({ events, maxItems = 3 }) => {
  if (events.length === 0) return null;

  return (
    <Card className="p-3 bg-background/80 backdrop-blur-sm max-w-xs">
      <div className="text-sm font-medium mb-2">Recent Events</div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {events.slice(0, maxItems).map((event) => (
          <div key={event.id} className="text-xs text-muted-foreground">
            <span className="font-medium">{event.user_id.slice(0, 8)}</span>
            {' '}
            {event.event_type === 'enter' ? 'arrived at' : 'left'}
            {' '}
            <span className="font-medium">{event.place_name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MapEventFeed;
