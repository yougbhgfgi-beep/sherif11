/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        'romantic-dark': '#120814',      // خلفية داكنة مائلة للبنفسجي
        'romantic-primary': '#be123c',   // لون الورد الأحمر الداكن (Rose)
        'romantic-accent': '#fb7185',    // لون وردي ناعم (Blush)
        'romantic-gold': '#d4af37',      // ذهبي كلاسيكي
        'romantic-glass': 'rgba(30, 10, 30, 0.4)', // زجاجي غامق
        'romantic-border': 'rgba(251, 113, 133, 0.2)', // حدود وردية خفيفة
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'], // خط إضافي للعناوين الفخمة
      },
      backgroundImage: {
        'romantic-gradient': 'linear-gradient(to bottom, #120814, #1a0b1e)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}