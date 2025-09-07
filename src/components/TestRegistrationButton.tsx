import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TestRegistrationButtonProps {
  className?: string;
}

const TestRegistrationButton: React.FC<TestRegistrationButtonProps> = ({ className = '' }) => {
  const handleTestRegistration = () => {
    // Navigate to registration with test parameter
    window.location.href = '/ai-register?test=true';
  };

  return (
    <Card className={`bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <TestTube className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">Test Registration Flow</h3>
              <p className="text-sm text-orange-700">
                Test the complete payment process for only €1.00
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 mb-2">
              Development Only
            </Badge>
            <Button 
              onClick={handleTestRegistration}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Test for €1
            </Button>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
          <p className="text-xs text-orange-800">
            <strong>This includes:</strong> Complete registration flow, Stripe payment processing, account creation, and welcome email
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestRegistrationButton;