import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

export const SystemMonitor: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState({
    cpu: 45,
    memory: 67,
    storage: 34,
    network: 89
  });

  const [services, setServices] = useState([
    { name: 'Content Generation AI', status: 'operational', uptime: '99.9%', icon: Zap },
    { name: 'Social Media APIs', status: 'operational', uptime: '99.7%', icon: Wifi },
    { name: 'Database Cluster', status: 'operational', uptime: '99.8%', icon: Database },
    { name: 'Image Processing', status: 'degraded', uptime: '98.2%', icon: Server },
    { name: 'Analytics Engine', status: 'operational', uptime: '99.6%', icon: Activity }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { time: '2 min ago', event: 'Campaign "Family Safety Tips" completed successfully', type: 'success' },
    { time: '5 min ago', event: 'Image generation queue processed 12 items', type: 'info' },
    { time: '8 min ago', event: 'Social media post scheduled for Instagram', type: 'info' },
    { time: '12 min ago', event: 'Warning: High memory usage detected', type: 'warning' },
    { time: '15 min ago', event: 'Content approval workflow completed', type: 'success' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        storage: Math.max(20, Math.min(60, prev.storage + (Math.random() - 0.5) * 5)),
        network: Math.max(70, Math.min(100, prev.network + (Math.random() - 0.5) * 6))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-700';
      case 'degraded': return 'bg-orange-100 text-orange-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <span className="text-sm font-bold">{systemHealth.cpu.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.cpu} className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-600" />
                <span className="font-medium">Memory</span>
              </div>
              <span className="text-sm font-bold">{systemHealth.memory.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.memory} className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Storage</span>
              </div>
              <span className="text-sm font-bold">{systemHealth.storage.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.storage} className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Network</span>
              </div>
              <span className="text-sm font-bold">{systemHealth.network.toFixed(1)}%</span>
            </div>
            <Progress value={systemHealth.network} className="w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.status === 'operational' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded">
                <Clock className={`h-4 w-4 mt-0.5 ${getActivityColor(activity.type)}`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};