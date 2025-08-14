import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  available: boolean;
}

interface IntroVideoModalProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const IntroVideoModal = ({ trigger, className }: IntroVideoModalProps) => {
  const { t } = useTranslation();
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);

  const videos: Video[] = [
    {
      id: 'overview',
      title: 'ICE SOS Lite Overview',
      description: 'Complete overview of ICE SOS Lite features and capabilities',
      youtubeId: '2LBrvRXiYwg',
      available: true
    },
    {
      id: 'family',
      title: 'ICE SOS Lite Family Protection',
      description: 'How ICE SOS Lite protects your entire family',
      youtubeId: 'A5xiJUS0aq0',
      available: true
    },
    {
      id: 'all-ages',
      title: 'ICE SOS Lite - For All Ages',
      description: 'Protection solutions for every age group',
      youtubeId: '',
      available: false
    },
    {
      id: 'spain',
      title: 'ICE SOS Lite - Call Centre Spain',
      description: 'Our Spanish call center operations and services',
      youtubeId: '',
      available: false
    }
  ];

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className={className}>
      <Play className="h-4 w-4 mr-2" />
      {t('nav.introVideo', 'Intro Video')}
    </Button>
  );

  const handleVideoSelect = (video: Video) => {
    if (video.available) {
      setSelectedVideo(video);
    }
  };

  const handleBack = () => {
    setSelectedVideo(null);
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-full h-auto p-0 bg-gradient-to-br from-background via-background to-muted/30 border border-border/50 shadow-2xl">
        <DialogHeader className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="hover:bg-background/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {selectedVideo && selectedVideo.available ? (
          <>
            <DialogHeader className="absolute top-4 left-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-background/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </DialogHeader>
            
            <div className="relative w-full bg-black rounded-t-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
                title={selectedVideo.title}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            
            <div className="p-8 bg-gradient-to-br from-background to-muted/20">
              <DialogTitle className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {selectedVideo.title}
              </DialogTitle>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 md:p-12">
            <DialogHeader className="mb-12 text-center">
              <DialogTitle className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                {t('introVideo.title', 'ICE SOS Introduction Videos')}
              </DialogTitle>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {t('introVideo.description', 'Choose a video to learn more about ICE SOS Lite')}
              </p>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`group cursor-pointer border border-border/50 rounded-xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-card via-card to-muted/10 backdrop-blur-sm ${
                    video.available 
                      ? 'hover:shadow-xl hover:scale-[1.02] hover:border-primary/30 hover:bg-gradient-to-br hover:from-card hover:to-primary/5' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10 opacity-50"></div>
                    {video.available ? (
                      <div className="relative z-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full p-6 group-hover:from-primary/30 group-hover:to-primary/40 transition-all duration-300 shadow-lg backdrop-blur-sm">
                        <Play className="h-8 w-8 text-primary drop-shadow-sm" />
                      </div>
                    ) : (
                      <div className="relative z-10 bg-gradient-to-br from-muted/30 to-muted/50 rounded-full p-6 backdrop-blur-sm">
                        <Play className="h-8 w-8 text-muted-foreground/70" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-200">
                      {video.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {video.description}
                    </p>
                    {!video.available && (
                      <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border/30">
                        <p className="text-xs text-muted-foreground font-medium">Coming Soon</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground/80">
                More videos will be added soon to help you get the most out of ICE SOS Lite
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IntroVideoModal;