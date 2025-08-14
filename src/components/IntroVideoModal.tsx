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
  const [isOpen, setIsOpen] = React.useState(false);
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
    setIsOpen(false);
    setSelectedVideo(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-auto p-0 bg-gradient-to-br from-background to-muted border border-border">
        <DialogHeader className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="hover:bg-muted rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {selectedVideo && selectedVideo.available ? (
          <>
            <DialogHeader className="absolute top-4 left-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-muted rounded-full h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
                title={selectedVideo.title}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            
            <div className="p-6">
              <DialogTitle className="text-xl font-semibold mb-2">
                {selectedVideo.title}
              </DialogTitle>
              <p className="text-muted-foreground">
                {selectedVideo.description}
              </p>
            </div>
          </>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">
                {t('introVideo.title', 'ICE SOS Introduction Videos')}
              </DialogTitle>
              <p className="text-muted-foreground text-center">
                {t('introVideo.description', 'Choose a video to learn more about ICE SOS Lite')}
              </p>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`relative group cursor-pointer border border-border rounded-lg overflow-hidden transition-all duration-200 ${
                    video.available 
                      ? 'hover:shadow-lg hover:scale-105 hover:border-primary' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {video.available ? (
                      <div className="bg-primary/20 rounded-full p-4 group-hover:bg-primary/30 transition-colors">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                    ) : (
                      <div className="bg-muted rounded-full p-4">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                    {!video.available && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Coming Soon</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IntroVideoModal;