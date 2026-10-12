import 'i18next';
import type { Translations } from './en';

// Makes t('...') keys type-checked against en.ts.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Translations };
  }
}
