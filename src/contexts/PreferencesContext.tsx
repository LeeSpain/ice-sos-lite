import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';
import { supabase } from '@/integrations/supabase/client';

export type SupportedLanguage = 'en' | 'nl' | 'es';
export type SupportedCurrency = 'EUR' | 'GBP' | 'USD' | 'AUD';

interface PreferencesContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currency: SupportedCurrency;
  setCurrency: (cur: SupportedCurrency) => void;
  isLoaded?: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => (localStorage.getItem('lang') as SupportedLanguage) || 'en');
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => (localStorage.getItem('currency') as SupportedCurrency) || 'EUR');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user preferences from their profile when they authenticate
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try to get user's profile preferences
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('user_id', user.id)
            .single();

          if (!error && profile?.language_preference) {
            // Map language preference to supported language
            const profileLang = profile.language_preference;
            let mappedLang: SupportedLanguage = 'en';
            
            if (profileLang === 'nl' || profileLang === 'Dutch' || profileLang === 'Nederlands') {
              mappedLang = 'nl';
            } else if (profileLang === 'es' || profileLang === 'Spanish' || profileLang === 'Español') {
              mappedLang = 'es';
            } else if (profileLang === 'en' || profileLang === 'English') {
              mappedLang = 'en';
            }

            // Set the language from profile if it differs from localStorage
            if (mappedLang !== language) {
              setLanguageState(mappedLang);
              localStorage.setItem('lang', mappedLang);
              i18n.changeLanguage(mappedLang).catch(() => {});
            }
          }

          // Check if user has currency preference from registration metadata
          if (user.user_metadata?.preferred_currency) {
            const prefCurrency = user.user_metadata.preferred_currency as SupportedCurrency;
            if (prefCurrency !== currency) {
              setCurrencyState(prefCurrency);
              localStorage.setItem('currency', prefCurrency);
            }
          }
        }
      } catch (error) {
        console.log('Could not load user preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadUserPreferences();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(loadUserPreferences);
    return () => subscription.unsubscribe();
  }, [language, currency]); // Add currency dependency to prevent infinite loops

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang).catch(() => {});
    
    // Also update user profile if they're logged in
    updateUserLanguagePreference(lang);
  };

  const updateUserLanguagePreference = async (lang: SupportedLanguage) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ language_preference: lang })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.log('Could not update language preference:', error);
    }
  };

  const setCurrency = (cur: SupportedCurrency) => {
    setCurrencyState(cur);
    localStorage.setItem('currency', cur);
  };

  useEffect(() => {
    // Ensure i18n matches state on first render
    if (isLoaded) {
      i18n.changeLanguage(language).catch(() => {});
    }
  }, [language, isLoaded]);

  const value = useMemo(() => ({ 
    language, 
    setLanguage, 
    currency, 
    setCurrency,
    isLoaded // Expose loading state
  }), [language, currency, isLoaded]);

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};
