import { useLangStore, translate } from '../i18n/langStore';
export default function useT() {
  const lang = useLangStore((s) => s.lang);
  return { lang, t: (key, fallback) => translate(lang, key, fallback) };
}
