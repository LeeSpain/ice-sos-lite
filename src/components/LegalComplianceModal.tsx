import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, AlertTriangle, Stethoscope } from "lucide-react";

const LegalComplianceModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const legalPages = [
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: Shield,
      url: "/privacy-policy.html"
    },
    {
      id: "terms",
      title: "Terms of Service", 
      icon: FileText,
      url: "/terms-of-service.html"
    },
    {
      id: "emergency",
      title: "Emergency Liability",
      icon: AlertTriangle,
      url: "/emergency-liability.html"
    },
    {
      id: "medical",
      title: "Medical Compliance",
      icon: Stethoscope,
      url: "/medical-data-compliance.html"
    }
  ];

  const [selectedPage, setSelectedPage] = useState(legalPages[0].id);
  const [pageContent, setPageContent] = useState<{[key: string]: string}>({});

  const loadPageContent = async (url: string, pageId: string) => {
    if (pageContent[pageId]) return; // Already loaded

    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract content from HTML (remove head, scripts, etc.)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.body;
      
      if (body) {
        // Remove any script tags and style tags
        const scripts = body.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        setPageContent(prev => ({
          ...prev,
          [pageId]: body.innerHTML
        }));
      }
    } catch (error) {
      console.error('Failed to load page content:', error);
      setPageContent(prev => ({
        ...prev,
        [pageId]: `<p>Sorry, we couldn't load this content. You can <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline">view it directly here</a>.</p>`
      }));
    }
  };

  const handleTabChange = (pageId: string) => {
    setSelectedPage(pageId);
    const page = legalPages.find(p => p.id === pageId);
    if (page && !pageContent[pageId]) {
      loadPageContent(page.url, pageId);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !pageContent[selectedPage]) {
      const page = legalPages.find(p => p.id === selectedPage);
      if (page) {
        loadPageContent(page.url, selectedPage);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="block text-sm text-muted-foreground hover:text-primary transition-colors text-left">
          Legal & Compliance
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Legal & Compliance Documents
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={selectedPage} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            {legalPages.map((page) => {
              const Icon = page.icon;
              return (
                <TabsTrigger 
                  key={page.id} 
                  value={page.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{page.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {legalPages.map((page) => (
            <TabsContent key={page.id} value={page.id} className="flex-1 mt-4">
              <ScrollArea className="h-full w-full rounded-md border p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="flex items-center gap-2 mb-4">
                    <page.icon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{page.title}</h2>
                  </div>
                  
                  {pageContent[page.id] ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: pageContent[page.id] }}
                      className="text-sm text-muted-foreground leading-relaxed"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading content...</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            These documents outline our commitment to your privacy, security, and compliance with applicable regulations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegalComplianceModal;