import { useTranslation } from 'react-i18next';

/**
 * Wrapper around useTranslation for better TypeScript support
 * and namespace management
 *
 * @param namespace - The translation namespace to use (navigation, home, quiz, profile, chat, onboarding)
 * @returns Translation function and i18n instance
 */
export const useAppTranslation = (namespace?: string) => {
  const { t, i18n } = useTranslation(namespace);

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
  };
};
