import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation JSON files
import enTranslation from './locales/en.json';
import arTranslation from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

// Setup default document text direction and language
document.documentElement.dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng?.startsWith('ar') ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;