import { translations } from "@/i18n/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SupportedLanguage = keyof typeof translations;

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "app_language";

function getDeviceLanguage(): SupportedLanguage {
  const locale = Localization.getLocales?.()[0]?.languageCode || "en";
  return (translations[locale as SupportedLanguage] ? (locale as SupportedLanguage) : "en");
}

function resolveKeyPath(obj: any, path: string): any {
  return path.split(".").reduce((acc: any, part: string) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getDeviceLanguage());

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && translations[saved as SupportedLanguage]) {
          setLanguageState(saved as SupportedLanguage);
        }
      } catch {}
    })();
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const bundle = translations[language] || translations.en;
      const template = resolveKeyPath(bundle, key);
      if (typeof template !== "string") return key; // fallback to key
      if (!vars) return template;
      return template.replace(/{{(\w+)}}/g, (_, k) => String(vars[k] ?? ""));
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


