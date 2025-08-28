import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Target, 
  DollarSign, 
  Calendar, 
  Share2, 
  BarChart3, 
  Plus,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  title: string;
  description: string;
  command_input: string;
  status: string;
  budget_estimate: number;
  created_at: string;
  target_audience: any;
}

interface MarketingContent {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  title: string;
  body_text: string;
  image_url: string;
  hashtags: string[];
  status: string;
  scheduled_time: string;
}

const AIMarketingPage: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rivenResponse, setRivenResponse] = useState('');
  const [activeTab, setActiveTab] = useState('command-center');

  // Load existing campaigns
  useEffect(() => {
    loadCampaigns();
    loadContents();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadContents = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const sendCommandToRiven = async () => {
    if (!currentCommand.trim()) {
      toast({
        title: "Command Required",
        description: "Please enter a command for Riven to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setRivenResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          command: currentCommand,
          action: 'process_command'
        }
      });

      if (error) throw error;

      setRivenResponse(data.response);
      
      if (data.campaign_created) {
        await loadCampaigns();
        setActiveTab('campaigns');
      }

      toast({
        title: "Riven Response",
        description: "Command processed successfully!",
      });
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: "Error",
        description: "Failed to process command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateContent = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'generate_content',
          campaign_id: campaignId
        }
      });

      if (error) throw error;

      await loadContents();
      toast({
        title: "Content Generated",
        description: "Marketing content has been created successfully!",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const approveCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;
      
      await loadCampaigns();
      toast({
        title: "Campaign Approved",
        description: "Campaign is now active and ready for publishing!",
      });
    } catch (error) {
      console.error('Error approving campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'active': return 'bg-primary text-primary-foreground';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'published': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Marketing - Riven</h1>
          <p className="text-muted-foreground">
            Your AI Marketing Expert for Automated Campaign Creation & Social Media Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">Riven AI Active</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="command-center">Command Center</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="command-center" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Command Center
              </CardTitle>
              <CardDescription>
                Give Riven detailed instructions about your marketing campaigns. Be specific about goals, audience, timeline, and budget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command">Marketing Command</Label>
                <Textarea
                  id="command"
                  placeholder="Example: Create 5 social media posts about our family protection features targeting parents aged 30-50. Include pricing information, schedule for next week across Facebook, Instagram, and LinkedIn. Budget: $500"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={sendCommandToRiven} 
                disabled={isProcessing || !currentCommand.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Riven is Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Command to Riven
                  </>
                )}
              </Button>

              {rivenResponse && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Riven's Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <p className="text-sm whitespace-pre-wrap">{rivenResponse}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
            <Button onClick={loadCampaigns} variant="outline">Refresh</Button>
          </div>

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Budget: ${campaign.budget_estimate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <>
                        <Button 
                          onClick={() => generateContent(campaign.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Generate Content
                        </Button>
                        <Button 
                          onClick={() => approveCampaign(campaign.id)}
                          size="sm"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Campaign
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {campaigns.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No campaigns yet</p>
                  <p className="text-muted-foreground text-center">
                    Use the Command Center to create your first marketing campaign with Riven
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Content Library</h2>
            <Button onClick={loadContents} variant="outline">Refresh</Button>
          </div>

          <div className="grid gap-4">
            {contents.map((content) => (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {content.body_text?.substring(0, 150)}...
                  </p>

                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span>{content.content_type}</span>
                    </div>
                    {content.image_url && (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Has Image</span>
                      </div>
                    )}
                    {content.scheduled_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Scheduled: {new Date(content.scheduled_time).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {contents.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No content created yet</p>
                  <p className="text-muted-foreground text-center">
                    Create campaigns and generate content to see your marketing materials here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Marketing Analytics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active marketing campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Generated content items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${campaigns.reduce((sum, campaign) => sum + (campaign.budget_estimate || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed analytics will be available once campaigns are published and data is collected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              </div>
              <p className="text-center text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMarketingPage;