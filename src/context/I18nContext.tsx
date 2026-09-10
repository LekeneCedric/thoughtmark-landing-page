import React, { createContext, useContext, useEffect, useState } from "react";
import { SupportedLanguage, TRANSLATIONS, LANGUAGE_OPTIONS } from "../data/translations";

interface I18nContextType {
  lang: SupportedLanguage;
  setLang: (l: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languages: typeof LANGUAGE_OPTIONS;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key, fallback) => fallback || key,
  languages: LANGUAGE_OPTIONS,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tm_landing_lang") as SupportedLanguage | null;
      if (saved && TRANSLATIONS[saved]) return saved;
      const navLang = navigator.language?.toLowerCase() || "";
      if (navLang.startsWith("zh")) return "zh";
      if (navLang.startsWith("es")) return "es";
      if (navLang.startsWith("fr")) return "fr";
      if (navLang.startsWith("de")) return "de";
      if (navLang.startsWith("ja")) return "ja";
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("tm_landing_lang", lang);
  }, [lang]);

  const setLang = (l: SupportedLanguage) => {
    setLangState(l);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGE_OPTIONS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
