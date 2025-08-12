
"use client";

import { useState, useEffect, useCallback } from 'react';
import { translations, type Language, defaultLanguage } from '@/lib/translations';

export const useTranslation = () => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  }, []);

  return {
    t: translations[language],
    language,
    setLanguage,
    isLoaded
  };
};
