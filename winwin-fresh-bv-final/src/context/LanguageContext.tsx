"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.nl;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("nl");

  useEffect(() => {
    // Check saved language preference or cookie
    const saved = localStorage.getItem("winwin_lang") as Language;
    if (saved === "nl" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "nl";
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("winwin_lang", newLang);
    document.documentElement.lang = newLang;
  };

  const toggleLang = () => {
    const next = lang === "nl" ? "en" : "nl";
    setLang(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
        toggleLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
