import React from 'react';

interface FamilyMarkerProps {
  id: string;
  name: string;
  avatar: string;
  status: 'live' | 'alert' | 'idle';
  className?: string;
}

const FamilyMarker: React.FC<FamilyMarkerProps> = ({ name, avatar, status, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'alert': return 'bg-red-500';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-green-500';
    }
  };

  const showPulse = status === 'alert';

  return (
    <div className={`relative ${className}`}>
      <div className={`w-10 h-10 ${getStatusColor()} rounded-full border-3 border-white shadow-lg flex items-center justify-center overflow-hidden ${showPulse ? 'animate-pulse' : ''}`}>
        <img 
          src={avatar} 
          alt={`${name} avatar`}
          className="w-full h-full object-cover rounded-full"
        />
        {showPulse && (
          <>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
          </>
        )}
      </div>
      <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent ${getStatusColor().replace('bg-', 'border-t-')}`}></div>
      <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center px-2 py-1 rounded shadow-md border whitespace-nowrap ${
        status === 'alert' 
          ? 'bg-red-50 border-red-200 text-red-800' 
          : 'bg-white'
      }`}>
        {status === 'alert' ? `${name} - Alert!` : name}
      </div>
    </div>
  );
};

export default FamilyMarker;