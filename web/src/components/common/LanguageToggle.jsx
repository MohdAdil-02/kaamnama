import { Languages } from 'lucide-react';
import { useLangStore } from '../../i18n/langStore';
export default function LanguageToggle() {
  const { lang, setLang } = useLangStore();
  return (
    <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} aria-label="Change language"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold hover:bg-slate-50">
      <Languages size={14} />{lang === 'en' ? 'हिंदी' : 'English'}
    </button>
  );
}
