import i18nx from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en/translation.json'
import fr from './locales/fr/translation.json'

const resources = {
    en: {
        translation: en,
    },
    fr: {
        translation: fr,
    }
}

const getBrowserLanguage = () => {
    const browserLanguage = navigator.language || navigator.userLanguage;
    return browserLanguage.split('-')[0];
};

i18nx.use(LanguageDetector).use(initReactI18next).init({
    resources,
    fallbackLng: 'en',
    lng: getBrowserLanguage(),
    interpolation: {
        escapeValue: false,
    }
})

export default i18nx;