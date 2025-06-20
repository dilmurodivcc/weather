import { create } from 'zustand';

interface LanguageState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
})); 