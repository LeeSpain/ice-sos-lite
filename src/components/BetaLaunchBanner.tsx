import React from 'react';
import { AlertTriangle, Users, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const BetaLaunchBanner: React.FC = () => {
  return (
    <Alert className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <Badge variant="outline" className="border-warning text-warning bg-warning/10">
            BETA LAUNCH
          </Badge>
        </div>
        
        <AlertDescription className="flex-1 text-sm">
          <span className="font-medium text-foreground">
            Welcome to our Beta Launch! 
          </span>
          <span className="text-muted-foreground ml-1">
            Current features include emergency contact alerts and family coordination. 
            Direct emergency service integration coming in Q1 2025.
          </span>
        </AlertDescription>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>Early Access</span>
        </div>
      </div>
    </Alert>
  );
};