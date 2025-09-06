import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialMediaManager } from './SocialMediaManager';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Plus,
  Settings,
  Activity,
  Users,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';

export const SocialHub: React.FC = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: '1', platform: 'Facebook', name: 'ICE SOS Emergency', followers: '12.5K', status: 'connected', icon: Facebook },
    { id: '2', platform: 'Instagram', name: '@icesosfamily', followers: '8.2K', status: 'connected', icon: Instagram },
    { id: '3', platform: 'Twitter', name: '@ICESafety', followers: '5.8K', status: 'disconnected', icon: Twitter },
    { id: '4', platform: 'LinkedIn', name: 'ICE SOS Ltd', followers: '2.1K', status: 'connected', icon: Linkedin },
    { id: '5', platform: 'YouTube', name: 'ICE SOS Family Safety', followers: '1.3K', status: 'pending', icon: Youtube }
  ]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <SocialMediaManager />
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Posting Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Posting schedule will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Posted: Family Safety Tips #{i}</p>
                      <p className="text-sm text-muted-foreground">2 hours ago • 45 likes, 12 comments</p>
                    </div>
                    <Badge variant="outline">Published</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Social Media Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};