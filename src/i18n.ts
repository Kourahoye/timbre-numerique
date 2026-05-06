import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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
      fr: {
        translation: {
          welcome: "Bienvenue",
          login: "Se connecter",
        },
      },
      en: {
        translation: {
          welcome: "Welcome",
          login: "Login",
        },
      },
    },
  });

export default i18n;