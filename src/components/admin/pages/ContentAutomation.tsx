import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Send, 
  Pause, 
  Play, 
  BarChart3,
  Image,
  FileText,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ABTest {
  id: string;
  campaign_id: string;
  test_name: string;
  variant_a_content_id: string;
  variant_b_content_id: string;
  traffic_split: number;
  status: string;
  winner_variant: string;
  confidence_level: number;
  statistical_significance: boolean;
  started_at: string;
  ended_at?: string;
}

interface QueueItem {
  id: string;
  content_id: string;
  platform: string;
  scheduled_time: string;
  status: string;
  retry_count: number;
  error_message?: string;
  platform_post_id?: string;
  posted_at?: string;
}

interface ContentGeneration {
  id: string;
  campaign_id: string;
  content_type: string;
  platform: string;
  prompt: string;
  status: string;
  generated_content?: string;
  generated_image_url?: string;
  error_message?: string;
  created_at: string;
}

export function ContentAutomation() {
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [generations, setGenerations] = useState<ContentGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadABTests(),
        loadQueueItems(),
        loadGenerations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadABTests = async () => {
    try {
      const { data, error } = await supabase
        .from('content_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAbTests(data || []);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    }
  };

  const loadQueueItems = async () => {
    try {
      const { data, error } = await supabase
        .from('posting_queue')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error loading queue items:', error);
    }
  };

  const loadGenerations = async () => {
    try {
      const { data, error } = await supabase
        .from('content_generation_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error loading generations:', error);
    }
  };

  const generateImage = async (prompt: string, contentId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing', {
        body: {
          action: 'generate_image',
          prompt,
          contentId
        }
      });

      if (error) throw error;

      toast.success('Image generation started');
      await loadGenerations();
      
      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    }
  };

  const publishContent = async (contentId: string, platforms: string[], scheduledTime?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('content-publisher', {
        body: {
          action: scheduledTime ? 'schedule' : 'publish',
          contentId,
          platforms,
          scheduledTime
        }
      });

      if (error) throw error;

      toast.success(scheduledTime ? 'Content scheduled successfully' : 'Content published successfully');
      await loadQueueItems();
      
      return data;
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    }
  };

  const processQueue = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('content-publisher', {
        body: { action: 'process_queue' }
      });

      if (error) throw error;

      toast.success(`Processed ${data.processed} items from queue`);
      await loadQueueItems();
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Failed to process publishing queue');
    }
  };

  const createABTest = async (campaignId: string, testName: string, variantAId: string, variantBId: string) => {
    try {
      const { error } = await supabase
        .from('content_ab_tests')
        .insert({
          campaign_id: campaignId,
          test_name: testName,
          variant_a_content_id: variantAId,
          variant_b_content_id: variantBId,
          traffic_split: 50,
          status: 'running'
        });

      if (error) throw error;

      toast.success('A/B test created successfully');
      await loadABTests();
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast.error('Failed to create A/B test');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'published':
        return 'bg-success text-success-foreground';
      case 'processing':
      case 'running':
        return 'bg-warning text-warning-foreground';
      case 'failed':
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'scheduled':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Automation</h2>
          <p className="text-muted-foreground">
            Manage automated publishing, A/B testing, and content generation
          </p>
        </div>
        <Button onClick={processQueue} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Process Queue
        </Button>
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue">Publishing Queue</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
          <TabsTrigger value="generation">Content Generation</TabsTrigger>
          <TabsTrigger value="automation">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <div className="grid gap-4">
            {queueItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scheduled posts</h3>
                  <p className="text-muted-foreground">
                    Create campaigns and schedule content to see items here
                  </p>
                </CardContent>
              </Card>
            ) : (
              queueItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base capitalize">{item.platform}</CardTitle>
                      <CardDescription>
                        Scheduled: {new Date(item.scheduled_time).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {item.posted_at && (
                        <div className="text-sm text-muted-foreground">
                          Posted: {new Date(item.posted_at).toLocaleString()}
                        </div>
                      )}
                      
                      {item.error_message && (
                        <div className="text-sm text-destructive">
                          Error: {item.error_message}
                        </div>
                      )}
                      
                      {item.retry_count > 0 && (
                        <div className="text-sm text-warning">
                          Retries: {item.retry_count}
                        </div>
                      )}

                      {item.platform_post_id && (
                        <div className="text-sm text-success">
                          Post ID: {item.platform_post_id}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-6">
          <div className="grid gap-4">
            {abTests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No A/B tests</h3>
                  <p className="text-muted-foreground">
                    Create A/B tests to optimize your content performance
                  </p>
                </CardContent>
              </Card>
            ) : (
              abTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{test.test_name}</CardTitle>
                      <CardDescription>
                        Started: {new Date(test.started_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {test.statistical_significance && (
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Significant
                        </Badge>
                      )}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-sm font-medium">Variant A</div>
                          <div className="text-xs text-muted-foreground">
                            {test.traffic_split}% traffic
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-sm font-medium">Variant B</div>
                          <div className="text-xs text-muted-foreground">
                            {100 - test.traffic_split}% traffic
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Level</span>
                          <span>{test.confidence_level}%</span>
                        </div>
                        <Progress value={test.confidence_level} className="h-2" />
                      </div>

                      {test.winner_variant && (
                        <div className="p-3 bg-success/10 rounded border border-success/20">
                          <div className="text-sm font-medium text-success">
                            Winner: Variant {test.winner_variant.toUpperCase()}
                          </div>
                        </div>
                      )}

                      {test.ended_at && (
                        <div className="text-sm text-muted-foreground">
                          Ended: {new Date(test.ended_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Content</CardTitle>
                <CardDescription>
                  Use AI to generate images and text for your marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-prompt">Image Generation Prompt</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="Describe the image you want to generate..."
                      className="min-h-20"
                    />
                  </div>
                  <Button onClick={() => generateImage('Sample prompt')}>
                    <Image className="h-4 w-4 mr-2" />
                    Generate Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {generations.map((gen) => (
                <Card key={gen.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      {gen.content_type === 'image' ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <div>
                        <CardTitle className="text-base capitalize">
                          {gen.content_type} Generation
                        </CardTitle>
                        <CardDescription className="capitalize">
                          Platform: {gen.platform}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(gen.status)}>
                      {gen.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Prompt:</span>
                        <p className="mt-1">{gen.prompt}</p>
                      </div>

                      {gen.generated_image_url && (
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Generated Image:</span>
                          <img 
                            src={gen.generated_image_url} 
                            alt="Generated content"
                            className="w-full max-w-sm rounded border"
                          />
                        </div>
                      )}

                      {gen.generated_content && (
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Generated Content:</span>
                          <p className="text-sm p-3 bg-muted rounded">{gen.generated_content}</p>
                        </div>
                      )}

                      {gen.error_message && (
                        <div className="text-sm text-destructive">
                          Error: {gen.error_message}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(gen.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Settings</CardTitle>
                <CardDescription>
                  Configure automated publishing and scheduling preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-publish">Auto-publish approved content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically publish content that passes moderation
                    </p>
                  </div>
                  <Switch id="auto-publish" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optimal-times">Optimal posting times</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9:00 AM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                      <SelectItem value="evening">Evening (7:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>A/B Testing Settings</CardTitle>
                <CardDescription>
                  Configure A/B testing parameters and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="significance-threshold">Statistical significance threshold</Label>
                  <Input
                    id="significance-threshold"
                    type="number"
                    placeholder="95"
                    min="50"
                    max="99"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum confidence level required to declare a winner
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-duration">Minimum test duration (days)</Label>
                  <Input
                    id="test-duration"
                    type="number"
                    placeholder="7"
                    min="1"
                    max="30"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ContentAutomation;