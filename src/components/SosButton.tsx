import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const SosButton = () => {
  const handleEmergency = () => {
    // Emergency SOS functionality would be implemented here
    console.log("SOS Emergency triggered!");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="emergency"
        size="emergency"
        onClick={handleEmergency}
        className="relative"
        aria-label="Emergency SOS Button - Press for immediate help"
      >
        <Phone className="h-8 w-8" />
        <span className="sr-only">Emergency SOS</span>
      </Button>
      <div className="text-center">
        <p className="text-sm font-medium text-emergency">Emergency SOS</p>
        <p className="text-xs text-muted-foreground">Tap for immediate help</p>
      </div>
    </div>
  );
};

export default SosButton;