import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon,
  Clock,
  Send,
  Share2,
  Mail,
  FileText,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Loader2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentApprovalItem {
  id: string;
  title: string;
  body_text?: string;
  platform: string;
  status: string;
  created_at: string;
  image_url?: string;
  seo_title?: string;
  meta_description?: string;
  hashtags?: string[];
  content_sections?: any;
}

interface EnhancedContentApprovalProps {
  contents: ContentApprovalItem[];
  onContentUpdate: () => void;
  onContentApproval: (contentId: string) => void;
  onPublishContent: (contentId: string, options?: any) => void;
  onDeleteContent: (contentId: string) => void;
  onEditContent: (contentId: string) => void;
  isLoading?: boolean;
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  blog: FileText,
  email: Mail
};

const platformColors = {
  facebook: '#1877F2',
  twitter: '#1DA1F2', 
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  blog: '#6B7280',
  email: '#10B981'
};

export const EnhancedContentApproval: React.FC<EnhancedContentApprovalProps> = ({
  contents,
  onContentUpdate,
  onContentApproval,
  onPublishContent,
  onDeleteContent,
  onEditContent,
  isLoading
}) => {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<ContentApprovalItem | null>(null);
  const [publishOptions, setPublishOptions] = useState({
    platforms: [] as string[],
    publishType: 'social' as 'social' | 'blog' | 'email' | 'all',
    scheduleDate: undefined as Date | undefined,
    scheduleTime: '09:00',
    emailSubject: '',
    emailSegments: ['all'] as string[]
  });
  const [publishing, setPublishing] = useState<string | null>(null);

  const approvedContents = contents.filter(c => c.status === 'approved');
  const draftContents = contents.filter(c => c.status === 'draft');

  const handlePublish = async (content: ContentApprovalItem, immediate = false) => {
    if (!immediate && !publishOptions.scheduleDate) {
      toast({
        title: "Schedule Required",
        description: "Please select a date and time for publishing",
        variant: "destructive"
      });
      return;
    }

    setPublishing(content.id);
    
    try {
      const scheduledTime = immediate ? undefined : 
        publishOptions.scheduleDate ? 
          new Date(`${format(publishOptions.scheduleDate, 'yyyy-MM-dd')}T${publishOptions.scheduleTime}:00`).toISOString() :
          undefined;

      await onPublishContent(content.id, {
        platforms: publishOptions.platforms,
        publishType: publishOptions.publishType,
        scheduledTime,
        campaignData: {
          subject: publishOptions.emailSubject || content.title,
          segments: publishOptions.emailSegments
        }
      });

      setSelectedContent(null);
      setPublishOptions({
        platforms: [],
        publishType: 'social',
        scheduleDate: undefined,
        scheduleTime: '09:00',
        emailSubject: '',
        emailSegments: ['all']
      });
    } catch (error) {
      console.error('Publishing error:', error);
    } finally {
      setPublishing(null);
    }
  };

  const renderContentCard = (content: ContentApprovalItem) => {
    const PlatformIcon = platformIcons[content.platform] || Globe;
    const platformColor = platformColors[content.platform] || '#6B7280';

    return (
      <Card key={content.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <PlatformIcon 
                className="h-5 w-5" 
                style={{ color: platformColor }}
              />
              <Badge variant={content.status === 'approved' ? 'default' : 'secondary'}>
                {content.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContent(content)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditContent(content.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteContent(content.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg">{content.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {content.body_text?.substring(0, 150)}...
          </p>
          
          {content.image_url && (
            <img 
              src={content.image_url} 
              alt={content.title}
              className="w-full h-32 object-cover rounded-md mb-4"
            />
          )}

          {content.hashtags && content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {content.hashtags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {content.hashtags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{content.hashtags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {format(new Date(content.created_at), 'MMM dd, yyyy')}
            </span>
            
            {content.status === 'approved' && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handlePublish(content, true)}
                  disabled={publishing === content.id}
                >
                  {publishing === content.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Publish Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedContent(content)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            )}
            
            {content.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => onContentApproval(content.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading content...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Content Approval & Publishing</h2>
        <p className="text-muted-foreground">
          Review, approve, and publish content across multiple platforms
        </p>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved">
            Approved ({approvedContents.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Pending Approval ({draftContents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          {approvedContents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No approved content ready for publishing</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedContents.map(renderContentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftContents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No content pending approval</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {draftContents.map(renderContentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Publishing Options Dialog */}
      {selectedContent && (
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Publish: {selectedContent.title}</DialogTitle>
            </DialogHeader>
            
            <Tabs value={publishOptions.publishType} onValueChange={(value: any) => 
              setPublishOptions(prev => ({ ...prev, publishType: value }))
            }>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="all">All Platforms</TabsTrigger>
              </TabsList>

              <TabsContent value="social" className="space-y-4">
                <div>
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['facebook', 'twitter', 'linkedin', 'instagram'].map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={publishOptions.platforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPublishOptions(prev => ({
                                ...prev,
                                platforms: [...prev.platforms, platform]
                              }));
                            } else {
                              setPublishOptions(prev => ({
                                ...prev,
                                platforms: prev.platforms.filter(p => p !== platform)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={platform} className="capitalize">
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="blog" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will publish the content as a blog post with SEO optimization.
                </p>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label htmlFor="emailSubject">Email Subject</Label>
                  <Input
                    id="emailSubject"
                    value={publishOptions.emailSubject}
                    onChange={(e) => setPublishOptions(prev => ({
                      ...prev,
                      emailSubject: e.target.value
                    }))}
                    placeholder={selectedContent.title}
                  />
                </div>
                <div>
                  <Label>Target Segments</Label>
                  <Select value={publishOptions.emailSegments[0]} onValueChange={(value) =>
                    setPublishOptions(prev => ({ ...prev, emailSegments: [value] }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscribers</SelectItem>
                      <SelectItem value="premium">Premium Subscribers</SelectItem>
                      <SelectItem value="free">Free Subscribers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will publish to blog, email subscribers, and selected social platforms.
                </p>
                <div>
                  <Label>Social Platforms</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['facebook', 'twitter', 'linkedin'].map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={`all-${platform}`}
                          checked={publishOptions.platforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPublishOptions(prev => ({
                                ...prev,
                                platforms: [...prev.platforms, platform]
                              }));
                            } else {
                              setPublishOptions(prev => ({
                                ...prev,
                                platforms: prev.platforms.filter(p => p !== platform)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`all-${platform}`} className="capitalize">
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Scheduling */}
            <div className="space-y-4">
              <Label>Schedule Publishing</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {publishOptions.scheduleDate ? 
                        format(publishOptions.scheduleDate, 'MMM dd, yyyy') : 
                        'Select date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={publishOptions.scheduleDate}
                      onSelect={(date) => setPublishOptions(prev => ({ 
                        ...prev, 
                        scheduleDate: date 
                      }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Input
                  type="time"
                  value={publishOptions.scheduleTime}
                  onChange={(e) => setPublishOptions(prev => ({
                    ...prev,
                    scheduleTime: e.target.value
                  }))}
                  className="w-32"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedContent(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handlePublish(selectedContent, true)}
                disabled={publishing === selectedContent.id}
              >
                {publishing === selectedContent.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish Now
              </Button>
              {publishOptions.scheduleDate && (
                <Button 
                  onClick={() => handlePublish(selectedContent, false)}
                  disabled={publishing === selectedContent.id}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};