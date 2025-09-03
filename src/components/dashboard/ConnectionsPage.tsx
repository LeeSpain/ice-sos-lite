import React from 'react';
import { ConnectionsWidget } from './ConnectionsWidget';

export const ConnectionsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Emergency Connections</h1>
        <p className="text-muted-foreground">
          Manage your emergency contacts and family connections
        </p>
      </div>
      
      <ConnectionsWidget />
    </div>
  );
};