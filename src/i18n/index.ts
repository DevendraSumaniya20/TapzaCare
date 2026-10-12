import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { hi } from './hi';
import { te } from './te';

export type Language = 'en' | 'hi' | 'te';

// Each language is named in its own script so a reader of that language can find it.
export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'te', label: 'తెలుగు' },
];

const STORAGE_KEY = 'tapza.language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export async function saveLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(STORAGE_KEY, language).catch(() => undefined);
}

export async function loadSavedLanguage(): Promise<Language | null> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  const language =
    LANGUAGES.find(candidate => candidate.value === saved)?.value ?? null;
  if (language) await i18n.changeLanguage(language);
  return language;
}

export default i18n;
