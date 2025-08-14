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
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 shadow-xl">
        <DialogHeader className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="hover:bg-background/80 backdrop-blur-sm rounded-full h-8 w-8 p-0 shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {selectedVideo && selectedVideo.available ? (
          <>
            <DialogHeader className="absolute top-3 left-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-background/80 backdrop-blur-sm rounded-full h-8 w-8 p-0 shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
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
            
            <div className="p-6 bg-gradient-to-br from-background to-muted/10">
              <DialogTitle className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {selectedVideo.title}
              </DialogTitle>
              <p className="text-muted-foreground leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-8 text-center">
              <DialogTitle className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                {t('introVideo.title', 'ICE SOS Introduction Videos')}
              </DialogTitle>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('introVideo.description', 'Choose a video to learn more about ICE SOS Lite')}
              </p>
            </DialogHeader>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`group cursor-pointer border border-border/50 rounded-lg overflow-hidden transition-all duration-300 bg-gradient-to-br from-card to-muted/5 ${
                    video.available 
                      ? 'hover:shadow-lg hover:scale-[1.03] hover:border-primary/30' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5"></div>
                    {video.available ? (
                      <div className="relative z-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full p-2 group-hover:from-primary/30 group-hover:to-primary/40 transition-all duration-300 shadow-md">
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="relative z-10 bg-gradient-to-br from-muted/30 to-muted/50 rounded-full p-2">
                        <Play className="h-4 w-4 text-muted-foreground/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-xs mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-tight line-clamp-2">
                      {video.description}
                    </p>
                    {!video.available && (
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-muted/50 border border-border/30">
                        <p className="text-xs text-muted-foreground font-medium">Soon</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground/80">
                More videos coming soon to help you master ICE SOS Lite
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IntroVideoModal;