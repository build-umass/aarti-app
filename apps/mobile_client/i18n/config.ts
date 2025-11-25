import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import English translation files
import navigationEN from '../locales/en/navigation.json';
import homeEN from '../locales/en/home.json';
import quizEN from '../locales/en/quiz.json';
import profileEN from '../locales/en/profile.json';
import chatEN from '../locales/en/chat.json';
import onboardingEN from '../locales/en/onboarding.json';

const resources = {
  en: {
    navigation: navigationEN,
    home: homeEN,
    quiz: quizEN,
    profile: profileEN,
    chat: chatEN,
    onboarding: onboardingEN,
  },
  // Future languages will be added here
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default to English for now
    fallbackLng: 'en',
    ns: ['navigation', 'home', 'quiz', 'profile', 'chat', 'onboarding'],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

// Try to detect device locale (for future multi-language support)
const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
console.log('Device locale detected:', deviceLocale);

export default i18n;
