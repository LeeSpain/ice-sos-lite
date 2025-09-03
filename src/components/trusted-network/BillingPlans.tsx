import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Euro, 
  Check, 
  Users, 
  Crown, 
  Shield, 
  Phone, 
  MapPin, 
  Clock,
  Heart,
  Briefcase,
  CreditCard,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
}

export const BillingPlans = () => {
  const { currency, language } = usePreferences();

  const formatPrice = (priceEUR: number) => {
    const converted = convertCurrency(priceEUR, 'EUR', currency);
    return formatDisplayCurrency(converted, currency, languageToLocale(language));
  };

  const pricingPlans: PricingPlan[] = [
    {
      id: 'family_seat',
      name: 'Family Seat',
      description: 'Owner-paid seat for family members',
      price: 2.99,
      period: '/month',
      icon: Heart,
      color: 'text-emergency',
      bgColor: 'bg-emergency/10',
      popular: true,
      features: [
        'Full emergency access & coordination',
        'Real-time SOS alerts with location',
        'Family emergency chat & coordination',
        'Emergency medical information access',
        'No limit on emergency contacts',
        'Professional mobile app access',
        'EU data protection compliance'
      ]
    },
    {
      id: 'professional_care',
      name: 'Professional Care Access',
      description: 'For professional carers and care organizations',
      price: 4.99,
      period: '/month',
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      features: [
        'Emergency-only access during care hours',
        'Professional care platform integration',
        'Incident reporting & documentation',
        'Care plan emergency integration',
        'Professional notification channels',
        'Time-based access controls',
        'Professional audit trails'
      ],
      limitations: [
        'Access limited to emergency situations',
        'No family coordination access',
        'Professional relationship boundaries'
      ]
    },
    {
      id: 'independent_membership',
      name: 'Independent Membership',
      description: 'Full ICE SOS account for family members',
      price: 9.99,
      period: '/month',
      icon: Crown,
      color: 'text-wellness',
      bgColor: 'bg-wellness/10',
      features: [
        'Complete independent ICE SOS account',
        'Own emergency system with 5 contacts',
        'All premium safety features included',
        'Family emergency access',
        'Personal emergency coordination',
        'Regional service access',
        'Complete privacy control'
      ]
    }
  ];

  const comparisonFeatures = [
    { name: 'Emergency SOS Alerts', family: true, professional: true, independent: true },
    { name: 'Real-time Location Sharing', family: true, professional: 'limited', independent: true },
    { name: 'Family Coordination Chat', family: true, professional: false, independent: true },
    { name: 'Medical Information Access', family: true, professional: 'limited', independent: true },
    { name: 'Emergency Contact Limit', family: 'unlimited', professional: '3', independent: '5' },
    { name: 'Professional Care Integration', family: false, professional: true, independent: false },
    { name: 'Independent Emergency System', family: false, professional: false, independent: true },
    { name: 'Regional Service Access', family: false, professional: false, independent: true },
    { name: 'Care Plan Integration', family: false, professional: true, independent: false },
    { name: 'Audit Trail & Compliance', family: true, professional: true, independent: true }
  ];

  const getFeatureValue = (value: boolean | string) => {
    if (value === true) return <Check className="h-4 w-4 text-wellness" />;
    if (value === false) return <span className="text-muted-foreground">—</span>;
    if (value === 'limited') return <Badge variant="outline" className="text-xs">Limited</Badge>;
    return <span className="text-xs text-foreground">{value}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Billing & Subscription Plans</h2>
        <p className="text-muted-foreground">Flexible pricing for different types of trusted network access</p>
      </div>

      {/* Current Usage Summary */}
      <Card className="border border-border/50 shadow-sm bg-gradient-to-r from-primary/5 to-wellness/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Current Network Costs
          </CardTitle>
          <CardDescription>
            Your current trusted network subscription breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatPrice(2.99)}</p>
              <p className="text-sm text-muted-foreground">Per Family Seat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Active Family Seats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">1</p>
              <p className="text-sm text-muted-foreground">Professional Carer</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-wellness">{formatPrice(13.96)}</p>
              <p className="text-sm text-muted-foreground">Total Monthly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className={`border border-border/50 shadow-sm relative ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 ${plan.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <plan.icon className={`h-8 w-8 ${plan.color}`} />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-wellness mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Limitations</p>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-xs text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.id === 'family_seat' ? 'Add Family Member' : 
                 plan.id === 'professional_care' ? 'Add Professional Carer' : 
                 'Upgrade to Independent'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Feature Comparison
          </CardTitle>
          <CardDescription>
            Detailed comparison of features across subscription types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 font-medium text-foreground">Feature</th>
                  <th className="text-center p-3 font-medium text-foreground">Family Seat</th>
                  <th className="text-center p-3 font-medium text-foreground">Professional Care</th>
                  <th className="text-center p-3 font-medium text-foreground">Independent</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 text-sm text-foreground">{feature.name}</td>
                    <td className="p-3 text-center">{getFeatureValue(feature.family)}</td>
                    <td className="p-3 text-center">{getFeatureValue(feature.professional)}</td>
                    <td className="p-3 text-center">{getFeatureValue(feature.independent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="border border-border/50 shadow-sm bg-gradient-to-r from-wellness/5 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-wellness" />
            Why Choose Trusted Network Plans?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">For Families</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Cost-effective family emergency coordination</li>
                <li>• Complete privacy control with emergency-only sharing</li>
                <li>• Professional-grade emergency response system</li>
                <li>• EU-compliant data protection</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">For Professional Carers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Professional tools for emergency response</li>
                <li>• Integration with care platforms and schedules</li>
                <li>• Appropriate access boundaries and audit trails</li>
                <li>• Incident reporting and documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};