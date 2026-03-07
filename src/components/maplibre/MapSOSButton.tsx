import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapSOSButtonProps {
  onTrigger: () => void;
  holdDurationMs?: number;
}

const MapSOSButton: React.FC<MapSOSButtonProps> = ({ onTrigger, holdDurationMs = 3000 }) => {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  const start = useCallback(() => {
    timerRef.current = window.setTimeout(() => {
      onTrigger();
      timerRef.current = null;
      setProgress(0);
    }, holdDurationMs);

    let p = 0;
    const step = 100 / (holdDurationMs / 60);
    progressRef.current = window.setInterval(() => {
      p += step;
      setProgress(Math.min(p, 100));
      if (p >= 100 && progressRef.current) {
        clearInterval(progressRef.current);
      }
    }, 60) as unknown as number;
  }, [onTrigger, holdDurationMs]);

  const cancel = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
    setProgress(0);
  }, []);

  const isHolding = progress > 0;

  return (
    <div className="relative">
      <Button
        size="lg"
        className={cn(
          'w-16 h-16 rounded-full shadow-xl font-bold text-lg transition-all duration-200',
          isHolding ? 'bg-red-600 hover:bg-red-700 scale-110' : 'bg-red-500 hover:bg-red-600',
        )}
        onMouseDown={start}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        onTouchStart={start}
        onTouchEnd={cancel}
      >
        <AlertTriangle className="w-6 h-6" />
      </Button>

      {isHolding && (
        <svg className="absolute inset-0 w-16 h-16 -rotate-90 pointer-events-none">
          <circle
            cx="32" cy="32" r="28"
            stroke="currentColor" strokeWidth="4" fill="none"
            className="text-red-200"
            strokeDasharray={`${progress * 1.76} 176`}
          />
        </svg>
      )}

      <div className="text-center mt-2">
        <div className="text-xs text-muted-foreground">Hold for SOS</div>
      </div>
    </div>
  );
};

export default MapSOSButton;
