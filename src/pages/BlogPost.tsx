import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Calendar, 
  ArrowLeft,
  Tag,
  User,
  Share2,
  BookOpen,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface BlogPost {
  id: string;
  title: string | null;
  body_text: string | null;
  slug: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  keywords?: string[] | null;
  featured_image_alt?: string | null;
  reading_time?: number | null;
  seo_score?: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  image_url?: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('platform', 'Blog')
        .eq('status', 'published')
        .or(`slug.eq.${slug},title.ilike.%${slug?.replace(/-/g, ' ')}%`);

      if (error) throw error;

      if (!posts || posts.length === 0) {
        setNotFound(true);
        return;
      }

      // Find exact slug match first, then fallback to title match
      const post = posts.find(p => p.slug === slug) || posts[0];

      const blogPost: BlogPost = {
        id: post.id,
        title: post.title,
        body_text: post.body_text,
        slug: post.slug || (post.title ? post.title.toLowerCase().replace(/\s+/g, '-') : ''),
        seo_title: post.seo_title,
        meta_description: post.meta_description,
        keywords: post.keywords,
        featured_image_alt: post.featured_image_alt,
        reading_time: post.reading_time,
        seo_score: post.seo_score,
        created_at: post.created_at,
        updated_at: post.updated_at,
        status: post.status,
        image_url: post.image_url
      };

      setBlogPost(blogPost);
    } catch (error) {
      console.error('Error loading blog post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      });
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = blogPost?.seo_title || blogPost?.title || 'Blog Post';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !blogPost) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Blog Post Not Found"
          description="The requested blog post could not be found."
        />
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-20">
              <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The blog post you're looking for doesn't exist or has been moved.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/blog')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
                <Button onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={blogPost.seo_title || blogPost.title || 'Blog Post'}
        description={blogPost.meta_description || 'Read our latest blog post on safety and emergency response.'}
        keywords={blogPost.keywords || ['blog', 'safety', 'emergency response']}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blogPost.seo_title || blogPost.title,
          "description": blogPost.meta_description,
          "datePublished": blogPost.created_at,
          "dateModified": blogPost.updated_at,
          "author": {
            "@type": "Organization",
            "name": "Riven AI"
          },
          "publisher": {
            "@type": "Organization",
            "name": "ICE Emergency Solutions"
          }
        }}
      />
      
      <Navigation />
      
      {/* Article Header */}
      <article className="container mx-auto px-4 py-section">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Article Metadata */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white">
                Blog Article
              </Badge>
              {blogPost.seo_score && blogPost.seo_score >= 80 && (
                <Badge className="bg-green-500/10 text-green-700 border-green-200">
                  <Star className="h-3 w-3 mr-1" />
                  SEO Optimized
                </Badge>
              )}
              {blogPost.reading_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  {blogPost.reading_time} min read
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {blogPost.seo_title || blogPost.title || 'Untitled Post'}
            </h1>

            {blogPost.meta_description && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {blogPost.meta_description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Riven AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blogPost.created_at)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          {blogPost.image_url && (
            <div className="mb-12">
              <img 
                src={blogPost.image_url} 
                alt={blogPost.featured_image_alt || blogPost.title || 'Blog post image'}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            {blogPost.body_text ? (
              <div 
                dangerouslySetInnerHTML={{ __html: blogPost.body_text }}
                className="text-foreground leading-relaxed"
              />
            ) : (
              <p className="text-muted-foreground italic">No content available for this post.</p>
            )}
          </div>

          {/* Keywords */}
          {blogPost.keywords && blogPost.keywords.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Attribution */}
          <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Generated Content</h3>
              <p className="text-muted-foreground text-sm">
                This article was created by Riven, our advanced AI marketing assistant, to provide you with 
                the latest insights on emergency response, family safety, and protection technology.
              </p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            <Button variant="outline" onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              More Articles
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogPost;