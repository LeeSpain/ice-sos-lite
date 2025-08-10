import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';

export type SupportedLanguage = 'en' | 'nl' | 'es';
export type SupportedCurrency = 'EUR' | 'GBP' | 'USD' | 'AUD';

interface PreferencesContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currency: SupportedCurrency;
  setCurrency: (cur: SupportedCurrency) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => (localStorage.getItem('lang') as SupportedLanguage) || 'en');
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => (localStorage.getItem('currency') as SupportedCurrency) || 'EUR');

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang).catch(() => {});
  };

  const setCurrency = (cur: SupportedCurrency) => {
    setCurrencyState(cur);
    localStorage.setItem('currency', cur);
  };

  useEffect(() => {
    // Ensure i18n matches state on first render
    i18n.changeLanguage(language).catch(() => {});
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, currency, setCurrency }), [language, currency]);

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};
