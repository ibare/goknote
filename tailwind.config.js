/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3F1EA',
        'cream-soft': '#FAF8F2',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#0A0A0A',
          2: '#6B6B6B',
          3: '#A3A3A3',
          4: '#CFCFCF',
        },
        line: 'rgba(10,10,10,0.06)',
        'line-strong': 'rgba(10,10,10,0.12)',
        tag: {
          'lavender-bg': '#E3D9FE',
          'lavender-ink': '#4B3C9A',
          'sage-bg': '#D1E9CE',
          'sage-ink': '#1F5F2E',
          'peach-bg': '#FCD9C4',
          'peach-ink': '#8A4320',
          'sky-bg': '#CDE2F0',
          'sky-ink': '#1F4A6E',
          'rose-bg': '#F7CFD9',
          'rose-ink': '#7C2B47',
          'butter-bg': '#F4E4A1',
          'butter-ink': '#6B5300',
          'slate-bg': '#E2E2DE',
          'slate-ink': '#3D3D3D',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        field: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,10,0.04)',
        lift: '0 8px 24px rgba(10,10,10,0.08)',
        fab: '0 8px 20px rgba(10,10,10,0.18)',
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        title: ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
