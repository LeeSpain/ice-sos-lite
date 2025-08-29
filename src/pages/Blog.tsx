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
      
      {/* Hero Section with Background */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background pt-24 pb-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-primary px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg">
              <BookOpen className="h-4 w-4" />
              Safety & Emergency Response Blog
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Safety Insights &<br />
              <span className="text-primary">Expert Guidance</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stay informed with the latest safety tips, emergency response guidance, and family protection insights from our safety experts.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl -m-1"></div>
              <div className="relative bg-white rounded-lg shadow-xl">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles, tips, and guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-0 focus:ring-2 focus:ring-primary/20 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-20">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Article</h2>
            </div>
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-primary/5">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  <div className="lg:col-span-2 p-10">
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 text-sm">
                        Featured
                      </Badge>
                      {featuredPost.reading_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4" />
                          {featuredPost.reading_time} min read
                        </div>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold mb-6 text-foreground leading-tight">
                      {featuredPost.seo_title || featuredPost.title || 'Untitled Post'}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                      {featuredPost.meta_description || getExcerpt(featuredPost.body_text || '', 200)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPost.created_at)}
                      </div>
                      <Button size="lg" className="group">
                        Read Full Article
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                        <BookOpen className="h-12 w-12 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        AI-Generated Safety Content
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Powered by Riven AI
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <section className="space-y-10">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-3xl font-bold">
                {searchTerm ? `Search Results` : 'Latest Articles'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                </div>
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(featuredPost ? 1 : 0).map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          Blog
                        </Badge>
                        {post.seo_score && post.seo_score >= 80 && (
                          <Badge className="bg-green-500/10 text-green-700 border-green-200">
                            SEO Optimized
                          </Badge>
                        )}
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          {post.reading_time}m
                        </div>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-lg leading-tight">
                      {post.seo_title || post.title || 'Untitled Post'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {post.meta_description || getExcerpt(post.body_text || '')}
                    </p>
                    
                    {post.keywords && post.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-secondary/50">
                            <Tag className="h-3 w-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-primary text-xs px-0">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          /* Enhanced Empty State */
          <section className="py-20">
            <Card className="text-center border-0 shadow-xl bg-gradient-to-br from-muted/50 to-background">
              <CardContent className="py-20">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {searchTerm ? 'No articles found' : 'Coming Soon'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? `No articles match "${searchTerm}". Try adjusting your search terms or browse our upcoming content.`
                    : 'Our AI-powered content creation system is preparing comprehensive safety and emergency response articles for you.'
                  }
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    <Search className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Enhanced AI Info Section */}
        <section className="mt-20">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6">AI-Powered Safety Content</h3>
                <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                  Our blog articles are created by Riven, our advanced AI marketing assistant, to provide you with 
                  the latest insights on emergency response, family safety, and protection technology. All content 
                  is automatically optimized for SEO and readability.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center gap-3 p-6 bg-white/60 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="font-semibold">Expert Content</span>
                    <span className="text-sm text-muted-foreground text-center">Researched and verified safety information</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 bg-white/60 rounded-xl">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="font-semibold">SEO Optimized</span>
                    <span className="text-sm text-muted-foreground text-center">Maximum visibility and reach</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 bg-white/60 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="font-semibold">Regular Updates</span>
                    <span className="text-sm text-muted-foreground text-center">Fresh content added continuously</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;