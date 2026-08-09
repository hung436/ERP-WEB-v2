/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D92D20',
          redHover: '#B42318',
          redActive: '#912018',
          redSoft: '#FEF3F2',
          blueSoft: '#E8F2FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
        },
        sidebar: '#EAF4FF',
        page: '#EAF3FB',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.06)',
        card: '0 4px 12px rgba(16, 24, 40, 0.08)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
};
