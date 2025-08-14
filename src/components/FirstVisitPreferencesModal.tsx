import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, DollarSign, CheckCircle } from 'lucide-react';
import type { SupportedLanguage, SupportedCurrency } from '@/contexts/PreferencesContext';

const FIRST_VISIT_KEY = 'hasVisitedBefore';

export const FirstVisitPreferencesModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('EUR');
  const [isApplying, setIsApplying] = useState(false);
  const { setLanguage, setCurrency } = usePreferences();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleApplyPreferences = async () => {
    setIsApplying(true);
    
    // Apply the selected preferences
    setLanguage(selectedLanguage);
    setCurrency(selectedCurrency);
    
    // Mark that the user has visited before
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsApplying(false);
    setIsOpen(false);
  };

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  const currencyOptions = [
    { value: 'EUR', label: 'EUR (€)', region: 'Europe' },
    { value: 'GBP', label: 'GBP (£)', region: 'United Kingdom' },
    { value: 'USD', label: 'USD ($)', region: 'United States' },
    { value: 'AUD', label: 'AUD (A$)', region: 'Australia' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md mx-4 bg-card border-border shadow-glow">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-primary">
            <Globe className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-poppins text-foreground">
            Welcome to ICE SOS Lite
          </DialogTitle>
          <p className="text-muted-foreground">
            Please select your preferred language and currency to get started
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Globe className="w-4 h-4" />
                Language
              </div>
              <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as SupportedLanguage)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span>{option.flag}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <DollarSign className="w-4 h-4" />
                Currency
              </div>
              <Select value={selectedCurrency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.region}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button 
            onClick={handleApplyPreferences}
            disabled={isApplying}
            className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-primary transition-smooth"
          >
            {isApplying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Applying preferences...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Continue to ICE SOS Lite
              </div>
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You can change these preferences anytime in the navigation menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};