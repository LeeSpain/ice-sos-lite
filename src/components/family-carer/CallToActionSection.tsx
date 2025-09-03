import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserPlus, Shield, Clock, CheckCircle } from "lucide-react";

export const CallToActionSection = () => {
  const guarantees = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "No tracking outside emergencies"
    },
    {
      icon: Clock,
      title: "5-Minute Setup",
      description: "Family connected in minutes"
    },
    {
      icon: CheckCircle,
      title: "30-Day Guarantee",
      description: "Full refund if not satisfied"
    }
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Connect Your Family Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Give your loved ones peace of mind. When emergencies happen, your family will know exactly 
            where you are and how to help - instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              asChild 
              size="lg" 
              className="bg-wellness text-black hover:bg-wellness/90 shadow-glow font-semibold text-lg px-8"
            >
              <Link to="/ai-register">
                <UserPlus className="mr-2 h-5 w-5" />
                Start Family Setup
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold text-lg px-8"
            >
              <Link to="/contact">
                Talk to Expert
              </Link>
            </Button>
          </div>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {guarantees.map((guarantee, index) => {
                  const Icon = guarantee.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="h-8 w-8 text-wellness mx-auto mb-3" />
                      <h3 className="font-semibold text-white mb-2">{guarantee.title}</h3>
                      <p className="text-white/80 text-sm">{guarantee.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8">
            <p className="text-white/60 text-sm">
              Join thousands of families already using ICE SOS for emergency coordination
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};