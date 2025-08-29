import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  User, 
  Tag, 
  Search, 
  Calendar,
  ArrowRight,
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
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search term
    if (searchTerm.trim()) {
      const filtered = blogPosts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.body_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(blogPosts);
    }
  }, [searchTerm, blogPosts]);

  const loadBlogPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('platform', 'Blog')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const blogPosts = (posts || []).map(post => ({
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
        status: post.status
      }));

      setBlogPosts(blogPosts);
      setFilteredPosts(blogPosts);
      
      // Set the most recent post as featured
      if (blogPosts.length > 0) {
        setFeaturedPost(blogPosts[0]);
      }

    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
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

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  const getReadingTime = (content: string, wordsPerMinute: number = 200) => {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Blog | Safety & Emergency Response Insights"
        description="Stay informed with the latest safety tips, emergency response guidance, and family protection insights from our safety experts."
        keywords={['safety blog', 'emergency response', 'family safety', 'protection tips', 'safety technology']}
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Safety & Emergency Response Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Safety Insights & Expert Guidance
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stay informed with the latest safety tips, emergency response guidance, and family protection insights from our safety experts.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Featured Article</h2>
            </div>
            <Card className="overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="default" className="bg-primary">Featured</Badge>
                      {featuredPost.reading_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {featuredPost.reading_time} min read
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      {featuredPost.seo_title || featuredPost.title || 'Untitled Post'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {featuredPost.meta_description || getExcerpt(featuredPost.body_text || '', 200)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPost.created_at)}
                      </div>
                      <Button>
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">
                      AI-Generated Safety Content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {searchTerm ? `Search Results (${filteredPosts.length})` : 'Latest Articles'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(featuredPost ? 1 : 0).map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Blog</Badge>
                        {post.seo_score && post.seo_score >= 80 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            SEO Optimized
                          </Badge>
                        )}
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.reading_time}m
                        </div>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {post.seo_title || post.title || 'Untitled Post'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.meta_description || getExcerpt(post.body_text || '')}
                    </p>
                    
                    {post.keywords && post.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-primary">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-16">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No articles found' : 'No blog posts yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? `No articles match "${searchTerm}". Try adjusting your search terms.`
                  : 'Our AI-powered content creation system will automatically publish new safety and emergency response articles here.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Blog Info Section */}
        <Card className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">AI-Powered Safety Content</h3>
              <p className="text-muted-foreground mb-6">
                Our blog articles are created by Riven, our advanced AI marketing assistant, to provide you with 
                the latest insights on emergency response, family safety, and protection technology. All content 
                is automatically optimized for SEO and readability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Expert Content</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>SEO Optimized</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Regular Updates</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;