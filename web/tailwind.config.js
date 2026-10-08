export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1D4ED8', light: '#EFF6FF' },
        ink: { DEFAULT: '#0F172A', muted: '#64748B' },
        line: '#E2E8F0',
        canvas: '#F8FAFC',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      borderRadius: { card: '12px', xl2: '16px' },
      boxShadow: { card: '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)' },
    },
  },
  plugins: [],
};
