import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Phone, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell
} from "lucide-react";

interface EmergencyActionsWidgetProps {
  profile: any;
  subscription: any;
}

const EmergencyActionsWidget = ({ profile, subscription }: EmergencyActionsWidgetProps) => {
  const emergencyContactsCount = profile?.emergency_contacts ? 
    (Array.isArray(profile.emergency_contacts) ? profile.emergency_contacts.length : 0) : 0;
  
  const protectionActive = subscription?.subscribed;
  const profileComplete = (profile?.profile_completion_percentage || 0) >= 80;

  const nextSteps = [];
  
  if (!protectionActive) {
    nextSteps.push({
      title: "Activate Protection",
      description: "Subscribe to emergency services",
      icon: Shield,
      action: () => window.location.href = '/dashboard/subscription',
      priority: "high"
    });
  }
  
  if (emergencyContactsCount < 5) {
    nextSteps.push({
      title: "Add Emergency Contacts",
      description: `Add ${5 - emergencyContactsCount} more contacts`,
      icon: Phone,
      action: () => window.location.href = '/dashboard/emergency',
      priority: "medium"
    });
  }
  
  if (!profileComplete) {
    nextSteps.push({
      title: "Complete Profile",
      description: "Fill in remaining details",
      icon: CheckCircle,
      action: () => window.location.href = '/dashboard/profile',
      priority: "low"
    });
  }

  const emergencyActions = [
    {
      title: "Emergency Test",
      description: "Test all systems",
      icon: Shield,
      action: () => {
        // This will trigger the test from the main overview
        const testButton = document.querySelector('[data-test="emergency-test"]') as HTMLButtonElement;
        if (testButton) testButton.click();
      },
      variant: "emergency" as const
    },
    {
      title: "Quick Call",
      description: "Call emergency contact",
      icon: Phone,
      action: () => {
        if (emergencyContactsCount > 0 && profile?.emergency_contacts?.[0]?.phone) {
          window.open(`tel:${profile.emergency_contacts[0].phone}`, '_self');
        }
      },
      variant: "outline" as const,
      disabled: emergencyContactsCount === 0
    }
  ];

  return (
    <div className="space-y-4">
      {/* Emergency Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              disabled={action.disabled}
              className="w-full justify-start h-auto p-3"
              size="sm"
            >
              <action.icon className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="text-sm font-medium">{action.title}</div>
                <div className="text-xs opacity-80">{action.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.slice(0, 2).map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={step.action}>
                <div className={`p-1.5 rounded-lg ${
                  step.priority === 'high' ? 'bg-destructive/10' :
                  step.priority === 'medium' ? 'bg-orange-500/10' : 'bg-primary/10'
                }`}>
                  <step.icon className={`h-3 w-3 ${
                    step.priority === 'high' ? 'text-destructive' :
                    step.priority === 'medium' ? 'text-orange-500' : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Safety Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Protection</span>
            <Badge variant={protectionActive ? "default" : "destructive"} className="text-xs">
              {protectionActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Contacts</span>
            <div className="flex items-center gap-1">
              {emergencyContactsCount >= 5 ? (
                <CheckCircle className="h-3 w-3 text-emergency" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">{emergencyContactsCount}/5</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Profile</span>
            <div className="flex items-center gap-1">
              {profileComplete ? (
                <CheckCircle className="h-3 w-3 text-emergency" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">{profile?.profile_completion_percentage || 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyActionsWidget;