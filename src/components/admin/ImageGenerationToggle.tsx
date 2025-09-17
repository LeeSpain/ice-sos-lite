import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Wand2, 
  Palette, 
  Sparkles,
  Camera,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface ImageGenerationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  templateImagePrompt?: string;
}

const STYLE_PRESETS = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, business-appropriate imagery',
    prompt: 'professional, clean, business style, high quality, modern'
  },
  {
    id: 'illustration',
    name: 'Illustration',
    description: 'Friendly, illustrated graphics',
    prompt: 'vector illustration, clean design, friendly colors, modern illustration style'
  },
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Data visualization and charts',
    prompt: 'infographic style, clean charts, data visualization, professional layout'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Real-life family scenarios',
    prompt: 'lifestyle photography, natural lighting, family friendly, warm atmosphere'
  }
];

export const ImageGenerationToggle: React.FC<ImageGenerationToggleProps> = ({
  enabled,
  onToggle,
  customPrompt,
  onPromptChange,
  templateImagePrompt
}) => {
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style.id);
    if (templateImagePrompt) {
      onPromptChange(`${templateImagePrompt}, ${style.prompt}`);
    } else {
      onPromptChange(style.prompt);
    }
  };

  const generatePreview = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate image generation for demo
    setTimeout(() => {
      setPreviewImage('/placeholder.svg'); // This would be actual generated image
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className={`transition-all ${enabled ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI Image Generation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate custom images for your content
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="image-generation"
              checked={enabled}
              onCheckedChange={onToggle}
            />
            <Label htmlFor="image-generation" className="sr-only">
              Enable image generation
            </Label>
          </div>
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Style Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Image Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleSelect(style)}
                  className="h-auto p-3 flex flex-col items-start text-left"
                >
                  <div className="font-medium text-xs">{style.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {style.description}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Template Suggestion */}
          {templateImagePrompt && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Template Suggestion</span>
              </div>
              <p className="text-sm text-blue-700">{templateImagePrompt}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPromptChange(templateImagePrompt)}
                className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Use Template Prompt
              </Button>
            </div>
          )}

          {/* Custom Prompt */}
          <div>
            <Label htmlFor="image-prompt" className="text-sm font-medium mb-2 block">
              Image Description
            </Label>
            <Textarea
              id="image-prompt"
              placeholder="Describe the image you want to generate (e.g., 'A professional family using a mobile safety app, modern clean design, friendly atmosphere')"
              value={customPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific about style, colors, objects, and mood for best results
            </p>
          </div>

          {/* Generation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePreview}
              disabled={!customPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Preview'}
            </Button>
            
            <Badge variant="secondary" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              DALL-E 3
            </Badge>
          </div>

          {/* Preview */}
          {previewImage && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generated Preview</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm">Generated Image Preview</div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pro Tips</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Include specific colors, lighting, and composition details</li>
              <li>• Mention "high quality" or "professional" for better results</li>
              <li>• Consider your brand colors: blue, white, and safety themes</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};