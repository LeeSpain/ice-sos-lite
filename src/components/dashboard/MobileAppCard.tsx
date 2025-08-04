import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

const MobileAppCard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appStatus = {
    downloaded: false,
    loggedIn: false,
    permissionsGranted: false
  };

  // App store URLs
  const APP_STORE_URL = "https://apps.apple.com/app/ice-sos";
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.icesoslite";
  const WEB_APP_URL = "https://a856a70f-639b-4212-b411-d2cdb524d754.lovableproject.com";

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, WEB_APP_URL, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, []);

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Complete
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-500" />
          Mobile App Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* QR Code Section */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 p-2">
              <canvas ref={canvasRef} className="max-w-full max-h-full" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with your phone to access the ICE SOS web app
            </p>
            <div className="text-xs text-muted-foreground">
              Download the native app for the best experience
            </div>
          </div>

          {/* App Setup Status */}
          <div className="space-y-4">
            <h4 className="font-medium">Setup Progress</h4>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Download className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">App Downloaded</span>
              </div>
              {getStatusBadge(appStatus.downloaded)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">Logged In</span>
              </div>
              {getStatusBadge(appStatus.loggedIn)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-orange-600" />
                </div>
                <span className="font-medium">Permissions Granted</span>
              </div>
              {getStatusBadge(appStatus.permissionsGranted)}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="space-y-3">
            <h4 className="font-medium">Download Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => window.open(APP_STORE_URL, '_blank')}
              >
                <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">iOS</span>
                </div>
                Download for iPhone
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => window.open(PLAY_STORE_URL, '_blank')}
              >
                <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AND</span>
                </div>
                Download for Android
              </Button>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Download the ICE SOS app from your app store</li>
              <li>2. Open the app and log in with your account</li>
              <li>3. Grant location and notification permissions</li>
              <li>4. Complete your emergency profile setup</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAppCard;