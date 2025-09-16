import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Shield, Smartphone, UserCircle } from 'lucide-react';
import QRCode from 'qrcode';
import SEO from '@/components/SEO';


interface WelcomeData {
  firstName: string;
  lastName: string;
  email: string;
  subscriptionPlans: any[];
  products: any[];
  regionalServices: any[];
  totalAmount: number;
}

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const [iosQRCode, setIosQRCode] = useState<string>('');
  const [androidQRCode, setAndroidQRCode] = useState<string>('');

  const iosAppStoreUrl = 'https://apps.apple.com/app/your-app-id';
  const androidPlayStoreUrl = 'https://play.google.com/store/apps/details?id=your.app.id';

  useEffect(() => {
    // Get welcome data from sessionStorage
    const storedData = sessionStorage.getItem('welcomeData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setWelcomeData(data);
      // Clear the data so it only shows once
      sessionStorage.removeItem('welcomeData');
    } else {
      // If no welcome data, redirect to dashboard
      navigate('/dashboard');
    }

    // Generate QR codes
    const generateQRCodes = async () => {
      try {
        const iosQR = await QRCode.toDataURL(iosAppStoreUrl);
        const androidQR = await QRCode.toDataURL(androidPlayStoreUrl);
        setIosQRCode(iosQR);
        setAndroidQRCode(androidQR);
      } catch (error) {
        console.error('Error generating QR codes:', error);
      }
    };

    generateQRCodes();
  }, [navigate]);

  if (!welcomeData || !user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your welcome page...</p>
        </div>
      </div>
    );
  }

  // Calculate totals to match the payment form
  const PRODUCT_IVA_RATE = 0.21; // 21% for products
  const SERVICE_IVA_RATE = 0.10; // 10% for regional services

  const subscriptionTotal = (welcomeData.subscriptionPlans || []).reduce((sum, plan) => {
    const price = plan?.price;
    return sum + (price ? parseFloat(price.toString()) : 0);
  }, 0) + (welcomeData.regionalServices || []).reduce((sum, service) => {
    const price = service?.price;
    const servicePrice = price ? parseFloat(price.toString()) : 0;
    return sum + (servicePrice * (1 + SERVICE_IVA_RATE));
  }, 0);

  const productTotal = (welcomeData.products || []).reduce((sum, product) => {
    const price = product?.price;
    const productPrice = price ? parseFloat(price.toString()) : 0;
    return sum + (productPrice * (1 + PRODUCT_IVA_RATE));
  }, 0);

  const grandTotal = subscriptionTotal + productTotal;

  const handleDashboardAccess = () => {
    navigate('/welcome-questionnaire');
  };

  const handleDirectDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SEO title="Payment Success – ICE SOS Lite" description="Your account is active. Access your dashboard and download the mobile app." />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-page-top pb-section">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-emergency" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-20 h-20 text-emergency opacity-30" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome {welcomeData.firstName}!
            </h1>
            
            <p className="text-xl text-white/90 mb-2">
              Your ICE SOS Protection is Now Active
            </p>
            
            <Badge variant="secondary" className="bg-emergency/20 text-emergency border-emergency/30 px-4 py-2 text-lg">
              <Shield className="w-5 h-5 mr-2" />
              Account Activated Successfully
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Purchase Summary Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-6 h-6 text-emergency" />
                  Purchase Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Customer Information:</h4>
                  <div className="text-sm space-y-1 text-foreground">
                    <p><strong>Name:</strong> {welcomeData.firstName} {welcomeData.lastName}</p>
                    <p><strong>Email:</strong> {welcomeData.email}</p>
                  </div>
                </div>

                {/* Monthly Subscriptions */}
                {welcomeData.subscriptionPlans.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Monthly Subscriptions:</h5>
                    <ul className="space-y-2">
                      {welcomeData.subscriptionPlans.map(plan => (
                        <li key={plan.id} className="flex justify-between p-2 bg-secondary rounded border">
                          <span className="font-medium text-foreground">{plan.name}</span>
                          <span className="text-foreground">€{parseFloat(plan.price.toString()).toFixed(2)}/month</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Regional Services */}
                {welcomeData.regionalServices.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Regional Services:</h5>
                    <ul className="space-y-2">
                      {welcomeData.regionalServices.map(service => {
                        const netPrice = parseFloat(service.price.toString());
                        const totalPrice = netPrice * (1 + SERVICE_IVA_RATE);
                        return (
                          <li key={service.id} className="p-2 bg-secondary rounded border">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-foreground">{service.name} ({service.region})</span>
                              <span className="font-bold text-foreground">€{totalPrice.toFixed(2)}/month</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Safety Products */}
                {welcomeData.products.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Safety Products (One-time):</h5>
                    <ul className="space-y-2">
                      {welcomeData.products.map(product => {
                        const netPrice = parseFloat(product.price.toString());
                        const totalPrice = netPrice * (1 + PRODUCT_IVA_RATE);
                        return (
                          <li key={product.id} className="p-2 bg-secondary rounded border">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-foreground">{product.name}</span>
                              <span className="font-bold text-foreground">€{totalPrice.toFixed(2)}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Total Summary */}
                <div className="border-t pt-4 space-y-2">
                  {subscriptionTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Subscription:</span>
                      <span className="font-medium text-foreground">€{subscriptionTotal.toFixed(2)}/month</span>
                    </div>
                  )}
                  {productTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">One-time Products:</span>
                      <span className="font-medium text-foreground">€{productTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-foreground">Total Payment:</span>
                    <span className="text-emergency">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserCircle className="w-6 h-6 text-primary" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dashboard Access */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground">Access Your Dashboard</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete your profile and configure your emergency settings
                      </p>
                      <Button 
                        onClick={handleDashboardAccess}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        size="lg"
                      >
                        <UserCircle className="w-5 h-5 mr-2" />
                        Open Your Dashboard
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile App Download */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emergency text-white flex items-center justify-center font-bold text-sm">2</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">Download Mobile App</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get instant access to emergency features on your phone
                      </p>
                      
                      {/* QR Codes */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="bg-white p-3 rounded-lg shadow-sm border">
                            {iosQRCode && <img src={iosQRCode} alt="iOS QR Code" className="w-24 h-24 mx-auto" loading="lazy" decoding="async" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">iOS App Store</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-white p-3 rounded-lg shadow-sm border">
                            {androidQRCode && <img src={androidQRCode} alt="Android QR Code" className="w-24 h-24 mx-auto" loading="lazy" decoding="async" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Google Play</p>
                        </div>
                      </div>

                      {/* Direct Download Buttons */}
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleDirectDownload(iosAppStoreUrl)}
                          variant="outline" 
                          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                          size="sm"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Download for iOS
                        </Button>
                        <Button 
                          onClick={() => handleDirectDownload(androidPlayStoreUrl)}
                          variant="outline" 
                          className="w-full border-emergency text-emergency hover:bg-emergency hover:text-white"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download for Android
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Information */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Email:</strong> support@icesos.com</p>
                    <p><strong>Phone:</strong> +34 900 123 456</p>
                    <p><strong>Live Chat:</strong> Available 24/7 in your dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Your subscription will begin immediately and you'll receive a confirmation email shortly.
              <br />
              For any questions, our support team is available 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;