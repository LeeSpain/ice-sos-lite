import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Blog | Safety & Emergency Response Insights"
        description="Stay informed with the latest safety tips, emergency response guidance, and family protection insights."
        keywords={['safety blog', 'emergency response', 'family safety', 'protection tips']}
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-section">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-6">Blog</h1>
          <p className="text-muted-foreground text-lg">
            This page has been cleared and ready for new content.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;