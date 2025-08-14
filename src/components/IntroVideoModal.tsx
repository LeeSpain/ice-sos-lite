import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface IntroVideoModalProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const IntroVideoModal = ({ trigger, className }: IntroVideoModalProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className={className}>
      <Play className="h-4 w-4 mr-2" />
      {t('nav.introVideo', 'Intro Video')}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-auto p-0 bg-black/95 border-0">
        <DialogHeader className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src="https://www.youtube.com/embed/2LBrvRXiYwg?autoplay=1&rel=0&showinfo=0&modestbranding=1"
            title="ICE SOS Introduction Video"
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
          <DialogTitle className="text-white text-lg font-semibold">
            {t('introVideo.title', 'ICE SOS Introduction')}
          </DialogTitle>
          <p className="text-white/80 text-sm mt-1">
            {t('introVideo.description', 'Learn how ICE SOS protects you and your loved ones in emergency situations.')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntroVideoModal;