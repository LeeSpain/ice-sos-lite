import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mic, MicOff, MapPin, AlertTriangle } from "lucide-react";
import { useVoiceActivation } from "@/hooks/useVoiceActivation";
import { useEmergencySOS } from "@/hooks/useEmergencySOS";
import { useToast } from "@/hooks/use-toast";


const SosButton = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { triggerEmergencySOS, isTriggering, locationPermissionGranted, locationPermissionDenied } = useEmergencySOS();
  const { toast } = useToast();

  const handleEmergencyTrigger = async () => {
    try {
      await triggerEmergencySOS();
    } catch (error) {
      console.error('Emergency SOS failed:', error);
    }
  };

  const { isListening, hasPermission } = useVoiceActivation({
    triggerPhrase: "help help help",
    onActivation: handleEmergencyTrigger,
    isEnabled: voiceEnabled
  });

  const toggleVoiceActivation = () => {
    if (!hasPermission && !voiceEnabled) {
      toast({
        title: "Microphone Permission Required",
        description: "Please allow microphone access to enable voice activation for emergency calls.",
        variant: "destructive"
      });
      return;
    }
    setVoiceEnabled(!voiceEnabled);
  };

  useEffect(() => {
    if (voiceEnabled && isListening) {
      toast({
        title: "🎤 Voice Activation Enabled",
        description: "Say 'Help Help Help' to trigger emergency SOS",
        duration: 3000
      });
    }
  }, [voiceEnabled, isListening, toast]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      {/* Voice Activation Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant={voiceEnabled ? "wellness" : "outline"}
          size="sm"
          onClick={toggleVoiceActivation}
          className="text-xs"
        >
          {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          Voice {voiceEnabled ? 'ON' : 'OFF'}
        </Button>
        {voiceEnabled && (
          <span className="text-xs text-muted-foreground">
            Say: "Help Help Help"
          </span>
        )}
      </div>

      {/* Location status indicator */}
      {locationPermissionDenied && (
        <div className="flex items-center justify-center gap-2 text-sm text-warning bg-warning/10 rounded-lg p-3 border border-warning/20">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs text-center">Location access required for precise emergency alerts</span>
        </div>
      )}

      {locationPermissionGranted && (
        <div className="flex items-center justify-center gap-2 text-sm text-wellness bg-wellness/10 rounded-lg p-3 border border-wellness/20">
          <MapPin className="h-4 w-4" />
          <span className="text-xs text-center">GPS location sharing enabled</span>
        </div>
      )}

      {/* Main Emergency Button */}
      <Button
        variant="emergency"
        size="emergency"
        onClick={handleEmergencyTrigger}
        disabled={isTriggering}
        className="relative transition-all duration-300"
        aria-label="Emergency SOS Button"
      >
        <Phone className="h-10 w-10" />
        <span className="sr-only">Emergency SOS</span>
        {isTriggering && (
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm font-medium text-emergency">
          {isTriggering ? "Activating Emergency..." : "Emergency SOS"}
        </p>
        <p className="text-xs text-muted-foreground">
          Tap to alert emergency contacts with GPS location
          {voiceEnabled && <span className="block">or say "Help Help Help"</span>}
        </p>
      </div>
    </div>
  );
};

export default SosButton;