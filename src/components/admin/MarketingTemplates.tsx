import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  BookOpen,
  Heart,
  Star,
  Calendar,
  Map
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  prompt: string;
  imagePrompt?: string;
  contentType: string;
  estimatedTime: string;
  tags: string[];
}

interface MarketingTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplate?: Template;
}

const MARKETING_TEMPLATES: Template[] = [
  {
    id: 'product-promotion-sos',
    title: 'ICE SOS Features Showcase',
    description: 'Highlight key features and benefits of ICE SOS Lite',
    category: 'Product Promotion',
    icon: Shield,
    prompt: 'Create a comprehensive blog post showcasing the key features of ICE SOS Lite app. Focus on emergency contact management, real-time location sharing, family safety features, and how it helps families stay connected during emergencies. Include user testimonials and practical scenarios.',
    imagePrompt: 'Professional mobile app interface showing emergency contact screen with clean modern design, family safety theme, blue and white color scheme',
    contentType: 'blog',
    estimatedTime: '8-10 min',
    tags: ['Product Features', 'Safety Tech', 'Family Protection']
  },
  {
    id: 'safety-education-emergency',
    title: 'Emergency Preparedness Guide',
    description: 'Educational content about family emergency planning',
    category: 'Safety Education',
    icon: BookOpen,
    prompt: 'Write an educational guide on family emergency preparedness. Cover creating emergency plans, building emergency kits, establishing communication protocols, and how technology like ICE SOS Lite can enhance family safety planning. Include actionable steps and checklists.',
    imagePrompt: 'Family emergency preparedness kit with first aid supplies, flashlight, emergency contacts list, and mobile phone showing ICE SOS app',
    contentType: 'blog',
    estimatedTime: '6-8 min',
    tags: ['Emergency Planning', 'Family Safety', 'Preparedness']
  },
  {
    id: 'customer-story-testimonial',
    title: 'Customer Success Story',
    description: 'Share real customer experiences and testimonials',
    category: 'Customer Stories',
    icon: Heart,
    prompt: 'Create a compelling customer success story about how ICE SOS Lite helped a family during an emergency situation. Include the challenge they faced, how the app helped, and the positive outcome. Make it emotionally engaging while highlighting practical benefits.',
    imagePrompt: 'Happy family portrait with parents and children, warm lighting, representing safety and connection',
    contentType: 'blog',
    estimatedTime: '5-7 min',
    tags: ['Testimonials', 'Real Stories', 'Customer Success']
  },
  {
    id: 'seasonal-travel-safety',
    title: 'Travel Safety Tips',
    description: 'Seasonal travel safety and preparation advice',
    category: 'Seasonal Content',
    icon: Map,
    prompt: 'Write a comprehensive guide for travel safety during vacation season. Cover pre-travel preparation, staying connected while traveling, emergency contacts management, and how ICE SOS Lite can provide peace of mind for traveling families. Include destination-specific tips.',
    imagePrompt: 'Family with luggage at airport or travel destination, mobile phone showing location sharing, travel safety theme',
    contentType: 'blog',
    estimatedTime: '6-8 min',
    tags: ['Travel Safety', 'Family Travel', 'Vacation Tips']
  },
  {
    id: 'social-safety-tips',
    title: 'Daily Safety Reminders',
    description: 'Quick social media posts about daily safety practices',
    category: 'Social Engagement',
    icon: Users,
    prompt: 'Create engaging social media content with daily safety tips for families. Include quick reminders about emergency contacts, location sharing etiquette, child safety practices, and how small safety habits can make a big difference. Make it shareable and actionable.',
    imagePrompt: 'Minimalist infographic style image with safety icons, clean design, family-friendly colors',
    contentType: 'social',
    estimatedTime: '3-4 min',
    tags: ['Social Media', 'Daily Tips', 'Safety Habits']
  },
  {
    id: 'comparison-guide',
    title: 'Safety App Comparison',
    description: 'Compare ICE SOS Lite with other safety solutions',
    category: 'Product Promotion',
    icon: Star,
    prompt: 'Create an objective comparison guide showing how ICE SOS Lite compares to other family safety apps and traditional emergency preparedness methods. Highlight unique features, ease of use, affordability, and effectiveness. Include a decision matrix for families.',
    imagePrompt: 'Professional comparison chart or infographic showing app features side by side, clean business style',
    contentType: 'blog',
    estimatedTime: '7-9 min',
    tags: ['Product Comparison', 'Competitive Analysis', 'Buyer Guide']
  },
  {
    id: 'holiday-safety',
    title: 'Holiday Safety Planning',
    description: 'Seasonal holiday safety and family gathering tips',
    category: 'Seasonal Content',
    icon: Calendar,
    prompt: 'Write a comprehensive holiday safety guide for families. Cover travel during holidays, large family gatherings, keeping track of children during events, emergency planning for holiday travel, and maintaining family communication during busy holiday schedules.',
    imagePrompt: 'Holiday family gathering scene with multiple generations, warm festive lighting, subtle safety elements',
    contentType: 'blog',
    estimatedTime: '6-8 min',
    tags: ['Holiday Safety', 'Family Gatherings', 'Seasonal Planning']
  },
  {
    id: 'email-newsletter',
    title: 'Safety Newsletter',
    description: 'Monthly newsletter with safety tips and product updates',
    category: 'Email Marketing',
    icon: TrendingUp,
    prompt: 'Create a monthly email newsletter for ICE SOS Lite users. Include safety tip of the month, app feature spotlight, customer story highlight, upcoming safety awareness dates, and product updates. Make it valuable and engaging for regular reading.',
    imagePrompt: 'Professional newsletter header design with safety theme, clean layout, family-focused imagery',
    contentType: 'email',
    estimatedTime: '8-10 min',
    tags: ['Newsletter', 'Email Marketing', 'User Engagement']
  }
];

const getCategoryColor = (category: string): string => {
  const colors = {
    'Product Promotion': 'bg-blue-100 text-blue-700 border-blue-200',
    'Safety Education': 'bg-green-100 text-green-700 border-green-200',
    'Customer Stories': 'bg-purple-100 text-purple-700 border-purple-200',
    'Seasonal Content': 'bg-orange-100 text-orange-700 border-orange-200',
    'Social Engagement': 'bg-pink-100 text-pink-700 border-pink-200',
    'Email Marketing': 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const MarketingTemplates: React.FC<MarketingTemplatesProps> = ({
  onSelectTemplate,
  selectedTemplate
}) => {
  const categories = [...new Set(MARKETING_TEMPLATES.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Marketing Templates</h3>
        <p className="text-muted-foreground text-sm">
          Choose from professionally crafted templates designed for ICE SOS Lite marketing
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MARKETING_TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 line-clamp-1">
                      {template.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(template.category)}`}
                    >
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    ~{template.estimatedTime}
                  </span>
                  <div className="flex gap-1">
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <selectedTemplate.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">{selectedTemplate.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedTemplate.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};