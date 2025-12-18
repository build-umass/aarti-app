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
import settingsEN from '../locales/en/settings.json';

// Import Telugu translation files
import navigationTE from '../locales/te/navigation.json';
import homeTE from '../locales/te/home.json';
import quizTE from '../locales/te/quiz.json';
import profileTE from '../locales/te/profile.json';
import chatTE from '../locales/te/chat.json';
import onboardingTE from '../locales/te/onboarding.json';
import settingsTE from '../locales/te/settings.json';


const resources = {
  en: {
    navigation: navigationEN,
    home: homeEN,
    quiz: quizEN,
    profile: profileEN,
    chat: chatEN,
    onboarding: onboardingEN,
    settings: settingsEN,
  },
  te: {
    navigation: navigationTE,
    home: homeTE,
    quiz: quizTE,
    profile: profileTE,
    chat: chatTE,
    onboarding: onboardingTE,
    settings: settingsTE,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default to English for now
    fallbackLng: 'en',
    ns: ['navigation', 'home', 'quiz', 'profile', 'chat', 'onboarding', 'settings'],
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
