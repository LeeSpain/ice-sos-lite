import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Wand2,
  Image,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  Zap,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Target,
  Users,
  Globe
} from 'lucide-react';

interface ContentPipelineProps {
  campaignId?: string;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: string;
  contentType: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  imageUrl?: string;
  hashtags: string[];
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    reach: number;
  };
}

interface GenerationRequest {
  contentType: string;
  platform: string;
  targetAudience: string;
  tone: string;
  keywords: string[];
  wordCount: number;
  includeImage: boolean;
  urgency: string;
  additionalInstructions: string;
}

export const ContentGenerationPipeline: React.FC<ContentPipelineProps> = ({ campaignId }) => {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('generate');
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest>({
    contentType: 'social_post',
    platform: 'facebook',
    targetAudience: 'family_safety',
    tone: 'professional',
    keywords: ['family safety', 'emergency preparedness'],
    wordCount: 150,
    includeImage: true,
    urgency: 'normal',
    additionalInstructions: ''
  });

  const contentTypes = [
    { value: 'social_post', label: 'Social Media Post', description: 'Engaging posts for social platforms' },
    { value: 'blog_post', label: 'Blog Article', description: 'Long-form educational content' },
    { value: 'email_campaign', label: 'Email Campaign', description: 'Marketing emails and newsletters' },
    { value: 'video_script', label: 'Video Script', description: 'Scripts for video content' }
  ];

  const platforms = [
    { value: 'facebook', label: 'Facebook', color: '#1877F2' },
    { value: 'instagram', label: 'Instagram', color: '#E4405F' },
    { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
    { value: 'blog', label: 'Blog', color: '#10B981' },
    { value: 'email', label: 'Email', color: '#059669' }
  ];

  const audiences = [
    { value: 'family_safety', label: 'Family Safety', description: 'Parents concerned about family security' },
    { value: 'seniors', label: 'Senior Citizens', description: 'Elderly individuals and caregivers' },
    { value: 'young_families', label: 'Young Families', description: 'Families with young children' },
    { value: 'business', label: 'Business Users', description: 'Companies needing security solutions' },
    { value: 'travelers', label: 'Travelers', description: 'People who travel frequently' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'educational', label: 'Educational' },
    { value: 'caring', label: 'Caring' },
    { value: 'authoritative', label: 'Authoritative' }
  ];

  useEffect(() => {
    loadContentItems();
  }, [campaignId]);

  const loadContentItems = async () => {
    try {
      const query = supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignId) {
        query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const items: ContentItem[] = data?.map(item => ({
        id: item.id,
        title: item.title || 'Untitled',
        body: item.body_text || '',
        platform: item.platform,
        contentType: item.content_type,
        status: item.status as ContentItem['status'],
        scheduledTime: item.scheduled_time,
        imageUrl: item.image_url,
        hashtags: item.hashtags || [],
        engagement: item.engagement_metrics ? {
          likes: (item.engagement_metrics as any)?.likes || 0,
          shares: (item.engagement_metrics as any)?.shares || 0,
          comments: (item.engagement_metrics as any)?.comments || 0,
          reach: (item.engagement_metrics as any)?.reach || 0
        } : undefined
      })) || [];

      setContentItems(items);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: "Error",
        description: "Failed to load content items",
        variant: "destructive"
      });
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-generator', {
        body: {
          ...generationRequest,
          campaignId: campaignId || 'default'
        }
      });

      if (error) throw error;

      toast({
        title: "Content Generated!",
        description: "New content has been created successfully",
      });

      loadContentItems();
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const scheduleContent = async (contentId: string, scheduledTime: string, platform: string) => {
    try {
      const { error } = await supabase.functions.invoke('content-scheduler', {
        body: {
          action: 'schedule',
          contentId,
          scheduledTime,
          platform
        }
      });

      if (error) throw error;

      toast({
        title: "Content Scheduled",
        description: "Content has been scheduled for posting",
      });

      loadContentItems();
    } catch (error) {
      console.error('Error scheduling content:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule content",
        variant: "destructive"
      });
    }
  };

  const duplicateContent = async (contentId: string) => {
    try {
      const original = contentItems.find(item => item.id === contentId);
      if (!original) return;

      const { data, error } = await supabase
        .from('marketing_content')
        .insert({
          campaign_id: campaignId,
          title: `${original.title} (Copy)`,
          body_text: original.body,
          platform: original.platform,
          content_type: original.contentType,
          hashtags: original.hashtags,
          image_url: original.imageUrl,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Content Duplicated",
        description: "Content has been copied successfully",
      });

      loadContentItems();
    } catch (error) {
      console.error('Error duplicating content:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate content",
        variant: "destructive"
      });
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Content Deleted",
        description: "Content has been removed",
      });

      loadContentItems();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Content Generation Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="content">Content Library</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Type & Platform */}
                <div className="space-y-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select 
                      value={generationRequest.contentType} 
                      onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, contentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Platform</Label>
                    <Select 
                      value={generationRequest.platform} 
                      onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, platform: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: platform.color }}
                              />
                              {platform.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Select 
                      value={generationRequest.targetAudience} 
                      onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audiences.map(audience => (
                          <SelectItem key={audience.value} value={audience.value}>
                            <div>
                              <div className="font-medium">{audience.label}</div>
                              <div className="text-sm text-muted-foreground">{audience.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tone</Label>
                    <Select 
                      value={generationRequest.tone} 
                      onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map(tone => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label>Keywords (comma separated)</Label>
                    <Input
                      value={generationRequest.keywords.join(', ')}
                      onChange={(e) => setGenerationRequest(prev => ({ 
                        ...prev, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      }))}
                      placeholder="family safety, emergency preparedness"
                    />
                  </div>

                  <div>
                    <Label>Word Count: {generationRequest.wordCount}</Label>
                    <input
                      type="range"
                      min="50"
                      max="2000"
                      value={generationRequest.wordCount}
                      onChange={(e) => setGenerationRequest(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50</span>
                      <span>2000</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={generationRequest.includeImage}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, includeImage: e.target.checked }))}
                      />
                      <Image className="h-4 w-4" />
                      Generate Image
                    </label>
                  </div>

                  <div>
                    <Label>Additional Instructions</Label>
                    <Textarea
                      value={generationRequest.additionalInstructions}
                      onChange={(e) => setGenerationRequest(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      placeholder="Any specific requirements or style guidelines..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={generateContent} 
                  disabled={isGenerating}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Content Library ({contentItems.length})</h3>
                <Button onClick={loadContentItems} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentItems.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.contentType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.platform}
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.body}
                      </p>

                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}

                      {item.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-blue-600">
                              #{tag}
                            </span>
                          ))}
                          {item.hashtags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {item.engagement && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">{item.engagement.likes}</div>
                            <div className="text-muted-foreground">Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{item.engagement.shares}</div>
                            <div className="text-muted-foreground">Shares</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{item.engagement.reach}</div>
                            <div className="text-muted-foreground">Reach</div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => duplicateContent(item.id)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteContent(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {item.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Content Scheduler</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your content for optimal posting times
                </p>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  Open Scheduler
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{contentItems.length}</div>
                    <div className="text-sm text-muted-foreground">Total Content</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">
                      {contentItems.filter(item => item.status === 'published').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">
                      {contentItems.filter(item => item.status === 'scheduled').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Scheduled</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">
                      {contentItems.filter(item => item.status === 'failed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};