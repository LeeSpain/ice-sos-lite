import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bluetooth, 
  Battery, 
  Wifi, 
  MapPin, 
  Settings,
  CheckCircle,
  AlertCircle,
  Package,
  Plus,
  Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MyProductsWidgetProps {
  profile: any;
}

const MyProductsWidget = ({ profile }: MyProductsWidgetProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProducts();
  }, []);

  const loadUserProducts = async () => {
    setLoading(true);
    try {
      // For now, we'll show a mock product since we don't have a user_products table yet
      // In a real implementation, you'd query user's purchased products
      const mockProducts = [
        {
          id: 'bluetooth-pendant-1',
          name: 'ICE SOS Bluetooth Pendant',
          type: 'bluetooth_pendant',
          status: 'connected',
          battery_level: 85,
          last_sync: new Date().toISOString(),
          firmware_version: '1.2.3',
          setup_completed: true
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-emergency';
      case 'disconnected': return 'text-destructive';
      case 'low_battery': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-emergency/10 text-emergency">Connected</Badge>;
      case 'disconnected': return <Badge variant="destructive">Disconnected</Badge>;
      case 'low_battery': return <Badge className="bg-orange-100 text-orange-700">Low Battery</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-emergency';
    if (level > 20) return 'text-orange-500';
    return 'text-destructive';
  };

  const productFeatures = [
    {
      name: "Emergency SOS",
      status: "active",
      icon: CheckCircle,
      description: "One-touch emergency alert"
    },
    {
      name: "GPS Tracking",
      status: "active", 
      icon: MapPin,
      description: "Real-time location sharing"
    },
    {
      name: "Fall Detection",
      status: "active",
      icon: CheckCircle,
      description: "Automatic fall detection"
    },
    {
      name: "Waterproof",
      status: "active",
      icon: CheckCircle,
      description: "IP67 water resistance"
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Products Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              My Products
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {products.length > 0 ? (
        products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-emergency rounded-lg flex items-center justify-center">
                    <Bluetooth className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last sync: {new Date(product.last_sync).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Device Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Battery className={`h-4 w-4 ${getBatteryColor(product.battery_level)}`} />
                  <span className="text-sm">Battery: {product.battery_level}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emergency" />
                  <span className="text-sm">Signal: Strong</span>
                </div>
              </div>

              {/* Battery Level */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Battery Level</span>
                  <span className="text-sm text-muted-foreground">{product.battery_level}%</span>
                </div>
                <Progress 
                  value={product.battery_level} 
                  className="h-2"
                />
              </div>

              {/* Product Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Active Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {productFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <feature.icon className="h-3 w-3 text-emergency" />
                      <span className="text-xs text-muted-foreground">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Test Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Products Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first ICE SOS device to get started with 24/7 protection
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProductsWidget;