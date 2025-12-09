import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type LanguageContextType = {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  isRTL: boolean;
  t: (key: string) => string;
  getLocalizedText: (en: string | null, ar: string | null) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (saved) {
      setLanguageState(saved);
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const getLocalizedText = (en: string | null, ar: string | null): string => {
    return language === 'ar' ? (ar || en || '') : (en || ar || '');
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      isRTL: language === 'ar',
      t,
      getLocalizedText
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
