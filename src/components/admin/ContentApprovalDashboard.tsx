import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle,
  BookOpen,
  Share2,
  Mail,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  FileText,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';

interface UnifiedContentItem {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  title: string;
  body_text: string;
  status: string;
  created_at: string;
  scheduled_time?: string;
  hashtags?: string[];
  seo_title?: string;
  meta_description?: string;
  keywords?: string[];
  reading_time?: number;
  seo_score?: number;
  slug?: string;
}

interface ContentApprovalDashboardProps {
  contents: UnifiedContentItem[];
  onContentUpdate: () => void;
  onContentApproval: (contentId: string, status: 'published' | 'rejected') => void;
  onPublishContent: (contentId: string) => void;
  onPreviewContent: (content: UnifiedContentItem) => void;
}

export const ContentApprovalDashboard: React.FC<ContentApprovalDashboardProps> = ({
  contents,
  onContentUpdate,
  onContentApproval,
  onPublishContent,
  onPreviewContent,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<UnifiedContentItem | null>(null);
  const [editedContent, setEditedContent] = useState<Partial<UnifiedContentItem>>({});
  const [deleting, setDeleting] = useState(false);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.body_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.seo_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || content.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleEditContent = async () => {
    if (!selectedContent) return;

    try {
      const { error } = await supabase
        .from('marketing_content')
        .update({
          title: editedContent.title || selectedContent.title,
          body_text: editedContent.body_text || selectedContent.body_text,
          seo_title: editedContent.seo_title || selectedContent.seo_title,
          meta_description: editedContent.meta_description || selectedContent.meta_description,
          hashtags: editedContent.hashtags || selectedContent.hashtags,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast({
        title: "Content Updated",
        description: "Content has been successfully updated",
      });

      setEditModalOpen(false);
      setSelectedContent(null);
      setEditedContent({});
      onContentUpdate();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedContent) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('marketing_content')
        .delete()
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast({
        title: "Content Deleted",
        description: "Content has been permanently deleted",
      });

      setDeleteModalOpen(false);
      setSelectedContent(null);
      onContentUpdate();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (content: UnifiedContentItem) => {
    setSelectedContent(content);
    setEditedContent({
      title: content.title,
      body_text: content.body_text,
      seo_title: content.seo_title,
      meta_description: content.meta_description,
      hashtags: content.hashtags
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (content: UnifiedContentItem) => {
    setSelectedContent(content);
    setDeleteModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      draft: "secondary",
      pending_review: "outline",
      rejected: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Content Approval Dashboard
          </h2>
          <p className="text-muted-foreground">
            Review, edit, and manage all AI-generated content across platforms
          </p>
        </div>
        <Button onClick={onContentUpdate} variant="outline" className="hover-scale">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-gradient-to-r from-background/50 to-muted/50 border-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Search Content</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search title, content, or SEO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80 border-primary/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/80 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">📝 Draft</SelectItem>
                  <SelectItem value="pending_review">⏳ Pending Review</SelectItem>
                  <SelectItem value="published">✅ Published</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="bg-background/80 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="Blog">📝 Blog</SelectItem>
                  <SelectItem value="Email">📧 Email</SelectItem>
                  <SelectItem value="Facebook">👥 Facebook</SelectItem>
                  <SelectItem value="Instagram">📸 Instagram</SelectItem>
                  <SelectItem value="Twitter">🐦 Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Quick Stats</label>
              <div className="text-2xl font-bold text-primary">
                {filteredContents.length} / {contents.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredContents.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-24 w-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-primary/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No content found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
                    ? 'Try adjusting your filters to see more content.'
                    : 'Generate content using the Command Center to get started.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContents.map((content, index) => (
            <Card 
              key={content.id} 
              className="border-l-4 border-l-primary/30 hover:border-l-primary hover:shadow-lg transition-all duration-300 animate-fade-in bg-gradient-to-r from-background to-muted/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {content.platform === 'Blog' ? (
                        <BookOpen className="h-4 w-4 text-orange-600" />
                      ) : content.platform === 'Email' ? (
                        <Mail className="h-4 w-4 text-green-600" />
                      ) : (
                        <Share2 className="h-4 w-4 text-blue-600" />
                      )}
                      <Badge variant="outline" className="font-medium">
                        {content.platform}
                      </Badge>
                      {getStatusBadge(content.status)}
                      <Badge variant="secondary" className="text-xs">
                        {content.content_type}
                      </Badge>
                      {content.reading_time && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {content.reading_time}m read
                        </Badge>
                      )}
                      {content.seo_score && (
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          SEO: {content.seo_score}%
                        </Badge>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        {content.seo_title || content.title || 'Untitled Content'}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {content.meta_description || content.body_text?.substring(0, 150) + '...'}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(content.created_at)}
                      </span>
                      {content.scheduled_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled: {formatDate(content.scheduled_time)}
                        </span>
                      )}
                      {content.hashtags && content.hashtags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {content.hashtags.length} hashtags
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPreviewContent(content)}
                      className="hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(content)}
                      className="hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {(content.status === 'draft' || content.status === 'pending_review') && (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => onContentApproval(content.id, 'published')}
                          className="hover:bg-green-600 hover:text-white transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => onPublishContent(content.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Publish Live
                        </Button>
                      </>
                    )}

                    {content.status === 'published' && content.platform === 'Blog' && content.slug && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${content.slug}`, '_blank')}
                        className="hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        View Live
                      </Button>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteModal(content)}
                      className="hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Content
            </DialogTitle>
            <DialogDescription>
              Make changes to your content. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedContent.title || ''}
                onChange={(e) => setEditedContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Content title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Title</label>
              <Input
                value={editedContent.seo_title || ''}
                onChange={(e) => setEditedContent(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO optimized title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea
                value={editedContent.meta_description || ''}
                onChange={(e) => setEditedContent(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Brief description for SEO"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={editedContent.body_text || ''}
                onChange={(e) => setEditedContent(prev => ({ ...prev, body_text: e.target.value }))}
                placeholder="Main content"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hashtags (comma separated)</label>
              <Input
                value={editedContent.hashtags?.join(', ') || ''}
                onChange={(e) => setEditedContent(prev => ({ 
                  ...prev, 
                  hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="#marketing, #ai, #content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditContent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Content
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedContent?.title || 'this content'}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent} disabled={deleting}>
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};