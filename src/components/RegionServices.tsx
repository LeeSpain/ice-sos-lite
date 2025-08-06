import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Clock, Star } from 'lucide-react';

interface RegionalPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  features: string[];
  is_popular: boolean;
}

const RegionServices = () => {
  const [regionalPlans, setRegionalPlans] = useState<RegionalPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegionalPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('regional_services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        
        setRegionalPlans(data || []);
      } catch (error) {
        console.error('Error fetching regional plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalPlans();
  }, []);

  const trackRegionServiceClick = async (planId: string, planName: string) => {
    // Analytics tracking removed for now due to type issues
    console.log('Region service clicked:', planId, planName);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loading Regional Services...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (regionalPlans.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <MapPin className="h-4 w-4 mr-2" />
            Regional Services
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Specialized Regional Coverage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhanced emergency services tailored for specific regions with local expertise and 24/7 support
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {regionalPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  plan.is_popular ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                    <Star className="h-3 w-3 inline mr-1" />
                    Popular
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-primary">
                        {plan.price}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        {plan.currency}
                      </span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {plan.region}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium"
                    onClick={() => trackRegionServiceClick(plan.id, plan.name)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Regional Center
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              All regional services include 24/7 emergency response
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionServices;