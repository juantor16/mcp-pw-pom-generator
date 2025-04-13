/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'atenea-violet': '#675dc6',     // Principal
        'atenea-cyan': '#57c9e8',       // Acento 1
        'atenea-green': '#8bdc65',      // Acento 2
        'atenea-light-gray': '#dde1e9', // Neutro Claro del Manual
        'atenea-dark-bg': '#1f2937',    // Fondo oscuro
        'atenea-dark-card': '#374151',  // Fondo elementos oscuros
        'atenea-dark-text': '#F3F4F6',  // Texto claro sobre oscuro
        'atenea-dark-border': '#4b5563',// Bordes oscuros
        'atenea-light-text': '#111827', // Texto oscuro sobre claro
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 