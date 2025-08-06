import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Bell, Settings } from "lucide-react";
import SosButton from "./SosButton";

const MetricPreview = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary/20 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            Smart Metric Screen
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time health monitoring, wellness reminders, and instant emergency access 
            right from your mobile screen.
          </p>
        </div>
        
        <div className="max-w-sm mx-auto">
          {/* Mobile Frame */}
          <div className="bg-card rounded-3xl p-6 shadow-2xl border-8 border-gray-800">
            {/* Status Bar */}
            <div className="flex justify-between items-center mb-6 text-xs text-muted-foreground">
              <span>9:41</span>
              <div className="flex space-x-1">
                <div className="w-4 h-2 bg-primary rounded-sm"></div>
                <div className="w-1 h-2 bg-primary rounded-sm"></div>
              </div>
            </div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Good Morning</h3>
                <p className="text-sm text-muted-foreground">Today's Status</p>
              </div>
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            
            {/* Health Cards */}
            <div className="space-y-4 mb-8">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-emergency" />
                    <span>Health Status</span>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Normal
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">All vitals within normal range</p>
                </CardContent>
              </Card>
              
              <Card className="border-wellness/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-wellness" />
                    <span>Reminders</span>
                    <Badge variant="secondary" className="text-xs bg-wellness/20 text-wellness-foreground">
                      2 Today
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Morning medication due in 30 min</p>
                </CardContent>
              </Card>
              
              <Card className="border-guardian/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-guardian" />
                    <span>Guardian AI</span>
                    <Badge variant="secondary" className="text-xs bg-guardian/10 text-guardian">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">"How are you feeling today?"</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Emergency SOS Button */}
            <div className="flex justify-center">
              <SosButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricPreview;