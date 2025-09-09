import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import { useEmergencySOS } from '@/hooks/useEmergencySOS';
import { useEmergencyDisclaimer } from '@/hooks/useEmergencyDisclaimer';
import { EmergencyDisclaimerModal } from '@/components/emergency/EmergencyDisclaimerModal';

const EmergencyButton = () => {
  const { triggerEmergencySOS, isTriggering } = useEmergencySOS();
  const { 
    showDisclaimer, 
    requestDisclaimerAcceptance, 
    acceptDisclaimer, 
    cancelDisclaimer 
  } = useEmergencyDisclaimer();
  const [isPressed, setIsPressed] = useState(false);

  const handleSOSActivation = () => {
    const canProceed = requestDisclaimerAcceptance();
    if (canProceed) {
      triggerEmergencySOS();
    }
  };

  const handleDisclaimerAccept = () => {
    acceptDisclaimer();
    triggerEmergencySOS();
  };

  return (
    <>
      <div className="relative">
        {/* Outer pulsing ring for emergency state */}
        <div className={`absolute inset-0 rounded-full bg-red-500/30 ${isTriggering ? 'animate-ping' : ''}`}></div>
        
        {/* Main emergency button */}
        <Button
          onClick={handleSOSActivation}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          disabled={isTriggering}
          className={`
            relative w-48 h-48 rounded-full 
            bg-gradient-to-br from-red-500 to-red-600 
            hover:from-red-600 hover:to-red-700
            text-white font-bold text-xl
            border-4 border-white
            shadow-2xl hover:shadow-red-500/50
            transition-all duration-200
            ${isPressed ? 'scale-95' : 'scale-100'}
            ${isTriggering ? 'animate-pulse' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-3">
            {isTriggering ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-lg">SENDING...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12" />
                <div className="text-center">
                  <div className="text-2xl font-black">EMERGENCY</div>
                  <div className="text-lg">SOS</div>
                </div>
              </>
            )}
          </div>
        </Button>

        {/* Button instructions */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center text-white/80">
          <p className="text-sm font-medium">Tap to send emergency alert</p>
          <p className="text-xs">to your emergency contacts</p>
        </div>
      </div>

      {/* Emergency Disclaimer Modal */}
      <EmergencyDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onCancel={cancelDisclaimer}
        subscriptionTier="basic"
      />
    </>
  );
};

export default EmergencyButton;