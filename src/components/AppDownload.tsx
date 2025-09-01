import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone, Brain, MessageCircle, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { IntroVideoModal } from "@/components/IntroVideoModal";
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-wellness/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3 mb-6 border border-primary/20 shadow-lg">
            <Brain className="w-5 h-5 text-primary mr-3 animate-pulse" />
            <span className="text-sm font-bold text-primary tracking-wide">{t('appDownload.platformBadge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('appDownload.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('appDownload.subtitle')}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Emma AI Visual */}
            <div className="relative">
              {/* AI Chat Interface Mockup */}
              <div className="relative mx-auto w-80 h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white">
                    <span className="font-bold">Emma AI</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs">Online</span>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="p-4 space-y-4 h-full overflow-hidden">
                    {/* Emma's Messages */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <p className="text-xs font-medium text-primary mb-1">Emma</p>
                        <p className="text-sm">Hi! I'm Emma, your AI assistant. How can I help you today?</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <p className="text-xs font-medium text-primary mb-1">Emma</p>
                        <p className="text-sm">I can help with emergency setup, family connections, and answer questions about your protection plan.</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">How do I add family members?</p>
                      </div>
                    </div>

                    {/* Emma's Response */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <p className="text-xs font-medium text-primary mb-1">Emma</p>
                        <p className="text-sm">I'll guide you through adding family members step by step...</p>
                        <div className="mt-2 flex space-x-1">
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating AI Features */}
              <div className="absolute -left-8 top-20 bg-white rounded-xl p-4 shadow-xl border border-primary/20 max-w-48">
                <div className="flex items-center mb-2">
                  <MessageCircle className="h-4 w-4 text-primary mr-2" />
                  <span className="font-semibold text-sm">Natural Language</span>
                </div>
                <p className="text-xs text-gray-600">Speaks your language naturally</p>
              </div>

              <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-4 shadow-xl border border-secondary/20 max-w-48">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 text-secondary mr-2" />
                  <span className="font-semibold text-sm">Instant Response</span>
                </div>
                <p className="text-xs text-gray-600">24/7 immediate assistance</p>
              </div>
            </div>

            {/* Right Side - AI Features & CTA */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  {t('appDownload.appName')}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {t('appDownload.heroDescription')}
                </p>
              </div>

              <div className="grid gap-6 mb-8">
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('appDownload.features.intelligentSupport.title')}</h4>
                    <p className="text-muted-foreground">{t('appDownload.features.intelligentSupport.description')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('appDownload.features.learningAI.title')}</h4>
                    <p className="text-muted-foreground">{t('appDownload.features.learningAI.description')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-wellness/10 to-wellness/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-wellness" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('appDownload.features.instantResponse.title')}</h4>
                    <p className="text-muted-foreground">{t('appDownload.features.instantResponse.description')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="xl" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold px-8 py-4 shadow-glow hover:shadow-xl transition-all duration-300 rounded-xl"
                  onClick={() => {
                    // Emma chat functionality would be triggered here
                    console.log("Talk to Emma clicked");
                  }}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t('appDownload.cta')}
                </Button>
                <IntroVideoModal 
                  defaultVideoId="meet-emma"
                  trigger={
                    <Button 
                      size="xl" 
                      variant="outline"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Watch Demo
                    </Button>
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Advanced AI • Multilingual • Available 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;