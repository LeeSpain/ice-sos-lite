import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const AppDownload = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Enhanced App Download Section */}
        <Card className="relative border border-border bg-card shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-secondary to-muted/30"></div>
          <CardHeader className="relative text-center py-14 px-8">
            <Badge className="bg-emergency text-white w-fit mx-auto mb-6 text-sm font-semibold px-4 py-2 shadow-lg">
              PROFESSIONAL APP
            </Badge>
            <div className="w-20 h-20 mx-auto mb-8 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-border/20">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Download ICE SOS Lite
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional emergency protection platform for individuals and families. 
              Download free, then activate your premium protection features.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative px-8 pb-14">
            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Emergency SOS</h4>
                <p className="text-sm text-muted-foreground">One-tap emergency button with GPS location sharing</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Global Coverage</h4>
                <p className="text-sm text-muted-foreground">Works worldwide with full multilingual support</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Instant Setup</h4>
                <p className="text-sm text-muted-foreground">Ready to use in minutes with simple configuration</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/register">
                  <Download className="mr-2 h-5 w-5" />
                  Get Started Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                <Download className="mr-2 h-5 w-5" />
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AppDownload;