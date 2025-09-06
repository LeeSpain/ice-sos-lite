import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Social Media Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map((account) => {
              const IconComponent = account.icon;
              return (
                <Card key={account.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{account.name}</h4>
                          <p className="text-sm text-muted-foreground">{account.platform}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={account.status === 'connected' ? 'default' : 
                                account.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {account.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Followers</span>
                      <span className="font-medium">{account.followers}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add Account Card */}
            <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="font-medium text-muted-foreground">Add Account</h4>
                <p className="text-xs text-muted-foreground">Connect new social platform</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
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
    </div>
  );
};