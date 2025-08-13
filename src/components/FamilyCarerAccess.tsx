import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, Heart, Shield, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const FamilyCarerAccess = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: UserCheck,
      title: "Trusted Contacts",
      description: "Add family members and carers as emergency contacts with priority access levels",
      color: "primary"
    },
    {
      icon: Heart,
      title: "Care Coordination",
      description: "Seamless coordination between family members during emergencies",
      color: "wellness"
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Granular privacy settings to control what information is shared with whom",
      color: "guardian"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Instant notifications and status updates for all authorized contacts",
      color: "emergency"
    }
  ];

  const benefits = [
    "Multi-generational family support",
    "Professional carer integration",
    "Emergency contact hierarchy",
    "Location sharing permissions",
    "Medical information access",
    "Communication preferences",
    "Care plan coordination",
    "Emergency response tracking"
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'emergency': return 'text-emergency';
      case 'guardian': return 'text-guardian';
      case 'wellness': return 'text-wellness';
      default: return 'text-primary';
    }
  };

  const getCardBorder = (color: string) => {
    switch (color) {
      case 'emergency': return 'border-emergency/20 hover:border-emergency/40';
      case 'guardian': return 'border-guardian/20 hover:border-guardian/40';
      case 'wellness': return 'border-wellness/20 hover:border-wellness/40';
      default: return 'border-primary/20 hover:border-primary/40';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-secondary/20 to-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-wellness/10 text-wellness border border-wellness/20 hover:bg-wellness/20 transition-colors">
            Family & Carer Support
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Family & Carer Access
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your loved ones and care providers for comprehensive emergency support
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`group border transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white/80 backdrop-blur-sm ${getCardBorder(feature.color)}`}
              >
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 ${getIconColor(feature.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="default" variant="outline" className="border-wellness/20 text-wellness hover:bg-wellness/10 hover:border-wellness/30 transition-all duration-300">
                <Users className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-wellness" />
                  Family & Carer Access
                </DialogTitle>
                <DialogDescription>
                  Comprehensive support system for families and professional carers
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-wellness" />
                        For Families
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Connect multiple family members across generations. Share emergency information, 
                        coordinate care, and ensure everyone stays informed during critical situations.
                      </p>
                      <div className="space-y-2">
                        {benefits.slice(0, 4).map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-wellness" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-guardian" />
                        For Care Providers
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Professional carers get secure access to essential information while maintaining 
                        privacy boundaries. Coordinate with families and emergency services effectively.
                      </p>
                      <div className="space-y-2">
                        {benefits.slice(4, 8).map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-guardian" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-6 mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <Card key={index} className="border-2">
                          <CardHeader>
                            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-2 ${getIconColor(feature.color)}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription>{feature.description}</CardDescription>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Complete Family & Carer Access Information</h3>
                    <p className="text-muted-foreground mb-6">
                      Get detailed information about our comprehensive family and carer support system
                    </p>
                    <Link to="/family-carer-access">
                      <Button className="bg-wellness hover:bg-wellness/90">
                        <Users className="mr-2 h-4 w-4" />
                        View Full Details
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default FamilyCarerAccess;