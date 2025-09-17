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
      // First attempt: direct match on slug or fuzzy match on title (hyphens -> spaces)
      const titlePattern = slug?.replace(/-/g, ' ');
      const { data: posts, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('platform', 'blog')
        .eq('status', 'published')
        .or(`slug.eq.${slug},title.ilike.%${titlePattern}%`);

      if (error) throw error;

      let post = posts && posts.length > 0
        ? posts.find((p: any) => p.slug === slug) || posts[0]
        : null;

      // Fallback: no direct DB slug and the title match failed due to punctuation
      if (!post) {
        const { data: allPosts, error: allErr } = await supabase
          .from('marketing_content')
          .select('*')
          .eq('platform', 'blog')
          .eq('status', 'published');
        if (allErr) throw allErr;

        // Normalize titles the same way we build URLs in Blog.tsx
        post = (allPosts || []).find((p: any) => {
          const derived = (p.title || '')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          return derived === slug;
        }) || null;
      }

      if (!post) {
        setNotFound(true);
        return;
      }

      const mapped: BlogPost = {
        id: post.id,
        title: post.title,
        body_text: post.body_text,
        slug: post.slug || (post.title ? post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''),
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

      setBlogPost(mapped);
      setNotFound(false);
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
      
      {/* Professional Article Layout */}
      <div className="bg-white dark:bg-background">
        {/* Article Header Section */}
        <header className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-background border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              {/* Navigation Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <button 
                  onClick={() => navigate('/blog')}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Blog
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">Article</span>
              </nav>

              {/* Article Category & Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge className="bg-primary text-primary-foreground font-semibold tracking-wide">
                  EMERGENCY SAFETY
                </Badge>
                {blogPost.reading_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{blogPost.reading_time} MIN READ</span>
                  </div>
                )}
                {blogPost.seo_score && blogPost.seo_score >= 80 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300">
                    <Star className="h-3 w-3 mr-1" />
                    VERIFIED
                  </Badge>
                )}
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-8 text-slate-900 dark:text-slate-100">
                {blogPost.seo_title || blogPost.title || 'Untitled Article'}
              </h1>

              {/* Subheadline */}
              {blogPost.meta_description && (
                <p className="text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 mb-8 font-light">
                  {blogPost.meta_description}
                </p>
              )}

              {/* Byline & Publication Info */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Riven AI</div>
                      <div className="text-sm text-muted-foreground">Senior Safety Analyst</div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(blogPost.created_at)}</span>
                    </div>
                    <div className="text-xs opacity-75">ICE Emergency Solutions</div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleShare} className="bg-white dark:bg-background">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image Section */}
        {blogPost.image_url && (
          <section className="py-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <figure>
                  <img 
                    src={blogPost.image_url} 
                    alt={blogPost.featured_image_alt || blogPost.title || 'Article featured image'}
                    className="w-full h-auto rounded-xl shadow-2xl"
                  />
                  {blogPost.featured_image_alt && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-4 italic">
                      {blogPost.featured_image_alt}
                    </figcaption>
                  )}
                </figure>
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <article className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Article Body */}
              <div className="prose prose-xl max-w-none prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300">
                {blogPost.body_text ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: blogPost.body_text }}
                  />
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground italic text-lg">Article content is currently being prepared...</p>
                  </div>
                )}
              </div>

              {/* Article Tags */}
              {blogPost.keywords && blogPost.keywords.length > 0 && (
                <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Related Topics</h3>
                  <div className="flex flex-wrap gap-3">
                    {blogPost.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Tag className="h-3 w-3 mr-2" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </footer>
              )}

              {/* AI Attribution */}
              <div className="mt-16">
                <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Star className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">AI-Generated Content</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          This comprehensive article was authored by <strong>Riven AI</strong>, our advanced artificial intelligence 
                          system specialized in emergency response protocols, family safety strategies, and cutting-edge protection 
                          technology. Every insight is backed by the latest research and industry best practices.
                        </p>
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            <strong>Reviewed by:</strong> ICE Emergency Solutions Editorial Team
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Article Navigation */}
              <nav className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/blog')}
                    className="w-full sm:w-auto bg-white dark:bg-background hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Browse All Articles
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      onClick={handleShare}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Article
                    </Button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPost;