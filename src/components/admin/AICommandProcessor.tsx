import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Play,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AICommandProcessorProps {
  onCommandSubmit?: (command: string) => void;
}

export const AICommandProcessor: React.FC<AICommandProcessorProps> = ({ onCommandSubmit }) => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<{
    xai: boolean;
    openai: boolean;
    openrouter: boolean;
    fallbackUsed: boolean;
  }>({ xai: false, openai: false, openrouter: false, fallbackUsed: false });

  const checkProviderStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: { action: 'provider_status' }
      });

      if (error) throw error;

      if (data.success) {
        setProviderStatus({
          xai: data.providers.xai,
          openai: data.providers.openai,
          openrouter: data.providers.openrouter,
          fallbackUsed: !data.providers.xai && !data.providers.openai && !data.providers.openrouter
        });
      }
    } catch (err) {
      console.error('Error checking provider status:', err);
    }
  };

  const processCommand = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: { 
          command: command.trim(),
          title: `AI Generated: ${command.substring(0, 50)}...`,
          settings: { 
            ai_enhanced: true,
            word_count: 2500,
            seo_optimized: true
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process command');
      }

      if (data.success) {
        setLastResult(data);
        if (onCommandSubmit) {
          onCommandSubmit(command);
        }
        setCommand(''); // Clear the input
      } else {
        throw new Error(data.message || 'Command processing failed');
      }
    } catch (err) {
      console.error('Error processing command:', err);
      setError(err.message || 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    checkProviderStatus();
  }, []);

  const getProviderStatusBadge = () => {
    if (providerStatus.xai) {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">xAI Active</Badge>;
    } else if (providerStatus.openai) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">OpenAI Active</Badge>;
    } else if (providerStatus.openrouter) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">OpenRouter Active</Badge>;
    } else if (providerStatus.fallbackUsed) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Template Mode</Badge>;
    }
    return <Badge variant="outline">Checking...</Badge>;
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Command Processor
          </CardTitle>
          <div className="flex items-center gap-2">
            {getProviderStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkProviderStatus}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {providerStatus.fallbackUsed && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              AI providers are offline. Content will be generated using template fallbacks.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Marketing Command</label>
          <Textarea
            placeholder="Create a comprehensive blog post about emergency preparedness for families..."
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="min-h-[100px]"
            disabled={isProcessing}
          />
          <div className="text-xs text-muted-foreground">
            Describe what content you want to create. Be specific about topic, audience, and format.
          </div>
        </div>

        <Button 
          onClick={processCommand}
          disabled={isProcessing || !command.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isProcessing ? 'Processing with AI...' : 'Generate Content'}
        </Button>

        {lastResult && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Command Processed Successfully</span>
            </div>
            <div className="text-xs text-green-600">
              Campaign ID: {lastResult.campaign_id}
            </div>
          </div>
        )}

        <div className="pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            <strong>AI Status:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>xAI (Grok): {providerStatus.xai ? '✅ Connected' : '❌ Offline'}</li>
              <li>OpenAI: {providerStatus.openai ? '✅ Connected' : '❌ Offline'}</li>
              <li>OpenRouter: {providerStatus.openrouter ? '✅ Connected' : '❌ Offline'}</li>
              <li>Fallback Templates: ✅ Always Available</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};