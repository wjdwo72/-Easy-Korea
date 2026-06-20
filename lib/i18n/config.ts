import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import koCommon from '@/locales/ko/common.json';
import jaCommon from '@/locales/ja/common.json';
import zhCNCommon from '@/locales/zh-CN/common.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
];

const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('i18nextLng') || navigator.language.slice(0, 2)
    : 'en';

const resolvedLang = SUPPORTED_LANGUAGES.some(l => l.code === savedLang)
  ? savedLang
  : SUPPORTED_LANGUAGES.some(l => l.code.startsWith(savedLang))
    ? SUPPORTED_LANGUAGES.find(l => l.code.startsWith(savedLang))!.code
    : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ko: { common: koCommon },
    ja: { common: jaCommon },
    'zh-CN': { common: zhCNCommon },
  },
  lng: resolvedLang,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
