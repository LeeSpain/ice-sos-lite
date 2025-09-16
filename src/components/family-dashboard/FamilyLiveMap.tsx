import React from 'react';
import { useUnifiedMap } from '@/hooks/useUnifiedMap';

interface FamilyLiveMapProps {
  className?: string;
}

const FamilyLiveMap: React.FC<FamilyLiveMapProps> = ({ className }) => {
  const { MapView } = useUnifiedMap();
  
  return (
    <div className={`min-h-[calc(100vh-64px)] ${className || ''}`}>
      <MapView
        className="h-full w-full"
        markers={[]}
        center={{ lat: 37.7749, lng: -122.4194 }}
        zoom={13}
        preferCanvas={true}
      />
    </div>
  );
};

export default FamilyLiveMap;