import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./i18n/fr.json";
import en from "./i18n//en.json";
i18n
  .use(LanguageDetector) // détecte langue navigateur
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
  fr: { translation: fr },
  en: { translation: en }
},
  });

export default i18n;