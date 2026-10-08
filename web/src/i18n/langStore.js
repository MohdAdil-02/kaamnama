import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dictionary } from './dictionary';

export const useLangStore = create(
  persist((set) => ({ lang: 'en', setLang: (lang) => set({ lang }) }), { name: 'lang' })
);
export const translate = (lang, key, fallback) => dictionary[lang]?.[key] ?? fallback ?? key;
