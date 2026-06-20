import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "../i18n/i18n";

type Lang = "en" | "ar";

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("pioneer-lang");
    if (saved === "ar" || saved === "en") return saved;
    const i18nSaved = localStorage.getItem("i18nextLng");
    return i18nSaved?.startsWith("ar") ? "ar" : "en";
  });

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.style.removeProperty("font-family");
    document.documentElement.style.removeProperty("font-size");
    localStorage.setItem("pioneer-lang", lang);
    localStorage.setItem("i18nextLng", lang);
    i18n.changeLanguage(lang);
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

