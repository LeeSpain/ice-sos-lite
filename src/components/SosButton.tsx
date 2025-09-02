import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mic, MicOff, MapPin, AlertTriangle } from "lucide-react";
import { useVoiceActivation } from "@/hooks/useVoiceActivation";
import { useEmergencySOS } from "@/hooks/useEmergencySOS";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionTier } from "@/hooks/useSubscriptionTier";
import { useEmergencyDisclaimer } from "@/hooks/useEmergencyDisclaimer";
import { EmergencyDisclaimerModal } from "@/components/emergency/EmergencyDisclaimerModal";
import { EmergencyStatusBanner } from "@/components/emergency/EmergencyStatusBanner";


const SosButton = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { triggerEmergencySOS, isTriggering, locationPermissionGranted, locationPermissionDenied } = useEmergencySOS();
  const { toast } = useToast();
  
  // Subscription and disclaimer hooks
  const { tier: subscriptionTier, loading: subscriptionLoading } = useSubscriptionTier();
  const { 
    showDisclaimer, 
    hasAcceptedDisclaimer, 
    requestDisclaimerAcceptance, 
    acceptDisclaimer, 
    cancelDisclaimer 
  } = useEmergencyDisclaimer();

  const handleEmergencyTrigger = async () => {
    // Check if disclaimer needs to be accepted first
    if (!requestDisclaimerAcceptance()) {
      return; // Block SOS if disclaimer not accepted
    }

    try {
      await triggerEmergencySOS();
    } catch (error) {
      console.error('Emergency SOS failed:', error);
    }
  };

  const handleDisclaimerAccept = () => {
    acceptDisclaimer();
    // Automatically trigger SOS after accepting disclaimer
    handleEmergencyTrigger();
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
    <>
      {/* Emergency Disclaimer Modal */}
      <EmergencyDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onCancel={cancelDisclaimer}
        subscriptionTier={subscriptionTier}
      />

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
    </>
  );
};

export default SosButton;